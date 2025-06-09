import supabase from "../supabase";

async function getLastXMatches(event, userId, lowerLimit, upperLimit) {
  const { data, error } =
    event === "all"
      ? await supabase
          .from("matches")
          .select("*")
          .or(`player_1_id.eq.${userId},player_2_id.eq.${userId}`)
          .order("created_at", { ascending: false })
          .range(lowerLimit, upperLimit)
      : await supabase
          .from("matches")
          .select("*")
          .or(`player_1_id.eq.${userId},player_2_id.eq.${userId}`)
          .eq("event", event)
          .order("created_at", { ascending: false })
          .range(lowerLimit, upperLimit);

  if (error) console.log(error);
  else return data;
}

async function getAvgLast5Matches(event, userId) {
  const matchesArr = await getLastXMatches(event, userId, 0, 4);
  console.log(matchesArr);
  let solves = [];

  matchesArr?.forEach((match) => {
    if (match.player_1_id == userId)
      solves = solves.concat(...match.player_1_times);
    if (match.player_2_id == userId)
      solves = solves.concat(...match.player_2_times);
  });

  solves = solves.filter((solveTime) => solveTime !== -1);

  let sum = 0;
  solves.forEach((solve) => (sum += parseFloat(solve)));

  if (solves.length === 0) return "N/A";
  return (sum / solves.length).toFixed(2);
}

export { getAvgLast5Matches, getLastXMatches };
