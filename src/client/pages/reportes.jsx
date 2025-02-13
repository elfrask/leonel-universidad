import { Component, createRef } from "react";
import { Table, Descriptions } from "antd";
import { go, METODOSDEPAGO, msg, np_validar, range, reqDB, splash, WATERMARK, SpanData } from "../base";
import { PREViewFactureTextPlainComponent } from "./facturas";
import Dayjs from "dayjs";
import { clamp } from "lodash";

const columns = [
    { title: 'ID Factura', dataIndex: 'id_caption', key: 'id_caption' },
    { title: 'Cliente', dataIndex: 'client_name', key: 'client_name' },
    { title: 'Fecha de creación', dataIndex: 'date', key: 'date' },
    { title: 'Total', dataIndex: 'total', key: 'total' },
    // { title: 'Estado', dataIndex: 'enable', key: 'enable' },
];

const columnsMetodosDePago = [
    { title: 'Método de pago', dataIndex: 'label', key: 'label' },
    { title: 'Pagos hechos', dataIndex: 'amount', key: 'amount' },
    { title: 'Total', dataIndex: 'pay', key: 'pay' },
    { title: 'Total en Bs.', dataIndex: 'total', key: 'total' },
    // { title: 'Estado', dataIndex: 'enable', key: 'enable' },
];

const columnsProductos = [
    { title: 'Nombre de producto', dataIndex: 'label', key: 'label' },
    { title: 'Cantidad vendida', dataIndex: 'amount', key: 'amount' },
    // { title: 'Total', dataIndex: 'pay', key: 'pay' },
    { title: 'Ganancia total', dataIndex: 'total', key: 'total' },
    // { title: 'Estado', dataIndex: 'enable', key: 'enable' },
];



let METODOS_FILTRO = {
    ALL: "ALL",
    DATE: "DATE",
    MOUTH: "MOUTH",
    YEAR: "YEAR",
    PERIOD: "PERIOD",

}

window.Dayjs = Dayjs;

function DescriptionData(label, children, opts) {
    
    return {
        label, children,
        ...opts
    }
}




class PREViewReportTextPlainComponent extends Component {


    constructor(props) {
        super(props);
    
        this.props = props
    }

    props = {
        onLoadend:(x) => {},
        onPromptData:(x) => {},

        // filter: 0,
        // date: Dayjs(new Date()).format("YYYY-MM-DD"),//"2025-01-01",

        // mouth: Dayjs(new Date()).month(),
        // year: Dayjs(new Date()).year(),

        // start: Dayjs(new Date()).format("YYYY-01-01"),
        // end: Dayjs(new Date()).format("YYYY-MM-DD"),

        wait_data: false,

        facturas:[],

        productos: [],
    }

    state = {
        facturas:[],

        productos: [],


        loading: true

    }

    pass({productos, facturas}) {

        // alert("llego")

        this.setState({
            productos,
            facturas,
            loading: false
        }, () => {

            if (this.props.onLoadend) {
                this.props.onLoadend(this)
                
            }
        })
    }

    componentDidMount() {

        if (this.props.wait_data) {
            return this.props.onPromptData(this)
        }


        this.pass({
            productos: this.props.productos,
            facturas: this.props.facturas,
        })
    }


    render() {
        // console.log("State:", this.state)

        if (this.state.loading) return(<div className="container"></div>);


        let 
            TOTAL = 0, 
            NUM_PEDIDOS = 0, 
            Desde = 0,
            Hasta = 0;
        
        
        
        let MetodosDePago = METODOSDEPAGO.map(x=>{

            return {
                label: x.name,
                amount: 0,
                pay: 0,
                total: 0
            }
        })

        // console.log(this.state.productos)

        let PRODUCTOS = {};
        
        this.state.productos.forEach(x=>{

            PRODUCTOS[x.id] = {
                id: x.id,
                key: x.id + "-product",
                label: x.name,
                amount: 0,
                total: 0,
                
            }
        })
        

        let mostrar = this.state.facturas.map((x, i)=> {
            NUM_PEDIDOS++;

            TOTAL = TOTAL + x.Factura.total

            let DATE_FAC = Dayjs(x.Factura.date)

            if ((Desde === 0) & (Hasta === 0)) {
                Desde = DATE_FAC
                Hasta = DATE_FAC
            };

            if (Desde > DATE_FAC) {
                Desde = DATE_FAC
            }
            if (Hasta < DATE_FAC) {
                Hasta = DATE_FAC
            }

            x.MetodoDePago.map(y=> {
                let MET = MetodosDePago[y.method];

                MET.amount++;
                MET.pay = MET.pay + y.pay
                MET.total = MET.total + y.total
            });

            // console.group("FACTURE:", x.id)

            x.Productos.map((y, t)=> {
                let MET = PRODUCTOS[y.code];

                // console.log()
                // console.group("MET y Y - " + t)
                // console.log("",MET)
                // console.log("",y)

                // console.groupEnd()

                MET.amount = MET.amount + y.amount;
                MET.total = MET.total + y.total
            });
            // console.groupEnd()

            
            




            return {
                id: x.id,
                id_caption: (x.id+"").padStart(10, "0"),
                client_name: `(${x.Cliente.ci}) ${x.Cliente.name}`,
                date: Dayjs(x.Factura.date).format("DD/MM/YYYY hh:mm A"),
                total: `Bs. ${x.Factura.total.toFixed(2)}`,
                key: i + "-facture-index"
            }
        })

        let RESUMEN = [
            DescriptionData("Fecha del reporte", (Dayjs()).format("DD/MM/YYYY")),
            DescriptionData("Numero de pedidos", NUM_PEDIDOS),
            // DescriptionData("Desde", Desde),
            // DescriptionData("Hasta", Hasta),
            
            ...[
                ...((Desde === 0) & (Hasta === 0)?[]:[
                    DescriptionData("Desde", Desde.format("DD/MM/YYYY")),
                    DescriptionData("Hasta", Hasta.format("DD/MM/YYYY")),

                ])
            ],
            
            DescriptionData("Total en Bs", `Bs. ${TOTAL.toFixed(2)}`),
            
            
        ]
        .map((x,i)=> {

            return {
                ...x,
                key: i + "-d"
            }
        })



        

        return(
            <div className="container">

                {
                    WATERMARK()
                }
                
                <br />

                <SpanData title="Fecha de reporte:" right={"HORA: "+(Dayjs(new Date())).format("hh:mm A")}>
                    {(Dayjs(new Date())).format("DD/MM/YYYY") }
                </SpanData>

                <br />
                <h4>
                    Facturas
                </h4>
                {/* <br /> */}
                <hr />
                <br />
                {
                    mostrar.map(x=> {
                        

                        return(
                            <>
                                <SpanData title="Factura:" right={x.total}>
                                    {x.id_caption} {x.date}
                                </SpanData>
                                <SpanData title="Cliente:">
                                    {x.client_name}
                                </SpanData>
                                <br />
                            </>
                        )
                    })
                }
                <hr />
                <br />
                <h4>
                    Metodos de pago
                </h4>
                {/* <br /> */}
                <hr />
                <br />
                {
                    MetodosDePago.map((x, i)=> {
                        
                        let METOD = METODOSDEPAGO[i]

                        // return {
                        //     ...x,
                        //     pay: METOD.format.replace("{n}", x.pay.toFixed(2)),
                        //     total: `Bs. ${x.total.toFixed(2)}`,
                        // }

                        return(

                            <>
                                <h4>
                                    {x.label}
                                </h4>
                                <SpanData 
                                    title={"Veces pagado: " + x.amount}
                                    right={`Bs. ${x.total.toFixed(2)}`}

                                >
                                    Total: {METOD.format.replace("{n}", x.pay.toFixed(2))}
                                </SpanData>
                                <br />
                            </>
                        )
                    })
                }
                <hr />
                <br />
                <h4>
                    Productos vendidos
                </h4>
                {/* <br /> */}
                <hr />
                <br />
                {

                    Object.keys(PRODUCTOS).map(x=>{

                        let PRO = PRODUCTOS[x];

                        // return {
                        //     ...PRO,

                        //     total: `Bs. ${(PRO.total * 1.16).toFixed(2)}`

                        // }



                        return(

                            <>
                                <h4>
                                    ({(PRO.id+"").padStart(4, "0")}) {PRO.label}
                                </h4>
                                <SpanData 
                                    title={"Cantidad vendida:"}
                                    right={`Bs. ${PRO.total.toFixed(2)}`}

                                >
                                    {PRO.amount}
                                </SpanData>
                                <br />
                            </>
                        )
                    })
                }
                <hr />
                <br />
                <SpanData title="Desde:" right={`${Desde.format("DD/MM/YYYY")}`}></SpanData>
                <SpanData title="Hasta:" right={`${Hasta.format("DD/MM/YYYY")}`}></SpanData>
                <SpanData title="Numero de pedidos:" right={NUM_PEDIDOS}></SpanData>
                <SpanData title="TOTAL:" right={`Bs. ${TOTAL}`}></SpanData>





                

            </div>
        )

    }
}





class ReportPage extends Component {
    
    constructor(props) {
        super(props);
    
        this.props = props;

        this.state = {
            ...this.state,
        }
    }


    props = {
        
        select: false,
        onSelect: (dataResponse) => {}
    }


    state = {
        facturas:[],

        productos: [],

        filter: 0,
        date: Dayjs(new Date()).format("YYYY-MM-DD"),//"2025-01-01",

        mouth: Dayjs(new Date()).month(),
        year: Dayjs(new Date()).year(),

        start: Dayjs(new Date()).format("YYYY-01-01"),
        end: Dayjs(new Date()).format("YYYY-MM-DD")
    }

    componentDidMount() {
        this.filtrar(METODOS_FILTRO.ALL)
    }

    async filtrar(METODO) {
        msg.MessageApi.loading({
            content: "Cargando...",
            key: 9231,
            duration: 1000
        })


        try {
            
            let DATA_FACTURES = await reqDB.send("/api/get_all_facture", {
                filter: METODO,
    
                date: this.state.date,
    
                mouth: this.state.mouth,
                year: this.state.year,
    
                start: this.state.start,
                end: this.state.end,
    
                // simple: true
    
            })

            let PRODUCTOS = await reqDB.query(reqDB.METHODS.loadAll, "products", {})


            this.setState({
                facturas: DATA_FACTURES.data,
                productos: PRODUCTOS.data
            })
            
            msg.MessageApi.destroy(9231)

        } catch (error) {
            msg.MessageApi.destroy(9231)
            
        }


        // reqDB.send("/api/get_all_facture", {
        //     filter: METODO,

        //     date: this.state.date,

        //     mouth: this.state.mouth,
        //     year: this.state.year,

        //     start: this.state.start,
        //     end: this.state.end,

        //     // simple: true

        // }).then(x=>{
        //     // console.log(x)
        //     msg.MessageApi.destroy(9231)

        //     this.setState({
        //         facturas: x.data
        //     })

        // }).catch(x=>{
        //     // console.log(x)

        //     msg.MessageApi.destroy(9231)

        // })
    }


    render() {

        
        // console.log(this.state.facturas)

        let 
            TOTAL = 0, 
            NUM_PEDIDOS = 0, 
            Desde = 0,
            Hasta = 0;
        
        
        
        let MetodosDePago = METODOSDEPAGO.map(x=>{

            return {
                label: x.name,
                amount: 0,
                pay: 0,
                total: 0
            }
        })

        // console.log(this.state.productos)

        let PRODUCTOS = {};
        
        this.state.productos.forEach(x=>{

            PRODUCTOS[x.id] = {
                id: x.id,
                key: x.id + "-product",
                label: x.name,
                amount: 0,
                total: 0
            }
        })
        

        let mostrar = this.state.facturas.map((x, i)=> {
            NUM_PEDIDOS++;

            TOTAL = TOTAL + x.Factura.total

            let DATE_FAC = Dayjs(x.Factura.date)

            if ((Desde === 0) & (Hasta === 0)) {
                Desde = DATE_FAC
                Hasta = DATE_FAC
            };

            if (Desde > DATE_FAC) {
                Desde = DATE_FAC
            }
            if (Hasta < DATE_FAC) {
                Hasta = DATE_FAC
            }

            x.MetodoDePago.map(y=> {
                let MET = MetodosDePago[y.method];

                MET.amount++;
                MET.pay = MET.pay + y.pay
                MET.total = MET.total + y.total
            });

            // console.group("FACTURE:", x.id)

            x.Productos.map((y, t)=> {
                let MET = PRODUCTOS[y.code];

                // console.log()
                // console.group("MET y Y - " + t)
                // console.log("",MET)
                // console.log("",y)

                // console.groupEnd()

                MET.amount = MET.amount + y.amount;
                MET.total = MET.total + y.total
            });
            // console.groupEnd()

            
            




            return {
                id: x.id,
                id_caption: (x.id+"").padStart(10, "0"),
                client_name: `(${x.Cliente.ci}) ${x.Cliente.name}`,
                date: Dayjs(x.Factura.date).format("DD/MM/YYYY hh:mm A"),
                total: `Bs. ${x.Factura.total.toFixed(2)}`,
                key: i + "-facture-index"
            }
        })

        let RESUMEN = [
            DescriptionData("Fecha del reporte", (Dayjs()).format("DD/MM/YYYY")),
            DescriptionData("Numero de pedidos", NUM_PEDIDOS),
            // DescriptionData("Desde", Desde),
            // DescriptionData("Hasta", Hasta),
            
            ...[
                ...((Desde === 0) & (Hasta === 0)?[]:[
                    DescriptionData("Desde", Desde.format("DD/MM/YYYY")),
                    DescriptionData("Hasta", Hasta.format("DD/MM/YYYY")),

                ])
            ],
            
            DescriptionData("Total en Bs", `Bs. ${TOTAL.toFixed(2)}`),
            
            
        ]
        .map((x,i)=> {

            return {
                ...x,
                key: i + "-d"
            }
        })

        return(
            <div className="container page" onKeyDown={(e) => {
                
            }}>


                <div className="top-control">
                    <form onSubmit={(e) => {
                        e.defaultPrevented();

                        
                    }}>
                        <h2 className="title-page">
                            Reportes
                        </h2>
                        <hr />

                        <select className="_input" value={this.state.filter} onChange={x=>{
                            this.setState({
                                filter: x.target.value
                            })
                        }}>
                            {
                                [
                                    "Ver todo",
                                    "Buscar por dia",
                                    "Buscar por mes",
                                    "Buscar por año",
                                    "Buscar por periodo",
                                ].map((x, i) => {


                                    return(
                                        <option value={i} key={"option-" + i}>
                                            {x}
                                        </option>
                                    )
                                })
                            }
                        </select>
                        <br />

                        {
                            [
                                [], // Ver todo
                                (   // Ver por dia
                                    <>
                                        <div className="_title">
                                            Fecha:
                                        </div>
                                        <input type="date" className="_input" id="" value={this.state.date} onChange={x=>{

                                            // console.log(x.target.value)

                                            if (x.target.value === "") {
                                                return msg.warning("No puedes vaciar este campo")
                                            }

                                            this.setState({
                                                date: x.target.value
                                            })
                                        }} />
                                    </>
                                ),
                                (   // Por mes
                                    <>
                                        <div className="_title">
                                            Mes:
                                        </div>
                                        <select value={this.state.mouth} className="_input" onChange={x=>{
                                            this.setState({
                                                mouth: parseInt(x.target.value)
                                            })
                                        }}>
                                            {
                                                [
                                                    "Enero",
                                                    "Febrero",
                                                    "Marzo",
                                                    "Abril",
                                                    "Mayo",
                                                    "Junio",
                                                    "Julio",
                                                    "Agosto",
                                                    "Septiembre",
                                                    "Octubre",
                                                    "Noviembre",
                                                    "Diciembre",
                                                ].map((x, i) => {


                                                    return(
                                                        <option value={i} key={"mouth-" + i}>
                                                            {x}
                                                        </option>
                                                    )
                                                })
                                            }
                                        </select>
                                        <div className="_title">
                                            Año:
                                        </div>
                                        <input type="number" className="_input" value={this.state.year} placeholder="Año" onChange={(x) => {
                                            
                                            if (isNaN(x.target.valueAsNumber)) {
                                                return msg.warning("Expresión no valida")
                                            }

                                            this.setState({
                                                year: clamp(x.target.valueAsNumber, 1985, 10000)
                                            })

                                        }} />
                                    
                                    </>
                                ),
                                (   // Por año
                                    <>
                                        <div className="_title">
                                            Año:
                                        </div>
                                        <input type="number" className="_input" value={this.state.year} placeholder="Año" onChange={(x) => {
                                            
                                            if (isNaN(x.target.valueAsNumber)) {
                                                return msg.warning("Expresión no valida")
                                            }

                                            this.setState({
                                                year: clamp(x.target.valueAsNumber, 1985, 10000)
                                            })

                                        }} />
                                    
                                    </>
                                ),
                                (   // Por Periodo
                                    <>
                                        <div className="_title">
                                            Fecha de inicio:
                                        </div>
                                        <input type="date" className="_input" id="" value={this.state.start} onChange={x=>{

                                            // console.log(x.target.value)

                                            if (x.target.value === "") {
                                                return msg.warning("No puedes vaciar este campo")
                                            }

                                            this.setState({
                                                start: x.target.value
                                            })
                                        }} />
                                        <div className="_title">
                                            Fecha final:
                                        </div>
                                        <input type="date" className="_input" id="" value={this.state.end} onChange={x=>{

                                            // console.log(x.target.value)

                                            if (x.target.value === "") {
                                                return msg.warning("No puedes vaciar este campo")
                                            }

                                            this.setState({
                                                end: x.target.value
                                            })
                                        }} />
                                        
                                    </>
                                )


                            ][this.state.filter]
                        }

                        <hr />

                        <input type="button" className="_submit" value="Filtrar" onClick={x=> {

                            let PROTOCOLOS = [
                                METODOS_FILTRO.ALL,// "Ver todo",
                                METODOS_FILTRO.DATE,// "Buscar por dia",
                                METODOS_FILTRO.MOUTH,// "Buscar por mes",
                                METODOS_FILTRO.YEAR,// "Buscar por año",
                                METODOS_FILTRO.PERIOD,// "Buscar por periodo",
                            ]

                            this.filtrar(PROTOCOLOS[this.state.filter])

                        }} />

                        
                    </form>
                </div>


                <div className="table-container">

                    <Table 
                    className="tab"
                    
                    dataSource={mostrar} 
                    columns={columns}

                    pagination={{

                        pageSize: 10,
                        // total: 8
                    }}

                     
                    rowClassName={(e) => {
                        return "_row-table-antd "
                        // return "_row-table-antd " + (e.key === this.state.rowIndex ?"active":"")
                    }} onRow={(e) => {
                        

                        return {
                            onClick:(row) => {
                            
                            },
                            onDoubleClick:(row) => {
                                // alert("seleccionar")

                                // if (this.props.select) {
                                //     this.select(e, true, this.props.onSelect)
                                // }

                                splash.open(
                                    <div className="container">

                                        <div className="top-control" style={{
                                            height: "max-content"
                                        }}>
                                            <input type="button" className="_submit" value="Imprimir factura" onClick={X=> {
                                                console.log(e)
                                                open("/vfp?id=" + e.id, "Imprimir", 'width=800,height=600')
                                            }}/>

                                            <hr />
                                            <br />
                                            
                                            <PREViewFactureTextPlainComponent id={e.id} />

                                        </div>
                                        <br />
                                        <br />

                                    </div>
                                )

                            }
                            
                            
                        }
                    }} ></Table>
                </div>

                <hr />

                <div className="top-control">
                    <h3 className="title-page">
                        Resumen reporte
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

                <div className="table-container">

                    <Table 
                    className="tab"
                    
                    dataSource={MetodosDePago.map((x, i)=>{

                        let METOD = METODOSDEPAGO[i]

                        return {
                            ...x,
                            pay: METOD.format.replace("{n}", x.pay.toFixed(2)),
                            total: `Bs. ${x.total.toFixed(2)}`,
                        }
                    })} 
                    columns={columnsMetodosDePago}

                    pagination={false}

                     
                    rowClassName={(e) => {
                        // return "_row-table-antd "
                        // return "_row-table-antd " + (e.key === this.state.rowIndex ?"active":"")
                    }} onRow={(e) => {
                        

                        return {
                            onClick:(row) => {
                            
                            },
                            onDoubleClick:(row) => {
                                // alert("seleccionar")

                                // if (this.props.select) {
                                //     this.select(e, true, this.props.onSelect)
                                // }

                            }
                            
                            
                        }
                    }} ></Table>
                </div>

                <hr />

                <div className="top-control">
                    <h3 className="title-page">
                        Productos vendidos
                    </h3>
                    
                    <p style={{
                        paddingLeft: "10px",
                        fontStyle: "italic",
                        color: "gray"
                    }}>
                        Nota: El precio total de los productos vendidos no incluyen IVA.
                    </p>
                    

                </div>


                <div className="table-container">

                    <Table 
                    className="tab"
                    
                    dataSource={Object.keys(PRODUCTOS).map(x=>{

                        let PRO = PRODUCTOS[x];

                        return {
                            ...PRO,

                            total: `Bs. ${(PRO.total * 1.16).toFixed(2)}`

                        }
                    })} 
                    columns={columnsProductos}

                    pagination={{
                        pageSize: 10
                    }}

                     
                    rowClassName={(e) => {
                        // return "_row-table-antd "
                        // return "_row-table-antd " + (e.key === this.state.rowIndex ?"active":"")
                    }} onRow={(e) => {
                        

                        return {
                            onClick:(row) => {
                            
                            },
                            onDoubleClick:(row) => {
                                // alert("seleccionar")

                                // if (this.props.select) {
                                //     this.select(e, true, this.props.onSelect)
                                // }

                            }
                            
                            
                        }
                    }} ></Table>
                </div>

                <div className="top-control">

                    <h2 className="title-page">
                        Gestión
                    </h2>
                    <hr />
                    <input type="button" className="_submit" value="Imprimir reporte" onClick={() => {

                        splash.open(
                            <div className="container">

                                <div className="top-control" style={{
                                    height: "max-content"
                                }}>
                                    <input type="button" className="_submit" value="Imprimir reporte" onClick={X=> {
                                        // console.log(e)
                                        let win =open("/rpp", "Imprimir", 'width=800,height=600')

                                        win.addEventListener("load", (x) => {
                                            win.window.onPass = (obj) => {
                                                // console.log("llego")

                                                obj.pass({
                                                    productos: this.state.productos,
                                                    facturas: this.state.facturas,
                                                })
                                            }
                                        })
                                    }}/>

                                    <hr />
                                    <br />
                                    
                                    <PREViewReportTextPlainComponent
                                        productos={this.state.productos}
                                        facturas={this.state.facturas}
                                    />

                                </div>
                                <br />
                                <br />

                            </div>
                        )

                    }} />

                </div>

                <br />



            </div>
        )
    }
}




export {
    ReportPage,
    PREViewReportTextPlainComponent
}