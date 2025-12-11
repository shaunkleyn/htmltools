function createSampleConfiguration() {
    // Create CRS Scope
    const crs = new Scope('CRS', 'Credit Rating Service')
        .withDescription('Provides credit rating and assessment services')
        .allowOn([EntityType.PARENT, EntityType.INTEGRATOR])
        .useTables([TableType.ENTITY_SERVICE, TableType.ENTITY_SERVICE_TYPE])
        .withRateLimit(1000, RateLimitPeriod.DAILY);

    // Create Affordability Assessment Service
    const afaService = new Service('crs.service.afa', 'Affordability Assessment Service')
        .withDisplayName('Can perform affordability assessment check')
        .allowOn([EntityType.PARENT, EntityType.INTEGRATOR])
        .useTables([TableType.ENTITY_SERVICE, TableType.ENTITY_SERVICE_TYPE])
        .withRateLimit(500, RateLimitPeriod.HOURLY)
        .addSettings([
            new Setting('crs.afa.income.threshold', 'Minimum income threshold')
                .markAsRequired()
                .withGroup('Income Settings'),
            new Setting('crs.afa.debt.ratio', 'Maximum debt-to-income ratio')
                .withGroup('Income Settings'),
            new Setting('crs.afa.webhook.url', 'Webhook URL for assessment results')
                .withGroup('Webhook Settings')
        ]);

    // Add service to scope
    crs.addService(afaService);

    // Add scope-level settings
    crs.addScopeSettings([
        new Setting('crs.default.provider', 'Default credit provider')
            .allowOn(EntityType.PARENT),
        new Setting('crs.api.timeout', 'API timeout in seconds')
            .withValue('30')
    ]);

    return crs;
}