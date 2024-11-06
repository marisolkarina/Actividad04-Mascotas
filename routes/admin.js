const express = require('express');

const adminController = require('../controllers/admin');
const isAuth = require('../middleware/is-auth');


const router = express.Router();


// /admin/productos
router.get('/productos', isAuth, adminController.getProductos);

// /admin/crear-producto
router.get('/crear-producto', isAuth, adminController.getCrearProducto);

router.post('/crear-producto', isAuth, adminController.postCrearProducto);

// /admin/editar-producto
router.get('/editar-producto/:idProducto', isAuth, adminController.getEditarProducto);

router.post('/editar-producto', isAuth, adminController.postEditarProducto);

// /admin/eliminar-producto
router.post('/eliminar-producto', isAuth, adminController.postEliminarProducto);

// /admin/usuarios
router.get('/usuarios', isAuth, adminController.getUsuarios);

// // /admin/usuarios
router.get('/crear-usuario', isAuth, adminController.getCrearUsuario);

router.post('/crear-usuario', isAuth, adminController.postCrearUsuario);

// // /admin/editar-usuario
router.get('/editar-usuario/:idUsuario', isAuth, adminController.getEditarUsuario);

router.post('/editar-usuario', isAuth, adminController.postEditarUsuario);

// // /admin/eliminar-usuario
router.post('/eliminar-usuario', isAuth, adminController.postEliminarUsuario);

// /admin/pedidos
router.get('/pedidos', isAuth, adminController.getPedidos);

// /admin/editar-pedido
router.get('/editar-pedido/:idPedido', isAuth, adminController.getEditarPedido);

router.post('/editar-pedido', isAuth, adminController.postEditarPedido);

module.exports = router;
