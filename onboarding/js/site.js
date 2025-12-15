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
            <label class="list-group-item list-group-item-action no-text-select scope-item py-2 d-flex flex-row justify-content-between align-items-center" for="scope-${scope}">
                <div>
                    <input class="form-check-input me-2 scope-checkbox-input" type="checkbox" value="${scope}" id="scope-${scope}">
                    <span>${scope}<span class="scope-full-text">&nbsp;- ${scopeData.name}</span></span>
                    <span class="scope-abbr d-none">${scope}</span>
                </div>
                <div class="scope-services-badge-wrapper">
                    <span class="px-2 py-1 text-danger deselect-icon" data-action="deselect-scope" data-bs-toggle="tooltip"
                    data-bs-title="Remove scope from selection"
                    data-bs-placement="top" id="deselect-scope-${scope}" data-scope="${scope}"><i class="fa fa-times"></i></span>
                    <span class="badge bg-primary rounded-pill" data-bs-toggle="tooltip"
                    data-bs-title="Has ${scopeData.services.length} service${scopeData.services.length !== 1 ? 's' : ''}"
                    data-bs-placement="top">${scopeData.services.length}</span>
                </div>
            </label>
            `;
            scopeCheckboxesContainer.append(checkboxHtml);
            console.log(`Added checkbox for scope: ${scopeData}`);
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
            updateSelectAllCheckbox();
        });

        // Handle scope row clicks - navigate to tab if already selected
        $(document).on('click', '.list-group-item', function (e) {
            var clickedElement = $(e.target).parent();
            if (clickedElement !== undefined && clickedElement.length > 0) {
                if ($(clickedElement).attr('data-action') !== undefined && $(clickedElement).attr('data-action') === 'deselect-scope') {
                    console.log(scope)
                    removeScopeTab(scope);
                    checkTabVisibility();
                    updateSelectAllCheckbox();
                    return;
                }
            }

            // Check if the click was directly on the checkbox
            if ($(e.target).hasClass('scope-checkbox-input')) {
                // Let the checkbox handle its own toggle
                return;
            }

            const $checkbox = $(this).find('.scope-checkbox-input');
            const scope = $checkbox.val();
            const isChecked = $checkbox.is(':checked');

            // If already selected, navigate to the tab instead of deselecting
            if (isChecked) {
                e.preventDefault();
                e.stopPropagation();
                activateScopeTab(scope);
                return false; // Prevent any default behavior including scrolling
            }
            // If not selected, let the label's default behavior check the checkbox
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

        // Handle "Select All" checkbox
        $(document).on('change', '#selectAllScopes', function () {
            const isChecked = $(this).is(':checked');
            $('.scope-checkbox-input').each(function () {
                const $checkbox = $(this);
                const currentlyChecked = $checkbox.is(':checked');

                // Only trigger change if the state is different to avoid unnecessary operations
                if (currentlyChecked !== isChecked) {
                    $checkbox.prop('checked', isChecked).trigger('change');
                }
            });
        });

        // Handle "Invert Selection" button
        $(document).on('click', '#dd-InvertScopeSelection', function (e) {
            e.preventDefault();
            $('.scope-checkbox-input').each(function () {
                const $checkbox = $(this);
                $checkbox.prop('checked', !$checkbox.is(':checked')).trigger('change');
            });
            updateSelectAllCheckbox();
        });

        $(document).on('click', '#dd-SelectAllScopes', function (e) {
            e.preventDefault();
            $('.scope-checkbox-input').each(function () {
                const $checkbox = $(this);
                $checkbox.prop('checked', true).trigger('change');
            });
            updateSelectAllCheckbox();
        });

        $(document).on('click', '#dd-DeselectAllScopes', function (e) {
            e.preventDefault();
            $('.scope-checkbox-input').each(function () {
                const $checkbox = $(this);
                $checkbox.prop('checked', false).trigger('change');
            });
            updateSelectAllCheckbox();
        });

        // Handle rate limit checkbox toggle
        $(document).on('change', '.rate-limit-toggle', function() {
            const $checkbox = $(this);
            const scope = $checkbox.data('scope');
            const isEnabled = $checkbox.is(':checked');

            // Get the corresponding textboxes for this scope
            const $countInput = $(`#${scope}-limit-count`);
            const $periodInput = $(`#${scope}-limit-period`);

            if (isEnabled) {
                // Enable the textboxes
                $countInput.prop('disabled', false);
                $periodInput.prop('disabled', false);
            } else {
                // Disable the textboxes and clear their values
                $countInput.prop('disabled', true).val('');
                $periodInput.prop('disabled', true).val('');
            }
        });

        // Handle scope panel collapse/expand toggle
        $(document).on('click', '#toggleScopePanelCollapse', function() {
            const $scopePanel = $('.scope-panel-container');
            $scopePanel.toggleClass('collapsed');

            // Reinitialize tooltips after collapse/expand
            const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
            tooltipTriggerList.map(function (tooltipTriggerEl) {
                const existingTooltip = bootstrap.Tooltip.getInstance(tooltipTriggerEl);
                if (existingTooltip) {
                    existingTooltip.dispose();
                }
                return new bootstrap.Tooltip(tooltipTriggerEl);
            });
        });

        // Handle partial edit inputs (fields with fixed suffix)
        $(document).on('input', '.partial-edit-input', function() {
            const $input = $(this);
            const editableLength = parseInt($input.data('editable-length')) || 0;
            let value = $input.val();

            // Enforce maximum editable length
            if (value.length > editableLength) {
                value = value.substring(0, editableLength);
                $input.val(value);
            }
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
                <h4 class="pb-3 mt-2 card-body-title">${scope} Configuration</h4>
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

        // Scroll to the scopeSettingsCard to show the settings
        const scopeSettingsCard = document.getElementById('scopeSettingsCard');
        if (scopeSettingsCard) {
            scopeSettingsCard.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }

        console.log(`Activated tab for scope: ${scope}`);
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
        console.log(`Rendering tab content for scope: ${scope}`);
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
            <div class="settings-section rounded-4" section="rate-limiting">
                <div class="row">
                    <div class="col-auto align-content-center">
                        <div class="form-check form-check-sm">
                            <input class="form-check-input form-check-input-light rate-limit-toggle" type="checkbox" id="${scope}-rate-limit" data-scope="${scope}" checked="">
                            <label class="form-check-label form-check-label-sm text-white" for="${scope}-rate-limit">
                                Enable Rate Limiting
                            </label>
                        </div>
                    </div>
                    <div class="col">
                        <div class="input-group input-group-sm">
                            <input type="number" class="form-control rate-limit-input" id="${scope}-limit-count" data-scope="${scope}" placeholder="Number of requests" min="0" max="999" aria-label="RequestLimit" data-bs-toggle="tooltip" data-bs-placement="top" title="Leave empty for no limit">
                            <span class="input-group-text">every</span>
                            <input type="number" class="form-control rate-limit-input" id="${scope}-limit-period" data-scope="${scope}" placeholder="Number of hours" min="0" max="999" aria-label="RequestPeriod" data-bs-toggle="tooltip" data-bs-placement="top" title="Leave empty for no limit">
                            <span class="input-group-text">hours</span>
                        </div>
                    </div>
                </div>
            </div>
        `;




console.log(scopeData);
// Services section
// In renderScopeTab function:
// In renderScopeTab function, replace the services section with:
if (scopeData.services && scopeData.services.length > 0) {
    html += `<div class="settings-section rounded-4">
        <h3 class="fw-600 text-white mb-3">Service Assignment</h3>`

        html += `
        
        <!-- Service Settings Accordion (only show if any service has settings) -->
            <div class="service-settings-panel rounded-3 bg-white p-3 shadow-sm">
                <h5>Service Configuration</h5>
                <div class="${scopeData.services.some(service => service.settings && service.settings.length > 0) ? 'accordion' : ''}" id="${scope}-service-settings">
                    ${scopeData.services.map((service, index) => 
                        `<div class="accordion-item rounded-3">
                                <h2 class="accordion-header d-flex align-items-center flex-row">
                                    <div class="accordion-button accordion-button-sm bg-light px-3">
                                        <div class="form-check form-switch">
                                            <input class="form-check-input parent-service" type="checkbox"
                                                data-service="${service.name}"
                                                data-entity="parent"
                                                role="link-service-to-entity"
                                                data-scope="${scope}" id="${scope}-${safeRename(service.name)}-parent"
                                                data-entity="parent"
                                                data-table="${getEntityTable(service, 'parent')}" checked="" readonly="">
                                        </div>
                                        <div type="button" 
                                        class="w-100 ps-1 ${service.settings && service.settings.length > 0 ? '' : 'collapsed'}"
                                        data-bs-toggle="collapse"
                                        aria-expanded="${service.settings && service.settings.length > 0 ? 'true' : 'false'}"
                                        data-bs-target="#${scope}-${safeRename(service.name)}-config">${service.display || service.description}.
                                        <i class="bi bi-info-circle text-info" data-bs-toggle="tooltip" title="${service.description}"></i>
                                        </div>
                                            
                                    </div>
                                </h2>
                                <div id="${scope}-${safeRename(service.name)}-config" 
                                    class="bg-light ${service.settings && service.settings.length > 0 ? 'collapse show' : ''}" 
                                    ignore-data-bs-parent="#${scope}-service-settings">
                                    <div class="accordion-body pt-0">
                                    <div class="container-fluid">
                                        <div class="row mb-2">
                                            <div class="col-12">
                                            ${(typeof scopeData.allowOn === 'undefined' || (scopeData.allowOn || []).some((x) => x.toLowerCase() === 'integrator')) &&
                                                (typeof service.allowOn === 'undefined' || (service.allowOn || []).some((x) => x.toLowerCase() === 'integrator')) ? `
                                                <div class="form-check form-switch">
                                                    <input class="form-check-input integrator-service me-2" type="checkbox" role="link-service-to-entity" id="${scope}-${safeRename(service.name)}-integrator" data-service="${service.name}" data-entity="integrator" data-table="${getEntityTable(service, 'integrator')}">
                                                    <label class="form-check-label form-check-label-sm" for="${scope}-${safeRename(service.name)}-integrator">
                                                        Link to Integrator
                                                        <i class="bi bi-info-circle setting-info text-info" data-bs-toggle="tooltip" data-bs-title="Link ${service.name} to Integrator"></i>
                                                    </label>
                                                </div>` : ''}
                                            ${(typeof scopeData.allowOn === 'undefined' || (scopeData.allowOn || []).some((x) => x.toLowerCase().indexOf('user') > -1)) &&
                                                (typeof service.allowOn === 'undefined' || (service.allowOn || []).some((x) => x.toLowerCase().indexOf('user') > -1)) ? `
                                                <div class="form-check form-switch">
                                                    <input class="form-check-input deviceuser-service me-2" type="checkbox" role="link-service-to-entity" id="${scope}-${safeRename(service.name)}-deviceuser" data-service="${service.name}" data-entity="deviceuser" data-table="${getEntityTable(service, 'deviceuser')}">
                                                    <label class="form-check-label form-check-label-sm" for="${scope}-${safeRename(service.name)}-deviceuser">
                                                        Link to Device User
                                                        <i class="bi bi-info-circle setting-info text-info" data-bs-toggle="tooltip" data-bs-title="Link ${service.description} to Device User"></i>
                                                    </label>
                                                </div>` : ''}
                                            ${(typeof scopeData.allowOn === 'undefined' || (scopeData.allowOn || []).some((x) => x.toLowerCase().indexOf('webservice') > -1)) &&
                                                (typeof service.allowOn === 'undefined' || (service.allowOn || []).some((x) => x.toLowerCase().indexOf('webservice') > -1)) ? `
                                                <div class="form-check form-switch">
                                                    <input class="form-check-input webservice-service me-2" type="checkbox" role="link-service-to-entity" id="${scope}-${safeRename(service.name)}-webservice" data-service="${service.name}" data-entity="webservice" data-table="${getEntityTable(service, 'webservice')}">
                                                    <label class="form-check-label form-check-label-sm" for="${scope}-${safeRename(service.name)}-webservice">
                                                        Link to Web Service
                                                        <i class="bi bi-info-circle setting-info text-info" data-bs-toggle="tooltip" data-bs-title="Link ${service.description} to Web Service"></i>
                                                    </label>
                                                </div>` : ''}
                                            </div>
                                        </div>
                                    </div>
                                        ${renderGroupedSettings(service.settings, `${scope}-${safeRename(service.name)}`, 'service', scope, service.name)}
                                    </div>
                                </div>
                            </div>
                        `
                    ).join('')}
                </div>
            </div>
    </div>`;
    
    // Remove the old entity linking section since we're using the cards now
    // (The entity-linking section will no longer be rendered)
}

// Scope-level settings section
if (scopeData.settings && scopeData.settings.length > 0) {
    html += `<div class="settings-section rounded-4">
        <h3 class="fw-600 text-white mb-3">Scope Settings</h3>`;
    console.log('scopeData.settings:', scopeData.settings);
    html += renderGroupedSettings(scopeData.settings, scope, 'scope', );
    
    html += `</div>`;
}


        return html;
    }

    // NOTE: Assuming all required helper functions (safeRename, safeReplace, renderSetting) are available.

function renderGroupedSettings(settings, prefix, type = 'scope', scope, serviceName = '', allSettings) {
    console.log(`Rendering grouped settings for type: ${type}, scope: ${scope}, service: ${serviceName}`);
    console.group('Settings to Render:');
    console.log(settings);
    console.groupEnd();
    let html = '';
    prefix = safeRename(prefix);

    if (!settings || settings.length === 0) {
        return html;
    }

    // --- START: MODIFIED GROUPING LOGIC ---
    const groupedSettings = {};

    settings.forEach(setting => {
        console.group('Processing setting:');
        console.log('Processing setting:', setting);
        // ... (Parsing logic remains the same, assuming it correctly extracts properties)
        let groupName, 
        settingName, 
        description, 
        placeholder, 
        helpText, 
        inputType, 
        dependsOn, 
        options, 
        checkboxes, 
        label, 
        defaultValue, 
        settingField, 
        settingTableName, 
        currentServiceName, 
        values, 
        dependencyAction, 
        services,
        allowOn,
        sort,
        name;
        console.log(setting.name);
        if (typeof setting === 'string') {
            console.log('Setting is a string:', setting);
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
            sort = false;
            services = services || [currentServiceName];
            name = setting;
            allowOn = ["parent"];
        } else if (typeof setting === 'object' && Array.isArray(setting)) {
            console.log('Setting is an array:', setting);
            groupName = setting.group || 'General Settings';
            settingName = 'setting_group';
            currentServiceName = serviceName;
            values = null;
            settingTableName = 'entity_service_type_setting';
            services = services || [serviceName];
            allowOn = setting.allowOn || [];
            sort = setting.sort || false;
        } else {
            console.log('Setting is an object:', setting);
            groupName = setting.group || 'Service Settings';
            settingName = setting.name;
            name = setting.name;
            allowOn = setting.allowOn || [];
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
            sort = setting.sort || false;
            services = setting.services || [serviceName];
        }

        
        // Determine Main Group and Subgroup (Logic remains the same)
        let mainGroup = groupName;
        let subGroup = null;
        const delimiter = '.';
        if (groupName.includes(delimiter)) {
            console.log('Group name contains delimiter:', groupName);
            const parts = groupName.split(delimiter);
            subGroup = parts.pop().trim();
            mainGroup = parts.join(delimiter).trim() || 'General Settings';
        } else {
            console.log('Group name does not contain delimiter:', groupName);
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
            values: values,
            services: services,
            sort: sort,
            allowOn: allowOn
        });

        console.groupEnd();
    });
    // --- END: MODIFIED GROUPING LOGIC ---

    console.group('Grouped Settings Structure');
    console.log(groupedSettings);
    console.groupEnd();

    // --- NEW: Determine if an outer accordion is needed ---
    const mainGroupNames = Object.keys(groupedSettings);
    const hasMultipleMainGroups = mainGroupNames.length > 1;

    // If there is only one main group, we skip the outer accordion wrapper and its header.
    if (hasMultipleMainGroups) {
        html += `<div class="accordion accordion-spaced rounded-3 overflow-hidden">`;
    }

    let mainGroupIndex = 0;

    // --- START: RENDERING LOGIC (Updated) ---
    mainGroupNames.forEach(mainGroupName => {
        console.group(`Rendering Main Group: ${mainGroupName}`);
        const subGroups = groupedSettings[mainGroupName];
        const mainGroupHtmlId = safeReplace(`${prefix}-${mainGroupName}`.toLowerCase(), /\s/g, '_');
        
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
            console.log('Setting has multiple main groups:', mainGroupName);
             html += `<div class="accordion-item rounded-3 mb-4">
                <h2 class="accordion-header">
                    <button class="accordion-button ${mainGroupButtonClass} bg-none" type="button" data-bs-toggle="collapse" aria-expanded="${mainGroupAriaExpanded}" data-bs-target="#${mainGroupHtmlId}">
                        <div class="d-flex justify-content-between w-100 me-2 align-items-center">
                            <h4 class="p-0 m-0">${mainGroupName}</h4>
                            <span class="badge bg-secondary rounded-pill me-3">${totalSettingsCount}</span>
                        </div>
                    </button>
                </h2>
                <div id="${mainGroupHtmlId}" class="accordion-collapse collapse ${mainGroupShowClass}" data-bs-parent=".accordion">
                    <div class="accordion-body">`;
        } else {
            console.log('Setting has only one main group, rendering without accordion:', mainGroupName);
             // If only one main group, start the container here (no collapse/header)
             html += `<div class="p-0 mt-3"><h6>${mainGroupName}</h6>`; // Use a simple div to contain content
        }

        // Subgroup Rendering Logic (Nested Accordion vs. Direct Render)
        const subGroupNames = Object.keys(subGroups);
        console.log('Subgroups found:', subGroupNames);
        // This condition correctly checks for more than one subgroup, or if the only subgroup is NOT 'General Settings'
        const hasMultipleSubgroups = subGroupNames.length > 1 || (subGroupNames.length === 1 && subGroupNames[0] !== 'General Settings');

        if (hasMultipleSubgroups) {
            console.info('Rendering nested accordion for subgroups under main group:', mainGroupName);
            // Nested Accordion for Subgroups (If multiple subgroups exist)
            html += `<div class="accordion accordion-flush" id="${mainGroupHtmlId}-subgroups">`;
            
            subGroupNames.forEach(subGroupName => {
                console.group(`Rendering Subgroup: ${subGroupName}`);
                const subGroupHtmlId = safeReplace(`${prefix}-${mainGroupName}-${subGroupName}`.toLowerCase(), /\s/g, '_');
                const subgroupCount = subGroups[subGroupName].length;
                
                // Subgroup State Logic (Set to show by default)
                const subGroupButtonClass = ''; 
                const subGroupAriaExpanded = 'true';
                const subGroupShowClass = 'show';
                
                // Subgroup Accordion Item
                html += `<div class="accordion-item bg-light border-bottom rounded-3">
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
                    console.group('Rendering setting within subgroup:');
                    console.log('Setting Object:', settingObj);
                    // Pass the complete list of settings (needed for dependency initial state)
                    html += renderSetting(settingObj, prefix, serviceName, settings);
                    console.groupEnd();
                });
                
                html += `           </div>
                        </div>
                    </div>
                </div>`;
                console.groupEnd();
            });
            html += `</div>`; // Close nested accordion
        } else {
            // Render settings directly if there's only one subgroup (General Settings or not)
            console.warn('Rendering settings directly for single subgroup under main group:', mainGroupName);
            const settingsArray = subGroups[subGroupNames[0]];
            // Render the row directly, without an extra header/accordion wrapper
            html += `<div class="p-3 bg-light border rounded-3"><div class="row">`;
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
        console.groupEnd();
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
console.log(settingObj);
    // --- START: Dependency ID Generation Logic ---
    let dependsOnAttr = '';
    let controllingId = '';
    if (settingObj.dependsOn) {
        // Format: 'otherFieldName:requiredValue'
        const [controllingField, requiredValue] = settingObj.dependsOn.split(':');
        // 1. Check if the setting is a multi-field setting (i.e., has a field property)
        if (settingObj.settingField) {
            // This is a field-level dependency on another field within the same setting name.
            if (controllingField && requiredValue !== undefined) {
                // The controlling element's ID is the settingName + controllingField
                // e.g., 'scope-parent-ocs-ed-mandate-default-details___generateContractReference'
                controllingId = createDependencyId(prefix, settingName + '___' + controllingField);
                
                // The data attribute now holds both the target ID and the required value
                dependsOnAttr = `data-depends-on="${controllingId}" data-required-value="${requiredValue.toLowerCase()}"`;
            }
        } else {
            console.log('Generating dependency for single-setting:', settingObj.settingName);
            if (controllingField && requiredValue !== undefined) {
                // const controllingId = createDependencyId(prefix, controllingField);
                controllingId = createDependencyId(prefix, controllingField);
                console.log('Controlling ID (multi-field):', controllingField);
                // 2. Standard single-setting dependency on a different setting name.
                // Format: 'otherSettingName' or 'otherSettingName:requiredValue'
                dependsOnAttr = `data-depends-on="${controllingId}" data-required-value="${requiredValue.toLowerCase()}"`;
            }
        }
    }
    // --- END: Dependency ID Generation Logic ---
    console.log('DependsOnAttr for', settingObj.settingName, ':', dependsOnAttr);
    // Standard attributes shared by most inputs/selects
    const inputId = createControlId(prefix, settingObj.settingName, settingObj.settingField);
    console.log('Rendering setting:', settingObj.settingName, ' for service:' , serviceName, 'with ID:', inputId);
    const sharedAttrs = `
        data-dependant-name="${controllingId}"
        service-setting="${settingObj.settingName}"
        role="set-service-setting-value"
        data-allow-on="${settingObj.allowOn ? settingObj.allowOn.join(',') : 'parent'}"
        data-service-name="${serviceName}"
        data-setting="${settingObj.settingName}"
        data-service="${settingObj.services ? settingObj.services.join(',') : serviceName}"
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
        console.error(settingObj.sort);
        html += `
            <div class="mb-3 col-md-6" ${dependsOnAttr}>
                ${inputHeader}
                <select class="form-select form-select-sm" id="${inputId}" ${sharedAttrs}>
                    ${renderOptionsHtml(settingObj.values, settingObj.defaultValue, true, settingObj.sort)}
                </select>
                ${helpTextHtml}
            </div>
        `;

    } else if (settingObj.type === 'radio') {
        html += renderRadioSetting(settingObj, inputId, prefix, serviceName, dependsOnAttr);
        
    } else if (settingObj.type === 'checkbox') {
        // Updated call to pass dependsOnAttr for the container div
        html += renderCheckboxSetting(settingObj, inputId, prefix, dependsOnAttr, sharedAttrs); 
    } 
    // ... (other types like dual-checkbox, radio-button-group, etc.)
    else {
        // Default Text Input (for 'text', 'textbox', 'password', etc.)
        const inputType = settingObj.type === 'textbox' ? 'text' : settingObj.type;

        // Check if this is a partially editable field
        if (settingObj.partialEdit) {
            const editableLength = settingObj.partialEdit.editableLength || 0;
            const fixedSuffix = settingObj.partialEdit.fixedSuffix || '';
            const editablePlaceholder = settingObj.partialEdit.placeholder || 'X'.repeat(editableLength);
            const maxLengthAttr = editableLength ? `maxlength="${editableLength}"` : '';

            html += `
                <div class="mb-3 col-md-6" ${dependsOnAttr}>
                    ${inputHeader}
                    <div class="input-group input-group-sm">
                        <input type="${inputType}" class="form-control form-control-sm partial-edit-input"
                        id="${inputId}"
                        placeholder="${safeReplace(editablePlaceholder, '"', '&#34;')}"
                        value="${settingObj.defaultValue || ''}"
                        ${maxLengthAttr}
                        data-fixed-suffix="${safeReplace(fixedSuffix, '"', '&#34;')}"
                        data-editable-length="${editableLength}"
                        ${sharedAttrs}>
                        <span class="input-group-text">${fixedSuffix}</span>
                    </div>
                    ${helpTextHtml}
                </div>
            `;
        } else {
            // Standard text input
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
function renderOptionsHtml(values, defaultValue, isSelect = false, sort = false) {
    if (!values || values.length === 0) {
        return isSelect ? `<option value="">No options available</option>` : '';
    }

    let optionsHtml = isSelect ? `<option value="">-- Select an option --</option>` : '';
    const defValue = defaultValue ? String(defaultValue) : '';
    
    const isKeyValObject = typeof values[0] === 'object' && values[0] !== null;

    if (sort && isKeyValObject) {
        values.sort((a, b) => {
            const valueA = a.value.toUpperCase(); // Ignore case
            const valueB = b.value.toUpperCase(); // Ignore case
            if (valueA < valueB) return -1;
            if (valueA > valueB) return 1;
            return 0;
        });
    }

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

    function renderCheckboxSetting(settingObj, inputId, prefix, dependsOnAttr, sharedAttrs) {
       
        return `
            <div class="mb-3 col-md-12">
                <div class="form-check form-switch">
                    <input class="form-check-input setting-checkbox" type="checkbox" id="${inputId}" ${sharedAttrs} ${dependsOnAttr}>
                    <label class="form-check-label form-check-label-sm" for="${inputId}">
                        ${settingObj.label}
                        ${settingObj.description ? `<i class="bi bi-info-circle setting-info text-info" data-bs-toggle="tooltip" data-bs-title="${settingObj.description}"></i>` : ''}
                    </label>
                </div>
                ${settingObj.helpText ? `<div class="form-text text-muted">${settingObj.helpText}</div>` : ''}
            </div>
        `;
    }

    // function renderDualCheckboxSetting(settingObj, inputId, prefix) {
    //     let checkboxesHtml = '';
        
    //     if (settingObj.checkboxes && settingObj.checkboxes.length > 0) {
    //         settingObj.checkboxes.forEach((checkbox, index) => {
    //             const checkboxId = `${inputId}-${checkbox.name}`;
    //             const dependsOnAttr = checkbox.dependsOn ? `data-depends-on="${createDependencyId(prefix, checkbox.dependsOn)}"` : '';
    //             const indentClass = index > 0 ? 'ms-4' : '';
                
    //             checkboxesHtml += `
    //                 <div class="form-check ${indentClass}" ${dependsOnAttr}>
    //                     <input class="form-check-input reference-checkbox" type="checkbox" id="${checkboxId}">
    //                     <label class="form-check-label" for="${checkboxId}">
    //                         ${checkbox.label}
    //                     </label>
    //                 </div>
    //             `;
    //         });
    //     }
        
    //     const dependsOnAttr = settingObj.dependsOn ? `data-depends-on="${createDependencyId(prefix, settingObj.dependsOn)}"` : '';
        
    //     return `
    //         <div class="mb-3 col-md-12 reference-setting-group" ${dependsOnAttr}>
    //             <h6 class="mb-2">${settingObj.label}</h6>
    //             ${checkboxesHtml}
    //             ${settingObj.helpText ? `<div class="form-text text-muted mt-1">${settingObj.helpText}</div>` : ''}
    //         </div>
    //     `;
    // }

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
    
        console.log(`Found dependent element (${$dependentElement.attr('id')}) with dependency: ${dependsOnId}`);
    
    if (dependsOnId) {
        let $masterElement = $(`#${dependsOnId}`);
        if ($masterElement.length === 0) {
            $masterElement = $('#' + dependsOnId);
        }
        
        if ($masterElement.length > 0) {
            console.log(`Found master element: ${dependsOnId}, is checkbox: ${$masterElement.is(':checkbox')}`);
            
            // Create unique namespace for this dependency
            const uniqueNamespace = `dependency.${dependsOnId}`;
            
            // Set initial state
            updateDependencyState($dependentElement, $masterElement.is(':checked'));
            
            // Remove only this specific dependency's handlers
            // $masterElement.off(`.${uniqueNamespace}`);
            
            // Handle changes to the master element with unique namespace
            $masterElement.on(`change.${uniqueNamespace}`, function() {
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
            console.log('Enabling dependent element');
            // $dependentElement.show();
            if ($dependentElement.attr('type') === 'checkbox') {
                $dependentElement.prop('disabled', false);
            } else {
            var found = $dependentElement.find('input, select, textarea');
            console.log('Found dependent inputs:', found);
            $dependentElement.find('input, select, textarea').prop('disabled', false);
            }
            
        } else {
            console.log('Disabling dependent element');

            if ($dependentElement.attr('type') === 'checkbox') {
                $dependentElement.prop('disabled', true);
            }

            // $dependentElement.hide();
            $dependentElement.find('input, select, textarea').prop('disabled', true);
            
            // Clear values when disabled
            $dependentElement.find('input:not([type="checkbox"]), select, textarea').val('');
            $dependentElement.find('input[type="checkbox"]').prop('checked', false);
        }
    }

    function autoSelectScopesFromQueryParams() {
    const urlParams = new URLSearchParams(window.location.search);

    // Check for scope parameter (can be single scope or comma-separated list)
        if (urlParams.has('scope') || urlParams.has('scopes')) {
            const scopesToSelect = [];
            if (urlParams.has('scope')) {
                scopesToSelect.push(...urlParams.get('scope').split(',').map(s => s.trim().toUpperCase())); 
            }
            if (urlParams.has('scopes')) {
                scopesToSelect.push(...urlParams.get('scopes').split(',').map(s => s.trim().toUpperCase()));
            }
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
            if (urlParams.get(scope) === 'true' || urlParams.get(scope) === '1') {
                $(`#scope-${scope}`).prop('checked', true).trigger('change');
                console.log(`Auto-selected scope via individual parameter: ${scope}`);
            }
        });

    urlParams.forEach(function(value, key) {
        console.log(`Processing query parameter: ${key} = ${value}`);
        // Find the element
        let $element = $('[name="' + key + '"]');
        
        // Check input type
        if ($element.attr('type') === 'radio' || $element.attr('type') === 'checkbox') {
            $element.filter('[value="' + value + '"]').prop('checked', true);
            // Filter to find the specific checkbox/radio with the matching value
            if (Boolean(value) === true || value.toLocaleLowerCase() === 'true' || value === '1') {
                $element.prop('checked', true).trigger('change');
            }
        } else {
            // Standard inputs
            $element.val(value);
        }
    });
        const queryParams = new URLSearchParams(window.location.search);
        
        
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
                        $(`#${scope}-rate-limit`).prop('checked', scopeConfig.rateLimit).trigger('change');
                    }
                    if (scopeConfig.limitCount !== undefined && scopeConfig.rateLimit) {
                        $(`#${scope}-limit-count`).val(scopeConfig.limitCount);
                    }
                    if (scopeConfig.limitPeriod !== undefined && scopeConfig.rateLimit) {
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
                                            const $input = $(`#${scope}-${serviceName}-${setting}`);
                                            setInputValue($input, scopeConfig.services[serviceName].settings[setting]);
                                        }
                                    });
                                }
                            }
                        });
                    }

                    // Scope settings
                    if (scopeConfig.settings) {
                        Object.keys(scopeConfig.settings).forEach(setting => {
                            const $input = $(`#${scope}-${setting}`);
                            setInputValue($input, scopeConfig.settings[setting]);
                        });
                    }

                    // Shared settings
                    if (scopeConfig.sharedSettings) {
                        Object.keys(scopeConfig.sharedSettings).forEach(setting => {
                            const $input = $(`#${scope}-${setting}`);
                            setInputValue($input, scopeConfig.sharedSettings[setting]);
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

    // Helper function to get the appropriate table for an entity from service.entityTables
    function getEntityTable(service, entityType) {
        // If service doesn't have entityTables, return default tables based on entity type
        if (!service.entityTables || !Array.isArray(service.entityTables)) {
            // Default tables for each entity type
            if (entityType.toLowerCase() === 'parent') {
                return 'entity_service';
            } else if (entityType.toLowerCase() === 'integrator' || entityType.toLowerCase() === 'deviceuser' || entityType.toLowerCase() === 'webservice') {
                return 'entity_service_type';
            }
            return 'entity_service';
        }

        // Search through entityTables to find the matching table
        for (const tableMapping of service.entityTables) {
            if (tableMapping.entities && Array.isArray(tableMapping.entities)) {
                // Check if the current entity type matches any in this mapping
                const matchingEntity = tableMapping.entities.find(e =>
                    e.toLowerCase() === entityType.toLowerCase()
                );
                if (matchingEntity && tableMapping.tables && tableMapping.tables.length > 0) {
                    // Return the first table in the tables array
                    return tableMapping.tables[0].toLowerCase();
                }
            }
        }

        // If no match found, return default table
        return entityType.toLowerCase() === 'parent' ? 'entity_service' : 'entity_service_type';
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

// function extractScopeConfiguration_old() {
//     const config = {
//         parentName: $('#parentName').val(),
//         website: $('#website').val(),
//         createDeviceUser: $('#createDeviceUser').is(':checked'),
//         deviceUsername: $('#deviceUsername').val(),
//         deviceEmail: $('#deviceEmail').val(),
//         createIntegrator: $('#createIntegrator').is(':checked'),
//         integratorName: $('#integratorName').val(),
//         scopes: {}
//     };

//     $('.scope-checkbox-input:checked').each(function() {
//         const scope = $(this).val();
//         const $scopeTab = $(`#${scope}`);
        
//         if ($scopeTab.length === 0) return;

//         const scopeConfig = {
//             allowOn: [],
//             rateLimit: {
//                 enabled: false,
//                 numberOfRequests: null,
//                 duration: null
//             },
//             services: [],
//             settings: []
//         };

//         // Get scope entity linking
//         $scopeTab.find('[section="entity-linking"] [scope-link]').each(function() {
//             const $checkbox = $(this);
//             if ($checkbox.is(':checked') && !$checkbox.is(':disabled')) {
//                 scopeConfig.allowOn.push($checkbox.attr('scope-link'));
//             }
//         });

//         // Get rate limiting
//         const $rateLimitCheckbox = $(`#${scope}-rate-limit`);
//         scopeConfig.rateLimit.enabled = $rateLimitCheckbox.is(':checked');
//         scopeConfig.rateLimit.numberOfRequests = $(`#${scope}-limit-count`).val() || null;
//         scopeConfig.rateLimit.duration = $(`#${scope}-limit-period`).val() || null;

//         // Get global service entities
//         const serviceEntities = ['parent']; // Parent is always included
//         if ($(`#${scope}-services-integrator`).is(':checked')) serviceEntities.push('integrator');
//         if ($(`#${scope}-services-device`).is(':checked')) serviceEntities.push('user');

//         // Get services
//         $scopeTab.find('.service-group[service]').each(function() {
//             const $serviceGroup = $(this);
//             const serviceName = $serviceGroup.attr('service');
//             const serviceEnabled = $serviceGroup.find('[role="service-enabled"]').is(':checked');
            
//             if (!serviceEnabled) return;

//             const serviceConfig = {
//                 name: serviceName,
//                 enabled: serviceEnabled,
//                 allowOn: [...serviceEntities], // Copy the global entities
//                 settings: []
//             };

//             // Get service settings
//             $serviceGroup.find('[service-setting]').each(function() {
//                 // ... (same settings extraction logic as before)
//             });

//             scopeConfig.services.push(serviceConfig);
//         });

//         // Get scope-level settings
//         // ... (same as before)

//         config.scopes[scope] = scopeConfig;
//     });

//     return config;
// }



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
    $('.scope-checkbox-input:checked').each(function() {
    // $('.scope-tab:visible').each(function() {
        const scope = $(this).val();
        const $scopeTab = $(`#${scope}`);
        // const $scopeTab = $(this);
        // const scope = $scopeTab.attr('scope');
        
        const scopeConfig = {
            scope: scope,
            linkTo: ['parent'],
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
            console.log('Service Config:', serviceConfig);
            if ($checkbox.is(':checked') && !$checkbox.is(':disabled')) {
                if (!serviceConfig.linkTo.includes(entityType)) {
                    serviceConfig.linkTo.push(entityType);
                }
            }
        });

        // 4) Process services and get settings
        servicesMap.forEach((serviceConfig, serviceName) => {
            serviceConfig.enabled = serviceConfig.linkTo.length > 0;
            console.log(`Processing service: ${serviceName}, enabled: ${serviceConfig.enabled}`);
            if (serviceConfig.enabled) {
                const serviceSettings = getServiceSettings($scopeTab, serviceName, serviceConfig.linkTo);
                console.log(`Service Settings for ${serviceName}:`, serviceSettings);
                serviceConfig.settings = serviceSettings;
                scopeConfig.services.push(serviceConfig);
            }
        });

        // 5) Get scope-level settings
        $scopeTab.find('[role="set-service-setting-value"]').each(function() {
            const $setting = $(this);
            const settingName = $setting.attr('service-setting');
            const settingField = $setting.attr('service-setting-field') || '';
            const settingValue = $setting.val();
            const services = $setting.data('setting') || [serviceName];
            
            let finalValue = settingValue;
            if ($setting.is(':checkbox')) {
                finalValue = $setting.is(':checked');
            }
            
            ($setting.data('service').split(',') || [serviceName]).forEach(function(x,i)  {
                var serviceExist = scopeConfig.services.find(s => s.name.trim().toLowerCase() === x.trim().toLowerCase());
                if (serviceExist) {
                console.log(`Processing field-level setting: ${settingName} - ${serviceExist}`);
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

$(document).on('click', 'button[id^="deselect-scope-"]', function (e) {
    e.stopPropagation();
    var scope = $(this).attr('id').split('-').pop();
    console.log(scope)
    removeScopeTab(scope);
    checkTabVisibility();
    updateSelectAllCheckbox();
});

    function removeScopeTab(scope) {
        // Remove the tab elements completely
        $(`#${scope}-tab`).parent().remove();
        $(`#${scope}`).remove();
        
        console.log(`Removed tab for scope: ${scope}`);
    }

     // Function to update the "Select All" checkbox state
        function updateSelectAllCheckbox() {
            const totalScopes = $('.scope-checkbox-input').length;
            const checkedScopes = $('.scope-checkbox-input:checked').length;

            const $selectAll = $('#selectAllScopes');
            if (checkedScopes === 0) {
                $selectAll.prop('checked', false);
                $selectAll.prop('indeterminate', false);
            } else if (checkedScopes === totalScopes) {
                $selectAll.prop('checked', true);
                $selectAll.prop('indeterminate', false);
            } else {
                $selectAll.prop('checked', false);
                $selectAll.prop('indeterminate', true);
            }
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
    console.log(`Getting settings for service: ${serviceName} with linkTo:`, serviceLinkTo);
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


function generateScript1() {
    const parentName = $('#parentName').val();
    // Validate required fields
    if (!parentName) {
        alert('Please enter a Parent Entity Name');
        $('#parentName').focus();
        return;
    }

    const selectedScopes = [];
    $('.scope-checkbox-input:checked').each(function() {
        selectedScopes.push($(this).val());
    });

    if (selectedScopes.length === 0) {
        alert('Please select at least one scope');
        return;
    }

    sqlScript = `-- Generated SQL Onboarding Script
-- Date: ${new Date().toLocaleDateString()}
-- Time: ${new Date().toLocaleTimeString()}
-- Parent Entity: ${parentName}

DO $$

DECLARE
-- Parent Entity ---------------
\tparent_name \t\t\t\tTEXT := \t'${parentName}';
\tentity_service_types \t\tTEXT[] :=array[
--  | Scope | Limit | Count | Period|
`;

    selectedScopes.forEach((scope, index) => {
        var rateLimit = $(`#${scope}-rate-limit`).prop('checked');
        var limitCount = $(`#${scope}-limit-count`).val() == '' ? null : $(`#${scope}-limit-count`).val();
        var limitPeriod = $(`#${scope}-limit-period`).val() == '' ? null : $(`#${scope}-limit-period`).val();
        // console.log(scope);
        // console.log($(`#${scope}-rate-limit`).prop('checked'));
        // console.log($(`#${scope}-limit-count`).val() == '' ? null : $(`#${scope}-limit-count`).val());
        // console.log($(`#${scope}-limit-period`).val() == '' ? null : $(`#${scope}-limit-period`).val());
        sqlScript += `\t[ '${scope}', '${rateLimit}',  ${limitCount},   ${limitPeriod}],\n`
    });

    sqlScript += `-- Integration Entity ----------\n`
    sqlScript += `create_integration_entity 	BOOLEAN:= 	${$('#createIntegrator').prop('checked')};\n\n`
    sqlScript += `-- Device User -----------------\n`
    sqlScript += `create_device_user 			BOOLEAN:= 	${$('#createDeviceUser').prop('checked')};\n`
    
    if ($('#createDeviceUser').prop('checked')) {
        sqlScript += 
        `\tdevice_user_username 		TEXT:= 		${$('#deviceUsername').val()}; 	
\tdevice_user_password 		TEXT:= 		'${$('#devicePassword').val()}'; 
\tdevice_user_email_address TEXT:= 		'${$('#deviceEmail').val()}';
\tdevice_user_is_active 	BOOLEAN:= 	true;\n`
    }

    sqlScript += `
-- Entity Settings
-- Each scope in these settings must be added to the parent's "entity_service_types"
-- p: Parent
-- d: Device User
-- i: Integrator
    
    entity_settings TEXT[] := array[
--  | SCOPE 	|Entity | Identifier                  		| Value 		|\n`
    
    // ===== COLLECT SETTINGS =====
    const entitySettings = [];

    selectedScopes.forEach(scope => {
        const scopeData = scopes[scope];
        console.log('Processing scope:', scope, scopeData);
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
    
}

/**
 * Generates the full PostgreSQL setup script based on the provided JSON configuration.
 *
 * @param {string} jsonString The raw JSON string as provided.
 * @returns {string} The complete, populated PostgreSQL script.
 */
function generateSqlScript(jsonString) {
    let data;
    try {
        data = JSON.parse(jsonString);
    } catch (e) {
        console.error("Invalid JSON input:", e);
        return "-- ERROR: Invalid JSON input. Could not parse. --";
    }

    const entityServiceTypesLines = [];
    const entitySettingsLines = [];
    
    // Default values from template, to be overridden by JSON
    const mandateDefaults = {
        type: 'Usage',
        classification: 'LRM',
        maxAmount: '10000',
        frequency: 'MONTHLY',
        adjFrequency: 'ANUALLY',
        adjValue: '1',
        format: 'KATSON_*******',
        scheme: 'KATSON'
    };
    
    const entityMap = {
        parent: 'p',
        integrator: 'i',
        deviceuser: 'd'
    };

    /**
     * Formats a JavaScript value into a SQL string literal,
     * correctly escaping single quotes and backslashes.
     */
    function formatSqlValue(value) {
        if (value === null || typeof value === 'undefined') return 'null';
        let strValue = String(value);
        // Escape backslashes first, then single quotes
        strValue = strValue.replace(/\\/g, "\\\\");
        strValue = strValue.replace(/'/g, "''");
        return `'${strValue}'`;
    }

    // --- Process the JSON data ---
    data.forEach(scope => {
        
        // 1. Populate entity_service_types
        const scopeName = scope.scope;
        const limit = scope.rateLimit.enabled;
        // The SQL array is TEXT[], so 'null' should be a string, not a SQL NULL
        const count = scope.rateLimit.numberOfRequests === null ? 'null' : scope.rateLimit.numberOfRequests;
        const period = scope.rateLimit.duration === null ? 'null' : scope.rateLimit.duration;
        
        entityServiceTypesLines.push(`\t[ ${formatSqlValue(scopeName)}, ${formatSqlValue(limit)},  ${count},    ${period} ]`);

        // 2. Find OCS Mandate Settings to populate defaults
        if (scope.scope === 'OCS') {
            const mandateSetting = scope.settings.find(s => s.name === 'ocs.ed.mandate.default.details');
            if (mandateSetting) {
                try {
                    // This value is a stringified JSON object
                    const mandateValue = JSON.parse(mandateSetting.value);
                    mandateDefaults.type = mandateValue.mandateType || mandateDefaults.type;
                    mandateDefaults.classification = mandateValue.debitClassification || mandateDefaults.classification;
                    mandateDefaults.maxAmount = mandateValue.maximumInstallmentAmount || mandateDefaults.maxAmount;
                    mandateDefaults.frequency = mandateValue.frequency || mandateDefaults.frequency;
                    mandateDefaults.adjFrequency = mandateValue.adjustmentFrequency || mandateDefaults.adjFrequency;
                    mandateDefaults.adjValue = mandateValue.adjustmentValue || mandateDefaults.adjValue;
                    mandateDefaults.format = mandateValue.referenceFormat || mandateDefaults.format;
                    mandateDefaults.scheme = mandateValue.scheme || mandateDefaults.scheme;
                } catch (e) {
                    console.warn(`Could not parse OCS mandate defaults: ${e.message}`);
                }
            }
        }

        /**
         * Processes a setting object (from scope.settings or service.settings)
         * and adds it to the entitySettingsLines array for each entity it links to.
         */
        const processSetting = (setting) => {
            let finalValue = setting.value;

            // This logic handles the 3 different ways values are stored in the JSON:
            // 1. Plain string: "ED_USERNAME"
            // 2. JSON string (wrapped): "{\\"\\":\\"reference setting\\"}"
            // 3. JSON string (object): "{\\"frequency\\":\\"MONTHLY\\",...}"
            try {
                const parsedVal = JSON.parse(finalValue);
                if (parsedVal && typeof parsedVal === 'object') {
                    // It's a JSON string. Check if it's the {"": "value"} format.
                    if (parsedVal.hasOwnProperty("")) {
                        finalValue = parsedVal[""]; // Use the unwrapped value
                    }
                    // If not, we keep finalValue as the original string (e.g., for mandate.default.details)
                }
            } catch (e) {
                // Not a JSON string, so it's a plain value. Do nothing.
            }

            const links = setting.linkTo || ['parent'];
            links.forEach(link => {
                const entity = entityMap[link];
                if (entity) {
                    entitySettingsLines.push(`        ['${scope.scope}', '${entity}', '${setting.name}', ${formatSqlValue(finalValue)}]`);
                }
            });
        };

        // 3. Populate entity_settings from both scope and service settings
        scope.settings.forEach(processSetting);
        scope.services.forEach(service => {
            service.settings.forEach(processSetting);
        });
    });

    // --- Assemble the final SQL script ---
    const finalScript = `
DO $$

DECLARE
-- Parent Entity ---------------
	parent_name 				TEXT := 	'Katli and Son Company'; -- << CHANGE
	entity_service_types 		TEXT[] :=array[
--  | Scope | Limit | Count | Period|
${entityServiceTypesLines.join(',\n')}
    ];

-- Integration Entity ----------
	create_integration_entity 	BOOLEAN:= 	true;  -- << CHANGE (true or false)

-- Device User -----------------
    create_device_user 			BOOLEAN:= 	true;  			-- << CHANGE (true or false)
    device_user_username 		TEXT:= 		'katli'; 		-- << CHANGE
    device_user_password 		TEXT:= 		'katli@123'; 	-- << CHANGE
    device_user_email_address 	TEXT:= 		'development@bitventure.co.za'; -- << CHANGE
    device_user_is_active 		BOOLEAN:= 	true;  			-- << CHANGE (true or false)


-- Entity Settings
	-- Each scope in these settings must be added to the parent's "entity_service_types"
	-- p: Parent
	-- d: Device User
	-- i: Integrator
    entity_settings TEXT[] := array[
	-- Add 2 dashes in front of the setting if not needed or pass NULL as the value
    --  | SCOPE 	|Entity | Identifier                  		| Value 		|
${entitySettingsLines.join(',\n')}
    ];

-- Payment Reference Fields
	manual_payments_reference_fields 		BOOLEAN:=		true;
	manual_payments_customer_reference 		TEXT:= 			'disabled'; -- Acceptable values: enabled, disabled, required
	manual_payments_internal_reference 		TEXT:= 			'disabled'; -- Acceptable values: enabled, disabled, required

-- Mandate defaults
    ocs_default_mandate_type 				TEXT:= 			'${mandateDefaults.type}';
    ocs_default_debit_classification 		TEXT:= 			'${mandateDefaults.classification}';
    ocs_default_max_installment_amount 		TEXT:= 			'${mandateDefaults.maxAmount}';
    ocs_default_frequency 					TEXT:= 			'${mandateDefaults.frequency}'; 
    ocs_default_tracking_enabled 			BOOLEAN:= 		true;
    ocs_default_date_adjustment_allowed 	TEXT:= 			'Y'; -- Either 'Y' or 'N'
    ocs_default_adjustment_frequency 		TEXT:= 			'${mandateDefaults.adjFrequency}';
    ocs_default_adjustment_type 			TEXT:= 			'RATE';
    ocs_default_adjustment_value 			TEXT:= 			'${mandateDefaults.adjValue}';
    ocs_default_generate_installment 		BOOLEAN:= 		true;
    ocs_default_calculate_installment 		BOOLEAN:= 		false;
    ocs_default_generate_contract_reference BOOLEAN:= 		true;
    ocs_default_contract_reference_format 	TEXT:= 			'${mandateDefaults.format}';
	ocs_default_scheme 						TEXT:= 			'${mandateDefaults.scheme}';

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
	setting_entity TEXT;
    setting_identifier TEXT;
    setting_scope_identifier TEXT;
	setting_entity_identifier TEXT;
	setting_entity_type TEXT;
	entity_setting TEXT[];
    rate_limit BOOLEAN;
    limit_count INTEGER;
    limit_period TEXT;
	setting_value jsonb := '{}'::jsonb;
  	mandate_default_details jsonb := '{}'::jsonb;
	manual_payments_reference_field_values jsonb := '{}'::jsonb;
 	inserted_count integer;
	rows_affected integer;
    action_taken text;
	_current_value TEXT;
	_new_value TEXT;
	_service_type_id INT;
	_results TEXT[][];
	_result TEXT[];
	_parsed jsonb;
	_textObj TEXT;

BEGIN
	FOREACH entity_setting SLICE 1 IN ARRAY entity_settings
		LOOP
			SELECT entity_setting[1]::TEXT into setting_scope_identifier;
			SELECT entity_setting[2]::TEXT into setting_entity;
			SELECT entity_setting[3]::TEXT into setting_identifier;
			SELECT to_jsonb(entity_setting[4]) into setting_value;

			IF lower(setting_identifier) ='ocs.ed.ws.usr' THEN
				entity_settings := entity_settings || array[
					[setting_scope_identifier,	setting_entity,	'webservice.username',	trim(both '"' from setting_value::TEXT)]  -- VALIDATED
				];
			END IF;

			IF lower(setting_identifier) = 'ocs.ed.ws.pwd' THEN
				entity_settings := entity_settings || array[
					[setting_scope_identifier,	setting_entity,	'webservice.password',	trim(both '"' from setting_value::TEXT)]  -- VALIDATED
				];
			END IF;
		END LOOP;


		mandate_default_details := jsonb_build_object(
			'mandateType', ocs_default_mandate_type,
			'debitClassification', ocs_default_debit_classification,
			'maximumInstallmentAmount', ocs_default_max_installment_amount,
			'frequency', ocs_default_frequency,
			'tracking', ocs_default_tracking_enabled,
			'dateAdjustmentAllowed', ocs_default_date_adjustment_allowed,
			'adjustmentFrequency', ocs_default_adjustment_frequency,
			'adjustmentType', ocs_default_adjustment_type,
			'adjustmentValue', ocs_default_adjustment_value,
			'generateInstallment', ocs_default_generate_installment,
			'calculateInstallment', ocs_default_calculate_installment
		);


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
				WHERE s.service_type_id  in (
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
				WHERE s.service_type_id  in (
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

------------------------
	-- Entity Service Type Settings Setup
		RAISE NOTICE '	Settings:';
		FOREACH entity_setting SLICE 1 IN ARRAY entity_settings
		LOOP
			SELECT entity_setting[1]::TEXT into setting_scope_identifier;
			SELECT entity_setting[2]::TEXT into setting_entity;
			SELECT entity_setting[3]::TEXT into setting_identifier;
			SELECT to_jsonb(entity_setting[4]) into setting_value;
			
			CASE 
			    WHEN upper(setting_entity) = 'P' THEN
			        setting_entity_type := 'Parent';
					setting_entity_identifier := parent_identifier;
			    WHEN upper(setting_entity) = 'I' THEN
			        setting_entity_type := 'Integrator';
					setting_entity_identifier := integration_entity_identifier;
			    WHEN upper(setting_entity) = 'D' THEN
			        setting_entity_type := 'Device User';
					setting_entity_identifier := device_user_entity_identifier;
				ELSE
					setting_entity_type := 'UNKNOWN';
					setting_entity_identifier := 'ERROR';
			END CASE;
			
			-- This is a special field that gets populated by the "Mandate defaults" section
			IF lower(setting_identifier) = 'ocs.ed.mandate.default.details' THEN
				setting_value := mandate_default_details;
			END IF;
			
			-- This is a special field that gets populated by the "Payment Reference Fields" section
			IF lower(setting_identifier) = 'manual.payments.reference.config' THEN
				setting_value := manual_payments_reference_field_values;
			END IF;

			--RAISE NOTICE '		(%) Scope: %, Entity: % (%), Setting: %, Value: %', var_entity_service_type_id, upper(setting_scope_identifier), setting_entity_type, setting_entity_identifier, setting_identifier, setting_value;	
		
			-- We need to check if the setting we are trying to add is valid for the scope
			SELECT 	st.id into _service_type_id
			FROM 	service_type st
			WHERE 	upper(st.identifier) = upper(setting_scope_identifier);
		
			IF _service_type_id IS NULL THEN
				-- This scope is not in the DB
				RAISE EXCEPTION 'This scope %s is not in the database (public.service_type)', setting_scope_identifier;
			END IF;
		
			-- We need to check if the entity exists
			IF NOT EXISTS(SELECT id FROM public.entity WHERE identifier = setting_entity_identifier) THEN
				RAISE EXCEPTION 'This entity %s (%s) does not exist in the database (public.entity)', setting_entity_type, setting_entity_identifier;
			END IF;

			-- We need to check if the entity is allowed to use this scope
			IF NOT EXISTS(
				SELECT 	est.id
				FROM 	public.entity_service_type est
						INNER JOIN public.entity e on e.id = est.entity_id
				WHERE 	e.identifier = setting_entity_identifier
				AND 	est.service_type_id = _service_type_id
			) THEN
				-- This entity does not have this scope, so we add it
				INSERT INTO public.entity_service_type (entity_id, service_type_id, active)
					SELECT 	(SELECT e.ID FROM entity e WHERE identifier = setting_entity_identifier) as entityId
							,_service_type_id
							,true
					WHERE NOT EXISTS(
						SELECT e.id FROM entity e 			
							INNER JOIN entity_service_type est ON est.entity_id = e.id
						WHERE e.identifier = setting_entity_identifier
							AND est.service_type_id = _service_type_id
					);
			END IF;
		
			-- We need to check if the setting we are adding is a service setting or scope setting
			IF EXISTS(
				SELECT 	s.id
				FROM 	public.service s
						INNER JOIN public.service_setting ss on ss.service_id = s.id
				WHERE 	s.service_type_id = _service_type_id
				AND 	upper(ss.identifier) = upper(setting_identifier)
			) THEN
				-- This is a service setting
				RAISE NOTICE '		Adding Service Setting: %', setting_identifier;
			
				-- Check if the entity has the service
				INSERT INTO public.entity_service (entity_id, service_id, active, rate_limit)
					SELECT 	(SELECT e.ID FROM entity e WHERE identifier = setting_entity_identifier) as entityId
							,s.id 
							,true
							,false
					FROM 	public.service s
							INNER JOIN public.service_setting ss on ss.service_id = s.id
					WHERE 	s.service_type_id = _service_type_id
					AND 	upper(ss.identifier) = upper(setting_identifier)
					AND 	NOT EXISTS(
								SELECT 	es.id 
								FROM 	public.entity_service es
										INNER JOIN public.entity e on e.id = es.entity_id
								WHERE 	e.identifier = setting_entity_identifier
								AND 	es.service_id = s.id
							);
			
				-- Add the service setting
				WITH current_setting AS (
					SELECT 	ess.id, 
							ess.value ->> '' AS current_value
					FROM 	public.entity_service_setting ess
							INNER JOIN public.entity_service es ON es.id = ess.entity_service_id
							INNER JOIN public.entity e ON e.id = es.entity_id
							INNER JOIN public.service s ON s.id = es.service_id
							INNER JOIN public.service_setting ss ON ss.id = ess.service_setting_id
					WHERE 	e.identifier = setting_entity_identifier
					AND 	s.service_type_id = _service_type_id
					AND 	upper(ss.identifier) = upper(setting_identifier)
					LIMIT 1
				),
				service_details AS (
					SELECT 	es.id as entity_service_id, 
							ss.id as service_setting_id
					FROM 	public.entity_service es
							INNER JOIN public.entity e ON e.id = es.entity_id
							INNER JOIN public.service s ON s.id = es.service_id
							INNER JOIN public.service_setting ss ON ss.service_id = s.id
					WHERE 	e.identifier = setting_entity_identifier
					AND 	s.service_type_id = _service_type_id
					AND 	upper(ss.identifier) = upper(setting_identifier)
					LIMIT 1
				)
				INSERT INTO public.entity_service_setting (entity_service_id, service_setting_id, value, active)
					SELECT 	sd.entity_service_id, 
							sd.service_setting_id, 
							jsonb_build_object('', setting_value), 
							true
					FROM 	service_details sd
					WHERE 	NOT EXISTS (SELECT 1 FROM current_setting)
				ON CONFLICT (entity_service_id, service_setting_id) DO UPDATE
					SET value = jsonb_build_object('', setting_value),
						active = true,
						updated_at = NOW()
					WHERE (SELECT current_value FROM current_setting) IS DISTINCT FROM trim(both '"' from setting_value::TEXT);
			
			ELSEIF EXISTS(
				SELECT 	sts.id
				FROM 	public.service_type_setting sts
				WHERE 	sts.service_type_id = _service_type_id
				AND 	upper(sts.identifier) = upper(setting_identifier)
			) THEN
				-- This is a scope setting
				RAISE NOTICE '		Adding Scope Setting: %', setting_identifier;
			
				-- Add the scope setting
				WITH current_setting AS (
					SELECT 	ests.id, 
							ests.value ->> '' AS current_value
					FROM 	public.entity_service_type_setting ests
							INNER JOIN public.entity_service_type est ON est.id = ests.entity_service_type_id
							INNER JOIN public.entity e ON e.id = est.entity_id
							INNER JOIN public.service_type st ON st.id = est.service_type_id
							INNER JOIN public.service_type_setting sts ON sts.id = ests.service_type_setting_id
					WHERE 	e.identifier = setting_entity_identifier
					AND 	st.id = _service_type_id
					AND 	upper(sts.identifier) = upper(setting_identifier)
					LIMIT 1
				),
				service_type_details AS (
					SELECT 	est.id as entity_service_type_id, 
							sts.id as service_type_setting_id
					FROM 	public.entity_service_type est
							INNER JOIN public.entity e ON e.id = est.entity_id
							INNER JOIN public.service_type_setting sts ON sts.service_type_id = est.service_type_id
					WHERE 	e.identifier = setting_entity_identifier
					AND 	est.service_type_id = _service_type_id
					AND 	upper(sts.identifier) = upper(setting_identifier)
					LIMIT 1
				)
				INSERT INTO public.entity_service_type_setting (entity_service_type_id, service_type_setting_id, value, active)
					SELECT 	std.entity_service_type_id, 
							std.service_type_setting_id, 
							jsonb_build_object('', setting_value), 
							true
					FROM 	service_type_details std
					WHERE 	NOT EXISTS (SELECT 1 FROM current_setting)
				ON CONFLICT (entity_service_type_id, service_type_setting_id) DO UPDATE
					SET value = jsonb_build_object('', setting_value),
						active = true,
						updated_at = NOW()
					WHERE (SELECT current_value FROM current_setting) IS DISTINCT FROM trim(both '"' from setting_value::TEXT);

			ELSE
				-- This setting is not in the DB
				RAISE EXCEPTION 'This setting %s is not in the database for this scope %s', setting_identifier, setting_scope_identifier;
			END IF;
		
		END LOOP;
	-- End Entity Service Type Settings Setup
-------------------------

	RAISE NOTICE 'Parent Entity: %', parent_identifier;
	RAISE NOTICE 'Integration Entity: %', integration_entity_identifier;
	RAISE NOTICE 'Device User Entity: %', device_user_entity_identifier;
	RAISE NOTICE 'Password: %', entity_password;
	RAISE NOTICE 'Scopes: %', entity_scopes;
END;
$$;
`;

    return finalScript.trim();
}


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
                            <div class="d-flex justify-content-between w-100 me-2 align-items-center">
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
        // Check if this is a partially editable field
        if (setting.partialEdit) {
            const editableLength = setting.partialEdit.editableLength || 0;
            const fixedSuffix = setting.partialEdit.fixedSuffix || '';
            const editablePlaceholder = setting.partialEdit.placeholder || 'X'.repeat(editableLength);
            const maxLengthAttr = editableLength ? `maxlength="${editableLength}"` : '';

            html += `
                <div class="input-group input-group-sm">
                    <input type="text" class="form-control form-control-sm partial-edit-input"
                    id="${settingId}"
                    placeholder="${editablePlaceholder}"
                    value="${setting.defaultValue || ''}"
                    ${maxLengthAttr}
                    data-fixed-suffix="${fixedSuffix}"
                    data-editable-length="${editableLength}">
                    <span class="input-group-text">${fixedSuffix}</span>
                </div>
            `;
        } else {
            html += `<input type="text" class="form-control form-control-sm" id="${settingId}" placeholder="${setting.placeholder || ''}" value="${setting.defaultValue || ''}">`;
        }
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
    $tab.find(`#${scopeConfig.identifier}-rate-limit`).prop('checked', scopeConfig.rateLimit || false).trigger('change');
    if (scopeConfig.rateLimit) {
        $tab.find(`#${scopeConfig.identifier}-limit-count`).val(scopeConfig.limitCount || '');
        $tab.find(`#${scopeConfig.identifier}-limit-period`).val(scopeConfig.limitPeriod || '');
    }
    
    // Load settings
    if (scopeConfig.settings && scopeConfig.settings.length > 0) {
        scopeConfig.settings.forEach(setting => {
            const $input = $tab.find(`#${scopeConfig.identifier}-${safeRename(setting.identifier)}`);
            setInputValue($input, setting.value);
        });
    }
}

// Helper function for safe string replacement
function safeReplace(str, search, replacement) {
    if (typeof str !== 'string') return str;
    return str.replace(new RegExp(search, 'g'), replacement);
}

// Helper function to set value on an input, handling partial edit fields
function setInputValue($input, value) {
    if ($input.length === 0) return;

    if ($input.attr('type') === 'checkbox') {
        $input.prop('checked', value === 'true' || value === true);
    } else {
        // Handle partial edit fields - strip fixed suffix when loading
        if ($input.hasClass('partial-edit-input')) {
            const fixedSuffix = $input.data('fixed-suffix');
            if (fixedSuffix && value && value.endsWith(fixedSuffix)) {
                value = value.substring(0, value.length - fixedSuffix.length);
            }
        }
        $input.val(value);
    }
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


