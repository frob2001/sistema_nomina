import React, { useState, useEffect, useRef } from 'react';
import { Toast } from 'primereact/toast';
import { ConfirmPopup, confirmPopup } from 'primereact/confirmpopup';

// Services

import { useTipoPatente } from '../../../../services/useTipoPatente'; // Editar con el servicio correspondiente
import TipoPatenteTable from './TipoPatenteTable';
const apiEndpoint = import.meta.env.VITE_MAIN_ENDPOINT;
const API_BASE_URL = `${apiEndpoint}/TipoPatentes`; // Editar
// Auth
import { useMsal } from '@azure/msal-react';

function TipoPatentePage() {

    // --------------- Redux store settings -------------------------------------------------------

    // --------------- Setup (Servicios, Contextos, Referencias) -----------------------------------

    // Auth
    const { instance, accounts } = useMsal();
    const toast = useRef(null);
    const { createObject, updateObject, deleteObject } = useTipoPatente();
    const defaultRequiredFields = {
        nombre: false,
    };

    // --------------- Estados que no requieren persistencia --------------------------------------------

    const [isEditing, setIsEditing] = useState(false);
    const [object, setObject] = useState({});
    const [selectedId, setSelectedId] = useState(null);
    const [data, setData] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isAnyEmpty, setisAnyEmpty] = useState(false); //Saber si hay campos vacíos: GENERAL
    const [requiredFields, setRequiredFields] = useState(defaultRequiredFields); // mapea los inputs requeridos: GENERAL

    // --------------- Funciones necesarias para obtener datos ----------------------------------------

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

    const getData = async () => {
        setIsLoading(true); // Set loading to true before the request starts
        try {
            const accessToken = await getAccessToken();
            const response = await fetch(`${API_BASE_URL}/${selectedId}`, {
                method: 'GET',
                headers: {
                    Authorization: `Bearer ${accessToken}`,
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

    // -----------------------------------------------------------------------------------------------

    return (
        <>
            <Toast ref={toast} />
            <div className="gestion-page-container">
                <div className="gestion-page-table">
                    <TipoPatenteTable onSelect={onSelect} onUnselect={onUnselect} selectedId={selectedId} />
                </div>
                <div className="gestion-page-form">
                    <div className="form-container">
                        {isLoading &&
                            <div className="spinner-container">
                                <div className="spinner" />
                            </div>
                        }
                        <section className="form-header form-header-gestion">
                            {isEditing ? <span>Editar tipo: {object?.nombre}</span> : <span>Crear nuevo tipo</span> }
                        </section>
                        <form className="form-body">
                            <div className="form-group">
                                <label>Tipo de patente <small className="requiredAsterisk">(Obligatorio)</small></label>
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

export default TipoPatentePage;