import { PHYSICS } from '../constants/physics';

export interface OrbPhysics {
  id: string;
  x: number;      // centre x
  y: number;      // centre y
  vx: number;     // velocity x (px/frame)
  vy: number;     // velocity y (px/frame)
  radius: number; // collision radius
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function clampSpeed(vx: number, vy: number): { vx: number; vy: number } {
  const speed = Math.sqrt(vx * vx + vy * vy);

  if (speed === 0) {
    const angle = Math.random() * Math.PI * 2;
    return {
      vx: Math.cos(angle) * PHYSICS.MIN_SPEED,
      vy: Math.sin(angle) * PHYSICS.MIN_SPEED,
    };
  }

  if (speed < PHYSICS.MIN_SPEED) {
    const scale = PHYSICS.MIN_SPEED / speed;
    return { vx: vx * scale, vy: vy * scale };
  }

  if (speed > PHYSICS.MAX_SPEED) {
    const scale = PHYSICS.MAX_SPEED / speed;
    return { vx: vx * scale, vy: vy * scale };
  }

  return { vx, vy };
}

function applyDrift(vx: number, vy: number): { vx: number; vy: number } {
  const angle = Math.random() * Math.PI * 2;
  return {
    vx: vx + Math.cos(angle) * PHYSICS.DRIFT_FORCE,
    vy: vy + Math.sin(angle) * PHYSICS.DRIFT_FORCE,
  };
}

// ─── Wall collision ───────────────────────────────────────────────────────────

function resolveWalls(orb: OrbPhysics, width: number, height: number): OrbPhysics {
  let { x, y, vx, vy } = orb;
  const { radius } = orb;

  if (x - radius < 0) {
    x = radius;
    vx = Math.abs(vx) * PHYSICS.WALL_RESTITUTION;
  } else if (x + radius > width) {
    x = width - radius;
    vx = -Math.abs(vx) * PHYSICS.WALL_RESTITUTION;
  }

  if (y - radius < 0) {
    y = radius;
    vy = Math.abs(vy) * PHYSICS.WALL_RESTITUTION;
  } else if (y + radius > height) {
    y = height - radius;
    vy = -Math.abs(vy) * PHYSICS.WALL_RESTITUTION;
  }

  return { ...orb, x, y, vx, vy };
}

// ─── Orb-orb collision ────────────────────────────────────────────────────────

function resolveOrbCollisions(orbs: OrbPhysics[]): OrbPhysics[] {
  const result = orbs.map((o) => ({ ...o }));

  for (let i = 0; i < result.length; i++) {
    for (let j = i + 1; j < result.length; j++) {
      const a = result[i];
      const b = result[j];

      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const distSq = dx * dx + dy * dy;
      const minDist = a.radius + b.radius;

      if (distSq >= minDist * minDist) continue; // broad phase

      const dist = Math.sqrt(distSq);
      if (dist === 0) continue;

      // Separate overlapping orbs
      const nx = dx / dist;
      const ny = dy / dist;
      const overlap = (minDist - dist) * 0.5;

      result[i].x -= nx * overlap;
      result[i].y -= ny * overlap;
      result[j].x += nx * overlap;
      result[j].y += ny * overlap;

      // Reflect velocities along the collision normal
      const dvx = a.vx - b.vx;
      const dvy = a.vy - b.vy;
      const dot = dvx * nx + dvy * ny;

      if (dot > 0) {
        const impulse = dot * PHYSICS.ORB_RESTITUTION;
        result[i].vx -= impulse * nx;
        result[i].vy -= impulse * ny;
        result[j].vx += impulse * nx;
        result[j].vy += impulse * ny;
      }
    }
  }

  return result;
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Advance physics by one frame. Pure function — does not mutate input.
 */
export function tick(orbs: OrbPhysics[], width: number, height: number): OrbPhysics[] {
  if (orbs.length === 0) return orbs;

  let next = orbs.map((orb) => {
    const drifted = applyDrift(orb.vx, orb.vy);
    const clamped = clampSpeed(drifted.vx, drifted.vy);
    return {
      ...orb,
      x: orb.x + clamped.vx,
      y: orb.y + clamped.vy,
      vx: clamped.vx,
      vy: clamped.vy,
    };
  });

  next = resolveOrbCollisions(next);
  next = next.map((orb) => resolveWalls(orb, width, height));

  return next;
}

/**
 * Push orbs away from a finger touch point.
 * Orbs within CURSOR_RADIUS get an outward velocity boost.
 */
export function pushOrbs(orbs: OrbPhysics[], touchX: number, touchY: number): OrbPhysics[] {
  return orbs.map((orb) => {
    const dx = orb.x - touchX;
    const dy = orb.y - touchY;
    const dist = Math.sqrt(dx * dx + dy * dy);

    // Push reaches the orb edge, not just its centre
    const reach = PHYSICS.CURSOR_RADIUS + orb.radius;
    if (dist < reach && dist > 0) {
      const strength = (1 - dist / reach) * 5;
      const nx = dx / dist;
      const ny = dy / dist;
      return { ...orb, vx: orb.vx + nx * strength, vy: orb.vy + ny * strength };
    }
    return orb;
  });
}

/**
 * Scatter all orbs outward with random high velocities (shake gesture).
 */
export function scatterOrbs(orbs: OrbPhysics[]): OrbPhysics[] {
  return orbs.map((orb) => {
    const angle = Math.random() * Math.PI * 2;
    const speed = PHYSICS.MAX_SPEED * (0.5 + Math.random() * 0.5);
    return { ...orb, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed };
  });
}

/**
 * Apply tilt gravity from the accelerometer (gx/gy pre-multiplied by TILT_MULTIPLIER).
 */
export function applyGravity(orbs: OrbPhysics[], gx: number, gy: number): OrbPhysics[] {
  if (gx === 0 && gy === 0) return orbs;
  return orbs.map((orb) => ({ ...orb, vx: orb.vx + gx, vy: orb.vy + gy }));
}

/**
 * Create an OrbPhysics body for a new orb at (x, y) with a random gentle velocity.
 */
export function createOrbPhysics(id: string, x: number, y: number, radius: number): OrbPhysics {
  const angle = Math.random() * Math.PI * 2;
  const speed =
    PHYSICS.MIN_SPEED + Math.random() * (PHYSICS.MAX_SPEED - PHYSICS.MIN_SPEED) * 0.4;
  return { id, x, y, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed, radius };
}

/**
 * Pick a random orb radius within the spec range.
 */
export function randomOrbRadius(): number {
  return (
    PHYSICS.ORB_RADIUS_MIN +
    Math.floor(Math.random() * (PHYSICS.ORB_RADIUS_MAX - PHYSICS.ORB_RADIUS_MIN + 1))
  );
}
