# DNA - Página de Inventario

Página de visualización de productos para el vendedor DNA.

## 📁 Archivos

- `index.html` - Interfaz de usuario
- `app.js` - Lógica de la aplicación
- `styles.css` - Estilos CSS
- `backend.gs` - Google Apps Script backend

## 🚀 Instalación

### Paso 1: Crear Google Apps Script

1. Ve a [script.google.com](https://script.google.com)
2. Crea un nuevo proyecto: `DNA_Vendor_Backend`
3. Copia TODO el contenido de `backend.gs`
4. Pégalo en el editor
5. Guarda (Ctrl+S)
6. Haz clic en **Desplegar → Nueva implementación**
7. Tipo: **Aplicación web**
8. Ejecutar como: **Tu cuenta**
9. Acceso: **Cualquiera**
10. Copia la URL que aparece

### Paso 2: Configurar frontend

1. Abre `app.js`
2. Busca la línea 5:
   ```javascript
   const API_URL = "https://script.google.com/macros/s/YOUR_SCRIPT_ID_HERE/exec";
   ```
3. Reemplaza `YOUR_SCRIPT_ID_HERE` con tu URL del paso anterior
4. Guarda

### Paso 3: Usar

1. Abre `index.html` en el navegador
2. ¡Listo!

## ✨ Características

- ✅ Búsqueda por nombre de producto
- ✅ Filtro por categoría
- ✅ Modal con detalles del producto
- ✅ Responsive (móvil)
- ✅ Interfaz moderna y limpia

## 📊 Estructura de Google Sheet

El backend lee de la hoja **DNA** con esta estructura:

| Columna | Nombre | Tipo |
|---------|--------|------|
| A | Categoría | Texto |
| B | Producto | Texto |
| C | Precio | Número |
| D | Cantidad | Número |

## 🔗 Link para compartir

Comparte este link con DNA:

```
file:///ruta/a/tu/carpeta/DNA_Vendor_Page/index.html
```

O sube a un servidor web y comparte la URL.

## 🆘 Solución de problemas

### "No se cargan los productos"
- Verifica que el Google Apps Script esté desplegado
- Comprueba que la URL en `app.js` sea correcta
- Abre la consola (F12) para ver errores

### "Error de conexión"
- Verifica tu conexión a internet
- Comprueba que el Google Sheet tenga datos en la hoja DNA

---

**DNA Vendor Page © 2026**
