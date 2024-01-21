import React from 'react';
import TextField from './mini/TextField';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import InputAdornment from '@mui/material/InputAdornment';
import FormControlLabel from '@mui/material/FormControlLabel';
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import IconButton from '@mui/material/IconButton';

import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import CheckIcon from '@mui/icons-material/Check';
import LocalGroceryStoreIcon from '@mui/icons-material/LocalGroceryStore';
import NotInterestedIcon from '@mui/icons-material/NotInterested';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import axios from 'axios';
import { SERVER_URL } from '../redux/utils';
import { getAccount, getMintCloseAuthority, getMint } from "@solana/spl-token";
// const Metadata = require("@metaplex-foundation/mpl-token-metadata");
import { useDispatch, useSelector } from 'react-redux';
import useTrade from '../hooks/useTrade';
import PropTypes from "prop-types";
import * as web3 from '@solana/web3.js';

window.Buffer = window.Buffer || require("buffer").Buffer;

const { PublicKey } = require('@solana/web3.js');

// const web3 = require("@solana/web3.js");

// const solana = new web3.Connection("https://morning-ancient-crater.solana-mainnet.quiknode.pro/5e0b497a55b41fe0eebaac48f784367e8b98f706/");

const solana = new web3.Connection("https://solana-mainnet.g.alchemy.com/v2/XqNADVa8ghzRI-2P7HcYw3-zEIFOVTqK/");


const Bot = (props) => {

  const dispatch = useDispatch();

  const { buyToken } = useTrade();


  const [isApplying, setIsApplying] = React.useState(false);
  const [ isCustom, setIsCustom ] = React.useState(false);

  // const [ results, setResults ] = React.useState()

  const handleCustomChange = (e) => {
    setIsCustom(e.target.checked)
  }



  const handleApply = async() => {
    // console.log(props.liquidity.min, props.liquidity.max, props.fdv.min, props.fdv.max)
    // const options = {
    //   method: 'POST',
    //   url: 'https://api.solana.fm/v1/tokens',
    //   headers: {accept: 'application/json', 'content-type': 'application/json'},
    //   data: {
    //     // tokens: testData.map(item => item.baseToken.address).slice(0,2)
    //     tokens: [
    //       "26LdyRgGHLe8G1hgqXUE7hUkVczUFtayzSAtyaJre19q",
    //       "2QMXeDNeJ9RXXFqNb1AGCAt2MtwH66r63yNHFUND9WZn"
    //     ]
    //   }
    // };

    try {
      setIsApplying(true);
      const params = { pairCreatedAt_min: props.pairAge.min, pairCreatedAt_max: props.pairAge.max };
      const res = await axios.post(`${SERVER_URL}/pairs`, params);
      const pairs = res.data;

      

      let data = [], i = 0;

      //start createdAtfilter
      while ( true && pairs.length > 0 ) {
        let endpoint = '';
        pairs.slice(i*30, (i+1)*30).forEach(({id}) => { endpoint += `${id},` });
        endpoint = endpoint.substring(0, endpoint.length - 1);
        console.log(i)
        const response = await axios.get(`https://api.dexscreener.com/latest/dex/pairs/solana/${endpoint}`, {
          headers: {
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7'
          }
        });
        if ( response.data.pairs ) {
          data = [...data, ...response.data.pairs];
        }
        i++;
        if ( i*30 >= pairs.length ) {
          break;
        }
      }

      for (let i = 0; i < data.length; i++) {
        
      }
      console.log("data from dexscreener[no filter]", data, pairs)

      //end createdAt filter
      //liquidty
      let temp = [];

      for (let i = 0; i < data.length; i++) {
        
        const element = data[i];

        const _pairAddress = element.pairAddress;
        element.liquidityInfo = pairs.find(item => item.id === _pairAddress).liquidityData;


        if ( !(Number(element.liquidity.usd) > Number(props.liquidity.min) && Number(element.liquidity.usd) < Number(props.liquidity.max)) ) {
          continue;
        } else if ( !element.fdv ) {
          continue;
        } else if ( !(Number(element.fdv) > Number(props.fdv.min) && Number(element.fdv) < Number(props.fdv.max)) ) {
          continue;
        } else if ( !(Number(element.priceNative) > Number(props.limitPrice.min) && Number(element.priceNative) < Number(props.limitPrice.max)) ) {
          continue;
        }

        const res = await solana.getTokenSupply( new web3.PublicKey(element.baseToken.address) );
        element.totalSupply = res.value.uiAmount;

        const tokensInLP = Number(element.liquidity.base)*100 / element.totalSupply;
        element.tokensInLP = tokensInLP;

        if( !( tokensInLP > Number(props.tokensInLP.min) && tokensInLP < Number(props.tokensInLP.max) ) ) {
          continue;
        }

        // const ownerPublicKey = "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        // const tokenAccount = await solana.getParsedTokenAccountsByOwner(ownerPublicKey, {
        //   mint: "DVt6uhFnGkNGjWCMoePc13N8YHpnaZaxfLvopguAKnqp"
        // });

        // const _accounts = await getAccount(solana, new web3.PublicKey(element.baseToken.address));
        // element.creator = _accounts;

        // const mintAddr=(await solana.getParsedAccountInfo(element.baseToken.address)).mint
        const mintData = await getMint(solana, new web3.PublicKey(element.baseToken.address))

        // mintData.mintAuthority is the address that can mint that token

        // const tokenAccount = await getTokenInfo(element.baseToken.address);
        element.creator = mintData.mintAuthority;

        if( ( props.renounced && element.creator ) || ( !props.renounced && !element.creator ) ) { //renounced filter
          continue;
        }
        //top5, top10
        const _res = await solana.getTokenLargestAccounts( new web3.PublicKey(element.baseToken.address) );

        const tops = _res.value.map(({ uiAmount }) => uiAmount);
        const removeIndex = tops.map(item => Math.floor(item)).indexOf(Math.floor(element.liquidity.base));
        tops.splice(removeIndex, 1);
        element.top5 = tops.slice(0,5).reduce((accumulator, uiAmount) => accumulator + uiAmount, 0) * 100 / element.totalSupply;
        element.top10 = tops.slice(0,10).reduce((accumulator, uiAmount) => accumulator + uiAmount, 0) * 100 / element.totalSupply;

        if( !( element.top5 > Number(props.top5.min) && element.top5 < Number(props.top5.max) ) ) {
          continue;
        }
        if( !( element.top10 > Number(props.top10.min) && element.top10 < Number(props.top10.max) ) ) {
          continue;
        }

        
        temp = [...temp, element];

      }
      data = temp;

      console.log(data)

      dispatch({
        type: "SET_DATA",
        payload: {
          id: props.id,
          data
        }
      })
      // console.log(data)
      // const _LPres = await solana.getTokenLargestAccounts( new web3.PublicKey("418MFhkaYQtbn529wmjLLqL6uKxDz7j4eZBaV1cobkyd") );
      // console.log("LPres", _LPres);
      // // 
      
      // const data = await solana.getTokenLargestAccounts( new web3.PublicKey(testelement.baseToken.address) );
      // testelement.top5 = data.value.slice(0,5).reduce((accumulator, { amount }) => accumulator + Number(amount), 0);
      // testelement.top10 = data.value.slice(0,10).reduce((accumulator, { amount }) => accumulator + Number(amount), 0);
    } catch ( err ) {
      console.log(err)
    } finally {
      setIsApplying(false)
    }
  }

  const handleExitConditionChange = ( id, value, pos ) => {
    if ( value < 0 || value > 100 ) {
      return;
    }
    dispatch({
      type: "CHANGE_EXIT_CONDITION",
      payload: {
        id: props.id,
        name: "exitConditions",
        value,
        pos,
        index: id
      }
    })
  }

  const handleAddExitCondition = () => {
    dispatch({
      type: "ADD_EXIT_CONDITION",
      payload: {
        id: props.id,
      }
    })
  }

  const handleDeleteExitCondition = () => {
    dispatch({
      type: "DELETE_EXIT_CONDITION",
      payload: {
        id: props.id,
      }
    })
  }

  const handleChange = (name, pos, value, min, max) => {

    if ( value < min || value > max ) {
      return;
    }

    dispatch({
      type: "ON_CHANGE",
      payload: {
        id: props.id,
        type: "ON_CHANGE",
        name: name, 
        value: value,
        pos: pos
      }
    })
  }

  const _renderItems = () => (
    <Box width='100%' sx={{backgroundColor:'#ffffff11', borderRadius:5, pb:2, px: 1, maxHeight:490, fontSize:12, overflowY:'scroll'}} className="scroller_view">
      <Grid container sx={{ fontSize:17 }} mt={1} pl={2}> 
        ( {props.data.length} pairs )
      </Grid>
      <Grid container sx={{ borderBottom:'1px solid #ffffff22', fontSize:17 }} mt={1}>
        <Grid item xs={6} textAlign='center'>Token Address</Grid><Grid textAlign='center' item xs={6}>Token Name</Grid>
      </Grid>
      {
        props.data.map((item, i) => <Grid key={item.baseToken.address + i} container mt={1}><Grid textAlign='center' item xs={6}>{item.baseToken.address.substring(0,6) + "......" + item.baseToken.address.substring(item.pairAddress.length - 6)}</Grid><Grid textAlign='center' item xs={6}>{item.baseToken.name}</Grid></Grid>)
      }
    </Box>
  )

  return (
    <Grid container spacing={5} alignItems='start'>
      <Grid item container xs={12} md={7}>
        <Grid container alignItems='center' mt={2} gap={2}>
          <Grid item xs={2}>Liquidity: </Grid>
          <Grid item xs={4}>
            <TextField
              label="MIN"
              fullWidth
              value={props.liquidity.min.toString()}
              onChange={e => handleChange("liquidity", "min", e.target.value, 0, 10000000)}
              id="margin-none"
              type="number"
              InputProps={{startAdornment: <InputAdornment position="start" sx={{'& p':{color:'white!important'}}}>USD$</InputAdornment>}}
            />
          </Grid>
          <Grid item xs={4} gap={2}>
            <TextField
              label="MAX"
              fullWidth
              value={props.liquidity.max.toString()}
              onChange={e => handleChange("liquidity", "max", e.target.value, 0, 10000000)}
              id="margin-none"
              type="number"
              InputProps={{startAdornment: <InputAdornment position="start" sx={{'& p':{color:'white!important'}}}>USD$</InputAdornment>}}
            />
          </Grid>
        </Grid>
        <Grid container alignItems='center' mt={3}  gap={2}>
          <Grid item xs={2}>FDV: </Grid>
          <Grid item xs={4}>
            <TextField
              label="MIN"
              fullWidth
              value={props.fdv.min.toString()}
              onChange={e => handleChange("fdv", "min", e.target.value, 0, 10000000)}
              id="margin-none"
              type="number"
              InputProps={{startAdornment: <InputAdornment position="start" sx={{'& p':{color:'white!important'}}}>USD$</InputAdornment>}}
            />
          </Grid>
          <Grid item xs={4}>
            <TextField
              label="MAX"
              fullWidth
              value={props.fdv.max.toString()}
              onChange={e => handleChange("fdv", "max", e.target.value, 0, 10000000)}
              id="margin-none"
              type="number"
              InputProps={{startAdornment: <InputAdornment position="start" sx={{'& p':{color:'white!important'}}}>USD$</InputAdornment>}}
            />
          </Grid>
        </Grid>
        <Grid container alignItems='center' mt={3}  gap={2}>
          <Grid item xs={2}>Pair Age: </Grid>
          <Grid item xs={4}>
            <TextField
              label="MIN"
              fullWidth
              value={props.pairAge.min.toString()}
              onChange={e => handleChange("pairAge", "min", e.target.value, 0, 10000000)}
              id="margin-none"
              type="number"
              InputProps={{startAdornment: <InputAdornment position="start" sx={{'& p':{color:'white!important'}}}>HOURS</InputAdornment>}}
            />
          </Grid>
          <Grid item xs={4}>
            <TextField
              label="MAX"
              fullWidth
              value={props.pairAge.max.toString()}
              onChange={e => handleChange("pairAge", "max", e.target.value, 0, 10000000)}
              id="margin-none"
              type="number"
              InputProps={{startAdornment: <InputAdornment position="start" sx={{'& p':{color:'white!important'}}}>HOURS</InputAdornment>}}
            />
          </Grid>
        </Grid>
        <Grid container alignItems='center' mt={3}  gap={2}>
          <Grid item xs={2}>Limit Price: </Grid>
          <Grid item xs={4}>
            <TextField
              label="MIN"
              fullWidth
              value={props.limitPrice.min.toString()}
              onChange={e => handleChange("limitPrice", "min", e.target.value, 0, 100)}
              id="margin-none"
              type="number"
              InputProps={{startAdornment: <InputAdornment position="start" sx={{'& p':{color:'white!important'}}}>%</InputAdornment>}}
            />
          </Grid>
          <Grid item xs={4}>
            <TextField
              label="MAX"
              fullWidth
              value={props.limitPrice.max.toString()}
              onChange={e => handleChange("limitPrice", "max", e.target.value, 0, 100)}
              id="margin-none"
              type="number"
              InputProps={{startAdornment: <InputAdornment position="start" sx={{'& p':{color:'white!important'}}}>%</InputAdornment>}}
            />
          </Grid>
        </Grid>
        <Grid container alignItems='center' mt={3}  gap={2}>
          <Grid item xs={2}>Tokens In LP: </Grid>
          <Grid item xs={4}>
            <TextField
              label="MIN"
              fullWidth
              id="margin-none"
              value={props.tokensInLP.min.toString()}
              onChange={e => handleChange("tokensInLP", "min", e.target.value, 0, 100)}
              type="number"
              InputProps={{startAdornment: <InputAdornment position="start" sx={{'& p':{color:'white!important'}}}>%</InputAdornment>}}
            />
          </Grid>
          <Grid item xs={4}>
            <TextField
              label="MAX"
              fullWidth
              id="margin-none"
              value={props.tokensInLP.max.toString()}
              onChange={e => handleChange("tokensInLP", "max", e.target.value, 0, 100)}
              type="number"
              InputProps={{startAdornment: <InputAdornment position="start" sx={{'& p':{color:'white!important'}}}>%</InputAdornment>}}
            />
          </Grid>
        </Grid>
        <Grid container alignItems='center' mt={3}  gap={2}>
          <Grid item xs={2}>Top5: </Grid>
          <Grid item xs={4}>
            <TextField
              label="MIN"
              fullWidth
              id="margin-none"
              value={props.top5.min.toString()}
              onChange={e => handleChange("top5", "min", e.target.value, 0, 100)}
              type="number"
              InputProps={{startAdornment: <InputAdornment position="start" sx={{'& p':{color:'white!important'}}}>%</InputAdornment>}}
            />
          </Grid>
          <Grid item xs={4}>
            <TextField
              label="MAX"
              fullWidth
              value={props.top5.max.toString()}
              onChange={e => handleChange("top5", "max", e.target.value, 0, 100)}
              id="margin-none"
              type="number"
              InputProps={{startAdornment: <InputAdornment position="start" sx={{'& p':{color:'white!important'}}}>%</InputAdornment>}}
            />
          </Grid>
        </Grid>
        <Grid container alignItems='center' mt={3}  gap={2}>
          <Grid item xs={2}>Top10: </Grid>
          <Grid item xs={4}>
            <TextField
              label="MIN"
              fullWidth
              value={props.top10.min.toString()}
              onChange={e => handleChange("top10", "min", e.target.value, 0, 100)}
              id="margin-none"
              type="number"
              InputProps={{startAdornment: <InputAdornment position="start" sx={{'& p':{color:'white!important'}}}>%</InputAdornment>}}
            />
          </Grid>
          <Grid item xs={4}>
            <TextField
              label="MAX"
              fullWidth
              value={props.top10.max.toString()}
              onChange={e => handleChange("top10", "max", e.target.value, 0, 100)}
              id="margin-none"
              type="number"
              InputProps={{startAdornment: <InputAdornment position="start" sx={{'& p':{color:'white!important'}}}>%</InputAdornment>}}
            />
          </Grid>
        </Grid>
        <Grid container alignItems='center' mt={3}  gap={2}>
          <Grid item xs={2}></Grid>
          <Grid item xs={4} container alignItems='center' gap={1}>
            <Checkbox 
              checked={props.renounced} 
               
              onChange={e => handleChange("renounced", null, e.target.checked)}
            />Renounced
          </Grid>
          <Grid item xs={4}  container alignItems='center' gap={1}>
            <Checkbox checked={props.burned} onChange={e => handleChange("burned", null, e.target.checked)}  />Burned
          </Grid>
        </Grid>
        <Grid container alignItems='center' mt={3}  gap={2}>
          <Grid item xs={2}>Creator: </Grid>
          <Grid item xs={4}>
            <TextField
              label="MIN"
              fullWidth
              value={props.creator.min.toString()}
              onChange={e => handleChange("creator", "min", e.target.value, 0, 100)}
              id="margin-none"
              type="number"
              InputProps={{startAdornment: <InputAdornment position="start" sx={{'& p':{color:'white!important'}}}>%</InputAdornment>}}
            />
          </Grid>
          <Grid item xs={4}>
            <TextField
              label="MAX"
              fullWidth
              value={props.creator.max.toString()}
              onChange={e => handleChange("creator", "max", e.target.value, 0, 100)}
              id="margin-none"
              type="number"
              InputProps={{startAdornment: <InputAdornment position="start" sx={{'& p':{color:'white!important'}}}>%</InputAdornment>}}
            />
          </Grid>
        </Grid>
      </Grid>
      <Grid item container xs={12} md={5} alignItems='start' mt={1.5}>
        { _renderItems() }
        <Grid container justifyContent='space-between' spacing={2} mt={2}>
          <Grid item xs={6}>
            <Button onClick={handleApply} variant="outlined" fullWidth>
            {
              isApplying ? "LOADING..." :
              <><CheckIcon/>Apply</>
            }
            </Button>
          </Grid>
          <Grid item xs={6}><Button variant="outlined" fullWidth onClick={() => props.handleDelete(props.id) }><DeleteIcon/>Delete Bot</Button></Grid>
        </Grid>
      </Grid>
      <Box width="100%" border="1px solid #ffffff11" mt={2}></Box>

      <Grid container pl={5} spacing={5} alignItems='start' mt={2}>
        <Grid item container xs={12} md={7} mt={2.5}>
        {
          props.exitConditions.map((item, i) => 
          <Grid key={`kkk_${i}`} container alignItems='center' mt={2} gap={2}>
            <Grid item xs={2}>{ i === 0 && "Exit Condition: " }</Grid>
            <Grid item xs={4}>
              <TextField
                label="Amount Of My Balance"
                fullWidth
                id="margin-none"
                value={item.min.toString()}
                onChange={e => handleExitConditionChange(i, e.target.value, "min")}
                type="number"
                InputProps={{startAdornment: <InputAdornment position="start" sx={{'& p':{color:'white!important'}}}>%</InputAdornment>}}
              />
            </Grid>
            <Grid item xs={4} gap={2}>
              <TextField
                label="Profit About First Entry Price"
                fullWidth
                id="margin-none"
                value={item.max.toString()}
                onChange={e => handleExitConditionChange(i, e.target.value, "max")}
                type="number"
                InputProps={{startAdornment: <InputAdornment position="start" sx={{'& p':{color:'white!important'}}}>%</InputAdornment>}}
              />
            </Grid>
            { 
              i === 0 ? 
              <IconButton onClick={handleAddExitCondition} sx={{ backgroundColor:'#00eeff33' }} color="primary" aria-label="add to shopping cart"><AddIcon/></IconButton> : 
              <IconButton onClick={handleDeleteExitCondition} color="primary" aria-label="add to shopping cart"><DeleteIcon/></IconButton>
            }  
            
          </Grid>)
        }

        </Grid>
        <Grid item container xs={12} md={5} alignItems='start'>
          <Grid item xs={12} width='100%'>Slippage Tolerance:</Grid>
          <Grid item xs={12} container alignItems='start' mt={2}>
            <TextField
              label="MAX"
              fullWidth
              id="margin-none"
              type="number"
              onChange={e => handleChange("slippageTolerance", null, e.target.value)}
              value={props.slippageTolerance.toString()}
              InputProps={{startAdornment: <InputAdornment position="start" sx={{'& p':{color:'white!important'}}}>%</InputAdornment>}}
            />
          </Grid>
          <Grid item xs={12} mt={3} width='100%'>Entry Condition:</Grid>
          <Grid item xs={12} container alignItems='start' mt={2}> 
            <TextField
              label="Full Position"
              fullWidth
              id="margin-none"
              type="number"
              value={props.fullPosition.toString()}
              onChange={e => handleChange("fullPosition", null, e.target.value)}
              InputProps={{startAdornment: <InputAdornment position="start" sx={{'& p':{color:'white!important'}}}>Amount</InputAdornment>}}
            />
          </Grid>
          <Grid item xs={12} container alignItems='start' mt={3}>
            <TextField
              label="Split"
              fullWidth
              id="margin-none"
              type="number"
              value={props.split.toString()}
              onChange={e => handleChange("split", null, e.target.value)}
              InputProps={{startAdornment: <InputAdornment position="start" sx={{'& p':{color:'white!important'}}}>Number</InputAdornment>}}
            />
          </Grid>
          <Grid item xs={12} container alignItems='start' mt={3}>
            <TextField
              label="Interval"
              fullWidth
              id="margin-none"
              type="number"
              value={props.interval.toString()}
              onChange={e => handleChange("interval", null, e.target.value)}
              InputProps={{startAdornment: <InputAdornment position="start" sx={{'& p':{color:'white!important'}}}>SECONDS</InputAdornment>}}
            />
          </Grid>
          <Grid item xs={12} my={2} width='100%' container justifyContent='space-between' alignItems='center'>Transaction Priority: <FormControlLabel control={<Checkbox checked={isCustom} onChange={handleCustomChange}  />} label="Custom" /></Grid>
          {
            !isCustom ?
            <FormControl fullWidth size="small">
              <InputLabel id="demo-select-small-label" sx={{zIndex:"10000000!important", backgroundColor:'#121212'}}>Transaction Priority</InputLabel>
              <Select
                labelId="demo-select-small-label"
                id="demo-select-small"
                fullWidth
                value={props.transactionPriority}
                label="Transaction Priority"
                // sx={{border:'1px solid white'}}
                onChange={e => handleChange("transactionPriority", null, e.target.value)}
              >
                {/* <MenuItem value="">
                  <em>None</em>
                </MenuItem> */}
                <MenuItem value={-1}>Auto (Dynamic)</MenuItem>
                <MenuItem value={0.0005}>High (0.00005 sol)</MenuItem>
                <MenuItem value={0}>Normal (0 sol)</MenuItem>
                <MenuItem value={0.005}>Turbo (0.005 sol)</MenuItem>
              </Select>
            </FormControl> :
            <TextField
              label="CUSTOM"
              fullWidth
              id="margin-none"
              type="number"
              value={props.transactionPriority}
              onChange={e => handleChange("transactionPriority", null, e.target.value)}
              InputProps={{startAdornment: <InputAdornment position="start" sx={{'& p':{color:'white!important'}}}>SOL</InputAdornment>}}
            />
          }
          <Grid container justifyContent='space-between' spacing={2} mt={2}>

            <Grid item xs={6}><Button onClick={buyToken} variant="contained" fullWidth><LocalGroceryStoreIcon/>&nbsp;&nbsp;AUTO BUY</Button></Grid>
            <Grid item xs={6}><Button variant="outlined" fullWidth><NotInterestedIcon/>&nbsp;&nbsp;Exit Bot</Button></Grid>
          </Grid>
        </Grid>
        {/* <Grid item container xs={12} md={4} alignItems='start'>
          <Grid container justifyContent='space-between' spacing={2}>
            <Grid item xs={6}><Button variant="contained" fullWidth><LocalGroceryStoreIcon/>&nbsp;&nbsp;AUTO BUY</Button></Grid>
            <Grid item xs={6}><Button variant="outlined" fullWidth><NotInterestedIcon/>&nbsp;&nbsp;Exit Bot</Button></Grid>
          </Grid>
        </Grid> */}
      </Grid>
      
    </Grid> 
  )
}

Bot.propTypes = {
  handleDelete: PropTypes.func
}

export default Bot