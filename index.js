const { Client, LocalAuth } = require("whatsapp-web.js");
const figlet = require("figlet")
const qrcode = require('qrcode-terminal');

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
    const res = await fetch("https://v2.jokeapi.dev/joke/Any?blacklistFlags=nsfw,sexist")
    const data = await res.json()
    return data
}

client.on('message_create', async message => {
    if (message.body.startsWith('!ascii')) {
        const textParameter = message.body.slice(7).trim();
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
        if (joke.type == "twopart") {
            client.sendMessage(message.from, joke.setup);
            setTimeout(async () => {
                client.sendMessage(message.from, joke.delivery);
            }, 3000);
        } else {
            client.sendMessage(message.from, joke.joke);

        }

    }
});
client.on('qr', qr => {
    qrcode.generate(qr, { small: true });
});
// Start your client
client.initialize();
