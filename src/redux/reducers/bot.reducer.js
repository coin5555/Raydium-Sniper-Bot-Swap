

let defaultState = {
  data: [],
  index: 1,
  temp: []
}

const botReducer = (state = defaultState, action) => {
  let temp = [];
  switch (action.type) {
    case "ADD_BOT": 
      if ( state.data.length > 0 ) {
        return {
          ...state,
          data: [...state.data, { 
            id: state.data[state.data.length -1].id + 1,
            liquidity: { min: 0, max: 0 },
            fdv: { min: 0, max: 0 },
            pairAge: { min: 0, max: 0 },
            limitPrice: { min: 0, max: 0 },
            tokensInLP: { min: 0, max: 0 },
            top5: { min: 0, max: 0 },
            top10: { min: 0, max: 0 },
            creator: { min: 0, max: 0 },
            renounced: true,
            burned: true,
            slippageTolerance: 0,
            fullPosition: 0,
            split: 0,
            interval: 0,
            transactionPriority: 0,
            exitConditions: [
              { min: 0, max: 0 }
            ],
            data: []
          }],
          index: state.data[state.data.length -1].id + 1
        }
      } else {
        return {
          ...state,
          data: [{ 
            id: 1,
            liquidity: { min: 0, max: 0 },
            fdv: { min: 0, max: 0 },
            pairAge: { min: 0, max: 0 },
            limitPrice: { min: 0, max: 0 },
            tokensInLP: { min: 0, max: 0 },
            top5: { min: 0, max: 0 },
            top10: { min: 0, max: 0 },
            creator: { min: 0, max: 0 },
            renounced: true,
            burned: true,
            slippageTolerance: 0,
            fullPosition: 0,
            split: 0,
            interval: 0,
            transactionPriority: 0, 
            exitConditions: [
              { min: 0, max: 0 }
            ],
            data: []
          }],
          index: 1
        }
      }
    case "ADD_EXIT_CONDITION":
      temp = [...state.data];
      let _idx = temp.map(({id}) => id).indexOf(action.payload.id);
      temp[_idx].exitConditions = [ ...temp[_idx].exitConditions, { min: 0, max: 0 } ]
      return {
        ...state,
        data: temp
      }
    case "DELETE_EXIT_CONDITION":
      temp = [...state.data];
      const i = temp.map(({id}) => id).indexOf(action.payload.id);
      if ( temp[i].exitConditions.length > 1 ) {
        temp[i].exitConditions = temp[i].exitConditions.slice(0, temp[i].exitConditions.length - 1)
      }
      return {
        ...state,
        data: temp
      }
    case "SET_DATA":
      temp = [...state.data];
      const idx = temp.map(({id}) => id).indexOf(action.payload.id);
      temp[idx].data = action.payload.data;
      return {
        ...state,
        data: temp
      }
    case "TEMP_DATA":
      return { ...state, temp: action.payload }
    case "DELETE_BOT": 
      temp = [...state.data];
      const removeIndex = temp.map(({id}) => id).indexOf(action.payload);
      temp.splice(removeIndex, 1);
      if ( removeIndex > 0 ) {
        return { ...state, data: temp, index: temp[removeIndex-1].id }
      } else if ( removeIndex === 0 && temp.length > 0) {
        return { ...state, data: temp, index: temp[0].id }
      } else {
        return { ...state, data: temp, index: 1 }
      }
    case "SET_INDEX":
      return {
        ...state,
        index: action.payload
      }
    case "ON_CHANGE": //when the item is chnaged
      const { id, name, pos, value } = action.payload;
      console.log(id, name, pos, value)
      temp = [...state.data];
      const editIndex = temp.map(({id}) => id).indexOf(id);
      if ( pos ) {
        temp[editIndex][name][pos] = value
      } else {
        temp[editIndex][name] = value
      }
      return {
        ...state,
        data: temp
      }
    case "CHANGE_EXIT_CONDITION": //when the item is chnaged{
    {
      const { id, name, pos, value, index } = action.payload;
      console.log(id, name, pos, value, index)
      temp = [...state.data];
      const editIndex = temp.map(({id}) => id).indexOf(id);
      temp[editIndex][name][index][pos] = value
      return {
        ...state,
        data: temp
      }
    }
    default:
      return state
  }
}

export default botReducer