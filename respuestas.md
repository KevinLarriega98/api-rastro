# Respuestas

## Ejercicio 0

Al intentar hacer `git push origin main`, GitHub rechazó el cambio directo a la rama protegida:

```text
remote: - Changes must be made through a pull request.
```

## Ejercicio 1

Con MongoDB parado, `GET /api/health` devolvió `500`. Respondió el middleware de errores de `src/index.ts` porque falló el `ping` a la base de datos.
