import * as registerSuite from 'intern!object';
import * as assert from 'intern/chai!assert';
import * as compare from 'src/compare';

registerSuite({
	name: 'compare',

	'diff(object, object)': {
		'no commanalities': function () {
			const before = {
				a: 1
			};
			const after = {
				b: 2
			};
			const patch = compare.diff(before, after);
			assert.deepEqual(patch, {
				a: {
					type: compare.Type.Delete,
					oldValue: 1
				},
				b: {
					type: compare.Type.Add,
					newValue: 2
				}
			});
		},
		'single commonality': function () {
			const before = {
				a: 1,
				b: 2,
				c: 3
			};
			const after = {
				a: 4,
				b: 2,
				c: 5
			};
			const patch = compare.diff(before, after);
			assert.deepEqual(patch, {
				a: {
					type: compare.Type.Update,
					oldValue: 1,
					newValue: 4
				},
				c: {
					type: compare.Type.Update,
					oldValue: 3,
					newValue: 5
				}
			});
		}
	},
	'patch(U, Patch<U, T>)': {
		'no commonalities': function () {
			const before = {
				a: 1
			};
			const after = {
				b: 2
			};
			const patch = compare.diff(before, after);
			const patched = compare.patch(before, patch);
			assert.deepEqual(before, after);
			assert.deepEqual(patched, after);
			assert.deepEqual(patched, {
				b: 2
			});
		},
		'single commonality': function () {
			const before = {
				a: 1,
				b: 2,
				c: 3
			};
			const after = {
				a: 4,
				b: 2,
				c: 5
			};
			const patch = compare.diff(before, after);
			const patched = compare.patch(before, patch);
			assert.deepEqual(before, after);
			assert.deepEqual(patched, after);
			assert.deepEqual(patched, {
				a: 4,
				b: 2,
				c: 5
			});
		}
	},
	'diff(any[], any[])': {
		'no commonalities': function () {
			const before = ['a', 'b'];
			const after = ['c', 'd'];
			const patch = compare.diff(before, after);
			assert.deepEqual(patch, {});
		},
		'single commonality': function () {
			const before = [1, 2, 'a', 3, 4];
			const after = [5, 6, 'a', 7, 8];
			const patch = compare.diff(before, after);
			assert.deepEqual(patch, {
				0: {
					type: compare.Type.Splice,
					removed: [
						{deleted: true},
						{deleted: true}
					],
					added: [
						{moved: false, to: 0},
						{moved: false, to: 1}
					]
				},
				3: {
					type: compare.Type.Splice,
					removed: [
						{deleted: true},
						{deleted: true}
					],
					added: [
						{moved: false, to: 3},
						{moved: false, to: 4}
					]
				}
			});
		},
		'addition at end': function () {
			const before = ['a', 'b', 'c'];
			const after = ['a', 'b', 'c', 'd'];
			const patch = compare.diff(before, after);
			assert.deepEqual(patch, {
				3: {
					type: compare.Type.Splice,
					removed: [],
					added: [
						{moved: false, to: 3}
					]
				}
			});
		},
		'addition at beginning': function () {
			const before = ['b', 'c', 'd'];
			const after = ['a', 'b', 'c', 'd'];
			const patch = compare.diff(before, after);
			assert.deepEqual(patch, {
				0: {
					type: compare.Type.Splice,
					removed: [],
					added: [
						{moved: false, to: 0}
					],
				}
			});
		},
		'removal at end': function () {
			const before = ['a', 'b', 'c', 'd'];
			const after = ['a', 'b', 'c'];
			const patch = compare.diff(before, after);
			assert.deepEqual(patch, {
				3: {
					type: compare.Type.Splice,
					removed: [
						{deleted: true}
					],
					added: [],
				}
			});
		},
		'removal at beginning': function () {
			const before = ['a', 'b', 'c', 'd'];
			const after = ['b', 'c', 'd'];
			const patch = compare.diff(before, after);
			assert.deepEqual(patch, {
				0: {
					type: compare.Type.Splice,
					removed: [
						{deleted: true}
					],
					added: []
				}
			});
		},
		'single addition in middle': function () {
			const before = ['a', 'c', 'd'];
			const after = ['a', 'b', 'c', 'd'];
			const patch = compare.diff(before, after);
			assert.deepEqual(patch, {
				1: {
					type: compare.Type.Splice,
					removed: [],
					added: [
						{moved: false, to: 1}
					],
				}
			});
		},
		'single removal in middle': function () {
			const before = ['a', 'b', 'c', 'd'];
			const after = ['a', 'c', 'd'];
			const patch = compare.diff(before, after);
			assert.deepEqual(patch, {
				1: {
					type: compare.Type.Splice,
					removed: [
						{deleted: true}
					],
					added: []
				}
			});
		},
		'single additions in middle': function () {
			const before = ['a', 'd'];
			const after = ['a', 'b', 'c', 'd'];
			const patch = compare.diff(before, after);
			assert.deepEqual(patch, {
				1: {
					type: compare.Type.Splice,
					removed: [],
					added: [
						{moved: false, to: 1},
						{moved: false, to: 2}
					]
				}
			});
		},
		'single removals in middle': function () {
			const before = ['a', 'b', 'c', 'd'];
			const after = ['a', 'd'];
			const patch = compare.diff(before, after);
			assert.deepEqual(patch, {
				1: {
					type: compare.Type.Splice,
					removed: [
						{deleted: true},
						{deleted: true}
					],
					added: []
				}
			});
		},
		'multiple addition in middle': function () {
			const before = ['a', 'c', 'e'];
			const after = ['a', 'b', 'c', 'd', 'e'];
			const patch = compare.diff(before, after);
			assert.deepEqual(patch, {
				1: {
					type: compare.Type.Splice,
					removed: [],
					added: [
						{moved: false, to: 1}
					]
				},
				2: {
					type: compare.Type.Splice,
					removed: [],
					added: [
						{moved: false, to: 3}
					]
				}
			});
		},
		'multiple removal in middle': function () {
			const before = ['a', 'b', 'c', 'd', 'e'];
			const after = ['a', 'c', 'e'];
			const patch = compare.diff(before, after);
			assert.deepEqual(patch, {
				1: {
					type: compare.Type.Splice,
					removed: [
						{deleted: true}
					],
					added: []
				},
				3: {
					type: compare.Type.Splice,
					removed: [
						{deleted: true}
					],
					added: []
				}
			});
		},
		'multiple additions in middle': function () {
			const before = ['a', 'd', 'g'];
			const after = ['a', 'b', 'c', 'd', 'e', 'f', 'g'];
			const patch = compare.diff(before, after);
			assert.deepEqual(patch, {
				1: {
					type: compare.Type.Splice,
					removed: [],
					added: [
						{moved: false, to: 1},
						{moved: false, to: 2}
					]
				},
				2: {
					type: compare.Type.Splice,
					removed: [],
					added: [
						{moved: false, to: 4},
						{moved: false, to: 5}
					]
				}
			});
		},
		'multiple removals in middle': function () {
			const before = ['a', 'b', 'c', 'd', 'e', 'f', 'g'];
			const after = ['a', 'd', 'g'];
			const patch = compare.diff(before, after);
			assert.deepEqual(patch, {
				1: {
					type: compare.Type.Splice,
					removed: [
						{deleted: true},
						{deleted: true}
					],
					added: []
				},
				4: {
					type: compare.Type.Splice,
					removed: [
						{deleted: true},
						{deleted: true}
					],
					added: []
				}
			});
		},
		'single replacement': function () {
			const before = ['a', 1, 'b'];
			const after = ['a', 2, 'b'];
			const patch = compare.diff(before, after);
			assert.deepEqual(patch, {
				1: {
					type: compare.Type.Splice,
					removed: [
						{deleted: true}
					],
					added: [
						{moved: false, to: 1}
					]
				}
			});
		},
		'single replacements': function () {
			const before = ['a', 1, 2, 'b'];
			const after = ['a', 3, 4, 'b'];
			const patch = compare.diff(before, after);
			assert.deepEqual(patch, {
				1: {
					type: compare.Type.Splice,
					removed: [
						{deleted: true},
						{deleted: true}
					],
					added: [
						{moved: false, to: 1},
						{moved: false, to: 2}
					]
				}
			});
		},
		'multiple replacement': function () {
			const before = ['a', 1, 'b', 2, 'c'];
			const after = ['a', 3, 'b', 4, 'c'];
			const patch = compare.diff(before, after);
			assert.deepEqual(patch, {
				1: {
					type: compare.Type.Splice,
					removed: [
						{deleted: true}
					],
					added: [
						{moved: false, to: 1}
					]
				},
				3: {
					type: compare.Type.Splice,
					removed: [
						{deleted: true}
					],
					added: [
						{moved: false, to: 3}
					]
				}
			});
		},
		'multiple replacements': function () {
			const before = ['a', 1, 2, 'b', 3, 4, 'c'];
			const after = ['a', 5, 6, 'b', 7, 8, 'c'];
			const patch = compare.diff(before, after);
			assert.deepEqual(patch, {
				1: {
					type: compare.Type.Splice,
					removed: [
						{deleted: true},
						{deleted: true}
					],
					added: [
						{moved: false, to: 1},
						{moved: false, to: 2}
					]
				},
				4: {
					type: compare.Type.Splice,
					removed: [
						{deleted: true},
						{deleted: true}
					],
					added: [
						{moved: false, to: 4},
						{moved: false, to: 5}
					]
				}
			});
		},
		'works with [].splice': function () {
			const before = ['a', 1, 2, 'b', 3, 'c', 4, 5];
			const after = ['a', 6, 'b', 7, 8, 'c', 9];
			const patch = compare.diff(before, after);
			var offset = 0;
			for (const index in patch) {
				const i = parseInt(index, 10);
				const change = patch[index];
				const added = change.added.map((add) => {
					return after[add.to];
				});
				before.splice(i + offset, change.removed.length, ...added);
				offset += (change.added.length - change.removed.length);
			}
			assert.deepEqual(before, after);
		},
		'single relocation': function () {
			const before = ['a', 'b', 'c', 'd', 'e'];
			const after = ['a', 'd', 'b', 'c', 'e'];
			const patch = compare.diff(before, after);
			assert.deepEqual(patch, {
				1: {
					type: compare.Type.Splice,
					removed: [],
					added: [
						{moved: true, from: 3, to: 1}
					]
				},
				3: {
					type: compare.Type.Splice,
					removed: [
						{deleted: false}
					],
					added: []
				}
			});
		},
		'single relocation w/ added duplicate': function () {
			const before = ['a', 'b', 'c', 'd', 'e'];
			const after = ['a', 'd', 'b', 'c', 'e', 'd'];
			const patch = compare.diff(before, after);
			assert.deepEqual(patch, {
				1: {
					type: compare.Type.Splice,
					removed: [],
					added: [
						{moved: true, from: 3, to: 1}
					]
				},
				3: {
					type: compare.Type.Splice,
					removed: [
						{deleted: false}
					],
					added:[]
				},
				5: {
					type: compare.Type.Splice,
					removed: [],
					added: [
						{moved: false, to: 5}
					]
				}
			});
		},
		'single relocation w/ removed duplicate': function () {
			const before = ['a', 'b', 'c', 'd', 'e', 'd'];
			const after = ['a', 'd', 'b', 'c', 'e'];
			const patch = compare.diff(before, after);
			assert.deepEqual(patch, {
				1: {
					type: compare.Type.Splice,
					removed: [],
					added: [
						{moved: true, from: 3, to: 1}
					]
				},
				3: {
					type: compare.Type.Splice,
					removed: [
						{deleted: false}
					],
					added:[]
				},
				5: {
					type: compare.Type.Splice,
					removed: [
						{deleted: true}
					],
					added: []
				}
			});
		},
		'abcdef => cbdfea': function () {
			const before = ['a', 'b', 'c', 'd', 'e', 'f'];
			const after = ['c', 'b', 'd', 'f', 'e', 'a'];
			const patch = compare.diff(before, after);
			assert.deepEqual(patch, {
				0: {
					type: compare.Type.Splice,
					removed: [
						{deleted: false},
						{deleted: false}
					],
					added: []
				},
				3: {
					type: compare.Type.Splice,
					removed: [],
					added: [
						{moved: true, from: 1, to: 1}
					]
				},
				4: {
					type: compare.Type.Splice,
					removed: [],
					added: [
						{moved: true, from: 5, to: 3}
					]
				},
				5: {
					type: compare.Type.Splice,
					removed: [
						{deleted: false}
					],
					added: [
						{moved: true, from: 0, to: 5}
					]
				}
			});
		},
		'abcdef => bcfaed': function () {
			const before = ['a', 'b', 'c', 'd', 'e', 'f'];
			const after = ['b', 'c', 'f', 'a', 'e', 'd'];
			const patch = compare.diff(before, after);
			assert.deepEqual(patch, {
				0: {
					type: compare.Type.Splice,
					removed: [
						{deleted: false}
					],
					added: []
				},
				3: {
					type: compare.Type.Splice,
					removed: [
						{deleted: false},
						{deleted: false}
					],
					added: []
				},
				6: {
					type: compare.Type.Splice,
					removed: [],
					added: [
						{moved: true, from: 0, to: 3},
						{moved: true, from: 4, to: 4},
						{moved: true, from: 3, to: 5}
					]
				}
			});
		},
		'sparse array': function () {
			const before = ['a'];
			before[2] = 'b';
			const after = ['a'];
			after[2] = 'a',
			after[4] = 'b';
			const patch = compare.diff(before, after);
			assert.deepEqual(patch, {
				2: {
					type: compare.Type.Splice,
					removed: [],
					added: [
						{moved: false, to: 2},
						{moved: false, to: 3}
					]
				}
			});
		}
	},
	'diff(any[], any[], {identityKey: \'id\', compareObjects: true})': {
		'compare only': function () {
			const before = [
				{id: 1, name: 'Apple', color: 'red'},
				{id: 2, name: 'Banana', color: 'green'},
				{id: 3, name: 'Tomato', color: 'green'}
			];
			const after = [
				{id: 1, name: 'Apple', color: 'red'},
				{id: 2, name: 'Banana', color: 'yellow'},
				{id: 3, name: 'Tomato', ripe: true}
			];
			const patch = compare.diff(before, after, {identityKey: 'id', compareObjects: true});
			assert.deepEqual(patch, {
				1: {
					type: compare.Type.Update,
					patch: {
						color: {
							type: compare.Type.Update,
							oldValue: 'green',
							newValue: 'yellow'
						}
					}
				},
				2: {
					type: compare.Type.Update,
					patch: {
						color: {
							type: compare.Type.Delete,
							oldValue: 'green'
						},
						ripe: {
							type: compare.Type.Add,
							newValue: true
						}
					}
				}
			});
		}
	}
});
