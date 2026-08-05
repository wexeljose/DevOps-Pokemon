import os
import json
import requests
import random
from flask import Flask, jsonify, request

app = Flask(__name__)

POKEMONS = []
next_id = 1

POKEAPI_BASE = "https://pokeapi.co/api/v2"
POKEMON_COUNT = 50
JSON_FILE = os.path.join(os.path.dirname(os.path.abspath(__file__)), "pokemons.json")


def save_to_json():
    with open(JSON_FILE, "w", encoding="utf-8") as f:
        json.dump({"pokemons": POKEMONS, "next_id": next_id}, f, ensure_ascii=False, indent=2)


def load_from_json():
    global next_id, POKEMONS
    if os.path.exists(JSON_FILE):
        with open(JSON_FILE, "r", encoding="utf-8") as f:
            data = json.load(f)
            POKEMONS = data["pokemons"]
            next_id = data["next_id"]
        return True
    return False


def fetch_pokemon_from_api(pokemon_id):
    try:
        pokemon_resp = requests.get(f"{POKEAPI_BASE}/pokemon/{pokemon_id}", timeout=10)
        pokemon_resp.raise_for_status()
        pokemon_data = pokemon_resp.json()

        species_resp = requests.get(
            f"{POKEAPI_BASE}/pokemon-species/{pokemon_id}", timeout=10
        )
        species_resp.raise_for_status()
        species_data = species_resp.json()

        habitat = "Desconocido"
        if species_data.get("habitat"):
            habitat = species_data["habitat"]["name"]

        abilities = [a["ability"]["name"] for a in pokemon_data.get("abilities", [])]

        types = [t["type"]["name"] for t in pokemon_data.get("types", [])]
        primary_type = types[0] if types else "Desconocido"

        img_url = ""
        official_artwork = (
            pokemon_data.get("sprites", {}).get("other", {}).get("official-artwork", {})
        )
        if official_artwork.get("front_default"):
            img_url = official_artwork["front_default"]
        elif pokemon_data.get("sprites", {}).get("front_default"):
            img_url = pokemon_data["sprites"]["front_default"]

        attack_stat = 0
        for stat in pokemon_data.get("stats", []):
            if stat["stat"]["name"] == "attack":
                attack_stat = stat["base_stat"]
                break

        return {
            "nombre": pokemon_data["name"].title(),
            "imagen": img_url,
            "caracteristicas": {
                "peso": pokemon_data["weight"] / 10,
                "altura": pokemon_data["height"] / 10,
                "fuerza": attack_stat,
                "edad": random.randint(1, 20),
            },
            "habilidades": abilities,
            "tipo": primary_type,
            "habitat": habitat,
        }
    except requests.RequestException as e:
        print(f"Error fetching Pokemon {pokemon_id}: {e}")
        return None


def load_pokemons():
    global next_id
    if load_from_json():
        print(f"Datos cargados desde {JSON_FILE}: {len(POKEMONS)} Pokemon")
        return

    print(f"Cargando los primeros {POKEMON_COUNT} Pokemon desde PokeAPI...")
    for i in range(1, POKEMON_COUNT + 1):
        data = fetch_pokemon_from_api(i)
        if data:
            data["id"] = next_id
            POKEMONS.append(data)
            next_id += 1
            print(f"  [{i}/{POKEMON_COUNT}] {data['nombre']} cargado")
    save_to_json()
    print(f"¡{len(POKEMONS)} Pokemon cargados y guardados en {JSON_FILE}!")


@app.route("/pokemons", methods=["GET"])
def get_pokemons():
    return jsonify(POKEMONS), 200


@app.route("/pokemons/<int:pokemon_id>", methods=["GET"])
def get_pokemon(pokemon_id):
    pokemon = next((p for p in POKEMONS if p["id"] == pokemon_id), None)
    if pokemon is None:
        return jsonify({"error": "Pokemon no encontrado"}), 404
    return jsonify(pokemon), 200


@app.route("/pokemons", methods=["POST"])
def create_pokemon():
    global next_id
    if not request.is_json:
        return jsonify({"error": "El contenido debe ser JSON"}), 400

    data = request.get_json()

    required_fields = ["nombre", "imagen", "caracteristicas", "habilidades", "tipo", "habitat"]
    missing = [f for f in required_fields if f not in data]
    if missing:
        return jsonify({"error": f"Faltan campos: {', '.join(missing)}"}), 400

    caracts = data["caracteristicas"]
    required_caracts = ["peso", "altura", "fuerza", "edad"]
    missing_c = [f for f in required_caracts if f not in caracts]
    if missing_c:
        return jsonify({"error": f"Faltan campos en caracteristicas: {', '.join(missing_c)}"}), 400

    new_pokemon = {
        "id": next_id,
        "nombre": data["nombre"],
        "imagen": data["imagen"],
        "caracteristicas": {
            "peso": float(caracts["peso"]),
            "altura": float(caracts["altura"]),
            "fuerza": int(caracts["fuerza"]),
            "edad": int(caracts["edad"]),
        },
        "habilidades": data["habilidades"],
        "tipo": data["tipo"],
        "habitat": data["habitat"],
    }
    next_id += 1
    POKEMONS.append(new_pokemon)
    save_to_json()

    return jsonify(new_pokemon), 201


@app.route("/pokemons/<int:pokemon_id>", methods=["PUT"])
def update_pokemon(pokemon_id):
    pokemon = next((p for p in POKEMONS if p["id"] == pokemon_id), None)
    if pokemon is None:
        return jsonify({"error": "Pokemon no encontrado"}), 404

    if not request.is_json:
        return jsonify({"error": "El contenido debe ser JSON"}), 400

    data = request.get_json()

    if "nombre" in data:
        pokemon["nombre"] = data["nombre"]
    if "imagen" in data:
        pokemon["imagen"] = data["imagen"]
    if "tipo" in data:
        pokemon["tipo"] = data["tipo"]
    if "habitat" in data:
        pokemon["habitat"] = data["habitat"]
    if "habilidades" in data:
        pokemon["habilidades"] = data["habilidades"]

    if "caracteristicas" in data:
        caracts = data["caracteristicas"]
        if "peso" in caracts:
            pokemon["caracteristicas"]["peso"] = float(caracts["peso"])
        if "altura" in caracts:
            pokemon["caracteristicas"]["altura"] = float(caracts["altura"])
        if "fuerza" in caracts:
            pokemon["caracteristicas"]["fuerza"] = int(caracts["fuerza"])
        if "edad" in caracts:
            pokemon["caracteristicas"]["edad"] = int(caracts["edad"])

    save_to_json()
    return jsonify(pokemon), 200


@app.route("/pokemons/<int:pokemon_id>", methods=["DELETE"])
def delete_pokemon(pokemon_id):
    pokemon = next((p for p in POKEMONS if p["id"] == pokemon_id), None)
    if pokemon is None:
        return jsonify({"error": "Pokemon no encontrado"}), 404

    POKEMONS.remove(pokemon)
    save_to_json()
    return jsonify({"message": f"Pokemon {pokemon['nombre']} eliminado correctamente"}), 200


if __name__ == "__main__":
    load_pokemons()
    app.run(debug=True, host="0.0.0.0", port=5000)
