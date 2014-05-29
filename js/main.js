var defaultPosition = { 'center': '37.427474,-122.169719', 'zoom': 15 };

// on load
$(function() {

    $('#main_map').gmap({'center': defaultPosition.center, 'zoom': defaultPosition.zoom, 'disableDefaultUI': true, 'callback': function(map) {
        var self = this;

        // location services
        self.watchPosition(function(position, status) {
            if ( status === 'OK' ) {
                // latlng will be the current position of the user
                var latlng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
                if (!self.get('markers').client) {
                    self.addMarker({ 'id': 'client', 'position': latlng, 'bounds': true, icon: 'images/myposition.png' }).click(function () {
                        $('#main_map').gmap('openInfoWindow', { content: 'This is your position' }, this);
                    });
                } else {
                    self.get('markers').client.setPosition(latlng);
                }

		// push position into server
                $.post("api/push_position.php", { lat: position.coords.latitude, long: position.coords.longitude }, function(data) {
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
           window.location = "index.html#mainpage";
       }).fail(function(data) { // failure
           $("#login_status").html("You have entered a wrong phone # or password.");
       });;
    });

});

$(document).on('pagebeforeshow', '#summarypage', function() {
    console.log("runnin");
    $("#friendslist").html("");
    $('#friendslist').listview();
    $.getJSON('api/get_users.php', function(data) {
        var att_length = Object.keys(data.attendees).length;
        var counter = 0;
        $.each(data.attendees, function (i, attendee) {
            var contents = "<img src='api/get_picture.php?id=" + attendee.id + "' width='100' height='100'/>" + "<a href='index.html#mainpage'>" + attendee.username + ": " + attendee.message + "</a>";
            var summarymessage = '<li class="ui-li-static ui-body-inherit ui-li-has-thumb';
            if (counter == 0) {
                //summarymessage += ' ui-first-child';
            } else if (counter == (att_length - 1)) {
                //summarymessage += ' ui-last-child';
            }
            summarymessage += '" style="border-bottom: 1px solid lightgrey">' + contents  + '</li>';
            counter += 1;
            console.log(summarymessage);
            $('#friendslist').append(summarymessage);
        });
    });
    $('#friendslist').listview('refresh');
});

function updateCenter(lat, lon) {
    console.log("here");
    defaultPosition = { 'center': lat + ',' + lon, 'zoom': 15 };
}

function refreshMarkers() {
    var current_markers = $('#main_map').gmap('get','markers');

    $.getJSON('api/get_users.php', function(data) {
        $.each(data.attendees, function (i, attendee) {
            var marker_key = 'marker_user_' + attendee.id;
            var contents = attendee.username + ': ' + attendee.message + '<br><em>Updated: ' + attendee.updated + '</em>';
            if (attendee.photo_exists) {
                contents += "<br><img src='api/get_picture.php?id=" + attendee.id + "' width='200' />";
            }
            if (marker_key in current_markers) {
                current_markers[marker_key].setPosition(new google.maps.LatLng(attendee.latitude, attendee.longitude));
                google.maps.event.clearListeners(current_markers[marker_key], 'click');
                google.maps.event.addListener(current_markers[marker_key], 'click', function() {
                    $('#main_map').gmap('openInfoWindow', { content: contents }, this);
                });
            } else {
                $('#main_map').gmap('addMarker', { 
                    id: 'marker_user_' + attendee.id,
                    position: new google.maps.LatLng(attendee.latitude, attendee.longitude), 
                    bounds: true 
                }).click(function() {
                    $('#main_map').gmap('openInfoWindow', { content: contents }, this);
                });
            }
        });
    });

    console.log($('#main_map').gmap('get','markers'));

    setTimeout(refreshMarkers, 2000);
}
