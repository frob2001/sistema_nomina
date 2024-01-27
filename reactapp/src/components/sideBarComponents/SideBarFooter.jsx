import React, { useContext } from "react";
import { useSelector } from 'react-redux';
import { AuthContext, kc } from '../../context/authContext';


// This component groups icons sidebar categories and puts the title of the category

function SideBarFooter() {

    // ---------------- KeyCloak -------------------

    const { isAuthenticated, userProfile } = useContext(AuthContext);

    function extractInitials() {
        const firstNameInitial = userProfile?.firstName.charAt(0);
        const lastNameInitial = userProfile?.lastName.charAt(0);

        return `${firstNameInitial}${lastNameInitial}`.toUpperCase();
    }

    const initials = extractInitials();

    // --- Hooks ----
    const isExpanded = useSelector(state => state.sidebar.isExpanded);

    return (
        <div className="footer-container">
            <div className="circulo-siglas">
                <span>{userProfile?.firstName === undefined ? 'GN' : initials}</span>
            </div>
            {isExpanded && <label>{userProfile?.firstName || 'Bienvenido'} {userProfile?.lastName || ''}</label>}
        </div>
    );
}


export default SideBarFooter;