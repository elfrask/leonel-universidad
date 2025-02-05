import { message } from "antd";

let go = (a) => document.getElementById(a);

let range = (i, f, s) => {
    let out = [];
    i = i||0;
    f = f||1;
    s = s||1;

    for (let ii = i; ii < f; ii = ii + s) {
        out.push(ii)
        
    }


    return out
}

let INTERFACE_MSG = {duration:0, key:"", className:"", style:{}, icon:"", onClick:()=>{}, onClose:()=>{}}

let gen_message_engine = (_type) => {
    

    return (text, options=INTERFACE_MSG) => {

        // message.info(text, options?.duration||5)
        return _type(text, options?.duration||5, options?.onClose||(()=>{}))
        // msg_api.open({
        //     type,
        //     content: text,
        //     ...(options||{})
        // })
    }
}

let msg = {
    info: gen_message_engine(message.info),
    error: gen_message_engine(message.error),
    warning: gen_message_engine(message.warning),
    success: gen_message_engine(message.success),
    loading: gen_message_engine(message.loading),
    MessageApi: message

}


function np_validar(cond, obj=go(""), _required_class, message_required) {

    if (cond) {
        obj.classList.add(_required_class)
        msg.error(message_required)
    } else {
        obj.classList.remove(_required_class)
    }

    return cond
}


let METHODS = {
    find:"FIND",
    delete:"DELETE",
    update:"UPDATE",
    loadAll:"LOADALL",
    create:"CREATE"
    
}

let reqDB = {
    METHODS,
    query:(METHOD="", table="", query= {}, update={}) => {

        return new Promise((res, err) => {
            // console.log("enviado")

            fetch("/api/db", {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    METHOD,
                    table,
                    query,
                    update:update||{}
                })
            }).then(X=> {
                X.json().then(y => {
                    // console.log("response:", y)
                    res(y)
                })
            }).catch(x=>{
                    // console.log("response error:", y)
                    err(x)
            })

        })
        
    },
    login:(user, pass) => {

        return new Promise((res, err) => {

            fetch("/api/login", {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    user,
                    pass
                })
            }).then(x=>{
                x.json().then(y=> {
    
                    // console.log(y)
                    if (y.error) {
                        console.error("Credenciales invalidas, hubo un error al iniciar sesión")
                    } else {
                        console.info("Haz iniciado sesión correctamente")
                    }

                    res(y)
                })
            })
        })
    },
    islogin:() => {

        return new Promise((res, err) => {

            fetch("/api/islogin").then(x=>{
                x.json().then(y=> {
                    
                    // console.error("llego")
                    
                    res({
                        islogin: y.islogin,
                        user: y.user
                    })
                    
                })
            })

        })
    }
}

window.login = reqDB.login;

export {
    go,
    range,
    msg,
    np_validar,
    reqDB
}