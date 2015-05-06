import {Handle} from './interfaces';
import {createHandle} from './util';

interface Advised {
	id?: number;
	advice: Function;
	previous?: Advised;
	next?: Advised;
	receiveArguments?: boolean;
}

interface Dispatcher {
	(): any;
	target: any;
	before?: Advised;
	around?: Advised;
	after?: Advised;
}

var nextId = 0;

function advise(dispatcher: Dispatcher, type: string, advice: Function, receiveArguments?: boolean): Handle {
	var previous = (<any> dispatcher)[type];
	var advised = <Advised> {
		id: nextId++,
		advice: advice,
		receiveArguments: receiveArguments
	};

	if (previous) {
		if (type === 'after') {
			// add the listener to the end of the list
			// note that we had to change this loop a little bit to workaround a bizarre IE10 JIT bug
			while (previous.next && (previous = previous.next)) {}
			previous.next = advised;
			advised.previous = previous;
		}
		else {
			// add to the beginning
			dispatcher.before = advised;
			advised.next = previous;
			previous.previous = advised;
		}
	}
	else {
		(<any> dispatcher)[type] = advised;
	}

	advice = previous = null;

	return createHandle(function() {
		var previous = advised.previous;
		var next = advised.next;

		if (!previous && !next) {
			(<any> dispatcher)[type] = null;
		}
		else {
			if (previous) {
				previous.next = next;
			}
			else {
				(<any> dispatcher)[type] = next;
			}

			if (next) {
				next.previous = previous;
			}
		}

		dispatcher = advised = null;
	});
}

function getDispatcher(target: any, methodName: string): Dispatcher {
	var existing = target[methodName];
	var dispatcher: Dispatcher;

	if (!existing || existing.target !== target) {
		// no dispatcher
		target[methodName] = dispatcher = <Dispatcher> function (): any {
			var executionId = nextId;
			var args = arguments;
			var results: any;
			var before = dispatcher.before;

			while (before) {
				args = before.advice.apply(this, args) || args;
				before = before.next;
			}

			if (dispatcher.around) {
				results = dispatcher.around.advice(this, args);
			}

			var after = dispatcher.after;
			while (after && after.id < executionId) {
				if (after.receiveArguments) {
					var newResults = after.advice.apply(this, args);
					results = newResults === undefined ? results : newResults;
				}
				else {
					results = after.advice.call(this, results, args);
				}
				after = after.next;
			}

			return results;
		};

		if (existing) {
			dispatcher.around = {
				advice: function (target: any, args: any[]): any {
					return existing.apply(target, args);
				}
			};
		}

		dispatcher.target = target;
	}
	else {
		dispatcher = existing;
	}

	target = null;

	return dispatcher;
}

export function after(target: Object, methodName: string, advice: (originalReturn: any, originalArgs: any[]) => any): Handle {
	return advise(getDispatcher(target, methodName), 'after', advice);
}

export function around(target: Object, methodName: string, advice: (previous: Function) => Function): Handle {
	var dispatcher = getDispatcher(target, methodName);
	var previous = dispatcher.around;
	var advised = advice(function (): any {
		return previous.advice(this, arguments);
	});

	dispatcher.around = {
		advice: function (target: any, args: any[]): any {
			return advised ?
				advised.apply(target, args) :
				previous.advice(target, args);
		}
	};

	advice = null;

	return createHandle(function () {
		advised = dispatcher = null;
	});
}

export function before(target: Object, methodName: string, advice: (...originalArgs: any[]) => any[]): Handle {
	return advise(getDispatcher(target, methodName), 'before', advice);
}

export default function on(target: Object, methodName: string, advice: (...originalArgs: any[]) => any): Handle {
	return advise(getDispatcher(target, methodName), 'after', advice, true);
}
