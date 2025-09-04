// partials.js - Versión para rutas absolutas
const cache = new Map();

// Función para obtener texto desde una URL con caché
async function fetchText(url) {
  // Verifica si el contenido ya está en caché
  if (cache.has(url)) return cache.get(url);
  
  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) throw new Error(`${url} -> ${res.status}`);
  const text = await res.text();
  cache.set(url, text);
  return text;
}

// Ejecuta scripts inline y externos dentro de un contenedor dado
function runInlineScripts(container) {
  const scripts = Array.from(container.querySelectorAll('script'));
  for (const oldScript of scripts) {
    const newScript = document.createElement('script');
    for (const attr of oldScript.attributes) newScript.setAttribute(attr.name, attr.value);
    if (oldScript.src) {
      newScript.src = oldScript.src;
      newScript.async = false;
      document.head.appendChild(newScript);
    } else {
      newScript.textContent = oldScript.textContent;
      document.head.appendChild(newScript);
    }
    oldScript.remove();
  }
}

// Carga un partial en el placeholder especificado
export async function loadPartial(placeholderId, url) {
  const placeholder = document.getElementById(placeholderId);
  if (!placeholder) throw new Error(`Placeholder no encontrado: ${placeholderId}`);
  const html = await fetchText(url);
  const template = document.createElement('template');
  template.innerHTML = html.trim();
  placeholder.innerHTML = '';
  placeholder.appendChild(template.content.cloneNode(true));
  runInlineScripts(placeholder);
  window.dispatchEvent(new CustomEvent('partial:loaded', { detail: { id: placeholderId, url } }));
}
