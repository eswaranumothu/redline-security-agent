from enum import Enum


class FindingStatus(str, Enum):
    OPEN = "OPEN"
    VERIFIED = "VERIFIED"
    FALSE_POSITIVE = "FALSE_POSITIVE"
    ACCEPTED_RISK = "ACCEPTED_RISK"
    RESOLVED = "RESOLVED"