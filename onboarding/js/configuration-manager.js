import { Scope } from './scope.js';

export class ConfigurationManager {
    constructor() {
        this.scopes = new Map();
        this.entityConfig = {
            parentName: '',
            website: '',
            integratorEmail: '',
            crsEnquiryBy: '',
            createDeviceUser: false,
            deviceUsername: '',
            devicePassword: '',
            createIntegrator: true,
            integratorName: ''
        };
    }

    // ... (all ConfigurationManager methods from previous implementation)
}