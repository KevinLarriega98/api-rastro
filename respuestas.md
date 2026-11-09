# Respuestas

## Ejercicio 0

Al intentar hacer `git push origin main`, GitHub rechazó el cambio directo a la rama protegida:

```text
remote: - Changes must be made through a pull request.
```

## Ejercicio 1

Con MongoDB parado, `GET /api/health` devolvió `500`. Respondió el middleware de errores de `src/index.ts` porque falló el `ping` a la base de datos.

## Ejercicio 3.1

**Pregunta 2.** `?price=380` llega desde la URL como texto (`"380"`), pero MongoDB guarda `price` como número (`380`), así que no encuentra coincidencias. `category=Cars` sí funciona porque `category` está guardada como texto.
