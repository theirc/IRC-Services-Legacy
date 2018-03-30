angular.module("adminApp").config(function($translateProvider){
    $translateProvider.translations('en', {
        //Main menu
        SERVICE_SEARCH: 'Service Search',
        SERVICE_MANAGEMENT: 'Service Management',
        PROFILE: 'Profile',
        ACCOUNT_SETTINGS: 'Account Settings',
        REFUGEE_ADMIN: 'REFUGEE.INFO ADMIN',
        BLOG_ENTRY_TRANSLATIONS: 'Blog Entry Translations',
        SERVICE_NEWSLETTER: 'Service Newsletter',
        NEWSLETTER_LOGS: 'Newsletter Logs',
        NEWSLETTER_SETTINGS: 'Newsletter Settings',
        SYSTEM_ADMIN: 'System Admin',
        USER_MANAGEMENT: 'User Management',
        SERVICE_PROVIDER_MANAGEMENT: 'Service Provider Management',
        GEOGRAPHIC_REGIONS: 'Geographic Regions',
        CONTROLLED_LISTS_MANAGEMENT: 'Controlled List Management',
        SERVICES_TYPES: 'Services Types',
        PROVIDER_TYPES: 'Provider Types',

        //Search Services page
        SERVICES: 'Services2',
        REGION: 'Region',
        TYPE: 'Type',
        PROVIDER: 'Provider',
        CITY: 'City',
        STATUS: 'Status',
        CLEAR_SEARCH: 'Clear Search',
        SEARCH: 'Search',
        SHOW_MAP: 'Show Map',
        HIDE_MAP: 'Hide Map',
        
        //Service Management
        SERVICE_LIST: 'Service List',
        SERVICE_CREATE: 'Service Create',
        CREATE: 'Create'
    });

    $translateProvider.translations('es', {
        //Main menu
        SERVICE_SEARCH: 'Buscar Servicios',
        SERVICE_MANAGEMENT: 'Administración de Servicios',
        PROFILE: 'Perfil',
        ACCOUNT_SETTINGS: 'Configuración de Cuenta',
        REFUGEE_ADMIN: 'Administrar REFUGEE.INFO',
        BLOG_ENTRY_TRANSLATIONS: 'Traducciones de Entradas de Blog',
        SERVICE_NEWSLETTER: 'Newsletter de Servicios',
        NEWSLETTER_LOGS: 'Registros de Newsletter',
        NEWSLETTER_SETTINGS: 'Configuración de Newsletter',
        SYSTEM_ADMIN: 'Administrar Sistema',
        USER_MANAGEMENT: 'Administración de Usuario',
        SERVICE_PROVIDER_MANAGEMENT: 'Administración de Proveedores de Servicios',
        GEOGRAPHIC_REGIONS: 'Regiones Geográficas',
        CONTROLLED_LISTS_MANAGEMENT: 'Administración de listas controladas',
        SERVICES_TYPES: 'Tipos de Servicios',
        PROVIDER_TYPES: 'Tipos de Proveedores',

        //Search Services page
        SERVICES: 'Servicios',
        REGION: 'Región',
        TYPE: 'Tipo',
        PROVIDER: 'Proveedor',
        CITY: 'Ciudad',
        STATUS: 'Estado',
        CLEAR_SEARCH: 'Borrar filtro',
        SEARCH: 'Buscar',
        SHOW_MAP: 'Mostrar Mapa',
        HIDE_MAP: 'Ocultar Mapa',
        
        //Service Management
        SERVICE_LIST: 'Lista de Servicios',
        SERVICE_CREATE: 'Crear Servicio',
        CREATE: 'Crear'
    });

    $translateProvider.registerAvailableLanguageKeys(['en', 'es'], {
        'en_*': 'en',
        'es_*': 'es'
      })
      .determinePreferredLanguage();
})