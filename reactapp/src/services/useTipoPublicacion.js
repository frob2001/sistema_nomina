import useSWR from 'swr';
const apiEndpoint = import.meta.env.VITE_MAIN_ENDPOINT;
const API_BASE_URL = `${apiEndpoint}/TipoPublicaciones`; // Editar

// Auth
import { useMsal } from '@azure/msal-react';

const useTipoPublicacion = () => { // editar

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

    const fetcher = async (url) => {
        const accessToken = await getAccessToken();
        const res = await fetch(url, {
            headers: {
                Authorization: `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            }
        });

        if (!res.ok) {
            if (res.status === 404) {
                throw new Error("Recurso no encontrado");
            }
            throw new Error("Hubo un problema con el servidor, intenta de nuevo");
        }

        return res.json();
    };

    const { data, error, isValidating, isLoading, mutate } = useSWR(API_BASE_URL, fetcher, {
        errorRetryInterval: 10000,
    });

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
                mutate();
            }

            return response.status;

        } catch (error) {
            throw new Error("Hubo un error al ingresar el registro");
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

            if (response.status === 204) {
                mutate();
            }

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

            if (response.status === 204) {
                mutate();
            }

            return response.status;

        } catch (error) {
            throw new Error("Hubo un error al eliminar el registro");
        }
    };

    return {
        tiposPublicaciones: data, // Editar
        isLoading,
        error,
        isValidating,
        refresh: mutate,
        createObject,
        updateObject,
        deleteObject,
    };
};

export { useTipoPublicacion }; // Editar
