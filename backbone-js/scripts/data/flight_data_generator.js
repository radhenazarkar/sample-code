// website ui: http://themes.getbootstrap.com/products/application

(function (FlightSearchEngine) {


  var cities = FlightSearchEngine.citiesData.map(function (item) {
    return item.iata;
  });
  var airlines = [{
    "airline_name": "Air India Cargo",
    "airline_code": "1A"
  }, {
    "airline_name": "Air Deccan",
    "airline_code": "2G"
  }, {
    "airline_name": "Air Mantra",
    "airline_code": "7T"
  }, {
    "airline_name": "Air Sahara",
    "airline_code": "6T"
  }, {
    "airline_name": "Cres Air Cargo",
    "airline_code": "7T"
  }, {
    "airline_name": "Deccan 360",
    "airline_code": "5E"
  }, {
    "airline_name": "Gujarat Airways",
    "airline_code": "8F"
  }, {
    "airline_name": "Indus Airways",
    "airline_code": "8H"
  }, {
    "airline_name": "Kingfisher Airlines",
    "airline_code": "3B"
  }, {
    "airline_name": "ModiLuft",
    "airline_code": "8Y"
  }, {
    "airline_name": "Orient Airways",
    "airline_code": "8Y"
  }, {
    "airline_name": "Paramount Airways",
    "airline_code": "6Y"
  }, {
    "airline_name": "Tata Airlines",
    "airline_code": "1T"
  }];

// start generators

  var getRandomFlightRate = function () {
    return parseInt(Math.random() * 100 * Math.random() * 1000 + 1000);
  };

  var generateUTCTime = function (days) {
    var currDateObj = new Date();
    var utcDiffInMilli = currDateObj.getTimezoneOffset() * 60 * 1000;
    var dateInMilliSecs = currDateObj.setTime(currDateObj.getTime() + days * 86400000);
    var diffInTime = parseInt(Math.random() * 60 * 60 * 12 * 1000);
    if (Math.round(Math.random()) == 0) {
      diffInTime *= -1;
    }
    var utcTime = dateInMilliSecs - diffInTime + utcDiffInMilli;
    return utcTime;
  };

  function getFlightToView(flightRate) {
    var flightStr = flightRate.toString();
    while (/(\d+)(\d{3})/.test(flightStr)) {
      flightStr = flightStr.toString().replace(/(\d+)(\d{3})/, '$1' + '.' + '$2' + ".00");
    }
    return "Rs. " + flightStr;
  }

  var generateArrivalTime = function (departureTime) {
    return departureTime + 1000 * 60 * 30 + parseInt(Math.random() * 5 * 60 * 60 * 1000);
  };

  var getSingleCityCode = function (cities) {
    var cityCode = cities.splice(parseInt(Math.random() * cities.length), 1);
    return cityCode[0];
  };

// end generators

// change the constants MAX_DAYS_FOR_FLIGHT_DATA and MAX_FLIGHTS_IN_DAY values to build data
  var MAX_DAYS_FOR_FLIGHT_DATA = 20;
  var MAX_FLIGHTS_IN_DAY = 300;
  var flightsData = [];

  for (var startDay = 0; startDay < MAX_DAYS_FOR_FLIGHT_DATA; startDay++) {

    for (var startFlight = 0; startFlight < MAX_FLIGHTS_IN_DAY; startFlight++) {
      //var flightData = {
      //    "origin": "",
      //    "destination": "",
      //    "dep_time": "",
      //    "arr_time": "",
      //    "flight_code": "",
      //    "airline_name": "",
      //    "rate": {
      //      "display_value": "",
      //      "value": 0
      //    }
      //  };

      var flightData = {};
      var airline = airlines[parseInt(Math.random() * airlines.length)];
      var tempCities = cities.slice(0);
      flightData.origin = getSingleCityCode(tempCities);
      flightData.destination = getSingleCityCode(tempCities);
      flightData.dep_time = generateUTCTime(startDay);
      flightData.arr_time = generateArrivalTime(flightData.dep_time);
      var flightRandomCode = ('000' + parseInt(Math.random() * 1000)).substr(-3);
      flightData.airline_name = airline.airline_name;
      var code = [];
      code.push(airline.airline_code);
      code.push("-");
      code.push(flightRandomCode);
      flightData.flight_code = code.join("");


      var flightRate = getRandomFlightRate();
      flightData.rate = {
        display_value: getFlightToView(flightRate),
        value: flightRate
      };
      flightsData.push(flightData);
    }

  }
  FlightSearchEngine.flightsData = flightsData;
})(FlightSearchEngine);
