import { Settings } from '.';
import { Describe } from './joiDescribeTypes';

/**
 * Get the interface name from the Joi
 * @returns a string if it can find one
 */
export function getInterfaceOrTypeName(settings: Settings, details: Describe): string | undefined {
  if (settings.useLabelAsInterfaceName) {
    return details?.flags?.label?.replace(/\s/g, '');
  } else {
    if (details?.metas && details.metas.length > 0) {
      const classNames = details.metas.filter(meta => meta.className);
      if (classNames.length !== 0){
        // If Joi.concat() has been used then there may be multiple
        // get the last one as that should be the correct one
        const className = classNames[classNames.length - 1].className;
        return className?.replace(/\s/g, '');
      }
    }
    return undefined;
  }
}

/**
 * Note: this is updating by reference
 */
export function ensureInterfaceorTypeName(settings: Settings, details: Describe, interfaceOrTypeName: string): void {
  if (settings.useLabelAsInterfaceName) {
    // Set the label from the exportedName if missing
    if (!details.flags) {
      details.flags = { label: interfaceOrTypeName };
    } else if (!details.flags.label) {
      // Unable to build any test cases for this line but will keep it if joi.describe() changes
      /* istanbul ignore next */
      details.flags.label = interfaceOrTypeName;
    }
  } else {
    // Set the meta[].className from the exportedName if missing
    if (!details.metas || details.metas.length === 0) {
      details.metas = [{ className: interfaceOrTypeName }];
    } else {
      const className = details.metas.find(meta => meta.className)?.className;

      if (!className) {
        details.metas.push({ className: interfaceOrTypeName });
      }
    }
  }
}
