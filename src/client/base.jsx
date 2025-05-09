import { message } from "antd";
import { Component } from "react";

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



let CONVERSION = {
    VES: "ves",
    USD: "usd",
    EUR: "eur",
    divisa_value:{
        ves: 1,
        usd: 58,
        eur: 63,
    }
}

function MDP(name, format, divisa) {
    return {
        name, format, divisa
    }
}

let METODOSDEPAGO = [
    MDP("Bolivares (Efectivo)", "Bs. {n}", CONVERSION.VES),
    MDP("Bolivares (Punto de venta)", "Bs. {n}", CONVERSION.VES),
    MDP("Bolivares (Pago Movil)", "Bs. {n}", CONVERSION.VES),
    MDP("Bolivares (Transferencia)", "Bs. {n}", CONVERSION.VES),
    MDP("Divisas (Efectivo USD)", "{n} $USD", CONVERSION.USD),
    MDP("Divisas (Transferencia Binance/Wallet)", "{n} $USDT", CONVERSION.USD),
    // MDP("Divisas (Efectivo EUR)", "{n} €", CONVERSION.EUR),

    
].map((x,i)=>({...x, key:i}))

function np_validar(cond, obj=go(""), _required_class, message_required) {

    if (cond) {
        obj.classList.add(_required_class)
        msg.error(message_required)
    } else {
        obj.classList.remove(_required_class)
    }

    return Boolean(cond)
}


let METHODS = {
    find:"FIND",
    delete:"DELETE",
    update:"UPDATE",
    loadAll:"LOADALL",
    create:"CREATE"
    
}

let METODO_CONF = {
    getAll: "GETALL",
    save: "SAVE",
    get: "GET"
}

function debug_log(p) {
    console.log(p);

    return p
}

let reqDB = {
    METHODS,
    METODO_CONF,
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
                    query: query||{},
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
                        user: y.user,
                        role: y.role
                    })
                    
                })
            })

        })
    },
    gen_facture:(client, IVA, IGTF, IVA_BS, IGTF_BS, TOTAL, SUBTOTAL, DOLAR_PRICE, PRODUCTS, METHODS, NOTA) => {

        return new Promise((res, err) => {

            fetch("/api/gen_facture", {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    client,

                    IVA,
                    IGTF,
                    IGTF_BS,
                    IVA_BS,

                    TOTAL,
                    SUBTOTAL, 

                    DOLAR_PRICE,
                    PRODUCTS,
                    METHODS,

                    NOTA
                })
            }).then(x=>{
                // console.log(x)
                x.json().then(y=> {
    
                    // console.log(y)
                    
                    res(y)
                })
            })
        })
    },
    send:(url, body) => {
        return new Promise((res, err) => {

            fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(body||{})
            }).then(x=>{
                // console.log(x)
                x.json().then(y=> {
    
                    // console.log(y)
                    
                    res(y)
                }).catch(v=>err(v))
            }).catch(x=>err(x))
        })
    },
    config:(_METODO, key, value, default_value) => {

        return new Promise((res, err) => {

            reqDB.send("/api/config", {
                METHOD: _METODO,
                key,
                value
            }).then(x=> {

                if (x.error) {
                    err(x)
                    return
                } 
                
                if ((x.data.value === undefined) | (x.data.value === "")) {
                    res(default_value)
                    return
                }


                res(x.data.value)
            
            }).catch(x=> err(x))

        })
        
    }
}

let splash = {
    content: <div className="medio container" style={{color: "gray", cursor:"default", fontSize:"30px", fontWeight:"bold"}}>Sin contenido</div>,
    open:(content) => {
        go("_splash").style.display = "flex"
        splash.content = <div></div>
        splash.root.setState({}, () => {
            
            splash.content = content||splash.content;
            splash.root.setState({})
        })
    },
    close:() => {
        go("_splash").style.display = "none"

    },
    root: Component.prototype
}

function WATERMARK() {
    

    return(
        <center>
            RIF-J502377980 <br /> 
            PANADERÍA CYBERCONNECTION <br />
            PUERTO LA CRUZ <br />
        </center>
    )
}

window.login = reqDB.login;


class SpanData extends Component {
    constructor(props) {
        super(props);
    
        this.props = props
    }

    props = {
        title:"",
        content:"",
        right: ""
    }


    render() {
        return(
            <>
                <span>

                    <b>
                        {this.props.title}
                    </b>
                    <span>
                        {" "}{this.props.children}
                    </span>
                    <span style={{
                        float: "right"
                    }}>
                        {this.props.right}
                    </span>
                    

                </span>
                <br />
            </>
        )
    }
}

let USER_ROLE = {
    ROLES: [
        "Administrador",
        "Vendedor",
        "Almacenista"
    ]
}

function validarNumeroFloat(event) {
    
    // // Permite números y un solo punto decimal
    // input.value = input.value.replace(/[^0-9.]/g, '');
    // // Asegura que solo haya un punto decimal
    // input.value = input.value.replace(/(\..*)\./g, '$1');

    if (event.key === 'Backspace' || event.key === 'Tab' || event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
        return true;
    }

    // Permitir solo números (0-9)
    if (!/[0-9.,]/.test(event.key)) {
        event.preventDefault();
        return false;
    }

    return true;

}

function validarNumeroEntero(event) {
    // Permitir teclas de control como retroceso, tab, flechas, etc.
    if (event.key === 'Backspace' || event.key === 'Tab' || event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
        return true;
    }

    // Permitir solo números (0-9)
    if (!/[0-9]/.test(event.key)) {
        event.preventDefault();
        return false;
    }

    return true;
}


export {
    go,
    range,
    msg,
    np_validar,
    reqDB,
    debug_log,
    splash,
    METODOSDEPAGO,
    CONVERSION,
    WATERMARK,
    SpanData,
    USER_ROLE,
    validarNumeroEntero,
    validarNumeroFloat
}