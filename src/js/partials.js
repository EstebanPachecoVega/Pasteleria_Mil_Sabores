// partials.js
// Funciones para cargar partials HTML en placeholders del DOM
const cache = new Map();

async function fetchText(url) {
  if (cache.has(url)) return cache.get(url);
  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) throw new Error(`${url} -> ${res.status}`);
  const text = await res.text();
  cache.set(url, text);
  return text;
}

function runInlineScripts(container) {
  const scripts = Array.from(container.querySelectorAll('script'));
  for (const oldScript of scripts) {
    const newScript = document.createElement('script');
    for (const attr of oldScript.attributes) newScript.setAttribute(attr.name, attr.value);
    if (oldScript.src) {
      newScript.src = oldScript.src;
      newScript.async = false; // conserva orden
      document.head.appendChild(newScript);
    } else {
      newScript.textContent = oldScript.textContent;
      document.head.appendChild(newScript);
    }
    oldScript.remove();
  }
}

export async function loadPartial(placeholderId, url) {
  const placeholder = document.getElementById(placeholderId);
  if (!placeholder) throw new Error(`Placeholder no encontrado: ${placeholderId}`);
  const html = await fetchText(url); // url relativa al documento servido (index.html)
  const template = document.createElement('template');
  template.innerHTML = html.trim();
  placeholder.innerHTML = '';
  placeholder.appendChild(template.content.cloneNode(true));
  runInlineScripts(placeholder);
  window.dispatchEvent(new CustomEvent('partial:loaded', { detail: { id: placeholderId, url } }));
}

