import React from "react";
import { useSelector } from 'react-redux';

import { useMsal } from '@azure/msal-react';

// This component groups icons sidebar categories and puts the title of the category

function SideBarFooter() {

    // Auth
    const { accounts } = useMsal();
    const account = accounts[0];

    // Extracting user details from idTokenClaims
    const name = account?.idTokenClaims?.name;

    function extractInitials(fullName) {
        const nameParts = fullName.split(' ');
        if (nameParts.length >= 2) {
            const firstNameInitial = nameParts[0].charAt(0);
            const lastNameInitial = nameParts[1].charAt(0);
            return `${firstNameInitial}${lastNameInitial}`.toUpperCase();
        }
        return '';
    }

    const initials = extractInitials(name);

    // --- Hooks ----
    const isExpanded = useSelector(state => state.sidebar.isExpanded);

    return (
        <div className="footer-container">
            <div className="circulo-siglas">
                <span>{initials}</span>
            </div>
            {isExpanded && <label>{name}</label>}
        </div>
    );
}


export default SideBarFooter;