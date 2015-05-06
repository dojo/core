import has from './has';
// TODO replace with async/Task when that's merged
import { default as Task } from './Promise';
import { Handle } from './interfaces';
import Registry, { Test } from './Registry';
import nodeRequest from './request/node';
import xhrRequest from './request/xhr';

class ProviderRegistry extends Registry<RequestProvider> {
	register(test: string | RegExp | RequestProviderTest, value: RequestProvider, first?: boolean): Handle {
		let entryTest: Test;

		if (typeof test === 'string') {
			entryTest = (url, options) => {
				return test === url;
			}
		}
		else if (test instanceof RegExp) {
			entryTest = (url, options) => {
				return test.test(url);
			}
		}
		else {
			entryTest = <RequestProviderTest> test;
		}

		return super.register(entryTest, value, first);
	}
}

interface Request extends RequestProvider {
	filterRegistry: Registry<RequestFilter>;
	providerRegistry: ProviderRegistry;

	delete<T>(url: string, options?: RequestOptions): RequestPromise<T>;
	get<T>(url: string, options?: RequestOptions): RequestPromise<T>;
	post<T>(url: string, options?: RequestOptions): RequestPromise<T>;
	put<T>(url: string, options?: RequestOptions): RequestPromise<T>;
}

export interface RequestError<T> extends Error {
	response: Response<T>;
}

export interface RequestFilter {
	<T>(response: Response<T>, url: string, options: RequestOptions): T;
}

export interface RequestFilterTest extends Test {
	(response: Response<any>, url: string, options: RequestOptions): boolean;
}

export interface RequestOptions {
	auth?: string;
	cacheBust?: any;
	data?: any;
	headers?: { [name: string]: string; };
	method?: string;
	password?: string;
	query?: string;
	responseType?: string;
	timeout?: number;
	user?: string;
}

/**
 * The promise returned by a request, which will resolve to a Response. It also contains data and headers properties
 * that resolve when the request completes.
 */
export interface RequestPromise<T> extends Task<Response<T>> {
	data: Task<T>;
	headers: Task<{
		getHeader(name: string): string;
		requestOptions: RequestOptions;
		statusCode: number;
		url: string;
	}>
}

export interface RequestProvider {
	<T>(url: string, options?: RequestOptions): RequestPromise<T>;
}

export interface RequestProviderTest extends Test {
	(url: string, options?: RequestOptions): boolean;
}

export interface Response<T> {
	data: T;
	getHeader(name: string): string;
	nativeResponse?: any;
	requestOptions: RequestOptions;
	statusCode: number;
	url: string;
}

let defaultProvider: RequestProvider;

if (has('host-node')) {
	// defaultProvider = nodeRequest;
	defaultProvider = <any> {};
}
else if (has('host-browser')) {
	defaultProvider = xhrRequest;
}

/**
 * Make a request, returning a Promise that will resolve or reject when the request completes.
 */
let request = <Request> function <T>(url: string, options: RequestOptions = {}): RequestPromise<T> {
	let args: any[] = Array.prototype.slice.call(arguments, 0);
	let promise = <RequestPromise<T>> request.providerRegistry.match(url, options)(url, options)
		.then(function (response: Response<T>) {
			return Task.resolve(request.filterRegistry.match(response, url, options)(response, url, options))
				.then(function (filterResponse: any) {
					response.data = filterResponse.data;
					return response;
				});
		});

	// Add data and headers properties if the provider hasn't already
	promise.data = promise.data || promise.then(response => response.data);
	promise.headers = promise.headers || promise.then(response => response);

	return promise;
};

/**
 * Request filters, which filter or modify responses. The default filter simply passes a response through unchanged.
 */
request.filterRegistry = new Registry<RequestFilter>(function (response: any): any {
	return response;
});

/**
 * Request providers, which fulfill requests.
 */
request.providerRegistry = new ProviderRegistry(defaultProvider);

/**
 * Add a filter that automatically parses incoming JSON responses.
 */
request.filterRegistry.register(
	function (response: Response<any>, url: string, options: RequestOptions) {
		return typeof response.data === 'string' && options.responseType === 'json';
	},
	function (response: Response<any>, url: string, options: RequestOptions): Object {
		return JSON.parse(response.data);
	}
);

/**
 * Create the standard HTTP verb handlers.
 */
[ 'delete', 'get', 'post', 'put' ].forEach(function (method) {
	(<any> request)[method] = function <T>(url: string, options: RequestOptions): RequestPromise<T> {
		options = Object.create(options);
		options.method = method.toUpperCase();
		return request(url, options);
	};
});

export default request;
