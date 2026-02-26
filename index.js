const {
  Client,
  GatewayIntentBits,
  SlashCommandBuilder,
  REST,
  Routes,
  EmbedBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require('discord.js');

const TOKEN = process.env.DISCORD_TOKEN;
const CLIENT_ID = process.env.CLIENT_ID;

const LOG_CHANNEL_ID = '1476418506055749843';
const STAFF_ROLE_ID = '1476414879626956931';
const VERIFIED_ROLE_ID = '1476417048518070324';

const DENY_TIMEOUT_MS = 10 * 60 * 1000;

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
  ],
});

/* ───────── DATA ───────── */
const modCalls = [];
const killLogs = [];

/* ───────── COMMAND REGISTRATION ───────── */
const commands = [
  new SlashCommandBuilder().setName('rules').setDescription('View the server rules'),
  new SlashCommandBuilder()
    .setName('staffreview')
    .setDescription('Submit a staff review')
    .addUserOption(o =>
      o.setName('staff').setDescription('Staff member').setRequired(true)
    ),
  new SlashCommandBuilder().setName('modcall').setDescription('Create a mod call'),
  new SlashCommandBuilder().setName('killlog').setDescription('Log a kill'),
  new SlashCommandBuilder().setName('modcalls').setDescription('View active mod calls'),
  new SlashCommandBuilder().setName('killlogs').setDescription('View recent kill logs'),
].map(c => c.toJSON());

const rest = new REST({ version: '10' }).setToken(TOKEN);

(async () => {
  await rest.put(Routes.applicationCommands(CLIENT_ID), { body: commands });
  console.log('✅ Commands registered');
})();

/* ───────── READY ───────── */
client.once('ready', () => {
  console.log(`🤖 Logged in as ${client.user.tag}`);
});

/* ───────── INTERACTIONS ───────── */
client.on('interactionCreate', async interaction => {
  const logChannel = interaction.guild.channels.cache.get(LOG_CHANNEL_ID);

  /* ───── /RULES ───── */
  if (interaction.isChatInputCommand() && interaction.commandName === 'rules') {
    await interaction.deferReply();

    const embed = new EmbedBuilder()
      .setTitle('📜 Server Rules')
      .setDescription('By playing here, you agree to all rules below.')
      .addFields(
        { name: '🚓 Roleplay', value: '• No RDM / VDM\n• FearRP required\n• Value life\n• No fail RP' },
        { name: '🚗 Vehicles', value: '• No ramming\n• Realistic driving\n• Pull over when stopped' },
        { name: '🔫 Combat', value: '• Valid RP reason only\n• No spawn killing\n• No revenge killing' },
        { name: '👮 Law Enforcement', value: '• Proper procedures\n• No abuse\n• No powergaming' },
        { name: '👥 Community', value: '• Be respectful\n• No discrimination\n• Follow staff instructions' }
      )
      .setImage('https://i.pinimg.com/originals/73/0b/8e/730b8eb30cb038e5ff87b1072b9ad2c8.jpg')
      .setColor(0x2f3136);

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId('agree_rules').setLabel('✅ I Agree').setStyle(ButtonStyle.Success),
      new ButtonBuilder().setCustomId('deny_rules').setLabel('❌ I Don’t Agree').setStyle(ButtonStyle.Danger)
    );

    return interaction.editReply({ embeds: [embed], components: [row] });
  }

  /* ───── RULE BUTTONS ───── */
  if (interaction.isButton() && interaction.customId === 'agree_rules') {
    await interaction.deferReply({ ephemeral: true });
    const role = interaction.guild.roles.cache.get(VERIFIED_ROLE_ID);
    if (role) await interaction.member.roles.add(role);
    return interaction.editReply({ content: '✅ Access granted.' });
  }

  if (interaction.isButton() && interaction.customId === 'deny_rules') {
    await interaction.deferReply({ ephemeral: true });
    await interaction.member.timeout(DENY_TIMEOUT_MS, 'Did not agree to rules');
    return interaction.editReply({ content: '❌ You have been muted.' });
  }

  /* ───── /STAFFREVIEW ───── */
  if (interaction.isChatInputCommand() && interaction.commandName === 'staffreview') {
    const staff = interaction.options.getUser('staff');

    const modal = new ModalBuilder()
      .setCustomId(`staffreview_${staff.id}`)
      .setTitle('Staff Review');

    const input = new TextInputBuilder()
      .setCustomId('review')
      .setLabel('Detailed Review (you may @ people)')
      .setStyle(TextInputStyle.Paragraph)
      .setRequired(true);

    modal.addComponents(new ActionRowBuilder().addComponents(input));
    return interaction.showModal(modal);
  }

  if (interaction.isModalSubmit() && interaction.customId.startsWith('staffreview_')) {
    await interaction.deferReply({ ephemeral: true });

    const staffId = interaction.customId.split('_')[1];
    const review = interaction.fields.getTextInputValue('review');
    const staff = await client.users.fetch(staffId);

    const embed = new EmbedBuilder()
      .setTitle('📝 Staff Review')
      .setThumbnail(staff.displayAvatarURL())
      .addFields(
        { name: 'Staff', value: staff.toString() },
        { name: 'Reviewer', value: interaction.user.toString() },
        { name: 'Review', value: review }
      )
      .setColor(0x5865f2)
      .setTimestamp();

    await logChannel.send({ embeds: [embed] });
    return interaction.editReply({ content: '✅ Review submitted.' });
  }

  
  }
});

client.login(TOKEN);





