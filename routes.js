// routes.js
const express = require('express');
const router = express.Router();
const connection = require('./db');
const fetch = require('node-fetch'); // Realizar solicitudes HTTP
const ping = require('ping'); // Librería para hacer ping a IPs
const bcrypt = require('bcrypt');

//------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
// ---------- Rutas: Registros IoT
// Obtener todos los registros
router.get('/registros_iot', (req, res) => {
  connection.query('SELECT * FROM tb_registros_iot', (err, results) => {
    if (err) {
      console.error('Error al obtener registros:', err);
      res.status(500).json({ error: 'Error al obtener registros' });
      return;
    }
    res.json(results);
  });
});

// Obtener un registro por su ID
router.get('/registros_iot/:id', (req, res) => {
  const id = req.params.id;
  connection.query('SELECT * FROM tb_registros_iot WHERE id_registro = ?', id, (err, results) => {
    if (err) {
      console.error('Error al obtener el registro:', err);
      res.status(500).json({ error: 'Error al obtener el registro' });
      return;
    }
    if (results.length === 0) {
      res.status(404).json({ error: 'Registro no encontrado' });
      return;
    }
    res.json(results[0]);
  });
});

// Crear un nuevo registro
router.post('/registros_iot', (req, res) => {
  const nuevoRegistro = req.body;
  connection.query('INSERT INTO tb_registros_iot SET ?', nuevoRegistro, (err, results) => {
    if (err) {
      console.error('Error al crear un nuevo registro:', err);
      res.status(500).json({ error: 'Error al crear un nuevo registro' });
      return;
    }
    res.status(201).json({ message: 'Registro creado exitosamente' });
  });
});

// Actualizar un registro
router.put('/registros_iot/:id', (req, res) => {
  const id = req.params.id;
  const datosActualizados = req.body;
  connection.query('UPDATE tb_registros_iot SET ? WHERE id_registro = ?', [datosActualizados, id], (err, results) => {
    if (err) {
      console.error('Error al actualizar el registro:', err);
      res.status(500).json({ error: 'Error al actualizar el registro' });
      return;
    }
    res.json({ message: 'Registro actualizado exitosamente' });
  });
});

// Eliminar un registro
router.delete('/registros_iot/:id', (req, res) => {
  const id = req.params.id;
  connection.query('DELETE FROM tb_registros_iot WHERE id_registro = ?', id, (err, results) => {
    if (err) {
      console.error('Error al eliminar el registro:', err);
      res.status(500).json({ error: 'Error al eliminar el registro' });
      return;
    }
    res.json({ message: 'Registro eliminado exitosamente' });
  });
});


//------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
// ---------- Rutas: Usuarios
// Obtener todos los registros de usuarios
router.get('/registros_usuarios', (req, res) => {
  connection.query('SELECT * FROM tb_usuarios', (err, results) => {
    if (err) {
      console.error('Error al obtener usuarios:', err);
      res.status(500).json({ error: 'Error al obtener usuarios' });
      return;
    }
    res.json(results);
  });
});

// Obtener un usuario por su ID
router.get('/registros_usuarios/:id', (req, res) => {
  const id = req.params.id;
  connection.query('SELECT * FROM tb_usuarios WHERE id_usuario = ?', id, (err, results) => {
    if (err) {
      console.error('Error al obtener el usuario:', err);
      res.status(500).json({ error: 'Error al obtener el usuario' });
      return;
    }
    if (results.length === 0) {
      res.status(404).json({ error: 'Usuario no encontrado' });
      return;
    }
    res.json(results[0]);
  });
});

// Crear un nuevo usuario
router.post('/registros_usuarios', async (req, res) => {
  const { nombre, email, password, id_rol } = req.body;

  console.log('Datos recibidos:', { nombre, email, password, id_rol }); // Validar entrada

  if (!nombre || !email || !password || !id_rol) {
    return res.status(400).json({ error: 'Todos los campos son obligatorios.' });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    connection.query(
      'INSERT INTO tb_usuarios SET ?',
      { nombre, email, password: hashedPassword, id_rol },
      (err, results) => {
        if (err) {
          console.error('Error al registrar usuario:', err);
          return res.status(500).json({ error: 'Error al registrar usuario.' });
        }
        res.status(201).json({ message: 'Usuario registrado exitosamente.' });
      }
    );
  } catch (error) {
    console.error('Error al encriptar contraseña:', error);
    res.status(500).json({ error: 'Error al procesar el registro.' });
  }
});

// Actualizar un usuario
router.put('/registros_usuarios/:id', (req, res) => {
  const id = req.params.id;
  const datosActualizados = req.body;
  connection.query('UPDATE tb_usuarios SET ? WHERE id_usuario = ?', [datosActualizados, id], (err, results) => {
    if (err) {
      console.error('Error al actualizar el usuario:', err);
      res.status(500).json({ error: 'Error al actualizar el usuario' });
      return;
    }
    res.json({ message: 'Usuario actualizado exitosamente' });
  });
});

// Eliminar un usuario
router.delete('/registros_usuarios/:id', (req, res) => {
  const id = req.params.id;
  connection.query('DELETE FROM tb_usuarios WHERE id_usuario = ?', id, (err, results) => {
    if (err) {
      console.error('Error al eliminar el usuario:', err);
      res.status(500).json({ error: 'Error al eliminar el usuario' });
      return;
    }
    res.json({ message: 'Usuario eliminado exitosamente' });
  });
});

//------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

// ---------- Rutas: Expo-React

router.post('/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Correo y contraseña son obligatorios.' });
  }

  connection.query(
    'SELECT id_usuario, nombre, email, password, id_rol FROM tb_usuarios WHERE email = ?',
    [email],
    (err, results) => {
      if (err) {
        console.error('Error al buscar el usuario:', err);
        return res.status(500).json({ error: 'Error interno del servidor' });
      }

      if (results.length === 0) {
        return res.status(401).json({ error: 'Correo o contraseña incorrectos.' });
      }

      const usuario = results[0];
      if (!usuario.password) {
        return res.status(401).json({ error: 'Contraseña no encontrada para este usuario.' });
      }

      // Verificar la contraseña
      bcrypt.compare(password, usuario.password.replace('$2y$', '$2b$'), (err, isMatch) => {
        if (err) {
          console.error('Error al comparar contraseñas:', err);
          return res.status(500).json({ error: 'Error interno al verificar contraseña.' });
        }

        if (!isMatch) {
          return res.status(401).json({ error: 'Correo o contraseña incorrectos.' });
        }

        res.json({
          message: 'Login exitoso',
          usuario: {
            id: usuario.id_usuario,
            nombre: usuario.nombre,
            email: usuario.email,
            id_rol: usuario.id_rol,
          },
        });
      });
    }
  );
});

// Ruta: Detectar y registrar desde ESP32
router.post('/registrar_desde_esp32', async (req, res) => {
  try {
    const { id_usuario } = req.body;
    if (!id_usuario) {
      return res.status(400).json({ success: false, message: 'ID de usuario es obligatorio.' });
    }

    // Escanear red local para buscar el ESP32
    const baseIp = '192.168.1.'; // Cambiar según tu red local
    let esp32Ip = null;

    for (let i = 1; i <= 254; i++) {
      const targetIp = `${baseIp}${i}`;

      // Hacer ping a cada IP para verificar si está activa
      const isAlive = await ping.promise.probe(targetIp, { timeout: 1 });
      if (isAlive.alive) {
        try {
          // Intentar conectarse al endpoint del ESP32
          const response = await fetch(`http://${targetIp}/mandarDatos`);
          if (response.ok) {
            esp32Ip = targetIp;
            break; // Detener el escaneo una vez encontrado
          }
        } catch (error) {
          // Ignorar errores de conexión
        }
      }
    }

    if (!esp32Ip) {
      return res.status(404).json({
        success: false,
        message: 'No se pudo encontrar el ESP32 en la red local.',
      });
    }

    // Obtener datos del ESP32
    const esp32Response = await fetch(`http://${esp32Ip}/mandarDatos`);
    if (!esp32Response.ok) {
      return res.status(500).json({ success: false, message: 'Error al obtener datos del ESP32.' });
    }

    const data = await esp32Response.json();

    // Validar datos recibidos
    if (
      !data.flujo_agua ||
      !data.nivel_agua ||
      !data.temp ||
      !['solar', 'electricidad'].includes(data.energia)
    ) {
      return res.status(400).json({
        success: false,
        message: 'Datos incompletos o inválidos recibidos del ESP32.',
      });
    }

    // Insertar datos en la base de datos
    const nuevoRegistro = {
      flujo_agua: data.flujo_agua,
      nivel_agua: data.nivel_agua,
      temp: data.temp,
      energia: data.energia,
      id_usuario: id_usuario,
      created_at: new Date(),
      updated_at: new Date(),
    };

    connection.query('INSERT INTO tb_registros_iot SET ?', nuevoRegistro, (err) => {
      if (err) {
        console.error('Error al registrar en la base de datos:', err);
        return res.status(500).json({ success: false, message: 'Error al registrar datos en la base de datos.' });
      }
      return res.status(201).json({
        success: true,
        message: 'Datos registrados correctamente desde ESP32.',
      });
    });
  } catch (error) {
    console.error('Error inesperado:', error);
    res.status(500).json({ success: false, message: 'Error inesperado en el servidor.' });
  }
});

module.exports = router;