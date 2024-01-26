import React, { useState, useEffect, useRef, useContext } from "react";
import pagesContext from '../../context/pagesContext';

function Tab(props) {

    const { showPageByName, removePageByName } = useContext(pagesContext);

    const [name, setName] = useState(props.tabId);
    const [isShowing, setIsShowing] = useState(props.isShowing);

    useEffect(() => {
        setIsShowing(props.isShowing);
    }, [props.isShowing]);

    // Controlar el texto de la tab
    const textRef = useRef(null);
    const [isOverflowing, setIsOverflowing] = useState(false);
    useEffect(() => {
        if (textRef.current) {
            const isOverflow = textRef.current.scrollWidth > textRef.current.clientWidth;
            setIsOverflowing(isOverflow);
        }
    }, [name]);

    return (
        <button className={`${isShowing ? 'tab-active' : 'tab-inactive'}`} onClick={() => showPageByName(name)}  >
            <span className={`tab-text ${isOverflowing ? (isShowing ? 'tab-text-shadow-ac' : 'tab-text-shadow-in') : ''}`} ref={textRef}>
                {name}
            </span>
            <div className={`${isShowing ? 'tab-close-active' : 'tab-close-inactive'}`}  onClick={(e) => { e.stopPropagation(); removePageByName(name) ;}}>
                <i className="pi pi-times" style={{ fontSize: '12px', margin: '0' }}></i>
            </div>
        </button>
    );
}

export default Tab;