import React, { createContext, useState, useContext } from 'react';

const UserContext = createContext();

export const useUser = () => useContext(UserContext);

export const UserProvider = ({ children }) => {
  const [username, setUsername] = useState('');

  const login = (name) => {
    setUsername(name);
  };

  const logout = () => {
    setUsername('');
  };

  return (
    <UserContext.Provider value={{ username, login, logout }}>
      {children}
    </UserContext.Provider>
  );
};