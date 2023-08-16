# Watlings

Learn WebAssembly Text Format by fixing a bunch of small programs!

![watlings file 001_hello](https://github.com/EmNudge/watlings/assets/24513691/a720199d-75ce-41c5-84d6-014ef2b2eacd)
![console output for failing test](https://github.com/EmNudge/watlings/assets/24513691/1aa1e029-f871-41d6-a5fd-44997d82b148)


## 🚧 Caution
This project is incomplete and in active development.
Feel free to help out by filing issues and creating PRs!

# Usage
This project uses Node & npm for compilation and testing.

Clone the repo and install dependencies
```sh
git clone git@github.com:EmNudge/watlings.git
cd watlings
npm i
```

Test your answer to an exercise with the `./run.sh` script
```sh
./run.sh hello
```

## Using Wat2wasm Directly (recommended)
For syntax highlighting and more up-to-date builds, you can **optionally** use the official [WebAssembly Binary toolkit](https://github.com/WebAssembly/wabt) which will provide you with a `wat2wasm` CLI tool.

If it is available on your path as `wat2wasm`, it will be used instead of [npm wabt](https://www.npmjs.com/package/wabt).

It should help with debugging, but it is strictly optional.

## Suggested Editor
We recommend using [VS Code](https://code.visualstudio.com) with the [WATI](https://github.com/NateLevin1/wati) extension.

This should provide syntax highlighting, intellisense, and other helpful features as you work through the exercises.

# Roadmap
The following are planned and optional exercises.
## Planned
- [X] S-expressions
- [X] Exporting
- [X] Functions
- [X] Variables
- [X] Number types
- [X] Conditionals
- [X] Loops
- [X] Data
- [X] Memory
- [ ] Ref Types
- [ ] Tables
- [ ] Host Environment

## Fast Follows
- [ ] SIMD
- [ ] GC

# Motivations
I've found just diving in to be the best way to build experience with programming. [Rustlings](https://github.com/rust-lang/rustlings) and [ziglings](https://github.com/ratfactor/ziglings) have both had tremendous returns to my journeys with both languages.

WebAssembly (and by extension WAT) has a more sparse educational landscape than most and I was hoping to fill some of the gaps by building a project with the same sort of structure.

## Pedagogical Philosophy
Outlined here are some thoughts on what makes a good teaching experience.

### Typing Over Reading
The goal is to learn by doing. Comments on each file outline a task and some background. However, a lot about a language can be gleaned by its syntax alone. We should be adding **as little** explanation as possible. 

Ocassional gaps in knowledge can be filled by consistent exposure to the syntax within different contexts. Certain things can therefore be learned without any mention.

Introduction text is superfluous. Words add visual noise, so we should be careful with our count. Coding itself should supplement ambiguities in the text.

If you find a text confusing or too verbose, **please create a discussion post**!

### Create Struggle
Studies have shown that one cannot learn effectively without effort. This applies to practically every domain of knowledge. These projects should be educational, not easy.

This does not mean we should make the education itself elusive. We should not make learning more difficult, but instead more intentional.

When introducing a lot of new syntax, keep the problem scope small, but force the user to read a bit. If the syntax is not new, increase the problem scope. Maybe many variations of the same task.

# Credits
- [rustlings](https://github.com/rust-lang/rustlings)
- [Ziglings](https://github.com/ratfactor/ziglings)
