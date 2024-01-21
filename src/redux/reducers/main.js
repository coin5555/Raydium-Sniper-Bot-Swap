

let defaultState = {
  visible: false,
  enableRefresh: false,
  url: 'upwork',
  visibleFollow: false,

  emails: [],
  start: 0,
  period: 3
}

const main = (state = defaultState, action) => {
  switch (action.type) {

    case "SET_EMAILS": 
      return {
        ...state,
        emails: action.payload
      }
    case "SET_PERIOD": 
      return {
        ...state,
        period: action.payload
      }
    case 'SET_START':
      console.log('data in reducer', action.payload)
      return {
        ...state,
        start: action.payload
      }

    case 'SET_VALUE':
      console.log('data in reducer', action.payload)
      return {
        ...state,
        emails: state.emails.map(item => (item.email === action.payload.email ? {...item, value: action.payload.value} : item))
      }

    case 'VISIBLE':
      console.log('data in reducer', action.payload)
      return {
        ...state,
        visible: action.payload
      }
    case 'REFRESH':
      console.log('data in reducer', action.payload)
      return {
        ...state,
        enableRefresh: action.payload
      }
    case 'GOTO':
      console.log('data in reducer', action.payload)
      return {
        ...state,
        url: action.payload
      }
    case 'FOLLOW':
      console.log('data in reducer', action.payload)
      return {
        ...state,
        visibleFollow: !state.visibleFollow
      }
    default:
      return state
  }
}

export default main