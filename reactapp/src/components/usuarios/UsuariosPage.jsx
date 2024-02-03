import React, { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Toast } from 'primereact/toast';
import UsuariosTable from './UsuariosTable';
import UsuariosCreate from './UsuariosCreate';


function UsuariosPage() {

    // --------------- Setup (Servicios, Contextos, Referencias) -----------------------------------

    const toast = useRef(null);

    // --------------- Estados que requieren persistencia --------------------------------------------

    const [isCreating, setIsCreating] = useState(false);
    const [isViewing, setIsViewing] = useState(false);
    const [idSelected, setIdSelected] = useState(null);

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
    const onCreated = () => {
        /*triggerTableRefresh();*/
    }; // Toast para mostrar si se eliminó un registro: GENERAL

    // -----------------------------------------------------------------------------------------------

    return (
        <>
            <Toast ref={toast} />
            <div className="page-container">
                <h5 className="page-title">Usuarios del sistema</h5>
                <div className="page-options">
                    <button className="btn-page-options" onClick={toggleCreate}>
                        <i className="pi pi-plus" style={{ fontSize: '0.8rem', margin: '0' }}></i>
                        <label>Crear</label>
                    </button>
                </div>
                <div className="page-table">
                    <UsuariosTable onClose={() => setIsViewing(false)} onSelect={(usuarioId) => { setIsViewing(true); setIdSelected(usuarioId); }} />
                </div>
            </div>
            {isCreating && <UsuariosCreate onCreated={onCreated} onClose={() => setIsCreating(false)} />}
            {isViewing && <UsuariosCreate onEdited={onEdited} onDeleted={onDeleted} onClose={() => setIsViewing(false)} selectedUsuarioId={idSelected} />}
        </>
    );
}

export default UsuariosPage;