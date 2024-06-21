import React from "react"
import { FaChevronDown } from 'react-icons/fa';

const Dropdown = ({handleDropdownChange}) => {
    const style = {
        color: 'yellow',
        backgroundColor: 'black',
        border: '3px solid red',
        fontSize: '2rem',
        padding: '15px',
        outline: 'none',
        appearance: 'none'
    }
    return (
        <>
         <div className="custom-select-container">
            <select onChange={handleDropdownChange} className="custom-select">
                <option>user</option>
                <option>evan</option>
                <option>nikki</option>
            </select>
            <FaChevronDown className="custom-chevron" />
            </div>
        </>
    )
}

export default Dropdown