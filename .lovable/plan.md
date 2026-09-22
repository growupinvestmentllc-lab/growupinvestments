# Corregir el ingreso de Hunter

## Objetivo
Hacer que, después de validar el email y la contraseña, la cuenta Hunter entre automáticamente a su página de propuestas.

## Cambios
- Corregir la carga inicial de la sesión para que también espere y reconozca el rol del usuario.
- Mantener actualizado el rol al iniciar o cerrar sesión, evitando que la pantalla quede detenida en el formulario.
- Verificar el ingreso real de Hunter y la redirección a `/hunter`.

## Alcance técnico
- Ajustar únicamente el estado compartido de autenticación.
- No cambiar credenciales, permisos ni datos de propiedades.
