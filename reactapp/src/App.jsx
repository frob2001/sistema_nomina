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
import AbogadosPage from './components/administracionComponents/Abogados/AbogadosPage';
import ClasesPage from './components/administracionComponents/Clases/ClasesPage';
import EstadosPage from './components/administracionComponents/Estados/EstadosPage';
import ClientesPage from './components/generalComponents/Clientes/ClientesPage';
import GacetasPage from './components/generalComponents/Gacetas/GacetasPage';
import PropietariosPage from './components/generalComponents/Propietarios/PropietariosPage';
import InventoresPage from './components/patentesComponents/Inventores/InventoresPage';
import GestionClientesPage from './components/gestionComponents/GestionClientes/GestionClientesPage';
import GestionGeneralPage from './components/gestionComponents/GestionGeneral/GestionGeneralPage';
import GestionPatentesPage from './components/gestionComponents/GestionPatentes/GestionPatentesPage';
import PatentesPage from './components/patentesComponents/Patentes/PatentesPage';
import GestionRegulatorioPage from './components/gestionComponents/GestionRegulatorio/GestionRegulatorioPage';
import GestionMarcasPage from './components/gestionComponents/GestionMarcas/GestionMarcasPage';
import GestionInfraccionesPage from './components/gestionComponents/GestionInfracciones/GestionInfraccionesPage';
import RecordatoriosPage from './components/recordatoriosComponents/RecordatoriosPage';
import MarcasPage from './components/marcasComponents/Marcas/MarcasPage';
import InfraccionesPage from './components/infraccionesComponents/Infracciones/InfraccionesPage';
import RegulatorioPage from './components/regulatorioComponents/Regulatorio/RegulatoriosPage';
import AccionesPage from './components/marcasComponents/Acciones/AccionesPage';

/* Importación de contextos */
import pagesContext from './context/pagesContext';

// Auth
import { useMsal } from '@azure/msal-react';
import { useUsuarios } from './services/useUsuarios';


const App = () => {

    // --------------- Authentication settings -------------------------------------------------------

    const { instance } = useMsal();
    const { accounts } = useMsal();
    const account = accounts[0];

    const { createObject } = useUsuarios();

    // --------------- Setup (Servicios, Contextos, Referencias) -----------------------------------

    const { pages } = useContext(pagesContext);
    const dispatch = useDispatch();
    const isExpanded = useSelector(state => state.sidebar.isExpanded);

    useEffect(() => {
        window.addEventListener('beforeunload', () => sessionStorage.clear());
        // Optional: Remove event listener on component unmount
        return () => window.removeEventListener('beforeunload', () => sessionStorage.clear());
    }, []); 

    function extractNames(fullName) {
        const nameParts = fullName.split(' ');
        if (nameParts.length >= 2) {
            return nameParts;
        }
        return '';
    }

    useEffect(() => {
        const name = account?.idTokenClaims?.name;
        const email = account?.username;
        const nombreCompleto = extractNames(name);
        const usuario = {
            correo: email,
            nombre: nombreCompleto[0],
            apellido: nombreCompleto[1],
        }
        createObject(usuario);
    }, []) // Realiza el POST a Usuarios para crear el registro de usuario en la tabla Usuariosy recuperar el idUsuario

    const toggleSidebar = () => {
        dispatch(toggleExpansion());
    };

    const cerrarSesion = () => instance.logout();

    return (
        <div className="app-container">
            <div className="app-header">
                <div className="app-header-group">
                    <button onClick={toggleSidebar} className="burger-menu">
                        <FontAwesomeIcon icon={faBars} style={{ color: 'white' }} />
                    </button>
                    <h6 className="logo-principal">KATTION</h6>
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
                        <TabBar/>
                    </div>
                    <div className="app-pages-space">
                        {Object.keys(pages).length === 0 ? (
                            <EmptyPage />
                        ) : (
                            <>
                                {pages['Abogados'] && <AbogadosPage />}
                                {pages['Clases'] && <ClasesPage />}
                                {pages['Estados'] && <EstadosPage />}
                                {pages['Clientes'] && <ClientesPage />}
                                {pages['Gacetas'] && <GacetasPage />}
                                {pages['Propietarios'] && <PropietariosPage />}
                                {pages['Inventores'] && <InventoresPage />}
                                {pages['Gestión clientes'] && <GestionClientesPage />}
                                {pages['Gestión general'] && <GestionGeneralPage />}
                                {pages['Gestión patentes'] && <GestionPatentesPage />}
                                {pages['Patentes'] && <PatentesPage />}
                                {pages['Gestión regulatorio'] && <GestionRegulatorioPage />}
                                {pages['Gestión marcas'] && <GestionMarcasPage />}
                                {pages['Gestión infracciones'] && <GestionInfraccionesPage />}
                                {pages['Recordatorios'] && <RecordatoriosPage />}
                                {pages['Marcas'] && <MarcasPage />}
                                {pages['Infracciones'] && <InfraccionesPage />}
                                {pages['Regulatorio'] && <RegulatorioPage />}
                                {pages['Acciones a terceros'] && <AccionesPage />}
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default App;
