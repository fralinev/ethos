import React, { useState } from "react"
import Button from "./Button"
import Dropdown from "./Dropdown"
import Input from "./Input"
import { useNavigate } from "react-router-dom"

const Entry = () => {
    const [selectedUser, setSelectedUser] = useState(null)
    const navigate = useNavigate();
    const handleDropdownChange = (event) => {
        const user = event.target.value;
        if (user === 'user') {
            setSelectedUser(null)
        } else {
            setSelectedUser(user)
        }
    }
    const onConnectClick = () => {
        console.log("check click")
        navigate('/main')
    }
    return (
        <>
            <div style={{display:'flex', flexDirection:'column', width: "25vw", gap: '30px'}}>
                <h2 style={{ color: "red" }}>entry</h2>
                <Dropdown handleDropdownChange={handleDropdownChange}/>
                {selectedUser && <Input/>}
                <Button clickHandler={onConnectClick} color='red' text='connect' />
            </div>

        </>
    )
}

export default Entry