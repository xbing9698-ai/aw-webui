import { i18n } from '~/i18n';
import moment from 'moment';
import { seconds_to_duration } from './time';
import DOMPurify from 'dompurify';
import _ from 'lodash';
import { IEvent } from './interfaces';

const escapeText = (value: unknown): string => _.escape(value == null ? '' : String(value));

function urlLink(value: unknown): string {
  const text = escapeText(value);
  try {
    const url = new URL(String(value));
    if (['http:', 'https:'].includes(url.protocol)) {
      return `<a href="${escapeText(url.href)}">${text}</a>`;
    }
  } catch {
    // Missing or malformed URLs remain readable as plain text.
  }
  return text;
}

export function buildTooltip(bucket: { type?: string } | null | undefined, e: IEvent): string {
  const label = (key: string) => escapeText(i18n.t(`localization.fields.${key}`));
  let inner = '';
  // A bucket with no type, or an event with no data, must still render a
  // tooltip rather than throwing and taking the whole timeline down.
  const data = (e && e.data) || {};
  const type = String((bucket && bucket.type) || '');

  // if same day, don't show date
  let start: any = moment(e.timestamp);
  let stop: any = moment(e.timestamp).add(e.duration, 'seconds');
  if (start.isSame(stop, 'day')) {
    start = start.format('HH:mm:ss');
    stop = stop.format('HH:mm:ss');
  } else {
    start = start.format('YYYY-MM-DD HH:mm:ss');
    stop = stop.format('YYYY-MM-DD HH:mm:ss');
  }

  if (type == 'currentwindow') {
    inner = `
      <tr><th>${label('app')}</th><td>${escapeText(data.app)}</td></tr>
      <tr><th>${label('title')}</th><td>${escapeText(data.title)}</td></tr>
      `;
  } else if (type == 'web.tab.current') {
    inner = `
      <tr><th>${label('title')}</th><td>${escapeText(data.title)}</td></tr>
      <tr><th>URL</th><td>${urlLink(data.url)}</td></tr>
      `;
  } else if (type.startsWith('app.editor')) {
    inner = `
      <tr><th>${label('filename')}</th><td>${escapeText(
      _.last(String(data.file || '').split('/'))
    )}</td></tr>
      <tr><th>${label('path')}</th><td>${escapeText(data.file)}</td></tr>
      <tr><th>${label('language')}</th><td>${escapeText(data.language)}</td></tr>
      `;
  } else if (type.startsWith('general.stopwatch')) {
    inner = `
      <tr><th>${label('label')}</th><td>${escapeText(data.label)}</td></tr>
      `;
  } else {
    inner = `
      <tr><th>${label('data')}</th><td>${escapeText(JSON.stringify(data))}</td></tr>
      `;
  }
  // Escape text in its insertion context, then sanitize the complete markup.
  return DOMPurify.sanitize(`<table>
    <tr></tr>
    <tr><th>${label('start')}</th><td>${start}</td></tr>
    <tr><th>${label('stop')}</th><td>${stop}</td></tr>
    <tr><th>${label('duration')}</th><td>${seconds_to_duration(e.duration)}</td></tr>
    ${inner}
    </table>`);
}
