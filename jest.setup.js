// Learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom'

// Mock jsPDF to avoid canvas issues in tests
jest.mock('jspdf', () => {
  return {
    __esModule: true,
    default: jest.fn().mockImplementation(() => ({
      internal: {
        pageSize: {
          height: 297,
          width: 210,
        },
      },
      setFontSize: jest.fn(),
      setFont: jest.fn(),
      text: jest.fn(),
      addPage: jest.fn(),
      splitTextToSize: jest.fn((text) => [text]),
      save: jest.fn(),
    })),
  };
});
