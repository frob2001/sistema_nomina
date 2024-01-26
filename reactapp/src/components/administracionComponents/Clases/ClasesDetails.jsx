import React, { useState, useRef, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { saveData, deleteData, setIsEditing } from '../../../context/claseSlice'; // EDITABLE
import useSWR from 'swr';
import Draggable from 'react-draggable';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { ToggleButton } from 'primereact/togglebutton';
import { ConfirmPopup, confirmPopup } from 'primereact/confirmpopup';
import { useClases } from '../../../services/useClases'; // EDITABLE
const apiEndpoint = import.meta.env.VITE_MAIN_ENDPOINT;
const API_BASE_URL = `${apiEndpoint}/Clases`;

// Auth
import { useMsal } from '@azure/msal-react';

function ClasesDetails(props) { // EDITABLE

    // --------------- Redux store settings -------------------------------------------------------

    const dispatch = useDispatch();
    const claseDetails = useSelector(state => state.clase.ClaseDetails); // EDITABLE
    const isEditing = useSelector(state => state.clase.isEditing); // EDITABLE

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
    const { data: claseData, error, isLoading } = useSWR(`${API_BASE_URL}/${props.claseId}`, fetcher); // SWR para los datos: EDITABLE
    const { deleteClase, updateClase } = useClases(); // Servicio necesario: EDITABLE
    const prevClaseIdRef = useRef(props.claseId); // Referencia para saber si el usuario selecciona otro objeto: EDITABLE
    const [isLoading2, setIsLoading2] = useState(false);


    // --------------- Estados que requieren persistencia --------------------------------------------

    const defaultEmptyFields = {
        codigo: false,
        descripcionEspanol: false,
        descripcionIngles: false,
    }; // EDITABLE
    const [isAnyEmpty, setisAnyEmpty] = useState(false); // Saber si hay campos vacíos: GENERAL
    const [emptyFields, setEmptyFields] = useState(defaultEmptyFields); // Mapea los inputs requeridos: ESPECIFICO
    const [clase, setClase] = useState({}); // Tiene el objeto seleccionado: ESPECIFICO

    // --------------- Funciones necesarias para persistencia ----------------------------------------

    useEffect(() => {
        if (claseDetails) {
            setisAnyEmpty(claseDetails.isAnyEmpty || false);
            setClase(claseDetails.clase || {});
            setEmptyFields(claseDetails.emptyFields || defaultEmptyFields);
        }
    }, []); // Se ejecuta cuando el componente renderiza, lee los datos guardados: ESPECIFICO
    const saveState = () => {
        dispatch(saveData({ objectName: 'ClaseDetails', value: { isAnyEmpty, clase, emptyFields } }));
    }; // Guarda en el store los estados como objetos: ESPECIFICO
    useEffect(() => {
        return () => {
            if (!isClosingRef.current) {
                saveState();
            }
        };
    }, [isAnyEmpty, emptyFields, clase, isEditing]); // Se ejecuta con cada cambio de estado, persiste los datos: ESPECIFICO -> PUEDE OPTIMIZARSE
    const deletePersistedStates = () => {
        dispatch(setIsEditing(false));
        dispatch(deleteData({ objectName: 'ClaseDetails' }));
    }; // Elimina los datos en el objeto del contexto: ESPECIFICO

    // --------------- Funciones especificas del componente ------------------------------------------

    useEffect(() => {
        if (props.claseId !== prevClaseIdRef.current) {
            if (claseData) {
                setClase(claseData); // EDITABLE
                setisAnyEmpty(false);
                setEmptyFields(defaultEmptyFields);
                prevClaseIdRef.current = props.claseId;
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
                    setClase(claseData); // EDITABLE
                    setisAnyEmpty(false);
                    setEmptyFields(defaultEmptyFields);
                }
            }
        }
    }, [claseData, isEditing, props.claseId]); // useEffect para escuchar cambios en abogadoData y mapearlos al objeto, solo si no se está editando: ESPECIFICO
    const handleInputChange = (e) => {
        const { name, value } = e.target;

        const updatedEmptyFields = { ...emptyFields };
        updatedEmptyFields[name] = false;
        setEmptyFields(updatedEmptyFields);

        setClase({ ...clase, [name]: value });
    }; // Maneja el cambio en un input: ESPECIFICO
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
        try {
            setIsLoading2(true);
            const response = await deleteClase(props.claseId);
            if (response === 204) {
                deletePersistedStates();
                props.onDeleted()
                props.onClose();
            }
        } catch (error) {
            toast.current.show({
                severity: 'error',
                summary: 'Error',
                detail: 'Hubo un error al eliminar la clase',
                life: 3000,
            });
        } finally {
            setIsLoading2(false);
        }
    }; // Maneja la eliminación del objeto: ESPECIFICO
    const isAnyFieldEmpty = () => {
        const valuesArray = Object.values(clase);
        return valuesArray.some(value => {
            // First, check if the value is null or undefined
            if (value === null || value === undefined) {
                return true;
            }
            // If the value is a string, use trim to check if it's empty
            if (typeof value === 'string') {
                return value.trim() === '';
            }
            // If the value is a number, check if it's not a number (NaN)
            if (typeof value === 'number') {
                return isNaN(value);
            }
            return false;
        });
    }; // Verifica si existe un campo del objeto vacío: ESPECIFICO (Hay que tener ciudado con el ID)
    const handleEdit = async (e) => {
        e.preventDefault();

        // Verificar si existe algun campo vacío
        if (isAnyFieldEmpty()) {
            const updatedEmptyFields = {};

            for (const field in clase) {
                if (clase[field] === null || clase[field] === undefined) {
                    updatedEmptyFields[field] = true;
                } else if (typeof clase[field] === 'string' && clase[field].trim() === '') {
                    updatedEmptyFields[field] = true;
                } else if (typeof clase[field] === 'number' && isNaN(clase[field])) {
                    updatedEmptyFields[field] = true;
                } else {
                    updatedEmptyFields[field] = false;
                }
            }

            setEmptyFields(updatedEmptyFields);
            setisAnyEmpty(true);
            return;
        } else {
            setisAnyEmpty(false);
        }

        // Intentar el request usando el servicio
        try {
            setIsLoading2(true);
            const response = await updateClase(props.claseId, clase);

            if (response === 204) {
                deletePersistedStates();
                props.onEdited();
                props.onClose();
            }
        } catch (error) {
            toast.current.show({
                severity: 'error',
                summary: 'Error',
                detail: 'Hubo un error al editar la clase',
                life: 3000,
            });
        } finally {
            setIsLoading2(false);
        }
    }; // Maneja la edición del objeto: ESPECIFICO (Hay que tener ciudado con el ID)
    const handleCancel = () => {
        isClosingRef.current = true;
        deletePersistedStates();
        props.onClose();
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
                    <>
                        <section className="form-header">
                            <span>{"Clase N° " + (clase?.codigo || '')}</span>
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
                                <label htmlFor="codigo">Código <small className="requiredAsterisk">(Obligatorio)</small></label>
                                <input readOnly className={`${emptyFields.codigo && 'form-group-empty'}`} type="number" id="codigo" name="codigo" value={clase?.codigo || ''} onChange={handleInputChange} required maxLength="10" placeholder="Código único de la clase" />
                            </div>
                            <div className="form-group">
                                <label htmlFor="descripcionEspanol">Descripción en español <small className="requiredAsterisk">(Obligatorio)</small></label>
                                <textarea readOnly={!isEditing} className={`${emptyFields.descripcionEspanol && 'form-group-empty'}`} type="text" id="descripcionEspanol" name="descripcionEspanol" value={clase?.descripcionEspanol || ''} onChange={handleInputChange} required maxLength="1000" placeholder="Descripción de la clase en español" />
                            </div>
                            <div className="form-group">
                                <label htmlFor="descripcionIngles">Descripción en inglés <small className="requiredAsterisk">(Obligatorio)</small></label>
                                <textarea readOnly={!isEditing} className={`${emptyFields.descripcionIngles && 'form-group-empty'}`} type="text" id="descripcionIngles" name="descripcionIngles" value={clase?.descripcionIngles || ''} onChange={handleInputChange} required maxLength="1000" placeholder="Descripción de la clase en inglés" />
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
                    </>
                </div>
            </Draggable>
            <Toast ref={toast} />
            <ConfirmPopup />
        </>
    );
}

export default ClasesDetails;