/**
 * @author rik
 */
// for render server
function passHtmlToPhantomJs() {
  if (window.callPhantom) {
    const html = document.querySelector('html').outerHTML
      .replace(/<\/body>/gi, `<script>window._preRendered = true;</script></body>`);

    window.callPhantom(html);
  } else if (window._onAppReady) {
    window._onAppReady();
  }
}

export default passHtmlToPhantomJs;