import React from "react"
const Input = () => {
    const style = {
        color: 'red',
        backgroundColor: 'black',
        fontSize: '2rem',
        border: '3px solid red',
        padding: '15px',
        outline: 'none'

    }
    return <input style={style} type='password'/>
}

export default Input