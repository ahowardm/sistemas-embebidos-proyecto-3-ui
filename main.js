const electron = require("electron");
const url = require("url");
const path = require("path");
const SerialPort = require("serialport");
const Readline = require("@serialport/parser-readline");
const detectSerialPort = require('./serialPortArduino');
const constants = require('./constants');

const { app, BrowserWindow, Menu, ipcMain } = electron;
const parser = new Readline();

let mainWindow;
let port;
let portName;

app.on("ready", () => {
  mainWindow = new BrowserWindow({
    width: 1024,
    height: 650,
    webPreferences: {
      nodeIntegration: true
    }
  });
  mainWindow.loadURL(
    url.format({
      pathname: path.join(__dirname, "mainWindow.html"),
      protocol: "file:",
      slashes: true
    })
  );

  // Detect arduino port if finished to load
  mainWindow.webContents.on('did-finish-load',setArduinoPort);

  //Quit from app if main window is close.
  //If there is other windows, must be a garbage collector
  mainWindow.on("closed", () => {
    app.quit();
  });

  const mainMenu = Menu.buildFromTemplate(mainMenuTemplate);
  Menu.setApplicationMenu(mainMenu);
});

//Get values from template

ipcMain.on(constants.SET_PORT_EVENT, async (e, _) => {
  await setArduinoPort();
});
ipcMain.on(constants.L0_SWITCH_ID, async (e, item) =>{
  await setArduinoPort();
  if (portName !== constants.NOT_CONNECTED_ARDUINO){
    if (item == true){port.write("W,L0,1\n");}
    else{port.write("W,L0,0\n");}
  }
});
ipcMain.on(constants.L1_SWITCH_ID, async (e, item) =>{
  await setArduinoPort();
  if (portName !== constants.NOT_CONNECTED_ARDUINO){
    if (item == true){port.write("W,L1,1\n");}
    else{port.write("W,L1,0\n");}
  }
});

ipcMain.on(constants.S0_READ_EVENT, async e => {
  await setArduinoPort();
  if (portName !== constants.NOT_CONNECTED_ARDUINO)
    port.write("R,S0\n");
});

ipcMain.on(constants.S1_READ_EVENT, async e => {
  await setArduinoPort();
  if (portName !== constants.NOT_CONNECTED_ARDUINO)
    port.write("R,S1\n");
});

parser.on("data", line => {
  mainWindow.webContents.send(constants.SERIAL_MESSAGE_EVENT, line);
});

ipcMain.on(constants.L0_PWM_EVENT, async (e, value) => {
  await setArduinoPort();
  if (portName !== constants.NOT_CONNECTED_ARDUINO)
    port.write("A,L0," + value + "\n");
});

ipcMain.on(constants.L1_PWM_EVENT, async (e, value) => {
  await setArduinoPort();
  if (portName !== constants.NOT_CONNECTED_ARDUINO)
  port.write("A,L1," + value + "\n");
});

ipcMain.on(constants.L0_PULSE_EVENT, async (e, value) => {
  await setArduinoPort();
  if (portName !== constants.NOT_CONNECTED_ARDUINO)
    port.write("B,L0," + value + "\n");
});

ipcMain.on(constants.L1_PULSE_EVENT, async (e, value) => {
  await setArduinoPort();
  if (portName !== constants.NOT_CONNECTED_ARDUINO)
  port.write("B,L1," + value + "\n");
});

ipcMain.on(constants.SAVE_EVENT, async e => {
  await setArduinoPort();
  if (portName !== constants.NOT_CONNECTED_ARDUINO)
    port.write("E\n");
});

ipcMain.on(constants.ALL_OFF_EVENT, async e => {
  await setArduinoPort();
  if (portName !== constants.NOT_CONNECTED_ARDUINO)
    port.write("O\n");
});

const mainMenuTemplate = [
  {
    label: "File",
    submenu: [
      {
        label: "Quit",
        accelerator: process.platform == "darwin" ? "Command+Q" : "Ctrl+Q",
        click() {
          app.quit();
        }
      }
    ]
  }
];

if(process.platform == 'darwin'){
  mainMenuTemplate.unshift({});
}

//Developer tools if not in production
if (process.env.NODE_ENV !== "production") {
  mainMenuTemplate.push({
    label: "Developer Tools",
    submenu: [
      {
        label: "Toggle DevTools",
        accelerator: process.platform == constants.MAC_PLATFORM ? "Command+I" : "Ctrl+I",
        click(item, focusedWindow) {
          focusedWindow.toggleDevTools();
        }
      },
      {
        role: "reload"
      }
    ]
  });
}

//Detect arduino port
async function setArduinoPort(){
  let arduinoPort = await detectSerialPort.getArduinoPort();
  if (arduinoPort !== constants.NOT_CONNECTED_ARDUINO && arduinoPort !== portName){
    portName = arduinoPort;
    port = new SerialPort(arduinoPort, { baudRate: 9600 });
    port.pipe(parser);
  }
  if (arduinoPort === constants.NOT_CONNECTED_ARDUINO) portName = constants.NOT_CONNECTED_ARDUINO;
  mainWindow.webContents.send(constants.PORT_ARDUINO_LABEL, arduinoPort);
}
