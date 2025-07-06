const http = require("http");
const querystring = require("querystring");
const { Client, Events, GatewayIntentBits, Partials, EmbedBuilder } = require("discord.js");
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.DirectMessages,
  ],
  partials: [Partials.Channel],
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

