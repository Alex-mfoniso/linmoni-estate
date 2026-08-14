export default class ApiError extends Error {
  constructor(status, code, message, errors = []) { super(message); this.name = "ApiError"; this.status = status; this.code = code; this.errors = errors; }
}
