const {BrowserWindow, app} = require('electron');
const {Client} 			   = require('discord-rpc');
const widevine             = require('electron-widevinecdm');
const moment               = require('moment');
const rpc                  = new Client({transport: 'ipc'});

const {injectRun}		   = require('./get-youtube.js')

widevine.load(app);

let clientId = '472976802206187520',
    mainWindow,
    smallImageKey,
	smallImageText,
    start, end,
    WindowSettings = {
        backgroundColor: '#FFF',
        useContentSize: false,
        autoHideMenuBar: true,
        resizable: true,
        center: true,
        frame: true,
        alwaysOnTop: false,
        title: 'YouTube',
        icon: __dirname + '/icon.ico',
        webPreferences: {
            nodeIntegration: false,
            plugins: true,
        },
    },
    login = (tries = 0) => {
        if (tries > 10) return mainWindow.webContents.executeJavaScript(connectionNotice);
        tries += 1;
		console.log(tries)
		rpc.login({clientId}).catch(e => setTimeout(() => login(tries), 10E3));
    },
    connectionNotice = `let notice = document.createElement('div'),
        close_btn = document.createElement('span');
        notice.className = 'error-notice';
        notice.setAttribute('style', 'position: fixed; top: 0px; background: #ef5858; border-bottom: 3px solid #e61616; border-radius: 3px; z-index: 101; color: white; width: 99%; line-height: 2em; text-align: center; margin: 0.5%;');
        close_btn.className = 'close-btn';
        close_btn.innerHTML = '&times;';
        close_btn.setAttribute('style', 'float: right; margin-right: 0.5%; font-size: 20px;');
        notice.innerHTML = 'Failed to connect to Discord IRC. Connection timed out.';
        notice.appendChild(close_btn);
        document.body.appendChild(notice);
        notice.onclick = () => document.body.removeChild(notice);
        setTimeout(() => document.body.removeChild(notice), 15E3);`;

pastData={}
async function checkYoutube() {
    if (!rpc || !mainWindow) return;
    
	let data = await injectRun(mainWindow);
	filter = data[1]
	data = data[0]
	if (eqSet(data, pastData, filter)){
		console.log('Data is the same not sending');
	}else{
		console.log(data);
		rpc.setActivity(data);
		pastData = data
	}
}

function eqSet(as,bs,filter=[]){
	if (Object.keys(as).length != Object.keys(bs).length) return false;
	for (var key in as){
		if (!filter.includes(key) && 
			(!bs.hasOwnProperty(key) || as[key] != bs[key])) return false;
	}
	return true;
}

rpc.on('ready', () => {
    checkYoutube();
    setInterval(() => {
        checkYoutube();
    }, 5E3);
});

app.on('ready', () => {
    mainWindow = new BrowserWindow(WindowSettings);
    mainWindow.maximize();
    mainWindow.loadURL("https://www.youtube.com/");
    login();
});

app.on('window-all-closed', () => {
    app.quit();
});