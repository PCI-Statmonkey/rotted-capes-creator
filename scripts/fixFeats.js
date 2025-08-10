const fs = require("fs");
const path = require("path");

// Adjust these paths to match your project layout
const inputPath = path.join(__dirname, "client", "src", "rules", "feats.json");
const outputPath = path.join(__dirname, "client", "src", "rules", "feats_fixed.json");

// Load the original feats.json
const feats = JSON.parse(fs.readFileSync(inputPath, "utf-8"));

// Clean up the prerequisites
for (const feat of feats) {
  if (Array.isArray(feat.prerequisites)) {
    const fixed = [];
    for (const entry of feat.prerequisites) {
      if (typeof entry === "string" && entry.includes(",")) {
        fixed.push(...entry.split(",").map((s) => s.trim()));
      } else {
        fixed.push(entry);
      }
    }
    feat.prerequisites = fixed;
  }
}

// Save cleaned version
fs.writeFileSync(outputPath, JSON.stringify(feats, null, 2), "utf-8");
console.log("✅ Fixed file written to:", outputPath);
