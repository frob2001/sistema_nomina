import React, { useState, useEffect } from 'react';

// Components
import GestionPage from './Pages/GestionPage';

function GestionPagesSuperComponent(props) { // EDITABLE

    const renderPage = () => {
        let endpointSelected;

        switch (props.pageOption) {
            case 'companias':
                endpointSelected = "Compania";
                break;
            case 'emisores':
                endpointSelected = "Emisor";
                break;
            case 'sucursales':
                endpointSelected = "Sucursal";
                break;
            case 'tiposEmpleado':
                endpointSelected = "TipoEmpleado";
                break;
            case 'tiposContrato':
                endpointSelected = "TipoContrato";
                break;
            case 'tiposComision':
                endpointSelected = "TipoComision";
                break;
            case 'tiposCuenta':
                endpointSelected = "TipoCuenta";
                break;
            case 'tiposOperacion':
                endpointSelected = "TipoOperacion";
                break;
            case 'ocupaciones':
                endpointSelected = "Ocupacion";
                break;
            case 'nivelesSalariales':
                endpointSelected = "NivelSalarial";
                break;
            case 'centrosCosto':
                endpointSelected = "CentroCosto";
                break;
            case 'bancos':
                endpointSelected = "Banco";
                break;
            case 'fondosReserva':
                endpointSelected = "FondoReserva";
                break;
            case 'conceptos':
                endpointSelected = "Concepto";
                break;
            default:
                return <div>Page not found</div>;
        }

        return <GestionPage endpoint={endpointSelected} />;
    };

    return (
        <>
            <div className="page-container">
                <h5 className="page-title">Gestión de {props.pageTitle}</h5>
                <div className="page-options">
                </div>
                <div className="page-table">
                    {renderPage()}
                </div>
            </div>
        </>
    );
}

export default GestionPagesSuperComponent;