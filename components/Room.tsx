import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client'
import { PlayerSocket } from '../models/PlayerSocket';

export default function Room(props) {

    const [players, setPlayers] = useState<PlayerSocket[]>([]);

    const socket = io();

    useEffect(() => {
        console.log("UE");

        socket.on('playerJoinedRoom', (player) => {
            console.log("Player: ", player);
            setPlayers((prev) => [...prev, player]);
        });
    }, [socket]);

    return (
        <div className="card lobby-card">
            <div className="room-created-h2">Share this code with your friends:</div>
            <div className="room-header">
                <p className="room-created-id">{props.roomId}</p>
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