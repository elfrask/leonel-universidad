import mongoose, {Schema, model} from "mongoose";
import { configDotenv } from "dotenv";
// import {initialize, plugin as pluginAutoIncrement} from "mongoose-auto-increment";

configDotenv();


mongoose.connect(process.env.MONGO)


let Productos = model("Producto", new Schema({
    id: {
        type: Number,
        unique: true,
        required: true
    },
    name: String,
    price: Number,
    stock: Number,
    enable: Number,
    
}))

let Counters = model("Counter", new Schema({
    key: {
        unique: true,
        type: String,
        required: true

    },
    value: {
        type: Number,
        required: true
    }
    
}))


let Clientes = model("Cliente", new Schema({
    ci: {
        type: Number,
        unique: true,
        required: true
    },
    name: String,
    address: String,
    phone: String,
}))




let Users = model("User", new Schema({
    user: {
        type: String,
        unique: true,
        required: true
    },
    pass: {
        type: String,
        required: true,
    },

}))





// ===================================================================================================
// ===================================================================================================
// ===================================================================================================



let pre_Facturas = new Schema({
    id: {
        type: Number,
    },
    total: Number,
    subtotal: Number,
    dolar: Number,
    client: Number,
    nota: String,
    iva: Number,
    igtf: Number,
    iva_bs: Number,
    igtf_bs: Number,
    date: {
        type: Date,
        default: Date()
    }
});

let pre_Productos_factura = new Schema({
    id: Number,
    id_factura: Number,
    code: Number, 
    name: String, 
    price: Number, 
    amount: Number, 
    total: Number,
});


let pre_Metodos_factura = new Schema({
    id: Number,
    id_factura: Number,
    method: Number, 
    pay: Number, 
    total: Number, 
    divisa: String
})

let gen_pre_save = (name_counter) => {
    
    return async function pre_save(next, opts) {
        if (!this.isNew) {
            return next()
        }
    
        try {
            // Incrementa el contador
            const counter = await Counters.findOneAndUpdate(
              { key: name_counter }, // Nombre del contador
              { $inc: { value: 1 } }, // Incrementa el valor en 1
              { new: true, upsert: true } // Crea el contador si no existe
            );
        
            // Asigna el valor autoincremental al campo `id`
            this.id = counter.value;
            next();
        } catch (error) {
            next(error);
        }
    }
}




pre_Facturas.pre("save", gen_pre_save("id_factura"))
pre_Metodos_factura.pre("save", gen_pre_save("id_factura_metodo"))
pre_Productos_factura.pre("save", gen_pre_save("id_factura_producto"))


let Facturas = model("Factura", pre_Facturas)
let ProductoFacturas = model("Productos_Factura", pre_Productos_factura)
let MetodoFactura = model("Metodos_Factura", pre_Metodos_factura)

// ============================================================================================
// ============================================================================================
// ============================================================================================

















export {
    Users,
    Productos,
    Clientes,
    Facturas,
    ProductoFacturas,
    MetodoFactura
}