function MarkerManager(map, placeService, infoWindowManager) {
    var _self = this;
    this._map = map;
    this._placeService = placeService;
    this._infoWindowManager = infoWindowManager;

    this._makers = [];
    this._openInfoWindow = null;

    this._closeOpenMarker = function () {
        if (this._openInfoWindow != null) this._openInfoWindow.close();
    }

    this.clearMarkers = function () {
        for (var i = 0; i < this._makers.length; i++) {
            this._markers[i].setMap(null);
        }
        this._markers = [];
    }

    this.createMarker = function (place, iconUrl) {
        var marker = new google.maps.Marker({
            map: _self._map,
            position: place.geometry.location,
            animation: google.maps.Animation.DROP,
            icon: {
                url: iconUrl,
                scaledSize: new google.maps.Size(20, 20),
            },
        });

        marker.addListener('click', function () {
            _self._closeOpenMarker();

            _self._placeService.getDetails({ reference: place.reference }, function (placeDetails) {
                var infowindow = new google.maps.InfoWindow({
                    content: _self._infoWindowManager.createInfoWindowContent(placeDetails)
                });
                _self._openInfoWindow = infowindow;
                infowindow.open(_self._map, marker);
            });
        });

        this._markers.push(marker);
    }

}