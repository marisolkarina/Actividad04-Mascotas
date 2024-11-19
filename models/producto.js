const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const productoSchema = new Schema({
    nombre: {
        type: String,
        required: true,
    },
    urlImagen: {
        type: String,
        required: true
    },
    descripcion: {
        type: String,
        required: true
    },
    precio: {
        type: Number,
        required: true
    },
    descuento: {
        type: Number,
        required: false
    },
    categoria: {
        type: String,
        required: true
    },
    color: {
        type: String,
        required: true
    },
    idUsuario: {
        type: Schema.Types.ObjectId,
        ref: 'Usuario',
        required: true
    }
})

module.exports = mongoose.model('Producto', productoSchema);