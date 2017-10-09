import { DirWatcher } from './dirwatcher';
import fs from 'fs';
import parseSync from 'csv-parse/lib/sync';

const promisify = require('util-promisify');
const readFileAsync = promisify(fs.readFile);

export class Importer {
	constructor(folderPath, delay) {
		const dirWatcher = new DirWatcher(folderPath, delay);

		dirWatcher.on('dirwatcher:changed', (fileName) => {
			if(!/\.csv$/.test(fileName)){
				throw Error('file is not csv');
			}

			this.import(fileName)
				.then(
					(json) => console.log(json),
					(err) => { throw err }
				)
		});
	}

	import(path){
		return readFileAsync(path)
			.then((data) => parseSync(data.toString(), {columns: true}))
			.catch((err) => { throw err });
	}

	importSync(path){
		const data = fs.readFileSync(path);

		return parseSync(data.toString(), {columns: true});
	}
}