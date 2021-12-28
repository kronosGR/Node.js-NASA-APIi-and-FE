const launches = new Map();

const launch = {
  flightNumber: 100,
  mission: 'Kepler Exploration X',
  rocker: 'Explorer',
  launchDate: new Date('December 27, 2030'),
  destination: 'Kepler-442',
  customer: [ 'ZTM', 'NASA' ],
  upcoming: true,
  success: true,
};

launches.set(launch.flightNumber, launch);

module.exports = {
  launches
};