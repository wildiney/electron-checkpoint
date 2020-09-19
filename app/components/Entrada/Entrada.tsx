import React from 'react';
import classes from './Entrada.css'

export default function Entrada({ label, hour }): JSX.Element {
    return (
        <div className={classes.entrada}>
            <span>{label}: </span><span>{hour}</span>
        </div>
    );
}
