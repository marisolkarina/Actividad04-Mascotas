const path = require('path');
const bodyParser = require('body-parser');

const express = require('express');

const csrf = require('csurf');
const flash = require('connect-flash');

const mongoose = require('mongoose');
const Usuario = require('./models/usuario');
const session = require('express-session');

const MongoDBStore = require('connect-mongodb-session')(session);

const MONGODB_URI = 'mongodb+srv://marisol:secreto@cluster0.71urh.mongodb.net/mascotas?retryWrites=true&w=majority&appName=Cluster0';

const adminRoutes = require('./routes/admin');
const tiendaRoutes = require('./routes/tienda');
const errorController = require('./controllers/error');
const loginRoutes = require('./routes/login');


const app = express();

const store = new MongoDBStore({
  uri: MONGODB_URI,
  collection: 'sessions'
});

const csrfProtection = csrf();

app.set('view engine', 'ejs');
app.set('views', 'views');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'node_modules', 'bootstrap', 'dist')));
app.use(session({ secret: 'algo muy secreto', resave: false, saveUninitialized: false, store: store }));

app.use(flash());
app.use(csrfProtection);

app.use((req, res, next) => {
  // console.log(req.session);
  if (!req.session.usuario) {
    return next();
  }
  Usuario.findById(req.session.usuario._id)
    .then(usuario => {
        req.usuario = usuario;
        next();
    })
    .catch(err => console.log(err));

});

app.use((req, res, next) => {
  res.locals.autenticado = req.session.autenticado;
  res.locals.csrfToken = req.csrfToken();
  next();
});

app.use(loginRoutes);
app.use('/admin', adminRoutes);
app.use(tiendaRoutes);

app.use(errorController.get404);

mongoose
  .connect(MONGODB_URI)
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