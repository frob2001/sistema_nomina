import React, { useState, useEffect } from 'react';

// Redux
import { useSelector, useDispatch } from 'react-redux';
import { setSelectedOption } from '../../../context/gestionGeneralSlice'; // EDITABLE

// Components
import EmptyGestionOption from '../../administracionComponents/Empty/EmptyGestionOption';
import TipoReferenciaPage from './TipoReferencia/TipoReferenciaPage';
import TipoPublicacionPage from './TipoPublicacion/TipoPublicacionPage';
import TipoEstadoPage from './TipoEstado/TipoEstadoPage';
import PaisTable from './Paises/PaisTable';
import IdiomasTable from './Idiomas/IdiomasTable';
// .....

function GestionGeneralPage() { // EDITABLE

    // --------------- Redux store settings (Sí se edita) -------------------------------------------------------

    const dispatch = useDispatch();
    const selectedPersistedOption = useSelector(state => state.gestionGeneral.SelectedOption); // EDITABLE: persistencia de este componente

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
            case 'Tipos de referencia':
                return <TipoReferenciaPage />
            case 'Tipos de publicación':
                return <TipoPublicacionPage />
            case 'Tipos de estados':
                return <TipoEstadoPage />
            case 'Países':
                return <PaisTable />
            case 'Idiomas':
                return <IdiomasTable />
            default:
                return <EmptyGestionOption title="Gestión general" />
        }
    }; // EDITABLE, mapear las opciones que habrán disponibles y sus componentes correspondientes

    // -----------------------------------------------------------------------------------------------

    return (
        <>
            <div className="page-container">
                <h5 className="page-title">Gestión general</h5>
                <div className="page-options">
                    <button className={`btn-page-options ${selected !== "Países" && 'btn-page-options-unselected'}`} onClick={() => handleOptionClick("Países")}> {/* EDITAR*/}
                        <i className="pi pi-globe" style={{ fontSize: '0.8rem', margin: '0' }}></i> {/* EDITAR*/}
                        <label>Países</label> {/* EDITAR*/}
                    </button>
                    <button className={`btn-page-options ${selected !== "Idiomas" && 'btn-page-options-unselected'}`} onClick={() => handleOptionClick("Idiomas")}> {/* EDITAR*/}
                        <i className="pi pi-language" style={{ fontSize: '0.8rem', margin: '0' }}></i> {/* EDITAR*/}
                        <label>Idiomas</label> {/* EDITAR*/}
                    </button>
                    <button className={`btn-page-options ${selected !== "Tipos de referencia" && 'btn-page-options-unselected'}`}  onClick={() => handleOptionClick("Tipos de referencia")}> {/* EDITAR*/}
                        <i className="pi pi-list" style={{ fontSize: '0.8rem', margin: '0' }}></i> {/* EDITAR*/}
                        <label>Tipos de referencia</label> {/* EDITAR*/}
                    </button>
                    <button className={`btn-page-options ${selected !== "Tipos de publicación" && 'btn-page-options-unselected'}`} onClick={() => handleOptionClick("Tipos de publicación")}> {/* EDITAR*/}
                        <i className="pi pi-bookmark" style={{ fontSize: '0.8rem', margin: '0' }}></i> {/* EDITAR*/}
                        <label>Tipos de publicación</label> {/* EDITAR*/}
                    </button>
                    <button className={`btn-page-options ${selected !== "Tipos de estados" && 'btn-page-options-unselected'}`} onClick={() => handleOptionClick("Tipos de estados")}> {/* EDITAR*/}
                        <i className="pi pi-tag" style={{ fontSize: '0.8rem', margin: '0' }}></i> {/* EDITAR*/}
                        <label>Tipos de estados</label> {/* EDITAR*/}
                    </button>
                </div>
                <div className="page-table">
                    {renderContent()}
                </div>
            </div>
        </>
    );
}

export default GestionGeneralPage;