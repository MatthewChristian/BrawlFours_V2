import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image'

export default function PlayingCard(props) {
    let card;
    let horizontalGap = 4;
    let verticalGap = 3;
    let p1Start = 52 + (horizontalGap * (props.len - 6)) - (horizontalGap * ((props.len - 6)/3)) - ((props.len - 6)/2);
    let p2Start = 34 - (verticalGap * (props.len - 6)) + (verticalGap * ((props.len - 6)/3)) + ((props.len - 6)/2);

    // Get suit and value of card.
    if(props.value) {
      card = props.value.charAt(0) + props.value.charAt(1);
    }


    return (
        <div className={`playing-card card-${props.iter} player-card-${props.player}`}
          id={props.value}
          onClick={props.onClickHandler}
          style={{
            position: 'absolute',
            right: props.player == "1" || props.player == "3" ? `${p1Start - (horizontalGap * props.iter)}%` : null,
            top: props.player == "2" || props.player == "4" ?  `${p2Start + (verticalGap * props.iter)}%` : null,
          }}>
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