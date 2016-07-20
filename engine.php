<?php
	/*
	$initialPriceHS300 = 4.909;
	$initialPrice = 39.3;
	$symbol = 'CHAD';

	
	// get chad
	$result = getYahoo($symbol);
	
	$closePrice = floatval($result['list']['resources'][0]['resource']['fields']['price']);
	$closePercent = ($closePrice - $initialPrice) / $initialPrice * 100;



	//get hs300
	$symbol = 'sh510300';
	$_content = file_get_contents('http://qt.gtimg.cn/q=s_'.$symbol);
	$content = explode('~', $_content);
	$closePriceHS300 = $content[3];

	//GET shanghai index
	$symbol = 'sh000001';
	$_content = file_get_contents('http://qt.gtimg.cn/q=s_'.$symbol);
	$content = explode('~', $_content);
	$shIndex = $content[3];
	$shVal = $content[4];
	$shPercent = $content[5];

	$closePercentHS300 = ($closePriceHS300 -$initialPriceHS300)  / $initialPriceHS300 * 100;

	$finalPercent = $closePercent + $closePercentHS300;
	
		// get gold
	$symbol = 'Goldprice';
	$goldPrice = getGoldPrice();
	$goldPercent = 0;

		// get uwti
	$symbol = 'uwti';
	$result = getYahoo($symbol);
	$uwtiPrice = floatval($result['list']['resources'][0]['resource']['fields']['price']);
	$uwtiPercent = floatval($result['list']['resources'][0]['resource']['fields']['chg_percent']);


		// get xle
	$symbol = 'XLE';
	$result = getYahoo($symbol);
	
	$xlePrice = floatval($result['list']['resources'][0]['resource']['fields']['price']);
	$xlePercent = floatval($result['list']['resources'][0]['resource']['fields']['chg_percent']);

	
	echo toFixed($shIndex).'~'.$shVal.'~'.$shPercent.'~'.number_format($closePrice,2,'.','').'~'.number_format($finalPercent, 2, '.','').'%'.
		'~'.$uwtiPrice.'~'.toFixed($uwtiPercent).'~'.toFixed($goldPrice).'~'.toFixed($goldPercent).'~'.toFixed($xlePrice).'~'.toFixed($xlePercent);


    function getGoldPrice(){
    	$raw = file_get_contents('http://api2.goldprice.org/Service.svc/GetRaw/2');
    	$goldprice = explode(',',$raw);
    	$goldprice = $goldprice[0];
    	$begin  =   strpos($goldprice,'!')+1;
    	$end = strlen($goldprice);
    	return floatval(substr($goldprice, $begin, $end));
    }

	*/
	
	/*
	$initialPriceHS300 = 4.909;
	$initialPrice = 39.3;
	$symbol = 'CHAD';

	
	// get chad
	$result = getYahoo($symbol);
	
	$closePrice = floatval($result['list']['resources'][0]['resource']['fields']['price']);
	$closePercent = ($closePrice - $initialPrice) / $initialPrice * 100;



	//get hs300
	$symbol = 'sh510300';
	$_content = file_get_contents('http://qt.gtimg.cn/q=s_'.$symbol);
	$content = explode('~', $_content);
	$closePriceHS300 = $content[3];

	//GET shanghai index
	$symbol = 'sh000001';
	$_content = file_get_contents('http://qt.gtimg.cn/q=s_'.$symbol);
	$content = explode('~', $_content);
	$shIndex = $content[3];
	$shVal = $content[4];
	$shPercent = $content[5];

	$closePercentHS300 = ($closePriceHS300 -$initialPriceHS300)  / $initialPriceHS300 * 100;

	$finalPercent = $closePercent + $closePercentHS300;
	
		// get gold
	$symbol = 'Goldprice';
	$goldPrice = getGoldPrice();
	$goldPercent = 0;

		// get uwti
	$symbol = 'uwti';
	$result = getYahoo($symbol);
	$uwtiPrice = floatval($result['list']['resources'][0]['resource']['fields']['price']);
	$uwtiPercent = floatval($result['list']['resources'][0]['resource']['fields']['chg_percent']);


		// get xle
	$symbol = 'XLE';
	$result = getYahoo($symbol);
	
	$xlePrice = floatval($result['list']['resources'][0]['resource']['fields']['price']);
	$xlePercent = floatval($result['list']['resources'][0]['resource']['fields']['chg_percent']);

	
	echo toFixed($shIndex).'~'.$shVal.'~'.$shPercent.'~'.number_format($closePrice,2,'.','').'~'.number_format($finalPercent, 2, '.','').'%'.
		'~'.$uwtiPrice.'~'.toFixed($uwtiPercent).'~'.toFixed($goldPrice).'~'.toFixed($goldPercent).'~'.toFixed($xlePrice).'~'.toFixed($xlePercent);


    function getGoldPrice(){
    	$raw = file_get_contents('http://api2.goldprice.org/Service.svc/GetRaw/2');
    	$goldprice = explode(',',$raw);
    	$goldprice = $goldprice[0];
    	$begin  =   strpos($goldprice,'!')+1;
    	$end = strlen($goldprice);
    	return floatval(substr($goldprice, $begin, $end));
    }
	 你好

	Dummy Data
	echo 'v_s_sh601818="1~光大银行~601818~3.82~-0.02~-0.52~552356~21139~~1783.14";';

	exit();

	*/

header("Content-Type: text/html; charset=utf-8");

$cadd =  urldecode($_GET['cadd']);
//$cadd = 'https://query1.finance.yahoo.com/v7/finance/chart/CHAD?range=1d&interval=1d&indicators=quote';

$offline = isset($_GET['offline']) ? $_GET['offline'] : 0;

if($offline != 0){
	echo '';
	exit();
}

$result = file_get_contents($cadd);

// eliminate case for japanese stock
if(floatval(strpos($cadd,'co.jp')) == 0)
	$result = iconv("gbk","utf-8",$result);
else {
	// japan stocks
	
	
	$code = get_string_between($cadd,'code=','.T');

	$name = get_string_between($result,'symbol">','</th>');
	$name = get_string_between($name,'h1>','<');
	// extract price
	$price = get_string_between($result,'class="stoksPrice">','<');
	//	extract price and percent
	$change = get_string_between($result,'<td class="change">','</td>');
	// extrack price and percentage
	$change = explode('">',$change);
	// get price and percentage change
	if(!isset($change[2])){
		echo 'Wrong Number of results returned, please check the server availability';
		exit();
	}

	$change = explode('（',$change[2]);
	// get pricedd
	$pricediff = floatval($change[0]);

	$percentdiff = floatval($change[1]);
	// sanitation check
	$result = $name.','.$code.','.$price.','.$pricediff.','.$percentdiff;

}
echo $result;
exit();

function file_get_contents_curl($url)
{
    $ch=curl_init();
    curl_setopt($ch,CURLOPT_HEADER,0);
    curl_setopt($ch,CURLOPT_RETURNTRANSFER,1);
    curl_setopt($ch,CURLOPT_URL,$url);
    curl_setopt($ch,CURLOPT_FOLLOWLOCATION,1);
    $data=curl_exec($ch);
    curl_close($ch);
    return $data;
}

function getYahoo($symbol){

	$json = file_get_contents('https://query1.finance.yahoo.com/v7/finance/chart/CHAD?range=1d&interval=1d&indicators=quote');

	$jsonIterator = new RecursiveIteratorIterator(
    new RecursiveArrayIterator(json_decode($json, TRUE)),
    RecursiveIteratorIterator::SELF_FIRST);

	$result = array();
	foreach ($jsonIterator as $key => $val) {
	    if(is_array($val)) {
	       // echo "$key:\n";
	        $result[$key] = $val;
	    } else {
	       // echo "$key => $val\n";
	        $result[$key] = $val;
	    }
	}
	return $result;
}

function toFixed($num){
	//if($num > 0 )
		//return '+'.number_format($num,2,'.',','); 
	return number_format($num,2,'.',',');
}

function get_string_between($string, $start, $end){
	$string = ' ' . $string;
	$ini = strpos($string, $start);
	if ($ini == 0) return '';
	$ini += strlen($start);
	$len = strpos($string, $end, $ini) - $ini;
	return substr($string, $ini, $len);
}


?>
