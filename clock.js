// World Digital Clock
class WorldClock {
    constructor() {
        this.use24Hour = true;
        this.showSeconds = true;
        this.timeZones = {
            johannesburg: 'Africa/Johannesburg',
            london: 'Europe/London',
            paris: 'Europe/Paris',
            dubai: 'Asia/Dubai',
            tokyo: 'Asia/Tokyo',
            hongkong: 'Asia/Hong_Kong',
            newyork: 'America/New_York',
            losangeles: 'America/Los_Angeles',
            saopaulo: 'America/Sao_Paulo',
            sydney: 'Australia/Sydney',
            auckland: 'Pacific/Auckland',
            local: null // Local time
        };
        
        this.init();
    }

    init() {
        // Setup event listeners
        document.getElementById('toggle-24h').addEventListener('click', () => {
            this.use24Hour = !this.use24Hour;
            this.updateAllClocks();
            document.getElementById('toggle-24h').textContent = 
                this.use24Hour ? 'Switch to 12-hour Format' : 'Switch to 24-hour Format';
        });

        document.getElementById('toggle-seconds').addEventListener('click', () => {
            this.showSeconds = !this.showSeconds;
            this.updateAllClocks();
            document.getElementById('toggle-seconds').textContent = 
                this.showSeconds ? 'Hide Seconds' : 'Show Seconds';
        });

        // Update clock every second
        this.updateAllClocks();
        setInterval(() => this.updateAllClocks(), 1000);
    }

    formatTime(date) {
        let hours = date.getHours();
        let minutes = date.getMinutes();
        let seconds = date.getSeconds();

        // Handle 12-hour format
        let meridiem = '';
        if (!this.use24Hour) {
            meridiem = hours >= 12 ? ' PM' : ' AM';
            hours = hours % 12;
            hours = hours ? hours : 12;
        }

        // Pad with zeros
        hours = String(hours).padStart(2, '0');
        minutes = String(minutes).padStart(2, '0');
        seconds = String(seconds).padStart(2, '0');

        if (this.showSeconds) {
            return `${hours}:${minutes}:${seconds}${meridiem}`;
        } else {
            return `${hours}:${minutes}${meridiem}`;
        }
    }

    formatDate(date) {
        const options = { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' };
        return date.toLocaleDateString('en-US', options);
    }

    getTimeInZone(timezone) {
        if (!timezone) {
            // Local time
            return new Date();
        }

        // Create formatter for the specific timezone
        const date = new Date();
        const utcDate = new Date(date.toLocaleString('en-US', { timeZone: 'UTC' }));
        const tzDate = new Date(date.toLocaleString('en-US', { timeZone: timezone }));
        const offset = tzDate - utcDate;
        
        const result = new Date(date.getTime() + offset);
        return result;
    }

    updateAllClocks() {
        for (const [key, timezone] of Object.entries(this.timeZones)) {
            const time = this.getTimeInZone(timezone);
            const formattedTime = this.formatTime(time);
            const formattedDate = this.formatDate(time);

            const clockElement = document.getElementById(key);
            const dateElement = document.getElementById(`${key}-date`);

            if (clockElement) {
                clockElement.textContent = formattedTime;
            }
            if (dateElement) {
                dateElement.textContent = formattedDate;
            }
        }

        // Update local timezone info
        const localTzElement = document.getElementById('your-timezone');
        if (localTzElement) {
            const offset = new Date().getTimezoneOffset();
            const sign = offset <= 0 ? '+' : '-';
            const absOffset = Math.abs(offset);
            const hours = Math.floor(absOffset / 60);
            const minutes = absOffset % 60;
            const tzString = `UTC${sign}${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
            localTzElement.textContent = tzString;
        }
    }
}

// Initialize the world clock when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new WorldClock();
});
