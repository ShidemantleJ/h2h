import React from 'react';
import {ScrambleDisplay} from "scramble-display";

function Scramble(props) {
    const scrambleArray = props.scrambleArray;
    const event = props.event;
    const currScramble = scrambleArray[0][0];

    return (
        <div>
            <h2 className='text-2xl font-semibold mb-2'>Current Scramble</h2>
                <p className='text-xl mb-2'>{scrambleArray[0][0]}</p>
                <scramble-display className="w-3/4" scramble={currScramble} event={event}/>
        </div>
    );
}

export default Scramble;