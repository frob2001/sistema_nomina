import React from 'react';

function EmptyTable(props) {
    return (
        <div className="empty-page-container">
            <h3 className="empty-page-logo">{props.title}</h3>
            <div className="empty-page-search">
                <p>Para iniciar, seleccione</p>
                <div className="empty-page-icon">
                    <i className="pi pi-search" style={{ fontSize: '0.8rem', margin: '0' }}></i>
                    <label>Buscar</label>
                </div>
            </div>
            
        </div>
    );
}

export default EmptyTable;