const { EmbedBuilder } = require('discord.js');
const { getLanguagePreference } = require('../database');

// Mapeamento de códigos de condições climáticas para emojis
const weatherIcons = {
  '01d': '🌞',
  '01n': '🌙',
  '02d': '⛅',
  '02n': '⛅',
  '03d': '🌥️',
  '03n': '🌥️',
  '04d': '☁️',
  '04n': '☁️',
  '09d': '🌧️',
  '09n': '🌧️',
  '10d': '🌧️',
  '10n': '🌧️',
  '11d': '⛈️',
  '11n': '⛈️',
  '13d': '🌨️',
  '13n': '🌨️',
  '50d': '🌫️',
  '50n': '🌫️',
};

async function execute(message, args, __, translate) {
  if (!args.length) {
    return message.reply(await translate('clima', 'no args'));
  }

  const apiKey = process.env.OPENWEATHERMAP_API_KEY;
  const city = args.join(' ');

  const guildId = message.guild.id;
  const language = await getLanguagePreference(guildId);
  const langCode = language === 'english' ? 'en' : 'pt';

  const currentWeatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${apiKey}&units=metric&lang=${langCode}`;
  const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(city)}&appid=${apiKey}&units=metric&lang=${langCode}`;

  try {
    // Obter dados do clima atual
    const currentWeatherResponse = await fetch(currentWeatherUrl);
    const currentWeatherData = await currentWeatherResponse.json();

    if (currentWeatherData.cod !== 200) {
      return message.reply(await translate('clima', 'error 200', city));
    }

    // Obter dados da previsão
    const forecastResponse = await fetch(forecastUrl);
    const forecastData = await forecastResponse.json();

    if (forecastData.cod !== "200") {
      return message.reply(await translate('clima', 'error not 200', city));
    }

    // Processar dados do clima atual
    const weatherIconCode = currentWeatherData.weather[0].icon;
    const weatherIcon = weatherIcons[weatherIconCode] || '❓';
    const cityName = currentWeatherData.name;
    const country = currentWeatherData.sys.country;
    const temperature = currentWeatherData.main.temp;
    const feelsLike = currentWeatherData.main.feels_like;
    const windSpeed = currentWeatherData.wind.speed;
    const humidity = currentWeatherData.main.humidity;

    // Processar dados da previsão (24 horas)
    let tempMin = Infinity;
    let tempMax = -Infinity;
    const now = new Date();
    const oneDayLater = new Date(now);
    oneDayLater.setDate(oneDayLater.getDate() + 1);

    for (const forecast of forecastData.list) {
      const forecastDate = new Date(forecast.dt * 1000);
      if (forecastDate >= now && forecastDate < oneDayLater) {
        tempMin = Math.min(tempMin, forecast.main.temp_min);
        tempMax = Math.max(tempMax, forecast.main.temp_max);
      }
    }

    // Construir a mensagem do Embed
    const weatherInfo = new EmbedBuilder()
      .setTitle(await translate('clima', 'setTitle', cityName, country))
      .setDescription(`Condições climáticas atuais em ${cityName}, ${country}`)
      .setThumbnail(`https://openweathermap.org/img/wn/${weatherIconCode}.png`)
      .addFields(
        { name: 'Condição', value: `${weatherIcon} ${currentWeatherData.weather[0].description}`, inline: true },
        { name: 'Temperatura', value: `${temperature} °C`, inline: true },
        { name: 'Sensação Térmica', value: `${feelsLike} °C`, inline: true },
        { name: 'Velocidade do Vento', value: `${windSpeed} m/s`, inline: true },
        { name: 'Umidade', value: `${humidity}%`, inline: true },
        { name: 'Mín / Máx (24 horas)', value: `${tempMin} °C / ${tempMax} °C`, inline: true },
      )
      .setFooter({ text: 'Dados fornecidos por OpenWeatherMap' });

    message.channel.send({ embeds: [weatherInfo] });
    console.log(`${new Date().toLocaleString('pt-BR')} | ${cityName}: ${temperature} °C e ${currentWeatherData.weather[0].description}. (${message.author.username})`)
  } catch (error) {
    console.error(`Erro ao obter o clima:`, error);
    message.reply('Ocorreu um erro ao tentar obter o clima.');
  }
}

module.exports = { execute };
