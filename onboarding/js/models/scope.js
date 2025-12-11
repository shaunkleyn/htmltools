// Scope Class
class Scope extends ConfigurableEntity {
    constructor(identifier, name) {
        super();
        this.identifier = identifier;
        this.name = name;
        this.description = '';
        this.services = new Map();
        this.settings = new Map();
        this.rateLimit = {
            enabled: true,
            count: null,
            period: RateLimitPeriod.NONE
        };
    }

    // Fluent API methods
    withDescription(description) {
        this.description = description;
        return this;
    }

    // Service management
    addService(service) {
        if (!(service instanceof Service)) {
            service = new Service(service.name, service.description);
        }
        this.services.set(service.name, service);
        return this;
    }

    getService(serviceName) {
        return this.services.get(serviceName);
    }

    hasService(serviceName) {
        return this.services.has(serviceName);
    }

    removeService(serviceName) {
        return this.services.delete(serviceName);
    }

    // Settings management
    addSetting(setting) {
        if (!(setting instanceof Setting)) {
            setting = new Setting(setting.identifier, setting.description);
        }
        this.settings.set(setting.identifier, setting);
        return this;
    }

    getSetting(identifier) {
        return this.settings.get(identifier);
    }

    // Rate limiting
    withRateLimit(count, period = RateLimitPeriod.HOURLY) {
        this.rateLimit = {
            enabled: true,
            count: count,
            period: period
        };
        return this;
    }

    withoutRateLimit() {
        this.rateLimit = {
            enabled: false,
            count: null,
            period: RateLimitPeriod.NONE
        };
        return this;
    }

    // Bulk operations
    addServices(services) {
        services.forEach(service => this.addService(service));
        return this;
    }

    addScopeSettings(settings) {
        settings.forEach(setting => this.addSetting(setting));
        return this;
    }

    getAllServices() {
        return Array.from(this.services.values());
    }

    getAllSettings() {
        return Array.from(this.settings.values());
    }

    // Export/Import
    toJSON() {
        const servicesObj = {};
        this.services.forEach((service, name) => {
            servicesObj[name] = service.toJSON();
        });

        const settingsObj = {};
        this.settings.forEach((setting, identifier) => {
            settingsObj[identifier] = setting.toJSON();
        });

        return {
            identifier: this.identifier,
            name: this.name,
            description: this.description,
            rateLimit: this.rateLimit,
            services: servicesObj,
            settings: settingsObj,
            allowedEntities: this.getAllowedEntities(),
            tables: this.getTables(),
            active: this.isActive()
        };
    }

    static fromJSON(json) {
        const scope = new Scope(json.identifier, json.name)
            .withDescription(json.description || '')
            .setActive(json.active !== false);
        
        if (json.rateLimit) scope.rateLimit = json.rateLimit;
        if (json.allowedEntities) scope.allowOn(json.allowedEntities);
        if (json.tables) scope.useTables(json.tables);
        
        // Import services
        if (json.services) {
            Object.keys(json.services).forEach(serviceName => {
                const serviceData = json.services[serviceName];
                const service = Service.fromJSON(serviceData);
                scope.addService(service);
            });
        }
        
        // Import scope settings
        if (json.settings) {
            Object.keys(json.settings).forEach(settingIdentifier => {
                const settingData = json.settings[settingIdentifier];
                const setting = Setting.fromJSON(settingData);
                scope.addSetting(setting);
            });
        }
        
        return scope;
    }
}