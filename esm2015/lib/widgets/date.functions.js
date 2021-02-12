export const REGEX_PARSE = /^(\d{4})-?(\d{1,2})-?(\d{0,2})[^0-9]*(\d{1,2})?:?(\d{1,2})?:?(\d{1,2})?.?(\d{1,3})?$/;
export function parseDate(date) {
    if (!date) {
        return null;
    }
    const d = date.match(REGEX_PARSE);
    if (d) {
        return new Date(Number(d[1]), Number(d[2]) - 1, Number(d[3]) || 1, Number(d[4]) || 0, Number(d[5]) || 0, Number(d[6]) || 0, Number(d[7]) || 0);
    }
    return null;
}
export function getOrdinal(day) {
    if (day > 3 && day < 21) {
        return 'th';
    }
    switch (day % 10) {
        case 1: return 'st';
        case 2: return 'nd';
        case 3: return 'rd';
        default: return 'th';
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGF0ZS5mdW5jdGlvbnMuanMiLCJzb3VyY2VSb290IjoiL2hvbWUvZG5pbW9uL0RvY3VtZW50cy9naXQvY29udmVwYXkvYWpzZi9wcm9qZWN0cy9hanNmLW1hdGVyaWFsL3NyYy8iLCJzb3VyY2VzIjpbImxpYi93aWRnZXRzL2RhdGUuZnVuY3Rpb25zLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE1BQU0sQ0FBQyxNQUFNLFdBQVcsR0FBRyxzRkFBc0YsQ0FBQztBQUVsSCxNQUFNLFVBQVUsU0FBUyxDQUFDLElBQVk7SUFDcEMsSUFBSSxDQUFDLElBQUksRUFBRTtRQUFFLE9BQU8sSUFBSSxDQUFDO0tBQUU7SUFFM0IsTUFBTSxDQUFDLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxXQUFXLENBQUMsQ0FBQztJQUNsQyxJQUFJLENBQUMsRUFBRTtRQUNMLE9BQU8sSUFBSSxJQUFJLENBQ2IsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNaLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEVBQ2hCLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEVBQ2pCLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEVBQ2pCLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEVBQ2pCLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEVBQ2pCLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQ2xCLENBQUM7S0FDSDtJQUNELE9BQU8sSUFBSSxDQUFDO0FBQ2QsQ0FBQztBQUVELE1BQU0sVUFBVSxVQUFVLENBQUMsR0FBVztJQUNwQyxJQUFJLEdBQUcsR0FBRyxDQUFDLElBQUksR0FBRyxHQUFHLEVBQUUsRUFBRTtRQUFFLE9BQU8sSUFBSSxDQUFDO0tBQUU7SUFDekMsUUFBUSxHQUFHLEdBQUcsRUFBRSxFQUFFO1FBQ2hCLEtBQUssQ0FBQyxDQUFDLENBQUMsT0FBTyxJQUFJLENBQUM7UUFDcEIsS0FBSyxDQUFDLENBQUMsQ0FBQyxPQUFPLElBQUksQ0FBQztRQUNwQixLQUFLLENBQUMsQ0FBQyxDQUFDLE9BQU8sSUFBSSxDQUFDO1FBQ3BCLE9BQU8sQ0FBQyxDQUFDLE9BQU8sSUFBSSxDQUFDO0tBQ3RCO0FBQ0gsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImV4cG9ydCBjb25zdCBSRUdFWF9QQVJTRSA9IC9eKFxcZHs0fSktPyhcXGR7MSwyfSktPyhcXGR7MCwyfSlbXjAtOV0qKFxcZHsxLDJ9KT86PyhcXGR7MSwyfSk/Oj8oXFxkezEsMn0pPy4/KFxcZHsxLDN9KT8kLztcblxuZXhwb3J0IGZ1bmN0aW9uIHBhcnNlRGF0ZShkYXRlOiBzdHJpbmcpOiBEYXRlIHtcbiAgaWYgKCFkYXRlKSB7IHJldHVybiBudWxsOyB9XG5cbiAgY29uc3QgZCA9IGRhdGUubWF0Y2goUkVHRVhfUEFSU0UpO1xuICBpZiAoZCkge1xuICAgIHJldHVybiBuZXcgRGF0ZShcbiAgICAgIE51bWJlcihkWzFdKSxcbiAgICAgIE51bWJlcihkWzJdKSAtIDEsXG4gICAgICBOdW1iZXIoZFszXSkgfHwgMSxcbiAgICAgIE51bWJlcihkWzRdKSB8fCAwLFxuICAgICAgTnVtYmVyKGRbNV0pIHx8IDAsXG4gICAgICBOdW1iZXIoZFs2XSkgfHwgMCxcbiAgICAgIE51bWJlcihkWzddKSB8fCAwXG4gICAgKTtcbiAgfVxuICByZXR1cm4gbnVsbDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGdldE9yZGluYWwoZGF5OiBudW1iZXIpOiBzdHJpbmcge1xuICBpZiAoZGF5ID4gMyAmJiBkYXkgPCAyMSkgeyByZXR1cm4gJ3RoJzsgfVxuICBzd2l0Y2ggKGRheSAlIDEwKSB7XG4gICAgY2FzZSAxOiByZXR1cm4gJ3N0JztcbiAgICBjYXNlIDI6IHJldHVybiAnbmQnO1xuICAgIGNhc2UgMzogcmV0dXJuICdyZCc7XG4gICAgZGVmYXVsdDogcmV0dXJuICd0aCc7XG4gIH1cbn0iXX0=