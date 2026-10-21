import { expect, it } from 'vitest';
import { arr } from '../src/objects/common';

it('splits scaled tuples', () => {
  expect(arr('(1, 2, 1)/sqrt(6)')).toEqual(['(1)/(sqrt(6))', '(2)/(sqrt(6))', '(1)/(sqrt(6))']);
  expect(arr('(-x, -y)/sqrt(x^2+y^2)')).toEqual(['(-x)/(sqrt(x^2+y^2))', '(-y)/(sqrt(x^2+y^2))']);
  expect(arr('2*(x, y)')).toEqual(['(2)*(x)', '(2)*(y)']);
  expect(arr('(cos(t), sin(t))')).toEqual(['cos(t)', 'sin(t)']);
  expect(arr('(a*cos(s/c), a*sin(s/c), b*s/c)')).toEqual(['a*cos(s/c)', 'a*sin(s/c)', 'b*s/c']);
});
