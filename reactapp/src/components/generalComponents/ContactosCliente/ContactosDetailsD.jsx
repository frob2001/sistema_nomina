import React, { useState, useRef, useEffect } from 'react';
import useSWR from 'swr';
import Draggable from 'react-draggable';
import { Button } from 'primereact/button';
import { confirmPopup } from 'primereact/confirmpopup';
import { Dropdown } from 'primereact/dropdown';
import { Toast } from 'primereact/toast';
import { ToggleButton } from 'primereact/togglebutton';

// Redux
import { useSelector, useDispatch } from 'react-redux';
import { saveData, deleteData, closeViewing, deleteSelectedId, refreshObjectData, setIsEditing } from '../../../context/contactoDSlice'; // EDITABLE

// Services
import { useContactos } from '../../../services/useContactos'; // EDITABLE: MAIN
import { useTipoContactoClientes } from '../../../services/useTipoContactoCliente'; // EDITABLE: DROPDOWN
import { useIdiomas } from '../../../services/useIdiomas'; // EDITABLE: DROPDOWN
const apiEndpoint = import.meta.env.VITE_MAIN_ENDPOINT;
const API_BASE_URL = `${apiEndpoint}/ContactosCliente`;
// Auth
import { useMsal } from '@azure/msal-react';

function ContactosDetailsD({ onDeleted, onEdited }) { // EDITABLE

    // --------------- Redux store settings -------------------------------------------------------

    const dispatch = useDispatch();
    const contactoClienteDData = useSelector(state => state.contactoD.ContactoDetails); // EDITABLE
    const isEditing = useSelector(state => state.contactoD.isEditing); // EDITABLE: guarda si se está editando o no
    const selectedId = useSelector(state => state.contactoD.selectedId);

    // --------------- Setup (Servicios, Contextos, Referencias) -----------------------------------

    // Auth
    const { instance, accounts } = useMsal();
    const toast = useRef(null); // GENERAL
    const isClosingRef = useRef(false); // Referencia para eliminar persistencia: EDITABLE
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
    const { data: contactoData, error, isLoading, mutate: refresh } = useSWR(`${API_BASE_URL}/${selectedId}`, fetcher); // SWR para los datos: EDITABLE
    const { deleteObject, updateObject } = useContactos(); // Para editar y eliminar un objeto: EDITABLE

    const { tiposContactoClientes, error: errorTC, isLoading: isLoadingTC, isValidating: isValidatingTC, refresh: refreshTC } = useTipoContactoClientes(); // EDITABLE
    const { idiomas, error: errorI, isLoading: isLoadingI, isValidating: isValidatingI, refresh: refreshI } = useIdiomas(); // EDITABLE

    const prevContactoIdRef = useRef(selectedId); // Referencia para saber si el usuario selecciona otro objeto: EDITABLE


    // --------------- Estados que no requieren persistencia --------------------------------------------

    const [isLoading2, setIsLoading2] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const defaultRequiredFields = {
        tipoContacto: false,
        nombre: false,
        idioma: false
    }; // EDITABLE

    // --------------- Estados que requieren persistencia --------------------------------------------

    const [selectedTipoContacto, setSelectedTipoContacto] = useState(contactoData?.tipoContacto); // saber el tipo de contacto seleccionado: ESPECIFICO
    const [selectedIdioma, setSelectedIdioma] = useState(contactoData?.idioma); // saber el idioma seleccionado: ESPECIFICO
    
    const [isAnyEmpty, setisAnyEmpty] = useState(false); // Saber si hay campos vacíos: GENERAL
    const [requiredFields, setRequiredFields] = useState(defaultRequiredFields); // Mapea los inputs requeridos: ESPECIFICO
    const [contacto, setContacto] = useState(contactoData || {}); // Tiene el objeto seleccionado: ESPECIFICO

    // --------------- Funciones necesarias para persistencia ----------------------------------------

    useEffect(() => {
        if (contactoClienteDData) {
            setisAnyEmpty(contactoClienteDData.isAnyEmpty || false);
            setRequiredFields(contactoClienteDData.requiredFields || defaultRequiredFields);
            setContacto(contactoClienteDData.contacto || {});
            setSelectedTipoContacto(contactoClienteDData.selectedTipoContacto || contactoData?.tipoContacto);
            setSelectedIdioma(contactoClienteDData.selectedIdioma || contactoData?.idioma);
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
    }, [isAnyEmpty, contacto, requiredFields, selectedTipoContacto, selectedIdioma, isEditing ]); // Se ejecuta con cada cambio de estado, persiste los datos: ESPECIFICO -> PUEDE OPTIMIZARSE
    const deletePersistedStates = () => {
        dispatch(deleteData({ objectName: 'ContactoDetails' }));
    }; // Elimina los datos en el objeto del contexto: ESPECIFICO

    // --------------- Funciones especificas del componente ------------------------------------------

    // ------------------ DROPDOWNS ---------------------------------------
    useEffect(() => {
        if (selectedTipoContacto) {
            setContacto(prev => ({
                ...prev,
                tipoContactoClienteId: selectedTipoContacto.tipoContactoClienteId
            }));
        }
    }, [selectedTipoContacto]); // Actualiza el objeto cuando el valor del dropdown cambia (hacer uno por cada dropdown): ESPECIFICO
    useEffect(() => {
        if (selectedIdioma) {
            setContacto(prev => ({
                ...prev,
                codigoIdioma: selectedIdioma.codigoIdioma,
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
        if (selectedId !== prevContactoIdRef.current) {
            if (contactoData) {
                setContacto(contactoData); // EDITABLE
                setSelectedTipoContacto(contactoData.tipoContacto);
                setSelectedIdioma(contactoData.idioma);
                setisAnyEmpty(false);
                setRequiredFields(defaultRequiredFields);
                prevContactoIdRef.current = selectedId;
            }
        } else {
            if (!isEditing) {
                if (error) {
                    toast.current.show({
                        severity: 'error',
                        summary: 'Error',
                        detail: 'Hubo un error al contactar con el servidor',
                        life: 3000,
                    });
                } else {
                    if (contactoData) {
                        setContacto(contactoData); // EDITABLE
                        setSelectedTipoContacto(contactoData.tipoContacto);
                        setSelectedIdioma(contactoData.idioma);
                        setisAnyEmpty(false);
                        setRequiredFields(defaultRequiredFields);
                    }
                }
            }
        }
    }, [contactoData, isEditing, selectedId]); // useEffect para escuchar cambios en contactoData y mapearlos al objeto, solo si no se está editando: ESPECIFICO

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
        try {
            setIsLoading2(true);
            const response = await deleteObject(selectedId); // EDITABLE
            if (response === 204) {
                dispatch(refreshObjectData());
                deletePersistedStates();
                dispatch(setIsEditing(false));
                dispatch(deleteSelectedId());
                onDeleted();
                dispatch(closeViewing());
            }
        } catch (error) {
            toast.current.show({
                severity: 'error',
                summary: 'Error',
                detail: 'Hubo un error al eliminar el registro',
                life: 3000,
            });
        } finally {
            setIsLoading2(false);
        }
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

        const contactoUpdated = {
            clienteId: contacto.clienteId,
            tipoContactoClienteId: contacto.tipoContactoClienteId,
            nombre: contacto.nombre,
            apellido: contacto.apellido,
            email: contacto.email,
            telefono: contacto.telefono,
            cargo: contacto.cargo,
            codigoIdioma: contacto.codigoIdioma
        };

        try { 
            setIsLoading2(true);
            const response = await updateObject(selectedId, contactoUpdated);

            if (response === 204) {
                dispatch(refreshObjectData());
                deletePersistedStates();
                dispatch(setIsEditing(false));
                dispatch(deleteSelectedId());
                onEdited();
                dispatch(closeViewing());
            }
        } catch (error) {
            toast.current.show({
                severity: 'error',
                summary: 'Error',
                detail: 'Hubo un error al editar el registro',
                life: 3000,
            });
        } finally {
            setIsLoading2(false);
        }
    }; // Maneja la edición del objeto: ESPECIFICO (Hay que tener ciudado con el ID)

    const handleCancel = () => {
        isClosingRef.current = true;
        dispatch(setIsEditing(false));
        deletePersistedStates();
        dispatch(deleteSelectedId());
        dispatch(closeViewing());
    }; // Maneja el cancelar del formulario (Datos no persisten): GENERAL

    // -----------------------------------------------------------------------------------------------

    return (
        <>
            <Draggable cancel="input, button, textarea" bounds="parent">
                <div className="form-container">
                    {(isLoading || isLoading2) &&
                        <div className="spinner-container">
                            <div className="spinner" />
                        </div>
                    }
                    <section className="form-header">
                        <span>{"Contacto: " + (contacto?.nombre || '')}</span>
                        <div className="form-header-buttons">
                            <Button className="form-header-btn" onClick={handleCancel}>
                                <i className="pi pi-times" style={{ fontSize: '0.6rem', color: 'var(--secondary-blue)', fontWeight: '600' }}></i>
                            </Button>
                        </div>
                    </section>
                    <form className="form-body">
                        <div>
                            <ToggleButton onLabel="Leer" offLabel="Editar" onIcon="pi pi-eye" offIcon="pi pi-pencil"
                                checked={isEditing} onChange={(e) => dispatch(setIsEditing(e.value))} />
                        </div>
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
                                            disabled={!isEditing}
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
                            <input readOnly={!isEditing} className={`${requiredFields.nombre && 'form-group-empty'}`} type="text" id="nombre" name="nombre" value={contacto?.nombre || ''} onChange={handleInputChange} required maxLength="100" placeholder="Nombre del contacto" />
                        </div>
                        <div className="form-group">
                            <label htmlFor="apellido">Apellido</label>
                            <input readOnly={!isEditing} type="text" id="apellido" name="apellido" value={contacto?.apellido || ''} onChange={handleInputChange} maxLength="100" placeholder="Apellido del contacto" />
                        </div>
                        <div className="form-group">
                            <label htmlFor="email">E-mail</label>
                            <input readOnly={!isEditing} type="email" id="email" name="email" value={contacto?.email || ''} onChange={handleInputChange} maxLength="100" placeholder="E-mail del contacto" />
                        </div>
                        <div className="form-group">
                            <label htmlFor="telefono">Teléfono</label>
                            <input readOnly={!isEditing} type="text" id="telefono" name="telefono" value={contacto?.telefono || ''} onChange={handleInputChange} maxLength="30" placeholder="Teléfono del contacto" />
                        </div>
                        <div className="form-group">
                            <label htmlFor="cargo">Cargo</label>
                            <input readOnly={!isEditing} type="text" id="cargo" name="cargo" value={contacto?.cargo || ''} onChange={handleInputChange} maxLength="100" placeholder="Cargo del contacto" />
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
                                            disabled={!isEditing}
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
                    {(isAnyEmpty && isEditing) &&
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
                        {isEditing &&
                            <div className="form-UD-btns">
                                <button onClick={confirmDeletion} className="form-delete-btn">Eliminar</button>
                                <button onClick={handleEdit} className="form-accept-btn">Editar</button>
                            </div>
                        }
                    </section>
                </div>
            </Draggable>
            <Toast ref={toast} />
        </>
    );
}

export default ContactosDetailsD;