import React, { useRef, useState, useEffect } from 'react';
import { Toast } from 'primereact/toast';
import { Dropdown } from 'primereact/dropdown';
import { Button } from 'primereact/button';

// Auth
import { kc } from '../../context/authContext';
import { useGestionService } from '../../services/useGestionService';
import { useUsers } from '../../services/useUsers';
import { useSelector, useDispatch } from 'react-redux';
import { loggin } from '../../context/userSlice'; 

const apiEndpoint = import.meta.env.VITE_MAIN_ENDPOINT;
const loginUrl = `${apiEndpoint}/Usuario/login`; 

function LoginPage() {

    // --------------- Setup (Servicios, Contextos, Referencias) -----------------------------------

    const toast = useRef(null);
    const [loginObject, setLoginObject] = useState({});
    const [selectedEmisor, setSelectedEmisor] = useState(null);
    const [selectedSucursal, setSelectedSucursal] = useState(null);
    const [isRefreshing, setIsRefreshing] = useState(false); // Para los dropdowns

    const { data: emisores, error: errorE, isLoading: isLoadingE, isValidating: isValidatingE, refresh: refreshE } = useGestionService('Emisor'); 
    const { data: sucursales, error: errorS, isLoading: isLoadingS, isValidating: isValidatingS, refresh: refreshS } = useGestionService('Sucursal'); 
    const dispatch = useDispatch();

    // --------------- Funciones especificas del componente ------------------------------------------

    const handleLogin = (e) => {
        e.preventDefault();
        kc.login();
    };

    const validateRequiredFields = () => {
        return isEmptyValue(loginObject.correoElectronico) || isEmptyValue(loginObject.contrasena);
    };

    const isEmptyValue = value => {
        if (value === null || value === undefined) return true;
        if (typeof value === 'string') return value.trim() === '';
        if (typeof value === 'number') return isNaN(value) || value === 0;
        if (Array.isArray(value)) return value.length === 0;
        return false;
    }; // Verifica si un valor específico está vacío

    const handleOtherLogin = async (e) => {
        e.preventDefault();

        // Verificar si existe algun campo requerido vacío
        const anyFieldEmpty = validateRequiredFields(loginObject);

        if (!selectedSucursal || !selectedEmisor || anyFieldEmpty) {
            toast.current.show({
                severity: 'warn',
                summary: 'Alerta',
                detail: 'Porfavor ingresa todos los campos',
                life: 3000,
            });
            return;
        }

        try {
            const response = await fetch(loginUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...loginObject,
                    emisorId: selectedEmisor.emisorId, // Assuming selectedEmisor and selectedSucursal have an id field
                    sucursalId: selectedSucursal.sucursalId
                }),
            });

            if (!response.ok) {
                if (response.status === 404) {
                    throw new Error('El correo no existe');
                }
                if (response.status === 400) {
                    throw new Error('Credenciales incorrectas');
                }
                throw new Error('Error en la solicitud de login');
            }

            if (response.status === 201) {
                toast.current.show({
                    severity: 'success',
                    summary: 'Login exitoso',
                    detail: 'Has ingresado correctamente.',
                    life: 3000,
                });
            }

            dispatch(loggin());

        } catch (error) {
            // Handle error
            toast.current.show({
                severity: 'error',
                summary: 'Error en el login',
                detail: error.message || 'Un error ha ocurrido',
                life: 3000,
            });
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setLoginObject(prev => ({ ...prev, [name]: value }));

    }; // Maneja el cambio en un input: ESPECIFICO

    // ------------------ Dropdowns normales ---------------------------------------

    const refreshData = (e) => {
        e.preventDefault();
        setIsRefreshing(true);
        refreshE(); 
        refreshS(); 
    }; 

    useEffect(() => {
        if (isRefreshing) {
            setIsRefreshing(false);
        }
    }, [isValidatingE, isValidatingS]); // Cambia el estado de refreshing: GENERAL

    const optionTemplate = (option) => {
        return (
            <div className="dropdown-item-container">
                <span>{option.nombre}</span>
            </div>
        );
    };

    const selectedValueTemplate = (option, props) => {
        if (option) {
            return (
                <div className="dropdown-item-container">
                    <span>{option.nombre}</span>
                </div>
            );
        }

        return <span>{props.placeholder}</span>;
    }; 


    // -----------------------------------------------------------------------------------------------

    return (
        <>
            <Toast ref={toast} />
            <div className="login-container">
                <div className="login-form-space">
                    <div className="login-form">
                        <h2>INICIAR SESIÓN</h2>
                        <p>Haga clic en <strong>INICIAR</strong> para ingresar con sus credenciales, o <strong>INICIA CON KEYCLOAK</strong></p>
                        <div className="form-group">
                            <label>Emisor <small className="requiredAsterisk">(Obligatorio)</small></label>
                            <div>
                                {
                                    errorE || !emisores ? (
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
                                            style={{ width: '100%' }}
                                            value={selectedEmisor}
                                            onChange={(e) => setSelectedEmisor(e.value)}
                                            options={emisores}
                                            optionLabel="nombre"
                                            placeholder="Selecciona un emisor"
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
                            <label>Sucursal <small className="requiredAsterisk">(Obligatorio)</small></label>
                            <div>
                                {
                                    errorS || !sucursales ? (
                                        <div className="dropdown-error">
                                            <div className="dropdown-error-msg">
                                                {isLoadingS || (isRefreshing && isValidatingS) ?
                                                    <div className="small-spinner" /> :
                                                    <span>Ocurrió un error: sin opciones disponibles</span>}
                                            </div>
                                            <Button className="rounded-icon-btn" onClick={refreshData}>
                                                <i className="pi pi-refresh" style={{ fontSize: '0.8rem', margin: '0' }}></i>
                                            </Button>
                                        </div>
                                    ) : (
                                        <Dropdown
                                            style={{ width: '100%' }}
                                            value={selectedSucursal}
                                            onChange={(e) => setSelectedSucursal(e.value)}
                                            options={sucursales}
                                            optionLabel="nombre"
                                            placeholder="Selecciona una sucursal"
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
                            <label>Correo electrónico <small className="requiredAsterisk">(Obligatorio)</small></label>
                            <input type="email" name="correoElectronico" value={loginObject?.correoElectronico || ''} onChange={handleInputChange} required maxLength="100" />
                        </div>
                        <div className="form-group">
                            <label>Contraseña <small className="requiredAsterisk">(Obligatorio)</small></label>
                            <input type="password" name="contrasena" value={loginObject?.contrasena || ''} onChange={handleInputChange} required maxLength="100" />
                        </div>
                        <div style={{ width: '60%' }} className="login-form-btnspace">
                            <button onClick={(e) => handleOtherLogin(e)} style={{ width: '100%', marginTop: '20px' }} className="form-accept-btn">INICIAR</button>
                        </div>
                        <hr style={{color: 'var(--neutral-gray)', width: '100%'}}></hr>
                        <div style={{ width: '60%' }} className="login-form-btnspace">
                            <button onClick={(e) => handleLogin(e)} style={{ width: '100%' }} className="form-accept-btn">INICIAR CON KEYCLOAK</button>
                        </div>
                    </div>
                </div>
                <div className="login-branding-space">
                    <div className="login-branding">
                        <h1>Bienvenido</h1>
                    </div>
                </div>
            </div>
        </>
    );
}

export default LoginPage;