const URL = 'http://localhost:5219/api/';

export function login(usuario, pass){
    let datos = {usuario, pass};

    return fetch(URL + 'autenticacion', {
        method: 'POST',
        body: JSON.stringify(datos),
        headers: {
            'Content-Type': 'application/json'
        }
    })
    .then(res =>{
        if(!res.ok) throw new Error('Error en la solicitud'+ res.status);
        return res.text();
    })
    .then(text => text ? text : null);
}

export function alumnoProfesor(usuario){
    return fetch(`${URL}getAlumnosProfesor?usuario=${usuario}`)
    .then(res => {
        if(!res.ok) throw new Error('Error en la solicitud' + res.status);
        return res.json();
    });
}

export function getAlumno(id){
    return fetch(`${URL}getAlumno?id=${id}`)
    .then(res => {
        if(!res.ok) throw new Error('Error en la solicitud' + res.status);
        return res.json();
    });
}

export function insertarAlumnoMatricular(alumno, id_asig){
    const url= `${URL}insertarMatricular?id_asig=${id_asig}`;
    const body ={
        dni: alumno.dni,
        nombre: alumno.nombre,
        direccion: alumno.direccion,
        edad: Number(alumno.edad),
        email: alumno.email
    };

    return fetch(url, {
        method: 'POST',
        body: JSON.stringify(body),
        headers: {
            'Content-Type': 'application/json'
        }
    })
    .then(res => {
        if(!res.ok) throw new Error('Error en la solicitud' + res.status);
        return res.text();
    });
}

export function actualizarAlumno(alumno){
    return fetch(`${URL}actualizarAlumno`, {
        method: 'PUT',
        body: JSON.stringify(alumno),
        headers: {
            'Content-Type': 'application/json'
        }
    })
    .then(res => {
        if(!res.ok) throw new Error('Error en la solicitud' + res.status);
        return res.text();
    });
}

export function eliminarAlumno(id){
    return fetch(`${URL}eliminarAlumno?id=${id}`, {
        method: 'DELETE'
    })
    .then(res => {
        if(!res.ok) throw new Error('Error en la solicitud' + res.status);
        return res.text();
    });
}

/* ASIGNATURAS */

export function getAsignaturas(){
    return fetch(`${URL}getAsignaturas`)
    .then(res => {
        if(!res.ok) throw new Error('Error en la solicitud' + res.status);
        return res.json();
    });
}
// Obtener todas las asignaturas
export function getAllAsignatura() {
  return fetch(`${URL}getAllAsignaturas`)
    .then(res => {
      if (!res.ok) throw new Error('Error en la solicitud: ' + res.status);
      return res.json();
    });
}

// Obtener una asignatura por ID
export function getAsignaturaId(id) {
  return fetch(`${URL}getAsignaturaById?id=${id}`)
    .then(res => {
      if (!res.ok) throw new Error('Error en la solicitud: ' + res.status);
      return res.json();
    });
}

//Insertar nueva asignatura
export function insertarAsignatura(asignatura) {
  const body = {
    nombre: asignatura.nombre,
    creditos: Number(asignatura.creditos),
    profesor: asignatura.profesor || null // opcional
  };

  return fetch(`${URL}insertarAsignatura`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  })
  .then(async (res) => {
    const text = await res.text();
    if (!res.ok) throw new Error(`Error ${res.status}: ${text}`);
    return text;
  });
}


//Actulizar asignatura
export function actualizarAsignatura (asignatura) {
    const body = {
        id: Number(asignatura.id),
        nombre:asignatura.nombre,
        creditos:Number(asignatura.creditos),
        profesor:asignatura.profesor
    };

    return fetch(`${URL}actualizarAsignatura?id=${asignatura.id}`, {
        method: 'PUT',
        headers: {'Content-Type': 'application/json' },
        body: JSON.stringify(body)
    })
    .then(async res => {
        const text = await res.text();
        if (!res.ok) throw new Error(`Error ${res.estatus}: ${text}`);
        return text;
    });
}
    //Eliminar 
    export function eliminarAsignatura(id){
    return fetch(`${URL}eliminarAsignatura?id=${id}`,{
    method: 'DELETE'  
    })
    .then(async res => {
    const text = await res.text();
    if (!res.ok) throw new Error (`Error ${res.status}:${text}`);
    return text;
    });
    }

/* CALificACIONES */

export function getCalificacionesProfesor(usuario){
    return fetch(`${URL}calificaciones/profesor/${usuario}`)
    .then(res => {
        if(!res.ok) throw new Error('Error en la solicitud' + res.status);
        return res.json();
    });
}

export function insertarCalificacion(calificacion){
    const url = `${URL}insertCalificacion`;
    const body = {
        descripcion: calificacion.descripcion,
        nota: Number(calificacion.nota),
        porcentaje: Number(calificacion.porcentaje||0),
        matriculaId: Number(calificacion.matriculaId)
    };

    return fetch(url, {
        method: 'POST',
        body: JSON.stringify(body),
        headers: {
            'Content-Type': 'application/json'
        }
    })
    .then(async res => {
        const text = await res.text();
        if(!res.ok) throw new Error(`Error ${res.status}: ${text}`);
        try{return JSON.parse(text);}catch{return text;}
    });    
}

export function actualizarCalificacion(calificacion){
    if(!calificacion.id)throw new Error("Falta el id de la calificacion para actualizar");

    const url = `${URL}actualizarCalificacion/${calificacion.id}`;
    const body = {
        descripcion: calificacion.descripcion,
        nota: Number(calificacion.nota),
        porcentaje: Number(calificacion.porcentaje||0),
        matriculaId: Number(calificacion.matriculaId)
    };

    return fetch(url, {
        method: 'PUT',
        body: JSON.stringify(body),
        headers: {
            'Content-Type': 'application/json'
        }
    })
    .then(async res => {
        const text = await res.text();
        if(!res.ok) throw new Error(`Error ${res.status}: ${text}`);
        try{return JSON.parse(text);}catch{return text;}
    });
}

export function eliminarCalificacion(id){
    const url = `${URL}eliminarCalificacion/${id}`;

    return fetch(url, {
        method: 'DELETE'
    })
    .then(async res => {
        const text = await res.text();
        if(!res.ok) throw new Error(`Error ${res.status}: ${text}`);
        return text;
    });
}

/* PROFESORES */
export function getProfesores(){
    return fetch(`${URL}profesores`)
    .then(res => {
        if(!res.ok) throw new Error('Error en la solicitud' + res.status);
        return res.json();
    });
}
export function getProfesor(usuario){
    return fetch(`${URL}profesor/${usuario}`)
    .then(res => {
        if(!res.ok) throw new Error('Error en la solicitud' + res.status);
        return res.json();
    });
}

export function insertarProfesor(profesor){
    const url= `${URL}profesor`;
    const body ={
        usuario: profesor.usuario,
        pass: profesor.pass,
        nombre: profesor.nombre,
        email: profesor.email
        
    };
    return fetch(url, {
        method: 'POST',
        body: JSON.stringify(body),
        headers: {
            'Content-Type': 'application/json'
        }
    })
    .then( async res => {
        const text = await res.text();
        if(!res.ok) throw new Error('Error en la solicitud' + res.status + text);
        return text;
    });
}
export function actualizarProfesor(usuario, profesor){
    
    const url = `${URL}profesor/${usuario}`;
    const body = {
        usuario: usuario,
        pass: profesor.pass,
        nombre: profesor.nombre,
        email: profesor.email
        
    };
    return fetch(url, {
        method: 'PUT',
        body: JSON.stringify(body),
        headers: {
            'Content-Type': 'application/json'
        }
    })
    .then( async res => {
        const text = await res.text();
        if(!res.ok) throw new Error('Error en la solicitud' + res.status + text);
        return text;
    });
}
export function eliminarProfesor(usuario){
    return fetch(`${URL}profesor/${usuario}`, {
        method: 'DELETE'
    })
    .then( async res => {
        const text = await res.text();
        if(!res.ok) throw new Error('Error en la solicitud' + res.status + text);
        return text;
    });
}

//---------------------------------------------------------
// GRAFICAS
//---------------------------------------------------------

// Obtener alumnos por asignatura
export function getAlumnosPorAsignatura() {
    return fetch(`${URL}getAlumnosPorAsignatura`)
        .then(res => {
            if (!res.ok) throw new Error('Error en la solicitud: ' + res.status);
            return res.json();
        });
}

// Obtener distribucion de calificaciones
export function getDistribucionCalificaciones() {
    return fetch(`${URL}getDistribucionCalificaciones`)
        .then(res => {
            if (!res.ok) throw new Error("Error en la solicitud: " + res.status);
            return res.json();
        });
}

/* FACTURAS */
export function getFactura1(){
    return fetch(`${URL}getFacturas`)
    .then(res => {
        if(!res.ok) throw new Error('Error en la solicitud' + res.status);
        return res.json();
    });
}
export function getFactura2(id){
    return fetch(`${URL}getFacturasId?id=${id}`)
    .then(res => {
        if(!res.ok) throw new Error('Error en la solicitud' + res.status);
        return res.json();
    });
}

export function insertarFactura(factura){
    const url= `${URL}insertarFacturas`;
    const body ={
  descripcion: factura.descripcion,
  stock: factura.stock,
  precioventa: factura.precioventa,
  idcategoria: factura.idcategoria,
  fechaingreso: factura.fechaingreso,
  fechacaducidad: factura.fechacaducidad,
    };
    return fetch(url, {
        method: 'POST',
        body: JSON.stringify(body),
        headers: {
            'Content-Type': 'application/json'
        }
    })
    .then( async res => {
        const text = await res.text();
        if(!res.ok) throw new Error('Error en la solicitud' + res.status + text);
        return text;
    });
}

export function actualizarFacturas(facturas){
    return fetch(`${URL}actualizarFacturas`, {
        method: 'PUT',
        body: JSON.stringify(facturas),
        headers: {
            'Content-Type': 'application/json'
        }
    })
    .then(res => {
        if(!res.ok) throw new Error('Error en la solicitud' + res.status);
        return res.text();
    });
}

export function eliminarFacturas(id){
    return fetch(`${URL}eliminarFacturas?id=${id}`, {
        method: 'DELETE'
    })
    .then(res => {
        if(!res.ok) throw new Error('Error en la solicitud' + res.status);
        return res.text();
    });
}

/* CLIENTES */
export function getClientes1(){
    return fetch(`${URL}getClientes`)
    .then(res => {
        if(!res.ok) throw new Error('Error en la solicitud' + res.status);
        return res.json();
    });
}
export function getClientes2(id){
    return fetch(`${URL}getClientesId?id=${id}`)
    .then(res => {
        if(!res.ok) throw new Error('Error en la solicitud' + res.status);
        return res.json();
    });
}

export function insertarCliente(cliente){
    const url= `${URL}insertarClientes`;
    const body ={
  idcliente: cliente.idcliente,
  direccion: cliente.direccion,
  telefono: cliente.telefono,
  email: cliente.email
    };
    return fetch(url, {
        method: 'POST',
        body: JSON.stringify(body),
        headers: {
            'Content-Type': 'application/json'
        }
    })
    .then( async res => {
        const text = await res.text();
        if(!res.ok) throw new Error('Error en la solicitud' + res.status + text);
        return text;
    });
}

export function actualizarCliente(cliente){
    return fetch(`${URL}actualizarClientes`, {
        method: 'PUT',
        body: JSON.stringify(cliente),
        headers: {
            'Content-Type': 'application/json'
        }
    })
    .then(res => {
        if(!res.ok) throw new Error('Error en la solicitud' + res.status);
        return res.text();
    });
}

export function eliminarCliente(id){
    const endpoint = `${URL.replace(/\/$/, '')}/eliminarClientes/${id}`; // ID en la ruta
    return fetch(endpoint, { method: 'DELETE' })
        .then(res => {
            if(!res.ok) throw new Error('Error en la solicitud: ' + res.status);
            return res.text(); // o res.json() si tu backend devuelve JSON
        });
}

// ===============================
// PRODUCTOS
// ===============================

function handle(res) {
  if (!res.ok) throw new Error("Error en la solicitud: " + res.status);
  return res.json();
}

export function getProductos() {
  return fetch(`${URL}getProductos`).then(handle);
}

export function getProducto(id) {
  return fetch(`${URL}getProductoId?id=${encodeURIComponent(id)}`).then(handle);
}

export function insertarProducto(producto) {
  return fetch(`${URL}insertarProducto`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      descripcion: producto.descripcion,
      stock: Number(producto.stock),
      precioventa: Number(producto.precioventa), // debe coincidir con el backend
      idcategoria: Number(producto.idcategoria),
      fechaingreso: producto.fechaingreso,
      fechacaducidad: producto.fechacaducidad,
    }),
  }).then(async (res) => {
    if (!res.ok) {
      const text = await res.text();
      throw new Error("Error en la solicitud: " + res.status + " - " + text);
    }
    return res.text();
  });
}

export function actualizarProducto(producto) {
  return fetch(`${URL}actualizarProducto`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      idproducto: Number(producto.idproducto),
      descripcion: producto.descripcion,
      stock: Number(producto.stock),
      precioventa: Number(producto.precioventa),
      idcategoria: Number(producto.idcategoria),
      fechaingreso: producto.fechaingreso,
      fechacaducidad: producto.fechacaducidad,
    }),
  }).then(async (res) => {
    if (!res.ok) {
      const text = await res.text();
      throw new Error("Error en la solicitud: " + res.status + " - " + text);
    }
    return res.text();
  });
}

export function eliminarProducto(id) {
  return fetch(`${URL}eliminarProducto?id=${encodeURIComponent(id)}`, {
    method: "DELETE",
  }).then(async (res) => {
    if (!res.ok) {
      const text = await res.text();
      throw new Error("Error en la solicitud: " + res.status + " - " + text);
    }
    return res.text();
  });
}
/* ===============================
   PROVEEDORES
   =============================== */

export function getProveedores() {
    return fetch(`${URL}Proveedores`)
        .then(res => {
            if (!res.ok) throw new Error('Error en la solicitud ' + res.status);
            return res.json();
        });
}

export function getProveedor(id) {
    return fetch(`${URL}Proveedores/${id}`)
        .then(res => {
            if (!res.ok) throw new Error('Error en la solicitud ' + res.status);
            return res.json();
        });
}

export function insertarProveedor(proveedor) {
    const url = `${URL}Proveedores`; // POST a /api/Proveedores
    const body = {
        descripcion: proveedor.descripcion,
        direccion: proveedor.direccion,
        nit: proveedor.nit,
        estado: proveedor.estado
    };

    return fetch(url, {
        method: 'POST',
        body: JSON.stringify(body),
        headers: { 'Content-Type': 'application/json' }
    })
    .then(async res => {
        const text = await res.text();
        if (!res.ok) throw new Error('Error en la solicitud ' + res.status + ': ' + text);
        return text;
    });
}

export function actualizarProveedor(proveedor) {
  const url = `${URL}Proveedores/${proveedor.idproveedor}`;

  return fetch(url, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      descripcion: proveedor.descripcion,
      direccion: proveedor.direccion,
      nit: proveedor.nit,
      estado: proveedor.estado,
    }),
  }).then(async (res) => {
    const text = await res.text();
    if (!res.ok) throw new Error("Error en la solicitud " + res.status + ": " + text);
    return text;
  });
}

export function eliminarProveedor(id) {
    const url = `${URL}Proveedores/${id}`; // DELETE /api/Proveedores/{id}
    return fetch(url, { method: 'DELETE' })
        .then(async res => {
            const text = await res.text();
            if (!res.ok) throw new Error('Error en la solicitud ' + res.status + ': ' + text);
            return text;
        });
}