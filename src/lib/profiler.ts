import { Logger, isProduction } from './logger';

type ProfilerHandle = { start: number; name: string };

type ProfileEntry = { ms: number; at: number; samples: number };

const profileStats: Record<string, ProfileEntry> = {};

export function startProfiler(name = 'profile'): ProfilerHandle | null {
	if (isProduction) return null;
	return { start: Date.now(), name };
}

export function stopProfiler(handle: ProfilerHandle | null, name?: string) {
	if (!handle) return;
	const ms = Date.now() - handle.start;
	const finalName = name || handle.name;
	Logger.info(`Profiler(${finalName}): ${ms}ms`);
	const prev = profileStats[finalName];
	profileStats[finalName] = {
		ms,
		at: Date.now(),
		samples: (prev?.samples ?? 0) + 1,
	};
}

export function profileSync<T>(name: string, fn: () => T): T {
	const handle = startProfiler(name);
	try {
		return fn();
	} finally {
		stopProfiler(handle, name);
	}
}

export function getProfilerStats(): Record<string, ProfileEntry> {
	return { ...profileStats };
}
