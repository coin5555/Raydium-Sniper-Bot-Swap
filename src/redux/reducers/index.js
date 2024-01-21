import { combineReducers } from 'redux'
import botReducer from './bot.reducer'

export default combineReducers({
  bots: botReducer
})