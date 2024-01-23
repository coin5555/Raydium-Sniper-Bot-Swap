import React, { useState } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { getChainForEndpoint} from '@solana/wallet-standard-util';
import { isVersionedTransaction } from '@solana/wallet-adapter-base';
import { LAMPORTS_PER_SOL, PublicKey } from '@solana/web3.js'
import {
  LOOKUP_TABLE_CACHE,
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

const SECRET_KEY = "3p7jHi2hbe73KpMtAw6HMPbcte17erPWmRDLeGZzUb6t8yX89GiJ2f5cw6RkzwRgjf4BMFV6eynUSWtpoY7ud3Uc";
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

      const transaction = await buildSimpleTransaction({
        makeTxVersion,
        connection: solana,
        payer: publicKey,
        innerTransactions
      });

      // const signers = {
      //     publicKey: publicKey,
      //     secretKey: SECRET_KEY
      //   }

      // const rawTransaction = await signAllTransactions(transaction)
      // console.log("rawTransaction", rawTransaction);
      // const txid = await connection.sendRawTransaction({transaction, signers});
      // solana.sendTransaction
      const txid1 = await sendTransaction( transaction[1], solana );
      console.log("txid", txid1 );
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
      // authority: "5Q544fKrFoe6tsEbD7S8EmxGTJYAKtTVhAW5Q5pge4j1",
      // baseMint: "91H4kSKiutqpmTnbmsrvBe29uxBZjM7PzfuUxJWBeHiS",
      // baseVault: "CQoJBmoZaMm38eZYCA3wH84dV5RfCN5Y5vSobegNpZLr",
      // id: "zWcwzL5UVXqByB9MLNEbrNpUeEGYrpFqCHyfvaJbDr4",
      // lpMint: "Dic8Aygn2zRj4QCyfeTRpwdMBdTxgJXerWHtoTnPKVme",
      // lpVault: "11111111111111111111111111111111",
      // marketAsks: "FxFWvVRkr8wdWsvW5svfuqP2PrhrzWFq7cyEGgAMBRMU",
      // marketAuthority: "C2LjyLv9SKD4EZAYrcsKP4jMkCAwgvA2rT7TWAtwWhV4",
      // marketBaseVault: "EjrrbE3JqhpTLVMjfdw8oNi4njV1hLX3zski1gUaVHRy",
      // marketBids: "5WQcu1NCnfxWzmb8bXn8kVsMbYf3GDbUWtcDWSvgbYLx",
      // marketEventQueue: "AmtRGEAB3gBf9eVebXLSFa6LJYgySpMzXwJ3RACpjREE",
      // marketId: "BbRp5P23hRhUjxcecpZoZ8QEAsS7JqqMYJpwa3kkMDoa",
      // marketProgramId: "srmqPvymJeFKQ4zGQed1GFppgkRHL9kaELCbyksJtPX",
      // marketQuoteVault: "FS7yK34bEA7daXjDdEaZfkLtafwY1k9BdrdEGQMdToQr",
      // marketVersion: 4,
      // openOrders: "7tfZ8zPZViVdqQq8TSiNPh5eEc1Aok11cw6tVgq97PGE",
      // programId: "675kPX9MHTjS2zt1qfr1NYHuzeLXfQM9H24wFSUt1Mp8",
      // quoteMint: "So11111111111111111111111111111111111111112",
      // quoteVault: "HwMRMGgu7yi12PHsjUEndTsrC5RJjbNVYqQgdXMqS1S2",
      // targetOrders: "BAZ9wY7kes2xzGZ54hSSGQ8SVdesRUEZsCPsLqd7WGPs",
      // version: 4,
      // withdrawQueue: "11111111111111111111111111111111",

      authority:"5Q544fKrFoe6tsEbD7S8EmxGTJYAKtTVhAW5Q5pge4j1",
      baseMint:"Cp5egbwBLngR3Cf7SivegYKekP1Ch5GG6VpJPoh27TbQ",
      baseVault:"BDKbJqCn9baFJHkdpxZjpx7wUAF9ZYWwEXSoBeDNypnA",
      id: "2fKrcTvaS86JgRAvexLHzpXk4zRLsrHhuHdTd4Ubb7r3",
      // lookupTableAccount: "6E4P3eQKrCqLxWStiXd7PXAYbW681Yd5Gz5EaFDDw9nD",
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