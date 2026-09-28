# Vincular cálculos de alquileres entre Admin e inversores

## Cambios
- Renombrar en Admin “Alquiler mensual” a “Alquiler mensual bruto” y “Gastos mensuales” a “Administración mensual”.
- Agregar “Otros gastos” mensuales y guardar ese dato por propiedad.
- Mostrar automáticamente el alquiler mensual neto correspondiente al propietario: `(bruto - administración - otros gastos) × participación`.
- Renombrar “Alquiler anual” a “Alquiler anual bruto” y mantener “Seguro anual”.
- Calcular automáticamente administración anual como administración mensual × 12.
- Mostrar impuesto a la propiedad anual, total de gastos anuales, NOI anual estimado y NOI mensual estimado.
- Usar esos mismos datos y cálculos en Mi Portafolio → Alquileres para cada inversor, sin modificar importes existentes.

## Detalles técnicos
- Agregar un campo independiente para otros gastos mensuales en las propiedades de alquiler, con valor inicial 0 para no alterar datos actuales.
- Derivar los totales en pantalla y al guardar, respetando el porcentaje de participación configurado.
- Mantener el tratamiento conjunto del dúplex Kimberly sin mezclar sus movimientos mensuales separados.

## Verificación
- Comprobar la edición desde Admin y la visualización resultante en la ficha de un inversor.
- Verificar que 477 Rayford aplique el 50% al alquiler mensual neto.
