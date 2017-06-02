/*global FlightSearchEngine, Backbone, JST*/

FlightSearchEngine.Views = FlightSearchEngine.Views || {};

(function () {
  'use strict';

  FlightSearchEngine.Views.SearchResult = Backbone.View.extend({
    flightTripType: null,
    events: {
      "click .book-flight": "bookFlight",
      "click .book-return-trip": "bookReturnTrip",
      "click .flightSearchContent": "selectFlight"
    },

    initialize: function () {
      var oThis = this;
      oThis.listenTo(oThis.model, FlightSearchEngine.ENUMS.EVENTS.MODEL.SEARCH_COMPLETE, oThis.onSearchComplete);
      oThis.listenTo(oThis.model, FlightSearchEngine.ENUMS.EVENTS.MODEL.SEARCH_START, oThis.onSearchStart);
      oThis.listenTo(oThis.model, FlightSearchEngine.ENUMS.EVENTS.MODEL.FILTER_SEARCH, oThis.onFilterSearch);
    },

    render: function () {
      this.$el.html(Mustache.to_html($("#flightSearchMainWrapperContent").html()));
    },

    onSearchStart: function () {
      $.pageLoader();
    },

    onSearchComplete: function (flightSearchData) {
      var oThis = this;
      $.pageLoader('hide');
      oThis.$("#search_flight_intro").hide();
      oThis.flightTripType = flightSearchData.flightTripType;
      oThis.renderSearchInfo(flightSearchData);
      oThis.renderSearchResults(flightSearchData);

      if ($(window).width() < 992) {
        FlightSearchEngine.commonUtil.elementScrollToTop(oThis.$("#flight_search_info"));
      }
    },

    isFlightSearchReturnTrip: function () {
      return this.flightTripType == FlightSearchEngine.ENUMS.TRIP_TYPE.RETURN_TRIP;
    },

    renderSearchInfo: function (flightSearchData) {
      var oThis = this,
        template = $("#flightSearchInfo").html(),
        isReturnTrip = oThis.isFlightSearchReturnTrip(),
        data = {
          dep_date: moment(flightSearchData.depDate).format("Do MMM YYYY"),
          flight_header: flightSearchData.origin + " > " + flightSearchData.destination
        };

      if (isReturnTrip) {
        data.flight_header += " > " + flightSearchData.origin;
        data.arr_date = moment(flightSearchData.arrDate).format("Do MMM YYYY");
      }

      oThis.$("#flight_search_info").html(Mustache.to_html(template, data)).show();
    },

    onFilterSearch: function (flightSearchData) {
      this.renderSearchResults(flightSearchData);
    },

    renderSearchResults: function (flightSearchData) {
      var oThis = this;

      if (oThis.isFlightSearchReturnTrip()) {
        oThis.renderReturnTripResults(flightSearchData);
      } else {
        oThis.renderOneWayTripResults(flightSearchData);
      }
    },

    renderReturnTripResults: function (flightSearchData) {
      var oThis = this,
        template = $("#flightSearchReturnResults").html(),
        originToDestFlightTemplateData = [],
        destToOriginFlightTemplateData = [];

      if (flightSearchData.originToDestFlights.length > 0 && flightSearchData.destToOriginFlights.length > 0) {
        originToDestFlightTemplateData = oThis.buildFlightsDataForTemplate(flightSearchData.originToDestFlights);
        destToOriginFlightTemplateData = oThis.buildFlightsDataForTemplate(flightSearchData.destToOriginFlights);
        oThis.$("#flight_return_trip_summary").show();
      } else {
        oThis.$("#flight_return_trip_summary").hide();
      }

      oThis.$("#flight_search_result_detail").html(Mustache.to_html(template, {
        origFlightsData: originToDestFlightTemplateData,
        destFlightData: destToOriginFlightTemplateData
      })).show().addClass("flight_return").removeClass("flight_one_way");
      oThis.updatePriceForReturnTrip();
    },

    renderOneWayTripResults: function (flightSearchData) {
      var oThis = this,
        flightsTemplateData = oThis.buildFlightsDataForTemplate(flightSearchData.originToDestFlights),
        template = $("#flightSearchOneWayResults").html();

      oThis.$("#flight_search_result_detail").html(Mustache.to_html(template, {flightsData: flightsTemplateData}))
        .show().removeClass("flight_return").addClass("flight_one_way");

      oThis.$("#flight_return_trip_summary").hide();
    },


    buildFlightsDataForTemplate: function (flightsModelData) {
      var oThis = this,
        flightsTemplateData = [];

      _.each(flightsModelData, function (flightModel, index) {
        var flightTemplateData = {
          flight_name: flightModel.get("airline_name"),
          flight_code: flightModel.get("flight_code"),
          departure_time: flightModel.getFormMatedDepartureTime(),
          arrival_time: flightModel.getFormattedArrivalTime(),
          duration: flightModel.getFormattedDuration(),
          price: flightModel.getDisplayPrice(),
          model_id: flightModel.get("flight_id"),
          isSelected: index == 0
        };

        flightsTemplateData.push(flightTemplateData);
      });

      return flightsTemplateData;

    },

    bookFlight: function (event) {
      var oThis = this,
        jCurrTarget = $(event.currentTarget),
        jWrapper = jCurrTarget.parents(".flightSearchContent"),
        model_id = jWrapper.data("model-id");

      var flightModel = oThis.model.getModelById(model_id);

      oThis.alertFlight(flightModel);
    },

    alertFlight: function (flightModel) {
      if (flightModel) {
        alert("Flight Selected is AirLine:" + flightModel.get("airline_name") + " and flight code:" + flightModel.get("flight_code"));
      }
    },

    selectFlight: function (event) {
      var oThis = this;

      if (oThis.isFlightSearchReturnTrip()) {
        var jCurrTarget = $(event.currentTarget),
          jFlightTypeWrapper = jCurrTarget.closest(".flex-col").find(".flight-selected").removeClass("flight-selected");
        jCurrTarget.addClass("flight-selected");
        oThis.updatePriceForReturnTrip();
      }
    },

    updatePriceForReturnTrip: function () {
      var oThis = this,
        jSelectedFlightsTo = oThis.$(".col-to .flight-selected"),
        jSelectedFLightsFrom = oThis.$(".col-from .flight-selected");

      if (jSelectedFlightsTo.length != 1) {
        oThis.$(".col-to").find(".flightSearchContent").removeClass("flight-selected").eq(0).addClass("flight-selected");
      }
      if (jSelectedFLightsFrom.length != 1) {
        oThis.$(".col-from").find(".flightSearchContent").removeClass("flight-selected").eq(0).addClass("flight-selected");
      }

      var modelIdTo = jSelectedFlightsTo.data("model-id"),
        modelIdFrom = jSelectedFLightsFrom.data("model-id"),
        flightModelTo = oThis.model.getModelById(modelIdTo),
        flightModelFrom = oThis.model.getModelById(modelIdFrom),
        fare = 0;

      if (flightModelTo) {
        fare += flightModelTo.getRate();
      }
      if (flightModelFrom) {
        fare += flightModelFrom.getRate();
      }

      oThis.$("#flight_return_complete_fair").html(FlightSearchEngine.commonUtil.getFlightToView(fare));

    },

    bookReturnTrip: function () {
      var oThis = this;
      if (oThis.isFlightSearchReturnTrip()) {
        var jSelectedFlightsTo = oThis.$(".col-to .flight-selected"),
          jSelectedFLightsFrom = oThis.$(".col-from .flight-selected");

        if (jSelectedFlightsTo.length && jSelectedFLightsFrom.length) {

          var modelIdTo = jSelectedFlightsTo.data("model-id"),
            modelIdFrom = jSelectedFLightsFrom.data("model-id"),
            flightModelTo = oThis.model.getModelById(modelIdTo),
            flightModelFrom = oThis.model.getModelById(modelIdFrom);

          oThis.alertFlight(flightModelFrom);
          oThis.alertFlight(flightModelTo);
        }

      }
    }


  });

})();
