const { planets } = require('../../models/planets.model')
const { getAllPlanets } = require('./planets.controller');

function httpGetAllPlanets(req, res){
  return res.status(200).json(getAllPlanets());
}

module.exports = {
  httpGetAllPlanets
}