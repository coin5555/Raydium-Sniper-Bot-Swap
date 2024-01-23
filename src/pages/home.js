import * as React from 'react';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Tab from '@mui/material/Tab';
import TabContext from '@mui/lab/TabContext';
import Tabs from '@mui/material/Tabs';
import TabPanel from '@mui/lab/TabPanel';
import IconButton from '@mui/material/IconButton';

import { useSelector, useDispatch } from 'react-redux';
import AddIcon from '@mui/icons-material/Add';
import ReplyIcon from '@mui/icons-material/Reply';
// import CloseIcon from '@mui/icons-material/Close';
import Button from '@mui/material/Button';
import Bot from '../components/bot'
// import useWeb3 from '../hooks/useWeb3';

import { useNavigate } from 'react-router-dom';


import { WalletMultiButton } from "@solana/wallet-adapter-react-ui"
import { Typography } from '@mui/material';

export default function LabTabs() {

  const dispatch = useDispatch();

  const [tabs, setTabs] = React.useState(['1'])

  const handleChange = (event, newValue) => {
    dispatch({
      type: "SET_INDEX",
      payload: newValue
    })
  };

  const handleNew = () => {
    setTabs([...tabs, tabs.length + 1 + ""])
    dispatch({
      type: "ADD_BOT"
    })
  }

  const handleDelete = (id) => {
    // let temp = [...tabs];
    console.log(id)
    // const removeIndex = tabs.indexOf(id);
    // temp.splice(removeIndex, 1);
    // setTabs(temp);
    dispatch({
      type: "DELETE_BOT",
      payload: id
    })
  }

  const bots = useSelector(state => state.bots.data);
  const index = useSelector(state => state.bots.index);

  const navigate = useNavigate();

  return (
    <Box width="100%">
      <Box sx={{ maxWidth: 1500, typography: 'body1', mx:'auto', marginTop:1, px: 8, mt:3}} display='flex' justifyContent='space-between' alignItems='center'>
        <Grid width={150} onClick={ () => navigate("/history") } container alignItems='center' gap={1} sx={{ cursor: 'pointer' }}><ReplyIcon/><Typography fontSize={15}>History</Typography></Grid>
        <WalletMultiButton style={{ borderRadius:20 }}></WalletMultiButton>
      </Box>
      <Box sx={{ maxWidth: 1500, typography: 'body1', margin:'auto', padding: 5, mt: -4 }}>
        <TabContext value={index.toString()}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider', display:'flex', alignItems:'center' }}>
            
            <Tabs
              value={index.toString()}
              onChange={handleChange}
              variant="scrollable"
              scrollButtons="auto"
              aria-label="scrollable auto tabs example"
              sx={{position:'relative'}}
            >
              {
                bots.map(bot => <Tab key={`bot_panel_${bot.id}`} label={<Box display='flex' gap={1} alignItems='center'>BOTSOL-{bot.id}</Box>} value={bot.id.toString()} />)
              }
            </Tabs>
            <IconButton onClick={handleNew} color="secondary" aria-label="add an alarm">
              <AddIcon />
            </IconButton>
            
          </Box>
          {
            bots.map(bot => 
              <TabPanel value={bot.id.toString()} key={`bot_tab_panel_${bot.id}`}>
                <Bot 
                  handleDelete = {handleDelete}
                  { ...bot }
                />
              </TabPanel>
            )
          }
          
        </TabContext>
      </Box>
    </Box>
  );
}