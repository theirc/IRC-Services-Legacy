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
        SERVICES: 'Services',
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
        CREATE: 'Create',

        //Login
        LOGIN_TITLE: 'Refugee.Info Admin Site',
        SIGN_IN: 'Sign in to start your session',
        EMAIL: 'Email',
        PASSWORD: 'Password',
        FORGOT_PASSWORD: 'I forgot my password',

        //Logout
        BEEN_LOGGED_OUT: 'You\'ve been logged out!',
        CLICK: 'Click',
        HERE: 'here',
        GO_BACK_APPLICATION: 'to go back to the application',

        //Activate
        PLEASE_SETUP_PASSWORD: 'Please set up a password for your account.',
        SAVE: 'Save',

        //Index
        INDEX_TITLE: 'Refugee.Info Admin Site',

        //Page
        PAGE_WAS_PUBLISHED: 'Page was published:',
        PUBLISHED: 'Published',

        //Region
        PREVIEW: 'preview',

        //Edit controls
        DELETE: 'Delete',
        EDIT: 'Edit',
        SAVE: 'Save',
        CANCEL: 'Cancel',

        //Header
        BACK: 'Back',

        //Mavbar
        TOGGLE_NAVIGATION: 'Toggle Navigation',
        SELECT_PROVIDER_FROM_LIST: 'Select a provider from the lis below',
        SIGN_OUT: 'Sign out',

        //RightSideBar
        RECENT_ACTIVITY: 'Recent Activity',
        LANGDONS_BIRTHDAY: 'Langdon\'s Birthday',
        TASKS_PROGRESS: 'Tasks Progress',
        STATS_TAB_CONTENT: 'Stats Tab Content',
        GENERAL_SETTINGS: 'General Settings',
        REPORT_PANEL_USAGE: 'Report Panel Usage',

        //Timepicker
        FROM: 'From',
        TO: 'To:',

        //App
        TRANSLATED_FIELD: 'Translated Fields',
        APP_TITLE: 'Title',
        APP_SLUG: 'App Slug',
        APP_URL: 'App Url',
        WEB_URL: 'Web Url',
        LIGHT_URL: 'Light Url',
        API_URL: 'API Url',
        AUTH_TOKEN: 'Auth Token',

        //ProviderType
        NAME: 'Name',

        //ServiceType
        SERVICE_TITLE: 'Title',
        COMMENTS: 'Comments',
        METADATA: 'Metadata',
        ICON: 'Icon',
        COLOR: 'Color',
        SERVICE_ORDERING: 'Service Ordering',

        //Newsletter
        SERVICE_CONFIRMATION_NEWSLETTER_LOGS: 'Service Confirmation Newsletter Logs',
        LOG_ID: 'Log ID',
        SERVICE: 'Service',
        DATE: 'Date',
        STATUS: 'Status',
        EMAIL_SENT_TO: 'Email sent to',
        NOTE: 'Note',
        OPEN: 'Open',
        NEWSLETTER_RESET: 'Reset',
        NEWSLETTER_SAVE: 'Save',

        //PROVIDER
        PROVIDER_NAME: 'Name',
        PROVIDER_DESCRIPTION: 'Description',
        PROVIDER_ADDRESS: 'Address',
        PROVIDER_TYPE: 'Type',
        PROVIDER_ADMINISTRATOR: 'Administrator',
        PROVIDER_PHONE_NUMBER: 'Phone Number',
        PROVIDER_WEBSITE: 'Website',
        PROVIDER_COUNTRY: 'Country',
        PROVIDER_FREEZE: 'Freeze Provider (disable user login)',
        PROVIDER_SERVICES: 'Services',
        PROVIDER_IMPERSONATE: 'Impersonate',
        PROVIDER_EXPORT_SERVICES: 'Export Services',
        PROVIDER_IMPORT_SERVICES: 'Import Services',
        PROVIDER_EDIT: 'Edit',
        PROVIDER_SAVE: 'Save',
        PROVIDER_CANCEL:  'Cancel',

        //Region
        REGION_NAME: 'Name',
        REGION_SLUG: 'Slug',
        REGION_PARENT: 'Parent',
        REGION_LEVEL: 'Level',
        REGION_CODE: 'Code',
        REGION_IS_HIDDEN: 'Is Hidden',
        REGION_LANGUAGES: 'Languages',
        REGION_TITLE: 'Title',
        REGION_OUTLINE: 'Region Outline',

        //Service Overview
        OVERVIEW: 'Service',
        CLAIMED_BY: 'Claimed by:',
        OVERVIEW_LIST: 'LIST',
        OVERVIEW_MAP: 'MAP',

        //Service Archive
        ARCHIVE_SERVICE: 'Archive Service',
        ARE_YOU_SURE_ARCHIVE: 'Are you sure you want to archive this service?:',
        ARCHIVE_CANCEL: 'No, cancel',
        ARCHIVE_YES: 'Yes, archive',

        //Service Confirm
        YOUR_ANNOTATIONS_ABOUT_SERVICE: 'Your annotations about this service:',
        SUBMIT: 'SUBMIT',
        CONFIRM: 'CONFIRM',
        ADD_NOTE: 'ADD NOTE',
        REMOVE_NOTE: 'REMOVE_NOTE',
        OPENING_HOURS: 'Opening Hours',
        SERVICE_IS_OPEN_24_7: 'Service is open 24/7',
        SERVICE_CLOSED: 'CLOSED',
        CONFIRMATION_KEY_INVALID: 'Your Confirmation Key is invalid or already has been used!',
        THANK_YOU_FOR_YOUR_CONFIRMATION: 'Thank you for your confirmation!',

        //Service Duplicate
        DUPLICATE_SERVICE: 'Duplicate Service',
        ARE_YOU_SURE_WANT_DUPLICATE: 'Are you sure you want to duplicate this service? Please provide new name:',
        DUPLICATE_NO: 'No, cancel',
        DUPLICATE_YES: 'Yes, duplicate',

        //Service View
        SERVICE_PROVIDER: 'Provider',
        SELECT_PROVIDER: 'Select the provider or search for it on the list',
        PUSH_TO_TRANSIFEX: 'Push to transifex',
        PULL_FROM_TRANSIFEX: 'Pull from transifex',
        TRANSIFEX_STATUS: 'Transifex status:',
        SERVICE_NAME: 'Name',
        SERVICE_DESCRIPTION: 'Description',
        SERVICE_ADDITIONAL_INFORMATION:'Additional Information',
        SERVICE_LANGUAGES_SPOKEN: 'Languages spoken',
        SERVICE_ADDRESS_CITY: 'Address (City)',
        SERVICE_ADDRESS_STREET: 'Address (Street)',
        SERVICE_ADDRESS_FLOOR: 'Address (floor / note about address)',
        SERVICE_ADDRESS_COUNTRY_LANGUAGE: 'Address in Country Language (not translatable field)',
        SERVICE_EXACT_LOCATION: 'Exact Location.',
        SERVICE_WANT_SET_LOCATION: 'Do you want to set location of service?',
        SERVICE_PROVIDE_EXACT_LOCATION: 'You can provide exact location (latitude and longitude) of provided service (or click on desired location on map).</p>',
        SERVICE_LATITUDE: 'Latitude',
        SERVICE_LONGITUDE: 'Longitude',
        SERVICE_TYPES : 'Types (max. 4)',
        SERVICE_REGION: 'Region',
        SERVICE_PHONE_NUMBER: 'Phone Number',
        SERVICE_EMAIL: 'Email',
        SERVICE_WEBSITE: 'Website',
        SERVICE_FACEBOOK: 'Facebook Page',
        SERVICE_COST_SERVICE: 'Cost of Service',
        SERVICE_STATUS: 'Status',
        SERVICE_TAGS: 'Tags:',
        SERVICE_CLICK_TO_CREATE: ' (click to create)',
        SERVICE_IMAGE: 'Image:',
        SERVICE_UPLOAD_IMAGE: 'Upload an image',
        SERVICE_FILE_TOO_LARGE: 'File is too large ',  
        SERVICE_FILE_MAX: 'MB: max 1MB',      
        SERVICE_ONLY_JPG: 'Only jpg and png images are allowed.',
        SERVICE_REMOVE: 'Remove',
        SERVICE_REMOVE_IMAGE: 'Remove image',
        SERVICE_OPEN_27_7: 'The service is open 24/7:',
        SERVICE_LEAVE_EMPTY_IF_CLOSED_THAT_DAY: 'Leave empty if the service is closed on that day.',
        SERVICE_CONTACT_INFORMATION: 'Contact Information',
        SERVICE_TYPE: 'Type',
        SERVICE_TEXT: 'Text',
        SERVICE_INDEX: 'Index',
        SERVICE_FOCAL_POINT: 'Focal Point - Service Newsletter',
        SERVICE_FOCAL_FIRST_NAME: 'Focal Point First Name',
        SERVICE_FOCAL_LAST_NAME: 'Focal Point Last Name',
        SERVICE_FOCAL_EMAIL: 'Focal Point Email',
        SERVICE_SECOND_FOCAL_FIRST_NAME: 'Second Focal Point First Name',
        SERVICE_SECOND_FOCAL_LAST_NAME: 'Second Focal Point Last Name',
        SERVICE_SECOND_FOCAL_EMAIL: 'Second Focal Point Email',
        SERVICE_EXCLUDE_FROM_CONFIRMATION: 'Do you want to exclude service from Confirmation Newsletter?',
        SERVICE_LAST_STATUS: 'Last Service Status:',
        SERVICE_WANT_TO_CONFIRM: 'Do you want to confirm it?',
        SERVICE_SLUG: 'Slug',
        SERVICE_SLUG_IS_UNIQUE_FIELD: 'Slug is a unique field. It is used in Transifex to mark the resources for a specified service. You can always check the slug in service edit view. The slug contains: region slug, provider id and service name with removed special characters. Sometimes, it can contain service id at the end.', 
        SERVICE_PREVIEW_LINK: 'Preview Link',
        SERVICE_TABLE_ID: 'ID',
        SERVICE_TABLE_DATE: 'Date',
        SERVICE_TABLE_STATUS: 'Status',
        SERVICE_TABLE_EMAIL: 'Email sent to',
        SERVICE_TABLE_NOTE: 'Note',

        //User list
        DATA_TABLE_FULL_FEATURES: 'Data Table With Full Features',

        //User Login
        USER_SIGN_IN: 'Sign in to start your session',
        USER_REMEMBER_ME: 'Remember Me',
        USER_SIGN_IN: 'Sign In',
        USER_FORGOT_PASSWORD: 'I forgot my password',

        //User Reset Password
        PASSWORD_RESET: 'Reset Password',
        PASSWORD_FORGOTTEN: 'Forgotten your password?',
        PASSWORD_ENTER_EMAIL_ADDRESS: 'Enter your e-mail address below, and we\'ll send you an e-mail allowing you to reset it.',
        PASSWORD_ENTER_EMAIL_TO_RESET: 'Enter your e-mail to reset password.',
        PASSWORD_EMAIL: 'Email',
        PASSWORD_BACK_TO_LOGIN: 'Back to Log In',
        PASSWORD_SEND_RESET_EMAIL: 'Send reset e-mail',
        PASSWORD_PLEASE_CONTACT_US: 'Please contact us if you have any trouble resetting your password.',
        PASSWORD_HAVE_SENT_EMAIL: 'We have sent you an e-mail. Please contact us if you do not receive it within a few minutes.',
        PASSWORD_WILL_BE_REDIRECTED: 'You will be redirected after 5 seconds...',
        PASSWORD_ENTER_NEW_TWICE: 'Enter new password twice.',
        PASSWORD_NEW: 'New Password',
        PASSWORD_NEW_AGAIN: 'New Password (again)',
        PASSWORD_BACK_TO_LOGIN: 'Back to Log In',
        
        //User view
        USER_EMAIL: 'Email:',
        USER_FIELD_REQUIRED: 'This field is required',
        USER_INVALID_EMAIL: 'Invalid email',
        USER_FIRST_NAME: 'First Name',
        USER_LAST_NAME: 'Last Name',
        USER_FIELD_TOO_LONG: 'This field is too long.',
        USER_TITLE: 'Title',
        USER_POSITION: 'Position',
        USER_PHONE_NUMBER: 'Phone Number',
        USER_INVALID_PHONE_NUMBER: 'Invalid phone number format',
        USER_IS_STAFF: 'Is Staff',
        USER_GROUPS: 'Groups',
        USER_PROVIDERS: 'Providers',
        USER_AS_TEAM_MEMBER: 'As Team Member',
        USER_SELECT_PROVIDER: 'Select the provider or search for it on the list',
        USER_AS_ADMIN: 'As Admin',

        //Login modal
        LOGIN_MODAL_TITLE: 'Log in to Refugee.Info Admin',
        LOGIN_MODAL_EMAIL: 'email',
        LOGIN_MODAL_EMAIL_REQUIRED: 'Email is required.',
        LOGIN_MODAL_PASSWORD: 'password',
        LOGIN_MODAL_PASSWORD_REQUIRED: 'Password is required.',
        LOGIN_MODAL_LOGIN: 'Login',



        


        




        
        
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
        CREATE: 'Crear',

        //Login
        LOGIN_TITLE: 'Administración del Sitio Refugee.Info',
        SIGN_IN: 'Ingrese su usuario para iniciar sesión',
        EMAIL: 'Email',
        PASSWORD: 'Contraseña',
        FORGOT_PASSWORD: 'Olvidé mi contraseña',

        //Logout
        BEEN_LOGGED_OUT: 'Ha salido de la aplicación!',
        CLICK: 'Haga Click',
        HERE: 'aquí',
        GO_BACK_APPLICATION: 'para volver a la aplicación',
        
    });

    $translateProvider.registerAvailableLanguageKeys(['en', 'es'], {
        'en_*': 'en',
        'es_*': 'es'
      })
      .determinePreferredLanguage();
})