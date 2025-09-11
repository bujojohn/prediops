# Component Name

## Overview
Brief description of what this component does and its purpose.

## Usage
```tsx
import { ComponentName } from '@/app/components/ComponentName';

<ComponentName
  prop1="value1"
  prop2={value2}
  onAction={handleAction}
/>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `prop1` | `string` | - | Description of prop1 |
| `prop2` | `number` | `0` | Description of prop2 |
| `onAction` | `(value: string) => void` | - | Callback function |

## Examples

### Basic Usage
```tsx
<ComponentName prop1="Hello" prop2={42} />
```

### With Event Handler
```tsx
<ComponentName 
  prop1="Hello" 
  prop2={42}
  onAction={(value) => console.log(value)}
/>
```

## Styling
This component uses Tailwind CSS classes and supports dark mode.

### Custom Styling
```tsx
<ComponentName 
  className="custom-class"
  prop1="Hello"
/>
```

## Accessibility
- [ ] Keyboard navigation support
- [ ] Screen reader friendly
- [ ] ARIA labels included
- [ ] Focus management

## Performance
- [ ] Memoized if needed
- [ ] Optimized re-renders
- [ ] Lazy loading support

## Testing
```tsx
import { render, screen } from '@testing-library/react';
import { ComponentName } from './ComponentName';

test('renders component', () => {
  render(<ComponentName prop1="test" />);
  expect(screen.getByText('test')).toBeInTheDocument();
});
```

## Related Components
- [RelatedComponent1](./RelatedComponent1.md)
- [RelatedComponent2](./RelatedComponent2.md)

## Changelog
- **v1.0.0**: Initial implementation
- **v1.1.0**: Added new feature
