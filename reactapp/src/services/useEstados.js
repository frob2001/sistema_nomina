import useSWR from 'swr';
const apiEndpoint = import.meta.env.VITE_MAIN_ENDPOINT;
const API_BASE_URL = `${apiEndpoint}/Estados`;

// Auth
import { useMsal } from '@azure/msal-react';

const useEstados = () => {

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

        let data = await res.json();

        // Ordenar los datos basándose en codigo, separando en partes numéricas
        data.sort((a, b) => {
            const partsA = a.codigo.split('.').map(Number);
            const partsB = b.codigo.split('.').map(Number);

            // Comparar la parte entera primero
            if (partsA[0] !== partsB[0]) {
                return partsA[0] - partsB[0];
            }
            // Si la parte entera es igual, comparar la parte decimal
            return partsA[1] - partsB[1];
        });

        return data;
    };



    const { data, error, isValidating, isLoading, mutate } = useSWR(API_BASE_URL, fetcher, {
        errorRetryInterval: 10000,
    });

    const createEstado = async (estadoData) => {
        try {
            const accessToken = await getAccessToken();
            const response = await fetch(API_BASE_URL, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(estadoData),
            });

            if (response.status === 201) {
                mutate();
            }

            return response.status;

        } catch (error) {
            throw new Error("Hubo un error al ingresar el estado");
        }
    };

    const updateEstado = async (estadoId, updatedData) => {
        try {
            const accessToken = await getAccessToken();
            const response = await fetch(`${API_BASE_URL}/${estadoId}`, {
                method: 'PUT',
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updatedData),
            });

            if (response.status === 204) {
                mutate();
            }

            return response.status;

        } catch (error) {
            throw new Error("Hubo un error al editar el estado");
        }
    };


    const deleteEstado = async (estadoId) => {
        try {
            const accessToken = await getAccessToken();
            const response = await fetch(`${API_BASE_URL}/${estadoId}`, {
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
            throw new Error("Hubo un error al eliminar el estado");
        }
    };

    return {
        estados: data,
        isLoading,
        error,
        isValidating,
        createEstado,
        refresh: mutate,
        updateEstado,
        deleteEstado,
    };
};

export { useEstados };
