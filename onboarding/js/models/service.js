// Service Class
class Service extends ConfigurableEntity {
    constructor(name, description = '') {
        super();
        this.name = name;
        this.description = description;
        this.displayName = description;
        this.settings = new Map();
        this.sharedSettings = false;
        this.rateLimit = {
            enabled: false,
            count: null,
            period: RateLimitPeriod.NONE
        };
    }

    // Fluent API methods
    withDisplayName(displayName) {
        this.displayName = displayName;
        return this;
    }

    withDescription(description) {
        this.description = description;
        return this;
    }

    markAsSharedSettings() {
        this.sharedSettings = true;
        return this;
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

    hasSetting(identifier) {
        return this.settings.has(identifier);
    }

    removeSetting(identifier) {
        return this.settings.delete(identifier);
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
    addSettings(settings) {
        settings.forEach(setting => this.addSetting(setting));
        return this;
    }

    getAllSettings() {
        return Array.from(this.settings.values());
    }

    getSettingsByGroup() {
        const grouped = {};
        this.getAllSettings().forEach(setting => {
            const group = setting.group || 'General';
            if (!grouped[group]) {
                grouped[group] = [];
            }
            grouped[group].push(setting);
        });
        return grouped;
    }

    // Export/Import
    toJSON() {
        const settingsObj = {};
        this.settings.forEach((setting, identifier) => {
            settingsObj[identifier] = setting.toJSON();
        });

        return {
            name: this.name,
            description: this.description,
            displayName: this.displayName,
            sharedSettings: this.sharedSettings,
            rateLimit: this.rateLimit,
            settings: settingsObj,
            allowedEntities: this.getAllowedEntities(),
            tables: this.getTables(),
            active: this.isActive()
        };
    }

    static fromJSON(json) {
        const service = new Service(json.name, json.description)
            .withDisplayName(json.displayName || json.description)
            .setActive(json.active !== false);
        
        if (json.sharedSettings) service.markAsSharedSettings();
        if (json.rateLimit) service.rateLimit = json.rateLimit;
        if (json.allowedEntities) service.allowOn(json.allowedEntities);
        if (json.tables) service.useTables(json.tables);
        
        // Import settings
        if (json.settings) {
            Object.keys(json.settings).forEach(settingIdentifier => {
                const settingData = json.settings[settingIdentifier];
                const setting = Setting.fromJSON(settingData);
                service.addSetting(setting);
            });
        }
        
        return service;
    }
}