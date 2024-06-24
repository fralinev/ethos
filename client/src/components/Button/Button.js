import React, { useState } from "react"
import "./button.css"

const Button = ({ color, text, clickHandler }) => {
    const [isHovered, setIsHovered] = useState(false)
    

    const style = {
        color: isHovered ? 'black' : color,
        backgroundColor: isHovered ? 'yellow' : 'black'
    }
    console.log("isHovered", isHovered, color, style)

    return (
        <button 
            style={style} 
            className='button' 
            onMouseEnter={() => setIsHovered(true)} 
            onMouseLeave={() => setIsHovered(false)}
            onClick={clickHandler}>{text}
        </button>
    )
}

export default Button