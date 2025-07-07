const http = require("http");
const querystring = require("querystring");
const fs = require('node:fs');
const path = require('node:path');
const { Client, Collection, Events, GatewayIntentBits, Partials, EmbedBuilder } = require("discord.js");
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.GuildPresences,
    GatewayIntentBits.GuildMembers,
  ],
  partials: [
    Partials.Channel,
    Partials.MessageContent],
});

http
  .createServer(function (req, res) {
    if (req.method == "POST") {
      var data = "";
      req.on("data", function (chunk) {
        data += chunk;
      });
      req.on("end", function () {
        if (!data) {
          console.log("No post data");
          res.end();
          return;
        }
        var dataObject = querystring.parse(data);
        console.log("post:" + dataObject.type);
        if (dataObject.type == "wake") {
          console.log("Woke up in post");
          res.end();
          return;
        }
        if (dataObject.type == "finish") {
          console.log("ponnpoko:" + dataObject.type);
          let userId = dataObject.userID;
          sendDm(userId, dataObject.comment);
          res.end();
          return;
        }
        if (dataObject.type == "finish2") {
          console.log("ponnpoko:" + dataObject.type);
          let channelId = dataObject.userID;
          sendMsg(channelId, dataObject.comment);
          res.end();
          return;
        }
        if (dataObject.type == "userCheck"){
          console.log("ponnpoko:" + dataObject.type);
          let userId = dataObject.userID;
          var whoIsHere = peopleInTheGuild(userId);
          var words = whoIsHere;
          res.end("うにょん" + words);
          return;
        }
        if (dataObject.type == "userCheck2"){
          console.log("ponnpoko:" + dataObject.type);
          let userId = dataObject.userID;
          var whoIsHere = peopleInTheGuild2(userId);
          var words = whoIsHere;
          res.end("うにょん" + words);
          return;
        }
        res.end();
      });
    } else if (req.method == "GET") {
      res.writeHead(200, { "Content-Type": "text/plain" });
      res.end("Discord Bot is active now\n");
    }
  })
  .listen(3000);

client.once(Events.ClientReady, (c) => {
  console.log("Bot準備完了～");
  client.user.setPresence({ activities: [{ name: "ボックス管理" }] });
});

client.on(Events.MessageCreate, async (message) => {
  if (message.author.id == client.user.id) {
    return;
  }
  if (message.content.match(client.user) /*.mentions.has(client.user)*/) {
    sendReply(
      message.channel.id,
      "<@" +
        message.author +
        ">さん、" +
        "こんにちは～" +
        "\nぽんぽこボックスは[こちら](https://docs.google.com/forms/d/e/1FAIpQLSfsZqwROnrcLAs2L91KGGomlNPNXQd6mYRHBoF5LtiEFwTqcA/viewform)からどうぞ～"
    );
    return;
  }
  if (message.content.match(/^ぽんぽこ$/)) {
    let text = "ぽんぽこ";
    sendMsg(message.channel.id, text);
    return;
  }
  if (message.content.match(/^ぽわ〜ん$|^ぽわ～ん$|^ぽわーん$/)) {
    let userId = message.author.id;
    let text = "ぽわ～ん";
    sendDm(userId, text);
    return;
  }
});

// commandsフォルダから、.jsで終わるファイルのみを取得
client.commands = new Collection(); //コマンド用
const commandsPath = path.join(__dirname, "commands");
const commandFiles = fs
  .readdirSync(commandsPath)
  .filter((file) => file.endsWith(".js"));


 for (const file of commandFiles) {
  const filePath = path.join(commandsPath, file);
  const command = require(filePath);
  // 取得した.jsファイル内の情報から、コマンドと名前をListenner-botに対して設定
  if ("data" in command && "execute" in command) {
    client.commands.set(command.data.name, command);
  } else {
    console.log(
      `[WARNING]  ${filePath} のコマンドには、必要な "data" または "execute" プロパティがありません。`
    );
  }
}

// コマンドが送られてきた際の処理
client.on(Events.InteractionCreate, async (interaction) => {
  // コマンドでなかった場合は処理せずさよなら。
  if (!interaction.isChatInputCommand()) return;

  const command = interaction.client.commands.get(interaction.commandName);

  // 一致するコマンドがなかった場合
  if (!command) {
    console.error(` ${interaction.commandName} というコマンドは存在しません。`);
    return;
  }

  try {
    // コマンドを実行
    await command.execute(interaction);
  } catch (error) {
    console.error(error);
    await interaction.reply({
      content: "コマンドを実行中にエラーが発生しました。",
      ephemeral: true,
    });
  }
});

if (process.env.LEAVES == undefined) {
  console.log("LEAVESが設定されていません。");
  process.exit(0);
}

client.login(process.env.LEAVES);

function sendReply(channelId, text, option = {}) {
  client.channels.cache
    .get(channelId)
    .send(text, option)
    .then(console.log("リプライ送信: " + text + JSON.stringify(option)))
    .catch(console.error);
}

function sendMsg(channelId, text, option = {}) {
  client.channels.cache
    .get(channelId)
    .send(text, option)
    .then(console.log("メッセージ送信: " + text + JSON.stringify(option)))
    .catch(console.error);
}

function sendDm(userId, text, option = {}) {
  client.users.fetch(userId)
    .then(e => {
    e.send(text, option)
      .then(console.log("DM送信: " + text + JSON.stringify(option)))
      .catch(console.error); // 1段階目のエラー出力
  })
    .catch(console.error); // 2段階目のエラー出力
}

function peopleInTheGuild(userId){
  try {
    let guild = client.guilds.cache.get("1167389033396174909");
    let user = client.users.cache.find(user => user.id == String(userId));
    if (!user){return "ありません";}else{
      let memId = guild.members.cache.get(userId);
      if (!memId){return "ありません";}else{console.log(`成功！${memId}`); let userName = String(user.username); return "あります" + String(userName)}
    }
  }catch(e){
    console.log("失敗！", e)
    return "通信エラー" + String(e);
  }
}

function peopleInTheGuild2(userName){
  try {
    let guild = client.guilds.cache.get("1167389033396174909");
    let user = client.users.cache.find(user => user.username == String(userName));
    if (!user){return "ありません";}
    else{
      let userId = String(user.id);
      let memId = guild.members.cache.get(userId);
      if (!memId){return "ありません";}else{console.log(`成功！${memId}`); return "あります" + String(userId)}
    }
  }catch(e){
    console.log("失敗！", e)
    return "通信エラー" + String(e);
  }
}

