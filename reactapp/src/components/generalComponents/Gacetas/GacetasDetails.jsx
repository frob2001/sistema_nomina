import React, { useState, useRef, useEffect } from 'react';
import Draggable from 'react-draggable';
import { Button } from 'primereact/button';
import { Dropdown } from 'primereact/dropdown';
import { Toast } from 'primereact/toast';
import { ToggleButton } from 'primereact/togglebutton';
import { ConfirmPopup, confirmPopup } from 'primereact/confirmpopup';

// Redux
import { useSelector, useDispatch } from 'react-redux';
import { saveData, deleteData, setIsEditing } from '../../../context/gacetaSlice'; // EDITABLE

// Servicios
import useSWR from 'swr';
const apiEndpoint = import.meta.env.VITE_MAIN_ENDPOINT;
const API_BASE_URL = `${apiEndpoint}/Gacetas`;
import { useGacetas } from '../../../services/useGacetas'; // EDITABLE
import { usePaises } from '../../../services/usePais'; // EDITABLE: DROPDOWN
// Auth
import { useMsal } from '@azure/msal-react';

function GacetasDetails(props) { // EDITABLE

    // --------------- Redux store settings -------------------------------------------------------

    const dispatch = useDispatch();
    const gacetasDetailsData = useSelector(state => state.gaceta.GacetaDetails); // EDITABLE
    const isEditing = useSelector(state => state.gaceta.isEditing); // EDITABLE

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
    const { data: gacetaData, error, isLoading } = useSWR(`${API_BASE_URL}/${props.gacetaId}`, fetcher); // SWR para los datos: EDITABLE
    const { deleteObject, updateObject } = useGacetas(); // Servicio necesario: EDITABLE
    const prevGacetaIdRef = useRef(props.gacetaId); // Referencia para saber si el usuario selecciona otro objeto: EDITABLE

    const { paises, error: errorP, isLoading: isLoadingP, isValidating: isValidatingP, refresh: refreshP } = usePaises(); // Para el dropdown de paises
    // --------------- Estados que no requieren persistencia --------------------------------------------

    const [isLoading2, setIsLoading2] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const defaultRequiredFields = {
        numero: false,
        pais: false,
        urlGaceta: false,
        fecha: false,
    }; // EDITABLE

    // --------------- Estados que requieren persistencia --------------------------------------------

    const [gaceta, setGaceta] = useState({});// mapea el objeto: ESPECIFICO
    const [selectedPais, setSelectedPais] = useState(gaceta?.pais); // saber el pais seleccionado: ESPECIFICO
    const [isAnyEmpty, setisAnyEmpty] = useState(false); //Saber si hay campos vacíos: GENERAL
    const [requiredFields, setRequiredFields] = useState(defaultRequiredFields); // mapea los inputs requeridos: GENERAL
    
    // --------------- Funciones necesarias para persistencia ----------------------------------------

    useEffect(() => {
        if (gacetasDetailsData) {
            setSelectedPais(gacetasDetailsData.selectedPais || gaceta?.pais); // EDITABLE
            setisAnyEmpty(gacetasDetailsData.isAnyEmpty || false); // EDITABLE
            setGaceta(gacetasDetailsData.gaceta || {}); // EDITABLE
            setRequiredFields(gacetasDetailsData.requiredFields || defaultRequiredFields); // EDITABLE
        }
    }, []); // Se ejecuta cuando el componente renderiza, lee los datos guardados: ESPECIFICO
    const saveState = () => {
        dispatch(saveData({ objectName: 'GacetaDetails', value: { selectedPais, isAnyEmpty, gaceta, requiredFields } }));
    }; // Guarda en el store los estados como objetos: ESPECIFICO
    useEffect(() => {
        return () => {
            if (!isClosingRef.current) {
                saveState();
            }
        };
    }, [selectedPais, isAnyEmpty, gaceta, requiredFields , isEditing]); // Se ejecuta con cada cambio de estado, persiste los datos: ESPECIFICO -> PUEDE OPTIMIZARSE
    const deletePersistedStates = () => {
        dispatch(deleteData({ objectName: 'GacetaDetails' }));
    }; // Elimina los datos en el objeto del contexto: ESPECIFICO

    // --------------- Funciones especificas del componente ------------------------------------------

    // ------------------ DROPDOWNS ---------------------------------------

    useEffect(() => {
        if (selectedPais) {
            setGaceta(prev => ({
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
        if (props.gacetaId !== prevGacetaIdRef.current) {
            if (gacetaData) {
                setGaceta(gacetaData); // EDITABLE
                setSelectedPais(gacetaData.pais);
                setisAnyEmpty(false);
                setRequiredFields(defaultRequiredFields);
                prevGacetaIdRef.current = props.gacetaId;
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
                    if (gacetaData) {
                        setGaceta(gacetaData); // EDITABLE
                        setSelectedPais(gacetaData.pais);
                        setisAnyEmpty(false);
                        setRequiredFields(defaultRequiredFields);
                    }
                }
            }
        }
    }, [gacetaData, isEditing, props.gacetaId]); // useEffect para escuchar cambios en estadooData y mapearlos al objeto, solo si no se está editando: ESPECIFICO

    const handleInputChange = (e) => {
        const { name, value } = e.target;

        // Check if the input name is a key in the requiredFields
        if (requiredFields.hasOwnProperty(name)) {
            const updatedRequiredFields = { ...requiredFields };
            updatedRequiredFields[name] = false; // Reset to false if the required field has been edited
            setRequiredFields(updatedRequiredFields);
        }

        // Update the object state with the new value
        setGaceta(prev => ({ ...prev, [name]: value }));

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
            const response = await deleteObject(props.gacetaId);
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

    const validateRequiredFields = (gaceta) => {
        const updatedRequiredFields = { ...defaultRequiredFields };

        // Iterate over the required field keys
        Object.keys(updatedRequiredFields).forEach(key => {
            updatedRequiredFields[key] = isEmptyValue(gaceta[key]);
        });

        setRequiredFields(updatedRequiredFields);

        // Return true if any of the required fields is empty
        return Object.values(updatedRequiredFields).some(value => value);
    }; // Valida que los campos en REQUIRED_FIELDS no estén vacíos en el nuevo objeto


    const handleEdit = async (e) => {
        e.preventDefault();

        // Verificar si existe algun campo requerido vacío
        const anyFieldEmpty = validateRequiredFields(gaceta);

        if (anyFieldEmpty) {
            setisAnyEmpty(true);
            return;
        } else {
            setisAnyEmpty(false);
        }

        // Intentar el request usando el servicio
        try {
            setIsLoading2(true);
            const gacetaEdit = {
                "nombre": gaceta.nombre,
                "fecha": gaceta.fecha,
                "urlGaceta": gaceta.urlGaceta,
                "codigoPais": gaceta.pais.codigoPais,
            }
            const response = await updateObject(props.gacetaId, gacetaEdit);

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
                            <span>{"Gaceta N° " + (gaceta?.numero || '')}</span>
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
                                <label>Número <small className="requiredAsterisk">(Obligatorio)</small></label>
                                <input readOnly className={`${requiredFields.numero && 'form-group-empty'}`} type="number" name="numero" value={gaceta?.numero || ''} onChange={handleInputChange} required maxLength="6" placeholder="Número único de gaceta" />
                            </div> 
                            <div className="form-group">
                                <label>Fecha <small className="requiredAsterisk">(Obligatorio)</small></label>
                                <input readOnly={!isEditing} className={`${requiredFields.fecha && 'form-group-empty'}`} type="date" name="fecha" value={gaceta?.fecha ? gaceta.fecha.split('T')[0] : ''} onChange={handleInputChange} required maxLength="6" />
                            </div>
                            <div className="form-group">
                                <label>Url <small className="requiredAsterisk">(Obligatorio)</small></label>
                                <input readOnly={!isEditing} className={`${requiredFields.urlGaceta && 'form-group-empty'}`} type="text" name="urlGaceta" value={gaceta?.urlGaceta || ''} onChange={handleInputChange} required maxLength="300" placeholder="URL de la gaceta en el SENADI" />
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
                                                className={`${requiredFields.codigoPais && 'form-group-empty'}`}
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

export default GacetasDetails;