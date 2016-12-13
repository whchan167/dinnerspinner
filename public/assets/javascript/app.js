//setting variables for wheels' color and type of restaurants
var colors = ["#B8D430", "#3AB745", "#029990", "#3501CB",
             "#2E2C75", "#673A7E", "#CC0071", "#F80120",
             "#F35B20", "#FB9A00", "#FFCC00", "#FEF200","#FB9A00", "#FFCC00"];

var restaurants = ["Korean", "Indian", "Italian", "Sandwiches","Burgers", "Breakfast",
                   "Mexican", "Caribbean","Vietnamese", "Chinese",
                   "Seafood", "Pizza", "Thai", "Japanese"];
var startAngle = 0;
var arc = Math.PI / 6;
var spinTimeout = null;
var spinArcStart = 10;
var spinTime = 0;
var spinTimeTotal = 0;
var ctx;
 
//the wheel was created by canvas   
function drawRouletteWheel() {
  var canvas = document.getElementById("canvas");
  if (canvas.getContext) {
    var outsideRadius = 200;
    var textRadius = 160;
    var insideRadius = 125;
   
    ctx = canvas.getContext("2d");
    ctx.clearRect(0,0,500,500);
   
   
    ctx.strokeStyle = "black";
    ctx.lineWidth = 2;
   
    ctx.font = 'bold 12px Helvetica, Arial';
   
    for(var i = 0; i < 12; i++) {
      var angle = startAngle + i * arc;
      ctx.fillStyle = colors[i];
     
      ctx.beginPath();
      ctx.arc(250, 250, outsideRadius, angle, angle + arc, false);
      ctx.arc(250, 250, insideRadius, angle + arc, angle, true);
      ctx.stroke();
      ctx.fill();
     
      ctx.save();
      ctx.shadowOffsetX = -1;
      ctx.shadowOffsetY = -1;
      ctx.shadowBlur    = 0;
      ctx.shadowColor   = "rgb(220,220,220)";
      ctx.fillStyle = "black";
      ctx.translate(250 + Math.cos(angle + arc / 2) * textRadius,
                    250 + Math.sin(angle + arc / 2) * textRadius);
      ctx.rotate(angle + arc / 2 + Math.PI / 2);
      var text = restaurants[i];
      ctx.fillText(text, -ctx.measureText(text).width / 2, 0);
      ctx.restore();
    }
   
    //Arrow
    ctx.fillStyle = "black";
    ctx.beginPath();
    ctx.moveTo(250 - 4, 250 - (outsideRadius + 5));
    ctx.lineTo(250 + 4, 250 - (outsideRadius + 5));
    ctx.lineTo(250 + 4, 250 - (outsideRadius - 5));
    ctx.lineTo(250 + 9, 250 - (outsideRadius - 5));
    ctx.lineTo(250 + 0, 250 - (outsideRadius - 13));
    ctx.lineTo(250 - 9, 250 - (outsideRadius - 5));
    ctx.lineTo(250 - 4, 250 - (outsideRadius - 5));
    ctx.lineTo(250 - 4, 250 - (outsideRadius + 5));
    ctx.fill();
  }
}
   
function spin() { 
  spinAngleStart = Math.random() * 10 + 10;
  spinTime = 0;
  spinTimeTotal = Math.random() * 3 + 4 * 1000;
  rotateWheel();
}
function rotateWheel() {
  spinTime += 20;
  if(spinTime >= spinTimeTotal) {
    stopRotateWheel();
    return;
  }
  var spinAngle = spinAngleStart - easeOut(spinTime, 0, spinAngleStart, spinTimeTotal);
  startAngle += (spinAngle * Math.PI / 180);
  drawRouletteWheel();
  spinTimeout = setTimeout('rotateWheel()', 30);
}
function stopRotateWheel() {
  clearTimeout(spinTimeout);
  var degrees = startAngle * 180 / Math.PI + 90;
  var arcd = arc * 180 / Math.PI;
  var index = Math.floor((360 - degrees % 360) / arcd);
  ctx.save();
  ctx.font = 'bold 30px Helvetica, Arial';
  var text = restaurants[index]
  ctx.fillText(text, 250 - ctx.measureText(text).width / 2, 250 + 10);
  ctx.restore();
  yelpsearch(restaurants[index], address);
}
function easeOut(t, b, c, d) {
  var ts = (t/=d)*t;
  var tc = ts*t;
  return b+c*(tc + -3*ts + 3*t);
}


//==========google map API==========
//create variable for coordinates
var address;
var map;
var service;
var markers = [];

//
function initMap() {
		      //create geocoder to get coordinates
		      var geocoder = new google.maps.Geocoder();

          // Create a map object and specify the DOM element for display.
          map = new google.maps.Map(document.getElementById('map'), {
          center: {lat: 29.7051, lng: -95.4018},
          scrollwheel: false,
          zoom: 13
          });

        $("#submit").on("click", function(){
          //store the address in variable
          address = document.getElementById('address').value;
          
          //initialize the geocoding function to pinpoint the address.
          geocodeAddress(geocoder, map);
          
          //once click the button, the wheel spins
          spin();

          //empty the previous restaurant display
          $("#restaurantlist").empty();

          //clear all markers on the map
          for (var i=0; i<markers.length; i++) {
          markers[i].setMap(null);
          }

          //the page will not refresh
          return false;
          });
         }

//geocoding function from google map API
function geocodeAddress(geocoder, resultsMap) {
        geocoder.geocode({'address': address}, function(results, status) {
            if (status === 'OK') {
            resultsMap.setCenter(results[0].geometry.location);

                marker = new google.maps.Marker({
                map: resultsMap,
                position: results[0].geometry.location
            });
          }
        });
      };

//query yelp search API
function yelpsearch(restaurant, location){
    //query url and grab the response from yelp API
    var yelpURL = "http://localhost:5000/yelp/search?term=" + encodeURIComponent(restaurant) + "&food&restaurant&location=" + encodeURIComponent(location) + "&limit=20";
    $.ajax({url: yelpURL, method: "GET"
          }).done(function(response){
             console.log(response);
             console.log(yelpURL);

             
             //function add pins and table
             //for loop over results until 3 results (0-2)
             //for each result add pin to google map and create a table row and append to table in html

             //use for loop to loop through each item
             for (var i=0; i<response.businesses.length; i++) {


             //store the restaurant data in variable
             var restname = $("<p>").text("Name: " + response.businesses[i].name);
             var restaddress =$("<p>").text("Address: " + response.businesses[i].location.display_address);
             var restphone = $("<p>").text("Phone: " + response.businesses[i].display_phone);
             //create class for spaces and layout of results in css

            //create a div tag to store each restaurant data:
            var restaurantDiv = $("<div class=restDiv>");

            //create rating image tag to store image
            var ratingimage = $("<img>");

            //set attribute to rating image tag
            ratingimage.attr("src", response.businesses[i].rating_img_url_small);
            //find out in api if you can receive text for rating and create own star system

            //create restaurant image tag to store image
            var restaurantimage = $("<img class='resimage'>");


            //set attribute to image tag
            restaurantimage.attr("src", response.businesses[i].image_url); 

            //append the restuarant data to restaurant Div
            restaurantDiv.append(restaurantimage);

            restaurantDiv.append(ratingimage); 
            restaurantDiv.append(restname);
            restaurantDiv.append(restaddress);
            restaurantDiv.append(restphone);
          
            //prepend restaurantDiv to the restaurantlist in html
            $("#restauranttable").prepend(restaurantDiv);

            //markers to pinpoints all restuarant locations on the restaurant list.
            marker = new google.maps.Marker({
            position: {lat: response.businesses[i].location.coordinate.latitude, lng: response.businesses[i].location.coordinate.longitude},
            map: map
            });

            //push marker to the global markers array and later used to clear all markers on map
            markers.push(marker);

            //add event listener to display infobox when click on the 
          }
        });
      }

//start the page with the display of the wheel and google map
$(document).ready(drawRouletteWheel,initMap);
