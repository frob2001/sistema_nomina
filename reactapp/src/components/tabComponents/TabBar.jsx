import React, { useState, useEffect, useRef, useContext } from "react";
import pagesContext from '../../context/pagesContext';
import Tab from './Tab';

function TabBar() {

    const { pages } = useContext(pagesContext);

    const [showNavButtons, setShowNavButtons] = useState(false);
    const [parentWidth, setParentWidth] = useState(0);
    const tabBarRef = useRef(null);
    const parentRef = useRef(null);

    useEffect(() => {
        const updateWidth = () => {
            const width = parentRef.current ? (showNavButtons ? parentRef.current.offsetWidth - 50 : parentRef.current.offsetWidth) : 0;
            setParentWidth(width);
        };

        updateWidth();
        window.addEventListener('resize', updateWidth);
        return () => window.removeEventListener('resize', updateWidth);
    });

    useEffect(() => {
        const isOverflowing = tabBarRef.current.scrollWidth > tabBarRef.current.clientWidth;
        setShowNavButtons(isOverflowing);
    });

    const scrollTabs = (direction) => {
        // Logic to scroll tabs left or right
        if (direction === 'left') {
            tabBarRef.current.scrollLeft -= 200; // Adjust scroll amount as needed
        } else {
            tabBarRef.current.scrollLeft += 200; // Adjust scroll amount as needed
        }
    };

    return (
        <div className="tab-bar" ref={parentRef}>
            {showNavButtons &&
                <button className="nav-btn-left" onClick={() => scrollTabs('left')}>
                    <i className="pi pi-angle-left" style={{ fontSize: '18px' }}></i>
                </button>}
            <div className="tabs-container" ref={tabBarRef} style={{ width: parentWidth }}>
                {Object.keys(pages).map(pageName => (
                    <Tab key={pageName} tabId={pageName} isShowing={pages[pageName]} />
                ))}
            </div>
            {showNavButtons &&
                <button className="nav-btn-right" onClick={() => scrollTabs('right')}>
                    <i className="pi pi-angle-right" style={{ fontSize: '18px' }}></i>
                </button>}
        </div>
    );
}

export default TabBar;


