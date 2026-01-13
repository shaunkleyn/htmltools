// Updated setting descriptions and structure handling
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

// Scope definitions with their services and settings
const scopes = {
    "AML": {
       "name": "Anti-Money Laundering Service",
       "allowOn": ["parent", "integrator"],
       "services": [
            {
               "name": "aml.service.aml",
               "display": "Anti-Money Laundering Service",
               "description": "Designed to detect risks associated with money laundering activities",
               "allowOn": ["parent", "integrator"],
               "settings": []
            }
        ],
       "settings": [],
       "table": [
            "entity_service",
            "entity_service_type"
        ]
    },
    "AVS": {
       "name": "Account Verification Service",
       "allowOn": ["parent", "integrator"],
       "table": ["entity_service_type"],
       "services": [
            {
               "name": "avs.services.avs",
               "display": "Account Verification",
               "description": "Can perform account verification",
               "settings": [
                    {
                       "name": "avs.easydebit.profile",
                       "allowOn": ["parent", "integrator"],
                       "type": "checkbox",    
                       "table": ["entity_service_type_setting"]             
                    },
                    {
                       "name": "avs.track.request",
                       "allowOn": ["parent", "integrator"],
                       "type": "checkbox",
                       "table": ["entity_service_type_setting"]  
                    },
                    {
                       "name": "ivs.track.request",
                       "allowOn": ["parent"],
                       "type": "checkbox",
                       "table": ["entity_service_type_setting"] 
                    },
                ]
            }
        ],
        "settings": []
    },
    "BIVS": {
       "name": "Batch Identity Verification Service",
       "allowOn": ["parent", "integrator"],
       "services": [
            {
               "name": "bivs.services.bivs",
               "display": "Batch Identity Verification Service",
               "description": "Can Upload Identity Verification Service Batch",
               "settings": [
                {
                       "name": "bivs.track.request",
                       "allowOn": ["parent", "integrator"],
                       "type": "checkbox",    
                       "table": ["entity_service_type_setting"]             
                    },
               ]
            }
        ],
        "table": ["entity_service_type_setting", "entity_service_setting"],
       "settings": []
    },
    "BMS": {
       "name": "Bitventure Messaging Service",
       "allowOn": ["parent", "integrator"],
       "services": [
            {
               "name": "bms.services.bms",
               "description": "SMS Service",
               "allowOn": ["parent", "integrator"],
               "settings": [
                    {
                        "name": "bms.entity.webhook.url",
                        "placeholder": "SMS status webhook",
                        "description": "Webhook URL for SMS status updates",
                        "helpText": "Enter the webhook URL for SMS status updates"
                        }
                ]
            },
            {
               "name": "bms.services.ems",
               "description": "Emailing Service",
               "allowOn": ["parent", "integrator"],
               "settings": []
            }
        ],
        "table": [
            "entity_service_setting",
            "entity_service_type_setting"
        ],
       "settings": []
    },
    "BPS": {
       "name": "Bitventure Payments Service",
       "allowOn": ["parent", "integrator"],
       "services": [
            {
               "name": "bps.services.rtc",
               "description": "Realtime Payments",
               "allowOn": ["parent", "integrator"],
               "settings": [
                    {
                       "name": "bps.ed.ws.gc",
                       "allowOn": ["parent", "integrator"],    
                       "table": ["entity_service_type_setting"]             
                    },
                    {
                       "name": "bps.ed.ws.pwd",
                       "allowOn": ["parent", "integrator"],    
                       "table": ["entity_service_type_setting"]             
                    },
                    {
                       "name": "bps.ed.ws.usr",
                       "allowOn": ["parent", "integrator"],    
                       "table": ["entity_service_type_setting"]             
                    },
                    {
                       "name": "bps.entity.reference",
                       "allowOn": ["parent", "integrator"],    
                       "table": ["entity_service_type_setting"]             
                    },
                ]
            }
        ],
        "table": [
            "entity_service_setting",
            "entity_service_type_setting"
        ],
       "settings": []
    },
    "BSS": {
       "name": "Bank Statements Service",
       "allowOn": ["parent", "integrator"],
       "services": [
            {
               "name": "bss.services.bss",
               "display": "Bank Statements Service",
               "description": "Can perform bank statement retrieval and processing",
               "settings": [
                    {
                       "name": "bss.redirect.url",
                       "allowOn": ["parent"],    
                       "table": ["entity_service_type_setting"]             
                    },
                    {
                        "group": "SMS Settings",
                        "name": "bss.sms.header",
                        "allowOn": ["parent"],    
                        "table": ["entity_service_type_setting"]             
                    },
                    {
                        "group": "SMS Settings",
                        "name": "bss.sms.footer",
                        "allowOn": ["parent"],    
                        "table": ["entity_service_type_setting"]             
                    },
                    {
                        "group": "Entity Settings",
                        "name": "entity.redirect.url",
                        "allowOn": ["integrator"],    
                        "table": ["entity_service_setting"]             
                    },
                    {
                        "group": "Entity Settings",
                        "name": "entity.webhook.url",
                        "allowOn": ["integrator"],    
                        "table": ["entity_service_setting"]             
                    },
                    {
                        "group": "Email Settings",
                        "name": "message.header",
                        "allowOn": ["integrator"],    
                        "table": ["entity_service_setting"]             
                    },
                    {
                        "group": "Email Settings",
                        "name": "message.footer",
                        "allowOn": ["integrator"],    
                        "table": ["entity_service_setting"]             
                    },
                ]
            }
        ],
       "settings": []
    },
    "BVS": {
       "name": "Biometric Verification Service",
       "allowOn": ["parent", "integrator"],
       "services": [
            {
               "name": "bvs.services.bvs",
               "description": "Biometric Verification Service",
               "settings": []
            }
        ],
        "table": [
            "entity_service_setting",
            "entity_service_type_setting"
        ],

       "settings": []
    },
    "CDS": {
       "name": "Card Disbursement Service",
       "allowOn": ["parent", "integrator"],
       "table": [
            "entity_service",
            "entity_service_type"
        ],
       "services": [
            {
               "name": "cds.services.cds",
               "description": "Card Disbursement Service",
               "settings": []
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
               "settings": []
            }
        ],
        "table": [
            "entity_service",
            "entity_service_type"
        ],
       "settings": []
    },
    "CMS": {
       "name": "Client Management Service",
       "allowOn": ["parent", "integrator", "device"],
       "services": [
        {
               "name": "cms.services.cms",
               "description": "Client Management",
               "settings": [
                    {
                       "name": "cms.track.request",
                       "allowOn": ["device"],
                       "type": "checkbox",    
                       "table": ["entity_service_type_setting"]             
                    }
               ]
            },
            {
               "name": "cms.services.entity",
               "description": "Entity Management",
               "settings": [
                    {
                       "name": "cms.track.request",
                       "allowOn": ["device"],
                       "type": "checkbox",    
                       "table": ["entity_service_type_setting"]             
                    }
               ]
            }
        ],
        "table": [
            "entity_service",
            "entity_service_type"
        ],
       "settings": []
    },
    "COVS": {
       "name": "Company Verification Service",
       "allowOn": ["parent", "integrator"],
       "services": [
            {
               "name": "covs.services.covs",
               "description": "Company Verification",
               "settings": []
            }
        ],
        "table": [
            "entity_service",
            "entity_service_type"
        ],
       "settings": []
    },
    "CRS": {
       "name": "Credit Score Service",
       "allowOn": ["parent", "integrator"],
       "services": [
            {
               "name": "crs.service.afa",
               "description": "Affordability Assessment Service",
               "display": "Can perform affordability assessment check",
               "settings": [
               ],
               "table": [
                    "entity_service",
                    "entity_service_type"
                ],
            },
            {
               "name": "crs.services.crs",
               "description": "Credit Rating Service",
               
            },
            {
               "name": "crs.services.report",
               "description": "Credit Report Service",
               "settings": [
                ]
            },

        ],
       "settings": [
                    {
                       "name": "afa.disposable.income.threshold.percentage",
                       "allowOn": ["integrator", "webservice"],
                       "applyToEntities": ["integrator", "webservice"],
                       "applyToServices": ["crs.service.afa", "crs.services.crs", "crs.services.report"],
                       "type": "number",    
                       "table": ["entity_service_type_setting"]             
                    },
                    {
                       "name": "afa.threshold.percentage",
                       "allowOn": ["integrator", "webservice"],
                       "applyToEntities": ["integrator", "webservice"],
                       "applyToServices": ["crs.service.afa", "crs.services.crs", "crs.services.report"],
                       "type": "number",    
                       "table": ["entity_service_type_setting"]             
                    },
                    {
                       "name": "afa.track.request",
                       "allowOn": ["integrator", "webservice"],
                       "applyToEntities": ["integrator", "webservice"],
                       "applyToServices": ["crs.service.afa", "crs.services.crs", "crs.services.report"],
                       "type": "checkbox",    
                       "table": ["entity_service_type_setting"]             
                    },
                    {
                       "name": "crs.cpb.enquiry.done.by",
                       "allowOn": ["parent", "integrator", "webservice"],
                       "applyToEntities": ["integrator", "webservice"],
                       "applyToServices": ["crs.service.afa", "crs.services.crs", "crs.services.report"],
                       "table": ["entity_service_type_setting"]             
                    },
                    {
                       "name": "crs.track.request",
                       "allowOn": ["parent", "integrator", "webservice"],
                       "applyToEntities": ["integrator", "webservice"],
                       "applyToServices": ["crs.service.afa", "crs.services.crs", "crs.services.report"],
                       "table": ["entity_service_type_setting"]             
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
                       "allowOn": ["parent", "integrator", "device"],    
                       "type": "checkbox",
                       "table": ["entity_service_type_setting"]             
                    },
               ]
            }
        ],
       "settings": []
    },
    "FMS": {
       "name": "Fingerprint Matching Service",
       "services": [
            {
               "name": "fms.services.match",
               "description": "Fingerprint Matching",
               "display": "Can perform fingerprint matching",
               "allowOn": ["webservice"],
               "table": [
                    "entity_service",
                    "entity_service_type"
                ],
               "settings": []
            },
            {
               "name": "fms.services.match.extended",
               "description": "Fingerprint Registration",
               "display": "Can register a new fingerprint into the fingerprint store",
               "allowOn": ["webservice"],
                "table": [
                    "entity_service",
                    "entity_service_type"
                ],

               "settings": []
            }
        ],
       "settings": []
    },
    "FVS": {
       "name": "Facial Verification",
       "services": [
            {
               "name": "fvs.services.fvs",
               "description": "Facial Verification",
               "settings": []
            },
            {
               "name": "fvs.services.liveness",
               "description": "Liveness Verification",
               "settings": [
                    "fvs.liveness.sms.header",
                    "fvs.liveness.sms.footer",
                    "fvs.liveness.redirect.url",
                    "fvs.liveness.webhook.url",
                    "fvs.liveness.logo",
                    "entity.liveness.redirect.url",
                    "entity.liveness.webhook.url"
                ]
            },
            {
               "name": "fvs.services.liveness.noivs",
               "description": "No IVS Liveness Verification",
               "settings": []
            }
        ],
       "settings": [
            "fvs.expiry.time"
        ]
    },
    "IVS": {
       "name": "Identity Verification",
       "services": [
            {
               "name": "ivs.services.ivs",
               "description": "Identity Verification",
               "settings": []
            },
            {
               "name": "ivs.services.photo",
               "description": "IVS Photo",
               "settings": []
            },
            {
               "name": "ivs.services.data",
               "description": "IVS Data",
               "settings": []
            },
            {
               "name": "ivs.services.ivsf",
               "description": "Identity Verification Foreigner",
               "settings": []
            },
            {
               "name": "ivs.services.lineage",
               "description": "IVS Lineage",
               "settings": []
            },
            {
               "name": "ivs.services.deceased",
               "description": "IVS Deceased",
               "settings": []
            },
            {
               "name": "ivs.services.bvs",
               "description": "IVS Biometric Verification",
               "settings": []
            }
        ],
       "settings": []
    },
    "LMS": {
       "name": "Loan Management",
       "services": [
            {
               "name": "lms.services.lms",
               "description": "Loan Management",
               "settings": [
                    "lms.ed.ws.usr",
                    "lms.ed.ws.pwd"
                ]
            }
        ],
       "settings": []
    },
    "OCS": {
       "name": "Online Collection Service",
       "services": [
            {
               "name": "ocs.services.mandate",
               "description": "Mandate Creation",
               "allowOn": ["parent", "integrator"],
               "settings": [
                    {
                       "name": "ocs.webhook.url.mandate",
                       "placeholder": "Mandate webhook URL",
                       "description": "Webhook URL for mandate notifications",
                       "helpText": "Enter the webhook URL for mandate notifications",
                       "applyTo": "integrator",
                       "table": "entity_service_setting"
                    }
                ]
            },
            {
               "name": "ocs.services.collection",
               "description": "Collection",
               "allowOn": ["parent", "integrator"],
               "settings": [
                    {
                       "name": "ocs.webhook.url.collection",
                       "placeholder": "Collection webhook URL",
                       "description": "Webhook URL for collection notifications",
                       "helpText": "Enter the webhook URL for collection notifications",
                       "table": "entity_service_setting"
                    }
                ]
            },
            {
               "name": "ocs.services.debitorder",
               "description": "Debit Order",
               "allowOn": ["parent", "integrator"],
               "settings": [
                    {
                       "name": "ocs.ed.do.sc.gc.map",
                       "placeholder": "EasyDebit DO SC GC Map",
                       "description": "EasyDebit DO SC GC Map",
                       "applyTo": "integrator"
                    },
                    {
                       "name": "ocs.ed.do.ul.gc.map",
                       "placeholder": "EasyDebit DO UL GC Map",
                       "description": "EasyDebit DO UL GC Map",
                       "applyTo": "integrator"
                    },
                    {
                       "name": "ocs.ed.do.gc",
                       "placeholder": "EasyDebit DO GC",
                       "description": "EasyDebit DO GC",
                       "applyTo": "integrator"
                    }
                ]
            }
        ],
       "settings": [
            {
               "group": "EasyDebit.Webservice",
               "name": "ocs.ed.ws.usr", 
               "placeholder": "EasyDebit Webservice User",
               "helpText": "EasyDebit Webservice User for web service authentication",
               "services": ["ocs.services.collection", "ocs.services.mandate", "ocs.services.debitorder"]
            },
            {
               "group": "EasyDebit.Webservice",
               "name": "ocs.ed.ws.pwd", 
               "placeholder": "EasyDebit Webservice Password",
               "description": "EasyDebit Webservice Password for web service authentication",
               "services": ["ocs.services.collection", "ocs.services.mandate", "ocs.services.debitorder"]
            },
            {
               "group": "EasyDebit.Webservice",
               "name": "ocs.ed.ws.gc", 
               "placeholder": "EasyDebit Webservice Group Code",
               "description": "EasyDebit Webservice Group Code",
               "services": ["ocs.services.collection", "ocs.services.mandate", "ocs.services.debitorder"]
            },
            {
               "group": "EasyDebit", 
               "name": "ocs.df.scheme",
               "placeholder": "Default Scheme",
               "description": "This is what the scheme name is which maps back to the Easy Debit Group code. We set to settings to act as a default value to be used for children inheriting from a parent",
               "services": ["ocs.services.collection", "ocs.services.mandate", "ocs.services.debitorder"]
            },
            {
               "group": "EasyDebit",
               "name": "ocs.ed.sc.gc.map",  
               "placeholder": "EasyDebit SC GC Map",
               "description": "Mapping between scheme names and group codes",
               "helpText": "Define the mapping between scheme names and EasyDebit group codes in JSON format.",
               "services": ["ocs.services.collection", "ocs.services.mandate", "ocs.services.debitorder"]
            },
            {
               "group": "EasyDebit",
               "name": "ocs.ed.ul.gc.map",  
               "placeholder": "EasyDebit UL GC Map",
               "description": "EasyDebit UL GC Map",
               "services": ["ocs.services.collection", "ocs.services.mandate", "ocs.services.debitorder"]
            },
            {
               "group": "EasyDebit",
               "name": "ocs.ed.passthrough",  
               "type": "checkbox",
               "placeholder": "EasyDebit Passthrough",
               "description": "EasyDebit Passthrough",
               "defaultValue": true,
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
               "type": "textbox",
               "defaultValue": "ANNUALLY",
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
               "helpText": "No special characters allowed",
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
               "type": "textbox",
               "defaultValue": "LRM",
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
               "type": "textbox",
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
               "group": "Integrations",
               "name": "ocs.easy.loan.webhook.url", 
               "placeholder": "Easy Loan Webhook URL",
               "description": "Webhook URL for Easy Loan integration",
               "helpText": "This setting is only applicable if you are using the Easy Loan integration.",
               "applyTo": "integrator",
               "services": ["ocs.services.collection", "ocs.services.mandate", "ocs.services.debitorder"]
            },
            {
               "group": "Integrations",
               "name": "external.status.webhook.url", 
               "description": "Webhook URL for receipt printing on the EasyPOS.",
               "placeholder": "External Status Webhook URL",
               "helpText": "This setting is only applicable if you are using EasyPOS.",
               "applyTo": "deviceuser",
               "services": ["ocs.services.collection", "ocs.services.mandate", "ocs.services.debitorder"]
            },
            {
               "group": "Nedbank Settings",
               "name": "ocs.ned.cre.nme"
            },
            {
               "group": "Nedbank Settings",
               "name": "ocs.ned.cre.abr.sho.nme"
            },
            {
               "group": "Nedbank Settings",
               "name": "ocs.ned.cre.bra.cde"
            },
            {
               "group": "Nedbank Settings",
               "name": "ocs.ned.cre.acc.num"
            },
            {
               "group": "Nedbank Settings",
               "name": "ocs.ned.pro.acc"
            },
            {
               "group": "Nedbank Settings",
               "name": "ocs.ned.chg.acc"
            },
            {
               "group": "Nedbank Settings",
               "name": "ocs.ned.cli.pro"
            },
            {
               "group": "Nedbank Settings",
               "name": "ocs.ned.cre.ema.det"
            },
            {
               "group": "Nedbank Settings",
               "name": "ocs.ned.cre.tel.det"
            }

        ]
    },
    "OPS": {
       "name": "Payment Operations",
       "services": [
            {
               "name": "ops.services.ieft",
               "description": "Initiate Instant EFT",
               "settings": [
                    "ops.ieft.ozow.sitecode",
                    "iveri.auth.app.id",
                    "iveri.auth.certificate.id"
                ]
            },
            {
               "name": "ops.services.cps",
               "description": "Card Payment",
               "settings": [
                    "ops.cps.sms.header",
                    "ops.cps.sms.footer",
                    "ops.cps.redirect.url"
                ]
            },
            {
               "name": "ops.services.tokenization",
               "description": "Tokenization Service",
               "settings": []
            }
        ],
       "settings": []
    },
    "PUI": {
       "name": "Phoenix Entity Details Service",
       "services": [
            {
               "name": "pui.services.entity",
               "description": "Phoenix Entity Details Service",
               "settings": [
                    "pui.logo"
                ]
            }
        ],
       "settings": []
    },
    "PVS": {
       "name": "Person Verification",
       "services": [
            {
               "name": "pvs.services.pvs",
               "description": "Person Verification",
               "settings": []
            }
        ],
       "settings": []
    },
    "SDS": {
       "name": "Strike Date Optimization",
       "services": [
            {
               "name": "sds.services.sds",
               "description": "Strike Date Optimization",
               "settings": []
            }
        ],
       "settings": []
    },
    "SSV": {
       "name": "SIM Swap Verification",
       "services": [
            {
               "name": "ssv.services.ssv",
               "description": "SIM Swap Verification",
               "settings": []
            }
        ],
       "settings": []
    },
    "TCA": {
       "name": "Transaction Card Authorisation",
       "services": [
            {
               "name": "tca.services.mca",
               "description": "Search, Retrieve and Authenticate Mandate",
               "settings": [
                    {
                       "group": "Transaction Card Authorisation Settings",
                       "name": "tca.application.key",
                       "placeholder": "TCA Application Key",
                       "description": "Application key for Transaction Card Authorization",
                       "allowOn": ["deviceuser"]
                    },
                    {
                       "group": "Transaction Card Authorisation Settings",
                       "name": "tca.merchant.id",
                       "placeholder": "TCA Merchant ID",
                       "description": "Merchant ID for Transaction Card Authorization",
                       "allowOn": ["deviceuser"]
                    },
                    {
                       "group": "Transaction Card Authorisation Settings",
                       "name": "tca.merchant.username",
                       "placeholder": "TCA Merchant Username",
                       "description": "Merchant Username for Transaction Card Authorization",
                       "allowOn": ["deviceuser"]
                    }
                ]
            },
            {
               "name": "tca.services.pca",
               "description": "Authorize Payment",
               "settings": []
            },
            {
               "name": "tca.services.rcp",
               "description": "Recurring Card Payment",
               "settings": []
            }
        ],
       "settings": [
            {
               "group": "EPOS.Menu Options",
               "label": "Show EasyPOS Menu?",
               "name": "app.payments.enabled",
               "type": "checkbox",
               "defaultValue": true,
               "services": ["tca.services.mca"]
            },
            {
               "group": "EPOS.Menu Options",
               "label": "Show Manual Payments Option?",
               "name": "app.manual.payments.enabled", 
               "type": "checkbox",
               "dependsOn": "app.payments.enabled:true",
               "dependencyAction": "disable",
               "services": ["tca.services.mca"]
            },
            {
               "group": "EPOS.Menu Options.Manual Payments",
               "label": "Show Additional Reference Fields?",
               "name": "manual.payments.reference.config", 
               "type": "checkbox",
               "dependsOn": "app.payments.enabled:true",
               "dependencyAction": "disable",
               "services": ["tca.services.mca"]
            },
            {
               "group": "EPOS.Menu Options",
               "label": "Show Transaction History Option?",
               "name": "app.transaction.history.enabled", 
               "type": "checkbox",
               "dependsOn": "app.payments.enabled:true",
               "dependencyAction": "disable",
               "services": ["tca.services.mca"]
            },
            {
               "group": "EPOS.Webservice",
               "name": "ocs.ed.ws.pwd", 
               "placeholder": "EasyDebit Webservice Password",
               "description": "EasyDebit Webservice Password for web service authentication",
               "services": ["ocs.services.collection", "ocs.services.mandate", "ocs.services.debitorder"]
            },
            {
               "group": "EPOS.Webservice",
               "name": "ocs.ed.ws.gc", 
               "placeholder": "EasyDebit Webservice Group Code",
               "description": "EasyDebit Webservice Group Code",
               "services": ["ocs.services.collection", "ocs.services.mandate", "ocs.services.debitorder"]
            },
            {
               "group": "EasyDEPOSebit", 
               "name": "ocs.df.scheme",
               "placeholder": "Default Scheme",
               "description": "This is what the scheme name is which maps back to the Easy Debit Group code. We set to settings to act as a default value to be used for children inheriting from a parent",
               "services": ["ocs.services.collection", "ocs.services.mandate", "ocs.services.debitorder"]
            },
            {
               "group": "EPOS",
               "name": "ocs.ed.sc.gc.map",  
               "placeholder": "EasyDebit SC GC Map",
               "description": "Mapping between scheme names and group codes",
               "helpText": "Define the mapping between scheme names and EasyDebit group codes in JSON format.",
               "services": ["ocs.services.collection", "ocs.services.mandate", "ocs.services.debitorder"]
            },
            {
               "group": "EPOS",
               "name": "ocs.ed.ul.gc.map",  
               "placeholder": "EasyDebit UL GC Map",
               "description": "EasyDebit UL GC Map",
               "services": ["ocs.services.collection", "ocs.services.mandate", "ocs.services.debitorder"]
            },
            {
               "group": "EPOS",
               "name": "ocs.ed.passthrough",  
               "type": "checkbox",
               "placeholder": "EasyDebit Passthrough",
               "description": "EasyDebit Passthrough",
               "defaultValue": true,
               "services": ["ocs.services.collection", "ocs.services.mandate", "ocs.services.debitorder"]
            }
        ]
    },
    "VMS": {
       "name": "VerifyMe Service",
       "services": [
            {
               "name": "verifyme.services.verifyme",
               "description": "VerifyMe",
               "settings": []
            }
        ],
       "settings": []
    }
};
