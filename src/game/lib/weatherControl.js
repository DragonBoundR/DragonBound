const Types = require('../gametypes');

module.exports = class {
	#list
	#count
	#mapw
	constructor(map) {
		this.#list	= []
		this.#count	= 0
		this.#mapw  = map.w
		this.active	= []
		this.current= {}
		this.client = {
			active	: [],
			next	: [],
			list	: [],
		}
		this._setWeatherList()
		this.update();
	}
	update(){
		this._updateCount()
		this._updateCurrent()
		this._executeCast()
	}
	_updateCount(){
		this.#count = (this.#count >= Types.WEATHERS.length-1)?0:this.#count + 1
	}
	_updateCurrent(){
		this.current = {
			id      : this.#list[this.#count].id
		}
		if (this.#list[this.#count].castAtgame.length > 0) this.current.cast = this.#list[this.#count].castAtgame
	}
	_executeCast(){
		const cast = this.#list[this.#count].castAtForce
		for (const force in cast) {
			if (Array.isArray(cast[force])) this["_cast"+cast[force][0]](cast[force][1])
			else this["_cast"+cast[force]]()
		}
	}
	_castActive(){
		const force         = this.#list[this.#count]
		const formatForce   = this._formatForce(force)
		this._setActiveForce(formatForce)
		this._setActive(this._formatActive(force,formatForce))
	}
	_castNext(count = 1){
		count = (this.#count+count > this.#list.length-1)?count-this.#count:count
		let nextForce = this.#list[this.#count+count]
		if (nextForce.castAtForce.includes("Active")) this._setNextForce(nextForce)
		else this._setNextCount(count)
	}
	_castPower(config){
		for (let i = 0; i < this.active.length; i++) {
			if (config.allow.includes(this.active[i].id)&&this.active[i].power < 150){
				const rand = this._randomInt(config.power[0],config.power[1])
				this.active[i].power    += rand
				this.client.active[i][2]+= rand
			}
		}
	}
	_setWeatherList(){
		for (let i = 0; i < Types.WEATHERS.length; i++) {
			let weather = {...Types.WEATHERS._base,...Types.WEATHERS.active[this._randomInt(0,Types.WEATHERS.active.length)]}
			this.#list.push(weather)
			this.client.list.push(weather.id)
		}
	}
	_setActiveForce(force){
		if (this.client.active[0] && this.client.active[0][0] === force[0]) this.client.active.push(force)
		else this.client.active = [force]
	}
	
	_setActive(force){
		if (this.active[0] && this.active[0].id === force.id) this.active.push(force)
		else this.active = [force]
	}
	/**
	 * @todo formatear correctamente el next force 
	 */
	_setNextForce(nextForce){
		nextForce = this._formatForce(nextForce)
		if (!this._arraysMatch(nextForce,this.client.next[0]?this.client.next[0]:[])){
			this.client.next = [nextForce]
		}
	}
	_setNextCount(count) {
		count = count+1
		if (this.#count+count <= this.#count+5) this._castNext(count)
		else this.client.next = []
	}
	_formatForce(weather) {
		return [
			weather.id,
			this._randomInt(50,this.#mapw-50),
			140 + this._getRandomSizePlus()
		];
	}
	_getRandomSizePlus(){
		const min = 0;
	    const max = 120;
	    const plus = 20;
	    return (Math.floor(Math.random() * (max - min + 1)) + min) - 20;
	}
	_formatActive(force,formatForce) {
		return {
			id      	: formatForce[0],
			px      	: formatForce[1],
			power   	: formatForce[2],
			cast    	: force.castAtShoot,
			Collide		: force.collideType,
			isCollide	: (cord,coreccion=0) =>{
				return this._isCollide(cord,force,formatForce,coreccion)
			}
		}
	}
	_isCollide(cord,force,formatForce,coreccion=0){
		let plus = 10+coreccion
		switch (force.collideType) {
			case "power":
				plus = (formatForce[2]/2)+coreccion
				break;
		}
		return ((cord<=formatForce[1]+plus)&&(cord>=formatForce[1]-plus))
	}
	_randomInt(low, high) {
		return Math.floor(Math.random() * (high - low) + low);
	}
	_arraysMatch(arr1, arr2) {
		if (arr1.length !== arr2.length) return false;
		for (var i = 0; i < arr1.length; i++) {
			if (arr1[i] !== arr2[i]) return false;
		}
		return true;
	};
}