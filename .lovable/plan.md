# Organizar Mis Ventas por año

## Objetivo
Ordenar el registro de ventas de Hunter para que sea más fácil revisar cada período.

## Cambios
- Agregar un selector visible de años, comenzando con 2026 y 2027.
- Mostrar dentro del año seleccionado las tres categorías actuales: construcción, terminadas y RBI.
- Calcular los totales superiores usando únicamente las ventas del año elegido.
- Mantener disponibles automáticamente otros años cuando existan ventas con esas fechas.
- Conservar las tablas, importes y datos actuales sin modificar registros.

## Detalles técnicos
- Agrupar las ventas por el año de `sale_date`.
- Mantener las ventas sin fecha en una sección separada cuando existan.
- Usar los controles y colores existentes para conservar el diseño actual.
