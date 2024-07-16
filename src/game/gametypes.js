var _ = require("underscore");

Types = {
    SERVER_OPCODE: {
        chat: 0,
        my_player_info: 1,
        room_players: 2,
        room_state: 5,
        game_start: 7,
        pchat: 8,
        room_update: 3,
        friend_update: 4,
        play: 6,
        hi: 9,
        rooms_list: 10,
        update: 11,
        dead: 12,
        game_over: 13,
        items: 14,
        master_timer: 15,
        my_avatars: 16,
        alert: 17,
        friends: 18,
        guild: 19,
        info: 20,
        friendreq: 21,
        guildreq: 22,
        guildres: 23,
        logout: 24,
        disconnect_reason: 25,
        login_profile: 26,
        login_avatars: 27,
        pass: 28,
        joined: 29,
        left: 30,
        channel_players: 31,
        changed_mobile: 32,
        changed_team: 33,
        changed_ready: 34,
        slot_update: 35,
        player_left: 36,
        enter_room: 37,
        pass_master: 38,
        extra_room_info: 39,
        alert2: 40,
        tournament_wait: 41,
        team_search: 42,
        game_share: 43,
        relationreq: 44,
        show_revive: 45,
        stop_revive: 46,
        ghost: 47,
        revived: 48,
        notichange: 49,
        action: 50,
        avatar_info: 51,
        shop_page: 52,
        next_avatar: 53,
        daily_cash: 54,
        pool: 55,
        captcha: 56,
        game_use_item: 57,
        watcher_joined: 58,
        watcher_left: 59,
        started_to_shoot: 60,
        look: 61,
        replay: 62,
        filter: 63,
        check_guild_name: 64
    },
    CLIENT_OPCODE: {
        login: 0,
        game_shoot: 1,
        getinfo: 2,
        game_move: 6,
        room_change_team: 7,
        pchat: 8,
        tab: 5,
        room_change_ready: 4,
        mobile: 3,
        chat: 9,
        addfriend: 10,
        refresh_guildies: 11,
        game_start: 12,
        friend_delete: 13,
        delete_avatar: 14,
        guild_approved: 15,
        relationship_change: 16,
        room_title: 17,
        quick_join: 18,
        guild_kick: 19,
        tournament_cancel_wait: 20,
        team_search_cancel: 21,
        equip: 22,
        change_info: 23,
        channel_rooms: 24,
        buy: 25,
        get_room_info: 26,
        friend_approved: 27,
        room_join: 28,
        refresh_friends: 29,
        game_use_item: 30,
        room_options: 31,
        guildres: 32,
        select_bot: 33,
        change_name: 34,
        create_team: 35,
        get_my_avatars: 36,
        game_share: 37,
        room_create: 38,
        refresh: 39,
        tournament_start_game: 40,
        change_lobby_channel: 41,
        guild_leave: 42,
        guildinvite: 43,
        guild_create: 44,
        relationship_approved: 45,
        game_items: 46,
        channel_join: 47,
        event: 48,
        revive: 49,
        send_bcm: 50,
        game_pass_turn: 51,
        get_avatar: 52,
        get_shop_page: 53,
        get_next_avatar: 54,
        pool: 55,
        accept_gift_offer: 56,
        captcha: 57,
        use_exitem: 58,
        room_watch: 59,
        started_to_shoot: 60,
        look: 61,
        check_guild_name: 62
    },
    THOR_LEVEL: [0, 300, 900, 1800, 3200, 6E3],
    DISCONNECT_REASON_INACTIVE: 1,
    DISCONNECT_REASON_FULL: 2,
    DISCONNECT_REASON_CHANGED_CHANNEL: 3,
    DISCONNECT_REASON_BAD_CLIENT: 4,
    CHAT_TYPE: {
        NORMAL: 0,
        GIFT: 1,
        DEAD: 2,
        GOLD: 3,
        POWER_USER: 4,
        GM: 5,
        SYSTEM: 6,
        BUGLE: 7,
        LOSE_LIFE: 8,
        GM_BUGLE: 9,
        NORMAL_TEAM: 10,
        POWER_USER_TEAM: 11,
        LOVE: 12,
        BREAK_UP: 13,
        AUDIO: 14,
        AUDIO_PU: 15,
        AUDIO_GM: 16,
        BOT: 17,
        SPECIAL: 18
    },

    MOBILE: {
        ARMOR: 0,
        ICE: 1,
        ADUKA: 2,
        LIGHTNING: 3,
        BIGFOOT: 4,
        JD: 5,
        ASATE: 6,
        RANDOM: 7,
        KNIGHT: 8,
        FOX: 9,
        DRAGON: 10,
        NAK: 11,
        TRICO: 12,
        MAGE: 13,
        TURTLE: 14,
        BOOMER: 15,
        ELECTRICO: 16,
        GRUB: 17,
        DRAGON2: 18,
        RAON: 19,
        RANDOMIZER: 20,
        FROG: 21,
        KALSIDDON: 22
    },
    
    BULLETS: {
        ARMOR1: 0,
        ARMOR2: 1,
        ARMORSS: 2,
        ARMORSS2: 3,
        ICE1: 4,
        ICE2: 5,
        ICESS: 6,
        ADUKA1: 7,
        ADUKA2: 8,
        ADUKASS: 9,
        TELEPORT: 10,
        LIGHTNING12: 11,
        LIGHTNINGSS: 12,
        BIGFOOT1: 13,
        BIGFOOT2: 14,
        BIGFOOTSS: 15,
        JD1: 16,
        JD2: 17,
        JDSS: 18,
        ASATE1: 19,
        ASATE2: 20,
        ASATESS: 21,
        ASATEION: 22,
        KNIGHT1: 23,
        KNIGHT2: 24,
        KNIGHTSS: 25,
        KNIGHTION: 26,
        TEST: 27,
        FOX1: 28,
        FOX2: 29,
        FOXSS: 30,
        DRAGON1: 31,
        DRAGON2: 32,
        DRAGONSS: 33,
        NAK1: 34,
        NAK2: 35,
        NAK2UG: 36,
        NAKSS: 37,
        TRICO1: 38,
        TRICO2: 39,
        TRICOSS: 40,
        MAGE1: 41,
        MAGE2A: 42,
        MAGE2B: 43,
        MAGESS: 44,
        TURTLE1: 45,
        TURTLE2A: 46,
        TURTLE2B: 47,
        TURTLESS: 48,
        TURTLESS2: 49,
        BOOMER12: 50,
        BOOMERSS: 51,
        GRUB1: 52,
        GRUB2: 53,
        GRUBSS: 54,
        DRAGON2_1: 55,
        DRAGON2_2: 56,
        DRAGON2_SS: 57,
        DRAGON2_SS_ION: 58,
        RAON1: 59,
        RAON2: 60,
        RAONSS: 61,
        RAONSS_WALKER: 62,
        RAONMINE: 63,
        FROG12: 64,
        FROG12_WALKER: 65,
        FROGSS: 66,
        FROGSS_WALKER: 67,
        KALSIDDON1: 68,
        KALSIDDON1_OPEN: 69,
        KALSIDDON1_TINY: 70,
        KALSIDDON2: 71,
        KALSIDDON2_OPEN: 72,
        KALSIDDON2_TINY: 73,
        KALSIDDONSS: 74,
        KALSIDDONSS_OPEN: 75,
        KALSIDDONSS_MED: 76,
        KALSIDDONSS_MED_OPEN: 77,
        KALSIDDONSS_TINY: 78
    },

    EXPLODE: {
        ARMOR1: 0,
        ARMOR2: 1,
        ARMORSS: 2,
        ICE1: 3,
        ICE2: 4,
        ICESS: 5,
        ADUKA1_THOR: 6,
        TELEPORT: 7,
        LIGHTINING12_JD1: 8,
        LIGHTNINGSS: 9,
        BIGFOOT1SS: 10,
        BIGFOOT2: 11,
        JD2: 12,
        JDSS: 13,
        ASATE1: 14,
        ASATE2: 15,
        ASATESS: 16,
        KNIGHT: 17,
        TEST: 18,
        FOX1: 19,
        FOX2: 20,
        FOXSS: 21,
        DRAGON1: 22,
        DRAGON2: 23,
        DRAGONSS: 24,
        NAK1: 25,
        NAK2: 26,
        NAKSS: 27,
        TRICO1: 28,
        TRICO2: 29,
        TRICOSS: 30,
        MAGE1: 31,
        MAGE2: 32,
        MAGESS: 33,
        TURTLE1: 34,
        TURTLE2: 35,
        TURTLESS: 36,
        TURTLESS2: 37,
        BOOMER12: 38,
        BOOMERSS: 39,
        BOOMERSS_CHANGE: 40,
        GRUB1: 41,
        GRUB2: 42,
        GRUBSS: 43,
        DRAGONF: 44,
        DRAGON2_1: 45,
        DRAGON2_2: 46,
        RAON1: 47,
        RAON2: 48,
        RAONSS: 49,
        ELECTRIC: 50,
        SUN: 51,
        USEITEM: 52,
        KALSIDDON: 53
    },
    MOBILES: [],

    LOCATION: {
        UNKNOWN: 0,
        CHANNEL: 1,
        ROOM: 2
    },
    START_GAME_PLAYER: {
        n: 0,
        user_id: 1,
        name: 2,
        guild: 3,
        rank: 4,
        x: 5,
        y: 6,
        hp: 7,
        shield: 8,
        shield_regen: 9,
        minang: 10,
        maxang: 11,
        lastturn: 12,
        mobile: 13,
        avatars: 14,
        aim_s1_ang: 15,
        aim_s1_len: 16,
        aim_s2_ang: 17,
        aim_s2_len: 18,
        aim_ss_ang: 19,
        aim_ss_len: 20,
        relationship_status: 21,
        country: 22
    },
    RECORDER_STATUS: {
        NO_INIT: 0,
        READY_TO_RECORD: 1,
        ASKING_PERMISSION: 2,
        RECORDING: 4,
        PROCESSING: 5,
        LISTEN: 6,
        READING_FILE: 7,
        SENDING: 8
    },
    AVATAR_ID_POWER_USER: 464,
    AVATAR_ID_POWER_USER_BG: 465,
    CHALLENGES: {
        WIN_RATE: 0,
        WEEKLY_RANKINGS: 1,
        GUILDS_RANKINGS: 2,
        ACTIVE_DAYS: 3,
        AVATARS: 4,
        FRIENDS: 5,
        FACEBOOK: 6,
        LEVEL: 7
    },
    ZINDEX: {
        ground: 1,
        player: 1E3,
        player_info: 2E3,
        explode: 3E3,
        thor_shot: 3001,
        thor: 3002,
        lightning: 3003,
        shot: 3004,
        ground_parts: 3005,
        damage: 3006,
        textBubble: 3007
    },
    LOW_FPS: 20,
    E_PLAY: {
        next_turn_number: 0,
        player_number: 1,
        x: 2,
        y: 3,
        look: 4,
        add_delay: 5,
        next_turn_of_player: 6,
        chat: 7,
        thor_x: 8,
        thor_y: 9,
        thor_angle: 10,
        thor_damage: 11,
        new_weather: 12,
        wind_power: 13,
        wind_angle: 14,
        shots: 15,
        gold: 16
    },
	E_PASS: {
		next_turn_number: 0,
		player_number: 1,
		x: 2,
		y: 3,
		look: 4,
		add_delay: 5,
		next_turn_of_player: 6,
		chat: 7,
		thor_x: 8,
		thor_y: 9,
		thor_angle: 10,
		thor_damage: 11,
		new_weather: 12,
		wind_power: 13,
		wind_angle: 14
	},
    STATIC_DIR2: {
        LOCATION_TYPE_UNKNOWN: 0,
        LOCATION_TYPE_CHANNEL: 1,
        LOCATION_TYPE_ROOM: 2,
        ROOM_TYPE_CHANNEL: 0,
        ROOM_TYPE_GAME: 1,
        ROOM_STATUS_WAITING: 0,
        ROOM_STATUS_FULL: 1,
        ROOM_STATUS_PLAYING: 2,
        GUI_LOCATION_CHANNEL: 1,
        GUI_LOCATION_ROOM: 2,
        GUI_LOCATION_GAME: 3,
        GUI_LOCATION_SHOP: 4,
        ITEM_NONE: -1,
        ITEM_DUAL: 0,
        ITEM_TELEPORT: 1,
        ITEM_DUAL_PLUS: 2,
        ITEM_CLASS: ["itemDual", "itemTeleport", "itemDualP"],
        ITEM_SIZE: [2, 2, 2],
        DIR_LEFT: 0,
        DIR_RIGHT: 1,
        /* PLAYER_LOOK_LEFT : DIR_LEFT,
         PLAYER_LOOK_RIGHT : DIR_RIGHT*/
        SHOT1: 0,
        SHOT2: 1,
        SHOTSS: 2,
        AVATAR_TYPE_HEAD: "h",
        AVATAR_TYPE_BODY: "b",
        AVATAR_TYPE_EYES: "g",
        AVATAR_TYPE_FLAG: "f",
        AVATAR_TYPE_BACKGROUND: "1",
        AVATAR_TYPE_FOREGROUND: "2",
        AVATAR_TYPE_EXITEM: "x"
    },
    AVATAR_TYPE_TO_STRING: {
        h: "Head",
        b: "Body",
        g: "Glass",
        f: "Flag",
        1: "Background",
        2: "Foreground",
        x: "ExItem"
    },
    AVATAR_NAKED_HEAD_MALE: 1,
    AVATAR_NAKED_BODY_MALE: 2,
    AVATAR_NAKED_HEAD_FEMALE: 3,
    AVATAR_NAKED_BODY_FEMALE: 4,
    AVATAR_INDEX_N: 0,
    AVATAR_INDEX_TYPE: 1,
    AVATAR_INDEX_GENDER: 2,
    AVATAR_INDEX_NAME: 3,
    AVATAR_INDEX_SHOP: 4,
    AVATAR_INDEX_NOTE: 5,
    AVATAR_INDEX_GOLD_WEEK: 6,
    AVATAR_INDEX_GOLD_MONTH: 7,
    AVATAR_INDEX_GOLD_PERM: 8,
    AVATAR_INDEX_CASH_WEEK: 9,
    AVATAR_INDEX_CASH_MONTH: 10,
    AVATAR_INDEX_CASH_PERM: 11,
    AVATAR_INDEX_STAT_POP: 12,
    AVATAR_INDEX_STAT_TIME: 13,
    AVATAR_INDEX_STAT_ATK: 14,
    AVATAR_INDEX_STAT_DEF: 15,
    AVATAR_INDEX_STAT_LIFE: 16,
    AVATAR_INDEX_STAT_ITEM: 17,
    AVATAR_INDEX_STAT_DIG: 18,
    AVATAR_INDEX_STAT_SHLD: 19,
    AVATAR_INDEX_GRAPHICS: 20,
    AVATAR_INDEX_GLOW: 21,
    AVATAR_INDEX_URL: 22,
	GAME_MODE_NORMAL: 0,
	GAME_MODE_BOSS: 1,
	GAME_MODE_SAME: 2,
	GAME_MODE_SCORE: 3,
	GAME_MODE_NAMES: ["NORMAL", "BOSS", "SAME", "SCORE"],
	GAME_MODE_NAMES_LOWER: ["Normal", "Boss", "Same", "Score"],
	CHAT_LENGTH_LIMIT: 150,
	GENDER_MALE: "m",
	GENDER_FEMALE: "f",
	GENDER_ALL: "a",
	GENDER_FROM_NUMBER: ["m", "f", "a"],
	GENDER_TO_STRING: {
		m: "Male",
		f: "Female",
		a: "All"
	},
	TEAM_A: 0,
	TEAM_B: 1,
	TIE: 2 ,
	RANK_GM: 26,
	RANK_MOD: 27,
	RANK_BRONE_CUP: 28,
	RANK_SILVER_CUP: 29,
	RANK_GOLD_CUP: 30,
	RANK_VIP: 31,
	SUDDEN_DEATH_DOUBLE: 1,
	SUDDEN_DEATH_BIGBOMB: 2,
	SUDDEN_DEATH_SS: 3,
	ROOM: {
		CHANNEL: 0,
		GAME: 1
	},

    ROOM_STATUS: {
        WAITING: 0,
        FULL: 1,
        PLAYING: 2
    },

    ITEM: {
        NONE	 : [0,7],
        DUAL	 : [550,5.5],
        TELEPORT : [350,1],
        DUAL_PLUS: [400,4]
	},

    DIR: {
        LEFT: 0,
        RIGHT: 1
    },

    GAMEMSG: {
        winning_award: 0,
        losing_consolation: 1,
        x_killed_y: 2,
        x_bunge_y: 3,
        ultra_high_ang: 4,
        high_ang: 5,
        excellent_shot: 6,
        good_shot: 7,
        shot_bonus: 8,
        team_damage_penalty: 9,
        killed_by_sd: 10,
        died_by_tele: 11,
        damage_1000: 12,
        damage_2000: 13,
        damage_3000: 14,
        triple_kill: 15,
        double_kill: 16,
        ending_bonus: 17,
        bunge_bonus: 18,
        suicide_penalty: 19,
        unlocked_challenge: 20,
        free_kill_detected: 21,
        suicide_penalty_bunge: 22,
        team_kill_penalty: 23,
        winning_change: 24,
        early_suicide: 25,
        blocked_winning: 26,
        score_change: 27,
        boomer_bonus: 28,
        backshot_bonus: 29,
        hurricane_bonus: 30,
        mirror_bonus: 31,
        x_killed_y2: 32,
        x_bunge_y2: 33,
        gotLetter: 34,     
        bbp_shuper_shot: 35,
        bbp_great_shot: 36,
        bbp_fantastic_shot: 37,
        bbp_unveliable_shot: 38,
        bbp_fantastic_unvali: 39,
        bbp_yes: 40,
        bbp_ohyes: 41
    },

    ALERT2_TYPES: {
        ROOM_DOES_NOT_EXIST: 0,
        ROOM_FULL: 1,
        ROOM_PLAYING: 2,
        WRONG_PASSWORD: 3,
        KICKED: 4,
        MISSING_AVATAR: 5,
        NOT_FOR_SELL: 6,
        BAD_PAYMENT_METHOD: 7,
        BAD_PRICE: 8,
        ALREADY_BUYING: 9,
        ALREADY_HAVE: 10,
        PURCHASED: 11,
        LOCKED_CHALLENGE: 12,
        ALREADY_IN_ROOM: 13,
        WON_EVENT1: 14,
        WON_EVENT2: 15,
        CANT_FRIEND_YOURSELF: 16,
        ADD_FRIEND_OFFLINE: 17,
        ALREADY_FRIENDS: 18,
        CANT_FRIEND_GM: 19,
        ALREADY_ASKED: 20,
        TOO_MANY_FRIENDS_ME: 21,
        TOO_MANY_FRIENDS_HIM: 22,
        FRIEND_REQUEST_SENT: 23,
        FRIEND_ADDED: 24,
        CANT_CHAT_YOURSELF: 25,
        FRIEND_DELETED: 26,
        NOT_IN_GUILD: 27,
        NOT_IN_MY_GUILD: 28,
        NO_KICK_POWER: 29,
        CANT_KICK_YOURSELF: 30,
        KICKED_GUILD: 31,
        CANT_BOSS_PLAYERS: 32,
        ALREADY_IN_GUILD: 33,
        GUILD_BAD_NAME_LEN: 34,
        GUILD_NAME_BAD_WORD: 35,
        GUILD_NO_MONEY: 36,
        GUILD_ALREADY_EXISTS: 37,
        GUILD_CREATED: 38,
        CANT_INVITE_YOURSELF: 39,
        NO_INVITE_POWERS: 40,
        ALREADY_SENT_REQUEST: 41,
        GUILD_IS_FULL: 42,
        GUILD_INVITE_PLAYER_OFFLINE: 43,
        CANT_INVITE_ALREADY_IN_GUILD: 44,
        GUILD_INVITE_SENT: 45,
        JOINED_GUILD: 46,
        GUILD_LEADER_CANT_LEAVE: 47,
        CLOSED_GUILD: 48,
        LEFT_GUILD: 49,
        NAME_SAME: 50,
        NAME_BAD_LEN: 51,
        NAME_FEW_LETTERS: 52,
        NAME_BAD_CHAR: 53,
        NAME_NOT_ENOUGH_CASH: 54,
        NAME_BAD_WORD: 55,
        NAME_NOT_ENOUGH_TIME: 56,
        STILL_PROCESSING_YOUR_LAST_REQUEST: 57,
        NAME_ALREADY_EXISTS: 58,
        NEW_CHALLENGE_UNLOCKED: 59,
        NOT_ENOUGH_CASH: 60,
        NOT_ENOUGH_GOLD: 61,
        AVATAR_WRONG_GENDER: 62,
        TOURNAMENT_NOT_STARTED: 63,
        TOURNAMENT_ENDED: 64,
        GUILDS_LOCK: 65,
        SOMEONE_NOT_READY: 66,
        FEW_PLAYERS: 67,
        NOT_4_SAME_GUILD: 68,
        FEW_PLAYERS4: 69,
        DISQUALIFIED_GUILD: 70,
        DISQUALIFIED_PLAYER: 71,
        NO_GUILD: 72,
        CREATE_ROOM_TOO_FAST: 73,
        RECEIVED_AVATAR: 74,
        NEED_ITEM: 75,
        RELATIONSHIP_REQUEST_SENT: 76,
        CANT_KICK_NON_MEMBER: 77,
        AVATAR_DELETED: 78,
        GIFT_SENT: 79,
        RECEIVER_ALREADY_HAVE: 80,
        CANT_JOIN_GENDER: 81,
        CANT_FRIEND_BLOCKED: 82,
        MUTED: 83,
        ROOM_TITLE_BLOCKED: 84,
        CANT_DUP_CHAT: 85,
        GIFT_NOT_FRIENDS: 86,
        CANT_JOIN_HAVE_AVATAR: 87,
        CANT_JOIN_HAVE_DELETED_AVATAR: 88,
        CANT_JOIN_NEED_AVATAR: 89,
        CANT_JOIN_HAVE_ALL_GM_GIFTS: 90,
        CANT_JOIN_RANK: 91,
        CREATE_ROOM_TOO_MANY: 92,
        NEED_DIFFERENT_MOBILES: 93,
        TOO_MANY_REQUESTS: 94
    },

    PERIOD: {
        WEEK: 0,
        MONTH: 1,
        PERM: 2,
    },

    GAME_MODE: {
		NORMAL: 0,
		BOSS: 1,
		SAME: 2,
		SCORE: 3,
		TAG: 4,

    },
    RANDOMIZER: [0, 1, 2, 3, 4, 12, 13, 14],
    GAME_ID: ["GM", "DN"],
    MAPS_PLAY: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 42, 43, 44, 45, 46, 47, 48, 49],
//    MAPS_PLAY_BOSS: [0, 1, 2, 3, 4, 5], //, 6, 7, 8, 9, 10, 11, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 42, 43, 44, 45, 46, 47, 48, 49],
    MAPS_PLAY_BOSS: [1, 6, 8, 9],
    MOBILE_R: [0, 1, 2, 3, 4, 12, 13, 14, 15],
    COMPUTER_PLAYER : [
        { rank: 1, game_id: "Clown Stripe", gp: 1, atk: 5, def: 0, life: 10, dig: 0, gender: "m", ahead: 17, abody: 31, aflag: 0, aeyes: 0, mobile: 0,guild: ''}, 
        { rank: 2, game_id: "Haris Pilton", gp: 2, atk: 7, def: 4, life: 15, dig: 0, gender: "f", ahead: 42, abody: 45, aflag: 0, aeyes: 0, mobile: 15,guild: ''}, 
        { rank: 3, game_id: "Harly Potler", gp: 3, atk: 10, def: 8, life: 20, dig: 5, gender: "m", ahead: 10, abody: 26, aflag: 0, aeyes: 0, mobile: 3,guild: ''}, 
        { rank: 5, game_id: "Angie Jelly", gp: 4, atk: 12, def: 12, life: 25, dig: 9, gender: "f", ahead: 36, abody: 51, aflag: 0, aeyes: 0, mobile: 6,guild: ''}, 
        { rank: 7, game_id: "Floyd Pinkus", gp: 5, atk: 17, def: 18, life: 30, dig: 14, gender: "m", ahead: 8, abody: 24, aflag: 0, aeyes: 0, mobile: 4,guild: ''}, 
        { rank: 9, game_id: "Yuffie Kisaragi", gp: 6, atk: 25, def: 24, life: 35, dig: 18, gender: "f", ahead: 36, abody: 51, aflag: 0, aeyes: 0, mobile: 3,guild: ''}, 
        { rank: 13, game_id: "Bill Board", gp: 7, atk: 33, def: 32, life: 40, dig: 22, gender: "f", ahead: 34, abody: 54, aflag: 0, aeyes: 0, mobile: 5,guild: ''}, 
        { rank: 15, game_id: "Gilly Gamesh", gp: 8, atk: 40, def: 40, life: 45, dig: 25, gender: "m", ahead: 14, abody: 28, aflag: 0, aeyes: 0, mobile: 1,guild: ''}, 
        { rank: 17, game_id: "Lance Alot", gp: 9, atk: 50, def: 50, life: 50, dig: 10, gender: "m", ahead: 11, abody: 26, aflag: 0, aeyes: 0, mobile: 12,guild: ''}, 
        { rank: 18, game_id: "Voldy Moore", gp: 10, atk: 50, def: 50, life: 50, dig: 20, gender: "m", ahead: 11, abody: 26, aflag: 0, aeyes: 0, mobile: 1,guild: ''}, 
        { rank: 19, game_id: "Jack the Ripper", gp: 11, atk: 50, def: 50, life: 50, dig: 30, gender: "m", ahead: 9, abody: 25, aflag: 0, aeyes: 0, mobile: 4,guild: ''}, 
        { rank: 20, game_id: "Seffy Roth", gp: 12, atk: 50, def: 50, life: 50, dig: 50, gender: "m", ahead: 21, abody: 33, aflag: 0, aeyes: 0, mobile: 0,guild: ''}
    ],
};
Types.WEATHERS = {
	length		: 100,
	_base		: {
		id			: null,
		castAtForce	: [],
		castAtgame  : [],
		castAtShoot	: [],
	},
	list	: {
		thor: {
			id			: 0,
		},
		wind_change: {
			id			: 1,
			castAtForce	: [
                ["Power",{
                    allow : [3,4,5,8],
                    power : [50,100]
                }]
            ],
		},
		no_items: {
			id			: 2,
		},
		sun: {
            id          : 3,
            castAtForce : ["Active","Next"],
            castAtShoot : [["Sun",{
                addtime     : 0,
                damage      : 75,
                pala_bunge  : [40,31],
                weight      : 393,
                explode     : Types.EXPLODE.LIGHTINING12_JD1
            }]],
            power       : [50,150],
		},
		lightning: {
			id			: 4,
			castAtForce	: ["Active","Next"],
		    castAtShoot	: [["Lightning",{
				addtime		: 0,
				damage		: 75,
				pala_bunge	: [40,31],
				weight		: 393,
				explode		: Types.EXPLODE.LIGHTINING12_JD1
			}]],
			power		: [50,150],
		},
		black: {
            id          : 5,
            castAtForce : ["Active","Next"],
            castAtShoot : [["Black",{
                addtime     : 0,
                damage      : 75,
                pala_bunge  : [40,31],
                weight      : 393,
                explode     : Types.EXPLODE.LIGHTINING12_JD1
            }]],
            power       : [50,150],
		},
		random: {
			id			: 6,
			castAtForce	: ["Active","Next"],
			power		: 80
		},
		mirror: {
			id			: 7,
			castAtForce	: ["Active","Next"],
			castAtShoot	: [["Mirror",{
				position	: "parent",
				power		: "auto",
				delay		: 0,
				addtime		: 0,
				addAng		: [0,0]
			}]],
			power		: 50
		},
		tornado: {
			id			: 8,
			collideType	: "power",
			castAtForce	: ["Active","Next"],
			castAtShoot	: [["Tornado",{
				position	: "parent",
				power		: "auto",
				delay		: 0,
				addtime		: 0,
				addAng		: [0,0]
			
			}]],
			power		: [50,200]
		},
		none: {
			id			: 9
		},
	}
}
Types.WEATHERS.active = [
	Types.WEATHERS.list.thor,
	Types.WEATHERS.list.wind_change,
	Types.WEATHERS.list.wind_change,
	Types.WEATHERS.list.wind_change,
	Types.WEATHERS.list.wind_change,
	Types.WEATHERS.list.wind_change,
	Types.WEATHERS.list.wind_change,
	Types.WEATHERS.list.no_items,
	Types.WEATHERS.list.no_items,
	Types.WEATHERS.list.sun,
	Types.WEATHERS.list.lightning,
	Types.WEATHERS.list.black,
	Types.WEATHERS.list.random,
	Types.WEATHERS.list.mirror,
	Types.WEATHERS.list.tornado
]
Types.MOBILES = [
	{
		delay: 510,
		name: "Armor",
		file: "armor",
		player_x: 17,
		player_y: -28,
		shoots: [
			[
				{
					delay		: 250,
					addtime		: 0,
					damage		: 150,
					pala_bunge	: [60,42],
					image		: Types.BULLETS.ARMOR1,
					explode		: Types.EXPLODE.ARMOR1,
					weight		: 398,
					friccion	: 0,
				}
			],
			[
				{
					delay		: 430,
					addtime		: 0,
					damage		: 140,
					pala_bunge	: [34,24],
					image		: Types.BULLETS.ARMOR2,
					explode		: Types.EXPLODE.ARMOR2,
					weight		: 398,
					friccion	: 0,
				},
				{
					addtime		: 0,
					damage		: 140,
					pala_bunge	: [34,24],
					image		: Types.BULLETS.ARMOR2,
					explode		: Types.EXPLODE.ARMOR2,
					weight		: 398,
					friccion	: 0,
				}
			],
			[
				{
					delay		: 800,
					addtime		: 0,
					damage		: 400,
					pala_bunge	: [90,62],
					image		: Types.BULLETS.ARMORSS,
					explode		: Types.EXPLODE.ARMORSS,
					weight		: 398,
					friccion	: 0,
					addAtMaxT	: ["change"],
					ss			: true,
					change	: [
						{
							image		: Types.BULLETS.ARMORSS2
						}
					],
				}
			]
		],
		graphics: [
			[49, 43, 24, 39]
		],
		minang: 10,
		maxang: 55,
		ax: 73.5,
		ay: 0.74,
		bx: 0,/* 0 */
		by: 398,
		aim: [
			[52, 33],
			[52, 33],
			[52, 33]
		]
		//{"a":73.5,"b":0.74,"name":"Armor","max":55,"min":10,"mobilename":"armor","aim":[[52,33],[52,33],[52,33]]}
	}, {
		delay: 490,
		name: "Ice",
		file: "ice",
		player_x: -5,
		player_y: -40,
		shoots: [
			[
				{
					delay		: 250,
					addtime		: 0,
					damage		: 140,
					pala_bunge	: [52,39],
					image		: Types.BULLETS.ICE1,
					explode		: Types.EXPLODE.ICE1,
					weight		: 398,
					friccion	: 0,
				}
			],
			[
				{
					delay		: 400,
					addtime		: 0,
					damage		: 180,
					pala_bunge	: [44,34],
					image		: Types.BULLETS.ICE2,
					explode		: Types.EXPLODE.ICE2,
					weight		: 398,
					friccion	: 0,
				}
			],
			[
				{
					delay		: 800,
					addtime		: 0,
					damage		: 300,
					pala_bunge	: [90,62],
					image		: Types.BULLETS.ICESS,
					explode		: Types.EXPLODE.ICESS,
					weight		: 398,
					friccion	: 0,
					ss			: true,
				}
			]
		],
		graphics: [
			[53, 55, 30, 53]
		],
		minang: 20,
		maxang: 70,
		ax: 62.5,
		ay: 0.625,
		bx: 0,      /* fricción */
		by: 384,    /* peso */
		aim: [
			[58, 50],
			[40, 40],
			[40, 40]
		]
		//{"a":62.5,"b":0.625,"name":"Ice","max":70,"min":20,"mobilename":"ice","aim":[[58,50],[40,40],[40,40]]}
	}, {
		delay: 510,
		name: "Aduka",
		file: "aduka",
		player_x: -7,
		player_y: -24,
		shoots: [
			[
				{
					delay		: 250,
					addtime		: 0,
					damage		: 160,
					pala_bunge	: [40,38],
					image		: Types.BULLETS.ADUKA1,
					explode		: Types.EXPLODE.ADUKA1_THOR,
					weight		: 392,
					friccion	: 0,
				}
			],
			[
				{
					delay		: 400,
					addtime		: 200,
					damage		: null,
					
					image		: Types.BULLETS.ADUKA2,
					explode		: null,
					weight		: 392,
					friccion	: 0,
					addAtEnd	: ["thor"],
					thor: [
						{
							pala_bunge	: [30,20],
							explode		: Types.EXPLODE.ADUKA1_THOR,			
							damage		: 80,
						}
					]
				},
				{
					addtime		: 400,
					damage		: null,
					
					image		: Types.BULLETS.ADUKA2,
					explode		: null,
					weight		: 392,
					friccion	: 0,
					addAtEnd	: ["thor"],
					thor: [
						{
							pala_bunge	: [30,20],
							explode		: Types.EXPLODE.ADUKA1_THOR,			
							damage		: 80,
						}
					]
				},
				{
					addtime		: 600,
					damage		: null,
		
					image		: Types.BULLETS.ADUKA2,
					explode		: null,
					weight		: 392,
					friccion	: 0,
					addAtEnd	: ["thor"],
					thor: [
						{
							pala_bunge	: [30,20],
							explode		: Types.EXPLODE.ADUKA1_THOR,			
							damage		: 80,
						}
					]
				}
			],
			[
				{
					delay			: 800,
					addtime			: 0,
					damage			: null,
					pala_bunge		: [20,10],
					image		: Types.BULLETS.ADUKA2,
					explode			: null,
					weight			: 392,
					friccion		: 0,
					canPlayerCollide: false,
					canMapCollide	: false,
					addAtCollide	: ["thor"],
					ss				: true,
					thor			:[
						{
							addtime		: 300,
							pala_bunge	: [20,10],
							explode		: Types.EXPLODE.ADUKA1_THOR,
							modifiers	: {						
								damage		: 200,
							}
						}
					]
				}
			]
		],
		graphics: [
			[56, 39, 23, 34]
		],
		minang: 110,
		maxang: 170,
		ax: 65.5,
		ay: 0.695,
		bx: 0,/* 0 */
		by: 392,
		aim: [
			[130, 40],
			[130, 40],
			[130, 40]
		]
		//392
		//{"a":62.5,"b":0.69,"name":"Aduka","max":170,"min":110,"mobilename":"aduka","aim":[[130,40],[130,40],[130,40]]}
	}, {
		delay: 500,
		name: "Lightning",
		file: "lightning",
		player_x: 3,
		player_y: -37,
		shoots: [
			[
				{
					delay		: 200,
					addtime		: 0,
					damage		: 150,
					pala_bunge	: [null,null],
					image		: Types.BULLETS.LIGHTNING12,
					explode		: Types.EXPLODE.LIGHTINING12_JD1,
					weight		: 398,
					friccion	: 0,
					addAtEnd	: ["lightning"],
					lightning: [
						{
							addtime		: 0,
							damage		: 75,
							pala_bunge	: [42,30],
							weight		: 393,
							explode		: Types.EXPLODE.LIGHTINING12_JD1
						}
					]
				},
			],
			[
				{
					delay		: 350,
					addtime		: 0,
					damage		: 150,
					pala_bunge	: [null,null],
					image		: Types.BULLETS.LIGHTNING12,
					explode		: Types.EXPLODE.LIGHTINING12_JD1,
					weight		: 398,
					friccion	: 0,
					addAtEnd	: ["lightning"],
					lightning: [
						{
							addtime		: 0,
							damage		: 70,
							pala_bunge	: [42,30],
							explode		: Types.EXPLODE.LIGHTINING12_JD1,
							weight		: 393,
							addx0		: -500
						},
						{
							addtime		: 0,
							damage		: 70,
							pala_bunge	: [42,30],
							explode		: Types.EXPLODE.LIGHTINING12_JD1,
							weight		: 393,
							addx0		: 500
						}
					]
				}
			],
			[
				{
					delay		: 800,
					addtime		: 1000,
					damage		: null,
					pala_bunge	: [null,null],
					image		: Types.BULLETS.LIGHTNINGSS,
					explode		: Types.EXPLODE.LIGHTNINGSS,
					weight		: 393,
					friccion	: 0,
					area		: true,
					addAtEnd	: ["lightning"],
					ss			: true,
					lightning: [
						{
							addtime		: 0,
							damage		: 165,
							pala_bunge	: [42,30],
							weight		: 393,
							explode		: Types.EXPLODE.LIGHTINING12_JD1
						}
					]
				}
			]
		],
		graphics: [
			[69, 43, 32, 40]
		],
		minang: 18,
		maxang: 40,
		ax: 65,
		ay: 0.72,
		bx: 0,/* 0 */
		by: 393,
		aim: [
			[58, 44],
			[58, 44],
			[58, 44]
		]
		//{"a":65,"b":0.72,"name":"Lightning","max":40,"min":18,"mobilename":"lightning","aim":[[58,44],[58,44],[58,44]]}
	}, {
		delay: 520,
		name: "Bigfoot",
		file: "bigfoot",
		player_x: 5,
		player_y: -32,
		shoots: [
			[
				{
					delay		: 250,
					addtime		: 0,
					damage		: 40,
					pala_bunge	: [39,22],
					image		: Types.BULLETS.BIGFOOT1,
					explode		: Types.EXPLODE.BIGFOOT1SS,
					weight		: 396,
					friccion	: 0
				},
				{
					addtime		: 100,
					damage		: 40,
					pala_bunge	: [39,22],
					image		: Types.BULLETS.BIGFOOT1,
					explode		: Types.EXPLODE.BIGFOOT1SS,
					weight		: 396,
					friccion	: 0,
					modifiers		: {
						y0			: -10,
						ang			: 4,
						power		: 10
					}
				},
				{
					addtime		: 200,
					damage		: 40,
					pala_bunge	: [39,22],
					image		: Types.BULLETS.BIGFOOT1,
					explode		: Types.EXPLODE.BIGFOOT1SS,
					weight		: 396,
					friccion	: 0,
					modifiers		: {
						y0			: -10,
						ang			: -2,
						power		: -10
					}
				},
				{
					addtime		: 300,
					damage		: 40,
					pala_bunge	: [39,22],
					image		: Types.BULLETS.BIGFOOT1,
					explode		: Types.EXPLODE.BIGFOOT1SS,
					weight		: 396,
					friccion	: 0,
					modifiers		: {
						y0			: -10,
						ang			: 6,
						power		: 20
					}
				}
			],
			[
				{
					delay		: 400,
					addtime		: 0,
					damage		: 44,
					pala_bunge	: [38,22],
					image		: Types.BULLETS.BIGFOOT2,
					explode		: Types.EXPLODE.BIGFOOT2,
					weight		: 396,
					friccion	: 0
				},
				{
					addtime		: 0,
					damage		: 44,
					pala_bunge	: [38,22],
					image		: Types.BULLETS.BIGFOOT2,
					explode		: Types.EXPLODE.BIGFOOT2,
					weight		: 396,
					friccion	: 0,
					modifiers		: {
						ang			: 5,
						power		: 15
					}
				},
				{
					addtime		: 0,
					damage		: 44,
					pala_bunge	: [38,22],
					image		: Types.BULLETS.BIGFOOT2,
					explode		: Types.EXPLODE.BIGFOOT2,
					weight		: 396,
					friccion	: 0,
					modifiers		: {
						ang			: 10,
						power		: 30
					}
				},
				{
					addtime		: 100,
					damage		: 44,
					pala_bunge	: [38,22],
					image		: Types.BULLETS.BIGFOOT2,
					explode		: Types.EXPLODE.BIGFOOT2,
					weight		: 396,
					friccion	: 0
				},
				{
					addtime		: 100,
					damage		: 44,
					pala_bunge	: [38,22],
					image		: Types.BULLETS.BIGFOOT2,
					explode		: Types.EXPLODE.BIGFOOT2,
					weight		: 396,
					friccion	: 0,
					modifiers		: {
						ang			: 5,
						power		: 15
					}
				},
				{
					addtime		: 100,
					damage		: 44,
					pala_bunge	: [38,22],
					image		: Types.BULLETS.BIGFOOT2,
					explode		: Types.EXPLODE.BIGFOOT2,
					weight		: 396,
					friccion	: 0,
					modifiers		: {
						ang			: 10,
						power		: 30
					}
				}
			],
			[
				{
					delay		: 800,
					addtime		: 0,
					damage		: 42,
					pala_bunge	: [39,22],
					image		: Types.BULLETS.BIGFOOTSS,
					explode		: Types.EXPLODE.BIGFOOT1SS,
					weight		: 396,
					ss			: true,
					friccion	: 0
				},
				{
					addtime		: 50,
					damage		: 42,
					pala_bunge	: [39,22],
					image		: Types.BULLETS.BIGFOOTSS,
					explode		: Types.EXPLODE.BIGFOOT1SS,
					weight		: 396,
					friccion	: 0,
					modifiers		: {
						ang			: 4,
						power		: 10
					}
				},
				{
					addtime		: 100,
					damage		: 42,
					pala_bunge	: [39,22],
					image		: Types.BULLETS.BIGFOOTSS,
					explode		: Types.EXPLODE.BIGFOOT1SS,
					weight		: 396,
					friccion	: 0,
					modifiers		: {
						ang			: -2,
						power		: -10
					}
				},
				{
					addtime		: 150,
					damage		: 42,
					pala_bunge	: [39,22],
					image		: Types.BULLETS.BIGFOOTSS,
					explode		: Types.EXPLODE.BIGFOOT1SS,
					weight		: 396,
					friccion	: 0,
					modifiers		: {
						ang			: 6,
						power		: 20
					}
				},
				{
					addtime		: 200,
					damage		: 42,
					pala_bunge	: [39,22],
					image		: Types.BULLETS.BIGFOOTSS,
					explode		: Types.EXPLODE.BIGFOOT1SS,
					weight		: 396,
					friccion	: 0,
					modifiers		: {
						ang			: 1
					}
				},
				{
					addtime		: 250,
					damage		: 42,
					pala_bunge	: [39,22],
					image		: Types.BULLETS.BIGFOOTSS,
					explode		: Types.EXPLODE.BIGFOOT1SS,
					weight		: 396,
					friccion	: 0,
					modifiers		: {
						ang			: 3,
						power		: 10
					}
				},
				{
					addtime		: 300,
					damage		: 42,
					pala_bunge	: [39,22],
					image		: Types.BULLETS.BIGFOOTSS,
					explode		: Types.EXPLODE.BIGFOOT1SS,
					weight		: 396,
					friccion	: 0,
					modifiers		: {
						ang			: -1,
						power		: -10
					}
				},
				{
					addtime		: 350,
					damage		: 42,
					pala_bunge	: [39,22],
					image		: Types.BULLETS.BIGFOOTSS,
					explode		: Types.EXPLODE.BIGFOOT1SS,
					weight		: 396,
					friccion	: 0,
					modifiers		: {
						ang			: 5,
						power		: 20
					}
				}
			]
		],
		graphics: [
			[76, 47, 28, 42]
		],
		minang: 20,
		maxang: 45,
		ax: 88,
		ay: 0.74,
		bx: 0,/* 0 */
		by: 396,
		aim: [
			[58, 50],
			[58, 50],
			[58, 50]
		]
		//{"a":88,"b":0.74,"name":"BigFoot","max":45,"min":20,"mobilename":"bigfoot","aim":[[58,50],[58,50],[58,50]]}
	}, {
		delay: 520,
		name: "J.D",
		file: "jd",
		player_x: 11,
		player_y: -34,
		shoots: [
			[
				{
					delay		: 250,
					addtime		: 0,
					damage		: 330,
					pala_bunge	: [59,40],
					image		: Types.BULLETS.JD1,
					explode		: Types.EXPLODE.LIGHTINING12_JD1,
					weight		: 387,
					friccion	: 0
				},
			],
			[
				{
					delay		: 400,
					addtime		: 0,
					damage		: 250,
					pala_bunge	: [59,40],
					image		: Types.BULLETS.JD2,
					explode		: Types.EXPLODE.JD2,
					weight		: 387,
					friccion	: 0,
					teleport	:true
				},
			],
			[
				{
					delay		: 800,
					addtime		: 0,
					damage		: 400,
					pala_bunge	: [63,47],
					image		: Types.BULLETS.JDSS,
					explode		: Types.EXPLODE.JDSS,
					weight		: 387,
					friccion	: 0,
					ss			: true,
					teleport:true
				},
			]
		],
		graphics: [
			[73, 50, 46, 46]
		],
		minang: 15,
		maxang: 65,
		ax: 62.5,
		ay: 0.625,
		bx: 0,/* 0 */
		by: 387,
		aim: [
			[68, 45],
			[68, 45],
			[68, 45]
		]
		//{"a":62.5,"b":0.625,"name":"J.D","max":65,"min":15,"mobilename":"jd","aim":[[68,45],[68,45],[68,45]]}
	}, {
		delay: 480,
		name: "A.Sate",
		file: "asate",
		player_x: 13,
		player_y: -30,
		shoots: [
			[
				{
					delay		: 250,
					addtime		: 0,
					damage		: null,
					pala_bunge	: [null,null],
					image		: Types.BULLETS.ASATE1,
					explode		: null,
					weight		: 398,
					friccion	: 0,
					addAtEnd	: ["ion"],
					ion: [
						{
							addtime		: 4,
							damage		: 150,
							pala_bunge	: [32,25],
							image		: Types.BULLETS.ASATEION,
							explode		: Types.EXPLODE.ASATE1
						}
					]
				}
			],
			[
				{
					delay		: 400,
					addtime		: 0,
					damage		: null,
					pala_bunge	: [null,null],
					image		: Types.BULLETS.ASATE2,
					explode		: null,
					weight		: 398,
					friction	: 0,
					addAtEnd	: ["ion"],
					ion: [
						{
							addtime		: 200,
							damage		: 250,
							pala_bunge	: [32,24],
							image		: Types.BULLETS.ASATEION, // primera
							explode		: Types.EXPLODE.ASATE2,
							addToObX	: [10,-10],
						},
						{
							addtime		: 200,
							damage		: 54,
							pala_bunge	: [32,24],
							image		: Types.BULLETS.ASATEION,  // centro
							explode		: Types.EXPLODE.ASATE2,
						},
						{
							addtime		: 200,
							damage		: 54,
							pala_bunge	: [33,24],
							image		: Types.BULLETS.ASATEION,  //ultima
							explode		: Types.EXPLODE.ASATE2,
							addToObX	: [-15,10],
						}
					]
				}
			],
			[
				{
					delay		: 800,
					addtime		: 0,
					damage		: null,
					pala_bunge	: [null,null],
					image		: Types.BULLETS.ASATE1,
					explode		: null,
					weight		: 398,
					friction	: 0,
					addAtEnd	: ["ion"],
					ss			: true,
					ion: [
						{
							addtime		: 150,
							damage		: 55,
							pala_bunge	: [27,18],
							image		: Types.BULLETS.ASATEION,
							explode		: Types.EXPLODE.ASATESS,
							addToX		: -40
						},
						{
							addtime		: 150,
							damage		: 55,
							pala_bunge	: [27,18],
							image		: Types.BULLETS.ASATEION,
							explode		: Types.EXPLODE.ASATESS,
							addToX		: 40
						},
						{
							addtime		: 150,
							damage		: 55,
							pala_bunge	: [27,18],
							image		: Types.BULLETS.ASATEION,
							explode		: Types.EXPLODE.ASATESS,
							addToX		: 20
						},
						{
							addtime		: 150,
							damage		: 55,
							pala_bunge	: [27,18],
							image		: Types.BULLETS.ASATEION,
							explode		: Types.EXPLODE.ASATESS,
							addToX		: -20
						},
						{
							addtime		: 150,
							damage		: 55,
							pala_bunge	: [27,18],
							image		: Types.BULLETS.ASATEION,
							explode		: Types.EXPLODE.ASATESS,
							addToX		: 30
						},
						{
							addtime		: 150,
							damage		: 55,
							pala_bunge	: [27,18],
							image		: Types.BULLETS.ASATEION,
							explode		: Types.EXPLODE.ASATESS,
							addToX		: 0
						}
					]
				}
			]
		],
		graphics: [
			[64, 55, 32, 48]
		],
		ion_file: "asateIon",
		ion_graphics: [
			[32, 19, 16, 9], 
			[32, 18, 16, 9], 
			[32, 17, 16, 8], 
			[32, 15, 16, 7], 
			[32, 14, 16, 7], 
			[32, 12, 16, 6], 
			[32, 14, 16, 7], 
			[32, 17, 16, 9], 
			2, 
			[32, 14, 16, 7], 
			[32, 12, 16, 6], 
			[32, 13, 16, 7], 
			[32, 15, 16, 8], 
			[32, 17, 16, 9], 
			[32, 18, 16, 9], 
			[32, 19, 16, 10], 
			[32, 20, 16, 10], 
			2
		],
		minang: 20,
		maxang: 60,
		ax: 76,
		ay: 0.765,
		bx: 0,/* 0 */
		by: 412,
		aim: [
			[40, 30],
			[40, 30],
			[40, 30]
		]
		//{"a":76,"b":0.765,"name":"A.Sate","max":60,"min":20,"mobilename":"asate","aim":[[40,30],[40,30],[40,30]]}
	}, {
		name: "Random",
		file: "random",
		player_x: 8,
		player_y: -38,
		graphics: [
			[33, 47, 20, 50]
		],
		/** @TODO falta definir*/
		minang: 20,
		maxang: 60,
		ax: 81,
		ay: 0.827,
		bx: 0,/* 0 */
		by: 329,
		aim: [
			[51, 51],
			[51, 51],
			[51, 51]
		]
	}, {
		delay: 550,
		name: "Knight",
		file: "knight",
		player_x: -6,
		player_y: -38,
		shoots: [
			[
				{
					delay		: 250,
					addtime		: 0,
					damage		: null,
					pala_bunge	: [null,null],
					image		: Types.BULLETS.KNIGHT1,
					explode		: null,
					weight		: 398,
					friccion	: 0,
					addAtEnd	: ["ion"],
					ion: [
						{
							addtime		: 400,
							damage		: 250,
							pala_bunge	: [38,41],
							image		: Types.BULLETS.KNIGHTION,
							explode		: Types.EXPLODE.KNIGHT
						}
					]
				}
			],
			[
				{
					delay		: 400,
					addtime		: 0,
					damage		: null,
					pala_bunge	: [null,null],
					image		: Types.BULLETS.KNIGHT2,
					explode		: null,
					weight		: 398,
					friction	: 0,
					addAtEnd	: ["ion"],
					ion: [
						{
							addtime		: 300,
							damage		: 250,
							pala_bunge	: [38,41],
							image		: Types.BULLETS.KNIGHTION,
							explode		: Types.EXPLODE.KNIGHT,
							addToObX	: [25,-25],
						},
						{
							addtime		: 300,
							damage		: 250,
							pala_bunge	: [38,41],
							image		: Types.BULLETS.KNIGHTION,
							explode		: Types.EXPLODE.KNIGHT,
							addToObX	: [25,-25],
						},
						{
							addtime		: 300,
							damage		: 250,
							pala_bunge	: [38,41],
							image		: Types.BULLETS.KNIGHTION,
							explode		: Types.EXPLODE.KNIGHT,
							addToObX	: [25,-25],
						}
					]
				}
			],
			[
				{
					delay		: 840,
					addtime		: 0,
					damage		: null,
					pala_bunge	: [null,null],
					image		: Types.BULLETS.ASATESS,
					explode		: null,
					weight		: 398,
					friction	: 0,
					addAtEnd	: ["ion"],
					ss			: true,
					ion: [
						{
							addtime		: 200,
							damage		: 175,
							pala_bunge	: [38,41],
							image		: Types.BULLETS.KNIGHTION,
							explode		: Types.EXPLODE.KNIGHT,
							addToX		: -20
						},
						{
							addtime		: 200,
							damage		: 75,
							pala_bunge	: [38,41],
							image		: Types.BULLETS.KNIGHTION,
							explode		: Types.EXPLODE.KNIGHT,
							addToX		: 40
						},
						{
							addtime		: 200,
							damage		: 75,
							pala_bunge	: [38,41],
							image		: Types.BULLETS.KNIGHTION,
							explode		: Types.EXPLODE.KNIGHT,
							addToX		: -20
						},
						{
							addtime		: 200,
							damage		: 75,
							pala_bunge	: [38,41],
							image		: Types.BULLETS.KNIGHTION,
							explode		: Types.EXPLODE.KNIGHT,
							addToX		: 20
						},
						{
							addtime		: 200,
							damage		: 75,
							pala_bunge	: [38,41],
							image		: Types.BULLETS.KNIGHTION,
							explode		: Types.EXPLODE.KNIGHT,
							addToX		: 20
						},
						{
							addtime		: 200,
							damage		: 75,
							pala_bunge	: [38,41],
							image		: Types.BULLETS.KNIGHTION,
							explode		: Types.EXPLODE.KNIGHT,
							addToX		: 0
						}
					]
				}
			]
		],
		graphics: [
			[58, 51, 35, 49]
		],
		ion_file: "knightIon",
		ion_graphics: [
			[32, 15, 16, 8]
		],
		/** @TODO falta definir*/
		minang: 20,
		maxang: 60,
		ax: 65.5,
		ay: 0.695,
		bx: 0,/* 0 */
		by: 360,
		aim: [
			[40, 30],
			[40, 30],
			[40, 30]
		]
	}, {
		delay: 615,
		name: "Fox",
		file: "fox",
		player_x: -2,
		player_y: -31,
		shoots: [
			[
				{
					delay		: 150,
					addtime		: 0,
					damage		: 330,
					pala_bunge	: [38,41],
					image		: Types.BULLETS.FOX1,
					explode		: Types.BULLETS.FOX1,
					weight		: 398,
					friccion	: 0
				}
			],
			[
				{
					delay		: 360,
					addtime		: 0,
					damage		: null,
					pala_bunge	: [null,null],
					heal		: 250,
					image		: Types.BULLETS.FOX2,
					explode		: Types.BULLETS.FOX2,
					weight		: 398,
					friccion	: 0
				}
			],
			[
				{
					delay		: 700,
					addtime		: 0,
					damage		: 400,
					pala_bunge	: [58,61],
					image		: Types.BULLETS.FOXSS,
					explode		: Types.EXPLODE.FOXSS,
					weight		: 398,
					friccion	: 0,
					ss			: true,
				}
			]
		],
		graphics: [
			[93, 54, 42, 49]
		],
		/** @TODO falta definir*/
		minang: 20,
		maxang: 60,
		ax: 61,
		ay: 0.61,
		bx: 0,/* 0 */
		by: 398,
		aim: [
			[40, 30],
			[40, 30],
			[40, 30]
		]
	}, {
		delay: 550,
		name: "Barney",
		file: "dragon",
		player_x: 14,
		player_y: -41,
		shoots: [
			[
				{
					delay		: 250,
					addtime		: 0,
					damage		: 80,
					pala_bunge	: [40,30],
					image		: Types.BULLETS.DRAGON1,
					explode		: Types.EXPLODE.DRAGON1,
					weight		: 396,
					friccion	: 0
				},
				{
					addtime		: 100,
					damage		: 80,
					pala_bunge	: [40,30],
					image		: Types.BULLETS.DRAGON1,
					explode		: Types.EXPLODE.DRAGON1,
					weight		: 396,
					friccion	: 0,
					modifiers		: {
						y0			: -10,
						ang			: 4,
						power		: 10
					}
				},
				{
					addtime		: 200,
					damage		: 80,
					pala_bunge	: [40,30],
					image		: Types.BULLETS.DRAGON1,
					explode		: Types.EXPLODE.DRAGON1,
					weight		: 396,
					friccion	: 0,
					modifiers		: {
						y0			: -10,
						ang			: -2,
						power		: -10
					}
				},
				{
					addtime		: 300,
					damage		: 80,
					pala_bunge	: [40,30],
					image		: Types.BULLETS.DRAGON1,
					explode		: Types.EXPLODE.DRAGONSS,
					weight		: 396,
					friccion	: 0,
					modifiers		: {
						y0			: -10,
						ang			: 6,
						power		: 20
					}
				}
			],
			[
				{
					delay		: 400,
					addtime		: 0,
					damage		: 90,
					pala_bunge	: [40,30],
					image		: Types.BULLETS.DRAGON2,
					explode		: Types.EXPLODE.DRAGON2,
					weight		: 396,
					friccion	: 0
				},
				{
					addtime		: 0,
					damage		: 90,
					pala_bunge	: [40,30],
					image		: Types.BULLETS.DRAGON2,
					explode		: Types.EXPLODE.DRAGON2,
					weight		: 396,
					friccion	: 0,
					modifiers		: {
						ang			: 5,
						power		: 15
					}
				},
				{
					addtime		: 0,
					damage		: 90,
					pala_bunge	: [40,30],
					image		: Types.BULLETS.DRAGON2,
					explode		: Types.EXPLODE.DRAGON2,
					weight		: 396,
					friccion	: 0,
					modifiers		: {
						ang			: 10,
						power		: 30
					}
				},
				{
					addtime		: 100,
					damage		: 90,
					pala_bunge	: [40,30],
					image		: Types.BULLETS.DRAGON2,
					explode		: Types.EXPLODE.DRAGON2,
					weight		: 396,
					friccion	: 0
				},
				{
					addtime		: 100,
					damage		: 90,
					pala_bunge	: [40,30],
					image		: Types.BULLETS.DRAGON2,
					explode		: Types.EXPLODE.DRAGON2,
					weight		: 396,
					friccion	: 0,
					modifiers		: {
						ang			: 5,
						power		: 15
					}
				},
				{
					addtime		: 100,
					damage		: 90,
					pala_bunge	: [40,30],
					image		: Types.BULLETS.DRAGON2,
					explode		: Types.EXPLODE.DRAGON2,
					weight		: 396,
					friccion	: 0,
					modifiers		: {
						ang			: 10,
						power		: 30
					}
				}
			],
			[
				{
					delay		: 800,
					addtime		: 0,
					damage		: 70,
					pala_bunge	: [40,30],
					image		: Types.BULLETS.DRAGONSS,
					explode		: Types.EXPLODE.DRAGONSS,
					weight		: 396,
					ss			: true,
					friccion	: 0
				},
				{
					addtime		: 50,
					damage		: 70,
					pala_bunge	: [40,30],
					image		: Types.BULLETS.DRAGONSS,
					explode		: Types.EXPLODE.DRAGONSS,
					weight		: 396,
					friccion	: 0,
					modifiers		: {
						ang			: 4,
						power		: 10
					}
				},
				{
					addtime		: 100,
					damage		: 70,
					pala_bunge	: [40,30],
					image		: Types.BULLETS.DRAGONSS,
					explode		: Types.EXPLODE.DRAGONSS,
					weight		: 396,
					friccion	: 0,
					modifiers		: {
						ang			: -2,
						power		: -10
					}
				},
				{
					addtime		: 150,
					damage		: 70,
					pala_bunge	: [40,30],
					image		: Types.BULLETS.DRAGONSS,
					explode		: Types.EXPLODE.DRAGONSS,
					weight		: 396,
					friccion	: 0,
					modifiers		: {
						ang			: 6,
						power		: 20
					}
				},
				{
					addtime		: 200,
					damage		: 70,
					pala_bunge	: [40,30],
					image		: Types.BULLETS.DRAGONSS,
					explode		: Types.EXPLODE.DRAGONSS,
					weight		: 396,
					friccion	: 0,
					modifiers		: {
						ang			: 1
					}
				},
				{
					addtime		: 250,
					damage		: 70,
					pala_bunge	: [40,30],
					image		: Types.BULLETS.DRAGONSS,
					explode		: Types.EXPLODE.DRAGONSS,
					weight		: 396,
					friccion	: 0,
					modifiers		: {
						ang			: 3,
						power		: 10
					}
				},
				{
					addtime		: 300,
					damage		: 70,
					pala_bunge	: [40,30],
					image		: Types.BULLETS.DRAGONSS,
					explode		: Types.EXPLODE.DRAGONSS,
					weight		: 396,
					friccion	: 0,
					modifiers		: {
						ang			: -1,
						power		: -10
					}
				},
				{
					addtime		: 350,
					damage		: 70,
					pala_bunge	: [40,30],
					image		: Types.BULLETS.DRAGONSS,
					explode		: Types.EXPLODE.DRAGONSS,
					weight		: 396,
					friccion	: 0,
					modifiers		: {
						ang			: 5,
						power		: 20
					},
				}
			]
		],
		graphics: [
			[[55, 74, 24, 65], 19]
		],
		/** @TODO falta definir*/
		minang: 15,
		maxang: 50,
		ax: 71.5,
		ay: 1.78,
		bx: 0,
		by: 380,
		aim: [
			[58, 50],
			[58, 50],
			[58, 50]
		]
	}, {
		delay: 520,
		name: "Nak",
		file: "nak",
		player_x: -5,
		player_y: -26,
		shoots: [
			[
				{
					delay		: 250,
					addtime		: 0,
					damage		: 140,
					pala_bunge	: [38,41],
					image		: Types.BULLETS.NAK1,
					explode		: Types.EXPLODE.NAK1,
					weight		: 360,
					friccion	: 0
				}
			],
			[
				{
					delay		: 400,
					addtime		: 0,
					damage		: null,
					pala_bunge	: [null,null],
					image		: Types.BULLETS.NAK2,
					explode		: null,
					canPlayerCollide: false,
					weight		: 360,
					friccion	: 0,
					addAtEnd	: ["digger"],
					digger		: [
						{
							addtime		: 0,
							damage		: 140,
							pala_bunge	: [38,41],
							explode		: Types.EXPLODE.NAK2,
							image		: Types.BULLETS.NAK2UG,				
							canPlayerCollide: false,				
							canMapCollide: false,
							weight		: -360,
							power		: "parent"
						}
					]
				}
			],
			[
				{
					delay			: 800,
					addtime			: 100,
					damage			: 250,
					pala_bunge		: [60,63],
					image		: Types.BULLETS.NAKSS,
					explode			: Types.EXPLODE.NAKSS,
					weight			: 360,
					friccion		: 0,
					canMapCollide	: false,
					ss				: true,
				}
			]
		],
		graphics: [
			[51, 33, 23, 30]
		],  //scavenge
		minang: 110,
		maxang: 170,
		ax: 82,
		ay: 0.867,
		bx: 0,/* 0 */
		by: 360,
		aim: [
			[130, 40],
			[130, 40],
			[130, 40]
		]
		//{"a":82,"b":0.867,"name":"Nak","max":170,"min":110,"mobilename":"nak","aim":[[130,40],[130,40],[130,40]]}
	}, {
		delay: 490,
		name: "Trico",
		file: "dino",
		player_x: -5,
		player_y: -41,
		shoots: [
			[
				{
					delay		: 250,
					addtime		: 0,
					damage		: 127,
					pala_bunge	: [45,35],
					image		: Types.BULLETS.TRICO1,
					explode		: Types.EXPLODE.TRICO1,
					weight		: 395,
					friccion	: 0
				}
			],
			[
				{
					delay		: 400,
					addtime		: 0,
					damage		: 90,
					pala_bunge	: [34,25],
					image		: Types.BULLETS.TRICO2,
					explode		: Types.EXPLODE.TRICO2,
					weight		: 395,
					friccion	: 0,
				},
				{
					addtime		: 0,
					damage		: 90,
					pala_bunge	: [34,25],
					image		: Types.BULLETS.TRICO2,
					explode		: Types.EXPLODE.TRICO2,
					weight		: 395,
					friccion	: 0,
					addOrbit	: [180, [150,-150], 0.5, 45],
				},
				{
					addtime		: 0,
					damage		: 90,
					pala_bunge	: [34,25],
					image		: Types.BULLETS.TRICO2,
					explode		: Types.EXPLODE.TRICO2,
					weight		: 395,
					friccion	: 0,
					addOrbit	: [0, [150,-150], 0.5, 45]
				}
			],
			[
				{
					delay		: 800,
					addtime		: 0,
					damage		: 481,
					pala_bunge	: [73,55],
					image		: Types.BULLETS.TRICOSS,
					explode		: Types.EXPLODE.TRICOSS,
					weight		: 395,
					friccion	: 0,
					ss			: true
				}
			]
		],
		graphics: [
			[60, 52, 33, 51]
		],
		minang: 10,
		maxang: 60,
		ax: 84,
		ay: 0.87,
		bx: 0,/* 0 */
		by: 395,
		aim: [
			[58, 50],
			[58, 50],
			[58, 50]
		]
		//{"a":83,"b":0.87,"name":"Trico","max":60,"min":10,"mobilename":"dino","aim":[[58,50],[58,50],[58,50]]}
	}, {
		delay: 500,
		name: "Mage",
		file: "mage",
		player_x: 4,
		player_y: -36,
		shoots: [
			[
				{
					delay		: 250,
					addtime		: 0,
					damage		: 180,
					pala_bunge	: [56,34],
					image		: Types.BULLETS.MAGE1,
					explode		: Types.EXPLODE.MAGE1,
					weight		: 360,
					friccion	: 0
				}
			],
			[
				{
					delay		: 400,
					addtime		: 0,
					damage		: 134,
					pala_bunge	: [48,27],
					image		: Types.BULLETS.MAGE2A,
					explode		: Types.EXPLODE.MAGE2,
					weight		: 360,
					friccion	: 0,
					wave		: 1
				},
				{
					addtime		: 0,
					damage		: 134,
					pala_bunge	: [48,27],
					image		: Types.BULLETS.MAGE2B,
					explode		: Types.EXPLODE.MAGE2,
					weight		: 360,
					friccion	: 0,
					wave		: 2
				}
			],
			[
				{
					delay		: 800,
					addtime		: 0,
					damage		: 330,
					pala_bunge	: [54,30],
					image		: Types.BULLETS.MAGESS,
					explode		: Types.EXPLODE.MAGESS,
					weight		: 360,
					friccion	: 0,
					ss			: true
				}
			]
		],
		graphics: [
			[46, 41, 25, 44]
		],
		minang: 15,
		maxang: 50,
		ax: 71.5,
		ay: 0.78,
		bx: 0,/* 0 */
		by: 360,
		aim: [
			[58, 50],
			[58, 50],
			[58, 50]
		]
		//{"a":71.5,"b":0.78,"name":"Mage","max":50,"min":15,"mobilename":"mage","aim":[[58,50],[58,50],[58,50]]}
	}, {
		delay: 490,
		name: "Turtle",
		file: "turtle",
		player_x: -1,
		player_y: -35,
		shoots: [
			[
				{
					delay		: 250,
					addtime		: 0,
					damage		: 150,
					pala_bunge	: [56,34],
					image		: Types.BULLETS.TURTLE1,
					explode		: Types.EXPLODE.TURTLE1,
					weight		: 389,
					friccion	: 0
				}
			],
			[
				{
					delay		: 480,
					addtime		: 0,
					damage		: 140,
					pala_bunge	: [48,27],
					image		: Types.BULLETS.TURTLE2A,
					explode		: Types.EXPLODE.MAGE2,
					weight		: 389,
					friccion	: 0,
					wave		: 3
				},
				{
					addtime		: 0,
					damage		: 140,
					pala_bunge	: [48,27],
					image		: Types.BULLETS.TURTLE2B,
					explode		: Types.EXPLODE.TURTLE2,
					weight		: 389,
					friccion	: 0,
					wave		: 4
				}
			],
			[
				{
					delay		: 800,
					addtime		: 0,
					damage		: 100,
					pala_bunge	: [50,40],
					image		: Types.BULLETS.TURTLESS,
					explode		: Types.EXPLODE.TURTLESS,
					weight		: 389,
					ss          : true,
					friccion	: 0,
					addAtMaxT	: ["change","bulets"],
					change		: [{
						image		: Types.BULLETS.TURTLESS2,
						explode		: Types.EXPLODE.TURTLESS2,
					}],
					bulets		: [
						{
							position	: "time",
							power		: "parent",
							delay		: 750,
							addtime		: 0,
							damage		: 100,
							pala_bunge	: [50,40],
							image		: Types.BULLETS.TURTLESS2,
							explode		: Types.EXPLODE.TURTLESS2,
							weight		: 389,
							friccion	: 0,
							addAng		: [-10,10]
						},
						{
							position	: "time",
							power		: "parent",
							delay		: 750,
							addtime		: 0,
							damage		: 100,
							pala_bunge	: [50,40],
							image		: Types.BULLETS.TURTLESS2,
							explode		: Types.EXPLODE.TURTLESS2,
							weight		: 389,
							friccion	: 0,
							addAng		: [-20,20]
						},
						{
							position	: "time",
							power		: "parent",
							delay		: 750,
							addtime		: 0,
							damage		: 100,
							pala_bunge	: [50,40],
							image		: Types.BULLETS.TURTLESS2,
							explode		: Types.EXPLODE.TURTLESS2,
							weight		: 389,
							friccion	: 0,
							addAng		: [-30,30]
						},
						{
							position	: "time",
							power		: "parent",
							delay		: 750,
							addtime		: 0,
							damage		: 100,
							pala_bunge	: [50,40],
							image		: Types.BULLETS.TURTLESS2,
							explode		: Types.EXPLODE.TURTLESS2,
							weight		: 389,
							friccion	: 0,
							addAng		: [-40,40]
						},
					]
				}
			]
		],
		graphics: [
			[49, 48, 26, 46]
		],
		minang: 25,
		maxang: 50,
		ax: 73.5,
		ay: 0.74,
		bx: 0,/* 0 */ //resistencia viento???
		by: 389,    // gravedad ???
		aim: [
			[54, 42],
			[54, 42],
			[54, 42]
		]
		//{"a":73.5,"b":0.74,"name":"Turtle","max":50,"min":25,"mobilename":"turtle","aim":[[54,42],[54,42],[54,42]]}
	}, {
		delay: 480,
		name: "Boomer",
		file: "boomer",
		player_x: 9,
		player_y: -25,
		shoots: [
			[
				{
					delay		: 250,
					addtime		: 0,
					damage		: 160,	// 270
					pala_bunge	: [35,25],	// 28
					image		: Types.BULLETS.BOOMER12,
					explode		: Types.EXPLODE.BOOMER12,
					weight		: 244,
					friccion	: 0
				}
			],
			[
				{
					delay		: 400,
					addtime		: 0,
					damage		: 82,	// 100
					pala_bunge	: [35,25],	// 32
					image		: Types.BULLETS.BOOMER12,
					explode		: Types.EXPLODE.BOOMER12,
					weight		: 244,
					friccion	: 0
				},
				{
					addtime		: 100,
					damage		: 82,	// 100
					pala_bunge	: [35,25],	// 32
					image		: Types.BULLETS.BOOMER12,
					explode		: Types.EXPLODE.BOOMER12,
					weight		: 244,
					friccion	: 0
				},
				{
					addtime		: 200,
					damage		: 82,	// 100
					pala_bunge	: [35,25],	// 32
					image		: Types.BULLETS.BOOMER12,
					explode		: Types.EXPLODE.BOOMER12,
					weight		: 244,
					friccion	: 0
				},
				{
					addtime		: 300,
					damage		: 82,	// 100
					pala_bunge	: [35,25],
					
					image		: Types.BULLETS.BOOMER12,
					explode		: Types.EXPLODE.BOOMER12,
					weight		: 244,
					friccion	: 0
				}
			],
			[
				{
					delay		: 800,
					addtime		: 0,
					damage		: 400,	// 400
					pala_bunge	: [35,25],	// 32
					image		: Types.BULLETS.BOOMER12,
					explode		: Types.EXPLODE.BOOMERSS,
					weight		: 244,
					friccion	: 0,
					ss			: true,
					addAtMaxT	: ["change"],
					change		: [
						{
							image		: Types.BULLETS.BOOMERSS,
							explode		: Types.EXPLODE.BOOMERSS,
						}
					]
				}
			]
		],
		graphics: [
			[38, 37, 20, 35]
		],
		minang: 10,
		maxang: 90,
		ax: 62.5,
		ay: 1.395,
		bx: 0,/* 0 */
		by: 244,
		aim: [
			[70, 30],
			[70, 30],
			[70, 30]
		]
		//{"a":62.5,"b":1.395,"name":"Boomer","max":90,"min":10,"mobilename":"boomer","aim":[[70,30],[70,30],[70,30]]}
	}, {
		delay: 450,
		name: "Electrico",
		file: "electrico2",
		player_x: 5,
		player_y: -41,
		shoots: [
			[
				{
					delay		: 250,
					addtime		: 0,
					damage		: 140,
					pala_bunge	: [null,null],
					image		: Types.BULLETS.LIGHTNING12,
					explode		: Types.EXPLODE.LIGHTINING12_JD1,
					weight		: 393,
					friccion	: 0,
					addAtEnd	: ["lightning"],
					lightning: [
						{
							addtime		: 0,
							damage		: 75,
							pala_bunge	: [35,27],
							weight		: 393,
							explode		: Types.EXPLODE.LIGHTINING12_JD1
						}
					]
				},
				{
					addtime		: 0,
					damage		: 140,
					pala_bunge	: [null,null],
					image		: Types.BULLETS.LIGHTNING12,
					explode		: Types.EXPLODE.LIGHTINING12_JD1,
					weight		: 393,
					friccion	: 0,
					modifiers		: {
						power		: -5
					},
					addAtEnd	: ["lightning"],
					lightning: [
						{
							addtime		: 0,
							damage		: 75,
							pala_bunge	: [35,27],
							weight		: 393,
							explode		: Types.EXPLODE.LIGHTINING12_JD1
						}
					]
				},
				{
					addtime		: 0,
					damage		: 140,
					pala_bunge	: [null,null],
					image		: Types.BULLETS.LIGHTNING12,
					explode		: Types.EXPLODE.LIGHTINING12_JD1,
					weight		: 393,
					friccion	: 0,
					modifiers		: {
						power		: -15
					},
					addAtEnd	: ["lightning"],
					lightning: [
						{
							addtime		: 0,
							damage		: 75,
							pala_bunge	: [35,27],
							weight		: 393,
							explode		: Types.EXPLODE.LIGHTINING12_JD1
						}
					]
				},
			],
			[
				{
					delay		: 350,
					addtime		: 1000,
					damage		: 140,
					pala_bunge	: [null,null],
					image		: Types.BULLETS.LIGHTNING12,
					explode		: Types.EXPLODE.LIGHTINING12_JD1,
					weight		: 393,
					friccion	: 0,
					addAtEnd	: ["lightning"],
					lightning: [
						{
							addtime		: 0,
							damage		: 60,
							pala_bunge	: [35,27],
							weight		: 393,
							explode		: Types.EXPLODE.LIGHTINING12_JD1
						}
					]
				},
				{
					addtime		: 1000,
					damage		: 140,
					pala_bunge	: [null,null],
					image		: Types.BULLETS.LIGHTNING12,
					explode		: Types.EXPLODE.LIGHTINING12_JD1,
					weight		: 393,
					friccion	: 0,
					addOrbit	: [180, 150, 0.5, 45],
					addAtEnd	: ["lightning"],
					lightning: [
						{
							addtime		: 0,
							damage		: 60,
							pala_bunge	: [35,27],
							weight		: 393,
							explode		: Types.EXPLODE.LIGHTINING12_JD1
						}
					]
				},
				{
					addtime		: 1000,
					damage		: 140,
					pala_bunge	: [null,null],
					image		: Types.BULLETS.LIGHTNING12,
					explode		: Types.EXPLODE.LIGHTINING12_JD1,
					weight		: 393,
					friccion	: 0,
					addOrbit	: [0, 150, 0.5, 45],
					addAtEnd	: ["lightning"],
					lightning: [
						{
							addtime		: 0,
							damage		: 60,
							pala_bunge	: [35,27],
							weight		: 393,
							explode		: Types.EXPLODE.LIGHTINING12_JD1
						}
					]
				}
			],
			[
				{
					delay		: 800,
					addtime		: 1000,
					damage		: 400,
					pala_bunge	: [60,60],
					image		: Types.BULLETS.TRICOSS,
					explode		: Types.EXPLODE.TRICOSS,
					weight		: 393,
					friccion	: 0,
					modifiers		: {
						ss	: true
					},
				}
			]
		],
		graphics: [
			[89, 90, 32, 77]
		],
		/** @TODO falta definir*/
		minang: 25,
		maxang: 60,
		ax: 65.5,
		ay: 0.72,
		bx: 0,/* 0 */
		by: 398,
		aim: [
			[54, 42],
			[54, 42],
			[54, 42]
		]
	}, {
		name: "Grub",
		file: "grub",
		player_x: 5,
		player_y: -33,
		explodes: [Types.EXPLODE.GRUB1, Types.EXPLODE.GRUB2, Types.EXPLODE.GRUBSS],
		bullets: [Types.BULLETS.GRUB1, Types.BULLETS.GRUB2, Types.BULLETS.GRUBSS],
		graphics: [
			[80, 72, 33, 41]
		],
		/** @TODO falta definir*/
		minang: 30,
		maxang: 60,
		ax: 61.0,
		ay: 0.65,
		bx: 0,/* 0 */
		by: 398,
		aim: [
			[54, 33],
			[54, 33],
			[54, 33]
		]
	}, {
		delay: 550,
		name: "Dragon",
		file: "dragon2",
		player_x: 14,
		player_y: -41,
		shoots: [
			[
				{
					delay		: 250,
					addtime		: 0,
					damage		: 80,
					pala_bunge	: [40,30],
					image		: Types.BULLETS.DRAGON2_1,
					explode		: Types.EXPLODE.DRAGON2_1,
					weight		: 396,
					friccion	: 0
				},
				{
					addtime		: 100,
					damage		: 80,
					pala_bunge	: [40,30],
					image		: Types.BULLETS.DRAGON2_1,
					explode		: Types.EXPLODE.DRAGON2_1,
					weight		: 396,
					friccion	: 0,
					modifiers		: {
						y0			: -10,
						ang			: 4,
						power		: 10
					}
				},
				{
					addtime		: 200,
					damage		: 80,
					pala_bunge	: [40,30],
					image		: Types.BULLETS.DRAGON2_2,
					explode		: Types.EXPLODE.DRAGON2_2,
					weight		: 396,
					friccion	: 0,
					modifiers		: {
						y0			: -10,
						ang			: -2,
						power		: -10
					}
				},
				{
					addtime		: 300,
					damage		: 80,
					pala_bunge	: [40,30],
					image		: Types.BULLETS.DRAGON2_2,
					explode		: Types.EXPLODE.DRAGON2_2,
					weight		: 396,
					friccion	: 0,
					modifiers		: {
						y0			: -10,
						ang			: 6,
						power		: 20
					}
				}
			],
			[
				{
					delay		: 400,
					addtime		: 0,
					damage		: 90,
					pala_bunge	: [40,30],
					image		: Types.BULLETS.DRAGON2_2,
					explode		: Types.EXPLODE.DRAGON2_2,
					weight		: 396,
					friccion	: 0
				},
				{
					addtime		: 0,
					damage		: 90,
					pala_bunge	: [40,30],
					image		: Types.BULLETS.DRAGON2_2,
					explode		: Types.EXPLODE.DRAGON2_2,
					weight		: 396,
					friccion	: 0,
					modifiers		: {
						ang			: 5,
						power		: 15
					}
				},
				{
					addtime		: 0,
					damage		: 90,
					pala_bunge	: [40,30],
					image		: Types.BULLETS.DRAGON2_2,
					explode		: Types.EXPLODE.DRAGON2_2,
					weight		: 396,
					friccion	: 0,
					modifiers		: {
						ang			: 10,
						power		: 30
					}
				},
				{
					addtime		: 100,
					damage		: 90,
					pala_bunge	: [40,30],
					image		: Types.BULLETS.DRAGON2_2,
					explode		: Types.EXPLODE.DRAGON2_2,
					weight		: 396,
					friccion	: 0
				},
				{
					addtime		: 100,
					damage		: 90,
					pala_bunge	: [40,30],
					image		: Types.BULLETS.DRAGON2_2,
					explode		: Types.EXPLODE.DRAGON2_2,
					weight		: 396,
					friccion	: 0,
					modifiers		: {
						ang			: 5,
						power		: 15
					}
				},
				{
					addtime		: 100,
					damage		: 90,
					pala_bunge	: [40,30],
					image		: Types.BULLETS.DRAGON2_2,
					explode		: Types.EXPLODE.DRAGON2_2,
					weight		: 396,
					friccion	: 0,
					modifiers		: {
						ang			: 10,
						power		: 30
					}
				}
			],
			[
				{
					delay		: 800,
					addtime		: 0,
					damage		: null,
					pala_bunge	: [null,null],
					image		: Types.BULLETS.DRAGON2_SS,
					explode		: null,
					weight		: 398,
					friction	: 0,
					addAtEnd	: ["ion"],
					ss			: true,
					ion: [
						{
							addtime		: 0,
							damage		: 75,
							pala_bunge	: [37,27],
							image		: Types.BULLETS.DRAGON2_SS_ION,
							explode		: Types.EXPLODE.DRAGON2_2,
							ss			: true,
							modifiers	: {
								x : -100,
								y : 460
							}
						},
						{
							addtime		: 0,
							damage		: 75,
							pala_bunge	: [37,27],
							image		: Types.BULLETS.DRAGON2_SS_ION,
							explode		: Types.EXPLODE.DRAGON2_2,
							modifiers	: {
								x : 100,
								y : 460
							}
						},
						{
							addtime		: 0,
							damage		: 75,
							pala_bunge	: [37,27],
							image		: Types.BULLETS.DRAGON2_SS_ION,
							explode		: Types.EXPLODE.DRAGON2_2,
							modifiers	: {
								x : 60,
								y : 440
							}
						},
						{
							addtime		: 0,
							damage		: 75,
							pala_bunge	: [37,27],
							image		: Types.BULLETS.DRAGON2_SS_ION,
							explode		: Types.EXPLODE.DRAGON2_2,
							modifiers	: {
								x : -60,
								y : 440
							}
						},
						{
							addtime		: 0,
							damage		: 75,
							pala_bunge	: [37,27],
							image		: Types.BULLETS.DRAGON2_SS_ION,
							explode		: Types.EXPLODE.DRAGON2_2,
							modifiers	: {
								x : 20,
								y : 420
							}
						},
						{
							addtime		: 0,
							damage		: 75,
							pala_bunge	: [37,27],
							image		: Types.BULLETS.DRAGON2_SS_ION,
							explode		: Types.EXPLODE.DRAGON2_2,
							modifiers	: {
								x : -20,
								y : 420
							}
						}
					]
				}
			]
		],
		graphics: [
			[77, 76, 32, 75]
		],
		/** @TODO falta definir*/
		minang: 15,
		maxang: 50,
		ax: 71.5,
		ay: 1.78,
		bx: 0,
		by: 380,
		aim: [
			[58, 50],
			[58, 50],
			[58, 50]
		]
	}, {
		delay: 500,
		name: "Raon Launcher",
		file: "raon",
		player_x: 15,
		player_y: -27,
		shoots: [
			[
				{
					delay		: 250,
					addtime		: 0,
					damage		: null,
					pala_bunge	: [58,58],
					image		: Types.BULLETS.RAON1,
					explode		: null,
					weight		: 398,
					friccion	: 0,
					addAtEnd	: ["mine"],
					mine		: {
						damage		: 150,
						pala_bunge	: [58,58],
						walk		: true,
						walk_max	: 30,
						image		: Types.BULLETS.RAON1,
						explode		: Types.EXPLODE.RAON1,
						is_alive	: true
					}
				}
			],
			[
				{
					delay		: 400,
					addtime		: 0,
					damage		: 240,
					pala_bunge	: [58,58],
					image		: Types.BULLETS.RAON2,
					explode		: Types.EXPLODE.RAON2,
					weight		: 398,
					friccion	: 0,
				}
			],
			[
				{
					delay		: 800,
					addtime		: 0,
					damage		: 400,
					pala_bunge	: [58,58],
					image		: Types.BULLETS.RAONSS,
					explode		: Types.EXPLODE.RAONSS,
					weight		: 398,
					friccion	: 0,
					addAtMaxT	:  ["change"],
					modifiers	: {
						ss		: true
					},
					change	: {
						image:	Types.BULLETS.ARMORSS2
					}
				}
			]
		],
		graphics: [
			[40, 41, 21, 39]
		],
		/** @TODO falta definir*/
		minang: 30,
		maxang: 60,
		ax: 73.5,
		ay: 0.74,
		bx: 0,/* 0 */
		by: 398,
		aim: [
			[54, 33],
			[54, 33],
			[54, 33]
		]
	}, {
		name: "Randomizer",
		file: "randomizer",
		player_x: 10,
		player_y: -34,
		graphics: [
			[42, 37, 19, 35]
		],
		/** @TODO falta definir*/
		minang: 20,
		maxang: 60,
		ax: 90.0,
		ay: 0.74,
		bx: 0,/* 0 */
		by: 398,
		aim: [
			[58, 50],
			[58, 50],
			[58, 50]
		]
	}, {
		delay: 500,
		name: "Frog",
		file: "Frog2D",
		player_x: 18,
		player_y: -28,
		shoots: [
			[
				{
					delay		: 250,
					addtime		: 0,
					damage		: 140,
					pala_bunge	: [null,null],
					image		: Types.BULLETS.FROG12,
					explode		: null,
					weight		: 393,
					friccion	: 0,
					addAtEnd	: ["walk"],
					walk: [
						{
							damage		: 75,
							pala_bunge	: [38,38],
							addtime		: 200,
							dir			: 1,
							image		: Types.BULLETS.FROG12_WALKER,
							explode		: Types.EXPLODE.MAGE1
						}
					]
				},
			],
			[
				{
					delay		: 400,
					addtime		: 0,
					damage		: 140,
					pala_bunge	: [null,null],
					image		: Types.BULLETS.FROG12,
					explode		: null,
					weight		: 393,
					friccion	: 0,
					addAtEnd	: ["walk"],
					walk: [
						{
							damage		: 75,
							pala_bunge	: [38,38],
							addtime		: 200,
							dir			: -1,
							image		: Types.BULLETS.FROG12_WALKER,
							explode		: Types.BULLETS.FROG2
						}
					]
				},
			],
			[
				{
					delay		: 800,
					addtime		: 0,
					damage		: 140,
					pala_bunge	: [null,null],
					image		: Types.BULLETS.FROGSS,
					explode		: null,
					weight		: 393,
					friccion	: 0,
					addAtEnd	: ["walk"],
					ss			: true,
					walk: [
						{
							damage		: 75,
							pala_bunge	: [38,38],
							addtime		: 200,
							dir			: "auto",
							image		: Types.BULLETS.FROGSS_WALKER,
							explode		: Types.EXPLODE.GRUBSS
						}
					]
				},
			]
		],
		graphics: [
			[38, 40, 16, 36], 4,
			[39, 40, 17, 36], 7,
			[38, 40, 16, 36], 6
		],
		/** @TODO falta definir*/
		minang: 30,
		maxang: 60,
		ax: 61.0,
		ay: 0.65,
		bx: 0,/* 0 */
		by: 398,
		aim: [
			[54, 33],
			[54, 33],
			[54, 33]
		]
	}, {
		delay: 615,
		name: "Kalsiddon",
		file: "kals",
		player_x: -2,
		player_y: -31,
		shoots: [
			[
				{
					delay		: 150,
					addtime		: 0,
					damage		: null,
					pala_bunge	: [null,null],
					image		: Types.BULLETS.KALSIDDON1,
					explode		: null,
					weight		: 398,
					addAtMaxT	: ["change","bulets"],
					change	: [
						{
							image		: Types.BULLETS.KALSIDDON1_OPEN
						}
					],
					bulets	: [
						{
							position	: "time",
							damage		: 120,
							pala_bunge	: [35,35],
							addtime		: -2,
							image		: Types.BULLETS.KALSIDDON1_TINY,
							explode		: Types.EXPLODE.KALSIDDON,
							weight		: 0,
							power		: 120,
							ang			: [225,315],
							killAt		: 500,
							addAtEnd	: ["bulets"],
							addAtTime	: [["set",450]],
							set: [
								{
									exp		: null,
									hole	: []
								}
							],
							bulets	: [
								{ 
									position	: "parent",
									damage		: 120,
									pala_bunge	: [35,35],
									image		: Types.BULLETS.KALSIDDON1_TINY,
									explode		: Types.EXPLODE.KALSIDDON,
								//	weight		: 350,
									power		: 150,
								//	friccion	: [350,-350],
									ang			: "auto"
								}
							]
						},
						{
							position	: "time",
							damage		: 120,
							pala_bunge	: [35,35],
							addtime		: -2,
							image		: Types.BULLETS.KALSIDDON1_TINY,
							explode		: Types.EXPLODE.KALSIDDON,
							weight		: 0,
							friccion	: [-165,165],
							power		: 120,
							ang			: [135,45],
							killAt		: 500,
							addAtEnd	: ["bulets"],
							addAtTime	: [["set",450]],
							set: [
								{
									exp		: null,
									hole	: []
								}
							],
							bulets	: [
								{
									position	: "parent",
									damage		: 120,
									pala_bunge	: [35,35],
									image		: Types.BULLETS.KALSIDDON1_TINY,
									explode		: Types.EXPLODE.KALSIDDON,
									power		: 150,
								//	weight		: 350,
								//	friccion	: [350,-350],
									ang			: "auto"
								}
							]
						},
					]
				}
			],
			[
				{
					delay		: 360,
					addtime		: 0,
					damage		: null,
					pala_bunge	: [null,null],
					image		: Types.BULLETS.KALSIDDON2,
					explode		: null,
					weight		: 398,
					addAtMaxT	: ["change","bulets"],
					change	: [
						{
							image		: Types.BULLETS.KALSIDDON2_OPEN
						}
					],
					bulets	: [
						{
							position	: "time",
							damage		: 110,
							pala_bunge	: [35,35],
							image		: Types.BULLETS.KALSIDDON2_TINY,
							explode		: Types.EXPLODE.KALSIDDON,
							weight		: 0,
							power		: 120,
							ang			: [255,285],
							killAt		: 500,
							addAtEnd	: ["bulets"],
							addAtTime	: [["set",450]],
							set: [
								{
									exp		: null,
									hole	: []
								}
							],
							bulets	: [
								{ 
									position	: "parent",
									damage		: 110,
									pala_bunge	: [35,35],
									image		: Types.BULLETS.KALSIDDON2_TINY,
									explode		: Types.EXPLODE.KALSIDDON,
									power		: 350,
								//	friccion	: [-165,165],
									ang			: "auto"
								}
							]
						},
						{
							position	: "time",
							damage		: 110,
							pala_bunge	: [35,35],
							image		: Types.BULLETS.KALSIDDON2_TINY,
							explode		: Types.EXPLODE.KALSIDDON,
							weight		: 0,
							power		: 120,
							ang			: [195,345],
							killAt		: 500,
							addAtEnd	: ["bulets"],
							addAtTime	: [["set",450]],
							set: [
								{
									exp		: null,
									hole	: []
								}
							],
							bulets	: [
								{ 
									position	: "parent",
									damage		: 110,
									pala_bunge	: [35,35],
									image		: Types.BULLETS.KALSIDDON2_TINY,
									explode		: Types.EXPLODE.KALSIDDON,
									power		: 350,
								//	friccion	: [-165,165],
									ang			: "auto"
								}
							]
						},
						{
							position	: "time",
							damage		: 110,
							pala_bunge	: [35,35],
							image		: Types.BULLETS.KALSIDDON2_TINY,
							explode		: Types.EXPLODE.KALSIDDON,
							weight		: 0,
							power		: 120,
							ang			: [165,15],
							killAt		: 500,
							addAtEnd	: ["bulets"],
							addAtTime	: [["set",450]],
							set: [
								{
									exp		: null,
									hole	: []
								}
							],
							bulets	: [
								{ 
									position	: "parent",
									damage		: 110,
									pala_bunge	: [35,35],
									image		: Types.BULLETS.KALSIDDON2_TINY,
									explode		: Types.EXPLODE.KALSIDDON,
									power		: 350,
								//	friccion	: [-165,165],
									ang			: "auto"
								}
							]
						},
						{
							position	: "time",
							damage		: 110,
							pala_bunge	: [35,35],
							image		: Types.BULLETS.KALSIDDON2_TINY,
							explode		: Types.EXPLODE.KALSIDDON,
							weight		: 0,
							power		: 120,
							ang			: [105,75],
							killAt		: 500,
							addAtEnd	: ["bulets"],
							addAtTime	: [["set",450]],
							set: [
								{
									exp		: null,
									hole	: []
								}
							],
							bulets	: [
								{ 
									position	: "parent",
									damage		: 110,
									pala_bunge	: [35,35],
									image		: Types.BULLETS.KALSIDDON2_TINY,
									explode		: Types.EXPLODE.KALSIDDON,
									power		: 350,
								//	friccion	: [-165,165],
									ang			: "auto"
								}
							]
						},
					]
				}
			],
			[
				{
					delay		: 700,
					addtime		: 0,
					damage		: null,
					pala_bunge	: [null,null],
					image		: Types.BULLETS.KALSIDDONSS,
					explode		: null,
					weight		: 398,
					addAtMaxT	: ["change","bulets"],
					change	: [
						{
							image		: Types.BULLETS.KALSIDDONSS_OPEN
						}
					],
					bulets	: [
						{
							position	: "time",
							damage		: 110,
							pala_bunge	: [35,35],
							image		: Types.BULLETS.KALSIDDONSS_MED,
							explode		: Types.EXPLODE.KALSIDDON,
							weight		: 0,
							power		: 120,
							killAt		: 452,
							ang			: [255,285],
							addAtTime	: [["bulets",451]],
							bulets	: [
								{ 
									position	: "parent",
									addtime		: 0,
									damage		: 110,
									pala_bunge	: [35,35],
									image		: Types.BULLETS.KALSIDDONSS_MED_OPEN,
									explode		: Types.EXPLODE.KALSIDDON,
									power		: 150,
								//	friccion	: [-165,165],
									ang			: "auto"
								},
								{
									position	: "time",
									addtime		: 0,
									damage		: 110,
									pala_bunge	: [35,35],
									image		: Types.BULLETS.KALSIDDONSS_TINY,
									explode		: Types.EXPLODE.KALSIDDON,
									weight		: 0,
									power		: 120,
									ang			: [255,285],
									killAt		: 500,
									addAtEnd	: ["bulets"],
									addAtTime	: [["set",450]],
									set: [
										{
											exp		: null,
											hole	: []
										}
									],
									bulets	: [
										{ 
											position	: "parent",
											damage		: 110,
											pala_bunge	: [35,35],
											image		: Types.BULLETS.KALSIDDONSS_TINY,
											explode		: Types.EXPLODE.KALSIDDON,
											power		: 150,
										//	friccion	: [-165,165],
											ang			: "auto"
										}
									]
								}
							]
						}
					]
				}
			]
		],
		graphics: [
			[47, 46, 24, 41]
		],
		//falta definir
		minang: 30,
		maxang: 110,//60
		aim: [
			[54, 33],
			[54, 33],
			[54, 33]
		]
	}];


Types.getMessageTypeAsString = function (type) {
    var typeName;
    _.each(Types.CLIENT_OPCODE, function (value, name) {
        if (value === type) {
            typeName = name;
        }
    });
    if (!typeName) {
        typeName = "UNKNOWN";
    }
    return typeName;
};

module.exports = Types;