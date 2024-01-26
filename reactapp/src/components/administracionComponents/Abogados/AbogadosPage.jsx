import React, { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { saveData } from '../../../context/abogadoSlice';
import AbogadosTable from './AbogadosTable';
import AbogadosCreate from './AbogadosCreate';
import AbogadosDetails from './AbogadosDetails';
import { Toast } from 'primereact/toast';


function AbogadosPage() {

    // --------------- Redux store settings -------------------------------------------------------

    const dispatch = useDispatch();
    const abogadoPageData = useSelector(state => state.abogado.AbogadoPage);

    // --------------- Setup (Servicios, Contextos, Referencias) -----------------------------------

    const toast = useRef(null);

    // --------------- Estados que requieren persistencia --------------------------------------------

    const [isCreating, setIsCreating] = useState(false);
    const [isViewing, setIsViewing] = useState(false);
    const [idSelected, setIdSelected] = useState(null);

    // --------------- Funciones necesarias para persistencia ----------------------------------------

    useEffect(() => {
        if (abogadoPageData) {
            setIsCreating(abogadoPageData.isCreating || false);
            setIsViewing(abogadoPageData.isViewing || false);
            setIdSelected(abogadoPageData.idSelected || null);
        }
    }, []); // Se ejecuta cuando el componente renderiza, lee los datos guardados: ESPECIFICO
    const saveState = () => {
        dispatch(saveData({ objectName: 'AbogadoPage', value: { isCreating, isViewing, idSelected } }));
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
                <h5 className="page-title">Abogados</h5>
                <div className="page-options">
                    <button className="btn-page-options" onClick={toggleCreate}>
                        <i className="pi pi-plus" style={{ fontSize: '0.8rem', margin: '0' }}></i>
                        <label>Crear</label>
                    </button>
                </div>
                <div className="page-table">
                    <AbogadosTable onClose={() => setIsViewing(false)} onSelect={(abogadoId) => { setIsViewing(true); setIdSelected(abogadoId); }} />
                </div>
            </div>
            {isCreating && <AbogadosCreate onClose={() => setIsCreating(false)} />}
            {isViewing && <AbogadosDetails onEdited={onEdited} onDeleted={onDeleted} onClose={() => setIsViewing(false)} abogadoId={idSelected} />}
        </>
    );
}

export default AbogadosPage;