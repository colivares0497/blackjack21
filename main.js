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
    let deckId = '';
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
                    players.push({ name, balance: 1000, bet: 0, cards: [], hasStood: false });
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
            if (isNaN(betAmount) || betAmount <= 0 || betAmount > player.balance) {
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
            <div id="dealer-cards" class="card-flip">
                <!-- The card-flip-inner will be updated dynamically -->
            </div>
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

    // Fetch new deck of cards
    function fetchNewDeck() {
        return fetch('https://deckofcardsapi.com/api/deck/new/shuffle/?deck_count=1')
            .then(response => response.json())
            .then(data => {
                deckId = data.deck_id;
            });
    }

    // Draw a card from the deck
    function drawCard() {
        return fetch(`https://deckofcardsapi.com/api/deck/${deckId}/draw/?count=1`)
            .then(response => response.json())
            .then(data => data.cards[0])
            .catch(error => {
                console.error('Error drawing card:', error);
                return null;
            });
    }

    // Update player card display with images
    function updatePlayerCardDisplay(index) {
        const player = players[index];
        const cardImages = player.cards.map(card => `<img src="${card.image}" alt="${card.value} of ${card.suit}" class="card-image">`).join(' ');
        document.getElementById(`player-cards-${index}`).innerHTML = cardImages;
    }

    // Update dealer card display with card-flipping effect
    function updateDealerCardDisplay(isFlipping = false) {
        const dealerCardsDiv = document.getElementById('dealer-cards');
        dealerCardsDiv.innerHTML = ''; // Clear previous content

        if (isFlipping) {
            const frontCard = dealer.cards[0];
            const backCard = dealer.cards[1] || { image: '', value: 'Hidden Card', suit: '' };

            dealerCardsDiv.innerHTML = `
                <div class="card-flip">
                    <div class="card-flip-inner">
                        <div class="card-flip-front">
                            <img src="${frontCard.image}" alt="${frontCard.value} of ${frontCard.suit}" class="card-image">
                        </div>
                        <div class="card-flip-back">
                            <p>${backCard.value} - ${backCard.suit}</p>
                        </div>
                    </div>
                </div>
            `;
        } else {
            dealer.cards.forEach(card => {
                dealerCardsDiv.innerHTML += `<img src="${card.image}" alt="${card.value} of ${card.suit}" class="card-image">`;
            });
        }
    }

    // Start the game
    function startGame() {
        gameLogDiv.textContent += 'Game started. Dealer is shuffling and dealing cards...\n';
        fetchNewDeck().then(() => {
            shuffleAndDeal();
        });
    }

    // Shuffle and deal cards
    function shuffleAndDeal() {
        gameLogDiv.textContent += 'Dealer shuffles the deck.\n';
        gameLogDiv.textContent += 'Dealer deals cards to each player.\n';
        players.forEach((player, index) => {
            drawCard().then(card1 => {
                player.cards.push(card1);
                return drawCard();
            }).then(card2 => {
                player.cards.push(card2);
                updatePlayerCardDisplay(index);
            });
        });
        drawCard().then(card1 => {
            dealer.cards.push(card1);
            document.getElementById('dealer-cards').innerHTML = `<div class="card-flip"><div class="card-flip-inner"><div class="card-flip-front"><img src="${card1.image}" alt="${card1.value} of ${card1.suit}" class="card-image"></div><div class="card-flip-back"><p>Hidden Card</p></div></div></div>`;
        });
    }

    // Handle player's hit action
    function handleHit(event) {
        if (gameOver) return;
        const playerIndex = parseInt(event.target.dataset.index);
        const player = players[playerIndex];
        if (player.hasStood) {
            alert('You have already stood.');
            return;
        }
        drawCard().then(card => {
            player.cards.push(card);
            updatePlayerCardDisplay(playerIndex);
            const handValue = calculateHandValue(player.cards);
            document.getElementById(`player-status-${playerIndex}`).textContent = `Hand value: ${handValue}`;

            if (handValue > 21) {
                document.getElementById(`player-result-${playerIndex}`).textContent = 'Busted!';
                player.hasStood = true;
                checkAllPlayersFinished();
            }
        });
    }

    // Handle player's stay action
    function handleStay(event) {
        if (gameOver) return;
        const playerIndex = parseInt(event.target.dataset.index);
        const player = players[playerIndex];
        player.hasStood = true;
        document.getElementById(`player-status-${playerIndex}`).textContent = 'Stayed';
        checkAllPlayersFinished();
    }

    // Check if all players have finished their turn
    function checkAllPlayersFinished() {
        if (players.every(player => player.hasStood || calculateHandValue(player.cards) > 21)) {
            dealerTurn();
        }
    }

    // Calculate hand value
    function calculateHandValue(cards) {
        let value = 0;
        let hasAce = false;
        cards.forEach(card => {
            if (['JACK', 'QUEEN', 'KING'].includes(card.value)) {
                value += 10;
            } else if (card.value === 'ACE') {
                value += 11;
                hasAce = true;
            } else {
                value += parseInt(card.value);
            }
        });
        while (value > 21 && hasAce) {
            value -= 10;
            hasAce = false;
        }
        return value;
    }

    // Dealer's turn logic including card flipping effect
    function dealerTurn() {
        gameLogDiv.textContent += 'Dealer reveals hidden card.\n';

        // Initial card display with hidden card
        updateDealerCardDisplay();

        // Animate card flipping
        setTimeout(() => {
            updateDealerCardDisplay(true);
        }, 1000); // Adjust the delay as needed

        // Continue with the dealer's turn
        setTimeout(() => {
            let dealerValue = calculateHandValue(dealer.cards);
            while (dealerValue < 17) {
                drawCard().then(card => {
                    dealer.cards.push(card);
                    updateDealerCardDisplay();
                    dealerValue = calculateHandValue(dealer.cards);
                });
            }

            if (dealerValue === 21) {
                gameOver = true;
                gameLogDiv.textContent += 'Dealer has 21. Dealer wins!\n';
                alert('Dealer wins with a blackjack! All bets are lost.');
                endGame();
            } else {
                resolveWinners();
            }
        }, 2000); // Adjust the delay to ensure flipping effect is visible
    }

    // Resolve winners
    function resolveWinners() {
        const dealerValue = calculateHandValue(dealer.cards);
        players.forEach(player => {
            const playerValue = calculateHandValue(player.cards);
            if (playerValue > 21) {
                gameLogDiv.textContent += `${player.name} busts with ${playerValue}!\n`;
            } else if (dealerValue > 21 || playerValue > dealerValue) {
                gameLogDiv.textContent += `${player.name} wins with ${playerValue}!\n`;
                player.balance += player.bet * 2; // Win bet amount
            } else if (playerValue === dealerValue) {
                gameLogDiv.textContent += `${player.name} ties with ${playerValue}!\n`;
                player.balance += player.bet; // Return bet amount
            } else {
                gameLogDiv.textContent += `${player.name} loses with ${playerValue}.\n`;
            }
        });
        endGame();
    }

    // End game
    function endGame() {
        gameOver = true;
        document.getElementById('game-controls').innerHTML = '<button id="restart-game">Restart Game</button>';
        document.getElementById('restart-game').addEventListener('click', () => {
            location.reload();
        });
    }
});
