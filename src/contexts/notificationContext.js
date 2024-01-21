import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import React from 'react';

export const NotificationContext = React.createContext(null);

const NotificationProvider = ({children}) => {

  const showNotification = (msg, type) => {
    toast[type](msg, {
      position: type === "error" ? 'bottom-right' : "top-right",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    });
  }

  return (
    <NotificationContext.Provider value={{ showNotification }}>
      { children }
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </NotificationContext.Provider>
  )

}

export default NotificationProvider;