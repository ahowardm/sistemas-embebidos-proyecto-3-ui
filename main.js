const electron = require("electron");
const url = require("url");
const path = require("path");
const SerialPort = require("serialport");
const Readline = require("@serialport/parser-readline");
const detectSerialPort = require("./serialPortArduino");
const constants = require("./constants");

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
  mainWindow.webContents.on("did-finish-load", setArduinoPort);

  //Quit from app if main window is close.
  //If there is other windows, must be a garbage collector
  mainWindow.on("closed", () => {
    app.quit();
  });

  // const mainMenu = Menu.buildFromTemplate(mainMenuTemplate);
  // Menu.setApplicationMenu(mainMenu);
});

//Get values from template

ipcMain.on(constants.SET_PORT_EVENT, async (e, _) => {
  await setArduinoPort();
});

parser.on("data", line => {
  mainWindow.webContents.send(constants.SERIAL_MESSAGE_EVENT, line);
});

ipcMain.on(constants.UP_EVENT, async (e, item) => {
  await setArduinoPort();
  if (portName !== constants.NOT_CONNECTED_ARDUINO) {
    port.write("3");
  }
});

ipcMain.on(constants.DOWN_EVENT, async (e, item) => {
  await setArduinoPort();
  if (portName !== constants.NOT_CONNECTED_ARDUINO) {
    port.write("4");
  }
});

ipcMain.on(constants.LEFT_EVENT, async (e, item) => {
  await setArduinoPort();
  if (portName !== constants.NOT_CONNECTED_ARDUINO) {
    port.write("5");
  }
});

ipcMain.on(constants.RIGHT_EVENT, async (e, item) => {
  console.log("right");
  await setArduinoPort();
  if (portName !== constants.NOT_CONNECTED_ARDUINO) {
    port.write("6");
  }
});

ipcMain.on(constants.FORWARD_EVENT, async (e, item) => {
  console.log("forward");
  await setArduinoPort();
  if (portName !== constants.NOT_CONNECTED_ARDUINO) {
    port.write("7");
  }
});

ipcMain.on(constants.BACKWARD_EVENT, async (e, item) => {
  await setArduinoPort();
  if (portName !== constants.NOT_CONNECTED_ARDUINO) {
    port.write("8");
  }
});

ipcMain.on(constants.STOP_MOVEMENT_EVENT, async (e, item) => {
  await setArduinoPort();
  if (portName !== constants.NOT_CONNECTED_ARDUINO) {
    port.write("9");
  }
});

ipcMain.on(constants.STOP_CRANE_EVENT, async (e, item) => {
  await setArduinoPort();
  if (portName !== constants.NOT_CONNECTED_ARDUINO) {
    port.write("stopCrane\n");
  }
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

if (process.platform == "darwin") {
  mainMenuTemplate.unshift({});
}

//Developer tools if not in production
if (process.env.NODE_ENV !== "production") {
  mainMenuTemplate.push({
    label: "Developer Tools",
    submenu: [
      {
        label: "Toggle DevTools",
        accelerator:
          process.platform == constants.MAC_PLATFORM ? "Command+I" : "Ctrl+I",
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
async function setArduinoPort() {
  let arduinoPort = await detectSerialPort.getArduinoPort();
  if (
    arduinoPort !== constants.NOT_CONNECTED_ARDUINO &&
    arduinoPort !== portName
  ) {
    portName = arduinoPort;
    port = new SerialPort(arduinoPort, { baudRate: 9600 });
    port.pipe(parser);
  }
  if (arduinoPort === constants.NOT_CONNECTED_ARDUINO)
    portName = constants.NOT_CONNECTED_ARDUINO;
  mainWindow.webContents.send(constants.PORT_ARDUINO_LABEL, arduinoPort);
}
