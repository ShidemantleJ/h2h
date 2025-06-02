/*
    Caches each match in memory. When the countdown runs out, the opponent is DNF'd and
    the match goes on.
*/

import { supabase } from "./supabase.js";
import {
  getUpdatedTimeArr,
  getNewScrambleArr,
  getNewTurn,
  getGameState,
  getMatch,
} from "./helpers/matchHelpers.js";

let ongoingMatches = [];

async function getOngoingMatches() {
  const { data, error } = await supabase
    .from("matches")
    .select()
    .eq("status", "ongoing");

  if (error) {
    console.log(error);
    return;
  }

  ongoingMatches = data;
}

async function subscribeToRealtimeChanges() {
  const ongoingMatchChanges = supabase
    .channel("schema-db-changes")
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
      },
      (payload) => {
        if (payload.eventType === "UPDATE" || payload.eventType === "INSERT") {
          const index = ongoingMatches.findIndex(
            (match) => match.id === payload.new.id
          );
          if (
            payload.new.status !== "ongoing"
          ) {
            if (index !== -1) ongoingMatches.splice(index, 1);
          }

          if (index === -1 && payload.new.status === "ongoing") {
            ongoingMatches.push(payload.new);
          } else if (index !== -1 && payload.new.status === "ongoing") {
            ongoingMatches[index] = payload.new;
          }
        }
      }
    )
    .subscribe();
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
          usersPresent[0] === "monitor" &&
          match.status === "ongoing"
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

getOngoingMatches();
subscribeToRealtimeChanges();

setInterval(() => {
  // console.log(ongoingMatches);
  ongoingMatches.forEach((match) => {
    if (
      match.status === "ongoing" &&
      match.countdown_secs -
        Math.floor(
          (new Date().getTime() -
            new Date(match.countdown_timestamp).getTime()) /
            1000
        ) <
        0
    ) {
      handleMatchCountdownComplete(match);
    }
  });
}, 2000);

async function handleMatchCountdownComplete(match) {
  const matchId = match.id;

  // Don't DNF if it's the first solve since players have just joined.
  // TODO: add cron job to delete old matches where players never submitted times.
  // if (match.player_1_times.length === 0 || match.player_2_times.length === 0) return;

  console.log((new Date().getTime() - new Date(match.countdown_timestamp).getTime()) /
          1000)

  // Check if anyone should be DNF'd (if the time has run out)
  if (
    match.countdown_secs -
      Math.floor(
        (new Date().getTime() - new Date(match.countdown_timestamp).getTime()) /
          1000
      ) <
    0
  ) {
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
}
