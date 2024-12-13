PGDMP         -                |            coaching    14.15 (Homebrew)    14.15 (Homebrew) v    �           0    0    ENCODING    ENCODING        SET client_encoding = 'UTF8';
                      false            �           0    0 
   STDSTRINGS 
   STDSTRINGS     (   SET standard_conforming_strings = 'on';
                      false            �           0    0 
   SEARCHPATH 
   SEARCHPATH     8   SELECT pg_catalog.set_config('search_path', '', false);
                      false            �           1262    34813    coaching    DATABASE     S   CREATE DATABASE coaching WITH TEMPLATE = template0 ENCODING = 'UTF8' LOCALE = 'C';
    DROP DATABASE coaching;
                rsantos    false            S           1247    41795    TeamType    TYPE     <   CREATE TYPE public."TeamType" AS ENUM (
    'A',
    'B'
);
    DROP TYPE public."TeamType";
       public          coaching    false            }           1247    48638    objectiveType    TYPE     o   CREATE TYPE public."objectiveType" AS ENUM (
    'OFFENSIVE',
    'DEFENSIVE',
    'TEAM',
    'INDIVIDUAL'
);
 "   DROP TYPE public."objectiveType";
       public          coaching    false            �            1259    41844    User    TABLE     <  CREATE TABLE public."User" (
    id integer NOT NULL,
    name character varying(100),
    email character varying(100) NOT NULL,
    password text NOT NULL,
    image text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);
    DROP TABLE public."User";
       public         heap    coaching    false            �            1259    41843    User_id_seq    SEQUENCE     �   CREATE SEQUENCE public."User_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 $   DROP SEQUENCE public."User_id_seq";
       public          coaching    false    219            �           0    0    User_id_seq    SEQUENCE OWNED BY     ?   ALTER SEQUENCE public."User_id_seq" OWNED BY public."User".id;
          public          coaching    false    218            �            1259    41785    _prisma_migrations    TABLE     �  CREATE TABLE public._prisma_migrations (
    id character varying(36) NOT NULL,
    checksum character varying(64) NOT NULL,
    finished_at timestamp with time zone,
    migration_name character varying(255) NOT NULL,
    logs text,
    rolled_back_at timestamp with time zone,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    applied_steps_count integer DEFAULT 0 NOT NULL
);
 &   DROP TABLE public._prisma_migrations;
       public         heap    coaching    false            �            1259    41882    athleteReport    TABLE     �  CREATE TABLE public."athleteReport" (
    id integer NOT NULL,
    "gameId" integer NOT NULL,
    "athleteId" integer NOT NULL,
    "teamObservation" character varying(2000),
    "individualObservation" character varying(2000),
    "timePlayedObservation" character varying(2000),
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "reviewedAthleteId" integer
);
 #   DROP TABLE public."athleteReport";
       public         heap    coaching    false            �            1259    41881    athleteReport_id_seq    SEQUENCE     �   CREATE SEQUENCE public."athleteReport_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 -   DROP SEQUENCE public."athleteReport_id_seq";
       public          coaching    false    225            �           0    0    athleteReport_id_seq    SEQUENCE OWNED BY     Q   ALTER SEQUENCE public."athleteReport_id_seq" OWNED BY public."athleteReport".id;
          public          coaching    false    224            �            1259    41800    athletes    TABLE     �  CREATE TABLE public.athletes (
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
    DROP TABLE public.athletes;
       public         heap    coaching    false            �            1259    41799    athletes_id_seq    SEQUENCE     �   CREATE SEQUENCE public.athletes_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 &   DROP SEQUENCE public.athletes_id_seq;
       public          coaching    false    211            �           0    0    athletes_id_seq    SEQUENCE OWNED BY     C   ALTER SEQUENCE public.athletes_id_seq OWNED BY public.athletes.id;
          public          coaching    false    210            �            1259    41808    gameAthletes    TABLE     �   CREATE TABLE public."gameAthletes" (
    "gameId" integer NOT NULL,
    "athleteId" integer NOT NULL,
    number text,
    period1 boolean,
    period2 boolean,
    period3 boolean,
    period4 boolean
);
 "   DROP TABLE public."gameAthletes";
       public         heap    coaching    false            �            1259    41816    games    TABLE     �  CREATE TABLE public.games (
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
    DROP TABLE public.games;
       public         heap    coaching    false            �            1259    41815    games_id_seq    SEQUENCE     �   CREATE SEQUENCE public.games_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 #   DROP SEQUENCE public.games_id_seq;
       public          coaching    false    214            �           0    0    games_id_seq    SEQUENCE OWNED BY     =   ALTER SEQUENCE public.games_id_seq OWNED BY public.games.id;
          public          coaching    false    213            �            1259    41947 
   macrocycle    TABLE     �   CREATE TABLE public.macrocycle (
    id integer NOT NULL,
    "startDate" timestamp(3) without time zone NOT NULL,
    "endDate" timestamp(3) without time zone NOT NULL,
    notes character varying(1000),
    number integer,
    name text
);
    DROP TABLE public.macrocycle;
       public         heap    coaching    false            �            1259    41946    macrocycle_id_seq    SEQUENCE     �   CREATE SEQUENCE public.macrocycle_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 (   DROP SEQUENCE public.macrocycle_id_seq;
       public          coaching    false    227            �           0    0    macrocycle_id_seq    SEQUENCE OWNED BY     G   ALTER SEQUENCE public.macrocycle_id_seq OWNED BY public.macrocycle.id;
          public          coaching    false    226            �            1259    41956 	   mesocycle    TABLE       CREATE TABLE public.mesocycle (
    id integer NOT NULL,
    "startDate" timestamp(3) without time zone NOT NULL,
    "endDate" timestamp(3) without time zone NOT NULL,
    notes character varying(1000),
    "macrocycleId" integer NOT NULL,
    number integer,
    name text
);
    DROP TABLE public.mesocycle;
       public         heap    coaching    false            �            1259    41955    mesocycle_id_seq    SEQUENCE     �   CREATE SEQUENCE public.mesocycle_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 '   DROP SEQUENCE public.mesocycle_id_seq;
       public          coaching    false    229            �           0    0    mesocycle_id_seq    SEQUENCE OWNED BY     E   ALTER SEQUENCE public.mesocycle_id_seq OWNED BY public.mesocycle.id;
          public          coaching    false    228            �            1259    41965 
   microcycle    TABLE       CREATE TABLE public.microcycle (
    id integer NOT NULL,
    notes character varying(1000),
    "mesocycleId" integer NOT NULL,
    number integer,
    name text,
    "endDate" timestamp(3) without time zone NOT NULL,
    "startDate" timestamp(3) without time zone NOT NULL
);
    DROP TABLE public.microcycle;
       public         heap    coaching    false            �            1259    41964    microcycle_id_seq    SEQUENCE     �   CREATE SEQUENCE public.microcycle_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 (   DROP SEQUENCE public.microcycle_id_seq;
       public          coaching    false    231            �           0    0    microcycle_id_seq    SEQUENCE OWNED BY     G   ALTER SEQUENCE public.microcycle_id_seq OWNED BY public.microcycle.id;
          public          coaching    false    230            �            1259    45912 
   objectives    TABLE     R  CREATE TABLE public.objectives (
    id integer NOT NULL,
    title character varying(255) NOT NULL,
    description text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "gameId" integer NOT NULL,
    type public."objectiveType" NOT NULL
);
    DROP TABLE public.objectives;
       public         heap    coaching    false    893            �            1259    45911    objectives_id_seq    SEQUENCE     �   CREATE SEQUENCE public.objectives_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 (   DROP SEQUENCE public.objectives_id_seq;
       public          coaching    false    233            �           0    0    objectives_id_seq    SEQUENCE OWNED BY     G   ALTER SEQUENCE public.objectives_id_seq OWNED BY public.objectives.id;
          public          coaching    false    232            �            1259    48653    sessionGoal    TABLE     �   CREATE TABLE public."sessionGoal" (
    id integer NOT NULL,
    duration integer NOT NULL,
    note character varying(1000),
    "microcycleId" integer NOT NULL,
    coach character varying(255) NOT NULL
);
 !   DROP TABLE public."sessionGoal";
       public         heap    coaching    false            �            1259    48652    sessionGoal_id_seq    SEQUENCE     �   CREATE SEQUENCE public."sessionGoal_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 +   DROP SEQUENCE public."sessionGoal_id_seq";
       public          coaching    false    235            �           0    0    sessionGoal_id_seq    SEQUENCE OWNED BY     M   ALTER SEQUENCE public."sessionGoal_id_seq" OWNED BY public."sessionGoal".id;
          public          coaching    false    234            �            1259    41826    settings    TABLE     C  CREATE TABLE public.settings (
    id integer NOT NULL,
    "teamName" character varying(50) NOT NULL,
    "shortName" character varying(6),
    season character varying(10),
    "homeLocation" character varying(30),
    image text,
    "backgroundColor" character varying(7),
    "foregroundColor" character varying(7)
);
    DROP TABLE public.settings;
       public         heap    coaching    false            �            1259    41854 	   statistic    TABLE       CREATE TABLE public.statistic (
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
    DROP TABLE public.statistic;
       public         heap    coaching    false            �            1259    41853    statistic_id_seq    SEQUENCE     �   CREATE SEQUENCE public.statistic_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 '   DROP SEQUENCE public.statistic_id_seq;
       public          coaching    false    221            �           0    0    statistic_id_seq    SEQUENCE OWNED BY     E   ALTER SEQUENCE public.statistic_id_seq OWNED BY public.statistic.id;
          public          coaching    false    220            �            1259    41834    teams    TABLE     X  CREATE TABLE public.teams (
    id integer NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    name character varying(50) NOT NULL,
    "shortName" character varying(6) NOT NULL,
    location character varying(30) NOT NULL,
    image text
);
    DROP TABLE public.teams;
       public         heap    coaching    false            �            1259    41833    teams_id_seq    SEQUENCE     �   CREATE SEQUENCE public.teams_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 #   DROP SEQUENCE public.teams_id_seq;
       public          coaching    false    217            �           0    0    teams_id_seq    SEQUENCE OWNED BY     =   ALTER SEQUENCE public.teams_id_seq OWNED BY public.teams.id;
          public          coaching    false    216            �            1259    41875 	   timeEntry    TABLE       CREATE TABLE public."timeEntry" (
    id integer NOT NULL,
    "gameId" integer NOT NULL,
    "athleteId" integer NOT NULL,
    period integer NOT NULL,
    "entryMinute" integer NOT NULL,
    "entrySecond" integer NOT NULL,
    "exitMinute" integer,
    "exitSecond" integer
);
    DROP TABLE public."timeEntry";
       public         heap    coaching    false            �            1259    41874    timeEntry_id_seq    SEQUENCE     �   CREATE SEQUENCE public."timeEntry_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 )   DROP SEQUENCE public."timeEntry_id_seq";
       public          coaching    false    223            �           0    0    timeEntry_id_seq    SEQUENCE OWNED BY     I   ALTER SEQUENCE public."timeEntry_id_seq" OWNED BY public."timeEntry".id;
          public          coaching    false    222            �           2604    41847    User id    DEFAULT     f   ALTER TABLE ONLY public."User" ALTER COLUMN id SET DEFAULT nextval('public."User_id_seq"'::regclass);
 8   ALTER TABLE public."User" ALTER COLUMN id DROP DEFAULT;
       public          coaching    false    219    218    219                       2604    41885    athleteReport id    DEFAULT     x   ALTER TABLE ONLY public."athleteReport" ALTER COLUMN id SET DEFAULT nextval('public."athleteReport_id_seq"'::regclass);
 A   ALTER TABLE public."athleteReport" ALTER COLUMN id DROP DEFAULT;
       public          coaching    false    225    224    225            �           2604    41803    athletes id    DEFAULT     j   ALTER TABLE ONLY public.athletes ALTER COLUMN id SET DEFAULT nextval('public.athletes_id_seq'::regclass);
 :   ALTER TABLE public.athletes ALTER COLUMN id DROP DEFAULT;
       public          coaching    false    210    211    211            �           2604    41819    games id    DEFAULT     d   ALTER TABLE ONLY public.games ALTER COLUMN id SET DEFAULT nextval('public.games_id_seq'::regclass);
 7   ALTER TABLE public.games ALTER COLUMN id DROP DEFAULT;
       public          coaching    false    214    213    214                       2604    41950    macrocycle id    DEFAULT     n   ALTER TABLE ONLY public.macrocycle ALTER COLUMN id SET DEFAULT nextval('public.macrocycle_id_seq'::regclass);
 <   ALTER TABLE public.macrocycle ALTER COLUMN id DROP DEFAULT;
       public          coaching    false    227    226    227                       2604    41959    mesocycle id    DEFAULT     l   ALTER TABLE ONLY public.mesocycle ALTER COLUMN id SET DEFAULT nextval('public.mesocycle_id_seq'::regclass);
 ;   ALTER TABLE public.mesocycle ALTER COLUMN id DROP DEFAULT;
       public          coaching    false    228    229    229                       2604    41968    microcycle id    DEFAULT     n   ALTER TABLE ONLY public.microcycle ALTER COLUMN id SET DEFAULT nextval('public.microcycle_id_seq'::regclass);
 <   ALTER TABLE public.microcycle ALTER COLUMN id DROP DEFAULT;
       public          coaching    false    230    231    231                       2604    45915    objectives id    DEFAULT     n   ALTER TABLE ONLY public.objectives ALTER COLUMN id SET DEFAULT nextval('public.objectives_id_seq'::regclass);
 <   ALTER TABLE public.objectives ALTER COLUMN id DROP DEFAULT;
       public          coaching    false    233    232    233                       2604    48656    sessionGoal id    DEFAULT     t   ALTER TABLE ONLY public."sessionGoal" ALTER COLUMN id SET DEFAULT nextval('public."sessionGoal_id_seq"'::regclass);
 ?   ALTER TABLE public."sessionGoal" ALTER COLUMN id DROP DEFAULT;
       public          coaching    false    235    234    235            �           2604    41857    statistic id    DEFAULT     l   ALTER TABLE ONLY public.statistic ALTER COLUMN id SET DEFAULT nextval('public.statistic_id_seq'::regclass);
 ;   ALTER TABLE public.statistic ALTER COLUMN id DROP DEFAULT;
       public          coaching    false    221    220    221            �           2604    41837    teams id    DEFAULT     d   ALTER TABLE ONLY public.teams ALTER COLUMN id SET DEFAULT nextval('public.teams_id_seq'::regclass);
 7   ALTER TABLE public.teams ALTER COLUMN id DROP DEFAULT;
       public          coaching    false    217    216    217                       2604    41878    timeEntry id    DEFAULT     p   ALTER TABLE ONLY public."timeEntry" ALTER COLUMN id SET DEFAULT nextval('public."timeEntry_id_seq"'::regclass);
 =   ALTER TABLE public."timeEntry" ALTER COLUMN id DROP DEFAULT;
       public          coaching    false    222    223    223            �          0    41844    User 
   TABLE DATA           \   COPY public."User" (id, name, email, password, image, "createdAt", "updatedAt") FROM stdin;
    public          coaching    false    219   ��       �          0    41785    _prisma_migrations 
   TABLE DATA           �   COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
    public          coaching    false    209   >�       �          0    41882    athleteReport 
   TABLE DATA           �   COPY public."athleteReport" (id, "gameId", "athleteId", "teamObservation", "individualObservation", "timePlayedObservation", "createdAt", "reviewedAthleteId") FROM stdin;
    public          coaching    false    225   F�       �          0    41800    athletes 
   TABLE DATA           �   COPY public.athletes (id, "createdAt", "updatedAt", number, name, birthdate, "fpbNumber", "idNumber", "idType", active) FROM stdin;
    public          coaching    false    211   ��       �          0    41808    gameAthletes 
   TABLE DATA           k   COPY public."gameAthletes" ("gameId", "athleteId", number, period1, period2, period3, period4) FROM stdin;
    public          coaching    false    212   ��       �          0    41816    games 
   TABLE DATA           �   COPY public.games (id, "createdAt", "updatedAt", number, date, away, competition, subcomp, "oponentId", notes, "teamLostDefRebounds") FROM stdin;
    public          coaching    false    214   ��       �          0    41947 
   macrocycle 
   TABLE DATA           U   COPY public.macrocycle (id, "startDate", "endDate", notes, number, name) FROM stdin;
    public          coaching    false    227   Ԟ       �          0    41956 	   mesocycle 
   TABLE DATA           d   COPY public.mesocycle (id, "startDate", "endDate", notes, "macrocycleId", number, name) FROM stdin;
    public          coaching    false    229   ,�       �          0    41965 
   microcycle 
   TABLE DATA           d   COPY public.microcycle (id, notes, "mesocycleId", number, name, "endDate", "startDate") FROM stdin;
    public          coaching    false    231   w�       �          0    45912 
   objectives 
   TABLE DATA           f   COPY public.objectives (id, title, description, "createdAt", "updatedAt", "gameId", type) FROM stdin;
    public          coaching    false    233   ��       �          0    48653    sessionGoal 
   TABLE DATA           R   COPY public."sessionGoal" (id, duration, note, "microcycleId", coach) FROM stdin;
    public          coaching    false    235   g�       �          0    41826    settings 
   TABLE DATA           �   COPY public.settings (id, "teamName", "shortName", season, "homeLocation", image, "backgroundColor", "foregroundColor") FROM stdin;
    public          coaching    false    215   ��       �          0    41854 	   statistic 
   TABLE DATA             COPY public.statistic (id, "gameId", "athleteId", "freeThrowScored", "freeThrowMissed", "fieldGoalScored", "fieldGoalMissed", "threePtsScored", "threePtsMissed", assists, "defensiveRebounds", "offensiveRebounds", blocks, steals, turnovers, fouls, "totalRebounds") FROM stdin;
    public          coaching    false    221   s�       �          0    41834    teams 
   TABLE DATA           a   COPY public.teams (id, "createdAt", "updatedAt", name, "shortName", location, image) FROM stdin;
    public          coaching    false    217   ��       �          0    41875 	   timeEntry 
   TABLE DATA           �   COPY public."timeEntry" (id, "gameId", "athleteId", period, "entryMinute", "entrySecond", "exitMinute", "exitSecond") FROM stdin;
    public          coaching    false    223   �(                  0    0    User_id_seq    SEQUENCE SET     ;   SELECT pg_catalog.setval('public."User_id_seq"', 1, true);
          public          coaching    false    218                       0    0    athleteReport_id_seq    SEQUENCE SET     D   SELECT pg_catalog.setval('public."athleteReport_id_seq"', 4, true);
          public          coaching    false    224                       0    0    athletes_id_seq    SEQUENCE SET     =   SELECT pg_catalog.setval('public.athletes_id_seq', 8, true);
          public          coaching    false    210                       0    0    games_id_seq    SEQUENCE SET     :   SELECT pg_catalog.setval('public.games_id_seq', 4, true);
          public          coaching    false    213                       0    0    macrocycle_id_seq    SEQUENCE SET     ?   SELECT pg_catalog.setval('public.macrocycle_id_seq', 1, true);
          public          coaching    false    226                       0    0    mesocycle_id_seq    SEQUENCE SET     >   SELECT pg_catalog.setval('public.mesocycle_id_seq', 1, true);
          public          coaching    false    228                       0    0    microcycle_id_seq    SEQUENCE SET     ?   SELECT pg_catalog.setval('public.microcycle_id_seq', 2, true);
          public          coaching    false    230                       0    0    objectives_id_seq    SEQUENCE SET     @   SELECT pg_catalog.setval('public.objectives_id_seq', 35, true);
          public          coaching    false    232                       0    0    sessionGoal_id_seq    SEQUENCE SET     C   SELECT pg_catalog.setval('public."sessionGoal_id_seq"', 1, false);
          public          coaching    false    234            	           0    0    statistic_id_seq    SEQUENCE SET     ?   SELECT pg_catalog.setval('public.statistic_id_seq', 1, false);
          public          coaching    false    220            
           0    0    teams_id_seq    SEQUENCE SET     :   SELECT pg_catalog.setval('public.teams_id_seq', 2, true);
          public          coaching    false    216                       0    0    timeEntry_id_seq    SEQUENCE SET     A   SELECT pg_catalog.setval('public."timeEntry_id_seq"', 1, false);
          public          coaching    false    222            %           2606    41852    User User_pkey 
   CONSTRAINT     P   ALTER TABLE ONLY public."User"
    ADD CONSTRAINT "User_pkey" PRIMARY KEY (id);
 <   ALTER TABLE ONLY public."User" DROP CONSTRAINT "User_pkey";
       public            coaching    false    219                       2606    41793 *   _prisma_migrations _prisma_migrations_pkey 
   CONSTRAINT     h   ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);
 T   ALTER TABLE ONLY public._prisma_migrations DROP CONSTRAINT _prisma_migrations_pkey;
       public            coaching    false    209            /           2606    41890     athleteReport athleteReport_pkey 
   CONSTRAINT     b   ALTER TABLE ONLY public."athleteReport"
    ADD CONSTRAINT "athleteReport_pkey" PRIMARY KEY (id);
 N   ALTER TABLE ONLY public."athleteReport" DROP CONSTRAINT "athleteReport_pkey";
       public            coaching    false    225                       2606    41807    athletes athletes_pkey 
   CONSTRAINT     T   ALTER TABLE ONLY public.athletes
    ADD CONSTRAINT athletes_pkey PRIMARY KEY (id);
 @   ALTER TABLE ONLY public.athletes DROP CONSTRAINT athletes_pkey;
       public            coaching    false    211                       2606    41814    gameAthletes gameAthletes_pkey 
   CONSTRAINT     s   ALTER TABLE ONLY public."gameAthletes"
    ADD CONSTRAINT "gameAthletes_pkey" PRIMARY KEY ("gameId", "athleteId");
 L   ALTER TABLE ONLY public."gameAthletes" DROP CONSTRAINT "gameAthletes_pkey";
       public            coaching    false    212    212                       2606    41825    games games_pkey 
   CONSTRAINT     N   ALTER TABLE ONLY public.games
    ADD CONSTRAINT games_pkey PRIMARY KEY (id);
 :   ALTER TABLE ONLY public.games DROP CONSTRAINT games_pkey;
       public            coaching    false    214            1           2606    41954    macrocycle macrocycle_pkey 
   CONSTRAINT     X   ALTER TABLE ONLY public.macrocycle
    ADD CONSTRAINT macrocycle_pkey PRIMARY KEY (id);
 D   ALTER TABLE ONLY public.macrocycle DROP CONSTRAINT macrocycle_pkey;
       public            coaching    false    227            3           2606    41963    mesocycle mesocycle_pkey 
   CONSTRAINT     V   ALTER TABLE ONLY public.mesocycle
    ADD CONSTRAINT mesocycle_pkey PRIMARY KEY (id);
 B   ALTER TABLE ONLY public.mesocycle DROP CONSTRAINT mesocycle_pkey;
       public            coaching    false    229            5           2606    41972    microcycle microcycle_pkey 
   CONSTRAINT     X   ALTER TABLE ONLY public.microcycle
    ADD CONSTRAINT microcycle_pkey PRIMARY KEY (id);
 D   ALTER TABLE ONLY public.microcycle DROP CONSTRAINT microcycle_pkey;
       public            coaching    false    231            7           2606    45920    objectives objectives_pkey 
   CONSTRAINT     X   ALTER TABLE ONLY public.objectives
    ADD CONSTRAINT objectives_pkey PRIMARY KEY (id);
 D   ALTER TABLE ONLY public.objectives DROP CONSTRAINT objectives_pkey;
       public            coaching    false    233            9           2606    48660    sessionGoal sessionGoal_pkey 
   CONSTRAINT     ^   ALTER TABLE ONLY public."sessionGoal"
    ADD CONSTRAINT "sessionGoal_pkey" PRIMARY KEY (id);
 J   ALTER TABLE ONLY public."sessionGoal" DROP CONSTRAINT "sessionGoal_pkey";
       public            coaching    false    235                        2606    41832    settings settings_pkey 
   CONSTRAINT     T   ALTER TABLE ONLY public.settings
    ADD CONSTRAINT settings_pkey PRIMARY KEY (id);
 @   ALTER TABLE ONLY public.settings DROP CONSTRAINT settings_pkey;
       public            coaching    false    215            (           2606    41873    statistic statistic_pkey 
   CONSTRAINT     V   ALTER TABLE ONLY public.statistic
    ADD CONSTRAINT statistic_pkey PRIMARY KEY (id);
 B   ALTER TABLE ONLY public.statistic DROP CONSTRAINT statistic_pkey;
       public            coaching    false    221            "           2606    41842    teams teams_pkey 
   CONSTRAINT     N   ALTER TABLE ONLY public.teams
    ADD CONSTRAINT teams_pkey PRIMARY KEY (id);
 :   ALTER TABLE ONLY public.teams DROP CONSTRAINT teams_pkey;
       public            coaching    false    217            +           2606    41880    timeEntry timeEntry_pkey 
   CONSTRAINT     Z   ALTER TABLE ONLY public."timeEntry"
    ADD CONSTRAINT "timeEntry_pkey" PRIMARY KEY (id);
 F   ALTER TABLE ONLY public."timeEntry" DROP CONSTRAINT "timeEntry_pkey";
       public            coaching    false    223            #           1259    41891    User_email_key    INDEX     K   CREATE UNIQUE INDEX "User_email_key" ON public."User" USING btree (email);
 $   DROP INDEX public."User_email_key";
       public            coaching    false    219            ,           1259    41894 "   athleteReport_gameId_athleteId_idx    INDEX     q   CREATE INDEX "athleteReport_gameId_athleteId_idx" ON public."athleteReport" USING btree ("gameId", "athleteId");
 8   DROP INDEX public."athleteReport_gameId_athleteId_idx";
       public            coaching    false    225    225            -           1259    41895 "   athleteReport_gameId_athleteId_key    INDEX     x   CREATE UNIQUE INDEX "athleteReport_gameId_athleteId_key" ON public."athleteReport" USING btree ("gameId", "athleteId");
 8   DROP INDEX public."athleteReport_gameId_athleteId_key";
       public            coaching    false    225    225            &           1259    41892    statistic_gameId_athleteId_key    INDEX     n   CREATE UNIQUE INDEX "statistic_gameId_athleteId_key" ON public.statistic USING btree ("gameId", "athleteId");
 4   DROP INDEX public."statistic_gameId_athleteId_key";
       public            coaching    false    221    221            )           1259    41893 %   timeEntry_gameId_athleteId_period_idx    INDEX     x   CREATE INDEX "timeEntry_gameId_athleteId_period_idx" ON public."timeEntry" USING btree ("gameId", "athleteId", period);
 ;   DROP INDEX public."timeEntry_gameId_athleteId_period_idx";
       public            coaching    false    223    223    223            A           2606    41931 *   athleteReport athleteReport_athleteId_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public."athleteReport"
    ADD CONSTRAINT "athleteReport_athleteId_fkey" FOREIGN KEY ("athleteId") REFERENCES public.athletes(id) ON UPDATE CASCADE ON DELETE CASCADE;
 X   ALTER TABLE ONLY public."athleteReport" DROP CONSTRAINT "athleteReport_athleteId_fkey";
       public          coaching    false    225    3610    211            B           2606    41936 '   athleteReport athleteReport_gameId_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public."athleteReport"
    ADD CONSTRAINT "athleteReport_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES public.games(id) ON UPDATE CASCADE ON DELETE CASCADE;
 U   ALTER TABLE ONLY public."athleteReport" DROP CONSTRAINT "athleteReport_gameId_fkey";
       public          coaching    false    225    214    3614            C           2606    41984 2   athleteReport athleteReport_reviewedAthleteId_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public."athleteReport"
    ADD CONSTRAINT "athleteReport_reviewedAthleteId_fkey" FOREIGN KEY ("reviewedAthleteId") REFERENCES public.athletes(id) ON UPDATE CASCADE ON DELETE CASCADE;
 `   ALTER TABLE ONLY public."athleteReport" DROP CONSTRAINT "athleteReport_reviewedAthleteId_fkey";
       public          coaching    false    211    3610    225            :           2606    41896 (   gameAthletes gameAthletes_athleteId_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public."gameAthletes"
    ADD CONSTRAINT "gameAthletes_athleteId_fkey" FOREIGN KEY ("athleteId") REFERENCES public.athletes(id) ON UPDATE CASCADE ON DELETE CASCADE;
 V   ALTER TABLE ONLY public."gameAthletes" DROP CONSTRAINT "gameAthletes_athleteId_fkey";
       public          coaching    false    211    212    3610            ;           2606    41901 %   gameAthletes gameAthletes_gameId_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public."gameAthletes"
    ADD CONSTRAINT "gameAthletes_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES public.games(id) ON UPDATE CASCADE ON DELETE CASCADE;
 S   ALTER TABLE ONLY public."gameAthletes" DROP CONSTRAINT "gameAthletes_gameId_fkey";
       public          coaching    false    3614    212    214            <           2606    41906    games games_oponentId_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.games
    ADD CONSTRAINT "games_oponentId_fkey" FOREIGN KEY ("oponentId") REFERENCES public.teams(id) ON UPDATE CASCADE ON DELETE RESTRICT;
 F   ALTER TABLE ONLY public.games DROP CONSTRAINT "games_oponentId_fkey";
       public          coaching    false    217    3618    214            D           2606    41973 %   mesocycle mesocycle_macrocycleId_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.mesocycle
    ADD CONSTRAINT "mesocycle_macrocycleId_fkey" FOREIGN KEY ("macrocycleId") REFERENCES public.macrocycle(id) ON UPDATE CASCADE ON DELETE RESTRICT;
 Q   ALTER TABLE ONLY public.mesocycle DROP CONSTRAINT "mesocycle_macrocycleId_fkey";
       public          coaching    false    3633    227    229            E           2606    41978 &   microcycle microcycle_mesocycleId_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.microcycle
    ADD CONSTRAINT "microcycle_mesocycleId_fkey" FOREIGN KEY ("mesocycleId") REFERENCES public.mesocycle(id) ON UPDATE CASCADE ON DELETE RESTRICT;
 R   ALTER TABLE ONLY public.microcycle DROP CONSTRAINT "microcycle_mesocycleId_fkey";
       public          coaching    false    231    229    3635            F           2606    48647 !   objectives objectives_gameId_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.objectives
    ADD CONSTRAINT "objectives_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES public.games(id) ON UPDATE CASCADE ON DELETE CASCADE;
 M   ALTER TABLE ONLY public.objectives DROP CONSTRAINT "objectives_gameId_fkey";
       public          coaching    false    214    3614    233            G           2606    48661 )   sessionGoal sessionGoal_microcycleId_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public."sessionGoal"
    ADD CONSTRAINT "sessionGoal_microcycleId_fkey" FOREIGN KEY ("microcycleId") REFERENCES public.microcycle(id) ON UPDATE CASCADE ON DELETE CASCADE;
 W   ALTER TABLE ONLY public."sessionGoal" DROP CONSTRAINT "sessionGoal_microcycleId_fkey";
       public          coaching    false    3637    231    235            =           2606    41911 "   statistic statistic_athleteId_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.statistic
    ADD CONSTRAINT "statistic_athleteId_fkey" FOREIGN KEY ("athleteId") REFERENCES public.athletes(id) ON UPDATE CASCADE ON DELETE RESTRICT;
 N   ALTER TABLE ONLY public.statistic DROP CONSTRAINT "statistic_athleteId_fkey";
       public          coaching    false    211    3610    221            >           2606    41916    statistic statistic_gameId_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.statistic
    ADD CONSTRAINT "statistic_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES public.games(id) ON UPDATE CASCADE ON DELETE RESTRICT;
 K   ALTER TABLE ONLY public.statistic DROP CONSTRAINT "statistic_gameId_fkey";
       public          coaching    false    3614    214    221            ?           2606    41921 "   timeEntry timeEntry_athleteId_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public."timeEntry"
    ADD CONSTRAINT "timeEntry_athleteId_fkey" FOREIGN KEY ("athleteId") REFERENCES public.athletes(id) ON UPDATE CASCADE ON DELETE CASCADE;
 P   ALTER TABLE ONLY public."timeEntry" DROP CONSTRAINT "timeEntry_athleteId_fkey";
       public          coaching    false    3610    211    223            @           2606    41926    timeEntry timeEntry_gameId_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public."timeEntry"
    ADD CONSTRAINT "timeEntry_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES public.games(id) ON UPDATE CASCADE ON DELETE CASCADE;
 M   ALTER TABLE ONLY public."timeEntry" DROP CONSTRAINT "timeEntry_gameId_fkey";
       public          coaching    false    214    223    3614            �   �   x�3�I-.Q-N-�,)��ŉy%��z����*F�*�*斮I��&iEQ�ٮ��N�����a����%9���A���~I������yE��%%�V�����9� �Av�f�&����s���)[������%.q�=... `�4�      �   �  x���[�GE�{V���|��Ed�z&���݇�(�O�ZR������ld�X�/.���h
7貗2�]��5U�K�5p�]kw�8Gom���k���S�>H
�C��)��
V%~�r�H+�y�o�ׇw�����Jz���F4��t/B����J�1�V��Eo�:%C��k04�u�ݔ�9,��L4ySӱF�1��<��-�b���ۜ���x�~��f�����z,�"����Vz�.�\m���؆�v�T��=_��BIX���]a�΁,M����w<��0�V����}Z?��Z1��X�F�8{�!R:�(U@�3�Ep�^��o�t����Ա5����L���$ɐZ�i߉"B�����<�����]/r��#Ff�-�Q31�%��e����&p��99<M�['\xD�W���H��Q�q���/�
c�դ��A�"�-q��`|X��*a\]Dk�]7�����u��X�6�a3��/6�p�}v�kyZ��V��������F�'$bB���u)A�����^� РG�1|��m��b��J�Q�]I���`V�[���v%m=��=�ÁY5��U���t/)�=l�g��{��a�b0�b\6`ū�7�f��l��Fm���=�)�h��XV�!��Q[���d�>Bv7�Yы],-H*cH��#ueO�&~�p"9�\0�n��Ź|>�}�m�O���_� ����U�-݅�[�Uz�i1vf;\[z�h��0��X�Ž�0ْB�^���G���=C;�jc6�<�cp*@�O�'���Y�1�(���7x ^1b+d�_�#k"�.�,��\�شi���{*�.������Yl�g��R�#�mM��`K[������W�*
:���rb�W�/��O;��0�B��0�Q��Ox�읩8���:r��j�(
�9�%�-�_�N�9�e��Us��D�} ��E���(.QT�@����=)���~��[��,�q���������&(      �   V   x�E���0�w2Eh���F����T��B��-��ad�ηt�����F��e C�h����؆�	��C?�fa^�N�[a�
��      �   �   x���Mj�0���)t��ѿ����.�*фb�u�%���Ė]x���CA@�El�$�D>T�5l�k�_,���p?���� ��{S�j�Qg�#wb��S74|���!,4�gSH��u���X�p_��L5�9W�Al��|���h������afJ�+�:7"��dy]���=;t��U�]Nkr?�`P��*7���5*gg~4r�Ů�w�i��l��      �   M   x�3�4�4��#.CN#N34cNs4N#�9i�U x <�i0�1�>c��`[<3NKK87F��� .r"�      �   �   x���=n�@F��)�^�|�k��iCCK�b�X����bY�?RҾѼ�O	W��
�h�Tf!�w�/u�D�?��U�?��Ц�?�1]jw�9��.򒔶k�7�g�7*v�(Ez�*f1�N�D��}!Gc�j��U�S��[u�����Vg˚�6��8T�K��4��1m��1fyt�S�;1'��(�G�h1      �   H   x�3�4202�54�50V02�20�22�321���b����`bJb1sr��'W&�*r��qqq p��      �   ;   x�3�4202�54�50V02�20�2��33����b�'���!��s��qqq �u      �   :   x�3��4���bN##]C#]3+0B��Ÿ�@�S�!A ����=... G��      �   �   x�36�,NB(id`d�kh�k`�`hiej`el�gil�S܄3��ї�j�A��~.�a�.��>\�Ɯ�i�yře��&�����{��r�p���B�H7��n�)gq~njIFf^�BjNq*gb^~IFj�BIjb�Bz~b������ �]�      �      x������ � �      �      x��ǲ�ܶ���-n�%'��9�=rΙ׺��3��㞛.�L�����9���@�z�������쿼w ����/3>��?ܡ�����>^�!��_Y��������i(�G�9������	)B92��nŹ��̒��f��u��G��	�I̲b)��{�~.�a�j΃
���Ƹ��Z���~�%*Fe?��Z��V��V��a~?���	_+��Uj�3���>��Y��U��ϸN��`!oQ1Q��213��r�`k�p��F!�n)�i-�e#�m+�k/�� ��$��,?̢|�Mi�]y~��u/�Io�)��BZ3"ڳ����"����bL7b\����k'��6�r/�rq��h��>��Ɇ���Y��E��W��M��o��]���/|R���@�ʠ��P�ڰ��H�ƨ��X��x��D��d��T��4Ƞt�Lܰl��\��|�Ѕ�0�賥s��%V�4K�x��(�Dh���,M���ɶZٷ�(v�)�Z��:��;��h�i;|�z��q/#I?iO��+�0ը����8�ݤ����4�Ӭ���<ۢ����ת�����J���Ȗ�ض����Ğ �N�������A��Ss��p'����:H�ȷ����h7E�FO�5���{hՂtՆ2ǁ����ă��&��!��%B�wlK��G�dO��h�7P������[�3 ����r��r��v�yG�A�I��I��E��̀�@͈�H�D��D��L��L��B ��7H�Ȝ����<H�{����L�
���~�7u�:m:л�h�~ ���@i�A���5���w�8 <���	��7@����(�߷A<������hO�����������>���p��G�?�&��q���U���� �!��>g�w{ƾ�J��N�y[��Lݫ�v`�ǻ9OnG�<���s���A�;�5�^����Ǣ5�~�K�h����Y�]��z�R��ڎ��.�0dɴq�a����l�;<�e��oD�P
�y'��t%h'�t��� 𛊩h��p��?�--:���ĄZ:��9�^7�
���2���.��bn��J^�(�O�
<}K�c~�.Qԉ-�X��R&ꞧ@������ȃbQ��+kG���DƋ�´����E��X�:�ka�] �d`"|W���J�vR�����Cs6��?6F�({��������i�G���5��7�����H$�;�qY߅Cm�}���������������z�3�t �6�P��ЎM�J����E�ݏ�$�inFr�
$@�	�x;
�	 h�� �ꍪ�Ŏ����W ���+Ht�k��l�_M���FuTl�zR�y^{g&^A�W�^����N�	x�t~Z����,-�>g*��X���@J���
����~U�4���Q����=#Da膹������{��M;�3Ƃ_4� ��j�N
��nG���]�D��%;�d��������ep�-�h�Y]g��I��L~pa��bJ8���>10d�@V�i>�y�3��T���U�6ds��J����sӷ(e���s#��2V{��c2Bc�����>rEja�3x"�F�ߐ�AlJw������W(��X �S��Od��2����g�W�ȧ­��?=�}>��v��+t����c��A�R����av?YtuݕM4�=N�{�Ͽ�w�u�Hӱ=���A���S���f������׌!�v�	�:��>tBi�UX?[�v�H�fO���,K��˺Z��w���B;�PQ0^�b*�Ć��hU%��AzХ���Ұ��$��=1�`����A,��Q������J!{=�^a\�"�t�_?7*�5�p2���"WU�
���3�9�}_�#B��5..��?|Sc�� W�z��Ϩ�mB�I����z�{���%�Oqm��k���pD0˾b�:�� 	ֱ�L�IF���HKP��5@	��ln�MP��k<�ƃ�pL�����}��S��@O¼�r?�~*��2�{�5Lޝ�Ւ{K��)�;�R:\J��"疥��,�hhi��R��5�H�vw��2�|�:�:�w�;a^9��S+#��LYL�똹��\_�-w<^83�A�>`;����	��+���f;
z	�P
��=T��9��Yjb"쇖�SnS�DaB��PW�-�ϘUh"�x#�iՍ�m��-~0����c�É'�͋�k�|��Z(�T��W����I�y�0+��lzK�Q*�|n�Sjb��+֩p�9�A�V�3˦)7r&,$:�MCL��y��vE�e�Ղ6F�H0xa8�l#3����	��}�Pߏ��O�ӦLg�A��_�;��|`A������I�H�3�4��v"��Y�?�>������<�~#k�tc�>X�$ᡵ�N>V�s��{�l�,�<N2C]�<񸣤|g�>%��?a��5�d"Xf���M���51��%<5ATŶ��~o��i+�e�iRB��w�E1����_MT �0��󺴀��\ڋ�̩�Ղ��T��T���m���}*2}c�
G?5G2Ӣ.�wOB~A�erS� �:����y�x6Ha
p�1kvN�<����C�Z߂�՜�._ǒzG�ٻ���E�B�27{�I=�tt{[^�S�����y��gE�<��!��M�/x�~P�5����x��S�?�ڃ�<v��^�B7�aȢ^Q&4�[��Q�c�|��j���!2B�8�䆸A�+n�K2V����%W���i0'[Z�|������y��	72T�i
��N��U�'��Ĭ��\l�́G�)��%0n���ؾ3�B��B���D��'��i'�w�(=+��m��A�\M�]�fC�`��=��c!�����$���v޳�DŞL}�vn8&u��n��PqOC6ҫ����ҡH���G�sD���E�e��Gոmv/E��� �ھ��;��6��ōw�]�(��d���V�ŭ�L��&�6���I�3����RW'��v"�ݐ��c���5{���Y�WW�c�a��]	����[�jfY5�e{�IMq;���q.n�r�L�����0g�(���Z=�6]uB��'۫�7�����X��!�H�Ai�൮�5d{��4̎��dR�}��s���d' ��¿�+�m�m��!�v[����j]j?�Z���p�~y����y&�lD�η#û�w��6a��*q
[6� ~��a	c���+�ZcXy*���[�(��=sU\����l�q�2Jg��H��]� ?eS�w�T��j�b�Wln��MgxJ^�{���"���&�j8��lx���!)�ub�G��,�������u@yy��A���	�YS0F�����	$	q�
�4��&z� ��I����샥@�z�p=�v�#��d2��*��A�M���U`��O3�˪:�4����@z=��)}�md�H�Hʤ8S�Tv[��GC��K�� l{���=�։���
�u�3�t�,��B�8)��ۜP`�����@qX^�����UB86;&rP@�Lu����>0$rC7�k f-wqC��*���5��,�[���*]���s�n�.�Q�J�����&:�]�;�'7�,r�9�E��5`D�r: ��M�̓i�v-�XZ�9^�ZȤ壌�n���KK�]��w�x�:��|p���n̾���ؐ$�D{��P=���-���z������=�H�9�t(F2DL�&!�|af�h�T7[.�~$��8�3_=w;�~�J}�u���E���0���ÙTd�m\D�j9���˼�!�^c�I��Y50r����V�g!��Z_���F��2V~sȢ���I@�z���i��Mރ�~
�"C���/0{����\`��w3P>xRms���ʒ�ahˎ6
�rz���CHe�\SI�>Ӭ��oN�#��7��X��d���Ps�F����PI|�c��P6����K>���ᴤ�B�%}����H3uv���퍖�°�+Ո^v�>^6HC���懗��J8�5��    ���(��ڮ�o�q5�!.C��P0zT����phd���Ŀ��;�x��5n��Lx����Sa���d%��HZP�&��/�TҹԐW��)(�o�yi���ߺ�k`|������䟾���m��*���0�F�1:�L�o@ӽ�ѧ|�qm�U�M��Yk���T4���E&���qN�D2Z�A�,В���}�ip�%�
ĸ��l0�˽�e�Q$�(d���4�A�Ǒ�de��ccnja�5C��}���c�RKt����0����C d�"�}��u��2ߕ�I7uV����<����ݭ�e):>:Э�wӗMw<֐��I~����׾��y�6Z�Bմ�U�EۆX|"(]�j��EO����H�N��'�U{	yU7�AS��J=xX��(o��+댓=�l���^A��.0�<��l.W��N~��y�}��PsN�̽��tf#��[�p#U��:"�	��:�<Q���4SٜV����y	*�|JȀ�6�,�*FZ(���]+�L�Ƕf�OU�T���`觡+�C'�P���4��s}�<���V>n�h��7ݿ����Gi��C�Cд@����-5������dq��������q��bȲ���������	
׷��7/�������-�p��z*}�.�\x�� Ab��#��f@�:K�(y~��֥NC�mi=�̻m��&�4{V�0z滋��듩�^�	���-����ɧJAJH �~W�*q�6�(��^�>������6�ĕ�$~��ړ|�:XN/�Մ���9a���}|*%�qY��z�B��eӪ���Y�:@Q��6�~����K�NE0��@��8_��˪!�7C�vh�f���=��� ���5̤����U�����%�v�O��"�]<ӆ��jb�
��v=�<��H�[SO\f'��bh=�߈W�4�Az��.�����^�p�b�[O�&󦘘��>�捝{�px�Ŝɵ2���`���<: �'�>*�z>��yK��eC�:�k�$ٛ)�9po~�o�<����P��)��f!ͣ��X��A+�a�4�����݅마�2`��A��W����X�i3����[�U�ܟ5��W_c	,���b��9ʑܓ��?	��L����|y��"e���A�i}ڂ��(�:��zp����Y�{�l�γ�XTr�fz��R�����h;К�)Įo�`�2�+��گim��jKW��X�||�%���ь�2^�t���$�P��][�����C�9�L���?�WE�=Rh�_�	�׈!�Jzފ�s]�����%!�} ���U�n��5�8o7oclB���a� &؍[�5j�t����.i����,%��_���ai��<p�d�ی�Ǵwkzf��EA%�F_��l�"�E:B2Iu���K�T���i���քjM�^�Cc��Z�)&x�[}u��r*U����N��Z?_� y�;������?�vp5�٦Ӽh�s+x�n[w��nP��&/aI+3�$y
�$�|����e�ó_ϸ��z����V3�U��­�!L������]�P�%�%��V�+x�u gCSa��Bl���N��qਖw5�}�̅\
������k�v~	���k�cV9��٤��Q�4�Y2o�u�x�R��UI��l0�{�x'=�0h�����-l�/��5��iV��$���*�	�^823Qx>����fg
���Qb�_+�ĵ�o�sc�})E
B��n�����\;��{�� Ţ��{�eՑl#��_jܐ}�LkhŸ��N�K��RAۓJ��R4��Q��y�^�E�;��-$ �v�K}�M(���"��r;�.�m��h�4�K;'��4�Q=@�pA��0 d�O��s�����T)�WԷg��f��������M)����L����XV	l��B��iP�&[^3K��(V�oW28���S5̅�UJ����W>���%�����`,��H�_��;?��ە	�f��%4䳉�<Mv��+�Y2��i�����d�[٬�{N��t�ٵ3#�Ԙ����K!J�<�{a���Ur�B�oF��V���������}k�ѣ��-2�G�cٲ4x�O�%,8��*�%,.,U��ɩJ���a�8�[5�Z"����ޙ�*J�[�k�(�R��j]�Ъ��w��v�[��PߍGǸ#K���#�C���W���=I�hߖ%3?�u��p<%��&ߖ�ܳ_�pp������J��� �7.�d���ݹ_v���!�7�����]վ4ub�^�Z�����rL�5�6��T����[�V?�=M~&��O�����+lK��KD<��
6+�_�a�e����W�����M�㗊��q�A
NO`�]��b�Ǫ�Zy6���|����2�o+�#N��?Ե���)y����́W�م,���%n��]�n�v�H9�
����^���z\�p:W�w���k�xh�����q��,�"}tX�ڟ����y�]�X������ d1Ye�J�0o)ܖ᲌n����C�&6GX ���v�b��<�2m�#����͍r\�,���A%P{$�Bk������#�XH_kF��◴���{e_A�a��5�g%hGg���57*.�M�_[sة0��0O��g��\V�ڹV��@����Y�Ӆ-W��|n��F��5���� �b��I�JJ{J1 c허?}�x���(��S���Y�6.�� �z�{��[����;C�[l�jd�ġ��$4^.]&0��5��>���%cr�흋����9@I��������f+���Y�J��4����F�n�h
+v�|��+���ޡ� �.����\H�����~�!em���=W��cnf��"pi�9�	r;b���?*����4Z�p�	����L�Ь��_m�����h�亠ޛ���"��A4�f�ƣ@�.��y�~�d~��M^��#�F<�ey����#�e�@X�#;�_�q~B+�U�5,�!�>�wʌ3QS]�|zJ\"Ѕ�"%l��$�U#�Ϭ�7'��Tq�{���0���������}pQ�5+5b@�{m�Œ�m�d�,|�\���=ݴHi"CL}!г�ҡ���<m_�~�=���/	٭�Ȉ� V9T��Eg~Ruh�zl��卌�_�_؟C]�.'��#��7�-g�Q�͎2j-�i���z��U���5g�0\�mk��vh]}~�F�����/46�5�?-^[m�Z�v�fOp��=&�-���s�y(��6�NO�9���zذQM��~��|h�ޮIWhu�XTqI���`ZB���U��,�_8>g_�ˇ)֓��G=7n6v��+щ����}��l�o�g�����1�b�\�f�d�uǼ8�^Gp%�rΌ�!��C��v뭦�,��e�C�j��9H2d`���R�M	�KtcG����M[�p����7�G�et��v�դ$A)�S���G�����u�w=o�f��mR��uJ�뱌˴�V�^a��׭}}���r!�V�%�� �P��JW�1o�;��KW�M����L���2=V�N�e^��W�����c��{�Y��DHW�d-,p�`�1�k�����#�� �E᡽��,]��0d]l`�aE���/n��¼k�~P窳��%$�Z[ʏ�z��M�X��*Zt�e��QT� �[f��$T	��2V���\��QG��9���a�жlX蕨���ʾ���?\lZ�7��ƅ�o�n����m�]�z[ġ��Ҡ��Q\�B9φ����bĄh��u|=.,�,�����VLҋ�Ż��/��*	�� Z����5�5Vު��D@ύ�hBk�H��LC�y�Qd5[+�?�6 r����U9�w<�3j�u�kt���7i��y��rjL��7�O,.� �z �B襻Y����S��N�Ӟ.N���3�K6�ʕy��>������ƞ�yx(%�qP��{v�=@%�~�O��r��$�1�fO�.�^��]�x=�E���䒕���*�GV�����ٚ��j:���!��/��5v@q��܀@>�{��A�0���_`�Ԭ��j��I�u �g:�    ����Xr�@&ۦsK;pqw��@�T��BB$.��_|7O#�t�Ͷe}�Q�*��0'z�>���}j�	�#�A���Aג|#��iN�A�#]u�ٽSZ�����*�W�fmErc��9H��v�7Θ���������_�!t]m\��HɈ#ɣL)d�h������o��A��sIlߠ�j�H���+a8V� �q
����X7в"ȩiY�0b���T�M��nd���U4�����dJ1~'��e��kJ���+r�H/����������D��N�<�bk�XaD��Xj9���&�udT�{�Xm昮�����[Ax$\YJ����]聯�k#B6�S��n��b�)����s�o�C�a/u|B�s=�{ā'Rߺa^�����ä���;P7N�,��*C*Y~�Vj(��.���E��0��ىW	��=ց�~��#GD�cF�Ńx޽��k)��f�A��3�������� L�}>I�S��V������2�h��/Yi��'�떋5FL��z�����ϥ[��3��@6H���gW�	�I�ǍYcK$'1��jU�E����>���p6�k�L����a���	�c��E�kڙ�_��j��R�ső��ц� �jL`D��5��<c���M���)9�0or�9��z��r�i{��I��HT���,�Z ��z�h�*�y'?�]4��,ݞ�T����&�����׷'�䬳&�j��y�5�o*'@	ݾ	ƍjrJ8�
]
w������1����kwTG+c�t�S��'֎,���iq&��ݓ�.w����s�pubLp��Ӧ�g���k�e����t+�F�!��ʠx�Zh'��m��<O�z�ǩ�Vj�K��5NY
�{Α\�����Kt�vĞ�7�;1��_�W�L��=^�삛"��� �uS�(�G�Y �����o�k���4����N<����\���B���;�08皟{|�H�	6�s��E�E&-�C��N|����7�|�����p�<�`�;�C�Ay���{��h�G�����}6����� ?���^.з�c�?�>[�@�$T�zJ}uC���8��
�H��'����qjQ�OC�����UC8h`���n�<��;�C���ժ��cP�,U��z��y
���O��|��a2��d�X�qK���6�>����]	�>뼡{�A��@�v�*�ZS5n9Q�1��%�n��-�v���'X����H9��.-g4���=N��a�.Y�] Y�t$��嬁������e��i%O�6{e*/�B%��	~?���
T�,0�D�}-��漂ԋ�ܦW��h��?�.�/��6񤍬�jn����}jd���l�_,?�|�`�2v�s1oT9�FH�����L��|2`w�,ۏ���CDQ��ǉn-8G�Jy���O�ݭ�����X
=f���G�{�?S���hB������ݥu��IQ�T���x�""�;ΐ��ߎϹ
<�3��0��l��i��^��$��{��$.������2͜UH�l���%G�<J�G�zo�6�)"�i������vU�
�Ȍœ�أu6**5�V�Eis➕� ����sA�&H."�`�[�[�A��U�ۏ���"�S�_ ��5�6��%�nl��F�N�ظf�|ƒ����,&�|�U�U��5��;U�]������X~�
!�'R�\V���4�'�))PM^�����G �:���(f~E�^L>�!gm�ѫX�^+{�g�3�}s���<y��%rm��L/����cF�MZe�܆�gǍA��U��K 긛�6�A�O�iUIT���:[��NY�A7�����R�0Pu(�4�S��8�c��yԭi�&�/X�w���Ю�2��c����;]�Cf8�b�5�����w�ƹ(�TA�#-�c>,����8����#��\�u�(;�6~�nF�8sC�K��شanˌ
6�m��bͫ����� ��<��	S'�ˀ����������ЋH�g�&���J����)⒍�yY�昣��~�m�4Җ�:�UќM�f$ۻ��{ ���g/?�!]�D���?�39[&e~���Ͻ����_-�1���v|����N~7��90v�E�`�X�������iD�X}�vt	��
�|����ʸ@�� ���A]ݵ���t�(��9��y�?Mܛ`^Kz�t���.�����c����[���M����I>��=7�P4@�{�������N�m؎��B�>4E�%�;����Z3�Rx�qv���T����"9��eMR:�L��la�G{����?�m2�{D��ku2qZ�합gn�y�gd��aqD�g�J�;���U+��(9 ����/(~C�2�w� 8������Vͤ�ֳ��Fr�\ϟ�~�x�C�]�FP��w���cϳ����wz<����1���d�!�߽qbE��kq3굡����k�Üƿ��7����5�)�\R����;/S��^���Ӽ�>�� ���c���ݺ@*��Я�a����8��
��92�#�N�:�e���z�x�W�rP�<�C8v�,�)ۖkwM��L��@��Y֏طS�c�H3�x�L�HV ����2��� �=��VxY�櫜iA��l͉*0�	_D�=K��YQ��t���7���:��am`a/da��J]�1i�8���)�n�jp����ۭ�����Q��}i�Y��w�������u�?���&�Nr!���Y��	+H*������P*}0BP�R{p�?g�w���F����{Y�����X��F�C���IP��}���IY����[.���7BE�����~�|���wB����|A	/�Op��ը�(�����Um�;*�؍G`
�7�>�Td���[)툳��s��|Cx��xcm}�`�p�Fjst��oL���oX��$����h���Š~�vYqQ4Ii�;\떩�C���G��9����ҥsNI�éIn�RiM��=%��D"%=#�@)q�Q��4V���V9���5�<Кz�M:3��àd Ve�>|�~4�i��{�:g	�y�|J�U�f+L�����^�����Mx��{�߲�^���_V��'�*�1{���X40� ��
�&����7�7;	 o��� �4
�
Vo2��Rv�q� �orF։Ե%�Joq��ɟB��"�Ųo����|�oFP���es��������Q��X��^��R����~�^����3G���k7�fLg3Sj�r�F��!l�WU�O����*G�ڐ_���"2A	�)�/-{�ݳ�T�%�;ҏ�S"�8Y��)G��G)��7�*,q�7y�뒊{�IT�B�������O��{Ǘ[s����|��3�>.:���J�!GrY�����6w� F9�|��D�fP�ן����4,�Ұ��.���@U��@�.)o�~���g}�,�-�%���zu җW95a���]XUޏ ����uӬ�R[�n��	0�,��i�S��ś�o��O�f �4{(��f�u�s��tI�2���aY<�	p�v_�����wOؕ���H`ytuk���4�fH#2N��,TRk6v�^�9X�{��e�*n���A�X���A��Q%�1�y.�g��B
J�˴�DJ��w����m�w��g�S��O�/��Hnfw
�l�.3&_�UG؊G��҂x�X��LD��j��}vIqg�ա?��U�\�n��zD�A	�FCUo1�DuJ�:�ع�����#$�w�|�W�wV7���86�ޞ�Ծ/s���+�R{oU������2}���e����\�`��75N8��y�M��NG�=y����`��b�R�>/va ����¶QHe�amh �d��"]��l��!5V�����Rp��?�-�dugγsWA��*��'VPR ��ɧ����]�w��}I��~�r�Gb��ӌ��;�n��3<a�d�����hB&�����N��I�<    pƵ�JGo'�;�Q���Iw�K\3*���J�j����D�_���v0��wy�R�	���^�x!��"�4�Cuۓ�ar�y3<Y��5H��č)=��Di�u�
�92-�!�Ʈ�����0:^��럌�-�%�C�e���.���p�6�`���'��}3)L�nwh�7_���7���:����|���]�or��0º\[���L덓�'�]�6>�w<�s�W|4��� mᐯz�����hD~7k��[�7'CD�Kn��Q+7U��u�nlI�2@�ˡ�*�/�ՍY�1��h�I�GULl~|9�9�)���±YsbU�5��A��<���6���"�=�6p�(I�Gf��,I�$ !},\N�f�4�wVQ��ݡ��ؚ�l����IIq(Bq��)� }Hov���U`�rs
�״�p�GGSl��ۈ�Fӣ7���Lߧ�~�Ϸ	��c�16�����QJ�]��N�E5?���h9�S���M�����z���+CI�˒B�:+�gx�Q�9	�Xګ��!ĵ;�H� �MS0�w�W ��[�mf��݃5��@)������E�|�׼������}űXD��T�u?��t�J�I�翍	�Z�&@�{�j���_��M�dJT����9����{zM�,ZC�
C�J�|y�H���pô��R2�z�Y�ߕ�hx��!�P���7�ALm����n����\:4���)+.���؏�(X�
m��;�R����$,��⧨c$�<:��t��
�wvC�c�c!�p<D�ʭ[VF������!���/M1��hs/5h���m]����8����C��8�@@G���fƣD%���|����5��@�V����]�9w%d�xN���`Q_=H�N��Ɖ�0�5MA����6��<�����]����6�kA��U[h��*��HU+��ϳ�M#�~��ü��<!�{1(-�C�VgB��B���K�W��f��[��ҷ���*]=`uo�b�u��dO��e�0�_�~;ɚ����l�ط_ث�>��7��JpU��^Љ�/�$R�_��=��i�֘��=�ӧ�����>��se�!�j͆v =��z���~^i�i���:x|oE�J$�e�R{�M��C�dz�T\�r�G�:�O�����ً;���<KH����}NV��@��Od|��!���L�ǿ�ZA���b�}_nE|V.�k-����s-\�o�s1R���Љ৊]"7 ���+�Y��Y�*bp݋�����@r��uM]D:�B�ɫHM��G�ď�j���b_���O����D�8CB&��t��ږd)��6�/t1���Z���t�Q짬v�߶d���<�L��Uq�&��|z�g�_�V�ː��L�/{�"���fDpڪ.�m���d�=�"acS�m�&s0ii���MU��?���n�8�q�C�L��ȩ���ۄ�S^ݾ�㣂 '�Q�n���{o�*`=�����!6;�$[���mJ?Т��[W���16~�0£*��P����Vzҗd��B���|�ϔ�Ee�y����狳��f�v2�Ds�U?����Y�5cT��_�"����37޿�T�x1��+���}�L:����znӏ}���t��j촩�L��E
�]7��?�^�������L���u����H�������q ���)�<);�X$�pp��C��Q@Uu�bF�6��3f�6W���=�Uٰr�"�qj�a�+z���t&�i�u�R��0�p>��b���1���O�tz��Ϯa6�T^��_�w�n�ЏK�.�49y������m����=��lIr�Q7_ƈ.�=e�����#S'��U_�4:ط��)
�N�OWV��C���vA��	���RM	����
���``D��1b�4�]�v��8���%�T���!�˱�D�b�U�	��c�&�lm	4��S�֬����Iq��n��o��Έ����P.fyޡ��y{�g�lb�5���^�jA�����֟&�Qo]��py��?l�]��-��ר��z:��A�������7�Xy>�c=8)��j �%��9�����z7+�4�z�_`]N���[ C�
��{N�1�A �ްr|T�;+p��j��>���\>C��2�6����;t�}�W�Hvb���}17���%kZg�m�=`���g��j�l���&���>&�&�Q!����Ev���U��\`��������~�o7����m|��s}���[�bxz�8��b&a�I�f�O���{��ep��	<���2?0W�,�Y�}��՚TDI��H��Q
�}�}YU�^��P���{���#�_y��'-�Nm[e��+�[b~Ac���h��QN�����F�җ^'�����`�S@|Q�������!����I��m��C�q�T�A�e.�d,��g���5��ZGsڵ���o��x��w[Q4*�B�5
0��~�����~���k�CH���ė"hF�.`�i�Fl<�:s��Bd{V? �"O.���A�ݎm����xe����A�ǨE
����tS|�F�7H"F���ݟ�Z���i.�_���g�����jqM+`�}u�r	��؆&�N�A-2��3�{\.�R�2��د���_xpG��zH�o-RL����a�U�*KkH6��������Y���2�o-`�]�0�Ģ��h�p5�ju�B�Wr/�a=kN�moV/���7>-�O��j&HhZTwp���!��r_	u�R#D1W���C�Yl߭�e�^�8�O	�́ޫ��鐜�t]f�P8L@~N�^F��<���1]d��O�%�&�)ҝ|���8f>�I�eQ��ڊ���3%��ڻ��������y���S�ڴ���&l�Z-�O,Hr���1����W�?�ܨ��fq��C�uѼ0�;�*z�:}��r<V\3��;��hX5ˏư��F���b�zA����i��y$#6�M�Ԕs$XO��M����>#�����I5)cʝ�7�}`7�9��8�M]V+�4�D�uw|�$�~������(��BC�5.����P2����a�>��V́'��J 6.-�D}�O����(v���ޕ�bm�n���T�t?���ۭ���"���rh�鑠5�%5�O)��yQ�'�w�~�{�/wnR�*��B�I�;��x�ڰ)H���I4l�*�wH��B��Db��k/gw� 5b,�OB��9�ǭ[p@��٢���J뽫��̮ �����wh���m���K?��v�����Ɵ��	eR���m��P d$��嵂�y�3<�+�c�|z���������A��Џ�K4-C����Ƽ�)T�C1Ʉ�I��B�U����V�K���}}���SL��q�Z����[V��\P��/���f�b�r?�[��T�^��qI�Q@Z{��?H�����XUJ���/P�UҾ��}�@�=G`�s�!IC�g9>�;>Re(3�Ñ��I��=��*�'��vL��d�<
SN���]%�J~�,тy��i���]����-�۫����h����g�KۛXxJJ��{��;�B��l�ܖ�@��_<����E��à��DˀΙj���R��\��PoM֑8�k�A{���n�?��"yC�ml~Y������<dC�2g�.�:p�G��߀�ʓ꽬���s��A�}�k��D�xC�]�ouzu ��w��7q��y��๟6�2G8�"�V�Ց.�Xid��P��he>� i���-FPjx�	������q�����(-~Iyx���q� ڣjIYC͖,����!��Ref�
a���m��ǤF���#὇f~���@�{�uZ�M?� i�z��e.�3�{l���ۛT(�hO=s�FU#�Rd�Qk�eto���*�����z�p��{U�U���j��Ώ��)�V�ƅ"�.��	�1u�V�5oUv���p������G�n}T}۰l耋i�� nUotE��$�b���[@=v�#�м��4����� �  �xpW;�Snp��Ӥ��^9B/��-�;���hngQ1���9�I�]HB&ӆE�P���n#a�a�X�g��)�
{@�Cq��6މ�v%�@:����3)�؈�����LB�(4N�fu��Vj)���ӰB�U\��+���7	�fţ�腝��&#x�6oI���R�߈Ic�Os��+��6d�j��5p��6�7��w����w&��:R{�M�e��ʹ����H.�(���)������QA�d%�?WKP�ߢ���k�b�l���h3�b%��J�fw!���6]�Ϙ����Z?w������>CǓ-���pU�B� F9gK{�|(F���l�����qȝI�}L��Pt4@'>�����S:�e\�o�7��s􃒦3�X��=7D����|C��X���v���۵7-s֘������6�~���M,���f��J~�r���WZ���g�9io�:t ���_�~C�]��[Ԃ]R�[~�;���]=�t7�SJ�p��B�,"t7w��73�?�����5;�<�2��\"d�AG,Dݘ��Ȣl\�{=f��l���ݤ.�&�5'�e���d��BV�K��d�ᆛxf/���T����ml�M��k)ۼd�#|�8��#�`����b�����$�,�&A�X��A������K#��f�q�Ҵi9���}��)�d�������.�̖A���$����N�]o�8���w�����á��8��lY�u��
 �
��f�Wr��˯�e��8.�z���3[�ţ~���e���?{u£�?+��f���.�U���*z@j���@��m�|f<�a_H0�q���8P=$GRW�9Ղ�.�AL�*E���}[t @�)_*Q�n�B�>-U��
rhܟv��7wCV��u���[���o�~���|_:7
s�,1�e~���5�~s��D����Pu��B]�J7���~n�2o�!�W�"��4�.j*,.Nq�@м�ՎQ�o9�E�R��|-ڹ:!h��KA.0������{�,��9��J�y�QԤOҬW'm���@���SšJ����S��&:���q�ɣ��
�h��^���Fv�k�,HP�RsU���k!��Q)y�hc� �r
@�E���" =���=�F��H�D%�� �B�,@�@v�ֹ�I(�7?�|�]���l��v�B��?}��F�KBS�Ni�_z?{�560Ԕ焿߄�=�T~��(Gg1�Hvs(���U2�RT�;	E�����'��-Xj��2�GZ�����3�Kз�@\.�%'�i.{w'1����ص�+�]a%�ɜN��p0c���� �M��q��!��r7��a���!��К�1f�am+h��g���_%�!㯾y��L�[����e�˵��#�\3ct��6�*��+��1��@�sٽ_�G�Cŷ�55��a�v,'!�<����_�Aj��#��Ɉg��j�V��Z���f֘V��{5�6��*�YY&Z�n#�G�z�3j�x!s���SzeY����<�sǿ���s�#Qk}��f-{򔃜�dtQ�[F����"��V������4t�z
��M~B%�U�2޾F<����ѥ
����!�\�^ qK���'��(��]� 5�� -�sU}P��RAZ;�~@��KD� �TAB�j;I(�F^m!�����܎Q�#���eH�I�
[p�Mh�:Ja�3��xK�����8 @	��r�^�{���W��ق��ܵ��R�y�焣96����>k4̗�3=��j�[3���9���I��/���Rx���6�W��G��6�b}P7�¤���>zt�^F�dM:؄P�') �S}
^4}�m��7m��\T�Y��ܲ�c#��}����޴A�8A��N�'� H.Yb�,�@gů��
�
xٖ�.8q*K��Q�M��FO"O�,.��[���$�Ú��p2�~�'Ѭ$�d�#-���t�9^hZ ƫ�W��qae`�˦�Rv�J��\���� �{�y����=xK}�45�Р�!�4�'�Uo������zcnx��	��� �BP�A��M��9�=�;{�6��y�w/E��&���*�a�}^%L�I�u��,���dG�x1�2Ro�P��j/�p�z��ζ�n��/��̭͐��N�p��j�6�?�C`]����;/��C����#	�=�����U*t�ֳ���Z��a[]��O����4a'V%��?ǢuJƖ����,����%�����@�>c���Λ��?Y�q�'�Y����!���U|��u(
.�l��<���ne��?�<Y�h>aJ
��1��R�o����^�U��	G�h��/�u:����2�fˎ�!�r�b�:;��/
0T���Rh�4HBJg�s�#��vvT���^�2^��Cs�s�+�ř�̯�A���e6|�e!O�2_��N�A�a��c��8�L�E('�E�د\�,�,��3��j�&��>����I3��qٯq������t����R){t���ZM�{�� |�8j����6Z8I+����l|�v�4��b~ϟ�|�i�q���ѐ\�N�c	�� @,+gG +���}�Ŕ�搝j>a������mCU�y�_���a�lQ6+�ȕ'��T��M���e��|T�wp=�+�p(Un|��`q4z_��/���qb�	�ha�p(��{@�� ���,[�(�b�5���>?�
vkRrr��:�  #˾H��&���ᤨJK�X�VK:\z����8ʸ�:ջ8  ��BGQ���nvA]h��Z4G�%={���|�, `�}��e��V���ps&<�y�O�*
1������@I/̄Vۉ�+w�sg����������x@�׌�kP�r�`�y��\4�
��4t������NyN;�H���>�4`�N��;QD���2��p�H�h�*�NA/��2�/Ě��e8�L�X��t�b���!�֪��.�a~s����U��[O>�i�ľ��L��S/im�(��x�����/^p�4g��֚��~?�K�a3n�Rw�ٹP*��y�-�R^o^�:�W���7�'zҞ��d����o���!;��|Ӳ�1��[D�kV�$��ܐ'}P42���;���]
���de���V���!Lv�����M?�+�]��4�'4K���I����gY�{�R՚.d����E��|�'������~�p�P��N%�$��}��'Ϣ-xN&��N��i5���}ֆ��!�t$��Z`���fw�	��W��kƥ��Du)g\Df���iB�q���k_A߂�jmxwM�n�MM�� �?o�3 �����v�� pb��9��ܓ�S�� �f�'�Z��W"hB��F��>�)�@�����PJ�0V�G^��v.��3S�SA�0��x+�����m�V��~��Ͽ�]�w�׿��n�������?�嚽h      �      x������ � �      �      x���G��L&�k9���*{�w��Z��Ŏj��&�rЃ��?�D fv������`���'���_��0���0����3�����)�f̗����Δ,���ɖ��fH�����7Mւ��?���	}�jbޗ�x��U�o��W�����1ǓjG�PwlHa����=Z̾�s��AE��w�	u��ï��<���,�'�@�x6��uA~ 1bݐ^�N+������/��9�9����+�/ws4�=4�T���QPj�Q/7OA�Y�㚳;%��-;�X�G����Aѱ��3`N�}W�Xi���L6�������е��w�fֺ|���)�$D�dSǘ���X�+�ril����~K�&]*�w�9��9n�40)y��~�$��.���A�
[��漌�5\o$6�dO�mQ$���;Ȇ�n�Ey�C0=D��ۼ?�`P��΍�!�?6�$õ��N���'z�*����g.�k�(Gj�)�_�]o�Wq�~��t�j
M�H����Lۿ�ƛX
Ӳ��JN�`��n)��ꈆ��-*ǹ��#n�~��������q*"j��t�	�7�[���4|_�wͱ�d�c�{�|�k��x|���B�Ⱦ��z�[hOo?�:��>���Ze�%�tTb�4�3:�<_,�R�M�X�b���� q�Q%#0	�5DǾoH}Ga|
�=�@|�`c���/G��)���(�\;]��Y�E�����Cyێ�H��[��5rg
��DD����g��^a`n��
�BV����՜������	�i�U��� (�94���	�_���'ۏ@�co������ÞxJ*�.>���d�M�uc�;m�6��E����`��ִI1�+G�]j�?"�0�oi�e���ݑ�"��Y�>�EJM�R](���"l3���$(�*�4��l�xO�i�j�\QM2�Y��8 r��pPo��
���j�(>"t��G/����+7wQ�,p�\�կ9Z[�ȏ�� �(��I��P]��T9��fd��D�9i��I�������(���7�r���$��M6��0��Gsn��y_8Y!i��_C�	{?����~�J�@�H������L�8���pN�Q.n�u覙��\��+�<��Q��R��@�����"�&�p�
6����P�⌽��n8�.��S#��G��Ҹu�;����1UH{/`1|�s6���]9V)E�5����w�m�U�d[���kF�7��z��FFK��6��Da��@�} �F���Q��*���Q�in] D���ma�]�W�y�k��Ģv��c�W�u�5�f�nB���Rni�H%�`6S�_����T�����U�A\��^S�����j��zA�������
�M�2�>"Ü%⇓M�:��
�z��$�A������\��"K︁�!C^�/N|�����;
ؘ�����(%I� H#�J�B��{�̘*�B�J�ry�1�M���ǡ8?�H�v��z���\?�r=Y[i�
�?�7 4���YsL�K�scVUo,_ �]��)ď ��l3�$������Y���k��2�����,
��e�Y<d�QLX�B4���)�%�:�+�P��4e�G�vs˵��Z���yy%8��u�&L�Ƥ4mp�c�+Km=,V�ɜ Ǔ��w��:#�i���3�Ta�N�r��nQ��/����:����t_b�+�}A�	;�o���D'�f���j����=GYOY�|��H���	�NP@�NgTn}4���m+�akE��h�O�w*hOq�o�)?�ً0`|�c����F�#G�Q�
�^DV�=�32��
<��-�_���9^t���T������1rBD��1y�!Yo�3��Z�f��lp��:�J�mG�p�Ki��V�=���W��w�}��,[ƚ72�F�9E
�#C��2�N���p3��ꅻ/��Ȁ�<����|�{t���6����֨a��Eޟ�"an�	�P�qdi0g�P*.����p0_��2��^a^y�r$X���v?�9�^֛�oU	��im��wܡz}<2�e����x.�o.��l.U����fuY&��3ٙ�O�K
����S꺡�_�r.7�����c�܏z�ꑚ�ޛ��H� ��z���G�7�^X�Ŏz`�+�!�2�Δ��V�sZ/���8'ww���YdM�K4�!]�q(y��5���2c@Ҩ Qb�[�d��9�{���`DEA�*�j~�j�y9�4�A\0Xj*ƕ-vb����I��@��L�XT��^�y�WPX�����q��7��2��L�����5�_��|�oq�W�=wD%���D̒�es����n�[.
 i!%��-Rh���K:��qo��]_˞/�is�8��B��A�뜯�g�?��E(>�<��h�޴�����t8Nُ㢡s�_[�[����ո����j̋zV�J�U��+o[}oA����[�H �y�� ����R>�M�e��r� ������Lm�cNv���%(�$�J=��Oq E��#�,����|���y�U��n��C�ڋ�*��Q��Z����,D5�d�MP��I�0���t�L�t���)��(E�ߠ����l 4�c���P7>�s}�n��$1_���*�Q���;���w4����R���ol~�`ur�%R��_�
㊫�bU�Ԛ�Q+
�*��q�i���jNM��|��2>�?����IA8��A�tfFƸ� �d	d�ʽ%�b�M��^�w������E/�1'!'����릉���(9��^�X�]�ڗ���)8��E?����i`Z�8��|/�$���!R/ܣ䳄S�BrgdDi� �T���HA%�]%�ԏ����z"�3L���K�i��X������pg,��������q�������-���ޯ1�t��-L�|�m���޽�/�#]�ŏW�\�]�֤�t��Y[�f�3���tQ���0��\Eo���`(�.ft* ����l?H����V���7��U�؋��;��#�j�!;7�x��N��c���9��%ԁ���H��.�H60�X�DIZcڛq��:�T���)ːT��4h���-����-����� s�No]���C䔦���`�6r:�_�U���q(��%W˝�X�&�e;�+�a�K�
_��բ||X�&v�rO��{J��W(R��t�����'�f����s���y~A?��UU� S�D夲�d���]+�rkC��>vʵב53��7<�ҷ�;�9��C�UV�U�j��=��('��vD�?�"D��!i�<���`~8yU�z��C3��:I��q&k#,���Y���$N��A��̼�����-�4	A���,�%Pk9-�8�LO���$bڋ�>q�Z'Dj��Z���="e����`f^�*ހt]"?�p��56#3��v��g~q���ok|���3�PQV�*OR��(ʄ�H��臓:i;�sR�Oom�"d���N��
��A��Q ͼ∁�Kw�j��i�!gV:���_�\��Kw>�NA��i,�I$����庒�υ��a����P�����/�����mI��B�l�)�W��E�AU��%�v{��N�Zg, l��.;3]L�	Da߼<A;bq���ļiV�W��lo7yF�6d�S :�9H��qʣ��1���MY�nY^CQ���� ���ěpA������l��Y��T���0�		U��1�D�i^c/l��������4o�
Ï&At����m
��3.M;ª�IA��7�C^f�CV�QK+�t,��`�[�� %���a�,t�Ė��zs2yCʹ{�x~�s�<(�<������8cc�X��i�P�=B a�Et��N�X�ϳG+[c��� #��].U��d6|C;�0@	u� YU�h��\Ӓ<��������ݺ`{���mx��>\g�L�[�K�=]v$��-J��_a�����m�mM+>�,�LS�YT��������è���WW�zf�<��t����D���b��G�TЖ    ���4 ��J����K��tm��vt"��'�~��g�/�p���t'0��w��X`�3�����^C�Rо��r��~"��k���b�B���O�cJ	x	��Co�����2J�A�?����9ja�oM�|���}C�ϯZ�GlS&h��F��,�R�mUWh�P^&�#NÁ����Ŀ��FQ�X\a������N�g[(S��	��?�G�zx��}KE�PIPq3�T��D��`v;�<{�#�^�r����z.o�\ǫ4"�g�2�`�s��O�������θ�?���~8r�6<�n.�;�1�i曪����>eǓ�9��꜔���aՆo!A0�ܹA%���,A�	G��_g�c��������^�����̝s��;�j�!���q�*5"��;V��lӳ�ϘȞ;��}�5�%�|��²���/�d��"h�b��~k�k�5&�i�l��W��e�5���H�M�k����<���YP ����FE��%pw��FZT;�=��寗ıDֲ��/\��(tiv�Z�ڨ���I�c��j�&K��Z��K;���3�;M�$�¬�r�-�(}��j&���x�Y�&8����I�ife��
��Өx�TZ�$?��01L���|K�����~�G�pV�X⊮�����z��{�?���GI�`���}�J�����Uu��
{�o%AR�bòw*�O�����8�W�:,�pvl�^�R�Y{�J��Y���>��8�����O#���*ĈD�ԠjU_`��l	�{L�9�㏛���|2	��͔����S�Q��L��/���/U5�Nh��҈�c4|l�����b�	*z���᚞�Q'Hw~����e���{�j���WDų�0�{�Q�#����&�y�-\�|CSX�ig�k̫�z6>/�2�b����W�XrP�ȁ�h2�<�����P��x���/zc+����������-Z������N����3D�O�����Q䇖�R��Z�S\(�i?dl+�->����"p%��rUA$2��R-9�%+$�&��cT�u�D��i$p|k��R���7N�f�~r������Ca�`k����Ī�6����;���Z�B�>�K}[��(�O�7 �/��4�v�*C�.v�Ҋշ����U�Y����D袐Ȋ��Jy�Ͽ�Q-MčD��[��՝�@�{�5�:����L��o]�d!0�*�K�'Q"�y�n���Ֆ�*P�jՍ��35���I�g��:y�΀P������i��~�(��!�0�{�)��Y�o.��f�e�K��B�B��o0�����}�.g�A�Ѳ/%� ��m+�|�j⑜%=-��\q�g���h��3�Wl|`7�O@�%�� ��e�e�b���O�l+������8_�㟙�	��?'��+���	~�@I��=Ӡ��a	4��1f���g��̷�5>�q��6�t�z��gZTв�����C���p���

*M��֩�3��ܒB���ˢ���⼩����:e�z����Ǒ��f��|�M�Ni�t���b�l��4ko�gJ��3ʛ�q�7\o-����?�}�v�T�����@^� ���:��V��e���Z����p��%��yo޻�#�p��;]\K���ju(z�G���)r3Vь�tP�p���U���%y㾅$f���b�`=����{� ��E�sI]�e*l�\�^U����("�J��������J��ߚ��,�&6%X枮ß��H)y!��G�=��S��|镚��d���C%%�P�=��m�A�J�
0����I��OD�t�q���8=>�����؅�OK
�}�yݨX���ϻ|X�w���,+ �}��n��X����Q0����:���*��4C��v�Z��L>`O�{��(D�~��I:�� �P���5��v��Po���"���g
~|����z���fu�����y�nI�|���8�-t�o��$Y�]�����۶Z�H|���)��h�_��O��[��1(�F���ƅv�tP�UO>ǣ�������B���/�c]�$�g@��S�}=�7ϖڨF`˗����M��ƅ�[*:��L�u�F^[h�C���V#���0F�g
{݈tlS6�����?~��R�D|u!eM�7������N&�� �ET������3�:!����z�G�0�J+��Ėnأ�A���yF(�e�!D�0Av��a�����[��Jwq����$}!~���r���[�t���T1�A�5������o�$���i�^�n���.\h��cO�ޖ��Rf���Z��H��8!G������%	�����P6�y�W� ��җ��q�օ,ʰ����nY>H��B� k�o-?�Æ�O��|�ha�i�6�@Qp��qH�.�ܹs���{�a^\h~��x~��td�1-.�n{�����W�=Tf���çc&�΍�;��z�\��02%��q��_�����̛�o�7_Q
��>C7���+%:*Z����/!�^X:}�Ʊ����WwLC(z�� x��.��P_of��H�J�}�D���/8�Hr"�3E�.�DcǪq���5�=3�#�#��,�rt�Ԥ��A�3<K�B�Q�o�I���<�c�-ݷ�����Be��</�_����lR|��K�}zi�V�_+S�DBGF�U�+	���j�5�~�OK�b�#�:��o��
9�K�V�X���Ԇ��oELWX��z�h�!��eH�Ê�Ȇ�?uy�DWf`�/,
Cm�
P.߸NV�l�4�p�i�#Ԍ]��w�
�!եq�k�õ��r{Յ��I����7��}���u<��@�)K�j�����	q_�{��C_=�ļ�5�1J=�SBn�����	#�~��h�������-`�(ѩTI���J	qVW�	�Z�B��ku��i���tQ�)ԇ�|z2<k����A�^g:�^`>*���&��_��C��U����g�B���E�	I'��	�P�#�o'�L8�v���
�I X�7~�Q�/��u���$��꘵&�R��JX2�����M5�E�w�R&��7C�ݔ~�]������G�Kc��y��)�t|��=���u��
�� ̇\�~��~ʻm��9��ɾ�T����qJ�i !���p��|=v���e_h&�v��^�S�Z;��/F���|^�0`����R��~������{�C>�c����=���2�3*�5T�[���V���hYT��jH�'�m����G�a;�b)&s{���S��qf�׫�I
��f��K8Rc�}��M(��B\R9�T;L6���xP>B��_8�D?�^"y����_q��G��y�E�8ʩx���kǊ��T� ��Z��X2�H���w�6�RПz��a��7����p{�u�" `��� 	O�e����պש_��+Q��7ŝa/��	㩊��0�����D������� �3k���%��$cr�{w�z��&Xp��pa��i�>p���c��؜}��L-�����>�䂌JR:�kRN�5E2,���H+H��u"�� O�^�Li�
�W{����_AngA�C�~���6��8��*)ܩɬ��~`C��4��0��Y��-�(�[���������z�ܘ2�ϫ���1Aaj�������p��C�M�+��AQ��t& �_��Oo|3AqF���BH��/��'�����۞����?�QSC���Ŧ��jE/���F|�*.�V��������4��.������d_Q�n�b:�*@��ދ'&��Jrù탿�n���`�E��ض���dSt���^~V|̈sU���;Hj��y��6���m���|Bqr���.���!�6E�վ�S�]?(xRʋ�?T�ñX�]�U�/�u��w�{��N�]dcܳ���hѝ���^k9�u���W��W���u6..U��O�s,D	��c�0z8R
Ŏ����3����P3Y�w���I��]��� ���    �Ǻa��!_�Gq�"�z}�iR��V'c��8�A���}cRQ�����ߺ��90�<��>˚pW�2la�o-��'[b�k��j�=p��9 �w�K�S�W*<�Zr��\ �DʥR�`��ڈ�k6��˖J���xp]����F�9ԨF&�X��#C(E[\3��x��'��4!��\� �)��Τ�>��t��-��72�:s�(�H�۴��uv�L�U�dګ���ų_�~h��HnVBZЫ�WCG+eu���\s����"�r^�0�{�,*��'O�D<����e	p;�U���O��q7����]�� �;�~]庵��:anX{	�IDV����� t����7�BT�A:����Ժ���G��[���;�� #����Zf���	u�,w_9�o'c1Sn4�7��҇�0[�Ýܩ�u�+��g�+���3z�+H_/C=�����o� �(
��7�W��W�|�1e�űV>�8� i�v�6N��m���i�:�L@���9�� ��3k�K�XO���[��S�#�XJ8^�-c�t%�,j�l�D�\�D�s��p�'���� �b������cR����}i���{�6;��!���:�)�	�n�<��j��I���!m��A�*ُ�/�/t"K���e^���0a��.Н.8E�U:��b�Ϥ��䱲�ě���cպË x���hY��j�X������2�W/:��J�z��r ̟6Y�����y�<�Ը`%�
�:%�T�n��JqxE���X�Q��?��9�#��'!���e�����r�r�z��p5i���S��D-��K�i���w$��(1�r�I`i�v?ʂS�m*
&Q� ՗߾�-���������^P-@��J����d����Fh�S,+#<Fdaf� X�Q����8i��}Í	b҉E6~%W �~_n(�J����@"��E�O����r{��Y��o������R��Z|��Q�����o��F#*L��k�o�E����cV�L����L���!L!����%� up?>�c�,W��Zq���,o�?�S�ʟ�������ٽVj7�Y� ��`t�^j�F>ǶрD;�AN�iJ����K�D\6l����i�h����J��E�C=��dzD��e
��ZQ�2��d4[�vW�j����IHey��@al2�F�i���)v��������e|=M߭3��o��P��+!��Ȟ������y��D�@�"�Ǔ��;��_pC-5��w�c���!�5_����l��e_3�40<��O�jǚ�J����i>f@��hR��������`����/)׍�;_�ԫ�(z8�a���g ��y(	J�:�@�ށK��$^)�+�E�˳��I��>$ ~c}8�!���&I�|���3S6��׊ҥe�)��������e���ݿ%i1�-XI1A2n�1��Y����<������^T��@�7����N��K-�tJ�G7T�(Iغ\�~�����'�߲?�������e�+�W�c��n����>,{bX̀�F���Ei�3�U�:��ˆ�/�|}��D,���.�2������M�H�����6�:P���A�{k�u �7�m�����{�1��h	�Tu�LnQ�A��Kw7���ݾ�N*��c̦k��v$��5U_�x�h��Z}!}f���X��1���7*�w��������_F�e�������-69}k�%�hq�A��qHR~F>�>,,�$�s����ƴ�*�;y݌wu�#����̐z�|��ͩd�)��!&b�z���yV������X���5�D�����D�x���R�~�$�s�?n���އ['���Sʵ�ظ��^iḈM2tB�Z1��#���-��h{Nc�����*#~%>z��/�����V|�j9ƔZ���舣[����6,d�4O�kϙ��6����U����f#~w���-�jf��σU�B�� L���ݞu��g�����p����+~7�t_͊f��;�I�E7�ׁ~���e�/|��ZU>}�
�����"Ě��>0�xs�!�8~W����O��e�P9A`�p䳱ώ�S�-Mm��.@u(�1�8�R�_�suUz�MbV)� 1g�V�6�(��M8�Jx��O/0�l��бŴ�~G^��^�$�������~6GFx^^0�I:��rOK�x����kaT씉�OQ�1يȨ�.fx�k�!5�+�h�9��C�P~m�6�,55b���V7e���nq0�a\F��<���ח.1�C�w\���pS�ݶ-��x�+=.ח���nZ��QV��zX�(�FP\�a�f����6�sG�;�w �<X�@�z�)1��_�WA�i�u1�t�}~d����ȳ��rʍ)*�m��r_�l� ��z����a
��+��$]-Х8
��� ��E߆�m���G�_�cƏ>� ��:���K�_����vC	s��F,� �z�%�?*~4���^���������\2�c�#�1TPlTP�슘+(�@�QM��)S?��@�z�ӯ� �-i
I�U�����e6%���R�9�X��I���ES�p r\��R�3\k~���m���>`�c�C�@x��4]�eQh[1��Ű�nJr��u�[�N[�$��2]��_�.�����Euޮ�`G��äl���)�	r�W���'m�xw'�����a"p	�K턔�J{��M�K�P7�6=��O�u9�c�ZT�Q�zf��
�잾2�V+h��М+;k�����d�^�r����(�xۇp�w$HS]![�0�P6�:π!�ڄD�Z(�$7\N��4�����at{��K=^���j{����C�c���Lx���ۯ�����ut�#2���7%W�`D,��<��B���!0cmJ�^��k�:6Kؑ��,�6G�^^u�p�A9����F��>�~)�Խ7�`&MP5�\d�־I����[�D����DeҘ��5
*E�0��7���2Mc^9�u���O��p��Y�uƷ���'xP�Kd��(�9��y�"��(���U�G`�b�`EOTW��~��z���^�"�4��#�в�'�b!�έr�q*p���KA���8=���*��S�K#���L���5�al���fsrgc��bd�t�!�����;�����bR2�m�F4��%�"�C�E�>����6>�
l�rV�A�:~����lw�t�:tȰ��߂	�r�8����d�׍���}R~����"n!�^/�s�z�����(�r͙YX��J��b�T�91�>jf$�6��51��j"��j��S�2�c����^e��ȆT����2DmL<����;��D%�Z�H�Z��f���p��۾�zb3)�R~Z�4~���)O1̭1����M�Y}K^��Uދq��[\��xZDUg��~�z��8R���SqWE�|H����v-��5c��y	6�Ӵ#�[�ǟ���2�v�'�ц���_�^��@-k�� w }Q6O�Q.��ې����=�~�p�b��������hr����I��N�N��@0�����E����F5�Y��I��I�,���~�����o]ab+VK.���+	�$�k��I+��nx|E�1�*4�u��[�8�f~y�����.���A������i=�(*�m���_���1'��1G�K�*S��@Ժ���^��]�s�#�-�;q)�NT�|���a���	���­�&�k���Ufi?�g���U��5?�d�P2�t�\Ԇ\t�v��V�.~X��۟����`�c�A�9����
�{�������N=�(�
�������f�=OBN[X�HkX"�
 I:��y "��7�X�5������z�F�"8\;��gh�+M>����L�űW*�[�����	�a�#Gё���p:5bcӚ
gz�����)�dE���~B���Tk�����y�I�j�����Q�إ�����N�h!    !`��4"���K1R�H|��W(̹�J��M�Ws��w�)�����(5�s9��`�=��{Xj��s�ڀ��ګ� ��}9�-uܴ�ho�&����`��fl"�'�_����	GT�STQ�ƴ���0 ��K�1АR�l&Bଘ��qcaef��l����:�ZN�}�_:��,�z�k���u�J8 
傇�1\��C��5콌䰨��Q#z��ba��L�G] �Ê���ե�Q��a�<���t�,�m��������l/ m�"�����[��O��4tK�/$ɬ�N}�gM�K�E�7}�'S5Z���^�_La[��4O�U�h48g�yŏ��۠_Ɇ6�'��z@�]S��NO�'Lq`)�&�քp ���j;�g��x{����ʇ2�\�S	�H��ʺĢ*\E5��;��l��p�ׅ:�`�HA�ȫe6F�a��3��f�5����m��U���\�[���2�S`�t�9�*��j �-Yo|N�����{�,oq����>�A%�K�w\�<�X#�īG�:}�E�$�N�v��NV
k�EM$c16:���xj�Q
���� ������e��eۚr�e	�����y	�=�J�X��l���s�|fU����'L���S̫@�z���ǺF�Nu*�1J�%w�����שU���h�[�ǔsR�s��K�K�K�f�$zF~� �c��w&8��g��7H�Ѫ�QnӰB���� feQ%j��?�246�:��*��i^*w�"H��)�3á�ϧ�@�Ѩ>�;����H�R�%g��BQ�=Sb���EH ��u������^Sb�'���@�NoG�X�OeYgns��A�S��Q�.��b�=��/�5�fAK�h�C!��Uz�T�M��y�qX���`ۂ�ž�m�;�B��Y�ӌ�F��}�4�za��ˌN:��8��b�2�e���YAP�"� �,�Ś����n��I�e�K�O�>wV_Wu&D�^�_!;&
�9iȩ"2BF��;�Deܚ�t/��_�*�iBq+!�ı�y|H ֡9m����ؗH�O����餠����\�u��S���+$7e���T�g$*�Ź�
�/�	�ʇl,��ڃjz ���" ���`�c��#�/8J�aɒ*	Yl=��/.s��3IŬ��C(-�ҏ܉�| �l�x\�6�yn��R����F��8�A�R���8�AO�~�<��`���M��f#� ���Y�H;V��j0 ,�O,f4֝p�i���-�'2�;%Tn����AV�3I��ƛǯqb�a/���	��*��<�#�;�o�f���HoIc�s�%�~�f1y�Ȩ�����dFx�Э������&�_�V�7u?���Q޼=��o�}��H)�i">d�ug� �������>�L�����Q��K�K�H��_YBQ����|u����Yq����&�Tf�TX��!@�q��
��vs<��jAP�l!dU�L������&(?����y���N���"�0Jp�#x������M(u������0�R�H��"*T0��292WY�� 돫$_[3��cQg~O ���b�D7*���U�����b����ZK�j}��5Z<�S�l���^cD,ہe2�������f�*��w\��e��%O�/&]�von��_�}���J\���hȫ�'33I��.>�-����h��&ͷ� �@6/.��o��([�U�˟��,���O�0yN5���~��1ݲ��P������k�k�[���,ʑ?G>{HM7�T`��r7��%)}NDݟ�q�߁O[T�r���jr�|ǹ�1���%�A��[��ײ�t_�+G�Ԉ�=t{_s�������({y�o��T���L-S�?���xC�M�;�8��!��uS'�����E��r��l`)��)�bgB^����������-�����ӷ�)�ϐk(_�r)E�T�dz�.F�!B�@�H� HA�&t	O��z�D��8��S
|���,W��\���QPF����L�h	�0S;�|��H^ߞfӢd���%�^v�?��}�5�[�+ ��}�o�ؤ���~������LG�:�Ѕ�GC���6�TT�l�P�Q��;�NG�f;�&��������l�o��֜fa��5�J=�)��������F��"�"N@���	=��w�σ�w�zC	�����"�Z�i9j��5�/A��?C��ؕ��BPe��[E`�.��z�ϑ��Q�q�)�p��� +���"����Q�ш��#��j��5�DT����m_6���+`kH�MRv�4P[Gno_��	{^令%�ŭG��Ӿ��Z�v�_��G����}��@�t�̾BC��se"���s\�df ��%�j�ܠ�(E���<�HqlJSH(gE^��ߖ�n�Gl��|��͵��$����P�������7�0�-�C�.��X.`�*O�I[���3*�U0��1(���l7p�J������ h�	�k���E�N�#+�p�*���-t@]5�D�l�L�NO	_o�);�/Q��������w\�<AK�����<@��<���	[;@Ͱ�|�e�پ�d9ġ�Q�t�*�����M��ٹ�_�4��ރ� Ã�|}�	"������H�m�����[Ny]޳�\l�ks�05|S�����ĳ+1z���wf�%'�p��;�˃f��+.�S �T	��T�.�P���8�D��q�p)���{�g�����JT]?����Mg9gT,$cv]�U�%<�g��x�0�Rq�5�z���E�M55e�&K�"�@�a�`�
�sek�	\��O�0����=�[G���(eL(�ے�Q�"��v�\rTZ��%}k�yJC�W���|�Ւ��+��>���&�B��>6�^�v�o=���c�b	�]+��2=��/|����P=V��y1��Q����C�rf�e�l_������X��!��EH�ED(�=�|;Zf0=}s� S0ϲ����hAX|�:z��o�v;BȌ�
����K��+�7
�t�8ef�pV��!fEABF��)��3�M6�,?�t>k�D���{����8	��Br�����宥��q v�+�ܽ�ض������/M�;^Ȗ�a@� �3#;
��r��I$���5���>ij�������`�y^,xLW1���D����EV�����$"?Q���*j!�%��Q�1�p����u��3��1c�Ư�&42[N��ng���sB��,���V�X�J�/Dpe�6o�{�=,�w9�2<3qG�������cƜx�Z�Y�c}���\H*˖m���1�p���a�������mlJ��l�������ث��%Ə'ßX�w���-_�IK3��>\���ZC���b+���Qy�?�N"�Ώcc�CU��6e�;���ѩ��s�l����������<)��ɕ���>p�
Uހ~��O�t�}�0|&��@m\��I6J%֓��a��(��ڿϛ��} p��Z�?�3����f��u�u8W���!�3l�W�Fק��^��%K�lK��7}��;�a��5EY]�I�Z��%�4'�tJ(~��+�$
(��3k%������:��~_��`�'���dc�����3}� ����ܸ�-��M׸�^�op��}Q�� �1������p�"�2�$k ,�?A����	6a�@CA�[����:��.E�t���3�9��5e(n[��n�= �Z��#$�����&����_0�����`�8�p�ߦ��#].���g�yV��ޮ����-������^��r�bW�,��ϫ~!4�z7]])`T _H�~�17�F3����;�I"���F�y�+m���^F`������m�ܽ��{-�s�H�?֧��U�M�t� aM4&��nu���cu�}h�g�(n�)��❼�8p��(��e��n��Uh���~��{�ssY�Rn�= 54kp���    ;�a��Z5�|Q�U ~�{R�N#���!O~��Q��J����w}��!ƙ&6([�� �����<;H�g�>��)3������*k��$����5Rv����ۺ�P= v4�}��	�cc��j�D����e5K�7]�P����! pV�y3�P�l��Q�9�J�bb���ᐡ\�|;��Ӽs~ԯ�J:�d5�t�pB���t�"�� ��Q�P��ա���fI��`���0�����'?^�E�yk���ߺ�����y��I�;G�����	f���Ҝ���;RB~�L�n����A�A�ƃ�>�	�~��:�z�;L<�����V���&��ۊ���WkM5�3)(E��OU�5��VRo��r'�VC��F�7P��푋h�����.P�??_8%�����׺pja�̊g���&�w�>��6�x������&cU<�����Z�ir4�«��9!Zˡ�<"�q�f��{{\�H�h�9�( ,�cͼ����kڡh�9�-/<�(2���'rɒb����Z�>}뗷S��*VN����}�Bd�y�߷�_��62VuB.�C<8*sM�tK!�6ͧ�<>0�%?�l6]� -�E�  G�z�R�@��FD��a�2 5]�+M�\��{��J)�?V�O�<��]^���3�}�����2��N��q4�U:B7^��� ;��/L���JǤ�d���^�>�<I+"�������������,�v�*�OVW+ӊAW���/"�im�����Њn���<�I	��b;$�+��X�˚_o���4�Mh���ôL� pu�i�������f>�8g�¾�\��/�l?����ߡ���,?N�"�>��\�4B�ɚm�h�r��$Bc�c/P2�j�*`e�Fa/^�͙\�k>�}����}H�CJ�lEx%���H��~r�3�56�[�F�߇�B�~�����]Zu�R%DW�wĳ2	�D�o���ZC��b3��ۊ�W�����(�i�Ki����܄t�熈�÷ﭿ��:j�+虗p/4ۇᡔ�]�T�o��k�b����$��(����������� �·7{���a=�MX�r��i�zC�S�[����YЋpć�5ϟl����@a���Y60aJ�"}?��bpT�0�D��1��ǷX���?]��Odਬ]�~�x#2�%�ee�W���˵��� ��d@7N�:q�5��ꀒ5�@����5E� 0��=V16��_��3K8R��'Ȑcc�9@�KR��X���H�mBހ7�+��|D���(��@� g���9W�etO�q���{e.�$���B�Z�g<�ܹ�#�E��t#ڿeN�`�п91��CuI�:1
Blm�)�Palm.�RU��wXi2��h�o�
��~-��C�Յ-˲�Љ:y�s��!���|d�_�t���~���|�%"���j�Փ��wU����V
h���[�=�o(�k��@.��߄�sۗ`V��5���䘕Ce+kد���l���$����j#����'��e[f��I h' ���Vߪ�N�.�7��J���I'z��`ݮ�Tv�#����zd��԰�G�Ѝ&T���Da4�8i�\7)�n�D���o��[�������^96���}����ѧF.6��쉢��I����k-�%��͡�BF�\�g�䱃=1����Z\���Dh��6��|Vp��Eԟ��<�3���qv��\�rZ�!o9����M~\�<�i�-�����B���¹2�m�o|�P?��e�2J��ʔtG���A����_�C�\ԭP� ����U%/����
�I�x�/��5w��f���[q�h5��.�=6�ȋ�*�W�$%'��'1̕e`�vBiέ��~d2s�`W������1��EZ� ��6	`O6fa��Y�?[�*��z�,I��BIGzFY�:��Ϡd����'ȧ=œ�H�1Lr��G7?F�>h���"K�c��!GA��'0�à�C�T���1���5e���5�<���v�f�f���d��͜��釡�E��
UH��)Y����e���$���.���X�@�"����0�_W��	�$��0p�Ȭ�1�/;3�� ��%,o�rw��S3R+�# ��Q�Q�\Q�R��7c��Dqt������H�ZM�
G�CM�씭v@H�/EI�������T�ߖ��|�4�h��U�?�0��7�Ҡ�kLW���V�.��h���Q���Z{��6w�W���HĔD�v��[ _���JV��æ,k^�+���������:�51�(.-� ��f��Wn�Zݺ�"&:1��K#���I��Y����)�E�ᣯy?�L�WX�;}X�L?i`2�7��EWю�ONŊ^�?\�~�^[��T��Ea`J���� >c�ẑ�,�%�C�c�q:�!mi�W��AW�/-��*ly�����c�L�_�C=�f~y���m��K`��+��4��}�J]�6�� �i�S�aZT�	��h�c�\��h��!B��f���+ȥz�v$����3<�տ��.�ԇ#1B�3�Ղt۽�:����i��Î��/Q3\Gm������H�V+3뙻���*�y*��u1��J�40^���26�����<�3����E��c�`��)��LN����O�`ȇ%��:oi5JO��9����@�m�$r��,[�)=��2�<&��\��}�c�n�:x�����c�~�\@��Ӣ{Qo�}�\��T��&�~ s�i �o�W(j�H/�zV�ć)T�h���I������s{O�bŀk�o�L� ��Dj�}�P�ęWvMy�H���e�*�咑��{
d��Ƿ�~��f�n��WT�>.όb��#t:ݱ���{�.^���;us�5���!����I�%mǝ�{�)�_7���u�}(���29�D�_L����5����9��=��m�ɹ�� P��gϯKf�W�[Y�Qh��5��!-VYu������/�w��L	0ݮ�Y��]C�|N+g�[����ĭ�W:q�R��2_B^ZH��Ě�b���y��y�����X����	e��Sn���۷jI%�D�޼��J����w�u�@�����uT�NH���el�]���!�W[�F�4�Q�T�*hHS�|	]���&i��6S_��tN�������b;]-�H?c���k�t29���[���9a�B����A���5Mh����q���k��I�SG�I��ϝ��V�!e>�Ӎ���'
�ރ�:s���^��ɠ��d?�>��̀p�����'Q�B��*@g��4Z��	D��gU�R.���5�Fɐ���"�E�$�K�i���-��\���?+����%�qi��lćH�*-��ɭ����h_x�T�x�vbz�΋dm�B>T3�v����ӵ<q~�4��/��~�\�r��t�o���_=�"+��h(>�$������5p	nRUJK�Oγ� ���%����MrzC/�ӀG[����E�Cd�t��e[׉@�zb3�-K�.��(�EN�$��F��<a���}`7��t&��'����<jd�PW�D�ΧƷ��4�f��]�[̟/�ow� }~��$����J<��$�a�5^_C"0D=�%ϚL�k�'�0WsC��x<  ��yC��L�=3���'b2!�:?�(
�}b�.1З
,�h�9�6 �s�!z�L��B��E����ŽP��g�rq��K��3�R��A��>��Ƴ�)q�gl�����&�fw�Q��'����С�]�r����n��~f�u���&��>� E;�)�p9� /2���w�_`�((�Mv���&G���Qۏ��
�� ��.˔H��S[�$��=�*�
I��(y��s$��3�;���}��q�C�?W��h�ܜZ��}���?<��&��n�'���kM����k��<P�	8$�M�#|����5�����o�B]qa�*m����5xc�}o����v
n�5c�4_�tJ�`�#    �b�8؉�>*ܫ09u�3�WᆜV�Tx͡Q��'M��e���J���i؂�`dAԷ-�hA,yq�)�mT$�p(U�yt�]����mp`�B�J��<�������EM7ɘb���
)vh��<�-B ��3�hH^���j�V=1ȀD�؍��g7\!���[��M�� �<NY�1S����=�5ȕ7;��1�&Y��ݸ=�Rݦv~��4�}^�����{�n��u!��V�5���_#q��� ��n ����h�#���3����s�]�fg
�C���<� n����h���2W�r^t�6xN������o!m�r5k�_�#{�\3oy�!�y\e�s�ލ�4�=�ܺ�R�'�s��ru����<U�	$���A�^��	��I�K�k.�t���kƋ�L��Ay����y�먻��c&h�k��^�n�_�w>e����2HEY���gc�UfE�#_N9N��b~V�7���p�z6 �xwo�g������.�n���.�d�{�k�(uȄ&,�[��eb��w�c��;=�����g�T~Hi�{����X���[4KX$g]�Gu���� ���K�E.&��*b�0��Zz#�r�Y�bM}L?�Š�s���l⯛5��9>2x��[x1���MX�Q�I��Ϛ��A&i�����RD���uE��Z�9�>Ѽ�B��M�ĸ�u���!��Ͱ��g�$��G�o�t��� G��n��E��A��5�Q^��/��u�1+��(��@�y�U:�~?R]�T(�N]��;@�l�Zz{��d�s�w^�3�ko~����!���VH�[��T[ #��`����_l���I�RfQGt���˒��E��X�D��|Z�k��*,
9wP.H���2Re!V�9E��#�W����c����_mLčB���Js�#�,4/����<Zʄ��z�����>r�JC%S?��|��/�����c�	я*��9jq��=������2��5�-���4%g �ˢUi3�6_Ʋ������058�3��T��˕����\�X����_�W$�u	�܋���vty���S�2��w��(�NL�o��١�D�'�:ۦ�H��W�\�bṯ�=�T��j�KQ]�_�,��5q��]��X��g�����w4�6�8Z�ϛ�,���vz���ϙ�!-`�^�\~t�qe�K�*�p
RW�(���⳧�y>��+��W}�A �)�u9���9�*B/�nt�٨Uu�`s��kR�����,ip���Z\���~�D(�����3����F�]�ڿ^5�E�>N��£���k�U��NN��\ׂ!��@�J�bnϊ������ס���XG@Pzg��}�
]��T�����~����K�(� @y��������yV��<�= ��qR�mN�����H��e�������-a�_S������k�\�|ɠ4�[������]�
 ���ZE��k݉�X��n#,��L��h |�-�%�����+� �=�(�,��0C���W� 7�'d6>�`Txߦ���}�&0���l��D����b��.T{�Q��G�� �TV��۱�mK?j���>��g{�7�����iFIq��AU��?�.�^����z�}�;ԇ���M�~v)��I�Ǫ6H��<������yQg/�Dxj�k�CU潚�ּ@�7�o۲��l�N�gA��.�*�A
_*��2��[9�s�8�J���Zm5�1�/J
R�yJa���e��q�#�"j`O<��;�2��	��#���������	jKXl��X��SCb��5JOnL3۽Lz�<�c��,��g	�!z֯��G���jL���%��W��:��p��Hm���6��3�3�M����׶7���r����pR��Bn�|��;��|��ʲ���S�S�ّ׿���DƑ�����������R5H�;�zd�I�����s�qg�q��q��`�N�|��z
� ����y�i��W�k'%?�#U��#�A��\�0"<&���Ur�{2���8Z� aգ�xm.�t���vy�
i�H����	�lU*�Rq���;D��vߣL���!Zj�#����) ��F�Q�瘍�ֳ1�V���.�MHÚ:�?%�O/�Ҵ�}�j��#E9fB��I�ߝ*Q->_C��h�^��V?�B��Y��t�5ī~
6wў�v�5�M���W���-�"��e�n�boB�(���@����M�_L5��l�|\�s4�R���f�8�Ua��O��ğg��^)T���k��Çx��!a7xm9?����I�����k��
Ta5[^��f�=��t(*n�a�۾�|���L���fߡ�ɢ-�^r4�L���L�������͆X�](A��d.��o��/�|pEv��ܰ������!���f�h�x�% `4�nz�.:T�36k䈿�s�<��щAS��n���SwG5>����?6��_v���Wd37+��y閥fP��MXZ�ܢ�T2��G$V�G���&'@���00E��6G�í���C�+x�_�I`�,�;(�έSs��W�-{�|��"B�2�1�hS��I����)�_��
�����N��ѐ+�c1E���)��~�^06*+J�V��t�pIT�{�4����,J̇9�|�7��ƪ+l!�j��
C���4����P���r}�[Tj6**%H|Nl��;�������/��0�r����|��j��{��Aa.���|<G����@��������)��6�⊾�ݬ1��R��}Mg��FY9Ck|�n[2�.9g(�W.|���iR�x�_Ə�K6�a&%芢 0;�7�9���9�L�Tc~��4�P�m�Z��3�l?-y��(
*��~~���3�NV�Wܞk�?<�r®�[���(�ԔZ]����,�;o�`2 ǹA��6l�[�����؄)��+�Li�v�?�A�0��c#�?_*�����5
��BjY�W���߆�=�E���@�[�#!��N�ͿZ�.�|i{	�2)����8�x��e���ϕ0�����8�w��9�L6L��:��<�^ƯT�T��,����v��ڈ�J?9rGz]e�Ŵ�s�[C�	��h�'�H/lgy�����х��Mi w�&oH��B�2\h_#`�֯FT����Q�0��쟡w*�"�(��ݿ��^��o,�c��%��\�2*b��K��<�-�0�r���#��wh=ᔓ}�lI�\S�W�dc��|�;�ä�J�z�~�9C�z�K���a^�Y�|}UYȻ0 M��&څ�/m������')B��"L���L��{h��r�w&;S�E����~|��@EI5�L5����;���a&:1����w���;0mp��a�!�7��Z�,�P����b!�z�>�U����l�X����A�c�u���˗�r_�,E��]e��v�e��~s����D�O�iW�j��f�"_ƙ���7a�ٺ^�Z
z>���Bt=����a�PwTt�֦�IF*K|�l��~ RM?Ӱ���a�������w���?D�cN�����Αu�s���w�<�K����z��{R�|�J�_>�n�=;����m�Jat���\��e����
>/mv�A!���!m��yʒE��&C������|���ԉ�6K�7_�38�{�KR�o"@@g���e`9�Ԫ�D���
"��2k���E�!$v!�	Q�J����|F��������w����Ћ[b��]�ؿ����_�@�q�-ׂP��-o��Z%���x�W� |�Vb|.���ھ1l��'����
�8���9��oG����#g����a�A��5y��_&`����YT��&]A��F[�L!�z]�]�y%N�g_�x+ֳW������mBV�d���U�?��xl�������%UWh�M�"<��A�93�,u�(L�)*�A����(�ƚ�W;�]/2���O��+�o��4`M>��@�>!����Мf��ǾM?���W[�� ��&    �(Gյ!|��P]<Z��Dw�
O;�6ڮW%ɍPX�Y][�����h�:��t3��+�&0�s���];uP4�%ė��f��c�a��\'؂Y�z�o����7qC���	þ�7�y�{-է������iE�����Lק�h�u)Qi��-�w�w����خ�m��ɩZ9�=?O4� %�
��!ξF�eE0Cb�	F�g����,�����/_�I��%�����Gb�mu6�bq�%�$'r�ҝ^��L]�{N�K��y*n}���n��'�1�{���:o>D.���u��KK(!��S�"K�����TIj�_͓��h����
��ol�X�jl�[G�+��R2�΂^�Ϥ��:Q$���+p����Ճ�\<�a��,$� �ObԈ����H���}�������� 6�꒥����X��������Da/�%�p����%����z�~�S�_���/���1�H"�\r���)-�0�`n�d�ɿu¬d��A�_G���rғ@+��-p�	L���q�W�\��5�'��D�J<��j��#���eS��j����C��yЗ�v��_�|LL<
k>�c\n�����Bs���r0���u�������0]�nd��A�s���N��<�9ݿ�y�(���1�\�%xK�§�+���.eD�9�n�&��ybZ��`v�`h�A�u��tU����QD�S� s��1�}%j�a$|r����u�v$3�?��߾�y��~�����4%��ʌ����R!(��k����u.�Լz< �v0q���j�]��jM��D#����|�%����!�D�t~g��=�:��F}�L��m�2��J��C�j��x�C̋P�Z�	�wUd5OsQ ���
�ǤH+��8�r�觨UpqEHo*����u]^"(�����4���+�������9Ln�whq�V�23�d�qw{���;?�6-��,O��A���˟/V�U���n*e�N�`U������Y��8n�Z<����^$�"D��������Ƒ�JnE���4wX���з�pׯԩ�ZXO��j�a-���^��k������J�^�?�Q�Cp��u����'oY	.�O�k/?�{+�=�?���T���ߞh�v=���K� 	9�Q8�+k�P� �5����,���£'[���!�N���>�`�=���rOBQo8P�K�0�OW{ۑou)���|r���O�խ��_������N����N���&/Mn��D�n�<���H��B2���_4Zzʪ/��]h"�ݕ�3 ���b�鉀w���@�z�h�Di�z�ܶ������ `�\j��2F���??1͜�����U���D[,L�(�l�Md�(�j�
������;N�g�D��PHR���2���%H��  mW$P<uq�3�mQ�I������p���
R�1G� ��&��$=�,��;� ����]�q_�s���"�"�#?���k?��g,MY%�2�R��UTH�sɚٵ渝I�~����t2[`��B�!l9�E�����Z�������I�;P;d�2��^$��<�]�2��y���|(`�/�_v�P�6���Ѕr�����W��P�Xm��5�O�/S�cn���H{�c�>:�����,�����ؽ����|~dfe�<�/�KU�$��g�W�0����-`*�A�^X8�Im����`��\�ղ��V�.+���A�%i�Qg���N�鄯�&`�F7'P�5vF��'�͏weu{mmu�ڦ����s�k�L��\`2*?	����B��%�
ٞ�kjf�ziA��NT��L�hr*�ο�cΛ�hw @�6M�	3�ʀ"��c�<���-�@,�n�x��������wb�-$A�'�STeB}��
XL���_�7��(�1��jQ���`��Ҟ����=�~�T�U���J�4�x]5l/a)O( `��h.��,i�;�3�O�o�s�ea�!~�/Mڍ�9�>���K����ک:�5�� �t����iI.w���O�t�Q�������k����)�,"�-*o�ƮtsG���h���r��O�(m�m�!�txm�A�[��,��1t�犇��R-�ޕ�JǼ	�AE�˺-�f��w�n���n�Z�`ݽ����=�G{Z��YHaNEg#n_sa�In�߫y?�)���.�s#��G�V��Ꝓ���KTr���=�C���l��%�f�I�2�g�F�VZ���2$΄�~G�� ����G�����W8f0�
��ލ�є�����꾔x$G���� L��������M[����+�V�f3�?>S�hT����WUU[��Ù�+��f��1	�ߩ�9+�:�>|�be�9�T����DR�_�`����V��d2���'��y.ӀVCc��9(�T�{��N��F��+���	�Qs ��1����o��\ִѮ����<�~��7`�3}~e�q �K܈@���y��us�}���,I��ʯ��SH��bLِI��ɼ�;M尘�=��b"S��ؐ� ��Jߝ>� ֳH�W�ӣ���o^O��&)������}����e��)�^]������٣Z���u�p�}����"�'��h$��>�Dxui(g�t�����鹶�AF�Ζ_{�/�7�R���xp�t=�oB�n'�lؿ�ΐ����p5�@�H��M\���P�B�����kܺt���q�d��N^����S�⊃�z���� +�-W��%��o��>����wg�\�*o���]�r��v*%@��� 0���O����@��'[��>6S�+�.�<����ty���̿�bWр�I<qK-D��Q�+�Wβ�G���f�tv�-v���2(.2ج�ߢ���&���Ԗ����5�;$��4(}�vCq����/�2,�\�,X�$����~�{��7�
���=���d�w�����b �ԣ� �&�y��0�p���������;�C�5tgM�{H��t��v]�6�t�o���i<NXփ|�9dҔ~S�mK���U�A$E.
�!f8���=���a���?��>0��p��(��)�:=d]f����,����-��@�g��<Z�[vj9��,����NX����m=����K����9��~�X+���<{P.e��b����1��r��le�`mmq����i�Q�tr���Fce�)�\��Z_5[�EZI�U�DŇO���b7(���ݎ�9��5s��Yd�g�5�$�Ҵ>���P�_+'��Ԉ#��Z��[&�_��%��˟�ѠT���-	�C��Sn��"����;��.�
kܸ�/�\b>�[�&��
t�Nm3.�"ο?>�=��^",����_����t�b����W
�s���+l��������4p�8J[:�I�l���?О�8|q�
iw=��C6��H6�
�*�hw��uX�E�_7(]���w<����Ӄ�#�FG�_����C���Q�U4�ue���A}��"]"���T/���T�
W�m/�:���I�T�f�F��ɻ�9�3����w�'�5=�,7׿����L�8`:�Y�`�;*:ܱ�ܳ ~����Vk��+ƽ�Z���	K��\w��55>�����z&7\���Zܹ3��Ib���5�8(�gĬT� j=�n������,GJ��§�a�Z�>�%�G��ņQz���g�_?56����.��n�f�9ؠA{�k'*�#��A\�4m���q�oE�9y�O=
%��|�ڗ��e�C����x�8�~�#^�2k\�Ş�M[{P��l��pۃ4���aYH���r�5�[%�]������:��,��
)�A~;������k��gQ�y�[  �=�k6��4�;�e�9������7�/��+�L�����J�\�E\�� �ڲ�1B�R8J]f��,��D��B[`?�I�Nߛ��Hڻ�S���I���R��r��Ǜx�/-�I�k?�\	0L��    _^�+�m�|��5���4�!е${�?1��L��&i��ͼTD��@�yb�	��\j~�Bw�B�+d�zl����a�c����sl�y�hR�6�{�����m���I܀+��[<em՟�y���>��Eߋ�i�i%u�($��(D���b��.������i�y�u^����rr�A)�i�/�E�"1*R�h���̪�_���/k��7Ito���}�����o���)��6U���˾f�.j���;����pܭ�B6��&���8�q�����
'��%!��zdR��d�Rd��X�H�c��!@=\r>�k��O�9��޵En�?!7��V
Fjn���*p"km��&��""�K^��!H *'��x��u��/N�l�>�$�0���{ɈS��+J:����V�_ z�у���՗yT}X:�%��2��B	M�>�6S�DWW8r�E[i�i*ʌ��;c��_XiB?�[�q�x+.Y3~� V�ŔҶ]}c��U��jm'�3�����I?n��Ϻ��� =,�BI*4(g}�ۊ��w���fMY�?7�K�TZi���߽ev�k�H1�Ar1���ܵ [9��lM�@��Y�۸]��&������&[T�5�9��'~F������4�~���!V��}׎e��y x�ǲQ�:�R>���`��k���s4)��+�J)�a���(i,	�b@�$5�7�R��R<C?,_>l��uC�b�����hTu��_��s_��5�a��8��0��Eo9��y>r��ܯ/NP���.�O�F+�翏+�F#g6rd�����Ms��4�N�����@vLؼ��K�k@J�j"�8��
)t��ZIA�㎲������3�Qj�Y>a�PV�bcK{f �|sݺd&1����� %i�G��%�\��4ܷ��ՒGzsk��m��a�F�@<����U7i�����ڐ�P�FB�����᱇O&�a�?���W�y�_�Ĩ����>��;n2��W,6�Ͳ�Z]h7'2]ܮ�	�'��(1��=�W+l���k���s�O�x�Bf�S�x�
cc�r��h�凕�bj��wm*��5��o6�|�a�J%�n\��+�O�-C��}��ɿd�$�{Cn��w�[��Q��������Jo��2ہcRO7���܌��e�^��@N63��b
���������W��G��={�¸��(�,��f��JqqM�.@W�㯗��3L��_K��c���xM�CHϾ*�N �,@���<�&BX%QMod��V�0q�0|��E}� �����p$�әxV�0&�Q]�4�~�?�GU���̱�5
�_H���no<U��FK���ԭ��^�z����-����&X�C���j.Wͱ��A �5�^?�yK��3+�ZmOw�<��-�R���� ���3Z�{�%��.���&��?
�)ب�즶fG��x�D�YR*`+�?��L�p�+�z]��R�_=W
�$Y�C�Ϫ%��� /����Z���34:�Î�@J�H�)�$Ci�H3 �g�s�=�$;���#�3���)}H|�����D'|]I�&x(�?lC*�r�q}��K8�ܔ�����:��l���>[�I�YɊ�"�-ڝ|�a���[G����{Ϙ�쿤��eA�: ��VP^���澣�cvp|���)����K6D�ʎah�tp#a��^Ͼ�A�Ҡr�����|�w�����^{����:��&���ʇ��s��Z��.�|j�d����e�4�q�ۡe.�XL{��J]A��UPD����E�} ��]y�_O���ȉ�	aVB�>Oy(���Ҵ��X]�� U�9:��_r�+��v���v/�ӧ_�N�Gl�O�>P�O����ԥ�f����3��Y�Zh
��Q�ď�jTI mFC�Z��@H|��8u�p4Ez��������C���BRXIɗwx{?����(_�W��FW�.H�i��y��93��)�lyۍ�LU����b�N���Ì�0�6��~�T����U�kxA�j���U�� ���N�@���HF$�xDP�ԗ��ׂ��e�嗿s}3�A��$��|�f�M�4zǤmp�1���aY�Wi��smr��X�~�t3!ߥ6�^�6�i%�&�Ir�d�R~.~Dx�����hz5��ck�r
a��]	� 	�hຍ��5�؅����_Em�xNaD���͉��IJ-s0#wt���րB���������qg\������Nu&*���H$t��wN���*�(����ޑK4���Fߢ%�`��a?�Қ	�r𯾠T3�=p�|l��L��(/�^ <B%�����2"��Җ�
������j��K�L����:��!����51�{Ԫb��	)1�������j?�	��!v�kN뫴�J؈�6(Ē��k���K��h|�mLO�ͬ�8�ޗ�5)��b\����\BAr.��/!��P�9�����"�/]Ѧ��jvyE��j�8�~� ��qo�s���v5u�%��&'��д6�oI����r(]{DU��4 ��6Ԛ��.�+��
o�g���f���Ĺ���I���K���x��
��Ij��UQ�>p{�	����@�"B�,C�n��u�������՝4�`\ь�z�-�������<b��)kf[�A�����x��5(����dEy��n��S�D�j?֦H��H�~	SI�ͥ���`i4D�Z6\)����@��%.�_h{Z�P"�A�/�_O�����x��w
��>D-S�=$"��.��ٵ��ݛ�[�� 2e��S�w���&�yQ�o��1���RE�c'������'RhY�-t*բ��Ln���H�2��Y��7f.Fm4��GS�f�Z�˥fU�i�`^�D�W�\Y#)	{��ˇ���E����'߫�X�C]�mnBg$2����s9�m0)�~O@;��
��mx�q�0$��Sw�~��Z<�&{���P�,�&��Z\P$�R��������u_�3Hd9nT�##L�̯3�G�>�j�:F��Q��~���Q���7@L"��3s��lg�rH ��
Q ��u��]c�r������2HtE��/����A�~�$�����p>�mSΔXf~���}إ�8�U[��Y��XPx�I֐::�D4<���Z��.Qek�a;�� �M�lLd����)�;P\/�i}�P����t��;AuM(��R'ȵ�ksx� �����Z�V~�+zDZ�����GJ�q��/b����_��}�^�z����� '^=rIʎG3����;�L�� vf�2�_Y�'�|��>N��w(F���8�(���q֙[�t07�qyM=8�̝k)T��9�03����O6A\�IIPQ��@�qi����=ө�ЧqD�}!Sٕ�.vͅ��v��0U�+CS`������93��	-���F&Ĺ�V�QS'U+���¸<M��^�d4�H����	��l�囁)�`�w�?��2]pa�k�0��t\�w���H�R��'W^�v��%]�}�e�2��e���Wg����_q�`�s�G9�HD����od��ڱ�ߞb�e�c��į|����|���o����՜~��3�U�B�4ؘ57�<�L~�:mv���:i7����!Z�?�ZYl�ie�A���Z] È�4��$u^c�oQB�˖{�3��j�~T�ِ'��t��f��_�u(;��K8���A]�6<��q�ޓ�ݘ���eW'!�lB/k��`�婧�
˝�*{�?�-Qcj���&�,�+ŵ:�����$Y%�d�T�����*��M�˪�W8d�*-��>@�EDxX�jF��Y��|�sU��2������;����G��T'�l�;�1Ї��4�A�!�X%�绯���z�����r�#�׷�$�
��~OwO�r�V8D���JK�(п
&�lbc���_s��ڣ��j���pi�JB    ���$��Ֆ�\͡gs��8޳@ɟ�J���-Ҙ$
W�}�.���!�������oX���- �CdհEXr=������5Ez�w-Α���l�D%i[���Օx>E�VZb4����LJ�oR�w���3P�[Cee��InM'5T�\��j<͡nw�Crg4���z���V��v҇��5`�����;Aֵ/�GVi�,�U�)$�q)��g�yӤy�7��FQ��ġ�
j��ǘ��Ӝ��}t Q
�z�00xPL�Ȕ������SVʉ��Y�M<v�os�� >h6c��@�E鯛'3́6`<�~Mr��ܞHz�W�1�����qp	h4�O*�R�	^"Q!��J�˿z���x�'���B'A)�����3;�+��9��h�/�V;ir��%�?�*������'S����C���ݞo�`rk9� L��̯�{�>�B�	W��.��{#��r���������pA`�?0�[y7�m��*�ρ���!�����ͯC�L���������i�@)�:A=�����=�؃mR��d�_$���Y�HJ}M�w���y5��U�z~!^X���N�#nĴr{��LE�(xV!t��P���I�n��O�%-KŢ���i���K"↪)���w�!�BT��A,rۋn7>���H�ӓ��)�d�.��Ŕ�MAcoB��ש�t�r7�����'lǍ��i|Y_���4uT�P�X	�N|�;��j���o��_ј�x��>yF:a�� �!c��ƛG��{�t6���������%I��߰��t2��ߜ��B�G8F\�_e?$�g]�}���*6^���W�h���O��֘z%�I3N�"8�F`�sww�����Kq�zFD�8|��05�:8FW�;�2�NA�_�^����S��N�i�����E�uj��h�}hc�+J�d��h�eRZ�3(3~��u�|K���-Ɖ�p�&�������ȍ5��V�:���>�"�颙�lpHۅ�Qe�{�K�@_�]u�"ܺ�Z@S�{a�S�͜�[l
����⋏��/i��Q��^��U�Ы��dzx��5���H�O.�ők��h�A���S�Z�����ø�,w��U��NE��V�{/��-	�Ƕk���;���kF,�J�/��������W�5m�YR��!�:��a��L�9�|��)o�{jq�g��x\WC��<vn��'ͣq`���t	�kЀ�Z��G�{��ԗuyN����+�zЮm^'�|�����7�h���I)MY�:g�6��42X���\h���)���~|��??�%��f!���mD��,��~1�	��T�n���xR�ȣ��6����l2z��������_�w��A)�XH!ܲ��ud�Wh±�k�twd�jE/�Rq�:���;f�c��h��y*�)�J�l�!b����V��(С��]<2؂�ᔱ�+�,�c�g��ҕU�� ��[E�A��Lq�F�f���zpgI�cHWe���(��yu��B�{!�=t4M�k��J��k7-��e��EF+�`�E�8��.u�MkB*�] h_�o����)������	t� �G���� iD���z���׷���A�D��a����Oo��5vJ�5Dy������_���~K�Ry�G<�N�p��_�J蒫�v�C�&/+�V\H��'���P�����E�d�����S�e�~��H����O@u]O����)k�w��C�#�r�P����'��b�\��4��F��%S��z@�q����Q��g��ZkN�!�r-^G`��I��;��O�}��N������cC��j��Р4�Sm7�`�l��!^��2����� `�߼P�"l�Å�s�Xb��f��h,�75����	r�4l=g8��El��U{۶��|�i�i��7���0��cJgp�x���z6zT�P	��%q��C����m� oʗ��L�DO~S�tF5�!ׁLG���%0�qDh���n$�3��?�1Ԭ�}F����������B
Y�t��6�4�ϰ��N�m}f#j�\��p8'��d(�|v�ssR���zV`wK'M7y�D��!����I\l�R
B�j���3�?b�x�R!@�7^zM:'���Ԉ�`>N��$A�I_�m�_���H���6��;��s��]��[ vW�ۿ���;����P
�
{r��7��^ûԪA��׀�x��r�6��pG����ΒM'��JIz������]�W�b��'�e||�}co��$<�:s����r�ۗ/@��g���!N<�dt��� fJ;J���&v�eB$��lG���zⳅ�s�����_�S�c �k�׷3���P���i"r�8�1�a�Cb]_2_ �q,+,�3h�Z*��g0�،^b��-U̒�>{�Z�k:0�L���k�o>  -ݪ͢&��Vj-�*���u6Ή�qp#�S|��^܋��c��#�W��BS0o��Ѳ�z�8��j��A���|�< i�b?����!뫱���v�\2���P?���w��
��]?���L	Q
����p;`)M����M�
���ɓ���i���(Ĩ�1��~	>����}�d�0��J<OZ���{�?�D�ְ%���`m�7�%~~�W�	k(�Fee��q���]��9��s�9���g[r�~�mq~���]��+�(�|^2�2��x)ƒ���|�3�0�;%J5�Ę��S=���O�y��`���ǼE!���L���9r�����\�/�ÿ�)о���vDx�%`������6p�s���u{'�J�N3�7F�h�(rH7j�tv���5"��Vm(Zo��~�#������5ê��������A�gm�=�:ȹC�J�ay�А:�rh�m���51�Ì?n�{�L�׋���V���9Q�>-z})"/�Zy�� �חC�M L�έ 8�!Jt���4B�S5�[�v��$�&O��>R6�I�Zӗ����c#�A�v�������vu�B�u�`u�3��
uB1�l���"�PT�ϭ��MQ��E�eI�d �㷴 ��Q-m���ؿ�~r�g�ȁo���u`{yd^�I��m�Զ�	�!�r`ݒ75�F寧th� ���s��/�_�Jz�wg��4w>I� qv����4Uv0��f:�ݬ���G�WEt�S�=LF�ν �s�Q�`�)\U}��2�u�͜��!��t�{��Y������"?�.��3kI����ea6f���<{�b=S�b�d0DP�Q}�<u%�e�4#����o��X��z��OH����xuuOz��o�-�����X
�p-�'��>x��y������ii�ga�=7�:x�-^)��r*&,�C�]k~	M�R���b�W��'����u�7������*m�^ZeB�����<1Pu����Υ�*��uM����W3�o�Ʊ��u�u�u�Bu�7��n���u��v�Vh��D��5�k��˥�a��O�'��/w9=W�ae�Fo7�������V����0�?)�s:�ft�q��<\d��}�,Ύn=��;����[��"ARhap�=����74�-υ��U�ބzbV�w^6���C-�̔O�0��q� J$�p��Epd�Ŋ��j!<K	�M�K=sʠ�����01_�G���؊��k�G<I��kF�4��n��Ǳx��|�]ǃ e�i\�h�d����|A���a����d/,jjD���M?�wYM�;v�[0W�ш�2�q3?��!�~��x8�ȼ�]�m�+K8(�����ANv����Q9+��� �p첇xI+�-���o�8�5��z�UzT�S4<��I�) ���z�?�~fF������V_�k����4�p��j)�&��F��m�,.�q����!~L�, �-�/���giq�.�'x�^#���?X�8f�1ݻ��T��eYy�0�k��W�3�����(�Fb�@z>�qZy��h0@�����A/CJ���:��᠖ztY�ky:l6��S��`z!�    ��G�ΉE
F��z7,��,L���*?������%Аrez	��tna�В� ���j����0��P�[�F)�TS�N��51��]�ŮůS��:J��6�=0��WmB�������3o��y]�F� �r(ࢦ��ڬ������實W�z�09/[p��U��� b�"�u��S��F��>��>�y�y�?���� b�E/��Vc�:��7�4�<f�0h�G��)-�4	j�jK���׺�Y��%G�#[�M����:��^�ϼ�G%�	�/D�޼S��~�{�qҼd��$]�����o��e}\���2D�1M��?��+�ı�x�`R͡d�Ư��h���Z�!�)k�V�Ϻ���+����D~����f߹D�e��T��zJ�y�c��~��ї�u�I2n�ʮۉ��B}�f󌇧��/�<`�C�
��ގ���ͯ���.�
���H��[����S�K�ݦ=�k+��'���	Do��x˪J}��ѝ�*0Ju� [A�h���	/��	�hO��� ]�x7�K*ȭsyi>r��i$�ECP"�g��Y�A��(�<w�3���γz����^#ˣcb������9�&��J���}g_Μ�_��O5{ �U4hG�T�^��?\��c|��f\��n+͗������]�=���$��].��Y������vY�X��$@��
�O�0E�|)�sg��� rC�`�YH�xb�Ck-�4�V�au��,`�$E^��a�F�A �ٿ�3.V6�;�|��S�Ԛ�M��Iy,�"��k�ՍG�s�J�4�@R=RQ�~/C�(ɯ�L���!(�-��ב2@y�n�J+�����p���ht�v�M����qt�nZ�	1��*z�L5J�;F��aI�d"�o5��EG=��y|�ק\�C�~x�=r�s�9����EfQ�uӻ�|������ �%��B�梿��ﰛU UqT�0��z�L{ ed�r�	�y{�ӗ���L$$�U-��B�:�R��9M�|�#����Z�y��wx:宇�	$�f/G%���~��V�c㄰���	>?�![�&
�\�&�v�A�,+�:|�7h�+����X^��UU��ܶg�ʄ;IO������aѶ�i�Ja�V� �P�O�]<7l؜f}�;��@L�'�S�W���ä��X����۠�U
K�t/��
$Ma�V��}���3,&u���$��R/�̿^�mZi��`>2b�e9�+���#�S�eP��ږ7��4�����A��C���'�����a��Z�e��@����:/)���#���9��q3ٳT���L3m񽄵��b��x&1�}��,�*�jM N?�@N:�?����gU����t@bȼ��_-���>=�r�^��R$L8���]�lYO<�̉[�r�~��8"?Ĵ���@��� �F!1,�mM�:�L��L!	���#�Ӭ�_�%'�a��>���$.H��m]���e��ic]��L��6ώ�X$�_}S��#���K�%�u�m��lq�'ѵW���kXͽ9�r�\ө�x���R	wT���'㧺Baf��:���� �����AY��Q����<��>N?<��?���
��Ǌ�����K�>��D��cu��u���C���2��-��������r5�����tN��R'���W�e�%��t��Y��P}���30�:㘓T�E�j|]�N��~��ދD*�_أG*��WV���7H8���+�����������?_��Do�ܠ� X�,�X����v�?������e�X����&k��婔1��&+~~���Nb4(]y�q<��C�F	�-+�$%"��7A����#��e�C�����m��><�N��2�8�Gó��:��_͝i��PN<��n��#�V��H����x��)&�c�g���_a�m�u��$�@�o=�&�K\J� ݼ
&�� (����ͫS���2�Ǭ_�B�	����3��������u�*�%�i����[w����%�mbI0<�>�\e�����"��<�˗5�7�*UF�I'���ò�؄�A��^�(����Dh�x���0D[� n�"a�;N^T�i�����P(����%}8�0`��,P��!ƺI	���Por�j��-x9&���G�"O��#'����Լ�A�_��W`:��u�����d�(ɑJ�zF:U���UR���WϨ"��u�wbƋ�ͣ�&"a�<����:�qG5�U�u3�����ߑU�O�[Hl�`�U��X2�X���F�Ρ������W�V��<�`ܱlĬ��Y���E�5��\�)���5���0�4H�z�3�c@j�;��\"=����?���ސY�k�*�؋����{�IF#�x.W]�����72K����o�ՙ�� �D:�(���4v�)g��uoǗ���Ê�e_��۞�/� ��'�S��Eܬ�Tg��	CW�0�KGڼ�����{��+	�g%a����t�B-���k��ԛ�Ou��m�yMIg�w��R8�CBk�_��({J��@͢`s��c���P�z���p���F����I��H_��<��+V�����GT��'�
��7
0�D��C�Dj�t8�!�@����N�R���ʈ\�����/mr�g��[ ��䣒�_Ej@�@Ԛ`'�@�Os�
��?��b�y%
�������̴Z���W��&UN9�=sNw�����V���ʱ�}9�WY�_ð[�,;@�� �qx��j�t���Vm��'��w�P�/���<��M��T�--1H���8��]�!J%�R����_���td�/�n�+L�	�H�t�������"��7�W*��1�L��2�������z����gsԬSdu`0�]K���*\WS�����|G�ͤ~'�7���k`��rx8_��	σ�U�Y�&C5��*h8w?��B[��	
�1B��
�J�p�L,b����%�YP�����L� a�K
?����&�Ϧ5�.�U�G�i�D�Ϣ��-�B��ܦN`
H@xT?p��P۞�0%'na\`��0�^���C�p'��d_�;EгL���F�U 	)�ͱ_�b1) ������@Xj��r?Rv��>�,g���.�տ�KL�cQ���8Y��G��{�����2g�e�o:����d[[p�ɡ���E�L��/���S@�#� ސ��M� �'��H�hp����3:�"��py9��'���\$ʏ���Ͷg+�rC�aAL�F�EƇj:�5��c?@�D�-�~{�w!�`w£p�	��9L��V�	�2�b�7�ŒZ�7������m[�_Ks>ǽ�П_��0�S\!Cn6�y��OJ���#�?vq�;��.�h=�*��'���H���m#��	U�����v��A�IGl!��c�m�!x��3oDE ���g�M�P�@���^Q�A�����^�D���u5�q���DT�:�stY��_U�U�̏WD؜Y��+0tUA��W��(;z�����M���. _�c ��+�A�K�\*e�I�r
j���x$m`�
�~�S������z�a�q��]�+�&��z��q7���,Υ@"���@n�(�kTߨ#PbZ@_�wh�֤��>/�F>|9�ՄZ�)�'�SŠ�/��8Y������MdG�V/�UL�������Ir����o�Ԩ:��WbaB�
��Cל�7E\��y�l?�����-��ߥ4��n 0/��G�!6D�
%'����0�0U+�O��0�ּ���^�W�V�8q������m�k� rf�E��\H�U�ka��ݴ41��(E��49[�$JSx�x���ͣ�9�|e题�F�.d����4X�����-f�A��CE�h%�{Ξ�w�􆶽��",U����v� !�`E���,�:!�#�!�]�VV�7|b�"� ,L�`���cnvwBo��"�X?t���bx-o�Uh`0�"É�:�Qa�`/j� o^�����,�������6S_��`r���h�)��Dj*_    �Y]ԁ�j/�����I��cX��"��jIs'm�i��XV �{]�n�1�E�� �"��(����s�yf�SD��_��2��=A�>���_K[+t��짋���m���A�+ � ��C��P01��3i��/���]��8ƿ�Q7��v�Ԥ��C�]�UQ\��6U���y=3d�
�sD���˵�Y�0�L����Mt��6<0asU�~��
�J��vh|R�u�l��'eNk �Nh�<o���+q��<���`Ԭc� ̛�}l��T~7Շ?̥��nMR���굆����H��4��_3��D .�t�&�:���m������ۅ�n.�����*�~��!U�f�0�b�C�{ߐ�Ųl_���"iMz��%�u�&n-NGq dw.g��������nhH���x�uJ�!����m�#��t��x�@�@�=`3��?�y��P�ߘ��+
�%�8��G�
���Cdb�ٞ&U�#d�V�VE�����+:�U�I���a��N�r�q�%�B��-yې���2���c�Ru�+�Ez�qd6t�z�k1���;%�� ����p4��!�E�B!`�`�+)��,yz�bM��0��(Q�@e*U	(�n�X��8�Ȕ&D8�M�-���s�A�I	ͅv��,}�ә:�����QG ��y�����:j_k���Q��� �i=�Y���T��TA��"yL� ������ˎ�.��>E(?��XS;s9�W^f�p_�{m��}��(�7��r��p��M����}�U2�������Q���k`�@�T��Ɗ��:���a�-���<�Ϛ
p_��u!
��v9���x�'��^X���<��ē��/qD�5��֮G�1ζ������]X|�^��[�(?��@F��M��KL���-\��'�Wq02z�\��/�,c ���8��h�Vh������`�#����K��\ʝP:�Q�	���Ɲ���H5J3��2�%V0ҋ�w��	�dR��9ɛ2Ҧ�?��y���b?�mÓyP��w\��h�7��m�aP�����e�qA!��`����KDl^����.�� ڮ�4��U�3̝�J��r:�xY�4�)}�'�¢���j��|�y����H��w��[BU4��߭�G�B�v��Y�⽓���a]� �o "7S��|�P�����9g����*����J�o�G�_�L�K_?�X�v�v%��k��z�?���W�*���X�xꚘ�oH�P�>I�WP���������j5���ǧB���)+���=�F_ȷ 0�swuP=��� *��Wu�,?�QbEC�RC����`���k�-��+N+�<���M�ԏ�G� �=T�k���=�p�g��(��G�6�@�Q�/ �Ѐ��0(��o�o�̌���M�};>Wh�C�q�1/�Q�� �����.�N�]3b��Iq�7^ ����%q���+����l�Y�d�P�_kȦ�[#�w��ltY;��x*�m�v�j@�g��"��۞R�~y~�H���x}�0B�i(:l����)���Vz#%�B9D)Gj��� ��혢���W���B�2�4\̰�W;4��:]N"�b��(e�`���y�K��w<��{	�0���������e*#�e�����4�Z+b����w�*�'������#�P�)�<�j;�</c`yAqt���m���(|�����~�Y>:�߂x�%<�_���R|�;7����A��hM��_!,�s���sg���z{��:��ju������Ռ�ɥ�=nQ�-�Ur 97z�ޑ��BS����SSn�&���'5u��H|8Q�D2`�$�Ĳ®���\�>d�/�L4T��sZ�a�n�`	��9$&�&K�T3D�������M�@�)�%I�5_j,�+ �\`���\T���(�'W��X�u��C>��c8�Z���C��mR=/*��wvKKbTY�� ���<Ve�L�Kv��j��j�;r�E���QE�RŜ.�8N�;2MS�H?.X���P(o�W3#�V��ޒ@��B8�^ܡ\ȷ�ԍ��c�|�@SI܀_e����x�F��S���(,l�eiՓ���#��fT'W���~�h�������}�S0̸n���6�Z����OD�1�DJ,Q�:�8�ȸ(�$�	hB��{�G�K_�A�Ӛ�<z���f�{5cÎ$��.8��L�,kCO�Tn����;�o���7�I���V3�5��p��"6bǰ`�:��E��=o�=�|�c����<N
BQ�~R:ʉ��fW�Q9#c�;!U��)�cg�
�t��>����I���%D��7��K���7C�O^Aeb�����w0�	�Z��a�["i�����)R�K\rCv�Τ�RE���:�olڊ�d�]o5�qo�Y��Kh�t�
^�
%%Iu5����o��k�[�,\|�;�)L)�ß\P_Qek4'�d�����qϷ�{[=T�"\�ziP��Gz�2T��{L�aaB�M�3��QPp�[� >����^�,^�^>�&�,��� ҿ=o|_~�`j]v�ScG�_�$wo���(�քY�&��G3�uI�-���Ĩ���\�������� �����^����	�ܸK���.h5�>��"��5%�4ӳg�l�x˸���T�C�5	Bm%�U���;l~��]�����t[$M�����X�4�J�Ct����U����a����b���Q�x����K��Qjl��ÊL?/l"�q4ZI�$�x��@ �~PS-TL�l���w��0(\��Z'�2�,J�c
/U��'JF��P��\���ή#���	���O�y��=g�}���%ɓ� �?AZJq��<oYH����m^Zk�>���t~�����|�!���Ū�	��*�as=/#5�?,m#�����z>~M��	�u0�[��B1�"2�bx�L�&譢j*K�����H�(��X�2���9q=�|����s#I��Å9�4?�/���Q��~9A��h��Jb߳<���3�z]x��P'�ci�Ԕ/��‶Z�	3z�������eo���''��t7�8t���b�1B}B^��sq
 �GY�Ƒ4���/� k�P�yQ^ƛ)#�<P̃����4�V��URٴX� ��.9JD�$�Ңv�R�<�fD��J05b]�mUw��YU&�A�0�w@Lo��;�M���M��Ai���X����W����r��ۤ�N�!�G�l0p���D$^\3�	J{Pns��kaހ�̣�C�Y|�B^�1�-k��~�2�O}�7��z����)�*��*�ZW���✩�ߏ��E@/1��"K�*OG`�d�9�O ���2]*���0 ���}�8i�J�y���)�lX�;����m�R̷w�/�[�|S6[~S!��}7`�a��M�U�2!h�`�h�;�K%`12�>��s��(
��aH�Pߛ�=Qn�{C:�A1��W�JN%����6�u�y/Y3l�O��u�M�j��eO�PE�0���(�7�є��?0ހ��t���qGD�2y7��װM��)o�,yP,x�܎�&
��K� �IZ���=�����D��ԇ��E�"p&��DWK�Ȁ[`#=+�E�Y\�c޴�od��X��	�K)sÆuʧI���u�p�';GU΁���Ad)X�!H���ˢ%�E&�gQ������C\�M�w7�u�H2+�KR��b�Y���[�����"P�St����T~רC��9��rZ�P�����J�g�Z1��m�瓜A�8PD� ��a��sQ���o�,�M�r�)�1�1���E@ڷ3�汓����"�c����y�>9�Q�X!�;��An�oQ��PdFY�|Y�PTW�n�$� �1�6�&8�o����ر���vMv����u�G%I�����"\�Y�"���M���`��/W���V2˃ _P�Q��[[�g��S�&��ﱯ�2fs�����z���Qs    �dtD�3r�r��	T Z�@��F�0�.;QY��;ܴCƇ�6ʥ�~7�L7H�m&>&ؚC���R|Uđ{�n�<�㍈ܓ�j�b�	f�����yf}e��az�f1����>�A���>��`w���$d�
R۷��UǢ�,���%Y�L���g�[�vu+��m��%�]��mr�WRL��U>&q1A"|#����V��*I{������W�f�es��E G`mb]������<���U�Ox����c!Y�e	}0q�FA{��3�ѷ���8�u��Yb���d��8�(�]	E�s2����?�wݶ�v8�i��8"��ᒿvUq�[�]�ވ��7W�g`�O�: f"L�n�)���%�Vn�Hlq#�F.D2�b˯��f�pڟ�VG�;�#��_��J�(V�(��j?.�er�0��ʙS��Єȡ��4�ɇ��{���l�Du˃:�_��5G�@�h��(Ւ�dP�����B�y٥srC#NS��繆�5�y��z���JMZ1�"�aF�G���}3���T�\分���t����3p-K�.'��m$��w�����l�#�l���K-*���Q�����j���������7��k�t6*���;8o�	G�2N�����sE>	T�Q�� ���Zڜ�m�3􎦘�`Z(�4LP�g*J ��k����3\�M�|y�{YC���rR��`w�����^}�����n ��qtÍ���kz�1����5*|���wt!�1��[ߍNr���5^��7;��G�r�0M�P(	ª���� [��cݛ�NϯgyP��!�����WO������QO�Ne2�"�K�� (����.����=P&����:`�8s!���Vx�~�[+�e��Q!U��׳r\~2�eF�j&!Ӑ����Gr���ؼ	?O'a�����no�|i��S`Ϊ��9�:]�MŲ�V�y�7ߑ�%�SNȈ!;7V노Bab���n�e�Op���;��O���l �"�F�8�j��'�S���f�o�����j
�F��o��.P8kӾ^$�|�b����+t6GZ �M�e�;W�}OӰ�i�_�c��E����B�vر2G̤��v����H�.�K06ޟpx*9'��tiA�� ~g���?J�����Β��RK�W��Z����p�������P�mP~�NT������V�,�� ��9Xf;��C��8E����{$F�=y�y�)���Y���+�j?�$��K?�yOf��f����4��������W��VDo�.9#��h;���}��:�d��߂*�^���Π6/����#]�To�c��?a�ݩH�71L�{�q�ϊRE��%� �uDЉ�����L���׬���?IUE'װ'!���K��ϑj5�2�{��N��$ˏ�|9w�+�5y��w��TX��"����*�$�h>��y �7�c�5��N��qw\Vcu� Z�gz_�j/�--Båb�F��i�o�d��ݶH7u��s
��h]]�T9'ۃ�2$��Vt7�Q8���X�0[��u��Rń�M/�	��C}�9���P>�����2v׎P*_$կ�����C������1��+���̢�3f����Q�Ir�À���f�-Z�J�eMv��cf��8��)w_|�7�;�����U�3s�u4��5zƬ�A l�7U&߇Y�d�l.ܗ��;}������b$W&?ÁyS�7��	�fT� �i�%�|E�ݛp�d����!6��z2+Ak�>}�r���=F`6�:��59�>i����7e�ٗp�o��Y��Ϲκv�AC���E����+嬯�s�����;C�����dRr�.�/�Vc���m��^�2�	�� *��~�*ۼ��
��6dѮX��5�]���ɨT<�BoCᏯWIƯ��˥7_��M}.��޿�#ߠG�k§���t�_z	_/y��?1\
j�F��w
���PQ	r<�Tw�݀fe�zE���PI��\��T�-����3�0j+�Z��ilW�����kk�����k6������vC7ę��P��¡�k�fq�<'o.E�X=�F��=Dep,t�Y�šE�~&��	ʥ�l�m���Z�s�s�N���5�Nܒ�P�"a5��À�iu���;i7�X�/zXo�Q�Ք�i�Y��z�;/��"6�-����=Z3~�%x���{t�tl��<p1z�շ��9�<��
�&7����Aв��/>S{�n�֒0$��/V�����'.ՅC�V\�=�z�~Ŋ��7x�{���I��MY�P���Q�%����ǑyK�k(kM��9��rQ�t@j�_���Ϫ���$���̚���p��r���@v��Y~'��N���Ȩ�"..7��LZ�|$m଎�)zUm/h�jd����J��̟�;��b����5��BQ;�AEV��+�Ţb��)�N�S�)�=�S�v�f+BD����2�Г���\Vd���h��	WH��Z�~Í�:�`A�p(����Y�kO��{�׮^�S��T)�'R_����Z�=�7�]Z{��!V_��c�i������A�{x��7ք�b��H��$�H��'�x�nҮϧ6߉J�aV�`�Ϲ�s5�M����7��oc��x�x�\w����2�&�: ��9d�0��Ef��4��ޖ�
3�������2�n�xq��@��qi���\��J@����>a�6׍<����[�/����0<��A��.y���ۊV����@@z�������V�M� 9Ռ���3�Q���/�U6���}V���HO��3�^^��f�����t��vGҸgW'5�ʟ7	I�!��tz�:�Q���ޞ��F]�&�X���q��O��@%��$:�)����D���5m���~�c��"kN�Ku�д�mh�4��њ���n��J��݋=g�mk�_�2"J�#�]f��뛹��bm#�lO{������A����x?�(�^��Bcr5�0����iG}y��@��;ˈ���-�0�[]D��2����b����r�� e9$��qv�:���DRxn�ß�%g(���h���.�~�ޞ�깱�%��M��E��8.7�v�o9^}~ꬄ-��]V�.]> ^'kyY���s)>w�YQ�s�cA��;/B�C�^��L6�Ȓ&z�1��cɁ�zn��
�i`���C��d�s2ce�1M�{{W�wg�~3Q�9x�\N�<��gdX���Q�n�̡��P��;j{c�H��q�V�H��;�I�%tk��ϕ��yLX�5���!�c�z�[�)�D'�+
���Wy,o:H��O��Ⱦ�ԳȜ�-��B��q�5�?UK��>���-���(���n��i��;�`�5ٰQ����hO�~]:�T���e��������a��2�Pe�f�;��h�x�-�}{˄c"�~oqL�ޑ1�K�#^f���&�]�`XE!�)\�q���FPY5c3,��
������es���J{&�����o�Ƒ��Ť�%Bx��WM�t��w���x*��Q�|�|�jBYdd%�Vg0��ȼY����Բ_tc��a�ѶC��1Vf�N|c!?����=�(�n�h
�-�.'�]��r}�\N�3�>&Nbp6�5ydʃ����r�M~��mM�v�.���f@� ����`w�	� *�k�P���V�,V����eJ�[�8���zeq駨��,2G�4�ӽ�P51!�<|�����ʈ������dx���qP���:e���7&O��AS�ޮm�E���H�e��F}h�/�*�K�_��֎�
`���Լ��r�⪳��\�o�+�G�#�eWs��Hkӿ�mO5�@�%�@ ���.�|]�5�4_h�o9}}�w���=��M��&��Ѧ�KI�o�g1�˓��J�X����w�;7��6mn��E]Xb���mn�z �z~��������P�>�t/��ݡA�7g	��_E��8˿��4�ZmI�94�VWZ��⺃��v}"��t�︡d>�7(� %� w5��    �:�S���h{���I�����)��}�V�z���b㽞M�I�7��z��<c�L��V�d�5��aN���M@;�Vk�����l��jG{��N~�_��&p����Gr��B��=3`2��ۂIa����!��7�yP�0D�g6J=4�9��/������7w���UP&��q\���<_� �������#��p1�)��I���Ta��bFNΤ�p�>��;|59k����Y��OԕC�t3�I�!���G�ieE����5	���Ȑ��}Y����oI'A�'d���*��`��BŹ2I��$�����_7�R����[����<�~a�{�4JԩTg��3��)=�W��ޏB�Id8VS��rr>��=6����tޡ�K�jV�P�Z�i�^<K��>�M�M�5.���L��o�٥/[��S �(y�%Z��صT�*�*�{�������b�D�L��}C���9[a>��=л,0+=�tdp��{�[�� ���o`�"��ژϏP��|��9v!��A�tX�Ş���� ��܋�X��q���:�D������O������^�#%)�������n.]��cJ�fo���j=��VLS���*���	\��?JL�� e�-�b�������:DJ��ڲ��}j�������8RС#��x�i���&��p_.�L<�`2��O��43�C���$lR���y��i6_�qv�g:�D�<	' 6��i�T�T�S��(�T��]�
��f1\�ʮNa����7ũjt���Ti*>P��!���m�u��(,��`3�7�$��wʃNO�o{�Y� ���cR{��D��p�衷�"��,yc`5� �W�F�g���4
Wᖘ@�*׃�_U�C�����+cU�~H��P�J�O���Q
��M�$�J8�4X��n�O����.����'.Y$�7�gjw�{���D��#�=Y�Xz��M�5U?S���_�n~�/��n&}T�7!QD,�"�޷ޢ�#�v7�s����bE	�X�K�����Ğq��j#$>%OI�:��PN�m*�=�S#׭�q�x�	���teeZ����2`�a�8j B�?UD>��=D-Ge�]_$���Z�6��%��ؖ���idf0�X�������<�*efU퉡��/���ք[���S�vMxB��l(�O� &�G���l�l_3�w�g�b��"w�R�۩��Ǻ�$�l<��O��!,�w��챗f����_b̈��J��*}K!
ue!�������"��A~S�c�W\ˊf�hL��D3�K��lG��XT
2lu�kP��B�om@�'ŻԸc���Ш9�����m�٪ ��E���2�4���������	�@>�>�iO����ɲuU�A2X�g:ߦ!����@ͬ�Á�NY������Ex�zu�(�jjN��]�n��+��/*�Z�߉L'�h�Aw�ӗ]C�v٫�+z���V'?��C�x<j�y�	F��#�*OV!�h��)N0����1s��X>8���+�?�����+6~�����A?�]���nV԰�i�V�P��&O����5�i4lT�M'�6�K�s�,�Y\���vf�����1��Si�[kR����+�IA��.L�ڵ{��i<D��9+�nj�T� ��qIN_�7u�A��eF��q���S"S���������N� ��$�~�?�g�� Z.m$D����Ot��#1B�i�ہ��H�G�$5j,����֌x/H:OHQ�Ḭ~�}��M����)�w��ʵu�V�e>t'���sӋ$�!�����O�`a��PgDڴ(`UJ�~M}����b�ɷ���}[�07{I��zX$�#��fb������{��x�C���!֦}��cT�@�]3ݯ�TJWu ;`Q1ΰɧF��2j>���cl�]w%�=���<A�i$#Ė����S�س�X/�8����-u��|��ߡ)t�)�ڣsz�&�����۶����~��i9m����^;�ur�O�m��X�[2�r�$������ߪ~��K��+���ԣH���r����m�8���s���~RȌ!�M����څ�����B�n0{������ 9G,q�R7��󬯟��Zx�`��L�+/ґ$sZۛ\�yt#&��?�Y��r|���5D���$���;QU�$�/�p�j�K����Sy-��ʾ?)j�.��N�vH�7�h�e0rǃ���[�E�����������D:j{�oЍ�������C��3�����.fT�n��7B(�͛�����G|��i�t%�N�;�߅K����VS���x�a�8s�;�O��EhxsԤ<dN�;��t�V��^�
���Ol%�9�@t+>)Z2�;9/�u8�\>��P+_��F!"Q~�r=�J�o���pak � ��޿�tx��)���*��(�\�T���/I÷���3�[>�O��`z�C��ފ� Z�pg=[m��>�P�dL���|��b�W1�?�\��κ54,Yڣ���ޑ�)ઝ���Z��h�����)�A�
�ӵ�C�A��`|$�\敤7���/�|��of˻c���x��}�p:7����JyG�����f��1�w��g_X��w;�H�6�}�:���՗�a��A[�oj�V%�v���l�?��A�6}��Pnw�����}�r5��U�� ���U���~B��A�o�)G�"bWb"��̭��Mϟ�)��'�	*[�����˧Z�������PSd��v�ޥH�<-3ɀsTި|O-����?�[;��٤SX�%�ð�����씭�8ۺ�KQ��V����I���j������/
��(��6���_�	O[����M��0�Sb��<�/oɝ��%\�h�S\\��G�}��wh�1�t���:F|p��n�f}��cKQ?��x��@q�R��uk��<�χ�/⭶�A~�azb_��cx�`�:���r��X�f?O�g'�^V��Tz!�1�ҫ"8;I�T�GM�v���}%X
N�����ľ; �'IA0�{ W[��k=�7��EA��hT��M���œ��~�a�K��`k��:b�e�&�}��jp�f��L�=�,H�\^�wJ�Ѳ`Ɔ������Z�/��Dy�D`[mV��M�ܱ-����:.il���c�<&�݃o�%��;�	��UQ�n���)���\�L�F��HD��H�1�v��r	C����\nj
��i�f�[�t�]��Zu#�P�:����<}"[���#�&"4~+�E���;�N�kq=��'���}e��v��L�������ɘ}Y)$rq�:�,cPY����H�OH|�X}x�ٯ;���#��S'�s�T��%���q���ad�R�;�����|;D�?��c�Q��Ā���`0�3rΙ�T�7�Iղ�%]��7I
�\��,O�*��VS'/[�ۘ}^��WI�G�P�B 񫁽\h���n;���Pؼ �U��:����)��Q��]�I���ӍJ�k��cWp���o�W,75�h���&ގ�	�5Q�����L��hM���Umy,��ij�ϖz�U�r@T6S4��S�:Й��NYv�� �m�	�����L�����}p�����aC�R`�>���:�O(�+��7���Ut>3����%���T�L�7��L=Ѫ�F۴����dZ����hyRæV�˚^����5�P�amT3�		_q�Ͽ�4l��RQ�g��v�^�#����y���H��t�h�^?���՜�4U+�1U�,�h���9�޳� S������!�u��q:�,��}�@�tƽƤ�u��͂0�IR= ;�/���ZK.�T����_��f|�	%�ܦ�-,��9���ž��Q�4�nN֞���&^<S\���y���\66/�yL�Ķ���[�<���w�m���c�M5:fO�b�d����\1N3�em��]h���N��,X�+ذ�يߦG�{ȇ�|�C�|O� �۲�Pv��	���    ����	����=���I�8.cu!e*�a�<"p�U�V`�=�}M�/x�t��#�ַ�+}YR'уpie7�Ѐ�[���hk�J��tx���B*d�X��"4���~�cI�ź��S5�d����Ӌ�m������~K�.ߗY�3a��x�fu2���G՗�Jb��`�g�Ǽ���TH���hð�<>���e����eǧ�)�:@�u�n���L?��zL�\�i�B	��L)�+9���:a�CG�BC�$��q��ؚ��_[�R[���@"Cu�y���2�7�f�nA�f�4�b�#w�@%�n~���߷��SK�����vG�V�MI�KZ{o���ӛe}���{�c�i�8�ֿϲ%� ����� 8Ϯl2�����[�:����M�����2�
X�F���#�(��G��2�	ܻ�C<�_:��X���9s���qg�3G��ߩ�0�U���~����	Fβ)�ࠥRjJa,D���!	���@�L �3�v�D�H4b=���CZ��\�,��:Z�Ӊ��}[L�4�I7��G��
�/܅���U��aC�H�
i_�v�3���Pn"7�~���N-\��x�l���3E�"	p��%�8F%���	��si�����9�_d6@�����2�>֥X�M7��4- �r'�i��f󤪊�%�x%B��n�~ ���_�&L�D�>�x�\?��!Z�G�Bi)��������J��f�o0����Gx_LM�BX�ɷ������!��2�ak��i�K/w�'���5�b�җB�Ey^I�]�
N��@�'S�m�q����qt-��s����^��!�:��B ���
�����$�V�Eg*+��B�z��2���[� �B��>��thY�y����6��>.�Q<I��LL@��8��,�WB��%���*.C�M6���`iZ�\Q�A���&��sk��!ͦ@恐����wjF�2��������E
4��7��b�D�yD���cn�O��Em��ؐ�8�Ψ�4�=FJ�L�Ub(ߗ� @c��Ե"�I�V`r ����<�4v]�+p	?�۾ks�K�@�w�M����W&X4|si:��73�U�]h�[ښz�0E����U��gǛI����"���wBۆ��6[��k���g�J�����~jf�����Ey��~�@�fƭ��H�:�K�v4�y��{F�Pj��T����)p���!u�]�1bE�YEfZ���=�k���#�2Ŋ����~O[ҋU������ƨ��0��.�%A1�֐�˧�XY�_�
y#~���9����ۜ��l��V����-$0�'d�׿xKoQ���~m�c�L��:�Q��1?�b�1k��M��͏����KmM{k�k�mAr��EE�����ͤ?�a�?��<EK:ę~d�vO
�\45G���ov����o#!_��Ҩ�ыt�y�����/�Pŧ��G�;�&���8�0U����ANL��4�b���[��@���3��T1RcrL����#�Ȋ�.�K?XR� #�$�/��C0^�u�Mȅt�ur �D�ܙiU��2�L�XXYT�
�]��!ޥ�%�ɔ�,��
��mҐLp����4��&��}[��$+b;��Y�2̆��~"�sS�&�;E6k�;~Ik1j'����(��O�
,1#U��N��\�����S`pA���������-o8��GFqY�O]�;Ij���B:��9"��O�٫�n��J5���D˿:�/�IO���4���t��A���V+4�:K�4��h���ǲ)Fx5�,'��Eܸ���?M�
X����G��N����MH��yUr5Kڕ�0:�Lo�a��/��A�s�T�����&+�}-�eyDn�c��Mq���MJ�D�-̇� �/�����. b�>�������r^#��˘j��"��4�&���� p�lؗ�V9b|��2_�7 �[Sk%+��S�ؠ-M�R)ƛB��ck���(�Gj�US�����z��4@A��:=?-�b�ӳ�)<�Z�]�k2P��e��~p�$�,M������7����HXBJj�5-��w��U�R01c�W�v��&T�6r���y[�^�yZ'9���Ĵn��lm�����sk,�ߞ��4^ �{4�m��-r��p���S{%�K�����{�N��(O��z��,n5ӟ��kmػ�Y��>�������nL�)ġE6SF���{�X��R���"b|���Dw�%(&+pb%<ND�bk|1�H��� t���)�6>�t�c̶���u��hW,�=r�v}��?x�.n�_�# ���I!->}�|��f$!6��I�h&�~�f{���w�g�]C�m�h�>cDx��=�(��@�!�x�|��o�?�Ӗ�y�%�s������k�l����{[����Mj/_%��S{� ��g�'Z�gJ�$校���������X.�R�z��[����'5򄢘�m��h4��KE��Ag�;�x����|�Q	��$%�)�7%>�	��!�+X��}�{=;����9�Y�����H��i���;���,�B$���&3'A۷�t'v�?��^ )��!��,+�^F����=�(�ia��8�����'+׃��O���F!>�4�����t��t���0{�< �,kbɅ0gQ�xUs��x�CC�����c�Q��x�v���ͭ�ȁV>��=���e�POE�L
"�E�A���`�W��kH:{^�i�m�0ǡE���%��d�;b8X1��"��wYe��L������e��E��H���|\)�U��)�J����&��=�1��|?�ah ��}9����3#,�W��p�������t7��m�]��nرS���hİ}�/���R��WI�:=��آl#v�8t��lBI�����	�I�We���;��������Q�b
�|���A!Z��ȢZ��M/��p2��L�{2�=�����N���I_6��r"Eq�� ɉ"�c�Tn�ԸuV�+	f��<ւ2L|;>��
�0��N������#N���H
[��pz/\Yݵ7n�@�-�C0�c��[jy���Z!�P�gT��o�6T���<�%�)�R�L�����K�ɌV��j^�l&�cA^O�������K10����s\��,"č�4���61�8�h˛�gOt�x�}��~�<�-������N>;��"�eg3�QKt������@�#k.	�E�$Y2�^wڧ��`OM��D��V�ؔb��
�f�z�W$c�(���s�"ۋ�� )�+l'����w�W,F��Q���5q�y�����Ib[�$u��B�F���ezܰ�>�c��d�+�=Η�1�3��r��?��op/��esG�$�J��[f=�$4o0�Bo������P4�����������	Lo\$l������/��I�꯶(,����j��B�;oɾ�ZOc���ݥ[0O�ܬ��Y鹂�N���AL3y�ih�c��^5.
�v>�kM��9�� �kH�-`}��Vٔ���%�BP�MF����{�f�z����+/9� �w�z�!��$@,��k��=WݴVYƞO�
��-�%����=!�"�Kl�އ�����}�:�.T��~ѡ����R� ��ԝ����>yr6��Ի ���<K���&��K��)r)�'D����n��%:D,7��W�(���G��^~�(�U
��	��~�9P��ʷ��R�G?<GJ��j�8׀c�퐇�$�w��z{���i	�����&��^j�������8�,dIHo��K�WLN�}BC�J�$��$;�8���/0~#)?�\��: I�k�vS��D\�P�q��d�oG��杭�R=Q#��y�A��T����i<�WltPhm#NF�08����J'nX����+�!�X��(�6H�3�s�L!]�&Y_W���&B5Q#��j�RH�λ�����GJ�ܠ���#�5^F�{�0��G���[���L�d,�r���E8��ŋ�@"�Uug�U8�    4�$�"?��Qc�w�²0
Q�լ��g��*�.�a�������On�1�¬��j��"*˃���h¡��?F�zX��bR�	�n���e������-��8TKe�D3M���d�ֆ���w���ZaXn�seR�P9���*E&1��0��0���������՗������!f*\Ş�`K�(�������Ҭ�k�gz6[_ۈ%������g�,Sz�F5�1��1�� Yn��+�����	�E�߃�ZƖF����~�o��4�ٲ}��V~����?��H���D��d/� a�yi���)V�~	*�v��x�>Tw��](=G�r|e9c(�����_KKlI��V]/���?UR�긖_�?��,��/M#M����"�IG�,�K�	^[h�5���Mk�"��ˈrɗ��+ձ|n!�|�y�"�*�0h�B�9$��c�=��wj���c����%	��2�sv/��]24<�m)��=���~6�O⼅�/{�PM��m�����]��iP��o�2 (m'��{�c<]zZU�fC���;��7Z�i�Z�a��Q3��1��u��Oh��n�f%��;��r����qR���2�Z�_����b���i@�w\m���G���0(�F�=&�;��"��ߪ��q���K�:Z{��_��7P�p���Xg�$�B��gZ3�����-��Dċ~�̝J��;#���Þ�uoRR$���'�KA�����Db�<bCJ`���hV*����|B]���UA~r
�Tȭ�oR��q�pl:�G�_��=
�  ��nu��d�Gu_-�Q����p��{�`y_�xR7Do����U�*� �)J×'($�7J^���|У��pR@�c����!��i��'�E	�0XP_�A�[�����Fue���6M�[�\quh��MF�k༧��_֫���Ⱥ�������9�??2C�v���Z�vϳ"�'��J�y;%`^�f�ջDvJor������U����\'�v�@�v��n�^����Ԗ�G�s�oGi���7����Y�O{�;%ZAv5��`%�_�څ�#���l�#k� Y�,���k&���t��Vq�Uz���'냤��dF!^�@as:	���դ%�x!M��
}|%��h?"_��K�~�G�ֽ���9��F�+P�U�� aC�5^T���� l]D�wq6xg�tx�CC(t����sU���.9�F�T�8�3H���ȢҖ�}�k,���p�pطQ��u�ߺV��
��Х�7��c����&���hQ� _Y.���=g�i�P��a�&��++��icZ6��� ��)��r�6��o�>{Ľ�?)�P��=�k�J5���v��i�ᭇd&�#!��,�|��D˃d!�P��)�R�F���Ў�eT���_Os�oк�f�&*$M$ L '�I���J������E�~hIL��^��h��Cq~M,f�O���Qh	��0m����$3����L�GIHTO�#��cn�A�ƒ`Y6h��>���n���~z��~���F�옽x��O�=�������#Hi�j��g��%x������ ��c�o�����l�O/��%�ʀY����`�t�M�5A�"�z&�y���51��Ǉ˚�<eY���`2Š廒����+�%��Ԑ­XW,�u)�JS�w��Ⱥ tp&�>�Mv�&��H9k���Ƣ���Q-{���2,����!d�.�f���<g%b�Ca��,o�\w�u��M2ȏc���>I�V� tNF*�?�bQt_��(�K/%	��O^i����42>�q���D �:���IP���CgŨ�%����bq�%�_��kp��Dr۱_��9|�7�#Z�$�:�"�JL�+߾�o�)+�w=��#
�$��n�� �ۦ��u/囝�9=�wͅGz�`�,R`��N(���NY���	��0����[�"��<���-��f]p��~r �K����%��O}���+zD��t���Բf+�����ܻ� ����Wso���yN�+c루�,f�[�2��ۼ�K�1���"[5	�?Q�|8�C�[��"6���%w��?��z�3��r�	�9�;n�������:� �~ɗ�ϸޖ��!)�w���������������R~�e{�a���*t�z�JDp�C�Ċ�:��ͤ��e�@-�L�ɓ�	�@��xuk�^C�$T�z�����F6�p� [ �d%ɉ���؝	>��2��� -��)���L�-u���������B��q8�6�ɱ�!D�쟯�۔F{Z?$j����.7��q�3�p>�_*�4�AN<y�E�Ni�m[<R��:�G�ڧ������s�XC�4�
��m��kW2��$��bg}��J���9�ˬ0�(��om���z[�o����+��Q1ͣ.���X��.���F�
Q�`�ٔ�_��]����HQ�,/ �����U�� '�MI���=��R�ȎKe�����Ə�|���?%����2���EF��ĚDot���t�Ou /͍��@��Gl�W�P@Q�= �ǾBm��(V����6����֏CO�
�@�l=�|�&�@�!�wnf�`��"y��SB>�;���W�K�0�}�W�AJ�:��=3A�s�6����.��昻]�� �t����:�G'bvo@N�-�dk�4]P�9�Ê��nԽ��jH�]s9B\���w?��GnZ.P�Bp�g71d�^���a�ۅaц�q�go��Oy��6�C��epI�ʋ����a�TS+��+��{�ry`��Y8~5F
�%߷�;��F�9=�Q�pG�	(��A�U(Q1����ޝh��݂�yx0�t�����0,���r����H�u� �=���B��x�Ư�.M�Նei&�U��	5��G����B�d�N��:3g�G9�x�}B�a��3���-��/�+�5T��y(�n�KT�E��O$��vF_M����*sNˣ7 ���j�9�G�ں'��n�©)u?
K����ٝ0_�WI�A-	0Չ�ma�!��.���g�{ ���" �~zX��,��h�Z���uuҿD;?�z����,���sj�\�U��.>��z���hͮw6���fǒ�(���XC�̬�dg;�h�&���@��N|B&�� Pи�`�?�!��q6�~8�fV��V?Ѓ�g=���0\�1po��tr�7N������=э��?8�⌶թ�da���
rFc�9�:�MɯN����:� 7<�*��ƞ��ug�!?�����H����X��Y n�_tn���p@2�!��t��y	��A�H��4eD�t��ȯ�w%:���N��+y����7���I���w��9G$c2�^��Hgj��x�R�]ԟ2�j���K���`2�Q�晙� A5>޾$A�����j-�=o}W㹋��M���(�M'ݜ������oh"3>�8�N]����ĉ�����x�����.鹉~S��.�_�����A2G�㋒,C�Wίp�t�]�Ҡ�3C�[��$y�85��p�}_�vp�>�L���I���~��߯��>ѻ[zE��K�{W��{����O�f-X�$vt��j��}��5�m�v+�m����'KE����yf_
���mxjX���?dS���w���	ŉ��[�2c��,ս��)��P�Z��q'Ŝ���iS_	eKWYv���hG���E�uX��ІͷT��a��\�B�ҧ�ga����d����ؼ-�P�����;!�����`�P����v�*Cj�uw�4��9���Q�V��;�ע� ��T�՚�3a|#ӿ�ʠ1��:ݫ�B��x�Ij$�1k�ﳳo�fC�Օ+�#���pʎa���t���q�O�6#d�h��؂i�;�~{�jT���Xg=��+Q׸��f(�3
�7�}Y���h�d��5��Ό�����:��xӞ���j��l>#p��i+�K{�    7,שt�E����G�/��_�����6 ��/#��B��2�bB(H��/�͵��w޺���{(4����rӔ�i�I�:�9��j�F���6��L[dy�!y��痿 L\A�R�9RA��,w-���Й&�<��������u� �0���	��}o�C}�t���1@��7����q�P��?��U�،.��~"�|{�=����7�d���*�.�NԢ��T�6�BU}媚1�G�F�v�R�W��AV�z��*�n�ʫ�����xgl��-�}A��*�E���_��.�ԥ�������|��F�yBfN��z�J6=�Nf�D��վ�d�6*���]Ai_�)�~���b�fiݹ�'�^�L����#��߷w)P1��)ƾ��[���=n�:��׶�x���Ö�|�P�c�l��RU�v�ht4���&cF��LUYjw������oHWf60����'��b�⇗�I3=�����]�'��	�e�-w��_l��������KZ��D�6��v��ߟ�UEb�:�eО�J�,;@l=w/�}�ʍ���D���h�3f�Z���J�3�wIb�E:��/ګ^����3} >�'C,Bssn�޻	!*���W%�a�9>b��!LЕ{�(k��F����R��Ҟ�c滬E���T'�����X���;�C������:Y��E��11ipc?�lh-!]z����#�̿�i���q���.v��ߘ.���o�TP:������
l2O�����:��h�M��(���ņ���p�����T�B��vʷ L�o3�SR��i��L$�v|�����-�4�U�����~�s�G�k1se�ȷP��ۙ��P� ��/M� �����6EW��毢���-|��By�(�=�/Ѝݲ���_F�X4��[I�uڝn.0B��Ή"��\QT��b��=� ������\�*��1��M�C�mm�NӃ����oi>Ƈl�xl�nJ7ٮ��;f�+������S~s6�v��1��H`#k�S��h�Y�<�`)T>.i+l�s��sFCJc�N%b�0�$�2������ڔz�M���w��l��w��z�z_�/`��� �Dg���)�&�}Ǐ��y�	q�]��M��2�/I�ɫ%>Ӆ�<�O���5Y(9
D}ǣ���6��a���vߨ&�z�tԖ�#'
(Hg̞}�tB�iҦb�t5��R;����^��t��S��"F��V�ˍٿ#c $K!'>�7on�嗳��2�.��6���VC��,�ȶz8t�r�J�����<{b#U[��m{��-��rs�u��Y��#"UY��s�u��&z���6��]��r��{1�8n|4+�61�e�@�,"�T�4�y�:[���#�k(w���T8�.Y�7!���y��2����vQ���h�2{g��G��v鉇}�l2��p���@���b+�h�塀+�/������b
u��W�T]����� ���u�rP������*^e�p4���������0��ͳ�e��d2��7�LMW����?�@��~6n2������'4G���c:�0�s�'���^����n&�R.��I�¤��4g~�i��+���~��/܅ޘ��g�\�D&Ֆ��f��e������9���	�)*�O�ş��m*
�Z���_�O|!g�X�'-�z2��Kn�z�:�=���ф���7wuK���D��Z�%R��sw��a��Q#��~�#����=O[Q��r1�`�hh�6���+�����7��1��0�ׂ;�o|^|��m�=��p��y�_�W����]�j�@A*z����m]vK֙�J_[8�X�7\�E������I?נ�LK%��XCŝ���%�h0���U� c�#F_��dX�߉�RV@w��KAr�6�\/%hT={�6q��;��s��=y����mxG���D���W�֨+���ƅv3����3c�����v͎�T�Ҙ	��O���f%q�/<#}�y���;��<���8\���.BwA�	�L�!�Ok�޾���<:%�yW1��L�4�@��
Z��Lny�
��^E&��M�?�XAI!����!�W?�$�
man(����&�vڍ[����y���[���x-Zc��G0�ʛ��E��-�GW��ށ�\&�����X�t��8�J�"6�U�\
���Է�P1�~�J��Q1���~�|��;C��.�58��.Z���홣��goF���)0��v6�YS��b�e^>���Ċ/��}LRτ����,
����ɇr��tM3͟F)$t	6��
�_䡥O��Si��$jJ�%L ��ÃŎ��C�0`�,B�����΢&Pa�°�w2�f�Ҏx�
���] �'�����`�aܢ�
��Z����
@���|y�����I�V M����&G|E2�	u��l@ș���d�$7��i�s��J3��+�	#��e�;J�����"-�9ӛ��5$g���D-M�9����b(Q�^���%g#9:ݷ��w���*���X1e6L��k��][�(��F�G�^���%Ik����&_i�/�v��_+c����CV�ּSLb���q�P�~l�i8wI��(?��]P<s��fnUP���@氡޷��d`
�'�f��V�>\��i�0�g������5~quX�&x>ڛ�U��'nB��V��.uqLg뇼�&�ß���Խqp��/��\PO�Msg͊�� ����.��R���r�ѐj�/�d|9@�W�~	�q��Yg������&`�
�H�koF��z�P�Q�Z?��"f��s��+q�lJ�-�ö����9����q�ֆJ��B����c�z�K��N-���K��l_{��a��1�c��p��.����5sjr>���2���d�:1�a�{E65���C���D$��:�Rf�&=D��J2�_��!�B�O4�\*q��a=l��?0q����$)��]hhGhU�ZV�K_Ƶ����J�X�^p*g�:���HY�Bu�䢛�^g���ǫG5���"���JM.5Z���hʗ��OO�2�2��5����L(Xݞ67�WI��>3"К�
��12W_��ҨM9��J�Fd�	z��񯯞h�)��1�i��쯬Y�8���˺���v������P7��ṁ���96
�o|Z2��s� sZ�d�?��V�;!҂[��y�<U�v����K�H�r�K7E�L��c�b�1g��sD��L�%��j��7�D��@#j�殷��\�>��ˮ`��6c�+�oe�o�SjJ�͒q�0��
]� �G���蛟i�P���(�(#�$��I-uC�t%��bd��_���_*�Mn~���
�+��a9/��U87�K$��tϑ�T6(_�!�09j= �����;��(O���_��A�8���0�B')$Ђ�@���q&�,jM�$�
��2C�Ҵ	��)�Z�<:�hC����X�������%�*C֛��
�y5^G���(�G'�7��%�-���+K{�ТD�_���5��<ڎ���+���/�E+�S���;�|df���쬦����lG��Z�f�~�߬]J�n!G�����h��a�s���ƅg��ju�AP4p��&���Xe�� ���[�7_�1f�Wy,t��apn�u`d@�qz,)P��h��e�g3�PFYwO[��7��#~1yl��,U��V��51����ڙuy�癠�d�>�C\�u���'�i�v�xB��.�]�����z��%FO�`h	gn�~���7^�2�d�����k�s�����k�}���>��Քxy��r�0b��l���k%΢�\�M����I��OdaX����X��n^�[�l�Ni?�M��L���*WN�u,��??Qw��[�!͕f����͂��n��m%2�V������V��@��f
�J˫��*�>�xF.	;t
F,޲,JnS�Б�\�#�/�0�!&��Ў��/���8�{�l�>�GT?%���� ��m��    ����pԇ��P����Br� 7��0x��\��&�?�G�yl��DA���932"����7��e�p��v�}z���[��ң��BZ����������a��g��z���D�/+G?fUcv���d{��{^�M,�#�Z~6�����ѧ~� G�@�L7D�mp���(`A�Ig��,b׊�N���H7��_WԮapHR�Gi�2U�'��FnE��{;ȓn���t{x�6h�|�[��Kt����/�s���E�~�F�i��c�� �h*����8�����f�}��᪟�fR$���Rؾ(9���X���R3�����Y��F�+1ð�l_�z^����7q���
�»)��4W��m��!ޣo�����+��މH���-(8v/�:şWU�-�.�'TZ��&�E�{�W��n|T�n?6_z��F��H��
������*$�p��Rv��W/˻e��r��(�f��1r��(9���O·<��߿(�a6"����4��)�	
H��t�te�Ҵ1��H����je���	�l�<)�p^$yn�z2�z��4`�+�r5�/�
D�N8�ZRq�Xӽ�R��4�%��;L��7ěJ{�I�t��\l��2�W;��*,�m9 xT����}�[lJT�3\�Z��nS��w��[|�t9�#���|�*&dʪq�����!���7��*���3�ǘc׶��x��b/�p�Q���
�}<9�9�#W��_q��iv����U0�1�Iy�I�����ɭ�T6r��p�f�JϯXCp�Ы^+ތɐ@i�?@���䇀�<����f����Ӹ��1��8c!�>��lo���,S)��cJl�	��51�X�v�矉b���)(�: cX���ͧ-�)��Ķ�ߡ\cX﹫�v"���G�^���u�^= h�S�z\'P��=M ��J����҉���k-��;`Y�A�3n�2
�v�OP����k	uS+�/�h{�
 ���H�G���.>��	���{K��5���.;�#qX�wn���LRV�� n����<*K��Y��NO"���υL��ܾT7b�zIu����a\�@Q�.�nL�A� �te�A����� RFԤS��oaz�Tv @�c櫟����<�s=�D�i�3�pe,���lԫM�C�o�\*�)M'��n�jWk�aw���X;CZ��p��z�Y��Wy����W;���L�Rv���wN)?<��d�~����z�T��}S�X�j ����W#1�yr�̓�|���ZW�):Ȧ0D�!�[M�z�dfd�D��\a�؇�1=SVp���O�L#���hg�/(�?����Y�X�'�����U}�L;Tb���~��2˫t�Ľ��E�=6����eXz�z>�=�3�1b<��#B�a����QU$���#ܚ���	�;�Zw\�]c谴D�Mi�C�|� L����Au[��e��L~԰�}

�XA�R��cʠ���f���]��'����&n����zJ��vO<
�Í�KK�Z��1G9E�v�cp�}/�|w��ַ�n�Q�ey�M(#�+8ee�m���ׇ�J�b.z?�_�+t�x�]%ڿɛ�B�c�e�FYs��ҡ=���bm�9�N�%�տ���зL���I�ɣ��oW�֌�}忦s�:��v�ZÃ �V�.��sSfDw�ҽ�%�[���5���D�`b�	{Ze�C�PK��b$��2`V{O.Bt�(��5-�򭰻Ƴ���~��N `�T�����]�7��<��N:����"#6�ք_	W�F��U�e�?�E�Z���|j���0 ��������t�㩣�����vVl����0*�Y5�a�[�.�p�3�L���g��S(�މEY3���<ui�x���ڡ݋���N�B�k'AI�
������U�,԰4n�nm ��bR�9:G�Y/�yk��L�t*VB�T[vmF�A���&xH"��d�g����Y�q��;��4Bk�fRY�����|K䐼,��K�GQ�wL�T��uG��JrI��*��3��?�Ҕ��Qx�Ouh0�P�|UE^�ټ�1x��No����j�NY�����?��Gl�u˯/���/�8���5�n���U>!��K��'qw�Ѿ���OZ�f���r��5!|��BVn٥~Ӕ���CdwT��e�l ��^���r�@��m��x�`���*��3�9�gM���X*$��rs�����ӌ�(�M�/w.Y�xM���I����|9u��2@b����_s�d�p�m�[��É��,��BL��Kذ��2�O�6Q%M�@� ��t��/��J�I�ltV���c�5�vlB2Yy���y^�����P���D�GeZ�rʵ��-��������f�ٝ�O����B�M�M�q^wL-�A8�|�&ȑ5cg�8�\h�<�g�b\�v7��|�����S��LW�t`�9Zkө�g��ү�����|?L-��8���v�	�����W/Ah�Ө�C=5�����*�- 
*�)�L8!�j	�(ej�&��Z��>ħ^hHs�cwn������}�%ﹾ��2��ѷW�f�V��^sh����_]�l��L�G�w�M���/��2�=x�*�!�O:�o��Y�-]<���I=��aIRRQV��df��B�6�R�THo䗝�X�Y���ƛO#:��F���,Y����>��+����������Σc�q�ö�R��7/;ǺX�^�|?�z��b���Cm ~P� �L�:]��}�X]���}VaW��\&�G�3��tEO�~��_aT�K������*}7�Z��+�<���pFƷ�n<{����o�����c�J�
oH��_�Z.���8�8��L�����^YP���f6�P���d=���<,������N��H�!���["��q�Ч_u�h�I+5�^�k�&�����w�!Y�����@�Itu�;w�4���L�̳�B��?E)V>�V��8�r��<��T uJY����ciT��j��:��fV�z��<NE�n��)�K֍������xj"/�L�8i��mv� D�i��ОZE�X�A+�@�/K_��J�KK��׹����'�����Y�G�h���nzȤ���DC��1��B��LPE�q��a���d1���o�]ڕp��K��H��Q�v���Q�qZ��|�q3n"�P/�*a+�o0�e7?���/4��ڝ����(��@�`|��Ur����jrYG��3JS%!-�H��Wd)D�bܯ}�EӠO�A�OH��^�i�§ߧ� l�1z֏�=E���"k�oqV�rF�p�����䬎,�s����W�ʲ�)p�<-��:V�[Ӈ �/CP��6���`Q�o*��,�\g��;hB����1�BՆN4�)<�ZGN�y ��mǈ$���ם�~чP�� ��u|z�������
���e���@Ǆ�wc,#�@�FQЧ�Si�� �'�ke��5���Ѣg��!������1k�K�uS����ibê�g�������Ŕ����x���όQ���(��"vp��X7ĀvXp�F�v��8�&]G�h����Jf�\�� [3�*2*�����(���p�(�.�� ��lٿ���-�@Yqb5*n�ؓ�>��գ�س�P���/��d[O8k2c6��!��9����`)$5@��σ�o���|�=�T������úxt��J5T�n.灧zc*TZR7�g��{3 ��cCx#[㖭_P�a.g;�|���g�f�N����N��_r�;�EUPO�|l�p%ޙ�=�Vw Ǝ9mv��^ص�<�k�X7�Ҍ&BQ����n�^���9�i:�8�z�}����d�T����îp���#P?!8TElW�S�8���$*fn��I���a�D�6�p�|_�������*���M��t�~���F��0.��)��Iď6��#X{YH�M��0�S:Uq�Z3tX���Uw�h[d��y=    �'䦳sF�L}�@j�.�;ht��T"Ed�"���eT
5��5as́��h��<�#�z�RE�wn�������,�|Y2�/����c+��DT-|m5�Z�P#+a]4L%���ry�|i�s�<0UA��|ʍ��� {T��}G���Kۼ������|�b���G|z;���#�u��@�ߢX�ݝ�wh���?_�Ce;��$/�t�U�����z1K���7bL7�࣍~���Veq
���_� �6)y+�����;�'����ّ*|ȝ'g1��:RZ��|��g鰭<��S:v<b<�8L� ��(�r-��59��vu���;Z�(��C�����-s�������<��A\i�0���WF��&I�IE�3aA8��!��ԝ�u�uE�{��=�Oȶ�n8����q$ �6�)�P�F��tĪR��ڱݥ��ɷ��S�3��<?�Ze���Wr�u7ػ(�E����a�$�Go����V�y��Pc������D��N��k=9,Wj�~�=�Knwn��T���a5��ُ	?���7ńEǿHM��K�O�8
��:�G�O�q2Գ[���F�l"h���x����5�@�'@^2�m�ThD4����Шo��,��:�xMy)�+�U~��eR}�4�e���z��IHM������a�L*f}|�9�*q�����?�)ڗ�?�w��~�3�5�N��:��n/�ը�V#�-C�!w��{��{~Ӝz��SV<�%�Ag��ܽ`*��C4���F3��I�%�J�,�[�c��zUۺH �_�������/�R��)>e���P��W�nB6�b@�Y䮂��efi�D\���9��-@���5ʘ� 9nE��;�]f~��_�b.���p�-��K�%_�[5D&�0��b�薈�6���-.�����&uB��K�+�ۉi&Xۗ�S�'9�/���[:��0]����j�E�!����^���񾕭���T�jA�I�L% IDQYNB,Swg�&l�z��Y03@������8���̰��M�\v��b<�5�W���׮{����tm�|د��zeP	��G�)�v���1�C1���3��IC~�Lʠ7l͌��8��P{#��Rv��|�0��ne2�}58˥�K�Ns(�Zv畿��T�ѱ��V����sM����Y�[k��+8��	���4x��R�kC�B��}�j�I����>�Jy� �K7�|eh����l~2�� �g>���К3�H-K�Їz���] �S�3���ǎ��QD�fc�ge��[�c�v��	{*��B�9蕇գm\�`�r0
w@�̰�,K�|���x�! ��O񙎬t0�Y��i*{���?�ɤ�#j��I�Ge��I�3�N�j)����\����z�����%�<�GX�;�v�Pg��>#A9|��?V���3��A����:%S�`;�VN�Fp��y�f<�W85�2� 2����� L��j譴%"���:h@<f�P����}�qA#��'��,E9�z�Z�hsׅ���t�V�`����6oN,Cr�y桋^�r�9iߦr�{�o�v(���UO�VUp���O̴��ͫ�=J/�!b�ۑ����8�G���K���|� 
8���E�P̔�q��B�2�}�,�I����� B�5�Q��X����a 	�4��%ΐ�I8Ó�^G���0���X<�������;�m��x+�J-$&�P��<27��&�Ȕz���i��ߞ_1U��5r�I�Փ�����NڝY.��r8=O^k�l������F�L"-��s�����.��5�-�Q� ְ�O�&	�_��S s��HF��ʼ�f�R"��=ǳ�2me��^�; =s}�;Mw��/�������=��GU�7%�[����E��%&�|�ח��ʵz;k�F�*���a/���Sr5�8����{�(�ʋ�W$�@�HR^*����đ@)��}�w�$���U"�;3�z`���*��gN�T���O�*�*�
���y%�~L�����_��44��+t6�����Tz��糬�Cv�wB��6Oe�5~8Ot8��a�Ʊw0�����7����"��Y�b>y�������(=X���$�s�	������l��Y���j�xy�lE7�ĥ�f]�f�䢭�Y���(���]��Q���������~#�)[�^��OO=9��-�:�}�R������>�p!�5y�:L����8y0��PY*��;��gB�[�8�'/��%����"t��"="���w�,D�!zC�\�!ȅ�����lㅦk.}����R�s4����j�__S}ŷ�M����J���%�	d�#�3!w1���qho�mN��t��xQZ����`T}��=��`i{��WK��\!B���;!���D�Ơ~���8J��fl?����P���V)�S��3�P�0�"������11j�pR�
�b���i7�:�-r/��	�-��=nzY�uo`g<`�C����(j�G�iOyh���S�?��S����e�M��-�p��|���a$N�ɞ�l)�����>�OL�H�mE1�C���s��G���>o�폜��B�~N�_��o�~~��\ "1 h����̬�.�"	�ML�ؐ��g|�i��7��ll���X�IݝUl�^Bɏ;�X#*�6;r)b�"xQ��|�@�ᡯ��!�Wo��9~�ӝҵIqS�Ƕ� �ɆT6ZcHwy�������4Nql%P8�^uߨIYABAs|.
�nI�̛&N�_�<�%�^vp��eC:�����P���y1W�,1���}�ۿ��
����"�_��g;��f�L���U�5�m�:!%T�m��Ac�t�@A��V�o�O#-J0�����;�p������+�N�tʨ�Æ�{�4hƜU�3u�w��cEAÐ��w!�(I�[��P~�������##������G��犙���u8�I�a3��Sϋ=�^Ԟ�	y�e��E(�qp�0�U���ߎ�}��*p��0�4ኦ����MP��te�����<3�(�*q�^����{�F�R�p��/��W�3�wn��qPl��*�Z�&�~ �5�
�]
:�J��H͙�yq�q�iZ�Gʱ/"C<���)�v�O��~%��H߾�1�S��%�:��w$��CS���/3�(��iΩכK�4�X��eA\���/��j p��]�M#��=�-���9����q���⠑�%$\vr�(� ���E�!>S�vZ;0(�VI;	�ktג\�W���`ڷir�{�}9�gd���l���0S�f����A��e��AG�M�p�;�Lb� �W�>@�z��G'@hGGU;�=�\��:���	��7��7��kÓ��_Wx���:��i�⟷�~ 9�<`�:%�z��{
��ղ�V�&WgG8�EF}�sj�B�V�+F�t;h�ةf��57�����b�S�'�0;��^�O���㧄����s��<�+�4���I�'��o���n��jL������`l=��\�C��zW��o��n�O��A�)��2���j�k	Jeߋ~g �K* /]�Cs�N`/{˥�-�3���/:�����K��ye����V� �e["�����fR@i:RK�v�Ȼ�w��6��)�弓bl��>oS���61�"��+J$��j�u6��T�#�}�O�4�|��:@h�S(��3���A���_��`U\�y��}��;P��89U���h!=Y���ao8����bs�ǫ/l2M�۫8�v_M@�H��BGM��}�ĳ��R;HK����綖]&���#&,!���]q���?RA-[h)=�X���J�lD��}a�i�@�B�A��tq��R�$<yq�#���[۟�m\|�<��^�ff�BD2�	�>5�3�｛�'�S�]
��pJ�%��~��x75���Z d/��Bk���gX-�ӛ�����+�P��ST\�+52+΢��v�� m��]Slr���o�G�OU�q��U�:t�    �:t���0j N���P�BXaA��s[�,��4���H��?���T�]�����Pr~�� -��@��
���A[��9E���>J,z�s��`_d+lp_Ɂ��Q��ۯ�HPdZ��},鰒��km�%ה��+=Z�p���nN���IeB���Y�Lz��SY<L�hO��6���c�Q��ºF���t/E�q�u�����wT�� �.E� FL�w�gc72A>�3�;|��@yxуdޑ:�������-���!��L�w��֠i�XO_fE�� vq�?��EFE�/����}C�$�� b5/�g�ai�|��|Kur��f���߉[F�(z6c��S�VwIԌlHsf!N����VI�%o��;w��@�I���{��,Q.��y��rj��aIx�RL3�l�Ԣ=�A�߷���Џ�_q9
obY':;�)f&K�
�#�̛Љ���!�7$M���F�u2?`�!��˟�!���@[r�"�b	����A�QM�H.k��,F��^�5fx:ԧ5͡���-���~Z�i�����Z�rf�OҶ5�^A�N�w��ҏwc����qV��ņ���.!�׶O�c��C���wçTWZ�-6�wNI�~Q�e%�����F���?���������?۩�^�ؖX:��/��DcO�x��`��.i4S���>�T��f��NIvoh��o�~��*	o���s)���FW ��+[�p2[n�U���E�&���Py����|��֙�L����w�&h���_/d��x���'���2�g�?��1
��8bi�u'�?O+�ة|�0y�y&~SY��k�GnQ��nn>=��Iϒ�$�����{b��7���&J`d�@5d
��u�@j��!y��,�>��$��;�*�NlT5�w��5F���F�\f��A@o$._VZ<�Q�͏��<��Qթ�G���Y��H�V/=�L?��zU�w�9�]%}&�:+��D�I�o�K7��	�I�0��5�����e�Q'z�lu�D�i�F;�)��������+�B
_��S;H<�q��,�1Xڙ�+������A�(Y8�$���Ҁ�|�؜���(x�-� ���o���R��Z���;0�����9DA7�I������O�5)���:фI7�C�,a��2��Z����Vɬ ��W7���=���c��:���Ï�v�����'���X�<�/��Ue"b�'����g��TZß��TeDX/Z�*��p�22l��4^l+��n�Qh_�����t��Ð ����'�0K	NQ8�����oGP��e�V4'	�ӛt_Ej`,��F��zz�P�$rS������;2Ԅ~���Ҽ{ņ%^���B��E�ڌf���� A�xx�>#�aġ򡣸~���8={�l���r�1.��4}TT��R�>4ΜD0=��e7c�z6;��v�fݳ��v��{�	Z79(��k�?*� ���$��C�s�-2�K�&�gn�Z���_�38��TYu�|ʜ�����}�1����z��I����cf���ba�1�++�4�u֨��<J��A���&A%����Yr>�PC(DSbK�]��u�Rd<���~�t�lkO��>���H?܊49�]_�*{_��9V_�}B���@٤'*X�%�?�5ir~�o�tt�D3��; �m8�kS������+t0w�D&�m�((��\�)qtæ���o	!������k�e�בX�� �70���p�ji�7L��B!�'{а���7,ڛ���0@���5D7j]%w�8�b��ƽ�5�f綂GK��|Eg�-�.�C���]�	m��/�9݊;��k� �ri�Î'7�¬��mU=71 �Tb�̠e�r�ғ�%�S�~+\�H�,E7�s�!Œ�� �����Xy�@L��G������=sBȌ���#���@���v���<�:(b�#투�䋢�6ޘ����$`��\���0 �e��γ.p	+ e�3 ��{&�oX��@[����P���c����qV�������Q���a�u�;	5���6�����5W����{o�B�u���=rg�_S�1��y�$|��k|ܺ�9{���u����C~rß֛U���WK�	�u^��f@-�C��i[t� XN�u�;�ƣ��k��&z�A�Y*��X$tȌI!m�%��-X\.�p6�(�<ZR�x�EM�r	��!e���	�7)3c���l�c��h��}��+�s'c��1F?@'�g2\�&��"}H~:\�v�NH�ğ�����d�!ո�,��<R˂}��o�2�O2��
����Os?�p�8��]d٤��Yj`9
�W�H'{�W��F��.�!}s�fvY�M;��SRU�`��Vk���$��ab&�\b0�Dx��EQ@���d��m �iڃv~�*�s������ŽT�TG��6��+C�?���`� �K`~�,�G�5|	z
0Qɯ�}L:�T5P)ȥ�5���&��N��h�B����&B����R���7���6���e���>���z*�7w޾ˡ(Tl�DP�t��0�O��d��om�eP1�[fy�����%�};�E�@�.��#E)����}�&��F
�2����k
��Z��ߤ���z/���Ȍ�#?���`V7BH4�m0e��Nj�����R�#D�7x��`R%�O��gXp9��)�Ⓡ�۱Q:?��!����d�ޗf�mvu���2R�d�
�����R��W���콯c���	W�׾���N���8��$��e~7@�}���Ip�������"���V������K㤋��l�8H���`��#�A���� u��![��\�X�/Mz�2��8l;�}��^hE�f[�i��f�69��;{ћ��	�{鼨Y�k�p��.��E���r2�y1���#4��������8��qďf�x��Mx�	��;f���83%�I0�,L���+�{��/	�����V��d�i#;�^�Ag(�s����*�~oB%����K(�x��JT{o�2U`����%�,=�w�uT�ׁ,T/�-����}i'e7���j����J��f�q �Ө"�1��k:v��<Oƥm��h)�kP��oМ�=;"<M�'�'�|ٴV�jP�1�_`oFb�b���B 0�m/��;�F�F����.��h*9��#BN�0N��y.�v����l�R?�$	��=�]��D��h�\
��O�&��xxl��>fA�S%{�� �_+��W�,���PI�6� `0�
���B����}t�;G3\��!�����|^��L�7Yt�E�l"�c(�v�:+W������Wvt	��C��i�Zs߬�l��qh���C^�+~t�Z������P{�%�V-�<��;�ԗv�����E�1b�S�o~�]�M8Ɛ�,���E�%����g���ү�>b�,3����eivp�~Hھ��߮{��T�W��Z�󎅜�^��a��8]�ۻ���h縅+Z��E�>\'_�۠���ǵ�V�H��T7�;�[Y��(M���d�/O�����2��=v�͙��N�p�m�u+���Nk��c6w�<:�;h5i�����"�p�v_T7a���[�%�_h���QĔ1���;x�9�=�����Z[��2�0I�VK-Eur�l�u��{�J����G��]_�	V�礵OkI$s�V{�bx����׾����%'8)��w���2��0���,�ñA�Ǵ[D���x�_�_��*�ͨ@ĠR����:�Pj�Ft�X`$_��8W�9��~X�􎚅�XAB��K�Y`���7�	�-w�H��p��p�X�G�d��9Kv �ܝ�e�&6{
��^9۾��ͬ�
SgH�T���O�sKs4�����F`�k5��ࢹx7���[>*'9f�Հ?N�w`,����#�&�p���B�F4��:[���N���o�,n�h�-7�e�H=D�A*��"d���0��4�`\N �V��M��o���[_�L�\��c���{�~���j�:�<�w���<� �	  ���vHk�M�9�S1�����I��v�2ǟj2��F�sH��n�_�Bj�t�缕2��}�u�=!Z��#!fJ�� &��rF�x��˶��.��%�����~��u�?_"cV��,4�>7����˦D��b
n�͑^�_�B��^/�_��i��N�k��T8(��;e�DD�q�_�*p��h�@��Z|\�ϟ!l�"���A�]��P�w���c魴�;����T�4�l�F@z��L��{�S���o�$vӤ ����r��Ts�r��O�<Œ�Is�_�{���%B8Mp5%[���X�/��~u���*=^�ژd��sᾬn��{nP��%h�;2(�3B��G�i���	+��/ѽ��}L߉��u�e�-}���&`�C�^��[p�ٛF�� ܄B���^M�DUf
�����:ŏ�/ň�M
uė H���^q ^U ���"��"�$5{��k�h�\�E짋�4�UZ�^�w&��u�
N����TBdV�f��m64����4GB	��>�U���<[sbj�q/�*Qs�q���]	��)����y:5EAע���)�ʎ\na�Wc@��)�dʝ^�x�˹��[����VOE�<��0���ha%�
���c�~b�G��/4���ڟ~ά��$�$Kv�r�$9k�;Ϳ�6z���ͦo��]��0��/a~2�}ÐlA�$�rQ�bk"|Uv=r���ͤA)F��M��]<��6 a���~r��}���Ҝ�s�u��ds�Mc5�t8���zI��v&I�*G���N���y}#D�)<A� @��my	ޘ�.�C�,Pd��NT��{ ����m� ���j,J6}�R��� 
��*���?��#(����m�;���!��� 6�Q-m�2�>s�k�g�ϔ�P��(P_hΘwU�*��[vz9�g_�8!�h�tp��qI!�x�6������^atTB���n�r���.�s'[��/�)b���l�_���3� xޟpc��UQ�F0Ws幩w[�[+��M�
Ŋ8��(���l�أp?0�t� ��9��~���(8�g�J*YC��~	�m���T��Cq�{P�<e4�$)u¨�:�	ƅ,=/�q������ѷǃ1�@���wo\v��^,�V��H�������`;��}��9�ݛ�.�uh��1j�r��5��ʊ��P�?���#�|:0����w�l.�T�iJ���D�/C+0��ɣy��Շ�c����maT���ɾ�����|��Ñ��﬙�'&���8�c��k'����b�̛�����K"䀓l�Sll�T�����֮�pSyIo����*mV;'
���`RuQ+�}ڌ�L��j�,G�Jk��sSa]g�C���RMn�L<��{wH#�L��o�H�i�.*��X	��D��B��9����W�E	V�?h3,�heF��������*�Sh�y�Bk��i(�3��驑����./�WK�7��B|3m�U��+Q�e�D�@,k^���X^iQ���&��r�*�#�佘t[@�%���dwm��Q�)[�ɒ�G!sj�t���/���A�&��b�$:g�'�/;%ݡ���P��R���iq�~_������q�T!eN�eD����P*Vc��h1�~%���H�0)l�X�"��a�,y}���h��#)�K5���,l(y��V9Z���=iX_4�R	EI���\�I��|!�ڮ�i��G{E>�p���S��t
��S���W鼕w�RL+�ё^A/)b>�7Y�H��r˦�'UL��G�yO���������Q�1ڟ�sS��B�!1I$�7;G__�����}`L�e�9� )�l��ڞHƩ�a|���I3��J=',��B�Z2#��E��`^ٍ�~���W,�N��(�'�B�Lɾ�כd��Fk�A��2\���t&��� ����H��<t;1r�M����o�����*xT��5���S�N��%53>ygI�tJ�y/->m����Kp��G�s��Nv�n�����/��x8sci'�D�*y'�X̊���yў`@��P�M{<~]��^S`�H~�3�Sa#(X�(Ϣ��@>��7����H@��ʷ�,\,��Q�hu������v7T��o8�Edeg���A���g��f���ͩ���n��4��"/�U�ֲ	m��:v�'׹�s{�E9҉�Ҵb��*�n[�O��M޲� ;�e�i��F��[�K���P��!ŝ����L�� =:I1[���F�U�>HR�(�I/�ŗb/��/���4Rl���4׋_���:���j�Y�-j�3�؇�Ƙ"  �0�������%�B!�L�SD�C�P���UU���p'�q���F�`���7N�&H��=��L�&���y�fL�/;��H����~�����>�[Ɵ{:��2���ǯ�����u֕�      �      x������ � �     