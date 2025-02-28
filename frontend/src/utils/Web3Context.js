import React, { createContext, useContext } from 'react';

const Web3Context = createContext();

export const Web3Provider = ({ children, value }) => {
  return <Web3Context.Provider value={value}>{children}</Web3Context.Provider>;
};

export const useWeb3 = () => {
  const context = useContext(Web3Context);
  if (context === undefined) {
    throw new Error('useWeb3 must be used within a Web3Provider');
  }
  return context;
}; 