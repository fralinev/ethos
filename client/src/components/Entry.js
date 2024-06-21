import React, { useState } from "react"
import Button from "./Button"
import Dropdown from "./Dropdown"
import Input from "./Input"
import { useNavigate } from "react-router-dom"

const Entry = ({setIsAuthenticated}) => {
    const [selectedUser, setSelectedUser] = useState(null)
    const [password, setPassword] = useState('');
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
        if (password === 'q') {
            setIsAuthenticated(true)
            navigate('/main')
        } else {
            setPassword('')
        }

    }
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
    return (
        <>
            <div style={{display:'flex', flexDirection:'column', width: "25rem", gap: '30px', padding: '5rem'}}>
                <Dropdown handleDropdownChange={handleDropdownChange}/>
                {selectedUser && <input style={style} value={password} onChange={(e) => setPassword(e.target.value)} placeholder='password' type='password' autocomplete="off"/>}
                <Button clickHandler={onConnectClick} color='red' text='connect' />
            </div>

        </>
    )
}

export default Entry