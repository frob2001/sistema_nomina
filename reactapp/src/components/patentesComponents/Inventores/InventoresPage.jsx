import React, { useState, useEffect, useRef } from 'react';
import { Toast } from 'primereact/toast';

// Redux
import { useSelector, useDispatch } from 'react-redux';
import { saveData } from '../../../context/inventorSlice';// EDITABLE

// Components
import EmptyTable from '../../administracionComponents/Empty/EmptyTable';
import InventoresTable from './InventoresTable';
import InventoresSearch from './InventoresSearch';
import InventoresCreate from './InventoresCreate';
import InventoresDetails from './InventoresDetails';

function InventoresPage() {

    // --------------- Redux store settings -------------------------------------------------------

    const dispatch = useDispatch();
    const inventoresPageData = useSelector(state => state.inventor.InventorPage); // EDITABLE: persistencia de este componente

    // --------------- Setup (Servicios, Contextos, Referencias) -----------------------------------

    const toast = useRef(null);

    // --------------- Estados que no requieren persistencia --------------------------------------------

    const [refreshTable, setRefreshTable] = useState(false); // Señal para refrescar la tabla cuando se edite o elimine un dato

    // --------------- Estados que requieren persistencia --------------------------------------------

    const [isCreating, setIsCreating] = useState(false); // Saber si se está creando un cliente
    const [isSearching, setIsSearching] = useState(false); // Saber si se está buscando los clientes
    const [isViewing, setIsViewing] = useState(false); // Saber si se está viendo detalles de un cliente
    const [idSelected, setIdSelected] = useState(null); // Saber el id del cliente seleccionado en la tabla Clientes
    const [searchUrl, setSearchUrl] = useState(""); // URL de búsqueda 
    const [wasSearched, setWasSearched] = useState(false); // Saber si se buscó ya los clientes para presentar en la tabla

    // --------------- Funciones necesarias para persistencia ----------------------------------------

    useEffect(() => {
        if (inventoresPageData) {
            setIsCreating(inventoresPageData.isCreating || false);
            setIsSearching(inventoresPageData.isSearching || false);
            setIsViewing(inventoresPageData.isViewing || false);
            setIdSelected(inventoresPageData.idSelected || null);
            setSearchUrl(inventoresPageData.searchUrl || "");
            setWasSearched(inventoresPageData.wasSearched || false);
        }
    }, []); // Se ejecuta cuando el componente renderiza, lee los datos guardados: ESPECIFICO
    const saveState = () => {
        dispatch(saveData({ objectName: 'InventorPage', value: { isCreating, isSearching, isViewing, idSelected, searchUrl, wasSearched } }));
    };// Guarda en el store los estados como objetos: ESPECIFICO
    useEffect(() => {
        return () => {
            saveState();
        };
    }, [isCreating, isSearching, isViewing, idSelected, searchUrl, wasSearched]); // Se ejecuta con cada cambio de estado, persiste los datos: ESPECIFICO -> PUEDE OPTIMIZARSE

    // --------------- Funciones especificas del componente ------------------------------------------

    const toggleCreate = () => {
        setIsCreating(!isCreating); 
    }; // Alternar para abrir o no el formulario CREATE: GENERAL
    const toggleSearch = () => {
        setIsSearching(!isSearching);
    }; // Alternar para abrir o no el formulario SEARCH: GENERAL
    const onCreated = () => {
        triggerTableRefresh();
    }; // Toast para mostrar si se eliminó un registro: GENERAL
    const onDeleted = () => {
        toast.current.show({
            severity: 'success',
            summary: 'Proceso exitoso',
            detail: 'Registro eliminado con éxito',
            life: 3000,
        });
    }; // Toast para mostrar si se eliminó un registro: GENERAL
    const onEdited = () => {
        toast.current.show({
            severity: 'success',
            summary: 'Proceso exitoso',
            detail: 'Registro editado con éxito',
            life: 3000,
        });
    }; // Toast para mostrar si se editó un registro: GENERAL
    const triggerTableRefresh = () => {
        setRefreshTable(prev => !prev); // Toggle the state to trigger refresh
    }; // Método para refrescar los datos de la tabla cuando se edite o elmine algo

    // -----------------------------------------------------------------------------------------------

    return (
        <>
            <Toast ref={toast} />
            <div className="page-container">
                <h5 className="page-title">Inventores</h5>
                <div className="page-options">
                    <button className="btn-page-options" onClick={toggleCreate}>
                        <i className="pi pi-plus" style={{ fontSize: '0.8rem', margin: '0' }}></i>
                        <label>Crear</label>
                    </button>
                    <button className="btn-page-options" onClick={toggleSearch}>
                        <i className="pi pi-search" style={{ fontSize: '0.8rem', margin: '0' }}></i>
                        <label>Buscar</label>
                    </button>
                </div>
                <div className="page-table">
                    {wasSearched ? <InventoresTable url={searchUrl} onClose={() => setIsViewing(false)} onSelect={(inventorId) => { setIsViewing(true); setIdSelected(inventorId); }} refreshTrigger={refreshTable} /> : <EmptyTable title='Inventores'/>}
                </div>
            </div>
            {isSearching && <InventoresSearch onClose={() => setIsSearching(false)} onSearch={(search) => { setSearchUrl(search); setWasSearched(true) }} />}
            {isCreating && <InventoresCreate onCreated={onCreated} onClose={() => setIsCreating(false)} />}
            {isViewing && <InventoresDetails onEdited={() => { onEdited(); triggerTableRefresh(); }} onDeleted={() => { onDeleted(); triggerTableRefresh(); }} onClose={() => setIsViewing(false)} inventorId={idSelected} />}
        </>
    );
}

export default InventoresPage;