/* tslint:disable */
/* eslint-disable */
/**
 * DOCUMENTATION
 * No description provided (generated by Openapi Generator https://github.com/openapitools/openapi-generator)
 *
 * The version of the OpenAPI document: 1.0.0
 * Contact: mateja176@gmail.com
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */

import { exists, mapValues } from '../runtime';
import {
    UsersPermissionsUser,
    UsersPermissionsUserFromJSON,
    UsersPermissionsUserFromJSONTyped,
    UsersPermissionsUserToJSON,
} from './';

/**
 * 
 * @export
 * @interface AuthResponse
 */
export interface AuthResponse {
    /**
     * 
     * @type {string}
     * @memberof AuthResponse
     */
    jwt: string;
    /**
     * 
     * @type {UsersPermissionsUser}
     * @memberof AuthResponse
     */
    user: UsersPermissionsUser;
}

export function AuthResponseFromJSON(json: any): AuthResponse {
    return AuthResponseFromJSONTyped(json, false);
}

export function AuthResponseFromJSONTyped(json: any, ignoreDiscriminator: boolean): AuthResponse {
    if ((json === undefined) || (json === null)) {
        return json;
    }
    return {
        
        'jwt': json['jwt'],
        'user': UsersPermissionsUserFromJSON(json['user']),
    };
}

export function AuthResponseToJSON(value?: AuthResponse | null): any {
    if (value === undefined) {
        return undefined;
    }
    if (value === null) {
        return null;
    }
    return {
        
        'jwt': value.jwt,
        'user': UsersPermissionsUserToJSON(value.user),
    };
}


