import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { Moment } from 'moment';
export declare class MomentUtcDateAdapter extends MomentDateAdapter {
    constructor(dateLocale: string);
    createDate(year: number, month: number, date: number): Moment;
}
