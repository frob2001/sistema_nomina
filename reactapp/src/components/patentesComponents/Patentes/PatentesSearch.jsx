import React, { useState, useRef, useEffect } from 'react';
import Draggable from 'react-draggable';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { Dropdown } from 'primereact/dropdown';
import { TabView, TabPanel } from 'primereact/tabview';
import DebounceDropdown from '../../miscComponents/Dropdown/DebounceDropdown';

// Redux
import { saveData, deleteData } from '../../../context/patenteSlice'; // EDITABLE
import { useSelector, useDispatch } from 'react-redux';

// Servicios para dropdowns normales
import { useTipoPatente } from '../../../services/useTipoPatente';
import { usePaises } from '../../../services/usePais';
import { useAbogados } from '../../../services/useAbogados';
import { useEstados } from '../../../services/useEstados';
import { useTipoPublicacion } from '../../../services/useTipoPublicacion';
import { useGacetas } from '../../../services/useGacetas';

function PatentesSearch({ onClose, onSearch }) { //EDITABLE

    // --------------- Redux store settings -------------------------------------------------------

    const dispatch = useDispatch();
    const patenteSearchData = useSelector(state => state.patente.PatenteSearch); // EDITABLE

    // --------------- Setup (Servicios, Contextos, Referencias) -----------------------------------

    const isClosingRef = useRef(false); // Referencia para eliminar persistencia: EDITABLE
    const toast = useRef(null); // Referencia para el toast: GENERAL
    const { paises, error: errorP, isLoading: isLoadingP, isValidating: isValidatingP, refresh: refreshP } = usePaises(); // EDITABLE
    const { abogados, error: errorA, isLoading: isLoadingA, isValidating: isValidatingA, refresh: refreshA } = useAbogados(); // EDITABLE
    const { tiposPatentes, error: errorTP, isLoading: isLoadingTP, isValidating: isValidatingTP, refresh: refreshTP } = useTipoPatente(); // EDITABLE
    const { estados: estadosOptions, error: errorE, isLoading: isLoadingE, isValidating: isValidatingE, refresh: refreshE } = useEstados(); // Para el dropdown de estados
    const { tiposPublicaciones, error: errorTPb, isLoading: isLoadingTPb, isValidating: isValidatingTPb, refresh: refreshTPb } = useTipoPublicacion(); // Para el dropdown de tipos de publicaciones
    const { gacetas, error: errorG, isLoading: isLoadingG, isValidating: isValidatingG, refresh: refreshG } = useGacetas(); // Para el dropdown de tipos de publicaciones

    // --------------- Estados que no requieren persistencia -----------------------------------------

    const [isRefreshing, setIsRefreshing] = useState(false);
    const opcionesPagoAnualidad = [
        { booleanValue: 'true', nombre: 'Sí' },
        { booleanValue: 'false', nombre: 'No' },
    ]

    // --------------- Estados que requieren persistencia --------------------------------------------

    const [searchParameters, setSearchParameters] = useState(null); // mapea los parámetros de búsqueda

    // Dropdowns normales
    const [selectedTipoPatente, setSelectedTipoPatente] = useState(null); 
    const [selectedPais, setSelectedPais] = useState(null); 
    const [selectedAbogado, setSelectedAbogado] = useState(null); 
    const [selectedEstado, setSelectedEstado] = useState(null); 
    const [selectedTipoPublicacion, setSelectedTipoPublicacion] = useState(null);
    const [selectedGaceta, setSelectedGaceta] = useState(null); 

    // Debounced dropdowns
    const [selectedCliente, setSelectedCliente] = useState(null); 
    const [selectedOficinaTramitante, setSelectedOficinaTramitante] = useState(null); 

    // Dropdown de booleanos
    const [selectedPagoAnualidad, setSelectedPagoAnualidad] = useState(null); // saber el general seleccionado: ESPECIFICO

    // --------------- Funciones necesarias para persistencia ----------------------------------------

    useEffect(() => {
        if (patenteSearchData) { // EDITABLE
            setSearchParameters(patenteSearchData.searchParameters || null); // EDITABLE

            setSelectedTipoPatente(patenteSearchData.selectedTipoPatente || null);
            setSelectedPais(patenteSearchData.selectedPais || null);
            setSelectedAbogado(patenteSearchData.selectedAbogado || null);
            setSelectedEstado(patenteSearchData.selectedEstado || null);
            setSelectedCliente(patenteSearchData.selectedCliente || null);
            setSelectedOficinaTramitante(patenteSearchData.selectedOficinaTramitante || null);
            setSelectedTipoPublicacion(patenteSearchData.selectedTipoPublicacion || null);
            setSelectedGaceta(patenteSearchData.selectedGaceta || null);

            setSelectedPagoAnualidad(patenteSearchData.selectedPagoAnualidad || null);
        }
    }, []); // Se ejecuta cuando el componente renderiza, lee los datos guardados: GENERAL
    const saveState = () => {
        dispatch(saveData({ objectName: 'PatenteSearch', value: { searchParameters, selectedEstado, selectedTipoPatente, selectedPais, selectedAbogado, selectedCliente, selectedOficinaTramitante, selectedPagoAnualidad, selectedTipoPublicacion, selectedGaceta } })); // EDITABLE
    }; // Guarda en el contexto los estados como objetos: ESPECIFICO
    useEffect(() => {
        return () => {
            if (!isClosingRef.current) {
                saveState();
            }
        };
    }, [searchParameters, selectedEstado, selectedTipoPatente, selectedPais, selectedAbogado, selectedCliente, selectedOficinaTramitante, selectedPagoAnualidad, selectedTipoPublicacion, selectedGaceta]); // Se ejecuta con cada cambio de estado.
    const deletePersistedStates = () => {
        dispatch(deleteData({ objectName: 'PatenteSearch' })); // EDITABLE
    }; // Elimina los datos en el objeto del contexto: ESPECIFICO

    // --------------- Funciones especificas del componente ------------------------------------------

    const resetStates = () => {
        setSearchParameters(null); // EDITABLE
        setSelectedAbogado(null);
        setSelectedTipoPatente(null);
        setSelectedPais(null);
        setSelectedOficinaTramitante(null);
        setSelectedCliente(null);
        setSelectedPagoAnualidad(null);
        setSelectedEstado(null);
        setSelectedTipoPublicacion(null);
        setSelectedGaceta(null);
    } // Resetea los estados del componente: ESPECIFICO


    // --------------- DROPDOWNS ---------------------------------------------------------------------
    const refreshData = (e) => {
        e.preventDefault();
        setIsRefreshing(true);
        refreshP();
        refreshA();
        refreshTP();
        refreshE();
        refreshTPb();
        refreshG();
    }; // Refresca los datos de los DROPDOWNs
    useEffect(() => {
        if (isRefreshing) {
            setIsRefreshing(false);
        }
    }, [isValidatingP, isValidatingA, isValidatingTP, isValidatingE, isValidatingTPb, isValidatingG]); // Cambia el estado de refreshing de los DROPDOWNs

    useEffect(() => {
        setSearchParameters(prevSP => {
            const newSP = { ...prevSP };

            if (selectedTipoPatente) {
                newSP.tipoPatenteId = selectedTipoPatente.tipoPatenteId;
            } else if (newSP.tipoPatenteId !== undefined) {
                delete newSP.tipoPatenteId;
            }
            return newSP;
        });
    }, [selectedTipoPatente]);

    useEffect(() => {
        setSearchParameters(prevSP => {
            const newSP = { ...prevSP };

            if (selectedPais) {
                newSP.codigoPais = selectedPais.codigoPais;
            } else if (newSP.codigoPais !== undefined) {
                delete newSP.codigoPais;
            }
            return newSP;
        });
    }, [selectedPais]);

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

    useEffect(() => {
        setSearchParameters(prevSP => {
            const newSP = { ...prevSP };

            if (selectedPagoAnualidad) {
                newSP.pagoAnualidad = selectedPagoAnualidad.booleanValue;
            } else if (newSP.pagoAnualidad !== undefined) {
                delete newSP.pagoAnualidad;
            }
            return newSP;
        });
    }, [selectedPagoAnualidad]);

    useEffect(() => {
        setSearchParameters(prevSP => {
            const newSP = { ...prevSP };

            if (selectedCliente) {
                newSP.clienteId = selectedCliente.clienteId;
            } else if (newSP.clienteId !== undefined) {
                delete newSP.clienteId;
            }
            return newSP;
        });
    }, [selectedCliente]);

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

    // Tipo de publicación
    useEffect(() => {
        setSearchParameters(prevSP => {
            const newSP = { ...prevSP };

            if (selectedTipoPublicacion) {
                newSP.tipoPublicacionId = selectedTipoPublicacion.tipoPublicacionId;
            } else if (newSP.tipoPublicacionId !== undefined) {
                delete newSP.tipoPublicacionId;
            }
            return newSP;
        });
    }, [selectedTipoPublicacion]);

    // Gaceta
    useEffect(() => {
        setSearchParameters(prevSP => {
            const newSP = { ...prevSP };

            if (selectedGaceta) {
                newSP.numeroGaceta = selectedGaceta.numero;
            } else if (newSP.numeroGaceta !== undefined) {
                delete newSP.numeroGaceta;
            }
            return newSP;
        });
    }, [selectedGaceta]);


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
            { from: searchParameters?.fechaRegistroDesde, to: searchParameters?.fechaRegistroHasta, name: "Registro" },
            { from: searchParameters?.fechaPublicacionSolicitudDesde, to: searchParameters?.fechaPublicacionSolicitudHasta, name: "Solicitud" },
            { from: searchParameters?.vencimientoDesde, to: searchParameters?.vencimientoHasta, name: "Certificado" },
            { from: searchParameters?.fechaPctSolicitudDesde, to: searchParameters?.fechaPctSolicitudHasta, name: "PCT Solicitud" },
            { from: searchParameters?.fechaPctPublicacionDesde, to: searchParameters?.fechaPctPublicacionHasta, name: "PCT Publicación" },
            { from: searchParameters?.pagoAnualidadDesde, to: searchParameters?.pagoAnualidadHasta, name: "Pago anualidad" },
            { from: searchParameters?.fechaPublicacionDesde, to: searchParameters?.fechaPublicacionHasta, name: "Publicación" },
            { from: searchParameters?.fechaPrioridadDesde, to: searchParameters?.fechaPrioridadHasta, name: "Prioridad" },
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
                        <span>Buscar patentes</span> 
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
                        <TabPanel header="Patente" leftIcon="pi pi-shield mr-2">
                            <form className="form-body">
                                <section>
                                    <div className="form-group-label">
                                        <i className="pi pi-shield"></i>
                                        <label>Patente</label>
                                    </div>
                                    <div className="form-body-group">
                                        <div className="form-group">
                                            <label>Código</label>
                                            <input type="number" name="patenteId" value={searchParameters?.patenteId || ''} onChange={handleInputChange} maxLength="8" placeholder="Código de la patente" />
                                        </div>
                                        <div className="form-group">
                                            <label>Referencia</label>
                                            <input type="text" name="referencia" value={searchParameters?.referencia || ''} onChange={handleInputChange} maxLength="100" placeholder="Referencia de la patente" />
                                        </div>
                                        <div className="form-group">
                                            <label>Tipo de patente</label>
                                            <div>
                                                {
                                                    errorTP || !tiposPatentes ? (
                                                        <div className="dropdown-error">
                                                            <div className="dropdown-error-msg">
                                                                {isLoadingTP || (isRefreshing && isValidatingTP) ?
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
                                                            value={selectedTipoPatente}
                                                            onChange={(e) => setSelectedTipoPatente(e.value)}
                                                            options={tiposPatentes}
                                                            optionLabel="nombre"
                                                            placeholder="Selecciona un tipo de patente"
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
                                            <label>Título (ES)</label>
                                            <input type="text" name="tituloEspanol" value={searchParameters?.tituloEspanol || ''} onChange={handleInputChange} maxLength="70" placeholder="Título en español" />
                                        </div>
                                        <div className="form-group">
                                            <label>Título (EN)</label>
                                            <input type="text" name="tituloIngles" value={searchParameters?.tituloIngles || ''} onChange={handleInputChange} maxLength="70" placeholder="Título en inglés" />
                                        </div>
                                        <div className="form-group">
                                            <label>Inventor</label>
                                            <input type="text" name="inventor" value={searchParameters?.inventor || ''} onChange={handleInputChange} maxLength="70" placeholder="Nombre del inventor" />
                                        </div>
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
                                        <i className="pi pi-calendar"></i>
                                        <label>Prioridad</label>
                                    </div>
                                    <div className="form-body-group">
                                        <div className="form-group">
                                            <label>Número</label>
                                            <input type="text" name="numeroPrioridad" value={searchParameters?.numeroPrioridad || ''} onChange={handleInputChange} maxLength="70" placeholder="Número de la prioridad" />
                                        </div>
                                        <div className="form-group">
                                            <label>Fecha de la prioridad (Desde)</label>
                                            <input type="date" name="fechaPrioridadDesde" value={searchParameters?.fechaPrioridadDesde || ''} onChange={handleInputChange} />
                                        </div>
                                        <div className="form-group">
                                            <label>Fecha de la prioridad (Hasta)</label>
                                            <input type="date" name="fechaPrioridadHasta" value={searchParameters?.fechaPrioridadHasta || ''} onChange={handleInputChange} />
                                        </div>
                                    </div>
                                </section>
                                <section>
                                    <div className="form-group-label">
                                        <i className="pi pi-book"></i>
                                        <label>Publicación</label>
                                    </div>
                                    <div className="form-body-group">
                                        <div className="form-group">
                                            <label>Tipo de publicación</label>
                                            <div>
                                                {
                                                    errorTPb || !tiposPublicaciones ? (
                                                        <div className="dropdown-error">
                                                            <div className="dropdown-error-msg">
                                                                {isLoadingTPb || (isRefreshing && isValidatingTPb) ?
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
                                                            value={selectedTipoPublicacion}
                                                            onChange={(e) => setSelectedTipoPublicacion(e.value)}
                                                            options={tiposPublicaciones}
                                                            optionLabel="nombre"
                                                            placeholder="Selecciona un tipo de publicación"
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
                                            <label>Número de gaceta</label>
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
                                                            optionLabel="numero"
                                                            placeholder="Selecciona una gaceta"
                                                            filter
                                                            virtualScrollerOptions={{ itemSize: 38 }}
                                                            valueTemplate={selectedValueTemplateG}
                                                            itemTemplate={optionTemplateG}
                                                        />
                                                    )
                                                }
                                            </div>
                                        </div>
                                        <div className="form-group form-group-double">
                                            <label>Fecha de la publicación (Desde)</label>
                                            <input type="date" name="fechaPublicacionDesde" value={searchParameters?.fechaPublicacionDesde || ''} onChange={handleInputChange} />
                                        </div>
                                        <div className="form-group form-group-double">
                                            <label>Fecha de la publicación (Hasta)</label>
                                            <input type="date" name="fechaPublicacionHasta" value={searchParameters?.fechaPublicacionHasta || ''} onChange={handleInputChange} />
                                        </div>
                                    </div>
                                </section>
                            </form>
                        </TabPanel>
                        <TabPanel header="Involucrados" leftIcon="pi pi-users mr-2">
                            <form className="form-body">
                                <section>
                                    <div className="form-group-label">
                                        <i className="pi pi-briefcase"></i>
                                        <label>Cliente</label>
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
                                            <label>Contacto</label>
                                            <input type="text" name="contacto" value={searchParameters?.contacto || ''} onChange={handleInputChange} maxLength="100" placeholder="Nombre del contacto" />
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
                                        <div className="form-group">
                                            <label>Abogado Internacional</label>
                                            <input type="text" name="abogadoInternacional" value={searchParameters?.abogadoInternacional || ''} onChange={handleInputChange} maxLength="100" placeholder="Nombre del abogado internacional" />
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

                                        <div className="form-group">
                                            <label>Solicitud</label>
                                            <input type="text" name="publicacion" value={searchParameters?.publicacion || ''} onChange={handleInputChange} maxLength="70" placeholder="Solicitud" />
                                        </div>
                                        <div className="form-group">
                                            <label>Fecha de solicitud (Desde)</label>
                                            <input type="date" name="fechaPublicacionSolicitudDesde" value={searchParameters?.fechaPublicacionSolicitudDesde || ''} onChange={handleInputChange} />
                                        </div>
                                        <div className="form-group">
                                            <label>Fecha de solicitud (Hasta)</label>
                                            <input type="date" name="fechaPublicacionSolicitudHasta" value={searchParameters?.fechaPublicacionSolicitudHasta || ''} onChange={handleInputChange} />
                                        </div>


                                        <div className="form-group">
                                            <label>Registro</label>
                                            <input type="text" name="registro" value={searchParameters?.registro || ''} onChange={handleInputChange} maxLength="70" placeholder="Registro" />
                                        </div>
                                        <div className="form-group">
                                            <label>Fecha de registro (Desde)</label>
                                            <input type="date" name="fechaRegistroDesde" value={searchParameters?.fechaRegistroDesde || ''} onChange={handleInputChange} />
                                        </div>
                                        <div className="form-group">
                                            <label>Fecha de registro (Hasta)</label>
                                            <input type="date" name="fechaRegistroHasta" value={searchParameters?.fechaRegistroHasta || ''} onChange={handleInputChange} />
                                        </div>


                                        <div className="form-group">
                                            <label>Certificado</label>
                                            <input type="text" name="certificado" value={searchParameters?.certificado || ''} onChange={handleInputChange} maxLength="70" placeholder="Certificado" />
                                        </div>
                                        <div className="form-group">
                                            <label>Fecha de vencimiento (Desde)</label>
                                            <input type="date" name="vencimientoDesde" value={searchParameters?.vencimientoDesde || ''} onChange={handleInputChange} />
                                        </div>
                                        <div className="form-group">
                                            <label>Fecha de vencimiento (Hasta)</label>
                                            <input type="date" name="vencimientoHasta" value={searchParameters?.vencimientoHasta || ''} onChange={handleInputChange} />
                                        </div>


                                        <div className="form-group">
                                            <label>PCT Solicitud</label>
                                            <input type="text" name="pctSolicitud" value={searchParameters?.pctSolicitud || ''} onChange={handleInputChange} maxLength="70" placeholder="PCT Solicitud" />
                                        </div>
                                        <div className="form-group">
                                            <label>PCT solicitud (Desde)</label>
                                            <input type="date" name="fechaPctSolicitudDesde" value={searchParameters?.fechaPctSolicitudDesde || ''} onChange={handleInputChange} />
                                        </div>
                                        <div className="form-group">
                                            <label>PCT solicitud (Hasta)</label>
                                            <input type="date" name="fechaPctSolicitudHasta" value={searchParameters?.fechaPctSolicitudHasta || ''} onChange={handleInputChange} />
                                        </div>


                                        <div className="form-group">
                                            <label>PCT Publicación</label>
                                            <input type="text" name="pctPublicacion" value={searchParameters?.pctPublicacion || ''} onChange={handleInputChange} maxLength="70" placeholder="PCT Publicación" />
                                        </div>
                                        <div className="form-group">
                                            <label>PCT publicación (Desde)</label>
                                            <input type="date" name="fechaPctPublicacionDesde" value={searchParameters?.fechaPctPublicacionDesde || ''} onChange={handleInputChange} />
                                        </div>
                                        <div className="form-group">
                                            <label>PCT publicación (Hasta)</label>
                                            <input type="date" name="fechaPctPublicacionHasta" value={searchParameters?.fechaPctPublicacionHasta || ''} onChange={handleInputChange} />
                                        </div>


                                        <div className="form-group">
                                            <label>Pago de anualidad</label>
                                            <Dropdown
                                                showClear
                                                style={{ width: '100%' }}
                                                value={selectedPagoAnualidad}
                                                onChange={(e) => setSelectedPagoAnualidad(e.value)}
                                                options={opcionesPagoAnualidad}
                                                optionLabel="nombre"
                                                placeholder="Selecciona una opción"
                                                filter
                                                virtualScrollerOptions={{ itemSize: 38 }}
                                                valueTemplate={selectedValueTemplate}
                                                itemTemplate={optionTemplate}
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>Pago de anualidad (Desde)</label>
                                            <input type="date" name="pagoAnualidadDesde" value={searchParameters?.pagoAnualidadDesde || ''} onChange={handleInputChange} />
                                        </div>
                                        <div className="form-group">
                                            <label>Pago de anualidad (Hasta)</label>
                                            <input type="date" name="pagoAnualidadHasta" value={searchParameters?.pagoAnualidadHasta || ''} onChange={handleInputChange} />
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

export default PatentesSearch;