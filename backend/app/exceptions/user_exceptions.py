class UserAlreadyExistsException(Exception):
    """Raised when attempting to create a user with an existing email."""
    pass


class UserNotFoundException(Exception):
    """Raised when a requested user cannot be found."""
    pass    
class InvalidPasswordException(Exception):
    """Raised when the current password is incorrect."""
    pass