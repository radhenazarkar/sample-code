/*global FlightSearchEngine, Backbone*/

FlightSearchEngine.Models = FlightSearchEngine.Models || {};

(function () {
  'use strict';

  FlightSearchEngine.Models.FlightData = Backbone.Model.extend({

    initialize: function (attributes) {
      var oThis = this,
        dep_time = oThis.get("dep_time"),
        arr_time = oThis.get("arr_time");
      var utcTimeOffset = new Date().getTimezoneOffset() * 60 * 1000;
      var depDateTime = new Date(dep_time - utcTimeOffset);
      var arrDateTime = new Date(arr_time - utcTimeOffset);
      oThis.set({
        "flight_id": FlightSearchEngine.Collections.FlightDataCollection.flightDataUniqId++,
        "depDateTime": depDateTime,
        "arrDateTime": arrDateTime
      });
    },

    defaults: {
      "origin": "",
      "destination": "",
      "dep_time": "",
      "arr_time": "",
      "flight_code": "",
      "airline_name": "",
      "rate": {
        "display_value": "",
        "value": 0
      }
    },

    getFormMatedDepartureTime: function () {
      return moment(this.get("depDateTime")).format("HH:mm");
    },

    getFormattedArrivalTime: function () {
      return moment(this.get("arrDateTime")).format("HH:mm");
    },

    getFormattedDuration: function () {
      var oThis = this,
        depTime = this.get("dep_time"),
        arrTime = this.get("arr_time"),
        diffTime = arrTime - depTime;

      var days = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      diffTime -= days * 1000 * 60 * 60 * 24;

      var hours = Math.floor(diffTime / (1000 * 60 * 60));
      diffTime -= hours * 1000 * 60 * 60;

      var min = Math.floor(diffTime / (1000 * 60 ));

      diffTime -= min * 1000 * 60;
      var sec = Math.floor(diffTime / 1000);
      if (sec > 30) {
        min++;
      }
      var duration = [];

      if (days > 0) {
        duration.push(days);
        duration.push("d ");
      }
      function getTwoDigitFormattedString(value) {
        return ("00" + value).substr(-2);
      }

      if (days > 0 || hours > 0) {
        var formattedHours = getTwoDigitFormattedString(hours);
        duration.push(formattedHours);
        duration.push("h ");
      }

      if (days > 0 || hours > 0 || min > 0) {
        var formattedHours = getTwoDigitFormattedString(min);
        duration.push(formattedHours);
        duration.push("m");
      }
      return duration.join("");
    },

    getDisplayPrice: function () {
      return this.get("rate").display_value;
    },

    getRate: function () {
      return this.get("rate").value;
    }
  });

})();
