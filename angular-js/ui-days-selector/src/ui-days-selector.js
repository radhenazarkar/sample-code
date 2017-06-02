/**
 * Anularjs Module for days-selector
 */
angular.module('ui.daysSelector', [])
  .directive('daysSelector', function() {
      return {
        restrict : 'E',
        transclude : false,
        scope : {
            isShowAll: '=',
            selectedDays: '=',
            afterToggle: '&'
        },
        controller : function($scope, $element) {
            $scope.selectedDays = $scope.selectedDays || [];
            $scope.allSelected = false;

            var isSelected = function( val ){
                return $scope.selectedDays.indexOf(val) != -1
            }
            
            $scope.days = [{
                name: 'Su',
                value: 'su',
                selected: isSelected('su')
            }, {
                name: 'Mo',
                value: 'mo',
                selected: isSelected('mo')
            }, {
                name: 'Tu',
                value: 'tu',
                selected: isSelected('tu')
            }, {
                name: 'We',
                value: 'we',
                selected: isSelected('we')
            }, {
                name: 'Th',
                value: 'th',
                selected: isSelected('th')
            }, {
                name: 'Fr',
                value: 'fr',
                selected: isSelected('fr')
            }, {
                name: 'Sa',
                value: 'sa',
                selected: isSelected('sa')
            }]


            var checkAllSelected = function(){
                var selected = true;
                if($scope.isShowAll){
                    for(var i=0; i<$scope.days.length; i++){
                        if(!$scope.days[i].selected){
                            selected =false;
                            break;
                        }
                    }
                  $scope.allSelected = selected;
                }
            },
            getSelectedDays = function(){
                var selectedDays = []
                for(var i=0; i<$scope.days.length; i++){
                    if($scope.days[i].selected){
                      selectedDays.push($scope.days[i].value);
                    }
                }
                return selectedDays;
            }

            $scope.allClicked = function(){
                var selectedDays = []
                for(var i=0; i<$scope.days.length; i++){
                    selectedDays.push($scope.days[i].value);
                    $scope.days[i].selected = true;
                }
                $scope.allSelected = true;
                $scope.afterToggle({
                    selectedDays: selectedDays
                });
            }

            $scope.toggleDay = function(d){
                d.selected = !d.selected
                if(d.selected){
                    checkAllSelected();
                }else {
                    $scope.allSelected = false;
                }
                $scope.afterToggle({
                    selectedDays: getSelectedDays()
                });
            }
            checkAllSelected();
        },
        template : '<div class="ui-days-wrap">'
          +    '<button type="button" ng-click="allClicked(d)" class="btn btn-default" ng-disabled="allSelected" ng-if="isShowAll">All</button>'
          +    '<button type="button" ng-repeat="d in days" ng-click="toggleDay(d)" class="btn btn-default" ng-class="{\'active_toggle\': d.selected}" ng-bind="d.name"></button>'
          + "  </div>"
      };
});