const fs = require('fs')
const path = require('path')

function createBase64Image (location) {
  return `
    data:image/png;base64,${fs.readFileSync(path.join(__dirname, location)).toString('base64')}
  `.trim()
}

module.exports = {
  container: createBase64Image('container.png')
}
