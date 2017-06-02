/*global FlightSearchEngine, Backbone*/

FlightSearchEngine.Models = FlightSearchEngine.Models || {};

(function () {
  'use strict';

  FlightSearchEngine.Models.SearchFlightMainModel = Backbone.Model.extend({
    defaults: {
      cities: []
    },

    initialize: function (options) {
      this.fligtDataCollection = new FlightSearchEngine.Collections.FlightDataCollection(options.flightsData);
      this.filterflightResultData = {};
      this.currentFlightSearchResult = null;
    },

    searchFlights: function (formData) {
      var oThis = this,
        origToDestFlightData, desToOriginFlightData,
        flightData = {},
        flightTripType = formData.flightTripType,
        origin = formData.origin,
        destination = formData.destination,
        depDate = formData.depDate,
        arrDate = formData.arrDate,
        adults = formData.adults,
        children = formData.children,
        maxRate, minRate,
        isReturnTrip = flightTripType == FlightSearchEngine.ENUMS.TRIP_TYPE.RETURN_TRIP,
        flightSearchData = {},
        resultCount = 0;


      oThis.trigger(FlightSearchEngine.ENUMS.EVENTS.MODEL.SEARCH_START);
      var origToDestFlightData = oThis.searchFlightOnDate(depDate, origin, destination);
      maxRate = origToDestFlightData.max_rate;
      minRate = origToDestFlightData.min_rate;

      var flightSearchData = {
        originToDestFlights: origToDestFlightData.flights,
        depDate: depDate,
        arrDate: arrDate,
        origin: origin,
        destination: destination,
        flightTripType: flightTripType,
        result_count: 0
      };

      resultCount += origToDestFlightData.flights.length;

      if (isReturnTrip) {
        desToOriginFlightData = oThis.searchFlightOnDate(arrDate, destination, origin);
        flightSearchData.destToOriginFlights = desToOriginFlightData.flights;
        maxRate = Math.max(maxRate, desToOriginFlightData.max_rate);
        minRate = Math.min(minRate, desToOriginFlightData.min_rate);
        resultCount += desToOriginFlightData.flights.length;

        if (origToDestFlightData.flights.length == 0 || desToOriginFlightData.flights.length == 0) {
          resultCount = 0;
          maxRate = -Infinity;
          minRate = -Infinity;
        }
      }
      flightSearchData.result_count = resultCount;
      flightSearchData.max_rate = maxRate;
      flightSearchData.min_rate = minRate;

      // to mimic loading from the server
      _.delay(function () {
        oThis.currentFlightSearchResult = flightSearchData;
        oThis.trigger(FlightSearchEngine.ENUMS.EVENTS.MODEL.SEARCH_COMPLETE, flightSearchData);

      }, parseInt(Math.random() * 1000));

    },

    getHashKey: function (depDate, origin, destination) {
      var hashKeyData = [
        origin,
        destination,
        depDate.getDate(),
        depDate.getFullYear(),
        depDate.getMonth()
      ];

      return hashKeyData.join("_");
    },

    searchFlightOnDate: function (depDate, origin, destination) {
      var oThis = this,
        hashKey = oThis.getHashKey(depDate, origin, destination);

      if (oThis.filterflightResultData.hasOwnProperty(hashKey)) {
        return oThis.filterflightResultData[hashKey];
      }

      var flightCollection = this.fligtDataCollection,
        maxRate = -Infinity, minRate = Infinity;

      var flights = flightCollection.filter(function (model) {
        var isFlightEligible = model.get("origin") == origin && model.get("destination") == destination && moment(depDate).isSame(model.get("depDateTime"), "day");

        if (isFlightEligible) {
          var flightRate = model.get("rate").value;
          maxRate = Math.max(maxRate, flightRate);
          minRate = Math.min(minRate, flightRate);
        }
        return isFlightEligible;
      });

      var flightResultData = {
        "min_rate": minRate,
        "max_rate": maxRate,
        "flights": flights
      };

      oThis.filterflightResultData[hashKey] = flightResultData;
      return flightResultData;
    },

    getModelById: function (model_id) {
      var oThis = this;

      return oThis.fligtDataCollection.findWhere({"flight_id": model_id});
    },

    filterCurrFlightSearchDataOnRates: function (minRate, maxRate) {
      var oThis = this,
        currentFlightSearchData = oThis.currentFlightSearchResult,
        filteredFlightsData = {
          result_count: 0
        },
        resultCount;

      filteredFlightsData.originToDestFlights = oThis.filterFlightModelsOnRates(currentFlightSearchData.originToDestFlights, minRate, maxRate);
      resultCount = filteredFlightsData.originToDestFlights.length;
      if (currentFlightSearchData.flightTripType == FlightSearchEngine.ENUMS.TRIP_TYPE.RETURN_TRIP) {
        filteredFlightsData.destToOriginFlights = oThis.filterFlightModelsOnRates(currentFlightSearchData.destToOriginFlights,
          minRate, maxRate);
        resultCount += filteredFlightsData.destToOriginFlights.length;
        if(filteredFlightsData.originToDestFlights.length==0 || filteredFlightsData.destToOriginFlights.length == 0){
          resultCount = 0;
        }
      }

      filteredFlightsData.result_count = resultCount;
      oThis.trigger(FlightSearchEngine.ENUMS.EVENTS.MODEL.FILTER_SEARCH, filteredFlightsData);
    },

    filterFlightModelsOnRates: function (flightsModels, minRate, maxRate) {

      var filteredFlightModels = _.filter(flightsModels, function (flightModel) {
        var flightRate = flightModel.getRate();
        return flightRate >= minRate && flightRate <= maxRate;
      });

      return filteredFlightModels;
    }

  })
  ;

})();
