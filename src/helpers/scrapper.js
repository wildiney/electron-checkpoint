const puppeteer = require('puppeteer-core')

// eslint-disable-next-line no-unused-vars
class Scrapper {
  constructor (user, password, company, url) {
    this.user = user
    this.password = password
    this.company = company
    this.url = url

    this.browser = ''
    this.page = ''

    if (process.platform === 'darwin') {
      this.execPath =
        '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
    } else {
      this.execPath =
        'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe'
    }
  }

  today () {
    const date = new Date()
    const day = date.getDate() < 10 ? `0${date.getDate()}` : date.getDate()
    const month =
      date.getMonth() + 1 < 10 ? `0${date.getMonth() + 1}` : date.getMonth() + 1
    const year =
      date.getFullYear() < 10 ? `0${date.getFullYear()}` : date.getFullYear()
    return `${day}/${month}/${year}`
  }

  async extractLine (content, lineNumber) {
    const cleanContent = content.replace(/ {2,}/g, ' ')
    const line = cleanContent.split('\n')
    console.log(line[lineNumber])
    const data = line[lineNumber].split(' ')
    // const weekday = data[0]
    const date = data[1]
    const entrada = data[5].includes(':') ? data[5] : '00:00'
    const almoco = data[6].includes(':') ? data[6] : '00:00'
    const retorno = data[7].includes(':') ? data[7] : '00:00'
    const saida = data[8].includes(':') ? data[8] : '00:00'

    return { date, entrada, almoco, retorno, saida }
  }

  async login (headless = false) {
    this.browser = await puppeteer.launch({
      headless: headless,
      executablePath: this.execPath
    })
    this.page = await this.browser.newPage()
    await this.page.goto(this.url)
    // const html = await this.page.content()

    await this.page.select('select[name=requiredempresa]', this.company)
    await this.page.type('input[name=requiredusuario]', this.user, {
      delay: 20
    })
    await this.page.type('input[name=requiredsenha]', this.password, {
      delay: 20
    })
    await this.page.click(
      'body > form > div.quadroLogin_Borda > div.quadroLogin_Conteudo > div:nth-child(3) > div.quadroLogin_Campo > input.BotaoAchatado'
    )
  }

  async getCheckpoints () {
    console.log('Getting Checkpoints')
    console.log('Log in')
    await this.login(true)
    await this.page.waitForSelector('a#menu4.menuBotao')
    console.log('Logged')
    await this.page.click('a#menu4.menuBotao')
    await this.page.waitForSelector('#menu4_Item2 a')
    await this.page.click('#menu4_Item2 a')

    const newPagePromise = new Promise((resolve) =>
      this.browser.once('targetcreated', (target) => resolve(target.page()))
    )
    const popup = await newPagePromise
    await popup.waitForSelector('#rbOpSaida1')
    await popup.waitForSelector('#dtInicio')
    await popup.waitForSelector('#dtFim')
    await popup.waitForSelector('#Submit')

    await popup.click('#rbOpSaida1')
    const getToday = this.today()
    await popup.$eval('#dtInicio', (el, today) => (el.value = today), getToday)
    await popup.$eval('#dtFim', (el, today) => (el.value = today), getToday)
    const newPagePromise2 = new Promise((resolve) =>
      this.browser.once('targetcreated', (target) => resolve(target.page()))
    )
    await popup.click('#Submit')
    const popup2 = await newPagePromise2

    const allPages = await this.browser.pages()
    console.log(allPages.length)

    await popup2.waitForSelector('pre')
    const content = await popup2.$eval('pre', (element) => element.innerHTML)
    await this.browser.close()
    console.log('content', content)

    const extractedData = await this.extractLine(content, 17)
    console.log('Extract Data', extractedData)

    return extractedData
  }

  async checkpoint () {
    console.log('Making Checkpoint')
    console.log('Login')
    await this.login(true)
    await this.page.waitForSelector('a#menu2.menuBotao')
    console.log('Logged')
    await this.page.click('a#menu2.menuBotao')

    const newPagePromise = new Promise((resolve) =>
      this.browser.once('targetcreated', (target) => resolve(target.page()))
    )
    await this.page.click('#menu2_Item1 a')

    const popup = await newPagePromise
    await popup.waitForTimeout(2000)

    const values = await popup.evaluate(() => {
      const data = document.getElementById('data').value
      const hour = document.querySelector('input[name=hora]').value

      return { data, hour }
    })
    popup.click('#Button1')
    await popup.waitForTimeout(2000)

    await this.browser.close()
    return values
  }
}
module.exports = Scrapper
