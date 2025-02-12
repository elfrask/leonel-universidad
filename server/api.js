import fs from "fs";
import {Users, Productos, Clientes, Facturas, MetodoFactura, ProductoFacturas} from "./db.js";
import { configDotenv } from "dotenv";
// import lodash, { forEach } from "lodash";
import express from "express";
import bodyParser from "body-parser";
import cookieSession from "cookie-session";
configDotenv()

let ResponseTemplate = {
    error: 0,
    islogin: false,
    data: {}
}


let api = express.Router();

api.use(bodyParser.json())
api.use(cookieSession({
    expires:1000*60*60*24*3,
    keys:["sodjaoidjs", "dmaoisdaodm", "dasodandi"],
    maxAge:1000*60*60*24*3,
    secret:["sodjaoidjs", "dmaoisdaodm", "dasodandi"]
}))


function user_verify(cookie = {user:"", islogin:true, pass:""}) {

    return (new Promise(async (res, err) => {
        if (!cookie.islogin) {
            err({
                islogin: false,
                code: 5,
                cookie,
                log:"no ha iniciado sesión"
            })
            return
        }

        if (cookie.user === "admin") {
            if (cookie.pass === process.env.ADMIN_PASS) {
                res({
                    cookie,
                    Usuario: {
                        user: "admin",
                        pass: "process.env.ADMIN_PASS"
                    },

                })

                return
            } else {
                cookie.islogin = false
                cookie.user = ""
                cookie.pass = ""
                
                err({
                    islogin: false,
                    code: 5,
                    cookie,
                    log:"contraseña del administrador incorrecta"

                })
    
    
                return
            }
        }


        let exist = await Users.find({user: cookie.user})

        if (exist.length > 0) {

            let Usuario = exist[0];

            if (Usuario.pass === cookie.pass) {

                res({
                    cookie,
                    Usuario,
                    islogin: true,

                })
                
            } else {
                cookie.islogin = false
                cookie.user = ""
                cookie.pass = ""

                err({
                    islogin: false,
                    code: 5,
                    cookie,
                    log:"Contraseña del usuario incorrecta"

                })
    
    
                return
            }
            
            
        } else {
            cookie.islogin = false
            cookie.user = ""
            cookie.pass = ""

            err({
                islogin: false,
                code: 5,
                cookie,
                log:"Este usuario no existe"

            })


            return
        }

    }))    
    
}

let METHODS = {
    find:"FIND",
    delete:"DELETE",
    update:"UPDATE",
    loadAll:"LOADALL",
    create:"CREATE"
    
}

let TABLES = {
    users: Users,
    products: Productos,
    clientes: Clientes
}



api.post("/db", async (req, res) => {

    let {METHOD, query, table} = req.body

    user_verify(req.session)
    .then(async (x)=> {

        let Tabla = Users
        Tabla = TABLES[table]

        switch (METHOD) {
            case METHODS.create:
                
                try {
                    let result = new Tabla(query)

                    await result.save();
                    res.json({
                        error:0,
                        data: true
                    })
                } catch (error) {
                    res.json ({
                        error:1,
                        data: false
                    })
                }


                break;
            case METHODS.loadAll:
                
                let _tabla = await Tabla.find(query);

                

                res.json({
                    error: 0,
                    data: _tabla
                })

                break;
            case METHODS.find:
                
                let _tabla2 = await Tabla.findOne(query);

                

                res.json({
                    error: 0,
                    data: _tabla2
                })

                break;
            case METHODS.delete:
                
                try {
                    await Tabla.findOneAndDelete(query);
                    
                    res.json({
                        error: 0,
                        data: true
                    })
                } catch (error) {
                    res.json({
                        error: 1,
                        data: false
                    })
                }

                


                break;
            case METHODS.update:
                
                try {
                    await Tabla.findOneAndUpdate(query, req.body.update);
                    
                    res.json({
                        error: 0,
                        data: true
                    })
                } catch (error) {
                    res.json({
                        error: 1,
                        data: false
                    })
                }

                


                break;
        }
    })
    .catch(x=> {
        console.log(x)
        res.json({
            error: 5,
            data:{}
        })
    })

})


api.post("/gen_facture", async (req, res) => {

    let {
        client,

        IVA,
        IGTF,
        IGTF_BS,
        IVA_BS,
        DOLAR_PRICE,

        TOTAL,
        SUBTOTAL, 


        PRODUCTS,
        METHODS,

        NOTA
    } = req.body

    user_verify(req.session)
    .then(async (x)=> {

        let FACTURA = new Facturas({
            client,

            date: Date(),
            dolar: DOLAR_PRICE,
            igtf: IGTF,
            igtf_bs: IGTF_BS,
            nota: NOTA,
            iva: IVA,
            iva_bs: IVA_BS,
            subtotal: SUBTOTAL,
            total: TOTAL,

        });


        await FACTURA.save()

        // Promise.all()

        for (let i = 0; i < PRODUCTS.length; i++) {
            const x = PRODUCTS[i];
            
            let PRODUCTO = new ProductoFacturas({
                amount: x.amount,
                name: x.name,
                code: x.id,
                total: x.total,
                price: x.price,
    
                id_factura: FACTURA.id
    
            })
    
            await PRODUCTO.save()
        }

        for (let i = 0; i < METHODS.length; i++) {
            const x = METHODS[i];
            
            let METODO = new MetodoFactura({
                divisa: x.divisa,
                method: x.method,
                pay: x.pay,
                total: x.total,
    
                id_factura: FACTURA.id
    
            });
    
            await METODO.save()
            
        }



        res.json({
            error: 0,
            data: {
                facture_id: FACTURA.id
            }
        })

        
       
    })
    .catch(x=> {
        console.log(x)
        res.json({
            error: 5,
            data:{}
        })
    })

});


api.post("/get_facture", async (req, res) => {

    let {
        id
    } = req.body

    user_verify(req.session)
    .then(async (x)=> {

        let Factura = await Facturas.findOne({id})
        let Cliente = await Clientes.findOne({ci: Factura.client})

        let MetodoDePago = await MetodoFactura.find({id_factura: id})
        let Productos = await ProductoFacturas.find({id_factura: id})

        res.json({
            error: 0,
            data: {
                Factura,
                Cliente,
                MetodoDePago,
                Productos
            }
        })

        
       
    })
    .catch(x=> {
        console.log(x)
        res.json({
            error: 5,
            data:{}
        })
    })

})


let METODOS_FILTRO_DE_FACTURA = {
    ALL: "ALL",
    DATE: "DATE",
    MOUTH: "MOUTH",
    YEAR: "YEAR",
    PERIOD: "PERIOD",

}

function Date_str2int(string_date) {
    let DATE = (string_date+"").split("-").map(x=> parseInt(x))


    return [DATE[0], DATE[1] - 1, DATE[2]]
}


api.post("/get_all_facture", async (req, res) => {

    let {
        filter,

        date,

        mouth,
        year,

        start,
        end,

        simple

    } = req.body

    user_verify(req.session)
    .then(async (x)=> {

        let FacturasArray = [];
        let out_data = []

        switch (filter) {
            case METODOS_FILTRO_DE_FACTURA.ALL:
                FacturasArray = await Facturas.find({})
                
                break;
            
            case METODOS_FILTRO_DE_FACTURA.DATE:

                let ed = Date_str2int(date)
                // console.log(date)
                // console.log(ed, new Date(ed[0], ed[1], ed[2]),  new Date(ed[0], ed[1], ed[2] + 1))


                FacturasArray = await Facturas.find({
                    date: {
                                
                        $gte: new Date(ed[0], ed[1], ed[2]),
                        $lte: new Date(ed[0], ed[1], ed[2] + 1)
                    }
                }).exec()
                
                break;
    
            case METODOS_FILTRO_DE_FACTURA.PERIOD:

                let sed = Date_str2int(start), eed = Date_str2int(end)

                FacturasArray = await Facturas.find({
                    date: {
                        $gte: new Date(...sed),
                        $lt: new Date(eed[0], eed[1], eed[2]+1)
                    }
                })
                
                break;
        
            case METODOS_FILTRO_DE_FACTURA.MOUTH:

                FacturasArray = await Facturas.find({
                    date: {
                        $gte: new Date(year, mouth, 1),
                        $lt: new Date(year, mouth + 1, 0)
                    }
                })
                
                break;
            
            case METODOS_FILTRO_DE_FACTURA.YEAR:

                FacturasArray = await Facturas.find({
                    date: {
                        $gte: new Date(year, 0, 1),
                        $lt: new Date(year, 12, 0)
                    }
                })
                
                break;
            
            
        
            default:
                break;
        }


        for (let i = 0; i < FacturasArray.length; i++) {
            // let Factura = await Facturas.findOne();
            let Factura = FacturasArray[i];

            let Cliente = await Clientes.findOne({ci: Factura.client})
                

            let MetodoDePago = await MetodoFactura.find({id_factura: Factura.id})
            let Productos = await ProductoFacturas.find({id_factura: Factura.id})

            if (simple) 
                out_data.push({
                    id: Factura.id,
                    Factura,
                    Cliente
                }); 
            else 
                out_data.push({
                    id: Factura.id,
                    Factura,
                    Cliente,
                    MetodoDePago,
                    Productos
                })
            
        }



        res.json({
            error: 0,
            data: out_data
        })

        
       
    })
    .catch(x=> {
        console.log(x)
        res.json({
            error: 5,
            data:{}
        })
    })

})




api.post("/login", async (req, res) => {
    

    user_verify({
        islogin: true,
        pass: req.body.pass,
        user: req.body.user,
    }).then(x=> {
        
        Object.assign(
            req.session,
            {
                islogin: true,
                pass: req.body.pass,
                user: req.body.user,
            }
        )
        

        res.json({
            error: 0,
            islogin: true
        })
    })
    .catch(x=> {
        res.json({
            error: 1,
            islogin: false
        })
    })



})




api.get("/islogin", async (req, res) => {
    

    user_verify(req.session).then(x=> {

        res.json({
            user: req.session.user,
            islogin: true
        })
    })
    .catch(x=> {
        res.json({
            user: "",
            islogin: false
        })
    })



})

api.get("/logout", (req, res) => {

    req.session.islogin = false
    req.session.pass = ""
    req.session.user = ""
    res.redirect("/")
})




export {
    api
}