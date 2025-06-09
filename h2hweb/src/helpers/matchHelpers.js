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
  let setResult = "";
  let solvesWonArr = [0, 0];
  if (
    !p1setarr ||
    !p2setarr ||
    p1setarr.length === 0 ||
    p2setarr.length === 0
  ) {
    setResult = "SET_NOT_OVER";
    return { setResult, solvesWonArr };
  }
  for (let i = 0; i < p1setarr.length; i++) {
    const winningPlayer = whoWonSolve(p1setarr[i], p2setarr[i]);
    if (winningPlayer < 0) continue;
    solvesWonArr[winningPlayer]++;
    console.assert(winningPlayer === 0 || winningPlayer === 1);
  }
  if (solvesWonArr[0] >= solvesToWin) setResult = "P1_WON";
  else if (solvesWonArr[1] >= solvesToWin) setResult = "P2_WON";
  else setResult = "SET_NOT_OVER";

  return { setResult, solvesWonArr };
}

function getMatchScore(numSets, match) {
  const p1timearr = match.player_1_times;
  const p2timearr = match.player_2_times;

  // Creates array with a row for each set. Each row contains solves won by p1 at index 0,
  // and solves won by p2 at index 1
  let solvesWonArr = Array.from({ length: numSets }, () => Array(2).fill(0));
  let setsWonArr = [0, 0];

  for (let i = 0; i < numSets; i++) {
    const { setResult, solvesWonArr: solvesWonInSetArr } = wonSet(
      match.best_of_solve_format,
      p1timearr?.[i],
      p2timearr?.[i]
    );

    solvesWonArr[i][0] += solvesWonInSetArr[0];
    solvesWonArr[i][1] += solvesWonInSetArr[1];
    if (setResult === "P1_WON") setsWonArr[0]++;
    else if (setResult === "P2_WON") setsWonArr[1]++;
  }

  return { setsWonArr, solvesWonArr };
}

export { whoWonSolve, wonSet, getMatchScore };
