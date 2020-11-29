import fs from 'fs';
import camelCase from 'camel-case';
import pascalCase from 'pascal-case';
import path from 'path';
import xml2js from 'xml2js';
import { nodeWithChildren, nodeWithoutChildren, componentInner } from './templates';

const { resolve } = require('path');
const { readdir } = require('fs').promises;

const inputSVGFolder = path.resolve('src/icons/');

const excludeAttributes = /^id$/;
const checkTagName = /^(title|defs|desc)$/;
const checkForSvg = /\.svg$/;

// возвращает аттрибуты svg файла, параметром принимает в себя
// объект созданный при помощи xml2js, где node.$ - аттрибуты svg, node.$$ - тело svg
function getNodeAttributes(node) {
  const svgAttr = node.$;
  // удаляем любые id из аттрибутов и форматируем в camelCase
  return svgAttr
    ? Object.keys(svgAttr)
      .filter((key) => (!excludeAttributes.test(key)))
      .map((attrKey) => `${camelCase(attrKey)}='${svgAttr[attrKey]}'`) : undefined;
}

// чистит svg от всего ненужного
function parseNode(node) {
  const nodeBody = node.$$;
  if (node && !checkTagName.test(node['#name'])) {
    const attributes = getNodeAttributes(node);
    const children = [];

    (nodeBody || []).forEach((child) => (children.push(parseNode(child))));
    return nodeBody ? (
      nodeWithChildren(node, attributes, children)
    ) : (
      nodeWithoutChildren(node, attributes)
    );
  }
  return undefined;
}

// возвращает компонент
function buildIcon(fileName, svgBody, viewBox) {
  const children = [];
  svgBody.forEach((child) => {
    const node = parseNode(child);
    if (node) {
      children.push(node);
    }
  });
  return componentInner(fileName, viewBox, children);
}

// нормализует svg и делает готовый компонент
function createReactIcon(fileName, content) {
  return new Promise((res) => {
    const parser = new xml2js.Parser({
      normalize: true,
      normalizeTags: true,
      explicitArray: true,
      explicitChildren: true,
      preserveChildrenOrder: true,
    });
    parser.addListener('end', (result) => {
      const svgBody = result.svg.$$;
      const svgAttr = result.svg.$;
      res(buildIcon(fileName, svgBody, svgAttr.viewBox));
    });
    parser.parseString(content);
  });
}

// рекурсивно проходится по папке и всем подпапкам,
// возращает плоский масссив со всеми путями к файлам svg
async function getFiles(dir) {
  const dirents = await readdir(dir, { withFileTypes: true });
  const files = await Promise.all(dirents.map((dirent) => {
    const res = resolve(dir, dirent.name);
    return dirent.isDirectory() ? getFiles(res) : res;
  }));
  return files.flat();
}

getFiles(inputSVGFolder)
  .then((icons) => {
    icons.forEach((iconPath) => {
      if (checkForSvg.test(iconPath)) {
        const componentName = pascalCase(path.basename(iconPath, '.svg'));
        const filePath = path.dirname(iconPath);
        const content = fs.readFileSync(iconPath, 'utf8');

        createReactIcon(componentName, content).then((reactIcon) => {
          const destinationFile = path.resolve(`${filePath}`, `${componentName}.jsx`);
          fs.writeFileSync(destinationFile, reactIcon);
        });
      }
    });
  })
  .catch((err) => {
    throw new Error(err);
  });
