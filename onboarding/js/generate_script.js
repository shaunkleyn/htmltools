//   // Function to generate the SQL script
//         function generateScript() {
//             const parentName = $('#parentName').val() || '';
//             const website = $('#website').val() || 'http://www.bitventure.co.za';
//             const deviceEmail = $('#deviceEmail').val() || 'development@bitventure.co.za';
//             // const crsEnquiryBy = $('#crsEnquiryBy').val() || parentName;
//             const createDeviceUser = $('#createDeviceUser').is(':checked');
//             const deviceUsername = $('#deviceUsername').val();
//             const devicePassword = $('#devicePassword').val();
//             const createIntegrator = $('#createIntegrator').is(':checked');
//             const integratorName = $('#integratorName').val() || parentName + ' :Integrator';
            
//             // Collect selected scopes and their settings
//             const selectedScopes = [];
//             $('.scope-checkbox-input:checked').each(function() {
//                 const scope = $(this).val();
//                 const rateLimit = $(`#${scope}-rate-limit`).is(':checked');
//                 const limitCount = $(`#${scope}-limit-count`).val() || 'null';
//                 const limitPeriod = $(`#${scope}-limit-period`).val() || 'null';
//                 const linkParent = $(`#${scope}-link-parent`).is(':checked');
//                 const linkDeviceUser = $(`#${scope}-link-device-user`).is(':checked');
//                 const linkIntegrator = $(`#${scope}-link-integrator`).is(':checked');
                
//                 selectedScopes.push({
//                     scope: scope,
//                     rateLimit: rateLimit,
//                     limitCount: limitCount,
//                     limitPeriod: limitPeriod,
//                     linkParent: linkParent,
//                     linkDeviceUser: linkDeviceUser,
//                     linkIntegrator: linkIntegrator
//                 });
//             });
            
//             // Build the entity_service_types array
//             let entityServiceTypesArray = 'array[';
//             selectedScopes.forEach((scopeObj, index) => {
//                 if (scopeObj.linkParent) {
//                     entityServiceTypesArray += `\n\t['${scopeObj.scope}', '${scopeObj.rateLimit}', ${scopeObj.limitCount}, ${scopeObj.limitPeriod}]`;
//                     if (index < selectedScopes.length - 1) {
//                         entityServiceTypesArray += ',';
//                     }
//                 }
//             });
//             entityServiceTypesArray += '\n];';
            
//             // Build the script
//             let script = `-- CREATE EXTENSION IF NOT EXISTS "uuid-ossp";\n\n`;
//             script += `DO $$\n`;
//             script += `-- These need to be supplied\n`;
//             script += `DECLARE parent_name TEXT := '${parentName}';\n`;
//             script += `DECLARE entity_service_types TEXT[] := ${entityServiceTypesArray}\n\n`;
            
            
//             // Add BSS settings if BSS is selected
//             const bssScope = selectedScopes.find(s => s.scope === 'BSS');
//             if (bssScope) {
//                 const bssWebhookUrl = $('#BSS-bss.services.bss-bss.webhook.url').val() || '';
//                 script += `-- BSS Settings \n`;
//                 script += `DECLARE bss_webhook_url TEXT := '${bssWebhookUrl}';\n\n`;
//             }
            
//             // Add CRS settings if CRS is selected
//             const crsScope = selectedScopes.find(s => s.scope === 'CRS');
//             if (crsScope) {
//                 script += `-- CRS Settings \n`;
//                 script += `DECLARE crs_cpb_enquiry_done_by TEXT := '${crsEnquiryBy}';\n\n`;
//             }
            
//             // Add the rest of the script template
//             script += `-- These are generated / used within the script !! DONT CHANGE !!!\n`;
//             script += `DECLARE parent_identifier TEXT;\n`;
//             script += `DECLARE entity_identifier TEXT;\n`;
//             script += `DECLARE entity_description TEXT;\n`;
//             script += `DECLARE entity_password TEXT;\n`;
//             script += `DECLARE entity_service_type TEXT[];\n`;
//             script += `DECLARE entity_scopes TEXT := '';\n\n`;
//             script += `-- entity_service_types array elements !! DONT CHANGE !!!\n`;
//             script += `DECLARE scope_identifier TEXT;\n`;
//             script += `DECLARE rate_limit BOOLEAN;\n`;
//             script += `DECLARE limit_count INTEGER;\n`;
//             script += `DECLARE limit_period TEXT;\n\n`;
//             script += `BEGIN\n`;
//             script += `\t\n`;
//             script += `\tSELECT parent_description || ' :Integrator' into entity_description;\n`;
//             script += `\tSELECT UPPER(uuid_generate_v4()::varchar) into parent_identifier;\n`;
//             script += `    SELECT uuid_generate_v4()::varchar into entity_identifier;\n`;
//             script += `    SELECT uuid_generate_v4()::varchar into entity_password;\n`;
//             script += `    \t\t\n`;
//             script += `\t-- Parent Entity \n`;
//             script += `\t-- Only insert a parent record if the "parent_description" is not already in public.entity \n`;
//             script += `\tINSERT INTO public.entity (description, identifier, lookup_entity_type_id, active)\n`;
//             script += `\t\tSELECT parent_description, parent_identifier, 1, true\n`;
//             script += `\t\tWHERE NOT EXISTS(\n`;
//             script += `\t\t\tSELECT id FROM public.entity WHERE lower(description) = lower(parent_description)\n`;
//             script += `\t\t);\n`;
//             script += `\t\t\n`;
//             script += `\t-- Regardless of the insert statement outcome, we need to get identifier related to the "parent_description"\n`;
//             script += `\tSELECT identifier INTO parent_identifier FROM public.entity WHERE lower(description) = lower(parent_description);\n`;
//             script += `\t\t\n`;
            
//             // Integrator entity creation
//             if (createIntegrator) {
//                 script += `\t-- Entity (Integrator Entity Type)\n`;
//                 script += `\t-- Only insert a record if the "entity_description" is not already in public.entity\n`;
//                 script += `\tINSERT INTO public.entity (description, identifier, lookup_entity_type_id, active, parent_id)\n`;
//                 script += `\tSELECT\tentity_description\n`;
//                 script += `\t\t\t,entity_identifier\n`;
//                 script += `\t\t\t,(select id from lookup_entity_type where description = 'Integrator') as lookupEntityTypeId\n`;
//                 script += `\t\t\t,true\n`;
//                 script += `\t\t\t,(select id from entity where identifier = parent_identifier) as entityParentId\n`;
//                 script += `\tWHERE NOT EXISTS(\n`;
//                 script += `        SELECT id FROM public.entity WHERE lower(description) = lower(entity_description)\n`;
//                 script += `    );\n`;
//                 script += `\n`;
//                 script += `\t-- Regardless of the insert statement outcome, we need to get identifier related to the "entity_description"\n`;
//                 script += `\tSELECT identifier INTO entity_identifier FROM public.entity WHERE lower(description) = lower(entity_description);\n`;
//                 script += `   \t\t\n`;
//                 script += `\t-- Entity (Integrator)\n`;
//                 script += `\tINSERT INTO public.integrator (entity_id, client_secret, email_address, active)\n`;
//                 script += `\tselect \t(select id from entity where identifier = entity_identifier) as entityId\n`;
//                 script += `\t\t\t,(select encode(digest(entity_password,'sha256'),'base64')) as client_secret\n`;
//                 script += `\t\t\t,'${deviceEmail}'\n`;
//                 script += `\t\t\t,true \n`;
//                 script += `\tWHERE NOT EXISTS(\n`;
//                 script += `        SELECT i.id FROM public.integrator i \n`;
//                 script += `\t\t\tINNER JOIN public.entity e ON e.id = i.entity_id\n`;
//                 script += `\t\tWHERE lower(e.identifier) = lower(entity_identifier)\n`;
//                 script += `    );\n`;
//             }
            
//             // Device user creation
//             if (createDeviceUser && deviceUsername && devicePassword) {
//                 script += `\t-- Device User Entity\n`;
//                 script += `\tINSERT INTO public.entity (description, identifier, lookup_entity_type_id, active, parent_id)\n`;
//                 script += `\tSELECT\t'${deviceUsername}'\n`;
//                 script += `\t\t\t,uuid_generate_v4()::varchar\n`;
//                 script += `\t\t\t,(select id from lookup_entity_type where description = 'User') as lookupEntityTypeId\n`;
//                 script += `\t\t\t,true\n`;
//                 script += `\t\t\t,(select id from entity where identifier = parent_identifier) as entityParentId\n`;
//                 script += `\tWHERE NOT EXISTS(\n`;
//                 script += `        SELECT id FROM public.entity WHERE lower(description) = lower('${deviceUsername}')\n`;
//                 script += `    );\n`;
//                 script += `\n`;
//                 script += `\t-- Device User Credentials\n`;
//                 script += `\tINSERT INTO public.user (entity_id, username, password, email_address, active)\n`;
//                 script += `\tselect \t(select id from entity where description = '${deviceUsername}') as entity_id\n`;
//                 script += `\t\t\t,'${deviceUsername}' as username\n`;
//                 script += `\t\t\t,(select encode(digest('${devicePassword}'::bytea,'sha256'),'base64')) as password\n`;
//                 script += `\t\t\t,'${deviceEmail}' as email_address\n`;
//                 script += `\t\t\t,true as active \n`;
//                 script += `\tWHERE NOT EXISTS(\n`;
//                 script += `        SELECT i.id FROM public.user i \n`;
//                 script += `\t\t\tINNER JOIN public.entity e ON e.id = i.entity_id\n`;
//                 script += `\t\tWHERE lower(e.description) = lower('${deviceUsername}')\n`;
//                 script += `    );\n`;
//             }
            
//             script += `\t\t\n`;
//             script += `\tFOREACH entity_service_type SLICE 1 IN ARRAY entity_service_types\n`;
//             script += `\tLOOP\n`;
//             script += `\t\n`;
//             script += `\t\tSELECT upper(entity_service_type[1]) into scope_identifier;\n`;
//             script += `\t\tSELECT entity_service_type[2]::BOOLEAN into rate_limit;\n`;
//             script += `\t\tSELECT entity_service_type[3]::INTEGER into limit_count;\n`;
//             script += `\t\tSELECT entity_service_type[4] into limit_period;\n`;
//             script += `\t\t\n`;
//             script += `\t\tRAISE notice 'Adding: % % % %', scope_identifier, rate_limit, limit_count, limit_period;\n`;
//             script += `\t\t\n`;
//             script += `\t\tSELECT entity_scopes || ' ' || lower(scope_identifier) into entity_scopes; \n`;
//             script += `\t\t\n`;
//             script += `\t\t-- PARENT ENTITY\n`;
//             script += `\t\tRAISE notice 'Configuring Parent Entity: %', parent_identifier;\n`;
//             script += `\t\t\n`;
//             script += `\t\t-- Add the Service Type to the parent entity if it does not exist\n`;
//             script += `\t\tWITH serviceType (id) AS (\n`;
//             script += `\t\t\tSELECT id FROM service_type st WHERE upper(st.identifier) = upper(scope_identifier)\n`;
//             script += `\t\t)\n`;
//             script += `\t\tINSERT INTO public.entity_service_type (entity_id, service_type_id, active)\n`;
//             script += `\t\t\tSELECT \t(SELECT e.ID FROM entity e WHERE identifier = parent_identifier) as entityId\n`;
//             script += `\t\t\t\t\t,st.id \n`;
//             script += `\t\t\t\t\t,true\n`;
//             script += `\t\t\tFROM \tserviceType st\n`;
//             script += `\t\t\tWHERE NOT EXISTS(\n`;
//             script += `\t\t\t\tSELECT e.id FROM entity e \n`;
//             script += `\t\t\t\t\tINNER JOIN entity_service_type est ON est.entity_id = e.id\n`;
//             script += `\t\t\t\t\tINNER JOIN service_type st2 ON st2.id = est.service_type_id\n`;
//             script += `\t\t\t\tWHERE e.identifier = parent_identifier\n`;
//             script += `\t\t\t\t\tAND upper(st2.identifier) = upper(scope_identifier)\n`;
//             script += `\t\t\t);\n`;
//             script += `\t\t\t\n`;
            
//             // Add service types to integrator if linked
//             selectedScopes.forEach(scopeObj => {
//                 if (scopeObj.linkIntegrator && createIntegrator) {
//                     script += `\t\t-- Add ${scopeObj.scope} to Integrator\n`;
//                     script += `\t\tWITH serviceType (id) AS (\n`;
//                     script += `\t\t\tSELECT id FROM service_type st WHERE upper(st.identifier) = upper('${scopeObj.scope}')\n`;
//                     script += `\t\t)\n`;
//                     script += `\t\tINSERT INTO public.entity_service_type (entity_id, service_type_id, active, rate_limit, rate_limit_count, rate_limit_period)\n`;
//                     script += `\t\t\tSELECT \t(SELECT e.ID FROM entity e WHERE identifier = entity_identifier) as entityId\n`;
//                     script += `\t\t\t\t\t,st.id \n`;
//                     script += `\t\t\t\t\t,true\n`;
//                     script += `\t\t\t\t\t,${scopeObj.rateLimit}\n`;
//                     script += `\t\t\t\t\t,${scopeObj.limitCount}\n`;
//                     script += `\t\t\t\t\t,${scopeObj.limitPeriod}\n`;
//                     script += `\t\t\tFROM \tserviceType st\n`;
//                     script += `\t\t\tWHERE NOT EXISTS(\n`;
//                     script += `\t\t\t\tSELECT e.id FROM entity e \n`;
//                     script += `\t\t\t\t\tINNER JOIN entity_service_type est ON est.entity_id = e.id\n`;
//                     script += `\t\t\t\t\tINNER JOIN service_type st2 ON st2.id = est.service_type_id\n`;
//                     script += `\t\t\t\tWHERE e.identifier = entity_identifier\n`;
//                     script += `\t\t\t\t\tAND upper(st2.identifier) = upper('${scopeObj.scope}')\n`;
//                     script += `\t\t\t);\n`;
//                 }
//             });
            
//             // Add service types to device user if linked
//             if (createDeviceUser && deviceUsername) {
//                 selectedScopes.forEach(scopeObj => {
//                     if (scopeObj.linkDeviceUser) {
//                         script += `\t\t-- Add ${scopeObj.scope} to Device User\n`;
//                         script += `\t\tWITH serviceType (id) AS (\n`;
//                         script += `\t\t\tSELECT id FROM service_type st WHERE upper(st.identifier) = upper('${scopeObj.scope}')\n`;
//                         script += `\t\t)\n`;
//                         script += `\t\tINSERT INTO public.entity_service_type (entity_id, service_type_id, active, rate_limit, rate_limit_count, rate_limit_period)\n`;
//                         script += `\t\t\tSELECT \t(SELECT e.ID FROM entity e WHERE description = '${deviceUsername}') as entityId\n`;
//                         script += `\t\t\t\t\t,st.id \n`;
//                         script += `\t\t\t\t\t,true\n`;
//                         script += `\t\t\t\t\t,${scopeObj.rateLimit}\n`;
//                         script += `\t\t\t\t\t,${scopeObj.limitCount}\n`;
//                         script += `\t\t\t\t\t,${scopeObj.limitPeriod}\n`;
//                         script += `\t\t\tFROM \tserviceType st\n`;
//                         script += `\t\t\tWHERE NOT EXISTS(\n`;
//                         script += `\t\t\t\tSELECT e.id FROM entity e \n`;
//                         script += `\t\t\t\t\tINNER JOIN entity_service_type est ON est.entity_id = e.id\n`;
//                         script += `\t\t\t\t\tINNER JOIN service_type st2 ON st2.id = est.service_type_id\n`;
//                         script += `\t\t\t\tWHERE e.description = '${deviceUsername}'\n`;
//                         script += `\t\t\t\t\tAND upper(st2.identifier) = upper('${scopeObj.scope}')\n`;
//                         script += `\t\t\t);\n`;
//                     }
//                 });
//             }
            
//             script += `\tEND LOOP;\n`;
//             script += `\t\t\n`;
//             script += `\t-- Website\n`;
//             script += `\tINSERT INTO public.entity_website (entity_id, website)\n`;
//             script += `\tSELECT \t(SELECT e.ID FROM entity e WHERE identifier = parent_identifier) as entityId\n`;
//             script += `\t\t\t,entity_website\n`;
//             script += `\tWHERE NOT EXISTS(\n`;
//             script += `\t\tSELECT id FROM public.entity_website WHERE entity_id = (SELECT e.ID FROM entity e WHERE identifier = parent_identifier)\n`;
//             script += `\t);\n`;
//             script += `\t\t\n`;
            
//             // OAuth Client for integrator
//             if (createIntegrator) {
//                 script += `\t-- OAuth Client\n`;
//                 script += `\tINSERT INTO public.oauth_client_details (\n`;
//                 script += `\t\tclient_id, resource_ids, client_secret, scope, \n`;
//                 script += `\t\tauthorized_grant_types, web_server_redirect_uri, authorities, access_token_validity, \n`;
//                 script += `\t\trefresh_token_validity, additional_information, autoapprove\n`;
//                 script += `\t)\n`;
//                 script += `\tSELECT \tentity_identifier\n`;
//                 script += `\t\t\t,'oauth2-resource'\n`;
//                 script += `\t\t\t,(select encode(digest(entity_password,'sha256'),'base64'))\n`;
//                 script += `\t\t\t,trim(entity_scopes)\n`;
//                 script += `\t\t\t,'client_credentials,password,refresh_token,authorization_code'\n`;
//                 script += `\t\t\t,entity_website\n`;
//                 script += `\t\t\t,'ROLE_CLIENT'\n`;
//                 script += `\t\t\t,86400\n`;
//                 script += `\t\t\t,2592000\n`;
//                 script += `\t\t\t,'{}'\n`;
//                 script += `\t\t\t,'true'\n`;
//                 script += `\tWHERE NOT EXISTS(\n`;
//                 script += `\t\tSELECT client_id FROM public.oauth_client_details WHERE client_id = entity_identifier\n`;
//                 script += `\t);\n`;
//             }
            
//             script += `\t\t\n`;
//             script += `\t-- Output the credentials\n`;
//             script += `\tRAISE notice 'Parent Entity ID: %', parent_identifier;\n`;
//             if (createIntegrator) {
//                 script += `\tRAISE notice 'Client ID: %', entity_identifier;\n`;
//                 script += `\tRAISE notice 'Client Secret: %', entity_password;\n`;
//             }
//             if (createDeviceUser && deviceUsername) {
//                 script += `\tRAISE notice 'Device User: %', '${deviceUsername}';\n`;
//             }
//             script += `\t\t\n`;
//             script += `END $$;\n`;
            
//             // Display the script
//             $('#scriptOutput').text(script);
//         }

function generateScript() {
                // Collect form data
                const parentName = $('#parentName').val();
                const entityWebsite = $('#website').val();
                const createIntegrator = $('#createIntegrator').is(':checked');
                const createDeviceUser = $('#createDeviceUser').is(':checked');
                
                // Device user settings
                const deviceUsername = $('#deviceUsername').val();
                const devicePassword = $('#devicePassword').val();
                const deviceEmail = $('#deviceEmail').val();
                
                // Service types
                // const serviceTypes = [];
                const selectedScopes = [];
                $('.scope-checkbox-input:checked').each(function() {
                    const scope = $(this).val();
                    const rateLimit = $(`#${scope}-rate-limit`).is(':checked');
                    const limitCount = $(`#${scope}-limit-count`).val() || 'null';
                    const limitPeriod = $(`#${scope}-limit-period`).val() || 'null';
                    const linkParent = $(`#${scope}-link-parent`).is(':checked');
                    const linkDeviceUser = $(`#${scope}-link-device-user`).is(':checked');
                    const linkIntegrator = $(`#${scope}-link-integrator`).is(':checked');
                    
                    selectedScopes.push({
                        scope: scope,
                        rateLimit: rateLimit,
                        limitCount: limitCount,
                        limitPeriod: limitPeriod,
                        linkParent: linkParent,
                        linkDeviceUser: linkDeviceUser,
                        linkIntegrator: linkIntegrator
                    });
                });
                
                // Build the entity_service_types array
                let entityServiceTypesArray = 'array[';
                selectedScopes.forEach((scopeObj, index) => {
                    if (scopeObj.linkParent) {
                        entityServiceTypesArray += `['${scopeObj.scope}', '${scopeObj.rateLimit}', ${scopeObj.limitCount}, ${scopeObj.limitPeriod}]`;
                        if (index < selectedScopes.length - 1) {
                            entityServiceTypesArray += `,
                            `;
                        }
                    }
                });
                entityServiceTypesArray += '\n];';
                
                // OCS settings
                const ocsEdWsGc = $('#OCS-ocs-ed-ws-gc').val();
                const ocsEdWsUsr = $('#OCS-ocs-ed-ws-usr').val();
                const ocsEdWsPwd = $('#OCS-ocs-ed-ws-pwd').val();
                const ocsDfScheme = $('#OCS-ocs-df-scheme').val();
                const ocsEdScGcMap = $('#OCS-ocs-ed-sc-gc-map').val();
                const ocsEdDoScGcMap = $('#OCS-ocs-ed-do-sc-gc-map').val();
                const ocsEdDoGc = $('#OCS-ocs-df-scheme').val();
                const ocsEdPassthrough = $('#OCS-ocs-ed-passthrough').is(':checked');
                
                // Mandate defaults
                const ocsDefaultMandateType = $('#OCS-ocs-services-mandate-ocs-ed-mandate-default-details___mandateType').val();
                const ocsDefaultDebitClassification = $('#OCS-ocs-services-mandate-ocs-ed-mandate-default-details___debitClassification').val();
                const ocsDefaultMaxInstallmentAmount = $('#OCS-ocs-services-mandate-ocs-ed-mandate-default-details___maximumInstallmentAmount').val();
                const ocsDefaultFrequency = $('#OCS-ocs-services-mandate-ocs-ed-mandate-default-details___frequency').val();
                const ocsDefaultTrackingEnabled = $('#OCS-ocs-services-mandate-ocs-ed-mandate-default-details___tracking').is(':checked');
                const ocsDefaultGenerateContractReference = $('#OCS-ocs-services-mandate-ocs-ed-mandate-default-details___generateContractReference').is(':checked');
                const ocsDefaultContractReferenceFormat = $('#OCS-ocs-services-mandate-ocs-ed-mandate-default-details___referenceFormat').val();
                const ocsDefaultScheme = $('#OCS-ocs-services-mandate-ocs-ed-mandate-default-details___scheme').val();
                
                // TCA settings
                const tcaApplicationKey = $('#TCA-tca-services-mca-tca-application-key').val();
                const tcaMerchantId = $('#TCA-tca-services-mca-tca-merchant-id').val();
                const tcaMerchantUsername = $('#TCA-tca-services-mca-tca-merchant-username').val();

                const externalStatusWebhookUrl = $('#externalStatusWebhookUrl').val();
                const appMandateAuthenticationEnabled = $('#appMandateAuthenticationEnabled').is(':checked');
                const appMandateCreationEnabled = $('#appMandateCreationEnabled').is(':checked');
                const appManualPaymentsEnabled = $('#appManualPaymentsEnabled').is(':checked');
                const appPaymentsEnabled = $('#appPaymentsEnabled').is(':checked');
                const appTransactionHistoryEnabled = $('#appTransactionHistoryEnabled').is(':checked');
                
                // Validate required fields
                if (!parentName) {
                    alert('Please enter a Parent Name');
                    $('#parentName').focus();
                    return;
                }
                
                // Generate SQL script
                let sqlScript = `-- Generated SQL Onboarding Script
-- Date: ${new Date().toLocaleDateString()}
-- Time: ${new Date().toLocaleTimeString()}

DO $$
DECLARE parent_name TEXT := '${parentName}';
        entity_website TEXT := '${entityWebsite}';

-- Integration Entity
    create_integration_entity BOOLEAN:= ${createIntegrator};

-- Device User Specific Settings
    create_device_user BOOLEAN:= ${createDeviceUser};
    device_user_username TEXT:= '${deviceUsername}';
    device_user_password TEXT:= '${devicePassword}';
    device_user_email_address TEXT:= '${deviceEmail}';

    entity_service_types TEXT[] :=array[`;

    // Add service types
    selectedScopes.forEach((service, index) => {
        console.log('Service:', service);
        sqlScript += `
        ['${service.scope.replace(/'/g, '')}', 'true', null, null]`;
        if (index < selectedScopes.length - 1) sqlScript += ',';
    });

    sqlScript += `
    ];

    -- Entity Settings
    entity_settings TEXT[][] := array[
    --  | SCOPE  |Entity | Identifier                      | Value         |
`;

    // Add OCS settings if selected
    if ($('#serviceOCS').is(':checked')) {
        sqlScript += `
        ['OCS',   'p',    'ocs.df.scheme',                 '${ocsDfScheme}'],
        ['OCS',   'p',    'ocs.ed.ws.gc',                  '${ocsEdWsGc}'],
        ['OCS',   'p',    'ocs.ed.ws.usr',                 '${ocsEdWsUsr}'],
        ['OCS',   'p',    'ocs.ed.ws.pwd',                 '${ocsEdWsPwd}'],
        ['OCS',   'p',    'ocs.ed.sc.gc.map',              '${ocsEdScGcMap}'],
        ['OCS',   'p',    'ocs.ed.do.sc.gc.map',           '${ocsEdDoScGcMap}'],
        ['OCS',   'p',    'ocs.ed.do.gc',                  '${ocsEdDoGc}'],
        ['OCS',   'p',    'ocs.ed.passthrough',            '${ocsEdPassthrough}'],
        ['OCS',   'p',    'external.status.webhook.url',   '${externalStatusWebhookUrl}'],`;
    }

    // Add TCA settings if selected
    if ($('#serviceTCA').is(':checked')) {
        sqlScript += `
        ['TCA',   'p',    'app.mandate.authentication.enabled', '${appMandateAuthenticationEnabled}'],
        ['TCA',   'p',    'app.mandate.creation.enabled',       '${appMandateCreationEnabled}'],
        ['TCA',   'p',    'app.manual.payments.enabled',        '${appManualPaymentsEnabled}'],
        ['TCA',   'p',    'app.payments.enabled',               '${appPaymentsEnabled}'],
        ['TCA',   'p',    'app.transaction.history.enabled',    '${appTransactionHistoryEnabled}'],
        ['TCA',   'p',    'tca.application.key',                '${tcaApplicationKey}'],
        ['TCA',   'p',    'tca.merchant.id',                    '${tcaMerchantId}'],
        ['TCA',   'p',    'tca.merchant.username',              '${tcaMerchantUsername}'],`;
    }

    // Remove trailing comma and close the array
    sqlScript = sqlScript.replace(/,\s*$/, '');
    sqlScript += `
    ];

-- Mandate defaults
    ocs_default_mandate_type TEXT:= '${ocsDefaultMandateType}';
    ocs_default_debit_classification TEXT:= '${ocsDefaultDebitClassification}';
    ocs_default_max_installment_amount TEXT:= '${ocsDefaultMaxInstallmentAmount}';
    ocs_default_frequency TEXT:= '${ocsDefaultFrequency}';
    ocs_default_tracking_enabled BOOLEAN:= ${ocsDefaultTrackingEnabled};
    ocs_default_generate_contract_reference BOOLEAN:= ${ocsDefaultGenerateContractReference};
    ocs_default_contract_reference_format TEXT:= '${ocsDefaultContractReferenceFormat}';
    ocs_default_scheme TEXT:= '${ocsDefaultScheme}';

-- These are generated / used within the script !! DONT CHANGE !!!
    parent_identifier TEXT;
    integration_entity_identifier TEXT;
    device_user_entity_identifier TEXT;
    integration_entity_description TEXT;
    device_user_entity_description TEXT;
    entity_password TEXT;

BEGIN
    -- Your SQL script logic would continue here...
    -- This is a simplified version for demonstration
    
    RAISE NOTICE 'Onboarding script for % started', parent_name;
    
    -- The rest of the script would follow the structure of the original
    -- including entity creation, service type assignments, etc.
    
END $$;
`;

// Display the generated SQL
$('#sqlOutput').text(sqlScript);
$('#resultContainer').show();

// Scroll to results
$('html, body').animate({
    scrollTop: $('#resultContainer').offset().top
}, 500);
}