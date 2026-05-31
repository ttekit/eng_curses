--
-- PostgreSQL database dump
--

\restrict FywHYvCOWDXxEq6L51bM49WsNgdKeYLkVtYEs9fqPG9Q4bxuDYaF08ihxpVv7T9

-- Dumped from database version 16.13
-- Dumped by pg_dump version 16.13

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

ALTER TABLE IF EXISTS ONLY public.watch_sessions DROP CONSTRAINT IF EXISTS watch_sessions_user_id_fkey;
ALTER TABLE IF EXISTS ONLY public.watch_sessions DROP CONSTRAINT IF EXISTS watch_sessions_content_video_id_fkey;
ALTER TABLE IF EXISTS ONLY public.video_captions DROP CONSTRAINT IF EXISTS video_captions_content_video_id_fkey;
ALTER TABLE IF EXISTS ONLY public.users DROP CONSTRAINT IF EXISTS users_teacher_id_fkey;
ALTER TABLE IF EXISTS ONLY public.user_vocabulary DROP CONSTRAINT IF EXISTS user_vocabulary_user_id_fkey;
ALTER TABLE IF EXISTS ONLY public.user_vocabulary DROP CONSTRAINT IF EXISTS user_vocabulary_topic_id_fkey;
ALTER TABLE IF EXISTS ONLY public.user_language_data DROP CONSTRAINT IF EXISTS "user_language_data_userId_fkey";
ALTER TABLE IF EXISTS ONLY public.user_language_data DROP CONSTRAINT IF EXISTS "user_language_data_topicId_fkey";
ALTER TABLE IF EXISTS ONLY public.user_friends DROP CONSTRAINT IF EXISTS "user_friends_userId_fkey";
ALTER TABLE IF EXISTS ONLY public.user_friends DROP CONSTRAINT IF EXISTS "user_friends_friendId_fkey";
ALTER TABLE IF EXISTS ONLY public.user_comprehension_weak_spots DROP CONSTRAINT IF EXISTS user_comprehension_weak_spots_user_id_fkey;
ALTER TABLE IF EXISTS ONLY public.user_comprehension_weak_spots DROP CONSTRAINT IF EXISTS user_comprehension_weak_spots_content_video_id_fkey;
ALTER TABLE IF EXISTS ONLY public.topics DROP CONSTRAINT IF EXISTS "topics_categoryId_fkey";
ALTER TABLE IF EXISTS ONLY public.statistics DROP CONSTRAINT IF EXISTS "statistics_userId_fkey";
ALTER TABLE IF EXISTS ONLY public.settings DROP CONSTRAINT IF EXISTS "settings_userId_fkey";
ALTER TABLE IF EXISTS ONLY public.post_watch_surveys DROP CONSTRAINT IF EXISTS post_watch_surveys_user_id_fkey;
ALTER TABLE IF EXISTS ONLY public.post_watch_surveys DROP CONSTRAINT IF EXISTS post_watch_surveys_content_video_id_fkey;
ALTER TABLE IF EXISTS ONLY public.placement_attempts DROP CONSTRAINT IF EXISTS placement_attempts_user_id_fkey;
ALTER TABLE IF EXISTS ONLY public.contents DROP CONSTRAINT IF EXISTS contents_owner_user_id_fkey;
ALTER TABLE IF EXISTS ONLY public.content_videos DROP CONSTRAINT IF EXISTS content_videos_content_id_fkey;
ALTER TABLE IF EXISTS ONLY public.content_stats DROP CONSTRAINT IF EXISTS content_stats_content_media_id_fkey;
ALTER TABLE IF EXISTS ONLY public.content_medias DROP CONSTRAINT IF EXISTS content_medias_category_id_fkey;
ALTER TABLE IF EXISTS ONLY public.comprehension_test_attempts DROP CONSTRAINT IF EXISTS comprehension_test_attempts_user_id_fkey;
ALTER TABLE IF EXISTS ONLY public.comprehension_test_attempts DROP CONSTRAINT IF EXISTS comprehension_test_attempts_content_video_id_fkey;
ALTER TABLE IF EXISTS ONLY public.additional_user_data DROP CONSTRAINT IF EXISTS "additional_user_data_userId_fkey";
ALTER TABLE IF EXISTS ONLY public."_TagToTopic" DROP CONSTRAINT IF EXISTS "_TagToTopic_B_fkey";
ALTER TABLE IF EXISTS ONLY public."_TagToTopic" DROP CONSTRAINT IF EXISTS "_TagToTopic_A_fkey";
ALTER TABLE IF EXISTS ONLY public."_SelectedTopics" DROP CONSTRAINT IF EXISTS "_SelectedTopics_B_fkey";
ALTER TABLE IF EXISTS ONLY public."_SelectedTopics" DROP CONSTRAINT IF EXISTS "_SelectedTopics_A_fkey";
ALTER TABLE IF EXISTS ONLY public."_HatedGenres" DROP CONSTRAINT IF EXISTS "_HatedGenres_B_fkey";
ALTER TABLE IF EXISTS ONLY public."_HatedGenres" DROP CONSTRAINT IF EXISTS "_HatedGenres_A_fkey";
ALTER TABLE IF EXISTS ONLY public."_FavoriteGenres" DROP CONSTRAINT IF EXISTS "_FavoriteGenres_B_fkey";
ALTER TABLE IF EXISTS ONLY public."_FavoriteGenres" DROP CONSTRAINT IF EXISTS "_FavoriteGenres_A_fkey";
ALTER TABLE IF EXISTS ONLY public."_ContentStatsToTopic" DROP CONSTRAINT IF EXISTS "_ContentStatsToTopic_B_fkey";
ALTER TABLE IF EXISTS ONLY public."_ContentStatsToTopic" DROP CONSTRAINT IF EXISTS "_ContentStatsToTopic_A_fkey";
ALTER TABLE IF EXISTS ONLY public."UserAchievement" DROP CONSTRAINT IF EXISTS "UserAchievement_userId_fkey";
ALTER TABLE IF EXISTS ONLY public."Account" DROP CONSTRAINT IF EXISTS "Account_user_id_fkey";
DROP INDEX IF EXISTS public.watch_sessions_user_id_content_video_id_ended_at_idx;
DROP INDEX IF EXISTS public.watch_sessions_user_id_content_video_id_completion_date_key;
DROP INDEX IF EXISTS public.watch_sessions_ended_at_idx;
DROP INDEX IF EXISTS public.video_captions_content_video_id_key;
DROP INDEX IF EXISTS public.users_teacher_id_idx;
DROP INDEX IF EXISTS public.users_email_key;
DROP INDEX IF EXISTS public.user_vocabulary_user_id_language_code_term_key;
DROP INDEX IF EXISTS public.user_vocabulary_user_id_language_code_idx;
DROP INDEX IF EXISTS public."user_language_data_userId_topicId_key";
DROP INDEX IF EXISTS public.user_comprehension_weak_spots_user_id_content_video_id_stem_key;
DROP INDEX IF EXISTS public.user_comprehension_weak_spots_user_id_content_video_id_last_idx;
DROP INDEX IF EXISTS public.tokens_token_key;
DROP INDEX IF EXISTS public.tokens_email_key;
DROP INDEX IF EXISTS public.tags_name_key;
DROP INDEX IF EXISTS public."statistics_userId_key";
DROP INDEX IF EXISTS public."settings_userId_key";
DROP INDEX IF EXISTS public.post_watch_surveys_content_video_id_user_id_idx;
DROP INDEX IF EXISTS public.placement_attempts_user_id_created_at_idx;
DROP INDEX IF EXISTS public.placement_attempts_created_at_idx;
DROP INDEX IF EXISTS public.genres_name_key;
DROP INDEX IF EXISTS public.contents_owner_user_id_idx;
DROP INDEX IF EXISTS public.contents_friendly_link_key;
DROP INDEX IF EXISTS public.content_videos_content_id_playlist_position_key;
DROP INDEX IF EXISTS public.content_stats_content_media_id_key;
DROP INDEX IF EXISTS public.content_medias_category_id_playlist_position_key;
DROP INDEX IF EXISTS public.comprehension_test_attempts_user_id_content_video_id_create_idx;
DROP INDEX IF EXISTS public.comprehension_test_attempts_created_at_idx;
DROP INDEX IF EXISTS public.categories_name_key;
DROP INDEX IF EXISTS public."additional_user_data_userId_key";
DROP INDEX IF EXISTS public."_TagToTopic_B_index";
DROP INDEX IF EXISTS public."_SelectedTopics_B_index";
DROP INDEX IF EXISTS public."_HatedGenres_B_index";
DROP INDEX IF EXISTS public."_FavoriteGenres_B_index";
DROP INDEX IF EXISTS public."_ContentStatsToTopic_B_index";
DROP INDEX IF EXISTS public."UserAchievement_userId_achievementId_key";
ALTER TABLE IF EXISTS ONLY public.watch_sessions DROP CONSTRAINT IF EXISTS watch_sessions_pkey;
ALTER TABLE IF EXISTS ONLY public.video_captions DROP CONSTRAINT IF EXISTS video_captions_pkey;
ALTER TABLE IF EXISTS ONLY public.users DROP CONSTRAINT IF EXISTS users_pkey;
ALTER TABLE IF EXISTS ONLY public.user_vocabulary DROP CONSTRAINT IF EXISTS user_vocabulary_pkey;
ALTER TABLE IF EXISTS ONLY public.user_language_data DROP CONSTRAINT IF EXISTS user_language_data_pkey;
ALTER TABLE IF EXISTS ONLY public.user_friends DROP CONSTRAINT IF EXISTS user_friends_pkey;
ALTER TABLE IF EXISTS ONLY public.user_comprehension_weak_spots DROP CONSTRAINT IF EXISTS user_comprehension_weak_spots_pkey;
ALTER TABLE IF EXISTS ONLY public.topics DROP CONSTRAINT IF EXISTS topics_pkey;
ALTER TABLE IF EXISTS ONLY public.tokens DROP CONSTRAINT IF EXISTS tokens_pkey;
ALTER TABLE IF EXISTS ONLY public.tags DROP CONSTRAINT IF EXISTS tags_pkey;
ALTER TABLE IF EXISTS ONLY public.statistics DROP CONSTRAINT IF EXISTS statistics_pkey;
ALTER TABLE IF EXISTS ONLY public.settings DROP CONSTRAINT IF EXISTS settings_pkey;
ALTER TABLE IF EXISTS ONLY public.post_watch_surveys DROP CONSTRAINT IF EXISTS post_watch_surveys_pkey;
ALTER TABLE IF EXISTS ONLY public.placement_attempts DROP CONSTRAINT IF EXISTS placement_attempts_pkey;
ALTER TABLE IF EXISTS ONLY public.genres DROP CONSTRAINT IF EXISTS genres_pkey;
ALTER TABLE IF EXISTS ONLY public.contents DROP CONSTRAINT IF EXISTS contents_pkey;
ALTER TABLE IF EXISTS ONLY public.content_videos DROP CONSTRAINT IF EXISTS content_videos_pkey;
ALTER TABLE IF EXISTS ONLY public.content_stats DROP CONSTRAINT IF EXISTS content_stats_pkey;
ALTER TABLE IF EXISTS ONLY public.content_medias DROP CONSTRAINT IF EXISTS content_medias_pkey;
ALTER TABLE IF EXISTS ONLY public.comprehension_test_attempts DROP CONSTRAINT IF EXISTS comprehension_test_attempts_pkey;
ALTER TABLE IF EXISTS ONLY public.categories DROP CONSTRAINT IF EXISTS categories_pkey;
ALTER TABLE IF EXISTS ONLY public.additional_user_data DROP CONSTRAINT IF EXISTS additional_user_data_pkey;
ALTER TABLE IF EXISTS ONLY public."_TagToTopic" DROP CONSTRAINT IF EXISTS "_TagToTopic_AB_pkey";
ALTER TABLE IF EXISTS ONLY public."_SelectedTopics" DROP CONSTRAINT IF EXISTS "_SelectedTopics_AB_pkey";
ALTER TABLE IF EXISTS ONLY public."_HatedGenres" DROP CONSTRAINT IF EXISTS "_HatedGenres_AB_pkey";
ALTER TABLE IF EXISTS ONLY public."_FavoriteGenres" DROP CONSTRAINT IF EXISTS "_FavoriteGenres_AB_pkey";
ALTER TABLE IF EXISTS ONLY public."_ContentStatsToTopic" DROP CONSTRAINT IF EXISTS "_ContentStatsToTopic_AB_pkey";
ALTER TABLE IF EXISTS ONLY public."UserAchievement" DROP CONSTRAINT IF EXISTS "UserAchievement_pkey";
ALTER TABLE IF EXISTS ONLY public."Account" DROP CONSTRAINT IF EXISTS "Account_pkey";
ALTER TABLE IF EXISTS public.watch_sessions ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.video_captions ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.users ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.user_vocabulary ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.user_language_data ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.user_friends ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.user_comprehension_weak_spots ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.topics ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.tokens ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.tags ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.statistics ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.settings ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.post_watch_surveys ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.placement_attempts ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.genres ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.contents ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.content_videos ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.content_stats ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.content_medias ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.comprehension_test_attempts ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.categories ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.additional_user_data ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public."UserAchievement" ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public."Account" ALTER COLUMN id DROP DEFAULT;
DROP SEQUENCE IF EXISTS public.watch_sessions_id_seq;
DROP TABLE IF EXISTS public.watch_sessions;
DROP SEQUENCE IF EXISTS public.video_captions_id_seq;
DROP TABLE IF EXISTS public.video_captions;
DROP SEQUENCE IF EXISTS public.users_id_seq;
DROP TABLE IF EXISTS public.users;
DROP SEQUENCE IF EXISTS public.user_vocabulary_id_seq;
DROP TABLE IF EXISTS public.user_vocabulary;
DROP SEQUENCE IF EXISTS public.user_language_data_id_seq;
DROP TABLE IF EXISTS public.user_language_data;
DROP SEQUENCE IF EXISTS public.user_friends_id_seq;
DROP TABLE IF EXISTS public.user_friends;
DROP SEQUENCE IF EXISTS public.user_comprehension_weak_spots_id_seq;
DROP TABLE IF EXISTS public.user_comprehension_weak_spots;
DROP SEQUENCE IF EXISTS public.topics_id_seq;
DROP TABLE IF EXISTS public.topics;
DROP SEQUENCE IF EXISTS public.tokens_id_seq;
DROP TABLE IF EXISTS public.tokens;
DROP SEQUENCE IF EXISTS public.tags_id_seq;
DROP TABLE IF EXISTS public.tags;
DROP SEQUENCE IF EXISTS public.statistics_id_seq;
DROP TABLE IF EXISTS public.statistics;
DROP SEQUENCE IF EXISTS public.settings_id_seq;
DROP TABLE IF EXISTS public.settings;
DROP SEQUENCE IF EXISTS public.post_watch_surveys_id_seq;
DROP TABLE IF EXISTS public.post_watch_surveys;
DROP SEQUENCE IF EXISTS public.placement_attempts_id_seq;
DROP TABLE IF EXISTS public.placement_attempts;
DROP SEQUENCE IF EXISTS public.genres_id_seq;
DROP TABLE IF EXISTS public.genres;
DROP SEQUENCE IF EXISTS public.contents_id_seq;
DROP TABLE IF EXISTS public.contents;
DROP SEQUENCE IF EXISTS public.content_videos_id_seq;
DROP TABLE IF EXISTS public.content_videos;
DROP SEQUENCE IF EXISTS public.content_stats_id_seq;
DROP TABLE IF EXISTS public.content_stats;
DROP SEQUENCE IF EXISTS public.content_medias_id_seq;
DROP TABLE IF EXISTS public.content_medias;
DROP SEQUENCE IF EXISTS public.comprehension_test_attempts_id_seq;
DROP TABLE IF EXISTS public.comprehension_test_attempts;
DROP SEQUENCE IF EXISTS public.categories_id_seq;
DROP TABLE IF EXISTS public.categories;
DROP SEQUENCE IF EXISTS public.additional_user_data_id_seq;
DROP TABLE IF EXISTS public.additional_user_data;
DROP TABLE IF EXISTS public."_TagToTopic";
DROP TABLE IF EXISTS public."_SelectedTopics";
DROP TABLE IF EXISTS public."_HatedGenres";
DROP TABLE IF EXISTS public."_FavoriteGenres";
DROP TABLE IF EXISTS public."_ContentStatsToTopic";
DROP SEQUENCE IF EXISTS public."UserAchievement_id_seq";
DROP TABLE IF EXISTS public."UserAchievement";
DROP SEQUENCE IF EXISTS public."Account_id_seq";
DROP TABLE IF EXISTS public."Account";
DROP TYPE IF EXISTS public."UserRole";
DROP TYPE IF EXISTS public."TokenType";
DROP TYPE IF EXISTS public."AuthMethod";
-- *not* dropping schema, since initdb creates it
--
-- Name: public; Type: SCHEMA; Schema: -; Owner: -
--

-- *not* creating schema, since initdb creates it


--
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON SCHEMA public IS '';


--
-- Name: AuthMethod; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."AuthMethod" AS ENUM (
    'CREDENTIALS',
    'GOOGLE'
);


--
-- Name: TokenType; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."TokenType" AS ENUM (
    'VERIFICATION',
    'TWO_FACTOR',
    'PASSWORD_RESET',
    'ACCOUNT_RESTORE'
);


--
-- Name: UserRole; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."UserRole" AS ENUM (
    'REGULAR',
    'STUDENT',
    'TEACHER',
    'ADULT',
    'ADMIN'
);


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: Account; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Account" (
    id integer NOT NULL,
    type text NOT NULL,
    provider text NOT NULL,
    refresh_token text,
    access_token text,
    expires_at integer NOT NULL,
    user_id integer NOT NULL
);


--
-- Name: Account_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public."Account_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: Account_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public."Account_id_seq" OWNED BY public."Account".id;


--
-- Name: UserAchievement; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."UserAchievement" (
    id integer NOT NULL,
    "userId" integer NOT NULL,
    "achievementId" text NOT NULL,
    "unlockedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: UserAchievement_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public."UserAchievement_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: UserAchievement_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public."UserAchievement_id_seq" OWNED BY public."UserAchievement".id;


--
-- Name: _ContentStatsToTopic; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."_ContentStatsToTopic" (
    "A" integer NOT NULL,
    "B" integer NOT NULL
);


--
-- Name: _FavoriteGenres; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."_FavoriteGenres" (
    "A" integer NOT NULL,
    "B" integer NOT NULL
);


--
-- Name: _HatedGenres; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."_HatedGenres" (
    "A" integer NOT NULL,
    "B" integer NOT NULL
);


--
-- Name: _SelectedTopics; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."_SelectedTopics" (
    "A" integer NOT NULL,
    "B" integer NOT NULL
);


--
-- Name: _TagToTopic; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."_TagToTopic" (
    "A" integer NOT NULL,
    "B" integer NOT NULL
);


--
-- Name: additional_user_data; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.additional_user_data (
    id integer NOT NULL,
    "userId" integer NOT NULL,
    "nativeLanguage" text,
    "knownLanguages" text[],
    "knownLanguageLevels" jsonb,
    job text,
    education text,
    "englishLevel" text,
    "workField" text,
    hobbies text[],
    interests text[],
    learning_goal text,
    time_to_achieve text,
    studying_plan_phases jsonb,
    active_studying_phase_index integer DEFAULT 0 NOT NULL,
    active_phase_entered_at timestamp(3) without time zone,
    "teacherGrades" text,
    "teacherTopics" text[],
    "studentNames" jsonb,
    "studentGrade" text,
    "studentProblemTopics" text[]
);


--
-- Name: additional_user_data_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.additional_user_data_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: additional_user_data_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.additional_user_data_id_seq OWNED BY public.additional_user_data.id;


--
-- Name: categories; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.categories (
    id integer NOT NULL,
    name text NOT NULL
);


--
-- Name: categories_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.categories_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: categories_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.categories_id_seq OWNED BY public.categories.id;


--
-- Name: comprehension_test_attempts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.comprehension_test_attempts (
    id integer NOT NULL,
    user_id integer NOT NULL,
    content_video_id integer NOT NULL,
    correct integer NOT NULL,
    total integer NOT NULL,
    score_pct double precision NOT NULL,
    passed boolean NOT NULL,
    details jsonb,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: comprehension_test_attempts_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.comprehension_test_attempts_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: comprehension_test_attempts_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.comprehension_test_attempts_id_seq OWNED BY public.comprehension_test_attempts.id;


--
-- Name: content_medias; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.content_medias (
    id integer NOT NULL,
    category_id integer NOT NULL,
    playlist_position integer DEFAULT 0 NOT NULL,
    create_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    update_at timestamp(3) without time zone NOT NULL
);


--
-- Name: content_medias_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.content_medias_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: content_medias_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.content_medias_id_seq OWNED BY public.content_medias.id;


--
-- Name: content_stats; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.content_stats (
    id integer NOT NULL,
    content_media_id integer NOT NULL,
    users_watched integer DEFAULT 0 NOT NULL,
    rating double precision DEFAULT 0 NOT NULL,
    system_tags text[] DEFAULT ARRAY[]::text[],
    user_tags text[] DEFAULT ARRAY[]::text[],
    processing_complexity integer
);


--
-- Name: content_stats_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.content_stats_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: content_stats_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.content_stats_id_seq OWNED BY public.content_stats.id;


--
-- Name: content_videos; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.content_videos (
    id integer NOT NULL,
    content_id integer NOT NULL,
    playlist_position integer DEFAULT 0 NOT NULL,
    video_link text NOT NULL,
    video_name text NOT NULL,
    video_description text,
    "thumbnailUrl" text
);


--
-- Name: content_videos_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.content_videos_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: content_videos_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.content_videos_id_seq OWNED BY public.content_videos.id;


--
-- Name: contents; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.contents (
    id integer NOT NULL,
    friendly_link text NOT NULL,
    name text NOT NULL,
    description text NOT NULL,
    owner_user_id integer,
    visibility text DEFAULT 'public'::text NOT NULL,
    create_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    update_at timestamp(3) without time zone NOT NULL
);


--
-- Name: contents_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.contents_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: contents_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.contents_id_seq OWNED BY public.contents.id;


--
-- Name: genres; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.genres (
    id integer NOT NULL,
    name text NOT NULL
);


--
-- Name: genres_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.genres_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: genres_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.genres_id_seq OWNED BY public.genres.id;


--
-- Name: placement_attempts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.placement_attempts (
    id integer NOT NULL,
    user_id integer NOT NULL,
    score_correct integer NOT NULL,
    score_total integer NOT NULL,
    score_pct double precision NOT NULL,
    english_level text NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: placement_attempts_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.placement_attempts_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: placement_attempts_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.placement_attempts_id_seq OWNED BY public.placement_attempts.id;


--
-- Name: post_watch_surveys; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.post_watch_surveys (
    id integer NOT NULL,
    content_video_id integer NOT NULL,
    user_id integer,
    questions_json jsonb NOT NULL,
    answers_json jsonb,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    submitted_at timestamp(3) without time zone
);


--
-- Name: post_watch_surveys_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.post_watch_surveys_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: post_watch_surveys_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.post_watch_surveys_id_seq OWNED BY public.post_watch_surveys.id;


--
-- Name: settings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.settings (
    id integer NOT NULL,
    "userId" integer NOT NULL,
    "currentResolution" text,
    "playbackSpeed" double precision,
    "studyingLanguage" text
);


--
-- Name: settings_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.settings_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: settings_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.settings_id_seq OWNED BY public.settings.id;


--
-- Name: statistics; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.statistics (
    id integer NOT NULL,
    "userId" integer NOT NULL,
    "studyingProgress" double precision,
    "lastLesson" timestamp(3) without time zone,
    "isCurrentlyLearning" boolean DEFAULT false NOT NULL,
    "learnedAmount" integer DEFAULT 0 NOT NULL
);


--
-- Name: statistics_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.statistics_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: statistics_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.statistics_id_seq OWNED BY public.statistics.id;


--
-- Name: tags; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.tags (
    id integer NOT NULL,
    name text NOT NULL
);


--
-- Name: tags_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.tags_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: tags_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.tags_id_seq OWNED BY public.tags.id;


--
-- Name: tokens; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.tokens (
    id integer NOT NULL,
    email text NOT NULL,
    token text NOT NULL,
    type public."TokenType" NOT NULL,
    "expiresIn" timestamp(3) without time zone NOT NULL
);


--
-- Name: tokens_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.tokens_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: tokens_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.tokens_id_seq OWNED BY public.tokens.id;


--
-- Name: topics; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.topics (
    id integer NOT NULL,
    name text NOT NULL,
    "categoryId" integer NOT NULL,
    complexity double precision NOT NULL,
    language text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: topics_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.topics_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: topics_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.topics_id_seq OWNED BY public.topics.id;


--
-- Name: user_comprehension_weak_spots; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_comprehension_weak_spots (
    id integer NOT NULL,
    user_id integer NOT NULL,
    content_video_id integer NOT NULL,
    category text NOT NULL,
    stem_hash character varying(64) NOT NULL,
    stem_snippet character varying(500) NOT NULL,
    miss_count integer DEFAULT 1 NOT NULL,
    last_missed_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: user_comprehension_weak_spots_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.user_comprehension_weak_spots_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: user_comprehension_weak_spots_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.user_comprehension_weak_spots_id_seq OWNED BY public.user_comprehension_weak_spots.id;


--
-- Name: user_friends; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_friends (
    id integer NOT NULL,
    "userId" integer NOT NULL,
    "friendId" integer NOT NULL,
    "friendshipCreatedDate" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: user_friends_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.user_friends_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: user_friends_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.user_friends_id_seq OWNED BY public.user_friends.id;


--
-- Name: user_language_data; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_language_data (
    id integer NOT NULL,
    "userId" integer NOT NULL,
    "topicId" integer NOT NULL,
    score double precision NOT NULL,
    listening_score double precision DEFAULT 0.35 NOT NULL,
    vocabulary_score double precision DEFAULT 0.35 NOT NULL,
    grammar_score double precision DEFAULT 0.35 NOT NULL,
    confidence double precision DEFAULT 0 NOT NULL,
    coverage double precision DEFAULT 0 NOT NULL,
    "algorithmVersion" text DEFAULT 'v2'::text NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: user_language_data_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.user_language_data_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: user_language_data_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.user_language_data_id_seq OWNED BY public.user_language_data.id;


--
-- Name: user_vocabulary; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_vocabulary (
    id integer NOT NULL,
    user_id integer NOT NULL,
    language_code text NOT NULL,
    term text NOT NULL,
    source text DEFAULT 'topic_tags'::text NOT NULL,
    topic_id integer,
    mastery double precision DEFAULT 0 NOT NULL,
    native_translation text,
    learner_description text,
    description_cefr_band text,
    native_language_code text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: user_vocabulary_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.user_vocabulary_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: user_vocabulary_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.user_vocabulary_id_seq OWNED BY public.user_vocabulary.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.users (
    id integer NOT NULL,
    name text NOT NULL,
    email text NOT NULL,
    password text,
    role public."UserRole" DEFAULT 'REGULAR'::public."UserRole" NOT NULL,
    has_completed_placement boolean DEFAULT false NOT NULL,
    "lastLogin" timestamp(3) without time zone,
    placement_test_draft jsonb,
    is_suspended boolean DEFAULT false NOT NULL,
    teacher_id integer,
    is_verified boolean DEFAULT false NOT NULL,
    is_two_factor_enable boolean DEFAULT false NOT NULL,
    method public."AuthMethod" NOT NULL,
    "currentStreak" integer DEFAULT 0 NOT NULL,
    "lastActivityDate" timestamp(3) without time zone,
    stripe_customer_id text,
    stripe_subscription_id text,
    subscription_plan text,
    subscription_status text,
    xp integer DEFAULT 0 NOT NULL,
    level integer DEFAULT 1 NOT NULL,
    comprehension_wrong_bank integer DEFAULT 0 NOT NULL,
    error_fixing_test_pending boolean DEFAULT false NOT NULL,
    weekly_review_completed_week_start text,
    weekly_review_last_score_pct double precision,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    mistakes_practice_completed_at timestamp(3) without time zone,
    monthly_review_completed_month text,
    monthly_review_last_score_pct double precision,
    deletion_scheduled_at timestamp(3) without time zone,
    verification_code text,
    verification_code_expires timestamp(3) without time zone,
    daily_reminder_enabled boolean DEFAULT true NOT NULL,
    weekly_report_enabled boolean DEFAULT true NOT NULL
);


--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: video_captions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.video_captions (
    id integer NOT NULL,
    content_video_id integer NOT NULL,
    subtitles_file_link text NOT NULL,
    create_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    update_at timestamp(3) without time zone NOT NULL
);


--
-- Name: video_captions_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.video_captions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: video_captions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.video_captions_id_seq OWNED BY public.video_captions.id;


--
-- Name: watch_sessions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.watch_sessions (
    id integer NOT NULL,
    user_id integer NOT NULL,
    content_video_id integer NOT NULL,
    completion_date date NOT NULL,
    started_at timestamp(3) without time zone,
    ended_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    seconds_watched integer DEFAULT 0 NOT NULL,
    completed boolean DEFAULT true NOT NULL
);


--
-- Name: watch_sessions_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.watch_sessions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: watch_sessions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.watch_sessions_id_seq OWNED BY public.watch_sessions.id;


--
-- Name: Account id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Account" ALTER COLUMN id SET DEFAULT nextval('public."Account_id_seq"'::regclass);


--
-- Name: UserAchievement id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."UserAchievement" ALTER COLUMN id SET DEFAULT nextval('public."UserAchievement_id_seq"'::regclass);


--
-- Name: additional_user_data id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.additional_user_data ALTER COLUMN id SET DEFAULT nextval('public.additional_user_data_id_seq'::regclass);


--
-- Name: categories id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.categories ALTER COLUMN id SET DEFAULT nextval('public.categories_id_seq'::regclass);


--
-- Name: comprehension_test_attempts id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.comprehension_test_attempts ALTER COLUMN id SET DEFAULT nextval('public.comprehension_test_attempts_id_seq'::regclass);


--
-- Name: content_medias id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.content_medias ALTER COLUMN id SET DEFAULT nextval('public.content_medias_id_seq'::regclass);


--
-- Name: content_stats id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.content_stats ALTER COLUMN id SET DEFAULT nextval('public.content_stats_id_seq'::regclass);


--
-- Name: content_videos id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.content_videos ALTER COLUMN id SET DEFAULT nextval('public.content_videos_id_seq'::regclass);


--
-- Name: contents id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.contents ALTER COLUMN id SET DEFAULT nextval('public.contents_id_seq'::regclass);


--
-- Name: genres id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.genres ALTER COLUMN id SET DEFAULT nextval('public.genres_id_seq'::regclass);


--
-- Name: placement_attempts id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.placement_attempts ALTER COLUMN id SET DEFAULT nextval('public.placement_attempts_id_seq'::regclass);


--
-- Name: post_watch_surveys id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.post_watch_surveys ALTER COLUMN id SET DEFAULT nextval('public.post_watch_surveys_id_seq'::regclass);


--
-- Name: settings id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.settings ALTER COLUMN id SET DEFAULT nextval('public.settings_id_seq'::regclass);


--
-- Name: statistics id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.statistics ALTER COLUMN id SET DEFAULT nextval('public.statistics_id_seq'::regclass);


--
-- Name: tags id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tags ALTER COLUMN id SET DEFAULT nextval('public.tags_id_seq'::regclass);


--
-- Name: tokens id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tokens ALTER COLUMN id SET DEFAULT nextval('public.tokens_id_seq'::regclass);


--
-- Name: topics id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.topics ALTER COLUMN id SET DEFAULT nextval('public.topics_id_seq'::regclass);


--
-- Name: user_comprehension_weak_spots id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_comprehension_weak_spots ALTER COLUMN id SET DEFAULT nextval('public.user_comprehension_weak_spots_id_seq'::regclass);


--
-- Name: user_friends id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_friends ALTER COLUMN id SET DEFAULT nextval('public.user_friends_id_seq'::regclass);


--
-- Name: user_language_data id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_language_data ALTER COLUMN id SET DEFAULT nextval('public.user_language_data_id_seq'::regclass);


--
-- Name: user_vocabulary id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_vocabulary ALTER COLUMN id SET DEFAULT nextval('public.user_vocabulary_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Name: video_captions id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.video_captions ALTER COLUMN id SET DEFAULT nextval('public.video_captions_id_seq'::regclass);


--
-- Name: watch_sessions id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.watch_sessions ALTER COLUMN id SET DEFAULT nextval('public.watch_sessions_id_seq'::regclass);


--
-- Data for Name: Account; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Account" (id, type, provider, refresh_token, access_token, expires_at, user_id) FROM stdin;
\.


--
-- Data for Name: UserAchievement; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."UserAchievement" (id, "userId", "achievementId", "unlockedAt") FROM stdin;
3	22	first-video	2026-05-19 11:50:02.757
4	18	first-video	2026-05-19 13:03:47.058
6	18	streak-7	2026-05-25 05:59:16.694
\.


--
-- Data for Name: _ContentStatsToTopic; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."_ContentStatsToTopic" ("A", "B") FROM stdin;
\.


--
-- Data for Name: _FavoriteGenres; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."_FavoriteGenres" ("A", "B") FROM stdin;
4	5
4	9
5	5
5	9
7	13
7	14
8	2
8	7
16	2
16	6
16	11
18	1
19	6
\.


--
-- Data for Name: _HatedGenres; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."_HatedGenres" ("A", "B") FROM stdin;
4	3
4	4
4	14
4	20
5	3
5	4
5	14
5	20
7	8
7	9
8	8
8	9
16	12
16	13
16	18
19	7
\.


--
-- Data for Name: _SelectedTopics; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."_SelectedTopics" ("A", "B") FROM stdin;
\.


--
-- Data for Name: _TagToTopic; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."_TagToTopic" ("A", "B") FROM stdin;
1	1
2	1
5	2
6	2
8	2
3	3
10	3
15	4
16	4
17	4
18	5
19	5
20	5
8	6
22	6
23	6
31	7
34	7
35	7
41	8
42	8
44	8
38	9
39	9
43	9
53	10
54	10
59	10
50	11
51	11
52	11
60	12
61	12
62	12
71	13
72	13
79	13
70	14
73	14
75	14
76	15
82	15
83	15
93	16
96	16
102	16
90	17
94	17
97	17
100	18
101	18
103	18
110	19
114	19
119	19
112	20
113	20
117	20
125	21
126	21
134	21
127	22
131	22
132	22
128	23
129	23
130	23
9	24
11	24
14	24
3	25
12	25
13	25
17	26
25	26
29	26
26	27
27	27
28	27
45	28
47	28
48	28
31	29
46	29
49	29
65	30
66	30
67	30
63	31
64	31
68	31
70	32
86	32
89	32
71	33
85	33
87	33
76	34
84	34
88	34
93	35
97	35
106	35
105	36
107	36
108	36
120	37
121	37
122	37
131	38
135	38
136	38
137	39
138	39
139	39
1	40
2	40
5	41
6	41
8	41
3	42
10	42
15	43
16	43
17	43
18	44
19	44
20	44
8	45
22	45
23	45
31	46
34	46
35	46
41	47
42	47
44	47
38	48
39	48
43	48
53	49
54	49
59	49
50	50
51	50
52	50
60	51
61	51
62	51
71	52
72	52
79	52
70	53
73	53
75	53
76	54
82	54
83	54
93	55
96	55
102	55
90	56
94	56
97	56
100	57
101	57
103	57
110	58
114	58
119	58
112	59
113	59
117	59
125	60
126	60
134	60
127	61
131	61
132	61
128	62
129	62
130	62
9	63
11	63
14	63
3	64
12	64
13	64
17	65
25	65
29	65
26	66
27	66
28	66
45	67
47	67
48	67
31	68
46	68
49	68
65	69
66	69
67	69
63	70
64	70
68	70
70	71
86	71
89	71
71	72
85	72
87	72
76	73
84	73
88	73
93	74
97	74
106	74
105	75
107	75
108	75
120	76
121	76
122	76
131	77
135	77
136	77
137	78
138	78
139	78
\.


--
-- Data for Name: additional_user_data; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.additional_user_data (id, "userId", "nativeLanguage", "knownLanguages", "knownLanguageLevels", job, education, "englishLevel", "workField", hobbies, interests, learning_goal, time_to_achieve, studying_plan_phases, active_studying_phase_index, active_phase_entered_at, "teacherGrades", "teacherTopics", "studentNames", "studentGrade", "studentProblemTopics") FROM stdin;
4	4	\N	{}	\N	\N	\N	\N	\N	{}	\N	подорож у UK	10 months	\N	0	\N	\N	{}	\N	\N	{}
5	5	\N	{}	\N	\N	\N	\N	\N	{}	\N	подорож у UK	10 months	\N	0	\N	\N	{}	\N	\N	{}
65	68	Ukrainian	{}	\N	\N	Philosoph	A1	Developer	{adsasd}	\N	\N	\N	\N	0	\N	\N	{}	\N	\N	{}
7	7	українська	{}	\N	\N	КПИ бакалавр	A1	инжинер	{готовка,маркетинг}	\N	\N	\N	\N	0	\N	\N	{}	\N	\N	{}
8	8	Ukrainian	{}	\N	\N	Bac in design	B1	teacher	{cooking,cycling}	\N	NMT tests	5 months	\N	0	\N	\N	{}	\N	\N	{}
67	70	\N	{}	\N	\N	\N	\N	\N	{}	\N	\N	\N	\N	0	\N	\N	{}	\N	\N	{}
68	71	\N	{}	\N	\N	\N	B1	\N	{}	\N	\N	\N	\N	0	\N	\N	\N	\N	\N	\N
69	72	\N	{}	\N	\N	\N	\N	\N	{}	\N	\N	\N	\N	0	\N	\N	{}	\N	\N	{}
16	18	Ukrainian	{}	\N	\N	Philosoph	B1	Developer	{asd}	\N	Travel to UK	2 months	\N	0	\N	\N	{}	\N	\N	{}
18	20	\N	{}	\N	\N	\N	\N	\N	{}	\N	\N	\N	\N	0	\N	\N	{}	\N	\N	{}
19	21	\N	{}	\N	\N	\N	\N	\N	{}	\N	\N	\N	\N	0	\N	\N	{}	\N	\N	{}
20	22	\N	{}	\N	\N	\N	\N	\N	{}	\N	\N	\N	\N	0	\N	university	{topic:12,tag:65}	[{"name": "WRtwetetea", "surname": "asydgajhsdgahjsd"}]	\N	{}
45	48	\N	{}	\N	\N	\N	\N	\N	{}	\N	\N	\N	\N	0	\N	\N	{}	\N	\N	{}
46	49	\N	{}	\N	\N	\N	\N	\N	{}	\N	\N	\N	\N	0	\N	\N	{}	\N	\N	{}
59	62	\N	{}	\N	\N	\N	\N	\N	{}	\N	\N	\N	\N	0	\N	\N	{}	\N	\N	{}
\.


--
-- Data for Name: categories; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.categories (id, name) FROM stdin;
1	Foundational
2	Daily Life
3	Social & Emotional
4	Leisure & Culture
5	Professional & Academic
6	Abstract & Complex
7	Situational
8	Fluency Markers
\.


--
-- Data for Name: comprehension_test_attempts; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.comprehension_test_attempts (id, user_id, content_video_id, correct, total, score_pct, passed, details, created_at) FROM stdin;
9	22	19	1	10	10	f	{"open": {"total": 1, "correct": 0}, "grammar": {"total": 3, "correct": 1}, "vocabulary": {"total": 3, "correct": 0}, "comprehension": {"total": 3, "correct": 0}}	2026-05-19 11:51:20.827
10	18	20	2	10	20	f	{"open": {"total": 1, "correct": 0}, "grammar": {"total": 3, "correct": 0}, "vocabulary": {"total": 3, "correct": 1}, "comprehension": {"total": 3, "correct": 1}}	2026-05-19 13:04:55.888
18	18	20	4	10	40	f	{"open": {"total": 1, "correct": 0}, "grammar": {"total": 3, "correct": 2}, "vocabulary": {"total": 3, "correct": 0}, "comprehension": {"total": 3, "correct": 2}}	2026-05-21 07:04:56.619
19	18	20	3	10	30	f	{"open": {"total": 1, "correct": 0}, "grammar": {"total": 3, "correct": 1}, "vocabulary": {"total": 3, "correct": 2}, "comprehension": {"total": 3, "correct": 0}}	2026-05-21 13:34:30.908
20	18	20	3	10	30	f	{"open": {"total": 1, "correct": 0}, "grammar": {"total": 3, "correct": 1}, "vocabulary": {"total": 3, "correct": 2}, "comprehension": {"total": 3, "correct": 0}}	2026-05-21 13:34:32.262
25	18	77	2	10	20	f	{"open": {"total": 1, "correct": 0}, "grammar": {"total": 3, "correct": 0}, "vocabulary": {"total": 3, "correct": 1}, "comprehension": {"total": 3, "correct": 1}}	2026-05-24 09:58:23.661
26	18	23	4	10	40	f	{"open": {"total": 1, "correct": 0}, "grammar": {"total": 3, "correct": 2}, "vocabulary": {"total": 3, "correct": 1}, "comprehension": {"total": 3, "correct": 1}}	2026-05-25 05:59:16.765
27	18	23	4	10	40	f	{"open": {"total": 1, "correct": 0}, "grammar": {"total": 3, "correct": 2}, "vocabulary": {"total": 3, "correct": 1}, "comprehension": {"total": 3, "correct": 1}}	2026-05-25 05:59:18.515
28	18	123	2	10	20	f	{"open": {"total": 1, "correct": 0}, "grammar": {"total": 3, "correct": 1}, "vocabulary": {"total": 3, "correct": 1}, "comprehension": {"total": 3, "correct": 0}}	2026-05-25 15:25:05.832
29	18	88	1	10	10	f	{"open": {"total": 1, "correct": 0}, "grammar": {"total": 3, "correct": 0}, "vocabulary": {"total": 3, "correct": 0}, "comprehension": {"total": 3, "correct": 1}}	2026-05-25 15:33:30.385
\.


--
-- Data for Name: content_medias; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.content_medias (id, category_id, playlist_position, create_at, update_at) FROM stdin;
19	17	0	2026-05-17 18:27:48.411	2026-05-17 18:27:48.411
20	18	0	2026-05-17 18:33:04.929	2026-05-17 18:33:04.929
21	19	0	2026-05-17 18:36:43.914	2026-05-17 18:36:43.914
22	20	0	2026-05-17 18:40:18.49	2026-05-17 18:40:18.49
23	21	0	2026-05-17 18:46:20.408	2026-05-17 18:46:20.408
24	22	0	2026-05-17 18:48:40.337	2026-05-17 18:48:40.337
25	23	0	2026-05-17 18:51:49.063	2026-05-17 18:51:49.063
26	24	0	2026-05-17 18:53:31.219	2026-05-17 18:53:31.219
27	25	0	2026-05-17 18:55:29.079	2026-05-17 18:55:29.079
28	26	0	2026-05-17 18:58:54.063	2026-05-17 18:58:54.063
29	27	0	2026-05-17 19:07:45.406	2026-05-17 19:07:45.406
30	28	0	2026-05-17 19:13:01.306	2026-05-17 19:13:01.306
31	29	0	2026-05-17 19:16:17.533	2026-05-17 19:16:17.533
32	30	0	2026-05-17 19:18:56.955	2026-05-17 19:18:56.955
33	31	0	2026-05-17 19:25:05.607	2026-05-17 19:25:05.607
34	32	0	2026-05-17 19:26:32.905	2026-05-17 19:26:32.905
35	33	0	2026-05-17 19:30:36.325	2026-05-17 19:30:36.325
36	34	0	2026-05-17 19:34:10.281	2026-05-17 19:34:10.281
37	35	0	2026-05-17 19:36:37.378	2026-05-17 19:36:37.378
44	39	0	2026-05-18 12:30:35.553	2026-05-18 12:30:35.553
46	40	0	2026-05-19 19:39:51.939	2026-05-19 19:39:51.939
47	41	0	2026-05-19 19:44:36.929	2026-05-19 19:44:36.929
48	21	1	2026-05-19 19:48:05.974	2026-05-19 19:48:05.974
49	42	0	2026-05-19 19:50:02.256	2026-05-19 19:50:02.256
51	44	0	2026-05-19 19:53:47.216	2026-05-19 19:53:47.216
52	45	0	2026-05-19 19:56:29.408	2026-05-19 19:56:29.408
53	46	0	2026-05-19 19:58:22.522	2026-05-19 19:58:22.522
54	47	0	2026-05-19 20:00:13.119	2026-05-19 20:00:13.119
55	48	0	2026-05-19 20:03:05.327	2026-05-19 20:03:05.327
56	49	0	2026-05-19 20:04:41.411	2026-05-19 20:04:41.411
57	50	0	2026-05-19 20:05:09.767	2026-05-19 20:05:09.767
58	51	0	2026-05-19 20:07:36.715	2026-05-19 20:07:36.715
59	52	0	2026-05-19 20:09:38.014	2026-05-19 20:09:38.014
60	53	0	2026-05-19 20:10:28.201	2026-05-19 20:10:28.201
61	54	0	2026-05-19 20:14:19.131	2026-05-19 20:14:19.131
62	55	0	2026-05-19 20:18:34.894	2026-05-19 20:18:34.894
63	56	0	2026-05-19 20:22:09.932	2026-05-19 20:22:09.932
64	57	0	2026-05-19 20:27:40.667	2026-05-19 20:27:40.667
66	59	0	2026-05-20 13:12:46.873	2026-05-20 13:12:46.873
67	60	0	2026-05-20 13:15:31.818	2026-05-20 13:15:31.818
68	60	1	2026-05-20 13:35:38.329	2026-05-20 13:35:38.329
70	61	1	2026-05-20 14:38:43.247	2026-05-20 14:38:43.247
71	61	2	2026-05-20 14:44:03.556	2026-05-20 14:44:03.556
72	62	0	2026-05-20 14:46:19.888	2026-05-20 14:46:19.888
73	62	1	2026-05-20 14:47:51.43	2026-05-20 14:47:51.43
76	65	0	2026-05-20 15:07:54.833	2026-05-20 15:07:54.833
77	65	1	2026-05-20 17:48:58.152	2026-05-20 17:48:58.152
78	65	2	2026-05-20 17:51:14.316	2026-05-20 17:51:14.316
79	66	0	2026-05-20 17:54:15.073	2026-05-20 17:54:15.073
80	66	1	2026-05-20 17:55:51.37	2026-05-20 17:55:51.37
81	67	0	2026-05-20 17:59:08.174	2026-05-20 17:59:08.174
82	68	0	2026-05-20 18:05:56.644	2026-05-20 18:05:56.644
83	69	0	2026-05-20 18:09:11.706	2026-05-20 18:09:11.706
84	69	1	2026-05-20 18:10:11.595	2026-05-20 18:10:11.595
85	70	0	2026-05-20 18:22:17.169	2026-05-20 18:22:17.169
86	70	1	2026-05-20 18:23:46.132	2026-05-20 18:23:46.132
87	70	2	2026-05-20 18:24:54.075	2026-05-20 18:24:54.075
88	71	0	2026-05-20 18:43:14.816	2026-05-20 18:43:14.816
89	71	1	2026-05-20 18:44:36.845	2026-05-20 18:44:36.845
90	72	0	2026-05-20 18:47:32.033	2026-05-20 18:47:32.033
91	72	1	2026-05-20 18:48:37.703	2026-05-20 18:48:37.703
92	73	0	2026-05-20 19:20:09.477	2026-05-20 19:20:09.477
94	75	0	2026-05-20 19:33:49.945	2026-05-20 19:33:49.945
95	75	1	2026-05-20 19:35:55.661	2026-05-20 19:35:55.661
96	75	2	2026-05-20 19:36:44.312	2026-05-20 19:36:44.312
100	78	0	2026-05-20 19:52:28.093	2026-05-20 19:52:28.093
101	79	0	2026-05-20 20:00:51.049	2026-05-20 20:00:51.049
102	78	1	2026-05-20 20:03:49.9	2026-05-20 20:03:49.9
103	79	1	2026-05-20 20:15:04.782	2026-05-20 20:15:04.782
104	78	2	2026-05-20 20:19:37.324	2026-05-20 20:19:37.324
105	80	0	2026-05-24 11:59:02.042	2026-05-24 11:59:02.042
106	81	0	2026-05-24 12:07:48.475	2026-05-24 12:07:48.475
107	82	0	2026-05-24 12:25:57.039	2026-05-24 12:25:57.039
108	83	0	2026-05-24 12:27:52.549	2026-05-24 12:27:52.549
109	84	0	2026-05-24 12:34:11.094	2026-05-24 12:34:11.094
110	85	0	2026-05-24 12:59:04.495	2026-05-24 12:59:04.495
111	85	1	2026-05-24 13:01:09.954	2026-05-24 13:01:09.954
112	86	0	2026-05-24 13:05:46.782	2026-05-24 13:05:46.782
113	22	1	2026-05-24 13:10:17.214	2026-05-24 13:10:17.214
114	87	0	2026-05-24 13:15:00.661	2026-05-24 13:15:00.661
115	88	0	2026-05-24 18:47:13.301	2026-05-24 18:47:13.301
116	89	0	2026-05-24 19:29:19.872	2026-05-24 19:29:19.872
117	90	0	2026-05-24 19:35:50.105	2026-05-24 19:35:50.105
118	90	1	2026-05-24 19:41:33.545	2026-05-24 19:41:33.545
119	91	0	2026-05-24 19:47:09.102	2026-05-24 19:47:09.102
120	91	1	2026-05-24 19:53:10.101	2026-05-24 19:53:10.101
121	92	0	2026-05-24 19:59:20.035	2026-05-24 19:59:20.035
122	93	0	2026-05-24 20:04:30.561	2026-05-24 20:04:30.561
123	94	0	2026-05-24 20:08:08.99	2026-05-24 20:08:08.99
124	95	0	2026-05-24 20:12:21.399	2026-05-24 20:12:21.399
126	97	0	2026-05-24 21:18:25.416	2026-05-24 21:18:25.416
127	97	1	2026-05-24 21:20:52.852	2026-05-24 21:20:52.852
128	98	0	2026-05-24 21:24:09.896	2026-05-24 21:24:09.896
129	99	0	2026-05-24 21:27:50.576	2026-05-24 21:27:50.576
130	100	0	2026-05-24 21:33:09.772	2026-05-24 21:33:09.772
131	101	0	2026-05-24 21:35:47.831	2026-05-24 21:35:47.831
132	99	1	2026-05-24 21:40:02.998	2026-05-24 21:40:02.998
\.


--
-- Data for Name: content_stats; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.content_stats (id, content_media_id, users_watched, rating, system_tags, user_tags, processing_complexity) FROM stdin;
124	47	0	0	{B1}	{Adventure,Animation,Comedy,Family}	4
153	61	0	0	{A2,B1}	{Animation,Comedy,Family}	3
57	27	0	0	{B2}	{Action,Comedy}	6
97	34	2	0	{B2}	{Drama,Thriller}	7
60	25	0	0	{B2}	{Action,Comedy,Sci-Fi}	6
154	48	0	0	{B1}	{Adventure,Fantasy}	6
66	28	0	0	{B1}	{Action,Comedy}	4
70	29	0	0	{B1}	{Action,Adventure,Animation,Comedy,Family}	4
174	57	0	0	{B2}	{Comedy,Horror,Mystery,Thriller}	4
73	32	0	0	{A2,B1}	{Comedy,Family}	3
131	51	0	0	{B1}	{Animation,Comedy,Family,Fantasy}	4
76	30	0	0	{B2}	{Drama,Sci-Fi}	7
79	31	0	0	{B1}	{Adventure,Comedy,Family,Fantasy}	4
138	56	0	0	{A2,B1}	{Adventure,Animation,Comedy,Family}	3
105	44	1	0	{B1}	{Drama,Romance}	6
47	21	0	0	{B2}	{Drama}	6
50	22	0	0	{B2}	{Drama,Romance}	6
85	37	0	0	{B2,C1}	{Crime,Drama,History}	8
88	35	0	0	{B2}	{Action,Adventure,Fantasy}	7
162	54	0	0	{B1}	{Adventure,Comedy,Drama,Family,Fantasy}	4
91	36	0	0	{B2}	{Drama,Sci-Fi}	6
63	23	2	0	{B1}	{Adventure,Family,Fantasy}	4
94	33	0	0	{B2}	{Action,Sci-Fi}	6
44	20	7	0	{B1}	{Comedy,Crime,Drama}	7
183	64	0	0	{B1}	{Animation,Comedy,Sci-Fi}	4
121	46	0	0	{B1}	{Adventure,Animation,Comedy,Family}	4
177	60	0	0	{B1}	{Action,Mystery,Sci-Fi}	5
159	55	0	0	{B2}	{Drama,Horror}	7
128	49	0	0	{B1}	{Animation,Comedy,Family}	4
219	73	0	0	{B1}	{Action,Adventure,Animation,Comedy,Fantasy}	4
180	63	0	0	{B1}	{Adventure,Animation,Comedy,Family,Fantasy}	4
165	62	0	0	{B1}	{Action,Animation,Comedy,Family}	4
171	58	0	0	{B2}	{Animation,Comedy,Family}	6
147	52	1	0	{B1}	{Adventure,Animation,Comedy,Family}	4
40	19	3	0	{B2}	{Comedy,Drama}	6
203	68	0	0	{B1}	{Animation,Comedy,Family,Fantasy,Sci-Fi}	4
141	59	0	0	{A2,B1}	{Animation,Comedy,Family}	4
150	53	0	0	{B1}	{Adventure,Animation,Comedy,Family,Fantasy}	4
199	67	0	0	{B1}	{Animation,Comedy,Drama,Fantasy}	4
209	70	0	0	{B1}	{Animation,Comedy,Family}	6
223	71	0	0	{B1}	{Animation,Comedy,Family}	5
213	72	0	0	{B1}	{Adventure,Animation,Comedy,Fantasy}	4
191	66	0	0	{B1}	{Animation,Comedy,Family}	4
69	26	0	0	{B1}	{Adventure,Comedy,Sci-Fi}	7
236	76	0	0	{A1}	{Animation,Comedy,Family}	2
239	77	0	0	{A1}	{Animation,Comedy,Family}	2
242	78	0	0	{A1}	{Animation,Comedy,Family}	2
54	24	0	0	{B2}	{Crime,Drama,Mystery}	7
248	80	0	0	{B1}	{Animation,Comedy}	6
252	81	0	0	{A2}	{Adventure,Family,Fantasy}	3
245	79	0	0	{B1}	{Animation,Comedy,Family}	6
255	83	0	0	{A2}	{Animation,Comedy,Family}	3
258	84	0	0	{A2}	{Animation,Comedy,Family}	3
307	102	0	0	{A1}	{Animation,Comedy,Family}	2
261	85	0	0	{A2}	{Animation,Comedy,Family}	3
264	86	0	0	{A2}	{Animation,Comedy,Family}	2
267	87	0	0	{A2}	{Animation,Comedy,Family}	3
310	103	0	0	{B1}	{Animation,Comedy,Family}	3
270	88	0	0	{A2}	{Animation,Comedy,Family}	3
343	113	0	0	{B2}	{Crime,Drama,Mystery,Thriller}	7
273	89	0	0	{B1}	{Animation,Comedy,Family}	4
313	104	0	0	{A1}	{Animation,Comedy,Family}	2
367	120	0	0	{B2}	{Drama,History,War}	6
281	91	0	0	{A1,A2}	{Animation,Family}	2
277	90	0	0	{A2}	{Animation,Family}	2
286	82	0	0	{B1}	{Adventure,Animation,Comedy,Family}	4
316	105	0	0	{B1,B2}	{Documentary,History}	4
289	92	0	0	{A2,B1}	{Animation,Comedy,Family}	3
292	94	0	0	{A1}	{Comedy,Family}	2
347	114	0	0	{B1}	{Drama,History}	6
295	95	0	0	{A1}	{Comedy,Family}	2
298	96	0	0	{A1}	{Comedy,Family}	2
321	106	0	0	{B1}	{Documentary}	5
301	100	0	0	{A1}	{Animation,Family}	1
304	101	0	0	{A2,B1}	{Animation,Comedy,Family}	3
401	130	0	0	{B2}	{Comedy,Drama,Sci-Fi}	6
325	107	0	0	{B2}	{Drama}	7
351	115	0	0	{B2}	{Drama,History}	7
328	108	0	0	{B2,C1}	{Drama}	7
331	109	0	0	{B2}	{Action,Comedy,Crime}	9
370	121	0	0	{B2,C1}	{Drama,Romance}	7
334	110	0	0	{B2}	{Drama,History}	6
337	111	0	0	{B2,C1}	{Drama,History}	7
395	131	0	0	{B1}	{Drama}	6
340	112	0	0	{B2}	{Drama}	6
385	127	0	0	{B2}	{Action,Drama,Thriller}	7
358	117	0	0	{C1}	{Crime,Drama,Sci-Fi}	9
373	123	0	0	{B2}	{Drama,History}	7
361	118	0	0	{C2}	{Crime,Drama,Sci-Fi}	9
364	119	0	0	{B2}	{Drama,History,War}	6
376	122	0	0	{B2}	{Drama}	7
379	124	0	0	{B1,B2}	{Drama}	4
388	128	0	0	{B2}	{Comedy,Crime,Drama,Thriller}	6
382	126	0	0	{B2}	{Action,Drama}	7
391	129	0	0	{B2,C1}	{Drama,Mystery,Thriller}	7
354	116	0	0	{B1}	{Drama,Family,Romance}	4
398	132	0	0	{B2}	{Drama,Mystery,Thriller}	7
\.


--
-- Data for Name: content_videos; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.content_videos (id, content_id, playlist_position, video_link, video_name, video_description, "thumbnailUrl") FROM stdin;
29	29	0	https://kpi-eng-course.s3.amazonaws.com/uploads/3059e263-0d6b-4190-a557-ee117e8f25c7.mp4	Madagascar 3 (Ep.1)	Step into the ring with a spectacular, fast-paced animated classic. Perfect for expanding your emotional vocabulary and learning how to deliver witty excuses, this selection offers a fun, dynamic way to practice understanding diverse international speech patterns.	https://kpi-eng-course.s3.amazonaws.com/uploads/477ea4a2-9a81-4b07-987a-8878e5ff1c12.jpg
36	36	0	https://kpi-eng-course.s3.amazonaws.com/uploads/b86c50d0-0f32-41df-907b-343a2f706910.mp4	The Truman Show (Ep.1)	\N	https://kpi-eng-course.s3.amazonaws.com/uploads/34108ecd-a0f5-4360-84ed-ab9f98fde10f.jpg
30	30	0	https://kpi-eng-course.s3.amazonaws.com/uploads/3875a455-f175-431e-b9d4-2eb14cbfa2d8.mp4	Interstellar (Ep.1)	Expand your intellectual vocabulary with a high-stakes cosmic drama. Dive into advanced terminology surrounding space exploration and crisis management, learning exactly how elite minds structure heavy arguments, handle urgent ultimatums, and debate strategic choices.	https://kpi-eng-course.s3.amazonaws.com/uploads/4d148f4c-c731-4fa8-b308-ab2948975446.jpg
28	28	0	https://kpi-eng-course.s3.amazonaws.com/uploads/8c99dce2-850e-4469-9252-b178bf519899.mp4	Mr. & Mrs. Smith (Ep.1)	\N	https://kpi-eng-course.s3.amazonaws.com/uploads/6c9284e9-a58c-48fa-b6d1-22c979c90ff9.jpg
26	26	0	https://kpi-eng-course.s3.amazonaws.com/uploads/14d3b339-c963-4c97-aa50-f9411508b174.mp4	Rick and Morty (Ep.1)	\N	https://kpi-eng-course.s3.amazonaws.com/uploads/ebf7a7d3-91ee-4f9c-ac0c-21f782f06f3b.jpg
33	33	0	https://kpi-eng-course.s3.amazonaws.com/uploads/c54c5ba6-e672-4569-9930-8c4d995569d5.mp4	The Avengers (Ep.1)	\N	https://kpi-eng-course.s3.amazonaws.com/uploads/0df4ed6a-0346-4735-bba3-9d49ce89a272.jpg
34	34	0	https://kpi-eng-course.s3.amazonaws.com/uploads/2f5d85e3-486b-4742-adf2-5e004f723361.mp4	Split (Ep.1)	\N	https://kpi-eng-course.s3.amazonaws.com/uploads/18a44583-2785-49fd-a719-defbfdef189d.jpg
31	31	0	https://kpi-eng-course.s3.amazonaws.com/uploads/8a2274ea-5d0a-41e0-aa34-aafed7a39773.mp4	Shrek (Ep.1)	\N	https://kpi-eng-course.s3.amazonaws.com/uploads/390a411a-2977-4f54-b1b7-ccada5d6df68.jpg
44	44	0	https://kpi-eng-course.s3.amazonaws.com/uploads/a6d62315-c12f-40d9-b2cc-136531b1030a.mp4	Before sunrise (Ep. 1)	\N	https://kpi-eng-course.s3.amazonaws.com/uploads/d69fb34c-1b8d-4ad6-8c8f-5f23f09c86c8.jpg
24	24	0	https://kpi-eng-course.s3.amazonaws.com/uploads/27d5d880-41dc-4bca-ace6-a8f3c8dae5aa.mp4	Sherlock (Ep.1)	\N	https://kpi-eng-course.s3.amazonaws.com/uploads/aadab279-2024-47e1-9d79-496c7a191b52.jpg
35	35	0	https://kpi-eng-course.s3.amazonaws.com/uploads/955dcab5-587c-4b3f-abb6-608acbf753b3.mp4	Pirates of the Caribbean (Ep.1)	\N	https://kpi-eng-course.s3.amazonaws.com/uploads/91da9eaa-0e5f-4c83-ba6b-a94f0b35b3ec.jpg
25	25	0	https://kpi-eng-course.s3.amazonaws.com/uploads/8f5e4d67-51ba-4c51-8657-85bdc707ade1.mp4	Guardians of the Galaxy (Ep.1)	\N	https://kpi-eng-course.s3.amazonaws.com/uploads/c11021ec-9145-4809-a849-f0ccf238ae2c.jpg
37	37	0	https://kpi-eng-course.s3.amazonaws.com/uploads/ae0d8cb9-da76-46d3-bb47-6cfdf5f34314.mp4	Peaky Blinders (Ep.1)	\N	https://kpi-eng-course.s3.amazonaws.com/uploads/8f2e68d9-883c-4598-bffc-2111151d99f4.jpg
22	22	0	https://kpi-eng-course.s3.amazonaws.com/uploads/d3c6c3c2-e4d8-43b1-bf72-ce9b32178122.mp4	Gossip girl (Ep.1)	Ready to speak like a true New Yorker? Analyze the sharp dialogues of Serena and Blair to upgrade your daily communication. This selection of clips will help you understand fast-paced speech, catch modern informal expressions, and learn how to navigate social dynamics in English.	https://kpi-eng-course.s3.amazonaws.com/uploads/39091f6f-33e3-4a78-b948-b0bd66775fc7.jpg
47	47	0	https://kpi-eng-course.s3.amazonaws.com/uploads/9e8d48f1-afee-42f8-8932-d2522fbb2d8a.mp4	Toy Story (Ep.1)	A new toy, space ranger Buzz Lightyear, arrives in Andy's room. The other toys enthusiastically meet him, but Woody the cowboy starts to get extremely jealous.	https://kpi-eng-course.s3.amazonaws.com/uploads/97d481d8-8183-4870-a54e-0cf6582df6e7.jpg
32	32	0	https://kpi-eng-course.s3.amazonaws.com/uploads/556f0e9c-90b4-49e9-a36a-5df1086d382d.mp4	Paddington (Ep.1)	Perfect your listening skills with a lighthearted look at domestic life. Learn how native speakers handle unexpected household surprises, debate family decisions, and use gentle humor to navigate everyday social conflicts while keeping conversations smooth.	https://kpi-eng-course.s3.amazonaws.com/uploads/0d3685f6-b194-470a-b95e-0c248466fd19.jpg
19	19	0	https://kpi-eng-course.s3.amazonaws.com/uploads/cb670ba1-a28e-48ba-b4a5-3798bfa59d4b.mp4	Devil wears Prada (Ep.1)	\N	https://kpi-eng-course.s3.amazonaws.com/uploads/df25f112-c27d-4d0b-8a03-2ec15bb4708f.jpg
21	21	0	https://kpi-eng-course.s3.amazonaws.com/uploads/65c1c3eb-2743-4de1-af0b-d8a8077da919.mp4	Dr. House (Ep.1)	\N	https://kpi-eng-course.s3.amazonaws.com/uploads/2df786be-8401-48e2-b698-14bf3440d411.jpg
27	27	0	https://kpi-eng-course.s3.amazonaws.com/uploads/1f382219-46ad-4886-9025-5bda3c17fe96.mp4	Fast & Furious (Ep.1)	\N	https://kpi-eng-course.s3.amazonaws.com/uploads/cebe6775-28bf-4fdf-af5c-2bab07555cd5.jpg
20	20	0	https://kpi-eng-course.s3.amazonaws.com/uploads/9ed7c4bb-6e7c-4de7-b3dc-26ac5312d12f.mp4	The Wolf of the Wall Street (Ep.1)	Ready to master the language of money and persuasion? This film is the ultimate guide to high-stakes business communication and aggressive sales slang. Analyze Jordan Belfort’s iconic speeches to boost your confidence, learn how to pitch ideas effectively, and take your listening skills to a whole new level.	https://kpi-eng-course.s3.amazonaws.com/uploads/2d68b84b-768b-42b5-ac10-e6c19b2209ce.jpg
23	23	0	https://kpi-eng-course.s3.amazonaws.com/uploads/55cee1a8-bf00-4591-97b8-01afcac3668a.mp4	The Philosopher's stone	\N	https://kpi-eng-course.s3.amazonaws.com/uploads/e0b3bd13-ce59-4550-9796-b11df65af3a6.jpg
48	48	0	https://kpi-eng-course.s3.amazonaws.com/uploads/6ddd1692-1300-450b-9530-f6c7e4726989.mp4	The prisoner of Azkaban	An ideal film for analyzing fast-paced arguments, group conversations, and sarcastic remarks. The natural teenager banter and dramatic storytelling help you easily catch modern British idioms and expressive speech.	https://kpi-eng-course.s3.amazonaws.com/uploads/a8b8decb-7b74-4f79-9321-3505a1c5e72d.jpg
46	46	0	https://kpi-eng-course.s3.amazonaws.com/uploads/3f3085f8-d1b5-4494-aacb-0414740f63a6.mp4	Finding Nemo (Ep.1)	\N	https://kpi-eng-course.s3.amazonaws.com/uploads/c94d82dc-1898-44ae-825c-2991dd07a94a.jpg
123	123	0	https://kpi-eng-course.s3.amazonaws.com/uploads/0ac24efe-da06-43fd-846b-0824c74fe417.mp4	12 Years a Slave (Ep.1)	\N	https://kpi-eng-course.s3.amazonaws.com/uploads/7ff32185-506e-4621-90f7-4646572bd9f6.jpg
124	124	0	https://kpi-eng-course.s3.amazonaws.com/uploads/49f8b7b7-47a9-4a69-9dce-811234445b24.mp4	Cast Away (Ep.1)	\N	https://kpi-eng-course.s3.amazonaws.com/uploads/f60717c0-b4b7-4d1f-99a4-4051dad98657.jpg
63	63	0	https://kpi-eng-course.s3.amazonaws.com/uploads/242a67a7-04f3-491e-8e94-d892df1959a3.mp4	Shrek	Shrek the ogre saves the talkative Donkey from the guards. Now this odd couple is heading to Lord Farquaad's castle to get Shrek's swamp back.	https://kpi-eng-course.s3.amazonaws.com/uploads/4cb831ca-0e60-4264-919c-b99e7b97f848.jpg
60	60	0	https://kpi-eng-course.s3.amazonaws.com/uploads/dab7689a-17f9-45cf-8833-19cd2e005c7f.mp4	The Maze Runner (Ep.1)	A newcomer arrives and upsets the strict rules of a closed community. It’s a masterclass in community-specific slang and created jargon. You'll practice decoding unique, made-up slang words from context clues, just like you would with modern real-life street slang.	https://kpi-eng-course.s3.amazonaws.com/uploads/006bf903-bf77-4d06-b198-35f8874d8bbb.jpg
54	54	0	https://kpi-eng-course.s3.amazonaws.com/uploads/9458bf91-3c07-4b83-88bd-22a0be24ed69.mp4	Mirror Mirror (Ep.1)	\N	https://kpi-eng-course.s3.amazonaws.com/uploads/9b057b70-23bb-4c65-b167-8f4597b2af77.jpg
62	62	0	https://kpi-eng-course.s3.amazonaws.com/uploads/1d9c1976-87c8-4a74-96f8-6d832cc6948a.mp4	Kung Fu Panda (Ep.1)	\N	https://kpi-eng-course.s3.amazonaws.com/uploads/d63b18d6-2582-4b2e-8bbb-9b74298295d2.jpg
64	64	0	https://kpi-eng-course.s3.amazonaws.com/uploads/d71a7b57-746f-455e-83d1-f635e84d80cc.mp4	Phineas and Ferb (Ep.1)	\N	https://kpi-eng-course.s3.amazonaws.com/uploads/0490cd4d-1790-4b66-846b-23857125cc15.jpg
70	70	0	https://kpi-eng-course.s3.amazonaws.com/uploads/256401f7-b3f2-4d4e-a2be-d33d5a81a213.mp4	The Simpsons (Ep.1)	This long-running animated show is a massive encyclopedia of American life. It is your ultimate guide to cultural references, hidden subtext, and double meanings. You will learn to recognize the specific dry irony that shapes modern Western humor.	https://kpi-eng-course.s3.amazonaws.com/uploads/6a72f617-3626-410a-86c5-88b43e7e13cb.jpg
53	53	0	https://kpi-eng-course.s3.amazonaws.com/uploads/2ebd7795-98f5-4a01-bedf-877d82a92e22.mp4	Frozen (Ep.1)	\N	https://kpi-eng-course.s3.amazonaws.com/uploads/e306a237-6913-4607-aac4-b4afe7df4fcd.jpg
68	68	0	https://kpi-eng-course.s3.amazonaws.com/uploads/6089b003-219a-4d7e-b7e9-637da58c9601.mp4	Gravity Falls (Ep.2)	Two twins spend the summer with their weird uncle in a town full of supernatural secrets. It’s a goldmine for tracking complex mysteries through dialogue. You'll practice catching hidden clues, fast-paced conspiracy theories, and subtle wordplay packed into casual conversations.	https://kpi-eng-course.s3.amazonaws.com/uploads/5cb71aee-9844-4a29-acf9-110ae3bebc50.jpg
71	71	0	https://kpi-eng-course.s3.amazonaws.com/uploads/439517b8-c2d0-4bd5-8a9b-48f777fa9eaf.mp4	The Simpsons (Ep.2)	This long-running animated show is a massive encyclopedia of American life. It is your ultimate guide to cultural references, hidden subtext, and double meanings. You will learn to recognize the specific dry irony that shapes modern Western humor.	https://kpi-eng-course.s3.amazonaws.com/uploads/d245b8b3-4dd9-4f0b-9615-133b48a55030.jpg
49	49	0	https://kpi-eng-course.s3.amazonaws.com/uploads/dd8b13b8-554a-4d1d-8023-2a0289890236.mp4	Inside Out (Ep.1)	Riley goes to her new school. The emotions in Headquarters try to handle the stress, but Sadness accidentally touches a core memory, changing it forever.	https://kpi-eng-course.s3.amazonaws.com/uploads/119efa17-dc14-4206-ac8a-d53066ab0c4c.jpg
51	51	0	https://kpi-eng-course.s3.amazonaws.com/uploads/34260fdb-c6ac-46b8-b299-459002627fe3.mp4	Monsters, Inc (Ep.1)	Sulley discovers he accidentally let a human child (Boo) into the monster world. In a panic, he and Mike Wazowski try to hide the girl from everyone around them.	https://kpi-eng-course.s3.amazonaws.com/uploads/284213e7-63a0-464e-afd6-119feaae36e4.jpg
58	58	0	https://kpi-eng-course.s3.amazonaws.com/uploads/8665f9c1-1e6e-4f15-a4a6-7e07bf6da123.mp4	Ratatouille (Ep.1)	\N	https://kpi-eng-course.s3.amazonaws.com/uploads/3e081c1a-ffe4-4ee6-badd-aeb67405e3ba.jpg
57	57	0	https://kpi-eng-course.s3.amazonaws.com/uploads/7bd7042c-8356-49fd-bc7f-2a310b111a84.mp4	Ready or Not (Ep.1)	\N	https://kpi-eng-course.s3.amazonaws.com/uploads/fba0d03a-f219-475e-9a1d-8ee72fde74d1.jpg
56	56	0	https://kpi-eng-course.s3.amazonaws.com/uploads/38003cac-595c-44fa-a58c-87fac11cd024.mp4	Up (Ep.1)	Elderly Carl Fredricksen ties thousands of balloons to his house and takes off. Soon he discovers that he accidentally brought a talkative boy named Russell along with him.	https://kpi-eng-course.s3.amazonaws.com/uploads/4bccb86d-404a-401f-8aab-5d1ec27843aa.jpg
67	67	0	https://kpi-eng-course.s3.amazonaws.com/uploads/c48bd6c0-4932-4ae4-b7ce-5e3fe362081b.mp4	Gravity Falls (Ep.1)	Two twins spend the summer with their weird uncle in a town full of supernatural secrets. It’s a goldmine for tracking complex mysteries through dialogue. You'll practice catching hidden clues, fast-paced conspiracy theories, and subtle wordplay packed into casual conversations.	https://kpi-eng-course.s3.amazonaws.com/uploads/e154d51f-9b09-45d7-abb9-d4da3f01cff4.jpg
61	61	0	https://kpi-eng-course.s3.amazonaws.com/uploads/8de49347-de01-4203-8ac9-0cfe37d4ac19.mp4	The Secret Life of Pets (Ep.1)	Terrier Max's perfect life is ruined when his owner brings home a huge stray dog named Duke. A turf war begins between the two dogs.	https://kpi-eng-course.s3.amazonaws.com/uploads/5ed23ae3-4754-41e3-bc58-140ca7483dbe.jpg
59	59	0	https://kpi-eng-course.s3.amazonaws.com/uploads/610d55a2-f00b-4ab9-a129-5a9bb4ca118e.mp4	Despicable Me (Ep.1)	Supervillain Gru takes orphans Margo, Edith, and Agnes from the orphanage. The girls enter his gloomy, danger-filled house for the first time and meet the minions.	https://kpi-eng-course.s3.amazonaws.com/uploads/782871d9-c3aa-48dc-a7bf-443106ddc1b3.jpg
66	66	0	https://kpi-eng-course.s3.amazonaws.com/uploads/ab71f2ac-81cc-4f6d-940a-3bdae9ee05ec.mp4	Ferdinand	\N	https://kpi-eng-course.s3.amazonaws.com/uploads/274556ef-b395-4afc-90a1-7bcec1f2ad97.jpg
55	55	0	https://kpi-eng-course.s3.amazonaws.com/uploads/c519c1f1-953e-46fb-a8d4-65e96b6fe89b.mp4	It 1	\N	https://kpi-eng-course.s3.amazonaws.com/uploads/2e5c259e-1660-46a6-95ed-83a2325ed00d.jpg
52	52	0	https://kpi-eng-course.s3.amazonaws.com/uploads/6e77d27b-177d-4dc8-8f81-08e267b7de25.mp4	Finding Dory (Ep.1)	\N	https://kpi-eng-course.s3.amazonaws.com/uploads/4ab5c19c-0051-4552-a679-ee2f910890c2.jpg
73	73	0	https://kpi-eng-course.s3.amazonaws.com/uploads/3660d9b6-a025-4df8-9572-d707a564cf86.mp4	Adventure Time (Ep.2)	This show is a goldmine for surreal, modern, and completely unique slang. It is perfect for training your ears to understand how youth language evolves, as the characters constantly invent their own weird vocabulary, shorten words, and use bizarre but expressive catchphrases in casual conversation.	https://kpi-eng-course.s3.amazonaws.com/uploads/e885b25e-6145-4346-8c57-e496f747cac8.jpg
81	81	0	https://kpi-eng-course.s3.amazonaws.com/uploads/bb2de359-5dfc-44e6-b9c3-927b469e4628.mp4	Jack and the Beanstalk	This classic fairy tale is a brilliant tool for mastering the structure of traditional English storytelling. It trains your ears to follow chronological order, past tenses, and descriptive adjectives used to build suspense, making it perfect for learning how to pace an engaging story.	https://kpi-eng-course.s3.amazonaws.com/uploads/a42b7324-b445-4163-a02d-da83ed6ff32c.jpg
72	72	0	https://kpi-eng-course.s3.amazonaws.com/uploads/a4302e1c-9ef3-43f3-8321-f3e341b9b775.mp4	Adventure Time (Ep.1)	\N	https://kpi-eng-course.s3.amazonaws.com/uploads/d48ba302-7a0b-4db7-959d-d748971b5bd6.jpg
83	83	0	https://kpi-eng-course.s3.amazonaws.com/uploads/646301e1-e9f6-4f87-a911-9643f470d490.mp4	Maya The Bee (Ep.1)	\N	https://kpi-eng-course.s3.amazonaws.com/uploads/8eb085b8-6031-4105-ab62-703655449143.jpg
76	76	0	https://kpi-eng-course.s3.amazonaws.com/uploads/70d66b53-4c7d-4114-89db-4674458fb3a1.mp4	Peppa Pig (Ep.1)	The characters constantly use standard formulas for daily social life, from ordering food to playing in the park. It’s an incredible tool for learning polite British etiquette, repetitive phrases, and simple descriptive words that are essential for absolute beginners.	https://kpi-eng-course.s3.amazonaws.com/uploads/bb2dafd9-a26a-4357-b137-6364f04bbf95.jpg
77	77	0	https://kpi-eng-course.s3.amazonaws.com/uploads/c47f2c43-30b1-447d-8cb2-b52a1195e94d.mp4	Peppa Pig (Ep.2)	The characters constantly use standard formulas for daily social life, from ordering food to playing in the park. It’s an incredible tool for learning polite British etiquette, repetitive phrases, and simple descriptive words that are essential for absolute beginners.	https://kpi-eng-course.s3.amazonaws.com/uploads/8c3e9de3-3470-49f2-aa39-67cde938041e.jpg
78	78	0	https://kpi-eng-course.s3.amazonaws.com/uploads/ace94f9c-bca2-4c31-8c36-6a0f727e0364.mp4	Peppa Pig (Ep.3)	The characters constantly use standard formulas for daily social life, from ordering food to playing in the park. It’s an incredible tool for learning polite British etiquette, repetitive phrases, and simple descriptive words that are essential for absolute beginners.	https://kpi-eng-course.s3.amazonaws.com/uploads/a81baef0-9866-43aa-b0a6-1ccf36899be4.jpg
87	87	0	https://kpi-eng-course.s3.amazonaws.com/uploads/7fd116a7-b20d-4eb0-88ee-fca14d3769be.mp4	Ben & Holly's Little Kingdom (Ep.3)	The characters speak with very clear, standard British accents. It is perfect for beginners because the pronunciation is clean, the sentences are short, and the dialogue is never too fast to understand.	https://kpi-eng-course.s3.amazonaws.com/uploads/78435467-a52b-4774-bc4c-48bb78c6f188.jpg
80	80	0	https://kpi-eng-course.s3.amazonaws.com/uploads/97ee5dff-7b34-4bb2-8a4f-d4cd4b8158bc.mp4	Sponge Bob (Ep.2)	A cheerful sea sponge and his underwater friends get into chaotic situations. It’s the ultimate test for fast-paced, high-pitched American English. You'll practice catching rapid jokes, hyperactive shouting, and dramatic shifts in emotional tone.	https://kpi-eng-course.s3.amazonaws.com/uploads/a9358c21-f671-41da-8cc7-41df2cada1b8.jpg
84	84	0	https://kpi-eng-course.s3.amazonaws.com/uploads/04243baa-1d3b-4a11-b99e-eb98f3ec0cdc.mp4	Maya The Bee (Ep.2)	The dialogue is full of polite phrases, kindness, and everyday words about nature and friendship. It is a great tool for learning how to ask nice questions, express curiosity, and chat calmly with others.	https://kpi-eng-course.s3.amazonaws.com/uploads/1edda0ae-640c-4c73-bb53-5f903681587b.jpg
85	85	0	https://kpi-eng-course.s3.amazonaws.com/uploads/7240e401-feb1-4b25-a785-388745bf37c5.mp4	Ben & Holly's Little Kingdom (Ep.1)	\N	https://kpi-eng-course.s3.amazonaws.com/uploads/1a123de9-17af-4b9b-93a9-b2c2833b3566.jpg
86	86	0	https://kpi-eng-course.s3.amazonaws.com/uploads/d7e93e91-5e00-4bbf-9097-775c1c0e7578.mp4	Ben & Holly's Little Kingdom (Ep.2)	The characters speak with very clear, standard British accents. It is perfect for beginners because the pronunciation is clean, the sentences are short, and the dialogue is never too fast to understand.	https://kpi-eng-course.s3.amazonaws.com/uploads/e9bb5eff-e904-45f7-8345-b47573dbfaf5.jpg
88	88	0	https://kpi-eng-course.s3.amazonaws.com/uploads/db2d59e2-35e6-43e6-87a0-3d2c4b32fccf.mp4	Arthur (Ep.1)	\N	https://kpi-eng-course.s3.amazonaws.com/uploads/01c19066-567f-4ff3-876d-05219393be73.jpg
79	79	0	https://kpi-eng-course.s3.amazonaws.com/uploads/39cafa6b-4a5b-491f-a9a2-de6022181151.mp4	Sponge Bob	\N	https://kpi-eng-course.s3.amazonaws.com/uploads/8d90caae-8f04-4b79-b161-29fd5381f3b2.jpg
89	89	0	https://kpi-eng-course.s3.amazonaws.com/uploads/07ad7b8c-fcfb-4794-928d-b59171f27fff.mp4	Arthur (Ep.2)	The dialogue is all about dealing with school stress, sibling arguments, and friendships. It is a great tool for learning how to express your feelings, talk through a disagreement, and explain your point of view clearly.	https://kpi-eng-course.s3.amazonaws.com/uploads/d2d80f5f-50ed-42cc-9f2a-15fefd739971.jpg
91	91	0	https://kpi-eng-course.s3.amazonaws.com/uploads/ad1c60f7-b950-4027-ac89-e9fb83e05ced.mp4	Caillou (Ep.2)	The dialogue focuses entirely on basic household life, daily routines, and toddler tantrums. It is a great tool for learning how to express simple emotions, describe everyday chores, and use basic vocabulary for playing, sharing, and complaining.	https://kpi-eng-course.s3.amazonaws.com/uploads/4fba2eab-99e0-474f-a08d-d18a63525324.jpg
90	90	0	https://kpi-eng-course.s3.amazonaws.com/uploads/137ee98d-9fc5-4d1f-8234-5bdd2edb2f00.mp4	Caillou (Ep.1)	\N	https://kpi-eng-course.s3.amazonaws.com/uploads/dc11aa65-51f3-4599-a90f-edd660aebd3f.jpg
82	82	0	https://kpi-eng-course.s3.amazonaws.com/uploads/5ee0c8dc-adb8-401b-9f7c-68593e37b4e2.mp4	Peter Rabbit (Ep.1)	\N	https://kpi-eng-course.s3.amazonaws.com/uploads/ede39321-4f7a-4826-a363-0fc80c252e41.jpg
92	92	0	https://kpi-eng-course.s3.amazonaws.com/uploads/f0e7f896-90eb-4eb4-a709-e66f74fee402.mp4	Thomas & Friends (Ep.1)	\N	https://kpi-eng-course.s3.amazonaws.com/uploads/411bb01c-e240-46c5-850a-cfcf342480f5.jpg
94	94	0	https://kpi-eng-course.s3.amazonaws.com/uploads/d820bc48-0d27-49c8-bfd8-75dee2f46ed0.mp4	Sesame street (Ep.1)	\N	https://kpi-eng-course.s3.amazonaws.com/uploads/0a093265-5cea-47bd-9e54-56f134d13e96.jpg
122	122	0	https://kpi-eng-course.s3.amazonaws.com/uploads/5abc7afd-af7d-4107-bdf8-167a12242419.mp4	Steve Jobs (Ep.1)	\N	https://kpi-eng-course.s3.amazonaws.com/uploads/726a85cd-acf3-4400-afc6-8940121b127f.jpg
95	95	0	https://kpi-eng-course.s3.amazonaws.com/uploads/04de2d90-45f4-4705-b8d6-a70d76e817e9.mp4	Sesame street (Ep.2)	The show is built for early learning, meaning the words are short, simple, and repeated constantly. It is perfect for mastering numbers, colors, basic verbs, and foundational English sounds without any complicated phrasing.	https://kpi-eng-course.s3.amazonaws.com/uploads/5d0adc68-ca81-4e9a-a615-803d04cf4213.jpg
96	96	0	https://kpi-eng-course.s3.amazonaws.com/uploads/2cac9e39-6a91-4295-a2f1-9740ecf18f74.mp4	Sesame street (Ep.3)	The show is built for early learning, meaning the words are short, simple, and repeated constantly. It is perfect for mastering numbers, colors, basic verbs, and foundational English sounds without any complicated phrasing.	https://kpi-eng-course.s3.amazonaws.com/uploads/87550c71-d219-4240-85b8-6078cff3d3f8.jpg
100	100	0	https://kpi-eng-course.s3.amazonaws.com/uploads/e888f093-16fa-41f8-9765-e4ec85b0793c.mp4	Muzzy in Gondoland (Ep.1)	\N	https://kpi-eng-course.s3.amazonaws.com/uploads/ed26cf3d-f327-435a-8f30-0a5ec4dd176f.jpg
101	101	0	https://kpi-eng-course.s3.amazonaws.com/uploads/84af2f86-7d8c-43e3-a8f0-ee9e553a2397.mp4	Barbie (Ep.1)	\N	https://kpi-eng-course.s3.amazonaws.com/uploads/4872bbd2-fac3-4c0b-9c42-1930313d036d.jpg
102	102	0	https://kpi-eng-course.s3.amazonaws.com/uploads/451ba0a8-6aa6-4065-afbd-f37d92f81d7f.mp4	Muzzy in Gondoland (Ep.2)	The dialogue focuses heavily on the absolute basics of communication. It is the perfect tool for learning how to introduce yourself, count, name colors, and describe simple things (like Muzzy's famous love for eating clocks!).	https://kpi-eng-course.s3.amazonaws.com/uploads/530c946f-f433-4931-af8d-c6116213796f.jpg
103	103	0	https://kpi-eng-course.s3.amazonaws.com/uploads/26c2a329-db17-495f-9c59-9383944488ac.mp4	Barbie (Ep.2)	The characters speak exactly like modern, dramatic teenagers. It is perfect for learning trendy internet-style slang, fast gossip, and casual conversational fillers (like "literally," "omg," or "seriously").	https://kpi-eng-course.s3.amazonaws.com/uploads/45ea1206-7f15-45cf-b0eb-a2ca75bee0da.jpg
104	104	0	https://kpi-eng-course.s3.amazonaws.com/uploads/79ae28d6-5566-4d7e-9d6c-6cbee7db36cd.mp4	Muzzy in Gondoland (Ep.3)	The dialogue focuses heavily on the absolute basics of communication. It is the perfect tool for learning how to introduce yourself, count, name colors, and describe simple things (like Muzzy's famous love for eating clocks!).	https://kpi-eng-course.s3.amazonaws.com/uploads/35d8d684-48a9-48da-a619-cc55deccf046.jpg
113	113	0	https://kpi-eng-course.s3.amazonaws.com/uploads/f6fbc33c-fb12-4b1f-bf62-95d23678a7f3.mp4	Sherlock (Ep.2)	Train your ears with modern detective stories. Watch iconic deduction scenes, break down complex British structures, and easily adopt sophisticated conversational formulas used by native speakers.	https://kpi-eng-course.s3.amazonaws.com/uploads/42ab4504-a374-41ba-889d-a66d229cb481.jpg
105	105	0	https://kpi-eng-course.s3.amazonaws.com/uploads/8ccbea14-be77-440e-9c18-ae20ae6e8bfb.mp4	Story of Route 66	\N	https://kpi-eng-course.s3.amazonaws.com/uploads/dfa103cf-0f58-4a00-9025-b9f38ed756ff.jpg
106	106	0	https://kpi-eng-course.s3.amazonaws.com/uploads/8a10a057-82d7-4c39-b3b2-0cdcd8b1541b.mp4	Down to Earth	\N	https://kpi-eng-course.s3.amazonaws.com/uploads/e107f3a6-8e24-4d80-8413-c5dd338a9d65.jpg
107	107	0	https://kpi-eng-course.s3.amazonaws.com/uploads/af40aadd-227d-4fce-b28a-e50249df3147.mp4	Suits (Ep.1)	\N	https://kpi-eng-course.s3.amazonaws.com/uploads/32c3f54e-8317-4c77-84fd-bbecd1bde81b.jpg
108	108	0	https://kpi-eng-course.s3.amazonaws.com/uploads/f1caa3d5-1f80-4a1c-8766-2343ea1b4c2e.mp4	The Social Network (Ep.1)	\N	https://kpi-eng-course.s3.amazonaws.com/uploads/8c55613c-a22e-426b-a053-ec8294fd0305.jpg
109	109	0	https://kpi-eng-course.s3.amazonaws.com/uploads/5806b012-4df0-46ff-8524-3888d091720e.mp4	Snatch (Ep.1)	\N	https://kpi-eng-course.s3.amazonaws.com/uploads/b535712a-25b6-443b-b110-04fc9d99a985.jpg
110	110	0	https://kpi-eng-course.s3.amazonaws.com/uploads/5400e6ad-8ce5-4674-926c-9ff2170ba8d6.mp4	The Crown (Ep.1)	\N	https://kpi-eng-course.s3.amazonaws.com/uploads/2c24eba3-c9fb-42e2-bbb9-bae4a1513d24.jpg
111	111	0	https://kpi-eng-course.s3.amazonaws.com/uploads/ff9faea4-e3d3-4a8a-8d29-fc23ac6e3e0f.mp4	The Crown (Ep.2)	The dialogue focuses on constitutional precedents, royal prerogatives, and formal government protocols. It is a brilliant resource for mastering high-level political vocabulary and the structured, passive syntax of official state affairs.	https://kpi-eng-course.s3.amazonaws.com/uploads/a7ca7e42-bcda-4699-9916-b76915551709.jpg
112	112	0	https://kpi-eng-course.s3.amazonaws.com/uploads/88bc82a5-21fa-46a4-b7b8-6898a574c67f.mp4	Dead Poets Society (Ep.1)	\N	https://kpi-eng-course.s3.amazonaws.com/uploads/e9524170-7c9f-421f-85bb-c5939c7b6d7e.jpg
117	117	0	https://kpi-eng-course.s3.amazonaws.com/uploads/56afcc1a-8d1e-4709-8673-37360c8a9661.mp4	A Clockwork Orange (Ep.1)	\N	https://kpi-eng-course.s3.amazonaws.com/uploads/4990b06c-4367-440c-a9ec-49cdf6a6159f.jpg
114	114	0	https://kpi-eng-course.s3.amazonaws.com/uploads/2a67211e-55fa-49ff-ac8d-d1b5519c9a1e.mp4	The King's Speech (Ep.1)	\N	https://kpi-eng-course.s3.amazonaws.com/uploads/ce570f12-4c18-4c54-adc2-00441eefa63e.jpg
115	115	0	https://kpi-eng-course.s3.amazonaws.com/uploads/bdfd271f-fa6a-4dc5-bb6a-12f36a68d0b9.mp4	There will be blood (Ep.1)	\N	https://kpi-eng-course.s3.amazonaws.com/uploads/d87153b5-9e1c-416b-982d-8b34509ade9a.jpg
118	118	0	https://kpi-eng-course.s3.amazonaws.com/uploads/efd9609d-2bf0-41f7-b62e-af68fb7b2955.mp4	A Clockwork Orange (Ep.2)	This snippet is a hardcore drill for analyzing dark irony, dystopian satire, and political propaganda. It challenges learners to spot the terrifying discrepancy between polite academic register and brutal human experimentation.	https://kpi-eng-course.s3.amazonaws.com/uploads/ccf965f7-ae22-401b-871f-f5a8315b11d9.jpg
119	119	0	https://kpi-eng-course.s3.amazonaws.com/uploads/d7e718b2-1267-45ad-9c41-1a98327e7c25.mp4	Schindler's List (Ep.1)	\N	https://kpi-eng-course.s3.amazonaws.com/uploads/88c139b6-1d87-4045-b6bc-566cf545af61.jpg
120	120	0	https://kpi-eng-course.s3.amazonaws.com/uploads/3cc935d0-530e-4b11-b48a-17581a1439f6.mp4	Schindler's List (Ep.2)	The dialogue focuses on high-level moral philosophy, military authority, and psychological profiling. It features a tense, calculated negotiation disguised as a casual, alcohol-fueled conversation between elites.	https://kpi-eng-course.s3.amazonaws.com/uploads/03fbdf2f-4e8c-4a2f-bdb7-845fd3d61696.jpg
121	121	0	https://kpi-eng-course.s3.amazonaws.com/uploads/69f83d5d-2fd5-40a6-84f5-9dc4c9ec63b1.mp4	Pride & Prejudice (Ep.1)	\N	https://kpi-eng-course.s3.amazonaws.com/uploads/0281be73-72b5-4d43-87e8-4d770d20b0df.jpg
126	126	0	https://kpi-eng-course.s3.amazonaws.com/uploads/a789e2db-090f-4581-a610-0702a7581f4e.mp4	Fight Club (Ep.1)	\N	https://kpi-eng-course.s3.amazonaws.com/uploads/1e006e89-5088-4a3d-b5aa-959622280257.jpg
127	127	0	https://kpi-eng-course.s3.amazonaws.com/uploads/1705c832-4094-4f06-afbe-3e5a3d755548.mp4	Fight Club (Ep.2)	The dialogue features brilliant, pitch-black social satire, sharp anti-consumerist rhetoric, and rapid-fire American slang. It presents a rich linguistic mix of corporate marketing jargon used ironically alongside raw, existential street-level prose.	https://kpi-eng-course.s3.amazonaws.com/uploads/27334005-9c5a-4964-ba22-1133a9c96cae.jpg
128	128	0	https://kpi-eng-course.s3.amazonaws.com/uploads/b226555d-bb96-44f8-b815-6073580c90c2.mp4	American Psycho (Ep.1)	This segment is a training tool for decoding sociopathic irony. Learners must look past the polished, polite, and enthusiastic delivery to analyze how flawless language and academic-style arguments are used to mask total psychological detachment and cold-blooded violence.	https://kpi-eng-course.s3.amazonaws.com/uploads/b2ea6061-c75f-4b1c-a54d-e7cb23379619.jpg
129	129	0	https://kpi-eng-course.s3.amazonaws.com/uploads/4c94cc5a-9c1b-44ab-97bc-93638416cc46.mp4	Shutter Island (Ep.1)	\N	https://kpi-eng-course.s3.amazonaws.com/uploads/397b3900-dfc1-4d34-9abb-70d9f2b995e6.jpg
116	116	0	https://kpi-eng-course.s3.amazonaws.com/uploads/6aaa6ebd-c4cf-4669-8a3b-143c23d36cfc.mp4	Little Women (Ep.1)	\N	https://kpi-eng-course.s3.amazonaws.com/uploads/e9f59a0d-4801-4fba-bdaa-fdcde2462718.jpg
131	131	0	https://kpi-eng-course.s3.amazonaws.com/uploads/c960d779-953c-491f-b6e1-c5c385eae9c5.mp4	Requiem for a Dream (Ep.1)	\N	https://kpi-eng-course.s3.amazonaws.com/uploads/ad467f59-59f3-484d-9ff9-0ee0cd7ab74e.jpg
132	132	0	https://kpi-eng-course.s3.amazonaws.com/uploads/74d966cc-6e29-4282-9f2c-1e118fc5e3a3.mp4	Shutter Island (Ep.2)	The text is packed with clinical psychology models, trauma-response terminology, defense mechanism analyses, and complex institutional explanations. It shifts between elite medical register and aggressive, defensive denial.	https://kpi-eng-course.s3.amazonaws.com/uploads/aff91e5d-7b57-4bee-ab36-c3e40ad0a2cb.jpg
130	130	0	https://kpi-eng-course.s3.amazonaws.com/uploads/f3b5d16c-036a-4fda-8f90-f643cefb2f29.mp4	The Lobster (Ep.1)	The dialogue is completely stripped of standard human empathy and emotional cues. Characters use hyper-literal, grammatically flawless, and formal sentence structures. It presents a unique linguistic challenge where complex emotional concepts (isolation, fear, romance) are discussed through a cold, transactional, and mechanical register.	https://kpi-eng-course.s3.amazonaws.com/uploads/4e32ff38-8d28-48fa-85dc-e1f96accae36.jpg
\.


--
-- Data for Name: contents; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.contents (id, friendly_link, name, description, owner_user_id, visibility, create_at, update_at) FROM stdin;
17	devil-wears-prada-mpa3wdeo	Devil wears Prada	Dive into real-life vocabulary from the world of high fashion and business. Learn to ace interviews, defend your boundaries, and master corporate slang through iconic scenes with Miranda Priestly.	\N	public	2026-05-17 18:27:48.411	2026-05-17 18:27:48.411
18	the-wolf-of-the-wall-street-mpa40rvs	The Wolf of the Wall Street	Ready to master the language of money and persuasion? This film is the ultimate guide to high-stakes business communication and aggressive sales slang. Analyze Jordan Belfort’s iconic speeches to boost your confidence, learn how to pitch ideas effect	\N	public	2026-05-17 18:33:04.929	2026-05-17 18:33:04.929
19	dr-house-mpa4716v	Dr. House	Upgrade your professional vocabulary with television’s top diagnostician. Break down complex medical mysteries to learn authentic clinical phrasing, terms for symptoms and conditions, and the fast-paced language of hospital emergency rooms.	\N	public	2026-05-17 18:36:43.914	2026-05-17 18:36:43.914
20	gossip-girl-mpa4az0y	Gossip girl	Ready to speak like a true New Yorker? Analyze the sharp dialogues of Serena and Blair to upgrade your daily communication. This selection of clips will help you understand fast-paced speech, catch modern informal expressions, and learn how to naviga	\N	public	2026-05-17 18:40:18.49	2026-05-17 18:40:18.49
22	sherlock-mpa4migx	Sherlock	Train your ears with modern detective stories. Watch iconic deduction scenes, break down complex British structures, and easily adopt sophisticated conversational formulas used by native speakers.	\N	public	2026-05-17 18:48:40.337	2026-05-17 18:48:40.337
23	guardians-of-the-galaxy-mpa4plya	Guardians of the Galaxy	Master modern American pop-culture references, heavy sarcasm, and cosmic humor. Analyze hilarious banter and casual squad dialogue to absorb natural informal phrasing, current youth slang, and expressive everyday idioms.	\N	public	2026-05-17 18:51:49.063	2026-05-17 18:51:49.063
24	rick-and-morty-mpa4tvto	Rick and Morty	Conquer the ultimate challenge in listening comprehension. Dive into rapid-fire, cynical dialogues to master fast-paced American pronunciation, pick up sharp sarcastic comebacks, and bridge the gap between textbook English and real, raw speech.	\N	public	2026-05-17 18:53:31.219	2026-05-17 18:53:31.219
25	fast-furious-mpa4w16w	Fast & Furious	Master real-life American street slang, car culture vocabulary, and high-energy dialogue. Analyze fast-paced action scenes and casual chat between crew members to pick up informal phrasal verbs, daily idioms, and the natural rhythm of everyday speech	\N	public	2026-05-17 18:55:29.079	2026-05-17 18:55:29.079
26	mr-mrs-smith-mpa4ynv6	Mr. & Mrs. Smith	Upgrade your English with Hollywood's most dangerous couple. Analyze fast-paced, witty dialogues to master informal American speech, catch clever double meanings, and learn how native speakers navigate intense social situations.	\N	public	2026-05-17 18:58:54.063	2026-05-17 18:58:54.063
27	madagascar-3-mpa59bvo	Madagascar 3	Step into the ring with a spectacular, fast-paced animated classic. Perfect for expanding your emotional vocabulary and learning how to deliver witty excuses, this selection offers a fun, dynamic way to practice understanding diverse international sp	\N	public	2026-05-17 19:07:45.406	2026-05-17 19:07:45.406
28	interstellar-mpa5hn15	Interstellar	Expand your intellectual vocabulary with a high-stakes cosmic drama. Dive into advanced terminology surrounding space exploration and crisis management, learning exactly how elite minds structure heavy arguments, handle urgent ultimatums, and debate	\N	public	2026-05-17 19:13:01.306	2026-05-17 19:13:01.306
29	shrek-mpa5l200	Shrek	Kickstart your learning with a hilarious, heartwarming animated classic. Perfect for mastering casual everyday idioms, expressive bickering, and basic descriptive vocabulary while enjoying clear articulation and timeless comedy.	\N	public	2026-05-17 19:16:17.533	2026-05-17 19:16:17.533
30	paddington-mpa5piwo	Paddington	Perfect your listening skills with a lighthearted look at domestic life. Learn how native speakers handle unexpected household surprises, debate family decisions, and use gentle humor to navigate everyday social conflicts while keeping conversations	\N	public	2026-05-17 19:18:56.955	2026-05-17 19:18:56.955
31	the-avengers-mpa5xbl6	The Avengers	Boost your listening speed with high-energy dialogue and sharp wit. Perfect for understanding casual squad banter, picking up modern idioms of disagreement, and learning how native speakers confidently defend their boundaries during a conflict.	\N	public	2026-05-17 19:25:05.607	2026-05-17 19:25:05.607
32	split-mpa60abc	Split	Challenge your listening skills with a gripping psychological thriller. Train your ears to decode rapid shifts in vocal tone, mood, and personality as you analyze complex dialogues centered around human psychology and hidden motives.	\N	public	2026-05-17 19:26:32.905	2026-05-17 19:26:32.905
33	pirates-of-the-caribbean-mpa62dmh	Pirates of the Caribbean	Set sail for an adventure filled with witty banter and pirate slang. Master the art of negotiation, catch fast-paced historical retorts, and learn how native speakers use playful irony and sarcasm to navigate tense situations.	\N	public	2026-05-17 19:30:36.325	2026-05-17 19:30:36.325
34	the-truman-show-mpa67mti	The Truman Show	Explore the language of media, sincerity, and emotional depth. Practice distinguishing between raw, authentic friendly chats and polished, manipulative public speaking through crystal-clear standard American dialogue.	\N	public	2026-05-17 19:34:10.281	2026-05-17 19:34:10.281
35	peaky-blinders-mpa6c8i7	Peaky Blinders	Plunge into the gritty, atmospheric vocabulary of British crime drama. Master advanced negotiation phrases, cold ultimatums, and deep philosophical musings while training your ear to catch heavy, gravelly regional accents.	\N	public	2026-05-17 19:36:37.378	2026-05-17 19:36:37.378
40	finding-nemo-mpd1crwz	Finding Nemo	Marlin and Dory accidentally meet a great white shark named Bruce. He invites them to a meeting of the vegetarian shark club, where the fish try to make friends with their natural enemies.	\N	public	2026-05-19 19:39:51.939	2026-05-19 19:39:51.939
41	toy-story-mpd1iprn	Toy Story	A new toy, space ranger Buzz Lightyear, arrives in Andy's room. The other toys enthusiastically meet him, but Woody the cowboy starts to get extremely jealous.	\N	public	2026-05-19 19:44:36.929	2026-05-19 19:44:36.929
42	inside-out-mpd1ps21	Inside Out	Riley goes to her new school. The emotions in Headquarters try to handle the stress, but Sadness accidentally touches a core memory, changing it forever.	\N	public	2026-05-19 19:50:02.256	2026-05-19 19:50:02.256
43	despicable-me-1-mpd1t6kc	Despicable me 1	Perfect for practicing imperative structures and casual family speech. Follow the chaos as three orphan girls break into Gru's strict routine, leading to high-energy arguments, household rules, and a fast-paced undercover cookie mission.	\N	public	2026-05-19 19:53:21.363	2026-05-19 19:53:21.363
21	harry-potter-and-the-philosophers-stone-mpa4haq3	Harry Potter	Start your language journey with a magical classic. Through clear dialogues and a heartwarming story, you will learn how to describe people and places, express basic emotions, and easily catch natural British accents without feeling overwhelmed.	\N	public	2026-05-17 18:46:20.408	2026-05-20 17:40:35.782
44	monsters-inc-mpd1twg5	Monsters, Inc	Sulley discovers he accidentally let a human child (Boo) into the monster world. In a panic, he and Mike Wazowski try to hide the girl from everyone around them.	\N	public	2026-05-19 19:53:47.216	2026-05-19 19:53:47.216
45	finding-dory-mpd1wge4	Finding Dory	The ultimate simulator for casual American sarcasm and negotiation. Watch Dory navigate the Marine Life Institute and strike a deal with Hank the septopus, packed with phrases for making agreements, navigating space, and expressing doubt.	\N	public	2026-05-19 19:56:29.408	2026-05-19 19:56:29.408
46	frozen-mpd1yqz3	Frozen	Frozen — learner catalog.	\N	public	2026-05-19 19:58:22.522	2026-05-19 19:58:22.522
47	mirror-mirror-mpd20qn9	Mirror Mirror	An excellent tool for learning how to shift between formal, polite royal etiquette and raw, energetic street slang. Perfect for mastering theatrical voice acting, comedic expressions, and emotional storytelling.	\N	public	2026-05-19 20:00:13.119	2026-05-19 20:00:13.119
48	it-1-mpd25nb9	It 1	Move past simple greetings. Here, you'll track down a mystery through local ghost stories, old newspaper vocabulary, and tense town history. Perfect for building a darker, more descriptive vocabulary you won't find in class.	\N	public	2026-05-19 20:03:05.327	2026-05-19 20:03:05.327
49	up-mpd27vcs	Up	Elderly Carl Fredricksen ties thousands of balloons to his house and takes off. Soon he discovers that he accidentally brought a talkative boy named Russell along with him.	\N	public	2026-05-19 20:04:41.411	2026-05-19 20:04:41.411
50	ready-or-not-mpd29cv9	Ready or Not	A crazy rich family hunts down a new bride. It’s perfect for comparing social status on screen. You'll contrast Grace's casual American speech with the family's posh, arrogant vocabulary and distinct upper-class stress patterns.	\N	public	2026-05-19 20:05:09.767	2026-05-19 20:05:09.767
51	ratatouille-mpd2c713	Ratatouille	A clumsy garbage boy forms an unlikely alliance to save a restaurant. This trains you in conversational flow, teaching you how to track emotional arguments, clumsy explanations, and smooth, professional speeches given by strict food critics.	\N	public	2026-05-19 20:07:36.715	2026-05-19 20:07:36.715
52	despicable-me-mpd2coq8	Despicable Me	Despicable Me — learner catalog.	\N	public	2026-05-19 20:09:38.014	2026-05-19 20:09:38.014
53	the-maze-runner-mpd2esuy	The Maze Runner	A newcomer arrives and upsets the strict rules of a closed community. It’s a masterclass in community-specific slang and created jargon. You'll practice decoding unique, made-up slang words from context clues, just like you would with modern real-lif	\N	public	2026-05-19 20:10:28.201	2026-05-19 20:10:28.201
54	the-secret-life-of-pets-mpd2jlf5	The Secret Life of Pets	The Secret Life of Pets — learner catalog.	\N	public	2026-05-19 20:14:19.131	2026-05-19 20:14:19.131
55	kung-fu-panda-mpd2pdy9	Kung Fu Panda	Kung Fu Panda — learner catalog.	\N	public	2026-05-19 20:18:34.894	2026-05-19 20:18:34.894
56	shrek-mpd2ubly	Shrek	Shrek — learner catalog.	\N	public	2026-05-19 20:22:09.932	2026-05-19 20:22:09.932
57	phineas-and-ferb-mpd321jq	Phineas and Ferb	Two stepbrothers build impossible inventions while their pet platypus fights evil. It’s a masterclass in rapid-fire comedic timing and sarcastic banter. You'll train your brain to process high-speed American English, witty puns, and meta-humor.	\N	public	2026-05-19 20:27:40.667	2026-05-19 20:27:40.667
58	sponge-bob-mpe2njam	Sponge Bob	A cheerful sea sponge and his underwater friends get into chaotic situations. It’s the ultimate test for fast-paced, high-pitched American English. You'll practice catching rapid jokes, hyperactive shouting, and dramatic shifts in emotional tone.	\N	public	2026-05-20 13:07:07.29	2026-05-20 13:07:07.29
59	ferdinand-mpe2wtyc	Ferdinand	A peaceful bull forms an unlikely escape team with a hyperactive goat and three crafty hedgehogs. This setup is brilliant for training your ears to catch rapid banter, energetic arguments, and colorful, expressive idioms used during adventures.	\N	public	2026-05-20 13:12:46.873	2026-05-20 13:12:46.873
60	gravity-falls-mpe31f6j	Gravity Falls	Two twins spend the summer with their weird uncle in a town full of supernatural secrets. It’s a goldmine for tracking complex mysteries through dialogue. You'll practice catching hidden clues, fast-paced conspiracy theories, and subtle wordplay pack	\N	public	2026-05-20 13:15:31.818	2026-05-20 13:15:31.818
61	the-simpsons-mpe5ff2w	The Simpsons	This long-running animated show is a massive encyclopedia of American life. It is your ultimate guide to cultural references, hidden subtext, and double meanings. You will learn to recognize the specific dry irony that shapes modern Western humor.	\N	public	2026-05-20 14:24:12.959	2026-05-20 14:24:12.959
63	a2-video-mpe6y7tb	A2 video	A2 video — learner catalog.	\N	public	2026-05-20 15:02:51.499	2026-05-20 15:02:51.499
64	just-a-video-mpe71q4d	Just a video	Just a video — learner catalog.	\N	public	2026-05-20 15:05:34.435	2026-05-20 15:05:34.435
65	peppa-mpe74ug5	Peppa	Peppa — learner catalog.	\N	public	2026-05-20 15:07:54.833	2026-05-20 15:07:54.833
68	peter-rabbit-mpedgs4l	Peter Rabbit	The characters are constantly arguing, making plans, and competing with each other. This is a cool way to learn words for arguments, creating clever plans, and making excuses when you get caught red-handed.	\N	public	2026-05-20 18:05:56.644	2026-05-20 18:05:56.644
62	adventure-time-mpe6b94b	Adventure Time	This show is a goldmine for surreal, modern, and completely unique slang. It is perfect for training your ears to understand how youth language evolves, as the characters constantly invent their own weird vocabulary, shorten words, and use bizarre bu	\N	public	2026-05-20 14:46:19.888	2026-05-20 17:22:26.823
39	before-sunrise-mpb6jvw6	Before sunrise	Explore the absolute best baseline for everyday American small talk and deeper connection. Learn the vocabulary of personal worldviews, emotional vulnerability, and casual storytelling through two characters just getting to know each other.	\N	public	2026-05-18 12:30:35.553	2026-05-20 17:22:39.861
66	sponge-bob-mped269d	Sponge Bob	A cheerful sea sponge and his underwater friends get into chaotic situations. It’s the ultimate test for fast-paced, high-pitched American English. You'll practice catching rapid jokes, hyperactive shouting, and dramatic shifts in emotional tone.	\N	public	2026-05-20 17:54:15.073	2026-05-20 17:54:15.073
67	jack-and-the-beanstalk-mped8lew	Jack and the Beanstalk	This classic fairy tale is a brilliant tool for mastering the structure of traditional English storytelling. It trains your ears to follow chronological order, past tenses, and descriptive adjectives used to build suspense, making it perfect for lear	\N	public	2026-05-20 17:59:08.174	2026-05-20 17:59:08.174
69	maya-the-bee-mpedl5g6	Maya The Bee	The dialogue is full of polite phrases, kindness, and everyday words about nature and friendship. It is a great tool for learning how to ask nice questions, express curiosity, and chat calmly with others.	\N	public	2026-05-20 18:09:11.706	2026-05-20 18:09:11.706
70	ben-hollys-little-kingdom-mpee2d6a	Ben & Holly's Little Kingdom	The characters speak with very clear, standard British accents. It is perfect for beginners because the pronunciation is clean, the sentences are short, and the dialogue is never too fast to understand.	\N	public	2026-05-20 18:22:17.169	2026-05-20 18:22:17.169
71	arthur-mpeet7pu	Arthur	The dialogue is all about dealing with school stress, sibling arguments, and friendships. It is a great tool for learning how to express your feelings, talk through a disagreement, and explain your point of view clearly.	\N	public	2026-05-20 18:43:14.816	2026-05-20 18:43:14.816
72	caillou-mpeeyoif	Caillou	The dialogue focuses entirely on basic household life, daily routines, and toddler tantrums. It is a great tool for learning how to express simple emotions, describe everyday chores, and use basic vocabulary for playing, sharing, and complaining.	\N	public	2026-05-20 18:47:32.033	2026-05-20 18:47:32.033
73	thomas-friends-mpeg4n3g	Thomas & Friends	The show uses a helpful narrator who explains exactly what the characters are thinking and doing. It is perfect for learning past tenses, basic storytelling, and how to describe actions clearly step-by-step.	\N	public	2026-05-20 19:20:09.477	2026-05-20 19:20:09.477
74	sesame-street-mpeghvpr	Sesame street	The show is built for early learning, meaning the words are short, simple, and repeated constantly. It is perfect for mastering numbers, colors, basic verbs, and foundational English sounds without any complicated phrasing.	\N	public	2026-05-20 19:30:39.886	2026-05-20 19:30:39.886
75	sesame-street-mpeglzss	Sesame street	The show is built for early learning, meaning the words are short, simple, and repeated constantly. It is perfect for mastering numbers, colors, basic verbs, and foundational English sounds without any complicated phrasing.	\N	public	2026-05-20 19:33:49.945	2026-05-20 19:33:49.945
76	harry-fixed-mpegy9hz	Harry fixed	Harry fixed — learner catalog.	\N	public	2026-05-20 19:44:43.519	2026-05-20 19:44:43.519
78	muzzy-in-gondoland-mpeh9r81	Muzzy in Gondoland	The dialogue focuses heavily on the absolute basics of communication. It is the perfect tool for learning how to introduce yourself, count, name colors, and describe simple things (like Muzzy's famous love for eating clocks!).	\N	public	2026-05-20 19:52:28.093	2026-05-20 19:52:28.093
79	barbie-mpehlaqy	Barbie	The characters speak exactly like modern, dramatic teenagers. It is perfect for learning trendy internet-style slang, fast gossip, and casual conversational fillers (like "literally," "omg," or "seriously").	\N	public	2026-05-20 20:00:51.049	2026-05-20 20:00:51.049
80	story-of-route-66-mpjq4aeq	Story of Route 66	The narration often features slow, rhythmic American regional accents. It is great for practicing emotional pacing, contrasting the high-energy neon boom of the 1950s with the quiet, bittersweet tone of ghost towns.	\N	public	2026-05-24 11:59:02.042	2026-05-24 12:01:06.107
81	down-to-earth-mpjqfwlp	Down to Earth	The language focuses heavily on sustainability, eco-friendly tech, and global cultures. It is great for learning practical scientific terms, environmental vocabulary, and discussing climate change in an accessible way.	\N	public	2026-05-24 12:07:48.475	2026-05-24 12:07:48.475
82	suits-mpjr00ot	Suits	The dialogue is packed with financial fraud terms, identity theft jargon, and high-stakes business logic. It is perfect for learning how professionals negotiate and drop passive-aggressive insults under pressure.	\N	public	2026-05-24 12:25:57.039	2026-05-24 12:25:57.039
83	the-social-network-mpjr4czt	The Social Network	The characters speak at an extreme speed, constantly overlapping each other. It forces your brain to stop translating word-for-word and trains you to process advanced English in real-time.	\N	public	2026-05-24 12:27:52.549	2026-05-24 12:27:52.549
84	snatch-mpjr9fum	Snatch	The dialogue is full of authentic underground slang, fast criminal banter, and dry British comedy. If you can understand these gangsters without subtitles, you can understand any native speaker on earth.	\N	public	2026-05-24 12:34:11.094	2026-05-24 12:34:11.094
85	the-crown-mpjs96o6	The Crown	The dialogue focuses on constitutional precedents, royal prerogatives, and formal government protocols. It is a brilliant resource for mastering high-level political vocabulary and the structured, passive syntax of official state affairs.	\N	public	2026-05-24 12:59:04.495	2026-05-24 12:59:04.495
86	dead-poets-society-mpjsfbuj	Dead Poets Society	The dialogue is deeply enriched with classical poetry, philosophical concepts, and advanced abstract descriptions. It exposes you to the elegant, articulate English of an elite academic institution, far removed from daily casual speech.	\N	public	2026-05-24 13:05:46.782	2026-05-24 13:05:46.782
87	the-kings-speech-mpjss6kv	The King's Speech	The dialogue provides a detailed analysis of English phonology, stress patterns, and articulation mechanics. It serves as an elite framework for mastering formal British pronunciation (RP) and the physical control of speech metrics.	\N	public	2026-05-24 13:15:00.661	2026-05-24 13:15:00.661
88	there-will-be-blood-mpk4py79	There will be blood	This segment is the ultimate test for decoding absolute verbal dominance and dark irony. It forces you to look past the explosive acting to analyze how a predator uses linguistic framing, repetition, and semantic traps to completely break an oppon	\N	public	2026-05-24 18:47:13.301	2026-05-24 18:47:13.301
89	little-women-mpk63pib	Little Women	The text showcases beautiful 19th-century American literary English. It features rapid, witty family banter mixed with deeply articulate arguments about societal expectations, art, and personal independence.	\N	public	2026-05-24 19:29:19.872	2026-05-24 19:29:19.872
90	a-clockwork-orange-mpk6coe0	A Clockwork Orange	This snippet is a hardcore drill for analyzing dark irony, dystopian satire, and political propaganda. It challenges learners to spot the terrifying discrepancy between polite academic register and brutal human experimentation.	\N	public	2026-05-24 19:35:50.105	2026-05-24 19:35:50.105
91	schindlers-list-mpk6r65s	Schindler's List	The dialogue focuses on high-level moral philosophy, military authority, and psychological profiling. It features a tense, calculated negotiation disguised as a casual, alcohol-fueled conversation between elites.	\N	public	2026-05-24 19:47:09.102	2026-05-24 19:47:09.102
92	pride-prejudice-mpk76d4l	Pride & Prejudice	The dialogue features Regency-era English, structured around intricate archaic grammar, inversion, and highly formal vocabulary. It exposes learners to complex sentence construction that completely differs from modern casual speech.	\N	public	2026-05-24 19:59:20.035	2026-05-24 19:59:20.035
93	steve-jobs-mpk7eg3l	Steve Jobs	Written by Aaron Sorkin, this script features extreme verbal density, overlapping dialogue, and a rapid-fire pace. It is packed with tech-industry jargon, marketing strategies, and complex corporate analogies.	\N	public	2026-05-24 20:04:30.561	2026-05-24 20:04:30.561
94	12-years-a-slave-mpk7iee8	12 Years a Slave	The text is saturated with 19th-century southern dialects, biblical allegories, and formal legalistic arguments used to justify property ownership. It is an intense linguistic challenge that deviates significantly from modern standard English.	\N	public	2026-05-24 20:08:08.99	2026-05-24 20:08:08.99
95	cast-away-mpk7pfnf	Cast Away	While the island scenes have zero dialogue, this emotional climax shifts to a highly descriptive, existential register. The character shares deep philosophical reflections using poignant metaphors and complex emotional vocabulary.	\N	public	2026-05-24 20:12:21.399	2026-05-24 20:12:21.399
96	cast-away-mpk7tmjv	Cast Away	While the island scenes have zero dialogue, this emotional climax shifts to a highly descriptive, existential register. The character shares deep philosophical reflections using poignant metaphors and complex emotional vocabulary.	\N	public	2026-05-24 20:15:40.302	2026-05-24 20:15:40.302
97	fight-club-mpka2nvn	Fight Club	The dialogue features brilliant, pitch-black social satire, sharp anti-consumerist rhetoric, and rapid-fire American slang. It presents a rich linguistic mix of corporate marketing jargon used ironically alongside raw, existential street-level prose.	\N	public	2026-05-24 21:18:25.416	2026-05-24 21:18:25.416
98	american-psycho-mpkaa1d2	American Psycho	This segment is a peak C2 training tool for decoding sociopathic irony. Learners must look past the polished, polite, and enthusiastic delivery to analyze how flawless language and academic-style arguments are used to mask total psychological detachm	\N	public	2026-05-24 21:24:09.896	2026-05-24 21:24:09.896
99	shutter-island-mpkad1i4	Shutter Island	The text is packed with clinical psychology models, trauma-response terminology, defense mechanism analyses, and complex institutional explanations. It shifts between elite medical register and aggressive, defensive denial.	\N	public	2026-05-24 21:27:50.576	2026-05-24 21:27:50.576
100	the-lobster-mpkakumy	The Lobster	The dialogue is completely stripped of standard human empathy. It forces learners to look past the lack of intonation and analyze how institutional authority uses polite, calm, and highly structured language to normalize absolute control and absurdi	\N	public	2026-05-24 21:33:09.772	2026-05-24 21:33:09.772
101	requiem-for-a-dream-mpkaogh4	Requiem for a Dream	A brilliant drill for tracking subtextual desperation. It demands the ability to capture deep cognitive decline, severe anxiety, and toxic self-delusion hidden behind repetitive, manic speech patterns and gaslipped family dynamics.	\N	public	2026-05-24 21:35:47.831	2026-05-24 21:35:47.831
\.


--
-- Data for Name: genres; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.genres (id, name) FROM stdin;
1	Action
2	Adventure
3	Animation
4	Comedy
5	Crime
6	Documentary
7	Drama
8	Family
9	Fantasy
10	History
11	Horror
12	Musical
13	Mystery
14	Noir
15	Romance
16	Sci-Fi
17	Sports
18	Thriller
19	War
20	Western
\.


--
-- Data for Name: placement_attempts; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.placement_attempts (id, user_id, score_correct, score_total, score_pct, english_level, created_at) FROM stdin;
1	7	3	12	25	A1	2026-05-15 08:06:14.207
2	8	1	12	8.3	B1	2026-05-15 08:24:53.152
4	18	8	12	66.7	B1	2026-05-18 12:44:13.364
5	68	0	12	0	A1	2026-05-24 08:17:44.881
\.


--
-- Data for Name: post_watch_surveys; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.post_watch_surveys (id, content_video_id, user_id, questions_json, answers_json, created_at, submitted_at) FROM stdin;
11	20	\N	[{"id": "q1", "type": "likert", "prompt": "I feel more confident in my ability to understand fast-paced business English after watching this video.", "options": ["Strongly disagree", "Disagree", "Neutral", "Agree", "Strongly agree"]}, {"id": "q2", "type": "mcq", "prompt": "Which aspect of the video was most helpful for your language learning?", "options": ["Sales terminology", "Persuasive speaking techniques", "Listening comprehension", "Body language and tone"]}, {"id": "q3", "type": "short_text", "prompt": "What is one new English phrase or word you learned from the video that you want to use in a professional setting?"}, {"id": "q4", "type": "likert", "prompt": "The speed and clarity of the speaker in the video were appropriate for my current English level.", "options": ["Strongly disagree", "Disagree", "Neutral", "Agree", "Strongly agree"]}]	\N	2026-05-18 15:58:54.366	\N
9	34	\N	[{"id": "q1", "type": "likert", "prompt": "I understood the main message of the video clearly.", "options": ["Strongly disagree", "Disagree", "Neutral", "Agree", "Strongly agree"]}, {"id": "q2", "type": "mcq", "prompt": "Which aspect of the video did you find most challenging to follow?", "options": ["Vocabulary", "Speaking speed", "The central theme", "Grammar structures"]}, {"id": "q3", "type": "short_text", "prompt": "In one sentence, what is the main takeaway from the video?"}, {"id": "q4", "type": "likert", "prompt": "I feel more confident using the language concepts presented in this video.", "options": ["Strongly disagree", "Disagree", "Neutral", "Agree", "Strongly agree"]}]	\N	2026-05-18 11:28:09.813	\N
10	34	\N	[{"id": "q1", "type": "likert", "prompt": "I understood the main message of the video clearly.", "options": ["Strongly disagree", "Disagree", "Neutral", "Agree", "Strongly agree"]}, {"id": "q2", "type": "mcq", "prompt": "What was the primary tone of the video?", "options": ["Informative", "Persuasive", "Entertaining", "Critical"]}, {"id": "q3", "type": "short_text", "prompt": "What is one new English word or phrase you learned from this video?"}, {"id": "q4", "type": "likert", "prompt": "The speed of the speaker was appropriate for my level.", "options": ["Strongly disagree", "Disagree", "Neutral", "Agree", "Strongly agree"]}]	\N	2026-05-18 12:00:06.694	\N
14	19	\N	[{"id": "q1", "type": "likert", "prompt": "I understood the main plot points and character motivations in this video segment.", "options": ["Strongly disagree", "Disagree", "Neutral", "Agree", "Strongly agree"]}, {"id": "q2", "type": "mcq", "prompt": "Which aspect of the video's dialogue was the most challenging to follow?", "options": ["Speaking speed", "Vocabulary usage", "Cultural references", "Accent and pronunciation"]}, {"id": "q3", "type": "short_text", "prompt": "In one sentence, how would you describe the professional atmosphere shown in the video?"}, {"id": "q4", "type": "likert", "prompt": "I feel more confident in my ability to understand workplace-related English after watching this.", "options": ["Strongly disagree", "Disagree", "Neutral", "Agree", "Strongly agree"]}]	\N	2026-05-19 08:08:42.201	\N
15	44	\N	[{"id": "q1", "type": "likert", "prompt": "I understood the main ideas presented in this video.", "options": ["Strongly disagree", "Disagree", "Neutral", "Agree", "Strongly agree"]}, {"id": "q2", "type": "mcq", "prompt": "Which aspect of the video did you find most challenging to follow?", "options": ["Vocabulary", "Speaking speed", "Grammar structures", "Cultural references"]}, {"id": "q3", "type": "short_text", "prompt": "Summarize the main message of the video in one sentence."}, {"id": "q4", "type": "likert", "prompt": "I feel more confident using the language concepts shown in this video.", "options": ["Strongly disagree", "Disagree", "Neutral", "Agree", "Strongly agree"]}]	\N	2026-05-19 08:20:11.399	\N
19	19	22	[{"id": "q1", "type": "likert", "prompt": "I understood the main plot points and character motivations in this video segment.", "options": ["Strongly disagree", "Disagree", "Neutral", "Agree", "Strongly agree"]}, {"id": "q2", "type": "mcq", "prompt": "Which aspect of the dialogue was the most challenging to follow?", "options": ["Speaking speed", "Vocabulary usage", "Cultural references", "Accent and pronunciation"]}, {"id": "q3", "type": "short_text", "prompt": "In your own words, describe the professional dynamic between the two main characters shown in this clip."}, {"id": "q4", "type": "likert", "prompt": "I feel more confident using workplace-related English vocabulary after watching this video.", "options": ["Strongly disagree", "Disagree", "Neutral", "Agree", "Strongly agree"]}]	\N	2026-05-19 11:50:04.352	\N
20	20	18	[{"id": "q1", "type": "likert", "prompt": "I feel more confident in my ability to understand fast-paced business English after watching this video.", "options": ["Strongly disagree", "Disagree", "Neutral", "Agree", "Strongly agree"]}, {"id": "q2", "type": "mcq", "prompt": "Which aspect of the speaker's communication style did you find most challenging to follow?", "options": ["The speed of speech", "The use of sales slang", "The persuasive tone", "The technical vocabulary"]}, {"id": "q3", "type": "short_text", "prompt": "What is one specific persuasive phrase or technique you learned from the video that you would like to use in your own English practice?"}, {"id": "q4", "type": "likert", "prompt": "The video content was appropriate for my current level of English proficiency.", "options": ["Strongly disagree", "Disagree", "Neutral", "Agree", "Strongly agree"]}]	\N	2026-05-19 13:03:48.594	\N
22	52	22	[{"id": "q1", "type": "likert", "prompt": "I understood the main plot points of this video segment.", "options": ["Strongly disagree", "Disagree", "Neutral", "Agree", "Strongly agree"]}, {"id": "q2", "type": "mcq", "prompt": "What was the primary emotion expressed by the main character in this scene?", "options": ["Confusion", "Excitement", "Anger", "Contentment"]}, {"id": "q3", "type": "short_text", "prompt": "Describe one new vocabulary word or phrase you learned from this video."}, {"id": "q4", "type": "likert", "prompt": "The speed of the dialogue in this video was appropriate for my current English level.", "options": ["Strongly disagree", "Disagree", "Neutral", "Agree", "Strongly agree"]}]	\N	2026-05-20 08:49:32.143	\N
12	20	\N	[{"id": "q1", "type": "likert", "prompt": "I feel more confident in my ability to understand fast-paced business English after watching this video.", "options": ["Strongly disagree", "Disagree", "Neutral", "Agree", "Strongly agree"]}, {"id": "q2", "type": "mcq", "prompt": "Which aspect of the video was most challenging for your listening comprehension?", "options": ["The speed of speech", "The specific sales vocabulary", "The informal slang used", "The tone and delivery"]}, {"id": "q3", "type": "short_text", "prompt": "What is one new persuasive phrase or word you learned from the video that you would like to use in a professional setting?"}, {"id": "q4", "type": "likert", "prompt": "The video provided clear examples of how to pitch ideas effectively.", "options": ["Strongly disagree", "Disagree", "Neutral", "Agree", "Strongly agree"]}]	\N	2026-05-18 21:03:13.643	\N
21	19	\N	[{"id": "q1", "type": "likert", "prompt": "I understood the main plot points and character motivations in this video segment.", "options": ["Strongly disagree", "Disagree", "Neutral", "Agree", "Strongly agree"]}, {"id": "q2", "type": "mcq", "prompt": "Which aspect of the dialogue was most challenging to follow?", "options": ["Speaking speed", "Vocabulary usage", "Cultural references", "Accents"]}, {"id": "q3", "type": "short_text", "prompt": "In one sentence, describe the main conflict presented in this scene."}, {"id": "q4", "type": "likert", "prompt": "I feel more confident using professional English vocabulary after watching this video.", "options": ["Strongly disagree", "Disagree", "Neutral", "Agree", "Strongly agree"]}]	\N	2026-05-20 08:42:58.053	\N
13	20	\N	[{"id": "q1", "type": "likert", "prompt": "I feel more confident in my ability to understand fast-paced business English after watching this video.", "options": ["Strongly disagree", "Disagree", "Neutral", "Agree", "Strongly agree"]}, {"id": "q2", "type": "mcq", "prompt": "Which aspect of the video was most challenging for your listening comprehension?", "options": ["The speed of speech", "The specific sales vocabulary", "The informal slang used", "The speaker's accent"]}, {"id": "q3", "type": "short_text", "prompt": "What is one persuasive phrase or technique from the video that you would like to practice using in your own professional communication?"}, {"id": "q4", "type": "likert", "prompt": "The video provided clear examples of how to use aggressive persuasion techniques in a business context.", "options": ["Strongly disagree", "Disagree", "Neutral", "Agree", "Strongly agree"]}]	\N	2026-05-18 21:31:19.907	\N
16	20	\N	[{"id": "q1", "type": "likert", "prompt": "I feel more confident in my ability to understand fast-paced business English after watching this video.", "options": ["Strongly disagree", "Disagree", "Neutral", "Agree", "Strongly agree"]}, {"id": "q2", "type": "mcq", "prompt": "Which aspect of the video was most challenging for your listening comprehension?", "options": ["The speed of speech", "The specific sales vocabulary", "The informal slang used", "The speaker's accent"]}, {"id": "q3", "type": "short_text", "prompt": "What is one new persuasive phrase or word you learned from the video that you would like to use in a professional setting?"}, {"id": "q4", "type": "likert", "prompt": "The techniques for pitching ideas presented in the video are clear and applicable to my own communication style.", "options": ["Strongly disagree", "Disagree", "Neutral", "Agree", "Strongly agree"]}]	\N	2026-05-19 08:24:06.544	\N
17	20	\N	[{"id": "q1", "type": "likert", "prompt": "I feel more confident in my ability to understand fast-paced business English after watching this video.", "options": ["Strongly disagree", "Disagree", "Neutral", "Agree", "Strongly agree"]}, {"id": "q2", "type": "mcq", "prompt": "Which aspect of the video was most challenging for your listening comprehension?", "options": ["The speed of speech", "Business-specific slang", "The speaker's accent", "The emotional tone"]}, {"id": "q3", "type": "short_text", "prompt": "What is one specific persuasive phrase or technique you learned from the video that you would like to use in your own English communication?"}, {"id": "q4", "type": "likert", "prompt": "The video provided clear examples of how to use aggressive sales language effectively.", "options": ["Strongly disagree", "Disagree", "Neutral", "Agree", "Strongly agree"]}]	\N	2026-05-19 08:24:51.406	\N
18	20	\N	[{"id": "q1", "type": "likert", "prompt": "I feel more confident in my ability to understand fast-paced business English after watching this video.", "options": ["Strongly disagree", "Disagree", "Neutral", "Agree", "Strongly agree"]}, {"id": "q2", "type": "mcq", "prompt": "Which aspect of the video was most challenging for your listening comprehension?", "options": ["The speed of speech", "The specific business slang", "The persuasive tone", "The vocabulary choices"]}, {"id": "q3", "type": "short_text", "prompt": "What is one new persuasive phrase or word you learned from the video that you would like to use in a professional setting?"}, {"id": "q4", "type": "likert", "prompt": "The video provided clear examples of how to pitch ideas effectively.", "options": ["Strongly disagree", "Disagree", "Neutral", "Agree", "Strongly agree"]}]	\N	2026-05-19 08:25:48.666	\N
23	23	\N	[{"id": "q1", "type": "likert", "prompt": "I understood the main concepts discussed in the video.", "options": ["Strongly disagree", "Disagree", "Neutral", "Agree", "Strongly agree"]}, {"id": "q2", "type": "mcq", "prompt": "What was the primary focus of the video?", "options": ["Historical alchemy", "Modern chemistry", "Philosophical symbolism", "Scientific discovery"]}, {"id": "q3", "type": "short_text", "prompt": "In your own words, what does the concept of the Philosopher's stone represent?"}, {"id": "q4", "type": "likert", "prompt": "The vocabulary used in the video was appropriate for my English level.", "options": ["Strongly disagree", "Disagree", "Neutral", "Agree", "Strongly agree"]}]	\N	2026-05-20 09:27:43.124	\N
24	23	\N	[{"id": "q1", "type": "likert", "prompt": "I understood the main concepts presented in the video.", "options": ["Strongly disagree", "Disagree", "Neutral", "Agree", "Strongly agree"]}, {"id": "q2", "type": "mcq", "prompt": "What was the primary focus of the philosophical discussion in the video?", "options": ["Scientific alchemy", "The nature of transformation", "Historical legends", "Modern chemistry"]}, {"id": "q3", "type": "short_text", "prompt": "In your own words, what does the 'Philosopher's Stone' represent to you?"}, {"id": "q4", "type": "likert", "prompt": "The vocabulary used in the video was appropriate for my current English level.", "options": ["Strongly disagree", "Disagree", "Neutral", "Agree", "Strongly agree"]}]	\N	2026-05-20 11:35:12.29	\N
\.


--
-- Data for Name: settings; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.settings (id, "userId", "currentResolution", "playbackSpeed", "studyingLanguage") FROM stdin;
\.


--
-- Data for Name: statistics; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.statistics (id, "userId", "studyingProgress", "lastLesson", "isCurrentlyLearning", "learnedAmount") FROM stdin;
1	68	0	\N	f	0
\.


--
-- Data for Name: tags; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.tags (id, name) FROM stdin;
1	Greetings
2	Introductions
3	Identification
4	Alphabet
5	Numbers
6	Time
7	Weather
8	Directions
9	Colors
10	Family
11	Shapes
12	Prepositions
13	Pronouns
14	Measurement
15	Routines
16	Housing
17	Chores
18	Food
19	Cooking
20	Shopping
21	Clothing
22	Commuting
23	Transport
24	Fitness
25	Parenting
26	Gardening
27	Groceries
28	Delivery
29	Home-Maintenance
30	Hobbies
31	Feelings
32	Health
33	Appearance
34	Personality
35	Friendship
36	Pets
37	Jokes
38	Compliments
39	Apologies
40	Gratitude
41	Opinions
42	Advice
43	Invitations
44	Plans
45	Dating
46	Empathy
47	Conflicts
48	Boundaries
49	Moods
50	Movies
51	Music
52	Books
53	Travel
54	Holidays
55	Sports
56	Gaming
57	Socializing
58	Dining
59	Hotels
60	Nature
61	Art
62	Photography
63	Internet
64	Social-Media
65	Theater
66	Festivals
67	Concerts
68	Streaming
69	Architecture
70	Jobs
71	Workplace
72	Meetings
73	Interviews
74	Education
75	Skills
76	Projects
77	Goals
78	Computers
79	Emails
80	Calls
81	Presentations
82	Feedback
83	Deadlines
84	Money
85	Leadership
86	Networking
87	Remote-Work
88	Startups
89	Resumes
90	News
91	Economy
92	Environment
93	Technology
94	Politics
95	History
96	Science
97	Ethics
98	Memories
99	Dreams
100	Problems
101	Negotiation
102	Comparison
103	Hypotheticals
104	Philosophy
105	Globalization
106	Artificial-Intelligence
107	Human-Rights
108	Climate-Change
109	Psychology
110	Emergencies
111	Fixing
112	Post-Office
113	Banking
114	Airport
115	Library
116	Gifts
117	Appointments
118	Driving
119	Safety
120	Hospital
121	Police
122	Pharmacy
123	Customs
124	Vet
125	Idioms
126	Slang
127	Emphasis
128	Summarizing
129	Clarification
130	Transitions
131	Style
132	Persuasion
133	Speculation
134	Culture-Shock
135	Phrasal-Verbs
136	Collocations
137	Proverbs
138	Politeness
139	Hedging
\.


--
-- Data for Name: tokens; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.tokens (id, email, token, type, "expiresIn") FROM stdin;
1	tekit@gmail.com	e234aeef-c22a-4b41-9c62-7db785d92f76	VERIFICATION	2026-05-15 08:31:02.945
4	boolka276@gmail.com	50f9b2f9-fc2e-4b0f-97e7-01ac451a9108	ACCOUNT_RESTORE	2026-06-23 07:19:55.817
\.


--
-- Data for Name: topics; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.topics (id, name, "categoryId", complexity, language, "createdAt", "updatedAt") FROM stdin;
1	Basic Greetings and Introductions	1	1	en	2026-05-15 07:12:34.201	2026-05-15 07:12:34.201
2	Numbers, Time and Directions	1	1.1	en	2026-05-15 07:12:34.214	2026-05-15 07:12:34.214
3	Family and Daily Communication	1	1.2	en	2026-05-15 07:12:34.224	2026-05-15 07:12:34.224
4	Home and Daily Routines	2	1.3	en	2026-05-15 07:12:34.23	2026-05-15 07:12:34.23
5	Food, Cooking and Shopping	2	1.4	en	2026-05-15 07:12:34.237	2026-05-15 07:12:34.237
6	Transport and Commuting Basics	2	1.5	en	2026-05-15 07:12:34.244	2026-05-15 07:12:34.244
7	Feelings and Relationships	3	1.6	en	2026-05-15 07:12:34.25	2026-05-15 07:12:34.25
8	Giving Advice and Opinions	3	1.8	en	2026-05-15 07:12:34.257	2026-05-15 07:12:34.257
9	Invitations, Compliments and Apologies	3	1.7	en	2026-05-15 07:12:34.262	2026-05-15 07:12:34.262
10	Travel and Hotel Conversations	4	1.9	en	2026-05-15 07:12:34.268	2026-05-15 07:12:34.268
11	Movies, Music and Books Discussion	4	2	en	2026-05-15 07:12:34.287	2026-05-15 07:12:34.287
12	Art, Nature and Photography Talk	4	2.1	en	2026-05-15 07:12:34.295	2026-05-15 07:12:34.295
13	Meetings and Workplace Communication	5	2.2	en	2026-05-15 07:12:34.299	2026-05-15 07:12:34.299
14	Interviews and Career Growth	5	2.3	en	2026-05-15 07:12:34.304	2026-05-15 07:12:34.304
15	Projects, Deadlines and Feedback	5	2.4	en	2026-05-15 07:12:34.308	2026-05-15 07:12:34.308
16	Technology and Science Debates	6	2.6	en	2026-05-15 07:12:34.312	2026-05-15 07:12:34.312
17	Ethics, Politics and Society	6	2.8	en	2026-05-15 07:12:34.316	2026-05-15 07:12:34.316
18	Hypotheticals and Negotiation Skills	6	2.9	en	2026-05-15 07:12:34.322	2026-05-15 07:12:34.322
19	Airport and Emergency Situations	7	2.1	en	2026-05-15 07:12:34.326	2026-05-15 07:12:34.326
20	Banking, Appointments and Post Office	7	2	en	2026-05-15 07:12:34.331	2026-05-15 07:12:34.331
21	Idioms and Slang in Context	8	3	en	2026-05-15 07:12:34.335	2026-05-15 07:12:34.335
22	Persuasion and Emphasis Techniques	8	3.1	en	2026-05-15 07:12:34.339	2026-05-15 07:12:34.339
23	Transitions, Clarification and Summarizing	8	2.7	en	2026-05-15 07:12:34.344	2026-05-15 07:12:34.344
24	Shapes, Colors, and Describing Objects	1	1.1	en	2026-05-15 07:12:34.348	2026-05-15 07:12:34.348
25	Using Prepositions and Pronouns Correctly	1	1.2	en	2026-05-15 07:12:34.352	2026-05-15 07:12:34.352
26	Parenting and Household Management	2	1.6	en	2026-05-15 07:12:34.356	2026-05-15 07:12:34.356
27	Groceries, Gardening, and Home Deliveries	2	1.5	en	2026-05-15 07:12:34.361	2026-05-15 07:12:34.361
28	Dating, Boundaries, and Interpersonal Conflict	3	2.2	en	2026-05-15 07:12:34.365	2026-05-15 07:12:34.365
29	Expressing Moods and Practicing Empathy	3	2	en	2026-05-15 07:12:34.369	2026-05-15 07:12:34.369
30	Theater, Concerts, and Festivals	4	2.1	en	2026-05-15 07:12:34.374	2026-05-15 07:12:34.374
31	Streaming Services and Modern Media	4	2.2	en	2026-05-15 07:12:34.378	2026-05-15 07:12:34.378
32	Writing Resumes and Professional Networking	5	2.5	en	2026-05-15 07:12:34.382	2026-05-15 07:12:34.382
33	Leadership and Managing Remote Teams	5	2.7	en	2026-05-15 07:12:34.387	2026-05-15 07:12:34.387
34	Startup Culture and Scaling Businesses	5	2.8	en	2026-05-15 07:12:34.391	2026-05-15 07:12:34.391
35	Artificial Intelligence and Future Technology	6	3.2	en	2026-05-15 07:12:34.395	2026-05-15 07:12:34.395
36	Climate Change, Globalization, and Human Rights	6	3.3	en	2026-05-15 07:12:34.399	2026-05-15 07:12:34.399
37	Navigating Hospitals, Police, and Pharmacies	7	2.3	en	2026-05-15 07:12:34.403	2026-05-15 07:12:34.403
38	Mastering Phrasal Verbs and Collocations	8	3.1	en	2026-05-15 07:12:34.408	2026-05-15 07:12:34.408
39	Politeness, Hedging, and Common Proverbs	8	3	en	2026-05-15 07:12:34.411	2026-05-15 07:12:34.411
40	Basic Greetings and Introductions	1	1	en	2026-05-15 08:53:58.49	2026-05-15 08:53:58.49
41	Numbers, Time and Directions	1	1.1	en	2026-05-15 08:53:58.522	2026-05-15 08:53:58.522
42	Family and Daily Communication	1	1.2	en	2026-05-15 08:53:58.533	2026-05-15 08:53:58.533
43	Home and Daily Routines	2	1.3	en	2026-05-15 08:53:58.541	2026-05-15 08:53:58.541
44	Food, Cooking and Shopping	2	1.4	en	2026-05-15 08:53:58.546	2026-05-15 08:53:58.546
45	Transport and Commuting Basics	2	1.5	en	2026-05-15 08:53:58.551	2026-05-15 08:53:58.551
46	Feelings and Relationships	3	1.6	en	2026-05-15 08:53:58.555	2026-05-15 08:53:58.555
47	Giving Advice and Opinions	3	1.8	en	2026-05-15 08:53:58.56	2026-05-15 08:53:58.56
48	Invitations, Compliments and Apologies	3	1.7	en	2026-05-15 08:53:58.564	2026-05-15 08:53:58.564
49	Travel and Hotel Conversations	4	1.9	en	2026-05-15 08:53:58.569	2026-05-15 08:53:58.569
50	Movies, Music and Books Discussion	4	2	en	2026-05-15 08:53:58.576	2026-05-15 08:53:58.576
51	Art, Nature and Photography Talk	4	2.1	en	2026-05-15 08:53:58.584	2026-05-15 08:53:58.584
52	Meetings and Workplace Communication	5	2.2	en	2026-05-15 08:53:58.589	2026-05-15 08:53:58.589
53	Interviews and Career Growth	5	2.3	en	2026-05-15 08:53:58.593	2026-05-15 08:53:58.593
54	Projects, Deadlines and Feedback	5	2.4	en	2026-05-15 08:53:58.598	2026-05-15 08:53:58.598
55	Technology and Science Debates	6	2.6	en	2026-05-15 08:53:58.602	2026-05-15 08:53:58.602
56	Ethics, Politics and Society	6	2.8	en	2026-05-15 08:53:58.606	2026-05-15 08:53:58.606
57	Hypotheticals and Negotiation Skills	6	2.9	en	2026-05-15 08:53:58.61	2026-05-15 08:53:58.61
58	Airport and Emergency Situations	7	2.1	en	2026-05-15 08:53:58.615	2026-05-15 08:53:58.615
59	Banking, Appointments and Post Office	7	2	en	2026-05-15 08:53:58.619	2026-05-15 08:53:58.619
60	Idioms and Slang in Context	8	3	en	2026-05-15 08:53:58.624	2026-05-15 08:53:58.624
61	Persuasion and Emphasis Techniques	8	3.1	en	2026-05-15 08:53:58.628	2026-05-15 08:53:58.628
62	Transitions, Clarification and Summarizing	8	2.7	en	2026-05-15 08:53:58.632	2026-05-15 08:53:58.632
63	Shapes, Colors, and Describing Objects	1	1.1	en	2026-05-15 08:53:58.636	2026-05-15 08:53:58.636
64	Using Prepositions and Pronouns Correctly	1	1.2	en	2026-05-15 08:53:58.64	2026-05-15 08:53:58.64
65	Parenting and Household Management	2	1.6	en	2026-05-15 08:53:58.644	2026-05-15 08:53:58.644
66	Groceries, Gardening, and Home Deliveries	2	1.5	en	2026-05-15 08:53:58.648	2026-05-15 08:53:58.648
67	Dating, Boundaries, and Interpersonal Conflict	3	2.2	en	2026-05-15 08:53:58.653	2026-05-15 08:53:58.653
68	Expressing Moods and Practicing Empathy	3	2	en	2026-05-15 08:53:58.658	2026-05-15 08:53:58.658
69	Theater, Concerts, and Festivals	4	2.1	en	2026-05-15 08:53:58.663	2026-05-15 08:53:58.663
70	Streaming Services and Modern Media	4	2.2	en	2026-05-15 08:53:58.667	2026-05-15 08:53:58.667
71	Writing Resumes and Professional Networking	5	2.5	en	2026-05-15 08:53:58.672	2026-05-15 08:53:58.672
72	Leadership and Managing Remote Teams	5	2.7	en	2026-05-15 08:53:58.677	2026-05-15 08:53:58.677
73	Startup Culture and Scaling Businesses	5	2.8	en	2026-05-15 08:53:58.681	2026-05-15 08:53:58.681
74	Artificial Intelligence and Future Technology	6	3.2	en	2026-05-15 08:53:58.685	2026-05-15 08:53:58.685
75	Climate Change, Globalization, and Human Rights	6	3.3	en	2026-05-15 08:53:58.689	2026-05-15 08:53:58.689
76	Navigating Hospitals, Police, and Pharmacies	7	2.3	en	2026-05-15 08:53:58.694	2026-05-15 08:53:58.694
77	Mastering Phrasal Verbs and Collocations	8	3.1	en	2026-05-15 08:53:58.698	2026-05-15 08:53:58.698
78	Politeness, Hedging, and Common Proverbs	8	3	en	2026-05-15 08:53:58.702	2026-05-15 08:53:58.702
\.


--
-- Data for Name: user_comprehension_weak_spots; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.user_comprehension_weak_spots (id, user_id, content_video_id, category, stem_hash, stem_snippet, miss_count, last_missed_at) FROM stdin;
77	18	20	grammar	5c2bf5ceb49183e9c9512dc3e2d104ebe0703e1d5b302dabb33359833ca27408	Which sentence correctly uses the past perfect tense to describe a sequence of events from the video?	4	2026-05-21 13:34:32.131
192	18	23	comprehension	66881960e550d02c11fdb0cb990ab2b9212579cca7ba4fcaebaeead525599b23	What does “you” mean in this context? (best paraphrase)	2	2026-05-25 05:59:18.429
193	18	23	comprehension	8497e8f0356efdd41601fdc1bbefacd17fc3c69259c21a5eab5330817d2ef192	Your study goal is “Travel to UK” over about 2 months. Why might a clip like “The Philosopher's stone” still help?	2	2026-05-25 05:59:18.434
194	18	23	vocabulary	33a459b30653d4097368c405ec82c2fcb0c5c765bf96e1ffc98dd55a16a397c8	Which use of “mind” fits this lesson context best?	2	2026-05-25 05:59:18.436
195	18	23	vocabulary	4347fdce27205e7c8a31b7572d86bb225bcb3aa341c0056828c973d4c66f9c06	Your study list includes “buoyancy”. What does focused practice with that term in the clip help?	2	2026-05-25 05:59:18.438
196	18	23	grammar	e6ff41956a6b8bb1e3be8e9a19cc97dca504a50c08eeed9578718dbfaf61c0cc	Which sentence is correct for a finished experience?	2	2026-05-25 05:59:18.44
197	18	23	open	d807dca559ba1fc6abcf0bf9f55707191641f35217cd1e88a86e5ad30d7b940d	In 2–3 sentences, what was the video “The Philosopher's stone” mainly about? Mention at least one concrete idea. If it fits the content, note one idea that could matter for an interest like asd.	2	2026-05-25 05:59:18.442
209	18	123	comprehension	403a819bfa1851a868a56aa49b900f115d0b38d1ea91e69fdbc54e311fb2ab27	What is the primary method used to measure the productivity of the workers?	1	2026-05-25 15:25:05.637
210	18	123	comprehension	9d908631faa94ea1abfdc9f52236e3917afe590da7f50f786536b3f6e2c14235	What does the master mean when he calls someone a 'nigger breaker'?	1	2026-05-25 15:25:05.643
211	18	123	open	1c37f2a5106391c2ea15558ec69dd53681a818a137bcb0bcf15b5cdcf0d8c720	Describe in 2–3 sentences what the video was mainly about.	1	2026-05-25 15:25:05.65
212	18	88	comprehension	27a6637593faec2603bdf164732be562597e738deee3ae7c7eb0241b0ca44b07	What does “Through” mean in this context? (best paraphrase)	1	2026-05-25 15:33:30.181
213	18	88	comprehension	6479a9b23cb47356da23dd56e414d8cb21fe1220dd824c9d0c718be59f39998b	Your study goal is “Travel to UK” over about 2 months. Why might a clip like “Arthur (Ep.1)” still help?	1	2026-05-25 15:33:30.192
214	18	88	vocabulary	e0553c858f3bd5a7289531a15c5ec7a09506ce22ecd418849baeecbc37ed1df7	Which use of “looking” fits this lesson context best?	1	2026-05-25 15:33:30.2
215	18	88	vocabulary	36b155a5d1a75f28f5cd16637bf8d2d57ee86d814b4797e5436c0ca9a892a8d1	Which collocation sounds natural for formal workplace English?	1	2026-05-25 15:33:30.21
216	18	88	vocabulary	46aa17fe106ab4d64ed48fe06aee1a11753723af5ce4609ad9213c17b212c8f9	Your study list includes “i'm”. What does focused practice with that term in the clip help?	1	2026-05-25 15:33:30.217
217	18	88	grammar	e6ff41956a6b8bb1e3be8e9a19cc97dca504a50c08eeed9578718dbfaf61c0cc	Which sentence is correct for a finished experience?	1	2026-05-25 15:33:30.224
218	18	88	grammar	b349de1ff7792682bc74e20890b8acb16e1b585cbfd6147addbd16662655140c	Choose the article: “I saw ___ interesting point in the video.”	1	2026-05-25 15:33:30.23
219	18	88	grammar	ede37e38ec8e516087fd8c9276728bee8b3658b53a0b8cef51ce1522e4b35c38	Which completes: “The speaker focuses ___ helping learners with listening.”	1	2026-05-25 15:33:30.237
220	18	88	open	29c76084aac0a4a6c665ee2c6e34fed25b7b274d084b766f4e7c625f983a4cec	In 2–3 sentences, what was the video “Arthur (Ep.1)” mainly about? Mention at least one concrete idea. If it fits the content, note one idea that could matter for an interest like asd.	1	2026-05-25 15:33:30.243
67	22	19	grammar	400c0bb810a3fd7d162d3dfaa5342198fbc1ae8660934d677ed66360bda90065	Identify the correct tense usage: 'I ___ letters out everywhere and then finally got a call.'	1	2026-05-19 11:51:20.75
68	22	19	grammar	f6c79523bf8db27442813e959840cc007b4df3aa0f1c8f607f7e7229cba9df3d	Which sentence correctly uses the article?	1	2026-05-19 11:51:20.756
69	22	19	vocabulary	ee61252dfc1006f33e42a8ea0027d52d232d65164558aae1843454c1c2fcdf93	In the video, what does the phrase 'my head is on a chopping block' mean?	1	2026-05-19 11:51:20.758
70	22	19	vocabulary	b0a28ab8b0997b03cba780637f747c70d927785a1834e001ff0ee787cf24443c	What does Miranda mean when she says she wants the driver to pick her up 'sharp'?	1	2026-05-19 11:51:20.761
71	22	19	vocabulary	4b9a5e0280beab5cae8241141cf9c1875aa24612c4bde33e39e00ab71b19de4c	What does it mean to be 'inadequate' as described by Miranda regarding the previous assistants?	1	2026-05-19 11:51:20.763
72	22	19	comprehension	446a7097cd0cd216463ab1cd2e1ec9441478d03792f1fd6b321173070cef8129	Why does Miranda want the 'book' delivered to her apartment every night?	1	2026-05-19 11:51:20.765
73	22	19	comprehension	bdcd01e2346423b63a1118cd66ba6bbe911850e9695d6d91f9bfd25e8e5e8c4b	What is Andy's initial attitude toward the fashion industry?	1	2026-05-19 11:51:20.767
74	22	19	comprehension	81a22166f531cb737644f4331f64200732893cff2596987a7b3ca32fc8e8a819	What is the main rule Emily gives Andy regarding the office phone?	1	2026-05-19 11:51:20.769
75	22	19	open	1c37f2a5106391c2ea15558ec69dd53681a818a137bcb0bcf15b5cdcf0d8c720	Describe in 2–3 sentences what the video was mainly about.	1	2026-05-19 11:51:20.772
76	18	20	grammar	847a684587986eb66c1d1e66d71075a596f843471d79508e889c982fa0d82503	Identify the correct preposition usage based on the transcript: 'Our firm's roots are so deeply embedded ____ Wall Street.'	1	2026-05-19 13:04:55.693
78	18	20	grammar	6da5313e948f3ee1e2d71a0e05b5cae0f87afb6b90166c759e514a221a610075	Choose the correct article usage: 'He is ____ smartest of the bunch, even though he went to law school.'	1	2026-05-19 13:04:55.712
184	18	77	grammar	cfc8c8aba8596dffbf587e3bc690a651f0549a93b766a6c3ed68f7738133afba	Choose the correct preposition to complete the sentence: 'George is waiting ___ the swimming pool.'	1	2026-05-24 09:58:23.598
185	18	77	grammar	630ce00d0e7d7491bd89c27430110d852b905f8ed784ef90850b95c4d5ea0825	Identify the correct tense used in the sentence: 'Peppa and her family are at the swimming pool.'	1	2026-05-24 09:58:23.602
186	18	77	grammar	ca16230b8690d4b4deb0c5a274e56ab5f105139fc20cb2757d295232153d382a	Which sentence correctly uses the future form mentioned in the transcript?	1	2026-05-24 09:58:23.606
187	18	77	vocabulary	cad2d967833afcbc5314037cf81d9a55c410e4ca51e844b8f9a7b2badff7f839	Daddy Pig says he is 'rather good' at swimming. What does 'rather' mean here?	1	2026-05-24 09:58:23.608
188	18	77	vocabulary	5a406d5e5c04fbb85a8441cf393856b395585c7761494f6b0216378a140ca57f	What is the meaning of the phrasal verb 'hold on to' as used by Rebecca Rabbit?	1	2026-05-24 09:58:23.61
189	18	77	comprehension	5269ff1023b6aabbd0fe7b2d2a9d83c6e49da7e8e0312186a619c2c127cb9cfc	What happens when Daddy Pig finally jumps into the pool?	1	2026-05-24 09:58:23.613
190	18	77	comprehension	c3f94c38f08b52465f9ac2e264b0fd5b98c0866fcf358ea5b4fc6050e48bb353	What is the main reason George is hesitant to enter the pool at first?	1	2026-05-24 09:58:23.615
79	18	20	vocabulary	b1d6c28f1ad782cf6f71c46d140c15eff853947b8097a2989018010c8f442bba	In the context of the video, what does the idiom 'to be a whale' mean in sales?	2	2026-05-21 07:04:56.57
135	18	20	vocabulary	89d7d5f3e3c9867e69883ca47eefdc503d35158d12770b59bec9ef96ad3c6a98	What does Jordan mean when he tells his team to 'pitch' blue chip stocks?	1	2026-05-21 07:04:56.572
191	18	77	open	1c37f2a5106391c2ea15558ec69dd53681a818a137bcb0bcf15b5cdcf0d8c720	Describe in 2–3 sentences what the video was mainly about.	1	2026-05-24 09:58:23.617
204	18	123	grammar	1e6ca3d80cf60500cb2ada20081a4620c1e6657406b075fbf94019d5e08362df	Identify the correct tense usage in the following sentence: 'I ___ my master's favor for nine years before things changed.'	1	2026-05-25 15:25:05.572
205	18	123	grammar	75c367962b44b85a392d775995bc6fa8f3f7ef098782b2681163ddf2c6643b9d	Which sentence correctly uses the article in the context of the video?	1	2026-05-25 15:25:05.591
206	18	123	vocabulary	90728a2a0e43b2c646820a7be30f9605acad785d0fe79b8b86b9a5f39d2924a1	In the video, what does the phrase 'make them boards flush' mean?	1	2026-05-25 15:25:05.609
207	18	123	vocabulary	93a60e8ac51f74e7e4abc7880dd5c65a46427e1841dd71d82380febe561e7ddd	What does the phrasal verb 'commence to' mean in the context of the master's orders?	1	2026-05-25 15:25:05.619
208	18	123	comprehension	da891c157cab7749807460e8eb8ecd666da8cb4d5da0d1e0e14723106e848fa7	Why is the protagonist in danger at the plantation?	1	2026-05-25 15:25:05.63
139	18	20	grammar	558304d3659ab400129819b4e8549291a157d6c67b8273baa37f3383bc605663	Identify the correct pronoun usage in this dialogue: 'I called him Rug Rat because of his hairpiece. Still, give ___ to me young, hungry, and stupid.'	2	2026-05-21 13:34:32.14
80	18	20	vocabulary	74700375fcf4e96e37bfcafbb3f460368f03ab287069f114f2b62e87906299f0	What is the meaning of 'diversification' in the context of the Forbes interview?	4	2026-05-21 13:34:32.145
136	18	20	comprehension	f07307fbb8982787b975c0f6e03f5bd174efd3defc28ccc21a18db12a3ae208c	What is the primary goal of the 'blue chip' stock strategy mentioned in the video?	3	2026-05-21 13:34:32.151
82	18	20	comprehension	afb4a7c2a15f58609c1dc74b40a7d07a1e4ab53f7c002e4072d743422e8686e1	How does Jordan react to the Forbes magazine article about him?	3	2026-05-21 13:34:32.156
81	18	20	comprehension	d1dcd0c784f9ec91360ee003dcedde1e1ee350fc484f9d9154eca7d480331cab	Why does Jordan Belfort suggest targeting the 'wealthiest 1%' of Americans?	3	2026-05-21 13:34:32.16
83	18	20	open	1c37f2a5106391c2ea15558ec69dd53681a818a137bcb0bcf15b5cdcf0d8c720	Describe in 2–3 sentences what the video was mainly about.	4	2026-05-21 13:34:32.165
\.


--
-- Data for Name: user_friends; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.user_friends (id, "userId", "friendId", "friendshipCreatedDate") FROM stdin;
\.


--
-- Data for Name: user_language_data; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.user_language_data (id, "userId", "topicId", score, listening_score, vocabulary_score, grammar_score, confidence, coverage, "algorithmVersion", "updatedAt") FROM stdin;
1	4	1	0.2866666666666667	0.2866666666666667	0.2866666666666667	0.2866666666666667	0.25	0	v3	2026-05-15 07:31:02.93
2	4	2	0.2833333333333333	0.2833333333333333	0.2833333333333333	0.2833333333333333	0.25	0	v3	2026-05-15 07:31:02.93
3	4	3	0.28	0.28	0.28	0.28	0.25	0	v3	2026-05-15 07:31:02.93
4	4	4	0.27666666666666667	0.27666666666666667	0.27666666666666667	0.27666666666666667	0.25	0	v3	2026-05-15 07:31:02.93
5	4	5	0.2733333333333334	0.2733333333333334	0.2733333333333334	0.2733333333333334	0.25	0	v3	2026-05-15 07:31:02.93
6	4	6	0.27	0.27	0.27	0.27	0.25	0	v3	2026-05-15 07:31:02.93
7	4	7	0.2666666666666667	0.2666666666666667	0.2666666666666667	0.2666666666666667	0.25	0	v3	2026-05-15 07:31:02.93
8	4	8	0.26	0.28	0.25	0.25	0.25	0	v3	2026-05-15 07:31:02.93
9	4	9	0.26333333333333336	0.2833333333333334	0.25333333333333335	0.25333333333333335	0.25	0	v3	2026-05-15 07:31:02.93
10	4	10	0.2566666666666667	0.2766666666666667	0.2466666666666667	0.2466666666666667	0.25	0	v3	2026-05-15 07:31:02.93
11	4	11	0.25333333333333335	0.2733333333333334	0.24333333333333335	0.24333333333333335	0.25	0	v3	2026-05-15 07:31:02.93
12	4	12	0.25	0.27	0.24	0.24	0.25	0	v3	2026-05-15 07:31:02.93
13	4	13	0.24666666666666667	0.26666666666666666	0.23666666666666666	0.23666666666666666	0.25	0	v3	2026-05-15 07:31:02.93
14	4	14	0.24333333333333332	0.26333333333333336	0.23333333333333334	0.23333333333333334	0.25	0	v3	2026-05-15 07:31:02.93
15	4	15	0.24	0.26	0.23	0.23	0.25	0	v3	2026-05-15 07:31:02.93
16	4	16	0.2333333333333333	0.25333333333333335	0.22333333333333333	0.22333333333333333	0.25	0	v3	2026-05-15 07:31:02.93
17	4	17	0.22666666666666668	0.24666666666666667	0.21666666666666667	0.21666666666666667	0.25	0	v3	2026-05-15 07:31:02.93
18	4	18	0.22333333333333336	0.24333333333333335	0.21333333333333335	0.21333333333333335	0.25	0	v3	2026-05-15 07:31:02.93
19	4	19	0.25	0.27	0.24	0.24	0.25	0	v3	2026-05-15 07:31:02.93
20	4	20	0.25333333333333335	0.2733333333333334	0.24333333333333335	0.24333333333333335	0.25	0	v3	2026-05-15 07:31:02.93
21	4	21	0.21999999999999997	0.24	0.21	0.21	0.25	0	v3	2026-05-15 07:31:02.93
22	4	22	0.21999999999999997	0.24	0.21	0.21	0.25	0	v3	2026-05-15 07:31:02.93
23	4	23	0.22999999999999998	0.25	0.22	0.22	0.25	0	v3	2026-05-15 07:31:02.93
24	4	24	0.2833333333333333	0.2833333333333333	0.2833333333333333	0.2833333333333333	0.25	0	v3	2026-05-15 07:31:02.93
25	4	25	0.28	0.28	0.28	0.28	0.25	0	v3	2026-05-15 07:31:02.93
26	4	26	0.2666666666666667	0.2666666666666667	0.2666666666666667	0.2666666666666667	0.25	0	v3	2026-05-15 07:31:02.93
27	4	27	0.27	0.27	0.27	0.27	0.25	0	v3	2026-05-15 07:31:02.93
28	4	28	0.24666666666666667	0.26666666666666666	0.23666666666666666	0.23666666666666666	0.25	0	v3	2026-05-15 07:31:02.93
29	4	29	0.25333333333333335	0.2733333333333334	0.24333333333333335	0.24333333333333335	0.25	0	v3	2026-05-15 07:31:02.93
30	4	30	0.25	0.27	0.24	0.24	0.25	0	v3	2026-05-15 07:31:02.93
31	4	31	0.24666666666666667	0.26666666666666666	0.23666666666666666	0.23666666666666666	0.25	0	v3	2026-05-15 07:31:02.93
32	4	32	0.2366666666666667	0.2566666666666667	0.22666666666666668	0.22666666666666668	0.25	0	v3	2026-05-15 07:31:02.93
33	4	33	0.22999999999999998	0.25	0.22	0.22	0.25	0	v3	2026-05-15 07:31:02.93
34	4	34	0.22666666666666668	0.24666666666666667	0.21666666666666667	0.21666666666666667	0.25	0	v3	2026-05-15 07:31:02.93
35	4	35	0.21999999999999997	0.24	0.21	0.21	0.25	0	v3	2026-05-15 07:31:02.93
36	4	36	0.21999999999999997	0.24	0.21	0.21	0.25	0	v3	2026-05-15 07:31:02.93
37	4	37	0.24333333333333332	0.26333333333333336	0.23333333333333334	0.23333333333333334	0.25	0	v3	2026-05-15 07:31:02.93
38	4	38	0.22	0.21666666666666667	0.25666666666666665	0.18666666666666668	0.25	0	v3	2026-05-15 07:31:02.93
39	4	39	0.21999999999999997	0.24	0.21	0.21	0.25	0	v3	2026-05-15 07:31:02.93
40	5	1	0.2866666666666667	0.2866666666666667	0.2866666666666667	0.2866666666666667	0.25	0	v3	2026-05-15 07:38:44.552
41	5	2	0.2833333333333333	0.2833333333333333	0.2833333333333333	0.2833333333333333	0.25	0	v3	2026-05-15 07:38:44.552
42	5	3	0.28	0.28	0.28	0.28	0.25	0	v3	2026-05-15 07:38:44.552
43	5	4	0.27666666666666667	0.27666666666666667	0.27666666666666667	0.27666666666666667	0.25	0	v3	2026-05-15 07:38:44.552
44	5	5	0.2733333333333334	0.2733333333333334	0.2733333333333334	0.2733333333333334	0.25	0	v3	2026-05-15 07:38:44.552
45	5	6	0.27	0.27	0.27	0.27	0.25	0	v3	2026-05-15 07:38:44.552
46	5	7	0.2666666666666667	0.2666666666666667	0.2666666666666667	0.2666666666666667	0.25	0	v3	2026-05-15 07:38:44.552
47	5	8	0.26	0.28	0.25	0.25	0.25	0	v3	2026-05-15 07:38:44.552
48	5	9	0.26333333333333336	0.2833333333333334	0.25333333333333335	0.25333333333333335	0.25	0	v3	2026-05-15 07:38:44.552
49	5	10	0.2566666666666667	0.2766666666666667	0.2466666666666667	0.2466666666666667	0.25	0	v3	2026-05-15 07:38:44.552
50	5	11	0.25333333333333335	0.2733333333333334	0.24333333333333335	0.24333333333333335	0.25	0	v3	2026-05-15 07:38:44.552
51	5	12	0.25	0.27	0.24	0.24	0.25	0	v3	2026-05-15 07:38:44.552
52	5	13	0.24666666666666667	0.26666666666666666	0.23666666666666666	0.23666666666666666	0.25	0	v3	2026-05-15 07:38:44.552
53	5	14	0.24333333333333332	0.26333333333333336	0.23333333333333334	0.23333333333333334	0.25	0	v3	2026-05-15 07:38:44.552
54	5	15	0.24	0.26	0.23	0.23	0.25	0	v3	2026-05-15 07:38:44.552
55	5	16	0.2333333333333333	0.25333333333333335	0.22333333333333333	0.22333333333333333	0.25	0	v3	2026-05-15 07:38:44.552
56	5	17	0.22666666666666668	0.24666666666666667	0.21666666666666667	0.21666666666666667	0.25	0	v3	2026-05-15 07:38:44.552
57	5	18	0.22333333333333336	0.24333333333333335	0.21333333333333335	0.21333333333333335	0.25	0	v3	2026-05-15 07:38:44.552
58	5	19	0.25	0.27	0.24	0.24	0.25	0	v3	2026-05-15 07:38:44.552
59	5	20	0.25333333333333335	0.2733333333333334	0.24333333333333335	0.24333333333333335	0.25	0	v3	2026-05-15 07:38:44.552
60	5	21	0.21999999999999997	0.24	0.21	0.21	0.25	0	v3	2026-05-15 07:38:44.552
61	5	22	0.21999999999999997	0.24	0.21	0.21	0.25	0	v3	2026-05-15 07:38:44.552
62	5	23	0.22999999999999998	0.25	0.22	0.22	0.25	0	v3	2026-05-15 07:38:44.552
63	5	24	0.2833333333333333	0.2833333333333333	0.2833333333333333	0.2833333333333333	0.25	0	v3	2026-05-15 07:38:44.552
64	5	25	0.28	0.28	0.28	0.28	0.25	0	v3	2026-05-15 07:38:44.552
65	5	26	0.2666666666666667	0.2666666666666667	0.2666666666666667	0.2666666666666667	0.25	0	v3	2026-05-15 07:38:44.552
66	5	27	0.27	0.27	0.27	0.27	0.25	0	v3	2026-05-15 07:38:44.552
67	5	28	0.24666666666666667	0.26666666666666666	0.23666666666666666	0.23666666666666666	0.25	0	v3	2026-05-15 07:38:44.552
68	5	29	0.25333333333333335	0.2733333333333334	0.24333333333333335	0.24333333333333335	0.25	0	v3	2026-05-15 07:38:44.552
69	5	30	0.25	0.27	0.24	0.24	0.25	0	v3	2026-05-15 07:38:44.552
70	5	31	0.24666666666666667	0.26666666666666666	0.23666666666666666	0.23666666666666666	0.25	0	v3	2026-05-15 07:38:44.552
71	5	32	0.2366666666666667	0.2566666666666667	0.22666666666666668	0.22666666666666668	0.25	0	v3	2026-05-15 07:38:44.552
72	5	33	0.22999999999999998	0.25	0.22	0.22	0.25	0	v3	2026-05-15 07:38:44.552
73	5	34	0.22666666666666668	0.24666666666666667	0.21666666666666667	0.21666666666666667	0.25	0	v3	2026-05-15 07:38:44.552
74	5	35	0.21999999999999997	0.24	0.21	0.21	0.25	0	v3	2026-05-15 07:38:44.552
75	5	36	0.21999999999999997	0.24	0.21	0.21	0.25	0	v3	2026-05-15 07:38:44.552
76	5	37	0.24333333333333332	0.26333333333333336	0.23333333333333334	0.23333333333333334	0.25	0	v3	2026-05-15 07:38:44.552
77	5	38	0.22	0.21666666666666667	0.25666666666666665	0.18666666666666668	0.25	0	v3	2026-05-15 07:38:44.552
78	5	39	0.21999999999999997	0.24	0.21	0.21	0.25	0	v3	2026-05-15 07:38:44.552
2263	71	1	0.49333333333333335	0.49333333333333335	0.49333333333333335	0.49333333333333335	0.5	0	v3	2026-05-25 13:11:35.971
2264	71	2	0.49666666666666676	0.4966666666666667	0.4966666666666667	0.4966666666666667	0.5	0	v3	2026-05-25 13:11:35.971
2265	71	3	0.5	0.5	0.5	0.5	0.5	0	v3	2026-05-25 13:11:35.971
2266	71	4	0.49666666666666676	0.4966666666666667	0.4966666666666667	0.4966666666666667	0.5	0	v3	2026-05-25 13:11:35.971
2267	71	5	0.49333333333333335	0.49333333333333335	0.49333333333333335	0.49333333333333335	0.5	0	v3	2026-05-25 13:11:35.971
2268	71	6	0.49000000000000005	0.49000000000000005	0.49000000000000005	0.49000000000000005	0.5	0	v3	2026-05-25 13:11:35.971
2269	71	7	0.48666666666666664	0.4866666666666667	0.4866666666666667	0.4866666666666667	0.5	0	v3	2026-05-25 13:11:35.971
2270	71	8	0.48	0.5	0.47000000000000003	0.47000000000000003	0.5	0	v3	2026-05-25 13:11:35.971
2271	71	9	0.4833333333333334	0.5033333333333334	0.4733333333333334	0.4733333333333334	0.5	0	v3	2026-05-25 13:11:35.971
2272	71	10	0.47666666666666674	0.4966666666666667	0.4666666666666667	0.4666666666666667	0.5	0	v3	2026-05-25 13:11:35.971
2273	71	11	0.4733333333333334	0.4933333333333334	0.4633333333333334	0.4633333333333334	0.5	0	v3	2026-05-25 13:11:35.971
2274	71	12	0.47000000000000003	0.49000000000000005	0.46	0.46	0.5	0	v3	2026-05-25 13:11:35.971
2275	71	13	0.4666666666666666	0.4866666666666667	0.45666666666666667	0.45666666666666667	0.5	0	v3	2026-05-25 13:11:35.971
2276	71	14	0.4633333333333334	0.4833333333333334	0.45333333333333337	0.45333333333333337	0.5	0	v3	2026-05-25 13:11:35.971
2277	71	15	0.46	0.48000000000000004	0.45	0.45	0.5	0	v3	2026-05-25 13:11:35.971
2278	71	16	0.45333333333333337	0.4733333333333334	0.44333333333333336	0.44333333333333336	0.5	0	v3	2026-05-25 13:11:35.971
2279	71	17	0.4466666666666667	0.46666666666666673	0.4366666666666667	0.4366666666666667	0.5	0	v3	2026-05-25 13:11:35.971
2280	71	18	0.44333333333333336	0.4633333333333334	0.43333333333333335	0.43333333333333335	0.5	0	v3	2026-05-25 13:11:35.971
2281	71	19	0.47000000000000003	0.49000000000000005	0.46	0.46	0.5	0	v3	2026-05-25 13:11:35.971
2282	71	20	0.4733333333333334	0.4933333333333334	0.4633333333333334	0.4633333333333334	0.5	0	v3	2026-05-25 13:11:35.971
2283	71	21	0.4400000000000001	0.4600000000000001	0.43000000000000005	0.43000000000000005	0.5	0	v3	2026-05-25 13:11:35.971
2284	71	22	0.4400000000000001	0.4600000000000001	0.43000000000000005	0.43000000000000005	0.5	0	v3	2026-05-25 13:11:35.971
2285	71	23	0.45	0.47000000000000003	0.44	0.44	0.5	0	v3	2026-05-25 13:11:35.971
2286	71	24	0.49666666666666676	0.4966666666666667	0.4966666666666667	0.4966666666666667	0.5	0	v3	2026-05-25 13:11:35.971
2287	71	25	0.5	0.5	0.5	0.5	0.5	0	v3	2026-05-25 13:11:35.971
2288	71	26	0.48666666666666664	0.4866666666666667	0.4866666666666667	0.4866666666666667	0.5	0	v3	2026-05-25 13:11:35.971
2289	71	27	0.49000000000000005	0.49000000000000005	0.49000000000000005	0.49000000000000005	0.5	0	v3	2026-05-25 13:11:35.971
2290	71	28	0.4666666666666666	0.4866666666666667	0.45666666666666667	0.45666666666666667	0.5	0	v3	2026-05-25 13:11:35.971
2291	71	29	0.4733333333333334	0.4933333333333334	0.4633333333333334	0.4633333333333334	0.5	0	v3	2026-05-25 13:11:35.971
2292	71	30	0.47000000000000003	0.49000000000000005	0.46	0.46	0.5	0	v3	2026-05-25 13:11:35.971
2293	71	31	0.4666666666666666	0.4866666666666667	0.45666666666666667	0.45666666666666667	0.5	0	v3	2026-05-25 13:11:35.971
2294	71	32	0.4566666666666667	0.4766666666666667	0.44666666666666666	0.44666666666666666	0.5	0	v3	2026-05-25 13:11:35.971
2295	71	33	0.45	0.47000000000000003	0.44	0.44	0.5	0	v3	2026-05-25 13:11:35.971
2296	71	34	0.4466666666666667	0.46666666666666673	0.4366666666666667	0.4366666666666667	0.5	0	v3	2026-05-25 13:11:35.971
2297	71	35	0.4400000000000001	0.4600000000000001	0.43000000000000005	0.43000000000000005	0.5	0	v3	2026-05-25 13:11:35.971
2298	71	36	0.4400000000000001	0.4600000000000001	0.43000000000000005	0.43000000000000005	0.5	0	v3	2026-05-25 13:11:35.971
2299	71	37	0.4633333333333334	0.4833333333333334	0.45333333333333337	0.45333333333333337	0.5	0	v3	2026-05-25 13:11:35.971
2300	71	38	0.4400000000000001	0.4366666666666667	0.47666666666666674	0.40666666666666673	0.5	0	v3	2026-05-25 13:11:35.971
2301	71	39	0.4400000000000001	0.4600000000000001	0.43000000000000005	0.43000000000000005	0.5	0	v3	2026-05-25 13:11:35.971
2302	71	40	0.49333333333333335	0.49333333333333335	0.49333333333333335	0.49333333333333335	0.5	0	v3	2026-05-25 13:11:35.971
2303	71	41	0.49666666666666676	0.4966666666666667	0.4966666666666667	0.4966666666666667	0.5	0	v3	2026-05-25 13:11:35.971
2304	71	42	0.5	0.5	0.5	0.5	0.5	0	v3	2026-05-25 13:11:35.971
2305	71	43	0.49666666666666676	0.4966666666666667	0.4966666666666667	0.4966666666666667	0.5	0	v3	2026-05-25 13:11:35.971
2306	71	44	0.49333333333333335	0.49333333333333335	0.49333333333333335	0.49333333333333335	0.5	0	v3	2026-05-25 13:11:35.971
2307	71	45	0.49000000000000005	0.49000000000000005	0.49000000000000005	0.49000000000000005	0.5	0	v3	2026-05-25 13:11:35.971
2308	71	46	0.48666666666666664	0.4866666666666667	0.4866666666666667	0.4866666666666667	0.5	0	v3	2026-05-25 13:11:35.971
2309	71	47	0.48	0.5	0.47000000000000003	0.47000000000000003	0.5	0	v3	2026-05-25 13:11:35.971
2310	71	48	0.4833333333333334	0.5033333333333334	0.4733333333333334	0.4733333333333334	0.5	0	v3	2026-05-25 13:11:35.971
2311	71	49	0.47666666666666674	0.4966666666666667	0.4666666666666667	0.4666666666666667	0.5	0	v3	2026-05-25 13:11:35.971
2312	71	50	0.4733333333333334	0.4933333333333334	0.4633333333333334	0.4633333333333334	0.5	0	v3	2026-05-25 13:11:35.971
2313	71	51	0.47000000000000003	0.49000000000000005	0.46	0.46	0.5	0	v3	2026-05-25 13:11:35.971
2314	71	52	0.4666666666666666	0.4866666666666667	0.45666666666666667	0.45666666666666667	0.5	0	v3	2026-05-25 13:11:35.971
2315	71	53	0.4633333333333334	0.4833333333333334	0.45333333333333337	0.45333333333333337	0.5	0	v3	2026-05-25 13:11:35.971
2316	71	54	0.46	0.48000000000000004	0.45	0.45	0.5	0	v3	2026-05-25 13:11:35.971
2317	71	55	0.45333333333333337	0.4733333333333334	0.44333333333333336	0.44333333333333336	0.5	0	v3	2026-05-25 13:11:35.971
2318	71	56	0.4466666666666667	0.46666666666666673	0.4366666666666667	0.4366666666666667	0.5	0	v3	2026-05-25 13:11:35.971
2319	71	57	0.44333333333333336	0.4633333333333334	0.43333333333333335	0.43333333333333335	0.5	0	v3	2026-05-25 13:11:35.971
2320	71	58	0.47000000000000003	0.49000000000000005	0.46	0.46	0.5	0	v3	2026-05-25 13:11:35.971
2321	71	59	0.4733333333333334	0.4933333333333334	0.4633333333333334	0.4633333333333334	0.5	0	v3	2026-05-25 13:11:35.971
2322	71	60	0.4400000000000001	0.4600000000000001	0.43000000000000005	0.43000000000000005	0.5	0	v3	2026-05-25 13:11:35.971
2323	71	61	0.4400000000000001	0.4600000000000001	0.43000000000000005	0.43000000000000005	0.5	0	v3	2026-05-25 13:11:35.971
2324	71	62	0.45	0.47000000000000003	0.44	0.44	0.5	0	v3	2026-05-25 13:11:35.971
2325	71	63	0.49666666666666676	0.4966666666666667	0.4966666666666667	0.4966666666666667	0.5	0	v3	2026-05-25 13:11:35.971
2326	71	64	0.5	0.5	0.5	0.5	0.5	0	v3	2026-05-25 13:11:35.971
2327	71	65	0.48666666666666664	0.4866666666666667	0.4866666666666667	0.4866666666666667	0.5	0	v3	2026-05-25 13:11:35.971
2328	71	66	0.49000000000000005	0.49000000000000005	0.49000000000000005	0.49000000000000005	0.5	0	v3	2026-05-25 13:11:35.971
2329	71	67	0.4666666666666666	0.4866666666666667	0.45666666666666667	0.45666666666666667	0.5	0	v3	2026-05-25 13:11:35.971
2330	71	68	0.4733333333333334	0.4933333333333334	0.4633333333333334	0.4633333333333334	0.5	0	v3	2026-05-25 13:11:35.971
2331	71	69	0.47000000000000003	0.49000000000000005	0.46	0.46	0.5	0	v3	2026-05-25 13:11:35.971
2332	71	70	0.4666666666666666	0.4866666666666667	0.45666666666666667	0.45666666666666667	0.5	0	v3	2026-05-25 13:11:35.971
2333	71	71	0.4566666666666667	0.4766666666666667	0.44666666666666666	0.44666666666666666	0.5	0	v3	2026-05-25 13:11:35.971
2334	71	72	0.45	0.47000000000000003	0.44	0.44	0.5	0	v3	2026-05-25 13:11:35.971
2335	71	73	0.4466666666666667	0.46666666666666673	0.4366666666666667	0.4366666666666667	0.5	0	v3	2026-05-25 13:11:35.971
2336	71	74	0.4400000000000001	0.4600000000000001	0.43000000000000005	0.43000000000000005	0.5	0	v3	2026-05-25 13:11:35.971
2337	71	75	0.4400000000000001	0.4600000000000001	0.43000000000000005	0.43000000000000005	0.5	0	v3	2026-05-25 13:11:35.971
2338	71	76	0.4633333333333334	0.4833333333333334	0.45333333333333337	0.45333333333333337	0.5	0	v3	2026-05-25 13:11:35.971
2339	71	77	0.4400000000000001	0.4366666666666667	0.47666666666666674	0.40666666666666673	0.5	0	v3	2026-05-25 13:11:35.971
2340	71	78	0.4400000000000001	0.4600000000000001	0.43000000000000005	0.43000000000000005	0.5	0	v3	2026-05-25 13:11:35.971
196	7	1	0.17266666666666666	0.15833333333333335	0.14633333333333334	0.21333333333333337	1	0	v3	2026-05-15 08:06:14.113
197	7	2	0.16933333333333334	0.155	0.143	0.21000000000000002	1	0	v3	2026-05-15 08:06:14.117
198	7	3	0.166	0.15166666666666667	0.13966666666666666	0.20666666666666667	1	0	v3	2026-05-15 08:06:14.123
199	7	4	0.16266666666666668	0.14833333333333334	0.13633333333333333	0.20333333333333337	1	0	v3	2026-05-15 08:06:14.126
200	7	5	0.15933333333333333	0.145	0.13299999999999998	0.2	1	0	v3	2026-05-15 08:06:14.13
201	7	6	0.156	0.14166666666666666	0.12966666666666665	0.19666666666666666	1	0	v3	2026-05-15 08:06:14.132
202	7	7	0.15266666666666667	0.13833333333333334	0.12633333333333333	0.19333333333333336	1	0	v3	2026-05-15 08:06:14.136
203	7	8	0.14600000000000005	0.1516666666666667	0.10966666666666669	0.1766666666666667	1	0	v3	2026-05-15 08:06:14.138
204	7	9	0.14933333333333335	0.15500000000000003	0.11300000000000003	0.18000000000000002	1	0	v3	2026-05-15 08:06:14.146
205	7	10	0.1426666666666667	0.14833333333333334	0.10633333333333334	0.17333333333333334	1	0	v3	2026-05-15 08:06:14.148
206	7	11	0.13933333333333334	0.14500000000000002	0.10300000000000001	0.17	1	0	v3	2026-05-15 08:06:14.15
207	7	12	0.136	0.1416666666666667	0.09966666666666668	0.16666666666666669	1	0	v3	2026-05-15 08:06:14.151
208	7	13	0.13266666666666668	0.13833333333333334	0.09633333333333333	0.16333333333333333	1	0	v3	2026-05-15 08:06:14.154
209	7	14	0.12933333333333338	0.13500000000000004	0.09300000000000003	0.16000000000000003	1	0	v3	2026-05-15 08:06:14.156
210	7	15	0.126	0.13166666666666668	0.08966666666666667	0.15666666666666668	1	0	v3	2026-05-15 08:06:14.157
211	7	16	0.11933333333333333	0.125	0.083	0.15	1	0	v3	2026-05-15 08:06:14.159
212	7	17	0.11266666666666669	0.11833333333333335	0.07633333333333335	0.14333333333333334	1	0	v3	2026-05-15 08:06:14.162
213	7	18	0.10933333333333334	0.115	0.07300000000000001	0.14	1	0	v3	2026-05-15 08:06:14.164
214	7	19	0.136	0.1416666666666667	0.09966666666666668	0.16666666666666669	1	0	v3	2026-05-15 08:06:14.166
215	7	20	0.13933333333333334	0.14500000000000002	0.10300000000000001	0.17	1	0	v3	2026-05-15 08:06:14.167
216	7	21	0.106	0.11166666666666666	0.06966666666666667	0.13666666666666666	1	0	v3	2026-05-15 08:06:14.169
217	7	22	0.106	0.11166666666666666	0.06966666666666667	0.13666666666666666	1	0	v3	2026-05-15 08:06:14.171
218	7	23	0.11599999999999999	0.12166666666666666	0.07966666666666666	0.14666666666666667	1	0	v3	2026-05-15 08:06:14.173
219	7	24	0.16933333333333334	0.155	0.143	0.21000000000000002	1	0	v3	2026-05-15 08:06:14.174
220	7	25	0.166	0.15166666666666667	0.13966666666666666	0.20666666666666667	1	0	v3	2026-05-15 08:06:14.176
221	7	26	0.15266666666666667	0.13833333333333334	0.12633333333333333	0.19333333333333336	1	0	v3	2026-05-15 08:06:14.178
222	7	27	0.156	0.14166666666666666	0.12966666666666665	0.19666666666666666	1	0	v3	2026-05-15 08:06:14.18
223	7	28	0.13266666666666668	0.13833333333333334	0.09633333333333333	0.16333333333333333	1	0	v3	2026-05-15 08:06:14.182
224	7	29	0.13933333333333334	0.14500000000000002	0.10300000000000001	0.17	1	0	v3	2026-05-15 08:06:14.184
225	7	30	0.136	0.1416666666666667	0.09966666666666668	0.16666666666666669	1	0	v3	2026-05-15 08:06:14.186
226	7	31	0.13266666666666668	0.13833333333333334	0.09633333333333333	0.16333333333333333	1	0	v3	2026-05-15 08:06:14.187
227	7	32	0.12266666666666669	0.12833333333333335	0.08633333333333335	0.15333333333333335	1	0	v3	2026-05-15 08:06:14.189
228	7	33	0.11599999999999999	0.12166666666666666	0.07966666666666666	0.14666666666666667	1	0	v3	2026-05-15 08:06:14.191
229	7	34	0.11266666666666669	0.11833333333333335	0.07633333333333335	0.14333333333333334	1	0	v3	2026-05-15 08:06:14.192
230	7	35	0.106	0.11166666666666666	0.06966666666666667	0.13666666666666666	1	0	v3	2026-05-15 08:06:14.197
231	7	36	0.106	0.11166666666666666	0.06966666666666667	0.13666666666666666	1	0	v3	2026-05-15 08:06:14.199
232	7	37	0.12933333333333338	0.13500000000000004	0.09300000000000003	0.16000000000000003	1	0	v3	2026-05-15 08:06:14.201
233	7	38	0.10600000000000002	0.08833333333333333	0.11633333333333336	0.11333333333333334	1	0	v3	2026-05-15 08:06:14.202
234	7	39	0.106	0.11166666666666666	0.06966666666666667	0.13666666666666666	1	0	v3	2026-05-15 08:06:14.204
352	8	1	0.48666666666666664	0.47500000000000003	0.467	0.518	1	0	v3	2026-05-15 08:24:53.038
353	8	2	0.49000000000000005	0.4783333333333334	0.4703333333333334	0.5213333333333333	1	0	v3	2026-05-15 08:24:53.04
354	8	3	0.49333333333333335	0.4816666666666667	0.4736666666666667	0.5246666666666666	1	0	v3	2026-05-15 08:24:53.042
355	8	4	0.49000000000000005	0.4783333333333334	0.4703333333333334	0.5213333333333333	1	0	v3	2026-05-15 08:24:53.045
356	8	5	0.5766666666666667	0.5525	0.5820000000000001	0.5955	1	0.16666666666666666	v3	2026-05-15 08:24:53.048
357	8	6	0.4833333333333334	0.47166666666666673	0.4636666666666667	0.5146666666666667	1	0	v3	2026-05-15 08:24:53.054
358	8	7	0.48	0.4683333333333334	0.46033333333333337	0.5113333333333333	1	0	v3	2026-05-15 08:24:53.059
359	8	8	0.47333333333333333	0.4816666666666667	0.4436666666666667	0.4946666666666667	1	0	v3	2026-05-15 08:24:53.062
360	8	9	0.47666666666666674	0.48500000000000004	0.44700000000000006	0.498	1	0	v3	2026-05-15 08:24:53.07
361	8	10	0.47000000000000003	0.47833333333333333	0.44033333333333335	0.4913333333333333	1	0	v3	2026-05-15 08:24:53.073
362	8	11	0.46666666666666673	0.47500000000000003	0.43700000000000006	0.488	1	0	v3	2026-05-15 08:24:53.075
363	8	12	0.4633333333333334	0.4716666666666667	0.4336666666666667	0.4846666666666667	1	0	v3	2026-05-15 08:24:53.077
364	8	13	0.46	0.4683333333333333	0.43033333333333335	0.48133333333333334	1	0	v3	2026-05-15 08:24:53.079
365	8	14	0.4566666666666667	0.465	0.42700000000000005	0.47800000000000004	1	0	v3	2026-05-15 08:24:53.081
366	8	15	0.4533333333333333	0.46166666666666667	0.4236666666666667	0.4746666666666667	1	0	v3	2026-05-15 08:24:53.082
367	8	16	0.4466666666666667	0.455	0.41700000000000004	0.468	1	0	v3	2026-05-15 08:24:53.084
368	8	17	0.44	0.44833333333333336	0.4103333333333334	0.4613333333333334	1	0	v3	2026-05-15 08:24:53.086
369	8	18	0.4366666666666667	0.445	0.40700000000000003	0.458	1	0	v3	2026-05-15 08:24:53.089
370	8	19	0.4633333333333334	0.4716666666666667	0.4336666666666667	0.4846666666666667	1	0	v3	2026-05-15 08:24:53.09
371	8	20	0.46666666666666673	0.47500000000000003	0.43700000000000006	0.488	1	0	v3	2026-05-15 08:24:53.092
372	8	21	0.48666666666666664	0.48944444444444446	0.46811111111111114	0.5024444444444445	1	0.05555555555555555	v3	2026-05-15 08:24:53.094
373	8	22	0.4333333333333334	0.4416666666666667	0.40366666666666673	0.4546666666666667	1	0	v3	2026-05-15 08:24:53.095
374	8	23	0.44333333333333336	0.45166666666666666	0.4136666666666667	0.4646666666666667	1	0	v3	2026-05-15 08:24:53.097
375	8	24	0.49000000000000005	0.4783333333333334	0.4703333333333334	0.5213333333333333	1	0	v3	2026-05-15 08:24:53.099
376	8	25	0.49333333333333335	0.4816666666666667	0.4736666666666667	0.5246666666666666	1	0	v3	2026-05-15 08:24:53.101
377	8	26	0.48	0.4683333333333334	0.46033333333333337	0.5113333333333333	1	0	v3	2026-05-15 08:24:53.102
378	8	27	0.4833333333333334	0.47166666666666673	0.4636666666666667	0.5146666666666667	1	0	v3	2026-05-15 08:24:53.104
379	8	28	0.46	0.4683333333333333	0.43033333333333335	0.48133333333333334	1	0	v3	2026-05-15 08:24:53.108
380	8	29	0.46666666666666673	0.47500000000000003	0.43700000000000006	0.488	1	0	v3	2026-05-15 08:24:53.111
381	8	30	0.4633333333333334	0.4716666666666667	0.4336666666666667	0.4846666666666667	1	0	v3	2026-05-15 08:24:53.115
382	8	31	0.46	0.4683333333333333	0.43033333333333335	0.48133333333333334	1	0	v3	2026-05-15 08:24:53.121
383	8	32	0.45	0.4583333333333333	0.42033333333333334	0.4713333333333333	1	0	v3	2026-05-15 08:24:53.125
384	8	33	0.44333333333333336	0.45166666666666666	0.4136666666666667	0.4646666666666667	1	0	v3	2026-05-15 08:24:53.129
385	8	34	0.44	0.44833333333333336	0.4103333333333334	0.4613333333333334	1	0	v3	2026-05-15 08:24:53.132
386	8	35	0.4333333333333334	0.4416666666666667	0.40366666666666673	0.4546666666666667	1	0	v3	2026-05-15 08:24:53.135
387	8	36	0.4333333333333334	0.4416666666666667	0.40366666666666673	0.4546666666666667	1	0	v3	2026-05-15 08:24:53.139
388	8	37	0.4566666666666667	0.465	0.42700000000000005	0.47800000000000004	1	0	v3	2026-05-15 08:24:53.142
389	8	38	0.43333333333333335	0.4183333333333334	0.45033333333333336	0.4313333333333334	1	0	v3	2026-05-15 08:24:53.145
390	8	39	0.4333333333333334	0.4416666666666667	0.40366666666666673	0.4546666666666667	1	0	v3	2026-05-15 08:24:53.148
1328	18	2	0.4993333333333334	0.46	0.519	0.519	1	0	v3	2026-05-18 12:44:12.91
1329	18	3	0.5026666666666667	0.4633333333333333	0.5223333333333333	0.5223333333333333	1	0	v3	2026-05-18 12:44:12.916
1330	18	4	0.4993333333333334	0.46	0.519	0.519	1	0	v3	2026-05-18 12:44:12.921
1331	18	5	0.496	0.45666666666666667	0.5156666666666667	0.5156666666666667	1	0	v3	2026-05-18 12:44:12.926
1332	18	6	0.49266666666666675	0.45333333333333337	0.5123333333333334	0.5123333333333334	1	0	v3	2026-05-18 12:44:12.932
1333	18	7	0.48933333333333334	0.45	0.509	0.509	1	0	v3	2026-05-18 12:44:12.943
1334	18	8	0.48266666666666674	0.4633333333333334	0.4923333333333334	0.4923333333333334	1	0	v3	2026-05-18 12:44:12.949
1335	18	9	0.48600000000000004	0.46666666666666673	0.49566666666666676	0.49566666666666676	1	0	v3	2026-05-18 12:44:12.955
1336	18	10	0.4793333333333334	0.46	0.48900000000000005	0.48900000000000005	1	0	v3	2026-05-18 12:44:12.961
1337	18	11	0.47600000000000003	0.4566666666666667	0.48566666666666675	0.48566666666666675	1	0	v3	2026-05-18 12:44:12.968
1338	18	12	0.47266666666666673	0.45333333333333337	0.4823333333333334	0.4823333333333334	1	0	v3	2026-05-18 12:44:12.991
1339	18	13	0.4693333333333334	0.45	0.47900000000000004	0.47900000000000004	1	0	v3	2026-05-18 12:44:12.998
1340	18	14	0.466	0.4466666666666667	0.47566666666666674	0.47566666666666674	1	0	v3	2026-05-18 12:44:13.003
1341	18	15	0.4626666666666667	0.44333333333333336	0.4723333333333334	0.4723333333333334	1	0	v3	2026-05-18 12:44:13.008
1342	18	16	0.456	0.4366666666666667	0.46566666666666673	0.46566666666666673	1	0	v3	2026-05-18 12:44:13.012
1344	18	18	0.446	0.4266666666666667	0.4556666666666667	0.4556666666666667	1	0	v3	2026-05-18 12:44:13.023
1345	18	19	0.47266666666666673	0.45333333333333337	0.4823333333333334	0.4823333333333334	1	0	v3	2026-05-18 12:44:13.028
1346	18	20	0.47600000000000003	0.4566666666666667	0.48566666666666675	0.48566666666666675	1	0	v3	2026-05-18 12:44:13.033
1347	18	21	0.44266666666666676	0.4233333333333334	0.4523333333333334	0.4523333333333334	1	0	v3	2026-05-18 12:44:13.038
1348	18	22	0.44266666666666676	0.4233333333333334	0.4523333333333334	0.4523333333333334	1	0	v3	2026-05-18 12:44:13.043
1349	18	23	0.4526666666666667	0.43333333333333335	0.4623333333333334	0.4623333333333334	1	0	v3	2026-05-18 12:44:13.047
1350	18	24	0.4993333333333334	0.46	0.519	0.519	1	0	v3	2026-05-18 12:44:13.053
1351	18	25	0.5026666666666667	0.4633333333333333	0.5223333333333333	0.5223333333333333	1	0	v3	2026-05-18 12:44:13.057
1352	18	26	0.48933333333333334	0.45	0.509	0.509	1	0	v3	2026-05-18 12:44:13.062
1353	18	27	0.49266666666666675	0.45333333333333337	0.5123333333333334	0.5123333333333334	1	0	v3	2026-05-18 12:44:13.067
1354	18	28	0.4693333333333334	0.45	0.47900000000000004	0.47900000000000004	1	0	v3	2026-05-18 12:44:13.071
1355	18	29	0.47600000000000003	0.4566666666666667	0.48566666666666675	0.48566666666666675	1	0	v3	2026-05-18 12:44:13.075
1356	18	30	0.47266666666666673	0.45333333333333337	0.4823333333333334	0.4823333333333334	1	0	v3	2026-05-18 12:44:13.084
1357	18	31	0.4693333333333334	0.45	0.47900000000000004	0.47900000000000004	1	0	v3	2026-05-18 12:44:13.091
1358	18	32	0.5193333333333334	0.4916666666666667	0.5456666666666667	0.5206666666666667	1	0.1111111111111111	v3	2026-05-18 12:44:13.106
1359	18	33	0.4526666666666667	0.43333333333333335	0.4623333333333334	0.4623333333333334	1	0	v3	2026-05-18 12:44:13.117
1360	18	34	0.4493333333333334	0.43000000000000005	0.4590000000000001	0.4590000000000001	1	0	v3	2026-05-18 12:44:13.142
1362	18	36	0.44266666666666676	0.4233333333333334	0.4523333333333334	0.4523333333333334	1	0	v3	2026-05-18 12:44:13.154
1363	18	37	0.466	0.4466666666666667	0.47566666666666674	0.47566666666666674	1	0	v3	2026-05-18 12:44:13.159
1364	18	38	0.44266666666666676	0.4000000000000001	0.49900000000000005	0.42900000000000005	1	0	v3	2026-05-18 12:44:13.164
1365	18	39	0.44266666666666676	0.4233333333333334	0.4523333333333334	0.4523333333333334	1	0	v3	2026-05-18 12:44:13.168
1366	18	40	0.496	0.45666666666666667	0.5156666666666667	0.5156666666666667	1	0	v3	2026-05-18 12:44:13.173
1367	18	41	0.4993333333333334	0.46	0.519	0.519	1	0	v3	2026-05-18 12:44:13.177
1368	18	42	0.5026666666666667	0.4633333333333333	0.5223333333333333	0.5223333333333333	1	0	v3	2026-05-18 12:44:13.182
1369	18	43	0.4993333333333334	0.46	0.519	0.519	1	0	v3	2026-05-18 12:44:13.186
1370	18	44	0.496	0.45666666666666667	0.5156666666666667	0.5156666666666667	1	0	v3	2026-05-18 12:44:13.191
1371	18	45	0.49266666666666675	0.45333333333333337	0.5123333333333334	0.5123333333333334	1	0	v3	2026-05-18 12:44:13.196
1372	18	46	0.48933333333333334	0.45	0.509	0.509	1	0	v3	2026-05-18 12:44:13.2
1373	18	47	0.48266666666666674	0.4633333333333334	0.4923333333333334	0.4923333333333334	1	0	v3	2026-05-18 12:44:13.205
1374	18	48	0.48600000000000004	0.46666666666666673	0.49566666666666676	0.49566666666666676	1	0	v3	2026-05-18 12:44:13.21
1375	18	49	0.4793333333333334	0.46	0.48900000000000005	0.48900000000000005	1	0	v3	2026-05-18 12:44:13.214
1376	18	50	0.47600000000000003	0.4566666666666667	0.48566666666666675	0.48566666666666675	1	0	v3	2026-05-18 12:44:13.219
1377	18	51	0.47266666666666673	0.45333333333333337	0.4823333333333334	0.4823333333333334	1	0	v3	2026-05-18 12:44:13.224
1378	18	52	0.4693333333333334	0.45	0.47900000000000004	0.47900000000000004	1	0	v3	2026-05-18 12:44:13.228
1379	18	53	0.466	0.4466666666666667	0.47566666666666674	0.47566666666666674	1	0	v3	2026-05-18 12:44:13.232
1380	18	54	0.4626666666666667	0.44333333333333336	0.4723333333333334	0.4723333333333334	1	0	v3	2026-05-18 12:44:13.237
1381	18	55	0.456	0.4366666666666667	0.46566666666666673	0.46566666666666673	1	0	v3	2026-05-18 12:44:13.241
1382	18	56	0.4493333333333334	0.43000000000000005	0.4590000000000001	0.4590000000000001	1	0	v3	2026-05-18 12:44:13.245
1383	18	57	0.446	0.4266666666666667	0.4556666666666667	0.4556666666666667	1	0	v3	2026-05-18 12:44:13.249
1384	18	58	0.47266666666666673	0.45333333333333337	0.4823333333333334	0.4823333333333334	1	0	v3	2026-05-18 12:44:13.253
1385	18	59	0.47600000000000003	0.4566666666666667	0.48566666666666675	0.48566666666666675	1	0	v3	2026-05-18 12:44:13.258
1386	18	60	0.44266666666666676	0.4233333333333334	0.4523333333333334	0.4523333333333334	1	0	v3	2026-05-18 12:44:13.262
1387	18	61	0.44266666666666676	0.4233333333333334	0.4523333333333334	0.4523333333333334	1	0	v3	2026-05-18 12:44:13.267
1389	18	63	0.4993333333333334	0.46	0.519	0.519	1	0	v3	2026-05-18 12:44:13.278
1390	18	64	0.5026666666666667	0.4633333333333333	0.5223333333333333	0.5223333333333333	1	0	v3	2026-05-18 12:44:13.283
1391	18	65	0.48933333333333334	0.45	0.509	0.509	1	0	v3	2026-05-18 12:44:13.288
1392	18	66	0.49266666666666675	0.45333333333333337	0.5123333333333334	0.5123333333333334	1	0	v3	2026-05-18 12:44:13.293
1393	18	67	0.4693333333333334	0.45	0.47900000000000004	0.47900000000000004	1	0	v3	2026-05-18 12:44:13.298
1394	18	68	0.47600000000000003	0.4566666666666667	0.48566666666666675	0.48566666666666675	1	0	v3	2026-05-18 12:44:13.303
1395	18	69	0.47266666666666673	0.45333333333333337	0.4823333333333334	0.4823333333333334	1	0	v3	2026-05-18 12:44:13.308
1396	18	70	0.4693333333333334	0.45	0.47900000000000004	0.47900000000000004	1	0	v3	2026-05-18 12:44:13.313
1397	18	71	0.5193333333333334	0.4916666666666667	0.5456666666666667	0.5206666666666667	1	0.1111111111111111	v3	2026-05-18 12:44:13.318
1398	18	72	0.4526666666666667	0.43333333333333335	0.4623333333333334	0.4623333333333334	1	0	v3	2026-05-18 12:44:13.323
1399	18	73	0.4493333333333334	0.43000000000000005	0.4590000000000001	0.4590000000000001	1	0	v3	2026-05-18 12:44:13.329
1400	18	74	0.44266666666666676	0.4233333333333334	0.4523333333333334	0.4523333333333334	1	0	v3	2026-05-18 12:44:13.333
1401	18	75	0.44266666666666676	0.4233333333333334	0.4523333333333334	0.4523333333333334	1	0	v3	2026-05-18 12:44:13.341
1402	18	76	0.466	0.4466666666666667	0.47566666666666674	0.47566666666666674	1	0	v3	2026-05-18 12:44:13.346
1403	18	77	0.44266666666666676	0.4000000000000001	0.49900000000000005	0.42900000000000005	1	0	v3	2026-05-18 12:44:13.351
1404	18	78	0.44266666666666676	0.4233333333333334	0.4523333333333334	0.4523333333333334	1	0	v3	2026-05-18 12:44:13.356
1327	18	1	0.496	0.45666666666666667	0.5156666666666667	0.5156666666666667	1	0	v3	2026-05-18 12:44:12.902
1343	18	17	0.4493333333333334	0.43000000000000005	0.4590000000000001	0.4590000000000001	1	0	v3	2026-05-18 12:44:13.018
1361	18	35	0.44266666666666676	0.4233333333333334	0.4523333333333334	0.4523333333333334	1	0	v3	2026-05-18 12:44:13.149
1388	18	62	0.4526666666666667	0.43333333333333335	0.4623333333333334	0.4623333333333334	1	0	v3	2026-05-18 12:44:13.272
1552	20	70	0.24666666666666667	0.26666666666666666	0.23666666666666666	0.23666666666666666	0.25	0	v3	2026-05-18 15:50:48.989
1553	20	71	0.2366666666666667	0.2566666666666667	0.22666666666666668	0.22666666666666668	0.25	0	v3	2026-05-18 15:50:48.989
1554	20	72	0.22999999999999998	0.25	0.22	0.22	0.25	0	v3	2026-05-18 15:50:48.989
1555	20	73	0.22666666666666668	0.24666666666666667	0.21666666666666667	0.21666666666666667	0.25	0	v3	2026-05-18 15:50:48.989
1556	20	74	0.21999999999999997	0.24	0.21	0.21	0.25	0	v3	2026-05-18 15:50:48.989
1557	20	75	0.21999999999999997	0.24	0.21	0.21	0.25	0	v3	2026-05-18 15:50:48.989
1558	20	76	0.24333333333333332	0.26333333333333336	0.23333333333333334	0.23333333333333334	0.25	0	v3	2026-05-18 15:50:48.989
1559	20	77	0.22	0.21666666666666667	0.25666666666666665	0.18666666666666668	0.25	0	v3	2026-05-18 15:50:48.989
1560	20	78	0.21999999999999997	0.24	0.21	0.21	0.25	0	v3	2026-05-18 15:50:48.989
1561	21	1	0.2866666666666667	0.2866666666666667	0.2866666666666667	0.2866666666666667	0.25	0	v3	2026-05-18 20:17:09.468
1562	21	2	0.2833333333333333	0.2833333333333333	0.2833333333333333	0.2833333333333333	0.25	0	v3	2026-05-18 20:17:09.468
1563	21	3	0.28	0.28	0.28	0.28	0.25	0	v3	2026-05-18 20:17:09.468
1564	21	4	0.27666666666666667	0.27666666666666667	0.27666666666666667	0.27666666666666667	0.25	0	v3	2026-05-18 20:17:09.468
1565	21	5	0.2733333333333334	0.2733333333333334	0.2733333333333334	0.2733333333333334	0.25	0	v3	2026-05-18 20:17:09.468
1566	21	6	0.27	0.27	0.27	0.27	0.25	0	v3	2026-05-18 20:17:09.468
1567	21	7	0.2666666666666667	0.2666666666666667	0.2666666666666667	0.2666666666666667	0.25	0	v3	2026-05-18 20:17:09.468
1568	21	8	0.26	0.28	0.25	0.25	0.25	0	v3	2026-05-18 20:17:09.468
1569	21	9	0.26333333333333336	0.2833333333333334	0.25333333333333335	0.25333333333333335	0.25	0	v3	2026-05-18 20:17:09.468
1570	21	10	0.2566666666666667	0.2766666666666667	0.2466666666666667	0.2466666666666667	0.25	0	v3	2026-05-18 20:17:09.468
1571	21	11	0.25333333333333335	0.2733333333333334	0.24333333333333335	0.24333333333333335	0.25	0	v3	2026-05-18 20:17:09.468
1572	21	12	0.25	0.27	0.24	0.24	0.25	0	v3	2026-05-18 20:17:09.468
1573	21	13	0.24666666666666667	0.26666666666666666	0.23666666666666666	0.23666666666666666	0.25	0	v3	2026-05-18 20:17:09.468
1574	21	14	0.24333333333333332	0.26333333333333336	0.23333333333333334	0.23333333333333334	0.25	0	v3	2026-05-18 20:17:09.468
1575	21	15	0.24	0.26	0.23	0.23	0.25	0	v3	2026-05-18 20:17:09.468
1576	21	16	0.2333333333333333	0.25333333333333335	0.22333333333333333	0.22333333333333333	0.25	0	v3	2026-05-18 20:17:09.468
1577	21	17	0.22666666666666668	0.24666666666666667	0.21666666666666667	0.21666666666666667	0.25	0	v3	2026-05-18 20:17:09.468
1578	21	18	0.22333333333333336	0.24333333333333335	0.21333333333333335	0.21333333333333335	0.25	0	v3	2026-05-18 20:17:09.468
1579	21	19	0.25	0.27	0.24	0.24	0.25	0	v3	2026-05-18 20:17:09.468
1580	21	20	0.25333333333333335	0.2733333333333334	0.24333333333333335	0.24333333333333335	0.25	0	v3	2026-05-18 20:17:09.468
1581	21	21	0.21999999999999997	0.24	0.21	0.21	0.25	0	v3	2026-05-18 20:17:09.468
1582	21	22	0.21999999999999997	0.24	0.21	0.21	0.25	0	v3	2026-05-18 20:17:09.468
1583	21	23	0.22999999999999998	0.25	0.22	0.22	0.25	0	v3	2026-05-18 20:17:09.468
1584	21	24	0.2833333333333333	0.2833333333333333	0.2833333333333333	0.2833333333333333	0.25	0	v3	2026-05-18 20:17:09.468
1585	21	25	0.28	0.28	0.28	0.28	0.25	0	v3	2026-05-18 20:17:09.468
1586	21	26	0.2666666666666667	0.2666666666666667	0.2666666666666667	0.2666666666666667	0.25	0	v3	2026-05-18 20:17:09.468
1587	21	27	0.27	0.27	0.27	0.27	0.25	0	v3	2026-05-18 20:17:09.468
1588	21	28	0.24666666666666667	0.26666666666666666	0.23666666666666666	0.23666666666666666	0.25	0	v3	2026-05-18 20:17:09.468
1589	21	29	0.25333333333333335	0.2733333333333334	0.24333333333333335	0.24333333333333335	0.25	0	v3	2026-05-18 20:17:09.468
1590	21	30	0.25	0.27	0.24	0.24	0.25	0	v3	2026-05-18 20:17:09.468
1591	21	31	0.24666666666666667	0.26666666666666666	0.23666666666666666	0.23666666666666666	0.25	0	v3	2026-05-18 20:17:09.468
1592	21	32	0.2366666666666667	0.2566666666666667	0.22666666666666668	0.22666666666666668	0.25	0	v3	2026-05-18 20:17:09.468
1593	21	33	0.22999999999999998	0.25	0.22	0.22	0.25	0	v3	2026-05-18 20:17:09.468
1594	21	34	0.22666666666666668	0.24666666666666667	0.21666666666666667	0.21666666666666667	0.25	0	v3	2026-05-18 20:17:09.468
1595	21	35	0.21999999999999997	0.24	0.21	0.21	0.25	0	v3	2026-05-18 20:17:09.468
1596	21	36	0.21999999999999997	0.24	0.21	0.21	0.25	0	v3	2026-05-18 20:17:09.468
1597	21	37	0.24333333333333332	0.26333333333333336	0.23333333333333334	0.23333333333333334	0.25	0	v3	2026-05-18 20:17:09.468
1598	21	38	0.22	0.21666666666666667	0.25666666666666665	0.18666666666666668	0.25	0	v3	2026-05-18 20:17:09.468
1599	21	39	0.21999999999999997	0.24	0.21	0.21	0.25	0	v3	2026-05-18 20:17:09.468
1600	21	40	0.2866666666666667	0.2866666666666667	0.2866666666666667	0.2866666666666667	0.25	0	v3	2026-05-18 20:17:09.468
1601	21	41	0.2833333333333333	0.2833333333333333	0.2833333333333333	0.2833333333333333	0.25	0	v3	2026-05-18 20:17:09.468
1602	21	42	0.28	0.28	0.28	0.28	0.25	0	v3	2026-05-18 20:17:09.468
1603	21	43	0.27666666666666667	0.27666666666666667	0.27666666666666667	0.27666666666666667	0.25	0	v3	2026-05-18 20:17:09.468
1604	21	44	0.2733333333333334	0.2733333333333334	0.2733333333333334	0.2733333333333334	0.25	0	v3	2026-05-18 20:17:09.468
1605	21	45	0.27	0.27	0.27	0.27	0.25	0	v3	2026-05-18 20:17:09.468
1606	21	46	0.2666666666666667	0.2666666666666667	0.2666666666666667	0.2666666666666667	0.25	0	v3	2026-05-18 20:17:09.468
1607	21	47	0.26	0.28	0.25	0.25	0.25	0	v3	2026-05-18 20:17:09.468
1608	21	48	0.26333333333333336	0.2833333333333334	0.25333333333333335	0.25333333333333335	0.25	0	v3	2026-05-18 20:17:09.468
1609	21	49	0.2566666666666667	0.2766666666666667	0.2466666666666667	0.2466666666666667	0.25	0	v3	2026-05-18 20:17:09.468
1610	21	50	0.25333333333333335	0.2733333333333334	0.24333333333333335	0.24333333333333335	0.25	0	v3	2026-05-18 20:17:09.468
1611	21	51	0.25	0.27	0.24	0.24	0.25	0	v3	2026-05-18 20:17:09.468
1612	21	52	0.24666666666666667	0.26666666666666666	0.23666666666666666	0.23666666666666666	0.25	0	v3	2026-05-18 20:17:09.468
1613	21	53	0.24333333333333332	0.26333333333333336	0.23333333333333334	0.23333333333333334	0.25	0	v3	2026-05-18 20:17:09.468
1614	21	54	0.24	0.26	0.23	0.23	0.25	0	v3	2026-05-18 20:17:09.468
1615	21	55	0.2333333333333333	0.25333333333333335	0.22333333333333333	0.22333333333333333	0.25	0	v3	2026-05-18 20:17:09.468
1616	21	56	0.22666666666666668	0.24666666666666667	0.21666666666666667	0.21666666666666667	0.25	0	v3	2026-05-18 20:17:09.468
1617	21	57	0.22333333333333336	0.24333333333333335	0.21333333333333335	0.21333333333333335	0.25	0	v3	2026-05-18 20:17:09.468
1618	21	58	0.25	0.27	0.24	0.24	0.25	0	v3	2026-05-18 20:17:09.468
1619	21	59	0.25333333333333335	0.2733333333333334	0.24333333333333335	0.24333333333333335	0.25	0	v3	2026-05-18 20:17:09.468
1620	21	60	0.21999999999999997	0.24	0.21	0.21	0.25	0	v3	2026-05-18 20:17:09.468
1621	21	61	0.21999999999999997	0.24	0.21	0.21	0.25	0	v3	2026-05-18 20:17:09.468
1622	21	62	0.22999999999999998	0.25	0.22	0.22	0.25	0	v3	2026-05-18 20:17:09.468
1623	21	63	0.2833333333333333	0.2833333333333333	0.2833333333333333	0.2833333333333333	0.25	0	v3	2026-05-18 20:17:09.468
1624	21	64	0.28	0.28	0.28	0.28	0.25	0	v3	2026-05-18 20:17:09.468
1625	21	65	0.2666666666666667	0.2666666666666667	0.2666666666666667	0.2666666666666667	0.25	0	v3	2026-05-18 20:17:09.468
1626	21	66	0.27	0.27	0.27	0.27	0.25	0	v3	2026-05-18 20:17:09.468
1483	20	1	0.2866666666666667	0.2866666666666667	0.2866666666666667	0.2866666666666667	0.25	0	v3	2026-05-18 15:50:48.989
1484	20	2	0.2833333333333333	0.2833333333333333	0.2833333333333333	0.2833333333333333	0.25	0	v3	2026-05-18 15:50:48.989
1485	20	3	0.28	0.28	0.28	0.28	0.25	0	v3	2026-05-18 15:50:48.989
1486	20	4	0.27666666666666667	0.27666666666666667	0.27666666666666667	0.27666666666666667	0.25	0	v3	2026-05-18 15:50:48.989
1487	20	5	0.2733333333333334	0.2733333333333334	0.2733333333333334	0.2733333333333334	0.25	0	v3	2026-05-18 15:50:48.989
1488	20	6	0.27	0.27	0.27	0.27	0.25	0	v3	2026-05-18 15:50:48.989
1489	20	7	0.2666666666666667	0.2666666666666667	0.2666666666666667	0.2666666666666667	0.25	0	v3	2026-05-18 15:50:48.989
1490	20	8	0.26	0.28	0.25	0.25	0.25	0	v3	2026-05-18 15:50:48.989
1491	20	9	0.26333333333333336	0.2833333333333334	0.25333333333333335	0.25333333333333335	0.25	0	v3	2026-05-18 15:50:48.989
1492	20	10	0.2566666666666667	0.2766666666666667	0.2466666666666667	0.2466666666666667	0.25	0	v3	2026-05-18 15:50:48.989
1493	20	11	0.25333333333333335	0.2733333333333334	0.24333333333333335	0.24333333333333335	0.25	0	v3	2026-05-18 15:50:48.989
1494	20	12	0.25	0.27	0.24	0.24	0.25	0	v3	2026-05-18 15:50:48.989
1495	20	13	0.24666666666666667	0.26666666666666666	0.23666666666666666	0.23666666666666666	0.25	0	v3	2026-05-18 15:50:48.989
1496	20	14	0.24333333333333332	0.26333333333333336	0.23333333333333334	0.23333333333333334	0.25	0	v3	2026-05-18 15:50:48.989
1497	20	15	0.24	0.26	0.23	0.23	0.25	0	v3	2026-05-18 15:50:48.989
1498	20	16	0.2333333333333333	0.25333333333333335	0.22333333333333333	0.22333333333333333	0.25	0	v3	2026-05-18 15:50:48.989
1499	20	17	0.22666666666666668	0.24666666666666667	0.21666666666666667	0.21666666666666667	0.25	0	v3	2026-05-18 15:50:48.989
1500	20	18	0.22333333333333336	0.24333333333333335	0.21333333333333335	0.21333333333333335	0.25	0	v3	2026-05-18 15:50:48.989
1501	20	19	0.25	0.27	0.24	0.24	0.25	0	v3	2026-05-18 15:50:48.989
1502	20	20	0.25333333333333335	0.2733333333333334	0.24333333333333335	0.24333333333333335	0.25	0	v3	2026-05-18 15:50:48.989
1503	20	21	0.21999999999999997	0.24	0.21	0.21	0.25	0	v3	2026-05-18 15:50:48.989
1504	20	22	0.21999999999999997	0.24	0.21	0.21	0.25	0	v3	2026-05-18 15:50:48.989
1505	20	23	0.22999999999999998	0.25	0.22	0.22	0.25	0	v3	2026-05-18 15:50:48.989
1506	20	24	0.2833333333333333	0.2833333333333333	0.2833333333333333	0.2833333333333333	0.25	0	v3	2026-05-18 15:50:48.989
1507	20	25	0.28	0.28	0.28	0.28	0.25	0	v3	2026-05-18 15:50:48.989
1508	20	26	0.2666666666666667	0.2666666666666667	0.2666666666666667	0.2666666666666667	0.25	0	v3	2026-05-18 15:50:48.989
1509	20	27	0.27	0.27	0.27	0.27	0.25	0	v3	2026-05-18 15:50:48.989
1510	20	28	0.24666666666666667	0.26666666666666666	0.23666666666666666	0.23666666666666666	0.25	0	v3	2026-05-18 15:50:48.989
1511	20	29	0.25333333333333335	0.2733333333333334	0.24333333333333335	0.24333333333333335	0.25	0	v3	2026-05-18 15:50:48.989
1512	20	30	0.25	0.27	0.24	0.24	0.25	0	v3	2026-05-18 15:50:48.989
1513	20	31	0.24666666666666667	0.26666666666666666	0.23666666666666666	0.23666666666666666	0.25	0	v3	2026-05-18 15:50:48.989
1514	20	32	0.2366666666666667	0.2566666666666667	0.22666666666666668	0.22666666666666668	0.25	0	v3	2026-05-18 15:50:48.989
1515	20	33	0.22999999999999998	0.25	0.22	0.22	0.25	0	v3	2026-05-18 15:50:48.989
1516	20	34	0.22666666666666668	0.24666666666666667	0.21666666666666667	0.21666666666666667	0.25	0	v3	2026-05-18 15:50:48.989
1517	20	35	0.21999999999999997	0.24	0.21	0.21	0.25	0	v3	2026-05-18 15:50:48.989
1518	20	36	0.21999999999999997	0.24	0.21	0.21	0.25	0	v3	2026-05-18 15:50:48.989
1519	20	37	0.24333333333333332	0.26333333333333336	0.23333333333333334	0.23333333333333334	0.25	0	v3	2026-05-18 15:50:48.989
1520	20	38	0.22	0.21666666666666667	0.25666666666666665	0.18666666666666668	0.25	0	v3	2026-05-18 15:50:48.989
1521	20	39	0.21999999999999997	0.24	0.21	0.21	0.25	0	v3	2026-05-18 15:50:48.989
1522	20	40	0.2866666666666667	0.2866666666666667	0.2866666666666667	0.2866666666666667	0.25	0	v3	2026-05-18 15:50:48.989
1523	20	41	0.2833333333333333	0.2833333333333333	0.2833333333333333	0.2833333333333333	0.25	0	v3	2026-05-18 15:50:48.989
1524	20	42	0.28	0.28	0.28	0.28	0.25	0	v3	2026-05-18 15:50:48.989
1525	20	43	0.27666666666666667	0.27666666666666667	0.27666666666666667	0.27666666666666667	0.25	0	v3	2026-05-18 15:50:48.989
1526	20	44	0.2733333333333334	0.2733333333333334	0.2733333333333334	0.2733333333333334	0.25	0	v3	2026-05-18 15:50:48.989
1527	20	45	0.27	0.27	0.27	0.27	0.25	0	v3	2026-05-18 15:50:48.989
1528	20	46	0.2666666666666667	0.2666666666666667	0.2666666666666667	0.2666666666666667	0.25	0	v3	2026-05-18 15:50:48.989
1529	20	47	0.26	0.28	0.25	0.25	0.25	0	v3	2026-05-18 15:50:48.989
1530	20	48	0.26333333333333336	0.2833333333333334	0.25333333333333335	0.25333333333333335	0.25	0	v3	2026-05-18 15:50:48.989
1531	20	49	0.2566666666666667	0.2766666666666667	0.2466666666666667	0.2466666666666667	0.25	0	v3	2026-05-18 15:50:48.989
1532	20	50	0.25333333333333335	0.2733333333333334	0.24333333333333335	0.24333333333333335	0.25	0	v3	2026-05-18 15:50:48.989
1533	20	51	0.25	0.27	0.24	0.24	0.25	0	v3	2026-05-18 15:50:48.989
1534	20	52	0.24666666666666667	0.26666666666666666	0.23666666666666666	0.23666666666666666	0.25	0	v3	2026-05-18 15:50:48.989
1535	20	53	0.24333333333333332	0.26333333333333336	0.23333333333333334	0.23333333333333334	0.25	0	v3	2026-05-18 15:50:48.989
1536	20	54	0.24	0.26	0.23	0.23	0.25	0	v3	2026-05-18 15:50:48.989
1537	20	55	0.2333333333333333	0.25333333333333335	0.22333333333333333	0.22333333333333333	0.25	0	v3	2026-05-18 15:50:48.989
1538	20	56	0.22666666666666668	0.24666666666666667	0.21666666666666667	0.21666666666666667	0.25	0	v3	2026-05-18 15:50:48.989
1539	20	57	0.22333333333333336	0.24333333333333335	0.21333333333333335	0.21333333333333335	0.25	0	v3	2026-05-18 15:50:48.989
1540	20	58	0.25	0.27	0.24	0.24	0.25	0	v3	2026-05-18 15:50:48.989
1541	20	59	0.25333333333333335	0.2733333333333334	0.24333333333333335	0.24333333333333335	0.25	0	v3	2026-05-18 15:50:48.989
1542	20	60	0.21999999999999997	0.24	0.21	0.21	0.25	0	v3	2026-05-18 15:50:48.989
1543	20	61	0.21999999999999997	0.24	0.21	0.21	0.25	0	v3	2026-05-18 15:50:48.989
1544	20	62	0.22999999999999998	0.25	0.22	0.22	0.25	0	v3	2026-05-18 15:50:48.989
1545	20	63	0.2833333333333333	0.2833333333333333	0.2833333333333333	0.2833333333333333	0.25	0	v3	2026-05-18 15:50:48.989
1546	20	64	0.28	0.28	0.28	0.28	0.25	0	v3	2026-05-18 15:50:48.989
1547	20	65	0.2666666666666667	0.2666666666666667	0.2666666666666667	0.2666666666666667	0.25	0	v3	2026-05-18 15:50:48.989
1548	20	66	0.27	0.27	0.27	0.27	0.25	0	v3	2026-05-18 15:50:48.989
1549	20	67	0.24666666666666667	0.26666666666666666	0.23666666666666666	0.23666666666666666	0.25	0	v3	2026-05-18 15:50:48.989
1550	20	68	0.25333333333333335	0.2733333333333334	0.24333333333333335	0.24333333333333335	0.25	0	v3	2026-05-18 15:50:48.989
1551	20	69	0.25	0.27	0.24	0.24	0.25	0	v3	2026-05-18 15:50:48.989
1627	21	67	0.24666666666666667	0.26666666666666666	0.23666666666666666	0.23666666666666666	0.25	0	v3	2026-05-18 20:17:09.468
1628	21	68	0.25333333333333335	0.2733333333333334	0.24333333333333335	0.24333333333333335	0.25	0	v3	2026-05-18 20:17:09.468
1629	21	69	0.25	0.27	0.24	0.24	0.25	0	v3	2026-05-18 20:17:09.468
1630	21	70	0.24666666666666667	0.26666666666666666	0.23666666666666666	0.23666666666666666	0.25	0	v3	2026-05-18 20:17:09.468
1631	21	71	0.2366666666666667	0.2566666666666667	0.22666666666666668	0.22666666666666668	0.25	0	v3	2026-05-18 20:17:09.468
1632	21	72	0.22999999999999998	0.25	0.22	0.22	0.25	0	v3	2026-05-18 20:17:09.468
1633	21	73	0.22666666666666668	0.24666666666666667	0.21666666666666667	0.21666666666666667	0.25	0	v3	2026-05-18 20:17:09.468
1634	21	74	0.21999999999999997	0.24	0.21	0.21	0.25	0	v3	2026-05-18 20:17:09.468
1635	21	75	0.21999999999999997	0.24	0.21	0.21	0.25	0	v3	2026-05-18 20:17:09.468
1636	21	76	0.24333333333333332	0.26333333333333336	0.23333333333333334	0.23333333333333334	0.25	0	v3	2026-05-18 20:17:09.468
1637	21	77	0.22	0.21666666666666667	0.25666666666666665	0.18666666666666668	0.25	0	v3	2026-05-18 20:17:09.468
1638	21	78	0.21999999999999997	0.24	0.21	0.21	0.25	0	v3	2026-05-18 20:17:09.468
1639	22	1	0.2866666666666667	0.2866666666666667	0.2866666666666667	0.2866666666666667	0.25	0	v3	2026-05-19 11:46:52.209
1640	22	2	0.2833333333333333	0.2833333333333333	0.2833333333333333	0.2833333333333333	0.25	0	v3	2026-05-19 11:46:52.209
1641	22	3	0.28	0.28	0.28	0.28	0.25	0	v3	2026-05-19 11:46:52.209
1642	22	4	0.27666666666666667	0.27666666666666667	0.27666666666666667	0.27666666666666667	0.25	0	v3	2026-05-19 11:46:52.209
1643	22	5	0.2733333333333334	0.2733333333333334	0.2733333333333334	0.2733333333333334	0.25	0	v3	2026-05-19 11:46:52.209
1644	22	6	0.27	0.27	0.27	0.27	0.25	0	v3	2026-05-19 11:46:52.209
1645	22	7	0.2666666666666667	0.2666666666666667	0.2666666666666667	0.2666666666666667	0.25	0	v3	2026-05-19 11:46:52.209
1646	22	8	0.26	0.28	0.25	0.25	0.25	0	v3	2026-05-19 11:46:52.209
1647	22	9	0.26333333333333336	0.2833333333333334	0.25333333333333335	0.25333333333333335	0.25	0	v3	2026-05-19 11:46:52.209
1648	22	10	0.2566666666666667	0.2766666666666667	0.2466666666666667	0.2466666666666667	0.25	0	v3	2026-05-19 11:46:52.209
1649	22	11	0.25333333333333335	0.2733333333333334	0.24333333333333335	0.24333333333333335	0.25	0	v3	2026-05-19 11:46:52.209
1650	22	12	0.25	0.27	0.24	0.24	0.25	0	v3	2026-05-19 11:46:52.209
1651	22	13	0.24666666666666667	0.26666666666666666	0.23666666666666666	0.23666666666666666	0.25	0	v3	2026-05-19 11:46:52.209
1652	22	14	0.24333333333333332	0.26333333333333336	0.23333333333333334	0.23333333333333334	0.25	0	v3	2026-05-19 11:46:52.209
1653	22	15	0.24	0.26	0.23	0.23	0.25	0	v3	2026-05-19 11:46:52.209
1654	22	16	0.2333333333333333	0.25333333333333335	0.22333333333333333	0.22333333333333333	0.25	0	v3	2026-05-19 11:46:52.209
1655	22	17	0.22666666666666668	0.24666666666666667	0.21666666666666667	0.21666666666666667	0.25	0	v3	2026-05-19 11:46:52.209
1656	22	18	0.22333333333333336	0.24333333333333335	0.21333333333333335	0.21333333333333335	0.25	0	v3	2026-05-19 11:46:52.209
1657	22	19	0.25	0.27	0.24	0.24	0.25	0	v3	2026-05-19 11:46:52.209
1658	22	20	0.25333333333333335	0.2733333333333334	0.24333333333333335	0.24333333333333335	0.25	0	v3	2026-05-19 11:46:52.209
1659	22	21	0.21999999999999997	0.24	0.21	0.21	0.25	0	v3	2026-05-19 11:46:52.209
1660	22	22	0.21999999999999997	0.24	0.21	0.21	0.25	0	v3	2026-05-19 11:46:52.209
1661	22	23	0.22999999999999998	0.25	0.22	0.22	0.25	0	v3	2026-05-19 11:46:52.209
1662	22	24	0.2833333333333333	0.2833333333333333	0.2833333333333333	0.2833333333333333	0.25	0	v3	2026-05-19 11:46:52.209
1663	22	25	0.28	0.28	0.28	0.28	0.25	0	v3	2026-05-19 11:46:52.209
1664	22	26	0.2666666666666667	0.2666666666666667	0.2666666666666667	0.2666666666666667	0.25	0	v3	2026-05-19 11:46:52.209
1665	22	27	0.27	0.27	0.27	0.27	0.25	0	v3	2026-05-19 11:46:52.209
1666	22	28	0.24666666666666667	0.26666666666666666	0.23666666666666666	0.23666666666666666	0.25	0	v3	2026-05-19 11:46:52.209
1667	22	29	0.25333333333333335	0.2733333333333334	0.24333333333333335	0.24333333333333335	0.25	0	v3	2026-05-19 11:46:52.209
1668	22	30	0.25	0.27	0.24	0.24	0.25	0	v3	2026-05-19 11:46:52.209
1669	22	31	0.24666666666666667	0.26666666666666666	0.23666666666666666	0.23666666666666666	0.25	0	v3	2026-05-19 11:46:52.209
1670	22	32	0.2366666666666667	0.2566666666666667	0.22666666666666668	0.22666666666666668	0.25	0	v3	2026-05-19 11:46:52.209
1671	22	33	0.22999999999999998	0.25	0.22	0.22	0.25	0	v3	2026-05-19 11:46:52.209
1672	22	34	0.22666666666666668	0.24666666666666667	0.21666666666666667	0.21666666666666667	0.25	0	v3	2026-05-19 11:46:52.209
1673	22	35	0.21999999999999997	0.24	0.21	0.21	0.25	0	v3	2026-05-19 11:46:52.209
1674	22	36	0.21999999999999997	0.24	0.21	0.21	0.25	0	v3	2026-05-19 11:46:52.209
1675	22	37	0.24333333333333332	0.26333333333333336	0.23333333333333334	0.23333333333333334	0.25	0	v3	2026-05-19 11:46:52.209
1676	22	38	0.22	0.21666666666666667	0.25666666666666665	0.18666666666666668	0.25	0	v3	2026-05-19 11:46:52.209
1677	22	39	0.21999999999999997	0.24	0.21	0.21	0.25	0	v3	2026-05-19 11:46:52.209
1678	22	40	0.2866666666666667	0.2866666666666667	0.2866666666666667	0.2866666666666667	0.25	0	v3	2026-05-19 11:46:52.209
1679	22	41	0.2833333333333333	0.2833333333333333	0.2833333333333333	0.2833333333333333	0.25	0	v3	2026-05-19 11:46:52.209
1680	22	42	0.28	0.28	0.28	0.28	0.25	0	v3	2026-05-19 11:46:52.209
1681	22	43	0.27666666666666667	0.27666666666666667	0.27666666666666667	0.27666666666666667	0.25	0	v3	2026-05-19 11:46:52.209
1682	22	44	0.2733333333333334	0.2733333333333334	0.2733333333333334	0.2733333333333334	0.25	0	v3	2026-05-19 11:46:52.209
1683	22	45	0.27	0.27	0.27	0.27	0.25	0	v3	2026-05-19 11:46:52.209
1684	22	46	0.2666666666666667	0.2666666666666667	0.2666666666666667	0.2666666666666667	0.25	0	v3	2026-05-19 11:46:52.209
1685	22	47	0.26	0.28	0.25	0.25	0.25	0	v3	2026-05-19 11:46:52.209
1686	22	48	0.26333333333333336	0.2833333333333334	0.25333333333333335	0.25333333333333335	0.25	0	v3	2026-05-19 11:46:52.209
1687	22	49	0.2566666666666667	0.2766666666666667	0.2466666666666667	0.2466666666666667	0.25	0	v3	2026-05-19 11:46:52.209
1688	22	50	0.25333333333333335	0.2733333333333334	0.24333333333333335	0.24333333333333335	0.25	0	v3	2026-05-19 11:46:52.209
1689	22	51	0.25	0.27	0.24	0.24	0.25	0	v3	2026-05-19 11:46:52.209
1690	22	52	0.24666666666666667	0.26666666666666666	0.23666666666666666	0.23666666666666666	0.25	0	v3	2026-05-19 11:46:52.209
1691	22	53	0.24333333333333332	0.26333333333333336	0.23333333333333334	0.23333333333333334	0.25	0	v3	2026-05-19 11:46:52.209
1692	22	54	0.24	0.26	0.23	0.23	0.25	0	v3	2026-05-19 11:46:52.209
1693	22	55	0.2333333333333333	0.25333333333333335	0.22333333333333333	0.22333333333333333	0.25	0	v3	2026-05-19 11:46:52.209
1694	22	56	0.22666666666666668	0.24666666666666667	0.21666666666666667	0.21666666666666667	0.25	0	v3	2026-05-19 11:46:52.209
1695	22	57	0.22333333333333336	0.24333333333333335	0.21333333333333335	0.21333333333333335	0.25	0	v3	2026-05-19 11:46:52.209
1696	22	58	0.25	0.27	0.24	0.24	0.25	0	v3	2026-05-19 11:46:52.209
1697	22	59	0.25333333333333335	0.2733333333333334	0.24333333333333335	0.24333333333333335	0.25	0	v3	2026-05-19 11:46:52.209
1698	22	60	0.21999999999999997	0.24	0.21	0.21	0.25	0	v3	2026-05-19 11:46:52.209
1699	22	61	0.21999999999999997	0.24	0.21	0.21	0.25	0	v3	2026-05-19 11:46:52.209
1700	22	62	0.22999999999999998	0.25	0.22	0.22	0.25	0	v3	2026-05-19 11:46:52.209
1701	22	63	0.2833333333333333	0.2833333333333333	0.2833333333333333	0.2833333333333333	0.25	0	v3	2026-05-19 11:46:52.209
1702	22	64	0.28	0.28	0.28	0.28	0.25	0	v3	2026-05-19 11:46:52.209
1703	22	65	0.2666666666666667	0.2666666666666667	0.2666666666666667	0.2666666666666667	0.25	0	v3	2026-05-19 11:46:52.209
1704	22	66	0.27	0.27	0.27	0.27	0.25	0	v3	2026-05-19 11:46:52.209
1705	22	67	0.24666666666666667	0.26666666666666666	0.23666666666666666	0.23666666666666666	0.25	0	v3	2026-05-19 11:46:52.209
1706	22	68	0.25333333333333335	0.2733333333333334	0.24333333333333335	0.24333333333333335	0.25	0	v3	2026-05-19 11:46:52.209
1707	22	69	0.25	0.27	0.24	0.24	0.25	0	v3	2026-05-19 11:46:52.209
1708	22	70	0.24666666666666667	0.26666666666666666	0.23666666666666666	0.23666666666666666	0.25	0	v3	2026-05-19 11:46:52.209
1709	22	71	0.2366666666666667	0.2566666666666667	0.22666666666666668	0.22666666666666668	0.25	0	v3	2026-05-19 11:46:52.209
1710	22	72	0.22999999999999998	0.25	0.22	0.22	0.25	0	v3	2026-05-19 11:46:52.209
1711	22	73	0.22666666666666668	0.24666666666666667	0.21666666666666667	0.21666666666666667	0.25	0	v3	2026-05-19 11:46:52.209
1712	22	74	0.21999999999999997	0.24	0.21	0.21	0.25	0	v3	2026-05-19 11:46:52.209
1713	22	75	0.21999999999999997	0.24	0.21	0.21	0.25	0	v3	2026-05-19 11:46:52.209
1714	22	76	0.24333333333333332	0.26333333333333336	0.23333333333333334	0.23333333333333334	0.25	0	v3	2026-05-19 11:46:52.209
1715	22	77	0.22	0.21666666666666667	0.25666666666666665	0.18666666666666668	0.25	0	v3	2026-05-19 11:46:52.209
1716	22	78	0.21999999999999997	0.24	0.21	0.21	0.25	0	v3	2026-05-19 11:46:52.209
\.


--
-- Data for Name: user_vocabulary; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.user_vocabulary (id, user_id, language_code, term, source, topic_id, mastery, native_translation, learner_description, description_cefr_band, native_language_code, created_at, updated_at) FROM stdin;
243	18	en	buoyancy	lesson_key_vocabulary	\N	0.12	плавучість	The ability of an object to float in water or air. It is the force that keeps things from sinking.	B1	uk	2026-05-24 09:58:23.631	2026-05-24 09:58:23.631
244	18	en	hesitant	lesson_key_vocabulary	\N	0.12	вагання	Feeling unsure or slow to act because you are nervous or not confident. You might stop before doing something.	B1	uk	2026-05-24 09:58:23.635	2026-05-24 09:58:23.635
245	18	en	nonsense	lesson_key_vocabulary	\N	0.12	нісенітниця	Words or ideas that have no meaning or are not true. It is something silly that makes no sense.	B1	uk	2026-05-24 09:58:23.638	2026-05-24 09:58:23.638
246	18	en	trophy	lesson_key_vocabulary	\N	0.12	трофей	A prize, such as a gold cup, given to a winner of a competition. It shows that someone has achieved something great.	B1	uk	2026-05-24 09:58:23.64	2026-05-24 09:58:23.64
247	18	en	cautious	lesson_key_vocabulary	\N	0.12	обережний	Being very careful to avoid danger or mistakes. A cautious person thinks before they act.	B1	uk	2026-05-24 09:58:23.642	2026-05-24 09:58:23.642
248	18	en	inflatable	lesson_key_vocabulary	\N	0.12	надувний	Something that needs to be filled with air before it can be used. For example, a beach ball is inflatable.	B1	uk	2026-05-24 09:58:23.645	2026-05-24 09:58:23.645
249	18	en	etiquette	lesson_key_vocabulary	\N	0.12	етикет	The set of rules for polite behavior in society. It tells you how to act correctly in different situations.	B1	uk	2026-05-24 09:58:23.648	2026-05-24 09:58:23.648
250	18	en	underwater	lesson_key_vocabulary	\N	0.12	підводний	Existing, happening, or used below the surface of the water. Fish and divers spend time underwater.	B1	uk	2026-05-24 09:58:23.65	2026-05-24 09:58:23.65
251	18	en	grown-up	lesson_key_vocabulary	\N	0.12	дорослий	An adult person. It can also describe behavior that is mature and responsible.	B1	uk	2026-05-24 09:58:23.653	2026-05-24 09:58:23.653
252	18	en	splash	lesson_key_vocabulary	\N	0.12	плескіт	The sound or movement of liquid hitting a surface. It happens when something falls into water.	B1	uk	2026-05-24 09:58:23.655	2026-05-24 09:58:23.655
274	18	en	flush	lesson_key_vocabulary	\N	0.12	\N	A group of birds that have suddenly started up from undergrowth, trees etc.	B1	uk	2026-05-25 15:25:05.717	2026-05-25 15:25:05.717
275	18	en	procure	lesson_key_vocabulary	\N	0.12	Закупівлі	To acquire or obtain.	B1	uk	2026-05-25 15:25:05.734	2026-05-25 15:25:05.734
276	18	en	commence	lesson_key_vocabulary	\N	0.12	\N	To begin, start.	B1	uk	2026-05-25 15:25:05.745	2026-05-25 15:25:05.745
277	18	en	pretense	lesson_key_vocabulary	\N	0.12	Претензійність	A false or hypocritical profession	B1	uk	2026-05-25 15:25:05.753	2026-05-25 15:25:05.753
278	18	en	mortgage	lesson_key_vocabulary	\N	0.12	Застава	A special form of secured loan where the purpose of the loan must be specified to the lender, to purchase assets that must be fixed (not movable) property, such as a house or piece of farm land. The assets are registere…	B1	uk	2026-05-25 15:25:05.762	2026-05-25 15:25:05.762
279	18	en	passive	lesson_key_vocabulary	\N	0.12	Пасивна	(grammar) The passive voice of verbs.	B1	uk	2026-05-25 15:25:05.77	2026-05-25 15:25:05.77
280	18	en	exceptional	lesson_key_vocabulary	\N	0.12	Виняткова	An exception, or something having an exceptional value	B1	uk	2026-05-25 15:25:05.777	2026-05-25 15:25:05.777
281	18	en	signify	lesson_key_vocabulary	\N	0.12	\N	To create a sign out of something.	B1	uk	2026-05-25 15:25:05.784	2026-05-25 15:25:05.784
282	18	en	luxuriate	lesson_key_vocabulary	\N	0.12	Розкішні	To enjoy luxury, to indulge.	B1	uk	2026-05-25 15:25:05.797	2026-05-25 15:25:05.797
283	18	en	righteous	lesson_key_vocabulary	\N	0.12	Праведний	To make righteous; specifically, to justify religiously, to absolve from sin.	B1	uk	2026-05-25 15:25:05.806	2026-05-25 15:25:05.806
81	22	en	incompetence	lesson_key_vocabulary	\N	0.12	\N	This is the lack of skill or ability to do a job or task correctly.	\N	\N	2026-05-19 11:51:20.783	2026-05-19 11:51:20.783
82	22	en	unpredictable	lesson_key_vocabulary	\N	0.12	\N	Something that changes often and cannot be known or guessed before it happens.	\N	\N	2026-05-19 11:51:20.791	2026-05-19 11:51:20.791
83	22	en	exclusive	lesson_key_vocabulary	\N	0.12	\N	Something limited to a specific group of people and not shared with everyone.	\N	\N	2026-05-19 11:51:20.796	2026-05-19 11:51:20.796
84	22	en	inadequate	lesson_key_vocabulary	\N	0.12	\N	Not enough in quantity or not good enough in quality for a specific purpose.	\N	\N	2026-05-19 11:51:20.8	2026-05-19 11:51:20.8
85	22	en	errands	lesson_key_vocabulary	\N	0.12	\N	Short trips you take to do necessary tasks, like buying groceries or going to the post office.	\N	\N	2026-05-19 11:51:20.805	2026-05-19 11:51:20.805
86	22	en	couture	lesson_key_vocabulary	\N	0.12	\N	The design and production of very expensive, high-quality, and fashionable clothing.	\N	\N	2026-05-19 11:51:20.81	2026-05-19 11:51:20.81
87	22	en	mock-up	lesson_key_vocabulary	\N	0.12	\N	A model or a copy of something used to show how it will look or work before it is finished.	\N	\N	2026-05-19 11:51:20.814	2026-05-19 11:51:20.814
88	22	en	exploitation	lesson_key_vocabulary	\N	0.12	\N	The act of using someone or something unfairly for your own benefit or profit.	\N	\N	2026-05-19 11:51:20.816	2026-05-19 11:51:20.816
89	22	en	sharp	lesson_key_vocabulary	\N	0.12	\N	Having a very thin edge or point that can cut things easily. It can also mean quick to understand things.	\N	\N	2026-05-19 11:51:20.819	2026-05-19 11:51:20.819
90	22	en	disregard	lesson_key_vocabulary	\N	0.12	\N	To ignore something or treat it as if it is not important.	\N	\N	2026-05-19 11:51:20.821	2026-05-19 11:51:20.821
253	18	en	Ron	video	\N	0	Рон	A common male first name, often used as a short form of Ronald.	\N	\N	2026-05-25 05:57:59.169	2026-05-25 05:57:59.169
284	18	en	hey	lesson_key_vocabulary	\N	0.12	Привіт	A friendly and informal way to say hello to someone you know.	B1	uk	2026-05-25 15:33:30.287	2026-05-25 15:33:30.287
285	18	en	through	lesson_key_vocabulary	\N	0.12	Крізь	Moving from one side of something to the other side.	B1	uk	2026-05-25 15:33:30.296	2026-05-25 15:33:30.296
286	18	en	looking	lesson_key_vocabulary	\N	0.12	Дивлячись	Directing your eyes toward something to see it.	B1	uk	2026-05-25 15:33:30.305	2026-05-25 15:33:30.305
287	18	en	glasses	lesson_key_vocabulary	\N	0.12	Окуляри	An object with two lenses that you wear on your face to help you see better.	B1	uk	2026-05-25 15:33:30.312	2026-05-25 15:33:30.312
288	18	en	okay	lesson_key_vocabulary	\N	0.12	Добре	A word used to show that you agree with something or that you are fine.	B1	uk	2026-05-25 15:33:30.319	2026-05-25 15:33:30.319
92	18	en	benchmark	lesson_key_vocabulary	\N	0.12	еталон	A standard or point of reference against which things may be compared or assessed.	B1	uk	2026-05-19 13:04:55.806	2026-05-21 13:34:32.21
289	18	en	pal	lesson_key_vocabulary	\N	0.12	Друг	An informal word for a close friend.	B1	uk	2026-05-25 15:33:30.325	2026-05-25 15:33:30.325
94	18	en	publicity	lesson_key_vocabulary	\N	0.12	публічність	The notice or attention given to someone or something by the media.	B1	uk	2026-05-19 13:04:55.821	2026-05-21 13:34:32.215
96	18	en	capital	lesson_key_vocabulary	\N	0.12	капітал	Wealth in the form of money or other assets owned by a person or organization.	B1	uk	2026-05-19 13:04:55.834	2026-05-21 13:34:32.22
97	18	en	reinvent	lesson_key_vocabulary	\N	0.12	винаходити заново	To change something so much that it appears to be entirely new.	B1	uk	2026-05-19 13:04:55.841	2026-05-21 13:34:32.225
98	18	en	objection	lesson_key_vocabulary	\N	0.12	заперечення	An expression or feeling of disapproval or opposition; a reason for disagreeing.	B1	uk	2026-05-19 13:04:55.851	2026-05-21 13:34:32.23
99	18	en	integrity	lesson_key_vocabulary	\N	0.12	чесність	The quality of being honest and having strong moral principles.	B1	uk	2026-05-19 13:04:55.86	2026-05-21 13:34:32.235
100	18	en	strategy	lesson_key_vocabulary	\N	0.12	стратегія	A plan of action or policy designed to achieve a major or overall aim.	B1	uk	2026-05-19 13:04:55.868	2026-05-21 13:34:32.241
291	18	en	getting	lesson_key_vocabulary	\N	0.12	Ставати	Becoming something or starting to feel a certain way.	B1	uk	2026-05-25 15:33:30.342	2026-05-25 15:33:30.342
91	18	en	commission	lesson_key_vocabulary	\N	0.12	комісія	A sum of money paid to an employee upon completion of a task, usually a percentage of a sale.	B1	uk	2026-05-19 13:04:55.795	2026-05-21 13:34:32.205
292	18	en	hot	lesson_key_vocabulary	\N	0.12	Гарячий	Having a high temperature.	B1	uk	2026-05-25 15:33:30.355	2026-05-25 15:33:30.355
293	18	en	that's	lesson_key_vocabulary	\N	0.12	Це є	The short form of 'that is'.	B1	uk	2026-05-25 15:33:30.362	2026-05-25 15:33:30.362
254	18	en	ron	lesson_key_vocabulary	\N	0.12	Рон	A common male first name, often used as a short form of Ronald.	B1	uk	2026-05-25 05:59:16.736	2026-05-25 05:59:18.468
255	18	en	excuse	lesson_key_vocabulary	\N	0.12	вибачте	A polite way to ask for someone's attention or to say sorry for a small mistake.	B1	uk	2026-05-25 05:59:16.74	2026-05-25 05:59:18.474
93	18	en	diversification	lesson_key_vocabulary	\N	0.12	диверсифікація	The process of allocating capital in a way that reduces the exposure to any one particular asset or risk.	B1	uk	2026-05-19 13:04:55.813	2026-05-21 13:34:32.197
95	18	en	skeptical	lesson_key_vocabulary	\N	0.12	скептичний	Not easily convinced; having doubts or reservations.	B1	uk	2026-05-19 13:04:55.827	2026-05-21 13:34:32.246
256	18	en	you	lesson_key_vocabulary	\N	0.12	ти, ви	The person or people that the speaker is talking to.	B1	uk	2026-05-25 05:59:16.742	2026-05-25 05:59:18.479
257	18	en	mind	lesson_key_vocabulary	\N	0.12	заперечувати	To feel annoyed or unhappy about something. It is often used in questions to ask for permission.	B1	uk	2026-05-25 05:59:16.744	2026-05-25 05:59:18.483
258	18	en	everywhere	lesson_key_vocabulary	\N	0.12	усюди	In every place or in all locations.	B1	uk	2026-05-25 05:59:16.746	2026-05-25 05:59:18.487
259	18	en	else	lesson_key_vocabulary	\N	0.12	інший, ще	Used after words like 'somewhere' or 'someone' to mean 'different' or 'additional'.	B1	uk	2026-05-25 05:59:16.749	2026-05-25 05:59:18.491
260	18	en	full	lesson_key_vocabulary	\N	0.12	повний	Containing as much as possible, with no more space for anything else.	B1	uk	2026-05-25 05:59:16.751	2026-05-25 05:59:18.496
182	18	en	Meddle	video	\N	0	втручатися	To try to change or influence things that do not concern you. It is when you get involved in other people's private business without being asked.	\N	\N	2026-05-21 13:11:49.559	2026-05-21 13:11:49.559
261	18	en	not	lesson_key_vocabulary	\N	0.12	не	A word used to make a sentence or phrase negative.	B1	uk	2026-05-25 05:59:16.753	2026-05-25 05:59:18.501
262	18	en	all	lesson_key_vocabulary	\N	0.12	все, всі	Used to refer to the whole amount or every member of a group.	B1	uk	2026-05-25 05:59:16.756	2026-05-25 05:59:18.505
263	18	en	i'm	lesson_key_vocabulary	\N	0.12	Я є	The short form of 'I am'.	B1	uk	2026-05-25 05:59:16.758	2026-05-25 15:33:30.334
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.users (id, name, email, password, role, has_completed_placement, "lastLogin", placement_test_draft, is_suspended, teacher_id, is_verified, is_two_factor_enable, method, "currentStreak", "lastActivityDate", stripe_customer_id, stripe_subscription_id, subscription_plan, subscription_status, xp, level, comprehension_wrong_bank, error_fixing_test_pending, weekly_review_completed_week_start, weekly_review_last_score_pct, "createdAt", mistakes_practice_completed_at, monthly_review_completed_month, monthly_review_last_score_pct, deletion_scheduled_at, verification_code, verification_code_expires, daily_reminder_enabled, weekly_report_enabled) FROM stdin;
5	tekit	tekityt@gmail.com	$2b$10$nijetRlBt7wQ9SsuUeDiDeofOz/5It2YKphCgRsbHN/K2z87axwsW	ADULT	f	\N	\N	f	\N	t	f	CREDENTIALS	0	\N	\N	\N	\N	\N	0	1	0	f	\N	\N	2026-05-15 07:38:44.474	\N	\N	\N	\N	\N	\N	t	t
4	tekit	tekit@gmail.com	$2b$10$tvofePYXqVcLwWzZo6DC4uQncmAweLjFibQHTHVYXMYQVlWf5MMSm	ADULT	f	\N	\N	f	\N	t	f	CREDENTIALS	0	\N	\N	\N	\N	\N	0	1	0	f	\N	\N	2026-05-15 07:31:02.854	\N	\N	\N	\N	\N	\N	t	t
7	tester	tester@gmail.com	$2b$10$uIkY4SaJOE6HXY9NlehHiOwdlUknNP8ANSEKlknZK938cPXAebQ1u	ADULT	t	\N	null	f	\N	t	f	CREDENTIALS	0	\N	cus_UWJCaUyaeyHfP2	sub_1TXGaIAOc9D4rK0VvAbxsVjg	smart	active	0	1	0	f	\N	\N	2026-05-15 07:54:15.173	\N	\N	\N	\N	\N	\N	t	t
71	ForTests	fortests@gmail.com	$2b$10$S5j57ijyQibK.5ondCpsx.VE.aBq9ksmVQV0GpGPerfg0F9fkzncy	ADULT	t	\N	\N	f	\N	t	f	CREDENTIALS	0	\N	\N	\N	smart	active	0	1	0	f	\N	\N	2026-05-25 13:11:35.921	\N	\N	\N	\N	\N	\N	t	t
8	some user	user@gmail.com	$2b$10$koMf.pmbF1uC4ZWBWOKE3uEJoiem71mIL1WaTuhRyWcyJNoGaLg1O	ADULT	t	\N	null	f	\N	t	f	CREDENTIALS	0	\N	cus_UWJUEhqZtUm9Z6	sub_1TXGrhAOc9D4rK0VlgirNoTl	smart	active	0	1	0	f	\N	\N	2026-05-15 08:12:35.817	\N	\N	\N	\N	\N	\N	t	t
10	Temp Admin	temp-admin@localhost.local	$2b$10$zDyMFp4IjLrVhbHb.csUfeG3ueGzyTOsJl5Xeo9cHxSguUrIMwrWy	ADMIN	t	\N	\N	f	\N	t	f	CREDENTIALS	0	\N	\N	\N	\N	\N	0	1	0	f	\N	\N	2026-05-15 08:53:06.338	\N	\N	\N	\N	\N	\N	t	t
70	boolka	boolka276@gmail.com	$2b$10$etVcr63Nq10ccwEq78OvruvFQQtyobdLHz9cZbwXPHmMPUTp8IWxe	ADULT	f	\N	\N	f	\N	t	f	CREDENTIALS	0	\N	\N	\N	\N	\N	0	1	0	f	\N	\N	2026-05-25 12:37:08.267	\N	\N	\N	\N	\N	\N	t	t
68	nazar	nazariy3110@gmail.com	$2b$10$JG1VqhxWYuXS4ZkIJQFYVuOh9tXhFouxsGY/MYh5ZKvBLGIG3.aoG	ADULT	t	\N	null	f	\N	t	f	CREDENTIALS	0	\N	\N	\N	smart	active	0	1	0	f	\N	\N	2026-05-24 08:09:49.035	\N	\N	\N	\N	\N	\N	t	t
23	WRtwetetea asydgajhsdgahjsd	wrtwetetea.asydgajhsdgahjsd.1582@alcorythm.com	$2b$10$QKvfQIiwvOxSzZmt1EVC4OU1sPH3cvaMXYZwwCKOAOu.XeE1Isqu.	STUDENT	f	\N	\N	f	22	t	f	CREDENTIALS	0	\N	\N	\N	\N	\N	0	1	0	f	\N	\N	2026-05-19 11:46:52.152	\N	\N	\N	\N	\N	\N	t	t
72	Jopa	leormix78@gmail.com	$2b$10$MdYP5mD91l8zHmLj7w4KLOtsyg.Pfaagn3WgqxsZdLaaSz5wdQWuu	ADULT	f	\N	\N	f	\N	t	f	CREDENTIALS	0	\N	\N	\N	\N	\N	0	1	0	f	\N	\N	2026-05-25 15:12:55.301	\N	\N	\N	\N	\N	\N	t	t
18	Inv	inv@gmail.com	$2b$10$u7CJGGhik/sJ6Ktb1tYY2Oa1iqmwsITouwZhC/OyMOIV38Ni9Q/uG	ADMIN	t	\N	null	f	\N	t	f	CREDENTIALS	7	2026-05-19 13:03:47.063	\N	\N	smart	active	825	1	0	f	\N	\N	2026-05-18 12:41:49.291	\N	\N	\N	\N	\N	\N	t	t
20	vladochka	starusievavladlena@gmail.com	$2b$10$uVXL79y2Z/hStAn6TlDliukEuYggGkg8ZTVMRLn8qbp4uv5jHxg2G	ADULT	f	\N	\N	f	\N	t	f	CREDENTIALS	0	\N	\N	\N	\N	\N	0	1	0	f	\N	\N	2026-05-18 15:50:48.934	\N	\N	\N	\N	\N	\N	t	t
21	opapa	dgdgdg@gmail.com	$2b$10$I3KuVHEB4wwHz0zHPFX2ju368Eww20Qj9gGqZrF4tPQiKeczOIYI2	ADULT	f	\N	\N	f	\N	t	f	CREDENTIALS	0	\N	\N	\N	\N	\N	0	1	0	f	\N	\N	2026-05-18 20:17:09.432	\N	\N	\N	\N	\N	\N	t	t
22	testik1	testik1@gmail.com	$2b$10$YPFy1rbImAdkeRtPWHNDX.a7D6nzd01r1SndvGfet9jloa9sLCqlu	TEACHER	f	\N	\N	f	\N	t	f	CREDENTIALS	2	2026-05-20 08:49:30.77	\N	\N	\N	\N	250	1	0	f	\N	\N	2026-05-19 11:46:51.775	\N	\N	\N	\N	\N	\N	t	t
48	MarkoAdmin	markoadmin@gmail.com	$2b$10$//yFpt0yGFfuooGY6WmEvux8L65B8gnWJ9CRfmyPeH9SjXJV7iRCK	ADMIN	t	\N	\N	f	\N	t	f	CREDENTIALS	0	\N	\N	\N	smart	active	0	1	0	f	\N	\N	2026-05-23 11:26:43.835	\N	\N	\N	\N	356514	2026-05-23 11:41:43.828	t	t
49	MashaAdmin	mashaadmin@gmail.com	$2b$10$zYsFzoKBaRZkTcL7WOyDQ.tqfd/Ne2clfzYO/mHcl7rj6nttjSXeS	ADMIN	t	\N	\N	f	\N	t	f	CREDENTIALS	0	\N	\N	\N	smart	active	0	1	0	f	\N	\N	2026-05-23 11:31:19.679	\N	\N	\N	\N	236722	2026-05-23 11:46:19.677	t	t
62	Nazar	asdashjasbddasjb@kjashdkjseb.com	$2b$10$VApLOXWL.aX95RnQo6Xd7OwbHK0r95RNDMvmnPjrTp/bLFeBmcpjK	ADULT	f	\N	\N	f	\N	f	f	CREDENTIALS	0	\N	\N	\N	\N	\N	0	1	0	f	\N	\N	2026-05-23 19:41:22.296	\N	\N	\N	\N	929509	2026-05-23 19:56:22.295	t	t
\.


--
-- Data for Name: video_captions; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.video_captions (id, content_video_id, subtitles_file_link, create_at, update_at) FROM stdin;
13	19	https://kpi-eng-course.s3.amazonaws.com/uploads/captions/9c48982f-75ad-4899-bed5-9906eabd944c.vtt	2026-05-17 18:28:12.821	2026-05-17 18:28:12.821
14	20	https://kpi-eng-course.s3.amazonaws.com/uploads/captions/66297a2d-e939-46ed-af57-f4655f098466.vtt	2026-05-17 18:33:51.246	2026-05-17 18:33:51.246
15	21	https://kpi-eng-course.s3.amazonaws.com/uploads/captions/a5eae6b6-f2d8-48d4-85b0-ab8e78cec766.vtt	2026-05-17 18:37:10.227	2026-05-17 18:37:10.227
16	22	https://kpi-eng-course.s3.amazonaws.com/uploads/captions/ac61d228-5d56-4416-94b4-f3818294b4e4.vtt	2026-05-17 18:40:51.461	2026-05-17 18:40:51.461
17	24	https://kpi-eng-course.s3.amazonaws.com/uploads/captions/8dff26a3-fc22-4294-a028-f6dad36eab6a.vtt	2026-05-17 18:59:21.138	2026-05-17 18:59:21.138
18	27	https://kpi-eng-course.s3.amazonaws.com/uploads/captions/ff7ce53c-b435-47ca-a280-d3f06c32b6f2.vtt	2026-05-17 18:59:49.043	2026-05-17 18:59:49.043
19	25	https://kpi-eng-course.s3.amazonaws.com/uploads/captions/2c46f7ff-3b5b-4297-88bf-3ba5fb8a5123.vtt	2026-05-17 19:00:32.592	2026-05-17 19:00:32.592
20	23	https://kpi-eng-course.s3.amazonaws.com/uploads/captions/6179e392-29f7-4ca5-8bfc-50accfe0974d.vtt	2026-05-17 19:01:15.511	2026-05-17 19:01:15.511
21	28	https://kpi-eng-course.s3.amazonaws.com/uploads/captions/9c48f8a4-567a-434d-9f23-d52f4ff46802.vtt	2026-05-17 19:02:00.312	2026-05-17 19:02:00.312
22	26	https://kpi-eng-course.s3.amazonaws.com/uploads/captions/c66347cc-f62f-4b44-bd54-43cfb12ca780.vtt	2026-05-17 19:02:24.86	2026-05-17 19:02:24.86
23	29	https://kpi-eng-course.s3.amazonaws.com/uploads/captions/33dd99ef-307a-429b-85b9-5dfacede4661.vtt	2026-05-17 19:08:19.855	2026-05-17 19:08:19.855
24	32	https://kpi-eng-course.s3.amazonaws.com/uploads/captions/5a80246b-6cc8-4288-86a5-3f586a48f548.vtt	2026-05-17 19:19:25.592	2026-05-17 19:19:25.592
25	30	https://kpi-eng-course.s3.amazonaws.com/uploads/captions/823901e0-7020-4865-9ff7-80c6938fede5.vtt	2026-05-17 19:20:19.221	2026-05-17 19:20:19.221
26	31	https://kpi-eng-course.s3.amazonaws.com/uploads/captions/aa1652ee-636a-411b-86da-e6e732d877ab.vtt	2026-05-17 19:21:32.533	2026-05-17 19:21:32.533
28	37	https://kpi-eng-course.s3.amazonaws.com/uploads/captions/6301db54-9656-4af5-a3e2-d37ea9269885.vtt	2026-05-17 19:40:27.632	2026-05-17 19:40:27.632
29	35	https://kpi-eng-course.s3.amazonaws.com/uploads/captions/154169ed-dd2c-46c3-a397-6e8cf49e897a.vtt	2026-05-17 19:41:23.96	2026-05-17 19:41:23.96
30	36	https://kpi-eng-course.s3.amazonaws.com/uploads/captions/e12598f9-34f2-4af0-b349-82268a046cb6.vtt	2026-05-17 19:41:56.044	2026-05-17 19:41:56.044
31	33	https://kpi-eng-course.s3.amazonaws.com/uploads/captions/8d776a64-8e71-4142-932d-d23f21ada558.vtt	2026-05-17 19:42:27.374	2026-05-17 19:42:27.374
32	34	https://kpi-eng-course.s3.amazonaws.com/uploads/captions/d7464f8a-d218-4742-8961-9b6cb7693036.vtt	2026-05-17 19:42:55.188	2026-05-17 19:42:55.188
33	44	https://kpi-eng-course.s3.amazonaws.com/uploads/captions/4fabc3c3-1afe-4aa2-b704-8300bf7864e2.vtt	2026-05-18 12:31:07.238	2026-05-18 12:31:07.238
35	46	https://kpi-eng-course.s3.amazonaws.com/uploads/captions/4a6c5483-06b6-466f-9a3d-e107089ae7e6.vtt	2026-05-19 19:40:31.988	2026-05-19 19:40:31.988
36	47	https://kpi-eng-course.s3.amazonaws.com/uploads/captions/f75d80b3-936b-4622-8dc2-af32c5d1afa3.vtt	2026-05-19 19:45:25.679	2026-05-19 19:46:03.215
38	49	https://kpi-eng-course.s3.amazonaws.com/uploads/captions/a5a41a9e-0166-4493-90b8-e3baa1cfde5a.vtt	2026-05-19 19:50:52.316	2026-05-19 19:50:52.316
49	55	https://kpi-eng-course.s3.amazonaws.com/uploads/captions/effde615-489f-4ee7-96ca-ef6110b567f2.vtt	2026-05-19 20:15:56.172	2026-05-19 20:15:56.172
39	51	https://kpi-eng-course.s3.amazonaws.com/uploads/captions/aae80338-f58b-43ae-a956-5fef726824b3.vtt	2026-05-19 19:54:35.603	2026-05-19 20:01:48.986
42	56	https://kpi-eng-course.s3.amazonaws.com/uploads/captions/1b4394cb-05f0-426e-8b01-56c4e682ca46.vtt	2026-05-19 20:05:34.336	2026-05-19 20:05:34.336
43	59	https://kpi-eng-course.s3.amazonaws.com/uploads/captions/2d0c6c75-991d-4318-bab7-509f1f03e770.vtt	2026-05-19 20:10:29.852	2026-05-19 20:11:07.965
45	52	https://kpi-eng-course.s3.amazonaws.com/uploads/captions/7a2d14cc-bb1f-489f-87a5-8b1791565d4d.vtt	2026-05-19 20:13:20.492	2026-05-19 20:13:20.492
46	53	https://kpi-eng-course.s3.amazonaws.com/uploads/captions/fa614279-04b1-489b-9175-4ac3e797b3f7.vtt	2026-05-19 20:14:23.135	2026-05-19 20:14:23.135
47	61	https://kpi-eng-course.s3.amazonaws.com/uploads/captions/f166085f-784a-4a25-b6ef-2844aa84e9b0.vtt	2026-05-19 20:15:00.965	2026-05-19 20:15:00.965
48	48	https://kpi-eng-course.s3.amazonaws.com/uploads/captions/97d27746-ad79-457b-bb3f-eb3c0459e3bf.vtt	2026-05-19 20:15:13.803	2026-05-19 20:15:13.803
50	54	https://kpi-eng-course.s3.amazonaws.com/uploads/captions/730c3652-9f14-4ec2-832f-5b7456febf8e.vtt	2026-05-19 20:18:18.263	2026-05-19 20:18:18.263
51	62	https://kpi-eng-course.s3.amazonaws.com/uploads/captions/8132ced0-e8bf-4548-87db-afbe917d6e7c.vtt	2026-05-19 20:19:25.803	2026-05-19 20:19:28.408
53	58	https://kpi-eng-course.s3.amazonaws.com/uploads/captions/9cccd23d-ee3f-417f-8b25-7f9e9ddd2399.vtt	2026-05-19 20:20:36.709	2026-05-19 20:20:36.709
54	57	https://kpi-eng-course.s3.amazonaws.com/uploads/captions/f9e99178-96f8-4e5f-8fb4-a340ba79ff2e.vtt	2026-05-19 20:21:31.842	2026-05-19 20:21:31.842
55	60	https://kpi-eng-course.s3.amazonaws.com/uploads/captions/4b9ffdd6-4a99-4c67-a080-55c8b8cdb228.vtt	2026-05-19 20:22:35.609	2026-05-19 20:22:35.609
56	63	https://kpi-eng-course.s3.amazonaws.com/uploads/captions/4ea6b323-ed9b-42e1-822f-6e00fd7da494.vtt	2026-05-19 20:23:58.766	2026-05-19 20:23:58.766
57	64	https://kpi-eng-course.s3.amazonaws.com/uploads/captions/55800359-4afb-4cb4-91b3-7596f5d5758a.vtt	2026-05-19 20:28:24.733	2026-05-19 20:28:24.733
58	66	https://kpi-eng-course.s3.amazonaws.com/uploads/captions/e5c126a0-f764-4faa-ab41-74da038028d6.vtt	2026-05-20 13:30:59.811	2026-05-20 13:30:59.811
59	67	https://kpi-eng-course.s3.amazonaws.com/uploads/captions/5479ae19-b0b0-4fa8-98df-cb6ad79c7eca.vtt	2026-05-20 13:32:53.264	2026-05-20 13:32:53.264
60	68	https://kpi-eng-course.s3.amazonaws.com/uploads/captions/f3d01b2f-586d-4253-80bd-6c4d6e413914.vtt	2026-05-20 13:36:28.372	2026-05-20 13:36:28.372
61	70	https://kpi-eng-course.s3.amazonaws.com/uploads/captions/24775266-4daf-4862-90a4-356aa0388ddc.vtt	2026-05-20 14:39:58.379	2026-05-20 14:39:58.379
62	72	https://kpi-eng-course.s3.amazonaws.com/uploads/captions/990b41b7-d3b0-4bc0-bfe8-464a698a71bf.vtt	2026-05-20 14:48:08.236	2026-05-20 14:48:17.562
64	73	https://kpi-eng-course.s3.amazonaws.com/uploads/captions/62018618-34f9-4b94-82ff-b60982f65974.vtt	2026-05-20 14:48:41.87	2026-05-20 14:48:41.87
65	71	https://kpi-eng-course.s3.amazonaws.com/uploads/captions/80d61637-1dde-4309-a35a-191ee411bd3f.vtt	2026-05-20 14:49:36.03	2026-05-20 14:49:36.03
68	76	https://kpi-eng-course.s3.amazonaws.com/uploads/captions/cdc9a327-a773-42fd-81e7-eecb7199d634.vtt	2026-05-20 15:08:11.423	2026-05-20 15:08:11.423
69	77	https://kpi-eng-course.s3.amazonaws.com/uploads/captions/b71ca7ce-a832-406d-92ff-f4c4af681bb4.vtt	2026-05-20 17:49:54.155	2026-05-20 17:49:54.155
70	78	https://kpi-eng-course.s3.amazonaws.com/uploads/captions/7a53d99f-6eb1-4955-a419-1999406387ef.vtt	2026-05-20 17:54:52.229	2026-05-20 17:54:52.229
71	79	https://kpi-eng-course.s3.amazonaws.com/uploads/captions/643d732c-83ff-40e3-85d0-1f88fe633bb0.vtt	2026-05-20 17:56:15.941	2026-05-20 17:56:15.941
72	80	https://kpi-eng-course.s3.amazonaws.com/uploads/captions/93a1e9e1-5cfe-4446-8607-5555f46252bc.vtt	2026-05-20 17:56:38.762	2026-05-20 17:56:38.762
73	81	https://kpi-eng-course.s3.amazonaws.com/uploads/captions/d6afdfd5-7308-4ea3-826c-c4757719b8d2.vtt	2026-05-20 17:59:32.852	2026-05-20 17:59:32.852
74	83	https://kpi-eng-course.s3.amazonaws.com/uploads/captions/6b35dcc1-a659-4b08-bae5-3a5cb6f3ec0b.vtt	2026-05-20 18:10:37.339	2026-05-20 18:10:37.339
75	84	https://kpi-eng-course.s3.amazonaws.com/uploads/captions/67c12914-aeea-48f7-9761-b110bfcdf40e.vtt	2026-05-20 18:11:07.276	2026-05-20 18:11:07.276
76	85	https://kpi-eng-course.s3.amazonaws.com/uploads/captions/cbe2a747-ded7-43ec-ab64-ada4afaf8066.vtt	2026-05-20 18:25:07.267	2026-05-20 18:25:07.267
77	86	https://kpi-eng-course.s3.amazonaws.com/uploads/captions/b6d3d1ed-d69e-4bf0-a17f-31850d2827f5.vtt	2026-05-20 18:25:33.623	2026-05-20 18:25:33.623
78	87	https://kpi-eng-course.s3.amazonaws.com/uploads/captions/5bb67a6b-a009-4638-83b7-59882f114570.vtt	2026-05-20 18:25:51.194	2026-05-20 18:25:51.194
79	88	https://kpi-eng-course.s3.amazonaws.com/uploads/captions/ac19ebb4-f271-46fb-aac0-e7e88c1b7666.vtt	2026-05-20 18:44:51.965	2026-05-20 18:44:51.965
80	89	https://kpi-eng-course.s3.amazonaws.com/uploads/captions/fa6ca9ca-a661-432a-904a-4cdd8cdc4a24.vtt	2026-05-20 18:45:21.146	2026-05-20 18:45:21.146
81	90	https://kpi-eng-course.s3.amazonaws.com/uploads/captions/b2d2e4cc-d72f-41ce-8f35-5ae5bb4532c5.vtt	2026-05-20 18:49:39.29	2026-05-20 18:49:55.286
83	91	https://kpi-eng-course.s3.amazonaws.com/uploads/captions/8fe00bbe-9902-4e5a-8807-19556afa6816.vtt	2026-05-20 18:50:26.678	2026-05-20 18:50:26.678
84	82	https://kpi-eng-course.s3.amazonaws.com/uploads/captions/47a2a4ff-0629-4353-bf10-e4b3f0086678.vtt	2026-05-20 19:21:30.899	2026-05-20 19:21:30.899
85	92	https://kpi-eng-course.s3.amazonaws.com/uploads/captions/a1427308-994c-45c0-89e5-903699c3ca97.vtt	2026-05-20 19:22:30.675	2026-05-20 19:22:30.675
86	94	https://kpi-eng-course.s3.amazonaws.com/uploads/captions/950d429c-3f4e-4462-a5a7-922e7c367b11.vtt	2026-05-20 19:34:43.471	2026-05-20 19:34:43.471
87	95	https://kpi-eng-course.s3.amazonaws.com/uploads/captions/b6044089-13d2-4bc3-9f11-f86bc61cb3f4.vtt	2026-05-20 19:41:35.368	2026-05-20 19:41:35.368
88	96	https://kpi-eng-course.s3.amazonaws.com/uploads/captions/0c7e897b-9fe6-4354-91cc-b1c9eaebc2fe.vtt	2026-05-20 19:41:57.129	2026-05-20 19:41:57.129
89	100	https://kpi-eng-course.s3.amazonaws.com/uploads/captions/9f97f027-bda2-43de-b1c8-439086f5701b.vtt	2026-05-20 19:57:53.316	2026-05-20 19:57:53.316
90	101	https://kpi-eng-course.s3.amazonaws.com/uploads/captions/bfb05089-c9c7-4a03-9fdb-959997ef9258.vtt	2026-05-20 20:04:01.111	2026-05-20 20:04:01.111
91	102	https://kpi-eng-course.s3.amazonaws.com/uploads/captions/79ceaa29-f82c-4d23-8e92-eb1c38d30713.vtt	2026-05-20 20:04:36.615	2026-05-20 20:04:36.615
92	103	https://kpi-eng-course.s3.amazonaws.com/uploads/captions/4548cbe9-f43b-4d60-a654-2231c29c91b1.vtt	2026-05-20 20:15:33.09	2026-05-20 20:15:33.09
93	104	https://kpi-eng-course.s3.amazonaws.com/uploads/captions/2225e603-d7ac-4acf-b40f-d869b5184015.vtt	2026-05-20 20:21:21.513	2026-05-20 20:21:21.513
94	105	https://kpi-eng-course.s3.amazonaws.com/uploads/captions/91ad13be-ecdb-4f98-a1b3-60d1bfaf9f59.vtt	2026-05-24 12:00:05.567	2026-05-24 12:00:34.101
96	106	https://kpi-eng-course.s3.amazonaws.com/uploads/captions/2210660b-f1a3-432a-98e3-f0cac64df82d.vtt	2026-05-24 12:08:05.711	2026-05-24 12:08:05.711
97	107	https://kpi-eng-course.s3.amazonaws.com/uploads/captions/3464fa8e-977c-47f4-97de-6d0f424c81f3.vtt	2026-05-24 12:28:45.289	2026-05-24 12:28:45.289
98	108	https://kpi-eng-course.s3.amazonaws.com/uploads/captions/e688dc17-7b1e-4493-8644-34c9859fa9af.vtt	2026-05-24 12:29:26.127	2026-05-24 12:29:26.127
99	109	https://kpi-eng-course.s3.amazonaws.com/uploads/captions/9625ecc4-60db-48e0-9ed0-646148987c4c.vtt	2026-05-24 12:35:32.499	2026-05-24 12:35:32.499
100	110	https://kpi-eng-course.s3.amazonaws.com/uploads/captions/438cc998-f207-43c8-a3ab-8c19971fb55e.vtt	2026-05-24 13:01:32.307	2026-05-24 13:01:32.307
101	111	https://kpi-eng-course.s3.amazonaws.com/uploads/captions/19e87f93-164b-48ac-b4d8-b33cf8471503.vtt	2026-05-24 13:02:15.654	2026-05-24 13:02:15.654
102	112	https://kpi-eng-course.s3.amazonaws.com/uploads/captions/0782db79-ffa6-49cd-9838-92401e8cb3dc.vtt	2026-05-24 13:10:51.388	2026-05-24 13:10:51.388
103	113	https://kpi-eng-course.s3.amazonaws.com/uploads/captions/67129366-419e-42c0-a4ab-fc7166214fec.vtt	2026-05-24 13:11:44.556	2026-05-24 13:11:44.556
104	114	https://kpi-eng-course.s3.amazonaws.com/uploads/captions/d3989dbf-eb87-455c-94ad-bafaaf32b8ae.vtt	2026-05-24 13:17:51.412	2026-05-24 13:17:51.412
105	115	https://kpi-eng-course.s3.amazonaws.com/uploads/captions/11d77a38-4e57-468b-bbdd-d2996f52e9ea.vtt	2026-05-24 18:47:39.605	2026-05-24 18:47:39.605
106	116	https://kpi-eng-course.s3.amazonaws.com/uploads/captions/5880b0f2-58de-4d8a-a083-ddf94352ce17.vtt	2026-05-24 19:30:51.414	2026-05-24 19:30:51.414
107	117	https://kpi-eng-course.s3.amazonaws.com/uploads/captions/9bceb139-e9ec-4b0c-b007-d10985bd1dfd.vtt	2026-05-24 19:42:10.63	2026-05-24 19:42:10.63
108	118	https://kpi-eng-course.s3.amazonaws.com/uploads/captions/30260650-67e7-4ef7-a76c-c4ef1766c407.vtt	2026-05-24 19:42:51.62	2026-05-24 19:42:51.62
109	119	https://kpi-eng-course.s3.amazonaws.com/uploads/captions/8681a158-65b8-4f9f-8a08-75b4b850841e.vtt	2026-05-24 19:53:51.771	2026-05-24 19:53:51.771
110	120	https://kpi-eng-course.s3.amazonaws.com/uploads/captions/e85ff2af-7191-41c2-91d2-fde984dcc13f.vtt	2026-05-24 19:54:56.256	2026-05-24 19:54:56.256
111	121	https://kpi-eng-course.s3.amazonaws.com/uploads/captions/252b3a74-23aa-4693-9303-6e1e52a29a9a.vtt	2026-05-24 20:01:03.695	2026-05-24 20:01:03.695
112	123	https://kpi-eng-course.s3.amazonaws.com/uploads/captions/dad51630-707b-4166-83bb-c823e68e23f3.vtt	2026-05-24 20:08:54.695	2026-05-24 20:08:54.695
113	122	https://kpi-eng-course.s3.amazonaws.com/uploads/captions/88076ee1-be79-430f-8337-883f6f13227a.vtt	2026-05-24 20:09:41.002	2026-05-24 20:09:41.002
114	124	https://kpi-eng-course.s3.amazonaws.com/uploads/captions/634ecc4c-29b9-4694-bb65-1d9f0d1ad609.vtt	2026-05-24 20:16:14.805	2026-05-24 20:16:14.805
115	126	https://kpi-eng-course.s3.amazonaws.com/uploads/captions/17473431-fdb9-4fed-8757-7059dcb25a23.vtt	2026-05-24 21:21:23.643	2026-05-24 21:21:23.643
116	127	https://kpi-eng-course.s3.amazonaws.com/uploads/captions/ca9d27bf-1653-4e67-8f3e-7da15565ab06.vtt	2026-05-24 21:22:00.757	2026-05-24 21:22:00.757
117	128	https://kpi-eng-course.s3.amazonaws.com/uploads/captions/062cd0a2-6689-469f-bfc2-9f58593a285d.vtt	2026-05-24 21:28:24.72	2026-05-24 21:28:24.72
118	129	https://kpi-eng-course.s3.amazonaws.com/uploads/captions/8d6df919-2b64-4ecf-bab4-ee238b6debc8.vtt	2026-05-24 21:29:25.371	2026-05-24 21:29:25.371
119	131	https://kpi-eng-course.s3.amazonaws.com/uploads/captions/b98bda36-e890-4f76-aeed-5ed537e88500.vtt	2026-05-24 21:41:28.904	2026-05-24 21:41:28.904
120	132	https://kpi-eng-course.s3.amazonaws.com/uploads/captions/2201821b-07ef-4be3-b25e-02a39e8c5fea.vtt	2026-05-24 21:42:38.421	2026-05-24 21:42:38.421
121	130	https://kpi-eng-course.s3.amazonaws.com/uploads/captions/d726ea44-6738-4881-8da2-b6441442a91e.vtt	2026-05-24 21:43:57.032	2026-05-24 21:43:57.032
\.


--
-- Data for Name: watch_sessions; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.watch_sessions (id, user_id, content_video_id, completion_date, started_at, ended_at, seconds_watched, completed) FROM stdin;
80	18	77	2026-05-23	\N	2026-05-24 09:57:25.143	80	t
85	18	23	2026-05-24	\N	2026-05-25 05:57:52.672	0	t
19	22	19	2026-05-19	\N	2026-05-19 11:50:02.747	552	t
20	18	20	2026-05-19	\N	2026-05-19 13:03:47.05	820	t
22	22	52	2026-05-20	\N	2026-05-20 08:49:30.745	646	t
90	71	23	2026-05-24	\N	2026-05-25 13:31:51.404	20	t
92	18	76	2026-05-24	\N	2026-05-25 14:45:22.89	0	t
86	18	117	2026-05-24	\N	2026-05-25 14:52:23.227	80	t
93	18	123	2026-05-24	\N	2026-05-25 15:17:43.251	0	t
97	18	88	2026-05-24	\N	2026-05-25 15:32:59.322	40	t
101	68	117	2026-05-24	\N	2026-05-25 17:36:08.123	20	f
66	18	23	2026-05-20	\N	2026-05-21 13:11:18.632	40	t
63	18	20	2026-05-20	\N	2026-05-21 13:33:39.425	40	t
\.


--
-- Name: Account_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public."Account_id_seq"', 1, false);


--
-- Name: UserAchievement_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public."UserAchievement_id_seq"', 6, true);


--
-- Name: additional_user_data_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.additional_user_data_id_seq', 69, true);


--
-- Name: categories_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.categories_id_seq', 16, true);


--
-- Name: comprehension_test_attempts_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.comprehension_test_attempts_id_seq', 29, true);


--
-- Name: content_medias_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.content_medias_id_seq', 132, true);


--
-- Name: content_stats_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.content_stats_id_seq', 403, true);


--
-- Name: content_videos_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.content_videos_id_seq', 132, true);


--
-- Name: contents_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.contents_id_seq', 101, true);


--
-- Name: genres_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.genres_id_seq', 40, true);


--
-- Name: placement_attempts_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.placement_attempts_id_seq', 5, true);


--
-- Name: post_watch_surveys_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.post_watch_surveys_id_seq', 24, true);


--
-- Name: settings_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.settings_id_seq', 1, false);


--
-- Name: statistics_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.statistics_id_seq', 1, true);


--
-- Name: tags_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.tags_id_seq', 390, true);


--
-- Name: tokens_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.tokens_id_seq', 5, true);


--
-- Name: topics_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.topics_id_seq', 78, true);


--
-- Name: user_comprehension_weak_spots_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.user_comprehension_weak_spots_id_seq', 220, true);


--
-- Name: user_friends_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.user_friends_id_seq', 1, false);


--
-- Name: user_language_data_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.user_language_data_id_seq', 2340, true);


--
-- Name: user_vocabulary_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.user_vocabulary_id_seq', 293, true);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.users_id_seq', 72, true);


--
-- Name: video_captions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.video_captions_id_seq', 121, true);


--
-- Name: watch_sessions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.watch_sessions_id_seq', 101, true);


--
-- Name: Account Account_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Account"
    ADD CONSTRAINT "Account_pkey" PRIMARY KEY (id);


--
-- Name: UserAchievement UserAchievement_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."UserAchievement"
    ADD CONSTRAINT "UserAchievement_pkey" PRIMARY KEY (id);


--
-- Name: _ContentStatsToTopic _ContentStatsToTopic_AB_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."_ContentStatsToTopic"
    ADD CONSTRAINT "_ContentStatsToTopic_AB_pkey" PRIMARY KEY ("A", "B");


--
-- Name: _FavoriteGenres _FavoriteGenres_AB_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."_FavoriteGenres"
    ADD CONSTRAINT "_FavoriteGenres_AB_pkey" PRIMARY KEY ("A", "B");


--
-- Name: _HatedGenres _HatedGenres_AB_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."_HatedGenres"
    ADD CONSTRAINT "_HatedGenres_AB_pkey" PRIMARY KEY ("A", "B");


--
-- Name: _SelectedTopics _SelectedTopics_AB_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."_SelectedTopics"
    ADD CONSTRAINT "_SelectedTopics_AB_pkey" PRIMARY KEY ("A", "B");


--
-- Name: _TagToTopic _TagToTopic_AB_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."_TagToTopic"
    ADD CONSTRAINT "_TagToTopic_AB_pkey" PRIMARY KEY ("A", "B");


--
-- Name: additional_user_data additional_user_data_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.additional_user_data
    ADD CONSTRAINT additional_user_data_pkey PRIMARY KEY (id);


--
-- Name: categories categories_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_pkey PRIMARY KEY (id);


--
-- Name: comprehension_test_attempts comprehension_test_attempts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.comprehension_test_attempts
    ADD CONSTRAINT comprehension_test_attempts_pkey PRIMARY KEY (id);


--
-- Name: content_medias content_medias_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.content_medias
    ADD CONSTRAINT content_medias_pkey PRIMARY KEY (id);


--
-- Name: content_stats content_stats_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.content_stats
    ADD CONSTRAINT content_stats_pkey PRIMARY KEY (id);


--
-- Name: content_videos content_videos_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.content_videos
    ADD CONSTRAINT content_videos_pkey PRIMARY KEY (id);


--
-- Name: contents contents_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.contents
    ADD CONSTRAINT contents_pkey PRIMARY KEY (id);


--
-- Name: genres genres_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.genres
    ADD CONSTRAINT genres_pkey PRIMARY KEY (id);


--
-- Name: placement_attempts placement_attempts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.placement_attempts
    ADD CONSTRAINT placement_attempts_pkey PRIMARY KEY (id);


--
-- Name: post_watch_surveys post_watch_surveys_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.post_watch_surveys
    ADD CONSTRAINT post_watch_surveys_pkey PRIMARY KEY (id);


--
-- Name: settings settings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.settings
    ADD CONSTRAINT settings_pkey PRIMARY KEY (id);


--
-- Name: statistics statistics_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.statistics
    ADD CONSTRAINT statistics_pkey PRIMARY KEY (id);


--
-- Name: tags tags_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tags
    ADD CONSTRAINT tags_pkey PRIMARY KEY (id);


--
-- Name: tokens tokens_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tokens
    ADD CONSTRAINT tokens_pkey PRIMARY KEY (id);


--
-- Name: topics topics_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.topics
    ADD CONSTRAINT topics_pkey PRIMARY KEY (id);


--
-- Name: user_comprehension_weak_spots user_comprehension_weak_spots_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_comprehension_weak_spots
    ADD CONSTRAINT user_comprehension_weak_spots_pkey PRIMARY KEY (id);


--
-- Name: user_friends user_friends_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_friends
    ADD CONSTRAINT user_friends_pkey PRIMARY KEY (id);


--
-- Name: user_language_data user_language_data_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_language_data
    ADD CONSTRAINT user_language_data_pkey PRIMARY KEY (id);


--
-- Name: user_vocabulary user_vocabulary_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_vocabulary
    ADD CONSTRAINT user_vocabulary_pkey PRIMARY KEY (id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: video_captions video_captions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.video_captions
    ADD CONSTRAINT video_captions_pkey PRIMARY KEY (id);


--
-- Name: watch_sessions watch_sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.watch_sessions
    ADD CONSTRAINT watch_sessions_pkey PRIMARY KEY (id);


--
-- Name: UserAchievement_userId_achievementId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "UserAchievement_userId_achievementId_key" ON public."UserAchievement" USING btree ("userId", "achievementId");


--
-- Name: _ContentStatsToTopic_B_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "_ContentStatsToTopic_B_index" ON public."_ContentStatsToTopic" USING btree ("B");


--
-- Name: _FavoriteGenres_B_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "_FavoriteGenres_B_index" ON public."_FavoriteGenres" USING btree ("B");


--
-- Name: _HatedGenres_B_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "_HatedGenres_B_index" ON public."_HatedGenres" USING btree ("B");


--
-- Name: _SelectedTopics_B_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "_SelectedTopics_B_index" ON public."_SelectedTopics" USING btree ("B");


--
-- Name: _TagToTopic_B_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "_TagToTopic_B_index" ON public."_TagToTopic" USING btree ("B");


--
-- Name: additional_user_data_userId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "additional_user_data_userId_key" ON public.additional_user_data USING btree ("userId");


--
-- Name: categories_name_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX categories_name_key ON public.categories USING btree (name);


--
-- Name: comprehension_test_attempts_created_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX comprehension_test_attempts_created_at_idx ON public.comprehension_test_attempts USING btree (created_at);


--
-- Name: comprehension_test_attempts_user_id_content_video_id_create_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX comprehension_test_attempts_user_id_content_video_id_create_idx ON public.comprehension_test_attempts USING btree (user_id, content_video_id, created_at);


--
-- Name: content_medias_category_id_playlist_position_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX content_medias_category_id_playlist_position_key ON public.content_medias USING btree (category_id, playlist_position);


--
-- Name: content_stats_content_media_id_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX content_stats_content_media_id_key ON public.content_stats USING btree (content_media_id);


--
-- Name: content_videos_content_id_playlist_position_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX content_videos_content_id_playlist_position_key ON public.content_videos USING btree (content_id, playlist_position);


--
-- Name: contents_friendly_link_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX contents_friendly_link_key ON public.contents USING btree (friendly_link);


--
-- Name: contents_owner_user_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX contents_owner_user_id_idx ON public.contents USING btree (owner_user_id);


--
-- Name: genres_name_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX genres_name_key ON public.genres USING btree (name);


--
-- Name: placement_attempts_created_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX placement_attempts_created_at_idx ON public.placement_attempts USING btree (created_at);


--
-- Name: placement_attempts_user_id_created_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX placement_attempts_user_id_created_at_idx ON public.placement_attempts USING btree (user_id, created_at);


--
-- Name: post_watch_surveys_content_video_id_user_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX post_watch_surveys_content_video_id_user_id_idx ON public.post_watch_surveys USING btree (content_video_id, user_id);


--
-- Name: settings_userId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "settings_userId_key" ON public.settings USING btree ("userId");


--
-- Name: statistics_userId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "statistics_userId_key" ON public.statistics USING btree ("userId");


--
-- Name: tags_name_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX tags_name_key ON public.tags USING btree (name);


--
-- Name: tokens_email_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX tokens_email_key ON public.tokens USING btree (email);


--
-- Name: tokens_token_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX tokens_token_key ON public.tokens USING btree (token);


--
-- Name: user_comprehension_weak_spots_user_id_content_video_id_last_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX user_comprehension_weak_spots_user_id_content_video_id_last_idx ON public.user_comprehension_weak_spots USING btree (user_id, content_video_id, last_missed_at);


--
-- Name: user_comprehension_weak_spots_user_id_content_video_id_stem_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX user_comprehension_weak_spots_user_id_content_video_id_stem_key ON public.user_comprehension_weak_spots USING btree (user_id, content_video_id, stem_hash);


--
-- Name: user_language_data_userId_topicId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "user_language_data_userId_topicId_key" ON public.user_language_data USING btree ("userId", "topicId");


--
-- Name: user_vocabulary_user_id_language_code_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX user_vocabulary_user_id_language_code_idx ON public.user_vocabulary USING btree (user_id, language_code);


--
-- Name: user_vocabulary_user_id_language_code_term_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX user_vocabulary_user_id_language_code_term_key ON public.user_vocabulary USING btree (user_id, language_code, term);


--
-- Name: users_email_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX users_email_key ON public.users USING btree (email);


--
-- Name: users_teacher_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX users_teacher_id_idx ON public.users USING btree (teacher_id);


--
-- Name: video_captions_content_video_id_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX video_captions_content_video_id_key ON public.video_captions USING btree (content_video_id);


--
-- Name: watch_sessions_ended_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX watch_sessions_ended_at_idx ON public.watch_sessions USING btree (ended_at);


--
-- Name: watch_sessions_user_id_content_video_id_completion_date_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX watch_sessions_user_id_content_video_id_completion_date_key ON public.watch_sessions USING btree (user_id, content_video_id, completion_date);


--
-- Name: watch_sessions_user_id_content_video_id_ended_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX watch_sessions_user_id_content_video_id_ended_at_idx ON public.watch_sessions USING btree (user_id, content_video_id, ended_at);


--
-- Name: Account Account_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Account"
    ADD CONSTRAINT "Account_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: UserAchievement UserAchievement_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."UserAchievement"
    ADD CONSTRAINT "UserAchievement_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: _ContentStatsToTopic _ContentStatsToTopic_A_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."_ContentStatsToTopic"
    ADD CONSTRAINT "_ContentStatsToTopic_A_fkey" FOREIGN KEY ("A") REFERENCES public.content_stats(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: _ContentStatsToTopic _ContentStatsToTopic_B_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."_ContentStatsToTopic"
    ADD CONSTRAINT "_ContentStatsToTopic_B_fkey" FOREIGN KEY ("B") REFERENCES public.topics(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: _FavoriteGenres _FavoriteGenres_A_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."_FavoriteGenres"
    ADD CONSTRAINT "_FavoriteGenres_A_fkey" FOREIGN KEY ("A") REFERENCES public.additional_user_data(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: _FavoriteGenres _FavoriteGenres_B_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."_FavoriteGenres"
    ADD CONSTRAINT "_FavoriteGenres_B_fkey" FOREIGN KEY ("B") REFERENCES public.genres(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: _HatedGenres _HatedGenres_A_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."_HatedGenres"
    ADD CONSTRAINT "_HatedGenres_A_fkey" FOREIGN KEY ("A") REFERENCES public.additional_user_data(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: _HatedGenres _HatedGenres_B_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."_HatedGenres"
    ADD CONSTRAINT "_HatedGenres_B_fkey" FOREIGN KEY ("B") REFERENCES public.genres(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: _SelectedTopics _SelectedTopics_A_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."_SelectedTopics"
    ADD CONSTRAINT "_SelectedTopics_A_fkey" FOREIGN KEY ("A") REFERENCES public.additional_user_data(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: _SelectedTopics _SelectedTopics_B_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."_SelectedTopics"
    ADD CONSTRAINT "_SelectedTopics_B_fkey" FOREIGN KEY ("B") REFERENCES public.topics(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: _TagToTopic _TagToTopic_A_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."_TagToTopic"
    ADD CONSTRAINT "_TagToTopic_A_fkey" FOREIGN KEY ("A") REFERENCES public.tags(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: _TagToTopic _TagToTopic_B_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."_TagToTopic"
    ADD CONSTRAINT "_TagToTopic_B_fkey" FOREIGN KEY ("B") REFERENCES public.topics(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: additional_user_data additional_user_data_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.additional_user_data
    ADD CONSTRAINT "additional_user_data_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: comprehension_test_attempts comprehension_test_attempts_content_video_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.comprehension_test_attempts
    ADD CONSTRAINT comprehension_test_attempts_content_video_id_fkey FOREIGN KEY (content_video_id) REFERENCES public.content_videos(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: comprehension_test_attempts comprehension_test_attempts_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.comprehension_test_attempts
    ADD CONSTRAINT comprehension_test_attempts_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: content_medias content_medias_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.content_medias
    ADD CONSTRAINT content_medias_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.contents(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: content_stats content_stats_content_media_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.content_stats
    ADD CONSTRAINT content_stats_content_media_id_fkey FOREIGN KEY (content_media_id) REFERENCES public.content_medias(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: content_videos content_videos_content_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.content_videos
    ADD CONSTRAINT content_videos_content_id_fkey FOREIGN KEY (content_id) REFERENCES public.content_medias(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: contents contents_owner_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.contents
    ADD CONSTRAINT contents_owner_user_id_fkey FOREIGN KEY (owner_user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: placement_attempts placement_attempts_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.placement_attempts
    ADD CONSTRAINT placement_attempts_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: post_watch_surveys post_watch_surveys_content_video_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.post_watch_surveys
    ADD CONSTRAINT post_watch_surveys_content_video_id_fkey FOREIGN KEY (content_video_id) REFERENCES public.content_videos(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: post_watch_surveys post_watch_surveys_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.post_watch_surveys
    ADD CONSTRAINT post_watch_surveys_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: settings settings_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.settings
    ADD CONSTRAINT "settings_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: statistics statistics_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.statistics
    ADD CONSTRAINT "statistics_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: topics topics_categoryId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.topics
    ADD CONSTRAINT "topics_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES public.categories(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: user_comprehension_weak_spots user_comprehension_weak_spots_content_video_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_comprehension_weak_spots
    ADD CONSTRAINT user_comprehension_weak_spots_content_video_id_fkey FOREIGN KEY (content_video_id) REFERENCES public.content_videos(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: user_comprehension_weak_spots user_comprehension_weak_spots_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_comprehension_weak_spots
    ADD CONSTRAINT user_comprehension_weak_spots_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: user_friends user_friends_friendId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_friends
    ADD CONSTRAINT "user_friends_friendId_fkey" FOREIGN KEY ("friendId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: user_friends user_friends_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_friends
    ADD CONSTRAINT "user_friends_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: user_language_data user_language_data_topicId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_language_data
    ADD CONSTRAINT "user_language_data_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES public.topics(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: user_language_data user_language_data_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_language_data
    ADD CONSTRAINT "user_language_data_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: user_vocabulary user_vocabulary_topic_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_vocabulary
    ADD CONSTRAINT user_vocabulary_topic_id_fkey FOREIGN KEY (topic_id) REFERENCES public.topics(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: user_vocabulary user_vocabulary_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_vocabulary
    ADD CONSTRAINT user_vocabulary_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: users users_teacher_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_teacher_id_fkey FOREIGN KEY (teacher_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: video_captions video_captions_content_video_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.video_captions
    ADD CONSTRAINT video_captions_content_video_id_fkey FOREIGN KEY (content_video_id) REFERENCES public.content_videos(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: watch_sessions watch_sessions_content_video_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.watch_sessions
    ADD CONSTRAINT watch_sessions_content_video_id_fkey FOREIGN KEY (content_video_id) REFERENCES public.content_videos(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: watch_sessions watch_sessions_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.watch_sessions
    ADD CONSTRAINT watch_sessions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict FywHYvCOWDXxEq6L51bM49WsNgdKeYLkVtYEs9fqPG9Q4bxuDYaF08ihxpVv7T9

