import { useContext } from "react";

window.Buffer = require("buffer").Buffer;

const { TradeContext } = require("../contexts/tradeContext");


/**
 * 
 * @returns context { showNotification(text:string) }
 */
const useTrade = () => {
  const context = useContext(TradeContext);
  return context;
}

export default useTrade;