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
  PermissionsBitField,
  ChannelType,
} = require('discord.js');

const TOKEN = process.env.DISCORD_TOKEN;
const CLIENT_ID = process.env.CLIENT_ID;

const STAFF_ROLE_ID = '1476733750543909047';
const VERIFIED_ROLE_ID = '1476733794215133276';

const DENY_TIMEOUT_MS = 10 * 60 * 1000;

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

/* ───────── COMMANDS ───────── */
const commands = [
  new SlashCommandBuilder().setName('rules').setDescription('View server rules'),
  new SlashCommandBuilder()
    .setName('staffreview')
    .setDescription('Submit a staff review')
    .addUserOption(o =>
      o.setName('staff').setDescription('Staff member').setRequired(true)
    ),
  new SlashCommandBuilder().setName('ticket').setDescription('Open a support ticket'),
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

/* ───────── TICKET STATE ───────── */
const ticketClaims = new Map();

/* ───────── INTERACTIONS ───────── */
client.on('interactionCreate', async interaction => {
  /* ───── /RULES ───── */
  if (interaction.isChatInputCommand() && interaction.commandName === 'rules') {
    await interaction.deferReply();

    const embed = new EmbedBuilder()
      .setTitle('📜 Boroughs of London RP – Rules')
      .setImage('https://media1.tenor.com/m/mL4Xv7bsMNAAAAAC/londonroleplay-london.gif')
      .setDescription(
        '**Serious UK Roleplay Server**\n\n' +
        'By participating, you agree to follow all rules below.\n\n' +
        '**General Roleplay Rules**\n' +
        '• No RDM / VDM\n• FearRP is mandatory\n• No Fail RP\n• No Metagaming\n• No Powergaming\n• New Life Rule applies\n\n' +
        '**Emergency Services**\n' +
        '• Follow realistic UK procedures\n• No abuse of powers\n• Corruption RP is staff-approved only\n\n' +
        '**Vehicles & Traffic**\n' +
        '• Realistic UK driving\n• No unrealistic speeds or stunts\n• Pull over when lawfully stopped\n\n' +
        '**Firearms & Violence**\n' +
        '• Rare and realistic\n• Escalation required\n• No revenge killing\n\n' +
        '**Community Conduct**\n' +
        '• Be respectful\n• No harassment or discrimination\n• Follow staff instructions\n\n' +
        '**Punishments**\n' +
        '• Scale with severity\n• Staff decisions are final'
      )
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

    modal.addComponents(
      new ActionRowBuilder().addComponents(
        new TextInputBuilder()
          .setCustomId('review')
          .setLabel('Detailed review (you may @ people)')
          .setStyle(TextInputStyle.Paragraph)
          .setRequired(true)
      )
    );

    return interaction.showModal(modal);
  }

  if (interaction.isModalSubmit() && interaction.customId.startsWith('staffreview_')) {
    await interaction.deferReply();

    const staffId = interaction.customId.split('_')[1];
    const review = interaction.fields.getTextInputValue('review');
    const staff = await client.users.fetch(staffId);

    const embed = new EmbedBuilder()
      .setTitle('📝 Staff Review')
      .setThumbnail(staff.displayAvatarURL())
      .addFields(
        { name: 'Staff Member', value: staff.toString() },
        { name: 'Reviewer', value: interaction.user.toString() },
        { name: 'Review', value: review }
      )
      .setTimestamp()
      .setColor(0x5865f2);

    await interaction.channel.send({ embeds: [embed] });
    return interaction.editReply({ content: '✅ Review submitted.' });
  }

  /* ───── /TICKET ───── */
  if (interaction.isChatInputCommand() && interaction.commandName === 'ticket') {
    await interaction.deferReply({ ephemeral: true });

    const channel = await interaction.guild.channels.create({
      name: `ticket-${interaction.user.username}`,
      type: ChannelType.GuildText,
      permissionOverwrites: [
        { id: interaction.guild.id, deny: [PermissionsBitField.Flags.ViewChannel] },
        { id: interaction.user.id, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages] },
        { id: STAFF_ROLE_ID, allow: [PermissionsBitField.Flags.ViewChannel] },
      ],
    });

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId('ticket_claim').setLabel('🎫 Claim').setStyle(ButtonStyle.Primary),
      new ButtonBuilder().setCustomId('ticket_lock').setLabel('🔒 Lock').setStyle(ButtonStyle.Secondary),
      new ButtonBuilder().setCustomId('ticket_close').setLabel('❌ Close').setStyle(ButtonStyle.Danger)
    );

    await channel.send({ content: 'Support ticket opened.', components: [row] });
    return interaction.editReply({ content: `🎫 Ticket created: ${channel}` });
  }

  /* ───── TICKET BUTTONS ───── */
  if (interaction.isButton() && interaction.customId.startsWith('ticket_')) {
    await interaction.deferReply({ ephemeral: true });
    const channel = interaction.channel;

    if (interaction.customId === 'ticket_claim') {
      if (ticketClaims.has(channel.id)) {
        return interaction.editReply({ content: '❌ Ticket already claimed.' });
      }
      ticketClaims.set(channel.id, interaction.user.id);
      return interaction.editReply({ content: `🎫 Ticket claimed by ${interaction.user}` });
    }

    if (interaction.customId === 'ticket_lock') {
      if (ticketClaims.get(channel.id) !== interaction.user.id) {
        return interaction.editReply({ content: '❌ Only the claiming staff member can lock this ticket.' });
      }
      await channel.permissionOverwrites.edit(STAFF_ROLE_ID, { ViewChannel: false });
      return interaction.editReply({ content: '🔒 Ticket locked.' });
    }

    if (interaction.customId === 'ticket_close') {
      const staffId = ticketClaims.get(channel.id);
      const staffMention = staffId ? `<@${staffId}>` : 'the staff team';

      const embed = new EmbedBuilder()
        .setTitle('✅ Ticket Closed')
        .setDescription(
          `This ticket has now been closed.\n\n` +
          `If you found **${staffMention}** helpful, feel free to leave a review using:\n\n` +
          '`/staffreview`'
        )
        .setColor(0x2ecc71)
        .setTimestamp();

      await channel.send({ embeds: [embed] });

      setTimeout(() => {
        channel.delete().catch(() => {});
      }, 5000);
    }
  }
});

client.login(TOKEN);





