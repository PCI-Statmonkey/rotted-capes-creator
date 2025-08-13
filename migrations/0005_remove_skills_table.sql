-- Drop obsolete skills table and reshape skill_sets

DROP TABLE IF EXISTS skills;

ALTER TABLE skill_sets
  DROP COLUMN IF EXISTS points,
  DROP COLUMN IF EXISTS skills,
  DROP COLUMN IF EXISTS feats,
  ADD COLUMN IF NOT EXISTS ability text NOT NULL DEFAULT 'Intelligence',
  ADD COLUMN IF NOT EXISTS untrained boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS focus_options text[],
  ALTER COLUMN description SET NOT NULL;
