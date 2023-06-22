const express = require("express");
const path = require("path");

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const app = express();
app.use(express.json());

const dbPath = path.join(__dirname, "cricketTeam.db");

let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();

//Get all players data

app.get("/players/", async (request, response) => {
  const getPlayersQuery = `
    SELECT
      *
    FROM
      cricket_team 
   ;`;
  const playersArray = await db.all(getPlayersQuery);

  response.send(playersArray);
});

//Insert Player Data

app.post("/players/", async (request, response) => {
  const playerDetails = request.body;
  console.log(playerDetails);
  const { playerName, jerseyNumber, role } = playerDetails;
  const addPlayerQuery = `
    INSERT 
    INTO 
    cricket_team (player_name, jersey_number, role)
    
    VALUES (
        '${playerName}',
        '${jerseyNumber}',
        '${role}'
    )
    ;`;
  console.log("response sent");
  const dbResponse = await db.run(addPlayerQuery);
  response.send("Player Added to Team");
  // const playerID = dbResponse.lastID;
});

// Get single player data

app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const getPlayerQuery = `
    SELECT
      *
    FROM
      cricket_team 
      WHERE 
      player_id = '${playerId}'
   ;`;
  const playerDetails = await db.get(getPlayerQuery);

  response.send(playerDetails);
});

// Update player details

app.put("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const playerNewDetails = request.body;
  // console.log(playerNewDetails);
  const { playerName, jerseyNumber, role } = playerNewDetails;

  const updatePlayerQuery = `
    UPDATE
        cricket_team
    SET 
        player_name='${playerName}',
        jersey_number=${jerseyNumber},
        role='${role}'
    
    WHERE player_id = ${playerId}
    ;`;
  await db.run(updatePlayerQuery);
  response.send("Player Details Updated");
});

// Delete Player

app.delete("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  console.log(playerId);
  const deleteQuery = `
    DELETE FROM 
    cricket_team
    WHERE player_id = '${playerId}'
    ;`;
  const dbResponse = await db.run(deleteQuery);
  // console.log(dbResponse);
  response.send("Player Removed");
});

module.exports = app;
