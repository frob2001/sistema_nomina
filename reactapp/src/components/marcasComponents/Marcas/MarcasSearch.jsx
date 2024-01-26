import React, { useState, useRef, useEffect } from 'react';
import Draggable from 'react-draggable';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { Dropdown } from 'primereact/dropdown';
import { TabView, TabPanel } from 'primereact/tabview';
import DebounceDropdown from '../../miscComponents/Dropdown/DebounceDropdown';

// Redux
import { saveData, deleteData } from '../../../context/marcaSlice'; // EDITABLE
import { useSelector, useDispatch } from 'react-redux';

// Servicios para dropdowns normales
import { usePaises } from '../../../services/usePais';
import { useAbogados } from '../../../services/useAbogados';
import { useTipoSistemaMarca } from '../../../services/useTipoSistemaMarca';
import { useTipoSignoMarca } from '../../../services/useTipoSignoMarca';
import { useTipoMarca } from '../../../services/useTipoMarca';
import { useClases } from '../../../services/useClases';
import { useEstados } from '../../../services/useEstados';
import { useTipoPublicacion } from '../../../services/useTipoPublicacion';
import { useGacetas } from '../../../services/useGacetas';

function MarcasSearch({ onClose, onSearch }) { //EDITABLE

    // --------------- Redux store settings -------------------------------------------------------

    const dispatch = useDispatch();
    const marcaSearchData = useSelector(state => state.marca.MarcaSearch); // EDITABLE

    // --------------- Setup (Servicios, Contextos, Referencias) -----------------------------------

    const isClosingRef = useRef(false); // Referencia para eliminar persistencia: EDITABLE
    const toast = useRef(null); // Referencia para el toast: GENERAL
    const { paises, error: errorP, isLoading: isLoadingP, isValidating: isValidatingP, refresh: refreshP } = usePaises(); // EDITABLE
    const { abogados, error: errorA, isLoading: isLoadingA, isValidating: isValidatingA, refresh: refreshA } = useAbogados(); // EDITABLE
    const { tiposSistemaMarcas, error: errorTSis, isLoading: isLoadingTSis, isValidating: isValidatingTSis, refresh: refreshTSis } = useTipoSistemaMarca(); // EDITABLE
    const { tiposSignoMarcas, error: errorTSig, isLoading: isLoadingTSig, isValidating: isValidatingTSig, refresh: refreshTSig } = useTipoSignoMarca(); // EDITABLE
    const { tiposMarcas, error: errorTM, isLoading: isLoadingTM, isValidating: isValidatingTM, refresh: refreshTM } = useTipoMarca(); // EDITABLE
    const { estados: estadosOptions, error: errorE, isLoading: isLoadingE, isValidating: isValidatingE, refresh: refreshE } = useEstados(); // Para el dropdown de estados
    const { clases, error: errorC, isLoading: isLoadingC, isValidating: isValidatingC, refresh: refreshC } = useClases(); // Para el dropdown de clases
    const { tiposPublicaciones, error: errorTP, isLoading: isLoadingTP, isValidating: isValidatingTP, refresh: refreshTP } = useTipoPublicacion(); // Para el dropdown de tipos de publicaciones
    const { gacetas, error: errorG, isLoading: isLoadingG, isValidating: isValidatingG, refresh: refreshG } = useGacetas(); // Para el dropdown de tipos de publicaciones

    // --------------- Estados que no requieren persistencia -----------------------------------------

    const [isRefreshing, setIsRefreshing] = useState(false);

    // --------------- Estados que requieren persistencia --------------------------------------------

    const [searchParameters, setSearchParameters] = useState(null); // mapea los parámetros de búsqueda

    // Dropdowns normales
    const [selectedTipoSistema, setSelectedTipoSistema] = useState(null); 
    const [selectedTipoSigno, setSelectedTipoSigno] = useState(null); 
    const [selectedTipoMarca, setSelectedTipoMarca] = useState(null); 
    const [selectedPais, setSelectedPais] = useState(null); 
    const [selectedAbogado, setSelectedAbogado] = useState(null); 
    const [selectedClase, setSelectedClase] = useState(null); 
    const [selectedEstado, setSelectedEstado] = useState(null); 
    const [selectedTipoPublicacion, setSelectedTipoPublicacion] = useState(null); 
    const [selectedGaceta, setSelectedGaceta] = useState(null); 

    // Debounced dropdowns
    const [selectedCliente, setSelectedCliente] = useState(null); 
    const [selectedOficinaTramitante, setSelectedOficinaTramitante] = useState(null); 

    // --------------- Funciones necesarias para persistencia ----------------------------------------

    useEffect(() => {
        if (marcaSearchData) { // EDITABLE
            setSearchParameters(marcaSearchData.searchParameters || null); // EDITABLE

            setSelectedTipoSistema(marcaSearchData.selectedTipoSistema || null);
            setSelectedTipoSigno(marcaSearchData.selectedTipoSigno || null);
            setSelectedTipoMarca(marcaSearchData.selectedTipoMarca || null);
            setSelectedPais(marcaSearchData.selectedPais || null);
            setSelectedAbogado(marcaSearchData.selectedAbogado || null);
            setSelectedClase(marcaSearchData.selectedClase || null);
            setSelectedEstado(marcaSearchData.selectedEstado || null);
            setSelectedTipoPublicacion(marcaSearchData.selectedTipoPublicacion || null);
            setSelectedGaceta(marcaSearchData.selectedGaceta || null);

            setSelectedCliente(marcaSearchData.selectedCliente || null);
            setSelectedOficinaTramitante(marcaSearchData.selectedOficinaTramitante || null);
        }
    }, []); // Se ejecuta cuando el componente renderiza, lee los datos guardados: GENERAL
    const saveState = () => {
        dispatch(saveData({ objectName: 'MarcaSearch', value: { searchParameters, selectedTipoSistema, selectedTipoSigno, selectedTipoMarca , selectedPais, selectedAbogado, selectedCliente, selectedOficinaTramitante, selectedClase, selectedEstado, selectedTipoPublicacion, selectedGaceta } })); // EDITABLE
    }; // Guarda en el contexto los estados como objetos: ESPECIFICO
    useEffect(() => {
        return () => {
            if (!isClosingRef.current) {
                saveState();
            }
        };
    }, [searchParameters, selectedTipoSistema, selectedTipoSigno, selectedTipoMarca, selectedPais, selectedAbogado, selectedCliente, selectedOficinaTramitante, selectedClase, selectedEstado, selectedTipoPublicacion, selectedGaceta]); // Se ejecuta con cada cambio de estado.
    const deletePersistedStates = () => {
        dispatch(deleteData({ objectName: 'MarcaSearch' })); // EDITABLE
    }; // Elimina los datos en el objeto del contexto: ESPECIFICO

    // --------------- Funciones especificas del componente ------------------------------------------

    const resetStates = () => {
        setSearchParameters(null); // EDITABLE
        setSelectedTipoSistema(null);
        setSelectedTipoSigno(null);
        setSelectedTipoMarca(null);
        setSelectedAbogado(null);
        setSelectedPais(null);
        setSelectedOficinaTramitante(null);
        setSelectedCliente(null);
        setSelectedEstado(null);
        setSelectedClase(null);
        setSelectedTipoPublicacion(null);
        setSelectedGaceta(null);
    } // Resetea los estados del componente: ESPECIFICO


    // --------------- DROPDOWNS ---------------------------------------------------------------------
    const refreshData = (e) => {
        e.preventDefault();
        setIsRefreshing(true);
        refreshP();
        refreshA();
        refreshTSis();
        refreshTSig();
        refreshTM();
        refreshC();
        refreshE();
        refreshTP();
        refreshG();
    }; // Refresca los datos de los DROPDOWNs
    useEffect(() => {
        if (isRefreshing) {
            setIsRefreshing(false);
        }
    }, [isValidatingP, isValidatingA, isValidatingTM, isValidatingTSis, isValidatingTSig, isValidatingC, isValidatingE, isValidatingTP, isValidatingG]); // Cambia el estado de refreshing de los DROPDOWNs

    // Tipo Marca
    useEffect(() => {
        setSearchParameters(prevSP => {
            const newSP = { ...prevSP };

            if (selectedTipoMarca) {
                newSP.tipoMarcaId = selectedTipoMarca.tipoMarcaId;
            } else if (newSP.tipoMarcaId !== undefined) {
                delete newSP.tipoMarcaId;
            }
            return newSP;
        });
    }, [selectedTipoMarca]);

    // Tipo Sistema
    useEffect(() => {
        setSearchParameters(prevSP => {
            const newSP = { ...prevSP };

            if (selectedTipoSistema) {
                newSP.tipoSistemaMarcaId = selectedTipoSistema.tipoSistemaMarcaId;
            } else if (newSP.tipoSistemaMarcaId !== undefined) {
                delete newSP.tipoSistemaMarcaId;
            }
            return newSP;
        });
    }, [selectedTipoSistema]);

    // Tipo Signo
    useEffect(() => {
        setSearchParameters(prevSP => {
            const newSP = { ...prevSP };

            if (selectedTipoSigno) {
                newSP.tipoSignoMarcaId = selectedTipoSigno.tipoSignoMarcaId;
            } else if (newSP.tipoSignoMarcaId !== undefined) {
                delete newSP.tipoSignoMarcaId;
            }
            return newSP;
        });
    }, [selectedTipoSigno]);

    // País
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

    // Cliente
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


    // Clase
    useEffect(() => {
        setSearchParameters(prevSP => {
            const newSP = { ...prevSP };

            if (selectedClase) {
                newSP.claseId = selectedClase.codigo;
            } else if (newSP.claseId !== undefined) {
                delete newSP.claseId;
            }
            return newSP;
        });
    }, [selectedClase]);

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
            { from: searchParameters?.fechaRegistroDesde, to: searchParameters?.fechaRegistroHasta, name: "Registro" },
            { from: searchParameters?.vencimientoDesde, to: searchParameters?.vencimientoHasta, name: "Vencimiento" },
            { from: searchParameters?.fechaCertificadoDesde, to: searchParameters?.fechaCertificadoHasta, name: "Certificado" },
            { from: searchParameters?.fechaSolicitudDesde, to: searchParameters?.fechaSolicitudHasta, name: "Solicitud" },
            { from: searchParameters?.fechaPrioridadDesde, to: searchParameters?.fechaPrioridadHasta, name: "Prioridad" },
            { from: searchParameters?.fechaPublicacionDesde, to: searchParameters?.fechaPublicacionHasta, name: "Publicación" },
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
                        <span>Buscar marcas</span> 
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
                        <TabPanel header="Marca" leftIcon="pi pi-verified mr-2">
                            <div className="form-body">
                                <section>
                                    <div className="form-group-label">
                                        <i className="pi pi-verified"></i>
                                        <label>Marca</label>
                                    </div>
                                    <div className="form-body-group">
                                        <div className="form-group">
                                            <label>Código</label>
                                            <input type="number" name="marcaId" value={searchParameters?.marcaId || ''} onChange={handleInputChange} maxLength="8" placeholder="Código de la marca" />
                                        </div>
                                        <div className="form-group">
                                            <label>Tipo de marca</label>
                                            <div>
                                                {
                                                    errorTM || !tiposMarcas ? (
                                                        <div className="dropdown-error">
                                                            <div className="dropdown-error-msg">
                                                                {isLoadingTM || (isRefreshing && isValidatingTM) ?
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
                                                            value={selectedTipoMarca}
                                                            onChange={(e) => setSelectedTipoMarca(e.value)}
                                                            options={tiposMarcas}
                                                            optionLabel="nombre"
                                                            placeholder="Selecciona un tipo de marca"
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
                                            <label>Tipo de sistema</label>
                                            <div>
                                                {
                                                    errorTSis || !tiposSistemaMarcas ? (
                                                        <div className="dropdown-error">
                                                            <div className="dropdown-error-msg">
                                                                {isLoadingTSis || (isRefreshing && isValidatingTSis) ?
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
                                                            value={selectedTipoSistema}
                                                            onChange={(e) => setSelectedTipoSistema(e.value)}
                                                                options={tiposSistemaMarcas}
                                                            optionLabel="nombre"
                                                            placeholder="Selecciona un tipo de sistema"
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
                                            <input type="text" name="referencia" value={searchParameters?.referencia || ''} onChange={handleInputChange} maxLength="100" placeholder="Referencia de la marca" />
                                        </div>
                                        <div className="form-group">
                                            <label>Signo</label>
                                            <input type="text" name="signo" value={searchParameters?.signo || ''} onChange={handleInputChange} maxLength="70" placeholder="Signo" />
                                        </div>
                                        <div className="form-group">
                                            <label>Tipo de signo</label>
                                            <div>
                                                {
                                                    errorTSig || !tiposSignoMarcas ? (
                                                        <div className="dropdown-error">
                                                            <div className="dropdown-error-msg">
                                                                {isLoadingTSig || (isRefreshing && isValidatingTSig) ?
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
                                                            value={selectedTipoSigno}
                                                            onChange={(e) => setSelectedTipoSigno(e.value)}
                                                            options={tiposSignoMarcas}
                                                            optionLabel="nombre"
                                                            placeholder="Selecciona un tipo de signo"
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
                                                            value={selectedClase}
                                                            onChange={(e) => setSelectedClase(e.value)}
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
                                                    errorTP || !tiposPublicaciones ? (
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
                            </div>
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
                                            <input type="text" name="solicitud" value={searchParameters?.solicitud || ''} onChange={handleInputChange} maxLength="70" placeholder="Solicitud" />
                                        </div>
                                        <div className="form-group">
                                            <label>Fecha de solicitud (Desde)</label>
                                            <input type="date" name="fechaSolicitudDesde" value={searchParameters?.fechaSolicitudDesde || ''} onChange={handleInputChange} />
                                        </div>
                                        <div className="form-group">
                                            <label>Fecha de solicitud (Hasta)</label>
                                            <input type="date" name="fechaSolicitudHasta" value={searchParameters?.fechaSolicitudHasta || ''} onChange={handleInputChange} />
                                        </div>

                                        <div className="form-group">
                                            <label>Registro</label>
                                            <input type="text" name="registro" value={searchParameters?.registro || ''} onChange={handleInputChange} maxLength="70" placeholder="Registro" />
                                        </div>
                                        <div className="form-group">
                                            <label>Fecha de concesión (Desde)</label>
                                            <input type="date" name="fechaRegistroDesde" value={searchParameters?.fechaRegistroDesde || ''} onChange={handleInputChange} />
                                        </div>
                                        <div className="form-group">
                                            <label>Fecha de concesión (Hasta)</label>
                                            <input type="date" name="fechaRegistroHasta" value={searchParameters?.fechaRegistroHasta || ''} onChange={handleInputChange} />
                                        </div>

                                        {/*<div className="form-group">*/}
                                        {/*    <label>Certificado</label>*/}
                                        {/*    <input type="text" name="certificado" value={searchParameters?.certificado || ''} onChange={handleInputChange} maxLength="70" placeholder="Certificado" />*/}
                                        {/*</div>*/}
                                        <div className="form-group form-group-double">
                                            <label>Fecha de emisión de certificado (Desde)</label>
                                            <input type="date" name="fechaCertificadoDesde" value={searchParameters?.fechaCertificadoDesde || ''} onChange={handleInputChange} />
                                        </div> 
                                        <div className="form-group form-group-double">
                                            <label>Fecha de emisión de certificado (Hasta)</label>
                                            <input type="date" name="fechaCertificadoHasta" value={searchParameters?.fechaCertificadoHasta || ''} onChange={handleInputChange} />
                                        </div>
                                        <div className="form-group form-group-double">
                                            <label>Fecha de vencimiento (Desde)</label>
                                            <input type="date" name="vencimientoDesde" value={searchParameters?.vencimientoDesde || ''} onChange={handleInputChange} />
                                        </div>
                                        <div className="form-group form-group-double">
                                            <label>Fecha de vencimiento (Hasta)</label>
                                            <input type="date" name="vencimientoHasta" value={searchParameters?.vencimientoHasta || ''} onChange={handleInputChange} />
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

export default MarcasSearch;