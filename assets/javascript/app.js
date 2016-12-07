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

//========request data from URL and grab appropriate information======
//create a specific function to display google map in response to the zip code entered
function zipcode() {
	
	//clear previous map and iput
	$("#zip-iput").empty();
	$("#googlemap").empty();

	//constructing the queryURL
	APikey ="AIzaSyA3WjE2RZUtl1Tz-dP8-rthqZVAfox_Ztg";
	queryURL=

	//AJAX request from google map
	$.ajax({url:queryURL, method: "GET"
		
		//get results from request
		}).done(function(response){
			console.log(queryURL);
			console.log(response);

		})
