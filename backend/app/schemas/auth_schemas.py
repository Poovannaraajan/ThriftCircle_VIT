from marshmallow import Schema, fields, validate, ValidationError
import re

def validate_indian_phone(value):
    if not re.match(r"^[6-9]\d{9}$", value):
        raise ValidationError("Enter a valid 10-digit Indian mobile number")

class PhoneSchema(Schema):
    phone_number = fields.String(required=True, validate=validate_indian_phone)
