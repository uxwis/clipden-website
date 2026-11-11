"use strict";

// Seeds are arranged by display rank. The extra wide seed reserves the upper left for stats.
const wideTagSites = [
  [.60, .65, .012], [.73, .16, .004], [.15, .82, .002], [.93, .52, .002],
  [.33, .52], [.44, .12], [.94, .90], [.94, .12],
  [.39, .95], [.07, .53], [.59, .32], [.77, .95],
];
const narrowTagSites = [
  [.58, .28, .016], [.22, .11, .005], [.83, .06, .001], [.18, .40, .001],
  [.88, .49], [.47, .57], [.14, .67], [.83, .72],
  [.32, .85], [.87, .95], [.12, .94], [.59, .94],
];
const fewTagSites = [[.57, .56, .012], [.18, .37], [.83, .13], [.83, .86]];
const continuingTagSites = [
  [.25, .32, .004], [.57, .66, .006], [.73, .18, .002], [.90, .42],
  [.16, .76], [.43, .84], [.91, .78], [.49, .14],
  [.10, .08], [.70, .90], [.90, .11], [.10, .47],
];

function mosaicPoint(a, b, fraction) {
  return { x: a.x + (b.x - a.x) * fraction, y: a.y + (b.y - a.y) * fraction };
}

const mosaicGutter = 3.5;

function clipMosaicCell(polygon, site, neighbor) {
  if (!polygon.length) return polygon;
  const dx = neighbor.x - site.x;
  const dy = neighbor.y - site.y;
  // Offset both sides of each weighted bisector to leave one continuous seam.
  const edge = (dx * (neighbor.x + site.x) + dy * (neighbor.y + site.y) +
    site.weight - neighbor.weight) / 2 - mosaicGutter * Math.hypot(dx, dy);
  const signedDistance = point => point.x * dx + point.y * dy - edge;
  const result = [];
  let previous = polygon.at(-1);
  let previousDistance = signedDistance(previous);
  let clipped = false;
  for (const point of polygon) {
    const distance = signedDistance(point);
    if ((previousDistance <= 0) !== (distance <= 0)) {
      result.push(mosaicPoint(previous, point, previousDistance / (previousDistance - distance)));
    }
    if (distance <= 0) result.push(point);
    else clipped = true;
    previous = point;
    previousDistance = distance;
  }
  return clipped ? result : polygon;
}

function mosaicPath(polygon, radius, left = 0, top = 0) {
  const coords = point => (point.x - left).toFixed(1) + " " + (point.y - top).toFixed(1);
  const cut = (a, b) => mosaicPoint(a, b, Math.min(0.36, radius / Math.hypot(b.x - a.x, b.y - a.y)));
  return polygon.map((point, index) => {
    const previous = polygon[(index + polygon.length - 1) % polygon.length];
    const next = polygon[(index + 1) % polygon.length];
    return (index ? "L " : "M ") + coords(cut(point, previous)) +
      " Q " + coords(point) + " " + coords(cut(point, next));
  }).join(" ") + " Z";
}

function mosaicSpan(polygon, y) {
  const intersections = [];
  for (const [index, point] of polygon.entries()) {
    const next = polygon[(index + 1) % polygon.length];
    if ((point.y > y) !== (next.y > y)) {
      intersections.push(mosaicPoint(point, next, (y - point.y) / (next.y - point.y)).x);
    }
  }
  return [Math.min(...intersections), Math.max(...intersections)];
}

function mosaicTile(polygon, index) {
  const left = Math.floor(Math.min(...polygon.map(point => point.x)));
  const top = Math.floor(Math.min(...polygon.map(point => point.y)));
  const width = Math.ceil(Math.max(...polygon.map(point => point.x))) - left;
  const height = Math.ceil(Math.max(...polygon.map(point => point.y))) - top;
  const centerY = top + height / 2;
  let label;
  // Fit a label band between both edges, preferring room close to the center.
  let band = Math.min(42, height * .34);
  for (const limit of [42, 32, 22, 18]) {
    const halfHeight = Math.min(limit, height * .34);
    let candidate;
    let best = -Infinity;
    for (let y = top + halfHeight + 4; y < top + height - halfHeight - 4; y += 4) {
      const upper = mosaicSpan(polygon, y - halfHeight);
      const lower = mosaicSpan(polygon, y + halfHeight);
      const pad = limit <= 22 ? 7 : 10;
      const start = Math.max(upper[0], lower[0]) + pad;
      const end = Math.min(upper[1], lower[1]) - pad;
      const score = end - start - Math.abs(y - centerY) * (limit <= 22 ? .25 : .7);
      if (end > start && score > best) {
        best = score;
        candidate = { x: (start + end) / 2 - left, y: y - top, width: end - start };
      }
    }
    if (candidate && (!label || candidate.width > label.width)) {
      label = candidate;
      band = halfHeight;
    }
    if (label?.width >= 62) break;
  }
  label ||= { x: width / 2, y: height / 2, width: width * .65 };
  const radius = Math.min(index === 0 ? 56 : 32, width * 0.24, height * 0.24);
  const room = Math.min(height, label.width * 1.25);
  const typeLimit = Math.floor((2 * band - 20) / 1.2);
  label.nameSize = Math.round(Math.max(13, Math.min(18, typeLimit, 13 + (room - 92) * .035)));
  label.countSize = label.nameSize >= 16 ? 12 : 11;
  label.lines = Math.max(1, Math.min(4, Math.floor((2 * band - label.countSize * 1.2 - 4) / (label.nameSize * 1.2))));
  return { left, top, width, height, label, path: mosaicPath(polygon, radius, left, top) };
}

function tagMosaicWeight({ tag, n }, maxLog) {
  const nameWidth = Array.from(tag).reduce((size, char) => size + (/^[\x20-\x7e]$/.test(char) ? .6 : 1), 0);
  const frequency = Math.log2(Math.max(1, n)) / maxLog;
  return .28 * frequency + .22 * Math.min(1, nameWidth / 18);
}

function nearbyMosaicSites(groups, site, rowRadius = 1, columnRadius = 1) {
  return groups.slice(Math.max(0, site.row - rowRadius), site.row + rowRadius + 1)
    .flatMap(row => row.slice(Math.max(0, site.column - columnRadius), site.column + columnRadius + 1).flat());
}

function mosaicDistanceSquared(a, b) {
  return (a.x - b.x) ** 2 + (a.y - b.y) ** 2;
}

function tessellateMosaic(frame, groups, bandWidth, rowHeight) {
  const sites = groups.flat(2);
  let maxWeight = 0;
  for (const site of sites) {
    // Capping the weight by the nearest seed keeps every label's own cell.
    const distance = nearbyMosaicSites(groups, site).reduce((nearest, other) => other === site ? nearest :
      Math.min(nearest, mosaicDistanceSquared(site, other)), Math.min(bandWidth, rowHeight) ** 2);
    site.weight = Math.min(site.bias * bandWidth ** 2 + site.weight * distance, .5 * distance);
    maxWeight = Math.max(maxWeight, site.weight);
  }
  return sites.map(site => {
    const nearby = new Set(nearbyMosaicSites(groups, site));
    let cell = frame;
    for (const other of nearby) if (other !== site) cell = clipMosaicCell(cell, site, other);
    // A farther seed cannot cut this polygon when its bisector lies beyond its farthest vertex.
    const margin = Math.sqrt(Math.max(...cell.map(point => mosaicDistanceSquared(site, point)))) + mosaicGutter;
    const limit = margin + Math.sqrt(margin ** 2 + maxWeight);
    const candidates = nearbyMosaicSites(groups, site, Math.ceil(limit / rowHeight), Math.ceil(limit / bandWidth));
    for (const other of candidates) {
      if (!nearby.has(other) && mosaicDistanceSquared(site, other) <= limit ** 2) cell = clipMosaicCell(cell, site, other);
    }
    return cell;
  });
}

function layoutTagMosaic(width, entries) {
  const usableWidth = Math.min(width, Math.max(660, entries.length * 95));
  const columns = Math.max(1, Math.min(Math.ceil(usableWidth / 1050), Math.floor(usableWidth / 560)));
  const bandWidth = usableWidth / columns;
  const wide = bandWidth >= 660;
  const capacity = wide ? Math.min(12, Math.floor(bandWidth / 75)) : 8;
  const rows = Math.ceil(entries.length / (capacity * columns));
  const count = Math.ceil(entries.length / (rows * columns));
  const sparse = count <= 4;
  const heightLimit = columns > 1 ? 460 : 560;
  const rowHeight = Math.round(wide
    ? Math.min(heightLimit, Math.max(sparse ? 210 : 410, bandWidth * (sparse ? .33 : .54 + .0075 * count)))
    : sparse ? 128 + count * 46 : 180 + count * 40);
  const maxLog = entries.reduce((max, { n }) => Math.max(max, Math.log2(Math.max(1, n))), 1);
  const groups = [];
  const inside = value => Math.max(.035, Math.min(.965, value));
  let start = 0;
  for (let row = 0; row < rows; row++) {
    let remaining = Math.ceil((entries.length - start) / (rows - row));
    const groupRow = [];
    for (let column = 0; column < columns; column++) {
      const size = Math.ceil(remaining / (columns - column));
      const stats = wide && row === 0 && column === 0;
      const pattern = stats ? wideTagSites : size <= 4 ? fewTagSites : wide ? continuingTagSites : narrowTagSites;
      const mirrored = row % 2 === 1;
      const seeds = pattern.slice(0, size).map(([x, y, bias = 0], index) => {
        // Stagger neighboring seeds to break straight, repeated joins across the canvas.
        const order = start + index;
        const offsetX = ((order * 7 % 17) / 16 - .5) * .07 + (y - .5) * .06;
        const offsetY = ((order * 11 % 19) / 18 - .5) * .10 + (x - .5) * .10;
        return {
          x: (column + inside((mirrored ? 1 - x : x) + offsetX)) * bandWidth,
          y: (row + inside(y + offsetY)) * rowHeight,
          row, column, bias, weight: tagMosaicWeight(entries[order], maxLog),
        };
      });
      if (stats) seeds.unshift({ x: bandWidth * .14, y: rowHeight * .19, row, column, bias: .013, weight: 0 });
      groupRow.push(seeds);
      start += size;
      remaining -= size;
    }
    groups.push(groupRow);
  }
  const height = rowHeight * rows;
  const frame = [{ x: 0, y: 0 }, { x: usableWidth, y: 0 },
    { x: usableWidth, y: height }, { x: 0, y: height }];
  const cells = tessellateMosaic(frame, groups, bandWidth, rowHeight);
  let contours = "";
  let contourHeight = 0;
  if (wide) {
    const region = cells.shift();
    const anchor = { x: bandWidth * .17, y: rowHeight * .20 };
    contours = [1, .86, .72, .58, .44].map(scale =>
      mosaicPath(region.map(point => mosaicPoint(anchor, point, scale)), 24 * scale)).join(" ");
    contourHeight = Math.ceil(Math.max(...region.map(point => point.y)));
  }
  return { wide, height, contours, contourHeight, contourWidth: bandWidth, tiles: cells.map(mosaicTile) };
}
