// <script type="text/javascript" src="//maps.google.com/maps/api/js?key=AIzaSyB1PaZ5hi4cCxmytVeZ_wfv-R5xBv_waaA"></script>

var server = window.location.protocol + "//" + window.location.host + "/";

function getURLParameter(name) {

  return decodeURI(

    (RegExp(name + '=' + '(.+?)(&|$)').exec(location.search) || [, null])[1]

  );

}

var iconmap = {

  atm: "bank.png",
  bank: "bank.png",
  finance: "bank.png",

  bicycle_store: "shopping.png",
  book_store: "shopping.png",
  clothing_store: "shopping.png",
  department_store: "shopping.png",
  electronics_store: "shopping.png",
  furniture_store: "shopping.png",
  hardware_store: "shopping.png",
  home_goods_store: "shopping.png",
  jewelry_store: "shopping.png",
  shoe_store: "shopping.png",
  pet_store: "shopping.png",
  shopping_mall: "shopping.png",
  florist: "shopping.png",
  store: "shopping.png",

  synagogue: "worship.png",
  church: "worship.png",
  mosque: "worship.png",
  hindu_temple: "worship.png",
  place_of_worship: "worship.png",

  pharmacy: "pharmacy.png",

  hospital: "hospital.png",

  doctor: "clinic.png",
  physiotherapist: "clinic.png",
  veterinary_care: "clinic.png",
  health: "clinic.png",

  dentist: "dentist.png",

  hair_care: "salon.png",
  spa: "salon.png",
  beauty_salon: "salon.png",


  school: "school.png",
  university: "school.png",

  night_club: "bar.png",
  bar: "bar.png",
  liquor_store: "bar.png",


  convenience_store: "groceries.png",
  grocery_or_supermarket: "groceries.png",
  food: "groceries.png",
  bakery: "groceries.png",

  cafe: "restaurant.png",
  restaurant: "restaurant.png",
  meal_delivery: "restaurant.png",
  meal_takeaway: "restaurant.png",

  gym: "gym.png",

  park: "park.png",

  bus_station: "bus.png",

  train_station: "train.png",
  subway_station: "train.png",

  car_wash: "gas.png",
  gas_station: "gas.png"

}

var frame = window.frameElement;

var properties = eval(@Html.Raw(Json.Encode(Model)));

var hide = getURLParameter('hide');

if (hide == "true") {

  hide = true;

} else {

  hide = false;

}

function initialize() {

  var blueDot = new google.maps.MarkerImage("@Url.Content("~/Content/Images / Assets / Map / map - marker - blue.png")", undefined, undefined, undefined, new google.maps.Size(25, 40))

  var orangDot = new google.maps.MarkerImage("@Url.Content("~/Content/Images / Assets / Map / map - marker - orange.png")", undefined, undefined, undefined, new google.maps.Size(27, 42))

  var projectNo = 12;

  var latlng = null;

  var aLat = null;

  var aLng = null;

  var cityOptions = {

    zoom: 14,

    mapTypeId: google.maps.MapTypeId.ROADMAP

  }

  cityMap = new google.maps.Map(document.getElementById("cityMap_canvas"), cityOptions);

  var bounds = new google.maps.LatLngBounds();

  var centerPoint = null;

  for (i = 0; i < properties.count; i++) {

    var property = properties.entries[i];

    var propertyName = property.name.replace(".", "");

    var lat = property.latitude.replace(",", ".");

    var lng = property.longitude.replace(",", ".");

    var point = new google.maps.LatLng(parseFloat(lat), parseFloat(lng));

    if (property.projecturl == null) {

      property.projecturl = "@Url.ActionLink("Rent / Details")" + "/" + property.provincename + "/" + property.cityname + "/" + propertyName.replace(/ /g, "-")

    }

    var marker = new google.maps.Marker({
      map: cityMap,
      position: point,
      title: property.name,
      zIndex: parseInt(property.id),
      url: property.projecturl,
      icon: blueDot,
    });

    google.maps.event.addListener(marker, 'click', function () {

      top.window.location.href = this.url;

    });

    if (property.selected) {
      aLat = lat.replace(",", ".");
      aLng = lng.replace(",", ".");
      centerPoint = point;
      marker = new google.maps.Marker({
        map: cityMap,
        position: point,
        title: property.name,
        zIndex: parseInt(property.id) + 1000,
        url: property.projecturl,
        icon: hide ? blueDot : orangDot
      });

      google.maps.event.addListener(marker, 'click', function () {
        top.window.location.href = this.url;
      });
    }
    bounds.extend(point);
  }

  if (!hide) {
    cityMap.setZoom(15);
  } else {
    cityMap.setZoom(12);
  }

  cityMap.setCenter(centerPoint);

  var noPoi = [
    {
      featureType: "poi",
      stylers: [
        { visibility: "off" }
      ]
    },
    {
      featureType: "transit",
      stylers: [
        { visibility: "off" }
      ]
    }
  ];

  cityMap.setOptions({ styles: noPoi });

  if (!hide) {

    $.getJSON(server + "Services/GetNearby/?lat=" + aLat + "&lng=" + aLng, function (data) {

      var count = 1;

      $.each(data.results, function (key, val) {

        $.getJSON(server + "Services/GetNearbyDetails/?reference=" + val.reference, function (dData) {

          var icon = "generic.png"

          if (iconmap[val.types[0]]) {

            icon = iconmap[val.types[0]];

          }

          lat = parseFloat(val.geometry.location.lat).toString().replace(",", ".");

          lng = parseFloat(val.geometry.location.lng).toString().replace(",", ".");

          var point = new google.maps.LatLng(parseFloat(lat), parseFloat(lng));

          var marker = new google.maps.Marker({

            map: cityMap,

            position: point,

            title: val.name,

            zIndex: 100 + count,

            url: dData.result.url,

            icon: new google.maps.MarkerImage(server + "Content/Images/Assets/Map/" + icon, undefined, undefined, undefined, new google.maps.Size(20, 20))

          });

          google.maps.event.addListener(marker, 'click', function () {

            window.open(this.url, this.name);

          });

        });

        count++;

      });

    });

  }

  //display street view
  if ("@ViewBag.MapType" == "strvw") {

    var panoramaOptions = {

      position: centerPoint,

      pov: {

        heading: 34,

        pitch: 10

      }

    };

    $("#pano").show();

    var panorama = new google.maps.StreetViewPanorama(document.getElementById('pano'), panoramaOptions);

    map.setStreetView(panorama);

  }
}

$(document).ready(function () {

  initialize();

});

