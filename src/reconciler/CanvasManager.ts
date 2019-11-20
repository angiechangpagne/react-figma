import * as renderers from '../renderers';
import { APIBridgeMessage } from './messages';
import {
    isBaseNode,
    isGroupNode,
    isImplementsChildrenMixin,
    isPageNode,
    isTextNode,
    patchTextNode,
    removeGroupStubElements
} from './utils';

/**
 * Represents raw string entity that is stored inside actual TextNode
 */
export class RawTextInstance {
    value: string;
    parent: TextNode;
}

/**
 * Handles event messages in main realm and makes changes to the Figma document
 */
class CanvasManager {
    private instances: Map<number, BaseNode | RawTextInstance>;

    constructor() {
        this.instances = new Map<number, BaseNode | RawTextInstance>();
    }

    onMessage(message: APIBridgeMessage) {
        console.log('-> Main', message);

        switch (message.type) {
            case 'createInstance':
                this.renderInstance(message.options);
                break;
            case 'createTextInstance':
                this.renderTextInstance(message.options);
                break;
            case 'appendChild':
                this.appendChild(message.options);
                break;
            case 'commitUpdate':
                this.renderInstance(message.options);
                break;
            case 'commitTextUpdate':
                this.renderTextInstance(message.options);
                break;
            case 'removeChild':
                this.removeChild(message.options);
                break;
            case 'insertBefore':
                this.insertBefore(message.options);
                break;
        }
    }

    private appendChild({ parent, child }) {
        const parentNode = this.instances.get(parent);
        const childNode = this.instances.get(child);

        if (!parentNode || !childNode || !isBaseNode(parentNode)) {
            return;
        }

        if (childNode instanceof RawTextInstance) {
            if (isBaseNode(parentNode) && isTextNode(parentNode)) {
                patchTextNode(childNode, parentNode);
            }
        } else {
            (parentNode as ChildrenMixin).appendChild(childNode);
        }

        if (isGroupNode(parentNode)) {
            removeGroupStubElements(parentNode);
        }
    }

    private removeChild({ child }) {
        const childNode = this.instances.get(child) as BaseNode;

        if (!childNode || childNode.removed) {
            return;
        }

        childNode.remove();
        this.instances.delete(child);
    }

    private insertBefore({ parent, child, beforeChild }) {
        const parentNode = this.instances.get(parent);
        const childNode = this.instances.get(child);
        const beforeChildNode = this.instances.get(beforeChild) as BaseNode;

        if (!parentNode || !childNode || !childNode || !isBaseNode(parentNode)) {
            return;
        }

        if (childNode instanceof RawTextInstance) {
            if (isBaseNode(parentNode) && isTextNode(parentNode)) {
                patchTextNode(childNode, parentNode);
            }
        } else if (isImplementsChildrenMixin(parentNode)) {
            const beforeChildIndex = parentNode.children.indexOf(beforeChildNode);
            (parentNode as ChildrenMixin).insertChild(beforeChildIndex, childNode);
        }

        if (isGroupNode(parentNode)) {
            removeGroupStubElements(parentNode);
        }
    }

    private renderInstance({ tag, type, props }) {
        const instance = this.instances.get(tag) || null;

        const figmaNode = renderers[type](instance)(props);

        if (!instance) {
            figmaNode.setPluginData('reactFigmaNode', 'true');
            figmaNode.setPluginData('reactFigmaTag', String(tag));
        }

        if (isPageNode(figmaNode) && props.isCurrent) {
            figma.currentPage = figmaNode;
        }

        this.instances.set(tag, figmaNode);
    }

    private renderTextInstance({ tag, text }) {
        const instance = (this.instances.get(tag) as RawTextInstance) || new RawTextInstance();

        instance.value = text;

        if (instance.parent) {
            instance.parent.characters = text;
        }

        this.instances.set(tag, instance);
    }
}

export { CanvasManager };