"""Logo: una pizza cuyos ingredientes escriben «Boh» (B de salami, o de aceitunas, h de albahaca)."""
import math, random
random.seed(7)

def sample(path, step):
    """path: lista de segmentos [('L',(x0,y0),(x1,y1)) | ('A',cx,cy,r,a0,a1)] -> puntos equiespaciados"""
    pts = []
    def seg_points(seg, n):
        if seg[0] == 'L':
            (x0, y0), (x1, y1) = seg[1], seg[2]
            return [(x0 + (x1 - x0) * t / n, y0 + (y1 - y0) * t / n) for t in range(n + 1)]
        _, cx, cy, r, a0, a1 = seg
        return [(cx + r * math.cos(math.radians(a0 + (a1 - a0) * t / n)), cy + r * math.sin(math.radians(a0 + (a1 - a0) * t / n))) for t in range(n + 1)]
    for seg in path:
        L = math.dist(seg[1], seg[2]) if seg[0] == 'L' else abs(math.radians(seg[5] - seg[4])) * seg[3]
        n = max(1, round(L / step))
        p = seg_points(seg, n)
        if pts and math.dist(pts[-1], p[0]) < step * .6: p = p[1:]
        pts += p
    out = []
    for q in pts:
        if all(math.dist(q, o) > step * .7 for o in out): out.append(q)
    return out

# Letras en un lienzo de 100×100 (pizza centrada en 50,50)
B = [('L', (19, 29), (19, 71)),
     ('L', (19, 29), (27, 29)), ('A', 27, 39, 10, -90, 90), ('L', (27, 49), (20, 49)),
     ('L', (20, 49), (28, 49)), ('A', 27.5, 60.5, 10.5, -90, 90), ('L', (27.5, 71), (20, 71))]
O = [('A', 55.5, 60.5, 9.8, 0, 360)]
H = [('L', (72, 29), (72, 71)), ('A', 80.5, 58, 8.5, 180, 360), ('L', (89, 58), (89, 71))]

def salami(x, y):
    r = 4.4
    s = f'<circle cx="{x:.1f}" cy="{y:.1f}" r="{r}" fill="#8E1C16"/><circle cx="{x:.1f}" cy="{y:.1f}" r="{r - .9}" fill="#C2342A"/>'
    for _ in range(3):
        a, d = random.uniform(0, 6.28), random.uniform(.8, 2.4)
        s += f'<circle cx="{x + d * math.cos(a):.1f}" cy="{y + d * math.sin(a):.1f}" r=".75" fill="#F2C9B8"/>'
    return s
def olive(x, y):
    return f'<circle cx="{x:.1f}" cy="{y:.1f}" r="3.3" fill="none" stroke="#1E1B1A" stroke-width="2.5"/>'
def basil(x, y, ang):
    return (f'<g transform="translate({x:.1f} {y:.1f}) rotate({ang:.0f})"><ellipse rx="4.4" ry="2.5" fill="#2E8B3A"/>'
            f'<path d="M-4 0H4" stroke="#1F6A2A" stroke-width=".6"/></g>')

def svg(size_attr=""):
    o = f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" {size_attr}>'
    o += '<circle cx="50" cy="50" r="49" fill="#D99A4E"/><circle cx="50" cy="50" r="48.2" fill="none" stroke="#B87633" stroke-width="1.6"/>'
    # tostado del borde
    for a in range(0, 360, 24):
        x, y = 50 + 46 * math.cos(math.radians(a + 7)), 50 + 46 * math.sin(math.radians(a + 7))
        o += f'<ellipse cx="{x:.1f}" cy="{y:.1f}" rx="2.2" ry="1.2" fill="#B9773A" opacity=".6" transform="rotate({a + 97} {x:.1f} {y:.1f})"/>'
    o += '<circle cx="50" cy="50" r="43.5" fill="#CF3E26"/>'
    # mozzarella fundida: borde ondulado irregular
    pts = []
    for i in range(48):
        a = i / 48 * 2 * math.pi
        r = 39.5 + 1.8 * math.sin(a * 5 + 1) + 1.2 * math.sin(a * 9 + .4) + random.uniform(-.5, .5)
        pts.append((50 + r * math.cos(a), 50 + r * math.sin(a)))
    o += '<path d="M' + " L".join(f"{x:.1f} {y:.1f}" for x, y in pts) + 'Z" fill="#F7E6BF"/>'
    for (x, y, r) in [(34, 21, 3.2), (62, 19, 2.6), (14, 46, 2.4), (86, 36, 2.2), (40, 84, 2.8), (66, 82, 2.4), (15, 64, 2)]:
        o += f'<circle cx="{x}" cy="{y}" r="{r}" fill="#D9542F" opacity=".75"/>'
    for (x, y, r) in [(44, 26, 4), (70, 26, 3.5), (30, 76, 4), (62, 79, 3.5), (82, 72, 3)]:
        o += f'<circle cx="{x}" cy="{y}" r="{r}" fill="#EFD7A6"/>'
    for p in sample(B, 6.6): o += salami(*p)
    for p in sample(O, 6.0): o += olive(*p)
    hp = sample(H, 5.4)
    for i, p in enumerate(hp):
        q = hp[min(i + 1, len(hp) - 1)] if i + 1 < len(hp) else hp[i - 1]
        ang = math.degrees(math.atan2(q[1] - p[1], q[0] - p[0]))
        o += basil(*p, ang)
    return o + '</svg>'

if __name__ == "__main__":
    s = svg()
    open('/home/claude/italiano/logo/pizza-boh.svg', 'w').write(s)
    print(len(s))
