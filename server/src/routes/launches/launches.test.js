const request = require('supertest');
const app = require('../../app');
const {
  mongoConnect,
  mongoDisconnect,
} = require('../../services/mongo');
const { loadPlanetsData } = require('../../models/planets.model');

describe('Launches API', () => {
  beforeAll(async () => {
    await mongoConnect();
    await loadPlanetsData();
  });

  afterAll(async () => {
    await mongoDisconnect();
  });

  describe('Test GET /launches', () => {
    test('It should respond with 200 success', async () => {
      const response = await request(app)
        .get('/v1/launches')
        .expect('Content-type', /json/)
        .expect(200);
    });
  });

  describe('Test POST /launch', () => {
    const completeLaunchData = {
      mission: 'USS',
      rocket: 'Rocket',
      target: 'Kepler-62 f',
      launchDate: 'January 12, 2100',
    };

    const launchDataWithoutDate = {
      mission: 'USS',
      rocket: 'Rocket',
      target: 'Kepler-62 f',
    };

    const launchDatWithInvalidDate = {
      mission: 'USS',
      rocket: 'Rocket',
      target: 'Kepler-62 f',
      launchDate: 'Janzoot',
    };

    test('It should respond with 201 success', async () => {
      const response = await request(app)
        .post('/v1/launches')
        .send(completeLaunchData)
        .expect('Content-Type', /json/)
        .expect(201);

      const requestDate = new Date(completeLaunchData.launchDate).valueOf();
      const responseDate = new Date(response.body.launchDate).valueOf();
      expect(responseDate)
        .toBe(requestDate);
      expect(response.body)
        .toMatchObject(launchDataWithoutDate);
    });

    test('It should catch missing required properties', async () => {
      const response = await request(app)
        .post('/v1/launches')
        .send(launchDataWithoutDate)
        .expect('Content-Type', /json/)
        .expect(400);

      expect(response.body)
        .toStrictEqual({
          error: 'Missing required fields',
        });
    });

    test('It should catch invalid dates', async () => {
      const response = await request(app)
        .post('/v1/launches')
        .send(launchDatWithInvalidDate)
        .expect('Content-Type', /json/)
        .expect(400);

      expect(response.body)
        .toStrictEqual({
          error: 'Invalid launch date',
        });
    });
  });
});

