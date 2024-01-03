const express = require("express");
const {
  httpGetAllLaunches,
  httpAddNewLaunch,
  httpAbortLaunch,
} = require("./launches.controller");
const launchesRouter = express.Router();
launchesRouter.get("/", httpGetAllLaunches);
launchesRouter.delete("/:id", httpAbortLaunch);
launchesRouter.post("/", httpAddNewLaunch);
module.exports = launchesRouter;
