import EventEmitter from 'events';
import chokidar from 'chokidar';

export class DirWatcher extends EventEmitter {
	constructor(path, delay) {
		super(path, delay);

		chokidar.watch(path, {usePolling: true, interval: delay})
			.on('change', (filename) => {
				this.emit('dirwatcher:changed', filename);
			})
			.on('unlink', (path) => console.log(`File ${path} has been removed`));
	}
}