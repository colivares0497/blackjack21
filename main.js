document.addEventListener('DOMContentLoaded', () => {
    const startButton = document.getElementById('start-button');
    const introPage = document.getElementById('intro-page');
    const submitPlayersButton = document.getElementById('submit-players');
    const gamePage = document.getElementById('game-page');
    const numPlayersInput = document.getElementById('num-players');
    const playerNamesDiv = document.getElementById('player-names');
    const placeBetButton = document.getElementById('place-bet');
    const betAmountInput = document.getElementById('bet-amount');
    const playerBalanceSpan = document.getElementById('player-balance');
    const playerBetSpan = document.getElementById('player-bet');
    const hitButton = document.getElementById('hit');
    const stayButton = document.getElementById('stay');
    const restartButton = document.getElementById('restart-game');
    const gameLogDiv = document.getElementById('game-log');

    let players = [];
    let currentPlayerIndex = 0;
    let playerBalance = 20000;
    let playerBet = 0;

    // Start button functionality
    startButton.addEventListener('click', () => {
        document.getElementById('landing-page').style.display = 'none';
        introPage.style.display = 'block';
    });

    // Submit players functionality
    submitPlayersButton.addEventListener('click', () => {
        const numPlayers = parseInt(numPlayersInput.value);
        if (numPlayers < 1 || numPlayers > 8) {
            alert('Please enter a number between 1 and 8.');
            return;
        }

        players = [];
        playerNamesDiv.innerHTML = '';

        for (let i = 1; i <= numPlayers; i++) {
            const input = document.createElement('input');
            input.type = 'text';
            input.id = `player-${i}`;
            input.placeholder = `Player ${i} Name`;
            playerNamesDiv.appendChild(input);
            playerNamesDiv.appendChild(document.createElement('br'));
        }

        const submitNamesButton = document.createElement('button');
        submitNamesButton.textContent = 'Submit Names';
        submitNamesButton.addEventListener('click', () => {
            players = [];
            for (let i = 1; i <= numPlayers; i++) {
                const name = document.getElementById(`player-${i}`).value;
                if (name) {
                    players.push({ name, balance: 20000, bet: 0 });
                }
            }
            introPage.style.display = 'none';
            gamePage.style.display = 'block';
            updatePlayerInfo();
        });

        playerNamesDiv.appendChild(submitNamesButton);
    });

    // Place bet functionality
    placeBetButton.addEventListener('click', () => {
        const betAmount = parseInt(betAmountInput.value);
        if (isNaN(betAmount) || betAmount <= 0 || betAmount > playerBalance) {
            alert('Invalid bet amount.');
            return;
        }
        playerBet = betAmount;
        playerBalance -= betAmount;
        playerBetSpan.textContent = playerBet;
        playerBalanceSpan.textContent = playerBalance;

        // Proceed with the game logic
        startGame();
    });

    // Hit button functionality
    hitButton.addEventListener('click', () => {
        // Implement hit functionality
        gameLogDiv.textContent += 'Hit button clicked. Implement card drawing logic.\n';
    });

    // Stay button functionality
    stayButton.addEventListener('click', () => {
        // Implement stay functionality
        gameLogDiv.textContent += 'Stay button clicked. Implement stay logic.\n';
    });

    // Restart button functionality
    restartButton.addEventListener('click', () => {
        location.reload();
    });

    function updatePlayerInfo() {
        playerBalanceSpan.textContent = playerBalance;
        playerBetSpan.textContent = playerBet;
    }

    function startGame() {
        // Implement the logic to start the game
        gameLogDiv.textContent += 'Game started.\n';
    }
});