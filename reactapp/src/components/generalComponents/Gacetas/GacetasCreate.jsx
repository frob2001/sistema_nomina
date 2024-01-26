import React, { useState, useRef, useEffect } from 'react';
import Draggable from 'react-draggable';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { Dropdown } from 'primereact/dropdown';

// Redux
import { useSelector, useDispatch } from 'react-redux';
import { saveData, deleteData } from '../../../context/gacetaSlice'; //EDITABLE

// Servicios
import { useGacetas } from '../../../services/useGacetas'; // EDITABLE
import { usePaises } from '../../../services/usePais'; // EDITABLE: DROPDOWN
const apiEndpoint = import.meta.env.VITE_MAIN_ENDPOINT;
const API_BASE_URL = `${apiEndpoint}/Gacetas`; //Para chequear que no exista otra gaceta con ese codigo
// Auth
import { useMsal } from '@azure/msal-react';


function GacetasCreate({ onClose }) { //EDITABLE

    // --------------- Redux store settings -------------------------------------------------------

    const dispatch = useDispatch();
    const gacetaCreateData = useSelector(state => state.gaceta.GacetaCreate); 

    // --------------- Setup (Servicios, Contextos, Referencias) -----------------------------------

    // Auth
    const { instance, accounts } = useMsal();
    const { createObject } = useGacetas(); // Servicio necesario: EDITABLE
    const isClosingRef = useRef(false); // Referencia para eliminar persistencia: EDITABLE
    const toast = useRef(null); // Referencia para el toast: GENERAL

    const { paises, error: errorP, isLoading: isLoadingP, isValidating: isValidatingP, refresh: refreshP } = usePaises(); // Para el dropdown de paises

    // --------------- Estados que no requieren persistencia --------------------------------------------

    const [isLoading2, setIsLoading2] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const defaultNewGaceta = {
        numero: '',
        fecha: '',
        codigoPais: '',
        urlGaceta: '',
    }; //EDITABLE
    const defaultRequiredFields = {
        numero: false,
        codigoPais: false,
        urlGaceta: false,
        fecha: false,
    }; // EDITABLE

    // --------------- Estados que requieren persistencia --------------------------------------------

    const [selectedPais, setSelectedPais] = useState(null); // saber el pais seleccionado: ESPECIFICO
    const [isAnyEmpty, setisAnyEmpty] = useState(false); //Saber si hay campos vacíos: GENERAL
    const [newGaceta, setNewGaceta] = useState(defaultNewGaceta);// mapea el objeto: ESPECIFICO
    const [requiredFields, setRequiredFields] = useState(defaultRequiredFields); // mapea los inputs requeridos: GENERAL

    // --------------- Funciones necesarias para persistencia ----------------------------------------

    useEffect(() => {
        if (gacetaCreateData) { // EDITABLE
            setSelectedPais(gacetaCreateData.selectedPais || null); // EDITABLE
            setisAnyEmpty(gacetaCreateData.isAnyEmpty || false); // EDITABLE
            setNewGaceta(gacetaCreateData.newGaceta || defaultNewGaceta); // EDITABLE
            setRequiredFields(gacetaCreateData.requiredFields || defaultRequiredFields); // EDITABLE
        }
    }, []); // Se ejecuta cuando el componente renderiza, lee los datos guardados: GENERAL
    const saveState = () => {
        dispatch(saveData({ objectName: 'GacetaCreate', value: { selectedPais, isAnyEmpty, newGaceta, requiredFields } }));
    }; // Guarda en el contexto los estados como objetos: ESPECIFICO
    useEffect(() => {
        return () => {
            if (!isClosingRef.current) {
                saveState();
            }
        };
    }, [selectedPais, isAnyEmpty, newGaceta, requiredFields]); // Se ejecuta con cada cambio de estado, persiste los datos: ESPECIFICO -> PUEDE OPTIMIZARSE
    const deletePersistedStates = () => {
        dispatch(deleteData({ objectName: 'GacetaCreate' })); // EDITABLE
    }; // Elimina los datos en el objeto del contexto: ESPECIFICO

    // --------------- Funciones especificas del componente ------------------------------------------

    // ------------------ DROPDOWNS ---------------------------------------

    useEffect(() => {
        if (selectedPais) {
            setNewGaceta(prev => ({
                ...prev,
                codigoPais: selectedPais.codigoPais
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

    const handleInputChange = (e) => {
        const { name, value } = e.target;

        // Check if the input name is a key in the requiredFields
        if (requiredFields.hasOwnProperty(name)) {
            const updatedRequiredFields = { ...requiredFields };
            updatedRequiredFields[name] = false; // Reset to false if the required field has been edited
            setRequiredFields(updatedRequiredFields);
        }

        // Update the object state with the new value
        setNewGaceta(prev => ({ ...prev, [name]: value }));

    }; // Maneja el cambio en un input: ESPECIFICO

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

    const handleCreate = async (e) => {
        e.preventDefault();

        // Verificar si existe algun campo requerido vacío
        const anyFieldEmpty = validateRequiredFields(newGaceta);

        if (anyFieldEmpty) {
            setisAnyEmpty(true);
            return;
        } else {
            setisAnyEmpty(false);
        }

        const accessToken = await getAccessToken();
        // Verificar que no exista un objeto con el mismo numero ya
        const responseVerif = await fetch(`${API_BASE_URL}/${newGaceta.numero}`, {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        });
        if (responseVerif.ok) {
            // Response status is 2xx, a gaceta with the same number already exists
            toast.current.show({
                severity: 'error',
                summary: 'Error',
                detail: 'El número de gaceta que intenta ingresar, ya existe',
                life: 3000,
            });
            return;
        }

        

        try {
            setIsLoading2(true);
            const response = await createObject(newGaceta); // EDITABLE: usa el servicio para crear

            if (response === 201) {
                toast.current.show({
                    severity: 'success',
                    summary: 'Proceso exitoso',
                    detail: 'Gaceta creada con éxito', // EDITABLE
                    life: 3000,
                });
                resetStates();
            }
        } catch (error) {
            toast.current.show({
                severity: 'error',
                summary: 'Error',
                detail: 'Hubo un error al crear la gaceta', // EDITABLE
                life: 3000,
            });
        } finally {
            setIsLoading2(false);
        }

    }; // Maneja la creación del objeto: ESPECIFICO

    const resetStates = () => {
        setisAnyEmpty(false);
        setNewGaceta(defaultNewGaceta); // EDITABLE
        setRequiredFields(defaultRequiredFields);
        setSelectedPais(null);
    } // Resetea los estados del componente: ESPECIFICO
    const handleCancel = () => {
        isClosingRef.current = true;
        deletePersistedStates();
        onClose();
    }; // Maneja el cancelar del formulario (Datos no persisten): GENERAL
    const handleMinimize = () => {
        isClosingRef.current = false; 
        onClose();
    }; // Maneja el minimizar del formulario (Datos persisten): GENERAL
    

    // -----------------------------------------------------------------------------------------------

    return (
        <>
            <Draggable cancel="input, button, textarea" bounds="parent">
                <div className="form-container">
                    {(isLoading2) &&
                        <div className="spinner-container">
                            <div className="spinner" />
                        </div>
                    }
                    <section className="form-header">
                        <span>Crear nueva gaceta</span> 
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
                            <label>Número <small className="requiredAsterisk">(Obligatorio)</small></label>
                            <input className={`${requiredFields.numero && 'form-group-empty'}`} type="number" name="numero" value={newGaceta.numero || ''} onChange={handleInputChange} required maxLength="6" placeholder="Número único de gaceta"/>
                        </div>
                        <div className="form-group">
                            <label>Fecha <small className="requiredAsterisk">(Obligatorio)</small></label>
                            <input className={`${requiredFields.fecha && 'form-group-empty'}`} type="date" name="fecha" value={newGaceta.fecha || ''} onChange={handleInputChange} required maxLength="6" />
                        </div>
                        <div className="form-group">
                            <label>Url <small className="requiredAsterisk">(Obligatorio)</small></label>
                            <input className={`${requiredFields.urlGaceta && 'form-group-empty'}`} type="text" name="urlGaceta" value={newGaceta.urlGaceta || ''} onChange={handleInputChange} required maxLength="300" placeholder="URL de la gaceta en el SENADI" />
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
                        <button style={errorP && { backgroundColor: 'var(--even-darker-gray)' }} disabled={errorP} type="submit" className="form-accept-btn" onClick={handleCreate}>Crear</button>
                    </section>
                </div>
            </Draggable>
            <Toast ref={toast} />
        </>
    );
}

export default GacetasCreate;