const nameValidator = async (name, min = 3, max = 25) => {
    const nameError = [];
    if (name.length < min) {
        nameError.push('Name is too short');
    }
    if (name.length > max) {
        nameError.push('Name is too long');
    }
    return nameError;
}

module.exports = nameValidator;