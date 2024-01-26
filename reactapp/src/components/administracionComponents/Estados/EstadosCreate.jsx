import React, { useState, useRef, useEffect } from 'react';
import Draggable from 'react-draggable';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { Dropdown } from 'primereact/dropdown';
import { useEstados } from '../../../services/useEstados'; // EDITABLE
import { useTiposEstados } from '../../../services/useTiposEstados';
import { useSelector, useDispatch } from 'react-redux';
import { saveData, deleteData } from '../../../context/estadoSlice'; //EDITABLE
const apiEndpoint = import.meta.env.VITE_MAIN_ENDPOINT;
const API_BASE_URL = `${apiEndpoint}/Estados`;

// Auth
import { useMsal } from '@azure/msal-react';

function EstadosCreate({ onClose }) { //EDITABLE

    // --------------- Redux store settings -------------------------------------------------------

    const dispatch = useDispatch();
    const estadoCreateData = useSelector(state => state.estado.EstadoCreate); // EDITABLE
    const { tiposEstados, error, isLoading, isValidating, refresh } = useTiposEstados(); // EDITABLE
    const [sortedTiposEstados, setSortedTiposEstados] = useState(tiposEstados);

    // --------------- Setup (Servicios, Contextos, Referencias) -----------------------------------

    // Auth
    const { instance, accounts } = useMsal();
    const { createEstado } = useEstados(); // Servicio necesario: EDITABLE
    const isClosingRef = useRef(false); // Referencia para eliminar persistencia: EDITABLE
    const toast = useRef(null); // Referencia para el toast: GENERAL

    // --------------- Estados que no requieren persistencia --------------------------------------------

    const [isLoading2, setIsLoading2] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const colorOptions = [
        { name: "Negro", value: "#2D3748" },
        { name: "Rojo", value: "#E53E3E" },
        { name: "Verde", value: "#2F855A" },
        { name: "Azul", value: "#2B6CB0" },
        { name: "Amarillo", value: "#D69E2E" },
        { name: "Naranja", value: "#DD6B20" },
        { name: "Púrpura", value: "#6B46C1" },
        { name: "Cian", value: "#319795" },
        { name: "Marrón", value: "#975A16" },
        { name: "Rosa", value: "#D53F8C" }
    ];
    const defaultNewEstado = {
        codigo: '',
        descripcionEspanol: '',
        descripcionIngles: '',
        color: '#2D3748',
        tipoEstadoId: '',
    }; //EDITABLE
    const defaultEmptyFields = {
        codigo: false,
        descripcionEspanol: false,
        descripcionIngles: false,
        tipoEstadoId: false,
    }; // EDITABLE

    // --------------- Estados que requieren persistencia --------------------------------------------

    const [selectedTipoEstado, setSelectedTipoEstado] = useState(null); // saber el tipo de estado seleccionado: ESPECIFICO
    const [selectedColor, setSelectedColor] = useState(colorOptions[0].value); // saber el color seleccionado: ESPECIFICO
    const [isAnyEmpty, setisAnyEmpty] = useState(false); //Saber si hay campos vacíos: GENERAL
    const [newEstado, setNewEstado] = useState(defaultNewEstado);// mapea el objeto: ESPECIFICO
    const [emptyFields, setEmptyFields] = useState(defaultEmptyFields); // mapea los inputs requeridos: GENERAL

    // --------------- Funciones necesarias para persistencia ----------------------------------------

    useEffect(() => {
        if (estadoCreateData) { // EDITABLE
            setSelectedTipoEstado(estadoCreateData.selectedTipoEstado || null); // EDITABLE
            setSelectedColor(estadoCreateData.selectedColor || colorOptions[0].value); // EDITABLE
            setisAnyEmpty(estadoCreateData.isAnyEmpty || false); // EDITABLE
            setNewEstado(estadoCreateData.newEstado || defaultNewEstado); // EDITABLE
            setEmptyFields(estadoCreateData.emptyFields || defaultEmptyFields); // EDITABLE
        }
    }, []); // Se ejecuta cuando el componente renderiza, lee los datos guardados: GENERAL
    const saveState = () => {
        dispatch(saveData({ objectName: 'EstadoCreate', value: { isAnyEmpty, newEstado, emptyFields, selectedTipoEstado, selectedColor } }));
    }; // Guarda en el contexto los estados como objetos: ESPECIFICO
    useEffect(() => {
        return () => {
            if (!isClosingRef.current) {
                saveState();
            }
        };
    }, [isAnyEmpty, newEstado, emptyFields, selectedTipoEstado, selectedColor]); // Se ejecuta con cada cambio de estado, persiste los datos: ESPECIFICO -> PUEDE OPTIMIZARSE
    const deletePersistedStates = () => {
        dispatch(deleteData({ objectName: 'EstadoCreate' })); // EDITABLE
    }; // Elimina los datos en el objeto del contexto: ESPECIFICO

    // --------------- Funciones especificas del componente ------------------------------------------

    useEffect(() => {
        if (tiposEstados) {
            const sortedOptions = tiposEstados.sort((a, b) => a.tipoEstadoId - b.tipoEstadoId);
            setSortedTiposEstados([...sortedOptions]);
        }
    }, [tiposEstados]);

    // ################ DROPDOWNS ####################################
    useEffect(() => {
        if (selectedTipoEstado) {
            setNewEstado(prevEstado => ({
                ...prevEstado,
                tipoEstadoId: selectedTipoEstado.tipoEstadoId
            }));
        }
    }, [selectedTipoEstado]); // Actualiza el objeto cuando el valor del dropdown cambia (hacer uno por cada dropdown): ESPECIFICO
    useEffect(() => {
        if (selectedColor) {
            setNewEstado(prevEstado => ({
                ...prevEstado,
                color: selectedColor
            }));
        }
    }, [selectedColor]); // Actualiza el objeto cuando el valor del dropdown cambia (hacer uno por cada dropdown): ESPECIFICO
    const refreshData = (e) => {
        e.preventDefault();
        setIsRefreshing(true);
        refresh();
    }; // Refresca los datos: GENERAL
    useEffect(() => {
        if (isRefreshing) {
            setIsRefreshing(false);
        }
    }, [isValidating]); // Cambia el estado de refreshing: GENERAL
    const colorOptionTemplate = (option) => {
        return (
            <div className="dropdown-item-container">
                <div className="dropdown-color-options" style={{ backgroundColor: option.value }}>

                </div>
                <div>{option.name}</div>
            </div>
        );
    };
    const selectedColorTemplate = (option, props) => {
        if (option) {
            return (
                <div className="dropdown-item-container">
                    <div className="dropdown-color-options" style={{ backgroundColor: option.value }}>

                    </div>
                    <div>{option.name}</div>
                </div>
            );
        }

        return (
            <div className="dropdown-item-container">
                <div className="dropdown-color-options" style={{ backgroundColor: colorOptions[0].value }}>

                </div>
                <div>{colorOptions[0].name}</div>
            </div>
        );
    };
    const tipoEstadoOptionTemplate = (option) => {
        return (
            <div className="dropdown-item-container">
                <span className="">{option.displayName}</span>
            </div>
        );
    };
    const selectedTipoEstadoTemplate = (option, props) => {
        if (option) {
            return (
                <div className="dropdown-item-container">
                    <span className="">{option.displayName}</span>
                </div>
            );
        }

        return <span>{props.placeholder}</span>;
    };

    // ################ FIN DROPDOWNS ####################################

    const handleInputChange = (e) => {
        const { name, value } = e.target;

        // Only update the state if the input is not 'codigo' or if it is 'codigo' and the value matches the allowed pattern
        if (name !== 'codigo' || (name === 'codigo' && /^[0-9.]*$/.test(value))) {
            const updatedEmptyFields = { ...emptyFields };
            updatedEmptyFields[name] = false;
            setEmptyFields(updatedEmptyFields);

            setNewEstado({ ...newEstado, [name]: value });
        }
    }; // Maneja el cambio en un input: ESPECIFICO
    const isAnyFieldEmpty = () => {
        return Object.values(newEstado).some(value => {
            if (value === null || value === undefined) {
                return true; // Consider null or undefined as empty
            }
            if (typeof value === 'string') {
                return value.trim() === ''; // Check for empty strings after trimming
            }
            if (typeof value === 'number') {
                return isNaN(value) || value === 0; // Check if it's NaN or 0, if you consider 0 as empty
            }
            // Return false if none of the above conditions are met (value is not empty)
            return false;
        });
    }; // Verifica si existe un campo del objeto vacío: ESPECIFICO
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
        // Verificar si existe algun campo vacío
        if (isAnyFieldEmpty()) {
            const updatedEmptyFields = {};

            for (const field in newEstado) {
                if (newEstado[field] === null || newEstado[field] === undefined) {
                    updatedEmptyFields[field] = true;
                } else if (typeof newEstado[field] === 'string' && newEstado[field].trim() === '') {
                    updatedEmptyFields[field] = true;
                } else if (typeof newEstado[field] === 'number' && isNaN(newEstado[field])) {
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

        // Verificar que no exista un objeto con el mismo codigo ya
        try {
            
            const accessToken = await getAccessToken();
            const response = await fetch(`${API_BASE_URL}/${newEstado.codigo}`, {
                method: 'GET',
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            });
            if (response.status === 404) {
                // Intentar el request usando el servicio
                try {
                    setIsLoading2(true);
                    const response = await createEstado(newEstado); // EDITABLE

                    if (response === 201) {
                        toast.current.show({
                            severity: 'success',
                            summary: 'Proceso exitoso',
                            detail: 'Estado creado con éxito', // EDITABLE
                            life: 3000,
                        });
                        resetStates();
                    }
                } catch (error) {
                    toast.current.show({
                        severity: 'error',
                        summary: 'Error',
                        detail: 'Hubo un error al crear el estado', // EDITABLE
                        life: 3000,
                    });
                } finally {
                    setIsLoading2(false);
                }
            } else {
                toast.current.show({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'El código que intenta ingresar, ya existe', // EDITABLE
                    life: 3000,
                });
            }
        } catch (error) {

        }

    }; // Maneja la creación del objeto: ESPECIFICO
    const resetStates = () => {
        setisAnyEmpty(false);
        setNewEstado(defaultNewEstado); // EDITABLE
        setEmptyFields(defaultEmptyFields);
        setSelectedTipoEstado(null);
        setSelectedColor(colorOptions[0].value);
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
                        <span>Crear nuevo estado</span> 
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
                            <label htmlFor="codigo">Código <small className="requiredAsterisk">(Obligatorio)</small></label>
                            <input className={`${emptyFields.codigo && 'form-group-empty'}`} type="text" id="codigo" name="codigo" value={newEstado.codigo || ''} onChange={handleInputChange} required maxLength="8" placeholder="Código único del estado"/>
                        </div>
                        <div className="form-group">
                            <label htmlFor="descripcionEspanol">Descripción en español <small className="requiredAsterisk">(Obligatorio)</small></label>
                            <textarea className={`${emptyFields.descripcionEspanol && 'form-group-empty'}`} id="descripcionEspanol" name="descripcionEspanol" value={newEstado.descripcionEspanol || ''} onChange={handleInputChange} required maxLength="1000" placeholder="Descripción del estado en español" />
                        </div>
                        <div className="form-group">
                            <label htmlFor="descripcionIngles">Descripción en inglés <small className="requiredAsterisk">(Obligatorio)</small></label>
                            <textarea className={`${emptyFields.descripcionIngles && 'form-group-empty'}`} id="descripcionIngles" name="descripcionIngles" value={newEstado.descripcionIngles || ''} onChange={handleInputChange} required maxLength="1000" placeholder="Descripción del estado en inglés" />
                        </div>
                        <div className="form-group">
                            <label>Tipo de estado <small className="requiredAsterisk">(Obligatorio)</small></label>
                            <div>
                                {
                                    error || !tiposEstados ? (
                                        <div className="dropdown-error">
                                            <div className="dropdown-error-msg">
                                                {isLoading || (isRefreshing && isValidating) ?
                                                    <div className="small-spinner" /> :
                                                    <span>Ocurrió un error: sin opciones disponibles</span>}
                                            </div>
                                            <Button className="rounded-icon-btn" onClick={refreshData}>
                                                <i className="pi pi-refresh" style={{ fontSize: '0.8rem', margin: '0' }}></i>
                                            </Button>
                                        </div>
                                    ) : (
                                        <Dropdown
                                            className={`${emptyFields.tipoEstadoId && 'form-group-empty'}`}
                                            style={{ width: '100%' }}
                                            value={selectedTipoEstado}
                                            onChange={(e) => setSelectedTipoEstado(e.value)}
                                            options={sortedTiposEstados}
                                            optionLabel="displayName"
                                            placeholder="Selecciona un tipo de estado"
                                            filter
                                            virtualScrollerOptions={{ itemSize: 38 }}
                                            valueTemplate={selectedTipoEstadoTemplate}
                                            itemTemplate={tipoEstadoOptionTemplate}
                                        />
                                    )
                                }
                            </div>
                        </div>
                        <div className="form-group">
                            <label>Color</label>
                            <div>
                                <Dropdown
                                    className={`${emptyFields.color && 'form-group-empty'}`}
                                    style={{ width: '100%' }}
                                    inputId="estadoColor"
                                    value={selectedColor}
                                    onChange={(e) => setSelectedColor(e.value)}
                                    options={colorOptions}
                                    optionLabel="name"
                                    placeholder="Selecciona un color"
                                    virtualScrollerOptions={{ itemSize: 38 }}
                                    valueTemplate={selectedColorTemplate}
                                    itemTemplate={colorOptionTemplate} />
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
                        <button style={error && {backgroundColor: 'var(--even-darker-gray)'}} disabled={error} type="submit" className="form-accept-btn" onClick={handleCreate}>Crear</button>
                    </section>
                </div>
            </Draggable>
            <Toast ref={toast} />
        </>
    );
}

export default EstadosCreate;