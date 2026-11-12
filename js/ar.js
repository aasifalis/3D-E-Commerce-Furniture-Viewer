import { trackEvent } from './tracking.js';
import { isIOS } from './utils.js';

/**
 * Logs an `ar_opened` event whenever the shopper launches AR from <model-viewer>.
 *
 * - WebXR (Android Chrome): model-viewer fires `ar-status` with
 *   status "session-started" once the camera session is running.
 * - Quick Look (iPhone) and Scene Viewer (Android without WebXR) open outside
 *   the page, so model-viewer never sends "session-started" for them. For those
 *   we log when the AR button is tapped instead.
 */
export function initARTracking(modelViewer, { productId, getColour }) {
  let awaitingWebXR = false;

  const log = () => {
    awaitingWebXR = false;
    trackEvent('ar_opened', { productId, colour: getColour() });
  };

  modelViewer.addEventListener('ar-status', (event) => {
    const { status } = event.detail;
    if (status === 'session-started') log();
    if (status === 'failed') awaitingWebXR = false;
  });

  const arButton = modelViewer.querySelector('[slot="ar-button"]');
  arButton?.addEventListener('click', () => {
    if (isIOS() || !('xr' in navigator)) {
      log(); // Quick Look or Scene Viewer
      return;
    }
    // WebXR is attempted first; if the browser hands over to Scene Viewer
    // instead, the page is hidden without a "session-started" event.
    awaitingWebXR = true;
    setTimeout(() => { awaitingWebXR = false; }, 5000);
  });

  document.addEventListener('visibilitychange', () => {
    if (document.hidden && awaitingWebXR) log();
  });
}
