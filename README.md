# Mini Proyecto - API CRUD de Pokemon con Flask

API REST que gestiona informacion de Pokemon utilizando Flask y la PokeAPI. Los datos se persisten en un archivo JSON local (`pokemons.json`). Incluye un frontend web para interactuar con la API.

## Instalacion

1. Clonar el repositorio:
```bash
git clone https://github.com/wexeljose/DevOps-Pokemon.git
cd Poke
```

2. Crear entorno virtual (opcional pero recomendado):
```bash
python -m venv venv
venv\Scripts\activate  # Windows
```

3. Instalar dependencias:
```bash
pip install -r requirements.txt
```

## Ejecutar

```bash
python app.py
```

La API iniciara en `http://localhost:5000`.

- **Primera ejecucion**: carga los primeros 50 Pokemon desde PokeAPI y los guarda en `pokemons.json`.
- **Siguientes ejecuciones**: carga los datos desde `pokemons.json` (rapido, sin llamadas HTTP).

## Frontend

Abre `http://localhost:5000` en tu navegador para acceder a la interfaz web. El frontend permite:

- Ver todos los Pokemon en una cuadricula
- Buscar Pokemon por nombre, tipo o habitat
- Ver detalles de cada Pokemon
- Crear nuevos Pokemon
- Editar Pokemon existentes
- Eliminar Pokemon

## Endpoints

| Metodo | Ruta | Descripcion |
|--------|------|-------------|
| GET | `/pokemons` | Lista todos los Pokemon |
| GET | `/pokemons/<id>` | Obtiene un Pokemon por ID |
| POST | `/pokemons` | Crea un nuevo Pokemon |
| PUT | `/pokemons/<id>` | Actualiza un Pokemon por ID |
| DELETE | `/pokemons/<id>` | Elimina un Pokemon por ID |

## Ejemplos de uso

### Listar todos los Pokemon
```bash
curl http://localhost:5000/pokemons
```

### Obtener un Pokemon por ID
```bash
curl http://localhost:5000/pokemons/25
```

### Crear un nuevo Pokemon
```bash
curl -X POST http://localhost:5000/pokemons -H "Content-Type: application/json" -d "{\"nombre\": \"MiPokemon\", \"imagen\": \"https://ejemplo.com/imagen.png\", \"caracteristicas\": {\"peso\": 10.5, \"altura\": 1.2, \"fuerza\": 75, \"edad\": 3}, \"habilidades\": [\"habilidad1\", \"habilidad2\"], \"tipo\": \"Fuego\", \"habitat\": \"Montanas\"}"
```

### Actualizar un Pokemon
```bash
curl -X PUT http://localhost:5000/pokemons/150 -H "Content-Type: application/json" -d "{\"nombre\": \"Mewtwo Actualizado\", \"caracteristicas\": {\"fuerza\": 150}}"
```

### Eliminar un Pokemon
```bash
curl -X DELETE http://localhost:5000/pokemons/150
```

## Estructura del JSON

```json
{
  "id": 25,
  "nombre": "Pikachu",
  "imagen": "https://raw.githubusercontent.com/.../25.png",
  "caracteristicas": {
    "peso": 6.0,
    "altura": 0.4,
    "fuerza": 55,
    "edad": 5
  },
  "habilidades": ["static", "lightning-rod"],
  "tipo": "electric",
  "habitat": "forest"
}
```

## Persistencia

Los datos se guardan en el archivo `pokemons.json` en la misma carpeta del proyecto. Cada operacion CRUD (crear, actualizar, eliminar) actualiza el archivo automaticamente. Si se elimina `pokemons.json`, la app volvera a cargar los datos desde PokeAPI en la proxima ejecucion.

### Estructura de pokemons.json

```json
{
  "next_id": 51,
  "pokemons": [
    {
      "id": 1,
      "nombre": "Bulbasaur",
      "imagen": "https://raw.githubusercontent.com/.../1.png",
      "caracteristicas": {
        "peso": 6.9,
        "altura": 0.7,
        "fuerza": 49,
        "edad": 12
      },
      "habilidades": ["overgrow", "chlorophyll"],
      "tipo": "grass",
      "habitat": "grassland"
    }
  ]
}
```

## Notas

- El campo `edad` se genera aleatoriamente ya que PokeAPI no lo proporciona.
- La primera carga desde PokeAPI tarda aproximadamente 30-60 segundos.
- Las siguientes ejecuciones son rapidas ya que cargan desde el JSON local.
