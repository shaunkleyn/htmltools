// Setting descriptions for tooltips and help text
const settingDescriptions = {
    'ocs.ed.ws.gc': 'Easy Debit Group Code for web service authentication',
    'ocs.ed.ws.usr': 'Username for Easy Debit web service',
    'ocs.ed.ws.pwd': 'Password for Easy Debit web service',
    'ocs.df.scheme': 'Default scheme name for Easy Debit',
    'ocs.ed.sc.gc.map': 'Mapping between scheme names and group codes',
    'ocs.ed.ul.gc.map': 'Mapping for ultimate creditor to group code',
    'ocs.ed.do.sc.gc.map': 'Mapping for debit order scheme to group code',
    'ocs.ed.do.gc': 'Group code for debit order operations',
    'ocs.ed.passthrough': 'Whether to pass through transactions directly',
    'ocs.webhook.url.mandate': 'Webhook URL for mandate notifications',
    'ocs.webhook.url.collection': 'Webhook URL for collection notifications',
    'ocs.easy.loan.webhook.url': 'Webhook URL for Easy Loan integration',
    'ocs.ed.mandate.default.details': 'Default mandate configuration (JSON)',
    'bss.webhook.url': 'Webhook URL for Bank Statement Service notifications',
    'crs.cpb.enquiry.done.by': 'Name to show for CPB enquiries in CRS',
    'fvs.liveness.sms.header': 'SMS header for liveness verification',
    'fvs.liveness.sms.footer': 'SMS footer for liveness verification',
    'fvs.liveness.redirect.url': 'Redirect URL after liveness verification',
    'fvs.liveness.webhook.url': 'Webhook URL for liveness verification results',
    'fvs.liveness.logo': 'Logo to display during liveness verification',
    'webservice.username': 'Username for general web service authentication',
    'webservice.password': 'Password for general web service authentication',
    'webservice.groupCode': 'Group code for web service operations',
    'tca.application.key': 'Application key for Transaction Card Authorization',
    'tca.merchant.id': 'Merchant ID for Transaction Card Authorization',
    'tca.merchant.username': 'Merchant username for Transaction Card Authorization',
    'app.mandate.authentication.enabled': 'Enable mandate authentication feature',
    'app.mandate.creation.enabled': 'Enable mandate creation feature',
    'app.payments.enabled': 'Enable payments feature',
    'app.manual.payments.enabled': 'Enable manual payments feature',
    'app.transaction.history.enabled': 'Enable transaction history feature',
    'manual.payments.reference.config': 'Configuration for manual payment references',
    'app.mandate.creation.fields': 'Fields to show during mandate creation',
    'external.status.webhook.url': 'Webhook URL for external status updates',
    'pca.entity.webhook.url': 'Webhook URL for PCA entity updates'
};

const ServiceTable = Object.freeze({
    ENTITY_SERVICE: 'entity_service',
    ENTITY_SERVICE_TYPE: 'entity_service_type',
});


const SettingsTable = Object.freeze({
    ENTITY_SERVICE_SETTING: 'entity_service_setting',
    ENTITY_SERVICE_TYPE_SETTING: 'entity_service_type_setting',
});

const EntityType = Object.freeze({
    PARENT: 'parent',
    INTEGRATOR: 'integrator',
    DEVICEUSER: 'deviceuser',
    WEBSERVICE: 'webservice'
});

const InputType = Object.freeze({
    TEXT: 'text',
    PASSWORD: 'password',
    CHECKBOX: 'checkbox',
    NUMBER: 'number'
});



/**
 * Scope definitions with services and settings
 * 
 * Structure:
 * - name: Display name of the scope
 * - allowOn: Array of entities this scope can be linked to ['parent', 'integrator', 'deviceuser']
 * - settingsTable: Where settings are stored - 'entity_service_type_setting' or 'entity_service_setting' or both
 * - services: Array of service objects
 *   - name: Service identifier
 *   - display: Display name
 *   - description: Service description
 *   - allowOn: Entities this specific service can be linked to
 *   - settings: Service-specific settings (stored in entity_service_setting)
 * - settings: Scope-level settings (stored in entity_service_type_setting)
 *   - name: Setting identifier
 *   - label: Display label
 *   - type: Input type (text, checkbox, textarea, select)
 *   - allowOn: Which entities can use this setting
 *   - table: Which table stores this setting
 *   - services: Which services this setting applies to (empty = all services in scope)
 *   - defaultValue: Default value
 *   - placeholder: Placeholder text
 *   - description: Help text
 */
const scopes = {
    "AML": {
        "name": "Anti-Money Laundering Service",
        "allowOn": [EntityType.PARENT, EntityType.INTEGRATOR],
        "services": [
            {
                "name": "aml.service.aml",
                "display": "Anti-Money Laundering Service",
                "description": "Designed to detect risks associated with money laundering activities",
                "allowOn": [EntityType.PARENT, EntityType.INTEGRATOR],
                "table": [ServiceTable.ENTITY_SERVICE, ServiceTable.ENTITY_SERVICE_TYPE],
                "settings": []
            }
        ],
        "settings": []
    },

    "AVS": {
        "name": "Account Verification Service",
        "services": [
            {
                "name": "avs.services.avs",
                "display": "Account Verification",
                "description": "Can perform account verification",
                "allowOn": [EntityType.PARENT, EntityType.INTEGRATOR, EntityType.WEBSERVICE],
                "settings": [],
                "tables": [ServiceTable.ENTITY_SERVICE, ServiceTable.ENTITY_SERVICE_TYPE]
            }
        ],
        "settings": [
            {
                "name": "avs.easydebit.profile",
                "label": "EasyDebit Profile",
                "type": InputType.CHECKBOX,
                "allowOn": [EntityType.PARENT, EntityType.INTEGRATOR],
                "tables": [SettingsTable.ENTITY_SERVICE_TYPE_SETTING],
                "services": []
            },
            {
                "name": "avs.track.request",
                "label": "Track AVS Requests",
                "type": InputType.CHECKBOX,
                "allowOn": [EntityType.PARENT, EntityType.INTEGRATOR],
                "tables": [SettingsTable.ENTITY_SERVICE_TYPE_SETTING],
                "services": []
            },
            {
                "name": "ivs.track.request",
                "label": "Track IVS Requests",
                "type": InputType.CHECKBOX,
                "allowOn": [EntityType.PARENT],
                "tables": [SettingsTable.ENTITY_SERVICE_TYPE_SETTING],
                "services": []
            }
        ]
    },

    "BIVS": {
        "name": "Batch IVS",
        "description": "Batch Identity Verification Service API",
        "services": [
            {
                "name": "bivs.services.bivs",
                "display": "Batch IVS",
                "description": "Batch Identity Verification Service API",
                "settings": [],
                "tables": [ServiceTable.ENTITY_SERVICE_TYPE, ServiceTable.ENTITY_SERVICE],
                "allowOn": [EntityType.PARENT, EntityType.INTEGRATOR, EntityType.DEVICEUSER],
            }
        ],
        "settings": [
            {
                "name": "bivs.track.request",
                "label": "Track Request",
                "type": InputType.CHECKBOX,
                "allowOn": [EntityType.DEVICEUSER],
                "tables": [SettingsTable.ENTITY_SERVICE_TYPE_SETTING],
                "description": "Track BIVS requests for this entity",
                "dependsOn": "bivs-services-bivs-deviceuser:true",
                "services": []
            }
        ]
    },
    "BMS": {
        "name": "Bitventure Messaging Service",
        "services": [
            {
                "name": "bms.services.bms",
                "description": "Bitventure Messaging Service",
                "allowOn": [EntityType.PARENT, EntityType.INTEGRATOR, EntityType.DEVICEUSER],
                "tables": [ServiceTable.ENTITY_SERVICE_TYPE, ServiceTable.ENTITY_SERVICE],
                "settings": [
                    {
                        "name": "bms.entity.webhook.url",
                        "placeholder": "SMS status webhook",
                        "description": "Webhook URL for SMS status updates",
                        "helpText": "Enter the webhook URL for SMS status updates",
                        "tables": [SettingsTable.ENTITY_SERVICE_SETTING],
                        "type": InputType.TEXT,
                        "allowOn": [EntityType.INTEGRATOR],
                        "group": "SMS Settings"
                    },
                ]
            },
            {
                "name": "bms.services.ems",
                "description": "Emailing Service",
                "tables": [ServiceTable.ENTITY_SERVICE_TYPE, ServiceTable.ENTITY_SERVICE],
                "allowOn": [EntityType.PARENT, EntityType.INTEGRATOR, EntityType.DEVICEUSER],
            }
        ],
    },
    "BPS": {
        "name": "Bitventure Payment Service",
        "services": [
            {
                "name": "bps.services.rtc",
                "description": "Realtime Payments",
                "allowOn": [EntityType.PARENT, EntityType.INTEGRATOR, EntityType.DEVICEUSER],
                "tables": [ServiceTable.ENTITY_SERVICE_TYPE, ServiceTable.ENTITY_SERVICE],
                "settings": [
                    {
                        "name": "bps.ed.ws.usr",
                        "placeholder": "Username",
                        "description": "EasyDebit Username for web service authentication",
                        "helpText": "Enter the EasyDebit Username for web service authentication",
                        "tables": [SettingsTable.ENTITY_SERVICE_SETTING],
                        "type": InputType.TEXT,
                        "allowOn": [EntityType.PARENT, EntityType.INTEGRATOR],
                    },
                    {
                        "name": "bps.ed.ws.pwd",
                        "placeholder": "Password",
                        "description": "EasyDebit Password for web service authentication",
                        "helpText": "Enter the EasyDebit Password for web service authentication",
                        "tables": [SettingsTable.ENTITY_SERVICE_SETTING],
                        "type": InputType.TEXT,
                        "allowOn": [EntityType.PARENT, EntityType.INTEGRATOR],
                    },
                    {
                        "name": "bps.ed.ws.gc",
                        "placeholder": "Group Code",
                        "description": "EasyDebit Group Code for web service authentication",
                        "helpText": "Enter the EasyDebit Group Code for web service authentication",
                        "tables": [SettingsTable.ENTITY_SERVICE_SETTING],
                        "type": InputType.TEXT,
                        "allowOn": [EntityType.PARENT, EntityType.INTEGRATOR],
                    },
                    {
                        "name": "bps.entity.reference",
                        "placeholder": "Reference",
                        "description": "Reference for payment transactions",
                        "helpText": "Enter the reference for payment transactions",
                        "tables": [SettingsTable.ENTITY_SERVICE_SETTING],
                        "type": InputType.TEXT,
                        "allowOn": [EntityType.PARENT, EntityType.INTEGRATOR],
                    },
                ]
            }
        ],
        "settings": []
    },
    "BSS": {
        "name": "Bank Statements Service",
        "services": [
            {
                "name": "bss.services.bss",
                "display": "Bank Statements Service",
                "description": "Can perform bank statement retrieval and processing",
                "allowOn": [EntityType.PARENT, EntityType.INTEGRATOR],
                "tables": [ServiceTable.ENTITY_SERVICE_TYPE, ServiceTable.ENTITY_SERVICE],
                "settings": [
                    {
                        "name": "bss.redirect.url",
                        "allowOn": [EntityType.PARENT],
                        "tables": [SettingsTable.ENTITY_SERVICE_TYPE_SETTING]
                    },
                    {
                        "group": "SMS Settings",
                        "name": "bss.sms.header",
                        "allowOn": [EntityType.PARENT],
                        "tables": [SettingsTable.ENTITY_SERVICE_TYPE_SETTING]
                    },
                    {
                        "group": "SMS Settings",
                        "name": "bss.sms.footer",
                        "allowOn": [EntityType.PARENT],
                        "tables": [SettingsTable.ENTITY_SERVICE_TYPE_SETTING]
                    },
                    {
                        "group": "Entity Settings",
                        "name": "entity.redirect.url",
                        "allowOn": [EntityType.INTEGRATOR],
                        "tables": [SettingsTable.ENTITY_SETTING]
                    },
                    {
                        "group": "Entity Settings",
                        "name": "entity.webhook.url",
                        "allowOn": [EntityType.INTEGRATOR],
                        "tables": [SettingsTable.ENTITY_SETTING]
                    },
                    {
                        "group": "Email Settings",
                        "name": "message.header",
                        "allowOn": [EntityType.INTEGRATOR],
                        "tables": [SettingsTable.ENTITY_SETTING]
                    },
                    {
                        "group": "Email Settings",
                        "name": "message.footer",
                        "allowOn": [EntityType.INTEGRATOR],
                        "tables": [SettingsTable.ENTITY_SETTING]
                    },
                ]
            }
        ],
        "settings": []
    },
    "BVS": {
        "name": "Biometric Verification Service",
        "services": [
            {
                "name": "bvs.services.bvs",
                "description": "Biometric Verification Service",
                "allowOn": [EntityType.PARENT, EntityType.INTEGRATOR, EntityType.WEBSERVICE],
                "tables": [ServiceTable.ENTITY_SERVICE_TYPE, ServiceTable.ENTITY_SERVICE],
            }
        ],
        "settings": []
    },
    "CDS": {
        "name": "Card Disbursement Service",
        "services": [
            {
                "name": "cds.services.cds",
                "description": "Card Disbursement Service",
                "allowOn": [EntityType.PARENT, EntityType.INTEGRATOR, EntityType.DEVICEUSER],
                "tables": [ServiceTable.ENTITY_SERVICE_TYPE, ServiceTable.ENTITY_SERVICE],
            }
        ],
        "settings": []
    },
    "CDVS": {
        "name": "Check-Digit Validation Service",
        "services": [
            {
                "name": "cdvs.services.cdvs",
                "description": "Check-Digit Validation Service",
                "allowOn": [EntityType.PARENT, EntityType.INTEGRATOR],
                "tables": [ServiceTable.ENTITY_SERVICE_TYPE, ServiceTable.ENTITY_SERVICE],
            }
        ],
        "settings": []
    },
    "CMS": {
        "name": "Client Management Service",
        "services": [
            {
                "name": "cms.services.cms",
                "description": "Client Management",
                "allowOn": [EntityType.PARENT, EntityType.INTEGRATOR, EntityType.DEVICEUSER],
                "entityTables": [
                    {
                        "entities": [EntityType.PARENT],
                        "tables": [ServiceTable.ENTITY_SERVICE]
                    },
                    {
                        "entities": [EntityType.INTEGRATOR, EntityType.DEVICEUSER],
                        "tables": [ServiceTable.ENTITY_SERVICE_TYPE]
                    },
                ],
            },
            {
                "name": "cms.services.entity",
                "description": "Entity Management",
                "allowOn": [EntityType.PARENT, EntityType.INTEGRATOR, EntityType.DEVICEUSER],
                "entityTables": [
                    {
                        "entities": [EntityType.PARENT],
                        "tables": [ServiceTable.ENTITY_SERVICE]
                    },
                    {
                        "entities": [EntityType.INTEGRATOR, EntityType.DEVICEUSER],
                        "tables": [ServiceTable.ENTITY_SERVICE_TYPE]
                    }],
                "settings": []
            }
        ],
        "table": [
            "entity_service",
            "entity_service_type"
        ],
        "settings": [
            {
                "name": "cms.track.request",
                "allowOn": [EntityType.DEVICEUSER],
                "type": InputType.CHECKBOX,
                "table": [SettingsTable.ENTITY_SERVICE_TYPE_SETTING]
            }
        ]
    },
    "COVS": {
        "name": "Company Verification Service",
        "allowOn": [EntityType.PARENT, EntityType.INTEGRATOR, EntityType.DEVICEUSER],
        "services": [
            {
                "name": "covs.services.covs",
                "description": "Company Verification",
                "allowOn": [EntityType.PARENT, EntityType.INTEGRATOR, EntityType.DEVICEUSER],
                "tables": [ServiceTable.ENTITY_SERVICE_TYPE, ServiceTable.ENTITY_SERVICE],
            }
        ],
        "settings": []
    },
    "CRS": {
        "name": "Credit Score Service",
        "allowOn": [EntityType.PARENT, EntityType.INTEGRATOR, EntityType.DEVICEUSER],
        "services": [
            {
                "name": "crs.service.afa",
                "display": "Affordability Assessment Service",
                "description": "Can perform affordability assessment check",
                "allowOn": [EntityType.PARENT, EntityType.INTEGRATOR, EntityType.DEVICEUSER],
                "tables": [ServiceTable.ENTITY_SERVICE_TYPE],
                "entityTables": [
                    {
                        "entities": [EntityType.PARENT],
                        "tables": [ServiceTable.ENTITY_SERVICE]
                    },
                    {
                        "entities": [EntityType.PARENT, EntityType.INTEGRATOR, EntityType.DEVICEUSER],
                        "tables": [ServiceTable.ENTITY_SERVICE_TYPE]
                    }],
                "settings": [],
            },
            {
                "name": "crs.services.crs",
                "display": "Credit Rating Service",
                "description": "Credit Rating Service",
                "allowOn": [EntityType.PARENT, EntityType.INTEGRATOR, EntityType.DEVICEUSER],
                "tables": [ServiceTable.ENTITY_SERVICE_TYPE],
                "entityTables": [
                    {
                        "entities": [EntityType.PARENT],
                        "tables": [ServiceTable.ENTITY_SERVICE]
                    },
                    {
                        "entities": [EntityType.PARENT, EntityType.INTEGRATOR, EntityType.DEVICEUSER],
                        "tables": [ServiceTable.ENTITY_SERVICE_TYPE]
                    }],
                "settings": [],

            },
            {
                "name": "crs.services.report",
                "display": "Credit Report Service",
                "description": "Can perform credit report check",
                "allowOn": [EntityType.PARENT, EntityType.INTEGRATOR, EntityType.DEVICEUSER],
                "tables": [ServiceTable.ENTITY_SERVICE_TYPE],
                "entityTables": [
                    {
                        "entities": [EntityType.PARENT],
                        "tables": [ServiceTable.ENTITY_SERVICE]
                    },
                    {
                        "entities": [EntityType.PARENT, EntityType.INTEGRATOR, EntityType.DEVICEUSER],
                        "tables": [ServiceTable.ENTITY_SERVICE_TYPE]
                    }],
                "settings": [],
            },

        ],
        "settings": [
            {
                "name": "afa.disposable.income.threshold.percentage",
                "allowOn": [EntityType.INTEGRATOR, EntityType.WEBSERVICE],
                "applyToServices": ["crs.service.afa", "crs.services.crs", "crs.services.report"],
                "type": InputType.NUMBER,
                "tables": [SettingsTable.ENTITY_SERVICE_TYPE_SETTING]
            },
            {
                "name": "afa.threshold.percentage",
                "allowOn": [EntityType.INTEGRATOR, EntityType.WEBSERVICE],
                "applyToEntities": [EntityType.INTEGRATOR, EntityType.WEBSERVICE],
                "applyToServices": ["crs.service.afa", "crs.services.crs", "crs.services.report"],
                "type": InputType.NUMBER,
                "tables": [SettingsTable.ENTITY_SERVICE_TYPE_SETTING]
            },
            {
                "name": "afa.track.request",
                "allowOn": [EntityType.INTEGRATOR, EntityType.WEBSERVICE],
                "applyToEntities": [EntityType.INTEGRATOR, EntityType.WEBSERVICE],
                "applyToServices": ["crs.service.afa", "crs.services.crs", "crs.services.report"],
                "type": InputType.CHECKBOX,
                "tables": [SettingsTable.ENTITY_SERVICE_TYPE_SETTING]
            },
            {
                "name": "crs.cpb.enquiry.done.by",
                "allowOn": [EntityType.PARENT, EntityType.INTEGRATOR, EntityType.WEBSERVICE],
                "applyToEntities": [EntityType.PARENT, EntityType.INTEGRATOR, EntityType.WEBSERVICE],
                "applyToServices": ["crs.service.afa", "crs.services.crs", "crs.services.report"],
                "tables": [SettingsTable.ENTITY_SERVICE_TYPE_SETTING]
            },
            {
                "name": "crs.track.request",
                "allowOn": [EntityType.INTEGRATOR, EntityType.WEBSERVICE, EntityType.DEVICEUSER],
                "applyToEntities": [EntityType.INTEGRATOR, EntityType.WEBSERVICE, EntityType.DEVICEUSER],
                "applyToServices": ["crs.service.afa", "crs.services.crs", "crs.services.report"],
                "type": InputType.CHECKBOX,
                "tables": [SettingsTable.ENTITY_SERVICE_TYPE_SETTING]
            },
        ],
    },
    "CVS": {
       "name": "Contact Verification Service",
       "services": [
            {
               "name": "cvs.services.cvs",
               "description": "Contact Verification Service",
               "display": "Can perform retrieval of contact information",
               "settings": [
                {
                       "name": "cvs.track.request",
                       "allowOn": [EntityType.PARENT, EntityType.INTEGRATOR, EntityType.DEVICEUSER],    
                       "type": InputType.CHECKBOX,
                       "tables": [SettingsTable.ENTITY_SERVICE_TYPE_SETTING]             
                },
               ]
            }
        ],
       "settings": []
    },
    "FMS": {
       "name": "Fingerprint Matching Service",
       "allowOn": [EntityType.WEBSERVICE],
       "services": [
            {
               "name": "fms.services.match",
               "description": "Fingerprint Matching",
               "display": "Can perform fingerprint matching",
               "allowOn": [EntityType.WEBSERVICE],
               "tables": [
                    SettingsTable.ENTITY_SERVICE,
                    SettingsTable.ENTITY_SERVICE_TYPE
                ],
               "settings": []
            },
            {
               "name": "fms.services.match.extended",
               "description": "Fingerprint Registration",
               "display": "Can register a new fingerprint into the fingerprint store",
               "allowOn": [EntityType.WEBSERVICE],
                "tables": [
                    SettingsTable.ENTITY_SERVICE,
                    SettingsTable.ENTITY_SERVICE_TYPE
                ],

               "settings": []
            }
        ],
       "settings": []
    },
    "OCS": {
        "name": "Online Collections Service",
        "allowOn": ["parent", "integrator", "deviceuser"],
        "settingsTable": "entity_service_type_setting",
        "services": [
            {
                "name": "ocs.services.mandate",
                "display": "Mandate Management",
                "description": "Create and manage debit order mandates",
                "allowOn": ["parent", "integrator", "deviceuser"],
                "settings": []
            },
            {
                "name": "ocs.services.collection",
                "display": "Collection Processing",
                "description": "Process debit order collections",
                "allowOn": ["parent", "integrator", "deviceuser"],
                "settings": []
            },
            {
                "name": "ocs.services.debitorder",
                "display": "Debit Order Management",
                "description": "Manage debit order transactions",
                "allowOn": ["parent", "integrator", "deviceuser"],
                "settings": []
            }
        ],
        "settings": [
            {
                "group": "EasyDebit Connection",
                "name": "ocs.ed.ws.gc",
                "label": "Group Code",
                "type": InputType.TEXT,
                "allowOn": ["parent", "integrator"],
                "table": "entity_service_type_setting",
                "placeholder": "Enter group code",
                "services": []
            },
            {
                "group": "EasyDebit Connection",
                "name": "ocs.ed.ws.usr",
                "label": "Username",
                "type": InputType.TEXT,
                "allowOn": ["parent", "integrator"],
                "table": "entity_service_type_setting",
                "placeholder": "Enter username",
                "services": []
            },
            {
                "group": "EasyDebit Connection",
                "name": "ocs.ed.ws.pwd",
                "label": "Password",
                "type": "password",
                "allowOn": ["parent", "integrator"],
                "table": "entity_service_type_setting",
                "placeholder": "Enter password",
                "services": []
            },
            {
                "group": "EasyDebit Configuration",
                "name": "ocs.df.scheme",
                "label": "Default Scheme",
                "type": "text",
                "allowOn": ["parent"],
                "table": "entity_service_type_setting",
                "placeholder": "Enter scheme name",
                "description": "Default scheme name for this entity",
                "services": []
            },
            {
                "group": "EasyDebit Configuration",
                "name": "ocs.ed.sc.gc.map",
                "label": "Scheme to Group Code Map",
                "type": "textarea",
                "allowOn": ["parent", "integrator"],
                "table": "entity_service_type_setting",
                "placeholder": '[{"map": "SCHEME1", "gc": "GC1"}]',
                "description": "JSON mapping of scheme names to group codes",
                "services": []
            },
            {
                "group": "EasyDebit Configuration",
                "name": "ocs.ed.ul.gc.map",
                "label": "Ultimate Creditor to Group Code Map",
                "type": "textarea",
                "allowOn": ["parent", "integrator"],
                "table": "entity_service_type_setting",
                "placeholder": "Leave blank if not used",
                "services": []
            },
            {
                "group": "EasyDebit Configuration",
                "name": "ocs.ed.passthrough",
                "label": "Passthrough Mode",
                "type": "checkbox",
                "allowOn": ["parent", "integrator"],
                "table": "entity_service_type_setting",
                "defaultValue": true,
                "services": []
            },
            {
                "group": "Webhooks",
                "name": "ocs.webhook.url.mandate",
                "label": "Mandate Webhook URL",
                "type": "text",
                "allowOn": ["parent", "integrator"],
                "table": "entity_service_type_setting",
                "placeholder": "https://example.com/webhook/mandate",
                "services": []
            },
            {
                "group": "Webhooks",
                "name": "ocs.webhook.url.collection",
                "label": "Collection Webhook URL",
                "type": "text",
                "allowOn": ["parent", "integrator"],
                "table": "entity_service_type_setting",
                "placeholder": "https://example.com/webhook/collection",
                "services": []
            },
            {
                "group": "Webhooks",
                "name": "ocs.easy.loan.webhook.url",
                "label": "Easy Loan Webhook URL",
                "type": "text",
                "allowOn": ["integrator"],
                "table": "entity_service_setting",
                "placeholder": "https://example.com/webhook/easyloan",
                "description": "Webhook for Easy Loan integration",
                "services": ["ocs.services.collection", "ocs.services.mandate", "ocs.services.debitorder"]
            },
            {
               "group": "Default Mandate Details",
               "name": "ocs.ed.mandate.default.details",
               "field": "tracking",
               "label": "Tracking",
               "placeholder": "Enable tracking",
               "description": "Enable tracking",
               "type": "checkbox",
               "defaultValue": true,
               "services": ["ocs.services.mandate"]
            },
            {
               "group": "Default Mandate Details",
               "name": "ocs.ed.mandate.default.details",
               "field": "frequency",
               "label": "Frequency",
               "placeholder": "Enter Frequency",
               "description": "Enter default frequency for mandates",
               "type": "dropdown",
               "defaultValue": "MONTHLY",
               "values": ["ADHOC", "WEEKLY", "FORTNIGHTLY", "MONTHLY", "QUARTERLY", "BIANUALLY", "ANNUALLY", "ONCE_OFF"],
               "services": ["ocs.services.mandate"]
            },
            {
               "group": "Default Mandate Details",
               "name": "ocs.ed.mandate.default.details",
               "field": "mandateType",
               "label": "Mandate Type",
               "placeholder": "Enter Mandate Type",
               "description": "Enter default mandate type for mandates",
               "type": "dropdown",
               "defaultValue": "Usage",
               "values": [{"key": 1,"value": "Fixed" }, {"key": 2,"value": "Variable" }, {"key": 3,"value": "Usage" }],
               "services": ["ocs.services.mandate"]
            },
            {
               "group": "Default Mandate Details",
               "name": "ocs.ed.mandate.default.details",
               "field": "adjustmentType",
               "label": "Adjustment Type",
               "placeholder": "Enter Adjustment Type",
               "description": "Enter default adjustment type for mandates",
               "type": "radio",
               "defaultValue": "RATE",
               "values": [{"key": 1,"value": "RATE" }, {"key": 2,"value": "AMOUNT" }],
               "services": ["ocs.services.mandate"]
            },
            {
               "group": "Default Mandate Details",
               "name": "ocs.ed.mandate.default.details",
               "field": "adjustmentValue",
               "label": "Adjustment Value",
               "placeholder": "Enter Adjustment Value",
               "description": "Enter default adjustment value for mandates",
               "type": "textbox",
               "defaultValue": "1",
               "services": ["ocs.services.mandate"]
            },
            {
               "group": "Default Mandate Details",
               "name": "ocs.ed.mandate.default.details",
               "field": "adjustmentFrequency",
               "label": "Adjustment Frequency",
               "placeholder": "Enter Adjustment Frequency",
               "description": "Enter default adjustment frequency for mandates",
               "type": "dropdown",
               "defaultValue": "ANNUALLY",
               "values": ["ANNUALLY", "BIANNUALLY", "QUARTERLY", "REPO", "NEVER", "OTHER"],
               "services": ["ocs.services.mandate"]
            },
            {
               "group": "Default Mandate Details",
               "name": "ocs.ed.mandate.default.details",
               "field": "generateContractReference",
               "label": "Generate Contract Reference",
               "placeholder": "Enter Generate Contract Reference",
               "description": "Enter default generate contract reference for mandates",
               "type": "checkbox",
               "defaultValue": "true",
               "services": ["ocs.services.mandate"]
            },
            {
               "group": "Default Mandate Details",
               "name": "ocs.ed.mandate.default.details",
               "field": "referenceFormat",
               "label": "Contract Reference Format",
               "placeholder": "XXXXXXX_******",
               "description": "Enter default contract reference format for mandates",
               "type": "textbox",
               "maxLength": 14,
               "defaultValue": "",
               "dependsOn": "generateContractReference:true",
               "dependencyAction": "disable",
               "services": ["ocs.services.mandate"]
            },
            {
               "group": "Default Mandate Details",
               "name": "ocs.ed.mandate.default.details",
               "field": "debitClassification",
               "label": "Debit Classification",
               "placeholder": "Enter Debit Classification",
               "description": "Enter default debit classification for mandates",
               "type": "dropdown",
               "defaultValue": "LRM",
               "sort": true,
               "values" : [
                {"key": "IRP", "value": "IRP - Insurance Premium"},
                {"key": "PFC", "value": "PFC - Pension Fund Contribution"},
                {"key": "MAFC", "value": "MAFC - Medical Aid Fund Contribution"},
                {"key": "UTP", "value": "UTP - Unit Trust Purchase"},
                {"key": "HPR", "value": "HPR - H.P. Repayment"},
                {"key": "ACR", "value": "ACR - Account Repayment"},
                {"key": "LRM", "value": "LRM - Loan Repayment"},
                {"key": "RLP", "value": "RLP - Rental/Lease"},
                {"key": "SCMSA", "value": "SCMSA - Service Charge"},
                {"key": "SCVA", "value": "SCVA - Service Charge"},
                {"key": "VATC", "value": "VATC - Value Added Tax"},
                {"key": "RENTAL", "value": "RENTAL - Rent"},
                {"key": "BNDR", "value": "BNDR - Bond Repayment"},
                {"key": "BUDT", "value": "BUDT - Debit Transfer"},
                {"key": "BCCD", "value": "BCCD - Cheque Card Debits"},
                {"key": "CRC", "value": "CRC - Charitable or religious contributions"},

               ],
               "services": ["ocs.services.mandate"]
            },
            {
               "group": "Default Mandate Details",
               "name": "ocs.ed.mandate.default.details",
               "field": "generateInstallment",
               "label": "Generate Installment",
               "placeholder": "Generate Installment",
               "description": "generate installment for mandates",
               "type": "checkbox",
               "defaultValue": true,
               "services": ["ocs.services.mandate"]
            },
            {
               "group": "Default Mandate Details",
               "name": "ocs.ed.mandate.default.details",
               "field": "calculateInstallment",
               "label": "Calculate Installment",
               "placeholder": "Calculate Installment",
               "description": "calculate installment for mandates",
               "type": "checkbox",
               "defaultValue": false,
               "services": ["ocs.services.mandate"]
            },
            {
               "group": "Default Mandate Details",
               "name": "ocs.ed.mandate.default.details",
               "field": "dateAdjustmentAllowed",
               "label": "Date Adjustment Allowed",
               "placeholder": "Date Adjustment Allowed",
               "description": "Allow date adjustment for mandates",
               "type": "checkbox",
               "translateValues": {"true": "Y", "false": "N"},
               "defaultValue": true,
               "services": ["ocs.services.mandate"]
            },
            {
               "group": "Default Mandate Details",
               "name": "ocs.ed.mandate.default.details",
               "field": "maximumInstallmentAmount",
               "label": "Maximum Installment Amount",
               "placeholder": "Enter Maximum Installment Amount",
               "description": "Enter default maximum installment amount for mandates",
               "type": "number",
               "defaultValue": "1000",
               "services": ["ocs.services.mandate"]
            },
            {
               "group": "Default Mandate Details",
               "name": "ocs.ed.mandate.default.details",
               "field": "scheme",
               "label": "Scheme",
               "placeholder": "Enter Scheme",
               "description": "Enter default scheme for mandates",
               "helpText": "This is used to retrieve mandates with the same scheme from TCA",
               "type": "textbox",
               "defaultValue": "",
               "services": ["ocs.services.mandate"]
            },
            {
                "group": "Device User",
                "name": "external.status.webhook.url",
                "label": "External Status Webhook URL",
                "type": "text",
                "allowOn": ["deviceuser"],
                "table": "entity_service_type_setting",
                "placeholder": "https://api.bitventure.co.za/tca/webhook/easydebit/",
                "description": "Integration with RabbitMQ for TT3 receipt printing",
                "services": []
            }
        ]
    },

    "TCA": {
        "name": "Transaction Card Authorisation",
        "allowOn": ["parent", "integrator", "deviceuser"],
        "settingsTable": "entity_service_type_setting",
        "services": [
            {
                "name": "tca.services.mca",
                "display": "Mandate Card Authorization",
                "description": "Search, retrieve and authenticate mandates",
                "allowOn": ["parent", "integrator", "deviceuser"],
                "settings": [
                    {
                        "name": "webservice.username",
                        "label": "Webservice Username",
                        "type": "text",
                        "allowOn": ["parent", "integrator"],
                        "table": "entity_service_setting",
                        "services": ["tca.services.mca"]
                    },
                    {
                        "name": "webservice.password",
                        "label": "Webservice Password",
                        "type": "password",
                        "allowOn": ["parent", "integrator"],
                        "table": "entity_service_setting",
                        "services": ["tca.services.mca"]
                    }
                ]
            },
            {
                "name": "tca.services.pca",
                "display": "Payment Card Authorization",
                "description": "Authorize card payments",
                "allowOn": ["parent", "integrator", "deviceuser"],
                "settings": []
            },
            {
                "name": "tca.services.rcp",
                "display": "Recurring Card Payment",
                "description": "Submit recurring card payments",
                "allowOn": ["parent", "integrator", "deviceuser"],
                "settings": []
            }
        ],
        "settings": [
            {
                "group": "EasyPOS Settings.EasyDebit Menu",
                "name": "app.mandate.authentication.enabled",
                "label": "Show EasyDebit Menu",
                "type": "checkbox",
                "allowOn": ["parent","deviceuser"],
                "table": "entity_service_type_setting",
                "services": []
            },
            {
                "group": "EasyPOS Settings.EasyDebit Menu",
                "name": "app.mandate.creation.enabled",
                "label": "Allow capturing of mandates",
                "dependsOn": "app.mandate.authentication.enabled:true",
                "type": "checkbox",
                "allowOn": ["deviceuser"],
                "table": "entity_service_type_setting",
                "services": ["parent","deviceuser"]
            },
            {
                "group": "EasyPOS Settings.EasyDebit Menu",
                "name": "app.mandate.creation.fields",
                "label": "Optional fields to show during mandate creation",
                "dependsOn": "app.mandate.authentication.enabled:true",
                "type": "checkbox",
                "allowOn": ["deviceuser"],
                "table": "entity_service_type_setting",
                "services": ["parent","deviceuser"]
            },
            {
                "group": "EasyPOS Settings.EasyPOS Menu",
                "name": "app.payments.enabled",
                "label": "Show EasyPOS Menu",
                "type": "checkbox",
                "allowOn": ["deviceuser"],
                "table": "entity_service_type_setting",
                "services": ["parent","deviceuser"]
            },
            {
                "group": "EasyPOS Settings.EasyPOS Menu",
                "name": "app.manual.payments.enabled",
                "label": "Show Manual Payment Option",
                "dependsOn": "app.payments.enabled:true",
                "type": "checkbox",
                "allowOn": ["deviceuser"],
                "table": "entity_service_type_setting",
                "services": ["parent","deviceuser"]
            },
            {
                "group": "EasyPOS Settings.EasyPOS Menu",
                "name": "app.transaction.history.enabled",
                "label": "Show Transaction History Option",
                "dependsOn": "app.payments.enabled:true",
                "type": "checkbox",
                "allowOn": ["deviceuser"],
                "table": "entity_service_type_setting",
                "services": ["parent","deviceuser"]
            },


            {
                "group": "Ecentric Configuration",
                "name": "tca.application.key",
                "label": "Application Key",
                "type": "text",
                "allowOn": ["deviceuser"],
                "table": "entity_service_type_setting",
                "placeholder": "Enter application key",
                "services": []
            },
            {
                "group": "Ecentric Configuration",
                "name": "tca.merchant.id",
                "label": "Merchant ID",
                "type": "text",
                "allowOn": ["deviceuser"],
                "table": "entity_service_type_setting",
                "placeholder": "Enter merchant ID",
                "description": "Will be prepended with zeros",
                "services": []
            },
            {
                "group": "Ecentric Configuration",
                "name": "tca.merchant.username",
                "label": "Merchant Username",
                "type": "text",
                "allowOn": ["deviceuser"],
                "table": "entity_service_type_setting",
                "placeholder": "default",
                "defaultValue": "default",
                "services": []
            },
            {
                "group": "EasyPOS Menu Options",
                "name": "app.payments.enabled",
                "label": "Show EasyPOS Menu",
                "type": "checkbox",
                "allowOn": ["deviceuser"],
                "table": "entity_service_type_setting",
                "defaultValue": true,
                "services": []
            },
            {
                "group": "EasyPOS Menu Options",
                "name": "app.manual.payments.enabled",
                "label": "Show Manual Payments Option",
                "type": "checkbox",
                "allowOn": ["deviceuser"],
                "table": "entity_service_type_setting",
                "defaultValue": true,
                "dependsOn": "app.payments.enabled:true",
                "services": []
            },
            {
                "group": "EasyPOS Menu Options",
                "name": "app.transaction.history.enabled",
                "label": "Show Transaction History Option",
                "type": "checkbox",
                "allowOn": ["deviceuser"],
                "table": "entity_service_type_setting",
                "defaultValue": true,
                "services": []
            },
            {
                "group": "EasyPOS Menu Options",
                "name": "manual.payments.reference.config",
                "label": "Manual Payment Reference Fields",
                "type": "special",
                "allowOn": ["deviceuser"],
                "table": "entity_service_type_setting",
                "description": "Configure additional reference fields for manual payments",
                "services": []
            },
            {
                "group": "Mandate Features",
                "name": "app.mandate.authentication.enabled",
                "label": "Enable Mandate Authentication",
                "type": "checkbox",
                "allowOn": ["deviceuser"],
                "table": "entity_service_type_setting",
                "defaultValue": true,
                "description": "Determines if EasyDebit menu option should show",
                "services": []
            },
            {
                "group": "Mandate Features",
                "name": "app.mandate.creation.enabled",
                "label": "Enable Mandate Creation",
                "type": "checkbox",
                "allowOn": ["deviceuser"],
                "table": "entity_service_type_setting",
                "defaultValue": true,
                "description": "Determines if Mandate options are shown on EasyDebit menu",
                "services": []
            },
            {
                "group": "Mandate Features",
                "name": "app.mandate.creation.fields",
                "label": "Mandate Creation Fields",
                "type": "text",
                "allowOn": ["deviceuser"],
                "table": "entity_service_type_setting",
                "placeholder": '["debtor.email"]',
                "description": "Allowed values: debtor.name, debtor.accountType, debtor.branchCode, debtor.mobileNumber, debtor.email",
                "services": []
            }
        ]
    }
};

// Mandate defaults configuration for special handling
const mandateDefaultsConfig = {
    mandateType: { label: "Mandate Type", type: "select", options: ["Usage", "Variable", "Fixed"], default: "Usage" },
    debitClassification: { label: "Debit Classification", type: "text", default: "LRM" },
    maximumInstallmentAmount: { label: "Maximum Installment Amount", type: "number", default: "10000", description: "Don't add cents or decimal points" },
    frequency: { label: "Frequency", type: "select", options: ["MONTHLY", "QUARTERLY", "YEARLY"], default: "MONTHLY" },
    tracking: { label: "Tracking Enabled", type: "checkbox", default: true },
    dateAdjustmentAllowed: { label: "Date Adjustment Allowed", type: "select", options: ["Y", "N"], default: "Y" },
    adjustmentFrequency: { label: "Adjustment Frequency", type: "select", options: ["MONTHLY", "QUARTERLY", "ANNUALLY"], default: "ANNUALLY" },
    adjustmentType: { label: "Adjustment Type", type: "select", options: ["RATE", "FIXED"], default: "RATE" },
    adjustmentValue: { label: "Adjustment Value", type: "text", default: "1" },
    generateInstallment: { label: "Generate Installment", type: "checkbox", default: true },
    calculateInstallment: { label: "Calculate Installment", type: "checkbox", default: false },
    generateContractReference: { label: "Generate Contract Reference", type: "checkbox", default: true },
    referenceFormat: { label: "Contract Reference Format", type: "text", default: "CLIENT_*******", description: "Only change 'CLIENT'. 'CLIENT_' (including underscore) cannot be more than 8 characters. The asterisk will be replaced by a randomly generated string when mandate is created" },
    scheme: { label: "Scheme", type: "text", default: "" }
};

// Manual payment reference fields configuration
const manualPaymentReferenceConfig = {
    customerReference: { label: "Customer Reference", type: "select", options: ["enabled", "disabled", "required"], default: "disabled" },
    internalReference: { label: "Internal Reference", type: "select", options: ["enabled", "disabled", "required"], default: "disabled" }
};
