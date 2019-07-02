function InfoWindowManager(template) {

    this._template = template;

    this.createInfoWindowContent = function (place) {
        return this._template
            .replace(/{{PHOTO_URL}}/g, this._getPhoto(place))
            .replace(/{{NAME}}/g, place.name)
            .replace(/{{RATINGS}}/g, this._getRatings(place))
            .replace(/{{OPEN_NOW}}/g, this._getOpenNow(place))
            .replace(/{{ADDRESS}}/g, place.formatted_address)
            .replace(/{{PHONE}}/g, this._getPhone(place))
            .replace(/{{WEBSITE}}/g, place.website);
    }

    this._getRatings = function (place) {
        var rating = place.rating || 0;
        var ratings = '';
        for (var i = 1; i <= 5; i++) {
            var className = ((rating > i) ? 'active' : '');
            var icon = ((rating > i) ? '★' : '☆');
            ratings += '<span class="' + className + '">' + icon + '</span>';
        }
        return ratings;
    }

    this._getPhoto = function (place) {
        return (place.photos && place.photos.length > 0)
            ? place.photos[0].getUrl(240, 180)
            : '#';
    }

    this._getOpenNow = function (place) {
        return (place.opening_hours && place.opening_hours.open_now)
            ? 'Open'
            : 'Closed';
    }

    this._getPhone = function (place) {
        return (place.formatted_phone_number)
            ? place.formatted_phone_number
            : '';
    }
}