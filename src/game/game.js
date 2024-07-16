var Types = require('./gametypes');
var Logger = require('./lib/logger');
var Message = require('./lib/message');
var World = require('./world');
var Shoot = require('./lib/shoot');
var events = require('events');
var thorControl = require('./lib/thorControl');
var weatherControl = require('./lib/weatherControl');
const { forEach } = require('underscore');

// Game
module.exports = class Game {
	constructor(id, room, gameserver) {
		var self = this;
		this.id = id;
		this.room = room;
		this.gameserver = gameserver;
		this.wind_power = 0;//Reloj de viento
		this.wind_angle = 90;
		
		this.turns_change_wind_angle = 2;					// turnos para cambiar angulo
		this.turns_change_wind_power = 3;					// turnos para cambiar fuerza
		this.turns_wind_angle_mod = [ 0 , 0 , 0 ];			// modificadores de los turnos segun el viento maximo
		this.turns_wind_power_mod = [ 0 , 0 , 0 ];			// modificadores de los turnos segun el viento maximo
		this.turns_change_wind_angle_temp = 0;				// no editar
		this.turns_change_wind_power_temp = 0;				// no editar
		this.turns_change_wind_angle_mod = 0;				// no editar
		this.turns_change_wind_power_mod = 0;				// no editar
		this.change_wind_angle_turn_count = 0;				// no editar
		this.change_wind_power_turn_count = 0;				// no editar
		
		this.frist_turn = 0;
		this.time_played = 0;
		this.turn_player = 0;
		this.turns_pass = 0;
		this.turns_pass_sudden = 0;
		this.sudden = 40;
		this.suddenShoot = false;
		this.lastturn = 0;
		this.game_endx = false;
		this.gameEnd_callback = null;
		this.eventEmitter = new events.EventEmitter();
		this.queue = [];
		this.historical = [];
		this.Lightning = {};
		this.turnTime;
		this.turnPassClock;
		this.roomClock;
		
		this.map = self.gameserver.mapControl.getMap(room.map);
		this.weather			= new weatherControl(this.map);
		this.thorControl		= new thorControl(self);
		this.thor				= this.thorControl.data;
		this.baseDelay			= [50, 120, 200];
		this.mobileDelay		= 0;
	//	this.turnList

		this.ion = {
			x:		0,
			y0:		-200,
			y1:		-600,
			angle:	90,
			time:	0
		};
		if(this.weather.current.id == 0) 
			this.thor.active = true;
		else
			this.thor.active = false;
		this.gamePrixEnd_callback = null;
		this.world = new World(self, self.gameserver);
		this.setWindVars(this.room.max_wind)
		this.world.onShootComplete(function (acc, shoot, chat) {
			try {
				self.thorControl.onShootComplete(shoot);
				self.weather.update();
				if(self.weather.current.id == 0) self.thor.active = true;
				else self.thor.active = false;
				self.updateWind();

				var actual_turn = self.getActualTurn();
				let shootTime	= self.sumShootTime(shoot);
				acc.player.lastturn = actual_turn;
				self.UpdateUserLastTurn(acc.user_id,actual_turn);
			//	console.log({is:"final Shoot data",acc:acc,shoot:shoot,shootTime:shootTime});
				self.getNextTurn(actual_turn,function (player) {
					if (typeof player != 'undefined') {
						if (self.turn_player == player.position) self.sumDelay = true;
						else self.sumDelay = false;
						self.turn_player = player.position;
						var shoot_message = new Message.gamePlay(acc, shoot, player, self.lastturn, chat);
						self.gameserver.pushToRoom(self.room.id, shoot_message);
						self.historical.push(shoot_message);
						if(shoot[0].tele.length > 0){
						  //console.log(acc.player.user_id);
						   acc.player.x = shoot[0].tele[1];
						   acc.player.y = shoot[0].tele[2];
						   acc.player.move();
						}
						if (self.room.game_mode === Types.GAME_MODE.BOSS) {
							self.room.forBots(function (bot) {
								if (bot.player.position === self.turn_player) {
									bot.turn();
								}
							});
						}
						self.setPassTimeOut(player.user_id,shootTime);
						setTimeout(() => {
							self.checkDead();
						}, shootTime);
					} else {
						self.getNextTurn(actual_turn,function (player2) {
							self.turn_player = player2.position;
							if (typeof (player2.position) !== 'undefined') {
								var shoot_message = new Message.gamePlay(acc, shoot, player2, self.lastturn,  chat);
								self.gameserver.pushToRoom(self.room.id, shoot_message);
								self.historical.push(shoot_message);
								if (self.room.game_mode === Types.GAME_MODE.BOSS) {
									self.room.forBots(function (bot) {
										if (bot.player.position === self.turn_player) {
											bot.turn();
										}
									});
								}
								self.setPassTimeOut(player2.user_id,shootTime);
								setTimeout(() => {
									self.checkDead();
								}, shootTime);
							}
						});
					}
				});
			} catch (e) {
				//console.log(e);
				/*self.getNextTurn(actual_turn,function (player) {
					self.turn_player = player.position;
					self.gameserver.pushToRoom(self.room.id, new Message.gamePlay(acc, shoot, player, chat));
					if (self.room.game_mode === Types.GAME_MODE.BOSS) {
						self.room.forBots(function (bot) {
							if (bot.player.position === self.turn_player) {
								self.gameEnd_callback;
							}
						});
					}*/
					self.checkDead();
				/*});*/
			}
		});
	}

	start(callback) {
		var self = this;
		self.room.status = Types.ROOM_STATUS.PLAYING;
		self.room.forPlayers(function (account) {
			if (account !== null) {
				let player = account.player;
				var point = self.map.GetPoint();
				if(typeof (point) !== 'undefined' && typeof (point.x) !== 'undefined') {
					player.x = point.x;
					player.y = point.y;
				}
				player.reloadHp();
				if (player.is_bot === 1) {
					account.init();
				}
			}
		});
		self.checkRoom()
		callback();
	}

	setPassTimeOut(PlayerID,shootTime=0){
	//	console.log({is:"set pass time out",turnTime:this.turnTime,shootTime:shootTime,playerID:PlayerID});
		let player = this.room.gameserver.getAccountById(PlayerID);
		this.turnPassClock = setTimeout(() => {
		//	console.log({is:"Pass Time Out",TimeOutAt:this.turnTime, player:player,PlayerID:PlayerID,turn:turn});
			this.gamePass(player)
		}, this.turnTime+shootTime);
	}
	checkRoom(){
		var self = this;
		var team_a_alive = 0;
		var team_b_alive = 0;
		self.room.forPlayers(function (account) {
			let player = account.player;
			//Logger.info("Player: "+player.game_id+" - Team: "+player.team+" - Is_alive: "+player.is_alive);
			if (player.is_alive === 1) {
				if (player.team == 1) {
					team_a_alive++;
				} else {
					team_b_alive++;
				}
			}
		});
		if(team_a_alive===0||team_b_alive===0)self.checkDead();
		else 
			this.roomClock = setTimeout(() => {
			//	console.log({is:"Pass Time Out",TimeOutAt:this.turnTime, player:player,PlayerID:PlayerID,turn:turn});
				self.checkRoom()
			}, 100);
	}

	sumShootTime(shoot){
		let time = 0;
		for (const bulet of shoot) {
			time += bulet.time
		}
		return time
	}
	setWindVars(){
		var self = this;
		self.turns_change_wind_angle_mod = self.turns_wind_angle_mod[0];
		self.turns_change_wind_power_mod = self.turns_wind_power_mod[0];
		switch (self.room.max_wind) {
			case 50:
				self.turns_change_wind_angle_mod = self.turns_wind_angle_mod[2];
				self.turns_change_wind_power_mod = self.turns_wind_power_mod[2];
				self.wind_power = self.getRandomInt(26, self.room.max_wind);
				break;
			case 26:
				self.turns_change_wind_angle_mod = self.turns_wind_angle_mod[1];
				self.turns_change_wind_power_mod = self.turns_wind_power_mod[1];
				self.wind_power = self.getRandomInt(12, self.room.max_wind);
				break;
			case 12:
				self.wind_power = self.getRandomInt(0, self.room.max_wind);
				break;
		}
	}

	checkDead() {
		var self = this;
		if (self.game_endx) return null;
		var team_a_alive = 0;
		var team_b_alive = 0;
		var end = false;
		self.room.forPlayers(function (account) {
			let player = account.player;
			//Logger.info("Player: "+player.game_id+" - Team: "+player.team+" - Is_alive: "+player.is_alive);
			if (player.is_alive === 1) {
				if (player.team == 1) {
					team_a_alive++;
				} else {
					team_b_alive++;
				}
			}
		});
		var win_gp = this.room.team;
		if (team_a_alive === 0) {
			//enviar win team a
			if (self.room.event_game_room === 1) {
				self.room.forPlayerB(function(account) {
					if (self.room.free_kill)
						self.room.win_team_gp = 0;
					account.player.addWinGoldWinGp(0,self.room.win_team_gp);
					account.player.addWinGoldWinGp(0,self.room.win_team_gpb);
					/* ================================================= */
					var increase = 1;
					self.room.forPlayerA(function (account_win) {
						if (typeof (account_win) !== 'undefined') {
							if (typeof (account_win.player.no_win_bonus_players[parseInt(account.player.user_id)]) !== 'undefined') {
								if (account_win.player.no_win_bonus_players[parseInt(account.player.user_id)].loss >= 1) {
									increase = parseInt(account_win.player.no_win_bonus_players[parseInt(account.player.user_id)].loss + 1);
								}
							}
						}
					});
					self.room.no_win_bonus_players_room[account.player.user_id] = {
						user_id: account.player.user_id,
						loss: increase,
						expiry: 0
					};
					/* ================================================= */
					
				});
				self.room.forPlayerA(function(account) {
					account.player.addWinGoldWinGp(0,self.world.gp_lose);
				});
			} else {
				self.room.forPlayerA(function(account) {
					if (self.room.free_kill)
						self.room.win_team_gp = 0;
					account.player.addWinGoldWinGp(0,self.room.win_team_gp);
					account.player.addWinGoldWinGp(0,self.room.win_team_gpb);
				});
				self.room.forPlayerB(function(account) {
					account.player.addWinGoldWinGp(0,self.world.gp_lose);
					var increase = 1;
					self.room.forPlayerA(function (account_win) {
						if (typeof (account_win) !== 'undefined') {
							if (typeof (account_win.player.no_win_bonus_players[parseInt(account.player.user_id)]) !== 'undefined') {
								if (account_win.player.no_win_bonus_players[parseInt(account.player.user_id)].loss >= 1) {
									increase = parseInt(account_win.player.no_win_bonus_players[parseInt(account.player.user_id)].loss + 1);
								}
							}
						}
					});
					self.room.no_win_bonus_players_room[account.player.user_id] = {
						user_id: account.player.user_id,
						loss: increase,
						expiry: 0
					};
				});
			}
			self.gameserver.pushToRoom(self.room.id, new Message.gameOver(self.room, 0, self.room.player_left_room));
			//Logger.log("win: team a");
			end = true;
			self.gameEnd_callback(0);
			self.game_endx = true;
		} else if (team_b_alive === 0) {
			//enviar win team b
			if (self.room.event_game_room === 1) {
				self.room.forPlayerA(function(account) {
					if (self.room.free_kill)
						self.room.win_team_gp = 0;
					account.player.addWinGoldWinGp(0,self.room.win_team_gp);
					account.player.addWinGoldWinGp(0,self.room.win_team_gpb);
					/* ================================================= */
					var increase = 1;
					self.room.forPlayerB(function (account_win) {
						if (typeof (account_win) !== 'undefined') {
							if (typeof (account_win.player.no_win_bonus_players[parseInt(account.player.user_id)]) !== 'undefined') {
								if (account_win.player.no_win_bonus_players[parseInt(account.player.user_id)].loss >= 1) {
									increase = parseInt(account_win.player.no_win_bonus_players[parseInt(account.player.user_id)].loss + 1);
								}
							}
						}
					});
					self.room.no_win_bonus_players_room[account.player.user_id] = {
						user_id: account.player.user_id,
						loss: increase,
						expiry: 0
					};
					/* ================================================= */
				});
				self.room.forPlayerB(function(account) {
					account.player.addWinGoldWinGp(0,self.world.gp_lose);
				});
			} else {
				self.room.forPlayerB(function(account) {
					if (self.room.free_kill)
						self.room.win_team_gp = 0;
					account.player.addWinGoldWinGp(0,self.room.win_team_gp);
					account.player.addWinGoldWinGp(0,self.room.win_team_gpb);
				});
				self.room.forPlayerA(function(account) {
					account.player.addWinGoldWinGp(0,self.world.gp_lose);
					var increase = 1;
					self.room.forPlayerB(function (account_win) {
						if (typeof (account_win) !== 'undefined') {
							if (typeof (account_win.player.no_win_bonus_players[parseInt(account.player.user_id)]) !== 'undefined') {
								if (account_win.player.no_win_bonus_players[parseInt(account.player.user_id)].loss >= 1) {
									increase = parseInt(account_win.player.no_win_bonus_players[parseInt(account.player.user_id)].loss + 1);
								}
							}
						}
					});
					self.room.no_win_bonus_players_room[account.player.user_id] = {
						user_id: account.player.user_id,
						loss: increase,
						expiry: 0
					};
				});
			}
			self.gameserver.pushToRoom(self.room.id, new Message.gameOver(self.room, 1, self.room.player_left_room));
			//Logger.log("win: team b");
			end = true;
			self.gameEnd_callback(1);
			self.game_endx = true;
		}
		if (end) {
			clearTimeout(self.turnPassClock);
			self.world = null;
			self.map = null;
		}
	}

	gameShoot(x, y, body, look, ang, power, time, type, account) {
		let self = this;
		let mobile_data;
		clearTimeout(self.turnPassClock);
		power = parseInt(power * 234 / 100);
		if (account.player.mobile == Types.MOBILE.RANDOMIZER)
			mobile_data = Types.MOBILES[Types.RANDOMIZER[this.getRandomInt(0,Types.RANDOMIZER.length)]];
		else
			mobile_data = Types.MOBILES[account.player.mobile];
		
		let dis = 0;
		if (look === 0) {
			ang = 180 - ang;
			if (account.player.mobile == Types.MOBILE.ADUKA || account.player.mobile ==  Types.MOBILE.NAK) {
				dis = 26;
			} else {
				dis = -11;
			}
		} else {
			if (account.player.mobile == Types.MOBILE.ADUKA || account.player.mobile == Types.MOBILE.NAK) {
				dis = -26;
			} else {
				dis = 11;
			}
		}
		ang -= body;
		let point = {
			x: x + dis,
			y: account.player.mobil == Types.MOBILE.ADUKA || account.player.mobile == Types.MOBILE.NAK ? y - 31 : y - 28
		};
		let pfinal = self.rotatePoint(point, {
			x: x,
			y: y
		}, body);

		let calc_thor_angle = Math.round((Math.atan2((this.thor.y-pfinal.y),(this.thor.x-pfinal.x)) * 180 / Math.PI));
		if(calc_thor_angle<0)
			calc_thor_angle = 360 - calc_thor_angle;
		this.thor.angle = Math.round(calc_thor_angle);


		if (account.player.DUAL == 1 && type === 2) {
			account.player.DUAL = 0;
		}

		this.world.shoots_count = 0;
		this.mobileDelay = mobile_data.delay + time*10;
		if (account.player.TELEPORT == 1) {
			this.thor.active = false;
			let data = {x0:pfinal.x, y0:pfinal.y, ang:ang, power:power, pala_bunge: [null,null], weight: 398, friccion: 0, damage:null, type:type, wind_ang:self.wind_angle, wind_power:self.wind_power, stime:0,account:account,shootId:0,bonos:false}		
			self.setTurnDelay({delay:0},account);
			self.world.shoots[self.world.shoots_count] = new Shoot(data);
			this.world.shoots_count = 1;
		} else if (this.suddenShoot  || (account.player.DUAL === 1 && type !== 2)){
			this.setShoots(pfinal,mobile_data, 0, ang, power, 0, type, account);
			this.setShoots(pfinal,mobile_data, 1, ang, power, 1000, type, account)
		} else if (account.player.DUAL_PLUS === 1 && type !== 2) {
			this.setShoots(pfinal,mobile_data, 0, ang, power, 0, type, account)
			this.setShoots(pfinal,mobile_data, 1, ang, power, 1000, type==1?0:1, account)
		} else {
			this.setShoots(pfinal,mobile_data, 0, ang, power, 0, type, account)
		}
		this.world.shoot(account.player.TELEPORT==1 ? true : false); // temporal modificar quitar el nohole de lugar

		this.world.run();
		this.nohole = !1;
		account.player.DUAL = 0;
		account.player.DUAL_PLUS = 0;
	}

	setShoots(pfinal,mobile_data, shootCount, ang, power, stime, type, account){
		let self = this;
		let shootId	= 0;
		const shootData = mobile_data.shoots[type];
		
		if(shootCount==0) self.setTurnDelay(shootData[0],account);
		shootData.forEach(shootConfig => {
			let data = {x0:pfinal.x, y0:pfinal.y, ang:ang, power:power, type:type, wind_ang:self.wind_angle, wind_power:self.wind_power, stime:shootConfig.addtime + stime,account:account,shootId:shootId}
			data = {...data,...shootConfig}
			if (Array.isArray(data.addOrbit)&&Array.isArray(data.addOrbit[1])){
				data.orbit		= [
					data.addOrbit[0],
					data.addOrbit[1][(ang > 90 && ang < 270)? 0 : 1],
					data.addOrbit[2],
					data.addOrbit[3]
				] 
			}
			self.world.shoots[self.world.shoots_count] = new Shoot(data);
			self.world.shoots_count++;
			shootId++;
		});
	}
	
	setTurnDelay(shoot,account){
		let avaDelayOne		= (account.player.check_my_ava&&!isNaN(account.player.avaDelayOne)?account.player.avaDelayOne:0);
		let avaDelayTwo		= account.player.itemUsed[0]==0?0:(account.player.check_my_ava&&!isNaN(account.player.avaDelayTwo)?account.player.avaDelayTwo:0);
		let correcionOne	= Types.ITEM.NONE[1];
		let delay			= Math.round(
			(shoot.delay + this.mobileDelay - avaDelayOne * correcionOne) + 
			(account.player.itemUsed[0] - avaDelayTwo * account.player.itemUsed[1])
		)
		account.player.addDelay(delay);
		account.player.itemUsed	= Types.ITEM.NONE;
	/*	
		console.log({
			is			: "add delay",
			shootDelay	: shoot.delay,
			mobileDelay	: this.mobileDelay,
			itemUsed	: account.player.itemUsed,
			part1		: shoot.delay + this.mobileDelay,
			avaDelayOne	: avaDelayOne,
			finalADO	: avaDelayOne * correcionOne,
			avaDelayTwo	: avaDelayTwo,
			finalADT	: avaDelayTwo * account.player.itemUsed[1],
			usuarioID	: account.player.user_id,
			delayA		: (shoot.delay + this.mobileDelay - avaDelayOne * correcionOne),
			delayB		: (account.player.itemUsed[0] - avaDelayTwo * account.player.itemUsed[1]),
			delayadded	: delay,
			totaldelay	: account.player.delay
		});*/
	}

	getActualTurn(){
		return this.lastturn++;
	}

	getNextTurn(actual_turn,callback) {
		var self = this;
		if (self.game_endx) return null;
		var xf = 0;
		if(!self.room.turn_list.length>0){
		   self.room.forPlayers(function (account) {
			   if (typeof (account) !== 'undefined') {
				 self.room.turn_list.push({
					 user_id: account.player.user_id,
					 team: account.player.team,
					 delay: account.player.delay,
					 lastturn: account.player.lastturn,
					 position: account.player.position
				 });
				 account.player.game_position = account.player.position;
			   }
		   });
		   self.room.turn_list.sort(function(a,b){
			   return a.position-b.position;
		   });
		}
		this.room.forPlayers(function (account) {
			if (typeof (account) !== 'undefined') {
				var player = account.player;
				//console.log({id:player.user_id,alive:player.is_alive});
				if (account !== null && player.is_alive === 1) {
					for(var i in self.room.turn_list){
						var turn_data = self.room.turn_list[i];
						if(turn_data.user_id==account.user_id)
							self.room.turn_list[i].delay = player.delay;
					}
					xf++;
				} else {
					//console.log("eliminando del array");
					for(var i in self.room.turn_list){
						var turn_data = self.room.turn_list[i];
						if(turn_data.user_id==account.user_id)
							self.room.turn_list.splice(i,1);
					}
				}
			}
		});

		if (xf <= 0)
			self.checkDead();
		//console.log(this.room.turn_list);
		this.room.turn_list.sort(function (a, b) {
   //         return a.delay == b.delay ? a.lastturn == b.lastturn ? a.position-b.position : a.lastturn - b.lastturn : a.delay - b.delay;
			return a.delay == b.delay ? a.lastturn - b.lastturn : a.delay - b.delay;
		});
		self.turns_pass++;
		self.turns_pass_sudden++;
		let players = [];
		 if (self.turns_pass_sudden == self.sudden-1) {
			self.gameserver.pushBroadcastChat(new Message.chatResponse(self, "Dual activado" ,Types.CHAT_TYPE.SYSTEM),self);
			this.room.forPlayers(function (account) {
				if (typeof (account) !== 'undefined') {
					var player = account.player;
					player.DUAL = 1;
				}
			});
		} else if (self.turns_pass_sudden > self.sudden-1) {
			self.room.forPlayers(function (account) {
				if (typeof (account) !== 'undefined') {
					var player = account.player;
					self.suddenShoot = true;
					if (player.hp > 0){
						player.disHpShield((self.turns_pass_sudden-(self.sudden-1))*5, 0);
						if (player.hp <= 0) {
							player.setAlive(0);
							self.checkDead();
						}
					}
					players.push({id:player.user_id,damage:(self.turns_pass_sudden-(self.sudden-1))*5,hp:player.hp});
				}
			});
		}
	//	console.log({is: "sudden",suddenAtTurn: self.sudden,turnCount: self.turns_pass_sudden,players: players});
		//console.log({is:"game turn list",data:self.room.turn_list});
		callback(this.room.turn_list[0] !== null ? this.room.turn_list[0] : this.room.turn_list[1]);
	}

	UpdateUserLastTurn(user_id,lastturn){
		 for(var i in this.room.turn_list){
			 var turn_data = this.room.turn_list[i];
			 if(turn_data.user_id==user_id)
				 this.room.turn_list[i].lastturn = lastturn;
		 }
	}
	
	updateWind(){
		let self = this;
		if (this.weather.current.id == 1 ) {
			self.turns_change_wind_angle_temp = self.room.RandomInt(self.turns_change_wind_angle - self.turns_change_wind_angle_mod , self.turns_change_wind_angle);
			self.change_wind_angle_turn_count = 0;
			self.wind_angle = self.getRandomInt(0, 360);
		}	
		else
		if (self.change_wind_power_turn_count > self.turns_change_wind_power_temp) {
			self.turns_change_wind_power_temp = self.room.RandomInt(self.turns_change_wind_power - self.turns_change_wind_power_mod , self.turns_change_wind_power);
			self.change_wind_power_turn_count = 0;
			if (self.room.max_wind > 0) {
				self.wind_power = self.getRandomInt(0, self.room.max_wind);
			} 
		}
		else
		self.change_wind_angle_turn_count++;
		self.change_wind_power_turn_count++;
	}
	
	gamePass(account) {
		let self = this;
		let actual_turn = self.getActualTurn();
		self.weather.update();
		if(self.weather.current.id == 0) self.thor.active = true;
		else self.thor.active = false;
		clearTimeout(self.turnPassClock);
		if (typeof (account) !== 'undefined') {
			if (account.player !== null){
				account.player.addDelay(self.mobileDelay);
				account.player.lastturn = actual_turn;
				self.UpdateUserLastTurn(account.user_id,actual_turn);
			}
			self.turns_pass++;
		}
		self.getNextTurn(actual_turn,function (player) {
			if (typeof (player) !== 'undefined') {
				self.turn_player = player.position;
				self.turns_pass++;
				if (self.room.game_mode === Types.GAME_MODE.BOSS) {
					self.room.forBots(function (bot) {
						if (bot.player.position === self.turn_player) {
							bot.turn();
						}
					});
				}
				var pass_message = new Message.gamePass(self.lastturn, account, player, self.room);
				self.gameserver.pushToRoom(self.room.id, pass_message);
				self.historical.push(pass_message);
				self.turns_pass++;
				self.setPassTimeOut(player.user_id);
			} else {}
		});
	}

	onGameEnd(callback) {
		this.gameEnd_callback = callback;
	}

	getRandomInt(min, max) {
		return Math.floor(Math.random() * (max - min)) + min;
	}

	RadToAngle(a) {
		return 180 * a / Math.PI;
	}

	AngleToRad(p) {
		return p * Math.PI / 180;
	}

	vector(a, b) {
		var data = {};
		data.x = Math.cos(this.RadToAngle(a)) * b;
		data.y = -Math.sin(this.RadToAngle(a)) * b;
		return data;
	}

	rotatePoint(point, center, angle) {
		var px = {};
		angle = (angle) * (Math.PI / 180); // Convert to radians
		px.x = Math.cos(angle) * (point.x - center.x) - Math.sin(angle) * (point.y - center.y) + center.x;
		px.y = Math.sin(angle) * (point.x - center.x) + Math.cos(angle) * (point.y - center.y) + center.y;
		px.x = Math.floor(px.x);
		px.y = Math.floor(px.y);
		return px;
	}

	GetNextWeatherPos(){
	    var self = this;
	    return self.weather.client.next;
	}
};