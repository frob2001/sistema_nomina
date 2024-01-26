import React, { useRef } from 'react';
import { Toast } from 'primereact/toast';

// Auth
import { loginRequest } from '../../auth-config';
import { useMsal } from '@azure/msal-react';

function LoginPage() {

    // --------------- Authentication settings -------------------------------------------------------

    const { instance } = useMsal();

    // --------------- Setup (Servicios, Contextos, Referencias) -----------------------------------

    const toast = useRef(null);

    // --------------- Funciones especificas del componente ------------------------------------------

    const handleLogin = () => {
        instance
            .loginRedirect(loginRequest)
            .catch((error) => console.log(error));
    };


    // -----------------------------------------------------------------------------------------------

    return (
        <>
            <Toast ref={toast} />
            <div className="login-container">
                <div className="login-form-space">
                    <div className="login-form">
                        <h2>Iniciar Sesión</h2>
                        <p>Haga clic en <strong>INICIAR</strong> para ingresar su cuenta de Microsoft y acceder al sistema</p>
                        <div style={{ width: '60%' }} className="login-form-btnspace">
                            <button onClick={handleLogin} style={{ width: '100%', marginTop: '20px' }} className="form-accept-btn">INICIAR</button>
                        </div>
                    </div>
                </div>

                <div className="login-branding-space">
                    <div className="login-branding">
                        <h1>KATTION</h1>
                    </div>
                </div>
            </div>
        </>
    );
}

export default LoginPage;