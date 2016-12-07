// the game itself
var game;
// the spinning wheel
var wheel; 
// can the wheel spin?
var canSpin;
// slices (prizes) placed in the wheel
var slices = 8;
//array for different food, starting from 12 o'clock going clockwise
var slicefood = ["Korean", "Japanese", "Chinese", "Burgers", "Seafood", "Pizza", "Italian", "American"];
// food you chose
var food;
// text field where food is choosen
var foodText;
 
function wheeler(){
     // creation of a 500x500 wheel
	game = new Phaser.Game(458, 488, Phaser.AUTO, "");
     // adding "PlayGame" state
     game.state.add("PlayGame",playGame);
     // launching "PlayGame" state
     game.state.start("PlayGame");
};
 
// PLAYGAME STATE
	
var playGame = function(game){};
 
playGame.prototype = {
     // function to be executed once the state preloads
     preload: function(){
          // preloading graphic assets
          game.load.image("wheel", "assets/images/wheel.png");
		game.load.image("pin", "assets/images/pin.png");     
     },
     // funtion to be executed when the state is created
  	create: function(){
           // giving some color to background
          game.stage.backgroundColor = "#880044";
          // adding the wheel in the middle of the canvas
  		wheel = game.add.sprite(game.width / 2, game.width / 2, "wheel");
          // setting wheel registration point in its center
          wheel.anchor.set(0.5);
          // adding the pin in the middle of the canvas
          var pin = game.add.sprite(game.width / 2, game.width / 2, "pin");
          // setting pin registration point in its center
          pin.anchor.set(0.5);
          // adding the text field
          foodText = game.add.text(game.world.centerX, 480, "");
          // setting text field registration point in its center
          foodText.anchor.set(0.5);
          // aligning the text to center
          foodText.align = "center";
          // the game has just started = we can spin the wheel
          canSpin = true;
          // waiting for your input, then calling "spin" function
          game.input.onDown.add(this.spin, this);		
	},
     // function to spin the wheel
     spin(){
          // can we spin the wheel?
          if(canSpin){  
               // resetting text field
               foodText.text = "";
               // the wheel will spin round from 2 to 4 times. This is just coreography
               var rounds = game.rnd.between(2, 4);
               // then will rotate by a random number from 0 to 360 degrees. This is the actual spin
               var degrees = game.rnd.between(0, 360);
               // before the wheel ends spinning, we already know the prize according to "degrees" rotation and the number of slices
               food = slices - 1 - Math.floor(degrees / (360 / slices));
               // now the wheel cannot spin because it's already spinning
               canSpin = false;
               // animation tweeen for the spin: duration 3s, will rotate by (360 * rounds + degrees) degrees
               // the quadratic easing will simulate friction
               var spinTween = game.add.tween(wheel).to({
                    angle: 360 * rounds + degrees
               }, 3000, Phaser.Easing.Quadratic.Out, true);
               // once the tween is completed, call winPrize function
               spinTween.onComplete.add(this.getfood, this);
          }
     },
     // function to assign the food
     getfood(){
          // now we can spin the wheel again
          canSpin = true;
          // display food
          foodText.text = slicefood[food];
     }
}
//$(document).ready(wheeler)





//create empty array to store zip code entered
var zip = [];

//==========create the form for user to enter the zip code===========
//add event listener to the div addAnime
$("#Addzip").on('click', function(){

	//creating variable to input typed in the textbox
	var zipcode = $("#zip-input").val().trim();

	//new anime entered added to the end of array
	zip.push(zipcode);

	//console log zip after zip code entered
	console.log(zip);

	//prevent page to refresh
	return false;
});



//==========google map API==========
//create variable for food search
var service;

function processResults(results, status){
	console.log(results);
for (var i = 0; i<results.length; i++) {
     var marker = new google.maps.Marker({
          position: results[i].geometry.location,
          map: map
        });
	}
}

//
function initMap(location) {

		console.log(location);

        // Create a map object and specify the DOM element for display.
        var currentlocation = {lat: location.coords.latitude, lng: location.coords.longitude}
        var map = new google.maps.Map(document.getElementById('map'), {
          center: currentlocation,
          scrollwheel: false,
          zoom: 12
        });

        var marker = new google.maps.Marker({
          position: currentlocation,
          map: map
        });

        service = new google.maps.places.PlacesService(map);
        service.nearbySearch({
    	location: currentlocation,
    	radius: 500,
        }, processResults);
      };

$(document).ready(function(){
	navigator.geolocation.getCurrentPosition(initMap);
});