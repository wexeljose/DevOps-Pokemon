# Mini Proyecto - API CRUD de Pokemon con Flask

API REST que gestiona informacion de Pokemon utilizando Flask y la PokeAPI.

## Instalacion

1. Clonar el repositorio:
```bash
git clone <url-del-repositorio>
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

La API iniciara en `http://localhost:5000` y cargara automaticamente los primeros 50 Pokemon desde PokeAPI.

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

## Notas

- Los datos se almacenan en memoria (se pierden al reiniciar el servidor).
- El campo `edad` se genera aleatoriamente ya que PokeAPI no lo proporciona.
- La carga inicial tarda aproximadamente 30-60 segundos.
