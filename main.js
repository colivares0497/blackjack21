document.addEventListener('DOMContentLoaded', () => {
    const startButton = document.getElementById('start-button');
    const introPage = document.getElementById('intro-page');
    const submitPlayersButton = document.getElementById('submit-players');
    const bettingPage = document.getElementById('betting-page');
    const gamePage = document.getElementById('game-page');
    const numPlayersInput = document.getElementById('num-players');
    const playerNamesDiv = document.getElementById('player-names');
    const bettingTableDiv = document.getElementById('betting-table');
    const submitBetsButton = document.getElementById('submit-bets');
    const gameTableDiv = document.getElementById('game-table');
    const hitButton = document.getElementById('hit');
    const stayButton = document.getElementById('stay');
    const restartButton = document.getElementById('restart-game');
    const gameLogDiv = document.getElementById('game-log');

    let players = [];
    let dealer = { name: 'Dealer', balance: 0, cards: [] };
    let gameOver = false;

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
                    players.push({ name, balance: 20000, bet: 0, cards: [], hasStood: false });
                }
            }
            introPage.style.display = 'none';
            bettingPage.style.display = 'block';
            showBettingTable();
        });

        playerNamesDiv.appendChild(submitNamesButton);
    });

    // Show betting table functionality
    function showBettingTable() {
        bettingTableDiv.innerHTML = '';
        players.forEach((player, index) => {
            const playerDiv = document.createElement('div');
            playerDiv.className = 'player-bet';
            playerDiv.innerHTML = `
                <p>${player.name} - Balance: $${player.balance}</p>
                <input type="number" id="bet-${index}" placeholder="Enter bet amount" min="1" max="${player.balance}">
            `;
            bettingTableDiv.appendChild(playerDiv);
        });
    }

    // Submit bets functionality
    submitBetsButton.addEventListener('click', () => {
        let validBets = true;
        players.forEach((player, index) => {
            const betAmount = parseInt(document.getElementById(`bet-${index}`).value);
            if (isNaN(betAmount) || betAmount <= 0 || betAmount > player.balance) {
                alert(`Invalid bet amount for ${player.name}.`);
                validBets = false;
                return;
            }
            player.bet = betAmount;
            player.balance -= betAmount;
        });

        if (validBets) {
            bettingPage.style.display = 'none';
            gamePage.style.display = 'block';
            showGameTable();
            startGame();
        }
    });

    // Show game table functionality
    function showGameTable() {
        gameTableDiv.innerHTML = '';

        // Dealer info
        const dealerDiv = document.createElement('div');
        dealerDiv.className = 'player-info';
        dealerDiv.id = 'dealer-info';
        dealerDiv.innerHTML = `
            <h3>${dealer.name}</h3>
            <p>Balance: $${dealer.balance}</p>
            <p>Cards: <span id="dealer-cards"></span></p>
        `;
        gameTableDiv.appendChild(dealerDiv);

        // Player info
        players.forEach((player, index) => {
            const playerDiv = document.createElement('div');
            playerDiv.className = 'player-info';
            playerDiv.id = `player-info-${index}`;
            playerDiv.innerHTML = `
                <h3>${player.name}</h3>
                <p>Balance: $${player.balance}</p>
                <p>Bet: $${player.bet}</p>
                <p>Cards: <span id="player-cards-${index}"></span></p>
                <div class="player-controls">
                    <button class="hit" data-index="${index}">Hit</button>
                    <button class="stay" data-index="${index}">Stay</button>
                </div>
            `;
            gameTableDiv.appendChild(playerDiv);
        });

        // Show controls
        hitButton.style.display = 'inline-block';
        stayButton.style.display = 'inline-block';

        // Add event listeners for new buttons
        document.querySelectorAll('.hit').forEach(button => {
            button.addEventListener('click', (e) => handleHit(e));
        });
        document.querySelectorAll('.stay').forEach(button => {
            button.addEventListener('click', (e) => handleStay(e));
        });
    }

    // Hit button functionality
    function handleHit(event) {
        if (gameOver) return;

        const index = parseInt(event.target.getAttribute('data-index'));
        const player = players[index];

        if (player.hasStood) {
            alert(`${player.name} has already stayed.`);
            return;
        }

        const card = drawCard();
        player.cards.push(card);
        document.getElementById(`player-cards-${index}`).textContent = player.cards.join(', ');

        if (calculateHandValue(player.cards) > 21) {
            alert(`${player.name} has busted!`);
            player.hasStood = true;  // Player cannot hit after busting
            checkAllPlayersStayed();
        }
    }

    // Stay button functionality
    function handleStay(event) {
        const index = parseInt(event.target.getAttribute('data-index'));
        const player = players[index];

        if (player.hasStood) {
            alert(`${player.name} has already stayed.`);
            return;
        }

        player.hasStood = true;
        checkAllPlayersStayed();
    }

    // Check if all players have stayed
    function checkAllPlayersStayed() {
        if (players.every(player => player.hasStood)) {
            dealerTurn();
        }
    }

    function startGame() {
        gameLogDiv.textContent += 'Game started. Dealer is shuffling and dealing cards...\n';
        shuffleAndDeal();
    }

    function shuffleAndDeal() {
        gameLogDiv.textContent += 'Dealer shuffles the deck.\n';
        gameLogDiv.textContent += 'Dealer deals cards to each player.\n';
        players.forEach((player, index) => {
            const card1 = drawCard();
            const card2 = drawCard();
            player.cards.push(card1, card2);
            document.getElementById(`player-cards-${index}`).textContent = `${card1}, ${card2}`;
        });
        const dealerCard1 = drawCard();
        dealer.cards.push(dealerCard1);
        document.getElementById('dealer-cards').textContent = `${dealerCard1}, [hidden]`;
    }

    function drawCard() {
        const suits = ['♣', '♦', '♥', '♠'];
        const values = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
        const suit = suits[Math.floor(Math.random() * suits.length)];
        const value = values[Math.floor(Math.random() * values.length)];
        return `${value}${suit}`;
    }

    function calculateHandValue(cards) {
        let value = 0;
        let aceCount = 0;

        cards.forEach(card => {
            const cardValue = card.slice(0, -1);
            if (cardValue === 'A') {
                value += 11;
                aceCount++;
            } else if (['K', 'Q', 'J'].includes(cardValue)) {
                value += 10;
            } else {
                value += parseInt(cardValue, 10);
            }
        });

        while (value > 21 && aceCount > 0) {
            value -= 10;
            aceCount--;
        }

        return value;
    }

    function dealerTurn() {
        gameLogDiv.textContent += 'Dealer reveals hidden card.\n';
        document.getElementById('dealer-cards').textContent = dealer.cards.join(', ');

        while (calculateHandValue(dealer.cards) < 17) {
            dealer.cards.push(drawCard());
            document.getElementById('dealer-cards').textContent = dealer.cards.join(', ');
        }

        const dealerValue = calculateHandValue(dealer.cards);
        if (dealerValue === 21) {
            gameOver = true;
            gameLogDiv.textContent += 'Dealer has 21. Dealer wins!\n';
            alert('Dealer wins with a blackjack! All bets are lost.');
        } else {
            resolveWinners();
        }
    }

    function resolveWinners() {
        const dealerValue = calculateHandValue(dealer.cards);
        players.forEach(player => {
            const playerValue = calculateHandValue(player.cards);
            if (playerValue > 21) {
                gameLogDiv.textContent += `${player.name} busts with ${playerValue}. Dealer wins.\n`;
                gameLogDiv.textContent += `${player.name} loses $${player.bet}.\n`;
            } else if (dealerValue > 21 || playerValue > dealerValue) {
                gameLogDiv.textContent += `${player.name} wins with ${playerValue}!\n`;
                gameLogDiv.textContent += `${player.name} wins $${player.bet}.\n`;
            } else if (playerValue < dealerValue) {
                gameLogDiv.textContent += `${player.name} loses with ${playerValue}. Dealer wins.\n`;
                gameLogDiv.textContent += `${player.name} loses $${player.bet}.\n`;
            } else {
                gameLogDiv.textContent += `${player.name} ties with the dealer at ${playerValue}.\n`;
                // No money changes for a tie
            }
        });

        // Display restart button
        gamePage.innerHTML += '<button id="restart-game">Restart Game</button>';
        restartButton = document.getElementById('restart-game');
        restartButton.addEventListener('click', () => location.reload());
    }
});
