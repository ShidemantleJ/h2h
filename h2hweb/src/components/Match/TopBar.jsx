import React, {useEffect, useState} from 'react';
import UserCard from '../UserCard';
import CountdownTimer from './CountdownTimer';

function TopBar(props) {
    const match = props.match;
    const countdownTimestamp = match.countdown_timestamp;
    const countdownSecs = match.countdown_secs;
    const playerTurn = match.player_turn;

    return (
        <div className='flex p-2 items-center'>
            <CountdownTimer player={1} turn={playerTurn} countdownSecs={countdownSecs} timestamp={countdownTimestamp}/>
            <UserCard key={match.player_1_id} className="" variant="MatchDisplay" userId={match.player_1_id}/>
            <p className='my-auto mx-auto font-bold text-xl'>vs</p>
            <UserCard key={match.player_2_id} className="" variant="MatchDisplay" userId={match.player_2_id}/>
            <CountdownTimer player={2} turn={playerTurn} countdownSecs={countdownSecs} timestamp={countdownTimestamp}/>
        </div>
    );
}

export default TopBar;