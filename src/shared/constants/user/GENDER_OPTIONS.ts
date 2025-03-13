import { Gender } from '@shared/types/user/UserType';

export const GENDER_OPTIONS: { label: string; value: Gender }[] = [
    { label: 'Male', value: 'M' },
    { label: 'Female', value: 'F' },
    { label: 'Prefer not to say', value: 'U' },
];
