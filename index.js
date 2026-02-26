const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('rules')
    .setDescription('View the server rules'),

  async execute(interaction) {
    const rulesEmbed = new EmbedBuilder()
      .setTitle('📜 Server Rules')
      .setDescription(
        '**Welcome to the server!**\n\n' +
        'Please read and follow all rules listed below. Failure to comply may result in moderation action.'
      )
      .addFields(
        {
          name: '🚓 Roleplay Rules',
          value:
            '• No RDM / VDM\n' +
            '• Stay realistic at all times\n' +
            '• Follow ER:LC & server RP guidelines\n' +
            '• FearRP is mandatory',
        },
        {
          name: '👮 Conduct Rules',
          value:
            '• Respect all members and staff\n' +
            '• No trolling or fail RP\n' +
            '• Listen to staff decisions\n' +
            '• No exploiting or abusing mechanics',
        },
        {
          name: '📌 General Rules',
          value:
            '• No harassment or discrimination\n' +
            '• No spamming or advertising\n' +
            '• Keep chat appropriate\n' +
            '• Use common sense',
        }
      )
      .setImage('https://i.pinimg.com/originals/73/0b/8e/730b8eb30cb038e5ff87b1072b9ad2c8.jpg')
      .setColor(0x2f3136)
      .setFooter({
        text: 'By playing here, you agree to follow all server rules.',
      })
      .setTimestamp();

    await interaction.reply({
      embeds: [rulesEmbed],
    });
  },
};