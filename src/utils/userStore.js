const users = [];

const addUser = ({ id,userName,room }) => {
     //validating the data
     if(!userName || !room){
        return {
            error: 'Username and Room are required!'
        }
    }

    //cleaning the data
     userName = userName.trim().toLowerCase();
     room = room.trim().toLowerCase();
    
    //checking for existing user
    const existingUser = users.findIndex(user => user.userName ===  userName);
    if(existingUser > -1)
        return {error: 'Username is already in use.'}

    //pushing the data
    const user = { id, userName, room };
    users.push(user);
    return { user } 
}

const removeUser = (id) => {
    const index = users.findIndex(user => user.id === id);
    if(index != -1){
        return users.splice(index, 1)[0]
    }
}

const getUser = (id)  => {
    let userIndex = users.findIndex(user => user.id === id);

    if(userIndex === -1)
        return undefined
    
    return users[userIndex]
}

const getUsersInRoom = (room) => {
    room= room.trim().toLowerCase();
    return  users.filter(user => user.room === room)
}

module.exports = { addUser, removeUser, getUsersInRoom, getUser }