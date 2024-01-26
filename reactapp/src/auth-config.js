import { LogLevel } from '@azure/msal-browser';

export const msalConfig = {
    auth: {
        clientId: '57a3adaf-9059-4bc8-b6a8-50100989603b',
        authority: 'https://login.microsoftonline.com/corralrosales.com',
        redirectUri: '/',
        postLogoutRedirectUri: '/',
        navigateToLoginRequestUri: false,
    },
    cache: {
        cacheLocation: 'sessionStorage',
        storeAuthStateInCookie: false,
    },
    system: {
        loggerOptions: {
            loggerCallback: (level, message, containsPii) => {
                if (containsPii) {
                    return;
                }
                switch (level) {
                    case LogLevel.Error:
                        /*console.error(message);*/
                        return;
                    case LogLevel.Info:
                        /*console.info(message);*/
                        return;
                    case LogLevel.Verbose:
                        /*console.debug(message);*/
                        return;
                    case LogLevel.Warning:
                        /*console.warn(message);*/
                        return;
                    default:
                        return;
                }
            },
        },
    },
};

export const loginRequest = {
    scopes: ['user.read'],
};
                      