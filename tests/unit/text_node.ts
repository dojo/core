import * as registerSuite from 'intern!object';
import * as assert from 'intern/chai!assert';
import * as text from 'src/text';
import { spy } from 'sinon';
import * as fs from 'fs';
import { BuilderWriteAsModuleFunction, BuilderWriteFileAsModuleFunction } from 'src/interfaces';

const basePath = '_build/tests/support/data/';
let fsSpy: Sinon.SinonSpy;

registerSuite({
		name: 'text',

		'load': {
			beforeEach() {
				fsSpy = spy(fs, 'readFile');
			},

			afterEach() {
				fsSpy.restore && fsSpy.restore();
			},

			'should return text and call fs'() {
				text.load(basePath + 'textLoad.txt', require, this.async().callback((val: string) => {
					assert.isTrue(fsSpy.calledOnce, 'Read file should be called once');
					assert.strictEqual(val, 'test', 'Correct text should be returned');
				}));
			},
			'should return text from cache'() {
				text.load(basePath + 'textLoad.txt', require, this.async().callback((val: string) => {
					assert.isTrue(fsSpy.notCalled, 'Read file should not be called');
					assert.strictEqual(val, 'test', 'Correct text should be returned');
				}));
			}
		},

		'write': {
			'should return a module'() {
				const dfd = this.async();

				const write = () => { };
				(<BuilderWriteAsModuleFunction> <any> write).asModule = dfd.callback((moduleName: string, text: string) => {
					assert.strictEqual(moduleName, 'src/text!_build/tests/support/data/textLoad.txt');
					assert.strictEqual(text, `define(function () { return 'test'; });`);
				});
				text.load(basePath + 'textLoad.txt', require, () => {
					text.write('src/text', basePath + 'textLoad.txt', <BuilderWriteAsModuleFunction> <any> write);
				});
			}
		},

		'writeFile': {
			'should return a module'() {
				const dfd = this.async();

				const fileWrite = () => { };
				(<BuilderWriteFileAsModuleFunction> <any> fileWrite).asModule = dfd.callback((moduleName: string, fileName: string, text: string) => {
					assert.strictEqual(moduleName, 'src/text!_build/tests/support/data/textLoad.txt');
					assert.include(fileName, 'core/_build/tests/support/data/textLoad.txt.js');
					assert.strictEqual(text, `define(function () { return 'test'; });`);
				});
				text.writeFile('src/text', basePath + 'textLoad.txt!strip', require, <BuilderWriteFileAsModuleFunction> <any> fileWrite);
			}
		}
	}
);
