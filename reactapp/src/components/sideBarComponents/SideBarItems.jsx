import React from "react";
import SideBarItem from "./SideBarItem";

// This component groups all side bar items within a category

function SideBarItems(props) {

    // ---- Hooks ----
    const { subItems = [] } = props;

    return (
        <div className="items-card">
            {subItems.map((texto, index) => (
                <SideBarItem key={index} text={texto} />
            ))}
        </div>
    );
}

export default SideBarItems;