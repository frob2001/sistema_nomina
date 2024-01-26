import React, { useState, useRef, useEffect } from 'react';
import { saveData, deleteData } from '../../../context/clienteSlice'; // EDITABLE
import Draggable from 'react-draggable';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { Dropdown } from 'primereact/dropdown';

import { useSelector, useDispatch } from 'react-redux';
import { usePaises } from '../../../services/usePais';
import { useTipoContactoClientes } from '../../../services/useTipoContactoCliente';

function ClientesSearch({ onClose, onSearch }) { //EDITABLE

    // --------------- Redux store settings -------------------------------------------------------

    const dispatch = useDispatch();
    const clienteSearchData = useSelector(state => state.cliente.ClienteSearch); // EDITABLE

    // --------------- Setup (Servicios, Contextos, Referencias) -----------------------------------

    const isClosingRef = useRef(false); // Referencia para eliminar persistencia: EDITABLE
    const toast = useRef(null); // Referencia para el toast: GENERAL
    const { paises, error: errorP, isLoading: isLoadingP, isValidating: isValidatingP, refresh: refreshP } = usePaises(); // EDITABLE
    const { tiposContactoClientes, error: errorTC, isLoading: isLoadingTC, isValidating: isValidatingTC, refresh: refreshTC } = useTipoContactoClientes(); // EDITABLE

    // --------------- Estados que no requieren persistencia -----------------------------------------

    const [isRefreshing, setIsRefreshing] = useState(false);

    // --------------- Estados que requieren persistencia --------------------------------------------

    const [searchParameters, setSearchParameters] = useState(null);// mapea los parámetros de búsqueda
    const [selectedPais, setSelectedPais] = useState(null); // saber el país seleccionado: ESPECIFICO
    const [selectedTCC, setSelectedTCC] = useState(null); // saber el país seleccionado: ESPECIFICO

    // --------------- Funciones necesarias para persistencia ----------------------------------------

    useEffect(() => {
        if (clienteSearchData) { // EDITABLE
            setSearchParameters(clienteSearchData.searchParameters || null); // EDITABLE
            setSelectedPais(clienteSearchData.selectedPais || null);
            setSelectedTCC(clienteSearchData.selectedTCC || null);
        }
    }, []); // Se ejecuta cuando el componente renderiza, lee los datos guardados: GENERAL
    const saveState = () => {
        dispatch(saveData({ objectName: 'ClienteSearch', value: { searchParameters, selectedPais, selectedTCC  } })); // EDITABLE
    }; // Guarda en el contexto los estados como objetos: ESPECIFICO
    useEffect(() => {
        return () => {
            if (!isClosingRef.current) {
                saveState();
            }
        };
    }, [searchParameters, selectedTCC, selectedPais]); // Se ejecuta con cada cambio de estado.
    const deletePersistedStates = () => {
        dispatch(deleteData({ objectName: 'ClienteSearch' })); // EDITABLE
    }; // Elimina los datos en el objeto del contexto: ESPECIFICO

    // --------------- Funciones especificas del componente ------------------------------------------

    // --------------- DROPDOWNS ---------------------------------------------------------------------
    const refreshData = (e) => {
        e.preventDefault();
        setIsRefreshing(true);
        refreshP();
        refreshTC();
    }; // Refresca los datos de los DROPDOWNs
    useEffect(() => {
        if (isRefreshing) {
            setIsRefreshing(false);
        }
    }, [isValidatingP, isValidatingTC]); // Cambia el estado de refreshing de los DROPDOWNs

    useEffect(() => {
        setSearchParameters(prevSP => {
            // Clone the previous state
            const newSP = { ...prevSP };

            if (selectedPais) {
                // If selectedTCC is defined, update the TipoContacto
                newSP.CodigoPais = selectedPais.codigoPais;
            } else if (newSP.CodigoPais !== undefined) {
                // If selectedTCC is undefined and TipoContacto exists, delete it
                delete newSP.CodigoPais;
            }

            return newSP;
        });
    }, [selectedPais]);

    useEffect(() => {
        setSearchParameters(prevSP => {
            // Clone the previous state
            const newSP = { ...prevSP };

            if (selectedTCC) {
                // If selectedTCC is defined, update the TipoContacto
                newSP.TipoContacto = selectedTCC.tipoContactoClienteId;
            } else if (newSP.TipoContacto !== undefined) {
                // If selectedTCC is undefined and TipoContacto exists, delete it
                delete newSP.TipoContacto;
            }

            return newSP;
        });
    }, [selectedTCC]); // Actualiza el objeto cuando el valor del dropdown cambia (hacer uno por cada dropdown): ESPECIFICO

    //----------------------------------- FIN DROPDOWNS ----------------------------------------------------------

    function makeURL(obj) {
        let url = '?';
        let isFirst = true;

        for (const key in obj) {
            if (isFirst) {
                url += key + '=' + obj[key];
                isFirst = false;
            } else {
                url += '&' + key + '=' + obj[key];
            }
        }
        return url;
    }

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        // Create a copy of the current searchParameters object
        const updatedSearchParameters = { ...searchParameters };
        // Check if the value is empty (e.g., an empty string)
        if (value === '' || null || undefined) {
            // If the value is empty, remove the property from the object
            delete updatedSearchParameters[name];
        } else {
            // If the value is not empty, update the property in the object
            updatedSearchParameters[name] = value;
        }

        // Update the searchParameters object
        setSearchParameters(updatedSearchParameters);
    };
    
    const handleSearch = async (e) => {
        e.preventDefault();
        onSearch(makeURL(searchParameters));
        onClose();
    }; // Maneja la búsqueda del objeto: GENERAL

    const resetStates = () => {
        setSearchParameters(null); // EDITABLE
    } // Resetea los estados del componente: ESPECIFICO

    const handleCancel = () => {
        isClosingRef.current = true;
        resetStates();
        deletePersistedStates();
        onClose();
    }; // Maneja el cancelar del formulario (Datos no persisten): GENERAL

    const handleMinimize = () => {
        isClosingRef.current = false; 
        onClose();
    }; // Maneja el minimizar del formulario (Datos persisten): GENERAL
    const optionTemplate = (option) => {
        return (
            <div className="dropdown-item-container">
                <span>{option.nombre}</span>
            </div>
        );
    }; // EDITABLE
    const selectedValueTemplate = (option, props) => {
        if (option) {
            return (
                <div className="dropdown-item-container">
                    <span>{option.nombre}</span>
                </div>
            );
        }

        return <span>{props.placeholder}</span>;
    }; //EDITABLE

    // -----------------------------------------------------------------------------------------------

    return (
        <>
            <Draggable cancel="input, button, textarea" bounds="parent">
                <div className="form-container wide-form">
                    <section className="form-header">
                        <span>Buscar clientes</span> 
                        <div className="form-header-buttons">
                            <Button className="form-header-btn" onClick={handleMinimize}>
                                <i className="pi pi-minus" style={{ fontSize: '0.6rem', color:'var(--secondary-blue)',fontWeight: '800' }}></i>
                            </Button>
                            <Button className="form-header-btn" onClick={handleCancel}>
                                <i className="pi pi-times" style={{ fontSize: '0.6rem', color: 'var(--secondary-blue)', fontWeight: '600' }}></i>
                            </Button>
                        </div>
                    </section>
                    <form className="form-body">
                        <section>
                            <div className="form-group-label">
                                <i className="pi pi-briefcase"></i>
                                <label htmlFor="clienteinfo">Cliente</label>
                            </div>
                            <div id="clienteinfo" className="form-body-group">
                                <div className="form-group">
                                    <label htmlFor="ClienteId">Código</label>
                                    <input type="number" id="ClienteId" name="ClienteId" value={searchParameters?.ClienteId || ''} onChange={handleInputChange} maxLength="10" placeholder="Código único del cliente"/>
                                </div>
                                <div className="form-group">
                                    <label htmlFor="Nombre">Nombre</label>
                                    <input type="text" id="Nombre" name="Nombre" value={searchParameters?.Nombre || ''} onChange={handleInputChange} maxLength="100" placeholder="Nombre del cliente" />
                                </div>
                            </div>
                        </section>
                        <section>
                            <div className="form-group-label">
                                <i className="pi pi-user"></i>
                                <label htmlFor="contactoinfo">Contacto</label>
                            </div>
                            <div id="contactoinfo" className="form-body-group">
                                <div className="form-group">
                                    <label htmlFor="NombreContacto">Contacto</label>
                                    <input type="text" id="NombreContacto" name="NombreContacto" value={searchParameters?.NombreContacto || ''} onChange={handleInputChange} maxLength="100" placeholder="Nombre del contacto" />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="tiposContactoClientes">Tipo de contacto</label>
                                    <div>
                                        {
                                            errorTC || !tiposContactoClientes ? (
                                                <div className="dropdown-error">
                                                    <div className="dropdown-error-msg">
                                                        {isLoadingTC || (isRefreshing && isValidatingTC) ?
                                                            <div className="small-spinner" /> :
                                                            <span>Ocurrió un error: sin opciones disponibles</span>}
                                                    </div>
                                                    <Button className="rounded-icon-btn" onClick={refreshData}>
                                                        <i className="pi pi-refresh" style={{ fontSize: '0.8rem', margin: '0' }}></i>
                                                    </Button>
                                                </div>
                                            ) : (
                                                <Dropdown
                                                    showClear
                                                    id="tiposContactoClientes"
                                                    style={{ width: '100%' }}
                                                    value={selectedTCC}
                                                    onChange={(e) => setSelectedTCC(e.value)}
                                                    options={tiposContactoClientes}
                                                    optionLabel="tiposContactoClientes"
                                                    placeholder="Selecciona un tipo de contacto"
                                                    filter
                                                    virtualScrollerOptions={{ itemSize: 38 }}
                                                    valueTemplate={selectedValueTemplate}
                                                    itemTemplate={optionTemplate}
                                                />
                                            )
                                        }
                                    </div>
                                </div>
                            </div>
                        </section>
                        <section>
                            <div className="form-group-label">
                                <i className="pi pi-map-marker"></i>
                                <label htmlFor="ubicacioninfo">Ubicación</label>
                            </div>
                            <div id="ubicacioninfo" className="form-body-group">
                                <div className="form-group">
                                    <label htmlFor="Ciudad">Ciudad</label>
                                    <input type="text" id="Ciudad" name="Ciudad" value={searchParameters?.Ciudad || ''} onChange={handleInputChange} maxLength="100" placeholder="Ciudad del cliente" />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="EstadoProvincia">Provincia / Estado</label>
                                    <input type="text" id="EstadoProvincia" name="EstadoProvincia" value={searchParameters?.EstadoProvincia || ''} onChange={handleInputChange} maxLength="100" placeholder="Provincia / Estado del cliente" />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="paises">País</label>
                                    <div>
                                        {
                                            errorP || !paises ? (
                                                <div className="dropdown-error">
                                                    <div className="dropdown-error-msg">
                                                        {isLoadingP || (isRefreshing && isValidatingP) ?
                                                            <div className="small-spinner" /> :
                                                            <span>Ocurrió un error: sin opciones disponibles</span>}
                                                    </div>
                                                    <Button className="rounded-icon-btn" onClick={refreshData}>
                                                        <i className="pi pi-refresh" style={{ fontSize: '0.8rem', margin: '0' }}></i>
                                                    </Button>
                                                </div>
                                            ) : (
                                                <Dropdown
                                                    showClear
                                                    id="paises"
                                                    style={{ width: '100%' }}
                                                    value={selectedPais}
                                                    onChange={(e) => setSelectedPais(e.value)}
                                                    options={paises}
                                                    optionLabel="nombre"
                                                    placeholder="Selecciona un país"
                                                    filter
                                                    virtualScrollerOptions={{ itemSize: 38 }}
                                                    valueTemplate={selectedValueTemplate}
                                                    itemTemplate={optionTemplate}
                                                />
                                            )
                                        }
                                    </div>
                                </div>
                            </div>
                        </section>
                    </form>
                    <div className="form-info-msg">
                        <i className="pi pi-exclamation-circle" style={{ fontSize: '0.8rem', margin: '0', color: 'var(--secondary-blue)', fontWeight: '600' }}></i>
                        <span>Si no selecciona ningún campo, se buscarán todos los registros y esto puede tardar más tiempo</span>
                    </div>
                    <div className="center-hr">
                        <hr />
                    </div>
                    <section className="form-footer">
                        <button className="form-cancel-btn" onClick={handleCancel}>Cancelar</button>
                        <button type="submit" className="form-accept-btn" onClick={handleSearch}>Buscar</button>
                    </section>
                </div>
            </Draggable>
            <Toast ref={toast} />
        </>
    );
}

export default ClientesSearch;