function checkConfirm(){
	var $img = $('#checkedanim img');
		$img.show();
        setTimeout(function() {
            $img.attr('src', 'img/checksmall.gif');
        }, 0);
	setTimeout(function(){ $img.hide(); }, 950);
}

function saveConfirm(){
	loadImageandShow('lamp3',1200,'-20px 0 0 -40px');
}

function loadImageandShow(name,delay, marginOffset){
	delay = delay || 950;
	marginOffset = marginOffset || "0";
	var $img = $('#checkedanim img');
	$img.show();
    $img.attr('src', 'img/'+name+'.gif');
    $img.css('margin',marginOffset);
	setTimeout(function(){ $img.hide(); $img.css('margin','0'); }, delay);	

}
function showMessage(message){
	var msg = $('#checkedanim #msg');	
	msg.stop().fadeOut("fast").html(message);
	msg.stop().fadeIn("slow").delay(1000).fadeOut("fast");
	
}