import fs from "fs";
import {Users, Productos} from "./db.js";
import { configDotenv } from "dotenv";
import lodash from "lodash";
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
    products: Productos
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