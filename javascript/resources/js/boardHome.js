/**
 *   @class: BoardHome
 *   @description: this class for board home user action and activity
 *   @author:  
 *   @date:  26 July 2014
 */

Trello.BoardHome = function(config){
    this.params = config;
    this.init();
}

Trello.BoardHome.prototype = {
    util: Trello.Util,
    isPageUpdated: false,
    boardWrapperEl: $("#boardUlId"),
    boards: [],
    boardTpl: '<li id="board_{{board_id}}"><a href="board.html?board_id={{board_id}}">{{board_name}}</a></li>',

    /**
     *   @method: init
     *   @description: this method called after object creation. constructor method call this method to init event listeners and prefetch user saved data
     *   @author:  
     *   @date:  26 July 2014
     */

    init: function(){
        var me = this;
        me.boards =  me.util.getStoreData('boards') || [];
        $( window ).unload(function() {
            (me.isPageUpdated) && (me.util.setStoreData('boards', me.boards));
        });
        me.addPrevItems(me.boards);
        this.initListeners();
    },
    /**
     *   @method: initListeners
     *   @description: this is method used to bind click event to all user click action buttons.
     *   @params:
     *   @author:  
     *   @date:  26 July 2014
     */
    initListeners: function(){
        var me = this,
            input  = $("#createNewBoardId input"),
            val;
        $('.addBoard').click(function(){
            me.toggleCreateBoardPopup(true);
            input.focus().val("");
        });
        $("#createNewBoardId .crossIcon").click(function(){
            me.toggleCreateBoardPopup();
        });
        $("#createGroupBtn").click(function(){
            val = input.val();
            if(val){
                me.addNewBoardByName(val);
                me.toggleCreateBoardPopup();
            }
        });
    },
    /**
     *   @method: addPrevItems
     *   @description: this method used  add to html by using template and user saved list
     *   @author:  
     *   @date:  26 July 2014
     */
    addPrevItems: function(items){
        var tpl = "{{#.}}"+this.boardTpl+"{{/.}}";
        this.boardWrapperEl.prepend(Mustache.to_html(tpl, items));
    },

    /**
     *   @method: addNewBoardByName
     *   @description: this method used add new board to html by using template and save newly added board to local storgae
     *   @params: boardName
     *   @author:  
     *   @date:  26 July 2014
     */
    addNewBoardByName: function(boardName){
        var me = this,
            len = me.boards.length,
            obj = {
                board_id: len,
                board_name: boardName
            }
        me.boards.unshift(obj);
        me.isPageUpdated = true;
        me.boardWrapperEl.prepend(Mustache.to_html(me.boardTpl, obj));
    },
    toggleCreateBoardPopup: function(isShow){
        $("#createNewBoardId")[isShow ? 'show': 'hide']();
    }
}
