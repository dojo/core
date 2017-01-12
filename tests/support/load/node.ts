import load from '../../../src/load';
import { Require } from 'dojo-interfaces/loader';

declare const require: Require;

export const succeedDefault = load(require, './a', './b');
export const succeedNonDefault = load(require, false, './a', './b');
export const fail = load(require, './a', './c');

export const globalSucceed = load('fs', 'path');
export const globalFail = load('fs', './a');
