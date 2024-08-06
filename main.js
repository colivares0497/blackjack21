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
    const restartButton = document.getElementById('restart-game');

    let players = [];
    let dealer = { name: 'Dealer', balance: 0, cards: [] };
    let deck = [];

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
                    players.push({ name, balance: 20000, bet: 0, cards: [] });
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
        
        const dealerDiv = document.createElement('div');
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
                <div class="player-controls">
                    <button id="hit-${index}">Hit</button>
                    <button id="stay-${index}">Stay</button>
                </div>
            `;
            gameTableDiv.appendChild(playerDiv);

            // Add event listeners for these buttons
            document.getElementById(`hit-${index}`).addEventListener('click', () => handleHit(index));
            document.getElementById(`stay-${index}`).addEventListener('click', () => handleStay(index));
        });
    }

    // Handle Hit Button Click
    function handleHit(playerIndex) {
        const player = players[playerIndex];
        const newCard = drawCard();
        player.cards.push(newCard);

        // Update player’s card display
        document.getElementById(`player-cards-${playerIndex}`).textContent += `, ${newCard}`;

        // Check for bust
        if (calculateHandValue(player.cards) > 21) {
            gameLogDiv.textContent += `${player.name} busts with ${player.cards.join(', ')}.\n`;
            // Disable hit and stay buttons for this player
            document.getElementById(`hit-${playerIndex}`).disabled = true;
            document.getElementById(`stay-${playerIndex}`).disabled = true;
        }
    }

    // Handle Stay Button Click
    function handleStay(playerIndex) {
        gameLogDiv.textContent += `${players[playerIndex].name} stays.\n`;
        // Disable hit and stay buttons for this player
        document.getElementById(`hit-${playerIndex}`).disabled = true;
        document.getElementById(`stay-${playerIndex}`).disabled = true;

        // Check if all players have stayed
        if (players.every(player => document.getElementById(`stay-${playerIndex}`).disabled)) {
            dealerPlay();
        }
    }

    // Restart button functionality
    restartButton.addEventListener('click', () => {
        location.reload();
    });

    // Start Game Function
    function startGame() {
        gameLogDiv.textContent += 'Game started. Dealer is shuffling and dealing cards...\n';
        // Create and shuffle deck
        createDeck();
        shuffleDeck();
        // Shuffle and deal cards
        shuffleAndDeal();
    }

    // Shuffle and deal cards
    function shuffleAndDeal() {
        // Shuffle and deal logic here
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

    // Create deck function
    function createDeck() {
        deck = [];
        const suits = ['♣', '♦', '♥', '♠'];
        const values = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
        suits.forEach(suit => {
            values.forEach(value => {
                deck.push({ value, suit });
            });
        });
    }

    // Shuffle deck function
    function shuffleDeck() {
        for (let i = deck.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [deck[i
