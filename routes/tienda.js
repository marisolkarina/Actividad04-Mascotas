const express = require('express');

const tiendaController = require('../controllers/tienda');
const isAuth = require('../middleware/is-auth');

const router = express.Router();

router.get('/', tiendaController.getIndex);
router.get('/productos', tiendaController.getProductos);
router.post('/productos', tiendaController.postProductoPalabra);

//filtros por categoria
router.get('/productos/perro', tiendaController.getProductosPorCategoria('perro'));
router.get('/productos/gato', tiendaController.getProductosPorCategoria('gato'));
router.get('/productos/conejo', tiendaController.getProductosPorCategoria('conejo'));
router.get('/productos/hamster', tiendaController.getProductosPorCategoria('hamster'));
//ordenar por precio o alfabeticamente
router.get('/productos/ordenar/menor-a-mayor', tiendaController.getProductosMenorMayor);
router.get('/productos/ordenar/mayor-a-menor', tiendaController.getProductosMayorMenor);
router.get('/productos/ordenar/alfabeticamente', tiendaController.getProductosAlfabeticamente);
//filtrar por color
router.get('/productos/rojo', tiendaController.getProductosPorColor('rojo'));
router.get('/productos/azul', tiendaController.getProductosPorColor('azul'));
router.get('/productos/celeste', tiendaController.getProductosPorColor('celeste'));
router.get('/productos/blanco', tiendaController.getProductosPorColor('blanco'));
router.get('/productos/marron', tiendaController.getProductosPorColor('marron'));

//ver detalle de producto
router.get('/productos/:idProducto', tiendaController.getProducto);

//Carrito
router.get('/carrito', isAuth, tiendaController.getCarrito);
router.post('/agregar-carrito',isAuth,  tiendaController.postCarrito);

router.post('/eliminar-producto', isAuth,tiendaController.postEliminarProductoCarrito)

router.post('/actualizar-cantidad', isAuth, tiendaController.postActualizarCantidadCarrito);

// Mis pedidos
router.get('/pedidos', isAuth, tiendaController.getMisPedidos);
router.post('/crear-pedido', isAuth, tiendaController.postMisPedidos);
router.post('/cancelar-pedido', isAuth, tiendaController.postCancelarPedido);

module.exports = router;