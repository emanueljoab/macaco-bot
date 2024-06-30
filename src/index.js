const { EmbedBuilder } = require('discord.js');

async function execute(message, args) {
    if (!args.length) {
        return message.reply('Você precisa fornecer o nome de uma cidade!');
    }

    const apiKey = process.env.OPENWEATHERMAP_API_KEY;
    const city = args.join(' ');
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${apiKey}&units=metric&lang=pt`;

    try {
        const fetch = await import('node-fetch').then(mod => mod.default);
        const response = await fetch(url);
        const data = await response.json();

        // Verificação do código de status
        if (data.cod !== 200) {
            return message.reply(`Não consegui obter o clima para a cidade: ${city}`);
        }

        const weather = data.weather[0].description;
        const temperature = data.main.temp;
        const feelsLike = data.main.feels_like;
        const humidity = data.main.humidity;
        const windSpeed = data.wind.speed;
        const country = data.sys.country; // Obtém o código do país da resposta da API

        const weatherInfo = new EmbedBuilder()
            .setColor('#0099ff')
            .setTitle(`Clima em ${data.name}, ${country}`) // Inclui o nome da cidade e o país
            .setDescription(`Aqui estão as condições climáticas atuais para ${data.name}, ${country}`) // Inclui o nome da cidade e o país
            .addFields(
                { name: 'Condição', value: weather, inline: true },
                { name: 'Temperatura', value: `${temperature}°C`, inline: true },
                { name: 'Sensação térmica', value: `${feelsLike}°C`, inline: true },
                { name: 'Umidade', value: `${humidity}%`, inline: true },
                { name: 'Velocidade do vento', value: `${windSpeed} m/s`, inline: true }
            )
            .setTimestamp()
            .setFooter({ text: 'Dados fornecidos por OpenWeatherMap' });

        message.channel.send({ embeds: [weatherInfo] });
    } catch (error) {
        console.error(`Erro ao obter o clima:`, error);
        message.reply('Ocorreu um erro ao tentar obter o clima.');
    }
}

module.exports = { execute };

