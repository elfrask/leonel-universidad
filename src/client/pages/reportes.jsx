import { Component, createRef } from "react";
import { Table, Descriptions } from "antd";
import { go, msg, np_validar, range, reqDB, splash } from "../base";
import Dayjs from "dayjs";
import { clamp } from "lodash";

const columns = [
    { title: 'ID Factura', dataIndex: 'id_caption', key: 'id_caption' },
    { title: 'Cliente', dataIndex: 'client_name', key: 'client_name' },
    { title: 'Fecha de creación', dataIndex: 'date', key: 'date' },
    { title: 'Total', dataIndex: 'total', key: 'total' },
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

    filtrar(METODO) {
        msg.MessageApi.loading({
            content: "Cargando...",
            key: 9231,
            duration: 1000
        })
        reqDB.send("/api/get_all_facture", {
            filter: METODO,

            date: this.state.date,

            mouth: this.state.mouth,
            year: this.state.year,

            start: this.state.start,
            end: this.state.end,

            simple: true

        }).then(x=>{
            // console.log(x)
            msg.MessageApi.destroy(9231)

            this.setState({
                facturas: x.data
            })

        }).catch(x=>{
            // console.log(x)

            msg.MessageApi.destroy(9231)

        })
    }


    render() {

        
        // console.log(this.state.facturas)

        let mostrar = this.state.facturas.map(x=> {

            return {
                id: x.id,
                id_caption: (x.id+"").padStart(10, "0"),
                client_name: `(${x.Cliente.ci}) ${x.Cliente.name}`,
                date: Dayjs(x.Factura.date).format("DD/MM/YYYY hh:mm A"),
                total: `Bs. ${x.Factura.total.toFixed(2)}`
            }
        })

        let RESUMEN = [
            DescriptionData("Fecha del reporte", (Dayjs()).format("DD/MM/YYYY")),
            
            
        ]
        .map((x,i)=> {

            return {
                ...x,
                key: i
            }
        })

        return(
            <div className="container" onKeyDown={(e) => {
                
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
                        <input type="button" className="_submit" value="Imprimir reporte" />

                        
                    </form>
                </div>

                <div className="table-container">

                    <Table 
                    className="tab"
                    
                    dataSource={mostrar} 
                    columns={columns}

                    pagination={{

                        pageSize: 8,
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

                                splash.open(<ProductsPage select onSelect={(data) => {

                                    splash.close();
        
                                    this.setState({
                                        productId: data.id,
                                        product_name: data.name,
                                        product_data: data
                                    })
                                }} />)

                            }
                            
                            
                        }
                    }} ></Table>
                </div>

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

                <br />



            </div>
        )
    }
}




export {
    ReportPage
}