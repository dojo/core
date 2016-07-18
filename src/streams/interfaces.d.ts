export interface Strategy<T> {
	/**
	 * Computes the number of items in a chunk.
	 */
	size?: (chunk: T | undefined) => number;

	/**
	 * The number of chunks allowed in the queue before backpressure is applied.
	 */
	highWaterMark?: number;
}
