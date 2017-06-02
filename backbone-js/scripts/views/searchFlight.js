/*global FlightSearchEngine, Backbone, JST*/

FlightSearchEngine.Views = FlightSearchEngine.Views || {};

(function () {
  'use strict';

  FlightSearchEngine.Views.SearchFlight = Backbone.View.extend({

    events: {
      "change .flight-type": "onFlightTripTypeChange",
      "click #seach_flight_button": "onSearchFlightButtonClick",
      "change #start_date": "onStartDateChange",
      "click #max_min_search_form": "onMaxMinClick"
    },

    flightTripType: FlightSearchEngine.ENUMS.TRIP_TYPE.ONE_WAY,

    initialize: function () {
      var oThis = this;

      oThis.listenTo(oThis.model, FlightSearchEngine.ENUMS.EVENTS.MODEL.SEARCH_COMPLETE, oThis.onSearchComplete);
      oThis.listenTo(oThis.model, FlightSearchEngine.ENUMS.EVENTS.MODEL.FILTER_SEARCH, oThis.onFilterSearch);
    },

    render: function () {
      var oThis = this,
        model = oThis.model,
        template = $("#flightSearchForm").html(),
        templateData = {
          "adultRange": _.range(1, 10).map(function (x) {
            return {value: x};
          }),
          "childRange": _.range(0, 10).map(function (x) {
            return {value: x};
          }),
          "cities": model.get("cities"),
          "isOneWay": oThis.isTripOneWay()
        };
      oThis.$el.html(Mustache.to_html(template, templateData));

      oThis.$(".jselectpicker").each(function () {
        var jThis = $(this);
        jThis.select2({
          width: '100%',
          placeholder: jThis.data("place-holder")
        });
      });

      $(".jNormalSelectPicker").select2({
        minimumResultsForSearch: Infinity
      });

      oThis.$('#start_date, #end_date').datepicker({
        startDate: "today",
        format: "dd/mm/yyyy"
      });

      oThis.$('#start_date').datepicker('update', new Date());
      oThis.renderFlightTripTypeBaseComp();
    },

    onFlightTripTypeChange: function (event) {
      var oThis = this,
        selectedFlightTripType = oThis.$(".flight-type:checked").val();
      oThis.flightTripType = selectedFlightTripType;
      oThis.renderFlightTripTypeBaseComp();
    },

    renderFlightTripTypeBaseComp: function () {
      var oThis = this;
      if (oThis.flightTripType == FlightSearchEngine.ENUMS.TRIP_TYPE.RETURN_TRIP) {
        oThis.$("#end_date").prop("disabled", false).datepicker("update", oThis.$("#start_date").val());
      } else {
        oThis.$("#end_date").prop("disabled", true).datepicker('update', '');
      }

    },

    isTripOneWay: function () {
      return this.flightTripType == FlightSearchEngine.ENUMS.TRIP_TYPE.ONE_WAY;
    },

    onSearchFlightButtonClick: function () {
      var oThis = this,
        flightTripType = oThis.flightTripType,
        origin = oThis.$("#flight_search_origin").val(),
        destination = oThis.$("#flight_search_destination").val(),
        depDate = oThis.$("#start_date").datepicker("getDate"),
        arrDate = oThis.$("#end_date").datepicker("getDate"),
        adults = oThis.$("#adult_passengers").val(),
        children = oThis.$("#child_passengers").val(),
        errMsg = [],
        jErrorContainer = oThis.$("#flight_errors");

      jErrorContainer.html("").hide();

      if (origin == "") {
        errMsg.push({"msg": oThis.getErrorMsgForCityFieldEmpty("Origin City")});
      }
      if (destination == "") {
        errMsg.push({"msg": oThis.getErrorMsgForCityFieldEmpty("Destination City")});
      }
      if (origin != "" && origin == destination) {
        errMsg.push({"msg": "Origin and Destination city cannot be kept same"});
      }
      if (errMsg.length) {
        var template = $("#flightErrorTemplate").html(),
          html = Mustache.to_html(template, {
            "errors": errMsg
          });
        jErrorContainer.html(html).show();
        return;
      }

      var formData = {
        flightTripType: flightTripType,
        origin: origin,
        destination: destination,
        depDate: depDate,
        arrDate: arrDate,
        adults: adults,
        children: children
      };

      oThis.model.searchFlights(formData);
    },

    getErrorMsgForCityFieldEmpty: function (cityType) {
      return cityType + " cannot be kept empty";
    },

    onStartDateChange: function () {
      var oThis = this;
      if (oThis.isTripOneWay()) {
        return;
      }
      var depDate = oThis.$("#start_date").datepicker("getDate"),
        arrDate = oThis.$("#end_date").datepicker("getDate");
      if (moment(depDate).isAfter(arrDate)) {
        oThis.$("#end_date").datepicker("update", depDate).datepicker("setStartDate", depDate);
      }
    },

    onMaxMinClick: function (event) {
      var oThis = this,
        jTarget = $(event.currentTarget),
        currState = jTarget.data("curr-state");
      if (currState == "max") {
        oThis.$("#flight_search_form").addClass("minimize");
        jTarget.find(".glyphicon").removeClass("glyphicon-minus").addClass("glyphicon-plus");
        jTarget.data("curr-state", "min");

      } else {
        oThis.$("#flight_search_form").removeClass("minimize");
        jTarget.find(".glyphicon").addClass("glyphicon-minus").removeClass("glyphicon-plus");
        jTarget.data("curr-state", "max");
      }
    },

    onSearchComplete: function (flightSearchData) {
      var oThis = this,
        min_rate = flightSearchData.min_rate,
        max_rate = flightSearchData.max_rate,
        jAdvanceFilter = oThis.$("#flight_advance_filter");

      if (min_rate != Infinity && max_rate != Infinity && min_rate != max_rate) {
        var template = $("#flightAdvanceFilter").html(),
          templateData = {
            "min_value": min_rate,
            "max_value": max_rate,
            "step": 1
          };
        jAdvanceFilter.html(Mustache.to_html(template, templateData)).show();
        oThis.$("#flight_rate_filter").slider({
          range: true,
          min: min_rate,
          max: max_rate,
          values: [min_rate, max_rate],
          slide: function (event, ui) {
            oThis.updateAmountInFilter(ui.values[0], ui.values[1]);
            oThis.model.filterCurrFlightSearchDataOnRates(ui.values[0], ui.values[1]);
          }
        });

        oThis.updateAmountInFilter(min_rate, max_rate);
      } else {
        jAdvanceFilter.hide();
      }

      oThis.showNoOfResultFound(flightSearchData.result_count);
    },

    updateAmountInFilter: function (min, max) {
      var oThis = this;
      oThis.$("#amount").html(FlightSearchEngine.commonUtil.getFlightToView(min) + " - "
        + FlightSearchEngine.commonUtil.getFlightToView(max));
    },

    onFilterSearch: function (flightSearchData) {
      var oThis = this;
      oThis.showNoOfResultFound(flightSearchData.result_count);
    },

    showNoOfResultFound: function (resultCount) {
      var oThis = this;
      oThis.$("#search_result_info").html(resultCount + " result found.").show();
    }

  });

})();
