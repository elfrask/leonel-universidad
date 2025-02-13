import { Component } from "react";
import {Route, NavLink, BrowserRouter, Routes} from "react-router-dom"
import { ProductsPage} from "./pages/productos.jsx"
import { ClientPage } from "./pages/clientes.jsx"
import { FacturePage, ViewFacturePage, ViewFacturePrintPage } from "./pages/facturas.jsx";
import { PREViewReportTextPlainComponent, ReportPage } from "./pages/reportes.jsx";
import { reqDB, msg, go, splash } from "./base.jsx";


import "./App.css"
import withRouter from "./components/withRouter.jsx";
import { ConfPage } from "./pages/conf.jsx";


class NavTo extends Component {

    constructor(props) {
        super(props);

        this.props = props
    } 

    


    props = {
        children:[],
        img:"",
        to:"",
    
    }

    render() {

        
        return(
            <NavLink to={this.props.to} key={`nav-control-div-` + this.props.to} className={(e) => {
                if (e.isActive) {
                    return "nav-active"
                }
            }}>
                <div className="navlink-base">
                    <div className="_icon" style={{
                        backgroundImage:`url('${this.props.img}')`
                    }}>

                    </div>
                    <div className="_caption">
                        {this.props.children}

                    </div>

                </div>

            </NavLink>      
        )

    }
}


class Dashboard extends Component {

    constructor(props) {
        super(props);

        this.props = props
    }

    props = {
        username:"",
    }

    render() {


        return(
            <div className="container center">
                <div className="top-control">
                    <h3 className="center-text">
                        ¡Bienvenido '{this.props.username}'!
                    </h3>
                </div>
                <div className="simple-box">
                    <p>
                        {"<-------------------"}
                        <br />
                        A la izquierda de este contenedor podra acceder a los diferentes apartados del sistema
                    </p>
                </div>
                
                
            </div>
        )
    }
    
}

window.onPass = window.onPass||(() => {});

class App extends Component {


    state = {
        islogin: false,
        user: "",
        loading: true
    }

    componentDidMount(cb) {
        reqDB.islogin().then(x=> {

            // console.log(x)
            this.setState({
                islogin: x.islogin,
                user: x.user,
                loading: false
            }, cb||(() => {}))
        })
    }

    render() {

        splash.root = this

        if (this.state.loading) {
            return (<div></div>)
        }

        if (location.pathname === "/rpp") {
            return <PREViewReportTextPlainComponent wait_data={true} onPromptData={(pass) => {

                window.pass = pass
                window.onPass(pass)


            }} onLoadend={x=>{
                setTimeout(() => {
                    print();
                    close();
                    
                }, 100)
            }} />
        }


        return(

            <div className="marco">
                {
                    !this.state.islogin?(
                        <div className="container medio">
                            <div className="login-box">
                                <form onSubmit={(e) => {
                                    e.preventDefault();

                                    let data = {
                                        user: e.target.user.value,
                                        pass: e.target.pass.value,
                                    }

                                    reqDB.login(data.user, data.pass).then(x=> {
                                        
                                        if (x.error) {
                                            msg.error("Usuario o contraseña incorrectos")
                                        } else {
                                            let _loading = msg.MessageApi.loading({
                                                content: "Iniciando sesión...",
                                                key: 82,
                                                duration: 0,

                                            });

                                            setTimeout(() => {

                                                this.componentDidMount(() => {
                                                    msg.MessageApi.destroy(82)
                                                    msg.success("Haz iniciado sesión correctamente")
                                                })
                                            }, 3000)

                                            
                                        }
                                    })


                                }}>
                                    <center>
                                        <h2>
                                            Inicia sesión
                                        </h2>
                                    </center>
                                    <br />
                                    <hr />
                                    <input type="text" placeholder="Usuario" title="Usuario" className="_input" name="user"/>
                                    <input type="password" placeholder="Contraseña" title="Contraseña" className="_input" name="pass"/>
                                    <br />
                                    <hr />
                                    {/* <br /> */}
                                    <center>
                                        <input type="submit" className="_submit" value={"Iniciar sesión"}/>
                                    </center>
                                </form>
                            </div>
                        </div>
                    ):(
                        
                        <div className="container">
                            <BrowserRouter>
                                {/* <Route path="/vfp" element={ <ViewFactureTextPlainComponent /> }></Route> */}
                                {
                                    location.pathname === "/vfp"?(
                                        <ViewFacturePrintPage />
                                    ):(
                                    <>
                                    
                                        <div className="nav-control">
                                            <NavTo to="/" img="/src/imgs/nav/dashboard.svg">Panel principal</NavTo>
                                            <NavTo to="/productos" img="/src/imgs/nav/products.svg">Productos</NavTo>
                                            <NavTo to="/clientes" img="/src/imgs/nav/clients.svg">Clientes</NavTo>
                                            <NavTo to="/facturacion" img="/src/imgs/nav/cheks.svg">Facturación</NavTo>
                                            <NavTo to="/reportes" img="/src/imgs/nav/report.svg">Reportes</NavTo>
                                            <NavTo to="/conf" img="/src/imgs/nav/conf.svg">Configuraciones</NavTo>
                                            <div className="navlink-base pointer" onClick={() => {
                                                document.location.assign("/api/logout")
                                            }}>
                                                <div className="_icon" style={{
                                                    backgroundImage:`url('/src/imgs/nav/logout.svg')`
                                                }}>

                                                </div>
                                                <div className="_caption">
                                                    Cerrar sesion

                                                </div>

                                            </div>
                                        </div>
                                        <div className="body-content">
                                            <Routes>
                                                <Route path="/" element={[
                                                    <Dashboard username={this.state.user} />
                                                ]}>
                                                
                                                </Route>
                                                <Route path="/productos" element={ <ProductsPage /> }></Route>
                                                <Route path="/clientes" element={ <ClientPage /> }></Route>
                                                <Route path="/facturacion" element={ <FacturePage /> }></Route>
                                                <Route path="/reportes" element={ <ReportPage /> }></Route>
                                                <Route path="/conf" element={ <ConfPage /> }></Route>
                                                <Route index path="/viewfacture" element={ <ViewFacturePage /> }></Route>
                                            </Routes>
                                        </div>
                                    </>

                                    )
                                }

                            </BrowserRouter>

                            <div className="splash-ui medio" id="_splash" style={{
                                display:"none"
                            }}>
                                <div className="splash-box">
                                    <div className="head">
                                        <span className="close" onClick={x=> {
                                            go("_splash").style.display = "none"
                                        }}>X</span>
                                    </div>
                                    <div className="body">
                                        {splash.content}
                                    </div>
                                </div>

                            </div>

                        </div>
                    )
                }
            </div>
        )
    }
}

export default (App);
