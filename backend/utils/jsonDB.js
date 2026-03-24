const fs = require("fs");

const dbPath = "./db.json";

function readDB() {
  return JSON.parse(fs.readFileSync(dbPath, "utf-8"));
}

function writeDB(data) {
  fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
}

module.exports = { readDB, writeDB };