import React, { useEffect, useState } from "react";
import * as API from "../services/data";
import Swal from "sweetalert2";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export function Facturas() {
  const [facturas, setFacturas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [currentFactura, setCurrentFacturas] = useState({
    idfacturas: null,
    descripcion: "",
    stock: "",
    precioventa: 0,
    idcategoria: 0,
    fechaingreso: "",
    fechacaducidad: "", // id de la asignatura seleccionada
  });

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const usuario = localStorage.getItem("usuario");

  // columnas disponibles para exportación
  const columnasDisponibles = [
    { key: "idfacturas", label: "ID" },
    { key: "descripcion", label: "Descripcion" },
    { key: "stock", label: "Stock" },
    { key: "precioventa", label: "Precio" },
    { key: "idcategoria", label: "Categoria" },
    { key: "fechaingreso", label: "Ingreso" },
    { key: "fechacaducidad", label: "Caducidad" },
  ];

  const [isColumnsModalOpen, setIsColumnsModalOpen] = useState(false);
  const [selectedColumns, setSelectedColumns] = useState(
    columnasDisponibles.map((c) => c.key)
  );

  // --- helpers para cargar datos ---
  const fetchFacturas = () => {
    setLoading(true);
    API.getFactura1()
      .then((data) => {
        setFacturas(data || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchFacturas();
     }, []);

  // resetear página si cambia el total
  useEffect(() => {
    setCurrentPage(1);
  }, [facturas.length]);

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
    setCurrentFacturas({
    idfacturas: null,
    descripcion: "",
    stock: "",
    precioventa: 0,
    idcategoria: 0,
    fechaingreso: "",
    fechacaducidad: "", // id de la asignatura seleccionada
    });
    setModalOpen(true);
  };

  // --- Modal: editar ---
  const handleEditar = (facturas) => {
    setCurrentFacturas({
    idfacturas: facturas.idfacturas,
    descripcion: facturas.descripcion,
    stock: facturas.stock,
    precioventa: facturas.precioventa,
    idcategoria: facturas.idcategoria,
    fechaingreso: facturas.fechaingreso,
    fechacaducidad: facturas.fechacaducidad,
    });
    setModalOpen(true);
  };

  // --- eliminar ---
  const handleEliminar = (idfacturas) => {
    Swal.fire({
      title: "¿Está seguro?",
      text: "Esta acción no se puede deshacer",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    }).then((result) => {
      if (result.isConfirmed) {
        API.eliminarFacturas(idfacturas)
          .then(() => {
            Swal.fire("Eliminado", "El alumno fue eliminado", "success");
            fetchFacturas();
          })
          .catch((err) => Swal.fire("Error", err.message, "error"));
      }
    });
  };

  // --- guardar (crear/actualizar) ---
  const handleModalSubmit = (e) => {
    e.preventDefault();
    const { idfacturas, descripcion, stock, idcategoria, fechaingreso, fechacaducidad } = currentFactura;

    if (idfacturas) {
      API.actualizarFacturas(currentFactura)
        .then(() => {
          setModalOpen(false);
          fetchFacturas();
          Toast.fire({
            icon: "success",
            title: "Alumno actualizado correctamente",
          });
        })
        .catch((err) => Swal.fire("Error", err.message, "error"));
    } else {
      API.insertarFactura(currentFactura)
        .then(() => {
          setModalOpen(false);
          fetchFacturas();
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
  const currentAlumnos = facturas.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(facturas.length / itemsPerPage) || 1;

  // Exportar
  const handleExport = (type) => {
    const dataToExport = facturas.map((al) =>
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
      XLSX.utils.book_append_sheet(wb, ws, "Facturas");
      XLSX.writeFile(wb, "Facturas.xlsx");
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

      doc.save("Facturas.pdf");
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
        <h4>Facturas</h4>
        <div>
          <button className="btn btn-success me-2" onClick={handleAgregar}>
            Agregar Facturas
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
              {currentAlumnos.map((a) => (
                <tr key={a.idfacturas}>
                  <td>{a.idfacturas}</td>
                  <td>{a.descripcion}</td>
                  <td>{a.stock}</td>
                  <td>{a.precioventa}</td>
                  <td>{a.idcategoria}</td>
                  <td>{a.fechaingreso}</td>
                  <td>{a.fechacaducidad}</td>
                  <td>
                    <button
                      className="btn btn-primary btn-sm me-2"
                      onClick={() => handleEditar(a)}
                    >
                      Editar
                    </button>
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => handleEliminar(a.idfacturas)}
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
                  {currentFactura.id ? "Editar Alumno" : "Agregar Alumno"}
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
                    <label className="form-label">Descripcion:</label>
                    <input
                      type="text"
                      className="form-control"
                      value={currentFactura.descripcion}
                      onChange={(e) =>
                        setCurrentFacturas({
                          ...currentFactura,
                          descripcion: e.target.value,
                        })
                      }
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Stock:</label>
                    <input
                      type="number"
                      className="form-control"
                      value={currentFactura.stock}
                      onChange={(e) =>
                        setCurrentFacturas({
                          ...currentFactura,
                          stock: e.target.value,
                        })
                      }
                      required
                    />
                  </div>

                    <div className="mb-3">
                    <label className="form-label">Precio:</label>
                    <input
                      type="number"
                      className="form-control"
                      value={currentFactura.precioventa}
                      onChange={(e) =>
                        setCurrentFacturas({
                          ...currentFactura,
                          precioventa: e.target.value,
                        })
                      }
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Categoria:</label>
                    <select
                      className="form-control"
                      value={currentFactura.idcategoria}
                      onChange={(e) =>
                        setCurrentFacturas({
                          ...currentFactura,
                          idcategoria: e.target.value,
                        })
                      }
                    ><option value="">
                        Seleccionar categorias
                        </option>
                        <option value="1"> Pendientes</option>
                        <option value="2"> Pagados</option>
                        <option value="3"> Abonado</option>
                    </select>
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Ingreso:</label>
                    <input
                      type="datetime-local"
                      className="form-control"
                      value={currentFactura.fechaingreso}
                      onChange={(e) =>
                        setCurrentFacturas({
                          ...currentFactura,
                          fechaingreso: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Caducidad:</label>
                    <input
                      type="datetime-local"
                      className="form-control"
                      value={currentFactura.fechacaducidad}
                      onChange={(e) =>
                        setCurrentFacturas({
                          ...currentFactura,
                          fechacaducidad: e.target.value,
                        })
                      }
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