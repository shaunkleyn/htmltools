import { EntityType, TableType } from './enums.js';

// Base class with common functionality
export class ConfigurableEntity {
    constructor() {
        this._allowedEntities = new Set();
        this._tables = new Set();
        this._active = true;
    }

    // Fluent API for entity permissions
    allowOn(entityTypes) {
        if (Array.isArray(entityTypes)) {
            entityTypes.forEach(type => this._allowedEntities.add(type));
        } else {
            this._allowedEntities.add(entityTypes);
        }
        return this;
    }

    allowOnParent() {
        return this.allowOn(EntityType.PARENT);
    }

    allowOnIntegrator() {
        return this.allowOn(EntityType.INTEGRATOR);
    }

    allowOnDeviceUser() {
        return this.allowOn(EntityType.DEVICE_USER);
    }

    allowOnAll() {
        return this.allowOn(EntityType.ALL);
    }

    // Table configuration
    useTables(tableTypes) {
        if (Array.isArray(tableTypes)) {
            tableTypes.forEach(table => this._tables.add(table));
        } else {
            this._tables.add(tableTypes);
        }
        return this;
    }

    // Active state management
    setActive(active) {
        this._active = active;
        return this;
    }

    enable() {
        return this.setActive(true);
    }

    disable() {
        return this.setActive(false);
    }

    // Validation methods
    isAllowedOn(entityType) {
        return this._allowedEntities.has(entityType) || this._allowedEntities.has(EntityType.ALL);
    }

    usesTable(tableType) {
        return this._tables.has(tableType);
    }

    // Getters
    getAllowedEntities() {
        return Array.from(this._allowedEntities);
    }

    getTables() {
        return Array.from(this._tables);
    }

    isActive() {
        return this._active;
    }
}