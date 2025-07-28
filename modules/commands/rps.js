const config = {
    name: "rps",
    aliases: ["rockpaperscissors"],
    author: 'Hridoy',
    description: "Play Rock, Paper, Scissors against the bot!",
    usage: "[rock/paper/scissors]",
    cooldown: 3,

  }
  
  const lang = {
    en_US: {
      invalidChoice: "⚠️ | Please choose rock, paper, or scissors.",
      playerChoice: "You chose: %1",
      botChoice: "Bot chose: %1",
      win: "🎉 | You win!",
      lose: "🤦‍♂️ | You lose!",
      tie: "🤝 | It's a tie!",
      gameStart: "Let's play Rock, Paper, Scissors! Choose: rock, paper, or scissors.",
    },
  }
  
  async function onStart({ api, event, args, getLang }) {
    const { threadID, messageID } = event
    const playerChoice = args[0]?.toLowerCase()
  
    if (!playerChoice || !["rock", "paper", "scissors"].includes(playerChoice)) {
      return api.sendMessage(lang.en_US.invalidChoice, threadID, messageID)
    }
  
    const choices = ["rock", "paper", "scissors"]
    const botChoice = choices[Math.floor(Math.random() * choices.length)]
  
    let resultMessage = ""
    let outcome = ""
  
    if (playerChoice === botChoice) {
      outcome = "tie"
      resultMessage = lang.en_US.tie
    } else if (
      (playerChoice === "rock" && botChoice === "scissors") ||
      (playerChoice === "paper" && botChoice === "rock") ||
      (playerChoice === "scissors" && botChoice === "paper")
    ) {
      outcome = "win"
      resultMessage = lang.en_US.win
    } else {
      outcome = "lose"
      resultMessage = lang.en_US.lose
    }
  
    const fullMessage =
      lang.en_US.playerChoice.replace("%1", playerChoice) +
      "\n" +
      lang.en_US.botChoice.replace("%1", botChoice) +
      "\n" +
      resultMessage
  
    api.sendMessage(fullMessage, threadID, messageID)
  }
  
  module.exports = {
    config,
    onStart,
  }
  