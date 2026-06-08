import { particles, Particle } from './particles.js';

const canvas = document.getElementById("trail-canvas");
const ctx = canvas.getContext("2d");
export const activeTrails = new Map(); // touchId -> { points: [{x, y, time}], color: string, active: boolean }
export let isDrawingLoopRunning = false;
const trailDuration = 600; // duration in ms for trail points to disappear

function resizeCanvas() {
  const dpr = window.devicePixelRatio || 1;
  canvas.width = window.innerWidth * dpr;
  canvas.height = window.innerHeight * dpr;
  ctx.scale(dpr, dpr);
}

// Initial resize
resizeCanvas();
window.addEventListener("resize", resizeCanvas);

export function addTrail(id, x, y, color) {
  activeTrails.set(id, {
    points: [{ x, y, time: Date.now() }],
    color: color,
    active: true
  });
  if (!isDrawingLoopRunning) {
    isDrawingLoopRunning = true;
    requestAnimationFrame(drawTrails);
  }
}

export function updateTrail(id, x, y) {
  const trail = activeTrails.get(id);
  if (trail) {
    const lastPoint = trail.points[trail.points.length - 1];
    const now = Date.now();
    const dx = x - lastPoint.x;
    const dy = y - lastPoint.y;
    const dt = now - lastPoint.time;
    const dist = Math.hypot(dx, dy);

    // Only add a point if we moved a minimum distance to prevent excessive points
    if (dist > 3) {
      // Calculate velocity (pixels per frame)
      const vx = dt > 0 ? (dx / dt) * 16 : 0;
      const vy = dt > 0 ? (dy / dt) * 16 : 0;

      trail.points.push({ x, y, time: now });

      // Spawn particles along the segment path (opposite direction velocity)
      const particleCount = Math.min(4, Math.floor(dist / 8) + 1);
      for (let p = 0; p < particleCount; p++) {
        const ratio = p / particleCount;
        const px = lastPoint.x + dx * ratio;
        const py = lastPoint.y + dy * ratio;
        // spawn particles flying backwards relative to movement
        particles.push(new Particle(px, py, trail.color, -vx, -vy));
      }
    }
  }
}

export function deactivateTrail(id) {
  const trail = activeTrails.get(id);
  if (trail) {
    trail.active = false;
  }
}

export function clearTrails() {
  activeTrails.clear();
  const dpr = window.devicePixelRatio || 1;
  ctx.clearRect(0, 0, canvas.width / dpr, canvas.height / dpr);
}

export function drawTrails() {
  const dpr = window.devicePixelRatio || 1;
  ctx.clearRect(0, 0, canvas.width / dpr, canvas.height / dpr);
  const now = Date.now();
  let hasActivePoints = false;

  // Update and draw particles
  const frameTime = 16; // approximate 60fps frame duration in ms
  
  // Filter particles in-place
  const tempParticles = particles.filter(p => {
    p.update(frameTime);
    if (p.life > 0) {
      p.draw(ctx);
      return true;
    }
    return false;
  });
  particles.length = 0;
  particles.push(...tempParticles);

  activeTrails.forEach((trail, id) => {
    // Keep points that are younger than trailDuration
    trail.points = trail.points.filter(p => now - p.time < trailDuration);

    if (trail.points.length === 0 && !trail.active) {
      activeTrails.delete(id);
      return;
    }

    if (trail.points.length > 0) {
      hasActivePoints = true;
    }

    // Draw smooth, tapered trails using interpolated circle fills
    // Pass 1: Wide, very translucent outer glow
    drawTaperedTrail(trail.points, trail.color, 22, 0.08, now);
    // Pass 2: Medium glow
    drawTaperedTrail(trail.points, trail.color, 10, 0.25, now);
    // Pass 3: White core line (like a neon light / laser)
    drawTaperedTrail(trail.points, "#ffffff", 4, 0.85, now);
  });

  if (hasActivePoints || activeTrails.size > 0 || particles.length > 0) {
    requestAnimationFrame(drawTrails);
  } else {
    isDrawingLoopRunning = false;
  }
}

function drawTaperedTrail(points, color, baseSize, baseOpacity, now) {
  if (points.length < 2) return;

  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  for (let i = 1; i < points.length; i++) {
    const p1 = points[i - 1];
    const p2 = points[i];

    const age = now - p2.time;
    const lifeRatio = 1 - (age / trailDuration);
    if (lifeRatio <= 0) continue;

    // Position ratio (0 at oldest point/tail, 1 at newest point/head)
    const positionRatio = i / (points.length - 1);

    const size = baseSize * positionRatio * lifeRatio;
    const opacity = baseOpacity * positionRatio * lifeRatio;

    if (size <= 0.1 || opacity <= 0.01) continue;

    ctx.beginPath();
    ctx.moveTo(p1.x, p1.y);
    ctx.lineTo(p2.x, p2.y);
    ctx.lineWidth = size * 2;
    ctx.strokeStyle = color;
    ctx.globalAlpha = opacity;
    ctx.stroke();
  }
  ctx.globalAlpha = 1.0; // Reset
}

export function updateTrailColor(id, color) {
  const trail = activeTrails.get(id);
  if (trail) {
    trail.color = color;
  }
}

export function triggerDrawingLoop() {
  if (!isDrawingLoopRunning) {
    isDrawingLoopRunning = true;
    requestAnimationFrame(drawTrails);
  }
}

