import { Logger, isProduction } from './logger';

type ProfilerHandle = { start: number; name: string };

export function startProfiler(name = 'profile'): ProfilerHandle | null {
	if (isProduction) return null;
	return { start: Date.now(), name };
}

export function stopProfiler(handle: ProfilerHandle | null, name?: string) {
	if (!handle) return;
	const ms = Date.now() - handle.start;
	const finalName = name || handle.name;
	Logger.info(`Profiler(${finalName}): ${ms}ms`);
}


