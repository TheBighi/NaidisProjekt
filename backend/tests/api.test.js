const request = require("supertest");

jest.mock("../models", () => ({
  EnergyReading: {
    findAll: jest.fn(),
    bulkCreate: jest.fn(),
    destroy: jest.fn()
  },
  sequelize: {
    authenticate: jest.fn()
  }
}));

jest.mock("../services/eleringService", () => ({
  fetchAndSaveEleringData: jest.fn()
}));

const app = require("../app");
const { EnergyReading } = require("../models");

describe("Backend validation and import behavior", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("JSON import skips invalid timestamp and reports duplicates_detected", async () => {
    EnergyReading.findAll.mockResolvedValue([
      { timestamp: "2025-04-01T01:00:00.000Z", location: "EE" }
    ]);
    EnergyReading.bulkCreate.mockResolvedValue([]);

    const payload = [
      { timestamp: "not-a-date", location: "EE", price_eur_mwh: 10.5 },
      { timestamp: "2025-04-01T01:00:00.000Z", location: "EE", price_eur_mwh: 99.99 },
      { timestamp: "2025-04-01T02:00:00.000Z", location: "EE", price_eur_mwh: 45.25 }
    ];

    const response = await request(app).post("/api/import/json").send(payload);

    expect(response.status).toBe(200);
    expect(response.body.duplicates_detected).toBe(1);
    expect(response.body.Inserted).toBe(1);
    expect(response.body.Skipped).toBe(2);
    expect(EnergyReading.bulkCreate).toHaveBeenCalledTimes(1);
  });

  test("GET /api/readings returns validation error for invalid date input", async () => {
    const response = await request(app).get(
      "/api/readings?start=2025-04-01T00:00:00&end=2025-04-02T00:00:00Z&location=EE"
    );

    expect(response.status).toBe(400);
    expect(response.body.error).toBe("VALIDATION_ERROR");
    expect(response.body.message).toContain("Invalid date range");
    expect(EnergyReading.findAll).not.toHaveBeenCalled();
  });
});
