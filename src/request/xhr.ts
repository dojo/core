// TODO replace with async/Task when that's merged
import { default as Task } from '../Promise';
import request, { RequestOptions, RequestPromise, Response } from '../request';

export interface XHRRequestOptions extends RequestOptions {
	blockMainThread?: boolean;
}

export interface XHRResponse<T> extends Response<T> {
	statusText: string;
}

export default function xhr<T>(url: string, options: XHRRequestOptions = {}): RequestPromise<T> {
	let resolve: (value: XHRResponse<T> | Task<XHRResponse<T>>) => void;
	let reject: (error: Error) => void;
	// TODO: use proper Task signature when Task is available
	// let promise = <RequestPromise<T>> (new Task<XHRResponse<T>>((_resolve, _reject) => {
	// 	resolve = _resolve;
	// 	reject = _reject;
	// }, () => {
	// 	request && request.abort();
	// });
	let promise = <RequestPromise<T>> new Task<XHRResponse<T>>((_resolve, _reject) => {
		resolve = _resolve;
		reject = _reject;
	});

	var request = new XMLHttpRequest();
	var response = <XHRResponse<T>> {
		data: null,
		getHeader: function (name: string): string {
			return request.getResponseHeader(name);
		},
		nativeResponse: request,
		requestOptions: options,
		statusCode: null,
		statusText: null,
		url: url
	};

	if ((!options.user || !options.password) && options.auth) {
		let auth = options.auth.split(':');
		options.user = decodeURIComponent(auth[0]);
		options.password = decodeURIComponent(auth[1]);
	}

	request.open(options.method, url, !options.blockMainThread, options.user, options.password);

	request.onerror = function (event: ErrorEvent): void {
		reject(event.error);
	};

	request.onload = function (): void {
		response.data = options.responseType === 'xml' ? request.responseXML : request.response;
		response.statusCode = request.status;
		response.statusText = request.statusText;
		resolve(response);
	};

	if (options.timeout > 0 && options.timeout !== Infinity) {
		request.timeout = options.timeout;
	}

	for (var header in options.headers) {
		request.setRequestHeader(header, options.headers[header]);
	}

	request.send(options.data);

	promise.data = promise.then(response => response.data);
	promise.headers = promise.then(response => response);

	return promise;
}
