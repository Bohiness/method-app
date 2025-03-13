export function fetchUserProfile() {
    return fetch('https://jsonplaceholder.typicode.com/users/1').then((res) =>
        res.json()
    );
}