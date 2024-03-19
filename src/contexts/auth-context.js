import { createContext, useContext, useEffect, useReducer, useRef } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';
//import { access } from 'fs';

const HANDLERS = {
  INITIALIZE: 'INITIALIZE',
  SIGN_IN: 'SIGN_IN',
  SIGN_OUT: 'SIGN_OUT'
};

const initialState = {
  isAuthenticated: false,
  isLoading: true,
  user: null
};

const handlers = {
  [HANDLERS.INITIALIZE]: (state, action) => {
    const user = action.payload;

    return {
      ...state,
      ...(
        // if payload (user) is provided, then is authenticated
        user
          ? ({
            isAuthenticated: true,
            isLoading: false,
            user
          })
          : ({
            isLoading: false
          })
      )
    };
  },
  [HANDLERS.SIGN_IN]: (state, action) => {
    const user = action.payload;

    return {
      ...state,
      isAuthenticated: true,
      user
    };
  },
  [HANDLERS.SIGN_OUT]: (state) => {
    return {
      ...state,
      isAuthenticated: false,
      user: null
    };
  }
};

const reducer = (state, action) => (
  handlers[action.type] ? handlers[action.type](state, action) : state
);

// The role of this context is to propagate authentication state through the App tree.

export const AuthContext = createContext({ undefined });

export const AuthProvider = (props) => {
  const { children } = props;
  const [state, dispatch] = useReducer(reducer, initialState);
  const initialized = useRef(false);

  const initialize = async () => {
    // Prevent from calling twice in development mode with React.StrictMode enabled
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
        email: 'anika.visser@devias.io'
      };

      dispatch({
        type: HANDLERS.INITIALIZE,
        payload: user
      });
    } else {
      dispatch({
        type: HANDLERS.INITIALIZE
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
      email: 'anika.visser@devias.io'
    };

    dispatch({
      type: HANDLERS.SIGN_IN,
      payload: user
    });
  };

  const signIn = async (email, password) => {
    try {
      // Sett authenticated til true i sessionStorage
      window.sessionStorage.setItem('authenticated', 'true');
    } catch (err) {
      console.error(err);
    }
  
    const credentials = { username: email, password: password };
  
    try {
      const response = await axios.post('http://34.116.241.11:5001/api/user/post/login', credentials);
      const data = response.data;
  
      console.log('Login response data: ', data);
  
      // Lagre brukerobjektet og tilgangstokenet i sessionStorage
      window.sessionStorage.setItem('user', JSON.stringify(data.user));
      window.sessionStorage.setItem('accessToken', data.access_token);
  
      // Bruk dispatch for å oppdatere tilstanden med brukerdataene
      dispatch({
        type: HANDLERS.SIGN_IN,
        payload: data.user
      });
    } catch (error) {
      console.error('Error during login:', error);
    }
  };
  const signUp = async (email, name, password) => {
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
      // Implementer logikken for utlogging her
      console.log('Signing out...');
      // Fjern brukerinformasjon fra sessionStorage eller lignende hvis nødvendig
    } catch (error) {
      console.error('Error during sign out:', error);
    }
  };
  
  AuthProvider.propTypes = {
    children: PropTypes.node,
    signUp: PropTypes.func,
    signOut: PropTypes.func // Legg til signOut i prop types
  };
  
  
  AuthProvider.propTypes = {
    children: PropTypes.node,
    signUp: PropTypes.func // Oppdater prop types for å inkludere signUp-funksjonen
  };
  

  return (
    <AuthContext.Provider
      value={{
        ...state,
        skip,
        signIn,
        signUp,
        signOut
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

AuthProvider.propTypes = {
  children: PropTypes.node
};

export const AuthConsumer = AuthContext.Consumer;

export const useAuthContext = () => useContext(AuthContext);
