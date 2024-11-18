const express = require('express');

const tiendaController = require('../controllers/tienda');
const isAuth = require('../middleware/is-auth');

const router = express.Router();
const { check, body } = require('express-validator');

router.get('/', tiendaController.getIndex);
router.get('/productos', tiendaController.getProductos);
router.post('/productos', tiendaController.postProductoPalabra);

//filtrar por categoria
router.get('/productos/:categoria', tiendaController.getProductosPorCategoria);

//filtrar por precio
router.post('/productos/filtrados-por-precio', tiendaController.postProductosPorPrecio);

//filtrar por color
router.get('/productos/:nombreColor', tiendaController.getProductosPorColor);

//ordenar por precio o alfabeticamente
router.get('/productos/ordenar/:orden', tiendaController.getProductosOrdenados);

//ver detalle de producto
router.get('/productos/:idProducto', tiendaController.getProducto);

//Carrito
router.get('/carrito', isAuth, tiendaController.getCarrito);
router.post('/agregar-carrito',
    [
        body('cantidad')
          .isInt({ gt: 0 }).withMessage('La cantidad debe ser un número entero mayor a 0')
      ]
    ,isAuth,  tiendaController.postCarrito);

router.post('/eliminar-producto', isAuth,tiendaController.postEliminarProductoCarrito)

router.post('/actualizar-cantidad', isAuth, tiendaController.postActualizarCantidadCarrito);

// Mis pedidos
router.get('/pedidos', isAuth, tiendaController.getMisPedidos);
router.post('/crear-pedido',
    [
        body('cantidad')
          .isInt({ gt: 0 }).withMessage('La cantidad debe ser un número entero mayor a 0')
      ]
    ,isAuth, tiendaController.postMisPedidos);
router.post('/cancelar-pedido', isAuth, tiendaController.postCancelarPedido);

router.get('/pedidos/:idPedido', isAuth, tiendaController.getComprobante);

//Detalles de mi cuenta
router.get('/detalles-cuenta', isAuth, tiendaController.getDetallesCuenta);

module.exports = router;