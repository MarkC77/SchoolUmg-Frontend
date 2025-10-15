import React, { useEffect, useState } from "react";
import * as API from "../services/data";
import Swal from "sweetalert2";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export function Clientes() {
  const [Clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [currentCliente, setcurrentCliente] = useState({
    idclientes: null,
    direccion: "",
    telefono: 0,
    email: "", // id de la asignatura seleccionada
  });

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const usuario = localStorage.getItem("usuario");

  // columnas disponibles para exportación
  const columnasDisponibles = [
    { key: "idclientes", label: "ID" },
    { key: "direccion", label: "Dirección" },
    { key: "telefono", label: "#Tel:" },
    { key: "email", label: "E-mail" },
  ];

  const [isColumnsModalOpen, setIsColumnsModalOpen] = useState(false);
  const [selectedColumns, setSelectedColumns] = useState(
    columnasDisponibles.map((c) => c.key)
  );

  // --- helpers para cargar datos ---
  const fetchClientes = () => {
    setLoading(true);
    API.getClientes1()
      .then((data) => {
        setClientes(data || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchClientes();
     }, []);

  // resetear página si cambia el total
  useEffect(() => {
    setCurrentPage(1);
  }, [Clientes.length]);

  // --- Toast (SweetAlert2) ---
  const Toast = Swal.mixin({
    toast: true,
    position: "top-end",
    showConfirmButton: false,
    timer: 2500,
    timerProgressBar: true,
  });

  // --- Modal: agregar ---
  const handleAgregar = () => {
    setcurrentCliente({
    idclientes: null,
    direccion: "",
    telefono: 0,
    email: "", // id de la asignatura seleccionada
    });
    setModalOpen(true);
  };

  // --- Modal: editar ---
  const handleEditar = (clientes) => {
    setcurrentCliente({
    idclientes: clientes.idclientes,
    descripcion: clientes.descripcion,
    telefono: clientes.telefono,
    email: clientes.email,
    });
    setModalOpen(true);
  };

  // --- eliminar ---
  const handleEliminar = (idclientes) => {
    Swal.fire({
      title: "¿Está seguro?",
      text: "Esta acción no se puede deshacer",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    }).then((result) => {
      if (result.isConfirmed) {
        API.eliminarCliente(idclientes)
          .then(() => {
            Swal.fire("Eliminado", "El alumno fue eliminado", "success");
            fetch();
          })
          .catch((err) => Swal.fire("Error", err.message, "error"));
      }
    });
  };

  // --- guardar (crear/actualizar) ---
  const handleModalSubmit = (e) => {
    e.preventDefault();
    const { idclientes, direccion, telefono, email} = currentCliente;

    if (idclientes) {
      API.actualizarCliente(currentCliente)
        .then(() => {
          setModalOpen(false);
          fetchClientes();
          Toast.fire({
            icon: "success",
            title: "Alumno actualizado correctamente",
          });
        })
        .catch((err) => Swal.fire("Error", err.message, "error"));
    } else {
      API.insertarCliente(currentCliente)
        .then(() => {
          setModalOpen(false);
          fetchClientes();
          Toast.fire({
            icon: "success",
            title: "Alumno insertado y matriculado",
          });
        })
        .catch((err) => Swal.fire("Error", err.message, "error"));
    }
  };

  // Paginación
  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentClientes = Clientes.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(Clientes.length / itemsPerPage) || 1;

  // Exportar
  const handleExport = (type) => {
    const dataToExport = Clientes.map((al) =>
      selectedColumns.reduce((obj, key) => {
        obj[key] = al[key] ?? "";
        return obj;
      }, {})
    );

    if (dataToExport.length === 0) {
      Swal.fire("Aviso", "No hay datos para exportar", "info");
      return;
    }

    if (type === "excel") {
      const ws = XLSX.utils.json_to_sheet(dataToExport);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Clientes");
      XLSX.writeFile(wb, "Clientes.xlsx");
    } else {
      const doc = new jsPDF();
      doc.setFontSize(16);
      doc.text("Listado de Alumnos", 14, 20);

      const head = columnasDisponibles
        .filter((c) => selectedColumns.includes(c.key))
        .map((c) => c.label);

      const body = dataToExport.map((a) =>
        selectedColumns.map((key) => String(a[key] ?? ""))
      );

      autoTable(doc, {
        head: [head],
        body,
        startY: 30,
        styles: { fontSize: 10 },
        headStyles: { fillColor: [41, 128, 185] },
      });

      doc.save("Clientes.pdf");
    }

    setIsColumnsModalOpen(false);
  };

  const toggleColumn = (key) => {
    setSelectedColumns((prev) =>
      prev.includes(key) ? prev.filter((c) => c !== key) : [...prev, key]
    );
  };

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4>Clientes</h4>
        <div>
          <button className="btn btn-success me-2" onClick={handleAgregar}>
            Agregar Clientes
          </button>
          <button
            className="btn btn-secondary"
            onClick={() => setIsColumnsModalOpen(true)}
          >
            Exportar
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center">Cargando...</div>
      ) : (
        <>
          <table className="table table-striped table-hover table-bordered">
            <thead className="table-dark">
              <tr>
                {columnasDisponibles.map((col) => (
                  <th key={col.key}>{col.label}</th>
                ))}
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {currentClientes.map((a) => (
                <tr key={a.idclientes}>
                  <td>{a.idclientes}</td>
                  <td>{a.direccion}</td>
                  <td>{a.telefono}</td>
                  <td>{a.email}</td>
                  <td>
                    <button
                      className="btn btn-primary btn-sm me-2"
                      onClick={() => handleEditar(a)}
                    >
                      Editar
                    </button>
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => handleEliminar(a.idclientes)}
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Paginación */}
          <nav>
            <ul className="pagination justify-content-center">
              {Array.from({ length: totalPages }, (_, i) => (
                <li
                  key={i}
                  className={`page-item ${currentPage === i + 1 ? "active" : ""}`}
                >
                  <button
                    className="page-link"
                    onClick={() => setCurrentPage(i + 1)}
                  >
                    {i + 1}
                  </button>
                </li>
              ))}
            </ul>
          </nav>
        </>
      )}

      {/* Modal Agregar/Editar */}
      {modalOpen && (
        <div className="modal show d-block" tabIndex="-1">
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {currentCliente.id ? "Editar Alumno" : "Agregar Alumno"}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setModalOpen(false)}
                ></button>
              </div>

              <form onSubmit={handleModalSubmit}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">Dirección:</label>
                    <input
                      type="text"
                      className="form-control"
                      value={currentCliente.direccion}
                      onChange={(e) =>
                        setcurrentCliente({
                          ...currentCliente,
                          direccion: e.target.value,
                        })
                      }
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Telefono:</label>
                    <input
                      type="number"
                      className="form-control"
                      value={currentCliente.telefono}
                      onChange={(e) =>
                        setcurrentCliente({
                          ...currentCliente,
                          telefono: e.target.value,
                        })
                      }
                      required
                    />
                  </div>

                    <div className="mb-3">
                    <label className="form-label">E-mail:</label>
                    <input
                      type="text"
                      className="form-control"
                      value={currentCliente.email}
                      onChange={(e) =>
                        setcurrentCliente({
                          ...currentCliente,
                          email: e.target.value,
                        })
                      }
                      required
                    />
                  </div>
                  </div>

                <div className="modal-footer">
                  <button type="submit" className="btn btn-primary">
                    Guardar
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal selección de columnas */}
      {isColumnsModalOpen && (
        <div className="modal show d-block" tabIndex="-1">
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Selecciona columnas para exportar</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setIsColumnsModalOpen(false)}
                ></button>
              </div>

              <div className="modal-body">
                {columnasDisponibles.map((col) => (
                  <div key={col.key} className="form-check">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      id={col.key}
                      checked={selectedColumns.includes(col.key)}
                      onChange={() => toggleColumn(col.key)}
                    />
                    <label className="form-check-label" htmlFor={col.key}>
                      {col.label}
                    </label>
                  </div>
                ))}
              </div>

              <div className="modal-footer">
                <button
                  className="btn btn-success"
                  onClick={() => handleExport("excel")}
                >
                  Exportar Excel
                </button>
                <button
                  className="btn btn-danger"
                  onClick={() => handleExport("pdf")}
                >
                  Exportar PDF
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}