/**
 * Created by reyrodrigues on 3/4/17.
 */

function GenerateListController(serviceName, and, columns) {
    return ['tableUtils', '$injector', 'selectedLanguage', '$filter', function (tableUtils, $injector, selectedLanguage, $filter) {
        var vm = this;

        vm.dtOptions = tableUtils.defaultsWithServiceName(serviceName);

        if (columns) {
            vm.dtColumns = columns.concat(
                [
                    tableUtils.newActionColumn()
                ]);
        } else {

            vm.dtColumns = [
                tableUtils.newLinkColumn('id', 'ID'),
                tableUtils.newColumn(`name`).withTitle($filter('translate')('TABLE_NAME')).notSortable(),
                tableUtils.newColumn(`name_${selectedLanguage}`).withTitle(`Name (${selectedLanguage})`),

                tableUtils.newActionColumn()
            ];
        }

        vm.createLink = '^.create';

        if (and && _.isFunction(and)) {
            and(vm, $injector);
        }
    }];
}

function GenerateOpenController(serviceName, and, storageVarName) {
    return [serviceName, 'object', 'toasty', '$state', '$injector', '$window', function (service, object, toasty, $state, $injector, $window) {
        let vm = this;
        vm.object = object;
        vm.isNew = !vm.object.hasOwnProperty('id');
        vm.isEditing = vm.isNew;
        vm.canDelete = true;


        vm.save = save;
        vm.remove = remove;
        vm.startEditing = startEditing;
        vm.stopEditing = stopEditing;
        vm.cancelEditing = cancelEditing;


        if (and && _.isFunction(and)) {
            and(vm, $injector);
        }

        function save() {
            if(storageVarName) $window.sessionStorage.removeItem(storageVarName);

            if (vm.isNew) {
                service.post(vm.object).then(function (o) {

                    $state.go('^.open', {
                        id: o.id
                    });
                    toasty.success({
                        msg: 'Record Successfully Saved!',
                        clickToClose: true,
                        showClose: false,
                        sound: false
                    });
                }).catch(e => console.log(e));
            } else {
                vm.object.save().then(() => {
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
                if(storageVarName) $window.sessionStorage.removeItem(storageVarName);

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
            if (typeof vm.object.get === 'function') {
                vm.object.get().then(o => {
                    vm.object = o;
                });
            }
        }

        function startEditing() {
            vm.isEditing = true;
        }

        function stopEditing() {
            vm.isEditing = false;
        }
    }];
}