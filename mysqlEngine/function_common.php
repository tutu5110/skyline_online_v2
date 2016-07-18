<?php

function getim() {
		global $_SGLOBAL;
		$args = func_num_args();

		if (!$args) {
				$uid = ($_SGLOBAL['supe_uid']);
		} else {
				$uid = func_get_arg(0);
		}

		if ($uid) {
                //getim_cache($uid);
                $im = array();
                $query = $_SGLOBAL['db'] -> query('SELECT network_name,network_id,uid FROM '.tname('spacefield').' WHERE uid = '.$uid);
				$value = $_SGLOBAL['db'] -> fetch_array($query);
                $im['network_name'] = formatim($value['network_name']);
                $im['network_id'] = formatim($value['network_id']);
                return $im;
		} else {
				return false;
		}
}

function isIE()
{
    if (isset($_SERVER['HTTP_USER_AGENT']) && 
    (strpos($_SERVER['HTTP_USER_AGENT'], 'MSIE') !== false))
        return true;
    else
        return false;
}

/*
function getim_cache($uid) {
        include_once(S_ROOT.'./source/function_tcache.php');
        $im = array();
        $im = memget('im',false);

}
*/
/**
 * 强制更新某个带指标的array
 * 目前只能导入array一层厚度的
 * 需要加强这个函数
 */

function updatearray($original, $new) {
		$temp = array_values($new);
		$first_value = $temp[0];
		foreach ($original as $key => $value) {
				if ($original[$key] == $first_value) {
						unset($original[$key]);
				}
		}

		return array_merge($original, $new);
}

/**
 * **更新内存中的个人空间缓存*
 */
function muprofile($uid) {
		// 更新缓存
		if (empty($uid))$uid = $_SGLOBAL['supe_uid'];
		include_once(S_ROOT . 'source/function_tcache.php');
		memdelete('sp_profile_' . $uid);
}

/**
 * **更新内存中的好友缓存*
 */

function mufriend($uid) {
		include_once(S_ROOT . 'source/function_tcache.php');
		memdelete('sp_friends_' . $uid);
}
// purify network ids
function formatim($str) {
		return explode(',', substr($str, 1, strlen($str)-2));
}
// debug
function alert($mes) {
		echo '<script language= \'javascript\'>alert(\'' . var_dump($mes) . '\');</script>';
		exit();
}

function safe($mes) {
		// 去锟斤拷锟斤拷
		$mes = str_replace(',', '锟斤拷', $mes);
		// 去锟斤拷锟斤拷锟街凤拷
		return htmlentities($mes, ENT_NOQUOTES, 'UTF-8');
}
// 锟斤拷锟斤拷锟较达拷图片l锟斤拷
function pic_get($filepath, $thumb, $remote, $return_thumb = 1) {
		global $_SCONFIG, $_SC;

		if (empty($filepath)) {
				$url = 'image/nopic.gif';
		} else {
				$url = $filepath;
				if ($return_thumb && $thumb) $url .= '.thumb.jpg';
				if ($remote) {
						$url = $_SCONFIG['ftpurl'] . $url;
				} else {
						$url = $_SC['attachurl'] . $url;
				}
		}

		return $url;
}
// SQL ADDSLASHES
function saddslashes($string) {
		if (is_array($string)) {
				foreach($string as $key => $val) {
						$string[$key] = saddslashes($val);
				}
		} else {
				$string = addslashes($string);
		}
		return $string;
}
// 取锟斤拷HTML锟斤拷锟斤拷
function shtmlspecialchars($string) {
		if (is_array($string)) {
				foreach($string as $key => $val) {
						$string[$key] = shtmlspecialchars($val);
				}
		} else {
				$string = preg_replace('/&amp;((#(\d{3,5}|x[a-fA-F0-9]{4})|[a-zA-Z][a-z0-9]{2,5});)/', '&\\1',
						str_replace(array('&', '"', '<', '>'), array('&amp;', '&quot;', '&lt;', '&gt;'), $string));
		}
		return $string;
}
// 锟街凤拷锟斤拷芗锟斤拷锟?
function authcode($string, $operation = 'DECODE', $key = '', $expiry = 0) {
		$ckey_length = 4; // 锟斤拷锟斤拷锟皆匡拷锟斤拷锟?取值 0-32;
		// 锟斤拷锟斤拷锟斤拷锟斤拷锟皆匡拷锟斤拷锟斤拷锟斤拷锟斤拷锟斤拷锟斤拷锟斤拷魏喂锟斤拷桑锟斤拷锟斤拷锟斤拷锟皆拷暮锟斤拷锟皆匡拷锟饺拷锟酵拷锟斤拷锟斤拷芙锟斤拷也锟斤拷每锟轿诧拷同锟斤拷锟斤拷锟斤拷平锟斤拷讯取锟?
		// 取值越锟斤拷锟斤拷锟侥变动锟斤拷锟斤拷越锟斤拷锟斤拷锟侥变化 = 16 锟斤拷 $ckey_length 锟轿凤拷
		// 锟斤拷锟斤拷值为 0 时锟斤拷锟津不诧拷锟斤拷锟斤拷锟斤拷锟皆?
		$key = md5($key ? $key : UC_KEY);
		$keya = md5(substr($key, 0, 16));
		$keyb = md5(substr($key, 16, 16));
		$keyc = $ckey_length ? ($operation == 'DECODE' ? substr($string, 0, $ckey_length): substr(md5(microtime()), - $ckey_length)) : '';

		$cryptkey = $keya . md5($keya . $keyc);
		$key_length = strlen($cryptkey);

		$string = $operation == 'DECODE' ? base64_decode(substr($string, $ckey_length)) : sprintf('%010d', $expiry ? $expiry + time() : 0) . substr(md5($string . $keyb), 0, 16) . $string;
		$string_length = strlen($string);

		$result = '';
		$box = range(0, 255);

		$rndkey = array();
		for($i = 0; $i <= 255; $i++) {
				$rndkey[$i] = ord($cryptkey[$i % $key_length]);
		}

		for($j = $i = 0; $i < 256; $i++) {
				$j = ($j + $box[$i] + $rndkey[$i]) % 256;
				$tmp = $box[$i];
				$box[$i] = $box[$j];
				$box[$j] = $tmp;
		}

		for($a = $j = $i = 0; $i < $string_length; $i++) {
				$a = ($a + 1) % 256;
				$j = ($j + $box[$a]) % 256;
				$tmp = $box[$a];
				$box[$a] = $box[$j];
				$box[$j] = $tmp;
				$result .= chr(ord($string[$i]) ^ ($box[($box[$a] + $box[$j]) % 256]));
		}

		if ($operation == 'DECODE') {
				if ((substr($result, 0, 10) == 0 || substr($result, 0, 10) - time() > 0) && substr($result, 10, 16) == substr(md5(substr($result, 26) . $keyb), 0, 16)) {
						return substr($result, 26);
				} else {
						return '';
				}
		} else {
				return $keyc . str_replace('=', '', base64_encode($result));
		}
}
// 锟斤拷锟絚ookie
function clearcookie() {
		global $_SGLOBAL;

		ssetcookie('auth', '', -86400 * 365);
		$_SGLOBAL['supe_uid'] = 0;
		$_SGLOBAL['supe_username'] = '';
		$_SGLOBAL['member'] = array();
}
// cookie锟斤拷锟斤拷
function ssetcookie($var, $value, $life = 0) {
		global $_SGLOBAL, $_SC, $_SERVER;
		setcookie($_SC['cookiepre'] . $var, $value, $life?($_SGLOBAL['timestamp'] + $life):0, $_SC['cookiepath'], $_SC['cookiedomain'], $_SERVER['SERVER_PORT'] == 443?1:0);
}
// 锟斤拷菘锟絣锟斤拷
function dbconnect() {
		global $_SGLOBAL, $_SC;
		include_once(S_ROOT . 'class_mysql.php');
		if (empty($_SGLOBAL['db'])) {
				$_SGLOBAL['db'] = new dbstuff;
				$_SGLOBAL['db'] -> charset = $_SC['dbcharset'];
				$_SGLOBAL['db'] -> connect($_SC['dbhost'], $_SC['dbuser'], $_SC['dbpw'], $_SC['dbname'], $_SC['pconnect']);
		}
	
	
}
// 锟斤拷取锟斤拷锟斤拷IP
function getonlineip($format = 0) {
		global $_SGLOBAL;

		if (empty($_SGLOBAL['onlineip'])) {
				if (getenv('HTTP_CLIENT_IP') && strcasecmp(getenv('HTTP_CLIENT_IP'), 'unknown')) {
						$onlineip = getenv('HTTP_CLIENT_IP');
				} elseif (getenv('HTTP_X_FORWARDED_FOR') && strcasecmp(getenv('HTTP_X_FORWARDED_FOR'), 'unknown')) {
						$onlineip = getenv('HTTP_X_FORWARDED_FOR');
				} elseif (getenv('REMOTE_ADDR') && strcasecmp(getenv('REMOTE_ADDR'), 'unknown')) {
						$onlineip = getenv('REMOTE_ADDR');
				} elseif (isset($_SERVER['REMOTE_ADDR']) && $_SERVER['REMOTE_ADDR'] && strcasecmp($_SERVER['REMOTE_ADDR'], 'unknown')) {
						$onlineip = $_SERVER['REMOTE_ADDR'];
				}
				preg_match("/[\d\.]{7,15}/", $onlineip, $onlineipmatches);
				$_SGLOBAL['onlineip'] = $onlineipmatches[0] ? $onlineipmatches[0] : 'unknown';
		}
		if ($format) {
				$ips = explode('.', $_SGLOBAL['onlineip']);
				for($i = 0;$i < 3;$i++) {
						$ips[$i] = intval($ips[$i]);
				}
				return sprintf('%03d%03d%03d', $ips[0], $ips[1], $ips[2]);
		} else {
				return $_SGLOBAL['onlineip'];
		}
}
// 锟叫断碉拷前锟矫伙拷锟斤拷录状态
function checkauth() {
		global $_SGLOBAL, $_SC, $_SCONFIG, $_SCOOKIE, $_SN;

		if ($_SCOOKIE['auth']) {
				@list($password, $uid) = explode("\t", authcode($_SCOOKIE['auth'], 'DECODE'));
				$_SGLOBAL['supe_uid'] = intval($uid);
				if ($_SGLOBAL['supe_uid']) {
						$query = $_SGLOBAL['db'] -> query("SELECT * FROM " . tname('session') . " WHERE uid='$_SGLOBAL[supe_uid]' AND password='$password'");
						if ($member = $_SGLOBAL['db'] -> fetch_array($query)) {
								$_SGLOBAL['supe_username'] = addslashes($member['username']);
								$_SGLOBAL['session'] = $member;
						} else {
								$query = $_SGLOBAL['db'] -> query("SELECT * FROM " . tname('member') . " WHERE uid='$_SGLOBAL[supe_uid]' AND password='$password'");
								if ($member = $_SGLOBAL['db'] -> fetch_array($query)) {
										$_SGLOBAL['supe_username'] = addslashes($member['username']);
										include_once(S_ROOT . './source/function_space.php');
										insertsession(array('uid' => $_SGLOBAL['supe_uid'], 'username' => $_SGLOBAL['supe_username'], 'password' => $password)); //锟斤拷录
								} else {
										$_SGLOBAL['supe_uid'] = 0;
								}
						}
				}
		}
		if (empty($_SGLOBAL['supe_uid'])) {
				clearcookie();
		} else {
				$_SGLOBAL['username'] = $member['username'];
		}
}
// 锟斤拷取锟矫伙拷app锟叫憋拷
function getuserapp() {
		global $_SGLOBAL, $_SCONFIG;

		$_SGLOBAL['my_userapp'] = $_SGLOBAL['my_menu'] = array();
		$_SGLOBAL['my_menu_more'] = 0;

		if ($_SGLOBAL['supe_uid'] && $_SCONFIG['my_status']) {
				$space = getspace($_SGLOBAL['supe_uid']);
				$showcount = 0;
				$query = $_SGLOBAL['db'] -> query("SELECT * FROM " . tname('userapp') . " WHERE uid='$_SGLOBAL[supe_uid]' ORDER BY displayorder DESC", 'SILENT');
				while ($value = $_SGLOBAL['db'] -> fetch_array($query)) {
						$_SGLOBAL['my_userapp'][$value['appid']] = $value;
						if ($value['allowsidenav'] && !isset($_SGLOBAL['userapp'][$value['appid']])) {
								if ($space['menunum'] < 5) $space['menunum'] = 10;
								if ($space['menunum'] > 100 || $showcount < $space['menunum']) {
										$_SGLOBAL['my_menu'][] = $value;
										$showcount++;
								} else {
										$_SGLOBAL['my_menu_more'] = 1;
								}
						}
				}
		}
}
// 锟斤拷取锟斤拷锟斤拷锟斤拷
function tname($name) {
		
		global $_SC;
		return $_SC['tablepre'] . $name;
		
}
// 锟皆伙拷锟斤拷
function showmessage($msgkey, $url_forward = '', $second = 1, $values = array(), $toobout = true) {
		global $_SGLOBAL, $_SC, $_SCONFIG, $_TPL, $space, $_SN;

		obclean();
		// 去锟斤拷锟斤拷
		$_SGLOBAL['ad'] = array();

		if (empty($_SGLOBAL['inajax']) && $url_forward && empty($second)) {
				header("HTTP/1.1 301 Moved Permanently");
				header("Location: $url_forward");
		} else {
				include_once(S_ROOT . './language/lang_showmessage.php');
				if (isset($_SGLOBAL['msglang'][$msgkey])) {
						$message = lang_replace($_SGLOBAL['msglang'][$msgkey], $values);
				} else {
						$message = $msgkey;
				}
				if ($_SGLOBAL['inajax']) {
						if ($url_forward) {
								$message = "<a href=\"$url_forward\">$message</a><ajaxok>";
						}
						if ($_GET['popupmenu_box']) {
								$message = "<h1>&nbsp;</h1><a href=\"javascript:;\" onclick=\"hideMenu();\" class=\"float_del\">X</a><div class=\"popupmenu_inner\">$message</div>";
						}
						echo $message;
						if ($toobout) ob_out();
				} else {
						if ($url_forward) {
								$message = "<a href=\"$url_forward\">$message</a><script>setTimeout(\"window.location.href ='$url_forward';\", " . ($second * 1000) . ");</script>";
						}
						include template('showmessage');
				}
		}
		exit();
}
// 锟叫讹拷锟结交锟角凤拷锟斤拷确
function submitcheck($var) {
		if (!empty($_POST[$var]) && $_SERVER['REQUEST_METHOD'] == 'POST') {
				if ((empty($_SERVER['HTTP_REFERER']) || preg_replace("/https?:\/\/([^\:\/]+).*/i", "\\1", $_SERVER['HTTP_REFERER']) == preg_replace("/([^\:]+).*/", "\\1", $_SERVER['HTTP_HOST'])) && $_POST['formhash'] == formhash()) {
						return true;
				} else {
						showmessage('submit_invalid');
				}
		} else {
				return false;
		}
}
// 锟斤拷锟斤拷锟斤拷
function inserttable($tablename, $insertsqlarr, $returnid = 0, $replace = false, $silent = 0) {
		global $_SGLOBAL, $_SC;
		
		$insertkeysql = $insertvaluesql = $comma = '';
		foreach ($insertsqlarr as $insert_key => $insert_value) {
				$insertkeysql .= $comma . '`' . $insert_key . '`';
				$insertvaluesql .= $comma . '\'' . $insert_value . '\'';
				$comma = ', ';
		}
		$method = $replace?'REPLACE':'INSERT';

		$_SGLOBAL['db'] -> query($method . ' INTO ' . tname($tablename) . ' (' . $insertkeysql . ') VALUES (' . $insertvaluesql . ')', $silent?'SILENT':'');

		if ($returnid && !$replace) {
				return $_SGLOBAL['db'] -> insert_id();
		}
}
// 锟斤拷锟斤拷锟斤拷锟?
function updatetable($tablename, $setsqlarr, $wheresqlarr, $silent = 0) {
		global $_SGLOBAL;

		$setsql = $comma = '';
		foreach ($setsqlarr as $set_key => $set_value) {
				$setsql .= $comma . '`' . $set_key . '`' . '=\'' . $set_value . '\'';
				$comma = ', ';
		}
		$where = $comma = '';
		if (empty($wheresqlarr)) {
				$where = '1';
		} elseif (is_array($wheresqlarr)) {
				foreach ($wheresqlarr as $key => $value) {
						$where .= $comma . '`' . $key . '`' . '=\'' . $value . '\'';
						$comma = ' AND ';
				}
		} else {
				$where = $wheresqlarr;
		}
		$_SGLOBAL['db'] -> query('UPDATE ' . tname($tablename) . ' SET ' . $setsql . ' WHERE ' . $where, $silent?'SILENT':'');
}
// 锟斤拷取锟矫伙拷锟秸硷拷锟斤拷息
function getspace($key, $indextype = 'uid', $auto_open = 1) {
		global $_SGLOBAL, $_SCONFIG, $_SN;

		include_once('source/function_tcache.php');
		$myarr = array();

		$var = "space_{$key}_{$indextype}";
		if (empty($_SGLOBAL[$var])) {
				// 获得var
				if (intval($key)) {
						// 如果是int
						$myarr = memget('sp_profile_' . $key, false);
						if ($myarr) {
								// 如果有,退回
								$_SN[$myarr['uid']] = ($_SCONFIG['realname'] && $myarr['name'] && $myarr['namestatus'])?$myarr['name']:$myarr['username'];
								$myarr['self'] = ($myarr['uid'] == $_SGLOBAL['supe_uid'])?1:0;

								if ($myarr['self']) {
										$_SGLOBAL['member'] = $myarr;
								}

								$_SGLOBAL[$var] = $myarr;

								return $_SGLOBAL[$var];
						}
				}

				$space = array();
				$query = $_SGLOBAL['db'] -> query("SELECT sf.*, s.* FROM " . tname('space') . " s LEFT JOIN " . tname('spacefield') . " sf ON sf.uid=s.uid WHERE s.{$indextype}='$key'");
				if (!$space = $_SGLOBAL['db'] -> fetch_array($query)) {
						$space = array();
						if ($indextype == 'uid' && $auto_open) {
								// 自动开通空间
								include_once(S_ROOT . './uc_client/client.php');
								if ($user = uc_get_user($key, 1)) {
										include_once(S_ROOT . './source/function_space.php');
										$space = space_open($user[0], addslashes($user[1]), 0, addslashes($user[2]));
								}
						}
				}
				if ($space) {
						$_SN[$space['uid']] = ($_SCONFIG['realname'] && $space['name'] && $space['namestatus'])?$space['name']:$space['username'];
						$space['self'] = ($space['uid'] == $_SGLOBAL['supe_uid'])?1:0;
						// 好友缓存
						$space['friends'] = array();
						if (empty($space['friend'])) {
								if ($space['friendnum'] > 0) {
										$fstr = $fmod = '';
										$query = $_SGLOBAL['db'] -> query("SELECT fuid FROM " . tname('friend') . " WHERE uid='$space[uid]' AND status='1'");
										while ($value = $_SGLOBAL['db'] -> fetch_array($query)) {
												$space['friends'][] = $value['fuid'];
												$fstr .= $fmod . $value['fuid'];
												$fmod = ',';
										}
										$space['friend'] = $fstr;
								}
						} else {
								$space['friends'] = explode(',', $space['friend']);
						}

						$space['username'] = addslashes($space['username']);
						$space['name'] = addslashes($space['name']);
						$space['privacy'] = empty($space['privacy'])?(empty($_SCONFIG['privacy'])?array():$_SCONFIG['privacy']):unserialize($space['privacy']);
						if ($space['self']) {
								$_SGLOBAL['member'] = $space;
						}
				}
				$_SGLOBAL[$var] = $space;

				if (intval($key)) {
						memsave('sp_profile_' . $key, $space, false, 29);
				}
		}
		return $_SGLOBAL[$var];
}
// 锟斤拷取锟斤拷前锟矫伙拷锟斤拷息
function getmember() {
		global $_SGLOBAL, $space;

		if (empty($_SGLOBAL['member']) && $_SGLOBAL['supe_uid']) {
				if ($space['uid'] == $_SGLOBAL['supe_uid']) {
						$_SGLOBAL['member'] = $space;
				} else {
						$_SGLOBAL['member'] = getspace($_SGLOBAL['supe_uid']);
				}
		}
}
// 锟斤拷锟斤拷锟剿?
function ckprivacy($type, $feedmode = 0) {
		global $_SGLOBAL, $space;

		$var = "ckprivacy_{$type}_{$feedmode}";
		if (isset($_SGLOBAL[$var])) {
				return $_SGLOBAL[$var];
		}
		$result = false;
		if ($feedmode) {
				if (!empty($space['privacy']['feed'][$type])) {
						$result = true;
				}
		} elseif ($space['self']) {
				// 锟皆硷拷
				$result = true;
		} else {
				if (empty($space['privacy']['view'][$type])) {
						$result = true;
				}
				if (!$result && $space['privacy']['view'][$type] == 1) {
						// 锟角凤拷锟斤拷锟?
						if (!isset($space['isfriend'])) {
								$space['isfriend'] = $space['self'];
								if ($space['friends'] && in_array($_SGLOBAL['supe_uid'], $space['friends'])) {
										$space['isfriend'] = 1; //锟角猴拷锟斤拷
								}
						}
						if ($space['isfriend']) {
								$result = true;
						}
				}
		}
		$_SGLOBAL[$var] = $result; //锟斤拷前页锟芥缓锟斤拷
		return $result;
}
// 锟斤拷锟紸PP锟斤拷私
function app_ckprivacy($privacy) {
		global $_SGLOBAL, $space;

		$var = "app_ckprivacy_{$privacy}";
		if (isset($_SGLOBAL[$var])) {
				return $_SGLOBAL[$var];
		}
		$result = false;
		switch ($privacy) {
				case 0:// 锟斤拷锟斤拷
						$result = true;
						break;
				case 1:// 锟斤拷锟斤拷
						if (!isset($space['isfriend'])) {
								$space['isfriend'] = $space['self'];
								if ($space['friends'] && in_array($_SGLOBAL['supe_uid'], $space['friends'])) {
										$space['isfriend'] = 1; //锟角猴拷锟斤拷
								}
						}
						if ($space['isfriend']) {
								$result = true;
						}
						break;
				case 2:// 锟斤拷锟街猴拷锟斤拷
						break;
				case 3:// 锟皆硷拷
						if ($space['self']) {
								$result = true;
						}
						break;
				case 4:// 锟斤拷锟斤拷
						break;
				case 5:// 没锟斤拷锟斤拷
						break;
				default:
						$result = true;
						break;
		}
		$_SGLOBAL[$var] = $result;
		return $result;
}
// 锟斤拷取锟矫伙拷锟斤拷
function getgroupid($credit, $gid = 0) {
		global $_SGLOBAL;

		if (!@include_once(S_ROOT . './data/data_usergroup.php')) {
				include_once(S_ROOT . './source/function_cache.php');
				usergroup_cache();
		}

		$needfind = false;
		if ($gid && !empty($_SGLOBAL['usergroup'][$gid])) {
				$group = $_SGLOBAL['usergroup'][$gid];
				if (empty($group['system'])) {
						if ($group['credithigher'] < $credit || $group['creditlower'] > $credit) {
								$needfind = true;
						}
				}
		} else {
				$needfind = true;
		}
		if ($needfind) {
				$query = $_SGLOBAL['db'] -> query("SELECT gid FROM " . tname('usergroup') . " WHERE creditlower<='$credit' AND system='0' ORDER BY creditlower DESC LIMIT 1");
				$gid = $_SGLOBAL['db'] -> result($query, 0);
		}
		return $gid;
}
// 锟斤拷锟饺拷锟?
function checkperm($permtype) {
		global $_SGLOBAL, $space;

		@include_once(S_ROOT . './data/data_usergroup.php');
		// 锟斤拷锟斤拷锟?
		if (empty($_SGLOBAL['supe_uid'])) {
				return '';
		} else {
				if (empty($_SGLOBAL['member'])) {
						// 锟斤拷取锟斤拷前锟斤拷
						getmember();
				}
				$gid = getgroupid($_SGLOBAL['member']['credit'], $_SGLOBAL['member']['groupid']);
				if ($gid != $_SGLOBAL['member']['groupid']) {
						// 锟斤拷要锟斤拷
						updatetable('space', array('groupid' => $gid), array('uid' => $_SGLOBAL['supe_uid']));
				}
		}
		if ($permtype == 'admin') {
				$permtype = 'manageconfig';
		}
		return empty($_SGLOBAL['usergroup'][$gid][$permtype])?'':$_SGLOBAL['usergroup'][$gid][$permtype];
}
// 写锟斤拷锟斤拷锟斤拷志
function runlog($file, $log, $halt = 0) {
		global $_SGLOBAL, $_SERVER;

		$nowurl = $_SERVER['REQUEST_URI']?$_SERVER['REQUEST_URI']:($_SERVER['PHP_SELF']?$_SERVER['PHP_SELF']:$_SERVER['SCRIPT_NAME']);
		$log = sgmdate('Y-m-d H:i:s', $_SGLOBAL['timestamp']) . "\t$type\t" . getonlineip() . "\t$_SGLOBAL[supe_uid]\t{$nowurl}\t" . str_replace(array("\r", "\n"), array(' ', ' '), trim($log)) . "\n";
		$yearmonth = sgmdate('Ym', $_SGLOBAL['timestamp']);
		$logdir = './data/log/';
		if (!is_dir($logdir)) mkdir($logdir, 0777);
		$logfile = $logdir . $yearmonth . '_' . $file . '.php';
		if (@filesize($logfile) > 2048000) {
				$dir = opendir($logdir);
				$length = strlen($file);
				$maxid = $id = 0;
				while ($entry = readdir($dir)) {
						if (strexists($entry, $yearmonth . '_' . $file)) {
								$id = intval(substr($entry, $length + 8, -4));
								$id > $maxid && $maxid = $id;
						}
				}
				closedir($dir);
				$logfilebak = $logdir . $yearmonth . '_' . $file . '_' . ($maxid + 1) . '.php';
				@rename($logfile, $logfilebak);
		}
		if ($fp = @fopen($logfile, 'a')) {
				@flock($fp, 2);
				fwrite($fp, "<?PHP exit;?>\t" . str_replace(array('<?', '?>', "\r", "\n"), '', $log) . "\n");
				fclose($fp);
		}
		if ($halt) exit();
}
// 锟斤拷取锟街凤拷
function getstr($string, $length, $in_slashes = 0, $out_slashes = 0, $censor = 0, $bbcode = 0, $html = 0) {
		global $_SC, $_SGLOBAL;

		$string = trim($string);

		if ($in_slashes) {
				// 锟斤拷锟斤拷锟斤拷址锟斤拷锟絪lashes
				$string = sstripslashes($string);
		}
		if ($html < 0) {
				// 去锟斤拷html锟斤拷签
				$string = preg_replace("/(\<[^\<]*\>|\r|\n|\s|\[.+?\])/is", ' ', $string);
				$string = shtmlspecialchars($string);
		} elseif ($html == 0) {
				// 转锟斤拷html锟斤拷签
				$string = shtmlspecialchars($string);
		}
		if ($censor) {
				// 锟斤拷锟斤拷锟絨锟?
				@include_once(S_ROOT . './data/data_censor.php');
				if ($_SGLOBAL['censor']['banned'] && preg_match($_SGLOBAL['censor']['banned'], $string)) {
						showmessage('information_contains_the_shielding_text');
				} else {
						$string = empty($_SGLOBAL['censor']['filter']) ? $string :
						@preg_replace($_SGLOBAL['censor']['filter']['find'], $_SGLOBAL['censor']['filter']['replace'], $string);
				}
		}
		if ($length && strlen($string) > $length) {
				// 锟截讹拷锟街凤拷
				$wordscut = '';
				if (strtolower($_SC['charset']) == 'utf-8') {
						// utf8锟斤拷锟斤拷
						$n = 0;
						$tn = 0;
						$noc = 0;
						while ($n < strlen($string)) {
								$t = ord($string[$n]);
								if ($t == 9 || $t == 10 || (32 <= $t && $t <= 126)) {
										$tn = 1;
										$n++;
										$noc++;
								} elseif (194 <= $t && $t <= 223) {
										$tn = 2;
										$n += 2;
										$noc += 2;
								} elseif (224 <= $t && $t < 239) {
										$tn = 3;
										$n += 3;
										$noc += 2;
								} elseif (240 <= $t && $t <= 247) {
										$tn = 4;
										$n += 4;
										$noc += 2;
								} elseif (248 <= $t && $t <= 251) {
										$tn = 5;
										$n += 5;
										$noc += 2;
								} elseif ($t == 252 || $t == 253) {
										$tn = 6;
										$n += 6;
										$noc += 2;
								} else {
										$n++;
								}
								if ($noc >= $length) {
										break;
								}
						}
						if ($noc > $length) {
								$n -= $tn;
						}
						$wordscut = substr($string, 0, $n);
				} else {
						for($i = 0; $i < $length - 1; $i++) {
								if (ord($string[$i]) > 127) {
										$wordscut .= $string[$i] . $string[$i + 1];
										$i++;
								} else {
										$wordscut .= $string[$i];
								}
						}
				}
				$string = $wordscut;
		}
		if ($bbcode) {
				include_once(S_ROOT . './source/function_bbcode.php');
				$string = bbcode($string, $bbcode);
		}
		if ($out_slashes) {
				$string = saddslashes($string);
		}
		return trim($string);
}
// 时锟斤拷锟绞斤拷锟?
function sgmdate($dateformat, $timestamp = '', $format = 0) {
		global $_SCONFIG, $_SGLOBAL;
		if (empty($timestamp)) {
				$timestamp = $_SGLOBAL['timestamp'];
		}
		$result = '';
		if ($format) {
				$time = $_SGLOBAL['timestamp'] - $timestamp;
				if ($time > 24 * 3600) {
						$result = gmdate($dateformat, $timestamp + $_SCONFIG['timeoffset'] * 3600);
				} elseif ($time > 3600) {
						$result = intval($time / 3600) . lang('hour') . lang('before');
				} elseif ($time > 60) {
						$result = intval($time / 60) . lang('minute') . lang('before');
				} elseif ($time > 0) {
						$result = $time . lang('second') . lang('before');
				} else {
						$result = lang('now');
				}
		} else {
				$result = gmdate($dateformat, $timestamp + $_SCONFIG['timeoffset'] * 3600);
		}
		return $result;
}
// 锟街凤拷时锟戒化
function sstrtotime($string) {
		global $_SGLOBAL, $_SCONFIG;
		$time = '';
		if ($string) {
				$time = strtotime($string);
				if (sgmdate('H:i') != date('H:i')) {
						$time = $time - $_SCONFIG['timeoffset'] * 3600;
				}
		}
		return $time;
}
// 锟斤拷页
function ajax_multi($num, $perpage, $curpage, $mpurl) {
		global $_SCONFIG;
		$page = 5;
		$multipage = '';
		$mpurl .= strpos($mpurl, '?') ? '&' : '?';
		$realpages = 1;
		if ($num > $perpage) {
				$offset = 2;
				$realpages = @ceil($num / $perpage);
				$pages = $_SCONFIG['maxpage'] && $_SCONFIG['maxpage'] < $realpages ? $_SCONFIG['maxpage'] : $realpages;
				if ($page > $pages) {
						$from = 1;
						$to = $pages;
				} else {
						$from = $curpage - $offset;
						$to = $from + $page - 1;
						if ($from < 1) {
								$to = $curpage + 1 - $from;
								$from = 1;
								if ($to - $from < $page) {
										$to = $page;
								}
						} elseif ($to > $pages) {
								$from = $pages - $page + 1;
								$to = $pages;
						}
				}
				$multipage = ($curpage - $offset > 1 && $pages > $page ? '<a href="" onclick="update(\'' . $mpurl . 'page=1\');return false" class="first">1 ...</a>' : '') .
				($curpage > 1 ? '<a href="" onclick="update(\'' . $mpurl . 'page=' . ($curpage - 1) . '\');return false" class="prev">&lsaquo;&lsaquo;</a>' : '');
				for($i = $from; $i <= $to; $i++) {
						$multipage .= $i == $curpage ? '<strong>' . $i . '</strong>' :
						'<a href="" onclick="update(\'' . $mpurl . 'page=' . $i . '\');return false">' . $i . '</a>';
				}
				$multipage .= ($curpage < $pages ? '<a href="" onclick="update(\'' . $mpurl . 'page=' . ($curpage + 1) . '\');return false" class="next">&rsaquo;&rsaquo;</a>' : '') .
				($to < $pages ? '<a href="" onclick="update(\'' . $mpurl . 'page=' . $pages . '\');return false" class="last">... ' . $realpages . '</a>' : '');
				$multipage = $multipage ? ('<em>&nbsp;' . $num . '&nbsp;</em>' . $multipage):'';
		}
		$maxpage = $realpages;
		return $multipage;
}

function multi($num, $perpage, $curpage, $mpurl) {
		global $_SCONFIG;
		$page = 5;
		$multipage = '';
		$mpurl .= strpos($mpurl, '?') ? '&' : '?';
		$realpages = 1;
		if ($num > $perpage) {
				$offset = 2;
				$realpages = @ceil($num / $perpage);
				$pages = $_SCONFIG['maxpage'] && $_SCONFIG['maxpage'] < $realpages ? $_SCONFIG['maxpage'] : $realpages;
				if ($page > $pages) {
						$from = 1;
						$to = $pages;
				} else {
						$from = $curpage - $offset;
						$to = $from + $page - 1;
						if ($from < 1) {
								$to = $curpage + 1 - $from;
								$from = 1;
								if ($to - $from < $page) {
										$to = $page;
								}
						} elseif ($to > $pages) {
								$from = $pages - $page + 1;
								$to = $pages;
						}
				}
				$multipage = ($curpage - $offset > 1 && $pages > $page ? '<a href="' . $mpurl . 'page=1" class="first">1 ...</a>' : '') .
				($curpage > 1 ? '<a href="' . $mpurl . 'page=' . ($curpage - 1) . '" class="prev">&lsaquo;&lsaquo;</a>' : '');
				for($i = $from; $i <= $to; $i++) {
						$multipage .= $i == $curpage ? '<strong>' . $i . '</strong>' :
						'<a href="' . $mpurl . 'page=' . $i . '">' . $i . '</a>';
				}
				$multipage .= ($curpage < $pages ? '<a href="' . $mpurl . 'page=' . ($curpage + 1) . '" class="next">&rsaquo;&rsaquo;</a>' : '') .
				($to < $pages ? '<a href="' . $mpurl . 'page=' . $pages . '" class="last">... ' . $realpages . '</a>' : '');
				$multipage = $multipage ? ('<em>&nbsp;' . $num . '&nbsp;</em>' . $multipage):'';
		}
		$maxpage = $realpages;
		return $multipage;
}
// ob
function obclean() {
		global $_SC;

		ob_end_clean();
		if ($_SC['gzipcompress'] && function_exists('ob_gzhandler')) {
				ob_start('ob_gzhandler');
		} else {
				ob_start();
		}
}
// 模锟斤拷锟斤拷锟?
function template($name) {
		global $_SCONFIG, $_SGLOBAL;

		if (strexists($name, '/')) {
				$tpl = $name;
		} else {
				$tpl = "template/$_SCONFIG[template]/$name";
		}
		$objfile = S_ROOT . './data/tpl_cache/' . str_replace('/', '_', $tpl) . '.php';
		// if(!file_exists($objfile)) {
		include_once(S_ROOT . './source/function_template.php');
		parse_template($tpl);
		// }
		return $objfile;
}
// 锟斤拷模锟斤拷锟斤拷录锟斤拷
function subtplcheck($subfiles, $mktime, $tpl) {
		global $_SC, $_SCONFIG;

		if ($_SC['tplrefresh'] && ($_SC['tplrefresh'] == 1 || mt_rand(1, $_SC['tplrefresh']) == 1)) {
				$subfiles = explode('|', $subfiles);
				foreach ($subfiles as $subfile) {
						$tplfile = S_ROOT . './' . $subfile . '.htm';
						if (!file_exists($tplfile)) {
								$tplfile = str_replace('/' . $_SCONFIG['template'] . '/', '/default/', $tplfile);
						}
						@$submktime = filemtime($tplfile);
						if ($submktime > $mktime) {
								include_once(S_ROOT . './source/function_template.php');
								parse_template($tpl);
								break;
						}
				}
		}
}
// 模锟斤拷
function block($param) {
		global $_SBLOCK;

		include_once(S_ROOT . './source/function_block.php');
		block_batch($param);
}
// 锟斤拷取锟斤拷目
function getcount($tablename, $wherearr, $get = 'COUNT(*)') {
		global $_SGLOBAL;
		if (empty($wherearr)) {
				$wheresql = '1';
		} else {
				$wheresql = $mod = '';
				foreach ($wherearr as $key => $value) {
						$wheresql .= $mod . "`$key`='$value'";
						$mod = ' AND ';
				}
		}
		return $_SGLOBAL['db'] -> result($_SGLOBAL['db'] -> query("SELECT $get FROM " . tname($tablename) . " WHERE $wheresql"), 0);
}
// 锟斤拷锟斤拷锟斤拷锟?
function ob_out() {
		global $_SGLOBAL, $_SCONFIG, $_SC;

		$content = ob_get_contents();

		$preg_searchs = $preg_replaces = $str_searchs = $str_replaces = array();

		if ($_SCONFIG['allowrewrite']) {
				$preg_searchs[] = "/\<a href\=\"space\.php\?(uid|do)+\=([a-z0-9\=\&]+?)\"/ie";
				$preg_searchs[] = "/\<a href\=\"space.php\"/i";
				$preg_searchs[] = "/\<a href\=\"network\.php\?ac\=([a-z0-9\=\&]+?)\"/ie";
				$preg_searchs[] = "/\<a href\=\"network.php\"/i";

				$preg_replaces[] = 'rewrite_url(\'space-\',\'\\2\')';
				$preg_replaces[] = '<a href="space.html"';
				$preg_replaces[] = 'rewrite_url(\'network-\',\'\\1\')';
				$preg_replaces[] = '<a href="network.html"';
		} elseif ($_SCONFIG['mtagrewrite']) {
				$preg_searchs[] = "/\<a href\=\"space\.php\?(uid|do)+\=([a-z0-9\=\&]*?(mtag|thread|magwrite|time_activities)[a-z0-9\=\&]*?)\"/ie";
				$preg_searchs[] = "/\<a href\=\"network\.php\?ac\=([a-z0-9\=\&]*?mtag[a-z0-9\=\&]*?)\"/ie";
				$preg_replaces[] = 'rewrite_url(\'space-\',\'\\2\')';
				$preg_replaces[] = 'rewrite_url(\'network-\',\'\\1\')';

				$preg_searchs[] = "/\<a href\=\"fgame\.php\?ac\=([a-z0-9\=\&]+?)\"/ie";
				$preg_searchs[] = "/\<a href\=\"fgame.php\"/i";
				$preg_replaces[] = 'rewrite_url(\'fgame-\',\'\\1\')';
				$preg_replaces[] = '<a href="fgame.html"';
		}

		if ($_SCONFIG['linkguide']) {
				$preg_searchs[] = "/\<a href\=\"http\:\/\/(.+?)\"/ie";
				$preg_replaces[] = 'iframe_url(\'\\1\')';
		}

		if ($_SGLOBAL['inajax']) {
				$preg_searchs[] = "/([\x01-\x09\x0b-\x0c\x0e-\x1f])+/";
				$preg_replaces[] = ' ';

				$str_searchs[] = ']]>';
				$str_replaces[] = ']]&gt;';
		}

		if ($preg_searchs) {
				$content = preg_replace($preg_searchs, $preg_replaces, $content);
		}
		if ($str_searchs) {
				$content = trim(str_replace($str_searchs, $str_replaces, $content));
		}

		obclean();
		if ($_SGLOBAL['inajax']) {
				xml_out($content);
		} else {
				if ($_SCONFIG['headercharset']) {
						@header('Content-Type: text/html; charset=' . $_SC['charset']);
				}
				echo $content;
				if (D_BUG) {
						@include_once(S_ROOT . './source/inc_debug.php');
				}
		}
}

function xml_out($content) {
		global $_SC;
		@header("Expires: -1");
		@header("Cache-Control: no-store, private, post-check=0, pre-check=0, max-age=0", false);
		@header("Pragma: no-cache");
		@header("Content-type: application/xml; charset=$_SC[charset]");
		echo '<' . "?xml version=\"1.0\" encoding=\"$_SC[charset]\"?>\n";
		echo "<root><![CDATA[" . trim($content) . "]]></root>";
		exit();
}
// rewritet锟斤拷
function rewrite_url($pre, $para) {
		$para = str_replace(array('&', '='), array('-', '-'), $para);
		return '<a href="' . $pre . $para . '.html"';
}
// 锟斤拷t
function iframe_url($url) {
		$url = rawurlencode($url);
		return "<a href=\"link.php?url=http://$url\"";
}
// 锟斤拷锟斤拷锟斤拷锟斤拷丶锟斤拷锟?
function stripsearchkey($string) {
		$string = trim($string);
		$string = str_replace('*', '%', addcslashes($string, '%_'));
		$string = str_replace('_', '\_', $string);
		return $string;
}
// 锟角凤拷锟絨味锟斤拷锟斤拷锟斤拷锟?
function isholddomain($domain) {
		global $_SCONFIG;

		$domain = strtolower($domain);

		if (preg_match("/^[^a-z]/i", $domain)) return true;
		$holdmainarr = empty($_SCONFIG['holddomain'])?array('www'):explode('|', $_SCONFIG['holddomain']);
		$ishold = false;
		foreach ($holdmainarr as $value) {
				if (strpos($value, '*') === false) {
						if (strtolower($value) == $domain) {
								$ishold = true;
								break;
						}
				} else {
						$value = str_replace('*', '', $value);
						if (@preg_match("/$value/i", $domain)) {
								$ishold = true;
								break;
						}
				}
		}
		return $ishold;
}
// l锟斤拷锟街凤拷
function simplode($ids) {
		return "'" . implode("','", $ids) . "'";
}
// 锟斤拷示锟斤拷檀锟斤拷锟绞憋拷锟?
function debuginfo() {
		global $_SGLOBAL, $_SC, $_SCONFIG;

		if (empty($_SCONFIG['debuginfo'])) {
				$info = '';
		} else {
				$mtime = explode(' ', microtime());
				$totaltime = number_format(($mtime[1] + $mtime[0] - $_SGLOBAL['supe_starttime']), 6);
				$info = 'Processed in ' . $totaltime . ' second(s), ' . $_SGLOBAL['db'] -> querynum . ' queries' .
				($_SC['gzipcompress'] ? ', Gzip enabled' : null);
		}

		return $info;
}
// 锟斤拷式锟斤拷锟斤拷小锟斤拷锟斤拷
function formatsize($size) {
		$prec = 3;
		$size = round(abs($size));
		$units = array(0 => " B ", 1 => " KB", 2 => " MB", 3 => " GB", 4 => " TB");
		if ($size == 0) return str_repeat(" ", $prec) . "0$units[0]";
		$unit = min(4, floor(log($size) / log(2) / 10));
		$size = $size * pow(2, -10 * $unit);
		$digi = $prec - 1 - floor(log($size) / log(10));
		$size = round($size * pow(10, $digi)) * pow(10, - $digi);
		return $size . $units[$unit];
}
// 锟斤拷取锟侥硷拷锟斤拷锟斤拷
function sreadfile($filename) {
		$content = '';
		if (function_exists('file_get_contents')) {
				@$content = file_get_contents($filename);
		} else {
				if (@$fp = fopen($filename, 'r')) {
						@$content = fread($fp, filesize($filename));
						@fclose($fp);
				}
		}
		return $content;
}
// 写锟斤拷锟侥硷拷
function swritefile($filename, $writetext, $openmod = 'w') {
		if (@$fp = fopen($filename, $openmod)) {
				flock($fp, 2);
				fwrite($fp, $writetext);
				fclose($fp);
				return true;
		} else {
				runlog('error', "File: $filename write error.");
				return false;
		}
}
// 锟斤拷锟斤拷锟斤拷锟斤拷址锟?
function random($length, $numeric = 0) {
		PHP_VERSION < '4.2.0' ? mt_srand((double)microtime() * 1000000) : mt_srand();
		$seed = base_convert(md5(print_r($_SERVER, 1) . microtime()), 16, $numeric ? 10 : 35);
		$seed = $numeric ? (str_replace('0', '', $seed) . '012340567890') : ($seed . 'zZ' . strtoupper($seed));
		$hash = '';
		$max = strlen($seed) - 1;
		for($i = 0; $i < $length; $i++) {
				$hash .= $seed[mt_rand(0, $max)];
		}
		return $hash;
}
// 锟叫讹拷锟街凤拷锟角凤拷锟斤拷锟?
function strexists($haystack, $needle) {
		return !(strpos($haystack, $needle) === false);
}
// 锟斤拷取锟斤拷锟?
function data_get($var, $isarray = 0) {
		global $_SGLOBAL;

		$query = $_SGLOBAL['db'] -> query("SELECT * FROM " . tname('data') . " WHERE var='$var' LIMIT 1");
		if ($value = $_SGLOBAL['db'] -> fetch_array($query)) {
				return $isarray?$value:$value['datavalue'];
		} else {
				return '';
		}
}
// 锟斤拷锟斤拷锟斤拷锟?
function data_set($var, $datavalue, $clean = 0) {
		global $_SGLOBAL;

		if ($clean) {
				$_SGLOBAL['db'] -> query("DELETE FROM " . tname('data') . " WHERE var='$var'");
		} else {
				if (is_array($datavalue)) $datavalue = serialize(sstripslashes($datavalue));
				$_SGLOBAL['db'] -> query("REPLACE INTO " . tname('data') . " (var, datavalue, dateline) VALUES ('$var', '" . addslashes($datavalue) . "', '$_SGLOBAL[timestamp]')");
		}
}
// 锟斤拷锟秸撅拷锟斤拷欠锟截憋拷
function checkclose() {
		global $_SGLOBAL, $_SCONFIG;
		// 站锟斤拷乇锟?
		if ($_SCONFIG['close'] && !ckfounder($_SGLOBAL['supe_uid']) && !checkperm('closeignore')) {
				if (empty($_SCONFIG['closereason'])) {
						showmessage('site_temporarily_closed');
				} else {
						showmessage($_SCONFIG['closereason']);
				}
		}
		// IP锟斤拷锟绞硷拷锟?
		if ((!ipaccess($_SCONFIG['ipaccess']) || ipbanned($_SCONFIG['ipbanned'])) && !ckfounder($_SGLOBAL['supe_uid']) && !checkperm('closeignore')) {
				showmessage('ip_is_not_allowed_to_visit');
		}
}
// 站锟斤拷t锟斤拷
function getsiteurl() {
		global $_SC;

		if (empty($_SC['siteurl'])) {
				$uri = $_SERVER['REQUEST_URI']?$_SERVER['REQUEST_URI']:($_SERVER['PHP_SELF']?$_SERVER['PHP_SELF']:$_SERVER['SCRIPT_NAME']);
				return 'http://' . $_SERVER['HTTP_HOST'] . substr($uri, 0, strrpos($uri, '/') + 1);
		} else {
				return $_SC['siteurl'];
		}
}
// 锟斤拷取锟侥硷拷锟斤拷锟阶?
function fileext($filename) {
		return strtolower(trim(substr(strrchr($filename, '.'), 1)));
}
// 锟斤拷锟?
function creditrule($mode, $type) {
		global $_SGLOBAL;

		if (!@include_once(S_ROOT . './data/data_creditrule.php')) {
				include_once(S_ROOT . './source/function_cache.php');
				creditrule_cache();
		}
		$credit = 0;
		if (!empty($_SGLOBAL['creditrule'])) {
				if (!empty($_SGLOBAL['creditrule'][$mode][$type])) {
						$credit = $_SGLOBAL['creditrule'][$mode][$type];
				}
		}
		return intval($credit);
}
// 锟斤拷锟铰伙拷锟?
function updatespacestatus($creditmode, $optype) {
		global $_SGLOBAL;

		$lastname = $optype == 'search'?'lastsearch':'lastpost';
		$credit = creditrule($creditmode, $optype);
		if ($credit) {
				$creditsql = ($creditmode == 'get')?"+$credit":"-$credit";
		} else {
				$creditsql = '';
		}
		$creditsql = $creditsql?",credit=credit{$creditsql}":'';
		$updatetimesql = $optype == 'search'?'':",updatetime='$_SGLOBAL[timestamp]'"; //锟斤拷锟斤拷锟斤拷锟?

		// 锟斤拷锟斤拷状态
		$_SGLOBAL['db'] -> query("UPDATE " . tname('space') . " SET $lastname='$_SGLOBAL[timestamp]' $updatetimesql $creditsql WHERE uid='$_SGLOBAL[supe_uid]'");
}
// 去锟斤拷slassh
function sstripslashes($string) {
		if (is_array($string)) {
				foreach($string as $key => $val) {
						$string[$key] = sstripslashes($val);
				}
		} else {
				$string = stripslashes($string);
		}
		return $string;
}
// 锟斤拷示锟斤拷锟?
function adshow($pagetype) {
		global $_SGLOBAL;

		@include_once(S_ROOT . './data/data_ad.php');
		if (empty($_SGLOBAL['ad']) || empty($_SGLOBAL['ad'][$pagetype])) return false;
		$ads = $_SGLOBAL['ad'][$pagetype];
		$key = mt_rand(0, count($ads)-1);
		$id = $ads[$key];
		$file = S_ROOT . './data/adtpl/' . $id . '.htm';
		echo sreadfile($file);
}
// 锟斤拷锟斤拷转锟斤拷
function siconv($str, $out_charset, $in_charset = '') {
		global $_SC;

		$in_charset = empty($in_charset)?strtoupper($_SC['charset']):strtoupper($in_charset);
		$out_charset = strtoupper($out_charset);
		if ($in_charset != $out_charset) {
				if (function_exists('iconv') && (@$outstr = iconv("$in_charset//IGNORE", "$out_charset//IGNORE", $str))) {
						return $outstr;
				} elseif (function_exists('mb_convert_encoding') && (@$outstr = mb_convert_encoding($str, $out_charset, $in_charset))) {
						return $outstr;
				}
		}
		return $str; //转锟斤拷失锟斤拷
}
// 锟斤拷取锟矫伙拷锟斤拷锟?
function getpassport($username, $password) {
		global $_SGLOBAL, $_SC;

		$passport = array();
		if (!@include_once S_ROOT . './uc_client/client.php') {
				showmessage('system_error');
		}

		$ucresult = uc_user_login($username, $password);
		if ($ucresult[0] > 0) {
				$passport['uid'] = $ucresult[0];
				$passport['username'] = $ucresult[1];
				$passport['email'] = $ucresult[3];
		}
		return $passport;
}
// 锟矫伙拷锟斤拷锟斤拷时锟斤拷锟斤拷锟斤拷
function interval_check($type) {
		global $_SGLOBAL, $space;

		$intervalname = $type . 'interval';
		$lastname = 'last' . $type;

		$waittime = 0;
		if ($interval = checkperm($intervalname)) {
				$lasttime = isset($space[$lastname])?$space[$lastname]:getcount('space', array('uid' => $_SGLOBAL['supe_uid']), $lastname);
				$waittime = $interval - ($_SGLOBAL['timestamp'] - $lasttime);
		}
		return $waittime;
}
// 锟斤拷锟斤拷锟较达拷图片l锟斤拷
function mkpicurl($pic, $thumb = 1) {
		global $_SCONFIG, $_SC, $space;

		$url = '';
		if (isset($pic['picnum']) && $pic['picnum'] < 1) {
				$url = 'image/nopic.gif';
		} elseif (isset($pic['picflag'])) {
				if ($pic['pic']) {
						if ($pic['picflag'] == 1) {
								$url = $_SC['attachurl'] . $pic['pic'];
						} elseif ($pic['picflag'] == 2) {
								$url = $_SCONFIG['ftpurl'] . $pic['pic'];
						} else {
								$url = $pic['pic'];
						}
				}
		} elseif (isset($pic['filepath'])) {
				$pic['pic'] = $pic['filepath'];
				if ($pic['pic']) {
						if ($thumb && $pic['thumb']) $pic['pic'] .= '.thumb.jpg';
						if ($pic['remote']) {
								$url = $_SCONFIG['ftpurl'] . $pic['pic'];
						} else {
								$url = $_SC['attachurl'] . $pic['pic'];
						}
				}
		} else {
				$url = $pic['pic'];
		}
		if ($url && $pic['friend'] == 4) {
				$url = 'image/nopublish.jpg';
		}
		return $url;
}
// 锟斤拷锟斤拷锟斤拷锟斤拷图片t锟斤拷
function getpicurl($picurl, $maxlenth = '200') {
		$picurl = shtmlspecialchars(trim($picurl));
		if ($picurl) {
				if (preg_match("/^http\:\/\/.{5,$maxlenth}\.(jpg|gif|png)$/i", $picurl)) return $picurl;
		}
		return '';
}
// 锟斤拷锟斤拷锟斤拷锟斤拷锟斤拷
function getstar($credit) {
		global $_SCONFIG;

		$starimg = '';
		if ($_SCONFIG['starcredit'] > 1) {
				// 锟斤拷锟斤拷锟斤拷锟斤拷锟斤拷
				$starnum = intval($credit / $_SCONFIG['starcredit']) + 1;
				if ($_SCONFIG['starlevelnum'] < 2) {
						if ($starnum > 10) $starnum = 10;
						for($i = 0; $i < $starnum; $i++) {
								$starimg .= '<img src="image/star_level10.gif" align="absmiddle" />';
						}
				} else {
						// 锟斤拷锟斤拷燃锟?10锟斤拷)
						for($i = 10; $i > 0; $i--) {
								$numlevel = intval($starnum / pow($_SCONFIG['starlevelnum'], ($i - 1)));
								if ($numlevel > 10) $numlevel = 10;
								if ($numlevel) {
										for($j = 0; $j < $numlevel; $j++) {
												$starimg .= '<img src="image/star_level' . $i . '.gif" align="absmiddle" />';
										}
										break;
								}
						}
				}
		}
		if (empty($starimg)) $starimg = '<img src="image/credit.gif" alt="' . $credit . '" align="absmiddle" alt="' . $credit . '" title="' . $credit . '" />';
		return $starimg;
}
// 锟斤拷锟斤拷锟揭?
function smulti($start, $perpage, $count, $url, $ajaxdiv = '') {
		global $_SGLOBAL;

		$multi = array('last' => -1, 'next' => -1, 'begin' => -1, 'end' => -1, 'html' => '');
		if ($start > 0) {
				if (empty($count)) {
						showmessage('no_data_pages');
				} else {
						$multi['last'] = $start - $perpage;
				}
		}

		$showhtml = 0;
		if ($count == $perpage) {
				$multi['next'] = $start + $perpage;
		}
		$multi['begin'] = $start + 1;
		$multi['end'] = $start + $count;

		if ($multi['begin'] >= 0) {
				if ($multi['last'] >= 0) {
						$showhtml = 1;
						if ($_SGLOBAL['inajax']) {
								$multi['html'] .= "<a href=\"javascript:;\" onclick=\"ajaxget('$url&ajaxdiv=$ajaxdiv', '$ajaxdiv')\">|&lt;</a> <a href=\"javascript:;\" onclick=\"ajaxget('$url&start=$multi[last]&ajaxdiv=$ajaxdiv', '$ajaxdiv')\">&lt;</a> ";
						} else {
								$multi['html'] .= "<a href=\"$url\">|&lt;</a> <a href=\"$url&start=$multi[last]\">&lt;</a> ";
						}
				} else {
						$multi['html'] .= "&lt;";
				}
				$multi['html'] .= " $multi[begin]~$multi[end] ";
				if ($multi['next'] >= 0) {
						$showhtml = 1;
						if ($_SGLOBAL['inajax']) {
								$multi['html'] .= " <a href=\"javascript:;\" onclick=\"ajaxget('$url&start=$multi[next]&ajaxdiv=$ajaxdiv', '$ajaxdiv')\">&gt;</a> ";
						} else {
								$multi['html'] .= " <a href=\"$url&start=$multi[next]\">&gt;</a>";
						}
				} else {
						$multi['html'] .= " &gt;";
				}
		}

		return $showhtml?$multi['html']:'';
}
// 锟斤拷取锟斤拷锟斤拷状态
function getfriendstatus($uid, $fuid) {
		global $_SGLOBAL;

		$query = $_SGLOBAL['db'] -> query("SELECT status FROM " . tname('friend') . " WHERE uid='$uid' AND fuid='$fuid' LIMIT 1");
		if ($value = $_SGLOBAL['db'] -> fetch_array($query)) {
				return $value['status'];
		} else {
				return -1;
		}
}
// 锟斤拷锟斤拷锟介建
function renum($array) {
		$newnums = $nums = array();
		foreach ($array as $id => $num) {
				$newnums[$num][] = $id;
				$nums[$num] = $num;
		}
		return array($nums, $newnums);
}
// 锟斤拷槎拷锟?
function ckfriend($invalue) {
		global $_SGLOBAL, $_SC, $_SCONFIG, $_SCOOKIE, $space;

		if ($invalue['uid'] == $_SGLOBAL['supe_uid']) return true; //锟皆硷拷
		$result = false;
		switch ($invalue['friend']) {
				case 0:// 全站锟矫伙拷锟缴硷拷
						$result = true;
						break;
				case 1:// 全锟斤拷锟窖可硷拷
						if ($space['self']) {
								$result = true;
						} else {
								if ($space['uid'] == $invalue['uid']) {
										// 锟角凤拷锟斤拷锟?
										$space['isfriend'] = $space['self'];
										if ($space['friends'] && in_array($_SGLOBAL['supe_uid'], $space['friends'])) {
												$space['isfriend'] = 1; //锟角猴拷锟斤拷
										}
										$isfriend = $space['isfriend'];
								} else {
										$isfriend = getfriendstatus($_SGLOBAL['supe_uid'], $invalue['uid']);
								}
								if ($isfriend) $result = true;
						}
						break;
				case 2:// 锟斤拷指锟斤拷锟斤拷锟窖可硷拷
						if ($invalue['target_ids']) {
								$target_ids = explode(',', $invalue['target_ids']);
								if (in_array($_SGLOBAL['supe_uid'], $target_ids)) $result = true;
						}
						break;
				case 3:// 锟斤拷锟皆硷拷锟缴硷拷
						break;
				case 4:// 凭锟斤拷锟斤拷榭?
						$result = true;
						break;
				default:
						break;
		}
		return $result;
}
// 锟斤拷锟斤拷feed
function mkfeed($feed, $actors = array()) {
		global $_SGLOBAL, $_SN, $_SCONFIG, $space ;

		$feed['title_data'] = empty($feed['title_data'])?array():unserialize($feed['title_data']);
		$feed['body_data'] = empty($feed['body_data'])?array():unserialize($feed['body_data']);
		// title
		$searchs = $replaces = array();
		if ($feed['title_data'] && is_array($feed['title_data'])) {
				foreach (array_keys($feed['title_data']) as $key) {
						$searchs[] = '{' . $key . '}';
						$replaces[] = $feed['title_data'][$key];
				}
		}

		$searchs[] = '{actor}';
		$replaces[] = empty($actors)? "<a href=\"space.php?uid=$feed[uid]\">" . $_SN[$feed['uid']] . "</a>":implode(lang('dot'), $actors); //timesule realname mod
		$searchs[] = '{app}';
		if (empty($_SGLOBAL['app'][$feed['appid']])) {
				$replaces[] = '';
		} else {
				$app = $_SGLOBAL['app'][$feed['appid']];
				$replaces[] = "<a href=\"$app[url]\">$app[name]</a>";
		}
		$feed['title_template'] = mktarget(str_replace($searchs, $replaces, $feed['title_template']));
		// body
		$searchs = $replaces = array();
		if ($feed['body_data']) {
				foreach (array_keys($feed['body_data']) as $key) {
						$searchs[] = '{' . $key . '}';
						$replaces[] = $feed['body_data'][$key];
				}
		}
		$searchs[] = '{actor}';
		$replaces[] = "<a onclick=\"update('space.php?uid=$feed[uid]',1);return false;\" href=\"javascript:void(0);\">$feed[username]</a>";
		$feed['body_template'] = mktarget(str_replace($searchs, $replaces, $feed['body_template']));

		$feed['body_general'] = mktarget($feed['body_general']);
		// icon
		if ($feed['appid']) {
				$feed['icon_image'] = "image/icon/{$feed['icon']}.gif";
		} else {
				$feed['icon_image'] = "http://appicon.manyou.com/icons/{$feed['icon']}";
		}
		// 锟侥讹拷
		$feed['style'] = $feed['target'] = '';
		if ($_SCONFIG['feedread']) {
				$read_feed_ids = empty($_COOKIE['read_feed_ids'])?array():explode(',', $_COOKIE['read_feed_ids']);
				if ($read_feed_ids && in_array($feed['feedid'], $read_feed_ids)) {
						$feed['style'] = " class=\"feedread\"";
				} else {
						$feed['style'] = " onclick=\"readfeed(this, $feed[feedid]);\"";
				}
		}
		if ($_SCONFIG['feedtargetblank']) {
				$feed['target'] = ' target="_blank"';
		}

		return $feed;
}
// 锟斤拷锟斤拷feed锟斤拷t锟斤拷
function mktarget($html) {
		global $_SCONFIG;

		if ($html && $_SCONFIG['feedtargetblank']) {
				$html = preg_replace("/<a(.+?)href=([\'\"]?)([^>\s]+)\\2([^>]*)>/i", '<a target="_blank" \\1 href="\\3" \\4>', $html);
		}
		return $html;
}
// 锟斤拷锟斤拷锟斤拷锟?
function mkshare($share) {
		$share['body_data'] = unserialize($share['body_data']);
		// body
		$searchs = $replaces = array();
		if ($share['body_data']) {
				foreach (array_keys($share['body_data']) as $key) {
						$searchs[] = '{' . $key . '}';
						$replaces[] = $share['body_data'][$key];
				}
		}
		$share['body_template'] = str_replace($searchs, $replaces, $share['body_template']);

		return $share;
}
// ip锟斤拷锟斤拷锟斤拷锟斤拷
function ipaccess($ipaccess) {
		return empty($ipaccess)?true:preg_match("/^(" . str_replace(array("\r\n", ' '), array('|', ''), preg_quote($ipaccess, '/')) . ")/", getonlineip());
}
// ip锟斤拷锟绞斤拷止
function ipbanned($ipbanned) {
		return empty($ipbanned)?false:preg_match("/^(" . str_replace(array("\r\n", ' '), array('|', ''), preg_quote($ipbanned, '/')) . ")/", getonlineip());
}
// 锟斤拷锟絪tart
function ckstart($start, $perpage) {
		global $_SCONFIG;

		$maxstart = $perpage * intval($_SCONFIG['maxpage']);
		if ($start < 0 || ($maxstart > 0 && $start >= $maxstart)) {
				showmessage('length_is_not_within_the_scope_of');
		}
}
// 锟斤拷锟斤拷头锟斤拷
function avatar($uid, $size = 'small') {
		global $_SCONFIG;

		$type = empty($_SCONFIG['avatarreal'])?'virtual':'real';
		if (empty($_SCONFIG['uc_dir'])) {
				return UC_API . '/avatar.php?uid=' . $uid . '&size=' . $size . '&type=' . (empty($_SCONFIG['avatarreal'])?'virtual':'real');
		} else {
				if (ckavatar($uid)) {
						return UC_API . '/data/avatar/' . avatarfile($uid, $size, $type);
				} else {
						return UC_API . "/images/noavatar_$size.gif";
				}
		}
}
// 锟斤拷锟酵凤拷锟斤拷欠锟斤拷洗锟?
function ckavatar($uid) {
		global $_SC, $_SCONFIG;

		$type = empty($_SCONFIG['avatarreal'])?'virtual':'real';
		if (empty($_SCONFIG['uc_dir'])) {
				include_once(S_ROOT . './uc_client/client.php');
				$file_exists = uc_check_avatar($uid, 'middle', $type);
				return $file_exists;
		} else {
				$file = $_SCONFIG['uc_dir'] . './data/avatar/' . avatarfile($uid, 'middle', $type);
				return file_exists($file)?1:0;
		}
}
// 锟矫碉拷头锟斤拷
function avatarfile($uid, $size = 'middle', $type = '') {
		global $_SGLOBAL;

		$var = "avatarfile_{$uid}_{$size}_{$type}";
		if (empty($_SGLOBAL[$var])) {
				$size = in_array($size, array('big', 'middle', 'small')) ? $size : 'middle';
				$uid = abs(intval($uid));
				$uid = sprintf("%09d", $uid);
				$dir1 = substr($uid, 0, 3);
				$dir2 = substr($uid, 3, 2);
				$dir3 = substr($uid, 5, 2);
				$typeadd = $type == 'real' ? '_real' : '';
				$_SGLOBAL[$var] = $dir1 . '/' . $dir2 . '/' . $dir3 . '/' . substr($uid, -2) . $typeadd . "_avatar_$size.jpg";
		}
		return $_SGLOBAL[$var];
}
// 锟斤拷锟斤拷欠锟斤拷录
function checklogin() {
		global $_SGLOBAL, $_SCONFIG;

		if (empty($_SGLOBAL['supe_uid'])) {
				ssetcookie('_refer', rawurlencode($_SERVER['REQUEST_URI']));
				showmessage('to_login', 'do.php?ac=' . $_SCONFIG['login_action']);
		}
}
// 锟斤拷锟角疤拷锟斤拷锟?
function lang($key, $vars = array()) {
		global $_SGLOBAL;

		include_once(S_ROOT . './language/lang_source.php');
		if (isset($_SGLOBAL['sourcelang'][$key])) {
				$result = lang_replace($_SGLOBAL['sourcelang'][$key], $vars);
		} else {
				$result = $key;
		}
		return $result;
}
// 锟斤拷煤锟教拷锟斤拷锟?
function cplang($key, $vars = array()) {
		global $_SGLOBAL;

		include_once(S_ROOT . './language/lang_cp.php');
		if (isset($_SGLOBAL['cplang'][$key])) {
				$result = lang_replace($_SGLOBAL['cplang'][$key], $vars);
		} else {
				$result = $key;
		}
		return $result;
}
// 锟斤拷锟斤拷锟芥换
function lang_replace($text, $vars) {
		if ($vars) {
				foreach ($vars as $k => $v) {
						$rk = $k + 1;
						$text = str_replace('\\' . $rk, $v, $text);
				}
		}
		return $text;
}
// 锟斤拷锟斤拷没锟斤拷锟斤拷锟?
function getfriendgroup() {
		global $_SCONFIG, $space;

		$groups = array();
		$spacegroup = empty($space['privacy']['groupname'])?array():$space['privacy']['groupname'];
		for($i = 0; $i < $_SCONFIG['groupnum']; $i++) {
				if ($i == 0) {
						$groups[0] = lang('friend_group_default');
				} else {
						if (!empty($spacegroup[$i])) {
								$groups[$i] = $spacegroup[$i];
						} else {
								if ($i < 8) {
										$groups[$i] = lang('friend_group_' . $i);
								} else {
										$groups[$i] = lang('friend_group') . $i;
								}
						}
				}
		}
		return $groups;
}
// 锟斤拷取t锟斤拷
function sub_url($url, $length) {
		if (strlen($url) > $length) {
				$url = str_replace(array('%3A', '%2F'), array(':', '/'), rawurlencode($url));
				$url = substr($url, 0, intval($length * 0.5)) . ' ... ' . substr($url, - intval($length * 0.3));
		}
		return $url;
}
// 锟斤拷取锟矫伙拷锟斤拷
function realname_set($uid, $username, $name = '', $namestatus = 0) {
		global $_SGLOBAL, $_SN, $_SCONFIG;
		if ($name) {
				$_SN[$uid] = ($_SCONFIG['realname'] && $namestatus)?$name:$username;
		} elseif (!isset($_SN[$uid])) {
				$_SN[$uid] = $username;
				$_SGLOBAL['select_realname'][$uid] = $uid; //锟斤拷要锟斤拷锟斤拷
		}
}
// 锟斤拷取实锟斤拷
function realname_get() {
		global $_SGLOBAL, $_SCONFIG, $_SN, $space;

		if ($_SCONFIG['realname'] && $_SGLOBAL['select_realname']) {
				// 锟窖撅拷锟叫碉拷
				if ($space && isset($_SGLOBAL['select_realname'][$space['uid']])) {
						unset($_SGLOBAL['select_realname'][$space['uid']]);
				}
				if ($_SGLOBAL['member']['uid'] && isset($_SGLOBAL['select_realname'][$_SGLOBAL['member']['uid']])) {
						unset($_SGLOBAL['select_realname'][$_SGLOBAL['member']['uid']]);
				}
				// 锟斤拷锟绞碉拷锟?
				$uids = empty($_SGLOBAL['select_realname'])?array():array_keys($_SGLOBAL['select_realname']);
				if ($uids) {
						$query = $_SGLOBAL['db'] -> query("SELECT uid, name, namestatus FROM " . tname('space') . " WHERE uid IN (" . simplode($uids) . ")");
						while ($value = $_SGLOBAL['db'] -> fetch_array($query)) {
								if ($value['name'] && $value['namestatus']) {
										$_SN[$value['uid']] = $value['name'];
								}
						}
				}
		}
}
// 群锟斤拷锟斤拷息
function getmtag($id) {
		global $_SGLOBAL;

		$query = $_SGLOBAL['db'] -> query("SELECT * FROM " . tname('mtag') . " WHERE tagid='$id'");
		if (!$mtag = $_SGLOBAL['db'] -> fetch_array($query)) {
				showmessage('designated_election_it_does_not_exist');
		}
		// 锟斤拷群锟斤拷
		if ($mtag['membernum'] < 1 && ($mtag['joinperm'] || $mtag['viewperm'])) {
				$mtag['joinperm'] = $mtag['viewperm'] = 0;
				updatetable('mtag', array('joinperm' => 0, 'viewperm' => 0), array('tagid' => $id));
		}
		// 锟斤拷锟斤拷
		include_once(S_ROOT . './data/data_profield.php');
		$mtag['field'] = $_SGLOBAL['profield'][$mtag['fieldid']];
		$mtag['title'] = $mtag['field']['title'];
		if (empty($mtag['pic'])) {
				$mtag['pic'] = 'image/nologo.jpg';
		}
		// 锟斤拷员锟斤拷锟斤拷
		$mtag['ismember'] = 0;
		$mtag['grade'] = -9; //-9 锟角筹拷员 -2 锟斤拷锟斤拷 -1 锟斤拷锟斤拷 0 锟斤拷通 1 锟斤拷锟斤拷 8 锟斤拷群锟斤拷 9 群锟斤拷
		$query = $_SGLOBAL['db'] -> query("SELECT grade FROM " . tname('tagspace') . " WHERE tagid='$id' AND uid='$_SGLOBAL[supe_uid]' LIMIT 1");
		if ($value = $_SGLOBAL['db'] -> fetch_array($query)) {
				$mtag['grade'] = $value['grade'];
				$mtag['ismember'] = 1;
		}
		if ($mtag['grade'] < 9 && checkperm('managemtag')) {
				$mtag['grade'] = 9;
		}
		$mtag['allowpost'] = $mtag['grade'] >= 0?1:0;
		$mtag['allowview'] = ($mtag['viewperm'] && $mtag['grade'] < -1)?0:1;

		$mtag['allowinvite'] = $mtag['grade'] >= 0?1:0;
		if ($mtag['joinperm'] && $mtag['grade'] < 8) {
				$mtag['allowinvite'] = 0;
		}

		return $mtag;
}
// 取锟斤拷锟斤拷锟叫碉拷锟斤拷锟斤拷
function sarray_rand($arr, $num) {
		$r_values = array();
		if ($arr && count($arr) > $num) {
				if ($num > 1) {
						$r_keys = array_rand($arr, $num);
						foreach ($r_keys as $key) {
								$r_values[$key] = $arr[$key];
						}
				} else {
						$r_key = array_rand($arr, 1);
						$r_values[$r_key] = $arr[$r_key];
				}
		} else {
				$r_values = $arr;
		}
		return $r_values;
}
// 锟斤拷锟斤拷没锟轿ㄒ伙拷锟?
function space_key($space, $appid = 0) {
		global $_SCONFIG;
		return substr(md5($_SCONFIG['sitekey'] . '|' . $space['uid'] . (empty($appid)?'':'|' . $appid)), 8, 16);
}
// 锟斤拷锟斤拷没锟経RL
function space_domain($space) {
		global $_SCONFIG;

		if ($space['domain'] && $_SCONFIG['allowdomain'] && $_SCONFIG['domainroot']) {
				$space['domainurl'] = 'http://' . $space['domain'] . '.' . $_SCONFIG['domainroot'];
		} else {
				if ($_SCONFIG['allowrewrite']) {
						$space['domainurl'] = getsiteurl() . $space[uid];
				} else {
						$space['domainurl'] = getsiteurl() . "?$space[uid]";
				}
		}
		return $space['domainurl'];
}
// 锟斤拷锟斤拷form锟斤拷伪锟斤拷
function formhash() {
		global $_SGLOBAL, $_SCONFIG;

		if (empty($_SGLOBAL['formhash'])) {
				$hashadd = defined('IN_ADMINCP') ? 'Only For UCenter Home AdminCP' : '';
				$_SGLOBAL['formhash'] = substr(md5(substr($_SGLOBAL['timestamp'], 0, -7) . '|' . $_SGLOBAL['supe_uid'] . '|' . md5($_SCONFIG['sitekey']) . '|' . $hashadd), 8, 8);
		}
		return $_SGLOBAL['formhash'];
}
// 锟斤拷锟斤拷锟斤拷锟斤拷欠锟斤拷锟叫?
function isemail($email) {
		return strlen($email) > 6 && preg_match("/^[\w\-\.]+@[\w\-\.]+(\.\w+)+$/", $email);
}
// 锟斤拷证锟斤拷锟斤拷
function question() {
		global $_SGLOBAL;

		include_once(S_ROOT . './data/data_spam.php');
		if ($_SGLOBAL['spam']['question']) {
				$count = count($_SGLOBAL['spam']['question']);
				$key = $count > 1?mt_rand(0, $count-1):0;
				ssetcookie('seccode', $key);
				echo $_SGLOBAL['spam']['question'][$key];
		}
}
// 锟斤拷锟組YOP锟斤拷锟斤拷息锟脚憋拷
function my_checkupdate() {
		global $_SGLOBAL, $_SCONFIG;
		if ($_SCONFIG['my_status'] && empty($_SCONFIG['my_closecheckupdate']) && checkperm('admin')) {
				$sid = $_SCONFIG['my_siteid'];
				$ts = $_SGLOBAL['timestamp'];
				$key = md5($sId . $ts . $_SCONFIG['my_sitekey']);
				echo '<script type="text/javascript" src="http://notice.uchome.manyou.com/notice?sId=' . $sid . '&ts=' . $ts . '&key=' . $key . '"></script>';
		}
}
// 锟斤拷锟斤拷没锟斤拷锟酵硷拷锟?
function g_icon($gid) {
		global $_SGLOBAL;
		include_once(S_ROOT . './data/data_usergroup.php');
		if (empty($_SGLOBAL['usergroup'][$gid]['icon'])) {
				echo '';
		} else {
				echo ' <img src="' . $_SGLOBAL['usergroup'][$gid]['icon'] . '" align="absmiddle"> ';
		}
}
// 锟斤拷锟斤拷没锟斤拷锟缴?
function g_color($gid) {
		global $_SGLOBAL;
		include_once(S_ROOT . './data/data_usergroup.php');
		if (empty($_SGLOBAL['usergroup'][$gid]['color'])) {
				echo '';
		} else {
				echo ' style="color:' . $_SGLOBAL['usergroup'][$gid]['color'] . ';"';
		}
}
// 锟斤拷锟斤拷欠锟斤拷锟斤拷始锟斤拷
function ckfounder($uid) {
		global $_SC;

		$founders = empty($_SC['founder'])?array():explode(',', $_SC['founder']);
		if ($uid && $founders) {
				return in_array($uid, $founders);
		} else {
				return false;
		}
}
// 锟斤拷取目录
function sreaddir($dir, $extarr = array()) {
		$dirs = array();
		if ($dh = opendir($dir)) {
				while (($file = readdir($dh)) !== false) {
						if (!empty($extarr) && is_array($extarr)) {
								if (in_array(strtolower(fileext($file)), $extarr)) {
										$dirs[] = $file;
								}
						} else if ($file != '.' && $file != '..') {
								$dirs[] = $file;
						}
				}
				closedir($dh);
		}
		return $dirs;
}
function window_set($title, $url, $icon = '') {
}

/**
 * 鍐欐牱寮忚〃
 *
 * @param int $uid 鐢ㄦ埛id
 * @param string $div_id 鏍峰紡鐨勫悕绉板:.sec_comment_border
 * @param  $ 鏁扮粍 $css_arr 鏍峰紡鏍煎紡濡備笅锛?
 * $css_arr = array();
 * @param string $css_file css鏂囦欢鍚庣紑鍚?
 */
function writer_css($uid, $div_id, $css_arr, $css_file = "_pp_style.css") {
		$css_file = get_cssdir($uid, $css_file);
		$notes = "/*" . $div_id . "*/\n";
		$css = array_to_css($div_id, $css_arr); //杞寲涓烘牱寮忚〃
		if (!file_exists($css_file)) { // 濡傛灉涓嶅瓨鍦ㄦ枃浠跺氨鍒涘缓鏂囦欢
				$file_pointer = fopen($css_file, "w");
				fwrite($file_pointer, $notes . $css); //鍐欏叆鏂囦欢
				fclose($file_pointer);
		} else { // 濡傛灉瀛樺湪鐨勮瘽锛屾垨鑰呰拷鍔犳垨鑰呬慨鏀规暟鎹?
				$file_pointer = fopen($css_file, "r"); //杩藉姞鏁版嵁
				$file_contents = array(); //灏嗘枃浠跺唴瀹瑰厛璇诲彇鍒版暟缁勪腑
				$is_exist_css = 0; //鏄惁宸茬粡瀛樺湪杩欎釜鏍峰紡琛?
				while (!feof($file_pointer)) {
						$buffer = fgets($file_pointer, 4096); //璇诲彇鏂囦欢鐨勪竴琛?
						if ($is_exist_css == 1) {
								/**
								 * ***鑾峰彇{}涔嬮棿鐨剆tring*******
								 */
								include_once ('source/timesule_general/time_functions.php');
								$middle = get_string_between($buffer, "{", "}"); //鑾峰彇{}涔嬮棿鐨勫唴瀹?
								$buffer_css = split(';', $middle); //鐢紱鍒嗛殧寮€
								$buf = array();
								foreach ($buffer_css as $val) { // 灏嗘暟缁勮浆涓烘寚瀹氭牸寮?
										$temp = split(':', $val);
										if (count($temp) >= 2) {
												$key = $temp[0];
												$value = $temp[1];
												$buf[$key] = $value;
										}
								}
								/**
								 */
								$buffer_arr = array_merge($buf, $css_arr);
								$buffer = array_to_css($div_id, $buffer_arr);
								$is_exist_css = 2;
						}
						if ($notes == $buffer) { // 瀛樺湪鏍峰紡琛?
								$is_exist_css = 1;
						}
						if ($buffer) {
								$file_contents[] = $buffer;
						}
				}
				if ($is_exist_css == 0) { // 涓嶅瓨鍦ㄦ牱寮忚〃锛屾坊鍔?
						$file_contents[] = $notes;
						$file_contents[] = $css . "\n";
				}
				fclose($file_pointer);
				file_write($css_file, $file_contents);
		}
}
// 璇绘牱寮忚〃鏂囦欢
function get_cssdir($uid = 0, $file_name = "_pp_style.css") {
		if ($uid == 0) {
				return 0;
		}
		$uid = abs(intval($uid));
		$uid = sprintf("%09d", $uid);
		$dir1 = substr($uid, 0, 3);
		$dir2 = substr($uid, 3, 2);
		$dir3 = substr($uid, 5, 2);
		$dir11 = 'viewspace/css/' . $dir1;
		$dir22 = 'viewspace/css/' . $dir1 . '/' . $dir2;
		$dir33 = 'viewspace/css/' . $dir1 . '/' . $dir2 . '/' . $dir3;
		if (!file_exists($dir11)) {
				mkdir($dir11);
		}
		if (!file_exists($dir22)) {
				mkdir($dir22);
		}
		if (!file_exists($dir33)) {
				mkdir($dir33);
		}
		return $dir33 . '/' . substr($uid, -2) . $file_name;
}
/**
 * 灏嗘暟缁勮浆鍖栦负css鏍峰紡
 *
 * @param string $div 鏍峰紡灞?
 * @param array $css_arr 鏍峰紡鏁扮粍
 * @return string $css 鏍峰紡琛?
 */
function array_to_css($div, $css_arr) {
		$css = $div . "{";
		foreach ($css_arr as $key => $value) {
				$css .= $key . ":" . $value . ";";
		}
		$css .= "}\n";
		return $css;
}
/**
 * 灏嗘暟缁勫啓鍏ュ埌鏂囦欢涓?
 *
 * @param  $ 鏂囦欢鍚?$file
 * @param  $ 瑕佸啓鍏ユ枃浠剁殑鏁扮粍 $str
 */
function file_write($file, $str) {
		$fp = fopen($file, "w");
		foreach ($str as $key => $value) {
				$out = $value;
				fwrite($fp, $out);
		}
		fclose($fp);
}

?>