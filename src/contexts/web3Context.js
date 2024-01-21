'use client';

import React, { createContext, useEffect, useState } from 'react';
import { useWallet } from "@solana/wallet-adapter-react";

import axios from 'axios';
import { useDispatch } from 'react-redux';
import useNotification from '../hooks/useNotification';




const Web3Context = createContext();

export const Web3Provider = ({ children }) => {
  
  const dispatch = useDispatch();
  
  const { select, wallets, publicKey, disconnect } = useWallet();
  const { showNotification } = useNotification();
  const [ walletName, setWalletName ] = useState(""); 
  const [ walletAddress, setWalletAddress ] = useState("");

  const [_web3, setWeb3] = useState(null);

  const connectWallet = () => new Promise(async(resolve, reject) => {
    try {
      const { solana } = window;
      if (solana) {
        if (solana.isPhantom) {
          // When using this flag, Phantom will only connect and emit a connect event if the application is trusted. Therefore, this can be safely called on page load for new users, as they won't be bothered by a pop-up window even if they have never connected to Phantom before.
          // if user already connected, { onlyIfTrusted: true }
          const response = await solana.connect({ onlyIfTrusted: true });
          console.log(
            "public key",
            response.publicKey.toString()
          );
          setWalletAddress(response.publicKey.toString())
          setWalletAddress(response.publicKey.toString());
          showNotification("Connection success", "success");
        } else {
          alert("Please install phantom wallet");
          showNotification("Please install Phantome wallet", "info");
        }
      } else {
        showNotification("Please install Phantome wallet", "info");
        window.location.href = "https://chrome.google.com/webstore/detail/phantom/bfnaelmomeimhlpmgjnjophhpkkoljpa";
      }
    } catch (error) {
      console.log(error);
    }
  });
  
 

  return (
    <Web3Context.Provider
      value={{
        _web3,
        connectWallet,
        walletAddress
      }}
    >
      {children}
    </Web3Context.Provider>
  );
};

export default Web3Context;
