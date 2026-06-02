// DNA Vendor Page - Google Sheets API Integration
// Reads all products dynamically from Google Sheet
// API Key: AIzaSyDGfNsMn-X_a6KgDmQeN7O7nT5YpqxlR0c

const API_KEY = 'AIzaSyDGfNsMn-X_a6KgDmQeN7O7nT5YpqxlR0c';
const SPREADSHEET_ID = '1087dwmhk12RM-YFRYxKO2VEO2DPIkTRjNbhokm9GDJA'; // DNA Sheet ID
const RANGE = 'DNA!A:F'; // Read all columns
const CORTES_RANGE = 'CORTES_DNA!A:F';

let products = [];
let salesData = [];

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
  loadProductsFromSheets();
  loadSalesFromLocalStorage();
});

// Fetch products from Google Sheets
async function loadProductsFromSheets() {
  try {
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${RANGE}?key=${API_KEY}`;
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.values) {
      // Skip header row and parse products
      // Column mapping: A=Categoria, B=Producto, C=Precio, D=Cantidad, E=Vendidos, F=Venta
      products = data.values.slice(1).map((row, index) => ({
        id: index,
        categoria: row[0] || 'General',
        producto: row[1] || 'Unknown',
        precio: parseInt(row[2]) || 0,
        cantidad: parseInt(row[3]) || 0,
        vendidos: parseInt(row[4]) || 0,
        venta: parseInt(row[5]) || 0
      })).filter(p => p.producto !== 'Unknown' && p.producto.trim() !== '');
      
      renderProductGrid();
      populateCategories();
    }
  } catch (error) {
    console.error('Error loading products:', error);
    alert('Error loading products from Google Sheets');
  }
}

// Populate category filter
function populateCategories() {
  const categories = [...new Set(products.map(p => p.categoria).filter(c => c))];
  const select = document.getElementById('categoryFilter');
  
  // Clear existing options except first
  while (select.options.length > 1) {
    select.remove(1);
  }
  
  categories.forEach(cat => {
    const option = document.createElement('option');
    option.value = cat;
    option.textContent = cat;
    select.appendChild(option);
  });
}

// Render product grid
function renderProductGrid() {
  const grid = document.getElementById('productGrid');
  grid.innerHTML = '';
  
  if (products.length === 0) {
    grid.innerHTML = '<div class="loading">No products found</div>';
    return;
  }
  
  products.forEach(product => {
    const card = document.createElement('div');
    card.className = 'product-card';
    
    const stockClass = product.cantidad <= 0 ? 'out-of-stock' : '';
    
    card.innerHTML = `
      <span class="product-category">${product.categoria}</span>
      <h3>${product.producto}</h3>
      <p class="price">$${product.precio}</p>
      <p class="quantity ${stockClass}">Disponible: ${product.cantidad} unidades</p>
      <button onclick="openSaleModal(${product.id})" ${product.cantidad <= 0 ? 'disabled' : ''}>
        ${product.cantidad <= 0 ? 'Agotado' : 'Ver Detalles'}
      </button>
    `;
    grid.appendChild(card);
  });
  
  updateProductCount();
}

// Update product count
function updateProductCount() {
  document.getElementById('productCount').textContent = `${products.length} productos`;
}

// Search and filter products
function filterProducts() {
  const search = document.getElementById('searchInput').value.toLowerCase();
  const category = document.getElementById('categoryFilter').value;
  
  const filtered = products.filter(p => {
    const matchSearch = p.producto.toLowerCase().includes(search);
    const matchCategory = !category || p.categoria === category;
    return matchSearch && matchCategory;
  });
  
  displayFilteredProducts(filtered);
}

// Display filtered products
function displayFilteredProducts(filtered) {
  const grid = document.getElementById('productGrid');
  grid.innerHTML = '';
  
  if (filtered.length === 0) {
    grid.innerHTML = '<div class="loading">No products found</div>';
    return;
  }
  
  filtered.forEach(product => {
    const card = document.createElement('div');
    card.className = 'product-card';
    
    const stockClass = product.cantidad <= 0 ? 'out-of-stock' : '';
    
    card.innerHTML = `
      <span class="product-category">${product.categoria}</span>
      <h3>${product.producto}</h3>
      <p class="price">$${product.precio}</p>
      <p class="quantity ${stockClass}">Disponible: ${product.cantidad} unidades</p>
      <button onclick="openSaleModal(${product.id})" ${product.cantidad <= 0 ? 'disabled' : ''}>
        ${product.cantidad <= 0 ? 'Agotado' : 'Ver Detalles'}
      </button>
    `;
    grid.appendChild(card);
  });
}

// Open sale recording modal
function openSaleModal(productId) {
  const product = products[productId];
  
  if (product.cantidad <= 0) {
    alert('Este producto está agotado');
    return;
  }
  
  document.getElementById('modalProductName').textContent = product.producto;
  document.getElementById('modalProductCategory').textContent = product.categoria;
  document.getElementById('modalProductPrice').textContent = `$${product.precio}`;
  document.getElementById('modalProductStock').textContent = `${product.cantidad} unidades`;
  document.getElementById('saleQuantity').value = 1;
  document.getElementById('saleQuantity').max = product.cantidad;
  document.getElementById('saleModal').style.display = 'flex';
  document.getElementById('saleModal').dataset.productId = productId;
  
  // Trigger calculation
  document.getElementById('saleQuantity').dispatchEvent(new Event('input'));
}

// Close modal
function closeModal() {
  document.getElementById('saleModal').style.display = 'none';
}

// Record sale
function recordSale() {
  const productId = parseInt(document.getElementById('saleModal').dataset.productId);
  const quantity = parseInt(document.getElementById('saleQuantity').value);
  const product = products[productId];
  
  if (quantity <= 0 || quantity > product.cantidad) {
    alert('Cantidad inválida');
    return;
  }
  
  const totalSale = product.precio * quantity;
  
  const sale = {
    id: Date.now(),
    productId: productId,
    producto: product.producto,
    cantidad: quantity,
    precio: product.precio,
    total: totalSale,
    timestamp: new Date().toISOString(),
    date: new Date().toLocaleDateString('es-ES')
  };
  
  salesData.push(sale);
  saveSalesToLocalStorage();
  
  // Update local product quantity
  product.cantidad -= quantity;
  product.vendidos += quantity;
  product.venta += totalSale;
  
  renderProductGrid();
  updateDailySummary();
  closeModal();
  
  alert(`Venta registrada!\nProducto: ${product.producto}\nCantidad: ${quantity}\nTotal: $${totalSale}`);
}

// Save sales to LocalStorage
function saveSalesToLocalStorage() {
  localStorage.setItem('dna_sales', JSON.stringify(salesData));
}

// Load sales from LocalStorage
function loadSalesFromLocalStorage() {
  const saved = localStorage.getItem('dna_sales');
  if (saved) {
    salesData = JSON.parse(saved);
  }
}

// Update daily summary
function updateDailySummary() {
  const today = new Date().toLocaleDateString('es-ES');
  const todaySales = salesData.filter(sale => sale.date === today);
  
  const totalSale = todaySales.reduce((sum, sale) => sum + sale.total, 0);
  const totalQuantity = todaySales.reduce((sum, sale) => sum + sale.cantidad, 0);
  
  document.getElementById('totalSale').textContent = `$${totalSale.toFixed(2)}`;
  document.getElementById('totalQuantity').textContent = `${totalQuantity} unidades`;
  
  renderSalesTable(todaySales);
}

// Render sales table
function renderSalesTable(sales) {
  const tbody = document.getElementById('salesTableBody');
  tbody.innerHTML = '';
  
  if (sales.length === 0) {
    tbody.innerHTML = '<tr><td colspan="5" class="no-data">No sales recorded yet</td></tr>';
    return;
  }
  
  sales.forEach(sale => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${sale.producto}</td>
      <td>${sale.cantidad}</td>
      <td>$${sale.precio}</td>
      <td>$${sale.total}</td>
      <td><button onclick="deleteSale(${sale.id})" class="delete-btn">Eliminar</button></td>
    `;
    tbody.appendChild(row);
  });
}

// Delete sale
function deleteSale(saleId) {
  if (confirm('¿Estás seguro de que quieres eliminar esta venta?')) {
    salesData = salesData.filter(sale => sale.id !== saleId);
    saveSalesToLocalStorage();
    updateDailySummary();
  }
}

// Export to CSV
function exportToCSV() {
  const today = new Date().toLocaleDateString('es-ES');
  const todaySales = salesData.filter(sale => sale.date === today);
  
  if (todaySales.length === 0) {
    alert('No hay ventas para exportar');
    return;
  }
  
  let csv = 'Producto,Cantidad,Precio Unitario,Total,Hora\n';
  
  todaySales.forEach(sale => {
    csv += `"${sale.producto}",${sale.cantidad},$${sale.precio},$${sale.total},"${sale.timestamp}"\n`;
  });
  
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `DNA_Ventas_${today}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Hacer corte
function hacerCorte() {
  alert('Función de corte en desarrollo');
}

// Ver histórico
function verHistorico() {
  alert('Función de histórico en desarrollo');
}
