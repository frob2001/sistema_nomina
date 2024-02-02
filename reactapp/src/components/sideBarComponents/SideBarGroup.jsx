import React, { useState, useEffect, useContext } from "react";
import Icon from './Icons';
import SideBarItems from './SideBarItems';
import { useSelector } from 'react-redux';
import { Badge } from 'primereact/badge';
import pagesContext from '../../context/pagesContext';

// This component groups icons sidebar categories and puts the title of the category

function SideBarGroup(props) {

    const isExpanded = useSelector(state => state.sidebar.isExpanded);

    // --- Hooks ----
    const { onChildEvent } = props; // Communication with the SideBar
    const [isActive, setIsActive] = useState(props.isActive);
    const { pages } = useContext(pagesContext);
    const [showBadge, setShowBadge] = useState(false);

    useEffect(() => {
        setIsActive(props.isActive); // Refreshes the active state with the prop value when it changes
    }, [props.isActive]); // Listens to changes in the active state and the expanded state

    useEffect(() => {
        if (!isExpanded) {
            setIsActive(false);
        }
    }, [isExpanded]);

    // ---- Inner functions ----
    const toggleActiveState = () => {
        setIsActive(!isActive); // Toggle the isActive state locally
        onChildEvent(props.index, !isActive); // Sends to the parent the index of the superitem and the state it changed to
    }; // Handles the click of the white part of the super item

    const getIconName = () => {
        switch (props.nameSuperItem) {
            case "trabajadores":
                return "faUsers";
            case "usuarios":
                return "faCircleUser";
            case "movimientos":
                return "faArrowRightArrowLeft";
            case "rolpagos":
                return "faMoneyBill";
            case "gestion":
                return "faSliders";
            default:
                return "faRegistered";
        }
    }; // Maps the correct icon depending on the name of the super item

    const setActiveBadge = () => {

        let shouldShowBadge = false;
        switch (props.nameSuperItem) {
            case "marcas":
                shouldShowBadge = pages.hasOwnProperty("Marcas") || pages.hasOwnProperty("Acciones a terceros");
                break;
            case "patentes":
                shouldShowBadge = pages.hasOwnProperty("Patentes") || pages.hasOwnProperty("Inventores");
                break;
            case "general":
                shouldShowBadge = pages.hasOwnProperty("Clientes") || pages.hasOwnProperty("Gacetas") || pages.hasOwnProperty("Propietarios");
                break;
            case "regulatorio":
                shouldShowBadge = pages.hasOwnProperty("Regulatorio");
                break;
            case "infracciones":
                shouldShowBadge = pages.hasOwnProperty("Infracciones");
                break;
            case "administracion":
                shouldShowBadge = pages.hasOwnProperty("Abogados") || pages.hasOwnProperty("Clases") || pages.hasOwnProperty("Estados");
                break;
            case "recordatorios":
                shouldShowBadge = pages.hasOwnProperty("Recordatorios");
                break;
            case "gestion":
                shouldShowBadge = pages.hasOwnProperty("Gestión clientes") || pages.hasOwnProperty("Gestión general") || pages.hasOwnProperty("Gestión infracciones") || pages.hasOwnProperty("Gestión marcas") || pages.hasOwnProperty("Gestión patentes") || pages.hasOwnProperty("Gestión regulatorio");
                break;
            default:
                shouldShowBadge = false;
                break;
        }
        setShowBadge(shouldShowBadge);
    }

    useEffect(() => {
        setActiveBadge();
    }, [pages])

    return (
        <div className="group-container" style={{ width: isExpanded ? '10rem' : '0', margin: props.nameSuperItem === "marcas" && '20px 0' }}> {/* Con esta condición, el margen de marcas disminuye, el resto se queda*/}
            <div className={`group-card ${isExpanded && (isActive ? 'card-active' : 'card-inactive')}`} style={{ width: isExpanded ? '10rem' : '0' }} onClick={toggleActiveState}>
                <Icon iconName={getIconName()} active={isActive} />
                {isExpanded &&
                    <div className='group-card-textbadge'>
                        <p className="group-card-text" style={{ color: isActive ? '#2D3748' : '#a0aec0' }}>{props.text}</p>
                        {(showBadge && isActive) && <Badge severity="info" style={{ backgroundColor: '#1cc9cf', minHeight: '6px', height: '6px', minWidth: '6px', width: '6px', borderRadius: '3px', boxShadow: '0px 0px 3px 1px rgb(32, 231, 238, 0.9)' }}></Badge>}
                    </div>
                }
            </div>
            <div className="sub-items">
                {isActive ? <SideBarItems subItems={props.subItems} /> : null}
            </div>
        </div>
    );
}


export default SideBarGroup;