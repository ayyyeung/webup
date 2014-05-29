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
            } else {
                //alert('You need to enable location services to use this app!')
            }
        });

    }});

    refreshMarkers(); 
});

function refreshMarkers() {
    var current_markers = $('#main_map').gmap('get','markers');

    $.getJSON('js/testdata/event_attendees.json', function(data) {
        $.each(data.attendees, function (i, attendee) {
            var marker_key = 'marker_user_' + attendee.id;

            if (marker_key in current_markers) {
                current_markers[marker_key].setPosition(new google.maps.LatLng(attendee.latitude, attendee.longitude));
                google.maps.event.clearListeners(current_markers[marker_key], 'click');
                google.maps.event.addListener(current_markers[marker_key], 'click', function() {
                    $('#main_map').gmap('openInfoWindow', { content: 'Hello World! This is ' + attendee.username + ' with updated message ' + attendee.message }, this);
                })
            } else {
                $('#main_map').gmap('addMarker', { 
                    id: 'marker_user_' + attendee.id,
                    position: new google.maps.LatLng(attendee.latitude, attendee.longitude), 
                    bounds: true 
                }).click(function() {
                    $('#main_map').gmap('openInfoWindow', { content: 'Hello World! This is ' + attendee.username + ' with message ' + attendee.message }, this);
                });
            }
        });
    });

    console.log($('#main_map').gmap('get','markers'));

    setTimeout(refreshMarkers, 30000);
}