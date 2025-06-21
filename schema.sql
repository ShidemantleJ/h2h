

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


CREATE SCHEMA IF NOT EXISTS "public";


ALTER SCHEMA "public" OWNER TO "pg_database_owner";


COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE TYPE "public"."friendreqstatus" AS ENUM (
    'pending',
    'canceled',
    'accepted',
    'declined'
);


ALTER TYPE "public"."friendreqstatus" OWNER TO "postgres";


COMMENT ON TYPE "public"."friendreqstatus" IS 'Status of Friend Request';



CREATE TYPE "public"."matchinvitestatus" AS ENUM (
    'pending',
    'canceled',
    'accepted',
    'declined',
    'playing'
);


ALTER TYPE "public"."matchinvitestatus" OWNER TO "postgres";


CREATE TYPE "public"."matchstatus" AS ENUM (
    'notstarted',
    'ongoing',
    'P1_WON',
    'P2_WON',
    'canceled',
    'both_left'
);


ALTER TYPE "public"."matchstatus" OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."add_friends_on_accept"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  -- If status changed to accepted, insert ids into friends table
  IF NEW.status = 'accepted' AND OLD.status IS DISTINCT FROM 'accepted' THEN
    INSERT INTO friends (user1_id, user2_id)
    VALUES (NEW.sender_user_id, NEW.recipient_user_id);
  END IF;

  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."add_friends_on_accept"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."prevent_existing_and_reverse_friend_requests"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  -- Prevent duplicate friend requests unless previous is canceled or declined
  IF EXISTS (
    SELECT 1 FROM friendreqs
    WHERE sender_user_id = NEW.sender_user_id
      AND recipient_user_id = NEW.recipient_user_id
      AND status = 'pending'
  ) THEN
    RAISE EXCEPTION 'Duplicate friend request already exists and is still pending';
  END IF;

  -- Prevent reverse friend requests unless previous is canceled or declined
  IF EXISTS (
    SELECT 1 FROM friendreqs
    WHERE sender_user_id = NEW.recipient_user_id
      AND recipient_user_id = NEW.sender_user_id
      AND status = 'pending'
  ) THEN
    RAISE EXCEPTION 'Reverse friend request already exists and is still pending';
  END IF;

  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."prevent_existing_and_reverse_friend_requests"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."prevent_existing_friend_requests"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  -- Check for duplicate friend request
  IF EXISTS (
    SELECT 1 FROM friendreqs
    WHERE sender_user_id = NEW.sender_user_id
      AND recipient_user_id = NEW.recipient_user_id
  ) THEN
    RAISE EXCEPTION 'Friend request already exists';
  END IF;

  -- Check for reverse friend request
  IF EXISTS (
    SELECT 1 FROM friendreqs
    WHERE sender_user_id = NEW.recipient_user_id
      AND recipient_user_id = NEW.sender_user_id
  ) THEN
    RAISE EXCEPTION 'Reverse friend request already exists';
  END IF;

  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."prevent_existing_friend_requests"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."prevent_requests_for_existing_friends"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  -- Prevent friend requests between users that are already friends
  IF EXISTS (
    SELECT 1 FROM users
    WHERE (NEW.sender_user_id = ANY(friends)
      AND id = NEW.recipient_user_id)
  ) THEN
    RAISE EXCEPTION 'Users are already friends';
  END IF;

  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."prevent_requests_for_existing_friends"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."prevent_reverse_friend_requests"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM friendreqs
    WHERE sender_user_id = NEW.recipient_user_id
      AND recipient_user_id = NEW.sender_user_id
  ) THEN
    RAISE EXCEPTION 'Reverse friend request already exists';
  END IF;
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."prevent_reverse_friend_requests"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."trigger_set_timestamp"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  NEW.solve_countdown = NOW();
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."trigger_set_timestamp"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."matches" (
    "id" bigint NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "best_of_set_format" smallint,
    "player_1_id" bigint,
    "player_2_id" bigint,
    "countdown_timestamp" timestamp with time zone,
    "player_turn" smallint DEFAULT '1'::smallint,
    "status" "public"."matchstatus" DEFAULT 'notstarted'::"public"."matchstatus",
    "event" "text",
    "player_1_times" "jsonb" DEFAULT '[[]]'::"jsonb",
    "player_2_times" "jsonb" DEFAULT '[[]]'::"jsonb",
    "countdown_secs" bigint,
    "scrambles" "jsonb" DEFAULT '[[]]'::"jsonb",
    "max_solves" smallint[],
    "best_of_solve_format" smallint
);


ALTER TABLE "public"."matches" OWNER TO "postgres";


COMMENT ON TABLE "public"."matches" IS 'describes match metadata, contains solves';



COMMENT ON COLUMN "public"."matches"."scrambles" IS '2d array with every scramble in the match';



ALTER TABLE "public"."matches" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."Matches_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."users" (
    "id" bigint NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "name" "text" NOT NULL,
    "wcaid" "text",
    "profile_pic_url" "text",
    "profile_id" bigint
);


ALTER TABLE "public"."users" OWNER TO "postgres";


COMMENT ON TABLE "public"."users" IS 'contains';



ALTER TABLE "public"."users" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."Users_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."friendreqs" (
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "sender_user_id" bigint NOT NULL,
    "recipient_user_id" bigint NOT NULL,
    "status" "public"."friendreqstatus" DEFAULT 'pending'::"public"."friendreqstatus",
    "id" bigint NOT NULL,
    CONSTRAINT "different_ids" CHECK (("sender_user_id" <> "recipient_user_id"))
);


ALTER TABLE "public"."friendreqs" OWNER TO "postgres";


ALTER TABLE "public"."friendreqs" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."friendreqs_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."friends" (
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "user1_id" bigint NOT NULL,
    "user2_id" bigint NOT NULL,
    CONSTRAINT "different_ids" CHECK (("user1_id" <> "user2_id"))
);


ALTER TABLE "public"."friends" OWNER TO "postgres";


COMMENT ON TABLE "public"."friends" IS 'Contains all relations between friends. user1_id is the lower id, user2_id is the higher id';



CREATE TABLE IF NOT EXISTS "public"."matchinvites" (
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "sender_user_id" bigint NOT NULL,
    "recipient_user_id" bigint NOT NULL,
    "event" "text",
    "countdown_secs" bigint,
    "id" bigint NOT NULL,
    "best_of_set_format" smallint,
    "status" "public"."matchinvitestatus" DEFAULT 'pending'::"public"."matchinvitestatus",
    "best_of_solve_format" smallint
);


ALTER TABLE "public"."matchinvites" OWNER TO "postgres";


ALTER TABLE "public"."matchinvites" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."matchinvites_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."session" (
    "sid" character varying NOT NULL,
    "sess" "json" NOT NULL,
    "expire" timestamp(6) without time zone NOT NULL
);


ALTER TABLE "public"."session" OWNER TO "postgres";


ALTER TABLE ONLY "public"."matches"
    ADD CONSTRAINT "Matches_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "Users_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."friendreqs"
    ADD CONSTRAINT "friendreqs_id_key" UNIQUE ("id");



ALTER TABLE ONLY "public"."friendreqs"
    ADD CONSTRAINT "friendreqs_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."friends"
    ADD CONSTRAINT "friends_pkey" PRIMARY KEY ("user1_id", "user2_id");



ALTER TABLE ONLY "public"."matchinvites"
    ADD CONSTRAINT "matchinvites_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."session"
    ADD CONSTRAINT "session_pkey" PRIMARY KEY ("sid");



ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "unique_profile_id" UNIQUE ("profile_id");



ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "unique_wcaid" UNIQUE ("wcaid");



ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "unique_wcaid_profile_id" UNIQUE ("wcaid", "profile_id");



CREATE INDEX "IDX_session_expire" ON "public"."session" USING "btree" ("expire");



CREATE OR REPLACE TRIGGER "add_friends_trigger" AFTER UPDATE OF "status" ON "public"."friendreqs" FOR EACH ROW EXECUTE FUNCTION "public"."add_friends_on_accept"();



CREATE OR REPLACE TRIGGER "check_existing_and_reverse_friend_request" BEFORE INSERT ON "public"."friendreqs" FOR EACH ROW EXECUTE FUNCTION "public"."prevent_existing_and_reverse_friend_requests"();



ALTER TABLE ONLY "public"."friendreqs"
    ADD CONSTRAINT "FriendReqs_recipient_user_id_fkey" FOREIGN KEY ("recipient_user_id") REFERENCES "public"."users"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."friendreqs"
    ADD CONSTRAINT "FriendReqs_sender_user_id_fkey" FOREIGN KEY ("sender_user_id") REFERENCES "public"."users"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."friends"
    ADD CONSTRAINT "friends_user1_id_fkey" FOREIGN KEY ("user1_id") REFERENCES "public"."users"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."friends"
    ADD CONSTRAINT "friends_user2_id_fkey" FOREIGN KEY ("user2_id") REFERENCES "public"."users"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."matches"
    ADD CONSTRAINT "matches_player_1_id_fkey" FOREIGN KEY ("player_1_id") REFERENCES "public"."users"("id") ON UPDATE CASCADE ON DELETE SET NULL;



ALTER TABLE ONLY "public"."matches"
    ADD CONSTRAINT "matches_player_2_id_fkey" FOREIGN KEY ("player_2_id") REFERENCES "public"."users"("id") ON UPDATE CASCADE ON DELETE SET NULL;



ALTER TABLE ONLY "public"."matchinvites"
    ADD CONSTRAINT "matchinvites_recipient_user_id_fkey" FOREIGN KEY ("recipient_user_id") REFERENCES "public"."users"("id");



ALTER TABLE ONLY "public"."matchinvites"
    ADD CONSTRAINT "matchinvites_sender_user_id_fkey" FOREIGN KEY ("sender_user_id") REFERENCES "public"."users"("id");



CREATE POLICY "Enable read access for all users" ON "public"."friendreqs" FOR SELECT USING (true);



CREATE POLICY "Enable read access for all users" ON "public"."friends" FOR SELECT USING (true);



CREATE POLICY "Enable read access for all users" ON "public"."matches" FOR SELECT USING (true);



CREATE POLICY "Enable read access for all users" ON "public"."matchinvites" FOR SELECT USING (true);



CREATE POLICY "Enable read access for all users" ON "public"."users" FOR SELECT USING (true);



ALTER TABLE "public"."friendreqs" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."friends" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."matches" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."matchinvites" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."session" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."users" ENABLE ROW LEVEL SECURITY;


GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";



GRANT ALL ON FUNCTION "public"."add_friends_on_accept"() TO "anon";
GRANT ALL ON FUNCTION "public"."add_friends_on_accept"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."add_friends_on_accept"() TO "service_role";



GRANT ALL ON FUNCTION "public"."prevent_existing_and_reverse_friend_requests"() TO "anon";
GRANT ALL ON FUNCTION "public"."prevent_existing_and_reverse_friend_requests"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."prevent_existing_and_reverse_friend_requests"() TO "service_role";



GRANT ALL ON FUNCTION "public"."prevent_existing_friend_requests"() TO "anon";
GRANT ALL ON FUNCTION "public"."prevent_existing_friend_requests"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."prevent_existing_friend_requests"() TO "service_role";



GRANT ALL ON FUNCTION "public"."prevent_requests_for_existing_friends"() TO "anon";
GRANT ALL ON FUNCTION "public"."prevent_requests_for_existing_friends"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."prevent_requests_for_existing_friends"() TO "service_role";



GRANT ALL ON FUNCTION "public"."prevent_reverse_friend_requests"() TO "anon";
GRANT ALL ON FUNCTION "public"."prevent_reverse_friend_requests"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."prevent_reverse_friend_requests"() TO "service_role";



GRANT ALL ON FUNCTION "public"."trigger_set_timestamp"() TO "anon";
GRANT ALL ON FUNCTION "public"."trigger_set_timestamp"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."trigger_set_timestamp"() TO "service_role";



GRANT ALL ON TABLE "public"."matches" TO "anon";
GRANT ALL ON TABLE "public"."matches" TO "authenticated";
GRANT ALL ON TABLE "public"."matches" TO "service_role";



GRANT ALL ON SEQUENCE "public"."Matches_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."Matches_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."Matches_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."users" TO "anon";
GRANT ALL ON TABLE "public"."users" TO "authenticated";
GRANT ALL ON TABLE "public"."users" TO "service_role";



GRANT ALL ON SEQUENCE "public"."Users_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."Users_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."Users_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."friendreqs" TO "anon";
GRANT ALL ON TABLE "public"."friendreqs" TO "authenticated";
GRANT ALL ON TABLE "public"."friendreqs" TO "service_role";



GRANT ALL ON SEQUENCE "public"."friendreqs_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."friendreqs_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."friendreqs_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."friends" TO "anon";
GRANT ALL ON TABLE "public"."friends" TO "authenticated";
GRANT ALL ON TABLE "public"."friends" TO "service_role";



GRANT ALL ON TABLE "public"."matchinvites" TO "anon";
GRANT ALL ON TABLE "public"."matchinvites" TO "authenticated";
GRANT ALL ON TABLE "public"."matchinvites" TO "service_role";



GRANT ALL ON SEQUENCE "public"."matchinvites_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."matchinvites_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."matchinvites_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."session" TO "anon";
GRANT ALL ON TABLE "public"."session" TO "authenticated";
GRANT ALL ON TABLE "public"."session" TO "service_role";



ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "service_role";






RESET ALL;
