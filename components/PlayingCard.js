import React, { useState, useEffect, useRef } from 'react';

export default function PlayingCard(props) {

    return (
        <div className="col-sm-1">
          <div className="card">
            <p>{props.value}</p>
          </div>
        </div>
    )
}