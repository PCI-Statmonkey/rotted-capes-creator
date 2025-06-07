CREATE TABLE "character_feats" (
    "id" serial PRIMARY KEY NOT NULL,
    "character_id" integer NOT NULL REFERENCES "characters"("id") ON DELETE cascade,
    "feat_id" integer REFERENCES "feats"("id"),
    "name" text NOT NULL,
    "source" text,
    "skill_set_name" text
);

CREATE TABLE "character_powers" (
    "id" serial PRIMARY KEY NOT NULL,
    "character_id" integer NOT NULL REFERENCES "characters"("id") ON DELETE cascade,
    "power_id" integer REFERENCES "powers"("id"),
    "name" text NOT NULL,
    "description" text,
    "cost" integer,
    "rank" integer,
    "perks" jsonb NOT NULL DEFAULT '[]',
    "flaws" jsonb NOT NULL DEFAULT '[]'
);

CREATE TABLE "character_skills" (
    "id" serial PRIMARY KEY NOT NULL,
    "character_id" integer NOT NULL REFERENCES "characters"("id") ON DELETE cascade,
    "skill_id" integer REFERENCES "skills"("id"),
    "name" text NOT NULL,
    "ability" text NOT NULL,
    "ranks" integer NOT NULL,
    "specialization" text,
    "trained" boolean NOT NULL DEFAULT true
);

CREATE TABLE "character_gear" (
    "id" serial PRIMARY KEY NOT NULL,
    "character_id" integer NOT NULL REFERENCES "characters"("id") ON DELETE cascade,
    "gear_id" integer REFERENCES "gear"("id"),
    "name" text NOT NULL,
    "description" text
);

CREATE TABLE "character_complications" (
    "id" serial PRIMARY KEY NOT NULL,
    "character_id" integer NOT NULL REFERENCES "characters"("id") ON DELETE cascade,
    "name" text NOT NULL,
    "description" text NOT NULL
);
