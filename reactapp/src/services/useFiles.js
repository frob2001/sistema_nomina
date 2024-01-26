import { useCallback } from 'react';
import { useMsal } from '@azure/msal-react';
const apiEndpoint = import.meta.env.VITE_MAIN_ENDPOINT;


const useFiles = () => {

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

    const uploadFile = useCallback(async (archivo, idConexion, tablaConexion, type) => {
        const formData = new FormData();
        formData.append("TablaConexion", tablaConexion);
        formData.append("IdConexion", idConexion);
        formData.append("Fecha", new Date().toISOString().split('T')[0]); // Adjust as needed
        formData.append("Titulo", archivo.titulo); // Replace with your actual property names
        formData.append("Descripcion", archivo.descripcion); // Replace with your actual property names
        formData.append("Usuario", account?.username);
        formData.append("Archivo", archivo.file); // The actual file

        // Determine API endpoint based on the type
        const API_BASE_URL = `${apiEndpoint}/${type === 'documento' ? 'ConexionDocumento' : 'ConexionCorreo'}`;

        try {
            const accessToken = await getAccessToken();
            const response = await fetch(API_BASE_URL, { // Use the determined API endpoint
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
                body: formData,
                // Other headers are set automatically for FormData
            });

            

            if (!response.ok) {
                // Check if the response is JSON
                const contentType = response.headers.get('content-type');
                let responseData;
                if (contentType && contentType.includes('application/json')) {
                    responseData = await response.json(); // Parse response as JSON
                } else {
                    responseData = { message: await response.text() }; // Parse response as text
                }
                // If the response is not ok, use the error message from the response data
                const errorMessage = responseData.message || `HTTP error! status: ${response.status}`;
                throw new Error(errorMessage);
            }

            return await response.json();
        } catch (error) {
            throw new Error(error);
        }
    }, []);

    return {
        uploadFile,
    };
};

export { useFiles };
