angular.module('adminApp').directive('triggerOnChange', function ($timeout) {
    return {
        restrict: 'A',
        scope: {
            changeFunction: '&'
        },
        replace: true,
        compile: function (tElem) {
            return function (scope) {
                $timeout(function () {
                    $(tElem).change(()=> {
                        if (scope.changeFunction) {
                            scope.changeFunction();
                        }
                    });
                });
            };
        }
    };
});