import React, { useState, useEffect } from "react";
import SideBarGroup from './SideBarGroup';
import SideBarFooter from "./SideBarFooter";
import { expand } from '../../context/sidebarSlice';
import { useDispatch } from 'react-redux';

// This component is the whole sidebar

function SideBar(props) {
    

    // ---- Hooks ----
    const falseArray = [false, false, false, false, false, false]; // Se debe cambiar cuando se agregue una nueva categoría
    const [itemStates, setItemStates] = useState(falseArray);
    const dispatch = useDispatch();

    const groups = [
        { name: "empleados", text: "Empleados", index: 0, subItems: ["Empleados"] },
        { name: "usuarios", text: "Usuarios", index: 1, subItems: ["Usuarios"] },
        { name: "movimientos", text: "Movientos", index: 2, subItems: ["Movimientos de planilla"] },
        { name: "rolpagos", text: "Roles", index: 3, subItems: ["Rol de pagos"] },
        {
            name: "gestion", text: "Gestión", index: 4, subItems: [
                "Compañías",
                "Emisores",
                "Sucursales",
                "Tipos de empleado",
                "Tipos de contrato",
                "Tipos de comisión",
                "Tipos de cuenta",
                "Tipos de operación",
                "Ocupaciones",
                "Niveles salariales",
                "Centros de costo",
                "Bancos",
                "Fondos de reserva",
                "Conceptos",]
        },
    ]; //Creates the necessary super items

    useEffect(() => {
        if (itemStates.some((value) => value === true)) { //If there is no active item, then contract
            dispatch(expand());
        } 
    }, [itemStates]); // Listens to changes in the active states

    // ---- Inner functions ----
    const handleItemClicked = (index, actualState) => {
        // Receives the index of the child whose state changed and to which state.
        const updatedItems = itemStates.map((item, i) => (i === index ? actualState : false));
        setItemStates(updatedItems);
    };  // In charge of only allowing one item to be active at a time

    return (
        <div className="sidebar">
            <div className="sidebar-content">
                {groups.map((group) => (
                    <SideBarGroup
                        key={group.name}
                        nameSuperItem={group.name}
                        isActive={itemStates[group.index]}
                        text={group.text}
                        index={group.index}
                        onChildEvent={handleItemClicked}
                        subItems={group.subItems}
                    />
                ))}
            </div>
            <div className="sidebar-footer">
                <SideBarFooter/>
            </div>
        </div>
    );
}

export default SideBar;
