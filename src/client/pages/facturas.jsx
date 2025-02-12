import { Component, createRef } from "react";
import { go, np_validar, msg, reqDB, splash, METODOSDEPAGO, CONVERSION, debug_log, WATERMARK } from "../base"; 
import { ClientPage } from "./clientes";
import { ProductsPage } from "./productos";
import { Table, Dropdown, Menu, Descriptions, message } from "antd";
import Dayjs from "dayjs"
import { method, range } from "lodash";
import withRouter from "../components/withRouter";
import { Link, useLocation } from "react-router-dom";




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


function MethodData(method, pay, total, divisa) {
    return({
        method, pay, total, divisa
    })
}



function DescriptionData(label, children, opts) {
    
    return {
        label, children,
        ...opts
    }
}

// data_products = []



class PREFacturePage extends Component {


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

        nota:"",

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

        let SUBTOTAL = 0, PAGO_RESTANTE = 0, IGTF_SUMATORY = 0, USD = CONVERSION.divisa_value.usd

        this.data_products.forEach(x=>{
            let t = ProductData()
            t = x;

            SUBTOTAL = (SUBTOTAL + t.total)

        });

        this.metodos_de_pago.forEach(x=>{
            let t = MethodData()
            t = x;
            // console.log(x)

            PAGO_RESTANTE = (PAGO_RESTANTE + t.total)

            if (t.divisa !== CONVERSION.VES) {
                // console.log(t.total, this.state.IGTF)
                IGTF_SUMATORY = IGTF_SUMATORY + debug_log(
                    t.total * (this.state.IGTF*0.01)
                )
            }
            
        });

        // console.log(IGTF_SUMATORY)

        // console.log(this.props)

        
        let TOTAL = SUBTOTAL * ((this.state.IVA*0.01) + 1) + IGTF_SUMATORY

        let IVA_BS =  SUBTOTAL * (this.state.IVA*0.01) 

        let RESUMEN = [
            DescriptionData("Fecha de facturación", (Dayjs()).format("DD/MM/YYYY")),
            DescriptionData("SubTotal", `Bs. ${SUBTOTAL.toFixed(2)}`),
            DescriptionData("Precio del dolar", `Bs. ${USD}`),
            DescriptionData("Porcentaje IVA", `${this.state.IVA}%`),
            DescriptionData("Porcentaje IGTF", `${this.state.IGTF}%`),
            DescriptionData("Suma del IGTF en bs", `Bs. ${IGTF_SUMATORY.toFixed(2)}`),
            DescriptionData("Suma del IVA en bs", `Bs. ${(IVA_BS).toFixed(2)}`),
            DescriptionData("Total", `Bs. ${TOTAL.toFixed(2)}`),
            
        ]
        .map((x,i)=> {

            return {
                ...x,
                key: i
            }
        })



        return(
            <div className="container">
                
                {/* FACTURACION */}

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
                
                {/* FORMULARIO DE CLIENTES */}
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

                {/* FORMULARIO Y TABLA DE PRODUCTOS */}

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

                {/* FORMULARIO Y TABLA METODOS DE PAGO */}

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

                            if (!isNaN(cant) | text === "") {


                                this.setState({
                                    cantidad_pago: (cant)
                                })
                            }
                            
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
                            Number(parseInt(NumberCantidadPago * CONVERSION.divisa_value[
                                METODOSDEPAGO[this.state.metodo_pago].divisa
                            ])),
                            METODOSDEPAGO[this.state.metodo_pago].divisa
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

                {/* RESUMEN */}

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

                <div className="top-control">
                    <h3 className="title-page">
                        Nota (opcional)
                    </h3>
                    <hr />
                    <br />
                    <textarea id="" className="_textarea" onChange={x=>{

                        this.setState({
                            nota: x.target.value
                        })
                    }}>

                    </textarea>

                </div>

                <div className="top-control">
                    <h3 className="title-page">
                        Gestion
                    </h3>
                    <hr />
                    <input type="button" value="Generar factura" className="_submit" onClick={x=>{

                        if ((this.state.client === "") | (this.state.client === 0)) {
                            
                            return msg.error("Debes seleccionar un cliente")
                        }

                        if (this.data_products.length === 0) {
                            
                            return msg.error("Debes establecer al menos un producto para proceder")
                        }

                        if (this.metodos_de_pago.length === 0) {
                            
                            return msg.error("Debes establecer métodos de pago para proceder")
                        }

                        if ((SUBTOTAL - PAGO_RESTANTE).toFixed(0) > 2) {
                            return msg.warning(`No haz establecido un pago completo, aun queda Bs. ${(SUBTOTAL - PAGO_RESTANTE).toFixed(2)} restante`)
                            
                        }

                        // return msg.success("Factura generada exitosamente")

                        msg.MessageApi.loading({
                            content:"Generando factura",
                            key:923,
                            duration: 1000
                        })
                        

                        reqDB.gen_facture(
                            this.state.client,

                            this.state.IVA,
                            this.state.IGTF,

                            IVA_BS,
                            IGTF_SUMATORY,
                            TOTAL,
                            SUBTOTAL,
                            USD,
                            this.data_products,
                            this.metodos_de_pago,

                            this.state.nota
                        ).then(x=> {

                            if (x.error) {
                                return msg.error("No posees permisos para ejecutar esta acción")
                            }

                            msg.MessageApi.destroy(923)
                            msg.success("La factura a sido generada exitosamente")



                            this.props.navigate(`/viewfacture?id=${x.data.facture_id}`, {})

                        })
                        .catch(x=> {

                            console.log(x)

                            msg.MessageApi.destroy(923)
                            msg.error("Algo mal ha ocurrido...")

                        })
                    }} />
                </div>


                <br />
                <br />
            </div>
        )
    }
}


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



class PREViewFactureTextPlainComponent extends Component {


    constructor(props) {
        super(props);
    
        this.props = props
    }

    props = {
        onLoadend:(x) => {},
        id: 0
    }

    state = {
        Factura: {},
        Cliente: {},
        MetodoDePago: [],
        Productos: [],

        loading: true

    }

    componentDidMount() {

        let id = 0;

        if (this.props.id === 0) {
            
            let location = this.props.location;
            let params = new URLSearchParams(location.search);
            id = Number(params.get("id"));
        } else id = this.props.id


        reqDB.send("/api/get_facture", {id}).then(x=> {

            if (x.error) {
                return msg.error("El id de esta factura no es Valida")
            }
            // console.log(x)
            this.setState({
                Factura: x.data.Factura,
                Cliente: x.data.Cliente,
                MetodoDePago: x.data.MetodoDePago,
                Productos: x.data.Productos,
                loading: false
            }, () => {
                setTimeout(() =>  {
                    if (this.props.onLoadend) {
                        this.props.onLoadend(this)
                        
                    }
                },100)
            })
            
        })
        
    }

    render() {
        // console.log("State:", this.state)

        if (this.state.loading) return(<div className="container"></div>)

        return(
            <div className="container" key={this.state.Factura.id + "-FACTURE"}>

                {
                    WATERMARK()
                }
                <br />

                <SpanData title="Numero de control:" >
                    {(this.state.Factura.id).toString().padStart(10, "0")}
                </SpanData>
                <SpanData title="Fecha de facturación:" right={"HORA: "+(Dayjs(new Date(this.state.Factura.date))).format("hh:mm A")}>
                    {(Dayjs(new Date(this.state.Factura.date))).format("DD/MM/YYYY") }
                </SpanData>
                <br />
                <SpanData title="CI/R.I.F:" >
                    {this.state.Cliente.ci}
                </SpanData>
                <SpanData title="Nombre:" >
                    {this.state.Cliente.name}
                </SpanData>
                <SpanData title="Dirección:" >
                    {this.state.Cliente.address}
                </SpanData>
                <SpanData title="Teléfono:" >
                    {this.state.Cliente.phone}
                </SpanData>
                
                <br />
                <hr />
                <br />
                {
                    this.state.Productos.map((x, i)=> {


                        return(
                            <>
                                <SpanData title={(
                                        <>
                                            !Codigo: {(x.code).toString().padStart(4, "0")} <br />
                                            {x.name} ({x.amount}): 
                                        </>
                                    )}
                                    key={i + "-product"}
                                    right={<>Bs. {x.total.toFixed(2)}</>}

                                    >
                                        
                                </SpanData>
                                <br />
                            </>
                        )
                    })
                }
                {/* <br /> */}
                <hr />
                <br />
                {
                    this.state.MetodoDePago.map((x, i)=> {

                        let met = METODOSDEPAGO[x.method]


                        return(
                            <>
                                <SpanData title={`${met.name}:`}  key={i + "-method"}
                                    
                                    right={<>Bs. {x.total.toFixed(2)}</>}

                                    >
                                        {(met.divisa !== CONVERSION.VES)&&(
                                            met.format.replace("{n}", x.pay.toFixed(2))
                                        )}
                                        
                                </SpanData>
                            </>
                        )
                    })
                }
                <br />
                <hr />
                <br />
                <SpanData title="SUBTOTAL:"
                    right={`Bs. ${this.state.Factura.subtotal.toFixed(2)}`}
                ></SpanData>

                <SpanData title="IVA:"
                    right={`Bs. ${this.state.Factura.iva_bs.toFixed(2)}`}
                >
                    {this.state.Factura.iva}%
                </SpanData>
                <SpanData title="IGTF:"
                    right={`Bs. ${this.state.Factura.igtf_bs.toFixed(2)}`}
                >
                    {this.state.Factura.igtf}% {(this.state.Factura.igtf_bs === 0) && "(No incluye)"}
                </SpanData>


                <br />
                <hr />
                <br />
                {(this.state.Factura.igtf_bs > 0) && (
                    <SpanData title="PRECIO DOLAR:">
                        Bs. {this.state.Factura.dolar.toFixed(2)}
                    </SpanData>
                )}

                <SpanData title="TOTAL:"
                    right={`Bs. ${this.state.Factura.total.toFixed(2)}`}
                ></SpanData>
                <br />
                <br />

                
                



            </div>
        )

    }
}


class PREViewFacturePage extends Component {


    constructor(props) {
        super(props);
    
        this.props = props
    }

    props = {

    }

    state = {

    }

    componentDidMount() {

    }

    render() {

        let location = this.props.location;
        let params = new URLSearchParams(location.search);
        let id = Number(params.get("id"));

        return(
            <div className="container">
                <br />
                <div className="top-control">
                    <h2 className="title-page">
                        Vista de la factura
                    </h2>
                    <hr />
                    <Link to={"/"}>
                        <input type="button" className="_submit" value="Volver al inicio" />
                    </Link>
                    <Link to={"/facturacion"}>
                        <input type="button" className="_submit" value="Hacer otra factura" />
                    </Link>
                        <input type="button" className="_submit" value="Imprimir" onClick={x=> {

                            open("/vfp?id=" + id, "Imprimir", 'width=800,height=600')
                        }}/>
                    <hr />
                    <br />
                    <div className="page-container">
                        <ViewFactureTextPlainComponent onLoadend={(x) => {
                            
                        }}>

                        </ViewFactureTextPlainComponent>
                    </div>
                </div>
                <br />
            </div>
        )

    }
}

class ViewFacturePrintPage extends Component {
    constructor(props) {
        super(props);
    
        this.props = props
    }

    render() {

        return(
            <ViewFactureTextPlainComponent onLoadend={(e) => {
                print();
                close()
            }}>
                
            </ViewFactureTextPlainComponent>
        )
    }
    
}


const FacturePage = withRouter(PREFacturePage)
const ViewFactureTextPlainComponent = withRouter(PREViewFactureTextPlainComponent)
const ViewFacturePage = withRouter(PREViewFacturePage)

export {
    FacturePage,
    ViewFactureTextPlainComponent,
    ViewFacturePage,
    ViewFacturePrintPage
}