const planets = require("./planets.mongo");
const { parse } = require("csv-parse");
const fs = require("fs");
const path = require("path");
function isHabitable(planet) {
  return (
    planet.koi_disposition === "CONFIRMED" &&
    planet.koi_insol > 0.36 &&
    planet.koi_insol < 1.11 &&
    planet.koi_prad < 1.6
  );
}
let results = [];
function loadPlanetData() {
  new Promise((resolve, reject) => {
    fs.createReadStream(path.join(__dirname, "..", "..", "data", "kepler.csv"))
      .pipe(
        parse({
          comment: "#",
          columns: true,
        })
      )
      .on("data", async (data) => {
        if (isHabitable(data)) {
          // results.push(data);
          savePlanet(data);
        }
      })
      .on("error", (error) => {
        console.log(error);
        reject(error);
      })
      .on("end", async () => {
        const countPlanets = (await getAllPlanets()).length;
        console.log(countPlanets + " habitable planet");
        console.log(await planets.find({}));
        resolve();
      });
  });
}
async function getAllPlanets() {
  // return results;
  return await planets.find(
    {},
    {
      _id: 0,
      __v: 0,
    }
  );
}
async function savePlanet(planet) {
  try {
    await planets.updateOne(
      {
        keplerName: planet.kepler_name,
      },
      {
        keplerName: planet.kepler_name,
      },
      {
        upsert: true,
      }
    );
  } catch (err) {
    console.log("Could not save Planet " + err);
  }
}

module.exports = {
  loadPlanetData,
  getAllPlanets,
};
