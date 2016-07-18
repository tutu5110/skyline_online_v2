<?php

$sysStaticHTMLFolder = "http://$_SERVER[HTTP_HOST]".'/Skyline_online_v2/data/SysFrameHtml/';

$sysListFolder = "http://$_SERVER[HTTP_HOST]".'/Skyline_online_v2/data/SystemLists/';

$sysAlarmFolder = "http://$_SERVER[HTTP_HOST]".'/Skyline_online_v2/data/';

$result['pf_sum'] = file_get_contents($sysStaticHTMLFolder.'pf_sum.html');

$result['pf_template_list'] = file_get_contents($sysStaticHTMLFolder.'pf_template.html');

$result['rtm'] = file_get_contents($sysStaticHTMLFolder.'rtmbody.html');

$result['skylab'] = file_get_contents($sysStaticHTMLFolder.'skylab_body.html');

$result['rtm_statistics_template'] = file_get_contents($sysStaticHTMLFolder.'rtm_statistics_template.html');

$result['portfolio'] = file_get_contents($sysListFolder.'portfolio.txt');

$result['cusalarm'] = file_get_contents($sysAlarmFolder.'cusalarm.txt');

$result['alarmTrackList'] = file_get_contents($sysAlarmFolder.'AlarmTrackLists.txt');

$result['marketWatch'] = file_get_contents($sysAlarmFolder.'marketWatch.txt');

$AlarmMarketLists = file_get_contents($sysAlarmFolder.'AlarmMarketLists.txt');

$AlarmMarketLists = explode("\n", $AlarmMarketLists);

$len = count($AlarmMarketLists);
if($len == 0){
	echo json_encode('unable to load AlarmMarketLists.txt, check the format please');
	exit(0);
}
$tempresult = array();

for($i = 0 ;  $i < $len; $i++){
	$t = explode('::', $AlarmMarketLists[$i]);
	$tempresult[$t[0]] = [];
	$tempresult[$t[0]]['id'] = $t[0];
	$tempresult[$t[0]]['cooldown'] = $t[1];
	$tempresult[$t[0]]['codes'] = $t[2];
}

$result['realtimeAlarms'] = $tempresult;


echo json_encode($result);

?>