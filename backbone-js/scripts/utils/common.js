(function (FlightSearchEngine) {
  FlightSearchEngine.commonUtil = {
    getFlightToView: function (flightRate) {
      var flightStr = flightRate.toString();
      while (/(\d+)(\d{3})/.test(flightStr)) {
        flightStr = flightStr.toString().replace(/(\d+)(\d{3})/, '$1' + '.' + '$2' + ".00");
      }
      return "Rs. " + flightStr;
    },
    elementScrollToTop: function (jElement, animationTime) {
      if (jElement && jElement.length) {
        $("html, body").animate({scrollTop: jElement.offset().top}, animationTime || 800);
      }
    }
  };
})(FlightSearchEngine);
