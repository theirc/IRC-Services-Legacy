/*
 * This is the dumping ground for all of the controlled list controllers
 * */
angular.module('adminApp')
    .controller('ServiceTypeListController', GenerateListController('ServiceTypeService'))
   

    .controller('ProviderTypeListController', GenerateListController('ProviderTypeService'))
    .controller('ProviderTypeOpenController', GenerateOpenController('ProviderTypeService',(v, i)=>{
    }))
;
