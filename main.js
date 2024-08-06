// Initialize variables
let deck = [];
let players = [];
let dealer = { hand: [], total: 0 };
let numPlayers = 1;
let currentPlayerIndex = 0;
let balance = 20000;

// Initialize deck
function getNewShuffledDeck() {
    const suits = ['hearts', 'diamonds', 'clubs', 'spades'];
    const values = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
    let deck = [];
    for (let suit of suits) {
        for (let value of values) {
            deck.push({ suit, value });
        }
    }
    return deck.sort(() => Math.random() - 0.5);
}



// Get the hand total
function getHandTotal(hand) {
    let total = 0;
    let aces = 0;
    for (let card of hand) {
        if (card.value === 'J' || card.value === 'Q' || card.value === 'K') {
            total += 10;
        } else if (card.value === 'A') {
            total += 11;
            aces += 1;
        } else {
            total += parseInt(card.value);
        }
    }
    while (total > 21 && aces > 0) {
        total -= 10;
        aces -= 1;
    }
    return total;
}

// Initialize the game
function initGame() {
    balance = 20000;
    document.getElementById('balance').innerText = `Balance: $${balance}`;
    document.getElementById('player-names').style.display = 'none';
    document.getElementById('betting-controls').style.display = 'none';
    document.getElementById('player-controls').style.display = 'none';
    document.getElementById('deck-container').innerHTML = '';
    document.getElementById('dealer-cards').innerHTML = '';
    document.getElementById('players-container').innerHTML = '';
    document.getElementById('status').innerText = '';
}

// Start the game by setting up players
function startGame() {
    numPlayers = parseInt(document.getElementById('num-players').value);
    players = [];
    for (let i = 0; i < numPlayers; i++) {
        players.push({ name: '', hand: [], total: 0, bet: 0 });
    }
    renderPlayerNameInputs();
}

// Render player name inputs
function renderPlayerNameInputs() {
    let playerNameInputs = document.getElementById('player-name-inputs');
    playerNameInputs.innerHTML = '';
    for (let i = 0; i < numPlayers; i++) {
        let input = document.createElement('input');
        input.type = 'text';
        input.placeholder = `Player ${i + 1} Name`;
        input.id = `player-name-${i}`;
        playerNameInputs.appendChild(input);
    }
    document.getElementById('player-names').style.display = 'block';
}

// Submit player names
function submitNames() {
    for (let i = 0; i < numPlayers; i++) {
        players[i].name = document.getElementById(`player-name-${i}`).value || `Player ${i + 1}`;
    }
    document.getElementById('player-names').style.display = 'none';
    document.getElementById('betting-controls').style.display = 'block';
}

// Place bet for current player
function placeBet() {
    let betAmount = parseInt(document.getElementById('bet-amount').value);
    if (betAmount > balance) {
        alert('Not enough balance to place this bet.');
        return;
    }
    players[currentPlayerIndex].bet = betAmount;
    balance -= betAmount;
    currentPlayerIndex++;
    if (currentPlayerIndex < numPlayers) {
        document.getElementById('status').innerText = `${players[currentPlayerIndex].name}, place your bet.`;
    } else {
        document.getElementById('betting-controls').style.display = 'none';
        document.getElementById('player-controls').style.display = 'block';
        dealInitialCards();
    }
}
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]]; // Swap elements
    }
}

document.addEventListener('DOMContentLoaded', () => {
    shuffleArray(cardData); // Shuffle card data

    const cardContainer = document.getElementById('card-container');

    function createCardElement(card) {
        const cardElement = document.createElement('div');
        cardElement.classList.add('card');
        cardElement.dataset.value = card.value;
        cardElement.dataset.suit = card.suit;
        cardElement.style.backgroundImage = `url(${downloads/backcardblue})`;

        cardElement.addEventListener('click', () => {
            cardElement.classList.toggle('flipped');
        });

        return cardElement;
    }

    cardData.forEach(card => {
        const cardElement = createCardElement(card);
        cardContainer.appendChild(cardElement);
    });
});
document.addEventListener('DOMContentLoaded', () => {
    const cardContainer = document.getElementById('card-container');

    // Function to create a card element
    function createCardElement(card) {
        const cardElement = document.createElement('div');
        cardElement.classList.add('card');
        cardElement.dataset.value = card.value;
        cardElement.dataset.suit = card.suit;
        cardElement.style.backgroundImage = `url(${card.image})`;

        return cardElement;
    }

    // Loop through card data and append to container
    cardData.forEach(card => {
        const cardElement = createCardElement(card);
        cardContainer.appendChild(cardElement);
    });
});
// Deal initial cards
function dealInitialCards() {
    deck = getNewShuffledDeck();
    dealer.hand = [deck.pop(), deck.pop()];
    dealer.total = getHandTotal(dealer.hand);
    for (let player of players) {
        player.hand = [deck.pop(), deck.pop()];
        player.total = getHandTotal(player.hand);
    }
    render();
    checkInitialBlackjack();
}



// Check for initial blackjack
function checkInitialBlackjack() {
    for (let player of players) {
        if (player.total === 21) {
            balance += player.bet * 2.5;
            player.bet = 0;
            document.getElementById('status').innerText = `${player.name} hit Blackjack! Wins 2.5x the bet.`;
        }
    }
    if (dealer.total === 21) {
        for (let player of players) {
            if (player.bet > 0) {
                player.bet = 0;
                document.getElementById('status').innerText = `${player.name} loses to dealer's Blackjack.`;
            }
        }
    }
}

// Handle hit button
function hit() {
    let player = players[currentPlayerIndex];
    player.hand.push(deck.pop());
    player.total = getHandTotal(player.hand);
    if (player.total > 21) {
        player.bet = 0;
        document.getElementById('status').innerText = `${player.name} busts. Loses the bet.`;
        nextPlayer();
    } else if (player.total === 21) {
        balance += player.bet * 2;
        player.bet = 0;
        document.getElementById('status').innerText = `${player.name} hits 21! Wins 2x the bet.`;
        nextPlayer();
    } else {
        render();
    }
}

// Handle stand button
function stand() {
    nextPlayer();
}

// Move to next player or dealer
function nextPlayer() {
    currentPlayerIndex++;
    if (currentPlayerIndex >= numPlayers) {
        currentPlayerIndex = 0;
        dealerTurn();
    } else {
        document.getElementById('status').innerText = `${players[currentPlayerIndex].name}'s turn.`;
        render();
    }
}

// Dealer's turn
function dealerTurn() {
    while (dealer.total < 17) {
        dealer.hand.push(deck.pop());
        dealer.total = getHandTotal(dealer.hand);
    }
    checkWinner();
}

// Check the winner
function checkWinner() {
    for (let player of players) {
        if (dealer.total > 21) {
            balance += player.bet * 2;
            document.getElementById('status').innerText = `${player.name} wins against dealer bust.`;
        } else if (player.total > dealer.total) {
            balance += player.bet * 2;
            document.getElementById('status').innerText = `${player.name} wins with higher total.`;
        } else if (player.total < dealer.total) {
            document.getElementById('status').innerText = `${player.name} loses with lower total.`;
        } else {
            balance += player.bet;
            document.getElementById('status').innerText = `${player.name} pushes with the dealer.`;
        }
        player.bet = 0;
    }
    render();
}

// Reset the game
function resetGame() {
    balance = 20000;
    initGame();
}

// Render the game state
function render() {
    document.getElementById('balance').innerText = `Balance: $${balance}`;
    let dealerCardsHTML = '';
    for (let card of dealer.hand) {
        dealerCardsHTML += `<div class="card">${card.value} of ${card.suit}</div>`;
    }
    document.getElementById('dealer-cards').innerHTML = dealerCardsHTML;

    let playersHTML = '';
    for (let player of players) {
        let playerCardsHTML = '';
        for (let card of player.hand) {
            playerCardsHTML += `<div class="card">${card.value} of ${card.suit}</div>`;
        }
        playersHTML += `<div class="player-area">
                            <h3>${player.name}</h3>
                            <div class="card-container">${playerCardsHTML}</div>
                            <div>Total: ${player.total}</div>
                        </div>`;
    }
    document.getElementById('players-container').innerHTML = playersHTML;
}

// Event listeners
document.getElementById('start-game').addEventListener('click', startGame);
document.getElementById('submit-names').addEventListener('click', submitNames);
document.getElementById('place-bet').addEventListener('click', placeBet);
document.getElementById('hit-button').addEventListener('click', hit);
document.getElementById('stand-button').addEventListener('click', stand);
document.getElementById('reset-button').addEventListener('click', resetGame);

// Initialize the game on load
initGame();