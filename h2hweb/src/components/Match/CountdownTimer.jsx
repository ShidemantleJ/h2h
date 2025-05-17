import React, {useEffect, useState} from 'react';

function calculateTimeLeft(timestamp, countdownSecs) {
    const timestampNow = new Date().getTime();
    const startTimestamp = new Date(timestamp).getTime();
    const secsRemaining = countdownSecs - Math.floor((timestampNow - startTimestamp) / 1000);

    const secsToDisplay = Math.max(secsRemaining % 60, 0);
    const minsToDisplay = Math.max(Math.floor(secsRemaining / 60), 0);

    return `${String(minsToDisplay).padStart(1,'0')}:${String(secsToDisplay).padStart(2,'0')}`;
}

function CountdownTimer(props) {
    const startTimestamp = props.timestamp;
    const countdownSecs = props.countdownSecs;
    const playerTurn = props.turn;
    const player = props.player;

    const [timeLeft, setTimeLeft] = useState(calculateTimeLeft(startTimestamp, countdownSecs));

    useEffect(() => {
        const intervalId = setInterval(() => {
            setTimeLeft(calculateTimeLeft(startTimestamp, countdownSecs));
        }, 1000);

        return () => clearInterval(intervalId);
    }, [startTimestamp])

    return (
        <div className='mx-7 text-2xl text-black bg-white inset-shadow-amber-500 p-2 rounded-xl'>
            <p>{player === playerTurn ? timeLeft : '0:00'}</p>
        </div>
    );
}

export default CountdownTimer;