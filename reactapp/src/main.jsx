import React from 'react';
import ReactDOM from 'react-dom/client';

import { store } from './context/store.js';
import { PrimeReactProvider } from 'primereact/api';
import { locale, addLocale } from 'primereact/api';
import esLocale from './es.json';

import 'primereact/resources/themes/lara-light-indigo/theme.css';   // theme
import 'primeflex/primeflex.css';                                   // css utility
import 'primeicons/primeicons.css';
import 'primereact/resources/primereact.css';

addLocale('es', esLocale);
locale('es');

import App from './App.jsx'
import { AuthProvider } from './context/authContext';

// Redux and context
import { Provider } from 'react-redux';
import PagesContextProvider from './context/PagesContextProvider';

const RootComponent = () => {
    return (
        <>
            <Provider store={store}>
                <PrimeReactProvider>
                    <AuthProvider>
                        <PagesContextProvider>
                            <App />
                        </PagesContextProvider>
                    </AuthProvider>
                </PrimeReactProvider>
            </Provider>
        </>
    );
};


ReactDOM.createRoot(document.getElementById('root')).render(
    <RootComponent />
)

