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

    // Used to open and close modal form
    const [createdOpen, setCreatedOpen] = useState(false);
    const closeCreatedModal = () => setCreatedOpen(false);

    const [joinOpen, setJoinOpen] = useState(false);
    const closeJoinModal = () => setJoinOpen(false);

    // React ref to access text field values
    const joinRoomRef = useRef(null)
    const joinNickRef = useRef(null)

    function createRoomPressed() {
        createRoom();
        setCreatedOpen(true);
    }

    function joinRoomPressed() {
        setJoinOpen(true);
    }

    // Create a room channel
    function createRoom(e) {
       
        socket.emit('createRoom');

        socket.on('newRoomCreated', data => {
            console.log("Loaded: " + data.roomId);
            setCreatedRoomId(data.roomId);
        })
    }

    function onPressJoin(e) {
        joinRoom("abcde");
    }


    function joinRoom(value) {
        const roomIdVal = joinRoomRef.current.value
        const nickVal = joinNickRef.current.value
        console.log("Room val: " + roomIdVal);
        console.log("Nick val: " + nickVal);
        var data = {
            roomId : String(roomIdVal),
            nickname: String(nickVal)
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

            <input type="text" className="" id="join-nickname-field" ref={joinNickRef} placeholder="Enter your nickname" />
            <br></br>

            
            <button className="game-button join-button lobby-button" onClick={(e) => joinRoomPressed()}> 
                Join Room 
            </button>

            <Popup open={joinOpen} closeOnDocumentClick onClose={closeJoinModal}>
                <div className="join-room-h1 room-modal">Enter room code:</div>
                <input type="text" className="" id="join-room-field" ref={joinRoomRef} placeholder="Enter the room code" />
                <br></br>
                <button className="game-button join-button lobby-button" onClick={(e) => joinRoom()}> 
                    Join
                </button>
            </Popup>

            

            <br></br>

            <button type="button" className="game-button create-button lobby-button" onClick={() => createRoomPressed()}>
                Create Room
            </button>
            
            <Popup open={createdOpen} closeOnDocumentClick onClose={closeCreatedModal}>
                <div className="room-created-h1 room-modal">Room created!</div>
                <div className="room-created-h2 room-modal">Share this code with your friends:</div>
                <div className="room-created-id room-modal">{createdRoomId}</div>
            </Popup>
            


        </div>
    )
}