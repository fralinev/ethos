import React from "react"

const Button = ({color, text, clickHandler}) => {
    const style = {
        color: color,
        backgroundColor: 'black',
        fontSize: '2rem',
        border: '3px solid red',
        padding: '15px',
        cursor: 'pointer'
    }
    return (
        <button onClick={clickHandler} style={style}>{text}</button>
    )
}

export default Button