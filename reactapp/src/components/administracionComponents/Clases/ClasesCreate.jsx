import React, { useState, useRef, useEffect } from 'react';
import Draggable from 'react-draggable';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { useClases } from '../../../services/useClases'; // EDITABLE
import { useSelector, useDispatch } from 'react-redux';
import { saveData, deleteData } from '../../../context/claseSlice'; //EDITABLE
const apiEndpoint = import.meta.env.VITE_MAIN_ENDPOINT;
const API_BASE_URL = `${apiEndpoint}/Clases`;

// Auth
import { useMsal } from '@azure/msal-react';

function ClasesCreate({ onClose }) { //EDITABLE

    // --------------- Redux store settings -------------------------------------------------------

    const dispatch = useDispatch();
    const claseCreateData = useSelector(state => state.clase.ClaseCreate); // EDITABLE

    // --------------- Setup (Servicios, Contextos, Referencias) -----------------------------------

    const { createClase } = useClases(); // Servicio necesario: EDITABLE
    const isClosingRef = useRef(false); // Referencia para eliminar persistencia: EDITABLE
    const toast = useRef(null); // Referencia para el toast: GENERAL
    const [isLoading2, setIsLoading2] = useState(false);
    // Auth
    const { instance, accounts } = useMsal();

    // --------------- Estados que requieren persistencia --------------------------------------------

    const defaultNewClase = {
        codigo: '',
        descripcionEspanol: '',
        descripcionIngles: '',
    }; //EDITABLE
    const defaultEmptyFields = {
        codigo: false,
        descripcionEspanol: false,
        descripcionIngles: false,
    }; // EDITABLE
    const [isAnyEmpty, setisAnyEmpty] = useState(false); //Saber si hay campos vacíos: GENERAL
    const [newClase, setNewClase] = useState(defaultNewClase);// mapea el objeto: ESPECIFICO
    const [emptyFields, setEmptyFields] = useState(defaultEmptyFields); // mapea los inputs requeridos: GENERAL

    // --------------- Funciones necesarias para persistencia ----------------------------------------

    useEffect(() => {
        if (claseCreateData) { // EDITABLE
            setisAnyEmpty(claseCreateData.isAnyEmpty || false); // EDITABLE
            setNewClase(claseCreateData.newClase || defaultNewClase); // EDITABLE
            setEmptyFields(claseCreateData.emptyFields || defaultEmptyFields); // EDITABLE
        }
    }, []); // Se ejecuta cuando el componente renderiza, lee los datos guardados: GENERAL
    const saveState = () => {
        dispatch(saveData({ objectName: 'ClaseCreate', value: { isAnyEmpty, newClase, emptyFields } }));
    }; // Guarda en el contexto los estados como objetos: ESPECIFICO
    useEffect(() => {
        return () => {
            if (!isClosingRef.current) {
                saveState();
            }
        };
    }, [isAnyEmpty, newClase, emptyFields]); // Se ejecuta con cada cambio de estado, persiste los datos: ESPECIFICO -> PUEDE OPTIMIZARSE
    const deletePersistedStates = () => {
        dispatch(deleteData({ objectName: 'ClaseCreate' })); // EDITABLE
    }; // Elimina los datos en el objeto del contexto: ESPECIFICO

    // --------------- Funciones especificas del componente ------------------------------------------
    
    const handleInputChange = (e) => {
        const { name, value } = e.target;

        const updatedEmptyFields = { ...emptyFields };
        updatedEmptyFields[name] = false;
        setEmptyFields(updatedEmptyFields);

        setNewClase({ ...newClase, [name]: value }); // EDITABLE

    }; // Maneja el cambio en un input: ESPECIFICO
    const isAnyFieldEmpty = () => {
        return Object.values(newClase).some(value => {
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

            for (const field in newClase) {
                if (newClase[field] === null || newClase[field] === undefined) {
                    updatedEmptyFields[field] = true;
                } else if (typeof newClase[field] === 'string' && newClase[field].trim() === '') {
                    updatedEmptyFields[field] = true;
                } else if (typeof newClase[field] === 'number' && isNaN(newClase[field])) {
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
            const response = await fetch(`${API_BASE_URL}/${newClase.codigo}`, {
                method: 'GET',
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            });
            if (response.status === 404) {
                // Intentar el request usando el servicio
                try {
                    setIsLoading2(true);
                    const response = await createClase(newClase); // EDITABLE

                    if (response === 201) {
                        toast.current.show({
                            severity: 'success',
                            summary: 'Proceso exitoso',
                            detail: 'Clase creada con éxito', // EDITABLE
                            life: 3000,
                        });
                        resetStates();
                    }
                } catch (error) {
                    toast.current.show({
                        severity: 'error',
                        summary: 'Error',
                        detail: 'Hubo un error al crear la clase', // EDITABLE
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
        setNewClase(defaultNewClase); // EDITABLE
        setEmptyFields(defaultEmptyFields);
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
                        <span>Crear nueva clase</span> 
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
                            <input className={`${emptyFields.codigo && 'form-group-empty'}`} type="number" id="codigo" name="codigo" value={newClase.codigo || ''} onChange={handleInputChange} required maxLength="10" placeholder="Código único de la clase"/>
                        </div>
                        <div className="form-group">
                            <label htmlFor="descripcionEspanol">Descripción en español <small className="requiredAsterisk">(Obligatorio)</small></label>
                            <textarea className={`${emptyFields.descripcionEspanol && 'form-group-empty'}`} id="descripcionEspanol" name="descripcionEspanol" value={newClase.descripcionEspanol || ''} onChange={handleInputChange} required maxLength="1000" placeholder="Descripción de la clase en español" />
                        </div>
                        <div className="form-group">
                            <label htmlFor="descripcionIngles">Descripción en inglés <small className="requiredAsterisk">(Obligatorio)</small></label>
                            <textarea className={`${emptyFields.descripcionIngles && 'form-group-empty'}`} id="descripcionIngles" name="descripcionIngles" value={newClase.descripcionIngles || ''} onChange={handleInputChange} required maxLength="1000" placeholder="Descripción de la clase en inglés" />
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
                        <button type="submit" className="form-accept-btn" onClick={handleCreate}>Crear</button>
                    </section>
                </div>
            </Draggable>
            <Toast ref={toast} />
        </>
    );
}

export default ClasesCreate;