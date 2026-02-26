const {
  Client,
  GatewayIntentBits,
  SlashCommandBuilder,
  EmbedBuilder,
  REST,
  Routes,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
} = require('discord.js');

const TOKEN = process.env.DISCORD_TOKEN;
const CLIENT_ID = process.env.CLIENT_ID;

// 🔴 CHANGE THIS
const VERIFIED_ROLE_ID = '1476417048518070324';

// ⏱️ Mute length for "I don't agree" (in milliseconds)
const DENY_TIMEOUT_MS = 10 * 60 * 1000; // 10 minutes

if (!TOKEN || !CLIENT_ID) {
  console.error('❌ Missing DISCORD_TOKEN or CLIENT_ID env variables');
  process.exit(1);
}

const client = new Client({
  intents: [GatewayIntentBits.Guilds],
});

/* ───────── SLASH COMMANDS ───────── */

const commands = [
  new SlashCommandBuilder()
    .setName('rules')
    .setDescription('View the server rules'),

  new SlashCommandBuilder()
    .setName('staffreview')
    .setDescription('Submit a staff review')
    .addUserOption(option =>
      option
        .setName('staff')
        .setDescription('Staff member you are reviewing')
        .setRequired(true)
    ),
].map(cmd => cmd.toJSON());

const rest = new REST({ version: '10' }).setToken(TOKEN);

(async () => {
  try {
    await rest.put(Routes.applicationCommands(CLIENT_ID), { body: commands });
    console.log('✅ Slash commands registered');
  } catch (err) {
    console.error('❌ Slash command registration failed:', err);
  }
})();

/* ───────── INTERACTIONS ───────── */

client.on('interactionCreate', async interaction => {
  /* ── /rules ── */
  if (interaction.isChatInputCommand() && interaction.commandName === 'rules') {
    const rulesEmbed = new EmbedBuilder()
      .setTitle('📜 Server Rules')
      .setDescription(
        '**By playing in this server, you agree to follow all rules below.**\n\n' +
        'Failure to comply may result in moderation action.'
      )
      .addFields(
        {
          name: '🚓 Roleplay Rules',
          value:
            '• No RDM / VDM\n' +
            '• Realistic RP only\n' +
            '• FearRP is mandatory\n' +
            '• Follow ER:LC & server guidelines',
        },
        {
          name: '👮 Conduct Rules',
          value:
            '• Respect all members\n' +
            '• Follow staff instructions\n' +
            '• No trolling, exploiting, or fail RP',
        }
      )
      .setImage(
        'https://i.pinimg.com/originals/73/0b/8e/730b8eb30cb038e5ff87b1072b9ad2c8.jpg'
      )
      .setColor(0x2f3136)
      .setFooter({ text: 'Choose an option below to continue.' })
      .setTimestamp();

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('agree_rules')
        .setLabel('✅ I Agree')
        .setStyle(ButtonStyle.Success),

      new ButtonBuilder()
        .setCustomId('deny_rules')
        .setLabel('❌ I Don’t Agree')
        .setStyle(ButtonStyle.Danger)
    );

    return interaction.reply({
      embeds: [rulesEmbed],
      components: [row],
    });
  }

  /* ── Agree Button ── */
  if (interaction.isButton() && interaction.customId === 'agree_rules') {
    const role = interaction.guild.roles.cache.get(VERIFIED_ROLE_ID);
    if (!role) {
      return interaction.reply({
        content: '❌ Verified role not found. Contact staff.',
        ephemeral: true,
      });
    }

    await interaction.member.roles.add(role);

    return interaction.reply({
      content: '✅ You have agreed to the rules and now have access.',
      ephemeral: true,
    });
  }

  /* ── Deny Button (Auto Mute) ── */
  if (interaction.isButton() && interaction.customId === 'deny_rules') {
    try {
      await interaction.member.timeout(
        DENY_TIMEOUT_MS,
        'Did not agree to server rules'
      );

      return interaction.reply({
        content:
          '❌ You did not agree to the rules and have been temporarily muted.',
        ephemeral: true,
      });
    } catch (err) {
      return interaction.reply({
        content:
          '❌ Unable to mute you. Please contact staff.',
        ephemeral: true,
      });
    }
  }

  /* ── /staffreview ── */
  if (interaction.isChatInputCommand() && interaction.commandName === 'staffreview') {
    const staff = interaction.options.getUser('staff');

    const modal = new ModalBuilder()
      .setCustomId(`staffreview_${staff.id}`)
      .setTitle('Staff Review');

    modal.addComponents(
      new ActionRowBuilder().addComponents(
        new TextInputBuilder()
          .setCustomId('experience')
          .setLabel('Describe your experience (mentions allowed)')
          .setStyle(TextInputStyle.Paragraph)
          .setRequired(true)
      ),
      new ActionRowBuilder().addComponents(
        new TextInputBuilder()
          .setCustomId('positives')
          .setLabel('What did they do well?')
          .setStyle(TextInputStyle.Paragraph)
          .setRequired(true)
      ),
      new ActionRowBuilder().addComponents(
        new TextInputBuilder()
          .setCustomId('improvements')
          .setLabel('What could be improved?')
          .setStyle(TextInputStyle.Paragraph)
          .setRequired(false)
      )
    );

    return interaction.showModal(modal);
  }

  /* ── Staff Review Modal Submit ── */
  if (interaction.isModalSubmit() && interaction.customId.startsWith('staffreview_')) {
    const staffId = interaction.customId.split('_')[1];
    const staff = await client.users.fetch(staffId);

    const embed = new EmbedBuilder()
      .setTitle('📝 Staff Review')
      .setThumbnail(staff.displayAvatarURL({ dynamic: true }))
      .addFields(
        { name: '👤 Staff Member', value: `<@${staff.id}>` },
        { name: '✍ Reviewer', value: `<@${interaction.user.id}>` },
        {
          name: '📖 Experience',
          value: interaction.fields.getTextInputValue('experience'),
        },
        {
          name: '✅ Positives',
          value: interaction.fields.getTextInputValue('positives'),
        },
        {
          name: '⚠ Improvements',
          value:
            interaction.fields.getTextInputValue('improvements') ||
            'None provided',
        }
      )
      .setColor(0x5865f2)
      .setTimestamp();

    await interaction.channel.send({
      embeds: [embed],
      allowedMentions: {
        parse: ['users', 'roles'],
      },
    });

    return interaction.reply({
      content: '✅ Your staff review has been posted.',
      ephemeral: true,
    });
  }
});

/* ───────── READY ───────── */

client.once('ready', () => {
  console.log(`🤖 Logged in as ${client.user.tag}`);
});

client.login(TOKEN);


