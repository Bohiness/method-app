export const getGender = (gender: string) => {
    switch (gender) {
        case 'M':
            return 'Male';
        case 'F':
            return 'Female';
        case 'U':
            return 'Unknown';
        default:
            return 'Unknown';
    }
};
