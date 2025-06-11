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
  const solvesToWin = Math.ceil(boSolve / 2);
  console.log(boSolve, p1setarr, p2setarr);
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
  const totalSets = Math.max(p1timearr.length, p2timearr.length);
  const setsToWin = Math.ceil(boSet / 2);
  if (Math.min(p1timearr.length, p2timearr.length) < Math.ceil(boSet / 2))
    return "ongoing";

  const setsWon = [0, 0];
  for (let i = 0; i < totalSets; i++) {
    const whoWonSet = wonSet(boSolve, p1timearr[i], p2timearr[i]);
    console.log(whoWonSet);
    if (whoWonSet === "P1_WON") setsWon[0]++;
    else if (whoWonSet === "P2_WON") setsWon[1]++;
  }
  if (setsWon[0] >= setsToWin) return "P1_WON";
  else if (setsWon[1] >= setsToWin) return "P2_WON";
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

  // If neither competitor won a solve, add another solve to the set
  let newMaxSolves = structuredClone(match.max_solves);
  if (
    newP1TimeArr.at(-1).length === newP2TimeArr.at(-1).length &&
    newP1TimeArr.length === newP2TimeArr.length &&
    whoWonSolve(newP1TimeArr.at(-1).at(-1), newP2TimeArr.at(-1).at(-1)) === -2
  ) {
    newMaxSolves[newP1TimeArr.length - 1]++;
  }
  // If either player wins the set, push an empty array
  if (
    wonSet(newMaxSolves.at(-1), newP1TimeArr.at(-1), newP2TimeArr.at(-1)) !==
      "SET_NOT_OVER" &&
    getGameState(
      match.best_of_solve_format,
      match.best_of_set_format,
      newP1TimeArr,
      newP2TimeArr
    ) === "ongoing"
  ) {
    newP1TimeArr.push([]);
    newP2TimeArr.push([]);
  }

  return { newP1TimeArr, newP2TimeArr, newMaxSolves };
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
  // Get previous scramble array
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

// Gets a snapshot of all users present in the room by joining the room as 'monitor.' If only 'monitor' is present in the room, return 1 (empty), else return 0 (not empty)
function getMatchRoomEmpty(match) {
  return new Promise((resolve, reject) => {
    const matchId = match.id;

    const matchRoom = supabase.channel(`match_room_${matchId}`, {
      config: { presence: { key: "monitor" } },
    });

    matchRoom
      .on("presence", { event: "sync" }, () => {
        const usersPresent = Object.values(matchRoom.presenceState())
          .flat()
          .map((user) => user.userId);

        if (!usersPresent.includes("monitor")) return;

        if (
          usersPresent.length === 1 &&
          usersPresent[0] === "monitor"
        ) {
          resolve(1);
        } else if (usersPresent.length > 1) {
          resolve(0);
        }
        matchRoom.unsubscribe();
      })
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          await matchRoom.track({ userId: "monitor" });
        }
      });
  });
}

async function handleMatchCountdownComplete(match) {
  const matchId = match.id;

  const { newP1TimeArr, newP2TimeArr, newMaxSolves } = getUpdatedTimeArr(
    match,
    -1,
    match.player_turn === 1,
    match.player_turn === 2
  );

  const newScrambleArr = await getNewScrambleArr(
    match,
    newP1TimeArr,
    newP2TimeArr
  );

  const gameState = getGameState(
    match.best_of_solve_format,
    match.best_of_set_format,
    newP1TimeArr,
    newP2TimeArr
  );

  const matchRoomIsEmpty = await getMatchRoomEmpty(match);

  const newTurn = getNewTurn(newP1TimeArr, newP2TimeArr);
  const { error } = await supabase
    .from("matches")
    .update({
      player_1_times: newP1TimeArr,
      player_2_times: newP2TimeArr,
      player_turn: newTurn,
      countdown_timestamp: matchRoomIsEmpty
        ? match.countdown_timestamp
        : new Date().toUTCString(),
      scrambles: newScrambleArr,
      max_solves: newMaxSolves,
      status: matchRoomIsEmpty ? "both_left" : gameState,
    })
    .eq("id", matchId);

  if (error) console.error(error);
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
  getMatchRoomEmpty,
  handleMatchCountdownComplete
};
