import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image'

export default function PlayingCardKicked(props) {
    let card;

    // Get suit and value of card
    if(props.value) {
      card = props.value.charAt(0) + props.value.charAt(1);
    }

    return (
        <div className="col-sm-3" id={props.value} onClick={props.onClickHandler}>
          <Image
            src={`/images/${card}.png`}
            width={140}
            height={190}
          />
        </div>
    )
}