const http = require("http");
const app = require("./app");
require("dotenv").config();
const mongoose = require("mongoose");
const { loadPlanetData } = require("./model/planets.model");
const { loadLaunchData } = require("./model/launches.model");
const { mongoConnect } = require("./services/mongo");
const PORT = process.env.PORT || 8000;

const server = http.createServer(app);

async function startServer() {
  await mongoConnect();
  await loadPlanetData();
  await loadLaunchData();
  server.listen(PORT, () => {
    console.log("Listening to " + PORT);
  });
}
startServer();
