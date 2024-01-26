import React from 'react';
import ReactDOM from 'react-dom/client';

// Prime react setup
import { PrimeReactProvider } from 'primereact/api';
import { locale, addLocale } from 'primereact/api';
import esLocale from './es.json';
import 'primereact/resources/themes/lara-light-indigo/theme.css';   // theme
import 'primeflex/primeflex.css';                                   // css utility
import 'primeicons/primeicons.css';
import 'primereact/resources/primereact.css';
import './styles/flags.css';
import './styles/componentStyles.css';
addLocale('es', esLocale);
locale('es');

// Redux and context
import { Provider } from 'react-redux';
import { store } from './context/store.js';
import PagesContextProvider from './context/PagesContextProvider';

// Authentication
import { PublicClientApplication, EventType } from '@azure/msal-browser';
import { msalConfig } from './auth-config';
import { AuthenticatedTemplate, UnauthenticatedTemplate, useMsal, MsalProvider } from '@azure/msal-react';

// Components
import App from './App.jsx';
import LoginPage from './components/loginPageComponents/LoginPage.jsx';
import PagesManager from './context/pagesManager.jsx';

// --------------- Auth logic ------------------------------------------

const msalInstance = new PublicClientApplication(msalConfig);

// Set the first account as active if there are accounts and no active account
if (!msalInstance.getActiveAccount() && msalInstance.getAllAccounts().length > 0) {
    msalInstance.setActiveAccount(msalInstance.getAllAccounts()[0]);
}

msalInstance.addEventCallback((event) => {
    if (event.eventType === EventType.LOGIN_SUCCESS && event.payload.account) {
        const account = event.payload.account;
        msalInstance.setActiveAccount(account);
    }
});

const RootComponent = () => {

    const { instance } = useMsal();
    const activeAccount = instance.getActiveAccount();

    return (

        <>
            <AuthenticatedTemplate>
                {activeAccount ? (
                    <Provider store={store}>
                        <PrimeReactProvider>
                            <PagesContextProvider>
                                <PagesManager />
                                <App />
                            </PagesContextProvider>
                        </PrimeReactProvider>
                    </Provider>
                ) : null}
            </AuthenticatedTemplate>
            <UnauthenticatedTemplate>
                <LoginPage instance={instance} />
            </UnauthenticatedTemplate>
        </>
    );
};

ReactDOM.createRoot(document.getElementById('root')).render(
    <MsalProvider instance={msalInstance}>
        <RootComponent />
    </MsalProvider>
);
