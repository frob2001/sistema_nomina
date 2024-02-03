import React, { useState, useRef, useEffect } from 'react';
import Draggable from 'react-draggable';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { Dropdown } from 'primereact/dropdown';
import { TabView, TabPanel } from 'primereact/tabview';
import { ConfirmPopup, confirmPopup } from 'primereact/confirmpopup';
import useSWR from 'swr';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

// Servicios
import { useGestionService } from '../../services/useGestionService';
import { useUsuarios } from '../../services/useUsuarios';
import { useRoles } from '../../services/useRoles';

// Auth
const apiEndpoint = import.meta.env.VITE_MAIN_ENDPOINT;

function RolesCreate({ onClose, onCreated, onEdited, onDeleted, selectedRolPagoId }) { //EDITABLE

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

    const { createObject, updateObject, deleteObject } = useRoles(); // Servicio necesario para crear el objeto
    const toast = useRef(null); // Referencia para el toast

    const { data: rolPagoData } = useSWR(`${apiEndpoint}/RolPago/${selectedRolPagoId}`, fetcher); 
    const { data: companias, error, isLoading, isValidating, refresh } = useGestionService('Compania');
    const { data: usuarios } = useUsuarios();
    
    // --------------- Estados que no requieren persistencia --------------------------------------------

    const [isLoading2, setIsLoading2] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false); // Para los dropdowns
    const defaultNewRolPago = {}; 
    const defaultRequiredFields = {
        companiaId: false,
        anoGeneracion: false,
        mesGeneracion: false,
        usuarioId: false,
        fechaCreacion: false
    };
 
    // --------------- Estados que requieren persistencia --------------------------------------------

    const [selectedCompania, setSelectedCompania] = useState(null);
    const [selectedUsuario, setSelectedUsuario] = useState(null);

    // Lógica general
    const [newRolPago, setNewRolPago] = useState(defaultNewRolPago);// mapea el objeto: ESPECIFICO
    const [isAnyEmpty, setisAnyEmpty] = useState(false); //Saber si hay campos vacíos: GENERAL
    const [requiredFields, setRequiredFields] = useState(defaultRequiredFields); // mapea los inputs requeridos: GENERAL
    const [activeIndex, setActiveIndex] = useState(0); // Conoce el indice de tab activo para el tabview

    useEffect(() => {
        if (selectedRolPagoId && rolPagoData) { // Checks if empleadoId prop is provided and rolPagoData is loaded
            setNewRolPago({
                ...rolPagoData,
                usuarioId: usuarios?.find(usu => usu.correoElectronico === rolPagoData.usuario.correoElectronico).usuarioId,
                companiaId: companias?.find(comp => comp.companiaId === rolPagoData.compania.companiaId).companiaId
            }); // Sets the employee data

            setSelectedCompania(companias?.find(comp => comp.companiaId === rolPagoData.compania.companiaId));
            setSelectedUsuario(usuarios?.find(usu => usu.correoElectronico === rolPagoData.usuario.correoElectronico));
        }
    }, [/*newRolPago*/, selectedRolPagoId, rolPagoData, companias, usuarios]);

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

    const optionTemplateU = (option) => {
        return (
            <div className="dropdown-item-container">
                <span>{option.nombre} ({option.correoElectronico})</span>
            </div>
        );
    }; // EDITABLE: template para mostrar las opciones de un dropdown

    const selectedValueTemplateU = (option, props) => {
        if (option) {
            return (
                <div className="dropdown-item-container">
                    <span>{option.nombre} ({option.correoElectronico})</span>
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
        setNewRolPago(prev => ({ ...prev, [name]: inputValue })); // Update the newCliente state with the new value for text inputs
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
            const response = await deleteObject(selectedRolPagoId);
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
        const anyFieldEmpty = validateRequiredFields(newRolPago);
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

            const response = await createObject(newRolPago); 
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
        const anyFieldEmpty = validateRequiredFields(newRolPago);

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

            const newRolPagoFinal = {
                companiaId: newRolPago.compania.companiaId,
                anoGeneracion: newRolPago.anoGeneracion,
                mesGeneracion: newRolPago.mesGeneracion,
                usuarioId: newRolPago.usuarioId,
                fechaCreacion: newRolPago.fechaCreacion
            }

            const response = await updateObject(selectedRolPagoId, newRolPagoFinal);
            status = response.status;
            data = response.data;

            if (status === 204) {
                toast.current.show({
                    severity: 'success',
                    summary: 'Proceso exitoso',
                    detail: `Registro editado con éxito`, // EDITABLE
                    sticky: true,
                });
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
        setSelectedUsuario(null);

        // Lógica general
        setNewRolPago(defaultNewRolPago);
        setisAnyEmpty(false);
        setRequiredFields(defaultRequiredFields);
        setActiveIndex(0);
    } // Resetea los estados del componente: ESPECIFICO

    const handleCancel = () => {
        onClose();
    }; // Maneja el cancelar del formulario (Datos no persisten): GENERAL

    // -----------------------------------------------------------------------------------------------

    const handleGeneratePDF = () => {
        const anyFieldEmpty = validateRequiredFields(newRolPago);
        if (anyFieldEmpty) {
            toast.current.show({
                severity: 'warn',
                summary: 'Campos requeridos',
                detail: 'Por favor, complete todos los campos requeridos antes de generar el PDF.',
                life: 3000,
            });
            return;
        }

        const doc = new jsPDF();
        const tableColumn = ["Campo", "Valor"];
        const tableRows = [];

        // Define a table body
        const payrollData = [
            ["Compañía", selectedCompania ? selectedCompania.nombre : ''],
            ["Usuario", selectedUsuario ? `${selectedUsuario.nombre} (${selectedUsuario.correoElectronico})` : ''],
            ["Año", newRolPago.anoGeneracion || ''],
            ["Mes", newRolPago.mesGeneracion || ''],
            ["Fecha de Creación", newRolPago.fechaCreacion ? new Date(newRolPago.fechaCreacion).toLocaleDateString() : '']
        ];

        payrollData.forEach(data => {
            tableRows.push(data);
        });

        doc.autoTable(tableColumn, tableRows, { startY: 20 });

        const dateStr = new Date().toLocaleDateString();
        doc.text(`Rol de Pagos generado el: ${dateStr}`, 14, 15);

        // Improve the layout for the signature line
        let signatureYPosition = doc.lastAutoTable.finalY + 20; // Y position for the signature line
        doc.text("Firma:", 14, signatureYPosition);
        doc.setFont("helvetica", "italic");
        doc.setFontSize(10);
        doc.text(selectedUsuario ? selectedUsuario.nombre : '', 20, signatureYPosition + 10); // Set the name below the line
        doc.line(20, signatureYPosition + 5, 80, signatureYPosition + 5); // Signature line above the name

        // Save the PDF
        doc.save(`RolDePagos_${dateStr}.pdf`);
    };


    return (
        <>
            <Draggable cancel="input, button, textarea, table" bounds="parent">
                <div className="form-container wider-form" style={{ height: '500px' }}>
                    {(isLoading2) &&
                        <div className="spinner-container">
                            <div className="spinner" />
                        </div>
                    }
                    <section className="form-header">
                        <span>{ selectedRolPagoId ? 'Editar rol de pagos' : 'Nuevo rol de pagos' }</span> 
                        <div className="form-header-buttons">
                            <Button className="form-header-btn" onClick={handleCancel}>
                                <i className="pi pi-times" style={{ fontSize: '0.6rem', color: 'var(--secondary-blue)', fontWeight: '600' }}></i>
                            </Button>
                        </div>
                    </section>
               
                    <TabView activeIndex={activeIndex} onTabChange={(e) => setActiveIndex(e.index)}>
                        <TabPanel header="Rol de pagos" leftIcon="pi pi-money-bill mr-2">
                            <div className="form-body form-body--create">
                                <section>
                                    <div className="form-group-label">
                                        <i className="pi pi-info-circle"></i>
                                        <label>Información del rol</label>
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
                                                                    setNewRolPago(prevState => ({
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
                                            <label> Usuario <small className="requiredAsterisk">(Obligatorio)</small></label>
                                            <div>
                                                {
                                                    error || !usuarios ? (
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
                                                            className={`${requiredFields.usuarioId && 'form-group-empty'}`}
                                                            style={{ width: '100%' }}
                                                            value={selectedUsuario}
                                                            onChange={(e) => {
                                                                setSelectedUsuario(e.value);
                                                                if (e.value && e.value.usuarioId !== undefined) {
                                                                    setNewRolPago(prevState => ({
                                                                        ...prevState,
                                                                        usuarioId: e.value.usuarioId
                                                                    }));
                                                                }
                                                            }}
                                                            options={usuarios}
                                                            optionLabel="nombre"
                                                            placeholder="Selecciona un usuario"
                                                            filter
                                                            filterBy="nombre,correoElectronico"
                                                            virtualScrollerOptions={{ itemSize: 38 }}
                                                            valueTemplate={selectedValueTemplateU}
                                                            itemTemplate={optionTemplateU}
                                                        />
                                                    )
                                                }
                                            </div>
                                        </div>
                                        <div className="form-group">
                                            <label> Año <small className="requiredAsterisk">(Obligatorio)</small></label>
                                            <input className={`${requiredFields.anoGeneracion && 'form-group-empty'}`} type="number" name="anoGeneracion" value={newRolPago.anoGeneracion || ''} onChange={handleInputChange}  />
                                        </div> 
                                        <div className="form-group">
                                            <label> Mes <small className="requiredAsterisk">(Obligatorio)</small></label>
                                            <input className={`${requiredFields.mesGeneracion && 'form-group-empty'}`} type="number" name="mesGeneracion" value={newRolPago.mesGeneracion || ''} onChange={handleInputChange} />
                                        </div> 
                                        <div className="form-group">
                                            <label> Fecha de creación <small className="requiredAsterisk">(Obligatorio)</small></label>
                                            <input className={`${requiredFields.fechaCreacion && 'form-group-empty'}`} type="date" name="fechaCreacion" value={selectedRolPagoId ? (newRolPago?.fechaCreacion && newRolPago?.fechaCreacion.split('T')[0]) : newRolPago.fechaCreacion || ''} onChange={handleInputChange} />
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
                        <button className="form-accept-btn" onClick={handleGeneratePDF} disabled={isAnyEmpty}>Generar PDF</button>
                        {isAnyEmpty &&
                            <div className="empty-fields-msg">
                                <i className="pi pi-exclamation-circle" style={{ fontSize: '0.8rem', margin: '0', color: 'var(--secondary-blue)', fontWeight: '600' }}></i>
                                <span>Por favor, llena todos los datos <strong>requeridos</strong></span>
                            </div>
                        }
                        {
                            selectedRolPagoId ? 
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

export default RolesCreate;