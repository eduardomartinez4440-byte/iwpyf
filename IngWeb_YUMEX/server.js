const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');

const path = require('path');

const cookieParser = require('cookie-parser');
const { v4: uuidv4 } = require('uuid');
const multer = require("multer");

const app = express();

app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname));
app.use('/build/img', express.static(path.join(__dirname,'build/img/'))); // CSS / IMG / JS

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "build/img"));
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  }
});

const upload = multer({ storage });

function verificarSesion(req, res, next) {
  const idCuenta = req.cookies.id_cuenta;
  if (!idCuenta) {
    return res.status(401).json({ ok: false });
  }
  next();
}







// Conexión MySQL
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '123456789',
  database: 'YumexBD'
});

db.connect(err => {
  if (err) {
    console.error('❌ Error al conectar con MySQL:', err);
    return;
  }
  console.log('✅ Conexión a MySQL exitosa');
});


// Ruta principal
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});










//========================= SECCION cuentas ===========================

// 🔥 LIMPIAR TOKEN DE SESIONES AL INICIAR EL SERVIDOR
function limpiarSesiones() {
  const query1 = 'UPDATE cuentas SET token_sesion = NULL';

  db.query(query1, err => {
    if (err) console.error('❌ Error al limpiar sesiones cuentas:', err);
    else console.log('🧹 Tokens limpiados en cuentas');
  });
} 

// Ejecutar limpieza cada vez que el servidor arranque
limpiarSesiones();

//Validación de usuario y password
function validarCredenciales(usuario, password) {
  const regexCorreo = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const regexMayus = /[A-Z]/;
  const regexMinus = /[a-z]/;
  const regexNumero = /[0-9]/;

  let errores = [];

  if (!regexCorreo.test(usuario)) errores.push("El usuario debe ser un correo válido.");
  if (!regexMayus.test(password)) errores.push("La contraseña debe tener mínimo 1 mayúscula.");
  if (!regexMinus.test(password)) errores.push("La contraseña debe tener mínimo 1 minúscula.");
  if (!regexNumero.test(password)) errores.push("La contraseña debe tener mínimo 1 número.");
  if (password.length < 8) errores.push(`Faltan ${8 - password.length} caracteres para alcanzar 8.`);

  return errores;
}

app.post('/crearCuenta', (req, res) => {
  const { RegUsuario, RegPassword, RegNombre } = req.body;

  if (!RegUsuario || !RegPassword || !RegNombre) {
    return res.json({
      ok: false,
      mensaje: "❌ Faltan datos para crear la cuenta."
    });
  }

  // 🔍 Revisar requisitos con la función que ya tienes
  const errores = validarCredenciales(RegUsuario, RegPassword);

  if (errores.length > 0) {
    return res.json({
      ok: false,
      mensaje: errores.join('\n')
    });
  }

  // 👍 Si todo está bien, revisar si el usuario ya existe
  const queryExiste = "SELECT * FROM cuentas WHERE EMAIL = ?";
  db.query(queryExiste, [RegUsuario], (err, results) => {
    if (err) {
      console.error("❌ Error al consultar cuentas:", err);
      return res.json({
        ok: false,
        mensaje: "Error interno del servidor."
      });
    }

    if (results.length > 0) {
      return res.json({
        ok: false,
        mensaje: "❌ Este correo ya está registrado."
      });
    }

    // Insertar en BD
    const queryInsert = "INSERT INTO cuentas (NOMBRE, EMAIL, PASSWORD) VALUES (?, ?, ?)";
    db.query(queryInsert, [RegNombre, RegUsuario, RegPassword], (err2) => {
      if (err2) {
        console.error("❌ Error al crear cuenta:", err2);
        return res.json({
          ok: false,
          mensaje: "Error al registrar usuario."
        });
      }
      res.clearCookie('token_sesion');  // ← Limpia la sesión anterior EIMINAR LINEA O COMENTAR
      return res.json({
        ok: true,
        mensaje: `✅ Cuenta creada correctamente. Bienvenido, ${RegNombre}!`
      });
    });
  });
});


// Login con validación + generación de token
app.post('/login', (req, res) => {
  const { usuario, password } = req.body;

  if (!usuario || !password) {
    return res.json({ 
      ok: false, 
      mensaje: '❌ Faltan datos en el formulario.' 
    });
  }

  // Validar formato
  const errores = validarCredenciales(usuario, password);
  if (errores.length > 0) {
    return res.json({
      ok: false,
      mensaje: errores.join('\n')
    });
  }

  // Buscar usuario
  const queryUser = 'SELECT * FROM cuentas WHERE EMAIL = ?';

  db.query(queryUser, [usuario], (err, results) => {
    if (err) {
      console.error('❌ Error al consultar cuentas:', err);
      return res.json({
        ok: false,
        mensaje: 'Error interno del servidor.'
      });
    }

    // Si no existe
    if (results.length === 0) {
      return res.json({
        ok: false,
        mensaje: '❌ Usuario no encontrado.'
      });
    }

    const user = results[0];

    // ⭐⭐⭐ NUEVO: Verificar si está activo ⭐⭐⭐
    if (user.ACTIVO === 0) {
      return res.json({
        ok: false,
        mensaje: '⚠️ Tu cuenta está deshabilitada. Contacta al administrador.'
      });
    }

    // Validar contraseña
    if (user.PASSWORD !== password) {
      return res.json({ 
        ok: false, 
        mensaje: '❌ Contraseña incorrecta.' 
      });
    }

    // Crear token
    const token = uuidv4();

    // Guardar token
    const sqlUpdate = 'UPDATE cuentas SET token_sesion = ? WHERE EMAIL = ?';
    db.query(sqlUpdate, [token, usuario], (err2) => {
      if (err2) {
        console.error('❌ Error al guardar token CUENTA:', err2);
        return res.json({ 
          ok: false, 
          mensaje: 'Error al guardar sesión.' 
        });
      }

      // Cookie token
      res.cookie('token_sesion', token, {
        httpOnly: true,
        maxAge: 1000 * 60 * 10
      });

      // Cookie id
      res.cookie('id_cuenta', user.ID_CUENTA, {
        httpOnly: true,
        maxAge: 1000 * 60 * 10
      });

      // Respuesta exitosa
      return res.json({
        ok: true,
        mensaje: `✅ Bienvenido, ${user.NOMBRE}!`,
        rol: user.ROL
      });
    });
  });
});

app.post("/logout", (req, res) => {
  res.clearCookie("id_cuenta");
  res.json({ ok: true });
});


//ENTRAR EN LA BASE DE DATOS Y BUSCAR EL USUARIO
// Ruta protegida (requiere sesión)
// COMPROBAR SESIÓN
app.get('/bienvenido', (req, res) => {
  const token = req.cookies.token_sesion;
  if (!token) {
    return res.json({ 
      ok: false, 
      mensaje: 'No hay sesión' 
    });
  }
  
  const query = 'SELECT NOMBRE, ROL FROM cuentas WHERE token_sesion = ?';
  // ANTES  db.query(query, [token, token], (err, results) =>
  db.query(query, [token, ], (err, results) => {
    if (err || results.length === 0) {
      return res.json({ 
        ok: false, 
        mensaje: 'Sesión no válida.' 
      });
    }
    const user = results[0];
    res.json({ 
      ok: true, 
      usuario: user.NOMBRE, 
      rol: user.ROL
    });
  });
});

// Cerrar sesión
app.get('/logout', async (req, res) => {
  const token = req.cookies.token_sesion;

  if (token) {
    try {
      // Borrar token en la BD
      await db.promise().query(
        'UPDATE cuentas SET token_sesion = NULL WHERE token_sesion = ?',
        [token]
      );

      // Borrar ambas cookies correctamente (misma configuración que login)
      res.clearCookie('token_sesion', {
        httpOnly: true,
        sameSite: "lax",
        secure: false,
        path: "/"
      });

      res.clearCookie('id_cuenta', {
        httpOnly: true,
        sameSite: "lax",
        secure: false,
        path: "/"
      });

    } catch (err) {
      console.error("Error al cerrar sesión:", err);
    }
  }

  res.json({ ok: true });
});












//================================ MENU ================================

// ================= MENU CLIENTE =================
// Ruta pública para mostrar platillos activos
app.get('/platillos', (req, res) => {
  
  const sql = `
    SELECT 
      ID_PLATILLO, 
      NOMBRE, 
      PRECIO, 
      DESCRIPCION, 
      IMAGEN, 
      STOCK, 
      CATEGORIA,
      TIEMPO_PREPARACION
    FROM platillos
    WHERE ACTIVO = 1
  `;

  db.query(sql, (err, rows) => {
    if (err) {
      console.error('❌ Error obteniendo platillos:', err);
      return res.status(500).json({ ok: false });
    }

    res.json(rows);
  });
});


// RUTA PARA OBTENER PLATILLOS
app.get('/admin/platillos', (req, res) => {
  const sql = `
    SELECT ID_PLATILLO, NOMBRE, PRECIO, STOCK, ACTIVO
    FROM platillos
  `;
  db.query(sql, (err, rows) => {
    if (err) return res.status(500).json({ ok:false });
    res.json(rows);
  });
});

app.get('/admin/usuarios', (req, res) => {
  const sql = `
    SELECT ID_CUENTA, NOMBRE, EMAIL, ROL, ACTIVO
    FROM cuentas
  `;
  db.query(sql, (err, rows) => {
    if (err) return res.status(500).json({ ok:false });
    res.json(rows);
  });
});




// AGREGAR PLATILLO (ADMIN)
app.post("/platillos/agregar", upload.single("imagen"), (req, res) => {
  const { nombre, precio, descripcion, categoria, stock, tiempo } = req.body;
  const imagen = req.file ? req.file.filename : null;
  
/*
  if (!nombre || !precio || !descripcion || !stock || !categoria) {
    return res.json({
      ok: false,
      mensaje: "Faltan datos del platillo"
    });
  }
*/

    const sql = `
    INSERT INTO platillos (
      NOMBRE, 
      PRECIO, 
      DESCRIPCION, 
      IMAGEN, 
      STOCK, 
      CATEGORIA, 
      TIEMPO_PREPARACION, 
      ACTIVO)
    VALUES (?, ?, ?, ?, ?, ?, ?, 1)
  `;

  db.query(sql, [nombre, precio, descripcion, imagen, stock, categoria, tiempo], (err) => {
    if (err) {
      console.error("❌ Error al agregar platillo:", err);
      return res.json({
        ok: false,
        mensaje: "Error al guardar platillo"
      });
    }

    res.json({
      ok: true,
      mensaje: "✅ Platillo agregado correctamente"
    });
  });
});

//ELIMINAR LOS platillos DE LA BD 
app.post('/platillos/eliminar', (req, res) => {
  const { id } = req.body;
  if (!id) return res.json({ 
    ok: false, 
    mensaje: 'No se recibió ID del platillo' 
  });

  const sql = 'DELETE FROM platillos WHERE ID_PLATILLO = ?';
  db.query(sql, [id], (err, result) => {
    if (err) {
      console.error('Error al eliminar platillo:', err);
      return res.json({ 
        ok: false, 
        mensaje: 'Error al eliminar platillo en BD' 
      });
    }
    return res.json({ 
      ok: true, 
      mensaje: 'Platillo eliminado de BD correctamente' 
    });
  });
});

// LINEA HASTA EL FINAL 
app.use(express.static(path.join(__dirname)));

//EDITAR PLATILLO
app.post("/platillos/editar", upload.single("imagen"), (req, res) => {
  const { id, nombre, precio, descripcion, stock, categoria, tiempo } = req.body;
  const nuevaImagen = req.file ? req.file.filename : null;
  /*
  if (!id || !nombre || !precio || !descripcion || !categoria) {
    return res.json({ 
      ok: false, 
      mensaje: "Faltan datos para actualizar." 
    });
  }
  */
  
  let sql = `
  UPDATE platillos 
  SET NOMBRE = ?, PRECIO = ?, STOCK = ?, CATEGORIA = ?, TIEMPO_PREPARACION = ?
  `;
  let params = [nombre, precio, stock, categoria, tiempo];

  if (descripcion) {
    sql += `, DESCRIPCION = ? `;
    params.push(descripcion);
  }

  if (nuevaImagen) {
    sql += `, IMAGEN = ? `;
    params.push(nuevaImagen);
  }

  sql += ` WHERE ID_PLATILLO = ?`;
  params.push(id);

  db.query(sql, params, (err) => {
    if (err) {
      console.error("❌ Error al actualizar:", err);
      return res.json({ 
        ok: false, 
        mensaje: "Error al actualizar platillo." 
      });
    }

    res.json({ 
      ok: true, 
      mensaje: "Platillo actualizado correctamente" 
    });
  });
});












//---------------------SECCION reseñas-------------------------
// AGREGA reseñas USANDO EL TOKEN DE SESION
app.post("/resenas", (req, res) => {
  const token = req.cookies.token_sesion;
  const { ID_PLATILLO, CALIFICACION, COMENTARIOS } = req.body;

  if (!ID_PLATILLO || !CALIFICACION || !COMENTARIOS) {
    return res.json({ 
      ok: false, 
      mensaje: "Datos de reseña incompletos" 
    });
  }

  const calificacionNum = Number(CALIFICACION);
  if (calificacionNum < 1 || calificacionNum > 5) {
    return res.json({ 
      ok: false, 
      mensaje: "Calificación inválida" 
    });
  }

  // ❌ Invitados NO pueden reseñar
  if (!token) {
    return res.json({
      ok: false,
      mensaje: "Solo usuarios registrados pueden agregar reseñas"
    });
  }

  // 🔥 BUSCAR ID_CUENTA usando el token
  const userQuery = "SELECT ID_CUENTA FROM cuentas WHERE token_sesion = ?";

  db.query(userQuery, [token], (err, data) => {
    if (err || data.length === 0) {
      return res.json({
        ok: false,
        mensaje: "Sesión inválida, vuelve a iniciar sesión"
      });
    }

    const userId = data[0].ID_CUENTA;

    // 🔥 Insertar reseña con el ID correcto
    const sql = `
      INSERT INTO reseñas 
      (ID_PLATILLO, ID_CUENTA, CALIFICACION, COMENTARIOS)
      VALUES (?, ?, ?, ?)
    `;

    db.query(sql, [ID_PLATILLO, userId, calificacionNum, COMENTARIOS], (err2) => {
      if (err2) {
        console.log("ERR SQL:", err2);
        return res.json({ ok: false, mensaje: "Error al guardar reseña (SQL)" });
      }
      res.json({ ok: true, mensaje: "Reseña agregada correctamente" });
    });
  });
});


// ---------------- OBTENER reseñas ----------------
// ---------------- OBTENER reseñas ----------------
app.get("/resenas/:idPlatillo", (req, res) => {
  const id = req.params.idPlatillo;

  const sql = `
    SELECT 
      r.CALIFICACION,
      r.COMENTARIOS,
      r.FECHA,
      COALESCE(c.NOMBRE, 'Anónimo') AS usuario
    FROM reseñas r
    LEFT JOIN cuentas c ON r.ID_CUENTA = c.ID_CUENTA
    WHERE r.ID_PLATILLO = ?
    ORDER BY r.FECHA DESC
  `;

  db.query(sql, [id], (err, data) => {
    if (err) return res.json({ ok: false, mensaje: "Error al obtener reseñas" });

    // Calcular total de reseñas
    const total = data.length;

    // Calcular promedio de calificaciones
    const promedio =
      total > 0
        ? data.reduce((sum, r) => sum + r.CALIFICACION, 0) / total
        : 0;

    res.json({
      ok: true,
      reseñas: data,
      total,
      promedio: Number(promedio.toFixed(1)) // redondeado
    });
  });
});





















// -- MOSTRAR USUARIOS --
// Obtener todos los usuarios (solo para administrador)
app.get('/admin/getUsuarios', (req, res) => {
   console.log("📥 Se llamó a /admin/getUsuarios");  // <--- AGREGA ESTO

  // const sql = "SELECT ID_CUENTA AS ID, NOMBRE, EMAIL, IMAGEN, ROL FROM cuentas";
  const sql = "SELECT ID_CUENTA AS ID, NOMBRE, EMAIL, IMAGEN, ROL, ACTIVO FROM cuentas";


  db.query(sql, (err, rows) => {
    if (err) {
      console.error("❌ Error al obtener usuarios:", err);
      return res.json({ ok: false });
    }

    return res.json({
      ok: true,
      usuarios: rows
    });
  });
});

// CAMBIAR ROL DE USUARIO (ADMIN)
app.post("/admin/cambiarRol", (req, res) => {
  const { idUsuario, rol } = req.body;

  const rolesValidos = ["Invitado", "Cliente","Empleado", "Administrador"];
  if (!rolesValidos.includes(rol)) {
    return res.json({ ok: false, mensaje: "Rol inválido" });
  }

  const sql = "UPDATE cuentas SET ROL = ? WHERE ID_CUENTA = ?";

  db.query(sql, [rol, idUsuario], (err) => {
    if (err) {
      console.error("Error cambiando rol:", err);
      return res.json({ ok: false, mensaje: "Error en BD" });
    }

    res.json({ ok: true });
  });
});


// -- ELIMINAR USUARIO (solo administrador) ESTA SE VA A IRRR--
app.post('/admin/eliminarUsuario', (req, res) => {
  const { id } = req.body;

  if (!id) {
    return res.json({ ok: false, mensaje: "ID no proporcionado" });
  }

  const sql = "DELETE FROM cuentas WHERE ID_CUENTA = ?";

  db.query(sql, [id], (err, result) => {
    if (err) {
      console.error("❌ Error eliminando usuario:", err);
      return res.json({ ok: false, mensaje: "Error eliminando usuario ((;" });
    }

    if (result.affectedRows === 0) {
      return res.json({ ok: false, mensaje: "Usuario no encontrado" });
    }

    return res.json({ ok: true });
  });
});

// -- HABILITAR / DESHABILITAR USUARIO --
app.post('/admin/toggleUsuario', (req, res) => {
  const { id } = req.body;

  if (!id) {
    return res.json({ ok: false, mensaje: "ID no proporcionado" });
  }

  // Obtener estado actual
  const getSql = "SELECT ACTIVO FROM cuentas WHERE ID_CUENTA = ?";

  db.query(getSql, [id], (err, rows) => {
    if (err || rows.length === 0) {
      return res.json({ ok: false, mensaje: "Usuario no encontrado" });
    }

    const nuevoEstado = rows[0].ACTIVO ? 0 : 1;

    // Cambiar el estado
    const updateSql = "UPDATE cuentas SET ACTIVO = ? WHERE ID_CUENTA = ?";

    db.query(updateSql, [nuevoEstado, id], (err2) => {
      if (err2) {
        console.error("❌ Error al cambiar estado del usuario:", err2);
        return res.json({ ok: false, mensaje: "Error al cambiar estado" });
      }

      return res.json({
        ok: true,
        nuevoEstado
      });
    });
  });
});



app.get("/obtenerpedidos1", (req, res) => {
  const idCuenta = req.cookies.id_cuenta;

  // Si no existe cookie = no hay sesión válida
  if (!idCuenta) {
    return res.status(401).json({
      ok: false,
      mensaje: "No hay sesión activa o falta id_cuenta."
    });
  }

  console.log("🟦 Solicitando pedidos para ID_CUENTA =", idCuenta);

  db.query(
  `SELECT 
      p.ID_PEDIDO,
      p.ID_CUENTA,
      p.FECHA_COMPRA,
      p.TIPO_PAGO,
      p.TOTAL,
      p.ESTADO,
      d.CANTIDAD,
      pl.NOMBRE AS NOMBRE_PLATILLO,
      pl.PRECIO AS PRECIO_UNITARIO       -- 🔥 AÑADIDO
   FROM pedidos p
   JOIN pedido_detalle d ON d.ID_PEDIDO = p.ID_PEDIDO
   JOIN platillos pl ON pl.ID_PLATILLO = d.ID_PLATILLO
   WHERE p.ID_CUENTA = ?
   ORDER BY p.ID_PEDIDO DESC`,
  [idCuenta],
  (err, rows) => {
    if (err) {
      console.error("Error al obtener pedidos:", err);
      return res.status(500).json({ error: "Error obteniendo pedidos" });
    }

    console.log("🟩 pedidos encontrados:", rows.length);
    res.json(rows);
  }
);

});



app.post('/eliminarpedido', (req, res) => {
  const { id } = req.body;

  db.query(
    "DELETE FROM pedidos WHERE ID_PEDIDO = ?",
    [id],
    (err, result) => {
      if (err) {
        console.log("Error eliminando pedido:", err);
        return res.status(500).json({ ok: false, mensaje: "Error al eliminar" });
      }

      res.json({ ok: true, mensaje: "Pedido eliminado" });
    }
  );
});





// GUARDAR PEDIDO EN BD
app.post("/pedidosbd", async (req, res) => {
  const { items, tipo_pago } = req.body;
  const ID_CUENTA = req.cookies.id_cuenta;

  if (!ID_CUENTA) {
    return res.status(401).json({ ok: false });
  }

  // 🔍 VALIDAR STOCK ANTES DE GUARDAR PEDIDO
  for (const item of items) {
    const [rows] = await db.promise().query(
      "SELECT STOCK FROM platillos WHERE ID_PLATILLO = ?",
      [item.id]
    );

    if (!rows.length || rows[0].STOCK < item.qty) {
      return res.json({
        ok: false,
        mensaje: "❌ Stock insuficiente para algunos platillos"
      });
    }
  }

  // ✅ SI PASA LA VALIDACIÓN, CONTINÚA NORMAL
  const total = items.reduce((s, it) => s + it.qty * it.price, 0);

  db.query(
    `INSERT INTO pedidos 
     (ID_CUENTA, FECHA_COMPRA, TOTAL, ESTADO, TIPO_PAGO)
     VALUES (?, NOW(), ?, 'prep', ?)`,
    [ID_CUENTA, total, tipo_pago || 'efectivo'],
    (err, result) => {
      if (err) return res.json({ ok: false });

      const idPedido = result.insertId;

      const values = items.map(i => [
        idPedido,
        i.id,
        i.qty,
        i.price
      ]);

      db.query(
        `INSERT INTO pedido_detalle 
         (ID_PEDIDO, ID_PLATILLO, CANTIDAD, PRECIO_UNITARIO)
         VALUES ?`,
        [values],
        err2 => {
          if (err2) return res.json({ ok: false });

          // 🔻 DESCONTAR STOCK
          items.forEach(item => {
            db.query(
              `UPDATE platillos
               SET STOCK = STOCK - ?
               WHERE ID_PLATILLO = ? AND STOCK >= ?`,
              [item.qty, item.id, item.qty]
            );
          });

          res.json({ ok: true });
        }
      );
    }
  );
});




//PARA EL ADMIN
app.get("/obtenerpedidos_admin", (req, res) => {
  db.query(
    `SELECT 
        p.ID_PEDIDO,
        p.ID_CUENTA,
        p.FECHA_COMPRA,
        p.TOTAL
     FROM pedidos p
     ORDER BY p.ID_PEDIDO DESC`,
    (err, rows) => {
      if (err) {
        console.error("Error:", err);
        return res.status(500).json({ error: "Error obteniendo pedidos" });
      }
      res.json(rows);
    }
  );
});

// ACTIVAR / DESACTIVAR PLATILLO
// ACTIVAR / DESACTIVAR PLATILLO
app.post('/platillos/toggle', (req, res) => {
  const { id } = req.body;

  const sql = `
    UPDATE platillos 
    SET ACTIVO = CASE WHEN ACTIVO = 1 THEN 0 ELSE 1 END
    WHERE ID_PLATILLO = ?
  `;

  db.query(sql, [id], (err, result) => {   // ← Aquí se cambió conn por db
    if (err) {
      console.error("❌ Error actualizando ACTIVO:", err);
      return res.json({ ok: false, mensaje: "Error en BD" });
    }

    res.json({ ok: true });
  });
});

app.get('/empleado/getpedidos', (req, res) => {
  const token = req.cookies.token_sesion;
  if (!token) return res.status(401).json({ ok: false });

  db.query(
    "SELECT ROL FROM cuentas WHERE token_sesion = ?",
    [token],
    (err, r) => {
      if (err || r.length === 0 || r[0].ROL !== 'Empleado') {
        return res.status(403).json({ ok: false });
      }

      const query = `
        SELECT 
          p.ID_PEDIDO,
          p.ID_CUENTA,
          c.NOMBRE AS NOMBRE_CLIENTE,
          p.ESTADO,
          p.TOTAL,
          p.TIPO_PAGO,
          d.ID_PLATILLO,
          d.CANTIDAD,
          pl.NOMBRE AS NOMBRE_PLATILLO
        FROM pedidos p
        JOIN pedido_detalle d ON p.ID_PEDIDO = d.ID_PEDIDO
        JOIN platillos pl ON pl.ID_PLATILLO = d.ID_PLATILLO
        JOIN cuentas c ON c.ID_CUENTA = p.ID_CUENTA
        ORDER BY p.ID_PEDIDO DESC
      `;


      db.query(query, (err2, rows) => {
        if (err2) return res.json({ ok: false });

        const pedidos = {};

        rows.forEach(r => {
          if (!pedidos[r.ID_PEDIDO]) {
            pedidos[r.ID_PEDIDO] = {
              ID_PEDIDO: r.ID_PEDIDO,
              ID_CUENTA: r.ID_CUENTA,
              NOMBRE_CLIENTE: r.NOMBRE_CLIENTE,
              ESTADO: r.ESTADO,
              TOTAL: r.TOTAL,          // ✅ AGREGADO
              TIPO_PAGO: r.TIPO_PAGO,  // ✅ AGREGADO
              platillos: []
            };
          }

          pedidos[r.ID_PEDIDO].platillos.push({
            NOMBRE_PLATILLO: r.NOMBRE_PLATILLO,
            CANTIDAD: r.CANTIDAD
          });
        });

        res.json({ ok: true, pedidos: Object.values(pedidos) });
      });
    }
  );
});

app.post('/empleado/actualizarestado', (req, res) => {
  const { id, estado } = req.body;

  if (!id || !estado) {
    return res.json({ ok: false });
  }

  db.query(
    "UPDATE pedidos SET ESTADO = ? WHERE ID_PEDIDO = ?",
    [estado, id],
    (err) => {
      if (err) return res.json({ ok: false });
      res.json({ ok: true });
    }
  );
});

app.post("/guardar-tarjeta", (req, res) => {
  const token = req.cookies.token_sesion;
  const { numero, nombre, exp } = req.body;

  if (!token) return res.status(401).json({ ok: false });

  db.query(
    "SELECT ID_CUENTA FROM cuentas WHERE token_sesion = ?",
    [token],
    (err, r) => {
      if (err || r.length === 0) return res.json({ ok: false });

      const ID_CUENTA = r[0].ID_CUENTA;

      // eliminamos tarjeta previa (1 tarjeta por usuario)
      db.query(
        "DELETE FROM tarjetas WHERE ID_CUENTA = ?",
        [ID_CUENTA],
        () => {
          db.query(
            `INSERT INTO tarjetas
             (ID_CUENTA, NUMERO_TARJETA, NOMBRE_TITULAR, FECHA_EXP)
             VALUES (?, ?, ?, ?)`,
            [ID_CUENTA, numero, nombre, exp],
            err2 => {
              if (err2) return res.json({ ok: false });
              res.json({ ok: true });
            }
          );
        }
      );
    }
  );
});

// KPIs del panel de administración
app.get('/api/admin/kpis', (req, res) => {

    const qVentas = `SELECT IFNULL(SUM(TOTAL),0) AS ventas FROM PEDIDOS`;
    const qPedidos = `SELECT COUNT(*) AS pedidos FROM PEDIDOS`;
    const qTicket = `SELECT IFNULL(AVG(TOTAL),0) AS ticket FROM PEDIDOS`;
    const qMenu = `SELECT COUNT(*) AS menu FROM PLATILLOS`;

    db.query(qVentas, (err, ventasRes) => {
        if (err) return res.status(500).json(err);

        db.query(qPedidos, (err, pedidosRes) => {
            if (err) return res.status(500).json(err);

            db.query(qTicket, (err, ticketRes) => {
                if (err) return res.status(500).json(err);

                db.query(qMenu, (err, menuRes) => {
                    if (err) return res.status(500).json(err);

                    res.json({
                        ventas: ventasRes[0].ventas,
                        pedidos: pedidosRes[0].pedidos,
                        ticket: ticketRes[0].ticket,
                        menu: menuRes[0].menu
                    });
                });
            });
        });
    });
});




//==========================Agregar Direccion =======================
app.post("/perfil/direccion", (req, res) => {
  const idCuenta = req.cookies.id_cuenta;
  const {
    calle, numExt, numInt,
    colonia, cp, municipio,
    ciudad, pais
  } = req.body;

  if (!idCuenta ||
      !calle || !numExt || !numInt ||
      !colonia || !cp || !municipio ||
      !ciudad || !pais) {
    return res.status(400).json({ ok: false, error: "Campos incompletos" });
  }

  const sql = `
    INSERT INTO direcciones
    (ID_CUENTA, CALLE, NUM_EXT, NUM_INT, COLONIA, CP, MUNICIPIO, CIUDAD, PAIS)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(sql, [
    idCuenta, calle, numExt, numInt,
    colonia, cp, municipio, ciudad, pais
  ], err => {
    if (err) {
      console.error(err);
      return res.status(500).json({ ok: false });
    }
    res.json({ ok: true });
  });
});


app.get("/perfil/direcciones", (req, res) => {
  const idCuenta = req.cookies.id_cuenta;
  if (!idCuenta) return res.status(401).json([]);

  db.query(
    "SELECT * FROM direcciones WHERE ID_CUENTA = ?",
    [idCuenta],
    (err, rows) => res.json(rows || [])
  );
});




//============================ Agregar Tarjeta ====================
app.post("/perfil/tarjeta", (req, res) => {
  const idCuenta = req.cookies.id_cuenta;
  const { titular, numero, fecha, cvv } = req.body;

  if (!idCuenta || !titular || !numero || !fecha || !cvv) {
    return res.status(400).json({ ok: false, error: "Campos incompletos" });
  }

  const sql = `
    INSERT INTO tarjetas
    (ID_CUENTA, TITULAR, NUM_TARJETA, FECHA_EXP, CVV)
    VALUES (?, ?, ?, ?, ?)
  `;

  db.query(sql, [idCuenta, titular, numero, fecha, cvv], err => {
    if (err) {
      console.error(err);
      return res.status(500).json({ ok: false });
    }
    res.json({ ok: true });
  });
});


app.get("/perfil/tarjetas", (req, res) => {
  const idCuenta = req.cookies.id_cuenta;
  if (!idCuenta) return res.status(401).json([]);

  db.query(
    "SELECT ID_TARJETA, TITULAR, NUM_TARJETA, FECHA_EXP FROM tarjetas WHERE ID_CUENTA = ?",
    [idCuenta],
    (err, rows) => res.json(rows || [])
  );
});




//========================== Editar Direccion =========================

app.get("/perfil/direccion/:id", (req, res) => {
  db.query(
    "SELECT * FROM direcciones WHERE ID_DIRECCION = ? AND ID_CUENTA = ?",
    [req.params.id, req.cookies.id_cuenta],
    (err, rows) => res.json(rows[0])
  );
});

app.put("/perfil/direccion/:id", (req, res) => {
  const { calle, numExt, numInt, colonia, cp, municipio, ciudad, pais } = req.body;

  const sql = `
    UPDATE direcciones SET
      CALLE=?, NUM_EXT=?, NUM_INT=?, COLONIA=?,
      CP=?, MUNICIPIO=?, CIUDAD=?, PAIS=?
    WHERE ID_DIRECCION=? AND ID_CUENTA=?
  `;

  db.query(sql, [
    calle, numExt, numInt, colonia,
    cp, municipio, ciudad, pais,
    req.params.id, req.cookies.id_cuenta
  ], err => {
    if (err) return res.json({ ok: false });
    res.json({ ok: true });
  });
});


//======================== Tarjeta Editar =========================

app.get("/perfil/tarjeta/:id", (req, res) => {
  db.query(
    "SELECT * FROM tarjetas WHERE ID_TARJETA=? AND ID_CUENTA=?",
    [req.params.id, req.cookies.id_cuenta],
    (err, rows) => res.json(rows[0])
  );
});

app.put("/perfil/tarjeta/:id", (req, res) => {
  const { titular, numero, fecha, cvv } = req.body;

  db.query(
    `UPDATE tarjetas 
     SET TITULAR=?, NUM_TARJETA=?, FECHA_EXP=?, CVV=?
     WHERE ID_TARJETA=? AND ID_CUENTA=?`,
    [titular, numero, fecha, cvv, req.params.id, req.cookies.id_cuenta],
    err => {
      if (err) return res.json({ ok: false });
      res.json({ ok: true });
    }
  );
});


// ================ Pedido =================================
app.post("/pedido/finalizar", (req, res) => {
  const idCuenta = req.cookies.id_cuenta;
  const { total, tipoPago, tipoEntrega, idDireccion } = req.body;

  if (!idCuenta || !tipoPago || !tipoEntrega) {
    return res.status(400).json({ ok: false });
  }

  const sql = `
    INSERT INTO pedidos
    (ID_CUENTA, TOTAL, TIPO_PAGO, TIPO_ENTREGA, ID_DIRECCION)
    VALUES (?, ?, ?, ?, ?)
  `;

  db.query(sql, [
    idCuenta,
    total,
    tipoPago,
    tipoEntrega,
    tipoEntrega === "DOMICILIO" ? idDireccion : null
  ], (err, result) => {
    if (err) {
      console.error(err);
      return res.json({ ok: false });
    }

    res.json({ ok: true, idPedido: result.insertId });
  });
});

app.get("/tarjetas", verificarSesion, (req, res) => {
  const idCuenta = req.cookies.id_cuenta;

  if (!idCuenta) {
    return res.json({ ok: false, tarjetas: [] });
  }

  db.query(
    "SELECT ID_TARJETA, TITULAR, NUM_TARJETA, FECHA_EXP FROM tarjetas WHERE ID_CUENTA = ?",
    [idCuenta],
    (err, rows) => {
      if (err) {
        console.error("Error al obtener tarjetas:", err);
        return res.json({ ok: false, tarjetas: [] });
      }

      res.json({ ok: true, tarjetas: rows });
    }
  );
});

function verificarSesion(req, res, next) {
  const idCuenta = req.cookies.id_cuenta;

  if (!idCuenta) {
    return res.status(401).json({ ok: false, mensaje: "Sesión no válida" });
  }

  next();
}

app.get("/mi-perfil", verificarSesion, (req, res) => {
  const idCuenta = req.cookies.id_cuenta;

  db.query(
    "SELECT NOMBRE, EMAIL, PASSWORD FROM cuentas WHERE ID_CUENTA = ?",
    [idCuenta],
    (err, rows) => {
      if (err) {
        console.error("Error al obtener perfil:", err);
        return res.json({ ok: false });
      }

      if (rows.length === 0) {
        return res.json({ ok: false });
      }

      res.json({
        ok: true,
        usuario: {
          nombre: rows[0].NOMBRE,
          email: rows[0].EMAIL,
          password: rows[0].PASSWORD
        }
      });
    }
  );
});

app.get("/admin/platillo-top-mes", verificarSesion, (req, res) => {

  const sql = `
    SELECT 
      p.NOMBRE,
      SUM(pd.CANTIDAD) AS total_vendido,
      SUM(pd.CANTIDAD * pd.PRECIO_UNITARIO) AS total_generado
    FROM PEDIDOS pe
    JOIN PEDIDO_DETALLE pd ON pe.ID_PEDIDO = pd.ID_PEDIDO
    JOIN PLATILLOS p ON pd.ID_PLATILLO = p.ID_PLATILLO
    WHERE MONTH(pe.FECHA_COMPRA) = MONTH(CURRENT_DATE())
      AND YEAR(pe.FECHA_COMPRA) = YEAR(CURRENT_DATE())
    GROUP BY p.ID_PLATILLO
    ORDER BY total_vendido DESC
    LIMIT 1
  `;

  db.query(sql, (err, rows) => {
    if (err) {
      console.error("Error platillo top mes:", err);
      return res.json({ ok: false });
    }

    if (rows.length === 0) {
      return res.json({ ok: true, platillo: null });
    }

    res.json({
      ok: true,
      platillo: rows[0]
    });
  });
});
































app.listen(3000, () => {
  console.log('🚀 Servidor corriendo en http://localhost:3000');
});
