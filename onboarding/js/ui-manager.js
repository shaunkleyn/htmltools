import { ConfigurationManager } from './configuration-manager.js';
import { EntityType } from './enums.js';

export class UIManager {
    constructor(configManager) {
        this.configManager = configManager;
    }

    initializeUI() {
        this.setupEventHandlers();
        this.renderScopeSelection();
        this.updateUIFromConfiguration();
    }

    setupEventHandlers() {
        // Setup all your jQuery event handlers here
        $('#generateScript').click(() => this.generateScript());
        $('#importConfig').click(() => this.importConfiguration());
        $('#exportConfig').click(() => this.exportConfiguration());
        
        // Scope checkbox handlers
        $('.scope-checkbox-input').change((e) => {
            this.handleScopeSelection(e.target.value, e.target.checked);
        });
    }

    handleScopeSelection(scopeId, isSelected) {
        const scope = this.configManager.getScope(scopeId);
        if (scope) {
            scope.setActive(isSelected);
            this.renderScopeTab(scope, isSelected);
        }
    }

    renderScopeSelection() {
        const container = $('#scopeCheckboxes');
        container.empty();

        this.configManager.scopes.forEach((scope, scopeId) => {
            const checkboxHtml = `
                <div class="col-md-4 scope-checkbox">
                    <div class="form-check">
                        <input class="form-check-input scope-checkbox-input" 
                               type="checkbox" 
                               value="${scopeId}" 
                               id="scope-${scopeId}"
                               ${scope.isActive() ? 'checked' : ''}>
                        <label class="form-check-label" for="scope-${scopeId}">
                            ${scopeId} - ${scope.name}
                        </label>
                    </div>
                </div>
            `;
            container.append(checkboxHtml);
        });
    }

    renderScopeTab(scope, isVisible) {
        // Implementation for rendering scope tabs
        if (isVisible) {
            this.createScopeTab(scope);
        } else {
            this.removeScopeTab(scope.identifier);
        }
    }

    createScopeTab(scope) {
        // Create and render the scope tab UI
        const tabHtml = `
            <li class="nav-item">
                <a class="nav-link scope-tab-link" id="${scope.identifier}-tab" 
                   data-bs-toggle="tab" href="#${scope.identifier}" 
                   role="tab" aria-controls="${scope.identifier}">
                    ${scope.identifier}
                    <span class="close-tab"><i class="bi bi-x"></i></span>
                </a>
            </li>
        `;
        
        $('#scopeTabs').append(tabHtml);
        this.renderScopeTabContent(scope);
    }

    renderScopeTabContent(scope) {
        // Render the content for a scope tab
        const contentHtml = this.buildScopeTabHTML(scope);
        $('#scopeTabContent').append(contentHtml);
    }

    buildScopeTabHTML(scope) {
        // Build the HTML for scope tab content
        let html = `<div class="tab-pane fade scope-tab" id="${scope.identifier}" role="tabpanel">`;
        
        // Add entity linking section
        html += this.buildEntityLinkingSection(scope);
        
        // Add rate limiting section
        html += this.buildRateLimitSection(scope);
        
        // Add services section
        html += this.buildServicesSection(scope);
        
        html += `</div>`;
        return html;
    }

    buildEntityLinkingSection(scope) {
        // Build entity linking checkboxes
        return `
            <div class="settings-section">
                <h5>Entity Linking</h5>
                <div class="row">
                    <div class="col-md-6">
                        <div class="form-check mb-3">
                            <input class="form-check-input" type="checkbox" 
                                   id="${scope.identifier}-link-parent" 
                                   ${scope.isAllowedOn(EntityType.PARENT) ? 'checked' : ''}>
                            <label class="form-check-label">Link to Parent Entity</label>
                        </div>
                    </div>
                    <div class="col-md-6">
                        <div class="form-check mb-3">
                            <input class="form-check-input" type="checkbox" 
                                   id="${scope.identifier}-link-integrator"
                                   ${scope.isAllowedOn(EntityType.INTEGRATOR) ? 'checked' : ''}>
                            <label class="form-check-label">Link to Integrator</label>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    updateUIFromConfiguration() {
        // Update UI based on current configuration
        const entityConfig = this.configManager.entityConfig;
        
        $('#parentName').val(entityConfig.parentName || '');
        $('#website').val(entityConfig.website || '');
        $('#integratorEmail').val(entityConfig.integratorEmail || '');
        
        // Update other fields...
    }

    generateScript() {
        // Generate SQL script using the configuration manager
        const script = this.buildSQLScript();
        $('#scriptOutput').text(script);
    }

    buildSQLScript() {
        // Build SQL script from current configuration
        let script = `-- Generated SQL Script\n\n`;
        
        this.configManager.scopes.forEach((scope, scopeId) => {
            if (scope.isActive()) {
                script += this.buildScopeSQL(scope);
            }
        });
        
        return script;
    }

    buildScopeSQL(scope) {
        // Build SQL for a specific scope
        // Implementation details...
        return `-- ${scope.identifier} SQL\n`;
    }

    importConfiguration() {
        const fileInput = $('#importFile')[0];
        if (fileInput.files.length === 0) return;
        
        const file = fileInput.files[0];
        const reader = new FileReader();
        
        reader.onload = (e) => {
            try {
                const config = JSON.parse(e.target.result);
                this.configManager = ConfigurationManager.fromJSON(config);
                this.updateUIFromConfiguration();
                alert('Configuration imported successfully!');
            } catch (error) {
                alert('Error importing configuration: ' + error.message);
            }
        };
        
        reader.readAsText(file);
    }

    exportConfiguration() {
        const config = this.configManager.toJSON();
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(config, null, 2));
        const downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute("href", dataStr);
        downloadAnchorNode.setAttribute("download", "entity_configuration.json");
        document.body.appendChild(downloadAnchorNode);
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
    }
}