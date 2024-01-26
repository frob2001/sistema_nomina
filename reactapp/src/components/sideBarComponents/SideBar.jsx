import React, { useState, useEffect } from "react";
import SideBarGroup from './SideBarGroup';
import SideBarFooter from "./SideBarFooter";
import { expand } from '../../context/sidebarSlice';
import { useMsal } from '@azure/msal-react';
import { useDispatch } from 'react-redux';
const adminEmails = import.meta.env.VITE_ADMIN_EMAILS.split(',');

// This component is the whole sidebar

function SideBar(props) {

    // Auth
    const { accounts } = useMsal();
    const account = accounts[0] || {};
    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {
        // Check if the account's username is in the admin emails list
        if (account.username && adminEmails.includes(account.username)) {
            setIsAdmin(true);
        } else {
            setIsAdmin(false);
        }
    }, [account.username]);
    

    // ---- Hooks ----
    const falseArray = [false, false, false, false, false, false, false, false]; // Se debe cambiar cuando se agregue una nueva categoría
    const [itemStates, setItemStates] = useState(falseArray);
    const dispatch = useDispatch();

    const groups = [
        { name: "marcas", text: "Marcas", index: 0, subItems: ["Marcas", "Acciones a terceros"] },
        { name: "patentes", text: "Patentes", index: 1, subItems: ["Patentes", "Inventores"] },
        { name: "regulatorio", text: "Regulatorio", index: 2, subItems: ["Regulatorio"] },
        { name: "infracciones", text: "Infracciones", index: 3, subItems: ["Infracciones"] },
        { name: "general", text: "General", index: 4, subItems: ["Clientes", "Gacetas", "Propietarios"] },
        ...(isAdmin ? [
            { name: "administracion", text: "Administración", index: 5, subItems: ["Abogados", "Clases", "Estados"] },
            { name: "gestion", text: "Gestión", index: 6, subItems: ["Gestión clientes", "Gestión general", "Gestión infracciones", "Gestión marcas", "Gestión patentes", "Gestión regulatorio"] }
        ] : []),
        { name: "recordatorios", text: "Recordatorios", index: 7, subItems: ["Recordatorios"] }
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
