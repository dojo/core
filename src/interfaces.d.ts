import Promise from './Promise';

export interface EventObject {
	type: string;
}

export interface Handle {
	destroy(): void;
}

export interface Hash<T> {
	[ key: string ]: T;
}

export interface BuilderWriteAsModuleFunction {
	/**
	 * @param text The contents of the module
	 */
	(text: string): void;

	/**
	 * @param moduleName The module name
	 * @param text The contents of the module
	 */
	asModule(moduleName: string, text: string): void;
}

export interface BuilderWriteFileAsModuleFunction {
	/**
	 * @param fileName The name of the file to write.
	 * @param text The contents of the file.
	 */
	(fileName: string, text: string): void;

	/**
	 * @param moduleName The module name
	 * @param fileNAme The name of the file to write
	 * @param text The contents of the module
	 */
	asModule(moduleName: string, fileName: string, text: string): void;
}

/**
 * RequireJS Builder Plugin Interface
 *
 * See [RequireJS Plugin Docs](http://requirejs.org/docs/plugins.html)
 */
export interface BuilderLoaderPlugin extends DojoLoader.LoaderPlugin {
	/**
	 * Called only by an optimizer and only needs to be implemented if the plugin would need to write something
	 * out in an optimized layer.
	 *
	 * @param pluginName The normalized name for the plugin, as most plugins will be anonymous plugins and
	 *                   the plugin may need to know the normalized name
	 * @param moduleName The normalized resource name
	 * @param write A function to be called with a string of output to write to the optimized file. This
	 *              function also includes a property function named `asModule`. `asModule` can be used
	 *              to write out a module that may have an anonymous define call in there that needs name
	 *              insertion or/and contains implicit require("") dependencies that need to be pulled out
	 *              for the optimized file. asModule is useful for text transform plugins, like a
	 *              TypeScript plugin.
	 */
	write?(pluginName: string, moduleName: string, write: BuilderWriteAsModuleFunction): void;

	/**
	 * Called only by an optimizer and only needs to be implemented if the plugin needs to write some code
	 * at the end of the layer or reset some internal state at the end of an optimized layer.
	 *
	 * @param write A function to be called with string of text to be written into the layer
	 * @param data An object which provides data about the layer, where `name` is the module name of the
	 *             layer (and maybe `undefined`) and `path` which is the file path to the layer, though
	 *             maybe `undefined` if just being output to another script versus the file system
	 */
	onLayerEnd?(write: (text: string) => void, data: { name?: string; path?: string; }): void;

	/**
	 * Called only be an optimizer and only needs to be implemented if the plugin needs to write out an
	 * alternative version of a dependency that is handled by the plugin.  Certain optimizers will only
	 * call this function in certain configurations.
	 *
	 * @param pluginName The normalized name for the plugin.
	 * @param name The normalized resource name
	 * @param parentRequire A local `require` function. The main use is to call `parentRequire.toUrl()` to
	 *                      generate file paths that are inside the build directory
	 * @param write A function that can be called to write out the write out a module
	 */
	writeFile?(pluginName: string, name: string, parentRequire: DojoLoader.Require, write: BuilderWriteFileAsModuleFunction): void;

	/**
	 * A string that points to an alternative plugin module to use instead of the current plugin.
	 *
	 * A plugin could have very specific logic that depends on a certain environment, like the browser.
	 * However, when run inside an optimizer, the environment is very different, and the plugin may have
	 * a write plugin API implementation that it does not want to deliver as part of the normal plugin
	 * that is loaded in the browser. In those cases, specifying a pluginBuilder is useful.
	 */
	pluginBuilder?: string;
}

export interface SystemJSLoadLocate {
	/**
	 * the canonical module name
	 */
	name: string;

	/**
	 * a metadata object that can be used to store derived metadata for reference in other hooks
	 */
	metadata: { [key: string]: any };
}

export interface SystemJSLoadFetch extends SystemJSLoadLocate {
	/**
	 * the URL returned from locate
	 */
	address: string;
}

export interface SystemJSLoadTranslate extends SystemJSLoadFetch {
	/**
	 * the fetched source
	 */
	source: string;
}

export interface SystemJSModuleFactory<M> {
	/**
	 * An array of other module dependencies
	 */
	deps: string[];

	/**
	 * The factory function which returns the module
	 */
	execute: () => M;
}

export interface SystemJSLoaderExtension {
	/**
	 * Given the import name, provide the normalized name for the resource.
	 *
	 * @param name the unnormalized module name
	 * @param parentName the canonical module name for the requesting module
	 * @param parentAddess the address of the requesting module
	 */
	normalize?(name: string, parentName: string, parentAddress: string): string | Promise<string>;

	/**
	 * Given a normalized module name, provide the URL for the resource.
	 *
	 * @param load An object which contains information about the loading process
	 */
	locate?(load: SystemJSLoadLocate): string | Promise<string>;

	/**
	 * Given an URL for a resource, fetch its content.
	 *
	 * @param load An object which contains information about the loading process
	 */
	fetch?(load: SystemJSLoadFetch): string | Promise<string>;

	/**
	 * Given module source, make any source modifications.
	 *
	 * @param load An object which contains information about the loading process
	 */
	translate?(load: SystemJSLoadTranslate): string | Promise<string>;

	/**
	 * Given module source, determine its dependencies, and how to execute it.
	 *
	 * @param load An object which contains information about the loading process
	 */
	instantiate?<M>(load: SystemJSLoadTranslate): void | SystemJSModuleFactory<M> | Promise<SystemJSModuleFactory<M> | void>;

	/**
	 * A flag, if defined and `false` will omit a module from being "built" by the SystemJS builder
	 */
	build?: boolean;
}