import pascalCase from 'pascal-case';

export function componentInner(fileName, viewBox, children) {
  return `import React, { memo } from 'react';

  import { IconInner } from 'components/iconInner/IconInner';
  
  const ${pascalCase(fileName)}Inner = (props) => (
    <IconInner viewBox="${viewBox}" a11yTitle="${pascalCase(fileName)}" {...props}>
      ${children.join('')}
    </IconInner>
  );
  
  export const ${pascalCase(fileName)} = memo(${pascalCase(fileName)}Inner);
  `;
}

export function nodeWithChildren(node, attributes, children) {
  return `<${node['#name']}${
    attributes
      ? ` ${attributes.join(' ')}`
      : ''}
      >
        ${children.join('')}
      </${node['#name']}>
    `;
}

export function nodeWithoutChildren(node, attributes) {
  return `<${node['#name']}${
    attributes
      ? ` ${attributes.join(' ')}`
      : ''} 
      />
    `;
}
