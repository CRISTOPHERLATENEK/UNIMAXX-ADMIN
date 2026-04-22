import { render, screen } from '@testing-library/react';
import { ThemeEditor } from '../components/admin/ThemeEditor';

describe('ThemeEditor', () => {
    it('renders without crashing', () => {
        render(<ThemeEditor />);
        expect(screen.getByText('Personalização do Tema')).toBeInTheDocument();
    });

    it('displays color pickers', () => {
        render(<ThemeEditor />);
        expect(screen.getByText('Paleta de Cores')).toBeInTheDocument();
    });
});
