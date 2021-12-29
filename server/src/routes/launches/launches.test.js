const request = require('supertest');
const app = require('../../app');

describe('Test GET /launches', () => {
  test('It should respond with 200 success', async () => {
    const response = await request(app).get('/launches').expect('Content-type', /json/)
      .expect(200);
  });
});

describe('Test POST /launch', () => {
  const completeLaunchData = {
    mission: 'USS',
    rocket: 'Rocket',
    target: 'Kepler-186',
    launchDate: 'January 12, 2100'
  };

  const launchDataWithoutDate = {
    mission: 'USS',
    rocket: 'Rocket',
    target: 'Kepler-186',
  };

  const launchDatWithInvalidDate = {
    mission: 'USS',
    rocket: 'Rocket',
    target: 'Kepler-186',
    launchDate: 'Janzoot'
  };

  test('It should respond with 201 success', async () => {
    const response = await request(app).post('/launches').send(completeLaunchData)
      .expect('Content-Type', /json/)
      .expect(201);

    const requestDate = new Date(completeLaunchData.launchDate).valueOf();
    const responseDate = new Date(response.body.launchDate).valueOf();
    expect(responseDate).toBe(requestDate);
    expect(response.body).toMatchObject(launchDataWithoutDate);
  });

  test('It should catch missing required properties', async () => {
    const response = await request(app).post('/launches').send(launchDataWithoutDate)
      .expect('Content-Type', /json/)
      .expect(400);

    expect(response.body).toStrictEqual({
      error: 'Missing required fields',
    });
  });

  test('It should catch invalid dates', async () => {
    const response = await request(app).post('/launches').send(launchDatWithInvalidDate)
      .expect('Content-Type', /json/)
      .expect(400);

    expect(response.body).toStrictEqual({
      error: 'Invalid launch date'
    });
  });
});
