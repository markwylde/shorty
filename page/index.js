const {ipcRenderer, shell} = require('electron')

let selectedV = -1
let selectedH = 0

const actions = [
  require('../actions/gitlab'),
  require('../actions/docker')
]

actions.forEach(action => action.refresh())

function selectInputBox () {
  const element = document.querySelector('[autofocus]')
  selectedV = -1
  if (document.activeElement !== element) {
    element.setSelectionRange(0, element.value.length)
    element.focus()
  }
}
document.addEventListener('show', () => {
  const element = document.querySelector('[autofocus]')
  element.blur()
  selectInputBox()
})

document.addEventListener('keydown', (event) => {
  const listItems = document.querySelectorAll('.list-group-item')

  if (event.key === 'Escape') {
    ipcRenderer.send('toggle-window', true)
  }

  const searchInputElement = document.querySelector('[autofocus]')
  if (event.key.startsWith('Arrow')) {
    if (event.key === 'ArrowUp') {
      selectedV = selectedV - 1
    }

    if (event.key === 'ArrowDown') {
      selectedV = selectedV + 1
    }

    if (document.activeElement !== searchInputElement) {
      if (event.key === 'ArrowLeft') {
        selectedH = selectedH - 1
      }

      if (event.key === 'ArrowRight') {
        selectedH = selectedH + 1
      }
    }

    if (selectedH < 0) { selectedH = 0}

    if (selectedV <= -1) {
      selectedV = -1
      if (document.activeElement !== searchInputElement) {
        event.preventDefault()
      }
      selectInputBox()
      return
    }
    if (selectedV >= listItems.length) { selectedV = listItems.length - 1}

    if (selectedV > -1) {
      const elV = listItems[selectedV]
      const elH = elV.querySelectorAll('a')
      if (elH.length < selectedH) { selectedH = elH.length - 1 }
      elH[selectedH].focus()
      event.preventDefault()
    }
  }
})

document.addEventListener('click', (event) => {
  if (event.target.href) {
    shell.openExternal(event.target.href)
    event.preventDefault()
  } else if (event.target.classList.contains('js-refresh-action')) {
    refresh()
  } else if (event.target.classList.contains('js-quit-action')) {
    window.close()
  }
})

const sendNotification = (body) => {
  let notification = new Notification('Go outside', {
    body
  })

  notification.onclick = () => {
    ipcRenderer.send('show-window')
  }
}

function createElementFromHTML (htmlString) {
  const div = document.createElement('div')
  div.innerHTML = htmlString.trim()

  return div.firstChild
}

function refresh () {
  const searchInput = document.getElementById('searchInput')
  searchInput.addEventListener('keyup', async function () {
    let domList = document.createElement('div')

    const template = record => `
      <li class="list-group-item">
        <img class="media-object pull-left" src="${record.image}" width="32" height="32">
        <div class="media-body">
          <strong><a class="a-title" href="${record.url}">${record.title}</a></strong>
          <p>${record.description || '<i>No description for this repo</i>'}</p>
          <div class="inlink-bar">
            <span>Loading buttons</span>
          </div>
        </div>
      </li>
    `

    const promises = actions.map(async action => {
      const results = await action.query(searchInput.value)

      let lastItem
      results.forEach(item => {
        if (!lastItem || lastItem.category !== item.category) {
          const categoryElement = createElementFromHTML(`
            <li class="list-group-category">
              ${item.category}
            </li>
          `)
          domList.appendChild(categoryElement)
        }

        const currentHtml = template(item)
        currentElement = createElementFromHTML(currentHtml)

        item.buttons = item.buttons || []

        const inlinkBar = currentElement.querySelector('.inlink-bar')
        inlinkBar.innerHTML = ''
        item.buttons.forEach(function (button) {
            function runAction () {
              if (button.cmd[0] === 'browser:launch') {
                shell.openExternal(button.cmd[1])
              }

              if (button.cmd[0] === 'execute') {
                button.cmd[1]()
              }
            }

          const buttonElement = document.createElement('a')
          buttonElement.classList = 'inlink inlink-default'
          buttonElement.innerHTML = button.title
          buttonElement.tabIndex = 0
          buttonElement.addEventListener('click', runAction)
          buttonElement.addEventListener('keypress', (event) => {
            if (event.key === 'Enter') {
              runAction()
            }
          })

          inlinkBar.appendChild(buttonElement)
        })

        domList.appendChild(currentElement)

        lastItem = item
      })
    })

    await Promise.all(promises)

    document.getElementById('searchList').innerHTML = ''
    document.getElementById('searchList').appendChild(domList)
  })
}

document.addEventListener('DOMContentLoaded', refresh)
