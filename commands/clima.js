const { EmbedBuilder } = require("discord.js");
const { getLanguagePreference } = require("../database");
const { log, error } = require("../utils");

let fetch;
async function loadFetch() {
    if (!fetch) {
        fetch = (await import("node-fetch")).default;
    }
}

// Mapeamento de códigos de condições climáticas para emojis
const weatherIcons = {
    "01d": "🌞",
    "01n": "🌙",
    "02d": "⛅",
    "02n": "⛅",
    "03d": "🌥️",
    "03n": "🌥️",
    "04d": "☁️",
    "04n": "☁️",
    "09d": "🌧️",
    "09n": "🌧️",
    "10d": "🌧️",
    "10n": "🌧️",
    "11d": "⛈️",
    "11n": "⛈️",
    "13d": "🌨️",
    "13n": "🌨️",
    "50d": "🌫️",
    "50n": "🌫️",
};

async function replyEmbed(message, text) {
    const embed = new EmbedBuilder().setDescription(text);
    return message.reply({ embeds: [embed] });
}

async function execute(message, args, _db, translate) {
    await loadFetch();

    if (!args.length) {
        log(message, `Usuário não forneceu o nome da cidade`);
        return replyEmbed(message, await translate("clima", "no args"));
    }

    const apiKey = process.env.OPENWEATHERMAP_API_KEY;
    const city = args.join(" ");

    const guildId = message.guild.id;
    const language = await getLanguagePreference(guildId);
    const langCode = language === "english" ? "en" : "pt";

    const currentWeatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${apiKey}&units=metric&lang=${langCode}`;
    const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(city)}&appid=${apiKey}&units=metric&lang=${langCode}`;

    try {
        // Obter dados do clima atual
        const currentWeatherResponse = await fetch(currentWeatherUrl);
        const currentWeatherData = await currentWeatherResponse.json();

        if (String(currentWeatherData.cod) !== "200") {
            error(message, `Erro ao obter dados do clima para "${city}": ${currentWeatherData.message}`);
            return replyEmbed(message, await translate("clima", "error 200", city));
        }

        // Obter dados da previsão
        const forecastResponse = await fetch(forecastUrl);
        const forecastData = await forecastResponse.json();

        if (String(forecastData.cod) !== "200") {
            error(message, `Erro ao obter dados da previsão para "${city}": ${forecastData.message}`);
            return replyEmbed(message, await translate("clima", "error not 200", city));
        }

        // Processar dados do clima atual
        const weatherIconCode = currentWeatherData.weather[0].icon;
        const weatherIcon = weatherIcons[weatherIconCode] || "❓";
        const cityName = currentWeatherData.name;
        const country = currentWeatherData.sys.country;
        const temperature = currentWeatherData.main.temp;
        const feelsLike = currentWeatherData.main.feels_like;
        const windSpeed = currentWeatherData.wind.speed; // Valor bruto em m/s
        const windKmhRaw = windSpeed * 3.6; // Conversão para km/h
        const windKmh = Math.trunc(windKmhRaw); // Remover casas decimais
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
            .setTitle(await translate("clima", "setTitle", cityName, country))
            .setDescription(await translate("clima", "setDescription", cityName, country))
            .setThumbnail(`https://openweathermap.org/img/wn/${weatherIconCode}.png`)
            .addFields(
                { name: await translate("clima", "condition"), value: `${weatherIcon} ${currentWeatherData.weather[0].description}`, inline: true },
                { name: await translate("clima", "temperature"), value: `${Math.trunc(temperature)} °C`, inline: true },
                { name: await translate("clima", "feels like"), value: `${Math.trunc(feelsLike)} °C`, inline: true },
                { name: await translate("clima", "wind speed"), value: `${windKmh} km/h`, inline: true },
                { name: await translate("clima", "humidity"), value: `${humidity}%`, inline: true },
                { name: await translate("clima", "minmax"), value: `${Math.trunc(tempMin)} °C / ${Math.trunc(tempMax)} °C`, inline: true }
            )
            .setFooter({ text: await translate("clima", "setFooter") });
        message.reply({ embeds: [weatherInfo] });
        log(message, `Informações de clima para "${cityName}, ${country}" obtidas`);
    } catch (err) {
        error(message, `Erro ao obter clima: ${err.message}`);
        replyEmbed(message, await translate("clima", "message reply error"));
    }
}

module.exports = { execute };