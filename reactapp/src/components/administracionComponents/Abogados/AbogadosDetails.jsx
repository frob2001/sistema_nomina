import React, { useState, useRef, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { saveData, deleteData, setIsEditing } from '../../../context/abogadoSlice';
import useSWR from 'swr';
import Draggable from 'react-draggable';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { ToggleButton } from 'primereact/togglebutton';
import { ConfirmPopup, confirmPopup } from 'primereact/confirmpopup';
import { useAbogados } from '../../../services/useAbogados';
const apiEndpoint = import.meta.env.VITE_MAIN_ENDPOINT;
const API_BASE_URL = `${apiEndpoint}/Abogados`;

// Auth
import { useMsal } from '@azure/msal-react';

function AbogadosDetails(props) {

    // --------------- Redux store settings -------------------------------------------------------

    const dispatch = useDispatch();
    const abogadoDetails = useSelector(state => state.abogado.AbogadoDetails);
    const isEditing = useSelector(state => state.abogado.isEditing);

    // --------------- Setup (Servicios, Contextos, Referencias) -----------------------------------

    const toast = useRef(null); // GENERA
    const isClosingRef = useRef(false); // Referencia para eliminar persistencia: EDITABLE
    // Auth
    const { instance, accounts } = useMsal();
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
    const { data: abogadoData, error, isLoading } = useSWR(`${API_BASE_URL}/${props.abogadoId}`, fetcher); // SWR para los datos: ESPECIFICO
    const { deleteAbogado, updateAbogado } = useAbogados(); // Servicio necesario: EDITABLE
    const prevAbogadoIdRef = useRef(props.abogadoId); // Referencia para saber si el usuario selecciona otro objeto: EDITABLE
    const [isLoading2, setIsLoading2] = useState(false);

    // --------------- Estados que requieren persistencia --------------------------------------------

    const defaultEmptyFields = {
        nombre: false,
        apellido: false,
        identificacion: false,
        matricula: false,
        email: false,
        telefono: false,
    }
    const [isAnyEmpty, setisAnyEmpty] = useState(false); // Saber si hay campos vacíos: GENERAL
    const [emptyFields, setEmptyFields] = useState(defaultEmptyFields); // Mapea los inputs requeridos: ESPECIFICO
    const [abogado, setAbogado] = useState({}); // Tiene el objeto seleccionado: ESPECIFICO

    // --------------- Funciones necesarias para persistencia ----------------------------------------

    useEffect(() => {
        if (abogadoDetails) {
            setisAnyEmpty(abogadoDetails.isAnyEmpty || false);
            setAbogado(abogadoDetails.abogado || {});
            setEmptyFields(abogadoDetails.emptyFields || defaultEmptyFields);
        }
    }, []); // Se ejecuta cuando el componente renderiza, lee los datos guardados: ESPECIFICO
    const saveState = () => {
        dispatch(saveData({ objectName: 'AbogadoDetails', value: { isAnyEmpty, abogado, emptyFields } }));
    }; // Guarda en el store los estados como objetos: ESPECIFICO
    useEffect(() => {
        return () => {
            if (!isClosingRef.current) {
                saveState();
            }
        };
    }, [isAnyEmpty, emptyFields, abogado, isEditing]); // Se ejecuta con cada cambio de estado, persiste los datos: ESPECIFICO -> PUEDE OPTIMIZARSE
    const deletePersistedStates = () => {
        dispatch(setIsEditing(false));
        dispatch(deleteData({ objectName: 'AbogadoDetails' }));
    }; // Elimina los datos en el objeto del contexto: ESPECIFICO

    // --------------- Funciones especificas del componente ------------------------------------------

    useEffect(() => {
        if (props.abogadoId !== prevAbogadoIdRef.current) {
            if (abogadoData) {
                setAbogado(abogadoData); // EDITABLE
                setisAnyEmpty(false);
                setEmptyFields(defaultEmptyFields);
                prevAbogadoIdRef.current = props.abogadoId;
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
                    setAbogado(abogadoData); // EDITABLE
                    setisAnyEmpty(false);
                    setEmptyFields(defaultEmptyFields);
                }
            }
        }
    }, [abogadoData, isEditing, props.abogadoId]); // useEffect para escuchar cambios en abogadoData y mapearlos al objeto, solo si no se está editando: ESPECIFICO
    const handleInputChange = (e) => {
        const { name, value } = e.target;

        const updatedEmptyFields = { ...emptyFields };
        updatedEmptyFields[name] = false;
        setEmptyFields(updatedEmptyFields);

        if (name === 'nombre' || name === 'apellido') {
            const names = value.split(' ');
            const capitalizedNames = names.map((part) =>
                part.charAt(0).toUpperCase() + part.slice(1).toLowerCase()
            );
            const finalValue = capitalizedNames.join(' ');
            setAbogado({ ...abogado, [name]: finalValue });
        } else {
            setAbogado({ ...abogado, [name]: value });
        }
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
            const response = await deleteAbogado(props.abogadoId);
            if (response === 204) {
                deletePersistedStates();
                props.onDeleted()
                props.onClose();
            }
        } catch (error) {
            toast.current.show({
                severity: 'error',
                summary: 'Error',
                detail: 'Hubo un error al eliminar el abogado',
                life: 3000,
            });
        } finally {
            setIsLoading2(false);
        }
    }; // Maneja la eliminación del objeto: ESPECIFICO
    const isAnyFieldEmpty = () => {
        const valuesArray = Object.values(abogado);
        const valuesToCheck = valuesArray.slice(1);
        return valuesToCheck.some(value => {
            // Check if the value is not null or undefined before calling trim
            return value ? value.trim() === '' : true;
        });
    }; // Verifica si existe un campo del objeto vacío: ESPECIFICO (Hay que tener ciudado con el ID)
    const handleEdit = async (e) => {
        e.preventDefault();

        // Verificar si existe algun campo vacío
        if (isAnyFieldEmpty()) {
            const updatedEmptyFields = {};

            for (const field in abogado) {
                if (field === 'abogadoId') {
                    continue; // Skip the 'id' property.
                }
                if (abogado[field]) {
                    if (abogado[field].trim() === '') {
                        updatedEmptyFields[field] = true;
                    } else {
                        updatedEmptyFields[field] = false;
                    }
                }
                else {
                    updatedEmptyFields[field] = true;
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
            const response = await updateAbogado(props.abogadoId, abogado);

            if (response === 204) {
                deletePersistedStates();
                props.onEdited();
                props.onClose();
            }
        } catch (error) {
            toast.current.show({
                severity: 'error',
                summary: 'Error',
                detail: 'Hubo un error al editar el abogado',
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
            <Draggable cancel="input, button" bounds="parent">
                <div className="form-container">
                    {(isLoading || isLoading2) &&
                        <div className="spinner-container">
                            <div className="spinner" />
                        </div>
                    }
                    <>
                        <section className="form-header">
                            <span>{(abogado?.nombre || '') + " " + (abogado?.apellido || '')}</span>
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
                                <label htmlFor="nombre">Nombre <small className="requiredAsterisk">(Obligatorio)</small></label>
                                <input readOnly={!isEditing} className={`${emptyFields.nombre && 'form-group-empty'}`} type="text" id="nombre" name="nombre" value={abogado?.nombre || ''} onChange={handleInputChange} required maxLength="30" placeholder="Nombre" />
                            </div>
                            <div className="form-group">
                                <label htmlFor="apellido">Apellido <small className="requiredAsterisk">(Obligatorio)</small></label>
                                <input readOnly={!isEditing} className={`${emptyFields.apellido && 'form-group-empty'}`} type="text" id="apellido" name="apellido" value={abogado?.apellido || ''} onChange={handleInputChange} required maxLength="30" placeholder="Apellido" />
                            </div>
                            <div className="form-group">
                                <label htmlFor="identificacion">Identificación <small className="requiredAsterisk">(Obligatorio)</small></label>
                                <input readOnly={!isEditing} className={`${emptyFields.identificacion && 'form-group-empty'}`} type="number" id="identificacion" name="identificacion" value={abogado?.identificacion || ''} onChange={handleInputChange} required maxLength="15" placeholder="Número de identificación" />
                            </div>
                            <div className="form-group">
                                <label htmlFor="matricula">Matrícula <small className="requiredAsterisk">(Obligatorio)</small></label>
                                <input readOnly={!isEditing} className={`${emptyFields.matricula && 'form-group-empty'}`} type="number" id="matricula" name="matricula" value={abogado?.matricula || ''} onChange={handleInputChange} required maxLength="20" placeholder="Matrícula" />
                            </div>
                            <div className="form-group">
                                <label htmlFor="email">Email <small className="requiredAsterisk">(Obligatorio)</small></label>
                                <input readOnly={!isEditing} className={`${emptyFields.email && 'form-group-empty'}`} type="email" id="email" name="email" value={abogado?.email || ''} onChange={handleInputChange} required maxLength="100" placeholder="E-mail" />
                            </div>
                            <div className="form-group">
                                <label htmlFor="telefono">Teléfono <small className="requiredAsterisk">(Obligatorio)</small></label>
                                <input readOnly={!isEditing} className={`${emptyFields.telefono && 'form-group-empty'}`} type="number" id="telefono" name="telefono" value={abogado?.telefono || ''} onChange={handleInputChange} required maxLength="20" placeholder="Teléfono" />
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

export default AbogadosDetails;