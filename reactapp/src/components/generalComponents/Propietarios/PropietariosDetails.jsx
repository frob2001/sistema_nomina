import React, { useState, useRef, useEffect } from 'react';
import useSWR from 'swr';
import Draggable from 'react-draggable';
import { Button } from 'primereact/button';
import { Dropdown } from 'primereact/dropdown';
import { TabView, TabPanel } from 'primereact/tabview';
import { Toast } from 'primereact/toast';
import { ToggleButton } from 'primereact/togglebutton';
import { ConfirmPopup, confirmPopup } from 'primereact/confirmpopup';

// Redux
import { useSelector, useDispatch } from 'react-redux';
import { saveData, deleteData, setIsEditing } from '../../../context/propietarioSlice'; // EDITABLE

// Components
import DocumentViewer from '../../miscComponents/Documents/DocumentViewer';

// Services
const apiEndpoint = import.meta.env.VITE_MAIN_ENDPOINT;
const API_BASE_URL = `${apiEndpoint}/Propietarios`;
import { usePropietarios } from '../../../services/usePropietarios'; // EDITABLE: MAIN
import { useAbogados } from '../../../services/useAbogados'; // EDITABLE: DROPDOWN
import { usePaises } from '../../../services/usePais'; // EDITABLE: DROPDOWN
// Auth
import { useMsal } from '@azure/msal-react';

function PropietariosDetails(props) { // EDITABLE

    // --------------- Redux store settings -------------------------------------------------------

    const dispatch = useDispatch();
    const propietariosDataDetails = useSelector(state => state.propietario.PropietarioDetails); // EDITABLE: guarda los datos de persistencia
    const isEditing = useSelector(state => state.propietario.isEditing); // EDITABLE: guarda si se está editando o no

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
    const { data: propietarioData, error, isLoading, mutate: refresh } = useSWR(`${API_BASE_URL}/${props.propietarioId}`, fetcher); // SWR para los datos: EDITABLE
    const { deleteObject, updateObject } = usePropietarios(); // Para editar y eliminar un objeto: EDITABLE
    const prevPropietarioIdRef = useRef(props.propietarioId); // Referencia para saber si el usuario selecciona otro objeto: EDITABLE

    const { abogados, error: errorA, isLoading: isLoadingA, isValidating: isValidatingA, refresh: refreshA } = useAbogados(); // Para el dropdown de abogados
    const { paises, error: errorP, isLoading: isLoadingP, isValidating: isValidatingP, refresh: refreshP } = usePaises(); // Para el dropdown de paises

    // --------------- Estados que no requieren persistencia --------------------------------------------

    const [isLoading2, setIsLoading2] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const defaultRequiredFields = {
        nombre: false,
        pais: false,
    };; // EDITABLE: solo los campos requeridos

    // --------------- Estados que requieren persistencia --------------------------------------------

    const [selectedPais, setSelectedPais] = useState(propietarioData?.pais); // saber el pais seleccionado: ESPECIFICO
    const [selectedAbogado, setSelectedAbogado] = useState(null); // saber el idioma seleccionado: ESPECIFICO
    const [apoderados, setApoderados] = useState(propietarioData?.abogados);
    const [isAnyEmpty, setisAnyEmpty] = useState(false); // Saber si hay campos vacíos: GENERAL
    const [requiredFields, setRequiredFields] = useState(defaultRequiredFields); // mapea los inputs requeridos: GENERAL
    const [propietario, setPropietario] = useState({}); // Tiene el objeto seleccionado: ESPECIFICO

    // --------------- Funciones necesarias para persistencia ----------------------------------------

    useEffect(() => {
        if (propietariosDataDetails) {
            setSelectedPais(propietariosDataDetails.selectedPais || propietarioData?.pais); // EDITABLE
            setSelectedAbogado(propietariosDataDetails.selectedAbogado || null); // EDITABLE
            setisAnyEmpty(propietariosDataDetails.isAnyEmpty || false); // EDITABLE
            setPropietario(propietariosDataDetails.propietario || {}); // EDITABLE
            setRequiredFields(propietariosDataDetails.requiredFields || defaultRequiredFields); // EDITABLE
            setApoderados(propietariosDataDetails.apoderados || []); // EDITABLE
        }
    }, []); // Se ejecuta cuando el componente renderiza, lee los datos guardados: ESPECIFICO
    const saveState = () => {
        dispatch(saveData({ objectName: 'PropietarioDetails', value: { selectedPais, selectedAbogado, isAnyEmpty, requiredFields, propietario, apoderados  } }));
    }; // Guarda en el store los estados como objetos: ESPECIFICO
    useEffect(() => {
        return () => {
            if (!isClosingRef.current) {
                saveState();
            }
        };
    }, [selectedPais, selectedAbogado, isAnyEmpty, requiredFields, propietario, apoderados, isEditing]); // Se ejecuta con cada cambio de estado, persiste los datos: ESPECIFICO -> PUEDE OPTIMIZARSE
    const deletePersistedStates = () => {
        dispatch(deleteData({ objectName: 'PropietarioDetails' }));
    }; // Elimina los datos en el objeto del contexto: ESPECIFICO

    // --------------- Funciones especificas del componente ------------------------------------------

    //useEffect(() => {
    //    refresh();
    //    dispatch(setIsEditing(false));
    //}, [refreshSwitch]) // Refresca el contacto cuando algo en contactos cambió

    // ------------------ DROPDOWNS ---------------------------------------

    useEffect(() => {
        if (selectedPais) {
            setPropietario(prev => ({
                ...prev,
                pais: selectedPais
            }));
        }
    }, [selectedPais]); // Actualiza el objeto cuando el valor del dropdown cambia (hacer uno por cada dropdown): ESPECIFICO

    const handleAddAbogado = (e) => {
        e.preventDefault();
        if (selectedAbogado && !apoderados.some(abogado => abogado.abogadoId === selectedAbogado.abogadoId)) {
            // Add the selectedAbogado to the apoderados array if an object with the same abogadoId is not already present
            setApoderados([...apoderados, selectedAbogado]);
        }
    };

    const handleDeleteAbogado = (e, abogado) => {
        e.preventDefault(); // Prevent default link behavior
        // Remove the selectedAbogado from the apoderados array
        const updatedApoderados = apoderados.filter((item) => item !== abogado);
        setApoderados(updatedApoderados);
    };

    const refreshData = (e) => {
        e.preventDefault();
        setIsRefreshing(true);
        refreshP();
        refreshA();
    }; // Refresca los datos del los dropdowns: GENERAL

    useEffect(() => {
        if (isRefreshing) {
            setIsRefreshing(false);
        }
    }, [isValidatingP, isValidatingA]); // Cambia el estado de refreshing: GENERAL

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

    const optionTemplateA = (option) => {
        return (
            <div className="dropdown-item-container">
                <span>{option.nombre} {option.apellido}</span>
            </div>
        );
    }; // EDITABLE: template para mostrar las opciones de un dropdown

    const selectedValueTemplateA = (option, props) => {
        if (option) {
            return (
                <div className="dropdown-item-container">
                    <span>{option.nombre} {option.apellido}</span>
                </div>
            );
        }

        return <span>{props.placeholder}</span>;
    }; //EDITABLE: template para mostrar el valor seleccionado de un dropdown

    // ------------------ FIN DROPDOWNS ---------------------------------------

    useEffect(() => {
        if (apoderados) {
            const abogadosIds = apoderados.map(abogado => abogado.abogadoId);

            setPropietario(prevPropietario => ({
                ...prevPropietario,
                abogadosIds: abogadosIds
            }));
        }
    }, [apoderados]); 

    useEffect(() => {
        if (props.propietarioId !== prevPropietarioIdRef.current) {
            if (propietarioData) {
                setPropietario(propietarioData); // EDITABLE
                setSelectedPais(propietarioData.pais);
                setApoderados(propietarioData.abogados);
                setSelectedAbogado(null);
                setisAnyEmpty(false);
                setRequiredFields(defaultRequiredFields);
                prevPropietarioIdRef.current = props.propietarioId;
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
                    if (propietarioData) {
                        setPropietario(propietarioData); // EDITABLE
                        setSelectedPais(propietarioData.pais);
                        setApoderados(propietarioData.abogados);
                        setSelectedAbogado(null);
                        setisAnyEmpty(false);
                        setRequiredFields(defaultRequiredFields);
                    }
                }
            }
        }
    }, [propietarioData, isEditing, props.propietarioId]); // useEffect para escuchar cambios en estadoData y mapearlos al objeto, solo si no se está editando: ESPECIFICO
    const handleInputChange = (e) => {
        const { name, type, value, checked } = e.target;

        // Use value for text inputs, and checked for checkboxes
        const inputValue = type === 'checkbox' ? checked : value;

        // Check if the input name is a key in the requiredFields
        if (requiredFields.hasOwnProperty(name)) {
            const updatedRequiredFields = { ...requiredFields };
            updatedRequiredFields[name] = false;
            setRequiredFields(updatedRequiredFields);
        }

        // Update the newCliente state with the new value for text inputs
        // or the new checked state for checkboxes
        setPropietario(prev => ({ ...prev, [name]: inputValue }));
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
            const response = await deleteObject(props.propietarioId); // EDITABLE
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
        if (typeof value === 'object') return Object.keys(value).length === 0;
        return false;
    }; // Verifica si un valor específico está vacío

    const validateRequiredFields = (propietario) => {
        const updatedRequiredFields = { ...defaultRequiredFields };

        // Iterate over the required field keys
        Object.keys(updatedRequiredFields).forEach(key => {
            updatedRequiredFields[key] = isEmptyValue(propietario[key]);
        });

        setRequiredFields(updatedRequiredFields);

        // Return true if any of the required fields is empty
        return Object.values(updatedRequiredFields).some(value => value);
    }; // Valida que los campos en REQUIRED_FIELDS no estén vacíos en el nuevo objeto

    const handleEdit = async (e) => {
        e.preventDefault();

        // Verificar si existe algun campo requerido vacío
        const anyFieldEmpty = validateRequiredFields(propietario);

        if (anyFieldEmpty) {
            setisAnyEmpty(true);
            return;
        } else {
            setisAnyEmpty(false);
        }

        // Intentar el request usando el servicio
        try { 
            setIsLoading2(true);
            const newPropietario = {
                propietarioId: props.propietarioId,
                nombre: propietario.nombre,
                codigoPais: propietario.pais.codigoPais,
                numeroPoder: propietario.numeroPoder,
                fechaPoder: propietario.fechaPoder,
                origen: propietario.origen,
                notas: propietario.notas,
                general: propietario.general,
                abogadosIds: propietario.abogadosIds ? propietario.abogadosIds : propietario.abogados?.map(ab => ab.abogadoId)
            }
            
            const response = await updateObject(props.propietarioId, newPropietario);

            if (response === 204) {
                dispatch(setIsEditing(false));
                deletePersistedStates();
                props.onEdited();
                props.onClose();
            }
        } catch (error) {
            toast.current.show({
                severity: 'error',
                summary: 'error',
                detail: 'hubo un error al editar el registro',
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
                <div className="form-container wider-form">
                    {(isLoading || isLoading2) &&
                        <div className="spinner-container">
                            <div className="spinner" />
                        </div>
                    }
                    <>
                        <section className="form-header">
                            <span>{"Propietario: " + (propietario?.nombre || '')}</span>
                            <div className="form-header-buttons">
                                <Button className="form-header-btn" onClick={handleCancel}>
                                    <i className="pi pi-times" style={{ fontSize: '0.6rem', color: 'var(--secondary-blue)', fontWeight: '600' }}></i>
                                </Button>
                            </div>
                        </section>

                        <TabView>
                            <TabPanel header="Propietario" leftIcon="pi pi-briefcase mr-2">
                                <form className="form-body form-body--create">
                                    <section>
                                        <div className="form-group-label">
                                            <i className="pi pi-briefcase"></i>
                                            <label>Propietario</label>
                                        </div>
                                        <div className="form-body-group">
                                            <div className="form-group">
                                                <label>Nombre <small className="requiredAsterisk">(Obligatorio)</small></label>
                                                <input readOnly={!isEditing} className={`${requiredFields.nombre && 'form-group-empty'}`} type="text" name="nombre" value={propietario?.nombre || ''} onChange={handleInputChange} required maxLength="255" placeholder="Nombre del propietario" />
                                            </div>
                                        </div>
                                    </section>
                                    <section>
                                        <div className="form-group-label">
                                            <i className="pi pi-map-marker"></i>
                                            <label>Ubicación</label>
                                        </div>
                                        <div className="form-body-group">
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
                                        </div>
                                    </section>
                                    <section>
                                        <div className="form-group-label">
                                            <i className="pi pi-book"></i>
                                            <label>Poder</label>
                                        </div>
                                        <div className="form-body-group">
                                            <div className="form-group">
                                                <label>Número</label>
                                                <input readOnly={!isEditing} type="text" name="numeroPoder" value={propietario?.numeroPoder || ''} onChange={handleInputChange} required maxLength="20" placeholder="Número del poder" />
                                            </div>
                                            <div className="form-group">
                                                <label>Fecha</label>
                                                <input readOnly={!isEditing} type="date" name="fechaPoder" value={propietario?.fechaPoder ? propietario.fechaPoder.split('T')[0] : ''} onChange={handleInputChange} required />
                                            </div>
                                            <div className="form-group center-switch">
                                                <label>General</label>
                                                <label className="switch">
                                                    <input disabled={!isEditing} type="checkbox" name="general" checked={propietario?.general} onChange={handleInputChange} />
                                                    <span className="slider round"></span>
                                                </label>
                                            </div>
                                            <div className="form-group">
                                                <label>Origen</label>
                                                <textarea readOnly={!isEditing} type="text" name="origen" value={propietario?.origen || ''} onChange={handleInputChange} required maxLength="1000" placeholder="Origen del poder (máx. 1000 caracteres)" />
                                            </div>
                                        </div>
                                    </section>
                                </form>
                            </TabPanel>
                            <TabPanel header="Extra" leftIcon="pi pi-plus-circle mr-2">
                                <form className="form-body form-body--create">
                                    <section>
                                        <div className="form-group-label">
                                            <i className="pi pi-comment"></i>
                                            <label>Comentarios</label>
                                        </div>
                                        <div className="form-body-group">
                                            <div className="form-group">
                                                <label>Comentarios</label>
                                                <textarea readOnly={!isEditing} type="text" name="notas" value={propietario?.notas || ''} onChange={handleInputChange} maxLength="1000" placeholder="Comentarios relacionados al propietario (máx. 1000 caracteres)" />
                                            </div>
                                        </div>
                                    </section>
                                </form>
                            </TabPanel>
                            <TabPanel header="Apoderados" leftIcon="pi pi-users mr-2">
                                <form className="form-body form-body--create">
                                    <section>
                                        <div className="form-group-label">
                                            <i className="pi pi-users"></i>
                                            <label>Apoderados</label>
                                        </div>
                                        <div className="form-body-group">
                                            <div className="form-group form-group-single">
                                                <label>Apoderado</label>
                                                <div style={{ display: 'flex', flexDirection: 'row', gap: '10px' }}>
                                                    <div style={{ width: '100%' }}>
                                                        {
                                                            errorA || !abogados ? (
                                                                <div className="dropdown-error">
                                                                    <div className="dropdown-error-msg">
                                                                        {isLoadingA || (isRefreshing && isValidatingA) ?
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
                                                                    style={{ width: '100%' }}
                                                                    value={selectedAbogado}
                                                                    onChange={(e) => setSelectedAbogado(e.value)}
                                                                    options={abogados}
                                                                    optionLabel="nombre"
                                                                    placeholder="Selecciona un abogado"
                                                                    filter
                                                                    virtualScrollerOptions={{ itemSize: 38 }}
                                                                    valueTemplate={selectedValueTemplateA}
                                                                    itemTemplate={optionTemplateA}
                                                                />
                                                            )
                                                        }
                                                    </div>
                                                    <button disabled={!isEditing} className='rounded-icon-btn' onClick={handleAddAbogado}>
                                                        <i className="pi pi-user-plus" style={{ color: 'white', fontSize: '16px' }}></i>
                                                    </button>
                                                </div>
                                            </div>
                                            <table className="table-list">
                                                <thead>
                                                    <tr className="table-head">
                                                        <th>Apoderados agregados ({apoderados?.length})</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {apoderados && apoderados.map((abogado, index) => (
                                                        <tr className="table-row" key={index}>
                                                            <td className="table-nombre-abogado">{abogado.nombre} {abogado.apellido}</td>
                                                            <td className="table-delete-button">
                                                                <button disabled={!isEditing} className="rounded-icon-btn" onClick={(e) => handleDeleteAbogado(e, abogado)}>
                                                                    <i className="pi pi-delete-left" style={{ color: 'white', fontSize: '16px' }}></i>
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>

                                    </section>
                                </form>
                            </TabPanel>
                            <TabPanel header="Documentos" leftIcon="pi pi-paperclip mr-2">
                                <div className="form-info-msg" style={{ paddingBottom: '0' }}>
                                    <i className="pi pi-exclamation-circle" style={{ fontSize: '0.8rem', margin: '0', color: 'var(--secondary-blue)', fontWeight: '600' }}></i>
                                    <span>Por favor, permanezca en la pestaña para conservar cualquier cambio y archivo seleccionado</span>
                                </div>
                                <section className="form-body form-body--create">
                                    <DocumentViewer type="documentos" tablaConexion="propietario" idConexion={props.propietarioId} />
                                    <DocumentViewer type="correos" tablaConexion="propietario" idConexion={props.propietarioId} />
                                </section>
                            </TabPanel>
                        </TabView>
                        <div className="center-hr">
                            <hr />
                        </div>
                        <section className="form-footer">
                            <div className="form-UD-btns">
                                <button className="form-cancel-btn" onClick={handleCancel}>Cancelar</button>
                                <ToggleButton onLabel="Leer" offLabel="Editar" onIcon="pi pi-eye" offIcon="pi pi-pencil"
                                    checked={isEditing} onChange={(e) => dispatch(setIsEditing(e.value))} />
                            </div>
                            {(isAnyEmpty && isEditing) &&
                                <div className="empty-fields-msg">
                                    <i className="pi pi-exclamation-circle" style={{ fontSize: '0.8rem', margin: '0', color: 'var(--secondary-blue)', fontWeight: '600' }}></i>
                                    <span>Por favor, llena todos los datos <strong>requeridos</strong></span>
                                </div>
                            }
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

export default PropietariosDetails;