// main.js - Entry point for the application
import { ConfigurationManager } from './js/configuration-manager.js';
import { UIManager } from './js/ui-manager.js';
import { createScopeDefinitions } from './js/scope-definitions.js';

// Initialize the application when DOM is ready
$(document).ready(function() {
    // Initialize configuration manager with all scope definitions
    const configManager = new ConfigurationManager();
    const scopeDefinitions = createScopeDefinitions();
    
    // Add all scopes to configuration manager
    scopeDefinitions.forEach((scope, scopeId) => {
        configManager.addScope(scope);
    });

    // Initialize UI manager
    const uiManager = new UIManager(configManager);
    uiManager.initializeUI();

    // Make managers available globally for debugging
    window.configManager = configManager;
    window.uiManager = uiManager;

    console.log('Entity Configurator initialized successfully!');
});