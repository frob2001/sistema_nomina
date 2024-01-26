import { useCallback } from 'react';
import { useMsal } from '@azure/msal-react';
const apiEndpoint = import.meta.env.VITE_MAIN_ENDPOINT;

const useComments = () => {

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

    const uploadComment = useCallback(async (comentario, idConexion, tablaConexion) => {
        const newComentario = {
            tablaConexion: tablaConexion,
            idConexion: idConexion,
            fecha: comentario.fecha,
            titulo: comentario.titulo,
            comentario: comentario.comentario,
            usuario: account?.username
        };

        const API_BASE_URL = `${apiEndpoint}/ConexionComentario`;

        try {
            const accessToken = await getAccessToken();
            const response = await fetch(API_BASE_URL, { // Use the determined API endpoint
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${accessToken}`,
                },
                body: JSON.stringify(newComentario),
            });

            if (!response.ok) {
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
        uploadComment,
    };
};

export { useComments };
