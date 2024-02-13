# About
Small wrapper for Web Animations API to animate HTMLElements with more ease.

# Install
`npm install shanim`

# API

`animate` function wraps up element and creates start animation `Scene`. `Scene` provides a user with a declarative API to manipulate animation

- `chain` method of `Scene` allows chaining animation step by step.
- `together` method is for launching animations simultaneously.
- `init` method creates initiating animations to apply some initial styles which other animations will start from.

# Example
```js
import { animate, fade, backgroundColor } from 'shanim';

const element = document.querySelector('div.my-element')
const scene = animate(element)

scene.chain([backgroundColor("lightpink", { duration: 1000 }),fade(0),fade(1)]).play()
```

![The result](https://ibb.co/y8JcsT5)
