# Contributing to SCPlayer

First off, thanks for taking the time to contribute!

---

## Development Setup

1. **Clone the repo:**

   ```bash
   git clone https://github.com/PopolQue/hide_embedded_sc_player.git
   cd hide_embedded_sc_player
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Start the dev server:**

   ```bash
   npm run dev
   ```

---

## Project Structure

- `src/lib/`: The core React component logic.
- `src/demo/`: A demo app for testing changes.
- `standalone/`: The vanilla JS implementation.
- `documentation/`: Markdown documentation files.

---

## Coding Standards

- **TypeScript:** Use strict typing. Avoid `any`.
- **CSS:** Use BEM naming conventions for classes (`sc-player__element--modifier`).
- **Icons:** Use the inline SVG icons provided in `SCPlayer.tsx` to keep the library dependency-free.

---

## Submitting Changes

1. Create a new branch: `git checkout -b feature/my-new-feature`.
2. Make your changes and add tests if applicable.
3. Ensure the project builds: `npm run build`.
4. Submit a Pull Request with a clear description of the problem and your solution.

---

## License

By contributing, you agree that your contributions will be licensed under the project's **MIT License**.
