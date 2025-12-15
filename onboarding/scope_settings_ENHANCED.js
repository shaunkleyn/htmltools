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
    'manual.payments.reference.config': 'Configuration for manual payment references'
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
    NUMBER: 'number',
    TEXTAREA: 'textarea',
    SELECT: 'select'
});

/**
 * Scope definitions with services and settings
 * Generated from CSV data with enhanced JSON field splitting
 */
const scopes = {
    "AML": {
        "name": "Anti-Money Laundering Service",
        "allowOn": [EntityType.INTEGRATOR, EntityType.PARENT],
        "services": [
            {
                "name": "aml.service.aml",
                "display": "Anti-Money Laundering Service",
                "description": "Designed to detect risks associated with money laundering activities",
                "allowOn": [EntityType.INTEGRATOR, EntityType.PARENT],
                "settings": [
                ]
            }
        ],
        "settings": [
        ]
    },
    "AVS": {
        "name": "Account Verification Service API",
        "allowOn": [EntityType.DEVICEUSER, EntityType.INTEGRATOR, EntityType.PARENT],
        "services": [
            {
                "name": "avs.services.avs",
                "display": "Account Verification",
                "description": "Can perform account verification",
                "allowOn": [EntityType.DEVICEUSER, EntityType.INTEGRATOR, EntityType.PARENT],
                "tables": [ServiceTable.ENTITY_SERVICE_TYPE],
                "settings": [
                ]
            }
        ],
        "settings": [
            {
                "name": "avs.easydebit.profile",
                "allowOn": [EntityType.INTEGRATOR, EntityType.PARENT],
                "table": SettingsTable.ENTITY_SERVICE_TYPE_SETTING,
                "type": InputType.CHECKBOX
            },
            {
                "name": "avs.track.request",
                "allowOn": [EntityType.INTEGRATOR, EntityType.PARENT],
                "table": SettingsTable.ENTITY_SERVICE_TYPE_SETTING,
                "type": InputType.CHECKBOX
            },
            {
                "name": "ivs.track.request",
                "allowOn": [EntityType.PARENT],
                "table": SettingsTable.ENTITY_SERVICE_TYPE_SETTING,
                "type": InputType.CHECKBOX
            }
        ]
    },
    "BIVS": {
        "name": "Batch Identity Verification Service API",
        "allowOn": [EntityType.DEVICEUSER, EntityType.INTEGRATOR, EntityType.PARENT],
        "services": [
            {
                "name": "bivs.services.bivs",
                "display": "Batch IVS",
                "description": "Can upload ivs batch",
                "allowOn": [EntityType.DEVICEUSER, EntityType.INTEGRATOR, EntityType.PARENT],
                "tables": [ServiceTable.ENTITY_SERVICE_TYPE],
                "settings": [
                ]
            }
        ],
        "settings": [
            {
                "name": "bivs.track.request",
                "table": SettingsTable.ENTITY_SERVICE_TYPE_SETTING,
                "type": InputType.CHECKBOX
            }
        ]
    },
    "BMS": {
        "name": "Messaging Service API",
        "allowOn": [EntityType.DEVICEUSER, EntityType.INTEGRATOR, EntityType.PARENT],
        "services": [
            {
                "name": "bms.services.bms",
                "display": "Messaging Service",
                "description": "Can perform the sending of sms",
                "allowOn": [EntityType.DEVICEUSER, EntityType.INTEGRATOR, EntityType.PARENT],
                "settings": [
                ]
            }
        ],
        "settings": [
        ]
    },
    "BPS": {
        "name": "Bitventure Payment Service",
        "allowOn": [EntityType.DEVICEUSER, EntityType.INTEGRATOR, EntityType.PARENT],
        "services": [
            {
                "name": "bps.services.rtc",
                "display": "Realtime Payments",
                "description": "Realtime Payments Service",
                "allowOn": [EntityType.DEVICEUSER, EntityType.INTEGRATOR, EntityType.PARENT],
                "tables": [ServiceTable.ENTITY_SERVICE_TYPE],
                "settings": [
                ]
            }
        ],
        "settings": [
            {
                "name": "bps.ed.ws.gc",
                "allowOn": [EntityType.INTEGRATOR, EntityType.PARENT],
                "table": SettingsTable.ENTITY_SERVICE_TYPE_SETTING,
                "type": InputType.CHECKBOX
            },
            {
                "name": "bps.ed.ws.pwd",
                "allowOn": [EntityType.INTEGRATOR, EntityType.PARENT],
                "table": SettingsTable.ENTITY_SERVICE_TYPE_SETTING,
                "type": InputType.CHECKBOX
            },
            {
                "name": "bps.ed.ws.usr",
                "allowOn": [EntityType.INTEGRATOR, EntityType.PARENT],
                "table": SettingsTable.ENTITY_SERVICE_TYPE_SETTING,
                "type": InputType.CHECKBOX
            },
            {
                "name": "bps.entity.reference",
                "allowOn": [EntityType.INTEGRATOR, EntityType.PARENT],
                "table": SettingsTable.ENTITY_SERVICE_TYPE_SETTING,
                "type": InputType.CHECKBOX
            }
        ]
    },
    "BSS": {
        "name": "Bank Statement Service API",
        "allowOn": [EntityType.DEVICEUSER, EntityType.INTEGRATOR, EntityType.PARENT],
        "services": [
            {
                "name": "bss.services.bss",
                "display": "Bank Statements Service",
                "description": "Can perform the retrievel of bank statements",
                "allowOn": [EntityType.DEVICEUSER, EntityType.INTEGRATOR, EntityType.PARENT],
                "tables": [ServiceTable.ENTITY_SERVICE_TYPE, ServiceTable.ENTITY_SERVICE_TYPE],
                "settings": [
                    {
                        "name": "entity.redirect.url",
                        "allowOn": [EntityType.INTEGRATOR],
                        "table": SettingsTable.ENTITY_SERVICE_SETTING,
                        "type": InputType.TEXT
                    },
                    {
                        "name": "entity.webhook.url",
                        "allowOn": [EntityType.INTEGRATOR],
                        "table": SettingsTable.ENTITY_SERVICE_SETTING,
                        "type": InputType.TEXT
                    },
                    {
                        "name": "message.footer",
                        "allowOn": [EntityType.INTEGRATOR],
                        "table": SettingsTable.ENTITY_SERVICE_SETTING,
                        "type": InputType.TEXT
                    },
                    {
                        "name": "message.header",
                        "allowOn": [EntityType.INTEGRATOR],
                        "table": SettingsTable.ENTITY_SERVICE_SETTING,
                        "type": InputType.TEXT
                    }
                ]
            }
        ],
        "settings": [
            {
                "name": "bss.redirect.url",
                "allowOn": [EntityType.PARENT],
                "table": SettingsTable.ENTITY_SERVICE_TYPE_SETTING,
                "type": InputType.CHECKBOX
            },
            {
                "name": "bss.sms.footer",
                "allowOn": [EntityType.PARENT],
                "table": SettingsTable.ENTITY_SERVICE_TYPE_SETTING,
                "type": InputType.CHECKBOX
            },
            {
                "name": "bss.sms.header",
                "allowOn": [EntityType.PARENT],
                "table": SettingsTable.ENTITY_SERVICE_TYPE_SETTING,
                "type": InputType.CHECKBOX
            }
        ]
    },
    "BVS": {
        "name": "Biometric Verification Service",
        "allowOn": [EntityType.DEVICEUSER, EntityType.INTEGRATOR, EntityType.PARENT, EntityType.WEBSERVICE],
        "services": [
            {
                "name": "bvs.services.bvs",
                "display": "Biometric Verification Service",
                "description": "Biometric Verification Service",
                "allowOn": [EntityType.DEVICEUSER, EntityType.INTEGRATOR, EntityType.PARENT, EntityType.WEBSERVICE],
                "settings": [
                ]
            }
        ],
        "settings": [
        ]
    },
    "CDS": {
        "name": "Card Disbursement Service",
        "allowOn": [EntityType.DEVICEUSER, EntityType.INTEGRATOR, EntityType.PARENT],
        "services": [
            {
                "name": "cds.services.cds",
                "display": "Card Disbursement",
                "description": "Card Disbursement",
                "allowOn": [EntityType.DEVICEUSER, EntityType.INTEGRATOR, EntityType.PARENT],
                "settings": [
                ]
            }
        ],
        "settings": [
        ]
    },
    "CDVS": {
        "name": "Check-Digit Validation Service",
        "allowOn": [EntityType.INTEGRATOR, EntityType.PARENT],
        "services": [
            {
                "name": "cdvs.services.cdvs",
                "display": "Check-Digit Validation Service",
                "description": "Can perform a check-digit validation check",
                "allowOn": [EntityType.INTEGRATOR, EntityType.PARENT],
                "settings": [
                ]
            }
        ],
        "settings": [
        ]
    },
    "CMS": {
        "name": "Client Management Service",
        "allowOn": [EntityType.DEVICEUSER, EntityType.INTEGRATOR, EntityType.PARENT],
        "services": [
            {
                "name": "cms.services.cms",
                "display": "Client Management Service",
                "description": "Client Management Service",
                "allowOn": [EntityType.DEVICEUSER, EntityType.INTEGRATOR, EntityType.PARENT],
                "tables": [ServiceTable.ENTITY_SERVICE_TYPE],
                "settings": [
                ]
            },
            {
                "name": "cms.services.entity",
                "display": "Entity Management",
                "description": "Entity Management",
                "allowOn": [EntityType.DEVICEUSER, EntityType.INTEGRATOR, EntityType.PARENT],
                "tables": [ServiceTable.ENTITY_SERVICE_TYPE],
                "settings": [
                ]
            }
        ],
        "settings": [
            {
                "name": "cms.track.request",
                "table": SettingsTable.ENTITY_SERVICE_TYPE_SETTING,
                "type": InputType.CHECKBOX
            }
        ]
    },
    "COVS": {
        "name": "Company Verification Service",
        "allowOn": [EntityType.DEVICEUSER, EntityType.INTEGRATOR, EntityType.PARENT],
        "services": [
            {
                "name": "covs.services.covs",
                "display": "Company Verification",
                "description": "Company Verification",
                "allowOn": [EntityType.DEVICEUSER, EntityType.INTEGRATOR, EntityType.PARENT],
                "settings": [
                ]
            }
        ],
        "settings": [
        ]
    },
    "CRS": {
        "name": "Credit Rating Service",
        "allowOn": [EntityType.DEVICEUSER, EntityType.INTEGRATOR, EntityType.PARENT, EntityType.WEBSERVICE],
        "services": [
            {
                "name": "crs.service.afa",
                "display": "Affordability Assessment Service",
                "description": "Can perform affordability assessment check",
                "allowOn": [EntityType.DEVICEUSER, EntityType.INTEGRATOR, EntityType.PARENT, EntityType.WEBSERVICE],
                "tables": [ServiceTable.ENTITY_SERVICE_TYPE],
                "settings": [
                ]
            },
            {
                "name": "crs.services.crs",
                "display": "Credit Rating Service",
                "description": "Credit Rating Service",
                "allowOn": [EntityType.DEVICEUSER, EntityType.INTEGRATOR, EntityType.PARENT, EntityType.WEBSERVICE],
                "tables": [ServiceTable.ENTITY_SERVICE_TYPE],
                "settings": [
                ]
            },
            {
                "name": "crs.services.report",
                "display": "Credit Report Service",
                "description": "Can perform credit report check",
                "allowOn": [EntityType.DEVICEUSER, EntityType.INTEGRATOR, EntityType.PARENT, EntityType.WEBSERVICE],
                "tables": [ServiceTable.ENTITY_SERVICE_TYPE],
                "settings": [
                ]
            }
        ],
        "settings": [
            {
                "name": "afa.disposable.income.threshold.percentage",
                "allowOn": [EntityType.INTEGRATOR, EntityType.WEBSERVICE],
                "table": SettingsTable.ENTITY_SERVICE_TYPE_SETTING,
                "type": InputType.CHECKBOX
            },
            {
                "name": "afa.threshold.percentage",
                "allowOn": [EntityType.INTEGRATOR, EntityType.WEBSERVICE],
                "table": SettingsTable.ENTITY_SERVICE_TYPE_SETTING,
                "type": InputType.CHECKBOX
            },
            {
                "name": "afa.track.request",
                "allowOn": [EntityType.INTEGRATOR, EntityType.WEBSERVICE],
                "table": SettingsTable.ENTITY_SERVICE_TYPE_SETTING,
                "type": InputType.CHECKBOX
            },
            {
                "name": "crs.cpb.enquiry.done.by",
                "allowOn": [EntityType.INTEGRATOR, EntityType.PARENT, EntityType.WEBSERVICE],
                "table": SettingsTable.ENTITY_SERVICE_TYPE_SETTING,
                "type": InputType.CHECKBOX
            },
            {
                "name": "crs.track.request",
                "allowOn": [EntityType.INTEGRATOR, EntityType.WEBSERVICE],
                "table": SettingsTable.ENTITY_SERVICE_TYPE_SETTING,
                "type": InputType.CHECKBOX
            }
        ]
    },
    "CVS": {
        "name": "Contact Verification Service API",
        "allowOn": [EntityType.DEVICEUSER, EntityType.INTEGRATOR, EntityType.PARENT],
        "services": [
            {
                "name": "cvs.services.cvs",
                "display": "Contact Verification Service",
                "description": "Can perform retrieval of contact information",
                "allowOn": [EntityType.DEVICEUSER, EntityType.INTEGRATOR, EntityType.PARENT],
                "tables": [ServiceTable.ENTITY_SERVICE_TYPE],
                "settings": [
                ]
            }
        ],
        "settings": [
            {
                "name": "cvs.track.request",
                "allowOn": [EntityType.INTEGRATOR, EntityType.PARENT],
                "table": SettingsTable.ENTITY_SERVICE_TYPE_SETTING,
                "type": InputType.CHECKBOX
            }
        ]
    },
    "FMS": {
        "name": "Fingerprint Matching Service",
        "allowOn": [EntityType.WEBSERVICE],
        "services": [
            {
                "name": "fms.services.match",
                "display": "Fingerprint Matching Service - Fingerprint Matching",
                "description": "Can perform fingerprint matching",
                "allowOn": [EntityType.WEBSERVICE],
                "settings": [
                ]
            },
            {
                "name": "fms.services.register",
                "display": "Fingerprint Matching Service - Fingerprint Registration",
                "description": "Can register a new fingerprint into the fingerprint store",
                "allowOn": [EntityType.WEBSERVICE],
                "settings": [
                ]
            }
        ],
        "settings": [
        ]
    },
    "FVS": {
        "name": "Facial Verification Service",
        "allowOn": [EntityType.DEVICEUSER, EntityType.INTEGRATOR, EntityType.PARENT, EntityType.WEBSERVICE],
        "services": [
            {
                "name": "fvs.services.fvs",
                "display": "Facial Verification Service",
                "description": "Facial Verification Service",
                "allowOn": [EntityType.DEVICEUSER, EntityType.INTEGRATOR, EntityType.PARENT, EntityType.WEBSERVICE],
                "tables": [ServiceTable.ENTITY_SERVICE_TYPE],
                "settings": [
                ]
            },
            {
                "name": "fvs.services.liveness",
                "display": "Facial Liveness & Verification Service",
                "description": "Facial Liveness & Verification Service",
                "allowOn": [EntityType.DEVICEUSER, EntityType.INTEGRATOR, EntityType.PARENT, EntityType.WEBSERVICE],
                "tables": [ServiceTable.ENTITY_SERVICE_TYPE, ServiceTable.ENTITY_SERVICE_TYPE],
                "settings": [
                    {
                        "name": "fvs.liveness.logo",
                        "allowOn": [EntityType.INTEGRATOR, EntityType.PARENT],
                        "table": SettingsTable.ENTITY_SERVICE_SETTING,
                        "type": InputType.TEXT
                    },
                    {
                        "name": "fvs.liveness.redirect.url",
                        "allowOn": [EntityType.INTEGRATOR, EntityType.PARENT],
                        "table": SettingsTable.ENTITY_SERVICE_SETTING,
                        "type": InputType.TEXT
                    },
                    {
                        "name": "fvs.liveness.sms.footer",
                        "allowOn": [EntityType.INTEGRATOR, EntityType.PARENT],
                        "table": SettingsTable.ENTITY_SERVICE_SETTING,
                        "type": InputType.TEXT
                    },
                    {
                        "name": "fvs.liveness.sms.header",
                        "allowOn": [EntityType.INTEGRATOR, EntityType.PARENT],
                        "table": SettingsTable.ENTITY_SERVICE_SETTING,
                        "type": InputType.TEXT
                    }
                ]
            }
        ],
        "settings": [
            {
                "name": "fvs.track.request",
                "allowOn": [EntityType.PARENT],
                "table": SettingsTable.ENTITY_SERVICE_TYPE_SETTING,
                "type": InputType.CHECKBOX
            }
        ]
    },
    "IVS": {
        "name": "Identity Verification Service API",
        "allowOn": [EntityType.DEVICEUSER, EntityType.INTEGRATOR, EntityType.PARENT, EntityType.WEBSERVICE],
        "services": [
            {
                "name": "ivs.services.bvs",
                "display": "IVS BVS",
                "description": "Can perform fingerprint matching",
                "allowOn": [EntityType.DEVICEUSER, EntityType.INTEGRATOR, EntityType.PARENT, EntityType.WEBSERVICE],
                "tables": [ServiceTable.ENTITY_SERVICE_TYPE],
                "settings": [
                ]
            },
            {
                "name": "ivs.services.data",
                "display": "IVS Data",
                "description": "Can perform identity verification to return data",
                "allowOn": [EntityType.DEVICEUSER, EntityType.INTEGRATOR, EntityType.PARENT, EntityType.WEBSERVICE],
                "tables": [ServiceTable.ENTITY_SERVICE_TYPE],
                "settings": [
                ]
            },
            {
                "name": "ivs.services.ivs",
                "display": "Identity Verification",
                "description": "Can perform identity verification",
                "allowOn": [EntityType.DEVICEUSER, EntityType.INTEGRATOR, EntityType.PARENT, EntityType.WEBSERVICE],
                "tables": [ServiceTable.ENTITY_SERVICE_TYPE],
                "settings": [
                ]
            },
            {
                "name": "ivs.services.ivsf",
                "display": "Identity Verification Foreigner",
                "description": "Can perform identity verification on foreigners",
                "allowOn": [EntityType.DEVICEUSER, EntityType.INTEGRATOR, EntityType.PARENT, EntityType.WEBSERVICE],
                "tables": [ServiceTable.ENTITY_SERVICE_TYPE],
                "settings": [
                ]
            },
            {
                "name": "ivs.services.photo",
                "display": "IVS Photo",
                "description": "Can perform identity verification to return photo",
                "allowOn": [EntityType.DEVICEUSER, EntityType.INTEGRATOR, EntityType.PARENT, EntityType.WEBSERVICE],
                "tables": [ServiceTable.ENTITY_SERVICE_TYPE],
                "settings": [
                ]
            }
        ],
        "settings": [
            {
                "name": "avs.track.request",
                "allowOn": [EntityType.PARENT],
                "table": SettingsTable.ENTITY_SERVICE_TYPE_SETTING,
                "type": InputType.CHECKBOX
            },
            {
                "name": "ivs.track.request",
                "allowOn": [EntityType.INTEGRATOR, EntityType.PARENT],
                "table": SettingsTable.ENTITY_SERVICE_TYPE_SETTING,
                "type": InputType.CHECKBOX
            }
        ]
    },
    "OBS": {
        "name": "Online Banking Service",
        "allowOn": [EntityType.PARENT],
        "services": [
            {
                "name": "OBS",
                "display": "Online Banking Service",
                "description": "Online Banking Service",
                "allowOn": [EntityType.PARENT],
                "settings": [
                ]
            }
        ],
        "settings": [
        ]
    },
    "OCS": {
        "name": "Online Collection Service API",
        "allowOn": [EntityType.DEVICEUSER, EntityType.INTEGRATOR, EntityType.PARENT],
        "services": [
            {
                "name": "ocs.services.collection",
                "display": "Collection",
                "description": "Collection submission",
                "allowOn": [EntityType.DEVICEUSER, EntityType.INTEGRATOR, EntityType.PARENT],
                "tables": [ServiceTable.ENTITY_SERVICE_TYPE, ServiceTable.ENTITY_SERVICE_TYPE],
                "settings": [
                    {
                        "name": "ocs.easy.loan.webhook.url",
                        "allowOn": [EntityType.INTEGRATOR, EntityType.PARENT],
                        "table": SettingsTable.ENTITY_SERVICE_SETTING,
                        "type": InputType.TEXT
                    },
                    {
                        "group": "Default Mandate Details",
                        "name": "ocs.ed.mandate.default.details",
                        "field": "adjustmentFrequency",
                        "label": "Adjustment Frequency",
                        "placeholder": "Enter Adjustment Frequency",
                        "type": InputType.SELECT,
                        "defaultValue": "ANUALLY",
                        "values": ["ANNUALLY", "BIANNUALLY", "QUARTERLY", "REPO", "NEVER", "OTHER"],
                        "allowOn": [EntityType.INTEGRATOR, EntityType.PARENT],
                        "table": SettingsTable.ENTITY_SERVICE_TYPE_SETTING,
                        "services": ["ocs.services.collection"]
                    },
                    {
                        "group": "Default Mandate Details",
                        "name": "ocs.ed.mandate.default.details",
                        "field": "adjustmentType",
                        "label": "Adjustment Type",
                        "placeholder": "Enter Adjustment Type",
                        "type": InputType.TEXT,
                        "defaultValue": "RATE",
                        "values": [{"key": 1, "value": "RATE"}, {"key": 2, "value": "AMOUNT"}],
                        "allowOn": [EntityType.INTEGRATOR, EntityType.PARENT],
                        "table": SettingsTable.ENTITY_SERVICE_TYPE_SETTING,
                        "services": ["ocs.services.collection"]
                    },
                    {
                        "group": "Default Mandate Details",
                        "name": "ocs.ed.mandate.default.details",
                        "field": "adjustmentValue",
                        "label": "Adjustment Value",
                        "placeholder": "Enter Adjustment Value",
                        "type": InputType.TEXT,
                        "defaultValue": "1",
                        "allowOn": [EntityType.INTEGRATOR, EntityType.PARENT],
                        "table": SettingsTable.ENTITY_SERVICE_TYPE_SETTING,
                        "services": ["ocs.services.collection"]
                    },
                    {
                        "group": "Default Mandate Details",
                        "name": "ocs.ed.mandate.default.details",
                        "field": "calculateInstallment",
                        "label": "Calculate Installment",
                        "placeholder": "Enter Calculate Installment",
                        "type": InputType.CHECKBOX,
                        "defaultValue": false,
                        "allowOn": [EntityType.INTEGRATOR, EntityType.PARENT],
                        "table": SettingsTable.ENTITY_SERVICE_TYPE_SETTING,
                        "services": ["ocs.services.collection"]
                    },
                    {
                        "group": "Default Mandate Details",
                        "name": "ocs.ed.mandate.default.details",
                        "field": "dateAdjustmentAllowed",
                        "label": "Date Adjustment Allowed",
                        "placeholder": "Enter Date Adjustment Allowed",
                        "type": InputType.CHECKBOX,
                        "defaultValue": "Y",
                        "translateValues": {"true": "Y", "false": "N"},
                        "allowOn": [EntityType.INTEGRATOR, EntityType.PARENT],
                        "table": SettingsTable.ENTITY_SERVICE_TYPE_SETTING,
                        "services": ["ocs.services.collection"]
                    },
                    {
                        "group": "Default Mandate Details",
                        "name": "ocs.ed.mandate.default.details",
                        "field": "debitClassification",
                        "label": "Debit Classification",
                        "placeholder": "Enter Debit Classification",
                        "type": InputType.SELECT,
                        "defaultValue": "LRM",
                        "sort": true,
                        "allowOn": [EntityType.INTEGRATOR, EntityType.PARENT],
                        "table": SettingsTable.ENTITY_SERVICE_TYPE_SETTING,
                        "services": ["ocs.services.collection"]
                    },
                    {
                        "group": "Default Mandate Details",
                        "name": "ocs.ed.mandate.default.details",
                        "field": "frequency",
                        "label": "Frequency",
                        "placeholder": "Enter Frequency",
                        "type": InputType.SELECT,
                        "defaultValue": "MONTHLY",
                        "values": ["ADHOC", "WEEKLY", "FORTNIGHTLY", "MONTHLY", "QUARTERLY", "BIANUALLY", "ANNUALLY", "ONCE_OFF"],
                        "allowOn": [EntityType.INTEGRATOR, EntityType.PARENT],
                        "table": SettingsTable.ENTITY_SERVICE_TYPE_SETTING,
                        "services": ["ocs.services.collection"]
                    },
                    {
                        "group": "Default Mandate Details",
                        "name": "ocs.ed.mandate.default.details",
                        "field": "generateContractReference",
                        "label": "Generate Contract Reference",
                        "placeholder": "Enter Generate Contract Reference",
                        "type": InputType.CHECKBOX,
                        "defaultValue": true,
                        "allowOn": [EntityType.INTEGRATOR, EntityType.PARENT],
                        "table": SettingsTable.ENTITY_SERVICE_TYPE_SETTING,
                        "services": ["ocs.services.collection"]
                    },
                    {
                        "group": "Default Mandate Details",
                        "name": "ocs.ed.mandate.default.details",
                        "field": "generateInstallment",
                        "label": "Generate Installment",
                        "placeholder": "Enter Generate Installment",
                        "type": InputType.CHECKBOX,
                        "defaultValue": true,
                        "allowOn": [EntityType.INTEGRATOR, EntityType.PARENT],
                        "table": SettingsTable.ENTITY_SERVICE_TYPE_SETTING,
                        "services": ["ocs.services.collection"]
                    },
                    {
                        "group": "Default Mandate Details",
                        "name": "ocs.ed.mandate.default.details",
                        "field": "mandateType",
                        "label": "Mandate Type",
                        "placeholder": "Enter Mandate Type",
                        "type": InputType.SELECT,
                        "defaultValue": "Usage",
                        "values": [{"key": 1, "value": "Fixed"}, {"key": 2, "value": "Variable"}, {"key": 3, "value": "Usage"}],
                        "allowOn": [EntityType.INTEGRATOR, EntityType.PARENT],
                        "table": SettingsTable.ENTITY_SERVICE_TYPE_SETTING,
                        "services": ["ocs.services.collection"]
                    },
                    {
                        "group": "Default Mandate Details",
                        "name": "ocs.ed.mandate.default.details",
                        "field": "maximumInstallmentAmount",
                        "label": "Maximum Installment Amount",
                        "placeholder": "Enter Maximum Installment Amount",
                        "type": InputType.NUMBER,
                        "defaultValue": "10000",
                        "allowOn": [EntityType.INTEGRATOR, EntityType.PARENT],
                        "table": SettingsTable.ENTITY_SERVICE_TYPE_SETTING,
                        "services": ["ocs.services.collection"]
                    },
                    {
                        "group": "Default Mandate Details",
                        "name": "ocs.ed.mandate.default.details",
                        "field": "referenceFormat",
                        "label": "Contract Reference Format",
                        "placeholder": "Enter Contract Reference Format",
                        "type": InputType.TEXT,
                        "defaultValue": "Group5_*******",
                        "maxLength": 14,
                        "dependsOn": "generateContractReference:true",
                        "allowOn": [EntityType.INTEGRATOR, EntityType.PARENT],
                        "table": SettingsTable.ENTITY_SERVICE_TYPE_SETTING,
                        "services": ["ocs.services.collection"]
                    },
                    {
                        "group": "Default Mandate Details",
                        "name": "ocs.ed.mandate.default.details",
                        "field": "scheme",
                        "label": "Scheme",
                        "placeholder": "Enter Scheme",
                        "type": InputType.TEXT,
                        "defaultValue": "GRPFVPRTN",
                        "allowOn": [EntityType.INTEGRATOR, EntityType.PARENT],
                        "table": SettingsTable.ENTITY_SERVICE_TYPE_SETTING,
                        "services": ["ocs.services.collection"]
                    },
                    {
                        "group": "Default Mandate Details",
                        "name": "ocs.ed.mandate.default.details",
                        "field": "tracking",
                        "label": "Tracking",
                        "placeholder": "Enter Tracking",
                        "type": InputType.CHECKBOX,
                        "defaultValue": true,
                        "allowOn": [EntityType.INTEGRATOR, EntityType.PARENT],
                        "table": SettingsTable.ENTITY_SERVICE_TYPE_SETTING,
                        "services": ["ocs.services.collection"]
                    }
                ]
            },
            {
                "name": "ocs.services.debitorder",
                "display": "Debit Order",
                "description": "Debit Order Service",
                "allowOn": [EntityType.DEVICEUSER, EntityType.INTEGRATOR, EntityType.PARENT],
                "tables": [ServiceTable.ENTITY_SERVICE_TYPE, ServiceTable.ENTITY_SERVICE_TYPE],
                "settings": [
                    {
                        "name": "ocs.easy.loan.webhook.url",
                        "allowOn": [EntityType.INTEGRATOR, EntityType.PARENT],
                        "table": SettingsTable.ENTITY_SERVICE_SETTING,
                        "type": InputType.TEXT
                    },
                    {
                        "group": "Default Mandate Details",
                        "name": "ocs.ed.mandate.default.details",
                        "field": "adjustmentFrequency",
                        "label": "Adjustment Frequency",
                        "placeholder": "Enter Adjustment Frequency",
                        "type": InputType.SELECT,
                        "defaultValue": "ANUALLY",
                        "values": ["ANNUALLY", "BIANNUALLY", "QUARTERLY", "REPO", "NEVER", "OTHER"],
                        "allowOn": [EntityType.INTEGRATOR, EntityType.PARENT],
                        "table": SettingsTable.ENTITY_SERVICE_TYPE_SETTING,
                        "services": ["ocs.services.debitorder"]
                    },
                    {
                        "group": "Default Mandate Details",
                        "name": "ocs.ed.mandate.default.details",
                        "field": "adjustmentType",
                        "label": "Adjustment Type",
                        "placeholder": "Enter Adjustment Type",
                        "type": InputType.TEXT,
                        "defaultValue": "RATE",
                        "values": [{"key": 1, "value": "RATE"}, {"key": 2, "value": "AMOUNT"}],
                        "allowOn": [EntityType.INTEGRATOR, EntityType.PARENT],
                        "table": SettingsTable.ENTITY_SERVICE_TYPE_SETTING,
                        "services": ["ocs.services.debitorder"]
                    },
                    {
                        "group": "Default Mandate Details",
                        "name": "ocs.ed.mandate.default.details",
                        "field": "adjustmentValue",
                        "label": "Adjustment Value",
                        "placeholder": "Enter Adjustment Value",
                        "type": InputType.TEXT,
                        "defaultValue": "1",
                        "allowOn": [EntityType.INTEGRATOR, EntityType.PARENT],
                        "table": SettingsTable.ENTITY_SERVICE_TYPE_SETTING,
                        "services": ["ocs.services.debitorder"]
                    },
                    {
                        "group": "Default Mandate Details",
                        "name": "ocs.ed.mandate.default.details",
                        "field": "calculateInstallment",
                        "label": "Calculate Installment",
                        "placeholder": "Enter Calculate Installment",
                        "type": InputType.CHECKBOX,
                        "defaultValue": false,
                        "allowOn": [EntityType.INTEGRATOR, EntityType.PARENT],
                        "table": SettingsTable.ENTITY_SERVICE_TYPE_SETTING,
                        "services": ["ocs.services.debitorder"]
                    },
                    {
                        "group": "Default Mandate Details",
                        "name": "ocs.ed.mandate.default.details",
                        "field": "dateAdjustmentAllowed",
                        "label": "Date Adjustment Allowed",
                        "placeholder": "Enter Date Adjustment Allowed",
                        "type": InputType.CHECKBOX,
                        "defaultValue": "Y",
                        "translateValues": {"true": "Y", "false": "N"},
                        "allowOn": [EntityType.INTEGRATOR, EntityType.PARENT],
                        "table": SettingsTable.ENTITY_SERVICE_TYPE_SETTING,
                        "services": ["ocs.services.debitorder"]
                    },
                    {
                        "group": "Default Mandate Details",
                        "name": "ocs.ed.mandate.default.details",
                        "field": "debitClassification",
                        "label": "Debit Classification",
                        "placeholder": "Enter Debit Classification",
                        "type": InputType.SELECT,
                        "defaultValue": "LRM",
                        "sort": true,
                        "allowOn": [EntityType.INTEGRATOR, EntityType.PARENT],
                        "table": SettingsTable.ENTITY_SERVICE_TYPE_SETTING,
                        "services": ["ocs.services.debitorder"]
                    },
                    {
                        "group": "Default Mandate Details",
                        "name": "ocs.ed.mandate.default.details",
                        "field": "frequency",
                        "label": "Frequency",
                        "placeholder": "Enter Frequency",
                        "type": InputType.SELECT,
                        "defaultValue": "MONTHLY",
                        "values": ["ADHOC", "WEEKLY", "FORTNIGHTLY", "MONTHLY", "QUARTERLY", "BIANUALLY", "ANNUALLY", "ONCE_OFF"],
                        "allowOn": [EntityType.INTEGRATOR, EntityType.PARENT],
                        "table": SettingsTable.ENTITY_SERVICE_TYPE_SETTING,
                        "services": ["ocs.services.debitorder"]
                    },
                    {
                        "group": "Default Mandate Details",
                        "name": "ocs.ed.mandate.default.details",
                        "field": "generateContractReference",
                        "label": "Generate Contract Reference",
                        "placeholder": "Enter Generate Contract Reference",
                        "type": InputType.CHECKBOX,
                        "defaultValue": true,
                        "allowOn": [EntityType.INTEGRATOR, EntityType.PARENT],
                        "table": SettingsTable.ENTITY_SERVICE_TYPE_SETTING,
                        "services": ["ocs.services.debitorder"]
                    },
                    {
                        "group": "Default Mandate Details",
                        "name": "ocs.ed.mandate.default.details",
                        "field": "generateInstallment",
                        "label": "Generate Installment",
                        "placeholder": "Enter Generate Installment",
                        "type": InputType.CHECKBOX,
                        "defaultValue": true,
                        "allowOn": [EntityType.INTEGRATOR, EntityType.PARENT],
                        "table": SettingsTable.ENTITY_SERVICE_TYPE_SETTING,
                        "services": ["ocs.services.debitorder"]
                    },
                    {
                        "group": "Default Mandate Details",
                        "name": "ocs.ed.mandate.default.details",
                        "field": "mandateType",
                        "label": "Mandate Type",
                        "placeholder": "Enter Mandate Type",
                        "type": InputType.SELECT,
                        "defaultValue": "Usage",
                        "values": [{"key": 1, "value": "Fixed"}, {"key": 2, "value": "Variable"}, {"key": 3, "value": "Usage"}],
                        "allowOn": [EntityType.INTEGRATOR, EntityType.PARENT],
                        "table": SettingsTable.ENTITY_SERVICE_TYPE_SETTING,
                        "services": ["ocs.services.debitorder"]
                    },
                    {
                        "group": "Default Mandate Details",
                        "name": "ocs.ed.mandate.default.details",
                        "field": "maximumInstallmentAmount",
                        "label": "Maximum Installment Amount",
                        "placeholder": "Enter Maximum Installment Amount",
                        "type": InputType.NUMBER,
                        "defaultValue": "10000",
                        "allowOn": [EntityType.INTEGRATOR, EntityType.PARENT],
                        "table": SettingsTable.ENTITY_SERVICE_TYPE_SETTING,
                        "services": ["ocs.services.debitorder"]
                    },
                    {
                        "group": "Default Mandate Details",
                        "name": "ocs.ed.mandate.default.details",
                        "field": "referenceFormat",
                        "label": "Contract Reference Format",
                        "placeholder": "Enter Contract Reference Format",
                        "type": InputType.TEXT,
                        "defaultValue": "Group5_*******",
                        "maxLength": 14,
                        "dependsOn": "generateContractReference:true",
                        "allowOn": [EntityType.INTEGRATOR, EntityType.PARENT],
                        "table": SettingsTable.ENTITY_SERVICE_TYPE_SETTING,
                        "services": ["ocs.services.debitorder"]
                    },
                    {
                        "group": "Default Mandate Details",
                        "name": "ocs.ed.mandate.default.details",
                        "field": "scheme",
                        "label": "Scheme",
                        "placeholder": "Enter Scheme",
                        "type": InputType.TEXT,
                        "defaultValue": "GRPFVPRTN",
                        "allowOn": [EntityType.INTEGRATOR, EntityType.PARENT],
                        "table": SettingsTable.ENTITY_SERVICE_TYPE_SETTING,
                        "services": ["ocs.services.debitorder"]
                    },
                    {
                        "group": "Default Mandate Details",
                        "name": "ocs.ed.mandate.default.details",
                        "field": "tracking",
                        "label": "Tracking",
                        "placeholder": "Enter Tracking",
                        "type": InputType.CHECKBOX,
                        "defaultValue": true,
                        "allowOn": [EntityType.INTEGRATOR, EntityType.PARENT],
                        "table": SettingsTable.ENTITY_SERVICE_TYPE_SETTING,
                        "services": ["ocs.services.debitorder"]
                    }
                ]
            },
            {
                "name": "ocs.services.mandate",
                "display": "Mandate Creation",
                "description": "Submit and create a Mandate",
                "allowOn": [EntityType.DEVICEUSER, EntityType.INTEGRATOR, EntityType.PARENT],
                "tables": [ServiceTable.ENTITY_SERVICE_TYPE, ServiceTable.ENTITY_SERVICE_TYPE],
                "settings": [
                    {
                        "name": "ocs.easy.loan.webhook.url",
                        "allowOn": [EntityType.INTEGRATOR],
                        "table": SettingsTable.ENTITY_SERVICE_SETTING,
                        "type": InputType.TEXT
                    },
                    {
                        "name": "ocs.ed.sc.gc.map",
                        "allowOn": [EntityType.INTEGRATOR],
                        "table": SettingsTable.ENTITY_SERVICE_SETTING,
                        "type": InputType.TEXT
                    },
                    {
                        "name": "ocs.ed.ws.gc",
                        "allowOn": [EntityType.INTEGRATOR],
                        "table": SettingsTable.ENTITY_SERVICE_SETTING,
                        "type": InputType.TEXT
                    },
                    {
                        "group": "Default Mandate Details",
                        "name": "ocs.ed.mandate.default.details",
                        "field": "adjustmentFrequency",
                        "label": "Adjustment Frequency",
                        "placeholder": "Enter Adjustment Frequency",
                        "type": InputType.SELECT,
                        "defaultValue": "ANUALLY",
                        "values": ["ANNUALLY", "BIANNUALLY", "QUARTERLY", "REPO", "NEVER", "OTHER"],
                        "allowOn": [EntityType.INTEGRATOR, EntityType.PARENT],
                        "table": SettingsTable.ENTITY_SERVICE_TYPE_SETTING,
                        "services": ["ocs.services.mandate"]
                    },
                    {
                        "group": "Default Mandate Details",
                        "name": "ocs.ed.mandate.default.details",
                        "field": "adjustmentType",
                        "label": "Adjustment Type",
                        "placeholder": "Enter Adjustment Type",
                        "type": InputType.TEXT,
                        "defaultValue": "RATE",
                        "values": [{"key": 1, "value": "RATE"}, {"key": 2, "value": "AMOUNT"}],
                        "allowOn": [EntityType.INTEGRATOR, EntityType.PARENT],
                        "table": SettingsTable.ENTITY_SERVICE_TYPE_SETTING,
                        "services": ["ocs.services.mandate"]
                    },
                    {
                        "group": "Default Mandate Details",
                        "name": "ocs.ed.mandate.default.details",
                        "field": "adjustmentValue",
                        "label": "Adjustment Value",
                        "placeholder": "Enter Adjustment Value",
                        "type": InputType.TEXT,
                        "defaultValue": "1",
                        "allowOn": [EntityType.INTEGRATOR, EntityType.PARENT],
                        "table": SettingsTable.ENTITY_SERVICE_TYPE_SETTING,
                        "services": ["ocs.services.mandate"]
                    },
                    {
                        "group": "Default Mandate Details",
                        "name": "ocs.ed.mandate.default.details",
                        "field": "calculateInstallment",
                        "label": "Calculate Installment",
                        "placeholder": "Enter Calculate Installment",
                        "type": InputType.CHECKBOX,
                        "defaultValue": false,
                        "allowOn": [EntityType.INTEGRATOR, EntityType.PARENT],
                        "table": SettingsTable.ENTITY_SERVICE_TYPE_SETTING,
                        "services": ["ocs.services.mandate"]
                    },
                    {
                        "group": "Default Mandate Details",
                        "name": "ocs.ed.mandate.default.details",
                        "field": "dateAdjustmentAllowed",
                        "label": "Date Adjustment Allowed",
                        "placeholder": "Enter Date Adjustment Allowed",
                        "type": InputType.CHECKBOX,
                        "defaultValue": "Y",
                        "translateValues": {"true": "Y", "false": "N"},
                        "allowOn": [EntityType.INTEGRATOR, EntityType.PARENT],
                        "table": SettingsTable.ENTITY_SERVICE_TYPE_SETTING,
                        "services": ["ocs.services.mandate"]
                    },
                    {
                        "group": "Default Mandate Details",
                        "name": "ocs.ed.mandate.default.details",
                        "field": "debitClassification",
                        "label": "Debit Classification",
                        "placeholder": "Enter Debit Classification",
                        "type": InputType.SELECT,
                        "defaultValue": "LRM",
                        "sort": true,
                        "allowOn": [EntityType.INTEGRATOR, EntityType.PARENT],
                        "table": SettingsTable.ENTITY_SERVICE_TYPE_SETTING,
                        "services": ["ocs.services.mandate"]
                    },
                    {
                        "group": "Default Mandate Details",
                        "name": "ocs.ed.mandate.default.details",
                        "field": "frequency",
                        "label": "Frequency",
                        "placeholder": "Enter Frequency",
                        "type": InputType.SELECT,
                        "defaultValue": "MONTHLY",
                        "values": ["ADHOC", "WEEKLY", "FORTNIGHTLY", "MONTHLY", "QUARTERLY", "BIANUALLY", "ANNUALLY", "ONCE_OFF"],
                        "allowOn": [EntityType.INTEGRATOR, EntityType.PARENT],
                        "table": SettingsTable.ENTITY_SERVICE_TYPE_SETTING,
                        "services": ["ocs.services.mandate"]
                    },
                    {
                        "group": "Default Mandate Details",
                        "name": "ocs.ed.mandate.default.details",
                        "field": "generateContractReference",
                        "label": "Generate Contract Reference",
                        "placeholder": "Enter Generate Contract Reference",
                        "type": InputType.CHECKBOX,
                        "defaultValue": true,
                        "allowOn": [EntityType.INTEGRATOR, EntityType.PARENT],
                        "table": SettingsTable.ENTITY_SERVICE_TYPE_SETTING,
                        "services": ["ocs.services.mandate"]
                    },
                    {
                        "group": "Default Mandate Details",
                        "name": "ocs.ed.mandate.default.details",
                        "field": "generateInstallment",
                        "label": "Generate Installment",
                        "placeholder": "Enter Generate Installment",
                        "type": InputType.CHECKBOX,
                        "defaultValue": true,
                        "allowOn": [EntityType.INTEGRATOR, EntityType.PARENT],
                        "table": SettingsTable.ENTITY_SERVICE_TYPE_SETTING,
                        "services": ["ocs.services.mandate"]
                    },
                    {
                        "group": "Default Mandate Details",
                        "name": "ocs.ed.mandate.default.details",
                        "field": "mandateType",
                        "label": "Mandate Type",
                        "placeholder": "Enter Mandate Type",
                        "type": InputType.SELECT,
                        "defaultValue": "Usage",
                        "values": [{"key": 1, "value": "Fixed"}, {"key": 2, "value": "Variable"}, {"key": 3, "value": "Usage"}],
                        "allowOn": [EntityType.INTEGRATOR, EntityType.PARENT],
                        "table": SettingsTable.ENTITY_SERVICE_TYPE_SETTING,
                        "services": ["ocs.services.mandate"]
                    },
                    {
                        "group": "Default Mandate Details",
                        "name": "ocs.ed.mandate.default.details",
                        "field": "maximumInstallmentAmount",
                        "label": "Maximum Installment Amount",
                        "placeholder": "Enter Maximum Installment Amount",
                        "type": InputType.NUMBER,
                        "defaultValue": "10000",
                        "allowOn": [EntityType.INTEGRATOR, EntityType.PARENT],
                        "table": SettingsTable.ENTITY_SERVICE_TYPE_SETTING,
                        "services": ["ocs.services.mandate"]
                    },
                    {
                        "group": "Default Mandate Details",
                        "name": "ocs.ed.mandate.default.details",
                        "field": "referenceFormat",
                        "label": "Contract Reference Format",
                        "placeholder": "Enter Contract Reference Format",
                        "type": InputType.TEXT,
                        "defaultValue": "Group5_*******",
                        "maxLength": 14,
                        "dependsOn": "generateContractReference:true",
                        "allowOn": [EntityType.INTEGRATOR, EntityType.PARENT],
                        "table": SettingsTable.ENTITY_SERVICE_TYPE_SETTING,
                        "services": ["ocs.services.mandate"]
                    },
                    {
                        "group": "Default Mandate Details",
                        "name": "ocs.ed.mandate.default.details",
                        "field": "scheme",
                        "label": "Scheme",
                        "placeholder": "Enter Scheme",
                        "type": InputType.TEXT,
                        "defaultValue": "GRPFVPRTN",
                        "allowOn": [EntityType.INTEGRATOR, EntityType.PARENT],
                        "table": SettingsTable.ENTITY_SERVICE_TYPE_SETTING,
                        "services": ["ocs.services.mandate"]
                    },
                    {
                        "group": "Default Mandate Details",
                        "name": "ocs.ed.mandate.default.details",
                        "field": "tracking",
                        "label": "Tracking",
                        "placeholder": "Enter Tracking",
                        "type": InputType.CHECKBOX,
                        "defaultValue": true,
                        "allowOn": [EntityType.INTEGRATOR, EntityType.PARENT],
                        "table": SettingsTable.ENTITY_SERVICE_TYPE_SETTING,
                        "services": ["ocs.services.mandate"]
                    }
                ]
            }
        ],
        "settings": [
            {
                "name": "app.mandate.creation.enabled",
                "allowOn": [EntityType.PARENT],
                "table": SettingsTable.ENTITY_SERVICE_TYPE_SETTING,
                "type": InputType.CHECKBOX
            },
            {
                "name": "app.transaction.history.enabled",
                "table": SettingsTable.ENTITY_SERVICE_TYPE_SETTING,
                "type": InputType.CHECKBOX
            },
            {
                "name": "external.status.webhook.url",
                "allowOn": [EntityType.INTEGRATOR, EntityType.PARENT],
                "table": SettingsTable.ENTITY_SERVICE_TYPE_SETTING,
                "type": InputType.CHECKBOX
            },
            {
                "name": "ocs.df.scheme",
                "allowOn": [EntityType.INTEGRATOR, EntityType.PARENT],
                "table": SettingsTable.ENTITY_SERVICE_TYPE_SETTING,
                "type": InputType.CHECKBOX
            },
            {
                "name": "ocs.ed.do.gc",
                "allowOn": [EntityType.INTEGRATOR, EntityType.PARENT],
                "table": SettingsTable.ENTITY_SERVICE_TYPE_SETTING,
                "type": InputType.CHECKBOX
            },
            {
                "name": "ocs.ed.do.sc.gc.map",
                "allowOn": [EntityType.INTEGRATOR, EntityType.PARENT],
                "table": SettingsTable.ENTITY_SERVICE_TYPE_SETTING,
                "type": InputType.CHECKBOX
            },
            {
                "name": "ocs.ed.passthrough",
                "allowOn": [EntityType.INTEGRATOR, EntityType.PARENT],
                "table": SettingsTable.ENTITY_SERVICE_TYPE_SETTING,
                "type": InputType.CHECKBOX
            },
            {
                "name": "ocs.ed.sc.gc.map",
                "allowOn": [EntityType.INTEGRATOR, EntityType.PARENT],
                "table": SettingsTable.ENTITY_SERVICE_TYPE_SETTING,
                "type": InputType.CHECKBOX
            },
            {
                "name": "ocs.ed.ul.gc.map",
                "allowOn": [EntityType.INTEGRATOR, EntityType.PARENT],
                "table": SettingsTable.ENTITY_SERVICE_TYPE_SETTING,
                "type": InputType.CHECKBOX
            },
            {
                "name": "ocs.ed.ws.gc",
                "allowOn": [EntityType.INTEGRATOR, EntityType.PARENT],
                "table": SettingsTable.ENTITY_SERVICE_TYPE_SETTING,
                "type": InputType.CHECKBOX
            },
            {
                "name": "ocs.ed.ws.pwd",
                "allowOn": [EntityType.INTEGRATOR, EntityType.PARENT],
                "table": SettingsTable.ENTITY_SERVICE_TYPE_SETTING,
                "type": InputType.CHECKBOX
            },
            {
                "name": "ocs.ed.ws.usr",
                "allowOn": [EntityType.INTEGRATOR, EntityType.PARENT],
                "table": SettingsTable.ENTITY_SERVICE_TYPE_SETTING,
                "type": InputType.CHECKBOX
            },
            {
                "group": "Default Mandate Details",
                "name": "ocs.ed.mandate.default.details",
                "field": "adjustmentFrequency",
                "label": "Adjustment Frequency",
                "placeholder": "Enter Adjustment Frequency",
                "type": InputType.SELECT,
                "defaultValue": "ANUALLY",
                "values": ["ANNUALLY", "BIANNUALLY", "QUARTERLY", "REPO", "NEVER", "OTHER"],
                "allowOn": [EntityType.INTEGRATOR, EntityType.PARENT],
                "table": SettingsTable.ENTITY_SERVICE_TYPE_SETTING,
                "services": []
            },
            {
                "group": "Default Mandate Details",
                "name": "ocs.ed.mandate.default.details",
                "field": "adjustmentType",
                "label": "Adjustment Type",
                "placeholder": "Enter Adjustment Type",
                "type": InputType.TEXT,
                "defaultValue": "RATE",
                "values": [{"key": 1, "value": "RATE"}, {"key": 2, "value": "AMOUNT"}],
                "allowOn": [EntityType.INTEGRATOR, EntityType.PARENT],
                "table": SettingsTable.ENTITY_SERVICE_TYPE_SETTING,
                "services": []
            },
            {
                "group": "Default Mandate Details",
                "name": "ocs.ed.mandate.default.details",
                "field": "adjustmentValue",
                "label": "Adjustment Value",
                "placeholder": "Enter Adjustment Value",
                "type": InputType.TEXT,
                "defaultValue": "1",
                "allowOn": [EntityType.INTEGRATOR, EntityType.PARENT],
                "table": SettingsTable.ENTITY_SERVICE_TYPE_SETTING,
                "services": []
            },
            {
                "group": "Default Mandate Details",
                "name": "ocs.ed.mandate.default.details",
                "field": "calculateInstallment",
                "label": "Calculate Installment",
                "placeholder": "Enter Calculate Installment",
                "type": InputType.CHECKBOX,
                "defaultValue": false,
                "allowOn": [EntityType.INTEGRATOR, EntityType.PARENT],
                "table": SettingsTable.ENTITY_SERVICE_TYPE_SETTING,
                "services": []
            },
            {
                "group": "Default Mandate Details",
                "name": "ocs.ed.mandate.default.details",
                "field": "dateAdjustmentAllowed",
                "label": "Date Adjustment Allowed",
                "placeholder": "Enter Date Adjustment Allowed",
                "type": InputType.CHECKBOX,
                "defaultValue": "Y",
                "translateValues": {"true": "Y", "false": "N"},
                "allowOn": [EntityType.INTEGRATOR, EntityType.PARENT],
                "table": SettingsTable.ENTITY_SERVICE_TYPE_SETTING,
                "services": []
            },
            {
                "group": "Default Mandate Details",
                "name": "ocs.ed.mandate.default.details",
                "field": "debitClassification",
                "label": "Debit Classification",
                "placeholder": "Enter Debit Classification",
                "type": InputType.SELECT,
                "defaultValue": "LRM",
                "sort": true,
                "allowOn": [EntityType.INTEGRATOR, EntityType.PARENT],
                "table": SettingsTable.ENTITY_SERVICE_TYPE_SETTING,
                "services": []
            },
            {
                "group": "Default Mandate Details",
                "name": "ocs.ed.mandate.default.details",
                "field": "frequency",
                "label": "Frequency",
                "placeholder": "Enter Frequency",
                "type": InputType.SELECT,
                "defaultValue": "MONTHLY",
                "values": ["ADHOC", "WEEKLY", "FORTNIGHTLY", "MONTHLY", "QUARTERLY", "BIANUALLY", "ANNUALLY", "ONCE_OFF"],
                "allowOn": [EntityType.INTEGRATOR, EntityType.PARENT],
                "table": SettingsTable.ENTITY_SERVICE_TYPE_SETTING,
                "services": []
            },
            {
                "group": "Default Mandate Details",
                "name": "ocs.ed.mandate.default.details",
                "field": "generateContractReference",
                "label": "Generate Contract Reference",
                "placeholder": "Enter Generate Contract Reference",
                "type": InputType.CHECKBOX,
                "defaultValue": true,
                "allowOn": [EntityType.INTEGRATOR, EntityType.PARENT],
                "table": SettingsTable.ENTITY_SERVICE_TYPE_SETTING,
                "services": []
            },
            {
                "group": "Default Mandate Details",
                "name": "ocs.ed.mandate.default.details",
                "field": "generateInstallment",
                "label": "Generate Installment",
                "placeholder": "Enter Generate Installment",
                "type": InputType.CHECKBOX,
                "defaultValue": true,
                "allowOn": [EntityType.INTEGRATOR, EntityType.PARENT],
                "table": SettingsTable.ENTITY_SERVICE_TYPE_SETTING,
                "services": []
            },
            {
                "group": "Default Mandate Details",
                "name": "ocs.ed.mandate.default.details",
                "field": "mandateType",
                "label": "Mandate Type",
                "placeholder": "Enter Mandate Type",
                "type": InputType.SELECT,
                "defaultValue": "Usage",
                "values": [{"key": 1, "value": "Fixed"}, {"key": 2, "value": "Variable"}, {"key": 3, "value": "Usage"}],
                "allowOn": [EntityType.INTEGRATOR, EntityType.PARENT],
                "table": SettingsTable.ENTITY_SERVICE_TYPE_SETTING,
                "services": []
            },
            {
                "group": "Default Mandate Details",
                "name": "ocs.ed.mandate.default.details",
                "field": "maximumInstallmentAmount",
                "label": "Maximum Installment Amount",
                "placeholder": "Enter Maximum Installment Amount",
                "type": InputType.NUMBER,
                "defaultValue": "10000",
                "allowOn": [EntityType.INTEGRATOR, EntityType.PARENT],
                "table": SettingsTable.ENTITY_SERVICE_TYPE_SETTING,
                "services": []
            },
            {
                "group": "Default Mandate Details",
                "name": "ocs.ed.mandate.default.details",
                "field": "referenceFormat",
                "label": "Contract Reference Format",
                "placeholder": "Enter Contract Reference Format",
                "type": InputType.TEXT,
                "defaultValue": "Group5_*******",
                "maxLength": 14,
                "dependsOn": "generateContractReference:true",
                "allowOn": [EntityType.INTEGRATOR, EntityType.PARENT],
                "table": SettingsTable.ENTITY_SERVICE_TYPE_SETTING,
                "services": []
            },
            {
                "group": "Default Mandate Details",
                "name": "ocs.ed.mandate.default.details",
                "field": "scheme",
                "label": "Scheme",
                "placeholder": "Enter Scheme",
                "type": InputType.TEXT,
                "defaultValue": "GRPFVPRTN",
                "allowOn": [EntityType.INTEGRATOR, EntityType.PARENT],
                "table": SettingsTable.ENTITY_SERVICE_TYPE_SETTING,
                "services": []
            },
            {
                "group": "Default Mandate Details",
                "name": "ocs.ed.mandate.default.details",
                "field": "tracking",
                "label": "Tracking",
                "placeholder": "Enter Tracking",
                "type": InputType.CHECKBOX,
                "defaultValue": true,
                "allowOn": [EntityType.INTEGRATOR, EntityType.PARENT],
                "table": SettingsTable.ENTITY_SERVICE_TYPE_SETTING,
                "services": []
            }
        ]
    },
    "OPS": {
        "name": "Online Payment Service",
        "allowOn": [EntityType.DEVICEUSER, EntityType.INTEGRATOR, EntityType.PARENT, EntityType.WEBSERVICE],
        "services": [
            {
                "name": "ops.services.cps",
                "display": "Card Payment Service",
                "description": "Can initiate card payments",
                "allowOn": [EntityType.DEVICEUSER, EntityType.INTEGRATOR, EntityType.PARENT, EntityType.WEBSERVICE],
                "tables": [ServiceTable.ENTITY_SERVICE_TYPE, ServiceTable.ENTITY_SERVICE_TYPE],
                "settings": [
                    {
                        "name": "ops.logo",
                        "allowOn": [EntityType.INTEGRATOR, EntityType.PARENT, EntityType.WEBSERVICE],
                        "table": SettingsTable.ENTITY_SERVICE_SETTING,
                        "type": InputType.TEXT
                    }
                ]
            },
            {
                "name": "ops.services.ieft",
                "display": "Instant EFT",
                "description": "Instant EFT",
                "allowOn": [EntityType.DEVICEUSER, EntityType.INTEGRATOR, EntityType.PARENT, EntityType.WEBSERVICE],
                "tables": [ServiceTable.ENTITY_SERVICE_TYPE, ServiceTable.ENTITY_SERVICE_TYPE],
                "settings": [
                    {
                        "name": "ops.ieft.ozow.sitecode",
                        "allowOn": [EntityType.PARENT],
                        "table": SettingsTable.ENTITY_SERVICE_SETTING,
                        "type": InputType.TEXT
                    },
                    {
                        "name": "ops.ieft.sms.footer",
                        "allowOn": [EntityType.PARENT],
                        "table": SettingsTable.ENTITY_SERVICE_SETTING,
                        "type": InputType.TEXT
                    },
                    {
                        "name": "ops.ieft.sms.header",
                        "allowOn": [EntityType.PARENT],
                        "table": SettingsTable.ENTITY_SERVICE_SETTING,
                        "type": InputType.TEXT
                    }
                ]
            }
        ],
        "settings": [
            {
                "name": "cps.chc.access.key",
                "allowOn": [EntityType.INTEGRATOR, EntityType.PARENT, EntityType.WEBSERVICE],
                "table": SettingsTable.ENTITY_SERVICE_TYPE_SETTING,
                "type": InputType.CHECKBOX
            },
            {
                "name": "cps.chc.profile.id",
                "allowOn": [EntityType.INTEGRATOR, EntityType.PARENT, EntityType.WEBSERVICE],
                "table": SettingsTable.ENTITY_SERVICE_TYPE_SETTING,
                "type": InputType.CHECKBOX
            },
            {
                "name": "cps.chc.secret.key",
                "allowOn": [EntityType.INTEGRATOR, EntityType.PARENT, EntityType.WEBSERVICE],
                "table": SettingsTable.ENTITY_SERVICE_TYPE_SETTING,
                "type": InputType.CHECKBOX
            },
            {
                "name": "ops.logo",
                "allowOn": [EntityType.WEBSERVICE],
                "table": SettingsTable.ENTITY_SERVICE_TYPE_SETTING,
                "type": InputType.CHECKBOX
            }
        ]
    },
    "PUI": {
        "name": "Phoenix User Interface",
        "allowOn": [EntityType.DEVICEUSER, EntityType.INTEGRATOR, EntityType.PARENT],
        "services": [
            {
                "name": "pui.services.entity",
                "display": "Phoenix Entity Details Service",
                "description": "Get Details for entity including all types",
                "allowOn": [EntityType.DEVICEUSER, EntityType.INTEGRATOR, EntityType.PARENT],
                "tables": [ServiceTable.ENTITY_SERVICE_TYPE, ServiceTable.ENTITY_SERVICE_TYPE],
                "settings": [
                    {
                        "name": "pui.logo",
                        "allowOn": [EntityType.INTEGRATOR, EntityType.PARENT],
                        "table": SettingsTable.ENTITY_SERVICE_SETTING,
                        "type": InputType.TEXT
                    }
                ]
            }
        ],
        "settings": [
            {
                "name": "pui.track.request",
                "table": SettingsTable.ENTITY_SERVICE_TYPE_SETTING,
                "type": InputType.CHECKBOX
            }
        ]
    },
    "PVS": {
        "name": "Person Verification Service",
        "allowOn": [EntityType.DEVICEUSER, EntityType.INTEGRATOR, EntityType.PARENT],
        "services": [
            {
                "name": "pvs.services.pvs",
                "display": "Person Verification Service",
                "description": "Person Verification Service",
                "allowOn": [EntityType.DEVICEUSER, EntityType.INTEGRATOR, EntityType.PARENT],
                "settings": [
                ]
            }
        ],
        "settings": [
        ]
    },
    "SDS": {
        "name": "Strike Date Service API",
        "allowOn": [EntityType.DEVICEUSER, EntityType.INTEGRATOR, EntityType.PARENT, EntityType.WEBSERVICE],
        "services": [
            {
                "name": "sds.services.sds",
                "display": "Strike Date Optimization",
                "description": "Can retrieve strike dates for an identity number",
                "allowOn": [EntityType.DEVICEUSER, EntityType.INTEGRATOR, EntityType.PARENT, EntityType.WEBSERVICE],
                "tables": [ServiceTable.ENTITY_SERVICE_TYPE],
                "settings": [
                ]
            }
        ],
        "settings": [
            {
                "name": "sds.track.request",
                "table": SettingsTable.ENTITY_SERVICE_TYPE_SETTING,
                "type": InputType.CHECKBOX
            }
        ]
    },
    "SSV": {
        "name": "SIM Swap Verification",
        "allowOn": [EntityType.DEVICEUSER, EntityType.INTEGRATOR, EntityType.PARENT, EntityType.WEBSERVICE],
        "services": [
            {
                "name": "ssv.services.ssv",
                "display": "SIM Swap Verification",
                "description": "Verify SIM swap information for a phone number",
                "allowOn": [EntityType.DEVICEUSER, EntityType.INTEGRATOR, EntityType.PARENT, EntityType.WEBSERVICE],
                "tables": [ServiceTable.ENTITY_SERVICE_TYPE],
                "settings": [
                ]
            }
        ],
        "settings": [
            {
                "name": "ssv.track.request",
                "allowOn": [EntityType.PARENT, EntityType.WEBSERVICE],
                "table": SettingsTable.ENTITY_SERVICE_TYPE_SETTING,
                "type": InputType.CHECKBOX
            }
        ]
    },
    "TCA": {
        "name": "Transaction Card Authorisation",
        "allowOn": [EntityType.DEVICEUSER, EntityType.INTEGRATOR, EntityType.PARENT],
        "services": [
            {
                "name": "tca.services.mca",
                "display": "Mandate Card Authorisation",
                "description": "Mandate Card Authorisation",
                "allowOn": [EntityType.DEVICEUSER, EntityType.INTEGRATOR, EntityType.PARENT],
                "tables": [ServiceTable.ENTITY_SERVICE_TYPE, ServiceTable.ENTITY_SERVICE_TYPE],
                "settings": [
                    {
                        "name": "webservice.password",
                        "allowOn": [EntityType.INTEGRATOR, EntityType.PARENT],
                        "table": SettingsTable.ENTITY_SERVICE_SETTING,
                        "type": InputType.TEXT
                    },
                    {
                        "name": "webservice.username",
                        "allowOn": [EntityType.INTEGRATOR, EntityType.PARENT],
                        "table": SettingsTable.ENTITY_SERVICE_SETTING,
                        "type": InputType.TEXT
                    },
                    {
                        "group": "Manual Payment References",
                        "name": "manual.payments.reference.config",
                        "field": "app.manual.payments.reference.customer",
                        "label": "Customer Reference",
                        "placeholder": "Enter Customer Reference",
                        "type": InputType.SELECT,
                        "defaultValue": "disabled",
                        "values": ["enabled", "disabled", "required"],
                        "table": SettingsTable.ENTITY_SERVICE_TYPE_SETTING,
                        "services": ["tca.services.mca"]
                    },
                    {
                        "group": "Manual Payment References",
                        "name": "manual.payments.reference.config",
                        "field": "app.manual.payments.reference.internal",
                        "label": "Internal Reference",
                        "placeholder": "Enter Internal Reference",
                        "type": InputType.SELECT,
                        "defaultValue": "disabled",
                        "values": ["enabled", "disabled", "required"],
                        "table": SettingsTable.ENTITY_SERVICE_TYPE_SETTING,
                        "services": ["tca.services.mca"]
                    },
                    {
                        "group": "Default Mandate Details",
                        "name": "ocs.ed.mandate.default.details",
                        "field": "adjustmentFrequency",
                        "label": "Adjustment Frequency",
                        "placeholder": "Enter Adjustment Frequency",
                        "type": InputType.SELECT,
                        "defaultValue": "ANUALLY",
                        "values": ["ANNUALLY", "BIANNUALLY", "QUARTERLY", "REPO", "NEVER", "OTHER"],
                        "allowOn": [EntityType.INTEGRATOR],
                        "table": SettingsTable.ENTITY_SERVICE_TYPE_SETTING,
                        "services": ["tca.services.mca"]
                    },
                    {
                        "group": "Default Mandate Details",
                        "name": "ocs.ed.mandate.default.details",
                        "field": "adjustmentType",
                        "label": "Adjustment Type",
                        "placeholder": "Enter Adjustment Type",
                        "type": InputType.TEXT,
                        "defaultValue": "RATE",
                        "values": [{"key": 1, "value": "RATE"}, {"key": 2, "value": "AMOUNT"}],
                        "allowOn": [EntityType.INTEGRATOR],
                        "table": SettingsTable.ENTITY_SERVICE_TYPE_SETTING,
                        "services": ["tca.services.mca"]
                    },
                    {
                        "group": "Default Mandate Details",
                        "name": "ocs.ed.mandate.default.details",
                        "field": "adjustmentValue",
                        "label": "Adjustment Value",
                        "placeholder": "Enter Adjustment Value",
                        "type": InputType.TEXT,
                        "defaultValue": "1",
                        "allowOn": [EntityType.INTEGRATOR],
                        "table": SettingsTable.ENTITY_SERVICE_TYPE_SETTING,
                        "services": ["tca.services.mca"]
                    },
                    {
                        "group": "Default Mandate Details",
                        "name": "ocs.ed.mandate.default.details",
                        "field": "calculateInstallment",
                        "label": "Calculate Installment",
                        "placeholder": "Enter Calculate Installment",
                        "type": InputType.CHECKBOX,
                        "defaultValue": false,
                        "allowOn": [EntityType.INTEGRATOR],
                        "table": SettingsTable.ENTITY_SERVICE_TYPE_SETTING,
                        "services": ["tca.services.mca"]
                    },
                    {
                        "group": "Default Mandate Details",
                        "name": "ocs.ed.mandate.default.details",
                        "field": "dateAdjustmentAllowed",
                        "label": "Date Adjustment Allowed",
                        "placeholder": "Enter Date Adjustment Allowed",
                        "type": InputType.CHECKBOX,
                        "defaultValue": "Y",
                        "translateValues": {"true": "Y", "false": "N"},
                        "allowOn": [EntityType.INTEGRATOR],
                        "table": SettingsTable.ENTITY_SERVICE_TYPE_SETTING,
                        "services": ["tca.services.mca"]
                    },
                    {
                        "group": "Default Mandate Details",
                        "name": "ocs.ed.mandate.default.details",
                        "field": "debitClassification",
                        "label": "Debit Classification",
                        "placeholder": "Enter Debit Classification",
                        "type": InputType.SELECT,
                        "defaultValue": "LRM",
                        "sort": true,
                        "allowOn": [EntityType.INTEGRATOR],
                        "table": SettingsTable.ENTITY_SERVICE_TYPE_SETTING,
                        "services": ["tca.services.mca"]
                    },
                    {
                        "group": "Default Mandate Details",
                        "name": "ocs.ed.mandate.default.details",
                        "field": "frequency",
                        "label": "Frequency",
                        "placeholder": "Enter Frequency",
                        "type": InputType.SELECT,
                        "defaultValue": "MONTHLY",
                        "values": ["ADHOC", "WEEKLY", "FORTNIGHTLY", "MONTHLY", "QUARTERLY", "BIANUALLY", "ANNUALLY", "ONCE_OFF"],
                        "allowOn": [EntityType.INTEGRATOR],
                        "table": SettingsTable.ENTITY_SERVICE_TYPE_SETTING,
                        "services": ["tca.services.mca"]
                    },
                    {
                        "group": "Default Mandate Details",
                        "name": "ocs.ed.mandate.default.details",
                        "field": "generateContractReference",
                        "label": "Generate Contract Reference",
                        "placeholder": "Enter Generate Contract Reference",
                        "type": InputType.CHECKBOX,
                        "defaultValue": true,
                        "allowOn": [EntityType.INTEGRATOR],
                        "table": SettingsTable.ENTITY_SERVICE_TYPE_SETTING,
                        "services": ["tca.services.mca"]
                    },
                    {
                        "group": "Default Mandate Details",
                        "name": "ocs.ed.mandate.default.details",
                        "field": "generateInstallment",
                        "label": "Generate Installment",
                        "placeholder": "Enter Generate Installment",
                        "type": InputType.CHECKBOX,
                        "defaultValue": true,
                        "allowOn": [EntityType.INTEGRATOR],
                        "table": SettingsTable.ENTITY_SERVICE_TYPE_SETTING,
                        "services": ["tca.services.mca"]
                    },
                    {
                        "group": "Default Mandate Details",
                        "name": "ocs.ed.mandate.default.details",
                        "field": "mandateType",
                        "label": "Mandate Type",
                        "placeholder": "Enter Mandate Type",
                        "type": InputType.SELECT,
                        "defaultValue": "Usage",
                        "values": [{"key": 1, "value": "Fixed"}, {"key": 2, "value": "Variable"}, {"key": 3, "value": "Usage"}],
                        "allowOn": [EntityType.INTEGRATOR],
                        "table": SettingsTable.ENTITY_SERVICE_TYPE_SETTING,
                        "services": ["tca.services.mca"]
                    },
                    {
                        "group": "Default Mandate Details",
                        "name": "ocs.ed.mandate.default.details",
                        "field": "maximumInstallmentAmount",
                        "label": "Maximum Installment Amount",
                        "placeholder": "Enter Maximum Installment Amount",
                        "type": InputType.NUMBER,
                        "defaultValue": "10000",
                        "allowOn": [EntityType.INTEGRATOR],
                        "table": SettingsTable.ENTITY_SERVICE_TYPE_SETTING,
                        "services": ["tca.services.mca"]
                    },
                    {
                        "group": "Default Mandate Details",
                        "name": "ocs.ed.mandate.default.details",
                        "field": "referenceFormat",
                        "label": "Contract Reference Format",
                        "placeholder": "Enter Contract Reference Format",
                        "type": InputType.TEXT,
                        "defaultValue": "Group5_*******",
                        "maxLength": 14,
                        "dependsOn": "generateContractReference:true",
                        "allowOn": [EntityType.INTEGRATOR],
                        "table": SettingsTable.ENTITY_SERVICE_TYPE_SETTING,
                        "services": ["tca.services.mca"]
                    },
                    {
                        "group": "Default Mandate Details",
                        "name": "ocs.ed.mandate.default.details",
                        "field": "scheme",
                        "label": "Scheme",
                        "placeholder": "Enter Scheme",
                        "type": InputType.TEXT,
                        "defaultValue": "GRPFVPRTN",
                        "allowOn": [EntityType.INTEGRATOR],
                        "table": SettingsTable.ENTITY_SERVICE_TYPE_SETTING,
                        "services": ["tca.services.mca"]
                    },
                    {
                        "group": "Default Mandate Details",
                        "name": "ocs.ed.mandate.default.details",
                        "field": "tracking",
                        "label": "Tracking",
                        "placeholder": "Enter Tracking",
                        "type": InputType.CHECKBOX,
                        "defaultValue": true,
                        "allowOn": [EntityType.INTEGRATOR],
                        "table": SettingsTable.ENTITY_SERVICE_TYPE_SETTING,
                        "services": ["tca.services.mca"]
                    }
                ]
            },
            {
                "name": "tca.services.pca",
                "display": "Payment Card Authorisation",
                "description": "Payment Card Authorisation",
                "allowOn": [EntityType.DEVICEUSER, EntityType.INTEGRATOR, EntityType.PARENT],
                "tables": [ServiceTable.ENTITY_SERVICE_TYPE, ServiceTable.ENTITY_SERVICE_TYPE],
                "settings": [
                    {
                        "name": "itensityonline.auth.client.id",
                        "allowOn": [EntityType.PARENT],
                        "table": SettingsTable.ENTITY_SERVICE_SETTING,
                        "type": InputType.TEXT
                    },
                    {
                        "name": "itensityonline.auth.client.secret",
                        "allowOn": [EntityType.PARENT],
                        "table": SettingsTable.ENTITY_SERVICE_SETTING,
                        "type": InputType.TEXT
                    },
                    {
                        "group": "Manual Payment References",
                        "name": "manual.payments.reference.config",
                        "field": "app.manual.payments.reference.customer",
                        "label": "Customer Reference",
                        "placeholder": "Enter Customer Reference",
                        "type": InputType.SELECT,
                        "defaultValue": "disabled",
                        "values": ["enabled", "disabled", "required"],
                        "table": SettingsTable.ENTITY_SERVICE_TYPE_SETTING,
                        "services": ["tca.services.pca"]
                    },
                    {
                        "group": "Manual Payment References",
                        "name": "manual.payments.reference.config",
                        "field": "app.manual.payments.reference.internal",
                        "label": "Internal Reference",
                        "placeholder": "Enter Internal Reference",
                        "type": InputType.SELECT,
                        "defaultValue": "disabled",
                        "values": ["enabled", "disabled", "required"],
                        "table": SettingsTable.ENTITY_SERVICE_TYPE_SETTING,
                        "services": ["tca.services.pca"]
                    },
                    {
                        "group": "Default Mandate Details",
                        "name": "ocs.ed.mandate.default.details",
                        "field": "adjustmentFrequency",
                        "label": "Adjustment Frequency",
                        "placeholder": "Enter Adjustment Frequency",
                        "type": InputType.SELECT,
                        "defaultValue": "ANUALLY",
                        "values": ["ANNUALLY", "BIANNUALLY", "QUARTERLY", "REPO", "NEVER", "OTHER"],
                        "allowOn": [EntityType.INTEGRATOR],
                        "table": SettingsTable.ENTITY_SERVICE_TYPE_SETTING,
                        "services": ["tca.services.pca"]
                    },
                    {
                        "group": "Default Mandate Details",
                        "name": "ocs.ed.mandate.default.details",
                        "field": "adjustmentType",
                        "label": "Adjustment Type",
                        "placeholder": "Enter Adjustment Type",
                        "type": InputType.TEXT,
                        "defaultValue": "RATE",
                        "values": [{"key": 1, "value": "RATE"}, {"key": 2, "value": "AMOUNT"}],
                        "allowOn": [EntityType.INTEGRATOR],
                        "table": SettingsTable.ENTITY_SERVICE_TYPE_SETTING,
                        "services": ["tca.services.pca"]
                    },
                    {
                        "group": "Default Mandate Details",
                        "name": "ocs.ed.mandate.default.details",
                        "field": "adjustmentValue",
                        "label": "Adjustment Value",
                        "placeholder": "Enter Adjustment Value",
                        "type": InputType.TEXT,
                        "defaultValue": "1",
                        "allowOn": [EntityType.INTEGRATOR],
                        "table": SettingsTable.ENTITY_SERVICE_TYPE_SETTING,
                        "services": ["tca.services.pca"]
                    },
                    {
                        "group": "Default Mandate Details",
                        "name": "ocs.ed.mandate.default.details",
                        "field": "calculateInstallment",
                        "label": "Calculate Installment",
                        "placeholder": "Enter Calculate Installment",
                        "type": InputType.CHECKBOX,
                        "defaultValue": false,
                        "allowOn": [EntityType.INTEGRATOR],
                        "table": SettingsTable.ENTITY_SERVICE_TYPE_SETTING,
                        "services": ["tca.services.pca"]
                    },
                    {
                        "group": "Default Mandate Details",
                        "name": "ocs.ed.mandate.default.details",
                        "field": "dateAdjustmentAllowed",
                        "label": "Date Adjustment Allowed",
                        "placeholder": "Enter Date Adjustment Allowed",
                        "type": InputType.CHECKBOX,
                        "defaultValue": "Y",
                        "translateValues": {"true": "Y", "false": "N"},
                        "allowOn": [EntityType.INTEGRATOR],
                        "table": SettingsTable.ENTITY_SERVICE_TYPE_SETTING,
                        "services": ["tca.services.pca"]
                    },
                    {
                        "group": "Default Mandate Details",
                        "name": "ocs.ed.mandate.default.details",
                        "field": "debitClassification",
                        "label": "Debit Classification",
                        "placeholder": "Enter Debit Classification",
                        "type": InputType.SELECT,
                        "defaultValue": "LRM",
                        "sort": true,
                        "allowOn": [EntityType.INTEGRATOR],
                        "table": SettingsTable.ENTITY_SERVICE_TYPE_SETTING,
                        "services": ["tca.services.pca"]
                    },
                    {
                        "group": "Default Mandate Details",
                        "name": "ocs.ed.mandate.default.details",
                        "field": "frequency",
                        "label": "Frequency",
                        "placeholder": "Enter Frequency",
                        "type": InputType.SELECT,
                        "defaultValue": "MONTHLY",
                        "values": ["ADHOC", "WEEKLY", "FORTNIGHTLY", "MONTHLY", "QUARTERLY", "BIANUALLY", "ANNUALLY", "ONCE_OFF"],
                        "allowOn": [EntityType.INTEGRATOR],
                        "table": SettingsTable.ENTITY_SERVICE_TYPE_SETTING,
                        "services": ["tca.services.pca"]
                    },
                    {
                        "group": "Default Mandate Details",
                        "name": "ocs.ed.mandate.default.details",
                        "field": "generateContractReference",
                        "label": "Generate Contract Reference",
                        "placeholder": "Enter Generate Contract Reference",
                        "type": InputType.CHECKBOX,
                        "defaultValue": true,
                        "allowOn": [EntityType.INTEGRATOR],
                        "table": SettingsTable.ENTITY_SERVICE_TYPE_SETTING,
                        "services": ["tca.services.pca"]
                    },
                    {
                        "group": "Default Mandate Details",
                        "name": "ocs.ed.mandate.default.details",
                        "field": "generateInstallment",
                        "label": "Generate Installment",
                        "placeholder": "Enter Generate Installment",
                        "type": InputType.CHECKBOX,
                        "defaultValue": true,
                        "allowOn": [EntityType.INTEGRATOR],
                        "table": SettingsTable.ENTITY_SERVICE_TYPE_SETTING,
                        "services": ["tca.services.pca"]
                    },
                    {
                        "group": "Default Mandate Details",
                        "name": "ocs.ed.mandate.default.details",
                        "field": "mandateType",
                        "label": "Mandate Type",
                        "placeholder": "Enter Mandate Type",
                        "type": InputType.SELECT,
                        "defaultValue": "Usage",
                        "values": [{"key": 1, "value": "Fixed"}, {"key": 2, "value": "Variable"}, {"key": 3, "value": "Usage"}],
                        "allowOn": [EntityType.INTEGRATOR],
                        "table": SettingsTable.ENTITY_SERVICE_TYPE_SETTING,
                        "services": ["tca.services.pca"]
                    },
                    {
                        "group": "Default Mandate Details",
                        "name": "ocs.ed.mandate.default.details",
                        "field": "maximumInstallmentAmount",
                        "label": "Maximum Installment Amount",
                        "placeholder": "Enter Maximum Installment Amount",
                        "type": InputType.NUMBER,
                        "defaultValue": "10000",
                        "allowOn": [EntityType.INTEGRATOR],
                        "table": SettingsTable.ENTITY_SERVICE_TYPE_SETTING,
                        "services": ["tca.services.pca"]
                    },
                    {
                        "group": "Default Mandate Details",
                        "name": "ocs.ed.mandate.default.details",
                        "field": "referenceFormat",
                        "label": "Contract Reference Format",
                        "placeholder": "Enter Contract Reference Format",
                        "type": InputType.TEXT,
                        "defaultValue": "Group5_*******",
                        "maxLength": 14,
                        "dependsOn": "generateContractReference:true",
                        "allowOn": [EntityType.INTEGRATOR],
                        "table": SettingsTable.ENTITY_SERVICE_TYPE_SETTING,
                        "services": ["tca.services.pca"]
                    },
                    {
                        "group": "Default Mandate Details",
                        "name": "ocs.ed.mandate.default.details",
                        "field": "scheme",
                        "label": "Scheme",
                        "placeholder": "Enter Scheme",
                        "type": InputType.TEXT,
                        "defaultValue": "GRPFVPRTN",
                        "allowOn": [EntityType.INTEGRATOR],
                        "table": SettingsTable.ENTITY_SERVICE_TYPE_SETTING,
                        "services": ["tca.services.pca"]
                    },
                    {
                        "group": "Default Mandate Details",
                        "name": "ocs.ed.mandate.default.details",
                        "field": "tracking",
                        "label": "Tracking",
                        "placeholder": "Enter Tracking",
                        "type": InputType.CHECKBOX,
                        "defaultValue": true,
                        "allowOn": [EntityType.INTEGRATOR],
                        "table": SettingsTable.ENTITY_SERVICE_TYPE_SETTING,
                        "services": ["tca.services.pca"]
                    }
                ]
            },
            {
                "name": "tca.services.rcp",
                "display": "Recurring Card Payment",
                "description": "Recurring Card Payment",
                "allowOn": [EntityType.DEVICEUSER, EntityType.INTEGRATOR, EntityType.PARENT],
                "tables": [ServiceTable.ENTITY_SERVICE_TYPE, ServiceTable.ENTITY_SERVICE_TYPE],
                "settings": [
                    {
                        "name": "iveri.auth.app.id",
                        "allowOn": [EntityType.PARENT],
                        "table": SettingsTable.ENTITY_SERVICE_SETTING,
                        "type": InputType.TEXT
                    },
                    {
                        "name": "iveri.auth.certificate.id",
                        "allowOn": [EntityType.PARENT],
                        "table": SettingsTable.ENTITY_SERVICE_SETTING,
                        "type": InputType.TEXT
                    },
                    {
                        "group": "Manual Payment References",
                        "name": "manual.payments.reference.config",
                        "field": "app.manual.payments.reference.customer",
                        "label": "Customer Reference",
                        "placeholder": "Enter Customer Reference",
                        "type": InputType.SELECT,
                        "defaultValue": "disabled",
                        "values": ["enabled", "disabled", "required"],
                        "table": SettingsTable.ENTITY_SERVICE_TYPE_SETTING,
                        "services": ["tca.services.rcp"]
                    },
                    {
                        "group": "Manual Payment References",
                        "name": "manual.payments.reference.config",
                        "field": "app.manual.payments.reference.internal",
                        "label": "Internal Reference",
                        "placeholder": "Enter Internal Reference",
                        "type": InputType.SELECT,
                        "defaultValue": "disabled",
                        "values": ["enabled", "disabled", "required"],
                        "table": SettingsTable.ENTITY_SERVICE_TYPE_SETTING,
                        "services": ["tca.services.rcp"]
                    },
                    {
                        "group": "Default Mandate Details",
                        "name": "ocs.ed.mandate.default.details",
                        "field": "adjustmentFrequency",
                        "label": "Adjustment Frequency",
                        "placeholder": "Enter Adjustment Frequency",
                        "type": InputType.SELECT,
                        "defaultValue": "ANUALLY",
                        "values": ["ANNUALLY", "BIANNUALLY", "QUARTERLY", "REPO", "NEVER", "OTHER"],
                        "allowOn": [EntityType.INTEGRATOR],
                        "table": SettingsTable.ENTITY_SERVICE_TYPE_SETTING,
                        "services": ["tca.services.rcp"]
                    },
                    {
                        "group": "Default Mandate Details",
                        "name": "ocs.ed.mandate.default.details",
                        "field": "adjustmentType",
                        "label": "Adjustment Type",
                        "placeholder": "Enter Adjustment Type",
                        "type": InputType.TEXT,
                        "defaultValue": "RATE",
                        "values": [{"key": 1, "value": "RATE"}, {"key": 2, "value": "AMOUNT"}],
                        "allowOn": [EntityType.INTEGRATOR],
                        "table": SettingsTable.ENTITY_SERVICE_TYPE_SETTING,
                        "services": ["tca.services.rcp"]
                    },
                    {
                        "group": "Default Mandate Details",
                        "name": "ocs.ed.mandate.default.details",
                        "field": "adjustmentValue",
                        "label": "Adjustment Value",
                        "placeholder": "Enter Adjustment Value",
                        "type": InputType.TEXT,
                        "defaultValue": "1",
                        "allowOn": [EntityType.INTEGRATOR],
                        "table": SettingsTable.ENTITY_SERVICE_TYPE_SETTING,
                        "services": ["tca.services.rcp"]
                    },
                    {
                        "group": "Default Mandate Details",
                        "name": "ocs.ed.mandate.default.details",
                        "field": "calculateInstallment",
                        "label": "Calculate Installment",
                        "placeholder": "Enter Calculate Installment",
                        "type": InputType.CHECKBOX,
                        "defaultValue": false,
                        "allowOn": [EntityType.INTEGRATOR],
                        "table": SettingsTable.ENTITY_SERVICE_TYPE_SETTING,
                        "services": ["tca.services.rcp"]
                    },
                    {
                        "group": "Default Mandate Details",
                        "name": "ocs.ed.mandate.default.details",
                        "field": "dateAdjustmentAllowed",
                        "label": "Date Adjustment Allowed",
                        "placeholder": "Enter Date Adjustment Allowed",
                        "type": InputType.CHECKBOX,
                        "defaultValue": "Y",
                        "translateValues": {"true": "Y", "false": "N"},
                        "allowOn": [EntityType.INTEGRATOR],
                        "table": SettingsTable.ENTITY_SERVICE_TYPE_SETTING,
                        "services": ["tca.services.rcp"]
                    },
                    {
                        "group": "Default Mandate Details",
                        "name": "ocs.ed.mandate.default.details",
                        "field": "debitClassification",
                        "label": "Debit Classification",
                        "placeholder": "Enter Debit Classification",
                        "type": InputType.SELECT,
                        "defaultValue": "LRM",
                        "sort": true,
                        "allowOn": [EntityType.INTEGRATOR],
                        "table": SettingsTable.ENTITY_SERVICE_TYPE_SETTING,
                        "services": ["tca.services.rcp"]
                    },
                    {
                        "group": "Default Mandate Details",
                        "name": "ocs.ed.mandate.default.details",
                        "field": "frequency",
                        "label": "Frequency",
                        "placeholder": "Enter Frequency",
                        "type": InputType.SELECT,
                        "defaultValue": "MONTHLY",
                        "values": ["ADHOC", "WEEKLY", "FORTNIGHTLY", "MONTHLY", "QUARTERLY", "BIANUALLY", "ANNUALLY", "ONCE_OFF"],
                        "allowOn": [EntityType.INTEGRATOR],
                        "table": SettingsTable.ENTITY_SERVICE_TYPE_SETTING,
                        "services": ["tca.services.rcp"]
                    },
                    {
                        "group": "Default Mandate Details",
                        "name": "ocs.ed.mandate.default.details",
                        "field": "generateContractReference",
                        "label": "Generate Contract Reference",
                        "placeholder": "Enter Generate Contract Reference",
                        "type": InputType.CHECKBOX,
                        "defaultValue": true,
                        "allowOn": [EntityType.INTEGRATOR],
                        "table": SettingsTable.ENTITY_SERVICE_TYPE_SETTING,
                        "services": ["tca.services.rcp"]
                    },
                    {
                        "group": "Default Mandate Details",
                        "name": "ocs.ed.mandate.default.details",
                        "field": "generateInstallment",
                        "label": "Generate Installment",
                        "placeholder": "Enter Generate Installment",
                        "type": InputType.CHECKBOX,
                        "defaultValue": true,
                        "allowOn": [EntityType.INTEGRATOR],
                        "table": SettingsTable.ENTITY_SERVICE_TYPE_SETTING,
                        "services": ["tca.services.rcp"]
                    },
                    {
                        "group": "Default Mandate Details",
                        "name": "ocs.ed.mandate.default.details",
                        "field": "mandateType",
                        "label": "Mandate Type",
                        "placeholder": "Enter Mandate Type",
                        "type": InputType.SELECT,
                        "defaultValue": "Usage",
                        "values": [{"key": 1, "value": "Fixed"}, {"key": 2, "value": "Variable"}, {"key": 3, "value": "Usage"}],
                        "allowOn": [EntityType.INTEGRATOR],
                        "table": SettingsTable.ENTITY_SERVICE_TYPE_SETTING,
                        "services": ["tca.services.rcp"]
                    },
                    {
                        "group": "Default Mandate Details",
                        "name": "ocs.ed.mandate.default.details",
                        "field": "maximumInstallmentAmount",
                        "label": "Maximum Installment Amount",
                        "placeholder": "Enter Maximum Installment Amount",
                        "type": InputType.NUMBER,
                        "defaultValue": "10000",
                        "allowOn": [EntityType.INTEGRATOR],
                        "table": SettingsTable.ENTITY_SERVICE_TYPE_SETTING,
                        "services": ["tca.services.rcp"]
                    },
                    {
                        "group": "Default Mandate Details",
                        "name": "ocs.ed.mandate.default.details",
                        "field": "referenceFormat",
                        "label": "Contract Reference Format",
                        "placeholder": "Enter Contract Reference Format",
                        "type": InputType.TEXT,
                        "defaultValue": "Group5_*******",
                        "maxLength": 14,
                        "dependsOn": "generateContractReference:true",
                        "allowOn": [EntityType.INTEGRATOR],
                        "table": SettingsTable.ENTITY_SERVICE_TYPE_SETTING,
                        "services": ["tca.services.rcp"]
                    },
                    {
                        "group": "Default Mandate Details",
                        "name": "ocs.ed.mandate.default.details",
                        "field": "scheme",
                        "label": "Scheme",
                        "placeholder": "Enter Scheme",
                        "type": InputType.TEXT,
                        "defaultValue": "GRPFVPRTN",
                        "allowOn": [EntityType.INTEGRATOR],
                        "table": SettingsTable.ENTITY_SERVICE_TYPE_SETTING,
                        "services": ["tca.services.rcp"]
                    },
                    {
                        "group": "Default Mandate Details",
                        "name": "ocs.ed.mandate.default.details",
                        "field": "tracking",
                        "label": "Tracking",
                        "placeholder": "Enter Tracking",
                        "type": InputType.CHECKBOX,
                        "defaultValue": true,
                        "allowOn": [EntityType.INTEGRATOR],
                        "table": SettingsTable.ENTITY_SERVICE_TYPE_SETTING,
                        "services": ["tca.services.rcp"]
                    }
                ]
            }
        ],
        "settings": [
            {
                "name": "app.mandate.authentication.enabled",
                "allowOn": [EntityType.PARENT],
                "table": SettingsTable.ENTITY_SERVICE_TYPE_SETTING,
                "type": InputType.CHECKBOX
            },
            {
                "name": "app.mandate.creation.enabled",
                "table": SettingsTable.ENTITY_SERVICE_TYPE_SETTING,
                "type": InputType.CHECKBOX
            },
            {
                "name": "app.mandate.creation.fields",
                "table": SettingsTable.ENTITY_SERVICE_TYPE_SETTING,
                "type": InputType.CHECKBOX
            },
            {
                "name": "app.manual.payments.enabled",
                "allowOn": [EntityType.PARENT],
                "table": SettingsTable.ENTITY_SERVICE_TYPE_SETTING,
                "type": InputType.CHECKBOX
            },
            {
                "name": "app.payments.enabled",
                "allowOn": [EntityType.PARENT],
                "table": SettingsTable.ENTITY_SERVICE_TYPE_SETTING,
                "type": InputType.CHECKBOX
            },
            {
                "name": "app.transaction.history.enabled",
                "allowOn": [EntityType.PARENT],
                "table": SettingsTable.ENTITY_SERVICE_TYPE_SETTING,
                "type": InputType.CHECKBOX
            },
            {
                "name": "tca.application.key",
                "allowOn": [EntityType.PARENT],
                "table": SettingsTable.ENTITY_SERVICE_TYPE_SETTING,
                "type": InputType.CHECKBOX
            },
            {
                "name": "tca.merchant.id",
                "allowOn": [EntityType.PARENT],
                "table": SettingsTable.ENTITY_SERVICE_TYPE_SETTING,
                "type": InputType.CHECKBOX
            },
            {
                "name": "tca.merchant.username",
                "allowOn": [EntityType.PARENT],
                "table": SettingsTable.ENTITY_SERVICE_TYPE_SETTING,
                "type": InputType.CHECKBOX
            },
            {
                "group": "Manual Payment References",
                "name": "manual.payments.reference.config",
                "field": "app.manual.payments.reference.customer",
                "label": "Customer Reference",
                "placeholder": "Enter Customer Reference",
                "type": InputType.SELECT,
                "defaultValue": "disabled",
                "values": ["enabled", "disabled", "required"],
                "table": SettingsTable.ENTITY_SERVICE_TYPE_SETTING,
                "services": []
            },
            {
                "group": "Manual Payment References",
                "name": "manual.payments.reference.config",
                "field": "app.manual.payments.reference.internal",
                "label": "Internal Reference",
                "placeholder": "Enter Internal Reference",
                "type": InputType.SELECT,
                "defaultValue": "disabled",
                "values": ["enabled", "disabled", "required"],
                "table": SettingsTable.ENTITY_SERVICE_TYPE_SETTING,
                "services": []
            },
            {
                "group": "Default Mandate Details",
                "name": "ocs.ed.mandate.default.details",
                "field": "adjustmentFrequency",
                "label": "Adjustment Frequency",
                "placeholder": "Enter Adjustment Frequency",
                "type": InputType.SELECT,
                "defaultValue": "ANUALLY",
                "values": ["ANNUALLY", "BIANNUALLY", "QUARTERLY", "REPO", "NEVER", "OTHER"],
                "allowOn": [EntityType.INTEGRATOR],
                "table": SettingsTable.ENTITY_SERVICE_TYPE_SETTING,
                "services": []
            },
            {
                "group": "Default Mandate Details",
                "name": "ocs.ed.mandate.default.details",
                "field": "adjustmentType",
                "label": "Adjustment Type",
                "placeholder": "Enter Adjustment Type",
                "type": InputType.TEXT,
                "defaultValue": "RATE",
                "values": [{"key": 1, "value": "RATE"}, {"key": 2, "value": "AMOUNT"}],
                "allowOn": [EntityType.INTEGRATOR],
                "table": SettingsTable.ENTITY_SERVICE_TYPE_SETTING,
                "services": []
            },
            {
                "group": "Default Mandate Details",
                "name": "ocs.ed.mandate.default.details",
                "field": "adjustmentValue",
                "label": "Adjustment Value",
                "placeholder": "Enter Adjustment Value",
                "type": InputType.TEXT,
                "defaultValue": "1",
                "allowOn": [EntityType.INTEGRATOR],
                "table": SettingsTable.ENTITY_SERVICE_TYPE_SETTING,
                "services": []
            },
            {
                "group": "Default Mandate Details",
                "name": "ocs.ed.mandate.default.details",
                "field": "calculateInstallment",
                "label": "Calculate Installment",
                "placeholder": "Enter Calculate Installment",
                "type": InputType.CHECKBOX,
                "defaultValue": false,
                "allowOn": [EntityType.INTEGRATOR],
                "table": SettingsTable.ENTITY_SERVICE_TYPE_SETTING,
                "services": []
            },
            {
                "group": "Default Mandate Details",
                "name": "ocs.ed.mandate.default.details",
                "field": "dateAdjustmentAllowed",
                "label": "Date Adjustment Allowed",
                "placeholder": "Enter Date Adjustment Allowed",
                "type": InputType.CHECKBOX,
                "defaultValue": "Y",
                "translateValues": {"true": "Y", "false": "N"},
                "allowOn": [EntityType.INTEGRATOR],
                "table": SettingsTable.ENTITY_SERVICE_TYPE_SETTING,
                "services": []
            },
            {
                "group": "Default Mandate Details",
                "name": "ocs.ed.mandate.default.details",
                "field": "debitClassification",
                "label": "Debit Classification",
                "placeholder": "Enter Debit Classification",
                "type": InputType.SELECT,
                "defaultValue": "LRM",
                "sort": true,
                "allowOn": [EntityType.INTEGRATOR],
                "table": SettingsTable.ENTITY_SERVICE_TYPE_SETTING,
                "services": []
            },
            {
                "group": "Default Mandate Details",
                "name": "ocs.ed.mandate.default.details",
                "field": "frequency",
                "label": "Frequency",
                "placeholder": "Enter Frequency",
                "type": InputType.SELECT,
                "defaultValue": "MONTHLY",
                "values": ["ADHOC", "WEEKLY", "FORTNIGHTLY", "MONTHLY", "QUARTERLY", "BIANUALLY", "ANNUALLY", "ONCE_OFF"],
                "allowOn": [EntityType.INTEGRATOR],
                "table": SettingsTable.ENTITY_SERVICE_TYPE_SETTING,
                "services": []
            },
            {
                "group": "Default Mandate Details",
                "name": "ocs.ed.mandate.default.details",
                "field": "generateContractReference",
                "label": "Generate Contract Reference",
                "placeholder": "Enter Generate Contract Reference",
                "type": InputType.CHECKBOX,
                "defaultValue": true,
                "allowOn": [EntityType.INTEGRATOR],
                "table": SettingsTable.ENTITY_SERVICE_TYPE_SETTING,
                "services": []
            },
            {
                "group": "Default Mandate Details",
                "name": "ocs.ed.mandate.default.details",
                "field": "generateInstallment",
                "label": "Generate Installment",
                "placeholder": "Enter Generate Installment",
                "type": InputType.CHECKBOX,
                "defaultValue": true,
                "allowOn": [EntityType.INTEGRATOR],
                "table": SettingsTable.ENTITY_SERVICE_TYPE_SETTING,
                "services": []
            },
            {
                "group": "Default Mandate Details",
                "name": "ocs.ed.mandate.default.details",
                "field": "mandateType",
                "label": "Mandate Type",
                "placeholder": "Enter Mandate Type",
                "type": InputType.SELECT,
                "defaultValue": "Usage",
                "values": [{"key": 1, "value": "Fixed"}, {"key": 2, "value": "Variable"}, {"key": 3, "value": "Usage"}],
                "allowOn": [EntityType.INTEGRATOR],
                "table": SettingsTable.ENTITY_SERVICE_TYPE_SETTING,
                "services": []
            },
            {
                "group": "Default Mandate Details",
                "name": "ocs.ed.mandate.default.details",
                "field": "maximumInstallmentAmount",
                "label": "Maximum Installment Amount",
                "placeholder": "Enter Maximum Installment Amount",
                "type": InputType.NUMBER,
                "defaultValue": "10000",
                "allowOn": [EntityType.INTEGRATOR],
                "table": SettingsTable.ENTITY_SERVICE_TYPE_SETTING,
                "services": []
            },
            {
                "group": "Default Mandate Details",
                "name": "ocs.ed.mandate.default.details",
                "field": "referenceFormat",
                "label": "Contract Reference Format",
                "placeholder": "Enter Contract Reference Format",
                "type": InputType.TEXT,
                "defaultValue": "Group5_*******",
                "maxLength": 14,
                "dependsOn": "generateContractReference:true",
                "allowOn": [EntityType.INTEGRATOR],
                "table": SettingsTable.ENTITY_SERVICE_TYPE_SETTING,
                "services": []
            },
            {
                "group": "Default Mandate Details",
                "name": "ocs.ed.mandate.default.details",
                "field": "scheme",
                "label": "Scheme",
                "placeholder": "Enter Scheme",
                "type": InputType.TEXT,
                "defaultValue": "GRPFVPRTN",
                "allowOn": [EntityType.INTEGRATOR],
                "table": SettingsTable.ENTITY_SERVICE_TYPE_SETTING,
                "services": []
            },
            {
                "group": "Default Mandate Details",
                "name": "ocs.ed.mandate.default.details",
                "field": "tracking",
                "label": "Tracking",
                "placeholder": "Enter Tracking",
                "type": InputType.CHECKBOX,
                "defaultValue": true,
                "allowOn": [EntityType.INTEGRATOR],
                "table": SettingsTable.ENTITY_SERVICE_TYPE_SETTING,
                "services": []
            }
        ]
    },
    "VMS": {
        "name": "VerifyMe Service API",
        "allowOn": [EntityType.INTEGRATOR, EntityType.PARENT],
        "services": [
            {
                "name": "verifyme.services.verifyme",
                "display": "VerifyMe Service",
                "description": "Can perform multiple verifications",
                "allowOn": [EntityType.INTEGRATOR, EntityType.PARENT],
                "tables": [ServiceTable.ENTITY_SERVICE_TYPE],
                "settings": [
                    {
                        "name": "entity.avs.webhook.url",
                        "allowOn": [EntityType.INTEGRATOR],
                        "table": SettingsTable.ENTITY_SERVICE_SETTING,
                        "type": InputType.TEXT
                    },
                    {
                        "name": "entity.bss.redirect.url",
                        "allowOn": [EntityType.INTEGRATOR],
                        "table": SettingsTable.ENTITY_SERVICE_SETTING,
                        "type": InputType.TEXT
                    },
                    {
                        "name": "entity.bss.webhook.url",
                        "allowOn": [EntityType.INTEGRATOR],
                        "table": SettingsTable.ENTITY_SERVICE_SETTING,
                        "type": InputType.TEXT
                    },
                    {
                        "name": "entity.client.secret",
                        "allowOn": [EntityType.INTEGRATOR],
                        "table": SettingsTable.ENTITY_SERVICE_SETTING,
                        "type": InputType.TEXT
                    },
                    {
                        "name": "entity.liveness.redirect.url",
                        "allowOn": [EntityType.INTEGRATOR],
                        "table": SettingsTable.ENTITY_SERVICE_SETTING,
                        "type": InputType.TEXT
                    },
                    {
                        "name": "entity.liveness.webhook.url",
                        "allowOn": [EntityType.INTEGRATOR],
                        "table": SettingsTable.ENTITY_SERVICE_SETTING,
                        "type": InputType.TEXT
                    },
                    {
                        "name": "entity.redirect.url",
                        "allowOn": [EntityType.INTEGRATOR],
                        "table": SettingsTable.ENTITY_SERVICE_SETTING,
                        "type": InputType.TEXT
                    },
                    {
                        "name": "entity.webhook.url",
                        "allowOn": [EntityType.INTEGRATOR],
                        "table": SettingsTable.ENTITY_SERVICE_SETTING,
                        "type": InputType.TEXT
                    }
                ]
            }
        ],
        "settings": [
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
