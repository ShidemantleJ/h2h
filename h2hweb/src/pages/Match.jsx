/*
    Info to include:
    Top rectangle (full width):
        Profile picture and username of both opponents (modify usercard to do this)
    Next row: 2 rectangles of equal width:
        Timer with box to submit time, buttons for DNF, +2, lists time remaining
        Text chat (add later)
    Next row: 1 rectangle with full width:
        Table of each solve with arrows on each side to switch between viewing different sets

*/

import React, {useState, useEffect} from 'react';
import { useParams } from 'react-router-dom';
import { getProfilePicture } from '../utils/dbutils';
import supabase from "../supabase";

function Match(props) {
    let {matchId} = useParams();
    matchId = Number.parseInt(matchId, 10);
    const [match, setMatch] = useState({});

    useEffect(() => {
        async function getMatch(matchId) {
            const {data, error} = await supabase
            .from("matches")
            .select("*")
            .eq("id", matchId)
            .single();

            if (error) setMatch(null);
            else setMatch(data);
        }
        getMatch(matchId);
    }, [matchId])

    console.log(match);
    return (
        <div className="bg-zinc-900 w-full h-screen grid grid-cols-2 text-white p-5">
            <div className="bg-zinc-800 rounded-2xl col-span-2">
                <h2></h2>
            </div>
        </div>
    );
}

export default Match;