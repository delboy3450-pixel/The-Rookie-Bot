const {
  Client,
  GatewayIntentBits,
  SlashCommandBuilder,
  Routes,
  REST,
  EmbedBuilder,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  ButtonBuilder,
  ButtonStyle,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ChannelType,
  PermissionsBitField,
} = require("discord.js");

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers],
});

const TOKEN = process.env.DISCORD_TOKEN;
const CLIENT_ID = process.env.CLIENT_ID;

const STAFF_ROLE_ID = "1476733750543909047";
const TICKET_CATEGORY_ID = "1476753645864357990";

// ================= RULE TEXT =================

const DISCORD_RULES = `
### 📜 Discord Rules

✅ **Be Respectful**  
No harassment, discrimination, or hate speech.

✅ **No Toxic Behaviour**  
No threats, baiting, or trolling.

✅ **Appropriate Content Only**  
No NSFW, illegal, or extremist content.

✅ **No Spam or Advertising**  
Without staff permission.

✅ **Follow Staff Instructions**  
Staff decisions are final.

✅ **Use Correct Channels**  
Post where content belongs.

✅ **No Exploits or Abuse**  
Do not abuse bugs or permissions.

✅ **English Only**  
Public channels must remain English.
`;

const RP_RULES = `
### 🚓 Roleplay Rules

✅ **Realistic UK Roleplay**  
UK-based realistic scenarios only.

✅ **No RDM / VDM**  
Violence requires roleplay reasoning.

✅ **Value Your Life**  
Fear RP is mandatory.

✅ **No Fail RP**  
Unrealistic behaviour is prohibited.

✅ **New Life Rule**  
Events before death are forgotten.

✅ **Emergency Services Conduct**  
Follow UK procedures.

✅ **No Metagaming**  
OOC info may not be used IC.

✅ **Staff Authority**  
Staff may intervene anytime.
`;

// ================= RULES PANEL =================

function buildRulesPanel(type = "discord") {
  const embed = new EmbedBuilder()
    .setColor(0x2b2d31)
    .setTitle("Boroughs of London Roleplay")
    .setImage("https://images.unsplash.com/photo-1505761671935-60b3a7427bad?q=80&w=1200&auto=format&fit=crop")
    .setDescription(type === "discord" ? DISCORD_RULES : RP_RULES)
    .setFooter({ text: "Boroughs of London RP • Official Rules" });

  const menu = new StringSelectMenuBuilder()
    .setCustomId("rules_select")
    .setPlaceholder("Select rules category")
    .addOptions(
      { label: "Discord Rules", value: "discord", emoji: "📜" },
      { label: "Roleplay Rules", value: "rp", emoji: "🚓" }
    );

  return {
    embeds: [embed],
    components: [new ActionRowBuilder().addComponents(menu)],
  };
}

// ================= COMMANDS =================

const commands = [
  new SlashCommandBuilder()
    .setName("panel")
    .setDescription("Send the rules panel")
    .addChannelOption(o =>
      o.setName("channel")
        .setDescription("Channel to send the panel")
        .addChannelTypes(ChannelType.GuildText)
        .setRequired(true)
    ),

  new SlashCommandBuilder()
    .setName("ticketpanel")
    .setDescription("Send the ticket panel")
    .addChannelOption(o =>
      o.setName("channel")
        .setDescription("Channel to send the ticket panel")
        .addChannelTypes(ChannelType.GuildText)
        .setRequired(true)
    ),

  new SlashCommandBuilder()
    .setName("staffreview")
    .setDescription("Leave a staff review"),
].map(c => c.toJSON());

const rest = new REST({ version: "10" }).setToken(TOKEN);
(async () => {
  await rest.put(Routes.applicationCommands(CLIENT_ID), { body: commands });
})();

// ================= INTERACTIONS =================

client.on("interactionCreate", async interaction => {

  // /panel
  if (interaction.isChatInputCommand() && interaction.commandName === "panel") {
    await interaction.options.getChannel("channel").send(buildRulesPanel());
    return interaction.reply({ content: "✅ Rules panel sent.", ephemeral: true });
  }

  // /ticketpanel
  if (interaction.isChatInputCommand() && interaction.commandName === "ticketpanel") {
    const embed = new EmbedBuilder()
      .setColor(0x2b2d31)
      .setTitle("🎫 Support Tickets")
      .setDescription("Click below to open a support ticket.");

    const button = new ButtonBuilder()
      .setCustomId("open_ticket")
      .setLabel("Open Ticket")
      .setStyle(ButtonStyle.Primary);

    await interaction.options.getChannel("channel").send({
      embeds: [embed],
      components: [new ActionRowBuilder().addComponents(button)],
    });

    return interaction.reply({ content: "✅ Ticket panel sent.", ephemeral: true });
  }

  // RULE DROPDOWN
  if (interaction.isStringSelectMenu() && interaction.customId === "rules_select") {
    return interaction.update(buildRulesPanel(interaction.values[0]));
  }

  // OPEN TICKET
  if (interaction.isButton() && interaction.customId === "open_ticket") {
    const channel = await interaction.guild.channels.create({
      name: `ticket-${interaction.user.username}`,
      type: ChannelType.GuildText,
      parent: TICKET_CATEGORY_ID || null,
      permissionOverwrites: [
        { id: interaction.guild.id, deny: [PermissionsBitField.Flags.ViewChannel] },
        { id: interaction.user.id, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages] },
        { id: STAFF_ROLE_ID, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages] },
      ],
    });

    const buttons = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId("claim").setLabel("Claim").setStyle(ButtonStyle.Success),
      new ButtonBuilder().setCustomId("lock").setLabel("Lock").setStyle(ButtonStyle.Secondary),
      new ButtonBuilder().setCustomId("close").setLabel("Close").setStyle(ButtonStyle.Danger),
    );

    await channel.send({ content: "🎫 Ticket opened.", components: [buttons] });
    return interaction.reply({ content: `Ticket created: ${channel}`, ephemeral: true });
  }

  // CLAIM
  if (interaction.isButton() && interaction.customId === "claim") {
    if (!interaction.member.roles.cache.has(STAFF_ROLE_ID)) {
      return interaction.reply({ content: "❌ Only staff can claim tickets.", ephemeral: true });
    }

    await interaction.channel.permissionOverwrites.edit(STAFF_ROLE_ID, { SendMessages: false });
    await interaction.channel.permissionOverwrites.edit(interaction.user.id, { SendMessages: true });

    return interaction.reply(`🟢 Ticket claimed by ${interaction.user}`);
  }

  // LOCK
  if (interaction.isButton() && interaction.customId === "lock") {
    await interaction.channel.permissionOverwrites.edit(STAFF_ROLE_ID, { SendMessages: false });
    return interaction.reply("🔒 Ticket locked.");
  }

  // CLOSE
  if (interaction.isButton() && interaction.customId === "close") {
    const embed = new EmbedBuilder()
      .setColor(0x2b2d31)
      .setDescription("✅ Ticket closed.\n\nIf this staff member was helpful, feel free to leave a review using `/staffreview`.");

    await interaction.channel.send({ embeds: [embed] });
    setTimeout(() => interaction.channel.delete(), 5000);
  }

  // STAFF REVIEW
  if (interaction.isChatInputCommand() && interaction.commandName === "staffreview") {
    const modal = new ModalBuilder()
      .setCustomId("staff_review")
      .setTitle("Staff Review");

    modal.addComponents(
      new ActionRowBuilder().addComponents(
        new TextInputBuilder()
          .setCustomId("staff")
          .setLabel("Staff Member (@mention)")
          .setStyle(TextInputStyle.Short)
      ),
      new ActionRowBuilder().addComponents(
        new TextInputBuilder()
          .setCustomId("review")
          .setLabel("Your Review")
          .setStyle(TextInputStyle.Paragraph)
      )
    );

    return interaction.showModal(modal);
  }

  if (interaction.isModalSubmit() && interaction.customId === "staff_review") {
    const embed = new EmbedBuilder()
      .setColor(0x2b2d31)
      .setTitle("⭐ Staff Review")
      .addFields(
        { name: "Reviewer", value: `${interaction.user}`, inline: true },
        { name: "Staff Member", value: interaction.fields.getTextInputValue("staff"), inline: true },
        { name: "Review", value: interaction.fields.getTextInputValue("review") }
      )
      .setThumbnail(interaction.user.displayAvatarURL());

    return interaction.reply({ embeds: [embed] });
  }
});

client.login(TOKEN);





