import { useCallback } from 'react';
import { useMsal } from '@azure/msal-react';
const apiEndpoint = import.meta.env.VITE_MAIN_ENDPOINT;

const useLogos = () => {

    // Auth
    const { instance, accounts } = useMsal();
    const account = accounts[0];

    const getAccessToken = async () => {
        try {
            const accessTokenRequest = {
                scopes: ["api://corralrosales.com/kattion/tasks.write", "api://corralrosales.com/kattion/tasks.read"], // Para leer y escribir tareas
                account: accounts[0],
            };
            const response = await instance.acquireTokenSilent(accessTokenRequest);
            return response.accessToken;
        } catch (e) {
            // Handle token acquisition errors
            console.error(e);
            return null;
        }
    };

    const uploadLogo = useCallback(async (logoURL, MarcaId) => {
        const API_BASE_URL = `${apiEndpoint}/ConexionLogo`;

        try {
            const accessToken = await getAccessToken();

            // Convert objectURL to Blob
            const responseBlob = await fetch(logoURL);
            const logoBlob = await responseBlob.blob();

            // Create FormData
            const formData = new FormData();
            formData.append('MarcaId', MarcaId);
            formData.append('Archivo', logoBlob, `logo_marca_${MarcaId}.png`); // 'logo.png' is a placeholder filename

            const response = await fetch(API_BASE_URL, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
                body: formData,
            });

            if (!response.ok) {
                // ... existing error handling ...
            }

            return await response.json();
        } catch (error) {
            throw new Error(error);
        }
    }, []);

    return {
        uploadLogo,
    };
};

export { useLogos };
