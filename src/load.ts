import Promise from 'dojo-shim/Promise';
import { Require } from 'dojo-interfaces/loader';

declare const require: Require;

declare const define: {
	(...args: any[]): any;
	amd: any;
};

export interface NodeRequire {
	(moduleId: string): any;
}

export type Require = Require | NodeRequire;

export interface Load {
	(require: Require, ...moduleIds: string[]): Promise<any[]>;
	(require: Require, isDefault: boolean, ...moduleIds: string[]): Promise<any[]>;
	(...moduleIds: string[]): Promise<any[]>;
	(isDefault: boolean, ...moduleIds: string[]): Promise<any[]>;
}

interface EsModule {
	__esModule: boolean;
	default: any;
	[index: string]: any;
}
function processModules(module: EsModule, isDefault: boolean): Object;
function processModules(modules: EsModule[], isDefault: boolean): Object[];
function processModules(modules: any, isDefault: boolean): Object | Object[] {
	const processModule = (module: EsModule) => {
		if (isDefault) {
			return module.__esModule ? module.default : module;
		} else {
			const contents: { [member: string]: any } = {};
			for (const member of Object.keys(module)) {
				if (member !== '__esModule' && member !== 'default') {
					contents[member] = module[member];
				}
			}
			return contents;
		}
	};
	return Array.isArray(modules) ? modules.map(processModule) : processModule(modules);
}

const load: Load = (function (): Load {
	if (typeof module === 'object' && typeof module.exports === 'object') {
		return function (contextualRequire: any, isDefault: any, ...moduleIds: string[]): Promise<any[]> {
			if (typeof isDefault !== 'boolean') {
				moduleIds.unshift(isDefault);
				isDefault = true;
			}
			if (typeof contextualRequire === 'string') {
				moduleIds.unshift(contextualRequire);
				contextualRequire = require;
			}
			return new Promise(function (resolve, reject) {
				try {
					resolve(moduleIds.map(function (moduleId): any {
						return processModules(contextualRequire(moduleId), isDefault);
					}));
				}
				catch (error) {
					reject(error);
				}
			});
		};
	}
	else if (typeof define === 'function' && define.amd) {
		return function (contextualRequire: any, isDefault: any, ...moduleIds: string[]): Promise<any[]> {
			if (typeof isDefault !== 'boolean') {
				moduleIds.unshift(isDefault);
				isDefault = true;
			}
			if (typeof contextualRequire === 'string') {
				moduleIds.unshift(contextualRequire);
				contextualRequire = require;
			}
			return new Promise(function (resolve) {
				// TODO: Error path once https://github.com/dojo/loader/issues/14 is figured out
				contextualRequire(moduleIds, function (...modules: any[]) {
					resolve(processModules(modules, isDefault));
				});
			});
		};
	}
	else {
		return function () {
			return Promise.reject(new Error('Unknown loader'));
		};
	}
})();
export default load;
