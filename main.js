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
    const cardData = [
        { value: 'A', suit: 'hearts', image: 'downloads/Aceblackheart.jpeg' },
        { value: '2', suit: 'hearts', image: 'downloads/2heartsblack' },
        { value: '3', suit: 'hearts', image: 'downloads/3heartsblack' },
    { value: '4', suit: 'hearts', image: 'downloads/4heartsblack' },
    { value: '5', suit: 'hearts', image: 'downloads/5heartsblack' },
    { value: '6', suit: 'hearts', image: 'downloads/6heartsblack' },
    { value: '7', suit: 'hearts', image: 'downloads/7heartsblack' },
    { value: '8', suit: 'hearts', image: 'downloads/8heartsblack' },
    { value: '9', suit: 'hearts', image: 'downloads/9heartsblack' },
    { value: '10', suit: 'hearts', image: 'downloads/10heartsblack' },
    ];
    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]]; // Swap elements
        }
        return array;
    }
    function dealCards(deck) {
        shuffleArray(deck);
    
        // Deal 2 cards to each player and 2 to the dealer
        const player1Hand = [deck.pop(), deck.pop()];
        const player2Hand = [deck.pop(), deck.pop()];
        const dealerHand = [deck.pop(), deck.pop()];
    
        return {
            player1Hand,
            player2Hand,
            dealerHand
        };
    } 
    function createCardElement(card, faceDown = false) {
        const cardElement = document.createElement('div');
        cardElement.classList.add('card');
        if (faceDown) {
            cardElement.classList.add('face-down');
            cardElement.style.backgroundImage = 'url(images/face-down.jpg)'; // Path to face-down card image
        } else {
            cardElement.style.backgroundImage = `url(${card.image})`;
        }
        return cardElement;
    }
    
    function renderHand(hand, containerId, faceDownIndices = []) {
        const container = document.getElementById(containerId);
        container.innerHTML = ''; // Clear existing cards
    
        hand.forEach((card, index) => {
            const faceDown = faceDownIndices.includes(index);
            const cardElement = createCardElement(card, faceDown);
            container.appendChild(cardElement);
        });
    }
    document.addEventListener('DOMContentLoaded', () => {
        const deck = [
            { value: 'A', suit: 'hearts', image: 'images/ace-of-hearts.jpg' },
            { value: '2', suit: 'hearts', image: 'images/2-of-hearts.jpg' },
            { value: '3', suit: 'hearts', image: 'images/3-of-hearts.jpg' },
            // Add more cards
        ];
    
        const { player1Hand, player2Hand, dealerHand } = dealCards(deck);
    
        // Render hands
        renderHand(player1Hand, 'player1-hand');
        renderHand(player2Hand, 'player2-hand');
        renderHand(dealerHand, 'dealer-hand', [1]); // Only the second card of the dealer's hand is face down
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