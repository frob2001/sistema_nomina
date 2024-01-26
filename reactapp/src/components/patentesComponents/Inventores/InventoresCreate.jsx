import React, { useState, useRef, useEffect } from 'react';
import Draggable from 'react-draggable';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { Dropdown } from 'primereact/dropdown';

// Redux
import { useSelector, useDispatch } from 'react-redux';
import { saveData, deleteData } from '../../../context/inventorSlice'; //EDITABLE

// Servicios
import { useInventores } from '../../../services/useInventores'; // EDITABLE
import { usePaises } from '../../../services/usePais'; // EDITABLE: DROPDOWN

function InventoresCreate({ onClose, onCreated }) { //EDITABLE

    // --------------- Redux store settings -------------------------------------------------------

    const dispatch = useDispatch();
    const inventorCreateData = useSelector(state => state.inventor.InventorCreate); 

    // --------------- Setup (Servicios, Contextos, Referencias) -----------------------------------

    const { createObject } = useInventores(); // Servicio necesario: EDITABLE
    const isClosingRef = useRef(false); // Referencia para eliminar persistencia: EDITABLE
    const toast = useRef(null); // Referencia para el toast: GENERAL

    const { paises, error: errorP, isLoading: isLoadingP, isValidating: isValidatingP, refresh: refreshP } = usePaises(); // Para el dropdown de paises

    // --------------- Estados que no requieren persistencia --------------------------------------------

    const [isLoading2, setIsLoading2] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const defaultNewInventor = {
        nombre: '',
        apellido: '',
        codigoPais: '',
        direccion: '',
    }; //EDITABLE
    const defaultRequiredFields = {
        nombre: false,
        apellido: false,
        codigoPais: false,
        direccion: false,
    }; // EDITABLE

    // --------------- Estados que requieren persistencia --------------------------------------------

    const [selectedPais, setSelectedPais] = useState(null); // saber el pais seleccionado: ESPECIFICO
    const [isAnyEmpty, setisAnyEmpty] = useState(false); //Saber si hay campos vacíos: GENERAL
    const [newInventor, setNewInventor] = useState(defaultNewInventor);// mapea el objeto: ESPECIFICO
    const [requiredFields, setRequiredFields] = useState(defaultRequiredFields); // mapea los inputs requeridos: GENERAL

    // --------------- Funciones necesarias para persistencia ----------------------------------------

    useEffect(() => {
        if (inventorCreateData) { // EDITABLE
            setSelectedPais(inventorCreateData.selectedPais || null); // EDITABLE
            setisAnyEmpty(inventorCreateData.isAnyEmpty || false); // EDITABLE
            setNewInventor(inventorCreateData.newInventor || defaultNewInventor); // EDITABLE
            setRequiredFields(inventorCreateData.requiredFields || defaultRequiredFields); // EDITABLE
        }
    }, []); // Se ejecuta cuando el componente renderiza, lee los datos guardados: GENERAL
    const saveState = () => {
        dispatch(saveData({ objectName: 'InventorCreate', value: { selectedPais, isAnyEmpty, newInventor, requiredFields } }));
    }; // Guarda en el contexto los estados como objetos: ESPECIFICO
    useEffect(() => {
        return () => {
            if (!isClosingRef.current) {
                saveState();
            }
        };
    }, [selectedPais, isAnyEmpty, newInventor, requiredFields]); // Se ejecuta con cada cambio de estado, persiste los datos: ESPECIFICO -> PUEDE OPTIMIZARSE
    const deletePersistedStates = () => {
        dispatch(deleteData({ objectName: 'InventorCreate' })); // EDITABLE
    }; // Elimina los datos en el objeto del contexto: ESPECIFICO

    // --------------- Funciones especificas del componente ------------------------------------------

    // ------------------ DROPDOWNS ---------------------------------------

    useEffect(() => {
        if (selectedPais) {
            setNewInventor(prev => ({
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
        setNewInventor(prev => ({ ...prev, [name]: value }));

    }; // Maneja el cambio en un input: ESPECIFICO

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

    const handleCreate = async (e) => {
        e.preventDefault();

        // Verificar si existe algun campo requerido vacío
        const anyFieldEmpty = validateRequiredFields(newInventor);

        if (anyFieldEmpty) {
            setisAnyEmpty(true);
            return;
        } else {
            setisAnyEmpty(false);
        }        

        let status;
        let data;

        try {
            setIsLoading2(true);
            const response = await createObject(newInventor); // EDITABLE: usa el servicio para crear
            status = response.status;
            data = response.data;


            if (status === 201) {
                toast.current.show({
                    severity: 'success',
                    summary: 'Proceso exitoso',
                    detail: `Inventor creado con ID: ${data?.inventorId}`, // EDITABLE
                    sticky: true,
                });
                resetStates();
                onCreated();
            }
        } catch (error) {
            toast.current.show({
                severity: 'error',
                summary: 'Error',
                detail: 'Hubo un error al crear el inventor', // EDITABLE
                life: 3000,
            });
        } finally {
            setIsLoading2(false);
        }
    }; // Maneja la creación del objeto: ESPECIFICO

    const resetStates = () => {
        setisAnyEmpty(false);
        setNewInventor(defaultNewInventor); // EDITABLE
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
                        <span>Crear nuevo inventor</span> 
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
                            <label>Nombre <small className="requiredAsterisk">(Obligatorio)</small></label>
                            <input className={`${requiredFields.nombre && 'form-group-empty'}`} type="text" name="nombre" value={newInventor.nombre || ''} onChange={handleInputChange} required maxLength="70" placeholder="Nombre"/>
                        </div>
                        <div className="form-group">
                            <label>Apellido <small className="requiredAsterisk">(Obligatorio)</small></label>
                            <input className={`${requiredFields.apellido && 'form-group-empty'}`} type="text" name="apellido" value={newInventor.apellido || ''} onChange={handleInputChange} required maxLength="70" placeholder="Apellido" />
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
                        <div className="form-group">
                            <label>Dirección <small className="requiredAsterisk">(Obligatorio)</small></label>
                            <textarea className={`${requiredFields.direccion && 'form-group-empty'}`} type="text" name="direccion" value={newInventor.direccion || ''} onChange={handleInputChange} required maxLength="200" placeholder="Dirección completa del inventor (máx. 200 caracteres)" />
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

export default InventoresCreate;