/**
 * Build basestrike-skill.zip from skills/basestrike/
 * Run from basestrike/: node scripts/zip-skill.js
 */
const fs = require("fs");
const path = require("path");
const archiver = require("archiver");

const skillDir = path.join(__dirname, "..", "skills", "basestrike");
const outPath = path.join(__dirname, "..", "basestrike-skill.zip");

if (!fs.existsSync(skillDir)) {
  console.error("Missing skills/basestrike/");
  process.exit(1);
}

const output = fs.createWriteStream(outPath);
const archive = archiver("zip", { zlib: { level: 9 } });

archive.pipe(output);
archive.directory(skillDir, "basestrike");
archive.finalize();

output.on("close", () => {
  console.log(`Created ${outPath} (${archive.pointer()} bytes)`);
});

archive.on("error", (err) => {
  console.error(err);
  process.exit(1);
});
