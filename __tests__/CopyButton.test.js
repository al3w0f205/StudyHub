import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import CopyButton from '../src/components/ui/CopyButton';

Object.assign(navigator, {
  clipboard: {
    writeText: jest.fn().mockImplementation(() => Promise.resolve()),
  },
});

describe('CopyButton', () => {
  it('renders correctly and copies text', async () => {
    render(<CopyButton text="test content" />);
    
    const button = screen.getByRole('button');
    expect(button).toBeDefined();
    
    fireEvent.click(button);
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith('test content');
    
    await waitFor(() => {
      expect(screen.getByText('✓')).toBeDefined();
    });
  });

  it('renders with label and copies text', async () => {
    render(<CopyButton text="test content" label="Copiar URL" />);
    
    const button = screen.getByText('Copiar URL');
    expect(button).toBeDefined();
    
    fireEvent.click(button);
    
    await waitFor(() => {
      expect(screen.getByText('¡Copiado!')).toBeDefined();
    });
  });
});
