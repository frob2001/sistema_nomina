import React, { useState, useRef, useEffect } from 'react';
import Draggable from 'react-draggable';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { Dropdown } from 'primereact/dropdown';
import { TabView, TabPanel } from 'primereact/tabview';

// Redux
import { useSelector, useDispatch } from 'react-redux';
import { saveData, deleteData } from '../../../context/propietarioSlice'; //EDITABLE: MAIN

// Componentes
import DocumentPickerC from '../../miscComponents/Documents/DocumentPickerC';

// Servicios
import { usePropietarios } from '../../../services/usePropietarios'; // EDITABLE: MAIN
import { useAbogados } from '../../../services/useAbogados'; // EDITABLE: DROPDOWN
import { usePaises } from '../../../services/usePais'; // EDITABLE: DROPDOWN
import { useFiles } from '../../../services/useFiles'; // Para la creación de documentos y correos

function PropietariosCreate({ onClose, onCreated }) { //EDITABLE

    // --------------- Redux store settings -------------------------------------------------------

    const dispatch = useDispatch();
    const propietarioCreateData = useSelector(state => state.propietario.PropietarioCreate); // EDITABLE

    // --------------- Setup (Servicios, Contextos, Referencias) -----------------------------------

    const { createObject } = usePropietarios(); // Servicio necesario para crear el objeto
    const { uploadFile } = useFiles(); // Servicio para subir archivos
    const isClosingRef = useRef(false); // Referencia para eliminar persistencia
    const toast = useRef(null); // Referencia para el toast

    const { abogados, error: errorA, isLoading: isLoadingA, isValidating: isValidatingA, refresh: refreshA } = useAbogados(); // Para el dropdown de abogados
    const { paises, error: errorP, isLoading: isLoadingP, isValidating: isValidatingP, refresh: refreshP } = usePaises(); // Para el dropdown de paises

    // --------------- Estados que no requieren persistencia --------------------------------------------

    const [isLoading2, setIsLoading2] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false); // Para los dropdowns
    const defaultNewPropietario = {
        nombre: '',
        codigoPais: '',
        numeroPoder: '',
        fechaPoder: '',
        origen: '',
        notas: '',
        general: false,
        abogadosIds: []
    }; //EDITABLE: todos los campos del propietario
    const defaultRequiredFields = {
        nombre: false,
        codigoPais: false,
    }; // EDITABLE: solo los campos requeridos

    // --------------- Estados para documentos (sin persistencia) --------------------------------------------

    const [documentos, setDocumentos] = useState([]); // Para los documentos que se subirán
    const [correos, setCorreos] = useState([]); // Para los correos que se subirán
    const [isRequiredEmpty, setIsRequiredEmpty] = useState(true);

    const handleDocumentosCallback = (newFiles) => {
        setDocumentos(newFiles);
    }; // Callback para actualizar documentos

    const handleCorreosCallback = (newFiles) => {
        setCorreos(newFiles);
    }; // Callback para actualizar correos

    // --------------- Estados que requieren persistencia --------------------------------------------

    const [selectedPais, setSelectedPais] = useState(null); // saber el pais seleccionado: ESPECIFICO
    const [selectedAbogado, setSelectedAbogado] = useState(null); // saber el abogado seleccionado: ESPECIFICO
    const [isAnyEmpty, setisAnyEmpty] = useState(false); //Saber si hay campos vacíos: GENERAL
    const [newPropietario, setNewPropietario] = useState(defaultNewPropietario);// mapea el objeto: ESPECIFICO
    const [requiredFields, setRequiredFields] = useState(defaultRequiredFields); // mapea los inputs requeridos: GENERAL
    const [apoderados, setApoderados] = useState([]); // mapea los abogados que serán añadidos
    const [activeIndex, setActiveIndex] = useState(0); // Conoce el indice de tab activo para el tabview

    // --------------- Funciones necesarias para persistencia ----------------------------------------

    useEffect(() => {
        if (propietarioCreateData) { // EDITABLE
            setSelectedPais(propietarioCreateData.selectedPais || null); // EDITABLE
            setSelectedAbogado(propietarioCreateData.selectedAbogado || null); // EDITABLE
            setisAnyEmpty(propietarioCreateData.isAnyEmpty || false); // EDITABLE
            setNewPropietario(propietarioCreateData.newPropietario || defaultNewPropietario); // EDITABLE
            setRequiredFields(propietarioCreateData.requiredFields || defaultRequiredFields); // EDITABLE
            setApoderados(propietarioCreateData.apoderados || []); // EDITABLE
            setActiveIndex(propietarioCreateData.activeIndex || 0); // EDITABLE
        }
    }, []); // Se ejecuta cuando el componente renderiza, lee los datos guardados: GENERAL

    const saveState = () => {
        dispatch(saveData({ objectName: 'PropietarioCreate', value: { isAnyEmpty, newPropietario, requiredFields, selectedPais, selectedAbogado, apoderados, activeIndex } }));
    }; // Guarda en el contexto los estados como objetos: ESPECIFICO

    useEffect(() => {
        return () => {
            if (!isClosingRef.current) {
                saveState();
            }
        };
    }, [isAnyEmpty, newPropietario, requiredFields, selectedPais, selectedAbogado, apoderados, activeIndex]); // Se ejecuta con cada cambio de estado, persiste los datos: ESPECIFICO -> PUEDE OPTIMIZARSE

    const deletePersistedStates = () => {
        dispatch(deleteData({ objectName: 'PropietarioCreate' })); // EDITABLE
    }; // Elimina los datos en el objeto del contexto: ESPECIFICO

    // --------------- Funciones especificas del componente ------------------------------------------

    // ------------------ DROPDOWNS ---------------------------------------

    useEffect(() => {
        if (selectedPais) {
            setNewPropietario(prev => ({
                ...prev,
                codigoPais: selectedPais.codigoPais
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

    // ------------------ DOCUMENTOS ---------------------------------------
    useEffect(() => {

        const requiredEmpty = Object.keys(defaultRequiredFields).some(key => {
            return isEmptyValue(newPropietario[key]);
        });

        setIsRequiredEmpty(requiredEmpty);
    }, [newPropietario]); // Habilita o deshabilita la pestaña de documentos si falta un campo requerido

    // ------------------ FIN DOCUMENTOS ---------------------------------------

    useEffect(() => {

        const abogadosIds = apoderados.map(abogado => abogado.abogadoId);

        setNewPropietario(prevPropietario => ({
            ...prevPropietario,
            abogadosIds: abogadosIds
        }));
    }, [apoderados]); // Guarda los ids de los apoderados elegidos en la propiedad del propietario

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
        setNewPropietario(prev => ({ ...prev, [name]: inputValue }));
    }; // Maneja el cambio en un input: ESPECIFICO

    const isEmptyValue = value => {
        if (value === null || value === undefined) return true;
        if (typeof value === 'string') return value.trim() === '';
        if (typeof value === 'number') return isNaN(value) || value === 0;
        if (Array.isArray(value)) return value.length === 0;
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

    const handleCreate = async (e) => {
        e.preventDefault();

        // Verificar si existe algun campo requerido vacío
        const anyFieldEmpty = validateRequiredFields(newPropietario);

        if (anyFieldEmpty) {
            setisAnyEmpty(true);
            return;
        } else {
            setisAnyEmpty(false);
        }

        const allDocumentsValid = documentos.every(doc => {
            return doc.titulo.trim() !== '' && doc.descripcion.trim() !== '';
        });

        if (!allDocumentsValid) {
            toast.current.show({
                severity: 'error',
                summary: 'Alerta',
                detail: 'Por favor, llena todos los campos de título y descripción para todos los documentos.', // EDITABLE
                life: 3000,
            });
            return;
        }

        const allCorreosValid = correos.every(correo => {
            return correo.titulo.trim() !== '' && correo.descripcion.trim() !== '';
        });

        if (!allCorreosValid) {
            toast.current.show({
                severity: 'error',
                summary: 'Alerta',
                detail: 'Por favor, llena todos los campos de título y descripción para todos los correos.', // EDITABLE
                life: 3000,
            });
            return;
        }

        let status;
        let data;

        // Crea el propietario nuevo
        try {
            setIsLoading2(true);
            const response = await createObject(newPropietario); // EDITABLE: usa el servicio para crear
            status = response.status;
            data = response.data;

            if (status === 201) {
                toast.current.show({
                    severity: 'success',
                    summary: 'Proceso exitoso',
                    detail: `Propietario creado con ID: ${data?.propietarioId}`, // EDITABLE
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
                detail: 'Hubo un error al crear el propietario', // EDITABLE
                life: 3000,
            });
        } finally {
            // Proceed to create documents only if the client was successfully created
            if (status === 201 && data?.propietarioId) {
                documentos.forEach(async documento => {
                    try {
                        await uploadFile(documento, data.propietarioId, "propietario", "documento");
                    } catch (uploadError) {
                        // Handle errors for document uploads here
                        console.error(uploadError);
                        // Optionally show a toast or perform other error handling
                    }
                });

                correos.forEach(async correo => {
                    try {
                        await uploadFile(correo, data.propietarioId, "propietario", "correo");
                    } catch (uploadError) {
                        // Handle errors for correo uploads here
                        console.error(uploadError);
                        // Optionally show a toast or perform other error handling
                    }
                });
            }
            setActiveIndex(0);
            setIsLoading2(false);
        }

    }; // Maneja la creación del objeto: ESPECIFICO

    const resetStates = () => {
        setisAnyEmpty(false);
        setNewPropietario(defaultNewPropietario); // EDITABLE
        setRequiredFields(defaultRequiredFields);
        setSelectedAbogado(null);
        setSelectedPais(null);
        setApoderados([]);
    } // Resetea los estados del componente: ESPECIFICO

    const handleCancel = () => {
        isClosingRef.current = true;
        deletePersistedStates(); // Limpia la data de este componente
        onClose();
    }; // Maneja el cancelar del formulario (Datos no persisten): GENERAL

    const handleMinimize = () => {
        isClosingRef.current = false; 
        onClose();
    }; // Maneja el minimizar del formulario (Datos persisten): GENERAL

    // -----------------------------------------------------------------------------------------------

    return (
        <>
            <Draggable cancel="input, button, textarea, #contactoCreate" bounds="parent">
                <div className="form-container wider-form">
                    {(isLoading2) &&
                        <div className="spinner-container">
                            <div className="spinner" />
                        </div>
                    }
                    <section className="form-header">
                        <span>Crear nuevo propietario</span> 
                        <div className="form-header-buttons">
                            <Button className="form-header-btn" onClick={handleMinimize}>
                                <i className="pi pi-minus" style={{ fontSize: '0.6rem', color:'var(--secondary-blue)',fontWeight: '800' }}></i>
                            </Button>
                            <Button className="form-header-btn" onClick={handleCancel}>
                                <i className="pi pi-times" style={{ fontSize: '0.6rem', color: 'var(--secondary-blue)', fontWeight: '600' }}></i>
                            </Button>
                        </div>
                    </section>
               
                    <TabView activeIndex={activeIndex} onTabChange={(e) => setActiveIndex(e.index)}>
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
                                            <input className={`${requiredFields.nombre && 'form-group-empty'}`} type="text" name="nombre" value={newPropietario.nombre || ''} onChange={handleInputChange} required maxLength="255" placeholder="Nombre del propietario"/>
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
                                            <input type="text" name="numeroPoder" value={newPropietario.numeroPoder || ''} onChange={handleInputChange} required maxLength="20" placeholder="Número del poder" />
                                        </div>
                                        <div className="form-group">
                                            <label>Fecha</label>
                                            <input type="date" name="fechaPoder" value={newPropietario.fechaPoder || ''} onChange={handleInputChange} required />
                                        </div>
                                        <div className="form-group center-switch">
                                            <label>General</label>
                                            <label className="switch">
                                                <input type="checkbox" name="general" checked={newPropietario.general} onChange={handleInputChange} />
                                                <span className="slider round"></span>
                                            </label>
                                        </div>
                                        <div className="form-group">
                                            <label>Origen</label>
                                            <textarea type="text" name="origen" value={newPropietario.origen || ''} onChange={handleInputChange} required maxLength="1000" placeholder="Origen del poder (máx. 1000 caracteres)" />
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
                                            <textarea type="text" name="notas" value={newPropietario.notas || ''} onChange={handleInputChange} maxLength="1000" placeholder="Comentarios relacionados al propietario (máx. 1000 caracteres)" />
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
                                            <div style={{display:'flex', flexDirection: 'row', gap: '10px'}}>
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
                                                <button className='rounded-icon-btn' onClick={handleAddAbogado}>
                                                    <i className="pi pi-user-plus" style={{ color: 'white', fontSize: '16px' }}></i>
                                                </button>
                                            </div>
                                        </div>
                                        <table className="table-list">
                                            <thead>
                                                <tr className="table-head">
                                                    <th>Apoderados agregados ({apoderados.length})</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {apoderados.map((abogado, index) => (
                                                    <tr className="table-row" key={index}>
                                                        <td className="table-nombre-abogado">{abogado.nombre} {abogado.apellido}</td>
                                                        <td className="table-delete-button">
                                                            <button className="rounded-icon-btn" onClick={(e) => handleDeleteAbogado(e, abogado)}>
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
                        <TabPanel header="Documentos" leftIcon="pi pi-paperclip mr-2" disabled={isRequiredEmpty} className={`${isRequiredEmpty && 'disabled-tab-panel'}`}>
                            <div className="form-info-msg" style={{ paddingBottom: '0' }}>
                                <i className="pi pi-exclamation-circle" style={{ fontSize: '0.8rem', margin: '0', color: 'var(--secondary-blue)', fontWeight: '600' }}></i>
                                <span>Por favor, permanezca en la pestaña para conservar los archivos seleccionados</span>
                            </div>
                            <section className="form-body form-body--create">
                                <DocumentPickerC type="documentos" onFilesChange={handleDocumentosCallback} />
                                <DocumentPickerC type="correos" onFilesChange={handleCorreosCallback} />
                            </section>
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
                        <button style={errorA || errorP && { backgroundColor: 'var(--even-darker-gray)' }} disabled={errorA || errorP} type="submit" className="form-accept-btn" onClick={handleCreate}>Crear</button>
                    </section>
                </div>
            </Draggable>
            <Toast ref={toast} />
        </>
    );
}

export default PropietariosCreate;