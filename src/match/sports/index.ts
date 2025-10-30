import { soccer } from './soccer';
import { basketball } from './basketball';
import { volleyball } from './volleyball';
import { cycling } from './cycling';
import { athletics } from './athletics';

export const SPORTS = {
    soccer,
    basketball,
    volleyball,
    cycling,
    athletics,
};

export type SportType = keyof typeof SPORTS;
