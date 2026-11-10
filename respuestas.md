# Respuestas

## Ejercicio 0

Al intentar hacer `git push origin main`, GitHub rechazó el cambio directo a la rama protegida:

```text
remote: - Changes must be made through a pull request.
```

## Ejercicio 1

**Pregunta 1.** Con MongoDB parado, `GET /api/health` devolvió `500`. Respondió el middleware de errores de `src/index.ts` porque falló el `ping` a la base de datos.

## Ejercicio 3.1

**Pregunta 2.** `?price=380` llega desde la URL como texto (`"380"`), pero MongoDB guarda `price` como número (`380`), así que no encuentra coincidencias. `category=Cars` sí funciona porque `category` está guardada como texto.

## Ejercicio 4

**Pregunta 3.** La API ignora `views` y `status` porque son datos que debe controlar el servidor. Si aceptara los valores del cliente, alguien podría falsear las visitas o publicar un anuncio directamente como vendido.

## Ejercicio 5

**Pregunta 4.** No. `listing.price` en la oferta es una copia del precio que tenía el iPhone cuando Sara la hizo; cambiarla borraría ese dato histórico. El `PATCH` solo debe actualizar el precio del anuncio.

## Ejercicio 6

**Pregunta 5.** Ofertar por un anuncio vendido devuelve `409` porque la petición tiene datos válidos, pero entra en conflicto con el estado actual del anuncio. `400` indicaría que los datos enviados son incorrectos.

**Pregunta 6.** MongoDB comprueba, por ejemplo, que el `_id` de cada oferta sea único. La API debe comprobar que las referencias existen: antes de guardar una oferta busca el anuncio y el comprador indicados por sus IDs.

## Reto opcional 1

Si el servidor se apaga después de aceptar la oferta y antes de reservar el anuncio, los datos quedan inconsistentes: la oferta figura como `ACCEPTED`, pero el anuncio sigue `AVAILABLE`. Una transacción permitiría confirmar ambas escrituras juntas.

## Reto opcional 3

Al poner `GET /stats` después de `GET /:id`, la petición devolvió `400`: Express interpretó `stats` como el parámetro `id` y este no tenía formato de ObjectId. La ruta específica debe ir antes de la ruta con parámetro.
