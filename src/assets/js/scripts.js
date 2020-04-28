const { ipcRenderer } = require("electron");

const form_checkpoing = document.getElementById('form_checkpoint')
const btn_checkpoint = document.getElementById('btn_checkpoint')
const div_hour = document.getElementById('hour')

const td_entrada = document.getElementById('td_entrada')
const td_almoco = document.getElementById('td_almoco')
const td_retorno = document.getElementById('td_retorno')
const td_saida = document.getElementById('td_saida')
const loading = document.getElementById('loading')

// let entrada = "00:00";
// let almoco = "00:00";
// let retorno = "00:00";
// let saida = "00:00";

ipcRenderer.on('checkpoint:result', (event, arg) => {
    console.log("IPCRender")
    entrada = arg.entrada
    almoco = arg.almoco
    retorno = arg.retorno
    saida = arg.saida
    console.log(entrada, almoco, retorno, saida)

    fillHours(entrada, almoco, retorno, saida)
})

ipcRenderer.on('checkpoint:return', (event, arg) => {
    console.log(event, arg)
    loading.style.display = "none";
    if (entrada == "00:00") {
        entrada = arg.hour;
        td_entrada.innerText = entrada
        return
    } else if (almoco == "00:00") {
        almoco = arg.hour
        td_almoco.innerHTML = almoco
        return
    } else if (retorno == "00:00") {
        retorno = arg.hour
        td_retorno.innerHTML = retorno
        return
    } else {
        saida = arg.hour
        td_saida.innerHTML = saida
        return
    }
})

form_checkpoint.addEventListener('submit', (event) => {
    event.preventDefault();
    ipcRenderer.send('checkpoint:add')
    loading.style.display = "block";
})

const time = () => {
    const now = new Date()
    console.log("time")
    const hours = now.getHours() < 10 ? "0" + now.getHours() : now.getHours();
    const minutes = now.getMinutes() < 10 ? "0" + now.getMinutes() : now.getMinutes();
    const seconds = now.getSeconds() < 10 ? "0" + now.getSeconds() : now.getSeconds();

    div_hour.innerHTML = `${hours}:${minutes}:${seconds}`
}

const formatHour = (hour) => {
    let h = hour.getHours() < 10 ? '0' + hour.getHours() : hour.getHours()
    let m = hour.getMinutes() < 10 ? '0' + hour.getMinutes() : hour.getMinutes()
    return `${h}:${m}`;
}

const fillHours = (entrada, almoco, retorno, saida) => {
    const e = new Date(new Date().toDateString() + ' ' + entrada)
    const a = new Date(new Date().toDateString() + ' ' + almoco)
    const r = new Date(new Date().toDateString() + ' ' + retorno)
    const s = new Date(new Date().toDateString() + ' ' + saida)

    td_entrada.innerText = entrada
    td_almoco.innerText = almoco
    td_retorno.innerText = retorno
    td_saida.innerText = saida

    const p8h = 8 * 1000 * 60 * 60
    const p1h = 1 * 1000 * 60 * 60

    if (entrada !== "00:00" && almoco == "00:00" && retorno == "00:00") {
        const p1 = formatHour(new Date(e.getTime() + p8h + p1h))
        td_saida.innerText = 'P ' + p1
    } else if (entrada !== "00:00" && almoco !== "00:00" && retorno == "00:00") {
        const p1 = formatHour(new Date(e.getTime() + p8h + p1h))
        td_saida.innerText = 'P ' + p1
    } else if (entrada !== "00:00" && almoco !== "00:00" && retorno !== "00:00") {
        const tI = r.getTime() - a.getTime()
        const p1 = formatHour(new Date(new Date(e.getTime() + p8h + tI)))
        td_saida.innerText = 'P ' + p1
    }
}

const main = () => {
    setInterval(time, 1000);
    fillHours("00:00", "00:00", "00:00", "00:00")
}

main()