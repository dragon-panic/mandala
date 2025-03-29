# Mandala Flow

An innovative web application that transforms sacred geometry creation into an intuitive, meditative experience. Mandala Flow blends ancient tradition with cutting-edge technology, allowing users to explore the intersection of intentional design and algorithmic beauty.

**Live Demo**: [https://dragon-panic.github.io/mandala/](https://dragon-panic.github.io/mandala/)

## Features

- Dynamic mandala generation with symmetry controls
- Customizable design elements (color, line width, opacity)
- Animated rotation and transformations
- Interactive controls via dat.GUI interface
- Multiple color palettes and gradient options
- Preset designs for quick inspiration
- Keyboard shortcuts for intuitive control
- Click to generate new random patterns
- Touch and mouse interactivity

## Technologies Used

- HTML5/CSS3/JavaScript
- Canvas API for rendering
- Libraries:
  - Three.js - For WebGL rendering
  - SimplexNoise.js - For generating organic patterns
  - GSAP (TweenMax) - For animations and transitions
  - dat.GUI - For the control interface

## Getting Started

1. Open `index.html` in a modern web browser
2. Use the control panel on the right to adjust mandala properties
3. Click anywhere on the canvas to generate a new random mandala
4. Try the keyboard shortcuts for quick control

## Controls

### GUI Controls
- **Basic Controls**:
  - **Symmetry**: Adjust the number of reflections (2-32)
  - **Line Width**: Control the thickness of the lines
  - **Opacity**: Adjust the transparency of the patterns
  - **Complexity**: Control the complexity of the patterns
  - **Layers**: Adjust the number of pattern layers

- **Colors**:
  - **Color**: Change the line color (when gradients disabled)
  - **Use Gradient**: Toggle between solid color and gradient
  - **Color Mode**: Choose from color palettes (monochrome, rainbow, complementary, earth, ocean)
  - **Background Color**: Change the canvas background

- **Animation**:
  - **Animate**: Enable/disable animation
  - **Auto Rotate**: Toggle automatic rotation
  - **Rotation Speed**: Set the speed of automatic rotation
  - **Pulse Effect**: Enable/disable pulsing animation

- **Actions**:
  - **New Mandala**: Generate a new random pattern

- **Presets**:
  - **Classic**: Simple traditional mandala
  - **Floral**: Colorful, flower-like pattern
  - **Minimalist**: Clean, simple design
  - **Ocean Waves**: Flowing blue patterns
  - **Sacred Geometry**: Earthy, mystical design

### Keyboard Shortcuts
- **Space**: Generate new mandala
- **R**: Toggle rotation
- **P**: Toggle pulse effect
- **+**: Increase symmetry
- **-**: Decrease symmetry
- **H**: Toggle controls panel visibility

## Project Structure

- **index.html**: Main HTML file
- **mandala.js**: Core mandala generation and rendering logic
- **controls.js**: UI controls and interaction handling
- **algorithms/**: Contains different mandala drawing algorithms
  - **shader.js**: WebGL shader-based rendering
  - **fractalMandala.js**: Fractal-based pattern generation

## Deployment

This project is deployed using GitHub Pages. The live version can be accessed at [https://dragon-panic.github.io/mandala/](https://dragon-panic.github.io/mandala/).

### Deploying Your Own Version

1. Fork this repository
2. Enable GitHub Pages in your repository settings
3. Choose to deploy from the `gh-pages` branch
4. The GitHub Actions workflow will automatically build and deploy your site whenever you push to the main branch

## Customization

The application is designed with modularity in mind. The core rendering logic is separated from the control interface, making it easy to modify or extend functionality.

To customize:
1. Edit `mandala.js` to change the core rendering algorithms
2. Modify `controls.js` to add new UI controls or presets
3. Update styles in `index.html` to change the visual appearance of the interface 