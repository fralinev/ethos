import React from "react"

const Dropdown = ({handleDropdownChange}) => {
    const style = {
        color: 'yellow',
        backgroundColor: 'black',
        border: '3px solid red',
        fontSize: '2rem',
        padding: '15px',
        outline: 'none'
    }
    return (
        <>
            <select onChange={handleDropdownChange} style={style}>
                <option>user</option>
                <option>nikki</option>
                <option>evan</option>
            </select>
        </>
    )
}

export default Dropdown