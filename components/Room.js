import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client'

export default function Room(props) {

    const socket = io();


    useEffect(() => {
        console.log("Load", socket);

        socket.on('playerJoinedRoom', (msg) => {
            console.log("MSG: ", msg);
        });
    }, []);

    return (
        <div className="card lobby-card">
            <div className="room-created-h2">Share this code with your friends:</div>
            <div className="room-header">
                <p className="room-created-id">{props.roomId}</p>
            </div>
            <div className="player-list">
                <p>Players</p>
            </div>
        </div>
    )
}