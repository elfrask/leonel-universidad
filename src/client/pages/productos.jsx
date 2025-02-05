import { Component, createRef } from "react";
import { Table } from "antd";
import { go, msg, np_validar, range, reqDB } from "../base";

const columns = [
    { title: 'Codigo', dataIndex: 'id', key: 'id' },
    { title: 'Nombre Producto', dataIndex: 'name', key: 'name' },
    { title: 'Disponible', dataIndex: 'stock', key: 'stock' },
    { title: 'Precio', dataIndex: 'price', key: 'price' },
    { title: 'Estado', dataIndex: 'enable', key: 'enable' },
];



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
    }


    state = {
        productos:[],
        rowIndex: -1,
        
        _id: createRef(),
        _name: createRef(),
        _stock: createRef(),
        _price: createRef(),
        _enable: createRef(),

        data: []
    }

    cargar() {
        reqDB.query(reqDB.METHODS.loadAll, "products", {}, {}).then(y=>{
            console.log(y)
            y.data.map((x, i) => {
                x.key = i;
                x.enable = x.enable ?"Activado":"Desactivado"
            })
            this.setState({data: y.data})
            console.log(y)
        })
    }

    select(element) {

        reqDB.query(reqDB.METHODS.find, "products", {id: element.id}).then(x=> {

            if (x.error) {
                msg.error("Hubo un error al intentar obtener informacion del producto...");
                return
            }
            
            // this.setState({rowIndex: e.key})

            this.state._name.current.value = x.data.name;
            this.state._id.current.valueAsNumber = x.data.id;
            this.state._stock.current.valueAsNumber = x.data.stock;
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
            np_validar(
                (this.state._id.current.valueAsNumber < 0) | (isNaN(this.state._id.current.valueAsNumber)), 
                this.state._id.current, 
                "_required", 
                "El id del producto no es valido"
            ),
    
            np_validar(
                this.state._name.current.value.length < 5, 
                this.state._name.current, 
                "_required", 
                "El nombre del producto debe de tener por lo menos 5 caracteres"
            ),
    
            np_validar(
                (this.state._stock.current.valueAsNumber < 0) | (isNaN(this.state._stock.current.valueAsNumber)), 
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
            stock: this.state._stock.current.valueAsNumber,
            name: this.state._name.current.value,
            enable: parseInt(this.state._enable.current.value)
        }
    }

    render() {


        return(
            <div className="container" onKeyDown={(e) => {
                
                
                
                if (e.code === "Escape") {
                    this.reset_caps()
                }
            }}>


                <div className="top-control">
                    <form onSubmit={(e) => {
                        e.defaultPrevented();

                        
                    }}>
                        <h2 className="title-page">
                            Productos
                        </h2>
                        
                        <input type="number" className="_input" min={0} ref={this.state._id} placeholder="id del producto" title="Id del producto"
                            readOnly={this.state.rowIndex !== -1}
                        />
                        <input type="text" className="_input" ref={this.state._name} placeholder="Nombre del producto"  title="Nombre del producto"/>
                        <input type="number" className="_input" min={0} ref={this.state._stock} placeholder="Cantidad/Stock disponible"  title="Cantidad/Stock disponible"/>
                        <input type="number" className="_input" min={0} ref={this.state._price} placeholder="Precio en Bs."  title="Precio en Bs."/>
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

                                </>
                            )
                        }
                    </form>
                </div>


                <div className="table-container">

                    <Table 
                    className="tab"
                    
                    dataSource={this.state.data} 
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