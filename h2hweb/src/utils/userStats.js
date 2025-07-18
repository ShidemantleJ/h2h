import { getMatchScore } from "../helpers/matchHelpers";
import supabase from "../supabase";

async function getLastXMatches(event, userId, lowerLimit, upperLimit) {
  let query = supabase
    .from("matches")
    .select(
      `*,
    player1:users!matches_player_1_id_fkey(id, name),
    player2:users!matches_player_2_id_fkey(id, name)`
    )
    .neq("status", "both_left");

  if (userId !== null) {
    query = query.or(`player_1_id.eq.${userId},player_2_id.eq.${userId}`);
  }

  if (event !== "all") {
    query = query.eq("event", event);
  }

  query = query
    .order("created_at", { ascending: false })
    .range(lowerLimit, upperLimit);

  const { data, error } = await query;
  if (error) console.log(error);
  else return data;
}

async function getStatsLast10Matches(event, userId) {
  const matchesArr = await getLastXMatches(event, userId, 0, 10);
  let solves = [];
  let solvesWon = 0;
  let solvesLost = 0;

  matchesArr?.forEach((match) => {
    // Add all solves for stats
    if (match.player_1_id == userId)
      solves = solves.concat(...match.player_1_times);
    if (match.player_2_id == userId)
      solves = solves.concat(...match.player_2_times);

    // Use getMatchScore to get solves won for this match
    const { solvesWonArr } = getMatchScore(match);
    // Determine if user is player 1 or 2 for this match
    const playerIdx = match.player_1_id == userId ? 0 : 1;
    // Sum up solves won in all sets for this match
    solvesWon += solvesWonArr.reduce(
      (acc, setArr) => acc + (setArr[playerIdx] || 0),
      0
    );
    solvesLost += solvesWonArr.reduce(
      (acc, setArr) => acc + (setArr[playerIdx === 0 ? 1 : 0] || 0),
      0
    );
  });

  solves = solves.filter((solveTime) => solveTime != -1);

  let sum = 0;
  solves.forEach((solve) => (sum += parseFloat(solve)));

  let mean;
  if (solves.length === 0) mean = "N/A";
  else mean = (sum / solves.length).toFixed(2);

  // Calculate standard deviation
  let stddev;
  if (solves.length === 0) {
    stddev = "N/A";
  } else {
    const meanNum = sum / solves.length;
    const variance =
      solves.reduce((acc, solve) => {
        const val = parseFloat(solve);
        return acc + Math.pow(val - meanNum, 2);
      }, 0) / solves.length;
    stddev = Math.sqrt(variance).toFixed(2);
  }

  const record = solvesWon + "-" + solvesLost;
  return { solvesArr: solves, mean: mean, stddev: stddev, record: record };
}

export { getStatsLast10Matches, getLastXMatches };
