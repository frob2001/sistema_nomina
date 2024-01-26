import React, { useState, useRef, useEffect } from 'react';
import Draggable from 'react-draggable';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { Dropdown } from 'primereact/dropdown';
import { TabView, TabPanel } from 'primereact/tabview';

// Redux
import { useSelector, useDispatch } from 'react-redux';
import { saveData, deleteData } from '../../../context/clienteSlice'; //EDITABLE: MAIN
import { resetState } from '../../../context/contactoCSlice';

// Componentes
import ContactosTableC from '../ContactosCliente/ContactosTableC';
import DocumentPickerC from '../../miscComponents/Documents/DocumentPickerC';

// Servicios
import { useClientes } from '../../../services/useClientes'; // EDITABLE: MAIN
import { usePaises } from '../../../services/usePais'; // EDITABLE: DROPDOWN
import { useIdiomas } from '../../../services/useIdiomas'; // EDITABLE: DROPDOWN
import { useFiles } from '../../../services/useFiles'; // Para la creación de documentos y correos


function ClientesCreate({ onClose, onCreated }) { //EDITABLE

    // --------------- Redux store settings -------------------------------------------------------

    const dispatch = useDispatch();
    const clienteCreateData = useSelector(state => state.cliente.ClienteCreate); // EDITABLE
    const newContacts = useSelector(state => state.contactoC.newContactos); // Lee los contactos creados

    // --------------- Setup (Servicios, Contextos, Referencias) -----------------------------------

    const { createObject } = useClientes(); // Servicio necesario para crear el objeto
    const { uploadFile } = useFiles(); // Servicio para subir archivos
    const isClosingRef = useRef(false); // Referencia para eliminar persistencia
    const toast = useRef(null); // Referencia para el toast
    const { paises, error: errorP, isLoading: isLoadingP, isValidating: isValidatingP, refresh: refreshP  } = usePaises(); // Para el dropdown de paises
    const { idiomas, error: errorI, isLoading: isLoadingI, isValidating: isValidatingI, refresh: refreshI } = useIdiomas(); // Para el dropdown de idiomas

    // --------------- Estados que no requieren persistencia --------------------------------------------

    const [isLoading2, setIsLoading2] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false); // Para los dropdowns
    const defaultNewCliente = {
        nombre: '',
        codigoPais: '',
        ciudad: '',
        estadoProvincia: '',
        codigoIdioma: '',
        direccion: '',
        web: '',
        telefono: '',
        email: '',
        notas: '',
        usuarioWeb: '',
        claveWeb: '',
        contactosClientes: []
    }; //EDITABLE: todos los campos del cliente
    const defaultRequiredFields = {
        nombre: false,
        codigoPais: false,
        ciudad: false,
        codigoIdioma: false
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
    const [selectedIdioma, setSelectedIdioma] = useState(null); // saber el idioma seleccionado: ESPECIFICO
    const [isAnyEmpty, setisAnyEmpty] = useState(false); //Saber si hay campos vacíos: GENERAL
    const [newCliente, setNewCliente] = useState(defaultNewCliente);// mapea el objeto: ESPECIFICO
    const [requiredFields, setRequiredFields] = useState(defaultRequiredFields); // mapea los inputs requeridos: GENERAL
    const [activeIndex, setActiveIndex] = useState(0); // Conoce el indice de tab activo para el tabview

    // --------------- Funciones necesarias para persistencia ----------------------------------------

    useEffect(() => {
        if (clienteCreateData) { // EDITABLE
            setSelectedPais(clienteCreateData.selectedPais || null); // EDITABLE
            setSelectedIdioma(clienteCreateData.selectedIdioma || null); // EDITABLE
            setisAnyEmpty(clienteCreateData.isAnyEmpty || false); // EDITABLE
            setNewCliente(clienteCreateData.newCliente || defaultNewCliente); // EDITABLE
            setRequiredFields(clienteCreateData.requiredFields || defaultRequiredFields); // EDITABLE
            setActiveIndex(clienteCreateData.activeIndex || 0); // EDITABLE
        }
    }, []); // Se ejecuta cuando el componente renderiza, lee los datos guardados: GENERAL

    const saveState = () => {
        dispatch(saveData({ objectName: 'ClienteCreate', value: { isAnyEmpty, newCliente, requiredFields, selectedPais, selectedIdioma, activeIndex } }));
    }; // Guarda en el contexto los estados como objetos: ESPECIFICO

    useEffect(() => {
        return () => {
            if (!isClosingRef.current) {
                saveState();
            }
        };
    }, [isAnyEmpty, newCliente, requiredFields, selectedPais, selectedIdioma, activeIndex]); // Se ejecuta con cada cambio de estado, persiste los datos: ESPECIFICO -> PUEDE OPTIMIZARSE

    const deletePersistedStates = () => {
        dispatch(deleteData({ objectName: 'ClienteCreate' })); // EDITABLE
    }; // Elimina los datos en el objeto del contexto: ESPECIFICO

    // --------------- Funciones especificas del componente ------------------------------------------

    // ------------------ DROPDOWNS ---------------------------------------

    useEffect(() => {
        if (selectedPais) {
            setNewCliente(prev => ({
                ...prev,
                codigoPais: selectedPais.codigoPais
            }));
        }
    }, [selectedPais]); // Actualiza el objeto cuando el valor del dropdown cambia (hacer uno por cada dropdown): ESPECIFICO

    useEffect(() => {
        if (selectedIdioma) {
            setNewCliente(prev => ({
                ...prev,
                codigoIdioma: selectedIdioma.codigoIdioma
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

    // ------------------ DOCUMENTOS ---------------------------------------
    useEffect(() => {

        const requiredEmpty = Object.keys(defaultRequiredFields).some(key => {
            return isEmptyValue(newCliente[key]);
        });

        setIsRequiredEmpty(requiredEmpty);
    }, [newCliente]); // Habilita o deshabilita la pestaña de documentos si falta un campo requerido

    // ------------------ FIN DOCUMENTOS ---------------------------------------

    useEffect(() => {
        setNewCliente(prevCliente => ({
            ...prevCliente,
            contactosClientes: newContacts
        }));
    }, [newContacts]); // Añade los contactos creados al cliente en creación

    const handleInputChange = (e) => {
        const { name, value } = e.target;

        // Check if the input name is a key in the requiredFields
        if (requiredFields.hasOwnProperty(name)) {
            const updatedRequiredFields = { ...requiredFields };
            updatedRequiredFields[name] = false; // Reset to false if the required field has been edited
            setRequiredFields(updatedRequiredFields);
        }

        // Update the newCliente state with the new value
        setNewCliente(prevCliente => ({ ...prevCliente, [name]: value }));

    }; // Maneja el cambio en un input: ESPECIFICO

    const isEmptyValue = value => {
        if (value === null || value === undefined) return true;
        if (typeof value === 'string') return value.trim() === '';
        if (typeof value === 'number') return isNaN(value) || value === 0;
        if (Array.isArray(value)) return value.length === 0;
        return false;
    }; // Verifica si un valor específico está vacío

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

    const prepareForDatabase = (cliente) => {
        const modifiedCliente = {
            ...cliente,
            contactosClientes: cliente.contactosClientes.map(({ idioma, tipoContacto, ...rest }) => rest)
        };

        return modifiedCliente;
    }; // prepara los contactos antes de enviarlos: les quita Idioma y TipoContacto, solo servían para ver en la tabla

    const handleCreate = async (e) => {
        e.preventDefault();

        // Verificar si existe algun campo requerido vacío
        const anyFieldEmpty = validateRequiredFields(newCliente);

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

        // Crea el cliente nuevo
        try {
            setIsLoading2(true);
            const newClienteETL = prepareForDatabase(newCliente); // Prepara los contactos para el envío
            const response = await createObject(newClienteETL); // Recibe el objeto creado y el status
            status = response.status;
            data = response.data;

            // Verificar si el status es 201 (Created)
            if (status === 201) {
                toast.current.show({
                    severity: 'success',
                    summary: 'Proceso exitoso',
                    detail: `Cliente creado con ID: ${data?.clienteId}`, // EDITABLE
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
                detail: 'Hubo un error al crear el cliente', // EDITABLE
                life: 3000,
            });
        } finally {
            // Proceed to create documents only if the client was successfully created
            if (status === 201 && data?.clienteId) {
                documentos.forEach(async documento => {
                    try {
                        await uploadFile(documento, data.clienteId, "cliente", "documento");
                    } catch (uploadError) {
                        // Handle errors for document uploads here
                        console.error(uploadError);
                        // Optionally show a toast or perform other error handling
                    }
                });

                correos.forEach(async correo => {
                    try {
                        await uploadFile(correo, data.clienteId, "cliente", "correo");
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
        setNewCliente(defaultNewCliente); // EDITABLE
        setRequiredFields(defaultRequiredFields);
        setSelectedIdioma(null);
        setSelectedPais(null);

        dispatch(resetState()); // Limpia los datos del contactoC Slice
    } // Resetea los estados del componente: ESPECIFICO

    const handleCancel = () => {
        isClosingRef.current = true;
        dispatch(resetState()); // Limpia el contactoC slice
        deletePersistedStates(); // Limpia la data de este componente
        onClose();
    }; // Maneja el cancelar del formulario (Datos no persisten): GENERAL

    const handleMinimize = () => {
        isClosingRef.current = false; 
        onClose();
    }; // Maneja el minimizar del formulario (Datos persisten): GENERAL

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
            <Draggable cancel="input, button, textarea, #contactoCreate" bounds="parent">
                <div className="form-container wider-form">
                    {(isLoading2) &&
                        <div className="spinner-container">
                            <div className="spinner" />
                        </div>
                    }
                    <section className="form-header">
                        <span>Crear nuevo cliente</span> 
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
                        <TabPanel header="Cliente" leftIcon="pi pi-briefcase mr-2">
                            <form className="form-body form-body--create">
                                <section>
                                    <div className="form-group-label">
                                        <i className="pi pi-briefcase"></i>
                                        <label htmlFor="clienteInfo">Cliente</label>
                                    </div>
                                    <div id="clienteInfo" className="form-body-group">
                                        <div className="form-group">
                                            <label htmlFor="nombre">Nombre <small className="requiredAsterisk">(Obligatorio)</small></label>
                                            <input className={`${requiredFields.nombre && 'form-group-empty'}`} type="text" id="nombre" name="nombre" value={newCliente.nombre || ''} onChange={handleInputChange} required maxLength="100" placeholder="Nombre del cliente"/>
                                        </div>
                                        <div className="form-group">
                                            <label htmlFor="idiomas">Idioma <small className="requiredAsterisk">(Obligatorio)</small></label>
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
                                                            className={`${requiredFields.codigoIdioma && 'form-group-empty'}`}
                                                            id="idiomas"
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
                                        <label htmlFor="clienteUbicacion">Ubicación</label>
                                    </div>
                                    <div id="clienteUbicacion" className="form-body-group">
                                        <div className="form-group">
                                            <label htmlFor="ciudad">Ciudad <small className="requiredAsterisk">(Obligatorio)</small></label>
                                            <input className={`${requiredFields.ciudad && 'form-group-empty'}`} type="text" id="ciudad" name="ciudad" value={newCliente.ciudad || ''} onChange={handleInputChange} required maxLength="100" placeholder="Ciudad del cliente" />
                                        </div>
                                        <div className="form-group">
                                            <label htmlFor="provincia">Provincia / Estado</label>
                                            <input type="text" id="provincia" name="estadoProvincia" value={newCliente.estadoProvincia || ''} onChange={handleInputChange} required maxLength="100" placeholder="Provincia / Estado del cliente" />
                                        </div>
                                        <div className="form-group">
                                            <label htmlFor="paises">País <small className="requiredAsterisk">(Obligatorio)</small></label>
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
                                                            id="paises"
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
                                            <label htmlFor="direccion">Dirección</label>
                                            <input type="text" id="direccion" name="direccion" value={newCliente.direccion || ''} onChange={handleInputChange} required maxLength="2000" placeholder="Dirección completa del cliente" />
                                        </div>
                                    </div>
                                </section>
                                <section>
                                    <div className="form-group-label">
                                        <i className="pi pi-phone"></i>
                                        <label htmlFor="clienteContacto">Contacto</label>
                                    </div>
                                    <div id="clienteContacto" className="form-body-group">
                                        <div className="form-group">
                                            <label htmlFor="email">E-mail</label>
                                            <input type="email" id="email" name="email" value={newCliente.email || ''} onChange={handleInputChange} required maxLength="70" placeholder="E-mail del cliente" />
                                        </div>
                                        <div className="form-group">
                                            <label htmlFor="telefono">Teléfono</label>
                                            <input type="text" id="telefono" name="telefono" value={newCliente.telefono || ''} onChange={handleInputChange} required maxLength="70" placeholder="Teléfono del cliente" />
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
                                        <label htmlFor="clienteCuenta">Cuenta</label>
                                    </div>
                                    <div id="clienteCuenta" className="form-body-group">
                                        <div className="form-group">
                                            <label htmlFor="web">Portal web</label>
                                            <input type="text" id="web" name="web" value={newCliente.web || ''} onChange={handleInputChange} required maxLength="200" placeholder="Dirección del portal web" />
                                        </div>
                                        <div className="form-group">
                                            <label htmlFor="usuarioWeb">Usuario del portal</label>
                                            <input type="text" id="usuarioWeb" name="usuarioWeb" value={newCliente.usuarioWeb || ''} onChange={handleInputChange} required maxLength="100" placeholder="Usuario para el portal web" />
                                        </div>
                                        <div className="form-group">
                                            <label htmlFor="claveWeb">Contraseña del portal</label>
                                            <input type="text" id="claveWeb" name="claveWeb" value={newCliente.claveWeb || ''} onChange={handleInputChange} required maxLength="100" placeholder="Contraseña para el portal web" />
                                        </div>
                                    </div>
                                </section>
                                <section>
                                    <div className="form-group-label">
                                        <i className="pi pi-comment"></i>
                                        <label htmlFor="clienteComentarios">Comentarios</label>
                                    </div>
                                    <div id="clienteComentarios" className="form-body-group">
                                        <div className="form-group">
                                            <label htmlFor="notas">Comentarios</label>
                                            <textarea type="text" id="notas" name="notas" value={newCliente.notas || ''} onChange={handleInputChange} maxLength="1000" placeholder="Comentarios relacionados al cliente (máx. 1000 caracteres)" />
                                        </div>
                                    </div>
                                </section>
                            </form>
                        </TabPanel>
                        <TabPanel header="Contactos" leftIcon="pi pi-user mr-2">
                            <section className="form-body form-body--create">
                                <ContactosTableC />
                            </section>
                        </TabPanel>
                        <TabPanel header="Documentos" leftIcon="pi pi-paperclip mr-2" disabled={isRequiredEmpty} className={`${isRequiredEmpty && 'disabled-tab-panel'}`}>
                            <div className="form-info-msg" style={{paddingBottom:'0'}}>
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
                        <button style={errorI || errorP && { backgroundColor: 'var(--even-darker-gray)' }} disabled={errorI || errorP} type="submit" className="form-accept-btn" onClick={handleCreate}>Crear</button>
                    </section>
                </div>
            </Draggable>
            <Toast ref={toast} />
        </>
    );
}

export default ClientesCreate;