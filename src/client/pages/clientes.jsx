import { Component, createRef } from "react";
import { Table } from "antd";
import { debug_log, go, msg, np_validar, range, reqDB, validarNumeroEntero, validarNumeroFloat } from "../base";

const columns = [
    { title: 'Cédula', dataIndex: 'ci', key: 'ci' },
    { title: 'Nombre y apellido', dataIndex: 'name', key: 'name' },
    { title: 'Dirección', dataIndex: 'address', key: 'address' },
    { title: 'Teléfono', dataIndex: 'phone', key: 'phone' },
    // { title: 'Estado', dataIndex: 'enable', key: 'enable' },
];



class ClientPage extends Component {
    
    constructor(props) {
        super(props);
    
        this.props = props;

        this.state = {
            ...this.state,
            _ci: createRef(),
            _name: createRef(),
            _address: createRef(),
            _phone: createRef(),
            _email: createRef(),
            
        }
    }

    props = {
        select: false,
        onSelect: (dataResponse) => {}
    }


    state = {
        productos:[],
        rowIndex: -1,
        
        _ci: createRef(),
        _name: createRef(),
        _address: createRef(),
        _phone: createRef(),
        _email: createRef(),
        
        data: [],
        filter_mode: 0,
        _find: "",
    }

    cargar() {
        reqDB.query(reqDB.METHODS.loadAll, "clientes", {}, {}).then(y=>{
            // console.log(y)
            y.data.map((x, i) => {
                x.key = i;
            })
            this.setState({data: y.data})
            // console.log(y)
        })
    }

    select(element, returning, cb) {

        reqDB.query(reqDB.METHODS.find, "clientes", {ci: element.ci}).then(x=> {

            if (x.error) {
                msg.error("Hubo un error al intentar obtener información del cliente...");
                return
            }
            
            // this.setState({rowIndex: e.key})
            if (returning) {
                
                if(cb) cb(x.data)

                return
            }

            this.state._name.current.value = x.data.name;
            this.state._ci.current.valueAsNumber = x.data.ci;
            this.state._address.current.value = x.data.address;
            this.state._phone.current.value = x.data.phone;
            this.state._email.current.value = x.data.email||"";

            this.setState({rowIndex: element.key})
        })

    }



    reset_caps () {
        this.state._name.current.value = ""
        this.state._ci.current.value = ""
        this.state._address.current.value = ""
        this.state._email.current.value = ""
        this.state._phone.current.value = ""
        this.setState({rowIndex: -1})
    }

    componentDidMount() {
        this.cargar()
    }

    validar() {


        let results = [
            np_validar(
                (this.state._ci.current.valueAsNumber < 1000000) | (isNaN(this.state._ci.current.valueAsNumber)), 
                this.state._ci.current, 
                "_required", 
                "La cédula debe ser un numero mayor a 1000000"
            ),
    
            np_validar(
                this.state._name.current.value.length < 5, 
                this.state._name.current, 
                "_required", 
                "El nombre del cliente debe de tener por lo menos 5 caracteres"
            ),

            np_validar(
                this.state._address.current.value.length < 5, 
                this.state._address.current, 
                "_required", 
                "La dirección del cliente debe tener como mínimo 5 caracteres"
            ),

            np_validar(
                (this.state._phone.current.value.length !== 11) | (!(/^\d+$/.test(this.state._phone.current.value))), 
                this.state._phone.current, 
                "_required", 
                "El numero de teléfono tiene un formato invalido o no esta completo"
            ),

            
        ]


        if (this.state._email.current.value !== "") {
            let _email = this.state._email.current.value;

            results.push(
                np_validar(
                    !(/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(_email)), 
                    this.state._email.current, 
                    "_required", 
                    "El correo ingresado no es un correo valido"
                )
            )
        }

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
            ci: this.state._ci.current.valueAsNumber,
            phone: this.state._phone.current.value,
            address: this.state._address.current.value,
            name: this.state._name.current.value,
            email: this.state._email.current.value,
        
            // enable: parseInt(this.state._enable.current.value)
        }
    }

    render() {

        let filtro = this.state.data.filter(x=> {
            // console.log(this.state.filter_mode, x, this.state._find)
            if (this.state._find === "") {
                return true
            }
            switch (this.state.filter_mode) {
                case "0":
                    // console.log("llego")
                    return true
                case "1":
                
                    return ((x.ci+"").includes(this.state._find))
                case "2":
                
                    return ((x.name+"").toUpperCase().includes((this.state._find+"").toUpperCase()))
            
            
                default:
                    return true;
            }
            
        })


        return(
            <div className="container page" onKeyDown={(e) => {
                
                
                
                if (e.code === "Escape") {
                    this.reset_caps()
                }
            }}>


                <div className="top-control">
                    <form onSubmit={(e) => {
                        e.defaultPrevented();

                        
                    }}>
                        <h2 className="title-page">
                            Clientes
                        </h2>
                        
                        <div className="_title">Cédula del cliente:</div>

                        <input type="number" className="_input" min={0} onKeyDown={validarNumeroEntero} ref={this.state._ci} placeholder="Cédula" title="Cédula"
                            readOnly={this.state.rowIndex !== -1}
                        />
                        <div className="_title">Nombre y apellido:</div>
                        <input type="text" className="_input" ref={this.state._name} placeholder="Nombre y apellido"  title="Nombre y apellido"/>
                        <div className="_title">Dirección:</div>
                        <input type="text" className="_input" ref={this.state._address} placeholder="Dirección"  title="Dirección"/>
                        <div className="_title">Correo electrónico (opcional):</div>
                        <input type="text" className="_input" ref={this.state._email} placeholder="Correo electrónico (opcional)"  title="Correo electrónico (opcional)"/>
                        <div className="_title">Teléfono:</div>
                        <input type="text" className="_input" ref={this.state._phone} onKeyDown={validarNumeroEntero} placeholder="Teléfono"  title="Teléfono"/>
                        
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

                                        reqDB.query(reqDB.METHODS.create, "clientes", data).then(x=> {
                                            if (np_validar(x.error, this.state._ci.current, "_required", "La cédula de este cliente ya existe")) {
                                                console.log("fallo")
                                                return
                                            };

                                            msg.success("El cliente fue agregado exitosamente")

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

                                            reqDB.query(reqDB.METHODS.update, "clientes", {ci: this.state._ci.current.valueAsNumber}, data).then(x=> {
                                                // if (np_validar(x.error, this.state._ci.current, "_required", "El id de este producto ya esta siendo usado")) {
                                                //     console.log("fallo")
                                                //     return
                                                // };
                                                if (x.error) {
                                                    msg.error("Algo ha salido mal...")
                                                    return
                                                }

                                                msg.success("El producto fue actualizado exitosamente")

                                                // this.reset_caps()
                                                this.cargar()
                                            })
                                            
                                        }

                                        }}/>
                                    {/* <input type="button" className="_submit red" value="Eliminar" /> */}
                                    <input type="button" className="_submit red" value="Cancelar" onClick={() => {
                                        this.reset_caps()
                                    }} />

                                    <input type="button" className={"_submit " + (this.props.select?"":"hide")} value="Seleccionar este cliente"  onClick={() => {

                                        let pre_data = this.get_formData();

                                        this.select(pre_data, true, this.props.onSelect)

                                    }}/>

                                </>
                            )
                        }
                    </form>
                </div>

                <div className="top-control">
                    <h3 className="title-page">
                        Buscar cliente
                    </h3>
                    <input type="text" className="_input" ref={this.state._find} placeholder="Buscar"  title="Buscar" onChange={x=>{
                        // console.log(x.target.value)
                        
                        this.setState({
                            _find: x.target.value
                        })
                    }}/>
                    <select className="_input" value={this.state.filter_mode} onChange={(x) => {
                        this.setState({
                            filter_mode: x.target.value
                        })
                    }}>
                        <option value="0">Ver todo</option>
                        <option value="1">Filtrar por cédula</option>
                        <option value="2">Filtrar por nombre y apellido</option>
                    </select>
                </div>


                <div className="table-container">

                    <Table 
                        className="tab"
                        
                        dataSource={filtro} 
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
                                    console.log("select:", e)

                                    // console.log(e)
                                },
                                onDoubleClick: (row) => {
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
    ClientPage
}