//Module Load
const fs = require('fs');
const { inspect } = require('util');
const express = require('express');
const app = express();
const Discord = require('discord.js');
const client = new Discord.Client();
const disbut = require('discord.js-buttons')(client);
// Data Load
var config = require('./storages/config.json'); // Prefix React GBAN
var guildConf = require('./storages/guildConf.json');

// Web Part
app.get('/', (req, res) => {
	res.send('Juicy is ready!');
});

app.listen(3000, () => {
	console.log('[Ready:Web] Web is ready.');
});
// Discord part
var start_time = new Date()
client.on('ready', () => {
var end_time = new Date()
	console.log('[Ready:Discord] Bot is ready. Start-up Time:'+(end_time-start_time)+"ms");
	client.user.setActivity('Juicy🍹 | :help');
});

client.on('guildCreate', guild => {
	if (!guildConf[guild.id]) {
		guildConf[guild.id] = {
			prefix: config.prefix,
			gban: config.gban,
			react: config.react,
			rand: config.rand,
			color: config.color
		};
	}
	fs.writeFile(
		'./storages/guildConf.json',
		JSON.stringify(guildConf, null, 2),
		err => {
			if (err) console.log(err);
		}
	);
});
client.on('guildDelete', guild => {
	delete guildConf[guild.id];
	fs.writeFile(
		'./storages/guildConf.json',
		JSON.stringify(guildConf, null, 2),
		err => {
			if (err) console.log(err);
		}
	);
});
client.on('message', message => {
	//1〜100の乱数
	const prob = Math.floor(Math.random() * 100);
	const rand = guildConf[message.guild.id].rand;

	if (message.content && prob < rand) {
		if (message.author.id !== '861191788069257216') {
			var emojiID = [];
			var emojiName = [];
			message.client.emojis.cache.map((e, x) => emojiID.push(x));
			message.client.emojis.cache.map((e, x) => emojiName.push(e.name));
			//乱数を使って絵文字をランダムに選ぶ
			const arrayLength = emojiID.length - 1;
			const arrayIndex = Math.floor(Math.random() * arrayLength);
			const aEmoji = emojiID[arrayIndex];
			//絵文字を発言
			if (guildConf[message.guild.id].react == false) return;

			message.react(aEmoji);
		}
	}
});
client.on('message', async message => {
	if (message.author.bot) return;
	if (message.content.indexOf(guildConf[message.guild.id].prefix) !== 0) return;

	const args = message.content
		.slice(guildConf[message.guild.id].prefix.length)
		.trim()
		.split(/ +/g);
	const command = args.shift().toLowerCase();

	if (command === 'eval') {
		if (message.author.id !== '645581794267234315')
			return await message.channel.send({
				embed: {
					color: guildConf[message.guild.id].color,
					title: '**[' + command + '] 権限不足です。**',
					description: '**Bot運営のみこのコマンドを実行できます。**'
				}
			});

		let evaled;
		try {
			evaled = await eval(args.join(' '));
			message.channel.send(inspect(evaled));

			console.log(inspect(evaled));
		} catch (error) {
			console.error(error);
			message.channel.send({
				embed: {
					color: guildConf[message.guild.id].color,
					title: '**[' + command + '] エラーが発生しました。**',
					description:
						'**エラーが発生しました。エラー内容:**\n```' + error + '```'
				}
			});
		}
	} else if (command === 'settings') {
		const settings = guildConf[message.guild.id];
		const tf = {
			false: '無効',
			true: '有効'
		};
		message.channel.send({
			embed: {
				color: settings.color,
				title: `**${message.guild.name}の設定**`,
				description: `💻 Prefix: ${settings.prefix}\n🌈 色:${
					settings.color
				}\n😆 リアクション:${tf[settings.react]}\n💯 リアクション確率:${
					settings.rand
				}%\n💥 Global Ban:${tf[settings.gban]}`
			}
		});
	} else if (command === 'prefix') {
		if (args[0]) {
			if (!message.member.hasPermission('ADMINISTRATOR'))
				return await message.channel.send({
					embed: {
						color: guildConf[message.guild.id].color,
						title: '**[' + command + '] 権限不足です。**',
						description:
							'**`ADMINISTRATOR`(管理者)のみこのコマンドを実行できます。**'
					}
				});
			guildConf[message.guild.id].prefix = args[0];
			fs.writeFile(
				'./storages/guildConf.json',
				JSON.stringify(guildConf, null, 2),
				err => {
					if (err) {
						console.log(err);
						message.channel.send({
							embed: {
								color: guildConf[message.guild.id].color,
								title: '**[' + command + '] エラーが発生しました。**',
								description:
									'**エラーが発生しました。エラー内容:**\n```' + err + '```'
							}
						});
					}
				}
			);
			message.channel.send({
				embed: {
					color: guildConf[message.guild.id].color,
					title: '**完了しました。**',
					description: `**Prefixを${args[0]}に変更しました。**`
				}
			});
		} else if (!args[0])
			message.channel.send({
				embed: {
					color: guildConf[message.guild.id].color,
					title: '**[' + message.guild.name + '] Prefix**',
					description:
						'**Prefix:** ```' + guildConf[message.guild.id].prefix + '```'
				}
			});
	} else if (command === 'color') {
		if (args[0]) {
			if (!args[0].startsWith('#'))
				return await message.channel.send({
					embed: {
						color: guildConf[message.guild.id].color,
						title: '**16進数(#000000など)のみ対応。**',
						description: '**現在、カラーコードは16進数のみに限られています。**'
					}
				});
			if (!message.member.hasPermission('ADMINISTRATOR'))
				return await message.channel.send({
					embed: {
						color: guildConf[message.guild.id].color,
						title: '**[' + command + '] 権限不足です。**',
						description:
							'**`ADMINISTRATOR`(管理者)のみこのコマンドを実行できます。**'
					}
				});
			guildConf[message.guild.id].color = args[0];
			fs.writeFile(
				'./storages/guildConf.json',
				JSON.stringify(guildConf, null, 2),
				err => {
					if (err) {
						console.log(err);
						message.channel.send({
							embed: {
								color: guildConf[message.guild.id].color,
								title: '**[' + command + '] エラーが発生しました。**',
								description:
									'**エラーが発生しました。エラー内容:**\n```' + err + '```'
							}
						});
					}
				}
			);
			message.channel.send({
				embed: {
					color: guildConf[message.guild.id].color,
					title: '**完了しました。**',
					description: `**色(埋め込み)を${args[0]}に変更しました。**`
				}
			});
		} else if (!args[0])
			message.channel.send({
				embed: {
					color: guildConf[message.guild.id].color,
					title: '**[' + message.guild.name + '] Color**',
					description:
						'**Color:** ```' + guildConf[message.guild.id].color + '```'
				}
			});
	} else if (command === 'react') {
		if (args[0] == 'switch') {
			if (!message.member.hasPermission('ADMINISTRATOR'))
				return await message.channel.send({
					embed: {
						color: guildConf[message.guild.id].color,
						title: '**[' + command + '] 権限不足です。**',
						description:
							'**`ADMINISTRATOR`(管理者)のみこのコマンドを実行できます。**'
					}
				});
			guildConf[message.guild.id].react = !guildConf[message.guild.id].react;
			fs.writeFile(
				'./storages/guildConf.json',
				JSON.stringify(guildConf, null, 2),
				err => {
					if (err) {
						console.log(err);
						message.channel.send({
							embed: {
								color: guildConf[message.guild.id].color,
								title: '**[' + command + '] エラーが発生しました。**',
								description:
									'**エラーが発生しました。エラー内容:**\n```' + err + '```'
							}
						});
					}
				}
			);
			message.channel.send({
				embed: {
					color: guildConf[message.guild.id].color,
					title: '**完了しました。**',
					description: `**リアクション機能を${
						guildConf[message.guild.id].react
					}に変更しました。**`
				}
			});
		} else if (args[0] == 'rand') {
			var rand = args[1].match(/^[0-9]+$/);

			if (!rand)
				return await message.channel.send({
					embed: {
						color: guildConf[message.guild.id].color,
						title: '**数字のみ対応**',
						description: '**数字を引数に入れてください。**'
					}
				});
			if (rand > 100 || rand < 1)
				return await message.channel.send({
					embed: {
						color: guildConf[message.guild.id].color,
						title: '**1-100間の数字のみ対応。**',
						description: '**超過した数を入れないで下さい。**'
					}
				});

			if (!message.member.hasPermission('ADMINISTRATOR'))
				return await message.channel.send({
					embed: {
						color: guildConf[message.guild.id].color,
						title: '**[' + command + '] 権限不足です。**',
						description:
							'**`ADMINISTRATOR`(管理者)のみこのコマンドを実行できます。**'
					}
				});
			guildConf[message.guild.id].rand = rand;
			fs.writeFile(
				'./storages/guildConf.json',
				JSON.stringify(guildConf, null, 2),
				err => {
					if (err) {
						console.log(err);
						message.channel.send({
							embed: {
								color: guildConf[message.guild.id].color,
								title: '**[' + command + '] エラーが発生しました。**',
								description:
									'**エラーが発生しました。エラー内容:**\n```' + err + '```'
							}
						});
					}
				}
			);
			message.channel.send({
				embed: {
					color: guildConf[message.guild.id].color,
					title: '**完了しました。**',
					description: `**リアクション確率を${rand}%に変更しました。**`
				}
			});
		} else if (!args[0])
			message.channel.send({
				embed: {
					color: guildConf[message.guild.id].color,
					title: '**[' + message.guild.name + '] React**',
					description:
						'**React:** ```' +
						guildConf[message.guild.id].react +
						'```\n**React%:** ```' +
						guildConf[message.guild.id].rand +
						'%```'
				}
			});
	} else if (command === 'invite') {
    message.channel.send(`**Bot招待: https://juicy.discompass.tk\nサポート(暫定): https://discord.gg/jFdyhnaQyq **`);
	} else
		message.channel.send({
			embed: {
				color: guildConf[message.guild.id].color,
				title: '**コマンドが存在しません。**',
				description:
					'```' +
					guildConf[message.guild.id].prefix +
					command +
					'```**は存在しません。**```' +
					guildConf[message.guild.id].prefix +
					'help```**を確認して下さい。**'
			}
		});
});

client.login(process.env.TOKEN);
