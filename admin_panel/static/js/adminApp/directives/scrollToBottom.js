angular.module('adminApp').directive('scrollToBottom', function ($timeout) {
    return {
        restrict: 'A',
        link: (s, e, a)=> {
            $timeout(()=> {
                $(e).scrollTop($(e).prop('scrollHeight'));
            });
        }
    };
});
