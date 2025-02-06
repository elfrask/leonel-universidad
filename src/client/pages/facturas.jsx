import { Component, createRef } from "react";
import { go, np_validar, msg, reqDB, splash, METODOSDEPAGO, CONVERSION } from "../base"; 
import { ClientPage } from "./clientes";
import { ProductsPage } from "./productos";
import { Table, Dropdown, Menu, Descriptions } from "antd";
import Dayjs from "dayjs"
import { method, range } from "lodash";




let RenderProducts = (FactureInstance = FacturePage.prototype) => (text, context) => {

    // console.log(text, record)
    return(

        <Dropdown
            menu={{
                items: [
                    {
                        key:1,
                        label: "Eliminar producto",
                        onClick:(e) => {
                            // console.log("Eliminar", e, context, FactureInstance)
                            FactureInstance.data_products = FactureInstance.data_products.filter((x, i)=> i !== context.key)
                            FactureInstance.setState({})
                        },

                    }
                ],
                
            }}
            trigger={["contextMenu"]}
        >
            <div className="cell">
                {text}
            
            </div>
        </Dropdown>
    )
}

let RenderMethods = (FactureInstance = FacturePage.prototype) => (text, context) => {

    // console.log(text, record)
    return(

        <Dropdown
            menu={{
                items: [
                    {
                        key:1,
                        label: "Eliminar método de pago",
                        onClick:(e) => {
                            FactureInstance.metodos_de_pago = FactureInstance.metodos_de_pago.filter((x, i)=> i !== context.key)
                            FactureInstance.setState({})
                            
                        },

                    }
                ],
                
            }}
            trigger={["contextMenu"]}
        >
            <div className="cell">
                {text}
            
            </div>
        </Dropdown>
    )
}
        
    







function ProductData(id, name, price, amount, total) {
    return {
        id, name, price, amount, total
    }
}


function MethodData(method, pay, total) {
    return({
        method, pay, total
    })
}



function DescriptionData(label, children, opts) {
    
    return {
        label, children,
        ...opts
    }
}

// data_products = []



class FacturePage extends Component {


    constructor(props) {
        super(props);
    
        this.props = props

        this.state = {
            ...this.state,
            cantidad: createRef()

        }

        // this.data_products = [...range(0, 2).map(x=> ProductData(x, "name: "+x, x*10, x, x*10*x))];
        this.data_products = [];
        this.metodos_de_pago = []
    }

    columnsProducts = [
        { title: 'Código', dataIndex: 'id', key: 'id', render: RenderProducts(this)},
        { title: 'Nombre Producto', dataIndex: 'name', key: 'name', render: RenderProducts(this)},
        { title: 'Precio', dataIndex: 'price', key: 'price', render: RenderProducts(this)},
        { title: 'Cantidad', dataIndex: 'amount', key: 'amount', render: RenderProducts(this)},
        { title: 'Total', dataIndex: 'total', key: 'total', render: RenderProducts(this)},
    ];
    
    columnsPayMethods = [
        { title: 'Método de pago', dataIndex: 'name', key: 'name', render: RenderMethods(this)},
        { title: 'Pagó', dataIndex: 'format', key: 'format', render: RenderMethods(this)},
        { title: 'Total en Bs.', dataIndex: 'total_format', key: 'total_format', render: RenderMethods(this)},
        // { title: 'Precio', dataIndex: 'price', key: 'price' },
        // { title: 'Estado', dataIndex: 'enable', key: 'enable' },
    ];

    props = {

    }

    state = {

        client: "",
        client_name: "",

        product_name: "",
        product_data: {},
        productId: -1,

        cantidad: createRef(),

        metodo_pago: -1,
        cantidad_pago: "",

        IVA: 16, 
        IGTF: 3
        
    }

    data_products = []
    metodos_de_pago = []

    productCleanForm() {

        this.state.cantidad.current.value = ""

        this.setState({
            product_name: "",
            product_data: {},
            productId: -1,
        })
    }

    MethodCleanForm() {


        this.setState({
            metodo_pago: -1,
            cantidad_pago: "",
        })
    }

    

    componentDidMount() {

    }

    
    render() {

        let SUBTOTAL = 0, PAGO_RESTANTE = 0

        this.data_products.forEach(x=>{
            let t = ProductData()
            t = x;

            SUBTOTAL = (SUBTOTAL + t.total)

        });

        this.metodos_de_pago.forEach(x=>{
            let t = MethodData()
            t = x;

            PAGO_RESTANTE = PAGO_RESTANTE + t.total
        });

        
        

        let RESUMEN = [
            DescriptionData("Fecha de facturación", (Dayjs()).format("DD/MM/YYYY")),
            DescriptionData("SubTotal", `Bs. ${SUBTOTAL.toFixed(2)}`),
            DescriptionData("Total", `Bs. ${SUBTOTAL.toFixed(2)}`),
            
        ]
        .map((x,i)=> {

            return {
                ...x,
                key: i
            }
        })



        return(
            <div className="container">
                
                <div className="top-control">
                    <h2 className="title-page" style={{
                        margin: "0px",
                        padding: "0px"
                    }}>
                        Facturación
                    </h2>
                    <br />
                    
                    <span>
                        <span className="bold">
                            Fecha de creación de la factura: 
                        </span>
                        <span>
                            {(Dayjs()).format(" DD/MM/YYYY")}
                        </span>
                    </span>
                    
                </div>
                
                <hr />
                
                <div className="top-control">

                    <h3 className="title-page">
                        Selecciona el cliente
                    </h3>
                    <input type="text" readOnly className="_input" placeholder="Cédula del cliente" title="Cédula del cliente" value={this.state.client} onChange={()=>{}}/>
                    <input type="text" readOnly className="_input" placeholder="Nombre y apellido del cliente" title="Nombre y apellido del cliente" value={this.state.client_name}  onChange={()=>{}}/>
                    <input type="button" className="_submit" value="Seleccionar cliente" onClick={() => {

                        splash.open(<ClientPage select onSelect={(data) => {

                            splash.close();

                            this.setState({
                                client: data.ci,
                                client_name: data.name
                            })
                        }} />)
                    }} />
                </div>

                <hr />

                <div className="top-control">

                    <h3 className="title-page">
                        Agrega productos
                    </h3>
                    <input type="text" readOnly id="_prodName" onChange={()=>{}} className="_input" placeholder="Nombre del producto" title="Nombre del producto" value={this.state.product_name}/>
                    <input type="button" className="_submit" value="Seleccionar producto" onClick={() => {

                        splash.open(<ProductsPage select onSelect={(data) => {

                            splash.close();

                            this.setState({
                                productId: data.id,
                                product_name: data.name,
                                product_data: data
                            })
                        }} />)
                    }} />
                    <hr />
                    <input type="number" ref={this.state.cantidad} className="_input" placeholder="Cantidad" title="Cantidad"/>
                    <hr />
                    <input type="button" className="_submit" value="Agregar" onClick={() => {

                        let error = [
                            np_validar(
                                this.state.productId === -1,
                                go("_prodName"),
                                "_required",
                                "Debes seleccionar un producto para agregar"
                            ),
                            np_validar(
                                (this.state.cantidad.current.valueAsNumber < 1) | isNaN(this.state.cantidad.current.valueAsNumber),
                                this.state.cantidad.current,
                                "_required",
                                "Debes asignar una cantidad valida y mayor a 0"
                            ),
                            
                        ]

                        if (error.includes(true)) {
                            // alert("error");
                            return
                        }

                        let dat = this.state.product_data

                        this.data_products.push(ProductData(
                            dat.id,
                            dat.name,
                            dat.price,
                            this.state.cantidad.current.valueAsNumber,
                            this.state.cantidad.current.valueAsNumber * dat.price
                        ))
                        
                        this.productCleanForm()


                        
                    }} />
                    <input type="button" className="_submit" value="Limpiar campos" onClick={() => {

                        this.productCleanForm()
                    }} />
                </div>

                <div className="table-container-scroll cells-padding-less" style={{height: "500px"}}>

                    <Table 
                        className="tab"
                        // style={{height: "400px", overflow:"auto"}}
                        
                        dataSource={this.data_products.map((x, i)=> {
                            
                            return {...x, key: i}
                        })} 
                        columns={this.columnsProducts}

                        pagination={false}

                                              
                        rowClassName={(e) => {
                            return "_row-table-antd " + (e.key === this.state.rowIndex ?"active":"")
                        }}
                         
                        onRow={(e) => {
                            
                            

                            return {
                                style: {
                                    padding: "0px"
                                },
                                
                                // onClick:(row) => {
                                //     if (this.state.rowIndex !== e.key) this.select(e);
                                //     else this.reset_caps()

                                //     // console.log(e)
                                // },
                                // onDoubleClick: (row) => {
                                //     if (this.props.select) {
                                //         this.select(e, true, this.props.onSelect)
                                //     }
                                // }
                                onContextMenu:(event) => {
                                    event.preventDefault()
                                },
                                
                                
                                
                            }
                    }} ></Table>
                </div>

                <hr />

                <div className="top-control">

                    <h3 className="title-page">
                        Agrega método de pago
                    </h3>
                    <h4 className="title-page">
                        Pago restante: Bs. {(SUBTOTAL - PAGO_RESTANTE).toFixed(2)}

                    </h4>
                    <select className="_input" value={this.state.metodo_pago} id="_methodPay" onChange={x=>{
                        let {value} = x.target
                        
                        this.setState({
                            metodo_pago: value
                        })
                    }}>
                        <option value={-1} key={-1}>
                            Seleccionar...
                        </option>
                        {
                            METODOSDEPAGO.map((x, i)=> {
                                

                                return(
                                    <option value={x.key} key={i}>
                                        {x.name}
                                    </option>
                                )
                            })
                        }
                    </select>
                    <Dropdown 
                        trigger={["contextMenu"]}
                        menu={{
                            items:this.state.metodo_pago === -1? [
                                {
                                    label:"Debe seleccionar un método de pago para poder realizar esta acción",
                                    onClick:(e) => {
                                        // go("_methodPay").focus()
                                        // go("_methodPay").click()
                                    }
                                }
                            ]: [
                                {
                                    label:"Auto completar con la conversion en: " + METODOSDEPAGO[this.state.metodo_pago]?.divisa,
                                    onClick:(e) => {

                                        let restante = (SUBTOTAL - PAGO_RESTANTE).toFixed(2)
                                        let conversion =  CONVERSION.divisa_value[
                                            METODOSDEPAGO[this.state.metodo_pago].divisa
                                        ]
                                        
                                        
                                        this.setState({
                                            cantidad_pago: (restante / conversion).toFixed(2)
                                        })
                                    }
                                }
                            ]
                        }}
                    >

                        <input type="number" id="_cantPay" className="_input" placeholder="Pago en divisas/Bs. de acuerdo al método" title="Pago en divisas/Bs. de acuerdo al método" value={this.state.cantidad_pago} onChange={(x) => {
                            let {value: cant, value: text} = x.target;

                            if (!isNaN(cant) | text === "") this.setState({
                                cantidad_pago: cant
                            })
                        }}/>
                    </Dropdown>

                    <hr />
                    <input type="button" className="_submit" value="Agregar" onClick={() => {

                        let NumberCantidadPago = parseFloat(this.state.cantidad_pago)

                        let error = [
                            np_validar(
                                this.state.metodo_pago === -1,
                                go("_methodPay"),
                                "_required",
                                "Debes seleccionar un método de pago"
                            ),
                            np_validar(
                                (NumberCantidadPago <= 0) | isNaN(NumberCantidadPago),
                                go("_cantPay"),
                                "_required",
                                "Debes asignar una cantidad de pago valida y mayor a 0"
                            ),
                            
                        ]

                        if (error.includes(true)) {
                            // alert("error");
                            return
                        }

                        

                        this.metodos_de_pago.push(MethodData(
                            this.state.metodo_pago,
                            NumberCantidadPago,
                            NumberCantidadPago * CONVERSION.divisa_value[
                                METODOSDEPAGO[this.state.metodo_pago].divisa
                            ]
                        ))
                        
                        this.MethodCleanForm()


                        
                    }} />
                    <input type="button" className="_submit" value="Limpiar campos" onClick={() => {

                        this.MethodCleanForm()
                    }} />
                </div>

                <div className="table-container-scroll cells-padding-less" style={{height: "300px"}}>

                    <Table 
                        className="tab"
                        // style={{height: "400px", overflow:"auto"}}
                        
                        dataSource={this.metodos_de_pago.map((x, i)=> {
                            
                            return {
                                ...x, 
                                key: i, 
                                name: METODOSDEPAGO[x.method].name,
                                format: METODOSDEPAGO[x.method].format.replace("{n}", x.pay),
                                total_format: `Bs. ${x.total}`
                                
                            }
                        })} 
                        columns={this.columnsPayMethods}

                        pagination={false}

                                              
                        rowClassName={(e) => {
                            return "_row-table-antd " + (e.key === this.state.rowIndex ?"active":"")
                        }}
                         
                        onRow={(e) => {
                            
                            

                            return {
                                style: {
                                    padding: "0px"
                                },
                                
                                // onClick:(row) => {
                                //     if (this.state.rowIndex !== e.key) this.select(e);
                                //     else this.reset_caps()

                                //     // console.log(e)
                                // },
                                // onDoubleClick: (row) => {
                                //     if (this.props.select) {
                                //         this.select(e, true, this.props.onSelect)
                                //     }
                                // }
                                onContextMenu:(event) => {
                                    event.preventDefault()
                                },
                                
                                
                                
                            }
                    }} ></Table>
                </div>

                <hr />

                <div className="top-control">
                    <h3 className="title-page">
                        Resumen
                    </h3>
                    <hr />
                    <br />
                    <br />
                    {/* <Descriptions items={RESUMEN} /> */}
                    <Descriptions
                        // title="Resumen"
                        layout="vertical"
                        classNames={{
                            label:"des-label",
                            content:"des-content"
                        }}
                        items={[
                            ...RESUMEN
                        ]} 
                    />
                </div>


                <br />
                <br />
            </div>
        )
    }
}



export {
    FacturePage
}