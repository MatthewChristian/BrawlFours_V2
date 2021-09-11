import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client'

export default function Lobby(props) {

    let thisRoomId;
    let lobbyChannel;

    // Manage socket.io websocket
    const [ socket, setSocket ] = useState(null);

    // Indicate if the game has been initialised as yet
     const [ loaded, setLoaded ] = useState(false);

    // Create a room channel
    function createRoom(e) {
        let tempSocket = io();
        tempSocket.emit('createRoom');
    }

    function onPressJoin(e) {
        joinRoom("abcde");
    }


    function joinRoom(value) {
        roomId = value;
        lobbyChannel = 'brawlfourslobby--' + roomId;
    }

    useEffect(() => {
        if (!loaded) {
            let tempSocket = io();
            tempSocket.on('now', data => {
                console.log("Loaded: " + data.count)
            })
            setSocket(tempSocket);

            tempSocket.on('createRoom', createRoom);

            setLoaded(true);
        }
    });


    return (
        <div>
          <h1>Brawl Fours</h1>
          <button onClick={(e) => createRoom()}> Create Lobby </button>
          <button onClick={(e) => onPressJoin()}> Join Lobby </button>
        </div>
    )
}