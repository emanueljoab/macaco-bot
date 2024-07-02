const { EmbedBuilder } = require('discord.js');

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

async function execute(message, args) {
  if (!args.length) {
    return message.reply('Você precisa fornecer o nome de uma cidade!');
  }

  const apiKey = process.env.OPENWEATHERMAP_API_KEY;
  const city = args.join(' ');
  const url = `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(city)}&appid=${apiKey}&units=metric&lang=pt`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (data.cod !== "200") {
      return message.reply(`Não consegui obter o clima para a cidade: ${city}`);
    }

    let tempMin = Infinity;
    let tempMax = -Infinity;
    let currentTemp = null;
    let feelsLike = null;
    let windSpeed = null;
    let humidity = null; // Para armazenar a umidade
    const now = new Date();
    const oneDayLater = new Date(now);
    oneDayLater.setDate(oneDayLater.getDate() + 1);

    for (const forecast of data.list) {
      const forecastDate = new Date(forecast.dt * 1000);
      if (forecastDate >= now && forecastDate < oneDayLater) {
        tempMin = Math.min(tempMin, forecast.main.temp_min);
        tempMax = Math.max(tempMax, forecast.main.temp_max);

        if (!currentTemp || Math.abs(forecastDate - now) < Math.abs(new Date(currentTemp.dt * 1000) - now)) {
          currentTemp = forecast;
          feelsLike = forecast.main.feels_like;
          windSpeed = forecast.wind.speed;
          humidity = forecast.main.humidity; // Obter a umidade da previsão atual
        }
      }
    }

    const weatherIconCode = currentTemp.weather[0].icon;
    const weatherIcon = weatherIcons[weatherIconCode] || '❓';
    const cityName = data.city.name;
    const country = data.city.country;

    const weatherInfo = new EmbedBuilder()
      .setTitle(`Clima de ${cityName}, ${country}`)
      .setDescription(`Condições climáticas para ${cityName}, ${country}`)
      .setThumbnail(`https://openweathermap.org/img/wn/${weatherIconCode}.png`)
      .addFields(
        { name: 'Condição', value: `${weatherIcon} ${currentTemp.weather[0].description}`, inline: true },
        { name: 'Temperatura', value: `${currentTemp.main.temp} °C`, inline: true },
        { name: 'Sensação Térmica', value: `${feelsLike} °C`, inline: true },
        { name: 'Mín / Máx', value: `${tempMin} °C / ${tempMax} °C`, inline: true },
        { name: 'Umidade', value: `${humidity}%`, inline: true },        
        { name: 'Velocidade do Vento', value: `${windSpeed} m/s`, inline: true },
      )
      .setFooter({ text: 'Dados fornecidos por OpenWeatherMap' });

    message.channel.send({ embeds: [weatherInfo] });
    console.log(`${new Date().toLocaleString('pt-BR')} | ${cityName}: ${tempMin} °C / ${tempMax} °C (${message.author.username})`)
  } catch (error) {
    console.error(`Erro ao obter o clima:`, error);
    message.reply('Ocorreu um erro ao tentar obter o clima.');
  }
}

module.exports = { execute };
