CREATE TABLE "attacks" (
    "id" serial PRIMARY KEY NOT NULL,
    "name" text NOT NULL,
    "bonus" integer NOT NULL,
    "range" text NOT NULL,
    "damage" text NOT NULL,
    "damage_type" text NOT NULL,
    "ammo_type" text,
    "created_at" timestamp DEFAULT now() NOT NULL,
    "updated_at" timestamp DEFAULT now() NOT NULL,
    CONSTRAINT "attacks_name_unique" UNIQUE("name")
);
