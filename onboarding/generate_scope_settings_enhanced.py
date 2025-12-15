import json

# Read the enhanced parsed JSON
with open('parsed_scopes_enhanced.json', 'r', encoding='utf-8') as f:
    scopes_data = json.load(f)

def format_value(value):
    """Format a value for JavaScript output"""
    if isinstance(value, bool):
        return 'true' if value else 'false'
    elif isinstance(value, str):
        # Escape quotes
        return f'"{value.replace(chr(34), chr(92) + chr(34))}"'
    elif isinstance(value, (int, float)):
        return str(value)
    elif isinstance(value, list):
        if all(isinstance(item, str) for item in value):
            return '[' + ', '.join([f'"{item}"' for item in value]) + ']'
        elif all(isinstance(item, dict) for item in value):
            items = []
            for item in value:
                pairs = [f'"{k}": "{v}"' if isinstance(v, str) else f'"{k}": {v}' for k, v in item.items()]
                items.append('{' + ', '.join(pairs) + '}')
            return '[' + ', '.join(items) + ']'
    return f'"{value}"'

def get_input_type(field_type):
    """Map field type to InputType constant"""
    type_map = {
        'textbox': 'InputType.TEXT',
        'text': 'InputType.TEXT',
        'checkbox': 'InputType.CHECKBOX',
        'dropdown': 'InputType.SELECT',
        'select': 'InputType.SELECT',
        'radio': 'InputType.TEXT',  # Radio buttons often rendered as text in forms
        'number': 'InputType.NUMBER',
        'password': 'InputType.PASSWORD',
        'textarea': 'InputType.TEXTAREA'
    }
    return type_map.get(field_type, 'InputType.TEXT')

# Start building the JavaScript file
js_content = '''// Setting descriptions for tooltips and help text
const settingDescriptions = {
    'ocs.ed.ws.gc': 'Easy Debit Group Code for web service authentication',
    'ocs.ed.ws.usr': 'Username for Easy Debit web service',
    'ocs.ed.ws.pwd': 'Password for Easy Debit web service',
    'ocs.df.scheme': 'Default scheme name for Easy Debit',
    'ocs.ed.sc.gc.map': 'Mapping between scheme names and group codes',
    'ocs.ed.ul.gc.map': 'Mapping for ultimate creditor to group code',
    'ocs.ed.do.sc.gc.map': 'Mapping for debit order scheme to group code',
    'ocs.ed.do.gc': 'Group code for debit order operations',
    'ocs.ed.passthrough': 'Whether to pass through transactions directly',
    'ocs.webhook.url.mandate': 'Webhook URL for mandate notifications',
    'ocs.webhook.url.collection': 'Webhook URL for collection notifications',
    'ocs.easy.loan.webhook.url': 'Webhook URL for Easy Loan integration',
    'ocs.ed.mandate.default.details': 'Default mandate configuration (JSON)',
    'manual.payments.reference.config': 'Configuration for manual payment references'
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
 * Generated from CSV data with enhanced JSON field splitting
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
                tables_list = ', '.join([f'ServiceTable.{"ENTITY_SERVICE" if t == "entity_service" else "ENTITY_SERVICE_TYPE"}' for t in sorted(set(service['tables']))])
                js_content += f'                "tables": [{tables_list}],\n'

        # Add entityTables if both entity_service and entity_service_type are present
        if 'entity_service' in service['tables'] and 'entity_service_type' in service['tables']:
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

        # Add service settings (regular + JSON fields)
        js_content += '                "settings": [\n'

        # Regular settings
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

        # JSON settings - split into individual fields
        for setting_name, json_setting in service.get('json_settings', {}).items():
            group_name = "Default Mandate Details" if "mandate.default" in setting_name else "Manual Payment References"

            for field in json_setting['fields']:
                js_content += '                    {\n'
                if group_name:
                    js_content += f'                        "group": "{group_name}",\n'
                js_content += f'                        "name": "{setting_name}",\n'
                js_content += f'                        "field": "{field["field"]}",\n'

                if 'label' in field:
                    js_content += f'                        "label": "{field["label"]}",\n'

                if 'placeholder' in field:
                    js_content += f'                        "placeholder": "{field["placeholder"]}",\n'
                elif 'label' in field:
                    js_content += f'                        "placeholder": "Enter {field["label"]}",\n'

                if 'description' in field:
                    js_content += f'                        "description": "{field["description"]}",\n'

                field_type = field.get('type', 'textbox')
                js_content += f'                        "type": {get_input_type(field_type)},\n'

                if 'defaultValue' in field:
                    js_content += f'                        "defaultValue": {format_value(field["defaultValue"])},\n'

                if 'values' in field:
                    js_content += f'                        "values": {format_value(field["values"])},\n'

                if 'maxLength' in field:
                    js_content += f'                        "maxLength": {field["maxLength"]},\n'

                if 'dependsOn' in field:
                    js_content += f'                        "dependsOn": "{field["dependsOn"]}",\n'

                if 'sort' in field:
                    js_content += f'                        "sort": true,\n'

                if 'translateValues' in field:
                    pairs = [f'"{k}": "{v}"' for k, v in field['translateValues'].items()]
                    js_content += f'                        "translateValues": {{{", ".join(pairs)}}},\n'

                if json_setting['allowOn']:
                    setting_entities = ', '.join([f'EntityType.{e.upper()}' for e in json_setting['allowOn']])
                    js_content += f'                        "allowOn": [{setting_entities}],\n'

                table_name = 'SettingsTable.ENTITY_SERVICE_SETTING' if json_setting['table'] == 'entity_service_setting' else 'SettingsTable.ENTITY_SERVICE_TYPE_SETTING'
                js_content += f'                        "table": {table_name},\n'

                # Add services array
                js_content += f'                        "services": ["{service["name"]}"]\n'
                js_content += '                    },\n'

        js_content = js_content.rstrip(',\n') + '\n'
        js_content += '                ]\n'
        js_content += '            },\n'

    js_content = js_content.rstrip(',\n') + '\n'
    js_content += '        ],\n'

    # Add scope-level settings
    js_content += '        "settings": [\n'

    # Regular settings
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

    # JSON settings at scope level
    for setting_name, json_setting in scope_data.get('json_settings', {}).items():
        group_name = "Default Mandate Details" if "mandate.default" in setting_name else "Manual Payment References"

        for field in json_setting['fields']:
            js_content += '            {\n'
            if group_name:
                js_content += f'                "group": "{group_name}",\n'
            js_content += f'                "name": "{setting_name}",\n'
            js_content += f'                "field": "{field["field"]}",\n'

            if 'label' in field:
                js_content += f'                "label": "{field["label"]}",\n'

            if 'placeholder' in field:
                js_content += f'                "placeholder": "{field["placeholder"]}",\n'
            elif 'label' in field:
                js_content += f'                "placeholder": "Enter {field["label"]}",\n'

            if 'description' in field:
                js_content += f'                "description": "{field["description"]}",\n'

            field_type = field.get('type', 'textbox')
            js_content += f'                "type": {get_input_type(field_type)},\n'

            if 'defaultValue' in field:
                js_content += f'                "defaultValue": {format_value(field["defaultValue"])},\n'

            if 'values' in field:
                js_content += f'                "values": {format_value(field["values"])},\n'

            if 'maxLength' in field:
                js_content += f'                "maxLength": {field["maxLength"]},\n'

            if 'dependsOn' in field:
                js_content += f'                "dependsOn": "{field["dependsOn"]}",\n'

            if 'sort' in field:
                js_content += f'                "sort": true,\n'

            if 'translateValues' in field:
                pairs = [f'"{k}": "{v}"' for k, v in field['translateValues'].items()]
                js_content += f'                "translateValues": {{{", ".join(pairs)}}},\n'

            if json_setting['allowOn']:
                setting_entities = ', '.join([f'EntityType.{e.upper()}' for e in json_setting['allowOn']])
                js_content += f'                "allowOn": [{setting_entities}],\n'

            table_name = 'SettingsTable.ENTITY_SERVICE_SETTING' if json_setting['table'] == 'entity_service_setting' else 'SettingsTable.ENTITY_SERVICE_TYPE_SETTING'
            js_content += f'                "table": {table_name},\n'

            js_content += f'                "services": []\n'
            js_content += '            },\n'

    js_content = js_content.rstrip(',\n') + '\n'
    js_content += '        ]\n'
    js_content += '    },\n'

# Close the scopes object
js_content = js_content.rstrip(',\n') + '\n'
js_content += '};\n'

# Write to file
with open('scope_settings_ENHANCED.js', 'w', encoding='utf-8') as f:
    f.write(js_content)

print("Enhanced scope_settings.js has been generated as 'scope_settings_ENHANCED.js'")
print(f"Total scopes: {len(scopes_data)}")
print("\nJSON settings with individual fields have been expanded:")
print("  - ocs.ed.mandate.default.details: 14 fields per instance")
print("  - manual.payments.reference.config: 2 fields per instance")
