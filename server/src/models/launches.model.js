const launchesDatabase = require('./launches.mongo');
const planets = require('./planets.mongo');
const axios = require('axios');

const DEFAULT_FLIGHT_NUMBER = 100;

const launches = new Map();

const launch = {
  flightNumber: 100, // flight_number
  mission: 'Kepler Exploration X', //name
  rocker: 'Explorer',  // rocket.name
  launchDate: new Date('December 27, 2030'), // date_local
  target: 'Kepler-442 b', // not applicable
  customers: [ 'ZTM', 'NASA' ], // payload.customers
  upcoming: true,  // upcoming
  success: true, // success
};

saveLaunch(launch);

const SPACEX_API_URL = 'https://api.spacexdata.com/v4/launches/query';

async function loadLaunchData() {
  console.log('Downloading launches data from SpaceX...');
  const response = await axios.post(SPACEX_API_URL, {
    query: {},
    options: {
      pagination: false,
      populate: [
        {
          path: 'rocket',
          select: {
            name: 1
          }
        },
        {
          path: 'payloads',
          select: {
            'customers': 1
          }
        }
      ]
    }
  });

  const launchDocs = response.data.docs;
  for (const launchDoc of launchDocs) {
    const payloads = launchDoc['payloads'];
    const customers = payloads.flatMap((payload)=> {
      return payload['customers'];
    })

    const launch = {
      flightNumber: launchDoc['flight_number'],
      mission: launchDoc['name'],
      rocket: launchDoc['rocket']['name'],
      launchDate: launchDoc['date_local'],
      upcoming: launchDoc['upcoming'],
      success: launchDoc['success'],
      customers: customers
    };

    console.log(`${launch.flightNumber} ${launch.mission}`)
  }

}

async function existsLaunchWithId(launchId) {
  return await launchesDatabase.findOne({
                                          flightNumber: launchId
                                        });
}

async function getLatestFlightNumber() {
  const latestLaunch = await launchesDatabase
    .findOne()
    .sort('-flightNumber'); // Sorting descending with -

  if (!latestLaunch) {
    return DEFAULT_FLIGHT_NUMBER;
  }

  return latestLaunch.flightNumber;
}

async function getAllLaunches() {
  return await launchesDatabase.find({}, {
    '_id': 0,
    '__v': 0
  });
}

async function saveLaunch(launch) {
  const planet = await planets.findOne({
                                         keplerName: launch.target
                                       });

  if (!planet) {
    throw new Error('No matching planet found!');
  }

  await launchesDatabase.findOneAndUpdate({
                                            flightNumber: launch.flightNumber
                                          }, launch, {
                                            upsert: true
                                          });
}

async function scheduleNewLaunch(launch) {
  const newFlightNumber = await getLatestFlightNumber() + 1;
  const newLaunch = Object.assign(launch, {
    success: true,
    upcoming: true,
    customers: [ 'ZTM', 'NASA' ],
    flightNumber: newFlightNumber
  });

  await saveLaunch(newLaunch);
}


async function abortLaunchById(launchId) {
  const aborted = await launchesDatabase.updateOne({
                                                     flightNumber: launchId
                                                   }, {
                                                     upcoming: false,
                                                     success: false
                                                   });

  return aborted.modifiedCount === 1;
}

module.exports = {
  getAllLaunches,
  scheduleNewLaunch,
  existsLaunchWithId,
  abortLaunchById,
  loadLaunchData
};