/**
 * 随机排列数组项
 * @param {Array} arr - 需要随机排列的数组
 * @returns {Array} - 随机排列后的数组
 */
function shuffleArray(arr) {
  return arr.slice().sort(() => Math.random() - 0.5);
}

module.exports = {
  shuffleArray
}