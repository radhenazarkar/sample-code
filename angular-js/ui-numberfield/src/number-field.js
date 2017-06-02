/**
 * Anularjs Module for number-field
 */
angular.module('ui.numberfield', [ 'ui.bootstrap' ])
  /**
    number only for input box
  */
  .directive('numberOnly',function(){
    return {
         require: 'ngModel',
         link: function(scope, element, attrs, modelCtrl) {
           modelCtrl.$parsers.push(function (inputValue) {
              if (inputValue == undefined) return '' 
               var transformedInput = inputValue.replace(/[^-0-9]/g, ''); 
               if (transformedInput!=inputValue) {
                  modelCtrl.$setViewValue(transformedInput);
                  modelCtrl.$render();
               }         

               return transformedInput;         
            });
        }
      };
  })
  .directive('numberField', function() {
      return {
        restrict : 'E',
        transclude : false,
        scope : {
            numberModel: '=',
            min: '=',
            max: '='
        },
        controller : function($scope, $element) {
            $scope.decreaseNumber = function(){
                if( $scope.numberModel || (typeof $scope.numberModel == 'number')){
                    $scope.numberModel--;
                }else {
                    $scope.numberModel = $scope.min || 0;
                }
            }
            $scope.increaseNumber = function(){
                if( $scope.numberModel || (typeof $scope.numberModel == 'number') ){
                    $scope.numberModel++;
                }else {
                    $scope.numberModel = $scope.min || 0;
                }
            }
            $scope.keyDown = function($event){
                if($event.keyCode == 40){
                    $scope.decreaseNumber();
                }else if($event.keyCode == 38){
                    $scope.increaseNumber();
                }
            }
            $scope.keyUp = function($event){
               if($event.keyCode == 189 && $event.target.value.length != 1){
                    $scope.numberModel = parseInt($event.target.value);
                }
                if(parseInt($scope.numberModel) == 0){
                    $scope.numberModel = 0;
                }

            }
        },
        link : function(scope, element, attrs) {
            scope.$watch("numberModel", function(value) {
                if(typeof scope.min == 'number'){
                    scope.minDisabled =  (value <= scope.min);
                    if(scope.minDisabled && value){
                       scope.numberModel = scope.min;
                    }
                }
                if(typeof scope.max == 'number'){
                    scope.maxDisabled =  (value >= scope.max);
                    if(scope.maxDisabled && value){
                        scope.numberModel = scope.max;
                    }
                }
            });
        },
        template : "<div class='ui-number-wrap' style='display: table;'>"
            + "  <div class='input-group-btn'> "
            + "    <button type='button' class='btn btn-default' ng-click='decreaseNumber()' ng-disabled='minDisabled'><i class='glyphicon glyphicon-minus'></i></button>"
            + "  </div>"
            + "  <input type='text' class='form-control' ng-model='numberModel' number-only ng-paste='$event.preventDefault()' ng-keydown='keyDown($event)' ng-keyup='keyUp($event)'/>"
            + "  <div class='input-group-btn'> "
            + "    <button type='button' class='btn btn-default' ng-click='increaseNumber()' ng-disabled='maxDisabled'><i class='glyphicon glyphicon-plus'></i></button>"
            + "  </div>"
            + "  </div>"
      };
});
