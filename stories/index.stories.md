```js script
import { html } from '@open-wc/demoing-storybook';
import '../mist-form.js';

export default {
  title: 'MistForm',
  component: 'mist-form',
  options: { selectedPanel: "storybookjs/knobs/panel" },
};
```

# MistForm

A component for...

## Features:

- a
- b
- ...

## How to use

### Installation

```bash
yarn add mist-form
```

```js
import 'mist-form/mist-form.js';
```

```js preview-story
export const Simple = () => html`
  <mist-form></mist-form>
`;
```

## Variations

###### Custom Title

```js preview-story
export const CustomTitle = () => html`
  <mist-form title="Hello World"></mist-form>
`;
```
