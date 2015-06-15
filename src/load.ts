import has from './has';
import Promise from './Promise';

declare var define: {
	(...args: any[]): any;
	amd: any;
};

export interface Load {
	(require: Require, ...moduleIds: string[]): Promise<any[]>;
}

export interface Require {
	(moduleIds: string[], callback: (...modules:any[]) => void): void;
	(moduleId: string): any;
}

const load: Load = (function (): Load {
	if (typeof define === 'function' && define.amd) {
		return function (require: Require, ...moduleIds: string[]): Promise<any[]> {
			return new Promise(function (resolve) {
				// TODO: Error path
				require(moduleIds, function (...modules: any[]) {
					resolve(modules);
				});
			});
		};
	}
	else if (has('host-node')) {
		return function (require: Require, ...moduleIds: string[]): Promise<any[]> {
			return new Promise(function (resolve, reject) {
				try {
					resolve(moduleIds.map(function (moduleId): any {
						return require(moduleId);
					}));
				}
				catch (error) {
					reject(error);
				}
			});
		};
	}
	else {
		return <any> function () {
			return Promise.reject(new Error('Unknown loader'));
		};
	}
})();
export default load;
