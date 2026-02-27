const {
  Client,
  GatewayIntentBits,
  SlashCommandBuilder,
  Routes,
  REST,
  EmbedBuilder,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  ChannelSelectMenuBuilder,
  ChannelType,
  ButtonBuilder,
  ButtonStyle,
  PermissionsBitField,
} = require("discord.js");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
  ],
});

const TOKEN = process.env.DISCORD_TOKEN;
const CLIENT_ID = process.env.CLIENT_ID;

const STAFF_ROLE_ID = "PUT_STAFF_ROLE_ID_HERE";
const TICKET_CATEGORY_ID = "PUT_CATEGORY_ID_HERE";

// ================= RULE CONTENT =================

const DISCORD_RULES = `
**1. Respect Everyone**
No harassment, hate speech, or discrimination.

**2. No Toxic Behaviour**
No threats, baiting, or excessive arguing.

**3. Appropriate Content Only**
No NSFW, illegal, or extremist content.

**4. No Spam or Advertising**
Unless permitted by staff.

**5. Follow Staff Instructions**
Staff decisions are final.

**6. Correct Channel Usage**
Use channels as intended.

**7. No Exploits**
Do not abuse bugs or loopholes.

**8. English Only**
Public channels must remain English.
`;

const RP_RULES = `
**1. Realistic UK Roleplay**
All RP must reflect a UK setting.

**2. No RDM / VDM**
All violence must be roleplay-led.

**3. Value Your Life**
Fear RP is mandatory.

**4. No Fail RP**
Unrealistic behaviour is prohibited.

**5. New Life Rule**
You forget events after death.

**6. Emergency Services**
Must follow UK procedures.

**7. No Metagaming**
OOC info cannot be used IC.

**8. Staff Authority**
Staff may intervene at any time.
`;

// ================= PANEL BUILDER =================

function buildPanel(type = "discord") {
  const embed = new EmbedBuilder()
    .setColor(0x2b2d31)
    .setTitle("Boroughs of London RP — Rules")
    .setImage("https://media1.tenor.com/m/mL4Xv7bsMNAAAAAC/londonroleplay-london.gif")
    .setFooter({ text: "Boroughs of London RP • Official Panel" });

  embed.setDescription(type === "discord" ? DISCORD_RULES : RP_RULES);

  const menu = new StringSelectMenuBuilder()
    .setCustomId("rules_select")
    .setPlaceholder("Select a rules category")
    .addOptions(
      { label: "Discord Rules", value: "discord", emoji: "📜" },
      { label: "In-Game Roleplay Rules", value: "rp", emoji: "🚓" }
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
    .setDescription("Send the onboarding rules panel")
    .addChannelOption(o =>
      o.setName("channel")
        .setDescription("Channel to send the panel")
        .addChannelTypes(ChannelType.GuildText)
        .setRequired(true)
    ),

  new SlashCommandBuilder()
    .setName("ticket")
    .setDescription("Open a support ticket"),
].map(c => c.toJSON());

const rest = new REST({ version: "10" }).setToken(TOKEN);

(async () => {
  await rest.put(Routes.applicationCommands(CLIENT_ID), { body: commands });
  console.log("Commands registered");
})();

// ================= INTERACTIONS =================

client.on("interactionCreate", async interaction => {

  // /panel
  if (interaction.isChatInputCommand() && interaction.commandName === "panel") {
    const channel = interaction.options.getChannel("channel");
    await channel.send(buildPanel());
    return interaction.reply({ content: "✅ Panel sent.", ephemeral: true });
  }

  // /ticket
  if (interaction.isChatInputCommand() && interaction.commandName === "ticket") {
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

    const embed = new EmbedBuilder()
      .setTitle("🎫 Support Ticket")
      .setDescription("A staff member will assist you shortly.")
      .setColor(0x2b2d31);

    const buttons = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId("claim").setLabel("Claim").setStyle(ButtonStyle.Success),
      new ButtonBuilder().setCustomId("lock").setLabel("Lock").setStyle(ButtonStyle.Secondary),
      new ButtonBuilder().setCustomId("close").setLabel("Close").setStyle(ButtonStyle.Danger),
    );

    await channel.send({ embeds: [embed], components: [buttons] });
    return interaction.reply({ content: `🎫 Ticket created: ${channel}`, ephemeral: true });
  }

  // RULE DROPDOWN
  if (interaction.isStringSelectMenu() && interaction.customId === "rules_select") {
    return interaction.update(buildPanel(interaction.values[0]));
  }

  // TICKET BUTTONS
  if (interaction.isButton()) {
    const channel = interaction.channel;

    if (interaction.customId === "claim") {
      await channel.permissionOverwrites.edit(interaction.user.id, { SendMessages: true });
      return interaction.reply({ content: `🟢 Ticket claimed by ${interaction.user}`, ephemeral: false });
    }

    if (interaction.customId === "lock") {
      await channel.permissionOverwrites.edit(STAFF_ROLE_ID, { SendMessages: false });
      return interaction.reply({ content: "🔒 Ticket locked.", ephemeral: false });
    }

    if (interaction.customId === "close") {
      const reviewEmbed = new EmbedBuilder()
        .setColor(0x2b2d31)
        .setDescription("✅ Ticket closed.\n\nIf you found this staff member helpful, feel free to leave a review using `/staffreview`.");

      await channel.send({ embeds: [reviewEmbed] });
      setTimeout(() => channel.delete(), 5000);
    }
  }
});

client.login(TOKEN);





