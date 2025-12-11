function generateScript() {
    console.log('=== Starting Script Generation ===');

    // ===== COLLECT FORM DATA =====
    const parentName = $('#parentName').val();
    const entityWebsite = $('#website').val() || 'http://www.bitventure.co.za';
    const createIntegrator = $('#createIntegrator').is(':checked');
    const createDeviceUser = $('#createDeviceUser').is(':checked');

    // Device user settings
    const deviceUsername = $('#deviceUsername').val() || '';
    const devicePassword = $('#devicePassword').val() || '';
    const deviceEmail = $('#deviceEmail').val() || 'development@bitventure.co.za';
    const deviceUserIsActive = true;

    // Validate required fields
    if (!parentName) {
        alert('Please enter a Parent Entity Name');
        $('#parentName').focus();
        return;
    }

    // Collect selected scopes
    const selectedScopes = [];
    $('.scope-checkbox-input:checked').each(function() {
        selectedScopes.push($(this).val());
    });

    if (selectedScopes.length === 0) {
        alert('Please select at least one scope');
        return;
    }

    console.log('Selected Scopes:', selectedScopes);

    // ===== BUILD SQL SCRIPT =====
    let sqlScript = `-- Generated SQL Onboarding Script
-- Date: ${new Date().toLocaleDateString()}
-- Time: ${new Date().toLocaleTimeString()}
-- Parent Entity: ${parentName}

DO $$

DECLARE
-- Parent Entity ---------------
\tparent_name \t\t\t\tTEXT := \t'${parentName}'; -- << CHANGE
\tentity_service_types \t\tTEXT[] :=array[
--  | Scope | Limit | Count | Period|
`;

    // Add service types to array
    selectedScopes.forEach((scope, index) => {
        sqlScript += `\t[ '${scope}', 'true',  null,   null\t]`;
        if (index < selectedScopes.length - 1) {
            sqlScript += ',\n';
        } else {
            sqlScript += '\n';
        }
    });

    sqlScript += `    ];

-- Integration Entity ----------
\tcreate_integration_entity \tBOOLEAN:= \t${createIntegrator};  -- << CHANGE (true or false)

-- Device User -----------------
    create_device_user \t\t\tBOOLEAN:= \t${createDeviceUser};  \t\t\t-- << CHANGE (true or false)
`;

    if (createDeviceUser && deviceUsername) {
        sqlScript += `    device_user_username \t\tTEXT:= \t\t'${deviceUsername}'; \t\t-- << CHANGE
    device_user_password \t\tTEXT:= \t\t'${devicePassword}'; \t-- << CHANGE
    device_user_email_address \tTEXT:= \t\t'${deviceEmail}'; -- << CHANGE
    device_user_is_active \t\tBOOLEAN:= \t${deviceUserIsActive};  \t\t\t-- << CHANGE (true or false)
`;
    } else {
        sqlScript += `    device_user_username \t\tTEXT:= \t\t''; \t\t-- << CHANGE
    device_user_password \t\tTEXT:= \t\t''; \t-- << CHANGE
    device_user_email_address \tTEXT:= \t\t'development@bitventure.co.za'; -- << CHANGE
    device_user_is_active \t\tBOOLEAN:= \ttrue;  \t\t\t-- << CHANGE (true or false)
`;
    }

    sqlScript += `

-- Entity Settings
\t-- Each scope in these settings must be added to the parent's "entity_service_types"
\t-- p: Parent
\t-- d: Device User
\t-- i: Integrator
    entity_settings TEXT[] := array[
\t-- Add 2 dashes in front of the setting if not needed or pass NULL as the value
    --  | SCOPE \t|Entity | Identifier                  \t\t| Value \t\t|
`;

    // ===== COLLECT SETTINGS =====
    const entitySettings = [];

    selectedScopes.forEach(scope => {
        const scopeData = scopes[scope];

        // Process scope-level settings
        if (scopeData.settings && scopeData.settings.length > 0) {
            scopeData.settings.forEach(setting => {
                const settingName = typeof setting === 'string' ? setting : setting.name;
                const settingObj = typeof setting === 'string' ? null : setting;

                // Determine which entities this setting applies to
                const applyTo = settingObj?.applyTo || 'parent';
                const allowedServices = settingObj?.services || [];

                // Check if this setting is restricted to specific services
                // For now, we'll add settings that apply to all or parent
                if (!settingObj?.applyTo || applyTo === 'parent' || applyTo === 'p') {
                    const elementId = `${scope}-${safeRename(settingName)}`;
                    const $element = $(`#${elementId}`);

                    if ($element.length > 0) {
                        let value = getSettingValue($element, settingObj);
                        if (value !== null && value !== '') {
                            entitySettings.push({
                                scope: scope,
                                entity: 'p',
                                identifier: settingName,
                                value: value
                            });
                        }
                    }
                }

                // Check for integrator-specific settings
                if (createIntegrator && (applyTo === 'integrator' || applyTo === 'i')) {
                    const elementId = `${scope}-${safeRename(settingName)}`;
                    const $element = $(`#${elementId}`);

                    if ($element.length > 0) {
                        let value = getSettingValue($element, settingObj);
                        if (value !== null && value !== '') {
                            entitySettings.push({
                                scope: scope,
                                entity: 'i',
                                identifier: settingName,
                                value: value
                            });
                        }
                    }
                }

                // Check for device user-specific settings
                if (createDeviceUser && (applyTo === 'deviceuser' || applyTo === 'd')) {
                    const elementId = `${scope}-${safeRename(settingName)}`;
                    const $element = $(`#${elementId}`);

                    if ($element.length > 0) {
                        let value = getSettingValue($element, settingObj);
                        if (value !== null && value !== '') {
                            entitySettings.push({
                                scope: scope,
                                entity: 'd',
                                identifier: settingName,
                                value: value
                            });
                        }
                    }
                }
            });
        }

        // Process service-level settings
        if (scopeData.services && scopeData.services.length > 0) {
            scopeData.services.forEach(service => {
                if (service.settings && service.settings.length > 0) {
                    service.settings.forEach(setting => {
                        const settingName = typeof setting === 'string' ? setting : setting.name;
                        const settingObj = typeof setting === 'string' ? null : setting;

                        // Determine entity for this setting
                        const allowOn = service.allowOn || settingObj?.allowOn || ['parent'];
                        const applyTo = settingObj?.applyTo || 'parent';

                        // Parent entity
                        if (allowOn.includes('parent') && (applyTo === 'parent' || applyTo === 'p' || !settingObj?.applyTo)) {
                            const elementId = `${scope}-${safeRename(service.name)}-${safeRename(settingName)}`;
                            const $element = $(`#${elementId}`);

                            if ($element.length > 0) {
                                let value = getSettingValue($element, settingObj);
                                if (value !== null && value !== '') {
                                    entitySettings.push({
                                        scope: scope,
                                        entity: 'p',
                                        identifier: settingName,
                                        value: value,
                                        service: service.name
                                    });
                                }
                            }
                        }

                        // Integrator entity
                        if (createIntegrator && allowOn.includes('integrator') && (applyTo === 'integrator' || applyTo === 'i')) {
                            const elementId = `${scope}-${safeRename(service.name)}-${safeRename(settingName)}`;
                            const $element = $(`#${elementId}`);

                            if ($element.length > 0) {
                                let value = getSettingValue($element, settingObj);
                                if (value !== null && value !== '') {
                                    entitySettings.push({
                                        scope: scope,
                                        entity: 'i',
                                        identifier: settingName,
                                        value: value,
                                        service: service.name
                                    });
                                }
                            }
                        }

                        // Device user entity
                        if (createDeviceUser && (allowOn.includes('deviceuser') || (settingObj?.allowOn && settingObj.allowOn.includes('deviceuser')))) {
                            const elementId = `${scope}-${safeRename(service.name)}-${safeRename(settingName)}`;
                            const $element = $(`#${elementId}`);

                            if ($element.length > 0) {
                                let value = getSettingValue($element, settingObj);
                                if (value !== null && value !== '') {
                                    entitySettings.push({
                                        scope: scope,
                                        entity: 'd',
                                        identifier: settingName,
                                        value: value,
                                        service: service.name
                                    });
                                }
                            }
                        }
                    });
                }
            });
        }
    });

    console.log('Collected Entity Settings:', entitySettings);

    // Add settings to SQL
    entitySettings.forEach((setting, index) => {
        const value = escapeQuotes(setting.value);
        const comment = setting.service ? ` -- Service: ${setting.service}` : '';
        sqlScript += `        ['${setting.scope}',\t\t'${setting.entity}',\t'${setting.identifier}',\t\t\t\t\t'${value}'],${comment}\n`;
    });

    // Remove trailing comma
    if (entitySettings.length > 0) {
        sqlScript = sqlScript.replace(/,\s*$/, '\n');
    }

    sqlScript += `    ];

-- Payment Reference Fields
\tmanual_payments_reference_fields \t\tBOOLEAN:=\t\ttrue;
\tmanual_payments_customer_reference \t\tTEXT:= \t\t\t'disabled'; -- Acceptable values: enabled, disabled, required
\tmanual_payments_internal_reference \t\tTEXT:= \t\t\t'disabled'; -- Acceptable values: enabled, disabled, required
`;

    // Add OCS mandate defaults if OCS scope is selected
    if (selectedScopes.includes('OCS')) {
        const mandateSettings = collectMandateDefaults();
        sqlScript += `
-- Mandate defaults
    ocs_default_mandate_type \t\t\t\tTEXT:= \t\t\t'${mandateSettings.mandateType}'; -- Can be 'Usage', 'Variable' or 'Fixed'
    ocs_default_debit_classification \t\tTEXT:= \t\t\t'${mandateSettings.debitClassification}';
    ocs_default_max_installment_amount \t\tTEXT:= \t\t\t'${mandateSettings.maximumInstallmentAmount}'; -- Don't add cents or decimal points
    ocs_default_frequency \t\t\t\t\tTEXT:= \t\t\t'${mandateSettings.frequency}';
    ocs_default_tracking_enabled \t\t\tBOOLEAN:= \t\t${mandateSettings.tracking};
    ocs_default_date_adjustment_allowed \tTEXT:= \t\t\t'${mandateSettings.dateAdjustmentAllowed}'; -- Either 'Y' or 'N'
    ocs_default_adjustment_frequency \t\tTEXT:= \t\t\t'${mandateSettings.adjustmentFrequency}';
    ocs_default_adjustment_type \t\t\tTEXT:= \t\t\t'${mandateSettings.adjustmentType}';
    ocs_default_adjustment_value \t\t\tTEXT:= \t\t\t'${mandateSettings.adjustmentValue}';
    ocs_default_generate_installment \t\tBOOLEAN:= \t\t${mandateSettings.generateInstallment};
    ocs_default_calculate_installment \t\tBOOLEAN:= \t\t${mandateSettings.calculateInstallment};
    ocs_default_generate_contract_reference BOOLEAN:= \t\t${mandateSettings.generateContractReference};
    ocs_default_contract_reference_format \tTEXT:= \t\t\t'${mandateSettings.referenceFormat}'; -- << CHANGE -- Only change "X".  "X" (including underscore) cannot be more than 8 characters. The asterisk will be replaced by a randomly generated string when mandate is created
\tocs_default_scheme \t\t\t\t\t\tTEXT:= \t\t\t'${mandateSettings.scheme}';
`;
    }

    // Add script variables section
    sqlScript += `
-- END OF SETUP SECTION
-------------------------



-------------------------
-- FOR SCRIPT USE ONLY
-- These are generated / used within the script !! DONT CHANGE !!!
    parent_identifier TEXT;
    integration_entity_identifier TEXT;
    device_user_entity_identifier TEXT;
    integration_entity_description TEXT;
    device_user_entity_description TEXT;
    entity_password TEXT;
    entity_service_type TEXT[];
    var_entity_service_type_id INT;
    entity_service_type_setting TEXT[];
    entity_scopes TEXT := '';
    scope_identifier TEXT;
\tsetting_entity TEXT;
    setting_identifier TEXT;
    setting_scope_identifier TEXT;
\tsetting_entity_identifier TEXT;
\tsetting_entity_type TEXT;
\tentity_setting TEXT[];
    rate_limit BOOLEAN;
    limit_count INTEGER;
    limit_period TEXT;
\tsetting_value jsonb := '{}'::jsonb;
  \tmandate_default_details jsonb := '{}'::jsonb;
\tmanual_payments_reference_field_values jsonb := '{}'::jsonb;
 \tinserted_count integer;
\trows_affected integer;
    action_taken text;
\t_current_value TEXT;
\t_new_value TEXT;
\t_service_type_id INT;
\t_results TEXT[][];
\t_result TEXT[];
\t_parsed jsonb;
\t_textObj TEXT;

BEGIN
`;

    // Add the main logic from the template SQL script
    sqlScript += `\tFOREACH entity_setting SLICE 1 IN ARRAY entity_settings
\t\tLOOP
\t\t\tSELECT entity_setting[1]::TEXT into setting_scope_identifier;
\t\t\tSELECT entity_setting[2]::TEXT into setting_entity;
\t\t\tSELECT entity_setting[3]::TEXT into setting_identifier;
\t\t\tSELECT to_jsonb(entity_setting[4]) into setting_value;

\t\t\tIF lower(setting_identifier) ='ocs.ed.ws.usr' THEN
\t\t\t\tentity_settings := entity_settings || array[
\t\t\t\t\t[setting_scope_identifier,\tsetting_entity,\t'webservice.username',\ttrim(both '"' from setting_value::TEXT)]  -- VALIDATED
\t\t\t\t];
\t\t\tEND IF;

\t\t\tIF lower(setting_identifier) = 'ocs.ed.ws.pwd' THEN
\t\t\t\tentity_settings := entity_settings || array[
\t\t\t\t\t[setting_scope_identifier,\tsetting_entity,\t'webservice.password',\ttrim(both '"' from setting_value::TEXT)]  -- VALIDATED
\t\t\t\t];
\t\t\tEND IF;
\t\tEND LOOP;

`;

    if (selectedScopes.includes('OCS')) {
        sqlScript += `
\t\tmandate_default_details := jsonb_build_object(
\t\t\t'mandateType', ocs_default_mandate_type,
\t\t\t'debitClassification', ocs_default_debit_classification,
\t\t\t'maximumInstallmentAmount', ocs_default_max_installment_amount,
\t\t\t'frequency', ocs_default_frequency,
\t\t\t'tracking', ocs_default_tracking_enabled,
\t\t\t'dateAdjustmentAllowed', ocs_default_date_adjustment_allowed,
\t\t\t'adjustmentFrequency', ocs_default_adjustment_frequency,
\t\t\t'adjustmentType', ocs_default_adjustment_type,
\t\t\t'adjustmentValue', ocs_default_adjustment_value,
\t\t\t'generateInstallment', ocs_default_generate_installment,
\t\t\t'calculateInstallment', ocs_default_calculate_installment,
            'scheme', ocs_default_scheme
\t\t);


\t-- Add optional values to the ocs.ed.mandate.default.details object
\tIF ocs_default_scheme IS NOT NULL AND ocs_default_scheme != '' THEN
\t\tmandate_default_details := mandate_default_details || jsonb_build_object('scheme', ocs_default_scheme);
    END IF;

\tIF ocs_default_generate_contract_reference IS NOT NULL THEN
\t\tmandate_default_details := mandate_default_details || jsonb_build_object('generateContractReference', ocs_default_generate_contract_reference);
    END IF;

\tIF ocs_default_contract_reference_format IS NOT NULL THEN
\t\tmandate_default_details := mandate_default_details || jsonb_build_object('referenceFormat', ocs_default_contract_reference_format);
    END IF;


`;
    }

    sqlScript += `\t-- Build & validate the manual.payments.reference.config json object
\tif manual_payments_reference_fields IS NOT NULL THEN
        IF manual_payments_reference_fields = true THEN
            IF manual_payments_customer_reference IS NOT NULL AND lower(manual_payments_customer_reference) NOT IN ('enabled', 'disabled', 'required') THEN
                RAISE EXCEPTION 'Invalid value for manual_payments_customer_reference: "%". Allowed values: enabled, disabled, required.', manual_payments_customer_reference;
            END IF;

            IF manual_payments_internal_reference IS NOT NULL
            AND lower(manual_payments_internal_reference) NOT IN ('enabled', 'disabled', 'required') THEN RAISE EXCEPTION 'Invalid value for manual_payments_internal_reference: "%". Allowed values: enabled, disabled, required.', app_manual_payments_reference_internal;
            END IF;
        ELSE
            manual_payments_customer_reference := 'disabled';
            manual_payments_internal_reference:= 'disabled';
        END IF;
\t    manual_payments_reference_field_values := jsonb_build_object(
\t\t    'app.manual.payments.reference.customer', manual_payments_customer_reference,
\t\t    'app.manual.payments.reference.internal', manual_payments_internal_reference
\t\t);
\tEND IF;

-------------------------
\t-- Entities Setup
\t\tSELECT parent_name || ' :Integrator' into integration_entity_description; -- Assuming we following the naming convention of "MY CUSTOMER :Integrator"
\t\tSELECT device_user_username into device_user_entity_description; -- Assuming we following the naming convention of "MY CUSTOMER :Device User"
\t\tSELECT UPPER(uuid_generate_v4()::varchar) into parent_identifier;
\t    SELECT uuid_generate_v4()::varchar into integration_entity_identifier;
\t    SELECT uuid_generate_v4()::varchar into device_user_entity_identifier;
\t    SELECT uuid_generate_v4()::varchar into entity_password;
\t    \t\t
\t\t-- Parent Entity Setup
\t\t\t-- Only insert a parent record if the "parent_name" is not already in public.entity
\t\t\tINSERT INTO public.entity (description, identifier, lookup_entity_type_id, active)
\t\t\t\tSELECT parent_name, parent_identifier, 1, true
\t\t\t\tWHERE NOT EXISTS(
\t\t\t\t\tSELECT id FROM public.entity WHERE lower(description) = lower(parent_name)
\t\t\t\t);
\t\t\t\t
\t\t\t-- Regardless of the insert statement outcome, we need to get identifier related to the "parent_name" (incase it was not inserted and we need to get the existing identifier)\t
\t\t\tSELECT identifier INTO parent_identifier FROM public.entity WHERE lower(description) = lower(parent_name);
\t\t\t\t
\t\t-- Integrator Entity Setup
\t\t\t-- Only insert a record if the "integration_entity_description" is not already in public.entity
\t\t\tINSERT INTO public.entity (description, identifier, lookup_entity_type_id, active, parent_id)
\t\t\tSELECT\tintegration_entity_description
\t\t\t\t\t,integration_entity_identifier
\t\t\t\t\t,(select id from lookup_entity_type where description = 'Integrator') as lookupEntityTypeId\t\t\t
\t\t\t\t\t,true
\t\t\t\t\t,(select id from entity where identifier = parent_identifier) as entityParentId\t\t\t
\t\t\tWHERE NOT EXISTS(
\t\t        SELECT id FROM public.entity WHERE lower(description) = lower(integration_entity_description)
\t\t    );\t
\t\t
\t\t\t-- Regardless of the insert statement outcome, we need to get identifier related to the "integration_entity_description" (incase it was not inserted and we need to get the existing identifier)\t\t
\t\t\tSELECT identifier INTO integration_entity_identifier FROM public.entity WHERE lower(description) = lower(integration_entity_description);
\t   \t\t
\t\t\t-- Integrator Entity Credentials
\t\t\tINSERT INTO public.integrator (entity_id, client_secret, email_address, active)
\t\t\tselect \t(select id from entity where identifier = integration_entity_identifier) as entityId\t
\t\t\t\t\t,(select encode(digest(entity_password::bytea,'sha256'),'base64')) as client_secret
\t\t\t\t\t,'development@bitventure.co.za'
\t\t\t\t\t,true
\t\t\tWHERE NOT EXISTS(
\t\t        SELECT i.id FROM public.integrator i
\t\t\t\t\tINNER JOIN public.entity e ON e.id = i.entity_id\t\t\t
\t\t\t\tWHERE lower(e.identifier) = lower(integration_entity_identifier)
\t\t    );\t\t
\t
\t\t-- Device User Setup
\t\t\t-- Only insert a record if the "device_user_entity_description" is not already in public.entity
\t\t    IF create_device_user THEN
\t\t        INSERT INTO public.entity (description, identifier, lookup_entity_type_id, active, parent_id)
\t\t        SELECT\tdevice_user_entity_description
\t\t                ,device_user_entity_identifier
\t\t                ,(select id from lookup_entity_type where description = 'User') as lookupEntityTypeId\t\t\t
\t\t                ,true
\t\t                ,(select id from entity where identifier = parent_identifier) as entityParentId\t\t\t
\t\t        WHERE NOT EXISTS(
\t\t            SELECT id FROM public.entity WHERE lower(description) = lower(device_user_entity_description)
\t\t        );\t
\t\t
\t\t        -- Regardless of the insert statement outcome, we need to get identifier related to the "device_user_entity_description" (incase it was not inserted and we need to get the existing identifier)\t\t
\t\t        SELECT identifier INTO device_user_entity_identifier FROM public.entity WHERE lower(description) = lower(device_user_entity_description);
\t\t
\t\t        -- Device user credentials
\t\t        INSERT INTO public.user (entity_id, username, password, email_address, active)
\t\t        select \t(select id from entity where identifier = device_user_entity_identifier) as entity_id\t
\t\t        , device_user_username as username\t
\t\t                ,(select encode(digest(device_user_password::bytea,'sha256'),'base64')) as password
\t\t                ,device_user_email_address as email_address
\t\t                ,device_user_is_active as active
\t\t        WHERE NOT EXISTS(
\t\t            SELECT i.id FROM public.user i
\t\t                INNER JOIN public.entity e ON e.id = i.entity_id\t\t\t
\t\t            WHERE lower(e.identifier) = lower(device_user_entity_identifier)
\t\t        );\t
\t\t    END IF;
\t-- End Entities Setup
-------------------------

-------------------------
\t-- Entity Service Types Setup
\tFOREACH entity_service_type SLICE 1 IN ARRAY entity_service_types
\tLOOP
\t\tSELECT upper(entity_service_type[1]) into scope_identifier;\t
\t\tSELECT entity_service_type[2]::BOOLEAN into rate_limit;
\t\tSELECT entity_service_type[3]::INTEGER into limit_count;
\t\tSELECT entity_service_type[4] into limit_period;
\t\t
\t\tRAISE notice 'Scope: %', scope_identifier;
\t\t
\t\tSELECT entity_scopes || ' ' || lower(scope_identifier) into entity_scopes;

\t\t-- Add the Service Type to the parent entity if it does not exist
\t\tWITH serviceType (id) AS (
\t\t\tSELECT id FROM service_type st WHERE upper(st.identifier) = upper(scope_identifier)
\t\t)
\t\tINSERT INTO public.entity_service_type (entity_id, service_type_id, active)
\t\t\tSELECT \t(SELECT e.ID FROM entity e WHERE identifier = parent_identifier) as entityId
\t\t\t\t\t,st.id
\t\t\t\t\t,true
\t\t\tFROM \tserviceType st
\t\t\tWHERE NOT EXISTS(
\t\t\t\tSELECT e.id FROM entity e \t\t\t
\t\t\t\t\tINNER JOIN entity_service_type est ON est.entity_id = e.id
\t\t\t\t\tINNER JOIN service_type st ON st.id = est.service_type_id
\t\t\t\tWHERE e.identifier = parent_identifier
\t\t\t\t\tAND upper(st.identifier) = upper(scope_identifier))\t
\t\t\t\t\tRETURNING 1 INTO inserted_count;

\t\t-- Add the Service to the parent entity if it does not exist
\t\t-- The Parent must have all its "children" services (ideally if a parent does not have the service, the service should be disallowed for the child).
\t\tIF rate_limit THEN
\t\t\tWITH service (id) AS (
\t\t\t\tSELECT s.id
\t\t\t\tFROM service s
\t\t\t\tWHERE s.service_type_id  in (
\t\t\t\t\tSELECT id FROM service_type st WHERE upper(st.identifier) = upper(scope_identifier)
\t\t\t\t)
\t\t\t)
\t\t\tINSERT INTO public.entity_service (entity_id, service_id, active, rate_limit, limit_count, limit_period)
\t\t\t\tSELECT \t(SELECT e.ID FROM entity e WHERE identifier = parent_identifier) as entityId
\t\t\t\t\t\t,s.id
\t\t\t\t\t\t,true
\t\t\t\t\t\t,true
\t\t\t\t\t\t,limit_count
\t\t\t\t\t\t,limit_period
\t\t\t\tFROM \tservice s
\t\t\t\tWHERE NOT EXISTS(
\t\t\t\t\tSELECT s.id from service s\t\t\t
\t\t\t\t\t\tINNER JOIN entity_service es ON es.service_id = s.id
\t\t\t\t\t\tINNER JOIN entity e ON e.id = es.entity_id
\t\t\t\t\tWHERE e.identifier = parent_identifier
\t\t\t\t);\t
\t\t\t
\t\tELSE
\t\t\tWITH service (id) AS (
\t\t\t\tSELECT s.id
\t\t\t\tFROM service s
\t\t\t\tWHERE s.service_type_id  in (
\t\t\t\t\tSELECT id FROM service_type st WHERE upper(st.identifier) = upper(scope_identifier)
\t\t\t\t)
\t\t\t)
\t\t\tINSERT INTO public.entity_service (entity_id, service_id, active, rate_limit)
\t\t\t\tSELECT \t(SELECT e.ID FROM entity e WHERE identifier = parent_identifier) as entityId
\t\t\t\t\t\t,s.id ,true,false
\t\t\t\tFROM \tservice s
\t\t\t\tWHERE NOT EXISTS(
\t\t\t\t\tSELECT s.id from service s\t\t\t
\t\t\t\t\t\tINNER JOIN entity_service es ON es.service_id = s.id
\t\t\t\t\t\tINNER JOIN entity e ON e.id = es.entity_id
\t\t\t\t\tWHERE e.identifier = parent_identifier
\t\t\t\t);
\t\tEND IF;\t

\t-- End Entity Service Types Setup
-------------------------

------------------------
\t-- Entity Service Type Settings Setup
\t\tRAISE NOTICE '\tSettings:';
\t\tFOREACH entity_setting SLICE 1 IN ARRAY entity_settings
\t\tLOOP
\t\t\tSELECT entity_setting[1]::TEXT into setting_scope_identifier;
\t\t\tSELECT entity_setting[2]::TEXT into setting_entity;
\t\t\tSELECT entity_setting[3]::TEXT into setting_identifier;
\t\t\tSELECT to_jsonb(entity_setting[4]) into setting_value;
\t\t\t
\t\t\tCASE
\t\t\t    WHEN upper(setting_entity) = 'P' THEN
\t\t\t        setting_entity_type := 'Parent';
\t\t\t\t\tsetting_entity_identifier := parent_identifier;
\t\t\t    WHEN upper(setting_entity) = 'D' THEN
\t\t\t        setting_entity_type := 'User';
\t\t\t\t\tsetting_entity_identifier := device_user_entity_identifier;
\t\t\t    WHEN upper(setting_entity) = 'I' THEN
\t\t\t        setting_entity_type := 'Integrator';
\t\t\t\t\tsetting_entity_identifier := integration_entity_identifier;
\t\t\t    ELSE
\t\t\t        setting_entity_type := '';
\t\t\t\t\tsetting_entity_identifier := '';
\t\t\tEND CASE;

\t\t
\t\t\t_service_type_id := (SELECT e.id from entity e \t\t\t
\t\t\t\t\t\t\t\tINNER JOIN entity_service_type est ON est.entity_id = e.id
\t\t\t\t\t\t\t\tINNER JOIN service_type st ON st.id = est.service_type_id
\t\t\t\t\t\t\tWHERE e.identifier = setting_entity_identifier
\t\t\t\t\t\t\t\tAND upper(st.identifier) = upper(scope_identifier));

\t\t\t-- Add the Service Type to the child entity if it does not exist
\t\t\tif _service_type_id is null or _service_type_id <= 0 THEN
\t\t\t\tWITH serviceType (id) AS (
\t\t\t\t\tSELECT id FROM service_type st WHERE upper(st.identifier) = upper(scope_identifier)
\t\t\t\t)
\t\t\t\tINSERT INTO public.entity_service_type (entity_id, service_type_id, active)
\t\t\t\t\tSELECT \t(SELECT e.ID FROM entity e WHERE identifier = setting_entity_identifier) as entityId
\t\t\t\t\t\t\t,st.id
\t\t\t\t\t\t\t,true
\t\t\t\t\tFROM \tserviceType st
\t\t\t\t\tWHERE NOT EXISTS(
\t\t\t\t\t\tSELECT e.id from entity e \t\t\t
\t\t\t\t\t\t\tINNER JOIN entity_service_type est ON est.entity_id = e.id
\t\t\t\t\t\t\tINNER JOIN service_type st ON st.id = est.service_type_id
\t\t\t\t\t\tWHERE e.identifier = setting_entity_identifier
\t\t\t\t\t\t\tAND upper(st.identifier) = upper(scope_identifier))
\t\t\t\t\t\t\tRETURNING 1 INTO inserted_count;
\t\t\t
\t\t\t\t-- For the sake of the script we just add all the services associated to the service type\t\t
\t\t\t\tIF rate_limit THEN
\t\t\t\t\tWITH service (id) AS (
\t\t\t\t\t\tSELECT s.id
\t\t\t\t\t\tFROM service s
\t\t\t\t\t\tWHERE s.service_type_id  in (
\t\t\t\t\t\t\tSELECT id FROM service_type st WHERE upper(st.identifier) = upper(scope_identifier)
\t\t\t\t\t\t)
\t\t\t\t\t)
\t\t\t\t\tINSERT INTO public.entity_service (entity_id, service_id, active, rate_limit, limit_count, limit_period)
\t\t\t\t\t\tSELECT \t(SELECT e.ID FROM entity e WHERE identifier = setting_entity_identifier) as entityId
\t\t\t\t\t\t\t\t,s.id
\t\t\t\t\t\t\t\t,true
\t\t\t\t\t\t\t\t,true
\t\t\t\t\t\t\t\t,limit_count
\t\t\t\t\t\t\t\t,limit_period
\t\t\t\t\t\tFROM \tservice s
\t\t\t\t\t\tWHERE NOT EXISTS(
\t\t\t\t\t\t\tSELECT s.id from service s\t\t\t
\t\t\t\t\t\t\t\tINNER JOIN entity_service es ON es.service_id = s.id
\t\t\t\t\t\t\t\tINNER JOIN entity e ON e.id = es.entity_id
\t\t\t\t\t\t\tWHERE e.identifier = setting_entity_identifier
\t\t\t\t\t\t);\t
\t\t\t\t\t
\t\t\t\tELSE
\t\t\t\t
\t\t\t\t\tWITH service (id) AS (
\t\t\t\t\t\tSELECT s.id
\t\t\t\t\t\tFROM service s
\t\t\t\t\t\tWHERE s.service_type_id  in (
\t\t\t\t\t\t\tSELECT id FROM service_type st WHERE upper(st.identifier) = upper(scope_identifier)
\t\t\t\t\t\t)
\t\t\t\t\t)
\t\t\t\t\tINSERT INTO public.entity_service (entity_id, service_id, active, rate_limit)
\t\t\t\t\t\tSELECT \t(SELECT e.ID FROM entity e WHERE identifier = setting_entity_identifier) as entityId
\t\t\t\t\t\t\t\t,s.id
\t\t\t\t\t\t\t\t,true
\t\t\t\t\t\t\t\t,false
\t\t\t\t\t\tFROM \tservice s
\t\t\t\t\t\tWHERE NOT EXISTS(
\t\t\t\t\t\t\tSELECT s.id from service s\t\t\t
\t\t\t\t\t\t\t\tINNER JOIN entity_service es ON es.service_id = s.id
\t\t\t\t\t\t\t\tINNER JOIN entity e ON e.id = es.entity_id
\t\t\t\t\t\t\tWHERE e.identifier = setting_entity_identifier
\t\t\t\t\t\t);
\t\t\t\t\t\t
\t\t\t\tEND IF;\t
\t\t\tEND IF;

\t\t\t-- VALIDATED
\t\t\tIF lower(setting_identifier) IN ('webservice.username', 'webservice.password') THEN
\t\t\t\tINSERT INTO public.entity_service_setting (entity_service_id, identifier, value)
\t\t\t\t\tSELECT
\t\t\t\t\t\t(SELECT es.id
\t\t\t\t\t\tFROM entity_service es
\t\t\t\t\t\tWHERE es.entity_id = (SELECT e.id FROM entity e WHERE e.identifier = setting_entity_identifier)
\t\t\t\t\t\tAND es.service_id = (SELECT s.id FROM service s WHERE s.identifier = 'tca.services.mca')) AS entity_service_id,
\t\t\t\t\t\tsetting_identifier,
\t\t\t\t\t\ttrim(both '"' from setting_value::TEXT)
\t\t\t\t\tWHERE NOT EXISTS (
\t\t\t\t\t\tSELECT 1
\t\t\t\t\t\tFROM entity_service_setting ess
\t\t\t\t\t\tWHERE ess.entity_service_id = (
\t\t\t\t\t\t\tSELECT es.id
\t\t\t\t\t\t\tFROM entity_service es
\t\t\t\t\t\t\tWHERE es.entity_id = (SELECT e.id FROM entity e WHERE e.identifier = setting_entity_identifier)
\t\t\t\t\t\t\tAND es.service_id = (SELECT s.id FROM service s WHERE s.identifier = 'tca.services.mca')
\t\t\t\t\t\t)
\t\t\t\t\t\tAND ess.identifier = setting_identifier
\t\t\t\t\t);
\t\t\tELSE
\t\t\t\tIF lower(setting_identifier) IN ('ocs.easy.loan.webhook.url') THEN

\t\t\t\t\tINSERT INTO public.entity_service (entity_id, service_id, active, rate_limit, limit_count, limit_period)
                    WITH target_entity AS (
                        SELECT id
                        FROM entity
                        WHERE identifier = setting_entity_identifier
                    ),
                    services_to_add AS (
                        SELECT id
                        FROM service
                        WHERE identifier IN ('ocs.services.collection', 'ocs.services.mandate', 'ocs.services.debitorder')
                    )
                    SELECT
                        te.id AS entity_id,
                        sta.id AS service_id,
                        true AS active,
                        true AS rate_limit,
                        NULL AS limit_count,
                        NULL AS limit_period
                    FROM
                        target_entity te,
                        services_to_add sta
                    WHERE NOT EXISTS (
                        SELECT 1
                        FROM public.entity_service es
                        WHERE es.entity_id = te.id
                        AND es.service_id = sta.id
                    );

\t\t\t\t\tINSERT INTO public.entity_service_setting (entity_service_id, identifier, value)
                    WITH target_entity_service AS (
                        SELECT
                            es.id
                        FROM
                            public.entity_service es
                        JOIN
                            public.entity e ON e.id = es.entity_id
                        JOIN
                            public.service s ON s.id = es.service_id
                        WHERE
                            e.identifier = setting_entity_identifier
                            AND s.identifier IN ('ocs.services.collection', 'ocs.services.mandate', 'ocs.services.debitorder')
                    )
                    SELECT
                        tes.id AS entity_service_id,
                        setting_identifier AS identifier,
                        trim(both '"' FROM setting_value::TEXT) AS setting_value
                    FROM
                        target_entity_service tes
                    WHERE NOT EXISTS (
                        SELECT 1
                        FROM public.entity_service_setting ess
                        WHERE ess.entity_service_id = tes.id
                        AND ess.identifier = setting_identifier
                    );
\t\t\t\tELSE
\t        SELECT upper(setting_scope_identifier) into setting_scope_identifier;
\t\t\t-- Check if the setting scope matches the service type scope
\t\t\t-- If it does then we can proceed to add the setting to the entity\t
\t\t\tIF upper(scope_identifier) = upper(setting_scope_identifier) THEN
\t\t\t\tSELECT setting_identifier::TEXT into setting_identifier;
\t\t\t\tSELECT setting_value::jsonb into setting_value;


\t\t\t\t-- Add the Service Type to the parent entity if it does not exist
\t\t\t\tWITH serviceType (id) AS (SELECT id FROM service_type st WHERE upper(st.identifier) = upper(scope_identifier))
\t\t\t\tINSERT INTO public.entity_service_type (entity_id, service_type_id, active)
\t\t\t\tSELECT \t(SELECT e.ID FROM entity e WHERE identifier = parent_identifier) as entityId
\t\t\t\t\t\t,st.id
\t\t\t\t\t\t,true
\t\t\t\tFROM \tserviceType st
\t\t\t\tWHERE NOT EXISTS(
\t\t\t\t\tSELECT e.id FROM entity e \t\t\t
\t\t\t\t\t\tINNER JOIN entity_service_type est ON est.entity_id = e.id
\t\t\t\t\t\tINNER JOIN service_type st ON st.id = est.service_type_id
\t\t\t\t\tWHERE e.identifier = parent_identifier
\t\t\t\t\t\tAND upper(st.identifier) = upper(scope_identifier));


\t\t\t\tSELECT (
\t\t\t\t\tSELECT est.ID
\t\t\t\t\tfrom entity_service_type est
\t\t\t\t\twhere est.entity_id =
\t\t\t\t\t\t(select e.ID from entity e where identifier = setting_entity_identifier)
\t\t\t\t\t\tand est.service_type_id =
\t\t\t\t\t\t(select st.ID from service_type st where upper(st.identifier) = upper(scope_identifier))
\t\t\t\t) into var_entity_service_type_id;
\t\t
\t\t\t\t
\t\t\t\t-- Assign the JSON objects to the relevant service type setting fields
\t\t\t\tCASE WHEN lower(setting_identifier) = 'ocs.ed.mandate.default.details' THEN
\t\t\t\t\tsetting_value := mandate_default_details;
\t\t\t\tWHEN lower(setting_identifier) = 'manual.payments.reference.config' THEN
\t\t\t\t\tsetting_value := manual_payments_reference_field_values;
\t\t\t\tELSE
\t\t\t\t\tsetting_value := setting_value;
\t\t\t\tEND CASE;
\t\t
\t\t\t\t-- Check the current value and new value so that we can determine if it's an update or insert
\t\t\t\t_current_value := (SELECT value FROM public.entity_service_type_setting WHERE lower(identifier) = lower(setting_identifier) AND entity_service_type_id = var_entity_service_type_id limit 1);
\t\t\t\t_new_value := trim(both '"' from setting_value::TEXT);\t
\t\t


\t\t\t\tIF setting_identifier IN ('ocs.ed.mandate.default.details', 'manual.payments.reference.config') OR (setting_identifier LIKE '%.map' and _new_value <> '') THEN
\t\t\t\t\tIF _current_value::text LIKE '%\\\"%' THEN
\t\t\t\t\t\t_current_value := replace(replace(_current_value::text, '\"', '"'), '\\', '');
\t\t\t\t\tEND IF;

\t\t\t\t\tIF _new_value::text LIKE '%\\\"%' THEN
\t\t\t\t\t\t_new_value := replace(replace(_new_value::text, '\"', '"'), '\\', '');
\t\t\t\t\tEND IF;
\t\t\t\t\t
\t\t\t\t\tif jsonb_typeof(_current_value::jsonb) = 'array' or jsonb_typeof(_new_value::jsonb) = 'array' THEN
\t\t\t\t\t\t-- Normalize both arrays before merging and deduplicating
\t\t\t\t\t\tWITH current_elements AS (
\t\t\t\t\t\t  SELECT jsonb_object_agg(k, v) AS obj
\t\t\t\t\t\t  FROM jsonb_array_elements(_current_value::jsonb) elem,
\t\t\t\t\t\t       jsonb_each(elem) AS t(k, v)
\t\t\t\t\t\t  GROUP BY elem
\t\t\t\t\t\t),
\t\t\t\t\t\tnew_elements AS (
\t\t\t\t\t\t  SELECT jsonb_object_agg(k, v) AS obj
\t\t\t\t\t\t  FROM jsonb_array_elements(_new_value::jsonb) elem,
\t\t\t\t\t\t       jsonb_each(elem) AS t(k, v)
\t\t\t\t\t\t  GROUP BY elem
\t\t\t\t\t\t),
\t\t\t\t\t\tcombined AS (
\t\t\t\t\t\t  SELECT obj FROM current_elements
\t\t\t\t\t\t  UNION
\t\t\t\t\t\t  SELECT obj FROM new_elements
\t\t\t\t\t\t)
\t\t\t\t\t\tSELECT jsonb_agg(obj) INTO _new_value FROM combined;
\t\t\t\t\tEND IF;

\t\t\t\t\tIF _current_value IS NULL THEN
\t\t\t\t\t\t_new_value := _new_value::jsonb;
\t\t\t\t\tELSE
\t\t\t\t\t\tIF (_current_value <> _new_value) THEN
\t\t\t\t\t\t_new_value := COALESCE(_current_value::jsonb, '{}'::jsonb) || _new_value::jsonb;
\t\t\t\t\t\tELSE
\t\t\t\t\t\t_new_value := _new_value::jsonb;
\t\t\t\t\t\tEND IF;
\t\t\t\t\tEND IF;
\t\t\t\t\tsetting_value = _new_value;
\t\t\t\tend if;
\t\t\t\t\t

\t\t\t\t-- When the current value doesn't exist then insert it\t\t\t\t\t\t\t\t\t
\t\t\t\tIF _current_value IS NULL THEN
\t\t\t\t\taction_taken:= 'Inserted';
\t\t\t\t\tINSERT INTO public.entity_service_type_setting
\t\t\t\t\t\t(entity_service_type_id, identifier, value)
\t\t\t\t\tSELECT
\t\t\t\t\t\tvar_entity_service_type_id,
\t\t\t\t\t\tsetting_identifier,
\t\t\t\t\t\tCASE
\t\t\t\t\t\t\tWHEN jsonb_typeof(setting_value::jsonb) IN ('string', 'number', 'boolean')
\t\t\t\t\t\t\tTHEN trim(both '"' from setting_value::TEXT)
\t\t\t\t\t\t\tELSE setting_value::TEXT
\t\t\t\t\t\tEND
\t\t\t\t\tWHERE NOT EXISTS(
\t\t\t\t\t\tSELECT 1
\t\t\t\t\t\tFROM public.entity_service_type_setting
\t\t\t\t\t\tWHERE lower(identifier) = lower(setting_identifier)
\t\t\t\t\t\tAND entity_service_type_id = var_entity_service_type_id
\t\t\t\t\t);
\t\t\t\tELSE
\t\t\t\t\t-- When the current value exists but differs to the new value then update it\t
\t\t\t\t\tIF _current_value <> _new_value THEN
\t\t\t\t\t\taction_taken:= 'Updated';
\t\t\t\t\t\tUPDATE public.entity_service_type_setting
\t\t\t\t\t\tSET value = CASE
\t\t\t\t\t\t\t\t\tWHEN jsonb_typeof(setting_value::jsonb) IN ('string', 'number', 'boolean')
\t\t\t\t\t\t\t\t\tTHEN trim(both '"' from setting_value::TEXT)
\t\t\t\t\t\t\t\t\tELSE setting_value::TEXT
\t\t\t\t\t\t\t\t\tEND
\t\t\t\t\t\tWHERE lower(identifier) = lower(setting_identifier) AND entity_service_type_id = var_entity_service_type_id AND lower(value::TEXT) <> lower(setting_value::TEXT);
\t\t\t\t\t-- When the current value is the same as the value then just log it
\t\t\t\t\tELSE
\t\t\t\t\t\taction_taken:= 'No change';
\t\t\t\t\tEND IF;
\t\t\t\tEND IF ;
\t            END IF;
            END IF;

\t\t\t
\t\t\t\t\t
\t\t

\t\t\t\t-- Log the action taken
\t\t\t\tRAISE NOTICE '\t\t%', FORMAT(
\t\t\t\t\t'%s%s%s%s%s',
\t\t\t\t\tRPAD(scope_identifier::TEXT, 5),
\t\t\t\t\tRPAD(setting_entity_type::TEXT, 10),
\t\t\t\t\tRPAD(setting_identifier::TEXT,     40),
\t\t\t\t\tRPAD(action_taken::TEXT,    15),
\t\t\t\t\tRPAD(setting_value::TEXT,100)
\t\t\t\t);

\t\t\tEND IF;
\t\tEND LOOP;
\t-- End Entity Service Type Settings Setup
------------------------
\t-- Entity Service Types Setup
\tEND LOOP;\t

_results  := ARRAY[
\t[ 'Entity', 'Name', 'Entity ID',  'Password'],
\t[ RPAD('-', 15, '-'), RPAD('-', 25, '-'),  RPAD('-', 40, '-'), RPAD('-', 40, '-')],
\t[ 'Parent', parent_name,  parent_identifier, 'N/A'\t],
\t[ 'Integrator', integration_entity_description,  integration_entity_identifier,   entity_password\t],
\t[ 'Device User', device_user_entity_description,  device_user_entity_identifier,   device_user_password\t]];
RAISE notice '';

FOREACH _result SLICE 1 IN ARRAY _results
LOOP
\tRAISE NOTICE '%', FORMAT('|%s|%s|%s|%s|',
\t\tRPAD(_result[1], 15),
\t\tRPAD(_result[2], 25),
\t\tRPAD(_result[3]::TEXT, 40),
\t\tRPAD(_result[4]::TEXT, 40)
\t);
END LOOP;


\t\t\t\t\t\t
END $$;
`;

    // ===== DISPLAY THE SCRIPT =====
    $('#sqlOutput').text(sqlScript);
    $('#resultContainer').show();
    $('#scriptOutput').text(sqlScript);

    // Scroll to results
    $('html, body').animate({
        scrollTop: $('#resultContainer').offset().top
    }, 500);

    // Copy button functionality
    $('#copyBtn').off('click').on('click', function() {
        copyToClipboard(sqlScript);
        $(this).html('<i class="fas fa-check me-1"></i> Copied!');
        setTimeout(() => {
            $(this).html('<i class="fas fa-copy me-1"></i> Copy to Clipboard');
        }, 2000);
    });

    console.log('=== Script Generation Complete ===');
}

// ===== HELPER FUNCTIONS =====

function safeRename(str) {
    return str.replace(/\./g, '-').replace(/:/g, '-').replace(/\s/g, '-');
}

function escapeQuotes(str) {
    if (!str) return '';
    return String(str).replace(/'/g, "''");
}

function getSettingValue($element, settingObj) {
    if (!$element || $element.length === 0) return null;

    const type = settingObj?.type || 'text';

    if (type === 'checkbox') {
        return $element.is(':checked') ? 'true' : 'false';
    } else if (type === 'radio') {
        const name = $element.attr('name');
        return $(`input[name="${name}"]:checked`).val() || '';
    } else {
        return $element.val() || '';
    }
}

function collectMandateDefaults() {
    return {
        mandateType: $('#OCS-ocs-services-mandate-ocs-ed-mandate-default-details___mandateType').val() || 'Usage',
        debitClassification: $('#OCS-ocs-services-mandate-ocs-ed-mandate-default-details___debitClassification').val() || 'LRM',
        maximumInstallmentAmount: $('#OCS-ocs-services-mandate-ocs-ed-mandate-default-details___maximumInstallmentAmount').val() || '10000',
        frequency: $('#OCS-ocs-services-mandate-ocs-ed-mandate-default-details___frequency').val() || 'MONTHLY',
        tracking: $('#OCS-ocs-services-mandate-ocs-ed-mandate-default-details___tracking').is(':checked'),
        dateAdjustmentAllowed: $('#OCS-ocs-services-mandate-ocs-ed-mandate-default-details___dateAdjustmentAllowed').val() || 'Y',
        adjustmentFrequency: $('#OCS-ocs-services-mandate-ocs-ed-mandate-default-details___adjustmentFrequency').val() || 'ANNUALLY',
        adjustmentType: $('#OCS-ocs-services-mandate-ocs-ed-mandate-default-details___adjustmentType').val() || 'RATE',
        adjustmentValue: $('#OCS-ocs-services-mandate-ocs-ed-mandate-default-details___adjustmentValue').val() || '1',
        generateInstallment: $('#OCS-ocs-services-mandate-ocs-ed-mandate-default-details___generateInstallment').is(':checked'),
        calculateInstallment: $('#OCS-ocs-services-mandate-ocs-ed-mandate-default-details___calculateInstallment').is(':checked'),
        generateContractReference: $('#OCS-ocs-services-mandate-ocs-ed-mandate-default-details___generateContractReference').is(':checked'),
        referenceFormat: $('#OCS-ocs-services-mandate-ocs-ed-mandate-default-details___referenceFormat').val() || '',
        scheme: $('#OCS-ocs-services-mandate-ocs-ed-mandate-default-details___scheme').val() || ''
    };
}

function copyToClipboard(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(() => {
            console.log('Copied to clipboard');
        }).catch(err => {
            console.error('Failed to copy:', err);
            fallbackCopyToClipboard(text);
        });
    } else {
        fallbackCopyToClipboard(text);
    }
}

function fallbackCopyToClipboard(text) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
        document.execCommand('copy');
        console.log('Copied to clipboard using fallback');
    } catch (err) {
        console.error('Fallback copy failed:', err);
    }
    document.body.removeChild(textArea);
}

function copyScriptToClipboard() {
    const script = $('#scriptOutput').text() || $('#sqlOutput').text();
    copyToClipboard(script);

    const $btn = $('#copyScript');
    const originalText = $btn.text();
    $btn.text('Copied!');
    setTimeout(() => {
        $btn.text(originalText);
    }, 2000);
}
