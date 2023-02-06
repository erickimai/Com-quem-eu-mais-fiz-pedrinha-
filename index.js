const express = require("express");
const port = process.env.PORT || 3030;
const axios = require("axios");
const app = express();
const dungeonIds = [6932, 7672, 13982, 14032, 13954, 8079, 14063, 5965];

async function sortObjectbyValue(obj = {}, asc = true) {
  const ret = {};
  Object.keys(obj)
    .sort((a, b) => obj[asc ? b : a] - obj[asc ? a : b])
    .forEach((s) => (ret[s] = obj[s]));
  return ret;
}

async function fetchRuns(characterId, dungeonId) {
  const response = await axios.get(
    `https://raider.io/api/characters/mythic-plus-runs?season=season-df-1&characterId=${characterId}&dungeonId=${dungeonId}`
  );
  return response.data.runs;
}

async function fetchRunDetails(keystoneRunId) {
  const response = await axios.get(
    `https://raider.io/api/mythic-plus/runs/season-df-1/${keystoneRunId}`
  );
  return response.data.keystoneRun.roster;
}

async function main(characterId) {
  const data = {};
  for (const dungeonId of dungeonIds) {
    const runs = await fetchRuns(characterId, dungeonId);
    for (const run of runs) {
      const keystoneRunId = run.summary.keystone_run_id;
      const roster = await fetchRunDetails(keystoneRunId);
      for (const character of roster) {
        if (!data[character.character.name]) {
          data[character.character.name] = 1;
        } else {
          data[character.character.name] += 1;
        }
      }
    }
  }
  const sortedData = sortObjectbyValue(data);
  return sortedData;
}

app.use(express.static("public"));
app.use(express.static("views"));

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});

app.set("view engine", "pug");

app.get("/", async (req, res) => {
  res.render("index");
});

app.get("/:characterId", async (req, res) => {
  const characterId = req.query.characterId;
  if (characterId !== undefined) {
    const ret = await main(characterId);
    console.log(ret);
    res.render("data", { data: ret });
  }
});
