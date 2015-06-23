/**
 * ng-dropdown - v1.0.4 - A simple AngularJS directive to provide dropdown menu
 * functionality!
 *
 * @author Ian Kennington Walter (http://ianvonwalter.com)
 */
'use strict';

(function (angular) {
  'use strict';

  angular.module('ng-dropdown', []).service('DropdownService', ['$document', function ($document) {
    var _this2 = this;

    this.dropdowns = [];

    this.open = function (id) {
      var _this = this;

      /// console.log('open', id);
      var dropdown = this.dropdowns[id];
      if (!dropdown.opened) {
        if (this.currentlyOpen || this.currentlyOpen === 0) {
          this.close(this.currentlyOpen);
        }

        dropdown.element.addClass(dropdown.activeClass);
        dropdown.menuElement.addClass(dropdown.openClass);
        dropdown.opened = true;

        // Prevent immediate open-close from toggle button
        setTimeout(function () {
          return _this.currentlyOpen = id;
        }, 0);
      }
    };

    this.close = function (id) {
      // console.log('close', id);
      var dropdown = this.dropdowns[id];
      if (dropdown.opened) {
        dropdown.element.removeClass(dropdown.activeClass);
        dropdown.menuElement.removeClass(dropdown.openClass);
        dropdown.opened = false;

        delete this.currentlyOpen;
      }
    };

    this.toggle = function (id) {
      var dropdown = this.dropdowns[id];
      if (dropdown.opened) {
        this.close(id);
      } else {
        this.open(id);
      }
    };

    $document.bind('click', function (e) {
      if (_this2.currentlyOpen || _this2.currentlyOpen === 0) {
        var currentDropdown = _this2.dropdowns[_this2.currentlyOpen];
        if (currentDropdown.menuElement !== e.target) {
          _this2.close(_this2.currentlyOpen);
        }
      }
    });
  }]).directive('dropdown', ['$document', '$parse', 'DropdownService', function ($document, $parse, DropdownService) {
    return {
      restrict: 'A',
      scope: {
        dropdown: '=?',
        disabled: '&dropdownDisabled',
        preventOnClick: '=dropdownPreventOnClick'
      },
      link: function link($scope, element, attrs) {
        var dropdownField = element[0].querySelector('.ng-dropdown-field'),
            openClass = attrs.dropdownOpenClass || 'open',
            activeClass = attrs.dropdownActiveClass || 'active',
            options,
            dropdown;

        dropdown = {
          id: DropdownService.dropdowns.length,
          activeClass: activeClass,
          openClass: openClass,
          element: element,
          menuElement: angular.element(document.getElementById(attrs.dropdownMenu))
        };

        $scope.dropdown = DropdownService.dropdowns[dropdown.id] = dropdown;

        $scope.$watch('disabled()', function (val) {
          if (val) {
            element.addClass('dropdown-disabled');
          } else {
            element.removeClass('dropdown-disabled');
          }
        });

        function getOptions() {
          return Array.prototype.map.call(DropdownService.menuElement.children(), function (option) {
            return option;
          });
        }

        function clearCurrentOption() {
          if ($scope.currentOption) {
            angular.element($scope.currentOption).removeClass(activeClass);
            delete $scope.currentOption;
          }
        }

        function nextOption() {
          DropdownService.open(dropdown.id);
          if (!options) {
            options = getOptions();
            $scope.currentOption = options[0];
          } else {
            var index = options.indexOf($scope.currentOption) + 1;
            clearCurrentOption();
            $scope.currentOption = options.length > index ? options[index] : options[0];
          }
          angular.element($scope.currentOption).addClass(activeClass);

          DropdownService.menuElement[0].scrollTop = $scope.currentOption.offsetTop;
        }

        function previousOption() {
          DropdownService.open(dropdown.id);
          if (!options) {
            options = getOptions();
            $scope.currentOption = options[0];
          } else {
            var index = options.indexOf($scope.currentOption) - 1;
            clearCurrentOption();
            $scope.currentOption = index >= 0 ? options[index] : options[options.length - 1];
          }
          angular.element($scope.currentOption).addClass(activeClass);

          DropdownService.menuElement[0].scrollTop = $scope.currentOption.offsetTop;
        }

        angular.element(document.getElementById(attrs.dropdownMenu)).bind('mouseenter', function () {
          clearCurrentOption();
        });

        element.bind('click', function (e) {
          if (!$scope.preventOnClick && !$scope.disabled()) {
            var openTarget = angular.element(document.getElementById(attrs.dropdownMenu));

            if (DropdownService.menuElement && DropdownService.menuElement.attr('id') !== openTarget.attr('id')) {
              DropdownService.close(dropdown.id);
            }
            DropdownService.menuElement = openTarget;
            DropdownService.element = element;

            e.preventDefault();
            e.stopPropagation();

            DropdownService.toggle(dropdown.id);
          }
        });

        $document.bind('keydown', function (e) {
          if (!$scope.disabled() && (dropdown.opened || document.activeElement === dropdownField) && [9, 27, 40, 38, 13].indexOf(e.keyCode) !== -1) {

            DropdownService.element = element;
            DropdownService.menuElement = angular.element(document.getElementById(attrs.dropdownMenu));

            if (e.keyCode === 9) {
              // Tab
              DropdownService.close(dropdown.id);
              return;
            } else {
              e.preventDefault();
              e.stopPropagation();
            }

            if (e.keyCode === 27) {
              // Escape
              DropdownService.close(dropdown.id);
            } else if (e.keyCode === 40) {
              // Down
              nextOption();
            } else if (e.keyCode === 38) {
              // Up
              previousOption();
            } else if (e.keyCode === 13) {
              // Enter
              if ($scope.currentOption && dropdown.opened && document.activeElement === dropdownField) {
                $scope.currentOption.click();
              } else if (!dropdown.opened && document.activeElement === dropdownField) {
                DropdownService.open(dropdown.id);
              }
            }
          }
        });
      }
    };
  }]);
})(window.angular);