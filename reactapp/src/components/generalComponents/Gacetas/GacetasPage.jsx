import React, { useState, useEffect, useRef } from 'react';
import { Toast } from 'primereact/toast';

// Redux
import { saveData } from '../../../context/gacetaSlice';
import { useSelector, useDispatch } from 'react-redux';

// Components
import GacetasTable from './GacetasTable';
import GacetasCreate from './GacetasCreate';
import GacetasDetails from './GacetasDetails';

function GacetasPage() {

    // --------------- Redux store settings -------------------------------------------------------

    const dispatch = useDispatch();
    const gacetaPageData = useSelector(state => state.gaceta.GacetaPage);

    // --------------- Setup (Servicios, Contextos, Referencias) -----------------------------------

    const toast = useRef(null);

    // --------------- Estados que requieren persistencia --------------------------------------------

    const [isCreating, setIsCreating] = useState(false);
    const [isViewing, setIsViewing] = useState(false);
    const [idSelected, setIdSelected] = useState(null);

    // --------------- Funciones necesarias para persistencia ----------------------------------------

    useEffect(() => {
        if (gacetaPageData) {
            setIsCreating(gacetaPageData.isCreating || false);
            setIsViewing(gacetaPageData.isViewing || false);
            setIdSelected(gacetaPageData.idSelected || null);
        }
    }, []); // Se ejecuta cuando el componente renderiza, lee los datos guardados: ESPECIFICO
    const saveState = () => {
        dispatch(saveData({ objectName: 'GacetaPage', value: { isCreating, isViewing, idSelected } }));
    };// Guarda en el store los estados como objetos: ESPECIFICO
    useEffect(() => {
        return () => {
            saveState();
        };
    }, [isCreating, isViewing, idSelected]); // Se ejecuta con cada cambio de estado, persiste los datos: ESPECIFICO -> PUEDE OPTIMIZARSE

    // --------------- Funciones especificas del componente ------------------------------------------

    const toggleCreate = () => {
        setIsCreating(!isCreating); 
    }; // Alternar para abrir o no el formulario CREATE: GENERAL
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

    // -----------------------------------------------------------------------------------------------

    return (
        <>
            <Toast ref={toast} />
            <div className="page-container">
                <h5 className="page-title">Gacetas</h5>
                <div className="page-options">
                    <button className="btn-page-options" onClick={toggleCreate}>
                        <i className="pi pi-plus" style={{ fontSize: '0.8rem', margin: '0' }}></i>
                        <label>Crear</label>
                    </button>
                </div>
                <div className="page-table">
                    <GacetasTable onSelect={(gacetaId) => { setIsViewing(true); setIdSelected(gacetaId); }} /> 
                </div>
            </div>
            {isCreating && <GacetasCreate onClose={() => setIsCreating(false)} />}
            {isViewing && <GacetasDetails onEdited={onEdited} onDeleted={onDeleted} onClose={() => setIsViewing(false)} gacetaId={idSelected} />}
        </>
    );
}

export default GacetasPage;