import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client'
import Popup from 'reactjs-popup';
import 'reactjs-popup/dist/index.css';

export default function Lobby(props) {

    let thisRoomId;
    let lobbyChannel;

    // Manage socket.io websocket
    const [ socket, setSocket ] = useState(null);

    // Indicate if the game has been initialised as yet
     const [ loaded, setLoaded ] = useState(false);

    // Store room ID of game that player created
    const [ createdRoomId, setCreatedRoomId ] = useState("");

    // Create a room channel
    function createRoom(e) {
       
        socket.emit('createRoom');

        socket.on('newRoomCreated', data => {
            console.log("Loaded: " + data.roomId)
        })
    }

    function onPressJoin(e) {
        joinRoom("abcde");
    }


    function joinRoom(value) {
       
        var data = {
            roomId : '123'
        };
        socket.emit('joinRoom', data);
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
            <Popup trigger={<button onClick={(e) => createRoom()}> Create Lobby </button>} modal>
                <div>Room created!</div>
                <div>Share this code with your friends:</div>
                <div></div>
            </Popup>
            <button onClick={(e) => createRoom()}> Create Lobby2 </button>
            <button onClick={(e) => joinRoom()}> Join Lobby </button>
        </div>
    )
}