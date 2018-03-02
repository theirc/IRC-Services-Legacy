angular.module('adminApp')
    .directive('footerActionBar', function () {
        return {
            transclude: true,
            link: function (scope, element, attrs, ctrl, transclude) {
                var e = angular.element('#footer');
                e.children().remove();
                transclude(function (clone) {
                    e.append(clone);
                });


                scope.$on('$destroy', function () {
                    e.children().remove();
                });

            }
        };
    })