import { APP_ICONS, ICON_TYPE, renderIcon } from '@/lib/app-icon';

// rendered once at build time, like the sharing image; any other name is a 404
export const dynamicParams = false;
export const generateStaticParams = () => APP_ICONS.map(({ file }) => ({ file }));

export async function GET(_request: Request, { params }: { params: Promise<{ file: string }> }) {
  const { file } = await params;
  const icon = APP_ICONS.find((i) => i.file === file);
  if (!icon) return new Response(null, { status: 404 });
  return new Response(await renderIcon(icon.size, icon.full), { headers: { 'content-type': ICON_TYPE } });
}
