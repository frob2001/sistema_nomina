import React, { useContext } from "react";
import pagesContext from '../../context/pagesContext';

// This component represents each option within a category of the sidebar

function SideBarItem(props) {

    const { pages, addEmptyPage, showPageByName } = useContext(pagesContext);

    const handlePage = () => {
        const pageKeys = Object.keys(pages);
        if (pageKeys.includes(props.text)) {
            showPageByName(props.text);
        } else {
            addEmptyPage(props.text);
        }
    }

    return (
        <button onClick={handlePage} className="sidebar-item">{props.text}</button>
    );
}

export default SideBarItem;
