
import { thunk } from 'redux-thunk';
import { createStore, applyMiddleware  } from 'redux'
import { persistStore, persistReducer } from 'redux-persist'
import storage from 'redux-persist/lib/storage'
import { composeWithDevTools } from 'redux-devtools-extension';
import reducers from './reducers'

const persistConfig = {
  key: 'root',
  storage: storage
}

const persistedReducer = persistReducer(persistConfig, reducers)

const store = () => {
  
  const store = createStore(
    persistedReducer,
    composeWithDevTools(applyMiddleware(thunk))
  );

  let persistor = persistStore(store)

  // const  = thunk(async (dispatch) => {
  //   await persistor.save();
  // });

  return { store, persistor }
}

export default store



