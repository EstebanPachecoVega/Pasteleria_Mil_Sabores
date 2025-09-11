// partials.js - Versión optimizada con caché y gestión mejorada de scripts
const cache = new Map();
const loadedScripts = new Set();

// Función para obtener texto desde una URL con caché
async function fetchText(url) {
  // Verifica si el contenido ya está en caché
  if (cache.has(url)) return cache.get(url);
  
  try {
    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) throw new Error(`${url} -> ${res.status}`);
    const text = await res.text();
    cache.set(url, text);
    return text;
  } catch (error) {
    console.error(`Error fetching ${url}:`, error);
    throw error;
  }
}

// Ejecuta scripts inline y externos dentro de un contenedor dado
function runInlineScripts(container) {
  const scripts = Array.from(container.querySelectorAll('script'));
  
  for (const oldScript of scripts) {
    // Evitar ejecutar scripts ya cargados
    if (oldScript.src && loadedScripts.has(oldScript.src)) {
      oldScript.remove();
      continue;
    }
    
    const newScript = document.createElement('script');
    for (const attr of oldScript.attributes) {
      newScript.setAttribute(attr.name, attr.value);
    }
    
    if (oldScript.src) {
      // Script externo
      newScript.onload = () => {
        loadedScripts.add(oldScript.src);
        oldScript.remove();
      };
      newScript.onerror = () => {
        console.error(`Failed to load script: ${oldScript.src}`);
        oldScript.remove();
      };
      document.head.appendChild(newScript);
    } else {
      // Script inline
      try {
        newScript.textContent = oldScript.textContent;
        document.head.appendChild(newScript);
        oldScript.remove();
      } catch (e) {
        console.error('Error executing inline script:', e);
      }
    }
  }
}

// Carga un partial en el placeholder especificado
export async function loadPartial(placeholderId, url) {
  try {
    const placeholder = document.getElementById(placeholderId);
    if (!placeholder) {
      console.warn(`Placeholder no encontrado: ${placeholderId}`);
      return;
    }
    
    const html = await fetchText(url);
    const template = document.createElement('template');
    template.innerHTML = html.trim();
    
    placeholder.innerHTML = '';
    placeholder.appendChild(template.content.cloneNode(true));
    
    runInlineScripts(placeholder);
    
    window.dispatchEvent(new CustomEvent('partial:loaded', { 
      detail: { id: placeholderId, url } 
    }));
    
    return true;
  } catch (error) {
    console.error(`Error loading partial ${url}:`, error);
    return false;
  }
}

// Función para precargar partials
export function preloadPartials(partials) {
  return Promise.all(
    Object.entries(partials).map(([id, url]) => 
      fetchText(url).then(html => ({ id, url, html }))
    )
  );
}