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
  const todosLosProductos = Array.from(document.querySelectorAll("li")).map(li => ({
    texto: li.textContent.trim(),
    elemento: li,
    modal: li.closest(".modal")
  })).filter(p => p.texto.length > 2);

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
    const textoBuscado = texto.toLowerCase();
    
    const sugerencias = todosLosProductos
      .filter(p => p.texto.toLowerCase().includes(textoBuscado))
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
    console.log("🔍 Buscando:", texto);
    
    const textoBuscado = texto.toLowerCase().trim();
    
    // Limpiar resaltados anteriores
    document.querySelectorAll(".product-highlight").forEach(el => {
      el.classList.remove("product-highlight");
    });

    // Encontrar TODOS los productos que coinciden
    const productosEncontrados = todosLosProductos.filter(p => 
      p.texto.toLowerCase().includes(textoBuscado)
    );

    if (productosEncontrados.length === 0) {
      alert(`❌ No se encontró "${texto}"`);
      return;
    }

    console.log(`✅ Encontrados: ${productosEncontrados.length} productos`);

    // Agrupar por modal
    const modalesMap = new Map();
    productosEncontrados.forEach(p => {
      const modal = p.modal;
      if (modal) {
        if (!modalesMap.has(modal)) {
          modalesMap.set(modal, []);
        }
        modalesMap.get(modal).push(p.elemento);
      }
    });

    console.log(`📦 Modales involucrados: ${modalesMap.size}`);

    // Si hay múltiples modales, mostrar mensaje
    if (modalesMap.size > 1) {
      const nombresModales = Array.from(modalesMap.keys()).map(modal => {
        return modal.querySelector(".modal-title")?.textContent || "Modal";
      });
      console.log("Múltiples modales:", nombresModales);
    }

    // Tomar el primer modal
    const primerModal = Array.from(modalesMap.keys())[0];
    const productosEnEsteModal = modalesMap.get(primerModal);

    // Abrir el modal
    const modalInstance = new bootstrap.Modal(primerModal);
    modalInstance.show();

    // Resaltar cuando el modal esté visible
    primerModal.addEventListener("shown.bs.modal", function () {
      // Resaltar TODOS los productos encontrados
      productosEnEsteModal.forEach(li => {
        li.classList.add("product-highlight");
      });
      
      // Hacer scroll al primer producto
      productosEnEsteModal[0].scrollIntoView({ 
        behavior: "smooth", 
        block: "center" 
      });
      
    }, { once: true });
  }
});