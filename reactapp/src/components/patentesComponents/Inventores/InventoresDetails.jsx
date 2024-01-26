import React, { useState, useRef, useEffect } from 'react';
import Draggable from 'react-draggable';
import { Button } from 'primereact/button';
import { Dropdown } from 'primereact/dropdown';
import { Toast } from 'primereact/toast';
import { ToggleButton } from 'primereact/togglebutton';
import { ConfirmPopup, confirmPopup } from 'primereact/confirmpopup';

// Redux
import { useSelector, useDispatch } from 'react-redux';
import { saveData, deleteData, setIsEditing } from '../../../context/inventorSlice'; // EDITABLE

// Servicios
import useSWR from 'swr';
const apiEndpoint = import.meta.env.VITE_MAIN_ENDPOINT;
const API_BASE_URL = `${apiEndpoint}/Inventores`;
import { useInventores } from '../../../services/useInventores'; // EDITABLE
import { usePaises } from '../../../services/usePais'; // EDITABLE: DROPDOWN
// Auth
import { useMsal } from '@azure/msal-react';

function InventoresDetails(props) { // EDITABLE

    // --------------- Redux store settings -------------------------------------------------------

    const dispatch = useDispatch();
    const inventoresDetailsData = useSelector(state => state.inventor.InventorDetails); // EDITABLE
    const isEditing = useSelector(state => state.inventor.isEditing); // EDITABLE

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
    const { data: inventorData, error, isLoading } = useSWR(`${API_BASE_URL}/${props.inventorId}`, fetcher); // SWR para los datos: EDITABLE
    const { deleteObject, updateObject } = useInventores(); // Servicio necesario: EDITABLE
    const prevInventorIdRef = useRef(props.inventorId); // Referencia para saber si el usuario selecciona otro objeto: EDITABLE

    const { paises, error: errorP, isLoading: isLoadingP, isValidating: isValidatingP, refresh: refreshP } = usePaises(); // Para el dropdown de paises
    // --------------- Estados que no requieren persistencia --------------------------------------------

    const [isLoading2, setIsLoading2] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const defaultRequiredFields = {
        nombre: false,
        apellido: false,
        pais: false,
        direccion: false,
    }; // EDITABLE

    // --------------- Estados que requieren persistencia --------------------------------------------

    const [inventor, setInventor] = useState({});// mapea el objeto: ESPECIFICO
    const [selectedPais, setSelectedPais] = useState(inventor?.pais); // saber el pais seleccionado: ESPECIFICO
    const [isAnyEmpty, setisAnyEmpty] = useState(false); //Saber si hay campos vacíos: GENERAL
    const [requiredFields, setRequiredFields] = useState(defaultRequiredFields); // mapea los inputs requeridos: GENERAL

    // --------------- Funciones necesarias para persistencia ----------------------------------------

    useEffect(() => {
        if (inventoresDetailsData) {
            setSelectedPais(inventoresDetailsData.selectedPais || inventor?.pais); // EDITABLE
            setisAnyEmpty(inventoresDetailsData.isAnyEmpty || false); // EDITABLE
            setInventor(inventoresDetailsData.inventor || {}); // EDITABLE
            setRequiredFields(inventoresDetailsData.requiredFields || defaultRequiredFields); // EDITABLE
        }
    }, []); // Se ejecuta cuando el componente renderiza, lee los datos guardados: ESPECIFICO
    const saveState = () => {
        dispatch(saveData({ objectName: 'InventorDetails', value: { selectedPais, isAnyEmpty, inventor, requiredFields } }));
    }; // Guarda en el store los estados como objetos: ESPECIFICO
    useEffect(() => {
        return () => {
            if (!isClosingRef.current) {
                saveState();
            }
        };
    }, [selectedPais, isAnyEmpty, inventor, requiredFields , isEditing]); // Se ejecuta con cada cambio de estado, persiste los datos: ESPECIFICO -> PUEDE OPTIMIZARSE
    const deletePersistedStates = () => {
        dispatch(deleteData({ objectName: 'InventorDetails' }));
    }; // Elimina los datos en el objeto del contexto: ESPECIFICO

    // --------------- Funciones especificas del componente ------------------------------------------

    // ------------------ DROPDOWNS ---------------------------------------

    useEffect(() => {
        if (selectedPais) {
            setInventor(prev => ({
                ...prev,
                pais: selectedPais
            }));
        }
    }, [selectedPais]); // Actualiza el objeto cuando el valor del dropdown cambia (hacer uno por cada dropdown): ESPECIFICO

    const refreshData = (e) => {
        e.preventDefault();
        setIsRefreshing(true);
        refreshP();
    }; // Refresca los datos del los dropdowns: GENERAL

    useEffect(() => {
        if (isRefreshing) {
            setIsRefreshing(false);
        }
    }, [isValidatingP]); // Cambia el estado de refreshing: GENERAL

    const optionTemplate = (option) => {
        return (
            <div className="dropdown-item-container">
                <span>{option.nombre}</span>
            </div>
        );
    }; // EDITABLE: template para mostrar las opciones de un dropdown

    const selectedValueTemplate = (option, props) => {
        if (option) {
            return (
                <div className="dropdown-item-container">
                    <span>{option.nombre}</span>
                </div>
            );
        }

        return <span>{props.placeholder}</span>;
    }; //EDITABLE: template para mostrar el valor seleccionado de un dropdown

    // ------------------ FIN DROPDOWNS ---------------------------------------


    useEffect(() => {
        if (props.inventorId !== prevInventorIdRef.current) {
            if (inventorData) {
                setInventor(inventorData); // EDITABLE
                setSelectedPais(inventorData.pais);
                setisAnyEmpty(false);
                setRequiredFields(defaultRequiredFields);
                prevInventorIdRef.current = props.inventorId;
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
                    if (inventorData) {
                        setInventor(inventorData); // EDITABLE
                        setSelectedPais(inventorData.pais);
                        setisAnyEmpty(false);
                        setRequiredFields(defaultRequiredFields);
                    }
                }
            }
        }
    }, [inventorData, isEditing, props.inventorId]); // useEffect para escuchar cambios en estadooData y mapearlos al objeto, solo si no se está editando: ESPECIFICO

    const handleInputChange = (e) => {
        const { name, value } = e.target;

        // Check if the input name is a key in the requiredFields
        if (requiredFields.hasOwnProperty(name)) {
            const updatedRequiredFields = { ...requiredFields };
            updatedRequiredFields[name] = false; // Reset to false if the required field has been edited
            setRequiredFields(updatedRequiredFields);
        }

        // Update the object state with the new value
        setInventor(prev => ({ ...prev, [name]: value }));

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
            const response = await deleteObject(props.inventorId);
            if (response === 204) {
                deletePersistedStates();
                dispatch(setIsEditing(false));
                props.onDeleted()
                props.onClose();
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
    }; // Verifica si un valor específico está vacío

    const validateRequiredFields = (inventor) => {
        const updatedRequiredFields = { ...defaultRequiredFields };

        // Iterate over the required field keys
        Object.keys(updatedRequiredFields).forEach(key => {
            updatedRequiredFields[key] = isEmptyValue(inventor[key]);
        });

        setRequiredFields(updatedRequiredFields);

        // Return true if any of the required fields is empty
        return Object.values(updatedRequiredFields).some(value => value);
    }; // Valida que los campos en REQUIRED_FIELDS no estén vacíos en el nuevo objeto


    const handleEdit = async (e) => {
        e.preventDefault();

        // Verificar si existe algun campo requerido vacío
        const anyFieldEmpty = validateRequiredFields(inventor);

        if (anyFieldEmpty) {
            setisAnyEmpty(true);
            return;
        } else {
            setisAnyEmpty(false);
        }

        // Intentar el request usando el servicio
        try {
            setIsLoading2(true);
            const inventorEdit = {
                inventorId: props.inventorId,
                nombre: inventor.nombre,
                apellido: inventor.apellido,
                direccion: inventor.direccion,
                codigoPais: inventor.pais.codigoPais
            }
            const response = await updateObject(props.inventorId, inventorEdit);

            if (response === 204) {
                dispatch(setIsEditing(false));
                deletePersistedStates();
                props.onEdited();
                props.onClose();
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
                            <span>{`Inventor N° ${inventor?.inventorId}:  ${inventor?.nombre} ${inventor?.apellido}`}</span>
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
                                <label>Nombre <small className="requiredAsterisk">(Obligatorio)</small></label>
                                <input readOnly={!isEditing} className={`${requiredFields.nombre && 'form-group-empty'}`} type="text" name="nombre" value={inventor?.nombre || ''} onChange={handleInputChange} required maxLength="70" placeholder="Nombre" />
                            </div>
                            <div className="form-group">
                                <label>Apellido <small className="requiredAsterisk">(Obligatorio)</small></label>
                                <input readOnly={!isEditing} className={`${requiredFields.apellido && 'form-group-empty'}`} type="text" name="apellido" value={inventor?.apellido || ''} onChange={handleInputChange} required maxLength="70" placeholder="Apellido" />
                            </div>
                            <div className="form-group">
                                <label>País <small className="requiredAsterisk">(Obligatorio)</small></label>
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
                                                disabled={!isEditing}
                                                className={`${requiredFields.pais && 'form-group-empty'}`}
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
                            <div className="form-group">
                                <label>Dirección <small className="requiredAsterisk">(Obligatorio)</small></label>
                                <textarea readOnly={!isEditing} className={`${requiredFields.direccion && 'form-group-empty'}`} type="text" name="direccion" value={inventor?.direccion || ''} onChange={handleInputChange} required maxLength="200" placeholder="Dirección completa del inventor (máx. 200 caracteres)" />
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

export default InventoresDetails;