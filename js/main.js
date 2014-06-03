var defaultPosition = { 'center': '37.427474,-122.169719', 'zoom': 18 };
var locationmap = null;
var numUsers = 0;
var myPosition = null;

// on load
$(function() {
    //$("#link").attr('readonly', 'readonly');
     $('#link').click(function(){
         var input = this;
         input.focus();
         input.setSelectionRange(0,999); 
     });

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
                        $('#main_map').gmap('openInfoWindow', { content: 'This is your position' }, this);
                    });
                } else {
                    self.get('markers').client.setPosition(latlng);
                }

		// push position into server
                $.post("api/push_position.php", { lat: position.coords.latitude, long: position.coords.longitude }, function(data) {
		    myPosition = position;
		    updateCenter(position.coords.latitude, position.coords.longitude);
                    console.log("posting position " + data);
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
});
$(document).on('pagebeforeshow', '#getlink', function() {
    $("#email").on('click', function(e) {
        e.stopImmediatePropagation();
        e.preventDefault();
        var link = $("#link").val();
        urri = 'mailto:?subject=MeetUp with me!&body=Hey, come find me with MeetUp:'+ '%0A%0A' + link;
        window.location=urri;
    });

});
$(document).on('pagebeforeshow', '#summarypage', function() {
    console.log("runnin");
    $("#friendslist").html("");
    $('#friendslist').listview();
    $.getJSON('api/get_users.php', function(data) {
        var att_length = Object.keys(data.attendees).length;
        $.each(data.attendees, function (i, attendee) {
           var distance = "";
	    if (myPosition != null) {
	        var attendeeLatLng = new google.maps.LatLng(attendee.latitude, attendee.longitude);
	        var myLatLng = new google.maps.LatLng(myPosition.coords.latitude, myPosition.coords.longitude);
	        var calcDistance = Math.round(google.maps.geometry.spherical.computeDistanceBetween(attendeeLatLng, myLatLng));
                distance = calcDistance.toString() + "m";
	    } else {
	        distance = "Can't get exact distance";
	    }
            var contents = "<img src='api/get_picture.php?id=" + attendee.id + "' width='55' height='55'/>" + "<a href='index.php#mainpage' onclick='updateCenter(" + attendee.latitude + "," + attendee.longitude + ")' class='friend-name'>" + attendee.username + "<div class='friend-status'>" + attendee.message + "\nDistance from you: " + distance + "</div></a>";
            var summarymessage = '<li class="ui-li-static ui-body-inherit ui-li-has-thumb';
            summarymessage += '" style="border-bottom: 1px solid lightgrey">' + contents  + '</li>';
            console.log(summarymessage);
            $('#friendslist').append(summarymessage);
        });
    });
    $('#friendslist').listview('refresh');
});

function updateCenter(lat, lon) {    
    var map = $("#main_map").gmap("get", "map");
    map.setCenter(new google.maps.LatLng(lat, lon));
}

function refreshMarkers() {
    console.log("in refreshmarkers");

    var current_markers = $('#main_map').gmap('get','markers');

    $.getJSON('api/get_users.php', function(data) {
        $.each(data.attendees, function (i, attendee) {
            var marker_key = 'marker_user_' + attendee.id;
            var contents = attendee.username + ': ' + attendee.message + '<br><em>Updated: ' + attendee.updated + '</em>';
            if (attendee.photo_exists) {
                contents += "<br><img src='api/get_picture.php?id=" + attendee.id + "' width='125' />";
            }
            if (marker_key in current_markers) {
		//console.log(current_markers[marker_key].getPosition().lat());
		//console.log("compared to: " + attendee.latitude);
                var lat_diff = Math.abs(current_markers[marker_key].getPosition().lat() - attendee.latitude);
		var lon_diff = Math.abs(current_markers[marker_key].getPosition().lng() - attendee.longitude);
		//console.log(attendee.username + " " + attendee.latitude);
		//console.log(attendee.username + " " + attendee.longitude);
		//console.log(attendee.username + " lat diff: " + lat_diff + " lon diff: " + lon_diff);
		if (lat_diff > 0.00002 || lon_diff > 0.00002) {
                	current_markers[marker_key].setPosition(new google.maps.LatLng(attendee.latitude, attendee.longitude));
                	google.maps.event.clearListeners(current_markers[marker_key], 'click');
                	google.maps.event.addListener(current_markers[marker_key], 'click', function() {
                    		$('#main_map').gmap('openInfoWindow', { content: contents }, this);
                	});
		}
            } else {
		var prefix = "";
		numUsers += 1;
		if (numUsers % 4 == 1) {
		    prefix = "blue/";
		} else if (numUsers % 4 == 2) {
		    prefix = "purple/";
		} else if (numUsers % 4 == 3) {
		    prefix = "pink/";
		}
                var icon_name = "images/" + prefix + attendee.username.substring(0,1).toUpperCase() + ".png";
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
