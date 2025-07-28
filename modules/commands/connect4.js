const { createCanvas } = require("canvas")
const fs = require("fs")

const config = {
  name: "connect4",
  author: 'Hridoy',
  aliases: ["c4"],
  description: "Play Connect Four against another player!",
  usage: "[create/join/drop <column>/end]",
  cooldown: 3,
  
}

const lang = {
  en_US: {
    gameAlreadyStarted: "⚠️ | A Connect Four game is already in progress in this chat. Use `!c4 end` to stop it.",
    gameNotStarted: "⚠️ | No Connect Four game is currently active in this chat. Use `!c4 create` to start one.",
    gameCreated: "🎉 | Connect Four game created! Player Red: %1. Use `!c4 join` to join as Player Yellow.",
    playerJoined: "✅ | Player Yellow: %1 has joined the game! Player Red: %2. It's Player Red's turn.",
    waitingForPlayer: "⏳ | Waiting for Player Yellow to join. Player Red: %1. Use `!c4 join`.",
    notYourTurn: "⚠️ | It's not your turn, %1. It's %2's turn.",
    invalidColumn: "⚠️ | Invalid column. Please specify a column number between 1 and 7.",
    columnFull: "⚠️ | That column is full. Choose another one.",
    win: "🎉 | Congratulations, %1! You won!",
    draw: "🤝 | It's a draw!",
    gameEnded: "✅ | The Connect Four game has ended.",
    playerRed: "Player Red",
    playerYellow: "Player Yellow",
    turnMessage: "It's %1's turn (%2).",
  },
}


const connect4Games = {}


async function drawConnect4Board(game) {
  const numRows = 6
  const numCols = 7
  const cellSize = 80 
  const discRadius = 30
  const padding = 10
  const boardWidth = numCols * cellSize
  const boardHeight = numRows * cellSize
  const canvasWidth = boardWidth + padding * 2
  const canvasHeight = boardHeight + padding * 2 + 60 

  const canvas = createCanvas(canvasWidth, canvasHeight)
  const ctx = canvas.getContext("2d")

  
  ctx.fillStyle = "#282c34" 
  ctx.fillRect(0, 0, canvasWidth, canvasHeight)


  ctx.fillStyle = "#61afef" 
  ctx.fillRect(padding, padding + 40, boardWidth, boardHeight)


  for (let r = 0; r < numRows; r++) {
    for (let c = 0; c < numCols; c++) {
      const centerX = padding + c * cellSize + cellSize / 2
      const centerY = padding + 40 + r * cellSize + cellSize / 2

   
      ctx.beginPath()
      ctx.arc(centerX, centerY, discRadius, 0, Math.PI * 2, true)
      ctx.fillStyle = "#282c34"
      ctx.fill()

      const disc = game.board[r][c]
      if (disc === "R") {
        ctx.fillStyle = "#e06c75" 
        ctx.beginPath()
        ctx.arc(centerX, centerY, discRadius, 0, Math.PI * 2, true)
        ctx.fill()
      } else if (disc === "Y") {
        ctx.fillStyle = "#f9e2af"
        ctx.beginPath()
        ctx.arc(centerX, centerY, discRadius, 0, Math.PI * 2, true)
        ctx.fill()
      }
    }
  }


  if (game.status === "won" && game.winningLine) {
    ctx.strokeStyle = "#ffffff" 
    ctx.lineWidth = 8
    ctx.lineCap = "round"

    ctx.beginPath()
    const startCell = game.winningLine[0]
    const endCell = game.winningLine[game.winningLine.length - 1]

    const startX = padding + startCell.col * cellSize + cellSize / 2
    const startY = padding + 40 + startCell.row * cellSize + cellSize / 2
    const endX = padding + endCell.col * cellSize + cellSize / 2
    const endY = padding + 40 + endCell.row * cellSize + cellSize / 2

    ctx.moveTo(startX, startY)
    ctx.lineTo(endX, endY)
    ctx.stroke()
  }


  ctx.font = "bold 30px Arial"
  ctx.textAlign = "center"
  ctx.fillStyle = "#abb2bf"

  let message = ""
  if (game.status === "playing") {
    const currentPlayerName =
      game.currentPlayer === "R"
        ? game.playerRName || lang.en_US.playerRed
        : game.playerYName || lang.en_US.playerYellow
    message = lang.en_US.turnMessage.replace("%1", currentPlayerName).replace("%2", game.currentPlayer)
  } else if (game.status === "won") {
    const winnerName =
      game.winner === "R" ? game.playerRName || lang.en_US.playerRed : game.playerYName || lang.en_US.playerYellow
    message = lang.en_US.win.replace("%1", winnerName)
  } else if (game.status === "draw") {
    message = lang.en_US.draw
  } else if (game.status === "waiting") {
    message = lang.en_US.waitingForPlayer.replace("%1", game.playerRName || lang.en_US.playerRed)
  }

 
  if (game.status !== "playing") {
    ctx.fillStyle = "rgba(40, 44, 52, 0.8)" 
    ctx.fillRect(0, canvasHeight / 2 - 50, canvasWidth, 100)
    ctx.fillStyle = "#FFFFFF"
    ctx.fillText(message, canvasWidth / 2, canvasHeight / 2)
  } else {

    ctx.fillStyle = "#abb2bf"
    ctx.fillText(message, canvasWidth / 2, 30)
  }

  const buffer = canvas.toBuffer("image/png")
  const imagePath = `temp/connect4_${game.threadID}.png`
  fs.writeFileSync(imagePath, buffer)
  return fs.createReadStream(imagePath)
}


function createEmptyBoard() {
  const board = []
  for (let r = 0; r < 6; r++) {
    board.push(new Array(7).fill(null))
  }
  return board
}

function dropDisc(board, col, player) {
  for (let r = 5; r >= 0; r--) {
    if (board[r][col] === null) {
      board[r][col] = player
      return { row: r, col: col }
    }
  }
  return null 
}

function checkWin(board, player) {
  const numRows = 6
  const numCols = 7


  for (let r = 0; r < numRows; r++) {
    for (let c = 0; c <= numCols - 4; c++) {
      if (
        board[r][c] === player &&
        board[r][c + 1] === player &&
        board[r][c + 2] === player &&
        board[r][c + 3] === player
      ) {
        return [
          { row: r, col: c },
          { row: r, col: c + 1 },
          { row: r, col: c + 2 },
          { row: r, col: c + 3 },
        ]
      }
    }
  }


  for (let r = 0; r <= numRows - 4; r++) {
    for (let c = 0; c < numCols; c++) {
      if (
        board[r][c] === player &&
        board[r + 1][c] === player &&
        board[r + 2][c] === player &&
        board[r + 3][c] === player
      ) {
        return [
          { row: r, col: c },
          { row: r + 1, col: c },
          { row: r + 2, col: c },
          { row: r + 3, col: c },
        ]
      }
    }
  }


  for (let r = 0; r <= numRows - 4; r++) {
    for (let c = 0; c <= numCols - 4; c++) {
      if (
        board[r][c] === player &&
        board[r + 1][c + 1] === player &&
        board[r + 2][c + 2] === player &&
        board[r + 3][c + 3] === player
      ) {
        return [
          { row: r, col: c },
          { row: r + 1, col: c + 1 },
          { row: r + 2, col: c + 2 },
          { row: r + 3, col: c + 3 },
        ]
      }
    }
  }


  for (let r = 3; r < numRows; r++) {
    for (let c = 0; c <= numCols - 4; c++) {
      if (
        board[r][c] === player &&
        board[r - 1][c + 1] === player &&
        board[r - 2][c + 2] === player &&
        board[r - 3][c + 3] === player
      ) {
        return [
          { row: r, col: c },
          { row: r - 1, col: c + 1 },
          { row: r - 2, col: c + 2 },
          { row: r - 3, col: c + 3 },
        ]
      }
    }
  }

  return null
}

function checkDraw(board) {
  for (let c = 0; c < 7; c++) {
    if (board[0][c] === null) {
      return false 
    }
  }
  return true 
}


async function onStart({ api, event, args, getLang }) {
  const { threadID, senderID, messageID } = event

 
  const getUserName = async (id) => {
    return global.data?.users?.get(id)?.name || id
  }

  switch (args[0]) {
    case "create":
      if (connect4Games[threadID]) {
        return api.sendMessage(lang.en_US.gameAlreadyStarted, threadID, messageID)
      }

      const playerRId = senderID
      const playerRName = await getUserName(playerRId)

      connect4Games[threadID] = {
        threadID,
        board: createEmptyBoard(),
        playerR: playerRId,
        playerRName: playerRName,
        playerY: null,
        playerYName: null,
        currentPlayer: "R", 
        status: "waiting",
        winningLine: null,
      }

      const initialImageStream = await drawConnect4Board(connect4Games[threadID])
      api.sendMessage(
        {
          body: lang.en_US.gameCreated.replace("%1", playerRName),
          attachment: initialImageStream,
        },
        threadID,
        () => fs.unlinkSync(`temp/connect4_${threadID}.png`),
      )
      break

    case "join":
      const gameToJoin = connect4Games[threadID]
      if (!gameToJoin) {
        return api.sendMessage(lang.en_US.gameNotStarted, threadID, messageID)
      }
      if (gameToJoin.status !== "waiting") {
        return api.sendMessage("⚠️ | This game has already started or finished.", threadID, messageID)
      }
      if (gameToJoin.playerR === senderID) {
        return api.sendMessage("⚠️ | You are already Player Red in this game.", threadID, messageID)
      }

      gameToJoin.playerY = senderID
      gameToJoin.playerYName = await getUserName(senderID)
      gameToJoin.status = "playing"

      const joinedImageStream = await drawConnect4Board(gameToJoin)
      api.sendMessage(
        {
          body: lang.en_US.playerJoined.replace("%1", gameToJoin.playerYName).replace("%2", gameToJoin.playerRName),
          attachment: joinedImageStream,
        },
        threadID,
        () => fs.unlinkSync(`temp/connect4_${threadID}.png`),
      )
      break

    case "drop":
      const gameToPlay = connect4Games[threadID]
      if (!gameToPlay || gameToPlay.status !== "playing") {
        return api.sendMessage(lang.en_US.gameNotStarted, threadID, messageID)
      }
      if (gameToPlay.playerY === null) {
        return api.sendMessage(lang.en_US.waitingForPlayer.replace("%1", gameToPlay.playerRName), threadID, messageID)
      }

      const playerSymbol = senderID === gameToPlay.playerR ? "R" : senderID === gameToPlay.playerY ? "Y" : null
      if (!playerSymbol) {
        return api.sendMessage("⚠️ | You are not a player in this game.", threadID, messageID)
      }
      if (playerSymbol !== gameToPlay.currentPlayer) {
        const currentPlayerName =
          gameToPlay.currentPlayer === "R"
            ? gameToPlay.playerRName || lang.en_US.playerRed
            : gameToPlay.playerYName || lang.en_US.playerYellow
        return api.sendMessage(
          lang.en_US.notYourTurn.replace("%1", await getUserName(senderID)).replace("%2", currentPlayerName),
          threadID,
          messageID,
        )
      }

      const column = Number.parseInt(args[1]) - 1 
      if (isNaN(column) || column < 0 || column > 6) {
        return api.sendMessage(lang.en_US.invalidColumn, threadID, messageID)
      }

      const discPosition = dropDisc(gameToPlay.board, column, playerSymbol)
      if (discPosition === null) {
        return api.sendMessage(lang.en_US.columnFull, threadID, messageID)
      }

      const winningLine = checkWin(gameToPlay.board, playerSymbol)
      if (winningLine) {
        gameToPlay.status = "won"
        gameToPlay.winner = playerSymbol
        gameToPlay.winningLine = winningLine 
        const finalImageStream = await drawConnect4Board(gameToPlay)
        api.sendMessage(
          {
            body: lang.en_US.win.replace("%1", playerSymbol === "R" ? gameToPlay.playerRName : gameToPlay.playerYName),
            attachment: finalImageStream,
          },
          threadID,
          () => fs.unlinkSync(`temp/connect4_${threadID}.png`),
        )
        delete connect4Games[threadID] 
      } else if (checkDraw(gameToPlay.board)) {
        gameToPlay.status = "draw"
        const finalImageStream = await drawConnect4Board(gameToPlay)
        api.sendMessage(
          {
            body: lang.en_US.draw,
            attachment: finalImageStream,
          },
          threadID,
          () => fs.unlinkSync(`temp/connect4_${threadID}.png`),
        )
        delete connect4Games[threadID]
      } else {
        gameToPlay.currentPlayer = playerSymbol === "R" ? "Y" : "R"
        const imageStream = await drawConnect4Board(gameToPlay)
        api.sendMessage(
          {
            body: lang.en_US.turnMessage
              .replace("%1", gameToPlay.currentPlayer === "R" ? gameToPlay.playerRName : gameToPlay.playerYName)
              .replace("%2", gameToPlay.currentPlayer),
            attachment: imageStream,
          },
          threadID,
          () => fs.unlinkSync(`temp/connect4_${threadID}.png`),
        )
      }
      break

    case "end":
      if (!connect4Games[threadID]) {
        return api.sendMessage(lang.en_US.gameNotStarted, threadID, messageID)
      }
      delete connect4Games[threadID]
      api.sendMessage(lang.en_US.gameEnded, threadID, messageID)
      break

    default:
      api.sendMessage(
        "Invalid subcommand. Use `!c4 create`, `!c4 join`, `!c4 drop <column>`, or `!c4 end`.",
        threadID,
        messageID,
      )
      break
  }
}

module.exports = {
  config,
  onStart,
}
