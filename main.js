const {BrowserWindow, app} = require('electron');
const {Client} 			   = require('discord-rpc');
const widevine             = require('electron-widevinecdm');
const rpc                  = new Client({transport: 'ipc'});

const {injectRun}		   = require('youtube-js')
const pack 			   	   = require("./package.json");
const version 			   = pack.version;
const name 			   	   = pack.name;
const author 			   = pack.author;
const github_repository    = pack.github_repository;

const updateUHTM = process.cwd()+'/updating.html'

String.prototype.format = function() {
  a = this;
  for (k in arguments) {
    a = a.replace("{" + k + "}", arguments[k])
  }
  return a
}

var HttpClient = function() {
	const XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
    this.get = function(aUrl, aCallback) {
        var anHttpRequest = new XMLHttpRequest();
        anHttpRequest.onreadystatechange = function() { 
            if (anHttpRequest.readyState == 4 && anHttpRequest.status == 200)
                aCallback(anHttpRequest.responseText);
        }

        anHttpRequest.open( "GET", aUrl, true );            
        anHttpRequest.send( null );
    }
}

function download(uri, filename) {
	var url = require('url');
	var Q = require('q');
	var fs = require('fs'); 
    var protocol = url.parse(uri).protocol.slice(0, -1);
    var deferred = Q.defer();
    var onError = function (e) {
        fs.unlink(filename);
        deferred.reject(e);
    }
    require(protocol).get(uri, function(response) {
        if (response.statusCode >= 200 && response.statusCode < 300) {
            var fileStream = fs.createWriteStream(filename);
            fileStream.on('error', onError);
            fileStream.on('close', deferred.resolve);
            response.pipe(fileStream);
        } else if (response.headers.location) {
            deferred.resolve(download(response.headers.location, filename));
        } else {
            deferred.reject(new Error(response.statusCode + ' ' + response.statusMessage));
        }
    }).on('error', onError);
    return deferred.promise;
};
isUPDATE = false
function getUpdate(){
	a = 'https://api.github.com/repos/{0}/{1}/releases/latest'.format(author,github_repository)
	var client = new HttpClient();
	client.get(a, function(response) {
		assets = JSON.parse(response)['assets'][0]
		if ('{0}.Setup.{1}.exe'.format(name,version) != assets['name']){
			global.isUPDATE = true
			mainWindow.loadURL(updateUHTM);
			const tempWrite = require('temp-write');
			if (true){
				path = tempWrite.sync('', 'update.exe');
			}else{
				path = 'update.exe'
			}
			browser_download_url = assets['browser_download_url']
			console.log(browser_download_url)
			download(browser_download_url,path).then(ret => {
				var exec = require('child_process').execFile;
				exec('start_update.bat', [path],function(err, data) {  
					console.log(err)
					console.log(data.toString());                       
				});  
				console.log('update done')
				app.quit()
				callback(ret);
			});
			console.log('updating')
		}
	});
}

getUpdate();
console.log(version)

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
            nodeIntegration: true,
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
    //mainWindow.maximize();
	if (global.isUPDATE){
		mainWindow.loadURL(updateUHTM);
	}else{
		mainWindow.loadURL("https://www.youtube.com/");
		login();
	}
});

app.on('window-all-closed', () => {
    app.quit();
});

//stops extra app instances from opening
var shouldQuit = app.makeSingleInstance(function(commandLine, workingDirectory) {
	// Someone tried to run a second instance, we should focus our window.
	if (mainWindow) {
		if (mainWindow.isMinimized()) mainWindow.restore();
		mainWindow.focus();
	}
});

if (shouldQuit) {
	app.quit();
	return;
}

//only allows one electron window open
var iSWindowOpen = false;
app.on('browser-window-created', function(event, window) {
	if (iSWindowOpen){
		window.loadURL('javascript:window.close();');
		console.log("Close new window");
	}else{
		iSWindowOpen = true;
		console.log("Open one window");
	}
});