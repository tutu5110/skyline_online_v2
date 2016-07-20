/*
	Core function that seperates a series of codes (in comma format) into different market of codes
*/
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
	get current timestamp
*/

function getTimestamp(){
	var t = new Date().getTime();
	t= Math.round(t/1000);
	return t;
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