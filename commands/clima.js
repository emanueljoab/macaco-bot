const { EmbedBuilder } = require('discord.js');

// Mapeamento de códigos de condições climáticas para emojis
const weatherIcons = {
    '01d': '🌞', // clear sky (dia)
    '01n': '🌙', // clear sky (noite)
    '02d': '⛅', // few clouds (dia)
    '02n': '⛅', // few clouds (noite)
    '03d': '🌥️', // scattered clouds (dia)
    '03n': '🌥️', // scattered clouds (noite)
    '04d': '☁️', // broken clouds (dia)
    '04n': '☁️', // broken clouds (noite)
    '09d': '🌧️', // shower rain (dia)
    '09n': '🌧️', // shower rain (noite)
    '10d': '🌧️', // rain (dia)
    '10n': '🌧️', // rain (noite)
    '11d': '⛈️', // thunderstorm (dia)
    '11n': '⛈️', // thunderstorm (noite)
    '13d': '🌨️', // snow (dia)
    '13n': '🌨️', // snow (noite)
    '50d': '🌫️', // mist (dia)
    '50n': '🌫️'  // mist (noite)
};

async function execute(message, args) {
    if (!args.length) {
        return message.reply('Você precisa fornecer o nome de uma cidade!');
    }

    const apiKey = process.env.OPENWEATHERMAP_API_KEY;
    const city = args.join(' '); // Junta todos os argumentos em uma string
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${apiKey}&units=metric&lang=pt`;

    try {
        const response = await fetch(url);
        const data = await response.json();

        // Verificação do código de status
        if (data.cod !== 200) {
            return message.reply(`Não consegui obter o clima para a cidade: ${city}`);
        }

        const weatherIconCode = data.weather[0].icon;
        const weatherIcon = weatherIcons[weatherIconCode] || '❓'; // Ícone padrão se o código não corresponder
        const temperature = data.main.temp;
        const feelsLike = data.main.feels_like;
        const tempMin = data.main.temp_min; // Temperatura mínima
        const tempMax = data.main.temp_max; // Temperatura máxima
        const humidity = data.main.humidity;
        const windSpeed = data.wind.speed;
        const cityName = data.name;
        const country = data.sys.country; // Código do país

        const weatherInfo = new EmbedBuilder()
            .setTitle(`Clima em ${cityName}, ${country}`)
            .setDescription(`Aqui estão as condições climáticas atuais para ${cityName}, ${country}`)
            .setThumbnail(`https://openweathermap.org/img/wn/${weatherIconCode}.png`)
            .addFields(
                { name: 'Condição', value: `${weatherIcon} ${data.weather[0].description}`, inline: true },
                { name: 'Temperatura', value: `${temperature} °C`, inline: true },
                { name: 'Sensação térmica', value: `${feelsLike} °C`, inline: true },
                { name: 'Mín / Máx', value: `${tempMin} °C / ${tempMax} °C`, inline: true },
                { name: 'Umidade', value: `${humidity}%`, inline: true },
                { name: 'Velocidade do vento', value: `${windSpeed} m/s`, inline: true }
            )
            .setFooter({ text: 'Dados fornecidos por OpenWeatherMap' });

        message.channel.send({ embeds: [weatherInfo] });
        console.log(`${new Date().toLocaleString('pt-BR')} | ${cityName}: ${temperature} °C e ${data.weather[0].description}. (${message.author.username})`)
    } catch (error) {
        console.error(`Erro ao obter o clima:`, error);
        message.reply('Ocorreu um erro ao tentar obter o clima.');
    }
}

module.exports = { execute };
