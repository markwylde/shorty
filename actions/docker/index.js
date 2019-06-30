const path = require('path')
const fs = require('fs')

const {createWindow} = require('./services/window-utils')
const images = require('./images')

const Docker = require('dockerode')
const docker = new Docker({
  host: '192.168.99.105',
  port: 2376,
  ca: fs.readFileSync('/Users/mark/.docker/machine/machines/example/ca.pem'),
  cert: fs.readFileSync('/Users/mark/.docker/machine/machines/example/cert.pem'),
  key: fs.readFileSync('/Users/mark/.docker/machine/machines/example/key.pem'),
  version: 'v1.39'
})

function buildContainerQueryItem (container) {
  return {
    title: container.Names.join(', '),
    description: container.Image,
    image: images.container,
    url: 'none',
    category: '<strong>Docker</strong> - Containers',
    buttons: [{
      title: 'Restart',
      cmd: ['browser:launch', container.web_url]
    }, {
      title: 'Remove',
      cmd: ['browser:launch', container.web_url]
    }, {
      title: 'View Logs',
      cmd: ['browser:launch', container.web_url]
    }]
  }
}

async function query (query) {
  let containers = await docker.listContainers()
  containers = containers.filter(container =>
    container.Names.join(', ').match(new RegExp(query, 'i'))
    || container.Image.match(new RegExp(query, 'i'))
  )

  return [
    containers.map(buildContainerQueryItem)
  ].flat()
}

function refresh () {}

module.exports = {
  refresh,
  query
}
