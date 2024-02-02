import React, { useState, useEffect, useRef, useMemo } from 'react';
import { FilterMatchMode, FilterOperator } from 'primereact/api';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { Tooltip } from 'primereact/tooltip';
import { OverlayPanel } from 'primereact/overlaypanel';
import { Checkbox } from 'primereact/checkbox';

//Servicios
import useSWR from 'swr';
const apiEndpoint = import.meta.env.VITE_MAIN_ENDPOINT;
const API_BASE_URL = `${apiEndpoint}/api/Empleados`;

function EmpleadosTable(props) {

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

    const { data: empleados, error, isValidating, isLoading, mutate: refresh } = useSWR(API_BASE_URL, fetcher, {
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
            empleadoId: { value: null, matchMode: FilterMatchMode.EQUALS },
            companiaId: { value: null, matchMode: FilterMatchMode.EQUALS },
            tipoEmpleadoId: { value: null, matchMode: FilterMatchMode.EQUALS },
            apellidoPaterno: { value: null, matchMode: FilterMatchMode.STARTS_WITH },
            apellidoMaterno: { value: null, matchMode: FilterMatchMode.STARTS_WITH },
            nombres: { value: null, matchMode: FilterMatchMode.STARTS_WITH },
            sexo: { value: null, matchMode: FilterMatchMode.EQUALS },
            numeroCedula: { value: null, matchMode: FilterMatchMode.CONTAINS },
            direccion: { value: null, matchMode: FilterMatchMode.CONTAINS },
            telefono1: { value: null, matchMode: FilterMatchMode.CONTAINS },
            telefono2: { value: null, matchMode: FilterMatchMode.CONTAINS },
            tipoContratoId: { value: null, matchMode: FilterMatchMode.EQUALS },
            carnetIess: { value: null, matchMode: FilterMatchMode.CONTAINS },
            ocupacionId: { value: null, matchMode: FilterMatchMode.EQUALS },
            nivelSalarialId: { value: null, matchMode: FilterMatchMode.EQUALS },
            tipoComisionId: { value: null, matchMode: FilterMatchMode.EQUALS },
            centroCostosId: { value: null, matchMode: FilterMatchMode.EQUALS },
            fechaNacimiento: { value: null, matchMode: FilterMatchMode.DATE_IS },
            fechaIngreso: { value: null, matchMode: FilterMatchMode.DATE_IS },
            cuentaBancaria: { value: null, matchMode: FilterMatchMode.CONTAINS },
            bancoId: { value: null, matchMode: FilterMatchMode.EQUALS },
            tipoCuentaId: { value: null, matchMode: FilterMatchMode.EQUALS },
            bonificacion: { value: null, matchMode: FilterMatchMode.EQUALS },
            sueldoBase: { value: null, matchMode: FilterMatchMode.EQUALS },
            fondoReservaId: { value: null, matchMode: FilterMatchMode.EQUALS },
            reingreso: { value: null, matchMode: FilterMatchMode.EQUALS },
            fechaReingreso: { value: null, matchMode: FilterMatchMode.DATE_IS },
            formaCalculo13: { value: null, matchMode: FilterMatchMode.CONTAINS },
            formaCalculo14: { value: null, matchMode: FilterMatchMode.CONTAINS },
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
                    <Button onClick={(e) => op.current.toggle(e)} className="rounded-icon-btn" type="button" rounded>
                        <i className="pi pi-list" style={{ fontSize: '0.8rem', margin: '0' }}></i>
                    </Button>
                </div>
                <div className="table-utility">
                    <span style={{ alignSelf: 'center', fontWeight: '400' }}><strong>Registros:</strong> {empleados ? empleados.length : '0'}</span>
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
            nombrevar: "empleadoId",
            header: "ID Empleado",
            filterPlaceholder: "Buscar por ID de empleado",
        },
        {
            nombrevar: "companiaId",
            header: "ID Compañía",
            filterPlaceholder: "Buscar por ID de compañía",
        },
        {
            nombrevar: "tipoEmpleadoId",
            header: "ID Tipo de Empleado",
            filterPlaceholder: "Buscar por tipo de empleado",
        },
        {
            nombrevar: "apellidoPaterno",
            header: "Apellido Paterno",
            filterPlaceholder: "Buscar por apellido paterno",
        },
        {
            nombrevar: "apellidoMaterno",
            header: "Apellido Materno",
            filterPlaceholder: "Buscar por apellido materno",
        },
        {
            nombrevar: "nombres",
            header: "Nombres",
            filterPlaceholder: "Buscar por nombres",
        },
        {
            nombrevar: "sexo",
            header: "Sexo",
            filterPlaceholder: "Buscar por sexo",
        },
        {
            nombrevar: "numeroCedula",
            header: "Número de Cédula",
            filterPlaceholder: "Buscar por número de cédula",
        },
        {
            nombrevar: "direccion",
            header: "Dirección",
            filterPlaceholder: "Buscar por dirección",
        },
        {
            nombrevar: "telefono1",
            header: "Teléfono 1",
            filterPlaceholder: "Buscar por teléfono 1",
        },
        {
            nombrevar: "telefono2",
            header: "Teléfono 2",
            filterPlaceholder: "Buscar por teléfono 2",
        },
        {
            nombrevar: "tipoContratoId",
            header: "ID Tipo de Contrato",
            filterPlaceholder: "Buscar por tipo de contrato",
        },
        {
            nombrevar: "carnetIess",
            header: "Carnet IESS",
            filterPlaceholder: "Buscar por carnet IESS",
        },
        {
            nombrevar: "ocupacionId",
            header: "ID Ocupación",
            filterPlaceholder: "Buscar por ocupación",
        },
        {
            nombrevar: "nivelSalarialId",
            header: "ID Nivel Salarial",
            filterPlaceholder: "Buscar por nivel salarial",
        },
        {
            nombrevar: "tipoComisionId",
            header: "ID Tipo de Comisión",
            filterPlaceholder: "Buscar por tipo de comisión",
        },
        {
            nombrevar: "centroCostosId",
            header: "ID Centro de Costos",
            filterPlaceholder: "Buscar por centro de costos",
        },
        {
            nombrevar: "fechaNacimiento",
            header: "Fecha de Nacimiento",
            filterPlaceholder: "Buscar por fecha de nacimiento",
        },
        {
            nombrevar: "fechaIngreso",
            header: "Fecha de Ingreso",
            filterPlaceholder: "Buscar por fecha de ingreso",
        },
        {
            nombrevar: "cuentaBancaria",
            header: "Cuenta Bancaria",
            filterPlaceholder: "Buscar por cuenta bancaria",
        },
        {
            nombrevar: "bancoId",
            header: "ID Banco",
            filterPlaceholder: "Buscar por banco",
        },
        {
            nombrevar: "tipoCuentaId",
            header: "ID Tipo de Cuenta",
            filterPlaceholder: "Buscar por tipo de cuenta",
        },
        {
            nombrevar: "bonificacion",
            header: "Bonificación",
            filterPlaceholder: "Buscar por bonificación",
        },
        {
            nombrevar: "sueldoBase",
            header: "Sueldo Base",
            filterPlaceholder: "Buscar por sueldo base",
        },
        {
            nombrevar: "fondoReservaId",
            header: "ID Fondo de Reserva",
            filterPlaceholder: "Buscar por fondo de reserva",
        },
        {
            nombrevar: "reingreso",
            header: "Reingreso",
            filterPlaceholder: "Buscar por reingreso",
        },
        {
            nombrevar: "fechaReingreso",
            header: "Fecha de Reingreso",
            filterPlaceholder: "Buscar por fecha de reingreso",
        },
        {
            nombrevar: "formaCalculo13",
            header: "Cálculo 13",
            filterPlaceholder: "Buscar por cálculo 13",
        },
        {
            nombrevar: "formaCalculo14",
            header: "Cálculo 14",
            filterPlaceholder: "Buscar por cálculo 14",
        }
    ]; // Contiene los parámetros para crear columnas: ESPECIFICO

    const onRowSelect = (event) => {
        props.onSelect(event.data.empleadoId); // EDITABLE
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
                value={empleados} // EDITABLE
                resizableColumns
                removableSort
                paginator
                scrollable
                scrollHeight={error ? '60vh' : '63vh'}
                showGridlines
                rows={25}
                rowsPerPageOptions={[5, 10, 25, 50]}
                size="small"
                dataKey="empleadoId" // EDITABLE
                filters={filters}
                globalFilterFields={[
                    'nombres',
                    'apellidoPaterno',
                    'apellidoMaterno',
                    'numeroCedula',
                    'direccion',
                    'telefono1',
                    'telefono2',
                    'cuentaBancaria'
                ]} 
                header={header}
                emptyMessage="No se encontraron empleados" // EDITABLE
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
                        filter
                        filterField={column.nombrevar}
                        filterPlaceholder={column.filterPlaceholder}
                        filterClear={filterClearTemplate}
                        filterApply={filterApplyTemplate}
                        style={{ minWidth: '12rem' }}
                    />
                ))}
            </DataTable>
        </div>
    );
}

export default EmpleadosTable;