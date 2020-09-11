import './styles/style.scss';
import './iframe.scss';

window.addEventListener('load', () => {
  const iframe = document.createElement('iframe');
  const search = window.location.search.substring(1);
  const params = new URLSearchParams(search);
  iframe.setAttribute('src', `./index.html?${search}`);
  iframe.setAttribute('class', 'st-parent-frame');
  iframe.setAttribute('id', 'st-parent-frame');
  iframe.setAttribute('name', params.get('iframeName') || 'st-parent-frame');
  iframe.setAttribute('style', 'position: absolute;width: 100%;height: 100%;left: 0;top: 0;border: none;');
  document.getElementsByTagName('body')[0].appendChild(iframe);
});
