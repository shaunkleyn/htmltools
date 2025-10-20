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
    'AML': {
        name: 'Anti-Money Laundering',
        services: [
            {
                name: 'aml.service.aml',
                description: 'Anti-Money Laundering Service',
                settings: []
            }
        ],
        settings: []
    },
    'AVS': {
        name: 'Account Verification',
        services: [
            {
                name: 'avs.services.avs',
                description: 'Account Verification',
                allowOn: ['parent', 'integrator'],
                excludeFrom: ['deviceuser'],
                settings: [
                    'entity.avs.webhook.url'
                ]
            }
        ],
        excludeFrom: ['deviceuser'],
        settings: []
    },
    'BIVS': {
        name: 'Batch IVS',
        services: [
            {
                name: 'bivs.services.bivs',
                description: 'Batch IVS',
                settings: []
            }
        ],
        settings: []
    },
    'BMS': {
        name: 'Bitventure Messaging Service',
        services: [
            {
                name: 'bms.services.bms',
                description: 'Bitventure Messaging Service',
                allowOn: ['parent', 'integrator'],
                settings: [],
            },
            {
                name: 'bms.services.ems',
                description: 'Emailing Service',
                allowOn: ['parent', 'integrator'],
                settings: [
                    'message.header',
                    'message.footer',
                    'bms.entity.webhook.url'
                ]
            }
        ],
        settings: [
            {
                name: 'bms.entity.webhook.url',
                placeholder: 'SMS status webhook',
                description: 'Webhook URL for SMS status updates',
                helpText: 'Enter the webhook URL for SMS status updates',
            },
            {
                name: 'message.header',
                placeholder: 'SMS message header',
                description: 'The SMS message header text.',
                group: 'SMS Settings'
            },
            {
                name: 'message.footer',
                placeholder: 'SMS message footer',
                description: 'The SMS message footer text.',
                group: 'SMS Settings'
            }
        ],
    },
    'BPS': {
        name: 'Realtime Payments',
        services: [
            {
                name: 'bps.services.rtc',
                description: 'Realtime Payments',
                settings: []
            }
        ],
        settings: []
    },
    'BSS': {
        name: 'Bank Statements Service',
        services: [
            {
                name: 'bss.services.bss',
                description: 'Bank Statements Service',
                settings: [
                    'bss.sms.header',
                    'bss.sms.footer',
                    'bss.redirect.url',
                    'bss.webhook.url',
                    'bss.logo',
                    'entity.bss.redirect.url',
                    'entity.bss.webhook.url'
                ]
            }
        ],
        settings: []
    },
    'BVS': {
        name: 'Biometric Verification',
        services: [
            {
                name: 'bvs.services.bvs',
                description: 'Biometric Verification',
                settings: []
            }
        ],
        settings: []
    },
    'CDS': {
        name: 'Card Disbursement',
        services: [
            {
                name: 'cds.services.cds',
                description: 'Card Disbursement',
                settings: []
            }
        ],
        settings: []
    },
    'CDVS': {
        name: 'Check-Digit Validation Service',
        services: [
            {
                name: 'cdvs.services.cdvs',
                description: 'Check-Digit Validation Service',
                settings: []
            }
        ],
        settings: []
    },
    'CMS': {
        name: 'Client Management Service',
        services: [
            {
                name: 'cms.services.entity',
                description: 'Entity Management',
                settings: []
            }
        ],
        settings: []
    },
    'COVS': {
        name: 'Company Verification',
        services: [
            {
                name: 'covs.services.covs',
                description: 'Company Verification',
                settings: []
            }
        ],
        settings: []
    },
    'CRS': {
        name: 'Credit Score Service',
        services: [
            {
                name: 'crs.services.crs',
                description: 'Credit Score Service',
                settings: [
                    'crs.crs.webhook.url',
                    'crs.crs.logo',
                    'crs.crs.redirect.url'
                ]
            },
            {
                name: 'crs.services.report',
                description: 'Credit Report Service',
                settings: [
                    { 
                        name: 'crs.cpb.enquiry.done.by',
                        description: 'This name will appear on CPB enquiries made through the Credit Report Service',
                        placeholder: 'CRS CPB Enquiry Done By',
                        helpText: 'Name to show for CPB enquiries in CRS'
                    }
                ]
            },
            {
                name: 'crs.service.afa',
                description: 'Affordability Assessment Service',
                settings: []
            }
        ],
        settings: []
    },
    'CVS': {
        name: 'Contact Verification Service',
        services: [
            {
                name: 'cvs.services.cvs',
                description: 'Contact Verification Service',
                settings: []
            }
        ],
        settings: []
    },
    'EPOS': {
        name: 'Transaction Card Authorisation',
        services: [
            {
                name: 'tca.services.payments',
                description: 'Payments',
                settings: [
                    {
                        name: 'manual.payments.enabled',
                        type: 'checkbox',
                        label: 'Manual Payments',
                        description: 'Allow manual payment processing in the system',
                        defaultValue: false,
                        group: "Manual Payments",
                    },
                    {
                        name: 'manual.payments.reference.config',
                        type: 'checkbox',
                        label: 'Reference Settings',
                        description: 'Allow manual payment processing in the system',
                        defaultValue: false,
                        dependsOn: 'manual.payments.enabled',
                        group: "Manual Payments",
                        settings: [
                            {
                                name: 'internal.reference',
                                type: 'radio',
                                label: 'Internal Reference',
                                description: 'How internal references should be handled',
                                options: [
                                    { value: 'disabled', label: 'Disabled - No internal reference' },
                                    { value: 'enabled', label: 'Enabled - Optional internal reference' },
                                    { value: 'required', label: 'Required - Internal reference mandatory' }
                                ],
                                defaultValue: 'disabled'
                            },
                            {
                                name: 'customer.reference',
                                type: 'radio',
                                label: 'Customer Reference',
                                description: 'How customer references should be handled',
                                options: [
                                    { value: 'disabled', label: 'Disabled - No customer reference' },
                                    { value: 'enabled', label: 'Enabled - Optional customer reference' },
                                    { value: 'required', label: 'Required - Customer reference mandatory' }
                                ],
                                defaultValue: 'disabled'
                            }
                        ]
                    },
                    {



                        group: 'Payments',
                        name: 'reference.settings',
                        type: 'radio-group',
                        label: 'Reference Settings',
                        dependsOn: 'manual.payments.enabled',
                        description: 'Configure how references are handled for manual payments',
                        settings: [
                            {
                                name: 'internal.reference',
                                type: 'radio',
                                label: 'Internal Reference',
                                description: 'How internal references should be handled',
                                options: [
                                    { value: 'disabled', label: 'Disabled - No internal reference' },
                                    { value: 'enabled', label: 'Enabled - Optional internal reference' },
                                    { value: 'required', label: 'Required - Internal reference mandatory' }
                                ],
                                defaultValue: 'disabled'
                            },
                            {
                                name: 'customer.reference',
                                type: 'radio',
                                label: 'Customer Reference',
                                description: 'How customer references should be handled',
                                options: [
                                    { value: 'disabled', label: 'Disabled - No customer reference' },
                                    { value: 'enabled', label: 'Enabled - Optional customer reference' },
                                    { value: 'required', label: 'Required - Customer reference mandatory' }
                                ],
                                defaultValue: 'disabled'
                            }
                        ]


                    }
                ]
            }
        ]
    },
    'FMS': {
        name: 'Fingerprint Matching',
        services: [
            {
                name: 'fms.services.match',
                description: 'Fingerprint Matching',
                settings: []
            },
            {
                name: 'fms.services.match.extended',
                description: 'Fingerprint Matching With Extended Metadata',
                settings: []
            }
        ],
        settings: []
    },
    'FVS': {
        name: 'Facial Verification',
        services: [
            {
                name: 'fvs.services.fvs',
                description: 'Facial Verification',
                settings: []
            },
            {
                name: 'fvs.services.liveness',
                description: 'Liveness Verification',
                settings: [
                    'fvs.liveness.sms.header',
                    'fvs.liveness.sms.footer',
                    'fvs.liveness.redirect.url',
                    'fvs.liveness.webhook.url',
                    'fvs.liveness.logo',
                    'entity.liveness.redirect.url',
                    'entity.liveness.webhook.url'
                ]
            },
            {
                name: 'fvs.services.liveness.noivs',
                description: 'No IVS Liveness Verification',
                settings: []
            }
        ],
        settings: [
            'fvs.expiry.time'
        ]
    },
    'IVS': {
        name: 'Identity Verification',
        services: [
            {
                name: 'ivs.services.ivs',
                description: 'Identity Verification',
                settings: []
            },
            {
                name: 'ivs.services.photo',
                description: 'IVS Photo',
                settings: []
            },
            {
                name: 'ivs.services.data',
                description: 'IVS Data',
                settings: []
            },
            {
                name: 'ivs.services.ivsf',
                description: 'Identity Verification Foreigner',
                settings: []
            },
            {
                name: 'ivs.services.lineage',
                description: 'IVS Lineage',
                settings: []
            },
            {
                name: 'ivs.services.deceased',
                description: 'IVS Deceased',
                settings: []
            },
            {
                name: 'ivs.services.bvs',
                description: 'IVS Biometric Verification',
                settings: []
            }
        ],
        settings: []
    },
    'LMS': {
        name: 'Loan Management',
        services: [
            {
                name: 'lms.services.lms',
                description: 'Loan Management',
                settings: [
                    'lms.ed.ws.usr',
                    'lms.ed.ws.pwd'
                ]
            }
        ],
        settings: []
    },
    'OCS': {
        name: 'Online Collection Service',
        services: [
            {
                name: 'ocs.services.mandate',
                description: 'Mandate Creation',
                sharedSettings: true,
                settings: [
                    {
                        name: 'ocs.webhook.url.mandate',
                        placeholder: 'Mandate webhook URL',
                        description: 'Webhook URL for mandate notifications',
                        helpText: 'Enter the webhook URL for mandate notifications',
                        applyTo: 'integrator',
                        table: 'entity_service_setting'
                    },
                    { 
                        group: 'Default Mandate Details',
                        name: 'ocs.ed.mandate.default.details',
                        field: 'tracking',
                        label: 'Tracking',
                        placeholder: 'Enable tracking',
                        description: 'Enable tracking',
                        type: 'checkbox',
                        defaultValue: true,
                    },
                    { 
                        group: 'Default Mandate Details',
                        name: 'ocs.ed.mandate.default.details',
                        field: 'frequency',
                        label: 'Frequency',
                        placeholder: 'Enter Frequency',
                        description: 'Enter default frequency for mandates',
                        type: 'textbox',
                        defaultValue: 'MONTHLY',
                    },
                    { 
                        group: 'Default Mandate Details',
                        name: 'ocs.ed.mandate.default.details',
                        field: 'mandateType',
                        label: 'Mandate Type',
                        placeholder: 'Enter Mandate Type',
                        description: 'Enter default mandate type for mandates',
                        type: 'textbox',
                        defaultValue: 'Usage',
                    },
                    { 
                        group: 'Default Mandate Details',
                        name: 'ocs.ed.mandate.default.details',
                        field: 'adjustmentType',
                        label: 'Adjustment Type',
                        placeholder: 'Enter Adjustment Type',
                        description: 'Enter default adjustment type for mandates',
                        type: 'textbox',
                        defaultValue: 'RATE',
                    },
                    { 
                        group: 'Default Mandate Details',
                        name: 'ocs.ed.mandate.default.details',
                        field: 'adjustmentValue',
                        label: 'Adjustment Value',
                        placeholder: 'Enter Adjustment Value',
                        description: 'Enter default adjustment value for mandates',
                        type: 'textbox',
                        defaultValue: '1',
                    },
                    { 
                        group: 'Default Mandate Details',
                        name: 'ocs.ed.mandate.default.details',
                        field: 'adjustmentFrequency',
                        label: 'Adjustment Frequency',
                        placeholder: 'Enter Adjustment Frequency',
                        description: 'Enter default adjustment frequency for mandates',
                        type: 'textbox',
                        defaultValue: 'ANNUALLY',
                    },
                    { 
                        group: 'Default Mandate Details',
                        name: 'ocs.ed.mandate.default.details',
                        field: 'generateContractReference',
                        label: 'Generate Contract Reference',
                        placeholder: 'Enter Generate Contract Reference',
                        description: 'Enter default generate contract reference for mandates',
                        type: 'checkbox',
                        defaultValue: 'true',
                    },
                    { 
                        group: 'Default Mandate Details',
                        name: 'ocs.ed.mandate.default.details',
                        field: 'referenceFormat',
                        label: 'Contract Reference Format',
                        placeholder: 'XXXXXXX_******',
                        description: 'Enter default contract reference format for mandates',
                        type: 'textbox',
                        maxLength: 14,
                        defaultValue: '',
                    },
                    { 
                        group: 'Default Mandate Details',
                        name: 'ocs.ed.mandate.default.details',
                        field: 'debitClassification',
                        label: 'Debit Classification',
                        placeholder: 'Enter Debit Classification',
                        description: 'Enter default debit classification for mandates',
                        type: 'textbox',
                        defaultValue: 'LRM',
                    },
                    { 
                        group: 'Default Mandate Details',
                        name: 'ocs.ed.mandate.default.details',
                        field: 'generateInstallment',
                        label: 'Generate Installment',
                        placeholder: 'Generate Installment',
                        description: 'generate installment for mandates',
                        type: 'checkbox',
                        defaultValue: true,
                    },
                    { 
                        group: 'Default Mandate Details',
                        name: 'ocs.ed.mandate.default.details',
                        field: 'calculateInstallment',
                        label: 'Calculate Installment',
                        placeholder: 'Calculate Installment',
                        description: 'calculate installment for mandates',
                        type: 'checkbox',
                        defaultValue: false,
                    },
                    { 
                        group: 'Default Mandate Details',
                        name: 'ocs.ed.mandate.default.details',
                        field: 'dateAdjustmentAllowed',
                        label: 'Date Adjustment Allowed',
                        placeholder: 'Date Adjustment Allowed',
                        description: 'Allow date adjustment for mandates',
                        type: 'checkbox',
                        defaultValue: true,
                    },
                    { 
                        group: 'Default Mandate Details',
                        name: 'ocs.ed.mandate.default.details',
                        field: 'maximumInstallmentAmount',
                        label: 'Maximum Installment Amount',
                        placeholder: 'Enter Maximum Installment Amount',
                        description: 'Enter default maximum installment amount for mandates',
                        type: 'textbox',
                        defaultValue: '1000',
                    },
                    { 
                        group: 'Default Mandate Details',
                        name: 'ocs.ed.mandate.default.details',
                        field: 'scheme',
                        label: 'Scheme',
                        placeholder: 'Enter Scheme',
                        description: 'Enter default scheme for mandates',
                        helpText: 'This is used to retrieve mandates with the same scheme from TCA',
                        type: 'textbox',
                        defaultValue: '',
                    },
                ]
            },
            {
                name: 'ocs.services.collection',
                description: 'Collection',
                sharedSettings: true,
                settings: [
                    {
                        name: 'ocs.webhook.url.collection',
                        placeholder: 'Collection webhook URL',
                        description: 'Webhook URL for collection notifications',
                        helpText: 'Enter the webhook URL for collection notifications',
                        applyTo: 'integrator',
                        table: 'entity_service_setting'
                    }
                ]
            },
            {
                name: 'ocs.services.debitorder',
                description: 'Debit Order',
                sharedSettings: true,
                settings: [
                    { 
                        name: 'ocs.ed.do.sc.gc.map', 
                        placeholder: 'EasyDebit DO SC GC Map', 
                        description: 'EasyDebit DO SC GC Map',
                        applyTo: 'integrator'
                        },
                    { 
                        name: 'ocs.ed.do.ul.gc.map', 
                        placeholder: 'EasyDebit DO UL GC Map', 
                        description: 'EasyDebit DO UL GC Map',
                        applyTo: 'integrator'
                    },
                    { 
                        name: 'ocs.ed.do.gc', 
                        placeholder: 'EasyDebit DO GC', 
                        description: 'EasyDebit DO GC',
                        applyTo: 'integrator'
                    },
                ]
            }
        ],
        settings: [
            {
                group: 'EasyDebit2',
                settings: [
                    {
                        group: 'EasyDebit3', 
                        name: 'ocs.ed.ws.usr', // OCS "Parent" Settings
                        placeholder: 'EasyDebit Webservice User', 
                        helpText: 'EasyDebit Webservice User for web service authentication'
                    },
                    {
                        group: 'EasyDebit3', 
                        name: 'ocs.ed.ws.pwd', // OCS "Parent" Settings
                        placeholder: 'EasyDebit Webservice Password', 
                        description: 'EasyDebit Webservice Password for web service authentication'
                    },
                ]
            },
            {
                group: 'EasyDebit.group1', 
                name: 'ocs.ed.ws.usr', // OCS "Parent" Settings
                placeholder: 'EasyDebit Webservice User', 
                helpText: 'EasyDebit Webservice User for web service authentication'
            },
            {
                group: 'EasyDebit', 
                name: 'ocs.ed.ws.pwd', // OCS "Parent" Settings
                placeholder: 'EasyDebit Webservice Password', 
                description: 'EasyDebit Webservice Password for web service authentication'
            },
            {
                group: 'EasyDebit', 
                name: 'ocs.ed.ws.gc', // OCS "Parent" Settings
                placeholder: 'EasyDebit Webservice Group Code', 
                description: 'EasyDebit Webservice Group Code'
            },
            {
                group: 'EasyDebit', // OCS "Parent" Settings
                name: 'ocs.df.scheme', 
                placeholder: 'Default Scheme', 
                description: 'This is what the scheme name is which maps back to the Easy Debit Group code. We set to settings to act as a default value to be used for children inheriting from a parent' 
            },
            {
                group: 'EasyDebit',
                name: 'ocs.ed.sc.gc.map',  // OCS "Parent" Settings
                placeholder: 'EasyDebit SC GC Map',
                description: 'Mapping between scheme names and group codes',
                helpText: 'Define the mapping between scheme names and EasyDebit group codes in JSON format.'
            },
            { 
                group: 'EasyDebit', 
                name: 'ocs.ed.ul.gc.map',  // OCS "Parent" Settings
                placeholder: 'EasyDebit UL GC Map', 
                description: 'EasyDebit UL GC Map' },
            {
                group: 'EasyDebit',
                name: 'ocs.ed.passthrough',  // OCS "Parent" Settings
                type: 'checkbox',
                placeholder: 'EasyDebit Passthrough',
                description: 'EasyDebit Passthrough',
                defaultValue: true
            },

            {
                name: 'ocs.easy.loan.webhook.url', // OCS Integrator Specific Setting
                placeholder: 'Easy Loan Webhook URL',
                description: 'Webhook URL for Easy Loan integration',
                helpText: 'This setting is only applicable if you are using the Easy Loan integration.',
                applyTo: 'integrator'
            },
            {
                group: 'EasyPOS',
                name: 'external.status.webhook.url', // OCS Device User Specific Setting
                description: 'External Status Webhook URL',
                placeholder: 'External Status Webhook URL',
                helpText: 'Webhook URL for receipt printing on the EasyPOS. This setting is only applicable if you are using EasyPOS.',
                applyTo: 'user'
            },

                
            'ocs.ned.cre.bra.cde',
            'ocs.ned.cre.acc.num',
            'ocs.ned.cre.ema.det',
            'ocs.ned.cre.tel.det',
            'ocs.ned.cre.abr.sho.nme',
            'ocs.ned.cli.pro',
            'ocs.ned.chg.acc',
            'ocs.ned.cre.nme',
            'ocs.ned.pro.acc'
        ]
    },
    'OPS': {
        name: 'Payment Operations',
        services: [
            {
                name: 'ops.services.ieft',
                description: 'Initiate Instant EFT',
                settings: [
                    'ops.ieft.ozow.sitecode',
                    'iveri.auth.app.id',
                    'iveri.auth.certificate.id'
                ]
            },
            {
                name: 'ops.services.cps',
                description: 'Card Payment',
                settings: [
                    'ops.cps.sms.header',
                    'ops.cps.sms.footer',
                    'ops.cps.redirect.url'
                ]
            },
            {
                name: 'ops.services.tokenization',
                description: 'Tokenization Service',
                settings: []
            }
        ],
        settings: []
    },
    'PUI': {
        name: 'Phoenix Entity Details Service',
        services: [
            {
                name: 'pui.services.entity',
                description: 'Phoenix Entity Details Service',
                settings: [
                    'pui.logo'
                ]
            }
        ],
        settings: []
    },
    'PVS': {
        name: 'Person Verification',
        services: [
            {
                name: 'pvs.services.pvs',
                description: 'Person Verification',
                settings: []
            }
        ],
        settings: []
    },
    'SDS': {
        name: 'Strike Date Optimization',
        services: [
            {
                name: 'sds.services.sds',
                description: 'Strike Date Optimization',
                settings: []
            }
        ],
        settings: []
    },
    'SSV': {
        name: 'SIM Swap Verification',
        services: [
            {
                name: 'ssv.services.ssv',
                description: 'SIM Swap Verification',
                settings: []
            }
        ],
        settings: []
    },
    'TCA': {
        name: 'Transaction Card Authorisation',
        services: [
            {
                name: 'tca.services.mca',
                description: 'Search, Retrieve and Authenticate Mandate',
                settings: [
                    {
                        group: "Transaction Card Authorisation Settings",
                        name: 'tca.application.key',
                        placeholder: 'TCA Application Key',
                        description: 'Application key for Transaction Card Authorization',
                        allowOn: ['deviceuser'],
                    },
                    {
                        group: "Transaction Card Authorisation Settings",
                        name: 'tca.merchant.id',
                        placeholder: 'TCA Merchant ID',
                        description: 'Merchant ID for Transaction Card Authorization',
                        allowOn: ['deviceuser'],
                    },
                    {
                        group: "Transaction Card Authorisation Settings",
                        name: 'tca.merchant.username',
                        placeholder: 'TCA Merchant Username',
                        description: 'Merchant Username for Transaction Card Authorization',
                        allowOn: ['deviceuser'],
                    }
                ]
            },
            {
                name: 'tca.services.pca',
                description: 'Authorize Payment',
                settings: []
            },
            {
                name: 'tca.services.rcp',
                description: 'Recurring Card Payment',
                settings: []
            }
        ],
        settings: []
    },
    'VMS': {
        name: 'VerifyMe Service',
        services: [
            {
                name: 'verifyme.services.verifyme',
                description: 'VerifyMe',
                settings: []
            }
        ],
        settings: []
    }
};
