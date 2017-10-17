#!/usr/bin/env node

function run(){
	const parseArgs = require('minimist');
	const fs = require('fs');
	const through = require('through2');
	const path = require('path');
	const request = require('request');
	const parseCsv = require('csv-parse/lib/sync');
	const combine = require('combine-streams');
	const EPAM_CSS_URL = 'https://www.epam.com/etc/clientlibs/foundation/main.min.fc69c13add6eae57cd247a91c7e26a15.css';
	const args = parseArgs(process.argv.slice(2), {
		alias: {
			'help': 'h',
			'action': 'a',
			'file': 'f',
			'path': 'p'
		}
	});
	const FILE = args.file;

    /**
	 * Help
     */
	if(args.help){
		process.stdout.write(`
			node streams -a=io -f=./readMe.txt
			node streams -a=toUpperCase
			node streams -a=transform -f=../data/MOCK_DATA.csv
			node streams -a=transformFile -f=../data/MOCK_DATA.csv
			node streams -a=cssBundler -p=../css
		`);

		process.exit(0);
	}
	
	if(!args.action){
		process.stderr.write(`ERROR: action is missing\n`);
		process.exit(1);
	}

    /**
	 * Just in case
     */
	const onError = () => {
		process.stderr.write(`ERROR: error occured\n`);
		process.exit(1);
	};

    /**
	 * Finish
     */
	const onFinish = () => {
		process.exit(0);
	};

    /**
	 * Actions
     */
	const actions = {
		io(){
			fs.createReadStream(path.join(__dirname, FILE))
				.pipe(process.stdout)
				.on('error', onError)
				.on('finish', onFinish);
		},
		
		toUpperCase(){
			function toUpper(chunk, enc, next) {
				this.push(chunk.toString().toUpperCase()); 
				next();
			}
			process.stdin.pipe(through(toUpper)).pipe(process.stdout)
				.on('error', onError)
				.on('finish', onFinish);
		},
	
		transform(){
            if(!args.file){
                process.stderr.write(`ERROR: File is missing\n`);
                process.exit(1);
            }

            if(!/\.csv$/.test(FILE)){
                process.stderr.write(`ERROR: file is not csv\n`);
            }

			fs.createReadStream(path.join(__dirname, FILE))
				.pipe(through(function (chunk, enc, next) {
					this.push(JSON.stringify(parseCsv(chunk.toString()), null, 4));
					next();
				}))
				.pipe(process.stdout)
				.on('error', onError)
				.on('finish', onFinish);
		},
	
		transformFile(){
            if(!args.file){
                process.stderr.write(`ERROR: File is missing\n`);
                process.exit(1);
            }

			if(!/\.csv$/.test(FILE)){
				process.stderr.write(`ERROR: file is not csv\n`);
			}
		
			fs.createReadStream(path.join(__dirname, FILE))
				.pipe(through(function (chunk, enc, next) {
					this.push(JSON.stringify(parseCsv(chunk.toString()), null, 4));
					next();
				}))
				.pipe(fs.createWriteStream(path.join(__dirname, FILE.replace('.csv', '.json'))))
				.on('error', onError)
				.on('finish', onFinish);
		},
		
		cssBundler(){

            if(!args.path){
                process.stderr.write(`ERROR: Path to css folder is missing\n`);
                process.exit(1);
            }

			const directory = args.path;
			fs.readdir(directory, function (err, files) {
				if(err){
					process.stderr.write(err);
					return;
				}
				let combinedStreams = combine();

				files.forEach((file) => {
					combinedStreams = combinedStreams.append(fs.createReadStream(directory + '/' + file));
				});
		
				combinedStreams = combinedStreams.append(request(EPAM_CSS_URL));
		
				combinedStreams.append(null)
				.pipe(fs.createWriteStream(directory + '/bundle.css'));
			});
		}
	};

    /**
	 * error handling to avoid app crash
     */
	try {
		actions[args.action]();
	} catch(e){
		process.stderr.write(`ERROR: Something went wrong. Action not run\n`);
		process.exit(1);
	}
}

if(module.parent){
	exports.run = run;
} else {
	run();
}