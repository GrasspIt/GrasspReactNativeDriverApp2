import React from 'react';
import { renderWithRedux } from '../../jest/renderWithRedux';

import DSPRScreen from '../../screens/DSPRScreen';

describe('<DSPRScreen />', () => {
  it('renders with given state from Redux store', async () => {
    await expect(renderWithRedux(<DSPRScreen />).toJSON()).toMatchSnapshot();
  });
});
