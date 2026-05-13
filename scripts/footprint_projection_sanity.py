#!/usr/bin/env python3
"""Small projection sanity checks for the footprint basemap."""

from __future__ import annotations

import math


MAX_LAT = 85.05112878
MAX_MERCATOR_Y = math.pi

POINTS = {
    "Hong Kong": (114.1694, 22.3193),
    "Shenzhen": (114.0579, 22.5431),
    "Singapore": (103.8198, 1.3521),
    "Tokyo": (139.6917, 35.6895),
    "London": (-0.1278, 51.5074),
    "San Francisco": (-122.4194, 37.7749),
}

EXPECTED_WINDOWS = {
    "Hong Kong": ((0.79, 0.85), (0.35, 0.48)),
    "Shenzhen": ((0.79, 0.85), (0.35, 0.48)),
    "Singapore": ((0.74, 0.82), (0.46, 0.56)),
    "Tokyo": ((0.85, 0.93), (0.32, 0.45)),
    "London": ((0.46, 0.54), (0.28, 0.40)),
    "San Francisco": ((0.12, 0.22), (0.33, 0.45)),
}


def project(lon: float, lat: float) -> tuple[float, float]:
    lat = max(-MAX_LAT, min(MAX_LAT, lat))
    phi = math.radians(lat)
    x = (lon + 180.0) / 360.0
    merc_y = math.log(math.tan((math.pi / 4.0) + (phi / 2.0)))
    y = (MAX_MERCATOR_Y - merc_y) / (2.0 * MAX_MERCATOR_Y)
    return x, y


def main() -> None:
    projected = {}
    for name, (lon, lat) in POINTS.items():
        x, y = project(lon, lat)
        projected[name] = (x, y)
        (min_x, max_x), (min_y, max_y) = EXPECTED_WINDOWS[name]
        assert min_x <= x <= max_x, f"{name} x out of range: {x:.4f}"
        assert min_y <= y <= max_y, f"{name} y out of range: {y:.4f}"

    assert projected["Hong Kong"][0] > projected["London"][0]
    assert projected["San Francisco"][0] < projected["London"][0]
    assert projected["Singapore"][1] > projected["Hong Kong"][1]
    assert abs(projected["Hong Kong"][0] - projected["Shenzhen"][0]) < 0.01

    for name, (x, y) in projected.items():
        print(f"{name}: x={x:.4f}, y={y:.4f}")


if __name__ == "__main__":
    main()
