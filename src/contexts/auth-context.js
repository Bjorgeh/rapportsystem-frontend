import { createContext, useContext, useEffect, useReducer, useRef } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';
import { API_BASE_URL } from 'src/config/apiConnection';

const HANDLERS = {
  INITIALIZE: 'INITIALIZE',
  SIGN_IN: 'SIGN_IN',
  SIGN_OUT: 'SIGN_OUT',
};

const initialState = {
  isAuthenticated: false,
  isLoading: true,
  user: null,
};

const handlers = {
  [HANDLERS.INITIALIZE]: (state, action) => {
    const user = action.payload;

    return {
      ...state,
      ...// Hvis brukerdata kommer, blir den autetisert
      (user
        ? {
            isAuthenticated: true,
            isLoading: false,
            user,
          }
        : {
            isLoading: false,
          }),
    };
  },
  [HANDLERS.SIGN_IN]: (state, action) => {
    const user = action.payload;

    return {
      ...state,
      isAuthenticated: true,
      user,
    };
  },
  [HANDLERS.SIGN_OUT]: (state) => {
    return {
      ...state,
      isAuthenticated: false,
      user: null,
    };
  },
};

const reducer = (state, action) =>
  handlers[action.type] ? handlers[action.type](state, action) : state;

//Denne contexten er ansvarlig for å spre autentiseringsstatus gjennom app-treet.

export const AuthContext = createContext({ undefined });

export const AuthProvider = (props) => {
  const { children } = props;
  const [state, dispatch] = useReducer(reducer, initialState);
  const initialized = useRef(false);

  const initialize = async () => {
    // hindrer at denne funksjonen kjører mer enn en gang
    if (initialized.current) {
      return;
    }

    initialized.current = true;

    let isAuthenticated = false;

    try {
      isAuthenticated = window.sessionStorage.getItem('authenticated') === 'true';
    } catch (err) {
      console.error(err);
    }

    if (isAuthenticated) {
      const user = {
        id: '5e86809283e28b96d2d38537',
        avatar: '/assets/avatars/avatar-anika-visser.png',
        name: 'Anika Visser',
        email: 'anika.visser@devias.io',
      };

      dispatch({
        type: HANDLERS.INITIALIZE,
        payload: user,
      });
    } else {
      dispatch({
        type: HANDLERS.INITIALIZE,
      });
    }
  };

  useEffect(
    () => {
      initialize();
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const skip = () => {
    try {
      window.sessionStorage.setItem('authenticated', 'true');
    } catch (err) {
      console.error(err);
    }

    const user = {
      id: '5e86809283e28b96d2d38537',
      avatar: '/assets/avatars/avatar-anika-visser.png',
      name: 'Anika Visser',
      email: 'anika.visser@devias.io',
    };

    dispatch({
      type: HANDLERS.SIGN_IN,
      payload: user,
    });
  };

  const signIn = async (email, password) => {
    const credentials = { username: email, password: password };

    try {
      const response = await axios.post(API_BASE_URL + 'api/user/post/login', credentials);
      const data = response.data;

      // Lagre brukerobjektet og tilgangstokenet i sessionStorage
      window.sessionStorage.setItem('user', JSON.stringify(data.user));
      window.sessionStorage.setItem('accessToken', data.access_token);
      window.sessionStorage.setItem('email', JSON.stringify(email));
      window.sessionStorage.setItem('user_id', JSON.stringify(data.user_id));
      window.sessionStorage.setItem('accountType', JSON.stringify(data.accountType));

      // Sett authenticated til true i sessionStorage etter vellykket innlogging
      window.sessionStorage.setItem('authenticated', 'true');

      // Bruk dispatch for å oppdatere tilstanden med brukerdataene
      dispatch({
        type: HANDLERS.SIGN_IN,
        payload: data.user,
      });
    } catch (error) {
      console.error('Error during login:', error);
    }
  };

  const signUp = async (/*email, password*/) => {
    try {
      // Implementer logikken for å registrere brukeren her
      // For eksempel, send en forespørsel til serveren for å opprette en ny brukerkonto
      console.log('Sign up logic goes here...');
    } catch (error) {
      console.error('Error during sign up:', error);
    }
  };

  const signOut = () => {
    try {
      // Set authenticated to false in sessionStorage
      window.sessionStorage.setItem('authenticated', 'false');
      // Clear user data from sessionStorage
      window.sessionStorage.removeItem('user');
      window.sessionStorage.removeItem('accessToken');
      window.sessionStorage.removeItem('email');
      window.sessionStorage.removeItem('authenticated');
    } catch (error) {
      console.error('Error during sign out:', error);
    }
  };

  AuthProvider.propTypes = {
    children: PropTypes.node,
    signUp: PropTypes.func,
    signOut: PropTypes.func, // Legg til signOut i prop types
  };

  AuthProvider.propTypes = {
    children: PropTypes.node,
    signUp: PropTypes.func, // Oppdater prop types for å inkludere signUp-funksjonen
  };

  return (
    <AuthContext.Provider
      value={{
        ...state,
        skip,
        signIn,
        signUp,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

AuthProvider.propTypes = {
  children: PropTypes.node,
};

export const AuthConsumer = AuthContext.Consumer;

export const useAuthContext = () => useContext(AuthContext);
