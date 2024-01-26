import React from 'react';

function EmptyGestionOption(props) {
    return (
        <div className="empty-page-container">
            <h3 className="empty-page-logo">{props.title}</h3>
            <div className="empty-page-search">
                <p>Para iniciar, seleccione una opción</p>
            </div>
            
        </div>
    );
}

export default EmptyGestionOption;