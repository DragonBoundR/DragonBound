var _ = require("underscore");
var cls = require("./class");
var Types = require("../gametypes");
var Logger = require('./logger');
var Message = require("./message");
var Map = require("./map");
var Box = require('./box');
var Vector = require('./vect');

// Shoot
module.exports = class Shoot {
	constructor(data) {
		let self = this;
		const def = {
			is				: null,			//	c
			x0				: 0,			//	c
			y0				: 0,			//	c
			x1				: 0,			//	c
			y1				: 0,			//	c
			ang				: 0,			//	c
			power			: 0,			//	c
			type			: 0,			//	c
			friccion		: 0,			//	c
			ay				: 0,			//	c
			wind_ang		: 0,			//	c
			wind_power		: 0,			//	c
			stime			: 0,			//	c
			account			: null,			//	c
			modififiers		: [],			//	c
			addAtEnd		: [],			//	c
			addAtMaxT		: [],			//	c
			addOnCollider	: [],			//	c
			image			: 0,			//	c
			explode			: 0,			//	c
			damage			: null,			//	c
			heal			: null,			//	c
			pala_bunge		: 0,			//	c
			gravity			: 0,
			weight			: 0,
			friccion		: 0,
			addThor 		: 0,			//	d
			isthor			: false,		//	c
			thorDamage		: 0,			//	c
			thorClima		: false,		//	c
			thorId			: 0,			//	c
			addIon			: 0,			//	d
			isIon			: false,		//	d
			ionId			: 0,			//	d
			ionData			: null,			//	d
			addLightning	: 0,			//	d
	//		isLightning		: null,		//	d
			lightningId		: 0,			//	d
			bulets			: [],			//	d
			isDigger		: false,		//	d
			shooId			: 0,			//	c
			IsComplete		: false,		//	c
			chat_complete	: false,		//	c
			canCollide		: false,		//	c
			damageComplete	: false,		//	c
			groundCollide	: false,		//	c
			canMapCollide	: true,			//
			canPlayerCollide: true,			//
			wait			: 0,
			invertG			: false,		//	c
			dir				: "RIGHT",		//
			map				: null,			//
			walk			: false,
			bonos			: true,	
			walk_max		: 0,
			walk_dist		: 0,
			killAt			: 4000,
			ss				: false, 		//	c,
			force           : {
				lightning   : false,
				sun         : false,
				black       : false,
			}
		}
		let con = data;
		data = Object.assign(def,data);
		for (const param in data) {
			self[param] = data[param];
		}
		con.account = "";
		//console.log(con);
		if (this.ang == "auto") this.autoAngle();
		
		for (let key in this.modifiers) {
			self[key] = self[key]? self[key] += this.modifiers[key] : this.modifiers[key];
		}
		this.mobile = this.account.player.mobile;
		

		if (Array.isArray(this.friccion)){
			this.friccion = this.friccion[this.ang > 90 && this.ang < 270 ? 0 : 1]  
		}
		//if(Array.isArray(this.orbit[1])&&this.ang > 90 && this.ang < 270) this.orbit[1] =

		this.time = 0;
		if (!this.v) this.v = new Vector2(this.ang, this.power);
		this.show = true;
		this.thorTime	= 0;		

		if(this.killAt == "maxt") {this.killAt = Math.abs(this.stime*2 - this.getMaxT()-200);
		console.log({is:"killAt",killAt:this.killAt});
		}
		if (this.wind_power != 0) this.setWindEfect();
		if (this.power == 'auto') this.positionToForce({x:this.x1,y:this.y1})

		this.box = new Box(new Vector(this.x0, this.y0), 8, 10, 0);
		this.explodebox = new Box(new Vector(this.x0, this.y0), 6, 8, 0);
		
		if (this.invertG) {
			[this.friccion, this.weight] = [this.weight, this.friccion];
		}

		if (this.damage!==null){
			let attack_my_ava = this.account.player.avaAttack;
			if (this.account.player.check_my_ava === 0)
				attack_my_ava = 0;
			let total_attack = parseInt(Math.round(parseInt(attack_my_ava / 2.5)));
			if (total_attack > 50) {
				total_attack = 50;
			}
			this.damage += total_attack;
		}
		/*
		console.log("====================== SET SHOOT ==========================");
		console.log({
			"x0"		: this.x0,
			"y0"		: this.y0,
			"vx"		: this.v.x,
			vy			: this.v.y,
			"ang"		: this.ang,
			"power"		: this.power,
			"type"		: this.type,
			"ax"		: this.friccion,
			"ay"		: this.weight,
			"wind_ang"	: this.wind_ang,
			"wind_power": this.wind_power,
			"stime"		: this.stime,
			"isIon"		: this.isIon,
			exp			: this.explode,
			img			: this.image,
			ionId		: this.ionId,
			damage		: this.damage,
			heal		: this.heal,
			orbit		: this.orbit
		});
		console.log("==========================================================");
		*/
	}

	move(x, y) {
		if (this.box === null)
			this.box = new Box(new Vector(x, y), 30, 25, 0);
		this.box.setp(new Vector(x, y));
	}

	setExplodebox(x, y) {
		if (this.explodebox === null)
			this.explodebox = new Box(new Vector(x, y), 40, 40, 0);
		this.explodebox.setp(new Vector(x, y));
	}

	update() {
		this.time++;
		if (this.walk) this.a = this.GetPosForWalking(); 
		else this.a = this.getPosAtTime();
	}

	getPosAtTime(time=null) {
		let a = (time? time : this.time) / 485;
		return {
			x: Math.ceil(this.x0 + this.v.x * a + this.friccion * a * a / 2),
			y: Math.ceil(this.y0 + this.v.y * a + this.weight * a * a / 2),
		};
	}
	GetPosForWalking  () {
		//   a, b, c
		if (!this.a)
			this.a = {x:this.x0, y:this.y0};

        let pop = this.dir == "LEFT" ? this.a.x - 1 : this.a.x + 1;
        if (0 > pop || pop >= this.map.w)
            return {
                x: a,
                y: this.ay,
                stuck: !0
            };
        if (this.map.IsPixel(pop, this.a.y)) {
            for (c = this.a.y; c > this.a.y - 10; c--)
                if (!this.map.IsPixel(pop, c))
                    return {
                        x: pop,
                        y: c
                    };
            return {
                x: a,
                y: this.a.y,
                stuck: !0
            }
        }
        for (c = this.a.y + 1; c < this.map.h; c++)
            if (this.map.IsPixel(pop, c))
                return {
                    x: pop,
                    y: c - 1
                };
        return {
            x: pop,
            y: this.map.h + 100,
            fall_and_die: !0
        }
    }

	GetAngleAtTime(a) {
		var b = this.getPosAtTime(a - 5);
		a = this.getPosAtTime(a + 5);
		return Math.abs(RadToAngle(Math.atan2(a.y - b.y, a.x - b.x)));
	}
	positionToForce(final,inicial=this.y0,tiempo=this.time,weight=this.weight,ang=this.ang) {
		/*
		tiempo = tiempo / 485;
		let x 	= ( final.x - inicial.x ) / tiempo;
		let y 	= ( (2 * final.y ) - (2 * inicial.y) - (this.weight * tiempo * tiempo)) / 2 * tiempo;
		let power	= Math.sqrt(x*x+y*y);*/

		let V0Y		= Math.round((final - inicial - tiempo*tiempo*weight) / (tiempo*Math.sin(ang*Math.PI*180)))
		let power	= Math.round(V0Y/Math.sin(ang*Math.PI*180))
	//	console.log({is:"pocition to force",in:{Xf:final,Xi:inicial,tiempo:tiempo,peso:weight},out:{power:power,V0y:V0Y}});
		this.power = Math.abs(power);
	}
	getMaxT(){
		return Math.ceil(-this.v.y/this.weight)*488
	}
	setWindEfect() {
		let b0 = Math.round(parseInt(Math.cos(this.wind_ang * Math.PI / 180) * this.wind_power * this.weight)) / 100;		
		let b1 = Math.round(parseInt(Math.sin(this.wind_ang * Math.PI / -180) * this.wind_power * this.weight - this.friccion)) / 100;
		this.friccion = Math.round(this.friccion - b0);
		this.weight = Math.round(this.weight - b1);
//		console.log({in:{wind_ang:this.wind_ang,wind_power:this.wind_power,weight:this.weight,friccion:this.friccion},out:{b0:b0,b1:b1,fri:this.friccion,wei:this.weight}});
	}
	autoPower() {
		let self = this;
		let ang = this.ang;
		
		this.power	= parseInt(100 * 234 / 100);
        let found = false;
        let power = 400;
        for (var i = 0; i < 900; i++) {
            power = i;
            this.v = new Vector2(ang, power);
            for (var t = 0; t < 2000; t++) {
                var f = self.getPosAtTime(t);
                var cl = Math.sqrt(Math.pow(this.x1 - f.x, 2) + Math.pow(this.y1 - f.y, 2));
                if (cl < (60 && this.cl)) {
					this.power = parseInt( i * 234 / 100);;
					this.cl = cl;
                    if (cl <= 15) {
                        found = true;
                        break;
                    }
                }
            }
            if (found) break;
		}
		return found
		/*
        if (found === false) {
            if (this.ang <= 20) {
                this.ang += 10;
            } else if (this.ang >= 60) {
                this.ang -= 10;
            }
		}*/
	}
	autoAngle(){
		this.ang = -Math.atan2((this.y1 - this.y0),(this.x1 - this.x0)) * 180 / Math.PI;
		if (this.ang < 0)
			this.ang += 360;
	}
	autoAngle2(){
		let self = this;
		let power = this.power;

        let found = false;
		let ang = 0;
		if (this.x0<this.x1)
    		for (var i = 91; i < 270; i++) {
            	this.ang = i;
            	this.v = new Vector2(ang, power);
            	for (var t = 0; t < 2000; t++) {
            	    var f = self.getPosAtTime(t);
            	    var cl = Math.sqrt(Math.pow(this.x1 - f.x, 2) + Math.pow(this.y1 - f.y, 2));
            	    if (cl < (60 && this.cl)) {
						this.cl = cl;
            	        if (cl <= 15) {
            	            found = true;
            	            break;
            	        }
            	    }
            	}
				if (found) break;
			}
		else
			for (var i = 270; i < 451; i++) {
            	this.ang = i;
				this.v = new Vector2(ang, power);
				for (var t = 0; t < 2000; t++) {
					var f = self.getPosAtTime(t);
					var cl = Math.sqrt(Math.pow(this.x1 - f.x, 2) + Math.pow(this.y1 - f.y, 2));
					if (cl < (60 && this.cl)) {
						this.cl = cl;
						if (cl <= 15) {
							found = true;
							break;
						}
					}
				}
				if (found) break;
			}
		return found
	}
};

function Vector2(a, b) {
    this.ang = a;
    this.size = b;
    this.x = Math.cos(a * Math.PI / 180) * b;
    this.y = -Math.sin(a * Math.PI / 180) * b;
}

function RadToAngle(a) {
    return 180 * a / Math.PI;
}

function AngleToRad(a) {
    return a * Math.PI / 180;
}