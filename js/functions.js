/***************	 Skylab 	  ***************/
/** Keyword: skylab, initialize graph
/** Desc: keeps track of the real user portfolio.

/*
	initialize skylab graph
*/
function iniSkylabGraph(data,divName,GRAPH_ID){

   var g = new Dygraph(document.getElementById(divName), data,
    {
      drawPoints: false,
      width: 780,
      height: 160,
      showRoller: false,
      rollPeriod: 14,
      legend: "always",
      highlightCircleSize: 5,
      strokeWidth: 1,
      labelsDiv: 'g_legend_'+GRAPH_ID,
  	  colors: ["rgba(51,204,204,0.2)",
                "rgba(219,132,148,0.2)",
                "rgba(255,255,255,0.8)",
                "rgba(255,255,255,0.8)"
          ],
      axes : {
        x : { drawAxis:true,
              drawGrid:true,
              pixelsPerLabel: 15,
              axisLabelFontSize:10,
              axisLabelColor:  "rgba(255,255,255,0.3)",
              gridLineColor: "rgba(255,255,255,0.1)",
              axisLineColor: "rgba(255,255,255,0.2)"},
        y : {axisLineWidth : 0.01,
             drawGrid:false,
             pixelsPerLabel: 15,
             axisLabelFontSize:10,
             axisLabelColor:  "rgba(255,255,255,0.2)"}
      },
      'Hedge': {
          strokePattern:null,
          strokeWidth: 2,
          fillGraph: true,
          drawPoints: false,
        },
      'MHedge': {
          strokePattern: null,
          strokeWidth: 2,
          fillGraph: true,
          drawPoints: false
      },
      highlightCallback: function(e) {
	      	var allSpans = $('#g_legend_99999').find("span");
			var masterSpan = $('#g_legend_99999');
	  	 	masterSpan.find(allSpans[1]).css('color','rgb(51,204,204)');
	   		masterSpan.find(allSpans[3]).css('color','rgb(219,132,148)');
      	}
    });


   graphs[GRAPH_ID] = g;
}


/*************** Automate Hedge SYSTEM  ***************/
/** Keyword: autohedge, automate
/** Desc: keeps track of the real user portfolio.

/*
	use this version
*/
function automateHedgeN(filename, output){
  if(filename == undefined ||
  	 output	  == undefined)
  	return false;

     var targetStock = '';
     $.post( "load.php", { filename: filename }).done(function( data ) {
        var loadedListtmp = JSON.parse(data).split("\n");
        var len = loadedListtmp.length;
        var loadedList = new Array();
        for(var i = 0 ; i < len ; i ++){
          var _tmp = loadedListtmp[i].split(',');
          loadedList.push([_tmp[1],_tmp[0]]);
        }

        for(var i = 0 ; i < loadedList.length; i ++){
        var stockNames = [loadedList[i][0],targetStock];
        stockNames = formatStockNames(stockNames);
        var s = new SKYDataLoader([stockNames[0],stockNames[1]],
        {"duration":"2y",
        "div":"realtimeMonitorData",
        "type": 'automateHedge',
        "showgraph" :  false,
        "updateRealtime":false},i);
        graphData[i] = s;
        //need a delayed load!!
        //graphData[i].load();
      }
        var i = 0;
        var delayLoading = setInterval(function () {
              graphData[i].load();
              i++;
              if(i> graphData.length-1)
                clearInterval(delayLoading);
        }, 150)
    });
}

/*
	[OBSOLETE] THIS function is obsolete;
*/
function automateHedge(){
  var filename = 'data/SystemLists/CN_Stocklist.csv';
     var targetStock = 'chad';
     $.post( "load.php", { filename: filename }).done(function( data ) {
        var loadedListtmp = JSON.parse(data).split("\n");
        var len = loadedListtmp.length;
        var loadedList = new Array();
        for(var i = 0 ; i < len ; i ++){
          var _tmp = loadedListtmp[i].split(',');
          loadedList.push([_tmp[1],_tmp[0]]);
        }

        for(var i = 0 ; i < loadedList.length; i ++){
        var stockNames = [loadedList[i][0],targetStock];
        stockNames = formatStockNames(stockNames);
        var s = new SKYDataLoader([stockNames[0],stockNames[1]],
        {"duration":"2y",
        "div":"realtimeMonitorData",
        "type": 'automateHedge',
        "showgraph" :  false,
        "updateRealtime":false},i);
        graphData[i] = s;
        //need a delayed load!!
        //graphData[i].load();
      }
        var i = 0;
        var delayLoading = setInterval(function () {
              graphData[i].load();
              i++;
              if(i> graphData.length-1)
                clearInterval(delayLoading);
        }, 150)
    });
}

/*************** PORTFOLIO TRACKING SYSTEM  ***************/

/** Keyword: real purchase, portfolio,
/** Desc: keeps track of the real user portfolio.

/*
	update purchase price of a certain stock
*/
function updatePurchase(code, val){
	portfolio['details'][code].cost = val;
	filename = 'data/myPortfolio.txt';
	 $.post( "save.php", { raw: packageSaveArr(portfolio), isJSONArr: true, filename: filename }).done(function( data ) {
        //console.log( "Save Complete!:  " + filename );
        console.log(data);
    });
}

/*
	Main function runs portfolio loading;
*/
function showPortfolio(){
  if(!ckOnline())
    return false;
  for(var i = 0 ; i < portfolio['codes'].length ; i ++){
     updateRealtimePortfolio(portfolio['codes'][i],i);
  }
}

/*
	remove entry based on code
*/
function removeEntryFromPortfolio(code){
	// delete one in detil
	delete portfolio['details'][code];
	// delete one in codes
	for(var i = 0 ; i < portfolio.codes.length; i ++)
		if(portfolio.codes[i] == code){
			portfolio.codes.splice(i,1);
			savePortfolio();
			return true;
		}
		return false;
}

/*
	add entry to pf, must contain purchase price, nos, and code, also purchase date
*/
function addEntryToPortfolio(obj){
	portfolio['codes'].push(obj.code);
	portfolio['details'][obj.code] = obj;
	savePortfolio();
}

/*
	update results to portfolio (L3)
*/
function updateRealtimePortfolio(code,i){
    var server = getServer(code);
    if(myPurchaseListRtmData[code] == undefined)
        myPurchaseListRtmData[code] = {};

    myPurchaseListRtmData[code]['purchasePrice'] = portfolio['details'][code].cost;
    myPurchaseListRtmData[code]['nos'] = portfolio['details'][code].nos;
    myPurchaseListRtmData[code]['profit'] = 0;

    $.get(server, function(data) {
      if (code.contains('us'))
            try{
              var result = parseUSRealtime(data);
            } catch(e){
              smartLog(e.Message);
            }

        else if (code.toLowerCase().contains('f_'))
        // parse CN FUTURE realtime
            var result = parseFutureRealtime(data);
        else
        // parse CN STOCK realtime
            var result = parseTencentRealtime(data);
       result['code'] = code;
       appendToPortfolio(result,myPurchaseListRtmData);
         // end AJAX
    });
}

/*
	fetch realtime portfolio in group (L1)
*/
function fetchRealtimePortfolio(){
	groupFetchStock(portfolio.codes,'portfolio');
}

/*
	fetch realtime portfolio in group (L2)
*/
function updateFetchedRealtimePortfolio(){
	var t = getGroupFetchData('portfolio');
	for(var i = 0 ; i < t.length ; i ++){
		t[i]['code'] = formatStockName(t[i]['code'].toLowerCase());
			var codeData = getPortfolioData(t[i]['code']);
		if(codeData){
			var latestBalance = (t[i].price - codeData.cost) * codeData.nos;
			if(t[i].code.contains('us_'))
				latestBalance *= 6.5;
			if(t[i].price == 0)
				latestBalance = 0;
			//continue here tomorrow to fixs the loaded stats format difference problem

			portfolio['stats']['totalBalanceRaw'].push(latestBalance);
			var pf_balance = $('#pf_balance_'+t[i]['code']);
			pf_balance.html(latestBalance.toFixed(0));
			pf_balance.effect("highlight", {}, 1200);

		} else {
			// could not find
		}
	}

	// check if totalbalance is ready
	if(portfolio['stats']['totalBalanceRaw'].length == getPortfolioLength())
		updatePortfolioBalance(sum(portfolio['stats']['totalBalanceRaw']));
	//pf_balance_us_chad
}

function updatePortfolioBalance(balance){
	var div= $('#pf_overall_balance');
	div.html(balance.toFixed(1));
	div.effect("highlight", {}, 1200);
	// reset
	portfolio['stats']['totalBalanceRaw'] = new Array();
	smartLog('System updated at: '+getFullYMDH(),'alarm');
}

function getPortfolioLength(){
	return portfolio['codes'].length;
}

function getPortfolioData(code){
	return portfolio['details'][code];
}

/*
	update results to portfolio (L3)
*/
function appendToPortfolio(result, rtmData){

    var code = result['code'];
    var currentPrice = parseFloat(result['price']);
    var purchasePrice = parseFloat(rtmData[code]['purchasePrice']);
    var nos = parseInt(rtmData[code]['nos']);
    var profit = (currentPrice - purchasePrice) * nos;
    var name = result['name'] != undefined ? result['name'] : code;
    var percentSince = (currentPrice - purchasePrice) / purchasePrice * 100;
    var sumBeginning = nos * purchasePrice;
    var sumCurrent = nos*currentPrice;

    if(code.contains('us')){
      profit *=6.5;
      sumBeginning *= 6.5;
      sumCurrent *= 6.5;
    }

    percentSince = percentSince.toFixed(2)+ "%";
    profit = profit.toFixed(1);
    myPurchaseListRtmData[code]['profit'] = profit;
    myPurchaseListRtmData[code]['sumBeginning'] = sumBeginning;
    myPurchaseListRtmData[code]['sumCurrent'] = sumCurrent;
    myPurchaseListMetaData['loadingComplete']++;
    myPurchaseListMetaData['totalgain']+= parseFloat(profit);
    myPurchaseListMetaData['sumBeginning'] += sumBeginning;

    var str = htmlTemplate['pf_template_list'];
    str = str.replaceAll('#code#',code).
    replace('#name#',name).
    replace('#PercentSince#', percentSince).
    replace('#CODE#', code).
    replace('#balance#',profit).
    replace('#buyPrice#',purchasePrice).
    replace('#currentPrice#',currentPrice).
    replace('#nos#',nos).
    replace('#initialValue#',sumBeginning).
    replace('#currentValue#',sumCurrent);
    $('#myPf_1').append(str);
    //color code
    colorCode("#pf_balance_"+code,profit);
    colorCode("#pf_percent_"+code,parseFloat(percentSince));

    if(myPurchaseListMetaData['loadingComplete'] == myPurchaseListMetaData['total']){
      var percent = (myPurchaseListMetaData['totalgain'] / myPurchaseListMetaData['sumBeginning'] * 100).toFixed(1);
      var annualPercent = ((myPurchaseListMetaData['totalgain'] /  myPurchaseListMetaData['sumBeginning']) * 100 * (365 / getTimeDifferenceInDays(myPurchaseListMetaData['purchaseDate']))).toFixed(1)+"%";
      str = htmlTemplate['pf_sum'];
      str = str.replace('#overall#',myPurchaseListMetaData['totalgain'].toFixed(1)).
      replace('#numDays#',getTimeDifferenceInDays(myPurchaseListMetaData['purchaseDate'])).
      replace('#percent#',percent).
      replace('#annualPercent#',annualPercent);
      // append to portfolio
      $('#myPf_1').append(str);
   	  // execute after pf is loaded
      POSTAJAXLoading();
    }
}

/*
	saving portfolio to disk
*/
function savePortfolio(){
	saveObj(portfolio, 'data/myPortfolio.txt');
}

/*
	saving portfolio to disk
*/
function parsePortfolio(data){
	try{
		var t = JSON.parse(data);
		myPurchaseListMetaData.total = t.codes.length;
		return t;
	} catch(e){
		return smartAlarm('{parsePortfolio} Unabled to parse JSON data of myPortfolio.txt','alarm');
	}
}

/*
	update number of stocks of a certain stock
*/
function updateNos(code,val){
	portfolio['details'][code].nos = val;
	filename = 'data/myPortfolio.txt';
	$.post( "save.php", { raw: packageSaveArr(portfolio), isJSONArr: true,  filename: filename }).done(function( data ) {
        //console.log( "Save Complete!:  " + filename );
        smartLog(data,'alarm');
    });
}



/*************** LOCAL CACHE SYSTEMS  ***************/

/** Keyword: cache, cooldown, cache functions
/** Desc: Functions that deals with improved performance for handling data

/*
	save data to cache fetched from remote server with expiration date
*/
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

/*
	get data from cache fetch from remote server
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

/*
	Cooldown check, see if certain timestamps are met
*/
function coolDownReady(obj){
	if ( ((getTimestamp() - parseInt(obj['lastUpdate'])) > parseInt(obj['duration'])) || obj.firstTime == true ) {
		if(obj.firstTime != undefined)
			obj.firstTime = false;
		obj['lastUpdate'] = getTimestamp();
		return true;
	}
	return false;
}

/*
	set an object into cooldownlist
*/
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

/*
	calculate how much time left for an obj in cooldown list
*/
function getCoolDownTimeinStr(obj){
	var waiting = getTimestamp() - parseInt(obj['lastUpdate']);
	var target = parseInt(obj['duration']);
	return secondsToHMS((target - waiting));

}





/*************** REMOTE DATA AND PARSING FUNCTIONS  ***************/

/** Keyword: alarms, parsing, data, fetch, groupfetch, group,realtime
/** Desc: Functions that handles data collections,parsing, and validating.

/*
	save data clusters fetched from remote server
*/
function saveGroupAlarm(obj,key){
	// save for realtime

	if(gAlarm['realtimeAlarms']['Results'] == undefined)
		gAlarm['realtimeAlarms']['Results'] = {};
	gAlarm['realtimeAlarms']['Results'][key] = obj;
	//save for realtime history
	if(gAlarm['realtimeHistoryAlarms']['Results'][key] == undefined)
		gAlarm['realtimeHistoryAlarms']['Results'][key] = new Array();
	gAlarm['realtimeHistoryAlarms']['Results'][key].push(obj);
	if(gAlarmFan > 1)
	alarmLog('Saving History for ' + key + " done ( "+gAlarm['realtimeHistoryAlarms']['Results'][key].length+" )");
	return true;
}

/*
	get the latest single group alarm realtime data
*/
function getGroupFetchData(key){
	return gAlarm['realtimeAlarms']['Results'][key];
}

/*
	get the latest single group alarm realtime data
*/
function getGroupFetchDataFullHistory(key){
	return gAlarm['realtimeHistoryAlarms']['Results'][key];
}
/*
	Combines multiple similar request into one and fetch as a cluster
	input: codes = string array, e.g [stockcode1, stockcode2, stockcode3]
*/
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

/*
	fetch data in realtime from various servers, based on the stock code pased in
	param.returnResults is most important, indicating the callback

	callback: param.returnResults;
*/
function fetchRealtimeN(code,param){

	param = param || {};
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
    	} else if(param.returnResults == 'marketWatch'){
    		 // continue here
	        if(saveGroupAlarm(result,'marketWatch')){
	         	execSingleMarketWatch();
	         	// marketwatch must not be cached, so no need to save cache
	         	return;
	        }
    	}
    	// inject realtime cache
        saveRtmCache(code, data,expire);
		// end AJAX
    });
}

/*
	fetch data in realtime from various servers, based on the stock codes pased
	fetch clustered stocks, codes will be an array of all similar sorted stocks
*/
function fetchGroupRealtimeN(codes,key){
  if(!ckOnline())
    return;
	// deal with Japan speciall case, since japanese stock are not based on JSON
	if(fetchGroupRealtimeN_JPONLY(codes)) return true;

	codes = codes.flatten();

	var server = getServer(codes,key.type);

	// no realtime cache found begin AJAX
    $.get(server, function(data) {
        if (codes.contains('us'))
        // parse US STOCK realtime
            var result = parseUSGroupRealtime(data);
        else if (codes.toLowerCase().contains('f_'))
        // parse CN FUTURE realtime
            //var result = parseFutureRealtime(data);
            console.log("future group load not supported yet");
        else
        // parse CN Group using Tencent API in realtime
            var result = parseCNGroupRealtime(data);

        // continue here
        if(saveGroupAlarm(result,key.type)){
         	if(key.type == "marketWatch"){
         		execMarketWatch();
         	}else if(key.type =="portfolio"){
         		updateFetchedRealtimePortfolio();
         	}
         }



    });

}

/*
	Similar to fetchGroupRealtimeN, but only for japanese stocks
*/
function fetchGroupRealtimeN_JPONLY(codes){
	if(codes.constructor === Array && codes[0].contains('jp')){
		// japan codes
		for(var i = 0 ; i < codes.length; i ++){
			fetchRealtimeN(codes[i],{returnResults:'marketWatch'});
		}
		return true;
	}
	// do nothing
}

/*************** REMOTE DATA AND PARSING FUNCTIONS - PARSING FUNCTIONS ***************/
/** Keyword: alarms, parsing, data, fetch, groupfetch, group,realtime
/** Desc: Functions that handles data collections,parsing, and validating.

/*
	Parsing master function for realtime single stock
*/
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

/*
	Parsing japanese stock realtime data
*/
function parseJPRealtime(data){

	if(data == "")
		return false;

	var r = data.split('#tu#');

	var obj = {};
	obj['name'] = r[0];
	obj['code'] = r[1];
	obj['divCode'] = 'jp_'+r[1];
	obj['price'] = r[2];
	obj['priceIncrement'] = r[3];
	obj['percent'] = r[4];
	obj['volume'] = 1;

	return obj;
}

/*
	Parsing US stock realtime data
*/
function parseUSRealtime(data){
	//check already json type
	if(data.price != undefined && data.priceIncrement != undefined && data.name != undefined)
		return data;
	// parse if not
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

/*
	Parsing CN stock realtime data
*/
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

/*
	Parsing CN Future realtime data
*/
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

/*
	Parsing chinese GROUP/CLUSTER stock in realtime
*/
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

/*
	Parsing japanese GROUP/CLUSTER stock in realtime
*/
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

/*
	Parsing US GROUP/CLUSTER stock in realtime
*/
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

		// make exception for chad
		if(t['code'].toLowerCase().contains('chad'))
			saveRtmCache('us_chad',t,300);
		else
			saveRtmCache(t['code'],t,30);


	}
	return obj;
 }




/*************** ALARM SYSTEMS - MAIN FUNCTIONS ***************/

/** Keyword: alarms, track, custom, security, alarm functions
/** Desc: automated system that realtime check stocks, pairs, hedges to
auto determine actions such as : buy, sell, hold, increase, attention...etc

/*
	user event to turn on/off alarm system
	alarm toggle
	alarmswitch
*/
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

/*
	main alarm event
*/
function alarms(){

	ckOnline();
	if(gAlarmOn)
		var t = window.setTimeout(alarms,15000);
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

	if(coolDownReady(gAlarm['AlarmCountDowns']['c11s'])){

		// load custom hedge pairs, load default system tracking stocks, including online and offline ones
		loadAlarms();
		// check all loaded alarms
		exeAlarms();
	}

	if(coolDownReady(gAlarm['AlarmCountDowns']['c60s'])){

	loadMarketWatch();

  	fetchRealtimePortfolio();

  	}


}

/*
	main Portfolio loader
*/
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


/*
	main Alarm Executor
*/
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


/*************** ALARM SYSTEMS - CUSTOM ALARMS ***************/

/** Key: cus alarms
/** Desc: CUSTOM ALARMS is alarms on user PORTFOLIO


/*
	Portfolio data sending request part.
	initializing data request for further comparing and testing
*/
function prepareCusAlarmParameters(){
	// fetch all stocks in custom.csv
	$.post( "load.php", { filename: "data/Statistics/custom.csv" }).done(function( data ) {

        //reset data holders
        resetGraphdata();
		resetLoadedResults();
		gDataHolder['automateHedge'] = new Array();

		// parsing data
		try{
        	data = JSON.parse(data);
    	} catch(e){
    		smartLog('failed to load custom.csv, '+e.message,'alarm');
    	}
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

/*
	re-call updater to update custom alarms
*/
function updateRTMCusAlarm(){
	var list = gAlarm['cuslist'];
	var listCache = gAlarm['cusAlarmCache'];
	var listCacheSub = {};

	for(var i = 0 ; i < list.length; i ++){
		listCacheSub = listCache[list[i]];
		if(listCacheSub == undefined){
			if(gAlarmFan >1)
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

/*
	saving back custom portfolio file back to server.
*/
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
  	saveDataObjToServer(format,'data/cusalarm.txt');
}

/*
	Portfolio data receiving part.
	will check criteria when data is fully loaded
*/
function finalizeCUSAlarm(param){
	var result = param.result;
	var code = param.code;
	//exception
    if(param.name == undefined)
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
	    switch (condition){
	    	case 1:
			  //   	display.append(param.name+'('+ param.code+') |  当前数值:'+system['lastHedge'] +
					// '，上限:'+ temp.upperLimit+' 下限:' + temp.lowerLimit + '<br>');
			var pcmsg = param.name+'('+ param.code+') |  当前数值:'+system['lastHedge'] + '，上限:'+ temp.upperLimit+' 下限:' + temp.lowerLimit + '<br>';
			var tempmsg = stock1name+'('+param.code+')进入购买区域. ('+system['lastHedge']+' '+temp.lowerLimit+'/ )';
			// filter chad(chad) condition
			if(!pcmsg.contains('CHAD(us_chad)'))
				sendAlarm([tempmsg,pcmsg],'hedgeAlarm_'+stock1code,param.name);
	    	break;

	    	default:
	    	break;
	    }
	}
}

/*
	Portfolio data load from server cache and format into obj
*/
function formatLoadedCustomAlarm(alarmStr){
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

/*************** ALARM SYSTEMS - TRACKLIST ***************/

/** Key: tracklist, track list, trace,monitor
/** Desc: monitor or track user pre-defined stocks, pairs and hedges

/*
	Load,Initialize,Sending request(L1) tracklist stocks
*/
function trackAlarmMaster(){
	var list = gAlarm['alarmTrackList']['main'];
	var now = getTimestamp();
	if(gAlarmFan>3)
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

/*
	Execute(L3) examining tracklist
*/
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
						trackListDone(param.tid);
			} else if(obj.condition == '<'){
				if(obj.results.currentPrice < obj.priceOrNumber)
					if(sendAlarmFull(param.name+'到达目标价格: '+obj.condition+' '+obj.priceOrNumber+' / 股','trackList_'+tid,param.name,duration,importance,9999))
						trackListDone(param.tid);
			}
		break;

		case 2:
			if(obj.condition == '>'){
				if(obj.results.currentPercent > percent)
					if(sendAlarmFull(param.name+'到达目标价格: '+obj.condition+' '+percent+'%','trackList_'+tid,param.name,duration,importance,9999))
						trackListDone(param.tid);
			} else if(obj.condition == '<'){
				if(obj.results.currentPercent < percent)
					if(sendAlarmFull(param.name+'到达目标价格: '+obj.condition+' '+percent+'%','trackList_'+tid,param.name,duration,importance,9999))
						trackListDone(param.tid);
			}
		break;

		default:
		break;
	}
}

/*
	update(L3) trackList results
*/
function updateTrackListRtmResults(tid, data){
	var list = gAlarm['alarmTrackList']['main'];
	list[tid]['results']['currentPrice'] = data.price;
	list[tid]['results']['currentPercent'] = data.percent;
	if(list[tid].smartPercent != 0){
		// update smart percent
		//if(ckTracklistRtmUpdatePrevious(tid))
	}

}

/*
	remove out-dated user defined track conditions
*/
function cleanTrackList(){
	var list = gAlarm['alarmTrackList']['main'];
	var now = getTimestamp();
	for(var i = 0 ; i < list.length; i ++){
		if(now - parseInt(list[i].timestamp) > list[i].expirationDate)
			list.splice(i,1);
	}

	saveTrackList();
	if(gAlarmFan>3)
		smartLog(' cleaning alarmTrackList complete! ','alarm');
}

/*
	remove from tracklist
*/
function trackListDone(tid){
	gAlarm['alarmTrackList']['main'].splice(tid,1);
	saveTrackList();
}

/*
	remove from tracklist
*/
function formatTracklistPrice(val,type){
	return (type == 1) ?  ('$'+ val) : (val + '%');
}
/*
	get total length of current tracklist
*/
function getTrackListLen(){
	return gAlarm['alarmTrackList']['main'].length;
}

/*
	clean and reinitialize trackList
*/
function resetTrackList(){
    gAlarm['alarmTrackList'] = {};
	gAlarm['alarmTrackList']['main'] = new Array();
	gAlarm['alarmTrackList']['log'] = new Array();
	gAlarm['alarmTrackList']['settings'] = {'alarmType':'1: price, 2:percent',
'smartAlarm':'set a percent that will be triggered above or below current percent,eg. stock currently 3.5%, smartAlarm:-1 means it will trigger at 2.5%'};
	saveTrackList();
}

/*
	save tracklist to server harddrive
*/
function saveTrackList(){
	var data = gAlarm['alarmTrackList'];
	saveObj(data, 'data/AlarmTracklists.txt');
	if(gAlarmFan>3)
		smartLog('tracklist updated, new length is '+gAlarm['alarmTrackList']['main'].length,'alarm');
}


/*************** ALARM SYSTEMS - TRACKLIST ***************/

/** Key: tracklist, track list, trace,monitor
/** Desc: monitor or track user pre-defined stocks, pairs and hedges

/*
	add to marketwatch que
*/
function addtoMarketWatchArr(obj){
	for(var i = 0 ; i < obj.length ; i ++){
		marketWatch.push(obj[i]);
		userMarketWatch.push(obj[i]);
	}
}

/*
	generate DOM Elements needed for marketwatch
*/
function createMarketWatchDivs(obj){
	var div = $('#pf_rtmMaster_append');
	for(var i = 0 ; i < obj.length ; i ++){
		var code = obj[i].replace('^','');
		// sanitate us codes
		if(code.contains('us')){
			code = code.replace('us_','');
			code = code.toUpperCase();
		}
		var add = "&nbsp;&nbsp;&nbsp;<div id='codename_"+code+"'>"+code+'</div>:&nbsp;<div id="'+code+'">获取中</div>&nbsp;';
		if(i % 8 == 7)
			div.append('<br>');
		div.append(add);
	}
}

/*
	add to marketwatch que and add DOM Elements
*/
function addToMarketWatch(code){
	userMarketWatch.push(code);
	marketWatch.push(code);
	code = code.replace('^','');
	var add = "&nbsp;&nbsp;&nbsp;<div id='codename_"+code+"'>"+code+':&nbsp;<div id="'+code+'">获取中</div>&nbsp;';
	$('#pf_rtmMaster_append').append(add);
	//save
	saveMarketWatch();
}

/*
	save marketwatch results
*/
function saveMarketWatch(){
	var data = userMarketWatch;
	saveObj(data, 'data/MarketWatch.txt');
}

/*
	fetch marketwatch data from remote server
*/
function loadMarketWatch(){
	groupFetchStock(marketWatch,'marketWatch');
}

/*
	run marketwatch algorithms(L3) with single stock data from server
*/
function execSingleMarketWatch(){
	var t = gAlarm['realtimeAlarms']['Results']['marketWatch'];
	var code = (t.code).replace('^','');

		if(t.divCode != undefined){
			var div = $('#'+t.divCode);
			var nameDiv = $('#codename_'+t.divCode).html(t.name);
		} else {
			var div = $('#'+code);
			var nameDiv = $('#codename_'+t.code).html(t.name);
		}
		var price = t.price;
		var chg_percent = getStockPriceFormat(t.percent);
		var chg_price = getStockPriceFormat(t.priceIncrement);
		div.html(price + " ( "+chg_price+" / "+chg_percent+"% )");
}

/*
	run marketwatch algorithms(L3) with clustered stock data from server
*/
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

/*************** ALARM SYSTEMS - ALGORITHMS AND EVENT WATCHER ***************/
/** Key: event, ckdata, ckalarms,
/** Desc: condition checkings. See if any data is within conditonal change

/*
	Moving average algorithm that checks the raio of current price to sum of (N)days
	e.g. ratio = p(today) / Sum(P(N)), where Day(N) < today;
*/
function ckRealtimeHistoryDataRatio(id,obj,type,objHistory,numberOfBacktrace){
	var target = objHistory.length - numberOfBacktrace;
	if(target<1){
		if(gAlarmFan>3)
			smartLog('not enough data points for '+obj[id].name+' current points' + target,'alarm');
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

/*
	main function that checks criterias for any stock with historical data
*/
function ckrealtimeHistoryAlarm(){
	var criteria = {};
	criteria['cks'] = 'sudSurge,volIncrease';
	criteria['r'] = ['hs300'];
	for(key in gAlarm['realtimeHistoryAlarms']['Results']){
		_ckrealtimeWithHistory(gAlarm['realtimeHistoryAlarms']['Results'][key],criteria);
	}
}

/*
	[PRIVATE]
	main function that checks criterias for any stock with historical data
*/
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
		// Algorithm check sudden surger in volume
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
				if(gAlarmFan>3)
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

/*
	main function that checks criterias for any stock with ONLY REALTIME, NO HISTORICAL DATA
*/
function ckrealtimeAlarm(){
	var criteria = {};
	criteria['cks'] = 's3,s5,ns3,ns5,slimit,blimit';
	criteria['r'] = ['hs300'];
	for(key in gAlarm['realtimeAlarms']['Results']){
		_ckrealtime(gAlarm['realtimeAlarms']['Results'][key],criteria);
	}
}

/*
	[PRIVATE]
	main function that checks criterias for any stock with ONLY REALTIME, NO HISTORICAL DATA
*/
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

/*************** ALARM SYSTEMS - UTILITY FUNCTIONS ***************/

/*  key: alarm utilities
/*
	short version to send an alarm
*/
function sendAlarm(msg,id,name){
	// 86400 for 1 day
	// 2 for importance level, note that '5110' indicate sending to mobile in realtime
	// 9999 means repeat time, OBSOLETE
	return sendAlarmFull(msg,id,name,86400,2,9999);
}


/*
	sending an alarm to pc and/or moboil device, note the number is fixed for
	Jing's cellphone in the U.S
	importance = '5110' indicate sending to mobile device
*/
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
		// scoll to bottom
		d.append(pcmsg + "<br>");
		d.scrollTop(d.prop("scrollHeight"));

		if(importance == 5110)
			sendTocellphone(phonemsg);

		if(gAlarmFan>2)
			console.log("Alarm:"+id+" sent succesufully. "+ getFullTime());
		// end of alarm sent, return
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

			if(gAlarmFan>2)
				console.log('Alarm: '+ id + " sent on " + getFullTime());

			gAlarm['cooldownList'] = cooldownList;

			//send computer
			var d = $('#alarmsDetails');
			// scoll to bottom
			d.append(pcmsg + "<br>");
			d.scrollTop(d.prop("scrollHeight"));

			if(importance == 5110)
			sendTocellphone(phonemsg);
			// end of alarm, return
			return true;
		}

		if(gAlarmFan>2)
			smartLog("Alarm: ("+getFullTime()+ ") "+ name +" ("+id+") still cooling down, time left:"+ getCoolDownTimeinStr(cooldownList[id])+", repeat: "+cooldownList[id]['repeat'],'alarm');
	}
	// update cooldownlist
	gAlarm['cooldownList'] = cooldownList;
	// return false if nothing gets send
	return false;
}

/*
	[OBSOLETE]
*/
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

/*
	sending message to php script that talks to the mms server
*/
function sendTocellphone(msg){
	var server = 'communicate.php';
	msg = msg.replaceAll(' ','_');
	server =  server + '?m='+msg;
	$.get(server, function(data) {
       	console.log(data);
    });

}
/*
	check if it is offline development mode
*/
function ckOnline(){
	if(offlineDevelopperMode){
		smartLog('Realtime alarms disabled at offlineDevelopperMode','alarm');
		return false;
	}
	return true;
}

/*
	sylelize msg based on importance
*/
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

		case 5110:
		msg = "<span class='AlarmRed2'>"+msg+"</span>";
		break;

		default:
		break;
	}
	return msg;
}

/*
	this function will log alarm based on msg type
*/
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

/*
	[OBSOLETE]
	Function that dumps an alarm group into file
*/
function dumpAlarms(){
	var data = {};
	data.header = 'id, ratioMA5_MA30,ratio5, ratio30';
	var arr = gAlarm['realtimeHistoryAlarms']['ratioResults'];
	for(key in arr){
		data.body = arr[key];
		saveDataObjToServer(data,'stat/'+key+'.txt');
	}
}

/*
	Checks if the stock is in range
*/
function ckStockRange(stock, a,b){
	if(parseFloat(stock.chg_percent) > a &&
		parseFloat(stock.chg_percent) <= b)
		return true;
	return false;
}

/*************** ALARM SYSTEMS - END OF MAIN FUNCTIONS ***************/





/*************** DOM COLOR STYLE FUNCTIONS ***************/

/** Keyword: color, style, dom

/** Desc: functions that return colored html texts

/*************** DOM COLOR STYLE FUNCTIONS ***************/

/*
	return red text
*/
function htmlRed(str){
	return '<span class="graphTitle_0">'+str+'</span>';
}

/*
	return blue text
*/
function htmlblue(str){
	return '<span class="graphTitle_1">'+str+'</span>';
}

/*
	return alarm red text, check css file
*/
function htmlAlarmRed(str,fontsyle){
	if(fontsyle == 'bold')
		return '<span class="AlarmRed isBold">'+str+'</span>';
	else if(fontsyle == 'italic')
		return '<span class="AlarmRed isItalic">'+str+'</span>';
	else
		return '<span class="AlarmRed">'+str+'</span>';
}

/*
	return alarm green text, check css file
*/
function htmlAlarmGreen(str){
	if(fontsyle == 'bold')
		return '<span class="AlarmGreen isBold">'+str+'</span>';
	else if(fontsyle == 'italic')
		return '<span class="AlarmGreen isItalic">'+str+'</span>';
	else
		return '<span class="AlarmGreen">'+str+'</span>';
}

/*************** FILE IO FUNCTIONS ***************/

/** Keyword: file, fileoi, input, output,files

/** Desc: functions that designed to save and load using ajax
with a local php script.

/*************** FILE IO FUNCTIONS ***************/

/*
	save any object to server, the results are serialized
*/
function saveObj(data, filename){
	var str = JSON.stringify(data);
	__SAVE_TO_SERVER(str,filename,true);
}

/*
	save an object with format to .csv file;
	format: data.body = {
			'entry1' : value 1
			'entry2' : value 2
			'entry3' : value 3
			...
			'entryn' : value n
	}
*/
function saveDataObjToServer(data, filename){
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
  // send to server
  __SAVE_TO_SERVER(str,filename);

}

/*
	save any object to server, the results are serialized
*/
function savePairedStatisticResultsToServer(arr,filename){
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
     // send to server
	__SAVE_TO_SERVER(str,"data/Statistics/"+filename+".csv");
}





/*************** CONSOLE FUNCTIONS ***************/

/** Console Function deals with user inputs, execute
commands without gui, and helps to facilitate the productivity

/*************** CONSOLE FUNCTIONS ***************/

/*
	main function to deal with user input in realtime console mode
*/
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
		case 'tracklist':
			if(param.length != 2)
				return returnLog('tracklist require 2 inputs, check -help for details');
			if(param[1].toLowerCase() == 'show'){
				var codes = gAlarm['alarmTrackList']['main'];
				smartLog('Showing trackList Details: ...');
				for(var i = 0 ; i < codes.length; i ++)
				smartLog(codes[i].code + codes[i].condition + formatTracklistPrice(codes[i].priceOrNumber, codes[i].alarmType));
			}

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
			// expire after one year
			param.push(3153600);
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
			smartLog(" -pf stockcode purchasePrice nos");
			smartLog(" -comp stock1 stock2");
      smartLog(" -w weather_type(sunny,rain)");
      smartLog(" -top stock : bring a stock to top");
		break;

    case 'top':
      if(param.length != 2)
        return returnLog('top function require two parameters, "top stock1" -help for details');
        // check for abrieviated case
        if(!param[1].contains(','))
           return returnLog(' top function takes a pair of stocks: eg, 510300,us_chad || 601818,601327');
        var tmp = param[1].split(',');
        if(tmp[1] == undefined || tmp[1] == "")
          tmp[1] = 'us_chad';
        code = formatStockNames(tmp).join(',');

        if(!removetoCustomQue(code))
            return returnLog(" No such pair find as " + code + " in current stack");
        if(addtoCustomQue(code))
           rtmCustomExport();
       //superfast
    break;
    case 'w':
      if(param.length != 2)
        return returnLog('w (weather) function require two parameters, -help for details');
       var weatherType = param[1];
       window.location.href =  ("#"+weatherType);
    break;

		case 'pf':
			if(param.length != 4 && param.length != 3)
				return returnLog("-pf requires 4 or 3 parameters, check -help for details");
			// adding new codes
			if(param.length == 4){
				// getting
				var code = param[1];
				var purchasePrice = parseFloat(param[2]);
				var nos = parseFloat(param[3]);
				// formatting
				code = formatStockName(code);
				var obj = {'code':code,
						   'cost':purchasePrice,
							'nos' : nos};
				addEntryToPortfolio(obj);
			} else if(param.length == 3){
				if(param[1] == '-d'){
					var code = formatStockName(param[2]);
					removeEntryFromPortfolio(code);
				}
			}


		break;

		case 'comp':
			if(param.length != 3)
				return returnLog("to compare two stocks you need at least two input, check help for details");
			updateSkyLab([param[1],param[2]]);
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





/*************** TIME FUNCTIONS ***************/

/*************** These functions will used to deal with time
related issues, format times, and get timestamps*/

/*************** TIME FUNCTIONS ***************/
function secondsToHMS(d) {
d = Number(d);
var h = Math.floor(d / 3600);
var m = Math.floor(d % 3600 / 60);
var s = Math.floor(d % 3600 % 60);
return ((h > 0 ? h + ":" + (m < 10 ? "0" : "") : "") + m + ":" + (s < 10 ? "0" : "") + s); }

/*
	return time format mm/dd/yyyy hh:mm:ss
*/
function getFullTime(){
   return getFullYMDH();
}

/*
	return time format mm/dd/yyyy hh:mm:ss
*/
function getFullYMDH() {
    var date = new Date();
    var hour = date.getHours().toString();;
    hour = (hour[1] ? hour : "0" + hour[0]);
    var minutes = date.getMinutes().toString();
    minutes = (minutes[1] ? minutes : "0" + minutes[0]);
    var sec = date.getSeconds().toString();
    sec = (sec[1] ? sec : "0" + sec[0]);
    var t = (date.getMonth() + 1) + '/' + date.getDate() + '/' + date.getFullYear() + ' ' +
        hour + ':'+minutes+':'+sec;
    return t;
}

/*
	convert mm/dd/yyyy to yyyy-mm-dd
*/
function toChineseYYYYMMDD(date) {
    var date = new Date(date);
    var yyyy = date.getFullYear().toString();
    var mm = (date.getMonth() + 1).toString(); // getMonth() is zero-based
    var dd = date.getDate().toString();
    return yyyy + "-" + (mm[1] ? mm : "0" + mm[0]) + "-" + (dd[1] ? dd : "0" + dd[0]); // padding
}

/*
	convert any to mm/dd/yyyy
*/
function toUnivfiedMMDDYYYY(date) {
    var date = new Date(date);
    var t = (date.getMonth() + 1) + '/' + date.getDate() + '/' + date.getFullYear();
    return t;
}

/*
	get yyyy-mm-dd
*/
function getFullYMD(){
	var date =new Date();
	var yyyy = date.getFullYear().toString();
    var mm = (date.getMonth() + 1).toString(); // getMonth() is zero-based
    var dd = date.getDate().toString();
    return yyyy + (mm[1] ? mm : "0" + mm[0]) + (dd[1] ? dd : "0" + dd[0]); // padding
}

/*
	GET MMMM/DD/YYYY HH:MM in local china time
*/
function getCNFullYMDH(){
    var offset = +16;
    var d = new Date();
    var utc = d.getTime() - (d.getTimezoneOffset() * 60000);
    var nd = new Date(utc + (3600000 * offset));
    var t = (nd.getMonth() + 1) + "/" + nd.getDate() + "/" + nd.getFullYear()+" "+
    nd.getHours() + ":"+nd.getMinutes();
    return t;
}

/*
	get current mm/dd/yyyy in local china time
*/
function getDayInChina() {
    return calcTime('beijing', '+8');
}

/*
	get a date that is one year before in mm/dd/yyyy format
*/
function getDayOneYearAgo() {
    var offset = +16;
    var d = new Date();
    var utc = d.getTime() - (d.getTimezoneOffset() * 60000);
    var nd = new Date(utc + (3600000 * offset));
    nd.setFullYear(nd.getFullYear() - 1);
    return ((nd.getMonth() + 1) + "/" + nd.getDate() + "/" + nd.getFullYear());
}

/*
	get current date in the month
*/
function getCurrentDayNumber(){
	return new Date().getDate();
}

/*
	get current Unix Timestamp
*/
function getTimestamp(){
	var t = new Date().getTime();
	t= Math.round(t/1000);
	return t;
}

/*
	[OBSOLETE]
	get current MM/DD/YYYY in local china time
*/
function getDHMInChina() {
    var d = new Date();
    var utc = d.getTime() - (d.getTimezoneOffset() * 60000);
    var nd = new Date(utc + (3600000 * 16));
    return ((nd.getMonth() + 1) + "/" + nd.getDate() + "/" + nd.getFullYear() + " " + nd.getHours() + ":" + nd.getMinutes());
}

/*
	getCurrentTimeInChina()
*/
function getHourChina(){
	var d = new Date();
    var utc = d.getTime() - (d.getTimezoneOffset() * 60000);
    var nd = new Date(utc + (3600000 * 16));
    return nd.getHours();
}

/*
	getCurrentTimeInChina()
*/
function getMinutesChina(){
	var d = new Date();
    var utc = d.getTime() - (d.getTimezoneOffset() * 60000);
    var nd = new Date(utc + (3600000 * 16));
    return nd.getMinutes();
}

/*
	get current day number in the week
	0 = sunday
	1 = monday
*/
function isWeekendChina(){
	var d = getDayInWeek();
	return (d != 0 && d!= 1) ? false : true;
}

/*
	get current day number in the week
	0 = sunday
	1 = monday
*/
function isWeekend(){
	var d = new Date();
	var day = d.getDay();
	return (day != 0 && day != 1) ? false : true;
}

/*
	get current day number in the week
	0 = sunday
	1 = monday
*/
function getDayInWeek(){
	var d = new Date();
    var utc = d.getTime() - (d.getTimezoneOffset() * 60000);
    var nd = new Date(utc + (3600000 * 16));
    return nd.getDay();
}

/*
	PRIVATE
	get mm/dd/yyyy in local china time
*/
function calcTime(city, offset) {
    var d = new Date();
    var utc = d.getTime() - (d.getTimezoneOffset() * 60000);
    var nd = new Date(utc + (3600000 * offset));
    return ((nd.getMonth() + 1) + "/" + nd.getDate() + "/" + nd.getFullYear());
}

/*
	get number of days between target day(timestamp, MM-DD-YYYY,MM/DD/YYYY) and current day;
*/
function getTimeDifferenceInDays(targetTime){
	var date1 = new Date(targetTime);
	var date2 = new Date();
	var timeDiff = Math.abs(date2.getTime() - date1.getTime());
	var diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24));
	return diffDays;
}



/*********** Portfolio ******/
function showpflistDetail(id){
	$('#'+id).toggle("fast");
}
