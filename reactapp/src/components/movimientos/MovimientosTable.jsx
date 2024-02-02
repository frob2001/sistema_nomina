import React, { useState, useEffect, useRef, useMemo } from 'react';
import { FilterMatchMode, FilterOperator } from 'primereact/api';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { Tooltip } from 'primereact/tooltip';

//Servicios
import useSWR from 'swr';
const apiEndpoint = import.meta.env.VITE_MAIN_ENDPOINT;
const API_BASE_URL = `${apiEndpoint}/MovimientosPlanilla`;

function MovimientosTable(props) {

    const fetcher = async (url) => {
        const res = await fetch(url, {
            headers: {
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

    const { data: movimientos, error, isValidating, isLoading, mutate: refresh } = useSWR(API_BASE_URL, fetcher, {
        errorRetryInterval: 10000,
    });

    // --------------- Setup (Servicios, Contextos, Referencias) -----------------------------------

    const toast = useRef(null);

    // --------------- Estados ---------------------------------------------------------------------

    const [filters, setFilters] = useState(null);
    const [globalFilterValue, setGlobalFilterValue] = useState('');
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [selectedObject, setSelectedObject] = useState(null);

    // --------------- Funciones necesarias para persistencia ----------------------------------------

    useEffect(() => {
        initFilters();
    }, []); 

    // --------------- Funciones especificas del componente ------------------------------------------

    useEffect(() => {
        refreshData();
    }, [props.refreshTrigger]); 

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
            global: { value: null, matchMode: FilterMatchMode.CONTAINS }
        }); // EDITABLE
        setGlobalFilterValue('');
    };
    
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
                    <span style={{ alignSelf: 'center', fontWeight: '400' }}><strong>Registros:</strong> {movimientos ? movimientos.length : '0'}</span>
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
            nombrevar: "movimientoId",
            header: "ID del movimiento",
            filterPlaceholder: "Buscar por ID del movimiento",
        },
        {
            nombrevar: "compania.nombre",
            header: "Compañía",
            filterPlaceholder: "Buscar por ID de compañía",
        },
        {
            nombrevar: "empleado.nombres",
            header: "Empleado",
            filterPlaceholder: "Buscar por tipo de empleado",
        },
        {
            nombrevar: "concepto.nombre",
            header: "Concepto",
            filterPlaceholder: "Buscar por concepto",
        },
        {
            nombrevar: "ano",
            header: "Año",
            filterPlaceholder: "Buscar por año",
        },
        {
            nombrevar: "mes",
            header: "Mes",
            filterPlaceholder: "Buscar por mes",
        },
        {
            nombrevar: "importe",
            header: "Importe",
            filterPlaceholder: "Buscar por importe",
        },
        {
            nombrevar: "tipoOperacion.nombre",
            header: "Tipo de operación",
            filterPlaceholder: "Buscar por tipo de operación",
        }
    ]; // Contiene los parámetros para crear columnas: ESPECIFICO

    const onRowSelect = (event) => {
        props.onSelect(event.data.movimientoId); // EDITABLE
    }; // maneja la selección de la fila: ESPECIFICO

    /* ----------------------- Fin Overlay setup ------------------------------------------------*/

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
                value={movimientos} // EDITABLE
                resizableColumns
                removableSort
                paginator
                scrollable
                scrollHeight={error ? '60vh' : '63vh'}
                showGridlines
                rows={25}
                rowsPerPageOptions={[5, 10, 25, 50]}
                size="small"
                dataKey="movimientoId" // EDITABLE
                filters={filters}
                globalFilterFields={[
                    'ano',
                    'mes',
                    'importe'
                ]} 
                header={header}
                emptyMessage="No se encontraron movimientos de planilla" // EDITABLE
                selectionMode="single"
                selection={selectedObject} // EDITABLE
                onSelectionChange={(e) => setSelectedObject(e.value)} // EDITABLE
                onRowSelect={onRowSelect}
                metaKeySelection={false}
            >
                {columnsData.map((column, index) => (
                    <Column
                        key={index}
                        field={column.nombrevar}
                        header={column.header}
                        sortable
                        //filter
                        //filterField={column.nombrevar}
                        //filterPlaceholder={column.filterPlaceholder}
                        //filterClear={filterClearTemplate}
                        //filterApply={filterApplyTemplate}
                        style={{ minWidth: '12rem' }}
                    />
                ))}
            </DataTable>
        </div>
    );
}

export default MovimientosTable;