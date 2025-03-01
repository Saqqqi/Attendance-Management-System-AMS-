const { app, BrowserWindow } = require('electron');
const fs = require('fs').promises;
const path = require('path');
const fetch = require('node-fetch');

let mainWindow;
const storePath = path.join(__dirname, 'store.json');

async function getStore() {
  try {
    const data = await fs.readFile(storePath, 'utf8');
    return JSON.parse(data);
  } catch (e) {
    return {};
  }
}

async function setStore(data) {
  await fs.writeFile(storePath, JSON.stringify(data, null, 2));
}

async function sendEmployeeData() {
  console.log("Attempting to send employee data from main.js...");
  const store = await getStore();
  const employeeId = store.employeeId;
  const employeeName = store.employeeName;

  console.log("Retrieved from store:", { employeeId, employeeName });

  if (employeeId && employeeName) {
    fetch("http://127.0.0.1:5001/monitor-login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        employee_id: employeeId,
        employee_name: employeeName,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("Server Response:", data);
      })
      .catch((error) => {
        console.error("Error sending employee data:", error);
      });
  } else {
    console.warn("No employee data found in store");
    const newStore = { employeeId: "12345", employeeName: "Saqlain" };
    await setStore(newStore);
    console.log("Set default values for testing:", newStore);
    sendEmployeeData();
  }
}

function createMainWindow() {
  console.log("Creating main window...");
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: __dirname + '/preload.js',
      contextIsolation: true,
      enableRemoteModule: false,
    },
  });

  mainWindow.loadURL('http://localhost:3000/login');
  console.log("Loaded URL: http://localhost:3000/login");

  mainWindow.webContents.on('did-finish-load', () => {
    console.log("Window finished loading, sending employee data...");
    sendEmployeeData();
  });
}

app.whenReady().then(() => {
  console.log("App is ready");
  createMainWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      console.log("No windows open, creating new one...");
      createMainWindow();
    }
  });
});

app.on('window-all-closed', () => {
  console.log("All windows closed");
  if (process.platform !== 'darwin') {
    app.quit();
  }
});