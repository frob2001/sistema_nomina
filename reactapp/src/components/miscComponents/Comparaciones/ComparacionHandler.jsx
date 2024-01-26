import React, { useRef, useState } from 'react';
import useSWR from 'swr';
import { Toast } from 'primereact/toast';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Checkbox } from 'primereact/checkbox';

// Auth
import { useMsal } from '@azure/msal-react';

// Services
const apiEndpoint = import.meta.env.VITE_MAIN_ENDPOINT;

// Redux
import { useSelector } from 'react-redux';

function ComparacionHandler({ clienteId }) {


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
            if (res.status === 404) {
                throw new Error("Recurso no encontrado");
            }
            throw new Error("Hubo un problema con el servidor, intenta de nuevo");
        }

        return res.json();
    };

    const isEditing = useSelector(state => state.cliente.isEditing); 

    const toast = useRef(null);
    const [isLoading, setIsLoading] = useState(false);
    const [activeCheckbox, setActiveCheckbox] = useState(null);

    // ------------ Poblar la tabla de marcas ----------------------------------------------------

    const url = `${apiEndpoint}/Marcas/Buscar?clienteId=${clienteId}`;
    const { data: marcas, error: errorM, isLoading: isLoadingM, mutate: refreshM } = useSWR(url, fetcher);

    // ------------ Tabla de marcas ----------------------------------------------------

    const renderHeader = () => {
        return (
            <div className="document-header-container">
                <div className="document-header-title">
                    <i className='pi pi-verified' style={{ fontSize: '14px', fontWeight: '500', margin: '0', color: 'white' }}></i>
                    <span>Marcas</span>
                </div>
            </div>
        );
    }; // Contiene el header de la tabla: GENERAL
    const header = renderHeader();

    const handleComparacionChange = async (marcaId, comparacion) => {
        try {
            setActiveCheckbox(marcaId);
            const patchBody = {
                comparacion: comparacion
            }
            const url = `${apiEndpoint}/Marcas/${marcaId}/Comparacion`;
            const accessToken = await getAccessToken();
            const response = await fetch(url, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${accessToken}`,
                },
                body: JSON.stringify(patchBody),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            toast.current.show({
                severity: 'success',
                summary: 'Éxito',
                detail: comparacion ? 'Comparación activada' : 'Comparación desactivada',
                life: 1000,
            });
        } catch (error) {
            toast.current.show({
                severity: 'error',
                summary: 'Error',
                detail: `Hubo un problema al cambiar el estado de la comparación`,
                life: 1000,
            });
        } finally {
            setActiveCheckbox(null); 
            refreshM();
        }
    }

    const comparacionBodyTemplate = (rowData) => {

        const handleCheckboxChange = (e) => {
            e.stopPropagation();  
            handleComparacionChange(rowData.marcaId, !rowData.comparacion);
        };

        return (
            <div style={{ display: 'flex', flexDirection: 'row', gap: '10px', alignItems: 'center' }}>
                {activeCheckbox === rowData.marcaId ?
                    <div className="checkbox-loader-container">
                        <div className="small-spinner" />
                    </div> :
                    <Checkbox className={!isEditing && 'checkbox-disabled'}  disabled={!isEditing} onChange={handleCheckboxChange} checked={rowData.comparacion}></Checkbox>
                }
            </div>
            
        );
    };

    const changeAllComparaciones = async (comparacionGeneral) => {
        try {
            setIsLoading(true);
            const putBody = {
                comparacion: comparacionGeneral
            }
            const url = `${apiEndpoint}/Clientes/${clienteId}/UpdateMarcasComparacion`;
            const accessToken = await getAccessToken();
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(putBody),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            toast.current.show({
                severity: 'success',
                summary: 'Éxito',
                detail: comparacionGeneral ? 'Comparaciones activadas' : 'Comparaciones desactivadas',
                life: 1000,
            });
        } catch (error) {
            toast.current.show({
                severity: 'error',
                summary: 'Error',
                detail: `Hubo un problema al cambiar el estado de las comparaciones`,
                life: 1000,
            });
        } finally {
            setIsLoading(false);
            refreshM();
        }
    }


    return (
        <div>
            <Toast ref={toast}></Toast>
            <div className="form-body form-body--create">
                <section>
                    <div className="form-group-label">
                        <i className="pi pi-verified"></i>
                        <label>Comparaciones</label>
                        <div style={{display: 'flex', flexDirection: 'row', gap: '3px', marginLeft: 'auto'}}>
                            <button className="comparaciones-btn" disabled={marcas?.every(obj => obj.comparacion === true) || !isEditing} onClick={(e) => changeAllComparaciones(true)} >
                                Comparar todas
                            </button>
                            <button className="comparaciones-btn" disabled={marcas?.every(obj => obj.comparacion === false) || !isEditing} onClick={(e) => changeAllComparaciones(false)} >
                                No comparar ninguna
                            </button>
                        </div>
                    </div>
                    <div className="tabla tabla-documentos">
                        {(isLoadingM || isLoading) &&
                            <div className="spinner-container">
                                <div className="spinner" />
                            </div>
                        }
                        <DataTable
                            value={marcas}
                            header={header}
                            removableSort
                            scrollable
                            scrollHeight='380px'
                            size="small"
                            emptyMessage='No se encontraron marcas'
                            dataKey="marcaId"
                            selectionMode="single">

                            <Column style={{ minWidth: '230px' }} field="signo" header="Signo"></Column>
                            <Column body={comparacionBodyTemplate} header="Comparación"></Column>
                        </DataTable>
                    </div>
                </section>
            </div>
        </div>
    )
}

export default ComparacionHandler