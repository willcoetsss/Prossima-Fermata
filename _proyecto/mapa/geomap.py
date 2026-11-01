"""Genera los datos del mapa de Italia (regiones, países vecinos, rutas) ya proyectados a coordenadas SVG."""
import json, math
from pathlib import Path

LON0, LAT0, K = 6.2, 47.3, 100.0
COSP = math.cos(math.radians(42.0))

def P(lon, lat):
    return ((lon - LON0) * COSP * K, (LAT0 - lat) * K)

def ring_d(ring, tol=0.0):
    pts = [P(*c[:2]) for c in ring]
    out = []
    last = None
    for x, y in pts:
        x, y = round(x, 1), round(y, 1)
        if last and abs(x - last[0]) < 0.25 and abs(y - last[1]) < 0.25:
            continue
        out.append((x, y)); last = (x, y)
    if len(out) < 3:
        return ""
    s = f"M{out[0][0]:g} {out[0][1]:g}"
    px, py = out[0]
    for x, y in out[1:]:
        s += f"l{round(x - px, 1):g} {round(y - py, 1):g}"
        px, py = x, y
    return s + "z"

def geom_d(g):
    if not g:
        return ""
    polys = g["coordinates"] if g["type"] == "MultiPolygon" else [g["coordinates"]]
    return "".join(ring_d(r) for poly in polys for r in poly)

def hav(a, b):
    R = 6371.0
    la1, la2 = math.radians(a[1]), math.radians(b[1])
    dla = la2 - la1; dlo = math.radians(b[0] - a[0])
    h = math.sin(dla / 2) ** 2 + math.cos(la1) * math.cos(la2) * math.sin(dlo / 2) ** 2
    return 2 * R * math.asin(math.sqrt(h))

def build(D: Path, errors: list):
    from shapely.geometry import shape, Point
    reg = json.loads((D / "geo" / "regions_s.geojson").read_text())
    world = json.loads((D / "geo" / "world_s.geojson").read_text())
    R = json.loads((D / "routes.json").read_text(encoding="utf8"))
    SHORT = {"Valle d'Aosta/Vallée d'Aoste": "Valle d'Aosta", "Trentino-Alto Adige/Südtirol": "Trentino-Alto Adige"}
    regions, shapes = [], {}
    for f in reg["features"]:
        name = SHORT.get(f["properties"]["reg_name"], f["properties"]["reg_name"])
        shp = shape(f["geometry"])
        shapes[name] = shp
        # punto interior del polígono mayor para la etiqueta
        big = max(shp.geoms, key=lambda g: g.area) if shp.geom_type == "MultiPolygon" else shp
        lp = big.representative_point()
        x, y = P(lp.x, lp.y)
        regions.append({"n": name, "d": geom_d(f["geometry"]), "l": [round(x), round(y)]})
    neigh = "".join(geom_d(f["geometry"]) for f in world["features"] if f["properties"]["name"] not in ("Vatican",))
    cities = {}
    for cid, c in R["cities"].items():
        x, y = P(*c["ll"])
        if c["reg"] not in shapes:
            errors.append(f"routes: región desconocida {c['reg']}")
        elif not shapes[c["reg"]].buffer(0.03).contains(Point(*c["ll"])):
            errors.append(f"routes: {cid} no cae dentro de {c['reg']}")
        cities[cid] = dict(c, xy=[round(x, 1), round(y, 1)])
    def poly(a, via, b):
        pts = [R["cities"][a]["ll"]] + via + [R["cities"][b]["ll"]]
        km = sum(hav(pts[i], pts[i + 1]) for i in range(len(pts) - 1))
        return [[round(v, 1) for v in P(*p)] for p in pts], round(km)
    routes = []
    for r in R["routes"]:
        if len(r["legs"]) != len(r["stops"]) - 1:
            errors.append(f"routes: {r['id']} legs != stops-1")
        legs = []
        for i, lg in enumerate(r["legs"]):
            pts, km = poly(r["stops"][i], lg["via"], r["stops"][i + 1])
            legs.append({"pts": pts, "km": km, "info": lg["info"], "sea": bool(lg.get("sea"))})
        xs = [cities[s]["xy"][0] for s in r["stops"]] + [p[0] for l in legs for p in l["pts"]]
        ys = [cities[s]["xy"][1] for s in r["stops"]] + [p[1] for l in legs for p in l["pts"]]
        for s in r["stops"]:
            if cities[s]["reg"] not in r["regions"]:
                errors.append(f"routes: {s} ({cities[s]['reg']}) no está en las regiones de {r['id']}")
        routes.append({k: r[k] for k in ("id", "num", "lvl", "name", "tag", "regions", "desc", "stops")} |
                      {"legs": legs, "bbox": [min(xs), min(ys), max(xs), max(ys)]})
    transfers = []
    for i, t in enumerate(R["transfers"]):
        a = R["routes"][i]["stops"][-1]; b = R["routes"][i + 1]["stops"][0]
        pts, km = poly(a, t["via"], b)
        transfers.append({"pts": pts, "km": km, "info": t["info"]})
    seas = [{"n": s["n"], "xy": [round(v) for v in P(*s["ll"])]} for s in R["seas"]]
    # encuadre de Italia completa
    ib = [P(6.55, 47.15), P(18.6, 36.6)]
    return {"regions": regions, "neigh": neigh, "cities": cities, "routes": routes, "transfers": transfers, "seas": seas,
            "italy": [round(ib[0][0]), round(ib[0][1]), round(ib[1][0]), round(ib[1][1])]}

if __name__ == "__main__":
    errs = []
    m = build(Path(__file__).parent / "src" / "data", errs)
    s = json.dumps(m, ensure_ascii=False, separators=(",", ":"))
    print(len(s) // 1024, "KB", "\n".join(errs) or "sin errores")
    print({r["id"]: sum(l["km"] for l in r["legs"]) for r in m["routes"]})
