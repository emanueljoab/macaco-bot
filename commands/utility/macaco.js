const { SlashCommandBuilder, EmbedBuilder, AttachmentBuilder } = require('discord.js');
const path = require('node:path');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('macaco')
		.setDescription('Retorna um macaco aleatório!'),
	async execute(interaction) {
		const imagensMacacos = {
			'Orangotango': './images/foto-orangotango.jpg',
			'Chimpanzé': './images/foto-chimpanze.jpg',
			'Gorila': './images/foto-gorila.jpg',
			'Babuíno': './images/foto-babuino.jpg',
			'Macaco-aranha': './images/foto-macacoaranha.png',
			'Macaco-prego': './images/foto-macacoprego.jpg',
			'Macaco-narigudo': './images/foto-macaconarigudo.jpeg',
			'Macaco-negro': './images/foto-macaconegro.jpg',
			'Mico-leão-dourado': './images/foto-micoleaodourado.jpg',
			'Macaco-da-noite': './images/foto-macacodanoite.jpg',
			'Bugio': './images/foto-bugio.jpg',
			'Mandril': './images/foto-mandril.jpg',
			'Macaco-preto-de-nariz-arrebitado': './images/foto-macacopretodenarizarrebitado.jpg',
			'Gibão': './images/foto-gibao.jpg',
			'Macaco-japonês': './images/foto-macacojapones.jpg',
			'Langur-de-ouro': './images/foto-langurdeouro.jpg',
			'Sagui': './images/foto-sagui.jpg',
			'Bonobo': './images/foto-bonobo.jpg',
			'Cairara-de-fronte-branca': './images/foto-cairaradefrontebranca.jpeg',
			'Macaco-lesula': './images/foto-macacolesula.jpg',
			'Gibão-cristado-de-Hainan': 'https://upload.wikimedia.org/wikipedia/commons/2/26/Nomascus_nasutus_hainanus.jpg',
			'Macaco-prego-dourado': 'https://upload.wikimedia.org/wikipedia/commons/6/6d/S._flavius_SP_Zoo_3.jpg',
			'Simpona': 'https://upload.wikimedia.org/wikipedia/commons/4/4f/Silky_Sifaka_Pink_Face_Closeup.JPG',
			'Macaco-birmanês-de-nariz-empinado': 'https://upload.wikimedia.org/wikipedia/commons/e/e3/Drawing_of_Rhinopithecus_strykeri.jpg',
			'Mico-leão-de-cara-preta': 'https://upload.wikimedia.org/wikipedia/commons/6/6f/Leontopithecus_caissara.jpg',
			'Gorila-do-oriente': 'https://upload.wikimedia.org/wikipedia/commons/0/02/I%27m_sooooo_tired.jpg',
			'Muriqui-do-norte': 'https://upload.wikimedia.org/wikipedia/commons/2/2f/Northern_Muriqui_9.jpg',
			'Mico-leão-preto': 'https://upload.wikimedia.org/wikipedia/commons/b/be/Mico_leao_preto_SP_Zoo.jpg',
			'Kipunji': 'https://upload.wikimedia.org/wikipedia/commons/c/c0/Kipunji_walking_h.jpg',
			'Muriqui-do-sul': 'https://upload.wikimedia.org/wikipedia/commons/c/cc/Brachyteles_arachnoides.jpg',
			'Gibão-de-topete': 'https://upload.wikimedia.org/wikipedia/commons/1/13/White_Cheeked_Gibbon_Male.jpg',
			'Lóris-delgado-vermelho': 'https://upload.wikimedia.org/wikipedia/commons/1/1e/Loris_tardigradus_tardigradus_002.jpg',
			'Colobo-vermelho-de-zanzibar': 'https://upload.wikimedia.org/wikipedia/commons/e/e4/Red_Colobus_7.jpg',
			'Lêmure-do-alaotra': 'https://upload.wikimedia.org/wikipedia/commons/e/e3/Hapalemur_alaotrensis_JJLM.JPG',
			'Gibão-prateado': 'https://upload.wikimedia.org/wikipedia/commons/6/60/Silbergibbon_mit_Nachwuchs.jpg',
			'Langur-de-ouro': 'https://upload.wikimedia.org/wikipedia/commons/2/22/Golden_Langur.jpg',
			'Lêmure-delicado-dourado': 'https://upload.wikimedia.org/wikipedia/commons/9/9f/Hapalemur_aureus_001.jpg',
			'Sagui-de-cabeça-branca': 'https://upload.wikimedia.org/wikipedia/commons/8/89/Saguinus_oedipus_%28Linnaeus%2C_1758%29.jpg',
			'Mico-leão-de-cara-dourada': 'https://upload.wikimedia.org/wikipedia/commons/4/44/Goldkopfloewenaeffchen1.jpg',
			'Orangotango-de-sumatra': 'https://upload.wikimedia.org/wikipedia/commons/0/08/Who_you_lookin%27_at%3F.jpg',
			'Macaco-de-gibraltar': 'https://upload.wikimedia.org/wikipedia/commons/4/40/Portrait_of_a_father.jpg',
			'Langur-de-nilgiri': 'https://upload.wikimedia.org/wikipedia/commons/c/c2/Nilgiri_Langur.JPG',
			'Orangotango-de-bornéu': 'https://upload.wikimedia.org/wikipedia/commons/d/d3/OrangutanP1.jpg',
			'Gorila-do-ocidente': 'https://upload.wikimedia.org/wikipedia/commons/c/c0/Western_Lowland_Gorilla_at_Bronx_Zoo_2_cropped.jpg',
			'Chimpanzé-comum': 'https://upload.wikimedia.org/wikipedia/commons/f/fc/Gombe_Stream_NP_Jungtier_fressend.jpg',
			'Gelada': 'https://upload.wikimedia.org/wikipedia/commons/1/13/Gelada-Pavian.jpg',
			'Gibão-de-müller-de-bornéu': 'https://upload.wikimedia.org/wikipedia/commons/a/a0/MuellersGibbon.jpg',
			'Mico-ladrão-safado': './images/foto-micoladraosafado.jpg'
		};

		const macacoAleatorio = Object.keys(imagensMacacos)[Math.floor(Math.random() * Object.keys(imagensMacacos).length)];
		const imageUrl = imagensMacacos[macacoAleatorio];

		const now = new Date();
		const day = String(now.getDate()).padStart(2, '0');
		const month = String(now.getMonth() + 1).padStart(2, '0'); // Mês é zero-indexado, então adicionamos 1
		const year = now.getFullYear();
		const hours = String(now.getHours()).padStart(2, '0');
		const minutes = String(now.getMinutes()).padStart(2, '0');

		const timeZoneOffset = now.getTimezoneOffset() / 60; // Converte minutos para horas
		const timeZone = `(GMT${timeZoneOffset > 0 ? '-' : '+'}${Math.abs(timeZoneOffset)})`;

		const formattedDate = `${day}/${month}/${year} ${hours}:${minutes} ${timeZone}`;
		
		console.log(`${formattedDate} :: ${macacoAleatorio} (${interaction.user.username})`);

		const file = imageUrl.startsWith('http')
			? null
			: new AttachmentBuilder(path.join(__dirname, '../../', imageUrl));

		const embed = new EmbedBuilder()
			.setTitle(`${macacoAleatorio}`)
			.setColor(0x0099FF)
			.setImage(imageUrl.startsWith('http') ? imageUrl : `attachment://${path.basename(imageUrl)}`);

		await interaction.editReply({
			embeds: [embed],
			files: file ? [file] : [],
		});
	},
};
