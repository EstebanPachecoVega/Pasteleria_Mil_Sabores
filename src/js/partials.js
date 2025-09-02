async function loadPartial(id, url) {
    try {
      const res = await fetch(url);
      const content = await res.text();
      document.getElementById(id).innerHTML = content;
    } catch (error) {
      console.error("Error cargando partial:", url, error);
    }
}
  
  loadPartial("header", "partials/header.html");
  loadPartial("navbar", "partials/navbar.html");
  loadPartial("footer", "partials/footer.html");