import App from './App';
import { render, screen, userEvent } from './tests/test-utils';

describe.skip('Testing App Component', () => {
  beforeEach(() => {
    render(<App />);
  });
  describe('Testing counter button', () => {
    it('should have the appropriate count when the button is clicked', async () => {
      const user = userEvent.setup();
      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
      expect(button).toHaveTextContent('count is 0');
      await user.click(button);
      expect(button).toHaveTextContent('count is 1');
      await user.click(button);
      expect(button).toHaveTextContent('count is 2');
      await user.click(button);
      expect(button).toHaveTextContent('count is 3');
    });
  });
});
