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
		'object equality': function () {
			const obj0 = {};
			const obj1 = {};
			const obj2 = /regex/;
			const obj3: any[] = [];
			const obj4: any = undefined;
			const obj5: any = undefined; // should be identical to obj4
			const obj6: any = null;
			const obj7: any = null; // should be identical to obj6
			const obj8: number = NaN; // never matches
			const obj9: number = NaN; // never matches
			const before = [obj0, obj1, obj2, obj3, obj4, obj5, obj6, obj7, obj8, obj9];
			const after = [obj1, obj3, obj5, obj7, obj9, obj0, obj2, obj4, obj6, obj8];
			const patch = compare.diff(before, after);
			assert.deepEqual(patch, {
				0: {
					type: compare.Type.Splice,
					removed: [
						{
							deleted: false
						}
					],
					added: []
				},
				2: {
					type: compare.Type.Splice,
					removed: [
						{
							deleted: false
						}
					],
					added: []
				},
				5: { // obj4 in before is matched with obj5 in after (which appears before obj4)
					type: compare.Type.Splice,
					removed: [
						{
							deleted: false
						}
					],
					added: []
				},
				7: { // obj6 in before is matched with obj7 in after (which appears before obj6)
					type: compare.Type.Splice,
					removed: [],
					added: [
						{
							moved: false, // NaN is deleted/added and not moved
							to: 4
						},
						{
							moved: true,
							from: 0,
							to: 5
						},
						{
							moved: true,
							from: 2,
							to: 6
						},
						{
							moved: true,
							from: 5,
							to: 7
						}
					]
				},
				8: {
					type: compare.Type.Splice,
					removed: [
						{
							deleted: true // NaN is deleted/added and not moved
						},
						{
							deleted: true // NaN is deleted/added and not moved
						}
					],
					added: [
						{
							moved: false, // NaN is deleted/added and not moved
							to: 9
						}
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
					]
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
					added: []
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
					]
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
			let offset = 0;
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
					added: []
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
					added: []
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
	},
	'patch any[] diffs': {
		'indexed using before reference': function () {
			function render (item: {id: number, name: string}) {
				return item.name;
			};

			let before = [
				{id: 1, name: 'Apple'},
				{id: 2, name: 'Banana'},
				{id: 3, name: 'Cherry'},
				{id: 4, name: 'Date'},
				{id: 5, name: 'Fig'},
				{id: 6, name: 'Grape'}
			];
			const after = before.slice(0);
			const indexed: {[id: number]: number} = {};
			const rendered: string[] = [];
			for (let i = 0, length = before.length; i < length; i++) {
				const item = before[i];
				indexed[item.id] = i;
				rendered.push(render(item));
			}
			assert.deepEqual(rendered, ['Apple', 'Banana', 'Cherry', 'Date', 'Fig', 'Grape'], 'rendered');

			function randomize () {
				after.sort((a, b) => {
					const rand = Math.random();
					if (rand < 0.33) {
						return -1;
					}
					else if (rand > 0.66) {
						return 1;
					}
					else {
						return 0;
					}
				});
				const patch = compare.diff(before, after, {identityKey: 'id'});

				for (const index in patch) {
					const i = parseInt(index, 10);
					const change = patch[index];
					const beforeItem = before[i + change.removed.length];
					const beforeId = (beforeItem ? beforeItem.id : undefined);
					for (let j = 0, length = change.removed.length; j < length; j++) {
						if (change.removed[j].deleted) {
							const item = before[i + j];
							let previousIndex = indexed[item.id];
							rendered.splice(previousIndex, 1);
							for (const id in indexed) {
								if (indexed[id] > previousIndex) {
									--indexed[id];
								}
							}
							delete indexed[item.id];
						}
					}
					for (let j = 0, length = change.added.length; j < length; j++) {
						const added = change.added[j];
						const item = after[added.to];
						let destination = (beforeId === undefined ? rendered.length : indexed[beforeId]);
						let value: string;
						if (item.id in indexed) {
							const previousIndex = indexed[item.id];
							if (previousIndex < destination) {
								--destination;
							}
							value = rendered.splice(previousIndex, 1)[0];
							for (const id in indexed) {
								if (indexed[id] > previousIndex) {
									--indexed[id];
								}
							}
						}
						else {
							value = render(item);
						}
						rendered.splice(destination, 0, value);
						for (const id in indexed) {
							if (indexed[id] >= destination) {
								++indexed[id];
							}
						}
						indexed[item.id] = destination;
					}
				}

				assert.deepEqual(rendered, after.map(render), before.map((item) => item.id + ':' + item.name).join(',') + ' => ' + after.map((item) => item.id + ':' + item.name).join(','));
				const reindexed: {[id: number]: number} = {};
				for (let i = 0, length = after.length; i < length; i++) {
					reindexed[after[i].id] = i;
				}
				assert.deepEqual(indexed, reindexed, 'reindexed');

				before = after.slice(0);
			};

			for (let i = 0; i < 1000; i++) {
				randomize();
			}
		},
		'rendered': function () {
			function render (item: {id: number, name: string}) {
				return item.name;
			};

			let before = [
				{id: 1, name: 'Apple'},
				{id: 2, name: 'Banana'},
				{id: 3, name: 'Cherry'},
				{id: 4, name: 'Date'},
				{id: 5, name: 'Fig'},
				{id: 6, name: 'Grape'}
			];
			const after = before.slice(0);
			const rendered: string[] = [];
			for (let i = 0, length = before.length; i < length; i++) {
				const item = before[i];
				rendered.push(render(item));
			}
			assert.deepEqual(rendered, ['Apple', 'Banana', 'Cherry', 'Date', 'Fig', 'Grape'], 'rendered');

			function randomize () {
				after.sort((a, b) => {
					const rand = Math.random();
					if (rand < 0.33) {
						return -1;
					}
					else if (rand > 0.66) {
						return 1;
					}
					else {
						return 0;
					}
				});

				const patch = compare.diff(before, after, {identityKey: 'id'});

				const removed: {[index: number]: string} = {};
				let offset = 0;
				for (const index in patch) {
					const i = parseInt(index, 10);
					const change = patch[index];
					for (let j = 0, length = change.removed.length; j < length; j++) {
						removed[i + j] = rendered.splice(offset + i, 1)[0];
					}
					offset -= change.removed.length;
				}
				for (const index in patch) {
					const change = patch[index];
					for (let j = 0, length = change.added.length; j < length; j++) {
						const added = change.added[j];
						let value = '';
						if (added.moved) {
							value = removed[added.from];
						}
						else {
							value = render(after[added.to]);
						}
						rendered.splice(added.to, 0, value);
					}
				}
				assert.deepEqual(rendered, after.map(render), 'rendered');

				before = after.slice(0);
			};

			for (let i = 0; i < 1000; i++) {
				randomize();
			}
		}
	}
});
