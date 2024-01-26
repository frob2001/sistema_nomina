import React, { useState, useEffect, useRef } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Text } from 'recharts';
import { addDays, startOfWeek, format, addWeeks, parseISO, eachDayOfInterval } from 'date-fns';
import { es } from 'date-fns/locale';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { ConfirmPopup, confirmPopup } from 'primereact/confirmpopup';
import { Checkbox } from 'primereact/checkbox';
import { Toast } from 'primereact/toast';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { FilterMatchMode, FilterOperator } from 'primereact/api';

// Datos
import { useInstanciasRecordatorios } from '../../services/useInstanciasRecordatorio';
import { useUsuarios } from '../../services/useUsuarios'; // Para los datos del usuario en el origen

// Auth
import { useMsal } from '@azure/msal-react';

// Services
const apiEndpoint = import.meta.env.VITE_MAIN_ENDPOINT;

function InstanciasChart(props) {

    // --------------- Auth and request setup -------------------------------------------------------

    const { instance, accounts } = useMsal();
    const getAccessToken = async () => {
        try {
            const accessTokenRequest = {
                scopes: ["api://corralrosales.com/kattion/tasks.write", "api://corralrosales.com/kattion/tasks.read"], // Para leer y escribir tareas
                account: accounts[0],
            };
            const response = await instance.acquireTokenSilent(accessTokenRequest);
            return response.accessToken;
        } catch (e) {
            console.error(e);
            return null;
        }
    };
    const toast = useRef(null);

    // -------------- Setup ------------
    const { instanciasRecordatorios, error, isLoading, isValidating, refresh } = useInstanciasRecordatorios(); // Obtención de datos
    const [chartData, setChartData] = useState([]);
    const [chartDataETL, setChartDataETL] = useState([]);
    const { usuarios  } = useUsuarios(); 

    // ---------------- Lógica para mostrar solo una semana -----------
    // Calculate the start and end of the current week
    const startOfCurrentWeek = startOfWeek(new Date(), { weekStartsOn: 1 });
    const endOfCurrentWeek = addDays(startOfCurrentWeek, 6);

    // State for the visible date range
    const [visibleStart, setVisibleStart] = useState(startOfCurrentWeek);
    const [visibleEnd, setVisibleEnd] = useState(endOfCurrentWeek);

    // Filtrar los datos entre las fechas de la semana actual
    useEffect(() => {
        if (instanciasRecordatorios) {
            // Filter and order data to be within the visible week
            const filteredAndOrderedData = instanciasRecordatorios
                .filter(rec => {
                    const fecha = parseISO(rec.fecha);
                    return fecha >= visibleStart && fecha <= visibleEnd;
                })
                .sort((a, b) => new Date(a.fecha) - new Date(b.fecha));

            setChartDataETL(transformDataForChart(filteredAndOrderedData, visibleStart, visibleEnd));;
            setChartData(filteredAndOrderedData);
        }
    }, [instanciasRecordatorios, visibleStart, visibleEnd]);

    // ETL de los datos para presentarlos en el gráfico
    function transformDataForChart(data, start, end) {
        // Initialize counts and recordatorios for each day of the week
        const infoByDate = eachDayOfInterval({ start, end }).reduce((acc, date) => {
            const formattedDate = format(date, 'yyyy-MM-dd');
            acc[formattedDate] = { count: 0, recordatorios: [] };
            return acc;
        }, {});

        // Increment counts and add recordatorios based on data
        data.forEach(rec => {
            const date = format(parseISO(rec.fecha), 'yyyy-MM-dd');
            if (infoByDate.hasOwnProperty(date)) {
                if (rec.activo) {
                    infoByDate[date].count += 1;
                }
                infoByDate[date].recordatorios.push({ ...rec.recordatorio, activo: rec.activo });
            }
        });

        return Object.entries(infoByDate).map(([date, { count, recordatorios }]) => ({
            fecha: date,
            count,
            recordatorios
        }));
    }

    // CUstom tooltip
    const CustomTooltip = ({ active, payload, label }) => {

        let date;
        let dateParts;
        let formattedDate;
        let dayName;

        if (label) {
            date = label;
            dateParts = date?.split('-');
            formattedDate = `${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`;
            dayName = getSpanishDayOfWeek(date);
        }

        if (active && payload && payload.length) {
            return (
                <div className="chart-tooltip-container" style={{ boxShadow: payload[0].payload.recordatorios?.length >= 4 ? 'inset 0px -62px 15px -56px rgba(0,0,0,0.2)' : 'none' }}>
                    <p className="chart-tooltip-title"><strong>{dayName}: {formattedDate}</strong><small>{` (${payload[0].value})`}</small></p>
                    {payload[0].payload.recordatorios?.map((recordatorio, index) => (
                        <p className="chart-tooltip-rec" key={index}>• <strong>{!recordatorio.activo ? '(Completado)' : ''}</strong>{` ${recordatorio.descripcion?.slice(0, 30)}${recordatorio.descripcion?.length > 30 ? '...' : ''}`}</p>
                    ))}
                </div>
            );
        }

        return null;
    };


    // Function to change the week (forward or backward)
    const changeWeek = (direction) => {
        if (direction === 'backward') {
            setVisibleStart(addWeeks(visibleStart, -1));
            setVisibleEnd(addWeeks(visibleEnd, -1));
        } else {
            setVisibleStart(addWeeks(visibleStart, 1));
            setVisibleEnd(addWeeks(visibleEnd, 1));
        }
    };

    // -------------------------------------------

    function getSpanishDayOfWeek(dateString) {
        const date = parseISO(dateString); // Parse the ISO date string
        const formattedDay = format(date, 'EEEE', { locale: es });
        return formattedDay;
    }

    function getSpanishMonth(dateString) {
        const date = parseISO(dateString); // Parse the ISO date string
        const formattedMonth = format(date, 'MMM', { locale: es });
        return formattedMonth;
    }

    const formatYAxis = (tickItem) => { 

        if (tickItem % 1 === 0) {
            return tickItem;  // Display integers
        } else {
            return '';  // Return an empty string for decimals
        }
    };

    const CustomYAxisTick = ({ x, y, payload }) => {
        const ammountStyle = {
            fontSize: 10,
            fill: 'var(--main-blue)', // Text color
            fontFamily: 'var(--poppins)',
        };

        return (
            <Text x={x} y={y} textAnchor="end" verticalAnchor="middle" style={ammountStyle}>
                {payload.value}
            </Text>
        );
    };

    const CustomXAxisTick = ({ x, y, payload }) => {
        const dayStyle = {
            fontSize: 12,
            fill: 'var(--main-blue)', // Text color
            fontWeight: 'bold', // Bold for the day name
            fontFamily: 'var(--poppins)',
        };

        const dateStyle = {
            fontSize: 10,
            fill: 'var(--main-blue)',
            fontFamily: 'var(--poppins)'
        };

        // Assuming payload.value is a date string
        const date = payload.value; // Example: "2023-10-19"
        const dateParts = date.split('-');
        const formattedDate = `${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`;
        const dayName = getSpanishDayOfWeek(date);

        return (
            <g>
                <Text x={x} y={y + 8} textAnchor="middle" verticalAnchor="start" style={dayStyle}>
                    {dayName}
                </Text>
                <Text x={x} y={y + 28} textAnchor="middle" verticalAnchor="end" style={dateStyle}>
                    {formattedDate}
                </Text>
            </g>
        );
    };

    // Filtrar la fecha seleccionada en la tabla
    const handleChartClick = (data, index) => {
        // Set the global filter value
        setGlobalFilterValue(data.fecha);

        // Update the global filter
        const newFilters = { ...filters };
        newFilters['global'] = { value: data.fecha, matchMode: FilterMatchMode.CONTAINS };
        setFilters(newFilters);
    };

    function formatSemanaActual() {
        if (startOfCurrentWeek && endOfCurrentWeek) {
            let dateBegin = startOfCurrentWeek.toISOString().split('T')[0];
            let dateEnd = endOfCurrentWeek.toISOString().split('T')[0];

            let datePartsBegin = dateBegin.split('-');
            let datePartsEnd = dateEnd.split('-');

            let formattedBegindate = `${datePartsBegin[2]}-${getSpanishMonth(dateBegin)}-${datePartsBegin[0]}`;
            let formattedEnddate = `${datePartsEnd[2]}-${getSpanishMonth(dateEnd)}-${datePartsEnd[0]}`;

            return `${formattedBegindate} al ${formattedEnddate}`;
        } else {
            return '';
        }
    }

    // ################################################################## Tabla #######################################################3

    // --------------- Estados  --------------------------------------------------------------------

    const [filters, setFilters] = useState(null);
    const [globalFilterValue, setGlobalFilterValue] = useState('');
    const [isRefreshing, setIsRefreshing] = useState(false);

    // --------------- Funciones necesarias para persistencia ----------------------------------------

    useEffect(() => {
        // Retrieve persisted state from session storage
        const savedState = sessionStorage.getItem('recordatorios-table-state');

        if (savedState) {
            // Parse the saved state
            const parsedState = JSON.parse(savedState);

            // Check if filters are saved and set them
            if (parsedState.filters) {
                setFilters(parsedState.filters);

                // If global filter is set, update globalFilterValue
                if (parsedState.filters.global && parsedState.filters.global.value) {
                    setGlobalFilterValue(parsedState.filters.global.value);
                }
            }
        } else {
            // Initialize with default filters if no saved state
            initFilters();
        }
    }, []); // useEffect hook for initializing filters
    useEffect(() => {
        if (error) {
            toast.current.show({
                severity: 'info',
                summary: 'Aviso',
                detail: 'Hubo un problema con el servidor, intenta más tarde',
                life: 3000,
            });
        }
    }, [error]); // Genera el toast con el error: GENERAL
    const refreshData = () => {
        setIsRefreshing(true);
        refresh();
    }; // Refresca los datos: GENERAL
    useEffect(() => {
        if (isRefreshing) {
            setIsRefreshing(false);
        }
    }, [isValidating]); // Cambia el estado de refreshing: GENERAL
    const clearFilter = () => {
        initFilters();
    }; // Función para limpiar todos los filtros
    const onGlobalFilterChange = (e) => {
        const value = e.target.value;
        let _filters = { ...filters };

        _filters['global'].value = value;

        setFilters(_filters);
        setGlobalFilterValue(value);
    }; // Función para el filtro global
    const initFilters = () => {
        setFilters({
            global: { value: null, matchMode: FilterMatchMode.CONTAINS },
            fecha: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }] },
            "recordatorio.descripcion": { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }] },
            "recordatorio.tablaConexion": { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }] },
            "recordatorio.idConexion": { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }] }
        });
        setGlobalFilterValue('');
    }; // Función para restaurar e inicializar los filtros

    const [isDeleting, setIsDeleting] = useState(false);
    const [activeCheckbox, setActiveCheckbox] = useState(null);

    const confirmDeletion = (event, rowData) => {
        confirmPopup({
            target: event.currentTarget,
            message: '¿Estás seguro? Solamente se eliminará esta instancia del recordatorio',
            icon: 'pi pi-info-circle',
            acceptClassName: 'p-button-danger',
            accept: () => deleteInstancia(rowData)
        });
    };
    const deleteInstancia = async (rowData) => {
        try {
            setIsDeleting(true);
            const url = `${apiEndpoint}/InstanciasRecordatorios/${rowData.instanciasRecordatorioId}`;
            const accessToken = await getAccessToken();
            const response = await fetch(url, {
                method: 'DELETE',
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            toast.current.show({
                severity: 'success',
                summary: 'Éxito',
                detail: `Instancia eliminada correctamente`,
                life: 3000,
            });

            refresh();

        } catch (error) {
            toast.current.show({
                severity: 'error',
                summary: 'Error',
                detail: `Hubo un problema al eliminar la instancia`,
                life: 3000,
            });
        } finally {
            setIsDeleting(false);
            refresh();
        }
    };
    const renderHeader = () => {
        return (
            <div className="flex justify-content-between" style={{padding: '2px'}}>
                <div className="table-utility">
                    <span className="search-input-container">
                        <i className="pi pi-search search-input-icon" style={{ fontSize: '0.8rem', margin: '0', color: 'black' }}></i>
                        <InputText className="search-input" value={globalFilterValue} onChange={onGlobalFilterChange} placeholder="Buscar" />
                    </span>
                    <Button className="rounded-icon-btn" onClick={refreshData}>
                        <i className="pi pi-refresh" style={{ fontSize: '0.8rem', margin: '0' }}></i>
                    </Button>
                    <Button onClick={clearFilter} className="rounded-icon-btn" type="button" rounded>
                        <i className="pi pi-filter-slash" style={{ fontSize: '0.8rem', margin: '0' }}></i>
                    </Button>
                </div>
                
            </div>
        );
    }; // Contiene el header de la tabla: GENERAL
    const filterClearTemplate = (options) => {
        return <Button id="cancel" className="rounded-icon-btn" type="button" onClick={options.filterClearCallback}>
            <i className="pi pi-times" style={{ fontSize: '0.8rem', margin: '0' }}></i>
        </Button>;
    }; // Formato del botón para cancelar filtros
    const filterApplyTemplate = (options) => {
        return <Button className="rounded-icon-btn" type="button" onClick={options.filterApplyCallback}>
            <i className="pi pi-check" style={{ fontSize: '0.8rem', margin: '0' }}></i>
        </Button>;
    }; // Formato del botón para confirmar filtros
    const header = renderHeader();
    const actionsTemplate = (rowData) => {
        return (
            <div className="table-downloadbtn" >
                <button className="rounded-icon-btn" id="dwn-pdf" type="button" style={{ minHeight: '10px', minWidth: '10px', height: '20px' }} onClick={(event) => confirmDeletion(event, rowData)}>
                    <i className="pi pi-times" style={{ fontSize: '10px', margin: '0', color: 'white' }}></i>
                </button>
            </div>
        );
    };
    const handleInstanceChange = async (instanciaId, activoInstancia) => {
        try {
            setActiveCheckbox(instanciaId);
            const url = `${apiEndpoint}/InstanciasRecordatorios/${instanciaId}/activo`;
            const accessToken = await getAccessToken();
            const response = await fetch(url, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${accessToken}`,
                },
                body: JSON.stringify(activoInstancia),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            toast.current.show({
                severity: activoInstancia ? 'info' : 'success',
                summary: 'Éxito',
                detail: activoInstancia ? 'Instancia pendiente' : 'Instancia completada',
                life: 1000,
            });
        } catch (error) {
            toast.current.show({
                severity: 'error',
                summary: 'Error',
                detail: `Hubo un problema al cambiar el estado del recordatorio`,
                life: 3000,
            });
        } finally {
            setActiveCheckbox(null);
            refresh();
        }
    }
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const options = {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            timeZone: 'UTC', // Set the time zone to UTC
        };
        const formatter = new Intl.DateTimeFormat('es-ES', options);
        return formatter.format(date);
    };
    const fechaBodyTemplate = (rowData) => {
        let fecha = rowData.fecha.split('T')[0];
        let dateParts = fecha.split('-');

        const handleCheckboxChange = (e) => {
            e.stopPropagation();  // This stops the event from propagating to the row
            handleInstanceChange(rowData.instanciasRecordatorioId, !rowData.activo);
        };

        return (
            <div style={{ display: 'flex', flexDirection: 'row', gap: '10px', alignItems: 'center' }}>
                {activeCheckbox === rowData.instanciasRecordatorioId ?
                    <div className="checkbox-loader-container">
                        <div className="small-spinner" />
                    </div> :
                    <Checkbox onChange={handleCheckboxChange} checked={!rowData.activo}></Checkbox>
                }
                <span>{`${getSpanishDayOfWeek(fecha)}, ${`${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`}`}</span>
            </div>

        );
    };
    const recordatorioBodyTemplate = (rowData) => {
        return (
            <div>
                {rowData.recordatorio.descripcion}
            </div>
        );
    };
    const tablaConexionBodyTemplate = (rowData) => {
        let displayText = '';

        // Check if tablaConexion is "usuario" and perform the lookup
        if (rowData.recordatorio.tablaConexion === 'usuario') {
            const usuario = usuarios.find(u => u.idUsuario === rowData.recordatorio.idConexion);
            if (usuario) {
                displayText = `${usuario.nombre} ${usuario.apellido}`;
            } else {
                displayText = `Usuario N° ${rowData.recordatorio.idConexion}`;
            }
        } else if (rowData.recordatorio.tablaConexion === 'acciontercero') {
            displayText = `Acción a terceros N° ${rowData.recordatorio.idConexion}`;
        } else {
            displayText = `${rowData.recordatorio.tablaConexion?.charAt(0).toUpperCase() + rowData.recordatorio.tablaConexion?.slice(1)} N° ${rowData.recordatorio.idConexion}`;
        }

        return (
            <div>
                <strong>{displayText}</strong>
            </div>
        );
    };
    const onRowSelect = (event) => {
        props.onSelect(event.data.recordatorio.recordatorioId);
    }; // maneja la selección de la fila: ESPECIFICO

    const formatDateForFilter = (date, isEndDate = false) => {
        if (isEndDate) {
            // Set the time to 23:59:59 for the end date
            const endOfDayDate = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1,);
            return format(endOfDayDate, 'yyyy-MM-dd');
        } else {
            // For start date, just format the date without time
            return format(date, 'yyyy-MM-dd');
        }
    };

    useEffect(() => {
        const formattedStart = formatDateForFilter(visibleStart);
        const formattedEnd = formatDateForFilter(visibleEnd, true); // Pass true for end date
        setFilters({
            ...filters,
            fecha: {
                operator: FilterOperator.AND,
                constraints: [
                    { value: formattedStart, matchMode: FilterMatchMode.GREATER_THAN_OR_EQUAL_TO },
                    { value: formattedEnd, matchMode: FilterMatchMode.LESS_THAN_OR_EQUAL_TO }
                ]
            }
        });
    }, [visibleStart, visibleEnd]);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }} >
            <Toast ref={toast}></Toast>
            <ConfirmPopup />
            <div className="recordatorios-chart-container">
                <div className="recordatorios-chart-title">
                    <label>Resumen semanal</label>
                    <span>{formatSemanaActual()}</span>
                </div>
                <ResponsiveContainer width="100%" height={120}>
                    <AreaChart
                        width={500}
                        height={400}
                        data={chartDataETL}
                        margin={{
                            top: 0,
                            right: 50,
                            left: 0,
                            bottom: 20,
                        }}
                        onClick={(event) => {
                            if (event && event.activePayload) {
                                const activeIndex = event.activeTooltipIndex;
                                const activeData = chartDataETL[activeIndex];
                                handleChartClick(activeData, activeIndex);
                            }
                        }}
                    >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="fecha" tick={<CustomXAxisTick />} />
                        <YAxis domain={[0, 4]} tick={<CustomYAxisTick />} tickFormatter={formatYAxis} />
                        <Tooltip content={<CustomTooltip />} />
                        <Area type="linear" dataKey="count" stroke="#009eac" fill="#1CC9CF" />
                    </AreaChart>
                </ResponsiveContainer>
                <div className="recordatorios-chart-footer">
                    <button className="form-accept-btn recordatorios-chart-btns" onClick={() => changeWeek('backward')}>
                        <i className='pi pi-arrow-circle-left'></i>
                    </button>
                    <button className="form-accept-btn recordatorios-chart-btns"
                        onClick={() => {
                            setVisibleStart(startOfCurrentWeek);
                            setVisibleEnd(endOfCurrentWeek);
                            const formattedStart = formatDateForFilter(startOfCurrentWeek);
                            const formattedEnd = formatDateForFilter(endOfCurrentWeek);
                            setFilters({
                                ...filters,
                                fecha: {
                                    operator: FilterOperator.AND,
                                    constraints: [
                                        { value: formattedStart, matchMode: FilterMatchMode.GREATER_THAN_OR_EQUAL_TO },
                                        { value: formattedEnd, matchMode: FilterMatchMode.LESS_THAN_OR_EQUAL_TO }
                                    ]
                                }
                            });
                        }}>
                        Semana actual
                    </button>
                    <button className="form-accept-btn recordatorios-chart-btns" onClick={() => changeWeek('forward')}>
                        <i className='pi pi-arrow-circle-right'></i>
                    </button>
                </div>
            </div>
            <div className="tabla tabla-documentos">
                {(isLoading || isDeleting || (isRefreshing && isValidating)) &&
                    <div className="spinner-container">
                        <div className="spinner" />
                    </div>
                }
                <DataTable
                    value={instanciasRecordatorios}
                    header={header}
                    removableSort
                    scrollable
                    scrollHeight="35vh"
                    size="small"
                    emptyMessage={`No se encontraron recordatorios `}
                    dataKey="instanciasRecordatorioId"
                    selectionMode="single"
                    sortField="fecha"
                    sortOrder={1}
                    paginator
                    rows={25}
                    rowsPerPageOptions={[5, 10, 25, 50]}
                    filters={filters}
                    globalFilterFields={['fecha', 'recordatorio.descripcion', 'recordatorio.tablaConexion', 'recordatorio.idConexion']}
                    onRowSelect={onRowSelect}
                    metaKeySelection={false}
                    stateStorage="session"
                    stateKey="recordatorios-table-state">
                    <Column
                        style={{ minWidth: '230px' }}
                        body={fechaBodyTemplate}
                        header="Fecha"
                        field="fecha"
                        sortable
                    />
                    <Column
                        body={recordatorioBodyTemplate}
                        header="Recordatorio"
                    />
                    <Column
                        body={tablaConexionBodyTemplate}
                        header="Origen del recordatorio"
                        filterClear={filterClearTemplate}
                        filterApply={filterApplyTemplate}
                    />
                    <Column body={actionsTemplate} header="Acciones"></Column>
                </DataTable>
            </div>
        </div>
    );
}

export default InstanciasChart;