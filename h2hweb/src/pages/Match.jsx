/*
    Info to include:
    Top rectangle (full width):
        Profile picture and username of both opponents (modify usercard to do this)
    Next row: 1 full width rectangle displaying scramble
    Next row: 2 rectangles of equal width:
        Timer with box to submit time, buttons for DNF, +2, lists time remaining
        Text chat (add later)
    Next row: 1 rectangle with full width:
        Table of each solve with arrows on each side to switch between viewing different sets

    To do next:
    - add arrows to change set being viewed

*/

import React, {useState, useEffect} from 'react';
import { useParams } from 'react-router-dom';
import Timer from '../components/Timer';
import UserCard from '../components/UserCard';
import {getNameFromId} from '../utils/dbutils'
import supabase from "../supabase";
import { ArrowLeftCircle, ArrowRightCircle } from 'lucide-react';

function getTimes(p1timearr, p2timearr, setNum) {
    let tableElements = [];
    for (let i = 0; i < p1timearr[setNum].length || i < p2timearr[setNum].length; i++) {
        const p1time = p1timearr[setNum][i];
        const p2time = p2timearr[setNum][i];
        tableElements.push(
            <tr key={i} className=''>
                <td className='px-6 py-4 text-center'>{i + 1}</td>
                <td className='px-6 py-4'>{p1time || '-'}</td>
                <td className='px-6 py-4'>{p2time || '-'}</td>
            </tr>
        )
    }
    return tableElements;
}

function Match(props) {
    let {matchId} = useParams();
    matchId = Number.parseInt(matchId, 10);
    const [match, setMatch] = useState({});
    const [p1name, setp1name] = useState('');
    const [p2name, setp2name] = useState('');
    const [setToDisplay, setSetToDisplay] = useState(0);

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

    useEffect(() => {
        async function getNames() {
            if (!match || !match.player_1_id || !match.player_2_id) return;
            const player1name = await getNameFromId(match.player_1_id)
            const player2name = await getNameFromId(match.player_2_id)
            setp1name(player1name);
            setp2name(player2name);
        }
        getNames();
    }, [match, match.player_1_id, match.player_2_id])

    if (!match || !match.player_1_times || !match.player_2_times) return <h1>Loading</h1>
    console.log(match);
    return (
        <div className="bg-zinc-900 w-full min-h-screen grid grid-cols-2 auto-rows-min text-white gap-5 p-5">
            {/* Profile picture and username of opponents */}
            <div className="bg-zinc-800 rounded-2xl col-span-2 grid grid-cols-3 p-3">
                <UserCard key={match.player_1_id} className="mr-auto" variant="MatchDisplay" userId={match.player_1_id}/>
                <p className='my-auto mx-auto font-bold text-xl'>vs</p>
                <UserCard key={match.player_2_id} className="ml-auto" variant="MatchDisplay" userId={match.player_2_id}/>
            </div>
            {/* Current Scramble */}
            <div className="bg-zinc-800 rounded-2xl p-5">
                <h2 className='text-2xl font-semibold mb-2'>Current Scramble</h2>
                <p className='text-xl'>R U R' U' R U R' U' R U R' U' R U R' U' R U R' U'</p>
            </div>
            {/* Submit Times */}
            <div className="bg-zinc-800 rounded-2xl p-5">
                <Timer/>
            </div>
            {/* Table of solves */}
            <div className="bg-zinc-800 rounded-2xl col-span-2 p-5 w-fit">
                <h1 className='text-2xl font-semibold mb-2 text-center'>Set #{setToDisplay+1}</h1>
                <div className='inline-flex items-center'>
                    <ArrowLeftCircle className="cursor-pointer" onClick={() => setSetToDisplay(prev => Math.max(0, prev - 1))}/>
                    <table className=''>
                        <thead>
                            <tr className='text-zinc-400'>
                                <th className='px-6 py-4'>Solve #</th>
                                <th className='px-6 py-4'>{p1name}'s times</th>
                                <th className='px-6 py-4'>{p2name}'s times</th>
                            </tr>
                        </thead>
                        <tbody>
                            {getTimes(match.player_1_times, match.player_2_times, setToDisplay)}
                        </tbody>
                    </table>
                    <ArrowRightCircle className="cursor-pointer" onClick={() => setSetToDisplay(prev => Math.min(match.player_1_times.length - 1, prev + 1))}/>
                </div>
            </div>
        </div>
    );
}

export default Match;