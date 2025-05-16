import React, { useEffect, useRef, useState } from 'react';
import { Info } from 'lucide-react';
import {Tooltip} from 'react-tooltip';

function Timer() {
    const [timerVal, setTimerVal] = useState(0);
    const [timerBold, setTimerBold] = useState(false);
    const [timeInputVal, setTimeInputVal] = useState(0);

    const intervalIdRef = useRef(null);
    const runningRef = useRef(false);
    const justStoppedRef = useRef(false);

    const startTimer = () => {
        if (!intervalIdRef.current) {
            setTimerVal(0);
            const id = setInterval(() => {
                setTimerVal((prevVal) => parseFloat((prevVal + 0.01).toFixed(2)));
            }, 10);
            intervalIdRef.current = id;
            runningRef.current = true;
        }
    };

    const stopTimer = () => {
        if (intervalIdRef.current) {
            clearInterval(intervalIdRef.current);
            intervalIdRef.current = null;
            runningRef.current = false;
        }
    };

    const handleSpaceKeyUp = (event) => {
        if (event.key === ' ') {
            event.preventDefault();
            console.log("running, justStopped: ", runningRef.current, justStoppedRef.current);
            if (justStoppedRef.current) {
                console.log("just stopped, changing...");
                justStoppedRef.current = false;
            }
            else if (!runningRef.current && !justStoppedRef.current) {
                startTimer();
                setTimerBold(false);
            }
        }
    };

    const handleSpaceKeyDown = (event) => {
        if (event.key === ' ') {
            event.preventDefault();
            if (runningRef.current) {
                stopTimer();
                justStoppedRef.current = true;
                console.log("Setting justStopped to true");
            } else {
                setTimerBold(true);
            }
        }
    };

    useEffect(() => {
        window.addEventListener('keyup', handleSpaceKeyUp);
        window.addEventListener('keydown', handleSpaceKeyDown);

        return () => {
            window.removeEventListener('keyup', handleSpaceKeyUp);
            window.removeEventListener('keydown', handleSpaceKeyDown);
            stopTimer();
        };
    }, []);

    return (
        <div className="space-y-3">
            <div className="inline-flex items-center">
                <h2 className='text-2xl font-semibold'>Timer</h2>
                <Tooltip anchorSelect='.timer-info' place='top'>
                    You can use an external timer, or the built in<br/>
                    timer controlled with the spacebar. Once you've<br/>
                    completed your solve, enter your time and submit.
                </Tooltip>
                <Info className="ml-3 timer-info"/>
            </div>
            <p className={`${timerBold ? "text-green-800 font-bold" : ""} text-2xl font-semibold`}>{timerVal.toFixed(2)}</p>
            <input type="number" min="0.00" step="0.01" className='p-2 rounded-xl bg-zinc-950' placeholder='Enter your time' value={timeInputVal} onChange={(e) => setTimeInputVal(e.target.value)}/>
            <button className="bg-emerald-700 rounded-md ml-5 font-semibold p-2 cursor-pointer">Submit</button>
            <button className="bg-amber-700 rounded-md ml-5 font-semibold p-2 cursor-pointer">+2</button>
            <button className="bg-red-800 rounded-md ml-5 font-semibold p-2 cursor-pointer">DNF</button>
        </div>
    );
}

export default Timer;
