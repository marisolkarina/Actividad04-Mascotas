const express = require('express');
const loginController = require('../controllers/login');
const { check, body } = require('express-validator');
const router = express.Router();

// Recuperacion de cuenta
router.get('/recuperar-contrasena', loginController.getRecuperarContrasena);
router.post('/recuperar-contrasena', loginController.postRecuperarContrasena);
router.get('/nuevo-password/:token', loginController.getNuevoPassword);
router.post('/nuevo-password', loginController.postNuevoPassword);

// Inicio de sesion
router.get('/login', loginController.getLogin);
router.post('/login', loginController.postLogin);

// Registro
router.get('/registro', loginController.getRegistrarse);
router.post('/registro', [
    body('confirmPassword').custom((value, { req } ) => {
        if (value !== req.body.password) {
            throw new Error('Las contraseñas no coinciden.');
        }
        return true;
    })
], loginController.postRegistrarse);

// Cierre de sesion
router.post('/salir', loginController.postSalir);


module.exports = router;
