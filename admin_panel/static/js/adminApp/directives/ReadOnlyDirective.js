angular.module('adminApp').directive('readOnlyForm', function ($timeout) {
    return {
        restrict: 'A',
        scope: {
            isEditing: '='
        },
        replace: true,
        compile: function (tElem) {
            return function (scope) {
                $timeout(function () {
                    scope.$watch('isEditing', function () {
                        if (!scope.isEditing) {
                            $('input, textarea', tElem).attr('readonly', 'readonly');
                            $('select, input[type=checkbox], input[type=file], button', tElem).attr('disabled', 'disabled');
                        } else {
                            $('input, textarea', tElem).removeAttr('readonly');
                            $('select, input[type=checkbox], button', tElem).removeAttr('disabled');
                        }
                    });
                });
            };
        }
    };
});