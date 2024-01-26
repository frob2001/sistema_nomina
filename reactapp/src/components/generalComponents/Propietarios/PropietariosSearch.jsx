import React, { useState, useRef, useEffect } from 'react';
import Draggable from 'react-draggable';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { Dropdown } from 'primereact/dropdown';

// Redux
import { saveData, deleteData } from '../../../context/propietarioSlice'; // EDITABLE
import { useSelector, useDispatch } from 'react-redux';
import { usePaises } from '../../../services/usePais';
import { useAbogados } from '../../../services/useAbogados';

function PropietariosSearch({ onClose, onSearch }) { //EDITABLE

    // --------------- Redux store settings -------------------------------------------------------

    const dispatch = useDispatch();
    const propietarioSearchData = useSelector(state => state.propietario.PropietarioSearch); // EDITABLE

    // --------------- Setup (Servicios, Contextos, Referencias) -----------------------------------

    const isClosingRef = useRef(false); // Referencia para eliminar persistencia: EDITABLE
    const toast = useRef(null); // Referencia para el toast: GENERAL
    const { paises, error: errorP, isLoading: isLoadingP, isValidating: isValidatingP, refresh: refreshP } = usePaises(); // EDITABLE
    const { abogados, error: errorA, isLoading: isLoadingA, isValidating: isValidatingA, refresh: refreshA } = useAbogados(); // EDITABLE

    // --------------- Estados que no requieren persistencia -----------------------------------------

    const [isRefreshing, setIsRefreshing] = useState(false);
    const opcionesGeneral = [
        { booleanValue: 'true', nombre: 'Sí' },
        { booleanValue: 'false', nombre: 'No' },
    ]

    // --------------- Estados que requieren persistencia --------------------------------------------

    const [searchParameters, setSearchParameters] = useState(null);// mapea los parámetros de búsqueda
    const [selectedPais, setSelectedPais] = useState(null); // saber el país seleccionado: ESPECIFICO
    const [selectedAbogado, setSelectedAbogado] = useState(null); // saber el abogado seleccionado: ESPECIFICO
    const [selectedGeneral, setSelectedGeneral] = useState(null); // saber el general seleccionado: ESPECIFICO

    // --------------- Funciones necesarias para persistencia ----------------------------------------

    useEffect(() => {
        if (propietarioSearchData) { // EDITABLE
            setSearchParameters(propietarioSearchData.searchParameters || null); // EDITABLE
            setSelectedPais(propietarioSearchData.selectedPais || null);
            setSelectedAbogado(propietarioSearchData.selectedAbogado || null);
            setSelectedGeneral(propietarioSearchData.selectedGeneral || null);
        }
    }, []); // Se ejecuta cuando el componente renderiza, lee los datos guardados: GENERAL
    const saveState = () => {
        dispatch(saveData({ objectName: 'PropietarioSearch', value: { searchParameters, selectedPais, selectedAbogado, selectedGeneral  } })); // EDITABLE
    }; // Guarda en el contexto los estados como objetos: ESPECIFICO
    useEffect(() => {
        return () => {
            if (!isClosingRef.current) {
                saveState();
            }
        };
    }, [searchParameters, selectedPais, selectedAbogado, selectedGeneral]); // Se ejecuta con cada cambio de estado.
    const deletePersistedStates = () => {
        dispatch(deleteData({ objectName: 'PropietarioSearch' })); // EDITABLE
    }; // Elimina los datos en el objeto del contexto: ESPECIFICO

    // --------------- Funciones especificas del componente ------------------------------------------

    // --------------- DROPDOWNS ---------------------------------------------------------------------
    const refreshData = (e) => {
        e.preventDefault();
        setIsRefreshing(true);
        refreshP();
        refreshA();
    }; // Refresca los datos de los DROPDOWNs
    useEffect(() => {
        if (isRefreshing) {
            setIsRefreshing(false);
        }
    }, [isValidatingP, isValidatingA]); // Cambia el estado de refreshing de los DROPDOWNs

    useEffect(() => {
        setSearchParameters(prevSP => {
            // Clone the previous state
            const newSP = { ...prevSP };

            if (selectedPais) {
                // If selectedTCC is defined, update the TipoContacto
                newSP.codigoPais = selectedPais.codigoPais;
            } else if (newSP.codigoPais !== undefined) {
                // If selectedTCC is undefined and TipoContacto exists, delete it
                delete newSP.codigoPais;
            }

            return newSP;
        });
    }, [selectedPais]);

    useEffect(() => {
        setSearchParameters(prevSP => {
            // Clone the previous state
            const newSP = { ...prevSP };

            if (selectedAbogado) {
                newSP.abogadoId = selectedAbogado.abogadoId;
            } else if (newSP.abogadoId !== undefined) {
                delete newSP.abogadoId;
            }

            return newSP;
        });
    }, [selectedAbogado]); // Actualiza el objeto cuando el valor del dropdown cambia (hacer uno por cada dropdown): ESPECIFICO

    useEffect(() => {
        setSearchParameters(prevSP => {
            // Clone the previous state
            const newSP = { ...prevSP };

            if (selectedGeneral) {
                newSP.general = selectedGeneral.booleanValue;
            } else if (newSP.general !== undefined) {
                delete newSP.general;
            }

            return newSP;
        });
    }, [selectedGeneral]);

    const optionTemplate = (option) => {
        return (
            <div className="dropdown-item-container">
                <span>{option.nombre}</span>
            </div>
        );
    }; // EDITABLE

    const selectedValueTemplate = (option, props) => {
        if (option) {
            return (
                <div className="dropdown-item-container">
                    <span>{option.nombre}</span>
                </div>
            );
        }

        return <span>{props.placeholder}</span>;
    }; //EDITABLE

    const optionTemplateA = (option) => {
        return (
            <div className="dropdown-item-container">
                <span>{option.nombre} {option.apellido}</span>
            </div>
        );
    }; // EDITABLE

    const selectedValueTemplateA = (option, props) => {
        if (option) {
            return (
                <div className="dropdown-item-container">
                    <span>{option.nombre} {option.apellido}</span>
                </div>
            );
        }

        return <span>{props.placeholder}</span>;
    }; //EDITABLE

    //----------------------------------- FIN DROPDOWNS ----------------------------------------------------------

    function makeURL(obj) {
        let url = '?';
        let isFirst = true;

        for (const key in obj) {
            if (isFirst) {
                url += key + '=' + obj[key];
                isFirst = false;
            } else {
                url += '&' + key + '=' + obj[key];
            }
        }
        return url;
    }

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        // Create a copy of the current searchParameters object
        const updatedSearchParameters = { ...searchParameters };
        // Check if the value is empty (e.g., an empty string)
        if (value === '' || null || undefined) {
            // If the value is empty, remove the property from the object
            delete updatedSearchParameters[name];
        } else {
            // If the value is not empty, update the property in the object
            updatedSearchParameters[name] = value;
        }

        // Update the searchParameters object
        setSearchParameters(updatedSearchParameters);
    };
    
    const handleSearch = async (e) => {

        // Check if both fechaPoderInicio and fechaPoderFin exist
        if (searchParameters.fechaPoderInicio && searchParameters.fechaPoderFin) {
            const startDate = new Date(searchParameters.fechaPoderInicio);
            const endDate = new Date(searchParameters.fechaPoderFin);

            // Check if startDate is earlier than endDate
            if (startDate > endDate) {
                // Show an error message or handle the error
                toast.current.show({
                    severity: 'info',
                    summary: 'Alerta',
                    detail: 'La fecha (desde) del poder debe ser anterior a la fecha (hasta) del poder', // EDITABLE
                    life: 3000,
                });
                return; // Stop the function if the dates are invalid
            }
        }


        e.preventDefault();
        onSearch(makeURL(searchParameters));
        onClose();
    }; // Maneja la búsqueda del objeto: GENERAL

    const resetStates = () => {
        setSearchParameters(null); // EDITABLE
    } // Resetea los estados del componente: ESPECIFICO

    const handleCancel = () => {
        isClosingRef.current = true;
        resetStates();
        deletePersistedStates();
        onClose();
    }; // Maneja el cancelar del formulario (Datos no persisten): GENERAL

    const handleMinimize = () => {
        isClosingRef.current = false; 
        onClose();
    }; // Maneja el minimizar del formulario (Datos persisten): GENERAL

    // -----------------------------------------------------------------------------------------------

    return (
        <>
            <Draggable cancel="input, button, textarea" bounds="parent">
                <div className="form-container wide-form">
                    <section className="form-header">
                        <span>Buscar propietarios</span> 
                        <div className="form-header-buttons">
                            <Button className="form-header-btn" onClick={handleMinimize}>
                                <i className="pi pi-minus" style={{ fontSize: '0.6rem', color:'var(--secondary-blue)',fontWeight: '800' }}></i>
                            </Button>
                            <Button className="form-header-btn" onClick={handleCancel}>
                                <i className="pi pi-times" style={{ fontSize: '0.6rem', color: 'var(--secondary-blue)', fontWeight: '600' }}></i>
                            </Button>
                        </div>
                    </section>
                    <form className="form-body">
                        <section>
                            <div className="form-group-label">
                                <i className="pi pi-briefcase"></i>
                                <label>Propietario</label>
                            </div>
                            <div className="form-body-group">
                                <div className="form-group">
                                    <label>Código</label>
                                    <input type="number" name="propietarioId" value={searchParameters?.propietarioId || ''} onChange={handleInputChange} maxLength="8" placeholder="Código único del propietario"/>
                                </div>
                                <div className="form-group">
                                    <label>Nombre</label>
                                    <input type="text" name="nombre" value={searchParameters?.nombre || ''} onChange={handleInputChange} maxLength="255" placeholder="Nombre del propietario" />
                                </div>
                            </div>
                        </section>
                        <section>
                            <div className="form-group-label">
                                <i className="pi pi-book"></i>
                                <label>Poder</label>
                            </div>
                            <div className="form-body-group">
                                <div className="form-group">
                                    <label>Número de poder</label>
                                    <input type="text" name="numeroPoder" value={searchParameters?.numeroPoder || ''} onChange={handleInputChange} maxLength="20" placeholder="Número del poder" />
                                </div>
                                <div className="form-group">
                                    <label>Apoderado</label>
                                    <div>
                                        {
                                            errorA || !abogados ? (
                                                <div className="dropdown-error">
                                                    <div className="dropdown-error-msg">
                                                        {isLoadingA || (isRefreshing && isValidatingA) ?
                                                            <div className="small-spinner" /> :
                                                            <span>Ocurrió un error: sin opciones disponibles</span>}
                                                    </div>
                                                    <Button className="rounded-icon-btn" onClick={refreshData}>
                                                        <i className="pi pi-refresh" style={{ fontSize: '0.8rem', margin: '0' }}></i>
                                                    </Button>
                                                </div>
                                            ) : (
                                                <Dropdown
                                                    showClear
                                                    style={{ width: '100%' }}
                                                    value={selectedAbogado}
                                                    onChange={(e) => setSelectedAbogado(e.value)}
                                                    options={abogados}
                                                    optionLabel="nombre"
                                                    placeholder="Selecciona un apoderado"
                                                    filter
                                                    virtualScrollerOptions={{ itemSize: 38 }}
                                                    valueTemplate={selectedValueTemplateA}
                                                    itemTemplate={optionTemplateA}
                                                />
                                            )
                                        }
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label>Origen</label>
                                    <input type="text" name="origen" value={searchParameters?.origen || ''} onChange={handleInputChange} maxLength="1000" placeholder="Origen del poder" />
                                </div>
                                <div className="form-group">
                                    <label>General</label>
                                    <Dropdown
                                        showClear
                                        style={{ width: '100%' }}
                                        value={selectedGeneral}
                                        onChange={(e) => setSelectedGeneral(e.value)}
                                        options={opcionesGeneral}
                                        optionLabel="nombre"
                                        placeholder="Selecciona una opción"
                                        filter
                                        virtualScrollerOptions={{ itemSize: 38 }}
                                        valueTemplate={selectedValueTemplate}
                                        itemTemplate={optionTemplate}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Fecha (desde)</label>
                                    <input type="date" name="fechaPoderInicio" value={searchParameters?.fechaPoderInicio || ''} onChange={handleInputChange} />
                                </div>
                                <div className="form-group">
                                    <label>Fecha (hasta)</label>
                                    <input type="date" name="fechaPoderFin" value={searchParameters?.fechaPoderFin || ''} onChange={handleInputChange} />
                                </div>
                            </div>
                        </section>
                        <section>
                            <div className="form-group-label">
                                <i className="pi pi-map-marker"></i>
                                <label>Ubicación</label>
                            </div>
                            <div className="form-body-group">
                                <div className="form-group">
                                    <label>País</label>
                                    <div>
                                        {
                                            errorP || !paises ? (
                                                <div className="dropdown-error">
                                                    <div className="dropdown-error-msg">
                                                        {isLoadingP || (isRefreshing && isValidatingP) ?
                                                            <div className="small-spinner" /> :
                                                            <span>Ocurrió un error: sin opciones disponibles</span>}
                                                    </div>
                                                    <Button className="rounded-icon-btn" onClick={refreshData}>
                                                        <i className="pi pi-refresh" style={{ fontSize: '0.8rem', margin: '0' }}></i>
                                                    </Button>
                                                </div>
                                            ) : (
                                                <Dropdown
                                                    showClear
                                                    style={{ width: '100%' }}
                                                    value={selectedPais}
                                                    onChange={(e) => setSelectedPais(e.value)}
                                                    options={paises}
                                                    optionLabel="nombre"
                                                    placeholder="Selecciona un país"
                                                    filter
                                                    virtualScrollerOptions={{ itemSize: 38 }}
                                                    valueTemplate={selectedValueTemplate}
                                                    itemTemplate={optionTemplate}
                                                />
                                            )
                                        }
                                    </div>
                                </div>
                            </div>
                        </section>
                    </form>
                    <div className="form-info-msg">
                        <i className="pi pi-exclamation-circle" style={{ fontSize: '0.8rem', margin: '0', color: 'var(--secondary-blue)', fontWeight: '600' }}></i>
                        <span>Si no selecciona ningún campo, se buscarán todos los registros y esto puede tardar más tiempo</span>
                    </div>
                    <div className="center-hr">
                        <hr />
                    </div>
                    <section className="form-footer">
                        <button className="form-cancel-btn" onClick={handleCancel}>Cancelar</button>
                        <button type="submit" className="form-accept-btn" onClick={handleSearch}>Buscar</button>
                    </section>
                </div>
            </Draggable>
            <Toast ref={toast} />
        </>
    );
}

export default PropietariosSearch;