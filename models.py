from pydantic import BaseModel


class Historial(BaseModel):
    userWord : str
    isValidate : bool

