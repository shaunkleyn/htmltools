import { Scope } from './scope.js';
import { Service } from './service.js';
import { Setting } from './setting.js';
import { EntityType, TableType, RateLimitPeriod } from './enums.js';

// Factory function to create all scope definitions
export function createScopeDefinitions() {
    const scopes = new Map();

    // CRS Scope
    const crs = new Scope('CRS', 'Credit Rating Service')
        .withDescription('Provides credit rating and assessment services')
        .allowOn([EntityType.PARENT, EntityType.INTEGRATOR])
        .useTables([TableType.ENTITY_SERVICE, TableType.ENTITY_SERVICE_TYPE])
        .withRateLimit(1000, RateLimitPeriod.DAILY)
        .addService(
            new Service('crs.service.afa', 'Affordability Assessment Service')
                .withDisplayName('Can perform affordability assessment check')
                .allowOn([EntityType.PARENT, EntityType.INTEGRATOR])
                .useTables([TableType.ENTITY_SERVICE, TableType.ENTITY_SERVICE_TYPE])
                .addSetting(
                    new Setting('crs.afa.income.threshold', 'Minimum income threshold')
                        .markAsRequired()
                        .withGroup('Income Settings')
                )
        );

    scopes.set('CRS', crs);

    // AVS Scope
    const avs = new Scope('AVS', 'Account Verification Service')
        .withDescription('Verifies bank account details')
        .allowOnAll()
        .useTables([TableType.ENTITY_SERVICE, TableType.ENTITY_SERVICE_TYPE])
        .addService(
            new Service('avs.service.verify', 'Account Verification')
                .withDisplayName('Can verify bank account details')
                .allowOn([EntityType.PARENT, EntityType.INTEGRATOR])
                .addSetting(
                    new Setting('avs.api.key', 'API Key for verification service')
                        .markAsRequired()
                )
        );

    scopes.set('AVS', avs);

    // Add more scopes here...
    // TCA, OCS, BSS, etc.

    return scopes;
}

// Individual scope creation functions for more granular control
export function createCRSScope() {
    return new Scope('CRS', 'Credit Rating Service')
        .withDescription('Provides credit rating and assessment services')
        .allowOn([EntityType.PARENT, EntityType.INTEGRATOR])
        .useTables([TableType.ENTITY_SERVICE, TableType.ENTITY_SERVICE_TYPE])
        .withRateLimit(1000, RateLimitPeriod.DAILY);
}

export function createTCAScope() {
    return new Scope('TCA', 'Transaction Card Authorisation')
        .withDescription('Handles card transactions and mandates')
        .allowOnAll()
        .useTables([TableType.ENTITY_SERVICE, TableType.ENTITY_SERVICE_TYPE])
        .withRateLimit(5000, RateLimitPeriod.HOURLY);
}