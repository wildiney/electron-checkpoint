const { ipcRenderer } = require('electron')
const Store = require('electron-store')

const store = new Store()

const config = document.getElementById('config')
const checkpoint = document.getElementById('checkpoint')
const loading = document.getElementById('loading')

const fieldStart = document.getElementById('entrada')
const fieldLaunch = document.getElementById('almoco')
const fieldReturned = document.getElementById('retorno')
const fieldFinished = document.getElementById('saida')

const btnCheckpoint = document.getElementById('btn_checkpoint')
const btnUpdate = document.getElementById('btn_update')
const btnShowConfig = document.getElementById('btn_showConfig')
const btnHideConfig = document.getElementById('btn_hideConfig')
const btnSave = document.getElementById('btn_save')
const timeNow = document.getElementById('timeNow')

const userData = store.get('userData')

const showConfig = () => {
  config.style.display = 'block'
  checkpoint.style.display = 'none'
}

const hideConfig = () => {
  config.style.display = 'none'
  checkpoint.style.display = 'block'
}

btnCheckpoint.addEventListener('click', () => {
  loading.style.display = 'block'
  ipcRenderer.send('checkpoint:add', {
    url: userData.url,
    company: userData.company,
    user: userData.user,
    password: userData.password
  })
  setTimeout(() => { loading.style.display = 'none' }, 30000)
})

btnUpdate.addEventListener('click', () => {
  console.log('Btn Update')
  loading.style.display = 'block'
  ipcRenderer.send('checkpoint:get', {
    url: userData.url,
    company: userData.company,
    user: userData.user,
    password: userData.password
  })
  setTimeout(() => { loading.style.display = 'none' }, 30000)
})

btnShowConfig.addEventListener('click', () => {
  showConfig()
})

btnHideConfig.addEventListener('click', () => {
  hideConfig()
})

btnSave.addEventListener('click', () => {
  const url = document.getElementById('url').value
  const company = document.getElementById('company').value
  const user = document.getElementById('user').value
  const password = document.getElementById('password').value

  store.set('userData', { url, company, user, password })

  hideConfig()
})

ipcRenderer.on('checkpoint:getTimes', (event, arg) => {
  fillHours(arg.entrada, arg.almoco, arg.retorno, arg.saida)
})

ipcRenderer.on('checkpoint:return', (event, arg) => {
  fillHours(arg.entrada, arg.almoco, arg.retorno, arg.saida)
  loading.style.display = 'none'
})

const formatHour = (hour) => {
  const h = hour.getHours() < 10 ? '0' + hour.getHours() : hour.getHours()
  const m = hour.getMinutes() < 10 ? '0' + hour.getMinutes() : hour.getMinutes()
  return `${h}:${m}`
}

const fillHours = (
  entrada,
  almoco,
  retorno,
  saida
) => {
  const e = new Date(new Date().toDateString() + ' ' + entrada)
  const a = new Date(new Date().toDateString() + ' ' + almoco)
  const r = new Date(new Date().toDateString() + ' ' + retorno)
  // const s = new Date(new Date().toDateString() + ' ' + saida)

  fieldStart.innerText = entrada
  fieldLaunch.innerText = almoco
  fieldReturned.innerText = retorno
  fieldFinished.innerText = saida

  const p8h = 8 * 1000 * 60 * 60
  const p1h = 1 * 1000 * 60 * 60

  if (entrada !== '00:00' && almoco === '00:00' && retorno === '00:00') {
    const p1 = formatHour(new Date(e.getTime() + p8h + p1h))
    fieldFinished.innerText = 'P ' + p1
  } else if (entrada !== '00:00' && almoco !== '00:00' && retorno === '00:00') {
    const p1 = formatHour(new Date(e.getTime() + p8h + p1h))
    fieldFinished.innerText = 'P ' + p1
  } else if (entrada !== '00:00' && almoco !== '00:00' && retorno !== '00:00') {
    const tI = r.getTime() - a.getTime()
    const p1 = formatHour(new Date(new Date(e.getTime() + p8h + tI)))
    fieldFinished.innerText = 'P ' + p1
  }
}

const time = () => {
  const now = new Date()
  const hours = now.getHours() < 10 ? '0' + now.getHours() : now.getHours()
  const minutes =
    now.getMinutes() < 10 ? '0' + now.getMinutes() : now.getMinutes()
  const seconds =
    now.getSeconds() < 10 ? '0' + now.getSeconds() : now.getSeconds()

  timeNow.innerText = `${hours}:${minutes}:${seconds}`
}

const main = () => {
  setInterval(time, 1000)
  try {
    if (userData.user !== null) {
      checkpoint.style.display = 'block'
      hideConfig()
    } else {
      config.style.display = 'block'
      showConfig()
    }

    document.getElementById('url').value = userData.url
    document.getElementById('company').value = userData.company
    document.getElementById('user').value = userData.user
    document.getElementById('password').value = userData.password

    ipcRenderer.send('checkpoint:get', {
      url: userData.url,
      company: userData.company,
      user: userData.user,
      password: userData.password
    })
  } catch (e) {
    console.log('Not logged')
  }
  fillHours('00:00', '00:00', '00:00', '00:00')
}

main()
