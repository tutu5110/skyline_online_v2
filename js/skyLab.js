function loadSkyLab(){
	var stockNames = ['sz002007','us_chad'];
	 var s = new SKYDataLoader([stockNames[0],stockNames[1]],
    {"duration":"2y",
    "div":"mainGraph",
    "graphType" : 'skylab',
    "zoomLevel": 7,
    "showgraph" :  true,
    "updateRealtime":false},99999); 
    s.createGraph();
    graphData[99999] = s;
}

function updateSkyLab(stocks){
    var stockNames = formatStockNames(stocks);
     var s = new SKYDataLoader([stockNames[0],stockNames[1]],
    {"duration":"2y",
    "div":"mainGraph",
    "graphType" : 'skylab',
    "zoomLevel": 7,
    "updateOnly": true,
    "showgraph" :  true,
    "updateRealtime":false},99999); 
    s.createGraph();
    graphData[99999] = s;
}

function formatSkylabLegend(){
	return 'haha stupid';
}