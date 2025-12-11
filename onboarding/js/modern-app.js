// ===================================
// Modern Client Onboarding App
// ===================================

let currentStep = 1;
let selectedScopes = [];
let scopeConfigurations = {}; // Stores configuration for each scope
let formData = {
    parentName: '',
    website: '',
    createIntegrator: true,
    createDeviceUser: false,
    deviceUsername: '',
    devicePassword: '',
    deviceEmail: 'development@bitventure.co.za',
    scopes: [],
    settings: {}
};

let currentConfigScope = null; // Track which scope is being configured

// ===================================
// Initialization
// ===================================

$(document).ready(function() {
    console.log('Modern Onboarding App Initialized');
    initializeApp();
});

function initializeApp() {
    loadScopes();
    bindEvents();
    updateIntegratorPreview();
}

// ===================================
// Event Bindings
// ===================================

function bindEvents() {
    // Parent name change
    $('#parentName').on('input', function() {
        formData.parentName = $(this).val();
        updateIntegratorPreview();
        updateSummary();
    });

    // Website change
    $('#website').on('input', function() {
        formData.website = $(this).val();
    });

    // Integrator toggle
    $('#createIntegrator').on('change', function() {
        formData.createIntegrator = $(this).is(':checked');
        updateIntegratorPreview();
        updateSummary();
        updateScopeEntityOptions();
    });

    // Device user toggle
    $('#createDeviceUser').on('change', function() {
        formData.createDeviceUser = $(this).is(':checked');
        toggleDeviceUserFields();
        updateSummary();
        updateScopeEntityOptions();
    });

    // Device user fields
    $('#deviceUsername, #devicePassword, #deviceEmail').on('input', function() {
        const id = $(this).attr('id');
        formData[id] = $(this).val();
    });

    // Rate limit toggle in modal
    $('#modalRateLimit').on('change', function() {
        if ($(this).is(':checked')) {
            $('#modalRateLimitFields').removeClass('d-none');
        } else {
            $('#modalRateLimitFields').addClass('d-none');
        }
    });

    // Save scope configuration
    $('#saveScopeConfig').on('click', saveScopeConfiguration);

    // Generate button
    $('#generateBtn').on('click', generateSQL);

    // Copy button
    $('#copyBtn').on('click', copyToClipboard);

    // Download button
    $('#downloadBtn').on('click', downloadSQL);

    // Reset button
    $('#resetBtn').on('click', resetForm);

    // Matrix button
    $('#matrixBtn').on('click', showCompatibilityMatrix);
}

// ===================================
// UI Updates
// ===================================

function updateIntegratorPreview() {
    const parentName = formData.parentName || 'Parent Name';
    $('#integratorNamePreview').text(parentName);
}

function toggleDeviceUserFields() {
    if (formData.createDeviceUser) {
        $('#deviceUserDetails').removeClass('d-none');
    } else {
        $('#deviceUserDetails').addClass('d-none');
    }
}

function updateSummary() {
    $('#summaryParentName').text(formData.parentName || '-');
    $('#summaryScopeCount').text(selectedScopes.length);

    let entityCount = 1; // Parent always exists
    if (formData.createIntegrator) entityCount++;
    if (formData.createDeviceUser) entityCount++;
    $('#summaryEntityCount').text(entityCount);
}

function updateScopeEntityOptions() {
    // Update which entity checkboxes are enabled in the modal
    $('.scope-card').each(function() {
        const scopeCode = $(this).data('scope');
        const config = scopeConfigurations[scopeCode];
        if (config) {
            updateScopeCardBadges(scopeCode);
        }
    });
}

// ===================================
// Step Navigation
// ===================================

function nextStep() {
    if (!validateCurrentStep()) {
        return;
    }

    // Mark current step as completed
    $(`.progress-step[data-step="${currentStep}"]`).addClass('completed');

    // Move to next step
    currentStep++;
    if (currentStep > 4) currentStep = 4;

    // Update UI
    updateStepUI();

    // Load step-specific content
    if (currentStep === 3) {
        loadSettings();
    }

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function previousStep() {
    // Remove completed from current step
    $(`.progress-step[data-step="${currentStep}"]`).removeClass('completed');

    // Move to previous step
    currentStep--;
    if (currentStep < 1) currentStep = 1;

    // Update UI
    updateStepUI();

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function updateStepUI() {
    // Update progress steps
    $('.progress-step').removeClass('active');
    $(`.progress-step[data-step="${currentStep}"]`).addClass('active');

    // Update step panels
    $('.step-panel').removeClass('active');
    $(`#step${currentStep}`).addClass('active');
}

function validateCurrentStep() {
    if (currentStep === 1) {
        // Validate entity details
        if (!formData.parentName || formData.parentName.trim() === '') {
            alert('Please enter a Parent Entity Name');
            $('#parentName').focus();
            return false;
        }

        if (formData.createDeviceUser) {
            if (!$('#deviceUsername').val() || !$('#devicePassword').val()) {
                alert('Please enter both username and password for the device user');
                $('#deviceUsername').focus();
                return false;
            }
        }
    }

    if (currentStep === 2) {
        // Validate scope selection
        if (selectedScopes.length === 0) {
            alert('Please select at least one scope');
            return false;
        }
    }

    return true;
}

function startOver() {
    if (confirm('Are you sure you want to start over? All progress will be lost.')) {
        resetForm();
    }
}

function resetForm() {
    currentStep = 1;
    selectedScopes = [];
    scopeConfigurations = {};
    formData = {
        parentName: '',
        website: '',
        createIntegrator: true,
        createDeviceUser: false,
        deviceUsername: '',
        devicePassword: '',
        deviceEmail: 'development@bitventure.co.za',
        scopes: [],
        settings: {}
    };

    // Reset form inputs
    $('#parentName').val('');
    $('#website').val('');
    $('#createIntegrator').prop('checked', true);
    $('#createDeviceUser').prop('checked', false);
    $('#deviceUsername').val('');
    $('#devicePassword').val('');
    $('#deviceEmail').val('development@bitventure.co.za');
    toggleDeviceUserFields();

    // Reset steps
    $('.progress-step').removeClass('active completed');
    $(`.progress-step[data-step="1"]`).addClass('active');
    $('.step-panel').removeClass('active');
    $('#step1').addClass('active');

    // Hide output
    $('#outputSection').addClass('d-none');

    // Reload scopes
    loadScopes();

    // Update summary
    updateSummary();

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ===================================
// Scope Loading & Configuration
// ===================================

function loadScopes() {
    const scopeGrid = $('#scopeGrid');
    scopeGrid.empty();

    Object.keys(scopes).forEach(scopeCode => {
        const scope = scopes[scopeCode];

        // Filter scopes by allowOn - check if scope is allowed for any available entity
        if (scope.allowOn) {
            const hasAllowedEntity = scope.allowOn.some(entityType => {
                if (entityType === 'parent') return true;
                if (entityType === 'integrator') return formData.createIntegrator;
                if (entityType === 'deviceuser') return formData.createDeviceUser;
                return false;
            });
            if (!hasAllowedEntity) return; // Skip this scope
        }

        const serviceCount = scope.services ? scope.services.length : 0;
        const isSelected = selectedScopes.includes(scopeCode);

        const scopeCard = $(`
            <div class="scope-card ${isSelected ? 'selected' : ''}" data-scope="${scopeCode}">
                <button class="btn btn-sm btn-outline-primary configure-btn" data-scope="${scopeCode}">
                    <i class="fas fa-cog"></i>
                </button>
                <div class="scope-header">
                    <div class="scope-icon">
                        <i class="fas fa-cube"></i>
                    </div>
                    <div class="flex-grow-1">
                        <div class="scope-code">${scopeCode}</div>
                        <div class="scope-title">${scope.name}</div>
                    </div>
                    <div class="scope-checkbox">
                        <input type="checkbox" class="form-check-input" id="scope-${scopeCode}"
                               value="${scopeCode}" ${isSelected ? 'checked' : ''}>
                    </div>
                </div>
                <div class="scope-services">
                    <div class="scope-services-label">Services</div>
                    <span class="service-count">${serviceCount} service${serviceCount !== 1 ? 's' : ''}</span>
                </div>
                <div class="scope-entities" id="scope-entities-${scopeCode}">
                    <!-- Entity badges will be added here -->
                </div>
            </div>
        `);

        // Card click toggles selection
        scopeCard.on('click', function(e) {
            if (e.target.type !== 'checkbox' && !$(e.target).closest('.configure-btn').length) {
                const checkbox = $(this).find('input[type="checkbox"]');
                checkbox.prop('checked', !checkbox.prop('checked')).trigger('change');
            }
        });

        // Checkbox change
        scopeCard.find('input[type="checkbox"]').on('change', function(e) {
            e.stopPropagation();
            toggleScope(scopeCode, $(this).is(':checked'));
        });

        // Configure button
        scopeCard.find('.configure-btn').on('click', function(e) {
            e.stopPropagation();
            openScopeConfigModal(scopeCode);
        });

        scopeGrid.append(scopeCard);

        // Update badges if already configured
        if (scopeConfigurations[scopeCode]) {
            updateScopeCardBadges(scopeCode);
        } else if (isSelected) {
            // Initialize with default configuration
            initializeScopeConfig(scopeCode);
            updateScopeCardBadges(scopeCode);
        }
    });
}

function toggleScope(scopeCode, isSelected) {
    const scopeCard = $(`.scope-card[data-scope="${scopeCode}"]`);

    if (isSelected) {
        scopeCard.addClass('selected');
        if (!selectedScopes.includes(scopeCode)) {
            selectedScopes.push(scopeCode);
            initializeScopeConfig(scopeCode);
            updateScopeCardBadges(scopeCode);
        }
    } else {
        scopeCard.removeClass('selected');
        selectedScopes = selectedScopes.filter(s => s !== scopeCode);
        delete scopeConfigurations[scopeCode];
    }

    formData.scopes = selectedScopes;
    updateSummary();
}

function initializeScopeConfig(scopeCode) {
    scopeConfigurations[scopeCode] = {
        linkParent: true,
        linkIntegrator: formData.createIntegrator,
        linkDeviceUser: false,
        rateLimit: false,
        limitCount: null,
        limitPeriod: null
    };
}

function openScopeConfigModal(scopeCode) {
    currentConfigScope = scopeCode;
    const scope = scopes[scopeCode];
    const config = scopeConfigurations[scopeCode] || {};

    // Set modal title
    $('#modalScopeName').text(`${scopeCode} - ${scope.name}`);

    // Set current values
    $('#modalLinkParent').prop('checked', true); // Always true
    $('#modalLinkIntegrator')
        .prop('checked', config.linkIntegrator || false)
        .prop('disabled', !formData.createIntegrator);
    $('#modalLinkDeviceUser')
        .prop('checked', config.linkDeviceUser || false)
        .prop('disabled', !formData.createDeviceUser);

    $('#modalRateLimit').prop('checked', config.rateLimit || false);
    $('#modalLimitCount').val(config.limitCount || '');
    $('#modalLimitPeriod').val(config.limitPeriod || '');

    // Show/hide rate limit fields
    if (config.rateLimit) {
        $('#modalRateLimitFields').removeClass('d-none');
    } else {
        $('#modalRateLimitFields').addClass('d-none');
    }

    // Show modal
    const modal = new bootstrap.Modal(document.getElementById('scopeConfigModal'));
    modal.show();
}

function saveScopeConfiguration() {
    if (!currentConfigScope) return;

    const config = {
        linkParent: true,
        linkIntegrator: $('#modalLinkIntegrator').is(':checked'),
        linkDeviceUser: $('#modalLinkDeviceUser').is(':checked'),
        rateLimit: $('#modalRateLimit').is(':checked'),
        limitCount: $('#modalLimitCount').val() || null,
        limitPeriod: $('#modalLimitPeriod').val() || null
    };

    scopeConfigurations[currentConfigScope] = config;
    updateScopeCardBadges(currentConfigScope);

    // Close modal
    const modal = bootstrap.Modal.getInstance(document.getElementById('scopeConfigModal'));
    modal.hide();

    currentConfigScope = null;
}

function updateScopeCardBadges(scopeCode) {
    const container = $(`#scope-entities-${scopeCode}`);
    container.empty();

    const config = scopeConfigurations[scopeCode];
    if (!config) return;

    // Entity badges
    if (config.linkParent) {
        container.append(`
            <span class="entity-badge active">
                <i class="fas fa-building"></i> Parent
            </span>
        `);
    }

    if (config.linkIntegrator && formData.createIntegrator) {
        container.append(`
            <span class="entity-badge active">
                <i class="fas fa-plug"></i> Integrator
            </span>
        `);
    }

    if (config.linkDeviceUser && formData.createDeviceUser) {
        container.append(`
            <span class="entity-badge active">
                <i class="fas fa-user-cog"></i> Device User
            </span>
        `);
    }

    // Rate limit badge
    if (config.rateLimit) {
        const limitText = config.limitCount && config.limitPeriod
            ? `${config.limitCount}/${config.limitPeriod}`
            : 'Enabled';
        container.append(`
            <span class="rate-limit-badge">
                <i class="fas fa-tachometer-alt"></i> ${limitText}
            </span>
        `);
    }
}

// ===================================
// Settings Loading
// ===================================

function loadSettings() {
    const container = $('#settingsContainer');
    container.empty();

    if (selectedScopes.length === 0) {
        container.html(`
            <div class="text-center text-muted py-5">
                <i class="fas fa-info-circle fa-3x mb-3"></i>
                <p>No scopes selected. Go back to select scopes.</p>
            </div>
        `);
        return;
    }

    const accordion = $('<div class="accordion settings-accordion" id="settingsAccordion"></div>');

    selectedScopes.forEach((scopeCode, index) => {
        const scope = scopes[scopeCode];
        const config = scopeConfigurations[scopeCode];
        const accordionItem = createSettingsAccordion(scopeCode, scope, config, index);
        accordion.append(accordionItem);
    });

    container.append(accordion);

    // Initialize dependency handlers after a delay to ensure DOM is ready
    setTimeout(() => {
        initializeDependencyHandlers();
    }, 500);
}

function initializeDependencyHandlers() {
    // Find all fields with dependencies
    $('.setting-field[data-depends-on]').each(function() {
        const $field = $(this);
        const dependsOn = $field.data('depends-on');
        const dependsValue = $field.data('depends-value');
        const dependsAction = $field.data('depends-action') || 'disable';

        // Find the parent field by looking for fields with matching name
        const $parentFields = $(`.setting-field`).filter(function() {
            const fieldId = $(this).attr('id') || $(this).attr('name');
            return fieldId && fieldId.includes(safeId(dependsOn));
        });

        if ($parentFields.length > 0) {
            // Set up change handler
            $parentFields.on('change', function() {
                checkDependency($field, $(this), dependsValue, dependsAction);
            });

            // Initialize state
            checkDependency($field, $parentFields.first(), dependsValue, dependsAction);
        }
    });
}

function checkDependency($dependentField, $parentField, requiredValue, action) {
    let parentValue;

    if ($parentField.is(':checkbox')) {
        parentValue = $parentField.is(':checked') ? 'true' : 'false';
    } else if ($parentField.is(':radio')) {
        parentValue = $(`input[name="${$parentField.attr('name')}"]:checked`).val();
    } else {
        parentValue = $parentField.val();
    }

    const conditionMet = String(parentValue) === String(requiredValue);
    const $wrapper = $dependentField.closest('.dependent-field');

    if (action === 'disable') {
        if (conditionMet) {
            $dependentField.prop('disabled', false);
            if ($wrapper.length) $wrapper.show();
        } else {
            $dependentField.prop('disabled', true);
            if ($wrapper.length) $wrapper.hide();
        }
    } else if (action === 'hide') {
        if (conditionMet) {
            if ($wrapper.length) $wrapper.show();
        } else {
            if ($wrapper.length) $wrapper.hide();
        }
    }
}

function createSettingsAccordion(scopeCode, scope, config, index) {
    const collapseId = `collapse-${scopeCode}`;
    const isFirst = index === 0;

    const item = $(`
        <div class="accordion-item">
            <h2 class="accordion-header">
                <button class="accordion-button ${!isFirst ? 'collapsed' : ''}" type="button"
                        data-bs-toggle="collapse" data-bs-target="#${collapseId}">
                    <i class="fas fa-cog me-2"></i>
                    ${scopeCode} - ${scope.name}
                </button>
            </h2>
            <div id="${collapseId}" class="accordion-collapse collapse ${isFirst ? 'show' : ''}"
                 data-bs-parent="#settingsAccordion">
                <div class="accordion-body">
                    <div id="settings-${scopeCode}"></div>
                </div>
            </div>
        </div>
    `);

    // Populate settings after DOM is ready
    setTimeout(() => {
        populateScopeSettings(scopeCode, scope, config);
    }, 100);

    return item;
}

function populateScopeSettings(scopeCode, scope, config) {
    const container = $(`#settings-${scopeCode}`);
    container.empty();

    // Determine which entities have this scope
    const entities = [];
    if (config.linkParent) entities.push({ code: 'parent', name: 'Parent Entity', icon: 'fa-building' });
    if (config.linkIntegrator && formData.createIntegrator) {
        entities.push({ code: 'integrator', name: 'Integrator', icon: 'fa-plug' });
    }
    if (config.linkDeviceUser && formData.createDeviceUser) {
        entities.push({ code: 'deviceuser', name: 'Device User', icon: 'fa-user-cog' });
    }

    if (entities.length === 0) {
        container.append(`
            <div class="alert alert-warning">
                <i class="fas fa-exclamation-triangle me-2"></i>
                No entities configured for this scope.
            </div>
        `);
        return;
    }

    // Create tabs for each entity
    const tabsNav = $('<ul class="nav nav-tabs entity-settings-tabs" role="tablist"></ul>');
    const tabsContent = $('<div class="tab-content entity-tab-content"></div>');

    entities.forEach((entity, idx) => {
        const tabId = `${scopeCode}-${entity.code}-tab`;
        const paneId = `${scopeCode}-${entity.code}-pane`;
        const isActive = idx === 0;

        // Tab nav
        tabsNav.append(`
            <li class="nav-item" role="presentation">
                <button class="nav-link ${isActive ? 'active' : ''}" id="${tabId}"
                        data-bs-toggle="tab" data-bs-target="#${paneId}" type="button">
                    <i class="fas ${entity.icon}"></i> ${entity.name}
                </button>
            </li>
        `);

        // Tab pane
        const pane = $(`
            <div class="tab-pane fade ${isActive ? 'show active' : ''}" id="${paneId}" role="tabpanel">
                <div id="settings-${scopeCode}-${entity.code}"></div>
            </div>
        `);
        tabsContent.append(pane);

        // Populate entity settings
        setTimeout(() => {
            populateEntitySettings(scopeCode, scope, entity.code);
        }, 100);
    });

    container.append(tabsNav);
    container.append(tabsContent);
}

function populateEntitySettings(scopeCode, scope, entityCode) {
    const container = $(`#settings-${scopeCode}-${entityCode}`);
    container.empty();

    let hasSettings = false;

    // Scope-level settings
    if (scope.settings && scope.settings.length > 0) {
        // Filter settings by entity type
        const filteredSettings = filterSettingsByEntity(scope.settings, entityCode);
        if (filteredSettings.length > 0) {
            hasSettings = true;
            const settingsHTML = renderSettingsGroup(
                'Scope Settings',
                filteredSettings,
                scopeCode,
                'scope',
                '',
                entityCode
            );
            container.append(settingsHTML);
        }
    }

    // Service-level settings
    if (scope.services && scope.services.length > 0) {
        scope.services.forEach(service => {
            // Check if service is allowed for this entity
            if (service.allowOn && !service.allowOn.includes(entityCode)) {
                return; // Skip this service for this entity
            }

            if (service.settings && service.settings.length > 0) {
                // Filter settings by entity type
                const filteredSettings = filterSettingsByEntity(service.settings, entityCode);
                if (filteredSettings.length > 0) {
                    hasSettings = true;
                    const settingsHTML = renderSettingsGroup(
                        service.description || service.name,
                        filteredSettings,
                        scopeCode,
                        'service',
                        service.name,
                        entityCode
                    );
                    container.append(settingsHTML);
                }
            }
        });
    }

    if (!hasSettings) {
        container.append(`
            <div class="alert alert-info">
                <i class="fas fa-info-circle me-2"></i>
                No configurable settings for this entity.
            </div>
        `);
    }
}

function filterSettingsByEntity(settings, entityCode) {
    return settings.filter(setting => {
        const settingDef = typeof setting === 'string' ? { name: setting } : setting;

        // Check applyTo property
        if (settingDef.applyTo) {
            return settingDef.applyTo === entityCode;
        }

        // Check allowOn property
        if (settingDef.allowOn) {
            return settingDef.allowOn.includes(entityCode);
        }

        // If neither property exists, allow for all entities
        return true;
    });
}

function renderSettingsGroup(title, settings, scopeCode, type, serviceName, entityCode) {
    const groupId = serviceName
        ? `${scopeCode}-${entityCode}-${safeId(serviceName)}`
        : `${scopeCode}-${entityCode}`;

    const group = $(`
        <div class="settings-group">
            <h6 class="settings-group-title">${title}</h6>
            <div class="row g-3" id="group-${groupId}"></div>
        </div>
    `);

    const container = group.find(`#group-${groupId}`);

    // Group JSON object settings by name
    const jsonObjectGroups = {};
    const regularSettings = [];

    settings.forEach(setting => {
        const settingDef = typeof setting === 'string' ? { name: setting } : setting;

        // If setting has a 'field' property, it's part of a JSON object
        if (settingDef.field) {
            if (!jsonObjectGroups[settingDef.name]) {
                jsonObjectGroups[settingDef.name] = [];
            }
            jsonObjectGroups[settingDef.name].push(settingDef);
        } else {
            regularSettings.push(settingDef);
        }
    });

    // Render regular settings
    regularSettings.forEach(settingDef => {
        const fieldHTML = renderSettingField(settingDef, scopeCode, serviceName, entityCode);
        container.append(fieldHTML);
    });

    // Render JSON object settings grouped
    Object.keys(jsonObjectGroups).forEach(jsonObjectName => {
        const fields = jsonObjectGroups[jsonObjectName];
        const jsonGroupHTML = renderJSONObjectGroup(jsonObjectName, fields, scopeCode, serviceName, entityCode);
        container.append(jsonGroupHTML);
    });

    return group;
}

function renderJSONObjectGroup(objectName, fields, scopeCode, serviceName, entityCode) {
    const groupContainer = $(`
        <div class="col-12">
            <div class="json-object-group mb-3">
                <h6 class="text-muted mb-3"><i class="fas fa-code-branch me-2"></i>${objectName}</h6>
                <div class="row g-3" id="json-group-${safeId(objectName)}"></div>
            </div>
        </div>
    `);

    const container = groupContainer.find(`#json-group-${safeId(objectName)}`);

    fields.forEach(field => {
        const fieldHTML = renderSettingField(field, scopeCode, serviceName, entityCode, true);
        container.append(fieldHTML);
    });

    return groupContainer;
}

function renderSettingField(setting, scopeCode, serviceName, entityCode, isJSONField = false) {
    // Use field name if this is part of a JSON object
    const fieldName = isJSONField ? setting.field : setting.name;
    const settingId = serviceName
        ? `${scopeCode}-${entityCode}-${safeId(serviceName)}-${safeId(fieldName)}`
        : `${scopeCode}-${entityCode}-${safeId(fieldName)}`;

    const label = setting.label || setting.placeholder || fieldName;
    const description = setting.description || setting.helpText || '';
    const type = setting.type || 'text';

    // Handle dependencies
    let dependencyAttrs = '';
    let initiallyHidden = false;
    if (setting.dependsOn) {
        const [dependField, dependValue] = setting.dependsOn.split(':');
        const dependAction = setting.dependencyAction || 'disable';
        dependencyAttrs = ` data-depends-on="${dependField}" data-depends-value="${dependValue}" data-depends-action="${dependAction}"`;

        // Initially hide/disable if dependency not met
        initiallyHidden = true;
    }

    // Store JSON metadata if applicable
    const jsonAttrs = isJSONField ? ` data-json-object="${setting.name}" data-json-field="${setting.field}"` : '';

    let inputHTML = '';

    switch (type) {
        case 'checkbox':
            inputHTML = `
                <div class="form-check form-switch">
                    <input class="form-check-input setting-field" type="checkbox" id="${settingId}"
                           ${setting.defaultValue ? 'checked' : ''}${dependencyAttrs}${jsonAttrs}>
                    <label class="form-check-label" for="${settingId}">
                        ${label}
                    </label>
                </div>
                ${description ? `<small class="form-text text-muted d-block mt-1">${description}</small>` : ''}
            `;
            break;

        case 'dropdown':
        case 'select':
            const options = setting.values || [];
            inputHTML = `
                <label for="${settingId}" class="form-label">${label}</label>
                <select class="form-select setting-field" id="${settingId}"${dependencyAttrs}${jsonAttrs}>
                    ${options.map(opt => {
                        const value = typeof opt === 'object' ? opt.value : opt;
                        const selected = value === setting.defaultValue ? 'selected' : '';
                        return `<option value="${value}" ${selected}>${value}</option>`;
                    }).join('')}
                </select>
                ${description ? `<small class="form-text text-muted">${description}</small>` : ''}
            `;
            break;

        case 'radio':
            const radioOptions = setting.values || setting.options || [];
            inputHTML = `
                <label class="form-label">${label}</label>
                <div class="radio-group">
                    ${radioOptions.map((opt, idx) => {
                        const value = typeof opt === 'object' ? opt.value : opt;
                        const radioLabel = typeof opt === 'object' ? opt.label : opt;
                        const checked = value === setting.defaultValue ? 'checked' : '';
                        return `
                            <div class="form-check">
                                <input class="form-check-input setting-field" type="radio" name="${settingId}"
                                       id="${settingId}-${idx}" value="${value}" ${checked}${dependencyAttrs}${jsonAttrs}>
                                <label class="form-check-label" for="${settingId}-${idx}">
                                    ${radioLabel}
                                </label>
                            </div>
                        `;
                    }).join('')}
                </div>
                ${description ? `<small class="form-text text-muted">${description}</small>` : ''}
            `;
            break;

        case 'textarea':
            inputHTML = `
                <label for="${settingId}" class="form-label">${label}</label>
                <textarea class="form-control setting-field" id="${settingId}" rows="3"
                          placeholder="${setting.placeholder || ''}"${dependencyAttrs}${jsonAttrs}>${setting.defaultValue || ''}</textarea>
                ${description ? `<small class="form-text text-muted">${description}</small>` : ''}
            `;
            break;

        default:
            inputHTML = `
                <label for="${settingId}" class="form-label">${label}</label>
                <input type="${type}" class="form-control setting-field" id="${settingId}"
                       placeholder="${setting.placeholder || ''}"
                       value="${setting.defaultValue || ''}"
                       ${setting.maxLength ? `maxlength="${setting.maxLength}"` : ''}${dependencyAttrs}${jsonAttrs}>
                ${description ? `<small class="form-text text-muted">${description}</small>` : ''}
            `;
    }

    const wrapperClass = initiallyHidden ? 'col-md-6 dependent-field' : 'col-md-6';
    const wrapperStyle = initiallyHidden ? ' style="display:none;"' : '';
    return $(`<div class="${wrapperClass}"${wrapperStyle}><div class="mb-3">${inputHTML}</div></div>`);
}

// ===================================
// SQL Generation
// ===================================

function generateSQL() {
    // Show loading
    $('#loadingOverlay').removeClass('d-none');

    setTimeout(() => {
        try {
            const sqlScript = buildSQLScript();
            $('#sqlOutput').text(sqlScript);
            $('#outputSection').removeClass('d-none');

            // Hide loading
            $('#loadingOverlay').addClass('d-none');

            // Scroll to output
            $('html, body').animate({
                scrollTop: $('#outputSection').offset().top - 100
            }, 500);
        } catch (error) {
            console.error('Error generating SQL:', error);
            alert('Error generating SQL script. Please check the console for details.');
            $('#loadingOverlay').addClass('d-none');
        }
    }, 500);
}

function buildSQLScript() {
    const timestamp = new Date().toLocaleString();
    const parentName = escapeSQL(formData.parentName);
    const website = formData.website || 'http://www.bitventure.co.za';

    let sql = `-- Generated SQL Onboarding Script
-- Date: ${timestamp}
-- Parent Entity: ${parentName}
-- Generated by: SQL Client Onboarding Generator

DO $$

DECLARE
-- Parent Entity ---------------
\tparent_name \t\t\t\tTEXT := \t'${parentName}';
\tentity_service_types \t\tTEXT[] :=array[
--  | Scope | Limit | Count | Period|
`;

    // Add service types with rate limiting config
    selectedScopes.forEach((scope, index) => {
        const config = scopeConfigurations[scope];
        const rateLimit = config?.rateLimit ? 'true' : 'false';
        const limitCount = config?.rateLimit && config.limitCount ? config.limitCount : 'null';
        const limitPeriod = config?.rateLimit && config.limitPeriod ? `'${config.limitPeriod}'` : 'null';

        sql += `\t[ '${scope}', '${rateLimit}',  ${limitCount},   ${limitPeriod}\t]`;
        if (index < selectedScopes.length - 1) {
            sql += ',\n';
        }
    });

    sql += `
    ];

-- Integration Entity ----------
\tcreate_integration_entity \tBOOLEAN:= \t${formData.createIntegrator};

-- Device User -----------------
    create_device_user \t\t\tBOOLEAN:= \t${formData.createDeviceUser};
    device_user_username \t\tTEXT:= \t\t'${escapeSQL(formData.deviceUsername || '')}';
    device_user_password \t\tTEXT:= \t\t'${escapeSQL(formData.devicePassword || '')}';
    device_user_email_address \tTEXT:= \t\t'${escapeSQL(formData.deviceEmail)}';
    device_user_is_active \t\tBOOLEAN:= \ttrue;


-- Entity Settings
\t-- p: Parent, d: Device User, i: Integrator
    entity_settings TEXT[] := array[
    --  | SCOPE  |Entity | Identifier                      | Value         |
`;

    // Collect settings for all entities
    const settings = collectAllSettings();
    settings.forEach((setting, index) => {
        sql += `        ['${setting.scope}',\t\t'${setting.entity}',\t'${setting.identifier}',\t\t\t'${escapeSQL(setting.value)}']`;
        if (index < settings.length - 1) {
            sql += ',\n';
        }
    });

    sql += `
    ];

-- Payment Reference Fields
\tmanual_payments_reference_fields \t\tBOOLEAN:=\t\ttrue;
\tmanual_payments_customer_reference \t\tTEXT:= \t\t\t'disabled';
\tmanual_payments_internal_reference \t\tTEXT:= \t\t\t'disabled';
`;

    // Add OCS defaults if OCS is selected
    if (selectedScopes.includes('OCS')) {
        sql += `
-- Mandate defaults
    ocs_default_mandate_type \t\t\t\tTEXT:= \t\t\t'Usage';
    ocs_default_debit_classification \t\tTEXT:= \t\t\t'LRM';
    ocs_default_max_installment_amount \t\tTEXT:= \t\t\t'10000';
    ocs_default_frequency \t\t\t\t\tTEXT:= \t\t\t'MONTHLY';
    ocs_default_tracking_enabled \t\t\tBOOLEAN:= \t\ttrue;
    ocs_default_date_adjustment_allowed \tTEXT:= \t\t\t'Y';
    ocs_default_adjustment_frequency \t\tTEXT:= \t\t\t'ANNUALLY';
    ocs_default_adjustment_type \t\t\tTEXT:= \t\t\t'RATE';
    ocs_default_adjustment_value \t\t\tTEXT:= \t\t\t'1';
    ocs_default_generate_installment \t\tBOOLEAN:= \t\ttrue;
    ocs_default_calculate_installment \t\tBOOLEAN:= \t\tfalse;
    ocs_default_generate_contract_reference BOOLEAN:= \t\ttrue;
    ocs_default_contract_reference_format \tTEXT:= \t\t\t'';
\tocs_default_scheme \t\t\t\t\t\tTEXT:= \t\t\t'';
`;
    }

    sql += `
-- END OF SETUP SECTION
-------------------------

-- NOTE: The complete script execution logic from the template
-- would continue here with all entity creation, service type assignments,
-- and settings configuration. See generate_script.js for full implementation.

END $$;
`;

    return sql;
}

function collectAllSettings() {
    const settings = [];
    const jsonObjects = {}; // Track JSON objects to build

    selectedScopes.forEach(scopeCode => {
        const scope = scopes[scopeCode];
        const config = scopeConfigurations[scopeCode];

        // Get entity codes that should have this scope
        const entityCodes = [];
        if (config.linkParent) entityCodes.push({ code: 'parent', letter: 'p' });
        if (config.linkIntegrator && formData.createIntegrator) {
            entityCodes.push({ code: 'integrator', letter: 'i' });
        }
        if (config.linkDeviceUser && formData.createDeviceUser) {
            entityCodes.push({ code: 'deviceuser', letter: 'd' });
        }

        entityCodes.forEach(entity => {
            // Collect scope-level settings
            if (scope.settings) {
                collectSettingsFromList(scope.settings, scopeCode, entity, '', settings, jsonObjects);
            }

            // Collect service-level settings
            if (scope.services) {
                scope.services.forEach(service => {
                    // Check if service is allowed for this entity
                    if (service.allowOn && !service.allowOn.includes(entity.code)) {
                        return;
                    }

                    if (service.settings) {
                        collectSettingsFromList(service.settings, scopeCode, entity, service.name, settings, jsonObjects);
                    }
                });
            }
        });
    });

    // Add collected JSON objects to settings
    Object.keys(jsonObjects).forEach(key => {
        const [scope, entity, objectName] = key.split('|||');
        const jsonValue = JSON.stringify(jsonObjects[key]);
        settings.push({
            scope: scope,
            entity: entity,
            identifier: objectName,
            value: jsonValue
        });
    });

    return settings;
}

function collectSettingsFromList(settingsList, scopeCode, entity, serviceName, settings, jsonObjects) {
    // Filter settings by entity type
    const filteredSettings = filterSettingsByEntity(settingsList, entity.code);

    filteredSettings.forEach(setting => {
        const settingDef = typeof setting === 'string' ? { name: setting } : setting;

        // Handle JSON object fields
        if (settingDef.field) {
            const fieldName = settingDef.field;
            const settingId = serviceName
                ? `${scopeCode}-${entity.code}-${safeId(serviceName)}-${safeId(fieldName)}`
                : `${scopeCode}-${entity.code}-${safeId(fieldName)}`;

            const value = getSettingValue(settingId, settingDef);

            if (value !== null && value !== '') {
                // Build JSON object
                const jsonKey = `${scopeCode}|||${entity.letter}|||${settingDef.name}`;
                if (!jsonObjects[jsonKey]) {
                    jsonObjects[jsonKey] = {};
                }
                jsonObjects[jsonKey][fieldName] = value;
            }
        } else {
            // Regular setting
            const settingId = serviceName
                ? `${scopeCode}-${entity.code}-${safeId(serviceName)}-${safeId(settingDef.name)}`
                : `${scopeCode}-${entity.code}-${safeId(settingDef.name)}`;

            const value = getSettingValue(settingId, settingDef);

            if (value !== null && value !== '') {
                settings.push({
                    scope: scopeCode,
                    entity: entity.letter,
                    identifier: settingDef.name,
                    value: value
                });
            }
        }
    });
}

function getSettingValue(settingId, settingDef) {
    const $element = $(`#${settingId}`);
    if (!$element.length) return null;

    const type = settingDef.type || 'text';

    switch (type) {
        case 'checkbox':
            return $element.is(':checked') ? 'true' : 'false';
        case 'radio':
            return $(`input[name="${settingId}"]:checked`).val() || '';
        default:
            return $element.val() || '';
    }
}

// ===================================
// Helper Functions
// ===================================

function safeId(str) {
    return str.replace(/\./g, '-').replace(/:/g, '-').replace(/\s/g, '-').replace(/_/g, '-');
}

function escapeSQL(str) {
    if (!str) return '';
    return String(str).replace(/'/g, "''");
}

function copyToClipboard() {
    const sqlText = $('#sqlOutput').text();

    if (navigator.clipboard) {
        navigator.clipboard.writeText(sqlText).then(() => {
            showCopyFeedback();
        }).catch(err => {
            console.error('Failed to copy:', err);
            fallbackCopy(sqlText);
        });
    } else {
        fallbackCopy(sqlText);
    }
}

function fallbackCopy(text) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-9999px';
    document.body.appendChild(textArea);
    textArea.select();

    try {
        document.execCommand('copy');
        showCopyFeedback();
    } catch (err) {
        console.error('Fallback copy failed:', err);
        alert('Failed to copy to clipboard');
    }

    document.body.removeChild(textArea);
}

function showCopyFeedback() {
    const btn = $('#copyBtn');
    const originalHTML = btn.html();
    btn.html('<i class="fas fa-check"></i> Copied!');
    setTimeout(() => {
        btn.html(originalHTML);
    }, 2000);
}

function downloadSQL() {
    const sqlText = $('#sqlOutput').text();
    const parentName = formData.parentName.replace(/\s+/g, '_');
    const filename = `onboarding_${parentName}_${Date.now()}.sql`;

    const blob = new Blob([sqlText], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
}

// ===================================
// Compatibility Matrix
// ===================================

function showCompatibilityMatrix() {
    const container = $('#matrixContainer');
    container.empty();

    const table = $('<table class="table table-bordered table-hover compatibility-matrix"></table>');

    // Create header
    const thead = $('<thead class="table-dark"></thead>');
    const headerRow = $(`
        <tr>
            <th style="width: 30%;">Scope / Service / Setting</th>
            <th style="width: 15%;" class="text-center">Parent</th>
            <th style="width: 15%;" class="text-center">Integrator</th>
            <th style="width: 15%;" class="text-center">Device User</th>
            <th style="width: 25%;">Notes</th>
        </tr>
    `);
    thead.append(headerRow);
    table.append(thead);

    const tbody = $('<tbody></tbody>');

    // Iterate through all scopes
    Object.keys(scopes).sort().forEach(scopeCode => {
        const scope = scopes[scopeCode];

        // Scope row
        const scopeAllowOn = scope.allowOn || ['parent', 'integrator', 'deviceuser'];
        const scopeRow = $(`
            <tr class="scope-row">
                <td><strong><i class="fas fa-cube text-primary me-2"></i>${scopeCode}</strong> - ${scope.name}</td>
                <td class="text-center">${scopeAllowOn.includes('parent') ? '<span class="badge bg-success">✓</span>' : '<span class="badge bg-secondary">✗</span>'}</td>
                <td class="text-center">${scopeAllowOn.includes('integrator') ? '<span class="badge bg-success">✓</span>' : '<span class="badge bg-secondary">✗</span>'}</td>
                <td class="text-center">${scopeAllowOn.includes('deviceuser') ? '<span class="badge bg-success">✓</span>' : '<span class="badge bg-secondary">✗</span>'}</td>
                <td><small class="text-muted">${scope.services ? scope.services.length : 0} service(s)</small></td>
            </tr>
        `);
        tbody.append(scopeRow);

        // Services
        if (scope.services && scope.services.length > 0) {
            scope.services.forEach(service => {
                const serviceAllowOn = service.allowOn || scopeAllowOn;
                const serviceRow = $(`
                    <tr class="service-row">
                        <td class="ps-5"><i class="fas fa-cog text-info me-2"></i>${service.description || service.name}</td>
                        <td class="text-center">${serviceAllowOn.includes('parent') ? '<span class="badge bg-success">✓</span>' : '<span class="badge bg-secondary">✗</span>'}</td>
                        <td class="text-center">${serviceAllowOn.includes('integrator') ? '<span class="badge bg-success">✓</span>' : '<span class="badge bg-secondary">✗</span>'}</td>
                        <td class="text-center">${serviceAllowOn.includes('deviceuser') ? '<span class="badge bg-success">✓</span>' : '<span class="badge bg-secondary">✗</span>'}</td>
                        <td><small class="text-muted">${service.settings ? service.settings.length : 0} setting(s)</small></td>
                    </tr>
                `);
                tbody.append(serviceRow);

                // Service settings
                if (service.settings && service.settings.length > 0) {
                    service.settings.forEach(setting => {
                        const settingDef = typeof setting === 'string' ? { name: setting } : setting;
                        const settingAllowOn = settingDef.allowOn || (settingDef.applyTo ? [settingDef.applyTo] : serviceAllowOn);

                        const settingName = settingDef.field
                            ? `${settingDef.name}.${settingDef.field}`
                            : settingDef.name;

                        let notes = '';
                        if (settingDef.applyTo) notes += `Only for ${settingDef.applyTo}. `;
                        if (settingDef.dependsOn) notes += `Depends on: ${settingDef.dependsOn}. `;
                        if (settingDef.field) notes += `Part of JSON object. `;

                        const settingRow = $(`
                            <tr class="setting-row">
                                <td class="ps-5"><small><i class="fas fa-sliders-h text-warning me-2"></i>${settingName}</small></td>
                                <td class="text-center">${settingAllowOn.includes('parent') ? '<span class="badge bg-success">✓</span>' : '<span class="badge bg-secondary">✗</span>'}</td>
                                <td class="text-center">${settingAllowOn.includes('integrator') ? '<span class="badge bg-success">✓</span>' : '<span class="badge bg-secondary">✗</span>'}</td>
                                <td class="text-center">${settingAllowOn.includes('deviceuser') ? '<span class="badge bg-success">✓</span>' : '<span class="badge bg-secondary">✗</span>'}</td>
                                <td><small class="text-muted">${notes || '-'}</small></td>
                            </tr>
                        `);
                        tbody.append(settingRow);
                    });
                }
            });
        }

        // Scope-level settings
        if (scope.settings && scope.settings.length > 0) {
            scope.settings.forEach(setting => {
                const settingDef = typeof setting === 'string' ? { name: setting } : setting;
                const settingAllowOn = settingDef.allowOn || (settingDef.applyTo ? [settingDef.applyTo] : scopeAllowOn);

                const settingName = settingDef.field
                    ? `${settingDef.name}.${settingDef.field}`
                    : settingDef.name;

                let notes = 'Scope-level setting. ';
                if (settingDef.applyTo) notes += `Only for ${settingDef.applyTo}. `;
                if (settingDef.dependsOn) notes += `Depends on: ${settingDef.dependsOn}. `;
                if (settingDef.field) notes += `Part of JSON object. `;

                const settingRow = $(`
                    <tr class="setting-row">
                        <td class="ps-4"><small><i class="fas fa-sliders-h text-warning me-2"></i>${settingName}</small></td>
                        <td class="text-center">${settingAllowOn.includes('parent') ? '<span class="badge bg-success">✓</span>' : '<span class="badge bg-secondary">✗</span>'}</td>
                        <td class="text-center">${settingAllowOn.includes('integrator') ? '<span class="badge bg-success">✓</span>' : '<span class="badge bg-secondary">✗</span>'}</td>
                        <td class="text-center">${settingAllowOn.includes('deviceuser') ? '<span class="badge bg-success">✓</span>' : '<span class="badge bg-secondary">✗</span>'}</td>
                        <td><small class="text-muted">${notes || '-'}</small></td>
                    </tr>
                `);
                tbody.append(settingRow);
            });
        }
    });

    table.append(tbody);
    container.append(table);

    // Show modal
    const modal = new bootstrap.Modal(document.getElementById('matrixModal'));
    modal.show();
}

// ===================================
// Export for use with existing generate_script.js
// ===================================

window.nextStep = nextStep;
window.previousStep = previousStep;
window.startOver = startOver;
