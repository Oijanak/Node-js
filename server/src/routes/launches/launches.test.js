const request = require("supertest");
const app = require("../../app");
const { loadPlanetData } = require("../../model/planets.model");

const { mongoConnect, mongoDisconnect } = require("../../services/mongo");

describe("Launches API test", () => {
  beforeAll(async () => {
    await mongoConnect();
    loadPlanetData();
  });

  afterAll(async () => {
    await mongoDisconnect();
  });

  describe("Test GET /lunches", () => {
    test("It shoild respond 200", async () => {
      const response = await request(app)
        .get("/v1/launches")
        .expect(200)
        .expect("Content-Type", /json/);
    });
  });

  describe("Test POST /launch", () => {
    const completeLaunchData = {
      mission: "Usa234",
      rocket: "MagnusII",
      destination: "Kepler-62 f",
      launchDate: "January 4,2028",
    };

    const launchDataWithoutDate = {
      mission: "Usa234",
      rocket: "MagnusII",
      destination: "Kepler-62 f",
    };

    const launchDataWithInvalidDate = {
      mission: "Usa234",
      rocket: "MagnusII",
      destination: "Kepler-62 f",
      launchDate: "hello",
    };

    test("It shold respond with 201 success", async () => {
      const response = await request(app)
        .post("/v1/launches")
        .send(completeLaunchData)
        .expect(201)
        .expect("Content-Type", /json/);
      const requestDate = new Date(completeLaunchData.launchDate).valueOf();
      const responseDate = new Date(response.body.launchDate).valueOf();
      expect(requestDate).toBe(responseDate);
      expect(response.body).toMatchObject(launchDataWithoutDate);
    });

    test("It should catch missing properties", async () => {
      const response = await request(app)
        .post("/v1/launches")
        .send(launchDataWithoutDate)
        .expect(400)
        .expect("Content-Type", /json/);
      expect(response.body).toStrictEqual({
        error: "Missing required lauch property",
      });
    });

    test("Invalid date", async () => {
      const response = await request(app)
        .post("/v1/launches")
        .send(launchDataWithInvalidDate)
        .expect(400)
        .expect("Content-Type", /json/);
      expect(response.body).toStrictEqual({
        error: "Invalid launch Date",
      });
    });
  });
});
