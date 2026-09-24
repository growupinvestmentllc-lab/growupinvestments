# Vincular “Mis proyectos” con “Mi portafolio”

## Objetivo
Hacer que cada propiedad cambie automáticamente de sección en “Mi portafolio” según su estado en “Mis proyectos”, respetando el inversor y su porcentaje real.

## Cambios
- Usar el proyecto como fuente principal del estado: En construcción, En alquiler, A la venta o Vendido.
- Combinar esa información con la inversión de cada LLC para que cada inversor vea solamente su participación.
- Evitar duplicados cuando ya exista una ficha manual en el portafolio.
- Ocultar automáticamente una propiedad de “A la venta” cuando su proyecto pase a “Vendido”.
- Mostrar automáticamente los proyectos vendidos en “Vendidas”, con dirección, valor disponible, costo y acceso al proyecto.
- Incluir ahora **35 SW 19th Ct, Cape Coral, FL** en “Vendidas” de **REALSTOMA LLC** y quitarla de “A la venta”.

## Detalles técnicos
- Ajustar la lectura y consolidación en la página de portafolio; no duplicar registros ni mezclar LLC.
- Mantener las fichas manuales existentes como fuente prioritaria para fecha y precio final de venta.
- Cuando falte una ficha manual, usar los valores del proyecto y de la inversión correspondiente.
- Verificar el resultado con una sesión real de inversor y comprobar que no aparezca en dos secciones.
