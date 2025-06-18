import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import * as ImageManipulator from 'expo-image-manipulator';
import * as FileSystem from 'expo-file-system';
import { ImageProcessor } from '../../src/components/ImageProcessor';
import { compressImage, cleanup } from '../../src/utils/imageProcessing';

jest.mock('expo-image-manipulator');
jest.mock('expo-file-system');

describe('ImageProcessor Integration Tests', () => {
  const mockUri = 'file://test/image.jpg';
  const mockCompressedUri = 'file://test/compressed.jpg';
  
  beforeEach(() => {
    jest.clearAllMocks();
    (ImageManipulator.manipulateAsync as jest.Mock).mockResolvedValue({
      uri: mockCompressedUri
    });
    (FileSystem.deleteAsync as jest.Mock).mockResolvedValue(undefined);
    (FileSystem.getInfoAsync as jest.Mock).mockResolvedValue({
      exists: true
    });
  });

  it('should compress image and call onComplete', async () => {
    const onComplete = jest.fn();
    const { getByText } = render(
      <ImageProcessor 
        uri={mockUri} 
        onComplete={onComplete}
      />
    );

    await waitFor(() => {
      expect(ImageManipulator.manipulateAsync).toHaveBeenCalledWith(
        mockUri,
        [{ resize: { width: 1024 } }],
        expect.any(Object)
      );
      expect(onComplete).toHaveBeenCalledWith(mockCompressedUri);
      expect(getByText('Processing complete!')).toBeTruthy();
    });
  });

  it('should handle compression errors and retry', async () => {
    const onError = jest.fn();
    (ImageManipulator.manipulateAsync as jest.Mock)
      .mockRejectedValueOnce(new Error('Compression failed'))
      .mockResolvedValueOnce({ uri: mockCompressedUri });

    const { getByText } = render(
      <ImageProcessor 
        uri={mockUri} 
        onComplete={jest.fn()} 
        onError={onError}
        maxRetries={3}
      />
    );

    await waitFor(() => {
      expect(getByText('Processing failed')).toBeTruthy();
    });

    fireEvent.press(getByText(/Retry/));

    await waitFor(() => {
      expect(ImageManipulator.manipulateAsync).toHaveBeenCalledTimes(2);
      expect(getByText('Processing complete!')).toBeTruthy();
    });
  });

  it('should cleanup temporary files on unmount', async () => {
    const { unmount } = render(
      <ImageProcessor 
        uri={mockUri} 
        onComplete={jest.fn()}
      />
    );

    unmount();

    await waitFor(() => {
      expect(FileSystem.getInfoAsync).toHaveBeenCalledWith(mockUri);
      expect(FileSystem.deleteAsync).toHaveBeenCalledWith(
        mockUri,
        { idempotent: true }
      );
    });
  });

  it('should stop retrying after max attempts', async () => {
    const maxRetries = 2;
    const error = new Error('Compression failed');
    (ImageManipulator.manipulateAsync as jest.Mock).mockRejectedValue(error);

    const { getByText, queryByText } = render(
      <ImageProcessor 
        uri={mockUri} 
        onComplete={jest.fn()} 
        maxRetries={maxRetries}
      />
    );

    // Initial attempt + 2 retries = 3 total attempts
    for (let i = 0; i < maxRetries; i++) {
      await waitFor(() => {
        expect(getByText('Processing failed')).toBeTruthy();
      });
      fireEvent.press(getByText(/Retry/));
    }

    await waitFor(() => {
      expect(ImageManipulator.manipulateAsync).toHaveBeenCalledTimes(maxRetries + 1);
      expect(queryByText(/Retry/)).toBeNull();
    });
  });
}); 