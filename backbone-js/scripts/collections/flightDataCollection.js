/*global FlightSearchEngine, Backbone*/

FlightSearchEngine.Collections = FlightSearchEngine.Collections || {};

(function () {
  'use strict';

  FlightSearchEngine.Collections.FlightDataCollection = Backbone.Collection.extend({

    model: FlightSearchEngine.Models.FlightData

  });

  FlightSearchEngine.Collections.FlightDataCollection.flightDataUniqId = 1;

})();
