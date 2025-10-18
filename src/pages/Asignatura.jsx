// src/pages/Asignaturas.jsx
import React, { useEffect, useState } from "react";
import * as API from "../services/data";
import Swal from "sweetalert2";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export function Asignaturas() {
  const [asignaturas, setAsignaturas] = useState([]);
  const [profesores, setProfesores] = useState([]);
  const [loading, setLoading] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [currentAsignatura, setCurrentAsignatura] = useState({
    id: null,
    nombre: "",
    creditos: "",
    profesor: "", 
  });

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const columnasDisponibles = [
    { key: "id", label: "ID" },
    { key: "nombre", label: "Nombre" },
    { key: "creditos", label: "Créditos" },
    { key: "profesor", label: "Profesor" },
  ];

  const [isColumnsModalOpen, setIsColumnsModalOpen] = useState(false);
  const [selectedColumns, setSelectedColumns] = useState(
    columnasDisponibles.map((c) => c.key)
  );

  // Toast
  const Toast = Swal.mixin({
    toast: true,
    position: "top-end",
    showConfirmButton: false,
    timer: 2200,
    timerProgressBar: true,
  });

  const fetchAsignaturas = () => {
    setLoading(true);
    API.getAllAsignatura()
      .then((data) => {
        setAsignaturas(data || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  };

  const fetchProfesores = () => {
    API.getProfesores()
      .then((data) => setProfesores(data || []))
      .catch((err) => console.error("Error al cargar profesores:", err));
  };

  useEffect(() => {
    fetchAsignaturas();
    fetchProfesores();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [asignaturas.length]);

  const handleAgregar = () => {
    setCurrentAsignatura({ id: null, nombre: "", creditos: "", profesor: "" });
    setModalOpen(true);
  };

  const handleEditar = (a) => {
    setCurrentAsignatura({
      id: a.id,
      nombre: a.nombre,
      creditos: a.creditos,
      profesor: a.profesor, // debe venir del backend
    });
    setModalOpen(true);
  };

  const handleEliminar = (id) => {
    Swal.fire({
      title: "¿Está seguro?",
      text: "Esta acción no se puede deshacer",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    }).then((r) => {
      if (r.isConfirmed) {
        API.eliminarAsignatura(id)
          .then(() => {
            Swal.fire("Eliminado", "La asignatura fue eliminada", "success");
            fetchAsignaturas();
          })
          .catch((err) => Swal.fire("Error", err.message, "error"));
      }
    });
  };

  const handleModalSubmit = (e) => {
    e.preventDefault();
    const { id, nombre, creditos, profesor } = currentAsignatura;

    if (!nombre || !creditos || !profesor) {
      Swal.fire("Error", "Todos los campos son obligatorios", "warning");
      return;
    }

      const payloadInsert = {
      nombre,
      creditos: Number(creditos),
      profesor, // se envía el nombre
    };

    const payloadUpdate = {
      id: Number(id),
      nombre,
      creditos: Number(creditos),
      profesor, // también el nombre
    };

    const isEdit = id != null && id !== "";
    const op = isEdit
      ? API.actualizarAsignatura(payloadUpdate)
      : API.insertarAsignatura(payloadInsert);

    op
      .then(() => {
        setModalOpen(false);
        fetchAsignaturas();
        Toast.fire({
          icon: "success",
          title: isEdit
            ? "Asignatura actualizada correctamente"
            : "Asignatura agregada correctamente",
        });
      })
      .catch((err) => Swal.fire("Error", err.message, "error"));
  };

  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentItems = asignaturas.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(asignaturas.length / itemsPerPage) || 1;

  const handleExport = (type) => {
    const dataToExport = asignaturas.map((a) =>
      selectedColumns.reduce((obj, key) => {
        obj[key] = a[key] ?? "";
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
      XLSX.utils.book_append_sheet(wb, ws, "Asignaturas");
      XLSX.writeFile(wb, "Asignaturas.xlsx");
    } else {
      const doc = new jsPDF();
      doc.setFontSize(16);
      doc.text("Listado de Asignaturas", 14, 20);

      const head = columnasDisponibles
        .filter((c) => selectedColumns.includes(c.key))
        .map((c) => c.label);

      const body = dataToExport.map((a) =>
        selectedColumns.map((k) => String(a[k] ?? ""))
      );

      autoTable(doc, {
        head: [head],
        body,
        startY: 30,
        styles: { fontSize: 10 },
        headStyles: { fillColor: [41, 128, 185] },
      });

      doc.save("Asignaturas.pdf");
    }

    setIsColumnsModalOpen(false);
  };

  const toggleColumn = (key) => {
    setSelectedColumns((prev) =>
      prev.includes(key) ? prev.filter((c) => c !== key) : [...prev, key]
    );
  };

  const isEditing = currentAsignatura?.id != null && currentAsignatura?.id !== "";

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4>Asignaturas</h4>
        <div>
          <button className="btn btn-success me-2" onClick={handleAgregar}>
            Agregar Asignatura
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
                  <th key={`col-${col.key}`}>{col.label}</th>
                ))}
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {currentItems.map((a) => (
                <tr key={a.id}>
                  <td>{a.id}</td>
                  <td>{a.nombre}</td>
                  <td>{a.creditos}</td>
                  <td>{a.profesor}</td>
                  <td>
                    <button
                      className="btn btn-primary btn-sm me-2"
                      onClick={() => handleEditar(a)}
                    >
                      Editar
                    </button>
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => handleEliminar(a.id)}
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
                  key={`page-${i + 1}`}
                  className={`page-item ${currentPage === i + 1 ? "active" : ""}`}
                >
                  <button className="page-link" onClick={() => setCurrentPage(i + 1)}>
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
                  {isEditing ? "Editar Asignatura" : "Agregar Asignatura"}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setModalOpen(false)}
                ></button>
              </div>

              <form onSubmit={handleModalSubmit}>
                <div className="modal-body">
                  {isEditing && (
                    <div className="mb-3">
                      <label className="form-label">ID:</label>
                      <input
                        type="text"
                        className="form-control"
                        value={currentAsignatura.id}
                        readOnly
                        disabled
                      />
                    </div>
                  )}

                  <div className="mb-3">
                    <label className="form-label">Nombre:</label>
                    <input
                      type="text"
                      className="form-control"
                      value={currentAsignatura.nombre}
                      onChange={(e) =>
                        setCurrentAsignatura({
                          ...currentAsignatura,
                          nombre: e.target.value,
                        })
                      }
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Créditos:</label>
                    <input
                      type="number"
                      className="form-control"
                      value={currentAsignatura.creditos}
                      onChange={(e) =>
                        setCurrentAsignatura({
                          ...currentAsignatura,
                          creditos: e.target.value,
                        })
                      }
                      required
                      min="1"
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Profesor:</label>
                    <select
                      className="form-select"
                      value={currentAsignatura.profesor}
                      onChange={(e) =>
                        setCurrentAsignatura({
                          ...currentAsignatura,
                          profesor: e.target.value,
                        })
                      }
                      required
                    >
                      <option value="">Seleccione un profesor</option>
                      {profesores.map((p) => (
                        <option key={p.usuario} value={p.usuario}>
                          {p.usuario}
                        </option>
                      ))}
                    </select>
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

      {/* Modal de columnas */}
      {isColumnsModalOpen && (
        <div className="modal show d-block" tabIndex="-1">
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Seleccionar columnas</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setIsColumnsModalOpen(false)}
                ></button>
              </div>
              <div className="modal-body">
                {columnasDisponibles.map((col) => (
                  <div className="form-check" key={`chk-${col.key}`}>
                    <input
                      className="form-check-input"
                      type="checkbox"
                      checked={selectedColumns.includes(col.key)}
                      onChange={() => toggleColumn(col.key)}
                    />
                    <label className="form-check-label">{col.label}</label>
                  </div>
                ))}
              </div>
              <div className="modal-footer">
                <button
                  className="btn btn-primary"
                  onClick={() => handleExport("excel")}
                >
                  Exportar a Excel
                </button>
                <button
                  className="btn btn-secondary"
                  onClick={() => handleExport("pdf")}
                >
                  Exportar a PDF
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
