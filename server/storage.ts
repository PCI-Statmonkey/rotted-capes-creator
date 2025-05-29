import { pool } from "./db";

// TypeScript session extension
declare module 'express-session' {
  export interface SessionData {
    user: {
      id: string;
      username: string;
      isAdmin: boolean;
    };
  }
}

export const storage = {
  // ORIGIN
  getAllOrigin: async () => {
    const { rows } = await pool.query("SELECT * FROM origins ORDER BY id");
    return rows;
  },
  getOriginById: async (id: number) => {
    const { rows } = await pool.query("SELECT * FROM origins WHERE id = $1", [id]);
    return rows[0];
  },
  createOrigin: async (data: any) => {
    const { name, description } = data;
    const { rows } = await pool.query(
      "INSERT INTO origins (name, description) VALUES ($1, $2) RETURNING *",
      [name, description]
    );
    return rows[0];
  },
  updateOrigin: async (id: number, data: any) => {
    const { name, description } = data;
    const { rows } = await pool.query(
      "UPDATE origins SET name = $1, description = $2 WHERE id = $3 RETURNING *",
      [name, description, id]
    );
    return rows[0];
  },
  deleteOrigin: async (id: number) => {
    await pool.query("DELETE FROM origins WHERE id = $1", [id]);
  },

  // ARCHETYPE
  getAllArchetype: async () => {
    const { rows } = await pool.query("SELECT * FROM archetypes ORDER BY id");
    return rows;
  },
  getArchetypeById: async (id: number) => {
    const { rows } = await pool.query("SELECT * FROM archetypes WHERE id = $1", [id]);
    return rows[0];
  },
  createArchetype: async (data: any) => {
    const { name, description } = data;
    const { rows } = await pool.query(
      "INSERT INTO archetypes (name, description) VALUES ($1, $2) RETURNING *",
      [name, description]
    );
    return rows[0];
  },
  updateArchetype: async (id: number, data: any) => {
    const { name, description } = data;
    const { rows } = await pool.query(
      "UPDATE archetypes SET name = $1, description = $2 WHERE id = $3 RETURNING *",
      [name, description, id]
    );
    return rows[0];
  },
  deleteArchetype: async (id: number) => {
    await pool.query("DELETE FROM archetypes WHERE id = $1", [id]);
  },

  // SKILL
  getAllSkill: async () => {
    const { rows } = await pool.query("SELECT * FROM skills ORDER BY id");
    return rows;
  },
  getSkillById: async (id: number) => {
    const { rows } = await pool.query("SELECT * FROM skills WHERE id = $1", [id]);
    return rows[0];
  },
  createSkill: async (data: any) => {
    const { name, category, description } = data;
    const { rows } = await pool.query(
      "INSERT INTO skills (name, category, description) VALUES ($1, $2, $3) RETURNING *",
      [name, category, description]
    );
    return rows[0];
  },
  updateSkill: async (id: number, data: any) => {
    const { name, category, description } = data;
    const { rows } = await pool.query(
      "UPDATE skills SET name = $1, category = $2, description = $3 WHERE id = $4 RETURNING *",
      [name, category, description, id]
    );
    return rows[0];
  },
  deleteSkill: async (id: number) => {
    await pool.query("DELETE FROM skills WHERE id = $1", [id]);
  },

  // FEAT
  getAllFeat: async () => {
    const { rows } = await pool.query("SELECT * FROM feats ORDER BY id");
    return rows;
  },
  getFeatById: async (id: number) => {
    const { rows } = await pool.query("SELECT * FROM feats WHERE id = $1", [id]);
    return rows[0];
  },
  createFeat: async (data: any) => {
    const { name, description } = data;
    const { rows } = await pool.query(
      "INSERT INTO feats (name, description) VALUES ($1, $2) RETURNING *",
      [name, description]
    );
    return rows[0];
  },
  updateFeat: async (id: number, data: any) => {
    const { name, description } = data;
    const { rows } = await pool.query(
      "UPDATE feats SET name = $1, description = $2 WHERE id = $3 RETURNING *",
      [name, description, id]
    );
    return rows[0];
  },
  deleteFeat: async (id: number) => {
    await pool.query("DELETE FROM feats WHERE id = $1", [id]);
  },

  // SKILL SET
  getAllSkillSet: async () => {
    const { rows } = await pool.query("SELECT * FROM skill_sets ORDER BY id");
    return rows;
  },
  getSkillSetById: async (id: number) => {
    const { rows } = await pool.query("SELECT * FROM skill_sets WHERE id = $1", [id]);
    return rows[0];
  },
  createSkillSet: async (data: any) => {
    const { name, description } = data;
    const { rows } = await pool.query(
      "INSERT INTO skill_sets (name, description) VALUES ($1, $2) RETURNING *",
      [name, description]
    );
    return rows[0];
  },
  updateSkillSet: async (id: number, data: any) => {
    const { name, description } = data;
    const { rows } = await pool.query(
      "UPDATE skill_sets SET name = $1, description = $2 WHERE id = $3 RETURNING *",
      [name, description, id]
    );
    return rows[0];
  },
  deleteSkillSet: async (id: number) => {
    await pool.query("DELETE FROM skill_sets WHERE id = $1", [id]);
  },

  // POWER
  getAllPower: async () => {
    const { rows } = await pool.query("SELECT * FROM powers ORDER BY id");
    return rows;
  },
  getPowerById: async (id: number) => {
    const { rows } = await pool.query("SELECT * FROM powers WHERE id = $1", [id]);
    return rows[0];
  },
  createPower: async (data: any) => {
    const { name, description } = data;
    const { rows } = await pool.query(
      "INSERT INTO powers (name, description) VALUES ($1, $2) RETURNING *",
      [name, description]
    );
    return rows[0];
  },
  updatePower: async (id: number, data: any) => {
    const { name, description } = data;
    const { rows } = await pool.query(
      "UPDATE powers SET name = $1, description = $2 WHERE id = $3 RETURNING *",
      [name, description, id]
    );
    return rows[0];
  },
  deletePower: async (id: number) => {
    await pool.query("DELETE FROM powers WHERE id = $1", [id]);
  },

  // POWER SET
  getAllPowerSet: async () => {
    const { rows } = await pool.query("SELECT * FROM power_sets ORDER BY id");
    return rows;
  },
  getPowerSetById: async (id: number) => {
    const { rows } = await pool.query("SELECT * FROM power_sets WHERE id = $1", [id]);
    return rows[0];
  },
  createPowerSet: async (data: any) => {
    const { name, description } = data;
    const { rows } = await pool.query(
      "INSERT INTO power_sets (name, description) VALUES ($1, $2) RETURNING *",
      [name, description]
    );
    return rows[0];
  },
  updatePowerSet: async (id: number, data: any) => {
    const { name, description } = data;
    const { rows } = await pool.query(
      "UPDATE power_sets SET name = $1, description = $2 WHERE id = $3 RETURNING *",
      [name, description, id]
    );
    return rows[0];
  },
  deletePowerSet: async (id: number) => {
    await pool.query("DELETE FROM power_sets WHERE id = $1", [id]);
  },

  // POWER MODIFIER
  getAllPowerModifier: async () => {
    const { rows } = await pool.query("SELECT * FROM power_modifiers ORDER BY id");
    return rows;
  },
  getPowerModifierById: async (id: number) => {
    const { rows } = await pool.query("SELECT * FROM power_modifiers WHERE id = $1", [id]);
    return rows[0];
  },
  createPowerModifier: async (data: any) => {
    const { name, description } = data;
    const { rows } = await pool.query(
      "INSERT INTO power_modifiers (name, description) VALUES ($1, $2) RETURNING *",
      [name, description]
    );
    return rows[0];
  },
  updatePowerModifier: async (id: number, data: any) => {
    const { name, description } = data;
    const { rows } = await pool.query(
      "UPDATE power_modifiers SET name = $1, description = $2 WHERE id = $3 RETURNING *",
      [name, description, id]
    );
    return rows[0];
  },
  deletePowerModifier: async (id: number) => {
    await pool.query("DELETE FROM power_modifiers WHERE id = $1", [id]);
  },
};