// routes.js
const express = require('express');
const router = express.Router();
const connection = require('./db');
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
router.post('/registros_usuarios', (req, res) => {
  const nuevoUsuario = req.body;
  connection.query('INSERT INTO tb_usuarios SET ?', nuevoUsuario, (err, results) => {
    if (err) {
      console.error('Error al crear un nuevo usuario:', err);
      res.status(500).json({ error: 'Error al crear un nuevo usuario' });
      return;
    }
    res.status(201).json({ message: 'Usuario creado exitosamente' });
  });
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

// Endpoint de Login con validación de id_rol
router.post('/login', (req, res) => {
  const { email, password } = req.body;

  // Buscar el usuario por su email
  connection.query('SELECT id_usuario, nombre, email, password, id_rol FROM tb_usuarios WHERE email = ?', [email], (err, results) => {
    if (err) {
      console.error('Error al buscar el usuario:', err);
      res.status(500).json({ error: 'Error interno del servidor' });
      return;
    }

    // Si el usuario no existe
    if (results.length === 0) {
      res.status(401).json({ error: 'Correo o contraseña incorrectos' });
      return;
    }

    const usuario = results[0];

    // Comparar la contraseña con bcrypt
    bcrypt.compare(password, usuario.password.replace('$2y$', '$2b$'), (err, isMatch) => {
      console.log('Hash almacenado:', usuario.password);
      console.log('Password ingresada:', password);
      console.log('ID Rol:', usuario.id_rol); // 👈 Aquí muestra el id_rol

      if (err) {
        console.error('Error al comparar contraseñas:', err);
        res.status(500).json({ error: 'Error interno del servidor' });
        return;
      }

      if (!isMatch) {
        res.status(401).json({ error: 'Correo o contraseña incorrectos' });
        return;
      }

      res.json({
        message: 'Login exitoso',
        usuario: {
          id: usuario.id_usuario,
          nombre: usuario.nombre,
          email: usuario.email,
          id_rol: usuario.id_rol
        }
      });
    });
  });
});

module.exports = router;