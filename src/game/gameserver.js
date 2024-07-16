var Types = require('./gametypes');
var Account = require('./account');
var Logger = require('./lib/logger');
var Avatars = require('./avatars');
var WebSocket = require('ws');
var Message = require('./lib/message');
// gameserver
module.exports = class GameServer {
    constructor(id, server_options, maxPlayers, websocketserver,multiworld,pending_messages,last_account_info) {
        var self = this;
        this.id = id;
        this.server_options = server_options;
        this.maxPlayers = maxPlayers;
        this.server = websocketserver;
        this.multiworld = multiworld.multiworld;
        this.global = multiworld;
        this.accounts = {};
        this.pending_messages = pending_messages;
        this.last_account_info = last_account_info;
        this.bots = {};
        this.groups = {};
        this.rooms = {};
        this.chathistory = [];
        this.outgoingQueues = {};
        this.ups = 50;
        this.db = null;
        this.ver = this.server_options[0];
        this.name = this.server_options[1];
        this.room_ids = [];
        this.bot_ids = [];
        this.avatars = new Avatars();
        this.mapControl = null;
        this.server_type = this.server_options[2];
        this.server_subtype = this.server_options[3];
		this.roomGPS = true;

        this.onAccountConnect(function (account) {
            account.send([Types.SERVER_OPCODE.hi, this.ver, this.name, this.server_type, this.server_subtype]);

        });

        this.onAccountRemoved(function () {
            // Logger.debug("playerRemoved")
        });

        this.onAccountEnter(function (account) {
            //Logger.info('The user '+account.player.game_id+' has entered the server '+self.id);
            
            if (Date.now() < account.player.gameserverevent && account.player.server_check === self.id) {
                if (1558933200000 === account.player.gameserverevent) {
                    this.evento500 = true;
                } else {
                    this.evento200 = true;
                }
            } else {
                this.evento200 = false;
                this.evento500 = false;
            }
            
            if (self.chathistory !== null) {
                var data = self.chathistory.slice(0);
                data.push(['', '', 9]);
                if (self.evento200 === true) {
                    var w = self.SecondsToString(parseInt(account.player.gameserverevent));
                    data.push(['¡EVENTO! GP & Gold: 300% - '+w+' para finalizar.', '', 17]);
                }
                if (self.evento500 === true) {
                    data.push([' El porcentaje de GP & Gold cambiaron a 500%', '[Inicio de Evento', 17]);
                }
                if (self.roomGPS === true) {
                    data.push(['Desde ahora las salas menores que 5 ganan + GPS', '', 6]);
                }
                if (self.name === 'Holiday') {
                    data.push([' Búscame, gáname y te llevas un regalo: (gift) '+account.player.gifts_holiday+' Regalos enviados (gift)', 'Halloween', 5]);
                    data.push([' Tienes '+account.player.gm_probability+' ganadas seguidas = 200% GP & Gold! Event probabilidad x'+account.player.gm_probability, '', 6]);
                } else if (self.id === 2) {
                    data.push(['(gift) ¡ Ya esta todo listo !, Prepárense. (party)', 'Halloween', 5]);
                } else {}
               /*if (self.name === 'Prix')
                    if (account.player.rank != 26 && account.player.rank != 27 && account.player.rank != 31) {
                        account.send([17,"Error","No tienes permitido entrar a este servidor."]);
                        account.hasEnteredGame = false;
                        account.login_complete = false;
                        self.removeAccount(account);
                        if (self.removed_callback)
                            self.removed_callback();
                        self.sendAccountsOnline();
                        account = null;
                    }*/
				/*data.push(['(trophy) GUILD PRIX J.D OFF | para más info: ya.mba/2pN  | 25 de Abril (trophy)', '', 9]);*/
				if (account.player.rank === 0) {
                  data.push(['Anota muy bien tu Pin User, te servira para distintos problemas ==-> ['+account.player.my_pin_user+']', '', 9]);
                }
                data.push(['Bienvenido: '+account.player.game_id+' :)  ', '', 9]);
				data.push(['Hola '+account.player.game_id+' enteraté de nuestro nuevo (gift) Evento (gift) en => https://thorbound.com/event :)', '', 17]);
                //data.push(['(trophy) Special Prix Halloween | Para más info: ya.mba/7df | 31 de octubre (trophy)', '', 9]);
                account.send([Types.SERVER_OPCODE.room_state, [0, data], 1]);
            }
            self.sendAccountsOnline();
            if (self.server_subtype !== 3)
                self.sendRooms(account);
            account.onExit(function () {
                //Logger.info(account.player.game_id + ' has left the game server.');
                //Logger.info(account.player.game_id + ' has left the [Room: '+account.player.room_number+'] game.');
                self.db.updateServerByUserId(0, account.user_id);
                account.hasEnteredGame = false;
                account.login_complete = false;
                self.removeAccount(account);
				//self.db.viewsServer2(self.id);
                if (self.removed_callback) {
                    self.removed_callback();
                }
                self.sendAccountsOnline();
                if (account.player.room_number !== 0) {//win_gold, win_gp, is_loss, user_id
                    if (self.name === 'Holiday') {
                        self.db.updateProbability(0, account.player.user_id);
                    } else if (self.name === 'Prix') {
                        account.player.punts_prix_user -= 1;
                        self.db.updatePrix(account.player.punts_prix_user, account);
                    }/* else if (self.name === 'Guilds Prix' && account.player.guild !== '' && self.player.server_tournament_state === 0) {//Revisar
                        account.player.guild_score -= 1;
                        self.db.updateGuildPrixById(account.player.guild_score, account.player.guild_id);
                    }*/ else if (self.id === 4) {
                        account.player.cash -= 1500;
                        self.db.sendDeleteCash(0, 1500, account.player.user_id);
                    } 
                }
                account = null;
            });

            /*account.onBroadcast(function(message, ignoreSelf) {
                self.pushToAdjacentGroups(account.group, message, ignoreSelf ? account.id : null)
            });*/
        });
    }
    guildMessage(account,message){
        //[0,"Junior35","holiwis",10,"GmPlay","PE"]
        var chatmessage = [Types.SERVER_OPCODE.pchat,0,account.player.game_id,message,0,account.player.guild,0];
        for(var server_id in this.global.multiworld){
            var gms = this.global.multiworld[server_id];
            for(var user_id in gms.accounts){
                var guild_member = gms.accounts[user_id];
                //console.log(guild_member.player.game_id,guild_member.player.guild_id);
                if(guild_member.player.guild_id==account.player.guild_id){
                    guild_member.send(chatmessage);
                }
            }
        }
    }
    sendAccountsOnline() {
        var self = this;
        var data = [];
        self.forEachAccount(function (account) {
            if (account !== null) {
                if (account.player.rank < 25) {
                    data.push(account.user_id);
                    data.push(account.player.game_id);
                    data.push(account.player.rank);
                    data.push(account.player.guild);
                } else if (account.player.rank > 31) {
					data.push(account.user_id);
                    data.push(account.player.game_id);
                    data.push(account.player.rank);
                    data.push(account.player.guild);
				}
            }
        });
        self.pushBroadcastChannel([Types.SERVER_OPCODE.channel_players, data]);
    }

    sendRooms(account) {
        var self = this;
        var data = [];
        self.getRoomsArray(false, function (arr) {
            data = arr;
            var snd = [Types.SERVER_OPCODE.rooms_list, data];
            if (typeof (account) !== 'undefined')
                account.send(snd);
            else
                self.pushBroadcastChannel(snd);
        });
    }
	
	sendRoomUpdate(room, account) {
        var self = this;
        var data_fin = [];
        var data = [];
        self.getRoomById(room, function (rom) {
            if (room === rom.id)
                data.push(rom.id, rom.title, rom.player_count, rom.max_players, rom.status, rom.game_mode, rom.look, rom.map, rom.power);
        });
        data.sort(function(a,b){
            return a[0]-b[0];
        });
        data.sort(function(a,b){
            return b[8]-a[8];
        });
        account.send([Types.SERVER_OPCODE.room_update, data, self.getRoomPosition(room)]);
    }

    sendRoomsType(account, page, type) {
        var self = this;
        var data_fin = [];
        self.getRoomsArray(false, function (arr) {
            if (arr !== null) {
                for (var i = page; i < (page + 6); i++) {
                    if (i < arr.length) {
                        data_fin.push(arr[i]);
                    }
                }
                var snd = [Types.SERVER_OPCODE.rooms_list, data_fin];
                account.send(snd);
            }
        });
    }
	
	sendRoomsWait(account, page, type) {
        var self = this;
        var data_fin = [];
        self.getRoomsArray(true, function (arr) {
            if (arr !== null) {
                for (var i = page; i < (page + 6); i++) {
                    if (i < arr.length) {
                        data_fin.push(arr[i]);
                    }
                }
                var snd = [Types.SERVER_OPCODE.rooms_list, data_fin];
                account.send(snd);
            }
        });
    }	
	
	sendRoomsnormal(account, page, type) {
        var self = this;
        var data_fin = [];
        self.getRoomsArray1(true, function (arr) {
            if (arr !== null) {
                for (var i = page; i < (page + 6); i++) {
                    if (i < arr.length) {
                        data_fin.push(arr[i]);
                    }
                }
                var snd = [Types.SERVER_OPCODE.rooms_list, data_fin];
                account.send(snd);
            }
        });
    }	
	
	sendRoomsboss(account, page, type) {
        var self = this;
        var data_fin = [];
        self.getRoomsArray2(true, function (arr) {
            if (arr !== null) {
                for (var i = page; i < (page + 6); i++) {
                    if (i < arr.length) {
                        data_fin.push(arr[i]);
                    }
                }
                var snd = [Types.SERVER_OPCODE.rooms_list, data_fin];
                account.send(snd);
            }
        });
    }	
	
	sendRoomssame(account, page, type) {
        var self = this;
        var data_fin = [];
        self.getRoomsArray3(true, function (arr) {
            if (arr !== null) {
                for (var i = page; i < (page + 6); i++) {
                    if (i < arr.length) {
                        data_fin.push(arr[i]);
                    }
                }
                var snd = [Types.SERVER_OPCODE.rooms_list, data_fin];
                account.send(snd);
            }
        });
    }	
	
	sendRoomsscore(account, page, type) {
        var self = this;
        var data_fin = [];
        self.getRoomsArray4(true, function (arr) {
            if (arr !== null) {
                for (var i = page; i < (page + 6); i++) {
                    if (i < arr.length) {
                        data_fin.push(arr[i]);
                    }
                }
                var snd = [Types.SERVER_OPCODE.rooms_list, data_fin];
                account.send(snd);
            }
        });
    }	

    run() {
        var self = this;
        var regenCount = this.ups * 2;
        var updateCount = 0;
        setInterval(function () {
            self.processQueues();
            if (updateCount < regenCount) {
                updateCount += 1;
            } else {
                if (self.regen_callback) {
                    self.regen_callback();
                }
                updateCount = 0;
            }
        }, 1000 / this.ups);
        Logger.normal('' + this.id + ' created (capacity: ' + this.maxPlayers + ' players).');
        this.global.multiworld[this.id] = this;
    }

    pushToAccount(account, message) {
        if (account && account.user_id in this.outgoingQueues) {
            this.outgoingQueues[account.user_id].push(message.serialize());
        } else {
            Logger.error('pushToAccount: account was undefined');
        }
    }


    pushToRoom(roomId, message, ignoredAccount) {
        var self = this,
            room = this.rooms[roomId];
        if (room) {
            room.forPlayers(function (account) {
                if (account !== null && typeof (account) !== 'undefined') {
                    if (account.user_id != ignoredAccount && account.player.is_bot === 0) {
                        self.pushToAccount(account, message);
                    }
                }
            });
            for(var user_id in room.watchers){
                if(user_id != ignoredAccount)
                    room.watchers[user_id].sendMessage(message);
            }
        }
    }

    pushBroadcast(message, ignoredAccount) {
        var mensaje = JSON.stringify(message.serialize());
        this.server._wss.clients.forEach(function each(client) {
          if (client.readyState === WebSocket.OPEN) {
            client.send(mensaje);
          }
        });
        /*for (var id in this.outgoingQueues) {
            if (id != ignoredAccount) {
                this.outgoingQueues[id].push(message.serialize());
            }
        }*/
    }

    pushBroadcastChat(message, room) {
        if (room) {
            this.pushToRoom(room.id, message);
        } else {
            for (var id in this.outgoingQueues) {
                this.outgoingQueues[id].push(message.serialize());
            }
        }
    }

    pushBroadcastChannel(message) {
        var self = this;
        for (var id in this.outgoingQueues) {
            var account = self.getAccountById(id);
            if (account !== null && account.location_type === Types.LOCATION.CHANNEL && !account.room) {
                if (Array.isArray(message) === true)
                    this.outgoingQueues[id].push(message);
                else
                    this.outgoingQueues[id].push(message.serialize());
            }
        }
    }

    pushBroadcastSTR(message, ignoredAccount) {
        for (var id in this.outgoingQueues) {
            if (id != ignoredAccount) {
                this.outgoingQueues[id].push(message);
            }
        }
    }

    processQueues() {
        var self = this,
            connection;
        for (var id in this.outgoingQueues) {
            if (this.outgoingQueues[id].length > 0) {
                var account = this.getAccountById(id);
                if (account !== null && typeof (account) != 'undefined') {
                    connection = this.server.getConnection(account.con_id);
                    /*console.log(connection._connection.readyState);
                    console.log(connection._connection.readyState==WebSocket.OPEN);*/
                   // if(connection._connection.readyState==WebSocket.OPEN)
                    for (var i = 0; i < this.outgoingQueues[id].length; i++) {
                        try {
                            if (connection._connection.readyState==WebSocket.OPEN)
                                connection.send(this.outgoingQueues[id][i]);
                        } catch (e) {
                            Logger.debug(e);
                        }
                    }
                }
                this.outgoingQueues[id] = [];
            }
        }
    }

    onInit(callback) {
        this.init_callback = callback;
    }

    onAccountConnect(callback) {
        this.connect_callback = callback;
    }

    onAccountEnter(callback) {
        this.enter_callback = callback;
    }

    onAccountAddded(callback) {
        this.added_callback = callback;
    }

    onAccountRemoved(callback) {
        this.removed_callback = callback;
    }

    onRegenTick(callback) {
        this.regen_callback = callback;
    }

    getRoomsArray(free, callback) {
        var self = this;
        var data = [];
        self.forEachRooms(function (rom) {
            if (free === true) {
                if (rom.status === Types.ROOM_STATUS.WAITING) {
                     data.push([
                        rom.id,
                        rom.title,
                        rom.player_count,
                        rom.max_players,
                        rom.status,
                        rom.game_mode,
                        rom.look,
                        rom.map,
                        rom.power,
                        rom.allow_watch
                    ]);
                }
            } else {
                data.push([
                    rom.id,
                    rom.title,
                    rom.player_count,
                    rom.max_players,
                    rom.status,
                    rom.game_mode,
                    rom.look,
                    rom.map,
                    rom.power,
                    rom.allow_watch
                ]);
            }
        });
		data.sort(function(a,b){
            return a[0]-b[0];
        });
        data.sort(function(a,b){
            return b[8]-a[8];
        });
        callback(data);
    }
	
	getRoomsArray1(free, callback) {
        var self = this;
        var data = [];
        self.forEachRooms(function (rom) {
            if (free === true) {
                if (rom.game_mode === Types.GAME_MODE.NORMAL) {
                     data.push([
                        rom.id,
                        rom.title,
                        rom.player_count,
                        rom.max_players,
                        rom.status,
                        rom.game_mode,
                        rom.look,
                        rom.map,
                        rom.power
                    ]);
                }
            } else {
                data.push([
                    rom.id,
                    rom.title,
                    rom.player_count,
                    rom.max_players,
                    rom.status,
                    rom.game_mode,
                    rom.look,
                    rom.map,
                    rom.power
                ]);
            }
        });
		data.sort(function(a,b){
            return a[0]-b[0];
        });
        data.sort(function(a,b){
            return b[8]-a[8];
        });
        callback(data);
    }
	
	getRoomsArray2(free, callback) {
        var self = this;
        var data = [];
        self.forEachRooms(function (rom) {
            if (free === true) {
                if (rom.game_mode === Types.GAME_MODE.BOSS) {
                     data.push([
                        rom.id,
                        rom.title,
                        rom.player_count,
                        rom.max_players,
                        rom.status,
                        rom.game_mode,
                        rom.look,
                        rom.map,
                        rom.power
                    ]);
                }
            } else {
                data.push([
                    rom.id,
                    rom.title,
                    rom.player_count,
                    rom.max_players,
                    rom.status,
                    rom.game_mode,
                    rom.look,
                    rom.map,
                    rom.power
                ]);
            }
        });
		data.sort(function(a,b){
            return a[0]-b[0];
        });
        data.sort(function(a,b){
            return b[8]-a[8];
        });
        callback(data);
    }
	
	getRoomsArray3(free, callback) {
        var self = this;
        var data = [];
        self.forEachRooms(function (rom) {
            if (free === true) {
                if (rom.game_mode === Types.GAME_MODE.SAME) {
                     data.push([
                        rom.id,
                        rom.title,
                        rom.player_count,
                        rom.max_players,
                        rom.status,
                        rom.game_mode,
                        rom.look,
                        rom.map,
                        rom.power
                    ]);
                }
            } else {
                data.push([
                    rom.id,
                    rom.title,
                    rom.player_count,
                    rom.max_players,
                    rom.status,
                    rom.game_mode,
                    rom.look,
                    rom.map,
                    rom.power
                ]);
            }
        });
		data.sort(function(a,b){
            return a[0]-b[0];
        });
        data.sort(function(a,b){
            return b[8]-a[8];
        });
        callback(data);
    }
	
	getRoomsArray4(free, callback) {
        var self = this;
        var data = [];
        self.forEachRooms(function (rom) {
            if (free === true) {
                if (rom.game_mode === Types.GAME_MODE.SCORE) {
                     data.push([
                        rom.id,
                        rom.title,
                        rom.player_count,
                        rom.max_players,
                        rom.status,
                        rom.game_mode,
                        rom.look,
                        rom.map,
                        rom.power
                    ]);
                }
            } else {
                data.push([
                    rom.id,
                    rom.title,
                    rom.player_count,
                    rom.max_players,
                    rom.status,
                    rom.game_mode,
                    rom.look,
                    rom.map,
                    rom.power
                ]);
            }
        });
        data.sort(function(a,b){
            return a[0]-b[0];
        });
        data.sort(function(a,b){
            return b[8]-a[8];
        });
        callback(data);
    }
	
	getRoomPosition(room_id) {
        var self = this;
        var data = [];
        self.forEachRooms(function (rom) {
            data.push({
                id:rom.id,
                power:rom.power
            });
        });
        data.sort(function(a,b){
            return a.id-b.id;
        });
        data.sort(function(a,b){
            return b.power-a.power;
        });
        for(var i=0;i<data.length;i++){
            if (data[i].id == room_id)
                return i;
        }

        return null;
    }

    getRoomById(id, callback) {
        if (this.rooms[id]) {
            callback(this.rooms[id]);
        } else {
            callback(null);
        }
    }

    forEachAccount(callback) {
        for (var user_id in this.accounts) {
            if (this.accounts[user_id] !== null)
                callback(this.accounts[user_id]);
        }
    }

    forEachRooms(callback) {
        for (var id in this.rooms) {
            callback(this.rooms[id]);
        }
    }

    getAccountById(user_id) {
        if (this.accounts[user_id] === null)
            return null;
        return this.accounts[user_id];
    }

    logUsers(){
        var self = this;
        this.forEachAccount(function (account) {
            if (account !== null) {
                console.log(self.id,account.user_id);
            }
        });
    }
    searchAccountById(user_id){
        //console.log(Object.keys(this.multiworld));
       for(var server_id in this.global.multiworld){
        //console.log(Object.keys(this.global.multiworld[server_id].accounts));
        //console.log(Object.keys(this.multiworld[server_id].accounts),Object.keys(this.accounts));
         //this.global.multiworld[server_id].logUsers();
         var account = this.global.multiworld[server_id].getAccountById(user_id.toString());
         //console.log("find_account",account);
         if(account!=null)
            return account;
       }
       return null;
    }

    getBotById(user_id) {
        if (this.bots[user_id] === null)
            return null;
        return this.bots[user_id];
    }

    getIdforRoom() {
        for (var i = 1; i < 4000; i++) {
            if (this.room_ids[i] === null || typeof (this.room_ids[i]) === 'undefined') {
                this.room_ids[i] = true;
                return i;
            }
        }
    }

    removeRoom(id) {
        if (this.rooms[id] !== null) {
            var room = this.rooms[id];
			if(room&&room.watchers)
            for(var user_id in room.watchers){
                var account = room.watchers[user_id];
                room.removeWatcher(account);
                account.sendMessage(new Message.loginResponse(account));
            }
            this.rooms[id] = null;
            this.removeIdforRoom(id);
            delete this.rooms[id];
        }
    }

    removeIdforRoom(id) {
        if (this.room_ids[id] !== null) {
            this.room_ids[id] = false;
            delete this.room_ids[id];
        }
    }

    getIdforBot() {
        for (var i = 60000; i < 60500; i++) {
            if (this.bot_ids[i] === null || this.bot_ids[i] === false || typeof (this.bot_ids[i]) === 'undefined') {
                this.bot_ids[i] = true;
                return i;
            }
        }
    }

    removeIdforBot(id) {
        if (this.bot_ids[id] !== null) {
            this.bot_ids[id] = false;
            delete this.bot_ids[id];
        }
    }

    removeBot() {
        if (this.bot_ids[id] !== null) {
            this.bot_ids[id] = null;
            this.removeIdforBot(id);
            delete this.bot_ids[id];
        }
    }


    checkAccountOnline(user_id, callback) {
        var self = this;
        var exi = false;
        self.forEachAccount(function (account) {
            if (account !== null) {
                if (user_id === account.user_id) {
                    exi = true;
                }
            }
        });
        callback(exi);
    }

    checkAccountOnlineAndClose(user_id, callback) {
        /*var self = this;
        self.forEachAccount(function (account) {
            if (account !== null) {
                if (user_id === account.user_id) {
                    self.closeAccount(account);
                }
            }
        });*/
        callback();
    }

    addAccount(account) {
        account.hasEnteredGame = true;
        this.accounts[account.user_id] = account;
        this.outgoingQueues[account.user_id] = [];
    }

    removeAccount(account) {
        delete this.accounts[account.user_id];
        delete this.outgoingQueues[account.user_id];
    }

    closeAccount(account) {
        var self = this;
        if (typeof (account) !== 'undefined') {
            account.connection.close();
            self.removeAccount(account);
        }
    }
    
    SecondsToString(data_time) {
        var p = Math.abs(parseInt(Date.now() - parseInt(data_time)) / 1000);
        var MS_IN_1_HOUR = 36E5,
            MS_IN_1_DAY = 24 * MS_IN_1_HOUR,
            TIME_MINUTE = 60 * 1E3;
        var w = void 0;
        if (p *= 1E3, p >= MS_IN_1_DAY)
            w = Math.ceil(p / MS_IN_1_DAY) + " días";
        else if (3540000 < p)
            w = Math.ceil(p / MS_IN_1_HOUR) + " horas";
        else
            w = Math.ceil(p / TIME_MINUTE) + " minutos";
        return w;
    }
};