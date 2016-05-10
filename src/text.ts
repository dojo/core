import has from './has';
import request, { Response } from './request';
import Promise from './Promise';

/*
 * Strips <?xml ...?> declarations so that external SVG and XML
 * documents can be added to a document without worry. Also, if the string
 * is an HTML document, only the part inside the body tag is returned.
 */
function strip(text: string): string {
	if (!text) {
		return '';
	}

	text = text.replace(/^\s*<\?xml(\s)+version=[\'\"](\d)*.(\d)*[\'\"](\s)*\?>/im, '');
	let matches = text.match(/<body[^>]*>\s*([\s\S]+)\s*<\/body>/im);
	text = matches ? matches[1] : text;

	return text;
}

/*
 * Host-specific method to retrieve text
 */
let getText: (url: string, callback: (value: string) => void) => void;

if (has('host-browser')) {
	getText = function(url: string, callback: (value: string) => void): void {
		request(url).then(function(response: Response<string>) {
			callback(response.data);
		});
	};
}
else if (has('host-node')) {
	let fs = (<any> require).nodeRequire ? (<any> require).nodeRequire('fs') : require('fs');
	getText = function(url: string, callback: (value: string) => void): void {
		fs.readFile(url, { encoding: 'utf8' }, function(error: Error, data: string): void {
			if (error) {
				throw error;
			}

			callback(data);
		});
	};
}
else {
	getText = function(): void {
		throw new Error('dojo/text not supported on this platform');
	};
}

/*
 * Cache of previously-loaded text resources
 */
let textCache: { [key: string]: any; } = {};

/*
 * Cache of pending text resources
 */
let pending: { [key: string]: any; } = {};

export function get(url: string): Promise <string> {
	let promise = new Promise <string> (function (resolve, reject) {
		getText(url, function (text) {
			resolve(text);
		});
	});

	return promise;
}

/**
 * AMD Plugin API to Normalize the module ID
 * @param resourceId The resource ID to normalize.
 * @param normalize A normalization function that accepts a string ID to normalize using the
 *                  standard relative module normalization rules using the loader's current
 *                  configuration.
 */
export function normalize(resourceId: string, normalize: (moduleId: string) => string): string {
	let parts = resourceId.split('!');
	let url = parts[0];

	return (/^\./.test(url) ? normalize(url) : url) + (parts[1] ? '!' + parts[1] : '');
}

/**
 * A function called by the AMD loader when used as a plugin
 * @param resourceId The resource ID that the plugin should load. This ID MUST be normalized.
 * @param require A local require function to use to load other modules. This require function
 *                has some utilities on it:
 *                * **require.toUrl('moduleId+extension')** See the `require.toUrl` API notes
 *                  for more information.
 * @param load A function to call once the value of the resource ID has been determined. This
 *             tells the loader that the plugin is done loading the resource.
 */
export function load(resourceId: string, require: DojoLoader.Require, load: (value?: any) => void): void {
	let parts = resourceId.split('!');
	let stripFlag = parts.length > 1;
	let mid = parts[0];
	let url = require.toUrl(mid);
	let text: string;

	function finish(text: string): void {
		load(stripFlag ? strip(text) : text);
	}

	if (mid in textCache) {
		text = textCache[mid];
	}
	else if (url in textCache) {
		text = textCache[url];
	}

	if (!text) {
		if (pending[url]) {
			pending[url].push(finish);
		} else {
			let pendingList = pending[url] = [finish];
			getText(url, function(value: string) {
				textCache[mid] = textCache[url] = value;
				for (let i = 0; i < pendingList.length; ) {
					pendingList[i++](value);
				}
				delete pending[url];
			});
		}
	} else {
		finish(text);
	}
}
