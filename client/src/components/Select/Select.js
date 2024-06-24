import React from "react"
import { FaChevronDown } from 'react-icons/fa';
import './select.css'

const Select = ({handleDropdownChange}) => {

    return (
        <>
         <div className="select-container">
            <select onChange={handleDropdownChange} className="select">
                <option>user</option>
                <option>evan</option>
                <option>nikki</option>
            </select>
            <FaChevronDown  className="chevron" />
            </div>
        </>
    )
}

export default Select