import { useLocalStorage } from '@solana/wallet-adapter-react';
import { createContext, useContext } from 'react';

export const AutoConnectContext = createContext({});
export function useAutoConnect(){
    return useContext(AutoConnectContext);
}
export const AutoConnectProvider = ({ children }) => {
    // TODO: fix auto connect to actual reconnect on refresh/other.
    // TODO: make switch/slider settings
    // const [autoConnect, setAutoConnect] = useLocalStorage('autoConnect', false);
    const [autoConnect, setAutoConnect] = useLocalStorage('autoConnect', true);
    return (
        <AutoConnectContext.Provider value={{ autoConnect, setAutoConnect }}>{children}</AutoConnectContext.Provider>
    );
};