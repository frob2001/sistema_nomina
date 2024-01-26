import React, { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { saveData } from '../../../context/claseSlice';
import ClasesTable from './ClasesTable';
import ClasesCreate from './ClasesCreate';
import ClasesDetails from './ClasesDetails';
import { Toast } from 'primereact/toast';

function ClasesPage() {

    // --------------- Redux store settings -------------------------------------------------------

    const dispatch = useDispatch();
    const clasePageData = useSelector(state => state.clase.ClasePage);

    // --------------- Setup (Servicios, Contextos, Referencias) -----------------------------------

    const toast = useRef(null);

    // --------------- Estados que requieren persistencia --------------------------------------------

    const [isCreating, setIsCreating] = useState(false);
    const [isViewing, setIsViewing] = useState(false);
    const [idSelected, setIdSelected] = useState(null);

    // --------------- Funciones necesarias para persistencia ----------------------------------------

    useEffect(() => {
        if (clasePageData) {
            setIsCreating(clasePageData.isCreating || false);
            setIsViewing(clasePageData.isViewing || false);
            setIdSelected(clasePageData.idSelected || null);
        }
    }, []); // Se ejecuta cuando el componente renderiza, lee los datos guardados: ESPECIFICO
    const saveState = () => {
        dispatch(saveData({ objectName: 'ClasePage', value: { isCreating, isViewing, idSelected } }));
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
                <h5 className="page-title">Clases</h5>
                <div className="page-options">
                    <button className="btn-page-options" onClick={toggleCreate}>
                        <i className="pi pi-plus" style={{ fontSize: '0.8rem', margin: '0' }}></i>
                        <label>Crear</label>
                    </button>
                </div>
                <div className="page-table">
                    <ClasesTable onClose={() => setIsViewing(false)} onSelect={(claseId) => { setIsViewing(true); setIdSelected(claseId); }} /> 
                </div>
            </div>
            {isCreating && <ClasesCreate onClose={() => setIsCreating(false)} />}
            {isViewing && <ClasesDetails onEdited={onEdited} onDeleted={onDeleted} onClose={() => setIsViewing(false)} claseId={idSelected} />}
        </>
    );
}

export default ClasesPage;