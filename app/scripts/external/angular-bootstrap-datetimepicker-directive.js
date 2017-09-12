import * as $ from 'jquery'

// Just exports the module name
export const datetimepicker = 'datetimepicker'
angular
  .module('datetimepicker', [])
  .provider('datetimepicker', function () {
    let defaultOptions = {}

    this.setOptions = function (options) {
      defaultOptions = options
    }

    this.$get = function () {
      return {
        getOptions: function () {
          return defaultOptions
        }
      }
    }
  })
  .directive('datetimepicker', [
    '$timeout',
    'datetimepicker',
    function ($timeout,
      datetimepicker) {
      let defaultOptions = datetimepicker.getOptions()

      return {
        require: '?ngModel',
        restrict: 'AE',
        scope: {
          datetimepickerOptions: '@'
        },
        link: function ($scope, $element, $attrs, ngModelCtrl) {
          let passedInOptions = $scope.$eval($attrs.datetimepickerOptions)
          let options = $.extend({}, defaultOptions, passedInOptions)

          $element
            .on('dp.change', function (e) {
              if (ngModelCtrl) {
                $timeout(function () {
                  ngModelCtrl.$setViewValue(e.target.value)
                })
              }
            })
            .datetimepicker(options)

          function setPickerValue () {
            var date = options.defaultDate || null

            if (ngModelCtrl && ngModelCtrl.$viewValue) {
              date = ngModelCtrl.$viewValue
            }

            $element
              .data('DateTimePicker')
              .date(date)
          }

          if (ngModelCtrl) {
            ngModelCtrl.$render = function () {
              setPickerValue()
            }
          }

          setPickerValue()
        }
      }
    }
  ])
