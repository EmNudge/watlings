# Watlings

Learn WebAssembly Text Format by fixing a bunch of small programs!

We assume very little familiarity with WebAssembly. 

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

# Roadmap
The following are planned and optional exercises.
## Planned
- [X] S-expressions
- [X] Exporting
- [X] Functions
- [X] Variables
- [ ] Number types
- [ ] Conditionals
- [ ] Loops
- [ ] Data
- [ ] Memory
- [ ] Ref Types
- [ ] Tables
- [ ] Host Environment

## Fast Follows
- [ ] SIMD
- [ ] GC

# Motivations
I've found just diving in to be the best way to build experience with programming. [Rustlings](https://github.com/rust-lang/rustlings) and [ziglings](https://github.com/ratfactor/ziglings) have both had tremendous returns to my journeys with both languages.

WebAssembly (and by extention WAT) has a more sparse educational landscape than most and I was hoping to fill some of the gaps by building a project with the same sort of structure.

## Pedagogical Philosophy
Outlined here are some thoughts on what makes a good teaching experience.

### Typing Over Reading
The goal is to learn by doing. Comments on each file outline a task and some background. However, a lot about a language can be gleaned by its syntax alone. We should be adding **as little** explanation as possible. 

Ocassional gaps in knowledge can be filled by consistent exposure to the syntax within different contexts. Certain things can therefore be learned without any mention.

If you find a text confusing or too verbose, **please create a discussion post**!

### Create Struggle
Studies have shown that one cannot learn effectively without effort. This applies to practically every domain of knowledge. These projects should be educational, not easy.

This does not mean we should make the education itself elusive. We should not make learning more difficult, but instead more intentional.

When introducing a lot of new syntax, keep the problem scope small, but force the user to read a bit. If the syntax is not new, increase the problem scope. Maybe many variations of the same task.

# Credits
- [rustlings](https://github.com/rust-lang/rustlings)
- [Ziglings](https://github.com/ratfactor/ziglings)