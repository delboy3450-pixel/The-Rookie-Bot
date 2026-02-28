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
const STAFF_REVIEW_CHANNEL_ID ="1476991236085907456";
// ================= RULE TEXT =================

const DISCORD_RULES = `
### 📝 Discord Rules

@everyone ✅ **Be Respectful**  
Treat all members with respect. Harassment, discrimination, hate speech, derogatory language, or targeted insults are strictly prohibited. This includes voice chats, text channels, and DMs related to the server.

✅ **No Toxic Behaviour**  
Do not engage in threats, baiting, trolling, excessive arguing, or intentionally starting drama. Keep the community positive and welcoming.

✅ **Appropriate Content Only**  
No NSFW, sexually explicit, illegal, extremist, or otherwise inappropriate content. This includes images, gifs, videos, status messages, and profile pictures.

✅ **No Spam or Advertising**  
Avoid message spamming, ping spamming, or channel flooding. Advertising any product, server, or social media requires staff approval.

✅ **Follow Staff Instructions**  
Staff decisions are final. Failure to comply with staff direction may result in moderation actions.

✅ **Use Correct Channels**  
Post content in the appropriate channels. Repeated misuse of channels may lead to warnings or restrictions.

✅ **No Exploits or Abuse**  
Do not attempt to exploit server bots, permissions, or Discord vulnerabilities. Abusing loopholes will result in penalties.

✅ **English Only**  
All public channels must remain English for moderation purposes. Private messages may be in any language, as long as they follow Discord ToS.

`;

const RP_RULES = `
### 🎭 Roleplay Rules

✅ **Value Your Life (VYL)**  
Your character must act realistically and value their life in dangerous situations. Fear RP is mandatory—running toward gunfire, charging armed individuals, or acting invincible is not allowed.

✅ **No Fail RP**  
Do not perform unrealistic actions, powergame, or force actions onto others. Examples include surviving impossible injuries, ignoring injuries, or doing things your character physically couldn’t.

✅ **New Life Rule (NLR)**  
Upon death, your character forgets all events that led to it. You may not return to the scene of death for at least 15 minutes, and you may not seek revenge for events you no longer remember.

✅ **Emergency Services Conduct**  
If playing police, EMS, or fire, you must follow professional UK-style procedures. Abuse of power, unrealistic behaviour, or ignoring proper protocol is not allowed.

✅ **No Metagaming**  
Do not use out-of-character information in-character. This includes streams, DMs, Discord chat, or anything your character wouldn’t logically know.

✅ **Staff Authority**  
Staff may intervene in RP at any time. Failure to comply may result in removal from a scene or further action.

---

### 🌆 City Roleplay Rules

✅ **Realistic New York Roleplay**  
All roleplay must be grounded in realistic New York-based settings, behaviours, and environment. No supernatural powers, unrealistic wealth, or over-the-top behaviour.

✅ **No RDM / VDM**  
• RDM — Randomly killing players without valid RP reason  
• VDM — Using a vehicle to harm players without valid RP  
Both are strictly prohibited.

✅ **Proper Initiation**  
Before engaging in violence or crime, proper RP initiation must occur. Clear actions, dialogue, and escalation must be present.

✅ **Crime Limitations**  
Major crimes (robberies, kidnappings, etc.) require proper planning, realistic execution, and enough police presence online.

---

### 🧑‍⚖️ Additional RP Rules

✅ **No Powergaming**  
You cannot force actions, outcomes, or unrealistic abilities onto other players.

✅ **No Cop Baiting**  
Do not intentionally provoke police for no RP reason.

✅ **No Revenge RP**  
Revenge must follow realistic motivations. You may not instantly hunt someone because of OOC emotions.

✅ **Respect Cooldowns**  
Large crimes have cooldowns to maintain balance and fairness.

---

### ⚠️ Final Rule

🚫 **Breaking any rules may result in kicks, warnings, timeouts, or bans at staff discretion.**
`;


// ================= RULES PANEL =================

function buildRulesPanel(type = "discord") {
  const embed = new EmbedBuilder()
    .setColor(0xfc7b03)
    .setTitle("**New York State Roleplay**")
    .setImage("https://cdn.discordapp.com/attachments/1476976362584801380/1477332609888555201/template.png?ex=69a460b5&is=69a30f35&hm=b804ff3f12aa8aa01003a11d6cd7437247ff1f06222287f9cef0fb71ea74d5de&")
    .setDescription(type === "discord" ? DISCORD_RULES : RP_RULES)
    .setFooter({ text: "New York State Roleplay • Official Rules" });

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


















