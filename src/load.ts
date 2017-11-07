import Promise from '@dojo/shim/Promise';
import { isPlugin, useDefault } from './load/util';

export interface AmdConfig {
	/**
	 * The base URL that the loader will use to resolve modules
	 */
	baseUrl?: string;

	/**
	 * A map of module identifiers and their replacement meta data
	 */
	map?: AmdModuleMap;

	/**
	 * An array of packages that the loader should use when resolving a module ID
	 */
	packages?: AmdPackage[];

	/**
	 * A map of paths to use when resolving modules names
	 */
	paths?: { [ path: string ]: string; };

	/**
	 * A map of packages that the loader should use when resolving a module ID
	 */
	pkgs?: { [ path: string ]: AmdPackage; };
}

export interface AmdDefine {
	/**
	 * Define a module
	 *
	 * @param moduleId the MID to use for the module
	 * @param dependencies an array of MIDs this module depends upon
	 * @param factory the factory function that will return the module
	 */
	(moduleId: string, dependencies: string[], factory: AmdFactory): void;

	/**
	 * Define a module
	 *
	 * @param dependencies an array of MIDs this module depends upon
	 * @param factory the factory function that will return the module
	 */
	(dependencies: string[], factory: AmdFactory): void;

	/**
	 * Define a module
	 *
	 * @param factory the factory function that will return the module
	 */
	(factory: AmdFactory): void;

	/**
	 * Define a module
	 *
	 * @param value the value for the module
	 */
	(value: any): void;

	/**
	 * Meta data about this particular AMD loader
	 */
	amd: { [prop: string]: string | number | boolean };
}

export interface AmdFactory {
	/**
	 * The module factory
	 *
	 * @param modules The arguments that represent the resolved versions of the module dependencies
	 */
	(...modules: any[]): any;
}

export interface AmdHas {
	/**
	 * Determine if a feature is present
	 *
	 * @param name the feature name to check
	 */
	(name: string): any;

	/**
	 * Register a feature test
	 *
	 * @param name The name of the feature to register
	 * @param value The test for the feature
	 * @param now If `true` the test will be executed immediatly, if not, it will be lazily executed
	 * @param force If `true` the test value will be overwritten if already registered
	 */
	add(name: string, value: (global: Window, document?: HTMLDocument, element?: HTMLDivElement) => any,
		now?: boolean, force?: boolean): void;
	add(name: string, value: any, now?: boolean, force?: boolean): void;
}

export interface AmdModuleMap extends AmdModuleMapItem {
	[ sourceMid: string ]: AmdModuleMapReplacement;
}

export interface AmdModuleMapItem {
	[ mid: string ]: any;
}

export interface AmdModuleMapReplacement extends AmdModuleMapItem {
	[ findMid: string ]: string;
}

export interface AmdNodeRequire extends AmdRequire {
	nodeRequire: NodeRequire;
}

export interface AmdPackage {
	/**
	 * The path to the root of the package
	 */
	location?: string;

	/**
	 * The main module of the package (defaults to `main.js`)
	 */
	main?: string;

	/**
	 * The package name
	 */
	name?: string;
}

export interface AmdRequire {
	/**
	 * Resolve a list of module dependencies and pass them to the callback
	 *
	 * @param dependencies The array of MIDs to resolve
	 * @param callback The function to invoke with the resolved dependencies
	 */
	(dependencies: string[], callback: AmdRequireCallback): void;

	/**
	 * Resolve and return a single module (compatability with CommonJS `require`)
	 *
	 * @param moduleId The module ID to resolve and return
	 */
	<ModuleType>(moduleId: string): ModuleType;

	/**
	 * Take a relative MID and return an absolute MID
	 *
	 * @param moduleId The relative module ID to resolve
	 */
	toAbsMid(moduleId: string): string;

	/**
	 * Take a path and resolve the full URL for the path
	 *
	 * @param path The path to resolve and return as a URL
	 */
	toUrl(path: string): string;
}

export interface AmdRequireCallback {
	/**
	 * The `require` callback
	 *
	 * @param modules The arguments that represent the resolved versions of dependencies
	 */
	(...modules: any[]): void;
}

export interface AmdRootRequire extends AmdRequire {
	/**
	 * The minimalist `has` API integrated with the `@dojo/loader`
	 */
	has: AmdHas;

	/**
	 * Register an event listener
	 *
	 * @param type The event type to listen for
	 * @param listener The listener to call when the event is emitted
	 */
	on(type: AmdSignalType, listener: any): { remove: () => void };

	/**
	 * Configure the loader
	 *
	 * @param config The configuration to apply to the loader
	 */
	config(config: AmdConfig): void;

	/**
	 * Return internal values of loader for debug purposes
	 *
	 * @param name The name of the internal label
	 */
	inspect?(name: string): any;

	/**
	 * If running in the node environment, a reference to the original NodeJS `require`
	 */
	nodeRequire?(id: string): any;

	/**
	 * Undefine a module, based on absolute MID that should be removed from the loader cache
	 */
	undef(moduleId: string): void;
}

/**
 * The signal type for the `require.on` API
 */
export type AmdSignalType = 'error';

export interface NodeRequire {
	(moduleId: string): any;
	resolve(moduleId: string): string;
}

export type Require = AmdRequire | NodeRequire;

export interface Load {
	(require: Require, ...moduleIds: string[]): Promise<any[]>;
	(...moduleIds: string[]): Promise<any[]>;
}

declare const require: Require;

declare const define: AmdDefine;

export function isAmdRequire(object: any): object is AmdRequire {
	return typeof object.toUrl === 'function';
}

export function isAmdNodeRequire(object: any): object is AmdNodeRequire {
	return isAmdRequire(object) && typeof (<any> object).nodeRequire === 'function';
}

export function isNodeRequire(object: any): object is NodeRequire {
	return typeof object.resolve === 'function';
}

const load: Load = (function (): Load {
	const resolver = isAmdRequire(require) ? require.toUrl :
		isNodeRequire(require) ? require.resolve :
		(resourceId: string) => resourceId;

	function pluginLoad(moduleIds: string[], load: Load, loader: (modulesIds: string[]) => Promise<any>) {
		const pluginResourceIds: string[] = [];
		moduleIds = moduleIds.map((id: string, i: number) => {
			const parts = id.split('!');
			pluginResourceIds[i] = parts[1];
			return parts[0];
		});

		return loader(moduleIds).then((modules: any[]) => {
			pluginResourceIds.forEach((resourceId: string, i: number) => {
				if (typeof resourceId === 'string') {
					const module = modules[i];
					const defaultExport = module['default'] || module;

					if (isPlugin(defaultExport)) {
						resourceId = typeof defaultExport.normalize === 'function' ?
							defaultExport.normalize(resourceId, resolver) :
							resolver(resourceId);

						modules[i] = defaultExport.load(resourceId, load);
					}
				}
			});

			return Promise.all(modules);
		});
	}

	if (typeof module === 'object' && typeof module.exports === 'object') {
		return function load(contextualRequire: any, ...moduleIds: string[]): Promise<any[]> {
			if (typeof contextualRequire === 'string') {
				moduleIds.unshift(contextualRequire);
				contextualRequire = require;
			}

			return pluginLoad(moduleIds, load, (moduleIds: string[]) => {
				try {
					return Promise.resolve(moduleIds.map(function (moduleId): any {
						return contextualRequire(moduleId.split('!')[0]);
					}));
				}
				catch (error) {
					return Promise.reject(error);
				}
			});
		};
	}
	else if (typeof define === 'function' && define.amd) {
		return function load(contextualRequire: any, ...moduleIds: string[]): Promise<any[]> {
			if (typeof contextualRequire === 'string') {
				moduleIds.unshift(contextualRequire);
				contextualRequire = require;
			}

			return pluginLoad(moduleIds, load, (moduleIds: string[]) => {
				return new Promise(function (resolve, reject) {
					let errorHandle: { remove: () => void };

					if (typeof contextualRequire.on === 'function') {
						errorHandle = contextualRequire.on('error', (error: Error) => {
							errorHandle.remove();
							reject(error);
						});
					}

					contextualRequire(moduleIds, function (...modules: any[]) {
						errorHandle && errorHandle.remove();
						resolve(modules);
					});
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

export {
	isPlugin,
	useDefault
};
