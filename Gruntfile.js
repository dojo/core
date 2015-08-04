/* jshint node:true */

function mixin(destination) {
	for (var i = 1; i < arguments.length; i++) {
		var source = arguments[i];
		for (var key in source) {
			destination[key] = source[key];
		}
	}
	return destination;
}

module.exports = function (grunt) {
	grunt.loadNpmTasks('grunt-contrib-clean');
	grunt.loadNpmTasks('grunt-contrib-copy');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-ts');
	grunt.loadNpmTasks('grunt-tslint');
	grunt.loadNpmTasks('dts-generator');
	grunt.loadNpmTasks('intern');

	grunt.loadTasks('tasks');

	var tsconfigContent = grunt.file.read('tsconfig.json');
	var tsconfig = JSON.parse(tsconfigContent);
	var tsOptions = mixin({}, tsconfig.compilerOptions, {
		failOnTypeErrors: true,
		fast: 'never'
	});
	tsconfig.filesGlob = tsconfig.filesGlob.map(function (glob) {
		if (/^\.\//.test(glob)) {
			// Remove the leading './' from the glob because grunt-ts
			// sees it and thinks it needs to create a .baseDir.ts which
			// messes up the "dist" compilation
			return glob.slice(2);
		}
		return glob;
	});
	var packageJson = grunt.file.readJSON('package.json');

	grunt.initConfig({
		name: packageJson.name,
		version: packageJson.version,
		tsconfig: tsconfig,
		all: [ '<%= tsconfig.filesGlob %>' ],
		skipTests: [ '<%= all %>' , '!tests/**/*.ts' ],
		staticTestFiles: [ 'tests/**/*.{html,css,json,xml}', 'tests/support/JsonReporter.js' ],
		devDirectory: '<%= tsconfig.compilerOptions.outDir %>',
		istanbulIgnoreNext: '/* istanbul ignore next */',

		clean: {
			dist: {
				src: [ 'dist/' ]
			},
			dev: {
				src: [ '<%= devDirectory %>' ]
			},
			src: {
				src: [ '{src,tests}/**/*.js' ],
				filter: function (path) {
					// Only clean the .js file if a .js.map file also exists
					var mapPath = path + '.map';
					if (grunt.file.exists(mapPath)) {
						grunt.file.delete(mapPath);
						return true;
					}
					return false;
				}
			},
			report: {
				src: [ 'html-report/' ]
			},
			coverage: {
				src: [ 'coverage.json' ]
			}
		},

		copy: {
			staticFiles: {
				expand: true,
				cwd: '.',
				src: [ 'README.md', 'LICENSE', 'package.json', 'bower.json' ],
				dest: 'dist/'
			},
			staticTestFiles: {
				expand: true,
				cwd: '.',
				src: [ '<%= staticTestFiles %>' ],
				dest: '<%= devDirectory %>'
			},
			typings: {
				expand: true,
				cwd: 'typings/',
				src: [ '**/*.d.ts', '!tsd.d.ts' ],
				dest: 'dist/_typings/'
			}
		},

		dtsGenerator: {
			options: {
				baseDir: 'src',
				name: '<%= name %>'
			},
			dist: {
				options: {
					out: 'dist/_typings/<%= name %>/<%= name %>-<%= version %>.d.ts'
				},
				src: [ '<%= skipTests %>' ]
			}
		},

		intern: {
			options: {
				runType: 'runner',
				config: '<%= devDirectory %>/tests/intern',
				reporters: [ 'LcovHtml' ]
			},
			runner: {
				options: {
					reporters: [ 'Runner', '<%= intern.options.reporters %>' ]
				}
			},
			local: {
				options: {
					config: '<%= devDirectory %>/tests/intern-local',
					reporters: [ 'Runner', '<%= intern.options.reporters %>' ]
				}
			},
			client: {
				options: {
					runType: 'client',
					reporters: [ 'Console', '<%= intern.options.reporters %>' ]
				}
			},
			proxy: {
				options: {
					proxyOnly: true
				}
			}
		},

		rename: {
			sourceMaps: {
				expand: true,
				cwd: 'dist/',
				src: [ '**/*.js.map', '!_debug/**/*.js.map' ],
				dest: 'dist/_debug/'
			}
		},

		rewriteSourceMaps: {
			dist: {
				src: [ 'dist/_debug/**/*.js.map' ]
			}
		},

		ts: {
			options: tsOptions,
			dev: {
				outDir: '<%= devDirectory %>',
				src: [ '<%= all %>' ]
			},
			dist: {
				options: mixin({}, tsOptions, {
					mapRoot: '../dist/_debug',
					sourceMap: true,
					inlineSourceMap: false,
					inlineSources: true
				}),
				outDir: 'dist',
				src: [ '<%= skipTests %>' ]
			}
		},

		tslint: {
			options: {
				configuration: grunt.file.readJSON('tslint.json')
			},
			src: {
				src: [
					'<%= all %>',
					'!typings/**/*.ts',
					'!tests/typings/**/*.ts'
				]
			}
		},

		watch: {
			grunt: {
				options: {
					reload: true
				},
				files: [ 'Gruntfile.js', 'tsconfig.json' ]
			},
			src: {
				options: {
					atBegin: true
				},
				files: [ '<%= all %>', '<%= staticTestFiles %>' ],
				tasks: [
					'dev'
				]
			}
		},

		mapCoverage: {
			main: {
				dest: 'html-report',
				src: 'coverage.json'
			}
		}
	});

	// Set some Intern-specific options if specified on the command line.
	[ 'suites', 'functionalSuites', 'grep' ].forEach(function (option) {
		var value = grunt.option(option);
		if (value) {
			if (option !== 'grep') {
				value = value.split(',').map(function (string) { return string.trim(); });
			}
			grunt.config('intern.options.' + option, value);
		}
	});

	grunt.registerTask('updateTsconfig', function () {
		var tsconfig = JSON.parse(tsconfigContent);
		tsconfig.files = grunt.file.expand(tsconfig.filesGlob);

		var output = JSON.stringify(tsconfig, null, '\t') + require('os').EOL;
		if (output !== tsconfigContent) {
			grunt.file.write('tsconfig.json', output);
			tsconfigContent = output;
		}
	});

	grunt.registerTask('test', function () {
		var flags = Object.keys(this.flags);

		if (!flags.length) {
			flags.push('client');
		}

		grunt.config.set('intern.options.reporters', [
			{ id: 'tests/support/JsonReporter', filename: 'coverage.json' }
		]);

		grunt.option('force', true);
		grunt.task.run('clean:coverage');
		grunt.task.run('dev');
		flags.forEach(function (flag) {
			grunt.task.run('intern:' + flag);
		});
		grunt.task.run('mapCoverage');
		grunt.task.run('clean:coverage');
	});

	grunt.registerTask('dev', [
		'ts:dev',
		'copy:staticTestFiles',
		'updateTsconfig'
	]);
	grunt.registerTask('dist', [
		'ts:dist',
		'rename:sourceMaps',
		'rewriteSourceMaps',
		'copy:typings',
		'copy:staticFiles',
		'dtsGenerator:dist'
	]);
	grunt.registerTask('test-proxy', [ 'dev', 'intern:proxy' ]);
	grunt.registerTask('ci', [ 'test:client:runner' ]);
	grunt.registerTask('default', [ 'clean', 'dev' ]);
};
