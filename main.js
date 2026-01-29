// ===============================
// 1️⃣ CUANDO EL DOM YA CARGÓ
// ===============================
document.addEventListener("DOMContentLoaded", function () {

  AOS.init({ once: true });

  const searchInput = document.getElementById("buscador");
  if (!searchInput) return;

  const productos = obtenerProductos();
  let ultimoValor = "";

  // AUTOCOMPLETADO SIMPLE (sin barras feas)
  searchInput.addEventListener("input", function () {
    const valorActual = this.value;
    const normalizado = normalizarTexto(valorActual);

    // Si está borrando, no autocompletar
    if (valorActual.length < ultimoValor.length) {
      ultimoValor = valorActual;
      return;
    }

    if (normalizado.length < 2) {
      ultimoValor = valorActual;
      return;
    }

    const coincidencia = productos.find(p =>
      normalizarTexto(p).startsWith(normalizado)
    );

    if (!coincidencia) {
      ultimoValor = valorActual;
      return;
    }

    this.value = coincidencia;
    this.setSelectionRange(valorActual.length, coincidencia.length);
    ultimoValor = this.value;
  });

  // BUSCAR AL PRESIONAR ENTER
  searchInput.addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
      event.preventDefault();
      buscarProducto();
    }
  });

});


// ===============================
// 2️⃣ FUNCIÓN DE BÚSQUEDA REAL
// ===============================
function buscarProducto() {
  const input = document.getElementById("buscador");
  if (!input) return;

  const textoBuscado = normalizarTexto(input.value);
  if (!textoBuscado) return;

  // Limpiar resaltados previos
  document.querySelectorAll(".product-highlight").forEach(el => {
    el.classList.remove("product-highlight");
  });

  const productos = document.querySelectorAll("li");

  let productoEncontrado = null;
  let modalObjetivo = null;

  for (let li of productos) {
    if (normalizarTexto(li.textContent).includes(textoBuscado)) {
      productoEncontrado = li;
      modalObjetivo = li.closest(".modal");
      break;
    }
  }

  if (!productoEncontrado || !modalObjetivo) {
    alert("Producto no encontrado 😕");
    return;
  }

  // Abrir SOLO el modal
  const modalInstance = new bootstrap.Modal(modalObjetivo);
  modalInstance.show();

  // Resaltar producto cuando el modal ya esté visible
  modalObjetivo.addEventListener("shown.bs.modal", () => {

    productoEncontrado.classList.add("product-highlight");

    productoEncontrado.scrollIntoView({
      behavior: "smooth",
      block: "center"
    });

  }, { once: true });
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
  return Array.from(document.querySelectorAll("li"))
    .map(li => li.textContent.trim())
    .filter(txt => txt.length > 2);
}

document.querySelectorAll(".accordion-button").forEach(button => {
  button.addEventListener("click", function () {
    const targetId = this.getAttribute("data-bs-target");
    const target = document.querySelector(targetId);

    // Si ya está abierto → cerrarlo
    if (target.classList.contains("show")) {
      bootstrap.Collapse.getInstance(target)?.hide();
      return;
    }

    // Cerrar otros acordeones del mismo grupo
    const accordion = this.closest(".accordion");
    accordion.querySelectorAll(".accordion-collapse.show").forEach(open => {
      bootstrap.Collapse.getInstance(open)?.hide();
    });
  });
});

document.querySelectorAll("#accordionUbicaciones .accordion-button")
  .forEach(button => {
    button.addEventListener("click", function () {

      const targetId = this.getAttribute("data-bs-target");
      const target = document.querySelector(targetId);
      if (!target) return;

      const instancia = bootstrap.Collapse.getOrCreateInstance(target);

      // Toggle real: abrir o cerrar según estado
      if (target.classList.contains("show")) {
        instancia.hide();
      } else {
        instancia.show();
      }
    });
});

