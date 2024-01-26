import React, { useState, useEffect, useRef, useMemo } from 'react';
import { FilterMatchMode, FilterOperator } from 'primereact/api';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { Tooltip } from 'primereact/tooltip';
import ExcelJS from 'exceljs';
import saveAs from 'file-saver';
import pdfHeaderHorizontal from '../../../assets/CorralBannerHorizontal.png';

//Servicios
import useSWR from 'swr';
const apiEndpoint = import.meta.env.VITE_MAIN_ENDPOINT;
const API_BASE_URL = `${apiEndpoint}/Propietarios/Buscar`;
// Auth
import { useMsal } from '@azure/msal-react';

function PropietariosTable(props) {

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

    const { data: propietariosPre, error, isValidating, isLoading, mutate: refresh } = useSWR(searchURL, fetcher, {
        errorRetryInterval: 10000,
    });

    const propietarios = useMemo(() => {
        if (propietariosPre) {
            return propietariosPre.map(propietario => ({
                ...propietario,
                paisNombre: propietario.pais?.nombre
            }));
        }
    }, [propietariosPre]); // Añade el nombre del país como propiedad para que funcione bien con la datatable

    // --------------- Setup (Servicios, Contextos, Referencias) -----------------------------------

    const toast = useRef(null);

    // --------------- Estados ---------------------------------------------------------------------

    const [filters, setFilters] = useState(null);
    const [globalFilterValue, setGlobalFilterValue] = useState('');
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [selectedObject, setSelectedObject] = useState(null);

    // --------------- Funciones necesarias para persistencia ----------------------------------------

    useEffect(() => {
        const savedState = sessionStorage.getItem('propietarios-table-state'); // EDITABLE

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
            global: { value: null, matchMode: FilterMatchMode.CONTAINS },
            propietarioId: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }] },
            nombre: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }] },
            paisNombre: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }] },
            numeroPoder: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }] }
        }); // EDITABLE
        setGlobalFilterValue('');
    }; // Función para restaurar e inicializar los filtros: ESPECIFICO
    const cols = [
        { header: 'Código del Propietario', dataKey: 'propietarioId' },
        { header: 'Nombre', dataKey: 'nombre' },
        { header: 'País', dataKey: 'paisNombre' },
        { header: 'Número de poder', dataKey: 'numeroPoder' },
        { header: 'Fecha de poder', dataKey: 'fechaPoder' },
        { header: 'Origen', dataKey: 'origen' },
    ]; // Columnas que se expotarán en el PDF: ESPECIFICO
    const formatDateField = (value) => {
        if (typeof value === 'string' && value.match(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/)) {
            return value.split('T')[0]; // Return only the date part
        }
        return value; // Return the original value if it's not a date
    };
    const [pdfLoading, setPdfLoading] = useState(false);
    const [excelLoading, setExcelLoading] = useState(false);
    const exportPdf = () => {
        setPdfLoading(true);
        import('jspdf').then((jsPDF) => {
            import('jspdf-autotable').then(() => {
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
                doc.text('Listado de Propietarios', margin, 160, { align: 'left' }); // Left aligned

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

                doc.autoTable({
                    head: [cols.map((column) => column.header)],
                    body: propietarios.map((row) => cols.map((column) => formatDateField(row[column.dataKey]))), // EDITABLE
                    styles: { overflow: 'linebreak', cellWidth: 'auto', cellPadding: { top: 1, right: 4, bottom: 1, left: 4 }, fontSize: 8 },
                    headStyles: { fillColor: [28, 201, 207], textColor: [255, 255, 255], valign: 'middle' },
                    theme: 'striped',
                    columnStyles: { text: { cellWidth: 'auto' } },
                    margin: { left: margin, right: margin },
                    startY: 210, // Start drawing the table below the header
                    didDrawPage: function (data) {
                        // Add footer on each new page
                        addFooter(data.pageNumber);
                    }
                });

                // Replace the {totalPages} placeholder with actual total pages
                const totalPages = doc.internal.getNumberOfPages();
                for (let i = 1; i <= totalPages; i++) {
                    doc.setPage(i);
                    doc.text(`pág. ${i} / ${totalPages}`, doc.internal.pageSize.width - margin, doc.internal.pageSize.height - 30, { align: 'right' }, 'replace');
                }

                doc.save('Propietarios.pdf'); // EDITABLE
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
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Propietarios'); // EDITABLE

        const headerRow = [];
        cols.forEach((col) => {
            headerRow.push(col.header);
        });
        worksheet.addRow(headerRow);

        propietarios.forEach((propietario) => { // EDITABLE
            worksheet.addRow([ 
                propietario.propietarioId,
                propietario.nombre,
                propietario.paisNombre,
                propietario.numeroPoder,
                propietario.fechaPoder,
                propietario.origen
            ]);
        }); // EDITABLE

        workbook.xlsx.writeBuffer().then((buffer) => {
            saveAsExcelFile(buffer, 'Propietarios'); // EDITABLE
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
                    
                </div>
                <div className="table-utility">
                    <span style={{ alignSelf: 'center', fontWeight: '400' }}><strong>Registros:</strong> {propietarios ? propietarios.length : '0'}</span>
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
            nombrevar: "propietarioId",
            header: "Código",
            filterPlaceholder: "Buscar por código",
        },
        {
            nombrevar: "nombre",
            header: "Nombre",
            filterPlaceholder: "Buscar por nombre",
        },
        {
            nombrevar: "paisNombre",
            header: "País",
            filterPlaceholder: "Buscar por país",
        },
        {
            nombrevar: "numeroPoder",
            header: "Poder",
            filterPlaceholder: "Buscar por número de poder",
        }
    ]; // Contiene los parámetros para crear columnas: ESPECIFICO
    const onRowSelect = (event) => {
        props.onSelect(event.data.propietarioId); // EDITABLE
    }; // maneja la selección de la fila: ESPECIFICO

    return (
        <div className="tabla">
            <Tooltip target=".export-buttons>button" position="bottom" />
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
                value={propietarios} // EDITABLE
                resizableColumns
                removableSort
                paginator
                scrollable
                scrollHeight={error ? '60vh' : '63vh'}
                showGridlines
                rows={25}
                rowsPerPageOptions={[5, 10, 25, 50]} // EDITABLE
                size="small"
                dataKey="propietarioId" // EDITABLE
                filters={filters}
                globalFilterFields={['propietarioId', 'nombre', 'paisNombre', 'numeroPoder']} // EDITABLE
                header={header}
                emptyMessage="No se encontraron propietarios" // EDITABLE
                selectionMode="single"
                selection={selectedObject}
                onSelectionChange={(e) => setSelectedObject(e.value)}
                onRowSelect={onRowSelect}
                metaKeySelection={false}
                stateStorage="session" 
                stateKey="propietarios-table-state" // EDITABLE
            >
                {columnsData.map((column, index) => (
                    <Column
                        key={index}
                        field={column.nombrevar}
                        header={column.header}
                        sortable
                        filter
                        filterField={column.nombrevar}
                        filterPlaceholder={column.filterPlaceholder}
                        filterClear={filterClearTemplate}
                        filterApply={filterApplyTemplate}
                        style={{ minWidth: '10px', maxWidth: '200px' }}
                    />
                ))}
            </DataTable>
        </div>
    );
}

export default PropietariosTable;