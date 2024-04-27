import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/router';
import PropTypes from 'prop-types';
import { useAuthContext } from 'src/contexts/auth-context';

export const AuthGuard = (props) => {
  const { children } = props;
  const router = useRouter();
  const { isAuthenticated } = useAuthContext();
  const ignore = useRef(false);
  const [checked, setChecked] = useState(false);

  // Kun gjør autentisering når komponenten er klar
  // Denne flyten tillater at du manuelt omdisrigeres til brukeren etter at du har logget ut, ellers vil dette bli
  // utløst og vil automatisk omdirigere til påloggingssiden.


  useEffect(() => {
    if (!router.isReady) {
      return;
    }

    ///Hindrer dobbelkall i utviklingsmodus med React.StrictMode aktivert
    if (ignore.current) {
      return;
    }

    ignore.current = true;

    if (!isAuthenticated) {
      console.log('Not authenticated, redirecting');
      router
        .replace({
          pathname: '/auth/login',
          query: router.asPath !== '/' ? { continueUrl: router.asPath } : undefined,
        })
        .catch(console.error);
    } else {
      setChecked(true);
    }
  }, [isAuthenticated, router, router.isReady]);

  if (!checked) {
    return null;
  }

  //Hvis du har kommet hit betyr det at omdirigeringen ikke skjedde, og det forteller oss at brukeren er
  //autentisert/autorisert.

  return children;
};

AuthGuard.propTypes = {
  children: PropTypes.node,
};
