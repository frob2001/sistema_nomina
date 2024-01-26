import React, { useState, useRef, useEffect } from 'react';
import Draggable from 'react-draggable';
import { Button } from 'primereact/button';
import { ConfirmPopup, confirmPopup } from 'primereact/confirmpopup';
import { Dropdown } from 'primereact/dropdown';

// Redux
import { useSelector, useDispatch } from 'react-redux';
import { saveData, deleteData, closeViewing, deleteSelectedIndex, deleteContacto, editContacto } from '../../../context/contactoCSlice'; // EDITABLE

// Services
import { useTipoContactoClientes } from '../../../services/useTipoContactoCliente'; // EDITABLE: DROPDOWN
import { useIdiomas } from '../../../services/useIdiomas'; // EDITABLE: DROPDOWN

function ContactosDetailsC() { // EDITABLE

    // --------------- Redux store settings -------------------------------------------------------

    const dispatch = useDispatch();
    const contactoClienteDData = useSelector(state => state.contactoC.ContactoDetails); // EDITABLE
    const contactos = useSelector(state => state.contactoC.newContactos);
    const selectedIndex = useSelector(state => state.contactoC.selectedIndex);

    // --------------- Setup (Servicios, Contextos, Referencias) -----------------------------------

    const isClosingRef = useRef(false); // Referencia para eliminar persistencia: EDITABLE

    const { tiposContactoClientes, error: errorTC, isLoading: isLoadingTC, isValidating: isValidatingTC, refresh: refreshTC } = useTipoContactoClientes(); // EDITABLE
    const { idiomas, error: errorI, isLoading: isLoadingI, isValidating: isValidatingI, refresh: refreshI } = useIdiomas(); // EDITABLE

    // --------------- Estados que no requieren persistencia --------------------------------------------

    const [isRefreshing, setIsRefreshing] = useState(false);
    const defaultRequiredFields = {
        tipoContactoClienteId: false,
        nombre: false,
        codigoIdioma: false
    }; // EDITABLE

    // --------------- Estados que requieren persistencia --------------------------------------------

    const [selectedTipoContacto, setSelectedTipoContacto] = useState({ tipoContactoClienteId: contactos[selectedIndex].tipoContactoClienteId, nombre: contactos[selectedIndex].tipoContacto }); // saber el tipo de contacto seleccionado: ESPECIFICO
    const [selectedIdioma, setSelectedIdioma] = useState({ codigoIdioma: contactos[selectedIndex].codigoIdioma, nombre: contactos[selectedIndex].idioma }); // saber el idioma seleccionado: ESPECIFICO
    
    const [isAnyEmpty, setisAnyEmpty] = useState(false); // Saber si hay campos vacíos: GENERAL
    const [requiredFields, setRequiredFields] = useState(defaultRequiredFields); // Mapea los inputs requeridos: ESPECIFICO
    const [contacto, setContacto] = useState(contactos[selectedIndex]); // Tiene el objeto seleccionado: ESPECIFICO

    // --------------- Funciones necesarias para persistencia ----------------------------------------

    useEffect(() => {
        if (contactoClienteDData) {
            setisAnyEmpty(contactoClienteDData.isAnyEmpty || false);
            setRequiredFields(contactoClienteDData.requiredFields || defaultRequiredFields);
            setContacto(contactoClienteDData.contacto || contactos[selectedIndex]);
            setSelectedTipoContacto(contactoClienteDData.selectedTipoContacto || { tipoContactoClienteId: contactos[selectedIndex].tipoContactoClienteId, nombre: contactos[selectedIndex].tipoContacto });
            setSelectedIdioma(contactoClienteDData.selectedIdioma || { codigoIdioma: contactos[selectedIndex].codigoIdioma, nombre: contactos[selectedIndex].idioma });
        }
    }, []); // Se ejecuta cuando el componente renderiza, lee los datos guardados: ESPECIFICO
    const saveState = () => {
        dispatch(saveData({ objectName: 'ContactoDetails', value: { isAnyEmpty, contacto, requiredFields, selectedTipoContacto, selectedIdioma } }));
    }; // Guarda en el store los estados como objetos: ESPECIFICO
    useEffect(() => {
        return () => {
            if (!isClosingRef.current) {
                saveState();
            }
        };
    }, [isAnyEmpty, contacto, requiredFields, selectedTipoContacto, selectedIdioma ]); // Se ejecuta con cada cambio de estado, persiste los datos: ESPECIFICO -> PUEDE OPTIMIZARSE
    const deletePersistedStates = () => {
        dispatch(deleteData({ objectName: 'ContactoDetails' }));
    }; // Elimina los datos en el objeto del contexto: ESPECIFICO

    // --------------- Funciones especificas del componente ------------------------------------------

    // ------------------ DROPDOWNS ---------------------------------------
    useEffect(() => {
        if (selectedTipoContacto) {
            setContacto(prev => ({
                ...prev,
                tipoContactoClienteId: selectedTipoContacto.tipoContactoClienteId,
                tipoContacto: selectedTipoContacto.nombre
            }));
        }
    }, [selectedTipoContacto]); // Actualiza el objeto cuando el valor del dropdown cambia (hacer uno por cada dropdown): ESPECIFICO
    useEffect(() => {
        if (selectedIdioma) {
            setContacto(prev => ({
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

    // ------------------ FIN DROPDOWNS ---------------------------------------

    useEffect(() => {
        setContacto(contactos[selectedIndex]);
        setSelectedTipoContacto({ tipoContactoClienteId: contactos[selectedIndex].tipoContactoClienteId, nombre: contactos[selectedIndex].tipoContacto });
        setSelectedIdioma({ codigoIdioma: contactos[selectedIndex].codigoIdioma, nombre: contactos[selectedIndex].idioma });
    }, [selectedIndex])


    const handleInputChange = (e) => {
        const { name, value } = e.target;

        // Check if the input name is a key in the requiredFields
        if (requiredFields.hasOwnProperty(name)) {
            const updatedRequiredFields = { ...requiredFields };
            updatedRequiredFields[name] = false; // Reset to false if the required field has been edited
            setRequiredFields(updatedRequiredFields);
        }

        // Update the new object state with the new value
        setContacto(prev => ({ ...prev, [name]: value }));

    }; // Maneja el cambio en un input: ESPECIFICO

    const confirmDeletion = (event) => {
        confirmPopup({
            target: event.currentTarget,
            message: '¿Estás seguro?',
            icon: 'pi pi-info-circle',
            acceptClassName: 'p-button-danger',
            accept: handleDelete
        });
    }; // Maneja la confirmación para eliminar o no: GENERAL

    const handleDelete = async (e) => {
        dispatch(deleteContacto(selectedIndex));
        dispatch(deleteSelectedIndex());
        deletePersistedStates();
        dispatch(closeViewing());
    }; // Maneja la eliminación del objeto: ESPECIFICO

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

    const handleEdit = async (e) => {
        e.preventDefault();

        // Verificar si existe algun campo requerido vacío
        const anyFieldEmpty = validateRequiredFields(contacto);

        if (anyFieldEmpty) {
            setisAnyEmpty(true);
            return;
        } else {
            setisAnyEmpty(false);
        }

        dispatch(editContacto({ index: selectedIndex, contacto: contacto }));
        dispatch(deleteSelectedIndex());
        deletePersistedStates();
        dispatch(closeViewing());
    }; // Maneja la edición del objeto: ESPECIFICO (Hay que tener ciudado con el ID)

    const handleCancel = () => {
        isClosingRef.current = true;
        deletePersistedStates();
        dispatch(deleteSelectedIndex());
        dispatch(closeViewing());
    }; // Maneja el cancelar del formulario (Datos no persisten): GENERAL

    // -----------------------------------------------------------------------------------------------

    return (
        <>
            <Draggable cancel="input, button, textarea" bounds="parent">
                <div className="form-container">
                    <section className="form-header">
                        <span>Editar contacto</span>
                        <div className="form-header-buttons">
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
                            <input className={`${requiredFields.nombre && 'form-group-empty'}`} type="text" id="nombre" name="nombre" value={contacto.nombre || ''} onChange={handleInputChange} required maxLength="100" placeholder="Nombre del contacto" />
                        </div>
                        <div className="form-group">
                            <label htmlFor="apellido">Apellido</label>
                            <input type="text" id="apellido" name="apellido" value={contacto.apellido || ''} onChange={handleInputChange} maxLength="100" placeholder="Apellido del contacto" />
                        </div>
                        <div className="form-group">
                            <label htmlFor="email">E-mail</label>
                            <input type="email" id="email" name="email" value={contacto.email || ''} onChange={handleInputChange} maxLength="100" placeholder="E-mail del contacto" />
                        </div>
                        <div className="form-group">
                            <label htmlFor="telefono">Teléfono</label>
                            <input type="text" id="telefono" name="telefono" value={contacto.telefono || ''} onChange={handleInputChange} maxLength="30" placeholder="Teléfono del contacto" />
                        </div>
                        <div className="form-group">
                            <label htmlFor="cargo">Cargo</label>
                            <input type="text" id="cargo" name="cargo" value={contacto.cargo || ''} onChange={handleInputChange} maxLength="100" placeholder="Cargo del contacto" />
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
                        <div className="form-UD-btns">
                            <button onClick={confirmDeletion} className="form-delete-btn">Eliminar</button>
                            <button onClick={handleEdit} className="form-accept-btn">Editar</button>
                        </div>
                    </section>
                </div>
            </Draggable>
            <ConfirmPopup />
        </>
    );
}

export default ContactosDetailsC;