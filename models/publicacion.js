const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const publicacionSchema = new Schema({
    titulo: {
        type: String,
        required: true
    },
    urlImagen: {
        type: String,
        required: true
    },
    descripcion: {
        type: String,
        required: true
    },
    autor: {
        nombre: {
            type: String,
            required: true
        },
        idUsuario: {
            type: Schema.Types.ObjectId,
            required: true,
            ref: 'Usuario'
        }
    },
    fechaPublicacion: {
        type: Date,
        required: true
    },
    comentarios: [
        {
            contenido: { type: String, required: true },
            usuario: { 
                nombre: {
                    type: String,
                    required: true
                },
                idUsuario: {
                    type: Schema.Types.ObjectId,
                    required: true,
                    ref: 'Usuario'
                } 
            }
        }
    ]
});

module.exports = mongoose.model('Publicacion', publicacionSchema);