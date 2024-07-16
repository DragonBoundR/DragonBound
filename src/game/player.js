var Types = require('./gametypes');
var Logger = require('./lib/logger');
var Box = require('./lib/box');
var Vector = require('./lib/vect');

var db = require('./data');

/** @legacy */
function getAvatar(id) {
	Logger.log("getAvatar use detected");
	var itm = [];
	if (id!==0){
		for (var i = 0; i < db.length; i++) {
			var n = db[i];
			if (n[0] == id) {
				itm = n;
				break;
			}
		}
		if (itm !== null && itm.length > 0) {
			var _stats = itm[6];
			this.ava_delay_one	+= _stats.stat_time;
			this.ava_delay_two	+= _stats.stat_item;
			this.ava_gold		+= _stats.stat_pop;
			this.ava_scratch	+= _stats.stat_dig;
		//	_stats.stat_life;
		//	_stats.stat_def;
			this.shield			+= _stats.stat_shld;
			this.ava_attack		+= _stats.stat_atk;
		}
	}
	
}

function ArrayToObject(a, b) {
	Logger.log("getAvatar use detected");
	var c, d = b.length, e = {};
	for (c = 0; c < d; c++)
		e[b[c]] = a[c];
	return e
}
/** @legacy END */

function secondsremaining(fechaFin) {
	var dif = Date.now() - fechaFin;
	var Segundos_de_T1_a_T2 = dif / 1000;
	var Segundos_entre_fechas = Math.abs(Segundos_de_T1_a_T2);
	return Segundos_entre_fechas;
}

// player
module.exports = class player {
	constructor(data) {
		this.avaDelayOne	= 0;
		this.avaDelayTwo	= 0;
		this.avaGold		= 0;
		this.avaScratch		= 0;
		this.avaLife		= 0;
		this.avaGuard		= 0;
		this.avaAttack		= 0;
		this.avaShieldRegen	= 0;

		this.shield			= 0;
		this.shield_regen	= 0;
		this.hp = 1000;
		
		/* *====[validation of avatars]====* */
		this.updateAva([parseInt(data.ahead),parseInt(data.abody),parseInt(data.aeyes),parseInt(data.aflag)])

		/* *====[validation of avatars]====* */
		this.itemUsed	= Types.ITEM.NONE;
		/* *====[power of avatars]====* */ // = parseInt();
		
		"stat_time stat_item stat_pop stat_dig stat_life stat_def stat_shld stat_atk"
	//	this.ava_scratch	*= 1;
	//	this.ava_attack		*= 7;
		this.check_my_ava = 0;
		this.shield = (this.shield * 7) + 500;
		/* *====[power of avatars]====* */
		
		this.number = 0;
		this.location_type = 0;

		
		let timeEvent1 = (data.event1 - (Date.now()/1000));
		let timeEvent2 = (data.event2 - (Date.now()/1000));
		this.event1 = timeEvent1 < 0 ? 0 : timeEvent1;
		this.event2 = timeEvent2 < 0 ? 0 : timeEvent2;
		this.name_changes = data.name_changes;
		this.power_user = data.power_user;
		
		this.tournament_server = data.tournament_server;
		this.tournament_start_time = data.tournament_start_time;
		this.tournament_end_time = data.tournament_end_time;
		this.tournament_start_time_server = data.tournament_start_time;//
		this.tournament_end_time_server = data.tournament_end_time;//
		this.tournament_gifts_users = data.tournament_gifts_users;
		this.tournament_state_server = data.tournament_state_server;
		this.tournament_check = data.tournament_check;
		
		if (this.tournament_start_time < Date.now()) {
			this.tournament_start_time = -1;
		} else {
			this.tournament_start_time = secondsremaining(this.tournament_start_time);
		}
		if (this.tournament_end_time < Date.now()) {
			this.tournament_end_time = -1;
		} else {
			this.tournament_end_time = secondsremaining(this.tournament_end_time);
		}
		//player { [Players: 7 = 4v4 Guilds ] - [Players: 8 - 4v4 Teams ] - [Players: 4 - 2v2 Couples (Boy+Girl Teams) ] - [Players: 3 - 2v2 Couples (Relationship Required) ] - [Players: 2 - 1v1 ] }
//start_time end_time players avatar_on max_wind force_mobile name total_games last_5_minutes_games rooms maps game_mode s1 tp save_personal save_guild min_points different_mobiles gifts gp_event
		this.tournament = [this.tournament_start_time, this.tournament_end_time, 2, 0, 0, 10, "", 0, 0, 0, [25,4,40], 0, 1, 0, 1, 0, -10, false, [
            {
                "name":"Ash (RARE) [Head+Body] / Trophy Gold (RARE) / MiniPrix Background (RARE)",
                "position":[1],
                "avatar_id":[[1946, 1945],[3033]]
            },
            {
                "name":"Trophy Silver (RARE) / Lobo (RARE) [Head+Body]",
                "position":[2],
                /*"leader_only":true,*/
                "avatar_id":[[8225],[876, 877]]
            },
            {
                "name":"Trophy Bronze (RARE) / Robot (RARE) [Head+Body]",
                "position":[3, 4],
                "avatar_id":[[8226],[1323, 1313]]
            },
            
            {
                "name":"Blue Wings (RARE)",
                "position":[5, 7],
                "avatar_id":[[1169]]
            },
            {
                "name":"Charmander (RARE)",
                "position":[8, 12],
                "avatar_id":[[565]]
            },
            {
                "name":"Trico [Flag]",
                "position":[13, 20],
                "avatar_id":[[1481]]
            },
            {
                "name":"MiniPrix 2021 [Background] **NEW**",
                "position":[1, 30],
                "avatar_id":[[3033]]
            }
		], 200, 10];
		
		this.plus10gp = data.plus10gp;
		this.unlock = 14;
		this.mobile_fox = 0;
		this.mobile_bee = data.gm;/* ================ [MOBIL PARA GM & RANK SPECIAL] ================ */
		this.random_mobil = 0;
		
		this.saludo_bot = "";

		this.flowers = 0;
		this.is_bot = 0;
		this.bot_id = data.bot_id;
		this.lastturn = 0;
		this.mobile = Types.MOBILE.ARMOR;/*Poner El Mobil Que Quieres Que Salga Para Todos*/
		this.is_ready = 0;
		this.is_master = 0;
		this.is_alive = !0;
		this.look = 0;
		this.minang = 0;
		this.maxang = 90;
		this.delay_before = 0;
		this.delay = 0;
		this.added_delay = 0;
		this.team = 0;
		this.is_muted = false;
		this.lstAvatars = [];
		this.box = null;

		this.win_gold = 0;
		this.win_gp = 0;
		this.is_win = 0;
		this.is_loss = 0;


		this.channel_rango = 0;

		this.hasEnteredGame = false;
		this.room = null;
		this.position = 0;
		this.game_position = 0;
		this.unseen = 0;

		this.user_id = data.user_id;
		this.reg_id = data.reg_id;
		this.game_id = data.game_id;
		this.rank = data.rank;
		this.gp = data.gp;
		this.gold = data.gold;
		this.cash = data.cash;
		this.gender = data.gender;
		this.room_number = 0;
		this.photo_url = data.photo_url;
		this.ahead = data.ahead;
		this.abody = data.abody;
		this.aeyes = data.aeyes;
		this.aflag = data.aflag;
		this.abackground = data.abackground;
		this.aforeground = data.aforeground;
		this.guild_id = data.guild_id;
		this.guild = data.guild;
		this.guild_job = data.guild_job;
		//this.guild_members = data.guild_members;
		//this.user_friend = data.user_friend;
		this.gm = data.gm;
		this.is_muted = data.is_muted;
		this.country = data.country;
		this.punts_prix_user = data.punts_prix_user;
		this.gm_probability = data.gm_probability
		this.computer_ip = data.computer_ip;
		this.CashCharger = data.CashCharger;
		this.server_tournament_state = data.server_tournament_state;
		this.gifts_holiday = data.gifts_holiday;
		this.user_master_room = 0;
		this.my_pin_user = data.my_pin_user;
		this.block_friend = 0;
		this.team_tournament_room = 0;
		this.no_win_bonus_accounts = data.no_win_bonus_accounts;
		this.no_win_bonus_players = {};
		this.rooms_channels = [];
        this.view_replay = [];
		
		this.x = 0;
		this.y = 0;
		this.body = 0;
		this.look = 0;
		this.next_hp = 0;
		this.next_shield = 0;
		this.flyMines = 0;
		this.shotType = 0;
		this.addEventLetter = 0;
		this.ang = 0;

		this.damage_average = 0;

		this.win = data.win;
		this.loss = data.loss;
		this.win_rate = 100;
		var sumtotal = this.win + this.loss;
		if (sumtotal > 0)
			this.win_rate = Math.round(this.win * 100 / sumtotal);

		this.is_my_friend = 0;//Si son amigos los user's
		this.is_my_guild_mate = 0;
		
		this.item1 = -1;
		this.item2 = -1;
		this.item3 = -1;
		this.scores_lose = 0;

		this.megaphones = data.megaphones; //Cuentos MegaPhones Para Los Usuarios
		this.lucky_egg = data.lucky_egg;
		this.lucky_egg_sec_left = data.lucky_egg_sec_left;
		this.electrico = data.electrico;
		
		this.relationship_status = 's';
		this.relationship_with_id = 0;
		this.relationship_with_rank = 0;
		this.relationship_with_photo = '';
		this.relationship_with_name = '';
		this.relationship_with_gender = '';
		if (this.user_id === data.relation_yo) {
			this.relationship_status = data.relationship_status;
			this.relationship_with_id = data.relationship_with_id;
			this.relationship_with_rank = data.relation_rank;
			this.relationship_with_photo = data.relation_photo;
			this.relationship_with_name = data.relation_name;
			this.relationship_with_gender = data.relation_gender;
		}
		this.Server_Id = data.Server_Id;
		this.historychat = data.historychat;
		this.gameserverevent = data.gameserverevent;
		this.server_check = data.server_check;
		this.first_important_ranks = data.first_important_ranks;
		this.time_event_unix = data.evento_time_unix;
		this.TipEvent = data.TipEvent;
		this.maps_pack = data.maps_pack;
		this.guids_points = data.guild_points;
		this.guild_score = 0;
		this.screenshot = [];
		this.code_screenshot_random = "";
	}
	
	
	updateAva(clothes){
		let self = this;
		clothes.forEach(clothingId => {
			this.getAvatar(clothingId,function(clothingData){
				self.setAvatar(clothingData);
			});
		});
	}

	setAvatar(itm) {
		if (itm !== null && itm.length > 0) {
			let stats = itm[6];
			this.avaDelayOne	= (this.avaDelayOne		+ stats.stat_time)	> 50 ? 50 : this.avaDelayOne	+ stats.stat_time;
			this.avaDelayTwo	= (this.avaDelayTwo		+ stats.stat_item)	> 50 ? 50 : this.avaDelayTwo	+ stats.stat_item;
			this.avaGold		= (this.avaGold			+ stats.stat_pop)	> 50 ? 50 : this.avaGold		+ stats.stat_pop;
			this.avaScratch		= (this.avaScratch		+ stats.stat_dig)	> 50 ? 50 : this.avaScratch		+ stats.stat_dig;
			this.avaLife		= (this.avaLife			+ stats.stat_life)	> 50 ? 50 : this.avaLife		+ stats.stat_life;
			this.avaGuard		= (this.avaGuard		+ stats.stat_def)	> 50 ? 50 : this.avaGuard		+ stats.stat_def;
			this.avaAttack		= (this.avaAttack		+ stats.stat_atk)	> 50 ? 50 : this.avaAttack		+ stats.stat_atk;
			this.avaShieldRegen	= (this.avaShieldRegen	+ stats.stat_shld)	> 50 ? 50 : this.avaShieldRegen	+ stats.stat_shld;
		}
		
	}
	getAvatar(id,callback){
		var itm = [];
		if (id!==0){
			for (var i = 0; i < db.length; i++) {
				var n = db[i];
				if (n[0] == id) {
					itm = n;
					break;
				}
			}
		}
		callback(itm)
	}
	move() {
		var self = this;
		var xf = self.x; // + 21;
		var yf = self.y; // + 37;
		if (self.box === null) {
			self.box = new Box(new Vector(xf, yf), 36, 40, 0);
		} else {
			self.box.setp(new Vector(xf, yf));
		}
	}

	setShield(a) {
		this.shield = a;
	}

	disHpShield(hp, sh) {
		this.hp = this.hp - hp;
		this.shield = this.shield - sh;
	}

	setAlive(alive) {
		var self = this;
		self.is_alive = alive;
	}

	addWinGoldWinGp(win_gold, win_gp) {
		this.win_gold = parseInt(this.win_gold + win_gold);
		this.win_gp = parseInt(this.win_gp + win_gp);
	}

	reloadHp() {
		var self = this;		
		self.hp = 1500;
		self.shield = self.shield;
		self.is_alive = 1;
		self.delay = 0;
		self.win_gp = 0;
		self.win_gold = 0;
		self.is_win = 0;
		self.is_loss = 0;
	}

	addDelay(delay) {
		var self = this;
		var delay2 = self.delay + delay;
		if(delay2!=this.delay){
			this.delay_before = this.delay;
			this.delay = delay2
		}
		this.added_delay = delay;
	}

	update() {
		var self = this;
		self.move();
	}
};