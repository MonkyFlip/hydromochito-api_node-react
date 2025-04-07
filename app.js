const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const routes = require('./routes'); // Tus rutas definidas
const path = require('path');

// Middleware
app.use(bodyParser.json());

// Configurar EJS como motor de plantillas
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware para configurar las cabeceras CORS
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});

// Ruta para mostrar el menú de inicio
app.get('/', (req, res) => {
  res.render('menu'); // Renderiza la vista "menu.ejs"
});

// Rutas de la API
app.use('/api', routes);

// Puerto
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor API a la espera de consulta, por el puerto ${PORT}`);
});