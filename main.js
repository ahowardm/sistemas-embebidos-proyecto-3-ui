const electron = require("electron");
const url = require("url");
const path = require("path");
const SerialPort = require("serialport");
const Readline = require("@serialport/parser-readline");

const { app, BrowserWindow, Menu, ipcMain } = electron;
const parser = new Readline();

let mainWindow;
let port;

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

  mainWindow.on("closed", () => {
    app.quit();
  });

  const mainMenu = Menu.buildFromTemplate(mainMenuTemplate);
  Menu.setApplicationMenu(mainMenu);
});

ipcMain.on("setPort", (e, item) => {
  console.log(item);
  port = new SerialPort(item, { baudRate: 9600 });
  port.pipe(parser);
});

ipcMain.on("turnL0On", e => {
  port.write("W,L0;1\n");
});

ipcMain.on("turnL0Off", e => {
  port.write("W,L0;0\n");
});

ipcMain.on("turnL1On", e => {
  port.write("W,L1;1\n");
});

ipcMain.on("turnL1Off", e => {
  port.write("W,L1;0\n");
});

ipcMain.on("readS0", e => {
  port.write("R,S0\n");
});

ipcMain.on("readS1", e => {
  port.write("R,S1\n");
});

parser.on("data", line => {
  mainWindow.webContents.send("buttonStatus", line);
});

ipcMain.on("setPwmL0", (e, value) => {
  port.write("A,L0," + value + "\n");
});

ipcMain.on("setPwmL1", (e, value) => {
  port.write("A,L1," + value + "\n");
});

ipcMain.on("turnAllOff", e => {
  port.write("O\n");
});

const mainMenuTemplate = [
  {
    label: "File",
    submenu: [
      {
        label: "Add Item",
        click() {
          createAddWindow();
        }
      },
      {
        label: "Clear Items"
      },
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

if (process.env.NODE_ENV != "production") {
  mainMenuTemplate.push({
    label: "Developer Tools",
    submenu: [
      {
        label: "Toggle DevTools",
        accelerator: process.platform == "darwin" ? "Command+I" : "Ctrl+I",
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
