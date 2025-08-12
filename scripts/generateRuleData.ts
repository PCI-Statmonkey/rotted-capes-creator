import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { z } from 'zod';
import {
  insertFeatSchema,
  insertSkillSchema,
  insertPowerSchema,
  insertGearSchema,
} from '../shared/schema';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const docsDir = path.resolve(__dirname, '../docs');
const clientRulesDir = path.resolve(__dirname, '../client/src/rules');
const seedDir = path.resolve(__dirname, '../server/db/seed');

function writeBoth(filename: string, data: unknown) {
  const json = JSON.stringify(data, null, 2);
  fs.writeFileSync(path.join(clientRulesDir, filename), json);
  fs.writeFileSync(path.join(seedDir, filename), json);
}

function parseSections(content: string, marker: string) {
  const start = content.indexOf(marker);
  const text = start >= 0 ? content.slice(start + marker.length) : content;
  const lines = text.split(/\r?\n/);
  const items: { name: string; body: string[] }[] = [];
  let current: { name: string; body: string[] } | null = null;
  for (const raw of lines) {
    const line = raw.trim();
    const heading = line.match(/^###\s+(.*)/);
    if (heading) {
      if (current) items.push(current);
      current = { name: heading[1].trim(), body: [] };
      continue;
    }
    if (current) current.body.push(line);
  }
  if (current) items.push(current);
  return items.map((it) => ({ name: it.name, text: it.body.join(' ').trim() }));
}

function parseFeats() {
  const file = fs.readFileSync(path.join(docsDir, '2.3_Feats 5.3.md'), 'utf8');
  const sections = parseSections(file, '## Feats');
  const feats = sections
    .filter((s) => !s.name.toLowerCase().includes('top of form') && !s.name.toLowerCase().includes('bottom of form'))
    .map((s) => {
      const obj = {
        name: s.name,
        description: s.text,
        prerequisites: [],
        type: 'normal',
        repeatable: false,
        tags: [],
        notes: '',
        input_label: null,
      };
      return insertFeatSchema.parse(obj);
    });
  return feats;
}

function parsePowers() {
  const file = fs.readFileSync(path.join(docsDir, '3.1_Powers Chapter 5.1.md'), 'utf8');
  const sections = parseSections(file, '## Power Descriptions');
  return sections.map((s) => {
    const burnoutMatch = s.text.match(/\*\*Burnout:\*\*\s*([^*]+)/i);
    const obj = {
      name: s.name,
      description: s.text,
      hasDamageType: false,
      hasTarget: false,
      skillCompatible: false,
      burnout: burnoutMatch ? burnoutMatch[1].trim() : null,
    };
    return insertPowerSchema.parse(obj);
  });
}

function parsePowerSets() {
  const file = fs.readFileSync(path.join(docsDir, '2.1_Character Creation 7.6.md'), 'utf8');
  const regex = /##\s+(.+?) Power Set([\s\S]*?)(?=\n##\s|\n\*\*Option|$)/g;
  const archetypeMap: Record<string, string[]> = {
    Andromorph: ['Shapeshifter'],
    Blaster: ['Blaster', 'Speedster'],
    Brawler: ['Bruiser', 'Speedster'],
    Controller: ['Mentalist', 'Mastermind'],
    Infiltrator: ['Gadgeteer', 'Shapeshifter'],
    Heavy: ['Bruiser', 'Defender'],
    Transporter: ['Speedster', 'Transporter'],
  };
  const sets: any[] = [];
  let match: RegExpExecArray | null;
  while ((match = regex.exec(file)) !== null) {
    const name = match[1].trim();
    const body = match[2];
    const powers = [] as any[];
    body.split(/\r?\n/).forEach((line) => {
      const m = line.match(/^([^:]+):\s*(\d+)/);
      if (m) {
        powers.push({ name: m[1].replace(/\\\*/g, '').trim(), score: Number(m[2]) });
      }
    });
    if (powers.length > 0 && !name.startsWith('Option')) {
      sets.push({ name, powers, requiredArchetypes: archetypeMap[name] || [] });
    }
  }
  return sets;
}

function parsePowerMods() {
  const file = fs.readFileSync(path.join(docsDir, '3.1_Powers Chapter 5.1.md'), 'utf8');
  const start = file.indexOf('# Power Modifications (Flaws and Perks)');
  const text = start >= 0 ? file.slice(start) : file;
  const lines = text.split(/\r?\n/);
  const mods: any[] = [];
  let current: any = null;
  for (const raw of lines) {
    const line = raw.trim();
    const heading = line.match(/^###\s+(.*)/);
    if (heading) {
      if (current) mods.push(current);
      const nameMeta = heading[1].trim();
      const nameMatch = nameMeta.match(/^(.*?)\s*\(([^)]+)\)/);
      let name = nameMeta;
      let type = '';
      let value = 0;
      if (!nameMatch) {
        current = null;
        continue;
      }
      name = nameMatch[1].trim();
      const meta = nameMatch[2];
      const typeMatch = meta.match(/(Perk|Flaw)/i);
      const valueMatch = meta.match(/([+-]\d+)/);
      type = typeMatch ? typeMatch[1].toLowerCase() : '';
      value = valueMatch ? parseInt(valueMatch[1]) : 0;
      current = { name, type, value, restriction: '', effect: '' };
      continue;
    }
    if (!current) continue;
    const restrictionMatch = line.match(/^\*\*(Restriction|Requirement):\*\*\s*(.*)/i);
    if (restrictionMatch) {
      current.restriction = restrictionMatch[2].trim();
      continue;
    }
    const effectMatch = line.match(/^\*\*Effect:\*\*\s*(.*)/i);
    if (effectMatch) {
      current.effect += effectMatch[1].trim();
      continue;
    }
    if (current.effect && line) {
      current.effect += ' ' + line;
    }
  }
  if (current) mods.push(current);
  return mods.map((m) => ({
    name: m.name,
    type: m.type || 'perk',
    value: m.value,
    restriction: m.restriction,
    effect: m.effect.trim(),
  }));
}

function parseSkills() {
  const file = fs.readFileSync(path.join(docsDir, '2.2_Skills 4.1.md'), 'utf8');
  const start = file.indexOf('### Grounded Skill Set');
  const text = start >= 0 ? file.slice(start) : file;
  const lines = text.split(/\r?\n/);
  const items: { name: string; body: string[] }[] = [];
  let current: { name: string; body: string[] } | null = null;
  for (const raw of lines) {
    const line = raw.trim();
    const bold = line.match(/^\*\*(.+?)\*\*/);
    if (bold) {
      if (current) items.push(current);
      current = { name: bold[1].trim(), body: [] };
      continue;
    }
    if (line.startsWith('###')) {
      if (current) items.push(current);
      current = null;
      continue;
    }
    if (current) current.body.push(line);
  }
  if (current) items.push(current);
  return items.map((s) => {
    const obj = {
      name: s.name,
      ability: 'Intelligence',
      description: s.body.join(' ').trim(),
      untrained: true,
      focusOptions: [],
    };
    return insertSkillSchema.parse(obj);
  });
}

function parseGear() {
  const file = fs.readFileSync(path.join(docsDir, '2.4_Gear 3.1.md'), 'utf8');
  const sections = parseSections(file, '### Survivalist Go-Bag');
  return sections.map((s) => {
    const obj = {
      name: s.name,
      description: s.text,
      category: 'general',
      ap: 0,
      tags: [],
    };
    return insertGearSchema.parse(obj);
  });
}

function parseAdvancement() {
  const file = fs.readFileSync(path.join(docsDir, '2.5_Hero Advancement 5.6.md'), 'utf8');
  const sections = parseSections(file, '##  Leveling Features');
  const schema = z.object({ name: z.string(), description: z.string() });
  return sections.map((s) => schema.parse({ name: s.name, description: s.text }));
}

function main() {
  const feats = parseFeats();
  const skills = parseSkills();
  const gear = parseGear();
  const powers = parsePowers();
  const powerSets = parsePowerSets();
  const powerMods = parsePowerMods();
  const advancement = parseAdvancement();

  writeBoth('feats.json', feats);
  writeBoth('skills.json', skills);
  writeBoth('gear.json', gear);
  writeBoth('powers.json', powers);
  writeBoth('powerSets.json', powerSets);
  writeBoth('powerMods.json', powerMods);
  writeBoth('advancement.json', advancement);

  console.log('Generated', {
    feats: feats.length,
    skills: skills.length,
    gear: gear.length,
    powers: powers.length,
    powerSets: powerSets.length,
    powerMods: powerMods.length,
    advancement: advancement.length,
  });
}

main();
