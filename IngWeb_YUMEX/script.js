

// ----------------- HELPERS -----------------
// Objeto para manejar localStorage de forma segura 
const storage = {
  // Obtener un valor de localStorage y parsearlo; si no existe devuelve un valor por defecto
  get: (k, f) => { try { return JSON.parse(localStorage.getItem(k)) ?? f } catch { return f } },
  // Guardar un valor en localStorage convirtiéndolo a JSON
  set: (k, v) => localStorage.setItem(k, JSON.stringify(v))
};

const $ = s => document.querySelector(s);
const fmt = n => n.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' });

function mostrarMensaje(texto) {
  alert(texto);
}

// Parche: forzar credentials: "include" en TODOS los fetch
const originalFetch = window.fetch;
window.fetch = function(url, options = {}) {
  options.credentials = "include";
  return originalFetch(url, options);
};

let cart = JSON.parse(localStorage.getItem('cart')) || [];
let isLogged = false;

document.addEventListener('DOMContentLoaded', () => {
  renderOptionSesion();
});

const state = {
  role: 'Invitado',
  cart: [], // Carrito de compras del cliente
  filter: '', // Filtro de categoría activo
  currentReview: null // ID del platillo actualmente revisado
};

document.addEventListener("DOMContentLoaded", async () => {
  try {
    const res = await fetch("/bienvenido");
    renderClienteUI();

    const data = await res.json();

    if (!data.ok) {
      cerrarSesionForzada();
      return;
    }

    // Sesión válida
    isLogged = true;
    localStorage.setItem("userName", data.usuario);
    localStorage.setItem("userRole", data.rol);
    renderOptionSesion();

  } catch (err) {
    cerrarSesionForzada();
  }
});

function cerrarSesionForzada() {
  isLogged = false;

  localStorage.removeItem("userName");
  localStorage.removeItem("userRole");

  state.cart = [];
  renderOptionSesion();
  renderClienteUI();

  console.warn("⚠️ Sesión inválida o expirada");
}





// CAMBIO DE ROL CON EL SELECT 
// MODIFICAR PARA QUE USE EL ROL DE BASE DE DATOS

function setRole(r) {
  state.role = r;

  // Invitado: ve menú y carrito
  if (r === 'Invitado' || r === '' || !r) {

    //$('#cliente-app').hidden = false;
    //$('#admin-app').hidden = true;

    const clientOrders = document.querySelector('#clientOrders');
    if (clientOrders) clientOrders.remove();

    renderOptionSesion();
    return;
  }

  //$('#cliente-app').hidden = r !== 'Cliente';
  //$('#admin-app').hidden = r !== 'Administrador';
  renderOptionSesion(); // 🔥 actualizar botones
}

// ============ BOTON DE INICIO SESION, CREAR, Cerrar ==============
// RENDERIZAR LOS BOTONES DE SESIÓN
function renderOptionSesion() {
  const barLogin = $('#OptionSesionBar');
  const barRegister = $('#CrearSesionBar');
  const barLogout = $('#CloseSesionBar');
  const profileCard = $('#ProfileCard');

  // Protección contra null
  if (!barLogout || !profileCard) return;

  if (isLogged) {
    // Usuario logueado
    if (barLogin) barLogin.style.display = "none";
    if (barRegister) barRegister.style.display = "none";

    barLogout.style.display = "block";
    profileCard.style.display = "flex";

    const name = localStorage.getItem('userName') || 'Usuario';
    const role = localStorage.getItem('userRole') || 'Cliente';

    const nameEl = $('#ProfileName');
    const roleEl = $('#ProfileRole');

    if (nameEl) nameEl.textContent = name;
    if (roleEl) roleEl.textContent = role;

  } else {
    // Usuario NO logueado
    if (barLogin) barLogin.style.display = "block";
    if (barRegister) barRegister.style.display = "block";

    barLogout.style.display = "none";
    profileCard.style.display = "none"; // 🔥 CLAVE
  }
  renderRoleButtons();
}

// ============ CONTROL DE BOTONES POR ROL ============
function renderRoleButtons() {
  const adminBtn = document.getElementById('OptionAdmin');
  const pedidosBtn = document.getElementById('OptionMisPedidos');

  // Protección
  if (!adminBtn || !pedidosBtn) return;

  // Ocultar ambos por defecto
  adminBtn.style.display = 'none';
  pedidosBtn.style.display = 'none';

  // Si no hay sesión → no mostrar nada
  if (!isLogged) return;

  const role = localStorage.getItem('userRole');

  // Cliente → solo Mis Pedidos
  if (role === 'Cliente') {
    pedidosBtn.style.display = 'block';
  }

  // Administrador → solo Administrador
  if (role === 'Administrador') {
    adminBtn.style.display = 'block';
  }
}

//CERRAR VENTANAS
function CerrarModales() {
  $('#InicioSesion').style.display = 'none';
  $('#CrearCuenta').style.display = 'none';
}

//Validacion de datos
function validarPassword(password) {
  const regexCorreo = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const regexMayus = /[A-Z]/;
  const regexMinus = /[a-z]/;
  const regexNumero = /[0-9]/;

  let errores = [];

  if (!regexMayus.test(password)) errores.push("La contraseña debe tener mínimo 1 mayúscula.");
  if (!regexMinus.test(password)) errores.push("La contraseña debe tener mínimo 1 minúscula.");
  if (!regexNumero.test(password)) errores.push("La contraseña debe tener mínimo 1 número.");
  if (password.length < 8) errores.push(`Faltan ${8 - password.length} caracteres para alcanzar 8.`);

  return errores;
}

// ================ LOGIN ==============
// Muestra el modal de inicio de sesión
function OpenInitSesion(){
  $('#InitCorreo').value = '';
  $('#InitContraseña').value = '';
  $('#InicioSesion').style.display = 'grid';
}
 
//INICIO DE SESION
// Botón de iniciar sesión
$('#InitSesionBtn').onclick = async () => {
  const usuario = $('#InitCorreo').value.trim();
  const password = $('#InitContraseña').value.trim();

  if (!usuario || !password) {
    mostrarMensaje("⚠️ Por favor, completa todos los campos.");
    return;
  }

  try {
    const response = await fetch('/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ usuario, password })
    });

    const result = await response.json(); 
    mostrarMensaje(result.mensaje);
    
    if (result.ok) {
      isLogged = true;

      localStorage.setItem('userName', result.usuario || usuario);
      localStorage.setItem('userRole', result.rol || 'Cliente');

      CerrarModales();
      renderOptionSesion();
      renderClienteUI();

    }
  } catch (error) {
    console.error('Error al enviar datos:', error);
    mostrarMensaje('⚠️ Error al conectar con el servidor.');
  }
};
//CERRA LOGIN
$('#CloseSesionBtn').onclick = () => $('#InicioSesion').style.display = 'none';

//ABRIR CREAR CUENTA
function OpenCrearCuenta(){
  $('#RegCorreo').value = '';
  $('#RegContraseña').value = '';
  $('#RegNombre').value = '';
  $('#CrearCuenta').style.display = 'grid';
}
//CREAR CUENTA
$('#CrearCuentaBtn').onclick = async () => {
  const RegUsuario = $('#RegCorreo').value.trim();
  const RegPassword = $('#RegContraseña').value.trim();
  const RegNombre = $('#RegNombre').value.trim();

  if (!RegUsuario || !RegPassword || !RegNombre) {
    mostrarMensaje("❌ Todos los campos son obligatorios.");
    return;
  }

  try {
    const respuesta = await fetch('/crearCuenta', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        RegUsuario, 
        RegPassword, 
        RegNombre
      })
    });

    const result = await respuesta.json();
    mostrarMensaje(result.mensaje);

    if (result.ok) {
      // Cierra registro
      CerrarModales();

      // Abre login automáticamente
      OpenInitSesion();
    }

  } catch (error) {
    console.error("Error al crear cuenta:", error);
    mostrarMensaje("❌ Error de conexión con el servidor.");
  }
};
//CERRAR CREAR CUENTA
$('#CerrarCrearBtn').onclick = () => $('#CrearCuenta').style.display = 'none';

//CERRAR SESION 
$('#CloseBtn').onclick = async () => {
  try {
    await fetch('/logout');
  } catch (err) {
    console.warn('Error al llamar /logout', err);
  }

  // Estado
  isLogged = false;
  state.cart = [];
  storage.set('cart', []);

  // Limpiar datos
  localStorage.removeItem('userName');
  localStorage.removeItem('userRole');

  state.role = 'Invitado';

  // Ocultar tarjeta de perfil inmediatamente
  const profileCard = $('#ProfileCard');
  if (profileCard) profileCard.style.display = "none";

  // Quitar pedidos si existen
  const clientOrders = document.querySelector('#clientOrders');
  if (clientOrders) clientOrders.remove();

  // Actualizar UI
  renderOptionSesion();
  renderClienteUI();

  // 🔥 REDIRIGIR AL INDEX
  window.location.href = '/';
  alert("Sesión cerrada correctamente.");
};

document.addEventListener('DOMContentLoaded', async () => {
  if (document.getElementById('menuGrid')) {
    console.log('✅ menuGrid existe');
    await cargarPlatillos();
    renderMenu();
    renderCart();

    // 🔥 MOSTRAR LA APP DEL CLIENTE
    const clienteApp = document.getElementById('cliente-app');
    if (clienteApp) clienteApp.hidden = false;
  }
});

/* ================================
   CARGAR USUARIOS DESDE BACKEND
================================ */

async function cargarUsuariosAdmin() {
  const res = await fetch('/admin/usuarios');
  const usuarios = await res.json();
  renderUsuariosAdmin(usuarios);
}

function renderUsuariosAdmin(usuarios) {
  const grid = document.getElementById('usuariosGrid');
  if (!grid) return;

  grid.innerHTML = '';

  usuarios.forEach(u => {
    const card = document.createElement('div');
    card.className = 'card p';

    card.innerHTML = `
      <strong>${u.NOMBRE}</strong>
      <p>${u.EMAIL}</p>

      <label>Rol:</label>
      <select data-id="${u.ID_CUENTA}" class="rolSelect">
        <option value="Invitado" ${u.ROL === "Invitado" ? "selected" : ""}>Invitado</option>
        <option value="Cliente" ${u.ROL === "Cliente" ? "selected" : ""}>Cliente</option>
        <option value="Administrador" ${u.ROL === "Administrador" ? "selected" : ""}>Administrador</option>
      </select>

      <p style="color:${u.ACTIVO ? 'green':'red'}">
        ${u.ACTIVO ? 'Activo' : 'Inactivo'}
      </p>
    `;

    grid.appendChild(card);
  });

  // 🔥 EVENTO CAMBIO DE ROL
  grid.querySelectorAll('.rolSelect').forEach(select => {
    select.addEventListener('change', async (e) => {
      const idUsuario = e.target.dataset.id;
      const nuevoRol = e.target.value;

      try {
        const res = await fetch("/admin/cambiarRol", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            idUsuario,
            rol: nuevoRol
          })
        });

        const data = await res.json();

        if (!data.ok) {
          alert("Error al cambiar rol");
        } else {
          alert("Rol actualizado correctamente");
        }

      } catch (err) {
        console.error(err);
        alert("Error de conexión");
      }
    });
  });
}


function renderClienteUI() {
  const cart = document.getElementById("cartAside");
  const menu = document.getElementById("menuGrid");

  // Ocultar carrito si no hay sesión
  if (cart) {
    cart.style.display = isLogged ? "block" : "none";
  }

  // Deshabilitar botones Agregar
  if (menu) {
    const botones = menu.querySelectorAll("[data-add]");
    botones.forEach(btn => {
      btn.style.display = isLogged ? "block" : "none";
    });
  }
}


/* ================================
   CARGAR PLATILLOS DESDE BACKEND
================================ */

async function cargarPlatillosAdmin() {
  const res = await fetch('/admin/platillos');
  const data = await res.json();
  storage.set('menu', data.map(p => ({
    id: p.ID_PLATILLO,
    name: p.NOMBRE,
    price: p.PRECIO,
    activo: p.ACTIVO === 1
  })));
  renderAdminMenuList();
}

async function cargarPlatillos() {
  try {
    console.log('🌐 Cargando platillos...');
    const res = await fetch('/platillos');
    const data = await res.json();

    console.log('📥 Datos del backend:', data);

    const menu = data.map(p => ({
      id: p.id ?? p.ID_PLATILLO,
      name: p.nombre ?? p.NOMBRE,
      price: Number(p.precio ?? p.PRECIO),
      desc: p.descripcion ?? p.DESCRIPCION,
      img: p.imagen ?? p.IMAGEN,
      activo: true
    }));

    storage.set('menu', menu);
  } catch (err) {
    console.error('❌ Error cargando platillos:', err);
  }
}

function renderMenu() {
  const wrap = document.getElementById('menuGrid');

  // 🔐 Protección CLAVE
  if (!wrap) return;

  wrap.innerHTML = '';

  let menu = storage.get('menu', []).filter(p => p.activo);

  if (!menu.length) {
    wrap.innerHTML = '<p class="muted">No hay productos disponibles</p>';
    return;
  }

  menu.forEach(p => {
    const card = document.createElement('div');
    card.className = 'card menu-item';

    const img = p.img ? `/build/img/${p.img}` : '/build/img/PERFIL.jpg';

    card.innerHTML = `
      <img src="${img}" onerror="this.src='/build/img/PERFIL.jpg'">
      <h4>${p.name}</h4>
      <p>${p.desc}</p>
      <strong class="price">${fmt(p.price)}</strong>
      <button class="btn acc" data-add="${p.id}">
        Agregar
      </button>
    `;

    wrap.appendChild(card);
  });

    wrap.onclick = (e) => {
    if (!isLogged) {
      alert("Debes iniciar sesión para agregar productos");
      return;
    }

    const btn = e.target.closest('[data-add]');
    if (!btn) return;

    const id = btn.dataset.add;
    const prod = storage.get('menu', []).find(p => p.id == id);

    if (prod) agregarAlCarrito(prod);
  };
}

function agregarAlCarrito(producto) {
  const item = state.cart.find(p => p.id === producto.id);

  if (item) {
    item.qty++;
  } else {
    state.cart.push({
      id: producto.id,
      name: producto.name,
      price: producto.price,
      qty: 1
    });
  }

  renderCart();
}

function renderCart() {
  const list = document.getElementById('cartList');
  const totalEl = document.getElementById('cartTotal');
  const btn = document.getElementById('checkoutBtn');

  if (!state.cart.length) {
    list.textContent = 'Tu carrito está vacío';
    totalEl.textContent = fmt(0);
    if (btn) btn.style.display = 'none';
    return;
  }

  if (btn) btn.style.display = 'block';

  list.innerHTML = '';

  state.cart.forEach(item => {
    const row = document.createElement('div');
    row.className = 'row';
    row.style.justifyContent = 'space-between';

    row.innerHTML = `
      <span>${item.name} × ${item.qty}</span>
      <strong>${fmt(item.qty * item.price)}</strong>
    `;

    list.appendChild(row);
  });

  const total = state.cart.reduce((s, i) => s + i.qty * i.price, 0);
  totalEl.textContent = fmt(total);
}

document.addEventListener('DOMContentLoaded', () => {
  const adminApp = document.getElementById('admin-app');
  if (!adminApp) return;

  const role = localStorage.getItem('userRole');
  if (role !== 'Administrador') {
    window.location.href = '/';
    return;
  }

  adminApp.hidden = false;
  cargarPlatillosAdmin();
  cargarUsuariosAdmin();
});

// Renderiza lista de platillos con opción a eliminar
function renderAdminMenuList() {
  const menu = storage.get('menu', []);

  const container = $('#adminMenuListContainer');
  if (!container) return;
  container.innerHTML = ''; // limpio
  const panel = document.createElement('div');
  panel.className = 'card p';
  panel.innerHTML = `
    <h3>Administrar platillos</h3>` + (menu.length ? menu.map(m => {
      const estadoTexto = m.activo ? "Activo" : "Inactivo";      // ← CORREGIDO
      const btnEstado = m.activo ? "Deshabilitar" : "Habilitar"; // ← CORREGIDO
      const estadoColor = m.activo ? "green" : "red";            // ← CORREGIDO

      return `
      <div class="row" style="margin:4px 0; align-items:center; justify-content:space-between">
        <span style="flex:1">${m.name} (${fmt(m.price)})</span>

        <p style="color:${estadoColor}; font-weight:bold; margin:0 8px;">
          ${estadoTexto}
        </p>

        <button class="boton-amarillo-block" data-edit="${m.id}">Editar</button>

        <!-- <button class="btn ghost" data-del="${m.id}">Eliminar</button> -->

        <button class="btn toggle" data-toggle-id="${m.id}">${btnEstado}</button>
      </div>`;
    }).join('') : '<div class="muted">No hay platillos en el menú.</div>');

  container.appendChild(panel);

  // Delegación de eventos
  panel.onclick = async (e) => {

    // BOTÓN ELIMINAR
    const delId = e.target.dataset.del;
    if (delId) {
      if (!confirm('¿Eliminar este platillo?')) return;
      try {
        const res = await fetch('/platillos/eliminar', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: delId })
        });
        const data = await res.json();
        if (!data.ok) return alert('Error: ' + data.mensaje);

        let menu = storage.get('menu', []);
        menu = menu.filter(m => m.id != delId);
        storage.set('menu', menu);

        renderAdminMenuList();
        renderMenu();
        renderFilters();

        alert('Platillo eliminado.');
      } catch (error) {
        console.error(error);
      }
      return;
    }

    // BOTÓN EDITAR
    const editId = e.target.dataset.edit;
    if (editId) {
      openEditDishModal(editId);
      return;
    }

    // BOTÓN TOGGLE
    // BOTÓN TOGGLE
const toggleId = e.target.dataset.toggleId;
if (toggleId) {
  try {
    const res = await fetch('/platillos/toggle', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: toggleId })
    });

    const data = await res.json();
    if (!data.ok) {
      alert('Error al cambiar estado');
      return;
    }

    // 🔥 PASO 1: volver a cargar platillos desde BD
    await cargarPlatillosAdmin();

    // 🔥 PASO 2: volver a renderizar panel admin
    renderAdminMenuList();

    // 🔥 PASO 3: volver a renderizar menú cliente
    await cargarPlatillos();
    renderMenu();

  } catch (err) {
    console.error(err);
  }
  return;
}

  };
}

document.addEventListener('DOMContentLoaded', () => {
  if (window.location.pathname.includes('pedidos') ||
      window.location.pathname.includes('blog')) {
    renderClientOrders();
  }
});

function mostrarVista(tipo) {
  const vistaActivos = document.getElementById('vistaActivos');
  const vistaHistorial = document.getElementById('vistaHistorial');
  const tabActivos = document.getElementById('tabActivos');
  const tabHistorial = document.getElementById('tabHistorial');

  if (!vistaActivos || !vistaHistorial) return;

  if (tipo === 'activos') {
    vistaActivos.style.display = 'block';
    vistaHistorial.style.display = 'none';
    tabActivos.classList.add('active');
    tabHistorial.classList.remove('active');
  } else {
    vistaActivos.style.display = 'none';
    vistaHistorial.style.display = 'block';
    tabActivos.classList.remove('active');
    tabHistorial.classList.add('active');
  }
}

// ----------------- pedidos CLIENTE -----------------
function cardPedido(pedido) {
  return `
    <div class="card p" style="margin-bottom:10px;">
      <strong>Pedido #${pedido.numero}</strong>
      <p class="muted">Total: $${pedido.total}</p>

      <div style="margin:6px 0;">
        ${
          pedido.items.map(i => `
            <div class="row" style="justify-content:space-between">
              <span>${i.nombre} × ${i.cantidad}</span>
              <span>$${(i.cantidad * i.precio).toFixed(2)}</span>
            </div>
          `).join('')
        }
      </div>

      <small class="muted">Estado: ${pedido.estado}</small>
    </div>
  `;
}


async function renderClientOrders() {
  try {
    const res = await fetch("/obtenerpedidos1", {
      credentials: "include"
    });

    if (res.status === 401) {
      console.warn("⚠ No hay sesión, no se mostrarán pedidos.");
      limpiarpedidos();
      return;
    }

    const orders = await res.json();

if (!Array.isArray(orders)) {
  console.error("Respuesta inválida:", orders);
  return;
}

    console.log("Datos crudos:", orders);

    // === AGRUPAR POR ID_PEDIDO ===
    const pedidos = {};
    orders.forEach(o => {
      if (!pedidos[o.ID_PEDIDO]) {
        pedidos[o.ID_PEDIDO] = {
          id: o.ID_PEDIDO,
          estado: o.ESTADO,
          total: o.TOTAL,
          items: []
        };
      }
      pedidos[o.ID_PEDIDO].items.push({
        nombre: o.NOMBRE_PLATILLO,
        cantidad: o.CANTIDAD,
        precio: Number(o.PRECIO_UNITARIO)
      });
    });

    const pedidosArray = Object.values(pedidos);

    // Guardar en localStorage para admin
    storage.set('orders', pedidosArray);

    pedidosArray.forEach((p, i) => (p.numero = i + 1));

    const aside = document.querySelector('.aside .p');
    if (!aside) return;

    // Borrar sección antes de renderizar
    const existing = document.getElementById('clientOrders');
    if (existing) existing.remove();

    // === SEPARAR pedidos ===
    const activos = pedidosArray.filter(p => p.estado !== "done");
    const historial = pedidosArray.filter(p => p.estado === "done");

    // === CONTENEDOR ===
    const cont = document.createElement("div");
    cont.id = "clientOrders";
    cont.style.marginTop = "12px";

    cont.innerHTML = `
      <div class="tabs" style="display:flex; gap:12px; margin-bottom:14px;">
        <button id="tabActivos" class="tabBtn active">Mis pedidos</button>
        <button id="tabHistorial" class="tabBtn">Historial</button>
      </div>

      <div id="vistaActivos">
        <h3>Mis pedidos</h3>
        ${
          activos.length
            ? activos.map(p => cardPedido(p)).join("")
            : '<div class="muted">No tienes pedidos en curso.</div>'
        }
      </div>

      <div id="vistaHistorial" style="display:none;">
        <h3>Historial</h3>
        ${
          historial.length
            ? historial.map(p => cardPedido(p)).join("")
            : '<div class="muted">Aún no tienes pedidos en historial.</div>'
        }
      </div>
    `;

    aside.appendChild(cont);

    // === EVENTOS DE PESTAÑAS ===
    document.getElementById("tabActivos").onclick = () => {
      mostrarVista("activos");
    };
    document.getElementById("tabHistorial").onclick = () => {
      mostrarVista("historial");
    };

  } catch (err) {
    console.error("Error mostrando pedidos:", err);
  }
}

function addToCart(item) {
  cart.push(item);
}


async function confirmarPedido() {

  if (!state.cart.length) {
    alert("Tu carrito está vacío");
    return;
  }

  try {
    const res = await fetch("/pedidosbd", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        items: state.cart   // 👈 enviamos el carrito
      })
    });

    const data = await res.json();

    if (!data.ok) {
      alert(data.mensaje || "Error al confirmar pedido");
      return;
    }

    alert("✅ Pedido confirmado correctamente");

    // Limpiar carrito
    state.cart = [];
    renderCart();

    // Opcional: redirigir a pedidos
    window.location.href = "pedidos.html";

  } catch (err) {
    console.error("Error al confirmar pedido:", err);
    alert("Error de conexión con el servidor");
  }
}



document.addEventListener("DOMContentLoaded", () => {
  const btn = document.getElementById("checkoutBtn");
  if (btn) {
    btn.addEventListener("click", confirmarPedido);
  }
});

function openEditDishModal(idPlatillo) {
  const menu = storage.get('menu', []);
  const platillo = menu.find(p => p.id == idPlatillo);

  if (!platillo) {
    alert("Platillo no encontrado");
    return;
  }

  document.getElementById("EditPlatilloId").value = platillo.id;
  document.getElementById("EditNombre").value = platillo.name;
  document.getElementById("EditPrecio").value = platillo.price;
  document.getElementById("EditDescripcion").value = platillo.desc || "";

  document.getElementById("EditPlatilloModal").style.display = "grid";
}

const cerrarEditar = document.getElementById("CerrarEditarPlatillo");
if (cerrarEditar) {
  cerrarEditar.onclick = () => {
    document.getElementById("EditPlatilloModal").style.display = "none";
  };
}

const guardarBtn = document.getElementById("GuardarPlatilloBtn");
if (guardarBtn) {
  guardarBtn.onclick = async () => {
    const id = document.getElementById("EditPlatilloId").value;
    const nombre = document.getElementById("EditNombre").value;
    const precio = document.getElementById("EditPrecio").value;
    const descripcion = document.getElementById("EditDescripcion").value;
    const imagen = document.getElementById("EditImagen").files[0];

    const formData = new FormData();
    formData.append("id", id);
    formData.append("nombre", nombre);
    formData.append("precio", precio);
    formData.append("descripcion", descripcion);

    if (imagen) {
      formData.append("imagen", imagen);
    }

    try {
      const res = await fetch("/platillos/editar", {
        method: "POST",
        body: formData
      });

      const data = await res.json();

      if (!data.ok) {
        alert(data.mensaje || "Error al editar");
        return;
      }

      alert("Platillo actualizado");

      // 🔄 refrescar todo
      await cargarPlatillosAdmin();
      renderAdminMenuList();
      await cargarPlatillos();
      renderMenu();

      document.getElementById("EditPlatilloModal").style.display = "none";

    } catch (err) {
      console.error(err);
      alert("Error de conexión");
    }
  };
}










// ---------- UI bindings ---------- 
$('#seedBtn').addEventListener('click', OpenInitSesion);
$('#RegistrarBtn').addEventListener('click',OpenCrearCuenta);
//$('#checkoutBtn').addEventListener('click', checkout);








