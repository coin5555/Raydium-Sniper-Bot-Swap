import { useContext } from 'react';

import Web3Context from '../contexts/web3Context';

const useWeb3 = () => {
  const context = useContext(Web3Context);

  if (!context) throw new Error('context must be use inside provider');

  return context;
};

export default useWeb3;
