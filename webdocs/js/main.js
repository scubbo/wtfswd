//https://developers.google.com/maps/documentation/javascript/tutorial

$(document).ready(function() {
    window.Geocoder = new google.maps.Geocoder()
    window.directionsService = new google.maps.DirectionsService();

    $('#location2').keypress(function (e) {
        if (e.which == 13) {
            handleLocation2();
            return false;    //Prevent further propagation
        }
    });

    $('#useGeolocationCheckbox').click(function() {
        console.log('clicked the checkbox');
        active = $(this).prop('checked');
        //TODO: disable the first textbox if this is enabled
        if (!($('#geoLocationHiddenField').val())) {
            $('#mainButton').attr('disabled',true);
            if(navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(function(position) {
                    var pos = new google.maps.LatLng(position.coords.latitude,
                                                     position.coords.longitude);

                    $('#geoLocationHiddenField').val(pos.lat().toString() + ',' + pos.lng());
                    addMapCentredOnLocation(pos);
                    dropPinOnMap(pos);
                    $('#mainButton').attr('disabled',false);
                });
            }
        }
    });

    $('#centreMapButton').click(function() {
        printHiddenField();
    });

    $('#mainButton').click(function() {
        main();
    });

    $('#testButton').click(function() {
        var request = {
            origin:'Barbican',
            destination:'London Zoo',
            travelMode: google.maps.TravelMode.TRANSIT
        };

        window.directionsService.route(request, function(result, status) {
            if (status == google.maps.DirectionsStatus.OK) {
                console.log(result);
                console.log('Found ' + result.routes.length.toString() + ' route(s)');
                for (var i = 0; i<result.routes.length; i++) {
                    route = result.routes[i];
                    routeLength = 0;
                    for (var j = 0; j<route.legs.length; j++) {
                        routeLength += route.legs[j].duration.value;
                    }
                    console.log('Length of route ' + i.toString() + ': ' + routeLength + 'seconds');
                }
            }
        });
    });
});

function addMapCentredOnLocation(pos) {
    mapDiv = $('#mapDiv');
    
    var mapOptions = {
          center: pos,
          zoom: 14
        };
    var map = new google.maps.Map(mapDiv.get(0),
            mapOptions);

    window.currentMap = map
}

function dropPinOnMap(pos) {
    var marker = new google.maps.Marker({
        map: window.currentMap,
        position: pos,
    //    icon: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png',
    //    draggable: true,
        animation: google.maps.Animation.DROP
    });
}

function handleLocation2() {
    location2Text = $('#location2').val();

    window.Geocoder.geocode({
                        address:location2Text
                     },
                     function(results, status) {
        if (status == google.maps.GeocoderStatus.OK) {
            window.location2 = results[0].geometry.location;
            var marker = new google.maps.Marker({
                map: window.currentMap,
                position: results[0].geometry.location
            });
        } else {
            alert('Something fucking went wrong with geocoding: ' + status);
        }
    });

}

function printHiddenField() {
    console.log($('#geoLocationHiddenField').val());
    console.log($('#geoLocationHiddenField').val().split(','));
    console.log($('#geoLocationHiddenField').val().split(',').map(function(cur,ind,ar){return parseFloat(cur)}));
}

function main() {

    var latLngs = [];

    if ($('#useGeolocationCheckbox').prop('checked')) {
        //TODO: delay to check that the hidden field is actually populated
        while (!($('#geoLocationHiddenField').val())) {
            //TODO: give 'em some fancy "waiting" animation
            setTimeout(100);
        }
        latLngArray = $('#geoLocationHiddenField').val().split(',').map(function(cur,ind,ar){return parseFloat(cur)});
        latLng = new google.maps.LatLng(latLngArray[0],latLngArray[1]);
        latLngs.push(latLng);
        var marker = new google.maps.Marker({
            map: window.currentMap,
            position: latLng
        });
    } else {
        location1Text = $('#location1').val();
        window.Geocoder.geocode({
                            address:location1Text
                         },
                         function(results, status) {
            if (status == google.maps.GeocoderStatus.OK) {
                latLngs.push(results[0].geometry.location);
                var marker = new google.maps.Marker({
                    map: window.currentMap,
                    position: results[0].geometry.location
                });
            } else {
                alert('Something fucking went wrong with geocoding: ' + status);
            }
        });
    }

    location2Text = $('#location2').val();

    window.Geocoder.geocode({
                        address:location2Text
                     },
                     function(results, status) {

        if (status == google.maps.GeocoderStatus.OK) {

            latLngs.push(results[0].geometry.location);
            //window.currentMap.setCenter(results[0].geometry.location);
            var marker = new google.maps.Marker({
                map: window.currentMap,
                position: results[0].geometry.location
            });

            //TODO: Do this properly (race condition)
            var north = Math.min(latLngs[0].lat(),latLngs[1].lat());
            var east = Math.max(latLngs[0].lng(),latLngs[1].lng());
            var south = Math.max(latLngs[0].lat(),latLngs[1].lat());
            var west = Math.min(latLngs[0].lng(),latLngs[1].lng());

            var bounds = new google.maps.LatLngBounds(new google.maps.LatLng(south, west), 
                                                  new google.maps.LatLng(north, east));
            window.currentMap.fitBounds(bounds);

            findMidpointCrow(latLngs);
        } else {
            alert('Something fucking went wrong with geocoding: ' + status);
        }
    });

}

function findMidpointCrow(latLngs){
    lat = (latLngs[0].lat() + latLngs[1].lat()) / 2;
    lng = (latLngs[0].lng() + latLngs[1].lng()) / 2;

    console.log(lat);
    console.log(lng);

    midpointLatLng = new google.maps.LatLng(lat,lng);

    console.log('test-1');
    console.log(midpointLatLng);

    var marker = new google.maps.Marker({
        map: window.currentMap,
        position: midpointLatLng,
        icon: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png',
        draggable: true,
        animation: google.maps.Animation.DROP
    });

    var line1 = new google.maps.Polyline({
        path: [latLngs[0],midpointLatLng],
        geodesic: true,
        strokeColor: '#888800',
        strokeOpacity: 1.0,
        strokeWeight: 4
    });

    var line2 = new google.maps.Polyline({
        path: [midpointLatLng,latLngs[1]],
        geodesic: true,
        strokeColor: '#888800',
        strokeOpacity: 1.0,
        strokeWeight: 4
    });

    line1.setMap(window.currentMap);
    line2.setMap(window.currentMap);

    google.maps.event.addListener(marker, 'dragend', function() 
    {
        dragEndMidpointMarker(latLngs);
    });

    google.maps.event.addListener(marker,'drag',function(event) {
        line1.setPath([latLngs[0],event.latLng]);
        line2.setPath([event.latLng,latLngs[1]]);
        distance1 = distance(latLngs[0],event.latLng);
        distance2 = distance(event.latLng,latLngs[1]);
        grads = redBlueGradient(distance1,distance2);
        line1.setOptions({strokeColor:grads[0]});
        line2.setOptions({strokeColor:grads[1]});
    });

}

function redBlueGradient(num1,num2) {
    total = num1 + num2;
    str1 = '#' + Math.round(num1 * 1.0 * 255 / total).toString(16) + Math.round(255*(num2 * 1.0) / total).toString(16) + '00';
    str2 = '#' + Math.round(num2 * 1.0 * 255 / total).toString(16) + Math.round(255*(num1 * 1.0) / total).toString(16) + '00';
    return [str1,str2];

}

function distance(point1,point2) {
    // Using ythagorus because we won't be dealing with distances large enough that curvature matters
    return Math.sqrt(Math.pow((point1.lat() - point2.lat()),2) + Math.pow((point1.lng() - point2.lng()),2));
}
