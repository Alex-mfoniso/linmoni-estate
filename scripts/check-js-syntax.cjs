const fs = require("node:fs");
const path = require("node:path");
const parser = require("@babel/parser");

const roots = ["app", "components", "contexts", "hooks", "services", "utils", "server/src", "server/scripts"];
const files = [];
function walk(directory) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const target = path.join(directory, entry.name);
    if (entry.isDirectory()) walk(target);
    else if (/\.(js|mjs)$/.test(entry.name)) files.push(target);
  }
}
roots.filter(fs.existsSync).forEach(walk);

const failures = [];
for (const file of files) {
  try {
    parser.parse(fs.readFileSync(file, "utf8"), {
      sourceType: "unambiguous",
      plugins: ["jsx", "importMeta", "topLevelAwait"],
    });
  } catch (error) {
    failures.push(`${file}: ${error.message}`);
  }
}
if (failures.length) {
  console.error(failures.join("\n"));
  process.exitCode = 1;
} else {
  console.log(`Parsed ${files.length} JavaScript modules successfully.`);
}
