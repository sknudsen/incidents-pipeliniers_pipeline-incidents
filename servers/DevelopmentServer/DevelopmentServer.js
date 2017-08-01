const Path = require('path')

const ApplicationRoot = require('../../ApplicationRoot.js')

require('dotenv').config({
  path: Path.join(ApplicationRoot, 'servers/DevelopmentServer/.env')
})

const PublicFilesMiddleware = require('../middleware/PublicFilesMiddleware.js')
const WebpackDevMiddleware = require('../middleware/WebpackDevMiddleware.js')
const DevelopmentPageMiddleware = require('../middleware/DevelopmentPageMiddleware.js')

Server = require('../Server.js')

Server([
  PublicFilesMiddleware(),
  WebpackDevMiddleware(),
  DevelopmentPageMiddleware(),
])
