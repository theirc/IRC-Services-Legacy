/**
 * Created by reyrodrigues on 1/2/17.
 */
angular.module('adminApp')
    .controller('ConversationListController', function (tableUtils) {
        var vm = this;
        vm.dtOptions = tableUtils.defaultsWithServiceName('ConversationService');

        vm.dtColumns = [
            tableUtils.newColumn('id').withTitle('ID'),
            tableUtils.newDateColumn('updated', 'Updated'),
            tableUtils.newLinkColumn('object_id', 'Object Id'),
            tableUtils.newLinkColumn('participants', 'From').notSortable(),
            tableUtils.newActionColumn()
        ];
        vm.createLink = '^.create';

    })
    .controller('ConversationOpenController', function (DTOptionsBuilder, DTColumnBuilder, $rootScope,
                                                        ConversationService, MessageService, object, messages, $state,
                                                        facebookIdsToIgnore) {
        var vm = this;
        vm.object = object;
        vm.messages = messages;
        vm.isNew = !vm.object.hasOwnProperty('id');
        vm.selectedLanguageTab = 'en';
        vm.isEditing = false;
        vm.object.from_object_id = _.first(
            messages.map((m)=>m.from_object_id)
                .filter(o=>(facebookIdsToIgnore.indexOf(o) == -1))
        );

        vm.entities = _.uniqBy(
            messages
                .filter(m=>(facebookIdsToIgnore.indexOf(m.from_object_id) == -1))
                .map((m)=> (m.analysis && m.analysis.named_entities) || [])
                .reduce((a, b)=> a.concat(b), []),
            (m) => m.text + m.tag
        );

        vm.sendMessage = function () {
            return ConversationService.sendMessage(vm.object.id, vm.message).then(function () {
                vm.message = '';
            });
        };

        vm.updateConversation = function () {
            return ConversationService.updateConversation(vm.object.id).then(()=> {
                $state.reload();
            });
        };
        vm.runAnalysis = function () {
            return ConversationService.runAnalysis(vm.object.id).then(()=> {
                $state.reload();
            });
        };

        window.vm = vm;
        window.service = ConversationService;
    })
;