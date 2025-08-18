-- Link character_skills to skill_sets and remove obsolete skills table
ALTER TABLE character_skills
  DROP COLUMN IF EXISTS skill_id,
  ADD COLUMN IF NOT EXISTS skill_set_id integer REFERENCES skill_sets(id);

DROP TABLE IF EXISTS skills;

ALTER TABLE skill_sets
  DROP COLUMN IF EXISTS points,
  DROP COLUMN IF EXISTS skills,
  DROP COLUMN IF EXISTS feats,
  ADD COLUMN IF NOT EXISTS ability text NOT NULL DEFAULT 'Intelligence',
  ADD COLUMN IF NOT EXISTS untrained boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS focus_options text[],
  ALTER COLUMN description SET NOT NULL;
