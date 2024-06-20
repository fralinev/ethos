import React from "react";

const Sidebar = ({users}) => {
    return <div id='sidebar' style={{flex: 1, borderLeft: '1px solid yellow', height: '100vh'}}>{users.map((user) => {
        return <div>{user}</div>
    })}</div>
    
}

export default Sidebar