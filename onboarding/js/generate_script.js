// /**
//  * SQL Script Generator for Entity Configuration
//  * 
//  * This file handles the generation of PostgreSQL scripts based on user input
//  * from the entity configuration form.
//  */

const { jsx } = require("react/jsx-runtime");

// function generateScript() {
//     console.log('Starting script generation...');
    
//     try {
//         // Validate required fields
//         if (!validateForm()) {
//             alert('Please fill in all required fields');
//             return;
//         }

//         // Collect form data
//         const formData = collectFormData();
        
//         // Generate SQL script
//         const sqlScript = buildSQLScript(formData);
        
//         // Display the script
//         displayScript(sqlScript);
        
//         // Show results container
//         $('#resultContainer').show();
        
//         // Scroll to results
//         $('html, body').animate({
//             scrollTop: $('#resultContainer').offset().top - 100
//         }, 500);
        
//     } catch (error) {
//         console.error('Error generating script:', error);
//         alert('An error occurred while generating the script. Please check the console for details.');
//     }
// }

// function validateForm() {
//     const parentName = $('#parentName').val().trim();
    
//     if (!parentName) {
//         return false;
//     }
    
//     // Check if at least one scope is selected
//     const selectedScopes = $('.scope-checkbox-input:checked').length;
//     if (selectedScopes === 0) {
//         alert('Please select at least one scope');
//         return false;
//     }
    
//     // Validate device user fields if enabled
//     if ($('#createDeviceUser').is(':checked')) {
//         const username = $('#deviceUsername').val().trim();
//         const password = $('#devicePassword').val().trim();
//         const email = $('#deviceEmail').val().trim();
        
//         if (!username || !password || !email) {
//             alert('Please fill in all device user fields');
//             return false;
//         }
//     }
    
//     return true;
// }

// function collectFormData() {
//     const data = {
//         parentName: $('#parentName').val().trim(),
//         website: $('#website').val().trim(),
//         createIntegrator: $('#createIntegrator').is(':checked'),
//         integratorName: $('#integratorName').val().trim(),
//         createDeviceUser: $('#createDeviceUser').is(':checked'),
//         deviceUsername: $('#deviceUsername').val().trim(),
//         devicePassword: $('#devicePassword').val().trim(),
//         deviceEmail: $('#deviceEmail').val().trim(),
//         scopes: []
//     };
    
//     // Collect selected scopes and their configurations
//     $('.scope-checkbox-input:checked').each(function() {
//         const scopeId = $(this).val();
//         const scopeData = scopes[scopeId];
//         const $scopeTab = $(`#${scopeId}`);
        
//         // Get rate limiting settings
//         const rateLimit = $scopeTab.find(`#${scopeId}-rate-limit`).is(':checked');
//         const limitCount = $scopeTab.find(`#${scopeId}-limit-count`).val();
//         const limitPeriod = $scopeTab.find(`#${scopeId}-limit-period`).val();
        
//         // Collect entities for this scope
//         const entities = {
//             parent: true, // Parent is always linked
//             integrator: false,
//             deviceuser: false
//         };
        
//         // Collect settings for this scope
//         const settings = [];
        
//         // Process each service
//         scopeData.services.forEach(service => {
//             const serviceSafeName = safeRename(service.name);
            
//             // Check if service is linked to entities
//             const linkedToIntegrator = $scopeTab.find(`#${scopeId}-${serviceSafeName}-integrator`).is(':checked');
//             const linkedToDeviceUser = $scopeTab.find(`#${scopeId}-${serviceSafeName}-deviceuser`).is(':checked');
            
//             if (linkedToIntegrator) entities.integrator = true;
//             if (linkedToDeviceUser) entities.deviceuser = true;
            
//             // Collect service-specific settings
//             if (service.settings && service.settings.length > 0) {
//                 service.settings.forEach(setting => {
//                     if (typeof setting === 'string') {
//                         const value = $scopeTab.find(`#${scopeId}-${serviceSafeName}-${safeRename(setting)}`).val();
//                         if (value) {
//                             settings.push({
//                                 scope: scopeId,
//                                 identifier: setting,
//                                 value: value,
//                                 table: 'entity_service_setting',
//                                 services: [service.name],
//                                 entities: getSettingEntities(setting, linkedToIntegrator, linkedToDeviceUser)
//                             });
//                         }
//                     } else if (typeof setting === 'object') {
//                         const value = getSettingValue($scopeTab, scopeId, serviceSafeName, setting);
//                         if (value !== null && value !== undefined && value !== '') {
//                             settings.push({
//                                 scope: scopeId,
//                                 identifier: setting.name,
//                                 value: value,
//                                 table: setting.table || 'entity_service_setting',
//                                 services: setting.services || [service.name],
//                                 entities: getSettingEntitiesFromAllowOn(setting.allowOn, linkedToIntegrator, linkedToDeviceUser)
//                             });
//                         }
//                     }
//                 });
//             }
//         });
        
//         // Collect scope-level settings
//         if (scopeData.settings && scopeData.settings.length > 0) {
//             scopeData.settings.forEach(setting => {
//                 if (typeof setting === 'string') {
//                     const value = $scopeTab.find(`#${scopeId}-${safeRename(setting)}`).val();
//                     if (value) {
//                         settings.push({
//                             scope: scopeId,
//                             identifier: setting,
//                             value: value,
//                             table: 'entity_service_type_setting',
//                             services: [],
//                             entities: { parent: true, integrator: entities.integrator, deviceuser: entities.deviceuser }
//                         });
//                     }
//                 } else if (typeof setting === 'object') {
//                     const value = getSettingValue($scopeTab, scopeId, '', setting);
//                     if (value !== null && value !== undefined && value !== '') {
//                         // Handle special settings
//                         if (setting.name === 'ocs.ed.mandate.default.details' && setting.type === 'special') {
//                             // This will be handled separately in the mandate defaults section
//                             // continue;
//                         }
//                         if (setting.name === 'manual.payments.reference.config' && setting.type === 'special') {
//                             // This will be handled separately in the payment reference section
//                             // continue;
//                         }
                        
//                         settings.push({
//                             scope: scopeId,
//                             identifier: setting.name,
//                             value: value,
//                             table: setting.table || 'entity_service_type_setting',
//                             services: setting.services || [],
//                             entities: getSettingEntitiesFromAllowOn(setting.allowOn, entities.integrator, entities.deviceuser)
//                         });
//                     }
//                 }
//             });
//         }
        
//         data.scopes.push({
//             identifier: scopeId,
//             name: scopeData.name,
//             rateLimit: rateLimit,
//             limitCount: rateLimit && limitCount ? parseInt(limitCount) : null,
//             limitPeriod: rateLimit && limitPeriod ? limitPeriod : null,
//             entities: entities,
//             settings: settings
//         });
//     });
    
//     // Collect mandate defaults if OCS is selected
//     data.mandateDefaults = collectMandateDefaults();
    
//     // Collect manual payment reference config if TCA is selected
//     data.manualPaymentReference = collectManualPaymentReference();
    
//     console.log('Collected form data:', data);
//     return data;
// }

// function getSettingValue($scopeTab, scopeId, serviceSafeName, setting) {
//     console.info(setting)
//     const prefix = serviceSafeName ? `${scopeId}-${serviceSafeName}` : scopeId;
//     const settingId = `#${prefix}-${safeRename(setting.name)}`;
//     const $input = $scopeTab.find(settingId);
    
//     if ($input.length === 0) {
//         return null;
//     }
    
//     if (setting.type === 'checkbox') {
//         return $input.is(':checked') ? 'true' : 'false';
//     } else if (setting.type === 'textarea') {
//         return $input.val().trim();
//     } else {
//         return $input.val();
//     }
// }

// function getSettingEntitiesFromAllowOn(allowOn, integratorLinked, deviceUserLinked) {
//     if (!allowOn || allowOn.length === 0) {
//         return { parent: true, integrator: false, deviceuser: false };
//     }
    
//     const entities = {
//         parent: allowOn.includes('parent'),
//         integrator: allowOn.includes('integrator') && integratorLinked,
//         deviceuser: allowOn.includes('deviceuser') && deviceUserLinked
//     };
    
//     return entities;
// }

// function getSettingEntities(settingName, integratorLinked, deviceUserLinked) {
//     // Determine which entities should receive this setting
//     return {
//         parent: true, // Most settings apply to parent by default
//         integrator: integratorLinked,
//         deviceuser: deviceUserLinked
//     };
// }

// function collectMandateDefaults() {
//     // Check if OCS scope is selected
//     const ocsSelected = $('#scope-OCS').is(':checked');
//     if (!ocsSelected) {
//         return null;
//     }
    
//     // Collect mandate default values
//     const defaults = {};
//     Object.keys(mandateDefaultsConfig).forEach(key => {
//         const config = mandateDefaultsConfig[key];
//         const $input = $(`#mandate-default-${key}`);
        
//         if ($input.length > 0) {
//             if (config.type === 'checkbox') {
//                 defaults[key] = $input.is(':checked');
//             } else {
//                 const value = $input.val();
//                 if (value) {
//                     defaults[key] = value;
//                 }
//             }
//         } else if (config.default !== undefined) {
//             defaults[key] = config.default;
//         }
//     });
    
//     return Object.keys(defaults).length > 0 ? defaults : null;
// }

// function collectManualPaymentReference() {
//     // Check if TCA scope is selected
//     const tcaSelected = $('#scope-TCA').is(':checked');
//     if (!tcaSelected) {
//         return null;
//     }
    
//     // Check if manual payment references are enabled
//     const enabled = $('#manual-payment-ref-enabled').is(':checked');
//     if (!enabled) {
//         return { enabled: false };
//     }
    
//     const config = {
//         enabled: true,
//         customerReference: $('#manual-payment-ref-customer').val() || 'disabled',
//         internalReference: $('#manual-payment-ref-internal').val() || 'disabled'
//     };
    
//     return config;
// }

// function buildSQLScript(data) {
//     let script = `DO $$

// DECLARE
// -- Parent Entity ---------------
// \tparent_name \t\t\t\tTEXT := \t'${escapeSql(data.parentName)}';\n`;

//     // Build entity_service_types array
//     script += `\tentity_service_types \t\tTEXT[] :=array[\n`;
//     script += `--  | Scope | Limit | Count | Period|\n`;
    
//     data.scopes.forEach((scope, index) => {
//         const isLast = index === data.scopes.length - 1;
//         const limitCount = scope.limitCount !== null ? `'${scope.limitCount}'` : 'null';
//         const limitPeriod = scope.limitPeriod !== null ? `'${scope.limitPeriod}'` : 'null';
        
//         script += `\t\t[ '${scope.identifier}', '${scope.rateLimit}', ${limitCount}, ${limitPeriod}\t]${isLast ? '' : ','}\n`;
//     });
    
//     script += `\t];\n\n`;

//     // Integration Entity section
//     if (data.createIntegrator) {
//         script += `-- Integration Entity ----------\n`;
//         script += `\tcreate_integration_entity \tBOOLEAN:= \ttrue;\n\n`;
//     } else {
//         script += `-- Integration Entity ----------\n`;
//         script += `\tcreate_integration_entity \tBOOLEAN:= \tfalse;\n\n`;
//     }

//     // Device User section
//     if (data.createDeviceUser) {
//         script += `-- Device User -----------------\n`;
//         script += `\tcreate_device_user \t\t\tBOOLEAN:= \ttrue;\n`;
//         script += `\tdevice_user_username \t\tTEXT:= \t\t'${escapeSql(data.deviceUsername)}';\n`;
//         script += `\tdevice_user_password \t\tTEXT:= \t\t'${escapeSql(data.devicePassword)}';\n`;
//         script += `\tdevice_user_email_address \tTEXT:= \t\t'${escapeSql(data.deviceEmail)}';\n`;
//         script += `\tdevice_user_is_active \t\tBOOLEAN:= \ttrue;\n\n`;
//     } else {
//         script += `-- Device User -----------------\n`;
//         script += `\tcreate_device_user \t\t\tBOOLEAN:= \tfalse;\n`;
//         script += `\tdevice_user_username \t\tTEXT:= \t\t'';\n`;
//         script += `\tdevice_user_password \t\tTEXT:= \t\t'';\n`;
//         script += `\tdevice_user_email_address \tTEXT:= \t\t'';\n`;
//         script += `\tdevice_user_is_active \t\tBOOLEAN:= \ttrue;\n\n`;
//     }

//     // Entity Settings
//     script += `-- Entity Settings\n`;
//     script += `\t-- Each scope in these settings must be added to the parent's "entity_service_types"\n`;
//     script += `\t-- p: Parent\n`;
//     script += `\t-- d: Device User\n`;
//     script += `\t-- i: Integrator\n`;
//     script += `\tentity_settings TEXT[] := array[\n`;
//     script += `\t-- Add 2 dashes in front of the setting if not needed or pass NULL as the value\n`;
//     script += `\t--  | SCOPE \t|Entity | Identifier                  \t\t| Value \t\t|\n`;

//     // Collect all settings
//     const allSettings = [];
//     data.scopes.forEach(scope => {
//         scope.settings.forEach(setting => {
//             if (setting.entities.parent) {
//                 allSettings.push({
//                     scope: scope.identifier,
//                     entity: 'p',
//                     identifier: setting.identifier,
//                     value: setting.value,
//                     table: setting.table
//                 });
//             }
//             if (setting.entities.integrator && data.createIntegrator) {
//                 allSettings.push({
//                     scope: scope.identifier,
//                     entity: 'i',
//                     identifier: setting.identifier,
//                     value: setting.value,
//                     table: setting.table
//                 });
//             }
//             if (setting.entities.deviceuser && data.createDeviceUser) {
//                 allSettings.push({
//                     scope: scope.identifier,
//                     entity: 'd',
//                     identifier: setting.identifier,
//                     value: setting.value,
//                     table: setting.table
//                 });
//             }
//         });
//     });

//     // Add settings to script
//     allSettings.forEach((setting, index) => {
//         const isLast = index === allSettings.length - 1;
//         const value = escapeSqlValue(setting.value);
//         script += `\t\t['${setting.scope}',\t\t'${setting.entity}',\t'${setting.identifier}',\t\t\t${value}]${isLast ? '' : ','}\n`;
//     });
    
//     if (allSettings.length === 0) {
//         script += `\t\t-- Add settings here\n`;
//     }
    
//     script += `\t];\n\n`;

//     // Mandate Defaults
//     if (data.mandateDefaults) {
//         script += buildMandateDefaultsSection(data.mandateDefaults);
//     }

//     // Manual Payment Reference
//     if (data.manualPaymentReference && data.manualPaymentReference.enabled) {
//         script += buildManualPaymentReferenceSection(data.manualPaymentReference);
//     }

//     // Add standard script footer
//     script += buildScriptFooter();

//     return script;
// }

// function buildMandateDefaultsSection(defaults) {
//     let section = `-- Mandate defaults\n`;
    
//     Object.keys(mandateDefaultsConfig).forEach(key => {
//         const config = mandateDefaultsConfig[key];
//         let value = defaults[key];
        
//         if (value === undefined || value === null) {
//             value = config.default;
//         }
        
//         const varName = `ocs_default_${camelToSnake(key)}`;
//         let varType = 'TEXT';
//         let varValue = `'${value}'`;
        
//         if (config.type === 'checkbox') {
//             varType = 'BOOLEAN';
//             varValue = value ? 'true' : 'false';
//         } else if (config.type === 'number') {
//             varType = 'TEXT';
//             varValue = `'${value}'`;
//         }
        
//         const padding = '\t'.repeat(Math.max(1, 5 - Math.floor(varName.length / 4)));
//         section += `\t${varName}${padding}${varType}:= ${varValue};\n`;
//     });
    
//     section += `\n`;
//     return section;
// }

// function buildManualPaymentReferenceSection(config) {
//     let section = `-- Payment Reference Fields\n`;
//     section += `\tmanual_payments_reference_fields \t\tBOOLEAN:=\t\ttrue;\n`;
//     section += `\tmanual_payments_customer_reference \t\tTEXT:= \t\t\t'${config.customerReference}';\n`;
//     section += `\tmanual_payments_internal_reference \t\tTEXT:= \t\t\t'${config.internalReference}';\n\n`;
//     return section;
// }

// function buildScriptFooter() {
//     // This is a simplified footer - the full version would include all the entity creation logic
//     // from the original SQL script. For brevity, I'm including a placeholder.
//     return `-- END OF SETUP SECTION
// -------------------------


// -------------------------
// -- FOR SCRIPT USE ONLY
// -- These are generated / used within the script !! DONT CHANGE !!!
// \tparent_identifier TEXT;
// \tintegration_entity_identifier TEXT;
// \tdevice_user_entity_identifier TEXT;
// \tintegration_entity_description TEXT;
// \tdevice_user_entity_description TEXT;
// \tentity_password TEXT;
// \tentity_service_type TEXT[];
// \tvar_entity_service_type_id INT;
// \tentity_service_type_setting TEXT[];
// \tentity_scopes TEXT := '';
// \tscope_identifier TEXT;
// \tsetting_entity TEXT;
// \tsetting_identifier TEXT;
// \tsetting_scope_identifier TEXT;
// \tsetting_entity_identifier TEXT;
// \tsetting_entity_type TEXT;
// \tentity_setting TEXT[];
// \trate_limit BOOLEAN;
// \tlimit_count INTEGER;
// \tlimit_period TEXT;
// \tsetting_value jsonb := '{}'::jsonb;
// \tmandate_default_details jsonb := '{}'::jsonb;
// \tmanual_payments_reference_field_values jsonb := '{}'::jsonb;
// \tinserted_count integer;
// \trows_affected integer;
// \taction_taken text;
// \t_current_value TEXT;
// \t_new_value TEXT;
// \t_service_type_id INT;
// \t_results TEXT[][];
// \t_result TEXT[];
// \t_parsed jsonb;
// \t_textObj TEXT;

// BEGIN
// \t-- Insert the entity creation, service linking, and settings insertion logic here
// \t-- This would include all the SQL logic from the original script
// \t
// \tRAISE NOTICE 'Script generated successfully. Please review and customize as needed.';
// \t
// END $$;`;
// }

// function escapeSql(str) {
//     if (!str) return '';
//     return str.replace(/'/g, "''");
// }

// function escapeSqlValue(value) {
//     if (value === null || value === undefined) {
//         return 'NULL';
//     }
    
//     // Check if it's a JSON object or array
//     if (typeof value === 'string' && (value.startsWith('{') || value.startsWith('['))) {
//         try {
//             JSON.parse(value);
//             return `'${escapeSql(value)}'`;
//         } catch (e) {
//             // Not valid JSON, treat as regular string
//         }
//     }
    
//     // Check if it's a boolean
//     if (value === 'true' || value === 'false') {
//         return `'${value}'`;
//     }
    
//     // Check if it's a number
//     if (!isNaN(value) && value.trim() !== '') {
//         return `'${value}'`;
//     }
    
//     return `'${escapeSql(value)}'`;
// }

// function camelToSnake(str) {
//     return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
// }

// function displayScript(script) {
//     // Display in the script output area
//     const $output = $('#scriptOutput');
//     $output.text(script);
    
//     // Also display in SQL output if it exists
//     const $sqlOutput = $('#sqlOutput');
//     if ($sqlOutput.length > 0) {
//         $sqlOutput.html(`<pre><code>${escapeHtml(script)}</code></pre>`);
//     }
// }

// function escapeHtml(text) {
//     const map = {
//         '&': '&amp;',
//         '<': '&lt;',
//         '>': '&gt;',
//         '"': '&quot;',
//         "'": '&#039;'
//     };
//     return text.replace(/[&<>"']/g, m => map[m]);
// }

// function copyScriptToClipboard() {
//     const script = $('#scriptOutput').text();
    
//     if (!script) {
//         alert('No script to copy. Please generate a script first.');
//         return;
//     }
    
//     // Use the Clipboard API
//     if (navigator.clipboard && navigator.clipboard.writeText) {
//         navigator.clipboard.writeText(script).then(() => {
//             // Show success feedback
//             const $btn = $('#copyScript');
//             const originalText = $btn.text();
//             $btn.text('Copied!');
//             setTimeout(() => {
//                 $btn.text(originalText);
//             }, 2000);
//         }).catch(err => {
//             console.error('Failed to copy:', err);
//             fallbackCopyToClipboard(script);
//         });
//     } else {
//         fallbackCopyToClipboard(script);
//     }
// }

// function fallbackCopyToClipboard(text) {
//     const textArea = document.createElement('textarea');
//     textArea.value = text;
//     textArea.style.position = 'fixed';
//     textArea.style.left = '-999999px';
//     document.body.appendChild(textArea);
//     textArea.focus();
//     textArea.select();
    
//     try {
//         document.execCommand('copy');
//         const $btn = $('#copyScript');
//         const originalText = $btn.text();
//         $btn.text('Copied!');
//         setTimeout(() => {
//             $btn.text(originalText);
//         }, 2000);
//     } catch (err) {
//         console.error('Fallback: Failed to copy', err);
//         alert('Failed to copy to clipboard');
//     }
    
//     document.body.removeChild(textArea);
// }

// // Helper function for safe renaming (if not already defined in site.js)
// if (typeof safeRename !== 'function') {
//     function safeRename(str) {
//         return str.replace(/[^a-zA-Z0-9]/g, '-');
//     }
// }

// // Copy button handler for the new result container
// $(document).ready(function() {
//     $('#copyBtn').click(function() {
//         copyScriptToClipboard();
//     });
// });


/**
 * SQL Script Generator for Entity Configuration
 * 
 * This file handles the generation of PostgreSQL scripts based on user input
 * from the entity configuration form.
 */

function generateScript() {
    console.log('Starting script generation...');
    
    try {
        // Validate required fields
        if (!validateForm()) {
            alert('Please fill in all required fields');
            return;
        }

        // Collect form data
        const formData = collectFormData();
        
        // Generate SQL script
        const sqlScript = buildSQLScript(formData);
        
        // Display the script
        displayScript(sqlScript);
        
        // Show results container
        $('#resultContainer').show();
        
        // Scroll to results
        $('html, body').animate({
            scrollTop: $('#resultContainer').offset().top - 100
        }, 500);
        
    } catch (error) {
        console.error('Error generating script:', error);
        alert('An error occurred while generating the script. Please check the console for details.');
    }
}

function validateForm() {
    const parentName = $('#parentName').val().trim();
    
    if (!parentName) {
        return false;
    }
    
    // Check if at least one scope is selected
    const selectedScopes = $('.scope-checkbox-input:checked').length;
    if (selectedScopes === 0) {
        alert('Please select at least one scope');
        return false;
    }
    
    // Validate device user fields if enabled
    if ($('#createDeviceUser').is(':checked')) {
        const username = $('#deviceUsername').val().trim();
        const password = $('#devicePassword').val().trim();
        const email = $('#deviceEmail').val().trim();
        
        if (!username || !password || !email) {
            alert('Please fill in all device user fields');
            return false;
        }
    }
    
    return true;
}

function collectFormData() {
    console.log('Starting data collection...');
    
    const data = {
        parentName: $('#parentName').val().trim(),
        website: $('#website').val().trim(),
        createIntegrator: $('#createIntegrator').is(':checked'),
        integratorName: $('#integratorName').val().trim(),
        createDeviceUser: $('#createDeviceUser').is(':checked'),
        deviceUsername: $('#deviceUsername').val().trim(),
        devicePassword: $('#devicePassword').val().trim(),
        deviceEmail: $('#deviceEmail').val().trim(),
        scopes: []
    };
    
    console.log('Basic data collected:', {
        parentName: data.parentName,
        createIntegrator: data.createIntegrator,
        createDeviceUser: data.createDeviceUser
    });
    
    // Collect selected scopes and their configurations
    $('.scope-checkbox-input:checked').each(function() {
        const scopeId = $(this).val();
        console.log(`Processing scope: ${scopeId}`);
        console.group(`Scope Data for ${scopeId}`);
        const scopeData = scopes[scopeId];
        
        // Check if scope data exists
        if (!scopeData) {
            console.error(`Scope data not found for: ${scopeId}`);
            console.log('Available scopes:', Object.keys(scopes));
            return; // Skip this scope
        }
        
        console.log(`Scope data found for ${scopeId}:`, {
            name: scopeData.name,
            hasServices: !!scopeData.services,
            servicesCount: scopeData.services ? scopeData.services.length : 0,
            hasSettings: !!scopeData.settings,
            settingsCount: scopeData.settings ? scopeData.settings.length : 0
        });
        
        const $scopeTab = $(`#${scopeId}`);
        
        // Get rate limiting settings
        const rateLimit = $scopeTab.find(`#${scopeId}-rate-limit`).is(':checked');
        const limitCount = $scopeTab.find(`#${scopeId}-limit-count`).val();
        const limitPeriod = $scopeTab.find(`#${scopeId}-limit-period`).val();
        
        // Collect entities for this scope
        const entities = {
            parent: false, 
            integrator: false,
            deviceuser: false,
            webservice: false
        };
        
        // Collect settings for this scope
        const settings = [];
        
        // Process each service (check if services exist)
        if (scopeData.services && Array.isArray(scopeData.services)) {
            console.log(`Processing ${scopeData.services.length} services for ${scopeId}`);
            
            scopeData.services.forEach((service, index) => {
                console.group(`Service ${index + 1} in Scope ${scopeId}`);
                if (!service) {
                    console.warn(`Service at index ${index} in scope ${scopeId} is null/undefined`);
                    return; // Skip this service
                }
                
                if (!service.name) {
                    console.error(`Service at index ${index} in scope ${scopeId} is missing name property:`, service);
                    return; // Skip this service
                }
                
                var serviceName = service.name;
                console.log(`Processing service: ${serviceName}`);
                const serviceSafeName = safeRename(serviceName);

            // Check if service is linked to entities
            $('[role="link-service-to-entity"]').each((i,e) => { 
                console.group(`Linking service to entity check ${i + 1}`);
                console.log('Element data:', $(e).data());
                var entity = $(e).data('entity');
                if ($scopeTab.find(`#${scopeId}-${serviceSafeName}-${entity}`).is(':checked')) {
                    console.log(entity + ' is checked');
                    entities[entity] = true;
                }
                console.groupEnd();
            });
            
            // Collect service-specific settings
            if (service.settings && service.settings.length > 0) {
                service.settings.forEach(setting => {
                    if (!setting) {
                        return; // Skip null/undefined settings
                    }
                    console.group(`Collecting settings for service: ${service.name}`);
                    
                    if (typeof setting === 'string') {
                        console.log(`Collecting value for string setting ${setting}`);

                        const value = $scopeTab.find(`#${scopeId}-${serviceSafeName}-${safeRename(setting)}`).val();
                        if (value) {
                            settings.push({
                                scope: scopeId,
                                identifier: setting,
                                value: value,
                                table: 'entity_service_setting',
                                services: [service.name],
                                entities: getSettingEntities(setting, linkedToIntegrator, linkedToDeviceUser)
                            });
                        }
                    } else if (typeof setting === 'object' && setting.name) {
                        console.log(`Collecting value for object setting ${setting.name}`);
                        const value = getSettingValue($scopeTab, scopeId, serviceSafeName, setting);
                        if (value !== null && value !== undefined && value !== '') {
                            settings.push({
                                scope: scopeId,
                                identifier: setting.name,
                                value: value,
                                table: setting.table || 'entity_service_setting',
                                services: setting.services || [service.name],
                                entities: getSettingEntitiesFromAllowOn(setting.allowOn, linkedToIntegrator, linkedToDeviceUser)
                            });
                        }
                    }
                });
            }

            console.info(`Completed processing service: ${service.name}`)
            console.groupEnd();
        });
        } // End of services forEach
        
        // Collect scope-level settings (check if settings exist)
        if (scopeData.settings && Array.isArray(scopeData.settings)) {
            scopeData.settings.forEach(setting => {
                if (!setting) {
                    return; // Skip null/undefined settings
                }

                console.group(`Collecting scope-level setting for scope: ${setting.name || setting}`);


                if (typeof setting === 'string') {
                    console.log(`Collecting value for string setting ${setting}`);
                    const value = $scopeTab.find(`#${scopeId}-${safeRename(setting)}`).val();
                    if (value) {
                        settings.push({
                            scope: scopeId,
                            identifier: setting,
                            value: value,
                            table: 'entity_service_type_setting',
                            services: [],
                            entities: { parent: true, integrator: entities.integrator, deviceuser: entities.deviceuser }
                        });
                    }
                } else if (typeof setting === 'object' && setting.name) {
                    const value = getSettingValue($scopeTab, scopeId, '', setting);
                    console.info(`Collected value for setting ${setting.name} in scope ${scopeId}:`, value);
                    if (value !== null && value !== undefined && value !== '') {
                        // Handle special settings
                        if (setting.name === 'ocs.ed.mandate.default.details' && setting.type === 'special') {
                            // This will be handled separately in the mandate defaults section
                            return; // Use return instead of continue in forEach
                        }
                        if (setting.name === 'manual.payments.reference.config' && setting.type === 'special') {
                            // This will be handled separately in the payment reference section
                            return; // Use return instead of continue in forEach
                        }
                        
                        settings.push({
                            scope: scopeId,
                            identifier: setting.name,
                            value: value,
                            table: setting.table || 'entity_service_type_setting',
                            services: setting.services || [],
                            entities: getSettingEntitiesFromAllowOn(setting.allowOn, entities.integrator, entities.deviceuser)
                        });

                    }
                }

                console.groupEnd();
            });
        }
        
        data.scopes.push({
            identifier: scopeId,
            name: scopeData.name,
            rateLimit: rateLimit,
            limitCount: rateLimit && limitCount ? parseInt(limitCount) : null,
            limitPeriod: rateLimit && limitPeriod ? limitPeriod : null,
            entities: entities,
            settings: settings
        });

        
    });
    
    // Collect mandate defaults if OCS is selected
    data.mandateDefaults = collectMandateDefaults();
    
    // Collect manual payment reference config if TCA is selected
    data.manualPaymentReference = collectManualPaymentReference();
    
    console.log('Data collection complete. Summary:');
    console.log(`- Scopes: ${data.scopes.length}`);
    console.log(`- Total settings: ${data.scopes.reduce((sum, s) => sum + s.settings.length, 0)}`);
    console.log(`- Has mandate defaults: ${!!data.mandateDefaults}`);
    console.log(`- Has manual payment reference: ${!!data.manualPaymentReference}`);
    console.log('Collected form data:', data);
    
    return data;
}

function getSettingValue($scopeTab, scopeId, serviceSafeName, setting) {
    if (!setting || !setting.name) {
        console.warn('Invalid setting object:', setting);
        return null;
    }
    
    const prefix = serviceSafeName ? `${scopeId}-${serviceSafeName}` : scopeId;
    const settingId = `#${prefix}-${safeRename(setting.name)}`;
    const $input = $scopeTab.find(settingId);
    console.group(`Getting value for element: ${settingId}`);
    
    if ($input.length === 0) {
        if ($('[service-setting="' + setting.name + '"]').length > 0) {
            console.warn(`Element for setting "${setting.name}" not found under expected ID "${settingId}", but found with service-setting attribute.`);
            var obj = {};
            $('[service-setting="'+ setting.name +'"]').each((i,e) => {
                var field = $(e).attr('service-setting-field');
                var value = getValueFromElement($(e), setting);
                obj[field] = value;
                console.log($(e).attr('service-setting-field'))
            });
            console.log(obj);
            console.groupEnd();
            return obj;
        } else {
            console.warn(`Element for setting "${setting.name}" not found under expected ID "${settingId}".`);
        }
        console.groupEnd();
        return null;
    }   
    
    if (setting.type === 'checkbox') {
        console.group(`Getting value for checkbox setting: ${setting.name}`);
        console.groupEnd();
        return $input.is(':checked') ? 'true' : 'false';
    } else if (setting.type === 'textarea') {
        console.group(`Getting value for textarea setting: ${setting.name}`);
        console.groupEnd();
        return $input.val().trim();
    } else {
        console.group(`Getting value for input setting: ${setting.name}`);
        console.groupEnd();
        return $input.val();
    }

    console.groupEnd();
}

function getValueFromElement($input, setting) {
    console.log(`Getting value for setting: ${JSON.stringify( setting)}`);
    if (setting.type === 'checkbox') {
        console.group(`Getting value for checkbox setting: ${setting.name}`);
        console.groupEnd();
        return $input.is(':checked') ? 'true' : 'false';
    } else if (setting.type === 'textbox' || setting.type === 'textarea' || setting.type === 'number') {
        console.group(`Getting value for textarea setting: ${setting.name}`);
        console.groupEnd();
        return $input.val().trim();
    } else if (setting.type === 'dropdown' || setting.type === 'select') {
        console.group(`Getting value for textarea setting: ${setting.name}`);
        console.groupEnd();
        var value = $input.val().trim();
       
        // if (setting.translateValues && setting.translateValues[value]) {
        //     return setting.translateValues[value];
        // }
        return getTranslatedSettingValue(value, setting.translateValues || {"on": true, "off": false});
    } else if (setting.type === 'radio' || setting.type === 'textarea') {
        console.group(`Getting value for textarea setting: ${setting.name}`);
        console.groupEnd();
        return getTranslatedSettingValue(value, setting.translateValues || {"on": true, "off": false});
    } else {
        console.group(`Getting value for input setting: ${setting.name}`);
        console.groupEnd();
        return $input.val();
    }
}

function getSettingEntitiesFromAllowOn(allowOn, integratorLinked, deviceUserLinked) {
    if (!allowOn || !Array.isArray(allowOn) || allowOn.length === 0) {
        return { parent: true, integrator: false, deviceuser: false };
    }
    
    const entities = {
        parent: allowOn.includes('parent'),
        integrator: allowOn.includes('integrator') && integratorLinked,
        deviceuser: allowOn.includes('deviceuser') && deviceUserLinked
    };
    
    return entities;
}

function getTranslatedSettingValue(value, translateValues) {
    console.log('Translating value:', value, 'with map:', translateValues);
    if (translateValues && translateValues[value]) {
        return translateValues[value];
    }
    return value;
}

function getSettingEntities(settingName, integratorLinked, deviceUserLinked) {
    // Determine which entities should receive this setting
    return {
        parent: true, // Most settings apply to parent by default
        integrator: integratorLinked,
        deviceuser: deviceUserLinked
    };
}

function collectMandateDefaults() {
    // Check if OCS scope is selected
    const ocsSelected = $('#scope-OCS').is(':checked');
    if (!ocsSelected) {
        return null;
    }
    
    // Collect mandate default values
    const defaults = {};
    Object.keys(mandateDefaultsConfig).forEach(key => {
        const config = mandateDefaultsConfig[key];
        const $input = $(`#mandate-default-${key}`);
        
        if ($input.length > 0) {
            if (config.type === 'checkbox') {
                defaults[key] = $input.is(':checked');
            } else {
                const value = $input.val();
                if (value) {
                    defaults[key] = value;
                }
            }
        } else if (config.default !== undefined) {
            defaults[key] = config.default;
        }
    });
    
    return Object.keys(defaults).length > 0 ? defaults : null;
}

function collectManualPaymentReference() {
    // Check if TCA scope is selected
    const tcaSelected = $('#scope-TCA').is(':checked');
    if (!tcaSelected) {
        return null;
    }
    
    // Check if manual payment references are enabled
    const enabled = $('#manual-payment-ref-enabled').is(':checked');
    if (!enabled) {
        return { enabled: false };
    }
    
    const config = {
        enabled: true,
        customerReference: $('#manual-payment-ref-customer').val() || 'disabled',
        internalReference: $('#manual-payment-ref-internal').val() || 'disabled'
    };
    
    return config;
}

function buildSQLScript(data) {
    let script = `DO $$

DECLARE
-- Parent Entity ---------------
\tparent_name \t\t\t\tTEXT := \t'${escapeSql(data.parentName)}';\n`;

    // Build entity_service_types array
    script += `\tentity_service_types \t\tTEXT[] :=array[\n`;
    script += `--  | Scope | Limit | Count | Period|\n`;
    
    data.scopes.forEach((scope, index) => {
        const isLast = index === data.scopes.length - 1;
        const limitCount = scope.limitCount !== null ? `'${scope.limitCount}'` : 'null';
        const limitPeriod = scope.limitPeriod !== null ? `'${scope.limitPeriod}'` : 'null';
        
        script += `\t[ '${scope.identifier}', '${scope.rateLimit}', ${limitCount}, ${limitPeriod}\t]${isLast ? '' : ','}\n`;
    });
    
    script += `\t];\n\n`;

    // Integration Entity section
    if (data.createIntegrator) {
        script += `-- Integration Entity ----------\n`;
        script += `\tcreate_integration_entity \tBOOLEAN:= \ttrue;\n\n`;
    } else {
        script += `-- Integration Entity ----------\n`;
        script += `\tcreate_integration_entity \tBOOLEAN:= \tfalse;\n\n`;
    }

    // Device User section
    if (data.createDeviceUser) {
        script += `-- Device User -----------------\n`;
        script += `\tcreate_device_user \t\t\tBOOLEAN:= \ttrue;\n`;
        script += `\tdevice_user_username \t\tTEXT:= \t\t'${escapeSql(data.deviceUsername)}';\n`;
        script += `\tdevice_user_password \t\tTEXT:= \t\t'${escapeSql(data.devicePassword)}';\n`;
        script += `\tdevice_user_email_address \tTEXT:= \t\t'${escapeSql(data.deviceEmail)}';\n`;
    } else {
        script += `-- Device User -----------------\n`;
        script += `\tcreate_device_user \t\t\tBOOLEAN:= \tfalse;\n`;
        script += `\tdevice_user_username \t\tTEXT:= \t\t'';\n`;
        script += `\tdevice_user_password \t\tTEXT:= \t\t'';\n`;
        script += `\tdevice_user_email_address \tTEXT:= \t\t'';\n`;
    }

    // Entity Settings
    script += `-- Entity Settings\n`;
    script += `\t-- Each scope in these settings must be added to the parent's "entity_service_types"\n`;
    script += `\t-- p: Parent\n`;
    script += `\t-- d: Device User\n`;
    script += `\t-- i: Integrator\n`;
    script += `\tentity_settings TEXT[] := array[\n`;
    script += `\t-- Add 2 dashes in front of the setting if not needed or pass NULL as the value\n`;
    script += `\t--  | SCOPE \t|Entity | Identifier                  \t\t| Value \t\t|\n`;

    // Collect all settings
    const allSettings = [];
    data.scopes.forEach(scope => {
        scope.settings.forEach(setting => {
            if (setting.entities.parent) {
                allSettings.push({
                    scope: scope.identifier,
                    entity: 'p',
                    identifier: setting.identifier,
                    value: setting.value,
                    table: setting.table
                });
            }
            if (setting.entities.integrator && data.createIntegrator) {
                allSettings.push({
                    scope: scope.identifier,
                    entity: 'i',
                    identifier: setting.identifier,
                    value: setting.value,
                    table: setting.table
                });
            }
            if (setting.entities.deviceuser && data.createDeviceUser) {
                allSettings.push({
                    scope: scope.identifier,
                    entity: 'd',
                    identifier: setting.identifier,
                    value: setting.value,
                    table: setting.table
                });
            }
        });
    });

    console.info('All settings', allSettings);

    // Add settings to script
    allSettings.forEach((setting, index) => {
        const isLast = index === allSettings.length - 1;
        var value = escapeSqlValue(setting.value);
        if (typeof(setting.value) === 'object' || Array.isArray(setting.value)) {
            value = `'${escapeSql(JSON.stringify(setting.value))}'`;
        }
        script += `\t\t['${setting.scope}',\t\t'${setting.entity}',\t'${setting.identifier}',\t\t\t${value}]${isLast ? '' : ','}\n`;
    });
    
    if (allSettings.length === 0) {
        script += `\t\t-- Add settings here\n`;
    }
    
    script += `\t];\n\n`;

    // Mandate Defaults
    if (data.mandateDefaults) {
        script += buildMandateDefaultsSection(data.mandateDefaults);
    }

    // Manual Payment Reference
    if (data.manualPaymentReference && data.manualPaymentReference.enabled) {
        script += buildManualPaymentReferenceSection(data.manualPaymentReference);
    }



    // Add standard script footer
    script += buildScriptFooter();

    return script;
}

function buildMandateDefaultsSection(defaults) {
    let section = `-- Mandate defaults\n`;
    
    Object.keys(mandateDefaultsConfig).forEach(key => {
        const config = mandateDefaultsConfig[key];
        let value = defaults[key];
        
        if (value === undefined || value === null) {
            value = config.default;
        }
        
        const varName = `ocs_default_${camelToSnake(key)}`;
        let varType = 'TEXT';
        let varValue = `'${value}'`;
        
        if (config.type === 'checkbox') {
            varType = 'BOOLEAN';
            varValue = value ? 'true' : 'false';
        } else if (config.type === 'number') {
            varType = 'TEXT';
            varValue = `'${value}'`;
        }
        
        const padding = '\t'.repeat(Math.max(1, 5 - Math.floor(varName.length / 4)));
        section += `\t${varName}${padding}${varType}:= ${varValue};\n`;
    });
    
    section += `\n`;
    return section;
}

function buildManualPaymentReferenceSection(config) {
    let section = `-- Payment Reference Fields\n`;
    section += `\tmanual_payments_reference_fields \t\tBOOLEAN:=\t\ttrue;\n`;
    section += `\tmanual_payments_customer_reference \t\tTEXT:= \t\t\t'${config.customerReference}';\n`;
    section += `\tmanual_payments_internal_reference \t\tTEXT:= \t\t\t'${config.internalReference}';\n\n`;
    return section;
}

function buildScriptFooter() {
    // This is a simplified footer - the full version would include all the entity creation logic
    // from the original SQL script. For brevity, I'm including a placeholder.
    return `-- END OF SETUP SECTION
-------------------------


-------------------------
-- FOR SCRIPT USE ONLY
-- These are generated / used within the script !! DONT CHANGE !!!
\tparent_identifier TEXT;
\tintegration_entity_identifier TEXT;
\tdevice_user_entity_identifier TEXT;
\tintegration_entity_description TEXT;
\tdevice_user_entity_description TEXT;
\tentity_password TEXT;
\tentity_service_type TEXT[];
\tvar_entity_service_type_id INT;
\tentity_service_type_setting TEXT[];
\tentity_scopes TEXT := '';
\tscope_identifier TEXT;
\tsetting_entity TEXT;
\tsetting_identifier TEXT;
\tsetting_scope_identifier TEXT;
\tsetting_entity_identifier TEXT;
\tsetting_entity_type TEXT;
\tentity_setting TEXT[];
\trate_limit BOOLEAN;
\tlimit_count INTEGER;
\tlimit_period TEXT;
\tsetting_value jsonb := '{}'::jsonb;
\tmandate_default_details jsonb := '{}'::jsonb;
\tmanual_payments_reference_field_values jsonb := '{}'::jsonb;
\tinserted_count integer;
\trows_affected integer;
\taction_taken text;
\t_current_value TEXT;
\t_new_value TEXT;
\t_service_type_id INT;
\t_results TEXT[][];
\t_result TEXT[];
\t_parsed jsonb;
\t_textObj TEXT;

BEGIN
	FOREACH entity_setting SLICE 1 IN ARRAY entity_settings
		LOOP
			SELECT entity_setting[1]::TEXT into setting_scope_identifier;
			SELECT entity_setting[2]::TEXT into setting_entity;
			SELECT entity_setting[3]::TEXT into setting_identifier;
			SELECT to_jsonb(entity_setting[4]) into setting_value;
			IF lower(setting_identifier) ='ocs.ed.ws.usr' THEN
				entity_settings := entity_settings || array[
					[setting_scope_identifier,	setting_entity,	'webservice.username',	trim(both '"' from setting_value::TEXT)]  -- VALIDATED
				];
			END IF;
			IF lower(setting_identifier) = 'ocs.ed.ws.pwd' THEN
				entity_settings := entity_settings || array[
					[setting_scope_identifier,	setting_entity,	'webservice.password',	trim(both '"' from setting_value::TEXT)]  -- VALIDATED
				];
			END IF;
		END LOOP;

    -- Add optional values to the ocs.ed.mandate.default.details object
	IF ocs_default_scheme IS NOT NULL AND ocs_default_scheme != '' THEN
		mandate_default_details := mandate_default_details || jsonb_build_object('scheme', ocs_default_scheme);
    END IF;
	IF ocs_default_generate_contract_reference IS NOT NULL THEN
		mandate_default_details := mandate_default_details || jsonb_build_object('generateContractReference', ocs_default_generate_contract_reference);
    END IF;
	IF ocs_default_contract_reference_format IS NOT NULL THEN
		mandate_default_details := mandate_default_details || jsonb_build_object('referenceFormat', ocs_default_contract_reference_format);
    END IF;

-- Build & validate the manual.payments.reference.config json object
	if manual_payments_reference_fields IS NOT NULL THEN
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
	    manual_payments_reference_field_values := jsonb_build_object(
		    'app.manual.payments.reference.customer', manual_payments_customer_reference,
		    'app.manual.payments.reference.internal', manual_payments_internal_reference
		);
	END IF;    


-------------------------
	-- Entities Setup
		SELECT parent_name || ' :Integrator' into integration_entity_description; -- Assuming we following the naming convention of "MY CUSTOMER :Integrator"
		SELECT device_user_username into device_user_entity_description; -- Assuming we following the naming convention of "MY CUSTOMER :Device User"
		SELECT UPPER(uuid_generate_v4()::varchar) into parent_identifier;
	    SELECT uuid_generate_v4()::varchar into integration_entity_identifier;
	    SELECT uuid_generate_v4()::varchar into device_user_entity_identifier;
	    SELECT uuid_generate_v4()::varchar into entity_password;
		-- Parent Entity Setup
			-- Only insert a parent record if the "parent_name" is not already in public.entity 
			INSERT INTO public.entity (description, identifier, lookup_entity_type_id, active)
				SELECT parent_name, parent_identifier, 1, true
				WHERE NOT EXISTS(
					SELECT id FROM public.entity WHERE lower(description) = lower(parent_name)
				);
			-- Regardless of the insert statement outcome, we need to get identifier related to the "parent_name" (incase it was not inserted and we need to get the existing identifier)	
			SELECT identifier INTO parent_identifier FROM public.entity WHERE lower(description) = lower(parent_name);
		-- Integrator Entity Setup
			-- Only insert a record if the "integration_entity_description" is not already in public.entity
			INSERT INTO public.entity (description, identifier, lookup_entity_type_id, active, parent_id)
			SELECT	integration_entity_description
					,integration_entity_identifier
					,(select id from lookup_entity_type where description = 'Integrator') as lookupEntityTypeId			
					,true
					,(select id from entity where identifier = parent_identifier) as entityParentId			
			WHERE NOT EXISTS(
		        SELECT id FROM public.entity WHERE lower(description) = lower(integration_entity_description)
		    );	
			-- Regardless of the insert statement outcome, we need to get identifier related to the "integration_entity_description" (incase it was not inserted and we need to get the existing identifier)		
			SELECT identifier INTO integration_entity_identifier FROM public.entity WHERE lower(description) = lower(integration_entity_description);
			-- Integrator Entity Credentials
			INSERT INTO public.integrator (entity_id, client_secret, email_address, active)
			select 	(select id from entity where identifier = integration_entity_identifier) as entityId	
					,(select encode(digest(entity_password::bytea,'sha256'),'base64')) as client_secret
					,'development@bitventure.co.za'
					,true 
			WHERE NOT EXISTS(
		        SELECT i.id FROM public.integrator i 
					INNER JOIN public.entity e ON e.id = i.entity_id			
				WHERE lower(e.identifier) = lower(integration_entity_identifier)
		    );		
		-- Device User Setup
			-- Only insert a record if the "device_user_entity_description" is not already in public.entity
		    IF create_device_user THEN
		        INSERT INTO public.entity (description, identifier, lookup_entity_type_id, active, parent_id)
		        SELECT	device_user_entity_description
		                ,device_user_entity_identifier
		                ,(select id from lookup_entity_type where description = 'User') as lookupEntityTypeId			
		                ,true
		                ,(select id from entity where identifier = parent_identifier) as entityParentId			
		        WHERE NOT EXISTS(
		            SELECT id FROM public.entity WHERE lower(description) = lower(device_user_entity_description)
		        );	
		        -- Regardless of the insert statement outcome, we need to get identifier related to the "device_user_entity_description" (incase it was not inserted and we need to get the existing identifier)		
		        SELECT identifier INTO device_user_entity_identifier FROM public.entity WHERE lower(description) = lower(device_user_entity_description);
		        -- Device user credentials
		        INSERT INTO public.user (entity_id, username, password, email_address, active)
		        select 	(select id from entity where identifier = device_user_entity_identifier) as entity_id	
		        , device_user_username as username	
		                ,(select encode(digest(device_user_password::bytea,'sha256'),'base64')) as password
		                ,device_user_email_address as email_address
		                ,device_user_is_active as active 
		        WHERE NOT EXISTS(
		            SELECT i.id FROM public.user i 
		                INNER JOIN public.entity e ON e.id = i.entity_id			
		            WHERE lower(e.identifier) = lower(device_user_entity_identifier)
		        );	
		    END IF;
	-- End Entities Setup
------------------------- 


-------------------------
	-- Entity Service Types Setup
	FOREACH entity_service_type SLICE 1 IN ARRAY entity_service_types
	LOOP
		SELECT upper(entity_service_type[1]) into scope_identifier;	
		SELECT entity_service_type[2]::BOOLEAN into rate_limit;
		SELECT entity_service_type[3]::INTEGER into limit_count;
		SELECT entity_service_type[4] into limit_period;
		RAISE notice 'Scope: %', scope_identifier;
		SELECT entity_scopes || ' ' || lower(scope_identifier) into entity_scopes; 
		-- Add the Service Type to the parent entity if it does not exist
		WITH serviceType (id) AS (
			SELECT id FROM service_type st WHERE upper(st.identifier) = upper(scope_identifier)
		)
		INSERT INTO public.entity_service_type (entity_id, service_type_id, active)
			SELECT 	(SELECT e.ID FROM entity e WHERE identifier = parent_identifier) as entityId
					,st.id 
					,true
			FROM 	serviceType st
			WHERE NOT EXISTS(
				SELECT e.id FROM entity e 			
					INNER JOIN entity_service_type est ON est.entity_id = e.id
					INNER JOIN service_type st ON st.id = est.service_type_id
				WHERE e.identifier = parent_identifier
					AND upper(st.identifier) = upper(scope_identifier))	
					RETURNING 1 INTO inserted_count;
		-- Add the Service to the parent entity if it does not exist
		-- The Parent must have all its "children" services (ideally if a parent does not have the service, the service should be disallowed for the child). 
		IF rate_limit THEN 
			WITH service (id) AS (
				SELECT s.id 
				FROM service s 
				WHERE s.service_type_id  in (
					SELECT id FROM service_type st WHERE upper(st.identifier) = upper(scope_identifier)
				)
			)
			INSERT INTO public.entity_service (entity_id, service_id, active, rate_limit, limit_count, limit_period)
				SELECT 	(SELECT e.ID FROM entity e WHERE identifier = parent_identifier) as entityId
						,s.id 
						,true
						,true
						,limit_count
						,limit_period
				FROM 	service s
				WHERE NOT EXISTS(
					SELECT s.id from service s			
						INNER JOIN entity_service es ON es.service_id = s.id
						INNER JOIN entity e ON e.id = es.entity_id
					WHERE e.identifier = parent_identifier
				);	
		ELSE
			WITH service (id) AS (
				SELECT s.id 
				FROM service s 
				WHERE s.service_type_id  in (
					SELECT id FROM service_type st WHERE upper(st.identifier) = upper(scope_identifier)
				)
			)
			INSERT INTO public.entity_service (entity_id, service_id, active, rate_limit)
				SELECT 	(SELECT e.ID FROM entity e WHERE identifier = parent_identifier) as entityId
						,s.id ,true,false
				FROM 	service s
				WHERE NOT EXISTS(
					SELECT s.id from service s			
						INNER JOIN entity_service es ON es.service_id = s.id
						INNER JOIN entity e ON e.id = es.entity_id
					WHERE e.identifier = parent_identifier
				);
		END IF;	
	-- End Entity Service Types Setup
-------------------------



\t
\tRAISE NOTICE 'Script generated successfully. Please review and customize as needed.';
\t
END $$;`;
}

function safeRename(str) {
    if (typeof str === 'object' && Array.isArray(str)){
            return JSON.stringify(str);
        }
        
    try { 
        console.log('Renaming string:', str);
        return str.replace(/\./g, '-').replace(/:/g, '-').replace(/\s/g, '-');
    } catch (error) {
        console.error('Error in safeRename:', error);
        console.error('Input:', JSON.stringify(str));
        return str;
    }
    
}

function escapeSql(str) {
    try {
        console.log(typeof(str))
        if (typeof str === 'object' && Array.isArray(str)){
            return JSON.stringify(str).replace(/'/g, "''");
        }

        if (typeof str !== 'string'){
            return  str;
        }

        if (!str) return '';
        return str.replace(/'/g, "''");
    } catch (error) {
        console.error('Error escaping SQL string:', error);
        console.error('Input', JSON.stringify(str));
        return str;
    }
}

function escapeSqlValue(value) {
    if (value === null || value === undefined) {
        return 'NULL';
    }
    
    // Check if it's a JSON object or array
    if (typeof value === 'string' && (value.startsWith('{') || value.startsWith('['))) {
        try {
            JSON.parse(value);
            return `'${escapeSql(value)}'`;
        } catch (e) {
            // Not valid JSON, treat as regular string
        }
    }
    
    // Check if it's a boolean
    if (value === 'true' || value === 'false') {
        return `'${value}'`;
    }
    
    // Check if it's a number
    if (!isNaN(value) && value.trim() !== '') {
        return `'${value}'`;
    }
    
    return `'${escapeSql(value)}'`;
}

function camelToSnake(str) {
    return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
}

function displayScript(script) {
    // Display in the script output area
    const $output = $('#scriptOutput');
    $output.text(script);
    
    // Also display in SQL output if it exists
    const $sqlOutput = $('#sqlOutput');
    if ($sqlOutput.length > 0) {
        $sqlOutput.html(`<pre><code>${escapeHtml(script)}</code></pre>`);
    }
}

function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
}

function copyScriptToClipboard() {
    const script = $('#scriptOutput').text();
    
    if (!script) {
        alert('No script to copy. Please generate a script first.');
        return;
    }
    
    // Use the Clipboard API
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(script).then(() => {
            // Show success feedback
            const $btn = $('#copyScript');
            const originalText = $btn.text();
            $btn.text('Copied!');
            setTimeout(() => {
                $btn.text(originalText);
            }, 2000);
        }).catch(err => {
            console.error('Failed to copy:', err);
            fallbackCopyToClipboard(script);
        });
    } else {
        fallbackCopyToClipboard(script);
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
        const $btn = $('#copyScript');
        const originalText = $btn.text();
        $btn.text('Copied!');
        setTimeout(() => {
            $btn.text(originalText);
        }, 2000);
    } catch (err) {
        console.error('Fallback: Failed to copy', err);
        alert('Failed to copy to clipboard');
    }
    
    document.body.removeChild(textArea);
}

// // Helper function for safe renaming (if not already defined in site.js)
// if (typeof safeRename !== 'function') {
//     function safeRename(str) {
//         return str.replace(/[^a-zA-Z0-9]/g, '-');
//     }
// }

// Copy button handler for the new result container
$(document).ready(function() {
    $('#copyBtn').click(function() {
        copyScriptToClipboard();
    });
});