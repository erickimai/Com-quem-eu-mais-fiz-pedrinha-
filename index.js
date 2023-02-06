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

async function fetchId(characterName) {
  const response = await axios.get(
    `https://raider.io/api/search-advanced?type=character&name[0][contains]=${characterName}&realm[0][eq]=US-Stormrage&limit=1`
  );
  return response.data.matches[0].data.id;
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

async function main(characterName) {
  const data = {};
  const characterId = await fetchId(characterName);
  for (const dungeonId of dungeonIds) {
    const runs = await fetchRuns(characterId, dungeonId);
    for (const run of runs) {
      const keystoneRunId = run.summary.keystone_run_id;
      const roster = await fetchRunDetails(keystoneRunId);
      for (const character of roster) {
        if (character.character.name !== characterName) {
          if (!data[character.character.name]) {
            data[character.character.name] = 1;
          } else {
            data[character.character.name] += 1;
          }
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

app.get("/:characterName", async (req, res) => {
  const characterName = req.query.characterName;
  if (characterName !== undefined) {
    const ret = await main(characterName);
    res.render("data", { data: ret, title: `Top amigos do ${characterName}` });
  }
});
