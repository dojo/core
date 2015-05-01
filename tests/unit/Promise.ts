import registerSuite = require('intern!object');
import assert = require('intern/chai!assert');
import Promise, { Executor, PromiseShim, State, Thenable } from 'src/Promise';

export interface PromiseType {
        new <T>(executor: Executor<T>): Promise<T>;
        all<T>(items: (T | Thenable<T>)[]): Promise<T>;
        race<T>(items: (T | Thenable<T>)[]): Promise<T>;
        reject<T>(reason: any): Promise<T>;
        resolve<T>(value: (T | Thenable<T>)): Promise<T>;
}

export function addPromiseTests(suite: any, Promise: PromiseType) {
	suite['.all'] = {
		'empty array': function () {
			var dfd = this.async();
			var promise = Promise.all([]).then(dfd.callback((value: any[]) => {
				assert.isArray(value);
				assert.deepEqual(value, []);
			}));
			assert.instanceOf(promise, Promise, 'promise should have expected type');
		},

		'mixed values and resolved': function () {
			var dfd = this.async();
			Promise.all([ 0, Promise.resolve(1), Promise.resolve(2) ]).then(
				dfd.callback((value: number[]) => {
					assert.isArray(value);
					assert.deepEqual(value, [ 0, 1, 2 ]);
				})
			);
		},

		'reject if any rejected': function () {
			var dfd = this.async();
			var pending = new Promise<void>(function () {});
			var rejected = Promise.reject(new Error('rejected'));

			Promise.all<any>([ pending, rejected ]).then(
				dfd.rejectOnError(() => {
					assert(false, 'Should not have resolved');
				}),
				dfd.callback((error: Error) => {
					assert.strictEqual(error.message, 'rejected');
				})
			);
		},

		'foreign thenables': function () {
			var dfd = this.async();
			var normal = Promise.resolve(1);
			var foreign = <any> {
				then: function (f: Function) {
					f(2);
				}
			};

			Promise.all([ normal, foreign ]).then(dfd.callback((value: number[]) => {
				assert.deepEqual(value, [ 1, 2 ]);
			}));
		},

		'non-callable thenables': function () {
			var dfd = this.async();
			var normal = Promise.resolve(1);
			var foreign = <any> { then: 'foo' };

			Promise.all([ normal, foreign ]).then(dfd.callback((value: number[]) => {
				assert.deepEqual(value, [ 1, foreign ]);
			}));
		},

		'sparse array': function () {
			var dfd = this.async();
			var iterable: any[] = [];

			iterable[0] = Promise.resolve(0);
			iterable[3] = Promise.resolve(3);

			Promise.all(iterable).then(dfd.callback((value: number[]) => {
				assert.strictEqual(value[0], 0);
				assert.isUndefined(value[1]);
				assert.isUndefined(value[2]);
				assert.strictEqual(value[3], 3);
			}));
		},

		'value not input': function () {
			var dfd = this.async();
			var iterable = [ 0, 1 ];

			Promise.all(iterable).then(dfd.callback((value: number[]) => {
				assert.notStrictEqual(value, iterable);
			}));
		}
	};

	suite['.race'] = {
		'empty array': function () {
			var dfd = this.async();
			Promise.race([]).then(dfd.rejectOnError(() => {
				assert.fail(false, true, 'Promise should not have resolved');
			}));
			setTimeout(dfd.callback(() => {}), 10);
		},

		'mixed values and resolved': function () {
			var dfd = this.async();
			Promise.race([ 0, Promise.resolve(1), Promise.resolve(2) ])
				.then(dfd.callback((value: any) => {
					assert.strictEqual(value, 0);
				}));
		},

		'reject if any rejected': function () {
			var dfd = this.async();
			var pending = new Promise<void>(() => {});
			var rejected = Promise.reject(new Error('rejected'));

			Promise.race<any>([ pending, rejected ])
				.then(dfd.rejectOnError(() => {
					assert(false, 'Should not have resolved');
				}), dfd.callback((error: Error) => {
					assert.strictEqual(error.message, 'rejected');
				}));
		},

		'foreign thenables': function () {
			var dfd = this.async();
			var normal = Promise.resolve(1);
			var foreign = <any> {
				then: (f: Function) => {
					f(2);
				}
			};

			Promise.race([ normal, foreign ]).then(dfd.callback((value: any) => {
				assert.strictEqual(value, 1);
			}));
		}
	};

	suite['.reject'] = {
		error() {
			var dfd = this.async();
			var resolved = false;
			var promise = Promise.reject(new Error('foo')).then(
				dfd.rejectOnError(() => {
					resolved = true;
					assert(false, 'should not have resolved');
				}),
				dfd.callback((error: Error) => {
					resolved = true;
					assert.instanceOf(error, Error, 'error value should be an Error');
					assert.propertyVal(error, 'message', 'foo', 'error value should have expected message');
				})
			);

			assert.instanceOf(promise, Promise, 'promise should have expected type');
			assert.isFalse(resolved, 'promise should not have resolved synchronously');
		},

		'rejected thenable'() {
			var dfd = this.async();
			var resolved = false;
			var thenable = <any> {
				then: (f: Function, r: Function) => {
					r(new Error('foo'));
				}
			};
			var promise = Promise.resolve(thenable).then(
				dfd.rejectOnError(() => {
					resolved = true;
					assert(false, 'should not have rejected');
				}),
				dfd.callback((error: Error) => {
					resolved = true;
					// value should be resolved value of thenable
					assert.instanceOf(error, Error, 'error value should be an Error');
					assert.propertyVal(error, 'message', 'foo', 'error value should have expected message');
				})
			);

			assert.isFalse(resolved, 'promise should not have resolved synchronously');
		}
	};

	suite['.resolve'] = {
		'simple value'() {
			var dfd = this.async();
			var resolved = false;
			var promise = Promise.resolve('foo').then(
				dfd.callback((value: any) => {
					resolved = true;
					assert.equal(value, 'foo', 'unexpected resolution value');
				}),
				dfd.rejectOnError(() => {
					resolved = true;
					assert(false, 'should not have rejected');
				})
			);

			assert.instanceOf(promise, Promise, 'promise should have expected type');
			assert.isFalse(resolved, 'promise should not have resolved synchronously');
		},

		thenable() {
			var dfd = this.async();
			var resolved = false;
			var thenable = <any> {
				then: (f: Function) => {
					f(2);
				}
			};
			var promise = Promise.resolve(thenable).then(
				dfd.callback((value: any) => {
					resolved = true;
					// value should be resolved value of thenable
					assert.equal(value, 2, 'unexpected resolution value');
				}),
				dfd.rejectOnError(() => {
					resolved = true;
					assert(false, 'should not have rejected');
				})
			);

			assert.isFalse(resolved, 'promise should not have resolved synchronously');
		}
	};

	suite['#catch'] = {
		rejection: function () {
			var dfd = this.async();
			var error = new Error('foo');
			Promise.reject(error).catch(dfd.callback((err: Error) => {
				assert.strictEqual(err, error);
			}));
		},

		identity: function () {
			var dfd = this.async();
			var error = new Error('foo');
			Promise.reject(error)
				.then(dfd.rejectOnError(() => {
					assert(false, 'Should not be resolved');
				}))
				.catch(dfd.callback((err: Error) => {
					assert.strictEqual(err, error);
				}));
		},

		'resolver throws': function () {
			var dfd = this.async();

			var error = new Error('foo');
			var promise = new Promise(() => {
				throw error;
			});

			promise.catch(dfd.callback((err: Error) => {
				assert.strictEqual(err, error);
			}));
		},

		'handler throws': function () {
			var dfd = this.async();
			var error = new Error('foo');
			Promise.resolve(5)
				.then(() => {
					throw error;
				})
				.catch(dfd.callback((err: Error) => {
					assert.strictEqual(err, error);
				}));
		},

		'then throws': {
			'from resolver': function () {
				var dfd = this.async();
				var error = new Error('foo');
				var foreign = <any> {
					then: (f: Function) => {
						throw error;
					}
				};

				var promise = new Promise((resolve: Function) => {
					resolve(foreign);
				});
				promise.catch(dfd.callback((err: Error) => {
					assert.strictEqual(err, error);
				}));
			},

			'from handler': function () {
				var dfd = this.async();
				var error = new Error('foo');
				var foreign = <any> {
					then: (f: Function) => {
						throw error;
					}
				};

				Promise.resolve(5)
					.then(() => {
						return foreign;
					})
					.catch(dfd.callback((err: Error) => {
						assert.strictEqual(err, error);
					}));
			},

			'then throws': {
				'from resolver': function () {
					var dfd = this.async();
					var error = new Error('foo');
					var foreign = <any> {
						then: (f: Function) => {
							throw error;
						}
					};

					var promise = new Promise((resolve: Function) => {
						resolve(foreign);
					});
					promise.catch(dfd.callback((err: Error) => {
						assert.strictEqual(err, error);
					}));
				},

				'from handler': function () {
					var dfd = this.async();
					var error = new Error('foo');
					var foreign = <any> {
						then: (f: Function) => {
							throw error;
						}
					};

					Promise.resolve(5)
						.then(() => {
							return foreign;
						})
						.catch(dfd.callback((err: Error) => {
							assert.strictEqual(err, error);
						}));
				}
			}
		},
	};

	suite['#finally'] = {
		'called for resolved Promise': function () {
			let dfd = this.async();
			Promise.resolve(5).finally(dfd.callback(() => {}));
		},

		'called for rejected Promise': function () {
			let dfd = this.async();
			Promise.reject(new Error('foo')).finally(dfd.callback(() => {}));
		},

		'value passes through': function () {
			let dfd = this.async();
			Promise.resolve(5).finally(() => {}).then(dfd.callback((value: any) => assert.strictEqual(value, 5)));
		},

		'rejection passes through': function () {
			let dfd = this.async();
			Promise.reject(new Error('foo')).finally(() => {}).then(
				dfd.rejectOnError(() => assert(false, 'Should not have resolved')),
				dfd.callback((reason: any) => assert.propertyVal(reason, 'message', 'foo'))
			);
		},

		'returned value is ignored': function () {
			let dfd = this.async();
			Promise.resolve(5).finally((): any => {
				return 4;
			}).then(
				dfd.callback((value: any) => assert.strictEqual(value, 5)),
				dfd.rejectOnError(() => assert(false, 'Should not have rejected'))
			);
		},

		'returned resolved promise is ignored': function () {
			let dfd = this.async();
			Promise.resolve(5).finally((): any => {
				return Promise.resolve(4);
			}).then(
				dfd.callback((value: any) => assert.strictEqual(value, 5)),
				dfd.rejectOnError(() => assert(false, 'Should not have rejected'))
			);
		},

		'thrown error rejects': function () {
			let dfd = this.async();
			Promise.resolve(5).finally(() => {
				throw new Error('foo');
			}).then(
				dfd.rejectOnError((value: any) => assert(false, 'Should not have rejected')),
				dfd.callback((reason: any) => assert.propertyVal(reason, 'message', 'foo'))
			);
		},

		'returned rejected promise rejects': function () {
			let dfd = this.async();
			Promise.resolve(5).finally(() => {
				return Promise.reject(new Error('foo'));
			}).then(
				dfd.rejectOnError((value: any) => assert(false, 'Should not have rejected')),
				dfd.callback((reason: any) => assert.propertyVal(reason, 'message', 'foo'))
			);
		}
	};

	suite['#then'] = {
		fulfillment: function () {
			var dfd = this.async();
			Promise.resolve(5).then(dfd.callback((value: number) => {
				assert.strictEqual(value, 5);
			}));
		},

		identity: function () {
			var dfd = this.async();
			Promise.resolve(5).then(null, dfd.rejectOnError((value: Error) => {
				assert(false, 'Should not have resolved');
			})).then(dfd.callback((value: number) => {
				assert.strictEqual(value, 5);
			}));
		},

		'resolve once': function () {
			var dfd = this.async();
			var evilPromise = {
				then: (f?: Function, r?: Function) => {
					f(1);
					f(2);
				}
			};

			var calledAlready = false;
			Promise.resolve(evilPromise).then(dfd.rejectOnError((value: number) => {
				assert.strictEqual(calledAlready, false, 'resolver should not have been called');
				calledAlready = true;
				assert.strictEqual(value, 1, 'resolver called with unexpected value');
			})).then(dfd.resolve, dfd.reject);
		},

		'self-resolution': function () {
			var dfd = this.async();
			var resolve: (value?: any) => void;
			var promise = new Promise<void>((_resolve: (value?: any) => void) => {
				resolve = _resolve;
			});

			resolve(promise);

			promise.then(
				dfd.rejectOnError(() => {
					assert(false, 'Should not be resolved');
				}),
				dfd.callback((error: Error) => {
					assert.instanceOf(error, TypeError, 'rejected with non-Error');
				})
			);
		}
	};

	suite['state inspection'] = {
		pending: function () {
			let promise = new Promise((resolve, reject) => {});
			assert.strictEqual(promise.state, State.Pending);
		},

		resolved: function () {
			let dfd = this.async();
			let promise = new Promise((resolve, reject) => {
				resolve(5);
			});
			promise.then(dfd.callback(() => assert.strictEqual(promise.state, State.Fulfilled)));
		},

		rejected: function () {
			let dfd = this.async();
			var promise = Promise.reject(new Error('foo'));
			promise.catch(dfd.callback(() => assert.strictEqual(promise.state, State.Rejected)));
		}
	};
}

var suite = {
	name: 'Promise',

	PromiseShim: (function () {
		let originalConstructor: any;
		return {
			// For the PromiseShim tests, force Promise to use the PromiseShim constructor rather than the global
			// Promise, if it exists.
			setup() {
				originalConstructor = Promise.PromiseConstructor;
				Promise.PromiseConstructor = PromiseShim;
			},

			teardown() {
				Promise.PromiseConstructor = originalConstructor;
			}
		}
	})(),

	Promise: {}
};

addPromiseTests(suite.PromiseShim, Promise);
addPromiseTests(suite.Promise, Promise);

registerSuite(suite);
