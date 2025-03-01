const getStoredExpiryTime = () => {
  const storedExpiryTime = localStorage.getItem('expiry');
  if (storedExpiryTime) {
    return storedExpiryTime; 
  }
  return null; 
};

const getCurrentTime = () => {
  const now = new Date();
  return now.toTimeString().split(" ")[0];
};

const checkAndRemoveExpiredData = () => {
  const expiryTime = getStoredExpiryTime();
  const currentTime = getCurrentTime();
  // console.log("Stored Expiry Time:", expiryTime);

  if (expiryTime && currentTime > expiryTime) {
    localStorage.removeItem('expiry');
    return null; 
  }
  return expiryTime; 
};

export const logLocalStorageAndExpiry = () => {
  const expiryTime = checkAndRemoveExpiredData();



};

export const setExpiryTime = (expiryTime) => {
  localStorage.setItem('expiry', expiryTime);

};

checkAndRemoveExpiredData();

setInterval(() => {

  logLocalStorageAndExpiry(); 
}, 60000); 
