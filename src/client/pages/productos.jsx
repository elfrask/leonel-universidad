import { Component, createRef } from "react";
import { Table, Modal, Button } from "antd";
import { go, msg, np_validar, range, reqDB, validarNumeroEntero, validarNumeroFloat,  } from "../base";







class ProductsPage extends Component {
    
    constructor(props) {
        super(props);
    
        this.props = props;

        this.state = {
            ...this.state,
            _id: createRef(),
            _name: createRef(),
            _stock: createRef(),
            _price: createRef(),
            _enable: createRef(),
        }

        if (props.select) {
            this.columns.pop()
        }
    }


    props = {
        
        select: false,
        onSelect: (dataResponse) => {}
    }


    state = {
        productos:[],
        rowIndex: -1,
        
        _id: createRef(),
        _name: createRef(),
        _stock: createRef(),
        _price: createRef(),
        _enable: createRef(),

        data: [],
        _find:"",
        filter_mode: 0
        
    }

    columns = [
        { title: 'Codigo', dataIndex: 'id', key: 'id' },
        { title: 'Nombre Producto', dataIndex: 'name', key: 'name' },
        { title: 'Disponible', dataIndex: 'stock', key: 'stock' },
        { title: 'Precio', dataIndex: 'price', key: 'price' },
        { title: 'Estado', dataIndex: 'enable', key: 'enable' },
    ]

    cargar() {
        reqDB.query(reqDB.METHODS.loadAll, "products", {}, {}).then(y=>{
            // console.log(y)
            
            this.setState({data: y.data})
            // console.log(y)
        })
    }

    select(element, returning, cb) {

        reqDB.query(reqDB.METHODS.find, "products", {id: element.id}).then(x=> {

            if (x.error) {
                msg.error("Hubo un error al intentar obtener informacion del producto...");
                return
            }
            
            if (returning) {
                
                if(cb) cb(x.data)

                return
            }
            // this.setState({rowIndex: e.key})

            this.state._name.current.value = x.data.name;
            this.state._id.current.valueAsNumber = x.data.id;
            this.state._stock.current.value = x.data.stock;
            this.state._price.current.valueAsNumber = x.data.price;
            this.state._enable.current.valueAsNumber = x.data.enable;

            this.setState({rowIndex: element.key})
        })

    }

    reset_caps () {
        this.state._name.current.value = ""
        this.state._id.current.value = ""
        this.state._stock.current.value = ""
        this.state._price.current.value = ""
        this.state._enable.current.value = 1
        this.setState({rowIndex: -1})
    }

    componentDidMount() {
        
        this.cargar()
    }

    validar() {


        let results = [
            // np_validar(
            //     (this.state._id.current.valueAsNumber < 0) | (isNaN(this.state._id.current.valueAsNumber)), 
            //     this.state._id.current, 
            //     "_required", 
            //     "El id del producto no es valido"
            // ),
    
            np_validar(
                this.state._name.current.value.length < 5, 
                this.state._name.current, 
                "_required", 
                "El nombre del producto debe de tener por lo menos 5 caracteres"
            ),
    
            np_validar(
                (Number(this.state._stock.current.value) < 0) | (isNaN(Number(this.state._stock.current.value))), 
                this.state._stock.current, 
                "_required", 
                "El stock ingresado es negativo o no es un numero"
            ),
    
            np_validar(
                (this.state._price.current.valueAsNumber <= 0) | (isNaN(this.state._price.current.valueAsNumber)), 
                this.state._price.current, 
                "_required", 
                "El precio del producto no es valido"
            )
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
            id: this.state._id.current.valueAsNumber,
            price: this.state._price.current.valueAsNumber,
            stock: Number(this.state._stock.current.value),
            name: this.state._name.current.value,
            enable: parseInt(this.state._enable.current.value)
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
                
                    return ((x.id+"").includes(this.state._find))
                case "2":
                
                    return ((x.name+"").toUpperCase().includes((this.state._find+"").toUpperCase()))
            
            
                default:
                    return true;
            }
            
        })

        if (this.props.select) {
            filtro = filtro.filter(x=> {
                return x.enable
            })
        }


        return(
            <div className="container page" onKeyDown={(e) => {
                
                
                
                if (e.code === "Escape") {
                    this.reset_caps()
                }
            }}>

                {
                    !this.props.select &&
                    <div className="top-control">
                        <form onSubmit={(e) => {
                            e.defaultPrevented();

                            
                        }}>
                            <h2 className="title-page">
                                Productos
                            </h2>
                            
                            <div className="_title">ID del producto:</div>
                            <input type="number" className="_input" onKeyDown={validarNumeroEntero} min={0} ref={this.state._id} placeholder="ID del producto (automático)" title="ID del producto (automático)"
                                readOnly={true}
                            />
                            <div className="_title">Nombre del producto:</div>
                            <input type="text" className="_input" ref={this.state._name} placeholder="Nombre del producto"  title="Nombre del producto"/>
                            <div className="_title">Cantidad/Disponibilidad:</div>
                            {
                                (this.state.rowIndex === -1) ? (
                                    <input type="number" key={"stock-field"} className="_input" min={0} onKeyDown={validarNumeroFloat} ref={this.state._stock} placeholder="Cantidad/Stock disponible"  title="Cantidad/Stock disponible"/>
                                ):(
                                    <input type="Button" key={"stock-field"} className="_submit" min={0} onKeyDown={validarNumeroFloat} ref={this.state._stock} title="Cantidad/Stock disponible"
                                        style={{
                                            textAlign:"left",
                                            width:"100%",
                                            padding:"12px"
                                        }}
                                        onClick={x=> {

                                            let _a = Modal.confirm({
                                                title:"Agregar o quitar elementos",
                                                content: (
                                                    <>
                                                        <div className="_title">Coloca la cantidad de elementos que deseas agregar o quitar del stock:</div>
                                                        <div className="_title">Cantidad actual: {this.state._stock.current.value}</div>
                                                        <input type="number" id="__add_stock" min={0} className="_input" onKeyDown={validarNumeroFloat} placeholder="Agregar o quitar"/>
                                                    </>
                                                ),
                                                footer: (_, {OkBtn, CancelBtn}) => {
                                                    return(
                                                        <>
                                                            <CancelBtn />
                                                            <Button type="primary" value="Ok" onClick={(h) => {
                                                                let _add = go("__add_stock").valueAsNumber;
                                                    
                                                    
                                                                if (!np_validar(
                                                                    isNaN(_add),
                                                                    go("__add_stock"),
                                                                    "_required",
                                                                    "Debe de colocar un numero valido y mayor a 0"
                                                                )) {
            
                                                                    let _amount = Number(this.state._stock.current.value)
            
                                                                    this.state._stock.current.value = (_amount + _add)
                                                                    
                                                                    _a.destroy()
                                                                }
                                                            }}>
                                                                Agregar
                                                            </Button>
                                                            <Button type="primary" value="Ok" onClick={(h) => {
                                                                let _add = go("__add_stock").valueAsNumber;
                                                    
                                                    
                                                                if (!np_validar(
                                                                    isNaN(_add),
                                                                    go("__add_stock"),
                                                                    "_required",
                                                                    "Debe de colocar un numero valido y mayor a 0"
                                                                )) {
            
                                                                    let _amount = Number(this.state._stock.current.value)
            
                                                                    this.state._stock.current.value = (_amount - _add)
                                                                    
                                                                    _a.destroy()
                                                                }
                                                            }}>
                                                                Quitar
                                                            </Button>
                                                            <Button type="primary" value="Ok" onClick={(h) => {
                                                                let _add = go("__add_stock").valueAsNumber;
                                                    
                                                    
                                                                if (!np_validar(
                                                                    isNaN(_add),
                                                                    go("__add_stock"),
                                                                    "_required",
                                                                    "Debe de colocar un numero valido y mayor a 0"
                                                                )) {
            
                                                                    let _amount = Number(this.state._stock.current.value)
            
                                                                    this.state._stock.current.value = (_add)
                                                                    
                                                                    _a.destroy()
                                                                }
                                                            }}>
                                                                Establecer
                                                            </Button>

                                                        </>
                                                    )
                                                }
                                            })
                                        }}
                                    
                                    />
                                )
                            }
                            <div className="_title">Precio del producto en Bs.</div>
                            <input type="number" className="_input" min={0} onKeyDown={validarNumeroFloat} ref={this.state._price} placeholder="Precio en Bs."  title="Precio en Bs."/>
                            <div className="_title">¿Este producto sera visible?</div>
                            <select defaultValue={1} ref={this.state._enable} className="_input" title="Estado del producto">
                                <option value={0}>Desactivado</option>
                                <option value={1}>Activado</option>
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

                                            data.id = undefined

                                            reqDB.query(reqDB.METHODS.create, "products", data).then(x=> {
                                                if (np_validar(x.error, this.state._id.current, "_required", "El id de este producto ya esta siendo usado")) {
                                                    console.log("fallo")
                                                    return
                                                };

                                                msg.success("El producto fue agregado exitosamente")

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

                                                reqDB.query(reqDB.METHODS.update, "products", {id: this.state._id.current.valueAsNumber}, data).then(x=> {
                                                    // if (np_validar(x.error, this.state._id.current, "_required", "El id de este producto ya esta siendo usado")) {
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

                                        <input type="button" className={"_submit " + (this.props.select?"":"hide")} value="Seleccionar este producto"  onClick={() => {

                                            let pre_data = this.get_formData();

                                            this.select(pre_data, true, this.props.onSelect)

                                        }}/>

                                    </>
                                )
                            }
                        </form>
                    </div>
                }


                <div className="top-control">
                    <h3 className="title-page">
                        Buscar producto
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
                        <option value="1">Filtrar por ID</option>
                        <option value="2">Filtrar por nombre del producto</option>
                    </select>
                </div>


                <div className="table-container">

                    <Table 
                    className="tab"
                    
                    dataSource={filtro.map((x, i)=> {
                        
                        return ({
                            ...x,
                            enable: x.enable ?"Activado":"Desactivado",
                            key: i
                        })
                    })} 
                    columns={this.columns}

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
    ProductsPage
}