//#region node_modules/.pnpm/@mdi+js@7.4.47/node_modules/@mdi/js/mdi.js
var e = "M13,13H11V7H13M13,17H11V15H13M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2Z", t = "M16 20H8V6H16M16.67 4H15V2H9V4H7.33C6.6 4 6 4.6 6 5.33V20.67C6 21.4 6.6 22 7.33 22H16.67C17.41 22 18 21.41 18 20.67V5.33C18 4.6 17.4 4 16.67 4M15 16H9V19H15V16M15 11.5H9V14.5H15V11.5Z", n = "M10,20V14H14V20H19V12H22L12,3L2,12H5V20H10Z", r = "M15,15H17V11H15M7,15H9V11H7M11,13H13V9H11M8.83,7H15.2L19,10.8V17H5V10.8M8,5L3,10V19H21V10L16,5H8Z", i = "M3.33 16H11V13H4L3.33 16M13 16H20.67L20 13H13V16M21.11 18H13V22H22L21.11 18M2 22H11V18H2.89L2 22M11 8H13V11H11V8M15.76 7.21L17.18 5.79L19.3 7.91L17.89 9.33L15.76 7.21M4.71 7.91L6.83 5.79L8.24 7.21L6.12 9.33L4.71 7.91M3 2H6V4H3V2M18 2H21V4H18V2M12 7C14.76 7 17 4.76 17 2H7C7 4.76 9.24 7 12 7Z", a = "M8.28,5.45L6.5,4.55L7.76,2H16.23L17.5,4.55L15.72,5.44L15,4H9L8.28,5.45M18.62,8H14.09L13.3,5H10.7L9.91,8H5.38L4.1,10.55L5.89,11.44L6.62,10H17.38L18.1,11.45L19.89,10.56L18.62,8M17.77,22H15.7L15.46,21.1L12,15.9L8.53,21.1L8.3,22H6.23L9.12,11H11.19L10.83,12.35L12,14.1L13.16,12.35L12.81,11H14.88L17.77,22M11.4,15L10.5,13.65L9.32,18.13L11.4,15M14.68,18.12L13.5,13.64L12.6,15L14.68,18.12Z", o = {
	solar: "#fcd34d",
	home: "#818cf8",
	gridIn: "#60a5fa",
	gridOut: "#f472b6",
	batteryIn: "#4ade80",
	batteryOut: "#fb923c",
	consumer1: "#22d3ee",
	consumer2: "#2dd4bf",
	consumer3: "#38bdf8",
	consumer4: "#0d9488",
	batteryLoad1: "#a78bfa",
	batteryLoad2: "#c084fc"
}, s = {
	solar: "Solar",
	grid: "Grid",
	home: "Home",
	battery: "Battery",
	consumer1: "Consumer 1",
	consumer2: "Consumer 2",
	consumer3: "Consumer 3",
	consumer4: "Consumer 4",
	batteryLoad1: "Battery Load 1",
	batteryLoad2: "Battery Load 2"
}, c = {
	solar: i,
	grid: a,
	home: n,
	battery: t,
	consumer1: r,
	consumer2: r,
	consumer3: r,
	consumer4: r,
	batteryLoad1: r,
	batteryLoad2: r
}, l = {
	solarToHome: !0,
	solarToGrid: !0,
	solarToBattery: !0,
	batteryToHome: !0,
	batteryToGrid: !0
};
//#endregion
//#region src/flow-allocation.ts
function u(e, t) {
	let n = e.solar ?? 0, r = e.load ?? 0, i = -(e.battery ?? 0), a = e.batteryLoad1 ?? 0, o = e.batteryLoad2 ?? 0, s = Math.max(n, 0), c = Math.max(r, 0), l = Math.max(a, 0) + Math.max(o, 0), u = Math.max(l - i, 0), d = Math.max(i - l, 0), f = t.solarToBattery && !t.solarToHome && !t.solarToGrid ? s : t.solarToBattery ? Math.min(u, s) : 0, p = Math.max(f - u, 0), m = t.batteryToGrid ? Math.max(u - f, 0) : 0, h = s - f, g = t.solarToHome ? Math.min(h, c) : 0, _ = t.solarToGrid ? h - g : 0, v = d + p, y = c - g, b = t.batteryToHome ? Math.min(v, y) : 0;
	return {
		solarToBattery: f,
		gridToBattery: m,
		solarToHome: g,
		solarToGrid: _,
		batToHome: b,
		batToGrid: t.batteryToGrid ? v - b : 0,
		gridToHome: y - b
	};
}
//#endregion
//#region src/skeleton.ts
var d = "http://www.w3.org/2000/svg", f = Math.sqrt(3), p = 2 * Math.PI * 47, m = 47, h = 6 * (2 * m / f);
function g(e, t, n, r) {
	return `<rect id="${n}" x="${e - 47}" y="${t - 47}" width="94" height="94" rx="47" ry="47" transform="rotate(-90 ${e} ${t})" ${r} />`;
}
function _(e, t, n = 47) {
	return [
		[0, -n],
		[n, -n],
		[n, n],
		[-n, n],
		[-n, -n]
	].map(([n, r]) => `${e + n},${t + r}`).join(" ");
}
function v(e, t, n, r) {
	return `<polygon id="${n}" points="${_(e, t)}" ${r} />`;
}
function y(e, t, n, r) {
	return `<polygon id="${n}" points="${se(e, t, m)}" ${r} />`;
}
var b = 5 / 360;
function x(e) {
	let t = e * b;
	return `${t} ${e - t}`;
}
var S = x(p), C = 5, w = 2.2, T = [
	{
		id: "bat-charge-bloom",
		delay: 0
	},
	{
		id: "bat-charge-glow",
		delay: 0
	},
	{
		id: "bat-charge-core",
		delay: 0
	},
	...Array.from({ length: C }, (e, t) => {
		let n = t + 1;
		return {
			id: `bat-charge-tail-${n}`,
			delay: n * w / 360
		};
	})
];
function E(e, t) {
	let n = (n, r) => [
		g(e, t, n, `stroke-dasharray="${S}" ${r}`),
		v(e, t, `${n}-square`, `stroke-dasharray="${x(376)}" ${r}`),
		y(e, t, `${n}-hex`, `stroke-dasharray="${x(h)}" ${r}`)
	].join("\n      ");
	return `${T.filter((e) => e.delay > 0).map(({ id: e }, t) => {
		let r = (t + 1) / C, i = (.4 * (1 - r) ** 2).toFixed(3), a = (9 - r * 5.5).toFixed(1), o = (3 + r * 8).toFixed(1);
		return n(e, `class="bat-charge-tail" style="opacity: ${i}; stroke-width: ${a}; filter: blur(${o}px)"`);
	}).reverse().join("\n      ")}\n      ${[
		n("bat-charge-bloom", "class=\"bat-charge-bloom\""),
		n("bat-charge-glow", "class=\"bat-charge-glow\""),
		n("bat-charge-core", "class=\"bat-charge-core\"")
	].join("\n      ")}`;
}
function D(e, t, n) {
	return `translate(${e - n / 2} ${t - n / 2}) scale(${n / 24})`;
}
function O(e) {
	let t = 185 - e, n = 185 + e;
	return {
		topY: t,
		botY: n,
		topInner: t + 52,
		botInner: n - 52,
		topOuter: t - 52,
		botOuter: n + 52
	};
}
function k(e) {
	let t = 345 - e, n = t - e;
	return {
		col1: n,
		col2: t,
		col3: 345,
		col4: 345 + e,
		minX: n - 52 - 3
	};
}
var ee = [
	{
		id: "solar-home",
		cls: "solar",
		path: "p-solar-home"
	},
	{
		id: "solar-grid",
		cls: "solar",
		path: "p-solar-grid"
	},
	{
		id: "grid-home",
		cls: "grid",
		path: "p-grid-home"
	},
	{
		id: "bat-home",
		cls: "battery-out",
		path: "p-bat-home"
	},
	{
		id: "bat-grid",
		cls: "battery-out",
		path: "p-bat-grid"
	},
	{
		id: "solar-bat",
		cls: "solar",
		path: "p-solar-bat"
	},
	{
		id: "grid-bat",
		cls: "grid",
		path: "p-bat-grid",
		reverse: !0
	},
	{
		id: "home-consumer1",
		cls: "consumer1",
		path: "p-home-consumer1",
		maxDots: 2
	},
	{
		id: "home-consumer2",
		cls: "consumer2",
		path: "p-home-consumer2",
		maxDots: 2
	},
	{
		id: "home-consumer3",
		cls: "consumer3",
		path: "p-home-consumer3"
	},
	{
		id: "home-consumer4",
		cls: "consumer4",
		path: "p-home-consumer4"
	},
	{
		id: "bat-batteryload1",
		cls: "battery-load1",
		path: "p-bat-batteryload1",
		maxDots: 2
	},
	{
		id: "bat-batteryload2",
		cls: "battery-load2",
		path: "p-bat-batteryload2",
		maxDots: 2
	}
], A = [
	{
		shape: "triangle",
		idPrefix: "tri",
		wrapClass: "dot-tri-wrap",
		inner: (e) => `<polygon points="-4,-3.5 -4,3.5 6,0" class="dot dot-tri ${e}" vector-effect="non-scaling-stroke" />`
	},
	{
		shape: "bolt",
		idPrefix: "bolt",
		wrapClass: "dot-bolt-wrap",
		inner: (e) => `<polygon points="1.7,0.6 1.7,3.3 -6,-0.6 -1.7,-0.6 -1.7,-3.3 6,0.6" class="dot dot-bolt ${e}" vector-effect="non-scaling-stroke" />`
	},
	{
		shape: "chevron",
		idPrefix: "chevron",
		wrapClass: "dot-chevron-wrap",
		inner: (e) => `<path d="M-3,-3.5 L3,0 L-3,3.5" class="dot dot-chevron ${e}" vector-effect="non-scaling-stroke" fill="none" />`
	},
	{
		shape: "spark",
		idPrefix: "spark",
		wrapClass: "dot-spark-wrap",
		inner: (e) => `<polygon points="0,-6 1.3,-1.3 6,0 1.3,1.3 0,6 -1.3,1.3 -6,0 -1.3,-1.3" class="dot dot-spark ${e}" vector-effect="non-scaling-stroke" />`
	}
], te = {
	solar: "solar",
	grid: "grid-in",
	"battery-out": "battery-out",
	consumer1: "consumer1",
	consumer2: "consumer2",
	consumer3: "consumer3",
	consumer4: "consumer4",
	"battery-load1": "battery-load1",
	"battery-load2": "battery-load2"
};
function ne(e) {
	return "use-" + e.slice(2);
}
var j = 92 / f;
function M(e, t, n = 51) {
	let { topInner: r, botInner: i } = O(e), { col1: a, col2: o, col3: s, col4: c } = k(t), l = 38 * e / 125, u = n + 38 * t / 145;
	return [
		{
			id: "p-solar-home",
			p0: [o + 12, r],
			p1: [o + 12, r + l],
			p2: [s - u, 173],
			p3: [s - n, 173]
		},
		{
			id: "p-solar-grid",
			p0: [o - 12, r],
			p1: [o - 12, r + l],
			p2: [a + u, 173],
			p3: [a + n, 173]
		},
		{
			id: "p-bat-home",
			p0: [o + 12, i],
			p1: [o + 12, i - l],
			p2: [s - u, 197],
			p3: [s - n, 197]
		},
		{
			id: "p-bat-grid",
			p0: [o - 12, i],
			p1: [o - 12, i - l],
			p2: [a + u, 197],
			p3: [a + n, 197]
		},
		{
			id: "p-home-consumer4",
			p0: [s + n, 197],
			p1: [s + u, 197],
			p2: [c - 12, i - l],
			p3: [c - 12, i]
		},
		{
			id: "p-home-consumer3",
			p0: [s + n, 173],
			p1: [s + u, 173],
			p2: [c - 12, r + l],
			p3: [c - 12, r]
		}
	];
}
var N = "\n:host { display: block; }\n/* Fill the host box in both dimensions; preserveAspectRatio=\"meet\" (the SVG\n   default) keeps the diagram centered and uncropped. The host gets a natural\n   aspect-ratio (set from the viewBox) so that, when no explicit height is\n   given, the height still follows the width as before. */\n.flow-svg { width: 100%; height: 100%; display: block; }\n\n.track {\n  fill: none;\n  stroke: currentColor;\n  stroke-width: 1;\n  opacity: 0.15;\n  transition: stroke 0.35s ease, opacity 0.35s ease;\n}\n/* Highlighted while its leg is actively carrying power — same color as the\n   dot traveling along it, at a lower opacity so the dot still stands out. */\n.track.active {\n  stroke: var(--track-color, currentColor);\n  opacity: 0.5;\n}\n/* options.trackPulse (default off — see PowerFlowSettings): a gentle\n   brightness breathing on top of the traveling dot(s), purely a filter\n   animation so it layers on top of .track.active's own stroke/opacity\n   without fighting over the same properties. animation-duration is set\n   per-track in JS (the \"Track coloring\" pass in core.ts's update()),\n   scaled from that track's own flow speed — never here, since a single\n   fixed duration couldn't reflect each leg's own load. */\n.track-pulse .track.active {\n  animation: pf-track-pulse 1.2s ease-in-out infinite;\n}\n@keyframes pf-track-pulse {\n  0%, 100% {\n    opacity: 0.5;\n    stroke-width: 1;\n    filter: brightness(1) drop-shadow(0 0 0 transparent);\n  }\n  50% {\n    opacity: 0.75;\n    stroke-width: 1.1;\n    filter: brightness(1.0) drop-shadow(0 0 2px var(--track-color, currentColor));\n  }\n}\n\n.dot {\n  stroke-width: 4;\n  transition: r 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);\n}\n.dot.shrunk {\n  r: 0;\n  transition: r 0.18s ease-in;\n}\n.dot.solar { fill: var(--sfd-solar); stroke: var(--sfd-solar); }\n.dot.grid { fill: var(--sfd-grid-in); stroke: var(--sfd-grid-in); }\n.dot.battery-out { fill: var(--sfd-battery-out); stroke: var(--sfd-battery-out); }\n.dot.consumer1 { fill: var(--sfd-consumer1); stroke: var(--sfd-consumer1); }\n.dot.consumer2 { fill: var(--sfd-consumer2); stroke: var(--sfd-consumer2); }\n.dot.consumer3 { fill: var(--sfd-consumer3); stroke: var(--sfd-consumer3); }\n.dot.consumer4 { fill: var(--sfd-consumer4); stroke: var(--sfd-consumer4); }\n.dot.battery-load1 { fill: var(--sfd-battery-load1); stroke: var(--sfd-battery-load1); }\n.dot.battery-load2 { fill: var(--sfd-battery-load2); stroke: var(--sfd-battery-load2); }\n\n/* Oriented dot variants (dotShape: 'triangle' | 'bolt' | 'chevron' |\n   'spark') — a shaped marker instead of a plain stroked circle; the\n   surrounding <g> carries position+rotation as a JS-set transform attribute\n   every frame, so the pop-in/out shrink transition below lives on the shape\n   itself (a CSS transform on the <g> would win over its attribute and\n   silently break the positioning). All four share the same shrink\n   transition, differing only in whether the shape itself is filled\n   (triangle/bolt/spark) or stroked (chevron — a thin \"›\" reads better\n   stroked than as a sliver of fill). \"miter\" (not the usual \"round\") on\n   chevron's join keeps its point crisp instead of blunting it into a soft\n   bump that reads as a scribble at this size — \"round\" stays on its\n   open-path caps, so those ends still taper off gently. */\n.dot.dot-tri, .dot.dot-bolt, .dot.dot-spark { stroke: none; stroke-width: 0; }\n.dot.dot-chevron { fill: none; stroke-width: 2; stroke-linecap: round; stroke-linejoin: miter; }\n.dot-tri, .dot-bolt, .dot-chevron, .dot-spark {\n  transform: scale(1);\n  transition: transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);\n}\n.dot-tri.shrunk, .dot-bolt.shrunk, .dot-chevron.shrunk, .dot-spark.shrunk {\n  transform: scale(0);\n  transition: transform 0.18s ease-in;\n}\n\n.node { transition: opacity 0.35s ease; }\n/* rx/ry are what actually switch a node's shape (see nodeShapeRect() above\n   and applyNodeShape() in core.ts) — animated the same way fill/stroke\n   already are, so toggling options.nodeShape morphs circle<->square rather\n   than snapping. */\n.node-bg { stroke: none; transition: fill 0.35s ease, rx 0.35s ease, ry 0.35s ease; }\n.node-ring { fill: none; stroke-width: 2.5; transition: stroke 0.35s ease, rx 0.35s ease, ry 0.35s ease; }\n.node-icon { transition: fill 0.35s ease; }\n/* iconStyle: 'full' — the icon fills most of the node as a dimmed background\n   so the value/label text stays legible on top. */\n.node-icon.node-icon-full { opacity: 0.22; }\n.node.dim { opacity: 0.3; }\n\n.home-arc {\n  fill: none;\n  stroke-width: 4;\n  transition: stroke-dasharray 0.4s, stroke-dashoffset 0.4s;\n}\n.home-arc.solar-arc { stroke: var(--sfd-solar); }\n/* The battery arcs show the battery feeding the home / an export — discharging. */\n.home-arc.bat-arc { stroke: var(--sfd-battery-out); }\n.home-arc.grid-arc { stroke: var(--sfd-grid-in); }\n\n/* Battery charge/discharge highlight — a bright white \"comet\" (a three-blur-\n   radius head — bloom/glow/core — with a smoothly tapering tail, see\n   batteryCometMarkup() above) that spins around the same ring as\n   bat-soc-arc, masked to its drawn extent (see the battery node markup and\n   applyBatteryHighlight() in core.ts). Modeled on the classic conic-gradient\n   spinner pattern (a rotating sliver that fades smoothly into transparent,\n   duplicated with blur for glow) — SVG has no conic-gradient, and a stroke\n   gradient can't easily stay attached to a shape animated via\n   stroke-dashoffset (the gradient's own coordinates don't travel with it),\n   so the fade is approximated instead by many thin trailing bands (see\n   BATTERY_COMET_LAYERS above).\n   The spin itself is driven from core.ts's own rAF loop (tick()), setting\n   each layer's stroke-dashoffset directly every frame from a continuously\n   advancing phase — deliberately *not* a plain CSS animation (as this used\n   to be): a CSS animation's speed can only change via its animation-\n   duration, and rebinding that custom property on a *running* animation\n   makes the browser reinterpret the already-elapsed time against the new\n   duration, snapping the comet to a different position the instant the\n   charge/discharge rate changes (exactly the SMIL-restart problem the flow\n   dots avoid the same way — see the \"dots\" field comment in core.ts). A\n   continuously-accumulated phase has no such snap: a speed change just\n   changes how fast it climbs from here, same as the dots.\n   Deliberately near-white rather than the battery's own accent color — an\n   overlay in the *same* hue as the ring it travels over reads as a dim\n   smudge more than a highlight; a near-white pops against any accent color\n   and against both themes, the same way a light-sweep glint would. Charging\n   and discharging use two different near-white tints (cool vs. warm — see\n   --bat-comet-color below) rather than literally the same white, so the\n   highlight itself also reads as \"energy in\" vs. \"energy out\" at a glance,\n   not just the ring color underneath it. */\n.bat-charge-highlight-group {\n  --bat-comet-color: #eef6ff; /* charging: cool white-blue, like an electric spark */\n  opacity: 0;\n  transition: opacity 0.3s ease;\n}\n.bat-charge-highlight-group.active { opacity: 1; }\n.bat-charge-highlight-group.discharging {\n  --bat-comet-color: #ffe0ad; /* discharging: warm amber-white, like heat leaving */\n}\n.bat-charge-bloom, .bat-charge-glow, .bat-charge-core, .bat-charge-tail {\n  fill: none;\n  stroke: var(--bat-comet-color);\n  stroke-linecap: round;\n}\n/* Three stacked blur radii at the head (wide/faint → narrow/sharp) read as\n   a much richer bloom than a single blurred layer would — closer to how a\n   real glow actually falls off with distance. */\n.bat-charge-bloom {\n  stroke-width: 20;\n  opacity: 0.16;\n  filter: blur(8px);\n}\n.bat-charge-glow {\n  stroke-width: 11;\n  opacity: 0.55;\n  filter: blur(3px);\n}\n.bat-charge-core {\n  stroke-width: 4;\n  opacity: 1;\n}\n\n.val-text { font-size: 14px; text-anchor: middle; fill: currentColor; font-weight: 700; }\n/* t-grid-val/t-bat-watts are colored with their own live accent (import/\n   export, charge/discharge — see core.ts) rather than the neutral\n   currentColor every other value text uses, so they can blend into a\n   same-hue background (their own node's tint in 'soft'/'tonal', or a\n   similarly-colored track/dot passing behind them in 'outline'). A soft\n   dark shadow (the same technique as .text-on-full, just lighter — this\n   text sits on a much less busy background than full-size icon mode does)\n   keeps them legible without depending on nodeStyle or theme. Applied\n   unconditionally in the markup below rather than toggled in JS, since it's\n   a permanent property of *which* text this is, not a mode-dependent state\n   — it stays alongside .node-filled-ink's own drop-shadow in 'filled' mode\n   without conflicting (different CSS mechanism, and imperceptible next to\n   that stronger shadow). */\n.val-text-accent { text-shadow: 0 1px 2px rgba(0, 0, 0, 0.45), 0 1px 4px rgba(0, 0, 0, 0.3); }\n.lbl-text {\n  font-size: 11px;\n  text-anchor: middle;\n  fill: currentColor;\n  opacity: 0.75;\n  font-weight: 500;\n  letter-spacing: 0.04em;\n}\n/* iconStyle: 'full' — sits over a large dimmed icon instead of plain\n   background, so a drop shadow helps it stay legible. Font-size itself is\n   set directly in JS (applyIconStyle()), not here, since t-bat-watts already\n   carries its own inline font-size that a CSS rule couldn't override. */\n.text-on-full { text-shadow: 0 1px 3px rgba(0, 0, 0, 0.7), 0 1px 6px rgba(0, 0, 0, 0.5); }\n/* nodeStyle: 'filled' — icon/text are painted one uniform color (not a\n   per-node contrast pick) regardless of the node's own accent color, so\n   legibility against that arbitrary accent comes from this shadow instead.\n   Uses the drop-shadow filter rather than text-shadow so one class works on\n   both the icon path and the value/label text elements. */\n.node-filled-ink { filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.55)) drop-shadow(0 1px 5px rgba(0, 0, 0, 0.35)); }\n", P = O(125), F = k(145), I = (e) => `M${e.p0[0]},${e.p0[1]} C${e.p1[0]},${e.p1[1]} ${e.p2[0]},${e.p2[1]} ${e.p3[0]},${e.p3[1]}`, [L, R, z, B, V, re] = M(125, 145);
function H(e, t, n, r) {
	return `<rect x="${e - 52}" y="${t - 52}" width="104" height="104" rx="52" ry="52" class="${n}" id="${r}" />`;
}
function ie(e) {
	let t = 2 * e / f, n = t / 2;
	return [
		[-n, -e],
		[n, -e],
		[t, 0],
		[n, e],
		[-n, e],
		[-t, 0]
	];
}
var ae = 104 / f;
function oe(e, t, n = 52) {
	return ie(n).map(([n, r]) => `${e + n},${t + r}`).join(" ");
}
function se(e, t, n = 47) {
	let [r, i, a, o, s, c] = ie(n);
	return [
		[0, -n],
		i,
		a,
		o,
		s,
		c,
		r
	].map(([n, r]) => `${e + n},${t + r}`).join(" ");
}
function U(e, t, n, r) {
	return `<polygon points="${oe(e, t)}" class="${n}" id="${r}" style="display: none" />`;
}
var ce = `
<svg class="flow-svg" xmlns="${d}">
  <defs>
    <path id="p-solar-home" d="${I(L)}" />
    <path id="p-solar-grid" d="${I(R)}" />
    <path id="p-grid-home" d="M${F.col1 + 52},185 H${F.col3 - 52}" />
    <path id="p-bat-home" d="${I(z)}" />
    <path id="p-bat-grid" d="${I(B)}" />
    <path id="p-solar-bat" d="M${F.col2},${P.topInner} V${P.botInner}" />
    <!-- consumer1 is the top-left slot (${F.col3},${P.topY}), consumer2 the
         bottom-left slot (${F.col3},${P.botY}) — swapped from a naive
         1=bottom/2=top numbering so consumer1/2 read top-to-bottom like
         consumer3/4 do. Both always share home's own column (HOME_COL_X),
         so this track is unaffected by columnGap. -->
    <path id="p-home-consumer1" d="M${F.col3},133 V${P.topInner}" />
    <path id="p-home-consumer2" d="M${F.col3},237 V${P.botInner}" />
    <!-- Home's 4th consumer, bottom-right (${F.col4},${P.botY}). Home and
         this node sit exactly (${F.col4 - F.col3},${P.botY - 185})
         apart — the same offset as grid and battery — so this is literally
         the p-bat-grid curve, reversed (that one runs battery→grid, we need
         the grid→battery direction) and translated to the grid→home /
         battery→consumer4 offset. Every control point stays at
         y ≤ ${P.botInner} (consumer2/batteryLoad2's own top edge at
         ${F.col3},${P.botY}), so the curve's convex hull stays entirely
         clear of that node. -->
    <path id="p-home-consumer4" d="${I(V)}" />
    <!-- Home's 3rd consumer, top-right (${F.col4},${P.topY}) — the same
         curve as p-home-consumer4, mirrored vertically around home's own row
         (y=185: y' = 370 − y), so it stays clear of
         consumer1 (${F.col3},${P.topY}) the same way consumer4's curve stays
         clear of consumer2/batteryLoad2 (${F.col3},${P.botY}). -->
    <path id="p-home-consumer3" d="${I(re)}" />
    <!-- batteryLoad1 always sits in the always-free (${F.col1},${P.botY})
         slot beside the battery. batteryLoad2 shares the
         (${F.col3},${P.botY}) slot with consumer2 — see the slot-conflict
         indicator below. -->
    <path id="p-bat-batteryload1" d="M${F.col2 - 52},${P.botY} H${F.col1 + 52}" />
    <path id="p-bat-batteryload2" d="M${F.col2 + 52},${P.botY} H${F.col3 - 52}" />
    <!-- Masks the battery charge/discharge highlight (see the battery node
         below) to bat-soc-arc's own drawn extent — its dasharray is kept in
         sync with bat-soc-arc's every update (see applyBatteryHighlight() in
         core.ts), so the highlight only ever shows over the charged portion
         of the ring. stroke-width is wider than the highlight's own widest
         layer (the blurred glow) so that blur isn't clipped radially, and
         the mask itself is blurred so the angular (start/end) cutoff is a
         soft fade rather than a hard edge slicing through the comet's own
         blur whenever it passes near either end of the charged arc. -->
    <mask id="bat-soc-mask" maskUnits="userSpaceOnUse">
      ${g(F.col2, P.botY, "bat-soc-mask-arc", "fill=\"none\" stroke=\"#fff\" stroke-width=\"34\" style=\"filter: blur(7px)\"")}
      ${v(F.col2, P.botY, "bat-soc-mask-arc-square", "fill=\"none\" stroke=\"#fff\" stroke-width=\"34\" style=\"filter: blur(7px)\"")}
      ${y(F.col2, P.botY, "bat-soc-mask-arc-hex", "fill=\"none\" stroke=\"#fff\" stroke-width=\"34\" style=\"filter: blur(7px)\"")}
    </mask>
  </defs>

  <!-- Every track has an id (derived as "use-" + its path id minus the "p-"
       prefix) so it can be looked up and recolored when actively carrying
       flow (see the track-coloring pass in update()). The five below also
       carry a configurable topology edge (see FlowTopology) — their
       visibility is driven entirely in code via setEdge(), combining node
       presence with the matching topology flag, so they deliberately carry
       no data-topo grouping attribute. -->
  <use id="use-solar-home" href="#p-solar-home" class="track" />
  <use id="use-solar-grid" href="#p-solar-grid" class="track" />
  <use id="use-grid-home" href="#p-grid-home" class="track" />
  <use id="use-bat-home" href="#p-bat-home" class="track" />
  <use id="use-bat-grid" href="#p-bat-grid" class="track" />
  <use id="use-solar-bat" href="#p-solar-bat" class="track" />
  <use id="use-home-consumer1" href="#p-home-consumer1" class="track" data-topo="consumer1" />
  <use id="use-home-consumer2" href="#p-home-consumer2" class="track" data-topo="consumer2" />
  <use id="use-home-consumer3" href="#p-home-consumer3" class="track" data-topo="consumer3" />
  <use id="use-home-consumer4" href="#p-home-consumer4" class="track" data-topo="consumer4" />
  <use id="use-bat-batteryload1" href="#p-bat-batteryload1" class="track" data-topo="batteryLoad1" />
  <use id="use-bat-batteryload2" href="#p-bat-batteryload2" class="track" data-topo="batteryLoad2" />

  <!-- ── Solar (top, optional) ── -->
  <g id="n-solar" class="node" data-topo="solar">
    ${H(F.col2, P.topY, "node-bg", "solar-bg")}
    ${U(F.col2, P.topY, "node-bg", "solar-bg-hex")}
    ${H(F.col2, P.topY, "node-ring", "solar-ring")}
    ${U(F.col2, P.topY, "node-ring", "solar-ring-hex")}
    <path id="solar-icon" class="node-icon" transform="${D(F.col2, P.topY - 18, 28)}" d="${i}" />
    <text x="${F.col2}" y="${P.topY + 16}" class="val-text" id="t-solar-val"></text>
    <text x="${F.col2}" y="${P.topY + 29}" class="lbl-text" id="t-solar-lbl"></text>
  </g>

  <!-- ── Grid (left) ── -->
  <g class="node">
    ${H(F.col1, 185, "node-bg", "grid-bg")}
    ${U(F.col1, 185, "node-bg", "grid-bg-hex")}
    ${H(F.col1, 185, "node-ring", "grid-ring")}
    ${U(F.col1, 185, "node-ring", "grid-ring-hex")}
    <path id="grid-icon" class="node-icon" transform="${D(F.col1, 167, 28)}" d="${a}" />
    <text x="${F.col1}" y="201" class="val-text val-text-accent" id="t-grid-val"></text>
    <text x="${F.col1}" y="214" class="lbl-text" id="t-grid-lbl"></text>
  </g>

  <!-- ── Home (right) ── -->
  <g class="node">
    ${H(F.col3, 185, "node-bg", "home-bg")}
    ${U(F.col3, 185, "node-bg", "home-bg-hex")}
    ${H(F.col3, 185, "node-ring", "home-ring")}
    ${U(F.col3, 185, "node-ring", "home-ring-hex")}
    <path id="home-icon" class="node-icon" transform="${D(F.col3, 167, 28)}" d="${n}" />
    <text x="${F.col3}" y="201" class="val-text" id="t-home-val"></text>
    <text x="${F.col3}" y="214" class="lbl-text" id="t-home-lbl"></text>
  </g>

  <!-- Coverage rings for home/grid, drawn *after* (on top of) those two node
       bodies rather than inside either one — on top so nodeStyle: 'filled's
       opaque background doesn't blend/mute their color, and in their own
       group (not nested in any dimmable node) so a node's "dim" state can't
       fade them. The home ring shows how the load is sourced
       (solar/battery/grid); the grid ring shows how an export is sourced
       (solar/battery). Positioned at home/grid's own centers, so document
       order relative to nodes elsewhere on the diagram doesn't matter. Only
       the grid-side rings (garc-*) move with columnGap — home's column is
       fixed, so arc-*'s never need repositioning. -->
  <g>
    ${g(F.col3, 185, "arc-solar", "class=\"home-arc solar-arc\"")}
    ${v(F.col3, 185, "arc-solar-square", "class=\"home-arc solar-arc\"")}
    ${y(F.col3, 185, "arc-solar-hex", "class=\"home-arc solar-arc\"")}
    ${g(F.col3, 185, "arc-bat", "class=\"home-arc bat-arc\"")}
    ${v(F.col3, 185, "arc-bat-square", "class=\"home-arc bat-arc\"")}
    ${y(F.col3, 185, "arc-bat-hex", "class=\"home-arc bat-arc\"")}
    ${g(F.col3, 185, "arc-grid", "class=\"home-arc grid-arc\"")}
    ${v(F.col3, 185, "arc-grid-square", "class=\"home-arc grid-arc\"")}
    ${y(F.col3, 185, "arc-grid-hex", "class=\"home-arc grid-arc\"")}
    ${g(F.col1, 185, "garc-solar", "class=\"home-arc solar-arc\"")}
    ${v(F.col1, 185, "garc-solar-square", "class=\"home-arc solar-arc\"")}
    ${y(F.col1, 185, "garc-solar-hex", "class=\"home-arc solar-arc\"")}
    ${g(F.col1, 185, "garc-bat", "class=\"home-arc bat-arc\"")}
    ${v(F.col1, 185, "garc-bat-square", "class=\"home-arc bat-arc\"")}
    ${y(F.col1, 185, "garc-bat-hex", "class=\"home-arc bat-arc\"")}
  </g>

  <!-- ── House consumer 1 (above the house, optional) ── -->
  <g id="n-consumer1" class="node" data-topo="consumer1">
    ${H(F.col3, P.topY, "node-bg", "c1-bg")}
    ${U(F.col3, P.topY, "node-bg", "c1-bg-hex")}
    ${H(F.col3, P.topY, "node-ring", "c1-ring")}
    ${U(F.col3, P.topY, "node-ring", "c1-ring-hex")}
    <path id="c1-icon" class="node-icon" transform="${D(F.col3, P.topY - 18, 28)}" d="${r}" />
    <text x="${F.col3}" y="${P.topY + 16}" class="val-text" id="t-c1-val"></text>
    <text x="${F.col3}" y="${P.topY + 29}" class="lbl-text" id="t-c1-lbl"></text>
  </g>

  <!-- ── House consumer 3 (top-right, optional) ── -->
  <g id="n-consumer3" class="node" data-topo="consumer3">
    ${H(F.col4, P.topY, "node-bg", "c3-bg")}
    ${U(F.col4, P.topY, "node-bg", "c3-bg-hex")}
    ${H(F.col4, P.topY, "node-ring", "c3-ring")}
    ${U(F.col4, P.topY, "node-ring", "c3-ring-hex")}
    <path id="c3-icon" class="node-icon" transform="${D(F.col4, P.topY - 18, 28)}" d="${r}" />
    <text x="${F.col4}" y="${P.topY + 16}" class="val-text" id="t-c3-val"></text>
    <text x="${F.col4}" y="${P.topY + 29}" class="lbl-text" id="t-c3-lbl"></text>
  </g>

  <!-- ── Battery (bottom, optional) ── -->
  <g id="n-battery" class="node" data-topo="battery">
    ${H(F.col2, P.botY, "node-bg", "bat-bg")}
    ${U(F.col2, P.botY, "node-bg", "bat-bg-hex")}
    ${g(F.col2, P.botY, "bat-soc-arc", "class=\"home-arc\"")}
    ${v(F.col2, P.botY, "bat-soc-arc-square", "class=\"home-arc\"")}
    ${y(F.col2, P.botY, "bat-soc-arc-hex", "class=\"home-arc\"")}
    <!-- Charge/discharge highlight — a glowing comet built by
         batteryCometMarkup() above (a three-blur-radius bloom/glow/core head
         plus a smoothly tapering multi-band tail) that travels around the
         same ring as bat-soc-arc, masked to bat-soc-arc's own drawn extent
         (bat-soc-mask mirrors its dasharray every update — see
         applyBatteryHighlight() in core.ts) so the comet is only ever
         visible over the charged portion of the ring, not the undrawn
         remainder. Same start angle (12 o'clock) and winding direction as
         bat-soc-arc, so "clockwise" means the same thing for both. -->
    <g id="bat-charge-highlight-group" class="bat-charge-highlight-group" mask="url(#bat-soc-mask)">
      ${E(F.col2, P.botY)}
    </g>
    ${H(F.col2, P.botY, "node-ring", "bat-ring")}
    ${U(F.col2, P.botY, "node-ring", "bat-ring-hex")}
    <path id="bat-icon" class="node-icon" transform="${D(F.col2, P.botY - 27, 28)}" d="${t}" />
    <text x="${F.col2}" y="${P.botY + 5}" class="val-text" id="t-bat-soc"></text>
    <text x="${F.col2}" y="${P.botY + 18}" class="val-text val-text-accent" id="t-bat-watts" style="font-size: 11px; opacity: 0.75"></text>
    <text x="${F.col2}" y="${P.botY + 31}" class="lbl-text" id="t-bat-lbl"></text>
  </g>

  <!-- ── House consumer 2 (below the house, optional) ── -->
  <g id="n-consumer2" class="node" data-topo="consumer2">
    ${H(F.col3, P.botY, "node-bg", "c2-bg")}
    ${U(F.col3, P.botY, "node-bg", "c2-bg-hex")}
    ${H(F.col3, P.botY, "node-ring", "c2-ring")}
    ${U(F.col3, P.botY, "node-ring", "c2-ring-hex")}
    <path id="c2-icon" class="node-icon" transform="${D(F.col3, P.botY - 18, 28)}" d="${r}" />
    <text x="${F.col3}" y="${P.botY + 16}" class="val-text" id="t-c2-val"></text>
    <text x="${F.col3}" y="${P.botY + 29}" class="lbl-text" id="t-c2-lbl"></text>
  </g>

  <!-- ── House consumer 4 (bottom-right, optional) ── -->
  <g id="n-consumer4" class="node" data-topo="consumer4">
    ${H(F.col4, P.botY, "node-bg", "c4-bg")}
    ${U(F.col4, P.botY, "node-bg", "c4-bg-hex")}
    ${H(F.col4, P.botY, "node-ring", "c4-ring")}
    ${U(F.col4, P.botY, "node-ring", "c4-ring-hex")}
    <path id="c4-icon" class="node-icon" transform="${D(F.col4, P.botY - 18, 28)}" d="${r}" />
    <text x="${F.col4}" y="${P.botY + 16}" class="val-text" id="t-c4-val"></text>
    <text x="${F.col4}" y="${P.botY + 29}" class="lbl-text" id="t-c4-lbl"></text>
  </g>

  <!-- ── Battery load 1 (beside the battery, optional) — always fits in the
       bottom row, no matter which other optional nodes are shown. ── -->
  <g id="n-batteryload1" class="node" data-topo="batteryLoad1">
    ${H(F.col1, P.botY, "node-bg", "bl1-bg")}
    ${U(F.col1, P.botY, "node-bg", "bl1-bg-hex")}
    ${H(F.col1, P.botY, "node-ring", "bl1-ring")}
    ${U(F.col1, P.botY, "node-ring", "bl1-ring-hex")}
    <path id="bl1-icon" class="node-icon" transform="${D(F.col1, P.botY - 18, 28)}" d="${r}" />
    <text x="${F.col1}" y="${P.botY + 16}" class="val-text" id="t-bl1-val"></text>
    <text x="${F.col1}" y="${P.botY + 29}" class="lbl-text" id="t-bl1-lbl"></text>
  </g>

  <!-- ── Battery load 2 (optional) — shares its slot (${F.col3},${P.botY})
       with consumer2; see the slot-conflict indicator below. ── -->
  <g id="n-batteryload2" class="node" data-topo="batteryLoad2">
    ${H(F.col3, P.botY, "node-bg", "bl2-bg")}
    ${U(F.col3, P.botY, "node-bg", "bl2-bg-hex")}
    ${H(F.col3, P.botY, "node-ring", "bl2-ring")}
    ${U(F.col3, P.botY, "node-ring", "bl2-ring-hex")}
    <path id="bl2-icon" class="node-icon" transform="${D(F.col3, P.botY - 18, 28)}" d="${r}" />
    <text x="${F.col3}" y="${P.botY + 16}" class="val-text" id="t-bl2-val"></text>
    <text x="${F.col3}" y="${P.botY + 29}" class="lbl-text" id="t-bl2-lbl"></text>
  </g>

  <!-- ── Slot conflict indicator (${F.col3},${P.botY}) — shown instead of
       both consumer2 and batteryLoad2 when a caller sets both at once (they
       share this position; see update()'s hasSlotConflict). Styled directly
       with fixed colors in JS rather than a FlowColors entry, since it
       signals a data misconfiguration rather than a themable flow. ── -->
  <g id="n-slot-conflict" class="node" data-topo="slotConflict">
    ${H(F.col3, P.botY, "node-bg", "conflict-bg")}
    ${U(F.col3, P.botY, "node-bg", "conflict-bg-hex")}
    ${H(F.col3, P.botY, "node-ring", "conflict-ring")}
    ${U(F.col3, P.botY, "node-ring", "conflict-ring-hex")}
    <path id="conflict-icon" class="node-icon" transform="${D(F.col3, P.botY - 18, 28)}" d="${e}" />
    <text x="${F.col3}" y="${P.botY + 16}" class="val-text" id="t-conflict-val">Conflict</text>
    <text x="${F.col3}" y="${P.botY + 29}" class="lbl-text" id="t-conflict-desc">Hover for details</text>
    <title id="conflict-title">consumer2 and batteryLoad2 cannot both be set — they share the same position. See the "Consumer slot layout" section of the README.</title>
  </g>

  <!-- Dots are drawn last (on top of every node) — a track's path runs all
       the way to its endpoint node's own edge, so a marker sitting at either
       end of its travel is centered right on that edge. Painted earlier (as
       these used to be, before the node bodies), the opaque node background
       would cover the half of the marker that overlaps the node's circle —
       worst for the oriented shapes (triangle/bolt/chevron/spark),
       whose leading edge points into the node and so is the first (and most
       visible) part clipped away. -->
  ${ee.map((e) => Array.from({ length: 8 }, (t, n) => `<circle id="dot-${e.id}-${n}" r="2" class="dot ${e.cls}" vector-effect="non-scaling-stroke" />
  ${A.map((t) => `<g id="dot-${t.idPrefix}-${e.id}-${n}" class="${t.wrapClass}">
    ${t.inner(e.cls)}
  </g>`).join("\n  ")}`).join("\n  ")).join("\n  ")}
</svg>
`;
//#endregion
//#region src/core.ts
function W(e) {
	return Math.abs(e) >= 1e3 ? `${(e / 1e3).toFixed(1)} kW` : `${Math.round(e)} W`;
}
function G(e, t = 15) {
	return `color-mix(in srgb, ${e} ${t}%, transparent)`;
}
var K = "#fff", q = class e {
	static CONFLICT_COLOR = "#ef4444";
	static TRACK_PULSE_BASE_PX = 260;
	static TRACK_PULSE_MIN_S = .35;
	static TRACK_PULSE_MAX_S = 2.2;
	static ICON_LAYOUT_NODES = [
		{
			prefix: "solar",
			icon: "solar-icon",
			texts: ["t-solar-val", "t-solar-lbl"]
		},
		{
			prefix: "grid",
			icon: "grid-icon",
			texts: ["t-grid-val", "t-grid-lbl"]
		},
		{
			prefix: "home",
			icon: "home-icon",
			texts: ["t-home-val", "t-home-lbl"]
		},
		{
			prefix: "bat",
			icon: "bat-icon",
			texts: [
				"t-bat-soc",
				"t-bat-watts",
				"t-bat-lbl"
			]
		},
		{
			prefix: "c1",
			icon: "c1-icon",
			texts: ["t-c1-val", "t-c1-lbl"]
		},
		{
			prefix: "c2",
			icon: "c2-icon",
			texts: ["t-c2-val", "t-c2-lbl"]
		},
		{
			prefix: "c3",
			icon: "c3-icon",
			texts: ["t-c3-val", "t-c3-lbl"]
		},
		{
			prefix: "c4",
			icon: "c4-icon",
			texts: ["t-c4-val", "t-c4-lbl"]
		},
		{
			prefix: "bl1",
			icon: "bl1-icon",
			texts: ["t-bl1-val", "t-bl1-lbl"]
		},
		{
			prefix: "bl2",
			icon: "bl2-icon",
			texts: ["t-bl2-val", "t-bl2-lbl"]
		},
		{
			prefix: "conflict",
			icon: "conflict-icon",
			texts: ["t-conflict-val", "t-conflict-desc"]
		}
	];
	iconLayoutCache = {};
	root;
	svg;
	el = {};
	colors = o;
	labels = s;
	icons = { ...c };
	topology = l;
	speedScale = 1;
	nodeStyle = "soft";
	nodeShape = "circle";
	ringPerimeter = p;
	ringStartFraction = .75;
	iconStyle = "default";
	dotShape = "circle";
	dotCount = 1;
	curveBend = 1;
	rowGap = 125;
	columnGap = 145;
	batteryChargeHighlight = !0;
	trackPulse = !1;
	hadSlotConflict = !1;
	dots = {};
	raf = 0;
	lastTime = 0;
	batteryCometLayers = [];
	batteryCometPhase = 0;
	batteryCometSpeed = 0;
	batteryCometDirection = 1;
	constructor(e, t) {
		this.root = e.shadowRoot ?? e.attachShadow({ mode: "open" }), this.root.innerHTML = `<style>${N}</style>${ce}`, this.svg = this.root.querySelector("svg"), this.cacheRefs(), this.initDots(), this.initBatteryComet(), this.cacheIconLayouts(), this.update(t), this.lastTime = performance.now(), this.raf = requestAnimationFrame(this.tick);
	}
	cacheRefs() {
		this.svg.querySelectorAll("[id]").forEach((e) => {
			this.el[e.id] = e;
		});
	}
	initDots() {
		for (let e of ee) {
			let t = this.svg.querySelector(`#${e.path}`), n = [];
			for (let t = 0; t < 8; t++) {
				let r = this.el[`dot-${e.id}-${t}`];
				r.style.display = "none";
				let i = {};
				for (let { shape: n, idPrefix: r } of A) {
					let a = this.el[`dot-${r}-${e.id}-${t}`];
					a.style.display = "none", i[n] = {
						group: a,
						shrinkEl: a.firstElementChild
					};
				}
				n.push({
					circle: r,
					oriented: i,
					active: !1,
					shrinking: !1,
					prevFrac: 0,
					lapPopped: !1
				});
			}
			this.dots[e.id] = {
				path: t,
				length: t.getTotalLength(),
				speed: 0,
				visible: !1,
				reverse: e.reverse ?? !1,
				phase: Math.random(),
				maxDots: e.maxDots ?? 8,
				markers: n
			};
		}
	}
	initBatteryComet() {
		let e = this.ringShapeSuffix();
		this.batteryCometLayers = T.map(({ id: t, delay: n }) => ({
			el: this.el[`${t}${e}`],
			delay: n
		})).filter((e) => e.el);
	}
	activeMarker(e) {
		return this.dotShape === "circle" ? e.circle : e.oriented[this.dotShape].group;
	}
	shrinkTarget(e) {
		return this.dotShape === "circle" ? e.circle : e.oriented[this.dotShape].shrinkEl;
	}
	cacheIconLayouts() {
		for (let { prefix: t, icon: n, texts: r } of e.ICON_LAYOUT_NODES) {
			let e = this.el[n];
			this.iconLayoutCache[t] = {
				iconTransform: e?.getAttribute("transform") ?? "",
				textY: r.map((e) => this.el[e]?.getAttribute("y") ?? "0"),
				textFontSize: r.map((e) => this.el[e]?.style.fontSize ?? "")
			};
		}
	}
	static bumpedFontSize(e, t) {
		return `${((parseFloat(t) || (e.classList.contains("val-text") ? 14 : 11)) * 1.15).toFixed(1)}px`;
	}
	applyIconStyle() {
		for (let { prefix: t, icon: n, texts: r } of e.ICON_LAYOUT_NODES) {
			let i = this.el[n], a = r.map((e) => this.el[e]), o = this.iconLayoutCache[t];
			if (this.iconStyle === "default") {
				i?.setAttribute("transform", o.iconTransform), i?.classList.remove("node-icon-full"), a.forEach((e, t) => {
					e?.setAttribute("y", o.textY[t]), e && (e.style.fontSize = o.textFontSize[t]), e?.classList.remove("text-on-full");
				});
				continue;
			}
			let s = this.el[`${t}-bg`];
			if (!s) continue;
			let c = Number(s.getAttribute("width")), l = Number(s.getAttribute("x")) + c / 2, u = Number(s.getAttribute("y")) + c / 2, d = c / 2 * 1.5;
			i?.setAttribute("transform", `translate(${l - d / 2} ${u - d / 2}) scale(${d / 24})`), i?.classList.add("node-icon-full");
			let f = u - (a.length - 1) * 13 / 2 + 4;
			a.forEach((t, n) => {
				t?.setAttribute("y", String(f + n * 13)), t && (t.style.fontSize = e.bumpedFontSize(t, o.textFontSize[n])), t?.classList.add("text-on-full");
			});
		}
	}
	static nodeXY(t, n, r) {
		let i = e.TOP_ROW_PREFIXES.includes(t) ? n.topY : e.BOTTOM_ROW_PREFIXES.includes(t) ? n.botY : 185;
		return [{
			grid: r.col1,
			solar: r.col2,
			home: r.col3,
			c1: r.col3,
			c2: r.col3,
			c3: r.col4,
			c4: r.col4,
			bat: r.col2,
			bl1: r.col1,
			bl2: r.col3,
			conflict: r.col3
		}[t] ?? r.col3, i];
	}
	static TOP_ROW_PREFIXES = [
		"solar",
		"c1",
		"c3"
	];
	static BOTTOM_ROW_PREFIXES = [
		"bat",
		"c2",
		"c4",
		"bl1",
		"bl2",
		"conflict"
	];
	setPathD(e, t) {
		this.el[e]?.setAttribute("d", t);
	}
	repositionRingVariants(e, t, n) {
		let r = this.el[e];
		r?.setAttribute("x", String(t - 47)), r?.setAttribute("y", String(n - 47)), r?.setAttribute("transform", `rotate(-90 ${t} ${n})`), this.el[`${e}-square`]?.setAttribute("points", _(t, n)), this.el[`${e}-hex`]?.setAttribute("points", se(t, n));
	}
	applyLayout() {
		let t = O(this.rowGap), n = k(this.columnGap);
		for (let { prefix: r, texts: i } of e.ICON_LAYOUT_NODES) {
			let [a, o] = e.nodeXY(r, t, n), s = this.el[`${r}-bg`];
			s?.setAttribute("x", String(a - 52)), s?.setAttribute("y", String(o - 52));
			let c = this.el[`${r}-ring`];
			c?.setAttribute("x", String(a - 52)), c?.setAttribute("y", String(o - 52));
			let l = oe(a, o);
			this.el[`${r}-bg-hex`]?.setAttribute("points", l), this.el[`${r}-ring-hex`]?.setAttribute("points", l);
			for (let e of i) this.el[e]?.setAttribute("x", String(a));
			let u = this.iconLayoutCache[r];
			if (!u) continue;
			let d = r === "bat", f = d ? 27 : 18, p = d ? [
				5,
				18,
				31
			] : [16, 29];
			this.iconLayoutCache[r] = {
				...u,
				iconTransform: D(a, o - f, 28),
				textY: p.map((e) => String(o + e))
			};
		}
		for (let e of ["garc-solar", "garc-bat"]) this.repositionRingVariants(e, n.col1, 185);
		for (let e of [
			"bat-soc-arc",
			"bat-soc-mask-arc",
			...T.map((e) => e.id)
		]) this.repositionRingVariants(e, n.col2, t.botY);
		let r = this.nodeShape === "hexagon" ? ae : 52;
		this.setPathD("p-grid-home", `M${n.col1 + r},185 H${n.col3 - r}`), this.setPathD("p-solar-bat", `M${n.col2},${t.topInner} V${t.botInner}`), this.setPathD("p-home-consumer1", `M${n.col3},133 V${t.topInner}`), this.setPathD("p-home-consumer2", `M${n.col3},237 V${t.botInner}`), this.setPathD("p-bat-batteryload1", `M${n.col2 - r},${t.botY} H${n.col1 + r}`), this.setPathD("p-bat-batteryload2", `M${n.col2 + r},${t.botY} H${n.col3 - r}`);
	}
	static CURVE_BEND_MAX = 2.5;
	applyCurveBend() {
		let t = this.curveBend / e.CURVE_BEND_MAX, n = this.nodeShape === "hexagon" ? j : void 0;
		for (let { id: e, p0: r, p1: i, p3: a } of M(this.rowGap, this.columnGap, n)) {
			let n = this.el[e];
			if (!n) continue;
			let o = r[0] === i[0] ? [r[0], a[1]] : [a[0], r[1]], s = [(r[0] + a[0]) / 2, (r[1] + a[1]) / 2], c, l, u;
			if (t <= .5) {
				let e = t / .5;
				c = [o[0] + e * (r[0] - o[0]), o[1] + e * (r[1] - o[1])], l = [o[0] + e * (a[0] - o[0]), o[1] + e * (a[1] - o[1])], u = o;
			} else {
				let e = (t - .5) / .5;
				c = r, l = a, u = [o[0] + e * (s[0] - o[0]), o[1] + e * (s[1] - o[1])];
			}
			let d = `M${r[0]},${r[1]} L${c[0]},${c[1]} Q${u[0]},${u[1]} ${l[0]},${l[1]} L${a[0]},${a[1]}`;
			n.setAttribute("d", d);
		}
		for (let e in this.dots) {
			let t = this.dots[e];
			t.length = t.path.getTotalLength();
		}
	}
	static COVERAGE_RING_IDS = [
		"arc-solar",
		"arc-bat",
		"arc-grid",
		"garc-solar",
		"garc-bat",
		"bat-soc-arc"
	];
	applyRingShadow() {
		let t = this.nodeStyle === "filled";
		for (let n of e.COVERAGE_RING_IDS) for (let e of [
			"",
			"-square",
			"-hex"
		]) this.el[`${n}${e}`]?.classList.toggle("node-filled-ink", t);
	}
	applyNodeShape() {
		let t = this.nodeShape === "circle" ? "52" : "0", n = this.nodeShape === "hexagon";
		for (let { prefix: r } of e.ICON_LAYOUT_NODES) for (let e of ["bg", "ring"]) {
			let i = this.el[`${r}-${e}`];
			i?.setAttribute("rx", t), i?.setAttribute("ry", t), i && (i.style.display = n ? "none" : "");
			let a = this.el[`${r}-${e}-hex`];
			a && (a.style.display = n ? "" : "none");
		}
	}
	static RING_IDS = [
		"arc-solar",
		"arc-bat",
		"arc-grid",
		"garc-solar",
		"garc-bat",
		"bat-soc-arc",
		"bat-soc-mask-arc"
	];
	ringShapeSuffix() {
		return this.nodeShape === "square" ? "-square" : this.nodeShape === "hexagon" ? "-hex" : "";
	}
	applyRingShape() {
		let t = this.ringShapeSuffix();
		this.ringPerimeter = this.nodeShape === "square" ? 376 : this.nodeShape === "hexagon" ? h : p, this.ringStartFraction = this.nodeShape === "circle" ? .75 : 0;
		for (let n of e.RING_IDS) for (let e of [
			"",
			"-square",
			"-hex"
		]) {
			let r = this.el[`${n}${e}`];
			r && (r.style.display = e === t ? "" : "none");
		}
		for (let { id: e } of T) for (let n of [
			"",
			"-square",
			"-hex"
		]) {
			let r = this.el[`${e}${n}`];
			r && (r.style.display = n === t ? "" : "none");
		}
		this.initBatteryComet();
	}
	static TANGENT_SAMPLE_PX = .5;
	effectiveDotCount(e) {
		return Math.max(1, Math.min(this.dotCount, e.maxDots));
	}
	markerFraction(e, t) {
		let n = this.effectiveDotCount(e), r = e.phase + t / n;
		return r - Math.floor(r);
	}
	static MARKER_END_INSET_PX = 4;
	placeMarker(t, n) {
		let r = t.markers[n], i = this.markerFraction(t, n), a = t.reverse ? 1 - i : i, o = Math.min(e.MARKER_END_INSET_PX, t.length / 2), s = o + a * (t.length - 2 * o), c = t.path.getPointAtLength(s);
		if (this.dotShape === "circle") r.circle.setAttribute("cx", String(c.x)), r.circle.setAttribute("cy", String(c.y));
		else {
			let n = t.reverse ? -1 : 1, i = e.TANGENT_SAMPLE_PX, a = t.path.getPointAtLength(Math.max(0, Math.min(t.length, s + n * i))), o = t.path.getPointAtLength(Math.max(0, Math.min(t.length, s - n * i))), l = Math.atan2(a.y - o.y, a.x - o.x) * 180 / Math.PI;
			r.oriented[this.dotShape].group.setAttribute("transform", `translate(${c.x} ${c.y}) rotate(${l})`);
		}
	}
	static LAP_POP_OUT_MS = 180;
	lapPopOutFraction(t) {
		return t.speed <= 0 || t.length <= 0 ? 0 : Math.min(.2, t.speed * (e.LAP_POP_OUT_MS / 1e3) / t.length);
	}
	applyLapPop(e, t, n) {
		let r = this.markerFraction(e, n), i = 1 - this.lapPopOutFraction(e);
		!t.lapPopped && r >= i ? (this.shrinkTarget(t).classList.add("shrunk"), t.lapPopped = !0) : t.lapPopped && r < t.prevFrac && (this.shrinkTarget(t).classList.remove("shrunk"), t.lapPopped = !1), t.prevFrac = r;
	}
	tick = (e) => {
		let t = Math.min((e - this.lastTime) / 1e3, .05);
		this.lastTime = e;
		for (let e in this.dots) {
			let n = this.dots[e];
			!(n.visible || n.markers.some((e) => e.active || e.shrinking)) || n.length === 0 || (n.phase += n.speed * t / n.length, n.phase -= Math.floor(n.phase), n.markers.forEach((e, t) => {
				!e.active && !e.shrinking || (e.active && this.applyLapPop(n, e, t), this.placeMarker(n, t));
			}));
		}
		if (this.batteryCometSpeed > 0) {
			this.batteryCometPhase += this.batteryCometSpeed * t / this.ringPerimeter, this.batteryCometPhase -= Math.floor(this.batteryCometPhase);
			for (let { el: e, delay: t } of this.batteryCometLayers) {
				let n = this.batteryCometPhase - t;
				n -= Math.floor(n), e.setAttribute("stroke-dashoffset", String(this.ringPerimeter * this.ringStartFraction + this.batteryCometDirection * -n * this.ringPerimeter));
			}
		}
		this.raf = requestAnimationFrame(this.tick);
	};
	update(t) {
		let n = t.data, r = t.options;
		r?.colors !== void 0 && (this.colors = {
			...o,
			...r.colors
		}), r?.labels !== void 0 && (this.labels = {
			...s,
			...r.labels
		}), r?.icons !== void 0 && (this.icons = {
			...c,
			...r.icons
		}), r?.topology !== void 0 && (this.topology = {
			...l,
			...r.topology
		}), r?.speedScale !== void 0 && (this.speedScale = r.speedScale), r?.nodeStyle !== void 0 && (this.nodeStyle = r.nodeStyle), r?.nodeShape !== void 0 && (this.nodeShape = r.nodeShape), r?.iconStyle !== void 0 && (this.iconStyle = r.iconStyle), r?.curveBend !== void 0 && (this.curveBend = Math.max(0, Math.min(2.5, r.curveBend))), r?.dotShape !== void 0 && r.dotShape !== this.dotShape && this.swapDotShape(r.dotShape), r?.dotCount !== void 0 && (this.dotCount = Math.max(1, Math.min(8, Math.round(r.dotCount)))), r?.rowGap !== void 0 && (this.rowGap = Math.max(110, Math.min(180, r.rowGap))), r?.columnGap !== void 0 && (this.columnGap = Math.max(110, Math.min(180, r.columnGap))), r?.batteryChargeHighlight !== void 0 && (this.batteryChargeHighlight = r.batteryChargeHighlight), r?.trackPulse !== void 0 && (this.trackPulse = r.trackPulse), this.svg.classList.toggle("track-pulse", this.trackPulse), this.applyLayout(), this.applyNodeShape(), this.applyRingShape(), this.applyIconStyle(), this.applyCurveBend(), this.applyRingShadow();
		let { colors: i, labels: a, icons: d, topology: f } = this;
		this.setIconPath("solar-icon", d.solar), this.setIconPath("grid-icon", d.grid), this.setIconPath("home-icon", d.home), this.setIconPath("bat-icon", d.battery), this.setIconPath("c1-icon", d.consumer1), this.setIconPath("c2-icon", d.consumer2), this.setIconPath("c3-icon", d.consumer3), this.setIconPath("c4-icon", d.consumer4), this.setIconPath("bl1-icon", d.batteryLoad1), this.setIconPath("bl2-icon", d.batteryLoad2);
		let p = n.solar ?? 0, m = n.grid ?? 0, h = n.load ?? 0, g = n.battery ?? 0, _ = n.consumer1 ?? 0, v = n.consumer2 ?? 0, y = n.consumer3 ?? 0, b = n.consumer4 ?? 0, x = n.batteryLoad1 ?? 0, S = n.batteryLoad2 ?? 0, C = n.solar != null, w = n.battery != null, T = n.consumer1 != null, E = n.consumer2 != null, D = n.consumer3 != null, A = n.consumer4 != null, j = n.batteryLoad1 != null, M = n.batteryLoad2 != null, N = E && w && M;
		N && !this.hadSlotConflict && console.warn("[powerflow] `consumer2` and `batteryLoad2` cannot both be set — they share the same node position. Showing a conflict indicator instead of either value."), this.hadSlotConflict = N;
		let { solarToBattery: P, gridToBattery: F, solarToHome: I, solarToGrid: L, batToHome: R, batToGrid: z, gridToHome: B } = u(n, f), V = Math.max(h, 0), { topOuter: re, botOuter: H } = O(this.rowGap), { col3: ie, col4: oe, minX: se } = k(this.columnGap), U = C || T || D, ce = w || E || A, G = U ? re - 8 : 125, q = ce ? H + 8 : 245, le = this.nodeShape === "hexagon" ? ae - 52 : 0, ue = se - le, J = (D || A ? oe : ie) + 52 + 3 + le - ue, Y = q - G;
		this.svg.setAttribute("viewBox", `${ue} ${G} ${J} ${Y}`), this.root.host.style.aspectRatio = `${J} / ${Y}`;
		let X = this.svg.style;
		X.setProperty("--sfd-solar", i.solar), X.setProperty("--sfd-grid-in", i.gridIn), X.setProperty("--sfd-battery-out", i.batteryOut), X.setProperty("--sfd-consumer1", i.consumer1), X.setProperty("--sfd-consumer2", i.consumer2), X.setProperty("--sfd-consumer3", i.consumer3), X.setProperty("--sfd-consumer4", i.consumer4), X.setProperty("--sfd-battery-load1", i.batteryLoad1), X.setProperty("--sfd-battery-load2", i.batteryLoad2), this.setTopo("solar", C), this.setTopo("battery", w), this.setTopo("batteryLoad1", w && j), this.setTopo("batteryLoad2", w && M && !N), this.setTopo("consumer1", T), this.setTopo("consumer2", E && !N), this.setTopo("consumer3", D), this.setTopo("consumer4", A), this.setTopo("slotConflict", N), this.setEdge("use-solar-home", C && f.solarToHome), this.setEdge("use-solar-grid", C && f.solarToGrid), this.setEdge("use-solar-bat", C && w && f.solarToBattery), this.setEdge("use-bat-home", w && f.batteryToHome), this.setEdge("use-bat-grid", w && f.batteryToGrid), this.setDot("solar-home", I > 0, I), this.setDot("solar-grid", L > 0, L), this.setDot("grid-home", B > 0, B), this.setDot("bat-home", w && R > 0, R), this.setDot("bat-grid", w && z > 0, z), this.setDot("solar-bat", w && P > 0, P), this.setDot("grid-bat", w && F > 0, F), this.setDot("home-consumer1", T && _ > 0, _), this.setDot("home-consumer2", E && !N && v > 0, v), this.setDot("home-consumer3", D && y > 0, y), this.setDot("home-consumer4", A && b > 0, b), this.setDot("bat-batteryload1", w && j && x > 0, x), this.setDot("bat-batteryload2", w && M && !N && S > 0, S);
		let Z = {};
		for (let e of ee) {
			let t = ne(e.path), n = this.dots[e.id];
			n.visible ? Z[t] = {
				colorVar: te[e.cls] ?? e.cls,
				speed: n.speed
			} : t in Z || (Z[t] = {
				colorVar: null,
				speed: 0
			});
		}
		for (let t in Z) {
			let { colorVar: n, speed: r } = Z[t], i = this.el[t];
			if (i && (i.classList.toggle("active", n !== null), n && (i.style.setProperty("--track-color", `var(--sfd-${n})`), this.trackPulse))) {
				let t = Math.max(e.TRACK_PULSE_MIN_S, Math.min(e.TRACK_PULSE_MAX_S, e.TRACK_PULSE_BASE_PX / Math.max(r, 1)));
				i.style.setProperty("animation-duration", `${t.toFixed(2)}s`);
			}
		}
		C && (this.el["n-solar"].classList.toggle("dim", p === 0), this.paintNode("solar", i.solar), this.text("t-solar-val", W(p)), this.labelText("t-solar-lbl", a.solar));
		let Q = V > 0 ? I / V : 0, de = V > 0 ? R / V : 0, fe = V > 0 ? B / V : 0;
		this.arc("arc-solar", Q, Q, 0), this.arc("arc-bat", de, de, Q), this.arc("arc-grid", fe, fe, Q + de);
		let $ = L + z, pe = $ > 0 ? L / $ : 0, me = $ > 0 ? z / $ : 0;
		this.arc("garc-solar", pe, pe, 0), this.arc("garc-bat", me, me, pe);
		let he = m >= 0 ? i.gridIn : i.gridOut;
		this.paintNode("grid", he);
		let ge = this.el["t-grid-val"];
		if (ge.style.fill = this.nodeStyle === "filled" ? K : he, ge.textContent = `${m >= 0 ? "→" : "←"} ${W(Math.abs(m))}`, this.labelText("t-grid-lbl", a.grid), this.paintNode("home", i.home), this.text("t-home-val", W(h)), this.labelText("t-home-lbl", a.home), w) {
			let e = g > 0 ? i.batteryIn : i.batteryOut;
			this.paintNode("bat", e);
			let t = this.el["t-bat-soc"];
			t.style.display = n.batterySoc == null ? "none" : "", n.batterySoc != null && (t.textContent = `${Math.round(n.batterySoc)} %`);
			let r = this.el["t-bat-watts"];
			r.style.fill = this.nodeStyle === "filled" ? K : e, r.textContent = `${g > 0 ? "↓" : "↑"} ${W(Math.abs(g))}`, this.labelText("t-bat-lbl", a.battery);
			let o = this.el[`bat-soc-arc${this.ringShapeSuffix()}`];
			o.style.stroke = this.nodeStyle === "filled" ? K : e;
			let s = n.batterySoc == null ? 0 : Math.max(0, Math.min(100, n.batterySoc)) / 100;
			o.style.strokeDasharray = `${s * this.ringPerimeter} ${this.ringPerimeter - s * this.ringPerimeter}`, o.style.strokeDashoffset = `${this.ringPerimeter * this.ringStartFraction}`, this.applyBatteryHighlight(g, s);
		}
		T && (this.el["n-consumer1"].classList.toggle("dim", _ === 0), this.paintNode("c1", i.consumer1), this.text("t-c1-val", W(_)), this.labelText("t-c1-lbl", a.consumer1)), E && (this.el["n-consumer2"].classList.toggle("dim", v === 0), this.paintNode("c2", i.consumer2), this.text("t-c2-val", W(v)), this.labelText("t-c2-lbl", a.consumer2)), D && (this.el["n-consumer3"].classList.toggle("dim", y === 0), this.paintNode("c3", i.consumer3), this.text("t-c3-val", W(y)), this.labelText("t-c3-lbl", a.consumer3)), A && (this.el["n-consumer4"].classList.toggle("dim", b === 0), this.paintNode("c4", i.consumer4), this.text("t-c4-val", W(b)), this.labelText("t-c4-lbl", a.consumer4)), j && (this.el["n-batteryload1"].classList.toggle("dim", x === 0), this.paintNode("bl1", i.batteryLoad1), this.text("t-bl1-val", W(x)), this.labelText("t-bl1-lbl", a.batteryLoad1)), M && (this.el["n-batteryload2"].classList.toggle("dim", S === 0), this.paintNode("bl2", i.batteryLoad2), this.text("t-bl2-val", W(S)), this.labelText("t-bl2-lbl", a.batteryLoad2)), N && this.paintNode("conflict", e.CONFLICT_COLOR);
	}
	destroy() {
		cancelAnimationFrame(this.raf);
		for (let e of Object.values(this.dots)) for (let t of e.markers) t.hideTimer && clearTimeout(t.hideTimer);
		this.root.innerHTML = "", this.el = {}, this.dots = {};
	}
	setTopo(e, t) {
		this.svg.querySelectorAll(`[data-topo="${e}"]`).forEach((e) => e.style.display = t ? "" : "none");
	}
	setEdge(e, t) {
		this.el[e]?.style.setProperty("display", t ? "" : "none");
	}
	fill(e, t) {
		this.el[e]?.style.setProperty("fill", t);
	}
	stroke(e, t) {
		this.el[e]?.style.setProperty("stroke", t);
	}
	paintNode(t, n) {
		let r = e.ICON_LAYOUT_NODES.find((e) => e.prefix === t)?.texts ?? [], i = this.nodeStyle === "filled", a = i ? n : this.nodeStyle === "tonal" ? G(n, 55) : this.nodeStyle === "outline" ? "none" : G(n), o = this.nodeStyle === "tonal" || i;
		this.fill(`${t}-bg`, a), this.fill(`${t}-bg-hex`, a), this.stroke(`${t}-ring`, o ? "none" : n), this.stroke(`${t}-ring-hex`, o ? "none" : n), this.fill(`${t}-icon`, i ? K : n), this.filledShadow(`${t}-icon`, i);
		for (let e of r) this.textFill(e, i ? K : null), this.filledShadow(e, i);
	}
	textFill(e, t) {
		let n = this.el[e]?.style;
		n && (t ? n.setProperty("fill", t) : n.removeProperty("fill"));
	}
	filledShadow(e, t) {
		this.el[e]?.classList.toggle("node-filled-ink", t);
	}
	text(e, t) {
		let n = this.el[e];
		n && (n.textContent = t);
	}
	static LABEL_SAFE_CHARS = 10;
	static LABEL_MAX_WIDTH = 92;
	labelText(t, n) {
		let r = this.el[t];
		r && (r.textContent = n, r.removeAttribute("textLength"), r.removeAttribute("lengthAdjust"), !(n.length <= e.LABEL_SAFE_CHARS) && r.getComputedTextLength() > e.LABEL_MAX_WIDTH && (r.setAttribute("lengthAdjust", "spacingAndGlyphs"), r.setAttribute("textLength", String(e.LABEL_MAX_WIDTH))));
	}
	setIconPath(e, t) {
		this.el[e]?.setAttribute("d", t);
	}
	setDot(e, t, n) {
		let r = this.dots[e];
		r.visible = t, t && (r.speed = this.flowSpeed(n, r.length));
		let i = this.effectiveDotCount(r);
		r.markers.forEach((e, n) => {
			let a = t && n < i;
			a && !e.active ? (e.hideTimer &&= (clearTimeout(e.hideTimer), void 0), e.active = !0, e.shrinking = !1, e.prevFrac = this.markerFraction(r, n), e.lapPopped = !1, this.placeMarker(r, n), this.shrinkTarget(e).classList.add("shrunk"), this.activeMarker(e).style.display = "", requestAnimationFrame(() => requestAnimationFrame(() => {
				e.active && this.shrinkTarget(e).classList.remove("shrunk");
			}))) : !a && e.active && (e.active = !1, e.shrinking = !0, this.shrinkTarget(e).classList.add("shrunk"), e.hideTimer = setTimeout(() => {
				this.activeMarker(e).style.display = "none", this.shrinkTarget(e).classList.remove("shrunk"), e.shrinking = !1, e.hideTimer = void 0;
			}, 200));
		});
	}
	swapDotShape(e) {
		for (let e in this.dots) for (let t of this.dots[e].markers) !t.active && !t.shrinking || (this.activeMarker(t).style.display = "none", this.shrinkTarget(t).classList.remove("shrunk"), t.lapPopped = !1);
		this.dotShape = e;
		for (let e in this.dots) {
			let t = this.dots[e];
			t.markers.forEach((e, n) => {
				!e.active && !e.shrinking || (this.activeMarker(e).style.display = "", this.placeMarker(t, n));
			});
		}
	}
	flowSpeed(e, t) {
		let n = (20 + Math.sqrt(Math.abs(e)) * 4) * this.speedScale;
		return t / Math.max(.04, Math.min(t / n, 14));
	}
	applyBatteryHighlight(e, t) {
		let n = this.el["bat-charge-highlight-group"], r = this.el[`bat-soc-mask-arc${this.ringShapeSuffix()}`];
		if (!n || !r) return;
		r.setAttribute("stroke-dasharray", `${t * this.ringPerimeter} ${this.ringPerimeter - t * this.ringPerimeter}`), r.setAttribute("stroke-dashoffset", `${this.ringPerimeter * this.ringStartFraction}`);
		let i = Math.abs(e), a = this.batteryChargeHighlight && i > 0;
		if (n.classList.toggle("active", a), !a) {
			this.batteryCometSpeed = 0;
			return;
		}
		n.classList.toggle("discharging", e < 0), this.batteryCometSpeed = this.flowSpeed(i, this.ringPerimeter), this.batteryCometDirection = e < 0 ? -1 : 1;
	}
	arc(e, t, n, r) {
		let i = this.el[`${e}${this.ringShapeSuffix()}`];
		if (t <= 0) {
			i.style.display = "none";
			return;
		}
		i.style.display = "";
		let a = this.ringPerimeter;
		i.setAttribute("stroke-dasharray", `${n * a} ${a - n * a}`), i.setAttribute("stroke-dashoffset", `${a * this.ringStartFraction - r * a}`);
	}
};
function le(e, t) {
	return new q(e, t);
}
//#endregion
//#region src/element.ts
var ue = typeof HTMLElement < "u" ? HTMLElement : class {}, J = class extends ue {
	static get observedAttributes() {
		return ["data", "options"];
	}
	pf = null;
	_data = {
		solar: 0,
		grid: 0,
		load: 0
	};
	_options;
	set data(e) {
		this._data = e, this.render();
	}
	get data() {
		return this._data;
	}
	set options(e) {
		this._options = e, this.render();
	}
	get options() {
		return this._options;
	}
	connectedCallback() {
		this.render();
	}
	disconnectedCallback() {
		this.pf?.destroy(), this.pf = null;
	}
	attributeChangedCallback(e, t, n) {
		if (n != null) try {
			let t = JSON.parse(n);
			e === "data" ? this._data = t : e === "options" && (this._options = t), this.render();
		} catch {}
	}
	render() {
		if (!this.isConnected) return;
		let e = {
			data: this._data,
			options: this._options
		};
		this.pf ? this.pf.update(e) : this.pf = new q(this, e);
	}
};
function Y(e = "power-flow") {
	typeof customElements > "u" || customElements.get(e) || customElements.define(e, J);
}
//#endregion
//#region src/index.ts
Y();
//#endregion
export { q as PowerFlow, J as PowerFlowElement, le as createPowerFlow, Y as definePowerFlow };
