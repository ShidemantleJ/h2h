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
import { GitCommitVerticalIcon } from "lucide-react";

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
      () => getOngoingMatches()
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

        console.log("snapshot of active users:", usersPresent);

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
        console.log("unsubscribing from channel");
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
  console.log(ongoingMatches);
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
      console.log("handling match countdown:");
      handleMatchCountdownComplete(match);
    }
  });
}, 2000);

async function handleMatchCountdownComplete(match) {
  const matchId = match.id;

  // Check if anyone should be DNF'd (if the time has run out)
  if (
    match.countdown_secs -
      Math.floor(
        (new Date().getTime() - new Date(match.countdown_timestamp).getTime()) /
          1000
      ) <
    0
  ) {
    const { newP1TimeArr, newP2TimeArr, newBoSolveFormat } = getUpdatedTimeArr(
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
      newBoSolveFormat,
      match.best_of_set_format,
      newP1TimeArr,
      newP2TimeArr
    );

    const matchRoomIsEmpty = await getMatchRoomEmpty(match);
    if (matchRoomIsEmpty) console.log("match room is empty");
    else console.log("match room is not empty");

    const newTurn = getNewTurn(newP1TimeArr, newP2TimeArr);
    const { error } = await supabase
      .from("matches")
      .update({
        player_1_times: newP1TimeArr,
        player_2_times: newP2TimeArr,
        player_turn: newTurn,
        countdown_timestamp: matchRoomIsEmpty ? match.countdown_timestamp : new Date().toUTCString(),
        scrambles: newScrambleArr,
        best_of_solve_format: newBoSolveFormat,
        status: matchRoomIsEmpty ? "both_left" : gameState,
      })
      .eq("id", matchId);

    console.log("successfully dnf'd");
  }
}
