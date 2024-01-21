import { useContext } from "react";

import { NotificationContext } from "../contexts/notificationContext";

/**
 * 
 * @returns context { showNotification(text:string) }
 */
const useNotification = () => {
  const context = useContext(NotificationContext);
  return context;
}

export default useNotification;