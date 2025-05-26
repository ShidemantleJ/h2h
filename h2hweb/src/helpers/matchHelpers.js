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

export {whoWonSolve, wonSet};