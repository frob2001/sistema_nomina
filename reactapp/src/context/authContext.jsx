import React, { createContext, useState, useEffect } from 'react';
import Keycloak from 'keycloak-js';

export const AuthContext = createContext();

let initOptions = {
    url: 'http://localhost:8080/',
    // url: 'https://18.234.125.199:8443/',
    realm: 'sso',
    clientId: 'Nomina_react_app',
}

let kc = new Keycloak(initOptions);

export const AuthProvider = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [userProfile, setUserProfile] = useState(null);

    useEffect(() => {
        kc.init({
            onLoad: 'check-sso',
            checkLoginIframe: true,
            pkceMethod: 'S256'
        }).then((authenticated) => {
            setIsAuthenticated(authenticated);
            if (authenticated) {
                kc.loadUserProfile().then(profile => {
                    setUserProfile(profile);
                });
            }
        });

        // Polling every 2 seconds to check if the user is still authenticated
        const intervalId = setInterval(() => {
            kc.updateToken(5).then((refreshed) => {
                if (refreshed) {
                    console.log('Token was successfully refreshed');
                } else {
                    console.log('Token is still valid');
                }
            }).catch(() => {
                console.error('Failed to refresh the token, or the session has expired');
                setIsAuthenticated(false);
            });
        }, 2000);

        // Cleanup interval on component unmount
        return () => clearInterval(intervalId);
    }, []);

    return (
        <AuthContext.Provider value={{ isAuthenticated, userProfile }}>
            {children}
        </AuthContext.Provider>
    );
};

export { kc };
