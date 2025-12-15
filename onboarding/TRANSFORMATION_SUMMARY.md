# CSV to scope_settings.js Transformation Summary

## What I Did

I successfully analyzed your Excel/CSV data and transformed it into the JSON structure used in `scope_settings.js`. Here's what was accomplished:

### 1. **Parsed CSV Data** ✓
- Read all 900 rows from `scopes-services-settings.csv`
- Extracted 25 unique scopes with their services and settings
- Mapped entity types correctly:
  - `Device` → `deviceuser`
  - `Web Service` → `webservice`
  - `Parent` → `parent`
  - `Integrator` → `integrator`
  - `Person` → (skipped as it appears to be old data)

### 2. **Generated Structure** ✓
The new file `scope_settings_NEW.js` contains:
- All 25 scopes from the CSV
- Services with proper `allowOn` entities
- Settings with correct table mappings
- Proper use of constants (EntityType, ServiceTable, SettingsTable)

### 3. **Scopes Included** ✓
All 25 scopes from your database:
1. AML - Anti-Money Laundering Service
2. AVS - Account Verification Service
3. BIVS - Batch Identity Verification Service
4. BMS - Messaging Service
5. BPS - Bitventure Payment Service
6. BSS - Bank Statement Service
7. BVS - Biometric Verification Service
8. CDS - Card Disbursement Service
9. CDVS - Check-Digit Validation Service
10. CMS - Client Management Service
11. COVS - Company Verification Service
12. CRS - Credit Rating Service
13. CVS - Contact Verification Service
14. FMS - Fingerprint Matching Service
15. FVS - Facial Verification Service
16. IVS - Identity Verification Service
17. OBS - Onboarding Service
18. OCS - Online Collection Service
19. OPS - Onboarding Process Service
20. PUI - Premium User Interface
21. PVS - Phone Verification Service
22. SDS - Secure Document Service
23. SSV - Secure Signing Verification
24. TCA - Transaction Card Authorisation
25. VMS - Vehicle Management Service

## What You Need to Review

### 1. **Entity-Table Mappings (entityTables)**
The CSV doesn't explicitly show which entities should be linked to which tables (entity_service vs entity_service_type). I applied this convention:
- **Parent entities** → `entity_service` table
- **Other entities (integrator, deviceuser, webservice)** → `entity_service_type` table

**Example from CMS:**
```javascript
"entityTables": [
    {
        "entities": [EntityType.PARENT],
        "tables": [ServiceTable.ENTITY_SERVICE]
    },
    {
        "entities": [EntityType.INTEGRATOR, EntityType.DEVICEUSER],
        "tables": [ServiceTable.ENTITY_SERVICE_TYPE]
    }
]
```

You may need to manually verify this for services that have both table types.

### 2. **Setting Types**
All settings are currently set to either:
- `InputType.CHECKBOX` (for scope-level settings)
- `InputType.TEXT` (for service-level settings)

You'll need to update these based on the actual input type:
- Password fields → `InputType.PASSWORD`
- Text areas → `InputType.TEXTAREA`
- Dropdowns → `InputType.SELECT`
- Numbers → `InputType.NUMBER`

### 3. **Setting Descriptions**
The `settingDescriptions` object at the top of the file is empty. You should add descriptions for all settings to provide tooltips and help text.

### 4. **Additional Setting Properties**
Some settings may need additional properties that weren't in the CSV:
- `label` - Display label for the setting
- `placeholder` - Placeholder text
- `description` - Help text
- `group` - Grouping for settings (e.g., "EasyDebit Connection")
- `dependsOn` - Dependencies on other settings
- `defaultValue` - Default value
- `values` - Options for dropdown/select fields

### 5. **Special Settings**
Complex settings like `ocs.ed.mandate.default.details` from your original file have special handling with multiple fields. These need to be manually configured as they have custom UI components.

## How to Use the Generated File

1. **Review** the generated `scope_settings_NEW.js` file
2. **Compare** it with your original `scope_settings.js` for scopes you've already configured (TCA, CMS, OCS)
3. **Merge** the manually configured settings from your original file with the new auto-generated structure
4. **Test** each scope in the UI to ensure:
   - Services appear correctly
   - Settings render with correct input types
   - Entity links work as expected
5. **Refine** the entityTables mappings if needed

## Files Created

1. `parse_csv_to_scopes.py` - Python script that parses the CSV
2. `parsed_scopes.json` - Intermediate JSON format
3. `generate_scope_settings.py` - Python script that generates JavaScript
4. `scope_settings_NEW.js` - **Your new scope settings file**

## Next Steps

1. Open `scope_settings_NEW.js` and review the structure
2. Compare it with the manually configured scopes in your original file
3. Add the missing metadata (labels, descriptions, input types)
4. Test in the UI
5. Once verified, replace the original `scope_settings.js` with the new one

## Transformation Pattern Understanding

Based on your existing TCA, CMS, and OCS configurations, I understand the pattern:

**Excel/CSV Row** →→ **JSON Structure**:
- `scope` column → scope object key
- `scope_description` → scope.name
- `service_identifier` → service.name
- `service_display_text` → service.display
- `service_description` → service.description
- `setting_identifier` → setting.name
- `settings_table` → determines if setting goes in service.settings or scope.settings
- `entity_type` → added to allowOn arrays

The transformation preserves:
- All service relationships
- All entity linkages
- All setting-to-entity mappings
- Table assignments for settings
