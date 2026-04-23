import { Logger } from './logger';

type ProfilerHandle = { start: number; name: string };

export function startProfiler(name = 'profile'): ProfilerHandle | null {
	const isProd = process.env.NODE_ENV === 'production' || (typeof process !== 'undefined' && process.env.PROD === 'true');
	if (isProd) return null;
	return { start: Date.now(), name };
}

export function stopProfiler(handle: ProfilerHandle | null, name?: string) {
	if (!handle) return;
	const ms = Date.now() - handle.start;
	const finalName = handle.name || name || 'profile';
	Logger.info(`Profiler(${finalName}): ${ms}ms`);
}


