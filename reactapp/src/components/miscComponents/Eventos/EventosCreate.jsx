import React, { useState, useEffect, useRef } from 'react';
import { Dropdown } from 'primereact/dropdown';
import DebounceDropdown from '../Dropdown/DebounceDropdown';
import { Toast } from 'primereact/toast';
import { Button } from 'primereact/button';

import { useTiposEventos } from '../../../services/useTiposEventos'; // Poblar el dropdown de tipos de eventos
import { useEstados } from '../../../services/useEstados'; 
import { useClases } from '../../../services/useClases'; 

const apiEndpoint = import.meta.env.VITE_MAIN_ENDPOINT;
import { useMsal } from '@azure/msal-react';

// Redux
import { useSelector, useDispatch } from 'react-redux';
import { saveData as saveDataMarca, deleteData as deleteDataMarca } from '../../../context/marcaSlice';
import { saveData as saveDataPatente, deleteData as deleteDataPatente } from '../../../context/patenteSlice';
import { saveData as saveDataAccion, deleteData as deleteDataAccion } from '../../../context/accionSlice';

function EventosCreate({ tablaConexion, idConexion, propietariosExistentes, onCreate, isClosingRef }) {

    // --------------- Redux store settings -------------------------------------------------------

    const dispatch = useDispatch();
    const detailsData = useSelector(state => {
        switch (tablaConexion) {
            case 'marca':
                return state.marca.MarcaDetails; 
            case 'patente':
                return state.patente.PatenteDetails; 
            case 'acciontercero':
                return state.accion.AccionDetails; 
            // añadir más tabla conexiones de ser necesario, para la persistencia
            default:
                return null; 
        }
    });

    // --------------- Necesario para hacer requests -----------------------------------

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
            console.error(e);
            return null;
        }
    };

    // --------------- Setup (Servicios, Contextos, Referencias) -----------------------------------

    const toast = useRef(null);
    const lastConexionIdRef = useRef(idConexion);
    const { tiposEventosMarcas, tiposEventosPatentes, tiposEventosAcciones } = useTiposEventos();
    const { estados: estadosOptions, error: errorE, isLoading: isLoadingE, isValidating: isValidatingE, refresh: refreshE } = useEstados(); 
    const { clases, error: errorC, isLoading: isLoadingC, isValidating: isValidatingC, refresh: refreshC } = useClases(); // Para el dropdown de clases
    const defaultNewEvento = {
        fecha: '',
        propietario: '',
        agente: '',
        marcaOpuesta: '',
        registro: '',
        fechaRegistro: '',
        fechaVigenciaDesde: '',
        fechaVigenciaHasta: '',
        solicitud: '',
        fechaSolicitud: ''
    };

    // --------------- Estados sin persistencia -----------------------------------

    const [isRefreshing, setIsRefreshing] = useState(false); // Para los dropdowns
    const [isLoading, setIsLoading] = useState(false); 
    const [tiposEventosDisponibles, setTiposEventosDisponibles] = useState([]);

    // --------------- Estados con persistencia -----------------------------------
    
    const [selectedTipoEventoE, setselectedTipoEventoE] = useState(null); // Qué tipo de evento se está creando
    const [selectedEstadoE, setselectedEstadoE] = useState(null);
    const [selectedClaseE, setselectedClaseE] = useState(null);
    const [selectedPropietarioG1, setSelectedPropietarioG1] = useState(null);
    const [selectedPropietarioG2, setSelectedPropietarioG2] = useState(null);
    const [propietariosG1, setPropietariosG1] = useState([]);
    const [propietariosG2, setPropietariosG2] = useState([]);
    const [newEvento, setNewEvento] = useState(defaultNewEvento); // Guarda el nuevo evento en creación

    // --------------- Funciones necesarias para persistencia ----------------------------------------

    useEffect(() => {
        if (!isClosingRef.current && idConexion !== null && idConexion !== lastConexionIdRef.current) {
            resetStates();
            setselectedTipoEventoE(null);
            lastConexionIdRef.current = idConexion;
        }
    }, [idConexion, isClosingRef]);

    const getObjectName = () => {
        switch (tablaConexion) {
            case 'marca':
                return 'MarcaDetails';
            case 'patente':
                return 'PatenteDetails';
            case 'acciontercero':
                return 'AccionDetails';
            // añadir más tabla conexiones de ser necesario, para la persistencia
            default:
                return null;
        }
    }
    useEffect(() => {
        if (detailsData) {
            setselectedTipoEventoE(detailsData.selectedTipoEventoE || null);
            setselectedEstadoE(detailsData.selectedEstadoE || null);
            setselectedClaseE(detailsData.selectedClaseE || null);
            setSelectedPropietarioG1(detailsData.selectedPropietarioG1 || null);
            setSelectedPropietarioG2(detailsData.selectedPropietarioG2 || null);
            setPropietariosG1(detailsData.propietariosG1 || []);
            setPropietariosG2(detailsData.propietariosG2 || []);
            setNewEvento(detailsData.newEvento || defaultNewEvento);
        }
    }, []); 
    const saveState = () => {
        switch (tablaConexion) {
            case 'marca':
                dispatch(saveDataMarca({
                    objectName: getObjectName(), value:
                    {
                        selectedTipoEventoE,
                        selectedEstadoE,
                        selectedClaseE,
                        selectedPropietarioG1,
                        selectedPropietarioG2,
                        propietariosG1,
                        propietariosG2,
                        newEvento
                    }
                }));
                break;
            case 'patente':
                dispatch(saveDataPatente({
                    objectName: getObjectName(), value:
                    {
                        selectedTipoEventoE,
                        selectedEstadoE,
                        selectedClaseE,
                        selectedPropietarioG1,
                        selectedPropietarioG2,
                        propietariosG1,
                        propietariosG2,
                        newEvento
                    }
                }));
                break;
            case 'acciontercero':
                dispatch(saveDataAccion({
                    objectName: getObjectName(), value:
                    {
                        selectedTipoEventoE,
                        selectedEstadoE,
                        selectedClaseE,
                        selectedPropietarioG1,
                        selectedPropietarioG2,
                        propietariosG1,
                        propietariosG2,
                        newEvento
                    }
                }));
                break;
            default:
                break;
        }
    }; 
    useEffect(() => {
        return () => {
            if (!isClosingRef.current) {
                saveState();
            }
        };
    }, [selectedTipoEventoE,
        selectedEstadoE,
        selectedClaseE,
        selectedPropietarioG1,
        selectedPropietarioG2,
        propietariosG1,
        propietariosG2,
        newEvento]);

    // --------------- Limpieza de estados -----------------------------------

    const resetStates = () => {
        setselectedEstadoE(null);
        setselectedClaseE(null);
        setSelectedPropietarioG1(null);
        setSelectedPropietarioG2(null);
        setPropietariosG1([]);
        setPropietariosG2([]);
        setNewEvento(defaultNewEvento); // Elimina el evento nuevo si se cambia de opción a una válida
    }

    // --------------- Setup para dropdowns -----------------------------------

    const refreshData = (e) => {
        e.preventDefault();
        setIsRefreshing(true);
        refreshE();
        refreshC();
    }; // Refresca los datos del los dropdowns: GENERAL
    useEffect(() => {
        if (isRefreshing) {
            setIsRefreshing(false);
        }
    }, [isValidatingE, isValidatingC]);
    const tipoEventoOptionTemplate = (option) => {
        return (
            <div className="dropdown-item-container">
                <span>{option.tipoEvento}</span>
            </div>
        );
    };
    const selectedTipoEventoETemplate = (option, props) => {
        if (option) {
            return (
                <div className="dropdown-item-container">
                    <span>{option.tipoEvento}</span>
                </div>
            );
        }

        return <span>{props.placeholder}</span>;
    };
    const optionTemplateE = (option) => {
        return (
            <div className="dropdown-item-container">
                <span style={{ color: option.color }}><strong>{option.codigo}</strong> - {option.descripcionEspanol}/{option.descripcionIngles}</span>
            </div>
        );
    }; // EDITABLE: template para mostrar las opciones de un dropdown
    const selectedValueTemplateE = (option, props) => {
        if (option) {
            return (
                <div className="dropdown-item-container">
                    <span style={{ color: option.color }}><strong>{option.codigo}</strong> - {option.descripcionEspanol}/{option.descripcionIngles}</span>
                </div>
            );
        }
        return <span>{props.placeholder}</span>;
    }; //EDITABLE: template para mostrar el valor seleccionado de un dropdown
    const optionTemplateC = (option) => {
        return (
            <div className="dropdown-item-container">
                <span><strong>Clase N° {option.codigo}</strong> {`${option.descripcionEspanol?.substring(0, 60)}...`} </span>
            </div>
        );
    }; // EDITABLE: template para mostrar las opciones de un dropdown
    const selectedValueTemplateC = (option, props) => {
        if (option) {
            return (
                <div className="dropdown-item-container">
                    <span><strong>Clase N° {option.codigo}</strong> {`${option.descripcionEspanol?.substring(0, 60)}...`}</span>
                </div>
            );
        }

        return <span>{props.placeholder}</span>;
    }; //EDITABLE: template para mostrar el valor seleccionado de un dropdown
    const optionTemplateP = (option) => {
        return (
            <div className="dropdown-item-container">
                <span><strong>{option.propietarioId}</strong> - {option.nombre}</span>
            </div>
        );
    }; // EDITABLE: template para mostrar las opciones de un dropdown
    const selectedValueTemplateP = (option, props) => {
        if (option) {
            return (
                <div className="dropdown-item-container">
                    <span><strong>{option.propietarioId}</strong> - {option.nombre}</span>
                </div>
            );
        }

        return <span>{props.placeholder}</span>;
    }; //EDITABLE: template para mostrar el valor seleccionado de un dropdown

    // --------------- Funciones para creación de objetos -----------------------------------

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewEvento(prevEvento => ({ ...prevEvento, [name]: value }));
    }; 
    const isEmptyValue = value => {
        if (value === null || value === undefined) return true;
        if (typeof value === 'string') return value.trim() === '';
        if (typeof value === 'number') return isNaN(value) || value === 0;
        if (Array.isArray(value)) return value.length === 0;
        return false;
    }; 
    const createEvento1 = async () => {
        if (isEmptyValue(selectedEstadoE) || isEmptyValue(newEvento.fecha)) {
            toast.current.show({
                severity: 'warn',
                summary: 'Alerta',
                detail: 'Por favor, llena todos los campos obligatorios',
                life: 3000,
            });
            return;
        } 

        try {
            setIsLoading(true);
            const objeto = {
                estadoCodigo: selectedEstadoE.codigo,
                fecha: newEvento.fecha,
                tablaConexion: tablaConexion,
                idConexion: idConexion
            }
            const url = `${apiEndpoint}/EventoUno`;
            const accessToken = await getAccessToken();
            const res = await fetch(url, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(objeto),
            });

            if (!res.ok) {
                throw new Error("Hubo un problema con el servidor, intenta de nuevo");
            }

            if (res.status === 201) {
                resetStates();
                setselectedTipoEventoE(null);
                onCreate();
            } else {
                throw new Error("Hubo un problema con el servidor, intenta de nuevo");
            }
        } catch (error) {
            toast.current.show({
                severity: 'error',
                summary: 'Error',
                detail: 'Hubo un error al intentar ingresar el evento',
                life: 3000,
            });
        } finally {
            setIsLoading(false);
        }
    }
    const createEvento2 = async () => {
        if (isEmptyValue(selectedEstadoE) ||
            isEmptyValue(newEvento.propietario) ||
            isEmptyValue(newEvento.agente) ||
            isEmptyValue(newEvento.marcaOpuesta) ||
            isEmptyValue(newEvento.registro) ||
            isEmptyValue(newEvento.fechaRegistro) ||
            isEmptyValue(selectedClaseE)
        ) {
            toast.current.show({
                severity: 'warn',
                summary: 'Alerta',
                detail: 'Por favor, llena todos los campos obligatorios',
                life: 3000,
            });
            return;
        }

        try {
            setIsLoading(true);
            const objeto = {
                tipoEventoId: selectedTipoEventoE.tipoEventoId,
                estadoCodigo: selectedEstadoE.codigo,
                propietario: newEvento.propietario,
                agente: newEvento.agente,
                marcaOpuesta: newEvento.marcaOpuesta,
                registro: newEvento.registro,
                fechaRegistro: newEvento.fechaRegistro,
                claseId: selectedClaseE.codigo,
                tablaConexion: tablaConexion,
                idConexion: idConexion
            }
            const url = `${apiEndpoint}/EventoDos`;
            const accessToken = await getAccessToken();
            const res = await fetch(url, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(objeto),
            });

            if (!res.ok) {
                throw new Error("Hubo un problema con el servidor, intenta de nuevo");
            }

            if (res.status === 201) {
                resetStates();
                setselectedTipoEventoE(null);
                onCreate();
            } else {
                throw new Error("Hubo un problema con el servidor, intenta de nuevo");
            }
        } catch (error) {
            toast.current.show({
                severity: 'error',
                summary: 'Error',
                detail: 'Hubo un error al intentar ingresar el evento',
                life: 3000,
            });
        } finally {
            setIsLoading(false);
        }
    }
    const createEvento3 = async () => {
        if (isEmptyValue(selectedEstadoE) ||
            isEmptyValue(newEvento.fechaVigenciaDesde) ||
            isEmptyValue(newEvento.fechaVigenciaHasta) ||
            isEmptyValue(newEvento.solicitud) ||
            isEmptyValue(newEvento.registro) ||
            isEmptyValue(newEvento.fechaSolicitud) ||
            isEmptyValue(newEvento.fechaRegistro)
        ) {
            toast.current.show({
                severity: 'warn',
                summary: 'Alerta',
                detail: 'Por favor, llena todos los campos obligatorios',
                life: 3000,
            });
            return;
        }

        // Convertir las fechas a objetos Date
        const fechaDesde = new Date(newEvento.fechaVigenciaDesde);
        const fechaHasta = new Date(newEvento.fechaVigenciaHasta);

        // Comparar las fechas
        if (fechaDesde >= fechaHasta) {
            toast.current.show({
                severity: 'warn',
                summary: 'Alerta',
                detail: 'La fecha de inicio debe ser anterior a la fecha de fin',
                life: 3000,
            });
            return;
        }

        try {
            setIsLoading(true);
            const objeto = {
                estadoCodigo: selectedEstadoE.codigo,
                fechaVigenciaDesde: newEvento.fechaVigenciaDesde,
                fechaVigenciaHasta: newEvento.fechaVigenciaHasta,
                solicitud: newEvento.solicitud,
                registro: newEvento.registro,
                fechaSolicitud: newEvento.fechaSolicitud,
                fechaRegistro: newEvento.fechaRegistro,
                tablaConexion: tablaConexion,
                idConexion: idConexion
            }
            const url = `${apiEndpoint}/EventoTres`;
            const accessToken = await getAccessToken();
            const res = await fetch(url, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(objeto),
            });

            if (!res.ok) {
                throw new Error("Hubo un problema con el servidor, intenta de nuevo");
            }

            if (res.status === 201) {
                resetStates();
                setselectedTipoEventoE(null);
                onCreate();
            } else {
                throw new Error("Hubo un problema con el servidor, intenta de nuevo");
            }
        } catch (error) {
            toast.current.show({
                severity: 'error',
                summary: 'Error',
                detail: 'Hubo un error al intentar ingresar el evento',
                life: 3000,
            });
        } finally {
            setIsLoading(false);
        }
    }
    const createEvento4 = async () => {
        if (isEmptyValue(selectedEstadoE) ||
            isEmptyValue(newEvento.solicitud) ||
            isEmptyValue(newEvento.fechaSolicitud) ||
            isEmptyValue(newEvento.registro) ||
            isEmptyValue(newEvento.fechaRegistro) ||
            isEmptyValue(propietariosG1) ||
            isEmptyValue(propietariosG2)
        ) {
            toast.current.show({
                severity: 'warn',
                summary: 'Alerta',
                detail: 'Por favor, llena todos los campos obligatorios',
                life: 3000,
            });
            return;
        }

        try {
            setIsLoading(true);
            const objeto = {
                tipoEventoId: selectedTipoEventoE.tipoEventoId,
                estadoCodigo: selectedEstadoE.codigo,
                solicitud: newEvento.solicitud,
                registro: newEvento.registro,
                fechaSolicitud: newEvento.fechaSolicitud,
                fechaRegistro: newEvento.fechaRegistro,
                grupoUnoPropietariosIds: propietariosG1.map(prop => prop.propietarioId),
                grupoDosPropietariosIds: propietariosG2.map(prop => prop.propietarioId),
                tablaConexion: tablaConexion,
                idConexion: idConexion
            }
            const url = `${apiEndpoint}/EventoCuatro`;
            const accessToken = await getAccessToken();
            const res = await fetch(url, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(objeto),
            });

            if (!res.ok) {
                throw new Error("Hubo un problema con el servidor, intenta de nuevo");
            }

            if (res.status === 201) {
                resetStates();
                setselectedTipoEventoE(null);
                onCreate();
            } else {
                throw new Error("Hubo un problema con el servidor, intenta de nuevo");
            }
        } catch (error) {
            toast.current.show({
                severity: 'error',
                summary: 'Error',
                detail: 'Hubo un error al intentar ingresar el evento',
                life: 3000,
            });
        } finally {
            setIsLoading(false);
        }
    }

    const handleEventCreation = () => {
        if (!selectedTipoEventoE) return null;

        switch (selectedTipoEventoE.tablaEvento) {
            case 'evento1':
                return createEvento1();
            case 'evento2':
                return createEvento2();
            case 'evento3':
                return createEvento3();
            case 'evento4':
                return createEvento4();
            default:
                return null;
        }
    }

    // --------------- Funciones para los grupos de propietarios -----------------------------------

    // Propietarios grupo 1
    const handleAddPropietarioG1 = (e) => {
        e.preventDefault();
        if (selectedPropietarioG1 && !propietariosG1.some(prop => prop.propietarioId === selectedPropietarioG1.propietarioId)) {
            setPropietariosG1([...propietariosG1, selectedPropietarioG1]);
            setSelectedPropietarioG1(null);
        }
    }; 
    const handleDeletePropietarioG1 = (e, object) => {
        e.preventDefault();
        const updatedPropietarios = propietariosG1.filter((item) => item !== object);
        setPropietariosG1(updatedPropietarios);
    };

    // Propietarios grupo 2
    const handleAddPropietarioG2 = (e) => {
        e.preventDefault();
        if (selectedPropietarioG2 && !propietariosG2.some(prop => prop.propietarioId === selectedPropietarioG2.propietarioId)) {
            setPropietariosG2([...propietariosG2, selectedPropietarioG2]);
            setSelectedPropietarioG2(null);
        }
    };
    const handleDeletePropietarioG2 = (e, object) => {
        e.preventDefault();
        const updatedPropietarios = propietariosG2.filter((item) => item !== object);
        setPropietariosG2(updatedPropietarios);
    };

    // --------------- Renderizado condicional de formularios y opciones -----------------------------------

    useEffect(() => {
        switch (tablaConexion) {
            case 'marca':
                setTiposEventosDisponibles(tiposEventosMarcas);
                break;
            case 'patente':
                setTiposEventosDisponibles(tiposEventosPatentes);
                break;
            case 'acciontercero':
                setTiposEventosDisponibles(tiposEventosAcciones);
                break;
            default:
                setTiposEventosDisponibles([]); 
        }
    },[tablaConexion])

    const getTitulo = () => {
        if (!selectedTipoEventoE) return null;

        if (selectedTipoEventoE.tipoEvento === 'Cambio de nombre' || selectedTipoEventoE.tipoEvento === 'Cambio de domicilio') {
            return 'Nuevo ' + selectedTipoEventoE.tipoEvento.toLowerCase();
        } else if (selectedTipoEventoE.tipoEvento === 'Otro') {
            return 'Nuevo evento simple'
        } else {
            return 'Nueva ' + selectedTipoEventoE.tipoEvento.toLowerCase();
        }
    };
    const getTituloGrupo1 = () => {
        if (!selectedTipoEventoE) return null;
        if (selectedTipoEventoE.tablaEvento !== 'evento4') return null;

        switch (selectedTipoEventoE.tipoEvento) {
            case 'Transferencia':
                return 'Cedentes';
            case 'Licencia':
                return 'Licenciantes';
            case 'Cambio de nombre':
                return 'Nombre anterior';
            case 'Cambio de domicilio':
                return 'Domicilio anterior';
            case 'Fusión':
                return 'Participantes';
            default:
                return null;
        }
    }
    const getTituloGrupo2 = () => {
        if (!selectedTipoEventoE) return null;
        if (selectedTipoEventoE.tablaEvento !== 'evento4') return null;

        switch (selectedTipoEventoE.tipoEvento) {
            case 'Transferencia':
                return 'Cesionarios';
            case 'Licencia':
                return 'Licenciatarios';
            case 'Cambio de nombre':
                return 'Nombre actual';
            case 'Cambio de domicilio':
                return 'Domicilio actual';
            case 'Fusión':
                return 'Sobrevivientes';
            default:
                return null;
        }
    }

    return (
        <>
            <Toast ref={toast}></Toast>
            <section style={{ gap: '10px' }}>
                <div className="form-group" style={{ backgroundColor: 'var(--secondary-blue)', padding: '10px', borderRadius: '10px', marginBottom: '5px'}}>
                    <label style={{ color: 'white', fontWeight: '400' }}>Selecciona un tipo de evento</label>
                    <Dropdown
                        showClear
                        style={{ width: '100%'}}
                        value={selectedTipoEventoE}
                        onChange={(e) => {
                            resetStates();
                            setselectedTipoEventoE(e.value);
                            if (e.value === undefined) {
                                resetStates();
                            }
                        }}
                        options={ tiposEventosDisponibles }
                        optionLabel="tipoEvento"
                        placeholder="Selecciona un tipo de evento"
                        filter
                        virtualScrollerOptions={{ itemSize: 38 }}
                        valueTemplate={selectedTipoEventoETemplate}
                        itemTemplate={tipoEventoOptionTemplate}
                    />
                </div>
            </section>
            <section>
                {
                    selectedTipoEventoE && 
                    <div className="form-group-label">
                        <i className="pi pi-calendar-plus"></i>
                        <label>{getTitulo()}</label>
                    </div>
                }
                <div className={selectedTipoEventoE && 'form-body-group'}>
                    {
                        (selectedTipoEventoE && selectedTipoEventoE.tablaEvento === 'evento1') &&
                        <>
                            <div className="form-group">
                                <label>Estado <small className="requiredAsterisk">(Obligatorio)</small></label>
                                <div>
                                    {
                                        errorE || !estadosOptions ? (
                                            <div className="dropdown-error">
                                                <div className="dropdown-error-msg">
                                                    {isLoadingE || (isRefreshing && isValidatingE) ?
                                                        <div className="small-spinner" /> :
                                                        <span>Ocurrió un error: sin opciones disponibles</span>}
                                                </div>
                                                <Button className="rounded-icon-btn" onClick={refreshData}>
                                                    <i className="pi pi-refresh" style={{ fontSize: '0.8rem', margin: '0' }}></i>
                                                </Button>
                                            </div>
                                        ) : (
                                            <Dropdown
                                                style={{ width: '100%' }}
                                                value={selectedEstadoE}
                                                onChange={(e) => setselectedEstadoE(e.value)}
                                                options={estadosOptions}
                                                optionLabel="nombre"
                                                placeholder="Selecciona un tipo estado"
                                                filter
                                                filterBy="codigo,descripcionEspanol,descripcionIngles"
                                                virtualScrollerOptions={{ itemSize: 38 }}
                                                valueTemplate={selectedValueTemplateE}
                                                itemTemplate={optionTemplateE}
                                            />
                                        )
                                    }
                                </div>
                            </div>
                            <div className="form-group">
                                <label>Fecha <small className="requiredAsterisk">(Obligatorio)</small></label>
                                <input type="date" name="fecha" value={newEvento.fecha || ''} onChange={handleInputChange} />
                            </div>
                        </>
                    }
                    {
                        (selectedTipoEventoE && selectedTipoEventoE.tablaEvento === 'evento2') &&
                        <>
                            <div className="form-group form-group-single">
                                <label>Estado <small className="requiredAsterisk">(Obligatorio)</small></label>
                                <div>
                                    {
                                        errorE || !estadosOptions ? (
                                            <div className="dropdown-error">
                                                <div className="dropdown-error-msg">
                                                    {isLoadingE || (isRefreshing && isValidatingE) ?
                                                        <div className="small-spinner" /> :
                                                        <span>Ocurrió un error: sin opciones disponibles</span>}
                                                </div>
                                                <Button className="rounded-icon-btn" onClick={refreshData}>
                                                    <i className="pi pi-refresh" style={{ fontSize: '0.8rem', margin: '0' }}></i>
                                                </Button>
                                            </div>
                                        ) : (
                                            <Dropdown
                                                style={{ width: '100%' }}
                                                value={selectedEstadoE}
                                                onChange={(e) => setselectedEstadoE(e.value)}
                                                options={estadosOptions}
                                                optionLabel="nombre"
                                                placeholder="Selecciona un tipo estado"
                                                filter
                                                filterBy="codigo,descripcionEspanol,descripcionIngles"
                                                virtualScrollerOptions={{ itemSize: 38 }}
                                                valueTemplate={selectedValueTemplateE}
                                                itemTemplate={optionTemplateE}
                                            />
                                        )
                                    }
                                </div>
                            </div>
                            <div className="form-group form-group-double">
                                <label>Marca <small className="requiredAsterisk">(Obligatorio)</small></label>
                                <input type="text" name="marcaOpuesta" value={newEvento.marcaOpuesta || ''} onChange={handleInputChange} maxLength='70' placeholder='Denominación de la marca opuesta' />
                            </div>
                            <div className="form-group form-group-double">
                                <label>Clase <small className="requiredAsterisk">(Obligatorio)</small></label>
                                <div>
                                    {
                                        errorC || !clases ? (
                                            <div className="dropdown-error">
                                                <div className="dropdown-error-msg">
                                                    {isLoadingC || (isRefreshing && isValidatingC) ?
                                                        <div className="small-spinner" /> :
                                                        <span>Ocurrió un error: sin opciones disponibles</span>}
                                                </div>
                                                <Button className="rounded-icon-btn" onClick={refreshData}>
                                                    <i className="pi pi-refresh" style={{ fontSize: '0.8rem', margin: '0' }}></i>
                                                </Button>
                                            </div>
                                        ) : (
                                            <Dropdown
                                                style={{ width: '100%' }}
                                                value={selectedClaseE}
                                                onChange={(e) => setselectedClaseE(e.value)}
                                                options={clases}
                                                optionLabel="nombre"
                                                placeholder="Selecciona una clase"
                                                filter
                                                filterBy="codigo,descripcionEspanol,descripcionIngles"
                                                virtualScrollerOptions={{ itemSize: 38 }}
                                                valueTemplate={selectedValueTemplateC}
                                                itemTemplate={optionTemplateC}
                                            />
                                        )
                                    }
                                </div>
                            </div>
                            <div className="form-group form-group-double">
                                <label>Propietario <small className="requiredAsterisk">(Obligatorio)</small></label>
                                <input type="text" name="propietario" value={newEvento.propietario || ''} onChange={handleInputChange} maxLength='70' placeholder='Propietario de la marca opuesta' />
                            </div>
                            <div className="form-group form-group-double">
                                <label>Agente <small className="requiredAsterisk">(Obligatorio)</small></label>
                                <input type="text" name="agente" value={newEvento.agente || ''} onChange={handleInputChange} maxLength='70' placeholder='Agente de la marca opuesta' />
                            </div>
                            <div className="form-group form-group-double">
                                <label>Registro <small className="requiredAsterisk">(Obligatorio)</small></label>
                                <input type="text" name="registro" value={newEvento.registro || ''} onChange={handleInputChange} maxLength='100' placeholder='Registro' />
                            </div>
                            <div className="form-group form-group-double">
                                <label>Fecha de registro <small className="requiredAsterisk">(Obligatorio)</small></label>
                                <input type="date" name="fechaRegistro" value={newEvento.fechaRegistro || ''} onChange={handleInputChange} />
                            </div>
                        </>
                    }
                    {
                        (selectedTipoEventoE && selectedTipoEventoE.tablaEvento === 'evento3') &&
                        <>
                            <div className="form-group form-group-single">
                                <label>Estado <small className="requiredAsterisk">(Obligatorio)</small></label>
                                <div>
                                    {
                                        errorE || !estadosOptions ? (
                                            <div className="dropdown-error">
                                                <div className="dropdown-error-msg">
                                                    {isLoadingE || (isRefreshing && isValidatingE) ?
                                                        <div className="small-spinner" /> :
                                                        <span>Ocurrió un error: sin opciones disponibles</span>}
                                                </div>
                                                <Button className="rounded-icon-btn" onClick={refreshData}>
                                                    <i className="pi pi-refresh" style={{ fontSize: '0.8rem', margin: '0' }}></i>
                                                </Button>
                                            </div>
                                        ) : (
                                            <Dropdown
                                                style={{ width: '100%' }}
                                                value={selectedEstadoE}
                                                onChange={(e) => setselectedEstadoE(e.value)}
                                                options={estadosOptions}
                                                optionLabel="nombre"
                                                placeholder="Selecciona un tipo estado"
                                                filter
                                                filterBy="codigo,descripcionEspanol,descripcionIngles"
                                                virtualScrollerOptions={{ itemSize: 38 }}
                                                valueTemplate={selectedValueTemplateE}
                                                itemTemplate={optionTemplateE}
                                            />
                                        )
                                    }
                                </div>
                            </div>
                            <div className="form-group form-group-double">
                                <label>Fecha de vigencia (Desde) <small className="requiredAsterisk">(Obligatorio)</small></label>
                                <input type="date" name="fechaVigenciaDesde" value={newEvento.fechaVigenciaDesde || ''} onChange={handleInputChange} />
                            </div>
                            <div className="form-group form-group-double">
                                <label>Fecha de vigencia (Hasta) <small className="requiredAsterisk">(Obligatorio)</small></label>
                                <input type="date" name="fechaVigenciaHasta" value={newEvento.fechaVigenciaHasta || ''} onChange={handleInputChange} />
                            </div>
                            <div className="form-group form-group-double">
                                <label>Solicitud <small className="requiredAsterisk">(Obligatorio)</small></label>
                                <input type="text" name="solicitud" value={newEvento.solicitud || ''} onChange={handleInputChange} maxLength='100' placeholder='Solicitud' />
                            </div>
                            <div className="form-group form-group-double">
                                <label>Fecha de solicitud <small className="requiredAsterisk">(Obligatorio)</small></label>
                                <input type="date" name="fechaSolicitud" value={newEvento.fechaSolicitud || ''} onChange={handleInputChange} />
                            </div>
                            <div className="form-group form-group-double">
                                <label>Registro <small className="requiredAsterisk">(Obligatorio)</small></label>
                                <input type="text" name="registro" value={newEvento.registro || ''} onChange={handleInputChange} maxLength='100' placeholder='Registro' />
                            </div>
                            <div className="form-group form-group-double">
                                <label>Fecha de registro <small className="requiredAsterisk">(Obligatorio)</small></label>
                                <input type="date" name="fechaRegistro" value={newEvento.fechaRegistro || ''} onChange={handleInputChange} />
                            </div>
                        </>
                    }
                    {
                        (selectedTipoEventoE && selectedTipoEventoE.tablaEvento === 'evento4') &&
                        <>
                            <div className="form-group form-group-single">
                                <label>Estado <small className="requiredAsterisk">(Obligatorio)</small></label>
                                <div>
                                    {
                                        errorE || !estadosOptions ? (
                                            <div className="dropdown-error">
                                                <div className="dropdown-error-msg">
                                                    {isLoadingE || (isRefreshing && isValidatingE) ?
                                                        <div className="small-spinner" /> :
                                                        <span>Ocurrió un error: sin opciones disponibles</span>}
                                                </div>
                                                <Button className="rounded-icon-btn" onClick={refreshData}>
                                                    <i className="pi pi-refresh" style={{ fontSize: '0.8rem', margin: '0' }}></i>
                                                </Button>
                                            </div>
                                        ) : (
                                            <Dropdown
                                                style={{ width: '100%' }}
                                                value={selectedEstadoE}
                                                onChange={(e) => setselectedEstadoE(e.value)}
                                                options={estadosOptions}
                                                optionLabel="nombre"
                                                placeholder="Selecciona un tipo estado"
                                                filter
                                                filterBy="codigo,descripcionEspanol,descripcionIngles"
                                                virtualScrollerOptions={{ itemSize: 38 }}
                                                valueTemplate={selectedValueTemplateE}
                                                itemTemplate={optionTemplateE}
                                            />
                                        )
                                    }
                                </div>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'row', gap: '20px', width: '100%', margin: '10px 0px' }}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', width: '50%', alignItems: 'start' }}>
                                    <div className="form-group form-group-double">
                                        <label>{getTituloGrupo1()} <small className="requiredAsterisk">(Obligatorio)</small></label>
                                        <div style={{ display: 'flex', flexDirection: 'row', gap: '10px' }}>
                                            <div style={{ width: '100%' }}>
                                                <Dropdown
                                                    showClear
                                                    style={{ width: '100%', maxWidth: '270px' }}
                                                    value={selectedPropietarioG1}
                                                    onChange={(e) => setSelectedPropietarioG1(e.value)}
                                                    options={propietariosExistentes}
                                                    optionLabel="nombre"
                                                    placeholder="Selecciona un registro"
                                                    filter
                                                    filterBy="propietarioId,nombre"
                                                    virtualScrollerOptions={{ itemSize: 38 }}
                                                    valueTemplate={selectedValueTemplateP}
                                                    itemTemplate={optionTemplateP}
                                                />
                                            </div>
                                            <button className='rounded-icon-btn' onClick={handleAddPropietarioG1}>
                                                <i className="pi pi-plus-circle" style={{ color: 'white', fontSize: '16px' }}></i>
                                            </button>
                                        </div>
                                    </div>
                                    <table className="table-list">
                                        <thead>
                                            <tr className="table-head">
                                                <th>{getTituloGrupo1()} ({propietariosG1.length})</th>
                                            </tr>
                                        </thead>
                                        <tbody style={{ height: '80px', maxHeight: '80px' }}>
                                            {propietariosG1.map((propietario, index) => (
                                                <tr className="table-row" key={index}>
                                                    <td className="table-nombre-abogado"><span><strong>{propietario.propietarioId}</strong> - {propietario.nombre}</span></td>
                                                    <td className="table-delete-button">
                                                        <button className="rounded-icon-btn" onClick={(e) => handleDeletePropietarioG1(e, propietario)}>
                                                            <i className="pi pi-delete-left" style={{ color: 'white', fontSize: '16px' }}></i>
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', width: '50%' }}>
                                    <div className="form-group form-group-double">
                                        <label>{getTituloGrupo2()} <small className="requiredAsterisk">(Obligatorio)</small></label>
                                        <div style={{ display: 'flex', flexDirection: 'row', gap: '10px' }}>
                                            <div style={{ width: '100%', maxWidth: '270px' }}>
                                                <DebounceDropdown endpoint='Propietarios' optionLabel='nombre' showClear={true} setter={setSelectedPropietarioG2} selectedObject={selectedPropietarioG2} filterBy="propietarioId,nombre" />
                                            </div>
                                            <button className='rounded-icon-btn' onClick={handleAddPropietarioG2}>
                                                <i className="pi pi-plus-circle" style={{ color: 'white', fontSize: '16px' }}></i>
                                            </button>
                                        </div>
                                    </div>
                                    <table className="table-list">
                                        <thead>
                                            <tr className="table-head">
                                                <th>{getTituloGrupo2()} ({propietariosG2.length})</th>
                                            </tr>
                                        </thead>
                                        <tbody style={{ height: '80px', maxHeight: '80px' }}>
                                            {propietariosG2.map((propietario, index) => (
                                                <tr className="table-row" key={index}>
                                                    <td className="table-nombre-abogado"><span><strong>{propietario.propietarioId}</strong> - {propietario.nombre}</span></td>
                                                    <td className="table-delete-button">
                                                        <button className="rounded-icon-btn" onClick={(e) => handleDeletePropietarioG2(e, propietario)}>
                                                            <i className="pi pi-delete-left" style={{ color: 'white', fontSize: '16px' }}></i>
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>


                            <div className="form-group form-group-double">
                                <label>Solicitud <small className="requiredAsterisk">(Obligatorio)</small></label>
                                <input type="text" name="solicitud" value={newEvento.solicitud || ''} onChange={handleInputChange} maxLength='100' placeholder='Solicitud' />
                            </div>
                            <div className="form-group form-group-double">
                                <label>Fecha de solicitud <small className="requiredAsterisk">(Obligatorio)</small></label>
                                <input type="date" name="fechaSolicitud" value={newEvento.fechaSolicitud || ''} onChange={handleInputChange} />
                            </div>
                            <div className="form-group form-group-double">
                                <label>Registro <small className="requiredAsterisk">(Obligatorio)</small></label>
                                <input type="text" name="registro" value={newEvento.registro || ''} onChange={handleInputChange} maxLength='100' placeholder='Registro' />
                            </div>
                            <div className="form-group form-group-double">
                                <label>Fecha de registro <small className="requiredAsterisk">(Obligatorio)</small></label>
                                <input type="date" name="fechaRegistro" value={newEvento.fechaRegistro || ''} onChange={handleInputChange} />
                            </div>
                        </>
                    }
                </div>
            </section>
            {
                selectedTipoEventoE &&
                <button style={{ width: 'fit-content', alignSelf: 'end', marginTop: '10px', gap: '10px', position: 'relative', justifyContent: 'center' }} className="form-accept-btn logo-btn" onClick={(e) => handleEventCreation()}>
                    {
                        isLoading &&
                            <div className="spinner-container--recordatorios" style={{ position: 'absolute', width: '100%' }}>
                                <div className="small-spinner" />
                            </div>
                    }
                    <span>Ingresar {selectedTipoEventoE?.tipoEvento.split(' ')[0].toLowerCase() === 'otro' ? 'evento simple' : selectedTipoEventoE?.tipoEvento.split(' ')[0].toLowerCase()}</span>
                </button>
            }
        </>
    );
}

export default EventosCreate;