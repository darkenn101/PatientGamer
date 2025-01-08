export default function useTruncate() {
  /**
   * Truncates a string to a specified number of words.
   *
   * @param {string} text - The text to truncate.
   * @param {number} wordLimit - The maximum number of words to retain.
   * @returns {string} - The truncated string with an ellipsis if truncated.
   */
  const truncate = (text, wordLimit) => {
    if (!text) return ''
    const words = text.split(' ')
    return words.length > wordLimit
      ? `${words.slice(0, wordLimit).join(' ')}...`
      : text
  }

  return { truncate }
}
