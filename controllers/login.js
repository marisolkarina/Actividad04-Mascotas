const Usuario = require('../models/usuario');
const Pedido = require('../models/pedido');
const bcrypt = require('bcryptjs'); 

// LOGIN

// Controlador para mostrar la página de login

exports.getLogin = (req, res) => {
    console.log(req.session.autenticado);
    res.render('login', {
        titulo: 'Login',
        path: '/login',
        mensajeError: '',
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
                return res.render('login', {
                    titulo: 'Login',
                    path: '/login',
                    mensajeError: 'Email o password incorrecto.'
                });
            }

            // Comparar la contraseña ingresada con la contraseña cifrada
            bcrypt.compare(password, usuario.password)
                .then((doMatch) => {
                    if (!doMatch) {
                        return res.render('login', {
                            titulo: 'Login',
                            path: '/login',
                            mensajeError: 'Email o password incorrecto.'
                        });
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
    res.render('login-contrasena', {
        titulo: 'Recuperar Contraseña',
        path: '/login-contrasena',
        mensaje: '',
        estilo: '',
        autenticado: false
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
        mensajeError: '',
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
                return res.render('login-registro', {
                    titulo: 'Registro',
                    path: '/registro',
                    mensajeError: 'Las contraseñas no coinciden.'
                });
            } 
            
            if (usuarioExistente) {
                return res.render('login-registro', {
                    titulo: 'Registro',
                    path: '/registro',
                    mensajeError: 'El usuario ya existe'
                });
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