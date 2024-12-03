--
-- PostgreSQL database dump
--

-- Dumped from database version 14.15 (Homebrew)
-- Dumped by pg_dump version 14.15 (Homebrew)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: TeamType; Type: TYPE; Schema: public; Owner: coaching
--

CREATE TYPE public."TeamType" AS ENUM (
    'A',
    'B'
);


ALTER TYPE public."TeamType" OWNER TO coaching;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: User; Type: TABLE; Schema: public; Owner: coaching
--

CREATE TABLE public."User" (
    id integer NOT NULL,
    name character varying(100),
    email character varying(100) NOT NULL,
    password text NOT NULL,
    image text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."User" OWNER TO coaching;

--
-- Name: User_id_seq; Type: SEQUENCE; Schema: public; Owner: coaching
--

CREATE SEQUENCE public."User_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."User_id_seq" OWNER TO coaching;

--
-- Name: User_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: coaching
--

ALTER SEQUENCE public."User_id_seq" OWNED BY public."User".id;


--
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: coaching
--

CREATE TABLE public._prisma_migrations (
    id character varying(36) NOT NULL,
    checksum character varying(64) NOT NULL,
    finished_at timestamp with time zone,
    migration_name character varying(255) NOT NULL,
    logs text,
    rolled_back_at timestamp with time zone,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    applied_steps_count integer DEFAULT 0 NOT NULL
);


ALTER TABLE public._prisma_migrations OWNER TO coaching;

--
-- Name: athleteReport; Type: TABLE; Schema: public; Owner: coaching
--

CREATE TABLE public."athleteReport" (
    id integer NOT NULL,
    "gameId" integer NOT NULL,
    "athleteId" integer NOT NULL,
    "teamObservation" character varying(2000),
    "individualObservation" character varying(2000),
    "timePlayedObservation" character varying(2000),
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "reviewedAthleteId" integer
);


ALTER TABLE public."athleteReport" OWNER TO coaching;

--
-- Name: athleteReport_id_seq; Type: SEQUENCE; Schema: public; Owner: coaching
--

CREATE SEQUENCE public."athleteReport_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."athleteReport_id_seq" OWNER TO coaching;

--
-- Name: athleteReport_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: coaching
--

ALTER SEQUENCE public."athleteReport_id_seq" OWNED BY public."athleteReport".id;


--
-- Name: athletes; Type: TABLE; Schema: public; Owner: coaching
--

CREATE TABLE public.athletes (
    id integer NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    number character varying(2) NOT NULL,
    name character varying(50) NOT NULL,
    birthdate timestamp(3) without time zone,
    "fpbNumber" integer,
    "idNumber" integer,
    "idType" character varying(50),
    active boolean DEFAULT true
);


ALTER TABLE public.athletes OWNER TO coaching;

--
-- Name: athletes_id_seq; Type: SEQUENCE; Schema: public; Owner: coaching
--

CREATE SEQUENCE public.athletes_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.athletes_id_seq OWNER TO coaching;

--
-- Name: athletes_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: coaching
--

ALTER SEQUENCE public.athletes_id_seq OWNED BY public.athletes.id;


--
-- Name: gameAthletes; Type: TABLE; Schema: public; Owner: coaching
--

CREATE TABLE public."gameAthletes" (
    "gameId" integer NOT NULL,
    "athleteId" integer NOT NULL,
    number text,
    period1 boolean,
    period2 boolean,
    period3 boolean,
    period4 boolean
);


ALTER TABLE public."gameAthletes" OWNER TO coaching;

--
-- Name: games; Type: TABLE; Schema: public; Owner: coaching
--

CREATE TABLE public.games (
    id integer NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    number integer,
    date timestamp(3) without time zone NOT NULL,
    away boolean NOT NULL,
    competition character varying(30),
    subcomp character varying(30),
    "oponentId" integer NOT NULL,
    notes character varying(1000),
    "teamLostDefRebounds" integer DEFAULT 0 NOT NULL
);


ALTER TABLE public.games OWNER TO coaching;

--
-- Name: games_id_seq; Type: SEQUENCE; Schema: public; Owner: coaching
--

CREATE SEQUENCE public.games_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.games_id_seq OWNER TO coaching;

--
-- Name: games_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: coaching
--

ALTER SEQUENCE public.games_id_seq OWNED BY public.games.id;


--
-- Name: macrocycle; Type: TABLE; Schema: public; Owner: coaching
--

CREATE TABLE public.macrocycle (
    id integer NOT NULL,
    "startDate" timestamp(3) without time zone NOT NULL,
    "endDate" timestamp(3) without time zone NOT NULL,
    notes character varying(1000),
    number integer,
    name text
);


ALTER TABLE public.macrocycle OWNER TO coaching;

--
-- Name: macrocycle_id_seq; Type: SEQUENCE; Schema: public; Owner: coaching
--

CREATE SEQUENCE public.macrocycle_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.macrocycle_id_seq OWNER TO coaching;

--
-- Name: macrocycle_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: coaching
--

ALTER SEQUENCE public.macrocycle_id_seq OWNED BY public.macrocycle.id;


--
-- Name: mesocycle; Type: TABLE; Schema: public; Owner: coaching
--

CREATE TABLE public.mesocycle (
    id integer NOT NULL,
    "startDate" timestamp(3) without time zone NOT NULL,
    "endDate" timestamp(3) without time zone NOT NULL,
    notes character varying(1000),
    "macrocycleId" integer NOT NULL,
    number integer,
    name text
);


ALTER TABLE public.mesocycle OWNER TO coaching;

--
-- Name: mesocycle_id_seq; Type: SEQUENCE; Schema: public; Owner: coaching
--

CREATE SEQUENCE public.mesocycle_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.mesocycle_id_seq OWNER TO coaching;

--
-- Name: mesocycle_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: coaching
--

ALTER SEQUENCE public.mesocycle_id_seq OWNED BY public.mesocycle.id;


--
-- Name: microcycle; Type: TABLE; Schema: public; Owner: coaching
--

CREATE TABLE public.microcycle (
    id integer NOT NULL,
    date timestamp(3) without time zone NOT NULL,
    responsible character varying(100) NOT NULL,
    "time" character varying(50) NOT NULL,
    notes character varying(1000),
    "mesocycleId" integer NOT NULL,
    number integer,
    name text
);


ALTER TABLE public.microcycle OWNER TO coaching;

--
-- Name: microcycle_id_seq; Type: SEQUENCE; Schema: public; Owner: coaching
--

CREATE SEQUENCE public.microcycle_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.microcycle_id_seq OWNER TO coaching;

--
-- Name: microcycle_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: coaching
--

ALTER SEQUENCE public.microcycle_id_seq OWNED BY public.microcycle.id;


--
-- Name: objectives; Type: TABLE; Schema: public; Owner: coaching
--

CREATE TABLE public.objectives (
    id integer NOT NULL,
    title character varying(255) NOT NULL,
    description text,
    "offensiveGameId" integer NOT NULL,
    "defensiveGameId" integer NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.objectives OWNER TO coaching;

--
-- Name: objectives_id_seq; Type: SEQUENCE; Schema: public; Owner: coaching
--

CREATE SEQUENCE public.objectives_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.objectives_id_seq OWNER TO coaching;

--
-- Name: objectives_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: coaching
--

ALTER SEQUENCE public.objectives_id_seq OWNED BY public.objectives.id;


--
-- Name: settings; Type: TABLE; Schema: public; Owner: coaching
--

CREATE TABLE public.settings (
    id integer NOT NULL,
    "teamName" character varying(50) NOT NULL,
    "shortName" character varying(6),
    season character varying(10),
    "homeLocation" character varying(30),
    image text,
    "backgroundColor" character varying(7),
    "foregroundColor" character varying(7)
);


ALTER TABLE public.settings OWNER TO coaching;

--
-- Name: statistic; Type: TABLE; Schema: public; Owner: coaching
--

CREATE TABLE public.statistic (
    id integer NOT NULL,
    "gameId" integer NOT NULL,
    "athleteId" integer NOT NULL,
    "freeThrowScored" integer DEFAULT 0 NOT NULL,
    "freeThrowMissed" integer DEFAULT 0 NOT NULL,
    "fieldGoalScored" integer DEFAULT 0 NOT NULL,
    "fieldGoalMissed" integer DEFAULT 0 NOT NULL,
    "threePtsScored" integer DEFAULT 0 NOT NULL,
    "threePtsMissed" integer DEFAULT 0 NOT NULL,
    assists integer DEFAULT 0 NOT NULL,
    "defensiveRebounds" integer DEFAULT 0 NOT NULL,
    "offensiveRebounds" integer DEFAULT 0 NOT NULL,
    blocks integer DEFAULT 0 NOT NULL,
    steals integer DEFAULT 0 NOT NULL,
    turnovers integer DEFAULT 0 NOT NULL,
    fouls integer DEFAULT 0 NOT NULL,
    "totalRebounds" integer DEFAULT 0 NOT NULL
);


ALTER TABLE public.statistic OWNER TO coaching;

--
-- Name: statistic_id_seq; Type: SEQUENCE; Schema: public; Owner: coaching
--

CREATE SEQUENCE public.statistic_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.statistic_id_seq OWNER TO coaching;

--
-- Name: statistic_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: coaching
--

ALTER SEQUENCE public.statistic_id_seq OWNED BY public.statistic.id;


--
-- Name: teams; Type: TABLE; Schema: public; Owner: coaching
--

CREATE TABLE public.teams (
    id integer NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    name character varying(50) NOT NULL,
    "shortName" character varying(6) NOT NULL,
    location character varying(30) NOT NULL,
    image text
);


ALTER TABLE public.teams OWNER TO coaching;

--
-- Name: teams_id_seq; Type: SEQUENCE; Schema: public; Owner: coaching
--

CREATE SEQUENCE public.teams_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.teams_id_seq OWNER TO coaching;

--
-- Name: teams_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: coaching
--

ALTER SEQUENCE public.teams_id_seq OWNED BY public.teams.id;


--
-- Name: timeEntry; Type: TABLE; Schema: public; Owner: coaching
--

CREATE TABLE public."timeEntry" (
    id integer NOT NULL,
    "gameId" integer NOT NULL,
    "athleteId" integer NOT NULL,
    period integer NOT NULL,
    "entryMinute" integer NOT NULL,
    "entrySecond" integer NOT NULL,
    "exitMinute" integer,
    "exitSecond" integer
);


ALTER TABLE public."timeEntry" OWNER TO coaching;

--
-- Name: timeEntry_id_seq; Type: SEQUENCE; Schema: public; Owner: coaching
--

CREATE SEQUENCE public."timeEntry_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."timeEntry_id_seq" OWNER TO coaching;

--
-- Name: timeEntry_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: coaching
--

ALTER SEQUENCE public."timeEntry_id_seq" OWNED BY public."timeEntry".id;


--
-- Name: User id; Type: DEFAULT; Schema: public; Owner: coaching
--

ALTER TABLE ONLY public."User" ALTER COLUMN id SET DEFAULT nextval('public."User_id_seq"'::regclass);


--
-- Name: athleteReport id; Type: DEFAULT; Schema: public; Owner: coaching
--

ALTER TABLE ONLY public."athleteReport" ALTER COLUMN id SET DEFAULT nextval('public."athleteReport_id_seq"'::regclass);


--
-- Name: athletes id; Type: DEFAULT; Schema: public; Owner: coaching
--

ALTER TABLE ONLY public.athletes ALTER COLUMN id SET DEFAULT nextval('public.athletes_id_seq'::regclass);


--
-- Name: games id; Type: DEFAULT; Schema: public; Owner: coaching
--

ALTER TABLE ONLY public.games ALTER COLUMN id SET DEFAULT nextval('public.games_id_seq'::regclass);


--
-- Name: macrocycle id; Type: DEFAULT; Schema: public; Owner: coaching
--

ALTER TABLE ONLY public.macrocycle ALTER COLUMN id SET DEFAULT nextval('public.macrocycle_id_seq'::regclass);


--
-- Name: mesocycle id; Type: DEFAULT; Schema: public; Owner: coaching
--

ALTER TABLE ONLY public.mesocycle ALTER COLUMN id SET DEFAULT nextval('public.mesocycle_id_seq'::regclass);


--
-- Name: microcycle id; Type: DEFAULT; Schema: public; Owner: coaching
--

ALTER TABLE ONLY public.microcycle ALTER COLUMN id SET DEFAULT nextval('public.microcycle_id_seq'::regclass);


--
-- Name: objectives id; Type: DEFAULT; Schema: public; Owner: coaching
--

ALTER TABLE ONLY public.objectives ALTER COLUMN id SET DEFAULT nextval('public.objectives_id_seq'::regclass);


--
-- Name: statistic id; Type: DEFAULT; Schema: public; Owner: coaching
--

ALTER TABLE ONLY public.statistic ALTER COLUMN id SET DEFAULT nextval('public.statistic_id_seq'::regclass);


--
-- Name: teams id; Type: DEFAULT; Schema: public; Owner: coaching
--

ALTER TABLE ONLY public.teams ALTER COLUMN id SET DEFAULT nextval('public.teams_id_seq'::regclass);


--
-- Name: timeEntry id; Type: DEFAULT; Schema: public; Owner: coaching
--

ALTER TABLE ONLY public."timeEntry" ALTER COLUMN id SET DEFAULT nextval('public."timeEntry_id_seq"'::regclass);


--
-- Data for Name: User; Type: TABLE DATA; Schema: public; Owner: coaching
--

COPY public."User" (id, name, email, password, image, "createdAt", "updatedAt") FROM stdin;
1	Test User	user@diasantos.com	$2a$10$79EXbgG40frZakE7PCBIeuq5VMQ/ItlYigpRhsSKNb1Ah1yeCnrhO	https://example.com/user-image.png	2024-11-12 23:23:37.969	2024-11-12 23:23:37.969
\.


--
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: coaching
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
a2673681-1be3-41f9-8a90-3a0b4fe53165	b45a26a556009e463e2a0742f950219b74b1dcbaada9b74307461b0fc08cd4ef	2024-11-12 23:23:31.906948+00	20241104225913_coaching	\N	\N	2024-11-12 23:23:31.878525+00	1
bf1166df-80b7-4261-adea-826331f53b57	28ba635d43e21e7ec30a3f489effa537a70e297588322d3f2a5cecb1cc9f0f05	2024-11-12 23:23:31.915468+00	20241105183705_add_cycles	\N	\N	2024-11-12 23:23:31.907485+00	1
33eb8e38-4b26-479a-b80f-06dfacc02f3c	c1ac685b6104b91b1b15f5909cb57969044343cc0750d3ed99dc134a4830203d	2024-11-12 23:23:31.917203+00	20241106175928_update_cycles	\N	\N	2024-11-12 23:23:31.915941+00	1
cd18e96c-f1db-4c44-b31c-9404379cbe20	eb9a2aaa2a61833c4707f301f82571aa7b0424d2f5264564786444312ab15ad6	2024-11-12 23:23:31.918846+00	20241109143654_add_cycle_name	\N	\N	2024-11-12 23:23:31.91766+00	1
579ae75c-a332-465d-ba67-eececcc67640	b87dd3872f93f5d0a2a644e7952b4d200491c3898a39f10d22be1190cfaea4b3	2024-11-12 23:23:31.920237+00	20241109231541_add_period	\N	\N	2024-11-12 23:23:31.919218+00	1
b822edff-21f1-4d48-a7e4-f5eac719c44d	6c6f1fae4f5eb890c3e3664877b8f7db13a1ee726acc434b2de2a867fbc0eb37	2024-11-12 23:23:31.923131+00	20241112232158_rename_column	\N	\N	2024-11-12 23:23:31.920582+00	1
2f8c7d17-a0af-48cc-9dc2-886299b5247b	f9424e843276b6a72e56f925ab3b55b12a381676197f5559bca5fe1c4c4fc6db	2024-11-12 23:23:37.064611+00	20241112232337_rename_column	\N	\N	2024-11-12 23:23:37.063515+00	1
f155fae1-f001-49ad-91b7-2189148ae227	0e69f61280ec5b167859a4fabcc1080f7609dff707f6da904154c4b6b3c1906d	2024-11-23 10:24:14.064123+00	20241123102414_add_objectives	\N	\N	2024-11-23 10:24:14.049506+00	1
7e90ae5f-367a-453e-b990-cf25a875a7dd	a122e00d5b25206a0e3bab4ff4e4fd6879fc855fb7c5937123cf0916cda51116	2024-12-02 11:47:56.89461+00	20241202114756_add_objectives	\N	\N	2024-12-02 11:47:56.878016+00	1
8f50975e-38e1-4132-934c-0deda9e11404	7b9239e77da9ed1f7ea68f440021bc233dc3cc9952f836a86c8329220087cb97	2024-12-02 12:02:42.724684+00	20241202120242_add_objectives	\N	\N	2024-12-02 12:02:42.722262+00	1
\.


--
-- Data for Name: athleteReport; Type: TABLE DATA; Schema: public; Owner: coaching
--

COPY public."athleteReport" (id, "gameId", "athleteId", "teamObservation", "individualObservation", "timePlayedObservation", "createdAt", "reviewedAthleteId") FROM stdin;
1	1	1	asdasdas	czxczxc	zxczxczx	2024-11-12 23:32:37.868	1
4	1	3	czxcz	zxczx	zxczxc	2024-11-18 17:44:48.138	3
\.


--
-- Data for Name: athletes; Type: TABLE DATA; Schema: public; Owner: coaching
--

COPY public.athletes (id, "createdAt", "updatedAt", number, name, birthdate, "fpbNumber", "idNumber", "idType", active) FROM stdin;
1	2024-11-12 23:27:41.01	2024-11-12 23:27:41.01	5	Diogo Santos	2009-01-01 00:00:00	\N	\N	\N	t
2	2024-11-12 23:27:54.911	2024-11-12 23:27:54.911	6	Rodrigo Veloso	2008-01-01 00:00:00	\N	\N	\N	t
3	2024-11-12 23:28:06.783	2024-11-12 23:28:06.783	7	João Costa	2008-01-01 00:00:00	\N	\N	\N	t
4	2024-11-12 23:28:17.266	2024-11-12 23:28:17.266	8	Ricardo Santos	2008-01-01 00:00:00	\N	\N	\N	t
5	2024-11-18 17:42:57.125	2024-11-18 17:42:57.125	4	atleta 1	2007-01-01 00:00:00	\N	\N	\N	t
6	2024-11-18 17:43:07.478	2024-11-18 17:43:07.478	99	atleta 2	2007-01-01 00:00:00	\N	\N	\N	t
7	2024-11-18 17:43:18.369	2024-11-18 17:43:18.369	45	atleta 2	2007-01-01 00:00:00	\N	\N	\N	t
8	2024-11-18 17:43:31.656	2024-11-18 17:43:31.656	44	atleta 5	2007-01-01 00:00:00	\N	\N	\N	t
\.


--
-- Data for Name: gameAthletes; Type: TABLE DATA; Schema: public; Owner: coaching
--

COPY public."gameAthletes" ("gameId", "athleteId", number, period1, period2, period3, period4) FROM stdin;
1	1	5	\N	\N	\N	\N
1	2	6	\N	\N	\N	\N
1	3	7	\N	\N	\N	\N
1	4	8	\N	\N	\N	\N
2	1	5	f	f	f	f
2	5	4	f	f	f	f
2	2	6	f	f	f	f
2	3	7	f	f	f	f
3	1	5	f	f	f	f
3	2	6	f	f	f	f
3	4	8	f	f	f	f
3	6	99	f	f	f	f
\.


--
-- Data for Name: games; Type: TABLE DATA; Schema: public; Owner: coaching
--

COPY public.games (id, "createdAt", "updatedAt", number, date, away, competition, subcomp, "oponentId", notes, "teamLostDefRebounds") FROM stdin;
1	2024-11-12 23:29:06.705	2024-11-12 23:29:06.704	4	2024-11-12 23:28:00	t	S18M - Campeonato Distrital	Série A	1	\N	0
2	2024-11-24 22:53:25.103	2024-12-01 21:53:10.74	4	2024-11-24 22:52:00	f	S18M - Campeonato Distrital	Série A	1	\N	0
3	2024-12-01 21:53:29.069	2024-12-02 16:59:06.055	4	2024-12-01 21:53:00	t	S18M - Campeonato Distrital	Série A	2	\N	0
4	2024-12-03 19:03:48.426	2024-12-03 19:03:48.425	4	2024-12-03 19:02:00	f	s18	serie	1	notes here	0
\.


--
-- Data for Name: macrocycle; Type: TABLE DATA; Schema: public; Owner: coaching
--

COPY public.macrocycle (id, "startDate", "endDate", notes, number, name) FROM stdin;
\.


--
-- Data for Name: mesocycle; Type: TABLE DATA; Schema: public; Owner: coaching
--

COPY public.mesocycle (id, "startDate", "endDate", notes, "macrocycleId", number, name) FROM stdin;
\.


--
-- Data for Name: microcycle; Type: TABLE DATA; Schema: public; Owner: coaching
--

COPY public.microcycle (id, date, responsible, "time", notes, "mesocycleId", number, name) FROM stdin;
\.


--
-- Data for Name: objectives; Type: TABLE DATA; Schema: public; Owner: coaching
--

COPY public.objectives (id, title, description, "offensiveGameId", "defensiveGameId", "createdAt", "updatedAt") FROM stdin;
21	offensive Objective 1	aqui e para ter qq coisa do ataque	3	3	2024-12-02 16:59:06.055	2024-12-02 16:59:06.055
22	ataque	ataque 2	3	3	2024-12-02 16:59:06.055	2024-12-02 16:59:06.055
\.


--
-- Data for Name: settings; Type: TABLE DATA; Schema: public; Owner: coaching
--

COPY public.settings (id, "teamName", "shortName", season, "homeLocation", image, "backgroundColor", "foregroundColor") FROM stdin;
1	Vitória SC	VSC	2024/2025	Pav. Uni. Vimaranense	data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAARIAAAESCAMAAAAG6aoRAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAMAUExURQAAAAkDAQ8JBhALCBEMCRINChMOChQOChQPDBUQDBYQDRYRDhcSDhcSDxgTEBkUERoVEhsWEhsWExwWFB4YFR8aFx8aGCAaFyAbGCEcGSMeGyQeGyQfHCUgHSciHygjICkkIismIywnJC0pJi8qJzArKDItKjMuKzQvLDUxLjcyLzgzMDk0Mjo2Mzs3ND04Nj86OEE9OkRAPUZCQEdDQUlEQkpGREtHRUxIRU5KSE9LSVBMSlJOTFNPTVRRTlZSUFhUUlpWVFtXVVxYVl5aWGBcWmJeXGRgXmZiYGhkYmlmZGtoZm5qaG9sanFubHNwbnVycHZzcXd0cnl2dHt4dn16eH57eoB9fIKAfoWCgIaEgoeFg4iGhIqIhoyJh42KiI6MipCNjJGOjZKQjpSRkJWSkZaUkpeVk5iVlJiWlJmXlZqXlpqYl5uZmJyZmJyamJ2bmp6cm6CenaKgnqOhoKSioaajoqelpKimpaqopqupqKyqqa6sqq+trLCurbGwrrOxsLSysba0s7e1tLi2tbm4trq5uLy6ub28u769vMC+vcHAv8LBwMTDwsXEw8bFxMjGxsnIx8rJyMzLyszMy87NzM7OzdDPztDQz9LR0NLS0dTT0tXU09bV1NfW1tjX19nY19rZ2NrZ2tra2Nva2dzb293c293c3N7d3d/e3uDf3uDf3+Hg4OLh4eLi4ePi4uTj4uTk4+Xk5Obl5ebm5efm5ujn5+jn6Ojo5+no6Onp6erp6urq6evq6uvr6+zs6+zs7O3t7e7u7e/u7u/v7/Dw7vDw8PHx8fLx8vLy8fLy8vPz8/Tz9PT08/T09PX19fX29fX29vf39/j3+Pj49/j4+Pn5+fr6+fr6+vv6+/v8+/v8/Pz7+/z8+/z8/P38/f39/v3+/f3+/v///wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAMj93m8AAAEAdFJOU////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////wBT9wclAAAACXBIWXMAAA7DAAAOwwHHb6hkAAAAGXRFWHRTb2Z0d2FyZQBwYWludC5uZXQgNC4wLjIx8SBplQAASXRJREFUeF7tvYlfFFcWx/t6qaKaspd03Uq6GRqaVfamG0EWgVaaHRoUWZWIGnXMmFFciAsuuG8ointc32iMiSZGoy8xE6OJT2dMoqMzGn1vRmY4fwjv3lvV0CAqjWjH98n380nsqu6GWz/ucs695577f/T8zgB+l+QpfpfkKX6X5Cl+l+QpfpfkKX6X5Cl+l+QpfJXk3qHDbxIHb8rl9gFfJelQ8Jo3h0DFArncPuCrJHs4Uce/KegQ86Fcbh/wWRJWaFq/9s1g3R/N6tchCWPYA28Kp8yqpXK5fcBXSToZQ7v8C3/7HPxdkoFgSZbJ5faB/19LcuB3SQZywKRaLpfbB4Ytyf2r1367XP2FlhFLskIutw8MW5JFoaNfA9ES8tWQCa2lZdz/eiWZo+RUQ0b9cjBao8EnlBW0jPtN6tcpyVxl6bIPlw5k2UCWU1YMpNWLlX2s6mO1FxuaTEj0BbaSlhFL0iqX2weGLcn7ikX039fB9TS99KhDRZZk3+uWZD791ycePZJfUG7+9abErVu3/ob5++3bt3/C/PzLL3fu3LlLuPEEf+5yCis/6lDxnyTdtePz812YTnoLoK24onLipKqqqsmTq6trampr6+rq6uubDspvw+f5aTlO5wRnzQNydcgRmeAhUSYJY+sluhp/8HoGIz/pkPGfJF12JUdQhe+g9+BavoJhZZheVOY26W2A9jAyucCpiu5IVyqD/jkocq4C/D3XZ0VEdiL9bf6QJF1LS2DShm6hN+FxJTNIR6izbJDeBjiaxOEbSJ13k1wdiidXz4IZ/3eAey61fOkDfpbESDTQBa+nd6G7hvPSBBHwv/q+evKpg3YMDKkAACeSA8gV/iStFtJXEUcrl9J5C+DX4mEo4m9J4iVNzKvobYAGjSCVy/QWr0dBJi0ZLfRiq/w2XM6kDYFJ/4pcnUuhVyg0Jdlms0eQH4X07plN7zZOafq/AZ641V4KDxn/SsIvepfUi3f0aBm9DzBDayTFQsaK9Zt3Hzm4PIE0DgNaKr8N151UBdZxllxdpp0nCm59cufeqQQDqSNT6ccokwdrhy/Gv5JwH0IjT+qFwegxVN7XU00MSUfp5ZlU8tB9b8MvRfRBWdsJciUpZMDdzeMJGqJIA/0QpZ4dliL+lmQxwGwd0cCom0ffAVgs4L+2aOLDd9LL78eT2m/U9xoyD91UEy7+ELm6nU/e1getrcXaILaOfoTS5N0v+YKfJVmCLxYaiQZG7Uz6FsBy3HngxqS1bqeX/ygjEhh1s+kVpquaPqwmmho090vo27gzxorU0A9Q5tLaNxx+A5LAireJBoKmkb6HbbYgHSmaNmQzveyqI32uwHskA5gaiG+8zYfTH/aogmhCxiZNFX2Xsoi0P0TboK94JBH9I0kLvVxn0b5NOgJPtd8UojXhsvUOzrMF/MACv1a6wszWkYqlDdlELjxDN++m71FWCEQRSzh9w0d+E5LAtjAelwWxk7uk6/ZwHmuEB+c10vU8HRLfZoqkC8IiwfAOfj9Islim0KFbl/M9vcK0iUQybsYJ6zDqiZ8l8Qyuu6PxeCEipkJ27Trpda9FsodUE85LEmg1k8alF5fTq5l06GYz/kqvYHMQaYko6AQUPs/AfQZ+lqSZXmI+ogYIYkr/JV3L1rqeWiQ/ZRLbP2CB9JbEBgtpXAZBGp3nG0i1YNKptbIzVOqL0p7Aat73psNOoj/ST5IYo6WRFnPKTmx1xBRSnw5b6zZqrRuMeJyuIMaHMYJa8b3gxkXu6t+nVy0IVwyBWYdf7o2QnCcyIl+M8L3l+FeSPpcP4Dw1yhCTh50TwlnJn3kLNdRS98UY+eE16R2ZvTGkcQna6fRqlVmH2Gn4xZHRRCr8k/S48/2XnVYYn/CjJA5SdF0w+cNSvs0mmohMrvzkF9PJ9duI00iVX9DEVvdbPz1GK5KgkSzWDRYFGXI+TqC9EL5vOYlH6BSpxviC/ySBauqU6U29Pt1NF73DZH4jXV+VNOpDz4jZS76V3iScpW4fCqj+H7naVHSXtDdZEVEIPYNNXcebVEvg8WTqhBgEeSQGuFssaZJ6Xrq+mderCbVw8eMHcqOrdnVLb2O3L4tqwlQ+lm9ckHoggmD97I2TBDtmHHX5DB/QmxjZf2Ht+A9MuFNIr/FT2xM5efAwMChr4WXpffhxAhERD1S4gmCupfdNtAph53Bf8qZJAk3UEelzb7D/EkAePMB2XLp+QB0c/Hwxy5dnIYaYG1gBPiCqcgeZa8aiSY6xsogYNLe8pxWN4biu3X+zulfyQnKDBU3fLMdUYom+zcVRPxe3romSJrqwHdA5OVYjTzEZWCH9gwvkA6RivYP4mfjH3XF59z3GCPz+myXJ/abb+JXkBiNOWnQkvEdVCoyWB5fuGlpvJOP+2rLxZgYb9+QrPBvh3obrBnZxjOwU/Mnb+d6K4EH7Enaj36xaklxIOsVlxMbC7s2k/9B3MM1EJRMf0SFf03pDDNkPydVHDTYt7YLwQ7PG1Dm4w5gmLVm6FYg4Rh6MUV/jDjv5ZSRZKZfbB15OkrGKSWToWE29FcSU0eUZwjI6YaK1bpWv5clHg0Ey/39qKwxltFJV0bJhpVt+Xv9fePj9//YU6CSpJAzR2OO5kyx1P77QJ8kqudw+8HKSpPNsHaknGy1a7NUiNTErJNYGY5VM2t7VinnS5KNRN0u+cXpmioGVTHUjq1wC24rt1uzLMEtqUxKG0dgB+MX2ZkmiRRydENkeRqcC5OUZwlbrKHyjd25AnnwUhcB35RvwcGt5ZAAdltWlZ4pGZYZEOKJ2Q3WvVYIlibmOa9SbJolncmB3VCApC9M34bErSoNrjsf3B1hB25LXLBPmYjMelg1sznaHomHHhLPddZZjdxP6ug5D7A3c5Sa9aZJo5Ec+GEunAph0PEhIHKSTAwYB+8EUefIRsVWSPULp3j05yr5m7kxmXv5+fJlq/98HfYOOIQ77j39PfFMlgeM2qom8PEM4SZfy3tJ7LNvNoXTyETHlD+U7lG+OL31QrDJkkddtiqV3Y3sl0CfgQf5WwhsriWdpk03G7qvE53SywKh9T77eQedHsCZ93TDh/TOd5ljWTryiOzGp0NhbTfSJP2Ev6Q2WBC6OpQ/DxX8k34Ar1Kfr61L3SJOPiHHJMyqEhagoMvZg9qSqabsAKkad/TTIMxDrbXewJPGSu+gLfpbEsxaM+es4qkmv2QpwYwIx5gWuXr7+KJ7DfS7phnvn1zpS1nxpr/10IcD+ibPuvauYC7meyQF9Mq5NN+KGLcle/0gyqqjXPqMK4AKZ5OUZguTTIbb6v9K11L94dcP3yy/CrUbYVXYPX6wpjGCz4c+ecVhnxzd/jH3TJBEDpPAZiZ8L1QhXA22otKSFkSYL+uZDzjqkrsLTDZ/OOLEypQo+0NiqsJt4Kl2ZBvtoAAZGZ78P8EPMGycJUk/A1oOHB6XU7fUsz2CkyYI+a/8SnXzEUibT2YPL0UilmAZFKl6FKr6AK/Gmz657JqB1Djw0XR/9xkmCG8E4efGFIMch6cUV8g054qTP2v8+h2piYuL+L3z10GGJj9jyIPYPiJlaa10NHcK2R57eQ5uC3eRr0W+gJCKT9iW9R5EXM/tMNICZZLIADzN/ky6lCVoUUEvqzePKE7fe7zwurG9fA2eM+o23gpv+4zHOtKm4tV19IyURWfsn9KaEFIdk0P9JvgZolpatnD9Il3dxn4uYyfjVxsn3Z3bB5M59ecSjPmlhbYft2bc8HSpZ2YLv3kxJRC5RCq+RmKElmhhHzZCvPZMFTJY8N/+gTK12d2HbzWS70/wEiprd9KPLtSJfml1zIUQ2TLTp+DNXouSexQf8LImell8Ts5felviT/i18z7M8Q5AcHCbtonT5H3fhrwCd4aoxPy2AA6HmMCepJRVqLO47nx/xjDh8Br77zRsnCcoPoy2fj+hdCMXQqYC3UUBN7+LEZiupUazjM+myC3ecB6J4nf1h7YIiV9D+qVWP4Z4df4RzQau01od/JvF7Lke+UZKMxdbr+m10tdvkZYtgpKkAr+UZ6IgkTxpg6/WAjsYGmtTZF20TujYoK2CG+16bs04p6LeCy2O98uPwxy75uiaM65j/JOkew4qalbBd8ua8bBEMbilYKMSU9hq3B+KIq8wlHJYuTyVoRH311UmKho3xSmV+W5gj2j6m0JLevVeU243I5+DP+bhM/o6gNyD/SUIWtgOxj7OHrnb3s0XoVAC+h9SeOAKAE3ZSczSjaQs7m8yZRO1suNsakTm7bFJFqKDTh4RPjFgIRb3zaoG5+IMXfJPEaFzQYlL7TxLYFKpcjf85mkQfwxMqIrFDikNi+ozbYxZisylJQNtFB6kySEhphU7qFZ+O0jHJ49XhP54yy+MNVs+J3zgf7oskRsMi+MKi8qMk0BFCa8ZnUpCzUfdHciUjTwUw2d9J1/924z4XMbgjhSup0jInUsY+ekh/4EwUlS/YagugSbL3CZoJ+I0vfJHEqMce9XGLSooCxJKslsvtAy8rCXRKG0+k1W5R4JvopcRHUhwSM1YaequwqY+YCmx+XZOCxkXEM43wyO7euKlEo7UXoNCIZsjzdK5YEhf+1rmwoUti1JIZvBN+lsSDtNrtNTVCOJksTbQ5PsUXDSxRpAzXkZs5ah3LciyLHC3kj6rW6XgUKvIiCmyHVI/5hyXJx187G9bbkF7AOwJPI2v9Kcm/PKt5hLvF1N/rP9t8VtpwxdlOwCwSdqMmsys/T1DoU+oXLJq3eB/+SEeKjoybQlIEVgztB2dfLeEK8PufWYcqCZLjak/6UZLHqX2xvZ6AXlwRvGebL0lbrjh7PcJPps6/B3CvQJEqrXh1Pzg0O1ekc9T4e0hAIr8U6lT0ksAV4g+dGaokiCNBXZhTIf6T5L+pyj43Bj9hLV3p7T/b/H0O3VBjIHWEmfAzwMNiReot+HRuUVpyQoxeofQ8MBoVHYG0aY/PR/GSRlgSEhP6SejQJEEBnibrT0m60jkvNwYzTYp691r0A7glxWphmFx8+z/lirCTXfUWRmvQqrNWtebz0koGZ7UnxQiipgW2SgGeGK4Ef//00CRBTG/0/cd+lUTriTKT+ZOeevJMtlc0590iSRMm6zquSRNV4sbuIqVRlTANmULdG29szdLjNhNVP+GwWY9EQ3gnbDbJ0wFcKf76KY9f/FwQQxfsKadD/SoJLkufG4NpQXoyBc+MpcE0Eg9pHBKbRubeqll1JcxWiYLbFaNyzw1A9pluozhKZa5JGI8ip4YKjGkrtMhr5QFl+BsniX33IhDj7uvU/S0JLk3pfXpHYo20zMk65Fg1wpNJLOIcZEq+nhW0W++MttSaty/km1LHhG0YrVDOPbl+Zlm0XsGYEjUmmy3qI6iTzBa2HH/lxFAkYUrkMHXCGX9KQuNeEVPwE70lscVKnUAu6Zh8A9Ndq0w+h/99l0NaB8xR6WOQNUxbnv7HjFRzXUbqtKP4I3sW1kejSbvuXjEl/v1fqdJiKomCPT4ESdSF3n+VM1b/SUKtLwzj/JHek9gVRS0LLpase3uYS2bdZgYKIjvv/ujQdWPSF5sXx7sgZ/K8FTdKFHF59S27Pvm+Sl38CTyaYy2H/RZS1+gO6GPBL5SEyfNaNwH41J+SyNv6cM95hd6UOET3F4iBkd6WHOZPWkEULJeWqMLmJsWMC64YEz0l0j6pqMqZe2eVIio1yBb+B0PI7HtQrZgFa0VsxtMNE0dfKAmT67WcivnMr5LAHHmI8YT+Uj6m+wvEUb1xWZRFZEqSH9edwQuBC3ITrjpzOsxKVey5iu4V9SXMjDPGaUWOFkGRvPKnCs0CWMQjkSVPdiRIHsOfBR3JvDnrX0lgCY3dE1n7aXopcUFavtIF9+3SgqUG4r4x751DRm061Bvn50VPKlmeYCxKWdmsKNmV7GjJt5rDbEui2OI1KcwyKGNElkziHzY/XxI2zSv+nHI2zL+SkGkkPOy+wyUeka4p3+dSm1Vv6p1UakWkOiF0ZNGEIpX9g9EzHJaDrrg9zgDUlpK/4F1Is8Iebn595MJ4ltObDea9VyMNdO/jR8+XhHXIM9x9nAtT+k2SR7TGbpIiaTQxxInzcLuAOjy9C1xtb9MGhscb19r5vMCIexstpa6F2SokNsTOehThLKuuqklwTEDRQWMt+JualO7pDEtCaQ89T5K3OTqS9cefkjwsoh1oRySNU+s/Ry/HiRu17xGrchPdl4bbzfR76ZeuxRqEuJT4m4vVS6rWxRtUjqosV8gMiA0+m6hcdCGyMYY16YzM/L9HKklY28HnZbjRJHxMf1s/vgiXJdnjh4aTaqGaSFFp3puVME/oLgyjZjqWZBsdU0U83pzvzIHb0W9xpVuFuurG/NgZVkHvqLE8OWCbmeeoKdM3zrdH5jiZCUmauIc1CuLIHeidnX4KEz/au7V6OO9PSXKV1m3kQtrCZurXnQJMCRQMRhL720HXcDBsKbw/FVYnGJA1AZm165epc3M1vDoQLdwc+1bJd8HjNxjCH/6xrNtWatezy4+yxKfc/0xJ3tZGeLfVXvwqiTNQDvY9n0aHGK/ulDCLo7kZ9kSQEFgMEndDzdIHi0s4EemDpiU6g/Kh0tzcIBgFzcK/O2uTLavzzDVZEZNtrCDyGb/Eklqy75mS6KwDDB+ZCxEeSdDrlyRPI+rMZIoerkqbRrzjBTALV+L/HYr2rN7p4+/ApDtb/ziV1ql3/jA1PCLbhc3aBgaNytzoVIjuENdRe9nxECtKfs+oX5dGJNnjWQ4diD64n9nTh38lwX2InKXjdr7UncrbOfs4Fks7XwKfCacLYeGcJiKJwR7jWKBLJs7g43zGpA/IsAn14c5TRfb3Qm2muFpeMyaShP11PkMSg0neqP4UF/0pSaWSlE1Kw/FPzxAjbef0cDpRCtgjsNUwpxIKlswlkqAIy8odkdIcwrfJvKirz1Ux4+ICqhbx6dEC0mWPZpRkHvMZkryFSA0cFG9J1sjl9oGXk+SHAhKaZtTRSJInVdQJ9I4XwDZCMvV3JDRrYfx4cK1aTe8hIQoFvSs59XsthncMbGFWo1NdOlP8sHIUUiysizKQgNndg0piNNB9LINyyZ+SwINyUjUErTQFK8XaILZvou2rlN7VTGynjbn3VehmSNuySpIJoSyRRJAQPuSRfvTVKYqyjcooh14UwmrsYnU8qSW7BpNE0PZuYn+ay5H+lIRkIsEyeLaxSdu1+vIOfDeW+n8yzB9hiWIplHesxJLg59Q5nuzvte4K1MG2ptTylLLkdLcBaR23chQVyaSWdJBkBQMQeM8eFi8+XrZUmrZ6zZLsGSCJPD+AAmrp1OdCusUEMSXU1P9BWgKUMYadB2fENcj+qJUTTVaTqB1LPiTzcYjdoWiFd5ytpkARWSKjTHpnxFz8xs6nJUFc7w6WPs7GKZXZ9E/xdVSfJG1yuX3g5SWBP5FANM+KlpRuAvcE+PXf+ieJYyrhXFDiNag/1cqh4DnRghDSm5YPs0HQmeonJ8dbRZNoTC5UGkQT3eO14ylJ+iUH6sWtwi2Rmm5X/C4JLCXhNZ4VrfUkAEdd9jPZzdkvJRpCe2C+YhLcyTnfoBHF6CAkau29O1UwzVqjKvxmoXrWGNyXhG8uZJLGkRXeDkHHjvJWBTHSA/fn2miDiAKpjfQbkATWWui0dDGJ+Yb2CA1Dljn/Wdg/SZwmt/txqjL5J6j/dpkWiRqXXScGpHunqpitFd7OTxRisSeMgqZn6s06sv2plRtTlYk81h5GXe61wtoLcZiRljoU3/4GJJHjkNT5ZI8s7Iuc8A+AR6X9Wg2WpBXaraEd3R8579cTC89qMZtEZpxXZDVMUwu80WREomBdZNGYEDft2sOdJpKaYUdW70oxU9gb1+QNMV+QiW5N/mv0b0ASOJhMulU5sPUMfswn0j77PnT2uzBzW3jtf/dlQROL9PXpqDWRQWqX93alqdK0pYhCp8WRxmh07D/VvLC+7CrczZPrCePEbXIQiPlCtyGQ4OHfgiR3mqlzxmTJoePdJJakH+xMOPnHb2yTHj2o7WoKxKNNfIAjMd2E1P06hqUmOq9i0qL9LhU7qkyaDVnjvAMnpUU/NmPARKuH3bgXZqRu1/+SXN8x0xVrJuXFmqRJFnqttJrRBzIfgQ92VCUCFOZCM49SzObqJCf2CJBGXu+XaDMTTQz29KoxifVRnr1OGeW3YSyZYJAWyAZjhxEJwVKag2t+lYTKIbCcQVIAIUU8mdRpkHbUe6FzPL5TDyWKObAkH5o0xvzIoN1VyvEZidjs8o4+gFVkjlaISVYkfAdlJHvFY2xruBWVNPRTG+c96d2PNr63wl0b7T9JuidHeckh8AxvzZzUOWgiQbYCtm07Z80+CKvL4UeHTo+QIb0l3gUVCiNf6RVoAMuxtWfSBvLr7le64cl7+amOXVCgqIAKVtSZd8sfeppaVh8lT0xfi/GfJF0OOU5CkiOjpu0ssWFnDZJIMLAVlv+3SjERoLQMaskMs0kV9UOjub50UQzP2DfSnymxwqQV33cqS8cpzaVTV9rUSsvS1Ohp+JkDLZ592E/z90StxpNK9Lo/JaHL5IKW5a3p1Ws+k6MZ5tNNBf0xRH7/xWZwqWM/gxW18CVJNqF3VUbHzEqOuJgWhHTaSq/lwvUW5aYPCjmtyBrGZiBtilvnqHbjxuMYdFpRoilAJeWLxvhXEg7LETq2evUZ2aHF0EW9gbCVsPHbrgzd1geQ3whtJLqXbd2nCNlQNtrS8GW4vVoZ1ZtPCXeVVptjjEmvce6DXyoVBTA3par0SUzEF/Lbg7AGKfOwMSTxQ6w/G46YNtlbDswy4yAxmUjc989N8GiiogagchZsIys1KCastkSRf9lcu0U0OiKSrcW9e67hYKJSz0csIj/4VqNl6znXxNLutH5T3R5uf/bRngMdNaKhlJqJFL9Ksv2El21NvVA6YDyFdkz36Y9hbpRrC+xJ/hBOTCEjrd7QsUo52iUK2ox85YSr5YqIxXLTA7jZxCXR9Yh7+VNKkzvzq0rAkzvJiz3TxidazSI2cxkSIevhhh8l6ePGvsVuknh9HTUrnoIrhH33L80JyHkAp0PbYL60gIdCLB/UqgW9OiZT4KPeCkWqvN6YlK9SJRvj/h63xbLStVFKutiPtmzEaPR6Vq1itEYLWS6SuRHnZ0nuHltd74xDitrHnmSTT8M0QTt8EY30eFCYuo5sbKOa6HROl8YU5xyvFiorC8rrqvjQOb9KP7Va3rVx1nWgOm7XhI3e+S4pn+ZrNdgZYi3OusaKVJNaNbG3wt6M96MkX26cXpgczOM/lqoa32sPkRb1BiKYj/2wo7ttvGHdhe7mlF3QOiWCTDsZwoNLmjccuPegLn0rwMO185vDdew4affXcdm3++9fGmIyjrkaSVCwN+2jiccwSpxEN9A93l2iU5IS7CJhPv6UpDtbzXB6MsXDlOOucFeYvKg3EE0eKWudyOFSn0g+CB1BZNLJam+rIG7a/sxKGifbmIxMuI0FNXqHFFWVbxJKvyqaQsI9vdhmIV4gZ5MSMRNaLcpmgNl2LOXNBD9Kki4v0agLcEn20W1Zg4CwEbX86unpFr247D+rnSfgMRlyDMkrDi76CT+FFCr9YD72UbC4bxuZMX0PCkcqk9T1fyl4t1i+ljhOM30GZHrHUWxB5uPwOdn+csuPkkCWJAKTg0fAw6Pp9ptBEKznnyyGr3OLbFu2Ps40X4b1DQ69iIJy6o8c68wPpbv9No9hldUZSmTgRaMC1RB39+8dG1qmLfjskH7tAVdTv77kX1ks/lWatP5pQd9XFFxr0yX+8FuQhE29ihtEfN92gAHo7F3n18Oc0Po4/PQ/ZFyAe5lKVsMynMESzEUvIHkFavUMyo6LHx+cXCI454gq+7T3amwGLquuLHZs7LXO4ln9JKGJcPRRA1zAh2PY2GAhcD3cSvSjJNlYEhOXjM3KM/T4jsFhJ8KOQw/aTQLjenRpcf4lePxZTUl+bbVdqxciSjd/BJttXLSp8aYu73F0U4smrRYZ9QzL6riJeGDttJbARvd8b0mukTw4iPe4NL0s4gyCyK2F2/6UJIcX3+FjsQVx3v5sRUS2Gdp+OTfOxJUtOnE1PPJv8ODQnnPXOz7aExWSNnXV4VvLBYVlUVLlzHnF6cWRybGqsTVmpEd4RKKBAc1uWFu+gOy58LCAVJLA7KdmYDv0yKi0XYPbSf6VRBuOR83nnnOEtBu6t8EPhUoVCT07mn4DoE6ZNTPZDrV1K1tXnF6OdO5Mc0d+FtSHXk2sq1dk3y0XqsMQ4ul8+4IaWFXY7FVLnmTguom0/b3ilgXd9928ED7hMMBP/pTEyesteHi46pWQ9GmM4d9cPQwzxNRIsQOur8+/CXc6oxNqM5L3p2y78F5OqMCg2e74FSX2hsKKrK0z/4BQYmZIMh6TtFlkOC7bAuvypnpJcpTYvvr4/rGui9TpKQadFLj2k82fkqhE7IzdGJj6tz+aXOhob12HaosaF3edCrI9BLji1Bozzu8Jbp4VpTPqaqsirhzgtu9StEDaw9Nqo6hcUE1CEkR+3KqNZcn3YbfL6dVwFpFlZq7/qIyVU2hFJdmZ4WdJclVLcQmkw12eCTsbGsPLkww6sRq6YWPKw+6fb9kYjdUZi7tXg1blfNIYu391THFRce38XHdRVZSeiUoLoRY/a53RNKELlmW7vCSZRH4dO3AJ9Hq6ShUubb38xUuStXK5feAl+5LpAP/ol6L1acjiSq72yixDRSgeDX5oyXnctfDOkV2du7a/HxWB9GkpEQVtpWjzzfQGmJQELWMgM25aYGMtjTggG4Xd92B1foGXQV9G3mI9icl6udky95T06o5Hks7XL8l/cD/yoOj5imCr5PH1KGX7LNQc++dZ3UcN6fjLm2pqG+ra9m5pUUyGmoi/giscbqeevlw5bl9DQmlUUkVwfIIgcDqyR+nTwsewuayQ7AWVKaeSeO8qHMDdZP9Jgnkk5T56DvixtrOFP9eqdHoSWzYtFb5bt1VwalSB71XmZVcuK5rUvHaHO/vd4sSpXbX8wjPuzX/K35/Foaj8MQLTANtzAHa63yBJuqRdn8+DbYKZinXgNsUYEi88aa0qh0d7/mypGF0d+8i58rKiBj6O/vHbLPFLsM2E0nA4XA1TEo8V8wFl8E20sgnasRh7nBO8Gs5vXJIhnIUVuBrGK8bOtOZNyW7eAqv1JOPAV1u37jrRDotchc5ZX0yPqo1vbilZWuKYumdlVnlRQWO8wCG97SakKj+EbXho6Ugp8qWW3POnJE8t6g0CtxCWFk5clysEmw/g702the71G2Y0TV2+/0NIrwZnyuxZpnpYp+yE4nJYrdh4x/7fU9ZJQdrwi+BUboLN1QArsmvG019KebEkdn9J0gxTh3IWli6FpoB1q4LK0i7C+oJ6gL+miIwyMTO5MmHSJkcxdAS3X3nXuazBlZVbVZqal1P5bkZRsjniK1jFb4W2OQDzi2u9gmwkSQaJzPJw32+SLJ4vn1TxAnT2KbM2w3jGcnXTaVigbIY7zd+uURdduvlV/bXCorOLnHHGiJzTZyMXwoLxcFSxBNzjlykOFumxae7ogGm4OvzJme0V9eumkvQPJe2HvySZp3b0JRp5PjpW4fyfXRdIZgKheDl0r1ppZ6a5l61d2llW+WSawqhXVNwodP2QF1FwclJR3QpnWFmK06bbD9uiD8IEXEtmOVLkQ0YJ9AwhY8JCab76o0bvaAzKa5ZkLytLMp+V14KHAlMHqWy4tQpuLMtfAfdOrVIok+uZsqOh8boMJ9KnrKke6yqKt6/Nj9oKZVU/1y67EcGZWqp16DiUtgE05WX/hf5SzKlqurHNZAiwOFf+E+CLiFzvSCbCg9ctCbUusM9Oqu9QCaiC5eq4bdPu3q5Sb4a7petWL1kLK86eM6xelLNWUCy99l4iTB6174eyiK6HuZVH8pIXxRmws1sbfwIqNwFMKc+hpx5iw3RKqDzG6TidRjNmI8AqRVZ/DxAepih6Jdkgl9sHfJVkH6ujZ6jBoudMkDyFELwdqpVpJEbJiRX9ubpl1armT3Y5zPZiS7Rga2yOGFdvy40OLdhaVNI+3TUtMXYS4l0VW8echhI8aNe7sqRacjpdjV0lEoCuK5sRrhU1+hl3F2jpTiYvHqUoaBuF3Ui9US63D/gqyX5ulLTC0uKLJCKXBvsaZi+EeycrO6B7d51C4Uxo35z/3RTFlDjTx86wL/IV7RCVABC1FDoi1pZaXILStW2T/QIU/WHN7vR8SZITCazIV7jo2vweOJSgMwlCcjAyRPZfCXySRhZaMViSzXK5fcBXSY7wnJQZeYVPp4Lp7DA/5wmu+GUW7JtNXzK9rH7ywcub5jUmOhMiyszJ86xJOy+mFM2sz528qaE8bG6pQ0yOmbIo9RIUTdpZhZqdpOFcd7CmUWMeV+Ami9BugB1vIxHp8H+oNzMzpTtdIdWbXQLTLpfbB3yV5DMdS49zhDX9YlFfBHZ0muwFuOGcjv4CuqH16CMaGJFX9a1oOe92LlCO3Z5tXXlb3QIfKDrBdein8uhdEXG5qXehGDv8x69lkeFlkkpEo9ZAKZWETELKOelUOQMGnUy6Aw5bvUZml1xuH/BVkq+NjJQobKP3SQsvBFtWjas7r8LFbenfwNdzy/j89+7/ufLL/HFXYvkp4yOSTGaLoK91W0qOfZD6/u4whz0u5XxsdGhKF5TTuPiqD8j2LUHU2e5Kkgi78N0Z1Ak3SCfO9tE9ViHFv23Vs51yuX3AV0muIrVkN7bTk5WHSsAiqErGDee0PfEOdM9FFYfvZdky3KkZiSEL7Yudhs1jeNHIT/9mQvmFf8WqHUWKpuyj2253jn0Ek6XA2Lry/1RiAcj+ciqJeeEM7E+Q/swQM3BbLO5LpNmUNi23Ry63D/gqyU2zSqqU+563V/UpsCQuFTm5cV/aA/ioZioc/H+n/Ahnb9225EHh7FhUFMajoNiOL6JbYLcl5mCxoqYe95DNKY+h4ujtB3h8m7jrB7JUEbhClsTSZCqrplNvhuiBdgkecejEBSzj+ONyuX3AV0keWOlyNG7fL04Y0Qfi199JWdvwJaxYXPwY7qZPvvbpwV8vHrtWVY4S6iptFRmK8gnKmecyY1aUpk/fX50VzIdtrxuTrMINJz/cFrf20pjrsBNXSyTiLohKIq5KVEo+pxH7h/3B1qu0f6mFMVyUy+0DvkryKFJJ8qxgq9GHDHCiEHL+XAQp5rHRudhTPVRZcMi9fUUpFDmzFNXHE8sTWHeGYiO4YmGdYidsKd0xmkvMRjNmpsHJjG07HeUbcM1cjFuJYP1UlsSwe7aS48jKMD9Gjr8g3FuL+5jbiSppReNPjHBFLrcP+CpJl02ZR3/ddV/Sw+vs/9vR3HYMLl6aMQE38cz46GKbc0Lm/nFBwcFluWN1OYsCtHmVdZW5yyZOqDvrdpy2K/l3NkF7A3TmY0utpAa3F7JH0hj2uSyJfnv3n5zFOYKI1GSfi8z9fJVuIfwQw0l5VqeoTD/I5fYBXyWBLGUWjff5py9HYPGZsLjoyZfwaUaoG+AfMWOKmXpL2nxhgVs8Mvads9FZu4TAk00WOG7ogOaQsiRD0yKjE7t7M2AvlqSmtAgb7mQnrWDBg7EkCd24vkurU5bKO8QIMxRaffjl78MNUnxstdL6T7ncPuCzJEWqZJpkpzvzGaETg8HnwMIUYs8ci6mCs4fm8Ho+I72g9q2ZG8KaYt8ZVzjO4gguKkhe+55pxpmF+kPNitpNApakzA37XHhgaczFXsBMLAkyYp+TSqIj9eC6Szl6upcisLEqRYcOnw82S15yqSrykVxuH/BVkp5aZYwUw1Dgg0XP1sHsS5M2wNaza+vhcm4Sn9VkOrM/dE+GfXth40pF6yZtQ1jQpTPG/FP54rT25IoGVs/hFlZRDIdwLal05+AetJXYZRw2iiRJiKd1tamtfzwFwGZePH7MaJWSwLuUyV1ysX3AZ0kWqCxSEMOk5y16DiCgGQq3Pf4CPilImAtd+8xc+i5LeUnQtNgCWFVSqE6y6wQktO4Mq4NCdPIkmgqpo0hi04nFsLMJwO0mycRoahe2wiOJdzy1Fx06dGKXJpZGoD9JV44Dudg+4LMk69XEvcBMe8H6jTdcM6SPJZX5BFoIX5WGmMKC6xNy10Vsmu+KUwubZiudW4LGZ0/7ojJ1zUyza3LulFgtjyWZNBlWN8JdVyvx9X8dg8cXne2eJInWc65Zf34tUsXfXa3E9gzmrg2PjnKxfcBnSQ5w8pnrvrjCXMsvU4+5r8NFqG8hcQO2DU7In3/dBkeVeqNu0RJ15Qk0tbwR2sNhv2IDFLELbCosSWU1LK2DU2NnU+twllpqMJIkg+6uP+8M5ObAXAXJJgxwOUpZL5faF3yW5IKBmUd/4VZ6avKQQIYdtxxnHzyG1U2lbbBpdUSEK6io1JHvKp+Uqkus0uhFcwQyp4xbPzOrIt+RV20xlsYTSSpqoPY92O2opPvTr8biMS4wmx5gLe/iG8CNVJU+7gbUKUhDI+nHVC1yqX3BZ0l+CaZhIgBHX5TJqg9j5A+fh2f8HX9pEdMBp7IQl/NuHkyrhZJpq5T2fWHqOBfPZ8N6zbmrinTIUdSlK4rt2KYrq4G6D2CLo1RaoVhGFgR0FU6sDNJ6ZzP3MFMlBuIKUqKQtvhvNzDb5FL7gs+S/DtGKcV6XB36IS3YLNk4773N8M0lSOuEB2UcV9CSere27F5lUqwgxgelRln1upTTS+zvVubY8uurqlKU0UHYIkythYZWWJ5YJGcAmaTCmvDC21iSUYPsQ+nOChR1ji4Yp5Cc9eXDcnF8lwTGqVJpSNQTr4zGL4ArgPW2CwCXylYXHoKjEQYkjK7KrS1Mnj02wCTqR7UWRdSJ2oSzT6rLYGs0gDWmOk8V+yU4WokkC1OLpRlweFCqlh0rOUKpP4+w9Yh0bf+zMdJwNEONrsql9gXfJalWya5n0ZD7V64QtrvSvgY4HWW9AN11zKrSKijcuVOVGs4JJj0XaUHpZp2pE6ZknW92LKhX2TbYeXTosf0gTNkATaWlHl/3/5mCpNU0xHsd8eWhe0IgMhjKr1iRlP2/QjUc49V3SXo+VJmleb2GIY/CbANsPr/xJHx2oT32KrSGvLUkw7HOnpUfqtOVJHD5NWxjI2+IXF2a6y4Km/NDjbKkIsplMh29E7cfcnZDaUVWn0G2wynoTVgSzWDd6yRV0JITV3ZroyQJnUr7MCy1YUjSGSCPwsufGeg6EGyptZDdIYcLluT9ABejDHyWO+3TvIx1XN5tu3LKDGbDDsQUQpUDIGo1NJgfthXfixWO/TXpsy57BzZeU7yP+WunB2DqXVLEUT8mKW3Y/1ommyX3knGvJxfaF3yX5BtBLW3Z7Dt74kVolsGSmPp/42HR6HgEp9zKTLhUcLvAlqNJyjSIJoTE2DA+Y1/rvL3L3a6x05rSxlodYtAnpzMfP7JvhfpCevBjL2voqbu8WEDmGvtRqbRh8RoUUv9/zqqaLpfZJ3yX5GG4SoqS+y6aHIIzBJAOdwg7V/0I+27W4Yrw5yAucc/mzKTZeXqryl3II2SMOrtSy+XAP8IaYH0afB93pXM0H3z20NjuW3HboSFL+n0ePpYSwAoscg+YYpyoTMKSFCikZCo7jMNZxRmOJJApDzldQ/WFkbATiokBOt1R4oQnl8KjarJuXRwPC3MWchNcOkE0Bi1r1LHjYL+lBqpitjXoF2yOYIM+3TUGbsTs/Fd5ct8R34Tb9ARMk47TM1HYFvaiUpH6/8C/7Eppm+ASVvuxXGafGIYkdSp5am/iEB0/IeRMd2niu10AH+DWfczBT4LMSxvNFcmmWKTRC2GiucKqQ6FZlQ3788dOWWypX9YwekOK4eONhfAwuWNvbuwA45344Mg0rdIaoOXLvbcYFyhKAM5YBGmnaI3KfFsus0/4LknPBrVB2h0y1DVQwfrl3cJDuSfhEbiK4PEEZVZVYWrOh5HRSBcWr0tbbMgCp0aXftW8FpYlAIRPvl2BjleLl1aUwlnb54szQ2iGvz6WkJkTfhOcLDfo1Ol9myTvJytnAWwMIAczY5yqxOEMOMOR5HM9QxLykFXoofWvguXM9+bZXQ/+N3vthEqAU8HKWphWBMWz1wsOJ1dWxqeXIa0xtiVn4sHS1CXTVlXETs6JEezwQTFsd8L7qZb+i3nwLTmjjSY+XWHRsbb/U7qLyyOQqPvpimx6dTsB93lykX1iGJI8sMr9680hHliK0MHLQZYjAFdcikbY0RzNtDyqil4Uk7MUGc1mHWfQRC106ticO27Lnr9omuFI1CMYr7RDUxUsnwxNtvCBmz8bsU+sTyDxAlstBs7m6WQrlcn3AAoVJHEuySasapZL7BvDkARyVeRsTkzvoVjPBwWf/sLW1AhdcMYwC3YgI7LmtO4VU9vi9PyMAi6iUDUNpqk1edAcBp2KZqhRNG6JDrBDXRW0zIDayNi+LcAS15Nwx87RJbblOsRkSO/vCyKHEf2cqJR2pbRquP1yiX1jGJL0zFbJWTG8Tvd5HoL18l9D/wRwYcbDZDxEvKcRlU44bz0GCXqUECGEJKti62KNyFw2ozijcGqiq2pKUFiqJh0qJ0LbrP/mmftl86BsEYyiMZQmlypjRTXdMXsjVUXyMBxAIk11A7Uq0w25wL4xHEn2BnBSws7tQwtEQkLH41imHbqX1dpWwDG7EQUlljiiO6bqkGhEJsH8p1KFYDIFoPsPuHchNvrRx8KYHagMihdBzYwHqWhA70r4INBo4pNIgPjHIQKdKbjqVGlI6qTFykQpDU6OKmlYveuwJLltVkk7mUmWqqHAlkNhev5PALOUq+BmQmDYgWshs34tkBfaVY5fm3DnYEjMbv1AH1+SkhifMtoQzZfD+MkwceaDZPNRgBMrlpPnP9Iuh8nDbL3OFBhL5qTdASJvv7ndrpRSAJbJtutfo1UVw+pdhyVJd5oK2+WEIXYm+iTY+O7J29umQDL+Qzapg91THGWr4qSFIJQSG2MOM6Gg/Q9ii/ZkTIB9ivojVm2AGzLKwL28PSj5XtfUIC7AsnC302xAWbJvszpaLehQydabm3BVFewmRRjtQu7alHPo+9sNw9l4QhiOJD3TPZ3JH4dmrCHDCmhYBpey5mWshiX5eqSY+I9MpUCScIv6xO5JiqkbBV0C/Cu+vSvDvrZSkbLKpmLcYK+Cst3TFBUwXxGAa5Fg0gg6xzhPDPC5iiAmUG2ITyE5h7TmQqlE+5BRmi2fqdafl4vrI8OS5ADHSvNcz05i3J+3LLuhZAH8ODZgFzSocEtqhBwlVUTkLDXhSkeagELdE4uTHU2TdH9cGmbfMlfrhoRGqD1do1z9b4dzjFZ8B1tBfAlNiSVzuM4RFKhUksmC3gyFc5QJ0gEbLlXUMJa1CMOS5F6IWto0NeRVUG30wX/kzIIT1oNPDsQYxKDwjKoU2g8ZXNO52plG3iQixQIoS4CjugNPHGNu7RzlfhS35knZ5fFMx0+L4GYOzbXMD8jf+eDo2uY5Y7HL07uJK4/Y9Jjvo4dpqA1TEnCp4yTfonqI00gmrbX1bNBkcB265xSQynk06aMC4jQi3a4DqoXLaAJQta0pO7q+Ot+R7QqMDlFW/BS957Hr+2w1DSqVklcic6X3ISsSU3EZDFFS9rLLEUqp/m7VD7crGZ4kPSvUcvTrpiGHZxkEhwkVpp+ALyNNcVXrzCE0VzDiExPHWZk5tbxoLPswdONl/Syoc0Np2JaY8u9Cd0DJnnBEzQz57GmkLO2XQIbwPnF5DNJIvZoNlqK0pqiNl+XC+srwJPlGUEsO+42hh1QIyqbjoZF/+2lXdMSV3LRlQWTSA1mW5QjnxyvrsvVIt/rB6A83aKqXRFtnjOc3u0vPmduhfB6bSG1Tz6nCguB9xAyFzu6xJMMlQLki4z/k364MdcLwrJLhStLtUJPD5THuoa4MI7YeGw0J3TecynJIzukQiZYqe4dTl5wQy+IuEgXn1zvClqREzC5R5qcJwsSj5gNQmKOUNjrS3MD4P6R5ah56PampLI2NuhmvnELvfWxR1w+zKxmmJD1z1EiyD9YPceUCMaTMjbH372zl7AVzcoIWpupFVJLKCUizk0YmmhT1UBl2JsvaUaP5sF6jnrzbevGRbRRLD2yEeayIAgWjQZSDs73YTJYd6eFtsJGnkY4ASwIC9spF9ZlhSnJWp5b+HDdIUN2LQUzlf/Gna5MfVWWIAaNvTkczE3QouNVJNobnJZJEbEJ4WtGEVDStVmMJ1QsiN3dT0uMfonWClEq5iEOjCts3J/OhTx3rsYW4FfQgSKhQyg5pgTr0nlxUnxmmJF02dYoUIjZxKGMOYsr/jT/blTYDZpNN0ZEWgQ2JRqLB+A5+HF7riMUDyv71lu4tupudyoxcJRK5qtY0OBOiHU0XLB7adRpy8FaLYuCWaYANpOHQgyBvxsmxhd9EYitBLqrPDFOSnlmemIohuX5MMe15DgftxT6AgAROMGiSc40k2psMrobxDvxT1s8wNZeJ6anJomsiQuyC1nToEAIm0N9yMYKPIicDzTH17kLphcbi0JPK2jRvSft2VgUywwielxmuJF/o5THn/hCsNXWBZHQ2q3bAEi7SnLhxdGk19xayrivQzsd9ikmPhxOEwnMVjV9HuzeEFLcGI3behyWwTsv+mX7zoJmhGx6XeiWk80AGYZEhs/LFnnZToh7etCtluJJ0pzBJv9Bf/+JJE/UE6ZMwS7EUalQ1YxPXj85160Vd6uUc7dhIAWF4g0mw2PT2utHBZlaPtIib2lwFazRG6SSPdqNailcYhBoiiQZrdSFcKYUpfxulzh92uxm2JD0fquVAoBeevsjkeGbRP1RugiLebBZGIS2xXYOtAgpgAvSCLmBSqjLQoDcZWKPBOHnv0UVWdeO8ybCKQ3voN9vfkrvzQZiAGw4ifuh8tYnsMQVYoXmJdjN8SX4UZT8H8p8/Uc9m9K7otqo7YDXuP4wMKwo6DUKCVjfaNWvTzo3roaNsnFU0Ii7IOobEwuUqymeW4y+ES4F4u5Fa6jifhs4Aj0p9DE8ylFmSaZuvDr4jF3MYDFsSKGSs0ni4ni5IPgs29Rv6KcJ8pasjAomaxFkLd+zY1GhG+tS1fQHw3V/szQ2dXPV+HUn861S4p7lhmTJDesjTln4pB72h3g/TBLgvVkte4aeh6rLht5vhS9Kzm2WkPRf37M8x1wIcXuej1imV76frhBiyoRxTqjbT8ePB/s07P6Lu3Ad5j+fMntK2em17qtI91QmL5dl2eDiGkUbjp6nHfZkQ8gkxSuTdW3OZ4Wyw6GX4kjwezTik/n32sztYzkZThMmUxk1McRh0M3BX+ASPymWM2PLJkfV1KaLeaLblFCzcn+9ojjVptbzWKKpLG9xQr/DkgGpS8/0OaOrldiK2FdWVAF9FKCvonUdpzHCnSijDl6Tnz54O9uvIZ/l+moST9BMS3enOK0FaExodk583NiXHacGdSahZx2rJkKPnOd5kMGhxMyCXRvOmWcuwzepx8s5ZmbQBe7MkyJKjIexT/IdRC9LotMOoHlbEgIeXkORHUbIVnj1rEhjT78C08+biUyTmz2jkNFodH4hfIjwCyx/G9L00MC3QMBvGR/Tud21QSws3A7gaj10lBrvB9+zKbKnfcQ9/XoDyEpLgim+SzukY/Hzbt/koaUz0cJSfve25XbEMMmiDsIExbgVkSrYr4UYyY5bmaPpRio0SdeETYrByUiO7EM7kvkTn+lKS9JzSqifRUpD1pafRyqmJeulEx2azwjPdRIHWGxHx5sj5ZENfyVHAPlEvO81s2FOaNGrQO0wq7ni7xilt0qLfLIbdIRdweLyMJN2ZbJiUz3mQg+Te0YV65QmgTE+9n87FOJ5RT/jgcc5gQa/lJn1EU2t3OfdAllcCS1hmYIMX9CW6xfw8mUci4yCH1G4zyHsO79mZmMdyAYfHy0jS0xHgsSmLn6omgxwh505y6vkJO0U9xz5dVbj0PXAvXpeUKI/QcCN2e1euZKjJLDUz/Hg53hPzoG0MiwS1k468LmWUZP+s4tXDWx3v5aUk6UpmR39HC7JnYDXRm5+O+69U8iIKsXMRJW4bx2o0RmnZgsIWYcPksGXZT72rEt9GdZ7M9N5sg71um0qFsufuPn/9yomNDSk6LQoQ6/9J3tmNVFJEdFc2EzR8j4/yUpL0bGAYubUPqCYG8eno5b87iM8scLWfYyt8UaHLFd3bKb/NjSEdwdUx8ikhhKPBR+ZLe+b6uFoTolKqUXhMtEXH8DrGOEGaoYAiZbh0xnO7gal9qc71ZSV5HMvJG5YO9ktmYhCkXfj9WEZ9Ifl0EsLy3uHHGCYF79Z5BertNe3Jk+LwvDnZYEeMUqlUM6wx1u1pRZ1IJcez5TMvNwJjXk6SnjUMIy9Iur1sE6Ne2oTfnyYVfkvj6EuD3HcGrGfJ6qa978y/T0I2pPR1HH3c37OorrykrOaDdnoYD6VAGS71852IeRn3hvKSkjyO4UZLlf3j0N5NsoJuAb01gDYDEnmzV7Bq70nBSO959uPhvWeIbhLfH9fvYPpns0OQexIoZnTn5KINm5eUpGctQ+ezML3x4wIvTao/xVRFQIx3cOIGT8NB5t6j2bZHFbdLRuhGlCj7fC+i26mM/pq+2iOyhS9bSV5akic2Tq6z38lz9YLmGZmbruVntPROBVzf2dGZ6/Gg+cze4yDhmCvU8WeScf2gqBxk68BgrNfJNgkUMrozcsGGz8tK0tPOes6MozGf7yDuGdNfeyPT5FcAn38QbxCQgTp4JCCgX7aNq0vzcrHKuw1hffGbz+Ofqcrkv9FXHYgdVtR8f15aku50Tq72DzPIjB89Yn0w5psSGtra29cuaKortCiVjJo1iqYg0ajlOYZJyiudOHFyy7r1Gzdt3blvsyn1G2hRSDv5X8hClky8YrqcjP4LuVgvwUtL0nOU9zjE7ditHfSYQcqT60fD1ZxKoVCoUfQYV+X0FlvwlmOd7RtWLnl/2uTS/Nx0uy0hyhosGrQ8r4xIjVQG5xWXTq5fvXblin1nTp/pb7X1cSVGmUsD2GG9lql8+UoyApJgK00nd5qVakPlUwv7fbRZdI6S2nltu0//SHeHNOqkY0x7efjT9Utnju5r37j6w9lTaieXjc9MSYqJDjMbg0PN+r7huT81SpPkXt5P5cRrcqFehpeXpOc7kZONjcsRsfJRFIPwo1vNuHqP9SGsl+P/n8d/7t345vMT+zraEqIHP69vn1le4YMFLNM0ApVkJCTB7rjHXvtQ7ZkYfIptMdFzg/un8j1jfNas+yBsVg225xOe5CrjJDfr69Gc9b5cpJdiBCTpeRitCZWCL7udloH5VSTu1XIFV55E9DfhHiZlyK+GwK+2HPlVPxaxvHwgdxXDDOPw4EEYCUl6dgYwcrrrU8grO3ofe+3iIuzuhw1oKK6gQY5GehZzAqRjYvpxNkLeogu7RW7McINs+jMikkABq5X/Vs2D2FdPZmjTSQjmAXOvz/LvG2d2b25LUqbMWtratnHbrr0fHT99/utrN3++/7jfJJEX35ikPeL9KFZGSMbLwyxWd0ouzksyIpL0XDNpYsnCPrENQrwWbignMgOnkRFmfSy3+OqZzrZ5tcVZtshQq5aNyEiOjYmODLeGhlox4ZGjYxNs9jHp45yuwtKKqtop02c3t6xYs2Hrzj2H/rLbGrT58EcH+00qreI5EiSOeZ9lqkeib8WMjCQ9SxlGWkSBT80T+o/DC1EiWUz4cbJOqdZHhIdF2zKLamav7PisSbkCHt//+ea1by58evLI/s4dWzesXtHSPHdGY111ZXlJoSs3K32MIzkxDssWFRkVbsZ2rpEZ62WfXIjxhJucsmrC/iGX5WUZIUm60jn9Oql0KxSe+GXCeZdqIrG2t9qVoRUzW9bvOXuD2iSYf0YPiGIdjK7HD+7eun7l4tlTxw7v37Vjg5PzmuMuVsR+RV90uVh2OOkFBmWEJOm5IGji5SmxMlVfONmqUCsZO2/XMKzw1CCa75U2fKgc4/qmoJYwenk2cyE3Es6NzEhJ0rOIYeTu70YiSU1JuFauzCeD8o4kfX5o9ICsrAB/jvEO/x4a3VkJ/5JfHrd6spr+xRpouSWX4+UZMUm6Mjlenl3s1KbR7d9bRiOS4OtuPZPc+TDa/pSTcjBY2kzkEy1KeXvOP7IU2dKa9MOcAPYl4kkGMmKS9PzVFBghH/X0Z5Jv9U6NKp2cINdpV9fdgdMkA9YA7scOoTMZyPchcmWsVXhOlmpi2OEk+HkWIydJTxvD5srzHqXKVQfsbOOvAA/e1SQSa6RdXtbvR+Ggdt0LcFuoAb9ao5czRLWLmshhR3QOwghKAqWsZ9Lxhl0IiiOLfQfGqKrp9M4yOd9oPxYmDBoM8Hx2qklmwyNWpbxcciVRoz0kF2FEGEFJeu5FBwryYHMkVIFtqMczdbE0Sx7ANHI9kAMmaV+RTzxxYGfnukNRJpm5XYUMM3sEm83IStJzXKcZLU8OtnH2U0eylBOlbK0A5coB66EPrn2yr0HtbGtv37FzV+eefQcOHT56/MSp02c+O3f+wsXL33z3/fUbN2//9Mvdf9z/18NfH/3nSe/0bK3+6J0iRaa8U3ZGAJszMr6NhxGVBFsKbK48YzJDGR4c2bcIms1QE+vRjXP7N384vSp/bHyIURNgNrAGnV6v0+H/6Q2GtwQSbmIym4OCLSEhVmtYRGRUdExsXEKiLdlud6SMSR2bkZUTzsYnqxPkuPGNAm8dufGXMqKS9HQXsYwnPrVcIfS5rquDdIXv1RRlJoUhPoBHYYkZhZNnLt184IhTWNnRvm3rpo3r29asal2+tGXJoub578+ZNbNpWmNDfV1tddWkSre7rLS4qDDflTfemZOdlZuqV1vlM7mPR/L6w/IvHylGVpKe+7EarZR+Fn4Zp/Ss5xwo1JH88WFJRIhlWw58cbvX3V3KDbai93w6daLcZf2YEsAsHdGOBDPCkvScF/lgeUHvYqKazo+cqzIrYxZuO/Sl3Pox3be+OLhtxdz68vx4fWRurtM5Ic/lys8vKCwsKi4uKS0tK3e7KyonTqqqmlxdU1tbV9/QMLXx3WlN02fOnDV7lsNjEz7GXWvVSCsy4pL0bOU08dJaF3xk1W+Bv023KA3SaTa/XjvduaFlRnVxriPOajYEsgyrecskBAYGaiich4AA9jmoVFL6P4Aahst8Iv/ekWPEJSGBUZ613J2itcGhLG53Min1Ewsyk6NDkI5jGS5QZ+gXtucTiPXEE8zRaKJ/ln/tCDLikvR0FzOMZ0/iekGpmgXnEwx6huX4lxGil76VouUGPmgY2bJfyMhL0vPQzrGeRdBViK+dlzDkNH0vBjFuaR0LNpp4w4harR5egSQ9N8J4rcehWy6oA4a8SfTFILUnVXSnlee3yr9wZHkVkvScQbwgT0/DMjSkzX9DAzGlsld0PEYTsHzEBxvKK5Gkp1PHmz2ZjFtHThOkLpNzzp+zcczMV6PIK5KkZ1Mgb/FkYlltHmJigheBmEp53vYrR4C6tlv+XSPNK5IEVnJ8qMcu3RQ6Iv2rwNXKRu83qSxTNrK+nhevSJIeWMwGWj2a7IwaWuqX52LUemZcvh7LMoUjb6J5eFWS9EAzy1s9beewbbAge5/QC55B7CtcR1wvFxP+XF6ZJFiTAN7iWb44n6F+OSONt3jSAJ9LebWKvEJJemARx5s9D3Kr+MUHqD4HLlbafgRwIpllCl6lIq9Skh5YEcgjT1BwV92oYZtsSJ0qT8bDvliOKXt1/QjhVUrSA+t1vL53OXRJ0BCToQ5EYIs8gdDbwjVM9SsbayReqSQ9PTsFXlMtOyWwM35YnaxeN9Wz8N4aFMi++6rsEQ+vWJKeI3/QMEWepc/PncwLdp4Pgsbau/VztpHXLH5FNmsfr1qSnotRHJPh2Rn7sF7voyWL1A5PMPmj6kDesOGVK/LqJem5NZZh46S8LJjVUT41HoOmVMpnC3A1n9EEHZB/6Kvk1UvS86iM0QT3Jnk+7Uvj0QRLp81hDjsYNuZVzBg9xWuQpKd7tobX1noiYh+9+/YQRx7EOHrja9rCOSb3JXIr+MDrkKQHtiIN4+xNYrTDMaSKotNN8mT5+G+TwLO1r9Yc6eW1SNLTcy6WZWOlk+MwN6uFF1YUxIzujY38tjCA17e++o5V4jVJ0vOPQkaD3vWEqcHWF1UUPV8sL30AdNgYLuyI/INePa9Lkp7uhToNO/4T+Snhdr2ZQzQn4WAgJrov0OCPZg2TO8Lrvs/jtUnSAx9FsGxUX3z0nlzuWTaKVl/2ufwpuFjI8fyMV2zD9+P1SdLTc6eYCdS5e7cCP1kcO2jrMTLJfSe9rI9juJDdr6sbobxOSXq6V4kck9i34/GbWot02qsXiLVM7T2U4Va1EQ9Vw0sUPmxeqyQ9PV+lMxpDRV92pEPF8rFIMkhjKJR2URPaHYzmrUWvs9EQXrMkPU8WCBwT77Xjon28XtMrilaT0RdGfKsOcUzyJ/IXXx+vWxJsooxlNNqCY/JzYzbm6qWaouXsS/uCYzfbGY2u6WWSGg2T1y9JT1eLKYAJnSbtY6VsciJW0HLJC/t2j3/pNnKM7dhr7Vdl/CBJT8/VQk7DJK/02nmzs8SS0tKXFvpRczTDGWb5oYpg/CJJD3TEMNwop3canE+8jhjbloklyzrrjyqC8Y8kPT0P/2xmWFQ6WBD90VIBN6w1r3ug6cVfkvT0XJ+oZ5mgShJm7825mhAmwFD3k/wpP+A/SXrgjIsPYCwV3mckXZwSwXAal7/aDMWPkmBRDuVoWCa41LNs9Vl9FMOxKXv8KYifJcEm/v6cQJZBzjX3AT6qCmMCGNtWv3UiMn6WBItyOF/PMNqUWWVB6oAA++bXNHX2HPwuCW4+56rMajYggOEzd/pfkN+EJFiUG/Mi1PrCI696HW9o/CYkwTzY/Jl/O9U+fiuS/Ib4XZKn+F2Sp/hdkqf4XZKn+F2SAfT0/H84HDMFU4ftaQAAAABJRU5ErkJggg==	#ffffff	#000000
\.


--
-- Data for Name: statistic; Type: TABLE DATA; Schema: public; Owner: coaching
--

COPY public.statistic (id, "gameId", "athleteId", "freeThrowScored", "freeThrowMissed", "fieldGoalScored", "fieldGoalMissed", "threePtsScored", "threePtsMissed", assists, "defensiveRebounds", "offensiveRebounds", blocks, steals, turnovers, fouls, "totalRebounds") FROM stdin;
\.


--
-- Data for Name: teams; Type: TABLE DATA; Schema: public; Owner: coaching
--

COPY public.teams (id, "createdAt", "updatedAt", name, "shortName", location, image) FROM stdin;
1	2024-11-12 23:28:46.843	2024-11-12 23:28:46.843	GDAS	GDAS	Esc. Sec. André Soares	data:image/png;base64,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
2	2024-11-15 09:36:23.344	2024-11-15 09:36:23.344	SC Maria da Fonte	SCMF	Pav. Es. Sec. Póvoa do Lanhoso	\N
\.


--
-- Data for Name: timeEntry; Type: TABLE DATA; Schema: public; Owner: coaching
--

COPY public."timeEntry" (id, "gameId", "athleteId", period, "entryMinute", "entrySecond", "exitMinute", "exitSecond") FROM stdin;
\.


--
-- Name: User_id_seq; Type: SEQUENCE SET; Schema: public; Owner: coaching
--

SELECT pg_catalog.setval('public."User_id_seq"', 1, true);


--
-- Name: athleteReport_id_seq; Type: SEQUENCE SET; Schema: public; Owner: coaching
--

SELECT pg_catalog.setval('public."athleteReport_id_seq"', 4, true);


--
-- Name: athletes_id_seq; Type: SEQUENCE SET; Schema: public; Owner: coaching
--

SELECT pg_catalog.setval('public.athletes_id_seq', 8, true);


--
-- Name: games_id_seq; Type: SEQUENCE SET; Schema: public; Owner: coaching
--

SELECT pg_catalog.setval('public.games_id_seq', 4, true);


--
-- Name: macrocycle_id_seq; Type: SEQUENCE SET; Schema: public; Owner: coaching
--

SELECT pg_catalog.setval('public.macrocycle_id_seq', 1, false);


--
-- Name: mesocycle_id_seq; Type: SEQUENCE SET; Schema: public; Owner: coaching
--

SELECT pg_catalog.setval('public.mesocycle_id_seq', 1, false);


--
-- Name: microcycle_id_seq; Type: SEQUENCE SET; Schema: public; Owner: coaching
--

SELECT pg_catalog.setval('public.microcycle_id_seq', 1, false);


--
-- Name: objectives_id_seq; Type: SEQUENCE SET; Schema: public; Owner: coaching
--

SELECT pg_catalog.setval('public.objectives_id_seq', 22, true);


--
-- Name: statistic_id_seq; Type: SEQUENCE SET; Schema: public; Owner: coaching
--

SELECT pg_catalog.setval('public.statistic_id_seq', 1, false);


--
-- Name: teams_id_seq; Type: SEQUENCE SET; Schema: public; Owner: coaching
--

SELECT pg_catalog.setval('public.teams_id_seq', 2, true);


--
-- Name: timeEntry_id_seq; Type: SEQUENCE SET; Schema: public; Owner: coaching
--

SELECT pg_catalog.setval('public."timeEntry_id_seq"', 1, false);


--
-- Name: User User_pkey; Type: CONSTRAINT; Schema: public; Owner: coaching
--

ALTER TABLE ONLY public."User"
    ADD CONSTRAINT "User_pkey" PRIMARY KEY (id);


--
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: coaching
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- Name: athleteReport athleteReport_pkey; Type: CONSTRAINT; Schema: public; Owner: coaching
--

ALTER TABLE ONLY public."athleteReport"
    ADD CONSTRAINT "athleteReport_pkey" PRIMARY KEY (id);


--
-- Name: athletes athletes_pkey; Type: CONSTRAINT; Schema: public; Owner: coaching
--

ALTER TABLE ONLY public.athletes
    ADD CONSTRAINT athletes_pkey PRIMARY KEY (id);


--
-- Name: gameAthletes gameAthletes_pkey; Type: CONSTRAINT; Schema: public; Owner: coaching
--

ALTER TABLE ONLY public."gameAthletes"
    ADD CONSTRAINT "gameAthletes_pkey" PRIMARY KEY ("gameId", "athleteId");


--
-- Name: games games_pkey; Type: CONSTRAINT; Schema: public; Owner: coaching
--

ALTER TABLE ONLY public.games
    ADD CONSTRAINT games_pkey PRIMARY KEY (id);


--
-- Name: macrocycle macrocycle_pkey; Type: CONSTRAINT; Schema: public; Owner: coaching
--

ALTER TABLE ONLY public.macrocycle
    ADD CONSTRAINT macrocycle_pkey PRIMARY KEY (id);


--
-- Name: mesocycle mesocycle_pkey; Type: CONSTRAINT; Schema: public; Owner: coaching
--

ALTER TABLE ONLY public.mesocycle
    ADD CONSTRAINT mesocycle_pkey PRIMARY KEY (id);


--
-- Name: microcycle microcycle_pkey; Type: CONSTRAINT; Schema: public; Owner: coaching
--

ALTER TABLE ONLY public.microcycle
    ADD CONSTRAINT microcycle_pkey PRIMARY KEY (id);


--
-- Name: objectives objectives_pkey; Type: CONSTRAINT; Schema: public; Owner: coaching
--

ALTER TABLE ONLY public.objectives
    ADD CONSTRAINT objectives_pkey PRIMARY KEY (id);


--
-- Name: settings settings_pkey; Type: CONSTRAINT; Schema: public; Owner: coaching
--

ALTER TABLE ONLY public.settings
    ADD CONSTRAINT settings_pkey PRIMARY KEY (id);


--
-- Name: statistic statistic_pkey; Type: CONSTRAINT; Schema: public; Owner: coaching
--

ALTER TABLE ONLY public.statistic
    ADD CONSTRAINT statistic_pkey PRIMARY KEY (id);


--
-- Name: teams teams_pkey; Type: CONSTRAINT; Schema: public; Owner: coaching
--

ALTER TABLE ONLY public.teams
    ADD CONSTRAINT teams_pkey PRIMARY KEY (id);


--
-- Name: timeEntry timeEntry_pkey; Type: CONSTRAINT; Schema: public; Owner: coaching
--

ALTER TABLE ONLY public."timeEntry"
    ADD CONSTRAINT "timeEntry_pkey" PRIMARY KEY (id);


--
-- Name: User_email_key; Type: INDEX; Schema: public; Owner: coaching
--

CREATE UNIQUE INDEX "User_email_key" ON public."User" USING btree (email);


--
-- Name: athleteReport_gameId_athleteId_idx; Type: INDEX; Schema: public; Owner: coaching
--

CREATE INDEX "athleteReport_gameId_athleteId_idx" ON public."athleteReport" USING btree ("gameId", "athleteId");


--
-- Name: athleteReport_gameId_athleteId_key; Type: INDEX; Schema: public; Owner: coaching
--

CREATE UNIQUE INDEX "athleteReport_gameId_athleteId_key" ON public."athleteReport" USING btree ("gameId", "athleteId");


--
-- Name: statistic_gameId_athleteId_key; Type: INDEX; Schema: public; Owner: coaching
--

CREATE UNIQUE INDEX "statistic_gameId_athleteId_key" ON public.statistic USING btree ("gameId", "athleteId");


--
-- Name: timeEntry_gameId_athleteId_period_idx; Type: INDEX; Schema: public; Owner: coaching
--

CREATE INDEX "timeEntry_gameId_athleteId_period_idx" ON public."timeEntry" USING btree ("gameId", "athleteId", period);


--
-- Name: athleteReport athleteReport_athleteId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: coaching
--

ALTER TABLE ONLY public."athleteReport"
    ADD CONSTRAINT "athleteReport_athleteId_fkey" FOREIGN KEY ("athleteId") REFERENCES public.athletes(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: athleteReport athleteReport_gameId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: coaching
--

ALTER TABLE ONLY public."athleteReport"
    ADD CONSTRAINT "athleteReport_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES public.games(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: athleteReport athleteReport_reviewedAthleteId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: coaching
--

ALTER TABLE ONLY public."athleteReport"
    ADD CONSTRAINT "athleteReport_reviewedAthleteId_fkey" FOREIGN KEY ("reviewedAthleteId") REFERENCES public.athletes(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: gameAthletes gameAthletes_athleteId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: coaching
--

ALTER TABLE ONLY public."gameAthletes"
    ADD CONSTRAINT "gameAthletes_athleteId_fkey" FOREIGN KEY ("athleteId") REFERENCES public.athletes(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: gameAthletes gameAthletes_gameId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: coaching
--

ALTER TABLE ONLY public."gameAthletes"
    ADD CONSTRAINT "gameAthletes_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES public.games(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: games games_oponentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: coaching
--

ALTER TABLE ONLY public.games
    ADD CONSTRAINT "games_oponentId_fkey" FOREIGN KEY ("oponentId") REFERENCES public.teams(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: mesocycle mesocycle_macrocycleId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: coaching
--

ALTER TABLE ONLY public.mesocycle
    ADD CONSTRAINT "mesocycle_macrocycleId_fkey" FOREIGN KEY ("macrocycleId") REFERENCES public.macrocycle(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: microcycle microcycle_mesocycleId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: coaching
--

ALTER TABLE ONLY public.microcycle
    ADD CONSTRAINT "microcycle_mesocycleId_fkey" FOREIGN KEY ("mesocycleId") REFERENCES public.mesocycle(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: objectives objectives_defensiveGameId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: coaching
--

ALTER TABLE ONLY public.objectives
    ADD CONSTRAINT "objectives_defensiveGameId_fkey" FOREIGN KEY ("defensiveGameId") REFERENCES public.games(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: objectives objectives_offensiveGameId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: coaching
--

ALTER TABLE ONLY public.objectives
    ADD CONSTRAINT "objectives_offensiveGameId_fkey" FOREIGN KEY ("offensiveGameId") REFERENCES public.games(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: statistic statistic_athleteId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: coaching
--

ALTER TABLE ONLY public.statistic
    ADD CONSTRAINT "statistic_athleteId_fkey" FOREIGN KEY ("athleteId") REFERENCES public.athletes(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: statistic statistic_gameId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: coaching
--

ALTER TABLE ONLY public.statistic
    ADD CONSTRAINT "statistic_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES public.games(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: timeEntry timeEntry_athleteId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: coaching
--

ALTER TABLE ONLY public."timeEntry"
    ADD CONSTRAINT "timeEntry_athleteId_fkey" FOREIGN KEY ("athleteId") REFERENCES public.athletes(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: timeEntry timeEntry_gameId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: coaching
--

ALTER TABLE ONLY public."timeEntry"
    ADD CONSTRAINT "timeEntry_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES public.games(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

