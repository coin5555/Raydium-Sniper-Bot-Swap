import * as React from 'react';
import Table from '@mui/material/Table';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import ReplyIcon from '@mui/icons-material/Reply';
import { useNavigate } from 'react-router-dom';

import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import { Typography } from '@mui/material';

const data = [
  {
    name: "Penguin",
    address: "435243adsf52345",
    createdAt: "2022-2-2",
    firstEntryPrice: "123",
    price: 23,
    fullposition: 123,
    openPosition: 30,
    closePosition: 30,
    price: 10,
    profitPercent: 10,
    profitUSD: 10,
    state: "SELL"
  },
  {
    name: "Penguin",
    address: "435243adsf52345",
    createdAt: "2022-2-2",
    firstEntryPrice: "123",
    price: 23,
    fullposition: 123,
    openPosition: 30,
    closePosition: 30,
    price: 10,
    profitPercent: 10,
    profitUSD: 10,
    state: "SELL"
  },
  {
    name: "Penguin",
    address: "435243adsf52345",
    createdAt: "2022-2-2",
    firstEntryPrice: "123",
    price: 23,
    fullposition: 123,
    openPosition: 30,
    closePosition: 30,
    price: 10,
    profitPercent: 10,
    profitUSD: 10,
    state: "BUY"
  }
]

const header = [
  { name: "Name", key: "name"}, 
  { name: "Address", key: "address"},
  { name: "CreatedAt",  key: "createdAt"},
  { name: "FirstEntryPrice", key: "firstEntryPrice"},
  { name: "Price",  key: "price"},
  { name: "FullPosition", key: "fullposition"}, 
  { name: "OpenPosition", key: "openPosition"}, 
  { name: "ClosePosition", key: "closePosition"}, 
  { name: "Profit(%)", key: "profitPercent"}, 
  { name: "Profit(USD)", key: "profitUSD"}, 
  { name: "state", key: "state"}
]



const History = () => {

  const navigate = useNavigate();

  const [ value, setValue ] = React.useState("BUY/SELL");

  const handleChange = (e) => {
    setValue(e.target.value)
  }

  return (
    <Box sx={{ maxWidth: 1500, margin: 'auto', mt: 5 }}>
      <Grid onClick={ () => navigate("/") } container alignItems='center' gap={1} sx={{ cursor: 'pointer' }}><ReplyIcon/><Typography fontSize={15}>Back</Typography></Grid>
      <Grid mt={5} container justifyContent='space-between' alignItems='center'>
        <Typography fontSize={18}>Trading History ( {data.filter(item => item.state === value || value === "BUY/SELL" ).length}/{ data.length} ) </Typography>
        <FormControl size='small'  sx={{width: 200}}>
          <InputLabel size='small' id="demo-select-small-label" width={200}  sx={{zIndex:"10000000!important", backgroundColor:'#121212'}}>History type</InputLabel>
          <Select
            width={200} 
            labelId="demo-select-small-label"
            id="demo-select-small"
            label="History type"
            value={value}
            onChange={handleChange}
          >
            {/* <MenuItem value="">
              <em>None</em>
            </MenuItem> */}
            <MenuItem value="BUY/SELL">BUY/SELL</MenuItem>
            <MenuItem value="BUY">BUY</MenuItem>
            <MenuItem value="SELL">SELL</MenuItem>
          </Select>
        </FormControl>
      </Grid>
      <TableContainer sx={{ mt:2 }} component={Paper}>
        <Table sx={{ minWidth: 650 }} aria-label="a dense table">
          <TableHead>
            <TableRow>
              <TableCell sx={{ pt: 2, fontSize: 15 }} align='center'>No</TableCell>
              { header.map(item => <TableCell sx={{ pt: 2, fontSize: 15 }} align='center'>{ item.name }</TableCell>) }
            </TableRow>
          </TableHead>
          <TableBody>
            {data.filter(item => item.state === value || value === "BUY/SELL" ).map((row, i) => (
              <TableRow
                key={row.name}
                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
              >
                <TableCell sx={{ py:1, borderBottom: '1px solid #ffffff08' }} align="center">{ i }</TableCell>
                {
                  header.map(({key, name}) => <TableCell sx={{ py:1, borderBottom: '1px solid #ffffff08' }} align="center">{row[key]}</TableCell>)
                }
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  )
}

export default History;