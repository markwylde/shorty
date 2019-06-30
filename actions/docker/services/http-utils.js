const gotOptions = {
  headers: { 'PRIVATE-TOKEN': '' },
  json: true
}

function getUrl (url, throttler) {
  return new Promise((resolve, reject) => {
    throttler(async function () {
      console.log('querying', url)
      try {
        const result = await got(url, gotOptions)
        resolve(result)
      } catch (error) {
        reject(error)
      }
    })
  })
}

module.exports = {
  getUrl
}
