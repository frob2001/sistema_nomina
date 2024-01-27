import React, { useContext } from "react";
import { AuthContext, kc } from '../../../context/authContext';

function EmptyPage() {

    // ---------------- KeyCloak -------------------

    const { isAuthenticated, userProfile } = useContext(AuthContext);

    return (
        <div className="empty-page-container">
            <h1 className="empty-page-logo">Sistema de gestión de nómina</h1>
            <div className="empty-page-msgspace">
                <div className="empty-page-msg">
                    <span>¡ Qué gusto tenerte de vuelta {userProfile?.firstName || ''}!</span>
                </div>
            </div>
        </div>
    );
}

export default EmptyPage;