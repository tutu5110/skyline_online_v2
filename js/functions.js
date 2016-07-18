
function getTimeDifferenceInDays(targetTime){
	var date1 = new Date(targetTime);
	var date2 = new Date();
	var timeDiff = Math.abs(date2.getTime() - date1.getTime());
	var diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24)); 
	return diffDays;
}


function setCoolDown(obj,key,duration){
	if(obj == undefined){
		smartLog('obj is undefined in setCooldown!','alarm');
		return false;
	}
	// override everytime
	obj[key] = {};
	obj[key]['lastUpdate'] = getTimestamp();
	obj[key]['duration'] = duration;
	return true;
}



function alarmLog(msg,importance){
	//console
	importance = importance || 0;

	console.log(msg);

	switch(importance){
		case 0:
		break;

		case 1:
		msg = "<span class='AlarmRed2'>"+msg+"</span>";
		break;

		case 2:
		msg = "<span class='AlarmRedLight'>"+msg+"</span>";
		break;

		case 3:
		msg = "<span class='AlarmBlue'>"+msg+"</span>";
		break;


		default:
		break;
	}
	var d = $('#alarmConsole');

	d.append(msg+"<br>");
	// scoll to bottom
	d.scrollTop(d.prop("scrollHeight"));
}
/* this function logs for realtime */
function log(msg){
	
	//console
	console.log(msg);

	var d = $('#realtimeConsole #content');
	d.append(msg+"<br>");
	// scoll to bottom
	d.scrollTop(d.prop("scrollHeight"));

}
function mergeOBJ(obj1,obj2){
	for(key in obj2)
		obj1[key] = obj2[key];
	return obj1;
}

/* check if it is number */
function isNumeric(n) {
  return !isNaN(parseFloat(n)) && isFinite(n);
}

function packageSaveArr(obj){
	var t = JSON.stringify(obj);
	return t;
}

function clearme(obj){
	obj.value = "";
}

function updatePurchase(code, val){
	portfolio[code].cost = val;
	filename = 'data/SystemLists/portfolio.txt';
	 $.post( "save.php", { raw: packageSaveArr(portfolio), isJSONArr: true, filename: filename }).done(function( data ) {
        //console.log( "Save Complete!:  " + filename );
        console.log(data);
    });
}

function updateNos(code,val){
	portfolio[code].nos = val;
	filename = 'data/SystemLists/portfolio.txt';
	$.post( "save.php", { raw: packageSaveArr(portfolio), isJSONArr: true,  filename: filename }).done(function( data ) {
        //console.log( "Save Complete!:  " + filename );
        smartLog(data,'alarm');
    });
}
function subset(obj,keys){
	var t = {};
	for(var i =0  ; i < keys.length; i ++){
		if(obj[keys[i]] != undefined)
			if(isNumeric(obj[keys[i]]))
				t[keys[i]] = parseFloat(obj[keys[i]]).toFixed(2);
			else
				t[keys[i]] = obj[keys[i]]
	}
	return t;
}

function clone(obj) {
    var copy;

    // Handle the 3 simple types, and null or undefined
    if (null == obj || "object" != typeof obj) return obj;

    // Handle Date
    if (obj instanceof Date) {
        copy = new Date();
        copy.setTime(obj.getTime());
        return copy;
    }

    // Handle Array
    if (obj instanceof Array) {
        copy = [];
        for (var i = 0, len = obj.length; i < len; i++) {
            copy[i] = clone(obj[i]);
        }
        return copy;
    }

    // Handle Object
    if (obj instanceof Object) {
        copy = {};
        for (var attr in obj) {
            if (obj.hasOwnProperty(attr)) copy[attr] = clone(obj[attr]);
        }
        return copy;
    }

    throw new Error("Unable to copy obj! Its type isn't supported.");
}

/***************    Utility Functions             ****************/
function formatStockNames(nameArr){
  // check if the name is already formatted
  if(nameArr.constructor !== Array)
  		nameArr = nameArr.split(',');
  if(nameArr.constructor !== Array){
  		smartLog('error! formatStockNames() require an array! and the input cannot automatically convert into an array, function now exit with error')
  		return false;
  }

   for(var i =0 ; i < nameArr.length; i ++){
      nameArr[i] = formatStockName(nameArr[i]);
    }
    return nameArr;
}

function formatStockName(name, short){
	if(name == undefined)
		smartLog('undefined name found! please check in formatStockName()');

	short = short || false;
	if(!name.contains('us_') && !name.contains('sh') && 
      !name.contains('sz') && !name.contains('jj') && !name.contains('jp') && !name.contains('hk')){
        if(name.toLowerCase().beginWith('0') ||
           name.toLowerCase().beginWith('3') ||
           name.toLowerCase().beginWith('9') ||
           name.toLowerCase().beginWith('51') ||
           name.toLowerCase().beginWith('1'))
           name =  short ? CNSTOCK_SHORT_PREFIX +'sz'+name : 'sz'+name;
        else if(name.toLowerCase().beginWith('6'))
            name =  short ? CNSTOCK_SHORT_PREFIX +'sh'+name : 'sh'+name;
        else if(name.toLowerCase().contains('if')||
            name.toLowerCase().contains('ih') ||
            name.toLowerCase().contains('f_') ||
            name.toLowerCase().contains('ic'))
            name = name;
        else if(name.toLowerCase().beginWith('50'))
            name = 'jj'+name;
        else if(!isFinite(name))
            name = 'us_'+name;
        else 
            name = name;
     } else {
     	
     	if(name.contains('sh') || name.contains('sz'))
     		return (short ? CNSTOCK_SHORT_PREFIX + name : name);
     	else if(name.contains('jj') || name.contains('us'))
     		return name;
     	else if(name.endWith('.jp'))
     		return ('jp_'+name.substring(0,name.length -3));
     }
     return name;
}

function fetchGroupRealtimeN(codes,key){

	codes = codes.flatten();

	var server = getServer(codes,true);

	// no realtime cache found begin AJAX
    $.get(server, function(data) {
        if (codes.contains('us'))
        // parse US STOCK realtime
            var result = parseUSGroupRealtime(data);
        else if (codes.toLowerCase().contains('f_'))
        // parse CN FUTURE realtime
            //var result = parseFutureRealtime(data);
            console.log("future group load not supported yet");
        else if(codes.contains('jp'))
        	var result = parseJPGroupRealtime(data);
        else
        // parse CN Group using Tencent API in realtime
            var result = parseCNGroupRealtime(data);

        // continue here
         if(saveGroupAlarm(result,key.type))
         	if(key.type == "marketWatch"){
         		execMarketWatch();
         	}
    });

}

function addtoMarketWatchArr(obj){

	for(var i = 0 ; i < obj.length ; i ++){
		marketWatch.push(obj[i]);
		userMarketWatch.push(obj[i]);
	}
}

function createMarketWatchDivs(obj){
	var div = $('#pf_rtmMaster_append');
	for(var i = 0 ; i < obj.length ; i ++){
		var code = obj[i].replace('^','');
		var add = "&nbsp;&nbsp;&nbsp;<div id='codename_"+code+"'>"+code+'</div>:&nbsp;<div id="'+code+'">获取中</div>&nbsp;';
		div.append(add);
	}
}

function addToMarketWatch(code){
	userMarketWatch.push(code);
	marketWatch.push(code);
	code = code.replace('^','');
	var add = "&nbsp;&nbsp;&nbsp;<div id='codename_"+code+"'>"+code+':&nbsp;<div id="'+code+'">获取中</div>&nbsp;';
	$('#pf_rtmMaster_append').append(add);
	//save
	saveMarketWatch();
}

function saveMarketWatch(){
	var data = userMarketWatch;
	saveObj(data, 'data/MarketWatch.txt');	
}

function loadMarketWatch(){
	groupFetchStock(marketWatch,'marketWatch');
}

function execMarketWatch(){
	var t = gAlarm['realtimeAlarms']['Results']['marketWatch'];
	for(var i = 0 ; i < t.length ; i ++){
		//update values
		var code = (t[i].code).replace('^','');
		
		if(t[i].divCode != undefined){
			var div = $('#'+t[i].divCode);
			var nameDiv = $('#codename_'+divCode).html(t[i].name);
		} else {
			var div = $('#'+code);
			var nameDiv = $('#codename_'+code).html(t[i].name);
		}
		var price = t[i].price;
		var chg_percent = getStockPriceFormat(t[i].chg_percent);
		var chg_price = getStockPriceFormat(t[i].priceIncrement);
		div.html(price + " ( "+chg_price+" / "+chg_percent+"% )");
	}
}

function getStockPriceFormat(num){
	num = parseFloat(num).toFixed(1);
	if(num < 0)
		return "<font class='AlarmGreen'>"+num+"</font>";
	else if(num > 0)
		return "<font class='AlarmRed'>"+num+"</font>";
	else 
		return num;
}

function fetchRealtimeN(code,param){

	//check for group fetch or single fetch
	code = formatStockName(code);
	//var purchasePrice = graphData[resourceID].purchasePrice[code];
    //ck type
    var server = getServer(code);

    //check realtime cache
    var rtmResult = getRtmCache(code);
    if(rtmResult){
    	
        data = rtmResult;
       
        var result = parseRealtimeN(data,code);

        param.result = result;  
        param.code = code;
        param.name = result.name;

    	if(param.returnResults == 'cusAlarm'){
    		// allocate space for alarm cache
    		finalizeCUSAlarm(param);
    	} else if(param.returnResults == 'trackList'){
    		// dosomething here tomorrow for tracklist
    		updateTrackListRtmResults(param.tid,result);
    		trackListAlarmExec(param);
    	}
       return;
    }


    // no realtime cache found begin AJAX
    $.get(server, function(data) {
    	if(data == undefined || data== '')
    		return false;
        var result = parseRealtimeN(data,code);
        param.result = result;
        param.code = code;
        param.name = result.name;
        var expire = param.expire ? param.expire : G_RTM_CACHE_PERIOD;

        if(param.returnResults == 'cusAlarm'){
    		// allocate space for alarm cache
    		finalizeCUSAlarm(param);
    	} else if(param.returnResults == 'trackList'){
    		updateTrackListRtmResults(param.tid,result);
    		trackListAlarmExec(param);
    	}
    	// inject realtime cache
        saveRtmCache(code, data,expire);
		// end AJAX
    });
}

/*************** 	Parsing Functions         ****************/

function parseRealtimeN(data,code){
		// parse result
       if (code.contains('us'))
        // parse US STOCK realtime
            var result = parseUSRealtime(data);
       else if (code.toLowerCase().contains('f_'))
        // parse CN FUTURE realtime
            var result = parseFutureRealtime(data);
       else if(code.contains('jp_'))
       		var result = parseJPRealtime(data);
       else
        // parse CN STOCK realtime
            var result = parseTencentRealtime(data);
        return result;
}

function parseJPRealtime(data){
	var result = {};
	try{
		result = JSON.parse(data);
	} catch(e){
		console.log(e.Message);
	}
	//sanitation check
	if(result.high == undefined)
		return false;

	var len = result.prices.length;
	var price = result.prices[len-1].close;
	var lastClose = result.lastPrice.close;
	var chg_price = price - lastClose;
	var chg_percent = ((chg_price / lastClose) * 100).toFixed(1);

	var obj = {};
	obj['name'] = result.brand.name;
	obj['code'] = result.brand.code;
	obj['divCode'] = 'jp_'+result.brand.code;
	obj['price'] = price;
	obj['priceIncrement'] = chg_price;
	obj['percent'] = chg_percent;
	obj['volume'] = 1;
	
	return obj;
}


function parseCNGroupRealtime(raw){
	var temp = raw.split("\n");
	temp = temp.removeEmpty();
	var obj = new Array();
	for(var i = 0 ; i < temp.length; i ++){
		var t = temp[i].split("~");
		var t2 = {};
		t2['name'] = t[1];
		t2['code'] = formatStockName(t[2]);
		t2['price'] = t[3];
		t2['priceIncrement'] = t[4]
		t2['chg_percent'] = t[5];
		t2['Volume'] = t[7];
		obj.push(t2);
	}
	return obj;
 }

function parseJPGroupRealtime(data){
	var result = {};
	try{
		result = JSON.parse(data);
	} catch(e){
		console.log(e.message);
	}
	//sanitation check
	if(result.high == undefined)
		return false;

	var len = result.prices.length;
	var price = result.prices[len-1].close;
	var lastClose = result.lastPrice.close;
	var chg_price = price - lastClose;
	var chg_percent = ((chg_price / lastClose) * 100).toFixed(1);

	var final = new Array();
	var obj = {};
	obj['name'] = result.brand.name;
	obj['code'] = result.brand.code;
	obj['divCode'] = 'jp_'+result.brand.code;
	obj['price'] = price;
	obj['priceIncrement'] = chg_price;
	obj['chg_percent'] = chg_percent;
	obj['volume'] = 1;
	
	final.push(obj);
	return final;
}

function parseUSGroupRealtime(raw){
	var data = {};
	try{
		data = JSON.parse(raw);
	} catch(e){
		smartLog(e.Message);
	}
	if(data.chart == undefined){
		smartLog('undefined in parseUSGroupRealtime, result will return now','alarm');
		return false;
	}

	var len = data.chart.result[0].comparisons.length;
	var obj = new Array();
	for(var i =0; i < len; i ++){
		var t = {};
		t['name'] = data.chart.result[0].comparisons[i].symbol;
		t['code'] = data.chart.result[0].comparisons[i].symbol;
		t['price'] = parseFloat(data.chart.result[0].comparisons[i].close[1]);
		t['priceIncrement'] = parseFloat(data.chart.result[0].comparisons[i].close[1]) -parseFloat(data.chart.result[0].comparisons[i].close[0]) ;
		t['chg_percent'] = t['priceIncrement'] / parseFloat(data.chart.result[0].comparisons[i].close[0]) * 100 ;
		t['Volume'] = 1;
		t['lastUpdate'] = getTimestamp();
		obj.push(t);
	}
	return obj;
 }

// parses single stock future data
function parseFutureRealtime(data) {
    var temp = data.split(",");
    var result = {};
    if (temp) {
        // index futures
        if (data.contains("CFF_RE")) {
            result['price'] = temp[3];
        } else {
            // commodity futures
            result['price'] = temp[6];
        }
    }
    return result;
}

// parses single cn stock data
function parseTencentRealtime(data) {
    var temp = data.split("~");
    if (temp) {
        var result = {};
        result['name'] = temp[1];
        result['price'] = temp[3];
        result['priceIncrement'] = temp[4];
        result['percent'] = temp[5];
        return result;
    }
    return data;
}


/*************** 	RTM(realtime) Cache Functions ****************/
// the save function now with expire time
function saveRtmCache(code, data, expire){
	if(data == undefined || data == '')
		return false;
	expire = expire || G_RTM_CACHE_PERIOD;
  if(loadedRtmResultsCache[code]){
    if((getTimestamp() - loadedRtmResultsCache[code]['timestamp'])> expire){
        loadedRtmResultsCache[code] = {};
  		loadedRtmResultsCache[code]['timestamp'] = getTimestamp();
  		loadedRtmResultsCache[code]['expire'] = expire;
		loadedRtmResultsCache[code]['data'] = data;
        return true;
    } else{
    	return true;
    }
  }

  loadedRtmResultsCache[code] = {};
  loadedRtmResultsCache[code]['timestamp'] = getTimestamp();
  loadedRtmResultsCache[code]['data'] = data;
  loadedRtmResultsCache[code]['expire'] = expire;
  return true;
  
}

/* cache system need to rewrite
*/
function getRtmCache(code){
  if(loadedRtmResultsCache[code] == undefined || loadedRtmResultsCache[code]['timestamp'] == undefined)
    return false;

  if((getTimestamp() - loadedRtmResultsCache[code]['timestamp'])< parseInt(loadedRtmResultsCache[code]['expire'])){
    return loadedRtmResultsCache[code]['data'];
  } else {
    return false;
  }
}

/*************** 	alarm functions		 ***************/

function prepareCusAlarmParameters(){
	// fetch all stocks in custom.csv
	$.post( "load.php", { filename: "data/Statistics/custom.csv" }).done(function( data ) {
        
        //reset data holders
        resetGraphdata();
		resetLoadedResults();
		gDataHolder['automateHedge'] = new Array();

		// parsing data
        data = JSON.parse(data);
        data = data.split('\n');
        var totalLength = data.length;
        for(var i = 1 ; i < data.length; i ++){
          if(data[i] != ""){
          rtmAlarmListRaw[i] = new Array();
          rtmAlarmListRaw[i] = data[i].split(',');
          //assign stocknames
          var stockNames = [rtmAlarmListRaw[i][0],rtmAlarmListRaw[i][1]];
          stockNames = formatStockNames(stockNames);
	      var s = new SKYDataLoader([stockNames[0],stockNames[1]],
	        {"duration":"2y",
	        "div":"realtimeMonitorData",
	        "type": 'automateHedge',
	        "showgraph" :  false,
	        'consoleUpdateMode': 'alarmlog',
	        "updateRealtime":false},i); 
	      graphData[i] = s;
          } else {
          data.splice(i,1);
          }
        }
        var i = 1;
        var delayLoading = setInterval(function () {   
              graphData[i].load();                    
              i++;    
              if(i> totalLength-2) 
                clearInterval(delayLoading);
        }, 150);
      });
}  

function saveCusAlarms(){
	gDataHolder['automateHedge'].sort(function(a,b){
      return (parseFloat(a.sd,10) - parseFloat(b.sd,10));
  	});
	var format = {};
	var needle = ['pairCode','pairName','sd','ave','upperLimit','lowerLimit','hedgeType','purchaseDate','purchasePriceArr'];
	var t  = new Array();
	for(var i = 0 ; i < gDataHolder['automateHedge'].length; i ++)
		 t[i] = subset(gDataHolder['automateHedge'][i], needle);
	format.body = t;
	format.header = "code,name,sd,ave,upperLimit,lowerLimit,hedgeType,purchaseDate,purchasePriceArr\n";
	format.needle = needle;
	format.consoleUpdateMode = 'alarmlog';
  	saveToServer(format,'data/cusalarm.txt');

}

function formatAlarm(alarmStr){
	var t = alarmStr.split("\n");
	var theader = t.shift();
	t = t.removeEmpty();
	
	// prepare structure
	theader = theader.split(",");
	var result = {};
	for(var i = 0; i < t.length; i ++){
		var t_array = t[i].split(",");
		var sub = new Array();
		// initial sublevel 
		result[t_array[0]] = {};
		for(var j = 0 ; j < theader.length; j ++){
			result[t_array[0]][theader[j]] = t_array[j];
		}
		
		//proceed for special case
		var codes = result[t_array[0]].code.split("&");
		var p = result[t_array[0]].purchasePriceArr.split("&");
		result[t_array[0]]['purchasePrice'] = {};
		for(var j = 0 ; j < codes.length ; j ++)
			result[t_array[0]]['purchasePrice'][codes[j]] = parseFloat(p[j]).toFixed(2);
		
	}
	return result;
}

function switchAlarms(){
	gAlarmOn = (gAlarmOn == true) ? false : true;
	if(gAlarmOn){
		$('#alarmCtrl').val('Alarm On!');
		$('#alarm_light').addClass('alarm_on').stop().fadeIn("slow");
	}else{
		$('#alarmCtrl').val('Alarm Off');
		$('#alarm_light').addClass('alarm_on').stop().fadeOut("slow");
	}
}
// superfast
function trackListAlarmExec(param){
	var tid = param.tid;
	var obj = gAlarm['alarmTrackList']['main'][tid];
	var importance = param.sendMobile;
	var duration = param.duration;
	// convert digital to percentile;
	if(obj.alarmType == 2)
		var percent = parseFloat(obj.priceOrNumber*100);

	switch(obj.alarmType){
		// important!!!!!!!!!!!!!!!!!!!!!!!!!
		// conditions are missing cases for = 
		case 1:
			if(obj.condition == '>'){
				if(obj.results.currentPrice > obj.priceOrNumber)
					if(sendAlarmFull(param.name+'到达目标价格: '+obj.condition+' '+obj.priceOrNumber+' / 股','trackList_'+tid,param.name,duration,importance,9999))
						alarmDone(param.tid);
			} else if(obj.condition == '<'){
				if(obj.results.currentPrice < obj.priceOrNumber)
					if(sendAlarmFull(param.name+'到达目标价格: '+obj.condition+' '+obj.priceOrNumber+' / 股','trackList_'+tid,param.name,duration,importance,9999))
						alarmDone(param.tid);
			}
		break;

		case 2:
			if(obj.condition == '>'){
				if(obj.results.currentPercent > percent)
					if(sendAlarmFull(param.name+'到达目标价格: '+obj.condition+' '+percent+'%','trackList_'+tid,param.name,duration,importance,9999))
						alarmDone(param.tid);
			} else if(obj.condition == '<'){
				if(obj.results.currentPercent < percent)
					if(sendAlarmFull(param.name+'到达目标价格: '+obj.condition+' '+percent+'%','trackList_'+tid,param.name,duration,importance,9999))
						alarmDone(param.tid);
			}
		break;

		default:
		break;
	}
}

function alarmDone(tid){
	gAlarm['alarmTrackList']['main'].splice(tid,1);

}

function updateTrackListRtmResults(tid, data){
	var list = gAlarm['alarmTrackList']['main'];
	list[tid]['results']['currentPrice'] = data.price;
	list[tid]['results']['currentPercent'] = data.percent;
	if(list[tid].smartPercent != 0){
		// update smart percent
		//if(ckTracklistRtmUpdatePrevious(tid))
	}

}

function cleanTrackList(){
	var list = gAlarm['alarmTrackList']['main'];
	var now = getTimestamp();
	for(var i = 0 ; i < list.length; i ++){
		if(now - parseInt(list[i].timestamp) > list[i].expirationDate)
			list.splice(i,1);
	}
	
	saveTrackList();
	if(gAlarmFan)
		smartLog(' cleaning alarmTrackList complete! ','alarm');
}

// tracklist master
function trackAlarmMaster(){
	var list = gAlarm['alarmTrackList']['main'];
	var now = getTimestamp();
	smartLog('tracklist ('+list.length+') ready to load ','alarm');
	for(var i = 0 ; i < list.length; i ++){
		var param = {'tid': i,
					  'name': 'name_'+list[i].name,
					 'returnResults':'trackList',
					 'expire':10,
					 'importance': list[i].sendMobile,
					 'sendMobile': list[i].sendMobile,
					 'duration': list[i].duration}
		fetchRealtimeN(list[i].code,param);
	}
}

function resetTrackList(){
    gAlarm['alarmTrackList'] = {};
	gAlarm['alarmTrackList']['main'] = new Array();
	gAlarm['alarmTrackList']['log'] = new Array();
	gAlarm['alarmTrackList']['settings'] = {'alarmType':'1: price, 2:percent',
'smartAlarm':'set a percent that will be triggered above or below current percent,eg. stock currently 3.5%, smartAlarm:-1 means it will trigger at 2.5%'};
	saveTrackList();
}

function saveTrackList(){
	var data = gAlarm['alarmTrackList'];
	saveObj(data, 'data/AlarmTracklists.txt');
}

function dumpAlarms(){
	var data = {};
	data.header = 'id, ratioMA5_MA30,ratio5, ratio30';
	var arr = gAlarm['realtimeHistoryAlarms']['ratioResults'];
	for(key in arr){
		data.body = arr[key];
		saveToServer(data,'stat/'+key+'.txt');
	}
}

function ckOnline(){
	if(offlineDevelopperMode){
		smartLog('Realtime alarms disabled at offlineDevelopperMode','alarm');
		return false;
	}
	return true;
}

function alarms(){

	ckOnline();
	//realtime alarms
	//1 min alarms
	//5min alarms
	// check custom alarm with alarm cache
	//gAlarm['cusAlarmCache'] = loadAlarmCache('data/cusalarm.txt');
	if(gAlarmOn)
		var t = window.setTimeout(alarms,5000);
	// load alarms for custom stock pairs, update every 30 minuts
	if(coolDownReady(gAlarm['AlarmCountDowns']['c1800s'])){
		var filename = 'data/Statistics/custom.csv';
		$.post( "load.php", { filename: filename }).done(function( data ) {
			data = JSON.parse(data);
	        data = data.split('\n');
	        for(var i = 0 ; i < data.length; i ++)
	        	data[i] = data[i].replace(',','&');
	        gAlarm['cuslist'] = data;
	        updateRTMCusAlarm();
	        // make light on
	    });
	}

	if(coolDownReady(gAlarm['AlarmCountDowns']['c10s'])){
		
		// load custom hedge pairs, load default system tracking stocks, including online and offline ones
		loadAlarms();
		// check all loaded alarms
		exeAlarms();

      	loadMarketWatch();

	}


	//if(coolDownReady(gAlarm['AlarmCountDowns']['c300s'])){
	
	//updateRTMAlarm('COMMODITY',criteria);
	
	//updateRTMAlarm('MAJOR_MARKETS',criteria);
	
	//}
    // interval to run alarms
}

function exeAlarms(){
	/** check realtime alarm for 
	absolute raise above 3%
	absolute raise above 5%
	relative stregth
	hit surglimit;
	execute every 60s
	*/
	ckrealtimeAlarm();

	/** check realtime history alarms for
	sudden increase in price / volume
	sudden increase in volume;
	execute every 15 s
	*/
	ckrealtimeHistoryAlarm();

	/** check realtime user conditons,
	track certain stocks for target price or percent, 
	for example, stock trading at $15.4 / share, user could track
	A. when drop below $14 per share
	B. when drop below 2.5% of todays increment

	smartalarm traces current price minus certain percentile.
	*/
	trackAlarmMaster();
}

// this function calculates the ratio
function ckRealtimeHistoryDataRatio(id,obj,type,objHistory,numberOfBacktrace){
	var target = objHistory.length - numberOfBacktrace;
	if(target<1){
		//if(gAlarmFan)	
			//smartLog('not enough data points for '+obj[id].name+' current points' + target,'alarm');
		return false;
	}

	var counter = 0;
	var tmp = 0;
	// start with -2 because its self cannot be calculated
	var begin = objHistory.length -2;

	// adding previous ones
	for(var i = begin; i >= target; i --){
		if(objHistory[i][id] == undefined)
			return 0 ;
		tmp = tmp + parseFloat(objHistory[i][id][type]);
		counter++;
	}

	var ratio = (obj[id][type]) / ave(tmp, (numberOfBacktrace-1));
	if(ratio == undefined || isNaN(ratio))
		ratio = 0;
	ratio = ratio.toFixed(2);
	return ratio;
}

function ckrealtimeHistoryAlarm(){
	var criteria = {};
	criteria['cks'] = 'sudSurge,volIncrease';
	criteria['r'] = ['hs300'];
	for(key in gAlarm['realtimeHistoryAlarms']['Results']){
		_ckrealtimeWithHistory(gAlarm['realtimeHistoryAlarms']['Results'][key],criteria);
	}
}

function ckrealtimeAlarm(){
	var criteria = {};
	criteria['cks'] = 's3,s5,ns3,ns5,slimit,blimit';
	criteria['r'] = ['hs300'];
	for(key in gAlarm['realtimeAlarms']['Results']){
		_ckrealtime(gAlarm['realtimeAlarms']['Results'][key],criteria);
	}
}

function _ckrealtimeWithHistory(obj, criteria){
	// prevent default
	if(obj.length < 1)
		return false;
	//check Volume detect
	var lastIndex = obj.length-1;
	var lastObj = obj[lastIndex];

	for(var i = 0 ; i < lastObj.length; i ++){
		var name = lastObj[i].name;
		var code = lastObj[i].code;
		if(criteria.cks.contains('volIncrease')){
		// check current key value compare to last N, 
		// return in a ratio with f(current) / sum(F(current - n))
		// MA5 is actually 6
		// MA30 is actually 31
		var ratioM5 = ckRealtimeHistoryDataRatio(i,lastObj,'Volume',obj,6);
		var ratioM30  = ckRealtimeHistoryDataRatio(i,lastObj,'Volume',obj,31);
		var ratioM60  = ckRealtimeHistoryDataRatio(i,lastObj,'Volume',obj,61);
			if(ratioM60 != undefined && ratioM60 != 0){
				if(ratioM30 != 0)
					var finalRatio = (ratioM5 / ratioM30).toFixed(2);
				else
					var finalRatio = 0;
				var save = {};
				save['id'] = i;
				save['ma5'] = ratioM5;
				save['ma30'] = ratioM30;
				save['ma60'] = ratioM60;
				save['ma5_ma30'] = finalRatio;
				if(gAlarm['realtimeHistoryAlarms']['ratioResults']['r_'+code] == undefined)
					gAlarm['realtimeHistoryAlarms']['ratioResults']['r_'+code] = new Array();
				gAlarm['realtimeHistoryAlarms']['ratioResults']['r_'+code].push(save);
			
				smartLog('r: for' + lastObj[i].name + ' is : '+ratioM60,'alarm');
					//if(ratio > gAI['Statistics'][name]['volumeExplodeThreadhold'])
				var Volume = lastObj[i].Volume;
					if(ratioM60 > 1.55 && ratioM60 <=2)
						// give importance to 5110 if needed to send to mobile terminal
						sendAlarmFull(Language(true, name + ' 成交量温和放大, 当前量比:'+ratioM60+", 瞬间金额:"+Volume+""),'volIncrease_'+code,name,60,1,9999);
					else if(ratioM60 >2)
						sendAlarmFull(Language(true, name + ' 成交量暴涨!, 当前量比:'+ratioM60+", 瞬间金额:"+Volume+""),'volIncrease_'+code,name,60,1,9999);
			}
		}
	}

}

function _ckrealtime(obj, criteria){
	// current version i is always zero, so this is
	// actually a one dimentional array
	for(var i = 0 ; i < obj.length; i ++){
		// priority with return
		// hig surge/plunge limit
		var alarmSelected= false;
		if(criteria.cks.contains('blimit') && !alarmSelected)
			// alarm set to 1 hour of cooldown	
			alarmSelected = sendAlarmFull(Language(ckStockRange(obj[i],-11,-9.5), obj[i].name + ' 碰到跌停板, 当前:'+parseFloat(obj[i].chg_percent).toFixed(1)+"%"),'blimit_'+obj[i].code,obj[i].name,86400,-1,9999);
			
		if(criteria.cks.contains('slimit')&& !alarmSelected)
			// alarm set to 1 hour of cooldown	
			alarmSelected = sendAlarmFull(Language(ckStockRange(obj[i],9.5,11), obj[i].name + ' 碰到涨停板, 当前:'+parseFloat(obj[i].chg_percent).toFixed(1)+"%"),'slimit_'+obj[i].code,obj[i].name,86400,1,9999);
			
		// raise or drop 5%
		if(criteria.cks.contains('ns5')&& !alarmSelected)
			// alarm set to 1 hour of cooldown	
			alarmSelected = sendAlarmFull(Language(ckStockRange(obj[i],-9.5,-5), obj[i].name + ' 跌幅超过5%, 当前:'+parseFloat(obj[i].chg_percent).toFixed(1)+"%"),'ns5_'+obj[i].code,obj[i].name,86400,-1,9999);
			
		if(criteria.cks.contains('s5')&& !alarmSelected)
			// alarm set to 1 hour of cooldown	
			alarmSelected = sendAlarmFull(Language(ckStockRange(obj[i],5,9.5), obj[i].name + ' 涨幅超过5%, 当前:'+parseFloat(obj[i].chg_percent).toFixed(1)+"%"),'s5_'+obj[i].code,obj[i].name,86400,1,9999);

		// raise or drop 3%
		if(criteria.cks.contains('s3')&& !alarmSelected)
			// alarm set to 1 hour of cooldown	
			alarmSelected = sendAlarmFull(Language(ckStockRange(obj[i],3,5), obj[i].name + ' 涨幅超过3%, 当前:'+parseFloat(obj[i].chg_percent).toFixed(1)+"%"),'s3_'+obj[i].code,obj[i].name,86400,2,9999);
		
		if(criteria.cks.contains('ns3')&& !alarmSelected)
			// alarm set to 1 hour of cooldown	
			alarmSelected = sendAlarmFull(Language(ckStockRange(obj[i],-5,-3), obj[i].name + ' 跌幅超过3%, 当前:'+parseFloat(obj[i].chg_percent).toFixed(1)+"%"),'ns3_'+obj[i].code,obj[i].name,86400,-2,9999);
	}
}


function ckStockRange(stock, a,b){
	if(parseFloat(stock.chg_percent) > a &&
		parseFloat(stock.chg_percent) <= b)
		return true;
	return false;
}

function saveGroupAlarm(obj,key){
	// save for realtime

	if(gAlarm['realtimeAlarms']['Results'] == undefined)
		gAlarm['realtimeAlarms']['Results'] = {};
	gAlarm['realtimeAlarms']['Results'][key] = obj;
	//save for realtime history
	if(gAlarm['realtimeHistoryAlarms']['Results'][key] == undefined)
		gAlarm['realtimeHistoryAlarms']['Results'][key] = new Array();
	gAlarm['realtimeHistoryAlarms']['Results'][key].push(obj);
	alarmLog('Saving History for ' + key + " done ( "+gAlarm['realtimeHistoryAlarms']['Results'][key].length+" )");
	return true;
}

function loadAlarms(){
	if(!ckOnline())
		return;
	// get a copy of alarms
	var alarms = clone(gAlarm['realtimeAlarms']['groups']);
	for(key in alarms){
		//continue here
		groupFetchStock(alarms[key].codes, key);
	}
}

function groupFetchStock(codes,key){
	//filter and regroup codes, prepare for different type
	codes = formatStockNames(codes,true);
	var groupedCodes = catagorize(codes);
	var param = {'groupFetch':  true,
				 'type' : key};
	for(key in groupedCodes){
		fetchGroupRealtimeN(groupedCodes[key], param);	
	}
}

function updateRTMAlarm(type,criteria){
	// fetch realtime parameter
	var param ={
		'returnResults' : 'RTMAlarm',
		 code: ''
	};

	switch(type){
		case 'COMMODITY':

		break;

		case 'MAJOR_MARKETS':
		break;

		default:
		break;
	}
}

function updateRTMCusAlarm(){
	var list = gAlarm['cuslist'];
	//var list = ["sh600566&us_chad"];
	
	var listCache = gAlarm['cusAlarmCache'];
	var listCacheSub = {};
	
	for(var i = 0 ; i < list.length; i ++){
		listCacheSub = listCache[list[i]];
		if(listCacheSub == undefined){
			if(gAlarmFan)
			  alarmLog("unabled to find pair "+ list[i] + " in gAlarm['cusAlarmCache']",2);
		} else {
			var t = list[i].split('&');
			//check hedgetype, if = 1, addition, else, substraction
			var param = {};
			param.id = i;
			param.codeLen = t.length;
			param.name = listCacheSub.name;
			param.codePair = list[i];
			param.hedgeType = listCacheSub.hedgeType;
			param.returnResults = 'cusAlarm';
			// reset id
			gAlarm['rtmCache'][param.id] = new Array();

			for(var j = 0 ; j < t.length; j ++){
				param.subid = j;
				fetchRealtimeN(t[j],param);
			}			
			
		}
	}

}

function finalizeCUSAlarm(param){

	var result = param.result;
	var code = param.code;

	//exception
	if(param.code.contains('us_chad'))
    	return;
    else if(param.name == undefined)
    	return;

	if(gAlarm['rtmCache'][param.id] == undefined)
    	 gAlarm['rtmCache'][param.id] = new Array();

	var temp = gAlarm['cusAlarmCache'][param.codePair];

	var m = {};
	m['data'] = result;
	m['price'] = result['price'];
	m['purchasePrice'] = temp.purchasePrice[code];
	m['purchaseDate'] = temp.purchaseDate;
	if(parseFloat(m['price']) == 0)
			return;
	gAlarm['rtmCache'][param.id].push(m);

	// // trigger action, when loading is finished
	if(objLength(gAlarm['rtmCache'][param.id]) == param.codeLen){
		// get purchase price
		var percent = 0;
		for(var i = 0 ; i < param.codeLen; i ++){
			var p = parseFloat(gAlarm['rtmCache'][param.id][i]['price']);
			var pp = parseFloat(gAlarm['rtmCache'][param.id][i]['purchasePrice']);
			
			if(param.hedgeType == 1){
				var _percent = ((p-pp) / pp * 100).toFixed(2);
				percent += parseFloat(_percent);
			}
		}

		//assign variables
		var system = {};

		system['lastHedge'] = parseFloat(percent.toFixed(2));
		
		system['lastUpdate'] = getFullTime();

		system['upperLimit'] = temp.upperLimit;

		system['lowerLimit'] = temp.lowerLimit;

		system['sd'] = temp.sd;

		system['ave'] = temp.ave;

		gAlarm['rtmCache'][param.id].push(system);

		// determine alarm conditions
		/* Alarm condition codes
		   1. Buy
		   2. Sell
		   3. Rapid Growth
		   4. Rapid Drop
		   5. Sudden Volume Increase
		 */
		 // superfast
		var condition = 0;
		if(system['lowerLimit'] < 0 )
			if(system['lastHedge'] < system['lowerLimit']*0.95)
				condition = 1;
	    else
	    	if(system['lastHedge'] < system['lowerLimit']*1.1)
	    		condition = 1;

	    //temporary fix
	    var stock1name = param.name.split("&")[0];
	    var stock1code = param.codePair.split("&")[0];
	    
	    
	    //
	    switch (condition){
	    	case 1:
			  //   	display.append(param.name+'('+ param.code+') |  当前数值:'+system['lastHedge'] +
					// '，上限:'+ temp.upperLimit+' 下限:' + temp.lowerLimit + '<br>');
			var pcmsg = param.name+'('+ param.code+') |  当前数值:'+system['lastHedge'] + '，上限:'+ temp.upperLimit+' 下限:' + temp.lowerLimit + '<br>';
			var tempmsg = stock1name+'('+param.code+')进入购买区域. ('+system['lastHedge']+' '+temp.lowerLimit+'/ )';
			sendAlarm([tempmsg,pcmsg],'hedgeAlarm_'+stock1code,param.name);
	    	break;

	    	default:
	    	break;
	    }
		
	}
}

/*************** Remote Communication for Alarm System */
/* outgoing */
function sendAlarm(msg,id,name){
	// 86400 for 1 day
	// 2 for A2 level of importance (check importance list)
	// 0 for none repeat
	return sendAlarmFull(msg,id,name,86400,2,9999);
}


// for daily alarm, modify repeat to 1, alarms might be send daily
function sendAlarmFull(msg, id, name, duration, importance, repeat){
	
	if(msg == '' || msg == undefined)
		return false;

	//check is aray
	var _msg, pcmsg;
	pcmsg = msg+"<br>";
	var phonemsg = msg;

	if(msg.constructor === Array){
		phonemsg = msg[0];
		var pcmsg = msg[1];
		msg = _msg;
	}

	pcmsg = getFullTime() + ' // ' + pcmsg;

	pcmsg = getImportance(pcmsg,importance);

	//check for last duration
	cooldownList = gAlarm['cooldownList'];

	// new alarm
	if(cooldownList[id] == undefined){
		// send to jingts server
		//send(msg);
		cooldownList[id] = id;
		//assign id
		// add sysinfo
		cooldownList[id] = {};
		cooldownList[id]['duration'] = duration;
		cooldownList[id]['lastUpdate'] = getTimestamp();
		cooldownList[id]['importance'] = importance;
		cooldownList[id]['repeat'] = parseInt(repeat);
		cooldownList[id]['msg'] = msg;

		//send computer
		var d = $('#alarmsDetails');
		//superfast
		d.append(pcmsg + "<br>");
		// scoll to bottom
		d.scrollTop(d.prop("scrollHeight"));

		if(importance == 5110)
			sendTocellphone(phonemsg);
			//superfast

		if(gAlarmFan)
			console.log("Alarm:"+id+" sent succesufully. "+ getFullTime());

		return true;
	} else {
	// if alarm exists
		// if cooldown complete and need to repeat
		if(coolDownReady(cooldownList[id]) && cooldownList[id]['repeat'] > 0)
		{
			//send(msg);
			// update time
			cooldownList[id]['lastUpdate'] = getTimestamp();
			// decrease counter
			cooldownList[id]['repeat']--;

			if(gAlarmFan)
				console.log('Alarm: '+ id + " sent on " + getFullTime());

			gAlarm['cooldownList'] = cooldownList;

			//send computer
			var d = $('#alarmsDetails');
			d.append(pcmsg + "<br>");
			// scoll to bottom
			d.scrollTop(d.prop("scrollHeight"));

			if(importance == 5110)
			sendTocellphone(phonemsg);

			return true;
		}
		if(gAlarmFan)
			smartLog("Alarm: ("+getFullTime()+ ") "+ name +" ("+id+") still cooling down, time left:"+ getCoolDownTimeinStr(cooldownList[id])+", repeat: "+cooldownList[id]['repeat'],'alarm');
	}

	gAlarm['cooldownList'] = cooldownList;

	return false;

}

// this function for realtime alarm alert in section ii
function alarmAlert(id,msg,importance, cooldownDuration){
	//check cooldown
	if(gAlarm['realtimeAlarms']['cooldown'][id] == undefined){
		setCoolDown(gAlarm['realtimeAlarms']['cooldown'], id, cooldownDuration);
	} else {
		if(!coolDownReady(gAlarm['realtimeAlarms']['cooldown'][id]))
		return false;
	}

	//console
	importance = importance || 0;

	if(msg == '' || msg == undefined)
		return false;

	console.log(msg);

	msg = getImportance(msg,importance);

	var d = $('#alarmsDetails');

	d.append(msg+"<br>");
	// scoll to bottom
	d.scrollTop(d.prop("scrollHeight"));
}

//send jingts.com
function sendTocellphone(msg){
	var server = 'communicate.php';
	msg = msg.replaceAll(' ','_');
	server =  server + '?m='+msg;
	$.get(server, function(data) {
       	console.log(data);
    });
	
}

function getImportance(msg, importance){
	switch(importance){
		case 0:
		break;

		case 1:
		msg = "<span class='AlarmRed2'>"+msg+"</span>";
		break;

		case 2:
		msg = "<span class='AlarmRedLight'>"+msg+"</span>";
		break;

		case 3:
		msg = "<span class='AlarmBlue'>"+msg+"</span>";
		break;

		case -1:
		msg = "<span class='AlarmGreen'>"+msg+"</span>";
		break;

		case -2:
		msg = "<span class='AlarmGreenLight'>"+msg+"</span>";
		break;

		default:
		break;
	}
	return msg;
}

// make cooldown universal
function coolDownReady(obj){
	if ( ((getTimestamp() - parseInt(obj['lastUpdate'])) > parseInt(obj['duration'])) || obj.firstTime == true ) {
		if(obj.firstTime != undefined)
			obj.firstTime = false;
		obj['lastUpdate'] = getTimestamp();
		return true;
	}
	return false;
}

function getCoolDownTimeinStr(obj){
	var waiting = getTimestamp() - parseInt(obj['lastUpdate']);
	var target = parseInt(obj['duration']);
	return secondsToHMS((target - waiting));

}
/*************** assign color functions  ***************/
function htmlRed(str){
	return '<span class="graphTitle_0">'+str+'</span>';
}

function htmlblue(str){
	return '<span class="graphTitle_1">'+str+'</span>';
}

function htmlAlarmRed(str,fontsyle){
	if(fontsyle == 'bold')
		return '<span class="AlarmRed isBold">'+str+'</span>';
	else if(fontsyle == 'italic')
		return '<span class="AlarmRed isItalic">'+str+'</span>';
	else
		return '<span class="AlarmRed">'+str+'</span>';
}

function htmlAlarmGreen(str){
	if(fontsyle == 'bold')
		return '<span class="AlarmGreen isBold">'+str+'</span>';
	else if(fontsyle == 'italic')
		return '<span class="AlarmGreen isItalic">'+str+'</span>';
	else
		return '<span class="AlarmGreen">'+str+'</span>';
}

/*************** saving functions  ************/

function save(originalData, filename){
	var t = JSON.stringify(originalData);
}

// save with serialized string 
function saveObj(data, filename){
	var str = JSON.stringify(data);
	__SAVE_TO_SERVER(str,filename,true);
}
// save as csv
function saveToServer(data, filename){
  var result = data.header;
  var arr = data.body;
  var consoleUpdateMode = data.consoleUpdateMode;
  var len =  arr.length;
  if(len == undefined)
  		len = Object.size(data.body);
  if(result == undefined){
  	 for(key in arr[0])
  	 	result += key+',';
  }
  result = result.substring(0,result.length-1)+"\n";
  for(var i = 0 ; i < len; i ++){
      var str = "";
      for(key in arr[i]){
        str += arr[i][key]+",";
      }
      str = str.substring(0, str.length-1)+"\n";
      result += str;
  }

  //prepare for ajax, and save for obj
  result = result.replaceAll('\r',"");
  var str = JSON.stringify(result);s
  str = str.replaceAll('\r',"");
  str = encodeURIComponent(str);
  
  $.post( "save.php", { raw: str, filename: filename }).done(function( data ) {
        //console.log( "Save Complete!:  " + filename );
        console.log(data);
        smartLog(data,consoleUpdateMode);

  });
}

function saveResultsToServer(arr,filename){
    var result = "Code, Name, Standard Deviation, Average, upperLimit, lowerLimit,HedgeType, Skewness, latestValue, BuySuggestion\n"
     for(var i = 0 ; i < arr.length; i ++){
            result += arr[i]['pairCode']+','+
                  arr[i]['pairName'] + ','+
                  arr[i]['sd'] + ','+
                  arr[i]['ave'] + ','+
                  arr[i]['upperLimit'] + ','+
                  arr[i]['lowerLimit'] + ','+
                  arr[i]['hedgeType'] + ','+
                  arr[i]['skewness'] + ','+
                  arr[i]['latestHedgeIndex'] + ','+
                  arr[i]['opRecommand'] + "\n";
     }
     result = result.replaceAll('\r',"");
     var str = JSON.stringify(result);
     str = str.replaceAll('\r',"");
     str = encodeURIComponent(str);
      $.post( "save.php", { raw: str, filename: "data/Statistics/"+filename+".csv" }).done(function( data ) {
        //console.log( "Save Complete!:  " + filename );
        console.log(data);
      });

}
/*************** realtime console Commands ****/
function ckcmd(cmdraw){
	// add 600050 chad 
	// split first
	var param = cmdraw.split(' ');
	var cmd = param[0];
	//executing commands
	switch(cmd){
		case 'add':
		//check there are enough parameters
		if(param.length != 3){
			smartLog("wrong parameters, use format stock1 (SPACE) stock2");
			return;
		}
		//executing
		var codes = "";
		for(var i = 1 ; i < param.length ; i ++)
				codes = codes + formatStockName(param[i]) + ",";
		if(addtoCustomQue(codes.substring(0,codes.length -1)))
			smartLog("succesufully add: "+codes);
		else
			smartLog("No Duplicates: "+ codes + " already added");
		break;
		// command to deal with tracklist
		case 'track':
		if(param.length ==2){
			if(param[1] == '-d'){
				smartLog("TrackList reset: no more tracking on any custom input stocks");	
				resetTrackList();
				return ;
			}
		}
		if(param.length != 6 && param.length != 3 && param.length != 4){
			smartLog("wrong parameters, -track stock -pNumber -percent% -expirationDate -smartPercent sendMobile");
			return;	
		}
		if(param.length == 3){
			// add two 0s
			param.push(21600);
			param.push(0);
			param.push(0);
		}


		if(!param[2].contains('p') && !param[2].contains('%') || param[2].contains('p') && param[2].contains('%')){
			smartLog("failed! for price check use >p13.5, for percentile use >3.5%");
			return;		
		}

		var condition = param[2].substring(0,1);
		param[2] = param[2].substring(1,param[2].length);

		if( condition != ">" && condition != "<" && condition != "=" ){
			smartLog('failed! missing condition, please use >p13.5 or >3.5%');
			return;
		}
		
		var code = param[1];
		// 1: price , 2: percent
		var alarmType = param[2].contains('p') ? 1 : 2;
		var priceOrNumber = param[2].contains('p') ? parseFloat(param[2].substring(1,param[2].length)) :
							parseFloat(param[2].substring(0,param[2].length-1)/100).toFixed(4);
		// 5110 means send to mobile, 1 means importance top priority
		//var sendMobile = (parseInt(param[5]) == 1) ? 5110 : 1;
		var sendMobile = 5110;
		var smartPercent = parseFloat(param[4]).toFixed(1);
		if(isNaN(smartPercent))
			smartPercent =0;
		var expirationDate = param[3];
		// tracking condition
		//packaging
		var obj = {};
		obj.code = formatStockName(code);
		// this alarm expires after 6 hours of onset
		obj.expirationDate = expirationDate;
		// current alarms
		obj.timestamp = getTimestamp();
		// determine greater or smaller
		obj.condition = condition;
		// determine a percentage based or price based alarm 
		obj.alarmType =alarmType;
		// the number that belongs to a percent or price
		obj.priceOrNumber = priceOrNumber;
		// send to moboile terminao or not
		obj.sendMobile = sendMobile;
		// dynamica tracing
		obj.smartPercent = smartPercent;
		obj.results = {};
		obj.results['currentPrice'] = 0;
		obj.results['currentPercent'] = 0;
		obj.results['prePrice'] = 0;
		obj.results['prePercent'] = 0;
		obj.results['preUpdateTime'] = 0;
		obj.results['preUpdatePeriod'] = 120;
		// repeate set to 5 minutes or 300 seconds
		obj.duration = 300;
		//Add to alarmtracklist
		gAlarm['alarmTrackList']['main'].push(obj);	

		//save tracklist
		saveTrackList();

		break;
		// superfast
		// console 
		case 'help':
			smartLog(" -add stock1 stock2 ");
			smartLog(" -track stock {conditon}pNumber/{condition}percent% smartPercnt sendMobile");
			smartLog(" -clear (clear console)");
			smartLog(" -refresh")
			smartLog(" -save (save stock stacks after added to custome que)");
			smartLog(" -save (save stock stacks after added to custome que)");
			smartLog(" -filter minSkewness maxStandardDeviation");
			smartLog(" -marketwatch stock1");
		break;

		case 'marketwatch':
			var code = formatStockName(param[1]);
			addToMarketWatch(code);
		break;

		case 'filter':
			if(rtmCurrentView.contains('custom')){
				smartLog('Warning, filter does not work in custom view (user selected stocks');
			} else {
				gFilter['skewnessMin'] = param[1];
				gFilter['maxSD'] = param[2];
				updateRTMCanvas(rtmCurrentView);
				smartLog('update filter for '+rtmCurrentView + ' is succesuful.');
			}
		break;

		case 'clear':
		$('#realtimeConsole #content').html('Console Ready, type -help to see commands<br>');
		break;

		case 'refresh':
		location.reload();
		break;

		case 'del':
		break;

		case 'exit':
		resetConsole();
		break;

		case 'save':
		rtmCustomExport();
		break;

		default:
		$('#realtimeConsole #content').append('"'+cmdraw + '" not a valid command<br>');
		break;
	}
}
/*************** time functions ***************/

function secondsToHMS(d) {
d = Number(d);
var h = Math.floor(d / 3600);
var m = Math.floor(d % 3600 / 60);
var s = Math.floor(d % 3600 % 60);
return ((h > 0 ? h + ":" + (m < 10 ? "0" : "") : "") + m + ":" + (s < 10 ? "0" : "") + s); }


function toChineseYYYYMMDD(date) {
    var date = new Date(date);
    var yyyy = date.getFullYear().toString();
    var mm = (date.getMonth() + 1).toString(); // getMonth() is zero-based
    var dd = date.getDate().toString();
    return yyyy + "-" + (mm[1] ? mm : "0" + mm[0]) + "-" + (dd[1] ? dd : "0" + dd[0]); // padding
}

function getCNFullYMD(){
	var date =new Date();
	var yyyy = date.getFullYear().toString();
    var mm = (date.getMonth() + 1).toString(); // getMonth() is zero-based
    var dd = date.getDate().toString();
    return yyyy + (mm[1] ? mm : "0" + mm[0]) + (dd[1] ? dd : "0" + dd[0]); // padding
}

function getFullTime(){
   return getFullYMDH();
}

function getFullYMDH() {
    var date = new Date();
    var t = (date.getMonth() + 1) + '/' + date.getDate() + '/' + date.getFullYear() + ' ' +
        date.getHours() + ':' + date.getMinutes();
    return t;
}

function getCNFullYMDH(){
    var offset = +16;
    var d = new Date();
    var utc = d.getTime() - (d.getTimezoneOffset() * 60000);
    var nd = new Date(utc + (3600000 * offset));
    var t = (nd.getMonth() + 1) + "/" + nd.getDate() + "/" + nd.getFullYear()+" "+
    nd.getHours() + ":"+nd.getMinutes();
    return t;   
}

function toUnivfiedMMDDYYYY(date) {
    var date = new Date(date);
    var t = (date.getMonth() + 1) + '/' + date.getDate() + '/' + date.getFullYear();
    return t;
}


function getCurrentDayNumber(){
	return new Date().getDate();
}

function getDayInChina() {
    return calcTime('beijing', '+8');
}

function getDHMInChina() {
    var d = new Date();
    var utc = d.getTime() - (d.getTimezoneOffset() * 60000);
    var nd = new Date(utc + (3600000 * 16));
    return ((nd.getMonth() + 1) + "/" + nd.getDate() + "/" + nd.getFullYear() + " " + nd.getHours() + ":" + nd.getMinutes());
}

function calcTime(city, offset) {
    var d = new Date();
    var utc = d.getTime() - (d.getTimezoneOffset() * 60000);
    var nd = new Date(utc + (3600000 * offset));
    return ((nd.getMonth() + 1) + "/" + nd.getDate() + "/" + nd.getFullYear());
}

function getDayOneYearAgo() {
    var offset = +16;
    var d = new Date();
    var utc = d.getTime() - (d.getTimezoneOffset() * 60000);
    var nd = new Date(utc + (3600000 * offset));
    nd.setFullYear(nd.getFullYear() - 1);
    return ((nd.getMonth() + 1) + "/" + nd.getDate() + "/" + nd.getFullYear());
}    

function parseUSRealtime(data){
	try{
	   	  data = JSON.parse(data);
	  	  var result = {};
		  result['name'] = data.chart.result[0].meta.symbol;
		  result['price'] = data.chart.result[0].indicators.quote[0].close[1];
		  result['percent'] = (data.chart.result[0].indicators.quote[0].close[1] - data.chart.result[0].indicators.quote[0].close[0])/data.chart.result[0].indicators.quote[0].close[1] * 100;
		  result['percent'] = result['percent'].toFixed(1);
		  result['priceIncrement'] = (data.chart.result[0].indicators.quote[0].close[1] - data.chart.result[0].indicators.quote[0].close[0]).toFixed(1);
		  
		  return result;
	} catch(e){
	  smartLog(e.Message);
	}
}


/*********** Portfolio ******/
function showpflistDetail(id){
	$('#'+id).toggle("fast");
}


