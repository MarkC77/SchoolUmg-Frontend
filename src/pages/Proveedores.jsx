import React, { useEffect, useState } from "react";
import * as API from "../services/data";
import Swal from "sweetalert2";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export function Proveedores() {
  const [proveedores, setProveedores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [currentProveedor, setCurrentProveedor] = useState({
    idproveedor: null,
    descripcion: "",
    nit: 0,
    direccion: "",
    estado: "",
  });

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const columnasDisponibles = [
    { key: "idproveedor", label: "ID" },
    { key: "descripcion", label: "Descripción" },
    { key: "nit", label: "NIT" },
    { key: "direccion", label: "Dirección" },
    { key: "estado", label: "Estado" },
  ];

  const [isColumnsModalOpen, setIsColumnsModalOpen] = useState(false);
  const [selectedColumns, setSelectedColumns] = useState(
    columnasDisponibles.map((c) => c.key)
  );

  // Cargar proveedores
  const fetchProveedor = () => {
    setLoading(true);
    API.getProveedores()
      .then((data) => {
        setProveedores(data || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error al obtener proveedores:", err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchProveedor();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [proveedores.length]);

  const Toast = Swal.mixin({
    toast: true,
    position: "top-end",
    showConfirmButton: false,
    timer: 2500,
    timerProgressBar: true,
  });

  // --- Modal Agregar ---
  const handleAgregar = () => {
    setCurrentProveedor({
      idproveedor: null,
      descripcion: "",
      nit: 0,
      direccion: "",
      estado: "",
    });
    setModalOpen(true);
  };

  // --- Modal Editar ---
  const handleEditar = (proveedor) => {
    setCurrentProveedor(proveedor);
    setModalOpen(true);
  };

  // --- Eliminar ---
  const handleEliminar = (idproveedor) => {
    Swal.fire({
      title: "¿Está seguro?",
      text: "Esta acción no se puede deshacer",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    }).then((result) => {
      if (result.isConfirmed) {
        API.eliminarProveedor(idproveedor)
          .then(() => {
            Swal.fire("Eliminado", "El proveedor fue eliminado", "success");
            fetchProveedor();
          })
          .catch((err) => Swal.fire("Error", err.message, "error"));
      }
    });
  };

  // --- Guardar ---
  const handleModalSubmit = (e) => {
    e.preventDefault();

    if (currentProveedor.idproveedor) {
      API.actualizarProveedor(currentProveedor)
        .then(() => {
          setModalOpen(false);
          fetchProveedor();
          Toast.fire({
            icon: "success",
            title: "Proveedor actualizado correctamente",
          });
        })
        .catch((err) => Swal.fire("Error", err.message, "error"));
    } else {
      API.insertarProveedor(currentProveedor)
        .then(() => {
          setModalOpen(false);
          fetchProveedor();
          Toast.fire({
            icon: "success",
            title: "Proveedor agregado correctamente",
          });
        })
        .catch((err) => Swal.fire("Error", err.message, "error"));
    }
  };

  // Paginación
  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentItems = proveedores.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(proveedores.length / itemsPerPage) || 1;

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4>Proveedores</h4>
        <div>
          <button className="btn btn-success me-2" onClick={handleAgregar}>
            Agregar Proveedor
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
              {currentItems.map((a) => (
                <tr key={a.idproveedor}>
                  <td>{a.idproveedor}</td>
                  <td>{a.descripcion}</td>
                  <td>{a.nit}</td>
                  <td>{a.direccion}</td>
                  <td>{a.estado}</td>
                  <td>
                    <button
                      className="btn btn-primary btn-sm me-2"
                      onClick={() => handleEditar(a)}
                    >
                      Editar
                    </button>
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => handleEliminar(a.idproveedor)}
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
                  {currentProveedor.idproveedor
                    ? "Editar Proveedor"
                    : "Agregar Proveedor"}
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
                    <label className="form-label">Descripción:</label>
                    <input
                      type="text"
                      className="form-control"
                      value={currentProveedor.descripcion}
                      onChange={(e) =>
                        setCurrentProveedor({
                          ...currentProveedor,
                          descripcion: e.target.value,
                        })
                      }
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label">NIT:</label>
                    <input
                      type="number"
                      className="form-control"
                      value={currentProveedor.nit}
                      onChange={(e) =>
                        setCurrentProveedor({
                          ...currentProveedor,
                          nit: e.target.value,
                        })
                      }
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Dirección:</label>
                    <input
                      type="text"
                      className="form-control"
                      value={currentProveedor.direccion}
                      onChange={(e) =>
                        setCurrentProveedor({
                          ...currentProveedor,
                          direccion: e.target.value,
                        })
                      }
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Estado:</label>
                    <input
                      type="text"
                      className="form-control"
                      value={currentProveedor.estado}
                      onChange={(e) =>
                        setCurrentProveedor({
                          ...currentProveedor,
                          estado: e.target.value,
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
    </div>
  );
}