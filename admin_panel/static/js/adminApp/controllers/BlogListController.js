/*
 * This is the dumping ground for all of the controlled list controllers
 * */
angular.module('adminApp')
    .controller('BlogListController', GenerateListController('BlogService', (v, i) => {
        let tableUtils = i.get('tableUtils');
        let languages = i.get('languages');
        let DTColumnBuilder = i.get('DTColumnBuilder');
        v.dtColumns = [
            tableUtils.newColumn('id', 'Id'),
            tableUtils.newDateColumn('updated_at', 'Last Updated On'),
            tableUtils.newColumn('slug', 'Slug'),
            tableUtils.newColumn('title', 'Title').notSortable(),
            tableUtils.newDateColumn('transifex.en.last_update', 'Uploaded to Transifex on').notSortable(),
            tableUtils.newColumn('transifex').withTitle('Transifex Status').notSortable().renderWith(function (data) {
                if (!data) {
                    return "";
                }
                if (data.hasOwnProperty('errors')) {
                    return data.errors;
                } else {
                    let langDict = _.fromPairs(languages);
                    return _.map(data, (v, k) => `${langDict[k]}: ${v.completed}`).join('; ');
                }
            }),
            renderColumn().withOption('width', '200px')
        ];

        function renderColumn() {
            return DTColumnBuilder.newColumn(null).withTitle('Actions').notSortable().renderWith(renderActions);

            function renderActions(data, type, full, meta) {
                return `
                        <button class="btn btn-success btn-xs" ui-sref="blog.list.push({id: '${full.id}'})">
                            <span><i class="fa fa-upload" style="padding-right: 5px"></i>Send to Transifex</span>
                        </button>
                        <button class="btn btn-success btn-xs" ui-sref="blog.list.pull({id: '${full.id}'})">
                            <span><i class="fa fa-download" style="padding-right: 5px"></i>Send Translations to Blog</span>
                        </button>
                `;
            }
        }

        v.createLink = false;
        v.dtOptions = v.dtOptions.withOption("order", [[1, "desc"]]);
    }));