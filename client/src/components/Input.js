import React from "react"
const Input = () => {
    const style = {
        color: 'red',
        backgroundColor: 'black',
        fontSize: '2rem',
        border: '3px solid #ccc',
        padding: '15px',
        outline: 'none',
        width: '200px',
        borderRadius: '4px'

    }
    return <input style={style} placeholder='password' type='password'/>
}

export default Input