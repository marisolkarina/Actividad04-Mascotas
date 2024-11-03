const path = require('path');
const bodyParser = require('body-parser')
const express = require('express');

const mongoose = require('mongoose');
const Usuario = require('./models/usuario');

const adminRoutes = require('./routes/admin')
const tiendaRoutes = require('./routes/tienda');
const errorController = require('./controllers/error');
const loginRoutes = require('./routes/login');

const app = express();

app.set('view engine', 'ejs');
app.set('views', 'views');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'node_modules', 'bootstrap', 'dist')));

app.use((req, res, next) => {
  Usuario.findById('671d8f50279f2a74fa269ee7')
    .then(usuario => {
      console.log(usuario)
      req.usuario = usuario;
      next();
    })
    .catch(err => console.log(err));
});

app.use(loginRoutes);
app.use('/admin', adminRoutes);
app.use(tiendaRoutes);

app.use(errorController.get404)

mongoose
  .connect(
    'mongodb+srv://marisol:secreto@cluster0.71urh.mongodb.net/mascotas?retryWrites=true&w=majority&appName=Cluster0'
  )
  .then(result => {
    // console.log(result);
    Usuario.findOne().then((usuario) => {
      if (!usuario) {
        const usuario = new Usuario({
          nombre: 'Marisol Pachauri',
          email: 'marisol@mail.com',
          password: '123456',
          role: 'admin',
          carrito: {
            items: [],
            precioTotal: 0
          }
        });
        usuario.save();
      }
    })
    app.listen(3000);
  })
  .catch(err => {
    console.log(err);
  });