import test from 'node:test';
import assert from 'node:assert/strict';
import { createRally, advanceRally, receiveRally, receivingKey } from '../src/pingpong.ts';
function approach(rally) { rally.pause = 0; advanceRally(rally, rally.duration * .8); }
test('alternating keys reverse the actual ball position and accelerate every return', () => {
  const rally = createRally();
  for (let i = 0; i < 50; i++) {
    approach(rally);
    const expected = i % 2 ? 'a' : 'l';
    assert.equal(receivingKey(rally), expected);
    const speed = rally.duration;
    const x = rally.x;
    assert.equal(receiveRally(rally, expected), true);
    assert.equal(rally.x, x, 'a return must not teleport the ball');
    assert.equal(rally.from, x);
    assert.ok(rally.duration < speed);
    assert.equal(rally.returns, i + 1);
  }
  approach(rally);
  assert.equal(receiveRally(rally, receivingKey(rally)), true);
  assert.equal(rally.returns, 51);
  assert.ok(rally.duration > 0);
});
test('wrong paddle, early presses, and repeated presses cannot score', () => {
  const rally = createRally();
  assert.equal(receiveRally(rally, 'l'), false);
  approach(rally);
  assert.equal(receiveRally(rally, 'a'), false);
  assert.equal(receiveRally(rally, 'l'), true);
  assert.equal(receiveRally(rally, 'a'), false);
  assert.equal(rally.returns, 1);
});
test('misses reset score and speed and provide a new serve', () => {
  const rally = createRally(); approach(rally); receiveRally(rally, 'l');
  assert.equal(advanceRally(rally, rally.duration * 1.1), true);
  assert.equal(rally.returns, 0); assert.equal(rally.duration, 1.8);
  assert.equal(rally.misses, 1); assert.equal(receivingKey(rally), 'l');
  assert.ok(rally.pause > 0);
});
test('ball travel is independent of frame rate', () => {
  const slow = createRally(), fast = createRally(); slow.pause = fast.pause = 0;
  for (let i = 0; i < 30; i++) advanceRally(slow, 1/30);
  for (let i = 0; i < 120; i++) advanceRally(fast, 1/120);
  assert.ok(Math.abs(slow.x - fast.x) < 1e-10);
});
