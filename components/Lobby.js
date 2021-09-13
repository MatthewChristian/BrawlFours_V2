import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client'
import Popup from 'reactjs-popup';
import 'reactjs-popup/dist/index.css';
import Room from "../components/Room";

export default function Lobby(props) {

    let thisRoomId;
    let lobbyChannel;

    // Manage socket.io websocket
    const [ socket, setSocket ] = useState(null);

    // Indicate if the game has been initialised as yet
    const [ loaded, setLoaded ] = useState(false);

    // Indicate if user is in a room waiting
    const [ inRoom, setInRoom ] = useState(false);

    // Store room ID of game that player created
    const [ createdRoomId, setCreatedRoomId ] = useState("");

    // Store room ID of game that player created
    const [ showNickWarning, setShowNickWarning ] = useState(false);

    // Used to open and close modal form
    const [createdOpen, setCreatedOpen] = useState(false);
    const closeCreatedModal = () => setCreatedOpen(false);

    const [joinOpen, setJoinOpen] = useState(false);
    const closeJoinModal = () => setJoinOpen(false);

    // React ref to access text field values
    const joinRoomRef = useRef(null);
    const joinNickRef = useRef(null);

    function createRoomPressed() {
        const nickVal = joinNickRef.current.value
        if (!nickVal) {
            setShowNickWarning(true);
        }
        else {
            createRoom();
            //props.handleLobbyCreatedChange();
            setInRoom(true);
            setCreatedOpen(true);
        }
    }

    function joinRoomPressed() {
        const nickVal = joinNickRef.current.value
        if (!nickVal) {
            setShowNickWarning(true);
        }
        else {
            setJoinOpen(true);
        }
    }

    // Create a room
    function createRoom(e) {
       
        socket.emit('createRoom');

        socket.on('newRoomCreated', data => {
            console.log("Loaded: " + data.roomId);
            setCreatedRoomId(data.roomId);
        })
    }

    // Join a room
    function joinRoom(value) {
        const roomIdVal = joinRoomRef.current.value;
        const nickVal = joinNickRef.current.value;
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

            <div className="d-flex p-2 align-content-center align-items-center flex-column container">
                { inRoom ? (
                    <Room roomId={createdRoomId}></Room>
                ) : (
                <div className="card lobby-card">
                    
                    <input type="text" className="nickname-field" id="join-nickname-field" ref={joinNickRef} placeholder="Enter your nickname..." />
                    { showNickWarning ? (
                        <div className="nickname-warning">Must enter a nickname first!</div>
                    ) : 
                        (null)
                    }
                    <button className="game-button join-button lobby-button" onClick={(e) => joinRoomPressed()}> 
                        Join Room 
                    </button>

                    <Popup open={joinOpen} closeOnDocumentClick onClose={closeJoinModal}>
                     <div className="d-flex p-2 align-content-center align-items-center flex-column container">
                        <div className="join-room-h1 room-modal room-field">Enter room code:</div>
                        <input type="text" className="" id="join-room-field" ref={joinRoomRef} placeholder="Enter the room code..." />
                        <br></br>
                        <button className="game-button join-button lobby-button" onClick={(e) => joinRoom()}> 
                            Join Room
                        </button>
                        </div>
                    </Popup>

                    <button type="button" className="game-button create-button lobby-button" onClick={() => createRoomPressed()}>
                        Create Room
                    </button>
                   
                </div>
                ) }
            </div>
        </div>
    )
}