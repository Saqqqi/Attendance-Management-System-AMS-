import React, { createContext, useContext, useEffect, useRef, useCallback } from 'react';

const InactivityContext = createContext();

export const useInactivity = () => useContext(InactivityContext);

export const InactivityProvider = ({ children }) => {
  const inactivityTimer = useRef(null);
  const INACTIVITY_PERIOD = 1000000;

  const lockScreen = useCallback(() => {
    console.log('Locking screen due to inactivity');
    
    if (window.electron) {
      window.electron.lockScreen(); 
    } else {
      window.location.replace('../lock.html'); 
    }
  }, []);

  const resetTimer = useCallback(() => {
    clearTimeout(inactivityTimer.current);
    inactivityTimer.current = setTimeout(lockScreen, INACTIVITY_PERIOD); 
  }, [lockScreen, INACTIVITY_PERIOD]);

  useEffect(() => {

    const events = ['mousemove', 'keydown', 'click', 'touchstart']; 

    events.forEach((event) => window.addEventListener(event, resetTimer));

    resetTimer();

    return () => {
      events.forEach((event) => window.removeEventListener(event, resetTimer));
      clearTimeout(inactivityTimer.current);
    };
  }, [resetTimer]);

  return (
    <InactivityContext.Provider value={{ resetTimer }}>
      {children}
    </InactivityContext.Provider>
  );
};
