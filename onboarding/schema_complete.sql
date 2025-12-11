--
-- PostgreSQL database dump
--

-- Dumped from database version 13.20
-- Dumped by pg_dump version 17.0

-- Started on 2025-11-19 10:20:10

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- TOC entry 7 (class 2615 OID 16403)
-- Name: public; Type: SCHEMA; Schema: -; Owner: -
--

-- *not* creating schema, since initdb creates it


--
-- TOC entry 2 (class 3079 OID 16404)
-- Name: pgcrypto; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA public;


--
-- TOC entry 4257 (class 0 OID 0)
-- Dependencies: 2
-- Name: EXTENSION pgcrypto; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION pgcrypto IS 'cryptographic functions';


--
-- TOC entry 3 (class 3079 OID 16405)
-- Name: uuid-ossp; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA public;


--
-- TOC entry 4258 (class 0 OID 0)
-- Dependencies: 3
-- Name: EXTENSION "uuid-ossp"; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION "uuid-ossp" IS 'generate universally unique identifiers (UUIDs)';


--
-- TOC entry 251 (class 1255 OID 16408)
-- Name: create_entity_users(text, text, text, text, text, text, text, text, text); Type: PROCEDURE; Schema: public; Owner: -
--

CREATE PROCEDURE public.create_entity_users(par_desc text, ent_desc text, ent_usr text, ent_pwd text, mrc_id text, app_key text, mrc_usr text, aut_enb text, pym_enb text)
    LANGUAGE plpgsql
    AS $$
DECLARE 
    parent_description TEXT := par_desc;
    entity_description TEXT := ent_desc;
    entity_username TEXT := ent_usr;
    entity_password TEXT := ent_pwd;
    entity_service_types TEXT[] := array[
        ['CMS', 'true', null, null],
        ['TCA', 'true', null, null],
        ['OCS', 'true', null, null]
    ];

    tca_application_key TEXT := app_key;
    tca_merchant_id TEXT := mrc_id;
    tca_merchant_username TEXT := mrc_usr;
    app_mandate_authentication_enabled TEXT := aut_enb;
    app_payments_enabled TEXT := pym_enb;

    webservice_username TEXT := 'TelkomTT3';
    webservice_password TEXT := '1740ee755b2bbd0a34cdc1c7fe56cbd500bac3b7c6e698049a6caff2d4718395';

    parent_identifier TEXT;
    entity_identifier TEXT;
    entity_service_type TEXT[];
    entity_scopes TEXT := '';

    scope_identifier TEXT;
    rate_limit BOOLEAN;
    limit_count INTEGER;
    limit_period TEXT;
BEGIN
    -- Generate parent and entity identifiers
    SELECT UPPER(uuid_generate_v4()::varchar) INTO parent_identifier;
    SELECT uuid_generate_v4()::varchar INTO entity_identifier;

    -- Check if parent entity exists
    SELECT identifier INTO parent_identifier FROM public.entity WHERE LOWER(description) = LOWER(parent_description);

    -- Insert entity if not exists
    INSERT INTO public.entity (description, identifier, lookup_entity_type_id, active, parent_id)
    SELECT entity_description, entity_identifier, (SELECT id FROM lookup_entity_type WHERE description = 'User'), TRUE, 
           (SELECT id FROM entity WHERE identifier = parent_identifier)
    WHERE NOT EXISTS (SELECT id FROM public.entity WHERE LOWER(description) = LOWER(entity_description));

    -- Get identifier of newly inserted entity
    SELECT identifier INTO entity_identifier FROM public.entity WHERE LOWER(description) = LOWER(entity_description);

    -- Insert user
    INSERT INTO public."user" (entity_id, username, password, email_address, active)
    SELECT (SELECT id FROM entity WHERE identifier = entity_identifier), entity_username,
           (SELECT ENCODE(DIGEST(entity_password, 'sha256'), 'base64')), 'corne.smith@ignitefitness.com', TRUE
    WHERE NOT EXISTS (
        SELECT i.id FROM public.integrator i
        INNER JOIN public.entity e ON e.id = i.entity_id
        WHERE LOWER(e.identifier) = LOWER(entity_identifier)
    );

    -- Process each entity service type
    FOREACH entity_service_type SLICE 1 IN ARRAY entity_service_types LOOP
        SELECT UPPER(entity_service_type[1]) INTO scope_identifier;
        SELECT entity_service_type[2]::BOOLEAN INTO rate_limit;
        SELECT entity_service_type[3]::INTEGER INTO limit_count;
        SELECT entity_service_type[4] INTO limit_period;

        -- Append scopes
        SELECT entity_scopes || ' ' || LOWER(scope_identifier) INTO entity_scopes;

        -- Add Service Type to entity
        WITH serviceType (id) AS (
            SELECT id FROM service_type WHERE UPPER(identifier) = UPPER(scope_identifier)
        )
        INSERT INTO public.entity_service_type (entity_id, service_type_id, active)
        SELECT (SELECT id FROM entity WHERE identifier = entity_identifier), st.id, TRUE
        FROM serviceType st
        WHERE NOT EXISTS (
            SELECT e.id FROM entity e
            INNER JOIN entity_service_type est ON est.entity_id = e.id
            INNER JOIN service_type st ON st.id = est.service_type_id
            WHERE e.identifier = entity_identifier AND UPPER(st.identifier) = UPPER(scope_identifier)
        );

        -- Add Service to entity
        IF rate_limit THEN
            WITH service (id) AS (
                SELECT s.id FROM service s WHERE s.service_type_id IN (
                    SELECT id FROM service_type WHERE UPPER(identifier) = UPPER(scope_identifier)
                )
            )
            INSERT INTO public.entity_service (entity_id, service_id, active, rate_limit, limit_count, limit_period)
            SELECT (SELECT id FROM entity WHERE identifier = entity_identifier), s.id, TRUE, TRUE, limit_count, limit_period
            FROM service s
            WHERE NOT EXISTS (
                SELECT s.id FROM service s
                INNER JOIN entity_service es ON es.service_id = s.id
                INNER JOIN entity e ON e.id = es.entity_id
                WHERE e.identifier = entity_identifier
            );
        ELSE
            WITH service (id) AS (
                SELECT s.id FROM service s WHERE s.service_type_id IN (
                    SELECT id FROM service_type WHERE UPPER(identifier) = UPPER(scope_identifier)
                )
            )
            INSERT INTO public.entity_service (entity_id, service_id, active, rate_limit)
            SELECT (SELECT id FROM entity WHERE identifier = entity_identifier), s.id, TRUE, FALSE
            FROM service s
            WHERE NOT EXISTS (
                SELECT s.id FROM service s
                INNER JOIN entity_service es ON es.service_id = s.id
                INNER JOIN entity e ON e.id = es.entity_id
                WHERE e.identifier = entity_identifier
            );
        END IF;

        -- Insert TCA-specific settings
        IF UPPER(scope_identifier) = 'TCA' THEN
            IF tca_application_key IS NOT NULL AND UPPER(tca_application_key) != '' THEN
                INSERT INTO public.entity_service_type_setting (entity_service_type_id, identifier, value)
                SELECT (SELECT id FROM entity_service_type WHERE entity_id = (SELECT id FROM entity WHERE identifier = entity_identifier) AND service_type_id = (SELECT id FROM service_type WHERE UPPER(identifier) = UPPER(scope_identifier))), 
                       'tca.application.key', tca_application_key;
            END IF;

            IF tca_merchant_id IS NOT NULL AND UPPER(tca_merchant_id) != '' THEN
                INSERT INTO public.entity_service_type_setting (entity_service_type_id, identifier, value)
                SELECT (SELECT id FROM entity_service_type WHERE entity_id = (SELECT id FROM entity WHERE identifier = entity_identifier) AND service_type_id = (SELECT id FROM service_type WHERE UPPER(identifier) = UPPER(scope_identifier))), 
                       'tca.merchant.id', tca_merchant_id;
            END IF;

            IF tca_merchant_username IS NOT NULL AND UPPER(tca_merchant_username) != '' THEN
                INSERT INTO public.entity_service_type_setting (entity_service_type_id, identifier, value)
                SELECT (SELECT id FROM entity_service_type WHERE entity_id = (SELECT id FROM entity WHERE identifier = entity_identifier) AND service_type_id = (SELECT id FROM service_type WHERE UPPER(identifier) = UPPER(scope_identifier))), 
                       'tca.merchant.username', tca_merchant_username;
            END IF;

            IF app_mandate_authentication_enabled IS NOT NULL AND UPPER(app_mandate_authentication_enabled) != '' THEN
                INSERT INTO public.entity_service_type_setting (entity_service_type_id, identifier, value)
                SELECT (SELECT id FROM entity_service_type WHERE entity_id = (SELECT id FROM entity WHERE identifier = entity_identifier) AND service_type_id = (SELECT id FROM service_type WHERE UPPER(identifier) = UPPER(scope_identifier))), 
                       'app.mandate.authentication.enabled', app_mandate_authentication_enabled;
            END IF;

            IF app_payments_enabled IS NOT NULL AND UPPER(app_payments_enabled) != '' THEN
                INSERT INTO public.entity_service_type_setting (entity_service_type_id, identifier, value)
                SELECT (SELECT id FROM entity_service_type WHERE entity_id = (SELECT id FROM entity WHERE identifier = entity_identifier) AND service_type_id = (SELECT id FROM service_type WHERE UPPER(identifier) = UPPER(scope_identifier))), 
                       'app.payments.enabled', app_payments_enabled;
            END IF;
        END IF;
    END LOOP;

    RAISE NOTICE 'Parent identifier: %', parent_identifier;
    RAISE NOTICE 'Entity description: %', entity_description;
    RAISE NOTICE 'Username: %', entity_username;
    RAISE NOTICE 'Password: %', entity_password;
    RAISE NOTICE 'Scopes: %', entity_scopes;
END;
$$;


--
-- TOC entry 297 (class 1255 OID 16445)
-- Name: setup_integrator(text, text, text, text, text, text, text, text, text); Type: PROCEDURE; Schema: public; Owner: -
--

CREATE PROCEDURE public.setup_integrator(par_desc text, ws_gc text, ws_usr text, ws_pwd text, ocs_schm text, ocs_gc text, bss_webhook_url text DEFAULT NULL::text, ocs_webhook_url_mandate text DEFAULT NULL::text, ocs_webhook_url_collection text DEFAULT NULL::text)
    LANGUAGE plpgsql
    AS $$
DECLARE
    parent_description TEXT := par_desc; 
    entity_website TEXT := 'https://www.bitventure.co.za/';
    entity_service_types TEXT[] := array[
        ['OCS', 'true', null, null]
    ];

    -- OCS Settings
    ocs_ed_ws_gc TEXT := ws_gc;
    ocs_ed_ws_usr TEXT := ws_usr;
    ocs_ed_ws_pwd TEXT := ws_pwd;
    ocs_df_scheme TEXT := ocs_schm;
    ocs_ed_sc_gc_map TEXT := '[{"map": "' || ocs_gc || '"}]';
    ocs_ed_ul_gc_map TEXT;

    -- Variables generated/used within the script
    parent_identifier TEXT;
    entity_identifier TEXT;
    entity_description TEXT;
    entity_password TEXT;
    entity_service_type TEXT[];
    entity_scopes TEXT := '';

    -- Entity service type array elements
    scope_identifier TEXT;
    rate_limit BOOLEAN;
    limit_count INTEGER;
    limit_period TEXT;
BEGIN
    -- Example logic for parent and entity inserts

    -- Parent entity insertion
    SELECT parent_description || ' :Integrator' INTO entity_description;
    SELECT UPPER(uuid_generate_v4()::varchar) INTO parent_identifier;
    SELECT uuid_generate_v4()::varchar INTO entity_identifier;
    SELECT uuid_generate_v4()::varchar INTO entity_password;

    -- Insert parent entity
    INSERT INTO public.entity (description, identifier, lookup_entity_type_id, active)
    SELECT parent_description, parent_identifier, 1, true
    WHERE NOT EXISTS(
        SELECT id FROM public.entity WHERE LOWER(description) = LOWER(parent_description)
    );

    -- Retrieve parent identifier if not inserted
    SELECT identifier INTO parent_identifier FROM public.entity WHERE LOWER(description) = LOWER(parent_description);

    -- Insert entity (Integrator Entity Type)
    INSERT INTO public.entity (description, identifier, lookup_entity_type_id, active, parent_id)
    SELECT entity_description, entity_identifier, 
           (SELECT id FROM lookup_entity_type WHERE description = 'Integrator'),
           true, 
           (SELECT id FROM entity WHERE identifier = parent_identifier)
    WHERE NOT EXISTS(
        SELECT id FROM public.entity WHERE LOWER(description) = LOWER(entity_description)
    );

    -- Other logic to process service types, settings, and child entities...

    -- Commit the transaction
    COMMIT;
END;
$$;


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 202 (class 1259 OID 16864)
-- Name: changelog; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.changelog (
    id integer NOT NULL,
    type smallint,
    version character varying(50),
    description character varying(200) NOT NULL,
    name character varying(300) NOT NULL,
    checksum character varying(32),
    installed_by character varying(100) NOT NULL,
    installed_on timestamp without time zone DEFAULT now() NOT NULL,
    success boolean NOT NULL
);


--
-- TOC entry 203 (class 1259 OID 16871)
-- Name: changelog_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.changelog_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 4259 (class 0 OID 0)
-- Dependencies: 203
-- Name: changelog_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.changelog_id_seq OWNED BY public.changelog.id;


--
-- TOC entry 204 (class 1259 OID 16873)
-- Name: end_point; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.end_point (
    id integer NOT NULL,
    identifier character varying(100) NOT NULL,
    display_text character varying(100) NOT NULL,
    description character varying(250) NOT NULL,
    end_point character varying(100) NOT NULL
);


--
-- TOC entry 205 (class 1259 OID 16879)
-- Name: end_point_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.end_point_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 4260 (class 0 OID 0)
-- Dependencies: 205
-- Name: end_point_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.end_point_id_seq OWNED BY public.end_point.id;


--
-- TOC entry 206 (class 1259 OID 16881)
-- Name: entity; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.entity (
    id integer NOT NULL,
    description character varying(250) NOT NULL,
    identifier character varying(250) NOT NULL,
    lookup_entity_type_id integer NOT NULL,
    active boolean DEFAULT true,
    parent_id integer,
    last_updated timestamp without time zone DEFAULT now()
);


--
-- TOC entry 207 (class 1259 OID 16889)
-- Name: entity_end_point; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.entity_end_point (
    id integer NOT NULL,
    entity_id integer,
    end_point_id integer,
    active boolean DEFAULT true NOT NULL
);


--
-- TOC entry 208 (class 1259 OID 16893)
-- Name: entity_end_point_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.entity_end_point_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 4261 (class 0 OID 0)
-- Dependencies: 208
-- Name: entity_end_point_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.entity_end_point_id_seq OWNED BY public.entity_end_point.id;


--
-- TOC entry 209 (class 1259 OID 16895)
-- Name: entity_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.entity_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 4262 (class 0 OID 0)
-- Dependencies: 209
-- Name: entity_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.entity_id_seq OWNED BY public.entity.id;


--
-- TOC entry 210 (class 1259 OID 16897)
-- Name: entity_service; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.entity_service (
    id integer NOT NULL,
    entity_id integer NOT NULL,
    service_id integer NOT NULL,
    active boolean DEFAULT true,
    rate_limit boolean DEFAULT false NOT NULL,
    limit_count integer,
    limit_period character varying(10)
);


--
-- TOC entry 211 (class 1259 OID 16902)
-- Name: entity_service_field; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.entity_service_field (
    id integer NOT NULL,
    entity_service_id integer NOT NULL,
    field_id integer NOT NULL
);


--
-- TOC entry 212 (class 1259 OID 16905)
-- Name: entity_service_field_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.entity_service_field_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 4263 (class 0 OID 0)
-- Dependencies: 212
-- Name: entity_service_field_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.entity_service_field_id_seq OWNED BY public.entity_service_field.id;


--
-- TOC entry 213 (class 1259 OID 16907)
-- Name: entity_service_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.entity_service_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 4264 (class 0 OID 0)
-- Dependencies: 213
-- Name: entity_service_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.entity_service_id_seq OWNED BY public.entity_service.id;


--
-- TOC entry 214 (class 1259 OID 16909)
-- Name: entity_service_setting; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.entity_service_setting (
    id integer NOT NULL,
    entity_service_id integer NOT NULL,
    identifier character varying(100) NOT NULL,
    value text NOT NULL
);


--
-- TOC entry 215 (class 1259 OID 16915)
-- Name: entity_service_setting_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.entity_service_setting_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 4265 (class 0 OID 0)
-- Dependencies: 215
-- Name: entity_service_setting_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.entity_service_setting_id_seq OWNED BY public.entity_service_setting.id;


--
-- TOC entry 216 (class 1259 OID 16917)
-- Name: entity_service_type; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.entity_service_type (
    id integer NOT NULL,
    entity_id integer NOT NULL,
    service_type_id integer NOT NULL,
    active boolean DEFAULT true
);


--
-- TOC entry 217 (class 1259 OID 16921)
-- Name: entity_service_type_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.entity_service_type_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 4266 (class 0 OID 0)
-- Dependencies: 217
-- Name: entity_service_type_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.entity_service_type_id_seq OWNED BY public.entity_service_type.id;


--
-- TOC entry 218 (class 1259 OID 16923)
-- Name: entity_service_type_setting; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.entity_service_type_setting (
    id integer NOT NULL,
    entity_service_type_id integer NOT NULL,
    identifier character varying(100) NOT NULL,
    value text NOT NULL
);


--
-- TOC entry 219 (class 1259 OID 16929)
-- Name: entity_service_type_setting_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.entity_service_type_setting_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 4267 (class 0 OID 0)
-- Dependencies: 219
-- Name: entity_service_type_setting_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.entity_service_type_setting_id_seq OWNED BY public.entity_service_type_setting.id;


--
-- TOC entry 220 (class 1259 OID 16931)
-- Name: field; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.field (
    id integer NOT NULL,
    description text NOT NULL,
    display_text character varying(100) NOT NULL,
    identifier character varying(100) NOT NULL
);


--
-- TOC entry 221 (class 1259 OID 16937)
-- Name: field_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.field_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 4268 (class 0 OID 0)
-- Dependencies: 221
-- Name: field_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.field_id_seq OWNED BY public.field.id;


--
-- TOC entry 222 (class 1259 OID 16939)
-- Name: integrator; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.integrator (
    id integer NOT NULL,
    entity_id integer NOT NULL,
    client_secret character varying(200) NOT NULL,
    email_address character varying(200) NOT NULL,
    active boolean DEFAULT false NOT NULL
);


--
-- TOC entry 223 (class 1259 OID 16943)
-- Name: integrator_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.integrator_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 4269 (class 0 OID 0)
-- Dependencies: 223
-- Name: integrator_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.integrator_id_seq OWNED BY public.integrator.id;


--
-- TOC entry 224 (class 1259 OID 16945)
-- Name: lookup_entity_type; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.lookup_entity_type (
    id integer NOT NULL,
    description character varying(250) NOT NULL
);


--
-- TOC entry 225 (class 1259 OID 16948)
-- Name: lookup_entity_type_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.lookup_entity_type_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 4270 (class 0 OID 0)
-- Dependencies: 225
-- Name: lookup_entity_type_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.lookup_entity_type_id_seq OWNED BY public.lookup_entity_type.id;


--
-- TOC entry 226 (class 1259 OID 16950)
-- Name: provider; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.provider (
    id integer NOT NULL,
    description character varying(250) NOT NULL,
    identifier character varying(100) NOT NULL
);


--
-- TOC entry 227 (class 1259 OID 16953)
-- Name: provider_field; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.provider_field (
    id integer NOT NULL,
    provider_id integer NOT NULL,
    field_id integer NOT NULL
);


--
-- TOC entry 228 (class 1259 OID 16956)
-- Name: provider_field_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.provider_field_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 4271 (class 0 OID 0)
-- Dependencies: 228
-- Name: provider_field_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.provider_field_id_seq OWNED BY public.provider_field.id;


--
-- TOC entry 229 (class 1259 OID 16958)
-- Name: provider_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.provider_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 4272 (class 0 OID 0)
-- Dependencies: 229
-- Name: provider_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.provider_id_seq OWNED BY public.provider.id;


--
-- TOC entry 230 (class 1259 OID 16960)
-- Name: request; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.request (
    id integer NOT NULL,
    guid character varying(250) NOT NULL,
    entity_id integer,
    end_point_id integer,
    request jsonb NOT NULL,
    request_received timestamp without time zone DEFAULT now() NOT NULL,
    response jsonb,
    response_submitted timestamp without time zone,
    ip_address character varying(100),
    uri character varying(200),
    http_status_code integer
);


--
-- TOC entry 231 (class 1259 OID 16967)
-- Name: service_request; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.service_request (
    id integer NOT NULL,
    request_received timestamp without time zone DEFAULT now(),
    request_receipt character varying(300),
    service_id integer,
    entity_id integer
);


--
-- TOC entry 232 (class 1259 OID 16971)
-- Name: request_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.request_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 4273 (class 0 OID 0)
-- Dependencies: 232
-- Name: request_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.request_id_seq OWNED BY public.service_request.id;


--
-- TOC entry 233 (class 1259 OID 16973)
-- Name: request_id_seq1; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.request_id_seq1
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 4274 (class 0 OID 0)
-- Dependencies: 233
-- Name: request_id_seq1; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.request_id_seq1 OWNED BY public.request.id;


--
-- TOC entry 234 (class 1259 OID 16975)
-- Name: service; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.service (
    id integer NOT NULL,
    service_type_id integer NOT NULL,
    identifier character varying(100) NOT NULL,
    display_text character varying(100) NOT NULL,
    description character varying(250) NOT NULL,
    end_point character varying(250) NOT NULL,
    active boolean DEFAULT true NOT NULL
);


--
-- TOC entry 235 (class 1259 OID 16982)
-- Name: service_field; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.service_field (
    id integer NOT NULL,
    service_id integer NOT NULL,
    field_id integer NOT NULL,
    direction character varying(10) NOT NULL
);


--
-- TOC entry 236 (class 1259 OID 16985)
-- Name: service_field_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.service_field_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 4275 (class 0 OID 0)
-- Dependencies: 236
-- Name: service_field_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.service_field_id_seq OWNED BY public.service_field.id;


--
-- TOC entry 237 (class 1259 OID 16987)
-- Name: service_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.service_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 4276 (class 0 OID 0)
-- Dependencies: 237
-- Name: service_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.service_id_seq OWNED BY public.service.id;


--
-- TOC entry 238 (class 1259 OID 16989)
-- Name: service_type; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.service_type (
    id integer NOT NULL,
    identifier character varying(100) NOT NULL,
    description character varying(250) NOT NULL,
    active boolean DEFAULT true NOT NULL,
    scope character varying(150) DEFAULT ''::character varying NOT NULL,
    token_lifetime integer,
    allow_refresh_token boolean DEFAULT true NOT NULL
);


--
-- TOC entry 239 (class 1259 OID 16998)
-- Name: service_type_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.service_type_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 4277 (class 0 OID 0)
-- Dependencies: 239
-- Name: service_type_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.service_type_id_seq OWNED BY public.service_type.id;


--
-- TOC entry 240 (class 1259 OID 17000)
-- Name: service_type_setting; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.service_type_setting (
    id integer NOT NULL,
    setting_id integer NOT NULL,
    service_type_id integer NOT NULL,
    active boolean DEFAULT true NOT NULL
);


--
-- TOC entry 241 (class 1259 OID 17004)
-- Name: service_type_setting_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.service_type_setting_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 4278 (class 0 OID 0)
-- Dependencies: 241
-- Name: service_type_setting_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.service_type_setting_id_seq OWNED BY public.service_type_setting.id;


--
-- TOC entry 242 (class 1259 OID 17006)
-- Name: setting; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.setting (
    id integer NOT NULL,
    identifier character varying(100) NOT NULL,
    display_text character varying(100) NOT NULL,
    description text NOT NULL
);


--
-- TOC entry 243 (class 1259 OID 17012)
-- Name: setting_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.setting_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 4279 (class 0 OID 0)
-- Dependencies: 243
-- Name: setting_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.setting_id_seq OWNED BY public.setting.id;


--
-- TOC entry 244 (class 1259 OID 17014)
-- Name: user; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."user" (
    entity_id integer NOT NULL,
    username character varying(100) NOT NULL,
    password character varying(100) NOT NULL,
    email_address character varying(200) NOT NULL,
    active boolean DEFAULT false NOT NULL,
    id integer NOT NULL
);


--
-- TOC entry 245 (class 1259 OID 17018)
-- Name: user_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.user_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 4280 (class 0 OID 0)
-- Dependencies: 245
-- Name: user_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.user_id_seq OWNED BY public."user".entity_id;


--
-- TOC entry 246 (class 1259 OID 17020)
-- Name: user_id_seq1; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.user_id_seq1
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 4281 (class 0 OID 0)
-- Dependencies: 246
-- Name: user_id_seq1; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.user_id_seq1 OWNED BY public."user".id;


--
-- TOC entry 248 (class 1259 OID 17283)
-- Name: zee_test_delete; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.zee_test_delete (
    id integer NOT NULL,
    first_name character varying(50) NOT NULL,
    last_name character varying(50) NOT NULL,
    email character varying(100),
    hire_date date,
    salary numeric(10,2)
);


--
-- TOC entry 247 (class 1259 OID 17281)
-- Name: zee_test_delete_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.zee_test_delete_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 4282 (class 0 OID 0)
-- Dependencies: 247
-- Name: zee_test_delete_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.zee_test_delete_id_seq OWNED BY public.zee_test_delete.id;


--
-- TOC entry 4009 (class 2604 OID 16474)
-- Name: changelog id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.changelog ALTER COLUMN id SET DEFAULT nextval('public.changelog_id_seq'::regclass);


--
-- TOC entry 4011 (class 2604 OID 16475)
-- Name: end_point id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.end_point ALTER COLUMN id SET DEFAULT nextval('public.end_point_id_seq'::regclass);


--
-- TOC entry 4012 (class 2604 OID 16476)
-- Name: entity id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.entity ALTER COLUMN id SET DEFAULT nextval('public.entity_id_seq'::regclass);


--
-- TOC entry 4015 (class 2604 OID 16477)
-- Name: entity_end_point id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.entity_end_point ALTER COLUMN id SET DEFAULT nextval('public.entity_end_point_id_seq'::regclass);


--
-- TOC entry 4017 (class 2604 OID 16478)
-- Name: entity_service id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.entity_service ALTER COLUMN id SET DEFAULT nextval('public.entity_service_id_seq'::regclass);


--
-- TOC entry 4020 (class 2604 OID 16479)
-- Name: entity_service_field id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.entity_service_field ALTER COLUMN id SET DEFAULT nextval('public.entity_service_field_id_seq'::regclass);


--
-- TOC entry 4021 (class 2604 OID 16480)
-- Name: entity_service_setting id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.entity_service_setting ALTER COLUMN id SET DEFAULT nextval('public.entity_service_setting_id_seq'::regclass);


--
-- TOC entry 4022 (class 2604 OID 16481)
-- Name: entity_service_type id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.entity_service_type ALTER COLUMN id SET DEFAULT nextval('public.entity_service_type_id_seq'::regclass);


--
-- TOC entry 4024 (class 2604 OID 16482)
-- Name: entity_service_type_setting id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.entity_service_type_setting ALTER COLUMN id SET DEFAULT nextval('public.entity_service_type_setting_id_seq'::regclass);


--
-- TOC entry 4025 (class 2604 OID 16483)
-- Name: field id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.field ALTER COLUMN id SET DEFAULT nextval('public.field_id_seq'::regclass);


--
-- TOC entry 4026 (class 2604 OID 16484)
-- Name: integrator id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.integrator ALTER COLUMN id SET DEFAULT nextval('public.integrator_id_seq'::regclass);


--
-- TOC entry 4028 (class 2604 OID 16485)
-- Name: lookup_entity_type id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.lookup_entity_type ALTER COLUMN id SET DEFAULT nextval('public.lookup_entity_type_id_seq'::regclass);


--
-- TOC entry 4029 (class 2604 OID 16486)
-- Name: provider id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.provider ALTER COLUMN id SET DEFAULT nextval('public.provider_id_seq'::regclass);


--
-- TOC entry 4030 (class 2604 OID 16487)
-- Name: provider_field id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.provider_field ALTER COLUMN id SET DEFAULT nextval('public.provider_field_id_seq'::regclass);


--
-- TOC entry 4031 (class 2604 OID 16488)
-- Name: request id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.request ALTER COLUMN id SET DEFAULT nextval('public.request_id_seq1'::regclass);


--
-- TOC entry 4035 (class 2604 OID 16489)
-- Name: service id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.service ALTER COLUMN id SET DEFAULT nextval('public.service_id_seq'::regclass);


--
-- TOC entry 4037 (class 2604 OID 16490)
-- Name: service_field id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.service_field ALTER COLUMN id SET DEFAULT nextval('public.service_field_id_seq'::regclass);


--
-- TOC entry 4033 (class 2604 OID 16491)
-- Name: service_request id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.service_request ALTER COLUMN id SET DEFAULT nextval('public.request_id_seq'::regclass);


--
-- TOC entry 4038 (class 2604 OID 16492)
-- Name: service_type id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.service_type ALTER COLUMN id SET DEFAULT nextval('public.service_type_id_seq'::regclass);


--
-- TOC entry 4042 (class 2604 OID 16493)
-- Name: service_type_setting id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.service_type_setting ALTER COLUMN id SET DEFAULT nextval('public.service_type_setting_id_seq'::regclass);


--
-- TOC entry 4044 (class 2604 OID 16494)
-- Name: setting id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.setting ALTER COLUMN id SET DEFAULT nextval('public.setting_id_seq'::regclass);


--
-- TOC entry 4045 (class 2604 OID 16495)
-- Name: user entity_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."user" ALTER COLUMN entity_id SET DEFAULT nextval('public.user_id_seq'::regclass);


--
-- TOC entry 4047 (class 2604 OID 16496)
-- Name: user id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."user" ALTER COLUMN id SET DEFAULT nextval('public.user_id_seq1'::regclass);


--
-- TOC entry 4048 (class 2604 OID 16497)
-- Name: zee_test_delete id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.zee_test_delete ALTER COLUMN id SET DEFAULT nextval('public.zee_test_delete_id_seq'::regclass);


--
-- TOC entry 4050 (class 2606 OID 16498)
-- Name: changelog changelog_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.changelog
    ADD CONSTRAINT changelog_pkey PRIMARY KEY (id);


--
-- TOC entry 4052 (class 2606 OID 16499)
-- Name: end_point pk_end_point; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.end_point
    ADD CONSTRAINT pk_end_point PRIMARY KEY (id);


--
-- TOC entry 4054 (class 2606 OID 16500)
-- Name: entity pk_entity; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.entity
    ADD CONSTRAINT pk_entity PRIMARY KEY (id);


--
-- TOC entry 4056 (class 2606 OID 16501)
-- Name: entity_end_point pk_entity_end_point; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.entity_end_point
    ADD CONSTRAINT pk_entity_end_point PRIMARY KEY (id);


--
-- TOC entry 4058 (class 2606 OID 16502)
-- Name: entity_service pk_entity_service; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.entity_service
    ADD CONSTRAINT pk_entity_service PRIMARY KEY (id);


--
-- TOC entry 4060 (class 2606 OID 16503)
-- Name: entity_service_field pk_entity_service_field; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.entity_service_field
    ADD CONSTRAINT pk_entity_service_field PRIMARY KEY (id);


--
-- TOC entry 4062 (class 2606 OID 16504)
-- Name: entity_service_setting pk_entity_service_setting; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.entity_service_setting
    ADD CONSTRAINT pk_entity_service_setting PRIMARY KEY (id);


--
-- TOC entry 4064 (class 2606 OID 16506)
-- Name: entity_service_type pk_entity_service_type; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.entity_service_type
    ADD CONSTRAINT pk_entity_service_type PRIMARY KEY (id);


--
-- TOC entry 4066 (class 2606 OID 16507)
-- Name: entity_service_type_setting pk_entity_service_type_setting; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.entity_service_type_setting
    ADD CONSTRAINT pk_entity_service_type_setting PRIMARY KEY (id);


--
-- TOC entry 4068 (class 2606 OID 16508)
-- Name: field pk_field; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.field
    ADD CONSTRAINT pk_field PRIMARY KEY (id);


--
-- TOC entry 4070 (class 2606 OID 16509)
-- Name: integrator pk_integrator; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.integrator
    ADD CONSTRAINT pk_integrator PRIMARY KEY (id);


--
-- TOC entry 4072 (class 2606 OID 16510)
-- Name: lookup_entity_type pk_lookup_entity_type; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.lookup_entity_type
    ADD CONSTRAINT pk_lookup_entity_type PRIMARY KEY (id);


--
-- TOC entry 4074 (class 2606 OID 16511)
-- Name: provider pk_provider; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.provider
    ADD CONSTRAINT pk_provider PRIMARY KEY (id);


--
-- TOC entry 4076 (class 2606 OID 16512)
-- Name: provider_field pk_provider_field; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.provider_field
    ADD CONSTRAINT pk_provider_field PRIMARY KEY (id);


--
-- TOC entry 4078 (class 2606 OID 16513)
-- Name: request pk_request; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.request
    ADD CONSTRAINT pk_request PRIMARY KEY (id);


--
-- TOC entry 4082 (class 2606 OID 16514)
-- Name: service pk_service; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.service
    ADD CONSTRAINT pk_service PRIMARY KEY (id);


--
-- TOC entry 4084 (class 2606 OID 16515)
-- Name: service_field pk_service_field; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.service_field
    ADD CONSTRAINT pk_service_field PRIMARY KEY (id);


--
-- TOC entry 4080 (class 2606 OID 16516)
-- Name: service_request pk_service_request; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.service_request
    ADD CONSTRAINT pk_service_request PRIMARY KEY (id);


--
-- TOC entry 4086 (class 2606 OID 16517)
-- Name: service_type pk_service_type; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.service_type
    ADD CONSTRAINT pk_service_type PRIMARY KEY (id);


--
-- TOC entry 4088 (class 2606 OID 16518)
-- Name: service_type_setting pk_service_type_setting; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.service_type_setting
    ADD CONSTRAINT pk_service_type_setting PRIMARY KEY (id);


--
-- TOC entry 4090 (class 2606 OID 16519)
-- Name: setting pk_setting; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.setting
    ADD CONSTRAINT pk_setting PRIMARY KEY (id);


--
-- TOC entry 4092 (class 2606 OID 16520)
-- Name: user user_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."user"
    ADD CONSTRAINT user_pkey PRIMARY KEY (id);


--
-- TOC entry 4094 (class 2606 OID 16521)
-- Name: zee_test_delete zee_test_delete_email_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.zee_test_delete
    ADD CONSTRAINT zee_test_delete_email_key UNIQUE (email);


--
-- TOC entry 4096 (class 2606 OID 16522)
-- Name: zee_test_delete zee_test_delete_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.zee_test_delete
    ADD CONSTRAINT zee_test_delete_pkey PRIMARY KEY (id);


--
-- TOC entry 4099 (class 2606 OID 16523)
-- Name: entity_end_point fk_entity_end_point_end_point_id; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.entity_end_point
    ADD CONSTRAINT fk_entity_end_point_end_point_id FOREIGN KEY (end_point_id) REFERENCES public.end_point(id);


--
-- TOC entry 4100 (class 2606 OID 16528)
-- Name: entity_end_point fk_entity_end_point_entity_id; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.entity_end_point
    ADD CONSTRAINT fk_entity_end_point_entity_id FOREIGN KEY (entity_id) REFERENCES public.entity(id);


--
-- TOC entry 4097 (class 2606 OID 16533)
-- Name: entity fk_entity_entity; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.entity
    ADD CONSTRAINT fk_entity_entity FOREIGN KEY (parent_id) REFERENCES public.entity(id);


--
-- TOC entry 4098 (class 2606 OID 16538)
-- Name: entity fk_entity_lookup_entity_type; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.entity
    ADD CONSTRAINT fk_entity_lookup_entity_type FOREIGN KEY (lookup_entity_type_id) REFERENCES public.lookup_entity_type(id);


--
-- TOC entry 4101 (class 2606 OID 16543)
-- Name: entity_service fk_entity_service_entity; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.entity_service
    ADD CONSTRAINT fk_entity_service_entity FOREIGN KEY (entity_id) REFERENCES public.entity(id);


--
-- TOC entry 4103 (class 2606 OID 16548)
-- Name: entity_service_field fk_entity_service_field_entity_service; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.entity_service_field
    ADD CONSTRAINT fk_entity_service_field_entity_service FOREIGN KEY (entity_service_id) REFERENCES public.entity_service(id);


--
-- TOC entry 4104 (class 2606 OID 16553)
-- Name: entity_service_field fk_entity_service_field_field; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.entity_service_field
    ADD CONSTRAINT fk_entity_service_field_field FOREIGN KEY (field_id) REFERENCES public.field(id);


--
-- TOC entry 4102 (class 2606 OID 16558)
-- Name: entity_service fk_entity_service_service; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.entity_service
    ADD CONSTRAINT fk_entity_service_service FOREIGN KEY (service_id) REFERENCES public.service(id);


--
-- TOC entry 4105 (class 2606 OID 16563)
-- Name: entity_service_setting fk_entity_service_setting_entity_service; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.entity_service_setting
    ADD CONSTRAINT fk_entity_service_setting_entity_service FOREIGN KEY (entity_service_id) REFERENCES public.entity_service(id);


--
-- TOC entry 4106 (class 2606 OID 16568)
-- Name: entity_service_type fk_entity_service_type_entity_id; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.entity_service_type
    ADD CONSTRAINT fk_entity_service_type_entity_id FOREIGN KEY (entity_id) REFERENCES public.entity(id);


--
-- TOC entry 4107 (class 2606 OID 16573)
-- Name: entity_service_type fk_entity_service_type_service_type_id; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.entity_service_type
    ADD CONSTRAINT fk_entity_service_type_service_type_id FOREIGN KEY (service_type_id) REFERENCES public.service_type(id);


--
-- TOC entry 4108 (class 2606 OID 16578)
-- Name: entity_service_type_setting fk_entity_service_type_setting_entity_service_type_id; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.entity_service_type_setting
    ADD CONSTRAINT fk_entity_service_type_setting_entity_service_type_id FOREIGN KEY (entity_service_type_id) REFERENCES public.entity_service_type(id);


--
-- TOC entry 4109 (class 2606 OID 16583)
-- Name: integrator fk_integrator_entity; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.integrator
    ADD CONSTRAINT fk_integrator_entity FOREIGN KEY (entity_id) REFERENCES public.entity(id);


--
-- TOC entry 4110 (class 2606 OID 16588)
-- Name: provider_field fk_provider_field_field; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.provider_field
    ADD CONSTRAINT fk_provider_field_field FOREIGN KEY (field_id) REFERENCES public.field(id);


--
-- TOC entry 4111 (class 2606 OID 16593)
-- Name: provider_field fk_provider_field_provider; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.provider_field
    ADD CONSTRAINT fk_provider_field_provider FOREIGN KEY (provider_id) REFERENCES public.provider(id);


--
-- TOC entry 4112 (class 2606 OID 16598)
-- Name: request fk_request_end_point_id; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.request
    ADD CONSTRAINT fk_request_end_point_id FOREIGN KEY (end_point_id) REFERENCES public.end_point(id);


--
-- TOC entry 4113 (class 2606 OID 16603)
-- Name: request fk_request_entity_id; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.request
    ADD CONSTRAINT fk_request_entity_id FOREIGN KEY (entity_id) REFERENCES public.entity(id);


--
-- TOC entry 4117 (class 2606 OID 16608)
-- Name: service_field fk_service_field_field; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.service_field
    ADD CONSTRAINT fk_service_field_field FOREIGN KEY (field_id) REFERENCES public.field(id);


--
-- TOC entry 4118 (class 2606 OID 16613)
-- Name: service_field fk_service_field_service; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.service_field
    ADD CONSTRAINT fk_service_field_service FOREIGN KEY (service_id) REFERENCES public.service(id);


--
-- TOC entry 4114 (class 2606 OID 16618)
-- Name: service_request fk_service_request_entity; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.service_request
    ADD CONSTRAINT fk_service_request_entity FOREIGN KEY (entity_id) REFERENCES public.entity(id);


--
-- TOC entry 4115 (class 2606 OID 16623)
-- Name: service_request fk_service_request_service; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.service_request
    ADD CONSTRAINT fk_service_request_service FOREIGN KEY (service_id) REFERENCES public.service(id);


--
-- TOC entry 4116 (class 2606 OID 16628)
-- Name: service fk_service_service_type; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.service
    ADD CONSTRAINT fk_service_service_type FOREIGN KEY (service_type_id) REFERENCES public.service_type(id);


--
-- TOC entry 4119 (class 2606 OID 16633)
-- Name: service_type_setting fk_service_type_setting_service_type; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.service_type_setting
    ADD CONSTRAINT fk_service_type_setting_service_type FOREIGN KEY (service_type_id) REFERENCES public.service_type(id);


--
-- TOC entry 4120 (class 2606 OID 16638)
-- Name: service_type_setting fk_service_type_setting_setting; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.service_type_setting
    ADD CONSTRAINT fk_service_type_setting_setting FOREIGN KEY (setting_id) REFERENCES public.setting(id);


--
-- TOC entry 4121 (class 2606 OID 16643)
-- Name: user fk_user_entity; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."user"
    ADD CONSTRAINT fk_user_entity FOREIGN KEY (entity_id) REFERENCES public.entity(id);


-- Completed on 2025-11-19 10:20:58

--
-- PostgreSQL database dump complete
--

