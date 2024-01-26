const apiEndpoint = import.meta.env.VITE_MAIN_ENDPOINT;
const API_BASE_URL = `${apiEndpoint}/Caso`;

// Auth
import { useMsal } from '@azure/msal-react';

const useCasos = () => {

    // Auth
    const { instance, accounts } = useMsal();

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

    const createObject = async (obj) => {
        try {
            const accessToken = await getAccessToken();
            const response = await fetch(API_BASE_URL, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(obj),
            });

            if (response.status === 201) {
                const data = await response.json(); // Response body
                return { status: response.status, data }; 
            } else {
                return { status: response.status }; 
            }
            

        } catch (error) {
            throw new Error("Hubo un error al ingresar el registro" + error);
        }
    };

    const updateObject = async (id, obj) => {
        try {
            const accessToken = await getAccessToken();
            const response = await fetch(`${API_BASE_URL}/${id}`, {
                method: 'PUT',
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(obj),
            });

            return response.status;

        } catch (error) {
            throw new Error("Hubo un error al editar el registro");
        }
    };


    const deleteObject = async (id) => {
        try {
            const accessToken = await getAccessToken();
            const response = await fetch(`${API_BASE_URL}/${id}`, {
                method: 'DELETE',
                headers: {
                    Authorization: `Bearer ${accessToken}`
                },
            });

            return response.status;

        } catch (error) {
            throw new Error("Hubo un error al eliminar el registro");
        }
    };

    return {
        createObject,
        updateObject,
        deleteObject,
    };
};

export { useCasos };
