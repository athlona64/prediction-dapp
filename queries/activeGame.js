export function FETCH_CREATED_GAME() {
    return `query {
        createGames(first: 100, orderBy:round, orderDirection:asc) {
            id
            round
            host
            maxPlayers
            amount
          }
          gameEndeds(first: 100, orderBy:round, orderDirection:asc) {
            id
            round
            winners
            maxPlayers
          }
      }`;
  }