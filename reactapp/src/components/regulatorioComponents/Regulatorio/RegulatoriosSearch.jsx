import React, { useState, useRef, useEffect } from 'react';
import Draggable from 'react-draggable';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { Dropdown } from 'primereact/dropdown';
import { TabView, TabPanel } from 'primereact/tabview';
import DebounceDropdown from '../../miscComponents/Dropdown/DebounceDropdown';

// Redux
import { saveData, deleteData } from '../../../context/regulatorioSlice'; // EDITABLE
import { useSelector, useDispatch } from 'react-redux';

// Servicios para dropdowns normales
import { usePaises } from '../../../services/usePais';
import { useAbogados } from '../../../services/useAbogados';
import { useEstados } from '../../../services/useEstados';
import { useGrupos } from '../../../services/useGrupos';

function RegulatoriosSearch({ onClose, onSearch }) { //EDITABLE

    // --------------- Redux store settings -------------------------------------------------------

    const dispatch = useDispatch();
    const regulatorioSearchData = useSelector(state => state.regulatorio.RegulatorioSearch); // EDITABLE

    // --------------- Setup (Servicios, Contextos, Referencias) -----------------------------------

    const isClosingRef = useRef(false); // Referencia para eliminar persistencia: EDITABLE
    const toast = useRef(null); // Referencia para el toast: GENERAL

    const { paises, error: errorP, isLoading: isLoadingP, isValidating: isValidatingP, refresh: refreshP } = usePaises(); // EDITABLE
    const { abogados, error: errorA, isLoading: isLoadingA, isValidating: isValidatingA, refresh: refreshA } = useAbogados(); // EDITABLE
    const { estados: estadosOptions, error: errorE, isLoading: isLoadingE, isValidating: isValidatingE, refresh: refreshE } = useEstados(); // Para el dropdown de estados
    const { grupos, error: errorG, isLoading: isLoadingG, isValidating: isValidatingG, refresh: refreshG } = useGrupos(); // Para el dropdown de grupos

    // --------------- Estados que no requieren persistencia -----------------------------------------

    const [isRefreshing, setIsRefreshing] = useState(false);

    // --------------- Estados que requieren persistencia --------------------------------------------

    const [searchParameters, setSearchParameters] = useState(null); // mapea los parámetros de búsqueda

    // Dropdowns normales
    const [selectedPais, setSelectedPais] = useState(null); 
    const [selectedAbogado, setSelectedAbogado] = useState(null); 
    const [selectedEstado, setSelectedEstado] = useState(null); 
    const [selectedGrupo, setSelectedGrupo] = useState(null);

    // Debounced dropdowns
    const [selectedCliente, setSelectedCliente] = useState(null); 
    const [selectedOficinaTramitante, setSelectedOficinaTramitante] = useState(null); 

    // --------------- Funciones necesarias para persistencia ----------------------------------------

    useEffect(() => {
        if (regulatorioSearchData) { // EDITABLE
            setSearchParameters(regulatorioSearchData.searchParameters || null); 

            setSelectedPais(regulatorioSearchData.selectedPais || null);
            setSelectedAbogado(regulatorioSearchData.selectedAbogado || null);
            setSelectedEstado(regulatorioSearchData.selectedEstado || null);
            setSelectedGrupo(regulatorioSearchData.selectedGrupo || null);

            setSelectedCliente(regulatorioSearchData.selectedCliente || null);
            setSelectedOficinaTramitante(regulatorioSearchData.selectedOficinaTramitante || null);
        }
    }, []); // Se ejecuta cuando el componente renderiza, lee los datos guardados: GENERAL
    const saveState = () => {
        dispatch(saveData({ objectName: 'RegulatorioSearch', value: { searchParameters, selectedPais, selectedAbogado, selectedEstado, selectedGrupo, selectedCliente, selectedOficinaTramitante} })); // EDITABLE
    }; // Guarda en el contexto los estados como objetos: ESPECIFICO
    useEffect(() => {
        return () => {
            if (!isClosingRef.current) {
                saveState();
            }
        };
    }, [searchParameters, selectedPais, selectedAbogado, selectedEstado, selectedGrupo, selectedCliente, selectedOficinaTramitante]); // Se ejecuta con cada cambio de estado.
    const deletePersistedStates = () => {
        dispatch(deleteData({ objectName: 'RegulatorioSearch' })); // EDITABLE
    }; // Elimina los datos en el objeto del contexto: ESPECIFICO

    // --------------- Funciones especificas del componente ------------------------------------------

    const resetStates = () => {
        setSearchParameters(null); // EDITABLE
        setSelectedPais(null);
        setSelectedAbogado(null);
        setSelectedEstado(null);
        setSelectedGrupo(null);
        setSelectedOficinaTramitante(null);
        setSelectedCliente(null);
    } // Resetea los estados del componente: ESPECIFICO

    // --------------- DROPDOWNS ---------------------------------------------------------------------
    const refreshData = (e) => {
        e.preventDefault();
        setIsRefreshing(true);
        refreshP();
        refreshA();
        refreshE();
        refreshG();
    }; // Refresca los datos de los DROPDOWNs

    useEffect(() => {
        if (isRefreshing) {
            setIsRefreshing(false);
        }
    }, [isValidatingP, isValidatingA, isValidatingE, isValidatingG]); // Cambia el estado de refreshing de los DROPDOWNs

    // País
    useEffect(() => {
        setSearchParameters(prevSP => {
            const newSP = { ...prevSP };

            if (selectedPais) {
                newSP.pais = selectedPais.codigoPais;
            } else if (newSP.pais !== undefined) {
                delete newSP.pais;
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

    // Oficina Tramitante
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

    // Grupo
    useEffect(() => {
        setSearchParameters(prevSP => {
            const newSP = { ...prevSP };

            if (selectedGrupo) {
                newSP.grupoId = selectedGrupo.grupoId;
            } else if (newSP.grupoId !== undefined) {
                delete newSP.grupoId;
            }
            return newSP;
        });
    }, [selectedGrupo]);


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
            { from: searchParameters?.fechaVencimientoDesde, to: searchParameters?.fechaVencimientoHasta, name: "Vencimiento" },
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
                        <span>Buscar regulatorios</span> 
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
                        <TabPanel header="Registro" leftIcon="pi pi-book mr-2">
                            <div className="form-body">
                                <section>
                                    <div className="form-group-label">
                                        <i className="pi pi-book"></i>
                                        <label>Registro</label>
                                    </div>
                                    <div className="form-body-group">
                                        <div className="form-group">
                                            <label>Código</label>
                                            <input type="number" name="regulatorioId" value={searchParameters?.regulatorioId || ''} onChange={handleInputChange} maxLength="8" placeholder="Código del registro" />
                                        </div>
                                        <div className="form-group">
                                            <label>Referencia</label>
                                            <input type="text" name="referencia" value={searchParameters?.referencia || ''} onChange={handleInputChange} maxLength="100" placeholder="Referencia del registro" />
                                        </div>
                                        <div className="form-group">
                                            <label>Grupo</label>
                                            <div>
                                                {
                                                    errorG || !grupos ? (
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
                                                            value={selectedGrupo}
                                                            onChange={(e) => setSelectedGrupo(e.value)}
                                                            options={grupos}
                                                            optionLabel="nombre"
                                                            placeholder="Selecciona un grupo"
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
                                            <label>Título</label>
                                            <input type="text" name="titulo" value={searchParameters?.titulo || ''} onChange={handleInputChange} maxLength="200" placeholder="Título del registro" />
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
                                            <label>Fecha de vencimiento (Desde)</label>
                                            <input type="date" name="fechaVencimientoDesde" value={searchParameters?.fechaVencimientoDesde || ''} onChange={handleInputChange} />
                                        </div>
                                        <div className="form-group">
                                            <label>Fecha de vencimiento (Hasta)</label>
                                            <input type="date" name="fechaVencimientoHasta" value={searchParameters?.fechaVencimientoHasta || ''} onChange={handleInputChange} />
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

export default RegulatoriosSearch;