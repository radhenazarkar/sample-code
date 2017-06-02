/**
 *   @class: BoardPage
 *   @description: this class for board page user action and activity
 *   @author:  
 *   @date:  26 July 2014
 */

Trello.BoardPage = function (config) {
    this.params = config;
    this.init();
}

Trello.BoardPage.prototype = {
    util: Trello.Util,
    isPageUpdated: false,
    boardInfo: null,
    boards: [],
    boardsList: [],
    boardListWrapperEl: $("#boardListContainer"),
    nextTaskId: 0,

    /**
     *   @method: init
     *   @description: this method called after object creation. constructor method call this method to init event listeners and prefetch user saved data
     *   @author:  
     *   @date:  26 July 2014
     */
    init: function () {
        var me = this,
            boardInfo,
            qString = me.util.getQueryStringObj();



        me.taskWrapperTpl = '<div class="colorWrapper">{{#labels}}<span class="colorStrip" style="background-color: {{.}};"></span>{{/labels}}</div><div class="descriptionDiv">{{description}}</div>';
        me.taskTpl = '<li data-task-id="{{task_id}}" class="taskLi">'+me.taskWrapperTpl+'</li>';
        me.boardListTpl = [
            '<div class="boardListPanel addCardActive" data-list-id="{{list_id}}">',
            '<div class="fw500 f14">{{list_name}}</div>',
            '<ul class="listUl" data-list-id="{{list_id}}">{{#tasks}}'+me.taskTpl+'{{/tasks}}</ul>',
            '<div class="listAddTextWrap">',
            '<textarea></textarea>',
            '<div class="btnWrapper">',
            '<span class="addTaskBtn greenBtn">Add</span>',
            '<span class="crossIcon closeAddlist"></span>',
            '</div>',
            '</div>',
            '<div class="clear addCardWrapper">Add a Card...</div>',
            '</div>'
        ].join("");

        me.boards =  me.util.getStoreData('boards') || [];
        me.boardInfo = me.getBoardInfoById(qString.board_id);

        if(me.boardInfo){
            var boardLsKey = 'board_list_'+me.boardInfo["board_id"];
            var taskLsKey = 'task_list_'+me.boardInfo["board_id"];
            me.boardsList = me.util.getStoreData(boardLsKey) || [];
            me.taskList = me.util.getStoreData(taskLsKey) || {};
            $("#boardTitleId").html(me.boardInfo["board_name"]);
            me.processTask(me.taskList);
            me.initDragMethod();
            $( window ).unload(function() {
                if(me.isPageUpdated){
                    me.updateCardList();
                    me.util.setStoreData(boardLsKey, me.boardsList);
                    me.updateTaskList();
                    me.util.setStoreData(taskLsKey, me.taskList);
                }
            });
        }else {
            window.location = Trello.homePageUrl;
        }
        me.initListeners();
    },

    /**
     *   @method: initDragMethod
     *   @description: this method used initialize drag method for task and card
     *   @author:  
     *   @date:  26 July 2014
     */
    initDragMethod: function(){
        this.initTaskDrag();
        this.initCardDrag();
    },

    /**
     *   @method: updateCardList
     *   @description: this method used update user dragged position for card in localstorage data
     *   @author:  
     *   @date:  26 July 2014
     */
    updateCardList: function(){
        var me = this,
            list;
        for(var i=0; i<me.boardsList.length; i++){
            list = me.boardsList[i];
            me.boardsList[i].position = $(".boardListPanel[data-list-id='"+list.list_id+"']").index();
        }
        me.boardsList.sort(function(a, b){return a.position - b.position});
    },
    /**
     *   @method: updateTaskList
     *   @description: this method used update user dragged position for list in localstorage data
     *   @author:  
     *   @date:  26 July 2014
     */
    updateTaskList: function(){
        var me = this,
            dt,
            el;
        $('.listUl li').each(function(){
            el = $(this),
            dt = el.data();
            $.extend(me.taskList[dt.taskId], {
                list_id: el.parent().data().listId,
                position: el.index()
            });
        })
    },

    /**
     *   @method: processTask
     *   @description: this method used process user saved task list, sort this list and add to html by using template
     *   @author:  
     *   @date:  26 July 2014
     */
    processTask: function(list){
        var me = this,
            count = 0,
            task_id,
            list_id,
            validBoardList = [],
            taskList,
            i,
            lists = {}, tmp;
        for(task_id in list){
            count++;
            list_id = list[task_id]['list_id'];
            (!lists[list_id]) && (lists[list_id] = [])
            lists[list_id].push(list[task_id])
        }
        me.nextTaskId = count;
        for(i=0; i< me.boardsList.length; i++){
            tmp = {};
            list_id = me.boardsList[i]['list_id'],
            taskList = lists[list_id];
            $.extend(tmp, me.boardsList[i]);
            if(taskList){
                tmp.tasks = taskList.sort(function(a, b){return a.position - b.position});
            }
            validBoardList.push(tmp);
        }
        me.addPrevItems(validBoardList);
    },

    /**
     *   @method: addPrevItems
     *   @description: this method used  add to html by using template and user saved list
     *   @author:  
     *   @date:  26 July 2014
     */
    addPrevItems: function(items){
        var tpl = "{{#.}}"+this.boardListTpl+"{{/.}}";
        this.boardListWrapperEl.prepend(Mustache.to_html(tpl, items));
    },

    /**
     *   @method: addNewListByName
     *   @description: this method used add new list to html by using template and save newly added list to local storgae
     *   @params: listname
     *   @author:  
     *   @date:  26 July 2014
     */
    addNewListByName: function(listname){
        var me = this,
            len = me.boardsList.length,
            obj = {
                list_id: len,
                list_name: listname,
                position: len
            }

        me.boardsList.push(obj);
        me.isPageUpdated = true;
        me.boardListWrapperEl.append(Mustache.to_html(me.boardListTpl, obj));
        me.initDragMethod();
    },

    /**
     *   @method: addNewTask
     *   @description: this method used add new task to html by using template and save newly added task to local storgae
     *   @params: taskInfo
     *   @author:  
     *   @date:  26 July 2014
     */
    addNewTask: function(taskInfo, ul){
        var me = this;

        me.taskList[taskInfo["task_id"]] = taskInfo;
        me.isPageUpdated = true;
        ul.append(Mustache.to_html(me.taskTpl, taskInfo));
        me.initDragMethod();
    },

    /**
     *   @method: getBoardInfoById
     *   @description: return current board info by passing board id
     *   @params: board_id
     *   @author:  
     *   @date:  26 July 2014
     */
    getBoardInfoById: function(board_id){
        var t,
            i,
            b = this.boards;
        if(board_id){
           for(var i=0; i<b.length; i++){
               if(b[i].board_id == board_id){
                   t = b[i];
                   break;
               }
           }
        }
        return t;
    },

    /**
     *   @method: initCardDrag
     *   @description: init card drag and drop. this uses jquery ui sortable methods
     *   @params:
     *   @author:  
     *   @date:  26 July 2014
     */
    initCardDrag: function(){
        var me = this,
            addNewListEl = $("#addNewListId");
        me.boardListWrapperEl.sortable({
            connectWith: "div.boardListPanel",
            placeholder: "boardListPanel highlight-li",
            start: function( event, ui ){
                ui.placeholder.height(ui.item.height());
                addNewListEl.hide();
            },
            stop: function(){
                me.isPageUpdated = true;
                addNewListEl.show();
            }
        });
    },

    /**
     *   @method: initTaskDrag
     *   @description: init task drag and drop. this uses jquery ui sortable methods
     *   @params:
     *   @author:  
     *   @date:  26 July 2014
     */

    initTaskDrag: function(){
        var me = this;
        $( "ul.listUl" ).sortable({
            connectWith: "ul",
            placeholder: "highlight-li",
            start: function( event, ui ){
                ui.placeholder.height(ui.item.height());
            },
            stop: function(){
                me.isPageUpdated = true;
            }
        });
    },

    /**
     *   @method: initListeners
     *   @description: this is method used to bind click event to all user click action buttons.
     *   @params:
     *   @author:  
     *   @date:  26 July 2014
     */
    initListeners: function(){
        var parentEl,
            el, task_id, taskInfo,
            taskEditWrapEl = $("#taskEditWrapId"),
            editLabelWrapperEl = $('.editLabelWrapper'),
            taskEditInputEl = taskEditWrapEl.find("textarea"),
            boardMenuEl = $("#boardMenuWrapperId"),
            maskEl = $('.mask'),
            val, i,
            me = this;

        maskEl.click(function () {
            $(this).hide();
            taskEditWrapEl.hide();
            editLabelWrapperEl.hide();
            task_id = taskEditInputEl.data().task_id;
            taskInfo = me.taskList[task_id];
            $(".taskLi[data-task-id='"+task_id+"']").html(Mustache.to_html(me.taskWrapperTpl, taskInfo));
        });
        boardMenuEl.find('ul').html(Mustache.to_html('{{#.}}<li><a href="board.html?board_id={{board_id}}">{{board_name}}</a></li>{{/.}}', me.boards))

        $("#createListBtn").click(function(){
            val = $("#createNewListInput").val();
            if(val){
                me.addNewListByName(val);
                $(".closelistCls").trigger("click");
            }
        });
        $(".boardMenu").click(function(){
            boardMenuEl.show();
        });
        $(".closeMenuCls").click(function(){
            boardMenuEl.hide();
        });
        $(".closelistCls").click(function(){
            $(this).closest('.addBoardListPanel').addClass('addCardActive');
        });
        $(".addNewListCls").click(function(){
            parentEl = $(this).closest('.addBoardListPanel');
            parentEl.removeClass('addCardActive');
            parentEl.find('.listAddTextWrap input').focus().val("");
        });

        $(".changeLabelText").click(function(){
            editLabelWrapperEl.show().offset($(this).offset());
        });

        $(".closeLabelPopCls").click(function(){
            editLabelWrapperEl.hide();
        });

        $(".colorLabel").click(function(){
            el = $(this);
            task_id = taskEditInputEl.data().task_id;
            taskInfo = me.taskList[task_id];
            var labelId = el.data().labelId;
            var index = taskInfo.labels.indexOf(labelId)
            index > -1 &&  taskInfo.labels.splice(index, 1);
            if(el.hasClass('selected')){
                el.removeClass('selected');
            }else {
                el.addClass('selected');
                taskInfo.labels.push(labelId);
            }
            me.isPageUpdated = true;
        });

        me.boardListWrapperEl.delegate('.closeAddlist', 'click', function () {
            $(this).closest('.boardListPanel').addClass('addCardActive');
        });
        me.boardListWrapperEl.delegate('.taskLi', 'click', function () {
            el = $(this);
            task_id = el.data().taskId;
            taskInfo = me.taskList[task_id];

            taskEditWrapEl.show().offset(el.offset());
            maskEl.show();
            taskEditInputEl.val(taskInfo.description).focus().data('task_id', task_id);
            $(".colorLabel.selected").removeClass('selected');
            for(i=0; i<taskInfo.labels.length; i++){
                $('.colorLabel[data-label-id="'+taskInfo.labels[i]+'"]').addClass('selected');
            }
        });
        $('.editSaveTaskBtn').click(function(){
            val = taskEditInputEl.val();
            task_id = taskEditInputEl.data().task_id;
            if(val){
                me.taskList[task_id].description = val;
                me.isPageUpdated = true;
                maskEl.trigger("click");
            }
        })
        me.boardListWrapperEl.delegate('.addTaskBtn', 'click', function(){
            parentEl = $(this).closest('.boardListPanel');
            val = parentEl.find('.listAddTextWrap textarea').val();
            if(val){
                me.addNewTask({
                    list_id: parentEl.data().listId,
                    task_id: me.nextTaskId,
                    position: parentEl.find('.listUl li').length,
                    description: val,
                    labels: []
                }, parentEl.find('.listUl'));
                me.nextTaskId++;
                parentEl.addClass('addCardActive');
            }
        });
        me.boardListWrapperEl.delegate('.addCardWrapper', 'click', function () {
            parentEl = $(this).closest('.boardListPanel');
            parentEl.removeClass('addCardActive');
            parentEl.find('.listAddTextWrap textarea').focus().val("");
        });
    }
}

