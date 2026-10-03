import codeGs from '../../google-apps-script/Code.gs?raw';

export const APPS_SCRIPT_CODE: string = codeGs;

export function downloadAppsScriptFile(): void {
  const blob = new Blob([APPS_SCRIPT_CODE], { type: 'text/javascript;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', 'Code.gs');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
