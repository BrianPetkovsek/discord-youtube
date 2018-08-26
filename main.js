const {BrowserWindow, app} = require('electron');
const {Client} 			   = require('discord-rpc');
const widevine             = require('electron-widevinecdm');
const moment               = require('moment');
const rpc                  = new Client({transport: 'ipc'});

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
		rpc.login({clientId}).catch(e => setTimeout(() => login(tries), 10E3));
    },
    getInfos = `(function() {
		document.cookie="VISITOR_INFO1_LIVE=oKckVSqvaGw; path=/; domain=.youtube.com";
		try{windowName   	 = document.title;}catch(err){}
		try{videoDuration    = document.querySelector('.ytp-time-duration').textContent;}catch(err){}
        try{videoCurrentTime = document.querySelector('.ytp-time-current').textContent;}catch(err){}
        try{creator 		 = document.querySelector('.yt-simple-endpoint.style-scope.yt-formatted-string').textContent;}catch(err){}
		try{videoName 		 = document.querySelector('.title.style-scope.ytd-video-primary-info-renderer').textContent;}catch(err){}
		viewData = null;
		try{viewData 		 = document.querySelector('.view-count.style-scope.yt-view-count-renderer').textContent;}catch(err){}
		return {
			videoDuration: videoDuration,
			videoCurrentTime: videoCurrentTime,
			videoName: videoName,
			title: windowName,
			creator: creator,
			viewData: viewData
		};
    })()`,
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
 
function toSeconds(strArr){
	strArr = strArr.reverse()
	time = parseInt(strArr[0]);
	timeStamps = [1,60,60*60,60*60*24];
	for(i = 1; i < strArr.length; i++){
		time += parseInt(strArr[i])*timeStamps[i];
	}
	return time;
}

tempTime = -1;
savedTimestap = -1;

async function checkYoutube() {
    if (!rpc || !mainWindow) return;
    
    let infos = await mainWindow.webContents.executeJavaScript(getInfos);
	/*
	{
		details: details,
		state: state,
		largeImageKey: 'youtube_png',
		largeImageText: 'YouTube',
		smallImageKey,
		smallImageText,
		instance: false,
		endTimestamp: endTime
	}
	*/
	data = {largeImageKey: 'youtube_png', largeImageText: 'YouTube'}
	if (infos) {
		if (infos["videoName"] == infos['title'].replace(" - YouTube","")){
			viewData = infos['viewData'].split(" ");
			infos['live'] = viewData[1] != "views";
			infos['views'] = viewData[0];
			if (!infos['live']){
				if (infos['videoCurrentTime'] != tempTime){
					vidDur_dhms = infos['videoDuration'].split(':');
					vidCurtime_dhms = infos['videoCurrentTime'].split(':');
					tempTime = infos['videoCurrentTime']
					vidDur = toSeconds(vidDur_dhms);
					vidCurtime = toSeconds(vidCurtime_dhms);
					
					now = moment.utc();
					a = now.unix()+(vidDur - vidCurtime);
					data['endTimestamp'] = a;
					savedTimestap = a;
				}else{
					data['endTimestamp'] = savedTimestap;
				}
			}
			data['details'] = infos['videoName']
			//data['state'] = 'by: '+ infos['creator']
		}else{
			data['details'] = 'browsing'
			data['state'] = 'idle'
		}
	}
	
	rpc.setActivity(data);
}

rpc.on('ready', () => {
    checkYoutube();
    setInterval(() => {
        checkYoutube();
    }, 15E3);
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