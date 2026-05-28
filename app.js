// ============================================
// DNA VENDOR PAGE - APP V2
// Corte functionality
// ============================================

const API_URL = "https://script.google.com/macros/s/AKfycbwVlbzY8XiVBDLpJrvNqhwW8D6z_2NycUf5bolyGSJEYf_YBCnLkTD9d_0BBMA8EShu/exec";


let allProductos = [];
let filteredProductos = [];
let currentCorteData = [];

// ============================================
// INIT
// ============================================

document.addEventListener("DOMContentLoaded", function() {
  initEventListeners();
  loadProductos();
  setFechaHoy();
});

function initEventListeners() {
  // Search
  document.getElementById("searchInput").addEventListener("input", filterProductos);
  document.getElementById("categoryFilter").addEventListener("change", filterProductos);

  // Modal
  document.querySelector(".close").addEventListener("click", closeModal);
  document.querySelector(".btn-close").addEventListener("click", closeModal);
  window.addEventListener("click", function(e) {
    const modal = document.getElementById("productModal");
    if (e.target === modal) closeModal();
  });

  // Corte buttons
  document.getElementById("btnMakerCorte").addEventListener("click", showCorteView);
  document.getElementById("btnHistorico").addEventListener("click", showHistoricoView);
  document.getElementById("btnVolver").addEventListener("click", showMainView);
  document.getElementById("btnVolverHistorico").addEventListener("click", showMainView);
  document.getElementById("btnCancelarCorte").addEventListener("click", showMainView);
  document.getElementById("btnGuardarCorte").addEventListener("click", guardarCorte);

  // Corte table input
  document.addEventListener("input", function(e) {
    if (e.target.classList.contains("vendidos-input")) {
      updateCorteTotal();
    }
  });
}

// ============================================
// LOAD PRODUCTOS
// ============================================

function loadProductos() {
  const url = `${API_URL}?action=getProductos`;
  
  fetch(url)
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        allProductos = data.data;
        filteredProductos = [...allProductos];
        
        // Populate category filter
        const categories = [...new Set(allProductos.map(p => p.categoria))];
        const categoryFilter = document.getElementById("categoryFilter");
        categories.forEach(cat => {
          const option = document.createElement("option");
          option.value = cat;
          option.textContent = cat;
          categoryFilter.appendChild(option);
        });
        
        renderProductos();
      } else {
        showError("Error al cargar productos: " + data.error);
      }
    })
    .catch(error => showError("Error de conexión: " + error));
}

// ============================================
// FILTER PRODUCTOS
// ============================================

function filterProductos() {
  const searchTerm = document.getElementById("searchInput").value.toLowerCase();
  const categoryTerm = document.getElementById("categoryFilter").value;
  
  filteredProductos = allProductos.filter(p => {
    const matchSearch = p.producto.toLowerCase().includes(searchTerm);
    const matchCategory = categoryTerm === "" || p.categoria === categoryTerm;
    return matchSearch && matchCategory;
  });
  
  renderProductos();
}

// ============================================
// RENDER PRODUCTOS
// ============================================

function renderProductos() {
  const grid = document.getElementById("productsGrid");
  
  if (filteredProductos.length === 0) {
    grid.innerHTML = '<div class="no-results">No se encontraron productos</div>';
    document.getElementById("productCount").textContent = "0 productos";
    return;
  }
  
  grid.innerHTML = filteredProductos.map((p, idx) => `
    <div class="product-card" onclick="openModal(${idx})">
      <div class="product-header">
        <h3>${p.producto}</h3>
        <span class="category-badge">${p.categoria}</span>
      </div>
      <div class="product-info">
        <div class="info-row">
          <span class="label">Precio:</span>
          <span class="value">$${p.precio}</span>
        </div>
        <div class="info-row">
          <span class="label">Disponible:</span>
          <span class="value">${p.cantidad} unidades</span>
        </div>
      </div>
      <div class="product-footer">
        <button class="btn-view">Ver Detalles</button>
      </div>
    </div>
  `).join("");
  
  document.getElementById("productCount").textContent = `${filteredProductos.length} productos`;
}

// ============================================
// MODAL
// ============================================

function openModal(idx) {
  const p = filteredProductos[idx];
  document.getElementById("modalProductName").textContent = p.producto;
  document.getElementById("modalCategory").textContent = p.categoria;
  document.getElementById("modalPrice").textContent = `$${p.precio}`;
  document.getElementById("modalQuantity").textContent = `${p.cantidad} unidades`;
  
  document.getElementById("productModal").style.display = "block";
}

function closeModal() {
  document.getElementById("productModal").style.display = "none";
}

// ============================================
// CORTE VIEW
// ============================================

function showCorteView() {
  document.getElementById("mainView").style.display = "none";
  document.getElementById("corteView").style.display = "block";
  document.getElementById("historicoView").style.display = "none";
  
  renderCorteTable();
}

function showMainView() {
  document.getElementById("mainView").style.display = "block";
  document.getElementById("corteView").style.display = "none";
  document.getElementById("historicoView").style.display = "none";
}

function showHistoricoView() {
  document.getElementById("mainView").style.display = "none";
  document.getElementById("corteView").style.display = "none";
  document.getElementById("historicoView").style.display = "block";
  
  loadHistorico();
}

// ============================================
// CORTE TABLE
// ============================================

function renderCorteTable() {
  const tbody = document.getElementById("cortesTableBody");
  
  tbody.innerHTML = allProductos.map((p, idx) => `
    <tr>
      <td>${p.producto}</td>
      <td>$${p.precio}</td>
      <td>
        <input 
          type="number" 
          class="vendidos-input" 
          value="0" 
          min="0"
          data-idx="${idx}"
          data-precio="${p.precio}"
        >
      </td>
      <td class="total-cell">$0</td>
    </tr>
  `).join("");
}

function updateCorteTotal() {
  let totalGeneral = 0;
  
  document.querySelectorAll(".vendidos-input").forEach(input => {
    const vendidos = parseInt(input.value) || 0;
    const precio = parseFloat(input.dataset.precio);
    const total = vendidos * precio;
    
    const totalCell = input.parentElement.parentElement.querySelector(".total-cell");
    totalCell.textContent = `$${total}`;
    
    totalGeneral += total;
  });
  
  document.getElementById("totalGeneral").textContent = `$${totalGeneral}`;
}

// ============================================
// GUARDAR CORTE
// ============================================

function guardarCorte() {
  const fecha = document.getElementById("fechaCorte").value;
  
  if (!fecha) {
    showError("Por favor selecciona una fecha");
    return;
  }
  
  // Collect data
  const productos = [];
  document.querySelectorAll(".vendidos-input").forEach((input, idx) => {
    const vendidos = parseInt(input.value) || 0;
    
    if (vendidos > 0) {
      productos.push({
        producto: allProductos[idx].producto,
        precio: allProductos[idx].precio,
        vendidos: vendidos
      });
    }
  });
  
  if (productos.length === 0) {
    showError("Debes registrar al menos un producto vendido");
    return;
  }
  
  // Save
  const data = {
    action: "saveCorte",
    fecha: fecha,
    productos: productos
  };
  
  fetch(API_URL, {
    method: "POST",
    body: JSON.stringify(data)
  })
    .then(response => response.json())
    .then(result => {
      if (result.success) {
        showError("✅ Corte guardado exitosamente. Total: $" + result.totalGeneral, "success");
        setTimeout(() => {
          showMainView();
          resetCorteForm();
        }, 2000);
      } else {
        showError("Error al guardar: " + result.error);
      }
    })
    .catch(error => showError("Error: " + error));
}

function resetCorteForm() {
  document.getElementById("fechaCorte").value = "";
  document.querySelectorAll(".vendidos-input").forEach(input => input.value = "0");
  updateCorteTotal();
  setFechaHoy();
}

// ============================================
// HISTORICO
// ============================================

function loadHistorico() {
  const url = `${API_URL}?action=getCortes`;
  
  fetch(url)
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        renderHistorico(data.data);
      } else {
        showError("Error al cargar histórico: " + data.error);
      }
    })
    .catch(error => showError("Error: " + error));
}

function renderHistorico(cortes) {
  const list = document.getElementById("historicoList");
  
  if (cortes.length === 0) {
    list.innerHTML = '<div class="no-results">No hay cortes registrados</div>';
    return;
  }
  
  list.innerHTML = cortes.map(corte => `
    <div class="corte-card">
      <div class="corte-card-header">
        <h3>📅 ${corte.fecha}</h3>
        <span class="corte-total">Total: <strong>$${corte.total}</strong></span>
      </div>
      <div class="corte-card-body">
        <table class="mini-table">
          <thead>
            <tr>
              <th>Producto</th>
              <th>Precio</th>
              <th>Vendidos</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            ${corte.productos.map(p => `
              <tr>
                <td>${p.producto}</td>
                <td>$${p.precio}</td>
                <td>${p.vendidos}</td>
                <td>$${p.total}</td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      </div>
    </div>
  `).join("");
}

// ============================================
// HELPERS
// ============================================

function setFechaHoy() {
  const today = new Date().toISOString().split('T')[0];
  document.getElementById("fechaCorte").value = today;
}

function showError(msg, type = "error") {
  const errorDiv = document.getElementById("errorMessage");
  errorDiv.textContent = msg;
  errorDiv.style.display = "block";
  errorDiv.style.background = type === "success" ? "#4caf50" : "#ff6b6b";
  
  setTimeout(() => {
    errorDiv.style.display = "none";
  }, 4000);
}
