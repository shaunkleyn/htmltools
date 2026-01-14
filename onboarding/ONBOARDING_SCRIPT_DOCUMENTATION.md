# SQL Onboarding Script Documentation

## Overview

This SQL script automates the process of setting up a new company in the payment management system. It creates all the necessary database records, configurations, and user accounts needed for a company to use the platform.

Think of it like setting up a new customer account in an online system - but instead of filling out a form, this script does everything automatically in the database.

---

## What Does This Script Do?

The script performs three main tasks:

1. **Creates Three Types of Entities (Accounts)**:
   - **Parent Entity**: The main company account
   - **Integrator Entity**: A system account for API access and automated processes
   - **Device User**: A user account for POS devices or terminals

2. **Assigns Services/Scopes**: Gives the company access to different features/modules:
   - **TCA** - Terminal/Transaction services
   - **CMS** - Content Management services
   - **OCS** - Order/Collection services
   - **CRS** - Credit Reference services
   - **AVS** - Address Verification services
   - **BPS** - Billing/Payment services
   - **IVS** - ID Verification services
   - **CDS** - Card services

3. **Configures Settings**: Sets up all the specific configurations, credentials, and preferences for each service.

---

## Configuration Section (Lines 1-97)

This is where you customize the script for each new company. Think of this as the "form" you fill out.

### Basic Company Information

```sql
parent_name := 'Katli and Son Company'; -- The company's name
```

### Services to Enable

```sql
entity_service_types := array[
    [ 'TCA', 'true', null, null ],  -- Enable TCA with rate limiting
    [ 'CMS', 'true', null, null ],  -- Enable CMS with rate limiting
    -- etc.
];
```

Each row represents:
- **Column 1**: Service name (scope)
- **Column 2**: Enable rate limiting? (`true`/`false`)
- **Column 3**: Maximum requests allowed (optional)
- **Column 4**: Time period for the limit (optional)

### Create Integrator Account?

```sql
create_integration_entity := true;  -- Yes, create an integrator account
```

An integrator account is like a "robot user" that allows external systems to connect and communicate with your platform automatically through APIs.

### Device User Setup

```sql
create_device_user := true;              -- Create a POS device user
device_user_username := 'katli';         -- Username for the device
device_user_password := 'katli@123';     -- Password for the device
device_user_email_address := 'development@bitventure.co.za';
device_user_is_active := true;           -- Account is active
```

This creates login credentials for POS terminals or payment devices.

### Settings Configuration

```sql
entity_settings TEXT[] := array[
    ['OCS', 'p', 'ocs.df.scheme', 'KATSON'],
    -- More settings...
];
```

Each setting is an array with 4 values:
1. **Scope** (which service): `OCS`, `TCA`, `CRS`, etc.
2. **Entity Type**:
   - `p` = Parent company
   - `i` = Integrator
   - `d` = Device user
3. **Setting Name**: The specific configuration property
4. **Value**: The value to set

**Example**: `['OCS', 'p', 'ocs.df.scheme', 'KATSON']`
- For the OCS service
- For the parent company
- Set the default scheme setting
- To the value "KATSON"

### Payment Reference Fields

```sql
manual_payments_reference_fields := true;
manual_payments_customer_reference := 'disabled';  -- Can be: enabled, disabled, required
manual_payments_internal_reference := 'disabled';
```

Controls whether payment reference fields appear on the POS device.

### Mandate Defaults

These settings control how payment mandates (recurring payment agreements) are created:

```sql
ocs_default_mandate_type := 'Usage';         -- Type: Usage, Variable, or Fixed
ocs_default_debit_classification := 'LRM';   -- Debit classification code
ocs_default_max_installment_amount := '10000';  -- Maximum amount (cents)
ocs_default_frequency := 'MONTHLY';          -- How often: MONTHLY, WEEKLY, etc.
ocs_default_tracking_enabled := true;        -- Track mandate status
ocs_default_contract_reference_format := 'KATSON_*******';  -- Reference format
```

---

## How The Script Works (Step by Step)

### Step 1: Pre-Processing Settings (Lines 140-209)

Before creating anything, the script processes and validates the configuration.

#### A. Duplicate Credentials (Lines 140-158)

For every EasyDebit username/password setting, it automatically creates a matching webservice credential:

```
If setting = 'ocs.ed.ws.usr' → Also create 'webservice.username'
If setting = 'ocs.ed.ws.pwd' → Also create 'webservice.password'
```

**Why?** Some services need credentials in two places.

#### B. Build Mandate Defaults JSON (Lines 161-188)

Takes all the individual mandate settings and combines them into a single JSON object:

```json
{
  "mandateType": "Usage",
  "debitClassification": "LRM",
  "maximumInstallmentAmount": "10000",
  "frequency": "MONTHLY",
  "tracking": true,
  ...
}
```

#### C. Build Payment Reference Fields JSON (Lines 192-209)

Creates a JSON object for payment reference field settings and validates the values are correct (must be `enabled`, `disabled`, or `required`).

---

### Step 2: Create Entities (Lines 212-288)

#### A. Generate Unique Identifiers (Lines 213-218)

The script generates UUIDs (unique IDs) for each entity:

```sql
parent_identifier := 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'
integration_entity_identifier := 'b2c3d4e5-f6a7-8901-bcde-f01234567891'
device_user_entity_identifier := 'c3d4e5f6-a7b8-9012-cdef-012345678902'
entity_password := 'd4e5f6a7-b8c9-0123-def0-123456789003'
```

**Why?** These act as permanent, unique references to each account.

#### B. Create Parent Entity (Lines 222-229)

**Tables Modified**: `public.entity`

Inserts a record for the parent company:

```sql
INSERT INTO public.entity (description, identifier, lookup_entity_type_id, active)
VALUES (
    'Katli and Son Company',     -- Company name
    'a1b2c3d4...',               -- UUID
    1,                            -- Type ID (1 = Parent)
    true                          -- Active
)
WHERE NOT EXISTS (already existing check)
```

**Important**: Uses `WHERE NOT EXISTS` to avoid creating duplicates if the company already exists.

#### C. Create Integrator Entity (Lines 233-256)

**Tables Modified**: `public.entity`, `public.integrator`

Creates the integrator account and its credentials:

1. Insert into `entity` table with type "Integrator"
2. Insert into `integrator` table with:
   - Hashed password (SHA-256)
   - Email address
   - Link to parent entity

#### D. Create Device User (Lines 260-286)

**Tables Modified**: `public.entity`, `public.user`

If `create_device_user` is `true`:

1. Insert into `entity` table with type "User"
2. Insert into `user` table with:
   - Username
   - Hashed password (SHA-256)
   - Email address
   - Active status
   - Link to parent entity

---

### Step 3: Assign Services to Parent (Lines 292-366)

This section runs **ONCE for each scope** (TCA, CMS, OCS, etc.).

**Loop Variable**: `entity_service_type` - contains `[scope, rate_limit, limit_count, limit_period]`

#### What Happens in Each Iteration:

**A. Add Service Type to Parent (Lines 304-318)**

**Table Modified**: `public.entity_service_type`

Links the parent entity to the service type (e.g., "TCA"):

```
Parent Entity ←→ TCA Service Type
```

**B. Add All Services Under That Type (Lines 320-363)**

**Table Modified**: `public.entity_service`

For each service under the service type (e.g., TCA has multiple services like `tca.services.mca`), create a link with rate limiting settings:

```
Parent Entity ←→ tca.services.mca (with rate limit: true, count: null, period: null)
Parent Entity ←→ tca.services.another (with rate limit: true, count: null, period: null)
```

**Rate Limiting Logic**:
- If `rate_limit = true`: Insert with rate limit enabled and optional count/period
- If `rate_limit = false`: Insert with rate limit disabled

---

### Step 4: Apply Settings (Lines 371-694)

This is the most complex part. It runs **TWICE**:
1. **Outer Loop**: Once per scope (TCA, OCS, etc.)
2. **Inner Loop**: Once per setting in the `entity_settings` array

#### What Happens for Each Setting:

**A. Determine Which Entity Gets the Setting (Lines 373-391)**

Based on the entity type letter:
- `'P'` → Parent identifier
- `'D'` → Device user identifier
- `'I'` → Integrator identifier

**B. Ensure the Entity Has Access to the Scope (Lines 400-465)**

If the entity doesn't have the service type yet, add it:

**Tables Modified**: `public.entity_service_type`, `public.entity_service`

For example, if we're setting `['OCS', 'i', 'ocs.easy.loan.webhook.url', '...']`:
- Check if the integrator has OCS scope
- If not, add it
- Also add all OCS services to the integrator

**C. Handle Special Settings (Lines 468-544)**

Some settings require special handling:

**1. Web Service Credentials (Lines 468-487)**

**Table Modified**: `public.entity_service_setting`

For `webservice.username` and `webservice.password`:
- Insert into `entity_service_setting` (not `entity_service_type_setting`)
- Specifically for the `tca.services.mca` service

**2. EasyLoan Webhook URL (Lines 489-544)**

**Tables Modified**: `public.entity_service`, `public.entity_service_setting`

For `ocs.easy.loan.webhook.url`:
- Add three OCS services to the entity:
  - `ocs.services.collection`
  - `ocs.services.mandate`
  - `ocs.services.debitorder`
- Apply the webhook URL setting to all three services

**D. Handle Regular Settings (Lines 546-690)**

**Table Modified**: `public.entity_service_type_setting`

For all other settings:

1. **Scope Check** (Line 549): Only process if the setting's scope matches the current loop scope

2. **Assign JSON Objects** (Lines 580-586):
   - If setting is `ocs.ed.mandate.default.details` → Use the built JSON object
   - If setting is `manual.payments.reference.config` → Use the built JSON object
   - Otherwise → Use the provided value

3. **Check Current Value** (Lines 589-590):
   - Retrieve the existing value from the database (if any)
   - Compare with the new value

4. **Merge JSON Arrays** (Lines 594-635):

   For settings like `ocs.ed.sc.gc.map` (scheme mappings):
   - If current value is an array: `[{"map": "OLD", "gc": "OLD"}]`
   - And new value is an array: `[{"map": "NEW", "gc": "NEW"}]`
   - Merge and deduplicate: `[{"map": "OLD", "gc": "OLD"}, {"map": "NEW", "gc": "NEW"}]`

   **Why?** Prevents losing existing mappings when adding new ones.

5. **Insert or Update** (Lines 639-672):

   **If no current value exists**:
   - Action: `INSERT`
   - Result: "Inserted"

   **If current value exists and is different**:
   - Action: `UPDATE`
   - Result: "Updated"

   **If current value exists and is the same**:
   - Action: None
   - Result: "No change"

6. **Log the Action** (Lines 681-688):
   ```
   OCS   Parent    ocs.df.scheme                Inserted       "KATSON"
   ```

---

### Step 5: Display Summary (Lines 697-713)

After everything is complete, the script displays a summary table:

```
|Entity         |Name                     |Entity ID                               |Password                                |
|---------------|-------------------------|----------------------------------------|----------------------------------------|
|Parent         |Katli and Son Company    |a1b2c3d4-e5f6-7890-abcd-ef1234567890   |N/A                                     |
|Integrator     |Katli and Son Company ...|b2c3d4e5-f6a7-8901-bcde-f01234567891   |d4e5f6a7-b8c9-0123-def0-123456789003   |
|Device User    |katli                    |c3d4e5f6-a7b8-9012-cdef-012345678902   |katli@123                               |
```

---

## Tables Modified by This Script

### Core Entity Tables

| Table | Purpose | What Gets Inserted |
|-------|---------|-------------------|
| `public.entity` | Stores all entities (companies, integrators, users) | Parent, Integrator, and Device User records |
| `public.integrator` | Stores integrator credentials | API credentials for the integrator entity |
| `public.user` | Stores device user credentials | Login credentials for POS devices |

### Service Assignment Tables

| Table | Purpose | What Gets Inserted |
|-------|---------|-------------------|
| `public.entity_service_type` | Links entities to service types (TCA, OCS, etc.) | One record per entity per scope |
| `public.entity_service` | Links entities to specific services | Multiple records per entity per scope, with rate limiting settings |

### Settings Tables

| Table | Purpose | What Gets Inserted |
|-------|---------|-------------------|
| `public.entity_service_type_setting` | Stores scope-level settings | Most configuration settings go here |
| `public.entity_service_setting` | Stores service-level settings | Special settings like webservice credentials |

---

## Key Concepts Explained

### 1. Scopes vs Services

**Scope (Service Type)**: A broad category of functionality
- Example: `OCS` (Order/Collection Services)

**Service**: A specific feature within a scope
- Example: `ocs.services.mandate`, `ocs.services.debitorder`, `ocs.services.collection`

Think of scopes as departments and services as specific tasks within those departments.

### 2. Entity Types

- **Parent**: The main company account (always created)
- **Integrator**: System/API account (optional)
- **Device User**: POS/terminal account (optional)

### 3. Rate Limiting

Controls how many API requests can be made in a time period:
- `rate_limit = true/false`: Enable or disable limiting
- `limit_count`: Maximum requests (e.g., 1000)
- `limit_period`: Time window (e.g., 'per_minute', 'per_hour')

### 4. JSON Settings

Some settings store complex data as JSON:
- **Mandate defaults**: All mandate configuration in one JSON object
- **Payment reference fields**: Reference field visibility settings
- **Scheme mappings**: Arrays of scheme/group code pairs

### 5. Idempotency

The script is **idempotent**, meaning:
- Running it multiple times produces the same result
- It won't create duplicates
- It updates existing records if values change

This is achieved through `WHERE NOT EXISTS` checks before inserts.

---

## Common Customizations

### Adding a New Scope

1. Add to `entity_service_types` array:
   ```sql
   ['NEW', 'true', null, null]
   ```

2. Add settings for the scope:
   ```sql
   ['NEW', 'p', 'new.setting.name', 'value']
   ```

### Disabling Integrator Creation

```sql
create_integration_entity := false;
```

### Disabling Device User Creation

```sql
create_device_user := false;
```

### Changing Mandate Defaults

Simply modify the variables:
```sql
ocs_default_mandate_type := 'Fixed';
ocs_default_frequency := 'WEEKLY';
```

### Adding Custom Settings

Add to the `entity_settings` array:
```sql
['SCOPE', 'entity_type', 'setting.identifier', 'value']
```

---

## Troubleshooting

### "Invalid value for manual_payments_customer_reference"

**Cause**: The value must be exactly `enabled`, `disabled`, or `required` (case-insensitive).

**Fix**: Check line 78-79 and ensure proper spelling.

### Setting Not Appearing

**Possible causes**:
1. Scope not added to `entity_service_types`
2. Setting scope doesn't match loop scope
3. Entity type letter is wrong (`p`, `i`, `d`)

### Duplicate Key Errors

**Cause**: Entity already exists with the same name.

**Fix**: The script should handle this automatically. Check if the entity name is exactly the same (case-sensitive).

---

## Security Notes

### Password Hashing

All passwords are hashed using SHA-256:
```sql
encode(digest(password::bytea,'sha256'),'base64')
```

Passwords are **never** stored in plain text.

### Credentials in Output

The script outputs credentials in the summary. In production:
- Redirect output to a secure location
- Clear terminal history after running
- Store credentials in a password manager

---

## Summary

This SQL script is a comprehensive onboarding automation tool that:

1. ✅ Creates company accounts (parent, integrator, device user)
2. ✅ Assigns services and scopes to each account
3. ✅ Configures hundreds of settings automatically
4. ✅ Handles complex JSON configurations
5. ✅ Merges existing data intelligently
6. ✅ Prevents duplicates through idempotency
7. ✅ Provides detailed logging and summary output

By filling out the configuration section at the top, you can onboard a new company in seconds instead of manually creating dozens of database records.
