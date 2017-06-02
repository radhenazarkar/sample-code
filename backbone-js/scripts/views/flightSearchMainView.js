/*global FlightSearchEngine, Backbone, JST*/

FlightSearchEngine.Views = FlightSearchEngine.Views || {};

(function () {
  'use strict';

  FlightSearchEngine.Views.FlightSearchMainView = Backbone.View.extend({
    searchFlightView: null,
    searchResultView: null,


    initialize: function () {
      var oThis = this;

      oThis.generateSearchFlightView();
      oThis.generateSearchResultView();
    },
    render: function () {
      var oThis = this;

      oThis.getSearchFlightView().render();
      oThis.getSearchResultView().render();
    },

    generateSearchFlightView: function () {
      var oThis = this;

      oThis.searchFlightView = new FlightSearchEngine.Views.SearchFlight({
        el: $("#flight_search_form_wrapper"),
        model: oThis.model
      });
    },

    generateSearchResultView: function () {
      var oThis = this;

      oThis.searchResultView = new FlightSearchEngine.Views.SearchResult({
        el: $("#flight_search_result"),
        model: oThis.model
      });
    },

    getSearchFlightView: function () {
      return this.searchFlightView;
    },

    getSearchResultView: function () {
      return this.searchResultView;
    },

    remove: function () {
      var oThis = this;
      oThis.getSearchFlightView().remove();
      oThis.getSearchResultView().remove();
      Backbone.view.remove.call(oThis);
    }

  });

})();
