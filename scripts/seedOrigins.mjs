import fs from 'fs/promises';

const API_URL = 'http://localhost:5000/api/game-content/origins';
const ADMIN_EMAIL = 'admin@rottedcapes.com';

async function seedOrigins() {
  try {
    const file = await fs.readFile('./originSeedData.json', 'utf-8');
    const origins = JSON.parse(file);

    for (const origin of origins) {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Email': ADMIN_EMAIL,
        },
        body: JSON.stringify(origin),
      });

      if (!res.ok) {
        const err = await res.json();
        console.error(`❌ Failed to add ${origin.name}:`, err.message || err);
      } else {
        console.log(`✅ Added origin: ${origin.name}`);
      }
    }
  } catch (err) {
    console.error('🔥 Error reading or sending data:', err.message || err);
  }
}

seedOrigins();
