String.prototype.replaceAll = function(search, replacement) {
    return this.replace(new RegExp(search, 'g'), replacement);
};

String.prototype.removeAllAfter = function (search){
	var target = this;
	return target.substring(0,target.indexOf(search));
}

String.prototype.contains = function(search){
    return (this.indexOf(search) != -1 ? true: false);
}

String.prototype.toTimeStamp = function (){
      	return (new Date(this).getTime()/1000);
	}

 String.prototype.isCNMarket = function(){
    if(this.indexOf('16') != -1 ||
       this.indexOf('15') != -1 ||
       this.indexOf('60') != -1 ||
       this.indexOf('30') != -1 ||
       this.charAt(0) != '0')
      return true;
    return false;
  }

  String.prototype.isFuture = function(search){
    return this.toLowerCase().indexOf(search) != -1 ? true : false;
  }

  String.prototype.insert = function(add,search){
        var pos = a.indexOf(search);
        pos =  (pos != -1) ? pos : this.length;
        return [this.slice(0, pos), add, this.slice(pos)].join('');
  }

  String.prototype.getAfter = function (search){
    var pos = this.indexOf(search);
    if(pos != -1)
      return this.substring(pos+1,this.length);
    else
      return this;
  }

  String.prototype.insert = function(add,pos){
        pos =  (pos != -1) ? pos : this.length;
        return [this.slice(0, pos), add, this.slice(pos)].join('');

  }

  String.prototype.beginWith = function (target){
        var len = target.length;
       return (target === this.substring(0,len)) ? true : false;
  }

  String.prototype.endWith = function(key){
      var len = key.length;
      var sub = this.substring((this.length - len),this.length);
      return key == sub ? true : false;
  }

  String.prototype.insertAfter = function(add, search){
        var pos = a.indexOf(search) + search.length;
        pos =  (pos != -1) ? pos : this.length;
        return [this.slice(0, pos), add, this.slice(pos)].join('');
  }

  String.prototype.convert2USDateFromCN = function(){
    if(this.indexOf("-")){
      var tmp = this.split("-");
      if(tmp.length == 3)
        return tmp[1]+"/" + tmp[2] + "/"+tmp[0];
      else
        return this;
    }

  }

  Array.prototype.flatten = function(){
      return this.join(',');
  }

  Array.prototype.resort = function(){
      var t = new Array();
      for(key in this)
        t.push(this[key]);
      return t;
    }

  Array.prototype.clean = function(deleteValue) {
  for (var i = 0; i < this.length; i++) {
    if (this[i] == deleteValue) {
      this.splice(i, 1);
      i--;
    }
  }
  return this;
};

Array.prototype.removeLastN = function(num){
    for(var i = 0 ; i < num ; i ++){
             this.splice(-1, 1);
             this.join();
    }
    return this;
}

Array.prototype.removeEmpty = function(){
  var t = "";
  while(t=="")
    t = this.pop();
  this.push(t);
  return this;
}



Object.size = function(obj) {
    var size = 0, key;
    for (key in obj) {
        if (obj.hasOwnProperty(key)) size++;
    }
    return size;
};

Object.push = function (obj){
    for (key in obj) {
        this.key= obj.key;
    }
}
