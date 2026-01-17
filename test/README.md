# Test Utilities

This directory contains shared test utilities and custom arbitraries for property-based testing.

## Contents

- `arbitraries.ts` - Custom fast-check generators for property-based tests

## Usage

Import test utilities in your test files:

```typescript
import { songArbitrary, musicDataArbitrary } from '../test/arbitraries';
```

## Property-Based Testing

This project uses [fast-check](https://github.com/dubzzz/fast-check) for property-based testing to verify correctness properties across a wide range of inputs.
