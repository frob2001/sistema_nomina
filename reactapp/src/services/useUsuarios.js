import useSWR from 'swr';

const useUsuarios = () => {

    const apiEndpoint = import.meta.env.VITE_MAIN_ENDPOINT;
    const API_BASE_URL = `${apiEndpoint}/Usuario`;

    const fetcher = async (url) => {
        const res = await fetch(url, {
            headers: {
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
            const response = await fetch(API_BASE_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(obj),
            });

            return response;

        } catch (error) {
            throw new Error("Hubo un error al ingresar el registro");
        }
    };

    const updateObject = async (id, obj) => {
        try {
            const response = await fetch(`${API_BASE_URL}/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(obj),
            });

            return response;

        } catch (error) {
            throw new Error("Hubo un error al editar el registro");
        }
    };


    const deleteObject = async (id) => {
        try {
            const response = await fetch(`${API_BASE_URL}/${id}`, {
                method: 'DELETE'
            });

            return response;

        } catch (error) {
            throw new Error("Hubo un error al eliminar el registro");
        }
    };

    return {
        data,
        isLoading,
        error,
        isValidating,
        refresh: mutate,
        createObject,
        updateObject,
        deleteObject,
    };
};

export { useUsuarios }; 
