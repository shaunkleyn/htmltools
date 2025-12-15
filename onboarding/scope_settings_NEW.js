// Setting descriptions for tooltips and help text
const settingDescriptions = {
    // Add setting descriptions here as needed
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
 * Generated from CSV data
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
                "allowOn": [EntityType.DEVICEUSER, EntityType.INTEGRATOR, EntityType.PARENT],
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
                "allowOn": [EntityType.DEVICEUSER],
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
                "allowOn": [EntityType.DEVICEUSER],
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
                "allowOn": [EntityType.DEVICEUSER, EntityType.INTEGRATOR, EntityType.WEBSERVICE],
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
                "allowOn": [EntityType.DEVICEUSER, EntityType.INTEGRATOR, EntityType.PARENT],
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
                "allowOn": [EntityType.DEVICEUSER, EntityType.PARENT],
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
                "allowOn": [EntityType.DEVICEUSER, EntityType.INTEGRATOR, EntityType.PARENT],
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
                    }
                ]
            }
        ],
        "settings": [
            {
                "name": "app.mandate.creation.enabled",
                "allowOn": [EntityType.DEVICEUSER, EntityType.PARENT],
                "table": SettingsTable.ENTITY_SERVICE_TYPE_SETTING,
                "type": InputType.CHECKBOX
            },
            {
                "name": "app.transaction.history.enabled",
                "allowOn": [EntityType.DEVICEUSER],
                "table": SettingsTable.ENTITY_SERVICE_TYPE_SETTING,
                "type": InputType.CHECKBOX
            },
            {
                "name": "external.status.webhook.url",
                "allowOn": [EntityType.DEVICEUSER, EntityType.INTEGRATOR, EntityType.PARENT],
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
                "name": "ocs.ed.mandate.default.details",
                "allowOn": [EntityType.DEVICEUSER, EntityType.INTEGRATOR, EntityType.PARENT],
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
                "allowOn": [EntityType.DEVICEUSER, EntityType.INTEGRATOR, EntityType.PARENT],
                "table": SettingsTable.ENTITY_SERVICE_TYPE_SETTING,
                "type": InputType.CHECKBOX
            },
            {
                "name": "ocs.ed.ws.pwd",
                "allowOn": [EntityType.DEVICEUSER, EntityType.INTEGRATOR, EntityType.PARENT],
                "table": SettingsTable.ENTITY_SERVICE_TYPE_SETTING,
                "type": InputType.CHECKBOX
            },
            {
                "name": "ocs.ed.ws.usr",
                "allowOn": [EntityType.DEVICEUSER, EntityType.INTEGRATOR, EntityType.PARENT],
                "table": SettingsTable.ENTITY_SERVICE_TYPE_SETTING,
                "type": InputType.CHECKBOX
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
                        "allowOn": [EntityType.DEVICEUSER, EntityType.INTEGRATOR, EntityType.PARENT],
                        "table": SettingsTable.ENTITY_SERVICE_SETTING,
                        "type": InputType.TEXT
                    }
                ]
            }
        ],
        "settings": [
            {
                "name": "pui.track.request",
                "allowOn": [EntityType.DEVICEUSER],
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
                "allowOn": [EntityType.DEVICEUSER],
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
                        "allowOn": [EntityType.DEVICEUSER, EntityType.INTEGRATOR, EntityType.PARENT],
                        "table": SettingsTable.ENTITY_SERVICE_SETTING,
                        "type": InputType.TEXT
                    },
                    {
                        "name": "webservice.username",
                        "allowOn": [EntityType.DEVICEUSER, EntityType.INTEGRATOR, EntityType.PARENT],
                        "table": SettingsTable.ENTITY_SERVICE_SETTING,
                        "type": InputType.TEXT
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
                        "allowOn": [EntityType.DEVICEUSER, EntityType.PARENT],
                        "table": SettingsTable.ENTITY_SERVICE_SETTING,
                        "type": InputType.TEXT
                    },
                    {
                        "name": "itensityonline.auth.client.secret",
                        "allowOn": [EntityType.DEVICEUSER, EntityType.PARENT],
                        "table": SettingsTable.ENTITY_SERVICE_SETTING,
                        "type": InputType.TEXT
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
                    }
                ]
            }
        ],
        "settings": [
            {
                "name": "app.mandate.authentication.enabled",
                "allowOn": [EntityType.DEVICEUSER, EntityType.PARENT],
                "table": SettingsTable.ENTITY_SERVICE_TYPE_SETTING,
                "type": InputType.CHECKBOX
            },
            {
                "name": "app.mandate.creation.enabled",
                "allowOn": [EntityType.DEVICEUSER],
                "table": SettingsTable.ENTITY_SERVICE_TYPE_SETTING,
                "type": InputType.CHECKBOX
            },
            {
                "name": "app.mandate.creation.fields",
                "allowOn": [EntityType.DEVICEUSER],
                "table": SettingsTable.ENTITY_SERVICE_TYPE_SETTING,
                "type": InputType.CHECKBOX
            },
            {
                "name": "app.manual.payments.enabled",
                "allowOn": [EntityType.DEVICEUSER, EntityType.PARENT],
                "table": SettingsTable.ENTITY_SERVICE_TYPE_SETTING,
                "type": InputType.CHECKBOX
            },
            {
                "name": "app.payments.enabled",
                "allowOn": [EntityType.DEVICEUSER, EntityType.PARENT],
                "table": SettingsTable.ENTITY_SERVICE_TYPE_SETTING,
                "type": InputType.CHECKBOX
            },
            {
                "name": "app.transaction.history.enabled",
                "allowOn": [EntityType.DEVICEUSER, EntityType.PARENT],
                "table": SettingsTable.ENTITY_SERVICE_TYPE_SETTING,
                "type": InputType.CHECKBOX
            },
            {
                "name": "manual.payments.reference.config",
                "allowOn": [EntityType.DEVICEUSER],
                "table": SettingsTable.ENTITY_SERVICE_TYPE_SETTING,
                "type": InputType.CHECKBOX
            },
            {
                "name": "ocs.ed.mandate.default.details",
                "allowOn": [EntityType.INTEGRATOR],
                "table": SettingsTable.ENTITY_SERVICE_TYPE_SETTING,
                "type": InputType.CHECKBOX
            },
            {
                "name": "tca.application.key",
                "allowOn": [EntityType.DEVICEUSER, EntityType.PARENT],
                "table": SettingsTable.ENTITY_SERVICE_TYPE_SETTING,
                "type": InputType.CHECKBOX
            },
            {
                "name": "tca.merchant.id",
                "allowOn": [EntityType.DEVICEUSER, EntityType.PARENT],
                "table": SettingsTable.ENTITY_SERVICE_TYPE_SETTING,
                "type": InputType.CHECKBOX
            },
            {
                "name": "tca.merchant.username",
                "allowOn": [EntityType.DEVICEUSER, EntityType.PARENT],
                "table": SettingsTable.ENTITY_SERVICE_TYPE_SETTING,
                "type": InputType.CHECKBOX
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
