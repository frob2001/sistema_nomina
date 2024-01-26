import React, { useState, useEffect } from 'react';
import useSWR from 'swr';
const apiEndpoint = import.meta.env.VITE_MAIN_ENDPOINT;
const API_BASE_URL = `${apiEndpoint}/InstanciasRecordatorios/Usuario`;

// Auth
import { useMsal } from '@azure/msal-react';

const useInstanciasRecordatorios = () => {

    // Auth
    const { instance, accounts } = useMsal();
    const [emptyReminders, setEmptyReminders] = useState(false);

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

        const data = await res.json();

        if (data.hasOwnProperty('message')) {
            setEmptyReminders(true);
            return [];
        } else {
            setEmptyReminders(false);
        }

        return data;
    };


    const userData = sessionStorage.getItem('userData');
    let userId;

    if (userData) {
        const parsedData = JSON.parse(userData);
        userId = parsedData.idUsuario;
    } else {
        console.error('User data not found in sessionStorage');
        userId = null; 
    }

    const { data, error, isValidating, isLoading, mutate } = useSWR(userId ? `${API_BASE_URL}/${userId}` : null, fetcher, {
        errorRetryInterval: 10000,
    });

    return {
        instanciasRecordatorios: data,
        isLoading,
        error,
        isValidating,
        refresh: mutate,
        emptyReminders
    };
};

export { useInstanciasRecordatorios };