export async function enterFullscreen(el: HTMLElement) {
  if (el.requestFullscreen) await el.requestFullscreen();
  else if ((el as HTMLElement & { webkitRequestFullscreen?: () => void }).webkitRequestFullscreen) {
    (el as HTMLElement & { webkitRequestFullscreen: () => void }).webkitRequestFullscreen();
  }
}

export async function exitFullscreen() {
  if (document.fullscreenElement) await document.exitFullscreen();
}

export function isFullscreen() {
  return Boolean(document.fullscreenElement);
}
