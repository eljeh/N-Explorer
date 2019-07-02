(function ($) {

  Drupal.behaviors.poiMap = {
    attach: function (context, settings) {

      var markersLoaded = true;
      var community_name = Drupal.settings.community_name;
      var community_address = Drupal.settings.community_address;
      var community_lat = Drupal.settings.community_lat;
      var community_lon = Drupal.settings.community_lon;
      var map, places, iw;
      var markers = [];
      var hostnameRegexp = new RegExp('^https?://.+?/');

      $('.poi-button').click(function () {
        if ($(this).hasClass('active')) return;
        $('.poi-button').removeClass('active');
        $(this).addClass('active');
        clearMarkers();
        search($(this).data('poi-category'));
      });

      $('#directions-from-address').keypress(function (e) {
        if (e.which == 13) {
          $('.map-on-google').click();
          return false;
        }
      });

      $('.map-on-google').click(function () {
        window.open('https://www.google.com/maps/dir/' + encodeURIComponent($('#directions-from-address').val()) + '/' + encodeURIComponent(community_address.replace(/(<([^>]+)>)/ig, '')));
      });

      //initialize();
      google.maps.event.addDomListener(window, 'load', initialize);
      google.maps.event.addDomListener(window, "resize", function () {
        var center = map.getCenter();
        google.maps.event.trigger(map, "resize");
        map.setCenter(center);
      });

      function initialize() {

        var styles = [
          {
            stylers: [
              { lightness: 10 },
              { saturation: -25 }
            ]
          },
          {
            featureType: "road",
            elementType: "geometry",
            stylers: [
              { lightness: 100 },
              { visibility: "simplified" }
            ]
          },
          {
            featureType: "road",
            elementType: "labels",
            stylers: [
              { lightness: 50 }
            ]
          },
          // remove default POI markers to hide competitor properties
          {
            featureType: "poi",
            elementType: "labels",
            stylers: [
              { visibility: "off" }
            ]
          }
        ];

        var styledMap = new google.maps.StyledMapType(styles, { name: "Styled Map" });

        var myLatlng = new google.maps.LatLng(community_lat, community_lon);
        var myOptions = {
          zoom: 14,
          center: myLatlng,
          mapTypeIds: [google.maps.MapTypeId.ROADMAP, 'map_style'],
          streetViewControlOptions: { position: google.maps.ControlPosition.RIGHT_BOTTOM },
          mapTypeControlOptions: { position: google.maps.ControlPosition.LEFT_BOTTOM },
          zoomControl: false
        }
        map = new google.maps.Map(document.getElementById("poi-map-canvas"), myOptions);
        map.mapTypes.set('map_style', styledMap);
        map.setMapTypeId('map_style');
        var community_icon = { url: '/sites/all/modules/bre_custom/bre_community_poi_map/img/community-marker.png' };
        var community_marker = new google.maps.Marker({
          position: myLatlng,
          map: map,
          title: community_name,
          icon: community_icon
        });
        var community_marker_InfoWindow = new google.maps.InfoWindow({
          content: '<h3>' + community_name + '</h3><div>' + community_address + '</div>'
        });
        google.maps.event.addListener(community_marker, 'click', function () {
          community_marker_InfoWindow.setContent(community_marker_InfoWindow.content);
          community_marker_InfoWindow.open(map, this);
        });
        places = new google.maps.places.PlacesService(map);
        google.maps.event.addListener(map, 'tilesloaded', tilesLoaded);


        var zoomControlDiv = document.createElement('div');
        var zoomControl = new ZoomControl(zoomControlDiv, map);

        zoomControlDiv.index = 1;
        map.controls[google.maps.ControlPosition.TOP_LEFT].push(zoomControlDiv);


      }

      function tilesLoaded() {
        google.maps.event.clearListeners(map, 'tilesloaded');
        google.maps.event.addListener(map, 'zoom_changed', search);
        google.maps.event.addListener(map, 'dragend', search);
        //search();
      }

      function search(poiCategory) {
        markersLoaded = false;
        var type = poiCategory;
        // for (var i = 0; i < document.controls.type.length; i++) {
        //   if (document.controls.type[i].checked) {
        //     type = document.controls.type[i].value;
        //   }
        // }
        //autocomplete.setBounds(map.getBounds());
        var search = {
          bounds: map.getBounds()
        };

        if (type != 'establishment') {
          search.types = [type];
        } else {
          search.types = ['bakery', 'cafe', 'food', 'restaurant'];
        }

        switch (type) {
          case 'restaurant_cafe':
            search.types = ['cafe', 'restaurant'];
            marker_icon = '/sites/all/modules/bre_custom/bre_community_poi_map/img/pin_restaurant.png';
            break;
          case 'grocery_or_supermarket':
            search.types = ['grocery_or_supermarket'];
            marker_icon = '/sites/all/modules/bre_custom/bre_community_poi_map/img/pin_grocery.png';
            break;
          case 'atm':
            search.types = ['atm'];
            marker_icon = '/sites/all/modules/bre_custom/bre_community_poi_map/img/pin_bank.png';
            break;
          case 'medical':
            search.types = ['doctor', 'hospital'];
            marker_icon = '/sites/all/modules/bre_custom/bre_community_poi_map/img/pin_medical.png';
            break;
          case 'school':
            search.types = ['school'];
            marker_icon = '/sites/all/modules/bre_custom/bre_community_poi_map/img/pin_schools.png';
            break;
          case 'transportation':
            search.types = ['airport', 'bus_station', 'subway_station', 'taxi_stand', 'train_station', 'transit_station'];
            marker_icon = '/sites/all/modules/bre_custom/bre_community_poi_map/img/pin_transit.png';
            break;
          case 'parks_recreation':
            search.types = ['park'];
            marker_icon = '/sites/all/modules/bre_custom/bre_community_poi_map/img/pin_parks.png';
            break;
          case 'entertainment':
            search.types = ['movie_theater', 'night_club', 'casino', 'bowling_alley', 'stadium'];
            marker_icon = '/sites/all/modules/bre_custom/bre_community_poi_map/img/pin_entertainment.png';
            break;
          case 'attractions':
            search.types = ['amusement_park', 'aquarium', 'casino', 'museum', 'stadium', 'zoo'];
            marker_icon = '/sites/all/modules/bre_custom/bre_community_poi_map/img/pin_attractions.png';
            break;
          default:
            search.types = [];
            marker_icon = '/sites/all/modules/bre_custom/bre_community_poi_map/img/pin.png';
        }

        if (search.types.length) {
          places.search(search, function (results, status) {
            if (status == google.maps.places.PlacesServiceStatus.OK) {
              clearMarkers();
              for (var i = 0; i < results.length; i++) {
                markers[i] = new MarkerWithLabel({
                  map: map,
                  icon: marker_icon,
                  labelClass: "mylabel",
                  position: results[i].geometry.location,
                  poiCategory: type
                });
                google.maps.event.addListener(markers[i], 'click', getDetails(results[i], i));
                setTimeout(dropMarker(i), i * 100);
              }
            }
          })
        }
        markersLoaded = true;
      }

      function clearMarkers() {
        for (var i = 0; i < markers.length; i++) {
          if (markers[i]) {
            markers[i].setMap(null);
            markers[i] == null;
          }
        }
      }

      function clearPOIMarkers(poiCategory) {
        for (var i = 0; i < markers.length; i++) {
          if (markers[i].poiCategory) {
            markers[i].setMap(null);
            markers[i] == null;
          }
        }
      }

      function dropMarker(i) {
        return function () {
          markers[i].setMap(map);
        }
      }

      function getDetails(result, i) {
        return function () {
          places.getDetails({
            reference: result.reference
          }, showInfoWindow(i));
        }
      }

      function showInfoWindow(i) {
        return function (place, status) {
          if (iw) {
            iw.close();
            iw = null;
          }

          if (status == google.maps.places.PlacesServiceStatus.OK) {
            iw = new google.maps.InfoWindow({
              content: getIWContent(place)
            });
            iw.open(map, markers[i]);
          }
        }
      }

      function getIWContent(place) {

        var address_components_long = {};
        var address_components_short = {};
        jQuery.each(place.address_components, function (k, v1) { jQuery.each(v1.types, function (k2, v2) { address_components_long[v2] = v1.long_name }); })
        jQuery.each(place.address_components, function (k, v1) { jQuery.each(v1.types, function (k2, v2) { address_components_short[v2] = v1.short_name }); })

        var content = '';
        content += '';
        content += '<div class="iw-content">';
        content += '  <h2 class="iw-header"><a target="_blank" href="' + place.url + '">' + place.name + '</a></h2>';
        content += '  <div class="iw-main group">';
        content += '    <div class="content">';
        content += '      <span class="address">' + address_components_long.street_number + ' ' + address_components_long.route + '</span>';
        content += '      <span class="locality">' + address_components_long.locality + ', ' + address_components_short.administrative_area_level_1 + ' ' + address_components_short.postal_code + '</span>';
        if (place.formatted_phone_number) {
          content += '      <span class="phone">' + place.formatted_phone_number + '</span>';
        }
        if (place.website) {
          var fullUrl = place.website;
          var website = hostnameRegexp.exec(place.website);
          if (website == null) {
            website = 'http://' + place.website + '/';
            fullUrl = website;
          }
          content += '      <span class="website"><a target="_blank" href="' + fullUrl + '">' + website + '</a></span>';
        }
        content += '    </div>    ';
        if (typeof place.photos !== 'undefined') {
          content += '    <div class="photo"><img src="' + place.photos[0].getUrl({ 'maxWidth': 100, 'maxHeight': 100 }) + '"></div>';
        }
        content += '  </div>';
        content += '  <div id="yelp" class="group">';
        content += '  </div>';
        content += '</div>';
        jQuery.get("/yelp/phone/" + place.formatted_phone_number.replace(/\D/g, ''), function (data) {
          if (data.total > 0) {
            var yelp = '';
            yelp += '<img class="yelp-rating" src="' + data.rating_img_url + '" />';
            yelp += '<img class="yelp-logo" src="/sites/all/modules/bre_custom/bre_yelp/includes/yelp.svg" />';
            yelp += '<a class="yelp-reviews" href="' + data.url + '" target="yelp_review">View ' + data.review_count + ' reviews &rsaquo;</a>';
            $('#yelp').html(yelp);
            $('#yelp').show();
          } else {
            $('.google-rating').show();
          }
        }, "json");
        return content;
      }

      function ZoomControl(controlDiv, map) {

        // Creating divs & styles for custom zoom control
        controlDiv.style.padding = '20px';

        // Set CSS for the control wrapper
        var controlWrapper = document.createElement('div');
        controlWrapper.style.cursor = 'pointer';
        controlWrapper.style.textAlign = 'center';
        controlWrapper.style.width = '50px';
        controlWrapper.style.height = '100px';
        controlDiv.appendChild(controlWrapper);

        // Set CSS for the zoomIn
        var zoomInButton = document.createElement('div');
        zoomInButton.style.width = '50px';
        zoomInButton.style.height = '50px';
        zoomInButton.style.marginBottom = '10px';
        //zoomInButton.style.opacity = '.5';
        zoomInButton.style.backgroundImage = 'url("/sites/all/modules/bre_custom/bre_community_poi_map/img/zoom-in-button.png")';
        controlWrapper.appendChild(zoomInButton);

        // Set CSS for the zoomOut
        var zoomOutButton = document.createElement('div');
        zoomOutButton.style.width = '50px';
        zoomOutButton.style.height = '50px';
        //zoomOutButton.style.opacity = '.5';
        zoomOutButton.style.backgroundImage = 'url("/sites/all/modules/bre_custom/bre_community_poi_map/img/zoom-out-button.png")';
        controlWrapper.appendChild(zoomOutButton);

        // Setup the click event listener - zoomIn
        google.maps.event.addDomListener(zoomInButton, 'click', function () {
          map.setZoom(map.getZoom() + 1);
        });

        // Setup the click event listener - zoomOut
        google.maps.event.addDomListener(zoomOutButton, 'click', function () {
          map.setZoom(map.getZoom() - 1);
        });
      }
    }
  }

})(jQuery);