  // Form validation
        (function() {
            'use strict';
            
            // Fetch the form we want to apply validation to
            const form = document.getElementById('basicEntityForm');
            
            // Add event listener for form submission
            form.addEventListener('submit', function(event) {
                if (!form.checkValidity()) {
                    event.preventDefault();
                    event.stopPropagation();
                } else {
                    // If form is valid, generate the SQL script
                    event.preventDefault();
                    generateSQLScript();
                }
                
                form.classList.add('was-validated');
            }, false);
            
            // Toggle conditional fields
            document.getElementById('createDeviceUser').addEventListener('change', function() {
                const deviceUserFields = document.getElementById('deviceUserFields');
                if (this.checked) {
                    deviceUserFields.style.display = 'block';
                    // Make fields required when shown
                    document.getElementById('deviceUsername').required = true;
                    document.getElementById('devicePassword').required = true;
                    document.getElementById('deviceEmail').required = true;
                } else {
                    deviceUserFields.style.display = 'none';
                    // Remove required attribute when hidden
                    document.getElementById('deviceUsername').required = false;
                    document.getElementById('devicePassword').required = false;
                    document.getElementById('deviceEmail').required = false;
                }
            });
            
            document.getElementById('createIntegrator').addEventListener('change', function() {
                const integratorFields = document.getElementById('integratorFields');
                if (this.checked) {
                    integratorFields.style.display = 'block';
                    // Auto-generate integrator name
                    const parentName = document.getElementById('parentName').value;
                    if (parentName) {
                        document.getElementById('integratorName').value = parentName + '_Integrator';
                    }
                } else {
                    integratorFields.style.display = 'none';
                }
            });
            
            // Update integrator name when parent name changes
            document.getElementById('parentName').addEventListener('input', function() {
                if (document.getElementById('createIntegrator').checked) {
                    document.getElementById('integratorName').value = this.value + '_Integrator';
                }
            });
            
            // Template buttons functionality
            document.querySelectorAll('.template-btn').forEach(button => {
                button.addEventListener('click', function() {
                    const template = this.getAttribute('data-template');
                    applyTemplate(template);
                });
            });
            
            // Function to apply template
            function applyTemplate(template) {
                // Reset form
                form.reset();
                form.classList.remove('was-validated');
                
                // Apply template-specific settings
                switch(template) {
                    case 'yongsong':
                        document.getElementById('parentName').value = 'Yongsong Trading';
                        document.getElementById('website').value = 'https://yongsongtrading.com';
                        document.getElementById('createDeviceUser').checked = true;
                        document.getElementById('deviceUserFields').style.display = 'block';
                        document.getElementById('deviceUsername').value = 'yongsong_device';
                        document.getElementById('devicePassword').value = 'securepassword123';
                        document.getElementById('deviceEmail').value = 'dev@yongsongtrading.com';
                        document.getElementById('createIntegrator').checked = true;
                        document.getElementById('integratorFields').style.display = 'block';
                        document.getElementById('integratorName').value = 'Yongsong Trading_Integrator';
                        // Select some scopes
                        document.getElementById('scope-BSS').checked = true;
                        document.getElementById('scope-FVS').checked = true;
                        document.getElementById('scope-AML').checked = true;
                        break;
                        
                    case 'uneedmore':
                        document.getElementById('parentName').value = 'U Need More Trading';
                        document.getElementById('website').value = 'https://uneedmoretrading.com';
                        document.getElementById('createDeviceUser').checked = true;
                        document.getElementById('deviceUserFields').style.display = 'block';
                        document.getElementById('deviceUsername').value = 'uneedmore_device';
                        document.getElementById('devicePassword').value = 'securepassword456';
                        document.getElementById('deviceEmail').value = 'dev@uneedmoretrading.com';
                        document.getElementById('createIntegrator').checked = true;
                        document.getElementById('integratorFields').style.display = 'block';
                        document.getElementById('integratorName').value = 'U Need More Trading_Integrator';
                        // Select some scopes
                        document.getElementById('scope-BPS').checked = true;
                        document.getElementById('scope-OCS').checked = true;
                        document.getElementById('scope-CDS').checked = true;
                        break;
                        
                    case 'blank':
                        // Just reset to blank form
                        break;
                }
            }
            
            // Function to generate SQL script
            function generateSQLScript() {
                // Collect form data
                const parentName = document.getElementById('parentName').value;
                const website = document.getElementById('website').value;
                const createDeviceUser = document.getElementById('createDeviceUser').checked;
                const deviceUsername = document.getElementById('deviceUsername').value;
                const devicePassword = document.getElementById('devicePassword').value;
                const deviceEmail = document.getElementById('deviceEmail').value;
                const createIntegrator = document.getElementById('createIntegrator').checked;
                const integratorName = document.getElementById('integratorName').value;
                
                // Get selected scopes
                const selectedScopes = [];
                document.querySelectorAll('.scope-checkbox-input:checked').forEach(checkbox => {
                    selectedScopes.push(checkbox.value);
                });
                
                // Generate SQL script
                let sqlScript = `-- SQL Integrator Entity Configuration Script\n`;
                sqlScript += `-- Generated for: ${parentName}\n`;
                sqlScript += `-- Website: ${website}\n\n`;
                
                sqlScript += `-- Create parent entity\n`;
                sqlScript += `INSERT INTO entities (name, website, status) VALUES ('${parentName}', '${website}', 'active');\n\n`;
                
                if (createDeviceUser) {
                    sqlScript += `-- Create device user\n`;
                    sqlScript += `INSERT INTO users (username, password, email, entity_id) VALUES ('${deviceUsername}', '${devicePassword}', '${deviceEmail}', (SELECT id FROM entities WHERE name = '${parentName}'));\n\n`;
                }
                
                if (createIntegrator) {
                    sqlScript += `-- Create integrator\n`;
                    sqlScript += `INSERT INTO integrators (name, entity_id) VALUES ('${integratorName}', (SELECT id FROM entities WHERE name = '${parentName}'));\n\n`;
                }
                
                if (selectedScopes.length > 0) {
                    sqlScript += `-- Assign scopes\n`;
                    selectedScopes.forEach(scope => {
                        sqlScript += `INSERT INTO entity_scopes (entity_id, scope) VALUES ((SELECT id FROM entities WHERE name = '${parentName}'), '${scope}');\n`;
                    });
                }
                
                // Display the generated script
                document.getElementById('scriptOutput').textContent = sqlScript;
                
                // Scroll to the script output
                document.getElementById('scriptOutput').scrollIntoView({ behavior: 'smooth' });
            }
            
            // Copy to clipboard functionality
            document.getElementById('copyScript').addEventListener('click', function() {
                const scriptOutput = document.getElementById('scriptOutput');
                const textArea = document.createElement('textarea');
                textArea.value = scriptOutput.textContent;
                document.body.appendChild(textArea);
                textArea.select();
                document.execCommand('copy');
                document.body.removeChild(textArea);
                
                // Show feedback
                const originalText = this.textContent;
                this.textContent = 'Copied!';
                setTimeout(() => {
                    this.textContent = originalText;
                }, 2000);
            });
        })();