/**
 * Enhanced Site.js with Special Settings Support
 * 
 * This file adds support for:
 * - Mandate defaults configuration
 * - Manual payment reference fields
 * - Better entity linking UI
 * - Improved settings rendering
 */

// Add special settings handlers
function renderSpecialSettings($scopeTab, scopeId, setting) {
    let html = '';
    
    if (setting.name === 'ocs.ed.mandate.default.details') {
        html += renderMandateDefaultsForm(scopeId);
    } else if (setting.name === 'manual.payments.reference.config') {
        html += renderManualPaymentReferenceForm(scopeId);
    }
    
    return html;
}

function renderMandateDefaultsForm(scopeId) {
    let html = `
        <div class="card mb-3">
            <div class="card-header">
                <h6 class="mb-0">Mandate Default Configuration</h6>
            </div>
            <div class="card-body">
                <div class="row">
    `;
    
    Object.keys(mandateDefaultsConfig).forEach(key => {
        const config = mandateDefaultsConfig[key];
        const fieldId = `mandate-default-${key}`;
        
        html += `<div class="col-md-6 mb-3">`;
        html += `<label for="${fieldId}" class="form-label form-label-sm">${config.label}`;
        if (config.description) {
            html += ` <i class="bi bi-info-circle text-info" data-bs-toggle="tooltip" title="${config.description}"></i>`;
        }
        html += `</label>`;
        
        if (config.type === 'checkbox') {
            html += `
                <div class="form-check form-switch">
                    <input class="form-check-input" type="checkbox" id="${fieldId}" ${config.default ? 'checked' : ''}>
                </div>
            `;
        } else if (config.type === 'select') {
            html += `<select class="form-select form-select-sm" id="${fieldId}">`;
            config.options.forEach(option => {
                const selected = option === config.default ? 'selected' : '';
                html += `<option value="${option}" ${selected}>${option}</option>`;
            });
            html += `</select>`;
        } else if (config.type === 'number') {
            html += `<input type="number" class="form-control form-control-sm" id="${fieldId}" value="${config.default || ''}" placeholder="${config.description || ''}">`;
        } else {
            html += `<input type="text" class="form-control form-control-sm" id="${fieldId}" value="${config.default || ''}" placeholder="${config.description || ''}">`;
        }
        
        html += `</div>`;
    });
    
    html += `
                </div>
            </div>
        </div>
    `;
    
    return html;
}

function renderManualPaymentReferenceForm(scopeId) {
    let html = `
        <div class="card mb-3">
            <div class="card-header">
                <div class="form-check form-switch">
                    <input class="form-check-input" type="checkbox" id="manual-payment-ref-enabled">
                    <label class="form-check-label" for="manual-payment-ref-enabled">
                        <h6 class="mb-0">Enable Additional Reference Fields</h6>
                    </label>
                </div>
            </div>
            <div class="card-body" id="manual-payment-ref-fields" style="display: none;">
                <div class="row">
                    <div class="col-md-6 mb-3">
                        <label for="manual-payment-ref-customer" class="form-label form-label-sm">Customer Reference</label>
                        <select class="form-select form-select-sm" id="manual-payment-ref-customer">
                            <option value="disabled" selected>Disabled</option>
                            <option value="enabled">Enabled</option>
                            <option value="required">Required</option>
                        </select>
                    </div>
                    <div class="col-md-6 mb-3">
                        <label for="manual-payment-ref-internal" class="form-label form-label-sm">Internal Reference</label>
                        <select class="form-select form-select-sm" id="manual-payment-ref-internal">
                            <option value="disabled" selected>Disabled</option>
                            <option value="enabled">Enabled</option>
                            <option value="required">Required</option>
                        </select>
                    </div>
                </div>
                <div class="alert alert-info alert-sm">
                    <i class="bi bi-info-circle me-2"></i>
                    <small>These settings control what reference fields appear on manual payments in EasyPOS</small>
                </div>
            </div>
        </div>
    `;
    
    return html;
}

// Enhanced renderGroupedSettings function to handle special settings
function renderGroupedSettingsEnhanced(settings, prefix, type = 'scope', scope, serviceName = '') {
    console.log(`Rendering grouped settings for type: ${type}, scope: ${scope}, service: ${serviceName}`);
    let html = '';
    prefix = safeRename(prefix);

    if (!settings || settings.length === 0) {
        return html;
    }

    // Group settings by their group property
    const groupedSettings = {};

    settings.forEach(setting => {
        let groupName, settingObj;
        
        if (typeof setting === 'string') {
            groupName = 'General Settings';
            settingObj = {
                name: setting,
                type: 'text',
                label: setting,
                description: settingDescriptions[setting] || 'No description available',
                placeholder: `Enter value for ${setting}`
            };
        } else if (typeof setting === 'object') {
            groupName = setting.group || 'General Settings';
            settingObj = setting;
        }

        if (!groupedSettings[groupName]) {
            groupedSettings[groupName] = [];
        }
        groupedSettings[groupName].push(settingObj);
    });

    // Render groups
    const mainGroupNames = Object.keys(groupedSettings);
    const hasMultipleMainGroups = mainGroupNames.length > 1;

    if (hasMultipleMainGroups) {
        html += `<div class="accordion accordion-spaced">`;
    }

    let mainGroupIndex = 0;

    mainGroupNames.forEach(mainGroupName => {
        const groupSettings = groupedSettings[mainGroupName];
        const mainGroupHtmlId = safeReplace(mainGroupName.toLowerCase(), /\s/g, '_');
        
        const isMainGroupOpen = mainGroupIndex === 0;
        const mainGroupButtonClass = isMainGroupOpen ? '' : 'collapsed';
        const mainGroupAriaExpanded = isMainGroupOpen ? 'true' : 'false';
        const mainGroupShowClass = isMainGroupOpen ? 'show' : '';
        
        mainGroupIndex++;

        if (hasMultipleMainGroups) {
            html += `
                <div class="accordion-item">
                    <h2 class="accordion-header">
                        <button class="accordion-button ${mainGroupButtonClass} bg-none" type="button" data-bs-toggle="collapse" aria-expanded="${mainGroupAriaExpanded}" data-bs-target="#${mainGroupHtmlId}">
                            <div class="d-flex justify-content-between w-100 me-2">
                                <span>${mainGroupName}</span>
                                <span class="badge bg-secondary rounded-pill me-3">${groupSettings.length}</span>
                            </div>
                        </button>
                    </h2>
                    <div id="${mainGroupHtmlId}" class="accordion-collapse collapse ${mainGroupShowClass}" data-bs-parent=".accordion">
                        <div class="accordion-body">
            `;
        } else {
            html += `<div class="p-0 mt-3"><h6>${mainGroupName}</h6>`;
        }

        // Render settings in this group
        groupSettings.forEach(setting => {
            if (setting.type === 'special') {
                html += renderSpecialSettings(null, prefix, setting);
            } else {
                html += renderSetting(setting, prefix, serviceName);
            }
        });

        if (hasMultipleMainGroups) {
            html += `
                        </div>
                    </div>
                </div>
            `;
        } else {
            html += `</div>`;
        }
    });

    if (hasMultipleMainGroups) {
        html += `</div>`;
    }

    return html;
}

function renderSetting(setting, prefix, serviceName = '') {
    const settingId = `${prefix}-${safeRename(setting.name)}`;
    let html = `<div class="mb-3">`;
    
    // Label
    html += `<label for="${settingId}" class="form-label form-label-sm">${setting.label || setting.name}`;
    if (setting.description) {
        html += ` <i class="bi bi-info-circle text-info" data-bs-toggle="tooltip" title="${setting.description}"></i>`;
    }
    html += `</label>`;
    
    // Input field
    if (setting.type === 'checkbox') {
        html += `
            <div class="form-check form-switch">
                <input class="form-check-input" type="checkbox" id="${settingId}" ${setting.defaultValue ? 'checked' : ''}>
            </div>
        `;
    } else if (setting.type === 'select') {
        html += `<select class="form-select form-select-sm" id="${settingId}">`;
        if (setting.options) {
            setting.options.forEach(option => {
                const selected = option === setting.defaultValue ? 'selected' : '';
                html += `<option value="${option}" ${selected}>${option}</option>`;
            });
        }
        html += `</select>`;
    } else if (setting.type === 'textarea') {
        html += `<textarea class="form-control form-control-sm" id="${settingId}" rows="3" placeholder="${setting.placeholder || ''}">${setting.defaultValue || ''}</textarea>`;
    } else if (setting.type === 'password') {
        html += `<input type="password" class="form-control form-control-sm" id="${settingId}" placeholder="${setting.placeholder || ''}" value="${setting.defaultValue || ''}">`;
    } else {
        html += `<input type="text" class="form-control form-control-sm" id="${settingId}" placeholder="${setting.placeholder || ''}" value="${setting.defaultValue || ''}">`;
    }
    
    // Help text
    if (setting.helpText) {
        html += `<small class="form-text text-muted">${setting.helpText}</small>`;
    }
    
    html += `</div>`;
    return html;
}

// Initialize special settings handlers
$(document).ready(function() {
    // Manual payment reference toggle
    $(document).on('change', '#manual-payment-ref-enabled', function() {
        const enabled = $(this).is(':checked');
        $('#manual-payment-ref-fields').toggle(enabled);
    });
    
    // Add any other special settings initialization here
});

// Export/Import Configuration Functions
function handleExportConfig() {
    console.log('Exporting configuration...');
    
    try {
        const config = {
            version: '1.0',
            timestamp: new Date().toISOString(),
            data: collectFormData()
        };
        
        const json = JSON.stringify(config, null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `entity-config-${Date.now()}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        console.log('Configuration exported successfully');
    } catch (error) {
        console.error('Error exporting configuration:', error);
        alert('Failed to export configuration. Please check the console for details.');
    }
}

function handleImportConfig() {
    const fileInput = $('#importFile')[0];
    const file = fileInput.files[0];
    
    if (!file) {
        alert('Please select a file to import');
        return;
    }
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const config = JSON.parse(e.target.result);
            
            if (!config.data) {
                throw new Error('Invalid configuration file format');
            }
            
            loadConfiguration(config.data);
            alert('Configuration loaded successfully');
        } catch (error) {
            console.error('Error importing configuration:', error);
            alert('Failed to import configuration. Please check the file format.');
        }
    };
    
    reader.readAsText(file);
}

function loadConfiguration(data) {
    // Load basic entity information
    $('#parentName').val(data.parentName || '');
    $('#website').val(data.website || '');
    
    // Load integrator settings
    $('#createIntegrator').prop('checked', data.createIntegrator || false).trigger('change');
    
    // Load device user settings
    $('#createDeviceUser').prop('checked', data.createDeviceUser || false).trigger('change');
    $('#deviceUsername').val(data.deviceUsername || '');
    $('#devicePassword').val(data.devicePassword || '');
    $('#deviceEmail').val(data.deviceEmail || '');
    
    // Load scopes
    if (data.scopes && data.scopes.length > 0) {
        data.scopes.forEach(scope => {
            const $checkbox = $(`#scope-${scope.identifier}`);
            if ($checkbox.length > 0) {
                $checkbox.prop('checked', true).trigger('change');
                
                // Wait for tab to be created, then load settings
                setTimeout(() => {
                    loadScopeSettings(scope);
                }, 100);
            }
        });
    }
}

function loadScopeSettings(scopeConfig) {
    const $tab = $(`#${scopeConfig.identifier}`);
    if ($tab.length === 0) return;
    
    // Load rate limiting
    $tab.find(`#${scopeConfig.identifier}-rate-limit`).prop('checked', scopeConfig.rateLimit || false);
    $tab.find(`#${scopeConfig.identifier}-limit-count`).val(scopeConfig.limitCount || '');
    $tab.find(`#${scopeConfig.identifier}-limit-period`).val(scopeConfig.limitPeriod || '');
    
    // Load settings
    if (scopeConfig.settings && scopeConfig.settings.length > 0) {
        scopeConfig.settings.forEach(setting => {
            const $input = $tab.find(`#${scopeConfig.identifier}-${safeRename(setting.identifier)}`);
            if ($input.length > 0) {
                if ($input.attr('type') === 'checkbox') {
                    $input.prop('checked', setting.value === 'true' || setting.value === true);
                } else {
                    $input.val(setting.value);
                }
            }
        });
    }
}

// Helper function for safe string replacement
function safeReplace(str, search, replacement) {
    if (typeof str !== 'string') return str;
    return str.replace(new RegExp(search, 'g'), replacement);
}

// Helper function for initializing entity card tooltips
function initializeEntityCardTooltips($card) {
    // Dispose of existing tooltips
    $card.find('[data-bs-toggle="tooltip"]').each(function() {
        const tooltip = bootstrap.Tooltip.getInstance(this);
        if (tooltip) tooltip.dispose();
    });
    
    // Initialize new tooltips
    $card.find('[data-bs-toggle="tooltip"]').each(function() {
        new bootstrap.Tooltip(this);
    });
}

// Check tab visibility
function checkTabVisibility() {
    const $tabs = $('.scope-tab-link');
    const $noTabsMessage = $('#noTabsMessage');
    const $noScopesInfo = $('#noScopesInfoMessage');
    
    if ($tabs.length > 0) {
        $noTabsMessage.hide();
        $noScopesInfo.hide();
    } else {
        $noTabsMessage.show();
        $noScopesInfo.show();
    }
}

// Auto-select scopes from query parameters
function autoSelectScopesFromQueryParams() {
    const urlParams = new URLSearchParams(window.location.search);
    const scopesParam = urlParams.get('scopes');
    
    if (scopesParam) {
        const scopesToSelect = scopesParam.split(',');
        scopesToSelect.forEach(scope => {
            const $checkbox = $(`#scope-${scope.trim()}`);
            if ($checkbox.length > 0) {
                $checkbox.prop('checked', true).trigger('change');
            }
        });
    }
}

// Initialize dependency handlers for conditional fields
function initializeDependencyHandlers(container) {
    $(container).find('[data-depends-on]').each(function() {
        const $dependent = $(this);
        const dependsOn = $dependent.data('depends-on');
        const [parentId, parentValue] = dependsOn.split(':');
        
        const updateDependentField = () => {
            const $parent = $(`#${parentId}`);
            if ($parent.length === 0) return;
            
            let parentCurrentValue;
            if ($parent.attr('type') === 'checkbox') {
                parentCurrentValue = $parent.is(':checked') ? 'true' : 'false';
            } else {
                parentCurrentValue = $parent.val();
            }
            
            if (parentCurrentValue === parentValue) {
                $dependent.prop('disabled', false);
                $dependent.closest('.mb-3').show();
            } else {
                $dependent.prop('disabled', true);
                $dependent.closest('.mb-3').hide();
            }
        };
        
        // Initial check
        updateDependentField();
        
        // Watch for changes
        $(`#${parentId}`).on('change', updateDependentField);
    });
}
