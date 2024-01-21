import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from './pages/home';
import History from './pages/history'
import { Provider } from 'react-redux'

import configureStore from './redux/store'
import { PersistGate } from 'redux-persist/lib/integration/react';
import "./App.css";


// import { Web3Provider } from './contexts/web3Context';
import NotificationProvider from './contexts/notificationContext';

import { ContextProvider as WalletContextProvider } from './contexts/walletContext';
import TradeContextProvider from "./contexts/tradeContext";

import * as buffer from "buffer";
window.Buffer = buffer.Buffer;

require("@solana/wallet-adapter-react-ui/styles.css");



let { store, persistor } = configureStore();


const darkTheme = createTheme({
  palette: {
    mode: 'dark',
  },
});


function App() {
  return (
    <Provider store={store}>
      <NotificationProvider>
          <WalletContextProvider>
            <PersistGate loading={null} persistor={persistor}>
              <TradeContextProvider>
                <ThemeProvider theme={darkTheme}>
                  <CssBaseline />
                  <BrowserRouter>
                    <Routes>
                      <Route path="/" element={<Home />}/>
                      <Route path="/history" element={<History />}/>
                    </Routes>
                  </BrowserRouter>
                </ThemeProvider>
              </TradeContextProvider>
            </PersistGate>
          </WalletContextProvider>
      </NotificationProvider>
    </Provider>
  );
}

export default App;
