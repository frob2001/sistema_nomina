import React, { useState, useMemo, useRef } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Toast } from 'primereact/toast';
import { InputText } from 'primereact/inputtext';
import DocumentPickerD from './DocumentPickerD';
import { confirmPopup } from 'primereact/confirmpopup';

// Services
import useSWR from 'swr';
const apiEndpoint = import.meta.env.VITE_MAIN_ENDPOINT;
// Auth
import { useMsal } from '@azure/msal-react';

function DocumentViewer({ type, tablaConexion, idConexion }) {

    // Setup
    // Auth
    const { instance, accounts } = useMsal();
    const toast = useRef(null);

    const API_BASE_URL = `${apiEndpoint}/${type === 'documentos' ? 'ConexionDocumento/Buscar' : 'ConexionCorreo/Buscar'}`;
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
    const fetcher = async (url) => {
        const accessToken = await getAccessToken();
        const res = await fetch(url, {
            headers: {
                Authorization: `Bearer ${accessToken}`,
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
    const { data, error, isLoading, mutate: refresh } = useSWR(`${API_BASE_URL}?tablaConexion=${tablaConexion}&idConexion=${idConexion}`, fetcher); // SWR para los datos: EDITABLE

    const flatDocuments = useMemo(() => {
        if (error) {
            return null;
        } else if (data) {
            return data.map(document => ({
                ...document,
                fecha: document.fecha ? document.fecha.split('T')[0] : null,
                usuario: document.usuario ? document.usuario.split('@')[0] : null,
            }));
        }
    }, [data, error]);
   

    // Estados
    const [isAdding, setIsAdding] = useState(false);

    // Funciones

    const showFilePicker = () => {
        setIsAdding(true);
    }

    const closeFilePicker = () => {
        setIsAdding(false);
    }

    const onCellEditComplete = async (e) => {
        const { rowData, newValue, field } = e;

        // Only proceed if the field is 'titulo' or 'descripcion'
        if (field === 'titulo' || field === 'descripcion') {
            // Check if the new value is not empty
            if (newValue.trim() === '') {
                // Optionally, you can show an alert or a message to the user
                toast.current.show({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'No se pueden dejar vacías las propiedades de titulo o descripciónde un archivo', // EDITABLE
                    life: 3000,
                });
                return;
            }

            const id = type === 'documentos' ? rowData.conexionDocumentoId : rowData.conexionCorreoId;
            const tableType = type === 'documentos' ? 'ConexionDocumento' : 'ConexionCorreo';
            const url = `${apiEndpoint}/${tableType}/${id}`;
            const updatedData = { [field]: newValue };

            try {
                const accessToken = await getAccessToken();
                const response = await fetch(`${url}`, {
                    method: 'PATCH',
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(updatedData),
                });

                if (!response.ok) {
                    toast.current.show({
                        severity: 'error',
                        summary: 'Error',
                        detail: 'Hubo un error al editar los datos', // EDITABLE
                        life: 3000,
                    });
                }

                // Refresh the data
                refresh();
            } catch (error) {
                toast.current.show({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Hubo un error al editar los datos', // EDITABLE
                    life: 3000,
                });
            }
        }
    };
                        
    const textEditor = (options) => {
        // Determine the maxLength based on the column field
        let maxLength;
        if (options.field === 'titulo') {
            maxLength = 30;
        } else if (options.field === 'descripcion') {
            maxLength = 100;
        }

        return (
            <InputText
                style={{ height: '20px' }}
                type="text"
                value={options.value}
                onChange={(e) => options.editorCallback(e.target.value)}
                maxLength={maxLength}
            />
        );
    };

    const actionsTemplate = (rowData) => {
        return (
            <div className="table-downloadbtn" >
                <button className="rounded-icon-btn"  type="button" onClick={() => downloadFile(rowData)} style={{ minHeight: '10px', minWidth: '10px', height: '20px' }}>
                    <i className="pi pi-download" style={{ fontSize: '10px', margin: '0', color: 'white' }}></i>
                </button>
                <button className="rounded-icon-btn" id="dwn-pdf" type="button" onClick={(event) => confirmDeletion(event, rowData)} style={{ minHeight: '10px', minWidth: '10px', height: '20px' }}>
                    <i className="pi pi-times" style={{ fontSize: '10px', margin: '0', color: 'white' }}></i>
                </button>
            </div>
        );
    };

    const confirmDeletion = (event, rowData) => {
        confirmPopup({
            target: event.currentTarget,
            message: '¿Estás seguro? Esta acción es irreversible',
            icon: 'pi pi-info-circle',
            acceptClassName: 'p-button-danger',
            accept: () => deleteFile(rowData)
        });
    };

    const deleteFile = async (rowData) => {
        const id = type === 'documentos' ? rowData.conexionDocumentoId : rowData.conexionCorreoId;
        const tableType = type === 'documentos' ? 'ConexionDocumento' : 'ConexionCorreo';
        const url = `${apiEndpoint}/${tableType}/${id}`;

        try {
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
                detail: `Archivo eliminado correctamente`,
                life: 3000,
            });

            refresh();

        } catch (error) {
            toast.current.show({
                severity: 'error',
                summary: 'Error',
                detail: `Hubo un problema al eliminar el archivo`,
                life: 3000,
            });
        } finally {
            refresh();
        }

    };

    const downloadFile = async (rowData) => {

        const id = type === 'documentos' ? rowData.conexionDocumentoId : rowData.conexionCorreoId;
        const tableType = type === 'documentos' ? 'ConexionDocumento' : 'ConexionCorreo';
        const url = `${apiEndpoint}/${tableType}/${id}`;
        const nombreArchivo = type === 'documentos' ? rowData.nombreArchivo : rowData.nombreCorreo;

        try {
            const accessToken = await getAccessToken();
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            });
            if (!response.ok) {
                throw new Error("Error fetching file");
            }
            const fileData = await response.json();
            const downloadUrl = fileData.urlAcceso;

            toast.current.show({
                severity: 'success',
                summary: 'Descarga exitosa',
                detail: `El archivo ${nombreArchivo} se está descargando`, // EDITABLE
                life: 3000,
            });

            // Create an invisible iframe
            let iframe = document.createElement('iframe');
            iframe.style.display = 'none';
            iframe.src = downloadUrl;

            // Append the iframe to the document
            document.body.appendChild(iframe);

            // Remove the iframe after the download starts
            setTimeout(() => {
                document.body.removeChild(iframe);
            }, 3000); // Adjust the timeout as needed
        } catch (error) {
            toast.current.show({
                severity: 'error',
                summary: 'Error',
                detail: `Hubo un problema al descargar el archivo ${nombreArchivo}`,
                life: 3000,
            });
        }
    };

    const renderHeader = () => {
        return (
            <div className="document-header-container">
                <div className="document-header-title">
                    <i className={`pi ${type === 'documentos' ? 'pi-file' : 'pi-envelope'}`} style={{ fontSize: '14px',fontWeight: '500', margin: '0', color: 'white' }}></i>
                    <span>{`${type === 'documentos' ? 'Documentos' : 'Correos'} disponibles`}</span>
                </div>
                <button onClick={showFilePicker} className="rounded-icon-btn plus-btn" type="button" style={{ backgroundColor: 'white', color: 'var(--secondary-blue)', minHeight: '10px', minWidth: '10px', height: '22px', width: '22px' }}>
                    <i className="pi pi-plus" style={{ fontSize: '0.8rem', margin: '0', fontWeight: '800' }}></i>
                </button>
            </div>
        );
    }; // Contiene el header de la tabla: GENERAL

    const header = renderHeader();

    return (
        <>
            <Toast ref={toast} />
        {
                isAdding ? (<DocumentPickerD refresh={refresh} type={type} onClose={closeFilePicker} idConexion={idConexion} tablaConexion={tablaConexion} /> 
            ) : (
            <div className="tabla tabla-documentos">
                <DataTable
                    value={flatDocuments}
                    header={header}
                    removableSort
                    scrollable
                    scrollHeight="180px"
                    size="small"
                    editMode="cell"
                    emptyMessage={`No se encontraron ${type === 'documentos' ? 'documentos' : 'correos'} `}
                    dataKey={type === 'documentos' ? 'conexionDocumentoId' : 'conexionCorreoId'}
                    selectionMode="single">

                    <Column style={{ fontSize: '10px' }} field="titulo" header="Título" editor={(options) => textEditor(options)} onCellEditComplete={onCellEditComplete}></Column>
                    <Column style={{ fontSize: '10px', maxWidth: '218px' }} field="descripcion" header="Descripción" editor={(options) => textEditor(options)} onCellEditComplete={onCellEditComplete}></Column>
                    <Column style={{ fontSize: '10px' }} field="fecha" header="Fecha"></Column>
                    <Column style={{ fontSize: '10px' }} field="usuario" header="Autor del archivo"></Column>
                    <Column style={{ fontSize: '10px' }} field={ type === 'documentos' ? "nombreArchivo" : "nombreCorreo"} header="Nombre del archivo"></Column>
                    <Column body={actionsTemplate} header="Acciones"></Column>
                </DataTable>
            </div>)
            }
        </>
    )
}

export default DocumentViewer