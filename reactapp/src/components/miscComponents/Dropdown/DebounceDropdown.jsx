import React, { useState, useEffect, useRef } from 'react';
import { Dropdown } from 'primereact/dropdown';
import { useDebounce } from 'primereact/hooks';

// Services
const apiEndpoint = import.meta.env.VITE_MAIN_ENDPOINT;

// Auth
import { useMsal } from '@azure/msal-react';

function DebounceDropdown({ endpoint, optionLabel, showClear, setter, selectedObject, filterBy, className, disabled, onValueChange }) {

    const { instance, accounts } = useMsal();
    const [selectedItem, setSelectedItem] = useState(selectedObject);
    const [options, setOptions] = useState([{isPlaceholder: true, nombre: 'Buscando opciones'}]);
    const [loading, setLoading] = useState(false);
    const [fetchTrigger, setFetchTrigger] = useState(false);
    const dropdownRef = useRef(null);

    const [inputValue, debouncedValue, setInputValue] = useDebounce('', 1500); // Este tiempo se puede ajustar.

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


    useEffect(() => {

        if (debouncedValue.trim().length === 0 ) {
            setOptions([{ isPlaceholder: true, nombre: 'Buscando opciones' }]);
            setLoading(false);
            return;
        }

        const API_BASE_URL = `${apiEndpoint}/${endpoint}/Buscar?DropdownSearch=${debouncedValue}`; 

        // Define an async function inside the useEffect
        const fetchData = async () => {
            try {
                setLoading(true);
                const accessToken = await getAccessToken();
                const res = await fetch(API_BASE_URL, {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                        'Content-Type': 'application/json'
                    }
                });

                if (!res.ok) {
                    if (res.status === 404) {
                        throw new Error("Recurso no encontrado");
                    }
                    throw new Error("Hubo un problema con el servidor, intenta de nuevo");
                }

                const fetchedData = await res.json();

                if (fetchedData.length > 0) {
                    setOptions(fetchedData);
                }

            } catch (error) {
                setOptions([{ isPlaceholder: true, nombre: 'Hubo un problema al recuperar los datos, intenta de nuevo' }]);
            } finally {
                setLoading(false);
            }
        };

        // Call the async function
        fetchData();
    }, [debouncedValue, fetchTrigger]);

    const itemTemplate = (option) => {

        if (option.isPlaceholder) {
            return <span>{option.nombre}</span>;
        }

        switch (endpoint) {
            case 'Clientes':
                return <span><strong>{option.clienteId}</strong> - {option.nombre}</span>;
            case 'Inventores':
                return <span><strong>{option.inventorId}</strong> - {option.nombre} {option.apellido}</span>;
            case 'Propietarios':
                return <span><strong>{option.propietarioId}</strong> - {option.nombre}</span>;
            case 'Marcas':
                return <span><strong>{option.marcaId}</strong> - {option.signo}</span>;
            case 'Caso':
                return <span>{option.numeroCasoInfraccion}</span>;
            default:
                return <span>{option.nombre}</span>;
        }
    };

    const selectedValueTemplate = (option, props) => {

        if (option) {
            if (option.isPlaceholder) {
                return <span>{option.nombre}</span>;
            }
            switch (endpoint) {
                case 'Clientes':
                    return <span><strong>{option.clienteId}</strong> - {option.nombre}</span>;
                case 'Inventores':
                    return <span><strong>{option.inventorId}</strong> - {option.nombre} {option.apellido}</span>;
                case 'Propietarios':
                    return <span><strong>{option.propietarioId}</strong> - {option.nombre}</span>;
                case 'Marcas':
                    return <span><strong>{option.marcaId}</strong> - {option.signo}</span>;
                case 'Caso':
                    return <span>{option.numeroCasoInfraccion}</span>;
                default:
                    return <span>{option.nombre}</span>;
            }
        }

        return <span>{props.placeholder}</span>;
    }; 

    useEffect(() => {
        if (selectedObject) {
            setOptions([selectedObject]);
            setSelectedItem(selectedObject);
        } else {
            setOptions([{ isPlaceholder: true, nombre: 'Buscando opciones' }]);
            setSelectedItem(null);
        }
    }, [selectedObject]);


    return (
        <div className={`${loading && 'debouncedropdown'}`}>
            <Dropdown
                ref={dropdownRef}
                disabled={disabled}
                className={className}
                showClear={showClear ? true : false}
                style={{ width: '100%' }}
                value={selectedItem}
                onChange={(e) => {
                    if (e.value && !e.value.isPlaceholder) {
                        setSelectedItem(e.value);
                        if (setter) {
                            setter(e.value);
                        }
                    } else {
                        setSelectedItem(null);
                        if (setter) {
                            setter(null);
                        }
                    }
                    if (onValueChange) {
                        onValueChange(); // Call the callback without passing value
                    }
                }}
                options={options}
                optionLabel={optionLabel}
                placeholder="Selecciona un registro"
                filter
                filterBy={filterBy}
                virtualScrollerOptions={{ itemSize: 38 }}
                onFilter={(e) => {
                    if (e.filter.length < inputValue.length) { 
                        setInputValue(e.filter);
                        setFetchTrigger(!fetchTrigger);
                    } else {
                        setInputValue(e.filter);
                    }
                }}
                itemTemplate={itemTemplate}
                valueTemplate={selectedValueTemplate}
                appendTo="self"
            />
        </div>
    )
}

export default DebounceDropdown

