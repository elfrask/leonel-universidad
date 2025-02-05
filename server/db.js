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

let pre_Facturas = new Schema({
    id: {
        type: Number,
    },
    total: Number,
    dolar: Number,
    cliente: Number,
    pay_method: Number,
    nota: String,
    iva: Number,
    igtf: Number,
    date: Date
})

pre_Facturas.pre("save", async function(next, opts) {
    if (!this.isNew) {
        return next()
    }

    try {
        // Incrementa el contador
        const counter = await Counters.findOneAndUpdate(
          { key: "facturaId" }, // Nombre del contador
          { $inc: { value: 1 } }, // Incrementa el valor en 1
          { new: true, upsert: true } // Crea el contador si no existe
        );
    
        // Asigna el valor autoincremental al campo `id`
        this.id = counter.value;
        next();
    } catch (error) {
        next(error);
    }
})

let Facturas = model("Factura", pre_Facturas)




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



export {
    Users,
    Productos,
    Clientes,
    Facturas
}