angular.module('adminApp').controller('ServiceTypeViewController', function (ServiceTypeService, object, toasty, $state, IconService, serviceTypes) {
    let vm = this;

    vm.$onInit = function () {
        vm.object = object;
        vm.isNew = !vm.object.hasOwnProperty('id');
        vm.isEditing = vm.isNew;
        vm.canDelete = true;
        vm.object.types_ordering = serviceTypes;

        vm.save = save;
        vm.remove = remove;
        vm.startEditing = startEditing;
        vm.stopEditing = stopEditing;
        vm.cancelEditing = cancelEditing;
        angular.element('.input-icon-picker').iconpicker({
            icons: IconService.getAllIcons().concat($.iconpicker.defaultOptions.icons),
        });

        vm.colorPickerOptions = {
            // html attributes
            required: false,
            disabled: !vm.isNew,
            placeholder: '',
            inputClass: '',
            id: 'color',
            format: 'hex',
            restrictToFormat: true,
            hue: true,
            swatchBootstrap: true,
            // buttons
            close: {
                show: true,
                label: 'Close',
                class: '',
            },
            clear: {
                show: true,
                label: 'Clear',
                class: '',
            },
            reset: {
                show: true,
                label: 'Reset',
                class: '',
            },
        };

    };


    function save() {
        vm.object.vector_icon = angular.element('.input-icon-picker').val();
        if (vm.isNew) {
            ServiceTypeService.post(vm.object).then(function (o) {
                $state.go('^.open', {id: o.id});
                toasty.success({
                    msg: 'Record Successfully Saved!',
                    clickToClose: true,
                    showClose: false,
                    sound: false
                });
            }).catch(e => console.log(e));
        } else {
            vm.object.save().then(o => {
                $state.reload();
                toasty.success({
                    msg: 'Record Successfully Saved!',
                    clickToClose: true,
                    showClose: false,
                    sound: false
                });
            }).catch(e => console.log(e));
        }

        vm.stopEditing();
    }


    function remove() {
        if (confirm('Are you sure?')) {
            if (vm.isNew) {
                $state.go('^.list');
            } else {
                vm.object.remove().then(function () {
                    $state.go('^.list');
                    toasty.success({
                        msg: 'Record Successfully Deleted!',
                        clickToClose: true,
                        showClose: false,
                        sound: false
                    });
                }).catch(e => console.log(e));
            }
            vm.stopEditing();
        }
    }

    function cancelEditing() {
        vm.stopEditing();
        $state.reload();
    }

    function startEditing() {
        vm.colorPickerOptions.disabled = false;
        vm.isEditing = true;
    }

    function stopEditing() {
        vm.colorPickerOptions.disabled = true;
        vm.isEditing = false;
    }
});
