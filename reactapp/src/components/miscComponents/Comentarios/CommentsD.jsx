import React, { useRef, useState, useEffect } from 'react';
import { Toast } from 'primereact/toast';
import { ConfirmPopup, confirmPopup } from 'primereact/confirmpopup';

// Services
import useSWR from 'swr';
const apiEndpoint = import.meta.env.VITE_MAIN_ENDPOINT;
import { useComments } from '../../../services/useComments'; // Para la creación de documentos y correos


// Auth
import { useMsal } from '@azure/msal-react';

function CommentsD({ tablaConexion, idConexion, onCommentChange, persistedComment }) {

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

    // Setup
    const API_BASE_URL = `${apiEndpoint}/ConexionComentario/Buscar`;
    const { data, error, isLoading, mutate: refresh } = useSWR(`${API_BASE_URL}?tablaConexion=${tablaConexion}&idConexion=${idConexion}`, fetcher); // SWR para los datos: EDITABLE
    const { uploadComment } = useComments(); // Servicio para subir comentarios

    // Estados
    const toast = useRef(null);
    const defaultComment = {
        titulo: '',
        comentario: '',
        fecha: '',
    }
    const [currentComment, setCurrentComment] = useState(defaultComment); // estado para el comentario en creación

    useEffect(() => {
        onCommentChange(currentComment);
    }, [currentComment]); // Pasa la data del comentario al padre para que lo guarde

    useEffect(() => {
        // Ensure that persisted comment is an object and has the necessary structure
        if (persistedComment) {
            // Check if persisted comment is not empty
            if (Object.keys(persistedComment).length !== 0) {
                // Check if persisted comment has some data
                if (persistedComment.titulo !== '' ||
                    persistedComment.comentario !== '') {
                    setCurrentComment(persistedComment);
                }
            }
        }
    }, [persistedComment]); // Si es que existe data persistida, la asigna al comentario actual
    
    const handleAddComment = async (e) => {
        e.preventDefault();
        const { titulo, comentario } = currentComment;

        if (titulo?.trim() === '' || comentario?.trim() === '') {
            toast.current.show({
                severity: 'error',
                summary: 'Alerta',
                detail: 'Para añadir un comentario, todos los campos deben estar completos', // EDITABLE
                life: 3000,
            });
            return;
        }

        try {
            const updatedComment = {
                ...currentComment,
                fecha: new Date().toISOString().split('T')[0]
            };

            await uploadComment(updatedComment, idConexion, tablaConexion);
            
            toast.current.show({
                severity: 'success',
                summary: 'Proceso exitoso',
                detail: 'Comentario creado con éxito', // EDITABLE
                life: 3000,
            });
            refresh();
            setCurrentComment(defaultComment);

        } catch (uploadError) {
            toast.current.show({
                severity: 'error',
                summary: 'Error',
                detail: 'Se produjo un error al ingresar el comentario', // EDITABLE
                life: 3000,
            });
        }
    }; // Agrega un comentario a la lista

    const confirmDeletion = (event, comment) => {
        event.preventDefault();
        event.stopPropagation();
        confirmPopup({
            target: event.currentTarget,
            message: '¿Estás seguro? Esta acción es irreversible',
            icon: 'pi pi-info-circle',
            acceptClassName: 'p-button-danger',
            accept: () => deleteComment(comment)
        });
    };

    const deleteComment = async (comment) => {
        const url = `${apiEndpoint}/ConexionComentario/${comment.conexionComentarioId}`;

        try {
            const accessToken = await getAccessToken();
            const response = await fetch(url, {
                method: 'DELETE',
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            toast.current.show({
                severity: 'success',
                summary: 'Éxito',
                detail: `Comentario eliminado correctamente`,
                life: 3000,
            });

            refresh();

        } catch (error) {
            toast.current.show({
                severity: 'error',
                summary: 'Error',
                detail: `Hubo un problema al eliminar el comentario`,
                life: 3000,
            });
        } finally {
            refresh();
        }
    };

    return (
        <div>
            <Toast ref={toast}></Toast>
            <div className="form-body form-body--create">
                <section>
                    <div className="form-group-label">
                        <i className="pi pi-comments"></i>
                        <label>Comentarios</label>
                    </div>
                    <div className="form-body-group form-body-group-comments">
                        <div className="form-group">
                            <label>Ingresa un comentario</label>
                            <div className="comment-input-space">
                                <div className="comment-inputs">
                                    <input type="text" placeholder="Título del comentario" maxLength="30" value={currentComment.titulo || ''} onChange={(e) => setCurrentComment({
                                        ...currentComment,
                                        titulo: e.target.value
                                    })} />
                                    <button className='rounded-icon-btn' onClick={(e) => handleAddComment(e)}>
                                        <i className="pi pi-comment" style={{ color: 'white', fontSize: '16px' }}></i>
                                    </button>
                                </div>
                                <textarea type="text" placeholder="Comentario (máx. 1000 caracteres)" maxLength="1000" value={currentComment.comentario || ''} onChange={(e) => setCurrentComment({
                                    ...currentComment,
                                    comentario: e.target.value
                                })} />
                            </div>
                        </div>
                        <table className="table-list">
                            <thead>
                                <tr className="table-head">
                                    <th>Comentarios</th>
                                </tr>
                            </thead>
                            <tbody style={{maxHeight: '280px'}}>
                                {data?.map((comment, index) => (
                                    <tr className="comment-container" key={index}>
                                        <td className="comment-title-container">
                                            <p><strong>{comment.titulo}</strong> ({comment.fecha ? comment.fecha.split('T')[0] : ''})   subido por: {comment.usuario.split('@')[0]}</p>
                                            <button className="rounded-icon-btn" onClick={(e) => confirmDeletion(e, comment)}>
                                                <i className="pi pi-delete-left" style={{ color: 'white', fontSize: '16px' }}></i>
                                            </button>
                                        </td>
                                        <td className="comment-comment-container">
                                            <p>"{comment.comentario}"</p>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>
            </div>
        </div>
    )
}

export default CommentsD