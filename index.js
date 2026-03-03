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

// ================= RULES =================
const DISCORD_RULES = `📜 
# Camden Roleplay — Official Discord Rules

Welcome to Camden Roleplay.
By remaining in this server, you agree to follow all rules outlined below. These rules are designed to ensure a safe, respectful, and professional community environment for everyone.

Failure to comply may result in disciplinary action.

1️⃣ Respect & Community Conduct

All members must treat one another with respect at all times.

The following behaviour is strictly prohibited:

Harassment or bullying
Racism, sexism, homophobia, or discrimination of any kind
Personal attacks or targeted abuse
Encouraging self-harm or harm toward others
Doxxing or threatening behaviour

Disagreements may occur, but they must remain civil. Heated arguments, hostility, or instigating drama will not be tolerated.

Camden Roleplay is a community — act accordingly.

2️⃣ Zero Tolerance for Hate Speech

Any form of hate speech, slurs, extremist ideology, or discriminatory language is strictly forbidden.

This includes:

Direct messages related to server disputes
“Jokes” or sarcasm used to disguise offensive remarks
Symbols or imagery associated with hate groups

We maintain a strict zero-tolerance policy on this matter.

3️⃣ Appropriate Content Only

All content posted within Camden Roleplay must be appropriate and safe for all members.

The following content is not allowed:

NSFW or sexually explicit material
Graphic violence
Illegal content
Drug promotion
Shock content
Malware or malicious links

This rule applies to:

Messages
Images
GIFs
Links
Usernames
Profile pictures
Custom statuses

4️⃣ No Advertising or Self Promotion

Advertising external servers, businesses, YouTube channels, TikToks, or services without management approval is prohibited.

This includes:

DM advertising
Posting invite links
“Soft promotion” (e.g. “join my server” casually in chat)

Partnerships must go through official management channels.

5️⃣ No Spam or Disruption

Spamming disrupts server quality and will result in punishment.

This includes:

Message flooding
Repeated emoji usage
Excessive tagging
Soundboard abuse
Repeatedly sending the same content
Intentionally derailing conversations

Keep discussions meaningful and relevant.

6️⃣ Use Channels Correctly

All channels have specific purposes.

Members are expected to:

Read channel descriptions
Post in the appropriate areas
Avoid off-topic conversations in structured channels

Failure to use channels properly may result in message removal or warnings.

7️⃣ No Impersonation

Impersonating staff members, departments, or other community members is strictly forbidden.

This includes:

Copying usernames or profile pictures
Pretending to hold staff authority
Falsely claiming affiliation with management

Impersonation may result in an immediate ban.

8️⃣ Staff Authority & Disputes

Staff members are appointed to maintain fairness and order.

Staff decisions are final.

Publicly arguing with staff is not permitted.

If you believe a decision was unfair, open a ticket respectfully.

Harassment of staff will not be tolerated.

Abuse of the ticket system may result in restrictions.

9️⃣ No Exploiting or Rule Loopholes

Attempting to manipulate server systems, bots, or rule wording to gain advantage is prohibited.

If a rule does not explicitly mention something, that does not mean it is allowed.

Use common sense.

🔟 English Language Policy

To ensure effective moderation and clarity, all public channels must remain in English.

Private conversations in other languages may take place in direct messages.

1️⃣1️⃣ Privacy & Security

Sharing personal information (yours or others) without consent is strictly prohibited.

This includes:

Real names
Addresses
Phone numbers
IP addresses
Social media accounts

Respect privacy at all times.

⚖️ Disciplinary Action

Punishments may include:

Verbal warnings
Written warnings
Temporary timeouts
Kicks
Permanent bans

Severity of punishment depends on:

Rule broken
Intent
Previous history

Serious violations may result in immediate permanent removal without warning.

🛡️ Final Statement

Camden Roleplay is committed to maintaining a structured, professional, and enjoyable environment for all members.

By participating in this community, you agree to uphold these standards.

Failure to do so will result in appropriate moderation action.
`;

const RP_RULES = `
### 🚓 Camden Roleplay — Official In-Game Rules

These rules apply to all in-game activity within Camden Roleplay.
Failure to follow them may result in warnings, kicks, suspensions, or permanent removal from the server.

1️⃣ Roleplay Standard

Camden Roleplay is a serious UK-based roleplay server. All members are expected to maintain realism at all times.

Remain in character (IC) while in active roleplay.

Do not break immersion unnecessarily.

Avoid unrealistic actions or behaviour.

Use common sense in all scenarios.

Low-effort or unrealistic RP may result in removal from the scene.

2️⃣ Fail Roleplay (FRP)

Fail Roleplay is acting in a way that would be unrealistic in real life.

Examples include:

Driving off high bridges and continuing normally
Ignoring serious injuries
Running into armed officers without fear
Acting without value for life
Escaping from unrealistic situations with no RP

If your character would realistically be injured, unconscious, or dead — roleplay it properly.

3️⃣ Value of Life (VoL)

You must value your character’s life at all times.

If you are outnumbered or clearly overpowered, comply.

Do not fight armed officers with fists.

Do not attempt impossible escapes.

Fear RP must be shown in dangerous situations.

Failure to value life will be treated as serious FRP.

4️⃣ Random Deathmatch (RDM)

Killing another player without valid roleplay reason is strictly prohibited.

You must have:

Proper build-up
Clear roleplay reasoning
Escalation before violence

Sudden or random violence will result in punishment.

5️⃣ Random Vehicle Deathmatch (VDM)

Using a vehicle to intentionally hit, ram, or kill players without proper RP reasoning is forbidden.

Vehicle use must remain realistic and not be weaponised unless justified within roleplay.

6️⃣ Metagaming

Metagaming is using information your character would not realistically know.

Examples:

Using Discord voice to gain in-game information
Acting on information from streams
Using OOC chat knowledge IC

Only act on information your character has learned through RP.

7️⃣ Powergaming

Powergaming is forcing unrealistic actions onto others.

Examples:

“/me knocks you out instantly”
Forcing outcomes without allowing response
Unrealistic physical strength
Forcing another player into situations without chance to react

Roleplay must allow fair interaction.

8️⃣ New Life Rule (NLR)

If your character dies:

You may not return to the same scene.
You must forget the events leading to your death.
You cannot seek revenge using previous knowledge.

Breaking NLR will result in moderation action.

9️⃣ Combat Logging

Leaving the game to avoid arrest, death, or consequences is strictly forbidden.

If you disconnect during a scene:

You must rejoin immediately.
You must continue the roleplay.

Failure to return may result in suspension.

🔟 Realistic Emergency Services RP

All emergency services must:

Follow UK-based procedures
Use correct terminology where possible
Avoid abuse of power
Act professionally

Unrealistic policing or abuse of authority will not be tolerated.

1️⃣1️⃣ Criminal Roleplay Standards

Criminal RP must include:

Build-up
Negotiation when appropriate
Realistic demands
Fear of consequences
Constant robbery spam or unrealistic crime sprees may be limited by staff.

1️⃣2️⃣ Scene Interference

Do not interfere in active scenes unless:

You are directly involved
You are emergency services responding properly
You are requested by participants

Randomly joining scenes to cause chaos is prohibited.

1️⃣3️⃣ Exploits & Glitches

Abusing game mechanics, glitches, or bugs for advantage is strictly forbidden.

Report all bugs to management immediately.

Exploitation may result in a permanent ban.

1️⃣4️⃣ Stream Sniping

Using someone’s live stream to gain advantage in roleplay is strictly prohibited.

This is considered metagaming and may result in removal.

⚖️ Enforcement

Punishments may include:

Verbal warnings
Scene removal
Temporary suspension
Permanent ban

Severe or repeated violations may result in immediate removal from Camden Roleplay.

🛡️ Final Statement

Camden Roleplay aims to deliver a structured, immersive, and realistic UK roleplay experience.

Every member contributes to the quality of the server.

Respect the rules. Respect the roleplay. Respect the community.
`;

// ================= RULES PANEL =================
function buildRulesPanel(type = "discord") {
  const embed = new EmbedBuilder()
    .setColor(0x2b2d31)
    .setTitle("Boroughs of London Roleplay")
    .setImage(
      "https://images.unsplash.com/photo-1505761671935-60b3a7427bad?q=80&w=1200&auto=format&fit=crop"
    )
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



















