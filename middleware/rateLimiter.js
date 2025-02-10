const rateLimit = require('express-rate-limit');

// Limitador para creación de cuentas
const createAccountLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // ventana de 1 hora
    max: 5, // límite de 5 solicitudes por IP
    message: 'Demasiadas cuentas creadas desde esta IP, por favor intente nuevamente después de una hora',
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
        res.status(429).render('admin/crear-editar-usuario', {
            path: '/admin/crear-usuario',
            titulo: 'Crear usuario',
            modoEdicion: false,
            autenticado: req.session.autenticado,
            mensajeError: 'Demasiados intentos. Por favor, inténtelo más tarde.',
            validationErrors: []
        });
    }
});

// Limitador para operaciones de productos
const productLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // ventana de 15 minutos
    max: 30, // límite de 30 solicitudes por IP
    message: 'Demasiadas operaciones de productos desde esta IP',
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
        res.status(429).render('admin/crear-editar-producto', {
            path: '/admin/crear-producto',
            titulo: 'Crear Producto',
            modoEdicion: false,
            autenticado: req.session.autenticado,
            mensajeError: 'Demasiados intentos. Por favor, inténtelo más tarde.',
            tieneError: true,
            validationErrors: []
        });
    }
});

module.exports = {
    createAccountLimiter,
    productLimiter
};