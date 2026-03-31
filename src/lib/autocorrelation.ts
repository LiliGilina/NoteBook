export function autoCorrelate(buffer: Float32Array, sampleRate: number): number {
  let rms = 0;
  for (let i = 0; i < buffer.length; i++) {
    rms += buffer[i] * buffer[i];
  }
  rms = Math.sqrt(rms / buffer.length);

  if (rms < 0.01) return -1;

  let r1 = 0;
  let r2 = buffer.length - 1;
  const threshold = 0.2;

  for (let i = 0; i < buffer.length / 2; i++) {
    if (Math.abs(buffer[i]) < threshold) {
      r1 = i;
      break;
    }
  }

  for (let i = 1; i < buffer.length / 2; i++) {
    if (Math.abs(buffer[buffer.length - i]) < threshold) {
      r2 = buffer.length - i;
      break;
    }
  }

  const sliced = buffer.slice(r1, r2);
  const c = new Array(sliced.length).fill(0);

  for (let i = 0; i < sliced.length; i++) {
    for (let j = 0; j < sliced.length - i; j++) {
      c[i] += sliced[j] * sliced[j + i];
    }
  }

  let d = 0;
  while (d + 1 < c.length && c[d] > c[d + 1]) d++;

  let maxValue = -1;
  let maxIndex = -1;
  for (let i = d; i < c.length; i++) {
    if (c[i] > maxValue) {
      maxValue = c[i];
      maxIndex = i;
    }
  }

  if (maxIndex <= 0) return -1;

  const frequency = sampleRate / maxIndex;

  if (frequency < 70 || frequency > 1400) return -1;

  return frequency;
}