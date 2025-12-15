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
        'settings': {}
    }),
    'settings': {},
    'entities': set(),
    'tables': set()
})

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

        # Set scope info
        if scope_desc and not scopes_data[scope]['name']:
            scopes_data[scope]['name'] = scope_desc
            scopes_data[scope]['description'] = scope_desc

        # Track entities for scope
        if entity_type:
            entity_lower = entity_type.lower().replace(' ', '')
            # Map entity types
            if entity_lower == 'webservice':
                entity_lower = 'webservice'
            elif entity_lower == 'device':
                entity_lower = 'deviceuser'
            elif entity_lower == 'person':
                # Person can be ignored or mapped to deviceuser - check CSV context
                continue  # Skip person for now
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
                # Map entity types
                if entity_lower == 'webservice':
                    entity_lower = 'webservice'
                elif entity_lower == 'device':
                    entity_lower = 'deviceuser'
                elif entity_lower == 'person':
                    continue  # Skip person
                service_data['entities'].add(entity_lower)

            # Track tables for service
            if service_table:
                service_data['tables'].add(service_table)

            # Add setting to service if it exists
            if setting_id and settings_table == 'entity_service_setting':
                if setting_id not in service_data['settings']:
                    service_data['settings'][setting_id] = {
                        'name': setting_id,
                        'entities': set(),
                        'table': settings_table
                    }
                if entity_type:
                    entity_lower = entity_type.lower().replace(' ', '')
                    # Map entity types
                    if entity_lower == 'webservice':
                        entity_lower = 'webservice'
                    elif entity_lower == 'device':
                        entity_lower = 'deviceuser'
                    elif entity_lower == 'person':
                        continue  # Skip person
                    service_data['settings'][setting_id]['entities'].add(entity_lower)

        # Add scope-level setting
        if setting_id and settings_table == 'entity_service_type_setting':
            if setting_id not in scopes_data[scope]['settings']:
                scopes_data[scope]['settings'][setting_id] = {
                    'name': setting_id,
                    'entities': set(),
                    'table': settings_table
                }
            if entity_type:
                entity_lower = entity_type.lower().replace(' ', '')
                # Map entity types
                if entity_lower == 'webservice':
                    entity_lower = 'webservice'
                elif entity_lower == 'device':
                    entity_lower = 'deviceuser'
                elif entity_lower == 'person':
                    continue  # Skip person
                scopes_data[scope]['settings'][setting_id]['entities'].add(entity_lower)

# Convert to JSON structure
output = {}
for scope, data in sorted(scopes_data.items()):
    output[scope] = {
        'name': data['name'],
        'entities': sorted(list(data['entities'])),
        'tables': sorted(list(data['tables'])),
        'services': [],
        'settings': []
    }

    # Add services
    for service_id, service_data in sorted(data['services'].items()):
        service_obj = {
            'name': service_data['name'],
            'display': service_data['display'],
            'description': service_data['description'],
            'allowOn': sorted(list(service_data['entities'])),
            'tables': sorted(list(service_data['tables'])),
            'settings': []
        }

        # Add service settings
        for setting_id, setting_data in sorted(service_data['settings'].items()):
            service_obj['settings'].append({
                'name': setting_data['name'],
                'allowOn': sorted(list(setting_data['entities'])),
                'table': setting_data['table']
            })

        output[scope]['services'].append(service_obj)

    # Add scope settings
    for setting_id, setting_data in sorted(data['settings'].items()):
        output[scope]['settings'].append({
            'name': setting_data['name'],
            'allowOn': sorted(list(setting_data['entities'])),
            'table': setting_data['table']
        })

# Write to JSON file
with open('parsed_scopes.json', 'w', encoding='utf-8') as f:
    json.dump(output, f, indent=2)

print("Parsed data has been written to parsed_scopes.json")
print(f"Total scopes: {len(output)}")
for scope in sorted(output.keys()):
    print(f"  {scope}: {len(output[scope]['services'])} services, {len(output[scope]['settings'])} settings")
