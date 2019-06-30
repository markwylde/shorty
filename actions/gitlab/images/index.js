const fs = require('fs')
const path = require('path')

function createBase64Image (location) {
  return `
    data:image/png;base64,${fs.readFileSync(path.join(__dirname, location)).toString('base64')}
  `.trim()
}

module.exports = {
  issue: createBase64Image('issue.png'),
  repository: createBase64Image('repository.png')
}
