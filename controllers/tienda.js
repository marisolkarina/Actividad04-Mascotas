const Producto = require('../models/producto');
const Pedido = require('../models/pedido');
const { populate } = require('../models/usuario');

exports.getProductos = (req, res) => {

    Producto.find()
        .then((productos) => {
            res.render('tienda/lista-productos', {
                prods: productos,
                titulo: "Productos de la tienda", 
                path: "/productos"
            });
        }).catch((err) => {
            console.log(err);
        });
};

exports.getIndex = (req, res) => {

    Producto.find()
        .then((productos) => {
            res.render('tienda/index', {
                prods: productos,
                titulo: "Pagina principal de la Tienda", 
                path: "/"
            });
        }).catch((err) => {
            console.log(err);
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
                    path: `/productos/${categoria}`
                })
            }).catch((err) => {
                console.log(err);
            });
    }
}

//ordenar productos de menor a mayor precio
exports.getProductosMenorMayor = (req, res) => {

    Producto.find()
        .then((productosObtenidos) => {
            const productosOrdenados = productosObtenidos.sort((prod1, prod2) => prod1.precio - prod2.precio);        
            res.render('tienda/lista-productos', {
                prods: productosOrdenados,
                titulo: "Productos ordenados", 
                path: "/productos/ordenar/menor-a-mayor"
                
            });
        }).catch((err) => {
            console.log(err);
        });

}
//ordenar productos de mayor a menor precio
exports.getProductosMayorMenor = (req, res) => {

    Producto.find()
        .then((productosObtenidos) => {
            const productosOrdenados = productosObtenidos.sort((prod1, prod2) => prod2.precio - prod1.precio);        
            res.render('tienda/lista-productos', {
                prods: productosOrdenados,
                titulo: "Productos ordenados", 
                path: "/productos/ordenar/mayor-a-menor"
            });
        }).catch((err) => {
            console.log(err);
        });

}
//ordenar productos alfabeticamente
exports.getProductosAlfabeticamente = (req, res) => {
    Producto.find()
    .then((productosObtenidos) => {
        const productosOrdenados = productosObtenidos.sort((prod1, prod2) => prod1.nombre.localeCompare(prod2.nombre)); 

        res.render('tienda/lista-productos', {
            prods: productosOrdenados,
            titulo: "Productos ordenados", 
            path: "/productos/ordenar/alfabeticamente"
        });
    }).catch((err) => {
        console.log(err);
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
                    path: `/productos/${color}`
                })
            }).catch((err) => {
                console.log(err);
            });
    }
}

//ver detalle de un producto
exports.getProducto = (req, res) => {
    const idProducto = req.params.idProducto;
    Producto.findById(idProducto)
        .then((producto) => {
            res.render('tienda/producto-detalle', {
                producto: producto,
                titulo: producto.nombre, 
                path: `/productos/:${idProducto}`
            });
        }).catch((err) => {
            console.log(err);
        });
}

//mostrar productos buscados por palabra
exports.postProductoPalabra = (req, res) => {
    const stringBuscado = req.body.textoIngresado;

    Producto.find()
        .then((productos) => {
            const productosBuscados = productos.filter(prod => prod.nombre.toLowerCase().includes(stringBuscado.toLowerCase()));
            res.render('tienda/lista-productos', {
                prods: productosBuscados,
                titulo: 'Productos buscados', 
                path: '/productos'
            });
        }).catch((err) => {
            console.log(err);
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
                total: total
            })
        })
        .catch((err) => {
            console.log(err);
        });
};


exports.postCarrito = (req, res) => {
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

exports.postEliminarProductoCarrito = (req, res) => {
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

exports.postActualizarCantidadCarrito = (req, res) => {
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
            console.log(err);
        });
    
};


exports.getMisPedidos = (req, res, next) => {
    Pedido.find({'usuario.idUsuario': req.usuario._id})
        .then((pedidos) => {
            res.render('user/pedidos', {
                path: '/pedidos',
                titulo: 'Mis pedidos',
                pedidos: pedidos,
                usuario: req.usuario.nombre
            })
        }).catch((err) => {
            console.log(err);
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
                return {cantidad: item.cantidad, producto: {...item.idProducto._doc}};
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
            console.log(err);
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
            console.log(err);
        });
}