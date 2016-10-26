import { RequestOptions } from '../request';
import UrlSearchParams from '../UrlSearchParams';

/**
 * Returns a URL formatted with optional query string and cache-busting segments.
 *
 * @param url The base URL.
 * @param options The options hash that is used to generate the query string.
 */
export function generateRequestUrl(url: string,
		{ cacheBust }: RequestOptions = {}): string {
	let query = new UrlSearchParams(cacheBust.query).toString();
	if (cacheBust) {
		const bustString = String(Date.now());
		query += query ? `&${bustString}` : bustString;
	}
	const separator = url.indexOf('?') > -1 ? '&' : '?';
	return query ? `${url}${separator}${query}` : url;
}
