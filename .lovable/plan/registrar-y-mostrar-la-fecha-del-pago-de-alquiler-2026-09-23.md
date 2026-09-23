# Registrar y mostrar la fecha del pago de alquiler

## Cambios
- Guardar una fecha de pago en cada período mensual de alquiler.
- Marcar septiembre de 2026 de 2725 Embers Pkwy W como pagado el 23/09/2026.
- Mostrar debajo de “Total ingreso propietario 50%” la fecha de pago.
- Mantener el reparto exacto del neto mensual: $1.883 total y $941,50 para cada propietario.

## Detalles técnicos
- Agregar un campo opcional `paid_on` a los registros mensuales de alquiler.
- Mostrar la fecha solamente cuando el período tenga alquiler pagado.
- Actualizar los tipos generados y validar la vista.
