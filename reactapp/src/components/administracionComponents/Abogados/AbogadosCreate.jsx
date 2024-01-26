import React, { useState, useRef, useEffect } from 'react';
import Draggable from 'react-draggable';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { useAbogados } from '../../../services/useAbogados';
import { useSelector, useDispatch } from 'react-redux';
import { saveData, deleteData } from '../../../context/abogadoSlice';

function AbogadosCreate({ onClose }) {

    // --------------- Redux store settings -------------------------------------------------------

    const dispatch = useDispatch();
    const abogadoCreateData = useSelector(state => state.abogado.AbogadoCreate);

    // --------------- Setup (Servicios, Contextos, Referencias) -----------------------------------

    const { createAbogado } = useAbogados(); // Servicio necesario: EDITABLE
    const isClosingRef = useRef(false); // Referencia para eliminar persistencia: EDITABLE
    const toast = useRef(null); // Referencia para el toast: GENERAL

    // --------------- Estados que requieren persistencia --------------------------------------------

    const [isLoading2, setIsLoading2] = useState(false);
    const defaultNewAbogado = {
        nombre: '',
        apellido: '',
        identificacion: '',
        matricula: '',
        email: '',
        telefono: '',
    };
    const defaultEmptyFields = {
        nombre: false,
        apellido: false,
        identificacion: false,
        matricula: false,
        email: false,
        telefono: false,
    }
    const [isAnyEmpty, setisAnyEmpty] = useState(false); //Saber si hay campos vacíos: GENERAL
    const [newAbogado, setNewAbogado] = useState(defaultNewAbogado);// mapea el objeto: ESPECIFICO
    const [emptyFields, setEmptyFields] = useState(defaultEmptyFields); // mapea los inputs requeridos: ESPECIFICO

    // --------------- Funciones necesarias para persistencia ----------------------------------------

    useEffect(() => {
        if (abogadoCreateData) {
            setisAnyEmpty(abogadoCreateData.isAnyEmpty || false);
            setNewAbogado(abogadoCreateData.newAbogado || defaultNewAbogado);
            setEmptyFields(abogadoCreateData.emptyFields || defaultEmptyFields);
        }
    }, []); // Se ejecuta cuando el componente renderiza, lee los datos guardados: GENERAL
    const saveState = () => {
        dispatch(saveData({ objectName: 'AbogadoCreate', value: { isAnyEmpty, newAbogado, emptyFields } }));
    }; // Guarda en el contexto los estados como objetos: ESPECIFICO
    useEffect(() => {
        return () => {
            if (!isClosingRef.current) {
                saveState();
            }
        };
    }, [isAnyEmpty, newAbogado, emptyFields]); // Se ejecuta con cada cambio de estado, persiste los datos: ESPECIFICO -> PUEDE OPTIMIZARSE
    const deletePersistedStates = () => {
        dispatch(deleteData({ objectName: 'AbogadoCreate' }));
    }; // Elimina los datos en el objeto del contexto: ESPECIFICO

    // --------------- Funciones especificas del componente ------------------------------------------
    
    const handleInputChange = (e) => {
        const { name, value } = e.target;

        const updatedEmptyFields = { ...emptyFields };
        updatedEmptyFields[name] = false;
        setEmptyFields(updatedEmptyFields);

        if (name === 'nombre' || name === 'apellido') {
            const names = value.split(' ');
            const capitalizedNames = names.map((part) =>
                part.charAt(0).toUpperCase() + part.slice(1).toLowerCase()
            );
            const finalValue = capitalizedNames.join(' ');
            setNewAbogado({ ...newAbogado, [name]: finalValue });
        } else {
            setNewAbogado({ ...newAbogado, [name]: value });
        }
    }; // Maneja el cambio en un input: ESPECIFICO
    const isAnyFieldEmpty = () => {
        return Object.values(newAbogado).some(value => value.trim() === '');
    }; // Verifica si existe un campo del objeto vacío: ESPECIFICO
    const handleCreate = async (e) => {
        e.preventDefault();

        // Verificar si existe algun campo vacío
        if (isAnyFieldEmpty()) {
            const updatedEmptyFields = {};

            for (const field in newAbogado) {
                if (newAbogado[field].trim() === '') {
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

        // Intentar el request usando el servicio
        try {
            setIsLoading2(true);
            const response = await createAbogado(newAbogado);

            if (response === 201) {
                toast.current.show({
                    severity: 'success',
                    summary: 'Proceso exitoso',
                    detail: 'Abogado creado con éxito',
                    life: 3000,
                });
                resetStates();
            }
        } catch (error) {
            toast.current.show({
                severity: 'error',
                summary: 'Error',
                detail: 'Hubo un error al crear el abogado',
                life: 3000,
            });
        } finally {
            setIsLoading2(false);
        }
    }; // Maneja la creación del objeto: ESPECIFICO
    const resetStates = () => {
        setisAnyEmpty(false);
        setNewAbogado(defaultNewAbogado);
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
            <Draggable cancel="input, button" bounds="parent">
                <div className="form-container">
                    {(isLoading2) &&
                        <div className="spinner-container">
                            <div className="spinner" />
                        </div>
                    }
                    <section className="form-header">
                        <span>Crear nuevo abogado</span>
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
                            <label htmlFor="nombre">Nombre <small className="requiredAsterisk">(Obligatorio)</small></label>
                            <input className={`${emptyFields.nombre && 'form-group-empty'}`} type="text" id="nombre" name="nombre" value={newAbogado.nombre || ''} onChange={handleInputChange} required maxLength="30" placeholder="Nombre"/>
                        </div>
                        <div className="form-group">
                            <label htmlFor="apellido">Apellido <small className="requiredAsterisk">(Obligatorio)</small></label>
                            <input className={`${emptyFields.apellido && 'form-group-empty'}`} type="text" id="apellido" name="apellido" value={newAbogado.apellido || ''} onChange={handleInputChange} required maxLength="30" placeholder="Apellido" />
                        </div>
                        <div className="form-group">
                            <label htmlFor="identificacion">Identificación <small className="requiredAsterisk">(Obligatorio)</small></label>
                            <input className={`${emptyFields.identificacion && 'form-group-empty'}`} type="number" id="identificacion" name="identificacion" value={newAbogado.identificacion || ''} onChange={handleInputChange} required maxLength="15" placeholder="Número de identificación" />
                        </div>
                        <div className="form-group">
                            <label htmlFor="matricula">Matrícula <small className="requiredAsterisk">(Obligatorio)</small></label>
                            <input className={`${emptyFields.matricula && 'form-group-empty'}`} type="number" id="matricula" name="matricula" value={newAbogado.matricula || ''} onChange={handleInputChange} required maxLength="20" placeholder="Matrícula" />
                        </div>
                        <div className="form-group">
                            <label htmlFor="email">E-mail <small className="requiredAsterisk">(Obligatorio)</small></label>
                            <input className={`${emptyFields.email && 'form-group-empty'}`} type="email" id="email" name="email" value={newAbogado.email || ''} onChange={handleInputChange} required maxLength="100" placeholder="E-mail" />
                        </div>
                        <div className="form-group">
                            <label htmlFor="telefono">Teléfono <small className="requiredAsterisk">(Obligatorio)</small></label>
                            <input className={`${emptyFields.telefono && 'form-group-empty'}`} type="number" id="telefono" name="telefono" value={newAbogado.telefono || ''} onChange={handleInputChange} required maxLength="20" placeholder="Teléfono" />
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

export default AbogadosCreate;