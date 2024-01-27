import React, { useEffect, useContext } from 'react';

import './styles/componentStyles.css';
import 'bootstrap/dist/css/bootstrap.min.css';

/* Importación de redux */
import { toggleExpansion } from '../src/context/sidebarSlice'; 
import { useSelector, useDispatch } from 'react-redux';

/* Importación de componentes */
import SideBar from './components/sideBarComponents/SideBar';
import { faBars, faUser } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import TabBar from './components/tabComponents/TabBar';

/* Importación de páginas */
import EmptyPage from './components/administracionComponents/Empty/EmptyPage';
import GestionPagesSuperComponent from './components/gestionComponents/GestionesNomina/GestionPagesSuperComponent';

/* Importación de contextos */
import pagesContext from './context/pagesContext';

import { AuthContext, kc } from './context/authContext';
import LoginPage from './components/loginPageComponents/LoginPage';

const App = () => {

    const { isAuthenticated, login, logout } = useContext(AuthContext);

    // --------------- Setup (Servicios, Contextos, Referencias) -----------------------------------

    const { pages } = useContext(pagesContext);
    const dispatch = useDispatch();
    const isExpanded = useSelector(state => state.sidebar.isExpanded);
    const isLogged = useSelector(state => state.user.isLogged);

    useEffect(() => {
        window.addEventListener('beforeunload', () => sessionStorage.clear());
        // Optional: Remove event listener on component unmount
        return () => window.removeEventListener('beforeunload', () => sessionStorage.clear());
    }, []); 


    const toggleSidebar = () => {
        dispatch(toggleExpansion());
    };

    const cerrarSesion = () => {
        kc.logout({ redirectUri: 'https://localhost:5174/' });
        dispatch(logout());
    };

    return (
        <>
            {
                isAuthenticated || isLogged ? (
                    <div className="app-container">
                        <div className="app-header">
                            <div className="app-header-group">
                                <button onClick={toggleSidebar} className="burger-menu">
                                    <FontAwesomeIcon icon={faBars} style={{ color: 'white' }} />
                                </button>
                                <h6 style={{fontWeight: '400', fontSize: '14px'}} className="logo-principal">Sistema de gestión de nómina</h6>
                            </div>
                            <div onClick={cerrarSesion} className="app-header-group--logout">
                                <FontAwesomeIcon className="user-icon" icon={faUser} style={{ color: 'white', fontSize: '12px' }} />
                                <p>Cerrar sesión</p>
                            </div>

                        </div>
                        <div className="app-content" style={isExpanded ? { gridTemplateColumns: '200px auto' } : { gridTemplateColumns: '80px auto' }} >
                            <div className="app-sidebar-space" >
                                <SideBar />
                            </div>
                            <div className="app-workspace">
                                <div className="app-tabs-space">
                                    <TabBar />
                                </div>
                                <div className="app-pages-space">
                                    {Object.keys(pages).length === 0 ? (
                                        <EmptyPage />
                                    ) : (
                                        <>
                                            {pages['Compañías'] && <GestionPagesSuperComponent pageOption="companias" pageTitle="Compañías"/>}
                                            {pages['Emisores'] && <GestionPagesSuperComponent pageOption="emisores" pageTitle="Emisores" />}
                                            {pages['Sucursales'] && <GestionPagesSuperComponent pageOption="sucursales" pageTitle="Sucursales" />}
                                            {pages['Tipos de empleado'] && <GestionPagesSuperComponent pageOption="tiposEmpleado" pageTitle="Tipos de Empleado" />}
                                            {pages['Tipos de contrato'] && <GestionPagesSuperComponent pageOption="tiposContrato" pageTitle="Tipos de Contrato" />}
                                            {pages['Tipos de comisión'] && <GestionPagesSuperComponent pageOption="tiposComision" pageTitle="Tipos de Comisión" />}
                                            {pages['Tipos de cuenta'] && <GestionPagesSuperComponent pageOption="tiposCuenta" pageTitle="Tipos de Cuenta" />}
                                            {pages['Tipos de operación'] && <GestionPagesSuperComponent pageOption="tiposOperacion" pageTitle="Tipos de Operación" />}
                                            {pages['Ocupaciones'] && <GestionPagesSuperComponent pageOption="ocupaciones" pageTitle="Ocupaciones" />}
                                            {pages['Niveles salariales'] && <GestionPagesSuperComponent pageOption="nivelesSalariales" pageTitle="Niveles salariales" />}
                                            {pages['Centros de costo'] && <GestionPagesSuperComponent pageOption="centrosCosto" pageTitle="Centros de costo" />}
                                            {pages['Bancos'] && <GestionPagesSuperComponent pageOption="bancos" pageTitle="Bancos" />}
                                            {pages['Fondos de reserva'] && <GestionPagesSuperComponent pageOption="fondosReserva" pageTitle="Fondos de Reserva" />}
                                            {pages['Conceptos'] && <GestionPagesSuperComponent pageOption="conceptos" pageTitle="Conceptos" />}
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <LoginPage />
                )
            }
        </>
    )
}

export default App;
