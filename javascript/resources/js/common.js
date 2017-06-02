/**
 *   Trello is namespace for all trello attributes and property
 *   this common need to include in all html pages
 *   @author:  
 *   @date:  26 July 2014
 */

var Trello = {
    homePageUrl: 'index.html'
};


/**
 *   Trello.Util is contain utility methods
 *   @author:  
 *   @date:  26 July 2014
 */
Trello.Util = {
    /**
     *   @method: getQueryStringObj
     *   @description: this method convert query string data to object and return converted object.
     *   @params: null
     *   @author:  
     *   @date:  26 July 2014
     */
    getQueryStringObj: function(){
        var a = window.location.search.substr(1).split('&');
            if(a){
                var b = {};
                for (var i = 0; i < a.length; ++i)
                {
                    var p=a[i].split('=');
                    if (p.length != 2) continue;
                    b[p[0]] = decodeURIComponent(p[1].replace(/\+/g, " "));
                }
                return b;
            }
        return {};
    },
    /**
     *   @method: getStoreData
     *   @description: this method get localstorage saved value and parse it from string to object and return.
     *   @params: key // localstorage key
     *   @author:  
     *   @date:  26 July 2014
     */
    getStoreData: function(key){
        var tmp = localStorage.getItem(key);
        return tmp ? JSON.parse(tmp) : null;
    },
    /**
     *   @method: setStoreData
     *   @description: this method save data to local storage
     *   @params: 1) key   // local storage key
     *            2) data  // data to save in local storage
     *   @author:  
     *   @date:  26 July 2014
     */
    setStoreData: function(key, data){
        localStorage.setItem(key, JSON.stringify(data));
    }
}




