import React, { useState, useEffect } from 'react';
import { ipcRenderer, ipcMain } from 'electron'
import Moment from 'moment'
import { formatHour, formatMomentJSTime } from '../../utils/FormatHour'
import { BrowserRouter as Router, Switch, Route, Link, Redirect } from "react-router-dom";

import routes from '../../constants/routes.json';
import Entrada from '../../components/Entrada/Entrada'
import Button from '../../components/Button/Button'

import styles from './Checkpoint.css';

export default function Checkpoint(): JSX.Element {
  const [logged, setLogged] = useState(false)

  const [entrada, setEntrada] = useState('00:00')
  const [almoco, setAlmoco] = useState('00:00')
  const [retorno, setRetorno] = useState('00:00')
  const [saida, setSaida] = useState('00:00')

  const [label, setLabel] = useState('Saldo')
  const [horario, setHorario] = useState('00:00')

  const [btnUpdateLabel, setBtnUpdateLabel] = useState("update")
  const [btnCheckpointLabel, setBtnCheckpointLabel] = useState("CHECKPOINT")

  /**
   * Function do make the Checkpoint
   */
  const checkpointHandler = () => {
    console.log('[FUNCTION] Checkpoint')
    ipcRenderer.send('checkpoint:set', {
      user: localStorage.getItem("user"),
      password: localStorage.getItem("password"),
      company: localStorage.getItem("company"),
      url: localStorage.getItem("url")
    })
  }

  /**
   * Function to update the Time Fields
   */
  const updateHandler = () => {
    setBtnUpdateLabel("LOADING")
    console.log('[FUNCTION] Update')
    ipcRenderer.send('checkpoint:get', {
      user: localStorage.getItem("user"),
      password: localStorage.getItem("password"),
      company: localStorage.getItem("company"),
      url: localStorage.getItem("url")
    })
  }

  /**
   * Function to get values from Back End
   */
  ipcRenderer.on('checkpoint:getReturn', (event, arg) => {
    setBtnUpdateLabel("UPDATE")
    setEntrada(arg.entrada)
    setAlmoco(arg.almoco)
    setRetorno(arg.retorno)
    setSaida(arg.saida)
  })

  /**
   * Function 
   */
  const checkTime = () => {
    console.log('[FUNCTION] CheckTime')

    const hora_entrada = Moment(entrada, 'hh:mm') //console.log("Hora Entrada", hora_entrada)
    const hora_almoco = Moment(almoco, 'hh:mm') //console.log("Hora almoço", hora_almoco)
    const hora_retorno = Moment(retorno, 'hh:mm') //console.log("Hora retorno", hora_retorno)
    const hora_agora = Moment(new Date(), 'hh:mm') //console.log("Hora Agora", hora_agora)

    if (
      entrada !== '00:00' && almoco == '00:00' && retorno == '00:00' && saida == '00:00' ||
      entrada !== '00:00' && almoco !== '00:00' && retorno == '00:00' && saida == '00:00'
    ) {

      const exitTime = Moment(hora_entrada).add(9, 'hours')
      setLabel('Previsão de saída')
      setHorario(`${exitTime.hours()}:${exitTime.minutes()}`)

    } else if (entrada !== '00:00' && almoco !== '00:00' && retorno !== '00:00' && saida == '00:00') {

      const interval = Moment.duration(hora_retorno - hora_almoco) //console.log("interval", interval)
      const first_time = Moment.duration(hora_almoco - hora_entrada) //console.log("1P", first_time)
      const second_time = Moment.duration(hora_agora - hora_retorno) //console.log("2P", second_time)
      const workingTime = Moment.duration(first_time + second_time) //console.log("Work Time", workingTime.toISOString())
      const exitTime = hora_entrada.add(8, 'h').add(interval.hours(), "hours").add(interval.minutes(), "minutes") //console.log("Previsão de Saída", exitTime.hours(), exitTime.minutes())
      // const countdown = exitTime.subtract(hora_agora.hours(), "hours").subtract(hora_agora.minutes(), "minutes") //console.log("Countdown", countdown.hours(), countdown.minutes())

      setLabel('Previsão de saída')
      setHorario(`${exitTime.hours()}:${exitTime.minutes()}`)

    }

  }


  useEffect(() => {
    checkTime()
  }, []);

  return (
    <div className={styles.container} >
      <h2>Checkpoint</h2>
      <Link to="/config" className={styles.config}>
        <i className="fas fa-sliders-h"></i>
      </Link>
      <div className={styles.timers}>
        <Entrada label="Entrada" hour={entrada} />
        <Entrada label="Almoço" hour={almoco} />
        <Entrada label="Retorno" hour={retorno} />
        {saida !== "00:00" ? <Entrada label="Saída" hour={saida} /> : <Entrada label={label} hour={horario} />}
      </div>
      <Button click={checkpointHandler} label={btnCheckpointLabel} disabled={btnCheckpointLabel !== "CHECKPOINT"} />
      <Button click={updateHandler} label={btnUpdateLabel} disabled={btnUpdateLabel !== "update"} />
    </div >
  );
}

