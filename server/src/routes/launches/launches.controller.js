const {
  getAllLaunches,
  scheduleNewLaunch,
  existsLaunchWithId,
  abortLaunchById,
} = require("../../model/launches.model");
const getPagination = require("../../services/query");
async function httpGetAllLaunches(req, resp) {
  const { skip, limit } = getPagination(req.query);
  return resp.status(200).json(await getAllLaunches(skip, limit));
}
async function httpAddNewLaunch(req, resp) {
  const launch = req.body;
  if (
    !launch.mission ||
    !launch.rocket ||
    !launch.launchDate ||
    !launch.destination
  ) {
    return resp.status(400).json({
      error: "Missing required lauch property",
    });
  }
  launch.launchDate = new Date(launch.launchDate);
  if (isNaN(launch.launchDate)) {
    return resp.status(400).json({
      error: "Invalid launch Date",
    });
  }
  await scheduleNewLaunch(launch);

  return resp.status(201).json(launch);
}

async function httpAbortLaunch(req, resp) {
  const launchId = Number(req.params.id);
  if (!(await existsLaunchWithId(launchId))) {
    return resp.status(404).json({
      error: "Launch Not Found",
    });
  }
  const aborted = await abortLaunchById(launchId);
  if (!aborted)
    return resp.status(400).json({
      error: "Launch not aborted",
    });
  return resp.status(200).json({
    ok: true,
  });
}
module.exports = { httpGetAllLaunches, httpAddNewLaunch, httpAbortLaunch };
