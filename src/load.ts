import has from './has';
import Promise from './Promise';

declare var require: Function;
declare var define: any;

export interface Load {
	(module: ModuleObject, ...moduleIds: string[]): Promise<any[]>;
}

export interface ModuleObject {
	id: string;
}

function getBaseId(moduleObject: ModuleObject): string {
	var id: string = moduleObject.id;
	var index: number = id.lastIndexOf('/');

	if (index > -1) {
		id = id.substring(0, index);
	}
	return id;
}

interface HostLoad {
	(moduleIds: string[]): Promise<any[]>;
}

const hostLoad: HostLoad = (function () {
	if (typeof define === 'function' && define.amd) {
		return function (moduleIds: string[]): Promise<any[]> {
			return new Promise(function (resolve) {
				// TODO: Error path
				require(moduleIds, function (...modules: any[]) {
					resolve(modules);
				});
			});
		};
	}
	else if (has('host-node')) {
		return function (moduleIds: string[]): Promise<any[]> {
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
})();

const load: Load = (function () {
	if (!hostLoad) {
		return function () {
			return Promise.reject(new Error('Unknown loader'));
		};
	}
	else {
		return function (module: ModuleObject, ...moduleIds: string[]): Promise<any> {
			var baseId = getBaseId(module);
			moduleIds = moduleIds.map(function (moduleId) {
				if (moduleId[0] === '.') {
					moduleId = baseId + '/' + moduleId.substring(2);
				}
				return moduleId;
			});
			return hostLoad(moduleIds);
		};
	}
})();
export default load;
