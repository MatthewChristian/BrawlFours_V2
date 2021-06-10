import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image'

export default function PlayingCard(props) {
  
    return (
        <div className="col-sm-1">
          
          <Image
            src={`/images/${props.value}.png`}
            width={140}
            height={190}
          />

        </div>
    )
}