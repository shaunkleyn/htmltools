let importConfiguration, exportConfiguration, renderSettings, getAllServiceSettings;

$(document).ready(function () {
    // Check if configuration data is loaded
    if (typeof scopes === 'undefined' || typeof settingDescriptions === 'undefined') {
        console.error('Configuration data not loaded. Please make sure config-data.js is included before this file.');
        return;
    }

    initializeUI();

    function initializeUI() {
        // Handle conditional fields
        $('#createDeviceUser').change(function () {
            if ($(this).is(':checked')) {
                $('#deviceUserFields').addClass('show');
                $('[id$="-link-device-user"]').prop('disabled', false);
            } else {
                $('#deviceUserFields').removeClass('show');
                $('[id$="-link-device-user"]').prop('disabled', true);
                $('[id$="-link-device-user"]').prop('checked', false);
            }
        });

        $('#createIntegrator').change(function () {
            if ($(this).is(':checked')) {
                $('#integratorFields').addClass('show');
                $('[id$="-link-integrator"]').prop('disabled', false);
            } else {
                $('#integratorFields').removeClass('show');
                $('[id$="-link-integrator"]').prop('disabled', true);
                $('[id$="-link-integrator"]').prop('checked', false);
            }
        });

        // Auto-generate integrator name
        $('#parentName').on('input', function () {
            const parentName = $(this).val();
            if (parentName) {
                $('#integratorName').val(parentName + ' :Integrator');
            } else {
                $('#integratorName').val('');
            }
        });

        // Populate scope checkboxes
        const scopeCheckboxesContainer = $('#scopeCheckboxes');
        Object.keys(scopes).forEach(scope => {
            const scopeData = scopes[scope];
            const checkboxHtml = `
            <label  class="list-group-item list-group-item-action no-text-select" for="scope-${scope}">
                <input class="form-check-input me-2 scope-checkbox-input" type="checkbox" value="${scope}" id="scope-${scope}">${scope} - ${scopeData.name}
            </a>
            `;
            // const checkboxHtml = `
            //     <div class="col-md-4 scope-checkbox">
            //         <div class="form-check">
            //             <input class="form-check-input scope-checkbox-input" type="checkbox" value="${scope}" id="scope-${scope}">
            //             <label class="form-check-label" for="scope-${scope}">
            //                 ${scope} - ${scopeData.name}
            //             </label>
            //         </div>
            //     </div>
            // `;
            scopeCheckboxesContainer.append(checkboxHtml);
        });

        // Create empty tabs container
        const scopeTabsContainer = $('#scopeTabs');
        const scopeTabContentContainer = $('#scopeTabContent');
        
        // Clear any existing tabs
        scopeTabsContainer.empty();
        scopeTabContentContainer.empty();

        // Handle scope checkbox changes
        $(document).on('change', '.scope-checkbox-input', function () {
            const scope = $(this).val();
            const isChecked = $(this).is(':checked');

            console.log(`Scope ${scope} changed to: ${isChecked}`);

            if (isChecked) {
                createScopeTab(scope);
                activateScopeTab(scope);
            } else {
                removeScopeTab(scope);
            }

            checkTabVisibility();
        });

        // Handle tab close button clicks
        $(document).on('click', '.close-tab', function (e) {
            e.preventDefault();
            e.stopPropagation();

            const tab = $(this).closest('.nav-link');
            const scope = tab.attr('id').replace('-tab', '');

            // Uncheck the corresponding checkbox
            $(`#scope-${scope}`).prop('checked', false).trigger('change');
        });

        // Update the event handler for entity toggles to refresh tooltips
$('#createDeviceUser, #createIntegrator').change(function() {
    const createDeviceUser = $('#createDeviceUser').is(':checked');
    const createIntegrator = $('#createIntegrator').is(':checked');
    
    // Update all entity cards
    $('.entity-card').each(function() {
        const $card = $(this);
        const isIntegratorCard = $card.find('.integrator-service').length > 0;
        const isDeviceCard = $card.find('.device-service').length > 0;
        
        if (isIntegratorCard) {
            const wasDisabled = $card.hasClass('entity-disabled');
            $card.toggleClass('entity-disabled', !createIntegrator);
            $card.find('.integrator-service, .entity-toggle-all').prop('disabled', !createIntegrator);
            
            // Update tooltip attributes
            if (createIntegrator) {
                $card.removeAttr('data-bs-toggle data-bs-title data-bs-placement');
                $card.find('.integrator-service').removeAttr('data-bs-toggle data-bs-title data-bs-placement');

                // // Destroy any existing tooltip instances
                // const cardTooltip = bootstrap.Tooltip.getInstance($card[0]);
                // if (cardTooltip) cardTooltip.dispose();
                
                // $card.find('.integrator-service').each(function() {
                //     const checkboxTooltip = bootstrap.Tooltip.getInstance(this);
                //     if (checkboxTooltip) checkboxTooltip.dispose();
                // });
            } else {
                $card.attr({
                    'data-bs-toggle': 'tooltip',
                    'data-bs-title': 'Integrator has not been created in the Entity Setup section. Please enable it there first.',
                    'title': 'Integrator has not been created in the Entity Setup section. Please enable it there first.',
                    'data-bs-placement': 'top'
                });
                $card.find('.integrator-service').attr({
                    'data-bs-toggle': 'tooltip',
                    'data-bs-title': 'Enable integrator in Entity Setup to assign services',
                    'title': 'Enable integrator in Entity Setup to assign services',
                    'data-bs-placement': 'left'
                });
            }
            
            if (!createIntegrator) {
                $card.find('.integrator-service, .entity-toggle-all').prop('checked', false);
            }
            
            // Reinitialize tooltips if state changed
            if (wasDisabled !== !createIntegrator) {
                initializeEntityCardTooltips($card);
            }
        }
        
        if (isDeviceCard) {
            const wasDisabled = $card.hasClass('entity-disabled');
            $card.toggleClass('entity-disabled', !createDeviceUser);
            $card.find('.device-service, .entity-toggle-all').prop('disabled', !createDeviceUser);
            
            // Update tooltip attributes
            if (createDeviceUser) {
                $card.removeAttr('data-bs-toggle data-bs-title data-bs-placement');
                $card.find('.device-service').removeAttr('data-bs-toggle data-bs-title data-bs-placement');
                // // Destroy any existing tooltip instances
                // const cardTooltip = bootstrap.Tooltip.getInstance($card[0]);
                // if (cardTooltip) cardTooltip.dispose();
                
                // $card.find('.device-service').each(function() {
                //     const checkboxTooltip = bootstrap.Tooltip.getInstance(this);
                //     if (checkboxTooltip) checkboxTooltip.dispose();
                // });
            } else {
                $card.attr({
                    'data-bs-toggle': 'tooltip',
                    'data-bs-title': 'Device User has not been created in the Entity Setup section. Please enable it there first.',
                    'data-bs-placement': 'top'
                });
                $card.find('.device-service').attr({
                    'data-bs-toggle': 'tooltip',
                    'data-bs-title': 'Enable device user in Entity Setup to assign services',
                    'data-bs-placement': 'left'
                });
            }
            
            if (!createDeviceUser) {
                $card.find('.device-service, .entity-toggle-all').prop('checked', false);
            }
            
            // Reinitialize tooltips if state changed
            if (wasDisabled !== !createDeviceUser) {
                initializeEntityCardTooltips($card);
            }
        }
    });
});

        // Initialize tooltips
        initializeTooltips();

        // AUTO-SELECT SCOPES FROM QUERY PARAMETERS
        autoSelectScopesFromQueryParams();

// Add to initializeUI function:

// Entity "Select All" functionality
$(document).on('change', '.entity-toggle-all', function() {
    const entity = $(this).data('entity');
    const isChecked = $(this).is(':checked');
    const scope = $(this).closest('.tab-pane').attr('id');
    
    $(`#${scope} .${entity}-service`).each(function() {
        if (!$(this).is(':disabled')) {
            $(this).prop('checked', isChecked);
        }
    });
});

// Service settings modal opener
$(document).on('click', '.service-settings-btn', function() {
    const serviceName = $(this).data('service');
    const scope = $(this).data('scope');
    const serviceData = scopes[scope].services.find(s => s.name === serviceName);
    
    if (!serviceData || !serviceData.settings || serviceData.settings.length === 0) {
        return;
    }
    
    // Set modal title
    $('#serviceSettingsModalLabel').text(`Settings: ${serviceData.description}`);
    
    // Load settings into modal
    const settingsHtml = renderGroupedSettings(serviceData.settings, `${scope}-${safeRename(serviceName)}`, 'service', scope);
    $('#serviceSettingsModalBody').html(settingsHtml);
    
    // Store current scope and service for saving
    $('#serviceSettingsModal').data('current-scope', scope);
    $('#serviceSettingsModal').data('current-service', serviceName);
    
    // Initialize tooltips in modal
    initializeTooltips($('#serviceSettingsModal'));
    
    // Show modal
    $('#serviceSettingsModal').modal('show');
});

// Save service settings from modal
$('#saveServiceSettings').click(function() {
    // Settings are automatically saved since they're bound to the same form elements
    $('#serviceSettingsModal').modal('hide');
    
    // Show success feedback
    const serviceName = $('#serviceSettingsModal').data('current-service');
    const scope = $('#serviceSettingsModal').data('current-scope');
    const serviceData = scopes[scope].services.find(s => s.name === serviceName);
    
    // You could add a toast notification here if desired
    console.log(`Settings saved for ${serviceData.description}`);
});

// Update entity card states when device user/integrator checkboxes change
$('#createDeviceUser, #createIntegrator').change(function() {
    const createDeviceUser = $('#createDeviceUser').is(':checked');
    const createIntegrator = $('#createIntegrator').is(':checked');
    
    // Update all entity cards
    $('.entity-card').each(function() {
        const $card = $(this);
        const isIntegratorCard = $card.find('.integrator-service').length > 0;
        const isDeviceCard = $card.find('.deviceuser-service').length > 0;
        
        if (isIntegratorCard) {
            $card.toggleClass('opacity-50', !createIntegrator);
            $card.find('.integrator-service, .entity-toggle-all').prop('disabled', !createIntegrator);
            if (!createIntegrator) {
                $card.find('.integrator-service, .entity-toggle-all').prop('checked', false);
            }
        }
        
        if (isDeviceCard) {
            $card.toggleClass('opacity-50', !createDeviceUser);
            $card.find('.deviceuser-service, .entity-toggle-all').prop('disabled', !createDeviceUser);
            if (!createDeviceUser) {
                $card.find('.deviceuser-service, .entity-toggle-all').prop('checked', false);
            }
        }
    });
});
        
        // Generate script button click handler
        $('#generateScript').click(generateScript);

        // Copy script button click handler
        $('#copyScript').click(copyScriptToClipboard);

        // Import configuration button click handler
        $('#importConfig').click(handleImportConfig);

        // Export configuration button click handler
        $('#exportConfig').click(handleExportConfig);

        $('input[required]').each((i, x) => {
            var id = $(x).attr('id');
            $('label[for="' + id + '"]').addClass('required')
        })

        $('form').on('submit', function(e) {
            e.preventDefault();
            e.stopPropagation();
            $(this).validate();
            $(this).valid();            
        });   
        
        checkTabVisibility();
    }

    function createScopeTab(scope) {
        const scopeTabsContainer = $('#scopeTabs');
        const scopeTabContentContainer = $('#scopeTabContent');
        
        // Check if tab already exists
        if ($(`#${scope}-tab`).length > 0) {
            $(`#${scope}-tab`).parent().show();
            return;
        }

        const scopeData = scopes[scope];
        
        // Create tab
        const tabHtml = `
            <li class="nav-item">
                <a class="nav-link scope-tab-link" id="${scope}-tab" data-bs-toggle="tab" href="#${scope}" role="tab" aria-controls="${scope}" aria-selected="false">
                    ${scope}
                    <span class="close-tab"><i class="bi bi-x"></i></span>
                </a>
            </li>
        `;
        scopeTabsContainer.append(tabHtml);

        // Create tab content
        const tabContentHtml = `
            <div class="tab-pane fade scope-tab" id="${scope}" role="tabpanel" aria-labelledby="${scope}-tab" scope="${scope}" service-type="${scope}" service-type-identifier="${scope}">
                ${renderScopeTab(scope)}
            </div>
        `;
        scopeTabContentContainer.append(tabContentHtml);

        // Initialize tooltips and dependencies for the new tab
        initializeTooltips($(`#${scope}`));
        
        console.log(`Created tab for scope: ${scope}`);
    }

    function activateScopeTab(scope) {
        // Show the tab
        $(`#${scope}-tab`).parent().show();
        
        // Activate the tab using Bootstrap
        const tabElement = document.querySelector(`#${scope}-tab`);
        if (tabElement) {
            const tab = new bootstrap.Tab(tabElement);
            tab.show();
        }

        console.log(`Activated tab for scope: ${scope}`);
    }

    function removeScopeTab(scope) {
        // Remove the tab elements completely
        $(`#${scope}-tab`).parent().remove();
        $(`#${scope}`).remove();
        
        console.log(`Removed tab for scope: ${scope}`);
    }

    function initializeTooltips(container = document) {
        // Initialize Bootstrap tooltips
        const tooltipTriggerList = [].slice.call($(container).find('[data-bs-toggle="tooltip"]'));
        const tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
            return new bootstrap.Tooltip(tooltipTriggerEl);
        });

        // Initialize custom tooltips for info icons
        $(container).find('.setting-info').each(function() {
            new bootstrap.Tooltip(this);
        });
        
        // Initialize dependency handlers
        initializeDependencyHandlers(container);
    }

    function updateTooltips(container = document) {
        $('[data-bs-toggle="tooltip"]').each(function(e) {
        $(this).attr('title', 'New tooltip text1').tooltip('_fixTitle');
        });
    }

    function renderScopeTab(scope) {
        const scopeData = scopes[scope];
        let html = '';

        // Entity Linking section
        // html += `
        //     <div class="settings-section" section="entity-linking">
        //         <div class="row">
        //             <div class="col-md-4">
        //                 <div class="form-check form-switch">
        //                     <input class="form-check-input" type="checkbox" id="${scope}-link-parent" scope-link="parent" checked disabled>
        //                     <label class="form-check-label" for="${scope}-link-parent">
        //                         Link to Parent Entity
        //                     </label>
        //                 </div>
        //             </div>
        //             <div class="col-md-4">
        //                 <div class="form-check form-switch">
        //                     <input class="form-check-input" type="checkbox" id="${scope}-link-device-user" scope-link="user" ${$('#createDeviceUser').is(':checked') ? '' : 'disabled'}>
        //                     <label class="form-check-label" for="${scope}-link-device-user" data-bs-toggle="tooltip" data-bs-placement="top" title="This will only be enabled if 'Create Device User' is checked above">
        //                         Link to Device User
        //                     </label>
        //                 </div>
        //             </div>
        //             <div class="col-md-4">
        //                 <div class="form-check form-switch">
        //                     <input class="form-check-input" type="checkbox" id="${scope}-link-integrator" scope-link="integrator" ${$('#createIntegrator').is(':checked') ? '' : 'disabled'}>
        //                     <label class="form-check-label" for="${scope}-link-integrator">
        //                         Link to Integrator
        //                     </label>
        //                 </div>
        //             </div>
        //         </div>
        //     </div>
        // `;

        // Rate limit section
        html += `
            <div class="settings-section" section="rate-limiting">
                <div class="row">
                    <div class="col-auto align-content-center">
                        <div class="form-check">
                            <input class="form-check-input" type="checkbox" id="${scope}-rate-limit" checked>
                            <label class="form-check-label" for="${scope}-rate-limit">
                                Enable Rate Limiting
                            </label>
                        </div>
                    </div>
                    <div class="col">
                        <div class="input-group">
                            <input type="number" class="form-control" id="${scope}-limit-count" placeholder="Number of requests" min="0" max="999" aria-label="RequestLimit" data-bs-toggle="tooltip" data-bs-placement="top" title="Leave empty for no limit">
                            <span class="input-group-text">every</span>
                            <input type="number" class="form-control" id="${scope}-limit-period" placeholder="Number of hours" min="0" max="999" aria-label="RequestPeriod" data-bs-toggle="tooltip" data-bs-placement="top" title="Leave empty for no limit">
                            <span class="input-group-text">hours</span>
                        </div>
                    </div>
                </div>
            </div>
        `;


// Scope-level settings section
if (scopeData.settings && scopeData.settings.length > 0) {
    html += `<div class="settings-section">
        <h5>Scope Settings</h5>`;
    
    html += renderGroupedSettings(scopeData.settings, scope, 'scope');
    
    html += `</div>`;
}

// Services section
// In renderScopeTab function:
// In renderScopeTab function, replace the services section with:
if (scopeData.services && scopeData.services.length > 0) {
    html += `<div class="settings-section">
        <h5>Service Assignment</h5>
        
        <div class="entity-services-assignment">
            <div class="row">`

                // <!-- Parent Column -->
                // html += renderScopeServiceCardForEntity(scopeData, scope, 'parent');
                // <div class="col-md-4">
                //     <div class="entity-card card">
                //         <div class="card-header bg-primary text-white d-flex justify-content-between align-items-center">
                //             <div>
                //                 <i class="bi bi-building me-2"></i>Parent
                //                 <small class="d-block">All services required</small>
                //             </div>
                //             <div class="form-check form-switch">
                //                 <input class="form-check-input" type="checkbox" role="link-scope-to-entity" data-entity="parent" id="${scope}-link-parent"  scope-link="parent" disabled="">
                //             </div>
                //         </div>
                //         <div class="card-body">
                //             ${scopeData.services.map(service => `
                //                 <div class="service-item d-flex justify-content-between align-items-center mb-2">
                //                     <div class="form-check mb-0">
                //                         <input class="form-check-input" type="checkbox" checked role="link-service-to-entity" data-entity="parent" data-service="${service.name}" id="${scope}-${safeRename(service.name)}-parent">
                //                         <label class="form-check-label">${service.description}</label>
                //                     </div>
                //                     ${service.settings && service.settings.length > 0 ? `
                //                         <button type="button" class="btn btn-sm btn-outline-secondary service-settings-btn" 
                //                             data-service="${service.name}" 
                //                             data-scope="${scope}"
                //                             data-bs-toggle="tooltip" title="Configure settings">
                //                             <i class="bi bi-gear"></i>
                //                         </button>
                //                     ` : `
                //                         <span class="badge bg-secondary">No settings</span>
                //                     `}
                //                 </div>
                //             `).join('')}
                //         </div>
                //     </div>
                // </div>
                
                // html += `<!-- Integrator Column -->`
                //<div class="col-md-4">`
                // html += renderScopeServiceCardForEntity(scopeData, scope, 'integrator');
                //     <div class="entity-card card  ${$('#createIntegrator').is(':checked') ? '' : 'entity-disabled'}" 
                //         ${!$('#createIntegrator').is(':checked') ? 'data-bs-toggle="tooltip" data-bs-title="Integrator has not been created in the Entity Setup section. Please enable it there first." data-bs-placement="top"' : ''}>
                //         <div class="card-header bg-success text-white d-flex justify-content-between align-items-center">
                //             <div>
                //                 <i class="bi bi-gear me-2"></i>Integrator
                //             </div>
                //             <div class="form-check form-switch">
                //                 <input class="form-check-input entity-toggle-all" type="checkbox"
                //                     role="link-scope-to-entity"
                //                     id="${scope}-integrator-toggle-all"
                //                     data-entity="integrator"
                //                     ${$('#createIntegrator').is(':checked') ? '' : 'disabled'}>
                //             </div>
                //         </div>
                //         <div class="card-body">
                //             ${scopeData.services.map(service => `
                //                 <div class="service-item d-flex justify-content-between align-items-center mb-2">
                //                     <div class="form-check mb-0">
                //                         <input class="form-check-input integrator-service" type="checkbox" 
                //                             id="${scope}-${safeRename(service.name)}-integrator"
                //                             data-service="${service.name}"
                //                             data-entity="integrator"
                //                             ${$('#createIntegrator').is(':checked') ? '' : 'disabled'}
                //                             ${!$('#createIntegrator').is(':checked') ? 'data-bs-toggle="tooltip" data-bs-title="Enable integrator in Entity Setup to assign services" data-bs-placement="left"' : ''}>
                //                         <label class="form-check-label">${service.description}</label>
                //                     </div>
                //                     ${service.settings && service.settings.length > 0 ? `
                //                         <button type="button" class="btn btn-sm btn-outline-secondary service-settings-btn" 
                //                             data-service="${service.name}" 
                //                             data-scope="${scope}"
                //                             data-bs-toggle="tooltip" title="Configure settings">
                //                             <i class="bi bi-gear"></i>
                //                         </button>
                //                     ` : `
                //                         <span class="badge bg-secondary">No settings</span>
                //                     `}
                //                 </div>
                //             `).join('')}
                //         </div>
                //     </div>
                //</div>
                
                // html += `<!-- Device User Column -->`
                //<div class="col-md-4">`
                // html += renderScopeServiceCardForEntity(scopeData, scope, 'deviceUser');
//     <div class="entity-card card ${$('#createDeviceUser').is(':checked') ? '' : 'entity-disabled'}" 
//         ${!$('#createDeviceUser').is(':checked') ? 'data-bs-toggle="tooltip" data-bs-title="Device User has not been created in the Entity Setup section. Please enable it there first." data-bs-placement="top"' : ''}>
//         <div class="card-header bg-info text-white d-flex justify-content-between align-items-center">
//             <div>
//                 <i class="bi bi-phone me-2"></i>Device User
//             </div>
//             <div class="form-check form-switch">
//                 <input class="form-check-input entity-toggle-all" type="checkbox" 
//                     id="${scope}-device-toggle-all"
//                     data-entity="user"`
//                     role="link-scope-to-entity"
//                     ${$('#createDeviceUser').is(':checked') ? '' : 'disabled'}>
//             </div>
//         </div>
//         <div class="card-body">
//             ${scopeData.services.map(service => `
//                 <div class="service-item d-flex justify-content-between align-items-center mb-2">
//                     <div class="form-check mb-0">
//                         <input class="form-check-input device-service" type="checkbox" 
//                             id="${scope}-${safeRename(service.name)}-device"
//                             data-service="${service.name}"
//                             data-entity="user"
//                             ${$('#createDeviceUser').is(':checked') ? '' : 'disabled'}
//                             ${!$('#createDeviceUser').is(':checked') ? 'data-bs-toggle="tooltip" data-bs-title="Enable device user in Entity Setup to assign services" data-bs-placement="left"' : ''}>
//                         <label class="form-check-label">${service.description}</label>
//                     </div>
//                     ${service.settings && service.settings.length > 0 ? `
//                         <button type="button" class="btn btn-sm btn-outline-secondary service-settings-btn" 
//                             data-service="${service.name}" 
//                             data-scope="${scope}"
//                             data-bs-toggle="tooltip" title="Configure settings">
//                             <i class="bi bi-gear"></i>
//                         </button>
//                     ` : `
//                         <span class="badge bg-secondary">No settings</span>
//                     `}
//                 </div>
//             `).join('')}
//         </div>
//     </div>
// </div>
//             </div>
        html += `</div></div>
        
        <!-- Service Settings Accordion (only show if any service has settings) -->
            <div class="service-settings-panel mt-4">
                <h6>Service Configuration</h6>
                <div class="accordion" id="${scope}-service-settings">
                    ${scopeData.services.map((service, index) => 
                        service.settings > 0 ? `
                            <div class="accordion-item">
                                <h2 class="accordion-header d-flex align-items-center flex-row">
                                    <div class="accordion-button accordion-button-sm collapsed p-0">
                                        <div class="form-check form-switch ms-3">
                                            <input class="form-check-input parent-service" type="checkbox" 
                                                data-service="${service.name}"
                                                data-entity="parent"
                                                role="link-service-to-entity" 
                                                data-scope="${scope}" id="${scope}-${safeRename(service.name)}-parent" 
                                                data-entity="parent" checked="" readonly="">
                                        </div>
                                        <div type="button" 
                                        class="w-100 ps-1"
                                        data-bs-toggle="collapse"
                                        data-bs-target="#${scope}-${safeRename(service.name)}-config">${service.description}</div>
                                    </div>
                                </h2>
                                <div id="${scope}-${safeRename(service.name)}-config" 
                                    class="accordion-collapse collapse" 
                                    ignore-data-bs-parent="#${scope}-service-settings">
                                    <div class="accordion-body">

                                    <div class="container-fluid">
                                        <div class="row mb-2">
                                            <div class="col-12">
                                                <div class="form-check form-switch">
                                                    <input class="form-check-input integrator-service" type="checkbox" role="link-service-to-entity" id="${scope}-${safeRename(service.name)}-integrator" data-service="${service.name}" data-entity="integrator">
                                                    <label class="form-check-label form-check-label-sm" for="${scope}-${safeRename(service.name)}-integrator">
                                                        Link to Integrator
                                                        <i class="bi bi-info-circle setting-info text-info" data-bs-toggle="tooltip" data-bs-title="Link ${service.description} to Integrator"></i>
                                                    </label>
                                                </div>
                                                <div class="form-check form-switch">
                                                    <input class="form-check-input deviceuser-service" type="checkbox" role="link-service-to-entity" id="${scope}-${safeRename(service.name)}-deviceuser" data-service="${service.name}" data-entity="deviceuser">
                                                    <label class="form-check-label form-check-label-sm" for="${scope}-${safeRename(service.name)}-deviceuser">
                                                        Link to Device User
                                                        <i class="bi bi-info-circle setting-info text-info" data-bs-toggle="tooltip" data-bs-title="Link ${service.description} to Device User"></i>
                                                    </label>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                        ${renderGroupedSettings(service.settings, `${scope}-${safeRename(service.name)}`, 'service', scope, service.name)}
                                    </div>
                                </div>
                            </div>
                        ` : ''
                    ).join('')}
                </div>
            </div>
    </div>`;
    
    // Remove the old entity linking section since we're using the cards now
    // (The entity-linking section will no longer be rendered)
}



        return html;
    }

    // NOTE: Assuming all required helper functions (safeRename, safeReplace, renderSetting) are available.

function renderGroupedSettings(settings, prefix, type = 'scope', scope, serviceName = '', allSettings) {
    let html = '';
    prefix = safeRename(prefix);

    if (!settings || settings.length === 0) {
        return html;
    }

    // --- START: MODIFIED GROUPING LOGIC ---
    const groupedSettings = {};

    settings.forEach(setting => {
        // ... (Parsing logic remains the same, assuming it correctly extracts properties)
        let groupName, settingName, description, placeholder, helpText, inputType, dependsOn, options, checkboxes, label, defaultValue, settingField, settingTableName, currentServiceName, values, dependencyAction;
        
        if (typeof setting === 'string') {
            groupName = 'General Settings';
            settingName = setting;  
            description = settingDescriptions[setting] || 'No description available';
            placeholder = `Enter value for ${setting}`;
            helpText = null;
            inputType = 'text';
            label = setting;
            defaultValue = '';
            settingField = '';
            settingTableName = 'entity_service_type_setting';
            currentServiceName = serviceName;
            values = null;
        } else if (typeof setting === 'object' && Array.isArray(setting)) {
            groupName = setting.group || 'General Settings';
            settingName = 'setting_group';
            currentServiceName = serviceName;
            values = null;
        } else {
            groupName = setting.group || 'General Settings';
            settingName = setting.name;
            // ... (fill other properties from setting object)
            description = setting.description || settingDescriptions[settingName] || 'No description available';
            placeholder = safeReplace(setting.placeholder, '"', '&#34;') || `Enter value for ${settingName}`;
            helpText = setting.helpText || null;
            inputType = setting.type || 'text';
            dependsOn = safeReplace(setting.dependsOn, '>', '___') || null;
            dependencyAction = setting.dependencyAction || null; // Capture the dependency action
            options = setting.options;
            checkboxes = setting.checkboxes;
            label = setting.label || settingName;
            defaultValue = setting.defaultValue || null;
            settingField = setting.field || null;
            settingTableName = setting.table || 'entity_service_type_setting';
            currentServiceName = setting.serviceName || serviceName;
            values = setting.values;
        }

        // Determine Main Group and Subgroup (Logic remains the same)
        let mainGroup = groupName;
        let subGroup = null;
        const delimiter = '.';
        if (groupName.includes(delimiter)) {
            const parts = groupName.split(delimiter);
            subGroup = parts.pop().trim();
            mainGroup = parts.join(delimiter).trim() || 'General Settings';
        } else {
            mainGroup = groupName;
            subGroup = 'General Settings';
        }


        if (!groupedSettings[mainGroup]) {
            groupedSettings[mainGroup] = {};
        }
        if (!groupedSettings[mainGroup][subGroup]) {
            groupedSettings[mainGroup][subGroup] = [];
        }

        groupedSettings[mainGroup][subGroup].push({
            // ... (push properties to array)
            name: settingName,
            description: description,
            placeholder: placeholder,
            helpText: helpText,
            type: inputType,
            dependsOn: dependsOn,
            dependencyAction: dependencyAction, // Include the new property
            options: options,
            checkboxes: checkboxes,
            label: label,
            defaultValue: defaultValue,
            settingField: settingField,
            settingName: settingName,
            settingTableName: settingTableName,
            serviceName: currentServiceName,
            values: values
        });
    });
    // --- END: MODIFIED GROUPING LOGIC ---

    // --- NEW: Determine if an outer accordion is needed ---
    const mainGroupNames = Object.keys(groupedSettings);
    const hasMultipleMainGroups = mainGroupNames.length > 1;

    // If there is only one main group, we skip the outer accordion wrapper and its header.
    if (hasMultipleMainGroups) {
        html += `<div class="accordion accordion-spaced">`;
    }

    let mainGroupIndex = 0;

    // --- START: RENDERING LOGIC (Updated) ---
    mainGroupNames.forEach(mainGroupName => {
        const subGroups = groupedSettings[mainGroupName];
        const mainGroupHtmlId = safeReplace(mainGroupName.toLowerCase(), /\s/g, '_');
        
        let totalSettingsCount = 0;
        Object.keys(subGroups).forEach(subGroupName => {
            totalSettingsCount += subGroups[subGroupName].length;
        });

        // Main Group State Logic
        const isMainGroupOpen = mainGroupIndex === 0;
        const mainGroupButtonClass = isMainGroupOpen ? '' : 'collapsed'; 
        const mainGroupAriaExpanded = isMainGroupOpen ? 'true' : 'false';
        const mainGroupShowClass = isMainGroupOpen ? 'show' : '';
        
        mainGroupIndex++;
        
        // Conditional Main Group Accordion Header/Wrapper
        if (hasMultipleMainGroups) {
             html += `<div class="accordion-item">
                <h2 class="accordion-header">
                    <button class="accordion-button ${mainGroupButtonClass} bg-none" type="button" data-bs-toggle="collapse" aria-expanded="${mainGroupAriaExpanded}" data-bs-target="#${mainGroupHtmlId}">
                        <div class="d-flex justify-content-between w-100 me-2">
                            <span>${mainGroupName}</span>
                            <span class="badge bg-secondary rounded-pill me-3">${totalSettingsCount}</span>
                        </div>
                    </button>
                </h2>
                <div id="${mainGroupHtmlId}" class="accordion-collapse collapse ${mainGroupShowClass}" data-bs-parent=".accordion">
                    <div class="accordion-body">`;
        } else {
             // If only one main group, start the container here (no collapse/header)
             html += `<div class="p-0 mt-3"><h6>${mainGroupName}</h6>`; // Use a simple div to contain content
        }

        // Subgroup Rendering Logic (Nested Accordion vs. Direct Render)
        const subGroupNames = Object.keys(subGroups);
        
        // This condition correctly checks for more than one subgroup, or if the only subgroup is NOT 'General Settings'
        const hasMultipleSubgroups = subGroupNames.length > 1 || (subGroupNames.length === 1 && subGroupNames[0] !== 'General Settings');

        if (hasMultipleSubgroups) {
            // Nested Accordion for Subgroups (If multiple subgroups exist)
            html += `<div class="accordion accordion-flush" id="${mainGroupHtmlId}-subgroups">`;
            
            subGroupNames.forEach(subGroupName => {
                const subGroupHtmlId = safeReplace(`${mainGroupName}-${subGroupName}`.toLowerCase(), /\s/g, '_');
                const subgroupCount = subGroups[subGroupName].length;
                
                // Subgroup State Logic (Set to show by default)
                const subGroupButtonClass = ''; 
                const subGroupAriaExpanded = 'true';
                const subGroupShowClass = 'show';
                
                // Subgroup Accordion Item
                html += `<div class="accordion-item bg-light border-bottom">
                    <h2 class="accordion-header">
                        <button class="accordion-button accordion-button-sm ${subGroupButtonClass} bg-light pe-4" type="button" data-bs-toggle="collapse" data-bs-target="#${subGroupHtmlId}" aria-expanded="${subGroupAriaExpanded}" aria-controls="${subGroupHtmlId}">
                            <div class="d-flex justify-content-between w-100">
                                <span>${subGroupName}</span>
                                <span class="badge bg-info rounded-pill me-3">${subgroupCount}</span>
                            </div>
                        </button>
                    </h2>
                    <div id="${subGroupHtmlId}" class="accordion-collapse collapse ${subGroupShowClass}" data-bs-parent="#${mainGroupHtmlId}-subgroups">
                        <div class="accordion-body">
                            <div class="row">`;
                            
                // Render settings within the Subgroup
                subGroups[subGroupName].forEach(settingObj => {
                    // Pass the complete list of settings (needed for dependency initial state)
                    html += renderSetting(settingObj, prefix, serviceName, settings);
                });
                
                html += `           </div>
                        </div>
                    </div>
                </div>`;
            });
            html += `</div>`; // Close nested accordion
        } else {
            // Render settings directly if there's only one subgroup (General Settings or not)
            const settingsArray = subGroups[subGroupNames[0]];
            // Render the row directly, without an extra header/accordion wrapper
            html += `<div class="p-3 bg-light"><div class="row">`;
            settingsArray.forEach(settingObj => {
                 // Pass the complete list of settings (needed for dependency initial state)
                html += renderSetting(settingObj, prefix, serviceName, settings);
            });
            html += `</div></div>`;
        }

        // Close Main Group Accordion Item/Wrapper
        if (hasMultipleMainGroups) {
             html += `       </div>
                    </div>
                </div>`; // Close accordion-body, accordion-collapse, accordion-item
        } else {
            html += `</div>`; // Close simple p-0 div
        }
    });

    if (hasMultipleMainGroups) {
        html += `</div>`; // Close main accordion
    }
    
    return html;
}



/**
 * Helper function to render an individual setting control.
 * @param {object} settingObj - The setting object.
 * @param {string} prefix - The scope prefix (e.g., 'scope-parent').
 * @param {string} serviceName - The service name (e.g., 'OCS').
 * @returns {string} HTML string for the setting control.
 */
function renderSetting(settingObj, prefix, serviceName) {
    let html = '';
    const settingName = safeRename(settingObj.name);
    
    // --- START: Dependency ID Generation Logic ---
    let dependsOnAttr = '';
    
    if (settingObj.dependsOn) {
        // 1. Check if the setting is a multi-field setting (i.e., has a field property)
        if (settingObj.settingField) {
            // This is a field-level dependency on another field within the same setting name.
            // Format: 'otherFieldName:requiredValue'
            const [controllingField, requiredValue] = settingObj.dependsOn.split(':');
            
            if (controllingField && requiredValue !== undefined) {
                // The controlling element's ID is the settingName + controllingField
                // e.g., 'scope-parent-ocs-ed-mandate-default-details___generateContractReference'
                const controllingId = createDependencyId(prefix, settingName + '___' + controllingField);
                
                // The data attribute now holds both the target ID and the required value
                dependsOnAttr = `data-depends-on="${controllingId}" data-required-value="${requiredValue.toLowerCase()}"`;
            }
        } else {
            // 2. Standard single-setting dependency on a different setting name.
            // Format: 'otherSettingName' or 'otherSettingName:requiredValue'
            dependsOnAttr = `data-depends-on="${createDependencyId(prefix, settingObj.dependsOn)}"`;
        }
    }
    // --- END: Dependency ID Generation Logic ---

    // Standard attributes shared by most inputs/selects
    const inputId = createControlId(prefix, settingObj.settingName, settingObj.settingField);
    
    const sharedAttrs = `
        service-setting="${settingObj.settingName}"
        role="set-service-setting-value"
        data-service-name="${serviceName}"
        data-setting="${settingObj.settingName}"
        data-setting-table="${settingObj.settingTableName || ''}"
        service-setting-field="${settingObj.settingField || ''}"
    `;
    
    // Header for the input group
    const inputHeader = `<label for="${inputId}" class="form-label label-sm">
        ${settingObj.label || settingObj.settingName}
        ${settingObj.description ? `<i class="bi bi-info-circle setting-info text-info" data-bs-toggle="tooltip" data-bs-title="${safeReplace(settingObj.description, '"', '&#34;')}"></i>` : ''}
    </label>`;
    
    // Help Text
    const helpTextHtml = settingObj.helpText ? `<div class="form-text text-muted">${settingObj.helpText}</div>` : '';


    // --- Input Type Routing ---

    if (settingObj.type === 'dropdown') {
        html += `
            <div class="mb-3 col-md-6" ${dependsOnAttr}>
                ${inputHeader}
                <select class="form-select form-select-sm" id="${inputId}" ${sharedAttrs}>
                    ${renderOptionsHtml(settingObj.values, settingObj.defaultValue, true)}
                </select>
                ${helpTextHtml}
            </div>
        `;

    } else if (settingObj.type === 'radio') {
        html += renderRadioSetting(settingObj, inputId, prefix, serviceName, dependsOnAttr);
        
    } else if (settingObj.type === 'checkbox') {
        // Updated call to pass dependsOnAttr for the container div
        html += renderCheckboxSetting(settingObj, inputId, prefix, dependsOnAttr); 
    } 
    // ... (other types like dual-checkbox, radio-button-group, etc.)
    else {
        // Default Text Input (for 'text', 'textbox', 'password', etc.)
        const inputType = settingObj.type === 'textbox' ? 'text' : settingObj.type;
        const maxLengthAttr = settingObj.maxLength ? `maxlength="${settingObj.maxLength}"` : '';
        html += `
            <div class="mb-3 col-md-6" ${dependsOnAttr}>
                ${inputHeader}
                <input type="${inputType}" class="form-control form-control-sm" id="${inputId}" 
                placeholder="${safeReplace(settingObj.placeholder, '"', '&#34;')}" 
                value="${settingObj.defaultValue || ''}" 
                ${maxLengthAttr}
                ${sharedAttrs}>
                ${helpTextHtml}
            </div>
        `;
    }
    return html;
}

// --- New Reusable Options Renderer ---

/**
 * Generates HTML options for a <select> or radio group.
 * @param {Array<string|object>} values - Array of values or {key, value} objects.
 * @param {string} defaultValue - The default value to mark as selected/checked.
 * @param {boolean} isSelect - True if rendering for a <select> element.
 * @returns {string} HTML string of options or radio buttons.
 */
function renderOptionsHtml(values, defaultValue, isSelect = false) {
    if (!values || values.length === 0) {
        return isSelect ? `<option value="">No options available</option>` : '';
    }

    let optionsHtml = isSelect ? `<option value="">-- Select an option --</option>` : '';
    const defValue = defaultValue ? String(defaultValue) : '';
    
    const isKeyValObject = typeof values[0] === 'object' && values[0] !== null;

    values.forEach(val => {
        let optionValue, optionText;

        if (isKeyValObject) {
            // Key-value object format: {key: 1, value: 'Fixed'}
            optionValue = val.key;
            optionText = val.value;
        } else {
            // Simple array format: ['ADHOC', 'WEEKLY']
            optionValue = val;
            optionText = val;
        }

        const isSelected = (String(optionValue) === defValue) ? 'selected' : '';
        const isChecked = (String(optionValue) === defValue) ? 'checked' : '';

        if (isSelect) {
            optionsHtml += `<option value="${optionValue}" ${isSelected}>${optionText}</option>`;
        } else {
            // Logic for radio button generation (used in renderRadioSetting)
            optionsHtml += `
                <div class="form-check">
                    <input class="form-check-input" type="radio" name="radio-${defValue}" value="${optionValue}" id="radio-${optionValue}" ${isChecked}>
                    <label class="form-check-label" for="radio-${optionValue}">${optionText}</label>
                </div>
            `;
        }
    });

    return optionsHtml;
}


// --- Updated renderRadioSetting to use the new values array and renderer ---

function renderRadioSetting(settingObj, inputId, prefix, serviceName) {
    const dependsOnAttr = settingObj.dependsOn ? `data-depends-on="${createDependencyId(prefix, settingObj.dependsOn)}"` : '';

    const optionsHtml = renderOptionsHtml(settingObj.values, settingObj.defaultValue, false);
    
    // Note: The shared attributes are NOT applied to the inner radio inputs here. 
    // They should be applied to the container or hidden input if you need to capture the value on submit.
    // For simplicity, we keep the radio button structure simple here.
    
    return `
        <div class="mb-3 col-md-12" ${dependsOnAttr}>
            <label class="form-label mb-2">
                ${settingObj.label}
                ${settingObj.description ? `<i class="bi bi-info-circle setting-info text-info" data-bs-toggle="tooltip" data-bs-title="${settingObj.description}"></i>` : ''}
            </label>
            <div id="${inputId}-radio-group">
                ${optionsHtml}
            </div>
            ${settingObj.helpText ? `<div class="form-text text-muted">${settingObj.helpText}</div>` : ''}
        </div>
    `;
}

// NOTE: You still need to ensure the following helper functions are defined in your scope:
// safeRename, safeReplace, settingDescriptions, createDependencyId, renderCheckboxSetting, renderDualCheckboxSetting.

// NOTE: You'll need to make sure the external functions like 'safeRename', 'safeReplace', 
// 'settingDescriptions', 'createDependencyId', 'renderCheckboxSetting', etc. are defined 
// elsewhere in your scope for the full code to run.

    function renderCheckboxSetting(settingObj, inputId, prefix) {
        const dependsOnAttr = settingObj.dependsOn ? `data-depends-on="${createDependencyId(prefix, settingObj.dependsOn)}"` : '';
        
        return `
            <div class="mb-3 col-md-12" ${dependsOnAttr}>
                <div class="form-check form-switch">
                    <input class="form-check-input setting-checkbox" type="checkbox" id="${inputId}">
                    <label class="form-check-label" for="${inputId}">
                        ${settingObj.label}
                        ${settingObj.description ? `<i class="bi bi-info-circle setting-info text-info" data-bs-toggle="tooltip" data-bs-title="${settingObj.description}"></i>` : ''}
                    </label>
                </div>
                ${settingObj.helpText ? `<div class="form-text text-muted">${settingObj.helpText}</div>` : ''}
            </div>
        `;
    }

    function renderDualCheckboxSetting(settingObj, inputId, prefix) {
        let checkboxesHtml = '';
        
        if (settingObj.checkboxes && settingObj.checkboxes.length > 0) {
            settingObj.checkboxes.forEach((checkbox, index) => {
                const checkboxId = `${inputId}-${checkbox.name}`;
                const dependsOnAttr = checkbox.dependsOn ? `data-depends-on="${createDependencyId(prefix, checkbox.dependsOn)}"` : '';
                const indentClass = index > 0 ? 'ms-4' : '';
                
                checkboxesHtml += `
                    <div class="form-check ${indentClass}" ${dependsOnAttr}>
                        <input class="form-check-input reference-checkbox" type="checkbox" id="${checkboxId}">
                        <label class="form-check-label" for="${checkboxId}">
                            ${checkbox.label}
                        </label>
                    </div>
                `;
            });
        }
        
        const dependsOnAttr = settingObj.dependsOn ? `data-depends-on="${createDependencyId(prefix, settingObj.dependsOn)}"` : '';
        
        return `
            <div class="mb-3 col-md-12 reference-setting-group" ${dependsOnAttr}>
                <h6 class="mb-2">${settingObj.label}</h6>
                ${checkboxesHtml}
                ${settingObj.helpText ? `<div class="form-text text-muted mt-1">${settingObj.helpText}</div>` : ''}
            </div>
        `;
    }

    // function renderRadioSetting(settingObj, inputId, prefix) {
    //     let optionsHtml = '';
        
    //     if (settingObj.options && settingObj.options.length > 0) {
    //         settingObj.options.forEach(option => {
    //             optionsHtml += `
    //                 <div class="form-check">
    //                     <input class="form-check-input" type="radio" name="${inputId}" value="${option.value}" id="${inputId}-${option.value}">
    //                     <label class="form-check-label" for="${inputId}-${option.value}">
    //                         ${option.label}
    //                     </label>
    //                 </div>
    //             `;
    //         });
    //     }
        
    //     const dependsOnAttr = settingObj.dependsOn ? `data-depends-on="${createDependencyId(prefix, settingObj.dependsOn)}"` : '';
        
    //     return `
    //         <div class="mb-3 col-md-12" ${dependsOnAttr}>
    //             <label class="form-label mb-2">
    //                 ${settingObj.label}
    //                 ${settingObj.description ? `<i class="bi bi-info-circle setting-info text-info" data-bs-toggle="tooltip" data-bs-title="${settingObj.description}"></i>` : ''}
    //             </label>
    //             <div>
    //                 ${optionsHtml}
    //             </div>
    //             ${settingObj.helpText ? `<div class="form-text text-muted">${settingObj.helpText}</div>` : ''}
    //         </div>
    //     `;
    // }

    function renderScopeServiceCardForEntity(scopeData, scope, entity) {
        console.log(scopeData);
        let entityDisplayName = entity.charAt(0).toUpperCase() + entity.slice(1);
        entity = entity.toLowerCase();
        console.log(`Rendering service card for entity: ${entityDisplayName} (${entity}) in scope: ${scope}`);
        if (scopeData.excludeFrom && scopeData.excludeFrom.includes(entity) ) {
            return `
            <div class="col-md-4">
                <div class="entity-card card shadow-none entity-disabled opacity-50" 
                    data-bs-toggle="tooltip" data-bs-title="${scope} is not applicable to the  ${splitCamelCase(entityDisplayName).toLowerCase()}." data-bs-placement="top">
                    <div class="card-header bg-entity text-white d-flex justify-content-between align-items-center opacity-50">
                        <div>
                            <i class="bi bi-gear me-2"></i>${entityDisplayName}
                        </div>
                            <div class="form-check form-switch">
                                <input class="form-check-input" type="checkbox" disabled>
                            </div>
                        </div>
                    <div class="card-body">
                        ${scopeData.services.map(service => `
                            <div class="service-item d-flex justify-content-between align-items-center mb-2">
                                <div class="form-check mb-0">
                                    <input class="form-check-input ${entity}-service" type="checkbox" disabled>
                                    <label class="form-check-label text-muted">${service.description}</label>
                                </div>                   
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
            `;
        }

        let html = `
            <div class="col-md-4">
                <div class="entity-card card ${$('#create' + entityDisplayName + '').is(':checked') ? '' : 'entity-disabled'}" 
                    ${!$('#create' + entityDisplayName + '').is(':checked') ? `data-bs-toggle="tooltip" data-bs-title="The ${splitCamelCase(entityDisplayName)} has not been created in the Entity Setup section. Please enable it there first." data-bs-placement="top"` : ''}>
                    <div class="card-header bg-entity text-white d-flex justify-content-between align-items-center">
                        <div>
                            <i class="bi bi-gear me-2"></i>${entityDisplayName}
                        </div>
                        <div class="form-check form-switch">
                            <input class="form-check-input entity-toggle-all" type="checkbox"
                                role="link-scope-to-entity"
                                data-scope="${scope}"
                                id="${scope}-${entity}-toggle-all"
                                data-entity="${entity}"
                                ${(scopeData.excludeFrom && scopeData.excludeFrom.includes(entity)) || (scopeData.services.every(s => s.allowOn?.includes(entity))) ? 'data-exclude-on-entity="true"' : ''}
                                ${$('#create' + entityDisplayName + '').is(':checked') ? '' : 'disabled'}
                                ${entity === 'parent' ? 'checked' : ''}
                                ${entity === 'parent' ? 'readonly' : ''}
                                ${$('#create' + entityDisplayName + '').is(':checked') && scopeData.services.some(s => s.allowOn?.includes(entity)) ? 'checked' : ''}>
                        </div>
                    </div>
                    <div class="card-body">
                        ${scopeData.services.map(service => `
                            <div class="service-item d-flex justify-content-between align-items-center mb-2">
                                <div class="form-check mb-0">
                                    <input class="form-check-input ${entity}-service" type="checkbox" 
                                        role="link-service-to-entity"
                                        id="${scope}-${safeRename(service.name)}-${entity}"
                                        data-service="${service.name}"
                                        data-entity="${entity}" service.exclude
                                        ${service.excludeFrom && service.excludeFrom.includes(entity) ? 'data-exclude-on-entity="true"' : ''}
                                        ${service.allowOn && !service.allowOn.includes(entity) ? 'disabled' : ''}
                                        ${$('#create' + entityDisplayName + '').is(':checked') ? '' : 'disabled'}
                                        ${!$('#create' + entityDisplayName + '').is(':checked') ? `data-bs-toggle="tooltip" data-bs-title="Enable ${entityDisplayName} in Entity Setup to assign services" data-bs-placement="left"` : ''}
                                        ${entity === 'parent' ? 'checked' : ''}
                                        ${$('#create' + entityDisplayName + '').is(':checked') && service.allowOn?.includes(entity) ? 'checked' : ''}>
                                    <label for="${scope}-${safeRename(service.name)}-${entity}" class="form-check-label">${service.description}</label>
                                </div>
                                ${service.settings && service.settings.length > 0 ? `
                                    <button type="button" class="btn btn-sm btn-outline-secondary service-settings-btn" 
                                        data-service="${service.name}" 
                                        data-scope="${scope}"
                                        data-bs-toggle="tooltip1" title="Configure settings">
                                        <i class="bi bi-gear"></i>
                                    </button>
                                ` : `
                                    
                                `}
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>`;
        return html;
    }

/**
 * Creates the dependency target ID based on a setting name (used for lookups).
 * This function must be consistent with createControlId logic.
 * @param {string} prefix 
 * @param {string} dependencyKey - Can be just a setting name or a settingName___field
 * @returns {string}
 */
function createDependencyId(prefix, dependencyKey) {
    // Note: The dependencyKey is already expected to contain the safe-renamed field 
    // if it's a field-level dependency (e.g., 'ocs-ed-mandate-default-details___generateContractReference')
    return `${prefix}-${safeRename(dependencyKey)}`;
}

    /**
 * Creates a consistent ID for a control, handling fields.
 * @param {string} prefix 
 * @param {string} name 
 * @param {string} field 
 * @returns {string}
 */
function createControlId(prefix, name, field) {
    let id = `${prefix}-${safeRename(name)}`;
    if (field && field.trim() !== '') {
        id = `${id}___${safeRename(field)}`;
    }
    return id;
}

    function initializeDependencyHandlers(container = document) {
        // Small delay to ensure all elements are rendered
        setTimeout(() => {
            console.log('Initializing dependency handlers...');
            
            // Find all elements with dependencies
            $(container).find('[data-depends-on]').each(function() {
                const $dependentElement = $(this);
                const dependsOnId = $dependentElement.data('depends-on');
                
                console.log(`Found dependent element with dependency: ${dependsOnId}`);
                
                if (dependsOnId) {
                    const $masterElement = $(`#${dependsOnId}`);
                    
                    if ($masterElement.length > 0) {
                        console.log(`Found master element: ${dependsOnId}, is checkbox: ${$masterElement.is(':checkbox')}`);
                        
                        // Set initial state
                        updateDependencyState($dependentElement, $masterElement.is(':checked'));
                        
                        // Handle changes to the master element
                        $masterElement.off('change.dependency').on('change.dependency', function() {
                            console.log(`Master element ${dependsOnId} changed to: ${$(this).is(':checked')}`);
                            updateDependencyState($dependentElement, $(this).is(':checked'));
                        });
                    } else {
                        console.warn(`Master element not found: ${dependsOnId}`);
                        console.log('Available checkboxes in container:', $(container).find('input[type="checkbox"]').map(function() { return this.id; }).get());
                    }
                }
            });

        }, 300);
    }

    function updateDependencyState($dependentElement, isEnabled) {
        console.log(`Updating dependency state for element:`, $dependentElement, `Enabled: ${isEnabled}`);
        
        if (isEnabled) {
            // $dependentElement.show();
            $dependentElement.find('input, select, textarea').prop('disabled', false);
        } else {
            // $dependentElement.hide();
            $dependentElement.find('input, select, textarea').prop('disabled', true);
            
            // Clear values when disabled
            $dependentElement.find('input:not([type="checkbox"]), select, textarea').val('');
            $dependentElement.find('input[type="checkbox"]').prop('checked', false);
        }
    }

    function autoSelectScopesFromQueryParams() {
        const queryParams = new URLSearchParams(window.location.search);
        
        // Check for scope parameter (can be single scope or comma-separated list)
        if (queryParams.has('scope')) {
            const scopesToSelect = queryParams.get('scope').split(',').map(s => s.trim().toUpperCase());
            
            scopesToSelect.forEach(scope => {
                if (scopes[scope]) {
                    // Check the scope checkbox and trigger change
                    $(`#scope-${scope}`).prop('checked', true).trigger('change');
                    console.log(`Auto-selected scope: ${scope}`);
                } else {
                    console.warn(`Unknown scope in query parameter: ${scope}`);
                }
            });
        }
        
        // Also support individual scope parameters (e.g., ?OCS=true&BMS=true)
        Object.keys(scopes).forEach(scope => {
            if (queryParams.get(scope) === 'true' || queryParams.get(scope) === '1') {
                $(`#scope-${scope}`).prop('checked', true).trigger('change');
                console.log(`Auto-selected scope via individual parameter: ${scope}`);
            }
        });
    }

    function checkTabVisibility() {
        const $scopeTabs = $('#scopeTabs .nav-item');
        const $noTabsMessage = $('#noTabsMessage');
        const $noScopesInfoMessage = $('#noScopesInfoMessage');
        const visibleTabsCount = $scopeTabs.length;

        console.log(`Visible tabs count: ${visibleTabsCount}`);

        if (visibleTabsCount > 0) {
            $noTabsMessage.hide();
            $noScopesInfoMessage.hide();
            $('#scopeTabsContainer').show();

            // Ensure at least one tab is active if tabs are visible
            if ($('#scopeTabs .nav-link.active').length === 0 && visibleTabsCount > 0) {
                $('#scopeTabs .nav-item:first .nav-link').tab('show');
            }
        } else {
            $noTabsMessage.show();
            $noScopesInfoMessage.show();
            $('#scopeTabsContainer').hide();
        }
    }

    // Custom tooltip messages function
function getEntityTooltipMessage(entityType, isCard = true) {
    const messages = {
        integrator: {
            card: 'Integrator has not been created in the Entity Setup section. Go to "Entity Configuration" and enable "Create Integrator" to assign services.',
            checkbox: 'Enable the Integrator entity in the Entity Setup section to assign this service.'
        },
        user: {
            card: 'Device User has not been created in the Entity Setup section. Go to "Entity Configuration" and enable "Create Device User" to assign services.',
            checkbox: 'Enable the Device User entity in the Entity Setup section to assign this service.'
        }
    };
    
    return messages[entityType]?.[isCard ? 'card' : 'checkbox'] || 'Entity not enabled.';
}

    
// Function to initialize tooltips for entity cards
function initializeEntityCardTooltips(container = document) {
    console.log('Initializing entity card tooltips');
    // Destroy existing tooltips first
    if ($(container).attr('data-bs-toggle') === 'tooltip') {
        console.log('Container has attribute "data-bs-toggle"');
        const cardTooltip = bootstrap.Tooltip.getInstance(container[0]);
        if (cardTooltip) cardTooltip.dispose();
    } else {
        console.log('Container does not have attribute "data-bs-toggle"');
        $(container).find('[data-bs-toggle="tooltip"]').each(function() {
            const tooltipInstance = bootstrap.Tooltip.getInstance(this);
            if (tooltipInstance) {
                tooltipInstance.dispose();
            }
        });
        
    }

    // Initialize new tooltips
    const tooltipTriggerList = [].slice.call($(container).find('[data-bs-toggle="tooltip"]'));
    const tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl, {
            trigger: 'hover focus'
        });
    });

    if (container[0]) {

        new bootstrap.Tooltip(container[0]);
    }
}

// Update the main initializeTooltips function to include entity cards
function initializeTooltips(container = document) {
    // Initialize Bootstrap tooltips for regular elements
    const tooltipTriggerList = [].slice.call($(container).find('[data-bs-toggle="tooltip"]'));
    const tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });

    // Initialize custom tooltips for info icons
    $(container).find('.setting-info').each(function() {
        new bootstrap.Tooltip(this);
    });
    
    // Initialize entity card tooltips specifically
    initializeEntityCardTooltips(container);
    
    // Initialize dependency handlers
    initializeDependencyHandlers(container);
}

    function copyScriptToClipboard() {
        const scriptText = $('#scriptOutput').text();
        navigator.clipboard.writeText(scriptText).then(function () {
            alert('Script copied to clipboard!');
        }, function (err) {
            console.error('Could not copy text: ', err);
        });
    }

    function handleImportConfig() {
        const fileInput = $('#importFile')[0];
        if (fileInput.files.length === 0) {
            alert('Please select a JSON file to import');
            return;
        }

        const file = fileInput.files[0];
        const reader = new FileReader();

        reader.onload = function (e) {
            try {
                const config = JSON.parse(e.target.result);
                importConfiguration(config);
                alert('Configuration imported successfully!');
            } catch (error) {
                alert('Error parsing JSON file: ' + error.message);
            }
        };

        reader.readAsText(file);
    }

    function handleExportConfig() {
        const config = exportConfiguration();
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(config, null, 2));
        const downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute("href", dataStr);
        downloadAnchorNode.setAttribute("download", "entity_configuration.json");
        document.body.appendChild(downloadAnchorNode);
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
    }

    // Function to get all settings from a service (handles both grouped and flat settings)
     function getAllServiceSettings(service) {
        const allSettings = [];
        
        if (service.settings && service.settings.length > 0) {
            service.settings.forEach(setting => {
                if (typeof setting === 'string') {
                    allSettings.push(setting);
                } else if (setting.group && setting.settings) {
                    // Handle grouped settings
                    setting.settings.forEach(groupedSetting => {
                        if (typeof groupedSetting === 'string') {
                            allSettings.push(groupedSetting);
                        } else {
                            allSettings.push(groupedSetting.name || groupedSetting);
                        }
                    });
                } else if (setting.type === 'dual-checkbox' && setting.checkboxes) {
                    // Handle dual checkbox settings
                    setting.checkboxes.forEach(checkbox => {
                        allSettings.push(checkbox.name);
                    });
                } else {
                    // Handle object settings
                    allSettings.push(setting.name || setting);
                }
            });
        }
        
        return allSettings;
    }

    // Function to import configuration from JSON
    function importConfiguration(config) {
        // Basic entity information
        if (config.parentName) $('#parentName').val(config.parentName);
        if (config.website) $('#website').val(config.website);
        if (config.deviceEmail) $('#deviceEmail').val(config.deviceEmail);
        if (config.crsEnquiryBy) $('#crsEnquiryBy').val(config.crsEnquiryBy);

        // Device user settings
        if (config.createDeviceUser !== undefined) {
            $('#createDeviceUser').prop('checked', config.createDeviceUser).trigger('change');
            if (config.createDeviceUser) {
                if (config.deviceUsername) $('#deviceUsername').val(config.deviceUsername);
                if (config.devicePassword) $('#devicePassword').val(config.devicePassword);
            }
        }

        // Integrator settings
        if (config.createIntegrator !== undefined) {
            $('#createIntegrator').prop('checked', config.createIntegrator).trigger('change');
            if (config.createIntegrator && config.integratorName) {
                $('#integratorName').val(config.integratorName);
            }
        }

        // Scope settings
        if (config.scopes) {
            // Clear all scope selections first
            $('.scope-checkbox-input').prop('checked', false);
            
            // Set selected scopes
            Object.keys(config.scopes).forEach(scope => {
                if (scopes[scope]) {
                    $(`#scope-${scope}`).prop('checked', true).trigger('change');
                    
                    const scopeConfig = config.scopes[scope];
                    const scopeData = scopes[scope];

                    // Rate limiting
                    if (scopeConfig.rateLimit !== undefined) {
                        $(`#${scope}-rate-limit`).prop('checked', scopeConfig.rateLimit);
                    }
                    if (scopeConfig.limitCount !== undefined) {
                        $(`#${scope}-limit-count`).val(scopeConfig.limitCount);
                    }
                    if (scopeConfig.limitPeriod !== undefined) {
                        $(`#${scope}-limit-period`).val(scopeConfig.limitPeriod);
                    }

                    // Entity linking
                    if (scopeConfig.linkDeviceUser !== undefined) {
                        $(`#${scope}-link-device-user`).prop('checked', scopeConfig.linkDeviceUser);
                    }
                    if (scopeConfig.linkIntegrator !== undefined) {
                        $(`#${scope}-link-integrator`).prop('checked', scopeConfig.linkIntegrator);
                    }

                    // Services
                    if (scopeConfig.services) {
                        Object.keys(scopeConfig.services).forEach(serviceName => {
                            if (scopeConfig.services[serviceName].enabled !== undefined) {
                                $(`#${scope}-${serviceName}`).prop('checked', scopeConfig.services[serviceName].enabled);
                            }

                            // Find the service definition
                            const serviceDef = scopeData.services.find(s => s.name === serviceName);
                            if (serviceDef) {
                                // Get all settings for this service
                                const allServiceSettings = getAllServiceSettings(serviceDef);

                                // Service settings
                                if (scopeConfig.services[serviceName].settings) {
                                    Object.keys(scopeConfig.services[serviceName].settings).forEach(setting => {
                                        // Check if this setting exists in the service definition
                                        if (allServiceSettings.includes(setting)) {
                                            $(`#${scope}-${serviceName}-${setting}`).val(scopeConfig.services[serviceName].settings[setting]);
                                        }
                                    });
                                }
                            }
                        });
                    }

                    // Scope settings
                    if (scopeConfig.settings) {
                        Object.keys(scopeConfig.settings).forEach(setting => {
                            $(`#${scope}-${setting}`).val(scopeConfig.settings[setting]);
                        });
                    }

                    // Shared settings
                    if (scopeConfig.sharedSettings) {
                        Object.keys(scopeConfig.sharedSettings).forEach(setting => {
                            $(`#${scope}-${setting}`).val(scopeConfig.sharedSettings[setting]);
                        });
                    }
                }
            });
        }

        // Re-initialize tooltips and dependencies
        initializeTooltips();
    }

    function scrollTo(elementId) {
        const element = document.getElementById(elementId);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }

    function splitCamelCase(str) {
    return str
        // insert space before all caps
        .replace(/([a-z])([A-Z])/g, '$1 $2')
        // capitalize first letter
        .replace(/^./, c => c.toUpperCase());
    }

    $('#togglePassword').click(function() {
        const passwordField = $('#devicePassword');
        const type = passwordField.attr('type') === 'password' ? 'text' : 'password';
        passwordField.attr('type', type);
        
        // Toggle icon
        $(this).find('i').toggleClass('bi-eye bi-eye-slash');
    });
    
    function safeRename(str) {
        try {
           return str.replace(/\./g, '-');
        } catch (error) {
           return str;
        }
    }

    function safeReplace(str, search, replace) {
        try {
            return str.replace(new RegExp(search, 'g'), replace);
        } catch (error) {
            return str;
        }
    }


    // Function to export configuration to JSON
    function exportConfiguration() {
        const config = {
            parentName: $('#parentName').val(),
            website: $('#website').val(),
            deviceEmail: $('#deviceEmail').val(),
            createDeviceUser: $('#createDeviceUser').is(':checked'),
            deviceUsername: $('#deviceUsername').val(),
            devicePassword: $('#devicePassword').val(),
            createIntegrator: $('#createIntegrator').is(':checked'),
            integratorName: $('#integratorName').val(),
            scopes: {}
        };

        // Collect scope configurations
        $('.scope-checkbox-input:checked').each(function () {
            const scope = $(this).val();
            const scopeData = scopes[scope];

            config.scopes[scope] = {
                rateLimit: $(`#${scope}-rate-limit`).is(':checked'),
                limitCount: $(`#${scope}-limit-count`).val() || null,
                limitPeriod: $(`#${scope}-limit-period`).val() || null,
                linkParent: $(`#${scope}-link-parent`).is(':checked'),
                linkDeviceUser: $(`#${scope}-link-device-user`).is(':checked'),
                linkIntegrator: $(`#${scope}-link-integrator`).is(':checked'),
                services: {},
                settings: {}
            };

            // Service configurations
            scopeData.services.forEach(service => {
                config.scopes[scope].services[service.name] = {
                    enabled: $(`#${scope}-${service.name}`).is(':checked'),
                    settings: {}
                };

                // Get all settings for this service
                const allServiceSettings = getAllServiceSettings(service);

                // Service settings
                allServiceSettings.forEach(setting => {
                    const value = $(`#${scope}-${service.name}-${setting}`).val();
                    if (value) {
                        config.scopes[scope].services[service.name].settings[setting] = value;
                    }
                });
            });

            // Scope settings
            if (scopeData.settings) {
                scopeData.settings.forEach(setting => {
                    const value = $(`#${scope}-${setting}`).val();
                    if (value) {
                        config.scopes[scope].settings[setting] = value;
                    }
                });
            }

            // Shared settings
            if (scopeData.sharedSettings) {
                config.scopes[scope].sharedSettings = {};
                scopeData.sharedSettings.forEach(setting => {
                    const value = $(`#${scope}-${setting}`).val();
                    if (value) {
                        config.scopes[scope].sharedSettings[setting] = value;
                    }
                });
            }
        });

        return config;
    }

function extractScopeConfiguration_old() {
    const config = {
        parentName: $('#parentName').val(),
        website: $('#website').val(),
        createDeviceUser: $('#createDeviceUser').is(':checked'),
        deviceUsername: $('#deviceUsername').val(),
        deviceEmail: $('#deviceEmail').val(),
        createIntegrator: $('#createIntegrator').is(':checked'),
        integratorName: $('#integratorName').val(),
        scopes: {}
    };

    $('.scope-checkbox-input:checked').each(function() {
        const scope = $(this).val();
        const $scopeTab = $(`#${scope}`);
        
        if ($scopeTab.length === 0) return;

        const scopeConfig = {
            allowOn: [],
            rateLimit: {
                enabled: false,
                numberOfRequests: null,
                duration: null
            },
            services: [],
            settings: []
        };

        // Get scope entity linking
        $scopeTab.find('[section="entity-linking"] [scope-link]').each(function() {
            const $checkbox = $(this);
            if ($checkbox.is(':checked') && !$checkbox.is(':disabled')) {
                scopeConfig.allowOn.push($checkbox.attr('scope-link'));
            }
        });

        // Get rate limiting
        const $rateLimitCheckbox = $(`#${scope}-rate-limit`);
        scopeConfig.rateLimit.enabled = $rateLimitCheckbox.is(':checked');
        scopeConfig.rateLimit.numberOfRequests = $(`#${scope}-limit-count`).val() || null;
        scopeConfig.rateLimit.duration = $(`#${scope}-limit-period`).val() || null;

        // Get global service entities
        const serviceEntities = ['parent']; // Parent is always included
        if ($(`#${scope}-services-integrator`).is(':checked')) serviceEntities.push('integrator');
        if ($(`#${scope}-services-device`).is(':checked')) serviceEntities.push('user');

        // Get services
        $scopeTab.find('.service-group[service]').each(function() {
            const $serviceGroup = $(this);
            const serviceName = $serviceGroup.attr('service');
            const serviceEnabled = $serviceGroup.find('[role="service-enabled"]').is(':checked');
            
            if (!serviceEnabled) return;

            const serviceConfig = {
                name: serviceName,
                enabled: serviceEnabled,
                allowOn: [...serviceEntities], // Copy the global entities
                settings: []
            };

            // Get service settings
            $serviceGroup.find('[service-setting]').each(function() {
                // ... (same settings extraction logic as before)
            });

            scopeConfig.services.push(serviceConfig);
        });

        // Get scope-level settings
        // ... (same as before)

        config.scopes[scope] = scopeConfig;
    });

    return config;
}



// Helper function to get configuration for all scopes
function getAllScopeConfigurations() {
    const allConfigs = extractScopeConfiguration();
    console.log('All scope configurations:', allConfigs);
    return allConfigs;
}

// Helper function to get configuration for a specific scope
function getScopeConfiguration(scopeName) {
    const allConfigs = extractScopeConfiguration();
    return allConfigs.find(config => config.scope === scopeName) || null;
}

// Function to get service settings from modal (you'll need to call this when modal is saved)
function saveServiceSettingsToData(scope, serviceName, settings) {
    // Store service settings in a global data structure
    if (!window.serviceSettingsData) {
        window.serviceSettingsData = {};
    }
    if (!window.serviceSettingsData[scope]) {
        window.serviceSettingsData[scope] = {};
    }
    window.serviceSettingsData[scope][serviceName] = settings;
}

// Modified getServiceSettings function that uses the stored data
function getServiceSettingsWithData(scope, serviceName) {
    if (window.serviceSettingsData && window.serviceSettingsData[scope] && window.serviceSettingsData[scope][serviceName]) {
        return window.serviceSettingsData[scope][serviceName];
    }
    return [];
}

    // // Placeholder for generateScript function
    // function generateScript() {
    //     // Implementation for generating script goes here
    //     console.log('Generate script function called');
    //     // This should populate the #scriptOutput element with the generated script
    //     $('#scriptOutput').text('// Generated script would appear here');
    // }

    // Make functions available globally
    window.importConfiguration = importConfiguration;
    window.exportConfiguration = exportConfiguration;
    window.renderSettings = renderSettings;
    window.getAllServiceSettings = getAllServiceSettings;
});

// Entity type mapping for PostgreSQL
const entityTypeMapping = {
    'parent': 'p',
    'integrator': 'i',
    'deviceuser': 'd'
};

function extractScopeConfiguration() {
    const scopeConfigs = [];
    
    // Get all visible/enabled scope tabs
    $('.scope-tab:visible').each(function() {
        const $scopeTab = $(this);
        const scope = $scopeTab.attr('scope');
        
        const scopeConfig = {
            scope: scope,
            linkTo: [],
            rateLimit: {
                enabled: false,
                numberOfRequests: null,
                duration: null
            },
            services: [],
            settings: []
        };

        // 1) Get scope entity linking
        $scopeTab.find('[role="link-scope-to-entity"]').each(function() {
            const $checkbox = $(this);
            const entityType = $checkbox.data('entity');
            
            if ($checkbox.is(':checked') && !$checkbox.is(':disabled')) {
                scopeConfig.linkTo.push(entityType);
            }
        });

        // 2) Get rate limiting
        const $rateLimitCheckbox = $(`#${scope}-rate-limit`);
        scopeConfig.rateLimit.enabled = $rateLimitCheckbox.is(':checked');
        scopeConfig.rateLimit.numberOfRequests = $(`#${scope}-limit-count`).val() || null;
        scopeConfig.rateLimit.duration = $(`#${scope}-limit-period`).val() || null;

        // 3) Get services and their entity linking
        const servicesMap = new Map();
        
        $scopeTab.find('[role="link-service-to-entity"][data-service]').each(function() {
            const $checkbox = $(this);
            const serviceName = $checkbox.data('service');
            const entityType = $checkbox.data('entity');
            const serviceType = $checkbox.data('service-type') || scope;
            
            if (!servicesMap.has(serviceName)) {
                servicesMap.set(serviceName, {
                    name: serviceName,
                    serviceType: serviceType,
                    enabled: false,
                    linkTo: [],
                    settings: []
                });
            }
            
            const serviceConfig = servicesMap.get(serviceName);
            
            if ($checkbox.is(':checked') && !$checkbox.is(':disabled')) {
                if (!serviceConfig.linkTo.includes(entityType)) {
                    serviceConfig.linkTo.push(entityType);
                }
            }
        });

        // 4) Process services and get settings
        servicesMap.forEach((serviceConfig, serviceName) => {
            serviceConfig.enabled = serviceConfig.linkTo.length > 0;
            
            if (serviceConfig.enabled) {
                const serviceSettings = getServiceSettings($scopeTab, serviceName, serviceConfig.linkTo);
                serviceConfig.settings = serviceSettings;
                scopeConfig.services.push(serviceConfig);
            }
        });

        // 5) Get scope-level settings
        $scopeTab.find('[service-setting]:not([role="set-service-setting-value"])').each(function() {
            const $setting = $(this);
            const settingName = $setting.attr('service-setting');
            const settingField = $setting.attr('service-setting-field') || '';
            const settingValue = $setting.val();
            
            let finalValue = settingValue;
            if ($setting.is(':checkbox')) {
                finalValue = $setting.is(':checked');
            }
            
            if (settingField) {
                let existingSetting = scopeConfig.settings.find(s => s.name === settingName);
                
                if (!existingSetting) {
                    existingSetting = {
                        name: settingName,
                        value: {},
                        linkTo: [...scopeConfig.linkTo],
                        settingType: 'scope'
                    };
                    scopeConfig.settings.push(existingSetting);
                }
                
                existingSetting.value[settingField] = finalValue;
            } else {
                scopeConfig.settings.push({
                    name: settingName,
                    value: finalValue,
                    linkTo: [...scopeConfig.linkTo],
                    settingType: 'scope'
                });
            }
        });

        // Convert JSON object settings to string
        scopeConfig.settings = scopeConfig.settings.map(setting => {
            if (typeof setting.value === 'object' && Object.keys(setting.value).length > 0) {
                return {
                    ...setting,
                    value: JSON.stringify(setting.value)
                };
            }
            return setting;
        });

        scopeConfigs.push(scopeConfig);
    });

    return scopeConfigs;
}

// Helper function to generate PostgreSQL script data
function generatePostgresScriptData() {
    const allConfigs = extractScopeConfiguration();
    const scriptData = {
        parent_name: $('#parentName').val(),
        create_integration_entity: $('#createIntegrator').is(':checked'),
        create_device_user: $('#createDeviceUser').is(':checked'),
        device_user_username: $('#deviceUsername').val(),
        device_user_password: $('#devicePassword').val(),
        device_user_email_address: $('#deviceEmail').val(),
        entity_service_types: [],
        entity_settings: []
    };

    // Generate entity_service_types array
    allConfigs.forEach(scopeConfig => {
        scriptData.entity_service_types.push([
            scopeConfig.scope,
            scopeConfig.rateLimit.enabled.toString(),
            scopeConfig.rateLimit.numberOfRequests,
            scopeConfig.rateLimit.duration
        ]);
    });

    // Generate entity_settings array
    allConfigs.forEach(scopeConfig => {
        // Scope-level settings
        scopeConfig.settings.forEach(setting => {
            setting.linkTo.forEach(entity => {
                scriptData.entity_settings.push([
                    scopeConfig.scope,
                    entityTypeMapping[entity], // Use the mapping here
                    setting.name,
                    setting.value
                ]);
            });
        });

        // Service-level settings
        scopeConfig.services.forEach(service => {
            service.settings.forEach(setting => {
                setting.linkTo.forEach(entity => {
                    scriptData.entity_settings.push([
                        service.serviceType || scopeConfig.scope,
                        entityTypeMapping[entity], // Use the mapping here
                        setting.name,
                        setting.value
                    ]);
                });
            });
        });
    });

    return scriptData;
}

// Helper function to get service settings
function getServiceSettings($scopeTab, serviceName, serviceLinkTo) {
    const serviceSettings = [];
    
    $scopeTab.find(`[role="set-service-setting-value"][data-service-name="${serviceName}"], [role="set-service-setting-value"][data-service="${serviceName}"]`).each(function() {
        const $setting = $(this);
        const settingName = $setting.data('setting');
        const settingTable = $setting.data('setting-table');
        const settingField = $setting.attr('service-setting-field') || '';
        const settingValue = $setting.val();
        
        let finalValue = settingValue;
        if ($setting.is(':checkbox')) {
            finalValue = $setting.is(':checked');
        }
        
        if (settingField) {
            let existingSetting = serviceSettings.find(s => s.name === settingName);
            
            if (!existingSetting) {
                existingSetting = {
                    name: settingName,
                    table: settingTable,
                    value: {},
                    linkTo: [...serviceLinkTo],
                    settingType: 'service'
                };
                serviceSettings.push(existingSetting);
            }
            
            existingSetting.value[settingField] = finalValue;
        } else {
            serviceSettings.push({
                name: settingName,
                table: settingTable,
                value: finalValue,
                linkTo: [...serviceLinkTo],
                settingType: 'service'
            });
        }
    });
    
    // Convert JSON object settings to string
    serviceSettings.forEach(setting => {
        if (typeof setting.value === 'object' && Object.keys(setting.value).length > 0) {
            setting.value = JSON.stringify(setting.value);
        }
    });
    
    return serviceSettings;
}
