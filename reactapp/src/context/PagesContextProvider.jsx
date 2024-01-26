import React, { useState } from 'react';
import pagesContext from './pagesContext';

function PagesContextProvider ({ children }) {

    const [pages, setPages] = useState({});
    const [CSPN, setCSPN] = useState(""); // Current Shown Page Name para saber qué página se muestra sin tener que iterar

    // Mapeo de nombres y funciones: deben estar todos los SETs
    const addEmptyPage = (pageName) => {
        let previousCSPN = CSPN; // Capture the previous CSPN
        if (previousCSPN === "") {
            setPages(prevPages => ({
                ...prevPages,
                [pageName]: true,
            }));
        } else {
            setPages(prevPages => ({
                ...prevPages,
                [previousCSPN]: false,
                [pageName]: true,
            }));
        }
        setCSPN(pageName);
    };

    // Function to show a page by its name
    const showPageByName = (pageName) => {
        setPages(prevPages => {
            let newPages = { ...prevPages };
            for (const key in newPages) {
                newPages[key] = key === pageName;
            }
            return newPages;
        });
        setCSPN(pageName);
    };

    // Function to remove a page by its name
    const removePageByName = (pageName) => {
        setPages(prevPages => {
            let newPages = { ...prevPages };
            delete newPages[pageName]; // Remove the page
            let newKeys = Object.keys(newPages);
            if (newKeys.length !== 0) {
                if (pages[pageName]) {
                    const LAP = newKeys[newKeys.length - 1];
                    newPages[LAP] = true;
                    setCSPN(LAP);
                }
            } else {
                newPages = {};
                setCSPN("");
            }
            return newPages;
        });
    };

    return (
        <pagesContext.Provider value={{ pages, addEmptyPage, showPageByName, removePageByName, CSPN }}>
            { children }
        </pagesContext.Provider>
    );
}

export default PagesContextProvider;