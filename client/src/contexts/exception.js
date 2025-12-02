class UnauthorizedError extends Error {
  constructor(message = 'Неправильный пароль') {
    super(message);
    this.name = 'UnauthorizedError';
    this.status = 401;
  }
}

class TokenRefreshError extends Error {
  constructor(message = 'Token refresh failed') {
    super(message);
    this.name = 'TokenRefreshError';
    this.status = 401;
  }
}

class ValidationError extends Error {
  constructor(message = 'Validation error') {
    super(message);
    this.name = 'ValidationError';
    this.status = 400;
  }
}

class NotFoundError extends Error {
  constructor(message = 'Пользователь не найден') {
    super(message);
    this.name = 'NotFoundError';
    this.status = 404;
  }
}
export {  
  UnauthorizedError, 
  TokenRefreshError, 
  ValidationError, 
  NotFoundError 
};