// Random Joke Generator using Multiple APIs

class JokeGenerator {
    constructor() {
        this.currentJoke = null;
        this.favorites = this.loadFavorites();
        this.apis = [
            {
                name: 'JokeAPI',
                url: 'https://v2.jokeapi.dev/joke/Any?safe-mode'
            },
            {
                name: 'UselessFacts',
                url: 'https://uselessfacts.jsph.pl/random.json?language=en'
            },
            {
                name: 'Official Joke API',
                url: 'https://official-joke-api.appspot.com/random_joke'
            }
        ];

        this.init();
    }

    init() {
        // Event Listeners
        document.getElementById('generateBtn').addEventListener('click', () => this.getJoke());
        document.getElementById('shareBtn').addEventListener('click', () => this.shareJoke());
        document.getElementById('favoriteBtn').addEventListener('click', () => this.addToFavorites());
        document.getElementById('clearFavBtn').addEventListener('click', () => this.clearAllFavorites());

        // Load initial joke
        this.getJoke();
        this.updateFavoritesList();
    }

    async getJoke() {
        this.showLoading();
        this.hideError();

        try {
            // Randomly select an API
            const api = this.apis[Math.floor(Math.random() * this.apis.length)];
            const response = await fetch(api.url);

            if (!response.ok) throw new Error('Failed to fetch joke');

            const data = await response.json();
            this.currentJoke = this.formatJoke(data, api.name);
            this.displayJoke();
        } catch (error) {
            console.error('Error fetching joke:', error);
            this.showError('Failed to load joke. Please try again!');
            // Fallback to local jokes
            this.currentJoke = this.getLocalJoke();
            this.displayJoke();
        } finally {
            this.hideLoading();
        }
    }

    formatJoke(data, apiName) {
        let joke = {};

        switch (apiName) {
            case 'JokeAPI':
                if (data.type === 'twopart') {
                    joke.text = `${data.setup}\n\n${data.delivery}`;
                    joke.type = 'Two-Part Joke';
                } else {
                    joke.text = data.joke;
                    joke.type = 'Single Joke';
                }
                break;

            case 'UselessFacts':
                joke.text = data.text;
                joke.type = 'Fun Fact';
                break;

            case 'Official Joke API':
                joke.text = `${data.setup}\n\n${data.punchline}`;
                joke.type = 'Official Joke';
                break;

            default:
                joke.text = 'Could not format joke';
                joke.type = 'Unknown';
        }

        return joke;
    }

    getLocalJoke() {
        const jokes = [
            {
                text: 'Why don\'t scientists trust atoms?\n\nBecause they make up everything!',
                type: 'Classic Joke'
            },
            {
                text: 'Why did the scarecrow win an award?\n\nBecause he was outstanding in his field!',
                type: 'Pun'
            },
            {
                text: 'What do you call a bear with no teeth?\n\nA gummy bear!',
                type: 'Dad Joke'
            },
            {
                text: 'Why don\'t eggs tell jokes?\n\nThey\'d crack each other up!',
                type: 'Funny'
            },
            {
                text: 'What did the ocean say to the beach?\n\nNothing, it just waved!',
                type: 'Beach Joke'
            },
            {
                text: 'Why don\'t skeletons fight each other?\n\nThey don\'t have the guts!',
                type: 'Spooky Joke'
            },
            {
                text: 'How do you organize a space party?\n\nYou planet!',
                type: 'Space Joke'
            },
            {
                text: 'Why did the coffee file a police report?\n\nIt got mugged!',
                type: 'Coffee Joke'
            }
        ];

        return jokes[Math.floor(Math.random() * jokes.length)];
    }

    displayJoke() {
        const jokeText = document.getElementById('jokeText');
        const jokeType = document.getElementById('jokeType');

        jokeText.textContent = this.currentJoke.text;
        jokeType.textContent = `Type: ${this.currentJoke.type}`;

        // Add animation
        jokeText.style.animation = 'none';
        setTimeout(() => {
            jokeText.style.animation = 'fadeIn 0.5s ease-in';
        }, 10);
    }

    shareJoke() {
        if (!this.currentJoke) return;

        const text = `😂 ${this.currentJoke.text}\n\nCheck out this joke from GWM Joke Generator!`;

        if (navigator.share) {
            navigator.share({
                title: 'Funny Joke',
                text: text
            }).catch(err => console.log('Share failed:', err));
        } else {
            // Fallback: Copy to clipboard
            navigator.clipboard.writeText(text).then(() => {
                alert('Joke copied to clipboard!');
            }).catch(err => {
                console.error('Failed to copy:', err);
            });
        }
    }

    addToFavorites() {
        if (!this.currentJoke) return;

        const favorite = {
            id: Date.now(),
            text: this.currentJoke.text,
            type: this.currentJoke.type
        };

        this.favorites.push(favorite);
        this.saveFavorites();
        this.updateFavoritesList();

        // Visual feedback
        document.getElementById('favoriteBtn').textContent = '❤️ Added!';
        setTimeout(() => {
            document.getElementById('favoriteBtn').textContent = '❤️ Favorite';
        }, 2000);
    }

    removeFavorite(id) {
        this.favorites = this.favorites.filter(fav => fav.id !== id);
        this.saveFavorites();
        this.updateFavoritesList();
    }

    clearAllFavorites() {
        if (confirm('Are you sure you want to clear all favorites?')) {
            this.favorites = [];
            this.saveFavorites();
            this.updateFavoritesList();
        }
    }

    updateFavoritesList() {
        const list = document.getElementById('favoritesList');
        const clearBtn = document.getElementById('clearFavBtn');

        if (this.favorites.length === 0) {
            list.innerHTML = '<p class="no-favorites">No favorites yet!</p>';
            clearBtn.classList.add('hidden');
            return;
        }

        clearBtn.classList.remove('hidden');
        list.innerHTML = this.favorites.map(fav => `
            <div class="favorite-item">
                <div>
                    <strong>${fav.type}:</strong> ${fav.text.substring(0, 50)}...
                </div>
                <button onclick="window.jokeGen.removeFavorite(${fav.id})">Remove</button>
            </div>
        `).join('');
    }

    saveFavorites() {
        localStorage.setItem('jokesFavorites', JSON.stringify(this.favorites));
    }

    loadFavorites() {
        const saved = localStorage.getItem('jokesFavorites');
        return saved ? JSON.parse(saved) : [];
    }

    showLoading() {
        document.getElementById('loading').classList.remove('hidden');
    }

    hideLoading() {
        document.getElementById('loading').classList.add('hidden');
    }

    showError(message) {
        const errorDiv = document.getElementById('error');
        document.getElementById('errorText').textContent = message;
        errorDiv.classList.remove('hidden');
    }

    hideError() {
        document.getElementById('error').classList.add('hidden');
    }
}

// Initialize when page loads
let jokeGen;
document.addEventListener('DOMContentLoaded', () => {
    jokeGen = new JokeGenerator();
});
