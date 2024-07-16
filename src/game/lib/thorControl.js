var Logger = require('./logger');

module.exports = class Thor {
	constructor(game) {
		this.data		= {};
		this.pocition	= {};
		this.pocition.x	= [708, 613, 676, 806, 573, 687, 1079, 575, 669, 707, 1024, 974, 726, 1060, 876, 898, 795, 546, 644, 964, 962, 1031, 791, 1144, 1046 ],
		this.pocition.y	= [-448, -452, -421, -424, -494, -446, -444, -426, -450, -419, -374, -376, -387, -387, -402, -395, -376, -388, -366, -441, -496, -484, -387, -399, -398 ],
		this.game = game;

		this.data.angle	= 180;
		this.data.damage= 0;
		this.data.active= false;
		this.data.time	= 0;

		this.updatePocition();
	}
	updatePocition(){
		if(this.game.weather.next==0 || !this.data.x){
			this.data.x	= this.pocition.x[this.game.getRandomInt(0, this.pocition.x.length)];
			this.data.y	= this.pocition.y[this.game.getRandomInt(0, this.pocition.y.length)];
		}
	}

	onShootComplete(shoots){
		this.updatePocition();
		var damageAdded = 0;
		shoots.forEach(shoot => {
			if(shoot.thor || this.data.active){
				shoot.damages.forEach(damage => {
					damageAdded += Math.abs(Math.round(damage.damage));
				});
			}
	//		console.log({is:"thor control",ShootsList:shoots,isThor:shoot,damageAdded:damageAdded,data:this.data});
		});
		this.addDamage(damageAdded /2);
	}

	addDamage(damageAddede){
		if(this.data.damage < 6000){
			this.data.damage += damageAddede;
			if(this.data.damage > 6000) this.data.damage = 6000;
		}
	}

}