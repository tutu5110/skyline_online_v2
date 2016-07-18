<?php
/*
	[UCenter Home] (C) 2007-2008 Comsenz Inc.
	$Id: space_index.php 10806 2008-12-23 07:14:20Z zhengqingpeng $
*/

if(!defined('FROM_INDEX')) {
	exit('Access Denied');
}
//setting default catagory
$default_catagory = 'inter_design_art';

$b = isset($_GET['b']) ? htmlentities($_GET['b']) : $default_catagory;
$ssubcat = isset($_GET['c']) ? htmlentities($_GET['c']) : 0;
if($ssubcat!= 0){
	$b = getSubCatById($ssubcat);
}


$currentCatagory = $b;
//get highlight css
$cat_highlight = array('inter_design_art','professional','year','featured','uigraphics','cspace','jing','cspace');

$isArtActive = '';
$isProActive = '';
$isRecentActive = '';
$isUIGraphicsActive = '';
$mainThumb = '';
$gthumb  = '';
switch($b){
	case 'cspace':
		$cat_highlight['cspace'] = 'class=\'title_highlight\'';
		break;
	case 'inter_design_art':
		$cat_highlight['inter_design_art'] = 'class=\'title_highlight\'';
		break;
		case 'uigraphics':
		$cat_highlight['uigraphics'] = 'class=\'title_highlight\'';
		break;
	case 'professional':
		$cat_highlight['professional'] = 'class=\'title_highlight\'';
		break;
	case 'year':
		$cat_highlight['year'] = 'class=\'title_highlight\'';				
		break;
	default:
		$cat_highlight['year'] = '';
		$cat_highlight['professional']='';
		$cat_highlight['inter_design_art']='';
		break;
}

 if($b == 'inter_design_art' ){	

$defaultContent = 'kin';
$mlist = '';
$cat = array();
$_sub =$sub= array();

$content = $_GET['content'] ? saddslashes($_GET['content']) : $defaultContent;

$sql = ' WHERE `cat` = 1 AND `subcat` = 1 ORDER BY  `isFeatured` ASC, `subcat` ASC , `year` DESC ';
$info = getInfo($sql);
$mainThumb = getThumb($sql,'54');
$gthumb = getGthumb($sql);
$defaultCatagoryArr = explode(';',$info['newcat']);
	$defaultTitleArr = explode(';',$info['title']);
	$defaultDescArr = explode(';',$info['describes']);
	$defaultCatagory = $defaultCatagoryArr[0];
	$defaultTitle = $defaultTitleArr[0];
	$defaultDesc = $defaultDescArr[0];


$isArtActive = 'class=\'mainCatActive\'';

} else if($b == 'uigraphics' ){

$defaultContent = 'kin';
$mlist = '';
$cat = array();
$_sub =$sub= array();

$content = $_GET['content'] ? saddslashes($_GET['content']) : $defaultContent;

$sql = ' WHERE (`cat` = 2 AND (`subcat` = 2 OR `subcat` = 3 )) OR (`cat` = 1 and `subcat` = 4) ORDER BY `isFeatured` ASC  ';
$mainThumb = getThumb($sql);
$info = getInfo($sql);

	$defaultCatagoryArr = explode(';',$info['newcat']);
	$defaultTitleArr = explode(';',$info['title']);
	$defaultDescArr = explode(';',$info['describes']);
	$defaultCatagory = $defaultCatagoryArr[0];
	$defaultTitle = $defaultTitleArr[0];
	$defaultDesc = $defaultDescArr[0];

$isUIGraphicsActive = 'class=\'mainCatActive\'';

}

else if($b == 'cspace' ){
	$cat = array();
	$_sub =$sub= array();
	$mlist = '';
	$defaultContent = 'shanghaitower';
	$content = $_GET['content'] ? saddslashes($_GET['content']) : $defaultContent;
	$sql = ' WHERE `cat` = 2 AND `subcat` = 1 ORDER BY `subcat` ASC , `year` DESC ';
	$info = getInfo($sql);
	$mainThumb = getThumb($sql,'54');
	$defaultCatagoryArr = explode(';',$info['newcat']);
	$defaultTitleArr = explode(';',$info['title']);
	$defaultDescArr = explode(';',$info['describes']);
	$defaultCatagory = $defaultCatagoryArr[0];
	$defaultTitle = $defaultTitleArr[0];
	$defaultDesc = $defaultDescArr[0];
	$isCSpaceActive = 'class=\'mainCatActive\'';
}else if($b == 'jing' ){
	$cat = array();
	$_sub =$sub= array();
	$mlist = '';

	$sql = ' WHERE `cat` = 2 ORDER BY `subcat` ASC , `year` DESC ';
	$info = getInfo($sql);
	
	$defaultCatagoryArr = explode(';',$info['newcat']);
	$defaultTitleArr = explode(';',$info['title']);
	$defaultDescArr = explode(';',$info['describes']);
	$defaultCatagory = $defaultCatagoryArr[0];
	$defaultTitle = $defaultTitleArr[0];
	$defaultDesc = $defaultDescArr[0];
	$isJingActive = 'class=\'mainCatActive\'';
}


if($b != 'jing')
$defaultContent = getDefaultContent($defaultContent);

$siteDesc  = 'Portfolio and JING\'s works';

include_once template("j_pf");





/*****************************function s ********************************/

function getGthumb($wheresql){
		global $_SGLOBAL;
		$query = $_SGLOBAL['db']->query("SELECT filename FROM ".tname('work').$wheresql);
		$_info = '';
		while ($value = $_SGLOBAL['db']->fetch_array($query)) {
			$_info .= $value['filename'].',';
		}
		return substr($_info,0,$_info.length-1);
}

function getInfo($wheresql){
		global $_SGLOBAL;
		$query = $_SGLOBAL['db']->query("SELECT name,newcat,previewText FROM ".tname('work').$wheresql);
	//	echo "SELECT name,newcat,previewText FROM ".tname('work').$wheresql;
		//exit();
		$_info = array();
		$counter = 0;
		while ($value = $_SGLOBAL['db']->fetch_array($query)) {
			$counter++;
			//avoid null

			if($value['name'] == '' ) $value['name'] = 'UnAssigned';
   		    if($value['previewText'] == '' ) $value['previewText'] = 'Coming Soon';
			if($value['newcat'] == '' ) $value['newcat'] = 'Uncatagorized';
			
			$_info['describes'] .= $value['previewText'].';';
			$_info['title'] .= $value['name'].';';
			$_info['newcat'] .= $value['newcat'].';';
		}
	
		return $_info;
	
}

function getThumb($wheresql,$forceWeidth = 50){
		global $_SGLOBAL;
		$query = $_SGLOBAL['db']->query("SELECT * FROM ".tname('work').$wheresql);

		$totalResource = $_SGLOBAL['db']->query("SELECT COUNT(id) FROM ".tname('work').$wheresql);
		$totalResource = $_SGLOBAL['db']->fetch_array($totalResource);
		$total =  $totalResource['COUNT(id)'];
		$thumb = '';
		$counter = 0;
		while ($value = $_SGLOBAL['db']->fetch_array($query)) {
			$counter++;
			$thumb .= '<div class="thumbShadow" id="ctb_'.$counter.'" style="width:'.$forceWeidth.'px;"></div><span class="mainThumb" ><a id="'.$counter.'" onclick="browseContent();"  onmouseover="smartSwitch(\''.$value['filename'].'\',\''.$counter.'\',\''.$total.'\');" ><img src="image/contentPreview/'.$value['filename'].'.jpg" height="30"></a></span>';
			
		}
		return $thumb;
}

function getDefaultContent($filename){
		return file_get_contents('template/default/'.$filename.'.htm');
	}
function getSub($wheresql){
	global $_SGLOBAL;
	$name = $filename = $subcatfilename =$year= '';
	$ct = 0;
	$s = array();
	$psubcat = 1;
	$query = $_SGLOBAL['db']->query("SELECT * FROM ".tname('work').$wheresql);
	$sql = "SELECT * FROM ".tname('work').$wheresql;
	while ($value = $_SGLOBAL['db']->fetch_array($query)) {
		   
		if($value['subcat'] == $psubcat){
			$name .= '\''.$value['name'].'\',';
			$filename .= '\''.$value['filename'].'\',';
			$year .= '\''.$value['year'].'\',';
			$subcatfilename = $value['subcatfilename'];
		} else {
			// different entry
			//  assign old one first
			//	update subcat;
			$psubcat = $value['subcat'];
			//	backup oldvalue
			$oldvalue = $value;
			$value = null;
			if($name != ''){
			$value['name'] = substr($name,0,strlen($name)-1);
			$value['filename'] = substr($filename,0,strlen($filename)-1);
			$value['year'] = substr($year,0,strlen($year)-1);
			$value['subcatfilename'] = $subcatfilename;
			$s[] = $value;
			//reset name,filename and subcatfilename
			$name = $filename = $subcatfilename  = '';
			$year = 0;
			$name = '\''.$oldvalue['name'].'\',';
			$filename = '\''.$oldvalue['filename'].'\',';
			$subcatfilename = $oldvalue['subcatfilename'];
			$year = '\''.$oldvalue['year'].'\',';
			}
		}
	}
	//  add last entry
	$value['name'] = substr($name,0,strlen($name)-1);
	$value['filename'] = substr($filename,0,strlen($filename)-1);
	$value['year'] = substr($year,0,strlen($year)-1);
	$value['subcatfilename'] = $subcatfilename;
	$s[] = $value;
	$name = $filename = $subcatfilename = '';
	return $s;
}

function sorrt_sub($sub){
	$subcatid = $_subcatid = 1;
	$mainCatid = $_mainCatid  = 1;
	$index = 0;
	$new = array();
	$value = array();
	$len = count($sub);

	for($i=0;$i<$len;$i++){
			$_subcatid = intval($sub[$i]['subcat']);
			$_mainCatid = intval($sub[$i]['cat']);
			//	echo 'begin loop.. id is '.$i.'..<br><br><br><br> subcat id is '.$_subcatid.'<br />';
				if($subcatid == $_subcatid && $_mainCatid == $mainCatid){
					$value['name'] .= '\''.$sub[$i]['name'].'\',';
					$value['filename'] .= '\''.$sub[$i]['filename'].'\',';
					$value['year'] .='\''.$sub[$i]['year'].'\',';
				//	echo '#'.$i.'new name is ' . $value['name'].'<br />';
				} else {
					///process finished catagories
				//	echo '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;else statment #'.$i;
					$value['name'] = substr($value['name'],0,-1);
					$value['filename'] =substr($value['filename'],0,-1);
					$value['year'] =substr($value['year'],0,-1);
					$value['subcatfilename'] = $sub[$i-1]['subcatfilename'];
					//passing array
					$new[$index] = $value;
		
					//cleaning variable
					$value['filename']=$value['subcatfilename'] = $value['name'] = $value['year'] = '';
					//
					$index++;
					$value['name'] .= '\''.$sub[$i]['name'].'\',';
					$value['filename'] .= '\''.$sub[$i]['filename'].'\',';
					$value['year'] .= '\''.$sub[$i]['year'].'\',';
				    $subcatid = $_subcatid;	
					$mainCatid = $_mainCatid;
				}
			
	}	

	// clean the last entry
	$value['name'] = substr($value['name'],0,-1);
	$value['filename'] =substr($value['filename'],0,-1);
	$value['year'] =substr($value['year'],0,-1);
	$value['subcatfilename'] = $sub[$len-1]['subcatfilename'];
	//installing last variable
	$new[$index] = $value;
	//echo 'FINAL '.$value['name'].'<br />';
	return $new;
}

function getSubCatById($case){
	switch($case){
	case 1:
		return 'uigraphics';
		break;
	case 2:
		return  'cspace';
		break;
	case 3:
		return  'inter_design_art';
		break;
	case 4:
		return  'professional';
		break;
	default:
		return  'uigraphics';
		break;
		
	return 'uigraphics';
	}
}

function generate_SE_list($cat){
		$len = count($cat);
		$mainArr = '';
		for($i=0;$i<$len;$i++){
				$mainArr .= '"'.$cat[$i]['catfilename'].'",';
			}
		return substr($mainArr,0,-1);
}
function getSubcatNames($whereas){
	global $_SGLOBAL;
	$name = '';	
	$filename = '';
	$arr = array(2);
	$query = $_SGLOBAL['db']->query("SELECT * FROM ".tname('Work').$whereas);
	while ($value = $_SGLOBAL['db']->fetch_array($query)) {
		$name.='"'.rawurlencode($value['name']).'",';
		$filename .='"'.$value['filename'].'",';
	}
	$arr[0] =  substr($name,0,-1);
	$arr[1] = substr($filename,0,-1);
	return $arr;
}

function getSecCatfilenames($mainid=1){
	global $_SGLOBAL;
	$str = '';
	$query = $_SGLOBAL['db']->query("SELECT * FROM ".tname('cat').' WHERE `maincatid` = '.$mainid.' ORDER BY `id` DESC');
	while ($value = $_SGLOBAL['db']->fetch_array($query)) {
		$str.='"'.$value['catfilename'].'",';
	}
	
   
	return substr($str,0,-1);
}


function getSecCatlisting($maincatid=1){
	global $_SGLOBAL;
	$cat = '';
	$query = $_SGLOBAL['db']->query("SELECT * FROM ".tname('cat').' WHERE `maincatid` = '.$maincatid);
		while ($value = $_SGLOBAL['db']->fetch_array($query)) {
			$cat[] = $value;
		}
		return $cat;
	}
//********generate third catagory, with work names on ***************************/
function fetch_sub_cat($whereas=NULL, $overrideSubcatWithAny = NULL){
	$allCatagories = false;
	if($overrideSubcatWithAny){
		$allCatagories = true;
	}
	global $_SGLOBAL;
	$sub = array();
	$list = '';
	$cyear = 0;
	$ct = 0;
	$query = $_SGLOBAL['db']->query("SELECT * FROM ".tname('work').$whereas);
	
	// highlight first entry
	while ($value = $_SGLOBAL['db']->fetch_array($query)) {
		if($ct = 0 )
			$cyear = $value['year'];
		if($value['subcat'] == 1 || $allCatagories){//obtain only the first catagory for the page preview
			if($cyear != $value['year']){
				$list.= '<span class=\'inlineYearIndicator\'>'. $value['year'] . ' /// </span><br />';
				$cyear = $value['year'];
			}
		$list.='<li id=\'clist_'.$value['id'].'\' ><a href="index.php?do=pf&content='.$value['filename'].'" onmouseout=" _hidetips();" onmouseover="showPreview(\''.$value['filename'].'\'); showSecondNavTips('.$value['id'].',\'aefaef\');" onclick="showback();showcontent(\''.$value['filename'].'\');return false; ">'.$value['name'].'</a></li>';	
		}
		$sub[] = $value;
		$ct ++;
	}
	$sub[0]['list'] = $list;
	return $sub;
}

//********generate second catagory, with catagory names on ***************************/
function fetch_se_cat($catid,$whereas = NULL){
	global $_SGLOBAL;
	$cat = array();
	$mlist = '';
	$query = $_SGLOBAL['db']->query("SELECT * FROM ".tname('cat')." WHERE `maincatid` = $catid".$whereas);
	$highlight = 'class="highlight"';
	while ($value = $_SGLOBAL['db']->fetch_array($query)) {
		 $mlist.= '<li id=\'main_'.$value['catfilename'].'\' '.$highlight.'><a href="javascript:void();" onmouseover ="showSubCat(\''.$value['catfilename'].'\');" onclick="showSubCat(\''.$value['catfilename'].'\')">'.$value['catname'].'</a></li>';	
		 $cat[]=$value;
		 $highlight = '';
	}	
	$cat[0]['mlist'] = $mlist;
	return $cat;
	
}



?>
