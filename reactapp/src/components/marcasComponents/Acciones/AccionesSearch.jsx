import React, { useState, useRef, useEffect } from 'react';
import Draggable from 'react-draggable';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { Dropdown } from 'primereact/dropdown';
import { TabView, TabPanel } from 'primereact/tabview';
import DebounceDropdown from '../../miscComponents/Dropdown/DebounceDropdown';

// Redux
import { saveData, deleteData } from '../../../context/accionSlice'; // EDITABLE
import { useSelector, useDispatch } from 'react-redux';

// Servicios para dropdowns normales
import { usePaises } from '../../../services/usePais'; 
import { useAbogados } from '../../../services/useAbogados'; 
import { useTipoAccion } from '../../../services/useTipoAccion';
import { useClases } from '../../../services/useClases'; 
import { useEstados } from '../../../services/useEstados'; 
import { useGacetas } from '../../../services/useGacetas'; 

function AccionesSearch({ onClose, onSearch }) { //EDITABLE

    // --------------- Redux store settings -------------------------------------------------------

    const dispatch = useDispatch();
    const accionSearchData = useSelector(state => state.accion.AccionSearch); // EDITABLE

    // --------------- Setup (Servicios, Contextos, Referencias) -----------------------------------

    const isClosingRef = useRef(false); // Referencia para eliminar persistencia: EDITABLE
    const toast = useRef(null); // Referencia para el toast: GENERAL

    const { paises, error: errorP, isLoading: isLoadingP, isValidating: isValidatingP, refresh: refreshP } = usePaises(); // EDITABLE
    const { abogados, error: errorA, isLoading: isLoadingA, isValidating: isValidatingA, refresh: refreshA } = useAbogados(); // EDITABLE
    const { estados: estadosOptions, error: errorE, isLoading: isLoadingE, isValidating: isValidatingE, refresh: refreshE } = useEstados(); // Para el dropdown de estados
    const { clases, error: errorC, isLoading: isLoadingC, isValidating: isValidatingC, refresh: refreshC } = useClases(); // Para el dropdown de clases
    const { gacetas, error: errorG, isLoading: isLoadingG, isValidating: isValidatingG, refresh: refreshG } = useGacetas(); 
    const { tiposAcciones, error: errorTA, isLoading: isLoadingTA, isValidating: isValidatingTA, refresh: refreshTA } = useTipoAccion();

    // --------------- Estados que no requieren persistencia -----------------------------------------

    const [isRefreshing, setIsRefreshing] = useState(false);

    // --------------- Estados que requieren persistencia --------------------------------------------

    const [searchParameters, setSearchParameters] = useState(null); // mapea los parámetros de búsqueda

    // Dropdowns normales
    const [selectedEstado, setSelectedEstado] = useState(null); 
    const [selectedTipoAccion, setSelectedTipoAccion] = useState(null); 
    const [selectedAbogado, setSelectedAbogado] = useState(null); 
    const [selectedClaseBase, setSelectedClaseBase] = useState(null);
    const [selectedPaisBase, setSelectedPaisBase] = useState(null);
    const [selectedClaseOpuesta, setSelectedClaseOpuesta] = useState(null);
    const [selectedPaisOpuesta, setSelectedPaisOpuesta] = useState(null);
    const [selectedGaceta, setSelectedGaceta] = useState(null);

    // Debounced dropdowns
    const [selectedOficinaTramitante, setSelectedOficinaTramitante] = useState(null); 
    const [selectedMarcaBase, setSelectedMarcaBase] = useState(null);
    const [selectedPropietarioBase, setSelectedPropietarioBase] = useState(null);
    const [selectedCliente, setSelectedCliente] = useState(null);

    // --------------- Funciones necesarias para persistencia ----------------------------------------

    useEffect(() => {
        if (accionSearchData) { // EDITABLE
            setSearchParameters(accionSearchData.searchParameters || null); // EDITABLE

            setSelectedEstado(accionSearchData.selectedEstado || null);
            setSelectedTipoAccion(accionSearchData.selectedTipoAccion || null);
            setSelectedAbogado(accionSearchData.selectedAbogado || null);
            setSelectedClaseBase(accionSearchData.selectedClaseBase || null);

            setSelectedPaisBase(accionSearchData.selectedPaisBase || null);
            setSelectedClaseOpuesta(accionSearchData.selectedClaseOpuesta || null);
            setSelectedPaisOpuesta(accionSearchData.selectedPaisOpuesta || null);
            setSelectedGaceta(accionSearchData.selectedGaceta || null);
            setSelectedOficinaTramitante(accionSearchData.selectedOficinaTramitante || null);
            setSelectedMarcaBase(accionSearchData.selectedMarcaBase || null);
            setSelectedPropietarioBase(accionSearchData.selectedPropietarioBase || null);
            setSelectedCliente(accionSearchData.selectedCliente || null);
        }
    }, []); // Se ejecuta cuando el componente renderiza, lee los datos guardados: GENERAL
    const saveState = () => {
        dispatch(saveData({
            objectName: 'AccionSearch', value: {
                searchParameters,
                selectedEstado,
                selectedTipoAccion,
                selectedAbogado,
                selectedClaseBase,
                selectedPaisBase,
                selectedClaseOpuesta,
                selectedPaisOpuesta,
                selectedGaceta,
                selectedOficinaTramitante,
                selectedMarcaBase,
                selectedPropietarioBase,
                selectedCliente,
            }
        })); // EDITABLE
    }; // Guarda en el contexto los estados como objetos: ESPECIFICO
    useEffect(() => {
        return () => {
            if (!isClosingRef.current) {
                saveState();
            }
        };
    }, [searchParameters,
        selectedEstado,
        selectedTipoAccion,
        selectedAbogado,
        selectedClaseBase,
        selectedPaisBase,
        selectedClaseOpuesta,
        selectedPaisOpuesta,
        selectedGaceta,
        selectedOficinaTramitante,
        selectedMarcaBase,
        selectedPropietarioBase,
        selectedCliente]); // Se ejecuta con cada cambio de estado.
    const deletePersistedStates = () => {
        dispatch(deleteData({ objectName: 'AccionSearch' })); // EDITABLE
    }; // Elimina los datos en el objeto del contexto: ESPECIFICO

    // --------------- Funciones especificas del componente ------------------------------------------

    const resetStates = () => {
        setSearchParameters(null); // EDITABLE
        setSelectedEstado(null);
        setSelectedTipoAccion(null);
        setSelectedAbogado(null);
        setSelectedClaseBase(null);
        setSelectedPaisBase(null);
        setSelectedClaseOpuesta(null);
        setSelectedPaisOpuesta(null);

        setSelectedGaceta(null);
        setSelectedOficinaTramitante(null);
        setSelectedMarcaBase(null);
        setSelectedPropietarioBase(null);
        setSelectedCliente(null);
    } // Resetea los estados del componente: ESPECIFICO


    // --------------- DROPDOWNS ---------------------------------------------------------------------
    const refreshData = (e) => {
        e.preventDefault();
        setIsRefreshing(true);
        refreshP();
        refreshA();
        refreshE();
        refreshC();
        refreshG();
        refreshTA();
    }; // Refresca los datos de los DROPDOWNs
    useEffect(() => {
        if (isRefreshing) {
            setIsRefreshing(false);
        }
    }, [isValidatingP, isValidatingA, isValidatingE, isValidatingC, isValidatingG, isValidatingTA]); // Cambia el estado de refreshing de los DROPDOWNs

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

    // Tipo Accion
    useEffect(() => {
        setSearchParameters(prevSP => {
            const newSP = { ...prevSP };

            if (selectedTipoAccion) {
                newSP.TipoAccionId = selectedTipoAccion.tipoAccionId;
            } else if (newSP.TipoAccionId !== undefined) {
                delete newSP.TipoAccionId;
            }
            return newSP;
        });
    }, [selectedTipoAccion]);

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

    // Clase Base
    useEffect(() => {
        setSearchParameters(prevSP => {
            const newSP = { ...prevSP };

            if (selectedClaseBase) {
                newSP.claseBaseId = selectedClaseBase.codigo;
            } else if (newSP.claseBaseId !== undefined) {
                delete newSP.claseBaseId;
            }
            return newSP;
        });
    }, [selectedClaseBase]);

    // Clase Opuesta
    useEffect(() => {
        setSearchParameters(prevSP => {
            const newSP = { ...prevSP };

            if (selectedClaseOpuesta) {
                newSP.claseOpuestaId = selectedClaseOpuesta.codigo;
            } else if (newSP.claseOpuestaId !== undefined) {
                delete newSP.claseOpuestaId;
            }
            return newSP;
        });
    }, [selectedClaseOpuesta]);

    // País Base
    useEffect(() => {
        setSearchParameters(prevSP => {
            const newSP = { ...prevSP };

            if (selectedPaisBase) {
                newSP.codigoPaisBase = selectedPaisBase.codigoPais;
            } else if (newSP.codigoPaisBase !== undefined) {
                delete newSP.codigoPaisBase;
            }
            return newSP;
        });
    }, [selectedPaisBase]);

    // País Opuesta
    useEffect(() => {
        setSearchParameters(prevSP => {
            const newSP = { ...prevSP };

            if (selectedPaisOpuesta) {
                newSP.codigoPaisOpuesta = selectedPaisOpuesta.codigoPais;
            } else if (newSP.codigoPaisOpuesta !== undefined) {
                delete newSP.codigoPaisOpuesta;
            }
            return newSP;
        });
    }, [selectedPaisOpuesta]);

    // Gaceta
    useEffect(() => {
        setSearchParameters(prevSP => {
            const newSP = { ...prevSP };

            if (selectedGaceta) {
                newSP.gaceta = selectedGaceta.numero;
            } else if (newSP.gaceta !== undefined) {
                delete newSP.gaceta;
            }
            return newSP;
        });
    }, [selectedGaceta]);

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

    // Marca Base
    useEffect(() => {
        setSearchParameters(prevSP => {
            const newSP = { ...prevSP };

            if (selectedMarcaBase) {
                newSP.marcaBaseId = selectedMarcaBase.marcaId;
            } else if (newSP.marcaBaseId !== undefined) {
                delete newSP.marcaBaseId;
            }
            return newSP;
        });
    }, [selectedMarcaBase]);

    // Propietario Base
    useEffect(() => {
        setSearchParameters(prevSP => {
            const newSP = { ...prevSP };

            if (selectedPropietarioBase) {
                newSP.porpietarioBase = selectedPropietarioBase.propietarioId;
            } else if (newSP.porpietarioBase !== undefined) {
                delete newSP.porpietarioBase;
            }
            return newSP;
        });
    }, [selectedPropietarioBase]);

    // Cliente
    useEffect(() => {
        setSearchParameters(prevSP => {
            const newSP = { ...prevSP };

            if (selectedCliente) {
                newSP.cliente = selectedCliente.clienteId;
            } else if (newSP.cliente !== undefined) {
                delete newSP.cliente;
            }
            return newSP;
        });
    }, [selectedCliente]);

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

    const optionTemplateG = (option) => {
        return (
            <div className="dropdown-item-container">
                <span><strong>Gaceta N°</strong> {option.numero}</span>
            </div>
        );
    }; // EDITABLE: template para mostrar las opciones de un dropdown

    const selectedValueTemplateG = (option, props) => {
        if (option) {
            return (
                <div className="dropdown-item-container">
                    <span><strong>Gaceta N°</strong> {option.numero}</span>
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
            { from: searchParameters?.fechaGacetaDesde, to: searchParameters?.fechaGacetaHasta, name: "Gaceta" },
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
                        <span>Buscar acciones a terceros</span> 
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
                        <TabPanel header="Acción a terceros" leftIcon="pi pi-inbox mr-2">
                            <div className="form-body">
                                <section>
                                    <div className="form-group-label">
                                        <i className="pi pi-verified"></i>
                                        <label>Acción a terceros</label>
                                    </div>
                                    <div className="form-body-group">
                                        <div className="form-group">
                                            <label>Código</label>
                                            <input type="number" name="accionId" value={searchParameters?.accionId || ''} onChange={handleInputChange} maxLength="8" placeholder="Código de la acción" />
                                        </div>
                                        <div className="form-group">
                                            <label>Tipo de acción</label>
                                            <div>
                                                {
                                                    errorTA || !tiposAcciones ? (
                                                        <div className="dropdown-error">
                                                            <div className="dropdown-error-msg">
                                                                {isLoadingTA || (isRefreshing && isValidatingTA) ?
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
                                                            value={selectedTipoAccion}
                                                            onChange={(e) => setSelectedTipoAccion(e.value)}
                                                            options={tiposAcciones}
                                                            optionLabel="nombre"
                                                            placeholder="Selecciona un tipo de acción"
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
                                            <label>Referencia</label>
                                            <input type="text" name="referencia" value={searchParameters?.referencia || ''} onChange={handleInputChange} maxLength="100" placeholder="Referencia de la acción" />
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
                                                            style={{ width: '100%'}}
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
                                        <i className="pi pi-users"></i>
                                        <label>Involucrados</label>
                                    </div>
                                    <div className="form-body-group">
                                        <div className="form-group">
                                            <label>Cliente</label>
                                            <DebounceDropdown endpoint='Clientes' optionLabel='nombre' showClear={true} setter={setSelectedCliente} selectedObject={selectedCliente} filterBy="clienteId,nombre" />
                                        </div>
                                        <div className="form-group">
                                            <label>Oficina Tramitante</label>
                                            <DebounceDropdown endpoint='Clientes' optionLabel='nombre' showClear={true} setter={setSelectedOficinaTramitante} selectedObject={selectedOficinaTramitante} filterBy="clienteId,nombre" />
                                        </div>
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
                            </div>
                        </TabPanel>
                        <TabPanel header="Marcas base" leftIcon="pi pi-verified mr-2">
                            <div className="form-body">
                                <section>
                                    <div className="form-group-label">
                                        <i className="pi pi-info-circle"></i>
                                        <label>Información de la marca base</label>
                                    </div>
                                    <div className="form-body-group">
                                        <div className="form-group form-group-double">
                                            <label>Marca</label>
                                            <DebounceDropdown endpoint='Marcas' optionLabel='signo' showClear={true} setter={setSelectedMarcaBase} selectedObject={selectedMarcaBase} filterBy="marcaId,signo" />
                                        </div>
                                        <div className="form-group form-group-double">
                                            <label>Clase</label>
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
                                                            value={selectedClaseBase}
                                                            onChange={(e) => setSelectedClaseBase(e.value)}
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
                                                            value={selectedPaisBase}
                                                            onChange={(e) => setSelectedPaisBase(e.value)}
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
                                        <div className="form-group form-group-double">
                                            <label>Solicitud</label>
                                            <input type="text" name="solicitudBase" value={searchParameters?.solicitudBase || ''} onChange={handleInputChange} maxLength="70" placeholder="Solicitud" />
                                        </div>
                                        <div className="form-group form-group-double">
                                            <label>Registro</label>
                                            <input type="text" name="registroBase" value={searchParameters?.registroBase || ''} onChange={handleInputChange} maxLength="70" placeholder="Registro" />
                                        </div>
                                        <div className="form-group form-group-double">
                                            <label>Propietario</label>
                                            <DebounceDropdown endpoint='Propietarios' optionLabel='nombre' showClear={true} setter={setSelectedPropietarioBase} selectedObject={selectedPropietarioBase} filterBy="propietarioId,nombre" />
                                        </div>
                                    </div>
                                </section>
                            </div>
                        </TabPanel>
                        <TabPanel header="Marca opuesta" leftIcon="pi pi-sync mr-2">
                            <div className="form-body">
                                <section>
                                    <div className="form-group-label">
                                        <i className="pi pi-info-circle"></i>
                                        <label>Información de la marca opuesta</label>
                                    </div>
                                    <div className="form-body-group">
                                        <div className="form-group form-group-double">
                                            <label>Marca</label>
                                            <input type="text" name="marcaOpuesta" value={searchParameters?.marcaOpuesta || ''} onChange={handleInputChange} maxLength="70" placeholder="Denominación" />
                                        </div>
                                        <div className="form-group form-group-double">
                                            <label>Clase</label>
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
                                                            value={selectedClaseOpuesta}
                                                            onChange={(e) => setSelectedClaseOpuesta(e.value)}
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
                                                            value={selectedPaisOpuesta}
                                                            onChange={(e) => setSelectedPaisOpuesta(e.value)}
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
                                        <div className="form-group form-group-double">
                                            <label>Solicitud</label>
                                            <input type="text" name="solicitudOpuesta" value={searchParameters?.solicitudOpuesta || ''} onChange={handleInputChange} maxLength="70" placeholder="Solicitud" />
                                        </div>
                                        <div className="form-group form-group-double">
                                            <label>Registro</label>
                                            <input type="text" name="registroOpuesta" value={searchParameters?.registroOpuesta || ''} onChange={handleInputChange} maxLength="70" placeholder="Registro" />
                                        </div>
                                        <div className="form-group form-group-double">
                                            <label>Propietario</label>
                                            <input type="text" name="porpietarioOpuesta" value={searchParameters?.porpietarioOpuesta || ''} onChange={handleInputChange} maxLength="70" placeholder="Registro" />
                                        </div>
                                        <div className="form-group">
                                            <label>Agente</label>
                                            <input type="text" name="agente" value={searchParameters?.agente || ''} onChange={handleInputChange} maxLength="70" placeholder="Agente" />
                                        </div>
                                    </div>
                                </section>
                                <section>
                                    <div className="form-group-label">
                                        <i className="pi pi-book"></i>
                                        <label>Gaceta</label>
                                    </div>
                                    <div className="form-body-group">
                                        <div className="form-group">
                                            <label>Gaceta</label>
                                            <div>
                                                {
                                                    errorG || !gacetas ? (
                                                        <div className="dropdown-error">
                                                            <div className="dropdown-error-msg">
                                                                {isLoadingG || (isRefreshing && isValidatingG) ?
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
                                                            value={selectedGaceta}
                                                            onChange={(e) => setSelectedGaceta(e.value)}
                                                            options={gacetas}
                                                            optionLabel="nombre"
                                                            placeholder="Selecciona una gaceta"
                                                            filter
                                                            filterBy="numero"
                                                            virtualScrollerOptions={{ itemSize: 38 }}
                                                            valueTemplate={selectedValueTemplateG}
                                                            itemTemplate={optionTemplateG}
                                                        />
                                                    )
                                                }
                                            </div>
                                        </div>
                                        <div className="form-group">
                                            <label>Fecha de gaceta (Desde)</label>
                                            <input type="date" name="fechaGacetaDesde" value={searchParameters?.fechaGacetaDesde || ''} onChange={handleInputChange} />
                                        </div>
                                        <div className="form-group">
                                            <label>Fecha de gaceta (Hasta)</label>
                                            <input type="date" name="fechaGacetaHasta" value={searchParameters?.fechaGacetaHasta || ''} onChange={handleInputChange} />
                                        </div>
                                    </div>
                                </section>
                            </div>
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

export default AccionesSearch;