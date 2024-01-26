import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Toast } from 'primereact/toast';
import { ToggleButton } from 'primereact/togglebutton';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { confirmPopup } from 'primereact/confirmpopup';
import { Dialog } from 'primereact/dialog';
import useSWR from 'swr';
import EventosCreate from './EventosCreate';

// Auth
import { useMsal } from '@azure/msal-react';
const apiEndpoint = import.meta.env.VITE_MAIN_ENDPOINT;

// Redux
import { useSelector, useDispatch } from 'react-redux';
import { saveData as saveDataMarca, deleteData as deleteDataMarca } from '../../../context/marcaSlice';
import { saveData as saveDataPatente, deleteData as deleteDataPatente } from '../../../context/patenteSlice';
import { saveData as saveDataAccion, deleteData as deleteDataAccion } from '../../../context/accionSlice';

function EventosHandler({ tablaConexion, idConexion, propietariosExistentes, nombreRegistro, onDialogVisibilityChange, isClosingRef }) {

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

    // --------------- Auth and request setup -------------------------------------------------------

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
    const fetcher = async (url) => {
        const accessToken = await getAccessToken();
        const res = await fetch(url, {
            headers: {
                Authorization: `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            }
        });

        if (!res.ok) {
            const error = new Error(res.statusText);
            error.status = res.status;
            throw error;
        }

        return res.json();
    };

    // --------------- Setup (Servicios, Contextos, Referencias) -----------------------------------

    const toast = useRef(null);

    // --------------- Estados sin persistencia -----------------------------------

    const [showEvento1, setShowEvento1] = useState(false);
    const [showEvento2, setShowEvento2] = useState(false);
    const [showEvento3, setShowEvento3] = useState(false);
    const [showEvento4, setShowEvento4] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isLoadingEvento, setIsLoadingEvento] = useState(false);
    const [loadedEvento, setLoadedEvento] = useState(null);
    const [selectedEvento, setSelectedEvento] = useState(null);

    // --------------- Estados con persistencia -----------------------------------

    const [isAddingE, setisAddingE] = useState(false);

    // --------------- Funciones necesarias para persistencia ----------------------------------------

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
            setisAddingE(detailsData.isAddingE || false);
        }
    }, []);
    const saveState = () => {
        switch (tablaConexion) {
            case 'marca':
                dispatch(saveDataMarca({
                    objectName: getObjectName(), value:
                    {
                        isAddingE
                    }
                }));
                break;
            case 'patente':
                dispatch(saveDataPatente({
                    objectName: getObjectName(), value:
                    {
                        isAddingE
                    }
                }));
                break;
            case 'acciontercero':
                dispatch(saveDataAccion({
                    objectName: getObjectName(), value:
                    {
                        isAddingE
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
    }, [isAddingE]);

    // --------------------------------------------------------------------- TABLA -----------------------------------------------------------------------

    // ------------- Obtención de datos --------------------------------------

    const URL_POBLAR_TABLA = `${apiEndpoint}/ConexionEvento?tablaConexion=${tablaConexion}&idConexion=${idConexion}`;
    const { data: eventosTabla, error: errorTb, isLoading: isLoadingTb, mutate: refreshTb } = useSWR(URL_POBLAR_TABLA, fetcher);
    const eventosNew = useMemo(() => {
        if (errorTb) {
            if (errorTb.status === 404) {
                return [];
            }
        }

        if (eventosTabla) {
            return eventosTabla.map(item => ({
                ...item,
                uniqueId: `${item.tipoEventoId.tablaEvento}-${item.eventoId}`
            }));
        }
        return [];
    }, [eventosTabla, errorTb]);

    // ------------- Funciones --------------------------------------

    const confirmDeletion = (event, rowData) => {
        confirmPopup({
            target: event.currentTarget,
            message: '¿Estás seguro? Esta acción es irreversible',
            icon: 'pi pi-info-circle',
            acceptClassName: 'p-button-danger',
            accept: () => deleteEvento(rowData)
        });
    };
    const deleteEvento = async (rowData) => {
        try {
            setIsDeleting(true);
            const url = `${apiEndpoint}/ConexionEvento?tablaEvento=${rowData.tipoEventoId.tablaEvento}&idEvento=${rowData.eventoId}`;
            const accessToken = await getAccessToken();
            const response = await fetch(url, {
                method: 'DELETE',
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            toast.current.show({
                severity: 'success',
                summary: 'Éxito',
                detail: `Evento eliminado correctamente`,
                life: 3000,
            });

            refreshTb();

        } catch (error) {
            toast.current.show({
                severity: 'error',
                summary: 'Error',
                detail: `Hubo un problema al eliminar el evento`,
                life: 3000,
            });
        } finally {
            setIsDeleting(false);
            refreshTb();
        }
    };
    const onCreate = () => {
        toast.current.show({
            severity: 'success',
            summary: 'Éxito',
            detail: 'Evento ingresado con éxito',
            life: 3000,
        });
        refreshTb();
        /*setisAddingE(false);*/
    }

    // ------------ Tabla ----------------------------------------------------

    const renderHeader = () => {
        return (
            <div className="document-header-container">
                <div className="document-header-title">
                    <i className='pi pi-calendar' style={{ fontSize: '14px', fontWeight: '500', margin: '0', color: 'white' }}></i>
                    <span>Eventos</span>
                </div>
            </div>
        );
    }; // Contiene el header de la tabla: GENERAL
    const header = renderHeader();
    const actionsTemplate = (rowData) => {
        return (
            <div className="table-downloadbtn" >
                <button className="rounded-icon-btn" id="dwn-pdf" type="button" style={{ minHeight: '10px', minWidth: '10px', height: '20px' }} onClick={(event) => confirmDeletion(event, rowData)}>
                    <i className="pi pi-times" style={{ fontSize: '10px', margin: '0', color: 'white' }}></i>
                </button>
            </div>
        );
    };
    const onRowSelect = async (event) => {
        let url;
        let data = null;
        let successRetrieval = false;

        switch (event.data.tipoEventoId.tablaEvento) {
            case 'evento1':
                setShowEvento1(true);
                url = `${apiEndpoint}/EventoUno/${event.data.eventoId}`;
                break;
            case 'evento2':
                setShowEvento2(true);
                url = `${apiEndpoint}/EventoDos/${event.data.eventoId}`;
                break;
            case 'evento3':
                setShowEvento3(true);
                url = `${apiEndpoint}/EventoTres/${event.data.eventoId}`;
                break;
            case 'evento4':
                setShowEvento4(true);
                url = `${apiEndpoint}/EventoCuatro/${event.data.eventoId}`;
                break;
            default:
                break;
        }

        try {
            setIsLoadingEvento(true);
            const accessToken = await getAccessToken();
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            } else {
                successRetrieval = true;
            }

            data = await response.json();

        } catch (error) {
            toast.current.show({
                severity: 'error',
                summary: 'Error',
                detail: `Hubo un problema al abrir el evento`,
                life: 3000,
            });
            setShowEvento1(false);
            setShowEvento2(false);
            setShowEvento3(false);
            setShowEvento4(false);
        } finally {
            if (successRetrieval && data) {
                setLoadedEvento(data);
            }
            setSelectedEvento(null);
            setIsLoadingEvento(false);
        }
    };
    const tipoEventoBodyTemplate = (rowData) => {
        return (
            <div>
                {rowData.tipoEventoId.nombre}
            </div>
        );
    };
    const estadoBodyTemplate = (rowData) => {
        return (
            <div>
                <span style={{ color: rowData.estadoCodigo.color, fontSize: '10px' }}><strong>{rowData.estadoCodigo.codigo}</strong> - {rowData.estadoCodigo.descripcionEspanol}/{rowData.estadoCodigo.descripcionIngles}</span>
            </div>
        );
    };
    const fechasBodyTemplateR = (rowData) => {
        return (
            <div>
                {rowData.fechaRegistro ? rowData.fechaRegistro.split('T')[0] : ''}
            </div>
        );
    };
    const fechasBodyTemplateS = (rowData) => {
        return (
            <div>
                {rowData.fechaSolicitud ? rowData.fechaSolicitud.split('T')[0] : ''}
            </div>
        );
    };

    const getEventTitle = () => {
        if (loadedEvento) {
            if (loadedEvento.tipoEvento.nombre === "Cambio de nombre" || loadedEvento.tipoEvento.nombre === "Cambio de domicilio") {
                return "del " + loadedEvento.tipoEvento.nombre.toLowerCase();
            } else {
                return "de la " + loadedEvento.tipoEvento.nombre.toLowerCase();
            }
        }
    }
    const getTituloGrupo1 = () => {
        if (!loadedEvento) return null;

        switch (loadedEvento.tipoEvento.nombre) {
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
        if (!loadedEvento) return null;

        switch (loadedEvento.tipoEvento.nombre) {
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

    useEffect(() => {
        onDialogVisibilityChange(showEvento1 || showEvento2 || showEvento3 || showEvento4);
    }, [showEvento1, showEvento2, showEvento3, showEvento4]); // Para hacer que el draggable no sea draggable para que se pueda seleccionar texto

    return (
        <div>
            <Toast ref={toast}></Toast>
            <div className="form-body form-body--create">
                <section>
                    <div className="form-group-label">
                        <i className="pi pi-calendar"></i>
                        <label>{isAddingE ? 'Nuevo evento' : 'Eventos'}</label>
                        <ToggleButton onLabel="Ver eventos" offLabel="Ingresar eventos" onIcon="pi pi-eye" offIcon="pi pi-calendar-plus"
                            checked={isAddingE} onChange={(e) => setisAddingE(e.value)} className="recordatorios-toggle" />
                    </div>
                    {
                        isAddingE ?
                            <EventosCreate onCreate={() => onCreate()} tablaConexion={tablaConexion} idConexion={idConexion} propietariosExistentes={propietariosExistentes} isClosingRef={isClosingRef} /> :
                            <div className="tabla tabla-documentos">
                                {(isLoadingTb || isDeleting ) &&
                                    <div className="spinner-container">
                                        <div className="spinner" />
                                    </div>
                                }
                                <DataTable
                                    value={eventosNew}
                                    header={header}
                                    removableSort
                                    scrollable
                                    scrollHeight='405px'
                                    size="small"
                                    emptyMessage={`No se encontraron eventos`}
                                    dataKey="uniqueId"
                                    selectionMode="single"
                                    sortField="fechaRegistro"
                                    sortOrder={1}
                                    selection={selectedEvento}
                                    onSelectionChange={(e) => setSelectedEvento(e.value)}
                                    onRowSelect={onRowSelect}>

                                    <Column body={tipoEventoBodyTemplate} header="Tipo de evento"></Column>
                                    <Column style={{maxWidth: '180px'}} body={estadoBodyTemplate} header="Estado"></Column>
                                    <Column body={fechasBodyTemplateR} header="Fecha de registro"></Column>
                                    <Column body={fechasBodyTemplateS} header="Fecha de solicitud"></Column>
                                    <Column body={actionsTemplate} header="Acciones"></Column>
                                </DataTable>
                            </div>
                    }
                 </section>                      
            </div>
            <Dialog modal={true} visible={showEvento1} draggable={false} onHide={() => { setShowEvento1(false); setLoadedEvento(null) }} className="eventos-dialog" style={{ height: '25vh', overflow: 'hidden' }}>
                {
                    isLoadingEvento && 
                    <div className="spinner-container" style={{left: '0', top: '0'}}>
                        <div className="spinner" />
                    </div>
                }
                <h5 className="eventos-title">Detalles del evento <small>({idConexion} - {nombreRegistro})</small></h5>
                <div className="form-body-group eventos-dialog-container" >
                    <div className="form-group">
                        <label>Estado</label>
                        <div className="eventos-span-container">
                            <span style={{ color: loadedEvento?.estadoCodigo.color }}><strong>{loadedEvento?.estadoCodigo.codigo}</strong> - {loadedEvento?.estadoCodigo.descripcionEspanol}/{loadedEvento?.estadoCodigo.descripcionIngles}</span>
                        </div>
                    </div>
                    <div className="form-group">
                        <label>Fecha</label>
                        <div className="eventos-span-container">
                            <span>{loadedEvento?.fecha ? loadedEvento?.fecha.split('T')[0] : ''}</span>
                        </div>
                    </div>
                </div>
            </Dialog>
            <Dialog modal={true} visible={showEvento2} draggable={false} onHide={() => { setShowEvento2(false); setLoadedEvento(null) }} className="eventos-dialog" style={{ height: '40vh', overflow: 'hidden' }}>
                {
                    isLoadingEvento &&
                    <div className="spinner-container" style={{ left: '0', top: '0' }}>
                        <div className="spinner" />
                    </div>
                }
                <h5 className="eventos-title">Detalles {getEventTitle()} <small>({idConexion} - {nombreRegistro})</small></h5>
                <div className="form-body-group eventos-dialog-container" >
                    <div className="form-group form-group-single">
                        <label>Estado</label>
                        <div className="eventos-span-container single-span">
                            <span style={{ color: loadedEvento?.estadoCodigo.color }}><strong>{loadedEvento?.estadoCodigo.codigo}</strong> - {loadedEvento?.estadoCodigo.descripcionEspanol}/{loadedEvento?.estadoCodigo.descripcionIngles}</span>
                        </div>
                    </div>
                    <div className="form-group form-group-double">
                        <label>Marca</label>
                        <div className="eventos-span-container">
                            <span>{loadedEvento?.marcaOpuesta}</span>
                        </div>
                    </div>
                    <div className="form-group form-group-double">
                        <label>Clase</label>
                        <div className="eventos-span-container">
                            <span>{loadedEvento?.claseId}</span>
                        </div>
                    </div>
                    <div className="form-group form-group-double">
                        <label>Propietario</label>
                        <div className="eventos-span-container">
                            <span>{loadedEvento?.propietario}</span>
                        </div>
                    </div>
                    <div className="form-group form-group-double">
                        <label>Agente</label>
                        <div className="eventos-span-container">
                            <span>{loadedEvento?.agente}</span>
                        </div>
                    </div>
                    <div className="form-group form-group-double">
                        <label>Registro</label>
                        <div className="eventos-span-container">
                            <span>{loadedEvento?.registro}</span>
                        </div>
                    </div>
                    <div className="form-group form-group-double">
                        <label>Fecha de registro</label>
                        <div className="eventos-span-container">
                            <span>{loadedEvento?.fechaRegistro ? loadedEvento?.fechaRegistro.split('T')[0] : ''}</span>
                        </div>
                    </div>
                </div>
            </Dialog>
            <Dialog modal={true} visible={showEvento3} draggable={false} onHide={() => { setShowEvento3(false); setLoadedEvento(null) }} className="eventos-dialog" style={{ height: '40vh', overflow: 'hidden' }}>
                {
                    isLoadingEvento &&
                    <div className="spinner-container" style={{ left: '0', top: '0' }}>
                        <div className="spinner" />
                    </div>
                }
                <h5 className="eventos-title">Detalles {getEventTitle()} <small>({idConexion} - {nombreRegistro})</small></h5>
                <div className="form-body-group eventos-dialog-container" >
                    <div className="form-group form-group-single">
                        <label>Estado</label>
                        <div className="eventos-span-container single-span">
                            <span style={{ color: loadedEvento?.estadoCodigo.color }}><strong>{loadedEvento?.estadoCodigo.codigo}</strong> - {loadedEvento?.estadoCodigo.descripcionEspanol}/{loadedEvento?.estadoCodigo.descripcionIngles}</span>
                        </div>
                    </div>
                    <div className="form-group form-group-double">
                        <label>Fecha de vigencia (Desde)</label>
                        <div className="eventos-span-container">
                            <span>{loadedEvento?.fechaVigenciaDesde ? loadedEvento?.fechaVigenciaDesde.split('T')[0] : ''}</span>
                        </div>
                    </div>
                    <div className="form-group form-group-double">
                        <label>Fecha de vigencia (Hasta)</label>
                        <div className="eventos-span-container">
                            <span>{loadedEvento?.fechaVigenciaHasta ? loadedEvento?.fechaVigenciaHasta.split('T')[0] : ''}</span>
                        </div>
                    </div>
                    <div className="form-group form-group-double">
                        <label>Solicitud</label>
                        <div className="eventos-span-container">
                            <span>{loadedEvento?.solicitud}</span>
                        </div>
                    </div>
                    <div className="form-group form-group-double">
                        <label>Fecha de solicitud</label>
                        <div className="eventos-span-container">
                            <span>{loadedEvento?.fechaSolicitud ? loadedEvento?.fechaSolicitud.split('T')[0] : ''}</span>
                        </div>
                    </div>
                    <div className="form-group form-group-double">
                        <label>Registro</label>
                        <div className="eventos-span-container">
                            <span>{loadedEvento?.registro}</span>
                        </div>
                    </div>
                    <div className="form-group form-group-double">
                        <label>Fecha de registro</label>
                        <div className="eventos-span-container">
                            <span>{loadedEvento?.fechaRegistro ? loadedEvento?.fechaRegistro.split('T')[0] : ''}</span>
                        </div>
                    </div>
                </div>
            </Dialog>
            <Dialog modal={true} visible={showEvento4} draggable={false} onHide={() => { setShowEvento4(false); setLoadedEvento(null) }} className="eventos-dialog" style={{ height: '50vh', overflow: 'hidden' }}>
                {
                    isLoadingEvento &&
                    <div className="spinner-container" style={{ left: '0', top: '0' }}>
                        <div className="spinner" />
                    </div>
                }
                <h5 className="eventos-title">Detalles {getEventTitle()} <small>({idConexion} - {nombreRegistro})</small></h5>
                <div className="form-body-group eventos-dialog-container" >
                    <div className="form-group form-group-single">
                        <label>Estado</label>
                        <div className="eventos-span-container single-span">
                            <span style={{ color: loadedEvento?.estadoCodigo.color }}><strong>{loadedEvento?.estadoCodigo.codigo}</strong> - {loadedEvento?.estadoCodigo.descripcionEspanol}/{loadedEvento?.estadoCodigo.descripcionIngles}</span>
                        </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'row', gap: '20px', width: '100%', margin: '10px 0px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', width: '50%', alignItems: 'start' }}>
                            <div className="form-group form-group-double">
                                <label>{getTituloGrupo1()}</label>
                            </div>
                            <table className="table-list">
                                <thead>
                                    <tr className="table-head">
                                        <th>{getTituloGrupo1()} ({loadedEvento?.grupoUno && loadedEvento?.grupoUno.length})</th>
                                    </tr>
                                </thead>
                                <tbody style={{ height: '80px', maxHeight: '80px' }}>
                                    {loadedEvento?.grupoUno && loadedEvento?.grupoUno.map((propietario, index) => (
                                        <tr className="table-row" key={index}>
                                            <td className="table-nombre-abogado"><span><strong>{propietario.propietario.propietarioId}</strong> - {propietario.propietario.nombre}</span></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', width: '50%', alignItems: 'start' }}>
                            <div className="form-group form-group-double">
                                <label>{getTituloGrupo2()}</label>
                            </div>
                            <table className="table-list">
                                <thead>
                                    <tr className="table-head">
                                        <th>{getTituloGrupo2()} ({loadedEvento?.grupoDos && loadedEvento?.grupoDos.length})</th>
                                    </tr>
                                </thead>
                                <tbody style={{ height: '80px', maxHeight: '80px' }}>
                                    {loadedEvento?.grupoDos && loadedEvento?.grupoDos.map((propietario, index) => (
                                        <tr className="table-row" key={index}>
                                            <td className="table-nombre-abogado"><span><strong>{propietario.propietario.propietarioId}</strong> - {propietario.propietario.nombre}</span></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                    <div className="form-group form-group-double">
                        <label>Solicitud</label>
                        <div className="eventos-span-container">
                            <span>{loadedEvento?.solicitud}</span>
                        </div>
                    </div>
                    <div className="form-group form-group-double">
                        <label>Fecha de solicitud</label>
                        <div className="eventos-span-container">
                            <span>{loadedEvento?.fechaSolicitud ? loadedEvento?.fechaSolicitud.split('T')[0] : ''}</span>
                        </div>
                    </div>
                    <div className="form-group form-group-double">
                        <label>Registro</label>
                        <div className="eventos-span-container">
                            <span>{loadedEvento?.registro}</span>
                        </div>
                    </div>
                    <div className="form-group form-group-double">
                        <label>Fecha de registro</label>
                        <div className="eventos-span-container">
                            <span>{loadedEvento?.fechaRegistro ? loadedEvento?.fechaRegistro.split('T')[0] : ''}</span>
                        </div>
                    </div>
                </div>
            </Dialog>
        </div>
    );
}

export default EventosHandler;