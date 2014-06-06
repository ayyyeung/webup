var defaultPosition = { 'center': '37.427474,-122.169719', 'zoom': 18 };
var locationmap = null;
var numUsers = 0;
var myPosition = null;
var imageMapping = {};
var firstTime = true;
var saved_attendees = {};
var new_messages = 0;
var newAttendeeAlert = false;
var newMessageAlert = false;
var numNewAttendees = 0;
var directionsDisplay = null;

// on load
$(function() {
     $('#link').click(function(){
         var input = this;
         input.focus();
         input.setSelectionRange(0,999); 
     });

    function getPersonalInfo(fromParent) {
      $.getJSON('api/get_myself.php', function(data) {
        var att_length = Object.keys(data.attendees).length;
	console.log(att_length);
       var contents = "This is your position.";
	if (att_length == 1) {
	    console.log("asldkfjd");
            contents = '<b>Your status:</b> ' + data.attendees[0].message + '<br><em>Updated: ' + data.attendees[0].updated + '</em>';
	    console.log(contents);
            if (data.attendees[0].photo_exists) {
                contents += "<br><img src='api/get_picture.php?id=" + data.attendees[0].id + "' width='125' class='callout-img'/>";
            }
	}
        $('#main_map').gmap('openInfoWindow', { content: contents }, fromParent);
      });
    }

    $('#main_map').gmap({'center': defaultPosition.center, 'zoom': defaultPosition.zoom, 'disableDefaultUI': true, 'callback': function(map) {
        var self = this;
        locationmap = map;
        // location services
        self.watchPosition(function(position, status) {
            if ( status === 'OK' ) {
                // latlng will be the current position of the user
                var latlng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
                if (!self.get('markers').client) {
                    self.addMarker({ 'id': 'client', 'position': latlng, 'bounds': false }).click(function () {
			console.log("HER");
			getPersonalInfo(this);
                    });
                } else {
                    self.get('markers').client.setPosition(latlng);
                }

		// push position into server
                $.post("api/push_position.php", { lat: position.coords.latitude, long: position.coords.longitude }, function(data) {
		    myPosition = position;
		    if (firstTime) {
			updateCenter(position.coords.latitude, position.coords.longitude);
			firstTime = false;
		    }
                });		
            } else {
                //alert('You need to enable location services to use this app!')
            }
        });

    }});

    refreshMarkers(); 

    // login page
    $("#login").click(function() {
       $.post("api/login.php", {
           phone: $("#phone").val(),
           password: $("#password").val()  
       }, function(data) { // success
           window.location = "index.php#mainpage";
       }).fail(function(data) { // failure
           $("#login_status").html("You have entered a wrong phone # or password.");
       });;
    });
    
    $("#nav-btn").on('click', function(e) {
	if (directionsDisplay) {
	    directionsDisplay.setMap(null);
	    directionsDisplay = null;
	}
	updateCenter(myPosition.coords.latitude, myPosition.coords.longitude);
    });
    $("#nav-btn")
      .mousedown(function() {$(this).css("background-color","#8e8e8e");})
      .mouseup(function() {$(this).css("background-color", "transparent");});

});
$(document).on('pagebeforeshow', '#getlink', function() {
    $("#email").on('click', function(e) {
        e.stopImmediatePropagation();
        e.preventDefault();
        var link = $("#link").val();
        urri = 'mailto:?subject=MeetUp with me!&body=We can find each other with MeetUp!'+ '%0A%0A' + link;
        window.location=urri;
    });

});

$(document).on('pagebeforeshow', '#mainpage', function() {
	$(".count").hide();
});

$(document).on('pagebeforeshow', '#summarypage', function() {
    $(".count").hide();
    newAttendeeAlert = false;
    numNewAttendees = 0;
    $("#friendslist").html("");
    $('#friendslist').listview();
    $.getJSON('api/get_users.php', function(data) {
        var att_length = Object.keys(data.attendees).length;
        $.each(data.attendees, function (i, attendee) {

           var distance = "";
	    if (myPosition != null) {
	        var attendeeLatLng = new google.maps.LatLng(attendee.latitude, attendee.longitude);
	        var myLatLng = new google.maps.LatLng(myPosition.coords.latitude, myPosition.coords.longitude);
	        var numericalDistance = Math.round(google.maps.geometry.spherical.computeDistanceBetween(attendeeLatLng, myLatLng));
                distance = "~"+numericalDistance.toString() + "m";
	    } else {
	        distance = "Can't get exact distance";
	    }
            var contents = "<img src='" + imageMapping[attendee.id] + "' id='image" + attendee.id + "' " + "width='55' height='55'/>" + "<a href='tel:" + attendee.phone + "' id='call'>Call</a>" + "<a href='index.php#mainpage' onclick='updateCenterCheckDistance(" + attendee.latitude + "," + attendee.longitude + "," + numericalDistance + ")' class='friend-name'>" + attendee.username + "<div class='friend-status'>" + attendee.message + "<p style='font-size:11px;margin-top:2px'>Distance from you: " + distance + "</p></div></a>";
            var summarymessage = '<li class="ui-li-static ui-body-inherit ui-li-has-thumb';
            summarymessage += '" style="border-bottom: 1px solid lightgrey;height:30px;">' + contents  + '</li>';
            $('#friendslist').append(summarymessage);
	    	if (attendee.photo_exists) {
			$('#image' + attendee.id).attr("src", "api/get_picture.php?id=" + attendee.id);
	    }
        });
    });
    $('#friendslist').listview('refresh');
});

function updateCenterWithDirections(lat, lon) {    
    var map = $("#main_map").gmap("get", "map");
    map.setCenter(new google.maps.LatLng(lat, lon));
    var directionsService = new google.maps.DirectionsService();
    if (directionsDisplay) {
      directionsDisplay.setMap(null);
      directionsDisplay = null;
    }
    directionsDisplay = new google.maps.DirectionsRenderer();
    directionsDisplay.setMap(map);
    directionsDisplay.setOptions( { suppressMarkers: true } ); 
    console.log(myPosition);
    var dest = new google.maps.LatLng(lat, lon);
    var request = {
        origin:new google.maps.LatLng(myPosition.coords.latitude, myPosition.coords.longitude),
	destination:dest,
	travelMode: google.maps.TravelMode.WALKING
    };
    directionsService.route(request, function(result, status) {
      if (status == google.maps.DirectionsStatus.OK) {
	directionsDisplay.setDirections(result);
	map.setZoom(14);
	console.log("zoom: " + map.getZoom());
      }
    });
}

function updateCenterCheckDistance(lat, lon, dist) {
    if (directionsDisplay) {
	directionsDisplay.setMap(null);
	directionsDisplay = null;
    }
    if (dist > 100) {
	console.log("HERE");
	updateCenterWithDirections(lat, lon);
    } else {    
        var map = $("#main_map").gmap("get", "map");
        map.setCenter(new google.maps.LatLng(lat, lon));
    }
}
function updateCenter(lat, lon) {    
    var map = $("#main_map").gmap("get", "map");
    map.setCenter(new google.maps.LatLng(lat, lon));
}

function refreshMarkers() {

    var current_markers = $('#main_map').gmap('get','markers');

    $.getJSON('api/get_users.php', function(data) {
	numNewAttendees = numNewAttendees + data.attendees.length - Object.keys(saved_attendees).length;
	 
	if (numNewAttendees > 0) {
		newAttendeeAlert = true;
		$(".count").html("" + numNewAttendees);
		$(".count").show();
	}
	saved_attendees = {};
	$.each(data.attendees, function(i, attendee) {
	    	saved_attendees[attendee.id] = data.attendees[i];
	});

        $.each(data.attendees, function (i, attendee) {
	    if (attendee.id in saved_attendees) {
	      if (saved_attendees[attendee.id].message != attendee.message) {
	        newMessage++;
		newMessageAlert = true;
	      }
	    }
            var marker_key = 'marker_user_' + attendee.id;
            var contents = '<b>' + attendee.username + ':</b> ' + attendee.message + '<br><em>Updated: ' + attendee.updated + '</em>';
            if (attendee.photo_exists) {
                contents += "<br><img src='api/get_picture.php?id=" + attendee.id + "' width='125' class='callout-img' />";
            }
            if (marker_key in current_markers) {
		//console.log(current_markers[marker_key].getPosition().lat());
		//console.log("compared to: " + attendee.latitude);
                var lat_diff = Math.abs(current_markers[marker_key].getPosition().lat() - attendee.latitude);
		var lon_diff = Math.abs(current_markers[marker_key].getPosition().lng() - attendee.longitude);
		if (lat_diff > 0.00002 || lon_diff > 0.00002) {
                	current_markers[marker_key].setPosition(new google.maps.LatLng(attendee.latitude, attendee.longitude));
		}
                	google.maps.event.clearListeners(current_markers[marker_key], 'click');
                	google.maps.event.addListener(current_markers[marker_key], 'click', function() {
                    		$('#main_map').gmap('openInfoWindow', { content: contents }, this);
                	});
            } else {
		var prefix = "";
		numUsers += 1;
		if (numUsers % 3 == 1) {
		    prefix = "blue/";
		} else if (numUsers % 3 == 2) {
		    prefix = "purple/";
		} 
                var icon_name = "images/" + prefix + attendee.username.substring(0,1).toUpperCase() + ".png";
		var cur_id = attendee.id;
		imageMapping[cur_id] = icon_name; 
		console.log("addeddd" + imageMapping[cur_id]);
                $('#main_map').gmap('addMarker', { 
                    id: 'marker_user_' + attendee.id,
                    position: new google.maps.LatLng(attendee.latitude, attendee.longitude), 
                    bounds: false,
                    icon: icon_name 
                }).click(function() {
                    $('#main_map').gmap('openInfoWindow', { content: contents }, this);
                });
            }
        });

    });

    setTimeout(refreshMarkers, 2000);
}
