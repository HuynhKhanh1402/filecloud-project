import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import FileIcon from './FileIcon';

describe('FileIcon', () => {
  it('should render PDF icon for PDF mime type', () => {
    const { container } = render(<FileIcon mimeType="application/pdf" />);
    expect(container.querySelector('.text-primary')).toBeTruthy();
  });

  it('should render image icon for image mime type', () => {
    const { container } = render(<FileIcon mimeType="image/png" />);
    expect(container.querySelector('.text-green-500')).toBeTruthy();
  });

  it('should render video icon for video mime type', () => {
    const { container } = render(<FileIcon mimeType="video/mp4" />);
    expect(container.querySelector('.text-orange-500')).toBeTruthy();
  });

  it('should render archive icon for zip mime type', () => {
    const { container } = render(<FileIcon mimeType="application/zip" />);
    expect(container.querySelector('.text-purple-500')).toBeTruthy();
  });

  it('should render folder icon for folder mime type', () => {
    const { container } = render(<FileIcon mimeType="folder" />);
    expect(container.querySelector('.text-yellow-500')).toBeTruthy();
  });

  it('should render text icon for text mime type', () => {
    const { container } = render(<FileIcon mimeType="text/plain" />);
    expect(container.querySelector('.text-blue-500')).toBeTruthy();
  });

  it('should render default icon for unknown mime type', () => {
    const { container } = render(<FileIcon mimeType="unknown/type" />);
    expect(container.querySelector('.text-gray-500')).toBeTruthy();
  });
});
