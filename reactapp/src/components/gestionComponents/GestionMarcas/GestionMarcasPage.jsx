import React, { useState, useEffect } from 'react';

// Redux
import { useSelector, useDispatch } from 'react-redux';
import { setSelectedOption } from '../../../context/gestionMarcaSlice'; // EDITABLE

// Components
import EmptyGestionOption from '../../administracionComponents/Empty/EmptyGestionOption';
import TipoAccionPage from './TipoAccion/TipoAccionPage';
import TipoMarcaPage from './TipoMarca/TipoMarcaPage';
import TipoSignoMarcaPage from './TipoSignoMarca/TipoSignoMarcaPage';
import TipoSistemaMarcaPage from './TipoSistemaMarca/TipoSistemaMarcaPage';

function GestionMarcasPage() { // EDITABLE

    // --------------- Redux store settings (Sí se edita) -------------------------------------------------------

    const dispatch = useDispatch();
    const selectedPersistedOption = useSelector(state => state.gestionMarca.SelectedOption); // EDITABLE: persistencia de este componente

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
            case 'Tipos de acciones a terceros':
                return <TipoAccionPage />
            case 'Tipos de marcas':
                return <TipoMarcaPage />
            case 'Tipos de signos de marca':
                return <TipoSignoMarcaPage />
            case 'Tipos de sistema de marca':
                return <TipoSistemaMarcaPage />
            default:
                return <EmptyGestionOption title="Gestión de marcas" />
        }
    }; // EDITABLE, mapear las opciones que habrán disponibles y sus componentes correspondientes

    // -----------------------------------------------------------------------------------------------

    return (
        <>
            <div className="page-container">
                <h5 className="page-title">Gestión de marcas</h5>
                <div className="page-options">
                    <button className={`btn-page-options ${selected !== "Tipos de acciones a terceros" && 'btn-page-options-unselected'}`} onClick={() => handleOptionClick("Tipos de acciones a terceros")}> {/* EDITAR*/}
                        <i className="pi pi-exclamation-circle" style={{ fontSize: '0.8rem', margin: '0' }}></i> {/* EDITAR*/}
                        <label>Tipos de acciones a terceros</label> {/* EDITAR*/}
                    </button>
                    <button className={`btn-page-options ${selected !== "Tipos de marcas" && 'btn-page-options-unselected'}`} onClick={() => handleOptionClick("Tipos de marcas")}> {/* EDITAR*/}
                        <i className="pi pi-align-left" style={{ fontSize: '0.8rem', margin: '0' }}></i> {/* EDITAR*/}
                        <label>Tipos de marcas</label> {/* EDITAR*/}
                    </button>
                    <button className={`btn-page-options ${selected !== "Tipos de signos de marca" && 'btn-page-options-unselected'}`} onClick={() => handleOptionClick("Tipos de signos de marca")}> {/* EDITAR*/}
                        <i className="pi pi-circle" style={{ fontSize: '0.8rem', margin: '0' }}></i> {/* EDITAR*/}
                        <label>Tipos de signos de marca</label> {/* EDITAR*/}
                    </button>
                    <button className={`btn-page-options ${selected !== "Tipos de sistema de marca" && 'btn-page-options-unselected'}`} onClick={() => handleOptionClick("Tipos de sistema de marca")}> {/* EDITAR*/}
                        <i className="pi pi-tags" style={{ fontSize: '0.8rem', margin: '0' }}></i> {/* EDITAR*/}
                        <label>Tipos de sistema de marca</label> {/* EDITAR*/}
                    </button>
                </div>
                <div className="page-table">
                    {renderContent()}
                </div>
            </div>
        </>
    );
}

export default GestionMarcasPage;