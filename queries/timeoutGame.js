export function FETCH_TIMEOUT_GAME(player) {
    return `query {
        joinGames(first:100, orderDirection:desc, where:{player:"${player}"})
        {
          id
          round
          player
        }
        createGames(first: 100, orderBy:round, orderDirection:desc, where:{host:"${player}"}) {
            id
            round
            host
            maxPlayers
            amount
          }
          withdrawDeadlines(first: 100, orderBy: round, orderDirection: desc, where: {sender:"${player}"}) {
            id
            round
            sender
          }
      }`;
  }