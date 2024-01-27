import React, { useState, useEffect, useRef } from 'react';

import { Toast } from 'primereact/toast';

const apiEndpoint = import.meta.env.VITE_APP_API;
const API_BASE_URL = `${apiEndpoint}/Usuario/encryptAndSend`;


function EncriptacionPage() {

    const toast = useRef(null);
    const [correo, setCorreo] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [data, setData] = useState(null);

    const handleChange = (event) => {
        setCorreo(event.target.value);
    };

    const getData = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const email = {
                email: correo
            }
            const response = await fetch(API_BASE_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(email),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            setData(data); // Set the data from the response
        } catch (error) {
            console.error("Fetching data failed", error);
            setData(null); // Reset the data on error
        } finally {
            setIsLoading(false); // Set loading to false after the request finishes
        }
    };


    // --------------- Setup (Servicios, Contextos, Referencias) -----------------------------------

    const toast = useRef(null);


    // -----------------------------------------------------------------------------------------------

    return (
        <>
            <Toast ref={toast} />
            <div className="page-container">
                <h5 className="page-title">Usuarios encriptados</h5>
                <div className="page-options">

                </div>
                <div className="page-table">
                    <div className="adminpage__form" style={{ display: 'flex', flexDirection: 'column' }}>
                        {
                            data &&
                            <>
                                <h2 style={{ color: 'white' }}>Respuesta:</h2>
                                <p style={{ color: 'white' }}>{data || ''}</p>
                            </>
                        }
                    </div>
                    <div className="adminpage__table">
                        <div className="form">
                            <form className="form__fields">
                                <label htmlFor='correo'>Correo electrónico <span>*</span></label>
                                <input
                                    id="correo"
                                    type="text"
                                    onChange={handleChange}
                                    name="correo"
                                    value={correo}
                                    placeholder='Correo electrónico'
                                    required
                                    maxLength="70" />
                                <button type="button" onClick={(e) => getData(e)} className="button--action">
                                    Ingresar
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

export default EncriptacionPage;