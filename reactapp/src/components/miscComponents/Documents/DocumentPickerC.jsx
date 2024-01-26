import React, { useRef, useState, useEffect } from 'react';
import { Toast } from 'primereact/toast';
import { FileUpload } from 'primereact/fileupload';
import { Tooltip } from 'primereact/tooltip';
import { Tag } from 'primereact/tag';

function DocumentPickerC({ type, onFilesChange }) {

    // Estados
    const toast = useRef(null);
    const fileUploadRef = useRef(null);
    const [filesUploaded, setFilesUploaded] = useState([]);

    // Callback use
    useEffect(() => {
        onFilesChange(filesUploaded);
    }, [filesUploaded, onFilesChange]);

    const onTemplateSelect = (e) => {
        // Original files list
        const originalFiles = e.files;

        // Filter out any 'files' that are actually folders (they have an empty 'type')
        const validFiles = originalFiles.filter(file => file.type !== "");

        // Check if any folders were filtered out
        if (validFiles.length !== originalFiles.length) {
            toast.current.show({ severity: 'error', summary: 'Error', detail: 'No se pueden cargar carpetas' });
        }

        // Update the file list in the FileUpload component
        if (fileUploadRef && fileUploadRef.current) {
            fileUploadRef.current.setFiles(validFiles);
        }

        // Merge new files with existing files
        const updatedFiles = [
            ...filesUploaded,
            ...validFiles.filter(vf => !filesUploaded.some(fu => fu.file.name === vf.name)).map(file => ({
                file,
                titulo: '',
                descripcion: ''
            }))
        ];

        setFilesUploaded(updatedFiles);
    };

    const handleFileDetailChange = (fileName, key, value) => {
        setFilesUploaded(prevFiles => prevFiles.map(fileObj => {
            if (fileObj.file.name === fileName) {
                return { ...fileObj, [key]: value };
            }
            return fileObj;
        }));
    };

    const onTemplateRemove = (file, callback) => {
        setFilesUploaded(filesUploaded.filter(f => f.file.name !== file.name));
        callback();
    };

    const onTemplateError = (e) => {
        // Check if the error is due to file size
        if (e.files[0].size > 20971520) { // 20MB in bytes
            toast.current.show({ severity: 'error', summary: 'Error', detail: 'El archivo es demasiado grande. El tamaño máximo es de 20MB.' });
        } else {
            // Handle other errors
            toast.current.show({ severity: 'error', summary: 'Error', detail: 'Ha ocurrido un error al cargar el archivo.' });
        }
    }


    const headerTemplate = (options) => {
        const { className, chooseButton, cancelButton } = options;

        return (
            <div className={className} style={{ backgroundColor: 'transparent', display: 'flex', alignItems: 'center' }}>
                {chooseButton}
                {cancelButton}
                <h4 className="filepicker-header-title">Selección de <strong>{type === "documentos" ? 'documentos' : 'correos'}</strong></h4>
                <span className="filepicker-header-span"><strong>{type === "documentos" ? 'Documentos' : 'Correos'} listos para cargar:</strong> {filesUploaded.length}</span>
            </div>
        );
    };

    const itemTemplate = (file, props) => {

        // Find the corresponding file object in filesUploaded
        const fileObj = filesUploaded.find(f => f.file.name === file.name) || {};

        return (
            <div className="document-container">
                <div className="file-properties">
                    <span className="file-name">
                        {file.name}
                    </span>
                    <small className="upload-date">{new Date().toLocaleDateString()}</small>
                    <Tag value={props.formatSize} severity="warning" className="px-3 py-2" style={{ fontFamily: 'var(--poppins)', minWidth: '55px', maxHeight: '35px', fontWeight: '400' }} />
                    <button className="rounded-icon-btn" onClick={() => onTemplateRemove(file, props.onRemove)} >
                        <i className="pi pi-delete-left" style={{ color: 'white', fontSize: '16px' }}></i>
                    </button>
                </div>
                <div className="file-details">
                    <div className="form-group" style={{gridColumn:'1 / span 1'}}>
                        <label style={{ alignSelf: 'start' }}>Titulo <small className="required-sign">*</small></label>
                        <input
                            type="text"
                            placeholder="Título"
                            value={fileObj.titulo || ''} // Use titulo from the matching fileObj
                            onChange={(e) => handleFileDetailChange(file.name, 'titulo', e.target.value)}
                            maxLength="30"
                        />
                    </div>
                    <div className="form-group" style={{ gridColumn: '2 / span 1' }}>
                        <label style={{ alignSelf: 'start' }}>Descripción <small className="required-sign">*</small></label>
                        <input
                            type="text"
                            placeholder="Descripción"
                            value={fileObj.descripcion || ''} // Use descripcion from the matching fileObj
                            onChange={(e) => handleFileDetailChange(file.name, 'descripcion', e.target.value)}
                            maxLength="1000"
                        />
                    </div>
                </div>
            </div>
        );
    };

    const emptyTemplate = () => {
        return (
            <div className="flex align-items-center flex-column">
                <i className={`pi dragndrop-icon ${type === "documentos" ? 'pi-file' : 'pi-envelope'}`}></i>
                <span className="dragndrop-msg">
                    Arrastra y suelta el {type === "documentos" ? 'documento' : 'correo'} aquí
                </span>
            </div>
        );
    };

    const onTemplateClear = () => {
        setFilesUploaded([]);
    };

    const chooseOptions = { icon: 'pi pi-folder-open', iconOnly: true, className: 'custom-choose-btn select-doc-btn' };
    const cancelOptions = { icon: 'pi pi-times', iconOnly: true, className: 'custom-cancel-btn delete-doc-btn' };

    return (
        <div>
            <Toast ref={toast}></Toast>

            <Tooltip target=".custom-choose-btn" content="Elegir" position="bottom" />
            <Tooltip target=".custom-cancel-btn" content="Limpiar" position="bottom" />

            <FileUpload files={filesUploaded} ref={fileUploadRef} name="demo[]" url="/api/upload" multiple accept=".pdf,image/*,.doc,.docx" maxFileSize={20971520}
                onError={onTemplateError} onSelect={onTemplateSelect} onClear={onTemplateClear}
                headerTemplate={headerTemplate} itemTemplate={itemTemplate} emptyTemplate={emptyTemplate}
                chooseOptions={chooseOptions} cancelOptions={cancelOptions}
                invalidFileSizeMessageSummary="Tamaño de archivo inválido"
                invalidFileSizeMessageDetail="El archivo es demasiado grande. El tamaño máximo es de 20MB" />
        </div>
    )
}

export default DocumentPickerC