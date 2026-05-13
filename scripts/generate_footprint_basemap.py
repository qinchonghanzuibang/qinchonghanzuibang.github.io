#!/usr/bin/env python3
"""Generate a lightweight Web Mercator SVG basemap for the footprint page."""

from __future__ import annotations

import argparse
import datetime as dt
import json
import math
import pathlib
import urllib.request

from shapely.geometry import MultiPolygon, Polygon, shape
from shapely.ops import transform, unary_union


SOURCE_URL = "https://d2ad6b4ur7yvpq.cloudfront.net/naturalearth-3.3.0/ne_110m_land.geojson"
WIDTH = 1440
HEIGHT = 720
MAX_LAT = 85.05112878
MAX_MERCATOR_Y = math.pi
SIMPLIFY_TOLERANCE = 0.10

LAND_FILL = "#dce6eb"
LAND_STROKE = "#b9cbd4"
OCEAN_FILL = "#f4f9fb"
LABEL_FILL = "#8ca0ad"

LABELS = [
    ("North America", -108.0, 47.0),
    ("South America", -60.0, -18.0),
    ("Europe", 12.0, 52.0),
    ("Africa", 18.0, 8.0),
    ("Asia", 92.0, 38.0),
    ("Oceania", 138.0, -23.0),
]


def mercator_project(lon: float, lat: float) -> tuple[float, float]:
    lat = max(-MAX_LAT, min(MAX_LAT, lat))
    phi = math.radians(lat)
    x = ((lon + 180.0) / 360.0) * WIDTH
    merc_y = math.log(math.tan((math.pi / 4.0) + (phi / 2.0)))
    y = ((MAX_MERCATOR_Y - merc_y) / (2.0 * MAX_MERCATOR_Y)) * HEIGHT
    return x, y


def project_geometry(geom):
    def project_xy(x, y, z=None):
        px, py = mercator_project(x, y)
        return (px, py) if z is None else (px, py, z)

    return transform(project_xy, geom)


def load_land_geometry() -> MultiPolygon | Polygon:
    with urllib.request.urlopen(SOURCE_URL, timeout=30) as response:
        collection = json.load(response)
    geoms = [shape(feature["geometry"]) for feature in collection["features"]]
    merged = unary_union(geoms)
    return merged.simplify(SIMPLIFY_TOLERANCE, preserve_topology=True)


def ring_to_path(coords) -> str:
    points = list(coords)
    if len(points) < 4:
        return ""
    start_x, start_y = points[0]
    parts = [f"M {start_x:.2f} {start_y:.2f}"]
    for x, y in points[1:]:
        parts.append(f"L {x:.2f} {y:.2f}")
    parts.append("Z")
    return " ".join(parts)


def polygon_to_path(poly: Polygon) -> str:
    paths = []
    outer = ring_to_path(poly.exterior.coords)
    if outer:
        paths.append(outer)
    for interior in poly.interiors:
        inner = ring_to_path(interior.coords)
        if inner:
            paths.append(inner)
    return " ".join(paths)


def geometry_to_path(geom) -> str:
    if isinstance(geom, Polygon):
        return polygon_to_path(geom)
    if isinstance(geom, MultiPolygon):
        return " ".join(polygon_to_path(poly) for poly in geom.geoms)
    raise TypeError(f"Unsupported geometry type: {geom.geom_type}")


def build_svg(path_data: str) -> str:
    label_bits = []
    for text, lon, lat in LABELS:
        x, y = mercator_project(lon, lat)
        label_bits.append(
            f'<text class="region-label" x="{x:.2f}" y="{y:.2f}">{text}</text>'
        )

    generated = dt.datetime.utcnow().replace(microsecond=0).isoformat() + "Z"
    return f"""<?xml version="1.0" encoding="UTF-8"?>
<!-- Generated from Natural Earth public-domain land data: {SOURCE_URL} -->
<!-- Projection: Web Mercator / EPSG:3857-compatible extent [-180, 180] x [-85.05112878, 85.05112878] -->
<!-- Generated at: {generated} -->
<svg xmlns="http://www.w3.org/2000/svg" width="{WIDTH}" height="{HEIGHT}" viewBox="0 0 {WIDTH} {HEIGHT}" role="img" aria-labelledby="title desc">
  <title id="title">Footprint branded world basemap</title>
  <desc id="desc">Minimal world basemap with muted land areas and subtle continent labels for the footprint page.</desc>
  <defs>
    <filter id="soft-shadow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="10" stdDeviation="12" flood-color="#9cb4c0" flood-opacity="0.10"/>
    </filter>
  </defs>
  <style>
    .ocean {{ fill: {OCEAN_FILL}; }}
    .land {{ fill: {LAND_FILL}; stroke: {LAND_STROKE}; stroke-width: 1.2; stroke-linejoin: round; filter: url(#soft-shadow); }}
    .region-label {{
      fill: {LABEL_FILL};
      font-family: Raleway, Arial, sans-serif;
      font-size: 24px;
      font-weight: 600;
      letter-spacing: 0.06em;
      opacity: 0.72;
      text-anchor: middle;
      pointer-events: none;
      user-select: none;
    }}
  </style>
  <rect class="ocean" x="0" y="0" width="{WIDTH}" height="{HEIGHT}" rx="0" ry="0"/>
  <path class="land" fill-rule="evenodd" d="{path_data}"/>
  {' '.join(label_bits)}
</svg>
"""


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--output",
        default="assets/footprint/world-basemap-mercator.svg",
        help="Output SVG path",
    )
    args = parser.parse_args()

    output = pathlib.Path(args.output)
    output.parent.mkdir(parents=True, exist_ok=True)

    land = load_land_geometry()
    projected = project_geometry(land)
    path_data = geometry_to_path(projected)
    output.write_text(build_svg(path_data), encoding="utf-8")
    print(f"Wrote {output}")


if __name__ == "__main__":
    main()
