const Datastore = require('nedb')

function initDb(name) {
  const db = new Datastore({ filename: `data/${name}.json`, autoload: true })

  return {
    insert: doc => new Promise((resolve, reject) => {
      db.insert(doc, function (err, newDoc) {
        if (err) {
          return reject(err)
        }

        resolve(newDoc)
      })
    }),

    update: (query, newDoc) => new Promise((resolve, reject) => {
      db.update(query, newDoc, {multi: true}, function (err, numAffected, affectedDocuments, upsert) {
        if (err) {
          return reject(err)
        }

        resolve({numAffected, affectedDocuments, upsert})
      })
    }),

    upsert: (query, newDoc) => new Promise((resolve, reject) => {
      db.update(query, newDoc, {multi: true, upsert: true}, function (err, numAffected, affectedDocuments, upsert) {
        if (err) {
          return reject(err)
        }

        resolve({numAffected, affectedDocuments, upsert})
      })
    }),

    find: (query, opts={}) => new Promise((resolve, reject) => {
      const req = db.find(query)

      if (opts.limit) {
        req.limit(opts.limit)
      }

      req.exec(function (err, docs) {
        if (err) {
          return reject(err)
        }

        resolve(docs)
      })
    })
  }

}

module.exports = {
  repos: initDb('gitlab-repos'),
  issues: initDb('gitlab-issues')
}