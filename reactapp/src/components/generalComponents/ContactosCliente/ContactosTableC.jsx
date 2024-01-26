import React, { useState, useEffect, useMemo } from 'react';
import { FilterMatchMode, FilterOperator } from 'primereact/api';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';

// Redux
import { useSelector, useDispatch } from 'react-redux';
import { toggleIsCreating, setSelectedIndex, openViewing } from '../../../context/contactoCSlice'; 


function ContactosTableC() {

    // --------------- Redux Store Settings -------------------------------------------------------

    const dispatch = useDispatch();
    const contactos = useSelector(state => state.contactoC.newContactos); // Lee los contactos nuevos añadidos

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

    const handleToggleIsCreating = () => {
        dispatch(toggleIsCreating());
    }; // Toggle para mostrar o no el ContactoCreateC

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
        dispatch(setSelectedIndex(event.data._index)); // Cambia el id seleccionado
        dispatch(openViewing()); // Abre el ContactoDetailsC
    }; // Maneja la selección de la fila: ESPECIFICO

    const contactosWithKey = useMemo(() => {
        return contactos.map((contacto, index) => ({
            ...contacto,
            _index: index
        }));
    }, [contactos]); // Añade el indice del arreglo como propiedad a la lista para poder usar eso al seleccionar un item

    return (
        <div className="tabla">
            <DataTable
                value={contactosWithKey} // EDITABLE
                resizableColumns
                removableSort
                paginator
                scrollable
                scrollHeight='30vh'
                showGridlines
                rows={10}
                rowsPerPageOptions={[5, 10, 25]} 
                size="small"
                dataKey="_index" // EDITABLE
                filters={filters}
                globalFilterFields={['tipoContacto', 'nombre', 'apellido', 'cargo']} // EDITABLE
                header={header}
                emptyMessage="No has agregado contactos" // EDITABLE
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

export default ContactosTableC;