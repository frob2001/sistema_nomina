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
import { saveData, deleteData, setIsEditing } from '../../../context/clienteSlice'; // EDITABLE
import { resetStateD, resetRefreshSwitch } from '../../../context/contactoDSlice'; // Para cerrar todo lo de contactos

// Components
import ContactosTableD from '../ContactosCliente/ContactosTableD';
import DocumentViewer from '../../miscComponents/Documents/DocumentViewer';
import ComparacionHandler from '../../miscComponents/Comparaciones/ComparacionHandler';

// Services
const apiEndpoint = import.meta.env.VITE_MAIN_ENDPOINT;
const API_BASE_URL = `${apiEndpoint}/Clientes`;
import { useClientes } from '../../../services/useClientes'; // EDITABLE: MAIN
import { usePaises } from '../../../services/usePais'; // EDITABLE: DROPDOWN
import { useIdiomas } from '../../../services/useIdiomas'; // EDITABLE: DROPDOWN
// Auth
import { useMsal } from '@azure/msal-react';



function ClientesDetails(props) { // EDITABLE

    // --------------- Redux store settings -------------------------------------------------------

    const dispatch = useDispatch();
    const clientesDetailsData = useSelector(state => state.cliente.ClienteDetails); // EDITABLE: guarda los datos de persistencia
    const isEditing = useSelector(state => state.cliente.isEditing); // EDITABLE: guarda si se está editando o no
    const refreshSwitch = useSelector(state => state.contactoD.wasRefreshed); // Verifica si hubo un cambio en contactos

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
    const { data: clienteData, error, isLoading, mutate: refresh } = useSWR(`${API_BASE_URL}/${props.clienteId}`, fetcher); // SWR para los datos: EDITABLE
    const { deleteObject, updateObject } = useClientes(); // Para editar y eliminar un objeto: EDITABLE
    const prevClienteIdRef = useRef(props.clienteId); // Referencia para saber si el usuario selecciona otro objeto: EDITABLE

    const { paises, error: errorP, isLoading: isLoadingP, isValidating: isValidatingP, refresh: refreshP } = usePaises(); // Para el dropdown de paises
    const { idiomas, error: errorI, isLoading: isLoadingI, isValidating: isValidatingI, refresh: refreshI } = useIdiomas(); // Para el dropdown de idiomas

    // --------------- Estados que no requieren persistencia --------------------------------------------

    const [isLoading2, setIsLoading2] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const defaultRequiredFields = {
        nombre: false,
        pais: false,
        ciudad: false,
        idioma: false
    }; // EDITABLE: solo los campos requeridos

    // --------------- Estados que requieren persistencia --------------------------------------------

    const [selectedPais, setSelectedPais] = useState(clienteData?.pais); // saber el pais seleccionado: ESPECIFICO
    const [selectedIdioma, setSelectedIdioma] = useState(clienteData?.idioma); // saber el idioma seleccionado: ESPECIFICO

    const [isAnyEmpty, setisAnyEmpty] = useState(false); // Saber si hay campos vacíos: GENERAL
    const [requiredFields, setRequiredFields] = useState(defaultRequiredFields); // mapea los inputs requeridos: GENERAL

    const [cliente, setCliente] = useState({}); // Tiene el objeto seleccionado: ESPECIFICO
    const [activeIndex, setActiveIndex] = useState(0); // Conoce el indice de tab activo para el tabview

    // --------------- Funciones necesarias para persistencia ----------------------------------------

    useEffect(() => {
        if (clientesDetailsData) {
            setSelectedPais(clientesDetailsData.selectedPais || clienteData?.pais); // EDITABLE
            setSelectedIdioma(clientesDetailsData.selectedIdioma || clienteData?.idioma); // EDITABLE
            setisAnyEmpty(clientesDetailsData.isAnyEmpty || false); // EDITABLE
            setCliente(clientesDetailsData.cliente || {}); // EDITABLE
            setRequiredFields(clientesDetailsData.requiredFields || defaultRequiredFields); // EDITABLE
            setActiveIndex(clientesDetailsData.activeIndex || 0); // EDITABLE
        }
    }, []); // Se ejecuta cuando el componente renderiza, lee los datos guardados: ESPECIFICO
    const saveState = () => {
        dispatch(saveData({ objectName: 'ClienteDetails', value: { selectedPais, selectedIdioma, isAnyEmpty, requiredFields, cliente, activeIndex  } }));
    }; // Guarda en el store los estados como objetos: ESPECIFICO
    useEffect(() => {
        return () => {
            if (!isClosingRef.current) {
                saveState();
            }
        };
    }, [selectedPais, selectedIdioma, isAnyEmpty, requiredFields, cliente, activeIndex, isEditing]); // Se ejecuta con cada cambio de estado, persiste los datos: ESPECIFICO -> PUEDE OPTIMIZARSE
    const deletePersistedStates = () => {
        dispatch(deleteData({ objectName: 'ClienteDetails' }));
    }; // Elimina los datos en el objeto del contexto: ESPECIFICO

    // --------------- Funciones especificas del componente ------------------------------------------

    useEffect(() => {
        if (refreshSwitch) {
            refresh();
            dispatch(setIsEditing(false));
            dispatch(resetRefreshSwitch());
        }
    }, [refreshSwitch]) // Refresca el contacto cuando algo en contactos cambió

    // ------------------ DROPDOWNS ---------------------------------------

    useEffect(() => {
        if (selectedPais) {
            setCliente(prev => ({
                ...prev,
                pais: selectedPais
            }));
        }
    }, [selectedPais]); // Actualiza el objeto cuando el valor del dropdown cambia (hacer uno por cada dropdown): ESPECIFICO

    useEffect(() => {
        if (selectedIdioma) {
            setCliente(prev => ({
                ...prev,
                idioma: selectedIdioma
            }));
        }
    }, [selectedIdioma]); // Actualiza el objeto cuando el valor del dropdown cambia (hacer uno por cada dropdown): ESPECIFICO

    const refreshData = (e) => {
        e.preventDefault();
        setIsRefreshing(true);
        refreshP();
        refreshI();
    }; // Refresca los datos del los dropdowns: GENERAL

    useEffect(() => {
        if (isRefreshing) {
            setIsRefreshing(false);
        }
    }, [isValidatingP, isValidatingI]); // Cambia el estado de refreshing: GENERAL

    // ------------------ FIN DROPDOWNS ---------------------------------------

    useEffect(() => {
        if (props.clienteId !== prevClienteIdRef.current) {
            if (clienteData) {
                setCliente(clienteData); // EDITABLE
                setSelectedPais(clienteData.pais);
                setSelectedIdioma(clienteData.idioma);
                setisAnyEmpty(false);
                setRequiredFields(defaultRequiredFields);
                prevClienteIdRef.current = props.clienteId;
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
                    if (clienteData) {
                        setCliente(clienteData); // EDITABLE
                        setSelectedPais(clienteData.pais);
                        setSelectedIdioma(clienteData.idioma);
                        setisAnyEmpty(false);
                        setRequiredFields(defaultRequiredFields);
                    }
                }
            }
        }
    }, [clienteData, isEditing, props.clienteId]); // useEffect para escuchar cambios en estadoData y mapearlos al objeto, solo si no se está editando: ESPECIFICO
    const handleInputChange = (e) => {
        const { name, value } = e.target;

        // Check if the input name is a key in the requiredFields
        if (requiredFields.hasOwnProperty(name)) {
            const updatedRequiredFields = { ...requiredFields };
            updatedRequiredFields[name] = false; // Reset to false if the required field has been edited
            setRequiredFields(updatedRequiredFields);
        }

        // Update the newCliente state with the new value
        setCliente(prevCliente => ({ ...prevCliente, [name]: value }));

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
            const response = await deleteObject(props.clienteId); // EDITABLE
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
    };
 // Verifica si un valor específico está vacío

    const validateRequiredFields = (cliente) => {
        const updatedRequiredFields = { ...defaultRequiredFields };

        // Iterate over the required field keys
        Object.keys(updatedRequiredFields).forEach(key => {
            updatedRequiredFields[key] = isEmptyValue(cliente[key]);
        });

        setRequiredFields(updatedRequiredFields);

        // Return true if any of the required fields is empty
        return Object.values(updatedRequiredFields).some(value => value);
    }; // Valida que los campos en REQUIRED_FIELDS no estén vacíos en el nuevo objeto

    const handleEdit = async (e) => {
        e.preventDefault();

        // Verificar si existe algun campo requerido vacío
        const anyFieldEmpty = validateRequiredFields(cliente);

        if (anyFieldEmpty) {
            setisAnyEmpty(true);
            return;
        } else {
            setisAnyEmpty(false);
        }

        // Intentar el request usando el servicio
        try { 
            setIsLoading2(true);
            const clienteUpdated = {
                "nombre": cliente.nombre,
                "codigoPais": cliente.pais.codigoPais,
                "ciudad": cliente.ciudad,
                "estadoProvincia": cliente.estadoProvincia,
                "codigoIdioma": cliente.idioma.codigoIdioma,
                "direccion": cliente.direccion,
                "web": cliente.web,
                "telefono": cliente.telefono,
                "email": cliente.email,
                "notas": cliente.notas,
                "usuarioWeb": cliente.usuarioWeb,
                "claveWeb": cliente.claveWeb
            }
            const response = await updateObject(props.clienteId, clienteUpdated);

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

        // Cerrar todo lo de contactos también
        dispatch(resetStateD());

        props.onClose();
    }; // Maneja el cancelar del formulario (Datos no persisten): GENERAL
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
                            <span>{"Cliente: " + (cliente?.nombre || '')}</span>
                            <div className="form-header-buttons">
                                <Button className="form-header-btn" onClick={handleCancel}>
                                    <i className="pi pi-times" style={{ fontSize: '0.6rem', color: 'var(--secondary-blue)', fontWeight: '600' }}></i>
                                </Button>
                            </div>
                        </section>

                        <TabView activeIndex={activeIndex} onTabChange={(e) => setActiveIndex(e.index)}>
                            <TabPanel header="Cliente" leftIcon="pi pi-briefcase mr-2">
                                <form className="form-body form-body--create">
                                    <section>
                                        <div className="form-group-label">
                                            <i className="pi pi-briefcase"></i>
                                            <label>Cliente</label>
                                        </div>
                                        <div className="form-body-group">
                                            <div className="form-group">
                                                <label>Nombre <small className="requiredAsterisk">(Obligatorio)</small></label>
                                                <input readOnly={!isEditing} className={`${requiredFields.nombre && 'form-group-empty'}`} type="text" name="nombre" value={cliente?.nombre || ''} onChange={handleInputChange} required maxLength="100" placeholder="Nombre del cliente" />
                                            </div>
                                            <div className="form-group">
                                                <label>Idioma <small className="requiredAsterisk">(Obligatorio)</small></label>
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
                                                                className={`${requiredFields.idioma && 'form-group-empty'}`}
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
                                        </div>
                                    </section>
                                    <section>
                                        <div className="form-group-label">
                                            <i className="pi pi-map-marker"></i>
                                            <label>Ubicación</label>
                                        </div>
                                        <div className="form-body-group">
                                            <div className="form-group">
                                                <label>Ciudad <small className="requiredAsterisk">(Obligatorio)</small></label>
                                                <input readOnly={!isEditing} className={`${requiredFields.ciudad && 'form-group-empty'}`} type="text" name="ciudad" value={cliente?.ciudad || ''} onChange={handleInputChange} required maxLength="100" placeholder="Ciudad del cliente" />
                                            </div>
                                            <div className="form-group">
                                                <label>Provincia / Estado</label>
                                                <input readOnly={!isEditing} type="text" name="estadoProvincia" value={cliente?.estadoProvincia || ''} onChange={handleInputChange} required maxLength="100" placeholder="Provincia / Estado del cliente" />
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
                                                <label>Dirección</label>
                                                <input readOnly={!isEditing} type="text" name="direccion" value={cliente?.direccion || ''} onChange={handleInputChange} required maxLength="2000" placeholder="Dirección completa del cliente" />
                                            </div>
                                        </div>
                                    </section>
                                    <section>
                                        <div className="form-group-label">
                                            <i className="pi pi-phone"></i>
                                            <label>Contacto</label>
                                        </div>
                                        <div className="form-body-group">
                                            <div className="form-group">
                                                <label>E-mail</label>
                                                <input readOnly={!isEditing} type="email" name="email" value={cliente?.email || ''} onChange={handleInputChange} required maxLength="70" placeholder="E-mail del cliente" />
                                            </div>
                                            <div className="form-group">
                                                <label>Teléfono</label>
                                                <input readOnly={!isEditing} type="text" name="telefono" value={cliente?.telefono || ''} onChange={handleInputChange} required maxLength="70" placeholder="Teléfono del cliente" />
                                            </div>
                                        </div>
                                    </section>
                                </form>
                            </TabPanel>
                            <TabPanel header="Extra" leftIcon="pi pi-plus-circle mr-2">
                                <form className="form-body form-body--create">
                                    <section>
                                        <div className="form-group-label">
                                            <i className="pi pi-id-card"></i>
                                            <label>Cuenta</label>
                                        </div>
                                        <div className="form-body-group">
                                            <div className="form-group">
                                                <label>Portal web</label>
                                                <input readOnly={!isEditing} type="text" name="web" value={cliente?.web || ''} onChange={handleInputChange} required maxLength="200" placeholder="Dirección del portal web" />
                                            </div>
                                            <div className="form-group">
                                                <label>Usuario del portal</label>
                                                <input readOnly={!isEditing} type="text" name="usuarioWeb" value={cliente?.usuarioWeb || ''} onChange={handleInputChange} required maxLength="100" placeholder="Usuario para el portal web" />
                                            </div>
                                            <div className="form-group">
                                                <label>Contraseña del portal</label>
                                                <input readOnly={!isEditing} type="text" name="claveWeb" value={cliente?.claveWeb || ''} onChange={handleInputChange} required maxLength="100" placeholder="Contraseña para el portal web" />
                                            </div>
                                        </div>
                                    </section>
                                    <section>
                                        <div className="form-group-label">
                                            <i className="pi pi-comment"></i>
                                            <label>Comentarios</label>
                                        </div>
                                        <div className="form-body-group">
                                            <div className="form-group">
                                                <label>Comentarios</label>
                                                <textarea readOnly={!isEditing} type="text" name="notas" value={cliente?.notas || ''} onChange={handleInputChange} maxLength="1000" placeholder="Comentarios relacionados al cliente (máx. 1000 caracteres)" />
                                            </div>
                                        </div>
                                    </section>
                                </form>
                            </TabPanel>
                            <TabPanel header="Contactos" leftIcon="pi pi-user mr-2">
                                <section className="form-body form-body--create">
                                    <ContactosTableD contactosPre={cliente?.contactos} clienteSelected={cliente} />
                                </section>
                            </TabPanel>
                            <TabPanel header="Comparación" leftIcon="pi pi-verified mr-2">
                                <ComparacionHandler clienteId={props.clienteId} />
                            </TabPanel>
                            <TabPanel header="Documentos" leftIcon="pi pi-paperclip mr-2">
                                <div className="form-info-msg" style={{ paddingBottom: '0' }}>
                                    <i className="pi pi-exclamation-circle" style={{ fontSize: '0.8rem', margin: '0', color: 'var(--secondary-blue)', fontWeight: '600' }}></i>
                                    <span>Por favor, permanezca en la pestaña para conservar cualquier cambio y archivo seleccionado</span>
                                </div>
                                <section className="form-body form-body--create">
                                    <DocumentViewer type="documentos" tablaConexion="cliente" idConexion={props.clienteId} />
                                    <DocumentViewer type="correos" tablaConexion="cliente" idConexion={props.clienteId} />
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

export default ClientesDetails;