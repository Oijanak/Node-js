const launchdb = require("./launches.mongo");
const launches = new Map();
const axios = require("axios");
const planets = require("./planets.mongo");
const { default: mongoose } = require("mongoose");
// let latestFlightNumber = 100;
const DEFAULT_FLIGHT_NUMBER = 100;
const launch = {
  flightNumber: 100,
  mission: "Kepler Expolaration X",
  rocket: "Explorer IS1",
  launchDate: new Date("December 27,2030"),
  destination: "Kepler-442 b",
  customer: ["Nasa", "USA"],
  upcoming: true,
  success: true,
};
saveLaunch(launch);

const SPACEX_API_URL = "https://api.spacexdata.com/v4/launches/query";

async function populateLaunches() {
  const response = await axios.post(SPACEX_API_URL, {
    query: {},
    options: {
      pagination: false,
      populate: [
        {
          path: "rocket",
          select: {
            name: 1,
          },
        },
        {
          path: "payloads",
          select: {
            customers: 1,
          },
        },
      ],
    },
  });

  if (response.status !== 200) {
    console.log("Problem Downloaing launch data");
    throw new Error("Launch data download failed");
  }

  const launchDocs = response.data.docs;
  for (const launchDoc of launchDocs) {
    const payloads = launchDoc.payloads;
    const customers = payloads.flatMap((payload) => {
      return payload.customers;
    });
    const launch = {
      flightNumber: launchDoc.flight_number,
      mission: launchDoc.name,
      rocket: launchDoc.rocket.name,
      launchDate: launchDoc.date_local,
      upcoming: launchDoc.upcoming,
      success: launchDoc.success,
      customer: customers,
    };

    console.log(`${launch.flightNumber} ${launch.mission} ${customers}`);
    await saveLaunch(launch);
  }
}

async function loadLaunchData() {
  const firstLaunch = await findLaunch({
    flightNumber: 1,
    rocket: "Falcon 1",
    mission: "FalconSat",
  });
  if (firstLaunch) {
    console.log("Already exists");
  } else {
    await populateLaunches();
  }
}

// launches.set(launch.flightNumber, launch);
async function getAllLaunches(skip, limit) {
  // return Array.from(launches.values());
  return await launchdb
    .find(
      {},
      {
        __v: 0,
        _id: 0,
      }
    )
    .sort({ flightNumber: 1 })
    .skip(skip)
    .limit(limit);
}
async function saveLaunch(launch) {
  await launchdb.findOneAndUpdate(
    {
      flightNumber: launch.flightNumber,
    },
    launch,
    {
      upsert: true,
    }
  );
}

async function scheduleNewLaunch(launch) {
  const planet = await planets.findOne({
    keplerName: launch.destination,
  });
  if (!planet) {
    throw new Error("No matching planet found");
  }
  const newFlightNumber = (await getlatestFlightNumber()) + 1;
  const newLaunch = Object.assign(launch, {
    customer: ["ZTM", "USA"],
    flightNumber: newFlightNumber,
    upcoming: true,
    success: true,
  });
  await saveLaunch(newLaunch);
}

// function addNewLaunch(launch) {
//   latestFlightNumber++;
//   launches.set(
//     latestFlightNumber,
//     Object.assign(launch, {
//       customer: ["ZTM", "USA"],
//       flightNumber: latestFlightNumber,
//       upcoming: true,
//       success: true,
//     })
//   );
// }

async function findLaunch(filter) {
  await launchdb.findOne(filter);
}

async function existsLaunchWithId(launchId) {
  return await launchdb.findOne({
    flightNumber: launchId,
  });
  // launches.has(launchId);
}
async function getlatestFlightNumber() {
  const latestLaunch = await launchdb.findOne().sort("-flightNumber");
  if (!latestLaunch) return DEFAULT_FLIGHT_NUMBER;
  return latestLaunch.flightNumber;
}
async function abortLaunchById(launchId) {
  const aborted = await launchdb.updateOne(
    {
      flightNumber: launchId,
    },
    {
      upcoming: false,
      success: false,
    }
  );
  return aborted.acknowledged === true && aborted.modifiedCount === 1;
  // return aborted.ok === 1 && aborted.nModified === 1;

  // const aborted = launches.get(launchId);
  // aborted.upcoming = false;
  // aborted.success = false;
  // return aborted;
}

module.exports = {
  getAllLaunches,
  scheduleNewLaunch,
  existsLaunchWithId,
  abortLaunchById,
  loadLaunchData,
};
