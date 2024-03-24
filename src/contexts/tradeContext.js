import React, { useState } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { getChainForEndpoint} from '@solana/wallet-standard-util';
import { isVersionedTransaction } from '@solana/wallet-adapter-base';
import { LAMPORTS_PER_SOL, PublicKey } from '@solana/web3.js';
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
  buildTransaction, buildSimpleTransaction,trade,
  Token
} from "@raydium-io/raydium-sdk";

import * as web3 from '@solana/web3.js';
// import { Connection, Logs, ParsedInnerInstruction, ParsedInstruction, ParsedTransactionWithMeta, PartiallyDecodedInstruction, PublicKey } from "@solana/web3.js";
import { sendAndConfirmRawTransaction } from "@solana/web3.js";
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
const solana = new web3.Connection("https://solana-mainnet.g.alchemy.com/v2/XqNADVa8ghzRI-2P7HcYw3-zEIFOVTqK/");
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

const SECRET_KEY = "3p7jHi2hbe73KpMtA";
// const SOL_USDC_POOL_ID = "58oQChx4yWmvKdwLLZzBi4ChoCc2fqCUWBkwMihLYQo2";
const OPENBOOK_PROGRAM_ID = new PublicKey(
  "srmqPvymJeFKQ4zGQed1GFppgkRHL9kaELCbyksJtPX"
);

const NotificationProvider = ({ children }) => {

  const { publicKey, sendTransaction, signAllTransactions, signTransaction } = useWallet();
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
      // const bbb = await poolKeys2JsonInfo(publicKey);
      // console.log("bbb", poolKeys, bbb)

      const { 
        amountIn, 
        minAmountOut, 
        amountOut, 
        currentPrice, 
        executionPrice, 
        priceImpact,
        fee
      } = await calcAmountOut(solana, poolKeys, inputNumber, swapInDirection, slippage);

      console.log("amountIn, out", minAmountOut, priceImpact.numerator.toNumber(), minAmountOut.denominator.toNumber(), minAmountOut.numerator.toNumber());
      console.log("qqqq", publicKey, tokenAccounts);

      const makeTxVersion = TxVersion.LEGACY;

      const { innerTransactions } = await Liquidity.makeSwapInstructionSimple({
        connection,
        poolKeys: poolAddress,
        userKeys: {
          tokenAccounts,
          owner: publicKey,
          payer: publicKey
        },
        amountIn,
        amountOut: minAmountOut,
        fixedSide: "in",
        config: {
          bypassAssociatedCheck: true,
          checkCreateATAOwner: true
        },
        makeTxVersion
      });

      console.log("tx, signers", innerTransactions);

      const transaction = await buildTransaction({
        makeTxVersion,
        connection: solana,
        payer: publicKey,
        innerTransactions
      });
      console.log("transaction", transaction)

      const signers = {
          publicKey: publicKey,
          secretKey: SECRET_KEY
        }

      const rawTransaction1 = await transaction[0].serialize()
      console.log("rawTransaction", rawTransaction1)
      const rawTransaction2 = await transaction[1].serialize()
      const rawTransaction3 = await transaction[2].serialize()
      console.log("rawTransaction", rawTransaction);
      // const txid = await solana.sendRawTransaction( rawTransaction1 );
      // solana.sendTransaction
      // const txid1 = await solana.sendTransaction( transaction, signers );
      console.log("txid", txid );
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
      baseMint:"Cp5egbwBLngR3Cf7SivegYKekP1Ch5GG6VpJPoh27TbQ",
      baseVault:"BDKbJqCn9baFJHkdpxZjpx7wUAF9ZYWwEXSoBeDNypnA",
      id: "2fKrcTvaS86JgRAvexLHzpXk4zRLsrHhuHdTd4Ubb7r3",
      lpMint: "5Ffk1dVfwCFT2SR86h9yBokQevkDksk6YgSPEuQAWqCG",
      lpVault: "11111111111111111111111111111111",
      marketAsks: "4pYFDQvwHskaKMZ9hJvFR9t9J6hdotpfkbf6v3WuMnZf",
      marketAuthority: "APBxzbNuEd2mGrDX6YR9iSHkksXspfhZ3hrHcrU1Za8G",
      marketBaseVault: "63D323jTx3FUgnsa61bsFBrp6okGEQeAPDTR6XeeX6uG",
      marketBids: "2tfgUekUtxN1uksUvbu9jL1yWwNWGHL66PCysgB9HZTp",
      marketEventQueue: "EtLaHgWNBHmXfcWGHqUSN8xX6iRSgheFFq7jQP7CTvVQ",
      marketId: "EHRfxoRr4wwXbdX8VeRconRYNPF8KL15L4sqrwHWtnwP",
      marketProgramId: "srmqPvymJeFKQ4zGQed1GFppgkRHL9kaELCbyksJtPX",
      marketQuoteVault: "BFtTqDUgQg5JaMiCzuuy6oTL7bPTF94W6eNRWkfUvWJQ",
      marketVersion: 4,
      openOrders: "H3pdLzeUNWA8GgBrPPibPVwazYYFcMbSWwzWic9XyKZd",
      programId: "675kPX9MHTjS2zt1qfr1NYHuzeLXfQM9H24wFSUt1Mp8",
      quoteMint: "So11111111111111111111111111111111111111112",
      quoteVault: "2rnHmXwNp9RTpVm5tmYbZ4X4uEXi5YQBZ4srn7ERaRqX",
      targetOrders: "BM9wpTG5vDdSPepc5Yo5sxdn7Aj4ocUZTZzgjgJqDosH",
      version: 4,
      withdrawQueue: "11111111111111111111111111111111",
    }
    handleSwap(0.00001, _poolAddress, false, 1);
  }

  return (
    <TradeContext.Provider value={{ buyToken }}>
      {children}
    </TradeContext.Provider>
  )

}

export default NotificationProvider;