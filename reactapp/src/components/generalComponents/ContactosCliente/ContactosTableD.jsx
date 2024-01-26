import React, { useState, useEffect, useRef, useMemo } from 'react';
import { FilterMatchMode, FilterOperator } from 'primereact/api';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import ExcelJS from 'exceljs';
import saveAs from 'file-saver';
import pdfHeaderHorizontal from '../../../assets/CorralBannerHorizontal.png'

// Redux
import { useDispatch } from 'react-redux';
import { toggleIsCreating, setSelectedId, openViewing } from '../../../context/contactoDSlice';

function ContactosTableD({ contactosPre, clienteSelected }) {

    // --------------- Redux Store Settings -------------------------------------------------------

    const dispatch = useDispatch();
    
    // --------------- Búsqueda por filtros -------------------------------------------------------

    const contactos = useMemo(() => {
        if (contactosPre) {
            return contactosPre.map(contacto => ({
                ...contacto,
                tipoContacto: contacto.tipoContacto?.nombre
            }));
        }
    }, [contactosPre]); // Añade el nombre del tipo de contacto como propiedad para que funcione bien con la datatable

    // --------------- Setup (Servicios, Contextos, Referencias) -----------------------------------


    // --------------- Estados ---------------------------------------------------------------------

    const [filters, setFilters] = useState(null);
    const [globalFilterValue, setGlobalFilterValue] = useState('');

    // --------------- Funciones especificas del componente ------------------------------------------

    useEffect(() => {
        initFilters();
    }, []) // Inicializa los filtros    
    
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
            tipoContacto: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }] },
            cargo: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }] },
            nombre: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }] },
            apellido: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }] }
        }); // EDITABLE
        setGlobalFilterValue('');
    }; // Función para restaurar e inicializar los filtros: ESPECIFICO

    const cols = [
        { header: 'Código del contacto', dataKey: 'contactoId' },
        { header: 'Tipo de contacto', dataKey: 'tipoContacto.nombre' },
        { header: 'Cargo', dataKey: 'cargo' },
        { header: 'Nombre', dataKey: 'nombre' },
        { header: 'Apellido', dataKey: 'apellido' },
        { header: 'E-mail', dataKey: 'email' },
        { header: 'Teléfono', dataKey: 'telefono' },
        { header: 'Idioma', dataKey: 'idioma.nombre' },
    ]; // Columnas que se expotarán en el PDF: ESPECIFICO
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
                doc.text(`Contactos de ${clienteSelected?.nombre}`, margin, 160, { align: 'left' }); // Left aligned

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
                    body: contactosPre.map((row) => cols.map((column) => {
                        // Handle nested properties
                        const keys = column.dataKey.split('.');
                        let value = row;
                        for (let key of keys) {
                            value = value ? value[key] : '';
                        }
                        return value;
                    })),
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

                doc.save(`Contactos de ${clienteSelected?.nombre}.pdf`); // EDITABLE
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
        const worksheet = workbook.addWorksheet('Contactos'); // EDITABLE

        // Add the header row for the client name
        const titleRow = `Contactos de ${clienteSelected?.nombre}`;
        worksheet.addRow([titleRow]);
        worksheet.mergeCells(`A1:${String.fromCharCode(65 + cols.length - 1)}1`); // Merge cells for the title

        // Add column headers
        const headerRow = cols.map(col => col.header);
        worksheet.addRow(headerRow);

        contactosPre.forEach((contacto) => { // EDITABLE
            worksheet.addRow([
                contacto.contactoId,
                contacto.tipoContacto.nombre,
                contacto.cargo,
                contacto.nombre,
                contacto.apellido,
                contacto.email,
                contacto.telefono,
                contacto.idioma.nombre
            ]);
        }); // EDITABLE

        workbook.xlsx.writeBuffer().then((buffer) => {
            saveAsExcelFile(buffer, `Contactos de ${clienteSelected?.nombre}`); // EDITABLE
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

    const handleToggleIsCreating = () => {
        dispatch(toggleIsCreating());
    }; // Toggle para mostrar o no el ContactoCreateD

    const renderHeader = () => {
        return (
            <div className="flex justify-content-between">
                <div className="table-utility">
                    <span className="search-input-container">
                        <i className="pi pi-search search-input-icon" style={{ fontSize: '0.8rem', margin: '0' }}></i>
                        <InputText className="search-input" value={globalFilterValue} onChange={onGlobalFilterChange} placeholder="Buscar" />
                    </span>
                    <Button onClick={clearFilter} className="rounded-icon-btn" type="button" rounded>
                        <i className="pi pi-filter-slash" style={{ fontSize: '0.8rem', margin: '0' }}></i>
                    </Button>
                </div>
                <div className="table-utility">
                    <Button onClick={handleToggleIsCreating} className="rounded-icon-btn plus-btn" type="button" rounded>
                        <i className="pi pi-plus" style={{ fontSize: '0.8rem', margin: '0' }}></i>
                    </Button>
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
            nombrevar: "tipoContacto",
            header: "Tipo",
            filterPlaceholder: "Buscar por tipo de contacto",
        },
        {
            nombrevar: "cargo",
            header: "Cargo",
            filterPlaceholder: "Buscar por cargo",
        },
        {
            nombrevar: "nombre",
            header: "Nombre",
            filterPlaceholder: "Buscar por nombre",
        },
        {
            nombrevar: "apellido",
            header: "Apellido",
            filterPlaceholder: "Buscar por apellido",
        }
    ]; // Contiene los parámetros para crear columnas: ESPECIFICO

    const onRowSelect = (event) => {
        dispatch(setSelectedId(event.data.contactoId)); // Cambia el id seleccionado
        dispatch(openViewing()); // Abre el ContactoDetailsC
    }; // maneja la selección de la fila: ESPECIFICO

    return (
        <div className="tabla">
            <DataTable
                value={contactos} // EDITABLE
                resizableColumns
                removableSort
                paginator
                scrollable
                scrollHeight='30vh'
                showGridlines
                rows={10}
                rowsPerPageOptions={[5, 10, 25]} // EDITABLE
                size="small"
                dataKey="contactoId" // EDITABLE
                filters={filters}
                globalFilterFields={['tipoContacto', 'nombre', 'apellido', 'cargo']} // EDITABLE
                header={header}
                emptyMessage="No se encontraron contactos" // EDITABLE
                selectionMode="single"
                onRowSelect={onRowSelect}
                metaKeySelection={false}
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

export default ContactosTableD;