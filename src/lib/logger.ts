type Level = 'debug' | 'info' | 'warn' | 'error';

const isProduction = process.env.NODE_ENV === 'production';

export const Logger = {
	debug: (...args: any[]) => {
		if (!isProduction) console.debug('[debug]', ...args);
	},
	info: (...args: any[]) => {
		console.info('[info]', ...args);
	},
	warn: (...args: any[]) => {
		console.warn('[warn]', ...args);
	},
	error: (...args: any[]) => {
		console.error('[error]', ...args);
	},
	withPrefix(prefix: string) {
		return {
			debug: (...args: any[]) => Logger.debug(prefix, ...args),
			info: (...args: any[]) => Logger.info(prefix, ...args),
			warn: (...args: any[]) => Logger.warn(prefix, ...args),
			error: (...args: any[]) => Logger.error(prefix, ...args),
		};
	},
};

export default Logger;


