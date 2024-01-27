import React, { useState, useEffect, useRef } from 'react';
import { Toast } from 'primereact/toast';
import { ConfirmPopup, confirmPopup } from 'primereact/confirmpopup';
import { FilterMatchMode, FilterOperator } from 'primereact/api';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';

import { useGestionService } from '../../../../services/useGestionService'; // EDITAR CON EL SERVICIO CORRESPONDIENTE

function GestionPage({ endpoint }) {

    const apiEndpoint = import.meta.env.VITE_MAIN_ENDPOINT;
    const API_BASE_URL = `${apiEndpoint}/${endpoint}`; // Editar

    // --------------- Table settings -------------------------------------------------------

    const { data: tableData, error, isLoading: isLoadingTable, isValidating, refresh } = useGestionService(endpoint); // EDITABLE
    const [filters, setFilters] = useState(null);
    const [globalFilterValue, setGlobalFilterValue] = useState('');
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [selectedObject, setSelectedObject] = useState(null); // Objeto seleccionado: EDITABLE

    useEffect(() => {
        initFilters();
    }, []); // useEffect hook for initializing filters

    // --------------- Setup (Servicios, Contextos, Referencias) -----------------------------------

    const toast = useRef(null);
    const { createObject, updateObject, deleteObject } = useGestionService(endpoint);
    const defaultRequiredFields = {
        nombre: false,
    };

    // --------------- Estados de CRUD --------------------------------------------

    const [isEditing, setIsEditing] = useState(false);
    const [object, setObject] = useState({});
    const [selectedId, setSelectedId] = useState(null);
    const [data, setData] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isAnyEmpty, setisAnyEmpty] = useState(false); 
    const [requiredFields, setRequiredFields] = useState(defaultRequiredFields); 

    // --------------- Funciones necesarias para obtener datos ----------------------------------------

    const getData = async () => {
        setIsLoading(true); // Set loading to true before the request starts
        try {
            const response = await fetch(`${API_BASE_URL}/${selectedId}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            setData(data); // Set the data from the response
        } catch (error) {
            toast.current.show({
                severity: 'error',
                summary: 'Error',
                detail: 'Se produjo un error al recuperar los detalles',
                life: 3000,
            });
            setIsEditing(false);
            setData(null); // Reset the data on error
        } finally {
            setIsLoading(false); // Set loading to false after the request finishes
        }
    };

    // --------------- Funciones especificas del componente ------------------------------------------

    useEffect(() => {
        if (selectedId) {
            getData();
        }
    }, [selectedId])

    useEffect(() => {
        if (isEditing) {
            setObject(data);
        } else {
            setObject({});
        }
    }, [isEditing, data]);

    const resetStates = () => {
        setObject({});
        setIsEditing(false);
        setSelectedId(null);
        setisAnyEmpty(false);
        setRequiredFields(defaultRequiredFields);
    }

    const handleInputChange = (e) => {
        const { name, value } = e.target;

        // Check if the input name is a key in the requiredFields
        if (requiredFields.hasOwnProperty(name)) {
            const updatedRequiredFields = { ...requiredFields };
            updatedRequiredFields[name] = false; // Reset to false if the required field has been edited
            setRequiredFields(updatedRequiredFields);
        }

        // Update the newCliente state with the new value
        setObject(prev => ({ ...prev, [name]: value }));

    }; // Maneja el cambio en un input: ESPECIFICO

    const onSelect = (obj) => {
        setSelectedId(obj);
        setIsEditing(true);
        setisAnyEmpty(false);
        setRequiredFields(defaultRequiredFields);
    };

    const onUnselect = (e) => {
        setIsEditing(false);
        setisAnyEmpty(false);
        setRequiredFields(defaultRequiredFields);
    };

    const isEmptyValue = value => {
        if (value === null || value === undefined) return true;
        if (typeof value === 'string') return value.trim() === '';
        if (typeof value === 'number') return isNaN(value) || value === 0;
        if (Array.isArray(value)) return value.length === 0;
        return false;
    }; // Verifica si un valor específico está vacío

    const validateRequiredFields = (obj) => {
        const updatedRequiredFields = { ...defaultRequiredFields };

        // Iterate over the required field keys
        Object.keys(updatedRequiredFields).forEach(key => {
            updatedRequiredFields[key] = isEmptyValue(obj[key]);
        });

        setRequiredFields(updatedRequiredFields);

        // Return true if any of the required fields is empty
        return Object.values(updatedRequiredFields).some(value => value);
    }; // Valida que los campos en REQUIRED_FIELDS no estén vacíos en el nuevo objeto

    const handleCreate = async (e) => {
        e.preventDefault();

        // Verificar si existe algun campo requerido vacío
        const anyFieldEmpty = validateRequiredFields(object);

        if (anyFieldEmpty) {
            setisAnyEmpty(true);
            return;
        } else {
            setisAnyEmpty(false);
        }

        // Intentar el request usando el servicio
        
        try {
            setIsLoading(true);
            const response = await createObject(object);
            if (response === 201) {
                toast.current.show({
                    severity: 'success',
                    summary: 'Éxito',
                    detail: 'Se añadió el registro con éxito',
                    life: 3000,
                });
                resetStates();
            }
        } catch (error) {
            toast.current.show({
                severity: 'error',
                summary: 'Error',
                detail: 'Ocurrió un error',
                life: 3000,
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleEdit = async (e) => {
        e.preventDefault();


        // Verificar si existe algun campo requerido vacío
        const anyFieldEmpty = validateRequiredFields(object);

        if (anyFieldEmpty) {
            setisAnyEmpty(true);
            return;
        } else {
            setisAnyEmpty(false);
        }

        // Intentar el request usando el servicio
        try {
            setIsLoading(true);
            const response = await updateObject(selectedId, object);
            if (response === 204) {
                toast.current.show({
                    severity: 'success',
                    summary: 'Éxito',
                    detail: 'Se editó el registro con éxito',
                    life: 3000,
                });
                resetStates();
            }
        } catch (error) {
            toast.current.show({
                severity: 'error',
                summary: 'Error',
                detail: 'Ocurrió un error',
                life: 3000,
            });
        } finally {
            setIsLoading(false);
        }
    }; 

    const confirmDeletion = (event) => {
        confirmPopup({
            target: event.currentTarget,
            message: '¿Estás seguro? Esta acción es irreversible',
            icon: 'pi pi-info-circle',
            acceptClassName: 'p-button-danger',
            accept: handleDelete
        });
    }; // Maneja la confirmación para eliminar o no: GENERAL

    const handleDelete = async (e) => {
        // Intentar el request usando el servicio
        try {
            setIsLoading(true);
            const response = await deleteObject(selectedId);
            if (response === 204) {
                toast.current.show({
                    severity: 'success',
                    summary: 'Éxito',
                    detail: 'Se eliminó el registro con éxito',
                    life: 3000,
                });
                resetStates();
            }
        } catch (error) {
            toast.current.show({
                severity: 'error',
                summary: 'Error',
                detail: 'Ocurrió un error',
                life: 3000,
            });
        } finally {
            setIsLoading(false);
        }
    };

    // ------------------------------ Table functions ------------------------------------

    useEffect(() => {
        if (selectedId === null) {
            setSelectedObject(null);
        }
    }, [selectedId])

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
            nombre: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }] },
        }); // EDITABLE
        setGlobalFilterValue('');
    }; // Función para restaurar e inicializar los filtros: ESPECIFICO
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
                    <span style={{ alignSelf: 'center', fontWeight: '400' }}><strong>Registros:</strong> {tableData ? tableData.length : '0'}</span>
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
            nombrevar: "nombre",
            header: "Nombre",
            filterPlaceholder: "Buscar por nombre",
        }
    ]; // Contiene los parámetros para crear columnas: ESPECIFICO
    const onRowSelect = (event) => {
        switch (endpoint) {
            case 'Compania':
                onSelect(event.data.companiaId);
                break;
            case 'Emisor':
                onSelect(event.data.emisorId);
                break;
            case 'Sucursal':
                onSelect(event.data.sucursalId);
                break;
            case 'TipoEmpleado':
                onSelect(event.data.tipoEmpleadoId);
                break;
            case 'TipoContrato':
                onSelect(event.data.tipoContratoId);
                break;
            case 'TipoComision':
                onSelect(event.data.tipoComisionId);
                break;
            case 'TipoCuenta':
                onSelect(event.data.tipoCuentaId);
                break;
            case 'TipoOperacion':
                onSelect(event.data.tipoOperacionId);
                break;
            case 'Ocupacion':
                onSelect(event.data.ocupacionId);
                break;
            case 'NivelSalarial':
                onSelect(event.data.nivelSalarialId);
                break;
            case 'CentroCosto':
                onSelect(event.data.centroCostoId);
                break;
            case 'Banco':
                onSelect(event.data.bancoId);
                break;
            case 'FondoReserva':
                onSelect(event.data.fondoReservaId);
                break;
            case 'Concepto':
                onSelect(event.data.conceptoId);
                break;
            default:
                onSelect(null);
        }
    };
    const onRowUnselect = (event) => {
        onUnselect(); // EDITABLE
    }; // maneja la selección de la fila: ESPECIFICO
    const getDataKey = () => {
        switch (endpoint) {
            case 'Compania':
                return "companiaId";
            case 'Emisor':
                return "emisorId";
            case 'Sucursal':
                return "sucursalId";
            case 'TipoEmpleado':
                return "tipoEmpleadoId";
            case 'TipoContrato':
                return "tipoContratoId";
            case 'TipoComision':
                return "tipoComisionId";
            case 'TipoCuenta':
                return "tipoCuentaId";
            case 'TipoOperacion':
                return "tipoOperacionId";
            case 'Ocupacion':
                return "ocupacionId";
            case 'NivelSalarial':
                return "nivelSalarialId";
            case 'CentroCosto':
                return "centroCostoId";
            case 'Banco':
                return "bancoId";
            case 'FondoReserva':
                return "fondoReservaId";
            case 'Concepto':
                return "conceptoId";
            default:
                return '';
        }
    }


    return (
        <>
            <Toast ref={toast} />
            <div className="gestion-page-container">
                <div className="gestion-page-table">
                    <div className="tabla">
                        <Toast ref={toast} />
                        {(isLoadingTable || (isRefreshing && isValidating)) &&
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
                            value={tableData} // EDITABLE
                            resizableColumns
                            removableSort
                            paginator
                            scrollable
                            scrollHeight={error ? '60vh' : '63vh'}
                            showGridlines
                            rows={25}
                            rowsPerPageOptions={[5, 10, 25, 50]}
                            size="small"
                            dataKey={getDataKey()} // EDITABLE
                            filters={filters}
                            globalFilterFields={['nombre']} // EDITABLE
                            header={header}
                            emptyMessage="No se encontraron datos" // EDITABLE
                            selectionMode={error ? null : "single"}
                            selection={selectedObject} // EDITABLE
                            onSelectionChange={(e) => !error && setSelectedObject(e.value)} // EDITABLE
                            onRowSelect={onRowSelect}
                            onRowUnselect={onRowUnselect}
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
                                    style={{ minWidth: '100px', maxWidth: '200px' }}
                                />
                            ))}
                        </DataTable>
                    </div>
                </div>
                <div className="gestion-page-form">
                    <div className="form-container">
                        {isLoading &&
                            <div className="spinner-container">
                                <div className="spinner" />
                            </div>
                        }
                        <section className="form-header form-header-gestion">
                            {isEditing ? <span>Editar: {object?.nombre}</span> : <span>Crear nuevo</span> }
                        </section>
                        <form className="form-body">
                            <div className="form-group">
                                <label>Nombre <small className="requiredAsterisk">(Obligatorio)</small></label>
                                <input className={`${requiredFields.nombre && 'form-group-empty'}`} type="text" name="nombre" value={object?.nombre || ''} onChange={handleInputChange} required maxLength="100" />
                            </div>
                        </form>
                        {isAnyEmpty &&
                            <div className="empty-fields-msg">
                                <i className="pi pi-exclamation-circle" style={{ fontSize: '0.8rem', margin: '0', color: 'var(--secondary-blue)', fontWeight: '600' }}></i>
                                <span>Por favor, llena todos los datos <strong>requeridos</strong></span>
                            </div>
                        }
                        <div className="center-hr">
                            <hr />
                        </div>
                        {
                            !isEditing ? 
                                <section className="form-footer" style={{justifyContent: 'end'}}>
                                    <button className="form-accept-btn" onClick={handleCreate}>Crear</button>
                                </section>
                            :
                                <section className="form-footer">
                                    <button className="form-cancel-btn" onClick={resetStates}>Cancelar</button>
                                    <div className="form-UD-btns">
                                        <button onClick={confirmDeletion} className="form-delete-btn">Eliminar</button>
                                        <button onClick={handleEdit} className="form-accept-btn">Editar</button>
                                    </div>
                                </section>

                        }
                    </div>
                </div>
            </div>
            <ConfirmPopup />
        </>
    );
}

export default GestionPage;