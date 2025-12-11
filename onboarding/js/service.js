import { ConfigurableEntity } from './configurable-entity.js';
import { Setting } from './setting.js';
import { RateLimitPeriod } from './enums.js';

export class Service extends ConfigurableEntity {
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

    // ... (all Service class methods from previous implementation)
    // Fluent API methods, settings management, rate limiting, etc.
}