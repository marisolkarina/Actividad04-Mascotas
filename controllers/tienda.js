const Producto = require('../models/producto');
const Pedido = require('../models/pedido');
const { populate } = require('../models/usuario');

exports.getProductos = (req, res, next) => {

    Producto.find()
        .then((productos) => {
            res.render('tienda/lista-productos', {
                prods: productos,
                titulo: "Productos de la tienda",
                path: "/productos",
                autenticado: req.session.autenticado
            });
        }).catch((err) => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });
};

exports.getIndex = (req, res, next) => {

    Producto.find()
        .then((productos) => {
            res.render('tienda/index', {
                prods: productos,
                titulo: "Pagina principal de la Tienda",
                path: "/",
                autenticado: req.session.autenticado
            });
        }).catch((err) => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });

}

exports.getProductosPorCategoria = (categoria) => {

    return (req, res) => {

        Producto.find()
            .then((productosObtenidos) => {
                const productosFiltrados = productosObtenidos.filter(producto =>
                    producto.categoria.toLowerCase() === categoria.toLowerCase()
                );

                res.render('tienda/lista-productos', {
                    prods: productosFiltrados,
                    titulo: `${categoria}`,
                    path: `/productos/${categoria}`,
                    autenticado: req.session.autenticado
                })
            }).catch((err) => {
                const error = new Error(err);
                error.httpStatusCode = 500;
                return next(error);
            });
    }
}

//ordenar productos de menor a mayor precio
exports.getProductosMenorMayor = (req, res, next) => {

    Producto.find()
        .then((productosObtenidos) => {
            const productosOrdenados = productosObtenidos.sort((prod1, prod2) => prod1.precio - prod2.precio);
            res.render('tienda/lista-productos', {
                prods: productosOrdenados,
                titulo: "Productos ordenados",
                path: "/productos/ordenar/menor-a-mayor",
                autenticado: req.session.autenticado

            });
        }).catch((err) => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });

}
//ordenar productos de mayor a menor precio
exports.getProductosMayorMenor = (req, res, next) => {

    Producto.find()
        .then((productosObtenidos) => {
            const productosOrdenados = productosObtenidos.sort((prod1, prod2) => prod2.precio - prod1.precio);
            res.render('tienda/lista-productos', {
                prods: productosOrdenados,
                titulo: "Productos ordenados",
                path: "/productos/ordenar/mayor-a-menor",
                autenticado: req.session.autenticado
            });
        }).catch((err) => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });

}
//ordenar productos alfabeticamente
exports.getProductosAlfabeticamente = (req, res, next) => {
    Producto.find()
        .then((productosObtenidos) => {
            const productosOrdenados = productosObtenidos.sort((prod1, prod2) => prod1.nombre.localeCompare(prod2.nombre));

            res.render('tienda/lista-productos', {
                prods: productosOrdenados,
                titulo: "Productos ordenados",
                path: "/productos/ordenar/alfabeticamente",
                autenticado: req.session.autenticado
            });
        }).catch((err) => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });

}

// filtrar productos por color
exports.getProductosPorColor = (color) => {
    return (req, res) => {
        Producto.find()
            .then((productosObtenidos) => {
                const productosFiltrados = productosObtenidos.filter(producto =>
                    producto.color.toLowerCase() === color.toLowerCase()
                );

                res.render('tienda/lista-productos', {
                    prods: productosFiltrados,
                    titulo: `${color}`,
                    path: `/productos/${color}`,
                    autenticado: req.session.autenticado
                })
            }).catch((err) => {
                const error = new Error(err);
                error.httpStatusCode = 500;
                return next(error);
            });
    }
}

//ver detalle de un producto
exports.getProducto = (req, res, next) => {
    const idProducto = req.params.idProducto;
    Producto.findById(idProducto)
        .then((producto) => {
            res.render('tienda/producto-detalle', {
                producto: producto,
                titulo: producto.nombre,
                path: `/productos/:${idProducto}`,
                autenticado: req.session.autenticado
            });
        }).catch((err) => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });
}

//mostrar productos buscados por palabra
exports.postProductoPalabra = (req, res, next) => {
    const stringBuscado = req.body.textoIngresado;

    Producto.find()
        .then((productos) => {
            const productosBuscados = productos.filter(prod => prod.nombre.toLowerCase().includes(stringBuscado.toLowerCase()));
            res.render('tienda/lista-productos', {
                prods: productosBuscados,
                titulo: 'Productos buscados',
                path: '/productos',
                autenticado: req.session.autenticado
            });
        }).catch((err) => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });

}

exports.getCarrito = (req, res, next) => {
    req.usuario
        .populate('carrito.items.idProducto')
        .then((usuario) => {
            const productosEnCarrito = usuario.carrito.items;
            const total = usuario.carrito.precioTotal;
            res.render('tienda/carrito', {
                path: '/carrito',
                titulo: 'Mi Carrito',
                items: productosEnCarrito,
                total: total,
                autenticado: req.session.autenticado
            })
        })
        .catch((err) => {
            console.log(err);
        });
};


exports.postCarrito = (req, res, next) => {
    const idProducto = req.body.idProducto;
    const cantidad = parseInt(req.body.cantidad, 10);

    Producto.findById(idProducto)
        .then((producto) => {
            return req.usuario.agregarAlCarrito(producto, cantidad);
        })
        .then((result) => {
            // console.log(result);
            res.redirect('/carrito');
        })
        .catch((err) => {
            console.log(err);
        });

}

exports.postEliminarProductoCarrito = (req, res, next) => {
    const idProducto = req.body.idProducto;

    Producto.findById(idProducto)
        .then((producto) => {
            return req.usuario.deleteItemDelCarrito(idProducto, producto);
        })
        .then((result) => {
            res.redirect('/carrito');
        })
        .catch((err) => {
            console.log(err);
        });

}

exports.postActualizarCantidadCarrito = (req, res, next) => {
    const idProducto = req.body.idProducto;
    const nuevaCantidad = parseInt(req.body.cantidad, 10);

    Producto.findById(idProducto)
        .then((producto) => {
            return req.usuario.actualizarCantidadProducto(idProducto, nuevaCantidad, producto);
        })
        .then((result) => {
            res.redirect('/carrito');
        })
        .catch((err) => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });

};


exports.getMisPedidos = (req, res, next) => {
    Pedido.find({ 'usuario.idUsuario': req.usuario._id })
        .then((pedidos) => {
            res.render('user/pedidos', {
                path: '/pedidos',
                titulo: 'Mis pedidos',
                pedidos: pedidos,
                usuario: req.usuario.nombre
            })
        }).catch((err) => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });
}


exports.postMisPedidos = (req, res, next) => {
    req.usuario
        .populate('carrito.items.idProducto')
        .then((usuario) => {
            // construir un array productosDelPedido 
            // con objetos de 2 propiedades: cantidad y producto
            const productosDelPedido = usuario.carrito.items.map(item => {
                // traer los detalles del producto ._doc
                return { cantidad: item.cantidad, producto: { ...item.idProducto._doc } };
            });
            const precioTotal = usuario.carrito.precioTotal;
            const pedido = new Pedido({
                productos: productosDelPedido,
                precioTotal: precioTotal,
                usuario: {
                    nombre: req.usuario.nombre,
                    idUsuario: req.usuario
                },
                estado: 'pendiente',
                fechaPedido: new Date(),
                fechaEntrega: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 dias despues del pedido
            })
            return pedido.save();
        })
        .then(result => {
            return req.usuario.limpiarCarrito();
        })
        .then(() => {
            res.redirect('/pedidos');
        })
        .catch((err) => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });
}

exports.postCancelarPedido = (req, res) => {
    const idPedido = req.body.idPedido;

    Pedido.findById(idPedido)
        .then((pedido) => {
            pedido.estado = 'cancelado';
            return pedido.save();
        })
        .then((result) => {
            console.log('Pedido cancelado');
            res.redirect('/pedidos');
        })
        .catch((err) => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });
}