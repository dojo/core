import load from '../../../src/load';

export const succeed = load(require, './a', './b');
export const fail = load(require, './a', './c');
