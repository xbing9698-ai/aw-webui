/** Display labels only: never use translated names as stored IDs or query values. */
export type Translate = (key: string, params?: Record<string, unknown>) => string;

const BUILTIN_VIEWS: Record<string, string> = {
  summary: 'Summary',
  window: 'Window',
  browser: 'Browser',
  editor: 'Editor',
};

export function viewDisplayName(view: { id: string; name: string }, translate: Translate): string {
  return BUILTIN_VIEWS[view.id] === view.name
    ? translate(`localization.views.${view.id}`)
    : view.name || view.id;
}

export function categoryDisplayName(path: string[], translate: Translate): string {
  // This reserved category is also used by queries; leave all other paths intact.
  return path.length === 1 && path[0] === 'Uncategorized'
    ? translate('common.uncategorized')
    : path.join(' > ');
}
