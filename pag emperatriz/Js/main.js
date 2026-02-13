// ===============================
// 1️⃣ CUANDO EL DOM YA CARGÓ
// ===============================
document.addEventListener("DOMContentLoaded", function () {

  AOS.init({ once: true });

  const searchInput = document.getElementById("buscador");
  if (!searchInput) return;

  const productos = obtenerProductos();
  let ultimoValor = "";

  // AUTOCOMPLETADO MEJORADO
  searchInput.addEventListener("input", function () {
    const valorActual = this.value;
    const normalizado = normalizarTexto(valorActual);

    // Si está borrando o el texto es muy corto, no autocompletar
    if (valorActual.length < ultimoValor.length || normalizado.length < 2) {
      ultimoValor = valorActual;
      return;
    }

    // Buscar coincidencia que empiece exactamente con lo escrito
    const coincidencias = productos.filter(p =>
      normalizarTexto(p).startsWith(normalizado)
    );

    // Solo autocompletar si hay UNA coincidencia exacta y es más larga que lo escrito
    if (coincidencias.length === 1 && coincidencias[0].length > valorActual.length) {
      const sugerencia = coincidencias[0];
      this.value = sugerencia;
      this.setSelectionRange(valorActual.length, sugerencia.length);
    }

    ultimoValor = this.value;
  });

  // BUSCAR AL PRESIONAR ENTER
  searchInput.addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
      event.preventDefault();
      buscarProducto();
    }
  });

  // Cerrar menú móvil al hacer clic en un enlace
  document.querySelectorAll(".navbar-nav .nav-link").forEach(link => {
    link.addEventListener("click", () => {
      const menu = document.querySelector(".navbar-collapse");
      if (menu.classList.contains("show")) {
        new bootstrap.Collapse(menu).hide();
      }
    });
  });

});

// ===============================
// 2️⃣ FUNCIÓN DE BÚSQUEDA MEJORADA
// ===============================
function buscarProducto() {
  const input = document.getElementById("buscador");
  if (!input) return;

  const textoBuscado = normalizarTexto(input.value);
  if (!textoBuscado) return;

  // Limpiar resaltados previos en TODOS los modales
  document.querySelectorAll(".product-highlight").forEach(el => {
    el.classList.remove("product-highlight");
  });

  // Buscar en TODOS los elementos que puedan contener productos
  const elementosBuscables = document.querySelectorAll(
    "li, .card h3, .card p, .modal-body li, .modal-body p"
  );

  let elementoEncontrado = null;
  let modalObjetivo = null;

  for (let el of elementosBuscables) {
    if (normalizarTexto(el.textContent).includes(textoBuscado)) {
      elementoEncontrado = el;
      modalObjetivo = el.closest(".modal");
      break;
    }
  }

  if (!elementoEncontrado || !modalObjetivo) {
    alert("Producto no encontrado 😕");
    return;
  }

  // Abrir el modal
  const modalInstance = new bootstrap.Modal(modalObjetivo);
  modalInstance.show();

  // Resaltar y hacer scroll cuando el modal esté visible
  modalObjetivo.addEventListener("shown.bs.modal", () => {
    elementoEncontrado.classList.add("product-highlight");
    elementoEncontrado.scrollIntoView({
      behavior: "smooth",
      block: "center"
    });
  }, { once: true });

  // Opcional: Limpiar input después de buscar
  // input.value = "";
}

// ===============================
// 3️⃣ UTILIDADES
// ===============================
function normalizarTexto(texto) {
  return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function obtenerProductos() {
  // Extraer nombres de productos de todos los <li> para autocompletado
  return Array.from(document.querySelectorAll("li"))
    .map(li => li.textContent.trim())
    .filter(txt => txt.length > 2);
}

// ===============================
// 4️⃣ TOGGLE SIMPLE PARA MAPAS (sin Bootstrap)
// ===============================
document.querySelectorAll(".map-toggle").forEach((btn, index) => {
  btn.addEventListener("click", () => {
    const mapas = document.querySelectorAll(".map-content");
    if (mapas[index]) {
      mapas[index].classList.toggle("d-none");
    }
  });
});

// ===============================
// 5️⃣ TOGGLE PARA PRODUCTOS (si los usas, sino eliminar)
// ===============================
document.querySelectorAll(".product-toggle").forEach((btn, index) => {
  btn.addEventListener("click", () => {
    const contenidos = document.querySelectorAll(".product-content");
    if (contenidos[index]) {
      contenidos[index].classList.toggle("d-none");
    }
  });
});