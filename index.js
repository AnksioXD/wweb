const { Client, LocalAuth } = require("whatsapp-web.js");
const figlet = require("figlet")
const qrcode = require('qrcode-terminal');
const express = require('express');

// Create Express app
const app = express();

// Define a simple route
app.get('/', (req, res) => {
    res.send('Discord Bot Server');
});

// Start the server
const PORT = 8080;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

// Create a new client instance
const client = new Client({
    authStrategy: new LocalAuth({
        dataPath: './datadir'
    })
});

// When the client is ready, run this code (only once)
client.on('ready', () => {
    console.log('Client is ready!');
});

async function fetchJoke() {
    const res = await fetch("https://hindi-jokes-api.onrender.com/jokes?api_key=45d6b0ae6aaffc748d23b009f7c6")
    const data = await res.json()
    return data
}

async function fetchWeather(city) {
    try {
        const res = await fetch(`http://wttr.in/${city}?format=j1`);
        const data = await res.json();
        return data;
    } catch (error) {
        client.sendMessage(message.from, `Error fetching weather: ${error}`);
        return null;
    }
}

client.on('message_create', async message => {
    if (message.body.startsWith('!ascii')) {
        const textParameter = message.body.split(' ')[1];
        figlet(textParameter, function (err, data) {
            if (err) {
                console.log("Something went wrong...");
                console.dir(err);
                return;
            }
            client.sendMessage(message.from, `\`\`\`${data}\`\`\``);
        });
    }

    if (message.body.startsWith('!joke')) {
        const joke = await fetchJoke()
        client.sendMessage(message.from, joke.jokeContent);
    }
    if (message.body.startsWith('!weather')) {
        const city = message.body.split(' ')[1];

        // Call the function to fetch weather for the specified city
        const weatherData = await fetchWeather(city);

        if (weatherData) {
            const currentCondition = weatherData.current_condition[0];
            const temperature = currentCondition.temp_C;
            const weatherDesc = currentCondition.weatherDesc[0].value;
            const humidity = currentCondition.humidity;
            const windSpeed = currentCondition.windspeedKmph;

            // Format the message to be sent
            const weatherMessage = `*Weather for ${city}:*\n\n` +
                `🌡️ Temperature: ${temperature}°C\n` +
                `🌥️ Condition: ${weatherDesc}\n` +
                `💧 Humidity: ${humidity}%\n` +
                `💨 Wind Speed: ${windSpeed} km/h\n`;

            // Send the formatted weather message
            client.sendMessage(message.from, weatherMessage);
        } else {
            client.sendMessage(message.from, 'Sorry, I could not fetch the weather data. Please try again.');
        }
    }
});


client.on('qr', qr => {
    qrcode.generate(qr, { small: true });
});
// Start your client
client.initialize();
