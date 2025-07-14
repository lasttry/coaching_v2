export const calculateControlPoints = (
  centerX: number,
  centerY: number,
  radius: number
): {
  startX: number;
  startY: number;
  controlPoint1: { x: number; y: number };
  controlPoint2: { x: number; y: number };
  endX: number;
  endY: number;
} => {
  // Control points are offset by 0.552 times the radius
  const controlOffset = radius * 0.552;

  // Start point (270°) - directly below the center
  const startX = centerX;
  const startY = centerY + radius;

  // End point (90°) - directly above the center
  const endX = centerX;
  const endY = centerY - radius;

  // Control points
  const controlPoint1 = {
    x: centerX + controlOffset,
    y: centerY + radius,
  };
  const controlPoint2 = {
    x: centerX + controlOffset,
    y: centerY - radius,
  };

  return { startX, startY, controlPoint1, controlPoint2, endX, endY };
};

/**
 * Calculate the (x, y) coordinates of a point on a circle.
 * @param centerX - X-coordinate of the circle's center
 * @param centerY - Y-coordinate of the circle's center
 * @param radius - Radius of the circle
 * @param angleDegrees - Angle in degrees (0° is to the right, counterclockwise)
 * @returns { x: number, y: number } - Coordinates on the circle
 */
export const getCirclePoint = (
  centerX: number,
  centerY: number,
  radius: number,
  angleDegrees: number
): { x: number; y: number } => {
  const angleRadians = (angleDegrees * Math.PI) / 180; // Convert angle to radians

  const x = centerX + radius * Math.cos(angleRadians);
  const y = centerY + radius * Math.sin(angleRadians);

  return { x, y };
};

/**
 * Calculate the y-coordinate(s) on a circle given the x-coordinate.
 * @param centerX - X-coordinate of the circle's center (h)
 * @param centerY - Y-coordinate of the circle's center (k)
 * @param radius - Radius of the circle (r)
 * @param x - Given x-coordinate
 * @returns { y1: number, y2: number } - Upper and lower y-coordinates
 */
export const getCircleYCoordinates = (
  centerX: number,
  centerY: number,
  radius: number,
  x: number
): { y1: number; y2: number } => {
  const dx = x - centerX; // Horizontal distance from center
  const distanceSquared = radius * radius - dx * dx;

  if (distanceSquared < 0) {
    throw new Error('The given x-coordinate is outside the circle.');
  }

  const yOffset = Math.sqrt(distanceSquared);

  return {
    y1: centerY + yOffset, // Upper part of the circle
    y2: centerY - yOffset, // Lower part of the circle
  };
};

/**
 * Simplifies a path using the Ramer-Douglas-Peucker algorithm.
 *
 * @param points - Array of [x, y] coordinates representing the path.
 * @param tolerance - Maximum allowed perpendicular distance to keep a point (default: 1).
 * @returns A simplified array of points.
 */
export const simplifyPath = (
  points: [number, number][],
  tolerance: number = 1
): [number, number][] => {
  if (points.length <= 2) return points; // No simplification needed

  const [firstPoint, lastPoint] = [points[0], points[points.length - 1]];
  let maxDistance = 0;
  let index = 0;

  // Find the point farthest from the line between the first and last points
  for (let i = 1; i < points.length - 1; i++) {
    const distance = perpendicularDistance(points[i], firstPoint, lastPoint);
    if (distance > maxDistance) {
      maxDistance = distance;
      index = i;
    }
  }

  // If the max distance is greater than the tolerance, recursively simplify
  if (maxDistance > tolerance) {
    const left = simplifyPath(points.slice(0, index + 1), tolerance);
    const right = simplifyPath(points.slice(index), tolerance);

    return [...left.slice(0, -1), ...right];
  }

  // Otherwise, keep only the endpoints
  return [firstPoint, lastPoint];
};

/**
 * Calculates the perpendicular distance of a point from a line defined by two points.
 *
 * @param point - The point [x, y] to measure the distance for.
 * @param lineStart - The start point [x, y] of the line.
 * @param lineEnd - The end point [x, y] of the line.
 * @returns The perpendicular distance.
 */
export const perpendicularDistance = (
  point: [number, number],
  lineStart: [number, number],
  lineEnd: [number, number]
): number => {
  const [x, y] = point;
  const [x1, y1] = lineStart;
  const [x2, y2] = lineEnd;

  const numerator = Math.abs((y2 - y1) * x - (x2 - x1) * y + x2 * y1 - y2 * x1);
  const denominator = Math.sqrt((y2 - y1) ** 2 + (x2 - x1) ** 2);

  return numerator / denominator;
};
