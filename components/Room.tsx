import React, { useState, useEffect, useRef } from 'react';
import io, { Socket } from 'socket.io-client'
import { PlayerSocket } from '../models/PlayerSocket';

interface Props {
    roomId?: string;
    socket: Socket;
}

export default function Room({ roomId, socket }: Props) {

    const [players, setPlayers] = useState<PlayerSocket[]>([]);

    useEffect(() => {
        console.log("Sock: ", socket);

        socket.on('playerJoinedRoom', (player) => {
            console.log("Player: ", player);
            setPlayers((prev) => [...prev, player]);
        });
    }, [socket, players]);

    return (
        <div className="card lobby-card">
            <div className="room-created-h2">Share this code with your friends:</div>
            <div className="room-header">
                <p className="room-created-id">{roomId}</p>
            </div>

            <div className="player-list">
                <p>Players</p>
                <div className='flex flex-col'>
                {
                    players.map((el, i) =>
                        <div key={i}>{el.nickname}</div>
                    )
                }
                </div>
            </div>
        </div>
    )
}