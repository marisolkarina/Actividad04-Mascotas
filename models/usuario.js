const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const usuarioSchema = new Schema({
    nombre: {
        type: String,
        required: true
    },
    dni: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        required: true
    },
    tokenReinicio: String,
    expiracionTokenReinicio: Date,
    carrito: {
        items: [
            {
                idProducto: { type: Schema.Types.ObjectId, ref: 'Producto', required: true },
                cantidad: { type: Number, required: true }
            }
        ],
        precioTotal: {
            type: Number, 
            required: true
        }
    }
})


usuarioSchema.methods.agregarAlCarrito = function(producto, cantidadInput) {
    if (!this.carrito) {
        this.carrito = {items: [], precioTotal: 0};
    }
    const indiceEnCarrito = this.carrito.items.findIndex(cp => {
        return cp.idProducto.toString() === producto._id.toString();
    });
    let nuevaCantidad = cantidadInput;
    const itemsActualizados = [...this.carrito.items];
  
    if (indiceEnCarrito >= 0) {
        nuevaCantidad = this.carrito.items[indiceEnCarrito].cantidad + cantidadInput;
        itemsActualizados[indiceEnCarrito].cantidad = nuevaCantidad;
    } else {
        itemsActualizados.push({
            idProducto: producto._id,
            cantidad: nuevaCantidad
        });
    }
    let precioProd = Number(producto.precio);
    if (producto.descuento.valor !== 0 && producto.descuento.fechaExpiracion > new Date()) precioProd = producto.precio - (producto.precio*producto.descuento.valor)/100;
    
    const total = this.carrito.precioTotal + precioProd*Number(cantidadInput);
    const carritoActualizado = {
        items: itemsActualizados,
        precioTotal: total
    };
  
    this.carrito = carritoActualizado;
    return this.save();
  };

  
usuarioSchema.methods.deleteItemDelCarrito = function(idProducto, producto) {

    const productoEliminar = this.carrito.items.find(cp => cp.idProducto.toString() === idProducto.toString());
    const cantidadProducto = productoEliminar.cantidad;

    let precioProd = Number(producto.precio);
    if (producto.descuento.valor !== 0 && producto.descuento.fechaExpiracion > new Date()) precioProd = producto.precio - (producto.precio*producto.descuento.valor)/100;
    this.carrito.precioTotal = this.carrito.precioTotal - precioProd*cantidadProducto;

    const itemsActualizados = this.carrito.items.filter(item => {
        return item.idProducto.toString() !== idProducto.toString();
    });
    this.carrito.items = itemsActualizados;
    return this.save();
};

usuarioSchema.methods.actualizarCantidadProducto = function (idProducto, nuevaCantidad, producto) {
    if (!this.carrito) {
        this.carrito = {items: [], precioTotal: 0};
    }
    const productoEditar = this.carrito.items.find(cp => cp.idProducto.toString() === idProducto.toString());
    if (!productoEditar) {
        return;
    }
    // Actualizar la cantidad
    const cantidadAnterior = productoEditar.cantidad;
    productoEditar.cantidad = nuevaCantidad;
    
    let precioProd = Number(producto.precio);
    if (producto.descuento.valor !== 0 && producto.descuento.fechaExpiracion > new Date()) precioProd = producto.precio - (producto.precio*producto.descuento.valor)/100;
    // Actualizar el precio total
    this.carrito.precioTotal = this.carrito.precioTotal - (precioProd * cantidadAnterior) + (precioProd * nuevaCantidad);
    
    return this.save();
     
}

usuarioSchema.methods.limpiarCarrito = function() {
    this.carrito = { items: [], precioTotal: 0 };
    return this.save();
};

module.exports = mongoose.model('Usuario', usuarioSchema);