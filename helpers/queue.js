/** @format */

class Queue {
	constructor() {
		this.elements = [];
	}

	enqueue(ele) {
		this.elements.push(ele);
	}
	dequeue() {
		return this.elements.shift();
	}
	isEmpty() {
		return this.elements.length === 0;
	}
	length() {
		return this.elements.length;
	}
}
