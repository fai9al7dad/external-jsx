# external JSX 

this project is inspired by angular external templates, which allows you to separate your component's logic from your markup

this is how you would do it in angular 

first, you define your component and include in your ```@Component``` directive a templateUrl attribute which should point to the external markup url



```jsx
import { Component } from "@angular/core";

@Component({
  selector: "app-demo-component",
  templateUrl: "./demo.component.html",
  styleUrls: ["./demo.component.css"]
})
export class DemoComponent {}
```
> demo.component.ts


```html
<strong>Hello World</strong>
```
> demo.component.html

this project follows a similar approach 
an example is shown below using react, but the project should work with any library/framework that uses JSX

```jsx
import React from 'react';

export default function App() {
  const [count, setCount] = React.useState(0)
  return (
      <main>
        <button onClick={()=>{
          setCount(count + 1)
        }}
        >increment</button>
        <div>Count is ${count}</div>
      </main>
  )
}
```
> A normal react component

will look something like this:
```jsx
import React from 'react';

export default function App() {
  const [count, setCount] = React.useState(0)
  return (
    <Template dir="/app.template.tsx"/>
  )
}
```

```jsx
<main>
  <button onClick={()=>{
    setCount(count + 1)
  }}
       >increment</button>
  <div>Count is ${count}</div>
</main>
```
> app.template.tsx

which should allow separation, and might make development easier, by placing the markup and component code side by side you can avoid continues up and down scrolling 

There is no special syntax to learn (Besides the ```<Template/>```),  extracting the JSX to a .template should work the same way as without exporting it.

## How it works

During build all the ``` <Template url="..."/> ``` will be replaced by their content and will be inlined, And will be treated as a regular react component, that's why it's possible to access the state regularly without any extra syntax or magic

## Editors / IDE's extension
As expected, by extracting the markup and trying to access the data(variables, states,..etc) in the component intellisense and Typescript will scream at you, we know that it will work because in build it will be inlined and will have access to the data, but while developing that won't be possible..

so we need to somehow tell the editor or ide that for this external template file there exists data in the corresponding component.

And this is basically what [VSCODE extension here]() does, just install it and everything should work, make sure that the url is specified correctly in ```<Template dir=".."/>```

The extension is heavily inspired by [ng-language-service](https://github.com/angular/vscode-ng-language-service)

## Progress

- [x] inline ```<Template dir="..." />``` with corresponding .template file at build
- [ ] vscode extension (WIP)
- [ ] export as vite plugin







