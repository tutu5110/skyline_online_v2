/*************** UTILITY FUNCTIONS  ***************/

/** Keyword: UTILITY, log, 
/** Desc: general data extraction, logging, 

/*
  this function logs for realtime
*/
function log(msg){
  
  //console
  console.log(msg);

  var d = $('#realtimeConsole #content');
  d.append(msg+"<br>");
  // scoll to bottom
  d.scrollTop(d.prop("scrollHeight"));

}

/*
  merges two obj
*/
function returnLog(msg, outputdiv){
  outputdiv = outputdiv || 'alarm';
  smartLog(msg, outputdiv);
  return false;
}

/*
  merges two obj
*/
function mergeOBJ(obj1,obj2){
  for(key in obj2)
    obj1[key] = obj2[key];
  return obj1;
}

/*
  check if it is number
*/
function isNumeric(n) {
  return !isNaN(parseFloat(n)) && isFinite(n);
}

/*
  [OBSOLETE]
  Convert to json for sending to remote server
*/
function packageSaveArr(obj){
  var t = JSON.stringify(obj);
  return t;
}

/*
  [OBSOLETE]
  clears an obj, set it to empty string
*/
function clearme(obj){
  obj.value = "";
}

/*
  [OBSOLETE]
  get subset
*/
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

/*
  get a copy instead of reference of an obj
*/
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

/*
  Array of Stock
  format stock names for transfering between remote server and local variables
*/
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

/*
  Single stock
  format stock name for transfering between remote server and local variables
*/
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

/*
  get stock prices
*/
function getStockPriceFormat(num){
  num = parseFloat(num).toFixed(1);
  if(num < 0)
    return "<font class='AlarmGreen'>"+num+"</font>";
  else if(num > 0)
    return "<font class='AlarmRed'>"+num+"</font>";
  else 
    return num;
}

function catagorize(codes){
	var obj = {};
	// seperate 
	if(codes.constructor !== Array)
		var _codes = codes.split(",");
	else
		var _codes = codes;
	for(var i = 0 ; i < _codes.length; i ++){
		var t = getCodeType(_codes[i]);
		if(obj[t] == undefined)
			obj[t] = new Array();
		obj[t].push(formatStockName(_codes[i],true));
	}
	return obj;
}

/*
	get type of code, for instance 600050 return shanghai
*/

function getCodeType(code){
	if(!code.contains('us_') && !code.contains('sh') && 
      !code.contains('sz') && !code.contains('jj') && !code.contains('jp')){
        if(code.toLowerCase().beginWith('0') ||
           code.toLowerCase().beginWith('3') ||
           code.toLowerCase().beginWith('9') ||
           code.toLowerCase().beginWith('51') ||
           code.toLowerCase().beginWith('1'))
           return 'CN_STOCK';
        else if(code.toLowerCase().beginWith('6'))
           return 'CN_STOCK';
        else if(code.toLowerCase().contains('if')||
            code.toLowerCase().contains('ih') ||
            code.toLowerCase().contains('f_') ||
            code.toLowerCase().contains('ic'))
            return 'CN_FUTURE';
        else if(code.toLowerCase().beginWith('50'))
            return 'CN_FUND';
        else if(!isFinite(code))
            return 'US_YAHOO';
        else 
            return 'UNDEFINED';
    } else {
      if(code.contains('us_'))
      		return 'US_YAHOO';
      else if(code.contains('sh') || code.contains('sz'))
      		return 'CN_STOCK';
      else if(code.contains('jj'))
      		return 'CN_FUND';
      else if(code.contains('f_'))
      		return 'CN_FUTURE';
      else if(code.contains('jp'))
      		return 'JP_STOCK';
	}
    return false;
}

function getName(code){
	//code = formatStockName(code);
}

function __SAVE_TO_SERVER(str, filename,isJSONArr,consoleUpdateMode){
	consoleUpdateMode = consoleUpdateMode || '';
  isJSONArr = isJSONArr || false;
	$.post( "save.php", { raw: str, filename: filename, isJSONArr: isJSONArr }).done(function( data ) {
        //console.log( "Save Complete!:  " + filename );
        smartLog(data,consoleUpdateMode);

  });
}

/*
	system console languages
*/

function Language(ready, rmessage){
	if(!ready)
		return;
	return rmessage;
}

function ave(num, base){
	if(base == 0)
		return false;
	return num/base;
}