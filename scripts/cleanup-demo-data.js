const fs = require("fs");
const path = require("path");

const outputFile = path.join(__dirname, "..", "demo", "generated-demo-data.json");

if (fs.existsSync(outputFile)) {
  fs.unlinkSync(outputFile);
  console.log(`Removed ${outputFile}`);
} else {
  console.log("No generated demo data file found.");
}
