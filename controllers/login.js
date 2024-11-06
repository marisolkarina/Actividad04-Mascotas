const Usuario = require('../models/usuario');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

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

    let mensaje = req.flash('error');
    if (mensaje.length > 0) {
        mensaje = mensaje[0];
    } else {
        mensaje = null;
    }
    
    res.render('auth/login', {
        titulo: 'Login',
        path: '/login',
        mensajeError: mensaje,
        autenticado: false
    });
};

// Controlador para procesar el inicio de sesión
exports.postLogin = (req, res) => {
    console.log(req.session);
    const email = req.body.email;
    const password = req.body.password;
    
    Usuario.findOne({ email: email })
        .then((usuario) => {
            if (!usuario) {
                req.flash('error', 'Email o password incorrecto.');
                return res.redirect('/login');
            }

            // Comparar la contraseña ingresada con la contraseña cifrada
            bcrypt.compare(password, usuario.password)
                .then((doMatch) => {
                    if (!doMatch) {
                        req.flash('error', 'Email o password incorrecto.');
                        return res.redirect('/login');
                    }

                    // Si la contraseña es correcta
                    req.session.autenticado = true;
                    req.session.usuario = usuario;
                    
                    req.session.save((err) => {
                        if (err) console.log('Error al guardar sesion', err);
                        
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
    let mensaje = req.flash('error');
    let estilo = req.flash('estilo');
    if (mensaje.length > 0) {
        mensaje = mensaje[0];
    } else {
        mensaje = null;
    }
    res.render('auth/recuperar-contrasena', {
        titulo: 'Recuperar Contraseña',
        path: '/recuperar-contrasena',
        mensajeError: mensaje,
        estilo: estilo,
        autenticado: false
    });
};

// Controlador para manejar el envío del formulario de recuperación de contraseña
exports.postRecuperarContrasena = (req, res) => {

    crypto.randomBytes(32, (err, buffer) => {
        
        if (err) {
            console.log(err);
            return redirect('/recuperar-contrasena');
        }

        const token = buffer.toString('hex');
        const email = req.body.email;

        Usuario.findOne({ email: email })
        .then((usuario) => {
            if (!usuario) {
                req.flash('error', 'La cuenta no existe');
                req.flash('estilo', 'alert-danger');
                return res.redirect('/recuperar-contrasena');
            }

            req.flash('error', `Se enviará un correo a: ${email}`);
            req.flash('estilo', 'alert-success');
            usuario.tokenReinicio = token;
            usuario.expiracionTokenReinicio = Date.now() + 3600000;
            return usuario.save();

        })
        .then((result) => {
            res.redirect('/recuperar-contrasena');
            transporter.sendMail({
                to: email,
                from: 'marisol.karina.pr40@gmail.com',
                subject: 'Reinicio de password',
                html: `
                    <p>Tu has solicitado un reinicio de password</p>
                    <p>Click aqui <a href="http://localhost:3000/nuevo-password/` + token + `">link</a> para establecer una nuevo password.</p>
                    `
            });
        })
        .catch((err) => {
            console.log(err);
        });
    })    
    
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
    const nuevoPassword = req.body.password;
    const confirmarPassword = req.body.confirmPassword;
    const idUsuario = req.body.idUsuario;
    const tokenPassword = req.body.tokenPassword;
    let usuarioParaActualizar;
  
    Usuario.findOne({
        tokenReinicio: tokenPassword,
        expiracionTokenReinicio: { $gt: Date.now() },
        _id: idUsuario
    })
        .then(usuario => {
            if (nuevoPassword !== confirmarPassword) {
                req.flash('error', 'Las contraseñas no coinciden.');
                return res.redirect(`/nuevo-password/:${tokenPassword}`);
            }
            usuarioParaActualizar = usuario;
            return bcrypt.hash(nuevoPassword, 12);
        })
        .then(hashedPassword => {
            usuarioParaActualizar.password = hashedPassword;
            usuarioParaActualizar.tokenReinicio = undefined;
            usuarioParaActualizar.expiracionTokenReinicio = undefined;
            return usuarioParaActualizar.save();
        })
        .then(result => {
            res.redirect('/login');
        })
        .catch(err => {
            console.log(err);
        });
};


// REGISTRO

// Controlador para renderizar la página de registro
exports.getRegistrarse = (req, res) => {
    let mensaje = req.flash('error');
    if (mensaje.length > 0) {
        mensaje = mensaje[0];
    } else {
        mensaje = null;
    }
    res.render('auth/registro', {
        titulo: 'Registro',
        path: '/registro',
        mensajeError: mensaje,
        autenticado: false
    });
};

// Controlador para manejar el registro de nuevos usuarios
exports.postRegistrarse = (req, res) => {
    const nombre = req.body.nombre;
    const email = req.body.email;
    const password = req.body.password;
    const confirmarPassword = req.body.confirmPassword; // Asumiendo que tienes un campo para confirmar la contraseña

    // Verificar si el usuario ya existe

    Usuario.findOne({ email: email })
        .then((usuarioExistente) => {
            if (password !== confirmarPassword) {
                req.flash('error', 'Las contraseñas no coinciden.');
                return res.redirect('/registro');
            } 
            
            if (usuarioExistente) {
                req.flash('error', 'El usuario ya existe');
                return res.redirect('/registro');
            }

            // Cifrar la contraseña
            bcrypt.hash(password, 12)
                .then((hashedPassword) => {
                    const usuario = new Usuario({
                        nombre: nombre,
                        email: email,
                        password: hashedPassword, // Guardar la contraseña cifrada
                        role: 'user',
                        carrito: { items: [], precioTotal: 0 }
                    });
                    return usuario.save();
                })
                .then(() => {
                    res.redirect('/login');

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