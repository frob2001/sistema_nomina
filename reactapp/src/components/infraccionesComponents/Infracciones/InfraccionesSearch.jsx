import React, { useState, useRef, useEffect } from 'react';
import Draggable from 'react-draggable';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { Dropdown } from 'primereact/dropdown';
import { TabView, TabPanel } from 'primereact/tabview';
import DebounceDropdown from '../../miscComponents/Dropdown/DebounceDropdown';

// Redux
import { saveData, deleteData } from '../../../context/infraccionSlice'; // EDITABLE
import { useSelector, useDispatch } from 'react-redux';

// Servicios para dropdowns normales
import { useTipoInfraccion } from '../../../services/useTipoInfraccion';
import { usePaises } from '../../../services/usePais';
import { useClases } from '../../../services/useClases';
import { useAbogados } from '../../../services/useAbogados';
import { useEstados } from '../../../services/useEstados';


function InfraccionesSearch({ onClose, onSearch }) { //EDITABLE

    // --------------- Redux store settings -------------------------------------------------------

    const dispatch = useDispatch();
    const infraccionSearchData = useSelector(state => state.infraccion.InfraccionSearch); // EDITABLE

    // --------------- Setup (Servicios, Contextos, Referencias) -----------------------------------

    const isClosingRef = useRef(false); // Referencia para eliminar persistencia: EDITABLE
    const toast = useRef(null); // Referencia para el toast: GENERAL
    const { paises, error: errorP, isLoading: isLoadingP, isValidating: isValidatingP, refresh: refreshP } = usePaises(); // EDITABLE
    const { clases, error: errorC, isLoading: isLoadingC, isValidating: isValidatingC, refresh: refreshC } = useClases(); // EDITABLE
    const { abogados, error: errorA, isLoading: isLoadingA, isValidating: isValidatingA, refresh: refreshA } = useAbogados(); // EDITABLE
    const { tiposInfracciones, error: errorTI, isLoading: isLoadingTI, isValidating: isValidatingTI, refresh: refreshTI } = useTipoInfraccion(); // EDITABLE
    const { estados: estadosOptions, error: errorE, isLoading: isLoadingE, isValidating: isValidatingE, refresh: refreshE } = useEstados(); // Para el dropdown de estados

    // --------------- Estados que no requieren persistencia -----------------------------------------

    const [isRefreshing, setIsRefreshing] = useState(false);

    // --------------- Estados que requieren persistencia --------------------------------------------

    const [searchParameters, setSearchParameters] = useState(null); // mapea los parámetros de búsqueda

    // Dropdowns normales
    const [selectedTipoInfraccion, setSelectedTipoInfraccion] = useState(null); 
    const [selectedAbogado, setSelectedAbogado] = useState(null); 
    const [selectedPaisMarca, setSelectedPaisMarca] = useState(null); 
    const [selectedPaisInfractor, setSelectedPaisInfractor] = useState(null); 
    const [selectedClaseMarca, setSelectedClaseMarca] = useState(null);
    const [selectedClaseInfractor, setSelectedClaseInfractor] = useState(null);
    const [selectedEstado, setSelectedEstado] = useState(null); 

    // Debounced dropdowns
    const [selectedOficinaTramitante, setSelectedOficinaTramitante] = useState(null); 
    const [selectedMarca, setSelectedMarca] = useState(null); 
    const [selectedCaso, setSelectedCaso] = useState(null); 
    const [selectedAutoridad, setSelectedAutoridad] = useState(null); 

    // --------------- Funciones necesarias para persistencia ----------------------------------------

    useEffect(() => {
        console.log(makeURL(searchParameters));
    }, [searchParameters])

    useEffect(() => {
        if (infraccionSearchData) { // EDITABLE
            setSearchParameters(infraccionSearchData.searchParameters || null); // EDITABLE

            setSelectedTipoInfraccion(infraccionSearchData.selectedTipoInfraccion || null);
            setSelectedPaisMarca(infraccionSearchData.selectedPaisMarca || null);
            setSelectedPaisInfractor(infraccionSearchData.selectedPaisInfractor || null);
            setSelectedClaseMarca(infraccionSearchData.selectedClaseMarca || null);
            setSelectedClaseInfractor(infraccionSearchData.selectedClaseInfractor || null);
            setSelectedAbogado(infraccionSearchData.selectedAbogado || null);
            setSelectedEstado(infraccionSearchData.selectedEstado || null);

            setSelectedOficinaTramitante(infraccionSearchData.selectedOficinaTramitante || null);
            setSelectedMarca(infraccionSearchData.selectedMarca || null);
            setSelectedAutoridad(infraccionSearchData.selectedAutoridad || null);
            setSelectedCaso(infraccionSearchData.selectedCaso || null);
        }
    }, []); // Se ejecuta cuando el componente renderiza, lee los datos guardados: GENERAL
    const saveState = () => {
        dispatch(saveData({ objectName: 'InfraccionSearch', value: { searchParameters, selectedEstado, selectedTipoInfraccion, selectedAbogado, selectedOficinaTramitante, selectedAutoridad, selectedMarca, selectedPaisMarca, selectedPaisInfractor, selectedClaseMarca, selectedClaseInfractor, selectedCaso } })); // EDITABLE
    }; // Guarda en el contexto los estados como objetos: ESPECIFICO
    useEffect(() => {
        return () => {
            if (!isClosingRef.current) {
                saveState();
            }
        };
    }, [searchParameters, selectedEstado, selectedTipoInfraccion, selectedAbogado, selectedOficinaTramitante, selectedAutoridad, selectedMarca, selectedPaisMarca, selectedPaisInfractor, selectedClaseMarca, selectedClaseInfractor, selectedCaso]); // Se ejecuta con cada cambio de estado.
    const deletePersistedStates = () => {
        dispatch(deleteData({ objectName: 'InfraccionSearch' })); // EDITABLE
    }; // Elimina los datos en el objeto del contexto: ESPECIFICO

    // --------------- Funciones especificas del componente ------------------------------------------

    const resetStates = () => {
        setSearchParameters(null); // EDITABLE
        setSelectedAbogado(null);
        setSelectedTipoInfraccion(null);
        setSelectedPaisMarca(null);
        setSelectedPaisInfractor(null);
        setSelectedClaseMarca(null);
        setSelectedClaseInfractor(null);
        setSelectedOficinaTramitante(null);
        setSelectedEstado(null);
        setSelectedAutoridad(null);
        setSelectedMarca(null);
        setSelectedCaso(null);
    } // Resetea los estados del componente: ESPECIFICO


    // --------------- DROPDOWNS ---------------------------------------------------------------------
    const refreshData = (e) => {
        e.preventDefault();
        setIsRefreshing(true);
        refreshP();
        refreshC();
        refreshA();
        refreshTI();
        refreshE();
    }; // Refresca los datos de los DROPDOWNs
    useEffect(() => {
        if (isRefreshing) {
            setIsRefreshing(false);
        }
    }, [isValidatingP, isValidatingC, isValidatingA, isValidatingTI, isValidatingE]); // Cambia el estado de refreshing de los DROPDOWNs

    // Tipo infracción
    useEffect(() => {
        setSearchParameters(prevSP => {
            const newSP = { ...prevSP };

            if (selectedTipoInfraccion) {
                newSP.tipoInfraccionId = selectedTipoInfraccion.tipoInfraccionId;
            } else if (newSP.tipoInfraccionId !== undefined) {
                delete newSP.tipoInfraccionId;
            }
            return newSP;
        });
    }, [selectedTipoInfraccion]);

    // País marca
    useEffect(() => {
        setSearchParameters(prevSP => {
            const newSP = { ...prevSP };

            if (selectedPaisMarca) {
                newSP.codigoPaisMarca = selectedPaisMarca.codigoPais;
            } else if (newSP.codigoPaisMarca !== undefined) {
                delete newSP.codigoPaisMarca;
            }
            return newSP;
        });
    }, [selectedPaisMarca]);

    // País infractor
    useEffect(() => {
        setSearchParameters(prevSP => {
            const newSP = { ...prevSP };

            if (selectedPaisInfractor) {
                newSP.codigoPaisInfractor = selectedPaisInfractor.codigoPais;
            } else if (newSP.codigoPaisInfractor !== undefined) {
                delete newSP.codigoPaisInfractor;
            }
            return newSP;
        });
    }, [selectedPaisInfractor]);

    // Clase marca
    useEffect(() => {
        setSearchParameters(prevSP => {
            const newSP = { ...prevSP };

            if (selectedClaseMarca) {
                newSP.claseMarca = selectedClaseMarca.codigo;
            } else if (newSP.claseMarca !== undefined) {
                delete newSP.claseMarca;
            }
            return newSP;
        });
    }, [selectedClaseMarca]);

    // Clase infractor
    useEffect(() => {
        setSearchParameters(prevSP => {
            const newSP = { ...prevSP };
            if (selectedClaseInfractor) {
                newSP.claseInfractor = selectedClaseInfractor.codigo;
            } else if (newSP.claseInfractor !== undefined) {
                delete newSP.claseInfractor;
            }
            return newSP;
        });
    }, [selectedClaseInfractor]);

    // Abogado
    useEffect(() => {
        setSearchParameters(prevSP => {
            const newSP = { ...prevSP };
            if (selectedAbogado) {
                newSP.abogadoId = selectedAbogado.abogadoId;
            } else if (newSP.abogadoId !== undefined) {
                delete newSP.abogadoId;
            }
            return newSP;
        });
    }, [selectedAbogado]); 

    // Autoridad
    useEffect(() => {
        setSearchParameters(prevSP => {
            const newSP = { ...prevSP };

            if (selectedAutoridad) {
                newSP.autoridadId = selectedAutoridad.autoridadId;
            } else if (newSP.autoridadId !== undefined) {
                delete newSP.autoridadId;
            }
            return newSP;
        });
    }, [selectedAutoridad]);

    // Oficina tramitante
    useEffect(() => {
        setSearchParameters(prevSP => {
            const newSP = { ...prevSP };

            if (selectedOficinaTramitante) {
                newSP.oficinaTramitanteId = selectedOficinaTramitante.clienteId;
            } else if (newSP.oficinaTramitanteId !== undefined) {
                delete newSP.oficinaTramitanteId;
            }
            return newSP;
        });
    }, [selectedOficinaTramitante]);

    // Marca
    useEffect(() => {
        setSearchParameters(prevSP => {
            const newSP = { ...prevSP };

            if (selectedMarca) {
                newSP.marcaId = selectedMarca.marcaId;
            } else if (newSP.marcaId !== undefined) {
                delete newSP.marcaId;
            }
            return newSP;
        });
    }, [selectedMarca]);

    // Estado
    useEffect(() => {
        setSearchParameters(prevSP => {
            const newSP = { ...prevSP };

            if (selectedEstado) {
                newSP.estadoId = selectedEstado.codigo;
            } else if (newSP.estadoId !== undefined) {
                delete newSP.estadoId;
            }
            return newSP;
        });
    }, [selectedEstado]);

    // Caso
    useEffect(() => {
        setSearchParameters(prevSP => {
            const newSP = { ...prevSP };

            if (selectedCaso) {
                newSP.casoInfraccionId = selectedCaso.casoInfraccionId;
            } else if (newSP.casoInfraccionId !== undefined) {
                delete newSP.casoInfraccionId;
            }
            return newSP;
        });
    }, [selectedCaso]);

    // Templates para los dropdowns normales

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

    const optionTemplateE = (option) => {
        return (
            <div className="dropdown-item-container">
                <span style={{ color: option.color }}><strong>{option.codigo}</strong> - {option.descripcionEspanol}/{option.descripcionIngles}</span>
            </div>
        );
    }; // EDITABLE: template para mostrar las opciones de un dropdown

    const selectedValueTemplateE = (option, props) => {
        if (option) {
            return (
                <div className="dropdown-item-container">
                    <span style={{ color: option.color }}><strong>{option.codigo}</strong> - {option.descripcionEspanol}/{option.descripcionIngles}</span>
                </div>
            );
        }

        return <span>{props.placeholder}</span>;
    }; //EDITABLE: template para mostrar el valor seleccionado de un dropdown

    const optionTemplateC = (option) => {
        return (
            <div className="dropdown-item-container">
                <span><strong>Clase N° {option.codigo}</strong> {`${option.descripcionEspanol?.substring(0, 20)}...`} </span>
            </div>
        );
    }; // EDITABLE: template para mostrar las opciones de un dropdown

    const selectedValueTemplateC = (option, props) => {
        if (option) {
            return (
                <div className="dropdown-item-container">
                    <span><strong>Clase N° {option.codigo}</strong> {`${option.descripcionEspanol?.substring(0, 20)}...`}</span>
                </div>
            );
        }

        return <span>{props.placeholder}</span>;
    }; //EDITABLE: template para mostrar el valor seleccionado de un dropdown

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

    function datesInvalid(startDateParam, endDateParam) {
        if (!startDateParam || !endDateParam) return false;

        const startDate = new Date(startDateParam);
        const endDate = new Date(endDateParam);
        return startDate > endDate;
    }
    
    const handleSearch = async (e) => {
        e.preventDefault();

        // VALIDACIONES DE FECHAS
        const dateValidationPairs = [
            { from: searchParameters?.fechaRegistroDesde, to: searchParameters?.fechaRegistroHasta, name: "Registro" }
        ];

        for (let { from, to, name } of dateValidationPairs) {
            if (datesInvalid(from, to)) {
                toast.current.show({
                    severity: 'info',
                    summary: 'Alerta',
                    detail: `La fecha 'desde' de ${name} debe ser anterior a la fecha 'hasta' de ${name}`,
                    life: 3000,
                });
                return;
            }
        }

        onSearch(makeURL(searchParameters));
        onClose();
    }; // Maneja la búsqueda del objeto: GENERAL

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
                <div className="form-container wide-form high-form">
                    <section className="form-header">
                        <span>Buscar infracción</span> 
                        <div className="form-header-buttons">
                            <Button className="form-header-btn" onClick={handleMinimize}>
                                <i className="pi pi-minus" style={{ fontSize: '0.6rem', color:'var(--secondary-blue)',fontWeight: '800' }}></i>
                            </Button>
                            <Button className="form-header-btn" onClick={handleCancel}>
                                <i className="pi pi-times" style={{ fontSize: '0.6rem', color: 'var(--secondary-blue)', fontWeight: '600' }}></i>
                            </Button>
                        </div>
                    </section>

                    <TabView>
                        <TabPanel header="Infracción" leftIcon="pi pi-exclamation-triangle mr-2">
                            <div className="form-body">
                                <section>
                                    <div className="form-group-label">
                                        <i className="pi pi-exclamation-triangle"></i>
                                        <label>Infracción</label>
                                    </div>
                                    <div className="form-body-group">
                                        <div className="form-group">
                                            <label>Código</label>
                                            <input type="number" name="infraccionId" value={searchParameters?.infraccionId || ''} onChange={handleInputChange} maxLength="8" placeholder="Código de la infracción" />
                                        </div>
                                        <div className="form-group">
                                            <label>Referencia</label>
                                            <input type="text" name="referencia" value={searchParameters?.referencia || ''} onChange={handleInputChange} maxLength="100" placeholder="Referencia de la infracción" />
                                        </div>
                                        <div className="form-group">
                                            <label>Código DAI</label>
                                            <input type="text" name="codigoDai" value={searchParameters?.codigoDai || ''} onChange={handleInputChange} maxLength="70" placeholder="Código DAI" />
                                        </div>
                                        <div className="form-group">
                                            <label>Caso</label>
                                            <DebounceDropdown endpoint='Caso' optionLabel='numeroCasoInfraccion' showClear={true} setter={setSelectedCaso} selectedObject={selectedCaso} filterBy="numeroCasoInfraccion" />
                                        </div>
                                        <div className="form-group">
                                            <label>Tipo de infracción</label>
                                            <div>
                                                {
                                                    errorTI || !tiposInfracciones ? (
                                                        <div className="dropdown-error">
                                                            <div className="dropdown-error-msg">
                                                                {isLoadingTI || (isRefreshing && isValidatingTI) ?
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
                                                            value={selectedTipoInfraccion}
                                                            onChange={(e) => setSelectedTipoInfraccion(e.value)}
                                                            options={tiposInfracciones}
                                                            optionLabel="nombre"
                                                            placeholder="Selecciona un tipo de infracción"
                                                            filter
                                                            virtualScrollerOptions={{ itemSize: 38 }}
                                                            valueTemplate={selectedValueTemplate}
                                                            itemTemplate={optionTemplate}
                                                        />
                                                    )
                                                }
                                            </div>
                                        </div>
                                        <div className="form-group">
                                            <label>Estado</label>
                                            <div>
                                                {
                                                    errorE || !estadosOptions ? (
                                                        <div className="dropdown-error">
                                                            <div className="dropdown-error-msg">
                                                                {isLoadingE || (isRefreshing && isValidatingE) ?
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
                                                            style={{ width: '100%', maxWidth: '588px' }}
                                                            value={selectedEstado}
                                                            onChange={(e) => setSelectedEstado(e.value)}
                                                            options={estadosOptions}
                                                            optionLabel="nombre"
                                                            placeholder="Selecciona un estado"
                                                            filter
                                                            filterBy="codigo,descripcionEspanol,descripcionIngles"
                                                            virtualScrollerOptions={{ itemSize: 38 }}
                                                            valueTemplate={selectedValueTemplateE}
                                                            itemTemplate={optionTemplateE}
                                                        />
                                                    )
                                                }
                                            </div>
                                        </div>
                                    </div>
                                </section>
                                <section>
                                    <div className="form-group-label">
                                        <i className="pi pi-verified"></i>
                                        <label>Marca</label>
                                    </div>
                                    <div className="form-body-group">
                                        <div className="form-group form-group-single">
                                            <label>Marca</label>
                                            <DebounceDropdown endpoint='Marcas' optionLabel='signo' showClear={true} setter={setSelectedMarca} selectedObject={selectedMarca} filterBy="marcaId,signo" />
                                        </div>
                                        <div className="form-group form-group-double">
                                            <label>Clase marca</label>
                                            <div>
                                                {
                                                    errorC || !clases ? (
                                                        <div className="dropdown-error">
                                                            <div className="dropdown-error-msg">
                                                                {isLoadingC || (isRefreshing && isValidatingC) ?
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
                                                            value={selectedClaseMarca}
                                                            onChange={(e) => setSelectedClaseMarca(e.value)}
                                                            options={clases}
                                                            optionLabel="nombre"
                                                            placeholder="Selecciona una clase"
                                                            filter
                                                            filterBy="codigo,descripcionEspanol,descripcionIngles"
                                                            virtualScrollerOptions={{ itemSize: 38 }}
                                                            valueTemplate={selectedValueTemplateC}
                                                            itemTemplate={optionTemplateC}
                                                        />
                                                    )
                                                }
                                            </div>
                                        </div>
                                        <div className="form-group form-group-double">
                                            <label>País marca</label>
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
                                                            value={selectedPaisMarca}
                                                            onChange={(e) => setSelectedPaisMarca(e.value)}
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
                                <section>
                                    <div className="form-group-label">
                                        <i className="pi pi-ban"></i>
                                        <label>Infractor</label>
                                    </div>
                                    <div className="form-body-group">
                                        <div className="form-group form-group-single">
                                            <label>Infractor</label>
                                            <input type="text" name="infractor" value={searchParameters?.infractor || ''} onChange={handleInputChange} maxLength="70" placeholder="Infractor" />
                                        </div>
                                        <div className="form-group">
                                            <label>Clase infractor</label>
                                            <div>
                                                {
                                                    errorC || !clases ? (
                                                        <div className="dropdown-error">
                                                            <div className="dropdown-error-msg">
                                                                {isLoadingC || (isRefreshing && isValidatingC) ?
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
                                                            value={selectedClaseInfractor}
                                                            onChange={(e) => setSelectedClaseInfractor(e.value)}
                                                            options={clases}
                                                            optionLabel="nombre"
                                                            placeholder="Selecciona una clase"
                                                            filter
                                                            filterBy="codigo,descripcionEspanol,descripcionIngles"
                                                            virtualScrollerOptions={{ itemSize: 38 }}
                                                            valueTemplate={selectedValueTemplateC}
                                                            itemTemplate={optionTemplateC}
                                                        />
                                                    )
                                                }
                                            </div>
                                        </div>
                                        <div className="form-group">
                                            <label>País infractor</label>
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
                                                            value={selectedPaisInfractor}
                                                            onChange={(e) => setSelectedPaisInfractor(e.value)}
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
                            </div>
                        </TabPanel>
                        <TabPanel header="Involucrados" leftIcon="pi pi-users mr-2">
                            <form className="form-body">
                                <section>
                                    <div className="form-group-label">
                                        <i className="pi pi-briefcase"></i>
                                        <label>Involucrados</label>
                                    </div>
                                    <div className="form-body-group">
                                        <div className="form-group">
                                            <label>Autoridad</label>
                                            <DebounceDropdown endpoint='Autoridades' optionLabel='nombre' showClear={true} setter={setSelectedAutoridad} selectedObject={selectedAutoridad} filterBy="autoridadId,nombre" />
                                        </div>
                                        <div className="form-group">
                                            <label>Oficina Tramitante</label>
                                            <DebounceDropdown endpoint='Clientes' optionLabel='nombre' showClear={true} setter={setSelectedOficinaTramitante} selectedObject={selectedOficinaTramitante} filterBy="clienteId,nombre" />
                                        </div>
                                    </div>
                                </section>
                                <section>
                                    <div className="form-group-label">
                                        <i className="pi pi-id-card"></i>
                                        <label>Abogados</label>
                                    </div>
                                    <div className="form-body-group">
                                        <div className="form-group">
                                            <label>Abogado</label>
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
                                                            placeholder="Selecciona un abogado"
                                                            filter
                                                            virtualScrollerOptions={{ itemSize: 38 }}
                                                            valueTemplate={selectedValueTemplateA}
                                                            itemTemplate={optionTemplateA}
                                                        />
                                                    )
                                                }
                                            </div>
                                        </div>
                                    </div>
                                </section>
                            </form>
                        </TabPanel>
                        <TabPanel header="Extra" leftIcon="pi pi-plus-circle mr-2">
                            <form className="form-body">
                                <section>
                                    <div className="form-group-label">
                                        <i className="pi pi-plus-circle"></i>
                                        <label>Extra</label>
                                    </div>
                                    <div className="form-body-group">
                                        <div className="form-group form-group-double">
                                            <label>Número de proceso</label>
                                            <input type="text" name="numeroProceso" value={searchParameters?.numeroProceso || ''} onChange={handleInputChange} maxLength="70" placeholder="Número de proceso" />
                                        </div>
                                        <div className="form-group form-group-double">
                                            <label>Número de proceso judicial</label>
                                            <input type="text" name="numeroProcesoJudicial" value={searchParameters?.numeroProcesoJudicial || ''} onChange={handleInputChange} maxLength="70" placeholder="Número de proceso judicial" />
                                        </div>
                                        <div className="form-group form-group-double">
                                            <label>Fecha de registro (Desde)</label>
                                            <input type="date" name="fechaRegistroDesde" value={searchParameters?.fechaRegistroDesde || ''} onChange={handleInputChange} />
                                        </div>
                                        <div className="form-group form-group-double">
                                            <label>Fecha de registro (Hasta)</label>
                                            <input type="date" name="fechaRegistroHasta" value={searchParameters?.fechaRegistroHasta || ''} onChange={handleInputChange} />
                                        </div>
                                    </div>
                                </section>
                            </form>
                        </TabPanel>
                    </TabView>
                    <div className="form-info-msg">
                        <i className="pi pi-exclamation-circle" style={{ fontSize: '0.8rem', margin: '0', color: 'var(--secondary-blue)', fontWeight: '600' }}></i>
                        <span>Si no selecciona ningún campo, se buscarán todos los registros y esto puede tardar más tiempo</span>
                    </div>
                    <div className="center-hr">
                        <hr />
                    </div>
                    <section className="form-footer">
                        <div style={{display:'flex', gap: '10px'}}>
                            <button className="form-cancel-btn" onClick={handleCancel}>Cancelar</button>
                            <button className="form-cancel-btn" onClick={resetStates}>Limpiar campos</button>
                        </div>
                        <button type="submit" className="form-accept-btn" onClick={handleSearch}>Buscar</button>
                    </section>
                </div>
            </Draggable>
            <Toast ref={toast} />
        </>
    );
}

export default InfraccionesSearch;