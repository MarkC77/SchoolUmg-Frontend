// ==========================================
// 🌍 CONFIGURACIÓN BASE SEGÚN EL ENTORNO
// ==========================================
const API_URL =
  import.meta.env.VITE_API_BASE || "http://localhost:5219/api";

// Función auxiliar para manejar respuestas y errores
async function handleResponse(res) {
  const text = await res.text();
  if (!res.ok) throw new Error(`Error ${res.status}: ${text}`);
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

// ==========================================
// 🧩 AUTENTICACIÓN
// ==========================================
export async function login(usuario, pass) {
  const datos = { usuario, pass };
  const res = await fetch(`${API_URL}/autenticacion`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(datos),
  });
  return handleResponse(res);
}

// ==========================================
// 🧑‍🏫 ALUMNOS Y MATRÍCULAS
// ==========================================
export async function alumnoProfesor(usuario) {
  const res = await fetch(`${API_URL}/getAlumnosProfesor?usuario=${usuario}`);
  return handleResponse(res);
}

export async function getAlumno(id) {
  const res = await fetch(`${API_URL}/getAlumno?id=${id}`);
  return handleResponse(res);
}

export async function insertarAlumnoMatricular(alumno, id_asig) {
  const url = `${API_URL}/insertarMatricular?id_asig=${id_asig}`;
  const body = {
    dni: alumno.dni,
    nombre: alumno.nombre,
    direccion: alumno.direccion,
    edad: Number(alumno.edad),
    email: alumno.email,
  };
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return handleResponse(res);
}

export async function actualizarAlumno(alumno) {
  const res = await fetch(`${API_URL}/actualizarAlumno`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(alumno),
  });
  return handleResponse(res);
}

export async function eliminarAlumno(id) {
  const res = await fetch(`${API_URL}/eliminarAlumno?id=${id}`, {
    method: "DELETE",
  });
  return handleResponse(res);
}

// ==========================================
// 📘 ASIGNATURAS
// ==========================================
export async function getAsignaturas() {
  const res = await fetch(`${API_URL}/getAsignaturas`);
  return handleResponse(res);
}

export async function getAllAsignatura() {
  const res = await fetch(`${API_URL}/getAllAsignaturas`);
  return handleResponse(res);
}

export async function getAsignaturaId(id) {
  const res = await fetch(`${API_URL}/getAsignaturaById?id=${id}`);
  return handleResponse(res);
}

export async function insertarAsignatura(asignatura) {
  const res = await fetch(`${API_URL}/insertarAsignatura`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      nombre: asignatura.nombre,
      creditos: Number(asignatura.creditos),
      profesor: asignatura.profesor || null,
    }),
  });
  return handleResponse(res);
}

export async function actualizarAsignatura(asignatura) {
  const res = await fetch(
    `${API_URL}/actualizarAsignatura?id=${asignatura.id}`,
    {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(asignatura),
    }
  );
  return handleResponse(res);
}

export async function eliminarAsignatura(id) {
  const res = await fetch(`${API_URL}/eliminarAsignatura?id=${id}`, {
    method: "DELETE",
  });
  return handleResponse(res);
}

// ==========================================
// 🧾 CALIFICACIONES
// ==========================================
export async function getCalificacionesProfesor(usuario) {
  const res = await fetch(`${API_URL}/calificaciones/profesor/${usuario}`);
  return handleResponse(res);
}

export async function insertarCalificacion(calificacion) {
  const res = await fetch(`${API_URL}/insertCalificacion`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      descripcion: calificacion.descripcion,
      nota: Number(calificacion.nota),
      porcentaje: Number(calificacion.porcentaje || 0),
      matriculaId: Number(calificacion.matriculaId),
    }),
  });
  return handleResponse(res);
}

export async function actualizarCalificacion(calificacion) {
  if (!calificacion.id)
    throw new Error("Falta el id de la calificación para actualizar");

  const res = await fetch(
    `${API_URL}/actualizarCalificacion/${calificacion.id}`,
    {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(calificacion),
    }
  );
  return handleResponse(res);
}

export async function eliminarCalificacion(id) {
  const res = await fetch(`${API_URL}/eliminarCalificacion/${id}`, {
    method: "DELETE",
  });
  return handleResponse(res);
}

// ==========================================
// 👨‍🏫 PROFESORES
// ==========================================
export async function getProfesores() {
  const res = await fetch(`${API_URL}/profesores`);
  return handleResponse(res);
}

export async function getProfesor(usuario) {
  const res = await fetch(`${API_URL}/profesor/${usuario}`);
  return handleResponse(res);
}

export async function insertarProfesor(profesor) {
  const res = await fetch(`${API_URL}/profesor`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(profesor),
  });
  return handleResponse(res);
}

export async function actualizarProfesor(usuario, profesor) {
  const res = await fetch(`${API_URL}/profesor/${usuario}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(profesor),
  });
  return handleResponse(res);
}

export async function eliminarProfesor(usuario) {
  const res = await fetch(`${API_URL}/profesor/${usuario}`, {
    method: "DELETE",
  });
  return handleResponse(res);
}

// ==========================================
// 📊 GRAFICAS
// ==========================================
export async function getAlumnosPorAsignatura() {
  const res = await fetch(`${API_URL}/getAlumnosPorAsignatura`);
  return handleResponse(res);
}

export async function getDistribucionCalificaciones() {
  const res = await fetch(`${API_URL}/getDistribucionCalificaciones`);
  return handleResponse(res);
}

// ==========================================
// 💵 FACTURAS
// ==========================================
export async function getFactura1() {
  const res = await fetch(`${API_URL}/getFacturas`);
  return handleResponse(res);
}

export async function getFactura2(id) {
  const res = await fetch(`${API_URL}/getFacturasId?id=${id}`);
  return handleResponse(res);
}

export async function insertarFactura(factura) {
  const res = await fetch(`${API_URL}/insertarFacturas`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(factura),
  });
  return handleResponse(res);
}

export async function actualizarFacturas(facturas) {
  const res = await fetch(`${API_URL}/actualizarFacturas`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(facturas),
  });
  return handleResponse(res);
}

export async function eliminarFacturas(id) {
  const res = await fetch(`${API_URL}/eliminarFacturas?id=${id}`, {
    method: "DELETE",
  });
  return handleResponse(res);
}

// ==========================================
// 🧍 CLIENTES
// ==========================================
export async function getClientes1() {
  const res = await fetch(`${API_URL}/getClientes`);
  return handleResponse(res);
}

export async function getClientes2(id) {
  const res = await fetch(`${API_URL}/getClientesId?id=${id}`);
  return handleResponse(res);
}

export async function insertarCliente(cliente) {
  const res = await fetch(`${API_URL}/insertarClientes`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(cliente),
  });
  return handleResponse(res);
}

export async function actualizarCliente(cliente) {
  const res = await fetch(`${API_URL}/actualizarClientes`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(cliente),
  });
  return handleResponse(res);
}

export async function eliminarCliente(id) {
  const res = await fetch(`${API_URL}/eliminarClientes/${id}`, {
    method: "DELETE",
  });
  return handleResponse(res);
}

// ==========================================
// 📦 PRODUCTOS
// ==========================================
export async function getProductos() {
  const res = await fetch(`${API_URL}/getProductos`);
  return handleResponse(res);
}

export async function getProducto(id) {
  const res = await fetch(`${API_URL}/getProductoId?id=${id}`);
  return handleResponse(res);
}

export async function insertarProducto(producto) {
  const res = await fetch(`${API_URL}/insertarProducto`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(producto),
  });
  return handleResponse(res);
}

export async function actualizarProducto(producto) {
  const res = await fetch(`${API_URL}/actualizarProducto`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(producto),
  });
  return handleResponse(res);
}

export async function eliminarProducto(id) {
  const res = await fetch(`${API_URL}/eliminarProducto?id=${id}`, {
    method: "DELETE",
  });
  return handleResponse(res);
}

// ==========================================
// 🏭 PROVEEDORES
// ==========================================
export async function getProveedores() {
  const res = await fetch(`${API_URL}/Proveedores`);
  return handleResponse(res);
}

export async function getProveedor(id) {
  const res = await fetch(`${API_URL}/Proveedores/${id}`);
  return handleResponse(res);
}

export async function insertarProveedor(proveedor) {
  const res = await fetch(`${API_URL}/Proveedores`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(proveedor),
  });
  return handleResponse(res);
}

export async function actualizarProveedor(proveedor) {
  const res = await fetch(`${API_URL}/Proveedores/${proveedor.idproveedor}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(proveedor),
  });
  return handleResponse(res);
}

export async function eliminarProveedor(id) {
  const res = await fetch(`${API_URL}/Proveedores/${id}`, {
    method: "DELETE",
  });
  return handleResponse(res);
}
