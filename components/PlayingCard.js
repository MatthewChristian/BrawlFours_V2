import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image'

export default function PlayingCard(props) {
    let card;

    // Get suit and value of card
    if(props.value) {
      card = props.value.charAt(0) + props.value.charAt(1);
    }

    return (
        <div className={`playing-card card-${props.iter} player-card-${props.player}`} id={props.value} onClick={props.onClickHandler}>
          { !props.deckCard ? (
          <Image
            src={`/images/${card}.png`}
            width={78.5}
            height={120}
          />
          ) : (
          <Image
            src={`/images/red_back.png`}
            width={78.5}
            height={120}
          />
          ) }
        </div>
    )
}