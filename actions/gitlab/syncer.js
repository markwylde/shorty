const throttledQueue = require('throttled-queue')
const throttle = throttledQueue(10, 1000)
const getUrl = require('./services/http-utils')

async function syncIssues (projectId, page=1) {
  const url = `https://gitlab.com/api/v4/projects/${projectId}/issues?per_page=20&page=${page}`

  const issues = await getUrl(url, throttle)

  if (issues.headers['x-next-page']) {
    syncIssues(projectId, page + 1)
  }

  const promises = issues.body
    .map(async issue => {
      const existing = await db.issues.find({id: issue.id })

      if (existing.length > 0) {
        await db.issues.update({id: issue.id }, issue)
      } else {
        await db.issues.insert(issue)
      }
    })

  await Promise.all(promises)
}

async function syncProjects (page=1) {
  return "DISABLED"

  try {
    const url = `https://gitlab.com/api/v4/projects?per_page=20&page=${page}`

    //const projects = await getUrl(url, throttle)
    const projects = require('./prefetch.json')

    if (projects.headers['x-next-page']) {
      syncProjects(page + 1)
    }

    const promises = projects.body
      .map(async project => {
        await db.repos.upsert({id: project.id }, project)

        syncIssues(project.id)
      })

    await Promise.all(promises)
  } catch (error) {
    console.log(error)
  }
}

module.exports = {
  startSync: syncProjects
}
