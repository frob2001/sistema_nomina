import React, { useRef, useState, useEffect } from 'react';
import { Toast } from 'primereact/toast';

function CommentsC({ onCommentsChange, persistedCommentsData, resetStates, setResetStates }) {

    // Estados
    const toast = useRef(null);
    const defaultCommentsData = {
        currentComment: {
            titulo: '',
            comentario: '',
            fecha: '',
        },
        commentsToUpload: []
    }
    const [commentsData, setCommentsData] = useState(defaultCommentsData); // lista con dos items: un objeto (currentComment), y una lista de objetos (comments)

    useEffect(() => {
        onCommentsChange(commentsData);
    }, [commentsData]); // Pasa la data de comentarios al padre

    useEffect(() => {
        if (resetStates) {
            setCommentsData(defaultCommentsData);
            // Reset the resetStates flag after the state has been reset
            if (setResetStates) {
                setResetStates(false);
            }
        }
    }, [resetStates, setResetStates]);

    useEffect(() => {
        // Ensure that persistedCommentsData is an object and has the necessary structure
        if (persistedCommentsData && persistedCommentsData.currentComment) {
            // Check if commentsData is in its default state
            if (commentsData.currentComment.titulo === '' &&
                commentsData.currentComment.comentario === '' &&
                commentsData.currentComment.fecha === '' &&
                commentsData.commentsToUpload.length === 0) {

                // Check if persistedCommentsData has some data
                if (persistedCommentsData.currentComment.titulo !== '' ||
                    persistedCommentsData.currentComment.comentario !== '' ||
                    persistedCommentsData.commentsToUpload.length > 0) {

                    setCommentsData(persistedCommentsData);
                }
            }
        }
    }, [persistedCommentsData]);
    
    const handleAddComment = (e) => {
        e.preventDefault();
        const { titulo, comentario } = commentsData.currentComment;

        if (titulo?.trim() === '' || comentario?.trim() === '') {
            toast.current.show({
                severity: 'error',
                summary: 'Alerta',
                detail: 'Para añadir un comentario, todos los campos deben estar completos', // EDITABLE
                life: 3000,
            });
            return;
        }

        if (!commentsData.commentsToUpload.some(comment => (comment.titulo === titulo) && (comment.comentario === comentario))) {
            const updatedComment = {
                ...commentsData.currentComment,
                fecha: new Date().toISOString().split('T')[0]
            };

            setCommentsData(prevData => ({
                ...prevData,
                commentsToUpload: [...prevData.commentsToUpload, updatedComment],
                currentComment: { titulo: '', comentario: '', fecha: '' }
            }));
        }
    }; // Agrega un comentario a la lista

    const handleDeleteComment = (e, object) => {
        e.preventDefault();
        const updatedComments = commentsData.commentsToUpload.filter((item) => item !== object);
        setCommentsData(prevData => ({
            ...prevData,
            commentsToUpload: updatedComments,
        }));
    }; // Quita una referencia de la lista

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
                                    <input type="text" placeholder="Título del comentario" maxLength="30" value={commentsData.currentComment.titulo || ''} onChange={(e) => setCommentsData({
                                        ...commentsData,
                                        currentComment: {
                                            ...commentsData.currentComment,
                                            titulo: e.target.value
                                        }
                                    })} />
                                    <button className='rounded-icon-btn' onClick={(e) => handleAddComment(e)}>
                                        <i className="pi pi-comment" style={{ color: 'white', fontSize: '16px' }}></i>
                                    </button>
                                </div>
                                <textarea type="text" placeholder="Comentario (máx. 1000 caracteres)" maxLength="1000" value={commentsData.currentComment.comentario || ''} onChange={(e) => setCommentsData({
                                    ...commentsData,
                                    currentComment: {
                                        ...commentsData.currentComment,
                                        comentario: e.target.value
                                    }
                                })} />
                            </div>
                        </div>
                        <table className="table-list">
                            <thead>
                                <tr className="table-head">
                                    <th>Comentarios agregados</th>
                                </tr>
                            </thead>
                            <tbody style={{maxHeight: '280px'}}>
                                {commentsData.commentsToUpload.map((comment, index) => (
                                    <tr className="comment-container" key={index}>
                                        <td className="comment-title-container">
                                            <p><strong>{comment.titulo}</strong> ({comment.fecha})</p>
                                            <button className="rounded-icon-btn" onClick={(e) => handleDeleteComment(e, comment)}>
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

export default CommentsC