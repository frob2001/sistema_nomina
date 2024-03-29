﻿import React, { useState, useRef, useEffect } from 'react';
import Draggable from 'react-draggable';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { Dropdown } from 'primereact/dropdown';
import { TabView, TabPanel } from 'primereact/tabview';
import { ConfirmPopup, confirmPopup } from 'primereact/confirmpopup';
import useSWR from 'swr';

// Servicios
import { useGestionService } from '../../services/useGestionService';
import { useUsuarios } from '../../services/useUsuarios';

// Auth
const apiEndpoint = import.meta.env.VITE_MAIN_ENDPOINT;

function UsuariosCreate({ onClose, onCreated, onEdited, onDeleted, selectedUsuarioId }) { //EDITABLE

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

    const { createObject, updateObject, deleteObject } = useUsuarios(); // Servicio necesario para crear el objeto
    const toast = useRef(null); // Referencia para el toast

    const { data: usuarioData } = useSWR(`${apiEndpoint}/Usuario/Info/${selectedUsuarioId}`, fetcher); 
    const { data: emisores, error, isLoading, isValidating, refresh } = useGestionService('Emisor');
    const { data: sucursales } = useGestionService('Sucursal');
    
    // --------------- Estados que no requieren persistencia --------------------------------------------

    const [isLoading2, setIsLoading2] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false); // Para los dropdowns
    const defaultNewUsuario = {}; 
    const defaultRequiredFields = {
        nombre: false,
        correoElectronico: false,
        contrasena: false,
        emisorId: false,
        sucursalId: false,
    };
 
    // --------------- Estados que requieren persistencia --------------------------------------------

    const [selectedEmisor, setSelectedEmisor] = useState(null);
    const [selectedSucursal, setSelectedSucursal] = useState(null);

    // Lógica general
    const [newUsuario, setNewUsuario] = useState(defaultNewUsuario);// mapea el objeto: ESPECIFICO
    const [isAnyEmpty, setisAnyEmpty] = useState(false); //Saber si hay campos vacíos: GENERAL
    const [requiredFields, setRequiredFields] = useState(defaultRequiredFields); // mapea los inputs requeridos: GENERAL
    const [activeIndex, setActiveIndex] = useState(0); // Conoce el indice de tab activo para el tabview

    useEffect(() => {
        if (selectedUsuarioId && usuarioData) { // Checks if empleadoId prop is provided and usuarioData is loaded
            setNewUsuario(usuarioData); // Sets the employee data

            setSelectedEmisor(emisores?.find(em => em.emisorId === usuarioData.emisor.emisorId));
            setSelectedSucursal(sucursales?.find(suc => suc.sucursalId === usuarioData.sucursal.sucursalId));
        }
    }, [newUsuario, selectedUsuarioId, usuarioData, emisores, sucursales]);

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
        setNewUsuario(prev => ({ ...prev, [name]: inputValue })); // Update the newCliente state with the new value for text inputs
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
            const response = await deleteObject(selectedUsuarioId);
            if (response.status === 204) {
                onDeleted()
                onClose();
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

    const handleCreate = async (e) => {
        e.preventDefault();

        // Verificar si existe algun campo requerido vacío
        const anyFieldEmpty = validateRequiredFields(newUsuario);
        console.log('Valores vacíos');

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

            const response = await createObject(newUsuario); 
            status = response.status;
            data = response.data;

            if (status === 201) {
                toast.current.show({
                    severity: 'success',
                    summary: 'Proceso exitoso',
                    detail: `Registro creado`, // EDITABLE
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
        const anyFieldEmpty = validateRequiredFields(newUsuario);

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

            const response = await updateObject(newUsuario);
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
        setSelectedEmisor(null);
        setSelectedSucursal(null);

        // Lógica general
        setNewUsuario(defaultNewUsuario);
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
                <div className="form-container wider-form" style={{ height: '500px' }} >
                    {(isLoading2) &&
                        <div className="spinner-container">
                            <div className="spinner" />
                        </div>
                    }
                    <section className="form-header">
                        <span>{ selectedUsuarioId ? 'Editar usuario' : 'Nuevo usuario' }</span> 
                        <div className="form-header-buttons">
                            <Button className="form-header-btn" onClick={handleCancel}>
                                <i className="pi pi-times" style={{ fontSize: '0.6rem', color: 'var(--secondary-blue)', fontWeight: '600' }}></i>
                            </Button>
                        </div>
                    </section>
               
                    <TabView activeIndex={activeIndex} onTabChange={(e) => setActiveIndex(e.index)}>
                        <TabPanel header="Usuario" leftIcon="pi pi-user mr-2">
                            <div className="form-body form-body--create">
                                <section>
                                    <div className="form-group-label">
                                        <i className="pi pi-info-circle"></i>
                                        <label>Información del usuario</label>
                                    </div>
                                    <div className="form-body-group">
                                        <div className="form-group form-group-double">
                                            <label> Emisor <small className="requiredAsterisk">(Obligatorio)</small></label>
                                            <div>
                                                {
                                                    error || !emisores ? (
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
                                                            className={`${requiredFields.emisorId && 'form-group-empty'}`}
                                                            style={{ width: '100%' }}
                                                            value={selectedEmisor}
                                                            onChange={(e) => {
                                                                setSelectedEmisor(e.value);
                                                                if (e.value && e.value.emisorId !== undefined) {
                                                                    setNewUsuario(prevState => ({
                                                                        ...prevState,
                                                                        emisorId: e.value.emisorId
                                                                    }));
                                                                }
                                                            }}
                                                            options={emisores}
                                                            optionLabel="nombre"
                                                            placeholder="Selecciona un emisor"
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
                                            <label> Sucursal <small className="requiredAsterisk">(Obligatorio)</small></label>
                                            <div>
                                                {
                                                    error || !sucursales ? (
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
                                                            className={`${requiredFields.sucursalId && 'form-group-empty'}`}
                                                            style={{ width: '100%' }}
                                                            value={selectedSucursal}
                                                            onChange={(e) => {
                                                                setSelectedSucursal(e.value);
                                                                if (e.value && e.value.sucursalId !== undefined) {
                                                                    setNewUsuario(prevState => ({
                                                                        ...prevState,
                                                                        sucursalId: e.value.sucursalId
                                                                    }));
                                                                }
                                                            }}
                                                            options={sucursales}
                                                            optionLabel="nombre"
                                                            placeholder="Selecciona una sucursal"
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
                                            <label> Nombre <small className="requiredAsterisk">(Obligatorio)</small></label>
                                            <input className={`${requiredFields.nombre && 'form-group-empty'}`} type="text" name="nombre" value={newUsuario.nombre || ''} onChange={handleInputChange} maxLength="70" placeholder="Nombre del usuario" />
                                        </div> 
                                        <div className="form-group">
                                            <label> Correo electrónico <small className="requiredAsterisk">(Obligatorio)</small></label>
                                            <input className={`${requiredFields.correoElectronico && 'form-group-empty'}`} type="text" name="correoElectronico" value={newUsuario.correoElectronico || ''} onChange={handleInputChange} maxLength="70" placeholder="Correo de acceso para el usuario" />
                                        </div> 
                                        <div className="form-group">
                                            <label> Contraseña <small className="requiredAsterisk">(Obligatorio)</small></label>
                                            <input className={`${requiredFields.contrasena && 'form-group-empty'}`} type="password" name="contrasena" value={newUsuario.contrasena || ''} onChange={handleInputChange} maxLength="70" placeholder="Contraseña" />
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
                            selectedUsuarioId ? 
                            <div>
                                <button style={{marginRight: '5px'}} onClick={confirmDeletion} className="form-delete-btn">Eliminar</button>
                                <button type="submit" className="form-accept-btn" onClick={handleEdit}>Editar</button>
                            </div>
                             :
                            <button type="submit" className="form-accept-btn" onClick={handleCreate}>Crear</button>
                        }
                        
                    </section>
                </div>
            </Draggable>
            <ConfirmPopup />
            <Toast ref={toast} />
        </>
    );
}

export default UsuariosCreate;