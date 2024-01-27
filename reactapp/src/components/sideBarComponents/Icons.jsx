import React, { useState, useEffect, useContext } from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faRegistered, faLightbulb, faBook, faFlask, faExclamationTriangle, faTools, faBell, faSliders, faUsers, faCircleUser, faArrowRightArrowLeft, faMoneyBill } from '@fortawesome/free-solid-svg-icons'
import { useSelector } from 'react-redux';
import { Badge } from 'primereact/badge';
import pagesContext from '../../context/pagesContext';

// This component is in charge of the icon for the items in the sidebar

function Icon(props) {

    const isExpanded = useSelector(state => state.sidebar.isExpanded);
    const [isActive, setIsActive] = useState(props.active);
    const [showBadge, setShowBadge] = useState(false);
    const { pages } = useContext(pagesContext);

    useEffect(() => {
        setIsActive(props.active);
    }, [props.active]); // Update the isActive state whenever props.active changes

    useEffect(() => {
        if (!isExpanded) {
            setIsActive(false);
        }
    }, [isExpanded]);
 
    const getFontAwesomeIcon = () => {
        switch (props.iconName) {
            case "faUsers":
                return faUsers;
            case "faCircleUser":
                return faCircleUser;
            case "faArrowRightArrowLeft":
                return faArrowRightArrowLeft;
            case "faMoneyBill":
                return faMoneyBill;
            case "faSliders":
                return faSliders;
            default:
                return faRegistered; // Default icon if the prop is not recognized
        }
    }; 

    const setActiveBadge = () => {

        let shouldShowBadge = false;
        switch (props.iconName) {
            case "faRegistered":
                shouldShowBadge = pages.hasOwnProperty("Marcas") || pages.hasOwnProperty("Acciones a terceros");
                break;
            case "faLightbulb":
                shouldShowBadge = pages.hasOwnProperty("Patentes") || pages.hasOwnProperty("Inventores");
                break;
            case "faBook":
                shouldShowBadge = pages.hasOwnProperty("Clientes") || pages.hasOwnProperty("Gacetas") || pages.hasOwnProperty("Propietarios");
                break;
            case "faFlask":
                shouldShowBadge = pages.hasOwnProperty("Regulatorio");
                break;
            case "faExclamationTriangle":
                shouldShowBadge = pages.hasOwnProperty("Infracciones");
                break;
            case "faTools":
                shouldShowBadge = pages.hasOwnProperty("Abogados") || pages.hasOwnProperty("Clases") || pages.hasOwnProperty("Estados");
                break;
            case "faBell":
                shouldShowBadge = pages.hasOwnProperty("Recordatorios");
                break;
            case "faSliders":
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
    },[pages])

    return (
        <div className={`p-overlay-badge sidebar-icon ${isActive ? 'icon-active' : 'icon-inactive'}`}>
            <FontAwesomeIcon icon={getFontAwesomeIcon()} style={{ color: isActive ? '#ffffff' : '#2d3748', height: '0.8rem' }} />
            {(showBadge && !isActive) && <Badge severity="info" style={{ backgroundColor: '#1cc9cf', minHeight: '5px', height: '5px', minWidth: '5px', width: '5px', borderRadius: '2.5px' }}></Badge> }
        </div>
    );
}

export default Icon;