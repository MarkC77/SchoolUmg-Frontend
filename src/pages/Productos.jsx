// src/pages/Productos.jsx
import React, { useEffect, useState } from "react";
import * as API from "../services/data";
import Swal from "sweetalert2";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export function Productos() {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [currentProducto, setCurrentProducto] = useState({
    descripcion: "",
    stock: "",
    precio: "",
    idcategoria: "",
    fechaingreso: "",
    fechacaducidad: "",
  });

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // categorías estáticas
  const categorias = [
    { id: 1, nombre: "Carnes" },
    { id: 2, nombre: "Lácteos" },
    { id: 3, nombre: "Bebidas" },
    { id: 4, nombre: "Frutas" },
    { id: 5, nombre: "Verduras" },
    { id: 6, nombre: "Hogar" },
  ];

  // columnas disponibles para exportación
  const columnasDisponibles = [
    { key: "idproducto", label: "ID" },
    { key: "descripcion", label: "Descripción" },
    { key: "stock", label: "Stock" },
    { key: "precioventa", label: "Precio" },
    { key: "idcategoria", label: "Categoría" },
    { key: "fechaingreso", label: "Ingreso" },
    { key: "fechacaducidad", label: "Caducidad" },
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

  const fetchProductos = () => {
    setLoading(true);
    API.getProductos()
      .then((data) => {
        setProductos(data || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchProductos();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [productos.length]);

  // Abrir modal agregar
  const handleAgregar = () => {
    setCurrentProducto({
    idproducto: null,
    descripcion: "",
    stock: "",
    precioventa: 0,
    idcategoria: 0,
    fechaingreso: "",
    fechacaducidad: "", 
    });
    setModalOpen(true);
  };

  // Abrir modal editar
  const handleEditar = (Prod) => {
    setCurrentProducto({
        idproducto: Prod.idproducto,
    descripcion: Prod.descripcion,
    stock: Prod.stock,
    precioventa: Prod.precioventa,
    idcategoria: Prod.idcategoria,
    fechaingreso: Prod.fechaingreso,
    fechacaducidad: Prod.fechacaducidad,
    });
    setModalOpen(true);
  };

  // Eliminar
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
        API.eliminarProducto(id)
          .then(() => {
            Swal.fire("Eliminado", "El producto fue eliminado", "success");
            fetchProductos();
          })
          .catch((err) => Swal.fire("Error", err.message, "error"));
      }
    });
  };

  // Guardar (crear/actualizar)
  const handleModalSubmit = (e) => {
    e.preventDefault();

    const {
      idproducto,
      descripcion,
      stock,
      precioventa,
      idcategoria,
      fechaingreso,
      fechacaducidad,
    } = currentProducto;

    if (
      !descripcion ||
      !stock ||
      !precioventa ||
      !idcategoria ||
      !fechaingreso ||
      !fechacaducidad
    ) {
      Swal.fire("Error", "Todos los campos son obligatorios", "warning");
      return;
    }
idproducto
    const isEdit = idproducto != null && idproducto !== "";

    const payloadInsert = {
      descripcion,
      stock: Number(stock),
      precioventa: Number(precioventa),
      idcategoria: Number(idcategoria),
      fechaingreso,
      fechacaducidad,
    };

    const payloadUpdate = {
      idproducto: Number(idproducto),
      descripcion: String(descripcion),
      stock: Number(stock),
      precioventa: Number(precioventa),
      idcategoria: Number(idcategoria),
      fechaingreso,
      fechacaducidad,
    };

    const op = isEdit
      ? API.actualizarProducto(payloadUpdate)
      : API.insertarProducto(payloadInsert);

    op
      .then(() => {
        setModalOpen(false);
        fetchProductos();
        Toast.fire({
          icon: "success",
          title: isEdit
            ? "Producto actualizado correctamente"
            : "Producto agregado correctamente",
        });
      })
      .catch((err) => Swal.fire("Error", err.message, "error"));
  };

  // Paginación
  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentItems = productos.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(productos.length / itemsPerPage) || 1;

  // Exportar
  const handleExport = (type) => {
    const dataToExport = productos.map((p) =>
      selectedColumns.reduce((obj, key) => {
        obj[key] = p[key] ?? "";
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
      XLSX.utils.book_append_sheet(wb, ws, "Productos");
      XLSX.writeFile(wb, "Productos.xlsx");
    } else {
      const doc = new jsPDF();
      doc.setFontSize(16);
      doc.text("Listado de Productos", 14, 20);

      const head = columnasDisponibles
        .filter((c) => selectedColumns.includes(c.key))
        .map((c) => c.label);

      const body = dataToExport.map((p) =>
        selectedColumns.map((k) => String(p[k] ?? ""))
      );

      autoTable(doc, {
        head: [head],
        body,
        startY: 30,
        styles: { fontSize: 10 },
        headStyles: { fillColor: [41, 128, 185] },
      });

      doc.save("Productos.pdf");
    }

    setIsColumnsModalOpen(false);
  };

  const toggleColumn = (key) => {
    setSelectedColumns((prev) =>
      prev.includes(key) ? prev.filter((c) => c !== key) : [...prev, key]
    );
  };

  const nombreCategoria = (id) =>
    categorias.find((c) => c.id === Number(id))?.nombre ?? id;

  const isEditing =
    currentProducto?.idProducto != null && currentProducto?.idProducto !== "";

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4>Productos</h4>
        <div>
          <button className="btn btn-success me-2" onClick={handleAgregar}>
            Agregar Producto
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
              {currentItems.map((p) => (
                <tr key={p.idproducto}>
                  <td>{p.idproducto}</td>
                  <td>{p.descripcion}</td>
                  <td>{p.stock}</td>
                  <td>{p.precioventa}</td>
                  <td>{nombreCategoria(p.idcategoria)}</td>
                  <td>{p.fechaingreso}</td>
                  <td>{p.fechacaducidad}</td>
                  <td>
                    <button
                      className="btn btn-primary btn-sm me-2"
                      onClick={() => handleEditar(p)}
                    >
                      Editar
                    </button>
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => handleEliminar(p.idproducto)}
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
                  className={`page-item ${
                    currentPage === i + 1 ? "active" : ""
                  }`}
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
                  {isEditing ? "Editar Producto" : "Agregar Producto"}
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
                      <label className="form-label">ID Producto:</label>
                      <input
                        type="text"
                        className="form-control"
                        value={currentProducto.idproducto}
                        readOnly
                        disabled
                      />
                    </div>
                  )}

                  <div className="mb-3">
                    <label className="form-label">Descripción:</label>
                    <input
                      type="text"
                      className="form-control"
                      value={currentProducto.descripcion}
                      onChange={(e) =>
                        setCurrentProducto({
                          ...currentProducto,
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
                      value={currentProducto.stock}
                      onChange={(e) =>
                        setCurrentProducto({
                          ...currentProducto,
                          stock: e.target.value,
                        })
                      }
                      required
                      min="0"
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Precio:</label>
                    <input
                      type="number"
                      step="0.01"
                      className="form-control"
                      value={currentProducto.precioventa}
                      onChange={(e) =>
                        setCurrentProducto({
                          ...currentProducto,
                          precioventa: e.target.value,
                        })
                      }
                      required
                      min="0"
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Categoría:</label>
                    <select
                      className="form-select"
                      value={currentProducto.idcategoria}
                      onChange={(e) =>
                        setCurrentProducto({
                          ...currentProducto,
                          idcategoria: e.target.value,
                        })
                      }
                      required
                    >
                      <option value="">Seleccione categoría</option>
                      {categorias.map((c) => (
                        <option key={`cat-${c.id}`} value={c.id}>
                          {c.nombre}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Fecha de Ingreso:</label>
                    <input
                      type="datetime-local"
                      className="form-control"
                      value={currentProducto.fechaingreso}
                      onChange={(e) =>
                        setCurrentProducto({
                          ...currentProducto,
                          fechaingreso: e.target.value,
                        })
                      }
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Fecha de Caducidad:</label>
                    <input
                      type="datetime-local"
                      className="form-control"
                      value={currentProducto.fechacaducidad}
                      onChange={(e) =>
                        setCurrentProducto({
                          ...currentProducto,
                          fechacaducidad: e.target.value,
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
                  <div key={`col-${col.key}`} className="form-check">
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
