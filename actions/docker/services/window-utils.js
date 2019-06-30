const fs = require('fs')

const marked = require('marked')
const ejs = require('ejs')
const {remote} = require('electron')
const {BrowserWindow} = remote.require('electron')

function createWindow (location, data) {
  const window = new BrowserWindow({
      width: 800,
      height: 600,
      show: true,
      fullscreenable: false,
      alwaysOnTop: true,
      webPreferences: {
        nodeIntegration: true,
        backgroundThrottling: false
      }
    })

  data.formatMarkdown = function (str) {
    marked.setOptions({
      renderer: new marked.Renderer(),
      pedantic: false,
      gfm: true,
      tables: true,
      breaks: false,
      sanitize: false,
      smartLists: true,
      smartypants: false,
      xhtml: false
    })

    return marked(str)
  }

  let pageContent = fs.readFileSync(location, 'utf8')
  pageContent = ejs.render(pageContent, data)
  pageContent = pageContent.replace('</body>', `
    <script>
      const {shell} = require('electron')
      document.addEventListener('click', (event) => {
        if (event.target.href) {
          shell.openExternal(event.target.href)
          event.preventDefault()
        }
      })
    </script>
    </body>
  `)

  window.loadURL('data:text/html;charset=UTF-8,' + encodeURIComponent(pageContent), {
    baseURLForDataURL: `file://${__dirname}`
  })

  // window.openDevTools({mode: 'detach'})
}

module.exports = {
  createWindow
}