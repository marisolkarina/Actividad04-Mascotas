const Usuario = require('../models/usuario');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { validationResult } = require('express-validator');
const sgMail = require('@sendgrid/mail');

const APIKEY = '';
sgMail.setApiKey(APIKEY);

exports.getLogin = (req, res,next) => {
   res.render('auth/login', {
       titulo: 'Iniciar sesión',
       path: '/login',
       mensajeError: '',
       validationErrors: [],
       datosAnteriores: {},
       autenticado: false
   });
};

exports.postLogin = (req, res,next) => {
   const { email, password } = req.body;
   const errors = validationResult(req);
   
   if (!errors.isEmpty()) {
       return res.status(422).render('auth/login', {
           titulo: 'Login',
           path: '/login',
           mensajeError: errors.array()[0].msg,
           datosAnteriores: { email, password },
           validationErrors: errors.array()
       });
   }

   Usuario.findOne({ email: email })
       .then((usuario) => {
           if (!usuario) {
               return res.status(422).render('auth/login', {
                   titulo: 'Login',
                   path: '/login',
                   mensajeError: 'Email o contraseña incorrecto.',
                   datosAnteriores: { email, password },
                   validationErrors: []
               });
           }

           bcrypt.compare(password, usuario.password)
               .then((doMatch) => {
                   if (!doMatch) {
                       return res.status(422).render('auth/login', {
                           titulo: 'Login',
                           path: '/login',
                           mensajeError: 'Email o contraseña incorrecto.',
                           datosAnteriores: { email, password },
                           validationErrors: []
                       });
                   }

                   req.session.autenticado = true;
                   req.session.usuario = usuario;
                   req.session.save((err) => {
                       if (err) console.log('Error al guardar la sesión:', err);
                       res.redirect('/detalles-cuenta');
                   });
               });
       })
       .catch((err) => {
           const error = new Error(err);
           error.httpStatusCode = 500;
           return next(error);
       });
};

exports.getRecuperarContrasena = (req, res,next) => {
   res.render('auth/recuperar-contrasena', {
       titulo: 'Recuperar Contraseña',
       path: '/recuperar-contrasena',
       mensajeError: null,
       estilo: null,
       autenticado: false
   });
};

exports.postRecuperarContrasena = (req, res,next) => {
   const email = req.body.email;
   const errors = validationResult(req);
   
   if (!errors.isEmpty()) {
       return res.status(422).render('auth/recuperar-contrasena', {
           titulo: 'Recuperar Contraseña',
           path: '/recuperar-contrasena',
           mensajeError: errors.array()[0].msg,
           estilo: 'alert-danger',
           autenticado: false
       });
   }

   crypto.randomBytes(32, (err, buffer) => {
       if (err) {
           const error = new Error(err);
           error.httpStatusCode = 500;
           next(error);
           return res.redirect('/recuperar-contrasena');
       }

       const token = buffer.toString('hex');

       Usuario.findOne({ email: email })
           .then((usuario) => {
               if (!usuario) {
                   return res.status(422).render('auth/recuperar-contrasena', {
                       titulo: 'Recuperar Contraseña',
                       path: '/recuperar-contrasena',
                       mensajeError: 'La cuenta no existe',
                       estilo: 'alert-danger',
                       autenticado: false
                   });
               }

               usuario.tokenReinicio = token;
               usuario.expiracionTokenReinicio = Date.now() + 3600000;
               return usuario.save();
           })
           .then(() => {
               res.redirect('/recuperar-contrasena');
               return sgMail.send({
                   to: email,
                   from: 'marisol.karina.pr40@gmail.com',
                   subject: 'Reinicio de password',
                   html: `<p>Has solicitado un reinicio de password</p>
                          <p>Click aquí <a href="http://localhost:3000/nuevo-password/${token}">link</a> para establecer una nueva password.</p>`
               });
           })
           .catch((err) => {
               const error = new Error(err);
               error.httpStatusCode = 500;
               return next(error);
           });
   });
};

exports.getNuevoPassword = (req, res, next) => {
   const token = req.params.token;

   Usuario.findOne({ tokenReinicio: token, expiracionTokenReinicio: { $gt: Date.now() } })
       .then(usuario => {
           if (!usuario) {
               return res.status(422).render('auth/nuevo-password', {
                   path: `/nuevo-password/${token}`,
                   titulo: 'Nuevo Password',
                   mensajeError: 'Token inválido o ha expirado.',
                   idUsuario: null,
                   tokenPassword: token,
                   csrfToken: req.csrfToken()
               });
           }

           res.render('auth/nuevo-password', {
               path: `/nuevo-password/${token}`,
               titulo: 'Nuevo Password',
               mensajeError: null,
               idUsuario: usuario._id.toString(),
               tokenPassword: token,
               csrfToken: req.csrfToken()
           });
       })
       .catch(err => {
           if (err) {
               const error = new Error(err);
               error.httpStatusCode = 500;
               return next(error);
           }
           res.redirect('/login');
       });
};

exports.postNuevoPassword = (req, res, next) => {
   const { password, confirmPassword, idUsuario, tokenPassword } = req.body;
   const errors = validationResult(req);
   
   if (!errors.isEmpty()) {
       return res.status(422).render('auth/nuevo-password', {
           titulo: 'Nuevo Password',
           path: `/nuevo-password/${tokenPassword}`,
           mensajeError: errors.array()[0].msg,
           estilo: 'alert-danger',
           idUsuario,
           tokenPassword,
           csrfToken: req.csrfToken()
       });
   }

   let usuarioParaActualizar;

   Usuario.findOne({
       tokenReinicio: tokenPassword,
       expiracionTokenReinicio: { $gt: Date.now() },
       _id: idUsuario
   })
       .then(usuario => {
           if (!usuario) {
               return res.status(422).render('auth/nuevo-password', {
                   titulo: 'Nuevo Password',
                   path: `/nuevo-password/${tokenPassword}`,
                   mensajeError: 'Token inválido o ha expirado.',
                   estilo: 'alert-danger',
                   idUsuario,
                   tokenPassword,
                   csrfToken: req.csrfToken()
               });
           }
           usuarioParaActualizar = usuario;
           return bcrypt.hash(password, 12);
       })
       .then(hashedPassword => {
           usuarioParaActualizar.password = hashedPassword;
           usuarioParaActualizar.tokenReinicio = undefined;
           usuarioParaActualizar.expiracionTokenReinicio = undefined;
           return usuarioParaActualizar.save();
       })
       .then(() => {
           res.redirect('/login');
       })
       .catch(err => {
           const error = new Error(err);
           error.httpStatusCode = 500;
           return next(error);
       });
};

exports.getRegistrarse = (req, res,next) => {
   const errors = validationResult(req).array();
   res.render('auth/registro', {
       titulo: 'Registro',
       path: '/registro',
       mensajeError: '',
       validationErrors: errors,
       autenticado: false
   });
};

exports.postRegistrarse = (req, res) => {
   const { nombre, dni, email, password } = req.body;
   const errors = validationResult(req);
   
   if (!errors.isEmpty()) {
       console.log(errors.array());
       return res.status(422).render('auth/registro', {
           path: '/registro',
           titulo: 'Registro',
           mensajeError: errors.array()[0].msg,
           validationErrors: errors.array()
       });
   }

   bcrypt.hash(password, 12)
       .then((hashedPassword) => {
           const usuario = new Usuario({
               nombre,
               dni,
               email,
               password: hashedPassword,
               role: 'user',
               carrito: { items: [], precioTotal: 0 }
           });
           return usuario.save();
       })
       .then(() => {
           res.redirect('/login');
           return sgMail.send({
               to: email,
               from: 'marisol.karina.pr40@gmail.com',
               subject: 'Registro exitoso',
               html: '<h1>Bienvenido. Se ha registrado satisfactoriamente en el PetShop.</h1>'
           });
       })
       .catch((err) => {
           const error = new Error(err);
           error.httpStatusCode = 500;
           return next(error);
       });
};

exports.postSalir = (req, res, next) => {
   req.session.destroy(err => {
       if (err) {
           const error = new Error(err);
           error.httpStatusCode = 500;
           return next(error);
       }
       res.redirect('/');
   })
};