import { isIdentical } from './lang';

export enum Type {
	Add,
	Update,
	Delete,
	Splice
};

export interface ObjectChange {
	type: Type;
	oldValue?: any;
	newValue?: any;
};

export class ObjectPatch<T, U> {
	[key: string]: ObjectChange;
};

export interface ArrayChangeRemove {
	deleted: boolean
}

export interface ArrayChangeAdd {
	from?: number,
	to: number,
	moved: boolean
};

export interface ArrayChange<T, U> {
	type: Type;
	removed?: ArrayChangeRemove[];
	added?: ArrayChangeAdd[];
	patch?: ObjectPatch<T, U>;
};

export class ArrayPatch<T, U> {
	[index: number]: ArrayChange<T, U>;
};

export interface IdentityCallback {
	(object: any): any;
};

export interface DiffOptions {
	identityKey?: string,
	identityCallback?: IdentityCallback,
	compareObjects?: boolean
};

function getIdentity(object: any, options: DiffOptions): any {
	if (options.identityCallback) {
		return options.identityCallback(object);
	}
	else if (options.identityKey && typeof object === 'object') {
		return object[options.identityKey];
	}
	return object;
};

const used = Symbol();

export function diff<T, U>(a: T[], b: U[], options?: DiffOptions): ArrayPatch<T, U>;
export function diff<T, U>(a: T, b: U): ObjectPatch<T, U>;
export function diff<T, U>(a: any, b: any, options: DiffOptions = {}): any {
	if (Array.isArray(a) && Array.isArray(b)) {
		const patch = new ArrayPatch();
		const aArray: any[] = <any> a;
		const aIds = aArray.map((object) => {
			return getIdentity(object, options);
		});
		const aSearch = aIds.slice(0);
		const bArray: any[] = <any> b;
		const bIds = bArray.map((object) => {
			return getIdentity(object, options);
		});
		const bSearch = bIds.slice(0);
		let removed: ArrayChangeRemove[] = [];
		let added: ArrayChangeAdd[] = [];
		let aIndex = 0;
		let bIndex = 0;
		let matched = -1;
		for (const aLength = aIds.length, bLength = bIds.length; aIndex < aLength || bIndex < bLength; ) {
			let aId = aIds[aIndex];
			let bId = bIds[bIndex];
			if (aId === bId && aIndex < aLength && bIndex < bLength && aSearch[aIndex] !== used) {
				if (removed.length || added.length) {
					patch[matched + 1] = {
						type: Type.Splice,
						removed: removed,
						added: added
					};

					removed = [];
					added = [];
				}

				matched = aIndex;
				aSearch[aIndex] = used;
				bSearch[bIndex] = used;

				if (options.compareObjects) {
					const compared = diff(aArray[aIndex], bArray[bIndex]);
					if (compared) {
						patch[matched] = {
							type: Type.Update,
							patch: compared
						};
					}
				}

				++aIndex;
				++bIndex;
			}
			else {
				const aInB = (aSearch[aIndex] === used ? -1 : bSearch.indexOf(aId, bIndex));
				const bInA = aSearch.indexOf(bId, aIndex);
				if (aInB === -1 && bInA === -1) {
					// no mutual match
					if (aIndex < aLength) {
						const to = bSearch.indexOf(aId);
						if (to !== -1) {
							bSearch[to] = used;
						}
						removed.push({
							deleted: (to === -1)
						});

						++aIndex;
					}
					else {
						// no remaining mutual matches
						for (; bIndex < bLength; bIndex++) {
							bId = bIds[bIndex];
							const from = aSearch.indexOf(bId);
							if (from !== -1) {
								aSearch[from] = used;
								added.push({
									moved: true,
									from: from,
									to: bIndex
								});
							}
							else {
								added.push({
									moved: false,
									to: bIndex
								});
							}
						}
					}
				}
				else if (aInB === -1) {
					// aId is not in bIds
					// but bId is in aIds
					for (; aIndex < aLength; aIndex++) {
						aId = aIds[aIndex];
						if (aId === bId) {
							break;
						}
						const to = bSearch.indexOf(aId);
						if (to !== -1) {
							bSearch[to] = used;
						}
						removed.push({
							deleted: (to === -1)
						});
					}
				}
				else if (bInA === -1) {
					// bId is not in aIds
					// but aId is in bIds
					for (; bIndex < bLength; bIndex++) {
						bId = bIds[bIndex];
						if (bId === aId) {
							break;
						}
						bId = bIds[bIndex];
						const from = aSearch.indexOf(bId);
						if (from !== -1) {
							aSearch[from] = used;
							added.push({
								moved: true,
								from: from,
								to: bIndex
							});
						}
						else {
							added.push({
								moved: false,
								to: bIndex
							});
						}
					}
				}
				else if ((aInB - bIndex) > (bInA - aIndex)) {
					for (; aIndex < bInA; aIndex++) {
						aId = aIds[aIndex];
						const to = bSearch.indexOf(aId);
						if (to !== -1) {
							bSearch[to] = used;
						}
						removed.push({
							deleted: (to === -1)
						});
					}
				}
				else {
					if (bIndex == aInB) {
						debugger;
					}
					for (; bIndex < aInB; bIndex++) {
						bId = bIds[bIndex];
						const from = aSearch.indexOf(bId);
						if (from !== -1) {
							aSearch[from] = used;
							added.push({
								moved: true,
								from: from,
								to: bIndex
							});
						}
						else {
							added.push({
								moved: false,
								to: bIndex
							});
						}
					}
				}
			}
		}
		if (matched !== -1 && (removed.length || added.length)) {
			patch[matched + 1] = {
				type: Type.Splice,
				removed: removed,
				added: added
			};
		}
		return patch;
	}

	const patch = new ObjectPatch();
	const aObject: { [key: string]: any; } = a;
	const bObject: { [key: string]: any; } = b;
	for (const key in aObject) {
		if (!(key in bObject)) {
			patch[key] = {
				type: Type.Delete,
				oldValue: aObject[key]
			};
		}
		else {
			const aValue = aObject[key];
			const bValue = bObject[key];
			if (!isIdentical(aValue, bValue)) {
				patch[key] = {
					type: Type.Update,
					oldValue: aValue,
					newValue: bValue
				};
			}
		}
	}
	for (const key in bObject) {
		if (!(key in aObject)) {
			patch[key] = {
				type: Type.Add,
				newValue: bObject[key]
			};
		}
	}
	return (Object.keys(patch).length ? patch : null);
};

export interface TransformCallback<T, U> {
	(object: T): any;
}

export interface ArrayPatchOptions<T, U> {
	
}

export interface ArrayTransformPatchOptions<T, U> extends ArrayPatchOptions<T, U> {
	transformCallback: TransformCallback<T, U>
}

export function patch<T, U>(target: any[], patch: ArrayPatch<T, U>, options?: ArrayTransformPatchOptions<T, U>): void;
export function patch<T, U>(target: T[], patch: ArrayPatch<T, U>, options?: ArrayPatchOptions<T, U>): U[];
export function patch<T, U>(target: T, patch: ObjectPatch<T, U>): U;
export function patch<T, U>(target: any, patch: any, options = {}): any {
	if (Array.isArray(target)) {
		const arrayTarget: T[] = target;
		const arrayPatch: ArrayPatch<T, U> = patch;
		const arrayOptions: ArrayPatchOptions<T, U> = options;
		const transformCallback: TransformCallback<T, U> = (<{ [key: string]: TransformCallback<T, U> }>options)['transformCallback'];
		
		if (transformCallback) {
			return;
		}
		return arrayTarget;
	}

	const targetObject: { [key: string]: any; } = target;
	for (const key in patch) {
		const change = patch[key];
		if (change.type === Type.Delete) {
			delete targetObject[key];
			if (targetObject[key] !== undefined) {
				targetObject[key] = undefined;
			}
		}
		else if (change.type === Type.Add || change.type === Type.Update) {
			targetObject[key] = change.newValue;
		}
	}
	return targetObject;
};
