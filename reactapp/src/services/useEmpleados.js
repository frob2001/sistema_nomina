import useSWR from 'swr';

const useEmpleados = () => { 

    const apiEndpoint = import.meta.env.VITE_MAIN_ENDPOINT;
    const API_BASE_URL = `${apiEndpoint}/api/Empleados`; 

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

    const createObject = async (obj) => {
        try {
            const response = await fetch(API_BASE_URL, {
                method: 'POST',
                headers: {
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
            const response = await fetch(`${API_BASE_URL}/${id}`, {
                method: 'PUT',
                headers: {
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
            const response = await fetch(`${API_BASE_URL}/${id}`, {
                method: 'DELETE'
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
        createObject,
        updateObject,
        deleteObject,
    };
};

export { useEmpleados }; 
