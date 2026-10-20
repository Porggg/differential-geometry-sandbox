// Table of contents of B. O'Neill, Elementary Differential Geometry (Revised 2nd ed.), Chapters 1–3.
// Every numbered item is listed with its page; notions defined in the running text get "n." ids.

import type { Chapter, Entry, EntryKind, Section } from './types';

export const CHAPTERS: Chapter[] = [
  { chapter: 1, title: 'Calculus on Euclidean Space', page: 3 },
  { chapter: 2, title: 'Frame Fields', page: 43 },
  { chapter: 3, title: 'Euclidean Geometry', page: 100 },
];

export const SECTIONS: Section[] = [
  { chapter: 1, section: 1, title: 'Euclidean Space', page: 3 },
  { chapter: 1, section: 2, title: 'Tangent Vectors', page: 6 },
  { chapter: 1, section: 3, title: 'Directional Derivatives', page: 11 },
  { chapter: 1, section: 4, title: 'Curves in R³', page: 16 },
  { chapter: 1, section: 5, title: '1-Forms', page: 23 },
  { chapter: 1, section: 6, title: 'Differential Forms', page: 28 },
  { chapter: 1, section: 7, title: 'Mappings', page: 34 },
  { chapter: 2, section: 1, title: 'Dot Product', page: 43 },
  { chapter: 2, section: 2, title: 'Curves', page: 52 },
  { chapter: 2, section: 3, title: 'The Frenet Formulas', page: 58 },
  { chapter: 2, section: 4, title: 'Arbitrary-Speed Curves', page: 69 },
  { chapter: 2, section: 5, title: 'Covariant Derivatives', page: 81 },
  { chapter: 2, section: 6, title: 'Frame Fields', page: 84 },
  { chapter: 2, section: 7, title: 'Connection Forms', page: 88 },
  { chapter: 2, section: 8, title: 'The Structural Equations', page: 94 },
  { chapter: 3, section: 1, title: 'Isometries of R³', page: 100 },
  { chapter: 3, section: 2, title: 'The Tangent Map of an Isometry', page: 107 },
  { chapter: 3, section: 3, title: 'Orientation', page: 110 },
  { chapter: 3, section: 4, title: 'Euclidean Geometry', page: 116 },
  { chapter: 3, section: 5, title: 'Congruence of Curves', page: 121 },
];

type Row = [id: string, kind: EntryKind, title: string, page: number, bookName?: string];

const D: EntryKind = 'Definition';
const T: EntryKind = 'Theorem';
const L: EntryKind = 'Lemma';
const C: EntryKind = 'Corollary';
const Pr: EntryKind = 'Proposition';
const E: EntryKind = 'Example';
const R: EntryKind = 'Remark';
const N: EntryKind = 'Notion';

const ROWS: Row[] = [
  // Chapter 1 ---------------------------------------------------------------------------------
  ['1.1.1', D, 'Euclidean 3-space R³', 3],
  ['1.1.2', D, 'Natural coordinate functions x, y, z', 4],
  ['1.1.3', D, 'Differentiable (smooth) functions', 4],
  ['1.2.1', D, 'Tangent vector vₚ', 6],
  ['1.2.2', D, 'Tangent space Tₚ(R³)', 7],
  ['1.2.3', D, 'Vector field', 8],
  ['1.2.4', D, 'Natural frame field U₁, U₂, U₃', 9],
  ['1.2.5', L, 'Euclidean coordinate functions of a vector field', 9],
  ['1.3.1', D, 'Derivative of f with respect to vₚ', 12],
  ['1.3.2', L, 'vₚ[f] = Σ vᵢ ∂f/∂xᵢ(p)', 12],
  ['1.3.3', T, 'Linearity and Leibnizian property of vₚ[f]', 13],
  ['1.3.4', C, 'Properties of V[f]', 14],
  ['1.3.5', R, 'Omitting the point of application', 15],
  ['1.4.1', D, 'Curve in R³', 16],
  ['1.4.2', E, 'Curves: line, helix and others', 16],
  ['1.4.3', D, 'Velocity vector', 18],
  ['1.4.4', D, 'Reparametrization', 19],
  ['1.4.5', L, 'Velocity of a reparametrization', 20],
  ['1.4.6', L, "α'(t)[f] = d(f(α))/dt", 21],
  ['1.5.1', D, '1-form', 23],
  ['1.5.2', D, 'Differential df', 24],
  ['1.5.3', E, '1-forms on R³', 24],
  ['1.5.4', L, 'φ = Σ fᵢ dxᵢ', 25],
  ['1.5.5', C, 'df = Σ (∂f/∂xᵢ) dxᵢ', 25],
  ['1.5.6', L, 'd(fg) = g df + f dg', 26],
  ['1.5.7', L, "d(h(f)) = h'(f) df", 26],
  ['1.6.1', E, 'Computation of wedge products', 29],
  ['1.6.2', L, 'φ ∧ ψ = −ψ ∧ φ', 30],
  ['1.6.3', D, 'Exterior derivative of a 1-form', 30],
  ['1.6.4', T, 'Product rules for d', 31],
  ['1.7.1', D, 'Euclidean coordinate functions of F: Rⁿ → Rᵐ', 34],
  ['1.7.2', D, 'Image of a curve under a mapping', 35],
  ['1.7.3', E, 'Mappings', 35],
  ['1.7.4', D, 'Tangent map F*', 37],
  ['1.7.5', Pr, 'F*(v) = (v[f₁], …, v[fₘ]) at F(p)', 37],
  ['1.7.6', C, 'F*ₚ is linear', 38],
  ['1.7.7', C, "Mappings preserve velocities: β' = F*(α')", 38],
  ['1.7.8', C, 'Jacobian matrix', 39],
  ['1.7.9', D, 'Regular mapping', 39],
  ['1.7.10', T, 'Inverse function theorem', 40, 'inverse function theorem'],
  ['n.pforms', N, 'p-forms and the wedge product', 28],
  // Chapter 2 ---------------------------------------------------------------------------------
  ['2.1.1', D, 'Dot product', 44],
  ['2.1.2', D, 'Euclidean distance', 44],
  ['n.angle', N, 'Norm, orthogonality, angle', 44],
  ['2.1.3', D, 'Dot product of tangent vectors', 45],
  ['2.1.4', D, 'Frame at a point', 45],
  ['2.1.5', T, 'Orthonormal expansion', 46],
  ['2.1.6', D, 'Attitude matrix', 47],
  ['2.1.7', D, 'Cross product', 48],
  ['2.1.8', L, 'Cross product: orthogonality and length', 49],
  ['n.triple', N, 'Triple scalar product', 50],
  ['n.arclength', N, 'Speed and arc length', 52],
  ['2.2.1', T, 'Unit-speed reparametrization', 53],
  ['2.2.2', D, 'Vector field on a curve', 54],
  ['2.2.3', L, 'Constant curves, straight lines, parallel fields', 56],
  ['n.curvature', N, 'T, κ, N, B, τ (Frenet apparatus)', 58],
  ['2.3.1', L, 'T, N, B are orthonormal (Frenet frame field)', 59],
  ['2.3.2', T, 'Frenet formulas', 60, 'Frenet formulas'],
  ['2.3.3', E, 'Frenet apparatus of a helix', 60],
  ['2.3.4', R, 'Points and tangent vectors; Frenet approximation', 62],
  ['n.osculating', N, 'Osculating plane and osculating circle', 63],
  ['2.3.5', C, 'Plane curves: τ = 0', 64],
  ['2.3.6', L, 'Constant κ > 0 and τ = 0: circle', 65],
  ['2.4.1', L, 'Frenet formulas for arbitrary speed', 70],
  ['2.4.2', L, "α' = vT, α'' = (dv/dt) T + κv² N", 71],
  ['2.4.3', T, 'Formulas for T, N, B, κ, τ', 72],
  ['2.4.4', E, 'Frenet apparatus of the 3-curve', 73],
  ['2.4.5', D, 'Cylindrical helix', 75],
  ['2.4.6', T, 'Cylindrical helix ⇔ τ/κ constant', 76],
  ['2.5.1', D, 'Covariant derivative', 81],
  ['2.5.2', L, '∇ᵥW = Σ v[wᵢ] Uᵢ(p)', 82],
  ['2.5.3', T, 'Properties of ∇ᵥW', 82],
  ['2.5.4', C, 'Properties of ∇_V W', 83],
  ['2.6.1', D, 'Frame field', 85],
  ['2.6.2', E, 'Cylindrical and spherical frame fields', 85],
  ['2.6.3', L, 'Coordinate functions with respect to a frame field', 87],
  ['2.7.1', L, 'Connection forms ωᵢⱼ', 88],
  ['2.7.2', T, 'Connection equations', 89, 'connection equations'],
  ['2.7.3', T, 'ω = dA ᵗA', 91],
  ['2.8.1', D, 'Dual 1-forms', 94],
  ['2.8.2', L, 'φ = Σ φ(Eᵢ) θᵢ', 94],
  ['2.8.3', T, 'Cartan structural equations', 95, 'Cartan structural equations'],
  ['2.8.4', E, 'Structural equations for the spherical frame field', 97],
  // Chapter 3 ---------------------------------------------------------------------------------
  ['3.1.1', D, 'Isometry', 100],
  ['3.1.2', E, 'Translations and rotations', 100],
  ['3.1.3', L, 'Composites of isometries', 101],
  ['3.1.4', L, 'Translations', 102],
  ['3.1.5', L, 'Orthogonal transformations are isometries', 102],
  ['3.1.6', L, 'An isometry fixing 0 is orthogonal', 103],
  ['3.1.7', T, 'Every isometry is F = TC', 104],
  ['n.inverseIso', N, 'Orthogonal part, translation part, inverse', 104],
  ['3.2.1', T, 'Tangent map of an isometry', 107],
  ['3.2.2', C, 'Isometries preserve dot products', 108],
  ['3.2.3', T, 'Two frames determine an isometry', 109],
  ['3.3.1', R, 'Orientation of frames', 111],
  ['3.3.2', L, 'F*(e₁) • F*(e₂) × F*(e₃) = det C · e₁ • e₂ × e₃', 112],
  ['3.3.3', D, 'Orientation-preserving / reversing; sign', 112],
  ['3.3.4', E, 'Signs of translations, rotations, reflections', 113],
  ['3.3.5', L, 'Cross product in terms of a frame', 114],
  ['3.3.6', T, 'F*(v × w) = sgn F · F*(v) × F*(w)', 114],
  ['3.4.1', C, 'Isometries and vector fields on curves', 117],
  ['3.4.2', T, 'Frenet apparatus of an image curve', 118],
  ['3.4.3', E, 'A reflected helix', 119],
  ['3.5.1', D, 'Congruent curves', 121],
  ['3.5.2', L, 'Parallel curves', 122],
  ['3.5.3', T, 'Curvature and torsion determine a curve', 122],
  ['3.5.4', E, 'Computing the congruence of two helices', 124],
  ['3.5.5', C, 'Helices: constant κ and τ', 125],
  ['3.5.6', C, 'Congruence of arbitrary-speed curves', 125],
  ['3.5.7', T, 'Congruence via frame fields on curves', 126],
  ['3.5.8', R, 'Existence theorem for curves', 126],
];

export function baseEntries(): Entry[] {
  return ROWS.map(([id, kind, title, page, bookName]) => {
    const sec = id.startsWith('n.') ? sectionOfPage(page) : { chapter: Number(id.split('.')[0]), section: Number(id.split('.')[1]) };
    return { id, kind, title, page, bookName, chapter: sec.chapter, section: sec.section };
  });
}

function sectionOfPage(page: number): { chapter: number; section: number } {
  let best = SECTIONS[0];
  for (const s of SECTIONS) if (s.page <= page) best = s;
  return { chapter: best.chapter, section: best.section };
}
