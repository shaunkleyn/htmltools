import csv
import json
from collections import defaultdict

# Read the CSV file
csv_file = r'C:\Users\shaunk\OneDrive - Bitventure\Documents\work-files\html-files\htmltools\onboarding\scopes-services-settings.csv'

scopes_data = defaultdict(lambda: {
    'name': '',
    'description': '',
    'services': defaultdict(lambda: {
        'name': '',
        'display': '',
        'description': '',
        'endpoint': '',
        'entities': set(),
        'tables': set(),
        'settings': {},
        'json_settings': {}  # Track JSON-based settings
    }),
    'settings': {},
    'json_settings': {},  # Track JSON-based settings
    'entities': set(),
    'tables': set()
})

# Settings known to have JSON structures that should be split
JSON_SETTINGS = [
    'ocs.ed.mandate.default.details',
    'manual.payments.reference.config'
]

# Map JSON field names to their metadata
FIELD_METADATA = {
    'ocs.ed.mandate.default.details': {
        'scheme': {'label': 'Scheme', 'type': 'textbox'},
        'tracking': {'label': 'Tracking', 'type': 'checkbox'},
        'frequency': {'label': 'Frequency', 'type': 'dropdown', 'values': ['ADHOC', 'WEEKLY', 'FORTNIGHTLY', 'MONTHLY', 'QUARTERLY', 'BIANUALLY', 'ANNUALLY', 'ONCE_OFF']},
        'mandateType': {'label': 'Mandate Type', 'type': 'dropdown', 'values': [{'key': 1, 'value': 'Fixed'}, {'key': 2, 'value': 'Variable'}, {'key': 3, 'value': 'Usage'}]},
        'adjustmentType': {'label': 'Adjustment Type', 'type': 'radio', 'values': [{'key': 1, 'value': 'RATE'}, {'key': 2, 'value': 'AMOUNT'}]},
        'adjustmentValue': {'label': 'Adjustment Value', 'type': 'textbox'},
        'referenceFormat': {'label': 'Contract Reference Format', 'type': 'textbox', 'maxLength': 14, 'dependsOn': 'generateContractReference:true'},
        'adjustmentFrequency': {'label': 'Adjustment Frequency', 'type': 'dropdown', 'values': ['ANNUALLY', 'BIANNUALLY', 'QUARTERLY', 'REPO', 'NEVER', 'OTHER']},
        'debitClassification': {'label': 'Debit Classification', 'type': 'dropdown', 'sort': True},
        'generateInstallment': {'label': 'Generate Installment', 'type': 'checkbox'},
        'calculateInstallment': {'label': 'Calculate Installment', 'type': 'checkbox'},
        'dateAdjustmentAllowed': {'label': 'Date Adjustment Allowed', 'type': 'checkbox', 'translateValues': {'true': 'Y', 'false': 'N'}},
        'maximumInstallmentAmount': {'label': 'Maximum Installment Amount', 'type': 'number'},
        'generateContractReference': {'label': 'Generate Contract Reference', 'type': 'checkbox'}
    },
    'manual.payments.reference.config': {
        'app.manual.payments.reference.customer': {'label': 'Customer Reference', 'type': 'select', 'values': ['enabled', 'disabled', 'required']},
        'app.manual.payments.reference.internal': {'label': 'Internal Reference', 'type': 'select', 'values': ['enabled', 'disabled', 'required']}
    }
}

with open(csv_file, 'r', encoding='utf-8-sig') as f:
    reader = csv.DictReader(f)

    for row in reader:
        scope = row['scope'].strip()
        if not scope:
            continue

        scope_desc = row['scope_description'].strip()
        service_id = row['service_identifier'].strip()
        service_display = row['service_display_text'].strip()
        service_desc = row['service_description'].strip()
        service_endpoint = row['service_endpoint'].strip()
        setting_id = row['setting_identifier'].strip()
        settings_table = row['settings_table'].strip()
        service_table = row['service_table'].strip()
        entity_type = row['entity_type'].strip()
        latest_value = row['latest_value'].strip()

        # Set scope info
        if scope_desc and not scopes_data[scope]['name']:
            scopes_data[scope]['name'] = scope_desc
            scopes_data[scope]['description'] = scope_desc

        # Track entities for scope
        if entity_type:
            entity_lower = entity_type.lower().replace(' ', '')
            if entity_lower == 'webservice':
                entity_lower = 'webservice'
            elif entity_lower == 'device':
                entity_lower = 'deviceuser'
            elif entity_lower == 'person':
                continue
            scopes_data[scope]['entities'].add(entity_lower)

        # Track tables for scope
        if service_table:
            scopes_data[scope]['tables'].add(service_table)

        # Add service info
        if service_id:
            service_data = scopes_data[scope]['services'][service_id]
            if not service_data['name']:
                service_data['name'] = service_id
                service_data['display'] = service_display if service_display else service_id
                service_data['description'] = service_desc if service_desc else service_id
                service_data['endpoint'] = service_endpoint if service_endpoint else '/'

            # Track entities for service
            if entity_type:
                entity_lower = entity_type.lower().replace(' ', '')
                if entity_lower == 'webservice':
                    entity_lower = 'webservice'
                elif entity_lower == 'device':
                    entity_lower = 'deviceuser'
                elif entity_lower == 'person':
                    continue
                service_data['entities'].add(entity_lower)

            # Track tables for service
            if service_table:
                service_data['tables'].add(service_table)

            # Handle settings
            if setting_id:
                # Check if this is a JSON setting that needs to be split
                if setting_id in JSON_SETTINGS and latest_value:
                    try:
                        json_data = json.loads(latest_value)

                        # Store JSON setting info
                        if setting_id not in service_data['json_settings']:
                            service_data['json_settings'][setting_id] = {
                                'fields': {},
                                'entities': set(),
                                'table': settings_table
                            }

                        if entity_type:
                            entity_lower = entity_type.lower().replace(' ', '')
                            if entity_lower == 'device':
                                entity_lower = 'deviceuser'
                            elif entity_lower != 'person':
                                service_data['json_settings'][setting_id]['entities'].add(entity_lower)

                        # Extract each field from the JSON
                        for field_name, field_value in json_data.items():
                            if field_name not in service_data['json_settings'][setting_id]['fields']:
                                service_data['json_settings'][setting_id]['fields'][field_name] = {
                                    'defaultValue': field_value
                                }
                    except json.JSONDecodeError:
                        pass  # If not valid JSON, treat as regular setting

                # Regular setting handling
                if settings_table == 'entity_service_setting':
                    if setting_id not in service_data['settings']:
                        service_data['settings'][setting_id] = {
                            'name': setting_id,
                            'entities': set(),
                            'table': settings_table
                        }
                    if entity_type:
                        entity_lower = entity_type.lower().replace(' ', '')
                        if entity_lower == 'device':
                            entity_lower = 'deviceuser'
                        elif entity_lower != 'person':
                            service_data['settings'][setting_id]['entities'].add(entity_lower)

        # Add scope-level setting
        if setting_id and settings_table == 'entity_service_type_setting':
            # Check if this is a JSON setting
            if setting_id in JSON_SETTINGS and latest_value:
                try:
                    json_data = json.loads(latest_value)

                    if setting_id not in scopes_data[scope]['json_settings']:
                        scopes_data[scope]['json_settings'][setting_id] = {
                            'fields': {},
                            'entities': set(),
                            'table': settings_table
                        }

                    if entity_type:
                        entity_lower = entity_type.lower().replace(' ', '')
                        if entity_lower == 'device':
                            entity_lower = 'deviceuser'
                        elif entity_lower != 'person':
                            scopes_data[scope]['json_settings'][setting_id]['entities'].add(entity_lower)

                    for field_name, field_value in json_data.items():
                        if field_name not in scopes_data[scope]['json_settings'][setting_id]['fields']:
                            scopes_data[scope]['json_settings'][setting_id]['fields'][field_name] = {
                                'defaultValue': field_value
                            }
                except json.JSONDecodeError:
                    pass

            # Regular setting
            if setting_id not in scopes_data[scope]['settings']:
                scopes_data[scope]['settings'][setting_id] = {
                    'name': setting_id,
                    'entities': set(),
                    'table': settings_table
                }
            if entity_type:
                entity_lower = entity_type.lower().replace(' ', '')
                if entity_lower == 'device':
                    entity_lower = 'deviceuser'
                elif entity_lower != 'person':
                    scopes_data[scope]['settings'][setting_id]['entities'].add(entity_lower)

# Convert to JSON structure
output = {}
for scope, data in sorted(scopes_data.items()):
    output[scope] = {
        'name': data['name'],
        'entities': sorted(list(data['entities'])),
        'tables': sorted(list(data['tables'])),
        'services': [],
        'settings': [],
        'json_settings': {}
    }

    # Add services
    for service_id, service_data in sorted(data['services'].items()):
        service_obj = {
            'name': service_data['name'],
            'display': service_data['display'],
            'description': service_data['description'],
            'allowOn': sorted(list(service_data['entities'])),
            'tables': sorted(list(service_data['tables'])),
            'settings': [],
            'json_settings': {}
        }

        # Add regular service settings
        for setting_id, setting_data in sorted(service_data['settings'].items()):
            service_obj['settings'].append({
                'name': setting_data['name'],
                'allowOn': sorted(list(setting_data['entities'])),
                'table': setting_data['table']
            })

        # Add JSON settings with fields
        for setting_id, json_setting in service_data['json_settings'].items():
            service_obj['json_settings'][setting_id] = {
                'allowOn': sorted(list(json_setting['entities'])),
                'table': json_setting['table'],
                'fields': []
            }

            # Add each field with metadata if available
            for field_name, field_data in sorted(json_setting['fields'].items()):
                field_obj = {
                    'field': field_name,
                    'defaultValue': field_data['defaultValue']
                }

                # Add metadata if available
                if setting_id in FIELD_METADATA and field_name in FIELD_METADATA[setting_id]:
                    field_obj.update(FIELD_METADATA[setting_id][field_name])

                service_obj['json_settings'][setting_id]['fields'].append(field_obj)

        output[scope]['services'].append(service_obj)

    # Add scope settings
    for setting_id, setting_data in sorted(data['settings'].items()):
        if setting_id not in JSON_SETTINGS:  # Regular settings only
            output[scope]['settings'].append({
                'name': setting_data['name'],
                'allowOn': sorted(list(setting_data['entities'])),
                'table': setting_data['table']
            })

    # Add JSON settings to scope
    for setting_id, json_setting in data['json_settings'].items():
        output[scope]['json_settings'][setting_id] = {
            'allowOn': sorted(list(json_setting['entities'])),
            'table': json_setting['table'],
            'fields': []
        }

        for field_name, field_data in sorted(json_setting['fields'].items()):
            field_obj = {
                'field': field_name,
                'defaultValue': field_data['defaultValue']
            }

            if setting_id in FIELD_METADATA and field_name in FIELD_METADATA[setting_id]:
                field_obj.update(FIELD_METADATA[setting_id][field_name])

            output[scope]['json_settings'][setting_id]['fields'].append(field_obj)

# Write to JSON file
with open('parsed_scopes_enhanced.json', 'w', encoding='utf-8') as f:
    json.dump(output, f, indent=2)

print("Enhanced parsed data written to parsed_scopes_enhanced.json")
print(f"Total scopes: {len(output)}")

# Show JSON settings found
json_settings_count = 0
for scope_name, scope_data in output.items():
    for service in scope_data['services']:
        if service['json_settings']:
            for setting_name, setting_data in service['json_settings'].items():
                print(f"  {scope_name}.{service['name']}.{setting_name}: {len(setting_data['fields'])} fields")
                json_settings_count += 1
    if scope_data['json_settings']:
        for setting_name, setting_data in scope_data['json_settings'].items():
            print(f"  {scope_name}.{setting_name}: {len(setting_data['fields'])} fields")
            json_settings_count += 1

print(f"\nTotal JSON settings with fields: {json_settings_count}")
