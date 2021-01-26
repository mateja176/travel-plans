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
/**
 * 
 * @export
 * @interface NewTrip
 */
export interface NewTrip {
    /**
     * 
     * @type {string}
     * @memberof NewTrip
     */
    destination: string;
    /**
     * 
     * @type {Date}
     * @memberof NewTrip
     */
    startDate: Date;
    /**
     * 
     * @type {Date}
     * @memberof NewTrip
     */
    endDate: Date;
    /**
     * 
     * @type {string}
     * @memberof NewTrip
     */
    comment?: string;
    /**
     * 
     * @type {string}
     * @memberof NewTrip
     */
    user?: string;
    /**
     * 
     * @type {Date}
     * @memberof NewTrip
     */
    publishedAt?: Date;
    /**
     * 
     * @type {string}
     * @memberof NewTrip
     */
    createdBy?: string;
    /**
     * 
     * @type {string}
     * @memberof NewTrip
     */
    updatedBy?: string;
}

export function NewTripFromJSON(json: any): NewTrip {
    return NewTripFromJSONTyped(json, false);
}

export function NewTripFromJSONTyped(json: any, ignoreDiscriminator: boolean): NewTrip {
    if ((json === undefined) || (json === null)) {
        return json;
    }
    return {
        
        'destination': json['destination'],
        'startDate': (new Date(json['startDate'])),
        'endDate': (new Date(json['endDate'])),
        'comment': !exists(json, 'comment') ? undefined : json['comment'],
        'user': !exists(json, 'user') ? undefined : json['user'],
        'publishedAt': !exists(json, 'published_at') ? undefined : (new Date(json['published_at'])),
        'createdBy': !exists(json, 'created_by') ? undefined : json['created_by'],
        'updatedBy': !exists(json, 'updated_by') ? undefined : json['updated_by'],
    };
}

export function NewTripToJSON(value?: NewTrip | null): any {
    if (value === undefined) {
        return undefined;
    }
    if (value === null) {
        return null;
    }
    return {
        
        'destination': value.destination,
        'startDate': (value.startDate.toISOString()),
        'endDate': (value.endDate.toISOString()),
        'comment': value.comment,
        'user': value.user,
        'published_at': value.publishedAt === undefined ? undefined : (value.publishedAt.toISOString()),
        'created_by': value.createdBy,
        'updated_by': value.updatedBy,
    };
}

