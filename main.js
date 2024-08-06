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
    const gameLogDiv = document.getElementById('game-log');

    let players = [];
    let dealer = { name: 'Dealer', balance: 20000, cards: [] }; // Dealer starts with $20,000
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
                    players.push({ name, balance: 0, bet: 0, cards: [], hasStood: false });
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
                <input type="number" id="bet-${index}" placeholder="Enter bet amount" min="1" max="10000">
            `;
            bettingTableDiv.appendChild(playerDiv);
        });
    }

    // Submit bets functionality
    submitBetsButton.addEventListener('click', () => {
        let validBets = true;
        players.forEach((player, index) => {
            const betAmount = parseInt(document.getElementById(`bet-${index}`).value);
            if (isNaN(betAmount) || betAmount <= 0) {
                alert(`Invalid bet amount for ${player.name}.`);
                validBets = false;
                return;
            }
            player.bet = betAmount;
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
        const dealerDiv = document.createElement('div');
        dealerDiv.id = 'dealer-info';
        dealerDiv.className = 'player-info';
        dealerDiv.innerHTML = `
            <h3>${dealer.name}</h3>
            <p>Balance: $${dealer.balance}</p>
            <p>Cards: <span id="dealer-cards"></span></p>
        `;
        gameTableDiv.appendChild(dealerDiv);

        players.forEach((player, index) => {
            const playerDiv = document.createElement('div');
            playerDiv.className = 'player-info';
            playerDiv.id = `player-info-${index}`;
            playerDiv.innerHTML = `
                <h3>${player.name}</h3>
                <p>Balance: $${player.balance}</p>
                <p>Bet: $${player.bet}</p>
                <p>Cards: <span id="player-cards-${index}"></span></p>
                <p id="player-status-${index}"></p> <!-- Status paragraph -->
                <div class="player-controls">
                    <button class="hit" data-index="${index}">Hit</button>
                    <button class="stay" data-index="${index}">Stay</button>
                </div>
                <p id="player-result-${index}"></p> <!-- Result paragraph -->
            `;
            gameTableDiv.appendChild(playerDiv);
        });

        // Show game controls
        gameTableDiv.innerHTML += `
            <div id="game-controls">
                <!-- No End Turn button -->
            </div>
        `;

        // Add event listeners for buttons
        document.querySelectorAll('.hit').forEach(button => {
            button.addEventListener('click', handleHit);
        });
        document.querySelectorAll('.stay').forEach(button => {
            button.addEventListener('click', handleStay);
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
            dealer.balance += player.bet;  // Player's bet goes to dealer
            player.balance = 0;  // Player loses all their money
            player.bet = 0;  // Reset player's bet
            player.hasStood = true;  // Player cannot hit after busting

            // Display result for player
            document.getElementById(`player-result-${index}`).textContent = `${player.name} busts!`;

            // Remove player from game
            document.getElementById(`player-info-${index}`).remove();
            players.splice(index, 1);  // Remove player from array

            // Re-enable buttons for remaining players
            updatePlayerControls();

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
        document.querySelector(`.hit[data-index="${index}"]`).disabled = true;  // Disable Hit button
        document.querySelector(`.stay[data-index="${index}"]`).disabled = true;  // Disable Stay button

        // Display the status of staying on the page
        document.getElementById(`player-status-${index}`).textContent = `${player.name} has stayed.`;

        checkAllPlayersStayed();
    }

    // Update player controls after removal
    function updatePlayerControls() {
        document.querySelectorAll('.hit').forEach(button => {
            button.addEventListener('click', handleHit);
        });
        document.querySelectorAll('.stay').forEach(button => {
            button.addEventListener('click', handleStay);
        });
    }

    // Check if all players have stayed or busted
    function checkAllPlayersStayed() {
        if (players.length === 0 || players.every(player => player.hasStood)) {
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
            endGame();
        } else {
            resolveWinners();
        }
    }

    function resolveWinners() {
        const dealerValue = calculateHandValue(dealer.cards);
        players.forEach(player => {
            const playerValue = calculateHandValue(player.cards);
            const resultParagraph = document.getElementById(`player-result-${players.indexOf(player)}`);
            if (playerValue > 21) {
                gameLogDiv.textContent += `${player.name} busts with ${playerValue}. Dealer wins.\n`;
                gameLogDiv.textContent += `${player.name} loses $${player.bet}.\n`;
                dealer.balance += player.bet;  // Player's bet goes to dealer
                player.balance = 0;  // Player loses all their money
                player.bet = 0;  // Reset player's bet
                resultParagraph.textContent = `${player.name} busts! Dealer wins.`;
            } else if (dealerValue > 21 || playerValue > dealerValue) {
                player.balance += player.bet * 2; // Player wins, gets back their bet plus winnings
                gameLogDiv.textContent += `${player.name} wins with ${playerValue}!\n`;
                gameLogDiv.textContent += `${player.name} wins $${player.bet}.\n`;
                player.bet = 0;  // Reset player's bet
                resultParagraph.textContent = `${player.name} wins with ${playerValue}!`;
            } else if (playerValue < dealerValue) {
                gameLogDiv.textContent += `${player.name} loses with ${playerValue}. Dealer wins.\n`;
                gameLogDiv.textContent += `${player.name} loses $${player.bet}.\n`;
                dealer.balance += player.bet;  // Player's bet goes to dealer
                player.bet = 0;  // Reset player's bet
                resultParagraph.textContent = `${player.name} loses with ${playerValue}. Dealer wins.`;
            } else {
                player.balance += player.bet; // Tie, player gets back their bet
                gameLogDiv.textContent += `${player.name} ties with the dealer at ${playerValue}.\n`;
                player.bet = 0;  // Reset player's bet
                resultParagraph.textContent = `${player.name} ties with the dealer at ${playerValue}.`;
            }
        });

        endGame();
    }

    function endGame() {
        gamePage.innerHTML += '<button id="restart-game">Restart Game</button>';
        const restartButton = document.getElementById('restart-game');
        restartButton.addEventListener('click', () => location.reload());
    }
});
