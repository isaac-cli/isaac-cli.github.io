// ===============================
// BUSCADOR CON SUGERENCIAS Y BÚSQUEDA INTELIGENTE
// ===============================
document.addEventListener("DOMContentLoaded", function () {
  const searchInput = document.getElementById("buscador");
  
  if (!searchInput) {
    console.error("❌ No se encontró el buscador");
    return;
  }

  console.log("✅ Buscador listo. Total productos:", document.querySelectorAll("li").length);

  function normalizarTexto(texto) {
  return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

// Crear contenedor de sugerencias (MEJOR POSICIÓN)
const sugerenciasContainer = document.createElement("div");
sugerenciasContainer.id = "sugerencias";
sugerenciasContainer.style.cssText = `
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;
  border: 1px solid #ddd;
  border-radius: 8px;
  max-height: 250px;
  overflow-y: auto;
  width: 100%;
  z-index: 1030;
  display: none;
  box-shadow: 0 8px 16px rgba(0,0,0,0.15);
  margin-top: 5px;
`;;
  // Insertar el contenedor después del input
  searchInput.parentNode.style.position = "relative";
  searchInput.parentNode.appendChild(sugerenciasContainer);

  

  // Obtener todos los productos
const todosLosProductos = Array.from(document.querySelectorAll("li")).map(li => {

  const textoProducto = normalizarTexto(li.textContent);

  const accordionHeader = li.closest(".accordion-item")
    ?.querySelector(".accordion-button");

  const nombreCategoria = accordionHeader
    ? normalizarTexto(accordionHeader.textContent)
  : "";

  return {
    texto: (nombreCategoria + " " + textoProducto).trim(),
    elemento: li,
    modal: li.closest(".modal")
  };

}).filter(p => p.texto.length > 2);

  console.log("📦 Productos indexados:", todosLosProductos.length);

  

  // Variable para controlar el timeout
  let timeoutId = null;

  // Evento input para sugerencias
  searchInput.addEventListener("input", function () {
    const valor = this.value.trim();
    
    // Limpiar timeout anterior
    if (timeoutId) clearTimeout(timeoutId);
    
    if (valor.length < 2) {
      sugerenciasContainer.style.display = "none";
      return;
    }

    // Esperar un poco antes de mostrar sugerencias
    timeoutId = setTimeout(() => {
      mostrarSugerencias(valor);
    }, 200);
  });

  // Ocultar sugerencias al hacer clic fuera
  document.addEventListener("click", function (e) {
    if (!searchInput.contains(e.target) && !sugerenciasContainer.contains(e.target)) {
      sugerenciasContainer.style.display = "none";
    }
  });

  // Buscar al presionar Enter
  searchInput.addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
      event.preventDefault();
      const texto = this.value.trim();
      if (texto === "") {
        alert("Escribe algo para buscar");
        return;
      }
      buscarProducto(texto);
      sugerenciasContainer.style.display = "none";
    }
  });

  // ===== FUNCIÓN PARA MOSTRAR SUGERENCIAS =====
  function mostrarSugerencias(texto) {
    const textoBuscado = normalizarTexto(texto);
    
    const sugerencias = todosLosProductos
      .filter(p => p.texto.includes(textoBuscado))
      .slice(0, 8); // Máximo 8 sugerencias

    if (sugerencias.length === 0) {
      sugerenciasContainer.style.display = "none";
      return;
    }

    // Generar HTML de sugerencias
    let html = "";
    sugerencias.forEach(sug => {
      // Resaltar el texto coincidente
      const textoOriginal = sug.texto;
      const indice = textoOriginal.toLowerCase().indexOf(textoBuscado);
      let textoResaltado = textoOriginal;
      
      if (indice !== -1) {
        const antes = textoOriginal.substring(0, indice);
        const coincidencia = textoOriginal.substring(indice, indice + texto.length);
        const despues = textoOriginal.substring(indice + texto.length);
        textoResaltado = `${antes}<strong style="background-color: #ffeb3b;">${coincidencia}</strong>${despues}`;
      }
      
      html += `<div class="sugerencia-item" data-producto="${sug.texto}" style="padding: 10px; cursor: pointer; border-bottom: 1px solid #eee;">${textoResaltado}</div>`;
    });

    sugerenciasContainer.innerHTML = html;
    sugerenciasContainer.style.display = "block";

    // Agregar evento click a cada sugerencia
    document.querySelectorAll(".sugerencia-item").forEach(item => {
      item.addEventListener("click", function () {
        const productoTexto = this.dataset.producto;
        searchInput.value = productoTexto;
        buscarProducto(productoTexto);
        sugerenciasContainer.style.display = "none";
      });
    });
  }

  // ===== FUNCIÓN DE BÚSQUEDA =====
function buscarProducto(texto) {

  const textoBuscado = normalizarTexto(texto);

  // 1️⃣ Limpiar resaltados anteriores
  document.querySelectorAll(".product-highlight").forEach(el => {
    el.classList.remove("product-highlight");
  });

  const producto = todosLosProductos.find(p =>
    p.texto.includes(textoBuscado)
  );

  if (!producto) {
    alert(`❌ No se encontró "${texto}"`);
    return;
  }

  const modal = producto.modal;
  const liElemento = producto.elemento;

  if (!modal) return;

  const modalInstance = bootstrap.Modal.getOrCreateInstance(modal);

  // 2️⃣ Mostrar modal si no está abierto
  if (!modal.classList.contains("show")) {
    modalInstance.show();
  }

  // 3️⃣ Esperar un pequeño tiempo fijo (más estable que evento shown)
  setTimeout(() => {

    // Abrir accordion si está cerrado
    const accordionCollapse = liElemento.closest(".accordion-collapse");

    if (accordionCollapse && !accordionCollapse.classList.contains("show")) {
      bootstrap.Collapse.getOrCreateInstance(accordionCollapse).show();
    }

    // 4️⃣ Aplicar highlight correctamente
    liElemento.classList.add("product-highlight");

    // 5️⃣ Scroll
    liElemento.scrollIntoView({
      behavior: "smooth",
      block: "center"
    });

  }, 180); // tiempo suficiente para que el modal termine animación
  }
});

// ===============================
// MAPAS PROFESIONALES (con toggle mejorado)
// ===============================
document.querySelectorAll(".map-toggle").forEach(button => {
  button.addEventListener("click", function() {
    // Buscar el mapa correspondiente (está fuera del card, en un div aparte)
    const targetId = this.getAttribute("data-target");
    if (targetId) {
      const mapa = document.getElementById(targetId);
      if (mapa) {
        mapa.classList.toggle("d-none");
        
        // Cambiar el texto del botón
        if (mapa.classList.contains("d-none")) {
          this.innerHTML = this.innerHTML.replace("Ocultar mapa", "Ver mapa");
        } else {
          this.innerHTML = this.innerHTML.replace("Ver mapa", "Ocultar mapa");
        }
      }
    }
  });
});