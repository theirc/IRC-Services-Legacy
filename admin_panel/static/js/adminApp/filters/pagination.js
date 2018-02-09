angular.module('adminApp')
    .filter('startFrom', () => {
        return (input, start) =>  {
            start = +start;
            if (input) {
                return input.slice(start);
            }
            else {
                return 0;
            }
        }
    });