import has from './has';
// TODO replace with async/Task when that's merged
import { default as Task } from './Promise';
import { Handle } from './interfaces';
import Registry, { Test } from './Registry';

class ProviderRegistry extends Registry<RequestProviderTest, RequestProvider> {
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

export interface RequestProvider {
	<T>(url: string, options: RequestOptions): RequestTask<T>;
}

export interface RequestProviderTest extends Test {
	(url: string, options: RequestOptions): boolean;
}

export interface RequestTask<T> extends Task<Response<T>> {
	data: Task<T>;
	headers: Task<{
		getHeader(name: string): string;
		requestOptions: RequestOptions;
		statusCode: number;
		url: string;
	}>
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
	defaultProvider = require('./request/node');
}
else if (has('host-browser')) {
	defaultProvider = require('./request/xhr');
}

interface Request extends RequestProvider {
	filterRegistry: Registry<RequestFilterTest, RequestFilter>;
	providerRegistry: ProviderRegistry;

	delete<T>(url: string, options?: RequestOptions): RequestTask<T>;
	get<T>(url: string, options?: RequestOptions): RequestTask<T>;
	post<T>(url: string, options?: RequestOptions): RequestTask<T>;
	put<T>(url: string, options?: RequestOptions): RequestTask<T>;
}

let request = <Request> function <T>(url: string, options: RequestOptions = {}): RequestTask<T> {
	var args: any[] = Array.prototype.slice.call(arguments, 0);

	var promise: RequestTask<T> = request.providerRegistry.match(arguments).apply(null, arguments).then(function (response: Response<T>): Task<Response<T>> {
		args.unshift(response);
		return Task.resolve(request.filterRegistry.match(args).apply(null, args)).then(function (filterResponse: any): Response<T> {
			response.data = filterResponse.data;
			return response;
		});
	});

	promise.data = promise.then(function (response: Response<T>): any {
		return response.data;
	});

	return promise;
};

request.filterRegistry = new Registry<RequestFilterTest, RequestFilter>(function (response: any): any {
	return response;
});

request.providerRegistry = new ProviderRegistry(defaultProvider);

request.filterRegistry.register(
	function (response: Response<any>, url: string, options: RequestOptions) {
		return typeof response.data === 'string' && options.responseType === 'json';
	},
	function (response: Response<any>, url: string, options: RequestOptions): Object {
		return JSON.parse(response.data);
	}
);

[ 'delete', 'get', 'post', 'put' ].forEach(function (method) {
	(<any> request)[method] = function <T>(url: string, options: RequestOptions): RequestTask<T> {
		options = Object.create(options);
		options.method = method.toUpperCase();
		return request(url, options);
	};
});

export default request;
