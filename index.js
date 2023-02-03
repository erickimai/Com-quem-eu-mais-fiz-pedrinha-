const express = require('express');
const axios = require('axios');
const app = express();
const characterId = 115039442;
const dungeonIds = [6932, 7672, 13982, 14032, 13954, 8079, 14063, 5965];
const data = {};

async function fetchRuns(characterId, dungeonId) {
  const response = await axios.get(`https://raider.io/api/characters/mythic-plus-runs?season=season-df-1&characterId=${characterId}&dungeonId=${dungeonId}`);
  return response.data.runs;
}

async function fetchRunDetails(keystoneRunId) {
  const response = await axios.get(`https://raider.io/api/mythic-plus/runs/season-df-1/${keystoneRunId}`);
  return response.data.keystoneRun.roster;
}

async function main() {
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
}

app.get('/', async (req, res) => {
    await main();
    res.send(data);
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});