// Enums for better type safety and documentation
export const EntityType = Object.freeze({
    PARENT: 'parent',
    INTEGRATOR: 'integrator',
    DEVICE_USER: 'device_user',
    WEBSERVICE: 'webservice'
});

export const TableType = Object.freeze({
    ENTITY_SERVICE: 'entity_service',
    ENTITY_SERVICE_TYPE: 'entity_service_type',
    ENTITY_SERVICE_SETTING: 'entity_service_setting',
    ENTITY_SERVICE_TYPE_SETTING: 'entity_service_type_setting'
});

export const RateLimitPeriod = Object.freeze({
    HOURLY: 'hourly',
    DAILY: 'daily',
    WEEKLY: 'weekly',
    MONTHLY: 'monthly',
    NONE: null
});