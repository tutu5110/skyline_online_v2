<?php
/*

CN Stock Server

this server will fetch and cache similar results


*/



$GLOBALS['DATA_FOLDER'] = 'data/StockCache/';

$GLOBALS['DATA_FUND_FOLDER'] = 'data/CNFundCache/';

$GLOBALS['UPDATE_PERIOD_DATE'] = 3;

$GLOBALS['UPDATE_PERIOD'] = 86400 * $GLOBALS['UPDATE_PERIOD_DATE'];

$GLOBALS['INDEXFUTURE_SERVER'] = 'http://stock2.finance.sina.com.cn/futures/api/json.php/CffexFuturesService.getCffexFuturesDailyKLine?symbol=';

$GLOBALS['CN_FUND_SERVER'] = 'http://stockjs.finance.qq.com/fundUnitNavAll/data/year_all/#fundcode#.js';

$GLOBALS['USSTOCK_HISTORY_SERVER'] = 'https://finance-yql.media.yahoo.com/v7/finance/chart/#SYMBOL#?period2=#end#&period1=#begin#&interval=1d&indicators=quote&includeTimestamps=true';

$GLOBALS['CNSTOCK_HISTORY_SERVER'] = 'http://web.ifzq.gtimg.cn/appstock/app/fqkline/get?_var=kline_dayqfq2013&param=#SYMBOL#,day,#begin#,#end#,640,qfq';

$sym = isset($_GET['sym']) ? $_GET['sym'] : '';

$GLOBALS['SHOW'] = isset($_GET['show']) ? $_GET['show'] : 0;

$period = isset($_GET['p']) ? $_GET['p'] : 'y';

$offline = isset($_GET['offline']) ? $_GET['offline'] : '0';

$begin = isset($_GET['begin']) ? $_GET['begin']: '';

$end = isset($_GET['end']) ? $_GET['end']: '';

$param = isset($_GET['param']) ? $_GET['param'] : NULL;
// system check
// check if the symbol is empty
if($sym == ''){
	echo 'NULL RESULT, NO SYMBOL';
	exit();
}


if($param){
	$r = explode(',', $param);
	$begin = $r[1];
	$end = $r[2];
}


//load raw
$rawData = loadRawData($sym);
if($GLOBALS['SHOW']){
	logMe('Raw data from Cache: '. strlen($rawData));
}
//parse
$_file = explode('#cachVar#',$rawData);

$file = array();
if(isset($_file[1]) && is_array($_file)){
	$file['rawData'] = $_file[0];
	$file['lastestDay'] = $_file[1];
}

$fileLen = count($file);

// if no local or local.last day is not china day today
if($fileLen==0) {
	$rawData = fetchStock($sym,$begin,$end);
	//validate data
	logMe('rawdata fetch successfull, data length '.strlen($rawData));
	if(validateData($rawData,$sym)){
			logMe('Validating Successful');
		if(SaveStockData2CSV($sym,$rawData)){
			if($GLOBALS['SHOW']){
				logMe('saving to '.$sym.' is compelte!');
			}
		echo $rawData;
		exit();
		}
	}
} else {
// there is local file, ` for update
	if(!isUptoDate(time(), $file['lastestDay']) && $offline == 0){
		$file['rawData'] = fetchStock($sym,$begin,$end);
		if(validateData($file['rawData'],$sym)){
			if(SaveStockData2CSV($sym,$file['rawData'])){
				if($GLOBALS['SHOW']){
					logMe('saving to '.$sym.' is compelte!');
				}
				echo $file['rawData'];
			}
		}
	} else{
		if(isEmpty($file['rawData'])){
			if($GLOBALS['SHOW']){
				logMe('Error With Cache for '.$sym.' due to empty cache, removing ....');
			}

			if(unlink(getFilePath($sym))){
				if($GLOBALS['SHOW']){
				logMe($sym.' Successfully Deleted ');
				}	
			}
		}
		echo $file['rawData'];
	}
}

function validateData($raw,$sym){
	if(strpos($sym,'us') !== false){
		//check us stock conditions for empty
		return validateUSStockData($raw);
	} else if(strpos($sym,'sz') !== false ||strpos($sym,'sh') !== false){
		// check cnstock conditions for empty
		return validateCNStockData($raw);
	} else if(strpos($sym,'jj') !== false){
		return validateCNFund($raw);
	} else if(strpos($sym, 'F_') !== false){
		return validateCNFuture($raw);
	}else {
		if($GLOBALS['SHOW']){
			logMe('unreconize symbol type for '.$sym);
			return false;
		}
	}
	return false;
}

function validateCNFund($raw){
	if($raw == false)
		return false;
	return true;
}
function validateUSStockData($raw){
	$t = parseJson($raw);
	$sym = $t['chart']['result'][0]['meta']['symbol'];
	if($sym == NULL){
		if($GLOBALS['SHOW'])
			echo 'No such data file on remote server, check your symbol!';
		return false;
	}
	return true;
}

function parseJson($json){
	
    return json_decode($json, TRUE);
}

function validateCNStockData($raw){
	// if return data contains a full YYYY-MM-DD format, then consider the data is valid
	if(preg_match('/\b\d{4}-\d{2}-\d{2}\b/',$raw))
		return true;
	return false;
 }

function logMe($message){
	if($GLOBALS['SHOW'])
		echo $message.'<br>';
}

function fetchStock($sym, $begin = '', $end = ''){

    $url = getServerAdd($sym,$begin,$end);
 	
 	if($GLOBALS['SHOW'])
 		logMe('fetching with url: '.$url);

	$data = @file_get_contents($url);

	return $data;
}

function getServerAdd($sym, $begin = '',  $end = ''){
	if(strpos($sym,'IF') !== false || strpos($sym,'IH') !== false || strpos($sym,'IC') !== false)
		// chinese futures
		return ($GLOBALS['INDEXFUTURE_SERVER'].getIndexFutureSymbol($sym));
	else if(strpos($sym,'jj') !== false){
		// chinese fund
		$sym = str_replace('jj', '', $sym);
		$server = $GLOBALS['CN_FUND_SERVER'];
		$server = str_replace('#fundcode#',$sym,$server);
		return $server;
	} else if(strpos($sym,'us') !== false){
		//us stock
		$sym = str_replace('us_', '', $sym);
		$server = $GLOBALS['USSTOCK_HISTORY_SERVER'];
		$server = str_replace('#SYMBOL#', $sym, $server);
		$server = str_replace('#end#', $end, $server);
		$server = str_replace('#begin#', $begin, $server);
		return $server;
	} else{
		//chinese stock
		$server = $GLOBALS['CNSTOCK_HISTORY_SERVER'];
		$server = str_replace('#SYMBOL#', $sym, $server);
		$server = str_replace('#end#', $end, $server);
		$server = str_replace('#begin#', $begin, $server);
		return $server;
	}

	return '-1';
}


function loadRawData($s){
	$filename = $s;

	switch ($s) {
		case 'IF':
			$filename =  $GLOBALS['DATA_FOLDER'].'ZJIFMI.csv';
			break;
		case 'IH':
			$filename = $GLOBALS['DATA_FOLDER'].'ZJIHMI.csv';
			break;
		default:
			// check if it is fund
			if(strpos($s, 'jj') !== false)
			$filename = $GLOBALS['DATA_FUND_FOLDER'].'F_'.$s.'.rtu';
			else
		   	$filename = $GLOBALS['DATA_FOLDER'].'F_'.$s.'.rtu';
			# code...
			break;
	}
	$file = @file_get_contents($filename);

	return $file;
}

function isEmpty($data){
	if(strlen($data) == 0 || $data == '')
		return true;
	return false;
}

function getFilePath($symbol){
	$filename = '';
	switch ($symbol) {
		case 'IF':
			# code...
			$filename = $GLOBALS['DATA_FOLDER'].'ZJIFMI.csv';
			break;
		case 'IH':
		$filename = $GLOBALS['DATA_FOLDER'].'ZJIHMI.csv';
			break;
		default:
			if(strpos($symbol, 'jj') !== false)
			$filename = $GLOBALS['DATA_FUND_FOLDER'].'F_'.$symbol.'.rtu';
			else
		   	$filename = $GLOBALS['DATA_FOLDER'].'F_'.$symbol.'.rtu';
			
			# code...
			break;
	}
	return $filename;
}

function SaveStockData2CSV($symbol, $rawData){
	$filename = '';
	$filename = getFilePath($symbol);
	//add timestamp
	$rawData.='#cachVar#'.date('m/d/Y');
	$t =  file_put_contents($filename, $rawData);
	chmod($filename, 0777);
	return $t;
}

function flatten($dataArr){
	if(!is_array($dataArr))
		return $dataArr;
	$len = count($jsonArr);
	$str = '';
	for($i = 0 ; $i< $len; $i ++)
		$str .= implode($jsonArr[$i], ',')."\n";
	return $str;
}

function isUptoDate($today, $pastDay){
	if($today - strtotime($pastDay) > $GLOBALS['UPDATE_PERIOD'])
		return false;
	return true; 
}

?>