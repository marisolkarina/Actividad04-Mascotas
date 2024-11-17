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
                autenticado: req.session.autenticado
            });
        }).catch((err) => {
            console.log(err);
        });
};

exports.getCrearPublicacion = (req, res) => {
    res.render('blog/crear-editar-publicacion', {
        titulo: 'Crear Publicacion',
        path: '/crear-publicacion',
        autenticado: req.session.autenticado,
        modoEdicion: false
    })
};

exports.postCrearPublicacion = (req, res) => {
    const titulo = req.body.titulo;
    const urlImagen = req.body.urlImagen;
    const descripcion = req.body.descripcion;

    const publicacion = new Publicacion({
        titulo: titulo,
        urlImagen: urlImagen,
        descripcion: descripcion,
        autor: {
            nombre: req.usuario.nombre,
            idUsuario: req.usuario
        },
        comentarios: []
    });

    publicacion
        .save()
        .then((result) => {
            console.log('Publicacion creada');
            res.redirect('/blog');
        })
        .catch((err) => {
            console.log(err);
        });
};