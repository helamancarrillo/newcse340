exports.throwError = (req, res, next) => {
    const error = new Error("ERROR: There's probably something missing!")
    error.status = 500
    throw error
}
