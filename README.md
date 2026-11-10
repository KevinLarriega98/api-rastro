# Rastro API

[![CI](https://github.com/KevinLarriega98/api-rastro/actions/workflows/ci.yml/badge.svg)](https://github.com/KevinLarriega98/api-rastro/actions/workflows/ci.yml)

API REST para una app de compraventa de segunda mano. Está construida con **Express**, **TypeScript** y **MongoDB**.

## Puesta en marcha

Necesitas Node.js 24 y MongoDB en funcionamiento. En el entorno de esta práctica, MongoDB corre en el contenedor `mongodb-practica`.

```bash
npm ci
cp .env.example .env
docker start mongodb-practica
npm run dev
```

Edita `.env` con tus credenciales de MongoDB antes de arrancar. La API usa la base de datos `rastro` y escucha en `http://localhost:3000`. Comprueba la conexión en [http://localhost:3000/api/health](http://localhost:3000/api/health).

Los datos de ejemplo se cargan en MongoDB según la entrega de clase. Sin ellos, los listados estarán vacíos y los IDs de las pruebas no existirán.

## Rutas

| Método | Ruta | Función |
| --- | --- | --- |
| GET | `/api/health` | Comprueba la conexión con MongoDB |
| GET | `/api/listings` | Lista anuncios; admite `category`, `city` y `maxPrice` |
| GET | `/api/listings/stats` | Número de anuncios y precio medio por categoría |
| GET | `/api/listings/:id` | Devuelve un anuncio y suma una visita |
| POST | `/api/listings` | Publica un anuncio |
| PATCH | `/api/listings/:id` | Cambia el precio |
| DELETE | `/api/listings/:id` | Borra un anuncio |
| GET | `/api/listings/:id/offers` | Lista las ofertas de un anuncio |
| POST | `/api/offers` | Crea una oferta |
| PATCH | `/api/offers/:id` | Acepta una oferta pendiente |

Las respuestas de error usan JSON con el formato `{ "error": "mensaje" }`.

## Comprobaciones

```bash
npm run lint
npm run typecheck
```

El [CI](.github/workflows/ci.yml) ejecuta estas comprobaciones en las pull requests hacia `main`. Las respuestas de los ejercicios están en [respuestas.md](respuestas.md).
