import { Component, createRef } from "react";
import { Table } from "antd";
import { go, msg, np_validar, range, reqDB, USER_ROLE, validarNumeroFloat } from "../base";

const columns = [
    { title: 'Usuario', dataIndex: 'user', key: 'user' },
    { title: 'Contraseña', dataIndex: 'pass', key: 'pass' },
    { title: 'Rol de usuario', dataIndex: 'role_text', key: 'role_text' },
    
];



class ConfPage extends Component {
    
    constructor(props) {
        super(props);
    
        this.props = props;

        this.state = {
            ...this.state,
            _name: createRef(),
            _pass: createRef(),
            _role: createRef(),
        }
    }


    props = {
        
        select: false,
        onSelect: (dataResponse) => {}
    }


    state = {
        productos:[],
        rowIndex: -1,
        
        _user: createRef(),
        _pass: createRef(),
        _role: createRef(),

        dolar: 1,
        iva: 1,
        igtf: 1,

        
        data: [],
        _find:"",
        filter_mode: 0
        
    }

    async cargar() {

        let DOLAR = await reqDB.config(reqDB.METODO_CONF.get, "dolar", "", 60);
        let IVA = await reqDB.config(reqDB.METODO_CONF.get, "iva", "", 15);
        let IGTF = await reqDB.config(reqDB.METODO_CONF.get, "igtf", "", 2);

        let _conf = {
            dolar: DOLAR,
            iva: IVA,
            igtf: IGTF
        }

        console.log(_conf)

        this.setState(_conf)

        reqDB.query(reqDB.METHODS.loadAll, "users", {}, {}).then(y=>{
            // console.log(y)
            y.data.map((x, i) => {
                x.key = i;
                // x.enable = x.enable ?"Activado":"Desactivado"
            })
            this.setState({data: y.data})
            // console.log(y)
        })
    }

    select(element, returning, cb) {

        reqDB.query(reqDB.METHODS.find, "users", {user: element.user}).then(x=> {

            if (x.error) {
                msg.error("Hubo un error al intentar obtener información del usuario...");
                return
            }
            
            if (returning) {
                
                if(cb) cb(x.data)

                return
            }
            // this.setState({rowIndex: e.key})

            this.state._user.current.value = x.data.user;
            this.state._pass.current.value = x.data.pass;
            this.state._role.current.value = x.data.role;

            this.setState({rowIndex: element.key})
        })

    }

    reset_caps () {
        this.state._user.current.value = ""
        this.state._pass.current.value = ""
        this.state._role.current.value = 0

        this.setState({rowIndex: -1})
    }

    componentDidMount() {
        this.cargar()
    }

    validar() {


        let results = [
            np_validar(
                this.state._user.current.value.length < 5, 
                this.state._user.current, 
                "_required", 
                "El nombre del usuario debe de tener por lo menos 5 caracteres"
            ),
            np_validar(
                this.state._pass.current.value.length < 5, 
                this.state._pass.current, 
                "_required", 
                "la contraseña debe de tener por lo menos 5 caracteres"
            ),
            
        ]
        results = results.map(x=> Boolean(x))
        // console.log("result", results)
        // console.log("results.includes(true)", results.includes(true))
        // console.log("results.includes(false)", results.includes(false))
        if (results.includes(true)) { //si hay error
            return true
        }


        
        
        return false
        

    }

    conf_validar() {


        let results = [
            np_validar(
                this.state.dolar <= 0, 
                go("dolar"), 
                "_required", 
                "El valor del dolar no es valido"
            ),
            np_validar(
                this.state.iva <= 0, 
                go("iva"), 
                "_required", 
                "El valor del iva no es valido"
            ),
            np_validar(
                this.state.igtf <= 0, 
                go("igtf"), 
                "_required", 
                "El valor del igtf no es valido"
            ),
            
            
        ]
        results = results.map(x=> Boolean(x))
        // console.log("result", results)
        // console.log("results.includes(true)", results.includes(true))
        // console.log("results.includes(false)", results.includes(false))
        if (results.includes(true)) { //si hay error
            return true
        }


        
        
        return false
        

    }

    get_formData() {


        return {
            user: this.state._user.current.value,
            pass: this.state._pass.current.value,
            role: parseInt(this.state._role.current.value)
        }
    }

    render() {

        
        // console.log(this.state.data)

        return(
            <div className="container page" onKeyDown={(e) => {
                
                
                
                if (e.code === "Escape") {
                    this.reset_caps()
                }
            }}>

                <div className="top-control">
                    <h2 className="title-page">
                        Configuraciones
                    </h2>
                    <hr />
                    <div className="_title">
                        Precio del Dolar en Bs:
                    </div>
                    <input type="number" onKeyDown={validarNumeroFloat} value={this.state.dolar} id="dolar" className="_input" placeholder="Dolar" title="Dolar" onChange={(x) => {
                        this.setState({
                            dolar: x.target.value
                        })
                    }}/>
                    <div className="_title">
                        IVA en %:
                    </div>
                    <input type="number" value={this.state.iva} onKeyDown={validarNumeroFloat} id="iva" className="_input" placeholder="IVA" title="IVA" onChange={(x) => {
                        this.setState({
                            iva: x.target.value
                        })
                    }}/>
                    <div className="_title">
                        IGTF en %:
                    </div>
                    <input type="number" value={this.state.igtf} onKeyDown={validarNumeroFloat} id="igtf" className="_input" placeholder="IGTF" title="IGTF" onChange={(x) => {
                        this.setState({
                            igtf: x.target.value
                        })
                    }}/>
                    <hr />
                    <input type="button" className="_submit" value="Guardar" onClick={async d=>{

                        let error = this.conf_validar();

                        if (!error) {

                            await reqDB.config(reqDB.METODO_CONF.save, "dolar", this.state.dolar, 60);
                            await reqDB.config(reqDB.METODO_CONF.save, "iva", this.state.iva, 15);
                            await reqDB.config(reqDB.METODO_CONF.save, "igtf", this.state.igtf, 2);

                            msg.success("Configuraciones guardadas")
                            
                        } else {
                            msg.error("Hubo un error al guardar las configuraciones")
                        }

                    }} />
                    

                </div>


                <div className="top-control">
                    <form onSubmit={(e) => {
                        e.defaultPrevented();

                        
                    }}>
                        <h2 className="title-page">
                            Usuarios
                        </h2>
                        
                        <input type="text" className="_input" min={0} ref={this.state._user} placeholder="Usuario" title="Usuario"
                            readOnly={this.state.rowIndex !== -1}
                        />
                        <input type="password" className="_input" ref={this.state._pass} placeholder="Contraseña"  title="Contraseña"/>
                        {/* <input type="number" className="_input" min={0} ref={this.state._stock} placeholder="Cantidad/Stock disponible"  title="Cantidad/Stock disponible"/>
                        <input type="number" className="_input" min={0} ref={this.state._price} placeholder="Precio en Bs."  title="Precio en Bs."/> */}
                        <select defaultValue={0} ref={this.state._role} className="_input" title="Rol del usuario">
                            {
                                USER_ROLE.ROLES.map((x, i)=> {
                                    return(
                                        <option value={i} key={i}>{x}</option>
                                    )
                                })
                            }
                        </select>
                        <br />
                        <br />
                        {
                            (
                                this.state.rowIndex === -1
                            )?(
                                <input type="button" className="_submit" value={"Agregar"} onClick={() => {

                                    let error = this.validar()
                                    // console.log(yeah)

                                    if (!error) {
                                        let data = this.get_formData();

                                        reqDB.query(reqDB.METHODS.create, "users", data).then(x=> {
                                            if (np_validar(x.error, this.state._user.current, "_required", "Este usuario ya existe")) {
                                                // console.log("fallo")
                                                return
                                            };

                                            msg.success("El usuario fue agregado exitosamente")

                                            this.reset_caps()
                                            this.cargar()
                                        })
                                        
                                    }

                                }} />

                            ):(
                                <>
                                    <input type="button" className="_submit" value="Actualizar"  onClick={() => {

                                        let error = this.validar()
                                        // console.log(error)

                                        if (!error) {
                                            let data = this.get_formData();

                                            reqDB.query(reqDB.METHODS.update, "users", {user: this.state._user.current.value}, data).then(x=> {
                                                
                                                if (x.error) {
                                                    msg.error("Algo ha salido mal...")
                                                    return
                                                }

                                                msg.success("El usuario fue actualizado exitosamente")

                                                // this.reset_caps()
                                                this.cargar()
                                            })
                                            
                                        }

                                        }}/>
                                    {/* <input type="button" className="_submit red" value="Eliminar" /> */}
                                    <input type="button" className="_submit red" value="Cancelar" onClick={() => {
                                        this.reset_caps()
                                    }} />

                                </>
                            )
                        }
                    </form>
                </div>


                <div className="table-container">

                    <Table 
                    className="tab"
                    
                    dataSource={this.state.data.map(x=> {

                        // console.log(x)

                        return({
                            user: x.user,
                            role_text: USER_ROLE.ROLES[x.role],
                            pass: "********"
                        })
                    })} 
                    columns={columns}

                    pagination={{

                        pageSize: 8,
                        // total: 8
                    }}

                     
                    rowClassName={(e) => {
                        return "_row-table-antd " + (e.key === this.state.rowIndex ?"active":"")
                    }} onRow={(e) => {
                        
                        
                        return {
                            onClick:(row) => {
                                if (this.state.rowIndex !== e.key) this.select(e);
                                else this.reset_caps()

                                // console.log(e)
                            },
                            onDoubleClick:(row) => {
                                // alert("seleccionar")

                                if (this.props.select) {
                                    this.select(e, true, this.props.onSelect)
                                }
                            }
                            
                            
                        }
                    }} ></Table>
                </div>

                <br />



            </div>
        )
    }
}




export {
    ConfPage
}