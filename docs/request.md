# request

This modules provides 4 methods (get, post, delete, and put) to simplify sending
http requests. Each of these methods returns a promise that resolves with the
response.

* request
  * get
	* post
	* delete
	* put

## Monitoring Download Progress

You can monitor download progress by listening for events on the response object.

```typescript
request("http://www.example/some-large-file").then(response => {
	response.on('progress', progressEvent => {
		console.log(`Total downloaded: ${progressEvent.totalBytesDownloaded}`);
	});
});
```

## Monitoring Upload Progress

You can monitor upload progress by providing an `uploadObserver` in the request options.

```typescript
const uploader = new UploadObserver();
uploader.on('upload', uploadEvent => {
	console.log(`Total uploaded: ${uploadEvent.totalBytesUploaded}`);
});
request.post('http://www.example.com/', {
	body: someLargeString,
	uploadObserver: uploader
});
```

Note that while the node provider will emit a single `upload` event when it is done uploading, it cannot emit more granular upload events with `string` or `Buffer` body types. To receive more frequent upload events, you can use the `bodyStream` option to provide a `Readable` with the body content. Upload events will be emitted as the data is read from the stream.

```typescript
request.post('http://www.example.com/', {
	bodyStream: fs.createReadStream('some-large-file'),
	uploadObserver: uploader
});
```
