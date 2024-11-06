const Usuario = require('../models/usuario');
const Pedido = require('../models/pedido');
const bcrypt = require('bcryptjs'); 

// LOGIN

// Controlador para mostrar la página de login

exports.getLogin = (req, res) => {

    let mensaje = req.flash('error');
    if (mensaje.length > 0) {
        mensaje = mensaje[0];
    } else {
        mensaje = null;
    }
    
    res.render('login', {
        titulo: 'Login',
        path: '/login',
        mensajeError: mensaje,
        autenticado: false
    });
};

// Controlador para procesar el inicio de sesión
exports.postLogin = (req, res) => {
    
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
                        if (err) console.log(err);
                        
                        if (usuario.role === 'admin') {
                            res.redirect('/admin/productos');
                        } else {
                            res.redirect('/mi-cuenta');
                        }
                    });
                });
        })
        .catch((err) => {
            console.log(err);
        });
        
};


// Controlador para renderizar la página de recuperación de contraseña
exports.getRecuperarContraseña = (req, res) => {
    let mensaje = req.flash('error');
    let estilo = req.flash('estilo');
    if (mensaje.length > 0) {
        mensaje = mensaje[0];
    } else {
        mensaje = null;
    }
    res.render('recuperar-contrasena', {
        titulo: 'Recuperar Contraseña',
        path: '/recuperar-contrasena',
        mensajeError: mensaje,
        estilo: estilo,
        autenticado: false
    });
};

// Controlador para manejar el envío del formulario de recuperación de contraseña
exports.postRecuperarContraseña = (req, res) => {

    const email = req.body.email;
    Usuario.findOne({ email: email })
        .then((usuario) => {
            if (!usuario) {
                req.flash('error', 'La cuenta no existe');
                req.flash('estilo', 'alert-danger');
            } else {
                req.flash('error', `Se enviará un correo a: ${email}`);
                req.flash('estilo', 'alert-success');
            }
            return res.redirect('/recuperar-contrasena');

        }).catch((err) => {
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
    res.render('registro', {
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