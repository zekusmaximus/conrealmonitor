import compareTwoStrings from 'string-similarity-js';

export function calculateFragmentation(strings: string[]): number {
  console.log('INFO: Calculating fragmentation');
  const validStrings = strings.filter(s => typeof s === 'string' && s.length > 0);
  if (validStrings.length < 2) {
    console.log('INFO: Not enough valid strings for fragmentation analysis');
    return 0;
  }
  let totalSimilarity = 0;
  let pairs = 0;
  // Compute full pairwise similarity for unbiased fragmentation calculation
  for (let i = 0; i < validStrings.length; i++) {
    for (let j = i + 1; j < validStrings.length; j++) {
      const similarity = compareTwoStrings(validStrings[i]!, validStrings[j]!);
      totalSimilarity += similarity;
      pairs++;
      console.log(`INFO: Comparing strings "${validStrings[i]}" and "${validStrings[j]}": similarity = ${similarity}`);
    }
  }
  const avgSimilarity = totalSimilarity / pairs;
  const fragmentation = 1 - avgSimilarity;
  console.log(`INFO: Average similarity: ${avgSimilarity}, Fragmentation: ${fragmentation}`);
  if (fragmentation > 0.5) {
    console.log(`WARN: Reality fracture detected at index ${fragmentation.toFixed(2)}`);
  }
  return fragmentation;
}
