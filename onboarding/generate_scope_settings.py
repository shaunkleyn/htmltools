import json

# Read the parsed JSON
with open('parsed_scopes.json', 'r', encoding='utf-8') as f:
    scopes_data = json.load(f)

# Start building the JavaScript file
js_content = '''// Setting descriptions for tooltips and help text
const settingDescriptions = {
    // Add setting descriptions here as needed
};

const ServiceTable = Object.freeze({
    ENTITY_SERVICE: 'entity_service',
    ENTITY_SERVICE_TYPE: 'entity_service_type',
});

const SettingsTable = Object.freeze({
    ENTITY_SERVICE_SETTING: 'entity_service_setting',
    ENTITY_SERVICE_TYPE_SETTING: 'entity_service_type_setting',
});

const EntityType = Object.freeze({
    PARENT: 'parent',
    INTEGRATOR: 'integrator',
    DEVICEUSER: 'deviceuser',
    WEBSERVICE: 'webservice'
});

const InputType = Object.freeze({
    TEXT: 'text',
    PASSWORD: 'password',
    CHECKBOX: 'checkbox',
    NUMBER: 'number',
    TEXTAREA: 'textarea',
    SELECT: 'select'
});

/**
 * Scope definitions with services and settings
 * Generated from CSV data
 */
const scopes = {
'''

# Convert each scope to JavaScript format
for scope_id, scope_data in scopes_data.items():
    js_content += f'    "{scope_id}": {{\n'
    js_content += f'        "name": "{scope_data["name"]}",\n'

    # Add allowOn entities
    if scope_data['entities']:
        entities_list = ', '.join([f'EntityType.{e.upper()}' for e in scope_data['entities']])
        js_content += f'        "allowOn": [{entities_list}],\n'

    # Add services
    js_content += '        "services": [\n'
    for service in scope_data['services']:
        js_content += '            {\n'
        js_content += f'                "name": "{service["name"]}",\n'
        if service['display'] != service['name']:
            js_content += f'                "display": "{service["display"]}",\n'
        js_content += f'                "description": "{service["description"]}",\n'

        # Add allowOn for service
        if service['allowOn']:
            service_entities = ', '.join([f'EntityType.{e.upper()}' for e in service['allowOn']])
            js_content += f'                "allowOn": [{service_entities}],\n'

        # Add tables for service
        if service['tables']:
            if len(service['tables']) == 1:
                table_name = 'ServiceTable.ENTITY_SERVICE' if service['tables'][0] == 'entity_service' else 'ServiceTable.ENTITY_SERVICE_TYPE'
                js_content += f'                "tables": [{table_name}],\n'
            else:
                tables_list = ', '.join([f'ServiceTable.{"ENTITY_SERVICE" if t == "entity_service" else "ENTITY_SERVICE_TYPE"}' for t in service['tables']])
                js_content += f'                "tables": [{tables_list}],\n'

        # Add entityTables if both entity_service and entity_service_type are present
        if 'entity_service' in service['tables'] and 'entity_service_type' in service['tables']:
            # Determine which entities go to which table
            # Default: parent -> entity_service, others -> entity_service_type
            js_content += '                "entityTables": [\n'
            if 'parent' in service['allowOn']:
                js_content += '                    {\n'
                js_content += '                        "entities": [EntityType.PARENT],\n'
                js_content += '                        "tables": [ServiceTable.ENTITY_SERVICE]\n'
                js_content += '                    },\n'

            other_entities = [e for e in service['allowOn'] if e != 'parent']
            if other_entities:
                entities_str = ', '.join([f'EntityType.{e.upper()}' for e in other_entities])
                js_content += '                    {\n'
                js_content += f'                        "entities": [{entities_str}],\n'
                js_content += '                        "tables": [ServiceTable.ENTITY_SERVICE_TYPE]\n'
                js_content += '                    }\n'
            js_content += '                ],\n'

        # Add service settings
        js_content += '                "settings": [\n'
        for setting in service['settings']:
            js_content += '                    {\n'
            js_content += f'                        "name": "{setting["name"]}",\n'
            if setting['allowOn']:
                setting_entities = ', '.join([f'EntityType.{e.upper()}' for e in setting['allowOn']])
                js_content += f'                        "allowOn": [{setting_entities}],\n'
            table_name = 'SettingsTable.ENTITY_SERVICE_SETTING' if setting['table'] == 'entity_service_setting' else 'SettingsTable.ENTITY_SERVICE_TYPE_SETTING'
            js_content += f'                        "table": {table_name},\n'
            js_content += f'                        "type": InputType.TEXT\n'
            js_content += '                    },\n'
        js_content = js_content.rstrip(',\n') + '\n'
        js_content += '                ]\n'

        js_content += '            },\n'
    js_content = js_content.rstrip(',\n') + '\n'
    js_content += '        ],\n'

    # Add scope-level settings
    js_content += '        "settings": [\n'
    for setting in scope_data['settings']:
        js_content += '            {\n'
        js_content += f'                "name": "{setting["name"]}",\n'
        if setting['allowOn']:
            setting_entities = ', '.join([f'EntityType.{e.upper()}' for e in setting['allowOn']])
            js_content += f'                "allowOn": [{setting_entities}],\n'
        table_name = 'SettingsTable.ENTITY_SERVICE_SETTING' if setting['table'] == 'entity_service_setting' else 'SettingsTable.ENTITY_SERVICE_TYPE_SETTING'
        js_content += f'                "table": {table_name},\n'
        js_content += f'                "type": InputType.CHECKBOX\n'
        js_content += '            },\n'
    js_content = js_content.rstrip(',\n') + '\n'
    js_content += '        ]\n'

    js_content += '    },\n'

# Close the scopes object
js_content = js_content.rstrip(',\n') + '\n'
js_content += '};\n'

# Write to file
with open('scope_settings_NEW.js', 'w', encoding='utf-8') as f:
    f.write(js_content)

print("New scope_settings.js has been generated as 'scope_settings_NEW.js'")
print(f"Total scopes: {len(scopes_data)}")
