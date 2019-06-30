const path = require('path')

const db = require('./services/data-utils')
const {createWindow} = require('./services/window-utils')
const images = require('./images')
const syncer = require('./syncer')

function buildRepoQueryItem (repo) {
  return {
    title: repo.name,
    description: repo.description,
    image: images.repository,
    url: repo.web_url,
    category: '<strong>Gitlab</strong> - Repositories',
    buttons: [{
      title: 'Open in Browser',
      cmd: ['browser:launch', repo.web_url]
    }, {
      title: 'Quick View',
      cmd: ['browser:launch', repo.web_url]
    }]
  }
}

function buildIssueQueryItem (issue) {
  return {
    title: issue.title,
    description: issue.description,
    image: images.issue,
    url: issue.web_url,
    category: '<strong>Gitlab</strong> - Issues',
    buttons: [{
      title: 'Open in Browser',
      cmd: ['browser:launch', issue.web_url]
    }, {
      title: 'Quick View',
      cmd: ['execute', function () {
        createWindow(path.join(__dirname, 'pages/quick-view-issue.html'), issue)
      }]
    }]
  }
}

async function query (query) {
  const repos = await db.repos.find({name: { $regex: new RegExp(query, 'i')} }, {limit: 10})
  const issues = await db.issues.find({title: { $regex: new RegExp(query, 'i')} }, {limit: 10})

  return [
    repos.map(buildRepoQueryItem),
    issues.map(buildIssueQueryItem)
  ].flat()
}

function refresh () {
  return syncer.startSync()
}

module.exports = {
  refresh,
  query
}
