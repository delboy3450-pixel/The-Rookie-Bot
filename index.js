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

/* ───────── DATA STORES ───────── */
const modCalls = [];
const killLogs = [];

/* ───────── COMMANDS ───────── */
const commands = [
  new SlashCommandBuilder().setName('rules').setDescription('View the server rules'),

  new SlashCommandBuilder()
    .setName('staffreview')
    .setDescription('Submit a staff review')
    .addUserOption(o =>
      o.setName('staff').setDescription('Staff member').setRequired(true)
    ),

  new SlashCommandBuilder().setName('modcall').setDescription('Submit a mod call'),
  new SlashCommandBuilder().setName('killlog').setDescription('Log a kill'),
  new SlashCommandBuilder().setName('modcalls').setDescription('View active mod calls'),
  new SlashCommandBuilder().setName('killlogs').setDescription('View recent kill logs'),
].map(c => c.toJSON());

const rest = new REST({ version: '10' }).setToken(TOKEN);

(async () => {
  await rest.put(Routes.applicationCommands(CLIENT_ID), { body: commands });
  console.log('✅ Slash commands registered');
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
    const embed = new EmbedBuilder()
      .setTitle('📜 Server Rules')
      .setDescription(
        'By playing in this server and ERLC, you **agree to follow all rules below**.\n' +
        'Failure to do so may result in warnings, mutes, kicks, or bans.'
      )
      .addFields(
        {
          name: '🚓 Roleplay Rules',
          value:
            '• No RDM / VDM\n' +
            '• FearRP is mandatory\n' +
            '• Value your life at all times\n' +
            '• No fail RP or trolling\n' +
            '• No unrealistic actions',
        },
        {
          name: '🚗 Vehicle Rules',
          value:
            '• No vehicle ramming without RP reason\n' +
            '• No unrealistic driving or stunts\n' +
            '• Pull over when lawfully stopped\n' +
            '• Use appropriate vehicles',
        },
        {
          name: '🔫 Combat Rules',
          value:
            '• Must have valid RP reason to use weapons\n' +
            '• No random shootouts\n' +
            '• No spawn killing\n' +
            '• No revenge killing',
        },
        {
          name: '👮 Law Enforcement Rules',
          value:
            '• Follow proper police procedures\n' +
            '• No abuse of police tools\n' +
            '• No powergaming\n' +
            '• Roleplay investigations properly',
        },
        {
          name: '👥 Community Rules',
          value:
            '• Be respectful at all times\n' +
            '• No harassment, racism, or discrimination\n' +
            '• No exploiting or glitch abuse\n' +
            '• Follow staff instructions',
        },
        {
          name: '⚠️ Punishments',
          value:
            '• Punishments depend on severity\n' +
            '• Staff decisions are final\n' +
            '• Arguing publicly may lead to punishment',
        }
      )
      .setImage('https://i.pinimg.com/originals/73/0b/8e/730b8eb30cb038e5ff87b1072b9ad2c8.jpg')
      .setColor(0x2f3136);

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

    return interaction.reply({ embeds: [embed], components: [row] });
  }

  /* ───── RULE BUTTONS ───── */
  if (interaction.isButton() && interaction.customId === 'agree_rules') {
    const role = interaction.guild.roles.cache.get(VERIFIED_ROLE_ID);
    if (role) await interaction.member.roles.add(role);
    return interaction.reply({ content: '✅ Access granted.', ephemeral: true });
  }

  if (interaction.isButton() && interaction.customId === 'deny_rules') {
    await interaction.member.timeout(DENY_TIMEOUT_MS, 'Did not agree to rules');
    return interaction.reply({ content: '❌ You have been muted.', ephemeral: true });
  }

  /* ───── /STAFFREVIEW ───── */
  if (interaction.isChatInputCommand() && interaction.commandName === 'staffreview') {
    const staff = interaction.options.getUser('staff');

    const modal = new ModalBuilder()
      .setCustomId(`staffreview_${staff.id}`)
      .setTitle('Staff Review');

    const reviewInput = new TextInputBuilder()
      .setCustomId('review')
      .setLabel('Detailed Review (you may @ people)')
      .setStyle(TextInputStyle.Paragraph)
      .setRequired(true);

    modal.addComponents(new ActionRowBuilder().addComponents(reviewInput));
    return interaction.showModal(modal);
  }

  if (interaction.isModalSubmit() && interaction.customId.startsWith('staffreview_')) {
    const staffId = interaction.customId.split('_')[1];
    const review = interaction.fields.getTextInputValue('review');
    const staff = await interaction.client.users.fetch(staffId);

    const embed = new EmbedBuilder()
      .setTitle('📝 Staff Review')
      .setThumbnail(staff.displayAvatarURL())
      .addFields(
        { name: 'Staff Member', value: staff.toString() },
        { name: 'Reviewer', value: interaction.user.toString() },
        { name: 'Review', value: review }
      )
      .setColor(0x5865f2)
      .setTimestamp();

    await logChannel.send({ embeds: [embed] });
    return interaction.reply({ content: '✅ Review submitted.', ephemeral: true });
  }

  /* ───── /MODCALL ───── */
  if (interaction.isChatInputCommand() && interaction.commandName === 'modcall') {
    const modal = new ModalBuilder()
      .setCustomId('modcall_modal')
      .setTitle('🚨 Mod Call');

    const reason = new TextInputBuilder()
      .setCustomId('reason')
      .setLabel('Reason (you may @ people)')
      .setStyle(TextInputStyle.Paragraph)
      .setRequired(true);

    modal.addComponents(new ActionRowBuilder().addComponents(reason));
    return interaction.showModal(modal);
  }

  if (interaction.isModalSubmit() && interaction.customId === 'modcall_modal') {
    const reason = interaction.fields.getTextInputValue('reason');

    modCalls.push({ user: interaction.user, reason });

    const embed = new EmbedBuilder()
      .setTitle('🚨 MOD CALL')
      .setThumbnail(interaction.user.displayAvatarURL())
      .addFields(
        { name: 'Caller', value: interaction.user.toString() },
        { name: 'Reason', value: reason }
      )
      .setColor(0xff0000)
      .setTimestamp();

    await logChannel.send({
      content: `<@&${STAFF_ROLE_ID}>`,
      embeds: [embed],
    });

    return interaction.reply({ content: '✅ Mod call sent.', ephemeral: true });
  }

  /* ───── /KILLLOG ───── */
  if (interaction.isChatInputCommand() && interaction.commandName === 'killlog') {
    const modal = new ModalBuilder()
      .setCustomId('killlog_modal')
      .setTitle('💀 Kill Log');

    modal.addComponents(
      new ActionRowBuilder().addComponents(
        new TextInputBuilder().setCustomId('killer').setLabel('Killer').setStyle(TextInputStyle.Short).setRequired(true)
      ),
      new ActionRowBuilder().addComponents(
        new TextInputBuilder().setCustomId('victim').setLabel('Victim').setStyle(TextInputStyle.Short).setRequired(true)
      ),
      new ActionRowBuilder().addComponents(
        new TextInputBuilder().setCustomId('weapon').setLabel('Weapon').setStyle(TextInputStyle.Short).setRequired(true)
      )
    );

    return interaction.showModal(modal);
  }

  if (interaction.isModalSubmit() && interaction.customId === 'killlog_modal') {
    const killer = interaction.fields.getTextInputValue('killer');
    const victim = interaction.fields.getTextInputValue('victim');
    const weapon = interaction.fields.getTextInputValue('weapon');

    killLogs.unshift({ killer, victim, weapon });
    if (killLogs.length > 10) killLogs.pop();

    const embed = new EmbedBuilder()
      .setTitle('💀 KILL LOG')
      .addFields(
        { name: 'Killer', value: killer, inline: true },
        { name: 'Victim', value: victim, inline: true },
        { name: 'Weapon', value: weapon }
      )
      .setColor(0x2f3136)
      .setTimestamp();

    await logChannel.send({ embeds: [embed] });
    return interaction.reply({ content: '✅ Kill logged.', ephemeral: true });
  }

  /* ───── /MODCALLS ───── */
  if (interaction.isChatInputCommand() && interaction.commandName === 'modcalls') {
    const embed = new EmbedBuilder()
      .setTitle('🚨 Active Mod Calls')
      .setColor(0xff0000)
      .setDescription(
        modCalls.length
          ? modCalls.map((c, i) => `**${i + 1}. ${c.user.tag}**\n${c.reason}`).join('\n\n')
          : 'No active mod calls.'
      );

    return interaction.reply({ embeds: [embed], ephemeral: true });
  }

  /* ───── /KILLLOGS ───── */
  if (interaction.isChatInputCommand() && interaction.commandName === 'killlogs') {
    const embed = new EmbedBuilder()
      .setTitle('💀 Recent Kill Logs')
      .setColor(0x2f3136)
      .setDescription(
        killLogs.length
          ? killLogs.map(k => `**${k.killer} → ${k.victim}**\nWeapon: ${k.weapon}`).join('\n\n')
          : 'No kill logs.'
      );

    return interaction.reply({ embeds: [embed], ephemeral: true });
  }
});

client.login(TOKEN);



