var Types = require('./gametypes');
var _ = require('underscore');
var Message = require('./lib/message');
var Game = require('./game');
var Logger = require('./lib/logger');
require('setimmediate');

function getRndInteger(min, max) {
    return Math.floor(Math.random() * (max - min + 1) ) + min;
}

function screenshot_letters(length, current) {
  current = current ? current : '';
  return length ? screenshot_letters(--length, "0123456789abcdefghijklmnopqrstuvwxyz".charAt(Math.floor(Math.random() * 36)) + current) : current;
}

function ArrayToObject(a, b) {
    var c, d = b.length, e = {};
    for (c = 0; c < d; c++)
        e[b[c]] = a[c];
    return e
}

// room
module.exports = class Room {
    constructor(id, title, password, max_players, game_mode, gameserver) {
        var self = this;
        this.id = id;
        this.max_players = max_players; //2
        if (process.env.vps === '1' || process.env.vps === '2') {
            this.game_mode = Types.GAME_MODE.NORMAL;
        } else {
            this.game_mode = game_mode; //Types.GAME_MODE.BOSS
        }
        this.gameserver = gameserver;
        this.title = title;
        this.password = password;
        this.initing_game = false;

        this.watchers = {};
        this.gm_watchers = {};
        this.turn_list = [];

        this.win_team_gp = 0;
		this.win_team_gpb = 0;
        //this.win__gp = 16;

        this.team_a = {};
        this.team_a_gp = 0;
        this.team_a_count = 0;
        this.team_b = {};
        this.team_b_gp = 0;
        this.team_b_count = 0;

        this.team_bots = {};
        this.team_bots_count = 0;
        
        this.no_win_bonus_players_room = {};
        this.no_bonus_user = false;
        this.free_kill = false;
        
        this.kick_user_time = {};
        this.accountsOfBot = [];
        this.look = 0;
        this.map = -1;
        this.power = 0;
        this.max_wind = 0;
        this.gp_rate = 0;
        this.minimap = 0;
        this.room_type = 1;
        
        this.player_left_room = [];
        this.bots_room = [];
        this.bots_position = [];
        this.event_game_room = 0;

        this.is_s1_disabled = 0;
        this.is_tele_disabled = 0;
        this.is_random_teams = 0;
		this.is_avatars_on = 0;
        if (this.game_mode === Types.GAME_MODE.BOSS) {
            this.is_avatars_on = 1;
        } else {
            this.is_avatars_on = 0;
        }
        this.is_dual_plus_disabled = 0;
        this.player_count = 0;
        this.turn_time = 20;
		this.room_for_sale = 0;
		this.allow_watch = 0;
		this.allow_talk = 0;

        this.frist_turn = 1;

        this.canremove = false;

        this.status = Types.ROOM_STATUS.WAITING;
        this.game = null;
        this.masterTimeCall = null;
        this.masterTimeTick = 20;

        this.search_team_room = 0;
        this.team_tournament_game = 0;
        this.room_tournament_playing = 0;
        this.room_players_guild = '';

        if (this.password.length > 0) {
            this.look = 1;
        }
    }

    addBot(bot) {
        var self = this;
        this.team_bots[bot.user_id] = bot.user_id;
        this.team_bots_count++;
        bot.room = self;
        bot.player.team = 1;
        self.gameserver.pushToRoom(self.id, new Message.roomPlayers(self), null);
    }
    
    DeleteBot(bot) {
        var self = this;
        delete self.team_bots[bot];
        this.team_bots_count--;
        var i = this.bots_room.indexOf(bot);
        this.bots_room.splice(i, 1);
        self.gameserver.pushToRoom(self.id, new Message.roomPlayers(self), null);
        self.gameserver.pushToRoom(self.id, new Message.roomState(self));
        self.forPlayers(function (account) {
            if (typeof (account) !== 'undefined') {
                if (account.player.is_bot === 0) {
                    self.updatePosition()
                        .then(function () {
                        self.gameserver.pushToRoom(self.id, new Message.changedTeam(account, self));
                    });
                }
            }
        });
    }

    chat(account, msj, team) {
        var self = this;
        var maxlng = 150;
        //if (account.last_chat == msj) {//Codigo De Spam
            //account.sendMessage(new Message.alertResponse("Hola "+account.player.game_id, "Tu Mensaje Esta Interpretado Como Spam, Y Esto No Esta Permitido Para Este Servidor."));
            //return null;
        //}//
        if (account.player.is_muted === true || account.player.is_muted >= Date.now()) {
            account.sendMessage(new Message.alert2Response(Types.ALERT2_TYPES.MUTED, []));
            return null;
        }
		/*if (account.player.rank < 5) {
			account.send([17,"Hola "+account.player.game_id,"Tu Nivel <span class='span_rank rank rank"+account.player.rank+"'></span> Es Muy Bajo. <br>Nivel mínimo <span class='span_rank rank rank5'></span> es requerido para hablar en este chat. <br><br><a style='color:#fbf9f9;text-shadow: 0px 0px 2px #ff980099, 0px 0px 3px #ff830057, 0px 0px 7px #ff98005e, 0px 0px 5px #ff9b0066, 0px 0px 8px #ff980059, 0px 0px 8px #ff8f0070;'>Unete a nuestras redes sociales!!</a>. <br><br> <a href='https://www.facebook.com/groups/250371652898757' target='_blank'> <img width='40' height='40' target='_blank' src='/static/images/fbx.png'></a>&nbsp&nbsp<a href='https://chat.whatsapp.com/DMeNbEsnTbfDQWtwvDsq5d' target='_blank'> <img width='40' height='40' target='_blank' src='/static/images/wspp.png'></a><br>" ]);
			return null;
		} */
        /*if (account.player.gm === 1)
            maxlng = 120;*/
        if (msj.length > maxlng)
            return null;
       
        var type = Types.CHAT_TYPE.NORMAL;
        if (account.player.power_user === 1)
            type = Types.CHAT_TYPE.POWER_USER;
        

        if (account.player.gm === 1)
            type = Types.CHAT_TYPE.GM;

        if (account.player.rank === 28 && account.player.gm === 1 || account.player.rank === 29 && account.player.gm === 1 || account.player.rank === 30 && account.player.gm === 1)
            type = Types.CHAT_TYPE.SPECIAL;
        
        Logger.info('Chat Room: '+self.id+' - User: '+account.player.game_id+' - MSG: '+msj);
        if(this.watchers[account.user_id]){
            var messagewatchers = new Message.chatResponse(account, msj, type);
            for(var watcher_id in this.watchers){
                this.watchers[watcher_id].sendMessage(messagewatchers);
            }
        }
        if(!this.watchers[account.user_id])
        if (team === 1) {
            self.forPlayers(function (accountbp) {
                if (typeof (accountbp) !== 'undefined') {
                    if (accountbp.player.team === account.player.team) {
                        if (account.player.gm === 1) {
                            type = Types.CHAT_TYPE.POWER_USER_TEAM;
                        } else if (account.player.power_user === 1) {
                            type = Types.CHAT_TYPE.POWER_USER_TEAM;
                        } else {
                            type = Types.CHAT_TYPE.NORMAL_TEAM;
                        }
                        accountbp.send([0, msj, account.player.game_id, type, account.player.guild]);
                    }
                }
            });
        } else {
            self.gameserver.pushBroadcastChat(new Message.chatResponse(account, msj, type), self);
        }
        account.last_chat = msj;//Codigo De Spam
        if (this.game_mode === Types.GAME_MODE.BOSS) {
            self.forBots(function (bots) {
                if (bots !== null) {
                    bots.chat();
                }
            });
        }
    }
    removeWatcher(account,fd = false){
        delete this.watchers[account.user_id];
        if(account.player.gm !== 1)
        this.gameserver.pushToRoom(this.id, new Message.watcherLeft(account.user_id), null);
        if(!fd){
            account.room = null;
            account.room_number = 0;
            account.sendMessage(new Message.loginResponse(account));
            account.gameserver.sendRooms(account);
        }
        
    }
    joinWatcher(account) {
        if(!this.allow_watch&&account.player.gm!==1){
            return null;
        }
        this.watchers[account.user_id] = account;
        account.room = this;
        account.send([Types.SERVER_OPCODE.enter_room]);
        account.sendMessage(new Message.roomState(this));
        account.sendMessage(new Message.roomPlayers(this));
        if(this.status == Types.ROOM_STATUS.PLAYING){
            this.game.historical.forEach(function(message){
                account.sendMessage(message);
            });
            
        }
        if(account.player.gm !== 1)
        this.gameserver.pushToRoom(this.id, new Message.watcherJoined(account), account.user_id);
    }
    joinPlayer(account) {
        var self = this;
        if(account.room!=null)
            return false;;
        if (this.game_mode === Types.GAME_MODE.BOSS || this.search_team_room === 1) {
            if (account.player.is_bot === 0) {
                self.team_a[account.user_id] = account.user_id;
                account.player.team = 0;
                self.team_a_count++;
            } else {}
        } else {
            if (self.team_a_count > self.team_b_count) {
                self.team_b[account.user_id] = account.user_id;
                account.player.team = 1;
                self.team_b_count++;
            } else if (self.team_a_count < self.team_b_count) {
                self.team_a[account.user_id] = account.user_id;
                account.player.team = 0;
                self.team_a_count++;
            } else if (self.team_a_count == self.team_b_count) {
                self.team_a[account.user_id] = account.user_id;
                account.player.team = 0;
                self.team_a_count++;
            }
        }
        self.player_count++;
        if ((self.team_a_count + self.team_b_count) != self.player_count) {
            self.player_count = self.team_a_count + self.team_b_count;
        }
        account.send([Types.SERVER_OPCODE.enter_room]);
        self.updatePosition()
            .then(function () {
                account.room = self;
                account.sendMessage(new Message.roomState(self));
                self.gameserver.pushToRoom(self.id, new Message.roomPlayers(self), null);
            });
        if (self.player_count >= self.max_players)
            self.status = Types.ROOM_STATUS.FULL;
        if (self.gameserver.server_subtype !== 3)
            self.gameserver.sendRooms();
        self.canremove = true;
    }

    ChangeTeamBoss(account) {
        var self = this;
        let player = account.player;
        var change = false;
        if (this.game_mode === Types.GAME_MODE.BOSS) {
            if (player.team === 1) {
                self.team_b_count--;
                delete self.team_b[player.user_id];
                self.team_a[player.user_id] = player.user_id;
                player.team = 0;
                self.team_a_count++;
                change = true;
            }
            if (change === true) {
                this.updatePosition()
                  .then(function () {
                    self.gameserver.pushToRoom(self.id, new Message.changedTeam(account, self));
                });
            }
        }
    }

    changeTeam(account) {
        var self = this;
        if (this.game_mode === Types.GAME_MODE.BOSS||this.status==Types.ROOM_STATUS.PLAYING) {
            return null;
        }
        let player = account.player;
        var change = false;
        if (player.team === 0) {
            if (self.team_b_count >= 4) {} else {
                self.team_a_count--;
                delete self.team_a[player.user_id];
                self.team_b[player.user_id] = player.user_id;
                player.team = 1;
                self.team_b_count++;
                change = true;
            }
        } else {
            if (self.team_a_count >= 4) {} else {
                self.team_b_count--;
                delete self.team_b[player.user_id];
                self.team_a[player.user_id] = player.user_id;
                player.team = 0;
                self.team_a_count++;
                change = true;
            }
        }
        if (change === true) {
            this.updatePosition()
                .then(function () {
                    self.gameserver.pushToRoom(self.id, new Message.changedTeam(account, self));
                });
        }
    }

    gameStart(account) {
        var self = this;
        /*if(account.player.gm!=1)
            return false;*/
        if (self.status === Types.ROOM_STATUS.WAITING || self.status === Types.ROOM_STATUS.FULL) {
            if (((self.player_count > 0) && self.game_mode === Types.GAME_MODE.BOSS && self.checkReady()) || ((self.player_count > 1) && self.game_mode === Types.GAME_MODE.NORMAL && self.team_a_count === self.team_b_count && self.checkReady()) || ((self.player_count > 1) && self.game_mode === Types.GAME_MODE.SAME && self.team_a_count === self.team_b_count && self.checkReady()) || ((self.player_count > 1) && self.game_mode === Types.GAME_MODE.SCORE && self.team_a_count === self.team_b_count && self.checkReady()) || ((self.player_count > 1) && self.game_mode === Types.GAME_MODE.TAG && self.team_a_count === self.team_b_count && self.checkReady())) {
                self.status = Types.ROOM_STATUS.PLAYING;
                var mlng = 0;
                var rnmap = 0;
               
                if (self.map == -1) {
                    mlng = Types.MAPS_PLAY_BOSS.length;
                    rnmap = self.RandomInt(0, mlng);
                    self.map = Types.MAPS_PLAY_BOSS[rnmap];
                } else if (self.map == -1){
                    self.map = self.rom.map;
                    //Logger.info("map game: " + self.map);
                } else {
                    if(self.game_mode === Types.GAME_MODE.BOSS) {
                        mlng = Types.MAPS_PLAY_BOSS.length;
                        rnmap = self.RandomInt(0, mlng);
                        self.map = Types.MAPS_PLAY_BOSS[rnmap];
                    }
                }
                if (self.gameserver.server_subtype === 3) {
                    var info_prix = ArrayToObject(account.player.tournament, "start_time end_time players avatar_on max_wind force_mobile name total_games last_5_minutes_games rooms maps game_mode s1 tp save_personal save_guild min_points different_mobiles gifts gp_event turn_time".split(" "));
                    if (self.gameserver.name === 'Bunge.') {
                        var data_maps_server = info_prix.maps;
                        var room_random = data_maps_server [ Math.floor ( Math.random() * data_maps_server.length )];
                        if (room_random === 40)
                            room_random = 39;
                        self.map = Types.MAPS_PLAY[room_random];
                    } else if (self.gameserver.name === 'Battle Off') {
                        var data_maps_server = info_prix.maps;
                        var room_random = data_maps_server [ Math.floor ( Math.random() * data_maps_server.length )];
                        self.map = Types.MAPS_PLAY[room_random];
                    } else {
                        var data_maps_server = info_prix.maps;
                        var room_random = data_maps_server [ Math.floor ( Math.random() * data_maps_server.length )];
                        if (room_random === 40)
                            room_random = 39;
                        self.map = Types.MAPS_PLAY[room_random];
                    }
                }
                
                //self.event_game_room = self.RandomInt(0, 16);

                //Logger.debug("map: " + self.map);
                
                self.forPlayerA(function(account_a) {
                    if (typeof (account_a) !== 'undefined') {
                        self.forPlayerB(function(account_b) {
                            if (typeof (account_b) !== 'undefined') {
                                if (account_a.player.no_win_bonus_accounts !== "{}") {
                                    if (typeof (account_a.player.no_win_bonus_accounts[parseInt(account_b.player.user_id)]) !== 'undefined') {
                                        if (account_b.player.user_id === account_a.player.no_win_bonus_accounts[parseInt(account_b.player.user_id)].user_id) {
                                            if (account_a.player.no_win_bonus_accounts[parseInt(account_b.player.user_id)].expiry < Date.now()) {
                                                delete account_a.player.no_win_bonus_accounts[parseInt(account_b.player.user_id)];
                                                self.gameserver.db.updateNoWinBonusByIdAcc(JSON.stringify( account_a.player.no_win_bonus_accounts ), account_a.player.user_id)
                                                    .then(function (data) {
                                                    if (data.error_mysql || data.error_querry) {} else {
                                                        account_a.player.no_win_bonus_players = account_a.player.no_win_bonus_accounts;
                                                        self.gameserver.pushToRoom(self.id, new Message.roomState(self));
                                                        self.gameserver.pushToRoom(self.id, new Message.roomPlayers(self), null);
                                                        account_a.sendMessage(new Message.loginResponse(account_a));
                                                        Logger.debug("Up delete No Win Bonus Users: "+JSON.stringify( account_a.player.no_win_bonus_accounts ));
                                                    }
                                                });
                                            } else {
                                                self.no_bonus_user = true;
                                            }
                                        }
                                    }
                                }
                            }
                        });
                    }
                });
                self.forPlayerB(function(account_b) {
                    if (typeof (account_b) !== 'undefined') {
                        self.forPlayerA(function(account_a) {
                            if (typeof (account_a) !== 'undefined') {
                                if (account_b.player.no_win_bonus_accounts !== "{}") {
                                    if (typeof (account_b.player.no_win_bonus_accounts[parseInt(account_a.player.user_id)]) !== 'undefined') {
                                        if (account_a.player.user_id === account_b.player.no_win_bonus_accounts[parseInt(account_a.player.user_id)].user_id) {
                                            if (account_b.player.no_win_bonus_accounts[parseInt(account_a.player.user_id)].expiry < Date.now()) {
                                                delete account_b.player.no_win_bonus_accounts[parseInt(account_a.player.user_id)];
                                                self.gameserver.db.updateNoWinBonusByIdAcc(JSON.stringify( account_b.player.no_win_bonus_accounts ), account_b.player.user_id)
                                                    .then(function (data) {
                                                    if (data.error_mysql || data.error_querry) {} else {
                                                        account_b.player.no_win_bonus_players = account_b.player.no_win_bonus_accounts;
                                                        self.gameserver.pushToRoom(self.id, new Message.roomState(self));
                                                        self.gameserver.pushToRoom(self.id, new Message.roomPlayers(self), null);
                                                        account_b.sendMessage(new Message.loginResponse(account_b));
                                                        Logger.debug("Up delete No Win Bonus Users: "+JSON.stringify( account_b.player.no_win_bonus_accounts ));
                                                    }
                                                });
                                            } else {
                                                self.no_bonus_user = true;
                                            }
                                        }
                                    }
                                }
                            }
                        });
                    }
				});
				
                self.game = new Game(self.id, self, self.gameserver);
                if (self.game) {
                    self.RoomUpdate(self);
					self.turn_list = [];
                    if (self.gameserver.server_subtype !== 3)
                        self.gameserver.sendRooms();
					self.game.start(function (fturn) {
						var lastturn_discount = -8;
						self.forPlayers(function (account) {
							if (typeof (account) !== 'undefined') {
								if (account.player.mobile === Types.MOBILE.RANDOM) {
									account.player.mobile = Types.MOBILE_R[getRndInteger(0, Types.MOBILE_R.length-1)];
								}
								if (self.game_mode === Types.GAME_MODE.TAG) {
									var random_number = parseInt(getRndInteger(0, 20));
									if (random_number === Types.MOBILE.RANDOM || random_number === Types.MOBILE.FOX || random_number === Types.MOBILE.DRAGON || random_number === Types.MOBILE.DRAG || random_number === Types.MOBILE.KALSIDDON || random_number === Types.MOBILE.MAYA || random_number === Types.MOBILE.DRAGON2 || random_number === Types.MOBILE.EASTER || random_number === Types.MOBILE.COPYLOID || random_number === Types.MOBILE.PHOENIX || random_number === Types.MOBILE.HALLOWEEN || random_number === Types.MOBILE.BEE)
										random_number = parseInt(getRndInteger(0, 6));
									account.send([Types.SERVER_OPCODE.game_mode_gb_tag, random_number]);
								}
								account.player.check_my_ava = self.is_avatars_on;
								if (self.is_avatars_on === 0) {
									account.player.shield = 0;
									account.player.shield_regen = 0;
								} else {
									if (account.player.mobile !== Types.MOBILE.MAGE || account.player.mobile !== Types.MOBILE.LIGHTNING || account.player.mobile !== Types.MOBILE.ASATE || account.player.mobile !== Types.MOBILE.JD) {
										account.player.shield = 0;
										account.player.shield_regen = 0;
									}
								}
								self.win_team_gp = self.team_b_count==1 ? 34 :self.team_b_count==2 ? 56 : self.team_b_count==3 ? 68 : self.team_b_count==4 ? 70 : 0;
								if (self.gameserver.evento200 === true || self.event_game_room === 1)
									self.win_team_gp *= 2;
								if (self.no_bonus_user)
									self.win_team_gp = parseInt(Math.abs(self.win_team_gp / 100));
								
								self.win_team_gpb = self.team_bots_count==1 ? 29 :self.team_bots_count==2 ? 42 : self.team_bots_count==3 ? 52 : self.team_bots_count==4 ? 62 : 0;
								if (self.gameserver.evento200 === true || self.event_game_room === 1)
									self.win_team_gpb *= 2;
								self.turn_list.push({
									user_id: account.player.user_id,
									team: account.player.team,
									position: account.player.position
								});
								account.player.lastturn = lastturn_discount;
								account.player.game_position = account.player.position;
							}
						});
					
						self.shuffleTurnList(self.turn_list,function (turnList){
							self.turn_list = turnList;
							let turnTime = (self.turn_time+3)*1000;
							var game_start_message = new Message.gameStart(self);
							self.gameserver.pushToRoom(self.id, game_start_message);
							self.game.historical.push(game_start_message);
							/*if (self.gameserver.server_subtype === 3) {
								self.forPlayers(function (players_server_event) {
									if (typeof (players_server_event) !== 'undefined') {
										if (self.gameserver.name === 'Holiday') {
											setTimeout(function() {
												players_server_event.send([0,players_server_event.player.game_id+" ("+players_server_event.player.gm_probability+") -VS- "+account.player.game_id+" ("+account.player.gm_probability+")","",17]);
											}, 3000);
										}
										if (self.gameserver.name === 'Prix') {
											setTimeout(function() {
												players_server_event.send([0,players_server_event.player.game_id+" ("+players_server_event.player.punts_prix_user+") -VS- "+account.player.game_id+" ("+account.player.punts_prix_user+")","",17]);
											}, 3000)
										}
								//		if (self.gameserver.id === 3) {
								//			setTimeout(function() {
								//				players_server_event.send([0,"Betting Room Cash: "+players_server_event.player.game_id+" (1500) -VS- "+account.player.game_id+" (1500)","",17]);
								//			}, 3000)
								//		}
									}
								});
							}*/
							/*self.gameserver.forEachAccount(function (accountp) {
								if (self.gameserver.name === 'Holiday') {
									setTimeout(function() {
										self.send([0,self.account.player.game_id+" ("+self.account.player.gm_probability+") -VS- "+accountp.player.game_id+" ("+accountp.player.gm_probability+")","",17]);
                                        accountp.send([0,accountp.player.game_id+" ("+accountp.player.gm_probability+") -VS- "+self.account.player.game_id+" ("+self.account.player.gm_probability+")","",17]);
                                    }, 3000);
								}
								if (self.gameserver.name === 'Prix') {
                                    setTimeout(function() {
                                        self.send([0,self.player.game_id+" ("+self.player.punts_prix_user+") -VS- "+accountp.player.game_id+" ("+accountp.player.punts_prix_user+")","",17]);
                                        accountp.send([0,accountp.player.game_id+" ("+accountp.player.punts_prix_user+") -VS- "+self.player.game_id+" ("+self.player.punts_prix_user+")","",17]);
                                    }, 3000)
                                }
							});*/
							//
							if (self.game_mode === Types.GAME_MODE.BOSS) {
								self.forBots(function (bot) {
									if (bot.player.user_id == self.turn_list[0].user_id) {
										bot.turn();
									}
								});
								self.map = -1;
								if (self.gameserver.server_subtype !== 3)
									self.gameserver.sendRooms();
							}
							self.game.turnTime = turnTime>7000?turnTime:7000;
					//		console.log({is:"final turn list",turnlist:self.turn_list});
					//		console.log({is:"set tur time",time:self.turn_time, final:self.game.turnTime});
							self.game.setPassTimeOut(self.turn_list[0].user_id);
						});
						
                    });
                    self.game.onGameEnd(function (team) {
                        var date_my_info_player = [];
                        self.forPlayers(function (account) {
                            if (typeof (account) !== 'undefined') {
                                var date_my_info_player_1 = [];
                                let player = account.player;
                                if (account.player.random_mobil === parseInt(1)) {
                                    account.player.mobile = Types.MOBILE.RANDOM;
                                }
                                if (team === player.team) {
                                    //player.addWinGoldWinGp(200, 10);
                                    if (self.event_game_room === 1)
                                        player.is_loss = 1;
                                    else
                                        player.is_win = 1;
                                    account.saveWinDB(self.power == 1 ? true : false);
                                    
                                    self.forPlayers(function (account_loss) {
                                        if (typeof (account_loss) !== 'undefined') {
                                            if (team != account_loss.player.team) {
                                                if (typeof (player.no_win_bonus_players[parseInt(account_loss.player.user_id)]) !== 'undefined') {
                                                    if (player.no_win_bonus_players[parseInt(account_loss.player.user_id)].loss >= 99999) {
                                                        if (player.no_win_bonus_players[parseInt(account_loss.player.user_id)].loss === 99999) {
                                                            player.no_win_bonus_players[parseInt(account_loss.player.user_id)].expiry = Date.now() + (1 * 24 * 60 * 60 * 1000);
                                                            self.gameserver.db.updateNoWinBonusByIdAcc(JSON.stringify( player.no_win_bonus_players ), player.user_id)
                                                                .then(function (data) {// asi debe guardarse ==-> {"164":{"user_id":164,"loss":1,"game_id":"Test"}}
                                                                if (data.error_mysql || data.error_querry) {} else {
                                                                    player.no_win_bonus_accounts = player.no_win_bonus_players;
                                                                    self.gameserver.pushToRoom(self.id, new Message.roomState(self));
                                                                    self.gameserver.pushToRoom(self.id, new Message.roomPlayers(self), null);
                                                                    account.sendMessage(new Message.loginResponse(account));
                                                                    Logger.normal("Up No Win Bonus Users: "+JSON.stringify( player.no_win_bonus_accounts ));
                                                                }
                                                            });
                                                        }
                                                        var increase = parseInt(player.no_win_bonus_players[parseInt(account_loss.player.user_id)].loss + 1);
                                                        player.no_win_bonus_players[account_loss.player.user_id] = {
                                                            user_id: account_loss.player.user_id,
                                                            loss: increase,
                                                            expiry: 0
                                                        };
                                                    }
                                                }
                                            }
                                        }
                                    });
                                    
                                    //Logger.info("Players Win: "+account.player.game_id+" - Win Gold: "+player.win_gold+" - Win GP: "+player.win_gp);
                                    if (self.gameserver.server_subtype === 3) {
                                        if (self.gameserver.name === 'Holiday') {
                                            player.gm_probability += 1;
                                            self.gameserver.db.updateProbability(player.gm_probability, player.user_id);
                                        }
                                        if (self.gameserver.name === 'Prix') {
                                            if (player.rank === 26 || player.rank === 27 || player.rank === 31) {
                                                player.punts_prix_user = parseInt(0);
                                            } else {
                                                player.punts_prix_user = parseInt(player.punts_prix_user + 1);
                                            }
                                            account.sendMessage(new Message.loginResponse(account));
                                            self.gameserver.db.updatePrix(player.punts_prix_user, account)
                                                .then(function (data) {
                                                if (data.error_mysql || data.error_querry) {} else {
                                                    //Logger.info('The '+account.player.game_id+' user points have been updated');
                                                }
                                            });
                                        }
                                        if (self.gameserver.name === 'Guilds Prix' && player.guild !== '' && info_prix.players === 7 && player.tournament_start_time_server <= Date.now() && player.tournament_end_time_server >= Date.now()) {
                                            player.guild_score += 1;
                                            self.gameserver.db.updateGuildPrixById(player.guild_score, player.guild_id);
                                        }
                                        /*if (self.gameserver.id === 3) {
                                            player.cash += 1500;
                                            self.gameserver.db.sendCash(1500, player.user_id);
                                        }*/
									} else {
                                        if (!player.is_bot&&self.game_mode === Types.GAME_MODE.BOSS) {
                                            var superiorDerroted = false;
                                            self.forBots(function (bots) {
                                                if (bots !== null) {
                                                    if(bots.player.bot_id > player.unlock)
                                                        superiorDerroted = true;
                                                }
                                            });
                                            account.unlocknewbot();
                                        }
                                    }
                                } else {
                                    if (self.event_game_room === 1)
                                        player.is_win = 1;
                                    else
                                        player.is_loss = 1;
                                    account.saveWinDB(self.power == 1 ? true : false);
                                    if (self.gameserver.server_subtype === 3) {
                                        if (self.gameserver.name === 'Holiday') {
                                            player.gm_probability = 0;
                                            self.gameserver.db.updateProbability(0, player.user_id);
                                        }
                                        if (self.gameserver.name === 'Prix') {
                                            if (player.rank === 26 || player.rank === 27 || player.rank === 31) {
                                                player.punts_prix_user = parseInt(0);
                                            } else {
                                                player.punts_prix_user = parseInt(player.punts_prix_user - 1);
                                            }
                                            account.sendMessage(new Message.loginResponse(account));
                                            self.gameserver.db.updatePrix(player.punts_prix_user, account)
                                                .then(function (data) {
                                                if (data.error_mysql || data.error_querry) {} else {
                                                    //Logger.info('The '+account.player.game_id+' user points have been updated');
                                                }
                                            });
                                        }
                                        if (self.gameserver.name === 'Guilds Prix' && player.guild !== '' && info_prix.players === 7 && player.tournament_start_time_server <= Date.now() && player.tournament_end_time_server >= Date.now()) {
                                            player.guild_score -= 1;
                                            self.gameserver.db.updateGuildPrixById(player.guild_score, player.guild_id);
                                        }
                                        /*if (self.gameserver.id === 3) {
                                            player.cash -= 1500;
                                            self.gameserver.db.sendDeleteCash(0, 1500, player.user_id);
                                        }*/
                                    }
                                }//CLIENT_OPCODE.game_share
                                
                                if (team === player.team) {
                                    player.no_win_bonus_players = self.no_win_bonus_players_room;
                                    self.no_win_bonus_players_room = {};
                                }
                                
                                date_my_info_player_1.push(player.position);
                                date_my_info_player_1.push(player.user_id);
                                date_my_info_player_1.push(player.game_id);
                                date_my_info_player_1.push(player.rank);
                                date_my_info_player_1.push(player.win_gp);
                                date_my_info_player_1.push(player.win_gold);
                                date_my_info_player_1.push(player.scores_lose);
                                date_my_info_player.push(date_my_info_player_1);
                                
                            }
                        });
                        self.forPlayers(function (account_screen) {
                            if (typeof (account_screen) !== 'undefined') {
                                account_screen.player.screenshot = JSON.stringify([1, Date.now(), self.gameserver.id, self.id, self.game_mode, self.max_players, self.map, self.is_avatars_on, self.max_wind, team, self.game.turns_pass, date_my_info_player]);
                                account_screen.player.code_screenshot_random = screenshot_letters(8);
                            }
                        });
                        self.game = null;
                        if (self.player_count < self.max_players)
                            self.status = Types.ROOM_STATUS.WAITING;
						else if (self.player_count >= self.max_players)
                               self.status = Types.ROOM_STATUS.FULL;
						   else 
							   self.status = Types.ROOM_STATUS.PLAYING;
                        if (self.game_mode === Types.GAME_MODE.BOSS)
                            self.map = -1;
						   if (self.gameserver.server_subtype !== 3)
                               self.gameserver.sendRooms();
							   
                        self.gameserver.pushToRoom(self.id, new Message.roomPlayers(self));
                        if (self.gameserver.server_subtype === 3) {
                            self.forPlayers(function (players_server_event) {
                                if (typeof (players_server_event) !== 'undefined') {
                                    if (players_server_event.player.is_bot === 0) {
                                        setTimeout(function() {
                                            if (info_prix.players === 7 || info_prix.players === 8 || info_prix.players === 4 || info_prix.players === 3 || players_server_event.player.team_tournament_room !== 0) {
                                                self.gameserver.getRoomById(parseInt(players_server_event.player.team_tournament_room), function (room_server_event) {
                                                    if (room_server_event) {
                                                        setTimeout(function() {
                                                            room_server_event.joinPlayer(players_server_event);
                                                            room_server_event.team_tournament_game = 0;
                                                            room_server_event.room_tournament_playing = 0;
                                                            players_server_event.player.room_number = room_server_event.id;
                                                            players_server_event.player.team_tournament_room = 0;
                                                            if (players_server_event.player.user_master_room === 1) {
                                                                players_server_event.player.is_master = 1;
                                                            }
                                                            players_server_event.location_type = Types.LOCATION.ROOM;
                                                            if (room_server_event.search_team_room === 0) {
                                                                room_server_event.search_team_room = 1;
                                                            }
                                                        }, 2000);
                                                    }
                                                });
                                                self.removePlayer(players_server_event);
                                                players_server_event.sendMessage(new Message.loginResponse(players_server_event));
                                                players_server_event.gameserver.sendAccountsOnline();
                                                self.gameserver.removeRoom(self.id);
                                            } else {
                                                //Logger.info("Users removed from the room: "+self.id);
                                                players_server_event.player.room_number = 0;
                                                players_server_event.location_type = Types.LOCATION.CHANNEL;
                                                if (self.player_count >= 1) {
                                                    self.removePlayer(players_server_event);
                                                }
                                                players_server_event.player.is_ready = 0;
                                                players_server_event.player.is_master = 0;
                                                if (self.player_count === 0 || self.player_count >= 1 || self.player_count <= 0) {
                                                    self.gameserver.removeRoom(self.id);
                                                }
                                                //Logger.normal("Room Eliminada: "+self.id);
                                                players_server_event.sendMessage(new Message.loginResponse(players_server_event));
                                                //players_server_event.gameserver.sendAccountsOnline();self.gameserver.sendAccountsOnline();
                                                if (self.gameserver.name === 'Holiday') {
                                                    self.gameserver.forEachAccount(function (accounttp) {
                                                        if (accounttp !== null && accounttp.player.user_id === account.player.user_id) {
                                                            var data_game_server = self.gameserver.chathistory.slice(0);
                                                            data_game_server.push(['', '', 9]);
                                                            if (self.gameserver.evento200 === true) {
                                                                var w = self.gameserver.SecondsToString(parseInt(account.player.gameserverevent));
                                                                data_game_server.push(['¡EVENTO! GP & Gold: 200% - '+w+' para finalizar.', '', 17]);
                                                            }
                                                            if (self.gameserver.name === 'Holiday') {
                                                                data_game_server.push([' Búscame, gáname y te llevas un regalo: (gift) '+accounttp.player.gifts_holiday+' Regalos enviados (gift)', 'Onfroy', 5]);
                                                                data_game_server.push([' Tienes '+accounttp.player.gm_probability+' ganadas seguidas = 200% GP & Gold! Event probabilidad x'+accounttp.player.gm_probability, '', 6]);
                                                            }
                                                            accounttp.send([Types.SERVER_OPCODE.room_state, [0, data_game_server], 1]);
                                                        }
                                                    });
                                                }
                                                self.gameserver.forEachRooms(function (remove_room_id) {
                                                    if (remove_room_id.player_count === 0) {
                                                        self.gameserver.removeRoom(remove_room_id.id);
                                                    }
                                                }); 
                                            }
                                        }, 1500);
                                    }
                                }
                            });
                        }
					});
                }
            }
        }
	}
	
	shuffleTurnList(rawList,callback){
		let self	= this;
		let team	= Math.round(Math.random());
		let teamList= [[],[]];
		for (let i = 0; i < rawList.length; i++) {
			teamList[rawList[i].team].push(rawList[i].user_id);
		}
		teamList[0].shuffle();
		teamList[1].shuffle();
		let turnList = teamList[team].interpolate(teamList[team==0?1:0])
		
		self.forTurnList(turnList,function(fturnList){
		//	console.log({is:"shuffle",data:fturnList});
			callback(fturnList);
		});

	}

	forTurnList(turnList,callback){
		let self		= this;
		let returnList	= [];
		let lastturn	= [-7,-6,-5,-4,-3,-2,-1,0];

		for (let i = 0; i < turnList.length; i++) {
			let playerId	= turnList[i];
			let account		= self.gameserver.getAccountById(playerId)? self.gameserver.getAccountById(playerId) : self.gameserver.getBotById(playerId)
			if (account) {
				returnList.push(self.formatTurnList({lastturn:lastturn[i],account:account}));
			}
		}
		callback(returnList)
	}

	formatTurnList(data){
		data.account.player.lastturn = data.lastturn;
		return {
			user_id: data.account.player.user_id,
			team: data.account.player.team,
			delay: data.account.player.delay,
			lastturn: data.lastturn,
			position: data.account.player.position
		}
	}

    checkReady() {
        var self = this;
        var canstart = true;
        self.forPlayers(function(account) {
            if (typeof (account) === 'undefined') {
            } else {
                if (account.player !== null & account.player.is_ready === 0 && account.player.is_master !== 1) {
                    canstart = false;
                }
             }
        });
        return canstart;
    }

    updatePosition() {
        var self = this;
        var a = 0;
        var b = 0;
        return new Promise(function (accept, reject) {
            self.forPlayers(function (account) {
                if (typeof (account) === 'undefined') {} else {
                    if (account.player.team === 0) {
                        if (a === 0) {
                            account.player.position = 0;
                        } else if (a === 1) {
                            account.player.position = 2;
                        } else if (a === 2) {
                            account.player.position = 4;
                        } else if (a === 3) {
                            account.player.position = 6;
                        }
                        a++;
                    } else {
                        if (b === 0) {
                            account.player.position = 1;
                        } else if (b === 1) {
                            account.player.position = 3;
                        } else if (b === 2) {
                            account.player.position = 5;
                        } else if (b === 3) {
                            account.player.position = 7;
                        }
                        b++;
                    }
                }
            });
            accept();
        });
    }

    forPlayerA(callback) {
        var self = this;
        self.team_a_count = 0;
        for (var id in this.team_a) {
            var user_id = this.team_a[id];
            var account = self.gameserver.getAccountById(user_id);
            if (typeof (account) === 'undefined' || account === null) {
                delete self.team_a[id];
            } else {
                self.team_a_count++;
                callback(account);
            }
        }
    }

    forPlayerB(callback) {
        var self = this;
        self.team_b_count = 0;
        for (var id in this.team_b) {
            var user_id = this.team_b[id];
            var account = self.gameserver.getAccountById(user_id);
            if (typeof (account) === 'undefined' || account === null) {
                delete self.team_b[id];
            } else {
                self.team_b_count++;
                callback(account);
            }

        }
    }

    forBots(callback) {
        var self = this;
        for (var id in this.team_bots) {
            var account = self.gameserver.getBotById(id);
            if (account === null) {
                delete self.team_bots[id];
                self.team_bots_count--;
            } else
                callback(account);
        }
    }

    getOnePlayer() {
        var self = this;
        var pl_teama = null;
        var pl_teamb = null;
        return new Promise(function (accept, reject) {
            for (let id in self.team_a) {
                let user_id = self.team_a[id];
                pl_teama = self.gameserver.getAccountById(user_id);
                if (typeof (pl_teama) === 'undefined' || pl_teama === null) {} else {
                    break;
                }
            }
            for (let id in self.team_b) {
                let user_id = self.team_b[id];
                pl_teamb = self.gameserver.getAccountById(user_id);
                if (typeof (pl_teamb) === 'undefined' || pl_teamb === null) {} else {
                    break;
                }
            }
            if (pl_teama === null && pl_teamb === null) {
                reject();
            } else {
                if (pl_teama === null || pl_teamb !== null && (pl_teama.player.position > pl_teamb.player.position)) {
                    accept(pl_teamb);
                } else {
                    accept(pl_teama);
                }
            }
        });
    }
    findPlayer(user_id){
        return this.team_a[user_id]||this.team_b[user_id];
    }
    forPlayers(callback) {
        var self = this;
        self.team_a_count = 0;
        for (let id in this.team_a) {
            let user_id = this.team_a[id];
            let account = self.gameserver.getAccountById(user_id);
            if (typeof (account) === 'undefined' || account === null) {
                delete self.team_a[id];
            } else {
                if (typeof (account.connection) !== 'undefined') {
                    self.team_a_count++;
                    //console.log(1,account.user_id);
                    callback(account);
                } else {
                    delete self.team_a[id];
                }
            }
        }
        self.team_b_count = 0;
        for (let id in this.team_b) {
            let user_id = this.team_b[id];
            let account = self.gameserver.getAccountById(user_id);
            if (typeof (account) === 'undefined' || account === null) {
                delete self.team_b[id];
            } else {
                if (typeof (account.connection) !== 'undefined') {
                    self.team_b_count++;
                    //console.log(2,account.user_id);
                    callback(account);
                } else {
                    delete self.team_a[id];
                }
            }
        }
        if (self.game_mode === Types.GAME_MODE.BOSS)
            for (let id in this.team_bots) {
                let user_id = this.team_bots[id];
                let account = self.gameserver.getBotById(user_id);
                //console.log(3,account.user_id);
                callback(account);
            }
        self.player_count = self.team_a_count + self.team_b_count;
    }

    masterTime() {

    }

    removePlayer(account) {
        var self = this;
        self.found_master = false;
        try {
            
            self.player_count--;
            if (self.team_a[account.user_id]) {
                delete self.team_a[account.user_id];
                self.team_a_count--;
            } else {
                delete self.team_b[account.user_id];
                self.team_b_count--;
            }
            account.room = null;
            
            if (self.game) {
                self.player_left_room = [
                    account.player.position,
                    account.player.id,
                    account.player.game_id,
                    account.player.rank,
                    0,
                    0,
                    2,
                    0,
                    0
                ];
            }
            //self.updatePosition();
            self.turn_list.forEach(function(p,i){
                if(account.user_id==p.user_id)
                    self.turn_list.splice(i,1);
            });
            if (self.game) {
				if (self.game.turns_pass <= 6  && self.player_count == 2) {
					self.free_kill = true;
					self.gameserver.pushBroadcastChat(new Message.chatResponse(self, "Free Kill Detectado - No hay bonificación por victoria", Types.CHAT_TYPE.SYSTEM), self);
                    //.send(Types.GAMEMSG.free_kill_detected)
				}
                self.kick_user_time[account.player.user_id] = {
                    expiry: Date.now() + (5 * 1000 * 60)
                }
			}
            account.player.is_alive = 0;
            if (self.status == Types.ROOM_STATUS.PLAYING) {
                if (self.game.turn_player == account.player.position && self.player_count > 0) {
                    account.player.setAlive(0);
                    //console.log("status gamepass");
                    self.game.gamePass(account);
                }
                    var message2 = [Types.SERVER_OPCODE.dead,account.player.position];
                    var message3 = new Message.chatResponse(self, "Player "+account.player.game_id+" left the room.", Types.CHAT_TYPE.SYSTEM).serialize();
                    var message4 = new Message.chatResponse(self, "Winning Bonus: Team A = %% GP, Team B = %% GP.", Types.CHAT_TYPE.SYSTEM).serialize();
                    //console.log(message);
                    self.forPlayers(function(account){
                        if (account !== null && typeof (account) !== 'undefined'){
                            if(account.player.is_bot === 0){
                                account.send(message2);
                                account.send(message3);
                                account.send(message4);
                                if (account.player.random_mobil === parseInt(1)) {
                                    account.player.mobile = Types.MOBILE.RANDOM;
                                }
                            }
                        }
                    });
            }
            if (self.player_count > 0 && (self.status === Types.ROOM_STATUS.WAITING || self.status === Types.ROOM_STATUS.FULL || self.status === Types.ROOM_STATUS.PLAYING)) {
                self.gameserver.pushToRoom(self.id, new Message.playerLeft(account, self));
                self.updatePosition()
                    .then(() => {});
                if (account.player.is_master == 1) {
                    self.getOnePlayer()
                        .then(function (p) {
                            if (account.user_id != p.user_id && self.found_master === false) {
                                p.player.is_master = 1;
                                self.found_master = true;
                                self.gameserver.pushToRoom(self.id, new Message.passMaster(p));
                                self.gameserver.pushBroadcastChat(new Message.chatResponse(self, "Master de la sala se transfirió a "+p.player.game_id, Types.CHAT_TYPE.SYSTEM), self);
								
                            }
                        });
                }
                if (self.player_count < self.max_players && self.game === null) {
                    self.status = Types.ROOM_STATUS.WAITING;
                } else if (self.game) {
                    self.status = Types.ROOM_STATUS.PLAYING;
                } else {
                    self.status = Types.ROOM_STATUS.FULL;
                }
				if (self.gameserver.server_subtype !== 3)
					self.gameserver.sendRooms();
			}
			
			if (self.gameserver.server_subtype === 3) {
                //console.log(self.player_count);
                if (self.player_count === 0) {
                    self.gameserver.removeRoom(self.id);
                }
                if (self.player_count === 1) {
                    //self.game.checkDead();
                    self.gameserver.removeRoom(self.id);
                }
                if (self.player_count <= 0) {
                    if (self.canremove === true) {
                        //Logger.normal("Remove Room #1: "+self.id);
                        self.gameserver.removeRoom(self.id);
                        if (self.gameserver.server_subtype !== 3)
                            self.gameserver.sendRooms();
                    }
                }
            }
		
            if (self.player_count <= 0) {
                if (self.canremove === true) {
					//Logger.normal("Remove Room #1: "+self.id);
                    self.gameserver.removeRoom(self.id);
					if (self.gameserver.server_subtype !== 3)
						self.gameserver.sendRooms();
                }
            } else if (self.player_count === 1 && self.game) {
                self.game.checkDead();
            }
        } catch (e) {
        //  console.log(e);
            self.player_count = self.team_a_count + self.team_b_count;
            if (self.player_count <= 0) {
                if (self.canremove === true) {
					//Logger.normal("Remove Room #2: "+self.id);
                    self.gameserver.removeRoom(self.id);
					if (self.gameserver.server_subtype !== 3)
						self.gameserver.sendRooms();
                }
            }
        }
    }

    RoomTitle(title) {
        var self = this;
        self.title = title;
        self.gameserver.pushToRoom(self.id, new Message.roomState(self));
	}
    
    RoomUpdate(room_options=false) {
        var self = this;
        if(room_options)
        self.room_options = room_options;
        self.gameserver.pushToRoom(self.id, new Message.roomState(self));
		
        self.gameserver.pushToRoom(self.id, new Message.roomPlayers(self), null);
    }

    RandomInt(low, high) {
        return Math.floor(Math.random() * (high - low) + low);
	}
  resetBot(callback) {
        var self = this;
        for (var id in this.team_bots) {
            var account = self.gameserver.getBotById(id);
            if (account != null) {
                delete self.team_bots[id];
                self.team_bots_count--;
            } else
                callback(account);
        }
        this.team_bots_count = 0;
        self.gameserver.pushToRoom(self.id, new Message.roomPlayers(self), null);
    }
};

if(!Array.prototype.hasOwnProperty('interpolate')) {
	Object.defineProperty(Array.prototype, "interpolate", {
		writable: false,
		configurable: false,
		enumerable: false,
		value: function(other) {
	 		let limit = this.length < other.length ? other.length : this.length;
	 		let out = [];
			
			for(let i = 0; i < limit; i++) {
				if(this.length > 0) out.push(this.shift());
				if(other.length > 0) out.push(other.shift());
			}
			return out;
		}
	});
}
if(!Array.prototype.hasOwnProperty('shuffle')) {
	Object.defineProperty(Array.prototype, "shuffle", {
		writable: false,
		configurable: false,
		enumerable: false,
		value: function() {
			let index = this.length;
			while (0 !== index) {
				let j = Math.floor(Math.random() * index);
				index -= 1;
				let i = this[index];
				this[index] = this[j];
				this[j] = i;
			}
		}
	});
}