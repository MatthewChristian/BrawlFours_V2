import React, { useState, useEffect, useRef, RefObject } from 'react';
import io, { Socket } from 'socket.io-client'
import { PlayerSocket } from '../models/PlayerSocket';
import Button from '../core/components/Button';

interface Props {
    roomId?: string;
    socket: RefObject<Socket>;
}

export default function Room({ roomId, socket }: Props) {

    const [players, setPlayers] = useState<string[]>([]);

    useEffect(() => {
        if (!socket.current) {
            return;
        }

        console.log("Sock: ", socket);

        socket.current.on('playerJoinedRoom', (player) => {
            console.log("Player: ", player);
        });

        socket.current.on('playersInRoom', (player) => {
            console.log("PIR: ", player);
            setPlayers((prev) => player);
        });
    }, [socket]);

    return (
        <div className="card lobby-card bg-green-200">
            <div className="room-created-h2">Share this code with your friends:</div>
            <div className="room-header">
                <p className="room-created-id">{roomId}</p>
            </div>

            <div className="player-list">
                <p>Players</p>
                <div className='flex flex-col'>
                {
                    players.map((el, i) =>
                        <div key={i}>{el}</div>
                    )
                }
                </div>
            </div>

            <Button className='bg-red-500'>
                Leave Room
            </Button>

        </div>
    )
}