const Usuario = require('../models/usuario');
const Pedido = require("../models/pedido");

// LOGIN

// Controlador para mostrar la página de login

exports.getLogin = (req, res) => {
    res.render('login', {
        titulo: 'Login',
        path: '/login',
        mensajeError: ''
    });
};

// Controlador para procesar el inicio de sesión
exports.postLogin = (req, res) => {

    const email = req.body.email;
    const password = req.body.password;

    Usuario.findOne({ email: email, password: password })
        .then((usuario) => {
            if (!usuario) {
                res.render('login', {
                    titulo: 'Login',
                    path: '/login',
                    mensajeError: 'Email o password incorrecto.'
                });
            }

            if (usuario.role === 'admin') {
                res.redirect('/admin/productos');
            } else {
                res.render('user/index', {
                    titulo: 'Mi cuenta',
                    path: '/mi-cuenta',
                    usuario: usuario,
                });
            }
        }).catch((err) => {
            console.log(err);
        });


};


// Controlador para renderizar la página de recuperación de contraseña
exports.getRecuperarContraseña = (req, res) => {
    res.render('login-contrasena', {
        titulo: 'Recuperar Contraseña',
        path: '/login-contrasena',
        mensaje: '',
        estilo: ''
    });
};

// Controlador para manejar el envío del formulario de recuperación de contraseña
exports.postRecuperarContraseña = (req, res) => {

    const email = req.body.email;

    Usuario.findOne({ email: email })
        .then((usuario) => {
            if (!usuario) {
                res.render('login-contrasena', {
                    titulo: 'Recuperar contraseña',
                    path: '/login-contrasena',
                    mensaje: 'La cuenta no existe',
                    estilo: 'alert-danger'
                });
            } else {
                res.render('login-contrasena', {
                    titulo: 'Recuperar contraseña',
                    path: '/login-contrasena',
                    mensaje: `Se enviará un correo a: ${email}`,
                    estilo: 'alert-success'
                });
            }

        }).catch((err) => {
            console.log(err);
        });    

    
};  


// REGISTRO

// Controlador para renderizar la página de registro
exports.getRegistrarse = (req, res) => {
    res.render('login-registro', {
        titulo: 'Registro',
        path: '/registro',
        mensajeError: ''
    });
};

// Controlador para manejar el registro de nuevos usuarios
exports.postRegistrarse = (req, res) => {
    const nombre = req.body.nombre;
    const email = req.body.email;
    const password = req.body.password;
    const confirmarPassword = req.body.confirmPassword; // Asumiendo que tienes un campo para confirmar la contraseña

    // Verificar si el usuario ya existe

    Usuario.findOne({ email: email, password: password })
        
        .then((usuarioExistente) => {

            // Verificar que las contraseñas coinciden
            if (password !== confirmarPassword) {
                res.render('login-registro', {
                    titulo: 'Registro',
                    path: '/registro',
                    mensajeError: 'Las contraseñas no coinciden.'
                });
            } else {
            
                if (usuarioExistente) {
                    res.render('login-registro', {
                        titulo: 'Registro',
                        path: '/registro',
                        mensajeError: 'El usuario ya existe'
                    });
                } else {
                    
                    const usuario = new Usuario({ 
                        nombre: nombre, 
                        email: email,
                        password: password,
                        role: 'user',
                        carrito: {items: [], precioTotal: 0}
                    });
                    usuario.save()
                        .then(() => {
                            res.redirect('/login');
                        });
                }
            }

        }).catch((err) => {
            console.log(err);
        });
};

