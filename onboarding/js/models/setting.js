// Setting Class
class Setting extends ConfigurableEntity {
    constructor(identifier, description = '') {
        super();
        this.identifier = identifier;
        this.description = description;
        this.value = '';
        this.group = null;
        this.required = false;
        this.validation = null;
    }

    // Fluent API methods
    withDescription(description) {
        this.description = description;
        return this;
    }

    withValue(value) {
        this.value = value;
        return this;
    }

    withGroup(group) {
        this.group = group;
        return this;
    }

    markAsRequired() {
        this.required = true;
        return this;
    }

    withValidation(validationFn) {
        this.validation = validationFn;
        return this;
    }

    // Validation
    isValid() {
        if (this.required && !this.value) {
            return false;
        }
        if (this.validation && typeof this.validation === 'function') {
            return this.validation(this.value);
        }
        return true;
    }

    // Export/Import
    toJSON() {
        return {
            identifier: this.identifier,
            description: this.description,
            value: this.value,
            group: this.group,
            required: this.required,
            allowedEntities: this.getAllowedEntities(),
            tables: this.getTables(),
            active: this.isActive()
        };
    }

    static fromJSON(json) {
        const setting = new Setting(json.identifier, json.description)
            .withValue(json.value)
            .withGroup(json.group)
            .setActive(json.active !== false);
        
        if (json.required) setting.markAsRequired();
        if (json.allowedEntities) setting.allowOn(json.allowedEntities);
        if (json.tables) setting.useTables(json.tables);
        
        return setting;
    }
}
