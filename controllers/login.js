const Usuario = require('../models/usuario');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const {validationResult} = require('express-validator');

const nodemailer = require('nodemailer');
const sendgridTransport = require('nodemailer-sendgrid-transport');

const APIKEY = '';

const transporter = nodemailer.createTransport(
  sendgridTransport({
    auth: {
      api_key:
        APIKEY
    }
  })
);

// LOGIN

// Controlador para mostrar la página de login
exports.getLogin = (req, res) => {
    res.render('auth/login', {
        titulo: 'Login',
        path: '/login',
        mensajeError: null,
        autenticado: false
    });
};

// Controlador para procesar el inicio de sesión
exports.postLogin = (req, res) => {
    const { email, password } = req.body;

    // Captura los errores de validación
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).render('auth/login', {
            titulo: 'Login',
            path: '/login',
            mensajeError: errors.array()[0].msg, // Mostrar el primer error
            datosAnteriores: { email, password },
            validationErrors: errors.array() // Pasar todos los errores para mostrar en la vista
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
                        
                        if (usuario.role === 'admin') {
                            res.redirect('/admin/productos');
                        } else {
                            res.redirect('/pedidos');
                        }
                    });
                });
        })
        .catch((err) => {
            console.log(err);
        });
};


// Controlador para renderizar la página de recuperación de contraseña
exports.getRecuperarContrasena = (req, res) => {
    res.render('auth/recuperar-contrasena', {
        titulo: 'Recuperar Contraseña',
        path: '/recuperar-contrasena',
        mensajeError: null,
        estilo: null,
        autenticado: false
    });
};

// Controlador para manejar el envío del formulario de recuperación de contraseña
exports.postRecuperarContrasena = (req, res) => {
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
            console.log(err);
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
                transporter.sendMail({
                    to: email,
                    from: 'marisol.karina.pr40@gmail.com',
                    subject: 'Reinicio de password',
                    html: `<p>Has solicitado un reinicio de password</p>
                           <p>Click aquí <a href="http://localhost:3000/nuevo-password/${token}">link</a> para establecer una nueva password.</p>`
                });
            })
            .catch((err) => {
                console.log(err);
            });
    });
};

exports.getNuevoPassword = (req, res, next) => {
    const token = req.params.token;
    console.log(token)

    Usuario.findOne({ tokenReinicio: token, expiracionTokenReinicio: { $gt: Date.now() } })
        .then(usuario => {
            console.log(usuario)
            let mensaje = req.flash('error');
            if (mensaje.length > 0) {
                mensaje = mensaje[0];
            } else {
                mensaje = null;
            }
            res.render('auth/nuevo-password', {
                path: `/nuevo-password/:${token}`,
                titulo: 'Nuevo Password',
                mensajeError: mensaje,
                idUsuario: usuario._id.toString(),
                tokenPassword: token
            });
        })
        .catch(err => {
            console.log(err);
        });
};

exports.postNuevoPassword = (req, res, next) => {
    const { password, confirmPassword, idUsuario, tokenPassword } = req.body;

    // Captura los errores de validación
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).render('auth/nuevo-password', {
            titulo: 'Nuevo Password',
            path: `/nuevo-password/${tokenPassword}`,
            mensajeError: errors.array()[0].msg, // Mostrar el primer error
            estilo: 'alert-danger',
            idUsuario,
            tokenPassword,
            csrfToken: req.csrfToken() // Asegura que el token CSRF esté presente
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
            console.log(err);
        });
};



// REGISTRO

// Controlador para renderizar la página de registro
exports.getRegistrarse = (req, res) => {
    // let mensaje = req.flash('error');
    // if (mensaje.length > 0) {
    //     mensaje = mensaje[0];
    // } else {
    //     mensaje = null;
    // }
    res.render('auth/registro', {
        titulo: 'Registro',
        path: '/registro',
        mensajeError: '',
        autenticado: false
    });
};

// Controlador para manejar el registro de nuevos usuarios
exports.postRegistrarse = (req, res) => {
    const { nombre, dni, email, password } = req.body;

    // Captura los errores de validación
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).render('auth/registro', {
            path: '/registro',
            titulo: 'Registro',
            mensajeError: errors.array()[0].msg,
            datosAnteriores: { nombre, dni, email, password },
            validationErrors: errors.array() // Enviar todos los errores para mostrarlos en la vista
        });
    }

    // Cifrar la contraseña y guardar el usuario
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

            // Enviar correo de confirmación
            return transporter.sendMail({
                to: email,
                from: 'marisol.karina.pr40@gmail.com',
                subject: 'Registro exitoso',
                html: '<h1>Bienvenido. Se ha registrado satisfactoriamente en el PetShop.</h1>'
            });
        })
        .catch((err) => {
            console.log(err);
        });
};


exports.postSalir = (req, res, next) => {
    req.session.destroy(err => {
        console.log(err);
        res.redirect('/');
    })
}