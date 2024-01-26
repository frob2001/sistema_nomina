import React, { useState, useEffect, useRef } from 'react';
import { Toast } from 'primereact/toast';

// Redux
import { useSelector, useDispatch } from 'react-redux';
import { saveData } from '../../../context/clienteSlice';// EDITABLE

// Components
import EmptyTable from '../../administracionComponents/Empty/EmptyTable';
import ClientesTable from './ClientesTable';
import ClientesCreate from './ClientesCreate';
import ClientesSearch from './ClientesSearch';
import ClientesDetails from './ClientesDetails';
import ContactosCreateC from '../ContactosCliente/ContactosCreateC';
import ContactosDetailsC from '../ContactosCliente/ContactosDetailsC'; 
import ContactosCreateD from '../ContactosCliente/ContactosCreateD';
import ContactosDetailsD from '../ContactosCliente/ContactosDetailsD'; 

function ClientesPage() {

    // --------------- Redux store settings -------------------------------------------------------

    const dispatch = useDispatch();
    const clientesPageData = useSelector(state => state.cliente.ClientePage); // EDITABLE: persistencia de este componente
    const showContactoCreateC = useSelector(state => state.contactoC.isCreating); // EDITABLE: variable para mostrar o no el ContactosCreateC
    const showContactoDetailsC = useSelector(state => state.contactoC.isViewing); // EDITABLE: variable para mostrar o no el ContactosDetailsC
    const showContactoCreateD = useSelector(state => state.contactoD.isCreating); // EDITABLE: variable para mostrar o no el ContactosCreateD
    const showContactoDetailsD = useSelector(state => state.contactoD.isViewing); // EDITABLE: variable para mostrar o no el ContactosDetailsD

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
        if (clientesPageData) {
            setIsCreating(clientesPageData.isCreating || false);
            setIsSearching(clientesPageData.isSearching || false);
            setIsViewing(clientesPageData.isViewing || false);
            setIdSelected(clientesPageData.idSelected || null);
            setSearchUrl(clientesPageData.searchUrl || "");
            setWasSearched(clientesPageData.wasSearched || false);
        }
    }, []); // Se ejecuta cuando el componente renderiza, lee los datos guardados: ESPECIFICO
    const saveState = () => {
        dispatch(saveData({ objectName: 'ClientePage', value: { isCreating, isSearching, isViewing, idSelected, searchUrl, wasSearched } }));
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
                <h5 className="page-title">Clientes</h5>
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
                    {wasSearched ? <ClientesTable url={searchUrl} onClose={() => setIsViewing(false)} onSelect={(clienteId) => { setIsViewing(true); setIdSelected(clienteId); }} refreshTrigger={refreshTable} /> : <EmptyTable title='Clientes'/>}
                </div>
            </div>
            {isSearching && <ClientesSearch onClose={() => setIsSearching(false)} onSearch={(search) => { setSearchUrl(search); setWasSearched(true) }} />}
            {isCreating && <ClientesCreate onCreated={onCreated} onClose={() => setIsCreating(false)} />}
            {isViewing && <ClientesDetails onEdited={() => { onEdited(); triggerTableRefresh(); }} onDeleted={() => { onDeleted(); triggerTableRefresh(); }} onClose={() => setIsViewing(false)} clienteId={idSelected} />}

            {showContactoCreateC && <ContactosCreateC />}
            {showContactoDetailsC && <ContactosDetailsC />}

            {showContactoCreateD && <ContactosCreateD clienteId={idSelected} />}
            {showContactoDetailsD && <ContactosDetailsD onDeleted={onDeleted} onEdited={onEdited} />}
            
        </>
    );
}

export default ClientesPage;