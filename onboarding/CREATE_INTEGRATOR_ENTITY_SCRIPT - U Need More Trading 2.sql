-- CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

DO $$
-- These need to be supplied
DECLARE parent_description TEXT := 'U Need More Trading'; -- NOTE!!! Please go check the ENTITY table first to see if a parent already exists
DECLARE entity_website TEXT := 'http://www.bitventure.co.za'; -- Needed for BSS & FVS settings
DECLARE entity_service_types TEXT[] :=array[
	['AVS', 'true', null, null],
	['BPS', 'true', null, null],
	['CRS', 'true', null, null],
	['CDS', 'true', null, null],
	['IVS', 'true', null, null],
	['OCS', 'true', null, null]
];


-- OCS Settings 
-- Set settings here by adding := '...'; 
-- Maps are in the format  '[{"map": "", "gc": ""},{"map": "", "gc": ""}]'
-- The values listed below are the defaults we use in UAT for setting up UAT integrators. 
DECLARE ocs_ed_ws_gc TEXT := 'CHIUNION4';
DECLARE ocs_ed_ws_usr TEXT := 'WS1014';
DECLARE ocs_ed_ws_pwd TEXT := 'c2c9c9190d3e2d9a1626cf8aa1a8ee5b83f42cebf547a8284c64e38625f3ceef';
DECLARE ocs_df_scheme TEXT := 'CHIUNION4'; --This is what the scheme name is which maps back to the Easy Debit Group code. We set to settings to act as a default value to be used for children inheritting from a paremt
DECLARE ocs_ed_sc_gc_map TEXT:= '[{"map": "CHIUNION4", "gc": "CHIUNION4"}]'; 
-- The "Scheme" TEST is mapped to the ED Group Code "TSTDBC"
DECLARE ocs_ed_ul_gc_map TEXT; -- Leave blank. 
-- UL means "ultimate creditor", which maps the Ultimate Credtior to the ED Group Code. Generally best to keep this setting is always blank. 
DECLARE ocs_ed_do_sc_gc_map TEXT:= '[{"map": "CU4EFT", "gc": "CU4EFT"}]';
DECLARE ocs_ed_do_gc TEXT:= 'CU4EFT';
DECLARE ocs_ed_passthrough TEXT:= 'true';
DECLARE ocs_webhook_url_mandate TEXT; -- The webhook URL to post back mandates to the client. 
DECLARE ocs_webhook_url_collection TEXT; -- The webhook URL to post back mandates to the client. 

-- BSS Settings 
-- Set settings here by adding := '...'; 
DECLARE bss_webhook_url TEXT;

-- CRS Settings 
-- Set settings here by adding := '...'; 
DECLARE crs_cpb_enquiry_done_by TEXT := 'U Need More Trading';

-- These are generated / used within the script !! DONT CHANGE !!!
DECLARE parent_identifier TEXT;
DECLARE entity_identifier TEXT;
DECLARE entity_description TEXT;
DECLARE entity_password TEXT;
DECLARE entity_service_type TEXT[];
DECLARE entity_scopes TEXT := '';

-- entity_service_types array elements !! DONT CHANGE !!!
DECLARE scope_identifier TEXT;
DECLARE rate_limit BOOLEAN;
DECLARE limit_count INTEGER;
DECLARE limit_period TEXT;

BEGIN
	
	SELECT parent_description || ' :Integrator' into entity_description; -- Assuming we following the naming convention of "MY CUSTOMER :Integrator"
	SELECT UPPER(uuid_generate_v4()::varchar) into parent_identifier;
    SELECT uuid_generate_v4()::varchar into entity_identifier;
    SELECT uuid_generate_v4()::varchar into entity_password;
    		
	-- Parent Entity 
	-- Only insert a parent record if the "parent_description" is not already in public.entity 
	INSERT INTO public.entity (description, identifier, lookup_entity_type_id, active)
		SELECT parent_description, parent_identifier, 1, true
		WHERE NOT EXISTS(
			SELECT id FROM public.entity WHERE lower(description) = lower(parent_description)
		);
		
	-- Regardless of the insert statement outcome, we need to get identifier related to the "parent_description" (incase it was not inserted and we need to get the existing identifier)	
	SELECT identifier INTO parent_identifier FROM public.entity WHERE lower(description) = lower(parent_description);
		
	-- Entity (Integrator Entity Type)
	-- Only insert a record if the "entity_description" is not already in public.entity
	INSERT INTO public.entity (description, identifier, lookup_entity_type_id, active, parent_id)
	SELECT	entity_description
			,entity_identifier
			,(select id from lookup_entity_type where description = 'Integrator') as lookupEntityTypeId			
			,true
			,(select id from entity where identifier = parent_identifier) as entityParentId			
	WHERE NOT EXISTS(
        SELECT id FROM public.entity WHERE lower(description) = lower(entity_description)
    );	

	-- Regardless of the insert statement outcome, we need to get identifier related to the "entity_description" (incase it was not inserted and we need to get the existing identifier)		
	SELECT identifier INTO entity_identifier FROM public.entity WHERE lower(description) = lower(entity_description);
   		
	-- Entity (Integrator)
	INSERT INTO public.integrator (entity_id, client_secret, email_address, active)
	select 	(select id from entity where identifier = entity_identifier) as entityId	
			,(select encode(digest(entity_password,'sha256'),'base64')) as client_secret
			,'development@bitventure.co.za'
			,true 
	WHERE NOT EXISTS(
        SELECT i.id FROM public.integrator i 
			INNER JOIN public.entity e ON e.id = i.entity_id			
		WHERE lower(e.identifier) = lower(entity_identifier)
    );		
		
	FOREACH entity_service_type SLICE 1 IN ARRAY entity_service_types
	LOOP
	
		SELECT upper(entity_service_type[1]) into scope_identifier;	
		SELECT entity_service_type[2]::BOOLEAN into rate_limit;
		SELECT entity_service_type[3]::INTEGER into limit_count;
		SELECT entity_service_type[4] into limit_period;
		
		RAISE notice 'Adding: % % % %', scope_identifier, rate_limit, limit_count, limit_period;
		
		SELECT entity_scopes || ' ' || lower(scope_identifier) into entity_scopes; 
		
		-- PARENT ENTITY
		RAISE notice 'Configuring Parent Entity: %', parent_identifier;
		
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
					AND upper(st.identifier) = upper(scope_identifier)
			);	

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
						,s.id 
						,true
						,false
				FROM 	service s
				WHERE NOT EXISTS(
					SELECT s.id from service s			
						INNER JOIN entity_service es ON es.service_id = s.id
						INNER JOIN entity e ON e.id = es.entity_id
					WHERE e.identifier = parent_identifier
				);
				
		END IF;	
		
		-- Parent Entity Service Type Settings: BSS
		-- TODO: Check that these don't already exists, else they'll be duplicated.
		IF upper(scope_identifier) = 'BSS' THEN	
			RAISE notice 'Parent Type Service Type Settings: %', scope_identifier;
						
			INSERT INTO public.entity_service_type_setting (entity_service_type_id, identifier, value)
			SELECT 	(SELECT est.ID from entity_service_type est where est.entity_id = (select e.ID from entity e where identifier = parent_identifier) and est.service_type_id = (select st.ID from service_type st where upper(st.identifier) = upper(scope_identifier))) as entityServiceTypeId
				,'bss.sms.header'
				,'Bank Statement Service. Please retrieve your statements - ';	
		
			RAISE notice 'BSS Service Type Setting: bss.sms.footer: %', parent_description;
			INSERT INTO public.entity_service_type_setting (entity_service_type_id, identifier, value)
			SELECT 	(SELECT est.ID from entity_service_type est where est.entity_id = (select e.ID from entity e where identifier = parent_identifier) and est.service_type_id = (select st.ID from service_type st where upper(st.identifier) = upper(scope_identifier))) as entityServiceTypeId
				,'bss.sms.footer'
				,parent_description;			
		
			RAISE notice 'BSS Service Type Setting: bss.redirect.url: %', entity_website;
			INSERT INTO public.entity_service_type_setting (entity_service_type_id, identifier, value)
			SELECT 	(SELECT est.ID from entity_service_type est where est.entity_id = (select e.ID from entity e where identifier = parent_identifier) and est.service_type_id = (select st.ID from service_type st where upper(st.identifier) = upper(scope_identifier))) as entityServiceTypeId
				,'bss.redirect.url'
				,entity_website;	

			IF bss_webhook_url IS NOT NULL AND upper(bss_webhook_url) != '' THEN				
				RAISE notice 'BSS Service Type Setting: bss.webhook.url: %', bss_webhook_url;
				
				INSERT INTO public.entity_service_type_setting (entity_service_type_id, identifier, value)
				SELECT 	(SELECT est.ID from entity_service_type est where est.entity_id = (select e.ID from entity e where identifier = parent_identifier) and est.service_type_id = (select st.ID from service_type st where upper(st.identifier) = upper(scope_identifier))) as entityServiceTypeId
					,'bss.webhook.url'
					,bss_webhook_url;	
			END IF;	
			
		END IF;

		-- Parent Entity Service Type Settings: CRS
		-- TODO: Check that these don't already exists, else they'll be duplicated.
		IF upper(scope_identifier) = 'CRS' THEN	
			RAISE notice 'Parent Type Service Type Settings: %', scope_identifier;						

			IF crs_cpb_enquiry_done_by IS NOT NULL AND upper(crs_cpb_enquiry_done_by) != '' THEN				
				RAISE notice 'CRS Service Type Setting: crs.cpb.enquiry.done.by: %', crs_cpb_enquiry_done_by;
				
				INSERT INTO public.entity_service_type_setting (entity_service_type_id, identifier, value)
				SELECT 	(SELECT est.ID from entity_service_type est where est.entity_id = (select e.ID from entity e where identifier = parent_identifier) and est.service_type_id = (select st.ID from service_type st where upper(st.identifier) = upper(scope_identifier))) as entityServiceTypeId
					,'crs.cpb.enquiry.done.by'
					,crs_cpb_enquiry_done_by;	
			END IF;	
			
		END IF;		
			
		-- Parent Entity Service Settings: LIVENESS (FVS)
		-- TODO: Check that these don't already exists, else they'll be duplicated.
		IF upper(scope_identifier) = 'FVS' THEN
		
			RAISE notice 'Parent Service Type Settings: %', scope_identifier;
			
			INSERT INTO public.entity_service_setting (entity_service_id, identifier, value)
			select 	(select es.ID from entity_service es where entity_id = (select e.ID from entity e where identifier = parent_identifier) and service_id = (select s.ID from service s where s.identifier  = 'fvs.services.liveness')) as entityServiceId
					,'fvs.liveness.sms.header'
					,'Facial Recognition & Liveness Verification. Please verify your identity - ';
		
			INSERT INTO public.entity_service_setting (entity_service_id, identifier, value)
			select 	(select es.ID from entity_service es where entity_id = (select e.ID from entity e where identifier = parent_identifier) and service_id = (select s.ID from service s where s.identifier  = 'fvs.services.liveness')) as entityServiceId
				,'fvs.liveness.sms.footer'
				,parent_description;	

			INSERT INTO public.entity_service_setting (entity_service_id, identifier, value)
			select 	(select es.ID from entity_service es where entity_id = (select e.ID from entity e where identifier = parent_identifier) and service_id = (select s.ID from service s where s.identifier  = 'fvs.services.liveness')) as entityServiceId
				,'fvs.liveness.redirect.url'
				,entity_website;
				
		END IF;		

		-- Parent Entity Service Settings: OCS
		-- TODO: Check that these don't already exists, else they'll be duplicated.
		IF upper(scope_identifier) = 'OCS' THEN
		
			RAISE notice 'Parent Service Type & Service Settings: %', scope_identifier;
			
			IF ocs_ed_ws_gc IS NOT NULL AND upper(ocs_ed_ws_gc) != '' THEN
				RAISE notice 'OCS Service Type Setting: ocs.ed.ws.gc: %', ocs_ed_ws_gc;
				INSERT INTO public.entity_service_type_setting (entity_service_type_id, identifier, value)
				SELECT 	(SELECT est.ID from entity_service_type est where est.entity_id = (select e.ID from entity e where identifier = parent_identifier) and est.service_type_id = (select st.ID from service_type st where upper(st.identifier) = upper(scope_identifier))) as entityServiceTypeId
					,'ocs.ed.ws.gc'
					,ocs_ed_ws_gc;	
			ELSE
				RAISE notice 'OCS Service Setting: ocs.ed.ws.gc: NOT SUPPLIED!!!';
			END IF;
			
			IF ocs_ed_ws_usr IS NOT NULL AND upper(ocs_ed_ws_usr) != '' THEN		
				RAISE notice 'OCS Service Type Setting: ocs.ed.ws.usr: %', ocs_ed_ws_usr;	
				INSERT INTO public.entity_service_type_setting (entity_service_type_id, identifier, value)
				SELECT 	(SELECT est.ID from entity_service_type est where est.entity_id = (select e.ID from entity e where identifier = parent_identifier) and est.service_type_id = (select st.ID from service_type st where upper(st.identifier) = upper(scope_identifier))) as entityServiceTypeId
					,'ocs.ed.ws.usr'
					,ocs_ed_ws_usr;		
			ELSE	
				RAISE notice 'OCS Service Setting: ocs.ed.ws.usr: NOT SUPPLIED!!!';			
			END IF;

			IF ocs_ed_ws_pwd IS NOT NULL AND upper(ocs_ed_ws_pwd) != '' THEN
				RAISE notice 'OCS Service Type Setting: ocs.ed.ws.pwd: %', ocs_ed_ws_pwd;
				INSERT INTO public.entity_service_type_setting (entity_service_type_id, identifier, value)
				SELECT 	(SELECT est.ID from entity_service_type est where est.entity_id = (select e.ID from entity e where identifier = parent_identifier) and est.service_type_id = (select st.ID from service_type st where upper(st.identifier) = upper(scope_identifier))) as entityServiceTypeId
					,'ocs.ed.ws.pwd'
					,ocs_ed_ws_pwd;
			ELSE		
				RAISE notice 'OCS Service Setting: ocs.ed.ws.pwd: NOT SUPPLIED!!!';
			END IF;

			IF ocs_ed_sc_gc_map IS NOT NULL AND upper(ocs_ed_sc_gc_map) != '' THEN	
				RAISE notice 'OCS Service Type Setting: ocs.ed.sc.gc.map: %', ocs_ed_sc_gc_map;							
				INSERT INTO public.entity_service_type_setting (entity_service_type_id, identifier, value)
				SELECT 	(SELECT est.ID from entity_service_type est where est.entity_id = (select e.ID from entity e where identifier = parent_identifier) and est.service_type_id = (select st.ID from service_type st where upper(st.identifier) = upper(scope_identifier))) as entityServiceTypeId
					,'ocs.ed.sc.gc.map'
					,ocs_ed_sc_gc_map;
			END IF;			
			
			IF ocs_ed_ul_gc_map IS NOT NULL AND upper(ocs_ed_ul_gc_map) != '' THEN		
				RAISE notice 'OCS Service Type Setting: ocs.ed.ul.gc.map: %', ocs_ed_ul_gc_map;
				INSERT INTO public.entity_service_type_setting (entity_service_type_id, identifier, value)
				SELECT 	(SELECT est.ID from entity_service_type est where est.entity_id = (select e.ID from entity e where identifier = parent_identifier) and est.service_type_id = (select st.ID from service_type st where upper(st.identifier) = upper(scope_identifier))) as entityServiceTypeId
				,'ocs.ed.ul.gc.map'
				,ocs_ed_ul_gc_map;
			END IF;	

			IF ocs_df_scheme IS NOT NULL AND upper(ocs_df_scheme) != '' THEN		
				RAISE notice 'OCS Service Type Setting: ocs.df.scheme: %', ocs_df_scheme;
				INSERT INTO public.entity_service_type_setting (entity_service_type_id, identifier, value)
				SELECT 	(SELECT est.ID from entity_service_type est where est.entity_id = (select e.ID from entity e where identifier = parent_identifier) and est.service_type_id = (select st.ID from service_type st where upper(st.identifier) = upper(scope_identifier))) as entityServiceTypeId
				,'ocs.df.scheme'
				,ocs_df_scheme;
			END IF;	
			
			IF ocs_ed_do_sc_gc_map IS NOT NULL AND upper(ocs_ed_do_sc_gc_map) != '' THEN		
				RAISE notice 'OCS Service Type Setting: ocs.ed.do.sc.gc.map: %', ocs_ed_do_sc_gc_map;
				INSERT INTO public.entity_service_type_setting (entity_service_type_id, identifier, value)
				SELECT 	(SELECT est.ID from entity_service_type est where est.entity_id = (select e.ID from entity e where identifier = parent_identifier) and est.service_type_id = (select st.ID from service_type st where upper(st.identifier) = upper(scope_identifier))) as entityServiceTypeId
				,'ocs.ed.do.sc.gc.map'
				,ocs_ed_do_sc_gc_map;
			END IF;

			IF ocs_ed_do_gc IS NOT NULL AND upper(ocs_ed_do_gc) != '' THEN		
				RAISE notice 'OCS Service Type Setting: ocs.ed.do.gc: %', ocs_ed_do_gc;
				INSERT INTO public.entity_service_type_setting (entity_service_type_id, identifier, value)
				SELECT 	(SELECT est.ID from entity_service_type est where est.entity_id = (select e.ID from entity e where identifier = parent_identifier) and est.service_type_id = (select st.ID from service_type st where upper(st.identifier) = upper(scope_identifier))) as entityServiceTypeId
				,'ocs.ed.do.gc'
				,ocs_ed_do_gc;
			END IF;

			IF ocs_ed_passthrough IS NOT NULL AND upper(ocs_ed_passthrough) != '' THEN		
				RAISE notice 'OCS Service Type Setting: ocs.ed.passthrough: %', ocs_ed_passthrough;
				INSERT INTO public.entity_service_type_setting (entity_service_type_id, identifier, value)
				SELECT 	(SELECT est.ID from entity_service_type est where est.entity_id = (select e.ID from entity e where identifier = parent_identifier) and est.service_type_id = (select st.ID from service_type st where upper(st.identifier) = upper(scope_identifier))) as entityServiceTypeId
				,'ocs.ed.passthrough'
				,ocs_ed_passthrough;
			END IF;			
			
			IF ocs_webhook_url_mandate IS NOT NULL AND upper(ocs_webhook_url_mandate) != '' THEN		
				RAISE notice 'OCS Service Setting: ocs.webhook.url for Mandate: %', ocs_webhook_url_mandate;				
				INSERT INTO entity_service_setting (entity_service_id, identifier, value)
				SELECT 	(SELECT est.ID from entity_service est where entity_id = (select e.ID from entity e where identifier = parent_identifier) and service_id = (select s.ID from service s where upper(s.identifier) = upper('ocs.services.mandate'))) as entityServiceId
				,'ocs.webhook.url'
				,ocs_webhook_url_mandate;
			END IF;	

			IF ocs_webhook_url_collection IS NOT NULL AND upper(ocs_webhook_url_collection) != '' THEN		
				RAISE notice 'OCS Service Setting: ocs.webhook.url for Collection: %', ocs_webhook_url_collection;				
				INSERT INTO entity_service_setting (entity_service_id, identifier, value)
				SELECT 	(SELECT est.ID from entity_service est where entity_id = (select e.ID from entity e where identifier = parent_identifier) and service_id = (select s.ID from service s where upper(s.identifier) = upper('ocs.services.collection'))) as entityServiceId
				,'ocs.webhook.url'
				,ocs_webhook_url_collection;
			END IF;				
					
		END IF;	

		-- ENTITY		
		RAISE notice 'Configuring Child Entity: %', entity_identifier;
				
		-- Add the Service Type to the child entity if it does not exist
		WITH serviceType (id) AS (
			SELECT id FROM service_type st WHERE upper(st.identifier) = upper(scope_identifier)
		)
		INSERT INTO public.entity_service_type (entity_id, service_type_id, active)
			SELECT 	(SELECT e.ID FROM entity e WHERE identifier = entity_identifier) as entityId
					,st.id 
					,true
			FROM 	serviceType st
			WHERE NOT EXISTS(
				SELECT e.id from entity e 			
					INNER JOIN entity_service_type est ON est.entity_id = e.id
					INNER JOIN service_type st ON st.id = est.service_type_id
				WHERE e.identifier = entity_identifier
					AND upper(st.identifier) = upper(scope_identifier)
			);	

		-- Add the Service to the child entity if it does not exist
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
				SELECT 	(SELECT e.ID FROM entity e WHERE identifier = entity_identifier) as entityId
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
					WHERE e.identifier = entity_identifier
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
				SELECT 	(SELECT e.ID FROM entity e WHERE identifier = entity_identifier) as entityId
						,s.id 
						,true
						,false
				FROM 	service s
				WHERE NOT EXISTS(
					SELECT s.id from service s			
						INNER JOIN entity_service es ON es.service_id = s.id
						INNER JOIN entity e ON e.id = es.entity_id
					WHERE e.identifier = entity_identifier
				);
				
		END IF;		

		
	END LOOP;	
	
	RAISE notice 'parent identifier: %', parent_identifier;
	RAISE notice 'entity description: %', entity_description;	
	
	RAISE notice 'client_id: %', entity_identifier;
	RAISE notice 'client_secret: %', entity_password;	
	RAISE notice 'scopes: %', entity_scopes;		
						
END $$;