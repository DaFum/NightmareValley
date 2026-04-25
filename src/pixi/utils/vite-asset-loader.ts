const images = import.meta.glob('../../assets/spritesheets/**/*.{png,svg}', { eager: true, query: '?url', import: 'default' });
const map: Record<string, string> = {};
for (const key in images) {
  const relPath = key.replace('../../assets/spritesheets/', '');
  map[relPath] = images[key] as string;
}
export default map;
