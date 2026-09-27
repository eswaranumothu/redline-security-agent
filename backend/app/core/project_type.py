from enum import Enum


class ProjectType(str, Enum):
    WEB = "WEB"
    MOBILE = "MOBILE"
    API = "API"
    NETWORK = "NETWORK"
    CLOUD = "CLOUD"
    DESKTOP = "DESKTOP"