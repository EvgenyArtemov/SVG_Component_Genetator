# SVG Component Generator script

## How to use

Just place it inside your projest src folder in __tools__ subfolder, edit ```inputSVGFolder``` variable to match your image's folder and specify corresonding npm script!

Example of the script:
```
 "scripts": {
    "test": "jest",
    "build": "webpack --mode production",
   >> "generate-icons": "babel-node ./tools/generate-icons" <<
  },
```

Don't forget to install dev dependencies:

* camel-case
* pascal-case
* xml2js

## So what?

This script is able to find all of svg inside specified folder and subfolders and create React components. You can edit templates to satisfy your needs for component's structure.

* npm run generate-icons
* ???
* ...components generated
* Profit!
