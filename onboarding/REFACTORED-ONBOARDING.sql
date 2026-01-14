-- ============================================================================
-- SQL Onboarding Script (Refactored)
-- Version: 2.0
-- Description: Automated onboarding script for creating entities, assigning
--              services, and configuring settings in the payment platform.
-- ============================================================================

DO $$
DECLARE
    -- ========================================================================
    -- CONFIGURATION SECTION - MODIFY THESE VALUES FOR EACH NEW COMPANY
    -- ========================================================================

    -- ┌────────────────────────────────────────────────────────────────────┐
    -- │ Company Information                                                 │
    -- └────────────────────────────────────────────────────────────────────┘
    cfg_parent_name                 TEXT := 'Katli and Son Company';
    cfg_parent_website              TEXT := NULL; -- Optional

    -- ┌────────────────────────────────────────────────────────────────────┐
    -- │ Service Scopes (TCA, CMS, OCS, etc.)                               │
    -- │ Format: [Scope, Enable Rate Limit, Count, Period]                  │
    -- └────────────────────────────────────────────────────────────────────┘
    cfg_service_scopes              TEXT[] := ARRAY[
        ['TCA', 'true',  NULL,   NULL],
        ['CMS', 'true',  NULL,   NULL],
        ['OCS', 'true',  NULL,   NULL],
        ['CRS', 'true',  NULL,   NULL],
        ['AVS', 'true',  NULL,   NULL],
        ['BPS', 'true',  NULL,   NULL],
        ['IVS', 'true',  NULL,   NULL],
        ['CDS', 'true',  NULL,   NULL]
    ];

    -- ┌────────────────────────────────────────────────────────────────────┐
    -- │ Integrator Entity Configuration                                    │
    -- └────────────────────────────────────────────────────────────────────┘
    cfg_create_integrator           BOOLEAN := TRUE;
    cfg_integrator_email            TEXT := 'development@bitventure.co.za';

    -- ┌────────────────────────────────────────────────────────────────────┐
    -- │ Device User Configuration                                          │
    -- └────────────────────────────────────────────────────────────────────┘
    cfg_create_device_user          BOOLEAN := TRUE;
    cfg_device_user_username        TEXT := 'katli';
    cfg_device_user_password        TEXT := 'katli@123';
    cfg_device_user_email           TEXT := 'development@bitventure.co.za';
    cfg_device_user_active          BOOLEAN := TRUE;

    -- ┌────────────────────────────────────────────────────────────────────┐
    -- │ Entity Settings                                                    │
    -- │ Format: [Scope, Entity Type (p/i/d), Identifier, Value]           │
    -- │   p = Parent, i = Integrator, d = Device User                      │
    -- └────────────────────────────────────────────────────────────────────┘
    cfg_entity_settings             TEXT[] := ARRAY[
        -- OCS Settings
        ['OCS',  'p',   'ocs.df.scheme',                        'KATSON'],

        -- CRS Settings (EasyLoans)
        ['CRS',  'p',   'crs.cpb.enquiry.done.by',              'Katli and Son Company'],
        ['OCS',  'i',   'ocs.easy.loan.webhook.url',            'https://easyloans.co.za/1019/api/Payments/status/update'],

        -- EasyDebit Settings
        ['OCS',  'p',   'ocs.ed.ws.gc',                         'KATSON'],
        ['OCS',  'i',   'ocs.ed.ws.gc',                         'KATSON'],
        ['OCS',  'p',   'ocs.ed.ws.usr',                        '*****'],
        ['OCS',  'i',   'ocs.ed.ws.usr',                        '*****'],
        ['OCS',  'p',   'ocs.ed.ws.pwd',                        '******'],
        ['OCS',  'i',   'ocs.ed.ws.pwd',                        '******'],
        ['OCS',  'p',   'ocs.ed.sc.gc.map',                     '[{"map": "KATSON", "gc": "KATSON"}]'],
        ['OCS',  'i',   'ocs.ed.sc.gc.map',                     '[{"map": "KATSON", "gc": "KATSON"}]'],
        ['OCS',  'p',   'ocs.ed.passthrough',                   'true'],
        ['OCS',  'i',   'ocs.ed.passthrough',                   'true'],
        ['OCS',  'p',   'ocs.ed.ul.gc.map',                     ''],
        ['OCS',  'i',   'ocs.ed.ul.gc.map',                     ''],

        -- TCA Webservice Settings
        ['TCA',  'p',   'webservice.username',                  '*****'],
        ['TCA',  'p',   'webservice.password',                  '*****'],
        ['TCA',  'i',   'ocs.ed.mandate.default.details',       ''], -- Auto-generated

        -- POS Mandate Settings
        ['OCS',  'd',   'external.status.webhook.url',          'https://api.bitventure.co.za/tca/webhook/easydebit/'],
        ['TCA',  'd',   'app.mandate.authentication.enabled',   'true'],
        ['TCA',  'd',   'app.mandate.creation.enabled',         'true'],
        ['OCS',  'd',   'ocs.ed.mandate.default.details',       ''], -- Auto-generated

        -- POS Payment Settings
        ['TCA',  'd',   'app.payments.enabled',                 'true'],
        ['TCA',  'd',   'app.manual.payments.enabled',          'true'],
        ['TCA',  'd',   'app.transaction.history.enabled',      'true'],
        ['TCA',  'd',   'manual.payments.reference.config',     ''], -- Auto-generated

        -- Ecentric Integration
        ['TCA',  'd',   'tca.application.key',                  '52263fa1-8fbd-46ca-b3c4-c1d148c73f68'],
        ['TCA',  'd',   'tca.merchant.id',                      '000000000000'],
        ['TCA',  'd',   'tca.merchant.username',                'default'],
        ['TCA',  'd',   'app.mandate.creation.fields',          '{}']
    ];

    -- ┌────────────────────────────────────────────────────────────────────┐
    -- │ Payment Reference Fields Configuration                             │
    -- └────────────────────────────────────────────────────────────────────┘
    cfg_manual_payment_refs_enabled BOOLEAN := TRUE;
    cfg_customer_reference_mode     TEXT := 'disabled'; -- enabled, disabled, required
    cfg_internal_reference_mode     TEXT := 'disabled'; -- enabled, disabled, required

    -- ┌────────────────────────────────────────────────────────────────────┐
    -- │ OCS Mandate Defaults                                               │
    -- └────────────────────────────────────────────────────────────────────┘
    cfg_mandate_type                TEXT := 'Usage';        -- Usage, Variable, Fixed
    cfg_debit_classification        TEXT := 'LRM';
    cfg_max_installment_amount      TEXT := '10000';        -- No decimals
    cfg_frequency                   TEXT := 'MONTHLY';
    cfg_tracking_enabled            BOOLEAN := TRUE;
    cfg_date_adjustment_allowed     TEXT := 'Y';            -- Y or N
    cfg_adjustment_frequency        TEXT := 'ANUALLY';
    cfg_adjustment_type             TEXT := 'RATE';
    cfg_adjustment_value            TEXT := '1';
    cfg_generate_installment        BOOLEAN := TRUE;
    cfg_calculate_installment       BOOLEAN := FALSE;
    cfg_generate_contract_ref       BOOLEAN := TRUE;
    cfg_contract_ref_format         TEXT := 'KATSON_*******'; -- Max 7 chars before underscore
    cfg_default_scheme              TEXT := 'KATSON';

    -- ========================================================================
    -- END OF CONFIGURATION SECTION
    -- ========================================================================



    -- ========================================================================
    -- INTERNAL VARIABLES - DO NOT MODIFY
    -- ========================================================================

    -- Entity Identifiers
    entity_parent_id                TEXT;
    entity_integrator_id            TEXT;
    entity_device_user_id           TEXT;
    entity_integrator_desc          TEXT;
    entity_device_user_desc         TEXT;
    entity_password                 TEXT;

    -- Loop Variables
    current_scope                   TEXT[];
    current_setting                 TEXT[];
    scope_identifier                TEXT;
    setting_scope                   TEXT;
    setting_entity_type             TEXT;
    setting_identifier              TEXT;
    setting_value                   JSONB := '{}'::JSONB;

    -- Entity Resolution
    target_entity_id                TEXT;
    target_entity_type_name         TEXT;

    -- Service Type Variables
    service_type_id                 INT;
    rate_limit_enabled              BOOLEAN;
    rate_limit_count                INTEGER;
    rate_limit_period               TEXT;

    -- JSON Objects
    json_mandate_defaults           JSONB := '{}'::JSONB;
    json_payment_refs               JSONB := '{}'::JSONB;

    -- Setting Management
    current_value                   TEXT;
    new_value                       TEXT;
    action_taken                    TEXT;

    -- Output
    output_results                  TEXT[][];
    output_row                      TEXT[];

    -- Counters
    counter_inserted                INTEGER := 0;
    counter_updated                 INTEGER := 0;
    counter_skipped                 INTEGER := 0;

    -- Timing
    start_time                      TIMESTAMP;
    end_time                        TIMESTAMP;

BEGIN
    start_time := clock_timestamp();

    RAISE NOTICE '';
    RAISE NOTICE '════════════════════════════════════════════════════════════════════';
    RAISE NOTICE '  SQL ONBOARDING SCRIPT v2.0';
    RAISE NOTICE '════════════════════════════════════════════════════════════════════';
    RAISE NOTICE '';
    RAISE NOTICE 'Company: %', cfg_parent_name;
    RAISE NOTICE 'Started: %', start_time;
    RAISE NOTICE '';

    -- ========================================================================
    -- VALIDATION
    -- ========================================================================

    RAISE NOTICE '┌─────────────────────────────────────────────────────────────────┐';
    RAISE NOTICE '│ Step 1: Validating Configuration                                │';
    RAISE NOTICE '└─────────────────────────────────────────────────────────────────┘';

    -- Validate parent name
    IF cfg_parent_name IS NULL OR trim(cfg_parent_name) = '' THEN
        RAISE EXCEPTION 'Parent name cannot be empty';
    END IF;
    RAISE NOTICE '✓ Parent name validated';

    -- Validate device user credentials if creating device user
    IF cfg_create_device_user THEN
        IF cfg_device_user_username IS NULL OR trim(cfg_device_user_username) = '' THEN
            RAISE EXCEPTION 'Device user username cannot be empty when create_device_user is true';
        END IF;
        IF cfg_device_user_password IS NULL OR trim(cfg_device_user_password) = '' THEN
            RAISE EXCEPTION 'Device user password cannot be empty when create_device_user is true';
        END IF;
        RAISE NOTICE '✓ Device user credentials validated';
    END IF;

    -- Validate payment reference field modes
    IF cfg_manual_payment_refs_enabled THEN
        IF LOWER(cfg_customer_reference_mode) NOT IN ('enabled', 'disabled', 'required') THEN
            RAISE EXCEPTION 'Invalid customer_reference_mode: "%". Must be: enabled, disabled, or required',
                cfg_customer_reference_mode;
        END IF;
        IF LOWER(cfg_internal_reference_mode) NOT IN ('enabled', 'disabled', 'required') THEN
            RAISE EXCEPTION 'Invalid internal_reference_mode: "%". Must be: enabled, disabled, or required',
                cfg_internal_reference_mode;
        END IF;
        RAISE NOTICE '✓ Payment reference modes validated';
    END IF;

    -- Validate mandate type
    IF LOWER(cfg_mandate_type) NOT IN ('usage', 'variable', 'fixed') THEN
        RAISE EXCEPTION 'Invalid mandate_type: "%". Must be: Usage, Variable, or Fixed', cfg_mandate_type;
    END IF;
    RAISE NOTICE '✓ Mandate type validated';

    RAISE NOTICE '';

    -- ========================================================================
    -- PRE-PROCESSING
    -- ========================================================================

    RAISE NOTICE '┌─────────────────────────────────────────────────────────────────┐';
    RAISE NOTICE '│ Step 2: Pre-Processing Configuration                            │';
    RAISE NOTICE '└─────────────────────────────────────────────────────────────────┘';

    -- Duplicate EasyDebit credentials as webservice credentials
    FOREACH current_setting SLICE 1 IN ARRAY cfg_entity_settings
    LOOP
        IF LOWER(current_setting[3]) = 'ocs.ed.ws.usr' THEN
            cfg_entity_settings := cfg_entity_settings || ARRAY[
                [current_setting[1], current_setting[2], 'webservice.username', current_setting[4]]
            ];
        ELSIF LOWER(current_setting[3]) = 'ocs.ed.ws.pwd' THEN
            cfg_entity_settings := cfg_entity_settings || ARRAY[
                [current_setting[1], current_setting[2], 'webservice.password', current_setting[4]]
            ];
        END IF;
    END LOOP;
    RAISE NOTICE '✓ Duplicated EasyDebit credentials as webservice credentials';

    -- Build mandate defaults JSON
    json_mandate_defaults := jsonb_build_object(
        'mandateType',              cfg_mandate_type,
        'debitClassification',      cfg_debit_classification,
        'maximumInstallmentAmount', cfg_max_installment_amount,
        'frequency',                cfg_frequency,
        'tracking',                 cfg_tracking_enabled,
        'dateAdjustmentAllowed',    cfg_date_adjustment_allowed,
        'adjustmentFrequency',      cfg_adjustment_frequency,
        'adjustmentType',           cfg_adjustment_type,
        'adjustmentValue',          cfg_adjustment_value,
        'generateInstallment',      cfg_generate_installment,
        'calculateInstallment',     cfg_calculate_installment
    );

    -- Add optional mandate fields
    IF cfg_default_scheme IS NOT NULL AND cfg_default_scheme != '' THEN
        json_mandate_defaults := json_mandate_defaults ||
            jsonb_build_object('scheme', cfg_default_scheme);
    END IF;

    IF cfg_generate_contract_ref IS NOT NULL THEN
        json_mandate_defaults := json_mandate_defaults ||
            jsonb_build_object('generateContractReference', cfg_generate_contract_ref);
    END IF;

    IF cfg_contract_ref_format IS NOT NULL THEN
        json_mandate_defaults := json_mandate_defaults ||
            jsonb_build_object('referenceFormat', cfg_contract_ref_format);
    END IF;

    RAISE NOTICE '✓ Built mandate defaults JSON: %', json_mandate_defaults::TEXT;

    -- Build payment reference fields JSON
    IF cfg_manual_payment_refs_enabled THEN
        json_payment_refs := jsonb_build_object(
            'app.manual.payments.reference.customer', cfg_customer_reference_mode,
            'app.manual.payments.reference.internal', cfg_internal_reference_mode
        );
    ELSE
        json_payment_refs := jsonb_build_object(
            'app.manual.payments.reference.customer', 'disabled',
            'app.manual.payments.reference.internal', 'disabled'
        );
    END IF;
    RAISE NOTICE '✓ Built payment reference fields JSON: %', json_payment_refs::TEXT;

    RAISE NOTICE '';

    -- ========================================================================
    -- CREATE ENTITIES
    -- ========================================================================

    RAISE NOTICE '┌─────────────────────────────────────────────────────────────────┐';
    RAISE NOTICE '│ Step 3: Creating Entities                                       │';
    RAISE NOTICE '└─────────────────────────────────────────────────────────────────┘';

    -- Generate unique identifiers
    entity_parent_id        := UPPER(uuid_generate_v4()::VARCHAR);
    entity_integrator_id    := uuid_generate_v4()::VARCHAR;
    entity_device_user_id   := uuid_generate_v4()::VARCHAR;
    entity_password         := uuid_generate_v4()::VARCHAR;

    -- Set descriptions
    entity_integrator_desc  := cfg_parent_name || ' :Integrator';
    entity_device_user_desc := cfg_device_user_username;

    -- ┌────────────────────────────────────────────────────────────────────┐
    -- │ Create Parent Entity                                               │
    -- └────────────────────────────────────────────────────────────────────┘

    INSERT INTO public.entity (description, identifier, lookup_entity_type_id, active)
    SELECT
        cfg_parent_name,
        entity_parent_id,
        1, -- Parent type
        TRUE
    WHERE NOT EXISTS (
        SELECT 1 FROM public.entity WHERE LOWER(description) = LOWER(cfg_parent_name)
    );

    IF FOUND THEN
        RAISE NOTICE '✓ Parent entity created: %', cfg_parent_name;
    ELSE
        RAISE NOTICE '→ Parent entity already exists: %', cfg_parent_name;
    END IF;

    -- Get the actual identifier (in case entity already existed)
    SELECT identifier INTO entity_parent_id
    FROM public.entity
    WHERE LOWER(description) = LOWER(cfg_parent_name);

    -- ┌────────────────────────────────────────────────────────────────────┐
    -- │ Create Integrator Entity                                           │
    -- └────────────────────────────────────────────────────────────────────┘

    IF cfg_create_integrator THEN
        -- Insert entity record
        INSERT INTO public.entity (description, identifier, lookup_entity_type_id, active, parent_id)
        SELECT
            entity_integrator_desc,
            entity_integrator_id,
            (SELECT id FROM lookup_entity_type WHERE description = 'Integrator'),
            TRUE,
            (SELECT id FROM entity WHERE identifier = entity_parent_id)
        WHERE NOT EXISTS (
            SELECT 1 FROM public.entity WHERE LOWER(description) = LOWER(entity_integrator_desc)
        );

        IF FOUND THEN
            RAISE NOTICE '✓ Integrator entity created: %', entity_integrator_desc;
        ELSE
            RAISE NOTICE '→ Integrator entity already exists: %', entity_integrator_desc;
        END IF;

        -- Get the actual identifier
        SELECT identifier INTO entity_integrator_id
        FROM public.entity
        WHERE LOWER(description) = LOWER(entity_integrator_desc);

        -- Insert integrator credentials
        INSERT INTO public.integrator (entity_id, client_secret, email_address, active)
        SELECT
            (SELECT id FROM entity WHERE identifier = entity_integrator_id),
            encode(digest(entity_password::BYTEA, 'sha256'), 'base64'),
            cfg_integrator_email,
            TRUE
        WHERE NOT EXISTS (
            SELECT 1
            FROM public.integrator i
            INNER JOIN public.entity e ON e.id = i.entity_id
            WHERE LOWER(e.identifier) = LOWER(entity_integrator_id)
        );

        IF FOUND THEN
            RAISE NOTICE '✓ Integrator credentials created';
        ELSE
            RAISE NOTICE '→ Integrator credentials already exist';
        END IF;
    ELSE
        RAISE NOTICE '⊘ Integrator creation skipped (cfg_create_integrator = false)';
    END IF;

    -- ┌────────────────────────────────────────────────────────────────────┐
    -- │ Create Device User Entity                                          │
    -- └────────────────────────────────────────────────────────────────────┘

    IF cfg_create_device_user THEN
        -- Insert entity record
        INSERT INTO public.entity (description, identifier, lookup_entity_type_id, active, parent_id)
        SELECT
            entity_device_user_desc,
            entity_device_user_id,
            (SELECT id FROM lookup_entity_type WHERE description = 'User'),
            TRUE,
            (SELECT id FROM entity WHERE identifier = entity_parent_id)
        WHERE NOT EXISTS (
            SELECT 1 FROM public.entity WHERE LOWER(description) = LOWER(entity_device_user_desc)
        );

        IF FOUND THEN
            RAISE NOTICE '✓ Device user entity created: %', entity_device_user_desc;
        ELSE
            RAISE NOTICE '→ Device user entity already exists: %', entity_device_user_desc;
        END IF;

        -- Get the actual identifier
        SELECT identifier INTO entity_device_user_id
        FROM public.entity
        WHERE LOWER(description) = LOWER(entity_device_user_desc);

        -- Insert device user credentials
        INSERT INTO public.user (entity_id, username, password, email_address, active)
        SELECT
            (SELECT id FROM entity WHERE identifier = entity_device_user_id),
            cfg_device_user_username,
            encode(digest(cfg_device_user_password::BYTEA, 'sha256'), 'base64'),
            cfg_device_user_email,
            cfg_device_user_active
        WHERE NOT EXISTS (
            SELECT 1
            FROM public.user u
            INNER JOIN public.entity e ON e.id = u.entity_id
            WHERE LOWER(e.identifier) = LOWER(entity_device_user_id)
        );

        IF FOUND THEN
            RAISE NOTICE '✓ Device user credentials created';
        ELSE
            RAISE NOTICE '→ Device user credentials already exist';
        END IF;
    ELSE
        RAISE NOTICE '⊘ Device user creation skipped (cfg_create_device_user = false)';
    END IF;

    RAISE NOTICE '';

    -- ========================================================================
    -- ASSIGN SERVICE SCOPES TO PARENT
    -- ========================================================================

    RAISE NOTICE '┌─────────────────────────────────────────────────────────────────┐';
    RAISE NOTICE '│ Step 4: Assigning Service Scopes                                │';
    RAISE NOTICE '└─────────────────────────────────────────────────────────────────┘';

    FOREACH current_scope SLICE 1 IN ARRAY cfg_service_scopes
    LOOP
        scope_identifier    := UPPER(current_scope[1]);
        rate_limit_enabled  := current_scope[2]::BOOLEAN;
        rate_limit_count    := current_scope[3]::INTEGER;
        rate_limit_period   := current_scope[4];

        RAISE NOTICE '';
        RAISE NOTICE 'Scope: % (Rate Limit: %)', scope_identifier, rate_limit_enabled;

        -- Add service type to parent
        INSERT INTO public.entity_service_type (entity_id, service_type_id, active)
        SELECT
            (SELECT id FROM entity WHERE identifier = entity_parent_id),
            st.id,
            TRUE
        FROM service_type st
        WHERE UPPER(st.identifier) = scope_identifier
        AND NOT EXISTS (
            SELECT 1
            FROM entity_service_type est
            INNER JOIN entity e ON e.id = est.entity_id
            INNER JOIN service_type st2 ON st2.id = est.service_type_id
            WHERE e.identifier = entity_parent_id
            AND UPPER(st2.identifier) = scope_identifier
        );

        IF FOUND THEN
            RAISE NOTICE '  ✓ Service type assigned to parent';
        ELSE
            RAISE NOTICE '  → Service type already assigned to parent';
        END IF;

        -- Add all services under this service type
        IF rate_limit_enabled THEN
            INSERT INTO public.entity_service (entity_id, service_id, active, rate_limit, limit_count, limit_period)
            SELECT
                e.id,
                s.id,
                TRUE,
                TRUE,
                rate_limit_count,
                rate_limit_period
            FROM entity e
            CROSS JOIN service s
            INNER JOIN service_type st ON s.service_type_id = st.id
            WHERE e.identifier = entity_parent_id
            AND UPPER(st.identifier) = scope_identifier
            AND NOT EXISTS (
                SELECT 1
                FROM entity_service es
                WHERE es.entity_id = e.id
                AND es.service_id = s.id
            );
        ELSE
            INSERT INTO public.entity_service (entity_id, service_id, active, rate_limit)
            SELECT
                e.id,
                s.id,
                TRUE,
                FALSE
            FROM entity e
            CROSS JOIN service s
            INNER JOIN service_type st ON s.service_type_id = st.id
            WHERE e.identifier = entity_parent_id
            AND UPPER(st.identifier) = scope_identifier
            AND NOT EXISTS (
                SELECT 1
                FROM entity_service es
                WHERE es.entity_id = e.id
                AND es.service_id = s.id
            );
        END IF;

        RAISE NOTICE '  ✓ Services assigned to parent';
    END LOOP;

    RAISE NOTICE '';

    -- ========================================================================
    -- APPLY SETTINGS
    -- ========================================================================

    RAISE NOTICE '┌─────────────────────────────────────────────────────────────────┐';
    RAISE NOTICE '│ Step 5: Applying Settings                                       │';
    RAISE NOTICE '└─────────────────────────────────────────────────────────────────┘';
    RAISE NOTICE '';
    RAISE NOTICE '%', RPAD('Scope', 8) || RPAD('Entity', 12) || RPAD('Setting', 45) || RPAD('Action', 12) || 'Value';
    RAISE NOTICE '%', REPEAT('─', 120);

    -- Process each scope
    FOREACH current_scope SLICE 1 IN ARRAY cfg_service_scopes
    LOOP
        scope_identifier := UPPER(current_scope[1]);
        rate_limit_enabled := current_scope[2]::BOOLEAN;
        rate_limit_count := current_scope[3]::INTEGER;
        rate_limit_period := current_scope[4];

        -- Process each setting for this scope
        FOREACH current_setting SLICE 1 IN ARRAY cfg_entity_settings
        LOOP
            setting_scope := UPPER(current_setting[1]);

            -- Only process settings that match current scope
            IF setting_scope != scope_identifier THEN
                CONTINUE;
            END IF;

            setting_entity_type := UPPER(current_setting[2]);
            setting_identifier := current_setting[3];
            setting_value := to_jsonb(current_setting[4]);

            -- Resolve entity identifier based on entity type
            CASE setting_entity_type
                WHEN 'P' THEN
                    target_entity_id := entity_parent_id;
                    target_entity_type_name := 'Parent';
                WHEN 'I' THEN
                    target_entity_id := entity_integrator_id;
                    target_entity_type_name := 'Integrator';
                WHEN 'D' THEN
                    target_entity_id := entity_device_user_id;
                    target_entity_type_name := 'DeviceUser';
                ELSE
                    RAISE EXCEPTION 'Invalid entity type: %. Must be P, I, or D', setting_entity_type;
            END CASE;

            -- Skip if entity doesn't exist (e.g., integrator not created)
            IF target_entity_id IS NULL THEN
                CONTINUE;
            END IF;

            -- Ensure entity has this service type
            service_type_id := (
                SELECT est.id
                FROM entity_service_type est
                INNER JOIN entity e ON e.id = est.entity_id
                INNER JOIN service_type st ON st.id = est.service_type_id
                WHERE e.identifier = target_entity_id
                AND UPPER(st.identifier) = scope_identifier
            );

            -- If entity doesn't have service type, add it
            IF service_type_id IS NULL THEN
                INSERT INTO public.entity_service_type (entity_id, service_type_id, active)
                SELECT
                    e.id,
                    st.id,
                    TRUE
                FROM entity e
                CROSS JOIN service_type st
                WHERE e.identifier = target_entity_id
                AND UPPER(st.identifier) = scope_identifier
                AND NOT EXISTS (
                    SELECT 1
                    FROM entity_service_type est
                    WHERE est.entity_id = e.id
                    AND est.service_type_id = st.id
                );

                -- Add services for this entity
                IF rate_limit_enabled THEN
                    INSERT INTO public.entity_service (entity_id, service_id, active, rate_limit, limit_count, limit_period)
                    SELECT
                        e.id,
                        s.id,
                        TRUE,
                        TRUE,
                        rate_limit_count,
                        rate_limit_period
                    FROM entity e
                    CROSS JOIN service s
                    INNER JOIN service_type st ON s.service_type_id = st.id
                    WHERE e.identifier = target_entity_id
                    AND UPPER(st.identifier) = scope_identifier
                    AND NOT EXISTS (
                        SELECT 1
                        FROM entity_service es
                        WHERE es.entity_id = e.id
                        AND es.service_id = s.id
                    );
                ELSE
                    INSERT INTO public.entity_service (entity_id, service_id, active, rate_limit)
                    SELECT
                        e.id,
                        s.id,
                        TRUE,
                        FALSE
                    FROM entity e
                    CROSS JOIN service s
                    INNER JOIN service_type st ON s.service_type_id = st.id
                    WHERE e.identifier = target_entity_id
                    AND UPPER(st.identifier) = scope_identifier
                    AND NOT EXISTS (
                        SELECT 1
                        FROM entity_service es
                        WHERE es.entity_id = e.id
                        AND es.service_id = s.id
                    );
                END IF;

                -- Get the newly created service_type_id
                service_type_id := (
                    SELECT est.id
                    FROM entity_service_type est
                    INNER JOIN entity e ON e.id = est.entity_id
                    INNER JOIN service_type st ON st.id = est.service_type_id
                    WHERE e.identifier = target_entity_id
                    AND UPPER(st.identifier) = scope_identifier
                );
            END IF;

            -- Handle special settings
            IF LOWER(setting_identifier) IN ('webservice.username', 'webservice.password') THEN
                -- These go to entity_service_setting for tca.services.mca
                INSERT INTO public.entity_service_setting (entity_service_id, identifier, value)
                SELECT
                    es.id,
                    setting_identifier,
                    TRIM(BOTH '"' FROM setting_value::TEXT)
                FROM entity_service es
                INNER JOIN entity e ON e.id = es.entity_id
                INNER JOIN service s ON s.id = es.service_id
                WHERE e.identifier = target_entity_id
                AND s.identifier = 'tca.services.mca'
                AND NOT EXISTS (
                    SELECT 1
                    FROM entity_service_setting ess
                    WHERE ess.entity_service_id = es.id
                    AND ess.identifier = setting_identifier
                );

                IF FOUND THEN
                    action_taken := 'Inserted';
                    counter_inserted := counter_inserted + 1;
                ELSE
                    action_taken := 'No change';
                    counter_skipped := counter_skipped + 1;
                END IF;

            ELSIF LOWER(setting_identifier) = 'ocs.easy.loan.webhook.url' THEN
                -- Add specific OCS services and apply webhook URL
                INSERT INTO public.entity_service (entity_id, service_id, active, rate_limit, limit_count, limit_period)
                SELECT
                    e.id,
                    s.id,
                    TRUE,
                    TRUE,
                    NULL,
                    NULL
                FROM entity e
                CROSS JOIN service s
                WHERE e.identifier = target_entity_id
                AND s.identifier IN ('ocs.services.collection', 'ocs.services.mandate', 'ocs.services.debitorder')
                AND NOT EXISTS (
                    SELECT 1
                    FROM entity_service es
                    WHERE es.entity_id = e.id
                    AND es.service_id = s.id
                );

                INSERT INTO public.entity_service_setting (entity_service_id, identifier, value)
                SELECT
                    es.id,
                    setting_identifier,
                    TRIM(BOTH '"' FROM setting_value::TEXT)
                FROM entity_service es
                INNER JOIN entity e ON e.id = es.entity_id
                INNER JOIN service s ON s.id = es.service_id
                WHERE e.identifier = target_entity_id
                AND s.identifier IN ('ocs.services.collection', 'ocs.services.mandate', 'ocs.services.debitorder')
                AND NOT EXISTS (
                    SELECT 1
                    FROM entity_service_setting ess
                    WHERE ess.entity_service_id = es.id
                    AND ess.identifier = setting_identifier
                );

                action_taken := 'Inserted';
                counter_inserted := counter_inserted + 1;

            ELSE
                -- Regular entity_service_type_setting

                -- Skip if service_type_id is still NULL (entity doesn't have this service type)
                IF service_type_id IS NULL THEN
                    action_taken := 'Skipped (no service type)';
                    counter_skipped := counter_skipped + 1;
                ELSE
                    -- Replace auto-generated JSON values
                    IF LOWER(setting_identifier) = 'ocs.ed.mandate.default.details' THEN
                        setting_value := json_mandate_defaults;
                    ELSIF LOWER(setting_identifier) = 'manual.payments.reference.config' THEN
                        setting_value := json_payment_refs;
                    END IF;

                    -- Get current value
                    current_value := (
                        SELECT value
                        FROM entity_service_type_setting
                        WHERE LOWER(identifier) = LOWER(setting_identifier)
                        AND entity_service_type_id = service_type_id
                        LIMIT 1
                    );

                    new_value := TRIM(BOTH '"' FROM setting_value::TEXT);

                -- Handle JSON array merging for .map settings
                IF (setting_identifier LIKE '%.map' AND new_value != '')
                   OR setting_identifier IN ('ocs.ed.mandate.default.details', 'manual.payments.reference.config') THEN

                    IF current_value IS NOT NULL THEN
                        -- Clean escaped quotes
                        IF current_value::TEXT LIKE '%\\\"%' THEN
                            current_value := REPLACE(REPLACE(current_value::TEXT, '\"', '"'), '\\', '');
                        END IF;

                        IF new_value::TEXT LIKE '%\\\"%' THEN
                            new_value := REPLACE(REPLACE(new_value::TEXT, '\"', '"'), '\\', '');
                        END IF;

                        -- Merge arrays
                        IF jsonb_typeof(current_value::JSONB) = 'array'
                           OR jsonb_typeof(new_value::JSONB) = 'array' THEN
                            WITH current_elements AS (
                                SELECT jsonb_object_agg(k, v) AS obj
                                FROM jsonb_array_elements(current_value::JSONB) elem,
                                     jsonb_each(elem) AS t(k, v)
                                GROUP BY elem
                            ),
                            new_elements AS (
                                SELECT jsonb_object_agg(k, v) AS obj
                                FROM jsonb_array_elements(new_value::JSONB) elem,
                                     jsonb_each(elem) AS t(k, v)
                                GROUP BY elem
                            ),
                            combined AS (
                                SELECT obj FROM current_elements
                                UNION
                                SELECT obj FROM new_elements
                            )
                            SELECT jsonb_agg(obj) INTO new_value FROM combined;
                        ELSE
                            -- Merge objects
                            new_value := COALESCE(current_value::JSONB, '{}'::JSONB) || new_value::JSONB;
                        END IF;
                    END IF;
                END IF;

                -- Insert or update
                IF current_value IS NULL THEN
                    INSERT INTO public.entity_service_type_setting (entity_service_type_id, identifier, value)
                    SELECT
                        service_type_id,
                        setting_identifier,
                        CASE
                            WHEN jsonb_typeof(new_value::JSONB) IN ('string', 'number', 'boolean')
                            THEN TRIM(BOTH '"' FROM new_value)
                            ELSE new_value
                        END
                    WHERE NOT EXISTS (
                        SELECT 1
                        FROM entity_service_type_setting
                        WHERE LOWER(identifier) = LOWER(setting_identifier)
                        AND entity_service_type_id = service_type_id
                    );

                    action_taken := 'Inserted';
                    counter_inserted := counter_inserted + 1;

                ELSIF current_value != new_value THEN
                    UPDATE public.entity_service_type_setting
                    SET value = CASE
                                WHEN jsonb_typeof(new_value::JSONB) IN ('string', 'number', 'boolean')
                                THEN TRIM(BOTH '"' FROM new_value)
                                ELSE new_value
                                END
                    WHERE LOWER(identifier) = LOWER(setting_identifier)
                    AND entity_service_type_id = service_type_id;

                    action_taken := 'Updated';
                    counter_updated := counter_updated + 1;

                    ELSE
                        action_taken := 'No change';
                        counter_skipped := counter_skipped + 1;
                    END IF;
                END IF;  -- End of IF service_type_id IS NOT NULL
            END IF;  -- End of IF special settings vs regular settings

            -- Log the action
            RAISE NOTICE '%',
                RPAD(scope_identifier, 8) ||
                RPAD(target_entity_type_name, 12) ||
                RPAD(setting_identifier, 45) ||
                RPAD(action_taken, 12) ||
                LEFT(setting_value::TEXT, 50);
        END LOOP;
    END LOOP;

    RAISE NOTICE '';

    -- ========================================================================
    -- SUMMARY
    -- ========================================================================

    end_time := clock_timestamp();

    RAISE NOTICE '';
    RAISE NOTICE '════════════════════════════════════════════════════════════════════';
    RAISE NOTICE '  EXECUTION SUMMARY';
    RAISE NOTICE '════════════════════════════════════════════════════════════════════';
    RAISE NOTICE '';
    RAISE NOTICE 'Settings Inserted:  %', counter_inserted;
    RAISE NOTICE 'Settings Updated:   %', counter_updated;
    RAISE NOTICE 'Settings Unchanged: %', counter_skipped;
    RAISE NOTICE 'Total Settings:     %', counter_inserted + counter_updated + counter_skipped;
    RAISE NOTICE '';
    RAISE NOTICE 'Execution Time:     %', end_time - start_time;
    RAISE NOTICE '';

    -- ========================================================================
    -- ENTITY CREDENTIALS
    -- ========================================================================

    RAISE NOTICE '════════════════════════════════════════════════════════════════════';
    RAISE NOTICE '  ENTITY CREDENTIALS';
    RAISE NOTICE '════════════════════════════════════════════════════════════════════';
    RAISE NOTICE '';

    output_results := ARRAY[
        ['Entity Type', 'Name', 'Entity ID', 'Password/Username'],
        [REPEAT('─', 15), REPEAT('─', 30), REPEAT('─', 40), REPEAT('─', 40)]
    ];

    output_results := output_results || ARRAY[[
        'Parent',
        cfg_parent_name,
        entity_parent_id,
        'N/A'
    ]];

    IF cfg_create_integrator THEN
        output_results := output_results || ARRAY[[
            'Integrator',
            entity_integrator_desc,
            entity_integrator_id,
            entity_password
        ]];
    END IF;

    IF cfg_create_device_user THEN
        output_results := output_results || ARRAY[[
            'Device User',
            entity_device_user_desc,
            entity_device_user_id,
            cfg_device_user_password
        ]];
    END IF;

    FOREACH output_row SLICE 1 IN ARRAY output_results
    LOOP
        RAISE NOTICE '│ % │ % │ % │ % │',
            RPAD(output_row[1], 15),
            RPAD(output_row[2], 30),
            RPAD(output_row[3], 40),
            RPAD(output_row[4], 40);
    END LOOP;

    RAISE NOTICE '';
    RAISE NOTICE '════════════════════════════════════════════════════════════════════';
    RAISE NOTICE '  ONBOARDING COMPLETED SUCCESSFULLY';
    RAISE NOTICE '════════════════════════════════════════════════════════════════════';
    RAISE NOTICE '';

EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE '';
        RAISE NOTICE '════════════════════════════════════════════════════════════════════';
        RAISE NOTICE '  ERROR OCCURRED';
        RAISE NOTICE '════════════════════════════════════════════════════════════════════';
        RAISE NOTICE '';
        RAISE NOTICE 'Error Message: %', SQLERRM;
        RAISE NOTICE 'Error Detail:  %', SQLSTATE;
        RAISE NOTICE '';
        RAISE NOTICE 'Rolling back all changes...';
        RAISE NOTICE '';

        -- Re-raise the exception to trigger rollback
        RAISE;
END $$;
