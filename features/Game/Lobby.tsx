import React, { useState, useEffect, useRef, RefObject } from 'react';
import io, { Socket } from 'socket.io-client'
import Popup from 'reactjs-popup';
import 'reactjs-popup/dist/index.css';
import Room from "./Room";
import { useRouter } from 'next/router';

interface Props {
    roomId?: string;
    socket: RefObject<Socket>;
}

export default function Lobby({ roomId, socket }: Props) {

    const router = useRouter();

    // Indicate if the game has been initialised as yet
    const [ loaded, setLoaded ] = useState<boolean>(false);

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
    const joinRoomRef = useRef<HTMLInputElement>(null);
    const joinNickRef = useRef<HTMLInputElement>(null);

    function createRoomPressed() {
        const nickVal = joinNickRef.current?.value
        if (!nickVal) {
            setShowNickWarning(true);
        }
        else {
            createRoom();
            setInRoom(true);
            setCreatedOpen(true);
        }
    }

    function joinRoomPressed() {
        const nickVal = joinNickRef.current?.value;
        if (!nickVal) {
            setShowNickWarning(true);
        }
        else {
            setJoinOpen(true);
        }
    }

    // Create a room
    function createRoom() {

        const nickVal = joinNickRef.current?.value;

        let data = {
            nickname: String(nickVal)
        }

        socket.current?.emit('createRoom', data);
    }

    // Join a room
    function joinRoom() {
        const roomIdVal = joinRoomRef.current?.value;
        const nickVal = joinNickRef.current?.value;
        let data = {
            roomId : String(roomIdVal),
            nickname: String(nickVal)
        };

        console.log("Data: ", data);
        socket.current?.emit('joinRoom', data);
        setInRoom(true);
        setCreatedRoomId(String(roomIdVal));
    }

    useEffect(() => {
        socket.current?.on('newRoomCreated', data => {
            console.log("Loaded: " + data.roomId);
            setCreatedRoomId(data.roomId);
        })
    }, [socket]);

    return (
        <div>
            <h1 className='text-red-500'>Brawl Fours</h1>
            {inRoom ? (
                <Room roomId={createdRoomId} socket={socket}></Room>
            ) : (
            <div className="d-flex p-2 align-content-center align-items-center flex-column container">
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
                        <button className="game-button join-button lobby-button" onClick={joinRoom}>
                            Join Room
                        </button>
                        </div>
                    </Popup>

                    <button type="button" className="game-button create-button lobby-button" onClick={() => createRoomPressed()}>
                        Create Room
                    </button>

                </div>

            </div>
            )}
        </div>
    )
}