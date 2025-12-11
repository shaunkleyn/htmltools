import { ConfigurableEntity } from './configurable-entity.js';
import { Service } from './service.js';
import { Setting } from './setting.js';
import { RateLimitPeriod } from './enums.js';

export class Scope extends ConfigurableEntity {
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

    // ... (all Scope class methods from previous implementation)
    // Fluent API methods, service management, settings management, etc.
}