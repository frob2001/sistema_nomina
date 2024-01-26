import React, { useState, useEffect, useRef, useMemo } from 'react';
import { FilterMatchMode, FilterOperator } from 'primereact/api';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import ExcelJS from 'exceljs';
import saveAs from 'file-saver';
import { Tooltip } from 'primereact/tooltip';
import { OverlayPanel } from 'primereact/overlaypanel';
import { Checkbox } from 'primereact/checkbox';
import pdfHeaderHorizontal from '../../../assets/CorralBannerHorizontal.png';

//Servicios
import useSWR from 'swr';
const apiEndpoint = import.meta.env.VITE_MAIN_ENDPOINT;
const API_BASE_URL = `${apiEndpoint}/Infracciones/Buscar`;
// Auth
import { useMsal } from '@azure/msal-react';

function InfraccionesTable(props) {

    // --------------- Búsqueda por filtros -------------------------------------------------------
    // Auth
    const { instance, accounts } = useMsal();
    const getAccessToken = async () => {
        try {
            const accessTokenRequest = {
                scopes: ["api://corralrosales.com/kattion/tasks.write", "api://corralrosales.com/kattion/tasks.read"], // Para leer y escribir tareas
                account: accounts[0],
            };
            const response = await instance.acquireTokenSilent(accessTokenRequest);
            return response.accessToken;
        } catch (e) {
            // Handle token acquisition errors
            console.error(e);
            return null;
        }
    };
    const fetcher = async (url) => {
        const accessToken = await getAccessToken();
        const res = await fetch(url, {
            headers: {
                Authorization: `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            }
        });

        if (!res.ok) {
            if (res.status === 404) {
                throw new Error("Recurso no encontrado");
            }
            throw new Error("Hubo un problema con el servidor, intenta de nuevo");
        }

        return res.json();
    };
    const searchURL = `${API_BASE_URL}${props.url}`;

    const { data: infracciones, error, isValidating, isLoading, mutate: refresh } = useSWR(searchURL, fetcher, {
        errorRetryInterval: 10000,
    });

    const infraccionesNew = useMemo(() => {
        if (infracciones) {
            return infracciones.map(infraccion => ({
                ...infraccion,
                ultimoEstado: infraccion.estados && infraccion.estados.length > 0 ? infraccion.estados[infraccion.estados.length - 1] : null,
            }));
        }
        return [];
    }, [infracciones]);

    // --------------- Setup (Servicios, Contextos, Referencias) -----------------------------------

    const toast = useRef(null);

    // --------------- Estados ---------------------------------------------------------------------

    const [filters, setFilters] = useState(null);
    const [globalFilterValue, setGlobalFilterValue] = useState('');
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [selectedObject, setSelectedObject] = useState(null);

    // --------------- Funciones necesarias para persistencia ----------------------------------------

    useEffect(() => {
        const savedState = sessionStorage.getItem('infracciones-table-state'); // EDITABLE

        if (savedState) {
            const parsedState = JSON.parse(savedState);
            if (parsedState.filters) {
                setFilters(parsedState.filters);
                if (parsedState.filters.global && parsedState.filters.global.value) {
                    setGlobalFilterValue(parsedState.filters.global.value);
                }
            }
        } else {
            initFilters();
        }
    }, []); // useEffect hook for initializing filters

    // --------------- Funciones especificas del componente ------------------------------------------

    useEffect(() => {
        refreshData();
    }, [props.refreshTrigger]); //Refresca la tabla cuando se elimine o edite un registro

    useEffect(() => {
        if (error) {
            toast.current.show({
                severity: 'info',
                summary: 'Aviso',
                detail: 'Hubo un problema con el servidor, intenta más tarde',
                life: 3000,
            });
        }
    }, [error]); // Genera el toast con el error: GENERAL
    const refreshData = () => {
        setIsRefreshing(true);
        refresh();
    }; // Refresca los datos: GENERAL
    useEffect(() => {
        if (isRefreshing) {
            setIsRefreshing(false);
        }
    }, [isValidating]); // Cambia el estado de refreshing: GENERAL
    const clearFilter = () => {
        initFilters();
    }; // Función para limpiar todos los filtros: GENERAL
    const onGlobalFilterChange = (e) => {
        const value = e.target.value;
        let _filters = { ...filters };

        _filters['global'].value = value;

        setFilters(_filters);
        setGlobalFilterValue(value);
    }; // Función para el filtro global: GENERAL
    const initFilters = () => {
        setFilters({
            infraccionId: { value: null, matchMode: FilterMatchMode.CONTAINS },
            tipoInfraccion: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }] },
            oficinaTramitante: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }] },
            abogado: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }] },
            marca: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }] },
            referenciaInterna: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }] },
            infractor: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }] },
            claseMarca: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }] },
            claseInfractor: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }] },
            paisMarca: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }] },
            paisInfractor: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }] },
            autoridad: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }] },
            numeroProceso: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }] },
            numeroProcesoJudicial: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }] },
            codigoDai: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }] },
            fechaRegistro: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }] },
        }); // EDITABLE
        setGlobalFilterValue('');
    }; // Función para restaurar e inicializar los filtros: ESPECIFICO

    const flattenData = (data) => {
        return data.map(infraccion => {
            // Flatten 'referencias'
            let referenciasFormatted = infraccion.referencias?.map(ref => `Tipo: ${ref.tipoReferencia} - Referencia: ${ref.referencia}`).join("; ");

            // Flatten 'estados'
            let estadosFormatted = infraccion.estados?.map(est => `${est.codigo} - ${est.descripcionEspanol} / ${est.descripcionIngles}`).join("; ");

            return {
                ...infraccion,
                referenciasFormatted, // Add flattened 'referencias'
                estadosFormatted // Add flattened 'estados'
            };
        });
    };

    const formatDateField = (value) => {
        if (typeof value === 'string' && value.match(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/)) {
            return value.split('T')[0];
        }
        return value;
    };
    const [pdfLoading, setPdfLoading] = useState(false);
    const [excelLoading, setExcelLoading] = useState(false);

    const exportPdf = () => {
        setPdfLoading(true);
        const flattenedData = flattenData(infraccionesNew);
        import('jspdf').then((jsPDF) => {
            import('jspdf-autotable').then(() => {

                // Lógica para agrupar datos por cliente:

                // Reestructuración de los datos
                const groupedData = {}; // Objeto para agrupar los datos por cliente
                flattenedData.forEach(obj => {
                    if (!groupedData[obj.cliente]) {
                        groupedData[obj.cliente] = [];
                    }
                    groupedData[obj.cliente].push(obj);
                });

                const dataForPdf = [];
                Object.keys(groupedData).forEach(cliente => {
                    // Agregar un objeto especial para el encabezado de grupo
                    dataForPdf.push({ isGroupHeader: true, cliente: cliente });
                    // Agregar las marcas de ese cliente
                    dataForPdf.push(...groupedData[cliente]);
                });

                const margin = 20; // Uniform margin for all elements

                const userData = sessionStorage.getItem('userData');
                let nombreUsuario;

                if (userData) {
                    const parsedData = JSON.parse(userData);
                    nombreUsuario = `${parsedData.nombre} ${parsedData.apellido}`;
                } else {
                    nombreUsuario = '';
                }

                const doc = new jsPDF.default('l', 'pt', 'a4');

                // Choose header image based on orientation
                const headerImg = pdfHeaderHorizontal;

                // Set the date format for the footer
                const currentDate = new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' });

                // Add a front page
                doc.addImage(headerImg, 'PNG', 0, 0, doc.internal.pageSize.width, 120); // Adjust dimensions as needed

                // Title settings
                doc.setFont('Helvetica', 'bold');
                doc.setFontSize(16);
                doc.setTextColor(0, 0, 0);
                doc.text('Listado de Infracciones', margin, 160, { align: 'left' }); // Left aligned

                // Subtitle settings
                doc.setFont('Helvetica', 'normal');
                doc.setFontSize(10);
                doc.text(`Reporte generado desde Kattion por ${nombreUsuario}`, margin, 180, { align: 'left' }); // Left aligned, smaller font

                // Function to add footer on each page
                const addFooter = (pageNumber) => {
                    doc.setFont('Helvetica', 'normal');
                    doc.setFontSize(10);
                    doc.setTextColor(120, 120, 120);
                    doc.text(`${currentDate}`, margin, doc.internal.pageSize.height - 30, { align: 'left' });
                };

                // Add footer to the first page
                addFooter(1);

                const selectedHeaders = [];
                const selectedDataKeys = [];

                selectedColumns.forEach(col => {
                    if (col.nombrevar === 'referenciaInterna') {
                        selectedHeaders.push(col.header); // Add the original header
                        selectedDataKeys.push('referenciaInterna'); // Add the original data key
                        selectedHeaders.push('Referencias'); // Add the new header
                        selectedDataKeys.push('referenciasFormatted'); // Add the new data key
                    } else if (col.nombrevar === 'primerSolicitante') {
                        selectedHeaders.push(col.header);
                        selectedDataKeys.push('solicitantesNames');
                    } else if (col.nombrevar === 'ultimoEstado') {
                        selectedHeaders.push(col.header);
                        selectedDataKeys.push('estadosFormatted');
                    } else if (col.nombrevar === 'primerFabricante') {
                        selectedHeaders.push(col.header);
                        selectedDataKeys.push('fabricantesFormatted');
                    } else {
                        selectedHeaders.push(col.header);
                        selectedDataKeys.push(col.nombrevar);
                    }
                });

                if (selectedHeaders.length > 10) {
                    toast.current.show({
                        severity: 'warn',
                        summary: 'Demasiadas columnas',
                        detail: `El reporte no puede presentar la cantidad de columnas seleccionadas: ${selectedHeaders.length}, (máx. 10)`,
                        life: 3000
                    });
                    setPdfLoading(false);
                    return; // Stop the execution of the function
                }

                doc.autoTable({
                    head: [selectedHeaders],
                    body: dataForPdf.map(row => {
                        if (row.isGroupHeader) {
                            return [{ content: row.cliente, colSpan: selectedDataKeys.length, styles: { fillColor: [21, 151, 156], textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 6, cellPadding: { top: 5, right: 4, bottom: 5, left: 4 } } }];
                        } else {
                            return selectedDataKeys.map(key => formatDateField(row[key]));
                        }
                    }),
                    styles: { overflow: 'linebreak', cellWidth: 'auto', cellPadding: { top: 1, right: 4, bottom: 1, left: 4 }, fontSize: 6 },
                    headStyles: { fillColor: [28, 201, 207], textColor: [255, 255, 255], valign: 'middle', cellPadding: { top: 5, right: 4, bottom: 5, left: 4 } },
                    theme: 'striped',
                    columnStyles: { text: { cellWidth: 'auto' } },
                    margin: { left: margin, right: margin },
                    startY: 210,
                    didDrawPage: function (data) {
                        addFooter(data.pageNumber);
                    }
                });

                // Replace the {totalPages} placeholder with actual total pages
                const totalPages = doc.internal.getNumberOfPages();
                for (let i = 1; i <= totalPages; i++) {
                    doc.setPage(i);
                    doc.text(`pág. ${i} / ${totalPages}`, doc.internal.pageSize.width - margin, doc.internal.pageSize.height - 30, { align: 'right' }, 'replace');
                }

                doc.save('Infracciones.pdf'); // EDITABLE
                setPdfLoading(false);
            });
        }).catch((error) => {
            toast.current.show({
                severity: 'error',
                summary: 'Error',
                detail: `Hubo un error al intentar generar el PDF`,
                life: 3000
            });
            setPdfLoading(false); // Reset loading state to false on error
        });
    }; // Función para exportar a PDF: ESPECIFICO
    const exportExcel = () => {
        setExcelLoading(true);
        const flattenedData = flattenData(infraccionesNew);
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Infracciones'); // EDITABLE

        const selectedHeaders = [];
        const selectedDataKeys = [];

        selectedColumns.forEach(col => {
            if (col.nombrevar === 'referenciaInterna') {
                selectedHeaders.push(col.header); // Add the original header
                selectedDataKeys.push('referenciaInterna'); // Add the original data key
                selectedHeaders.push('Referencias'); // Add the new header
                selectedDataKeys.push('referenciasFormatted'); // Add the new data key
            } else if (col.nombrevar === 'primerSolicitante') {
                selectedHeaders.push(col.header);
                selectedDataKeys.push('solicitantesNames');
            } else if (col.nombrevar === 'ultimoEstado') {
                selectedHeaders.push(col.header);
                selectedDataKeys.push('estadosFormatted');
            } else if (col.nombrevar === 'primerFabricante') {
                selectedHeaders.push(col.header);
                selectedDataKeys.push('fabricantesFormatted');
            } else {
                selectedHeaders.push(col.header);
                selectedDataKeys.push(col.nombrevar);
            }
        });

        worksheet.addRow(selectedHeaders);

        flattenedData.forEach(row => {
            const rowData = selectedDataKeys.map(key => row[key]);
            worksheet.addRow(rowData);
        });

        workbook.xlsx.writeBuffer().then((buffer) => {
            saveAsExcelFile(buffer, 'Infracciones'); // EDITABLE
            setExcelLoading(false); // Reset loading state to false after saving
        }).catch((error) => {
            toast.current.show({
                severity: 'error',
                summary: 'Error',
                detail: `Hubo un error al intentar generar el Excel`,
                life: 3000
            });
            setExcelLoading(false); // Reset loading state to false on error
        });
    }; // Función para exportar a Excel: ESPECIFICO


    const saveAsExcelFile = (buffer, fileName) => {
        let EXCEL_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
        let EXCEL_EXTENSION = '.xlsx';
        const data = new Blob([buffer], {
            type: EXCEL_TYPE
        });

        const currentDate = new Date();
        const formattedDate = currentDate.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
        saveAs(data, fileName + ' - ' + formattedDate + EXCEL_EXTENSION);
    }; // Función para guardar el Excel: GENERAL
    const renderHeader = () => {
        return (
            <div className="flex justify-content-between">
                <div className="table-utility">
                    <span className="search-input-container">
                        <i className="pi pi-search search-input-icon" style={{ fontSize: '0.8rem', margin: '0' }}></i>
                        <InputText className="search-input" value={globalFilterValue} onChange={onGlobalFilterChange} placeholder="Buscar" />
                    </span>
                    <Button className="rounded-icon-btn" onClick={refreshData}>
                        <i className="pi pi-refresh" style={{ fontSize: '0.8rem', margin: '0' }}></i>
                    </Button>
                    <Button onClick={clearFilter} className="rounded-icon-btn" type="button" rounded>
                        <i className="pi pi-filter-slash" style={{ fontSize: '0.8rem', margin: '0' }}></i>
                    </Button>
                    <Button onClick={(e) => op.current.toggle(e)} className="rounded-icon-btn" type="button" rounded>
                        <i className="pi pi-list" style={{ fontSize: '0.8rem', margin: '0' }}></i>
                    </Button>
                </div>
                <div className="table-utility">
                    <span style={{ alignSelf: 'center', fontWeight: '400' }}><strong>Registros:</strong> {infraccionesNew ? infraccionesNew.length : '0'}</span>
                    <Button onClick={exportExcel} id="dwn-excel" className="rounded-icon-btn" type="button" rounded data-pr-tooltip="XLS">
                        {excelLoading &&
                            <div className="spinner-container">
                                <div className="small-spinner" />
                            </div>
                        }
                        <i className="pi pi-file-excel" style={{ fontSize: '0.8rem', margin: '0' }}></i>
                    </Button>
                    <Button onClick={exportPdf} id="dwn-pdf" className="rounded-icon-btn" type="button" rounded data-pr-tooltip="PDF">
                        {pdfLoading &&
                            <div className="spinner-container">
                                <div className="small-spinner" />
                            </div>
                        }
                        <i className="pi pi-file-pdf" style={{ fontSize: '0.8rem', margin: '0' }}></i>
                    </Button>
                </div>
            </div>
        );
    }; // Contiene el header de la tabla: GENERAL
    const filterClearTemplate = (options) => {
        return <Button id="cancel" className="rounded-icon-btn" type="button" onClick={options.filterClearCallback}>
            <i className="pi pi-times" style={{ fontSize: '0.8rem', margin: '0' }}></i>
        </Button>;
    }; // Formato del botón para cancelar filtros: GENERAL
    const filterApplyTemplate = (options) => {
        return <Button className="rounded-icon-btn" type="button" onClick={options.filterApplyCallback}>
            <i className="pi pi-check" style={{ fontSize: '0.8rem', margin: '0' }}></i>
        </Button>;
    }; // Formato del botón para confirmar filtros: GENERAL
    const header = renderHeader(); // Renderizar el header: GENERAL
    const columnsData = [
        {
            nombrevar: "infraccionId",
            header: "Código",
            filterPlaceholder: "Buscar por código",
        },
        {
            nombrevar: "caso",
            header: "Caso",
            filterPlaceholder: "Buscar por caso",
        },
        {
            nombrevar: "referenciaInterna",
            header: "Referencias",
            filterPlaceholder: "Buscar por referencia interna",
        },
        {
            nombrevar: "oficinaTramitante",
            header: "Oficina tramitante",
            filterPlaceholder: "Buscar por oficina tramitante",
        },
        {
            nombrevar: "abogado",
            header: "Responsable",
            filterPlaceholder: "Buscar por responsable",
        },
        {
            nombrevar: "ultimoEstado",
            header: "Estados",
            filterPlaceholder: "Buscar por estado",
        },
        {
            nombrevar: "tipoInfraccion",
            header: "Tipo",
            filterPlaceholder: "Buscar por tipo de infracción",
        },
        {
            nombrevar: "autoridad",
            header: "Autoridad",
            filterPlaceholder: "Buscar por autoridad",
        },
        {
            nombrevar: "marca",
            header: "Marca",
            filterPlaceholder: "Buscar por marca",
        },
        {
            nombrevar: "claseMarca",
            header: "Clase de marca",
            filterPlaceholder: "Buscar por clase de marca",
        },
        {
            nombrevar: "paisMarca",
            header: "País de marca",
            filterPlaceholder: "Buscar por país de marca",
        },
        {
            nombrevar: "infractor",
            header: "Infractor",
            filterPlaceholder: "Buscar por infractores",
        },
        {
            nombrevar: "claseInfractor",
            header: "Clase de Infractor",
            filterPlaceholder: "Buscar por clase de infractor",
        },
        {
            nombrevar: "paisInfractor",
            header: "País de infractor",
            filterPlaceholder: "Buscar por país de infractor",
        },
        {
            nombrevar: "numeroProceso",
            header: "Número de proceso",
            filterPlaceholder: "Buscar por número de proceso",
        },
        {
            nombrevar: "numeroProcesoJudicial",
            header: "Número de proceso judicial",
            filterPlaceholder: "Buscar por número de proceso judicial",
        },
        {
            nombrevar: "codigoDai",
            header: "DAI",
            filterPlaceholder: "Buscar por DAI",
        },
        {
            nombrevar: "fechaRegistro",
            header: "Fecha de registro",
            filterPlaceholder: "Buscar por fecha registro",
        }

    ]; // Contiene los parámetros para crear columnas: ESPECIFICO
    const onRowSelect = (event) => {
        props.onSelect(event.data.infraccionId); // EDITABLE
    }; // maneja la selección de la fila: ESPECIFICO

    // --------------------- Body Templates -------------------

    const cellWithTooltip = (rowData, field) => {
        return (
            <span className="cell-tooltip" data-pr-tooltip={rowData[field]}>
                {rowData[field]}
            </span>
        );
    };

    const datesBodyTemplate = (rowData, field) => {
        // Extract the date part from the ISO string
        const formattedDate = rowData && rowData[field] ? rowData[field].slice(0, 10) : '';
        return (
            <span className="cell-tooltip" data-pr-tooltip={formattedDate}>
                {formattedDate}
            </span>
        );
    };


    const headerTemplate = (data) => {
        return (
            <span><strong>Cliente - </strong>{data?.cliente}</span>
        );
    };

    // --------------------- Fin de Body Templates -------------------
    // --------------------- Overlay setup -------------------

    // Referencias y estados para los overlays
    const [selectedColumns, setSelectedColumns] = useState([
        {
            nombrevar: "infraccionId",
            header: "Código",
            filterPlaceholder: "Buscar por código",
        },
        {
            nombrevar: "caso",
            header: "Caso",
            filterPlaceholder: "Buscar por caso",
        },
        {
            nombrevar: "referenciaInterna",
            header: "Referencias",
            filterPlaceholder: "Buscar por referencia interna",
        },
        {
            nombrevar: "ultimoEstado",
            header: "Estados",
            filterPlaceholder: "Buscar por estado",
        },
        {
            nombrevar: "tipoInfraccion",
            header: "Tipo",
            filterPlaceholder: "Buscar por tipo de infracción",
        },
        {
            nombrevar: "marca",
            header: "Marca",
            filterPlaceholder: "Buscar por marca",
        },
        {
            nombrevar: "infractor",
            header: "Infractor",
            filterPlaceholder: "Buscar por infractores",
        },
        {
            nombrevar: "numeroProceso",
            header: "Número de proceso",
            filterPlaceholder: "Buscar por número de proceso",
        },
        {
            nombrevar: "numeroProcesoJudicial",
            header: "Número de proceso judicial",
            filterPlaceholder: "Buscar por número de proceso judicial",
        },
        {
            nombrevar: "codigoDai",
            header: "DAI",
            filterPlaceholder: "Buscar por DAI",
        }]); // Columnas seleccionadas (Se puede predeterminar como comienza)
    const [currentReferencias, setCurrentReferencias] = useState([]); // Referencias a mostrar en el overlay
    const [currentEstados, setCurrentEstados] = useState([]); // Estados a mostrar en el overlay

    const op = useRef(null); // Overlay para selección de columnas de la tabla
    const opReferencias = useRef(null); // Overlay para referencias
    const opEstados = useRef(null); // Overlay para estados
    const selectedColumnsRef = useRef(selectedColumns); // Referencia para trackear el estado de selectedColumns 

    useEffect(() => {
        selectedColumnsRef.current = selectedColumns;
    }, [selectedColumns]); // Actualiza el tracker para que siempre sepa cuales columnas se seleccionaron
    useEffect(() => {
        const storedData = localStorage.getItem('infracciones-table-columns');
        if (storedData) {
            setSelectedColumns(JSON.parse(storedData));
        }
        return () => {
            localStorage.setItem('infracciones-table-columns', JSON.stringify(selectedColumnsRef.current));
        };
    }, []); // Guarda la selección de columnas en localStorage

    // Body templates para mostrar los overlay panels on hover
    const referenciasBodyTemplate = (rowData) => {
        return (
            <div
                onMouseEnter={(e) => {
                    setCurrentReferencias(rowData.referencias);
                    opReferencias.current.toggle(e);
                }}
                onMouseLeave={() => opReferencias.current.hide()}
            >
                {rowData.referenciaInterna}
            </div>
        );
    };

    const estadoBodyTemplate = (rowData) => {
        return (
            <span
                onMouseEnter={(e) => {
                    setCurrentEstados(rowData.estados);
                    opEstados.current.toggle(e);
                }}
                onMouseLeave={() => opEstados.current.hide()}
                style={{ color: rowData?.ultimoEstado?.color }}>

                <strong>{rowData?.ultimoEstado?.codigo}</strong> {rowData?.ultimoEstado && '-'} {rowData?.ultimoEstado?.descripcionEspanol} {rowData?.ultimoEstado && '/'} {rowData?.ultimoEstado?.descripcionIngles}
            </span>
        );
    };

    const miniEstadoBodyTemplate = (rowData) => {
        return (
            <span style={{ color: rowData?.color }}>
                <strong>{rowData?.codigo}</strong> - {rowData?.descripcionEspanol} / {rowData?.descripcionIngles}
            </span>
        );
    };

    // Función para manejar la selección de columnas con los checkboxes
    const handleCheckboxChange = (column) => {
        if (selectedColumns.some(col => col.nombrevar === column.nombrevar)) {
            setSelectedColumns(selectedColumns.filter(col => col.nombrevar !== column.nombrevar));
        } else {
            setSelectedColumns([...selectedColumns, column]);
        }
    };

    /* ----------------------- Fin Overlay setup ------------------------------------------------*/

    return (
        <div className="tabla">
            <Tooltip position={"top"} showDelay={1800} target=".cell-tooltip" style={{ maxWidth: '300px' }} />
            <Toast ref={toast} />
            {(isLoading || (isRefreshing && isValidating)) &&
                <div className="spinner-container">
                    <div className="spinner" />
                </div>
            }
            {error &&
                <div className="stale-data-msg">
                    <i className="pi pi-exclamation-circle" style={{ fontSize: '0.8rem', margin: '0', color: 'white' }}></i>
                    <span><strong>Los datos pueden estar desactualizados</strong> | intenta recargar la tabla</span>
                </div>}
            <DataTable
                reorderableColumns
                value={infraccionesNew} // EDITABLE
                rowGroupMode="subheader"
                rowGroupHeaderTemplate={headerTemplate}
                groupRowsBy="cliente" // EDITABLE
                sortMode="single"
                sortField="cliente"
                resizableColumns
                removableSort
                paginator
                scrollable
                scrollHeight={error ? '60vh' : '63vh'}
                showGridlines
                rows={25}
                rowsPerPageOptions={[5, 10, 25, 50]} // EDITABLE
                size="small"
                dataKey="infraccionId" // EDITABLE
                filters={filters}
                globalFilterFields={['infraccionId', 'tipoInfraccion', 'oficinaTramitante', 'abogado', 'marca', 'cliente', 'referenciaInterna', 'infractor', 'claseMarca', 'claseInfractor', 'paisMarca', 'paisInfractor', 'autoridad', 'numeroProceso', 'numeroProcesoJudicial', 'codigoDai', 'fechaRegistro', 'caso']} // EDITABLE
                header={header}
                emptyMessage="No se encontraron infracciones" // EDITABLE
                selectionMode="single"
                selection={selectedObject}
                onSelectionChange={(e) => setSelectedObject(e.value)}
                onRowSelect={onRowSelect}
                metaKeySelection={false}
                stateStorage="session" 
                stateKey="infracciones-table-state" // EDITABLE
            >
                {selectedColumns.map((column, index) => {
                    let bodyTemplate;
                    let isFilterable = true;

                    // Determine the body template based on the nombrevar
                    switch (column.nombrevar) {
                        case 'ultimoEstado':
                            bodyTemplate = (rowData) => estadoBodyTemplate(rowData);
                            isFilterable = false;
                            break;
                        case 'fechaRegistro':
                            bodyTemplate = (rowData) => datesBodyTemplate(rowData, column.nombrevar);
                            break;
                        case 'referenciaInterna':
                            bodyTemplate = (rowData) => referenciasBodyTemplate(rowData);
                            break;
                        default:
                            bodyTemplate = (rowData) => cellWithTooltip(rowData, column.nombrevar);
                            break;
                    }

                    return (
                        <Column
                            key={index}
                            field={column.nombrevar}
                            header={column.header}
                            body={bodyTemplate}
                            /*sortable*/
                            filter={isFilterable}
                            filterField={column.nombrevar}
                            filterPlaceholder={column.filterPlaceholder}
                            filterClear={filterClearTemplate}
                            filterApply={filterApplyTemplate}
                            style={{ minWidth: '120px' }}
                        />
                    );
                })}
            </DataTable>
            <OverlayPanel ref={op}>
                {columnsData.map((column, index) => (
                    <div key={index} className="p-field-checkbox">
                        <Checkbox
                            inputId={`cb${index}`}
                            name={column.header}
                            value={column}
                            onChange={() => handleCheckboxChange(column)}
                            checked={selectedColumns.some((item) => item.header === column.header)}
                        />
                        <label htmlFor={`cb${index}`}>{column.header}</label>
                    </div>
                ))}
            </OverlayPanel>
            <OverlayPanel ref={opReferencias}>
                <DataTable id="miniTable" value={currentReferencias} selectionMode="single" rows={10}>
                    <Column field="tipoReferencia" header="Tipo de Referencia" style={{ minWidth: '12rem' }} />
                    <Column field="referencia" header="Referencia" style={{ minWidth: '12rem' }} />
                </DataTable>
            </OverlayPanel>
            <OverlayPanel ref={opEstados}>
                <DataTable id="miniTable" value={currentEstados} selectionMode="single" rows={10}>
                    <Column body={(rowData) => miniEstadoBodyTemplate(rowData)} header="Estados" style={{ minWidth: '12rem' }} />
                </DataTable>
            </OverlayPanel>
        </div>
    );
}

export default InfraccionesTable;