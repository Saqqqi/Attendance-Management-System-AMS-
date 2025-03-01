import React, { useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

const RootComponent = () => {
  const sendEmployeeData = async (employeeId, employeeName) => {
    console.log("Sending POST request to http://127.0.0.1:5001/monitor-login");
    try {
      const response = await fetch("http://127.0.0.1:5001/monitor-login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          employee_id: employeeId,
          employee_name: employeeName,
        }),
      });

      if (!response.ok) {
        throw new Error(`Server responded with status: ${response.status}`);
      }

      const data = await response.json();
      console.log("Server Response:", data);
    } catch (error) {
      console.error("Error sending employee data:", error.message);
      if (error.message.includes("Failed to fetch")) {
        console.error("Connection refused. Ensure the server is running on http://127.0.0.1:5001.");
      }
    }
  };

  useEffect(() => {
    console.log("useEffect triggered on mount");

    const checkAndSendEmployeeData = () => {
      const employeeId = localStorage.getItem("employeeId");
      const employeeName = localStorage.getItem("employeeName");
      console.log("Checking localStorage:", { employeeId, employeeName });

      if (employeeId && employeeName) {
        console.log("Employee data found, sending to backend...");
        sendEmployeeData(employeeId, employeeName);
        return true; 
      } else {
        console.log("Employee data not found in localStorage, waiting...");
        return false;
      }
    };

    if (checkAndSendEmployeeData()) {
      return; 
    }

    const intervalId = setInterval(() => {
      if (checkAndSendEmployeeData()) {
        clearInterval(intervalId); 
      }
    }, 2000); 

    return () => clearInterval(intervalId);
  }, []);

  return <App />;
};

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <RootComponent />
  </React.StrictMode>
);