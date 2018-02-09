angular.module('adminApp').directive('ckInline', function (staticUrl) {
    return {
        require: '?ngModel',
        link: (scope, elm, attr, ngModel) => {
            var ck = CKEDITOR.inline(elm[0], {
                disableAutoInline: true,
                autoParagraph: false,
                allowedContent: true,
                contentsCss: staticUrl + 'css/ckeditor.css',
                enterMode: 2
            });
            if (!ngModel) return;
            let empty_marker = '&lt;empty&gt;';
            let empty_marker_regex = new RegExp(empty_marker, 'g');

            let updateModel = () => {
                if (!scope.$$phase) {
                    scope.$apply(() => {
                        ngModel.$setViewValue(ck.getData().replace(empty_marker_regex, ''));
                    });
                }
            };
            ck.on('change', updateModel);
            ck.on('key', updateModel);
            ck.on('dataReady', updateModel);
            ck.on('focus', () => {
                ck.setData(ck.getData().replace(empty_marker_regex, ''));
            });
            ck.on('blur', () => {
                if (ck.getData() === '') {
                    ck.setData(empty_marker);
                } else {
                    ck.setData(ck.getData());
                }
            });
            ngModel.$render = () => {
                var value = (' ' + ngModel.$viewValue).slice(1); // deep copy of string
                if (value[0] === ' ') {
                    value = '&nbsp;' + value.substr(1);
                }
                if (value.length > 0 && value[value.length-1] === ' ') {
                    value = value.slice(0, -1) + '&nbsp;';
                }
                if (value === '') {
                    ck.setData(empty_marker);
                } else {
                    ck.setData(value);
                }
            };
        }
    };
});