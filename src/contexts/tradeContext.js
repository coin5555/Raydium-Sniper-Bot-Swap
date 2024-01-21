import React, { useState } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { LAMPORTS_PER_SOL, PublicKey } from '@solana/web3.js'
import {
  Liquidity,
  TradeV2,
  LiquidityPoolKeys,
  jsonInfo2PoolKeys,
  poolKeys2JsonInfo,
  LiquidityPoolJsonInfo,
  TokenAccount,
  Trade,
  AccountMetaReadonly,
  LiquidityMath,
  LiquidityPoolStatus,
  Market,
  Rounding,
  Spl,
  SwapMath,
  TxVersion,
  buildTransaction, buildSimpleTransaction,
  UnsignedTransactionAndSigners,
  Token

  
} from "@raydium-io/raydium-sdk";

import * as web3 from '@solana/web3.js';
// import { Connection, Logs, ParsedInnerInstruction, ParsedInstruction, ParsedTransactionWithMeta, PartiallyDecodedInstruction, PublicKey } from "@solana/web3.js";
import { Connection } from "@solana/web3.js";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import {
  // TokenAccount,
  SPL_ACCOUNT_LAYOUT,
  LIQUIDITY_STATE_LAYOUT_V4,
} from "@raydium-io/raydium-sdk";
import { OpenOrders } from "@project-serum/serum";
import BN from "bn.js";


import useNotification from '../hooks/useNotification';

import { getTokenAccountsByOwner, calcAmountOut } from '../utils/raydium';

import { Metaplex } from '@metaplex-foundation/js';

// import { Metadata } from "@metaplex-foundation/mpl-token-metadata";

// const solana = new web3.Connection("https://api.mainnet-beta.solana.com/");
const solana = new web3.Connection("https://solana-mainnet.g.alchemy.com/v2/XqNADVa8ghzRI-2P7HcYw3-zEIFOVTqK/");
// const solana = new web3.Connection("https://morning-ancient-crater.solana-mainnet.quiknode.pro/5e0b497a55b41fe0eebaac48f784367e8b98f706/");
export const TradeContext = React.createContext(null);

async function getTokenAccounts(connection, owner) {
  const tokenResp = await connection.getTokenAccountsByOwner(owner, {
    programId: TOKEN_PROGRAM_ID,
  });

  const accounts = [];
  for (const { pubkey, account } of tokenResp.value) {
    accounts.push({
      pubkey,
      accountInfo: SPL_ACCOUNT_LAYOUT.decode(account.data),
    });
  }

  return accounts;
}

const SOL_USDC_POOL_ID = "58oQChx4yWmvKdwLLZzBi4ChoCc2fqCUWBkwMihLYQo2";
const OPENBOOK_PROGRAM_ID = new PublicKey(
  "srmqPvymJeFKQ4zGQed1GFppgkRHL9kaELCbyksJtPX"
);

const NotificationProvider = ({ children }) => {

  const { publicKey, sendTransaction } = useWallet();
  const { connection } = useConnection();
  const { showNotification } = useNotification();
  const [solBalance, setSolBalance] = useState(0);
  const [rayBalance, setRayBalance] = useState(0);
  const [tokenAccounts, setTokenAccounts] = useState({})

  const getAccountInfo = async () => {
    if (publicKey !== null) {
      const balance = await connection.getBalance(publicKey); // get SOL balance
      setSolBalance(balance / LAMPORTS_PER_SOL);

      const tokenAccs = await getTokenAccountsByOwner(connection, publicKey); // get all token accounts
      setTokenAccounts(tokenAccs);
    }
  };

  React.useEffect(() => {
    console.log("asdfasd")
    getAccountInfo()
  }, [publicKey]);

  React.useEffect(() => {
    console.log(tokenAccounts, solBalance)
  }, [solBalance]);

  const handleSwap = (amount = 1, poolAddress, swapInDirection = true, slippage) => new Promise(async (resolve, reject) => {
    console.log(swapInDirection, slippage, poolAddress)
    try {
      const inputNumber = amount;
      if (!publicKey || !poolAddress) {
        console.log("empty publicKey or poolAddress")
        throw new Error("empty publicKey or poolAddress");
      }

    const poolKeys = await jsonInfo2PoolKeys(poolAddress);
    console.log("bbb", poolKeys, publicKey)

    const { amountIn, minAmountOut } = await calcAmountOut(solana, poolKeys, inputNumber, swapInDirection, slippage);    

      console.log("amountIn, out", amountIn, minAmountOut);
      console.log("qqqq", publicKey, sendTransaction);


      const transaction = await Liquidity.makeSwapInstructionSimple({
        connection,
        poolKeys: poolAddress,
        userKeys: {
          tokenAccounts,
          owner: publicKey,
        },
        amountIn,
        amountOut: minAmountOut,
        fixedSide: "in"
      });
      const feePayer = "";
      console.log("tx, signers", transaction);

      // const txid = await sendTransaction({transaction: transaction.innerTransactions, connection: solana, feePayer, skipPreflight: true});
      const txid = await solana.sendTransaction({transaction: transaction.innerTransactions, connection: solana, feePayer, skipPreflight: true});
      showNotification("Transaction sent", "info");
      showNotification(`Check it at https://solscan.io/tx/${txid}`, "info");
      showNotification("success", "success");
    } catch (err) {
      console.log('tx failed => ', err);
      showNotification("failed", "error")
    }

  });

  const buyToken = async () => {
    const _poolAddress = {
      authority:"5Q544fKrFoe6tsEbD7S8EmxGTJYAKtTVhAW5Q5pge4j1",
      baseMint:"91H4kSKiutqpmTnbmsrvBe29uxBZjM7PzfuUxJWBeHiS",
      baseVault:"CQoJBmoZaMm38eZYCA3wH84dV5RfCN5Y5vSobegNpZLr",
      id:"zWcwzL5UVXqByB9MLNEbrNpUeEGYrpFqCHyfvaJbDr4",
      lpMint:"Dic8Aygn2zRj4QCyfeTRpwdMBdTxgJXerWHtoTnPKVme",
      lpVault:"11111111111111111111111111111111",
      marketAsks:"FxFWvVRkr8wdWsvW5svfuqP2PrhrzWFq7cyEGgAMBRMU",
      marketAuthority:"C2LjyLv9SKD4EZAYrcsKP4jMkCAwgvA2rT7TWAtwWhV4",
      marketBaseVault:"EjrrbE3JqhpTLVMjfdw8oNi4njV1hLX3zski1gUaVHRy",
      marketBids:"5WQcu1NCnfxWzmb8bXn8kVsMbYf3GDbUWtcDWSvgbYLx",
      marketEventQueue:"AmtRGEAB3gBf9eVebXLSFa6LJYgySpMzXwJ3RACpjREE",
      marketId:"BbRp5P23hRhUjxcecpZoZ8QEAsS7JqqMYJpwa3kkMDoa",
      marketProgramId:"srmqPvymJeFKQ4zGQed1GFppgkRHL9kaELCbyksJtPX",
      marketQuoteVault:"FS7yK34bEA7daXjDdEaZfkLtafwY1k9BdrdEGQMdToQr",
      marketVersion:4,
      openOrders:"7tfZ8zPZViVdqQq8TSiNPh5eEc1Aok11cw6tVgq97PGE",
      programId:"675kPX9MHTjS2zt1qfr1NYHuzeLXfQM9H24wFSUt1Mp8",
      quoteMint:"So11111111111111111111111111111111111111112",
      quoteVault:"HwMRMGgu7yi12PHsjUEndTsrC5RJjbNVYqQgdXMqS1S2",
      targetOrders:"BAZ9wY7kes2xzGZ54hSSGQ8SVdesRUEZsCPsLqd7WGPs",
      version:4,
      withdrawQueue:"11111111111111111111111111111111"
    }
    handleSwap(0.001, _poolAddress, false, 5);
  }

  return (
    <TradeContext.Provider value={{ buyToken }}>
      {children}
    </TradeContext.Provider>
  )

}

export default NotificationProvider;