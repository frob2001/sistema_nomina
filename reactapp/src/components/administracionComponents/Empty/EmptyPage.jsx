import React from 'react';

import { useMsal } from '@azure/msal-react';

function EmptyPage() {

    // Auth
    const { accounts } = useMsal();
    const account = accounts[0];

    const name = account?.idTokenClaims?.name;

    function extractFirstName(fullName) {
        const nameParts = fullName.split(' ');
        if (nameParts.length >= 1) {
            return nameParts[0];
        }
        return '';
    }

    const firstName = extractFirstName(name);

    return (
        <div className="empty-page-container">
            <h1 className="empty-page-logo">KATTION</h1>
            <div className="empty-page-msgspace">
                <div className="empty-page-msg">
                    <span>¡Qué gusto tenerte de vuelta {firstName}!</span>
                    <span>Para comenzar, selecciona una opción del menú</span>
                </div>
            </div>
        </div>
    );
}

export default EmptyPage;