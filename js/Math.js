function getStandardDeviation(values){
  var avg = getAverage(values);

  var squareDiffs = values.map(function(value){
    var diff = value - avg;
    var sqrDiff = diff * diff;
    return sqrDiff;
  });

  var avgSquareDiff = getAverage(squareDiffs);

  var stdDev = Math.sqrt(avgSquareDiff);
  return stdDev;
}

function getAverage(data){
  var sum = data.reduce(function(sum, value){
    return sum + value;
  }, 0);

  var avg = sum / data.length;
  return avg;
}

function getMovingAverage(data, MovingAverageParamLength){
    var arr = new Array();
    for(var i = 0 ;i < data.length; i ++){
        if(i < MovingAverageParamLength)
          arr.push(0);
        else
          arr.push(parseFloat(getSum(data,i - MovingAverageParamLength,i)/MovingAverageParamLength));
    }
    return arr;
}

function getSum(data,begin,end){
  var sum = 0;
  for(var i = begin; i < end; i ++)
    sum += parseFloat(data[i]);
  return sum;
}
