import React from 'react'

import styles from './Button.css'

export default function Button({ click, label, disabled }): JSX.Element {
    return (
        <button className={styles.btn} onClick={click} disabled={disabled}>{label}</button>
    )
}