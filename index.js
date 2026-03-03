const {
  Client,
  GatewayIntentBits,
  SlashCommandBuilder,
  Routes,
  REST,
  EmbedBuilder,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ChannelType,
} = require("discord.js");

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers],
});

const TOKEN = process.env.DISCORD_TOKEN;
const CLIENT_ID = process.env.CLIENT_ID;
const STAFF_ROLE_ID = "1478056632582930482";

// ================= RULES (shortened to fit Discord embed) =================
const DISCORD_RULES = `📜 Camden Roleplay — Official Discord Rules

1️⃣ Respect & Community Conduct
Treat all members with respect. Harassment, discrimination, personal attacks, or doxxing are forbidden. Arguments must remain civil.

2️⃣ Hate Speech
No hate speech, slurs, extremist ideology, or discriminatory language. Zero tolerance.

3️⃣ Appropriate Content
No NSFW, graphic violence, illegal content, drug promotion, malware, or shocking content.

4️⃣ Advertising
No self-promotion or external server invites without approval.

5️⃣ Spam
No message flooding, repeated emoji usage, excessive tagging, or derailing conversations.

6️⃣ Channels
Use channels properly. Read descriptions and post appropriately.

7️⃣ Impersonation
Do not impersonate staff or other members.

8️⃣ Staff & Disputes
Respect staff decisions. Open tickets for disputes, do not harass.

9️⃣ Exploits
Do not manipulate server systems or bots.

🔟 English Only
All public channels must use English.

1️⃣1️⃣ Privacy
Do not share personal information of yourself or others.

⚖️ Punishments
Warnings, timeouts, kicks, or bans may be applied based on severity.

🛡️ Final Statement
Camden Roleplay expects a professional, safe environment. Follow rules.`;

const RP_RULES = `🚓 Camden Roleplay — In-Game Rules

1️⃣ Roleplay Standard
Remain IC at all times. Avoid unrealistic actions or low-effort RP.

2️⃣ Fail Roleplay (FRP)
Do not ignore injuries or consequences. Play realistically.

3️⃣ Value of Life (VoL)
Comply when outnumbered. Do not risk character life unnecessarily.

4️⃣ RDM/VDM
Do not kill or hit players without valid RP reason.

5️⃣ Metagaming
Do not use OOC info IC. Act only on what your character knows.

6️⃣ Powergaming
Do not force unrealistic actions on others.

7️⃣ NLR
Forget events of death. Do not seek revenge with prior knowledge.

8️⃣ Combat Logging
Do not disconnect to avoid consequences.

9️⃣ Emergency Services
Follow UK-based procedures. Act professionally.

⚖️ Enforcement
Punishments range from verbal warnings to permanent bans.`;

// ================= RULES PANEL =================
function buildRulesPanel(type = "discord") {
  const rulesText = type === "discord" ? DISCORD_RULES : RP_RULES;

  const embed = new EmbedBuilder()
    .setColor(0x2b2d31)
    .setTitle("Boroughs of London Roleplay Rules")
    .setDescription(rulesText)
    .setImage(
      "https://images.unsplash.com/photo-1505761671935-60b3a7427bad?q=80&w=1200&auto=format&fit=crop"
    )
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
    .addChannelOption((o) =>
      o
        .setName("channel")
        .setDescription("Channel to send the panel")
        .addChannelTypes(ChannelType.GuildText)
        .setRequired(true)
    ),
  new SlashCommandBuilder()
    .setName("ticketpanel")
    .setDescription("Send the ticket panel")
    .addChannelOption((o) =>
      o
        .setName("channel")
        .setDescription("Channel to send the ticket panel")
        .addChannelTypes(ChannelType.GuildText)
        .setRequired(true)
    ),
  new SlashCommandBuilder()
    .setName("staffreview")
    .setDescription("Leave a staff review"),
].map((c) => c.toJSON());

const rest = new REST({ version: "10" }).setToken(TOKEN);
(async () => {
  try {
    await rest.put(Routes.applicationCommands(CLIENT_ID), { body: commands });
    console.log("✅ Commands registered");
  } catch (error) {
    console.error(error);
  }
})();

// ================= INTERACTIONS =================
client.on("interactionCreate", async (interaction) => {
  // /panel command
  if (interaction.isChatInputCommand() && interaction.commandName === "panel") {
    const channel = interaction.options.getChannel("channel");
    await channel.send(buildRulesPanel());
    return interaction.reply({ content: "✅ Rules panel sent.", ephemeral: true });
  }

  // Rules dropdown
  if (interaction.isStringSelectMenu() && interaction.customId === "rules_select") {
    return interaction.update(buildRulesPanel(interaction.values[0]));
  }

  // STAFF REVIEW modal
  if (interaction.isChatInputCommand() && interaction.commandName === "staffreview") {
    const modal = new ModalBuilder()
      .setCustomId("staff_review")
      .setTitle("Staff Review");

    const staffInput = new TextInputBuilder()
      .setCustomId("staff")
      .setLabel("Staff Member (@mention)")
      .setStyle(TextInputStyle.Short)
      .setPlaceholder("@StaffMember")
      .setRequired(true);

    const reviewInput = new TextInputBuilder()
      .setCustomId("review")
      .setLabel("Your Review")
      .setStyle(TextInputStyle.Paragraph)
      .setPlaceholder("Write your review here...")
      .setRequired(true);

    modal.addComponents(
      new ActionRowBuilder().addComponents(staffInput),
      new ActionRowBuilder().addComponents(reviewInput)
    );

    return interaction.showModal(modal);
  }

  // Modal submission
  if (interaction.isModalSubmit() && interaction.customId === "staff_review") {
    const embed = new EmbedBuilder()
      .setColor(0x2b2d31)
      .setTitle("⭐ Staff Review")
      .addFields(
        { name: "Reviewer", value: `<@${interaction.user.id}>`, inline: true },
        { name: "Staff Member", value: interaction.fields.getTextInputValue("staff"), inline: true },
        { name: "Review", value: interaction.fields.getTextInputValue("review") }
      )
      .setThumbnail(interaction.user.displayAvatarURL({ dynamic: true }));

    return interaction.reply({ embeds: [embed] });
  }
});

client.login(TOKEN);
