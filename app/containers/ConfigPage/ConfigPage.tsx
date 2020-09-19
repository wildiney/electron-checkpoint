import React, { useState, useEffect } from 'react'
import {
    BrowserRouter as Router,
    Switch,
    Route,
    Link,
    Redirect
} from "react-router-dom";

import Button from '../../components/Button/Button'

import styles from './ConfigPage.css'

export default function ConfigPage() {
    const [user, setUser] = useState(localStorage.getItem("user"))
    const [password, setPassword] = useState(localStorage.getItem("password"))
    const [company, setCompany] = useState(localStorage.getItem("company"))
    const [url, setUrl] = useState(localStorage.getItem("url"))

    const saveHandler = () => {
        localStorage.setItem("user", user)
        localStorage.setItem("password", password)
        localStorage.setItem("company", company)
        localStorage.setItem("url", url)
    }

    useEffect(() => {
        // setUser(localStorage.getItem("user"))
        // setPassword(localStorage.getItem("password"))
    })
    return (

        <div className={styles.container}>
            <h2>Configurações</h2>
            <Link to="/" className={styles.btn_config}>
                <i className="fas fa-sliders-h"></i>
            </Link>
            <div className={styles.form_group}>
                <input type="text" name="url" value={url} onChange={e => setUrl(e.target.value)} placeholder="URL" />
            </div>
            <div className={styles.form_group}>
                <select name="company" value={company} onChange={e => setCompany(e.currentTarget.value)}>
                    <option value="-">-----------------</option>
                    <option value="2">2 - Indra Company</option>
                </select>
            </div>
            <div className={styles.form_group}>
                <input type="text" name="user" value={user} onChange={e => setUser(e.target.value)} placeholder="user" />
            </div>
            <div className={styles.form_group}>
                <input type="password" name="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="password" />
            </div>
            <div className={styles.form_group}>
                <Button click={saveHandler()} label="Salvar" />
            </div>
        </div >
    )
}


