import React, { useState, useEffect } from 'react';

// Redux
import { useSelector, useDispatch } from 'react-redux';
import { setSelectedOption } from '../../../context/gestionRegulatorioSlice'; // EDITABLE

// Components
import EmptyGestionOption from '../../administracionComponents/Empty/EmptyGestionOption';
import GrupoPage from './Grupo/GrupoPage';

function GestionRegulatorioPage() { // EDITABLE

    // --------------- Redux store settings (Sí se edita) -------------------------------------------------------

    const dispatch = useDispatch();
    const selectedPersistedOption = useSelector(state => state.gestionRegulatorio.SelectedOption); // EDITABLE: persistencia de este componente

    // --------------- Estados que requieren persistencia (No se edita) --------------------------------------------

    const [selected, setSelected] = useState(""); // Primera opción que se va a mostrar

    // --------------- Funciones necesarias para persistencia (No se edita) ----------------------------------------

    useEffect(() => {
        if (selectedPersistedOption) {
            setSelected(selectedPersistedOption || "");
        }
    }, []); // Se ejecuta cuando el componente renderiza, lee los datos guardados.
    const saveState = () => {
        dispatch(setSelectedOption(selected));
    };// Guarda en el store los estados como objetos: ESPECIFICO
    useEffect(() => {
        return () => {
            saveState();
        };
    }, [selected]); // Se ejecuta con cada cambio de estado, persiste los datos: ESPECIFICO -> PUEDE OPTIMIZARSE

    // --------------- Funciones especificas del componente (Sí se edita) ------------------------------------------

    const handleOptionClick = (option) => {
        setSelected(option); 
    };

    const renderContent = () => {
        switch (selected) {
            case 'Grupos':
                return <GrupoPage />
            default:
                return <EmptyGestionOption title="Gestión de regulatorio" />
        }
    }; // EDITABLE, mapear las opciones que habrán disponibles y sus componentes correspondientes

    // -----------------------------------------------------------------------------------------------

    return (
        <>
            <div className="page-container">
                <h5 className="page-title">Gestión de regulatorio</h5>
                <div className="page-options">
                    <button className={`btn-page-options ${selected !== "Grupos" && 'btn-page-options-unselected'}`} onClick={() => handleOptionClick("Grupos")}> {/* EDITAR*/}
                        <i className="pi pi-th-large" style={{ fontSize: '0.8rem', margin: '0' }}></i> {/* EDITAR*/}
                        <label>Grupos</label> {/* EDITAR*/}
                    </button>
                </div>
                <div className="page-table">
                    {renderContent()}
                </div>
            </div>
        </>
    );
}

export default GestionRegulatorioPage;