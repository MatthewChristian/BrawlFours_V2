import React, { useState, useEffect, useRef } from 'react';
import PubNub from 'pubnub';
import * as PubNubReact from 'pubnub-react';

export default function Lobby(props) {

    let roomId;
    let lobbyChannel;
    let pubnub;

    // Create a room channel
    function onPressCreate(e) {
        // Create a random name for the channel
        roomId = "abcde"; // Fix later with shortid.generate().substring(0,5);
        lobbyChannel = 'brawlfourslobby--' + roomId; // Lobby channel name
        pubnub.subscribe({
            channels: [lobbyChannel],
            withPresence: true // Checks the number of people in the channel
        });
        alert("Lobby created: " + roomId);
    }

    function onPressJoin(e) {
        joinRoom("abcde");
    }


    function joinRoom(value) {
        roomId = value;
        lobbyChannel = 'brawlfourslobby--' + roomId;
    }

    useEffect(() => {
        pubnub = new PubNub({
            publishKey: "pub-c-cbb9ab3c-426c-4448-b36a-10f7de9069db",
            subscribeKey: "sub-c-ec649c58-b4cd-11ea-af7b-9a67fd50bac3"
        }); 
    });


    return (
        <div>
          <h1>Brawl Fours</h1>
          <button onClick={(e) => this.onPressCreate()}> Create Lobby </button>
          <button onClick={(e) => this.onPressJoin()}> Join Lobby </button>
        </div>
    )
}