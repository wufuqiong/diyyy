import { useState } from 'react';
import { it, expect, describe } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, screen } from '@testing-library/react';

import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';

import { useToolColor, ToolColorProvider } from 'src/shared/worksheet/ToolColorContext';

const TEST_COLOR = '#ff0000';

type Option = 'a' | 'b' | 'c';

function TestToggleGroup() {
  const color = useToolColor();
  const [val, setVal] = useState<Option>('a');

  return (
    <ToggleButtonGroup
      value={val}
      exclusive
      onChange={(_, v: Option | null) => v && setVal(v)}
    >
      <ToggleButton
        value="a"
        style={val === 'a' ? { backgroundColor: color } : undefined}
      >
        A
      </ToggleButton>
      <ToggleButton
        value="b"
        style={val === 'b' ? { backgroundColor: color } : undefined}
      >
        B
      </ToggleButton>
      <ToggleButton
        value="c"
        style={val === 'c' ? { backgroundColor: color } : undefined}
      >
        C
      </ToggleButton>
    </ToggleButtonGroup>
  );
}

function renderWithProvider(color = TEST_COLOR) {
  return render(
    <ToolColorProvider value={color}>
      <TestToggleGroup />
    </ToolColorProvider>,
  );
}

describe('ToggleButtonGroup with ToolColor', () => {
  it('renders with the context color applied to the initially selected button', () => {
    renderWithProvider();

    const selectedBtn = screen.getByRole('button', { name: 'A' });

    // The selected button should have the TEST_COLOR as its background-color
    expect(selectedBtn).toHaveStyle({ backgroundColor: TEST_COLOR });
  });

  it('applies the toolColor from context, not a hardcoded value', () => {
    const customColor = '#00ff00';
    renderWithProvider(customColor);

    const selectedBtn = screen.getByRole('button', { name: 'A' });
    expect(selectedBtn).toHaveStyle({ backgroundColor: customColor });
  });

  it('moves the toolColor to the new selected button and removes it from the old one', async () => {
    const user = userEvent.setup();
    renderWithProvider();

    const btnA = screen.getByRole('button', { name: 'A' });
    const btnB = screen.getByRole('button', { name: 'B' });

    // Initially, btnA has the color and btnB does not
    expect(btnA).toHaveStyle({ backgroundColor: TEST_COLOR });
    expect(btnB).not.toHaveStyle({ backgroundColor: TEST_COLOR });

    // Click btnB to change selection
    await user.click(btnB);

    // Now btnB should have the color and btnA should not
    expect(btnB).toHaveStyle({ backgroundColor: TEST_COLOR });
    expect(btnA).not.toHaveStyle({ backgroundColor: TEST_COLOR });
  });
});
