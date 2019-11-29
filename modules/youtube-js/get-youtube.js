//code
const moment = require('moment');

hasSeeked = false;
getInfos = `(function(){
		windowName = null;
		try{windowName = document.title;}catch(err){}
		player = null;
		try{player = document.getElementById("movie_player");}catch(err){}
		videoDuration = null
		videoCurrentTime = null
		videoName = null
		creator = null
		isLive = null
		videoPaused = null
		console.log(player)
		if (player){
			videoDuration = player.getDuration();
			videoCurrentTime = player.getCurrentTime();
			videoData = player.getVideoData();
			creator = videoData['author'];
			videoName = videoData['title'];
			isLive = videoData['isLive'];
			playerVideo = player.getElementsByTagName('video')[0]
			videoPaused = playerVideo.paused;
			return {
				videoDuration: videoDuration,
				videoCurrentTime: videoCurrentTime,
				videoName: videoName,
				windowName: windowName,
				creator: creator,
				isLive: isLive,
				videoPaused: videoPaused,
			}
			
		}
		return null
		})()`;

videoCurrentTimeTemp = -1
async function injectRun(mainWindow) {	
	infos = await mainWindow.webContents.executeJavaScript(getInfos);
	/*
	{
		details: details,
		state: state,
		largeImageKey: 'youtube_png',
		largeImageText: 'Youtube',
		smallImageKey,
		smallImageText,
		endTimestamp: endTime
	}
	*/
	rpcData = {largeImageKey: 'youtube_png', largeImageText: 'Youtube'}
	if (infos) {
		let {isLive, creator, videoName, videoDuration, videoCurrentTime, videoPaused} = infos;
		if (videoDuration && videoCurrentTime) {
			if (!isLive){
				if (!videoPaused){
					let now = moment.utc(),
                    remaining = moment.duration(videoDuration - videoCurrentTime, 'seconds');
					endTimestamp = now.add(remaining).unix();
					global.hasSeeked = global.videoCurrentTimeTemp != Math.floor(endTimestamp)
					global.videoCurrentTimeTemp = Math.floor(endTimestamp)
					
					rpcData.endTimestamp = endTimestamp;
					rpcData.state = 'By: '+ creator;
				}else{
					videoName += ' By: '+ creator;
					rpcData.state = 'paused';
				}
			}else{
				videoName = "LIVE - " + videoName;
				if (!videoPaused){
					rpcData.state = 'By: '+ creator;
				}else{
					videoName += ' By: '+ creator;
					rpcData.state = 'paused';
				}
			}
			rpcData.details = videoName;
			
		}else{
			rpcData.details = 'browsing';
			rpcData.state = 'idle';
		}
	}else{
		rpcData.details = 'browsing';
		rpcData.state = 'idle';
	}
	
	if (global.hasSeeked){
		//update with endTimestamp has seeked
		global.hasSeeked = false;
		return([rpcData,[]]);
	}else{
		//ignore endTimestamp has not seeked
		return([rpcData, ['endTimestamp']]);
	}
};

module.exports.injectRun = injectRun;