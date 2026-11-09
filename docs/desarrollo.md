## Manejo de Sesión
La sesión se maneja desde `auth.provider` y todos los datos de sesión los maneja supabase directamente desde `src\lib\core\auth\client.ts`. 
Ya creamos el userContext que será utilizado en todo el DMS el cual maneja simplemetne un `CurrentUser`.


### After Login() to...
Después del login creamos la ruta `DMS/page.tsx` que es la landing page despues de iniciar sesión. Ahí dependiendo el rol son los permisos que el usuario tendrá. La landing page tendrá unicamente un Header con el numbre y el logo de SOMA.

