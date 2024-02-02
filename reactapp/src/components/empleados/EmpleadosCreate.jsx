import React, { useState, useRef, useEffect } from 'react';
import Draggable from 'react-draggable';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { Dropdown } from 'primereact/dropdown';
import { TabView, TabPanel } from 'primereact/tabview';
import useSWR from 'swr';

// Servicios
import { useGestionService } from '../../services/useGestionService';
import { useEmpleados } from '../../services/useEmpleados';

// Auth
const apiEndpoint = import.meta.env.VITE_MAIN_ENDPOINT;

function EmpleadosCreate({ onClose, onCreated, onEdited, selectedEmpleadoId }) { //EDITABLE

    const fetcher = async (url) => {
        const res = await fetch(url, {
            headers: {
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

    // --------------- Setup (Servicios, Contextos, Referencias) -----------------------------------

    const { createObject, updateObject } = useEmpleados(); // Servicio necesario para crear el objeto
    const toast = useRef(null); // Referencia para el toast

    const { data: empleadoData } = useSWR(`${apiEndpoint}/api/Empleados/${selectedEmpleadoId}`, fetcher); 
    const { data: companias, error, isLoading, isValidating, refresh } = useGestionService('Compania');
    const { data: tiposEmpleados } = useGestionService('TipoEmpleado');
    const { data: tiposContratos } = useGestionService('TipoContrato');
    const { data: ocupaciones } = useGestionService('Ocupacion');
    const { data: nivelesSalariales } = useGestionService('NivelSalarial');
    const { data: tiposComisiones } = useGestionService('TipoComision');
    const { data: centrosDeCostos } = useGestionService('CentroCosto');
    const { data: bancos } = useGestionService('Banco');
    const { data: tiposCuentas } = useGestionService('TipoCuenta');
    const { data: fondosReservas } = useGestionService('FondoReserva');
    
    // --------------- Estados que no requieren persistencia --------------------------------------------

    const [isLoading2, setIsLoading2] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false); // Para los dropdowns
    const defaultNewEmpleado = {}; 
    const defaultRequiredFields = {
        companiaId: false,
        tipoEmpleadoId: false,
        apellidoPaterno: false,
        apellidoMaterno: false,
        nombres: false,
        sexo: false,
        numeroCedula: false,
        direccion: false,
        telefono1: false,
        telefono2: false,
        tipoContratoId: false,
        carnetIess: false,
        ocupacionId: false,
        nivelSalarialId: false,
        tipoComisionId: false,
        centroCostosId: false,
        fechaNacimiento: false,
        fechaIngreso: false,
        cuentaBancaria: false,
        bancoId: false,
        tipoCuentaId: false,
        bonificacion: false,
        sueldoBase: false,
        fondoReservaId: false,
        reingreso: false,
        fechaReingreso: false,
        formaCalculo13: false,
        formaCalculo14: false
    };
    const reingresoOptions = [
        { nombre: 'No', value: false },
        { nombre: 'Sí', value: true },
    ]
 
    // --------------- Estados que requieren persistencia --------------------------------------------

    const [selectedCompania, setSelectedCompania] = useState(null);
    const [selectedTipoEmpleado, setSelectedTipoEmpleado] = useState(null);
    const [selectedTipoContrato, setSelectedTipoContrato] = useState(null);
    const [selectedOcupacion, setSelectedOcupacion] = useState(null);
    const [selectedNivelSalarial, setSelectedNivelSalarial] = useState(null);
    const [selectedTipoComision, setSelectedTipoComision] = useState(null);
    const [selectedCentroCosto, setSelectedCentroCosto] = useState(null);
    const [selectedBanco, setSelectedBanco] = useState(null);
    const [selectedTipoCuenta, setSelectedTipoCuenta] = useState(null);
    const [selectedFondoReserva, setSelectedFondoReserva] = useState(null);
    const [selectedReingreso, setSelectedReingreso] = useState(null);

    // Lógica general
    const [newEmpleado, setNewEmpleado] = useState(defaultNewEmpleado);// mapea el objeto: ESPECIFICO
    const [isAnyEmpty, setisAnyEmpty] = useState(false); //Saber si hay campos vacíos: GENERAL
    const [requiredFields, setRequiredFields] = useState(defaultRequiredFields); // mapea los inputs requeridos: GENERAL
    const [activeIndex, setActiveIndex] = useState(0); // Conoce el indice de tab activo para el tabview

    useEffect(() => {
        if (selectedEmpleadoId && empleadoData) { // Checks if empleadoId prop is provided and empleadoData is loaded
            setNewEmpleado(empleadoData); // Sets the employee data

            setSelectedCompania(companias?.find(comp => comp.companiaId === empleadoData.companiaId));
            setSelectedTipoEmpleado(tiposEmpleados?.find(tipo => tipo.tipoEmpleadoId === empleadoData.tipoEmpleadoId));
            setSelectedTipoContrato(tiposContratos?.find(tipo => tipo.tipoContratoId === empleadoData.tipoContratoId));
            setSelectedOcupacion(ocupaciones?.find(ocupacion => ocupacion.ocupacionId === empleadoData.ocupacionId));
            setSelectedNivelSalarial(nivelesSalariales?.find(nivel => nivel.nivelSalarialId === empleadoData.nivelSalarialId));
            setSelectedTipoComision(tiposComisiones?.find(tipo => tipo.tipoComisionId === empleadoData.tipoComisionId));
            setSelectedCentroCosto(centrosDeCostos?.find(centro => centro.centroCostoId === empleadoData.centroCostosId));
            setSelectedBanco(bancos?.find(banco => banco.bancoId === empleadoData.bancoId));
            setSelectedTipoCuenta(tiposCuentas?.find(tipo => tipo.tipoCuentaId === empleadoData.tipoCuentaId));
            setSelectedFondoReserva(fondosReservas?.find(fondo => fondo.fondoReservaId === empleadoData.fondoReservaId));
            setSelectedReingreso(reingresoOptions?.find(op => op.value === empleadoData.reingreso));
        }
    }, [selectedEmpleadoId, empleadoData, companias, tiposEmpleados, tiposContratos, ocupaciones, nivelesSalariales, tiposComisiones, centrosDeCostos, bancos, tiposCuentas, fondosReservas]);

    // ------------------ Dropdowns normales ---------------------------------------

    const refreshData = (e) => {
        e.preventDefault();
        setIsRefreshing(true);
        refresh(); 
    }; // Refresca los datos del los dropdowns: GENERAL

    useEffect(() => {
        if (isRefreshing) {
            setIsRefreshing(false);
        }
    }, [isValidating]); // Cambia el estado de refreshing: GENERAL

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

    const handleInputChange = (e) => {
        const { name, type, value, checked } = e.target;
        const inputValue = type === 'checkbox' ? checked : value; // Use value for text inputs, and checked for checkboxes
        if (requiredFields.hasOwnProperty(name)) {
            const updatedRequiredFields = { ...requiredFields };
            updatedRequiredFields[name] = false;
            setRequiredFields(updatedRequiredFields);
        } // Check if the input name is a key in the requiredFields
        setNewEmpleado(prev => ({ ...prev, [name]: inputValue })); // Update the newCliente state with the new value for text inputs
    }; // Maneja el cambio para un tag de input

    const isEmptyValue = value => {
        if (value === null || value === undefined) return true;
        if (typeof value === 'string') return value.trim() === '';
        if (typeof value === 'number') return isNaN(value) || value === 0;
        if (Array.isArray(value)) return value.length === 0;
        return false;
    }; // Verifica si un valor específico está vacío

    const validateRequiredFields = (objetoEnCreacion) => {
        const updatedRequiredFields = { ...defaultRequiredFields };
        Object.keys(updatedRequiredFields).forEach(key => {
            updatedRequiredFields[key] = isEmptyValue(objetoEnCreacion[key]);
        }); // Iterate over the required field keys
        setRequiredFields(updatedRequiredFields);
        return Object.values(updatedRequiredFields).some(value => value); // Return true if any of the required fields is empty
    }; // Valida que los campos en REQUIRED_FIELDS no estén vacíos en el nuevo objeto

    const handleCreate = async (e) => {
        e.preventDefault();

        // Verificar si existe algun campo requerido vacío
        const anyFieldEmpty = validateRequiredFields(newEmpleado);

        if (anyFieldEmpty) {
            setisAnyEmpty(true);
            return;
        } else {
            setisAnyEmpty(false);
        }

        let status;
        let data;

        // Crea el empleado nuevo
        try {
            setIsLoading2(true);

            const response = await createObject(newEmpleado); 
            status = response.status;
            data = response.data;

            if (status === 201) {
                toast.current.show({
                    severity: 'success',
                    summary: 'Proceso exitoso',
                    detail: `Registro creado con ID: ${data?.empleadoId}`, // EDITABLE
                    sticky: true,
                });
                resetStates();
                onCreated();
            } else {
                throw new Error(`Error en la creación: código de estado ${status}`);
            }
        } catch (error) {
            toast.current.show({
                severity: 'error',
                summary: 'Error',
                detail: 'Hubo un error al crear el registro', // EDITABLE
                life: 3000,
            });
            console.log(error);
        } finally {
            setIsLoading2(false);
            setActiveIndex(0);
        }
    }; // Maneja la creación del objeto: ESPECIFICO

    const handleEdit = async (e) => {
        e.preventDefault();

        // Verificar si existe algun campo requerido vacío
        const anyFieldEmpty = validateRequiredFields(newEmpleado);

        if (anyFieldEmpty) {
            setisAnyEmpty(true);
            return;
        } else {
            setisAnyEmpty(false);
        }

        let status;
        let data;

        // Crea el empleado nuevo
        try {
            setIsLoading2(true);

            const response = await updateObject(newEmpleado);
            status = response.status;
            data = response.data;

            if (status === 201) {
                toast.current.show({
                    severity: 'success',
                    summary: 'Proceso exitoso',
                    detail: `Registro editado con éxito`, // EDITABLE
                    sticky: true,
                });
                resetStates();
                onEdited();
            } else {
                throw new Error(`Error en la edición`);
            }
        } catch (error) {
            toast.current.show({
                severity: 'error',
                summary: 'Error',
                detail: 'Hubo un error al editar el registro', // EDITABLE
                life: 3000,
            });
            console.log(error);
        } finally {
            setIsLoading2(false);
            setActiveIndex(0);
        }
    }; // Maneja la creación del objeto: ESPECIFICO

    const resetStates = () => {
        setSelectedCompania(null);
        setSelectedTipoEmpleado(null);
        setSelectedTipoContrato(null);
        setSelectedOcupacion(null);
        setSelectedNivelSalarial(null);
        setSelectedTipoComision(null);
        setSelectedCentroCosto(null);
        setSelectedBanco(null);
        setSelectedTipoCuenta(null);
        setSelectedFondoReserva(null);
        setSelectedReingreso(null);

        // Lógica general
        setNewEmpleado(defaultNewEmpleado);
        setisAnyEmpty(false);
        setRequiredFields(defaultRequiredFields);
        setActiveIndex(0);
    } // Resetea los estados del componente: ESPECIFICO

    const handleCancel = () => {
        onClose();
    }; // Maneja el cancelar del formulario (Datos no persisten): GENERAL

    // -----------------------------------------------------------------------------------------------

    return (
        <>
            <Draggable cancel="input, button, textarea, table" bounds="parent">
                <div className="form-container wider-form">
                    {(isLoading2) &&
                        <div className="spinner-container">
                            <div className="spinner" />
                        </div>
                    }
                    <section className="form-header">
                        <span>{ selectedEmpleadoId ? 'Editar trabajador' : 'Nuevo trabajador' }</span> 
                        <div className="form-header-buttons">
                            <Button className="form-header-btn" onClick={handleCancel}>
                                <i className="pi pi-times" style={{ fontSize: '0.6rem', color: 'var(--secondary-blue)', fontWeight: '600' }}></i>
                            </Button>
                        </div>
                    </section>
               
                    <TabView activeIndex={activeIndex} onTabChange={(e) => setActiveIndex(e.index)}>
                        <TabPanel header="Trabajador" leftIcon="pi pi-briefcase mr-2">
                            <div className="form-body form-body--create">
                                <section>
                                    <div className="form-group-label">
                                        <i className="pi pi-info-circle"></i>
                                        <label>Información personal</label>
                                    </div>
                                    <div className="form-body-group">
                                        <div className="form-group">
                                            <label> Nombres <small className="requiredAsterisk">(Obligatorio)</small></label>
                                            <input className={`${requiredFields.nombres && 'form-group-empty'}`} type="text" name="nombres" value={newEmpleado.nombres || ''} onChange={handleInputChange} required maxLength="70" placeholder="Nombres del trabajador" />
                                        </div> 
                                        <div className="form-group">
                                            <label> Apellido paterno <small className="requiredAsterisk">(Obligatorio)</small></label>
                                            <input className={`${requiredFields.apellidoPaterno && 'form-group-empty'}`} type="text" name="apellidoPaterno" value={newEmpleado.apellidoPaterno || ''} onChange={handleInputChange} required maxLength="70" placeholder="Apellido paterno del trabajador" />
                                        </div> 
                                        <div className="form-group">
                                            <label> Apellido materno <small className="requiredAsterisk">(Obligatorio)</small></label>
                                            <input className={`${requiredFields.apellidoMaterno && 'form-group-empty'}`} type="text" name="apellidoMaterno" value={newEmpleado.apellidoMaterno || ''} onChange={handleInputChange} required maxLength="70" placeholder="Apellido materno del trabajador" />
                                        </div>
                                        <div className="form-group form-group-double">
                                            <label> Fecha de nacimiento <small className="requiredAsterisk">(Obligatorio)</small></label>
                                            <input className={`${requiredFields.fechaNacimiento && 'form-group-empty'}`} type="date" name="fechaNacimiento" value={newEmpleado.fechaNacimiento || ''} onChange={handleInputChange} required />
                                        </div>
                                        <div className="form-group">
                                            <label> Sexo <small className="requiredAsterisk">(Obligatorio)</small></label>
                                            <input className={`${requiredFields.sexo && 'form-group-empty'}`} type="text" name="sexo" value={newEmpleado.sexo || ''} onChange={handleInputChange} required maxLength="30" placeholder="Sexo del trabajador" />
                                        </div> 
                                        <div className="form-group">
                                            <label> Cédula <small className="requiredAsterisk">(Obligatorio)</small></label>
                                            <input className={`${requiredFields.numeroCedula && 'form-group-empty'}`} type="text" name="numeroCedula" value={newEmpleado.numeroCedula || ''} onChange={handleInputChange} required maxLength="10" placeholder="Número de cédula" />
                                        </div> 
                                    </div>
                                </section>
                                <section>
                                    <div className="form-group-label">
                                        <i className="pi pi-map"></i>
                                        <label>Contacto</label>
                                    </div>
                                    <div className="form-body-group">
                                        <div className="form-group form-group-single">
                                            <label> Dirección <small className="requiredAsterisk">(Obligatorio)</small></label>
                                            <input className={`${requiredFields.direccion && 'form-group-empty'}`} type="text" name="direccion" value={newEmpleado.direccion || ''} onChange={handleInputChange} required maxLength="70" placeholder="Dirección del trabajador" />
                                        </div>
                                        <div className="form-group form-group-double">
                                            <label> Teléfono (1) <small className="requiredAsterisk">(Obligatorio)</small></label>
                                            <input className={`${requiredFields.telefono1 && 'form-group-empty'}`} type="text" name="telefono1" value={newEmpleado.telefono1 || ''} onChange={handleInputChange} required maxLength="12" placeholder="Número telefónico del trabajador" />
                                        </div>
                                        <div className="form-group form-group-double">
                                            <label> Teléfono (2) <small className="requiredAsterisk">(Obligatorio)</small></label>
                                            <input className={`${requiredFields.telefono2 && 'form-group-empty'}`} type="text" name="telefono2" value={newEmpleado.telefono2 || ''} onChange={handleInputChange} required maxLength="12" placeholder="Número telefónico del trabajador" />
                                        </div>
                                    </div>
                                </section>
                            </div>
                        </TabPanel>
                        <TabPanel header="Información laboral" leftIcon="pi pi-building mr-2">
                            <div className="form-body form-body--create">
                                <section>
                                    <div className="form-group-label">
                                        <i className="pi pi-info-circle"></i>
                                        <label>Información del trabajador</label>
                                    </div>
                                    <div className="form-body-group">
                                        <div className="form-group form-group-double">
                                            <label> Compañía <small className="requiredAsterisk">(Obligatorio)</small></label>
                                            <div>
                                                {
                                                    error || !companias ? (
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
                                                            className={`${requiredFields.companiaId && 'form-group-empty'}`}
                                                            style={{ width: '100%' }}
                                                            value={selectedCompania}
                                                            onChange={(e) => {
                                                                setSelectedCompania(e.value);
                                                                if (e.value && e.value.companiaId !== undefined) {
                                                                    setNewEmpleado(prevState => ({
                                                                        ...prevState,
                                                                        companiaId: e.value.companiaId
                                                                    }));
                                                                }
                                                            }}
                                                                options={companias}
                                                            optionLabel="nombre"
                                                            placeholder="Selecciona una compañía"
                                                            filter
                                                            virtualScrollerOptions={{ itemSize: 38 }}
                                                            valueTemplate={selectedValueTemplate}
                                                            itemTemplate={optionTemplate}
                                                        />
                                                    )
                                                }
                                            </div>
                                        </div>
                                        <div className="form-group form-group-double">
                                            <label> Tipo de empleado <small className="requiredAsterisk">(Obligatorio)</small></label>
                                            <div>
                                                {
                                                    error || !tiposEmpleados ? (
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
                                                            className={`${requiredFields.tipoEmpleadoId && 'form-group-empty'}`}
                                                            style={{ width: '100%' }}
                                                            value={selectedTipoEmpleado}
                                                            onChange={(e) => {
                                                                setSelectedTipoEmpleado(e.value);
                                                                if (e.value && e.value.tipoEmpleadoId !== undefined) {
                                                                    setNewEmpleado(prevState => ({
                                                                        ...prevState,
                                                                        tipoEmpleadoId: e.value.tipoEmpleadoId
                                                                    }));
                                                                }
                                                            }}
                                                            options={tiposEmpleados}
                                                            optionLabel="nombre"
                                                            placeholder="Selecciona un tipo de empleado"
                                                            filter
                                                            virtualScrollerOptions={{ itemSize: 38 }}
                                                            valueTemplate={selectedValueTemplate}
                                                            itemTemplate={optionTemplate}
                                                        />
                                                    )
                                                }
                                            </div>
                                        </div>
                                        <div className="form-group form-group-double">
                                            <label> Tipo de contrato <small className="requiredAsterisk">(Obligatorio)</small></label>
                                            <div>
                                                {
                                                    error || !tiposContratos ? (
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
                                                            className={`${requiredFields.tipoContratoId && 'form-group-empty'}`}
                                                            style={{ width: '100%' }}
                                                            value={selectedTipoContrato}
                                                            onChange={(e) => {
                                                                setSelectedTipoContrato(e.value);
                                                                if (e.value && e.value.tipoContratoId !== undefined) {
                                                                    setNewEmpleado(prevState => ({
                                                                        ...prevState,
                                                                        tipoContratoId: e.value.tipoContratoId
                                                                    }));
                                                                }
                                                            }}
                                                            options={tiposContratos}
                                                            optionLabel="nombre"
                                                            placeholder="Selecciona un tipo de contrato"
                                                            filter
                                                            virtualScrollerOptions={{ itemSize: 38 }}
                                                            valueTemplate={selectedValueTemplate}
                                                            itemTemplate={optionTemplate}
                                                        />
                                                    )
                                                }
                                            </div>
                                        </div>
                                        <div className="form-group form-group-double">
                                            <label> Carnet del IESS <small className="requiredAsterisk">(Obligatorio)</small></label>
                                            <input className={`${requiredFields.carnetIess && 'form-group-empty'}`} type="text" name="carnetIess" value={newEmpleado.carnetIess || ''} onChange={handleInputChange} required maxLength="20" placeholder="Número del carnet del IESS" />
                                        </div>
                                        <div className="form-group form-group-double">
                                            <label> Ocupación <small className="requiredAsterisk">(Obligatorio)</small></label>
                                            <div>
                                                {
                                                    error || !ocupaciones ? (
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
                                                            className={`${requiredFields.ocupacionId && 'form-group-empty'}`}
                                                            style={{ width: '100%' }}
                                                            value={selectedOcupacion}
                                                            onChange={(e) => {
                                                                setSelectedOcupacion(e.value);
                                                                if (e.value && e.value.ocupacionId !== undefined) {
                                                                    setNewEmpleado(prevState => ({
                                                                        ...prevState,
                                                                        ocupacionId: e.value.ocupacionId
                                                                    }));
                                                                }
                                                            }}
                                                            options={ocupaciones}
                                                            optionLabel="nombre"
                                                            placeholder="Selecciona una ocupación"
                                                            filter
                                                            virtualScrollerOptions={{ itemSize: 38 }}
                                                            valueTemplate={selectedValueTemplate}
                                                            itemTemplate={optionTemplate}
                                                        />
                                                    )
                                                }
                                            </div>
                                        </div>
                                        <div className="form-group form-group-double">
                                            <label> Nivel salarial <small className="requiredAsterisk">(Obligatorio)</small></label>
                                            <div>
                                                {
                                                    error || !nivelesSalariales ? (
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
                                                            className={`${requiredFields.nivelSalarialId && 'form-group-empty'}`}
                                                            style={{ width: '100%' }}
                                                            value={selectedNivelSalarial}
                                                            onChange={(e) => {
                                                                setSelectedNivelSalarial(e.value);
                                                                if (e.value && e.value.nivelSalarialId !== undefined) {
                                                                    setNewEmpleado(prevState => ({
                                                                        ...prevState,
                                                                        nivelSalarialId: e.value.nivelSalarialId
                                                                    }));
                                                                }
                                                            }}
                                                            options={nivelesSalariales}
                                                            optionLabel="nombre"
                                                            placeholder="Selecciona una nivel salarial"
                                                            filter
                                                            virtualScrollerOptions={{ itemSize: 38 }}
                                                            valueTemplate={selectedValueTemplate}
                                                            itemTemplate={optionTemplate}
                                                        />
                                                    )
                                                }
                                            </div>
                                        </div>
                                        <div className="form-group form-group-double">
                                            <label> Tipo de comisión <small className="requiredAsterisk">(Obligatorio)</small></label>
                                            <div>
                                                {
                                                    error || !tiposComisiones ? (
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
                                                            className={`${requiredFields.tipoComisionId && 'form-group-empty'}`}
                                                            style={{ width: '100%' }}
                                                            value={selectedTipoComision}
                                                            onChange={(e) => {
                                                                setSelectedTipoComision(e.value);
                                                                if (e.value && e.value.tipoComisionId !== undefined) {
                                                                    setNewEmpleado(prevState => ({
                                                                        ...prevState,
                                                                        tipoComisionId: e.value.tipoComisionId
                                                                    }));
                                                                }
                                                            }}
                                                            options={tiposComisiones}
                                                            optionLabel="nombre"
                                                            placeholder="Selecciona un tipo de comisión"
                                                            filter
                                                            virtualScrollerOptions={{ itemSize: 38 }}
                                                            valueTemplate={selectedValueTemplate}
                                                            itemTemplate={optionTemplate}
                                                        />
                                                    )
                                                }
                                            </div>
                                        </div>
                                        <div className="form-group form-group-double">
                                            <label> Centro de costos <small className="requiredAsterisk">(Obligatorio)</small></label>
                                            <div>
                                                {
                                                    error || !centrosDeCostos ? (
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
                                                            className={`${requiredFields.centroCostosId && 'form-group-empty'}`}
                                                            style={{ width: '100%' }}
                                                            value={selectedCentroCosto}
                                                            onChange={(e) => {
                                                                setSelectedCentroCosto(e.value);
                                                                if (e.value && e.value.centroCostoId !== undefined) {
                                                                    setNewEmpleado(prevState => ({
                                                                        ...prevState,
                                                                        centroCostosId: e.value.centroCostoId
                                                                    }));
                                                                }
                                                            }}
                                                            options={centrosDeCostos}
                                                            optionLabel="nombre"
                                                            placeholder="Selecciona un centro de costos"
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
                                            <label> Fecha de ingreso <small className="requiredAsterisk">(Obligatorio)</small></label>
                                            <input className={`${requiredFields.fechaIngreso && 'form-group-empty'}`} type="date" name="fechaIngreso" value={newEmpleado.fechaIngreso || ''} onChange={handleInputChange} required />
                                        </div>
                                        <div className="form-group">
                                            <label> Reingreso <small className="requiredAsterisk">(Obligatorio)</small></label>
                                            <div>
                                                <Dropdown
                                                    className={`${requiredFields.reingreso && 'form-group-empty'}`}
                                                    style={{ width: '100%' }}
                                                    value={selectedReingreso}
                                                    onChange={(e) => {
                                                        setSelectedReingreso(e.value);
                                                        if (e.value && e.value.value !== undefined) {
                                                            setNewEmpleado(prevState => ({
                                                                ...prevState,
                                                                reingreso: e.value.value
                                                            }));
                                                        }
                                                    }}
                                                    options={reingresoOptions}
                                                    optionLabel="nombre"
                                                    placeholder="¿Hubo reingreso?"
                                                    filter
                                                    virtualScrollerOptions={{ itemSize: 38 }}
                                                    valueTemplate={selectedValueTemplate}
                                                    itemTemplate={optionTemplate}
                                                />
                                            </div>
                                        </div>
                                        <div className="form-group">
                                            <label> Fecha de reingreso <small className="requiredAsterisk">(Obligatorio)</small></label>
                                            <input className={`${requiredFields.fechaReingreso && 'form-group-empty'}`} type="date" name="fechaReingreso" value={newEmpleado.fechaReingreso || ''} onChange={handleInputChange} required />
                                        </div>
                                    </div>
                                </section>
                                <section>
                                    <div className="form-group-label">
                                        <i className="pi pi-credit-card"></i>
                                        <label>Información bancaria</label>
                                    </div>
                                    <div className="form-body-group">
                                        <div className="form-group form-group-double">
                                            <label> Cuenta bancaria <small className="requiredAsterisk">(Obligatorio)</small></label>
                                            <input className={`${requiredFields.cuentaBancaria && 'form-group-empty'}`} type="text" name="cuentaBancaria" value={newEmpleado.cuentaBancaria || ''} onChange={handleInputChange} required maxLength="70" placeholder="Número de cuenta" />
                                        </div>
                                        <div className="form-group form-group-double">
                                            <label> Banco <small className="requiredAsterisk">(Obligatorio)</small></label>
                                            <div>
                                                {
                                                    error || !bancos ? (
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
                                                            className={`${requiredFields.bancoId && 'form-group-empty'}`}
                                                            style={{ width: '100%' }}
                                                            value={selectedBanco}
                                                            onChange={(e) => {
                                                                setSelectedBanco(e.value);
                                                                if (e.value && e.value.bancoId !== undefined) {
                                                                    setNewEmpleado(prevState => ({
                                                                        ...prevState,
                                                                        bancoId: e.value.bancoId
                                                                    }));
                                                                }
                                                            }}
                                                            options={bancos}
                                                            optionLabel="nombre"
                                                            placeholder="Selecciona un banco"
                                                            filter
                                                            virtualScrollerOptions={{ itemSize: 38 }}
                                                            valueTemplate={selectedValueTemplate}
                                                            itemTemplate={optionTemplate}
                                                        />
                                                    )
                                                }
                                            </div>
                                        </div>
                                        <div className="form-group form-group-double">
                                            <label> Tipo de cuenta <small className="requiredAsterisk">(Obligatorio)</small></label>
                                            <div>
                                                {
                                                    error || !tiposCuentas ? (
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
                                                            className={`${requiredFields.tipoCuentaId && 'form-group-empty'}`}
                                                            style={{ width: '100%' }}
                                                            value={selectedTipoCuenta}
                                                            onChange={(e) => {
                                                                setSelectedTipoCuenta(e.value);
                                                                if (e.value && e.value.tipoCuentaId !== undefined) {
                                                                    setNewEmpleado(prevState => ({
                                                                        ...prevState,
                                                                        tipoCuentaId: e.value.tipoCuentaId
                                                                    }));
                                                                }
                                                            }}
                                                            options={tiposCuentas}
                                                            optionLabel="nombre"
                                                            placeholder="Selecciona un tipo de cuenta"
                                                            filter
                                                            virtualScrollerOptions={{ itemSize: 38 }}
                                                            valueTemplate={selectedValueTemplate}
                                                            itemTemplate={optionTemplate}
                                                        />
                                                    )
                                                }
                                            </div>
                                        </div>
                                        <div className="form-group form-group-double">
                                            <label> Bonificación <small className="requiredAsterisk">(Obligatorio)</small></label>
                                            <input className={`${requiredFields.bonificacion && 'form-group-empty'}`} type="number" name="bonificacion" value={newEmpleado.bonificacion || ''} onChange={handleInputChange} required />
                                        </div>
                                        <div className="form-group form-group-double">
                                            <label> Sueldo base <small className="requiredAsterisk">(Obligatorio)</small></label>
                                            <input className={`${requiredFields.sueldoBase && 'form-group-empty'}`} type="number" name="sueldoBase" value={newEmpleado.sueldoBase || ''} onChange={handleInputChange} required />
                                        </div>
                                        <div className="form-group form-group-double">
                                            <label> Fondo de reserva <small className="requiredAsterisk">(Obligatorio)</small></label>
                                            <div>
                                                {
                                                    error || !fondosReservas ? (
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
                                                            className={`${requiredFields.fondoReservaId && 'form-group-empty'}`}
                                                            style={{ width: '100%' }}
                                                            value={selectedFondoReserva}
                                                            onChange={(e) => {
                                                                setSelectedFondoReserva(e.value);
                                                                if (e.value && e.value.fondoReservaId !== undefined) {
                                                                    setNewEmpleado(prevState => ({
                                                                        ...prevState,
                                                                        fondoReservaId: e.value.fondoReservaId
                                                                    }));
                                                                }
                                                            }}
                                                            options={fondosReservas}
                                                            optionLabel="nombre"
                                                            placeholder="Selecciona un fondo de reserva"
                                                            filter
                                                            virtualScrollerOptions={{ itemSize: 38 }}
                                                            valueTemplate={selectedValueTemplate}
                                                            itemTemplate={optionTemplate}
                                                        />
                                                    )
                                                }
                                            </div>
                                        </div>
                                        <div className="form-group form-group-double">
                                            <label> Forma de cálculo 13ro <small className="requiredAsterisk">(Obligatorio)</small></label>
                                            <input className={`${requiredFields.formaCalculo13 && 'form-group-empty'}`} type="text" name="formaCalculo13" value={newEmpleado.formaCalculo13 || ''} onChange={handleInputChange} required maxLength="70" placeholder="Forma de cálculo décimo tercero" />
                                        </div>
                                        <div className="form-group form-group-double">
                                            <label> Forma de cálculo 14to <small className="requiredAsterisk">(Obligatorio)</small></label>
                                            <input className={`${requiredFields.formaCalculo14 && 'form-group-empty'}`} type="text" name="formaCalculo14" value={newEmpleado.formaCalculo14 || ''} onChange={handleInputChange} required maxLength="70" placeholder="Forma de cálculo décimo cuarto" />
                                        </div>
                                    </div>
                                </section>
                            </div>
                        </TabPanel>
                    </TabView>
                    <div className="center-hr">
                        <hr />
                    </div>
                    <section className="form-footer">
                        <button className="form-cancel-btn" onClick={handleCancel}>Cancelar</button>
                        {isAnyEmpty &&
                            <div className="empty-fields-msg">
                                <i className="pi pi-exclamation-circle" style={{ fontSize: '0.8rem', margin: '0', color: 'var(--secondary-blue)', fontWeight: '600' }}></i>
                                <span>Por favor, llena todos los datos <strong>requeridos</strong></span>
                            </div>
                        }
                        {
                            selectedEmpleadoId ? 
                            <button type="submit" className="form-accept-btn" onClick={handleEdit}>Editar</button> :
                            <button type="submit" className="form-accept-btn" onClick={handleCreate}>Crear</button>
                        }
                        
                    </section>
                </div>
            </Draggable>
            <Toast ref={toast} />
        </>
    );
}

export default EmpleadosCreate;