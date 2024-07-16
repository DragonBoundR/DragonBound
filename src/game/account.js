var Types = require('./gametypes');
var Logger = require('./lib/logger');
var Message = require('./lib/message');
var Player = require('./player');
var Bot = require('./bot');
var Game = require('./game');
var Room = require('./room');
var ignoreCase = require('ignore-case');
var mysql = require('mysql');
var Commands = require('./commands');
var WebSocket = require('ws');
var fs = require('fs');
var db = require('./data');

function getRndInteger(min, max) {
	return Math.floor(Math.random() * (max - min + 1) ) + min;
}

function pin_code_generador(length, current) {
  current = current ? current : '';
  return length ? pin_code_generador(--length, "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ".charAt(Math.floor(Math.random() * 36)) + current) : current;
}

function ArrayToObject(a, b) {
	var c, d = b.length, e = {};
	for (c = 0; c < d; c++)
		e[b[c]] = a[c];
	return e
}

function Commatize(b) {
	return b.toString().replace(/(\d)(?=(\d{3})+$)/g, "$1,")
}

function secondsremaining(fechaFin) {
	return Math.round(Math.abs(Math.round(Date.now() - fechaFin) / 1000));
}

// account
module.exports = class Account {
	constructor(connection, gameserver,ip_actions) {
		this.ip_actions = ip_actions;
		this.connection = connection;
		this.gameserver = gameserver;
		this.con_id = connection.id;
		this.login_complete = false;
		this.player = null;
		this.user_id = null;
		this.last_message = 0;
		this.last_chat = "";//Codigo De Spam
		this.strik = 0;
		this.room_number = 0;
		this.location_type = Types.LOCATION.CHANNEL;
		this.hasEnteredGame = false;
		this.room = null;
		this.ready = false;
        this.lucky_egg_start = 0;
        this.lucky_egg_sec_left = 0;
		this.commands = new Commands(this);
        this.connections = [];
        this.ignoredisconnect = false;
		var self = this;
		connection.listen(function (message) {
			var opcode = parseInt(message[0]);
			try {
				self.Handler(opcode, message);
			} catch (e) {
				Logger.debug("err: " + message);
				Logger.error("" + e.stack);
			}
		});

        connection.onClose(function () {
            //console.log("closing account...",self.user_id);
            if(self.ignoredisconnect)
                return false;
            //console.log("calling disconnect");
            self.disconnect();
        });
    }
    lucky_egg_left(){
        return this.lucky_egg_sec_left - (Date.now()-this.lucky_egg_start);
    }
    disconnect(cc=false){
        if (this.room) {
            if(this.room.watchers[this.user_id]){
                this.room.removeWatcher(this,true);
            } else 
            this.room.removePlayer(this);
            //console.log("checking func after disconnect");
        }
        var lucky_egg_left = this.lucky_egg_left();
        this.gameserver.db.updateLuckyEggLeft(this.user_id,lucky_egg_left > 0 ? lucky_egg_left : 0);
        if (this.exit_callback) {
            this.exit_callback();
        }
    }
	check_messages(){
	   var pending_messages = this.gameserver.pending_messages[this.user_id];
	   if(pending_messages!=undefined)
	   for(var i=0;i<pending_messages.length;i++){
		   this.send(pending_messages[i]);
		   this.gameserver.pending_messages[this.user_id].splice(i,1);
	   }
	}
	unlocknewbot(){
        var new_bot_id = this.player.unlock+1;
        if(new_bot_id < Types.COMPUTER_PLAYER.length){
            var bot = Types.COMPUTER_PLAYER(new_bot_id);
            this.player.unlock = new_bot_id;
            this.gameserver.db.updateMaxBoss(this.user_id);
            this.sendMessage(new Message.loginResponse(this));
            var self = this;
            setTimeout(function(){
                self.send([Types.SERVER_OPCODE.alert2, 59, [bot.name,[bot.avatar.h,bot.avatar.b,null,null]] ]);      
            },2000);
        }
    }
    Handler(opcode, message) {
        var self = this;
        const ip = this.connection._connection._socket.remoteAddress;
        switch (opcode) {

			case Types.CLIENT_OPCODE.login:
				{
					let _ver = parseInt(message[1]);
					let _id = parseInt(message[2]);
					let _session = message[3];
					let _hash = parseInt(message[4]);
					let _last_win = parseInt(message[5]);
					//Logger.info('Ver: '+_ver+' - Id: '+_id+' - session: '+_session+' - hash: '+_hash+' - last_win: '+_last_win);
					//Logger.normal("Login: "+JSON.stringify(message));
					if (typeof (_id) !== 'number') {
						self.sendMessage(new Message.alertResponse(":)", "Que haces? Ctrl+F5"));
						console.log("login incomplete 0 ",opcode);self.connection.close();
						return null;
					}
					self.gameserver.db.getPlayerData(_id, _session)
					.then(function (data) {
						
						if (data.banned === 1) {
							self.gameserver.db.getUserByBannedTest(data.user_id)
								.then(function (dbplaytt) {
								var ban_inf = dbplaytt[0][0];
								self.send([17,"Estás Baneado","Motivo: "+ban_inf.razon+"<br><br>Hasta: undefined"]);
								console.log("login incomplete 1 ",opcode);self.connection.close();
							});
						} else if (data.error_mysql || data.error_querry) {
							self.sendMessage(new Message.alertResponse(":)", "Error Servidor!"));
							console.log("login incomplete 2 ",opcode);self.connection.close();
						} else if (data.error_session || data.error_exist) {
							self.sendMessage(new Message.alertResponse(":)", "Que haces? Ctrl+F5"));
							console.log("login incomplete 3 ",opcode);self.connection.close();
						} else {
							self.send([Types.SERVER_OPCODE.login_profile]);
							self.gameserver.checkAccountOnlineAndClose(data.user_id, function () {
								var otheraccount = self.gameserver.searchAccountById(data.user_id);
								if (otheraccount !== null) {
									otheraccount.send([Types.SERVER_OPCODE.disconnect_reason, 3, null]);
                                    otheraccount.ignoredisconnect = true;
                                    otheraccount.connection.close();
                                    otheraccount.disconnect();
                                    //console.log("account finalized");
                                }
								self.send([Types.SERVER_OPCODE.login_avatars]);
								self.user_id = data.user_id;
								self.is_muted = data.is_muted;
								self.player = new Player(data);
								self.login_complete = true;
								self.location_type = Types.LOCATION.CHANNEL;
								//if (self.player.rank === 26 && self.player.guild !== 'GM' || self.player.rank === 27 && self.player.guild !== 'GM' || self.player.rank === 31 && self.player.guild !== 'GM') {
								//    self.player.guild = '';
								//}
                                self.lucky_egg_start = Date.now();
                                self.lucky_egg_sec_left = data.lucky_egg_sec_left=="" ? 0 : parseInt(data.lucky_egg_sec_left);
								self.sendMessage(new Message.loginResponse(self));
								self.gameserver.addAccount(self);
								self.gameserver.enter_callback(self);
								//self.gameserver.db.viewsServer1(self.gameserver.id);
                                if (self.player.rank >= 0) {
                                    if (self.gameserver.id === 2) {
										self.player.tournament = [0, 0, 2, 0, 0, -2, "", 10, 14, 1, [1,3,8,9,10], 0, 1, 0, 0, 0, 0, false, [], 100, 15];
										self.sendMessage(new Message.loginResponse(self));
                                    } else if (self.gameserver.id === 7) {
                                        self.player.tournament = [0,0,2,1,0,-1,"",191588,68,25,[0,1,9,13],0,1,0,0,0,-100000,null,[],100,20,0];
                                        self.sendMessage(new Message.loginResponse(self));
									} else if (self.gameserver.id === 6) {
									//start_time end_time players avatar_on max_wind force_mobile name total_games last_5_minutes_games rooms maps game_mode s1 tp save_personal save_guild min_points different_mobiles gifts gp_event
										self.player.tournament = [0, 0, 0, 1, 50, -1, "", 1788581, 953, 293, [4,40], 0, 1, 0, 0, 0, 0, false, [], 100, 20, 0];
										self.sendMessage(new Message.loginResponse(self));
									} else if (self.gameserver.id === 3) {
										self.player.tournament = [0, 0, 2, 0, 0, -1, "", 10, 14, 1, [5,9], 0, 1, 0, 0, 0, -100000, false, [], 100, 10];
										self.sendMessage(new Message.loginResponse(self));
                                    } else {}
                                    let next_rank = 0; let tmpgender = 0; let cash = 0; let gift_rank = 0; let self2 = self.gameserver.getAccountById(parseInt(self.player.user_id)); let check_ranks = JSON.parse(self.player.first_important_ranks);
                                    if (self.player.gp <= 1099) { next_rank = 0; }
                                    else if (self.player.gp >= 1100 && self.player.gp <= 1199) { next_rank = 1; gift_rank = 9333; cash = 3000}
                                    else if (self.player.gp >= 1200 && self.player.gp <= 1499) { next_rank = 2; gift_rank = 9334; cash = 3000}
                                    else if (self.player.gp >= 1500 && self.player.gp <= 1799) { next_rank = 3; gift_rank = 9335; cash = 3000}
                                    else if (self.player.gp >= 1800 && self.player.gp <= 2299) { next_rank = 4; gift_rank = 9336; cash = 3000}
                                    else if (self.player.gp >= 2300 && self.player.gp <= 2799) { next_rank = 5; gift_rank = 9337; cash = 3000}
                                    else if (self.player.gp >= 2800 && self.player.gp <= 3499) { next_rank = 6; gift_rank = 9338; cash = 3000}
                                    else if (self.player.gp >= 3500 && self.player.gp <= 4199) { next_rank = 7; gift_rank = 9339; cash = 3000}
                                    else if (self.player.gp >= 4200 && self.player.gp <= 5099) { next_rank = 8; gift_rank = 9340; cash = 3000}
                                    else if (self.player.gp >= 5100 && self.player.gp <= 5999) { next_rank = 9; gift_rank = 9341; cash = 3000}
                                    else if (self.player.gp >= 6000 && self.player.gp <= 6899) { next_rank = 10; gift_rank = 9342; cash = 3000}
                                    else if (self.player.gp >= 6900 && self.player.gp <= 8763) { next_rank = 11; gift_rank = 9343; cash = 3000}
                                    else if (self.player.gp >= 8764 && self.player.gp <= 17015) { next_rank = 12; gift_rank = 9344; cash = 3000}
                                    else if (self.player.gp >= 17016 && self.player.gp <= 27329) { next_rank = 13; gift_rank = 9345; cash = 3000}
                                    else if (self.player.gp >= 27330 && self.player.gp <= 38554) { next_rank = 14; gift_rank = 9346; cash = 3000}
                                    else if (self.player.gp >= 38555 && self.player.gp <= 42657) { next_rank = 15; gift_rank = 9347; cash = 3000}
                                    else if (self.player.gp >= 42658 && self.player.gp <= 56895) { next_rank = 16; gift_rank = 9348; cash = 3000}
                                    else if (self.player.gp >= 56896 && self.player.gp <= 64119) { next_rank = 17; gift_rank = 9349; cash = 3000}
                                    else if (self.player.gp >= 64120 && self.player.gp <= 72704) { next_rank = 18; gift_rank = 9350; cash = 3000}
                                    else if (self.player.gp >= 72705 && self.player.gp <= 87010) { next_rank = 19; gift_rank = 9351; cash = 3000}
                                    else if (self.player.gp >= 87011 && self.player.gp <= 105010) { next_rank = 20; gift_rank = 9352; cash = 3000}
                                    else if (self.player.gp >= 105011 && self.player.gp <= 200299) { next_rank = 21; gift_rank = 9353; cash = 3000}
                                    else if (self.player.gp >= 200300 && self.player.gp <= 299999) { next_rank = 22; gift_rank = 9354; cash = 3000}
                                    else if (self.player.gp >= 300000 && self.player.gp <= 427504) { next_rank = 23; gift_rank = 9355; cash = 3000}
									else if (self.player.gp >= 427505 && self.player.gp <= 457504) { next_rank = 24; gift_rank = 9356; cash = 3000}
									else if (self.player.gp >= 457505 && self.player.gp <= 527865) { next_rank = 32; cash = 5000}
									else if (self.player.gp >= 527866 && self.player.gp <= 567894) { next_rank = 33; cash = 5000}
									else if (self.player.gp >= 567895 && self.player.gp <= 678905) { next_rank = 34; cash = 5000}
									else if (self.player.gp >= 678906 && self.player.gp <= 767568) { next_rank = 35; cash = 5000}
									else if (self.player.gp >= 767569 && self.player.gp <= 856788) { next_rank = 36; cash = 5000}
									else if (self.player.gp >= 856789 && self.player.gp <= 1456785) { next_rank = 37; cash = 5000}
									else if (self.player.gp >= 1456786 && self.player.gp <= 1789673) { next_rank = 38; cash = 5000}
									else if (self.player.gp >= 1789674 && self.player.gp <= 2098677) { next_rank = 39; cash = 5000}
									else if (self.player.gp >= 2098678 && self.player.gp <= 2356788) { next_rank = 40; cash = 5000}
									else if (self.player.gp >= 2356789 && self.player.gp <= 2639077) { next_rank = 41; cash = 5000}
									else if (self.player.gp >= 2639078 && self.player.gp <= 3689677) { next_rank = 42; cash = 5000}
									else if (self.player.gp >= 3689678 && self.player.gp <= 4786727) { next_rank = 43; cash = 5000}
									else if (self.player.gp >= 4786728 && self.player.gp <= 5987291) { next_rank = 44; cash = 5000}
									else if (self.player.gp >= 5987292 && self.player.gp <= 6896235) { next_rank = 45; cash = 5000}
                                    else if (self.player.gp >= 6896236) { next_rank = 46; cash = 10000} else {}
                                    if (self.player.rank != next_rank) {
										if (self.player.gender === 'f')
											tmpgender = 1;
                                        if (self.player.rank <= 24) {
                                            self.gameserver.db.updateRankByIdAcc(next_rank, self.player.user_id);
                                            self.player.rank = next_rank;
											//self.gameserver.db.sendGift(self.player.user_id, gift_rank);
				                            self.gameserver.db.getBoy(parseInt(self.player.user_id), parseInt(gift_rank)).then(function (acc) {}).catch(function (err) {
					                        let datasendgift = {
						                        UserId: self.player.user_id,
						                        aId: gift_rank,
						                        type: 0,
						                        expire_time: 0,
						                        is_cash: 0,
					                        	is_gift: 1,
						                        gift_sent_by: self.player.user_id,
						                        amount: 0,
						                        date_ava_time: Date.now()
					                        };
					                        self.gameserver.db.putUserAvatars(datasendgift)
											var name_ava_gift = self.gameserver.avatars.getAvatagift(gift_rank);
											self.sendMessage(new Message.alert2Response(Types.ALERT2_TYPES.RECEIVED_AVATAR, ["FunnyBound", gift_rank, 0, "Congratulations you have leveled up and thanks to your effort we will reward you with this avatar", "forever", name_ava_gift]));
											self.gameserver.db.sendCash(cash, self.player.user_id);
											self2.send([17, "Received Cash! :)", "You just received <font color='yellow'>"+cash+"</font> Cash from<br><font color='yellow'>"+self.player.game_id+"</font>.<br><br>And cash for Rank up <font color='cyan'><span class='span_rank rank rank"+next_rank+"'></span></font>.<br><br>Thank You!"]);
											self2.player.cash += cash;
				                            });
                                            self.sendMessage(new Message.loginResponse(self));
                                            self.gameserver.sendAccountsOnline();
                                        }
                                    }
									if (self.player.power_user === 1) {
										self.gameserver.db.getAvatarExpireExItem(self.player.user_id, 464).then(function (data) {}).catch(function (err) {
											self.gameserver.db.updatePowerUser(0, self.player.user_id);
											self.player.power_user = 0;
											self.sendMessage(new Message.loginResponse(self));
											self.gameserver.sendAccountsOnline();
										});
									}
								}
								self.gameserver.db.updateServerByUserId(self.gameserver.id, self.player.user_id);
								self.gameserver.last_account_info[self.user_id] = {
									user_id: self.user_id,
									rank: self.player.rank,
									guild: self.player.guild,
									country: self.player.country
								};
								//self.gameserver.account_check[self.gameserver.id].accounts_server += 1;
								self.check_messages();
								/*if (self.player.win === 0 && self.player.loss === 0) {
								    self.sendMessage(new Message.alert2Response(Types.ALERT2_TYPES.RECEIVED_AVATAR, ["ThorBound", 8142, 0, "Welcome Gift", "forever", "Chicken [Head]"]));
								    self.sendMessage(new Message.alert2Response(Types.ALERT2_TYPES.RECEIVED_AVATAR, ["ThorBound", 8143, 0, "Welcome Gift", "forever", "Chicken [Body]"]));
								    self.sendMessage(new Message.alert2Response(Types.ALERT2_TYPES.RECEIVED_AVATAR, ["ThorBound", 748554, 0, "Welcome Gift", "forever", "Chastifall (RARE) [Flag]"]));
								}*/
								/*if (1559602800000 >= Date.now()) {
									self.send([17,"¡PROMOCIÓN!",'Promoción de cash por tiempo limitado, aprovecha esta gran oferta y recibe 2 RANGOS ESPECIALES + 170,000 de cash. <a style="color:#fbf9f9;text-shadow: 0px 0px 2px #ff980099, 0px 0px 3px #ff830057, 0px 0px 7px #ff98005e, 0px 0px 5px #ff9b0066, 0px 0px 8px #ff980059, 0px 0px 8px #ff8f0070;" href="/cash" target="_blank">¡RECARGA YA! - ¡Click Aqui!</a>']);
								}*/
								//self.send([17,"¡ALERTA!",'El servidor se encuentra en mantenimiento durante unas horas, le recomendamos no jugar por el momento, gracias por su comprension']);
							});
						}
					})
					.catch(function (err) {
						console.log("login incomplete 4 ",err);self.connection.close();
					});
					break;
				}
			case Types.CLIENT_OPCODE.get_avatar:
				{
					let _id = message[1];
					var data = self.gameserver.avatars.getAvatar(_id);
					if (data !== null) self.send([Types.SERVER_OPCODE.avatar_info, _id, data]);
					break;
				}
			case Types.CLIENT_OPCODE.get_my_avatars:
				{
					// seguridad
					if (!self.login_complete) {
						console.log("login incomplete",opcode);self.connection.close();
						return null;
					}
					self.gameserver.db.getPlayerAvatars(self)
					.then(function (data) {
						if (data.error_mysql || data.error_querry) {} else {
							var dat = self.gameserver.avatars.getAvatarDataList(data.data_list);
							self.sendMessage(new Message.myAvatars(self, dat));
						}
					});
					break;
				}
			case Types.CLIENT_OPCODE.chat:
				{
					// seguridad
					if (!self.login_complete) {
						console.log("login incomplete",opcode);self.connection.close();
						return null;
					}
					let _msj = message[1];
					let _team = parseInt(message[2]);
					let _unk = parseInt(message[3]);
					let ch = self.location_type == Types.LOCATION.CHANNEL ? true : false;
					//if (self.player.gm === 1) {/*Solucionar Este Problema*/
						self.commands.parse(/*_msj*/message);
					//}
					var showm = true;
					if (_msj[0] ==/*=*/ '/'/* && self.player.gm === 1*/)
						showm = false;

                    if (self.gameserver.chathistory.length > 100)
                        self.gameserver.chathistory = [];
                    if(showm){
                      if (self.room) {
                          self.room.chat(self, _msj, _team);
                      } else {
                          this.Chat(_msj, ch);
                      }
                    }
                    /*if (showm) {
                        if (self.location_type === Types.LOCATION.CHANNEL) {
                            console.log("chat enviendo al channel");
                            
                        } else if (self.location_type === Types.LOCATION.ROOM) {
                            
                                //Logger.log('Chat DBB: '+message);
                                console.log("chat enviendo a la sala");
                                
                            }
                        }
                    }*/
                    break;
                }
            case Types.CLIENT_OPCODE.send_bcm:
				{
					// seguridad
					if (!self.login_complete) {
						console.log("login incomplete",opcode);self.connection.close();
						return null;
					}
					
					let _msj = message[1];
					if (self.player.is_muted === true || self.player.is_muted >= Date.now()) {
						self.sendMessage(new Message.alert2Response(Types.ALERT2_TYPES.MUTED, []));
						return null;
					}
					else if (self.player.megaphones === 0) {
						self.sendMessage(new Message.alert2Response(Types.ALERT2_TYPES.NEED_ITEM, [894, 1, 0, "Megaphone / Horn / Bugle [ExItem]"]));
						return null;
					}
					else if (self.player.rank < 15) {
						self.sendMessage(new Message.alertResponse("Hola "+this.player.game_id, "Tu Nivel <span class='span_rank rank rank"+self.player.rank+"'></span> Es Muy Bajo Para Utilizar El MegaPhone, El Nivel Especial Debe De Ser Mayor <span class='span_rank rank rank15'></span> Para Que Lo Puedas Utilizar"));
						return null;
					} /*else if (self.gameserver.name === 'Prix' && this.player.gm === 0 && self.player.server_tournament_state === 0) {
						self.sendMessage(new Message.alertResponse("Hola "+this.player.game_id, "El Chat en el Lobby esta prohibido para los usuarios."));
						return null;
					}*/ else if (_msj.length > 150) {} else if (self.player.megaphones > 0) {
						_msj = _msj.replace("<", "");
						_msj = _msj.replace(">", "");
						_msj = _msj.replace("alert", "");
						_msj = _msj.replace("\\", "");
						_msj = _msj.replace("//", "");
						_msj = _msj.replace("%", "");
						let data = new Message.chatResponse(self, _msj, Types.CHAT_TYPE.BUGLE);
					self.gameserver.pushBroadcast(data);
					self.gameserver.chathistory.push(["(rank"+self.player.rank+") "+self.player.game_id+"] "+_msj+"",'',Types.CHAT_TYPE.BUGLE]);
					try {
						if (self.gameserver.master_ready === true) {
							let ps = data.serialize();
							self.gameserver.master.send(JSON.stringify([1, ps]));
						}
					} catch (e) {
						Logger.error(e.stack);
					}
					/*self.gameserver.db.updateMegaphone(-1, self.player.user_id).then(() => {
						self.player.megaphones -= 1;

					}); */
					self.sendMessage(new Message.loginResponse(self));
					/*self.gameserver.db.UpdateAvatarAmountBuggle(self.player.user_id).then(() => {}); */

				} else {
					self.sendMessage(new Message.alert2Response(Types.ALERT2_TYPES.NEED_ITEM, [894, 1, 0, 'Megaphone / Horn / Bugle [ExItem]']));
				}


				self.gameserver.db.getMegaphone(self.user_id,function(Megaphone){
                          if(!Megaphone > 0)
                            return false;
                          self.gameserver.db.reduceMegaphone(self.user_id,function(){
                          
                          
                          if(!(Megaphone-1 > 0)){
                            self.gameserver.db.removeMegaphone(self.user_id,function(){
                                self.sendMessage(new Message.loginResponse(self));
                                self.gameserver.db.getPlayerAvatars(self).then(function (data) {
                                    if (data.error_mysql || data.error_querry) {} else {
                                        var dat = self.gameserver.avatars.getAvatarDataList(data.data_list);
                                        self.sendMessage(new Message.myAvatars(self, dat));
                                    }
                                });
                              });
                            } else {
                              self.sendMessage(new Message.loginResponse(self));
                              self.gameserver.db.getPlayerAvatars(self).then(function (data) {
                                  if (data.error_mysql || data.error_querry) {} else {
                                      var dat = self.gameserver.avatars.getAvatarDataList(data.data_list);
                                      self.sendMessage(new Message.myAvatars(self, dat));
                                  }
                              });                                
                            }

                          });

                        });



				break;
				}
			case Types.CLIENT_OPCODE.pchat:
				{
					// seguridad
					if (!self.login_complete) {
						console.log("login incomplete",opcode);self.connection.close();
						return null;
					}
					let _id = parseInt(message[1]);
					if (typeof (_id) !== 'number')
						return null;
					let _msj = message[2];
                    if(_id==0){
                        if(self.player.guild_id > 0){
                          console.log("mensaje para el guild");
                          self.gameserver.guildMessage(self,_msj);
                        }

                    } else {
					let account = self.gameserver.searchAccountById(_id);
					if (typeof (account) !== 'undefined' && account !== null) {
						account.sendMessage(new Message.pChatResponse(self, this.player.game_id, _msj));
						self.sendMessage(new Message.pChatResponse(account, this.player.game_id, _msj));
						Logger.info('Chat Privado [De: '+self.player.game_id+'] - [Para: '+account.player.game_id+'] SMS: '+_msj);
					} else {
						var accountback = self.gameserver.last_account_info[_id];
						if(accountback!=undefined){
							self.sendMessage(new Message.pChatResponse(accountback, this.player.game_id, _msj));
							self.sendMessage(new Message.pChatResponse(accountback, 'Offline', ' PM será entregado cuando el usuario inicie sesión.'));
							if(self.gameserver.pending_messages[_id]==undefined)
								self.gameserver.pending_messages[_id] = [];
							self.gameserver.pending_messages[_id].push(new Message.pChatResponse(self, this.player.game_id, _msj).serialize());
						}
						
						return null;
					}
                    }
					break;
				}
				
			case Types.CLIENT_OPCODE.get_shop_page: {
				let AVATAR_TYPE_TO_NUMBER = {
					h: 0,
					b: 1,
					g: 2,
					f: 3,
					1: 4,
					2: 5,
					x: 6
				};
				let type = AVATAR_TYPE_TO_NUMBER[message[1]];



				let page = message[2];
				if (type === null)
					type = 0;
				if (page === null)
					page = 0;

				var data_page = self.gameserver.avatars.getShopListType(type, page);
			   if (message[1].length > 1) {
					data_page = self.gameserver.avatars.getShopListType(type, page, true, message[1], self.player.gm);

				}
					if (data_page !== null) {
						self.send(data_page);
						//self.send([Types.SERVER_OPCODE.next_avatar, 66723, 7454949, 2, 'a', 'Scream']);//Ventana New Avatar
					}
					break;
				}

			case Types.CLIENT_OPCODE.buy:
				{
					// seguridad
					if (!self.login_complete) {
						console.log("login incomplete",opcode);self.connection.close();
						return null;
					}
					let id = parseInt(message[1]);
					let is_cash = message[2];
					let period = message[3];
					let user_gift = message[5];
					let nota_gift = message[6];
					var tmpgender = 0;
					if (self.player.gender === 'f')
						tmpgender = 1;
					if (user_gift !== '') {
						self.gameserver.forEachAccount(function (account) {
							if (account !== null) {
								if (account.player.game_id === user_gift) {
									if (account.player.gender === 'f') {
										tmpgender = 1;
									} else if (self.player.gender === 'f' && account.player.gender === 'm'){
										tmpgender = 0;
									} else {}
								}
							}
						});
					}
					var item_data = self.gameserver.avatars.getAvatar2(id, tmpgender);
					if (item_data) {
						var _iprecio = 99999999999;
						var valid_precio = false;
						var errtrampa = false;
						var dat = Date.now();
						var timerank = Date.now();
						var aceptrankspecial = 'no';
						var rankspecial = 0;
						var megaponeuses = 0;
						if (item_data[6] === "")
							errtrampa = true;
						if (item_data[6].min_rank > self.player.rank) {
							self.sendMessage(new Message.alert2Response(Types.ALERT2_TYPES.NOT_FOR_SELL, []));
							return null;
						}
						if (period === Types.PERIOD.WEEK) {
							megaponeuses = 30;
							dat = dat + (7 * 24 * 60 * 60 * 1000);
							if (is_cash) {
								_iprecio = item_data[6].cash_week;
								if (item_data[6].cash_week <= 0)
									errtrampa = true;
							} else {
								_iprecio = item_data[6].gold_week;
								if (item_data[6].gold_week <= 0)
									errtrampa = true;
							}
						} else if (period === Types.PERIOD.MONTH) {
							megaponeuses = 50;
							dat = dat + (30 * 24 * 60 * 60 * 1000);
							if (is_cash) {
								_iprecio = item_data[6].cash_month;
								if (item_data[6].cash_month <= 0)
									errtrampa = true;
							} else {
								_iprecio = item_data[6].gold_month;
								if (item_data[6].gold_month <= 0)
									errtrampa = true;
							}
						} else if (period === Types.PERIOD.PERM) {
							megaponeuses = 100;
							dat = 0;
							if (is_cash) {
								_iprecio = item_data[6].cash_perm;
								if (item_data[6].cash_perm <= 0)
									errtrampa = true;
							} else {
								_iprecio = item_data[6].gold_perm;
								if (item_data[6].gold_perm <= 0)
									errtrampa = true;
							}
						}
						if (is_cash) {
							if (self.player.cash >= _iprecio)
								valid_precio = true;
						} else {
							if (self.player.gold >= _iprecio)
								valid_precio = true;
						}
						if (id === 1066 && self.player.gm === 1 || id === 1067 && self.player.gm === 1 || id === 1068 && self.player.gm === 1)
							return null;
						if (user_gift !== '') {
							self.gameserver.db.getUserByGameId(user_gift).then(function (rows) {
								var info_user = rows[0][0];
								let self2 = self.gameserver.getAccountById(parseInt(info_user.IdAcc));
								if (id === 1066 && self2.player.gm === 1 || id === 1067 && self2.player.gm === 1 || id === 1068 && self2.player.gm === 1)
									return null;
								/*if (self.player.rank === 26 && is_cash === true || self.player.rank === 27 && is_cash === true || self.player.rank === 31 && is_cash === true) {
									self.send([17,"PROHIBITED","This option is prohibited for your rank"]);
									return null;
								} */
								/*if (id === 2319 && self.player.rank !== 26) {
                                    self.sendMessage(new Message.alertResponse("Lo sentimos", "Este Item no se puede Regalar.."));
                                    return null;
                                }
								if (self.player.user_id === 4) {
                                    self.sendMessage(new Message.alertResponse("Lo sentimos Jorge", "Esta opción esta Prohibida. De insistir todo tiene un registro ATTE: Berny."));
                                    return null;
                                }
								if (self.player.user_id === 6) {
                                    self.sendMessage(new Message.alertResponse("Lo sentimos Johnatan", "Esta opción esta Prohibida. De insistir todo tiene un registro ATTE: Berny."));
                                    return null;
                                }*/								
								if (valid_precio && !errtrampa) {
									let data = {
										UserId: self2.user_id,
										aId: id,
										type: item_data[2],
										expire_time: dat,
										is_cash: is_cash === true ? 1 : 0,
										is_gift: 1,
										gift_sent_by: self.player.user_id,
										amount: 0,
										date_ava_time: Date.now()
									};
								if (id == 2319) { //lucky egg
									let eggAmount = [1, 8, 25];
									data.expire_time = 0;
									data.amount = eggAmount[period];
								} else if (id == 894) { //megaphone
									let bugleAmount = [30, 50, 100];
									data.expire_time = 0;
									data.amount = bugleAmount[period];
								} else if (id == 1060 || id == 1061 || id == 1062 || id == 1063 || id == 1064 || id == 1065) {
									data.expire_time = 0;
									data.amount = 1;
								}
									if (_iprecio <= 0) {
										
									} if (self.player.rank < 17) {
						   self.sendMessage(new Message.alertResponse("Lo sentimos :(","Tu nivel no es suficiente para enviar el regalo.",[]));
						} else {
										self.sendMessage(new Message.alert2Response(Types.ALERT2_TYPES.GIFT_SENT, [id]));
										Promise.all([
											self.gameserver.db.putUserAvatars(data)
                                        ]).then((data) => {
                                            self2.gameserver.db.getPlayerAvatars(self2)
                                            .then(function (data) {
                                                if (data.error_mysql || data.error_querry) {} else {
                                                    var dat = self2.gameserver.avatars.getAvatarDataList(data.data_list);
                                                    self2.sendMessage(new Message.myAvatars(self2, dat));
                                                }
                                            });
                                        });
										self.sendMessage(new Message.loginResponse(self));
										try {
											var name_ava_gift = self.gameserver.avatars.getAvatagift(id);
											self2.sendMessage(new Message.alert2Response(Types.ALERT2_TYPES.RECEIVED_AVATAR, [self.player.game_id, id, 0, nota_gift, "forever", name_ava_gift]));
											if (id === 464) {
												self.gameserver.db.updatePowerUser(1, self2.player.user_id);
												self2.player.power_user = 1;
											}
											if (id === 893) {
												self.gameserver.db.updatePlusGP(self2.player.user_id);
												self2.player.plus10gp = 1;
											}
											if (id === 894) {
												self.gameserver.db.updateMegaPone(megaponeuses, self2.player.user_id);
												self2.player.megaphones =  megaponeuses;
											}
											if (id === 1223) {
												self.gameserver.db.updateMaps(self2.player.user_id);
												self2.player.maps_pack = 1;
											}
											if (id === 1066) {
												timerank = timerank + (10 * 24 * 60 * 60 * 1000);
												rankspecial = 28;
												aceptrankspecial = 'se';
											}
											if (id === 1067) {
												timerank = timerank + (14 * 24 * 60 * 60 * 1000);
												rankspecial = 29;
												aceptrankspecial = 'se';
											}
											if (id === 1068) {
												timerank = timerank + (18 * 24 * 60 * 60 * 1000);
												rankspecial = 30;
												aceptrankspecial = 'se';
											}
											if (aceptrankspecial === 'se') {
												self.gameserver.db.updateRankSpecialByIdAcc(rankspecial, 1, self2.player.user_id);
												self.gameserver.db.putSpecialRanksByUserId(self2.player.user_id, self2.player.game_id, rankspecial, _iprecio, timerank);
												self2.player.rank = rankspecial;
												self2.sendMessage(new Message.loginResponse(self2));
												self.gameserver.sendAccountsOnline();
											}
										} catch(e){Logger.error(e);}
										if (is_cash === true) {
											self.player.cash = parseInt(self.player.cash - _iprecio);
											self.gameserver.db.sendDeleteCash(0, _iprecio, self.player.user_id);
										}
										else {
											self.player.gold = parseInt(self.player.gold - _iprecio);
											self.gameserver.db.sendDeleteCash(_iprecio, 0, self.player.user_id);
										}
										self.sendMessage(new Message.loginResponse(self));
									}
								}
								else
									self.send([40,60]);
							});
						} else {
							if (valid_precio && !errtrampa) {
								let data = {
									UserId: self.user_id,
									aId: id,
									type: item_data[2],
									expire_time: dat,
									is_cash: is_cash === true ? 1 : 0,
									is_gift: 0,
									gift_sent_by: 0,
									amount: 0,
									date_ava_time: Date.now()
								};
							if (id == 2319) { //lucky egg
								let eggAmount = [1, 8, 25];
								data.expire_time = 0;
								data.amount = eggAmount[period];
							} else if (id == 894) { //megaphone
								let bugleAmount = [30, 50, 100];
								data.expire_time = 0;
								data.amount = bugleAmount[period];
							} else if (id == 1060 || id == 1061 || id == 1062 || id == 1063 || id == 1064 || id == 1065) {
								data.expire_time = 0;
								data.amount = 1;
							}
								if (_iprecio <= 0) {
									
								} else {
									self.gameserver.db.getBoy(self.player.user_id, id).then(function (acc) {
										self.sendMessage(new Message.alert2Response(Types.ALERT2_TYPES.ALREADY_HAVE, []));
									}).catch(function (err) {
										self.gameserver.db.buyAvatarForAccount(self.user_id, is_cash, _iprecio, data)
										.then(function (data) {
											if (data.error_mysql || data.error_querry) {} else {
												self.sendMessage(new Message.alert2Response(Types.ALERT2_TYPES.PURCHASED, [id]));
												self.gameserver.db.getPlayerAvatars(self).then(function (data) {
													if (data.error_mysql || data.error_querry) {} else {
														var dat = self.gameserver.avatars.getAvatarDataList(data.data_list);
														self.sendMessage(new Message.myAvatars(self, dat));
													}
												});
												if (id === 464) {
													self.gameserver.db.updatePowerUser(1, self.player.user_id);
													self.player.power_user = 1;
												}
												if (id === 893) {
													self.gameserver.db.updatePlusGP(self.player.user_id);
													self.player.plus10gp = 1;
												}
												if (id === 894) {
													self.gameserver.db.updateMegaPone(megaponeuses, self.player.user_id);
													self.player.megaphones =  megaponeuses;
												}
												if (id === 1223) {
													self.gameserver.db.updateMaps(self.player.user_id);
													self.player.maps_pack = 1;
												}
												if (id === 1066) {
													timerank = timerank + (10 * 24 * 60 * 60 * 1000);
													rankspecial = 28;
													aceptrankspecial = 'se';
												}
												if (id === 1067) {
													timerank = timerank + (14 * 24 * 60 * 60 * 1000);
													rankspecial = 29;
													aceptrankspecial = 'se';
												}
												if (id === 1068) {
													timerank = timerank + (18 * 24 * 60 * 60 * 1000);
													rankspecial = 30;
													aceptrankspecial = 'se';
												}
												if (aceptrankspecial === 'se') {
													self.gameserver.db.updateRankSpecialByIdAcc(rankspecial, 1, self.player.user_id);
													self.gameserver.db.putSpecialRanksByUserId(self.player.user_id, self.player.game_id, rankspecial, _iprecio, timerank);
													self.player.rank = rankspecial;
													self.sendMessage(new Message.loginResponse(self));
													self.gameserver.sendAccountsOnline();
												}
												if (is_cash === true)
													self.player.cash = parseInt(self.player.cash - _iprecio);
												else
													self.player.gold = parseInt(self.player.gold - _iprecio);
												self.sendMessage(new Message.loginResponse(self));
											}
										})
										.catch(function (err) {
											Logger.error("" + err.stack);
										});
									});
								}
							}
							else
								self.send([40,60]);
						}
					} else {
						self.sendMessage(new Message.alert2Response(Types.ALERT2_TYPES.AVATAR_WRONG_GENDER, []));
					}
					break;
				}

			case Types.CLIENT_OPCODE.delete_avatar:
				{
					// seguridad
					if (!self.login_complete) {
						console.log("login incomplete",opcode);self.connection.close();
						return null;
					}
					
					let id = parseInt(message[1]);
				self.gameserver.db.selectItemDetail(id).then(function(data) {
					let item = data[0][0].aId;
					if (item == 894) {
						self.gameserver.db.DeleteAvatarX(self.player.user_id, 5).then(() => {});
						self.player.megaphones = 0;
					} else if (item == 464) {
						self.gameserver.db.DeleteAvatarX(self.player.user_id, 1).then(() => {});
						self.player.power_user = 0;
						self.sendMessage(new Message.loginResponse(self));
					} else if (item == 893) {
						self.gameserver.db.DeleteAvatarX(self.player.user_id, 2).then(() => {});
						self.player.plus10gp = 0;
						self.sendMessage(new Message.loginResponse(self));
					} else if (item == 1223) {
						self.gameserver.db.DeleteAvatarX(self.player.user_id, 3).then(() => {});

						self.player.maps_pack = 0;
						if (self.player.is_master === 1) {
							self.room.map = -1;
							self.room.RoomUpdate(self);
						}

						self.sendMessage(new Message.loginResponse(self));
					} else if (item == 895) {
						self.gameserver.db.DeleteAvatarX(self.player.user_id, 4).then(() => {});
						self.player.mobile_fox = 0;
						self.player.mobile = 0;
						self.gameserver.pushToRoom(self.room.id, new Message.changedMobile(self));
						self.sendMessage(new Message.loginResponse(self));
					}
				}).catch(function(err) {
					console.log("error :)");
				})
				self.gameserver.db.deleteAvatarById(id).then(function(data) {
					if (data.error_mysql || data.error_querry) {} else {
						self.gameserver.db.getPlayerAvatars(self).then(function(data) {
							if (data.error_mysql || data.error_querry) {} else {
								var dat = self.gameserver.avatars.getAvatarDataList(data.data_list);
								self.sendMessage(new Message.myAvatars(self, dat));
							}
						});
						self.send([40, 78]);
					}
				});

				break;
			}
			case Types.CLIENT_OPCODE.quick_join:
				{
					// seguridad
					if (!self.login_complete) {
						console.log("login incomplete",opcode);self.connection.close();
						return null;
					}
					var data_room = [];
					//Logger.normal("Room Number: "+self.player.room_number);
					if (self.player.room_number === 0) {
						//Logger.normal("Entro al codigo de Quick Join");
						self.gameserver.forEachRooms(function (roomss) {
							//Logger.normal("Date Room: "+JSON.stringify(roomss));
							if (roomss.status === Types.ROOM_STATUS.WAITING) {
								if (roomss.player_count < roomss.max_players && roomss.status === Types.ROOM_STATUS.WAITING) {
									data_room.push([
										roomss.id
									]);
								}
							}
						});
						var room_random = data_room [ Math.floor ( Math.random() * data_room.length )];
						//Logger.info("Mi Sala Random es: "+room_random);
						self.gameserver.getRoomById(parseInt(room_random), function (room) {
							if (room) {
                                if (room.player_count < room.max_players && room.status === Types.ROOM_STATUS.WAITING && !room.team_a[self.user_id] && !room.team_b[self.user_id]) {
									if (room.password === "") {
										room.joinPlayer(self);
										self.location_type = Types.LOCATION.ROOM;
										self.player.room_number = room.id;
										return null;
									}
								}
							}
						});
					}
					
					break;
				}
            case Types.CLIENT_OPCODE.use_exitem:
            {
                    if (!self.login_complete) {
                        console.log("login incomplete",opcode);self.connection.close();
                        return null;
                    }
                   // console.log(message[1],self.player.lucky_egg,self.player.lucky_egg_sec_left,Date.now());
                    if(message[1]==="lucky_egg"){
                        self.gameserver.db.getLuckyEggs(self.user_id,function(lucky_eggs){
                          if(!lucky_eggs > 0)
                            return false;
                          self.gameserver.db.reduceLuckyEgg(self.user_id,function(){
                            if(self.lucky_egg_left() > 0){
                              self.lucky_egg_sec_left += 3.6e+6;
                            } else {
                              self.lucky_egg_start = Date.now();
                              self.lucky_egg_sec_left = 3.6e+6;
                            }
                            /*var lucky_egg_finish = self.player.lucky_egg-Date.now() > 0 ? parseInt(self.player.lucky_egg)+36e+5 : Date.now()+36e+5;
                            self.gameserver.db.updateLuckyEggFinish(lucky_egg_finish, self.player.user_id);
                            self.player.lucky_egg_sec_left -= 1;
                            self.player.lucky_egg = lucky_egg_finish;*/
                            if(!(lucky_eggs-1 > 0)){
                              self.gameserver.db.removeLuckyEgg(self.user_id,function(){
                                self.sendMessage(new Message.loginResponse(self));
                                self.gameserver.db.getPlayerAvatars(self).then(function (data) {
                                    if (data.error_mysql || data.error_querry) {} else {
                                        var dat = self.gameserver.avatars.getAvatarDataList(data.data_list);
                                        self.sendMessage(new Message.myAvatars(self, dat));
                                    }
                                });
                              });
                            } else {
                              self.sendMessage(new Message.loginResponse(self));
                              self.gameserver.db.getPlayerAvatars(self).then(function (data) {
                                  if (data.error_mysql || data.error_querry) {} else {
                                      var dat = self.gameserver.avatars.getAvatarDataList(data.data_list);
                                      self.sendMessage(new Message.myAvatars(self, dat));
                                  }
                              });                                
                            }

                          });

                        });
                    }
                    break;
            }             
			case Types.CLIENT_OPCODE.equip: {
				// seguridad
				if (!self.login_complete) {
					console.log("login incomplete",opcode);self.connection.close();
					return null;
				}
				let arr_up = message[1];
				let work = false;
				for (var idx in arr_up) {
					if (typeof (arr_up[idx]) !== 'number') {
						return null;
					}
				}
				if (arr_up.length > 0)
					work = true;
				if (self.player.gender === 'm') {
					self.player.ahead = 1;
					self.player.abody = 2;
				} else {
					self.player.ahead = 3;
					self.player.abody = 4;
				}
				self.player.aeyes = 0;
				self.player.aflag = 0;
				self.player.abackground = 0;
				self.player.aforeground = 0;
				if (work) {
					self.gameserver.db.equipAvatar(arr_up, self).then(function (data) {
						if (data.error_mysql || data.error_querry) {} else {
							if (self.room) {
								self.gameserver.pushToRoom(self.room.id, new Message.roomPlayers(self.room), null);
							}
							self.sendMessage(new Message.loginResponse(self));
							self.player.avaDelayOne		= 0;
							self.player.avaDelayTwo		= 0;
							self.player.avaGold			= 0;
							self.player.avaScratch		= 0;
							self.player.avaLife			= 0;
							self.player.avaGuard		= 0;
							self.player.avaAttack		= 0;
							self.player.avaShieldRegen	= 0;
							self.player.updateAva([data.data.head,data.data.body,data.data.eyes,data.data.flag,data.data.background,data.data.foreground]);
							self.gameserver.sendAccountsOnline();
						}
					});
				} else {
					if (self.room) {
						self.gameserver.pushToRoom(self.room.id, new Message.roomPlayers(self.room), null);
					}
					self.sendMessage(new Message.loginResponse(self));
					self.gameserver.sendAccountsOnline();
					self.gameserver.db.defaultAvatars(self.player.reg_id, self.player.ahead, self.player.abody)
					self.player.avaDelayOne		= 0;
					self.player.avaDelayTwo		= 0;
					self.player.avaGold			= 0;
					self.player.avaScratch		= 0;
					self.player.avaLife			= 0;
					self.player.avaGuard		= 0;
					self.player.avaAttack		= 0;
					self.player.avaShieldRegen	= 0;
					self.player.updateAva([self.player.ahead,self.player.abody]);
				}
				break;
			}

			case Types.CLIENT_OPCODE.event: {
				var self = this;
				if (!self.login_complete) {
					console.log("login incomplete",opcode);self.connection.close();
					return null;
				}
				let type = message[1];
				var data = [];
				if (type !== 0 && type !== 3) {
					return null;
					self.sendMessage(new Message.loginResponse(self));
				}
				let giftEvent = {
					event1: {
						cash: 400,
						gold: 2000
					},
					event2: {
						cash: 800,
						gold: 3500
					}
				};
				self.gameserver.db.getEventLogByIdAcc(self.player.user_id).then(function(e) {
					let ex = e[0][0];

					if (type === 0) {

						if ((ex.Event1 - (Date.now() / 1000)) > 0) {
							self.player.event1 = (ex.Event1 - (Date.now() / 1000)) < 0 ? 0 : (ex.Event1 - (Date.now() / 1000));
							self.sendMessage(new Message.loginResponse(self));
							return null;
						} else {
							let ti = (Date.now() / 1000) + (4 * 3600);
							self.player.cash += giftEvent.event1.cash;
							self.player.gold += giftEvent.event1.gold;

							self.player.event1 = (ti - (Date.now() / 1000)) < 0 ? 0 : (ti - (Date.now() / 1000));
							self.gameserver.db.eventS(1, ti, self.player.user_id).then(function(e) {}).catch(function(err) {
								//console.log("err")
							});
							self.gameserver.db.updateGoldCashEventByIdAcc(giftEvent.event1.gold, giftEvent.event1.cash, self.player.user_id);
							self.sendMessage(new Message.alert2Response(Types.ALERT2_TYPES.WON_EVENT1, [giftEvent.event1.cash, giftEvent.event1.gold, data]));
							self.sendMessage(new Message.loginResponse(self));
						}
					} else {
						if ((ex.Event2 - (Date.now() / 1000)) > 0) {
							self.player.event2 = (ex.Event2 - (Date.now() / 1000)) < 0 ? 0 : (ex.Event2 - (Date.now() / 1000));
							self.sendMessage(new Message.loginResponse(self));
							return null;
						} else {
							let ti2 = (Date.now() / 1000) + (24 * 3600);
							self.player.cash += giftEvent.event2.cash;
							self.player.gold += giftEvent.event2.gold;
							self.player.event2 = (ti2 - (Date.now() / 1000)) < 0 ? 0 : (ti2 - (Date.now() / 1000));
							self.gameserver.db.eventS(2, ti2, self.player.user_id).then(function(e) {}).catch(function(err) {
								//console.log("err")
							});
							self.gameserver.db.updateGoldCashEventByIdAcc(giftEvent.event2.gold, giftEvent.event2.cash, self.player.user_id);
							self.sendMessage(new Message.alert2Response(Types.ALERT2_TYPES.WON_EVENT2, [giftEvent.event2.cash, giftEvent.event2.gold, data]));
							self.sendMessage(new Message.loginResponse(self));
						}
					}




				}).catch(function(err) {
					console.log("error!");
				});
				break;
			}

			case Types.CLIENT_OPCODE.change_name:
				{
					// seguridad
					if (!self.login_complete) {
						console.log("login incomplete",opcode);self.connection.close();
						return null;
					}
					var fuck = false;
					var _nname = message[1];
					if ((_nname.length > 0 && _nname.length <= 25) === false) {
						return null;
					}

					if (ignoreCase.startsWith(_nname, " ")) {
						self.sendMessage(new Message.alert2Response(Types.ALERT2_TYPES.NAME_BAD_CHAR, []));
						return null;
					}

					if (ignoreCase.endsWith(_nname, " ")) {
						self.sendMessage(new Message.alert2Response(Types.ALERT2_TYPES.NAME_BAD_CHAR, []));
						return null;
					}

					if (ignoreCase.startsWith(_nname, "GM") || ignoreCase.startsWith(_nname, "BattleFunny")) {
						fuck = true;
					}

					if (!fuck) {
						for (let i = 0; i < Types.GAME_ID.length; i++) {
							if (ignoreCase.equals(_nname, Types.GAME_ID[i])) {
								//fuck = true;
								self.sendMessage(new Message.alertResponse("Prohibited", "you are prohibited from changing your game nickname"));
								return null;
							}
						}
					}
					if (self.player.gm === 1)
						fuck = false;
					if (fuck) {
						self.sendMessage(new Message.alert2Response(Types.ALERT2_TYPES.NAME_BAD_CHAR, []));
					} else if (_nname.length < 25) {
						//if (self.player.user_id === 99) {
						//    self.sendMessage(new Message.alertResponse("Prohibited", "you are prohibited from changing your game nickname"));
						//    return null;
						//}
						self.gameserver.db.changeName(_nname, self)
							.then(function (data) {
								if (data.change) {
									self.player.game_id = _nname;
									self.sendMessage(new Message.loginResponse(self));
									self.gameserver.sendAccountsOnline();
								}
							}).catch(function (data) {
								if (data.error_mysql || data.error_querry) {
									self.sendMessage(new Message.alert2Response(Types.ALERT2_TYPES.NAME_BAD_CHAR, []));
								} else if (data.error_exist) {
									self.sendMessage(new Message.alert2Response(Types.ALERT2_TYPES.NAME_ALREADY_EXISTS, []));
								} else if (data.error_cash) {
									self.sendMessage(new Message.alert2Response(Types.ALERT2_TYPES.NAME_NOT_ENOUGH_CASH, []));
								}
							});
					} else {
						self.sendMessage(new Message.alert2Response(Types.ALERT2_TYPES.NAME_BAD_LEN, []));
					}
					break;
				}

			case Types.CLIENT_OPCODE.tab:
				{
					// seguridad
					if (!self.login_complete) {
						/*self.connection.close();
						return null;*/
						var trys =0;
						var check_ready = function(){
						  if(trys<400)
						  self.login_complete ? (self.Handler(arguments)) : (setTimeout(check_ready,10),trys++);
						}
						check_ready();
						return null;
					}
					let slot = message[1];
					if (slot === 0) {
						//channel
					} else if (slot === 1) {
						self.gameserver.db.getFriendsByIdyo(self.player.user_id).then(function (rows) {
							var my_friends = rows[0];
							var my_friends_x2 = [];
							var dato_frind = "";
							for (var ix in my_friends) {
								var friend_room = 0;
								if (my_friends[ix].IsOnline !== 0) {
									if (self.gameserver.id === my_friends[ix].IsOnline) {
										var my_friend_room = self.gameserver.getAccountById(parseInt(my_friends[ix].IdAcc));
										if (typeof (my_friend_room) !== 'undefined') {
											friend_room = my_friend_room.player.room_number;
										} else {
											friend_room = 0;
										}
									} else {
										friend_room = 0;
									}
								} else {
									friend_room = 0;
								}
								var fserver = 0;
								let account = self.gameserver.searchAccountById(my_friends[ix].IdAcc);
								if(account!==null){
									fserver = account.gameserver.id;
								}
								dato_frind = [
									my_friends[ix].IdAcc,
									my_friends[ix].gp,
									my_friends[ix].game_id,
									my_friends[ix].photo_url,
									"b"+my_friends[ix].rank+"c"+fserver+"d"+friend_room
								];
								my_friends_x2.push(dato_frind);
							}
							//self.sendMessage(new Message.loginResponse(self));
							self.send([Types.SERVER_OPCODE.friends, my_friends_x2, self.gameserver.id, parseInt(my_friends.length + 1)]);
						}).catch(function () {
							self.send([Types.SERVER_OPCODE.friends, [], self.gameserver.id, 1]);
						});
					} else if (slot === 2) {
						if (self.player.guild !== '') {
							self.gameserver.db.getGuildMembersById(self.player.guild_id).then(function (rows) {
								var my_members = rows[0];
								var my_memberss_x2 = [];
								var dato_member = "";
								my_memberss_x2.push(self.player.guild);
								my_memberss_x2.push(self.player.guild_job);
								for (var ixx in my_members) {
									var member_room = 0;
									var member_server = my_members[ixx].IsOnline;
									if (my_members[ixx].IsOnline !== 0) {
										if (self.gameserver.id === my_members[ixx].IsOnline) {
											member_server = -1;
											var my_friend_room = self.gameserver.getAccountById(parseInt(my_members[ixx].IdAcc));
											if (typeof (my_friend_room) !== 'undefined') {
												member_room = my_friend_room.player.room_number;
											} else {
												member_room = 0;
											}
										} else {
											member_room = 0;
											//member_server = my_members[ixx].IsOnline;
											let account = self.gameserver.searchAccountById(my_members[ixx].IdAcc);
											if (account !== null) {
												member_server = account.gameserver.id;
											}
										}
									} else {
										member_room = 0;
										//member_server = my_members[ixx].IsOnline;
										let account = self.gameserver.searchAccountById(my_members[ixx].IdAcc);
										if (account !== null) {
											member_server = account.gameserver.id;
										}
									}
									dato_member = [
										my_members[ixx].IdAcc,
										my_members[ixx].game_id,
										my_members[ixx].gender,
										my_members[ixx].rank,
										my_members[ixx].gp,
										my_members[ixx].photo_url,
										member_server,
										member_room
									];
									my_memberss_x2.push(dato_member);
								}
								//self.sendMessage(new Message.loginResponse(self));
								self.send([Types.SERVER_OPCODE.guild, my_memberss_x2]);
							}).catch(function () {
								self.send([Types.SERVER_OPCODE.guild]);
							});
						} else {
							self.send([Types.SERVER_OPCODE.guild]);
						}
					}
					break;
				}
			case Types.CLIENT_OPCODE.guild_create:
				{
					// seguridad
					if (!self.login_complete) {
						console.log("login incomplete",opcode);self.connection.close();
						return null;
					}
					let gname = message[1];
					var info_prix = ArrayToObject(self.player.tournament, "start_time end_time players avatar_on max_wind force_mobile name total_games last_5_minutes_games rooms maps game_mode s1 tp save_personal save_guild min_points different_mobiles gifts gp_event turn_time".split(" "));
					if (self.player.guild !== '') {
						self.sendMessage(new Message.alert2Response(Types.ALERT2_TYPES.ALREADY_IN_GUILD, []));
					} else if (info_prix.players === 7 && this.tournament_start_time_server <= Date.now() && this.tournament_end_time_server >= Date.now()) {
						self.sendMessage(new Message.alert2Response(Types.ALERT2_TYPES.GUILDS_LOCK, []));
						return null;
					} else if (gname.length >= 3 && gname.length <= 6) {
						gname = mysql.escape(gname).replace("'", "").replace("'", "");
						if (/\s/g.test(gname) === true) {
							self.sendMessage(new Message.alert2Response(Types.ALERT2_TYPES.GUILD_NAME_BAD_WORD, []));
							return null;
						}
						if ((self.player.gold >= 500000) === false) {
							self.sendMessage(new Message.alert2Response(Types.ALERT2_TYPES.GUILD_NO_MONEY, []));
							return null;
						}
						self.gameserver.db.createGuild(gname, self)
							.then(function (data) {
								self.sendMessage(new Message.alert2Response(Types.ALERT2_TYPES.GUILD_CREATED, []));
								self.sendMessage(new Message.loginResponse(self));
								/* =================================================================== */
								self.gameserver.db.getGuildMembersById(self.player.guild_id).then(function (rows) {
									var my_members = rows[0];
									var my_memberss_x2 = [];
									var dato_member = "";
									my_memberss_x2.push(self.player.guild);
									my_memberss_x2.push(self.player.guild_job);
									for (var ixx in my_members) {
										var member_room = 0;
										var member_server = my_members[ixx].IsOnline;
										if (my_members[ixx].IsOnline !== 0) {
											if (self.gameserver.id === my_members[ixx].IsOnline) {
												member_server = -1;
												var my_friend_room = self.gameserver.getAccountById(parseInt(my_members[ixx].IdAcc));
												if (typeof (my_friend_room) !== 'undefined') {
													member_room = my_friend_room.player.room_number;
												} else {
													member_room = 0;
												}
											} else {
												member_room = 0;
												member_server = my_members[ixx].IsOnline;
											}
										} else {
											member_room = 0;
											member_server = my_members[ixx].IsOnline;
										}
										dato_member = [
											my_members[ixx].IdAcc,
											my_members[ixx].game_id,
											my_members[ixx].gender,
											my_members[ixx].rank,
											my_members[ixx].gp,
											my_members[ixx].photo_url,
											member_server,
											member_room
										];
										my_memberss_x2.push(dato_member);
									}
									self.sendMessage(new Message.loginResponse(self));
									self.send([Types.SERVER_OPCODE.guild, my_memberss_x2]);
								}).catch(function () {
									self.send([Types.SERVER_OPCODE.guild]);
								});
							/* =================================================================== */
							})
							.catch(function (data) {
								if (data.error_mysql || data.error_querry) {
									self.sendMessage(new Message.alert2Response(Types.ALERT2_TYPES.GUILD_NAME_BAD_WORD, []));
								} else if (data.error_exist) {
									self.sendMessage(new Message.alert2Response(Types.ALERT2_TYPES.GUILD_ALREADY_EXISTS, []));
								}
							});
					} else {
						self.sendMessage(new Message.alert2Response(Types.ALERT2_TYPES.GUILD_BAD_NAME_LEN, []));
					}
					break;
				}
			case Types.CLIENT_OPCODE.guildinvite:
				{
					// seguridad
					if (!self.login_complete) {
						console.log("login incomplete",opcode);self.connection.close();
						return null;
					}
					let id = parseInt(message[1]);
					var acc = self.gameserver.getAccountById(id);
					var info_prix = ArrayToObject(self.player.tournament, "start_time end_time players avatar_on max_wind force_mobile name total_games last_5_minutes_games rooms maps game_mode s1 tp save_personal save_guild min_points different_mobiles gifts gp_event turn_time".split(" "));
					if (info_prix.players === 7 && this.tournament_start_time_server <= Date.now() && this.tournament_end_time_server >= Date.now()) {
						self.sendMessage(new Message.alertResponse("Lo sentimos", "Esta opción del Guild esta bloqueada durante el torneo. Inténtalo mas tarde."));
						return null;
					} else {
						self.sendMessage(new Message.alert2Response(Types.ALERT2_TYPES.GUILD_INVITE_SENT, [acc.player.game_id]));
						if (acc) {
							if (acc.player.guild === '') {
								acc.sendMessage(new Message.GuildreqResponse(self));
							}
						}
					}
					break;
				}
			case Types.CLIENT_OPCODE.guild_approved:
				{
					// seguridad
					if (!self.login_complete) {
						console.log("login incomplete",opcode);self.connection.close();
						return null;
					}
					let id = parseInt(message[1]);
					if (self.player.guild === '') {
						self.gameserver.db.joinGuild(self, id)
							.then(function (data) {
								if (data.good) {
									self.sendMessage(new Message.alert2Response(Types.ALERT2_TYPES.JOINED_GUILD, []));
									if (self.room) {
										self.gameserver.pushToRoom(self.room.id, new Message.roomPlayers(self.room), null);
									}
								}
							})
							.catch(function (data) {
								if (data.error_mysql || data.error_querry) {} else if (data.error_exist) {}
							});
					}
					break;
				}
			case Types.CLIENT_OPCODE.guild_leave:
				{
					// seguridad
					if (!self.login_complete) {
						console.log("login incomplete",opcode);self.connection.close();
						return null;
					}
					
					var info_prix = ArrayToObject(self.player.tournament, "start_time end_time players avatar_on max_wind force_mobile name total_games last_5_minutes_games rooms maps game_mode s1 tp save_personal save_guild min_points different_mobiles gifts gp_event turn_time".split(" "));
					
					if (info_prix.players === 7 && this.tournament_start_time_server <= Date.now() && this.tournament_end_time_server >= Date.now()) {
						self.sendMessage(new Message.alertResponse("Lo sentimos", "Esta opción del Guild esta bloqueada durante el torneo. Inténtalo mas tarde."));
						return null;
					}
					
					
					if (self.player.guild !== '' && self.player.guild_job === 0 || self.player.guild !== '' && self.player.guild_job === 2) {
						self.gameserver.db.leaveGuild(self.player.user_id)
							.then(function (data) {
								if (data.complete) {
									self.player.guild = '';
									self.player.guild_job = 0;
									self.player.guild_id = 0;
									if (self.room) {
										self.gameserver.pushToRoom(self.room.id, new Message.roomPlayers(self.room), null);
									} else {
										self.sendMessage(new Message.loginResponse(self));
										self.sendMessage(new Message.alert2Response(Types.ALERT2_TYPES.LEFT_GUILD, []));
									}
									self.gameserver.sendAccountsOnline();
								}
							})
							.catch(function (data) {
								if (data.error_mysql || data.error_querry) {}
							});
					}
					if (self.player.guild_job === 1) {
						self.gameserver.db.DeleteNameGuild(self.player.guild, self.player.guild_id)
							.then(function (data) {
								if (data.complete) {
									self.player.guild = '';
									self.player.guild_job = 0;
									self.player.guild_id = 0;
									if (self.room) {
										self.gameserver.pushToRoom(self.room.id, new Message.roomPlayers(self.room), null);
									} else {
										self.sendMessage(new Message.loginResponse(self));
										self.sendMessage(new Message.alert2Response(Types.ALERT2_TYPES.CLOSED_GUILD, []));
									}
									self.gameserver.sendAccountsOnline();
								}
							})
							.catch(function (data) {
								if (data.error_mysql || data.error_querry) {}
							});
					}
					break;
				}
			case Types.CLIENT_OPCODE.guild_kick:
				{
					// seguridad
					if (!self.login_complete) {
						console.log("login incomplete",opcode);self.connection.close();
						return null;
					}
					let guser_id = parseInt(message[1]);
					var info_prix = ArrayToObject(self.player.tournament, "start_time end_time players avatar_on max_wind force_mobile name total_games last_5_minutes_games rooms maps game_mode s1 tp save_personal save_guild min_points different_mobiles gifts gp_event turn_time".split(" "));
					
					if (info_prix.players === 7 && this.tournament_start_time_server <= Date.now() && this.tournament_end_time_server >= Date.now()) {
						self.sendMessage(new Message.alertResponse("Lo sentimos", "Esta opción del Guild esta bloqueada durante el torneo. Inténtalo mas tarde."));
						return null;
					}
					
					
					if (self.user_id === guser_id) {
						self.sendMessage(new Message.alert2Response(Types.ALERT2_TYPES.CANT_KICK_YOURSELF, []));
					} else if (self.player.guild !== '' && self.player.guild_job === 1) {
						self.gameserver.db.kickGuild(guser_id, self.player.guild_id)
							.then(function (data) {
								if (data.complete) {
									self.sendMessage(new Message.alert2Response(Types.ALERT2_TYPES.KICKED_GUILD, []));
								}
							})
							.catch(function (data) {
								if (data.error_mysql || data.error_querry) {}
							});
					}
					break;
				}
				
			case Types.CLIENT_OPCODE.channel_rooms:
				{
					// seguridad
					if (!self.login_complete) {
						console.log("login incomplete",opcode);self.connection.close();
						return null;
					}
					var _strtype = message[1];
					if (_strtype === 'all') {
						self.gameserver.sendRoomsType(self, 0, null);
					} else if (_strtype === 'waiting') {
						self.gameserver.sendRoomsWait(self, 0, null);
					} else if (_strtype === 'normal') {
						self.gameserver.sendRoomsnormal(self, 0, null);
					} else if (_strtype === 'boss') {
						self.gameserver.sendRoomsboss(self, 0, null);
					} else if (_strtype === 'same') {
						self.gameserver.sendRoomssame(self, 0, null);
					} else if (_strtype === 'score') {
						self.gameserver.sendRoomsscore(self, 0, null);
					} else if (_strtype === "next") {
						self.player.channel_rango = self.player.channel_rango + 6;
						if (self.player.channel_rango > 20)
							self.player.channel_rango = 0;
						//Logger.normal("Channel Rango Room #1: "+self.player.channel_rango);
						self.gameserver.sendRoomsType(self, self.player.channel_rango, null);
					} else if (_strtype === "prev") {
						self.player.channel_rango = self.player.channel_rango - 6;
						if (self.player.channel_rango < 0)
							self.player.channel_rango = 0;
						//Logger.normal("Channel Rango Room #2: "+self.player.channel_rango);
						self.gameserver.sendRoomsType(self, self.player.channel_rango, null);
					}
					break;
				}
				
			/*case Types.CLIENT_OPCODE.channel_rooms:
				{
					// seguridad
					if (!self.login_complete) {
						console.log("login incomplete",opcode);self.connection.close();
						return null;
					}
					var _strtype = message[1];
					if (_strtype === "all" || _strtype === "waiting" || _strtype === "friends" || _strtype === "guild" ||  _strtype === "normal" || _strtype === "boss" || _strtype === "same" || _strtype === "score") {
						self.gameserver.sendRoomsTypeJc(self, 0, _strtype);
					} else if (_strtype === "next") {
						self.player.channel_rango = self.player.channel_rango + 6;
						if (self.player.channel_rango > 20)
							self.player.channel_rango = 0;
						//Logger.normal("Channel Rango Room #1: "+self.player.channel_rango);
						self.gameserver.sendRoomsTypeJc(self, self.player.channel_rango, _strtype);
					} else if (_strtype === "prev") {
						self.player.channel_rango = self.player.channel_rango - 6;
						if (self.player.channel_rango < 0)
							self.player.channel_rango = 0;
						//Logger.normal("Channel Rango Room #2: "+self.player.channel_rango);
						self.gameserver.sendRoomsTypeJc(self, self.player.channel_rango, _strtype);
					}
					break;
				}*/

			case Types.CLIENT_OPCODE.get_room_info:
				{
					// seguridad
					if (!self.login_complete) {
						console.log("login incomplete",opcode);self.connection.close();
						return null;
					}
					let room_id = parseInt(message[1]);
					self.gameserver.getRoomById(room_id, function (room) {
						if (room) {
							self.sendMessage(new Message.extraRoomInfo(room));
						}
					});
					break;
				}

			case Types.CLIENT_OPCODE.getinfo:
				{
					// seguridad
					if (!self.login_complete) {
						console.log("login incomplete",opcode);self.connection.close();
						return null;
					}
					let id = parseInt(message[1]);
					let acc = self.gameserver.getAccountById(id);
					if (acc) {
						self.gameserver.db.getMyFriend(self.player.user_id, acc.player.user_id).then(function (rows) {
							var my_friends = rows[0][0];
							acc.player.is_my_friend = 1;
							self.sendMessage(new Message.InfoResponse(acc));
							//Logger.info("Teste My friend 1");
						}).catch(function () {
							acc.player.is_my_friend = 0;
							self.sendMessage(new Message.InfoResponse(acc));
							//Logger.info("Teste My friend 2");
						});
					}
					break;
				}

            case Types.CLIENT_OPCODE.channel_join:
                {
                    // seguridad
                    if (!self.login_complete) {
                        console.log("login incomplete",opcode);self.connection.close();
                        return null;
                    }
                    self.location_type = Types.LOCATION.CHANNEL;
                    if (self.room) {
                        if(self.room.watchers[self.user_id]){
                            self.room.removeWatcher(self);
                            return null;
                        }
						if (self.room.status !== null && self.room.status == Types.ROOM_STATUS.PLAYING) {
							if (self.gameserver.name === 'Holiday') {
								self.player.gm_probability = 0;
								self.gameserver.db.updateProbability(0, self.player.user_id);
							} else if (self.gameserver.name === 'Prix') {
								self.player.punts_prix_user -= 1;
								self.sendMessage(new Message.loginResponse(self));
								self.gameserver.db.updatePrix(self.player.punts_prix_user, self).then(function (data) {
									if (data.error_mysql || data.error_querry) {} else {
										//Logger.info('You have escaped from the game');
									}
								});
							}
							self.gameserver.db.updateLeftByIdAcc(1500, 5, 1, self.player.user_id);
							//Logger.info('User: '+self.player.game_id+' has left the Room: '+self.room_number);
							/*if (self.room.game) {
								if (self.room.player_count === 2) {
									self.room.game.checkDead();
								} else if (self.room.player_count > 2) {
									self.room.game.gamePass(self);
								}
							}*/
							//self.gameserver.pushBroadcastChat(new Message.chatResponse(self, "Player "+self.player.game_id+" left the room.", Types.CHAT_TYPE.SYSTEM), self.room);
							//self.gameserver.pushBroadcastChat(new Message.chatResponse(self, "Winning Bonus: Team A = %% GP, Team B = %% GP.", Types.CHAT_TYPE.SYSTEM), self.room);
						}
						self.room.removePlayer(self);
						self.sendMessage(new Message.loginResponse(self));
						self.player.is_ready = 0;
						self.player.is_master = 0;
						self.player.room_number = 0;/*mirar*/
					}
					self.gameserver.sendAccountsOnline();
					if (self.gameserver.server_subtype !== 3) {
						/*self.gameserver.forEachAccount(function (account_rooms) {
							if (account_rooms !== null) {
								account_rooms.gameserver.sendRooms(account_rooms);
								account_rooms.sendMessage(new Message.loginResponse(account_rooms));
							}
						});*/
						self.gameserver.sendRooms(self);
						if (self.player.random_mobil === parseInt(1)) {
							self.player.mobile = Types.MOBILE.RANDOM;
						}
					}
					self.player.room_number = 0;
					self.sendMessage(new Message.loginResponse(self));
					break;
				}
			case Types.CLIENT_OPCODE.room_watch:
				{
					// seguridad
					if (!self.login_complete) {
						console.log("login incomplete",opcode);self.connection.close();
						return null;
					}
					let room_id =  message[1];
					self.gameserver.getRoomById(room_id,function(room){
						if(room){
							room.joinWatcher(self);
						} else {
							self.sendMessage(new Message.alert2Response(Types.ALERT2_TYPES.ROOM_DOES_NOT_EXIST, []));
						}
					});
					break;
				}
			case Types.CLIENT_OPCODE.room_join:
				{
					// seguridad
					if (!self.login_complete) {
						console.log("login incomplete",opcode);self.connection.close();
						return null;
					}
					let id = message[1];
					let password = message[2];
					if(self.room!=undefined)
						return false;
					var info_prix = ArrayToObject(self.player.tournament, "start_time end_time players avatar_on max_wind force_mobile name total_games last_5_minutes_games rooms maps game_mode s1 tp save_personal save_guild min_points different_mobiles gifts gp_event turn_time".split(" "));
					self.gameserver.getRoomById(id, function (room) {
						if (room) {
							if (room.search_team_room === 1 && room.player_count >= 4) {
								self.sendMessage(new Message.alert2Response(Types.ALERT2_TYPES.ROOM_FULL, []));
								return null;
							} else if (room.search_team_room === 1 && room.room_tournament_playing === 1) {
								self.sendMessage(new Message.alert2Response(Types.ALERT2_TYPES.ROOM_PLAYING, []));
								return null;
							} else if (typeof (room.kick_user_time[parseInt(self.player.user_id)]) !== 'undefined') {
								if (parseInt(room.kick_user_time[self.player.user_id].expiry) >= Date.now()) {
									self.sendMessage(new Message.alert2Response(Types.ALERT2_TYPES.KICKED, [ parseInt( secondsremaining(room.kick_user_time[parseInt(self.player.user_id)].expiry) ) ]));
									var delete_kick = setTimeout(function () {
										delete room.kick_user_time[parseInt(self.player.user_id)];
										delete_kick = null;
									}, parseInt( Math.round(secondsremaining(room.kick_user_time[parseInt(self.player.user_id)].expiry) * 1000) ) );
									return null;
								}
                            } else if (room.player_count < room.max_players && room.status === Types.ROOM_STATUS.WAITING && !room.findPlayer(self.user_id)) {
								if (room.look === 1 && self.player.rank !== 26 && self.player.rank !== 27 && self.player.rank !== 31) {
									if (room.password !== password)
										self.sendMessage(new Message.alert2Response(Types.ALERT2_TYPES.WRONG_PASSWORD, []));
									else {
										if (room.game_mode === Types.GAME_MODE.SAME) {
											var mobile_same = 0;
											room.forPlayers(function (accountjc) {
												if (accountjc !== null) {
													if (accountjc.player.is_master === 1) {
														mobile_same = accountjc.player.mobile;
													}
												}
											});
											self.player.mobile = mobile_same;
										}
										room.joinPlayer(self);
										self.location_type = Types.LOCATION.ROOM;
										self.player.room_number = room.id;
									}
								} else {
									if (room.game_mode === Types.GAME_MODE.SAME) {
										var mobile_same = 0;
										room.forPlayers(function (accountjc) {
											if (accountjc !== null) {
												if (accountjc.player.is_master === 1) {
													mobile_same = accountjc.player.mobile;
												}
											}
										});
										self.player.mobile = mobile_same;
									}
									room.joinPlayer(self);
									self.location_type = Types.LOCATION.ROOM;
									self.player.room_number = room.id;
									if (self.gameserver.name === 'Guilds Prix') {
										if (info_prix.force_mobile !== -1 || info_prix.force_mobile !== -2) {
											self.player.mobile = info_prix.force_mobile;
										}
									}
								}
							} else if (room.status === Types.ROOM_STATUS.PLAYING) {
								self.sendMessage(new Message.alert2Response(Types.ALERT2_TYPES.ROOM_PLAYING, []));
							} else {
								self.sendMessage(new Message.alert2Response(Types.ALERT2_TYPES.ROOM_FULL, []));
								/*self.sendMessage(new Message.alert2Response(Types.ALERT2_TYPES.CANT_JOIN_NEED_AVATAR, ['Rusia 2018']));*/
								if (self.player.rank === 26 || self.player.rank === 27 || self.player.rank === 31) {
									if (room.game_mode === Types.GAME_MODE.SAME) {
										var mobile_same = 0;
										room.forPlayers(function (accountjc) {
											if (accountjc !== null) {
												if (accountjc.player.is_master === 1) {
													mobile_same = accountjc.player.mobile;
												}
											}
										});
										self.player.mobile = mobile_same;
									}
									room.joinPlayer(self);
									self.location_type = Types.LOCATION.ROOM;
									self.player.room_number = room.id;
								}
							}
						} else {
							self.sendMessage(new Message.alert2Response(Types.ALERT2_TYPES.ROOM_DOES_NOT_EXIST, []));
						}
					});
					break;
				}
			case Types.CLIENT_OPCODE.room_create:
				{
					// seguridad
					if (!self.login_complete) {
						console.log("login incomplete",opcode);self.connection.close();
						return null;
					}
					self.ip_actions[ip].actions.push(Date.now());
                    if(self.room)
                        return null;
                    /*if ((self.player.rank >= 27) === false) {
                        return null;
                    }*/

					let id = self.gameserver.getIdforRoom();
					//self.player.room_number = id;/* MIRAR */
					let title = message[1];
					let password = message[2];
					let maxplayers = message[3];
					let gamemode = message[4];
					self.gameserver.rooms[id] = new Room(id, title, password, maxplayers, gamemode, self.gameserver);
					self.gameserver.getRoomById(id, function (room) {
						if (room) {
							if (room.player_count < room.max_players) {
								self.player.is_master = 1;
								room.joinPlayer(self);
								self.player.room_number = room.id;
								self.location_type = Types.LOCATION.ROOM;
								if (self.gameserver.server_subtype !== 3)
									self.gameserver.sendRooms();
								if (self.player.power_user === 1)
									room.power = 1;
							}
						} else {
							self.sendMessage(new Message.alert2Response(Types.ALERT2_TYPES.ROOM_DOES_NOT_EXIST, []));
						}
					});
					break;
				}
			case Types.CLIENT_OPCODE.room_options:
				{
					// seguridad
					if (!self.login_complete) {
						console.log("login incomplete",opcode);self.connection.close();
						return null;
					}
					let chang_rom = false;
					if (self.room) {
						if (self.room.search_team_room === 1) {
							return null;
						}
						if (self.player.is_master = 1) {
							self.room.max_players = message[1];
							chang_rom = true;
							if (self.room.player_count < self.room.max_players) {
								self.room.status = Types.ROOM_STATUS.WAITING;
								chang_rom = true;
								if (self.gameserver.server_subtype !== 3)
									self.gameserver.sendRooms();
							}
							if (self.room.player_count >= self.room.max_players) {
								self.room.status = Types.ROOM_STATUS.FULL;
								chang_rom = true;
								if (self.gameserver.server_subtype !== 3)
									self.gameserver.sendRooms();
							}
							self.room.game_mode = message[2];
							chang_rom = true;
							self.room.map = message[3];
							self.room.is_avatars_on = message[4];
							self.room.max_wind = message[5];
							self.room.is_s1_disabled = message[7];/*6*/
							self.room.is_tele_disabled = message[8];/*7*/
							self.room.is_random_teams = message[9];/*8*/
							self.room.is_dual_plus_disabled = message[10];/*9*/
							self.room.turn_time = message[11];
							self.room.room_for_sale = message[12];
							self.room.allow_watch = message[13];
							self.room.allow_talk = message[14];
							if (self.gameserver.server_subtype !== 3)
								self.gameserver.sendRooms();
							//Logger.debug("room_options: " + message);
							//Logger.debug("Avatars: " + message[4]);
							if (self.room.game_mode === Types.GAME_MODE.BOSS) {
								if (self.room.player_count <= 4) {
									self.room.forPlayers(function (account) {
										if (account.player.team === 1 && account.player.is_bot === 0) {
											account.room.ChangeTeamBoss(account);
										}
									});
								} else {
									self.sendMessage(new Message.alert2Response(Types.ALERT2_TYPES.CANT_BOSS_PLAYERS, []));
								}
							}
							self.room.RoomUpdate(self);
						}
					}
						break;
				}
			case Types.CLIENT_OPCODE.tournament_start_game:
				{
					// seguridad
					if (!self.login_complete) {
						console.log("login incomplete",opcode);self.connection.close();
						return null;
					}
					
					var info_prix = ArrayToObject(self.player.tournament, "start_time end_time players avatar_on max_wind force_mobile name total_games last_5_minutes_games rooms maps game_mode s1 tp save_personal save_guild min_points different_mobiles gifts gp_event turn_time".split(" "));
					
					var unk1 = message[1];
					var mobile_prix = info_prix.force_mobile;//info_prix.force_mobile
					if (info_prix.force_mobile === -1 || info_prix.force_mobile === -2) {
						mobile_prix = message[2];
					}
					//Logger.info('Mobile Prix: '+mobile_prix);
					let id_bot = parseInt(getRndInteger(80000, 80500));
					
					if (typeof (Types.MOBILES[mobile_prix]) != 'undefined' && Types.MOBILES[mobile_prix] !== null) {
						/*if (mobile_prix == Types.MOBILE.DRAGON && self.player.rank !== 31 && self.player.rank !== 26) {
							self.sendMessage(new Message.alertResponse("Non-Selectable Mobile", "You can not select this mobile."));
							return null;
						}*/
						if (mobile_prix == Types.MOBILE.RANDOM) {
							var random_number = parseInt(getRndInteger(0, 6));
							if (random_number === 7)
								random_number = 26;
							mobile_prix = random_number;
						}
						self.player.mobile = mobile_prix;
					}
					
					if (self.gameserver.name === 'Guilds Prix') {
						self.sendMessage(new Message.alertResponse("I am sorry", "4v4 Guild vs Guild Games"));
						return null;
					}
					
					if (self.gameserver.name === 'Prix') {
						if (self.player.tournament_start_time_server >= Date.now()) {
							self.sendMessage(new Message.alert2Response(Types.ALERT2_TYPES.TOURNAMENT_NOT_STARTED, []));
							return null;
						}
						if (self.player.tournament_start_time_server <= Date.now() && self.player.tournament_end_time_server <= Date.now()) {
							self.sendMessage(new Message.alert2Response(Types.ALERT2_TYPES.TOURNAMENT_ENDED, []));
							return null;
						}
						if (self.player.punts_prix_user <= info_prix.min_points) {
							self.sendMessage(new Message.alert2Response(Types.ALERT2_TYPES.DISQUALIFIED_PLAYER, [self.player.punts_prix_user, info_prix.min_points]));
							return null;
						}
					}
					
					/*if (self.gameserver.id === 3) {
						if (self.player.cash <= 1499) {
							self.sendMessage(new Message.alertResponse("I am sorry", "You do not have enough cash to start this game. <img class='emo' src='/static/images/emo/sad.png'>"));
							return null;
						}
					}*/
					
					self.player.tournament_wait_game = 1;
					self.send([Types.SERVER_OPCODE.tournament_wait, parseInt(getRndInteger(1, 3))]);//self.send([41,parseInt(getRndInteger(1, 3))]);
					//let id = self.gameserver.getIdforRoom();
					//Logger.info("Get ID For Room: "+id);
					if (self.player.tournament_wait_game == 1) {
						/* || *===============[Start of the BOT Computer code]================* || */
						setTimeout(function() {
							if (self.location_type === Types.LOCATION.CHANNEL && self.player.tournament_wait_game == 1 && self.gameserver.id === 2 || self.location_type === Types.LOCATION.CHANNEL && self.player.tournament_wait_game == 1 && self.gameserver.name === "Bunge.") {
								let id = self.gameserver.getIdforRoom();
								self.gameserver.rooms[id] = new Room(id, "(time) BOT Computer (time)", "", 1, 1, self.gameserver);
								//var cant = Types.COMPUTER_PLAYER.length;
                                var __comp = parseInt(getRndInteger(0,11));  
								self.gameserver.getRoomById(id, function (room) {
									if (room) {
										let id = self.gameserver.getIdforBot();
										var bot_data = {
                                        user_id: id,
                                        reg_id: 0,
                                        game_id: Types.COMPUTER_PLAYER[__comp].game_id,
                                        rank: Types.COMPUTER_PLAYER[__comp].rank,
                                        gp: Types.COMPUTER_PLAYER[__comp].gp,
                                        gold: 0,
                                        cash: 0,
                                        gender: Types.COMPUTER_PLAYER[__comp].gender,
                                        photo_url: "",
                                        ahead: Types.COMPUTER_PLAYER[__comp].ahead,
                                        abody: Types.COMPUTER_PLAYER[__comp].abody,
                                        aeyes: Types.COMPUTER_PLAYER[__comp].aeyes,
                                        aflag: Types.COMPUTER_PLAYER[__comp].aflag,
                                        abackground: 0,
                                        aforeground: 0,
                                        is_muted: 0,
                                        guild: Types.COMPUTER_PLAYER[__comp].guild,
                                        guild_id: 0,
                                        guild_job: 0
                                        };var plx = new Player(bot_data);
										plx.is_bot = 1;
										plx.is_ready = 1;
										plx.position = 1;
										plx.mobile = Types.COMPUTER_PLAYER[__comp].mobile;
										plx.scores_lose = 1;
										let acc = new Bot(plx);
										acc.user_id = id;
										acc.gameserver = self.gameserver;
										self.gameserver.bots[acc.user_id] = acc;
										room.addBot(acc);
										/* || *===============[Bot Computer]================* || */
										self.player.is_master = 1;
										room.joinPlayer(self);
										if (room.player_count <= 2) {
											self.location_type = Types.LOCATION.ROOM;
										} else {
											return null;
										}
										self.player.room_number = room.id;
										self.player.tournament_wait_game = 0;
										room.is_avatars_on = parseInt(info_prix.avatar_on);
										room.is_s1_disabled = 0;
										room.is_tele_disabled = 1;
										room.turn_time = info_prix.turn_time;
										room.max_wind = info_prix.max_wind;
										room.frist_turn = 0;
										room.gameStart(self);
									}
								});
								return null;
							}
						}, 5000);
                        /* || *==============[End of the BOT Computer code]=================* || */
                        /* || *===============[Start of the BOT Holiday code]================* || */
                        var endpoints = 4;
                        if (self.player.gm_probability >= endpoints) {
                            endpoints = parseInt(self.player.gm_probability + 4);
                        }
                        let random_probability_holiday = parseInt(getRndInteger(3, endpoints));
						var Santa_Claus_Head = 7201;
						var Santa_Claus_Body = 2019;
						var cash = 10000;
						var Ava_Send = 0;
						//if (self.location_type === Types.LOCATION.CHANNEL && self.player.tournament_wait_game == 1 && self.gameserver.id === 7 || self.location_type === Types.LOCATION.CHANNEL && self.player.tournament_wait_game == 1 && self.gameserver.name === "Bunge.") {
                        if (self.gameserver.name === 'Holiday' && self.player.tournament_wait_game == 1 && self.player.gm_probability === random_probability_holiday/* || self.player.user_id === 1*/) {
                                let id = self.gameserver.getIdforRoom();
                                self.gameserver.rooms[id] = new Room(id, "(party) Halloween 2021 (party)", "", 1, 1, self.gameserver);
                                self.gameserver.getRoomById(id, function (room) {
                                    if (room) {
                                        var bot_data = {user_id: id_bot,reg_id: id_bot,game_id: 'Halloween',rank: 26,gp: 0,gold: 0,cash: 0,gender: "m",photo_url: "1234",ahead: 2713,abody: 2714,aeyes: 812,aflag: 2731,abackground: 0,aforeground: 0,is_muted: 0,guild: '',guild_id: 0,guild_job: 0};
                                        var plx = new Player(bot_data);
                                        plx.is_bot = 1;
                                        plx.is_ready = 1;
                                        plx.position = 1;
                                        plx.mobile = Types.MOBILE.ICE;
                                        plx.scores_lose = 1;
                                        let acc = new Bot(plx);
                                        acc.user_id = id_bot;
                                        acc.gameserver = self.gameserver;
                                        self.gameserver.bots[acc.user_id] = acc;
                                        room.addBot(acc);
                                        /* || *===============[Bot Computer]================* || */
                                        self.player.is_master = 1;
                                        room.joinPlayer(self);
                                        if (room.player_count <= 2) {
                                            self.location_type = Types.LOCATION.ROOM;
                                        } else {
                                            return null;
                                        }
                                        self.player.room_number = room.id;
                                        self.player.tournament_wait_game = 0;
                                        room.is_tele_disabled = 1;
                                        room.max_wind = info_prix.max_wind;
                                        room.frist_turn = 0;
                                        room.gameStart(self);
										room.game.onGameEnd(function (teamm) {
											room.forPlayers(function (accountdbb) {
												if (typeof (accountdbb) !== 'undefined') {
													let playerdbb = accountdbb.player;
													if (teamm === playerdbb.team) {
														playerdbb.is_win = 1;
                                                        accountdbb.saveWinDB(room.power == 1 ? true : false);
                                                        if (accountdbb.scores_lose !== 1) {
                                                            if (accountdbb.user_id >= 80000)
                                                                return null;
                                                            if (playerdbb.gender === 'm') {
                                                                Ava_Send = 7201;
                                                                Santa_Claus_Head = 7201;
                                                                Santa_Claus_Body = 2019;
																cash = 10000;
                                                            } else {
                                                                Ava_Send = 7201;
                                                                Santa_Claus_Head = 7201;
                                                                Santa_Claus_Body = 2019;
																cash = 10000;
                                                            }
															self.gameserver.db.getUserAvatarsByIdAccANDaId(playerdbb.user_id, Ava_Send).then(function (rowss) {
															}).catch(function (err) {
																var name_ava_gift_hd = self.gameserver.avatars.getAvatagift(Santa_Claus_Head);
                                                                var name_ava_gift_bd = self.gameserver.avatars.getAvatagift(Santa_Claus_Body);
																let self2 = self.gameserver.getAccountById(parseInt(playerdbb.user_id));
																
																accountdbb.player.gifts_holiday += 1;
																
																let datasendgift_2 = {UserId: playerdbb.user_id, aId: Santa_Claus_Head, type: 0, expire_time: 0, is_cash: 0, is_gift: 1, gift_sent_by: plx.user_id, amount: 0, date_ava_time: Date.now()};
                                                                self.gameserver.db.putUserAvatars(datasendgift_2);
                                                                let datasendgift_3 = {UserId: playerdbb.user_id, aId: Santa_Claus_Body, type: 0, expire_time: 0, is_cash: 0, is_gift: 1, gift_sent_by: plx.user_id, amount: 0, date_ava_time: Date.now()};
                                                                self.gameserver.db.putUserAvatars(datasendgift_3);
																self.gameserver.db.sendCash(cash, playerdbb.user_id);
																
																self.gameserver.db.updateGiftsByHoliday(2, 1);
																self2.player.cash += cash;
                                                                
                                                                accountdbb.sendMessage(new Message.alert2Response(Types.ALERT2_TYPES.RECEIVED_AVATAR, [plx.game_id, Santa_Claus_Head, 0, "Halloween 2021", "forever", name_ava_gift_hd]));
                                                                accountdbb.sendMessage(new Message.alert2Response(Types.ALERT2_TYPES.RECEIVED_AVATAR, [plx.game_id, Santa_Claus_Body, 0, "Halloween 2021", "forever", name_ava_gift_bd]));
																accountdbb.send([17,"Received Cash! :)","You just received <font color='yellow'>"+cash+"</font> Cash from<br><font color='yellow'>"+accountdbb.game_id+"</font>.<br><br>Thank You!"]);
																
																accountdbb.gameserver.pushBroadcast(new Message.chatResponse(self, plx.game_id+" sent gift -> "+name_ava_gift_hd+" [Flag] to -> "+playerdbb.game_id, Types.CHAT_TYPE.GOLD));
                                                                accountdbb.gameserver.pushBroadcast(new Message.chatResponse(self, plx.game_id+" sent gift -> "+name_ava_gift_bd+" [Background] to -> "+playerdbb.game_id, Types.CHAT_TYPE.GOLD));
																
																self.gameserver.chathistory.push([plx.game_id+" sent gift -> "+name_ava_gift_hd+" [Flag] to -> "+playerdbb.game_id,'',Types.CHAT_TYPE.GOLD,'']);
                                                                self.gameserver.chathistory.push([plx.game_id+" sent gift -> "+name_ava_gift_bd+" [Background] to -> "+playerdbb.game_id,'',Types.CHAT_TYPE.GOLD,'']);
															});
															playerdbb.gm_probability += 1;
                                                            self.gameserver.db.updateProbability(playerdbb.gm_probability, playerdbb.user_id);
                                                        }
                                                    } else {
                                                        playerdbb.is_loss = 1;
                                                        accountdbb.saveWinDB(room.power == 1 ? true : false);
                                                        if (accountdbb.scores_lose !== 1) {
                                                            playerdbb.gm_probability = 0;
                                                            self.gameserver.db.updateProbability(0, playerdbb.user_id);
                                                        }
                                                    }
												}
											});
											room.game = null;
                                            room.status = Types.ROOM_STATUS.WAITING;
                                            room.gameserver.pushToRoom(room.id, new Message.roomPlayers(room));
                                            setTimeout(function() {
                                                self.player.room_number = 0;
                                                self.location_type = Types.LOCATION.CHANNEL;
                                                room.removePlayer(self);
                                                self.sendMessage(new Message.loginResponse(self));
                                                self.player.is_ready = 0;
                                                self.player.is_master = 0;
                                                self.gameserver.sendAccountsOnline();
                                                self.gameserver.removeRoom(room.id);
                                                self.gameserver.forEachAccount(function (accounttp) {
                                                    if (accounttp !== null && accounttp.player.user_id === self.player.user_id) {
                                                        var data_game_server = self.gameserver.chathistory.slice(0);
                                                        data_game_server.push(['', '', 9]);
                                                        if (self.gameserver.evento200 === true)
                                                            data_game_server.push([' El porcentaje de GP & Gold cambiaron a 200%', '[Inicio de Evento', 17]);
                                                        if (self.gameserver.id === 2) {
                                                            data_game_server.push([' Búscame, gáname y te llevas un regalo: (gift) '+accounttp.player.gifts_holiday+' Regalos enviados (gift)', 'Halloween', 5]);
                                                            data_game_server.push([' Tienes '+accounttp.player.gm_probability+' ganadas seguidas = 200% GP & Gold! Event probabilidad x'+accounttp.player.gm_probability, '', 6]);
                                                        }
                                                        accounttp.send([Types.SERVER_OPCODE.room_state, [0, data_game_server], 1]);
                                                    }
                                                });
                                            }, 1000);
										});
                                    }
                                });
                                return null;
						}
						/* || *==============[End of the BOT Computer code]=================* || */
						self.gameserver.forEachAccount(function (accountp) {
							//let id = self.gameserver.getIdforRoom();
							//Logger.info("Get ID For Room: "+id);
							if (accountp !== null ? accountp.user_id != self.user_id : !1) {
								if (accountp.player.tournament_wait_game == 1 && self.player.tournament_wait_game == 1) {
									if (self.player.computer_ip !== accountp.player.computer_ip) {
										let id = self.gameserver.getIdforRoom();
										if (self.gameserver.name === 'Prix') {
											self.gameserver.rooms[id] = new Room(id, "(party) Prix Individual (trophy)", "", 2, 0, self.gameserver);
										} else {
											self.gameserver.rooms[id] = new Room(id, "Individual", "", 2, 0, self.gameserver);
										}
										//Logger.info("Room Create: "+id);
										self.gameserver.getRoomById(id, function (room) {
											if (room) {
												if (room.player_count < room.max_players && room.status === Types.ROOM_STATUS.WAITING) {
													if (self.player.room_number === 0 && accountp.player.room_number === 0) {
														accountp.player.tournament_wait_game = 0;
														self.player.tournament_wait_game = 0;
														self.player.is_master = 1;
														accountp.player.is_master = 0;
														accountp.player.is_ready = 1;
														room.joinPlayer(self);
														room.joinPlayer(accountp);
														if (room.player_count <= 2) {
															self.location_type = Types.LOCATION.ROOM;
															accountp.location_type = Types.LOCATION.ROOM;
														} else {
															return null;
														}
														self.player.room_number = id;
														accountp.player.room_number = id;
														room.status = Types.ROOM_STATUS.FULL;
														room.is_avatars_on = parseInt(info_prix.avatar_on);
														room.is_s1_disabled = 0;
														room.is_tele_disabled = 1;
														room.turn_time = info_prix.turn_time;
														room.max_wind = info_prix.max_wind;
														room.gameStart(self);
													}//
												}//
											} else {
												self.sendMessage(new Message.alert2Response(Types.ALERT2_TYPES.ROOM_DOES_NOT_EXIST, []));
											}
										});
										return null;
									}
								}
							}
						});
					}
					break;
				}
			case Types.CLIENT_OPCODE.tournament_cancel_wait:
				{
					if (self.player.tournament_wait_game == 1)
						self.player.tournament_wait_game = 0;
					break;
				}
			case Types.CLIENT_OPCODE.create_team:
				{
					// seguridad
					if (!self.login_complete) {
						console.log("login incomplete",opcode);self.connection.close();
						return null;
					}
					//Logger.normal("Tournament: "+JSON.stringify(self.player.tournament));
					var info_prix = ArrayToObject(self.player.tournament, "start_time end_time players avatar_on max_wind force_mobile name total_games last_5_minutes_games rooms maps game_mode s1 tp save_personal save_guild min_points different_mobiles gifts gp_event turn_time".split(" "));
					
					if (info_prix.players === 2) {
						self.sendMessage(new Message.alertResponse("No teams on this server", "Only 1v1 games are allowed on this server right now."));
						return null;
					}
					
					let id = self.gameserver.getIdforRoom();
					self.player.room_number = id;/* MIRAR */
					self.gameserver.rooms[id] = new Room(id, "Team", "", 8, 0, self.gameserver);
					self.gameserver.getRoomById(id, function (room) {
						if (room) {
							if (room.player_count < room.max_players) {
								self.player.is_master = 1;
								if (self.gameserver.name === 'Guilds Prix') {
									if (info_prix.force_mobile !== -1 || info_prix.force_mobile !== -2) {
										self.player.mobile = info_prix.force_mobile;
									}
								}
								room.search_team_room = 1;
								room.room_tournament_playing = 0;
								room.is_avatars_on = parseInt(info_prix.avatar_on);
												room.turn_time = parseInt(info_prix.turn_time);
								room.max_wind = parseInt(info_prix.max_wind);
								room.is_s1_disabled = parseInt(1);
								room.is_tele_disabled = parseInt(1);
								room.is_dual_plus_disabled = parseInt(0);
								
								if (self.gameserver.name === 'Bunge.') {
									var data_maps_server = info_prix.maps;
									var room_random = data_maps_server [ Math.floor ( Math.random() * data_maps_server.length )];
									if (room_random === 40)
										room_random = 39;
									room.map = Types.MAPS_PLAY[room_random];
								} else if (self.gameserver.name === 'Battle Off') {
									var data_maps_server = info_prix.maps;
									var room_random = data_maps_server [ Math.floor ( Math.random() * data_maps_server.length )];
									room.map = Types.MAPS_PLAY[room_random];
								} else {
									var data_maps_server = info_prix.maps;
									var room_random = data_maps_server [ Math.floor ( Math.random() * data_maps_server.length )];
									if (room_random === 40)
										room_random = 39;
									room.map = Types.MAPS_PLAY[room_random];
								}
								room.joinPlayer(self);
								self.location_type = Types.LOCATION.ROOM;
								room.RoomUpdate(self);
								self.player.room_number = room.id;
								self.sendMessage(new Message.loginResponse(self));
							}
						} else {
							self.sendMessage(new Message.alert2Response(Types.ALERT2_TYPES.ROOM_DOES_NOT_EXIST, []));
						}
					});
					
					break;
				}
				
			case Types.CLIENT_OPCODE.game_share:
				{
					// seguridad
					if (!self.login_complete) {
						console.log("login incomplete",opcode);self.connection.close();
						return null;
					}
					//Logger.normal("Game Share: "+message[1]);
                    if (message[1] === 2) {
                        self.gameserver.db.getMyScreeRoomGameByLetters(self.player.code_screenshot_random).then(function (rows) {
                            self.send([Types.SERVER_OPCODE.game_share, parseInt(message[1]), self.player.code_screenshot_random, JSON.stringify(self.player.screenshot)]);
                        }).catch(function () {
                            self.gameserver.db.putMyScreeRoomGame(self.player.code_screenshot_random, JSON.stringify(self.player.screenshot)).then(function (rows) {
                                self.send([Types.SERVER_OPCODE.game_share, parseInt(message[1]), self.player.code_screenshot_random, JSON.stringify(self.player.screenshot)]);
                            });
                        });
                    }
                    if (message[1] === 1) {
                        self.gameserver.db.getMyReplayRoomGameByLetters(self.player.code_screenshot_random).then(function (rows) {
                            self.send([Types.SERVER_OPCODE.game_share, parseInt(message[1]), self.player.code_screenshot_random, JSON.stringify(self.player.screenshot)]);
                        }).catch(function () {
                            var avatars_ids = [];
                            if (self.room) {
                                self.room.forPlayers(function (account) {
									//Logger.info('Check ForPlayer #');
                                    if (typeof (account) !== 'undefined') {
                                        if (account.player.unseen === 0) {
                                            var ids_avatars = [];
                                            ids_avatars.push(account.player.ahead);
                                            ids_avatars.push(account.player.abody);
                                            ids_avatars.push(account.player.aeyes);
                                            ids_avatars.push(account.player.aflag);
                                            avatars_ids.push(ids_avatars);
                                        }
                                    }
                                });
								//Logger.cyan(self.player.view_replay);
                                var date_game = {
                                    server: self.gameserver.id,
                                    create_date: Date.now(),
                                    room: self.room.id,
                                    version: 124,
                                    views: 0
                                };
								//Logger.info([JSON.stringify(avatars_ids)]);
                                self.gameserver.db.putMyReplayRoomGame(self.player.code_screenshot_random, [JSON.stringify(avatars_ids)], JSON.stringify(date_game)).then(function (rows) {
                                    fs.writeFile('./replays/'+self.player.code_screenshot_random+'.json', JSON.stringify(self.player.view_replay), function (err) {
                                        if (err) throw err;
										self.send([Types.SERVER_OPCODE.game_share, parseInt(message[1]), self.player.code_screenshot_random, JSON.stringify(self.player.screenshot)]);
                                    });
                                }).catch(function (err) {
                                    Logger.normal("Game Share [error]: " + err.stack + " - error: "+err);
                                });
                            }
                        });
                    }
					break;
				}
				
			case Types.CLIENT_OPCODE.room_title:
				{
					// seguridad
					if (!self.login_complete) {
						console.log("login incomplete",opcode);self.connection.close();
						return null;
					}
					var _title1 = message[1];
					if (self.room) {
						self.room.RoomTitle(_title1);
					}
					break;
				}
			case Types.CLIENT_OPCODE.room_change_ready:
				{
					// seguridad
					if (!self.login_complete) {
						console.log("login incomplete",opcode);self.connection.close();
						return null;
					}
					let status = message[1];
					self.player.is_ready = status === true ? 1 : 0;
					if (self.room) {
						self.gameserver.pushToRoom(self.room.id, new Message.changedReady(self));
						//self.room.masterTime();
					}
					break;
				}
			case Types.CLIENT_OPCODE.room_change_team:
				{
					// seguridad
					if (!self.login_complete) {
						console.log("login incomplete",opcode);self.connection.close();
						return null;
					}
					if (self.room) {
						if (self.room.search_team_room === 0)
							self.room.changeTeam(self);
					}
					break;
				}
            case Types.CLIENT_OPCODE.select_bot:
                {
                    // seguridad
                    if (!self.login_complete) {
                        console.log("login incomplete",opcode);self.connection.close();
                        return null;
                    }
                    const positionOfBot = message[1];
                    const deleteBot = message[2] == -1;
                    const bot_id = message[2];
                    ///console.log(self.user_id,bot_id,self.player.unlock);
                    if (self.room && self.player.is_master) {
                        if (self.room.team_bots_count <= 4) {
                            if(deleteBot){
                                const newBots = (self.room.accountsOfBot).filter(data => data.position != positionOfBot);
                                let positions = [1,3,5,7];
                                for(let n in newBots){
                                    newBots[n].position = positions[n]; 
                                }
                                self.room.accountsOfBot = [];
                                self.room.resetBot();
                                newBots.map((data)=>{
                                    self.onCreateBot({ positionOfBot: data.position, bot_id: data.id})
                                })
                            }
                            else{
                                const account_exist = (self.room.accountsOfBot).filter(data => data.id == bot_id);
                                const bot_exist = account_exist.length > 0;
                                if(bot_exist){
                                    self.sendMessage(new Message.alert2Response(Types.ALERT2_TYPES.ALREADY_IN_ROOM, []));
                                }   
                                else if(positionOfBot == 1 && self.room.accountsOfBot.length == 1){
                                    self.room.resetBot();
                                    self.room.accountsOfBot = [];
                                    let changeDataBot = { positionOfBot: 1, bot_id: bot_id};
                                    if(bot_id > self.player.unlock){
                                        self.send([Types.SERVER_OPCODE.alert2,12,[10,26]]);
                                    } else
                                    self.onCreateBot(changeDataBot);
                                }
                                else{
                                    let newDataBot = { positionOfBot, bot_id};
                                    if(bot_id > self.player.unlock){
                                        self.send([Types.SERVER_OPCODE.alert2,12,[10,26]]);
                                    } else
                                    self.onCreateBot(newDataBot);
                                }
                            }
                        }
                    }
                    break;
                }
			case Types.CLIENT_OPCODE.mobile:
				{
					// seguridad
					if (!self.login_complete) {
						console.log("login incomplete",opcode);self.connection.close();
						return null;
					}
					
					var _mob = message[1];
					if (self.room) {
						if (typeof (Types.MOBILES[_mob]) != 'undefined' && Types.MOBILES[_mob] !== null) {
							if (self.player.is_master === 1 && self.room.game_mode === Types.GAME_MODE.SAME) {
								self.room.forPlayers(function (accountdbp) {
									if (accountdbp !== null) {
											var prohivido = true;
											if (self.player.rank < 26 || self.player.rank === 27 || self.player.rank === 28 || self.player.rank === 29 || self.player.rank === 30)
												if (_mob == Types.MOBILE.COPYLOID || _mob == Types.MOBILE.BEE)
													prohivido = false;
											if (prohivido) {
												if (_mob == Types.MOBILE.RANDOM) {
													self.player.random_mobil = 1;
													accountdbp.player.random_mobil = 1;
												} else if (_mob == Types.MOBILE.BEE) {
													_mob = 1;
													self.send([17,"¡Locked!", "No tienes permitido realizar esta función."]);
												} else {
													self.player.random_mobil = 0;
													accountdbp.player.random_mobil = 0;
												}
												accountdbp.player.mobile = _mob;
												self.gameserver.pushToRoom(self.player.room_number, new Message.changedMobile(accountdbp));
												return null;
											} else {
												self.player.mobile = Types.MOBILE.ARMOR;
												accountdbp.player.mobile = Types.MOBILE.ARMOR;
												self.gameserver.pushToRoom(self.room.id, new Message.changedMobile(self));self.gameserver.pushToRoom(self.room.id, new Message.changedMobile(accountdbp));
												return null;
											}
									}
								});
							}
						}
						
						if (typeof (Types.MOBILES[_mob]) != 'undefined' && Types.MOBILES[_mob] !== null) {
							if (_mob == Types.MOBILE.RANDOM) {
								self.player.random_mobil = 1;
							} else {
								self.player.random_mobil = 0;
							}
							self.player.mobile = _mob;
							self.gameserver.pushToRoom(self.room.id, new Message.changedMobile(self));
						}
						
						if (self.player.rank < 26 || self.player.rank === 27 || self.player.rank === 28 || self.player.rank === 29 || self.player.rank === 30) {
							if (_mob == Types.MOBILE.COPYLOID) {
								self.sendMessage(new Message.alertResponse("Non-Selectable Mobile", "You can not select this mobile."));
								self.player.mobile = Types.MOBILE.ARMOR;
								self.gameserver.pushToRoom(self.room.id, new Message.changedMobile(self));
								return null;
							}
						}
					}
					break;
				}
				
			case Types.CLIENT_OPCODE.game_start:
				{
					// seguridad
					if (!self.login_complete) {
						console.log("login incomplete",opcode);self.connection.close();
						return null;
					}
					/*if ((self.player.rank >= 27) === false) {
						return null;
					}*/
					
					if (self.room) {
						if (self.room.game_mode === Types.GAME_MODE.BOSS) {
							if (self.room.team_bots_count === 0) {
								self.sendMessage(new Message.alertResponse("Hola "+this.player.game_id, "Para Empezar La Partida Amenos Debe De Eligir Mínimo Un Boss."));
								return null;
							}
						}
						
						if (self.player.is_master === 1) {
							var TeamRandom = 0;
							if (self.room.game_mode !== Types.GAME_MODE.BOSS)
								TeamRandom = getRndInteger(0,1);
							self.room.frist_turn = TeamRandom;
							//Guilds Prix
							var info_prix = ArrayToObject(self.player.tournament, "start_time end_time players avatar_on max_wind force_mobile name total_games last_5_minutes_games rooms maps game_mode s1 tp save_personal save_guild min_points different_mobiles gifts gp_event turn_time".split(" "));
							if (self.room.search_team_room === 1) {//Inicio de codigo del Vs Team
								if (self.room.player_count < 4 && self.gameserver.name === 'Guilds Prix') {
									self.sendMessage(new Message.alert2Response(Types.ALERT2_TYPES.NOT_4_SAME_GUILD, []));
									return null;
								}
								
								if (self.room.player_count === 1 && self.gameserver.name !== 'Prix') {
									self.sendMessage(new Message.alert2Response(Types.ALERT2_TYPES.FEW_PLAYERS, []));
									return null;
								} else if (self.player.tournament_start_time_server >= Date.now() && self.gameserver.name === 'Guilds Prix') {
									self.sendMessage(new Message.alert2Response(Types.ALERT2_TYPES.TOURNAMENT_NOT_STARTED, []));
									return null;
								} else if (self.player.tournament_end_time_server <= Date.now() && self.gameserver.name === 'Guilds Prix') {
									self.sendMessage(new Message.alert2Response(Types.ALERT2_TYPES.TOURNAMENT_ENDED, []));
									return null;
								} else if (self.player.guild === '' && self.gameserver.name === 'Guilds Prix') {
									self.sendMessage(new Message.alert2Response(Types.ALERT2_TYPES.NO_GUILD, []));
									return null;
								} else if (self.player.guild_score <= info_prix.min_points && self.gameserver.name === 'Guilds Prix') {
									self.sendMessage(new Message.alert2Response(Types.ALERT2_TYPES.DISQUALIFIED_GUILD, [self.player.guild_score, info_prix.min_points]));
									return null;
								} else {
									self.room.team_tournament_game = 1;
									self.room.forPlayers(function (account1) {
										if (self.gameserver.name === 'Guilds Prix') {
											if (self.player.guild !== '') {
												if (account1.player.guild === self.player.guild) {
													account1.send([Types.SERVER_OPCODE.team_search, 1]);
												} else if (account1.player.guild !== self.player.guild) {
													self.sendMessage(new Message.alert2Response(Types.ALERT2_TYPES.NOT_IN_MY_GUILD, []));
													account1.send([Types.SERVER_OPCODE.team_search, 0]);
													self.send([Types.SERVER_OPCODE.team_search, 0]);
													self.room.team_tournament_game = 0;
													return null;
												} else {}
											}
										} else {
											account1.send([Types.SERVER_OPCODE.team_search, 1]);
										}
										//account1.send([Types.SERVER_OPCODE.team_search, 1]);
									});
									if (self.gameserver.name === 'Guilds Prix') {
										self.room.room_players_guild = self.player.guild;//pin_code_generador(9)
									} else {
										self.room.room_players_guild = pin_code_generador(9);
									}
									self.gameserver.forEachRooms(function (rooms_search) {
										if (self.room.team_tournament_game === 1) {
											if (self.room.id != rooms_search.id) {
												if (self.room.team_tournament_game === 1 && rooms_search.team_tournament_game === 1) {
													if (self.room.player_count === rooms_search.player_count) {
														if (self.room.room_players_guild !== rooms_search.room_players_guild) {//
														self.room.team_tournament_game = 0;
														rooms_search.team_tournament_game = 0;
														self.room.forPlayers(function (account1) {
															account1.player.team_tournament_room = self.room.id;
															if (account1.player.is_master === 1) {
																account1.player.user_master_room = 1;
															}
														});
														rooms_search.forPlayers(function (account2) {
															account2.player.team_tournament_room = rooms_search.id;
															if (account2.player.is_master === 1) {
																account2.player.user_master_room = 1;
															}
														});
														self.room.room_tournament_playing = 1;
														rooms_search.room_tournament_playing = 1;
														let id = self.gameserver.getIdforRoom();
														self.gameserver.rooms[id] = new Room(id, "Team Start", "", 8, 0, self.gameserver);
														self.gameserver.getRoomById(id, function (room) {
															if (room) {
																room.team_tournament_game = 0;
																if (self.gameserver.name === 'Bunge.') {
																	var data_maps_server = info_prix.maps;
																	var room_random = data_maps_server [ Math.floor ( Math.random() * data_maps_server.length )];
																	if (room_random === 40)
																		room_random = 39;
																	room.map = Types.MAPS_PLAY[room_random];
																} else if (self.gameserver.name === 'Battle Off') {
																	var data_maps_server = info_prix.maps;
																	var room_random = data_maps_server [ Math.floor ( Math.random() * data_maps_server.length )];
																	room.map = Types.MAPS_PLAY[room_random];
																} else {
																	var data_maps_server = info_prix.maps;
																	var room_random = data_maps_server [ Math.floor ( Math.random() * data_maps_server.length )];
																	if (room_random === 40)
																		room_random = 39;
																	room.map = Types.MAPS_PLAY[room_random];
																}
																room.is_avatars_on = info_prix.avatar_on;
																								room.turn_time = info_prix.turn_time;
																room.is_s1_disabled = 0;
																room.is_tele_disabled = 1;
																
																self.room.forPlayers(function (account1) {
																	account1.send([Types.SERVER_OPCODE.team_search, 0]);
																	account1.location_type = Types.LOCATION.ROOM;
																	account1.player.room_number = room.id;
																	if (self.gameserver.name === 'Guilds Prix') {
																		account1.player.mobile = info_prix.force_mobile;
																	}
																	
																	account1.player.is_master = 0;
																	account1.player.is_ready = 1;
																	
																	room.team_a[account1.user_id] = account1.user_id;
																	account1.player.team = 0;
																	room.team_a_count++;
																	room.player_count++;
																	if ((room.team_a_count + room.team_b_count) != room.player_count) {
																		room.player_count = room.team_a_count + room.team_b_count;
																	}
																	account1.send([Types.SERVER_OPCODE.enter_room]);
																	room.updatePosition().then(function () {
																		account1.room = room;
																		account1.sendMessage(new Message.roomState(room));
																		self.gameserver.pushToRoom(room.id, new Message.roomPlayers(room), null);
																	});
																	
																});
																rooms_search.forPlayers(function (account2) {
																	account2.send([Types.SERVER_OPCODE.team_search, 0]);
																	account2.player.room_number = room.id;
																	account2.location_type = Types.LOCATION.ROOM;
																	if (self.gameserver.name === 'Guilds Prix') {
																		account2.player.mobile = info_prix.force_mobile;
																	}
																	
																	account2.player.is_master = 0;
																	account2.player.is_ready = 1;
																	
																	room.team_b[account2.user_id] = account2.user_id;
																	account2.player.team = 1;
																	room.team_b_count++;
																	account2.send([Types.SERVER_OPCODE.enter_room]);
																	room.updatePosition().then(function () {
																		account2.room = room;
																		account2.sendMessage(new Message.roomState(room));
																		self.gameserver.pushToRoom(room.id, new Message.roomPlayers(room), null);
																	});
																	
																});
																room.frist_turn = 0;
																room.gameStart(self);
															}
														});
														return null;
														}//
													}//
												}
											}
										}
									});
								}//Fin Del Codigo Vs Team
							} else {
								var start_game = true;
								self.room.forPlayers(function (account) {
									if (self.player.gm != 1 && self.player.computer_ip === account.player.computer_ip && self.player.team !== self.gameserver.getAccountById(account.player.user_id).player.team) {
										start_game = false;
									}
								});
								if (start_game) {
									self.room.gameStart(self);
								} else {
									self.send([0,"It is forbidden to play with alternate accounts!!","",6]);
								}
							}
						}
					}
					break;
				}
				
			case Types.CLIENT_OPCODE.team_search_cancel:
				{
					if (self.room) {
						if (self.room.team_tournament_game === 1) {
							self.room.team_tournament_game = 0;
							self.room.forPlayers(function (accountdbp) {
								if (accountdbp !== null) {
									accountdbp.send([Types.SERVER_OPCODE.team_search, 0]);
								}
							});
							//self.send([Types.SERVER_OPCODE.team_search, 0]);
						}
					}
					break;
				}

			case Types.CLIENT_OPCODE.game_items:
				{
					// seguridad
					if (!self.login_complete) {
						console.log("login incomplete",opcode);self.connection.close();
						return null;
					}
					//Logger.info("Items Seleccionados: " + message);
					//Arreglar Problema De Items
					var GameItems = message[1];
					self.player.item1 = GameItems[0];
					self.player.item2 = GameItems[2];
					self.player.item3 = GameItems[4];
					
					let item_data = [Types.SERVER_OPCODE.items, [
						[self.player.item1, -1, self.player.item2, -1, self.player.item3, -1], -1
					]];
					self.send(item_data);
					break;
				}
				
			case Types.CLIENT_OPCODE.game_use_item:
				{
					// seguridad
					if (!self.login_complete) {
						console.log("login incomplete",opcode);self.connection.close();
						return null;
					}
					
					var item_used_name = "";
					var item_used = [Types.SERVER_OPCODE.items, [
						[0, -1, 2, -1, 1, -1], -1
					]];
					
					//Logger.info('Items: '+message[1]);
					//Types.ITEM.DUAL_PLUS;
					if (self.room) {
						let x__;
						if(message[1] === 0){
							x__ = self.player.item1;
						}else if(message[1] === 2){
							x__ = self.player.item2;
						}else{
							x__ = self.player.item3;
						}
						if (message[1] === 0) {
							if (self.player.item1 === 0) {
								self.player.item1		= -1;
								self.player.DUAL		= 1;
								self.player.itemUsed	= Types.ITEM.DUAL;
								item_used_name = "Dual";
							} else if (self.player.item1 === 1) {
								self.player.item1		= -1;
								self.player.TELEPORT	= 1;
								self.player.itemUsed	= Types.ITEM.TELEPORT;
								item_used_name = "Teleport";
							} else if (self.player.item1 === 2) {
								self.player.item1		= -1;
								self.player.DUAL_PLUS	= 1;
								self.player.itemUsed	= Types.ITEM.DUAL_PLUS;
								item_used_name = "Dual+";
							} else {}
							item_used = [Types.SERVER_OPCODE.items, [
								[self.player.item1, -1, self.player.item2, -1, self.player.item3, -1], -1
							]];
						}
						if (message[1] === 2) {
							if (self.player.item2 === 0) {
								self.player.item2		= -1;
								self.player.DUAL		= 1;
								self.player.itemUsed	= Types.ITEM.DUAL;
								item_used_name = "Dual";
							} else if (self.player.item2 === 1) {
								self.player.item2		= -1;
								self.player.TELEPORT	= 1;
								self.player.itemUsed	= Types.ITEM.TELEPORT;
								item_used_name = "Teleport";
							} else if (self.player.item2 === 2) {
								self.player.item2		= -1;
								self.player.DUAL_PLUS	= 1;
								self.player.itemUsed	= Types.ITEM.DUAL_PLUS;
								item_used_name = "Dual+";
							} else {}
							item_used = [Types.SERVER_OPCODE.items, [
								[self.player.item1, -1, self.player.item2, -1, self.player.item3, -1], -1
							]];
						}
						if (message[1] === 4) {
							if (self.player.item3 === 0) {
								self.player.item3		= -1;
								self.player.DUAL		= 1;
								self.player.itemUsed	= Types.ITEM.DUAL;
								item_used_name = "Dual";
							} else if (self.player.item3 === 1) {
								self.player.item3		= -1;
								self.player.TELEPORT	= 1;
								self.player.itemUsed	= Types.ITEM.TELEPORT;
								item_used_name = "Teleport";
							} else if (self.player.item3 === 2) {
								self.player.item3		= -1;
								self.player.DUAL_PLUS	= 1;
								self.player.itemUsed	= Types.ITEM.DUAL_PLUS;
								item_used_name = "Dual+";
							} else {}
							item_used = [Types.SERVER_OPCODE.items, [
								[self.player.item1, -1, self.player.item2, -1, self.player.item3, -1], -1
							]];
						}
						self.gameserver.pushToRoom(self.player.room_number, new Message.usedItems(self, x__));
						self.send(item_used);
					}
					break;
				}
				
				case Types.CLIENT_OPCODE.started_to_shoot:
				{
					// seguridad
					if (!self.login_complete) {
						console.log("login incomplete",opcode);self.connection.close();
						return null;
					}
					self.player.shotType = message[1];
					
					break;
				}
				
				case Types.CLIENT_OPCODE.look:
				{
					// seguridad
					if (!self.login_complete) {
						console.log("login incomplete",opcode);self.connection.close();
						return null;
					}
					
					
					break;
				}
				
			case Types.CLIENT_OPCODE.game_move:
				{
					// seguridad
					if (!self.login_complete) {
						console.log("login incomplete",opcode);self.connection.close();
						return null;
					}
					var _x = message[1];
					var _y = message[2];
					var _body = message[3];
					var _look = message[4];
					var _ang = message[5];
					var _time = message[6];
					if (self.room) {
						self.player.x = _x;
						self.player.y = _y;
						self.player.body = _body;
						self.player.look = _look;
						self.player.ang = _ang;
						self.player.move();
						self.gameserver.pushToRoom(self.room.id, new Message.gameUpdate(self));
					}
					break;
				}
			case Types.CLIENT_OPCODE.game_pass_turn:
				{
					// seguridad
					if (!self.login_complete) {
						console.log("login incomplete",opcode);self.connection.close();
						return null;
					}
					let x = message[1];
					let y = message[2];
					let body = message[3];
					let look = message[4];
					let ang = message[5];
					let _time1 = message[6];
					if (self.room) {
						self.player.x = x;
						self.player.y = y;
						self.body = body;
						self.player.look = look;
						self.player.ang = ang;
						//console.log("user gamepass");
						self.room.game.gamePass(self);
					}
					break;
				}
			case Types.CLIENT_OPCODE.game_shoot:
				{
					// seguridad
					if (!self.login_complete) {
						console.log("login incomplete",opcode);self.connection.close();
						return null;
					}
					let x = message[1];
					let y = message[2];
					let body = message[3];
					let look = message[4];
					let ang = message[5];
					let power = message[6];
					let time = Math.trunc(message[7]/1000);
					let type = message[8];
					if (self.room) {
						self.player.x = x;
						self.player.y = y;
						self.player.body = body;
						self.player.look = look;
					if (self.room.game !== null) {
						if (self.player) {							
						self.player.move();
						self.room.game.gameShoot(x, y, body, look, ang, power, time, type, self);
						self.sendMessage(new Message.loginResponse(self));
						//console.log("TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT");
						} else self.room.game.gamePass(self);
						//self.sendMessage(new Message.loginResponse(self));
					}
				}
				break;
			}
			
				
			case Types.CLIENT_OPCODE.addfriend:
				{
					// seguridad
					if (!self.login_complete) {
						console.log("login incomplete",opcode);self.connection.close();
						return null;
					}
					/*if (self.player.block_friend === 0) {*/
						let agregar = parseInt(message[1]);
						let amigo_id = self.gameserver.getAccountById(agregar);
						if (self.player.rank < 26 && amigo_id.player.rank === 26 || self.player.rank < 26 && amigo_id.player.rank === 27 || self.player.rank < 26 && amigo_id.player.rank === 31) {
							self.sendMessage(new Message.alert2Response(Types.ALERT2_TYPES.CANT_FRIEND_GM, []));
							return null;
						}
						let ropa = [self.player.ahead, self.player.abody, self.player.aeyes, self.player.aflag, self.player.aforeground, self.player.abackground];
						amigo_id.send([Types.SERVER_OPCODE.friendreq, [self.player.user_id, self.player.game_id, ropa]]);
						self.sendMessage(new Message.alert2Response(Types.ALERT2_TYPES.FRIEND_REQUEST_SENT, [amigo_id.player.game_id]));
					/*} else {
						self.sendMessage(new Message.alert2Response(Types.ALERT2_TYPES.ADD_FRIEND_OFFLINE, []));
					}*/
					
					break;
				}
			case Types.CLIENT_OPCODE.friend_approved:
				{
					var nose = parseInt(message[1]);
					var envitando_friend = self.gameserver.getAccountById(nose);
					let ropa = [self.player.ahead, self.player.abody, self.player.aeyes, self.player.aflag, self.player.aforeground, self.player.abackground];
					let amigo_ropa = [envitando_friend.player.ahead, envitando_friend.player.abody, envitando_friend.player.aeyes, envitando_friend.player.aflag, envitando_friend.player.aforeground, envitando_friend.player.abackground];
					self.gameserver.db.putFriends(self.player.user_id, envitando_friend.player.user_id);
					self.sendMessage(new Message.alert2Response(Types.ALERT2_TYPES.FRIEND_ADDED, [envitando_friend.player.game_id, amigo_ropa]));
					self.gameserver.db.putFriends(envitando_friend.player.user_id, self.player.user_id);
					envitando_friend.sendMessage(new Message.alert2Response(Types.ALERT2_TYPES.FRIEND_ADDED, [self.player.game_id, ropa]));
					break;
				}
			case Types.CLIENT_OPCODE.refresh_friends:
				{
					// seguridad
					if (!self.login_complete) {
						console.log("login incomplete",opcode);self.connection.close();
						return null;
					}
					
					self.gameserver.db.getFriendsByIdyo(self.player.user_id).then(function (rows) {
						var my_friends = rows[0];
						var my_friends_x2 = [];
						var dato_frind = "";
						for (var ix in my_friends) {
							var friend_room = 0;
							if (my_friends[ix].IsOnline !== 0) {
								if (self.gameserver.id === my_friends[ix].IsOnline) {
									var my_friend_room = self.gameserver.getAccountById(parseInt(my_friends[ix].IdAcc));
									if (typeof (my_friend_room) !== 'undefined') {
										friend_room = my_friend_room.player.room_number;
									} else {
										friend_room = 0;
									}
								} else {
									friend_room = 0;
								}
							} else {
								friend_room = 0;
							}
							var fserver = 0;
							let account = self.gameserver.searchAccountById(my_friends[ix].IdAcc);
							if(account!==null){
								fserver = account.gameserver.id;
							}
							dato_frind = [
								my_friends[ix].IdAcc,
								my_friends[ix].gp,
								my_friends[ix].game_id,
								my_friends[ix].photo_url,
								"b"+my_friends[ix].rank+"c"+fserver+"d"+friend_room
							];
							my_friends_x2.push(dato_frind);
						}
						//self.sendMessage(new Message.loginResponse(self));
						self.send([Types.SERVER_OPCODE.friends, my_friends_x2, self.gameserver.id, parseInt(my_friends.length + 1)]);
					}).catch(function () {
						self.send([Types.SERVER_OPCODE.friends, [], self.gameserver.id, 1]);
					});
					break;
				}
			case Types.CLIENT_OPCODE.refresh_guildies: 
				{
					// seguridad
					if (!self.login_complete) {
						console.log("login incomplete",opcode);self.connection.close();
						return null;
					}
					
					if (self.player.guild !== '') {
						self.gameserver.db.getGuildMembersById(self.player.guild_id).then(function (rows) {
							var my_members = rows[0];
							var my_memberss_x2 = [];
							var dato_member = "";
							my_memberss_x2.push(self.player.guild);
							my_memberss_x2.push(self.player.guild_job);
							for (var ixx in my_members) {
								var member_room = 0;
								var member_server = my_members[ixx].IsOnline;
								if (my_members[ixx].IsOnline !== 0) {
									if (self.gameserver.id === my_members[ixx].IsOnline) {
										member_server = -1;
										var my_friend_room = self.gameserver.getAccountById(parseInt(my_members[ixx].IdAcc));
										if (typeof (my_friend_room) !== 'undefined') {
											member_room = my_friend_room.player.room_number;
										} else {
											member_room = 0;
										}
									} else {
										member_room = 0;
										//member_server = my_members[ixx].IsOnline;
										let account = self.gameserver.searchAccountById(my_members[ixx].IdAcc);
										if (account !== null) {
											member_server = account.gameserver.id;
										}
									}
								} else {
									member_room = 0;
									//member_server = my_members[ixx].IsOnline;
									let account = self.gameserver.searchAccountById(my_members[ixx].IdAcc);
									if (account !== null) {
										member_server = account.gameserver.id;
									}
								}
								dato_member = [
									my_members[ixx].IdAcc,
									my_members[ixx].game_id,
									my_members[ixx].gender,
									my_members[ixx].rank,
									my_members[ixx].gp,
									my_members[ixx].photo_url,
									member_server,
									member_room
								];
								my_memberss_x2.push(dato_member);
							}
							self.sendMessage(new Message.loginResponse(self));
							self.send([Types.SERVER_OPCODE.guild, my_memberss_x2]);
						}).catch(function () {
							self.send([Types.SERVER_OPCODE.guild]);
						});
					} else {
						self.send([Types.SERVER_OPCODE.guild]);
					}
					
					break;
				}
			case Types.CLIENT_OPCODE.friend_delete:
				{
					var user_delete = parseInt(message[1]);
					self.gameserver.db.deleteFriendsByIdFriendYo(user_delete, self.player.user_id);
					self.gameserver.db.deleteFriendsByIdFriendYo(self.player.user_id, user_delete);
					self.send([40,26]);
					self.sendMessage(new Message.loginResponse(self));
					break;
				}
			case Types.CLIENT_OPCODE.relationship_change: 
				{
					var rel_tip = message[1];
					var rel_id = message[2];
					let player2 = self.gameserver.getAccountById(rel_id);
					let ropa = [self.player.ahead, self.player.abody, self.player.aeyes, self.player.aflag, self.player.aforeground, self.player.abackground];
					let Ava_break = 0;
					self.gameserver.db.getUserAvatarsByIdAcc(self.player.user_id).then(function (rowss) {
						var avatar_user = rowss[0];
						var valido = false;
							for (var xm in avatar_user) {
								/*if (avatar_user[xm].aId != 1060) {
									self.sendMessage(new Message.alert2Response(Types.ALERT2_TYPES.NEED_ITEM, [1060, 1, 0, 'Rose (get relationship)']));
									return null;
								}
								if (avatar_user[xm].aId != 1063) {
									self.sendMessage(new Message.alert2Response(Types.ALERT2_TYPES.NEED_ITEM, [1063, 1, 0, 'Tissue (break friendship)']));
									return null;
								}*/
								if (rel_tip === 'f') {
									if (avatar_user[xm].aId === 1060) {
										self.send([40, 76, player2.player.game_id]);
										player2.send([44, [rel_tip, self.player.user_id, self.player.game_id, ropa, "hi"]]);
									}/* else {
										self.sendMessage(new Message.alert2Response(Types.ALERT2_TYPES.NEED_ITEM, [1060, 1, 0, 'Rose (get relationship)']));
										return null;
									}*/
								}
								if (rel_tip === 'e') {
									if (avatar_user[xm].aId === 1061) {
										self.send([40, 76, player2.player.game_id]);
										player2.send([44, [rel_tip, self.player.user_id, self.player.game_id, ropa, "hi"]]);
									}/* else {
										self.sendMessage(new Message.alert2Response(Types.ALERT2_TYPES.NEED_ITEM, [1061, 1, 0, 'Engagement Ring']));
										return null;
									}*/
								}
								if (rel_tip === 'm') {
									if (avatar_user[xm].aId === 1062) {
										self.send([40, 76, player2.player.game_id]);
										player2.send([44, [rel_tip, self.player.user_id, self.player.game_id, ropa, "hi"]]);
									} 
									/*if (avatar_user[xm].aId !== 1062) {
										self.sendMessage(new Message.alert2Response(Types.ALERT2_TYPES.NEED_ITEM, [1062, 1, 0, 'Marriage Ring']));
										return null;
									}*/
								}
								if (rel_tip === 's') {
									if (self.player.relationship_status === 'f') {
										if (avatar_user[xm].aId === 1063) {
											valido = true;
											Ava_break = 1063;
										}/* else {
											self.sendMessage(new Message.alert2Response(Types.ALERT2_TYPES.NEED_ITEM, [1063, 1, 0, 'Tissue (break friendship)']));
											return null;
										}*/
									}
									if (self.player.relationship_status === 'e') {
										if (avatar_user[xm].aId === 1064) {
											valido = true;
											Ava_break = 1064;
										}/* else {
											self.sendMessage(new Message.alert2Response(Types.ALERT2_TYPES.NEED_ITEM, [1064, 1, 0, 'Hammer (break engagement)']));
											return null;
										}*/
									}
									if (self.player.relationship_status === 'm') {
										if (avatar_user[xm].aId === 1065) {
											valido = true;
											Ava_break = 1065;
										}/* else {
											self.sendMessage(new Message.alert2Response(Types.ALERT2_TYPES.NEED_ITEM, [1065, 1, 0, 'Lawyer (break marriage)']));
											return null;
										}*/
									}
									if (valido) {
										var name_ava_gift = self.gameserver.avatars.getAvatagift(Ava_break);
										self.gameserver.pushBroadcastChat(new Message.chatResponse(self, "</3 Has usado el item "+'"'+name_ava_gift+' [ExItem]"'+" para terminar con "+self.player.relationship_with_name+", ahora estás soltero(a) de nuevo, Mejor suerte en tu próxima relación, hay muchos peces en el mar... :(", Types.CHAT_TYPE.SYSTEM), self.room);
										self.gameserver.db.deleteAvatarByUserID(self.player.user_id, Ava_break);
										self.gameserver.db.updateEndRelationByIdAcc('s', 0, self.player.user_id);
										self.gameserver.db.updateEndRelationByIdAcc('s', 0, self.player.relationship_with_id);
										//----------------------------------------------------------//
										self.player.relationship_status = rel_tip;//'s';
										self.player.relationship_with_id = 0;
										self.player.relationship_with_rank = 0;
										self.player.relationship_with_photo = '';
										self.player.relationship_with_name = '';
										self.player.relationship_with_gender = '';
										//----------------------------------------------------------//
										if (typeof (player2) !== 'undefined') {
											player2.player.relationship_status = rel_tip;//'s';
											player2.player.relationship_with_id = 0;
											player2.player.relationship_with_rank = 0;
											player2.player.relationship_with_photo = '';
											player2.player.relationship_with_name = '';
											player2.player.relationship_with_gender = '';
										}
										//----------------------------------------------------------//
										self.sendMessage(new Message.loginResponse(self));
										self.gameserver.sendAccountsOnline();
										if (typeof (player2) !== 'undefined') {
											player2.sendMessage(new Message.loginResponse(player2));
											player2.gameserver.sendAccountsOnline();
										}
										//==========================================================//
										self.room.RoomUpdate(self);
										if (typeof (player2) !== 'undefined') {
											self.room.RoomUpdate(player2);
										}
									}
								}
							}
					});
					break;
				}
			case Types.CLIENT_OPCODE.relationship_approved: 
				{
					var new_rel_status = message[1];
					var from_id = message[2];
					let player2 = self.gameserver.getAccountById(from_id);
					var casar = false;
					if (new_rel_status === 'f') {//Enamorados
						casar = true;
						self.gameserver.pushBroadcast(new Message.chatResponse(self, "["+self.player.game_id+" & "+player2.player.game_id+"] <3 Nueva Pareja <3 [Server "+self.gameserver.id+" Room "+self.room.id+"]", Types.CHAT_TYPE.LOVE));
						self.gameserver.db.deleteAvatarByUserID(player2.player.user_id, 1060);
					}
					if (new_rel_status === 'e') {//Comprometidos
						casar = true;
						self.gameserver.pushBroadcast(new Message.chatResponse(self, "["+self.player.game_id+" & "+player2.player.game_id+"] <3<3 Comprometidos <3<3 [Server "+self.gameserver.id+" Room "+self.room.id+"]", Types.CHAT_TYPE.LOVE));
						self.gameserver.db.deleteAvatarByUserID(player2.player.user_id, 1061);
					}
					if (new_rel_status === 'm') {//Casados
						casar = true;
						self.gameserver.db.deleteAvatarByUserID(player2.player.user_id, 1062);
						if (Date.now() > self.player.gameserverevent) {
							//Logger.normal("Tipo de evento por casamiento #1");
							let Time_Event = Date.now() + (60 * 1000 * 60);
							self.gameserver.db.updateTimeByEventServer(Time_Event, 60, 'Casamiento', self.gameserver.id, 1);
							self.gameserver.pushBroadcast(new Message.chatResponse(self, "["+self.player.game_id+" & "+player2.player.game_id+"] <3<3<3 Casados <3<3<3 Para celebrar su matrimonio a 200% GP & GOLD EVENT empezó por 1 hora en el Server "+self.gameserver.id+" - [Server "+self.gameserver.id+" Room "+self.room.id+"]", Types.CHAT_TYPE.LOVE));
							var event_serv = setTimeout(function () {
								self.gameserver.forEachAccount(function (account) {
									if (account !== null) {
										account.player.gameserverevent = Time_Event;
										account.gameserver.evento200 = true;
										/*var data_game_server = self.gameserver.chathistory.slice(0);
										
										data_game_server.push(['', '', 9]);
										if (self.gameserver.evento200 === true) {
											var w = self.gameserver.SecondsToString(parseInt(self.player.gameserverevent));
											data_game_server.push(['¡EVENTO! GP & Gold: 200% - '+w+' para finalizar.', '', 17]);
										}
										account.send([Types.SERVER_OPCODE.room_state, [0, data_game_server], 1]);*/
									}
								});
							}, 4000);
						} else {
							//Logger.normal("Tipo de evento por casamiento #2");
							let Time_Event = parseInt(self.player.gameserverevent) + (60 * 1000 * 60);
							self.gameserver.db.updateTimeByEventServer(Time_Event, 60, 'Casamiento', self.gameserver.id, 1);
							var w = self.gameserver.SecondsToString(Time_Event);
							self.gameserver.pushBroadcast(new Message.chatResponse(self, "["+self.player.game_id+" & "+player2.player.game_id+"] <3<3<3 Casados <3<3<3 Para celebrar su matrimonio a 200% GP & GOLD EVENT empezó por "+w+" en el Server "+self.gameserver.id+" - [Server "+self.gameserver.id+" Room "+self.room.id+"]", Types.CHAT_TYPE.LOVE));
							var event_serv = setTimeout(function () {
								self.gameserver.forEachAccount(function (account) {
									if (account !== null) {
										account.player.gameserverevent = Time_Event;
										account.gameserver.evento200 = true;
										/*var data_game_server = self.gameserver.chathistory.slice(0);
										
										data_game_server.push(['', '', 9]);
										if (self.gameserver.evento200 === true) {
											var w = self.gameserver.SecondsToString(parseInt(self.player.gameserverevent));
											data_game_server.push(['¡EVENTO! GP & Gold: 200% - '+w+' para finalizar.', '', 17]);
										}
										account.send([Types.SERVER_OPCODE.room_state, [0, data_game_server], 1]);*/
									}
								});
							}, 4000);
						}
					}
					if (casar) {
						self.gameserver.db.updateRelationStatusByIdAcc(new_rel_status, from_id, self.player.user_id);
						self.gameserver.db.updateRelationStatusByIdAcc(new_rel_status, self.player.user_id, from_id);
						//----------------------------------------------------------//
						self.player.relationship_status = new_rel_status;
						self.player.relationship_with_id = player2.player.user_id;
						self.player.relationship_with_rank = player2.player.rank;
						self.player.relationship_with_photo = player2.player.photo_url;
						self.player.relationship_with_name = player2.player.game_id;
						self.player.relationship_with_gender = player2.player.gender;
						//----------------------------------------------------------//
						player2.player.relationship_status = new_rel_status;
						player2.player.relationship_with_id = self.player.user_id;
						player2.player.relationship_with_rank = self.player.rank;
						player2.player.relationship_with_photo = self.player.photo_url;
						player2.player.relationship_with_name = self.player.game_id;
						player2.player.relationship_with_gender = self.player.gender;
						//----------------------------------------------------------//
						self.sendMessage(new Message.loginResponse(self));
						self.gameserver.sendAccountsOnline();
						player2.sendMessage(new Message.loginResponse(player2));
						player2.gameserver.sendAccountsOnline();
						//==========================================================//
						self.room.RoomUpdate(self);
						self.room.RoomUpdate(player2);
					}
					break;
				}
			default:
				{
					//change_lobby_channel
					//change_info
					Logger.info('Opcode: ' + Types.getMessageTypeAsString(opcode) + ' data: ' + message);
					break;
				}
		}
		var instant_action = 0;
		//console.log(ip);
		for(var i=0;i<this.ip_actions[ip].actions.length;i++){
			if(this.ip_actions[ip].actions[i+1]!=undefined){
				var time_elapsed = this.ip_actions[ip].actions[i+1]-this.ip_actions[ip].actions[i];
				if(time_elapsed <500){
					instant_action++;
				}
			}
		}
		if(instant_action>10){
			this.ip_actions[ip].baned = true;
			console.log("banned ip:"+ip);
			this.login_complete = false;
			this.connection._connection.close();
		}
	}


	Chat(msj, ch) {
		var self = this;

		var maxlng = 120;
		if (self.player.gm === 1)
			maxlng = 150;

		if (msj.length < 1)
			return null;

		if (msj.length > maxlng)
			return null;
		
		if (self.gameserver.name === 'Prix' && this.player.gm === 0 && this.player.tournament_start_time_server <= Date.now() && this.player.tournament_end_time_server >= Date.now() || self.gameserver.name === 'Guilds Prix' && this.player.gm === 0 && this.player.tournament_start_time_server <= Date.now() && this.player.tournament_end_time_server >= Date.now()) {//Codigo De Spam
			self.sendMessage(new Message.alertResponse("Hola "+this.player.game_id, "El Chat en el Lobby esta prohibido para los usuarios."));
			return null;
		}
		
		if (msj == this.last_chat && this.player.gm === 0) {//Codigo De Spam
			self.sendMessage(new Message.alert2Response(Types.ALERT2_TYPES.CANT_DUP_CHAT, []));
			return null;
		}

		if (self.player.is_muted === true || self.player.is_muted >= Date.now()) {
			self.sendMessage(new Message.alert2Response(Types.ALERT2_TYPES.MUTED, []));
			return null;
		}
		if (self.player.rank < 5) {
			self.sendMessage(new Message.alertResponse("Hola "+this.player.game_id,"Tu Nivel <span class='span_rank rank rank"+self.player.rank+"'></span> Es Muy Bajo. <br>Nivel mínimo <span class='span_rank rank rank5'></span> es requerido para hablar en este chat. <br><br><a style='color:#fbf9f9;text-shadow: 0px 0px 2px #ff980099, 0px 0px 3px #ff830057, 0px 0px 7px #ff98005e, 0px 0px 5px #ff9b0066, 0px 0px 8px #ff980059, 0px 0px 8px #ff8f0070;'>Unete a nuestras redes sociales!!</a>. <br><br> <a href='https://www.facebook.com/groups/250371652898757' target='_blank'> <img width='40' height='40' target='_blank' src='/static/images/fbx.png'></a>&nbsp&nbsp<a href='https://chat.whatsapp.com/DMeNbEsnTbfDQWtwvDsq5d' target='_blank'> <img width='40' height='40' target='_blank' src='/static/images/wspp.png'></a><br>"));
			return null;
		}
		var date = Date.now();
		var cans = false;
		if (this.last_message < date) {
			cans = true;
			this.last_message = date + 1000;
		} else {
			this.strik += 1;
			if (this.strik > 4) {
				self.player.is_muted = true;
				var FinishDateMuted = Date.now() + (60 * 1000 * 60);
				self.gameserver.db.updateMutedByIdAcc(FinishDateMuted, self.player.user_id);
			}
		}

		if (cans === true && self.player.is_muted !== true && self.player.is_muted != 1 || self.player.gm === 1) {
			var type = Types.CHAT_TYPE.NORMAL; //Types.CHAT_TYPE.GM;
			var save = true;
			var show = true;

			if (self.player.power_user === 1)
				type = Types.CHAT_TYPE.POWER_USER;
			
			if (self.player.gm === 1)
				type = Types.CHAT_TYPE.GM;
			
			if (self.player.rank === 28 && self.player.gm === 1 || self.player.rank === 29 && self.player.gm === 1 || self.player.rank === 30 && self.player.gm === 1)
				type = Types.CHAT_TYPE.SPECIAL;
			var rk = type == 4 || type == 0 ? this.player.rank : -1;
			if (show) {
                if (ch === true) {
                    if (save === true)
                        self.gameserver.chathistory.push([msj, this.player.game_id, type, rk, this.player.guild]);
                   // console.log("pushBroadcastChannel");
                    self.gameserver.pushBroadcastChannel(new Message.chatResponse(self, msj, type, this.player.rank));
                } else{
                    //console.log('pushBroadcastChat');
                    self.gameserver.pushBroadcastChat(new Message.chatResponse(self, msj, type), self.room);                    
                }

                this.last_chat = msj;//Codigo De Spam
            }
            //return false;

        }
    }

    saveWinDB() {
        var self = this;
        let next_rank = 0; let tmpgender = 0; let cash = 0; let gift_rank = 0; let self2 = self.gameserver.getAccountById(parseInt(self.player.user_id)); let check_ranks = JSON.parse(self.player.first_important_ranks);
        if (self.player.gp <= 1099) { next_rank = 0; }
		else if (self.player.gp >= 1100 && self.player.gp <= 1199) { next_rank = 1; gift_rank = 9333; cash = 3000}
		else if (self.player.gp >= 1200 && self.player.gp <= 1499) { next_rank = 2; gift_rank = 9334; cash = 3000}
		else if (self.player.gp >= 1500 && self.player.gp <= 1799) { next_rank = 3; gift_rank = 9335; cash = 3000}
		else if (self.player.gp >= 1800 && self.player.gp <= 2299) { next_rank = 4; gift_rank = 9336; cash = 3000}
		else if (self.player.gp >= 2300 && self.player.gp <= 2799) { next_rank = 5; gift_rank = 9337; cash = 3000}
		else if (self.player.gp >= 2800 && self.player.gp <= 3499) { next_rank = 6; gift_rank = 9338; cash = 3000}
		else if (self.player.gp >= 3500 && self.player.gp <= 4199) { next_rank = 7; gift_rank = 9339; cash = 3000}
		else if (self.player.gp >= 4200 && self.player.gp <= 5099) { next_rank = 8; gift_rank = 9340; cash = 3000}
		else if (self.player.gp >= 5100 && self.player.gp <= 5999) { next_rank = 9; gift_rank = 9341; cash = 3000}
		else if (self.player.gp >= 6000 && self.player.gp <= 6899) { next_rank = 10; gift_rank = 9342; cash = 3000}
		else if (self.player.gp >= 6900 && self.player.gp <= 8763) { next_rank = 11; gift_rank = 9343; cash = 3000}
		else if (self.player.gp >= 8764 && self.player.gp <= 17015) { next_rank = 12; gift_rank = 9344; cash = 3000}
		else if (self.player.gp >= 17016 && self.player.gp <= 27329) { next_rank = 13; gift_rank = 9345; cash = 3000}
		else if (self.player.gp >= 27330 && self.player.gp <= 38554) { next_rank = 14; gift_rank = 9346; cash = 3000}
		else if (self.player.gp >= 38555 && self.player.gp <= 42657) { next_rank = 15; gift_rank = 9347; cash = 3000}
		else if (self.player.gp >= 42658 && self.player.gp <= 56895) { next_rank = 16; gift_rank = 9348; cash = 3000}
		else if (self.player.gp >= 56896 && self.player.gp <= 64119) { next_rank = 17; gift_rank = 9349; cash = 3000}
		else if (self.player.gp >= 64120 && self.player.gp <= 72704) { next_rank = 18; gift_rank = 9350; cash = 3000}
		else if (self.player.gp >= 72705 && self.player.gp <= 87010) { next_rank = 19; gift_rank = 9351; cash = 3000}
		else if (self.player.gp >= 87011 && self.player.gp <= 105010) { next_rank = 20; gift_rank = 9352; cash = 3000}
		else if (self.player.gp >= 105011 && self.player.gp <= 200299) { next_rank = 21; gift_rank = 9353; cash = 3000}
		else if (self.player.gp >= 200300 && self.player.gp <= 299999) { next_rank = 22; gift_rank = 9354; cash = 3000}
		else if (self.player.gp >= 300000 && self.player.gp <= 427504) { next_rank = 23; gift_rank = 9355; cash = 3000}
		else if (self.player.gp >= 427505 && self.player.gp <= 457504) { next_rank = 24; gift_rank = 9356; cash = 3000}
		else if (self.player.gp >= 457505 && self.player.gp <= 527865) { next_rank = 32; cash = 5000}
		else if (self.player.gp >= 527866 && self.player.gp <= 567894) { next_rank = 33; cash = 5000}
		else if (self.player.gp >= 567895 && self.player.gp <= 678905) { next_rank = 34; cash = 5000}
		else if (self.player.gp >= 678906 && self.player.gp <= 767568) { next_rank = 35; cash = 5000}
		else if (self.player.gp >= 767569 && self.player.gp <= 856788) { next_rank = 36; cash = 5000}
		else if (self.player.gp >= 856789 && self.player.gp <= 1456785) { next_rank = 37; cash = 5000}
		else if (self.player.gp >= 1456786 && self.player.gp <= 1789673) { next_rank = 38; cash = 5000}
		else if (self.player.gp >= 1789674 && self.player.gp <= 2098677) { next_rank = 39; cash = 5000}
		else if (self.player.gp >= 2098678 && self.player.gp <= 2356788) { next_rank = 40; cash = 5000}
		else if (self.player.gp >= 2356789 && self.player.gp <= 2639077) { next_rank = 41; cash = 5000}
		else if (self.player.gp >= 2639078 && self.player.gp <= 3689677) { next_rank = 42; cash = 5000}
		else if (self.player.gp >= 3689678 && self.player.gp <= 4786727) { next_rank = 43; cash = 5000}
		else if (self.player.gp >= 4786728 && self.player.gp <= 5987291) { next_rank = 44; cash = 5000}
		else if (self.player.gp >= 5987292 && self.player.gp <= 6896235) { next_rank = 45; cash = 5000}
		else if (self.player.gp >= 6896236) { next_rank = 46; cash = 10000} else {}
        if (self.player.rank != next_rank) {
			if (self.player.gender === 'f')
				tmpgender = 1;
            if (self.player.rank <= 24) {
                self.player.scores_lose = 3;
                self.gameserver.db.updateRankByIdAcc(next_rank, self.player.user_id);
                self.player.rank = next_rank;
				//self.gameserver.db.sendGift(self.player.user_id, gift_rank);
				self.gameserver.db.getBoy(parseInt(self.player.user_id), parseInt(gift_rank)).then(function (acc) {}).catch(function (err) {
					let datasendgift = {
						UserId: self.player.user_id,
						aId: gift_rank,
						type: 0,
						expire_time: 0,
						is_cash: 0,
						is_gift: 1,
						gift_sent_by: self.player.user_id,
						amount: 0,
						date_ava_time: Date.now()
					};
					self.gameserver.db.putUserAvatars(datasendgift)
				    var name_ava_gift = self.gameserver.avatars.getAvatagift(gift_rank);
				    self.sendMessage(new Message.alert2Response(Types.ALERT2_TYPES.RECEIVED_AVATAR, ["FunnyBound", gift_rank, 0, "Congratulations you have leveled up and thanks to your effort we will reward you with this avatar", "forever", name_ava_gift]));
				    self.gameserver.db.sendCash(cash, self.player.user_id);
				    self2.send([17, "Received Cash! :)", "You just received <font color='yellow'>"+cash+"</font> Cash from<br><font color='yellow'>"+self.player.game_id+"</font>.<br><br>And cash for Rank up <font color='cyan'><span class='span_rank rank rank"+next_rank+"'></span></font>.<br><br>Thank You!"]);
				    self2.player.cash += cash;
				});
                self.sendMessage(new Message.loginResponse(self));
                self.gameserver.sendAccountsOnline();
			} else {
				self.player.scores_lose = 0;
				self.sendMessage(new Message.loginResponse(self));
				self.gameserver.sendAccountsOnline();
			}
		} else {
			self.player.scores_lose = 0;
			self.sendMessage(new Message.loginResponse(self));
			self.gameserver.sendAccountsOnline();
		}
		
		var gp_power = 0;
		var plusgp = 0;
		var relation_status = 0;
		var lucky_egg_gp = 0;
		if (self.player.power_user === 1)
			gp_power = parseInt(Math.round(10 * self.player.win_gp / 100));
        if (self.lucky_egg_left() > 0)
			lucky_egg_gp = self.player.win_gp;
		if (self.player.plus10gp === 1)
			plusgp = parseInt(Math.round(10 * self.player.win_gp / 100));
		if (self.player.relationship_status === 'f')
			relation_status = parseInt(Math.round(10 * self.player.win_gp / 100));
		if (self.player.relationship_status === 'e')
			relation_status = parseInt(Math.round(20 * self.player.win_gp / 100));
		if (self.player.relationship_status === 'm')
			relation_status = parseInt(Math.round(30 * self.player.win_gp / 100));
		
		self.player.win_gp = parseInt(Math.round(gp_power + plusgp + relation_status+lucky_egg_gp) + self.player.win_gp);
		self.player.gp = parseInt(self.player.gp + self.player.win_gp);//GPs Ganados.
		self.gameserver.db.updateUser(self)
			.then(function (data) {
				if (data.error_mysql || data.error_querry) {} else {
					self.player.win_gold = 0;
					self.player.win_gp = 0;
					self.player.is_win = 0;
					self.player.is_loss = 0;
					self.player.is_ready = 0;
					self.sendMessage(new Message.loginResponse(self));
					self.gameserver.sendAccountsOnline();
					self.room.RoomUpdate(self);
				}
			});
	}

	send(data) {
		if(this.connection._connection.readyState === WebSocket.OPEN)
		this.connection.send(data);
	}

	sendMessage(message) {
		if (this.connection._connection.readyState === WebSocket.OPEN){
		   message = message.serialize();
		   this.connection.send(message);
		}
		
	}

	onExit(callback) {
		this.exit_callback = callback;
	}

    update(tiempo1,tiempo2) {
        var self = this;
        if (self.room) {
            var map = self.room.game.map;
            if (self.player.x > map.w || self.player.y > map.h) {
                self.player.is_alive = 0;
            }
            var yf = map.GetUnder(self.player.x, self.player.y);
            if (yf === 0)
                self.player.is_alive = 0;
            else
                self.player.y = yf;

            self.player.move(tiempo1,tiempo2);
            return yf;
        }
    }
	dead() {
		var self = this;
		self.player.is_alive = 0;
		self.room.game.checkDead();
	}
	onCreateBot(
        {
            positionOfBot,
            bot_id
        })
        {
            var self = this;
            let id = bot_id;
            let bot_data = {
                user_id: bot_id,
				bot_id:bot_id,
                reg_id: 0,
                game_id: Types.COMPUTER_PLAYER[bot_id].game_id,
                rank: Types.COMPUTER_PLAYER[bot_id].rank,
                gp: 0,
                gold: 0,
                cash: 0,
                gender: "m",
                photo_url: "",
                ahead: Types.COMPUTER_PLAYER[bot_id].ahead,
                abody: Types.COMPUTER_PLAYER[bot_id].abody,
                aeyes: Types.COMPUTER_PLAYER[bot_id].aeyes,
                aflag: Types.COMPUTER_PLAYER[bot_id].aflag,
                abackground: 0,
                aforeground: 0,
                is_bot: true,
            };
            let botUserId = 1E300 + id;
            var plx = new Player(bot_data);
            plx.is_bot = 1;
            plx.is_ready = 1;
            plx.mobile = Types.COMPUTER_PLAYER[bot_id].mobile;
			plx.scores_lose = 1;
            plx.position = positionOfBot;
            plx.user_id = botUserId;
            let acc = new Bot(plx);
            acc.user_id = botUserId;
            acc.gameserver = self.gameserver;
            self.gameserver.bots[acc.user_id] = acc;
            self.room.addBot(acc);
            let data_bot = {
                position: positionOfBot,
                id: bot_id,
                name: bot_data.game_id
            };
            self.room.accountsOfBot.push(data_bot);
        }
};