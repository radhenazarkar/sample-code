window.FlightSearchEngine = {
  Models: {},
  Collections: {},
  Views: {},
  ENUMS: {},
  Routers: {},
  init: function () {
    this.mainModel = new FlightSearchEngine.Models.SearchFlightMainModel({
      cities: FlightSearchEngine.citiesData,
      flightsData: FlightSearchEngine.flightsData

    });
    this.mainView = new FlightSearchEngine.Views.FlightSearchMainView({
      model: this.mainModel,
      el: $("#flight_search_wrapper")
    });
    this.mainView.render();
    console.log(FlightSearchEngine.flightsData[0]);
  }
};

$(document).ready(function () {
  'use strict';
  FlightSearchEngine.init();
});
