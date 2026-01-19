

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
let pedidoPendiente = null;
let tipoEntregaSeleccionado = null; // LOCAL | DOMICILIO
let direccionSeleccionada = null;   // ID_DIRECCION | null
let tipoPagoSeleccionado = null;    // efectivo | tarjeta




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

  const rutaActual = window.location.pathname;

  const paginasProtegidas = [
    "/perfil.html",
    "/admin.html",
    "/empleado.html",
    "/mis-pedidos.html"
  ];

  await restaurarSesion();

  // 🔒 Si es página protegida y no hay sesión → fuera
  if (paginasProtegidas.includes(rutaActual) && !isLogged) {
    window.location.href = "/";
    return;
  }

  // Mostrar sección privada si existe
  const perfilApp = document.getElementById("vendedor-app");
  if (perfilApp && isLogged) {
    perfilApp.hidden = false;
  }
});


async function restaurarSesion() {
  try {
    const res = await fetch("/bienvenido", {
      credentials: "include"
    });

    const data = await res.json();

    if (data.ok) {
      isLogged = true;
      localStorage.setItem("userName", data.usuario);
      localStorage.setItem("userRole", data.rol);
    } else {
      isLogged = false;
      localStorage.clear();
    }

  } catch (error) {
    isLogged = false;
    localStorage.clear();
  }

  renderOptionSesion();
}



function cerrarSesionForzada() {
  isLogged = false;

  localStorage.removeItem("userName");
  localStorage.removeItem("userRole");

  state.cart = [];
  renderOptionSesion();
  renderClienteUI();

  console.warn("⚠️ Sesión inválida o expirada");
}

document.addEventListener("DOMContentLoaded", () => {
  const btn = document.getElementById("algo");
  if (btn) {
    btn.addEventListener("click", () => {
      // código
    });
  }
});

function onClick(id, handler) {
  const el = document.getElementById(id);
  if (el) el.addEventListener('click', handler);
}

const userFilterState = {
  role: 'Todos'
};





























function activarSesion(usuario) {
  // Ocultar botones de inicio
  document.getElementById("OptionSesionBar").style.display = "none";
  document.getElementById("CrearSesionBar").style.display = "none";

  // Mostrar botones de sesión
  document.getElementById("CloseSesionBar").style.display = "block";
  document.getElementById("OptionMiPerfil").style.display = "block";
  document.getElementById("ProfileCard").style.display = "flex";

  // Datos del usuario
  document.getElementById("ProfileName").textContent = usuario.nombre;
  document.getElementById("ProfileRole").textContent = usuario.rol;

  // Mostrar opciones por rol
  if (usuario.rol === "admin") {
    document.getElementById("OptionAdmin").style.display = "block";
  }

  if (usuario.rol === "empleado") {
    document.getElementById("OptionEmpleado").style.display = "block";
  }

  if (usuario.rol === "cliente") {
    document.getElementById("OptionMisPedidos").style.display = "block";
  }
}

fetch("/login", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    correo: InitCorreo.value,
    contraseña: InitContraseña.value
  })
})
.then(res => res.json())
.then(data => {
  if (data.ok) {
    activarSesion({
      nombre: data.usuario.nombre,
      rol: data.usuario.rol
    });
  }
});

document.getElementById("CloseBtn").addEventListener("click", () => {
  location.reload(); // o limpiar cookies y redirigir
});


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
  console.log("Sesión activa:", isLogged);

  const barLogin = document.getElementById('OptionSesionBar');
  const barRegister = document.getElementById('CrearSesionBar');
  const barLogout = document.getElementById('CloseSesionBar');
  const profileCard = document.getElementById('ProfileCard');
  const perfilBtn = document.getElementById('OptionMiPerfil');

  if (isLogged) {
    if (barLogin) barLogin.style.display = "none";
    if (barRegister) barRegister.style.display = "none";

    if (barLogout) barLogout.style.display = "block";
    if (profileCard) profileCard.style.display = "flex";
    if (perfilBtn) perfilBtn.style.display = "block";

    const name = localStorage.getItem('userName') || 'Usuario';
    const role = localStorage.getItem('userRole') || 'Cliente';

    const nameEl = document.getElementById('ProfileName');
    const roleEl = document.getElementById('ProfileRole');

    if (nameEl) nameEl.textContent = name;
    if (roleEl) roleEl.textContent = role;

  } else {
    if (barLogin) barLogin.style.display = "block";
    if (barRegister) barRegister.style.display = "block";

    if (barLogout) barLogout.style.display = "none";
    if (profileCard) profileCard.style.display = "none";
    if (perfilBtn) perfilBtn.style.display = "none";
  }

  renderRoleButtons();
}


// ============ CONTROL DE BOTONES POR ROL ============
function renderRoleButtons() {
  const adminBtn = document.getElementById('OptionAdmin');
  const pedidosBtn = document.getElementById('OptionMisPedidos');
  const empleadoBtn = document.getElementById('OptionEmpleado');

  if (adminBtn) adminBtn.style.display = 'none';
  if (pedidosBtn) pedidosBtn.style.display = 'none';
  if (empleadoBtn) empleadoBtn.style.display = 'none';

  if (!isLogged) return;

  const role = localStorage.getItem('userRole');

  if (role === 'Cliente' && pedidosBtn) {
    pedidosBtn.style.display = 'block';
  }

  if (role === 'Administrador' && adminBtn) {
    adminBtn.style.display = 'block';
  }

  if (role === 'Empleado' && empleadoBtn) {
    empleadoBtn.style.display = 'block';
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
    
    // 🔍 DEBUG DE CATEGORÍAS (AQUÍ VA)
    console.log(
      'Categorias detectadas:',
      [...new Set(storage.get('menu', []).map(p => p.categoria))]
    );

    renderCategorias();
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

  // 🔥 GUARDAR EN STORAGE
  storage.set('usuarios', usuarios);

  renderUsuariosAdmin(usuarios);
}


function renderUsuariosAdmin(usuarios) {
  const grid = document.getElementById('usuariosGrid');
  if (!grid) return;

  let filtrados = usuarios;

  if (userFilterState.role !== 'Todos') {
    filtrados = usuarios.filter(
      u => u.ROL === userFilterState.role
    );
  }

  grid.innerHTML = '';

  if (!filtrados.length) {
    grid.innerHTML = '<p class="muted">No hay usuarios con este rol</p>';
    return;
  }

  filtrados.forEach(u => {
    const card = document.createElement('div');
    card.className = 'card p';

    card.innerHTML = `
      <strong>${u.NOMBRE}</strong>
      <p>${u.EMAIL}</p>

      <label>Rol:</label>
      <select data-id="${u.ID_CUENTA}" class="rolSelect">
        <option value="Cliente" ${u.ROL === "Cliente" ? "selected" : ""}>Cliente</option>
        <option value="Empleado" ${u.ROL === "Empleado" ? "selected" : ""}>Empleado</option>
        <option value="Administrador" ${u.ROL === "Administrador" ? "selected" : ""}>Administrador</option>
      </select>

      <p style="color:${u.ACTIVO ? 'green' : 'red'}">
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
    desc: p.DESCRIPCION,
    stock: p.STOCK, 
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
      stock: p.STOCK, 
      categoria: p.CATEGORIA,
      tiempo: p.TIEMPO_PREPARACION,
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

  if (state.filter && state.filter !== 'Todos') {
    menu = menu.filter(p => p.categoria === state.filter);
  }

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
      <div style="padding:12px">
        <h4>${p.name}</h4>
        <p>${p.desc}</p>
        <p class="muted">⏱ Tiempo estimado de espera: ${p.tiempo} min</p>
        <p class="muted">Stock disponible: ${p.stock}</p>
        <p class="price"><h4>${fmt(p.price)}</h4></p>

        <div class="row" style="gap:6px">
          <button class="btn acc" data-add="${p.id}" ${p.stock <= 0 ? "disabled" : ""}> 
            ${p.stock > 0 ? "Agregar" : "Sin stock"}
          </button>

          <button class="btn ghost" data-review="${p.id}">
            Reseñas
          </button>
        
        </div>
      </div>
    `;
    wrap.appendChild(card);
  });

  wrap.onclick = (e) => {

    // 🔥 VER RESEÑAS
    const reviewBtn = e.target.closest('[data-review]');
    if (reviewBtn) {
      const idPlatillo = reviewBtn.dataset.review;
      abrirModalReseñas(idPlatillo);
      return;
    }

    // 🔒 Agregar al carrito
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
  if (producto.stock <= 0) {
    alert("❌ No hay stock disponible");
    return;
  }

  const item = state.cart.find(p => p.id === producto.id);

  if (item) {
    if (item.qty >= producto.stock) {
      alert("⚠️ No hay más stock");
      return;
    }
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
  const btnCheckout = document.getElementById('checkoutBtn');

  if (!state.cart.length) {
    list.innerHTML = '<span class="muted">Tu carrito está vacío</span>';
    totalEl.textContent = fmt(0);
    if (btnCheckout) btnCheckout.style.display = 'none';
    return;
  }

  if (btnCheckout) btnCheckout.style.display = 'block';

  list.innerHTML = '';

  state.cart.forEach(item => {
    const row = document.createElement('div');
    row.className = 'row';
    row.style.justifyContent = 'space-between';
    row.style.alignItems = 'center';
    row.style.marginBottom = '6px';

    row.innerHTML = `
      <div>
        <strong>${item.name}</strong>
        <div class="muted">${fmt(item.price)}</div>
      </div>

      <div class="row" style="gap:6px; align-items:center">
        <button class="btn ghost qty-btn" data-dec="${item.id}">−</button>
        <strong>${item.qty}</strong>
        <button class="btn ghost qty-btn" data-inc="${item.id}">+</button>
      </div>

      <strong>${fmt(item.qty * item.price)}</strong>
    `;

    list.appendChild(row);
  });

  const total = state.cart.reduce(
    (sum, i) => sum + i.qty * i.price, 0
  );
  document.querySelector("#montoPagar strong").textContent =
  `$${total.toFixed(2)}`;

  totalEl.textContent = fmt(total);
}


const page = document.body.dataset.page;
if (page === 'menu') {
  const cartList = document.getElementById('cartList').addEventListener('click', (e) => {
  const incId = e.target.dataset.inc;
  const decId = e.target.dataset.dec;

  if (incId) {
    const item = state.cart.find(p => p.id == incId);
    if (item) item.qty++;
    renderCart();
  }

  if (decId) {
    const item = state.cart.find(p => p.id == decId);
    if (!item) return;

    item.qty--;

    // ❌ si llega a 0 → eliminar del carrito
    if (item.qty <= 0) {
      state.cart = state.cart.filter(p => p.id != decId);
    }

    renderCart();
  }
});
}

onClick('clearCartBtn', () => {
  if (!state.cart.length) return;
  if (!confirm("¿Cancelar todos los productos del carrito?")) return;
  state.cart = [];
  renderCart();
});



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
  renderUserFilters();
});

// Renderiza lista de platillos con opción a eliminar
function renderAdminMenuList() {
  const menu = storage.get('menu', []);

  const container = $('#adminMenuListContainer');
  if (!container) return;
  container.innerHTML = ''; // limpio
  const panel = document.createElement('div');
  panel.className = 'card p';
  panel.innerHTML =  (menu.length ? menu.map(m => {
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

  abrirPagoModal();
}

async function enviarPedido(tipo_pago) {
  cerrarPagoModal();

  try {
    const res = await fetch("/pedidosbd", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        items: state.cart,
        tipo_pago // 👈 CLAVE
      })
    });

    const data = await res.json();

    if (!data.ok) {
      alert(data.mensaje || "Error al confirmar pedido");
      return;
    }

    alert("✅ Pedido confirmado correctamente");

    // limpiar carrito
    state.cart = [];
    renderCart();

    window.location.href = "pedidos.html";

  } catch (err) {
    console.error("Error al confirmar pedido:", err);
    alert("Error de conexión con el servidor");
  }
}




document.getElementById("checkoutBtn")?.addEventListener("click", () => {
  document.getElementById("EntregaModal").style.display = "grid";
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
  document.getElementById("EditStock").value = platillo.stock;
  document.getElementById("EditDescripcion").value = platillo.desc || "";
  document.getElementById("EditCategoria").value = platillo.categoria;

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
    const stock = document.getElementById("EditStock").value;
    const categoria = document.getElementById("EditCategoria").value;
    const tiempo = document.getElementById("EditTiempo").value;
    
    const formData = new FormData();

    formData.append("id", id);
    formData.append("nombre", nombre);
    formData.append("precio", precio);
    formData.append("descripcion", descripcion);
    formData.append("stock", stock);
    formData.append("categoria", categoria);
    formData.append("tiempo", tiempo);

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



async function abrirModalReseñas(idPlatillo) {
  state.currentReview = idPlatillo;

  const modal = document.getElementById("reviewModal");
  const list = document.getElementById("reviewList");
  const title = document.getElementById("modalTitle");

  list.innerHTML = "Cargando reseñas...";
  modal.style.display = "grid";

  const input = document.getElementById("reviewInput");
  const rating = document.getElementById("reviewRating");
  const sendBtn = document.getElementById("sendReviewBtn");

  // 🔒 Si NO ha iniciado sesión → solo lectura
  if (!isLogged) {
  input.value = "Inicia sesión para escribir una reseña";
  input.disabled = true;
  rating.disabled = true;

  // 🔥 OCULTAR botón Enviar
  sendBtn.style.display = "none";
} else {
  input.value = "";
  input.disabled = false;
  rating.disabled = false;

  // 🔥 MOSTRAR botón Enviar
  sendBtn.style.display = "inline-block";
}


  try {
    const res = await fetch(`/resenas/${idPlatillo}`);
    const data = await res.json();

    if (!data.ok) {
      list.innerHTML = "Error al cargar reseñas";
      return;
    }

    title.textContent = `Reseñas (${data.total}) • ⭐ ${data.promedio}`;

    if (!data.reseñas.length) {
      list.innerHTML = "<p class='muted'>Aún no hay reseñas</p>";
      return;
    }

    list.innerHTML = data.reseñas.map(r => `
      <div class="card p" style="margin-bottom:8px">
        <strong>${r.usuario}</strong>
        <div>⭐ ${r.CALIFICACION}</div>
        <p>${r.COMENTARIOS}</p>
        <small class="muted">${new Date(r.FECHA).toLocaleString()}</small>
      </div>
    `).join("");

  } catch (err) {
    console.error(err);
    list.innerHTML = "Error de conexión";
  }
}

const sendReviewBtn = document.getElementById("sendReviewBtn");

if (sendReviewBtn) {
  sendReviewBtn.onclick = async () => {
    if (!isLogged) {
      alert("Debes iniciar sesión para escribir reseñas");
      return;
    }
    if (!state.currentReview) return;

    const texto = document.getElementById("reviewInput")?.value.trim();
    const rating = document.getElementById("reviewRating")?.value;

    if (!texto) {
      alert("Escribe una reseña");
      return;
    }

    try {
      const res = await fetch("/resenas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ID_PLATILLO: state.currentReview,
          CALIFICACION: rating,
          COMENTARIOS: texto
        })
      });

      const data = await res.json();
      alert(data.mensaje);

      if (data.ok) {
        const input = document.getElementById("reviewInput");
        if (input) input.value = "";
        abrirModalReseñas(state.currentReview);
      }

    } catch (err) {
      alert("Error al enviar reseña");
    }
  };
}



const closeReviewBtn = document.getElementById("closeReviewBtn");
if (closeReviewBtn) {
  closeReviewBtn.onclick = () => {
    const modal = document.getElementById("reviewModal");
    if (modal) modal.style.display = "none";
    state.currentReview = null;
  };
}





// ----------------- pedidos EMPLEADO ----------------

function estadoTexto(st) {
  return st === 'prep' ? 'En preparación'
       : st === 'ready' ? 'Listo'
       : st === 'done' ? 'Entregado'
       : st;
}

function pagoTexto(o) {
  if (o.TIPO_PAGO === 'tarjeta') {
    return '💳 Cobrado';
  }
  if (o.TIPO_PAGO === 'efectivo') {
    return `💵 Por cobrar: $${o.TOTAL}`;
  }
  return '—';
}


async function renderOrdersEmpleado() {
  const wrap = document.getElementById('ordersGrid');
  const statusGrid = document.getElementById('statusGrid');

  // 🛑 SI NO ESTÁ EN EMPLEADO.HTML → SALIR
  if (!wrap || !statusGrid) return;
  
  wrap.innerHTML = '';
  statusGrid.style.display = 'none';

  const res = await fetch('/empleado/getpedidos');
  const data = await res.json();

  if (!data.ok) {
    wrap.innerHTML = '<div class="muted">Error cargando pedidos</div>';
    return;
  }

  // AGRUPAR POR CLIENTE
  const clientes = {};
  data.pedidos.forEach(o => {
    if (!clientes[o.ID_CUENTA]) {
      clientes[o.ID_CUENTA] = {
        nombre: o.NOMBRE_CLIENTE,
        pedidos: []
      };
    }
    clientes[o.ID_CUENTA].pedidos.push(o);
  });

  Object.entries(clientes).forEach(([idCliente, cliente]) => {
    const card = document.createElement('div');
    card.className = 'card p cliente-card';
    card.dataset.id = idCliente;

    card.innerHTML = `
      <strong>${cliente.nombre}</strong>
      <p class="muted">${cliente.pedidos.length} orden(es)</p>
    `;

    card.onclick = () => renderStatusGrid(cliente);

    wrap.appendChild(card);
  });
}


function renderStatusGrid(cliente) {
  const grid = document.getElementById('statusGrid');
  grid.innerHTML = '';
  grid.style.display = 'block';

  cliente.pedidos.forEach((o, index) => {
    let lista = '';
    o.platillos.forEach(p => {
      lista += `<li>${p.NOMBRE_PLATILLO} × ${p.CANTIDAD}</li>`;
    });

    const card = document.createElement('div');
    card.className = 'card p';

    card.innerHTML = `
      <h3>Orden ${index + 1} (#${o.ID_PEDIDO})</h3>

      <p><strong>Estado:</strong> ${estadoTexto(o.ESTADO)}</p>
      <p><strong>Pago:</strong> ${pagoTexto(o)}</p>

      <ul>${lista}</ul>

      <button 
        class="boton-amarillo-block avanzar-btn"
        data-id="${o.ID_PEDIDO}"
        data-estado="${o.ESTADO}"
        ${o.ESTADO === 'done' ? 'disabled' : ''}
      >
        ${o.ESTADO === 'prep'
          ? '➡️ Marcar como Listo'
          : o.ESTADO === 'ready'
          ? '✅ Marcar como Entregado'
          : '✔ Pedido Finalizado'}
      </button>
    `;
    grid.appendChild(card);
  });
}

document.getElementById('statusGrid')?.addEventListener('click', async e => {
  const btn = e.target.closest('.avanzar-btn');
  if (!btn) return;

  const id = btn.dataset.id;
  const estadoActual = btn.dataset.estado;

  let nuevoEstado = null;

  if (estadoActual === 'prep') nuevoEstado = 'ready';
  else if (estadoActual === 'ready') nuevoEstado = 'done';
  else return;

  try {
    const res = await fetch('/empleado/actualizarestado', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id,
        estado: nuevoEstado
      })
    });

    const data = await res.json();

    if (!data.ok) {
      alert("Error al actualizar estado");
      return;
    }

    // 🔄 refrescar órdenes
    renderOrdersEmpleado();

  } catch (err) {
    console.error(err);
    alert("Error de conexión");
  }
});


document.addEventListener("DOMContentLoaded", () => {
  const app = document.getElementById("vendedor-app");
  if (!app) return; // evita que corra en otras páginas

  const role = localStorage.getItem("userRole");

  if (role && role.trim() === "Empleado") {
    app.hidden = false;
    renderOrdersEmpleado();
  } else {
    console.warn("Acceso denegado: rol no autorizado");
    app.hidden = true;
  }
});

function abrirPagoModal() {
  const modal = document.getElementById("PagoModal");
  modal.style.display = "flex";
}


function cerrarPagoModal() {
  document.getElementById("PagoModal").style.display = "none";
}

window.addEventListener("click", e => {
  const modal = document.getElementById("PagoModal");
  if (e.target === modal) cerrarPagoModal();
});


// ======================== Forma de pafo =====================
document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("checkoutBtn")?.addEventListener("click", confirmarPedido);

  document.getElementById("PagoEfectivoBtn")?.addEventListener("click", async () => {
    pedidoPago = "efectivo";
    await finalizarPedido();
  });



  document.getElementById("PagoTarjetaBtn")?.addEventListener("click", async () => {
    document.getElementById("PagoModal").style.display = "none";
    document.getElementById("TarjetaModal").style.display = "grid";
    cargarTarjetasPago();
  });

  document.getElementById("CerrarPagoModal")?.addEventListener("click", cerrarPagoModal);
});


const pagoTarjetaBtn = document.getElementById("PagoTarjetaBtn");
if (pagoTarjetaBtn) {
  pagoTarjetaBtn.addEventListener("click", () => {
    cerrarPagoModal();
    document.getElementById("TarjetaModal").style.display = "flex";
  });
}

document.addEventListener("DOMContentLoaded", () => {
  const confirmarTarjetaBtn = document.getElementById("ConfirmarTarjetaBtn");
  const cerrarTarjetaBtn = document.getElementById("CerrarTarjetaModal");

  if (confirmarTarjetaBtn) {
    confirmarTarjetaBtn.addEventListener("click", async () => {
      const numero = document.getElementById("CardNumber")?.value.trim();
      const nombre = document.getElementById("CardName")?.value.trim();
      const exp = document.getElementById("CardExp")?.value.trim();

      if (!numero || !nombre || !exp) {
        alert("Completa todos los campos");
        return;
      }

      try {
        const res = await fetch("/perfil/tarjeta", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            titular: nombre,
            numero: numero,
            fecha: exp,
            cvv: "000" // puedes cambiarlo luego
          })
        });

        const data = await res.json();

        if (!data.ok) {
          alert("Error al guardar tarjeta");
          return;
        }

        document.getElementById("TarjetaModal").style.display = "none";

        // ✅ SOLO SI SE GUARDÓ BIEN
        enviarPedido("tarjeta");

      } catch (err) {
        console.error(err);
        alert("Error de conexión");
      }
    });
  }

  if (cerrarTarjetaBtn) {
    cerrarTarjetaBtn.addEventListener("click", () => {
      document.getElementById("TarjetaModal").style.display = "none";
    });
  }
});



const cerrarTarjetaBtn = document.getElementById("CerrarTarjetaModal");
if (cerrarTarjetaBtn) {
  cerrarTarjetaBtn.addEventListener("click", () => {
    const modal = document.getElementById("TarjetaModal");
    if (modal) modal.style.display = "none";
  });
}

document.addEventListener("DOMContentLoaded", () => {
    cargarKPIs();
});

function cargarKPIs() {
    const ventasEl = document.getElementById('kpiVentas');
    const pedidosEl = document.getElementById('kpiPedidos');
    const ticketEl = document.getElementById('kpiTicket');
    const menuEl = document.getElementById('kpiMenu');

    // ⛔ Si NO estamos en admin.html, salimos
    if (!ventasEl || !pedidosEl || !ticketEl || !menuEl) {
        return;
    }

    fetch('/api/admin/kpis')
        .then(res => res.json())
        .then(data => {
            ventasEl.innerText = `$${parseFloat(data.ventas).toFixed(2)}`;
            pedidosEl.innerText = data.pedidos;
            ticketEl.innerText = `$${parseFloat(data.ticket).toFixed(2)}`;
            menuEl.innerText = data.menu;
        })
        .catch(err => {
            console.error("Error cargando KPIs:", err);
        });
}


const addDishBtn = document.getElementById("addDishBtn");

if (addDishBtn) {
  addDishBtn.onclick = async () => {
    const nombre = document.getElementById("newName").value.trim();
    const precio = document.getElementById("newPrice").value;
    const descripcion = document.getElementById("newDesc").value.trim();
    const imagen = document.getElementById("newImg").files[0];
    const categoria = document.getElementById("newCategoria").value.trim();
    const tiempo = document.getElementById("newTiempo").value.trim();
    const stock = document.getElementById("newStock").value.trim();

    if (!nombre || !precio || !descripcion || !categoria) {
      alert("⚠️ Completa todos los campos");
      return;
    }

    const formData = new FormData();
    formData.append("nombre", nombre);
    formData.append("precio", precio);
    formData.append("descripcion", descripcion);
    formData.append("categoria", categoria);
    formData.append("tiempo", tiempo);
    formData.append("stock", stock);

    if (imagen) {
      formData.append("imagen", imagen);
    }

    try {
      const res = await fetch("/platillos/agregar", {
        method: "POST",
        body: formData
      });

      const data = await res.json();
      alert(data.mensaje);

      if (data.ok) {
        // Limpiar inputs
        document.getElementById("newName").value = "";
        document.getElementById("newPrice").value = "";
        document.getElementById("newDesc").value = "";
        document.getElementById("newImg").value = "";
        document.getElementById("newCategoria").value = "";
        document.getElementById("newStock").value = "";
        document.getElementById("newTiempo").value = "";

        // 🔄 refrescar listas
        await cargarPlatillosAdmin();
        renderAdminMenuList();
        await cargarPlatillos();
        renderMenu();
      }

    } catch (err) {
      console.error(err);
      alert("Error de conexión");
    }
  };
}

function renderCategorias() {
  const menu = storage.get('menu', []);

  const categorias = [
    'Todos',
    ...new Set(menu.map(p => p.categoria))
  ];

  const bar = document.getElementById('filterBar');
  if (!bar) return;

  bar.innerHTML = '';

  categorias.forEach(cat => {
    const btn = document.createElement('button');
    btn.textContent = cat;
    btn.className = 'btn ghost';

    btn.onclick = () => {
      state.filter = cat;
      renderMenu();
    };

    bar.appendChild(btn);
  });
}

function renderUserFilters() {
  const bar = document.getElementById('filterCuentas');
  if (!bar) return;

  const roles = ['Todos', 'Cliente', 'Empleado', 'Administrador'];

  bar.innerHTML = roles.map(r => `
    <button 
      class="filter-btn ${userFilterState.role === r ? 'active' : ''}" 
      data-role="${r}">
      ${r}
    </button>
  `).join('');

  bar.onclick = (e) => {
    const btn = e.target.closest('[data-role]');
    if (!btn) return;

    userFilterState.role = btn.dataset.role;

    renderUserFilters();

    // 🔥 USAR LOS USUARIOS YA CARGADOS
    const usuarios = storage.get('usuarios', []);
    renderUsuariosAdmin(usuarios);
  };
}



function cargarMenu(categoria = 'Todos') {
  const url = categoria === 'Todos'
    ? '/platillos'
    : `/platillos?categoria=${encodeURIComponent(categoria)}`;

  fetch(url)
    .then(r => r.json())
    .then(platillos => {
      renderMenu(platillos);
      renderCategorias(platillos);
    });
}

if (document.body.dataset.page === 'menu') {
  cargarMenu();
}



//=================== DIRECCION ========================================

document.getElementById("addDirBtn")?.addEventListener("click", async () => {
  const campos = [
    newCalle,
    newNumExt,
    newNumInt,
    newCol,
    newCP,
    newMun,
    newCd,
    newPais
  ];

  // ❌ Validación
  if (campos.some(c => !c.value.trim())) {
    alert("Completa todos los campos de la dirección");
    return;
  }

  const data = {
    calle: newCalle.value.trim(),
    numExt: newNumExt.value.trim(),
    numInt: newNumInt.value.trim(),
    colonia: newCol.value.trim(),
    cp: newCP.value.trim(),
    municipio: newMun.value.trim(),
    ciudad: newCd.value.trim(),
    pais: newPais.value.trim()
  };

  const res = await fetch("/perfil/direccion", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });

  const r = await res.json();
  if (!r.ok) {
    alert("Error al guardar dirección");
    return;
  }

  cargarDirecciones();
});


async function cargarDirecciones() {
  const res = await fetch("/perfil/direcciones");
  const dirs = await res.json();

  DireccionGrid.innerHTML = dirs.map(d => `
  <div class="card p">
    <strong>${d.CALLE} ${d.NUM_EXT}</strong>
    <p>${d.COLONIA}, ${d.CIUDAD}</p>
    <small>${d.PAIS} • ${d.CP}</small>
  </div>
`).join("");

}

async function editarDireccion(id) {
  const res = await fetch(`/perfil/direccion/${id}`);
  const d = await res.json();

  editDirId.value = d.ID_DIRECCION;
  editCalle.value = d.CALLE;
  editNumExt.value = d.NUM_EXT;
  editNumInt.value = d.NUM_INT;
  editCol.value = d.COLONIA;
  editCP.value = d.CP;
  editMun.value = d.MUNICIPIO;
  editCd.value = d.CIUDAD;
  editPais.value = d.PAIS;

  document.getElementById("editDireccionModal").style.display = "grid";
}

async function guardarDireccionEditada() {
  const data = {
    calle: editCalle.value,
    numExt: editNumExt.value,
    numInt: editNumInt.value,
    colonia: editCol.value,
    cp: editCP.value,
    municipio: editMun.value,
    ciudad: editCd.value,
    pais: editPais.value
  };

  const id = editDirId.value;

  const res = await fetch(`/perfil/direccion/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });

  if ((await res.json()).ok) {
    cerrarModalDir();
    cargarDirecciones();
  }
}

function cerrarModalDir() {
  document.getElementById("editDireccionModal").style.display = "none";
}




//=================== TARJETA ========================================

document.getElementById("addTarjBtn")?.addEventListener("click", async () => {
  const campos = [
    newTitular,
    newNumTarjeta,
    newFechExp,
    newCVV
  ];

  if (campos.some(c => !c.value.trim())) {
    alert("Completa todos los campos de la tarjeta");
    return;
  }

  const data = {
    titular: newTitular.value.trim(),
    numero: newNumTarjeta.value.trim(),
    fecha: newFechExp.value.trim(),
    cvv: newCVV.value.trim()
  };

  const res = await fetch("/perfil/tarjeta", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });

  const r = await res.json();
  if (!r.ok) {
    alert("Error al guardar tarjeta");
    return;
  }

  cargarTarjetas();
});


async function cargarTarjetas() {
  const res = await fetch("/perfil/tarjetas");
  const tarjetas = await res.json();

  TarjetaGrid.innerHTML = tarjetas.map(t => `
  <div class="card p">
    <strong>${t.TITULAR}</strong>
    <p>**** **** **** ${t.NUM_TARJETA.slice(-4)}</p>
    <small>Exp: ${t.FECHA_EXP}</small>

    <button class="btn ghost" onclick="editarTarjeta(${t.ID_TARJETA})">
      Editar
    </button>
  </div>
`).join("");

}

document.addEventListener("DOMContentLoaded", () => {
  if (document.getElementById("Perfil-app")) {
    cargarDirecciones();
    cargarTarjetas();
    document.getElementById("Perfil-app").hidden = false;
  }
});

async function editarTarjeta(id) {
  const res = await fetch(`/perfil/tarjeta/${id}`);
  const t = await res.json();

  editTarjId.value = t.ID_TARJETA;
  editTitular.value = t.TITULAR;
  editNumTarjeta.value = t.NUM_TARJETA;
  editFechaExp.value = t.FECHA_EXP;
  editCVV.value = t.CVV;

  document.getElementById("editTarjetaModal").style.display = "grid";
}

async function guardarTarjetaEditada() {
  const id = editTarjId.value;

  const data = {
    titular: editTitular.value,
    numero: editNumTarjeta.value,
    fecha: editFechaExp.value,
    cvv: editCVV.value
  };

  const res = await fetch(`/perfil/tarjeta/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });

  if ((await res.json()).ok) {
    cerrarModalTarj();
    cargarTarjetas();
  }
}

function cerrarModalTarj() {
  document.getElementById("editTarjetaModal").style.display = "none";
}

async function cargarTarjetasPago() {
  const res = await fetch("/perfil/tarjetas");
  const tarjetas = await res.json();

  const cont = document.getElementById("TarjetasGuardadas");

  if (!tarjetas.length) {
    cont.innerHTML = `<p class="muted">No tienes tarjetas guardadas</p>`;
    return;
  }

  cont.innerHTML = tarjetas.map(t => `
    <div class="card p tarjeta-pago" onclick="seleccionarTarjetaPago('${t.NUM_TARJETA}','${t.TITULAR}','${t.FECHA_EXP}')">
      <strong>${t.TITULAR}</strong>
      <p>**** **** **** ${t.NUM_TARJETA.slice(-4)}</p>
      <small>Exp: ${t.FECHA_EXP}</small>
    </div>
  `).join("");
}



function seleccionarTarjetaPago(numero, titular, exp) {
  document.getElementById("CardNumber").value = numero;
  document.getElementById("CardName").value = titular;
  document.getElementById("CardExp").value = exp;
}

//======================== Confirmar Tarjetas BTN ==========================
document.getElementById("ConfirmarTarjetaBtn")?.addEventListener("click", () => {
  const numero = CardNumber.value;
  const nombre = CardName.value;
  const exp = CardExp.value;

  if (!numero || !nombre || !exp) {
    alert("Completa los datos de la tarjeta");
    return;
  }

  // 👉 aquí conectas con tu lógica de crear pedido
  console.log("Pago con tarjeta:", numero, nombre, exp);

  document.getElementById("TarjetaModal").style.display = "none";
  alert("Pago realizado con tarjeta 💳");
});





function continuarDespuesPago(tipoPago) {
  window.tipoPagoSeleccionado = tipoPago;

  document.getElementById("PagoModal").style.display = "none";
  document.getElementById("TarjetaModal").style.display = "none";

  document.getElementById("EntregaModal").style.display = "grid";
}


//=============== Recoger en Local ===================
document.getElementById("RecogerLocalBtn")?.addEventListener("click", () => {
  pedidoEntrega = "LOCAL";
  pedidoDireccion = null;

  document.getElementById("EntregaModal").style.display = "none";
  document.getElementById("PagoModal").style.display = "grid";
});


// ================ Enviar a Domicilio ================
document.getElementById("EnviarDomicilioBtn")?.addEventListener("click", async () => {
  pedidoEntrega = "DOMICILIO";

  document.getElementById("EntregaModal").style.display = "none";
  document.getElementById("DireccionEnvioModal").style.display = "grid";

  cargarDireccionesEnvio();
});

//=================== Cerrar Entrega ========================
document.getElementById("CerrarEntregaModal")?.addEventListener("click", () => {
    document.getElementById("EntregaModal").style.display = "none";
  });


//================== Direcciones de Envio ==============
async function cargarDireccionesEnvio() {
  const res = await fetch("/perfil/direcciones");
  const dirs = await res.json();

  const cont = document.getElementById("DireccionesEnvio");

  cont.innerHTML = dirs.map(d => `
    <div class="card p direccion-envio"
      onclick="seleccionarDireccion(${d.ID_DIRECCION}, this)">
      <strong>${d.CALLE} ${d.NUM_EXT}</strong>
      <p>${d.COLONIA}, ${d.CIUDAD}</p>
    </div>
  `).join("");
}



//============== Seleccionar Direccion =====================0
function seleccionarDireccion(id, el) {
  pedidoDireccion = id;

  document.querySelectorAll(".direccion-envio")
    .forEach(d => d.classList.remove("selected"));

  el.classList.add("selected");
}


// =========== Confirmar Envio ===============================000
document.getElementById("ConfirmarEnvioBtn")?.addEventListener("click", () => {
  if (!pedidoDireccion) {
    alert("Selecciona una dirección");
    return;
  }

  document.getElementById("DireccionEnvioModal").style.display = "none";
  document.getElementById("PagoModal").style.display = "grid";
});



// ========================== Finalizar Pedido ==============================
async function finalizarPedido() {
  const res = await fetch("/pedido/finalizar", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      total: calcularTotalCarrito(),
      tipoPago: pedidoPago,
      tipoEntrega: pedidoEntrega,
      idDireccion: pedidoDireccion,
      idTarjeta: pedidoTarjeta
    })

  });

  const r = await res.json();
  if (!r.ok) {
    alert("Error al confirmar pedido");
    return;
  }

  alert("Pedido confirmado ✅");
  limpiarCarrito();
}

document.addEventListener("DOMContentLoaded", () => {

  const checkoutBtn = document.getElementById("checkoutBtn");

  if (checkoutBtn) {
    checkoutBtn.addEventListener("click", () => {
      cerrarTodosLosModales();
      document.getElementById("EntregaModal").style.display = "grid";
    });
  }

});

function cerrarTodosLosModales() {
  document.querySelectorAll(".modal").forEach(m => m.style.display = "none");
}

function calcularTotalCarrito() {
  return cartTotal;
}

function calcularTotalCarrito() {
  const totalText = document.getElementById("cartTotal")?.innerText || "$0";
  return parseFloat(totalText.replace("$", ""));
}

function limpiarCarrito() {
  localStorage.removeItem("carrito");
  location.reload();
}

async function cargarMisDatos() {
  const grid = document.getElementById("MisDatosGrid");
  if (!grid) return;

  grid.innerHTML = "Cargando datos...";

  try {
    const res = await fetch("/mi-perfil");
    const data = await res.json();

    if (!data.ok) {
      grid.innerHTML = "No se pudieron cargar tus datos";
      return;
    }

    const { nombre, email, password } = data.usuario;

    grid.innerHTML = `
      <div class="card">
        <h3>Mis datos</h3>

        <p><strong>Nombre:</strong> ${nombre}</p>
        <p><strong>Email:</strong> ${email}</p>
      </div>
    `;

  } catch (err) {
    console.error(err);
    grid.innerHTML = "Error al cargar datos";
  }
}

document.addEventListener("DOMContentLoaded", () => {
  if (document.getElementById("MisDatosGrid")) {
    cargarMisDatos();
  }
});

async function cargarPlatilloTopMes() {
  const contenedor = document.getElementById("PlatilloTopContenido");
  if (!contenedor) return;

  try {
    const res = await fetch("/admin/platillo-top-mes");
    const data = await res.json();

    if (!data.ok || !data.platillo) {
      contenedor.innerHTML = "No hay datos para este mes";
      return;
    }

    const { NOMBRE, total_vendido, total_generado } = data.platillo;

    contenedor.innerHTML = `
      <p><strong>Platillo:</strong> ${NOMBRE}</p>
      <p><strong>Pedidos:</strong> ${total_vendido}</p>
      <p><strong>Total generado:</strong> $${Number(total_generado).toFixed(2)}</p>
    `;

  } catch (err) {
    console.error(err);
    contenedor.innerHTML = "Error al cargar información";
  }
}

document.addEventListener("DOMContentLoaded", () => {
  if (document.getElementById("PlatilloTopMes")) {
    cargarPlatilloTopMes();
  }
});

function activarBuscador(inputId, gridSelector) {
  const input = document.getElementById(inputId);
  const grid = document.querySelector(gridSelector);

  if (!input || !grid) return;

  input.addEventListener("input", () => {
    const texto = input.value.toLowerCase();

    grid.querySelectorAll(".card").forEach(card => {
      const contenido = card.innerText.toLowerCase();
      card.style.display = contenido.includes(texto) ? "" : "none";
    });
  });
}

activarBuscador("BuscadorMenu", "#menuGrid");
activarBuscador("BuscadorAdminPlatillos", "#PlatillosGrid");















































// ---------- UI bindings ---------- 
const seedBtn = $('#seedBtn');
if (seedBtn) seedBtn.addEventListener('click', OpenInitSesion);

const regBtn = $('#RegistrarBtn');
if (regBtn) regBtn.addEventListener('click', OpenCrearCuenta);

//$('#checkoutBtn').addEventListener('click', checkout);








