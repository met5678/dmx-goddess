var device = require('./device');
var w = 18;
var h = 9;

var mapping = 
  [ 0 , 98, 0 , 0 , 0 , 0 , 0 ,116, 0 , 0 ,107, 0 , 0 , 0 , 0 , 0 , 89, 0 ,
    68, 97, 0 , 0 , 0 , 0 , 0 ,115, 61, 54,106, 0 , 0 , 0 , 0 , 0 , 88, 47,
    67, 96, 0 , 0 , 0 , 0 , 0 ,114, 60, 53,105, 0 , 0 , 0 , 0 , 0 , 87, 46,
    66, 95, 19, 0 , 0 , 0 , 32,113, 59, 52,104, 24, 0 , 0 , 0 , 37, 86, 45,
    65, 94, 18, 72, 9 , 76, 31,112, 58, 51,103, 23, 4 , 14, 80, 36, 85, 44,
    64, 93, 17, 71, 8 , 75, 30,111, 57, 50,102, 22, 3 , 13, 79, 35, 84, 43,
    63, 92, 16, 70, 7 , 74, 29,110, 56, 49,101, 21, 2 , 12, 78, 34, 83, 42,
    62, 91, 15, 69, 6 , 73, 28,109, 55, 48,100, 20, 1 , 11, 77, 33, 82, 41,
    0 , 90, 0 , 0 , 5 , 0 , 0 ,108, 0 , 0 , 99, 0 , 0 , 10, 0 , 0 , 81, 0 ];


var questions = require('questions');

var curChannel = 0;
var channels = [];


var askQuestion = function() {
  questions.askOne({ info:'Channel #' }, function(result){
    curChannel = Number(result-1);
    doTestChannel();
    askQuestion();
  });
}

askQuestion();

var doTestChannel = function() {
  console.log(curChannel);
  for(var led=0; led < 120; led++) {
    var a = led*3;
    if(curChannel == led) {
      channels[a+0] = 0xFF;
      channels[a+1] = 0xFF;
      channels[a+2] = 0xFF;
    }
    else {
      channels[a+0] = 0;
      channels[a+1] = 0;
      channels[a+2] = 0;
    }
  } 
  device.setValues(channels);
  curChannel++;
};
