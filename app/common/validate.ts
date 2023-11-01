import { MAX_NAME_LENGTH, MAX_SCOPE_LENGTH } from '@/app/common/env';

/**
 * Returns true if the string is a valid name. False otherwise
 */
export function validateName(name : any) {
    if(typeof(name) !== "string") return false;
    return name.length > 0 && name.length < MAX_NAME_LENGTH && /^[\w ]+$/g.test(name);
}


/**
 * Returns true if the string is a valid scope name. False otherwise
 */
export function validateScope(scope : any) {
    if(typeof(scope) !== "string") return false;
    return scope.length > 0 && scope.length < MAX_SCOPE_LENGTH && /^[A-Za-z\-_0-9]+$/g.test(scope);
}