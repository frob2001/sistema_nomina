import React, { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { saveData } from '../../context/recordatorioSectionSlice';
import { Toast } from 'primereact/toast';

// Components
import InstanciasChart from './InstanciasChart'
import RecordatoriosCreate from './RecordatoriosCreate';
import RecordatorioDetails from './RecordatoriosDetails';

function RecordatoriosPage() { // EDITABLE

    // --------------- Redux store settings (Sí se edita) -------------------------------------------------------

    const dispatch = useDispatch();
    const recordatorioPageData = useSelector(state => state.recordatorioSection.RecordatorioPage);

    // --------------- Setup (Servicios, Contextos, Referencias) -----------------------------------

    const toast = useRef(null);

    // --------------- Estados que requieren persistencia --------------------------------------------

    const [isCreating, setIsCreating] = useState(false);
    const [isViewing, setIsViewing] = useState(false);
    const [idSelected, setIdSelected] = useState(null);

    // --------------- Funciones necesarias para persistencia ----------------------------------------

    useEffect(() => {
        if (recordatorioPageData) {
            setIsCreating(recordatorioPageData.isCreating || false);
            setIsViewing(recordatorioPageData.isViewing || false);
            setIdSelected(recordatorioPageData.idSelected || null);
        }
    }, []); // Se ejecuta cuando el componente renderiza, lee los datos guardados: ESPECIFICO
    const saveState = () => {
        dispatch(saveData({ objectName: 'RecordatorioPage', value: { isCreating, isViewing, idSelected } }));
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
            detail: 'Recordatorio eliminado con éxito',
            life: 3000,
        });
    }; // Toast para mostrar si se eliminó un registro: GENERAL
    const onEdited = () => {
        toast.current.show({
            severity: 'success',
            summary: 'Proceso exitoso',
            detail: 'Recordatorio editado con éxito',
            life: 3000,
        });
    }; // Toast para mostrar si se editó un registro: GENERAL

    // -----------------------------------------------------------------------------------------------

    return (
        <>
            <Toast ref={toast} />
            <div className="page-container">
                <h5 className="page-title">Recordatorios</h5>
                <div className="page-options">
                    <button className="btn-page-options" onClick={toggleCreate}>
                        <i className="pi pi-plus" style={{ fontSize: '0.8rem', margin: '0' }}></i>
                        <label>Crear</label>
                    </button>
                </div>
                <div className="page-table">
                    <InstanciasChart onSelect={(recordatorioId) => { setIsViewing(true); setIdSelected(recordatorioId); }} />
                </div>
            </div>
            {isCreating && <RecordatoriosCreate onClose={() => setIsCreating(false)} />}
            {isViewing && <RecordatorioDetails onEdited={onEdited} onDeleted={onDeleted} onClose={() => setIsViewing(false)} recordatorioId={idSelected} />}
        </>
    );
}

export default RecordatoriosPage;