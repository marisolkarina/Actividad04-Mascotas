const Producto = require('../models/producto');
const Pedido = require('../models/pedido');
const Usuario = require('../models/usuario');
const Publicacion = require('../models/publicacion');

exports.getPublicaciones = (req, res) => {
    Publicacion.find()
        .then((publicaciones) => {
            res.render('blog/lista-publicaciones', {
                publicaciones: publicaciones,
                titulo: "Blog", 
                path: "/blog",
            });
        }).catch((err) => {
            console.log(err);
        });
};