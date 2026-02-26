const {
  Client,
  GatewayIntentBits,
  SlashCommandBuilder,
  EmbedBuilder,
  REST,
  Routes,
} = require('discord.js');

// ─────────────────────────────
// ENV VARIABLES (Railway)
// ─────────────────────────────
const TOKEN = process.env.DISCORD_TOKEN;
const CLIENT_ID = process.env.CLIENT_ID;

// Safety check
if (!TOKEN || !CLIENT_ID) {
  console.error('❌ Missing DISCORD_TOKEN or CLIENT_ID env variables');
  process.exit(1);
}

// ─────────────────────────────
// CLIENT
// ─────────────────────────────
const client = new Client({
  intents: [GatewayIntentBits.Guilds],
});

// ─────────────────────────────
// SLASH COMMANDS
// ─────────────────────────────
const commands = [
  new SlashCommandBuilder()
    .setName('rules')
    .setDescription('View the server rules'),
].map(cmd => cmd.toJSON());

// Register slash commands
const rest = new REST({ version: '10' }).setToken(TOKEN);

(async () => {
  try {
    await rest.put(
      Routes.applicationCommands(CLIENT_ID),
      { body: commands }
    );
    console.log('✅ Slash commands registered');
  } catch (error) {
    console.error('❌ Failed to register commands:', error);
  }
})();

// ─────────────────────────────
// INTERACTIONS
// ─────────────────────────────
client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand()) return;

  if (interaction.commandName === 'rules') {
    const rulesEmbed = new EmbedBuilder()
      .setTitle('📜 Server Rules')
      .setDescription(
        '**Welcome to the server!**\n\n' +
        'By playing here, you agree to follow all rules listed below.'
      )
      .addFields(
        {
          name: '🚓 Roleplay Rules',
          value:
            '• No RDM / VDM\n' +
            '• Stay realistic at all times\n' +
            '• FearRP is mandatory\n' +
            '• Follow ER:LC rules',
        },
        {
          name: '👮 Conduct',
          value:
            '• Respect all members\n' +
            '• Follow staff instructions\n' +
            '• No trolling or fail RP',
        },
        {
          name: '📌 General',
          value:
            '• No harassment or discrimination\n' +
            '• No exploiting\n' +
            '• Use common sense',
        }
      )
      .setImage(
        'https://i.pinimg.com/originals/73/0b/8e/730b8eb30cb038e5ff87b1072b9ad2c8.jpg'
      )
      .setColor(0x2f3136)
      .setFooter({
        text: 'Failure to follow rules may result in punishment.',
      })
      .setTimestamp();

    await interaction.reply({ embeds: [rulesEmbed] });
  }
});

// ─────────────────────────────
// READY
// ─────────────────────────────
client.once('ready', () => {
  console.log(`🤖 Logged in as ${client.user.tag}`);
});

// ─────────────────────────────
// LOGIN
// ─────────────────────────────
client.login(TOKEN);
