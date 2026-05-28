// ============================================
// DNA VENDOR PAGE - FRONTEND
// ============================================

// CONFIGURATION
const API_URL = "https://script.google.com/macros/s/YOUR_SCRIPT_ID_HERE/exec";

// STATE
let allProductos = [];
let filteredProductos = [];

// ============================================
// INITIALIZATION
// ============================================

document.addEventListener("DOMContentLoaded", function() {
  cargarProductos();
  setupEventListeners();
});

// ============================================
// SETUP EVENT LISTENERS
// ============================================

function setupEventListeners() {
  // Search input
  document.getElementById("searchInput").addEventListener("input", filtrarProductos);
  
  // Category filter
  document.getElementById("categoryFilter").addEventListener("change", filtrarProductos);
  
  // Modal close button
  document.querySelector(".close").addEventListener("click", cerrarModal);
  
  // Click outside modal
  window.addEventListener("click", function(event) {
    const modal = document.getElementById("productModal");
    if (event.target === modal) {
      cerrarModal();
    }
  });
}

// ============================================
// CARGAR PRODUCTOS
// ============================================

async function cargarProductos() {
  try {
    const response = await fetch(API_URL, {
      method: "POST",
      body: JSON.stringify({ action: "getProductos" })
    });

    const result = await response.json();

    if (result.success) {
      allProductos = result.data;
      filteredProductos = [...allProductos];
      
      // Llenar categorías
      llenarCategorias();
      
      // Mostrar productos
      mostrarProductos();
    } else {
      mostrarError("Error: " + result.error);
    }
  } catch (error) {
    mostrarError("Error de conexión: " + error.toString());
  }
}

// ============================================
// LLENAR CATEGORÍAS EN SELECT
// ============================================

function llenarCategorias() {
  const categorias = [...new Set(allProductos.map(p => p.categoria))];
  const select = document.getElementById("categoryFilter");
  
  categorias.forEach(cat => {
    const option = document.createElement("option");
    option.value = cat;
    option.textContent = cat;
    select.appendChild(option);
  });
}

// ============================================
// FILTRAR PRODUCTOS
// ============================================

function filtrarProductos() {
  const searchTerm = document.getElementById("searchInput").value.toLowerCase();
  const categoryFilter = document.getElementById("categoryFilter").value;

  filteredProductos = allProductos.filter(p => {
    const matchSearch = p.nombre.toLowerCase().includes(searchTerm);
    const matchCategory = !categoryFilter || p.categoria === categoryFilter;
    return matchSearch && matchCategory;
  });

  mostrarProductos();
}

// ============================================
// MOSTRAR PRODUCTOS
// ============================================

function mostrarProductos() {
  const container = document.getElementById("productsList");
  
  // Update count
  document.getElementById("productCount").textContent = 
    `${filteredProductos.length} producto${filteredProductos.length !== 1 ? 's' : ''}`;

  if (filteredProductos.length === 0) {
    container.innerHTML = '<div class="no-results">No se encontraron productos</div>';
    return;
  }

  container.innerHTML = filteredProductos.map(p => `
    <div class="product-card" onclick="abrirModal('${p.nombre}', ${p.precio}, ${p.cantidad}, '${p.categoria}')">
      <div class="product-header">
        <h3>${p.nombre}</h3>
        <span class="category-badge">${p.categoria}</span>
      </div>
      
      <div class="product-info">
        <div class="info-row">
          <span class="label">Precio:</span>
          <span class="value">$${p.precio.toFixed(2)}</span>
        </div>
        <div class="info-row">
          <span class="label">Cantidad:</span>
          <span class="value">${p.cantidad} unidades</span>
        </div>
      </div>
      
      <div class="product-footer">
        <button class="btn-view">Ver detalles →</button>
      </div>
    </div>
  `).join("");
}

// ============================================
// ABRIR MODAL
// ============================================

function abrirModal(nombre, precio, cantidad, categoria) {
  const modal = document.getElementById("productModal");
  const modalBody = document.getElementById("modalBody");

  modalBody.innerHTML = `
    <div class="modal-header">
      <h2>${nombre}</h2>
    </div>
    
    <div class="modal-body">
      <div class="detail-row">
        <span class="detail-label">Categoría:</span>
        <span class="detail-value">${categoria}</span>
      </div>
      
      <div class="detail-row">
        <span class="detail-label">Precio:</span>
        <span class="detail-value price">$${precio.toFixed(2)}</span>
      </div>
      
      <div class="detail-row">
        <span class="detail-label">Cantidad disponible:</span>
        <span class="detail-value quantity">${cantidad} unidades</span>
      </div>
    </div>
    
    <div class="modal-footer">
      <button class="btn-close" onclick="cerrarModal()">Cerrar</button>
    </div>
  `;

  modal.style.display = "block";
}

// ============================================
// CERRAR MODAL
// ============================================

function cerrarModal() {
  document.getElementById("productModal").style.display = "none";
}

// ============================================
// MOSTRAR ERROR
// ============================================

function mostrarError(mensaje) {
  const errorDiv = document.getElementById("errorMessage");
  errorDiv.textContent = mensaje;
  errorDiv.style.display = "block";
  
  setTimeout(() => {
    errorDiv.style.display = "none";
  }, 5000);
}
