
/**
 * Enhanced JSON extraction helper that handles LLM responses with noise
 */
export const extractJson = (raw: string): any => {
  try {
    // หา JSON block ในข้อความ
    const match = raw.match(/\{[\s\S]*\}/);
    if (match) {
      const parsed = JSON.parse(match[0]);
      return typeof parsed === 'object' ? parsed : {};
    }
    
    // ถ้าไม่เจอ JSON ให้ลอง parse ทั้งหมด
    const parsed = JSON.parse(raw.trim());
    return typeof parsed === 'object' ? parsed : {};
  } catch (error) {
    console.error('Failed to extract JSON:', error);
    return {};
  }
};
