DO $$

DECLARE
-- Parent Entity ---------------
	parent_name 				TEXT := 	'Katli and Son Company'; -- << CHANGE
	entity_service_types 		TEXT[] :=array[
--  | Scope | Limit | Count | Period|
	[ 'TCA', 'true',  null,   null	],
	[ 'CMS', 'true',  null,   null	],
	[ 'OCS', 'true',  null,   null	],
	-- Add any additional scopes
	[ 'CRS', 'true',  null,   null	],	-- << CHANGE / REMOVE
	[ 'AVS', 'true',  null,   null	],	-- << CHANGE / REMOVE
	[ 'BPS', 'true',  null,   null	],	-- << CHANGE / REMOVE
	[ 'IVS', 'true',  null,   null	],	-- << CHANGE / REMOVE
    [ 'CDS', 'true',  null,   null	]	-- << CHANGE / REMOVE
    ];

-- Integration Entity ----------
	create_integration_entity 	BOOLEAN:= 	true;  -- << CHANGE (true or false)

-- Device User -----------------
    create_device_user 			BOOLEAN:= 	true;  			-- << CHANGE (true or false)
    device_user_username 		TEXT:= 		'katli'; 		-- << CHANGE
    device_user_password 		TEXT:= 		'katli@123'; 	-- << CHANGE
    device_user_email_address 	TEXT:= 		'development@bitventure.co.za'; -- << CHANGE
    device_user_is_active 		BOOLEAN:= 	true;  			-- << CHANGE (true or false)


-- Entity Settings
	-- Each scope in these settings must be added to the parent's "entity_service_types"
	-- p: Parent
	-- d: Device User
	-- i: Integrator
    entity_settings TEXT[] := array[
	-- Add 2 dashes in front of the setting if not needed or pass NULL as the value
    --  | SCOPE 	|Entity | Identifier                  		| Value 		|
        ['OCS',		'p',	'ocs.df.scheme',					'KATSON'], --This is what the scheme name is which maps back to the Easy Debit Group code. We set to settings to act as a default value to be used for children inheriting from a parent
        -- EasyLoans setup
		['CRS',		'p',	'crs.cpb.enquiry.done.by',			'Katli and Son Company'],
        ['OCS',		'i',	'ocs.easy.loan.webhook.url',		'https://easyloans.co.za/1019/api/Payments/status/update'], -- entity_service_setting
		-- EasyDebit Settings
		['OCS',		'p',	'ocs.ed.ws.gc',						'KATSON'], -- << CHANGE
        ['OCS',		'i',	'ocs.ed.ws.gc',						'KATSON'], -- << CHANGE
		['OCS',		'p',	'ocs.ed.ws.usr',					'*****'], -- << CHANGE
        ['OCS',		'i',	'ocs.ed.ws.usr',					'*****'], -- << CHANGE
		['OCS',		'p',	'ocs.ed.ws.pwd',					'******'], -- << CHANGE
        ['OCS',		'i',	'ocs.ed.ws.pwd',					'******'], -- << CHANGE
		['OCS',		'p',	'ocs.ed.sc.gc.map',					'[{"map": "KATSON", "gc": "KATSON"}]'], -- << CHANGE
        ['OCS',		'i',	'ocs.ed.sc.gc.map',					'[{"map": "KATSON", "gc": "KATSON"}]'], -- << CHANGE
		['OCS',		'p',	'ocs.ed.passthrough',				'true'], -- << CHANGE (true or false)
        ['OCS',		'i',	'ocs.ed.passthrough',				'true'], -- << CHANGE (true or false)
		['OCS',		'p',	'ocs.ed.ul.gc.map',					''], --< Leave blank 	
        ['OCS',		'i',	'ocs.ed.ul.gc.map',					''], --< Leave blank 	
        ['TCA',		'p',	'webservice.username',			    '*****'],
        ['TCA',		'p',	'webservice.password',			    '*****'],
        ['TCA',		'i',	'ocs.ed.mandate.default.details',	''], --> Dont change the value here, see " Mandate defaults" section below
		-- POS Mandate Settings
		['OCS',		'd',	'external.status.webhook.url',		'https://api.bitventure.co.za/tca/webhook/easydebit/'], -- Integration with RabbitMQ for TT3 receipt printing
		['TCA',		'd',	'app.mandate.authentication.enabled','true'], -- Determines if EasyDebit menu option should show
		['TCA',		'd',	'app.mandate.creation.enabled',		'true'], -- Determines if Mandate options are shown on EasyDebit menu
		['OCS',		'd',	'ocs.ed.mandate.default.details',	''], --> Dont change the value here, see " Mandate defaults" section below
		-- POS Payment Settings
		['TCA',		'd',	'app.payments.enabled',				'true'], -- Determines if EasyPOS Menu is shown
		['TCA',		'd',	'app.manual.payments.enabled',		'true'], -- Determines if EasyPOS Manual Payment option is shown
		['TCA',		'd',	'app.transaction.history.enabled',	'true'], -- Determines if EasyPOS Payment History option is shown
		['TCA',		'd',	'manual.payments.reference.config',	''], --> Dont change the value here, see "Payment Reference Fields" section below
		-- Ecentric Integration
		['TCA',		'd',	'tca.application.key',				'52263fa1-8fbd-46ca-b3c4-c1d148c73f68'], -- << CHANGE
		['TCA',		'd',	'tca.merchant.id',					'000000000000'], -- << CHANGE (Will be prepended with zeros)
		['TCA',		'd',	'tca.merchant.username',			'default'],
        ['TCA',		'd',	'app.mandate.creation.fields',		'{}'] -- Allowed values: debtor.name, debtor.accountType, debtor.branchCode, debtor.mobileNumber, debtor.email
																	  -- see https://bitventuredev.atlassian.net/wiki/spaces/EPOS/pages/3124133891/Dynamic+Fields+for+EasyPOS
    ];

-- Payment Reference Fields
	manual_payments_reference_fields 		BOOLEAN:=		true;
	manual_payments_customer_reference 		TEXT:= 			'disabled'; -- Acceptable values: enabled, disabled, required
	manual_payments_internal_reference 		TEXT:= 			'disabled'; -- Acceptable values: enabled, disabled, required

-- Mandate defaults
    ocs_default_mandate_type 				TEXT:= 			'Usage'; -- Can be 'Usage', 'Variable' or 'Fixed'
    ocs_default_debit_classification 		TEXT:= 			'LRM';
    ocs_default_max_installment_amount 		TEXT:= 			'10000'; -- Don't add cents or decimal points
    ocs_default_frequency 					TEXT:= 			'MONTHLY'; 
    ocs_default_tracking_enabled 			BOOLEAN:= 		true;
    ocs_default_date_adjustment_allowed 	TEXT:= 			'Y'; -- Either 'Y' or 'N'
    ocs_default_adjustment_frequency 		TEXT:= 			'ANUALLY';
    ocs_default_adjustment_type 			TEXT:= 			'RATE';
    ocs_default_adjustment_value 			TEXT:= 			'1';
    ocs_default_generate_installment 		BOOLEAN:= 		true;
    ocs_default_calculate_installment 		BOOLEAN:= 		false;
    ocs_default_generate_contract_reference BOOLEAN:= 		true;
    ocs_default_contract_reference_format 	TEXT:= 			'KATSON_*******'; -- << CHANGE -- Only change "X".  "X" (including underscore) cannot be more than 8 characters. The asterisk will be replaced by a randomly generated string when mandate is created
	ocs_default_scheme 						TEXT:= 			'KATSON';

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
					[setting_scope_identifier,	setting_entity,	'webservice.username',	trim(both '"' from setting_value::TEXT)]  -- VALIDATED
				];
			END IF;

			IF lower(setting_identifier) = 'ocs.ed.ws.pwd' THEN
				entity_settings := entity_settings || array[
					[setting_scope_identifier,	setting_entity,	'webservice.password',	trim(both '"' from setting_value::TEXT)]  -- VALIDATED
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
			'calculateInstallment', ocs_default_calculate_installment,
            'scheme', ocs_default_scheme
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
				WHERE s.service_type_id  in (
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
				WHERE s.service_type_id  in (
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
			    WHEN upper(setting_entity) = 'D' THEN
			        setting_entity_type := 'User';
					setting_entity_identifier := device_user_entity_identifier;
			    WHEN upper(setting_entity) = 'I' THEN
			        setting_entity_type := 'Integrator';
					setting_entity_identifier := integration_entity_identifier;
			    ELSE
			        setting_entity_type := '';
					setting_entity_identifier := '';
			END CASE;

		
			_service_type_id := (SELECT e.id from entity e 			
								INNER JOIN entity_service_type est ON est.entity_id = e.id
								INNER JOIN service_type st ON st.id = est.service_type_id
							WHERE e.identifier = setting_entity_identifier
								AND upper(st.identifier) = upper(scope_identifier));

			-- Add the Service Type to the child entity if it does not exist
			if _service_type_id is null or _service_type_id <= 0 THEN
				WITH serviceType (id) AS (
					SELECT id FROM service_type st WHERE upper(st.identifier) = upper(scope_identifier)
				)
				INSERT INTO public.entity_service_type (entity_id, service_type_id, active)
					SELECT 	(SELECT e.ID FROM entity e WHERE identifier = setting_entity_identifier) as entityId
							,st.id 
							,true
					FROM 	serviceType st
					WHERE NOT EXISTS(
						SELECT e.id from entity e 			
							INNER JOIN entity_service_type est ON est.entity_id = e.id
							INNER JOIN service_type st ON st.id = est.service_type_id
						WHERE e.identifier = setting_entity_identifier
							AND upper(st.identifier) = upper(scope_identifier))
							RETURNING 1 INTO inserted_count;
			
				-- For the sake of the script we just add all the services associated to the service type		
				IF rate_limit THEN 
					WITH service (id) AS (
						SELECT s.id 
						FROM service s 
						WHERE s.service_type_id  in (
							SELECT id FROM service_type st WHERE upper(st.identifier) = upper(scope_identifier)
						)
					)
					INSERT INTO public.entity_service (entity_id, service_id, active, rate_limit, limit_count, limit_period)
						SELECT 	(SELECT e.ID FROM entity e WHERE identifier = setting_entity_identifier) as entityId
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
							WHERE e.identifier = setting_entity_identifier
						);	
					
				ELSE
				
					WITH service (id) AS (
						SELECT s.id 
						FROM service s 
						WHERE s.service_type_id  in (
							SELECT id FROM service_type st WHERE upper(st.identifier) = upper(scope_identifier)
						)
					)
					INSERT INTO public.entity_service (entity_id, service_id, active, rate_limit)
						SELECT 	(SELECT e.ID FROM entity e WHERE identifier = setting_entity_identifier) as entityId
								,s.id 
								,true
								,false
						FROM 	service s
						WHERE NOT EXISTS(
							SELECT s.id from service s			
								INNER JOIN entity_service es ON es.service_id = s.id
								INNER JOIN entity e ON e.id = es.entity_id
							WHERE e.identifier = setting_entity_identifier
						);
						
				END IF;	
			END IF;

			-- VALIDATED
			IF lower(setting_identifier) IN ('webservice.username', 'webservice.password') THEN                               
				INSERT INTO public.entity_service_setting (entity_service_id, identifier, value)
					SELECT 
						(SELECT es.id 
						FROM entity_service es 
						WHERE es.entity_id = (SELECT e.id FROM entity e WHERE e.identifier = setting_entity_identifier)
						AND es.service_id = (SELECT s.id FROM service s WHERE s.identifier = 'tca.services.mca')) AS entity_service_id,
						setting_identifier,
						trim(both '"' from setting_value::TEXT)
					WHERE NOT EXISTS (
						SELECT 1
						FROM entity_service_setting ess
						WHERE ess.entity_service_id = (
							SELECT es.id 
							FROM entity_service es 
							WHERE es.entity_id = (SELECT e.id FROM entity e WHERE e.identifier = setting_entity_identifier)
							AND es.service_id = (SELECT s.id FROM service s WHERE s.identifier = 'tca.services.mca')
						)
						AND ess.identifier = setting_identifier
					);
			ELSE
				IF lower(setting_identifier) IN ('ocs.easy.loan.webhook.url') THEN   
	
					INSERT INTO public.entity_service (entity_id, service_id, active, rate_limit, limit_count, limit_period)
                    WITH target_entity AS (
                        SELECT id
                        FROM entity
                        WHERE identifier = setting_entity_identifier
                    ),
                    services_to_add AS (
                        SELECT id
                        FROM service
                        WHERE identifier IN ('ocs.services.collection', 'ocs.services.mandate', 'ocs.services.debitorder')
                    )
                    SELECT
                        te.id AS entity_id,
                        sta.id AS service_id,
                        true AS active,
                        true AS rate_limit,
                        NULL AS limit_count,
                        NULL AS limit_period
                    FROM
                        target_entity te,
                        services_to_add sta
                    WHERE NOT EXISTS (
                        SELECT 1
                        FROM public.entity_service es
                        WHERE es.entity_id = te.id
                        AND es.service_id = sta.id
                    );
	
					INSERT INTO public.entity_service_setting (entity_service_id, identifier, value)
                    WITH target_entity_service AS (
                        SELECT
                            es.id
                        FROM
                            public.entity_service es
                        JOIN
                            public.entity e ON e.id = es.entity_id
                        JOIN
                            public.service s ON s.id = es.service_id
                        WHERE
                            e.identifier = setting_entity_identifier
                            AND s.identifier IN ('ocs.services.collection', 'ocs.services.mandate', 'ocs.services.debitorder') 
                    )
                    SELECT
                        tes.id AS entity_service_id,
                        setting_identifier AS identifier,
                        trim(both '"' FROM setting_value::TEXT) AS setting_value
                    FROM
                        target_entity_service tes
                    WHERE NOT EXISTS (
                        SELECT 1
                        FROM public.entity_service_setting ess
                        WHERE ess.entity_service_id = tes.id
                        AND ess.identifier = setting_identifier
                    );
				ELSE
	        SELECT upper(setting_scope_identifier) into setting_scope_identifier;
			-- Check if the setting scope matches the service type scope
			-- If it does then we can proceed to add the setting to the entity	
			IF upper(scope_identifier) = upper(setting_scope_identifier) THEN
				SELECT setting_identifier::TEXT into setting_identifier;
				SELECT setting_value::jsonb into setting_value;


				-- Add the Service Type to the parent entity if it does not exist
				WITH serviceType (id) AS (SELECT id FROM service_type st WHERE upper(st.identifier) = upper(scope_identifier))
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
						AND upper(st.identifier) = upper(scope_identifier));


				SELECT (
					SELECT est.ID 
					from entity_service_type est 
					where est.entity_id = 
						(select e.ID from entity e where identifier = setting_entity_identifier) 
						and est.service_type_id = 
						(select st.ID from service_type st where upper(st.identifier) = upper(scope_identifier))
				) into var_entity_service_type_id;
		
				
				-- Assign the JSON objects to the relevant service type setting fields
				CASE WHEN lower(setting_identifier) = 'ocs.ed.mandate.default.details' THEN
					setting_value := mandate_default_details;
				WHEN lower(setting_identifier) = 'manual.payments.reference.config' THEN
					setting_value := manual_payments_reference_field_values;
				ELSE
					setting_value := setting_value;
				END CASE;
		
				-- Check the current value and new value so that we can determine if it's an update or insert
				_current_value := (SELECT value FROM public.entity_service_type_setting WHERE lower(identifier) = lower(setting_identifier) AND entity_service_type_id = var_entity_service_type_id limit 1);
				_new_value := trim(both '"' from setting_value::TEXT);	
		


				IF setting_identifier IN ('ocs.ed.mandate.default.details', 'manual.payments.reference.config') OR (setting_identifier LIKE '%.map' and _new_value <> '') THEN
					IF _current_value::text LIKE '%\\\"%' THEN
						_current_value := replace(replace(_current_value::text, '\"', '"'), '\\', '');
					END IF;

					IF _new_value::text LIKE '%\\\"%' THEN
						_new_value := replace(replace(_new_value::text, '\"', '"'), '\\', '');
					END IF;
					
					if jsonb_typeof(_current_value::jsonb) = 'array' or jsonb_typeof(_new_value::jsonb) = 'array' THEN
						-- Normalize both arrays before merging and deduplicating
						WITH current_elements AS (
						  SELECT jsonb_object_agg(k, v) AS obj
						  FROM jsonb_array_elements(_current_value::jsonb) elem,
						       jsonb_each(elem) AS t(k, v)
						  GROUP BY elem
						),
						new_elements AS (
						  SELECT jsonb_object_agg(k, v) AS obj
						  FROM jsonb_array_elements(_new_value::jsonb) elem,
						       jsonb_each(elem) AS t(k, v)
						  GROUP BY elem
						),
						combined AS (
						  SELECT obj FROM current_elements
						  UNION
						  SELECT obj FROM new_elements
						)
						SELECT jsonb_agg(obj) INTO _new_value FROM combined;
					END IF;

					IF _current_value IS NULL THEN
						_new_value := _new_value::jsonb;
					ELSE
						IF (_current_value <> _new_value) THEN
						_new_value := COALESCE(_current_value::jsonb, '{}'::jsonb) || _new_value::jsonb;
						ELSE
						_new_value := _new_value::jsonb;
						END IF;
					END IF;
					setting_value = _new_value;
				end if;
					

				-- When the current value doesn't exist then insert it									
				IF _current_value IS NULL THEN
					action_taken:= 'Inserted';
					INSERT INTO public.entity_service_type_setting 
						(entity_service_type_id, identifier, value)
					SELECT 
						var_entity_service_type_id,
						setting_identifier,
						CASE 
							WHEN jsonb_typeof(setting_value::jsonb) IN ('string', 'number', 'boolean') 
							THEN trim(both '"' from setting_value::TEXT)
							ELSE setting_value::TEXT
						END
					WHERE NOT EXISTS(
						SELECT 1 
						FROM public.entity_service_type_setting
						WHERE lower(identifier) = lower(setting_identifier)
						AND entity_service_type_id = var_entity_service_type_id
					);
				ELSE 
					-- When the current value exists but differs to the new value then update it	
					IF _current_value <> _new_value THEN
						action_taken:= 'Updated';
						UPDATE public.entity_service_type_setting
						SET value = CASE 
									WHEN jsonb_typeof(setting_value::jsonb) IN ('string', 'number', 'boolean') 
									THEN trim(both '"' from setting_value::TEXT)
									ELSE setting_value::TEXT
									END
						WHERE lower(identifier) = lower(setting_identifier) AND entity_service_type_id = var_entity_service_type_id AND lower(value::TEXT) <> lower(setting_value::TEXT);
					-- When the current value is the same as the value then just log it
					ELSE
						action_taken:= 'No change';
					END IF;
				END IF ;
	            END IF;   
            END IF;  

			   
					
		

				-- Log the action taken
				RAISE NOTICE '		%', FORMAT(
					'%s%s%s%s%s',
					RPAD(scope_identifier::TEXT, 5),
					RPAD(setting_entity_type::TEXT, 10),
					RPAD(setting_identifier::TEXT,     40),
					RPAD(action_taken::TEXT,    15),
					RPAD(setting_value::TEXT,100)
				);

			END IF;
		END LOOP;
	-- End Entity Service Type Settings Setup
------------------------
	-- Entity Service Types Setup
	END LOOP;	

_results  := ARRAY[
	[ 'Entity', 'Name', 'Entity ID',  'Password'],
	[ RPAD('-', 15, '-'), RPAD('-', 25, '-'),  RPAD('-', 40, '-'), RPAD('-', 40, '-')],
	[ 'Parent', parent_name,  parent_identifier, 'N/A'	],
	[ 'Integrator', integration_entity_description,  integration_entity_identifier,   entity_password	],
	[ 'Device User', device_user_entity_description,  device_user_entity_identifier,   device_user_password	]];
RAISE notice '';

FOREACH _result SLICE 1 IN ARRAY _results
LOOP
	RAISE NOTICE '%', FORMAT('|%s|%s|%s|%s|',
		RPAD(_result[1], 15),
		RPAD(_result[2], 25),
		RPAD(_result[3]::TEXT, 40),
		RPAD(_result[4]::TEXT, 40)
	);
END LOOP;


						
END $$;