import React, { useState, useRef, useEffect } from 'react';
import Draggable from 'react-draggable';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { Dropdown } from 'primereact/dropdown';
import { useSelector, useDispatch } from 'react-redux';

// Redux
import { saveData, deleteData, closeCreating, refreshObjectData } from '../../../context/contactoDSlice'; //EDITABLE: MAIN

// Servicios

import { useTipoContactoClientes } from '../../../services/useTipoContactoCliente'; // EDITABLE: DROPDOWN
import { useIdiomas } from '../../../services/useIdiomas'; // EDITABLE: DROPDOWN
import { useContactos } from '../../../services/useContactos';

function ContactosCreateD({ clienteId }) { //EDITABLE

    // --------------- Redux store settings -------------------------------------------------------

    const dispatch = useDispatch();
    const contactoClienteDData = useSelector(state => state.contactoD.ContactoCreate); // EDITABLE

    // --------------- Setup (Servicios, Contextos, Referencias) -----------------------------------

    const { createObject } = useContactos();

    const isClosingRef = useRef(false); // Referencia para eliminar persistencia
    const toast = useRef(null); // Referencia para el toast

    const { tiposContactoClientes, error: errorTC, isLoading: isLoadingTC, isValidating: isValidatingTC, refresh: refreshTC } = useTipoContactoClientes(); // EDITABLE
    const { idiomas, error: errorI, isLoading: isLoadingI, isValidating: isValidatingI, refresh: refreshI } = useIdiomas(); // EDITABLE

    // --------------- Estados que no requieren persistencia --------------------------------------------

    const [isLoading2, setIsLoading2] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const defaultNewContacto = {
        tipoContactoClienteId: '',
        nombre: '',
        apellido: '',
        email: '',
        telefono: '',
        cargo: '',
        codigoIdioma: ''
    }; //EDITABLE
    const defaultRequiredFields = {
        tipoContactoClienteId: false,
        nombre: false,
        codigoIdioma: false
    };

    // --------------- Estados que requieren persistencia --------------------------------------------

    const [selectedTipoContacto, setSelectedTipoContacto] = useState(null); // saber el tipo de contacto seleccionado: ESPECIFICO
    const [selectedIdioma, setSelectedIdioma] = useState(null); // saber el color seleccionado: ESPECIFICO

    const [isAnyEmpty, setisAnyEmpty] = useState(false); //Saber si hay campos vacíos: GENERAL
    const [newContacto, setNewContacto] = useState(defaultNewContacto);// mapea el objeto: ESPECIFICO
    const [requiredFields, setRequiredFields] = useState(defaultRequiredFields); // mapea los inputs requeridos: GENERAL

    // --------------- Funciones necesarias para persistencia ----------------------------------------

    useEffect(() => {
        if (contactoClienteDData) { // EDITABLE
            setSelectedTipoContacto(contactoClienteDData.selectedTipoContacto || null); // EDITABLE
            setSelectedIdioma(contactoClienteDData.selectedIdioma || null); // EDITABLE
            setisAnyEmpty(contactoClienteDData.isAnyEmpty || false); // EDITABLE
            setNewContacto(contactoClienteDData.newContacto || defaultNewContacto); // EDITABLE
            setRequiredFields(contactoClienteDData.requiredFields || defaultRequiredFields); // EDITABLE
        }
    }, []); // Se ejecuta cuando el componente renderiza, lee los datos guardados: GENERAL
    const saveState = () => {
        dispatch(saveData({ objectName: 'ContactoCreate', value: { isAnyEmpty, newContacto, requiredFields, selectedTipoContacto, selectedIdioma } }));
    }; // Guarda en el contexto los estados como objetos: ESPECIFICO
    useEffect(() => {
        return () => {
            if (!isClosingRef.current) {
                saveState();
            }
        };
    }, [isAnyEmpty, newContacto, requiredFields, selectedTipoContacto, selectedIdioma]); // Se ejecuta con cada cambio de estado, persiste los datos: ESPECIFICO -> PUEDE OPTIMIZARSE
    const deletePersistedStates = () => {
        dispatch(deleteData({ objectName: 'ContactoCreate' })); // EDITABLE
    }; // Elimina los datos en el objeto del contexto: ESPECIFICO

    // --------------- Funciones especificas del componente ------------------------------------------

    // ------------------ DROPDOWNS ---------------------------------------
    useEffect(() => {
        if (selectedTipoContacto) {
            setNewContacto(prev => ({
                ...prev,
                tipoContactoClienteId: selectedTipoContacto.tipoContactoClienteId,
                tipoContacto: selectedTipoContacto.nombre
            }));
        }
    }, [selectedTipoContacto]); // Actualiza el objeto cuando el valor del dropdown cambia (hacer uno por cada dropdown): ESPECIFICO
    useEffect(() => {
        if (selectedIdioma) {
            setNewContacto(prev => ({
                ...prev,
                codigoIdioma: selectedIdioma.codigoIdioma,
                idioma: selectedIdioma.nombre
            }));
        }
    }, [selectedIdioma]); // Actualiza el objeto cuando el valor del dropdown cambia (hacer uno por cada dropdown): ESPECIFICO

    const refreshData = (e) => {
        e.preventDefault();
        setIsRefreshing(true);
        refreshTC();
        refreshI();
    }; // Refresca los datos: GENERAL
    useEffect(() => {
        if (isRefreshing) {
            setIsRefreshing(false);
        }
    }, [isValidatingTC, isValidatingI]); // Cambia el estado de refreshing: GENERAL
    // ------------------ FIN DROPDOWNS ---------------------------------------

    const handleInputChange = (e) => {
        const { name, value } = e.target;

        // Check if the input name is a key in the requiredFields
        if (requiredFields.hasOwnProperty(name)) {
            const updatedRequiredFields = { ...requiredFields };
            updatedRequiredFields[name] = false; // Reset to false if the required field has been edited
            setRequiredFields(updatedRequiredFields);
        }

        // Update the new object state with the new value
        setNewContacto(prev => ({ ...prev, [name]: value }));

    }; // Maneja el cambio en un input: ESPECIFICO

    const isEmptyValue = value => {
        if (value === null || value === undefined) return true;
        if (typeof value === 'string') return value.trim() === '';
        if (typeof value === 'number') return isNaN(value) || value === 0;
        if (Array.isArray(value)) return value.length === 0;
        return false;
    }; // Verifica si un valor específico está vacío: GENERAL

    const validateRequiredFields = (contacto) => {
        const updatedRequiredFields = { ...defaultRequiredFields };

        // Iterate over the required field keys
        Object.keys(updatedRequiredFields).forEach(key => {
            updatedRequiredFields[key] = isEmptyValue(contacto[key]);
        });

        setRequiredFields(updatedRequiredFields);

        // Return true if any of the required fields is empty
        return Object.values(updatedRequiredFields).some(value => value);
    };

    const resetStates = () => {
        setisAnyEmpty(false);
        setNewContacto(defaultNewContacto); // EDITABLE
        setRequiredFields(defaultRequiredFields);
        setSelectedTipoContacto(null);
        setSelectedIdioma(null);
    } // Resetea los estados del componente: ESPECIFICO

    const handleCreate = async (e) => {
        e.preventDefault();

        // Verificar si existe algun campo requerido vacío
        const anyFieldEmpty = validateRequiredFields(newContacto);

        if (anyFieldEmpty) {
            setisAnyEmpty(true);
            return;
        } else {
            setisAnyEmpty(false);
        }

        const contactoToCreate = {
            clienteId: clienteId,
            tipoContactoClienteId: newContacto.tipoContactoClienteId,
            nombre: newContacto.nombre,
            apellido: newContacto.apellido,
            email: newContacto.email,
            telefono: newContacto.telefono,
            cargo: newContacto.cargo,
            codigoIdioma: newContacto.codigoIdioma
        }

        try {
            setIsLoading2(true);
            const response = await createObject(contactoToCreate); // EDITABLE

            if (response === 201) {
                toast.current.show({
                    severity: 'success',
                    summary: 'Proceso exitoso',
                    detail: 'Contacto creado con éxito', // EDITABLE
                    life: 3000,
                });
                resetStates();
                dispatch(refreshObjectData());  
            }
        } catch (error) {
            toast.current.show({
                severity: 'error',
                summary: 'Error',
                detail: 'Hubo un error al crear el contacto', // EDITABLE
                life: 3000,
            });
        } finally {
            setIsLoading2(false);
        }
    }; // Maneja la creación del objeto: ESPECIFICO
    
    const handleCancel = () => {
        isClosingRef.current = true;
        resetStates();
        deletePersistedStates();
        dispatch(closeCreating());
    }; // Maneja el cancelar del formulario (Datos no persisten): GENERAL
    const handleMinimize = () => {
        isClosingRef.current = false; 
        dispatch(closeCreating());
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
                <div id="contactoCreate" className="form-container">
                    {(isLoading2) &&
                        <div className="spinner-container">
                            <div className="spinner" />
                        </div>
                    }
                    <section className="form-header">
                        <span>Crear nuevo contacto</span> 
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
                        <div className="form-group">
                            <label htmlFor="tiposContactoClientes">Tipo de contacto <small className="requiredAsterisk">(Obligatorio)</small></label>
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
                                            className={`${requiredFields.tipoContactoClienteId && 'form-group-empty'}`}
                                            id="tiposContactoClientes"
                                            style={{ width: '100%' }}
                                            value={selectedTipoContacto}
                                            onChange={(e) => setSelectedTipoContacto(e.value)}
                                            options={tiposContactoClientes}
                                            optionLabel="tiposContactoClientes"
                                            placeholder="Selecciona un tipo de contacto"
                                            filter
                                            filterBy="nombre" 
                                            virtualScrollerOptions={{ itemSize: 38 }}
                                            valueTemplate={selectedValueTemplate}
                                            itemTemplate={optionTemplate}
                                        />
                                    )
                                }
                            </div>
                        </div>
                        <div className="form-group">
                            <label htmlFor="nombre">Nombre <small className="requiredAsterisk">(Obligatorio)</small></label>
                            <input className={`${requiredFields.nombre && 'form-group-empty'}`} type="text" id="nombre" name="nombre" value={newContacto.nombre || ''} onChange={handleInputChange} required maxLength="100" placeholder="Nombre del contacto" />
                        </div>
                        <div className="form-group">
                            <label htmlFor="apellido">Apellido</label>
                            <input type="text" id="apellido" name="apellido" value={newContacto.apellido || ''} onChange={handleInputChange} maxLength="100" placeholder="Apellido del contacto" />
                        </div>
                        <div className="form-group">
                            <label htmlFor="email">E-mail</label>
                            <input type="email" id="email" name="email" value={newContacto.email || ''} onChange={handleInputChange} maxLength="100" placeholder="E-mail del contacto" />
                        </div>
                        <div className="form-group">
                            <label htmlFor="telefono">Teléfono</label>
                            <input type="text" id="telefono" name="telefono" value={newContacto.telefono || ''} onChange={handleInputChange} maxLength="30" placeholder="Teléfono del contacto" />
                        </div>
                        <div className="form-group">
                            <label htmlFor="cargo">Cargo</label>
                            <input type="text" id="cargo" name="cargo" value={newContacto.cargo || ''} onChange={handleInputChange} maxLength="100" placeholder="Cargo del contacto" />
                        </div>
                        <div className="form-group">
                            <label htmlFor="idiomas">Idioma <small className="requiredAsterisk">(Obligatorio)</small></label>
                            <div>
                                {
                                    errorI || !idiomas ? (
                                        <div className="dropdown-error">
                                            <div className="dropdown-error-msg">
                                                {isLoadingI || (isRefreshing && isValidatingI) ?
                                                    <div className="small-spinner" /> :
                                                    <span>Ocurrió un error: sin opciones disponibles</span>}
                                            </div>
                                            <Button className="rounded-icon-btn" onClick={refreshData}>
                                                <i className="pi pi-refresh" style={{ fontSize: '0.8rem', margin: '0' }}></i>
                                            </Button>
                                        </div>
                                    ) : (
                                        <Dropdown
                                            className={`${requiredFields.codigoIdioma && 'form-group-empty'}`}
                                            id="idiomas"
                                            style={{ width: '100%' }}
                                            value={selectedIdioma}
                                            onChange={(e) => setSelectedIdioma(e.value)}
                                            options={idiomas}
                                            optionLabel="nombre"
                                            placeholder="Selecciona un idioma"
                                            filter
                                            virtualScrollerOptions={{ itemSize: 38 }}
                                            valueTemplate={selectedValueTemplate}
                                            itemTemplate={optionTemplate}
                                        />
                                    )
                                }
                            </div>
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
                    <section className="form-footer">
                        <button className="form-cancel-btn" onClick={handleCancel}>Cancelar</button>
                        <button style={errorTC || errorI && { backgroundColor: 'var(--even-darker-gray)' }} disabled={errorI || errorTC} type="submit" className="form-accept-btn" onClick={handleCreate}>Crear</button>
                    </section>
                </div>
            </Draggable>
            <Toast ref={toast} />
        </>
    );
}

export default ContactosCreateD;