import { randomScrambleForEvent } from "cubing/scramble";
import { supabase } from "../supabase.js";

// Returns 0 if first time won, 1 if second time won, -1 if invalid, -2 if same time
function whoWonSolve(solve1, solve2) {
  if (isNaN(solve1) || isNaN(solve2)) return -1;
  else if (solve2 === solve1) return -2;
  else if (solve2 == -1) return 0;
  else if (solve1 == -1) return 1;
  
  else if (solve1 < solve2) return 0;
  else if (solve2 < solve1) return 1;
}

function wonSet(boSolve, p1setarr, p2setarr) {
  const solvesToWin = Math.ceil((boSolve + 1) / 2);
  if (
    !p1setarr ||
    !p1setarr ||
    p1setarr?.length !== p2setarr?.length ||
    p1setarr?.length < solvesToWin
  )
    return "SET_NOT_OVER";
  let solvesWonArr = [0, 0];
  for (let i = 0; i < p1setarr.length; i++) {
    const winningPlayer = whoWonSolve(p1setarr[i], p2setarr[i]);
    if (winningPlayer < 0) continue;
    solvesWonArr[winningPlayer]++;
    console.assert(winningPlayer === 0 || winningPlayer === 1);
  }
  if (solvesWonArr[0] >= solvesToWin) return "P1_WON";
  else if (solvesWonArr[1] >= solvesToWin) return "P2_WON";
  return "SET_NOT_OVER";
}

function getGameState(boSolve, boSet, p1timearr, p2timearr) {
  const setsToWin = Math.ceil(boSet / 2);
  if (Math.min(p1timearr.length, p2timearr.length) < Math.ceil(boSet / 2))
    return "ongoing";

  const setsWon = [0, 0];
  for (let i = 0; i < boSet; i++) {
    if (wonSet(boSolve, p1timearr[i], p2timearr[i]) === "P1_WON") setsWon[0]++;
    else if (wonSet(boSolve, p1timearr[i], p2timearr[i]) === "P2_WON")
      setsWon[0]++;
    if (setsWon[0] >= setsToWin) return "P1_WON";
    else if (setsWon[1] >= setsToWin) return "P2_WON";
  }
  return "ongoing";
}

const getMatch = async (matchId) => {
  const { data: match, error: matchError } = await supabase
    .from("matches")
    .select("*")
    .eq("id", matchId)
    .single();

  return { match, matchError };
};

function getUpdatedTimeArr(match, newTime, addForP1, addForP2) {
  let newP1TimeArr = structuredClone(match.player_1_times);
  let newP2TimeArr = structuredClone(match.player_2_times);
  if (addForP1) {
    if (newP1TimeArr.length === 0) newP1TimeArr.push([newTime]);
    else newP1TimeArr.at(-1).push(newTime);
  } else if (addForP2) {
    if (newP2TimeArr.length === 0) newP2TimeArr.push([newTime]);
    else newP2TimeArr.at(-1).push(newTime);
  }

  let newBoSolveFormat = structuredClone(match.best_of_solve_format);
  if (
    newP1TimeArr.at(-1).length === newP2TimeArr.at(-1).length &&
    newP1TimeArr.length === newP2TimeArr.length &&
    whoWonSolve(newP1TimeArr.at(-1).at(-1), newP2TimeArr.at(-1).at(-1)) === -2
  ) {
    newBoSolveFormat[newP1TimeArr.length - 1]++;
  }
  if (
    wonSet(
      newBoSolveFormat.at(-1),
      newP1TimeArr.at(-1),
      newP2TimeArr.at(-1)
    ) !== "SET_NOT_OVER"
  ) {
    newP1TimeArr.push([]);
    newP2TimeArr.push([]);
  }

  return { newP1TimeArr, newP2TimeArr, newBoSolveFormat };
}

function getCurrSet(p1timearr, p2timearr) {
  return Math.max(p1timearr.length, p2timearr.length);
}

function getCurrSolve(p1timearr, p2timearr) {
  return Math.max(
    p1timearr[p1timearr.length - 1].length,
    p2timearr[p2timearr.length - 1].length
  );
}

function getNewTurn(p1timearr, p2timearr) {
  const currSet = getCurrSet(p1timearr, p2timearr);
  const currSolve = getCurrSolve(p1timearr, p2timearr);

  return (currSet + currSolve) % 2 === 0 ? 2 : 1;
}

async function getNewScrambleArr(match, newP1TimeArr, newP2TimeArr) {
  // Get previous scramble array (2D) and update
  const currSet = getCurrSet(newP1TimeArr, newP2TimeArr);
  const currSolve = getCurrSolve(newP1TimeArr, newP2TimeArr);
  const prevScrambleArr = structuredClone(match.scrambles) || [[]];
  let newScrambleArr = structuredClone(prevScrambleArr);
  // If scramble array doesn't contain a subarray for the current set, create subarray
  // and add scramble to the subarray
  if (!Array.isArray(prevScrambleArr[currSet - 1])) {
    let scramble;
    scramble = await randomScrambleForEvent(match.event);
    newScrambleArr.push([scramble.toString()]);
  } else if (prevScrambleArr[currSet - 1].length <= currSolve) {
    let scramble;
    scramble = await randomScrambleForEvent(match.event);
    newScrambleArr?.[currSet - 1]?.push(scramble.toString());
  }
  return newScrambleArr;
}

export {
  getNewScrambleArr,
  getCurrSet,
  getCurrSolve,
  getGameState,
  getMatch,
  getNewTurn,
  getUpdatedTimeArr,
  whoWonSolve,
  wonSet,
};
