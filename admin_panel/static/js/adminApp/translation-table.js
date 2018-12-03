angular.module("adminApp").config(function($translateProvider){
    $translateProvider.translations('en', {
        //Main menu
        SERVICE_SEARCH: 'Service Search',
        SERVICE_MANAGEMENT: 'Service Management',
        SERVICE_LINK_TO_WEB_APP: 'Go to Service Map',
        PROFILE: 'Profile',
        ACCOUNT_SETTINGS: 'Account Settings',
        PROVIDER_SETTINGS: 'Provider Settings',
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
        SERVICES_TYPES: 'Service Categories',
        PROVIDER_TYPES: 'Provider Types',
        SITE: 'Site',

        //Search Services page
        SERVICES: 'Services',
        REGION: 'Region',
        REGION_LVL1: 'Country',
        REGION_LVL2: 'Region / Area',
        REGION_LVL3: 'City',
        TYPE: 'Category',
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
        ADD: 'Add',

        //Header
        BACK: 'Back',

        //Mavbar
        TOGGLE_NAVIGATION: 'Toggle Navigation',
        SELECT_PROVIDER_FROM_LIST: 'Select a provider from the lis below',
        SIGN_OUT: 'Sign out',
        IMPERSONATING: 'Impersonating',
        STOP_IMPERSONATING: 'Stop Impersonating',

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
        PROVIDER_TITLE: 'Title',
        PROVIDER_CONTACT_NAME: 'Contact Name',
        PROVIDER_TYPE: 'Type',
        PROVIDER_FACEBOOK: 'Facebook',
        PROVIDER_TWITTER: 'Twitter',
        PROVIDER_SELECT_TYPES: 'Select Types',
        PROVIDER_ADMINISTRATOR: 'Administrator',
        PROVIDER_PHONE_NUMBER: 'Phone Number',
        PROVIDER_WEBSITE: 'Website',
        PROVIDER_COUNTRY: 'Country',
        PROVIDER_FREEZE: 'Freeze Provider (disable user login)',
        PROVIDER_SERVICES: 'Services',
        PROVIDER_IMPERSONATE: 'Impersonate',
        PROVIDER_OPEN: 'View',
        PROVIDER_EXPORT_SERVICES: 'Export Services',
        PROVIDER_IMPORT_SERVICES: 'Import Services',
        PROVIDER_EDIT: 'Edit',
        PROVIDER_SAVE: 'Save',
        PROVIDER_CANCEL:  'Cancel',
        PROVIDER_SERVICE_TYPES: 'Service Types',
        PROVIDER_META_POPULATION: 'Meta Population',
        PROVIDER_RECORD: 'Record',
        PROVIDER_REQUIREMENT: 'Requirements',
        PROVIDER_ADDITIONAL_INFO: 'Additional Information',
        PROVIDER_VACANCY: 'No Vacancy',

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
        SERVICE_ADDRESS_STREET: 'Address',
        SERVICE_ADDRESS_ADDITIONAL_DETAILS: 'Additional details',
        SERVICE_ADDRESS_COUNTRY_LANGUAGE: 'Address in Country Language (not translatable field)',
        SERVICE_EXACT_LOCATION: 'Exact Location.',
        SERVICE_WANT_SET_LOCATION: 'Do you want to set location of service?',
        SERVICE_PROVIDE_EXACT_LOCATION: 'You can provide exact location (latitude and longitude) of provided service (or click on desired location on map).</p>',
        SERVICE_LATITUDE: 'Latitude',
        SERVICE_LONGITUDE: 'Longitude',
        SERVICE_TYPES : 'Categories',
        SERVICE_MAIN_TYPE: 'Main Category',
        SERVICE_SELECT_TYPES: 'Select Types',
        SERVICE_REGION: 'Region',
        SERVICE_PHONE_NUMBER: 'Phone Number',
        SERVICE_EMAIL: 'Email',
        SERVICE_WEBSITE: 'Website',
        SERVICE_FACEBOOK: 'Facebook Page',
        SERVICE_WHATSAPP: 'Whatsapp Number',
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
        SERVICE_TYPE: 'Category',
        SERVICE_TEXT: 'Text',
        SERVICE_INDEX: 'Index',
        SERVICE_FOCAL_POINT: 'Focal Point - Service Newsletter',
        SERVICE_FOCAL_FIRST_NAME: 'Focal Point First Name',
        SERVICE_FOCAL_LAST_NAME: 'Focal Point Last Name',
        SERVICE_FOCAL_EMAIL: 'Focal Point Email',
        SERVICE_FOCAL_TITLE: 'Focal Point Title',
        SERVICE_SECOND_FOCAL_FIRST_NAME: 'Second Focal Point First Name',
        SERVICE_SECOND_FOCAL_LAST_NAME: 'Second Focal Point Last Name',
        SERVICE_SECOND_FOCAL_EMAIL: 'Second Focal Point Email',
        SERVICE_SECOND_FOCAL_TITLE: 'Second Focal Point Title',
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

        SERVICE_DRAFT: 'Draft',
        SERVICE_PRIVATE: 'Private',
        SERVICE_CURRENT: 'Public', 
        SERVICE_REJECTED: 'Rejected',
        SERVICE_CANCELED: 'Cancelled',
        SERVICE_ARCHIVED: 'Archived',

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
        USER_LANGUAGE: 'Language',
        USER_POSITION: 'Position',
        USER_PHONE_NUMBER: 'Phone Number',
        USER_INVALID_PHONE_NUMBER: 'Invalid phone number format',
        USER_IS_STAFF: 'Is Staff',
        USER_GROUPS: 'Groups',
        USER_PROVIDERS: 'Providers',
        USER_AS_TEAM_MEMBER: 'As Team Member',
        USER_SELECT_PROVIDER: 'Select the provider or search for it on the list',
        USER_AS_ADMIN: 'As Admin',
        USER_SELECT_GROUP: 'select a group',

        //Login modal
        LOGIN_MODAL_TITLE: 'Log in to Refugee.Info Admin',
        LOGIN_MODAL_EMAIL: 'email',
        LOGIN_MODAL_EMAIL_REQUIRED: 'Email is required.',
        LOGIN_MODAL_PASSWORD: 'password',
        LOGIN_MODAL_PASSWORD_REQUIRED: 'Password is required.',
        LOGIN_MODAL_LOGIN: 'Login',

        //Routes
        SERVICE_DETAILS: 'Service Details',
        SERVICE_CONFIRMATION: 'Service Confirmation',
        SYSTEM_USERS: 'System Users',
        CREATE_SYSTEM_USER: 'Create System User',
        SYSTEM_USER: 'System User',
        SERVICE_PROVIDERS: 'Service Providers',
        PROVIDER_SETTINGS: 'Provider Settings',
        SERVICE_PROVIDER_DASHBOARD: 'Service Provider Dashboard',
        SERVICE_PROVIDER_CREATE: 'Service Provider Create',
        SERVICE_PROVIDER: 'Service Provider',
        CREATE_GEOGRAPHIC_REGIONS: 'Create Geographic Region',
        GEOGRAPHIC_REGION: 'Geographic Region',
        NEW_SERVICE_TYPE: 'New Service Type',
        SERVICE_TYPE_TITLE: 'Service Type',
        NEW_PROVIDER_TYPE: 'New Provider Type',
        PROVIDER_TYPE_TITLE: 'Provider Type',

        //Tables
        TABLE_UPDATE_AT: 'Updated At',
        TABLE_SERVICE: 'Service',
        TABLE_PROVIDER: 'Provider',
        TABLE_TYPES: 'Types',
        TABLE_CITY: 'City',
        TABLE_REGION: 'Region',
        TABLE_STATUS: 'Status',
        TABLE_TRANSIFEX_STATUS: 'Transifex Status',
        TABLE_NAME: 'Name',
        TABLE_ACTIONS: 'Actions',
        TABLE_ARCHIVE: 'Archive',
        TABLE_EDIT: 'Edit',
        TABLE_DUPLICATE: 'Duplicate',
        
    });

    $translateProvider.translations('es', {
        //Main menu
        SERVICE_SEARCH: 'Buscar Servicios',
        SERVICE_MANAGEMENT: 'Administración de Servicios',
        SERVICE_LINK_TO_WEB_APP: 'Ir a CuentaNos.org',
        PROFILE: 'Perfil',
        ACCOUNT_SETTINGS: 'Configuración de Cuenta',
        PROVIDER_SETTINGS: 'Configuración de Proveedor',
        REFUGEE_ADMIN: 'Administrar REFUGEE.INFO',
        BLOG_ENTRY_TRANSLATIONS: 'Traducciones de Entradas de Blog',
        SERVICE_NEWSLETTER: 'Newsletter de Servicios',
        NEWSLETTER_LOGS: 'Registros de Newsletter',
        NEWSLETTER_SETTINGS: 'Configuración de Newsletter',
        SYSTEM_ADMIN: 'Administrar Sistema',
        USER_MANAGEMENT: 'Admin. de Usuario',
        SERVICE_PROVIDER_MANAGEMENT: 'Admin. de Proveedores',
        GEOGRAPHIC_REGIONS: 'Regiones Geográficas',
        CONTROLLED_LISTS_MANAGEMENT: 'Admin. de listas controladas',
        SERVICES_TYPES: 'Tipos de Servicios',
        PROVIDER_TYPES: 'Tipos de Proveedores',

        //Search Services page
        SERVICES: 'Servicios',
        REGION: 'Región',
        REGION_LVL1: 'País',
        REGION_LVL2: 'Departamento',
        REGION_LVL3: 'Municipalidad',
        TYPE: 'Categoría',
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
        CLICK: 'Click',
        HERE: 'aquí',
        GO_BACK_APPLICATION: 'para volver a la aplicación',

        //Activate
        PLEASE_SETUP_PASSWORD: 'Por favor ingrese una contraseña para su cuenta.',
        SAVE: 'Grabar',

        //Index
        INDEX_TITLE: 'Sitio de Administración de Refugee.Info',

        //Page
        PAGE_WAS_PUBLISHED: 'La página ha sido publicada:',
        PUBLISHED: 'Publicada',

        //Region
        PREVIEW: 'previsualizar',

        //Edit controls
        DELETE: 'Borrar',
        EDIT: 'Editar',
        SAVE: 'Grabar',
        CANCEL: 'Cancelar',
        ADD: 'Agregar',

        //Header
        BACK: 'Volver',

        //Mavbar
        TOGGLE_NAVIGATION: 'Alternar Navigación',
        SELECT_PROVIDER_FROM_LIST: 'Seleccionar un Proveedor de la lista debajo',
        SIGN_OUT: 'Salir',
        IMPERSONATING: 'Personificando',
        STOP_IMPERSONATING: 'Detener Personificación',

        //RightSideBar
        RECENT_ACTIVITY: 'Actividad Reciente',
        LANGDONS_BIRTHDAY: 'Langdon\'s Birthday',
        TASKS_PROGRESS: 'Progreso de las Tareas',
        STATS_TAB_CONTENT: 'Contenido de pestaña estadísticas',
        GENERAL_SETTINGS: 'Configuración General',
        REPORT_PANEL_USAGE: 'Uso del panel de Reporte',

        //Timepicker
        FROM: 'Desde',
        TO: 'Hasta:',

        //App
        TRANSLATED_FIELD: 'Campos traducidos',
        APP_TITLE: 'Título',
        APP_SLUG: 'App Slug',
        APP_URL: 'App Url',
        WEB_URL: 'Web Url',
        LIGHT_URL: 'Light Url',
        API_URL: 'API Url',
        AUTH_TOKEN: 'Auth Token',
        SITE: 'Sitio',

        //ProviderType
        NAME: 'Nombre',

        //ServiceType
        SERVICE_TITLE: 'Título',
        COMMENTS: 'Comentarios',
        METADATA: 'Metadata',
        ICON: 'Ícono',
        COLOR: 'Color',
        SERVICE_ORDERING: 'Orden de Servicio',

        //Newsletter

      
      SERVICE_CONFIRMATION_NEWSLETTER_LOGS: 'Registro de Newsletter de confirmación de servicios',
        LOG_ID: 'Log ID',
        SERVICE: 'Servicio',
        DATE: 'Fecha',
        STATUS: 'Estado',
        EMAIL_SENT_TO: 'Email enviado a ',
        NOTE: 'Nota',
        OPEN: 'Abierto',
        NEWSLETTER_RESET: 'Resetear',
        NEWSLETTER_SAVE: 'Grabar',

        //PROVIDER
        PROVIDER_NAME: 'Nombre',
        PROVIDER_DESCRIPTION: 'Descripción',
        PROVIDER_ADDRESS: 'Dirección',
        PROVIDER_TITLE: 'Título',
        PROVIDER_CONTACT_NAME: 'Nombre de Contacto',
        PROVIDER_TYPE: 'Tipo',
        PROVIDER_ADMINISTRATOR: 'Administrador',
        PROVIDER_PHONE_NUMBER: 'Número de Teléfono',
        PROVIDER_WEBSITE: 'Sitio Web',
        PROVIDER_FACEBOOK: 'Facebook',
        PROVIDER_TWITTER: 'Twitter',
        PROVIDER_SELECT_TYPES: 'Seleccionar Tipos',
        PROVIDER_COUNTRY: 'País',
        PROVIDER_FREEZE: 'Congelar Proveedor (deshabilitar login de usuarios)',
        PROVIDER_SERVICES: 'Servicios',
        PROVIDER_IMPERSONATE: 'Personificar',
        PROVIDER_OPEN: 'Ver',
        PROVIDER_EXPORT_SERVICES: 'Exportar Servicios',
        PROVIDER_IMPORT_SERVICES: 'Importar Servicios',
        PROVIDER_EDIT: 'Editar',
        PROVIDER_SAVE: 'Grabar',
        PROVIDER_CANCEL:  'Cancelar',
        PROVIDER_SERVICE_TYPES: 'Tipos de Servicios',
        PROVIDER_META_POPULATION: 'Población Meta',
        PROVIDER_RECORD: 'Registro',
        PROVIDER_REQUIREMENT: 'Requisitos',
        PROVIDER_ADDITIONAL_INFO: 'Información Adicional',
        PROVIDER_VACANCY: 'No Vacancia',


        //Region
        REGION_NAME: 'Nombre',
        REGION_SLUG: 'Slug',
        REGION_PARENT: 'Padre',
        REGION_LEVEL: 'Nivel',
        REGION_CODE: 'Código',
        REGION_IS_HIDDEN: 'Es oculto',
        REGION_LANGUAGES: 'Idiomas',
        REGION_TITLE: 'Título',
        REGION_OUTLINE: 'Delimitar Región',

        //Service Overview
        OVERVIEW: 'Servicio',
        CLAIMED_BY: 'Reclamado por :',
        OVERVIEW_LIST: 'LISTA',
        OVERVIEW_MAP: 'MAPA',

        //Service Archive
        ARCHIVE_SERVICE: 'Servicio de Archivo',
        ARE_YOU_SURE_ARCHIVE: 'Esta seguro de querer archivar este Servicio?:',
        ARCHIVE_CANCEL: 'No, cancelar',
        ARCHIVE_YES: 'Si, archivar',

        //Service Confirm
        YOUR_ANNOTATIONS_ABOUT_SERVICE: 'Sus anotaciones sobre este servicio:',
        SUBMIT: 'Enviar',
        CONFIRM: 'CONFIRMAR',
        ADD_NOTE: 'AGREGAR NOTA',
        REMOVE_NOTE: 'QUITAR NOTA',
        OPENING_HOURS: 'Horario de atención',
        SERVICE_IS_OPEN_24_7: 'Servicio abierto 24/7',
        SERVICE_CLOSED: 'CERRADO',
        CONFIRMATION_KEY_INVALID: 'Su clave de confirmación es inválida o ya ha sido utilizada!',
        THANK_YOU_FOR_YOUR_CONFIRMATION: 'Gracias por su confirmación!',

        //Service Duplicate
        DUPLICATE_SERVICE: 'Duplicar Servicio',
        ARE_YOU_SURE_WANT_DUPLICATE: 'Esta seguro de querer duplicar este servicio? Por favor ingrese nuevo nombre:',
        DUPLICATE_NO: 'No, cancelar',
        DUPLICATE_YES: 'Si, duplicar',

        //Service View
        SERVICE_PROVIDER: 'Proveedor',
        SELECT_PROVIDER: 'Seleccionar el Proveedor o búsquelo en la lista',
        PUSH_TO_TRANSIFEX: 'Enviar a transifex',
        PULL_FROM_TRANSIFEX: 'Recibir de transifex',
        TRANSIFEX_STATUS: 'Estado Transifex:',
        SERVICE_NAME: 'Nombre',
        SERVICE_DESCRIPTION: 'Descripción',
        SERVICE_ADDITIONAL_INFORMATION:'Información Adicional',
        SERVICE_LANGUAGES_SPOKEN: 'Idiomas hablados',
        SERVICE_ADDRESS_CITY: 'Dirección (Ciudad)',
        SERVICE_ADDRESS_STREET: 'Dirección',
        SERVICE_ADDRESS_ADDITIONAL_DETAILS: 'Detalles adicionales',
        SERVICE_ADDRESS_COUNTRY_LANGUAGE: 'Dirección en idioma local (campo no traducible)',
        SERVICE_EXACT_LOCATION: 'Ubicación exacta.',
        SERVICE_WANT_SET_LOCATION: 'Quiere establecer la ubicación del servicio?',
        SERVICE_PROVIDE_EXACT_LOCATION: 'Puede proveer la ubicación exacta (latitud y longitud) del servicio provisto (o hacer click en la ubicación deseada en el mapa).</p>',
        SERVICE_LATITUDE: 'Latitud',
        SERVICE_LONGITUDE: 'Longitud',
        SERVICE_TYPES : 'Categorías',
        SERVICE_MAIN_TYPE: 'Categoría principal',
        SERVICE_SELECT_TYPES: 'Seleccionar Tipos',
        SERVICE_REGION: 'Región',
        SERVICE_PHONE_NUMBER: 'Número de teléfono',
        SERVICE_EMAIL: 'Email',
        SERVICE_WEBSITE: 'Sitio Web',
        SERVICE_FACEBOOK: 'Página de Facebook',
        SERVICE_WHATSAPP: 'Whatsapp Number',
        SERVICE_COST_SERVICE: 'Costo del Servicio',
        SERVICE_STATUS: 'Estado',
        SERVICE_TAGS: 'Tags',
        SERVICE_CLICK_TO_CREATE: ' (click para crear)',
        SERVICE_IMAGE: 'Imagen:',
        SERVICE_UPLOAD_IMAGE: 'Subir una imagen',
        SERVICE_FILE_TOO_LARGE: 'Archivo demasiado grande ',  
        SERVICE_FILE_MAX: 'MB: max 1MB',      
        SERVICE_ONLY_JPG: 'Solo se permiten imágenes jpn y png.',
        SERVICE_REMOVE: 'Quitas',
        SERVICE_REMOVE_IMAGE: 'Quitar imagen',
        SERVICE_OPEN_27_7: 'El servicio está disponible 24/7:',
        SERVICE_LEAVE_EMPTY_IF_CLOSED_THAT_DAY: 'Dejar vacío si el servicio está cerrado ese día.',
        SERVICE_CONTACT_INFORMATION: 'Información de Contacto',
        SERVICE_TYPE: 'Categoría',
        SERVICE_TEXT: 'Texto',
        SERVICE_INDEX: 'Índice',
        SERVICE_FOCAL_TITLE: "Título Punto Focal",
        SERVICE_FOCAL_POINT: 'Punto Focal - Newsletter del Servicio',
        SERVICE_FOCAL_FIRST_NAME: 'Punto Focal Nombre',
        SERVICE_FOCAL_LAST_NAME: 'Punto Focal Apellido',
        SERVICE_FOCAL_EMAIL: 'Punto Focal Email',
        SERVICE_SECOND_FOCAL_TITLE: "Título Segundo Punto Focal",
        SERVICE_SECOND_FOCAL_FIRST_NAME: 'Segundo Punto Focal Nombre',
        SERVICE_SECOND_FOCAL_LAST_NAME: 'Segundo Punto Focal Apellido',
        SERVICE_SECOND_FOCAL_EMAIL: 'Segundo Punto Focal Email',
        SERVICE_EXCLUDE_FROM_CONFIRMATION: '¿Quiere excluir el servicio del Newsletter de confirmación?',
        SERVICE_LAST_STATUS: 'Último estado del Servicio:',
        SERVICE_WANT_TO_CONFIRM: '¿Quiere confirmarlo?',
        SERVICE_SLUG: 'Slug',
        SERVICE_SLUG_IS_UNIQUE_FIELD: 'Slug es un campo único. Es usado en Transifex para marcar los recursos para un servicio específico. Puede chequear el slug en Editar Servicio. El slug contiene: slug de región, id de proveedor y nombre del servicio con caracteres especiales removidos. A veces, puede contener el id del servicio al final.', 
        SERVICE_PREVIEW_LINK: 'Link de previsualización',
        SERVICE_TABLE_ID: 'ID',
        SERVICE_TABLE_DATE: 'Fecha',
        SERVICE_TABLE_STATUS: 'Estado',
        SERVICE_TABLE_EMAIL: 'Email enviado a',
        SERVICE_TABLE_NOTE: 'Nota',



        SERVICE_DRAFT: 'Redactado',
        SERVICE_PRIVATE: 'Privado',
        SERVICE_CURRENT: 'Público',
        SERVICE_REJECTED: 'Rechazado',
        SERVICE_CANCELED: 'Cancelado',
        SERVICE_ARCHIVED: 'Archivado',

        //User list
        DATA_TABLE_FULL_FEATURES: 'Tabla de datos con todas las características',

        //User Login
        USER_SIGN_IN: 'Regístrese para iniciar sesión',
        USER_REMEMBER_ME: 'Recuérdame',
        USER_SIGN_IN: 'Iniciar Sesión',
        USER_FORGOT_PASSWORD: 'Olvide mi contraseña',

        //User Reset Password
        PASSWORD_RESET: 'Resetear contraseña',
        PASSWORD_FORGOTTEN: '¿Olvidó su contraseña?',
        PASSWORD_ENTER_EMAIL_ADDRESS: 'Ingrese su dirección de email debajo, y le enviaremos un email con instrucciones para resetearlo.',
        PASSWORD_ENTER_EMAIL_TO_RESET: 'ingrese su email para resetear contraseña.',
        PASSWORD_EMAIL: 'Email',
        PASSWORD_BACK_TO_LOGIN: 'Volver al Log In',
        PASSWORD_SEND_RESET_EMAIL: 'Enviar email de reset',
        PASSWORD_PLEASE_CONTACT_US: 'Por favor contáctenos si tiene algún inconveniente reseteando su contraseña.',
        PASSWORD_HAVE_SENT_EMAIL: 'Le hemos enviado un email. Por favor contáctenos si no lo recibe en unos minutos.',
        PASSWORD_WILL_BE_REDIRECTED: 'Será redirigido en 5 segundos...',
        PASSWORD_ENTER_NEW_TWICE: 'Ingrese la nueva contraseña dos veces.',
        PASSWORD_NEW: 'Nueva contraseña',
        PASSWORD_NEW_AGAIN: 'Nueva contraseña (otra vez)',
        PASSWORD_BACK_TO_LOGIN: 'Volver al Log In',
        
        //User view
        USER_EMAIL: 'Email:',
        USER_FIELD_REQUIRED: 'Este campo es requerido',
        USER_INVALID_EMAIL: 'Email no válido',
        USER_FIRST_NAME: 'Nombre',
        USER_LAST_NAME: 'Apellido',
        USER_FIELD_TOO_LONG: 'El campo es muy largo',
        USER_TITLE: 'Título',
        USER_POSITION: 'Posición',
        USER_LANGUAGE: 'Lengua',
        USER_PHONE_NUMBER: 'Número de teléfono',
        USER_INVALID_PHONE_NUMBER: 'Formato de número no válido',
        USER_IS_STAFF: 'Es Staff',
        USER_GROUPS: 'Grupos',
        USER_PROVIDERS: 'Proveedores',
        USER_AS_TEAM_MEMBER: 'Como Miembro de Equipo',
        USER_SELECT_PROVIDER: 'Seleccion el proveedor o búsquelo en la lista',
        USER_AS_ADMIN: 'Como Administrador',

        //Login modal
        LOGIN_MODAL_TITLE: 'Ingrese a la administración de Refugee.Info',
        LOGIN_MODAL_EMAIL: 'email',
        LOGIN_MODAL_EMAIL_REQUIRED: 'El Email es requerido.',
        LOGIN_MODAL_PASSWORD: 'contraseña',
        LOGIN_MODAL_PASSWORD_REQUIRED: 'Contraseña requerida.',
        LOGIN_MODAL_LOGIN: 'Iniciar sesión',

        //Routes
        SERVICE_DETAILS: 'Detalles del Servicio',
        SERVICE_CONFIRMATION: 'Confirmación del Servicio',
        SYSTEM_USERS: 'Usuarios del Sistema',
        CREATE_SYSTEM_USER: 'Crear Usuario del Sistema',
        SYSTEM_USER: 'Usuario del Sistema',
        SERVICE_PROVIDERS: 'Organizaciones',
        PROVIDER_SETTINGS: 'Configuración de Proveedor',
        SERVICE_PROVIDER_DASHBOARD: 'Tablero de Proveedor de Servicio',
        SERVICE_PROVIDER_CREATE: 'Crear Proveedor de Servicio',
        SERVICE_PROVIDER: 'Organización',
        CREATE_GEOGRAPHIC_REGIONS: 'Crear Región Geográfica',
        GEOGRAPHIC_REGION: 'Región Geográfica',
        NEW_SERVICE_TYPE: 'Nuevo Tipo de Servicio',
        SERVICE_TYPE_TITLE: 'Tipo de Servicio',
        NEW_PROVIDER_TYPE: 'Nuevo Tipo de Proveedor',
        PROVIDER_TYPE_TITLE: 'Tipo de Proveedor',

        //Tables
        TABLE_UPDATE_AT: 'Actualizado al',
        TABLE_SERVICE: 'Servicio',
        TABLE_PROVIDER: 'Proveedor',
        TABLE_TYPES: 'Tipos',
        TABLE_CITY: 'Ciudad',
        TABLE_REGION: 'Región',
        TABLE_STATUS: 'Estado',
        TABLE_TRANSIFEX_STATUS: 'Estado Transifex',
        TABLE_NAME: 'Nombre',
        TABLE_ACTIONS: 'Acciones',
        TABLE_ARCHIVE: 'Archivar',
        TABLE_EDIT: 'Editar',
        TABLE_DUPLICATE: 'Duplicar'
        
    });

    $translateProvider.registerAvailableLanguageKeys(['en', 'es'], {
        'en_*': 'en',
        'es_*': 'es'
      })
      .determinePreferredLanguage();
})